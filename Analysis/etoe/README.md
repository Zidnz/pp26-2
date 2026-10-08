# ETOE 2020 — no buscar trabajo por falta de quién cuide

`etoe_cuidados.py` (sesión del 14 sept 2026). Estima, con diseño muestral (linealización de Taylor), la proporción de la PNEA que no busca trabajo porque no tiene quién cuide (P2G2 = 09) y la que se dedica a quehaceres del hogar (P2E = 4), por sexo, abril–junio 2020.

**Para correrlo:** descargar los microdatos ETOE 2020 abril, mayo y junio, versión `cpv2020` en DBF, y descomprimirlos en `abril/`, `mayo/` y `junio/` junto al script (las rutas exactas están al inicio del script). Requiere `pip install dbfread`.

**Salida:** `etoe_cuidados_resultados.csv`. No se recuperó: se regenera al correr el script.

**Límites (van en el propio script):** encuesta telefónica con sesgo de cobertura; no comparable con la ENOE; tres meses de pandemia, sin tendencia; solo nacional. El indicador de hombres (CV > 40%) no es publicable.
