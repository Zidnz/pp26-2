"""Acceso al almacén SQLite en SOLO LECTURA.

El backend nunca escribe en el DW: lo reconstruye DW/etl/run_etl.py. La conexión se abre con mode=ro,
así que cualquier INSERT/UPDATE falla en SQLite aunque el código tuviera un error.
"""
from __future__ import annotations

import sqlite3
from typing import Any, Iterator

from . import ajustes


class DWNoDisponible(RuntimeError):
    """El archivo del almacén no existe o no se puede abrir."""


def conectar() -> sqlite3.Connection:
    ruta = ajustes.DW_PATH
    if not ruta.exists():
        raise DWNoDisponible(
            f"No existe el almacén en {ruta}. Genéralo con: python -B DW/etl/run_etl.py (desde la raíz del repo).")
    con = sqlite3.connect(ruta.resolve().as_uri() + "?mode=ro", uri=True, check_same_thread=False)
    con.row_factory = sqlite3.Row
    return con


def obtener_conexion() -> Iterator[sqlite3.Connection]:
    """Dependencia de FastAPI: una conexión por petición."""
    con = conectar()
    try:
        yield con
    finally:
        con.close()


def filas(con: sqlite3.Connection, sql: str, params: tuple | list = ()) -> list[dict[str, Any]]:
    return [dict(r) for r in con.execute(sql, params).fetchall()]


def ultimo_run(con: sqlite3.Connection) -> dict[str, Any] | None:
    r = filas(con, "SELECT run_id, inicio, fin, estado, version_etl FROM etl_run ORDER BY run_id DESC LIMIT 1")
    return r[0] if r else None


def violaciones_alcance(con: sqlite3.Connection) -> int:
    """Filas en v_violaciones_alcance: cifras publicadas a un nivel geográfico más fino que su fuente."""
    return con.execute("SELECT COUNT(*) FROM v_violaciones_alcance").fetchone()[0]
