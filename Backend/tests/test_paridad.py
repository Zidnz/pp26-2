"""Paridad entre Frontend/js/prioridad.js (fuente de verdad) y Backend/app/prioridad.py.

Genera casos aleatorios con semilla fija más casos de borde, los corre en Node y en Python, y exige resultados
idénticos. Se salta si no hay Node instalado (en ese caso la paridad NO está comprobada).
"""
from __future__ import annotations

import json
import random
import shutil
import subprocess

import pytest

from Backend.app import config_programa
from Backend.app import prioridad as P

from Backend.app.ajustes import RAIZ_REPO as RAIZ

NODE = shutil.which("node")
pytestmark = pytest.mark.skipif(NODE is None, reason="Node no está instalado: paridad con prioridad.js sin comprobar")

SEMILLA = 20261021
IDS_ABVD = [o["id"] for o in P.ABVD]
IDS_CLIN = [o["id"] for o in P.CLIN]


def _barthel(r: random.Random):
    tipo = r.random()
    if tipo < 0.15:
        return None
    resp = {it["id"]: r.choice([p for p, _ in it["niveles"]]) for it in P.BARTHEL}
    if tipo < 0.25:
        resp.pop(r.choice(list(resp)))          # incompleto
    elif tipo < 0.30:
        resp["B01"] = 7                          # valor fuera de la escala
    elif tipo < 0.45:
        resp = {it["id"]: it["niveles"][-1][0] for it in P.BARTHEL}  # 100: independiente
    return resp


def _zarit(r: random.Random, cfg):
    tipo = r.random()
    if tipo < 0.2:
        return None
    resp = {f"Z{i + 1:02d}": r.randint(0, 4) for i in range(cfg["zarit"]["n_reactivos"])}
    if tipo < 0.3:
        resp.pop("Z05")
    elif tipo < 0.35:
        resp["Z10"] = 5
    elif tipo < 0.55:
        resp = {k: r.choice([0, 0, 1]) for k in resp}  # sobrecarga baja
    return resp


def _casos():
    r = random.Random(SEMILLA)
    cfg = config_programa.config()
    bordes_h = [0, 0.5, 39, 39.9, 40, 40.1, 79.5, 80, 139, 140, 167.5, 168]
    evaluaciones = []
    for i in range(600):
        horas = r.choice(bordes_h) if i % 3 == 0 else round(r.uniform(0, 168), r.choice([0, 1]))
        evaluaciones.append({
            "modelo": {"horas": horas, "abvd": r.sample(IDS_ABVD, r.randint(0, 5)),
                       "clin": r.sample(IDS_CLIN, r.randint(0, 4)), "req": r.random() < 0.5,
                       "fuerza": r.random() < 0.5, "sexo": r.choice(["M", "H", None])},
            "barthel": _barthel(r), "zarit": _zarit(r, cfg), "semanas": r.choice([0, 1, 7, 8, 9, 15, 30, r.randint(0, 60)]),
        })
    repartos = []
    for i in range(80):
        n = r.choice([0, 1, 2, 5, 11, 37, 100, 120])
        pers = [{"id": f"p{j:03d}", "efectivo": r.choice([r.randint(0, 24), r.randint(0, 48) / 2])} for j in range(n)]
        m, M = cfg["horas_minimas"], cfg["horas_maximas"]
        presupuesto = r.choice([None, 0, n * m - 1, n * m, n * m + 7, n * (m + M) // 2, n * M, n * M + 50, 2000, 260])
        if presupuesto is not None:
            presupuesto = max(0, presupuesto)
        repartos.append({"personas": pers, "presupuesto": presupuesto})
    repartos.append({"personas": [{"id": "a1", "efectivo": 0}, {"id": "a2", "efectivo": 0}], "presupuesto": 100})
    semanas = [["2026-01-01", "2026-01-07"], ["2026-01-01", "2026-01-08"], ["2026-03-01", "2026-05-15"],
               ["2026-05-01", "2026-04-01"], [None, "2026-01-01"], ["2026-10-25", "2026-11-02"]]
    return {"evaluaciones": evaluaciones, "repartos": repartos, "semanas": semanas}


@pytest.fixture(scope="module")
def resultados(tmp_path_factory):
    casos = _casos()
    ruta = tmp_path_factory.mktemp("paridad") / "casos.json"
    ruta.write_text(json.dumps(casos), encoding="utf-8")
    salida = subprocess.run([NODE, str(RAIZ / "Backend" / "tests" / "paridad_js.js"), str(ruta)],
                            capture_output=True, text=True, encoding="utf-8", check=True)
    return casos, json.loads(salida.stdout)


def test_config_exportada_al_dia():
    est = config_programa.estado()
    assert est["al_dia"] is True, "Frontend/js/config.js cambió: correr node Backend/scripts/exportar_config.js"


def test_config_identica_a_config_js():
    js = subprocess.run([NODE, "-e", "process.stdout.write(JSON.stringify(require(process.argv[1])))",
                         str(RAIZ / "Frontend" / "js" / "config.js")], capture_output=True, text=True, check=True)
    assert json.loads(js.stdout) == config_programa.config()


def test_puntaje_nivel_y_chequeos(resultados):
    casos, js = resultados
    cfg = config_programa.config()
    for i, (c, esperado) in enumerate(zip(casos["evaluaciones"], js["evaluaciones"])):
        p = P.puntuar(c["modelo"], cfg)
        ef = P.puntaje_efectivo(p["base"], c["semanas"], cfg)
        b = P.total_barthel(c["barthel"])
        obtenido = {
            "base": p["base"], "max": p["max"], "top3": [d["var"] for d in p["top3"]], "variables": p["variables"],
            "efectivo": ef["efectivo"], "extra": ef["extra"], "nivel": P.nivel(ef["efectivo"], cfg),
            "regla": P.regla_horas(c["modelo"]["horas"]), "barthel": b, "nivel_barthel": P.nivel_barthel(b),
            "zarit": P.total_zarit(c["zarit"], cfg),
            "chequeos": P.chequeos({"modelo": c["modelo"], "barthel": c["barthel"], "zarit": c["zarit"]}, cfg),
        }
        assert obtenido == esperado, f"caso {i}: {c}"


def test_reparto_de_horas(resultados):
    casos, js = resultados
    cfg = config_programa.config()
    for i, (r, esperado) in enumerate(zip(casos["repartos"], js["repartos"])):
        res = P.asignar_horas(r["personas"], cfg, r["presupuesto"])
        res["horas_semana"] = {k: P.horas_semana(v, cfg) for k, v in res["horas"].items()}
        assert res == esperado, f"reparto {i}: n={len(r['personas'])}, presupuesto={r['presupuesto']}"


def test_semanas_en_cola(resultados):
    casos, js = resultados
    assert [P.semanas_en_cola(a, b) for a, b in casos["semanas"]] == js["semanas"]
