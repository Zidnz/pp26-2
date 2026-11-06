"""Reconciliación: lo que la app lee del DW (mart_modelos, mart_ageb, mart_perfil_alcaldia) es lo mismo que
escribieron los notebooks y scripts en Analysis/resultados. Si un archivo de resultados cambia y nadie corre
el ETL, esta prueba falla: el Observatorio no debe mostrar una versión vieja sin avisar.

Correr desde Observatorio_streamlit/:  python -m pytest -q tests
"""
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

import datos

M = datos._config_modelos()
RES = datos.RAIZ / "Analysis" / "resultados"


def _iguales(a: pd.Series, b: pd.Series) -> bool:
    an, bn = pd.to_numeric(a, errors="coerce"), pd.to_numeric(b, errors="coerce")
    if an.notna().sum() == a.notna().sum() and bn.notna().sum() == b.notna().sum():
        return bool(np.allclose(an.astype(float), bn.astype(float), rtol=0, atol=1e-9, equal_nan=True))
    norm = lambda s: s.map(lambda v: "" if pd.isna(v) else str(v).strip())
    return bool((norm(a) == norm(b)).all())


@pytest.mark.parametrize("esp", M.RESULTADOS, ids=lambda e: Path(e["archivo"]).name)
def test_modelo_reconstruido_igual_al_archivo(esp):
    nombre = Path(esp["archivo"]).name
    orig = pd.read_csv(RES / nombre, encoding="utf-8-sig")
    rec = datos.modelo(nombre)
    assert len(rec) == len(orig), f"{nombre}: {len(rec)} filas en el DW, {len(orig)} en el archivo"
    cols = [t[0] for t in esp.get("metricas", [])] + [c for t in esp.get("metricas", []) for c in t[2:] if c]
    cols += [c for c, _ in esp.get("textos", [])]
    geo = esp.get("geo")
    if isinstance(geo, tuple) and geo[0].startswith("@"):
        cols.append(geo[0][1:])          # el nombre de alcaldía del DW (Marco Geoestadístico) = el del archivo
    for col in cols:
        assert col in rec, f"{nombre}: falta la columna {col}"
        o = orig[col].map(lambda v: {True: 1.0, False: 0.0}.get(v, v)) if orig[col].dtype == bool else orig[col]
        r = rec[col].astype("Float64") if str(rec[col].dtype) == "boolean" else rec[col]
        assert _iguales(o, r), f"{nombre}: la columna {col} no coincide con el DW"


def test_ageb_igual_al_notebook_d():
    orig = pd.read_csv(RES / "18_tipologia_ageb.csv", encoding="utf-8-sig", dtype={"CVEGEO": str})
    orig["CVEGEO"] = orig.CVEGEO.str.zfill(13)
    rec = datos.ageb().set_index("CVEGEO").loc[orig.CVEGEO].reset_index()
    assert len(rec) == len(orig) == 2371
    for (stg, col, *_r) in M.MEDIDAS_AGEB:
        if stg == M.AGEB_STG:
            o = orig[col].map(lambda v: {True: 1.0, False: 0.0}.get(v, v)) if orig[col].dtype == bool else orig[col]
            r = rec[col].astype(float) if rec[col].dtype == bool else rec[col]
            assert _iguales(o.reset_index(drop=True), r.reset_index(drop=True)), f"18_tipologia_ageb: {col}"


def test_prioridad_igual_al_script_24():
    orig = pd.read_csv(RES / "24_prioridad_alcaldia.csv", encoding="utf-8-sig").sort_values("alcaldia").reset_index(drop=True)
    rec = datos.prioridad().sort_values("alcaldia").reset_index(drop=True)
    assert len(rec) == 16 and list(rec.alcaldia) == list(orig.alcaldia)
    for (_, col, *_r) in M.MEDIDAS_PRIORIDAD:
        o = orig[col].astype(float) if orig[col].dtype == bool else orig[col]
        r = rec[col].astype(float) if rec[col].dtype == bool else rec[col]
        assert _iguales(o, r), f"24_prioridad_alcaldia: {col}"


def test_catalogo_cumple_regla_de_alternativa_simple():
    cat = datos.catalogo_modelos()
    assert set(cat.modelo) == set(M.MODELOS)
    assert cat.alternativa_simple.str.strip().ne("").all()
    assert (cat.n_resultados > 0).all()
