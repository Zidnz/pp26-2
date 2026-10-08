# Matrices de tipología oferta–necesidad

- `matriz_tipologia_oferta_necesidad.csv`: 8 fuentes de oferta (O1–O8) y 5 de necesidad (N1–N5), clasificadas por función, unidad, cobertura, periodo y nivel de evidencia.
- `pares_oferta_necesidad.csv`: evaluación de compatibilidad de cada par oferta–necesidad.
- `_generar_matriz.py`: genera ambos CSV.

**Regla propuesta (pendiente del equipo):** un indicador territorial solo se construye cuando oferta y necesidad son compatibles en población objetivo, territorio, unidad de medida y periodo.

**Resultado:** hoy ningún par cumple la regla. El QL del notebook 02 queda como resultado exploratorio, no como indicador.

**Estado:** borrador del 20 sept 2026, pendiente de doble revisión (Daniel y Alondra Danae). No citar como resultado aprobado.


## matriz_referencias_matching.csv (22 sept 2026)

12 referencias de apps y servicios de cuidado (incluye 2 que cerraron). Para cada una: objetivo, problema declarado y su origen, evidencia de funcionamiento, quién la produce, clasificación (confirmada/probable/desconocida), fuente y fecha de consulta. Compilada a mano a partir de búsquedas web del 21 sept; sin script generador. **Pendiente de doble revisión.** Corrige varios datos de `Documentos/Exploracion_referencias_y_matching.pdf` (ver bitácora, 22 sept).

## inventario_fuentes_cuidado.csv: fila F19 (22 sept 2026)

Se agregó el estudio CESA-CDMX / CEDUA-Colmex "Economía del cuidado" (2026). Su Cuadro 2.2 se reprodujo desde el DENUE 05/2025 con coincidencia exacta; ver `Analysis/reproduccion_colmex_2026-09-22/`. **Pendiente de doble revisión** (columna `revisor` vacía).

## matriz_referencias_bibliograficas.csv (22 sept 2026; incorporada al repo el 23 sept)

Matriz de referencias bibliográficas (estudio CESA-CDMX / CEDUA-Colmex 2026, CEPAL Notas para la igualdad 30 y otras): qué permite y qué no permite afirmar cada documento, clasificación de evidencia y problemas detectados. Estaba en `C:\Users\Jsull\pp26-2\matrices\matriz_referencias.csv` y se copió sin cambios de contenido; se renombró para no confundirla con `matriz_referencias_matching.csv`.
**Nota:** la columna `siguiente_paso` de REF-COLMEX-2026 menciona `datos_crudos/denue/` y `fuentes/colmex_2026/reproducir_cuadro_2_2_denue.py`, rutas de esa carpeta anterior. En este repo la reproducción vive en `Analysis/reproduccion_colmex_2026-09-22/` y ya se ejecutó (coincidencia exacta del Cuadro 2.2). **Pendiente de doble revisión.**

## inventario_fuentes_cuidado.csv: filas F20 a F27 (6 oct 2026)

Fuentes que subió Omar el 6 oct: rezago social por AGEB, localidad y entidad (CONEVAL 2020), marginación por municipio y entidad (CONAPO 2020), base de pobreza ENIGH 2022 del CONEVAL, paquete de pobreza municipal 2020 (MunEBPH), programas del PEF 2026 con acciones de cuidado, serie del trabajo no remunerado como % del PIB y horas de trabajo no remunerado 2019. Los archivos están en `Analysis/datos/` (`coneval_irs/`, `conapo_marginacion/`, `enigh2022_coneval/`, `contexto_nacional/`); el paquete MunEBPH (6.5 GB) no se copió. Se usan en los scripts 13 y 14. También se agregó REF-CAMBEROS-2007 a `matriz_referencias_bibliograficas.csv`. **Pendiente de doble revisión** (columna `revisor` vacía).
