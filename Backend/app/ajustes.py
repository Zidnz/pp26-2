"""Rutas y parámetros del backend. Todo lo configurable vive aquí o en variables de entorno.

Variables de entorno (opcionales):
  OBS_DW_PATH  ruta del almacén SQLite (por defecto: DW/observatorio_dw.sqlite en la raíz del repo)
  OBS_CORS     orígenes permitidos, separados por coma (por defecto: localhost:8000 y 127.0.0.1:8000)
"""
from __future__ import annotations

import os
from pathlib import Path

VERSION = "0.1.0"

RAIZ_REPO = Path(__file__).resolve().parents[2]
DW_PATH = Path(os.environ.get("OBS_DW_PATH", RAIZ_REPO / "DW" / "observatorio_dw.sqlite"))

# Configuración del programa Mientras: la fuente única es Frontend/js/config.js.
# config_programa.json es su copia exportada (Backend/scripts/exportar_config.js) con la huella del original.
CONFIG_JS = RAIZ_REPO / "Frontend" / "js" / "config.js"
CONFIG_JSON = Path(__file__).resolve().parent / "config_programa.json"

ORIGENES_CORS = [o.strip() for o in os.environ.get(
    "OBS_CORS", "http://localhost:8000,http://127.0.0.1:8000").split(",") if o.strip()]

# Estado de revisión que se declara en cada respuesta. Cambiarlo SOLO cuando la bitácora registre la revisión.
ESTADO_REVISION = {
    "dw": "Sin revisión de otra persona (DW 1.0.0, 20 oct 2026)",
    "backend": "Sin revisión de otra persona (backend 0.1.0, 21 oct 2026)",
    "puntaje": "Tarjeta del script 22: exploratoria, sin doble revisión. No supera a la regla de 40 h de forma demostrable.",
}

LIMITE_MAX = 1000  # filas por página
