# Observatorio del Cuidado en Power BI

Versión en Power BI del Observatorio (`Frontend/observatorio`), tablero de la UCA Inteligencia de Negocios.
Replica las pestañas **Inicio, ¿Quién lo carga?, ¿Por qué no se contrata?, ¿Cuánto cuesta?, ¿A quién primero?
y ¿Dónde?**. Indicadores y Método se quedan en el HTML.

## Cómo se construye (reproducible)

1. `python PowerBI/exportar_datos_pbi.py` — aplana `Frontend/observatorio/datos_observatorio.json` en
   `PowerBI/datos/*.csv`. No calcula cifras nuevas: solo cambia la forma de las tablas.
2. `python PowerBI/generar_pbip.py ["C:\ruta\a\PowerBI\datos\"]` — escribe el modelo (TMDL) y las páginas (PBIR).
   Ejecutar con Power BI Desktop cerrado (o pulsar «Aplicar cambios externos» al volver).
3. Abrir `Observatorio_Cuidado.pbip` en Power BI Desktop y pulsar **Actualizar**.

Si la carpeta del proyecto está en otra ruta, cambiar el parámetro **RutaDatos**
(Transformar datos → Parámetros) o pasar la ruta al generador. Debe terminar en `\`.

## Trazabilidad

`build_datos.py` (Analysis/resultados → JSON) → `exportar_datos_pbi.py` (JSON → CSV) → `generar_pbip.py`
(CSV → modelo y páginas). Cada CSV conserva la columna `fuente` cuando el JSON la trae. Los textos con
cifras de cada página se calculan desde el JSON en `generar_pbip.py`; ninguna cifra se escribe a mano.
Si cambia un resultado, se vuelven a correr `build_datos.py` y los dos scripts.

## Diferencias con el HTML

- Los intervalos de confianza al 90 %, el n y la precisión están en la descripción emergente (tooltip) de
  cada barra, no dibujados como bigotes. Las barras de precisión baja salen en color claro.
- Sin mapas: los visuales de mapa de Power BI dependen de servicios en línea o de una función en vista previa.
  Las capas por alcaldía y por entidad se muestran como barras ordenadas y tabla.
- No hay datos personales ni simulados: solo agregados ya publicados en el HTML.

## Cambio del 21 oct 2026 (revisión en Power BI Desktop)
Se abrió el .pbip, se actualizó y se revisaron las seis páginas. Correcciones de presentación (no cambia ninguna cifra):
- Subtítulos automáticos en inglés («Medida by columna») apagados cuando el visual no tiene subtítulo propio.
- Encabezados, ejes y leyendas con nombres legibles (`NOMBRES` en `generar_pbip.py`): «Algún daño» en vez de
  `DANO_ALGUNO`, «Tipo de zona» en vez de `tipo_txt`, etc. `exportar_datos_pbi.py` agrega `objetivo_txt` a
  `modelo_por_horas` y `modelo_obj_grupo` (misma etiqueta que la tabla `objetivos`).
- Tarjetas de «¿A quién primero?» y «Solicitud 2026» ya no recortan la cifra.
- `.pbi/cache.abf` (caché de datos que crea Power BI al guardar) no se versiona: ver `.gitignore`.
