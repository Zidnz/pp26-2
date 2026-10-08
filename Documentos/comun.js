// Componentes compartidos por los dos documentos de Word del proyecto integrador.
// Observatorio de Datos para la Economía del Cuidado · LCDN 7.º semestre · UNRC · 2026-2
//
// Ninguna cifra vive aquí: todas se leen de _valores.json, que a su vez se construye
// desde los CSV de Analysis/resultados/ con generar_valores.py.

const fs = require('fs');
const {
  Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, PageBreak, Footer, PageNumber,
  LevelFormat, TableOfContents, convertInchesToTwip,
} = require('docx');

const V = JSON.parse(fs.readFileSync('_valores.json', 'utf8'));

const GUINDA = '9F2241', AZUL = '0B6FB4', OCRE = 'A86400';
const TINTA = '1A1A1A', TINTA2 = '4A4A4A', TINTA3 = '767676';
const FONDO = 'F4F2EF', FONDO_AV = 'FBF3F5';
const ANCHO = 9360; // DXA: 6.5" de área de texto en carta

// ── formato de números ──
const n0 = (x) => Math.round(x).toLocaleString('es-MX');
const n1 = (x) => Number(x).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const n2 = (x) => Number(x).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (x) => `${n1(x)} %`;
const mx = (x) => `$${n0(x)}`;
const mx2 = (x) => `$${n2(x)}`;

// ── bloques de texto ──
const p = (texto, o = {}) => new Paragraph({
  spacing: { after: o.after ?? 140, line: o.line ?? 276 },
  alignment: o.align ?? AlignmentType.JUSTIFIED,
  indent: o.indent,
  children: [new TextRun({ text: texto, size: o.size ?? 21, color: o.color ?? TINTA, italics: o.italics, bold: o.bold })],
});

// Párrafo con partes en negrita: rica([['texto normal'],['negrita', true]])
const rica = (partes, o = {}) => new Paragraph({
  spacing: { after: o.after ?? 140, line: 276 },
  alignment: o.align ?? AlignmentType.JUSTIFIED,
  children: partes.map(([t, b, c]) => new TextRun({ text: t, bold: !!b, size: o.size ?? 21, color: c ?? o.color ?? TINTA })),
});

const h1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 380, after: 180 }, keepNext: true,
  children: [new TextRun({ text: t, bold: true, size: 30, color: GUINDA })],
});
const h2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 130 }, keepNext: true,
  children: [new TextRun({ text: t, bold: true, size: 24, color: TINTA })],
});
const h3 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, keepNext: true,
  children: [new TextRun({ text: t, bold: true, size: 21, color: TINTA2 })],
});

const vi = (t, o = {}) => new Paragraph({
  numbering: { reference: 'vinetas', level: o.nivel ?? 0 },
  spacing: { after: 80, line: 268 }, alignment: AlignmentType.JUSTIFIED,
  children: [new TextRun({ text: t, size: 21, color: TINTA })],
});
const viR = (partes, o = {}) => new Paragraph({
  numbering: { reference: 'vinetas', level: o.nivel ?? 0 },
  spacing: { after: 80, line: 268 }, alignment: AlignmentType.JUSTIFIED,
  children: partes.map(([t, b, c]) => new TextRun({ text: t, bold: !!b, size: 21, color: c ?? TINTA })),
});
const num = (t) => new Paragraph({
  numbering: { reference: 'numerada', level: 0 },
  spacing: { after: 80, line: 268 }, alignment: AlignmentType.JUSTIFIED,
  children: [new TextRun({ text: t, size: 21, color: TINTA })],
});

const regla = () => new Paragraph({
  spacing: { before: 60, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'DDD9D4' } },
  children: [new TextRun({ text: '', size: 2 })],
});

// Recuadro destacado (una sola celda sombreada)
const caja = (titulo, lineas, color = GUINDA, fondo = FONDO_AV) => new Table({
  width: { size: ANCHO, type: WidthType.DXA }, columnWidths: [ANCHO],
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: 'E6E2DE' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E6E2DE' },
    left: { style: BorderStyle.SINGLE, size: 18, color },
    right: { style: BorderStyle.SINGLE, size: 2, color: 'E6E2DE' },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  },
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: ANCHO, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: fondo },
      margins: { top: 170, bottom: 170, left: 220, right: 200 },
      children: [
        ...(titulo ? [new Paragraph({
          spacing: { after: 90 },
          children: [new TextRun({ text: titulo, bold: true, size: 20, color, allCaps: true, characterSpacing: 12 })],
        })] : []),
        ...lineas.map((l, i) => new Paragraph({
          spacing: { after: i === lineas.length - 1 ? 0 : 90, line: 268 }, alignment: AlignmentType.JUSTIFIED,
          children: Array.isArray(l) ? l.map(([t, b]) => new TextRun({ text: t, bold: !!b, size: 21, color: TINTA }))
                                     : [new TextRun({ text: l, size: 21, color: TINTA })],
        })),
      ],
    })],
  })],
});

// Tabla de datos. cols = pesos relativos.
const tabla = (encabezados, filas, cols, o = {}) => {
  const total = cols.reduce((a, b) => a + b, 0);
  const anchos = cols.map((c) => Math.round(ANCHO * c / total));
  anchos[0] += ANCHO - anchos.reduce((a, b) => a + b, 0);
  const celda = (txt, i, opts = {}) => new TableCell({
    width: { size: anchos[i], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: opts.fill ?? 'FFFFFF' },
    margins: { top: 85, bottom: 85, left: 110, right: 110 },
    children: String(txt).split('\n').map((linea, k) => new Paragraph({
      spacing: { after: 0, line: 250 },
      alignment: opts.align ?? (i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT),
      children: [new TextRun({
        text: linea, bold: opts.bold, size: opts.size ?? 18,
        color: opts.color ?? (k > 0 ? TINTA3 : TINTA),
      })],
    })),
  });
  return new Table({
    width: { size: ANCHO, type: WidthType.DXA }, columnWidths: anchos,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'C9C4BE' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'C9C4BE' },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E6E2DE' },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        // El encabezado solo se repite en tablas largas: en una tabla corta que termina
        // justo en el salto de página, LibreOffice lo repite sin filas debajo.
        tableHeader: filas.length > 8,
        children: encabezados.map((t, i) => celda(t, i, {
          bold: true, fill: FONDO, color: TINTA, size: 17,
          align: (o.izq || []).includes(i) || i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
        })),
      }),
      ...filas.map((f, r) => new TableRow({
        children: f.map((t, i) => celda(t, i, {
          fill: r % 2 ? 'FAF9F7' : 'FFFFFF',
          bold: o.negritaCol0 && i === 0,
          align: (o.izq || []).includes(i) ? AlignmentType.LEFT : undefined,
        })),
      })),
    ],
  });
};

// Figura + pie de figura
const figura = (archivo, numero, titulo, fuente, ancho = 620) => {
  const buf = fs.readFileSync(`figuras/${archivo}.png`);
  const dim = pngSize(buf);
  const alto = Math.round(ancho * dim.h / dim.w);
  return [
    new Paragraph({
      spacing: { before: 220, after: 70 }, alignment: AlignmentType.CENTER,
      children: [new ImageRun({ data: buf, type: 'png', transformation: { width: ancho, height: alto } })],
    }),
    new Paragraph({
      spacing: { after: 210 }, alignment: AlignmentType.LEFT,
      children: [
        new TextRun({ text: `Figura ${numero}. `, bold: true, size: 17, color: GUINDA }),
        new TextRun({ text: titulo + ' ', size: 17, color: TINTA2 }),
        new TextRun({ text: fuente, size: 17, color: TINTA3, italics: true }),
      ],
    }),
  ];
};

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const salto = () => new Paragraph({ children: [new PageBreak()] });

const numbering = {
  config: [
    {
      reference: 'vinetas',
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: '—', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 220 } }, run: { color: GUINDA } } },
        { level: 1, format: LevelFormat.BULLET, text: '·', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 220 } }, run: { color: TINTA3 } } },
      ],
    },
    {
      reference: 'numerada',
      levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 400, hanging: 260 } }, run: { color: GUINDA, bold: true } } },
      ],
    },
  ],
};

const estilos = {
  default: { document: { run: { font: 'Calibri', size: 21, color: TINTA } } },
  paragraphStyles: [
    { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 44, bold: true, color: GUINDA, font: 'Calibri' } },
  ],
};

const piePagina = (etiqueta) => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.RIGHT,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DDD9D4' } },
    spacing: { before: 100 },
    children: [
      new TextRun({ text: etiqueta + '   ', size: 16, color: TINTA3 }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: TINTA2, bold: true }),
    ],
  })],
});

const propiedadesPagina = {
  page: {
    size: { width: 12240, height: 15840 }, // carta
    margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(0.9), left: convertInchesToTwip(1.05), right: convertInchesToTwip(1.05) },
  },
};

const portada = (titulo, subtitulo, tipo, fecha, autores) => [
  new Paragraph({ spacing: { before: 900, after: 0 },
    children: [new TextRun({ text: 'UNIVERSIDAD NACIONAL ROSARIO CASTELLANOS', size: 19, color: TINTA2, characterSpacing: 26 })] }),
  new Paragraph({ spacing: { after: 40 },
    children: [new TextRun({ text: 'Licenciatura en Ciencia de Datos para el Negocio · 7.º semestre · Sede Santo Tomás · Semestre 2026-2', size: 18, color: TINTA3 })] }),
  regla(),
  new Paragraph({ spacing: { before: 260, after: 100 },
    children: [new TextRun({ text: tipo, size: 19, bold: true, color: GUINDA, allCaps: true, characterSpacing: 22 })] }),
  new Paragraph({ spacing: { after: 130 },
    children: [new TextRun({ text: titulo, size: 46, bold: true, color: TINTA })] }),
  new Paragraph({ spacing: { after: 320 },
    children: [new TextRun({ text: subtitulo, size: 24, color: TINTA2 })] }),
  regla(),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'Proyecto integrador · Problema prototípico', size: 19, color: TINTA2 })] }),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: 'Observatorio de Datos para el Diseño de Programas de Innovación Social en la Economía del Cuidado', size: 19, italics: true, color: TINTA2 })] }),
  new Paragraph({ spacing: { after: 340 },
    children: [new TextRun({ text: fecha, size: 19, color: TINTA3 })] }),
  caja('Equipo y doble revisión', autores, AZUL, FONDO),
];

module.exports = {
  V, GUINDA, AZUL, OCRE, TINTA, TINTA2, TINTA3, FONDO, FONDO_AV, ANCHO,
  n0, n1, n2, pct, mx, mx2, p, rica, h1, h2, h3, vi, viR, num, regla, caja, tabla,
  figura, salto, numbering, estilos, piePagina, propiedadesPagina, portada,
  Paragraph, TextRun, HeadingLevel, AlignmentType, TableOfContents,
};
