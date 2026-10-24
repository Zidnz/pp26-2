# Analysis

Análisis reproducible del Observatorio: notebooks A–D, scripts 19–21, resultados
(`resultados/`), figuras (`figuras/`) y matrices (`matrices/`). Este README es el
índice. Las decisiones y sus motivos están en `../Documentos/bitacora-decisiones.md`.

## Inventario al 20 oct 2026 (comprobado listando la carpeta)

| Archivo o carpeta | Qué es | Escribe en | Estado |
|---|---|---|---|
| `A_oferta_y_territorio.ipynb` | Secciones 01, 02, 08, 09, 13, 17 | `outputs/` (01), `resultados/02, 08, 09, 13, 17_*` | Sin doble revisión |
| `B_enasic_cuidadoras.ipynb` | Secciones 03, 07, 12, 16, 11 (en ese orden dentro del archivo) | `resultados/03, 07, 11, 12, 12b, 16_*`, `figuras/f10, f15–f20` | Sin doble revisión. |
| `C_programa_asequibilidad_y_costo.ipynb` | Secciones 04, 05, 06, 10, 14 | `resultados/04–06, 10, 14_*` | Sin doble revisión |
| `D_tipologia_territorial_ageb.ipynb` | Sección 18 (tipología de AGEB, modelo 2) | `resultados/18_*`, `figuras/f11–f14` | Sin doble revisión |
| `24_prioridad_zonas.py` | Regla sin pesos para ordenar alcaldías por brecha: volumen y concentración, 3 cortes × 3 tamaños de grupo de cabeza; detalle por AGEB | `resultados/24_*` | Sin doble revisión (24 oct 2026) |
| `19_costo_hora_por_jornada.py` | Costo de la hora por tipo de jornada | `resultados/19_*` | Sin doble revisión |
| `20_modelo_sostenibilidad.py` y `.ipynb` | Modelo de sostenibilidad de la opción C (no es ML) | `resultados/20_*` (incluye `.xlsx` con fórmulas), `figuras/f21–f25` | Sin doble revisión |
| `21_priorizacion_cuidadoras.py` | Escalera de métodos de priorización (exploratorio) | `resultados/21_*` | Sin doble revisión. Ver la nota del 20 oct más abajo |
| `eda_fuentes.py` | EDA del 18 sept sobre los CSV de `../Data/investigacion/` | `resultados/` sin prefijo numérico (`ayuda_avd_cdmx.csv`, `oferta_por_alcaldia.csv`, etc.) | Versión del 18 sept |
| `generar_figuras.py`, `estilo_graficas.py` | Figuras f1–f8 y estilo común | `figuras/` | — |
| `enut2024_participacion_laboral/` | Subproyecto ENUT 2024 (ver su README) | `reports/` | **No está en la bitácora** |
| `animaciones/` | Video regla contra modelo para la presentación | `.mp4` | **No está en la bitácora** |
| `etoe/` | Script ETOE 2020 | — | Sin ejecutar (faltan microdatos, 21 sept) |
| `matrices/` | Inventario de fuentes, matrices y diccionario del Observatorio | — | Borradores sin doble revisión |
| `reproduccion_colmex_2026-09-22/` | Reproducción del Cuadro 2.2 de Colmex | — | Ejecutado el 22 sept |
| `oferta_demanda_v0_2026-09-14/` | Especificación previa al DENUE | — | Reemplazado por la sección 01; se conserva por historia |
| `datos/` | Insumos. Microdatos ENASIC y zips grandes ignorados por git | — | Ver `FUENTE.txt` en cada subcarpeta cuando exista |

**Lo que NO está en esta carpeta:**
- No hay archivos `.py` ni `.ipynb` sueltos para las secciones 01 a 18. Viven dentro de A–D. Los originales estaban en `../_to_delete/`, que se borró el 20 oct 2026: ya no existen. El Project de claude.ai todavía muestra los archivos sueltos anteriores (01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14).
- **Sección 15 (anuncios, pago implícito):** `15_anuncios_pago_implicito.py`, su resultado y `matrices/anuncios_cuidado_redes.csv` existen solo en el Project de claude.ai, no aquí. Ningún notebook la incluye.
- No hay un «plan de modelado v3» en la carpeta, aunque la bitácora del 20 oct lo menciona. Dónde vive: **desconocido**.

Reglas del proyecto que aplican aquí:
- Los notebooks son exclusivamente análisis reproducible, no documentación
  formal.
- Ninguna cifra nace en el documento de Word ni en la presentación: todo
  número publicado debe poder rastrearse hasta un notebook, consulta o
  archivo de resultados en esta carpeta (o en el repo de GitHub).
- Cada afirmación se clasifica como confirmada, probable o desconocida.

## Notebooks (desde el 7 oct 2026)

Los notebooks numerados se juntaron en tres el 7 oct; el 9 oct se agregó un cuarto (D). Cada sección conserva su número
original y escribe los mismos archivos en `resultados/`, así que una cifra
citada como "notebook 04" se rastrea a la sección 04.

| Notebook | Secciones (antes notebooks separados) |
|---|---|
| `A_oferta_y_territorio.ipynb` | 01, 02, 08, 09, 13, 17 (nueva, 08/10/2026: contexto estatal ENIGH 2022 y CONAPO 2020) |
| `B_enasic_cuidadoras.ipynb` | 03, 07, 12, 16, 11 |
| `C_programa_asequibilidad_y_costo.ipynb` | 04, 05, 06, 10, 14 |
| `D_tipologia_territorial_ageb.ipynb` | 18 (nueva, 09/10/2026: tipología de AGEB urbanas con Censo 2020; segundo modelo de Herramientas y Técnicas Avanzadas) |

Los originales estaban en `../_to_delete/notebooks_separados_2026-10-07/` (carpeta borrada el 20 oct 2026).

## Datos nuevos del 9 oct 2026 (sección 18)

- `datos/censo2020_ageb/`: Censo 2020, principales resultados por AGEB y manzana urbana, CDMX (INEGI). Su origen y SHA-256 están en `FUENTE.txt`; el notebook D verifica el hash antes de usarlo.
- `datos/marco_geo_2025/`: Marco Geoestadístico 2025 del INEGI. Contiene las capas `09a` (AGEB urbanas) y `09mun` (alcaldías), extraídas del archivo `794551163061_s.zip` que estaba en Descargas.
- La sección 18 también lee el DENUE de `../Data/raw/` y requiere `geopandas` (`pip install geopandas`).

## Cambio del 13 oct 2026: sección 11 ampliada (notebook B)
- Subsecciones nuevas 11 a 16 al final de B:
  - alternativas de modelo;
  - diagnóstico (f15 a f19);
  - cobertura por cupo;
  - elección del objetivo (f20);
  - verificación sin «le falta fuerza física»;
  - lectura.
- Escriben 11 CSV nuevos (`resultados/11_modelo_{alternativas,curvas_cobertura,roc,calibracion,importancia,por_cupo}.csv` y `resultados/11_objetivo_{por_horas,por_grupo,resumen,decision,sin_fuerza}.csv`). Los cuatro archivos anteriores de la sección 11 no cambian.
- B ahora tarda unos 10 minutos. Requiere scikit-learn ≥ 1.6, porque usa `GroupKFold(shuffle=True)`. Lee `resultados/03_*` y `04_*`, así que hay que ejecutar antes A y C.

## Script 19 (13 oct 2026): costo de la hora por tipo de jornada

- `19_costo_hora_por_jornada.py` → `resultados/19_costo_hora_por_jornada.csv`. Hora ordinaria al piso legal ($342.47/día) para jornada diurna (÷ 8), mixta (÷ 7.5) y nocturna (÷ 7), y paquetes de relevo de 3 a 12 h/sem (× 4.33 semanas, igual que el script 10). Control interno: la fila diurna de 6 h debe coincidir con el script 10.
- Sin prestaciones. Arts. 60 y 61 de la LFT y su aplicación al trabajo del hogar (art. 333) pendientes de verificar en el DOF (Daniel): evidencia probable.
- Lo usa la tarjeta «¿Cambia el costo si el relevo es de noche?» del Observatorio (pestaña «¿Cuánto cuesta?»).

## Script 20 (15 oct 2026): modelo de sostenibilidad de la opción C

- `20_modelo_sostenibilidad.py` lee `resultados/` (03, 04, 05, 06, 07, 14, 16 y 19) y escribe `resultados/20_modelo_sostenibilidad.xlsx` (seis hojas con fórmulas vivas) y `resultados/20_sostenibilidad_escenarios.csv`.
- `20_modelo_sostenibilidad.ipynb` es el análisis reproducible: tiene figuras `f21` a `f25`, la sensibilidad de un factor a la vez y un control que se detiene si no reproduce las 75 filas del CSV del script.
- No calcula punto de equilibrio: el costo de operación está POR DETERMINAR. Ver la bitácora del 15 oct (10:25 y 10:50).
- `Frontend/observatorio/build_datos.py` lee `20_sostenibilidad_escenarios.csv` desde el 20 oct.

## Script 21 (20 oct 2026): escalera de métodos de priorización

- `21_priorizacion_cuidadoras.py` compara R0 azar, R1 regla ≥ 40 h, R2 regla compuesta, R3 tarjeta de puntos, R4 logística y R5 gradient boosting. Usa StratifiedGroupKFold por UPM y bootstrap de UPM. Escribe `resultados/21_escalera_{global,por_grupo,bootstrap_upm,auc}.csv`, `21_calibracion_logit.csv` y `21_tarjeta_puntos.csv`.
- Guarda una caché de puntajes por persona (nivel microdato) **fuera del repositorio** (`CACHE21`, por defecto `/tmp/cache21`).
- **Todo es exploratorio.** El docstring del script todavía dice que el objetivo primario es «salud física deteriorada». La decisión DEC-OBJ-001 (bitácora, 20 oct, 11:05) revirtió eso a «algún daño». Hay que corregir el docstring; el código no cambia.

## Subcarpetas sin entrada en la bitácora (detectado el 20 oct 2026)

- `enut2024_participacion_laboral/` (archivos del 15 oct): modelo explicativo de la ENUT 2024 (mujeres de 25 a 54 años; tener menores de 6 años se asocia con momios ≈ 1.6 de estar fuera del mercado laboral). Su propio README dice que no está en la bitácora ni en `ML/README.md`. Ya se agregó a `ML/README.md`. **Falta la entrada de bitácora**: quién lo hizo, para qué decisión sirve y quién lo revisa.
- `animaciones/` (15–16 oct): `01_focalizacion_regla_vs_modelo.mp4`. Lee los CSV de la sección 11. El video presenta `DANO_SALUD_FISICA` como contraste; desde DEC-OBJ-001 eso debe leerse como sensibilidad exploratoria. **Falta la entrada de bitácora.**
