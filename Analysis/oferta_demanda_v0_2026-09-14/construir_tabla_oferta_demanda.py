#!/usr/bin/env python3
"""
Construye la tabla oferta-demanda del Observatorio del Cuidado.

NO contiene datos. Requiere dos archivos que hay que descargar del INEGI:

  1. DENUE de la Ciudad de México (CSV).
     https://www.inegi.org.mx/app/descarga/?ti=6  ->  DENUE por entidad (09)
  2. Censo de Población y Vivienda 2020, resultados por AGEB y manzana urbana,
     entidad 09 (CSV), o el ITER si se trabaja solo a nivel alcaldía.
     https://www.inegi.org.mx/programas/ccpv/2020/

El script NO adivina nombres de columnas. Si una columna esperada no existe,
falla con un mensaje que dice cuál falta y cuáles hay. Eso es intencional:
los nombres reales se confirman abriendo el diccionario de datos, no aquí.

Salidas (en --salida):
  tabla_oferta_demanda_<nivel>.csv
  tabla_oferta_demanda_<nivel>_metadatos.json   <- trazabilidad de la corrida

Uso mínimo:
  python construir_tabla_oferta_demanda.py \
      --denue denue_inegi_09_.csv \
      --censo RESAGEBURB_09CSV20.csv \
      --catalogo catalogo_scian_cuidado_candidatos.csv \
      --nivel alcaldia \
      --salida ./resultados
"""

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

# Códigos que el Censo usa para valores no publicados por confidencialidad
# o no aplicables. Se tratan como faltantes y SE CUENTAN.
CODIGOS_NO_DISPONIBLES = {"*", "N/D", "N/A", "", " "}

# Bounding box aproximado de la Ciudad de México, para detectar coordenadas
# imposibles. No sustituye una validación espacial con el marco geoestadístico.
BBOX_CDMX = {"lat_min": 19.0, "lat_max": 19.65, "lon_min": -99.40, "lon_max": -98.90}


def sha256(ruta: Path) -> str:
    h = hashlib.sha256()
    with open(ruta, "rb") as f:
        for bloque in iter(lambda: f.read(1024 * 1024), b""):
            h.update(bloque)
    return h.hexdigest()


def exigir_columnas(df: pd.DataFrame, columnas, nombre_archivo: str) -> None:
    faltan = [c for c in columnas if c not in df.columns]
    if faltan:
        sys.exit(
            f"\nERROR en {nombre_archivo}: faltan columnas {faltan}.\n"
            f"Columnas disponibles: {sorted(df.columns.tolist())}\n"
            f"Revisa el diccionario de datos y pasa los nombres reales por parámetro.\n"
        )


def a_numero(serie: pd.Series):
    """Convierte a numérico tratando los códigos censales como faltantes.
    Devuelve (serie_numerica, n_celdas_suprimidas)."""
    texto = serie.astype(str).str.strip()
    suprimidas = texto.isin(CODIGOS_NO_DISPONIBLES)
    numerica = pd.to_numeric(texto.where(~suprimidas), errors="coerce")
    return numerica, int(suprimidas.sum() + numerica.isna().sum() - suprimidas.sum())


def cargar_catalogo(ruta: Path) -> pd.DataFrame:
    cat = pd.read_csv(ruta, dtype={"codigo_scian": str})
    exigir_columnas(cat, ["codigo_scian", "grupo_cuidado", "sector", "incluir_en_v1"], ruta.name)
    cat = cat[cat["incluir_en_v1"].astype(str).str.lower().isin(["si", "sí", "true", "1"])]
    if cat.empty:
        sys.exit("ERROR: ningún código SCIAN marcado con incluir_en_v1 = si.")
    return cat


def preparar_denue(args, catalogo: pd.DataFrame):
    denue = pd.read_csv(args.denue, dtype=str, low_memory=False, encoding=args.encoding_denue)
    exigir_columnas(
        denue,
        [args.col_scian, args.col_mun, args.col_lat, args.col_lon],
        Path(args.denue).name,
    )

    diag = {"registros_denue_totales": len(denue)}

    denue[args.col_scian] = denue[args.col_scian].astype(str).str.strip()
    codigos = set(catalogo["codigo_scian"])
    oferta = denue[denue[args.col_scian].isin(codigos)].copy()
    diag["registros_actividades_de_cuidado"] = len(oferta)

    if oferta.empty:
        sys.exit(
            "ERROR: cero establecimientos con los códigos SCIAN del catálogo.\n"
            "Causas posibles: el DENUE usa otra versión de SCIAN, la columna de "
            "actividad no es la indicada, o los códigos vienen con otro formato.\n"
            "Este resultado es un hallazgo, no un fallo del script: regístralo."
        )

    lat = pd.to_numeric(oferta[args.col_lat], errors="coerce")
    lon = pd.to_numeric(oferta[args.col_lon], errors="coerce")
    coord_valida = (
        lat.between(BBOX_CDMX["lat_min"], BBOX_CDMX["lat_max"])
        & lon.between(BBOX_CDMX["lon_min"], BBOX_CDMX["lon_max"])
    )
    oferta["_coord_invalida"] = ~coord_valida
    diag["establecimientos_sin_coordenada_valida"] = int((~coord_valida).sum())

    oferta = oferta.merge(
        catalogo[["codigo_scian", "grupo_cuidado", "sector"]],
        left_on=args.col_scian,
        right_on="codigo_scian",
        how="left",
    )

    if args.nivel == "alcaldia":
        oferta["cve_territorio"] = "09" + oferta[args.col_mun].astype(str).str.zfill(3)
    else:
        exigir_columnas(oferta, [args.col_ageb], Path(args.denue).name)
        oferta["cve_territorio"] = (
            "09"
            + oferta[args.col_mun].astype(str).str.zfill(3)
            + oferta[args.col_ageb].astype(str).str.zfill(4)
        )
        diag["establecimientos_sin_ageb"] = int(oferta[args.col_ageb].isna().sum())

    conteos = (
        oferta.pivot_table(
            index="cve_territorio",
            columns="grupo_cuidado",
            values=args.col_scian,
            aggfunc="count",
            fill_value=0,
        )
        .add_prefix("n_estab_")
        .reset_index()
    )
    conteos["n_estab_total"] = conteos.filter(like="n_estab_").sum(axis=1)

    publicos = (
        oferta[oferta["sector"] == "publico"]
        .groupby("cve_territorio")
        .size()
        .rename("n_estab_publico")
        .reset_index()
    )
    sin_coord = (
        oferta[oferta["_coord_invalida"]]
        .groupby("cve_territorio")
        .size()
        .rename("estab_sin_coordenadas")
        .reset_index()
    )

    tabla = conteos.merge(publicos, on="cve_territorio", how="left").merge(
        sin_coord, on="cve_territorio", how="left"
    )
    tabla[["n_estab_publico", "estab_sin_coordenadas"]] = tabla[
        ["n_estab_publico", "estab_sin_coordenadas"]
    ].fillna(0).astype(int)
    return tabla, diag


def preparar_censo(args):
    censo = pd.read_csv(args.censo, dtype=str, low_memory=False, encoding=args.encoding_censo)
    cols_demanda = [c.strip() for c in args.cols_demanda.split(",") if c.strip()]
    exigir_columnas(
        censo, [args.col_ent_censo, args.col_mun_censo, args.col_pobtot] + cols_demanda,
        Path(args.censo).name,
    )

    censo = censo[censo[args.col_ent_censo].astype(str).str.zfill(2) == "09"].copy()
    diag = {"registros_censo_cdmx": len(censo)}

    if args.nivel == "alcaldia":
        censo["cve_territorio"] = "09" + censo[args.col_mun_censo].astype(str).str.zfill(3)
    else:
        exigir_columnas(censo, [args.col_ageb_censo], Path(args.censo).name)
        censo["cve_territorio"] = (
            "09"
            + censo[args.col_mun_censo].astype(str).str.zfill(3)
            + censo[args.col_ageb_censo].astype(str).str.zfill(4)
        )

    suprimidas_total = 0
    for col in [args.col_pobtot] + cols_demanda:
        censo[col], n_sup = a_numero(censo[col])
        suprimidas_total += n_sup
    diag["celdas_censales_suprimidas_o_no_numericas"] = int(suprimidas_total)

    agg = {args.col_pobtot: "sum"}
    for col in cols_demanda:
        agg[col] = "sum"
    tabla = censo.groupby("cve_territorio", as_index=False).agg(agg)
    tabla = tabla.rename(columns={args.col_pobtot: "pob_total"})
    return tabla, cols_demanda, diag


def main():
    p = argparse.ArgumentParser(description="Tabla oferta-demanda del Observatorio del Cuidado")
    p.add_argument("--denue", required=True)
    p.add_argument("--censo", required=True)
    p.add_argument("--catalogo", required=True)
    p.add_argument("--nivel", choices=["alcaldia", "ageb"], default="alcaldia")
    p.add_argument("--salida", default="./resultados")
    # Nombres de columna: valores por omisión que HAY QUE VERIFICAR contra el
    # diccionario de datos antes de confiar en el resultado.
    p.add_argument("--col-scian", default="codigo_act")
    p.add_argument("--col-mun", default="cve_mun")
    p.add_argument("--col-ageb", default="ageb")
    p.add_argument("--col-lat", default="latitud")
    p.add_argument("--col-lon", default="longitud")
    p.add_argument("--col-ent-censo", default="ENTIDAD")
    p.add_argument("--col-mun-censo", default="MUN")
    p.add_argument("--col-ageb-censo", default="AGEB")
    p.add_argument("--col-pobtot", default="POBTOT")
    p.add_argument("--cols-demanda", default="P_0A2,P_3A5,P_60YMAS")
    p.add_argument("--encoding-denue", default="latin-1")
    p.add_argument("--encoding-censo", default="latin-1")
    args = p.parse_args()

    salida = Path(args.salida)
    salida.mkdir(parents=True, exist_ok=True)

    catalogo = cargar_catalogo(Path(args.catalogo))
    oferta, diag_oferta = preparar_denue(args, catalogo)
    demanda, cols_demanda, diag_demanda = preparar_censo(args)

    tabla = demanda.merge(oferta, on="cve_territorio", how="left")
    cols_oferta = [c for c in tabla.columns if c.startswith("n_estab_")] + ["estab_sin_coordenadas"]
    tabla[cols_oferta] = tabla[cols_oferta].fillna(0).astype(int)

    # Densidades. NO son cobertura: el DENUE no publica cupos ni camas.
    if "P_0A2" in cols_demanda and "P_3A5" in cols_demanda:
        tabla["pob_0a5"] = tabla["P_0A2"] + tabla["P_3A5"]
        if "n_estab_infantil" in tabla.columns:
            tabla["densidad_infantil_10k"] = (
                tabla["n_estab_infantil"] / tabla["pob_0a5"].replace(0, pd.NA) * 10000
            ).round(2)

    if "P_60YMAS" in cols_demanda:
        cols_mayores = [
            c for c in tabla.columns
            if c in ("n_estab_diurno_mayores_discapacidad", "n_estab_residencial_mayores")
        ]
        if cols_mayores:
            tabla["densidad_mayores_10k"] = (
                tabla[cols_mayores].sum(axis=1)
                / tabla["P_60YMAS"].replace(0, pd.NA)
                * 10000
            ).round(2)

    tabla["nivel"] = args.nivel
    tabla = tabla.sort_values("cve_territorio")

    nombre = f"tabla_oferta_demanda_{args.nivel}"
    ruta_csv = salida / f"{nombre}.csv"
    tabla.to_csv(ruta_csv, index=False, encoding="utf-8")

    metadatos = {
        "generado_utc": datetime.now(timezone.utc).isoformat(),
        "script": Path(__file__).name,
        "nivel_territorial": args.nivel,
        "filas_producidas": len(tabla),
        "archivo_oferta": {"ruta": str(args.denue), "sha256": sha256(Path(args.denue))},
        "archivo_demanda": {"ruta": str(args.censo), "sha256": sha256(Path(args.censo))},
        "archivo_catalogo": {"ruta": str(args.catalogo), "sha256": sha256(Path(args.catalogo))},
        "codigos_scian_usados": sorted(catalogo["codigo_scian"].tolist()),
        "columnas_demanda_usadas": cols_demanda,
        "diagnostico": {**diag_oferta, **diag_demanda},
        "advertencias": [
            "Las densidades no son cobertura: el DENUE no publica cupos, plazas ni camas.",
            "La oferta se ubica donde está el establecimiento, no donde reside quien la usa.",
            "La demanda es poblacion en edad, no necesidad de cuidado medida.",
            "Oferta y demanda tienen fechas de corte distintas.",
            "Un solo corte censal no sostiene afirmaciones de tendencia ni estacionalidad.",
        ],
    }
    ruta_meta = salida / f"{nombre}_metadatos.json"
    ruta_meta.write_text(json.dumps(metadatos, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Tabla:      {ruta_csv}  ({len(tabla)} filas)")
    print(f"Metadatos:  {ruta_meta}")
    print("\nDiagnóstico de la corrida:")
    for k, v in metadatos["diagnostico"].items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
