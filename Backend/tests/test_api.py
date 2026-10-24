"""Pruebas de la API: reglas del proyecto convertidas en comprobaciones.

Necesitan DW/observatorio_dw.sqlite en disco (python -B DW/etl/run_etl.py). Si no está, se saltan las de /dw.
"""
from __future__ import annotations

import sqlite3

import pytest

from Backend.app import ajustes

DW = pytest.mark.skipif(not ajustes.DW_PATH.exists(), reason="Falta DW/observatorio_dw.sqlite")


# ---------------------------------------------------------------- estado
def test_salud(cliente):
    r = cliente.get("/salud")
    assert r.status_code == 200
    assert "estado_revision" in r.json()


# ---------------------------------------------------------------- DW
@DW
def test_necesidad_solo_nacional_y_con_advertencias(cliente):
    r = cliente.get("/dw/necesidad", params={"limite": 1000})
    assert r.status_code == 200
    j = r.json()
    assert j["meta"]["total"] == len(j["datos"]) or j["meta"]["total"] > 1000
    assert {d["nivel_geografico"] for d in j["datos"]} == {"Nacional"}
    assert any("alcaldía" in a for a in j["meta"]["advertencias"])
    assert all(t["permite_tendencia"] == 0 for t in j["meta"]["tendencia"])


@DW
def test_filtros_usan_parametros_no_texto(cliente):
    r = cliente.get("/dw/necesidad", params={"tema": "x' OR '1'='1"})
    assert r.status_code == 200 and r.json()["datos"] == []


@DW
def test_paginacion(cliente):
    a = cliente.get("/dw/territorio", params={"limite": 10, "desde": 0}).json()
    b = cliente.get("/dw/territorio", params={"limite": 10, "desde": 10}).json()
    assert a["meta"]["total"] == b["meta"]["total"] > 20
    assert {d["territorial_id"] for d in a["datos"]}.isdisjoint({d["territorial_id"] for d in b["datos"]})
    assert cliente.get("/dw/territorio", params={"limite": ajustes.LIMITE_MAX + 1}).status_code == 422


@DW
def test_nulos_no_se_vuelven_cero(cliente):
    """Lo que el DW tiene como NULL en el perfil de alcaldías llega como null, no como 0."""
    con = sqlite3.connect(ajustes.DW_PATH)
    nulos_dw = con.execute("SELECT COUNT(*) FROM v_mart_perfil_alcaldia WHERE plazas_residencias_privadas IS NULL").fetchone()[0]
    con.close()
    datos = cliente.get("/dw/alcaldias").json()["datos"]
    assert len(datos) == 16
    assert sum(1 for d in datos if d["plazas_residencias_privadas"] is None) == nulos_dw


@DW
def test_alcaldia_inexistente(cliente):
    assert cliente.get("/dw/alcaldias/99999").status_code == 404


@DW
def test_asequibilidad_sin_control(cliente):
    datos = cliente.get("/dw/asequibilidad", params={"incluir_control": False, "limite": 1000}).json()["datos"]
    assert datos and all(d["es_control"] == 0 for d in datos)


@DW
def test_dw_es_solo_lectura():
    from Backend.app.db import conectar
    con = conectar()
    with pytest.raises(sqlite3.OperationalError):
        con.execute("CREATE TABLE intruso (x)")
    con.close()


@DW
def test_bloqueo_si_viola_alcance(cliente, tmp_path, monkeypatch):
    """Si una cifra nacional aparece en una alcaldía, la API no publica nada (503)."""
    import shutil
    copia = tmp_path / "dw.sqlite"
    shutil.copy(ajustes.DW_PATH, copia)
    con = sqlite3.connect(copia)
    alc = con.execute("SELECT geografia_sk FROM dim_geografia WHERE nivel = 'Alcaldía' LIMIT 1").fetchone()[0]
    con.execute("UPDATE fact_estimacion_encuesta SET geografia_sk = ? WHERE estimacion_id = "
                "(SELECT MIN(estimacion_id) FROM fact_estimacion_encuesta)", [alc])
    con.commit()
    con.close()
    monkeypatch.setattr(ajustes, "DW_PATH", copia)
    r = cliente.get("/dw/necesidad")
    assert r.status_code == 503 and "v_violaciones_alcance" in r.json()["detail"]
    assert cliente.get("/salud").json()["ok"] is False


def test_dw_ausente(cliente, tmp_path, monkeypatch):
    monkeypatch.setattr(ajustes, "DW_PATH", tmp_path / "no_existe.sqlite")
    with pytest.raises(Exception):
        cliente.get("/dw/necesidad")
    assert cliente.get("/salud").json()["dw"]["disponible"] is False


# ---------------------------------------------------------------- puntaje
ENTREVISTA = {"horas": 45, "abvd": ["P6_2_01", "P6_2_02", "P6_2_04"], "clin": [], "req": True, "fuerza": True, "sexo": "M"}


def test_evaluar(cliente):
    r = cliente.post("/puntaje/evaluar", json={"modelo": ENTREVISTA, "semanas_en_cola": 3})
    assert r.status_code == 200
    assert r.headers["cache-control"] == "no-store"
    j = r.json()
    # h40 5 + abvd1 1 + abvd3 2 + req 3 + fuerza 4 + mujer 2 = 17; +1.5 por 3 semanas
    assert j["puntaje"]["base"] == 17 and j["puntaje"]["efectivo"] == 18.5 and j["puntaje"]["nivel"] == "alta"
    assert j["regla_40h"] == "dentro" and j["provisional"] is True
    assert any("40 h" in a for a in j["advertencias"])


@pytest.mark.parametrize("campo", ["curp", "nombre", "domicilio", "edad"])
def test_rechaza_identificadores(cliente, campo):
    cuerpo = {"modelo": {**ENTREVISTA, campo: "x"}}
    assert cliente.post("/puntaje/evaluar", json=cuerpo).status_code == 422
    assert cliente.post("/puntaje/evaluar", json={"modelo": ENTREVISTA, campo: "x"}).status_code == 422


def test_rechaza_codigos_invalidos(cliente):
    assert cliente.post("/puntaje/evaluar", json={"modelo": {**ENTREVISTA, "abvd": ["P6_2_99"]}}).status_code == 422
    assert cliente.post("/puntaje/evaluar", json={"modelo": {**ENTREVISTA, "abvd": ["P6_2_01", "P6_2_01"]}}).status_code == 422
    assert cliente.post("/puntaje/evaluar", json={"modelo": {**ENTREVISTA, "horas": 200}}).status_code == 422


def test_chequeo_manda_a_revision(cliente):
    barthel = {f"B{i:02d}": v for i, v in zip(range(1, 11), [10, 5, 10, 5, 10, 10, 10, 15, 15, 10])}  # 100
    j = cliente.post("/puntaje/evaluar", json={"modelo": ENTREVISTA, "barthel": barthel}).json()
    assert j["revision_humana"] is True
    assert {c["id"] for c in j["chequeos"]} >= {"horas_vs_barthel", "abvd_vs_barthel"}
    assert j["puntaje"]["base"] == 17  # el chequeo no cambia el puntaje


def test_barthel_incompleto_no_se_imputa(cliente):
    j = cliente.post("/puntaje/evaluar", json={"modelo": ENTREVISTA, "barthel": {"B01": 10}}).json()
    assert j["barthel"]["total"] is None and any("no se imputa" in a for a in j["advertencias"])


def test_reparto(cliente):
    pers = [{"id": f"c{i}", "efectivo": e} for i, e in enumerate([20, 13, 8, 4, 0])]
    j = cliente.post("/puntaje/reparto", json={"personas": pers, "presupuesto": 100}).json()
    assert sum(j["horas"].values()) <= 100 and min(j["horas"].values()) >= 13
    j = cliente.post("/puntaje/reparto", json={"personas": pers, "presupuesto": 30}).json()
    assert j["capacidad_ok"] is False and len(j["en_cola"]) == 3


def test_reparto_rechaza_folios_no_opacos(cliente):
    for malo in ["María López", "GOEO030101HDFTSMA9", "a" * 40]:
        assert cliente.post("/puntaje/reparto", json={"personas": [{"id": malo, "efectivo": 1}]}).status_code == 422
    dup = [{"id": "c1", "efectivo": 1}, {"id": "c1", "efectivo": 2}]
    assert cliente.post("/puntaje/reparto", json={"personas": dup}).status_code == 422


def test_config_desfasada_bloquea(cliente, tmp_path, monkeypatch):
    from Backend.app import config_programa
    falso = tmp_path / "config.js"
    falso.write_text("/* cambiado */", encoding="utf-8")
    monkeypatch.setattr(ajustes, "CONFIG_JS", falso)
    assert cliente.post("/puntaje/evaluar", json={"modelo": ENTREVISTA}).status_code == 503
    assert config_programa.estado()["al_dia"] is False
