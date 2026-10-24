"""Carga la configuración del programa Mientras exportada de Frontend/js/config.js."""
from __future__ import annotations

import hashlib
import json
from functools import lru_cache
from typing import Any

from . import ajustes


@lru_cache(maxsize=1)
def cargar() -> dict[str, Any]:
    if not ajustes.CONFIG_JSON.exists():
        raise RuntimeError(f"Falta {ajustes.CONFIG_JSON}. Córrelo desde la raíz: node Backend/scripts/exportar_config.js")
    return json.loads(ajustes.CONFIG_JSON.read_text(encoding="utf-8"))


def config() -> dict[str, Any]:
    return cargar()["config"]


def estado() -> dict[str, Any]:
    """¿La copia exportada coincide con el config.js actual? None si config.js no está en disco."""
    datos = cargar()
    actual = None
    if ajustes.CONFIG_JS.exists():
        actual = hashlib.sha256(ajustes.CONFIG_JS.read_bytes()).hexdigest()
    return {
        "version": datos["config"].get("version"),
        "exportado": datos.get("exportado"),
        "sha256_exportado": datos.get("sha256"),
        "sha256_config_js": actual,
        "al_dia": None if actual is None else actual == datos.get("sha256"),
    }
