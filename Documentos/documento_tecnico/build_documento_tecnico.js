// Construye Observatorio_Cuidado_Documento_Tecnico_v1.docx (v1.0 · 14 oct 2026)
// Observatorio de Datos para la Economía del Cuidado · LCDN 7.º semestre · UNRC · PP 26-2 · Equipo 3
// Formato: el mismo de Observatorio_Cuidado_Guia_Tablero_v1.docx (portada a página completa, Arial, encabezados lila).
// Ejecutar desde Documentos/documento_tecnico/:  node build_documento_tecnico.js  (requiere npm install docx)
// El índice es un campo de Word: se llena al abrir (Word pide actualizar). La versión entregada lo trae ya lleno con LibreOffice.
// Las figuras se generan de src/*.html con Playwright a 1400 px y escala 2 (f5 es una captura anotada de la página).
// Los conteos (gráficas, bloques, archivos, bytes) se midieron sobre la carpeta local el 14 oct 2026; ver sección 8.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, Header, Footer, PageNumber, LevelFormat,
  TableOfContents, PageBreak,
} = require('docx');

const FIG = path.join(__dirname, 'fig');
const W = 9360; // área de texto en DXA (6.5")
const INK = '2B3045', SHELL = '3F4760', ACC = '77689D', LAV = 'AA95D1', TEAL = '23806F', GRIS = '5D6278', HAIR = 'D9D6E4';
const F = 'Arial', MONO = 'Consolas';

// ── texto con **negritas** y `código` ──
function runs(t, base = {}) {
  return String(t).split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map((s) => {
    if (s.startsWith('**')) return new TextRun({ text: s.slice(2, -2), bold: true, font: F, color: base.color ?? INK, size: base.size ?? 21 });
    if (s.startsWith('`')) return new TextRun({ text: s.slice(1, -1), font: MONO, color: ACC, size: (base.size ?? 21) - 2 });
    return new TextRun({ text: s, font: F, color: base.color ?? INK, size: base.size ?? 21, italics: base.italics, bold: base.bold });
  });
}
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 140, line: 300 }, children: runs(t, o) });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const B = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'vin', level: lvl }, spacing: { after: 70, line: 290 }, children: runs(t) });
const N = (t) => new Paragraph({ numbering: { reference: 'num', level: 0 }, spacing: { after: 70, line: 290 }, children: runs(t) });
const esp = (n = 120) => new Paragraph({ spacing: { after: n }, children: [] });

const borde = { style: BorderStyle.SINGLE, size: 4, color: HAIR };
function T(enc, filas, pesos, o = {}) {
  const tot = pesos.reduce((a, b) => a + b, 0);
  const an = pesos.map((p) => Math.round(W * p / tot)); an[an.length - 1] += W - an.reduce((a, b) => a + b, 0);
  const celda = (txt, i, cab) => new TableCell({
    width: { size: an[i], type: WidthType.DXA },
    borders: { top: borde, bottom: borde, left: borde, right: borde },
    shading: { type: ShadingType.CLEAR, fill: cab ? SHELL : 'FFFFFF', color: 'auto' },
    margins: { top: cab ? 90 : 80, bottom: cab ? 90 : 80, left: 110, right: 110 },
    children: String(txt).split('\n').map((l) => new Paragraph({
      spacing: { after: 40, line: 260 },
      children: cab ? [new TextRun({ text: l, bold: true, color: 'FFFFFF', size: 17, font: F })]
        : runs(l, { size: 17, color: (i === 0 && o.col0 !== false) ? SHELL : INK, bold: (i === 0 && o.col0 !== false) }),
    })),
  });
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: an,
    rows: [new TableRow({ tableHeader: true, children: enc.map((e, i) => celda(e, i, true)) }),
      ...filas.map((f) => new TableRow({ cantSplit: true, children: f.map((c, i) => celda(c, i, false)) }))],
  });
}
const TONOS = { lav: [ACC, 'F4F2F9'], ambar: ['A9711A', 'FBF4E6'], alerta: ['C0435A', 'FBECEF'], menta: [TEAL, 'E9F6F2'] };
function CAJA(titulo, lineas, tono = 'lav') {
  const [c, fondo] = TONOS[tono];
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 30, color: c } },
      shading: { type: ShadingType.CLEAR, fill: fondo, color: 'auto' },
      margins: { top: 140, bottom: 140, left: 220, right: 200 },
      children: [new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: titulo.toUpperCase(), bold: true, color: c, size: 16, font: F })] }),
        ...lineas.map((l, i) => new Paragraph({ spacing: { after: i === lineas.length - 1 ? 0 : 70, line: 290 }, children: runs(l, { size: 20 }) }))],
    })] })],
  });
}
function CODIGO(lineas) {
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      borders: { top: borde, bottom: borde, left: borde, right: borde },
      shading: { type: ShadingType.CLEAR, fill: '2D3347', color: 'auto' },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: lineas.map((l) => new Paragraph({ spacing: { after: 0, line: 260 }, children: [new TextRun({ text: l || ' ', font: MONO, size: 17, color: 'F4F2F9' })] })),
    })] })],
  });
}
let nfig = 0;
function FIGURA(arch, texto, ancho = 624) {
  nfig += 1;
  const buf = fs.readFileSync(path.join(FIG, arch));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, keepNext: true,
      children: [new ImageRun({ data: buf, type: 'png', transformation: { width: ancho, height: Math.round(ancho * h / w) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 220 },
      children: [new TextRun({ text: `Figura ${nfig}. ${texto}`, italics: true, color: GRIS, size: 17, font: F })] }),
  ];
}

// ════════════════════════════ CONTENIDO ════════════════════════════
const C = [];
const add = (...x) => x.flat().forEach((e) => C.push(e));

// Control del documento
add(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Control del documento', bold: true, color: SHELL, size: 30, font: F })] }));
add(T(['Campo', 'Valor'], [
  ['Documento', 'Documento técnico — Observatorio del Cuidado'],
  ['Versión', '1.0 · 14 de octubre de 2026'],
  ['Objeto descrito', '`Frontend/observatorio/` (index.html, css/, js/, build_datos.py) en la versión vigente del 14 oct 2026, después de la tarjeta «Cada modelo responde a una decisión» y del cambio de colores de «¿Cuánto cuesta?».'],
  ['Relación con otros documentos', 'Complementa la **Guía del tablero v1.0** (9 oct 2026): la guía explica qué dice cada gráfica y por qué se eligió; este documento explica con qué está hecha, cómo se conecta cada pieza y cómo se reproduce.'],
  ['Proyecto', 'Proyecto prototípico 7.º semestre LCDN · Equipo 3 · PP 26-2'],
  ['Elaboró', 'Omar Gutiérrez Escoto (líder de proyecto)'],
  ['Revisa', 'Pendiente: Daniel Cureño Martínez o Alondra Danae Madrigal García (regla de doble revisión)'],
  ['Estado', 'Borrador para revisión. El Observatorio también está pendiente de doble revisión.'],
], [2.4, 6.96]));
add(esp(160));
add(CAJA('Cómo leer este documento', [
  'Las secciones 1 a 5 describen la construcción del sitio en capas: tecnologías, flujo de datos, conexión entre módulos y forma de dibujar las gráficas. La sección 6 recorre cada pestaña con sus tarjetas, el archivo que las dibuja y el bloque de datos que usan. La sección 7 lista los problemas técnicos encontrados al revisar el código.',
  'Todo lo que aquí se afirma se comprobó en el código de la carpeta local el 14 oct 2026; los conteos (gráficas, bloques, archivos, peso) se midieron abriendo la página en Chromium sin interfaz a 1440 px. Cuando un motivo de diseño no está escrito en el README ni en la bitácora, se marca como **inferido**.',
  'Las rutas son relativas a la raíz del proyecto (`pp26-2/`). Este documento no contiene hallazgos del análisis: las cifras que aparecen son ejemplos para explicar el mecanismo.',
]));
add(new Paragraph({ spacing: { before: 300, after: 160 }, children: [new TextRun({ text: 'Índice', bold: true, color: SHELL, size: 30, font: F })] }));
add(new TableOfContents('Índice', { hyperlink: true, headingStyleRange: '1-2' }));

// ───────────────────────── 1
add(H1('1. Resumen técnico'));
add(H2('1.1 Qué es, en una frase'));
add(P('El Observatorio es un **sitio estático de una sola página** con ocho pestañas. No tiene servidor, base de datos ni paso de compilación: se abre con doble clic en `index.html`. Sus datos los genera un script de Python (`build_datos.py`) a partir de los archivos de resultados de los notebooks, y **todas sus gráficas se dibujan en el navegador con JavaScript propio, como SVG**. Solo las escenas 3D de la portada usan una biblioteca externa (three.js).'));
add(H2('1.2 Ficha técnica'));
add(T(['Aspecto', 'Valor en la versión del 14 oct 2026'], [
  ['Tipo de aplicación', 'Sitio estático de una página (las ocho pestañas viven en el mismo HTML y se muestran u ocultan con CSS).'],
  ['Cómo se abre', 'Doble clic en `Frontend/observatorio/index.html` (protocolo file://). También funciona desde cualquier servidor estático.'],
  ['Lenguajes', 'Python 3 (preparación de datos), HTML5, CSS y JavaScript sin framework. Las vistas usan sintaxis ES5 (`var`, `function`); el motor 3D usa ES2015 (`const`, funciones flecha).'],
  ['Bibliotecas en la página', 'three.js r128 (licencia MIT), copiado en `vendor/three.min.js`, solo para las escenas 3D del Inicio. Ninguna biblioteca de gráficas.'],
  ['Bibliotecas en la construcción', '`build_datos.py`: pandas, json, math. `build_ilustraciones.py`: Pillow, numpy, scipy.ndimage.'],
  ['Bibliotecas del análisis (aguas arriba)', 'pandas, numpy, scipy, scikit-learn, geopandas, shapely; matplotlib solo para figuras de Word y PowerPoint.'],
  ['Gráficas', '36 contenedores de gráfica o mapa (`[data-chart]`): 6 en ¿Quién lo carga?, 5 en ¿Por qué no se contrata?, 5 en ¿Cuánto cuesta?, 8 en ¿A quién primero? y 12 en ¿Dónde? Además, cuatro micrográficas en el Inicio.'],
  ['Mapas', 'Tres niveles dibujados como SVG propio: 16 alcaldías, 32 entidades y 2,371 AGEB urbanas.'],
  ['Datos', 'Un objeto `D` con 41 bloques (≈ 644 KB en `js/datos/datos.js`), más tres archivos de contornos.'],
  ['Peso total que carga la página', '≈ 2.7 MB: datos 644 KB, ilustraciones 623 KB, three.js 603 KB, contornos de AGEB 433 KB; el resto es HTML, CSS y código propio.'],
  ['Conexión a internet', 'Solo para las tipografías (Google Fonts: Archivo y JetBrains Mono). Sin internet la página funciona con fuentes del sistema.'],
  ['Servidor y base de datos', 'Ninguno. La página no escribe ni envía datos.'],
  ['Pruebas', 'Manuales, en Chromium sin interfaz a 1440, 1280 y 390 px (según el README). No hay pruebas automatizadas.'],
  ['Control de versiones', 'La carpeta local tiene `.gitignore`, pero no tiene `.git`. La historia vive en `Documentos/bitacora-decisiones.md`, en el README del Observatorio y en los respaldos de `_to_delete/`.'],
], [2.6, 6.76]));
add(esp(160));
add(CAJA('Decisión de arquitectura que explica casi todo lo demás', [
  'La página debe **abrir con doble clic, sin servidor** (README del Observatorio, sección «Reglas»). En modo file:// el navegador bloquea `fetch` e `import`. Por eso: (1) los datos se entregan como scripts `.js` que declaran variables globales, no como `.json`; (2) los módulos son scripts clásicos que se cargan en un orden fijo; (3) three.js está copiado en `vendor/` y no se pide a un CDN; (4) las ilustraciones van en data URI, porque WebGL tampoco lee imágenes locales con file://.',
  '**Costo de la decisión:** el orden de las 29 etiquetas `<script>` hay que mantenerlo a mano, todo vive en variables globales y la página carga todos los datos aunque solo se vea una pestaña.',
]));
add(H2('1.3 Qué no se usó y por qué'));
add(T(['No se usó', 'Motivo', 'Fuente del motivo'], [
  ['Framework (React, Vue, Svelte)', 'Exige un paso de compilación o módulos ES, incompatibles con abrir por doble clic. El estado de la página es pequeño (una pestaña activa y un filtro).', 'README (file://); el tamaño del estado es inferido'],
  ['Biblioteca de gráficas (D3, Chart.js, Plotly)', 'Las gráficas necesitan convenciones propias: intervalos al 90 %, rayado de precisión baja, punto hueco, ▲▼ de significancia. Con SVG propio no hay dependencia y el estilo es uno solo. `Frontend/vendor/d3.min.js` existe, pero pertenece al prototipo de la app y el Observatorio no lo carga.', 'Inferido de `componentes.js`'],
  ['Imágenes PNG de matplotlib', 'Las gráficas cambian con filtros y selectores y tienen ficha de fuente. Una imagen fija no puede hacer ninguna de las dos cosas.', 'Inferido'],
  ['Backend o base de datos', 'El Observatorio solo publica agregados de microdatos públicos y no recibe datos. Las reglas de protección de datos del proyecto prohíben datos personales en archivos de trabajo.', 'Instrucciones del proyecto; README («Sin datos simulados ni personales»)'],
  ['Mapas web con teselas (Leaflet, Mapbox)', 'Las teselas se descargan de internet en cada vista, y la página debe funcionar sin servidor. Los contornos propios caben en archivos `.js`.', 'Inferido'],
], [2.2, 4.9, 2.2]));

// ───────────────────────── 2
add(H1('2. Arquitectura y flujo de datos'));
add(P('El sistema tiene tres capas y el dato viaja en un solo sentido: del análisis a la construcción y de la construcción a la página. La página nunca calcula una estimación estadística; solo lee cifras ya calculadas, las formatea y las dibuja.'));
add(FIGURA('f1.png', 'Las tres capas del Observatorio y las tecnologías de cada una.'));
add(H2('2.1 Capa 1: análisis reproducible'));
add(P('Los quince notebooks numerados se juntaron el 7 oct 2026 en cuatro notebooks (A a D). Cada sección conserva su número original y escribe los mismos archivos en `Analysis/resultados/`, así que una cifra citada como «script 07» se rastrea a la sección 07 del notebook B.'));
add(T(['Notebook o script', 'Secciones', 'Qué entrega al Observatorio', 'Pestañas que lo usan'], [
  ['A · oferta y territorio', '01, 02, 08, 09, 13, 17', 'DENUE por alcaldía, capacidad residencial, dependencia severa, pobreza 65+, rezago por AGEB, contexto de las 32 entidades', '¿Dónde?, ¿Quién lo carga? (horas por sexo), Método'],
  ['B · ENASIC cuidadoras', '03, 07, 12, 16, 11', 'Barreras, necesidad contra norma, segmentación (249 estimaciones), perfil del grupo, modelo de focalización', 'Inicio, ¿Quién lo carga?, ¿Por qué no se contrata?, ¿A quién primero?'],
  ['C · programa, asequibilidad y costo', '04, 05, 06, 10, 14', 'Pago observado, dimensionamiento CDMX, subsidio, asequibilidad con ENASIC y con ENIGH', '¿Cuánto cuesta?, ¿Dónde? (escala)'],
  ['D · tipología territorial', '18', 'Tipos de AGEB, perfiles, decisión del piloto, validación y contornos', '¿Dónde? (parte 3), Método'],
  ['Script 19', '—', 'Costo de la hora por tipo de jornada', '¿Cuánto cuesta?'],
], [2.1, 1.3, 3.6, 2.4]));
add(esp());
add(P('Las estimaciones de encuestas usan un estimador escrito por el equipo (función `estimar` del notebook B): proporción ponderada con el factor de expansión de cada tabla, varianza por **linealización de Taylor** con estratos `EST_DIS` y conglomerados `UPM_DIS`, intervalos al 90 % y criterios de coeficiente de variación del INEGI. No se usa una biblioteca de encuestas complejas. El modelo de focalización usa scikit-learn (regresión logística, gradient boosting y alternativas) y la tipología usa k-means de scikit-learn sobre nueve indicadores del Censo 2020.'));
add(H2('2.2 Capa 2: build_datos.py'));
add(P('Es el único puente entre el análisis y la página. Lee unos 60 archivos de `Analysis/resultados`, `Analysis/outputs` y `Analysis/matrices`, arma el diccionario `D` y escribe cinco archivos. Ninguna cifra se escribe a mano en este script: todas se leen de los CSV.'));
add(CODIGO(['# desde la raíz del proyecto, después de correr los notebooks', 'python Frontend/observatorio/build_datos.py']));
add(esp());
add(T(['Archivo que escribe', 'Variable global', 'Contenido', 'Tamaño'], [
  ['js/datos/datos.js', 'D', 'Los 41 bloques de datos (cifras, IC, precisión, fuentes, KPI, diccionario)', '644 KB'],
  ['js/datos/geo.js', 'GEO', 'Límites de las 16 alcaldías en longitud y latitud (copia de `Frontend/js/cdmx-alcaldias.js`)', '27 KB'],
  ['js/datos/geo-estados.js', 'GEO_EST', 'Trazos SVG esquemáticos de las 32 entidades, enlazados a la clave INEGI', '74 KB'],
  ['js/datos/geo-ageb.js', 'GEO_AGEB', 'Polígonos de AGEB y alcaldías ya proyectados a coordenadas SVG, y puntos de oferta del DENUE', '433 KB'],
  ['datos_observatorio.json', '—', 'Copia legible de D para revisión. **La página no la lee.**', '903 KB'],
], [2.4, 1.2, 4.7, 1.0]));
add(H3('Validaciones: el script se detiene antes de publicar un hueco'));
add(T(['Validación', 'Qué evita'], [
  ['`fila()` y `una()` exigen exactamente una fila por indicador', 'Que un cambio de redacción en el CSV deje una tarjeta vacía o tome la fila equivocada.'],
  ['Conteos esperados en `modelo2` (18 alternativas, 24 cupos, 11 criterios, 6 filas sin fuerza)', 'Publicar el modelo con un notebook B corrido a medias.'],
  ['16 alcaldías presentes en todas las capas territoriales', 'Mapas con alcaldías faltantes sin aviso.'],
  ['`17_validacion_enigh.csv`: el cálculo debe reproducir las cifras publicadas por CONEVAL', 'Usar estimaciones estatales que no reproducen la fuente oficial.'],
  ['Los tipos de la tipología coinciden entre los nueve archivos de la sección 18', 'Mezclar resultados de dos corridas distintas del notebook D.'],
  ['Cada AGEB del modelo tiene polígono; los nombres de las 32 entidades se parecen a los de CONEVAL', 'Puntos sin forma en el mapa o entidades cruzadas.'],
  ['Cada bloque de D está documentado en `Analysis/matrices/diccionario_observatorio.csv`', 'Datos en la página que nadie definió.'],
], [4.6, 4.76]));
add(H2('2.3 Capa 3: la página'));
add(P('`index.html` contiene solo la estructura: la barra lateral, las ocho secciones `.view` y, dentro de cada una, tarjetas con contenedores vacíos identificados por `id` (por ejemplo `#ch-raz`). Al cargar, cada archivo de `js/vistas/` lee su parte de `D` y llena esos contenedores. Desde el 7 oct 2026 `index.html` se edita a mano; antes se generaba desde `plantilla.html`, que ya no existe.'));
add(H2('2.4 Recorrido de una cifra'));
add(P('La regla «ninguna cifra nace en la página» se cumple porque cada número tiene un camino único y comprobable. Este es el de la cifra más visible de la portada.'));
add(FIGURA('f3.png', 'Recorrido real del 70.5 % desde los microdatos de la ENASIC hasta la tarjeta (datos de D.carga.dano[2]).'));
add(H2('2.5 Estructura de archivos'));
add(T(['Ruta en Frontend/observatorio/', 'Qué es', '¿Se edita a mano?'], [
  ['index.html', 'Estructura de las ocho pestañas y orden de carga de los scripts', 'Sí'],
  ['build_datos.py', 'Lee Analysis/ y escribe js/datos/ y la copia JSON', 'Sí'],
  ['css/ (5 archivos)', 'base (tokens) → layout → componentes → graficas → vistas', 'Sí'],
  ['js/datos/ (4 archivos)', 'D, GEO, GEO_EST, GEO_AGEB', '**No**: se sobrescriben'],
  ['js/nucleo/ (4)', 'obs.js, util.js, alias.js, filtro-segmento.js', 'Sí'],
  ['js/graficas/ (3)', 'componentes.js, motor-3d.js, ilustraciones.js (esta última generada)', 'Sí, salvo ilustraciones.js'],
  ['js/vistas/ (14)', 'Un archivo por pestaña, más extensiones (inicio-3d, focalizacion-ampliado, territorio-estados, territorio-tipologia, inicio-contadores)', 'Sí'],
  ['js/app/ (3)', 'coachmark.js, plegables.js, pestanas.js', 'Sí'],
  ['vendor/three.min.js', 'three.js r128 (MIT)', 'No'],
  ['ilustraciones/', 'Originales, recortes y build_ilustraciones.py', 'Solo los originales'],
  ['datos_observatorio.json', 'Copia legible de D', 'No'],
], [2.8, 4.8, 1.76]));

// ───────────────────────── 3
add(H1('3. Tecnologías, capa por capa'));
add(H2('3.1 HTML'));
add(B('Una sola página con ocho `<section class="view">`. Solo una tiene la clase `on` a la vez.'));
add(B('Navegación accesible: la barra lateral usa `role="tablist"` con botones `role="tab"`, y cada vista es un `role="tabpanel"`. Cada botón lleva su ícono en SVG dentro del propio HTML.'));
add(B('Cada gráfica tiene un contenedor con el atributo `data-chart`. Ese atributo sirve también para contar las gráficas del contador de la portada (hoy, 36).'));
add(B('Cada tarjeta trae un `<details class="src">` con su ficha: lectura, fuente, universo, precisión y archivo de origen. Las vistas lo llenan y `coachmark.js` lo muestra como recorrido guiado (sección 4.5).'));
add(H2('3.2 CSS'));
add(P('Cinco hojas que se cargan en este orden: `base.css` (tokens, reinicio y utilidades), `layout.css` (barra lateral, vistas, cuadrícula y pie), `componentes.css` (tarjetas, fichas, chips, selectores, tablas y acordeones), `graficas.css` (barras con IC, leyendas, texto SVG y mapa) y `vistas.css` (portada y barra de filtro). La hoja del Observatorio es independiente de `Frontend/css/app.css`, del prototipo de la app; solo se copió la paleta.'));
add(T(['Token', 'Valor', 'Uso'], [
  ['--shell', '#3f4760', 'Barra lateral, bloque oscuro, encabezados de tabla'],
  ['--paper / --card', '#f4f2f9 / #ffffff', 'Fondo general y tarjetas'],
  ['--ink', '#2b3045', 'Texto principal'],
  ['--accent', '#77689d', 'Morado de series y selectores'],
  ['--lav / --mint', '#aa95d1 / #7dd1c1', 'Acentos de marca'],
  ['--alert', '#c0435a', 'Grupo del problema, lo que rebasa el tope'],
  ['--teal / --amber', '#23806f / #a9711a', 'Estado «alta» y advertencias'],
  ['--sans / --mono', 'Archivo / JetBrains Mono', 'Texto y cifras o rutas'],
], [2.2, 2.4, 4.76]));
add(esp());
add(P('**Diseño adaptable.** La cuadrícula usa clases `c2`, `c3`, `c4`, `c21` y `c12`. Bajo 980 px pasan a dos columnas y bajo 640 px, a una. Bajo 960 px la barra lateral se convierte en barra superior con las pestañas en una fila deslizable. Desde 1760 px el contenido escala con `zoom` (de 1.1 a 1.85) para no dejar márgenes vacíos. Con `prefers-reduced-motion` se apagan las animaciones.'));
add(H2('3.3 JavaScript'));
add(B('**Sin framework y sin módulos ES.** Cada archivo es una función autoejecutable que, al inicio, toma de `OBS` lo que necesita y, al final, agrega a `OBS` lo que otros usan. La cabecera de cada archivo lo declara («Importa de OBS» / «Exporta a OBS»).'));
add(B('**Las gráficas son texto.** Las funciones arman una cadena con etiquetas SVG y la insertan con `innerHTML` en su contenedor. El `viewBox` hace que el SVG se escale al ancho de la tarjeta.'));
add(B('**Interacción con eventos del DOM**: clic en selectores, en renglones de tablas y en polígonos del mapa; `hashchange` y teclado para las pestañas; `pointermove` e `IntersectionObserver` en las escenas 3D.'));
add(H2('3.4 three.js (solo en el Inicio)'));
add(P('`motor-3d.js` monta sobre three.js r128 un escenario con piso que refleja (la escena se dibuja reflejada y encima va un piso semitransparente), materiales tipo gomita, cajas redondeadas, sombra difusa y texto en textura. `inicio-3d.js` arma las cinco escenas del embudo «¿Cuántas personas están en el problema?» con las ilustraciones 2D como figuras recortadas con grosor. El dibujo se pausa cuando el lienzo sale de la pantalla (`IntersectionObserver`). Si el navegador no tiene WebGL, el marco recibe la clase `no3d`: se oculta la escena y quedan las tarjetas con las mismas cifras.'));
add(H2('3.5 Python fuera del análisis'));
add(T(['Script', 'Bibliotecas', 'Qué hace', 'Cuándo se corre'], [
  ['build_datos.py', 'pandas, json, math', 'Arma D, valida y proyecta los contornos de AGEB', 'Después de cualquier cambio en los notebooks'],
  ['ilustraciones/build_ilustraciones.py', 'Pillow, numpy, scipy.ndimage', 'Recorta el fondo de las ilustraciones, agrega borde y canto, y escribe `js/graficas/ilustraciones.js` con WebP en data URI', 'Si cambia una imagen'],
], [2.6, 1.9, 3.3, 1.56]));
add(H2('3.6 Recursos externos'));
add(P('El único recurso que se pide a internet son las tipografías Archivo y JetBrains Mono, desde Google Fonts. Sin conexión, el navegador usa `system-ui` y `Consolas`: la página funciona, pero cambian los anchos de texto y algunos títulos pueden partirse distinto. Ver la sección 7.'));

// ───────────────────────── 4
add(H1('4. Cómo se conectan los módulos'));
add(H2('4.1 Espacio de nombres OBS y orden de carga'));
add(P('`obs.js` crea un objeto vacío `var OBS = {}`. Desde ahí, cada archivo publica en `OBS` sus funciones y datos derivados, y los que cargan después los toman. Es un sistema de módulos hecho a mano: funciona sin servidor, pero depende de que el orden de las etiquetas `<script>` en `index.html` sea el correcto.'));
add(FIGURA('f2.png', 'Orden de carga de los scripts y qué publica cada grupo en OBS.'));
add(T(['Archivo', 'Exporta a OBS (lo que usan otros)'], [
  ['nucleo/util.js', '`$`, `$$`, `fmt`, `ent`, `mxn`, `mill`, `esc`, `dl`, `seg`, `svg`, `prec`, `isWeak`, constantes de texto SVG'],
  ['nucleo/alias.js', 'Atajos a bloques de D: `K` (clave), `C` (carga), `G` (grupo del problema), `REL`, `R` (razones), `OD`, `CT`, `P`, `M`, `GL`, `SN`, y búsquedas `Q()`, `gr()`, `r6`, `r40`'],
  ['nucleo/filtro-segmento.js', 'Estado del filtro `F = {dim, seg}`, lector `SG()`, `lv()`, `segName()`, lista de dimensiones'],
  ['graficas/componentes.js', 'Funciones de gráfica (sección 5.2) y color de tinta `C_INK`'],
  ['graficas/motor-3d.js', '`M3D` (o `null` si no hay three.js)'],
  ['graficas/ilustraciones.js', '`ILU`: imágenes en data URI'],
  ['vistas/barreras.js', '`renderRaz`, `renderPref` (los usa segmentacion.js al filtrar)'],
  ['vistas/territorio.js', '`T` (alcaldías; lo usa inicio-contadores.js)'],
], [2.6, 6.76]));
add(H2('4.2 Arranque de la página'));
add(N('El navegador lee los cuatro archivos de datos y crea `D`, `GEO`, `GEO_EST` y `GEO_AGEB`.'));
add(N('Se cargan el núcleo y las gráficas. Si three.js no está disponible, `M3D` queda en `null`.'));
add(N('Cada vista corre en cuanto se carga y **pinta su pestaña completa**, aunque esté oculta. Las ocho pestañas quedan dibujadas desde el inicio; cambiar de pestaña no vuelve a calcular nada.'));
add(N('`inicio-contadores.js` cuenta lo ya pintado (indicadores, gráficas, fuentes y alcaldías).'));
add(N('`coachmark.js` convierte las fichas en recorridos, `plegables.js` pliega la guía «Cómo leer esta pestaña» y `pestanas.js` muestra la pestaña que indique la URL (`#necesidad`, `#relevo`…) o el Inicio.'));
add(H2('4.3 Navegación'));
add(P('`pestanas.js` alterna la clase `on` de las vistas, actualiza `aria-selected` y escribe el `#hash` con `history.replaceState`, de modo que cada pestaña tiene su propia URL y se puede compartir. Responde a clic, a las flechas del teclado, al botón de la marca, a cualquier elemento con `data-goto` (los botones «Ver la pestaña» de la portada) y al botón atrás del navegador (`hashchange`).'));
add(H2('4.4 Estado compartido: el filtro de segmentación'));
add(P('¿Quién lo carga? y ¿Por qué no se contrata? comparten una barra «Segmentar por». El estado vive en `F` (en `filtro-segmento.js`) para que ambas pestañas lo vean. Al hacer clic en una dimensión, en un segmento o en un renglón del mapa de calor, `segmentacion.js` cambia `F` y llama a `refreshSeg()`, que vuelve a dibujar la barra, las tarjetas de cifras, los dos comparadores y, mediante `renderRaz()` y `renderPref()`, las gráficas de razones y de preferencia de `barreras.js`.'));
add(B('Se filtra **una dimensión a la vez** (sexo, edad, ingreso, a quién cuida, intensidad), porque los cruces dejan muestras demasiado chicas.'));
add(B('Si la estimación del segmento tiene precisión baja, la tarjeta dice «precisión baja: no se compara» en lugar de mostrar la diferencia.'));
add(B('El estado del filtro no se guarda en la URL: al recargar, vuelve a «Total nacional».'));
add(H2('4.5 Fichas de fuente y guías'));
add(P('Cada tarjeta tiene un `<details class="src">` oculto que es la **fuente de verdad** de su ficha: las vistas y los filtros lo reescriben por `id`. `coachmark.js` sustituye ese plegable por un botón ⓘ que abre un globo de dos o tres pasos (cómo leerla, de dónde sale, qué tan precisa es) y lee el contenido cada vez que se abre, así que nunca muestra una ficha vieja. `plegables.js` mueve el párrafo de cada encabezado de pestaña a un bloque «Cómo leer esta pestaña».'));
add(H2('4.6 Conexión con el resto del proyecto'));
add(T(['Pieza', 'Relación con el Observatorio'], [
  ['Analysis/ (notebooks A–D, script 19)', 'Aguas arriba: produce todos los números. El Observatorio no tiene ningún dato que no salga de ahí.'],
  ['Analysis/matrices/diccionario_observatorio.csv', 'Define las variables derivadas y cada bloque de D. `build_datos.py` se detiene si falta uno; la pestaña Método lo muestra.'],
  ['Analysis/matrices/inventario_fuentes_cuidado.csv y pares_oferta_necesidad.csv', 'Se publican tal cual en Método.'],
  ['Frontend/ (prototipo de la app de relevo)', '**Proyecto aparte.** Usa datos simulados guardados en `localStorage` y tiene su propio CSS y JS. Del Observatorio solo comparte la paleta y el archivo de límites `Frontend/js/cdmx-alcaldias.js`. El Observatorio menciona los dos perfiles de la app («Necesito cuidado», «Puedo cuidar») como contexto, pero no lee datos de ella.'],
  ['Documentos/', 'La Guía del tablero, la bitácora y los informes citan cifras del Observatorio; no las originan.'],
  ['Piloto de práctica profesional', 'Sus datos se quedan en la institución receptora. Al Observatorio solo llegarían agregados (nota al pie de Método).'],
], [3.2, 6.16]));
add(esp(160));
add(CAJA('Separación que no debe romperse', [
  'La app trabaja con **datos simulados** y el Observatorio con **datos reales agregados**. No comparten archivos de datos. Si en algún momento la app alimenta al Observatorio, cada cifra que venga de ella tiene que marcarse como simulada (regla «Datos simulados declarados»).',
], 'alerta'));

// ───────────────────────── 5
add(H1('5. Cómo se dibujan las gráficas'));
add(CAJA('Respuesta corta', [
  '**Todas las gráficas y mapas del Observatorio se dibujan con JavaScript en el navegador, como SVG.** Python no dibuja ninguna: prepara los números (notebooks y `build_datos.py`) y, en el caso de las AGEB, calcula las coordenadas del mapa.',
  'Matplotlib (`Analysis/estilo_graficas.py`, `generar_figuras.py` y los notebooks) produce las figuras PNG f1 a f20, que van al informe de Word y a la presentación. Ninguna de esas imágenes aparece en el Observatorio.',
], 'menta'));
add(FIGURA('f4.png', 'Ciclo de una gráfica: bloque de D, función de dibujo, cadena SVG, contenedor y ficha.'));
add(H2('5.1 Dos tipos de código de gráfica'));
add(B('**Componentes reutilizables** en `js/graficas/componentes.js`: funciones que reciben filas y opciones y devuelven SVG. Se usan cuando la misma forma aparece en más de una tarjeta.'));
add(B('**Gráficas a la medida** dentro de cada archivo de `js/vistas/`: la vista arma el SVG directamente (por ejemplo, la dispersión de alcaldías o la curva de cobertura). Son la mayoría: 29 de los 36 contenedores; los otros 7 usan componentes.'));
add(H2('5.2 Biblioteca de componentes'));
add(T(['Función', 'Forma', 'Se usa en', 'Estado'], [
  ['barrasH', 'Barras horizontales con IC; precisión baja en gris rayado', '¿Por qué no buscó servicios?', 'En uso'],
  ['columnasGrupo', 'Columnas agrupadas con IC; etiquetas largas en varias líneas', 'Rechazo a residencias; preferencia de lugar con filtro', 'En uso'],
  ['figurasSexo', 'Figuras de mujer y hombre que se llenan según el %', 'Preferencia de lugar (sin filtro o por sexo)', 'En uso'],
  ['lineas', 'Líneas sobre categorías ordenadas con IC como barras finas o banda', 'Quintil, horas por sexo, asequibilidad', 'En uso'],
  ['iconosDano', 'Pictograma: necesidad declarada y, de esas personas, cuántas declaran daño (10 figuras)', '¿Declaran daño?', 'En uso'],
  ['figura, filaFiguras, siluetaSexo', 'Piezas internas de los pictogramas', 'Dentro de los componentes', 'En uso (internas)'],
  ['ramp, hatchDef, rayado', 'Rampa de color del mapa de calor y patrón rayado de precisión baja', 'Comparar segmentos', 'En uso'],
  ['lolli, dona, waffle, anillos, pict, columnas, barrasGrupo, barras', 'Versiones anteriores (piruletas, dona, waffle, anillos, pictograma, columnas y barras simples)', 'Ninguna vista', '**Sin uso** desde el 7 oct 2026 (ver sección 7)'],
], [2.3, 3.6, 2.2, 1.26]));
add(H2('5.3 Convenciones visuales que comparten todas las gráficas'));
add(T(['Convención', 'Significado', 'Dónde se define'], [
  ['Bigote o banda alrededor de la cifra', 'Intervalo de confianza al 90 % con el diseño muestral', 'Cada componente'],
  ['Gris rayado', 'Precisión baja (CV ≥ 30 %): no cuenta como hallazgo', '`hatchDef`, `rayado`, `isWeak`'],
  ['Punto hueco', 'Precisión baja en gráficas de puntos o líneas', '`lineas`'],
  ['Chip alta / moderada / baja / sin varianza', 'Clasificación de precisión del INEGI (CV < 15 %, 15–30 %, ≥ 30 %)', '`prec()` en util.js; clases `.p-*` en CSS'],
  ['▲ ▼', 'Diferencia significativa contra el resto de su dimensión (IC 90 %)', 'Comparador de segmentos'],
  ['Rojo (#c0435a)', 'Grupo del problema o lo que rebasa un tope o presupuesto', 'Varias vistas'],
  ['Texto con número de casos en rojo', 'Grupo con menos casos que el umbral (200 o 100, según la gráfica)', 'Focalización'],
], [2.8, 4.4, 2.16]));
add(esp());
add(P('**Accesibilidad.** La función `svg()` agrega `role="img"` y un `aria-label` que describe la gráfica. Las gráficas se escalan con `viewBox`, así que no se desbordan a 390 px.'));
add(H2('5.4 Mapas'));
add(P('Ninguno de los tres mapas usa una biblioteca cartográfica. Los tres son trazos SVG, pero llegan ahí por caminos distintos según su tamaño.'));
add(FIGURA('f6.png', 'Origen y proyección de los tres mapas del Observatorio.'));
add(P('La proyección es equirrectangular con corrección por el coseno de la latitud media: suficiente para una ciudad o un país a esta escala, pero **no es una proyección cartográfica oficial** y no debe usarse para medir distancias. Las distancias de la tipología (por ejemplo, «a más de 1 km de la oferta formal») se calcularon en el notebook D con geopandas, no en la página.'));
add(H2('5.5 Escenas 3D e ilustraciones'));
add(P('Las figuras de personas del Inicio son ilustraciones, no datos ni personas reales. Las alturas, conteos y arcos de los objetos 3D sí salen de `D`, con las mismas cifras de sus tarjetas. Las ilustraciones originales están en `ilustraciones/*_original.*`; `build_ilustraciones.py` recorta el fondo y escribe las versiones en WebP dentro de `js/graficas/ilustraciones.js`. Si falta `OBS.ILU`, vuelven los personajes 3D de respaldo.'));

// ───────────────────────── 6
add(H1('6. Pestaña por pestaña'));
add(P('Todas las pestañas siguen la misma anatomía. El orden de las pestañas responde a una pregunta por pestaña; la Guía del tablero (sección 3) explica ese relato. Aquí se describe cómo está construida cada una.'));
add(FIGURA('f5.png', 'Anatomía de una pestaña (¿Quién lo carga?, 1440 px): 1 barra lateral, 2 encabezado con titular y guía plegada, 3 filtro de segmentación, 4 tarjetas de cifra, 5 gráfica, 6 botón de ficha.'));
add(T(['Pieza', 'Clase o elemento', 'Quién la llena'], [
  ['Encabezado: categoría, titular y guía', '`.vhead` (kicker, h2, p)', 'HTML fijo; `plegables.js` pliega la guía'],
  ['Barra de filtro', '`.fbar[data-fb]`', '`segmentacion.js` (solo en dos pestañas)'],
  ['Tarjetas de cifra', '`.grid.c4` con id propio', 'La vista correspondiente'],
  ['Tarjeta con gráfica', '`.card` > h3, `p.find` (hallazgo), `.chart[data-chart]`, leyenda, `details.src`', 'La vista; el hallazgo se arma con cifras de D'],
  ['Selector', '`.seg` con botones `aria-pressed`', '`seg()` de util.js llama a la función de dibujo'],
  ['Acordeón con tabla', '`details.acc`', 'La vista'],
], [2.6, 3.6, 3.16]));

function pestana(titulo, ficha, filas, extra = []) {
  add(H2(titulo));
  add(CAJA('Ficha técnica', ficha));
  add(esp(100));
  add(T(['Tarjeta', 'Cómo se dibuja', 'Datos (bloque de D)', 'Interacción'], filas, [2.4, 3.0, 2.2, 1.76], { col0: true }));
  extra.forEach((e) => add(e));
}

pestana('6.1 Inicio (#inicio)', [
  '**Archivos:** `vistas/inicio.js` (textos, razones, tarjetas), `vistas/inicio-3d.js` (escena del embudo), `vistas/inicio-contadores.js`, `graficas/motor-3d.js`, `graficas/ilustraciones.js`.',
  '**Datos:** `D.carga`, `D.razones`, `D.relevo`, `D.embudo`, `D.modelo` y conteos de `D.kpis` y `D.inventario`.',
  '**Por qué existe:** presenta el enfoque y el tamaño del problema antes de entrar al detalle. Es la única pestaña con 3D; ninguna cifra depende de que el 3D funcione.',
], [
  ['«Los datos que cuidan» (bloque oscuro)', 'HTML con cuatro razones; cada una lleva una micrográfica SVG de 220 × 84 dibujada en inicio.js con su propia cifra; medallón ilustrado en imagen WebP', '`carga`, `razones`, `relevo`', 'Las cifras cuentan desde 0 al verse; foco de luz que sigue al cursor'],
  ['Contadores', 'HTML: indicadores, gráficas (cuenta los `[data-chart]`), fuentes y alcaldías', '`kpis`, `inventario`, `T`', '—'],
  ['«¿Cuántas personas están en el problema?»', 'Lienzo WebGL (three.js) con cinco escenas y tarjetas HTML debajo', '`embudo`', 'Cursor sobre figura resalta su tarjeta; clic abre la pestaña'],
  ['Cierre del embudo: el modelo frente a la regla', 'Tarjeta HTML', '`modelo.global`', 'Botón a ¿A quién primero?'],
]);
pestana('6.2 ¿Quién lo carga? (#necesidad)', [
  '**Archivos:** `vistas/necesidad.js`, `vistas/segmentacion.js` (filtro, tarjetas y comparador), `nucleo/filtro-segmento.js`.',
  '**Datos:** `D.seg` (249 estimaciones de la sección 12), `D.carga`, `D.clave`, `D.perfil`, `D.horas_dist`, `D.brecha_sexo`.',
  '**Por qué existe:** muestra quién carga el cuidado de alta intensidad y que el daño crece con las horas aunque la necesidad declarada no cambie.',
], [
  ['Cuatro tarjetas de cifra', 'HTML con chip de precisión', '`seg`', 'Cambian con el filtro'],
  ['Comparar segmentos', 'Mapa de calor indicadores × segmentos, a la medida, con `ramp` y `hatchDef`; ▲▼ de significancia', '`seg`', 'Clic en un renglón filtra la pestaña'],
  ['¿Declaran daño quienes dicen «no tuve necesidad»?', '`iconosDano` (pictograma)', '`carga`', '—'],
  ['¿Cuánto cambia con más horas?', 'Diferencias con IC, a la medida («más horas menos menos horas»)', '`carga.diferencias`', '—'],
  ['Grupo del problema', 'Tarjeta oscura HTML', '`clave.grupo_problema`', '—'],
  ['¿Cuántas horas a la semana cuidan?', 'Columnas por rango de horas, a la medida', '`horas_dist`', '—'],
  ['¿Quiénes forman el grupo del problema?', 'Barras agrupadas con ★ de diferencia, a la medida', '`perfil`', 'Selector de dimensión'],
  ['Horas semanales por sexo y edad', '`lineas`; chip «origen sin documentar»', '`brecha_sexo`', '—'],
]);
pestana('6.3 ¿Por qué no se contrata? (#barreras)', [
  '**Archivos:** `vistas/barreras.js` y `vistas/segmentacion.js`.',
  '**Datos:** `D.seg`, `D.razones`, `D.quintil`, `D.preferencia`, `D.p711`, `D.oferta_declarada`, `D.contratacion`, `D.clave`.',
  '**Por qué existe:** pone a prueba las explicaciones de por qué no se contrata cuidado (información, precio, oferta, norma familiar) con un veredicto para cada una.',
], [
  ['Comparar segmentos', 'Mismo mapa de calor que en ¿Quién lo carga?, con indicadores de barreras', '`seg`', 'Clic filtra'],
  ['Semáforo de hipótesis (4)', 'Tarjetas HTML con veredicto', '`razones`, `oferta_declarada`, `contratacion`', '—'],
  ['¿Por qué no buscó servicios?', '`barrasH`', '`razones.obj` / `.todas`', 'Selector de universo; con filtro usa `seg`'],
  ['¿Contratan más los hogares con más ingreso?', '`lineas` con punto hueco si la precisión es baja', '`quintil`', '—'],
  ['Si contratara cuidado, ¿dónde?', '`figurasSexo` (total o sexo) o `columnasGrupo` (otro filtro)', '`preferencia`, `seg`', 'Cambia de forma según el filtro'],
  ['¿Por qué rechazaría una residencia?', '`columnasGrupo`', '`p711`', '—'],
]);
pestana('6.4 ¿Cuánto cuesta? (#relevo)', [
  '**Archivo:** `vistas/relevo.js`.',
  '**Datos:** `D.relevo` (sección 10, ingreso ENASIC), `D.relevo_enigh` (sección 14, ingreso ENIGH), `D.ingreso`, `D.pago`, `D.jornada` (script 19), `D.subsidio`, `D.anclas`.',
  '**Por qué existe:** compara el costo de unas horas de relevo con el de la jornada completa y con el ingreso de los hogares. Todos los costos están marcados «sin prestaciones · jornada diurna».',
], [
  ['Cuatro tarjetas de cifra', 'HTML', '`relevo`, `pago`', '—'],
  ['¿Cuántos hogares podrían pagarlo?', '`lineas` con IC cuando la fuente es la ENIGH', '`relevo` / `relevo_enigh`', 'Tres selectores: fuente del ingreso, salario y tope (10, 20 o 30 %)'],
  ['¿Qué parte del ingreso se lleva?', 'Barras horizontales con línea del tope, a la medida', '`relevo`, `relevo_enigh`', 'Sigue a los selectores de arriba'],
  ['¿Cuánto se paga hoy por hora?', 'Rangos p25–p75 con mediana y líneas de referencia, a la medida', '`pago`', '—'],
  ['¿Cambia el costo si el relevo es de noche?', 'Barras por tipo de jornada, a la medida', '`jornada`', 'Selector de 3 a 12 h/sem'],
  ['Si se subsidia: costo anual contra el presupuesto', 'Barras contra anclas presupuestales, a la medida', '`subsidio`, `anclas`', '—'],
]);
pestana('6.5 ¿A quién primero? (#focalizacion)', [
  '**Archivos:** `vistas/focalizacion.js` (primera parte) y `vistas/focalizacion-ampliado.js` (ampliación del 13 oct 2026).',
  '**Datos:** `D.modelo` (resultados globales, por grupo, sensibilidad y coeficientes) y `D.modelo2` (alternativas, curvas, calibración, importancia, cupo y elección del objetivo).',
  '**Por qué existe:** el programa curricular exige un modelo, y la regla del proyecto exige compararlo con una alternativa simple. La pestaña muestra que la regla «40 h o más» encuentra casi a las mismas personas.',
], [
  ['Cuatro tarjetas de cifra', 'HTML con IC', '`modelo.global`', '—'],
  ['El modelo cambia a quién se selecciona', 'Puntos por grupo: regla frente a modelo, a la medida', '`modelo.grupos`', 'Selector logística / gradient boosting'],
  ['Qué asocia el modelo con el daño', 'Barras divergentes de coeficientes, a la medida', '`modelo.coef`', '—'],
  ['Ocho formas de elegir', 'Diferencias contra la regla con IC, a la medida; tabla AUC y Brier', '`modelo2.alternativas`', 'Selector de objetivo (afecta a las cuatro gráficas de la ampliación)'],
  ['¿A cuántas personas con daño llega, según el cupo?', 'Curvas de cobertura, a la medida; tabla por cupo', '`modelo2.curvas`, `.cupo`', 'Selector de objetivo'],
  ['¿Qué variables usa cada modelo?', 'Barras agrupadas de importancia por permutación', '`modelo2.importancia`', 'Selector de objetivo'],
  ['¿Las probabilidades se pueden leer como porcentajes?', 'Calibración por deciles con IC', '`modelo2.calibracion`', 'Selector de objetivo'],
  ['¿Qué objetivo conviene?', 'Tarjetas, prevalencia de cada daño por horas, cambio de cobertura por grupo y tabla de criterios', '`modelo2.resumen`, `.por_horas`, `.por_grupo`, `.decision`', '—'],
]);
pestana('6.6 ¿Dónde? (#territorio)', [
  '**Archivos:** `vistas/territorio.js` (escala y alcaldías), `vistas/territorio-estados.js` (32 entidades y zonas por AGEB) y `vistas/territorio-tipologia.js` (tipología, segundo modelo).',
  '**Datos:** `D.dimension_cdmx`, `D.relevo_enigh`, `D.territorio`, `D.estados`, `D.zonas`, `D.tipologia`; contornos `GEO`, `GEO_EST` y `GEO_AGEB`.',
  '**Por qué existe:** el componente territorial no puede salir de la ENASIC (no tiene cifras por alcaldía ni para la CDMX), así que usa ENIGH, DENUE, Censo, CONEVAL y CONAPO. Es la pestaña más pesada: 12 de los 36 contenedores.',
], [
  ['Cuatro tarjetas de escala', 'HTML; la medición directa (ENIGH) va primero y las inferidas, marcadas', '`dimension_cdmx`, `relevo_enigh`', '—'],
  ['Mapa de alcaldías + dispersión', 'Mapa SVG proyectado en el navegador y dispersión % 60+ contra la capa; tarjetas de valor más alto y más bajo con silueta', '`territorio`, `GEO`', 'Siete capas; clic en tabla o mapa'],
  ['México · 32 entidades', 'Mapa esquemático y puntos con IC 90 % de la CDMX frente al país', '`estados`, `GEO_EST`', 'Siete indicadores'],
  ['Zonas dentro de cada alcaldía', 'Un punto por AGEB, coloreado por grado de rezago', '`zonas`', '—'],
  ['Cuatro tipos de zona', 'Mapa de 2,371 AGEB (se dibuja una vez; al cambiar de capa solo cambian los rellenos), lista y perfil del tipo', '`tipologia`, `GEO_AGEB`', 'Cuatro capas; clic en una AGEB o en un tipo'],
  ['Tres gráficas para el piloto', 'Barras por tipo (`barrasTipo`, interna de la vista)', '`tipologia.decision`', '—'],
  ['Brechas por alcaldía', 'Barras apiladas por tipo', '`tipologia.por_alcaldia`', '—'],
  ['¿Qué tan confiable es la tipología?', 'Líneas de silueta y estabilidad por k; tablas de comparación y robustez', '`tipologia.seleccion_k`, `.comparacion`, `.robustez`', 'Acordeones'],
]);
pestana('6.7 Indicadores (#indicadores)', [
  '**Archivo:** `vistas/indicadores.js`.',
  '**Datos:** `D.kpis` (21 indicadores armados en `build_datos.py` con dimensión, definición, valor, universo, precisión, evidencia y archivo).',
  '**Por qué existe:** es la ficha de indicadores que exige la UCA de Inteligencia de Negocios. Los indicadores sin fuente aparecen como «no medible» en lugar de llenarse con un supuesto.',
], [
  ['Filtro por dimensión', 'Botones generados de las dimensiones de `kpis`', '`kpis`', 'Filtra las tarjetas'],
  ['Tarjetas de indicador (21)', 'HTML con valor, unidad y chip de precisión', '`kpis`', '—'],
  ['Lista completa', 'Tabla en acordeón', '`kpis`', 'Plegable'],
]);
pestana('6.8 Método (#metodo)', [
  '**Archivo:** `vistas/metodo.js`.',
  '**Datos:** `D.tipologia`, `D.modelo2.resumen`, `D.inventario`, `D.diccionario`, `D.pares`, `D.fichas`, `D.calidad_datos`.',
  '**Por qué existe:** hace visible de dónde sale cada cifra y qué no se puede afirmar. Desde el 14 oct 2026 abre con «Cada modelo responde a una decisión».',
], [
  ['Cada modelo responde a una decisión (3 tarjetas)', 'HTML; los veredictos salen del signo de los IC al 90 %, no de un texto fijo', '`tipologia`, `modelo2.resumen`', 'Botones «Ver la pestaña»'],
  ['Fuentes de datos', 'Tabla en acordeón', '`inventario`', 'Plegable'],
  ['Diccionario de variables y de la base', 'Tabla en acordeón', '`diccionario`', 'Plegable'],
  ['Cómo leer la precisión; lo que no puede afirmar', 'HTML fijo (criterios y advertencias, sin cifras de resultados)', '—', 'Plegable'],
  ['Compatibilidad oferta–necesidad; archivos territoriales y su calidad', 'Tablas en acordeón', '`pares`, `fichas`, `calidad_datos`', 'Plegable'],
  ['Variables de registro del modelo', 'Tabla escrita en metodo.js (nombres y preguntas, sin cifras)', '—', 'Plegable'],
]);

// ───────────────────────── 7
add(H1('7. Límites técnicos y deuda encontrada'));
add(P('Esta lista sale de revisar el código el 14 oct 2026. Ninguno de estos puntos cambia una cifra publicada, pero varios contradicen reglas del proyecto o la documentación, y un evaluador los puede encontrar.'));
add(T(['#', 'Hallazgo', 'Por qué importa', 'Prioridad'], [
  ['1', 'La fecha «Actualizado 6 oct 2026» está escrita en la barra lateral (`index.html`) y en `D.actualizado` (`build_datos.py`). Desde entonces se agregaron la tipología (9 oct), la ampliación del modelo y el costo por jornada (13 oct) y la tarjeta de Método (14 oct).', 'La página dice ser más vieja de lo que es; quien la revise no sabe qué versión ve.', 'Alta · una línea en cada archivo'],
  ['2', 'Dos textos con contenido numérico están escritos a mano: «con 1,043 personas» (`index.html`, ficha de focalización) y «Precio, información y desconfianza quedan por debajo de 5%» (`barreras.js`). Hoy coinciden con los datos.', 'Contradice «ninguna cifra está escrita a mano». Si se vuelve a correr el notebook B y cambian, la página no se entera.', 'Alta · leerlos de D'],
  ['3', 'La carpeta local no tiene repositorio Git (existe `.gitignore`, no `.git`). Los respaldos se hacen copiando carpetas a `_to_delete/`.', 'Las instrucciones del proyecto ponen el código en GitHub. Sin Git no hay forma barata de ver qué cambió entre versiones ni de revertir.', 'Alta · proceso'],
  ['4', 'Código sin uso: la sección «Lo que encontramos» de `inicio-3d.js` (≈ 55 líneas; su contenedor se quitó el 8 oct) y ocho funciones de `componentes.js` (`lolli`, `dona`, `waffle`, `anillos`, `pict`, `columnas`, `barrasGrupo`, `barras`). `barreras.js` las importa sin usarlas.', 'Confunde a quien revisa y hace creer que esas gráficas existen.', 'Media'],
  ['5', 'El README del Observatorio está desfasado en tres puntos: dice que «Comparar segmentos» tiene tres vistas (hoy solo hay mapa de calor), lista «Lo que encontramos» en el Inicio y cita «script 12» o «notebook 11» en lugar de las secciones de los notebooks A–D.', 'El README es la puerta de entrada técnica; si describe algo que no existe, pierde credibilidad.', 'Media · redacción'],
  ['6', 'No hay pruebas automatizadas. La verificación es manual en Chromium.', 'Un cambio en el orden de los scripts o en un CSV puede dejar una pestaña en blanco sin que nadie lo note.', 'Media · ver propuesta abajo'],
  ['7', 'Las tipografías vienen de Google Fonts, aunque el README presenta la página como algo que «abre con doble clic» sin dependencias.', 'Sin internet funciona, pero cambia la apariencia. Para la defensa conviene no depender de la red del aula.', 'Baja · copiar las fuentes (licencia OFL) a `vendor/`'],
  ['8', 'La página carga ≈ 2.7 MB y dibuja las ocho pestañas al abrir, aunque solo se vea una.', 'En local es imperceptible; publicada en internet y abierta en un teléfono, el primer dibujo es lento.', 'Baja'],
  ['9', 'El filtro de segmentación no se guarda en la URL.', 'No se puede compartir un enlace a «¿Quién lo carga?, filtrado por mujeres».', 'Baja'],
], [0.4, 4.0, 3.4, 1.56]));
add(esp(160));
add(CAJA('Propuesta para el punto 6 (no implementada)', [
  'Una prueba de humo con Playwright que abra `index.html`, recorra las ocho pestañas y falle si hay errores de JavaScript, si el número de `[data-chart]` no es 36 o si algún contenedor queda vacío. Se corre después de `build_datos.py`. Con eso, los puntos 1, 2 y 5 se podrían vigilar también.',
], 'ambar'));

// ───────────────────────── 8
add(H1('8. Verificación de este documento'));
add(H2('8.1 Qué quedó verificado'));
add(B('Estructura, orden de carga, importaciones y exportaciones: leídas en `index.html` y en la cabecera de cada archivo de `js/`.'));
add(B('Bloques de D (41), indicadores (21), fuentes inventariadas (29), estimaciones de segmentación (249) y AGEB de la tipología (2,371): contados en `datos_observatorio.json`.'));
add(B('Contenedores de gráfica (36) y su reparto por pestaña: contados abriendo la página en Chromium sin interfaz a 1440 px. La página abrió sin errores de JavaScript; el único recurso que no cargó fue la imagen del medallón, porque no se copió al entorno de prueba.'));
add(B('Uso de cada función de `componentes.js`: búsqueda de llamadas en `js/vistas/`.'));
add(B('Ejemplo de la cifra 70.5 %: comprobado en `D.carga.dano[2]` (IC 90 % 62.5–78.4, n = 185, precisión alta).'));
add(B('Tamaños de archivo: medidos en bytes sobre la copia del 14 oct 2026.'));
add(H2('8.2 Qué queda pendiente'));
add(B('Doble revisión de este documento por Daniel o Alondra Danae.'));
add(B('Probar en un teléfono real y en Safari: el README dice que no se ha hecho.'));
add(B('Decidir qué hacer con los puntos 1 a 3 de la sección 7 y registrar la decisión en la bitácora.'));
add(H2('8.3 Siguiente paso'));
add(N('Corregir la fecha de actualización y leer de D los dos textos numéricos escritos a mano (puntos 1 y 2).'));
add(N('Crear el repositorio del Observatorio (no reutilizar el de MILPÍN) y hacer el primer commit.'));
add(N('Borrar el código sin uso y actualizar el README (puntos 4 y 5).'));

// ════════════════════════════ DOCUMENTO ════════════════════════════
const portada = fs.readFileSync(path.join(FIG, 'portada.jpg'));
const encabezado = new Header({ children: [new Paragraph({
  spacing: { after: 0 },
  children: [new TextRun({ text: 'Observatorio del Cuidado', bold: true, color: SHELL, size: 16, font: F }),
    new TextRun({ text: '  |  Documento técnico  —  UNRC · LCDN · PP 26-2 · Equipo 3', color: '8A8EA3', size: 16, font: F })],
})] });
const pie = new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: HAIR, space: 4 } },
  children: [new TextRun({ text: 'Pág. ', color: '8A8EA3', size: 16, font: F }),
    new TextRun({ children: [PageNumber.CURRENT], color: SHELL, bold: true, size: 16, font: F }),
    new TextRun({ text: '  |  «Los datos que cuidan»  ·  Pendiente de doble revisión', color: '8A8EA3', size: 16, font: F })],
})] });

const doc = new Document({
  creator: 'Omar Gutiérrez Escoto', title: 'Documento técnico — Observatorio del Cuidado',
  description: 'Con qué está hecho el Observatorio, cómo se conectan sus piezas y cómo se dibujan sus gráficas',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: F, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: F, size: 34, bold: true, color: SHELL },
        paragraph: { spacing: { before: 120, after: 220 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: LAV, space: 6 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: F, size: 26, bold: true, color: ACC }, paragraph: { spacing: { before: 300, after: 140 }, outlineLevel: 1, keepNext: true } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: F, size: 22, bold: true, color: TEAL }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: { config: [
    { reference: 'vin', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { color: ACC } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 240 } } } }] },
    { reference: 'num', levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 280 } }, run: { color: ACC, bold: true } } }] },
  ] },
  sections: [
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0 } } },
      children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new ImageRun({ data: portada, type: 'jpg', transformation: { width: 816, height: 1056 } })] })] },
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, right: 1440, bottom: 1200, left: 1440, header: 600, footer: 600 } } },
      headers: { default: encabezado }, footers: { default: pie }, children: C },
  ],
});
const salida = process.argv[2] || 'Observatorio_Cuidado_Documento_Tecnico_v1.docx';
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(salida, b); console.log('ok', salida, b.length); });
