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
