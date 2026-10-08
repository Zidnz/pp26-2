# Frontend — Observatorio del cuidado (prototipo móvil)

App en HTML/CSS/JS puro, sin build ni dependencias. Se presenta como app móvil (en escritorio se muestra dentro de un marco de teléfono).

```bash
python -m http.server 8000   # desde Frontend/, o abrir index.html con doble clic
```

**Datos sintéticos.** Todo es prototipo: los datos de ejemplo están en `js/data.js` y se guardan en `localStorage` (clave `care-match-v2`). No hay backend.

## Pestañas
1. **Peticiones (publicaciones)** — bandeja de peticiones en texto libre. "+ Nueva" abre el **clasificador**: se pega la petición, se clasifica y se rellena la publicación (tipo de cuidado, necesidades, turnos, zona, urgencia, persona a cuidar). Muestra categorías con puntaje, la *necesidad no declarada*, derivaciones sugeridas y la evidencia resaltada en el texto. Las peticiones que no son de cuidado (p. ej. una fuga de agua) no se publican.
2. **Contratar** — profesionales ordenados por compatibilidad con la petición elegida (que hereda la clasificación y la señal). Cada tarjeta muestra cómo cambiaría la fragilidad del hogar y las horas sin cubrir si se contrata a esa persona.
3. **Redes** — red de cuidado del hogar de una petición (quién sostiene a quién, horas por semana). *Apagar nodo* simula que una persona falta una semana; sub-pestaña *Territorio* con un **mapa vectorial de la CDMX** (límites oficiales de las 16 alcaldías, dibujados con d3, con zoom y arrastre; funciona sin internet) y un punto por hogar coloreado por fragilidad; los puntos se ubican en el centro de cada alcaldía, no en domicilios. Al contratar, el profesional aparece en el grafo como relevo.
4. **Ajustes** — pesos de compatibilidad, umbral, distancia máxima, horas por turno, exportar/importar JSON, restaurar/borrar datos.

## Filtros legales (`js/legal.js`)
Crear una petición, registrar un profesional o contratar ya no es un formulario libre:
1. **Petición** — *filtro de admisión* previo (mayor de 18, relación con la persona a cuidar, descarte de emergencias → 911), luego requisitos: CURP válida (formato y dígito verificador) de mayor de edad, acreditar patria potestad/tutela/autorización cuando aplica (o si la persona a cuidar es menor), presupuesto ≥ piso de salario mínimo, compromiso de contrato escrito e IMSS, aviso de privacidad, consentimiento de datos de salud y protesta de veracidad. Máximo 2 peticiones activas por CURP.
2. **Profesional** — CURP única y de mayor de edad, documento de identidad, carta de no antecedentes (< 90 días), una referencia, tarifa ≥ piso, aceptación de contrato e IMSS; enfermería exige cédula profesional (7-8 dígitos) y ejercer dentro de su alcance. Ya no se le asigna una calificación inventada.
3. **Revisión** — ambos quedan *en revisión* y no aparecen en Contratar, Redes ni Territorio hasta que se aprueban (Ajustes → Revisión de solicitudes; el rol de revisión está simulado). Rechazar exige motivo.
4. **Contratación** — diálogo de formalización: tarifa pactada ≥ piso, modalidad (de planta / entrada por salida) y confirmación de contrato escrito, IMSS y descansos. `store.hire` rechaza registros no aprobados o sin formalización.

Las referencias normativas (LFT, Ley del Seguro Social, LFPDPPP, Ley General de Salud, Código Civil) están en `Care.legal.MARCO` y se listan en Ajustes. **Son orientativas: confirmar artículos y vigencia con el texto oficial.** El piso de $39.39/h sale de un salario mínimo diario de referencia (315.04) ÷ 8 h; verificar el vigente en CONASAMI. Edad mínima 18, vigencia de 90 días de la carta y tope de 2 peticiones son criterios de la plataforma, no ley.

**Límite real:** sin backend, los filtros viven en la interfaz y `localStorage` (y el JSON importado puede saltárselos). Verificar identidad y documentos de verdad exige servidor y una revisión humana o un servicio de validación. Registros anteriores a estos filtros (datos de ejemplo) se marcan como `precargado` y aprobados.

## Cómo se conecta
`texto → clasificador → publicación (+ hogar) → matching → contratación → red del hogar`

## Definiciones propias del prototipo (no vienen de una fuente externa)
- **Clasificador** (`js/clasificador.js`): reglas de palabras clave y expresiones regulares. Los puntajes son heurísticos, **no** un modelo entrenado. Las derivaciones son categorías generales, sin verificar disponibilidad.
- **Compatibilidad** (`js/matching.js`): perfil y tipo de cuidado son restricciones duras; después, suma ponderada de habilidades, cercanía (distancia entre alcaldías), turnos y tarifa.
- **Fragilidad del hogar** (`js/red.js`): mayor proporción de las horas de cuidado del hogar que aporta una sola persona (1.0 = un solo sostén). Al apagar un nodo, "sin cuidado" = personas que se quedan con 0 horas; "parcial" = pierden horas pero conservan algo.
- **Horas por turno**: un profesional aporta `horasTurno` (por defecto 15) horas por semana por cada turno que cubre; es un supuesto ajustable.

## Archivos
`index.html` · `css/app.css` · `js/data.js` (catálogos, datos, almacenamiento) · `js/matching.js` · `js/clasificador.js` · `js/red.js` (análisis y SVG del hogar) · `js/app.js` (interfaz) · `js/cdmx-alcaldias.js` (límites simplificados de las alcaldías) · `vendor/d3.min.js` (d3 7.9.0).

**Fuente de los límites:** INEGI, Marco Geoestadístico 2020, publicado en el Portal de Datos Abiertos de la CDMX (https://datos.cdmx.gob.mx/dataset/alcaldias). Simplificados para visualización.

> Pendiente: la nota previa sobre si la demo de `ERP/` migra aquí sigue abierta; esta app es independiente de ella.
