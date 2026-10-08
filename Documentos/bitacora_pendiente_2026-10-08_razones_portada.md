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
