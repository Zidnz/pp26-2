# Bitácora · 2026-10-08 · Portada del Observatorio: «razones vivas»

**Archivos:** Frontend/observatorio/js/vistas/inicio.js · Frontend/observatorio/css/vistas.css
**Respaldo:** _to_delete/backup_pre_razones_vivas_2026-10-08/
**Estado:** pendiente de doble revisión (quien revisa ≠ quien produjo)

## Cambio de presentación
Las cuatro razones del bloque «Los datos que cuidan» pasan de tarjetas de texto a tarjetas con cifra animada,
micrográfica dibujada con la misma cifra, IC 90 %, n y precisión, y botón a la pestaña de evidencia.
Las cifras siguen saliendo de datos_observatorio.json (build_datos.py); ninguna se escribe a mano.

## Cambios de texto (y motivo)
| Tarjeta | Antes | Ahora | Motivo |
|---|---|---|---|
| 03 | «Un precio que sí se puede pagar» / «66.2 % de los hogares podría pagarlo» | «Por horas, el precio cabe» / «gastaría ≤ 20 % de su ingreso en 6 h/semana» | El script 10 mide costo ≤ 20 % del ingreso, no capacidad ni disposición a pagar; universo = hogares con necesidad de cuidado, nacional, sin varianza de diseño. |
| 04 | «Una app que organiza, no que busca» / «Falta organizar, no informar» | «Informar no basta» / «Un directorio no resuelve el problema» | Que 0.9 % no busque por desconocimiento no demuestra que la barrera sea de organización; la razón dominante es «no tuvo necesidad» (67.3 %). La conclusión «falta organizar» no tiene respaldo en los datos. |
| 02 | «relevo por horas, no reemplazo» como conclusión | «Nuestra lectura: relevo por horas…» | Es inferencia de diseño del equipo, no resultado de la encuesta. |

## Pendiente
- Tarjeta 04 usa el universo de todas las personas cuidadoras (n = 5,492), no el grupo foco del bloque
  (discapacidad o 60+: «no saben que existen» = 1.6 %, precisión baja, n = 1,019). Decidir cuál se publica.

---

# Bitácora · 2026-10-08 (10:50) · Quitar duplicados en Inicio y «¿Por qué no se contrata?»

**Respaldo:** _to_delete/backup_pre_dedup_2026-10-08/ (index.html, inicio.js, segmentacion.js, vistas.css)
**Estado:** pendiente de doble revisión

| Cambio | Motivo |
|---|---|
| Inicio: se quitó el marco «Lo que encontramos» (4 tarjetas + escena 3D) | Repetía 3 de las 4 razones del bloque «Los datos que cuidan» (70.5 %, desconocimiento, 66.2 % / 5.3 %), incluso con la misma metáfora visual. |
| Inicio: el resultado del modelo (+2.2 pp, IC 90 % −4.1 a +8.5) pasa como franja al final del embudo | Era lo único que «Lo que encontramos» aportaba. |
| Razón 04 pasa al grupo foco (R.obj): 1.6 % «no saben que existen» (precisión baja; IC hasta 2.6 %) y 49.4 % «no tuvo necesidad» | Antes usaba a todas las cuidadoras (0.9 % y 67.3 %) y no coincidía con la pestaña. Resuelve el pendiente anterior. |
| «¿Por qué no se contrata?»: se quitó la fila de cajas (#segTiles-bar) | Tres de sus cuatro indicadores ya estaban en «Comparar segmentos» y el 82.3 % aparecía tres veces en la pestaña. |
| «¿Quién lo carga?»: sin cambios | Decisión del usuario. |

## Pendiente
- Con la fila de cajas se fue «Buscó un servicio de cuidado» (2.5 %, precisión baja). No aparece en otra parte de la pestaña. Decidir si se recupera (p. ej., en el semáforo) o si basta con que no cuente como evidencia por su precisión.
- La escena 3D de «Lo que encontramos» sigue en inicio-3d.js; ya no se ejecuta (no hay lienzo). Se puede borrar en una limpieza posterior.

---

# Bitácora · 2026-10-08 (11:05) · Razones de portada: mismo tamaño y menos texto

**Respaldo:** _to_delete/backup_pre_razones_compactas_2026-10-08/ · **Estado:** pendiente de doble revisión
- Las cuatro tarjetas miden lo mismo (rejilla con filas 1fr y gráficas de 220 × 84).
- El texto de cada tarjeta baja a un título y una línea; cada gráfica lleva en su primera línea qué mide.
- Las notas metodológicas (universo, prestaciones, «no implica que contraten», precisión baja) pasan a la nota emergente del pie, sin cambiar su contenido.
- Títulos nuevos: 01 «El daño crece con las horas» y 02 «Cuidar sigue siendo de la familia». Los de 03 y 04 no cambian.
