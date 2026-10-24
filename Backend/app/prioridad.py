"""Puntaje, niveles, envejecimiento, reparto de horas, Barthel, Zarit y chequeos de Mientras.

Es una traducción LÍNEA A LÍNEA de Frontend/js/prioridad.js (versión del 20 oct 2026). No agrega reglas.
La fuente de verdad sigue siendo el JS; tests/test_paridad.py corre los dos con los mismos casos y falla
si dan resultados distintos. Si cambia prioridad.js, se cambia esto y se corre la prueba.

Funciones puras: no leen ni escriben nada, no guardan respuestas.
"""
from __future__ import annotations

import math
from datetime import date
from typing import Any

ABVD = [
    {"id": "P6_2_01", "txt": "Darle de comer"},
    {"id": "P6_2_02", "txt": "Vestirle"},
    {"id": "P6_2_03", "txt": "Cambiarle el pañal o llevarle al baño"},
    {"id": "P6_2_04", "txt": "Bañarle o asearle"},
    {"id": "P6_2_08", "txt": "Acostarle o levantarle de la cama"},
]
CLIN = [
    {"id": "P6_2_10", "txt": "Darle medicinas"},
    {"id": "P6_2_11", "txt": "Hacerle curaciones"},
    {"id": "P6_2_12", "txt": "Ayudarle con terapias"},
    {"id": "P6_2_13", "txt": "Ayudarle con tratamientos"},
]
PREGUNTAS_MODELO = [
    {"id": "horas", "codigo": "P6_7 + P6_26", "txt": "¿Cuántas horas a la semana dedica a cuidar a esta persona?",
     "tipo": "numero", "min": 0, "max": 168},
    {"id": "abvd", "codigo": "P6_2_01…P6_2_08", "txt": "¿En cuáles de estas actividades le ayuda?", "tipo": "multi",
     "opciones": ABVD},
    {"id": "clin", "codigo": "P6_2_10…P6_2_13", "txt": "¿Cuáles de estas tareas de salud hace usted?", "tipo": "multi",
     "opciones": CLIN},
    {"id": "req", "codigo": "P6_9_4 / P6_28_4", "txt": "¿Necesita que otra persona le apoye para poder cuidar?",
     "tipo": "sino"},
    {"id": "fuerza", "codigo": "P6_9_1 / P6_28_1", "txt": "¿Se le dificulta cuidar porque le falta fuerza física?",
     "tipo": "sino"},
]
NO_PREGUNTADAS = {"disc": "FILTRO6_1 (cuida a persona con discapacidad)", "edad60": "EDAD ≥ 60 de quien cuida"}
ETIQUETA = {
    "h40": "Cuida 40 horas o más a la semana",
    "h80": "Cuida 80 horas o más a la semana",
    "abvd1": "Ayuda en al menos una actividad básica (comer, vestir, baño, aseo, cama)",
    "abvd3": "Ayuda en tres o más actividades básicas",
    "clin1": "Hace al menos una tarea de salud (medicinas, curaciones, terapias o tratamientos)",
    "disc": "Cuida a una persona con discapacidad",
    "req": "Necesita que otra persona le apoye para cuidar",
    "fuerza": "Se le dificulta cuidar porque le falta fuerza física",
    "mujer": "Es mujer: las mujeres cargan la mayor parte del cuidado",
    "edad60": "Tiene 60 años o más",
}
NIVEL = {"alta": "Alta", "media": "Media", "baja": "Baja"}

BARTHEL = [
    {"id": "B01", "txt": "Comer", "niveles": [[0, "No puede sin ayuda"], [5, "Necesita algo de ayuda"], [10, "Lo hace sola o solo"]]},
    {"id": "B02", "txt": "Bañarse", "niveles": [[0, "Necesita ayuda"], [5, "Lo hace sola o solo"]]},
    {"id": "B03", "txt": "Vestirse", "niveles": [[0, "No puede sin ayuda"], [5, "Necesita algo de ayuda"], [10, "Lo hace sola o solo"]]},
    {"id": "B04", "txt": "Arreglarse (cara, pelo, dientes)", "niveles": [[0, "Necesita ayuda"], [5, "Lo hace sola o solo"]]},
    {"id": "B05", "txt": "Control de evacuaciones", "niveles": [[0, "No controla"], [5, "Accidente ocasional"], [10, "Controla"]]},
    {"id": "B06", "txt": "Control de orina", "niveles": [[0, "No controla"], [5, "Accidente ocasional"], [10, "Controla"]]},
    {"id": "B07", "txt": "Usar el baño", "niveles": [[0, "No puede sin ayuda"], [5, "Necesita algo de ayuda"], [10, "Lo hace sola o solo"]]},
    {"id": "B08", "txt": "Pasar de la silla a la cama", "niveles": [[0, "No puede"], [5, "Mucha ayuda"], [10, "Poca ayuda"], [15, "Lo hace sola o solo"]]},
    {"id": "B09", "txt": "Caminar", "niveles": [[0, "No puede"], [5, "Solo en silla de ruedas"], [10, "Con ayuda"], [15, "Sola o solo"]]},
    {"id": "B10", "txt": "Subir y bajar escaleras", "niveles": [[0, "No puede"], [5, "Necesita ayuda"], [10, "Lo hace sola o solo"]]},
]


def _js_round(x: float) -> int:
    """Math.round de JavaScript (mitades hacia +∞). El round() de Python redondea mitades al par."""
    return math.floor(x + 0.5)


def _num(v: Any) -> float:
    """+v || 0 de JavaScript para los tipos que acepta la API (número o None)."""
    try:
        x = float(v)
    except (TypeError, ValueError):
        return 0.0
    return 0.0 if math.isnan(x) else x


def _limpio(x: float) -> int | float:
    """Igual que JSON.stringify: 20.0 → 20."""
    return int(x) if float(x).is_integer() else x


# ---------------------------------------------------------------- variables y puntaje
def variables(m: dict) -> dict[str, int]:
    horas = min(168, max(0, _num(m.get("horas"))))
    n_abvd, n_clin = len(m.get("abvd") or []), len(m.get("clin") or [])
    return {
        "h40": 1 if horas >= 40 else 0, "h80": 1 if horas >= 80 else 0,
        "abvd1": 1 if n_abvd >= 1 else 0, "abvd3": 1 if n_abvd >= 3 else 0, "clin1": 1 if n_clin >= 1 else 0,
        "disc": 1 if m.get("disc") else 0, "req": 1 if m.get("req") else 0, "fuerza": 1 if m.get("fuerza") else 0,
        "mujer": 1 if m.get("sexo") == "M" else 0, "edad60": 1 if m.get("edad60") else 0,
    }


def puntuar(m: dict, cfg: dict) -> dict[str, Any]:
    # cargarModelo(): hoy no hay modelo serializado (cfg.modelo.archivo = null) → siempre la tarjeta.
    x = variables(m)
    W = cfg["pesos"]
    detalle = [{"var": k, "etiqueta": ETIQUETA[k], "presente": bool(x[k]), "puntos": W[k] if x[k] else 0, "peso": W[k]}
               for k in W]
    base = sum(d["puntos"] for d in detalle)
    maximo = sum(max(0, v) for v in W.values())
    top3 = sorted([d for d in detalle if d["puntos"] > 0], key=lambda d: (-d["puntos"], d["var"]))[:3]
    return {
        "base": base, "max": maximo, "detalle": detalle, "top3": top3, "variables": x,
        "provisional": True,
        "fuente": f"Tarjeta de puntos «{cfg['variante_tarjeta']}» (script 22, ENASIC 2022 nacional)",
    }


def regla_horas(horas: Any) -> str:
    return "dentro" if _num(horas) >= 40 else "fuera"


# ---------------------------------------------------------------- cola y niveles
def semanas_en_cola(desde: str | None, hasta: str | None) -> int:
    if not desde or not hasta:
        return 0
    d0, d1 = date.fromisoformat(desde), date.fromisoformat(hasta)
    return max(0, math.floor((d1 - d0).days / 7))


def puntaje_efectivo(base: float, semanas: float, cfg: dict) -> dict[str, Any]:
    e = cfg["envejecimiento"]
    extra = min(e["tope_envejecimiento"], max(0, semanas) * e["puntos_por_semana"])
    return {"efectivo": _limpio(base + extra), "extra": _limpio(extra), "semanas": semanas}


def nivel(p: float, cfg: dict) -> str:
    if p >= cfg["umbrales"]["alta"]:
        return "alta"
    if p >= cfg["umbrales"]["media"]:
        return "media"
    return "baja"


# ---------------------------------------------------------------- reparto de horas
def asignar_horas(personas: list[dict], cfg: dict, presupuesto: float | None = None) -> dict[str, Any]:
    """Traducción de asignarHoras(). Ver el comentario del JS: mínimo garantizado, resto proporcional con tope."""
    B = max(0, math.floor(presupuesto if presupuesto is not None else cfg["presupuesto_horas_mes"]))
    m = cfg["horas_minimas"]
    M = max(cfg["horas_maximas"], m)
    orden = sorted(personas, key=lambda p: (-p["efectivo"], str(p["id"])))
    horas = {p["id"]: 0 for p in orden}
    n = len(orden)
    if not n:
        return {"horas": horas, "usado": 0, "sobrante": B, "capacidad_ok": True, "en_cola": [], "presupuesto": B}

    if B < n * m:
        k = math.floor(B / m)
        for p in orden[:k]:
            horas[p["id"]] = m
        usado = k * m
        return {"horas": horas, "usado": usado, "sobrante": B - usado, "capacidad_ok": False,
                "en_cola": [p["id"] for p in orden[k:]], "presupuesto": B}

    extra = {p["id"]: 0.0 for p in orden}
    resto = B - n * m
    abiertos = [p for p in orden if M > m]
    it = 0
    while it < n + 1 and resto > 1e-9 and abiertos:
        pesos = [max(0, p["efectivo"]) for p in abiertos]
        suma = sum(pesos)
        parte = [(resto * pesos[i]) / suma if suma > 0 else resto / len(abiertos) for i in range(len(abiertos))]
        rebasa, siguen = 0.0, []
        for i, p in enumerate(abiertos):
            cupo = M - m - extra[p["id"]]
            if parte[i] >= cupo:
                extra[p["id"]] += cupo
                rebasa += parte[i] - cupo
            else:
                extra[p["id"]] += parte[i]
                siguen.append(p)
        resto, abiertos = rebasa, siguen
        it += 1

    usado = 0
    residuos = []
    for p in orden:
        v = m + extra[p["id"]]
        horas[p["id"]] = math.floor(v + 1e-9)
        usado += horas[p["id"]]
        residuos.append({"id": p["id"], "r": v - horas[p["id"]]})
    libres = min(B - usado, _js_round(sum(x["r"] for x in residuos)))
    residuos.sort(key=lambda x: (-x["r"], str(x["id"])))
    for x in residuos:
        if libres <= 0:
            break
        if horas[x["id"]] < M and x["r"] > 1e-9:
            horas[x["id"]] += 1
            usado += 1
            libres -= 1
    return {"horas": horas, "usado": usado, "sobrante": B - usado, "capacidad_ok": True, "en_cola": [], "presupuesto": B}


def horas_semana(h_mes: float, cfg: dict) -> int:
    return math.floor(h_mes / cfg["semanas_por_mes"])


# ---------------------------------------------------------------- Zarit y Barthel
def reactivos_zarit(cfg: dict) -> list[dict]:
    return [{"id": f"Z{i + 1:02d}", "txt": f"[Reactivo Zarit {i + 1} — requiere licencia]"}
            for i in range(cfg["zarit"]["n_reactivos"])]


def total_zarit(resp: dict | None, cfg: dict) -> int | None:
    """Suma de respuestas. None si falta alguna o está fuera de escala (no se imputa)."""
    if not resp:
        return None
    t = 0
    for it in reactivos_zarit(cfg):
        v = resp.get(it["id"])
        if v is None or isinstance(v, bool) or not isinstance(v, (int, float)) \
                or v < cfg["zarit"]["escala_min"] or v > cfg["zarit"]["escala_max"]:
            return None
        t += v
    return _limpio(t)


def total_barthel(resp: dict | None) -> int | None:
    if not resp:
        return None
    t = 0
    for it in BARTHEL:
        v = resp.get(it["id"])
        if v is None or isinstance(v, bool) or not any(p == v for p, _ in it["niveles"]):
            return None
        t += v
    return _limpio(t)


def nivel_barthel(t: int | None) -> str:
    if t is None:
        return ""
    if t < 20:
        return "dependencia total"
    if t < 60:
        return "dependencia severa"
    if t < 91:
        return "dependencia moderada"
    if t < 100:
        return "dependencia leve"
    return "independiente"


# ---------------------------------------------------------------- chequeos
def _fmt(x: float) -> str:
    return str(_limpio(x))


def chequeos(ent: dict, cfg: dict) -> list[dict]:
    """Devuelve [{id, txt}]. Si hay alguno, el caso pasa a REVISIÓN HUMANA. El puntaje no se toca."""
    c, m = cfg["chequeos"], ent.get("modelo") or {}
    b, z = total_barthel(ent.get("barthel")), total_zarit(ent.get("zarit"), cfg)
    n_abvd, n_clin, h = len(m.get("abvd") or []), len(m.get("clin") or []), _num(m.get("horas"))
    out = []
    if h >= c["horas_altas"] and b is not None and b >= c["barthel_independiente"] and n_clin == 0:
        out.append({"id": "horas_vs_barthel", "txt": f"Declara {_fmt(h)} h/semana de cuidado, pero la persona cuidada es casi independiente (Barthel {b}) y no hay tareas de salud."})
    if n_abvd >= c["abvd_muchas"] and b is not None and b >= c["barthel_sin_ayuda"]:
        out.append({"id": "abvd_vs_barthel", "txt": f"Declara ayuda en {n_abvd} actividades básicas, pero según Barthel la persona las hace sola ({b}/100)."})
    if h >= c["horas_inverosimiles"]:
        out.append({"id": "horas_inverosimiles", "txt": f"{_fmt(h)} h/semana es casi todo el día, todos los días: verificar la captura o si hay más de una persona cuidada."})
    if z is not None and z <= c["zarit_bajo"] and m.get("fuerza") and m.get("req"):
        out.append({"id": "zarit_vs_fuerza", "txt": f"Declara que le falta fuerza y que necesita apoyo, pero su sobrecarga es baja (Zarit {z})."})
    return out
