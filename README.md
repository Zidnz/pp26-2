# Observatorio de Datos para la Economía del Cuidado — PP 26-2

Proyecto integrador del 7.º semestre, Licenciatura en Ciencia de Datos para el Negocio (UNRC), semestre 2026-2.
Equipo: Omar Gutiérrez Escoto (líder), Daniel Cureño Martínez y Alondra Danae Madrigal García.

## Estado (20 oct 2026, 11:10 h CDMX)

Inventario hecho contra la carpeta `Downloads\pp26-2` el 20 oct 2026. Lo que dice este README se comprobó listando los archivos. Las decisiones y sus motivos están en la bitácora, no aquí.

- **Programa:** opción C, relevo por horas (3 a 12 h/semana) para cuidadoras familiares de alta intensidad. La eligió Omar el 5 oct 2026 (bitácora). Si el equipo la confirmó, la bitácora no lo registra.
- **Objetivo general:** candidato del 20 sept (bitácora). No hay entrada posterior que registre su confirmación por el equipo: **desconocido**.
- **Objetivo primario del modelo de focalización:** «algún daño» (`DANO_ALGUNO`). Salud física queda como sensibilidad exploratoria (DEC-OBJ-001, 20 oct, 11:05). Decisión de Omar, sin confirmación del equipo.
- **Doble revisión:** ningún entregable técnico la tiene registrada: notebooks A–D, scripts 19–21, DW, Observatorio, animación, ENUT 2024 ni documento técnico. Sus cifras no deben citarse como aprobadas.
- **Próxima fecha:** 2.ª revisión del 2 al 6 nov 2026. La 1.ª revisión fue el 26 sept.

## Dónde está cada cosa

| Carpeta | Contenido | Estado |
|---|---|---|
| `Documentos/bitacora-decisiones.md` | Registro de decisiones, append-only. Es la fuente canónica. | Al día al 20 oct 2026 |
| `Documentos/` | Informes Word/PDF, sus generadores (`build_*.js`, `generar_valores*.py`), documento técnico y referencias. Ver `Documentos/README.md` para saber qué versión rige. | Hay versiones superadas sin archivar. El proyecto C++ ajeno se borró el 20 oct |
| `Data/investigacion/` | 11 CSV de origen (de varios no está documentado el productor ni el año) | Sin cambios desde el 14 sept |
| `Data/ref/`, `Data/raw/` | Copias de referencia; DENUE 05_2026 CDMX (260 MB, git lo ignora) | Ver `Data/README_notebook01.md` |
| `Analysis/` | 4 notebooks (A–D), scripts 19–21, modelo de sostenibilidad (20, `.py` + `.ipynb`), 88 archivos en `resultados/`, 25 figuras (f1–f25) | Ver `Analysis/README.md` |
| `Analysis/enut2024_participacion_laboral/` | Subproyecto ENUT 2024 (Python + R/Quarto): participación laboral de mujeres de 25 a 54 años | **No registrado en la bitácora** (15 oct 2026) |
| `Analysis/animaciones/` | Video regla contra modelo (ManimGX) para la presentación | **No registrado en la bitácora** (15–16 oct 2026) |
| `Analysis/matrices/` | Inventario de fuentes, matrices de tipología y referencias, `diccionario_observatorio.csv` | Borradores sin doble revisión |
| `ML/` | Índice de modelos, sin código (el código vive en `Analysis/`) | Actualizado el 20 oct 2026 |
| `DW/` | Data warehouse (SQLite): esquema estrella, 3 data marts y ETL (UCA Inteligencia de Negocios, 20 oct 2026). Ver `DW/README.md` | Corrida 6 (21 oct); sin doble revisión. El Observatorio lee del almacén territorio y asequibilidad del relevo; el resto de sus bloques, todavía de `Analysis/` |
| `Frontend/observatorio/` | **Observatorio** en HTML (tablero de la UCA Inteligencia de Negocios) con datos reales agregados. Lo genera `build_datos.py` a partir de `Analysis/` y, para territorio y asequibilidad del relevo, del almacén `DW/` (21 oct 2026) | Ver su `README.md` (al día al 20 oct) |
| `Frontend/` (raíz) | Prototipo móvil de la app **Mientras** (relevo por horas; nombre provisional) con **datos simulados** | Reestructurado el 8 oct para la opción C; priorización con puntaje, niveles y bolsa de horas el 20 oct (bitácora, 23:10) |
| `Backend/` | API FastAPI (0.1.0): lectura del DW en solo lectura (`/dw/*`) y puntaje de Mientras sin estado (`/puntaje/*`). No guarda datos. Ver `Backend/README.md` | Creado el 21 oct 2026; sin doble revisión. Ni el Observatorio ni la app lo necesitan: el Observatorio lee el almacén al construirse, sin servidor |
| `scripts/` | `app.py` (asistente de voz Flask que apunta a una carpeta `ERP/` que **ya no existe**), `danita.html` y `parche_comparador_2026-10-07/` | Pendiente decidir si son del proyecto (bitácora, 22 sept) |
| `Fotos/` | Capturas del Observatorio (9) | — |
| `Claude outputs/` | `Omar_Tema3_I_Care_a_Lot.docx` (9 sept) | Parece ajeno al Observatorio; pendiente decidir |
| `_to_delete/` | — | **Borrada el 20 oct 2026 (11:35)** por decisión de Omar, con todos sus respaldos. Las referencias a `_to_delete/…` en la bitácora y en `Frontend/observatorio/README.md` son históricas: esos archivos ya no existen |

En la raíz también están `denue_09_csv.zip` y `denue_09_0525_csv.zip` (45 MB cada uno; git los ignora por `*.zip`). El segundo lo usa `Analysis/reproduccion_colmex_2026-09-22/`. `_obs_snapshot.tgz` y `app_matching_relevo_frontend.zip` se borraron el 20 oct (21:50).

## Orden para reproducir

1. `Analysis/`: A → C → B → D (B lee resultados de A y C). Después `19_costo_hora_por_jornada.py`, `20_modelo_sostenibilidad.py` (o su `.ipynb`) y `21_priorizacion_cuidadoras.py`. Todos se ejecutan desde `Analysis/`.
2. `python -B DW/etl/run_etl.py` (desde la raíz).
3. `python Frontend/observatorio/build_datos.py` (desde la raíz). Desde el 21 oct 2026 va **después** del ETL: territorio y asequibilidad del relevo se leen del almacén, y el script se detiene si el almacén falta o está desfasado.

Los microdatos (ENASIC, DENUE, Censo 2020 por AGEB, ENUT 2024) tienen que estar en disco aunque git los ignore. Los README de cada carpeta dicen de dónde se descargan.

## Pendientes de repositorio (20 oct 2026)

1. **No existe `.git`** en `Downloads\pp26-2`. El remoto `Zidnz/Proyecto-Protot-pico-2026` es de MILPÍN y no debe usarse (bitácora, 22 sept). Mientras no haya git, no hay historial que respalde fechas ni versiones. Desde el 20 oct tampoco quedan los respaldos de `_to_delete/`: la bitácora es la única evidencia de las versiones anteriores.
2. `.gitignore` no cubre `*.tgz` (`_obs_snapshot.tgz`, 7.5 MB). Decidir antes del primer commit.
3. El Project de claude.ai está **desfasado** respecto a esta carpeta y **por encima de su límite de conocimiento**. Ver `ESTADO_SINCRONIZACION.md` (actualización del 20 oct).

## Reglas que aplican a todo el repositorio
- Toda cifra publicada se rastrea hasta un notebook o un archivo de resultados; nunca nace en Word ni en la presentación.
- Cada afirmación se etiqueta como confirmada, probable o desconocida.
- Todo dato simulado se declara como tal.
- No se suben datos personales (ni seudonimizados), credenciales ni microdatos grandes. Se versiona el procedimiento para reconstruirlos.

## Historial de este archivo
- 21 sept 2026: versión con el estado al 21 sept (etapa de diseño desde el 18 sept, componente territorial en exploración, `ERP/` listada como carpeta). (El respaldo que se hizo en `_to_delete/` se borró junto con esa carpeta.)
- 20 oct 2026 (10:30): se agregó la fila de `DW/`.
- 20 oct 2026 (11:10): se rehizo el estado y la tabla según el inventario de la carpeta. Se quitó `ERP/` porque no existe. Se agregaron `Frontend/observatorio/`, `enut2024_participacion_laboral/`, `animaciones/`, `Claude outputs/`, `_to_delete/` y los archivos sueltos de la raíz.
- 20 oct 2026 (11:35): se borraron `_to_delete/` completa, las carpetas `__pycache__` y el proyecto C++ de 2015 de `Documentos/`.
- 21 oct 2026 (10:55): fila de `Backend/` actualizada (backend 0.1.0; bitácora del 21 oct, 10:55).
- 21 oct 2026 (22:30): orden de reproducción (ETL antes que `build_datos.py`) y filas de `DW/`, `Backend/` y Observatorio (bitácora del 21 oct, 22:30).
