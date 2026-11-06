# Observatorio del Cuidado — versión Streamlit (29 oct 2026, actualizado 29 oct 2026 noche)

Segunda implementación del Observatorio, en Python. Ocho páginas con las mismas preguntas que `Frontend/observatorio/index.html`
(¿Quién lo carga?, ¿Por qué no se contrata?, ¿Cuánto cuesta?, ¿A quién primero?, ¿Dónde?, Indicadores, Método).

**Datos reales agregados. Sin datos simulados ni personales. Ninguna cifra escrita a mano.** Pendiente de doble revisión.

## Cómo correrlo

```bash
# desde la raíz del repo (pp26-2/)
pip install -r Observatorio_streamlit/requirements.txt
streamlit run Observatorio_streamlit/app.py
python -m pytest Observatorio_streamlit/tests -q     # prueba de humo: las 8 páginas corren sin error
```

## Qué lee (y por qué es distinto de la versión HTML)

| Capa | Archivos | Para qué |
|---|---|---|
| Data warehouse | `DW/marts/mart_necesidad_cuidado.csv`, `mart_asequibilidad.csv`, `mart_territorio.csv`, `mart_perfil_alcaldia.csv`, `diccionario_medidas.csv`, `cobertura_*.csv`, `calidad_precision.csv`, `DW/logs/ultimo_dq.csv` | Fuente principal: estimaciones con CV, IC 90 %, precisión y fuente |
| Data warehouse, modelos (desde el ETL 1.1.0, 29 oct 2026) | `DW/marts/mart_modelos.csv`, `mart_ageb.csv`, `catalogo_modelos.csv`, columnas `prioridad_*` de `mart_perfil_alcaldia.csv`; el mapeo `DW/etl/config_modelos.py` | Modelos 11 y 18 a 25. `datos.modelo("<archivo>.csv")` reconstruye la tabla con sus nombres de columna originales desde el mart |
| Lo que el DW no integra | `Analysis/resultados/04_pago_observado_cuidado.csv`, `05_dimensionamiento_cdmx.csv`, `18_tipologia_contornos.geojson`, `18_oferta_nucleo_puntos.csv` | Pago observado, dimensionamiento, geometría y puntos del DENUE |
| Matrices | `Analysis/matrices/inventario_fuentes_cuidado.csv`, `pares_oferta_necesidad.csv` | Método y regla de compatibilidad |
| Geometría | `Frontend/js/cdmx-alcaldias.js` | Mapa por alcaldía (INEGI, Marco Geoestadístico 2020) |

La versión HTML lee `Analysis/resultados` vía `build_datos.py`. Esta lee **primero los marts del DW**, así el ETL (con sus chequeos DQ01–DQ26)
queda como la única puerta de entrada de las cifras. Si falta un archivo o una fila esperada, la página se detiene con un mensaje en vez de mostrar un hueco.

## Reglas que la app aplica

- Toda tarjeta lleva una ficha plegada: lectura, fuente, archivo, nivel geográfico, precisión y **qué no permite afirmar**.
- Precisión baja (CV ≥ 30 %): barra clara con trama, rotulada; no se compara.
- Páginas con ENASIC muestran el aviso de cifras nacionales.
- Mapa: alcaldías sin dato en gris (no cero); avisos automáticos si la medida es conteo, mezcla fuentes, tiene periodo desconocido o definición sin verificar.
- Escenarios de financiamiento marcados como ilustrativos.
- Los textos de hallazgo que dependen de una cifra (p. ej. «no se distingue de la regla») se calculan del signo del IC, no se escriben fijos.

## Cambio del 29 oct 2026 (noche): se integran las cuatro partes que faltaban
- **¿Dónde? → pestaña «Tipología de AGEB»:** mapa de las 2,371 AGEB urbanas con cuatro capas (tipo, brecha de oferta, % sin internet,
  % de 60+), contornos de alcaldía y, opcional, los establecimientos núcleo del DENUE. Lee `18_tipologia_ageb.csv`,
  `18_tipologia_contornos.geojson` y `18_oferta_nucleo_puntos.csv`. Se detiene si una AGEB del modelo no tiene polígono.
- **¿Dónde? → pestaña «¿En qué orden atender las zonas?»:** regla sin pesos del script 24 (`24_prioridad_alcaldia.csv`): volumen N
  (personas de 60+ en AGEB con brecha) contra concentración P (% de las 60+ de la alcaldía), nivel modal en 9 combinaciones y
  estabilidad; debajo, la prueba del índice con pesos del script 25 (`25_indice_con_pesos_*.csv`).
  - Sobre `volumen`: en `24_indice_ponderado_alcaldias.csv` (archivo subido al proyecto de Claude el 27 oct, que no está en esta
    carpeta) `volumen` = N con corte cuartil; coincide con `N_cuartil` de `24_prioridad_alcaldia.csv` (p. ej. Azcapotzalco 25,358).
    La app usa los scripts 24 y 25 de la carpeta, que sí lo documentan.
- **¿Quién lo carga? → tarjeta «A las mismas horas, ¿quién declara más daño?»:** clases latentes del notebook 23 (`23_seg_*.csv`).
  No la recorta el filtro de segmento. Se detiene si cambian los nombres de las clases o si k = 2 deja de ser la más estable.
- **¿Cuánto cuesta? → tarjeta «¿Cuánto cuesta la hora según la jornada?»:** script 19 (`19_costo_hora_por_jornada.csv`), con la
  evidencia del archivo (arts. 60 y 61 de la LFT pendientes de verificar).
- Prueba nueva: `test_capas_del_mapa_ageb` (cambia las cuatro capas sin error). 10 de 10 pruebas pasan.

## Cambio del 29 oct 2026 (21:00): los modelos se leen del DW
- Todas las tarjetas de los modelos 11, 18, 19, 20, 23, 24 y 25 leen `DW/marts/` en vez de `Analysis/resultados/`. Las fichas de fuente lo dicen.
- La tabla de «¿En qué orden atender las zonas?» ya no muestra la columna `#` (`orden_presentacion`): el DW no la carga porque no es prioridad. Dentro de cada nivel va en orden alfabético.
- Prueba nueva `tests/test_dw_modelos.py`: reconstruye los 49 archivos de modelos, la tabla AGEB y la regla del 24 desde los marts y compara columna por columna con `Analysis/resultados/`. Si alguien cambia un resultado y no corre el ETL, falla. 62 pruebas pasan.
- **Orden de trabajo:** después de correr un notebook o script de modelos, correr `python -B DW/etl/run_etl.py` antes de abrir la app.

## Lo que sigue faltando respecto a la versión HTML
- Zonas por AGEB con rezago social (`13_rezago_ageb_cdmx.csv`) y calibración/importancia del modelo 11.
- Clic en una AGEB para fijar su ficha (en Streamlit se ve al pasar el cursor).

## Hallazgos sobre el DW al construirla (para quien mantiene el ETL)

1. `mart_necesidad_cuidado`, bloque `horas`: la fila `mediana` trae `unidad = %`; es horas.
2. `mart_asequibilidad`: `costo_pct_ingreso_mediano` está vacío para la CDMX (la versión HTML lo calcula aparte).
3. DQ05b: 49 intervalos de Wald fuera de [0, 100] (se ven en «Quienes sí buscaron»).
4. DQ17: 20 de 49 definiciones de medidas sin verificar.

## Versiones
Hay dos implementaciones vivas del Observatorio (HTML y Streamlit). Decisión pendiente del equipo: cuál es la vigente para la UCA de
Inteligencia de Negocios, y si la otra se retira. Mientras no se decida, un cambio de cifras se refleja solo con volver a correr el ETL
y `build_datos.py`; un cambio de diseño hay que hacerlo dos veces.
