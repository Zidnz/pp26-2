// Piezas comunes de los documentos del segundo avance (Guía del tablero v2, Guía de la app v1, Documento maestro v2).
// Mismo formato que Documentos/documento_tecnico/build_documento_tecnico.js (portada a página completa, Arial, encabezados lila).
// Requiere: npm install docx
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, Header, Footer, PageNumber, LevelFormat, TableOfContents,
} = require('docx');

const W = 9360; // área de texto en DXA (6.5")
const INK = '2B3045', SHELL = '3F4760', ACC = '77689D', LAV = 'AA95D1', TEAL = '23806F', GRIS = '5D6278', HAIR = 'D9D6E4';
const F = 'Arial', MONO = 'Consolas';

function runs(t, base = {}) {
  return String(t).split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map((s) => {
    if (s.startsWith('**')) return new TextRun({ text: s.slice(2, -2), bold: true, font: F, color: base.color ?? INK, size: base.size ?? 21, italics: base.italics });
    if (s.startsWith('`')) return new TextRun({ text: s.slice(1, -1), font: MONO, color: ACC, size: (base.size ?? 21) - 2 });
    return new TextRun({ text: s, font: F, color: base.color ?? INK, size: base.size ?? 21, italics: base.italics, bold: base.bold });
  });
}
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 140, line: 300 }, alignment: o.align, children: runs(t, o) });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(t)] });
const H1c = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] }); // sin salto de página
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const B = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'vin', level: lvl }, spacing: { after: 70, line: 290 }, children: runs(t) });
const esp = (n = 120) => new Paragraph({ spacing: { after: n }, children: [] });

// Listas numeradas: cada lista nueva reinicia en 1 (instancia propia).
let instNum = 0;
function lista() { instNum += 1; const inst = instNum; return (t) => new Paragraph({ numbering: { reference: 'num', level: 0, instance: inst }, spacing: { after: 70, line: 290 }, children: runs(t) }); }

const borde = { style: BorderStyle.SINGLE, size: 4, color: HAIR };
function T(enc, filas, pesos, o = {}) {
  const tot = pesos.reduce((a, b) => a + b, 0);
  const an = pesos.map((p) => Math.round(W * p / tot)); an[an.length - 1] += W - an.reduce((a, b) => a + b, 0);
  const celda = (txt, i, cab, fill) => new TableCell({
    width: { size: an[i], type: WidthType.DXA },
    borders: { top: borde, bottom: borde, left: borde, right: borde },
    shading: { type: ShadingType.CLEAR, fill: cab ? SHELL : (fill || 'FFFFFF'), color: 'auto' },
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
      ...filas.map((f) => new TableRow({ cantSplit: true, children: f.map((c, i) => celda(c, i, false, o.fills && o.fills[i])) }))],
  });
}
const TONOS = { lav: [ACC, 'F4F2F9'], ambar: ['A9711A', 'FBF4E6'], alerta: ['C0435A', 'FBECEF'], menta: [TEAL, 'E9F6F2'] };
function CAJA(titulo, lineas, tono = 'lav') {
  const [c, fondo] = TONOS[tono];
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      borders: { top: none, bottom: none, right: none, left: { style: BorderStyle.SINGLE, size: 30, color: c } },
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

// Tamaño de PNG o JPG sin dependencias.
function medidas(buf) {
  if (buf[0] === 0x89) return [buf.readUInt32BE(16), buf.readUInt32BE(20), 'png'];
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i += 1; continue; }
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5), 'jpg'];
    i += 2 + len;
  }
  throw new Error('No se pudo leer el tamaño de la imagen');
}
let nfig = 0;
function FIGURA(ruta, texto, ancho = 624, o = {}) {
  const buf = fs.readFileSync(ruta);
  const [w, h, tipo] = medidas(buf);
  let an = ancho, al = Math.round(ancho * h / w);
  if (o.maxAlto && al > o.maxAlto) { al = o.maxAlto; an = Math.round(al * w / h); }
  const pie = o.sinNumero ? texto : `Figura ${++nfig}. ${texto}`;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, keepNext: true,
      children: [new ImageRun({ data: buf, type: tipo, transformation: { width: an, height: al } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 220 },
      children: [new TextRun({ text: pie, italics: true, color: GRIS, size: 17, font: F })] }),
  ];
}
// Dos o tres capturas de teléfono en una fila (tabla sin bordes).
function FILA_IMG(items, altoPx = 330) {
  const n = items.length, an = Math.floor(W / n);
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: Array(n).fill(an),
    rows: [new TableRow({ cantSplit: true, children: items.map(([ruta, txt]) => {
      const buf = fs.readFileSync(ruta); const [w, h, tipo] = medidas(buf);
      const al = altoPx, ancho = Math.round(al * w / h);
      return new TableCell({ width: { size: an, type: WidthType.DXA }, borders: { top: none, bottom: none, left: none, right: none },
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: buf, type: tipo, transformation: { width: ancho, height: al } })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: runs(txt, { size: 16, color: GRIS, italics: true }) })] });
    }) })],
  });
}

const titulo = (t) => new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: t, bold: true, color: SHELL, size: 30, font: F })] });
const indice = () => [new Paragraph({ spacing: { before: 300, after: 160 }, children: [new TextRun({ text: 'Índice', bold: true, color: SHELL, size: 30, font: F })] }),
  new TableOfContents('Índice', { hyperlink: true, headingStyleRange: '1-2' })];

function construir({ portada, encabezado, pie, meta, C, salida }) {
  const head = new Header({ children: [new Paragraph({ spacing: { after: 0 }, children: [
    new TextRun({ text: 'Observatorio del Cuidado', bold: true, color: SHELL, size: 16, font: F }),
    new TextRun({ text: `  |  ${encabezado}  —  UNRC · LCDN · PP 26-2 · Equipo 3`, color: '8A8EA3', size: 16, font: F })] })] });
  const foot = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: HAIR, space: 4 } },
    children: [new TextRun({ text: 'Pág. ', color: '8A8EA3', size: 16, font: F }),
      new TextRun({ children: [PageNumber.CURRENT], color: SHELL, bold: true, size: 16, font: F }),
      new TextRun({ text: `  |  ${pie}`, color: '8A8EA3', size: 16, font: F })] })] });
  const doc = new Document({
    creator: 'Equipo 3 · PP 26-2', title: meta.title, description: meta.description,
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: F, size: 21, color: INK } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: F, size: 34, bold: true, color: SHELL },
          paragraph: { spacing: { before: 120, after: 220 }, outlineLevel: 0, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: LAV, space: 6 } } } },
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
        children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new ImageRun({ data: fs.readFileSync(portada), type: 'jpg', transformation: { width: 816, height: 1056 } })] })] },
      { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, right: 1440, bottom: 1200, left: 1440, header: 600, footer: 600 } } },
        headers: { default: head }, footers: { default: foot }, children: C },
    ],
  });
  return Packer.toBuffer(doc).then((b) => { fs.writeFileSync(salida, b); console.log('ok', salida, b.length); });
}

module.exports = { runs, P, H1, H1c, H2, H3, B, lista, esp, T, CAJA, CODIGO, FIGURA, FILA_IMG, titulo, indice, construir, W, INK, SHELL, ACC, LAV, TEAL, GRIS };
