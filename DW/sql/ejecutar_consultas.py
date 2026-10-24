# -*- coding: utf-8 -*-
"""Ejecuta DW/sql/03_consultas_olap.sql contra DW/observatorio_dw.sqlite y escribe los resultados en DW/docs/resultados_consultas_olap.md."""
import re, sqlite3, sys
from pathlib import Path
import pandas as pd
DW = Path(__file__).resolve().parents[1]
con = sqlite3.connect(f"file:{DW / 'observatorio_dw.sqlite'}?mode=ro", uri=True)
bloques = re.split(r"\n(?=-- Q\d)", (DW / "sql" / "03_consultas_olap.sql").read_text(encoding="utf-8"))
out = ["# Resultados de las consultas OLAP\n", "Generado por `DW/sql/ejecutar_consultas.py` a partir de `DW/observatorio_dw.sqlite`. No se editan a mano.\n"]
for b in bloques:
    m = re.match(r"-- (Q\d) · (.+)", b)
    if not m:
        continue
    sql = "\n".join(l for l in b.splitlines() if not l.startswith("-- ")).strip().rstrip(";")
    df = pd.read_sql(sql, con)
    print(f"{m.group(1)}: {len(df)} filas")
    out += [f"\n## {m.group(1)} · {m.group(2)}\n", f"{len(df)} filas.\n", df.head(20).to_markdown(index=False, floatfmt='.2f') if len(df) else "_sin filas_", "\n"]
(DW / "docs" / "resultados_consultas_olap.md").write_text("\n".join(out), encoding="utf-8")
