# Frontend — Relevo de cuidado por horas (prototipo móvil)

App en HTML/CSS/JS puro, sin build ni dependencias. Se presenta como app móvil (en escritorio, dentro de un marco de teléfono).

```bash
python -m http.server 8000   # desde Frontend/, o abrir index.html con doble clic
```

**Datos simulados.** Casos, personas de relevo, visitas, incidentes y respuestas semanales vienen de `seed()` en `js/data.js` y se guardan en `localStorage` (clave `care-relevo-v2`). No hay backend. Demuestran que el flujo funciona; **no validan la hipótesis ni miden impacto.** Las respuestas semanales de ejemplo se generan sin tendencia a propósito.

## Qué cambió (2026-10-08, opción C)

La app dejó de ser un buscador de cuidadoras ("encontrar a alguien") y ahora opera el **relevo por horas** para cuidadoras familiares de alta intensidad (hallazgo B) en beneficio de la persona cuidada (A).

| Antes | Ahora |
|---|---|
| Petición en texto libre + clasificador de reglas | Canalización por la institución con 3 preguntas: horas, ayuda en actividades básicas, daños |
| Matching por suma ponderada (habilidades, zona, turnos, tarifa) | Solo restricciones; se propone **una** persona, sin catálogo ni calificación |
| Contratación en jornada abierta, tarifa libre ≥ piso | Paquete de 3, 6, 9 o 12 h/sem, horario fijo, lista cerrada de tareas sin tareas clínicas |
| CURP y datos de salud de la familia al publicar | La institución valida identidad fuera de la app; la familia solo da alias |
| Piso = salario mínimo general ÷ 8 | Salario mínimo profesional de trabajo del hogar ÷ 8, 7.5 o 7 según la jornada (como el script 15) |
| Sin seguimiento | Llegada y salida, ausencias, incidentes en ambos sentidos, 2 preguntas semanales y KPI operativos |
| Red del hogar y territorio | **Se quedan**, con el relevo asignado como nodo |

**Se eliminaron** `js/clasificador.js` y `js/matching.js` (pertenecían a la hipótesis de "encontrar cuidadora", descartada el 22 sept). Siguen en el historial de Git.

## Pestañas
1. **Necesito** — casos canalizados en tres vistas (lista, tarjetas, mosaico). Cada caso muestra quién cuida a quién (ícono de mujer u hombre), horas, ABVD, alcaldía, paquete, costo al mes y relevo. Al tocarlo se abre el detalle con costo, pagador, historial, fragilidad, tareas y la tasa de la ENASIC.
2. **Puedo cuidar** — personas de relevo con certificación, disponibilidad y cupo. Registro con CURP, identificación, carta de no antecedentes y referencia; pasa a revisión. Sin certificación vigente no recibe asignaciones.
3. **Seguimiento** — *Visitas* del día (llegó, salió, no llegó, canceló); *Caso*: red del hogar (apagar un nodo), dos preguntas semanales e incidentes; *Mapa* por alcaldía; *KPI* marcados SIMULADO con exportación de agregados.
4. **Ajustes** — distancia máxima, factor de prestaciones, parámetros con su fuente, marco legal y datos.

Las confirmaciones usan diálogos propios (no `confirm()`/`prompt()`) y "Exportar" muestra el JSON para copiar, para que también funcione como artefacto.

## Reglas y de dónde salen

| Regla | Valor | Fuente |
|---|---|---|
| Focalización | ≥ 40 h/sem; con ayuda en actividades básicas = Prioridad 1 | Notebook 11: el modelo no supera a la regla de forma demostrable (+2.2 pp, IC 90 % −4.1 a 8.5) |
| Tasas de daño mostradas | 79.6 %, 70.5 %, 54.9 %, 42.6 % | `resultados/07_enasic_necesidad_vs_norma_estimaciones.csv`, bloque `5_danos_entre_sin_necesidad`. Nacionales, entre quienes no buscaron servicios por "no necesitarlos" |
| Casos bajo 40 h | Se registran "fuera de la regla"; la institución puede incluirlos con motivo escrito | Criterio del programa; las excepciones se cuentan en los KPI |
| Salario diario | $342.47 | CONASAMI, DOF 09-dic-2025 (igual que el script 15). **Por verificar vigencia** |
| Tipo de jornada | Diurna 06-20 h; nocturna 20-06 h o ≥ 3.5 h nocturnas; si no, mixta. Máx. 8, 7 y 7.5 h por visita | LFT arts. 60-61, igual que el script 15. **Por verificar con el DOF (Daniel)** |
| Semanas por mes | 4.33 | Mismo supuesto que el script 10 |
| Prestaciones | 0 % por defecto (sin prestaciones); ajustable | **Por definir con Daniel** |
| Cercanía | ≤ 12 km entre centros de alcaldía (ajustable) | Aproximación del prototipo: no se guardan domicilios |
| Asignación | Aprobada, certificada, cerca, disponible esos días y horas, con cupo, cubre las tareas. Gana la más cercana; empate → menor carga | Definición del prototipo |

## KPI operativos (pestaña Indicadores)
Casos canalizados y % dentro de la regla · incluidos por criterio · mediana de días de canalización a asignación · casos en espera · horas entregadas / programadas (28 días) · puntualidad (≤ 10 min) · ausencias · incidentes por 100 h · continuidad a 4 semanas (activo y sin cambio de relevo) · % de respuesta semanal · cansancio promedio · personas certificadas / aprobadas · cupo libre.

El JSON exportado (`operacion_agregados_SIMULADO.json`) trae solo totales: sin folios, alias, alcaldías ni fechas por caso. Es la entrada prevista para una pestaña "Operación" del Observatorio. Con el piloto, los registros por caso se quedan en la institución.

## Protección de datos
- La familia no captura CURP ni nombre completo: la institución valida identidad y legitimación fuera de la app.
- Ayuda en actividades básicas y daños a la salud son datos sensibles: la canalización exige consentimiento expreso.
- "Exportar todo" (Ajustes) incluye alias y respuestas sobre salud. Con datos reales, ese archivo no sale de la institución.
- Qué ley aplica (particulares o sujetos obligados) depende de la institución receptora y de la reforma de 2025: **pendiente con Daniel**.

## Lo que la app no resuelve
- **Quién paga.** La app muestra el costo y lo que le toca a la familia, pero la fuente del subsidio no existe todavía.
- **La oferta.** Si la certificación es el cuello de botella, la app lo hace visible (personas aprobadas sin certificación, casos sin propuesta), no lo resuelve.
- **El efecto.** Las 2 preguntas semanales no son un instrumento validado y no hay grupo de comparación. La escala corta de Zarit es candidata; su validación en México está por confirmar.

## Archivos
`index.html` · `css/app.css` · `js/data.js` (catálogos, datos simulados, almacenamiento) · `js/legal.js` (parámetros legales y requisitos) · `js/relevo.js` (focalización, paquetes, jornada, costo, asignación) · `js/red.js` (red del hogar) · `js/app.js` (interfaz) · `js/cdmx-alcaldias.js` (límites de alcaldías) · `vendor/d3.min.js` (d3 7.9.0).

**Fuente de los límites:** INEGI, Marco Geoestadístico 2020, publicado en el Portal de Datos Abiertos de la CDMX (https://datos.cdmx.gob.mx/dataset/alcaldias). Simplificados para visualización.
