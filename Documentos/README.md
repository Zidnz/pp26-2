# Documentos

Documentos de apoyo del equipo: informes, borradores, referencias y los scripts que generan los `.docx`. Lo que hay aquí no se sube tal cual al repositorio formal de GitHub.

Regla del proyecto: el informe académico (argumentación e interpretación) vive en Word y cita los resultados, no los origina. **Ningún número debe nacer en un documento de esta carpeta.**

## Inventario al 20 oct 2026 (comprobado listando la carpeta)

### Registro
| Archivo | Qué es | Estado |
|---|---|---|
| `bitacora-decisiones.md` | Registro de decisiones, append-only. **Fuente canónica.** | Al día al 20 oct 2026 |
| `bitacora_pendiente_2026-10-08_razones_portada.md` | Entrada suelta sobre las «razones vivas» de la portada del Observatorio | **No se integró a la bitácora.** El cambio sí está en `Frontend/observatorio/README.md` |

### Documentos técnicos e informes (del más reciente al más antiguo)
| Archivo | Fecha | Qué es | Estado |
|---|---|---|---|
| `Documento_Maestro_Avance2_Observatorio_del_Cuidado_v2.docx` | 21 oct | Documento maestro del segundo avance (2.ª revisión, 2–6 nov) | Bitácora, 21 oct. Sustituye al maestro del 25 sept. Generador en `segundo_avance/`. Sin doble revisión |
| `Observatorio_Cuidado_Guia_Tablero_v2.docx` | 21 oct | Guía del tablero v2.0 (Observatorio del 20 oct) | Bitácora, 21 oct. Generador en `segundo_avance/`. Sin doble revisión |
| `Observatorio_Cuidado_Documento_Tecnico_v2.docx` | 21 oct | Documento técnico v2.0, incluye `DW/` | Bitácora, 21 oct. Generador `documento_tecnico/build_documento_tecnico_v2.js`. Sin doble revisión |
| `Mientras_Guia_App_v1.docx` | 21 oct | Guía de la app «Mientras» v1.0 | Bitácora, 21 oct. Generador en `segundo_avance/`. Sin doble revisión |
| `Observatorio_Cuidado_Documento_Tecnico_v1.docx` | 14 oct | Documento técnico del Observatorio (28 págs). Se genera con `documento_tecnico/build_documento_tecnico.js` | Bitácora, 14 oct. Es anterior a los scripts 20 y 21, al DW y a DEC-OBJ-001: **desfasado en esas partes** |
| `Observatorio_Cuidado_Guia_Tablero_v1.docx` | 10 oct | Guía del tablero v1.0 | **No tiene entrada propia en la bitácora** (solo se menciona el 14 oct). Generador en la carpeta: ninguno |
| `Propuestas_programa_poblacion_objetivo_v0.2.docx` / `.pdf` | 6 oct | Opciones A, B y C del programa | Base de la elección de la opción C (bitácora, 5 oct) |
| `Proyecto_Economia_del_Cuidado_Avance1_completo.pdf` | 2 oct | PDF del primer avance | **No tiene entrada en la bitácora** |
| `Documento_Maestro_Avance_Observatorio_del_Cuidado.docx` | 25 sept | Documento de avance consolidado | Bitácora, 25 sept. Sin doble revisión |
| `Observatorio_Cuidado_Hallazgos_y_Propuestas_v5.docx` | 25 sept | Hallazgos + sección de riesgos | Versión vigente de la serie (bitácora, 25 sept) |
| `Observatorio_Cuidado_Insumo_Presentacion.docx` | 25 sept | Insumo para la presentación | Bitácora, 25 sept |
| `Riesgos_Cuidado_Fraude_Interdiccion_Informe_Completo.docx`, `..._Insumo_Presentacion.docx` | 25 sept | Investigación de riesgos legales | — |
| `Documento_Integrado_Observatorio_Cuidado_v0.3.docx` | 25 sept | Documento integrado | Versión vigente de la serie |
| `Estudio_de_Negocio_Programa_Cuidado_v0.2.docx` | 24 sept | Estudio de negocio (subsidio para 20 h y 40 h) | Su modelo de subsidio **no corresponde a la opción C**. Lo reemplaza el script 20 (bitácora, 15 oct) |
| `Replanteamiento_problema_programa_v0.1.docx` | 22 sept | Replanteamiento | Se regenera con `build_replanteamiento.js` |

**Versiones superadas: borradas el 20 oct 2026 (21:50) a pedido de Omar.** Se borraron `Observatorio_Cuidado_Hallazgos_y_Propuestas.docx`, `_v2`, `_v3`, `_v4` y el `.pdf`, `Documento_Integrado_Observatorio_Cuidado.docx` y `_v0.2`, y `Estudio_de_Negocio_Programa_Cuidado.docx`. Ya no aplica la decisión del 25 sept de conservarlas «por historia».

### Generadores
`build_documento_integrado.js`, `build_estudio_negocio.js`, `build_replanteamiento.js`, `comun.js`, `generar_valores.py` / `_v2` / `_v3` y `_valores*.json` (cifras leídas de `Analysis/resultados/`), `documento_tecnico/` (generador, figuras y su HTML).

### Material del curso y referencias
`PROBLEMA PROTOTÍPICO 7° SEM LCDN 2026-2.pdf`, `INTELIGENCIA DE NEGOCIOS_UCA_LCDN_7.pdf`, `LCDN_7_ANALITICA PARA LOS NEGOCIOS_FINAL.pdf`, `TRANSVERSAL_7_8_SEMINARIO DE TITULACIÓN I_FINAL.pdf`, `Manual. Seminario de Investigación 1.pdf`, `702 Bienvenida_HERRAMIENTAS_Sto_Tomas.pdf`, `Documento_investigacion_general.pdf`, `Exploracion_referencias_y_matching.pdf` (la corrige `Analysis/matrices/matriz_referencias_matching.csv`), `S2600153_es.pdf` (CEPAL), `Mockups Propuestas.html` y `referencias/` (2 documentos del BID ME-T1485 y Camberos y Bracamontes 2007).

### Archivos ajenos al proyecto
El proyecto de C++ de septiembre de 2015 (`main.cpp`, `main.o`, `Makefile.win`, `actividad 2.*`) se borró el 20 oct 2026 a pedido de Omar.

## Historial de este archivo
- 21 oct 2026: se agregan los cuatro documentos del segundo avance y la carpeta `segundo_avance/`.
- 17 sept 2026: versión de dos párrafos, sin inventario.
- 20 oct 2026: inventario de la carpeta, estado de cada documento y archivos ajenos.
- 20 oct 2026 (11:35): se borró el proyecto C++ ajeno.
