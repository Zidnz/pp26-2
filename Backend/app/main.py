"""Backend del Observatorio del Cuidado (PP 26-2).

Dos servicios, ninguno guarda datos:
  /dw/*       lectura del data warehouse (agregados; SQLite en modo solo lectura)
  /puntaje/*  puntaje y reparto de horas de Mientras (sin estado)

Arranque (desde la raíz del repo):
    python -m uvicorn Backend.app.main:app --port 8001
Documentación interactiva: http://127.0.0.1:8001/docs
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import ajustes, config_programa
from .db import DWNoDisponible, conectar, ultimo_run, violaciones_alcance
from .rutas_dw import router as router_dw
from .rutas_puntaje import router as router_puntaje

app = FastAPI(
    title="Observatorio del Cuidado · Backend",
    version=ajustes.VERSION,
    description=(
        "API de solo lectura sobre el data warehouse y servicio de puntaje sin estado de la app Mientras. "
        "No guarda datos personales. Estado: " + ajustes.ESTADO_REVISION["backend"] + "."
    ),
)
app.add_middleware(CORSMiddleware, allow_origins=ajustes.ORIGENES_CORS, allow_methods=["GET", "POST"],
                   allow_headers=["Content-Type"])
app.include_router(router_dw)
app.include_router(router_puntaje)


@app.get("/salud", tags=["Estado"], summary="¿Está disponible el DW y al día la configuración?")
def salud():
    dw: dict = {"ruta": str(ajustes.DW_PATH)}
    try:
        con = conectar()
        try:
            dw.update(disponible=True, etl_run=ultimo_run(con), violaciones_alcance=violaciones_alcance(con))
        finally:
            con.close()
    except DWNoDisponible as e:
        dw.update(disponible=False, error=str(e))
    cfg = config_programa.estado()
    ok = dw.get("disponible") and dw.get("violaciones_alcance") == 0 and cfg["al_dia"] is not False
    return {"ok": bool(ok), "version": ajustes.VERSION, "dw": dw, "config_programa": cfg,
            "estado_revision": ajustes.ESTADO_REVISION}
