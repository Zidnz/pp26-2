"""Prueba de humo: cada página corre sin excepción con los archivos del repo.

Uso (desde la raíz del repo):  python -m pytest Observatorio_streamlit/tests -q
"""
from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

APP = Path(__file__).resolve().parents[1]
PAGINAS = ["inicio", "necesidad", "barreras", "costo", "focalizacion", "territorio", "indicadores", "metodo"]


@pytest.mark.parametrize("pagina", PAGINAS)
def test_pagina_corre(pagina, monkeypatch):
    monkeypatch.chdir(APP)
    monkeypatch.syspath_prepend(str(APP))
    at = AppTest.from_file(str(APP / "paginas" / f"{pagina}.py"), default_timeout=60).run()
    assert not at.exception, [e.message for e in at.exception]
    assert not at.error, [e.body for e in at.error]


def test_filtro_cambia_de_segmento(monkeypatch):
    monkeypatch.chdir(APP)
    monkeypatch.syspath_prepend(str(APP))
    at = AppTest.from_file(str(APP / "paginas" / "necesidad.py"), default_timeout=60).run()
    at.selectbox(key="seg_dim").select("Sexo").run()
    at.selectbox(key="seg_val_Sexo").select("Hombre").run()
    assert not at.exception
    assert any("Sexo: Hombre" in s.value for s in at.subheader)


def test_capas_del_mapa_ageb(monkeypatch):
    monkeypatch.chdir(APP)
    monkeypatch.syspath_prepend(str(APP))
    at = AppTest.from_file(str(APP / "paginas" / "territorio.py"), default_timeout=90).run()
    for capa in ["brecha", "pct_sin_int", "pct_60", "tipo"]:
        at.radio(key="capa_ageb").set_value(capa).run()
        assert not at.exception, capa
