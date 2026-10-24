# Especificación del ETL

Versión 1.0.0 · 20 oct 2026 · **Sin revisión de otra persona.** Código: `DW/etl/run_etl.py`; mapeo declarativo: `DW/etl/config_mapeo.py`.

```
python -B DW/etl/run_etl.py            # desde la raíz del repositorio; reconstruye todo
```

## 1. Flujo

| Paso | Qué hace | Dónde queda |
|---|---|---|
| 1 Extraer | Lee 18 CSV de `Analysis/`, la fila «total del municipio» del Censo 2020 (zip de 44 MB) y el catálogo de alcaldías del Marco Geoestadístico 2025 (.dbf). Todo entra a `stg_*` como texto, sin tocar, con `_fila` y huella SHA-256. Si falta un archivo, el ETL se detiene (no carga con huecos). | `stg_*`, `etl_archivo` |
| 2 Transformar | Tipifica; normaliza nombres de alcaldía (4 formatos → clave INEGI); asigna unidad y tipo a cada indicador; despivota los tres umbrales del script 10; calcula la participación en 60+ del Censo; marca la calidad de cada valor. | en memoria |
| 3 Cargar | Dimensiones primero (claves sustitutas), hechos después. Duplicado de grano o clave no resuelta → `etl_rechazo` con el motivo; no se descarta en silencio. | `dim_*`, `fact_*`, `etl_rechazo` |
| 4 Verificar | 20 pruebas de calidad (§4). Una de severidad `error` que falle → código de salida 1 y **no se reemplaza** el almacén publicado. | `etl_dq`, `logs/ultimo_dq.csv` |
| 5 Publicar | Crea las vistas de los marts, exporta 8 CSV a `DW/marts/` y el diccionario de columnas. | `marts/`, `docs/` |

Idempotente: cada corrida reconstruye desde cero (el almacén se arma en una carpeta temporal y se copia al final). El historial de corridas queda en `logs/etl_runs.jsonl`, incluidas las fallidas.

## 2. Orígenes y destinos

| Origen (relativo a la raíz) | Filas | Destino | Fuente (`dim_fuente`) | Periodo |
|---|--:|---|---|---|
| `Analysis/resultados/03_enasic_barreras_estimaciones.csv` | 69 | `fact_estimacion_encuesta` | F04 ENASIC | 2022 |
| `…/04_contratacion_por_quintil.csv` | 10 | ídem | F04 | 2022 |
| `…/07_enasic_necesidad_vs_norma_estimaciones.csv` | 166 | ídem | F04 | 2022 |
| `…/12_segmentacion_estimaciones.csv` | 249 | ídem | F04 | 2022 |
| `…/12b_segmentacion_series.csv` | 449 | ídem | F04 | 2022 |
| `…/16_perfil_grupo_problema.csv` | 22 | ídem | F04 | 2022 |
| `…/10_asequibilidad_relevo.csv` | 10 (×3 umbrales) | `fact_asequibilidad`, `fact_costo_paquete` | F04 | 2022 (ingreso) |
| `…/14_enigh_asequibilidad_cdmx.csv` | 120 | ídem | F23 ENIGH 2022 | 2022 |
| `Analysis/outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv`, `indice_por_tipo_servicio.csv` | 16 + 16 | `fact_indicador_territorial` | F09 DENUE (+P01) | mayo 2026 |
| `…/02_indice_capacidad_residencial.csv` | 16 (12 con dato) | ídem | P02 | desconocido |
| `…/08_dependencia_severa_alcaldia.csv` | 16 | ídem | P03 | desconocido |
| `…/09_pobreza_65mas_alcaldia_cdmx.csv` | 16 | ídem | X01 CONEVAL | 2020 |
| `…/13_rezago_por_alcaldia.csv` | 16 | ídem | F20 CONEVAL, F22 CONAPO | 2020 |
| `…/18_tipologia_por_alcaldia.csv` | 16 | ídem | F20 | 2020 |
| `…/17_enigh_60mas_por_entidad.csv` | 198 | ídem (nivel Entidad) | F23 | 2022 |
| `Analysis/datos/censo2020_ageb/…zip` (CSV interno, 16 filas de municipio) | 16 | ídem (3 medidas) | F02 | 2020 |
| `Analysis/datos/marco_geo_2025/09mun.dbf` | 16 | `dim_geografia` | INEGI MG 2025 | — |
| `Analysis/matrices/inventario_fuentes_cuidado.csv` | 29 | `dim_fuente` | — | — |
| `…/oferta_por_alcaldia.csv` | 15 | **no se carga**; solo verificación (DQ09, DQ10) | — | — |

## 3. Reglas de transformación

- **Alcaldía.** Se resuelve por tres vías: abreviatura (`AZC`, `IZTAP`), clave numérica (`9009` → `09009`) o nombre normalizado (sin acentos ni puntos). El catálogo de referencia es el Marco Geoestadístico 2025. Las abreviaturas están en `ABREV_ALCALDIA` y se validan en DQ09 con evidencia independiente.
- **Unidad.** En `12b`, la serie `dif` va a `dif_pp`; `kpi/horas_total` y `kpi/horas_media` llevan unidad `horas/semana`. El resto es `%`.
- **Dominio vs evento.** En el script 16 la columna `poblacion` (Universo / Grupo del problema) es el dominio y la pertenencia a un segmento es el evento.
- **Precisión.** Se toma la clase publicada; se contrasta con la regla del INEGI aplicada al CV (DQ07).
- **Ausente.** Un valor vacío no genera fila ni se rellena. Un archivo que dice 0 donde la ficha dice «sin dato» no se carga (DQ10).
- **Derivada por el ETL.** `participacion_60mas_censo2020 = P_60YMAS_alcaldía / Σ P_60YMAS de las 16 × 100`, marcada `derivado (ETL)`.

## 4. Catálogo de pruebas de calidad (resultado de la corrida del 20 oct 2026)

Fuente de verdad: `DW/logs/ultimo_dq.csv`. Severidad `error` bloquea la publicación.

| Prueba | Sev. | Qué verifica | Resultado |
|---|---|---|---|
| DQ01 | error | Ninguna clave foránea huérfana | pasa |
| DQ02 | error | Filas de origen = cargadas + rechazadas, por archivo | pasa (0 rechazos) |
| DQ03 | error | Ningún hecho más fino que `nivel_geo_max` de su fuente | pasa; prueba negativa: una cifra ENASIC en Iztapalapa es detectada |
| DQ04 | error | Ninguna columna de staging parece identificar a una persona | pasa |
| DQ05 | error | Toda proporción estimada ∈ [0,100] | pasa |
| DQ05b | aviso | Intervalos dentro de [0,100] | **no pasa: 49 intervalos** (ver §5) |
| DQ06 | aviso | `li90 ≤ estimación ≤ ls90` (tol. 0.06) | pasa |
| DQ07 | aviso | Clase de precisión = regla CV 15/30 (tol. ±0.05 en CV) | pasa |
| DQ08 | error | Núcleo = 235; participaciones suman 100 | pasa |
| DQ08b | aviso | Población CDMX Censo 2020 = 9,209,944 | pasa |
| DQ09 | error | Plazas (por abreviatura) = capacidad (por nombre) en 12 alcaldías | pasa |
| DQ10 | aviso | Ceros sin respaldo en `oferta_por_alcaldia.csv` | **no pasa: Cuajimalpa, Tláhuac, V. Carranza** |
| DQ11 | aviso | Participación 60+ del archivo P01 vs Censo 2020 | pasa: diferencia máxima 0.003 pp |
| DQ12 | info | Fuentes con ≥ 2 periodos | 0 de 12 |
| DQ13 | aviso | Cifra ENASIC citada en el script 14 = cifra del script 10 | pasa |
| DQ14 | aviso | Índices de oferta recomputables desde sus componentes | pasa (error máx. 0.0006) |
| DQ15 | info | Alcaldías sin dato por medida | plazas: 4 de 16 |
| DQ16 | error | Una medida por alcaldía tiene un solo periodo y fuente | pasa |
| DQ17 | info | Definiciones sin verificar | 20 de 49 medidas |
| DQ18 | aviso | Cifras clave del Observatorio existen en el DW | 11 de 11 |

## 5. Hallazgos de la primera corrida

1. **49 intervalos de confianza se salen de [0,100]** (límites inferiores hasta −1.41 y superiores hasta 13.24 en porcentajes pequeños): 03 (3), 04 (2), 07 (14), 12 (13), 12b (17). Es el comportamiento esperable de un intervalo normal con proporciones cerca de 0. El Observatorio recorta las barras a 0 (`componentes.js`), pero el dato guarda el valor negativo. El DW no los modifica. Decisión pendiente del equipo: recortar al presentar, o cambiar el método (Wilson o logit) en los notebooks.
2. **`oferta_por_alcaldia.csv` convierte «sin dato» en 0** para Cuajimalpa, Tláhuac y V. Carranza, y omite Milpa Alta. Solo lo lee `Analysis/eda_fuentes.py`; no llega al Observatorio.
3. **El archivo P01 (población 60+, año «desconocido») coincide con el Censo 2020** en las 16 alcaldías (diferencia máxima 0.003 pp, correlación de rangos 1.0). Es evidencia fuerte de que viene del Censo 2020. No se reetiquetó: cambiar el periodo de una fuente es una decisión del equipo y va a la bitácora. Si se confirma, el índice de oferta pasa de «mezcla de fuentes de año desconocido» a «DENUE 2026 vs Censo 2020».
4. **Ninguna fuente admite series de tiempo** (0 de 12 combinaciones con ≥ 2 periodos). Cualquier gráfica de «evolución» en el Observatorio no tiene respaldo en estos datos.
5. **La fuente del ingreso mueve la asequibilidad más que cualquier otra decisión del almacén.** Relevo de 6 h/semana, piso legal, umbral 20 %: 66.2 % de hogares con ingreso ENASIC (nacional) frente a 84.5 % con ingreso monetario de la ENIGH 2022 (nacional) y 92.0 % (CDMX). Ya estaba en la bitácora del 15 oct; el almacén lo deja visible lado a lado.
6. **Los 16 grados de marginación CONAPO 2020 son «Muy bajo»** (índice entre 57.3 y 62.4). La variable categórica no discrimina entre alcaldías; el índice numérico sí.

## 6. Qué falta

- Doble revisión del esquema, del ETL y de las 20 definiciones sin verificar (`definicion_verificada = 0`). Propuesta: revisora Alondra Danae (lidera Inteligencia de Negocios); la decisión es del equipo.
- Conectar `Frontend/observatorio/build_datos.py` a los marts. Hoy el Observatorio lee los CSV de `Analysis/` y el almacén corre en paralelo, reconciliado en DQ18. Hasta conectarlo no se puede decir que el tablero «se alimenta del almacén».
- Prueba automatizada del ETL con datos de ejemplo (hoy las pruebas son sobre los datos reales).
