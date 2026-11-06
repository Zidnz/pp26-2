"""Carga de datos del Observatorio (versión Streamlit).

Regla: ninguna cifra se escribe a mano. Todo se lee de archivos versionados del repositorio:
  - DW/marts/*.csv            capa de consumo del data warehouse (fuente principal). Desde el ETL 1.1.0 (29 oct 2026)
                              incluye los modelos 11 y 18 a 25 (mart_modelos, mart_ageb, mart_perfil_alcaldia).
  - DW/logs/ultimo_dq.csv     último reporte de calidad de datos del ETL
  - Analysis/resultados/*.csv solo lo que el DW no integra: scripts 04 y 05, y la geometría y los puntos del notebook D
                              (18_tipologia_contornos.geojson, 18_oferta_nucleo_puntos.csv)
  - Analysis/matrices/inventario_fuentes_cuidado.csv
  - Frontend/js/cdmx-alcaldias.js  límites de alcaldías (INEGI, Marco Geoestadístico 2020)

Si falta un archivo o una fila esperada, la app se detiene con un mensaje en lugar de mostrar un hueco.
"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pandas as pd
import streamlit as st

# La app vive en <repo>/Observatorio_streamlit; la raíz del repo es el directorio padre.
RAIZ = Path(__file__).resolve().parents[1]
MARTS = RAIZ / "DW" / "marts"
RES = RAIZ / "Analysis" / "resultados"


class DatoFaltante(Exception):
    """Falta un archivo o una fila que la página necesita."""


def _ruta(rel: str) -> Path:
    p = RAIZ / rel
    if not p.exists():
        raise DatoFaltante(f"No encontré `{rel}`. Corre el notebook o el ETL que lo genera antes de abrir el Observatorio.")
    return p


@st.cache_data(show_spinner=False)
def leer(rel: str) -> pd.DataFrame:
    """Lee un CSV del repo (ruta relativa a la raíz). utf-8-sig porque varios archivos traen BOM."""
    return pd.read_csv(_ruta(rel), encoding="utf-8-sig")


def una(df: pd.DataFrame, origen: str, **cond) -> pd.Series:
    """Devuelve exactamente una fila que cumpla las condiciones; si no, se detiene."""
    m = df
    for k, v in cond.items():
        m = m[m[k] == v]
    if len(m) != 1:
        raise DatoFaltante(f"{origen}: esperaba 1 fila para {cond} y encontré {len(m)}.")
    return m.iloc[0]


# ------------------------------------------------------------------ marts del DW
def necesidad() -> pd.DataFrame:
    return leer("DW/marts/mart_necesidad_cuidado.csv")


def asequibilidad() -> pd.DataFrame:
    return leer("DW/marts/mart_asequibilidad.csv")


def territorio() -> pd.DataFrame:
    return leer("DW/marts/mart_territorio.csv")


def perfil_alcaldia() -> pd.DataFrame:
    return leer("DW/marts/mart_perfil_alcaldia.csv")


def medidas() -> pd.DataFrame:
    return leer("DW/marts/diccionario_medidas.csv")


def est(indicador: str, **extra) -> pd.Series:
    """Una estimación del mart de necesidad por su texto exacto de indicador."""
    return una(necesidad(), "mart_necesidad_cuidado.csv", indicador=indicador, **extra)


def serie_segmento(bloque: str, dimension: str, segmento: str) -> pd.DataFrame:
    """Series del script 12b (una dimensión a la vez) para el filtro de segmento."""
    n = necesidad()
    s = n[(n.script_origen == "12b_segmentacion_series.csv") & (n.bloque == bloque)
          & (n.dominio_dimension == dimension) & (n.dominio_segmento == segmento)]
    if s.empty:
        raise DatoFaltante(f"12b_segmentacion_series: no hay filas para {bloque} / {dimension} / {segmento}.")
    return s


def segmentos_disponibles() -> dict[str, list[str]]:
    n = necesidad()
    s = n[n.script_origen == "12b_segmentacion_series.csv"]
    orden = ["Total", "Sexo", "Edad", "Ingreso", "A quién cuida", "Intensidad"]
    g = s.groupby("dominio_dimension")["dominio_segmento"].unique()
    return {d: list(g[d]) for d in orden if d in g.index}


# ------------------------------------------------------------------ geometría
@st.cache_data(show_spinner=False)
def geo_alcaldias() -> dict:
    txt = _ruta("Frontend/js/cdmx-alcaldias.js").read_text(encoding="utf-8")
    gj = json.loads(txt[txt.index("{"): txt.rindex("}") + 1])
    if len(gj["features"]) != 16:
        raise DatoFaltante(f"cdmx-alcaldias.js trae {len(gj['features'])} alcaldías; se esperaban 16.")
    return gj


# ------------------------------------------------------------------ modelos (mart_modelos, ETL 1.1.0)
def _config_modelos():
    """El mapeo del ETL (DW/etl/config_modelos.py) dice qué columna de cada archivo es cada métrica; se usa al revés."""
    ruta = _ruta("DW/etl/config_modelos.py")
    spec = importlib.util.spec_from_file_location("config_modelos_dw", ruta)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def mart_modelos() -> pd.DataFrame:
    return leer("DW/marts/mart_modelos.csv")


def catalogo_modelos() -> pd.DataFrame:
    return leer("DW/marts/catalogo_modelos.csv")


@st.cache_data(show_spinner=False)
def modelo(archivo: str) -> pd.DataFrame:
    """Reconstruye, desde mart_modelos, la tabla de un archivo de resultados con sus nombres de columna originales.

    No lee Analysis/resultados: las cifras salen del DW (que ya pasó sus pruebas de calidad). Las columnas que el ETL
    no carga a propósito no aparecen. tests/test_paginas.py comprueba que la reconstrucción coincide con el archivo."""
    M = _config_modelos()
    esp = next((e for e in M.RESULTADOS if Path(e["archivo"]).name == archivo), None)
    if esp is None:
        raise DatoFaltante(f"{archivo} no está mapeado en DW/etl/config_modelos.py: el DW no lo integra.")
    d = mart_modelos()
    d = d[d.archivo_origen == archivo]
    if d.empty:
        raise DatoFaltante(f"mart_modelos.csv no tiene filas de {archivo}. Corre el ETL (python -B DW/etl/run_etl.py).")
    inv_seg = {v: k for k, v in M.DIM_SEG.items()}
    nombres = {t[1]: t for t in esp.get("metricas", [])}
    textos = {cod: col for col, cod in esp.get("textos", [])}
    filas = {}
    for fila, g in d.groupby("fila_origen", sort=True):
        x = g.iloc[0]
        r = {}
        for campo in ("objetivo", "metodo", "variante"):
            v = esp.get(campo, "")
            if v.startswith("@"):
                r[v[1:]] = x[campo] if pd.notna(x[campo]) else None
        if pd.notna(x.parametros):
            for par in str(x.parametros).split("; "):
                k, _, v = par.partition("=")
                r[k] = v
        if esp.get("seg"):
            dim, seg = esp["seg"]
            if dim.startswith("@"):
                r[dim[1:]] = inv_seg.get(x.dominio_dimension, x.dominio_dimension)
            if seg.startswith("@"):
                r[seg[1:]] = x.dominio_segmento
        geo = esp.get("geo")
        if isinstance(geo, tuple) and geo[0].startswith("@"):
            r[geo[0][1:]] = x.geografia
        if esp.get("precision"):
            r[esp["precision"]] = x.precision
        for _, m in g.iterrows():
            if m.metrica in nombres:
                t = nombres[m.metrica]
                r[t[0]] = m.valor
                for col, val in zip(t[2:5], (m.li90, m.ls90, m.cv)):
                    if col:
                        r[col] = val
            elif m.metrica in textos:
                r[textos[m.metrica]] = m.valor_texto
        filas[int(fila)] = r
    out = pd.DataFrame.from_dict(filas, orient="index").sort_index()
    for c in out.columns:                                   # «k=2» vuelve como texto: se tipifica si es número
        conv = pd.to_numeric(out[c], errors="coerce")
        if conv.notna().sum() == out[c].notna().sum():
            out[c] = conv
    for t in esp.get("metricas", []):                       # banderas: el DW las guarda como 1/0; vuelven a True/False
        if t[0] in out and M.METRICAS[t[1]][1] == "indicador 0/1":
            out[t[0]] = out[t[0]].astype("boolean")
    return out.reset_index(drop=True)


@st.cache_data(show_spinner=False)
def ageb() -> pd.DataFrame:
    """mart_ageb (una fila por AGEB urbana) con los nombres de columna del notebook D."""
    M = _config_modelos()
    d = leer("DW/marts/mart_ageb.csv").copy()
    ren = {cod.removeprefix("ageb_"): col for (_, col, cod, *_) in M.MEDIDAS_AGEB}
    d = d.rename(columns={"cvegeo": "CVEGEO", **ren})
    d["CVEGEO"] = d.CVEGEO.astype(str).str.zfill(13)
    for c in ("frontera", "brecha_q75", "brecha_q67"):
        d[c] = d[c].astype(bool)
    return d


@st.cache_data(show_spinner=False)
def prioridad() -> pd.DataFrame:
    """Regla del script 24 por alcaldía, desde mart_perfil_alcaldia (columnas prioridad_*) con los nombres del script."""
    M = _config_modelos()
    p = perfil_alcaldia()
    ren = {cod: col for (_, col, cod, *_) in M.MEDIDAS_PRIORIDAD}
    faltan = [k for k in ren if k not in p.columns]
    if faltan:
        raise DatoFaltante(f"mart_perfil_alcaldia.csv no trae {faltan}. Corre el ETL 1.1.0.")
    d = p[["alcaldia", *ren]].rename(columns=ren)
    d["estable"] = d.estable.astype(bool)
    return d


# ------------------------------------------------------------------ resultados que el DW no integra
def res(nombre: str) -> pd.DataFrame:
    """Solo para lo que el DW no integra (scripts 04 y 05; puntos del DENUE del notebook D)."""
    return leer(f"Analysis/resultados/{nombre}")


def inventario() -> pd.DataFrame:
    return leer("Analysis/matrices/inventario_fuentes_cuidado.csv")


def dq() -> pd.DataFrame:
    return leer("DW/logs/ultimo_dq.csv")


def fecha_archivo(rel: str) -> str:
    """Fecha de modificación del archivo en disco (no es la fecha de los datos)."""
    import datetime as dt
    return dt.datetime.fromtimestamp(_ruta(rel).stat().st_mtime).strftime("%d/%m/%Y")


@st.cache_data(show_spinner=False)
def geo_ageb() -> tuple[dict, dict]:
    """Contornos del notebook D (Marco Geoestadístico 2025, simplificados a 15 m): (AGEB, alcaldías)."""
    gj = json.loads(_ruta("Analysis/resultados/18_tipologia_contornos.geojson").read_text(encoding="utf-8"))
    ageb = {"type": "FeatureCollection", "features": [f for f in gj["features"] if f["properties"]["capa"] == "ageb"]}
    alc = {"type": "FeatureCollection", "features": [f for f in gj["features"] if f["properties"]["capa"] != "ageb"]}
    return ageb, alc
