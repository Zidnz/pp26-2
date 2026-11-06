# Data warehouse del Observatorio del Cuidado

Esquema estrella, data marts y ETL de la UCA **Inteligencia de Negocios** (PP 26-2). Versión 1.1.0 · 29 oct 2026 (1.0.0 del 20 oct) · **Sin revisión de otra persona.** La 1.1.0 integra los modelos 11 y 18 a 25 y el nivel AGEB.

## Para qué existe
Integrar en un solo lugar, con claves y reglas comunes, los indicadores que hoy viven en decenas de CSV de `Analysis/resultados/`, y hacer cumplir en código tres reglas del proyecto: *desconocido no es cero*, *una encuesta nacional no sustenta cifras por alcaldía* y *sin dos periodos no hay tendencia*. Es la capa que la UCA pide (DW, esquema estrella, data marts, ETL); no sustituye a los notebooks ni calcula nada de encuesta.

## Cómo correrlo
```bash
python -B DW/etl/run_etl.py          # desde la raíz del repo; ~15 s; reconstruye todo
python -B DW/sql/ejecutar_consultas.py   # corre las 8 consultas OLAP y escribe docs/resultados_consultas_olap.md
```
Requiere Python 3.10+, `pandas` y `numpy` (y `tabulate` solo para las consultas). Necesita en disco, aunque git los ignore: el zip del Censo 2020 (`Analysis/datos/censo2020_ageb/`) y `Analysis/datos/marco_geo_2025/09mun.dbf`. Si falta un archivo, el ETL se detiene y dice cuál. Si una prueba de severidad *error* falla, no reemplaza el almacén publicado y sale con código 1.

## Qué hay aquí
| Ruta | Contenido |
|---|---|
| `sql/01_schema_dw.sql` | DDL: 13 dimensiones, 5 hechos, tablas de auditoría del ETL |
| `sql/02_vistas_marts.sql` | 4 data marts + catálogo de modelos + 5 vistas de gobierno; `mart_perfil_alcaldia` y `mart_ageb` se generan desde el ETL |
| `sql/03_consultas_olap.sql` | Roll-up, drill-down, slice y linaje (Q1 a Q8) |
| `etl/run_etl.py`, `etl/config_mapeo.py`, `etl/config_modelos.py` | Pipeline y mapeo fuente→destino (el tercero: modelos, AGEB y regla del 24) |
| `docs/modelo_dimensional.md` | Granos, matriz de bus, diagrama, decisiones y lo que **no** se modeló |
| `docs/etl_especificacion.md` | Flujo, reglas de transformación, las 30 pruebas y los hallazgos (§4b: integración de modelos) |
| `docs/diccionario_columnas_dw.csv`, `marts/diccionario_medidas.csv` | Diccionario de columnas y de medidas (con `definicion_verificada`) |
| `marts/*.csv` | Exportación plana de cada mart (UTF-8 con BOM) para Excel o Power BI |
| `logs/` | `etl_runs.jsonl` (historial), `ultimo_dq.csv`, `ultimo_rechazo.csv` |
| `observatorio_dw.sqlite` | El almacén (se regenera; git lo ignora) |

## Cómo se usa sin romper las reglas
- Antes de dibujar una línea de tiempo, consulta `cobertura_temporal.csv` (`permite_tendencia`). Hoy es 0 en todas las fuentes.
- Antes de poner una cifra en un mapa de alcaldías, comprueba el nivel de su fuente (`v_violaciones_alcance` debe estar vacía; el ETL lo exige).
- Un `NULL` en `mart_perfil_alcaldia.csv` es «desconocido», no cero.
- Las columnas `estimacion`, `li90`, `ls90` no se suman ni se promedian entre filas.
- `calidad_valor` dice si la medida es observada o derivada; las derivadas con «mezcla de fuentes» no se presentan como datos observados.

## Modelos en el DW (1.1.0)
- `marts/catalogo_modelos.csv`: un renglón por modelo (M11, M18 … M25) con la decisión que informa, su **alternativa simple** y su estado.
- `marts/mart_modelos.csv`: una métrica por fila; filtra por `modelo`, `archivo_origen`, `metrica`. `es_ilustrativo = 1` marca escenarios con supuestos sin fuente (script 20). Ninguna columna se suma entre filas.
- `marts/mart_ageb.csv`: una fila por AGEB urbana (tipo, brecha, robustez). Es Censo 2020 + DENUE 05/2026: no dice que una AGEB necesite cuidado.

## Estado y pendientes
Corrida del 29 oct 2026 (1.1.0): 965 estimaciones, 54,018 medidas territoriales (1,085 de alcaldía o entidad y 52,933 de AGEB), 150 de asequibilidad, 50 costos, 6,970 resultados de modelos; 0 rechazos; 28 de 30 pruebas pasan y siguen abiertas las 2 advertencias de la 1.0.0.

Primera corrida (20 oct): 965 estimaciones, 878 medidas territoriales, 150 pruebas de asequibilidad, 50 costos; 0 rechazos; 18 de 20 pruebas pasan y 2 advertencias abiertas (49 intervalos fuera de [0,100]; ceros sin respaldo en `oferta_por_alcaldia.csv`). Detalle en `docs/etl_especificacion.md` §5.

1. Doble revisión (esquema, ETL y 20 definiciones sin verificar). Quien lo produjo no lo aprueba.
2. ~~Decidir si `Frontend/observatorio/build_datos.py` pasa a leer los marts.~~ **Decidido el 21 oct 2026 (Omar): sí.** Ya leen del almacén `territorio` (`v_mart_perfil_alcaldia`) y `relevo.filas` (`v_mart_asequibilidad`). Faltan los bloques de la ENASIC (`clave`, `embudo`, `seg`, `razones`…), que hoy salen directo de `Analysis/`. Desde entonces el ETL va **antes** que `build_datos.py`, y DQ18 compara contra el `datos_observatorio.json` de la construcción anterior.
3. Cuando exista sede de práctica y datos operativos, modelar el hecho de servicio prestado (no antes).
