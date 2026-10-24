"""Servicio de puntaje de Mientras: SIN ESTADO.

Recibe las respuestas de una entrevista y devuelve el puntaje de la tarjeta (script 22), el nivel, la regla de
40 h como referencia, Barthel, Zarit y los chequeos de consistencia. No guarda, no registra y no reenvía nada:
no hay base de datos detrás y las respuestas llevan `Cache-Control: no-store`.

No se pide ni se acepta ningún identificador de la persona (nombre, CURP, domicilio, edad). Los únicos `id` que
existen son los de /puntaje/reparto, y deben ser folios opacos.
"""
from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, ConfigDict, Field, field_validator

from . import ajustes, config_programa
from . import prioridad as P

router = APIRouter(prefix="/puntaje", tags=["Puntaje de Mientras (sin estado)"])

IDS_ABVD = {o["id"] for o in P.ABVD}
IDS_CLIN = {o["id"] for o in P.CLIN}
ADV_PROVISIONAL = "Puntaje provisional — modelo en validación."
ADV_REGLA = ("La tarjeta no supera a la regla de 40 h de forma demostrable (script 22: +2.2 pp, IC 90 % −3.4 a 7.7). "
             "Se devuelven las dos.")


class Estricto(BaseModel):
    model_config = ConfigDict(extra="forbid")  # un campo no previsto (p. ej. «curp») se rechaza, no se ignora


class Entrevista(Estricto):
    horas: float = Field(..., ge=0, le=168, description="Horas de cuidado a la semana (P6_7 + P6_26)")
    abvd: list[str] = Field(default_factory=list, description=f"Actividades básicas con ayuda: {sorted(IDS_ABVD)}")
    clin: list[str] = Field(default_factory=list, description=f"Tareas de salud: {sorted(IDS_CLIN)}")
    req: bool = Field(False, description="Necesita que otra persona le apoye para cuidar (P6_9_4 / P6_28_4)")
    fuerza: bool = Field(False, description="Le falta fuerza física (P6_9_1 / P6_28_1)")
    sexo: Literal["M", "H"] | None = Field(None, description="M = mujer, H = hombre (como en la app)")

    @field_validator("abvd")
    @classmethod
    def _abvd(cls, v: list[str]) -> list[str]:
        return _validar_ids(v, IDS_ABVD, "abvd")

    @field_validator("clin")
    @classmethod
    def _clin(cls, v: list[str]) -> list[str]:
        return _validar_ids(v, IDS_CLIN, "clin")


def _validar_ids(v: list[str], validos: set[str], campo: str) -> list[str]:
    malos = [x for x in v if x not in validos]
    if malos:
        raise ValueError(f"{campo}: códigos no reconocidos {malos}; válidos: {sorted(validos)}")
    if len(set(v)) != len(v):
        raise ValueError(f"{campo}: hay códigos repetidos")
    return v


class Evaluacion(Estricto):
    modelo: Entrevista
    barthel: dict[str, int] | None = Field(None, description="B01…B10 con el puntaje de cada actividad")
    zarit: dict[str, int] | None = Field(None, description="Z01…Z22 con respuestas 0-4 (seguimiento y chequeos; no puntúa)")
    semanas_en_cola: int = Field(0, ge=0, le=520, description="Semanas sin relevo asignado (envejecimiento)")


class Persona(Estricto):
    id: str = Field(..., pattern=r"^[a-z0-9]{1,32}$",
                    description="Folio opaco (minúsculas y dígitos). Nunca nombre ni CURP.")
    efectivo: float = Field(..., ge=0, le=100)


class Reparto(Estricto):
    personas: list[Persona] = Field(..., max_length=5000)
    presupuesto: int | None = Field(None, ge=0, le=10_000_000, description="Horas al mes; por defecto la de config.js")

    @field_validator("personas")
    @classmethod
    def _unicos(cls, v: list[Persona]) -> list[Persona]:
        if len({p.id for p in v}) != len(v):
            raise ValueError("hay folios repetidos")
        return v


def _cfg() -> tuple[dict[str, Any], list[str]]:
    est = config_programa.estado()
    if est["al_dia"] is False:
        raise HTTPException(503, detail=(
            "Frontend/js/config.js cambió y su copia del backend no se ha exportado. "
            "Corre desde la raíz: node Backend/scripts/exportar_config.js"))
    adv = [] if est["al_dia"] else ["No se encontró Frontend/js/config.js para comprobar que la configuración está al día."]
    return config_programa.config(), adv


def _sin_cache(resp: Response) -> None:
    resp.headers["Cache-Control"] = "no-store"


@router.get("/config", summary="Pesos, umbrales y parámetros vigentes (de config.js)")
def ver_config():
    cfg, adv = _cfg()
    return {"estado": config_programa.estado(), "advertencias": adv + ["Valores provisionales: ninguno aprobado por el equipo."],
            "config": cfg}


@router.get("/preguntas", summary="Preguntas de la entrevista, Barthel y estructura de Zarit")
def preguntas():
    cfg, _ = _cfg()
    return {"modelo": P.PREGUNTAS_MODELO, "no_preguntadas": P.NO_PREGUNTADAS, "barthel": P.BARTHEL,
            "zarit": {"reactivos": P.reactivos_zarit(cfg), "escala": [cfg["zarit"]["escala_min"], cfg["zarit"]["escala_max"]],
                      "nota": "Los textos de Zarit requieren licencia; solo existen marcadores."}}


@router.post("/evaluar", summary="Puntaje, nivel, regla de 40 h y chequeos de una entrevista")
def evaluar(ev: Evaluacion, resp: Response):
    _sin_cache(resp)
    cfg, adv = _cfg()
    m = ev.modelo.model_dump()
    p = P.puntuar(m, cfg)
    ef = P.puntaje_efectivo(p["base"], ev.semanas_en_cola, cfg)
    b = P.total_barthel(ev.barthel)
    z = P.total_zarit(ev.zarit, cfg)
    ch = P.chequeos({"modelo": m, "barthel": ev.barthel, "zarit": ev.zarit}, cfg)
    if ev.barthel and b is None:
        adv.append("Barthel incompleto o con un valor que no corresponde a la escala: no se calculó (no se imputa).")
    if ev.zarit and z is None:
        adv.append("Zarit incompleto o fuera de escala: no se calculó (no se imputa).")
    nv = P.nivel(ef["efectivo"], cfg)
    return {
        "puntaje": {"base": p["base"], "max": p["max"], "efectivo": ef["efectivo"], "envejecimiento": ef["extra"],
                    "semanas_en_cola": ef["semanas"], "nivel": nv, "nivel_txt": P.NIVEL[nv],
                    "top3": p["top3"], "detalle": p["detalle"], "variables": p["variables"]},
        "regla_40h": P.regla_horas(m["horas"]),
        "barthel": {"total": b, "nivel": P.nivel_barthel(b)},
        "zarit": {"total": z},
        "chequeos": ch,
        "revision_humana": bool(ch),
        "provisional": p["provisional"],
        "fuente": p["fuente"],
        "config_version": cfg["version"],
        "estado_revision": ajustes.ESTADO_REVISION["puntaje"],
        "advertencias": [ADV_PROVISIONAL, ADV_REGLA] + adv,
    }


@router.post("/reparto", summary="Reparto de la bolsa mensual de horas entre casos")
def reparto(r: Reparto, resp: Response):
    _sin_cache(resp)
    cfg, adv = _cfg()
    res = P.asignar_horas([p.model_dump() for p in r.personas], cfg, r.presupuesto)
    res["horas_semana"] = {k: P.horas_semana(v, cfg) for k, v in res["horas"].items()}
    if not res["capacidad_ok"]:
        adv.append(f"La bolsa no alcanza para el mínimo de {cfg['horas_minimas']} h/mes de todas: "
                   f"{len(res['en_cola'])} caso(s) quedan en cola este mes.")
    if r.presupuesto is None:
        adv.append(f"Se usó la bolsa de config.js ({cfg['presupuesto_horas_mes']} h/mes), que es ILUSTRATIVA.")
    res["advertencias"] = adv
    return res
