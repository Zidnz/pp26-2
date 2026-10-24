#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETL del Data Warehouse del Observatorio del Cuidado (PP 26-2).

Uso (desde la raíz del repositorio):
    python DW/etl/run_etl.py                # reconstruye DW/observatorio_dw.sqlite desde cero
    python DW/etl/run_etl.py --raiz RUTA    # otra raíz de repositorio

Capas:  1 EXTRAER  (archivos -> stg_*, todo TEXT, con linaje y huella SHA-256)
        2 TRANSFORMAR (tipos, claves, alias de alcaldía, unidades, derivadas)
        3 CARGAR   (dimensiones con clave sustituta -> hechos; lo que no entra va a etl_rechazo)
        4 VERIFICAR (pruebas DQ; si falla una de severidad 'error' el proceso termina con código 1)
        5 PUBLICAR (vistas de data marts + CSV por mart en DW/marts/)

Reglas del proyecto que este ETL hace cumplir:
  - Nada se inventa: lo desconocido queda como miembro «desconocido» o como ausencia, nunca como 0.
  - Trazabilidad: cada hecho guarda archivo_origen y fila_origen.
  - Alcance: ninguna cifra puede estar en un nivel geográfico más fino que el que su fuente permite.
  - Tendencias: v_cobertura_temporal dice si una fuente tiene >= 2 periodos.
  - Sin datos personales: se prueba que ningún staging tenga columnas de identificación personal.
El ETL NO recalcula estimaciones de encuesta: la varianza (linealización con estratos y UPM) vive en
los notebooks; aquí solo se integran, se tipifican y se validan sus resultados.
"""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, re, sqlite3, struct, sys, unicodedata, zipfile
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import config_mapeo as C            # noqa: E402

VERSION_ETL = "1.0.0"
DW_DIR = HERE.parent
ESTADOS_PRECISION = {"alta", "moderada", "baja", "no estimable"}


# ----------------------------------------------------------------------------- utilidades
def norm(s) -> str:
    """Mayúsculas, sin acentos ni puntuación, espacios colapsados (clave de comparación de nombres)."""
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9 ]", " ", s).upper()
    return re.sub(r"\s+", " ", s).strip()

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()

def num(s: pd.Series) -> pd.Series:
    return pd.to_numeric(s.replace("", np.nan), errors="coerce")

def txt(s: pd.Series) -> pd.Series:
    return s.fillna("").astype(str).str.strip()

def booleano(s: pd.Series) -> pd.Series:
    m = {"True": 1, "False": 0, "true": 1, "false": 0, "1": 1, "0": 0}
    return s.map(m).astype("Float64")

def clase_precision(cv, texto) -> str:
    t = (texto or "").strip() if isinstance(texto, str) else ""
    if t in ESTADOS_PRECISION:
        return t
    return "no aplica"

def ahora() -> str:
    return dt.datetime.now().isoformat(timespec="seconds")


class Ctx:
    """Contexto de una corrida: conexión, raíz, run_id, rechazos y resultados DQ."""
    def __init__(self, con, raiz: Path, run_id: int):
        self.con, self.raiz, self.run_id = con, raiz, run_id
        self.rechazos: list[tuple] = []
        self.dq: list[tuple] = []

    def rechazar(self, archivo, fila, destino, motivo, valor=None):
        self.rechazos.append((self.run_id, archivo, None if fila is None else int(fila), destino, motivo,
                              None if valor is None else str(valor)))

    def prueba(self, codigo, severidad, descripcion, paso: bool, detalle: str = ""):
        self.dq.append((self.run_id, codigo, severidad, descripcion, int(bool(paso)), detalle))
        marca = "OK " if paso else {"error": "FALLA", "advertencia": "AVISO", "info": "info"}[severidad]
        print(f"  [{marca:5}] {codigo} {descripcion}" + (f" — {detalle}" if detalle and not paso else ""))

    def stg(self, nombre: str) -> pd.DataFrame:
        df = pd.read_sql(f"SELECT * FROM stg_{nombre}", self.con)
        return df.mask(df == "", np.nan)


# ----------------------------------------------------------------------------- 1. EXTRAER
def leer_dbf(path: Path) -> pd.DataFrame:
    """Lector mínimo de .dbf (Marco Geoestadístico). Solo campos de texto, suficiente para claves y nombres."""
    b = path.read_bytes()
    nrec = struct.unpack("<I", b[4:8])[0]
    hl, rl = struct.unpack("<HH", b[8:12])
    campos, p = [], 32
    while b[p] != 0x0D:
        campos.append((b[p:p + 11].split(b"\0")[0].decode(), b[p + 16])); p += 32
    cpg = path.with_suffix(".cpg")
    enc = cpg.read_text().strip() if cpg.exists() else "latin1"
    try:
        "x".encode(enc)
    except LookupError:
        enc = "latin1"
    filas = []
    for k in range(nrec):
        reg = b[hl + k * rl: hl + (k + 1) * rl][1:]
        o, fila = 0, {}
        for nombre, ln in campos:
            fila[nombre] = reg[o:o + ln].decode(enc, errors="replace").strip(); o += ln
        filas.append(fila)
    return pd.DataFrame(filas)

def extraer(cx: Ctx):
    print("1. EXTRAER")
    for nombre, rel in C.ARCHIVOS.items():
        p = cx.raiz / rel
        if not p.exists():
            raise FileNotFoundError(f"Falta el archivo de entrada {rel}. El ETL se detiene en vez de cargar con huecos.")
        df = pd.read_csv(p, dtype=str, keep_default_na=False, encoding="utf-8-sig")
        df.columns = ["col0" if (not c.strip() or c.startswith("Unnamed:")) else c for c in df.columns]
        df.insert(0, "_fila", range(1, len(df) + 1))
        df["_run_id"] = str(cx.run_id)
        df.to_sql(f"stg_{nombre}", cx.con, index=False, if_exists="replace")
        cx.con.execute("INSERT INTO etl_archivo VALUES (?,?,?,?,?,?)", (cx.run_id, nombre, rel, sha256(p), len(df), None))
    # Censo 2020: se extrae solo la fila «total del municipio» (empuje de predicado: el archivo pesa 44 MB y trae manzanas)
    zp = cx.raiz / C.CENSO_ZIP
    if not zp.exists():
        raise FileNotFoundError(f"Falta {C.CENSO_ZIP}")
    with zipfile.ZipFile(zp) as z:
        cen = pd.read_csv(z.open(C.CENSO_CSV), dtype=str, keep_default_na=False, encoding="utf-8-sig",
                          usecols=["ENTIDAD", "MUN", "NOM_MUN", "LOC", "AGEB", "MZA", "POBTOT", "P_60YMAS"])
    n_total = len(cen)
    cen = cen[(cen.MZA == "000") & (cen.AGEB == "0000") & (cen.LOC == "0000") & (cen.MUN != "000")].reset_index(drop=True)
    cen.insert(0, "_fila", range(1, len(cen) + 1)); cen["_run_id"] = str(cx.run_id)
    cen.to_sql("stg_censo_mun", cx.con, index=False, if_exists="replace")
    cx.con.execute("INSERT INTO etl_archivo VALUES (?,?,?,?,?,?)",
                   (cx.run_id, "censo_mun", C.CENSO_ZIP, sha256(zp), len(cen),
                    f"filtrado a filas total-del-municipio; {n_total} filas leídas del CSV interno"))
    # Marco Geoestadístico 2025 (catálogo oficial de alcaldías)
    dp = cx.raiz / C.MARCO_GEO_DBF
    mg = leer_dbf(dp)
    mg.insert(0, "_fila", range(1, len(mg) + 1)); mg["_run_id"] = str(cx.run_id)
    mg.to_sql("stg_marco_geo", cx.con, index=False, if_exists="replace")
    cx.con.execute("INSERT INTO etl_archivo VALUES (?,?,?,?,?,?)", (cx.run_id, "marco_geo", C.MARCO_GEO_DBF, sha256(dp), len(mg), None))
    cx.con.commit()
    print(f"   {len(C.ARCHIVOS) + 2} orígenes leídos a staging")


# ----------------------------------------------------------------------------- 2/3. DIMENSIONES
def cargar_dimensiones_base(cx: Ctx) -> dict:
    """Carga dim_tiempo, dim_fuente y dim_geografia. Devuelve diccionarios de búsqueda (clave natural -> sk)."""
    con = cx.con
    # --- tiempo
    for et, anio, mes in [("2020", 2020, None), ("2022", 2022, None), ("mayo 2026", 2026, 5)]:
        con.execute("INSERT INTO dim_tiempo(etiqueta,anio,mes,es_desconocido) VALUES (?,?,?,0)", (et, anio, mes))
    # --- fuente (inventario + fuentes que el inventario no cubre)
    inv = cx.stg("ref_inventario").set_index("id")
    filas = []
    for fid, (orden, origen) in C.FUENTES_INVENTARIO.items():
        if fid not in inv.index:
            raise KeyError(f"{fid} no está en inventario_fuentes_cuidado.csv")
        r = inv.loc[fid]
        filas.append((fid, r["fuente"], r["emisor"], origen, r["desagregacion_geografica_maxima"], orden,
                      r["periodo_cubierto"], r["estado_evidencia"], r["permite_afirmar"], r["prohibe_afirmar"]))
    for fid, d in C.FUENTES_PROYECTO.items():
        filas.append((fid, d["nombre"], "desconocido", "archivo del proyecto (productor desconocido)", d["nivel_txt"], 3,
                      d["periodo"], "ver 02_fichas_fuentes.csv", None, None))
    for fid, d in C.FUENTES_EXTRA.items():
        filas.append((fid, d["nombre"], d["emisor"], d["origen"], d["nivel_txt"], d["orden"], d["periodo"], "ver bitácora (notebook 09)", None, None))
    d = C.FUENTE_INTERNA
    filas.append((d["fuente_id"], d["nombre"], d["emisor"], "interna (supuesto del equipo)", d["nivel_txt"], 1, "2026", "supuesto declarado", None, None))
    con.executemany("""INSERT INTO dim_fuente(fuente_id,nombre,emisor,origen_tipo,nivel_geo_max,nivel_geo_max_orden,
                       periodo_cubierto,estado_evidencia,permite_afirmar,prohibe_afirmar) VALUES (?,?,?,?,?,?,?,?,?,?)""", filas)
    # --- geografía: Nacional > Entidad (32) > Alcaldía (16)
    con.execute("INSERT INTO dim_geografia(nivel,nivel_orden,cve_geo,nombre,abreviatura,padre_sk) VALUES ('Nacional',1,'00','México (nacional)','NAL',NULL)")
    nac = con.execute("SELECT geografia_sk FROM dim_geografia WHERE cve_geo='00'").fetchone()[0]
    ent = cx.stg("terr_enigh_ent")[["clave_entidad", "entidad_federativa"]].drop_duplicates()
    for _, r in ent.iterrows():
        k = int(r.clave_entidad)
        if k == 0:
            continue
        con.execute("INSERT INTO dim_geografia(nivel,nivel_orden,cve_geo,nombre,padre_sk) VALUES ('Entidad',2,?,?,?)", (f"{k:02d}", r.entidad_federativa, nac))
    cdmx = con.execute("SELECT geografia_sk FROM dim_geografia WHERE cve_geo='09'").fetchone()[0]
    inv_abrev = {v: k for k, v in C.ABREV_ALCALDIA.items()}
    mg = cx.stg("marco_geo")
    for _, r in mg.sort_values("CVE_MUN").iterrows():
        con.execute("INSERT INTO dim_geografia(nivel,nivel_orden,cve_geo,nombre,abreviatura,padre_sk) VALUES ('Alcaldía',3,?,?,?,?)",
                    (f"{r.CVE_ENT}{r.CVE_MUN}", r.NOMGEO, inv_abrev.get(r.CVE_MUN), cdmx))
    # --- alias de geografía (clave natural -> sk)
    geo = pd.read_sql("SELECT geografia_sk, nivel, cve_geo, nombre, abreviatura FROM dim_geografia WHERE geografia_sk>0", con)
    alias = {}
    for _, g in geo.iterrows():
        alias[("cve", g.cve_geo)] = g.geografia_sk
        if g.nivel == "Alcaldía":
            alias[("nombre", norm(g.nombre))] = g.geografia_sk
            alias[("abrev", g.abreviatura)] = g.geografia_sk
            alias[("cve5", g.cve_geo[2:])] = g.geografia_sk
        elif g.nivel == "Entidad":
            alias[("ent", int(g.cve_geo))] = g.geografia_sk
    alias[("ent", 0)] = nac
    con.commit()
    mapa = {
        "periodo": dict(con.execute("SELECT etiqueta, periodo_sk FROM dim_tiempo").fetchall()),
        "fuente": dict(con.execute("SELECT fuente_id, fuente_sk FROM dim_fuente").fetchall()),
        "precision": dict(con.execute("SELECT clase, precision_sk FROM dim_precision").fetchall()),
        "geo_alias": alias, "nacional": nac, "cdmx": cdmx,
    }
    return mapa

def resolver_alcaldia(mapa, valor, tipo):
    """tipo: 'nombre' | 'abrev' | 'clave' (p. ej. 9009 -> 09009)."""
    a = mapa["geo_alias"]
    if tipo == "nombre":
        return a.get(("nombre", norm(valor)))
    if tipo == "abrev":
        return a.get(("abrev", str(valor).strip()))
    if tipo == "clave":
        v = str(valor).strip()
        v = v.zfill(5) if v.isdigit() else v
        return a.get(("cve", v))
    return None


# ----------------------------------------------------------------------------- 2/3. ENCUESTA (ENASIC 2022)
COLS_EST = ["fila_origen", "archivo_origen", "bloque", "indicador", "razon", "dano", "variable", "categoria", "clave_corta", "tema",
            "unidad", "tipo_estimacion", "seg_dimension", "seg_segmento", "estimacion", "se", "cv", "li90", "ls90",
            "n_muestra_dominio", "n_muestra_si", "total_expandido", "precision_txt", "dif_pp", "dif_li90", "dif_ls90", "dif_significativa"]

def _base_est(d: pd.DataFrame, archivo: str) -> pd.DataFrame:
    """Esqueleto común: columnas numéricas tipadas y campos descriptivos vacíos."""
    o = pd.DataFrame(index=d.index)
    o["fila_origen"] = d["_fila"].astype(int)
    o["archivo_origen"] = archivo
    for c in ["bloque", "indicador", "razon", "dano", "variable", "categoria", "clave_corta", "tema"]:
        o[c] = ""
    o["unidad"], o["tipo_estimacion"] = "%", "proporcion"
    o["seg_dimension"], o["seg_segmento"] = "Total", "Total"
    for c, src in [("estimacion", "pct"), ("se", "se"), ("cv", "cv"), ("li90", "li90"), ("ls90", "ls90"),
                   ("n_muestra_dominio", "n_muestra_dominio"), ("n_muestra_si", "n_muestra_si"), ("total_expandido", "total_expandido")]:
        o[c] = num(d[src]) if src in d else np.nan
    o["precision_txt"] = d["precision"] if "precision" in d else np.nan
    for c in ["dif_pp", "dif_li90", "dif_ls90"]:
        o[c] = num(d[c]) if c in d else np.nan
    o["dif_significativa"] = booleano(d["dif_significativa"]) if "dif_significativa" in d else pd.NA
    return o

def transformar_encuesta(cx: Ctx) -> pd.DataFrame:
    partes = []
    # 03 — barreras y uso de servicios
    d = cx.stg("enasic_03"); o = _base_est(d, "03_enasic_barreras_estimaciones.csv")
    o["bloque"], o["indicador"], o["tema"] = txt(d.bloque), txt(d.indicador), txt(d.bloque)
    partes.append(o)
    # 04 — contratación por quintil de ingreso
    d = cx.stg("enasic_04"); o = _base_est(d, "04_contratacion_por_quintil.csv")
    o["bloque"], o["tema"] = "contratacion_por_quintil", "contratacion"
    o["indicador"] = "Contrata " + txt(d.servicio)
    o["seg_dimension"], o["seg_segmento"] = "Quintil de ingreso (hogares con necesidad)", "Q" + txt(d.quintil)
    partes.append(o)
    # 07 — necesidad vs norma familiar
    d = cx.stg("enasic_07"); o = _base_est(d, "07_enasic_necesidad_vs_norma_estimaciones.csv")
    for c in ["bloque", "indicador", "razon", "dano", "variable", "categoria"]:
        o[c] = txt(d[c])
    o["tema"] = o["bloque"]
    seg = txt(d.segmento)
    o["seg_dimension"] = np.where(seg == "", "Total", "Segmento (script 07)")
    o["seg_segmento"] = np.where(seg == "", "Total", seg)
    partes.append(o)
    # 12 — segmentación
    d = cx.stg("enasic_12"); o = _base_est(d, "12_segmentacion_estimaciones.csv")
    o["bloque"], o["indicador"], o["clave_corta"], o["tema"] = txt(d.grupo), txt(d.indicador), txt(d.clave), txt(d.grupo)
    o["seg_dimension"], o["seg_segmento"] = txt(d.dimension), txt(d.segmento)
    partes.append(o)
    # 12b — series completas por segmento (pct NO siempre es porcentaje: ver unidad)
    d = cx.stg("enasic_12b"); o = _base_est(d, "12b_segmentacion_series.csv")
    o["bloque"] = txt(d.serie); o["categoria"] = txt(d.categoria); o["tema"] = txt(d.serie)
    et = txt(d.etiqueta)
    o["indicador"] = np.where(et != "", et, txt(d.categoria))
    o["seg_dimension"], o["seg_segmento"] = txt(d.dimension), txt(d.segmento)
    es_dif = txt(d.serie) == "dif"
    es_hrs_tot = (txt(d.serie) == "kpi") & (txt(d.categoria) == "horas_total")
    es_hrs_med = (txt(d.serie) == "kpi") & (txt(d.categoria) == "horas_media")
    o.loc[es_dif, ["unidad", "tipo_estimacion"]] = ["pp", "diferencia"]
    o.loc[es_hrs_tot, ["unidad", "tipo_estimacion"]] = ["horas/semana", "total"]
    o.loc[es_hrs_med, ["unidad", "tipo_estimacion"]] = ["horas/semana", "promedio"]
    # en las series «dif» la columna pct trae la diferencia en pp y li90/ls90 su intervalo
    o.loc[es_dif, "dif_pp"], o.loc[es_dif, "dif_li90"], o.loc[es_dif, "dif_ls90"] = o.loc[es_dif, "estimacion"], o.loc[es_dif, "li90"], o.loc[es_dif, "ls90"]
    o.loc[es_dif, ["estimacion", "li90", "ls90"]] = np.nan
    partes.append(o)
    # 16 — perfil del grupo del problema: dominio = población (Universo / Grupo del problema); evento = pertenecer al segmento
    d = cx.stg("enasic_16"); o = _base_est(d, "16_perfil_grupo_problema.csv")
    o["bloque"], o["tema"] = "perfil", "perfil"
    o["indicador"], o["variable"], o["categoria"] = "Pertenece al segmento", txt(d.dimension), txt(d.segmento)
    o["seg_dimension"], o["seg_segmento"] = "Población", txt(d.poblacion)
    partes.append(o)
    return pd.concat([p.astype(object) for p in partes], ignore_index=True)[COLS_EST]

def cargar_encuesta(cx: Ctx, mapa: dict, est: pd.DataFrame):
    con = cx.con
    ind_cols = ["archivo_origen", "bloque", "indicador", "razon", "dano", "variable", "categoria"]
    extra = ["clave_corta", "tema", "unidad", "tipo_estimacion"]
    ind = est[ind_cols + extra].drop_duplicates(ind_cols)
    con.executemany("INSERT INTO dim_indicador(" + ",".join(ind_cols + extra) + ") VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    ind.itertuples(index=False, name=None))
    seg = est[["seg_dimension", "seg_segmento"]].drop_duplicates()
    con.executemany("INSERT INTO dim_segmento(dimension,segmento,es_total) VALUES (?,?,?)",
                    [(a, b, int(a == "Total")) for a, b in seg.itertuples(index=False, name=None)])
    imap = {tuple(r[1:]): r[0] for r in con.execute("SELECT indicador_sk," + ",".join(ind_cols) + " FROM dim_indicador")}
    smap = {(a, b): k for k, a, b in con.execute("SELECT segmento_sk,dimension,segmento FROM dim_segmento")}
    f = lambda v: None if pd.isna(v) else float(v)
    n = lambda v: None if pd.isna(v) else int(v)
    filas, vistos = [], set()
    for r in est.itertuples(index=False):
        ik = imap[(r.archivo_origen, r.bloque, r.indicador, r.razon, r.dano, r.variable, r.categoria)]
        sk = smap[(r.seg_dimension, r.seg_segmento)]
        if (ik, sk) in vistos:
            cx.rechazar(r.archivo_origen, r.fila_origen, "fact_estimacion_encuesta", "duplicado de grano", f"indicador_sk={ik}, segmento_sk={sk}")
            continue
        vistos.add((ik, sk))
        pk = mapa["precision"][clase_precision(r.cv, r.precision_txt)]
        filas.append((ik, sk, mapa["nacional"], mapa["periodo"]["2022"], mapa["fuente"]["F04"], pk,
                      f(r.estimacion), f(r.se), f(r.cv), f(r.li90), f(r.ls90), n(r.n_muestra_dominio), n(r.n_muestra_si), f(r.total_expandido),
                      f(r.dif_pp), f(r.dif_li90), f(r.dif_ls90), n(r.dif_significativa), r.archivo_origen, int(r.fila_origen), cx.run_id))
    con.executemany("""INSERT INTO fact_estimacion_encuesta(indicador_sk,segmento_sk,geografia_sk,periodo_sk,fuente_sk,precision_sk,
                       estimacion,se,cv,li90,ls90,n_muestra_dominio,n_muestra_si,total_expandido,dif_pp,dif_li90,dif_ls90,dif_significativa,
                       archivo_origen,fila_origen,run_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", filas)
    return len(filas)


# ----------------------------------------------------------------------------- 2/3. TERRITORIO
GEO_COL = {   # archivo stg -> (columna con el identificador, tipo de identificador)
    "terr_oferta_nucleo": ("municipio", "nombre"), "terr_indice_tipo": ("municipio", "nombre"),
    "terr_capacidad": ("col0", "abrev"), "terr_dependencia": ("alcaldia", "abrev"),
    "terr_pobreza65": ("clave_municipio", "clave"), "terr_rezago": ("clave_alcaldia", "clave"),
    "terr_tipologia": ("alcaldia", "nombre"),
}
ARCHIVO_ORIGEN = {k: Path(v).name for k, v in C.ARCHIVOS.items()}

def cargar_territorio(cx: Ctx, mapa: dict) -> int:
    con = cx.con
    # --- catálogo de medidas
    for (stg, col, cod, nom, uni, adit, fid, per, cal, tema, defin, ver) in C.MEDIDAS:
        con.execute("INSERT OR IGNORE INTO dim_medida(codigo,nombre,tema,unidad,aditiva,nivel_geo,definicion,definicion_verificada) VALUES (?,?,?,?,?,?,?,?)",
                    (cod, nom, tema, uni, adit, "Alcaldía", defin, ver))
    for (cod, nom, uni, adit, cal, tema, defin, ver) in C.MEDIDAS_CENSO:
        con.execute("INSERT INTO dim_medida(codigo,nombre,tema,unidad,aditiva,nivel_geo,definicion,definicion_verificada) VALUES (?,?,?,?,?,?,?,?)",
                    (cod, nom, tema, uni, adit, "Alcaldía", defin, ver))
    enigh = cx.stg("terr_enigh_ent")
    for _, r in enigh[["indicador", "definicion"]].drop_duplicates("indicador").iterrows():
        con.execute("INSERT INTO dim_medida(codigo,nombre,tema,unidad,aditiva,nivel_geo,definicion,definicion_verificada) VALUES (?,?,?,?,?,?,?,?)",
                    (C.ENIGH_PREFIJO + r.indicador, r.definicion, "demanda", "%", 0, "Entidad",
                     "Archivo 17_enigh_60mas_por_entidad.csv (ENIGH 2022, base CONEVAL). " + str(r.definicion), 1))
    mmap = dict(con.execute("SELECT codigo, medida_sk FROM dim_medida").fetchall())
    filas, vistos = [], set()
    def push(geo_sk, cod, per, fid, valor, texto, cv, li, ls, nm, prec, cal, nota, arch, fila):
        k = (geo_sk, mmap[cod], mapa["periodo"][per], mapa["fuente"][fid])
        if k in vistos:
            cx.rechazar(arch, fila, "fact_indicador_territorial", "duplicado de grano", k); return
        vistos.add(k)
        filas.append((geo_sk, mmap[cod], mapa["periodo"][per], mapa["fuente"][fid], mapa["precision"][prec],
                      valor, texto, cv, li, ls, nm, cal, nota, arch, int(fila), cx.run_id))
    # --- medidas por alcaldía desde los CSV de resultados
    por_archivo: dict[str, list] = {}
    for m in C.MEDIDAS:
        por_archivo.setdefault(m[0], []).append(m)
    for stg, medidas in por_archivo.items():
        d = cx.stg(stg); gcol, gtipo = GEO_COL[stg]
        for _, r in d.iterrows():
            geo = resolver_alcaldia(mapa, r[gcol], gtipo)
            fila = int(r["_fila"]); arch = ARCHIVO_ORIGEN[stg]
            if geo is None:
                cx.rechazar(arch, fila, "fact_indicador_territorial", "alcaldía no resuelta", r[gcol]); continue
            for (_, col, cod, nom, uni, adit, fid, per, cal, tema, defin, ver) in medidas:
                v = r.get(col)
                if v is None or (isinstance(v, float) and np.isnan(v)):
                    continue                      # ausente = desconocido: no se inserta fila (ni 0)
                nota = None
                if stg == "terr_pobreza65":
                    nota = f"precisión según archivo: {r.get('precision_pct_pobreza_2020')}"
                if cod == "conapo_grado_marginacion_2020":
                    push(geo, cod, per, fid, None, str(v), None, None, None, None, "no aplica", cal, nota, arch, fila)
                else:
                    push(geo, cod, per, fid, float(v), None, None, None, None, None, "no aplica", cal, nota, arch, fila)
    # --- Censo 2020 (extraído del archivo oficial) + participación derivada por el ETL
    cen = cx.stg("censo_mun").copy()
    cen["pt"], cen["p60"] = num(cen.POBTOT), num(cen.P_60YMAS)
    tot60 = cen.p60.sum()
    for _, r in cen.iterrows():
        geo = resolver_alcaldia(mapa, r.ENTIDAD + r.MUN, "clave"); fila = int(r["_fila"]); arch = Path(C.CENSO_ZIP).name
        if geo is None:
            cx.rechazar(arch, fila, "fact_indicador_territorial", "alcaldía no resuelta", r.ENTIDAD + r.MUN); continue
        push(geo, "pob_total_censo2020", "2020", "F02", float(r.pt), None, None, None, None, None, "no aplica", "observado", None, arch, fila)
        push(geo, "pob_60mas_censo2020", "2020", "F02", float(r.p60), None, None, None, None, None, "no aplica", "observado", None, arch, fila)
        push(geo, "participacion_60mas_censo2020", "2020", "F02", float(r.p60 / tot60 * 100), None, None, None, None, None, "no aplica",
             "derivado (ETL)", "p60 alcaldía / Σ p60 de las 16 alcaldías", arch, fila)
    # --- ENIGH 2022 por entidad (con intervalo de confianza)
    for _, r in enigh.iterrows():
        geo = mapa["geo_alias"].get(("ent", int(r.clave_entidad))); fila = int(r["_fila"]); arch = ARCHIVO_ORIGEN["terr_enigh_ent"]
        if geo is None:
            cx.rechazar(arch, fila, "fact_indicador_territorial", "entidad no resuelta", r.clave_entidad); continue
        prec = r.precision if r.precision in ESTADOS_PRECISION else "no aplica"
        v = float(r.pct) if pd.notna(r.pct) else None
        if v is None:
            cx.rechazar(arch, fila, "fact_indicador_territorial", "valor ausente", r.indicador); continue
        g = lambda c: float(r[c]) if pd.notna(r[c]) else None
        push(geo, C.ENIGH_PREFIJO + r.indicador, "2022", "F23", v, None, g("cv"), g("li90"), g("ls90"),
             int(float(r.n_muestra)) if pd.notna(r.n_muestra) else None, prec, "observado", None, arch, fila)
    con.executemany("""INSERT INTO fact_indicador_territorial(geografia_sk,medida_sk,periodo_sk,fuente_sk,precision_sk,valor,valor_texto,cv,li90,ls90,
                       n_muestra,calidad_valor,nota,archivo_origen,fila_origen,run_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", filas)
    return len(filas)


# ----------------------------------------------------------------------------- 2/3. ASEQUIBILIDAD
def cargar_asequibilidad(cx: Ctx, mapa: dict) -> tuple[int, int]:
    con = cx.con
    a10, a14 = cx.stg("aseq_10"), cx.stg("aseq_14")
    ENASIC_ING = "Ingreso del hogar (ENASIC 2022)"
    # dimensiones
    for nom, fid in [(ENASIC_ING, "F04")] + [(n, "F23") for n in sorted(a14.ingreso.unique())]:
        con.execute("INSERT INTO dim_ingreso_ref(nombre,fuente_id) VALUES (?,?)", (nom, fid))
    sal = a10[["salario", "salario_hora_2026"]].drop_duplicates("salario")
    for _, r in sal.iterrows():
        tipo = "piso legal" if r.salario.lower().startswith("piso legal") else "referencia (no piso legal)"
        con.execute("INSERT INTO dim_salario_ref(nombre,tipo,salario_hora_2026) VALUES (?,?,?)", (r.salario, tipo, float(r.salario_hora_2026)))
    extra = set(a14.salario) - set(sal.salario)
    if extra:
        raise ValueError(f"salarios en 14 sin valor-hora en 10: {extra}")
    pk = pd.concat([a10[["paquete", "horas_semana"]], a14[["paquete", "horas_semana"]]]).drop_duplicates("paquete")
    for _, r in pk.iterrows():
        con.execute("INSERT INTO dim_paquete(nombre,horas_semana,es_control) VALUES (?,?,?)", (r.paquete, int(r.horas_semana), int(int(r.horas_semana) == 40)))
    ing = dict(con.execute("SELECT nombre, ingreso_sk FROM dim_ingreso_ref").fetchall())
    sa = dict(con.execute("SELECT nombre, salario_sk FROM dim_salario_ref").fetchall())
    pq = dict(con.execute("SELECT nombre, paquete_sk FROM dim_paquete").fetchall())
    f = lambda v: None if pd.isna(v) else float(v)
    n = lambda v: None if pd.isna(v) else int(float(v))
    aseq, costo, vistos_a, vistos_c = [], [], set(), set()
    per = mapa["periodo"]["2022"]
    # --- script 10: ENASIC, nacional, sin varianza de diseño; los tres umbrales vienen en columnas -> se despivotan
    arch10 = ARCHIVO_ORIGEN["aseq_10"]
    for _, r in a10.iterrows():
        fila = int(r["_fila"]); base = (mapa["nacional"], ing[ENASIC_ING], sa[r.salario], pq[r.paquete], per, mapa["fuente"]["F04"])
        if base not in vistos_c:
            vistos_c.add(base)
            costo.append(base + (float(r.costo_mensual_2026), f(pd.to_numeric(r.costo_mensual_2022, errors="coerce")),
                                 f(pd.to_numeric(r.costo_pct_ingreso_mediano, errors="coerce")), arch10, fila, cx.run_id))
        for u in (10, 20, 30):
            v = pd.to_numeric(r[f"pct_hogares_costo_<=_{u}pct_ingreso"], errors="coerce")
            if pd.isna(v):
                cx.rechazar(arch10, fila, "fact_asequibilidad", "valor ausente", f"umbral {u}"); continue
            aseq.append(base + (mapa["precision"]["no aplica"], u, float(v), None, None, None, n(r.n_muestra_hogares), None, None, 0,
                                r.alcance, arch10, fila, cx.run_id))
    # --- script 14: ENIGH 2022 (CDMX y nacional), con intervalo de confianza
    arch14 = ARCHIVO_ORIGEN["aseq_14"]
    for _, r in a14.iterrows():
        fila = int(r["_fila"]); geo = mapa["cdmx"] if r.dominio == "CDMX" else mapa["nacional"]
        base = (geo, ing[r.ingreso], sa[r.salario], pq[r.paquete], per, mapa["fuente"]["F23"])
        if base not in vistos_c:
            vistos_c.add(base)
            costo.append(base + (float(r.costo_mensual_2026), f(pd.to_numeric(r.costo_mensual_ago2022, errors="coerce")), None, arch14, fila, cx.run_id))
        prec = r.precision if r.precision in ESTADOS_PRECISION else "no aplica"
        aseq.append(base + (mapa["precision"][prec], int(r.umbral_pct_ingreso), float(r.pct), f(pd.to_numeric(r.cv, errors="coerce")),
                            f(pd.to_numeric(r.li90, errors="coerce")), f(pd.to_numeric(r.ls90, errors="coerce")),
                            n(r.n_muestra_dominio), n(r.n_muestra_si), f(pd.to_numeric(r.total_expandido, errors="coerce")), 1,
                            r.alcance, arch14, fila, cx.run_id))
    con.executemany("""INSERT INTO fact_costo_paquete(geografia_sk,ingreso_sk,salario_sk,paquete_sk,periodo_sk,fuente_sk,costo_mensual_2026,
                       costo_mensual_base_2022,costo_pct_ingreso_mediano,archivo_origen,fila_origen,run_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""", costo)
    con.executemany("""INSERT INTO fact_asequibilidad(geografia_sk,ingreso_sk,salario_sk,paquete_sk,periodo_sk,fuente_sk,precision_sk,umbral_pct_ingreso,
                       pct_hogares_asequible,cv,li90,ls90,n_muestra_dominio,n_muestra_si,total_expandido,tiene_varianza,alcance,
                       archivo_origen,fila_origen,run_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", aseq)
    return len(aseq), len(costo)


# ----------------------------------------------------------------------------- 4. VERIFICAR (calidad de datos)
PROHIBIDAS = re.compile(r"(curp|rfc|nombre_?(pers|completo)|telefono|tel_|correo|email|domicilio|direccion|calle|nss|imss_num)", re.I)

def verificar(cx: Ctx, mapa: dict):
    con, q = cx.con, (lambda sql, *a: con.execute(sql, a).fetchall())
    print("4. VERIFICAR")
    # DQ01 integridad referencial
    fk = q("PRAGMA foreign_key_check")
    cx.prueba("DQ01", "error", "Integridad referencial: ninguna clave foránea huérfana", not fk, f"{len(fk)} huérfanas")
    # DQ02 conteos de control: filas de staging = filas cargadas + rechazadas (por archivo de origen)
    ctrl = {"03_enasic_barreras_estimaciones.csv": "enasic_03", "04_contratacion_por_quintil.csv": "enasic_04",
            "07_enasic_necesidad_vs_norma_estimaciones.csv": "enasic_07", "12_segmentacion_estimaciones.csv": "enasic_12",
            "12b_segmentacion_series.csv": "enasic_12b", "16_perfil_grupo_problema.csv": "enasic_16"}
    malos = []
    for arch, stg in ctrl.items():
        n_stg = q(f"SELECT COUNT(*) FROM stg_{stg}")[0][0]
        n_f = q("SELECT COUNT(*) FROM fact_estimacion_encuesta WHERE archivo_origen=?", arch)[0][0]
        n_r = sum(1 for r in cx.rechazos if r[1] == arch and r[3] == "fact_estimacion_encuesta")
        if n_stg != n_f + n_r:
            malos.append(f"{arch}: staging {n_stg} ≠ cargadas {n_f} + rechazadas {n_r}")
    n10 = q("SELECT COUNT(*) FROM stg_aseq_10")[0][0]; n14 = q("SELECT COUNT(*) FROM stg_aseq_14")[0][0]
    c10 = q("SELECT COUNT(*) FROM fact_asequibilidad WHERE archivo_origen=?", ARCHIVO_ORIGEN["aseq_10"])[0][0]
    c14 = q("SELECT COUNT(*) FROM fact_asequibilidad WHERE archivo_origen=?", ARCHIVO_ORIGEN["aseq_14"])[0][0]
    if c10 != n10 * 3: malos.append(f"10: esperadas {n10 * 3} (3 umbrales por fila), cargadas {c10}")
    if c14 != n14: malos.append(f"14: staging {n14} ≠ cargadas {c14}")
    cx.prueba("DQ02", "error", "Conteos de control: filas de origen = filas cargadas + rechazadas (6 estimaciones, 2 asequibilidad)", not malos, "; ".join(malos))
    # DQ03 alcance geográfico
    v = q("SELECT * FROM v_violaciones_alcance")
    cx.prueba("DQ03", "error", "Alcance: ningún hecho está en un nivel geográfico más fino que el que permite su fuente", not v, f"{len(v)} violaciones: {v[:3]}")
    # DQ04 sin datos personales
    cols = [(t, c[1]) for (t,) in q("SELECT name FROM sqlite_master WHERE name LIKE 'stg_%'") for c in q(f"PRAGMA table_info({t})")]
    pers = [x for x in cols if PROHIBIDAS.search(x[1])]
    cx.prueba("DQ04", "error", "Protección de datos: ninguna columna de staging parece identificar a una persona", not pers, str(pers))
    # DQ05 rangos de la estimación puntual (error) y de su intervalo (advertencia)
    bad = q("""SELECT COUNT(*) FROM fact_estimacion_encuesta f JOIN dim_indicador i USING(indicador_sk)
               WHERE i.unidad='%' AND (f.estimacion<0 OR f.estimacion>100)""")[0][0]
    r2 = q("SELECT COUNT(*) FROM fact_asequibilidad WHERE pct_hogares_asequible<0 OR pct_hogares_asequible>100")[0][0]
    cx.prueba("DQ05", "error", "Rango: toda proporción estimada está entre 0 y 100", bad == 0 and r2 == 0, f"encuesta {bad}, asequibilidad {r2}")
    fuera = q("""SELECT f.archivo_origen, COUNT(*), MIN(f.li90), MAX(f.ls90) FROM fact_estimacion_encuesta f JOIN dim_indicador i USING(indicador_sk)
                 WHERE i.unidad='%' AND (f.li90<0 OR f.ls90>100) GROUP BY f.archivo_origen""")
    fuera2 = q("SELECT COUNT(*), MIN(li90), MAX(ls90) FROM fact_asequibilidad WHERE li90<0 OR ls90>100")[0]
    n_fuera = sum(x[1] for x in fuera) + fuera2[0]
    cx.prueba("DQ05b", "advertencia", "Intervalos de confianza dentro de [0,100] (los de Wald pueden salirse; el DW no los recorta)", n_fuera == 0,
              f"{n_fuera} intervalos fuera de rango: " + "; ".join(f"{x[0]}: {x[1]} (mín li90 {x[2]}, máx ls90 {x[3]})" for x in fuera)
              + (f"; asequibilidad: {fuera2[0]}" if fuera2[0] else ""))
    # DQ06 intervalos
    r = q("""SELECT COUNT(*) FROM fact_estimacion_encuesta WHERE estimacion IS NOT NULL AND li90 IS NOT NULL AND ls90 IS NOT NULL
             AND (li90 > estimacion + 0.06 OR ls90 < estimacion - 0.06)""")[0][0]
    r2 = q("""SELECT COUNT(*) FROM fact_asequibilidad WHERE li90 IS NOT NULL AND (li90 > pct_hogares_asequible + 0.06 OR ls90 < pct_hogares_asequible - 0.06)""")[0][0]
    cx.prueba("DQ06", "advertencia", "Intervalos: li90 ≤ estimación ≤ ls90 (tolerancia 0.06 por redondeo)", r == 0 and r2 == 0, f"encuesta {r}, asequibilidad {r2}")
    # DQ07 precisión vs CV
    def esperado(cv): return "no estimable" if pd.isna(cv) else ("alta" if cv < 15 else "moderada" if cv < 30 else "baja")
    df = pd.read_sql("""SELECT f.cv, p.clase FROM fact_estimacion_encuesta f JOIN dim_precision p USING(precision_sk)
                        UNION ALL SELECT a.cv, p.clase FROM fact_asequibilidad a JOIN dim_precision p USING(precision_sk) WHERE a.tiene_varianza=1""", con)
    con_cv = df[df.cv.notna()]
    # tolerancia ±0.05 en el CV: el archivo trae CV redondeado a 1-2 decimales (14.96 se publica como 15.0)
    mal = con_cv[con_cv.apply(lambda s: s.clase not in (esperado(s.cv - 0.05), esperado(s.cv), esperado(s.cv + 0.05)), axis=1)]
    cx.prueba("DQ07", "advertencia", "Precisión: la clase publicada coincide con la regla del INEGI aplicada al CV", mal.empty,
              f"{len(mal)} filas: {mal.head(3).to_dict('records')}")
    # DQ08 totales de control
    tot = pd.read_sql("""SELECT m.codigo, SUM(f.valor) s FROM fact_indicador_territorial f JOIN dim_medida m USING(medida_sk)
                         WHERE m.codigo IN ('oferta_nucleo_estab','oferta_nucleo_pct_cdmx','poblacion_60mas_participacion_p01',
                                            'dependencia_severa_pct_cdmx','participacion_60mas_censo2020','pob_total_censo2020') GROUP BY m.codigo""", con).set_index("codigo").s
    ok = (tot["oferta_nucleo_estab"] == 235 and abs(tot["oferta_nucleo_pct_cdmx"] - 100) < 0.01
          and abs(tot["poblacion_60mas_participacion_p01"] - 100) < 0.01 and abs(tot["participacion_60mas_censo2020"] - 100) < 1e-6)
    cx.prueba("DQ08", "error", "Totales de control: núcleo = 235 (bitácora 20 sept); participaciones suman 100",
              ok, str({k: round(v, 3) for k, v in tot.items()}))
    cx.prueba("DQ08b", "advertencia", "Total de control: población CDMX del Censo 2020 = 9,209,944",
              abs(tot["pob_total_censo2020"] - 9209944) < 1, f"suma {tot['pob_total_censo2020']:.0f}")
    # DQ09 alias de abreviaturas validados con evidencia independiente
    pl = pd.read_sql("""SELECT g.nombre, f.valor FROM fact_indicador_territorial f JOIN dim_geografia g USING(geografia_sk)
                        JOIN dim_medida m USING(medida_sk) WHERE m.codigo='plazas_residencias_privadas'""", con)
    oa = cx.stg("terr_oferta_alc"); oa["sk"] = oa.alcaldia_norm.map(lambda s: mapa["geo_alias"].get(("nombre", norm(s))))
    nombre_por_sk = dict(con.execute("SELECT geografia_sk, nombre FROM dim_geografia").fetchall())
    oa["nombre"] = oa.sk.map(nombre_por_sk); oa["cap"] = num(oa.capacidad_residencias_privadas)
    cmp_ = pl.merge(oa[["nombre", "cap"]], on="nombre", how="left")
    dif = cmp_[(cmp_.cap.isna()) | (cmp_.valor != cmp_.cap)]
    cx.prueba("DQ09", "error", "Alias de alcaldía: plazas (por abreviatura) = capacidad (por nombre, otro archivo) en las 12 alcaldías con dato",
              dif.empty and len(pl) == 12, f"{len(pl)} alcaldías; discrepancias: {dif.to_dict('records')[:3]}")
    # DQ10 ceros sin respaldo
    cero = oa[(oa.cap == 0) & (~oa.nombre.isin(pl.nombre))].nombre.tolist()
    cx.prueba("DQ10", "advertencia", "Desconocido ≠ 0: oferta_por_alcaldia.csv trae capacidad 0 donde la fuente no tiene dato (no se cargó)",
              not cero, f"se omitieron los 0 de: {', '.join(cero)}")
    # DQ11 pct_pob60 (archivo P01) vs Censo 2020
    cmp2 = pd.read_sql("""SELECT g.nombre, MAX(CASE WHEN m.codigo='poblacion_60mas_participacion_p01' THEN f.valor END) p01,
                                 MAX(CASE WHEN m.codigo='participacion_60mas_censo2020' THEN f.valor END) cen
                          FROM fact_indicador_territorial f JOIN dim_geografia g USING(geografia_sk) JOIN dim_medida m USING(medida_sk)
                          WHERE m.codigo IN ('poblacion_60mas_participacion_p01','participacion_60mas_censo2020') GROUP BY g.nombre""", con)
    cmp2["d"] = (cmp2.p01 - cmp2.cen).abs(); mx = cmp2.loc[cmp2.d.idxmax()]
    rho = cmp2.p01.rank().corr(cmp2.cen.rank())
    cx.prueba("DQ11", "advertencia", "Contraste: participación en 60+ del archivo P01 (año desconocido) vs Censo 2020",
              cmp2.d.max() < 1.0, f"diferencia máxima {mx.d:.2f} pp en {mx.nombre}; Spearman {rho:.3f}; media {cmp2.d.mean():.2f} pp")
    # DQ12 tendencias
    tend = pd.read_sql("SELECT * FROM v_cobertura_temporal", con)
    cx.prueba("DQ12", "info", "Tendencias: fuentes con >= 2 periodos distintos (solo ellas admiten series)", True,
              f"{int(tend.permite_tendencia.sum())} de {len(tend)} combinaciones fuente×hecho; ENASIC: {tend[tend.fuente_id=='F04'].permite_tendencia.max()}")
    # DQ13 coherencia entre scripts 10 y 14 (la columna enasic_nacional_script10 cita la cifra del 10)
    a14 = cx.stg("aseq_14"); a10 = cx.stg("aseq_10"); rows = []
    for u in (10, 20, 30):
        m = a14[(a14.umbral_pct_ingreso.astype(float) == u)][["salario", "paquete", "enasic_nacional_script10"]].drop_duplicates()
        m = m.merge(a10[["salario", "paquete", f"pct_hogares_costo_<=_{u}pct_ingreso"]], on=["salario", "paquete"], how="left")
        m["d"] = (num(m["enasic_nacional_script10"]) - num(m[f"pct_hogares_costo_<=_{u}pct_ingreso"])).abs(); rows.append(m)
    m = pd.concat(rows); cx.prueba("DQ13", "advertencia", "Consistencia 10 vs 14: la cifra ENASIC que cita el script 14 coincide con la del script 10",
                                   (m.d.fillna(0) < 0.051).all(), f"diferencia máxima {m.d.max():.3f}")
    # DQ14 índices recomputables
    o = cx.stg("terr_oferta_nucleo"); i = cx.stg("terr_indice_tipo")
    e1 = (num(o.pct_establecimientos) / num(o.pct_pob60) - num(o.indice_oferta_vs_60)).abs().max()
    ti = i.merge(o[["municipio", "pct_pob60"]], on="municipio", suffixes=("", "_o"))
    tot_a, tot_c = num(ti.asilos).sum(), num(ti.centros_dia).sum()
    e2 = ((num(ti.asilos) / tot_a * 100) / num(ti.pct_pob60) - num(ti.indice_asilos)).abs().max()
    e3 = ((num(ti.centros_dia) / tot_c * 100) / num(ti.pct_pob60) - num(ti.indice_centros_dia)).abs().max()
    cx.prueba("DQ14", "advertencia", "Índices recomputables: oferta/60+ y los índices por tipo se reproducen desde sus componentes",
              max(e1, e2, e3) < 0.002, f"error máximo {max(e1, e2, e3):.5f}")
    # DQ15 cobertura geográfica
    cob = pd.read_sql("SELECT medida_codigo, COUNT(*) n FROM v_cobertura_geografica GROUP BY medida_codigo", con)
    cx.prueba("DQ15", "info", "Cobertura: medidas por alcaldía con alcaldías SIN dato (quedan como desconocido)", True,
              "; ".join(f"{r.medida_codigo}: faltan {r.n}" for r in cob.itertuples()) or "ninguna")
    # DQ16 pivote de perfil de alcaldía: una sola fecha por medida
    multi = q("""SELECT m.codigo FROM fact_indicador_territorial f JOIN dim_medida m USING(medida_sk) WHERE m.nivel_geo='Alcaldía'
                 GROUP BY m.codigo, f.geografia_sk HAVING COUNT(*)>1""")
    cx.prueba("DQ16", "error", "Una medida por alcaldía tiene un solo periodo/fuente (requisito del mart ancho)", not multi, str(multi[:3]))
    # DQ17 definiciones sin verificar
    nv = q("SELECT COUNT(*) FROM dim_medida WHERE definicion_verificada=0")[0][0]; nt = q("SELECT COUNT(*) FROM dim_medida")[0][0]
    cx.prueba("DQ17", "info", "Definiciones de medidas sin verificar contra el notebook (pendiente de la doble revisión)", True, f"{nv} de {nt}")
    # DQ18 reconciliación contra las cifras que muestra el Observatorio
    jp = cx.raiz / C.JSON_OBSERVATORIO
    if jp.exists():
        j = json.loads(jp.read_text(encoding="utf-8")); tot_, hit = 0, 0; faltan = []
        for k, v in (j.get("clave") or {}).items():
            if isinstance(v, dict) and "pct" in v and "fuente" in v and v.get("total_expandido") is not None:
                tot_ += 1
                r = q("""SELECT COUNT(*) FROM fact_estimacion_encuesta WHERE archivo_origen=? AND ABS(estimacion-?)<0.06 AND ABS(total_expandido-?)<1""",
                      Path(v["fuente"]).name, v["pct"], v["total_expandido"])[0][0]
                if r: hit += 1
                else: faltan.append(k)
        cx.prueba("DQ18", "advertencia", "Reconciliación: cada cifra clave del Observatorio existe en el DW con el mismo valor y total expandido",
                  tot_ > 0 and hit == tot_, f"{hit}/{tot_}; sin correspondencia: {faltan}")
    else:
        cx.prueba("DQ18", "info", "Reconciliación con el Observatorio omitida (no existe datos_observatorio.json)", True)
    con.executemany("INSERT INTO etl_dq VALUES (?,?,?,?,?,?)", cx.dq)
    con.executemany("INSERT INTO etl_rechazo VALUES (?,?,?,?,?,?)", cx.rechazos)
    con.commit()
    return [d for d in cx.dq if d[2] == "error" and not d[4]]


# ----------------------------------------------------------------------------- 5. PUBLICAR (marts)
MARTS = ["v_mart_necesidad_cuidado", "v_mart_territorio", "v_mart_perfil_alcaldia", "v_mart_asequibilidad",
         "v_cobertura_temporal", "v_cobertura_geografica", "v_diccionario_medidas", "v_calidad_precision"]

def vista_perfil_alcaldia(con):
    """Mart ancho: una fila por alcaldía, una columna por medida (se genera desde dim_medida)."""
    med = con.execute("SELECT codigo, unidad FROM dim_medida WHERE nivel_geo='Alcaldía' ORDER BY medida_sk").fetchall()
    cols = ",\n  ".join(
        f"MAX(CASE WHEN m.codigo='{c}' THEN f.{'valor_texto' if u == 'categoría' else 'valor'} END) AS {c}" for c, u in med)
    con.execute("DROP VIEW IF EXISTS v_mart_perfil_alcaldia")
    con.execute(f"""CREATE VIEW v_mart_perfil_alcaldia AS
SELECT g.cve_geo, g.nombre AS alcaldia, g.abreviatura,
  {cols}
FROM dim_geografia g
LEFT JOIN fact_indicador_territorial f ON f.geografia_sk = g.geografia_sk
LEFT JOIN dim_medida m ON m.medida_sk = f.medida_sk
WHERE g.nivel = 'Alcaldía'
GROUP BY g.geografia_sk""")

def exportar(con) -> dict:
    out = {}
    (DW_DIR / "marts").mkdir(exist_ok=True)
    for v in MARTS:
        df = pd.read_sql(f"SELECT * FROM {v}", con)
        df.to_csv(DW_DIR / "marts" / f"{v.removeprefix('v_')}.csv", index=False, encoding="utf-8-sig")
        out[v] = len(df)
    return out

def diccionario_columnas(con):
    filas = []
    for nombre, tipo in con.execute("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'stg_%' AND name NOT LIKE 'sqlite_%' ORDER BY type DESC, name"):
        for c in con.execute(f"PRAGMA table_info({nombre})"):
            filas.append((nombre, tipo, c[1], c[2], "sí" if c[5] else "", "no" if c[3] else "sí"))
    pd.DataFrame(filas, columns=["objeto", "tipo_objeto", "columna", "tipo_dato", "clave_primaria", "admite_nulos"]).to_csv(
        DW_DIR / "docs" / "diccionario_columnas_dw.csv", index=False, encoding="utf-8-sig")


# ----------------------------------------------------------------------------- orquestador
def main():
    import shutil, tempfile
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raiz", help="raíz del repositorio (por defecto, dos niveles arriba de este archivo)")
    args = ap.parse_args()
    raiz = Path(args.raiz).resolve() if args.raiz else HERE.parents[1]
    (DW_DIR / "logs").mkdir(exist_ok=True); (DW_DIR / "docs").mkdir(exist_ok=True)
    hist = DW_DIR / "logs" / "etl_runs.jsonl"
    run_id = (sum(1 for _ in open(hist, encoding="utf-8")) + 1) if hist.exists() else 1
    # Se construye en una carpeta temporal y se copia al final: SQLite no se lleva bien con algunos sistemas de archivos montados.
    tmp = Path(tempfile.mkdtemp(prefix="dw_obs_")); db_tmp = tmp / "observatorio_dw.sqlite"
    con = sqlite3.connect(db_tmp); con.execute("PRAGMA foreign_keys=ON")
    con.executescript((DW_DIR / "sql" / "01_schema_dw.sql").read_text(encoding="utf-8"))
    inicio = ahora()
    con.execute("INSERT INTO etl_run VALUES (?,?,NULL,'en curso',?,?)", (run_id, inicio, VERSION_ETL, str(raiz)))
    cx = Ctx(con, raiz, run_id)
    print(f"ETL Observatorio · run {run_id} · raíz {raiz}")
    estado, resumen = "fallido", {}
    try:
        extraer(cx)
        print("2/3. TRANSFORMAR Y CARGAR")
        mapa = cargar_dimensiones_base(cx)
        est = transformar_encuesta(cx)
        resumen["fact_estimacion_encuesta"] = cargar_encuesta(cx, mapa, est)
        resumen["fact_indicador_territorial"] = cargar_territorio(cx, mapa)
        resumen["fact_asequibilidad"], resumen["fact_costo_paquete"] = cargar_asequibilidad(cx, mapa)
        con.commit()
        for k, v in resumen.items():
            print(f"   {k}: {v} filas")
        con.executescript((DW_DIR / "sql" / "02_vistas_marts.sql").read_text(encoding="utf-8"))
        vista_perfil_alcaldia(con)
        errores = verificar(cx, mapa)
        advert = [d for d in cx.dq if d[2] == "advertencia" and not d[4]]
        if errores:
            estado = "fallido"
        else:
            print("5. PUBLICAR")
            resumen["marts"] = exportar(con)
            diccionario_columnas(con)
            for k, v in resumen["marts"].items():
                print(f"   {k}: {v} filas -> DW/marts/{k.removeprefix('v_')}.csv")
            estado = "ok con advertencias" if advert else "ok"
    except Exception as e:                        # cualquier excepción deja el DW anterior intacto
        print(f"\nERROR: {type(e).__name__}: {e}")
        resumen["excepcion"] = f"{type(e).__name__}: {e}"
    fin = ahora()
    con.execute("UPDATE etl_run SET fin=?, estado=? WHERE run_id=?", (fin, estado, run_id)); con.commit(); con.close()
    pd.DataFrame(cx.dq, columns=["run_id", "codigo", "severidad", "descripcion", "paso", "detalle"]).to_csv(
        DW_DIR / "logs" / "ultimo_dq.csv", index=False, encoding="utf-8-sig")
    pd.DataFrame(cx.rechazos, columns=["run_id", "archivo", "fila", "destino", "motivo", "valor"]).to_csv(
        DW_DIR / "logs" / "ultimo_rechazo.csv", index=False, encoding="utf-8-sig")
    with open(hist, "a", encoding="utf-8") as h:
        h.write(json.dumps(dict(run_id=run_id, inicio=inicio, fin=fin, estado=estado, version_etl=VERSION_ETL, **resumen), ensure_ascii=False) + "\n")
    if estado in ("ok", "ok con advertencias"):
        shutil.copy(db_tmp, DW_DIR / "observatorio_dw.sqlite")
        print(f"\nEstado: {estado}. DW publicado en DW/observatorio_dw.sqlite")
    else:
        print("\nEstado: FALLIDO. No se reemplazó el DW publicado. Revisa DW/logs/ultimo_dq.csv")
    shutil.rmtree(tmp, ignore_errors=True)
    sys.exit(0 if estado != "fallido" else 1)


if __name__ == "__main__":
    main()
