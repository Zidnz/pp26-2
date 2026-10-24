"""API de lectura del data warehouse (DW/observatorio_dw.sqlite).

Qué hace: expone las vistas de los tres data marts y las de gobierno, con filtros fijos y paginación.
Qué NO hace, a propósito:
  - No suma, promedia ni agrega estimaciones entre filas (estimacion, li90, ls90 no son aditivas).
  - No ofrece series de tiempo: ninguna fuente tiene dos periodos (v_cobertura_temporal.permite_tendencia = 0).
  - No convierte NULL en 0: un NULL es «desconocido».
  - No publica nada si v_violaciones_alcance tiene filas (una cifra nacional colocada en una alcaldía): responde 503.
Cada respuesta lleva `meta` con la corrida del ETL, el estado de revisión y las advertencias que aplican.
"""
from __future__ import annotations

import sqlite3
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from . import ajustes
from .db import filas, obtener_conexion, ultimo_run, violaciones_alcance

router = APIRouter(prefix="/dw", tags=["Data warehouse (solo lectura)"])

ADV_NULL = "Un valor nulo significa «desconocido», no cero."
ADV_NO_ADITIVA = "estimacion, li90 y ls90 no se suman ni se promedian entre filas."
ADV_NACIONAL = ("Estimaciones nacionales (ENASIC 2022). No sustentan cifras para la Ciudad de México "
                "ni por alcaldía.")
ADV_SIN_TENDENCIA = "Ninguna fuente tiene dos periodos: no hay tendencia que mostrar."


def con_alcance(con: sqlite3.Connection = Depends(obtener_conexion)) -> sqlite3.Connection:
    """Dependencia: abre el DW y bloquea la publicación si viola la regla de alcance geográfico."""
    n = violaciones_alcance(con)
    if n:
        raise HTTPException(503, detail=(
            f"El almacén tiene {n} cifra(s) a un nivel geográfico más fino que su fuente "
            "(v_violaciones_alcance). No se publica nada hasta corregir el ETL."))
    return con


def _sobre(con: sqlite3.Connection, datos: list[dict], total: int | None = None,
           advertencias: list[str] | None = None, **extra: Any) -> dict[str, Any]:
    run = ultimo_run(con)
    return {
        "meta": {
            "fuente": "DW/observatorio_dw.sqlite (solo lectura)",
            "etl_run": run,
            "estado_revision": ajustes.ESTADO_REVISION["dw"],
            "n": len(datos),
            "total": total if total is not None else len(datos),
            "advertencias": advertencias or [],
            **extra,
        },
        "datos": datos,
    }


def _consulta(con: sqlite3.Connection, vista: str, filtros: dict[str, Any], orden: str,
              limite: int, desde: int) -> tuple[list[dict], int]:
    """`vista`, las columnas de `filtros` y `orden` vienen del código, nunca del usuario. Los valores van como parámetros."""
    cond, params = [], []
    for col, val in filtros.items():
        if val is not None:
            cond.append(f"{col} = ?")
            params.append(val)
    where = (" WHERE " + " AND ".join(cond)) if cond else ""
    total = con.execute(f"SELECT COUNT(*) FROM {vista}{where}", params).fetchone()[0]
    datos = filas(con, f"SELECT * FROM {vista}{where} ORDER BY {orden} LIMIT ? OFFSET ?", [*params, limite, desde])
    return datos, total


def _tendencia(con: sqlite3.Connection, fuente_ids: set[str]) -> list[dict]:
    if not fuente_ids:
        return []
    marcas = ",".join("?" * len(fuente_ids))
    return filas(con, f"SELECT fuente_id, tabla_hecho, n_periodos_distintos, periodos, permite_tendencia "
                      f"FROM v_cobertura_temporal WHERE fuente_id IN ({marcas}) ORDER BY fuente_id, tabla_hecho",
                 sorted(fuente_ids))


Limite = Query(100, ge=1, le=ajustes.LIMITE_MAX, description="Filas por página")
Desde = Query(0, ge=0, description="Desplazamiento (paginación)")


# ------------------------------------------------------------------ metadatos y gobierno
@router.get("/metadatos", summary="Corrida del ETL, pruebas de calidad y fuentes")
def metadatos(con: sqlite3.Connection = Depends(con_alcance)):
    run = ultimo_run(con)
    dq = filas(con, "SELECT codigo, severidad, descripcion, paso, detalle FROM etl_dq WHERE run_id = ? ORDER BY codigo",
               [run["run_id"]]) if run else []
    fuentes = filas(con, "SELECT fuente_id, nombre, emisor, origen_tipo, nivel_geo_max, periodo_cubierto, "
                         "estado_evidencia, permite_afirmar, prohibe_afirmar FROM dim_fuente ORDER BY fuente_id")
    abiertas = [d["codigo"] for d in dq if not d["paso"]]
    adv = [f"Pruebas de calidad sin cumplir en la última corrida: {', '.join(abiertas)}."] if abiertas else []
    return _sobre(con, [], advertencias=adv, pruebas_calidad=dq, fuentes=fuentes)


@router.get("/cobertura/temporal", summary="Periodos por fuente y si permiten tendencia")
def cobertura_temporal(con: sqlite3.Connection = Depends(con_alcance)):
    datos = filas(con, "SELECT * FROM v_cobertura_temporal ORDER BY fuente_id, tabla_hecho")
    adv = [ADV_SIN_TENDENCIA] if datos and not any(d["permite_tendencia"] for d in datos) else []
    return _sobre(con, datos, advertencias=adv)


@router.get("/cobertura/geografica", summary="Alcaldías sin dato por medida (desconocido, no cero)")
def cobertura_geografica(con: sqlite3.Connection = Depends(con_alcance)):
    return _sobre(con, filas(con, "SELECT * FROM v_cobertura_geografica ORDER BY medida_codigo, alcaldia_sin_dato"),
                  advertencias=[ADV_NULL])


@router.get("/calidad", summary="Estimaciones por clase de precisión (CV)")
def calidad(con: sqlite3.Connection = Depends(con_alcance)):
    return _sobre(con, filas(con, "SELECT * FROM v_calidad_precision ORDER BY script_origen, precision"))


@router.get("/medidas", summary="Diccionario de medidas territoriales")
def medidas(con: sqlite3.Connection = Depends(con_alcance)):
    datos = filas(con, "SELECT * FROM v_diccionario_medidas ORDER BY tema, codigo")
    n_sin = sum(1 for d in datos if not d["definicion_verificada"])
    adv = [f"{n_sin} de {len(datos)} medidas tienen definicion_verificada = 0."] if n_sin else []
    return _sobre(con, datos, advertencias=adv)


# ------------------------------------------------------------------ mart 1: necesidad (nacional)
@router.get("/necesidad", summary="Mart 1 · Necesidad y carga de las cuidadoras (ENASIC 2022, nacional)")
def necesidad(
    script_origen: str | None = Query(None, description="p. ej. 07_enasic_necesidad_vs_norma_estimaciones.csv"),
    tema: str | None = None,
    bloque: str | None = None,
    indicador: str | None = None,
    dominio_dimension: str | None = Query(None, description="p. ej. Sexo, Intensidad, Total"),
    dominio_segmento: str | None = None,
    precision: str | None = Query(None, description="alta, moderada, baja, no estimable, no aplica"),
    limite: int = Limite, desde: int = Desde,
    con: sqlite3.Connection = Depends(con_alcance),
):
    datos, total = _consulta(con, "v_mart_necesidad_cuidado", {
        "script_origen": script_origen, "tema": tema, "bloque": bloque, "indicador": indicador,
        "dominio_dimension": dominio_dimension, "dominio_segmento": dominio_segmento, "precision": precision,
    }, "estimacion_id", limite, desde)
    adv = [ADV_NACIONAL, ADV_NO_ADITIVA, ADV_NULL]
    n_baja = sum(1 for d in datos if d["precision"] in ("baja", "no estimable"))
    if n_baja:
        adv.append(f"{n_baja} fila(s) de esta página tienen precisión baja o no estimable (CV ≥ 30, criterio INEGI): úsense solo como referencia.")
    return _sobre(con, datos, total, adv, tendencia=_tendencia(con, {d["fuente_id"] for d in datos}))


# ------------------------------------------------------------------ mart 2: territorio
@router.get("/territorio", summary="Mart 2 · Territorio y oferta, formato largo")
def territorio(
    medida_codigo: str | None = None,
    cve_geo: str | None = Query(None, description="09 entidad; 09002…09017 alcaldía"),
    nivel_geografico: str | None = Query(None, description="Alcaldía, Entidad o Nacional"),
    tema: str | None = Query(None, description="oferta, demanda, brecha, contexto"),
    fuente_id: str | None = None,
    limite: int = Limite, desde: int = Desde,
    con: sqlite3.Connection = Depends(con_alcance),
):
    datos, total = _consulta(con, "v_mart_territorio", {
        "medida_codigo": medida_codigo, "cve_geo": cve_geo, "nivel_geografico": nivel_geografico,
        "tema": tema, "fuente_id": fuente_id,
    }, "territorial_id", limite, desde)
    adv = [ADV_NULL]
    mezcla = sum(1 for d in datos if d["calidad_valor"] == "derivado (mezcla de fuentes)")
    if mezcla:
        adv.append(f"{mezcla} fila(s) son derivadas de una mezcla de fuentes: no se presentan como dato observado.")
    sin_def = sum(1 for d in datos if not d["definicion_verificada"])
    if sin_def:
        adv.append(f"{sin_def} fila(s) usan una medida con definición sin verificar.")
    return _sobre(con, datos, total, adv, tendencia=_tendencia(con, {d["fuente_id"] for d in datos}))


@router.get("/alcaldias", summary="Perfil de las 16 alcaldías (formato ancho; NULL = desconocido)")
def alcaldias(con: sqlite3.Connection = Depends(con_alcance)):
    return _sobre(con, filas(con, "SELECT * FROM v_mart_perfil_alcaldia ORDER BY cve_geo"), advertencias=[ADV_NULL])


@router.get("/alcaldias/{cve_geo}", summary="Perfil de una alcaldía")
def alcaldia(cve_geo: str, con: sqlite3.Connection = Depends(con_alcance)):
    datos = filas(con, "SELECT * FROM v_mart_perfil_alcaldia WHERE cve_geo = ?", [cve_geo])
    if not datos:
        raise HTTPException(404, detail=f"No hay alcaldía con cve_geo = {cve_geo!r}. Use 09002 a 09017.")
    sin_dato = [k for k, v in datos[0].items() if v is None]
    adv = [ADV_NULL] + ([f"Sin dato (desconocido) en: {', '.join(sin_dato)}."] if sin_dato else [])
    return _sobre(con, datos, advertencias=adv)


# ------------------------------------------------------------------ mart 3: asequibilidad
@router.get("/asequibilidad", summary="Mart 3 · Asequibilidad del relevo por horas")
def asequibilidad(
    paquete: str | None = Query(None, description="p. ej. «Relevo 6 h/sem»"),
    horas_semana: int | None = Query(None, ge=0, le=168),
    umbral_pct_ingreso: int | None = Query(None, description="10, 20 o 30"),
    ingreso_referencia: str | None = None,
    salario_referencia: str | None = None,
    nivel_geografico: str | None = Query(None, description="Nacional o Entidad"),
    incluir_control: bool = Query(True, description="Incluir la jornada completa de 40 h (solo contraste)"),
    limite: int = Limite, desde: int = Desde,
    con: sqlite3.Connection = Depends(con_alcance),
):
    filtros = {
        "paquete": paquete, "horas_semana": horas_semana, "umbral_pct_ingreso": umbral_pct_ingreso,
        "ingreso_referencia": ingreso_referencia, "salario_referencia": salario_referencia,
        "nivel_geografico": nivel_geografico, "es_control": None if incluir_control else 0,
    }
    datos, total = _consulta(con, "v_mart_asequibilidad", filtros, "asequibilidad_id", limite, desde)
    adv = [ADV_NO_ADITIVA, "costo_mensual_2026 no incluye prestaciones.",
           "Que un hogar pueda pagar el paquete no significa que quiera contratarlo."]
    sin_var = sum(1 for d in datos if not d["tiene_varianza"])
    if sin_var:
        adv.append(f"{sin_var} fila(s) no tienen varianza estimada: sin intervalo, no se comparan entre sí.")
    if any(d["salario_referencia"].startswith("Tabulador") for d in datos):
        adv.append("El tabulador CACEH es una referencia, no un piso legal.")
    return _sobre(con, datos, total, adv, tendencia=_tendencia(con, {d["fuente_id"] for d in datos}))
