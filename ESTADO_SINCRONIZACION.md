# Estado de sincronización de la carpeta — 21 sept 2026 (actualizado 10:30)

La carpeta local estaba al día hasta el 18 de septiembre. Lo producido del 14 al 20 de septiembre existía solo en los chats. El 21 de septiembre se **recuperó de las transcripciones**: código, CSV y notebooks, extraídos de forma automática, no reescritos a mano.

## Recuperado y verificado
| Archivo | Estado |
|---|---|
| `Analysis/02_capacidad_residencial_vs_poblacion.ipynb` | **Ejecutado de nuevo el 21 sept.** Reproduce la bitácora: Iztapalapa QL = 0.05; 1.24 plazas por 1,000 personas ADL; Miguel Hidalgo 125. |
| `Analysis/resultados/02_indice_capacidad_residencial.csv`, `02_fichas_fuentes.csv` | Regenerados por el notebook 02. |
| `Analysis/datos/` (5 CSV del proyecto + `enasic_2022_cifras_presentacion.csv`) | Insumos del notebook 02. El CSV de la ENASIC tiene 35 cifras con su lámina o página (incluye las 2 del comunicado 578/23, p. 14). |
| `Analysis/matrices/` | Matriz de tipología, pares e inventario de 18 fuentes + 2 documentos internos (14 sept); F19 (Colmex) agregada el 22 sept. |
| `Analysis/01_denue_oferta_cuidado.ipynb` | **Ejecutado de nuevo el 22 sept** con DENUE 05_2026 (`Data/raw/`). Reproduce la bitácora del 20 sept (235 establecimientos, 49 dudosos, Spearman 0.27). Regeneró `Analysis/outputs/`. |
| `Analysis/reproduccion_colmex_2026-09-22/` | Nuevo (22 sept). Cuadro 2.2 de Colmex reproducido con DENUE 05_2025 (48/48 celdas). |

## Recuperado, pero sin ejecutar (faltan los datos crudos)
| Archivo | Qué necesita para correr |
|---|---|
| `Analysis/03_enasic_barreras_uso_servicios.ipynb` | Microdatos ENASIC 2022 descomprimidos en `Analysis/datos/enasic/` (38 MB, no se suben). Genera `03_enasic_barreras_estimaciones.csv` y `03_precio_vs_ingreso_muestra.csv`. |
| `Analysis/etoe/etoe_cuidados.py` | Microdatos ETOE 2020 abril–junio (cpv2020, DBF). Ver su README. |
| `Documentos/generar_valores.py` + `build_replanteamiento.js` | Primero el notebook 03. Después, desde `Analysis/`: `python ../Documentos/generar_valores.py` y `node ../Documentos/build_replanteamiento.js` (requiere `npm install docx`). Regenera `Replanteamiento_problema_programa_v0.1.docx`. |

Desde aquí no se pudo descargar nada del INEGI: el sitio está bloqueado tanto en el entorno de Claude como en el puente con esta computadora. Si ya tienes esos archivos en `Descargas`, colócalos en esas rutas y ejecuta los notebooks.

**Actualización del 22 sept:** el notebook 01 ya se ejecutó y sus cifras están respaldadas por `Analysis/outputs/`. **Las del notebook 03 (3.0%, 0.9%, 58%, 40%, 53%, etc.) siguen respaldadas solo por la bitácora, hasta que se ejecute con los microdatos de la ENASIC.**

## Reemplazado (se conserva por historia)
- `Analysis/oferta_demanda_v0_2026-09-14/`: especificación y script previos al DENUE; los reemplaza el notebook 01.

## No recuperable
- Resultados de los notebooks 01 y 03 y de la ETOE: se regeneran al ejecutar.
- La presentación de avance de 14 láminas es un artefacto de diapositivas en claude.ai, no un archivo.

## Pendientes de repositorio
1. `.git`: sigue sin existir en `Downloads\pp26-2` (pendiente desde el 17 sept). Opciones: copiar a mano la carpeta `.git` desde `Documents\Proyecto-Prototípico-2026\`, o `git clone https://github.com/Zidnz/Proyecto-Protot-pico-2026.git` y mover el contenido.
2. Borrar `Documents\Proyecto-Prototípico-2026\` después de confirmar el punto 1.
3. Agregar `Data/raw/`, `Analysis/datos/enasic/`, `denue_09_*.zip` y `__pycache__/` al `.gitignore` antes del primer commit.
4. Hay CSV duplicados a propósito: `Analysis/datos/` y `Data/ref/` son copias de `Data/investigacion/`, porque así los leen los notebooks 01 y 02. Si se unifican las rutas, hay que editar ambos notebooks.

## Corrección del 22 sept (08:35): pendientes de repositorio 1 y 2
`Zidnz/Proyecto-Protot-pico-2026` es el repositorio de **MILPÍN**, y el `.git` de `Documents\Proyecto-Protot-pico-2026\` (20 abr 2026) apunta a él. **No se debe copiar ese `.git` ni clonar ese repositorio para el Observatorio.** El Observatorio necesita un repositorio nuevo.
Tampoco hay que borrar `Documents\Proyecto-Protot-pico-2026\` hasta revisar qué tiene fuera de `.git`.
El punto 3 ya está hecho: existe `.gitignore` en la raíz. Ver la bitácora del 22 sept (08:35).

## Actualización del 22 sept (tarde): notebook 03 resuelto
- `Analysis/03_enasic_barreras_uso_servicios.ipynb` quedó reemplazado por la versión **ejecutada** con microdatos.
- Sus resultados ya están en `Analysis/resultados/`: `03_enasic_barreras_estimaciones.csv` y `03_precio_vs_ingreso_muestra.csv`.
- Los microdatos ENASIC están en `Analysis/datos/enasic/` (verificados: 1,266 archivos) y el zip original en `Analysis/datos/`. Ambos están ignorados por git.
- El `Documentos/Replanteamiento_problema_programa_v0.1.docx` y su `_valores.json` ya están en la carpeta.
- Pendiente solo si se quiere regenerar el .docx desde cero: `npm install docx` y correr `node Documentos/build_replanteamiento.js`.

## Actualización del 6 oct 2026: análisis 10 y 11 bajados del proyecto
Los análisis del 5–6 oct existían solo en el proyecto de claude.ai. Se bajaron a la carpeta y se **ejecutaron de nuevo aquí** con los microdatos ENASIC locales.

| Archivo | Estado |
|---|---|
| `Analysis/10_asequibilidad_relevo_horas.py` | Copiado del proyecto y ejecutado. Regeneró `resultados/10_asequibilidad_relevo.csv`, idéntico al del proyecto (incluye el control de 40 h del script 04). |
| `Analysis/11_modelo_focalizacion_cuidadoras.ipynb` | Reconstruido con las mismas celdas que la versión del proyecto y ejecutado con `nbconvert` (scikit-learn 1.7.2). Las métricas globales, por grupo, de sensibilidad y los coeficientes coinciden con las del proyecto hasta el tercer decimal. |
| `Analysis/resultados/11_modelo_focalizacion_{global,por_grupo,sensibilidad}.csv`, `11_modelo_coeficientes_logit.csv` | Regenerados por el notebook 11. |
| `Analysis/figuras/f10_cobertura_por_grupo_modelo.png` | Regenerada por el notebook 11 (no estaba en el proyecto como archivo). |

**Pendiente.**
1. La bitácora (`Documentos/bitacora-decisiones.md`) no registra la decisión del **5 oct 2026 (programa opción C: relevo por horas)** que citan los análisis 10 y 11. Hay que agregar la entrada con su fecha, sus motivos y quién la tomó.
2. El notebook 11 termina con "Pendiente de doble revisión": falta asignar quién lo revisa.
3. `_to_delete/_build_nb11.py` fue un auxiliar para reconstruir el notebook; se puede borrar.

## Actualización del 20 oct 2026 (11:15): inventario de la carpeta contra los documentos

Se listó la carpeta completa y se comparó con los README, la bitácora y el Project de claude.ai. Las secciones anteriores de este archivo se dejan tal cual, por la regla de historia real. Varias rutas que mencionan ya no existen:

| Mencionado arriba | Dónde está hoy |
|---|---|
| `Analysis/01_…`, `02_…`, `03_…`, `11_…ipynb` y `10_…py` | Dentro de los notebooks A, B y C (fusión del 7 oct). Los originales están en `_to_delete/notebooks_separados_2026-10-07/` y `_to_delete/scripts_py_convertidos_0710/` |
| `_to_delete/_build_nb11.py` («se puede borrar») | Sigue ahí |
| Pendiente «agregar la decisión del 5 oct a la bitácora» | Resuelto: la entrada existe (2026-10-05, 22:31) |

**Sigue igual desde el 22 sept:** no hay `.git` en `Downloads\pp26-2`.

**El Project de claude.ai (PP 26-2) está desfasado respecto a la carpeta:**
- Sus documentos de texto son copias del 1 al 6 oct: `README.md`, `ESTADO_SINCRONIZACION.md`, `Analysis/README.md`, `ML/README.md`, `Frontend/README.md`, `Frontend/observatorio/README.md`, `index.html`, `build_datos.py`, `datos_observatorio.json` y `bitacora-decisiones.md` (la del 1 oct; la de la carpeta tiene 1,704 líneas y llega al 20 oct).
- Todavía muestra archivos que en la carpeta ya no existen en esa ruta: `Frontend/js/clasificador.js`, `matching.js`, `Frontend/observatorio/plantilla.html` y los scripts y notebooks sueltos 01 a 14.
- Al revés: `15_anuncios_pago_implicito.py`, `resultados/15_*.csv`, `matrices/anuncios_cuidado_redes.csv` y `bitacora_pendiente_2026-10-06_anuncios.md` están **solo en el Project**.
- El 20 oct, entre las 10:31 y las 10:35 h, se subieron al Project resultados, marts del DW y **microdatos y catálogos de la ENASIC** (`conjunto_de_datos_*.csv`). La carga se cortó en `tpob_cui/catalogos/p6_14_09.csv`. Con eso el Project quedó en **2,032,330 de 2,000,000** de conocimiento: por encima del límite. Los microdatos ENASIC son públicos y anónimos, pero la regla del repositorio es no subirlos, y además llenan el Project con catálogos de «1 = Sí / 2 = No» que no aportan contexto.

**Pendientes (los decide el equipo; no se ejecutó nada):**
1. Quitar del Project los microdatos y catálogos ENASIC para volver a quedar bajo el límite. Quitarlos es irreversible para el Project, aunque los archivos siguen en la carpeta.
2. ~~Reemplazar en el Project los README y la bitácora por las versiones de la carpeta.~~ **Hecho el 20 oct (11:20)** con 7 documentos: `README.md`, este archivo, `Analysis/README.md`, `ML/README.md`, `Documentos/README.md`, `Frontend/README.md` y `bitacora-decisiones.md`. Faltan `Frontend/observatorio/README.md`, `index.html`, `build_datos.py` y `datos_observatorio.json`, que siguen en su versión del 1 oct. Queda por decidir si los obsoletos (`clasificador.js`, scripts 01–14) siguen en el Project.
3. Decidir si la sección 15 (anuncios) se baja a la carpeta o se abandona; hoy ningún notebook la reproduce.
4. Crear el repositorio git nuevo del Observatorio y, antes del primer commit, agregar `_to_delete/` y `*.tgz` al `.gitignore`.

## Actualización del 20 oct 2026 (11:35): limpieza

- **Project de claude.ai:** se borraron 20 documentos obsoletos: `d3.min.js`, los `datos_observatorio.json`, `index.html` y `plantilla.html` viejos del Observatorio, `clasificador.js`, `matching.js`, los scripts y notebooks sueltos 01 a 14 y los 2 metadatos ENASIC. El conocimiento bajó de 2,064,633 a **1,257,738 de 2,000,000**. La sección 15 (anuncios) se conservó. Los catálogos y microdatos ENASIC (archivos subidos) siguen ahí: hay que quitarlos a mano en claude.ai.
- **Carpeta:** se borraron `_to_delete/` completa (217 MB, con todos los respaldos `backup_pre_*`), las 3 carpetas `__pycache__` y el proyecto C++ de 2015 de `Documentos/`. La tabla de las 11:15 y el pendiente 4 que mencionan `_to_delete/` quedan superados. **No se borró:** `denue_09_0525_csv.zip` (lo usa la reproducción de Colmex), `denue_09_csv.zip`, `_obs_snapshot.tgz`, `app_matching_relevo_frontend.zip`, `Claude outputs/` ni las versiones superadas de Word.
