
## 2026-10-29 (21:00, hora CDMX) — DW 1.1.0: los modelos 11 y 18 a 25 entran al ETL; la app Streamlit los lee de los marts

**Qué cambió (a pedido de Omar: «Integrar los modelos 11 y 18–25 al ETL»).**
- **Esquema 1.1.0** (`DW/sql/01_schema_dw.sql`): nivel AGEB en `dim_geografia` (orden 4); hecho nuevo `fact_resultado_modelo` con `dim_modelo` (incluye la alternativa simple obligatoria de cada modelo), `dim_metrica` y `dim_configuracion`; `calidad_valor` admite «derivado (regla)».
- **ETL 1.1.0** (`DW/etl/run_etl.py` + mapeo nuevo `DW/etl/config_modelos.py`): 49 archivos de resultados de los modelos se despivotan a 6,970 filas; las 2,371 AGEB del notebook D entran como geografía con 22 medidas (más 3 del script 24); la regla del script 24 entra como 13 medidas por alcaldía. 10 pruebas nuevas (DQ19 a DQ26).
- **Marts nuevos:** `mart_modelos.csv`, `mart_ageb.csv`, `catalogo_modelos.csv`. `mart_perfil_alcaldia.csv` gana 13 columnas `prioridad_*`. `mart_territorio.csv` excluye las AGEB.
- **App Streamlit:** los modelos ya se leen de los marts (`datos.modelo()`, `datos.ageb()`, `datos.prioridad()`); prueba de reconciliación nueva (`tests/test_dw_modelos.py`).

**Correcciones a decisiones anteriores (no se reescriben; se registran aquí).**
1. *Fuente de la tipología.* El DW 1.0.0 (20 oct) cargó las 6 medidas de `18_tipologia_por_alcaldia.csv` con F20 (rezago CONEVAL). Es incorrecto: la tipología sale del Censo 2020 por AGEB (F02) y la distancia al DENUE. Se cambia a F02. Los valores no cambian; cambian `fuente_id` y `fuente` en 96 filas de `mart_territorio.csv`.
2. *Nivel geográfico de las fuentes.* F02, F09 y F20 pasan de 3 a 4 (AGEB). I01 (supuestos del equipo) pasa de 1 a 2 porque el script 20 aplica supuestos al total de la CDMX; esas filas van con `es_ilustrativo = 1` (55).
3. *Escenarios 19 y 20.* `modelo_dimensional.md` §7 (20 oct) decía que irían «en un hecho aparte con `es_simulado = 1`». Se hizo en un hecho aparte, pero la bandera se llama `es_ilustrativo`: no son datos simulados, son cálculos con supuestos sin fuente.
4. *Tabla de orden de alcaldías.* La app quitó la columna `#` (`orden_presentacion` del script 24). El DW no la carga porque se leía como ranking; dentro de cada nivel la tabla va en orden alfabético.

**Verificado.**
- El ETL corre sin rechazos y pasa las 12 pruebas de severidad *error*. Siguen abiertas solo las 2 advertencias de la 1.0.0: DQ05b, con 49 intervalos fuera de [0,100], y DQ10, con ceros sin respaldo.
- Hubo una corrida previa a la corrección del grano de `22_tarjeta_estabilidad.csv`, que repite los puntos de la tarjeta. En esa corrida hubo 27 rechazos.
- Contra la publicación anterior del DW:
  - `mart_necesidad_cuidado`, `mart_asequibilidad` y `calidad_precision` salen idénticos.
  - Las 46 columnas previas de `mart_perfil_alcaldia` salen idénticas.
  - `mart_territorio` solo cambia en la fuente de la tipología y en las 207 filas nuevas del script 24.
- Reconciliación: la app reconstruye desde los marts los 49 archivos, la tabla AGEB y la regla del 24. Coinciden columna por columna con `Analysis/resultados/`.
- Pruebas internas del DW:
  - DQ21: N del 24 = Σ 60+ de las AGEB con brecha = medida de la tipología, en las 16 alcaldías.
  - DQ22: 257 = 257 AGEB.
  - DQ25: 11 versión 1 = ampliación; 18 decisión = perfiles = 2,371 AGEB; 22 tarjeta = estabilidad en 27 de 27.
- 62 pruebas de la app pasan.
- Se vio en navegador la pestaña «¿En qué orden atender las zonas?».
- Todo se corrió en una copia del repositorio en la nube. Los archivos de entrada se verificaron idénticos a los de la carpeta de Omar.

**No verificado / desconocido.**
- A qué objetivo corresponden `11_modelo_coeficientes_logit.csv`, `21_escalera_por_grupo.csv` y `21_calibracion_logit.csv`. Quedan vacíos.
- De qué estadístico es el intervalo de `21_escalera_bootstrap_upm.csv`.
- La definición exacta de `margen` (modelo 18).
- Las unidades de las métricas de validación cruzada del notebook 23.
- DQ17: 40 de 87 medidas sin definición verificada.
- No se probó si `Frontend/observatorio/build_datos.py` sigue funcionando con las 13 columnas nuevas de `mart_perfil_alcaldia`. Agregar columnas no debería romper una lectura por nombre, pero no se corrió.

**Hallazgo para los dueños de los scripts.** El 11 usa `DANO_ALGUNO` y `DANO_SALUD_FISICA`; el 21 y el 22 usan `ALGUN_DANO` y `SALUD_FISICA`. El DW los unifica en `objetivo_comun`, pero conviene un solo código en origen. `21_tarjeta_puntos.csv` no es la tarjeta vigente; la vigente es la del 22.

Sin revisión de otra persona: esquema, ETL, `config_modelos.py` (qué columna es qué métrica y con qué unidad) y la app. Revisor: _[pendiente]_.
