# Analysis

EDA y exploración de fuentes de datos — esto sí está alineado con la etapa
actual del proyecto (exploración y validación de fuentes).

Reglas del proyecto que aplican aquí:
- Los notebooks son exclusivamente análisis reproducible, no documentación
  formal.
- Ninguna cifra nace en el documento de Word ni en la presentación: todo
  número publicado debe poder rastrearse hasta un notebook, consulta o
  archivo de resultados en esta carpeta (o en el repo de GitHub).
- Cada afirmación se clasifica como confirmada, probable o desconocida.

## Notebooks (desde el 7 oct 2026)

Los 15 notebooks numerados se juntaron en tres. Cada sección conserva su número
original y escribe los mismos archivos en `resultados/`, así que una cifra
citada como "notebook 04" se rastrea a la sección 04.

| Notebook | Secciones (antes notebooks separados) |
|---|---|
| `A_oferta_y_territorio.ipynb` | 01, 02, 08, 09, 13, 17 (nueva, 08/10/2026: contexto estatal ENIGH 2022 y CONAPO 2020) |
| `B_enasic_cuidadoras.ipynb` | 03, 07, 12, 16, 11 |
| `C_programa_asequibilidad_y_costo.ipynb` | 04, 05, 06, 10, 14 |
| `D_tipologia_territorial_ageb.ipynb` | 18 (nueva, 09/10/2026: tipología de AGEB urbanas con Censo 2020; segundo modelo de Herramientas y Técnicas Avanzadas) |

Los originales están en `../_to_delete/notebooks_separados_2026-10-07/`.

## Datos nuevos del 9 oct 2026 (sección 18)

- `datos/censo2020_ageb/`: Censo 2020, principales resultados por AGEB y manzana urbana, CDMX (INEGI). Su origen y SHA-256 están en `FUENTE.txt`; el notebook D verifica el hash antes de usarlo.
- `datos/marco_geo_2025/`: Marco Geoestadístico 2025 del INEGI. Contiene las capas `09a` (AGEB urbanas) y `09mun` (alcaldías), extraídas del archivo `794551163061_s.zip` que estaba en Descargas.
- La sección 18 también lee el DENUE de `../Data/raw/` y requiere `geopandas` (`pip install geopandas`).
