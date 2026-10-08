// Genera Replanteamiento_problema_programa_v0.1.docx
// Todas las cifras se leen de _valores.json, que se extrae de Analysis/resultados/*.csv y Analysis/datos/enasic_2022_cifras_presentacion.csv
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, LevelFormat, BorderStyle, PageBreak, Footer, PageNumber, TableOfContents
} = require('docx');

const V = JSON.parse(fs.readFileSync(__dirname + '/_valores.json', 'utf8'));
const pc = (k) => `${V[k].pct}%`;
const ci = (k) => `IC90% ${V[k].li}–${V[k].ls}; CV ${V[k].cv}%, precisión ${V[k].prec}`;
const pr = (i) => V['precio' + i].v;
const fmt = (n) => Number(n).toLocaleString('es-MX', { maximumFractionDigits: 0 });

const FONT = 'Arial';
const W = 9360;

// --- helpers --------------------------------------------------------------
function runs(text, base = {}) {
  // **negritas** en línea
  return text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(t =>
    t.startsWith('**') ? new TextRun({ text: t.slice(2, -2), bold: true, ...base }) : new TextRun({ text: t, ...base }));
}
const P = (t, o = {}) => new Paragraph({ children: runs(t), spacing: { after: 120, line: 300 }, alignment: AlignmentType.JUSTIFIED, ...o });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)], spacing: { before: 360, after: 160 } });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)], spacing: { before: 240, after: 120 } });
const B = (t, lvl = 0) => new Paragraph({ children: runs(t), numbering: { reference: 'vinetas', level: lvl }, spacing: { after: 60, line: 280 } });
const N = (t) => new Paragraph({ children: runs(t), numbering: { reference: 'numeros', level: 0 }, spacing: { after: 60, line: 280 } });
const Fuente = (t) => new Paragraph({
  children: [new TextRun({ text: 'Fuente: ', bold: true, size: 18, color: '555555' }), ...runs(t, { size: 18, color: '555555', italics: true })],
  spacing: { after: 200 }, border: { left: { style: BorderStyle.SINGLE, size: 12, color: '9F2241', space: 6 } }, indent: { left: 120 }
});
const Nivel = (nivel, porque) => new Paragraph({
  children: [new TextRun({ text: `Nivel de evidencia: ${nivel}. `, bold: true, size: 18, color: '0F6E64' }), new TextRun({ text: porque, size: 18, color: '0F6E64' })],
  spacing: { after: 200 }, indent: { left: 120 }
});

const border = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' };
const borders = { top: border, bottom: border, left: border, right: border };
function T(header, rows, widths) {
  const sum = widths.reduce((a, b) => a + b, 0);
  const cols = widths.map(w => Math.round(w / sum * W));
  cols[cols.length - 1] += W - cols.reduce((a, b) => a + b, 0);
  const cell = (txt, i, head) => new TableCell({
    width: { size: cols[i], type: WidthType.DXA }, borders,
    shading: head ? { fill: 'EFE3E6', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: String(txt).split('\n').map(line => new Paragraph({ children: runs(line, { size: 18, bold: head || undefined }) }))
  });
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: cols,
    rows: [new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, i, true)) }),
           ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, i, false)) }))]
  });
}
const sp = () => new Paragraph({ children: [], spacing: { after: 120 } });

// --- contenido ------------------------------------------------------------
const C = [];

// Portada
C.push(new Paragraph({ children: [], spacing: { before: 1800 } }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Universidad Nacional Rosario Castellanos', size: 24 })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: 'Licenciatura en Ciencia de Datos para el Negocio · 7.º semestre · 2026-2', size: 22 })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Observatorio de Datos para la Economía del Cuidado', size: 28, bold: true, color: '9F2241' })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: 'Replanteamiento del problema y del programa a partir de la evidencia', size: 36, bold: true })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Proyecto integrador (problema prototípico)', size: 22 })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Equipo: Omar Gutiérrez Escoto (líder), Daniel Cureño Martínez, Alondra Danae Madrigal García', size: 22 })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: 'Versión 0.1 · borrador · 20 de septiembre de 2026', size: 20 })] }));
C.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Estado: pendiente de revisión por Daniel Cureño y Alondra Danae Madrigal (protocolo de doble revisión)', size: 20, bold: true, color: 'D6202B' })] }));
C.push(new Paragraph({ children: [new PageBreak()] }));

C.push(new Paragraph({ children: [new TextRun({ text: 'Contenido', bold: true, size: 28 })], spacing: { after: 200 } }));
C.push(new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-2' }));
C.push(new Paragraph({ children: [new PageBreak()] }));

// 0
C.push(H1('0. Cómo leer este documento'));
C.push(P('Este documento es la **fuente argumentativa** del replanteamiento. **No origina cifras**: cada número se lee de un archivo de resultados reproducible (notebook o CSV), según la regla de trazabilidad del proyecto. Cada párrafo que afirma algo cierra con un recuadro **Fuente**, que apunta a un identificador del registro de la sección 13 (F1, F2…), y con un **Nivel de evidencia**.'));
C.push(T(['Nivel', 'Significado en este documento'], [
  ['Confirmado', 'Cifra publicada por la fuente oficial o reproducida exactamente con código a partir de ella.'],
  ['Probable', 'Resultado de un análisis propio reproducible, con supuestos o limitaciones que se declaran.'],
  ['Desconocido', 'No hay dato que lo sostenga. Se dice explícitamente y no se rellena con supuestos.'],
], [1.2, 5]));
C.push(sp());
C.push(P('**Regla de alcance.** La ENASIC 2022 es una encuesta **nacional**. No permite estimaciones para la Ciudad de México ni por alcaldía. En este documento se usa como **contexto de mecanismo**, es decir, para entender por qué no se usan los servicios. **Nunca** se usa como dato de Iztapalapa ni de ninguna alcaldía. El componente territorial (sección 5) usa otras fuentes.'));
C.push(Fuente('Instrucciones del proyecto ("Hechos verificados que condicionan el trabajo"); F4, sección 1.'));
C.push(P('**Precisión estadística.** Las estimaciones propias con microdatos se clasifican con el criterio del INEGI según el coeficiente de variación (CV): alta si el CV es menor a 15%, moderada entre 15% y 30%, y baja de 30% en adelante. **Las estimaciones de precisión baja no se usan como hallazgo**; cuando aparecen, se marcan.'));
C.push(Fuente('F4, sección 3 ("Precisiones estadísticas").'));

// 1
C.push(H1('1. Resumen'));
C.push(P('El equipo partió del supuesto de que las familias no encuentran servicios de cuidado, y de que una aplicación que conectara "Necesito cuidado" con "Puedo cuidar" resolvería esa brecha. Se probó ese supuesto con los microdatos de la ENASIC 2022 y **no se sostiene**. El problema se replantea así:'));
C.push(B(`Solo ${pc('busca_todas')} de las personas cuidadoras buscó un servicio de cuidado desde octubre de 2021. Entre quienes no buscaron, "desconoce que existen" es ${pc('todas_desc')} (precisión ${V.todas_desc.prec}).`));
C.push(B(`Si tuvieran que contratar, ${pc('prefobj_casa')} de quienes cuidan a una persona con discapacidad o de 60 años y más lo preferiría **en su casa**, y ${pc('prefobj_no')} no contrataría.`));
C.push(B(`${pc('oferta')} de la población de 15 a 60 años declara que le gustaría ser cuidador(a) si le pagaran. Es una **oferta declarada**, no una oferta real.`));
C.push(B(`Solo ${pc('contr_cual')} de los hogares con una persona con discapacidad o de 60+ contrata enfermería o cuidadora. En la muestra, el pago por ese servicio equivale a cerca de **${pr(6)}% del ingreso mensual mediano** de esos hogares. Es un cálculo descriptivo con n = ${pr(2) ? V.precio2.n : ''}.`));
C.push(B(`En la CDMX, Iztapalapa tiene ${V.iztap_share60}% de la población de 60+ y ${V.iztap_share_plazas}% de las plazas en residencias privadas. Es un resultado probable, porque las fuentes no tienen origen documentado.`));
C.push(P('**Problema replanteado:** en los hogares que necesitan cuidado para personas con discapacidad o de 60 años y más, la necesidad de cuidado en casa **no se convierte en cuidado contratado**. La barrera observable es el **costo frente al ingreso**, reforzada por una **norma de que la familia cuida**, y no la falta de información. El programa de innovación social debe atacar la asequibilidad del cuidado domiciliario. La aplicación deja de ser la solución y pasa a ser la plataforma del Observatorio y, si acaso, una herramienta dentro del programa.'));
C.push(Fuente('F6 (notebook 03 y sus resultados); F7 (notebook 02); secciones 4 y 5 de este documento.'));

// 2
C.push(H1('2. Historia del supuesto (registro real de cambios)'));
C.push(P('Por la regla de "historia real" del proyecto, se deja constancia de que la solución original **antecedió** al análisis. Esto también es materia de la UCA Seminario de Titulación, que pregunta cómo reformular un anteproyecto "cuando la evidencia generada por el propio proyecto integrador contradice el supuesto inicialmente planteado".'));
C.push(T(['Fecha', 'Qué pasó', 'Fuente'], [
  ['11 sep 2026', 'Se construye una demo de app: clasificador NLP de solicitudes, redes de cuidado y panel BI. Se declara prototipo conceptual con datos sintéticos, no el Observatorio validado.', 'F14, entrada 2026-09-11'],
  ['18 sep 2026', 'El equipo decide pasar de la exploración de fuentes a la etapa de diseño. Omar lo reportó el 20 de septiembre; no hay acta de esa reunión.', 'F14, entrada 2026-09-20 (más tarde)'],
  ['20 sep 2026', 'DENUE: el conteo de asilos sugiere un faltante de oferta residencial en el oriente. El de centros de día no respalda un faltante en la periferia.', 'F13; F14'],
  ['20 sep 2026', 'Capacidad (plazas) contra población 60+: Iztapalapa tiene un cociente de localización de 0.05.', 'F7'],
  ['20 sep 2026', 'Microdatos ENASIC: "desconoce que existen" < 1%; preferencia por el cuidado en casa; contratación ≈ 1%; precio alto frente al ingreso.', 'F5; F6'],
  ['20 sep 2026', 'Omar decide reencuadrar el programa alrededor del precio y del cuidado domiciliario, y descarta mantener el matching como hipótesis central. Falta la confirmación del equipo.', 'F14, entrada 2026-09-20 21:50'],
], [1.1, 5, 1.8]));
C.push(sp());
C.push(P('**Corrección documentada.** En una revisión previa se afirmó, por una lectura automática del cuestionario, que la ENASIC no preguntaba por qué no se buscan servicios. Al abrir los microdatos se comprobó que **sí lo pregunta** (P6.42–P6.45). La afirmación anterior queda registrada como error en la bitácora.'));
C.push(Fuente('F14, entradas "Conociendo la base de datos" y "Microdatos ENASIC"; diccionario de datos de TPOB_CUI dentro de F5.'));

// 3
C.push(H1('3. Planteamiento del problema reformulado'));
C.push(H2('3.1 Enunciado'));
C.push(P('En México, los hogares donde vive una persona con discapacidad o dependencia, o una persona de 60 años y más, **declaran necesitar más cuidado del que reciben**, y la forma de cuidado que más piden es un **apoyo personal en casa** (enfermería, persona cuidadora o de compañía). Sin embargo, **casi no contratan** ese cuidado. El costo del cuidado contratado representa una fracción muy alta de su ingreso, y predomina la idea de que cuidar es responsabilidad de la familia. Mientras tanto, una proporción grande de la población, sobre todo de mujeres, declara que estaría dispuesta a cuidar de forma remunerada. El resultado es que el cuidado sigue recayendo en cuidadoras familiares no remuneradas, con costos para su empleo, su tiempo y su salud.'));
C.push(Fuente('Demanda y tipo de cuidado: F2, láminas 16, 19, 26 y 29. Contratación, preferencia, oferta y precio: F6. Norma familiar: F2, lámina 52, y F6. Costos para las cuidadoras: F2, lámina 47. Detalle en la sección 4.'));
C.push(Nivel('Confirmado para las cifras publicadas por el INEGI; probable para la interpretación conjunta', 'La conexión entre precio y baja contratación es una inferencia. La ENASIC no pregunta directamente por qué no se contrata cuidado domiciliario (ver sección 11).'));
C.push(H2('3.2 Delimitación'));
C.push(T(['Dimensión', 'Delimitación', 'Justificación / fuente'], [
  ['Qué', 'Cuidado domiciliario de personas con discapacidad o dependencia y de personas de 60+: necesidad, preferencia, contratación y costo.', 'Es el tipo de cuidado más pedido y el que se prefiere contratar (F2 lám. 19 y 29; F6 bloque 4).'],
  ['Quién', 'Hogares con esa población (HN_CDISC = 1 o HN_C60MA = 1) y sus personas cuidadoras (FILTRO6_1 = 1 o FILTRO6_6 = 1).', 'Variables de THOGAR y TPOB_CUI (F5; F4).'],
  ['Dónde', 'Mecanismo: nacional (ENASIC). Territorio del Observatorio: CDMX por alcaldía, con otras fuentes. Sede del piloto: por definir.', 'La ENASIC no desagrega por entidad para este uso (instrucciones del proyecto). La sede del piloto no está confirmada (F14).'],
  ['Cuándo', 'Corte transversal: ENASIC levantada del 24 de octubre al 16 de diciembre de 2022; DENUE 05/2026. Sin tendencias.', 'F2 lámina 7. Solo hay una edición de la ENASIC; no se afirman tendencias.'],
], [1, 3.4, 3.4]));

// 4
C.push(H1('4. Evidencia que sustenta el replanteamiento'));
C.push(P(`Todas las estimaciones de esta sección, salvo las citadas de F2 o F3, provienen de F6: estimación ponderada con el factor de la tabla correspondiente y varianza por linealización de Taylor (estratos EST_DIS, conglomerados UPM_DIS). **Validación del método:** el notebook reproduce la participación en cuidados publicada, ${pc('val_cuida')} de la población de 15+ (${fmt(V.val_cuida.tot)} personas; el INEGI publica 32.0% y 31.7 millones). La contratación de enfermería o cuidadoras da ${pc('val_contrata')} de los hogares (IC90% ${V.val_contrata.li}–${V.val_contrata.ls}); el valor publicado de ${V.e_contrata_enf}% queda dentro del intervalo.`));
C.push(Fuente(`F6, sección 1.1 (bloque "0_validacion" de 03_enasic_barreras_estimaciones.csv); F3 p. 14; F4.`));
C.push(Nivel('Confirmado', 'El procedimiento reproduce cifras oficiales.'));

C.push(H2('4.1 Hay necesidad de cuidado no cubierta, y la que se pide es cuidado personal en casa'));
C.push(P(`A nivel nacional, ${V.e_disc_norecibe}% de las personas con discapacidad o dependencia **no recibe cuidados**, y ${V.e_60disc_norecibe}% de las personas de 60+ con discapacidad o dependencia tampoco. ${V.e_mas_tiempo}% de las personas con discapacidad o dependencia necesita más tiempo de cuidado. Entre ellas, ${V.e_enf_disc}% pide apoyo de enfermería o de una persona cuidadora, y solo ${V.e_resdia_disc}% pide una residencia de día. Entre las personas de 60+ sin discapacidad que necesitan más cuidado, ${V.e_enf_60}% pide enfermería, cuidadora o compañía, y solo ${V.e_resperm_60}% pide una residencia permanente. Además, solo ${V.e_asiste_centro}% de las personas con discapacidad o dependencia asiste a un centro de cuidados.`));
C.push(Fuente('F2, láminas 16, 17, 19, 26 y 29; transcritas en Analysis/datos/enasic_2022_cifras_presentacion.csv (columna lamina_pdf).'));
C.push(Nivel('Confirmado', 'Son cifras publicadas por el INEGI, de cobertura nacional.'));
C.push(P('**Por qué importa para la decisión:** la demanda apunta a **cuidado domiciliario**, no a instituciones. Un programa centrado en abrir residencias o en canalizar a centros atendería la forma de cuidado menos pedida.'));

C.push(H2('4.2 La barrera de información no se sostiene'));
C.push(P(`La pregunta P6.42 indaga si, desde octubre de 2021, la persona buscó directamente una guardería, casa del abuelo o asilo. Solo ${pc('busca_todas')} de las personas cuidadoras lo hizo (${ci('busca_todas')}). A quienes no buscaron, P6.45 les pregunta por qué (respuesta múltiple). En la población objetivo (cuidadoras de personas con discapacidad o de 60+):`));
C.push(T(['Razón para no buscar (P6.45)', 'Cuidan disc./60+', 'Todas las cuidadoras', 'Población 15–60'], [
  ['No ha tenido necesidad', `${pc('obj_nonec')} (CV ${V.obj_nonec.cv})`, `${pc('todas_nonec')} (CV ${V.todas_nonec.cv})`, `${pc('p1560_nonec')} (CV ${V.p1560_nonec.cv})`],
  ['El propio hogar cuida', `${pc('obj_hogar')} (CV ${V.obj_hogar.cv})`, `${pc('todas_hogar')} (CV ${V.todas_hogar.cv})`, `${pc('p1560_hogar')} (CV ${V.p1560_hogar.cv})`],
  ['Apoyan otros hogares, familiares o conocidos', `${pc('obj_apoyan')} (CV ${V.obj_apoyan.cv})`, `${pc('todas_apoyan')} (CV ${V.todas_apoyan.cv})`, `${pc('p1560_apoyan')} (CV ${V.p1560_apoyan.cv})`],
  ['Son caros', `${pc('obj_caros')} (CV ${V.obj_caros.cv})`, `${pc('todas_caros')} (CV ${V.todas_caros.cv})`, `${pc('p1560_caros')} (CV ${V.p1560_caros.cv})`],
  ['Lejanía', `${pc('obj_lej')} (CV ${V.obj_lej.cv})`, `${pc('todas_lej')} (CV ${V.todas_lej.cv})`, `${pc('p1560_lej')} (CV ${V.p1560_lej.cv})`],
  ['**Desconoce que existen**', `${pc('obj_desc')} (CV ${V.obj_desc.cv}, baja)`, `**${pc('todas_desc')}** (CV ${V.todas_desc.cv})`, `${pc('p1560_desc')} (CV ${V.p1560_desc.cv})`],
  ['Desconfianza de que alguien ajeno cuide', `${pc('obj_desconf')} (CV ${V.obj_desconf.cv}, baja)`, `${pc('todas_desconf')} (CV ${V.todas_desconf.cv})`, `${pc('p1560_desconf')} (CV ${V.p1560_desconf.cv})`],
  ['Maltrato del personal', `${pc('obj_maltrato')} (CV ${V.obj_maltrato.cv}, baja)`, `${pc('todas_maltrato')} (CV ${V.todas_maltrato.cv})`, `${pc('p1560_maltrato')} (CV ${V.p1560_maltrato.cv})`],
], [3, 2, 2, 2]));
C.push(sp());
C.push(P(`Además, de quienes sí buscaron, ${pc('cumplio')} encontró un servicio que cumplía lo que buscaba (${ci('cumplio')}). La razón dominante para no buscar es que la necesidad no se percibe o que la familia ya cuida. "No saber que existen" queda por debajo de 1% en las poblaciones donde la estimación es confiable.`));
C.push(Fuente('F6, secciones 2 y 3 (bloques "2_busqueda_*" y "3_quienes_buscaron" de 03_enasic_barreras_estimaciones.csv). Variables P6_42, P6_43 y P6_45_01 a P6_45_10 de TPOB_CUI y TPER_ELE (F5).'));
C.push(Nivel('Probable (con estimaciones de precisión alta o moderada)', 'Es un análisis propio y reproducible con microdatos oficiales. Límite: P6.45 pregunta por **lugares** (guardería, casa del abuelo, asilo), no por contratar a una persona que cuide en casa.'));
C.push(P('**Por qué importa para la decisión:** un matching resuelve fallas de información. Los datos no muestran que esa sea la barrera, así que un programa construido solo sobre conectar oferta con demanda no tiene sustento empírico. Así lo pide el problema prototípico: "programa social derivado de un hallazgo del Observatorio, no de una solución preconcebida" (F1).'));

C.push(H2('4.3 La preferencia es el cuidado en casa'));
C.push(T(['Si tuviera que contratar un servicio de cuidado, ¿dónde lo preferiría? (P6.46)', 'Cuidan disc./60+', 'Población 15–60'], [
  ['En su casa', `${pc('prefobj_casa')} (CV ${V.prefobj_casa.cv})`, `${pc('pref1560_casa')} (CV ${V.pref1560_casa.cv})`],
  ['No contrataría', `${pc('prefobj_no')} (CV ${V.prefobj_no.cv})`, `${pc('pref1560_no')} (CV ${V.pref1560_no.cv})`],
  ['Centro o institución pública', `${pc('prefobj_pub')} (CV ${V.prefobj_pub.cv})`, `${pc('pref1560_pub')} (CV ${V.pref1560_pub.cv})`],
  ['Centro o institución privada', `${pc('prefobj_priv')} (CV ${V.prefobj_priv.cv}, baja)`, `${pc('pref1560_priv')} (CV ${V.pref1560_priv.cv})`],
  ['Casa de un familiar, amistad o conocido', `${pc('prefobj_fam')} (CV ${V.prefobj_fam.cv}, baja)`, `${pc('pref1560_fam')} (CV ${V.pref1560_fam.cv})`],
], [4, 2, 2]));
C.push(sp());
C.push(Fuente('F6, sección 4 (bloque "4_preferencia_lugar"); variable P6_46 (F5).'));
C.push(Nivel('Probable', 'Preferencia declarada ante una pregunta hipotética.'));

C.push(H2('4.4 Existe oferta declarada de cuidadoras'));
C.push(P(`${pc('oferta')} de la población de 15 a 60 años respondió que sí le gustaría ser cuidador(a) profesional si le pagaran (${ci('oferta')}). Entre mujeres es ${pc('oferta_m')} y entre hombres ${pc('oferta_h')}. De quienes dijeron que sí, ${pc('capac')} estaría dispuesto(a) a capacitarse. Entre las personas que ya cuidan, la disposición es ${pc('oferta_cui')}.`));
C.push(Fuente('F6, sección 5 (bloque "5_oferta_declarada"); variables P6_47 y P6_48 (F5).'));
C.push(Nivel('Probable', 'Es **intención declarada**, no oferta efectiva: no mide capacitación real, disponibilidad horaria ni el precio al que se ofrecería. El lado "Puedo cuidar" existe como disposición, no como mercado verificado.'));

C.push(H2('4.5 Casi no se contrata, y el precio es alto frente al ingreso'));
C.push(P(`Solo ${pc('contr_cual')} de los hogares con una persona con discapacidad o de 60+ contrata enfermería o cuidadora (${ci('contr_cual')}). En contraste, ${pc('dom_cual')} de esos mismos hogares contrata trabajo doméstico de entrada por salida (CV ${V.dom_cual.cv}). Es decir, los hogares sí pagan por trabajo en casa, pero muy poco por cuidado.`));
C.push(T(['Indicador (muestra, sin ponderar salvo el ingreso)', 'Valor', 'n'], [
  ['Pago semanal mediano, cuidadora o enfermería contratada', `$${fmt(pr(2))}`, V.precio2.n],
  ['Pago mensual equivalente (mediana semanal × 4.33)', `$${fmt(pr(3))}`, V.precio3.n],
  ['Ingreso mensual mediano ponderado de hogares con discapacidad o 60+', `$${fmt(pr(4))}`, V.precio4.n],
  ['Ingreso mensual, percentil 25 ponderado', `$${fmt(pr(5))}`, V.precio5.n],
  ['Pago mensual como % del ingreso mediano', `${pr(6)}%`, '—'],
  ['Pago mensual como % del ingreso p25', `${pr(7)}%`, '—'],
], [5, 1.4, 0.8]));
C.push(sp());
C.push(Fuente('F6, sección 6 (bloque "6_contratacion" de 03_enasic_barreras_estimaciones.csv y archivo 03_precio_vs_ingreso_muestra.csv); variables P2_4_1, P2_4_3, P2_4_4, P2_8_3, P2_8_4 y P3A_4 de THOGAR (F5).'));
C.push(Nivel('Probable para la tasa de contratación; descriptivo (no inferencial) para el precio', `El pago proviene de solo ${V.precio2.n} hogares de toda la muestra nacional, sin ponderar, y depende de las horas contratadas. Debe citarse como **orden de magnitud**, nunca como cifra de titular.`));
C.push(P(`Coherente con esto, entre las personas que estarían de acuerdo con llevar a una persona mayor a una institución, el "precio accesible" aparece en ${V.e_precio}% de las menciones, muy por debajo de "personal capacitado" (${V.e_capacitado}%) y "buen trato" (${V.e_trato}%). Para las instituciones, el precio no es lo que más se nombra. Para el cuidado domiciliario contratado, el costo observado sí es alto frente al ingreso. Son dos fenómenos distintos y no deben mezclarse.`));
C.push(Fuente('F2, lámina 51.'));

C.push(H2('4.6 La norma de que la familia cuida es fuerte'));
C.push(P(`${V.e_rechazo_res}% de las personas de 15 a 60 años está en desacuerdo con que la lleven a una residencia o casa de día cuando sea mayor. Entre ellas, el motivo principal es que el cuidado es responsabilidad de los hijos o de la familia (${V.e_fam}%), seguido de "tratan mal a las personas" (${V.e_maltrato}%). "Son muy caros" es solo ${V.e_caros}%. Esto coincide con el ${pc('obj_hogar')} de cuidadoras de personas con discapacidad o de 60+ que no busca servicios porque el propio hogar cuida (sección 4.2).`));
C.push(Fuente('F2, lámina 52; F6, sección 2.'));
C.push(Nivel('Confirmado (F2) y probable (F6)', ''));

C.push(H2('4.7 El costo recae en las cuidadoras'));
C.push(P(`Entre las mujeres cuidadoras de 15 a 60 años que desean trabajar y no lo hacen, ${V.e_no_trabaja}% dice que no tiene quién cuide a sus hijas(os), a personas adultas mayores o a personas enfermas. Esto sostiene la relevancia económica y de género del problema: el cuidado no contratado tiene un costo de oportunidad en empleo.`));
C.push(Fuente('F2, lámina 47.'));
C.push(Nivel('Confirmado', 'Cifra publicada, nacional.'));

// 5
C.push(H1('5. Evidencia territorial en la CDMX'));
C.push(P(`Para el componente territorial del Observatorio se usaron fuentes distintas de la ENASIC. Se comparó la capacidad (plazas) de las residencias permanentes privadas con la población de 60+ por alcaldía, mediante un cociente de localización (QL). Un QL de 1 significa que la alcaldía tiene la parte de las plazas que le corresponde por su población. Iztapalapa concentra ${V.iztap_share60}% de la población de 60+ de la CDMX y ${V.iztap_share_plazas}% de las plazas: su QL es ${V.ql_IZTAP.QL_p60_A}.`));
C.push(T(['Alcaldía', 'Plazas', 'QL 60+', 'QL 80+', 'QL dependencia (ADL)'], [
  ['Iztapalapa', V.ql_IZTAP.plazas, V.ql_IZTAP.QL_p60_A, V.ql_IZTAP.QL_p80_A, V.ql_IZTAP.QL_adl_A],
  ['Iztacalco', V.ql_IZTAC.plazas, V.ql_IZTAC.QL_p60_A, V.ql_IZTAC.QL_p80_A, V.ql_IZTAC.QL_adl_A],
  ['Gustavo A. Madero', V.ql_GAM.plazas, V.ql_GAM.QL_p60_A, V.ql_GAM.QL_p80_A, V.ql_GAM.QL_adl_A],
  ['Benito Juárez', V.ql_BJ.plazas, V.ql_BJ.QL_p60_A, V.ql_BJ.QL_p80_A, V.ql_BJ.QL_adl_A],
  ['Tlalpan', V.ql_TLAL.plazas, V.ql_TLAL.QL_p60_A, V.ql_TLAL.QL_p80_A, V.ql_TLAL.QL_adl_A],
  ['Miguel Hidalgo', V.ql_MH.plazas, V.ql_MH.QL_p60_A, V.ql_MH.QL_p80_A, V.ql_MH.QL_adl_A],
], [2.2, 1, 1, 1, 1.6]));
C.push(sp());
C.push(P('El orden de las alcaldías casi no cambia al usar distintos denominadores (Spearman ≥ 0.94, n = 12). Antes, el conteo de establecimientos del DENUE ya había sugerido un faltante de oferta residencial en el oriente. Ese mismo análisis mostró que el número de establecimientos no sirve como aproximación de la capacidad (Spearman 0.27), y que la clase SCIAN de centros de día mezcla cuidado con recreación: 59 de 126 son clubes o grupos.'));
C.push(Fuente('F7 (02_indice_capacidad_residencial.csv, escenario A, que excluye las alcaldías sin dato); fuentes de entrada F8, F9, F10 y F11. Resultados del DENUE: F13, según lo registrado en F14; el notebook 01 no se re-ejecutó para este documento.'));
C.push(Nivel('Probable', 'Se desconocen el productor, el año y el método del CSV de capacidad. Venustiano Carranza, Tláhuac, Cuajimalpa y Milpa Alta no aparecen en él, y no se sabe si equivalen a 0. Que el archivo de población 60+ sea del Censo 2020 es probable, no confirmado (F7, ficha de fuentes). Además, el denominador ADL incluye todas las edades.'));
C.push(P('**Cómo encaja con el replanteamiento:** el faltante de plazas residenciales en el oriente es real en los datos disponibles. Pero la sección 4.1 muestra que la residencia es la forma de cuidado **menos pedida**. Por eso este faltante **no justifica por sí solo abrir residencias**. Sirve para priorizar territorialmente un programa de cuidado domiciliario asequible, siempre que se valide con una fuente de CDMX o con el piloto.'));

// 6
C.push(H1('6. Justificación'));
C.push(P('**Social.** Una parte importante de las personas con discapacidad o dependencia y de las personas mayores con discapacidad no recibe cuidados (sección 4.1). El cuidado disponible recae en cuidadoras familiares, mayoritariamente mujeres, con efectos sobre su empleo (sección 4.7).'));
C.push(Fuente('F2, láminas 16, 26, 33 y 47.'));
C.push(P('**Económica y de negocio.** Existe demanda de cuidado en casa, preferencia declarada por contratarlo en casa y oferta declarada de personas dispuestas a cuidar, pero casi no hay transacciones. Una brecha así, entre demanda y oferta sin intercambio, es un problema clásico de **asequibilidad y diseño de mercado**, no de información. Es precisamente el tipo de problema que la UCA Analítica para los Negocios pide convertir en "iniciativas, servicios o programas que generen beneficios para las comunidades y, al mismo tiempo, sean viables para las organizaciones".'));
C.push(Fuente('Secciones 4.3 a 4.5 (F6); F1, incidente crítico de Analítica para los Negocios.'));
C.push(P('**Metodológica y disciplinar.** El supuesto inicial del equipo se sometió a prueba con microdatos oficiales, estimación con diseño muestral y validación contra cifras publicadas, y se descartó con evidencia. Esto responde directamente a la pregunta detonadora del Seminario de Titulación sobre cómo reformular el encuadre cuando la evidencia contradice el supuesto. También evita el error descrito en el caso "El espejismo tecnológico": diseñar la tecnología antes de plantear bien el problema.'));
C.push(Fuente('F1 (Seminario de Titulación, pregunta detonadora); F15, caso de estudio; secciones 2 y 4.2 de este documento.'));

// 7
C.push(H1('7. Objetivos'));
C.push(H2('7.1 Objetivo general (institucional, sin cambios)'));
C.push(P('"Diseñar y validar un Observatorio de Datos que genere inteligencia para comprender la economía del cuidado y sustente el desarrollo de un programa prototípico de innovación social orientado a vincular necesidades de cuidado con servicios, personas u organizaciones, mediante analítica, herramientas avanzadas, protección responsable de datos y evaluación de impacto."'));
C.push(Fuente('F1, "Objetivo general". Es asignado por la institución: no se modifica, se delimita.'));
C.push(P('**Nota:** el objetivo institucional habla de "vincular". El replanteamiento no lo contradice: el programa sigue vinculando necesidades con personas. Lo que cambia es **qué barrera** se ataca para que esa vinculación ocurra: el costo, no la información.'));
C.push(H2('7.2 Objetivos específicos del equipo (reformulados)'));
C.push(N('Cuantificar, con estimaciones de precisión conocida, la brecha entre necesidad declarada de cuidado domiciliario, preferencia por contratarlo, oferta declarada de cuidadoras y contratación efectiva. Evidencia de partida: sección 4 (F6).'));
C.push(N('Estimar el costo del cuidado domiciliario frente al ingreso de los hogares con necesidad, e identificar una fuente con representatividad para la CDMX. La ENESS 2017 es candidata, pero no está verificada (F3, p. 7).'));
C.push(N('Construir el componente territorial del Observatorio para la CDMX con fuentes de capacidad y población documentadas. Punto de partida: F7 y F13.'));
C.push(N('Diseñar un programa de innovación social que reduzca la barrera de costo del cuidado domiciliario, y compararlo contra una alternativa simple, como exige el proyecto.'));
C.push(N('Probar en el piloto de práctica profesional por qué una familia no contrata cuidado en casa, que es la barrera que la ENASIC no mide (sección 11).'));
C.push(Fuente('Instrucciones del proyecto (modelado frente a alternativa simple); F1 (evidencias por UCA).'));

// 8
C.push(H1('8. Supuesto de trabajo e hipótesis refutables'));
C.push(P('**Supuesto de trabajo (vigente).** La principal barrera para que la necesidad de cuidado domiciliario se convierta en cuidado contratado es su **costo frente al ingreso** del hogar, reforzada por una norma familiar de cuidado.'));
C.push(T(['Hipótesis', 'Qué la apoyaría', 'Qué la refutaría', 'Dónde se prueba'], [
  ['H1. Costo: si baja el costo efectivo para la familia, aumenta la contratación de cuidado domiciliario.', 'En el piloto, las familias con necesidad aceptan cuidado subsidiado o de bajo costo.', 'Con costo reducido siguen sin aceptar, por norma familiar o desconfianza.', 'Piloto de práctica profesional; ENESS 2017 si se verifica.'],
  ['H2. Norma familiar: la familia prefiere cuidar aunque el servicio sea asequible.', 'Rechazo al servicio aun con costo cero.', 'Aceptación alta cuando el costo baja.', 'Piloto (entrevista de rechazo).'],
  ['H0 (descartada para servicios institucionales). Información: las familias no buscan porque no saben que existen los servicios.', '—', '"Desconoce que existen" < 1% (sección 4.2).', 'Ya probada con F6. Sigue abierta solo para el cuidado domiciliario.'],
], [2.6, 2, 2, 1.6]));
C.push(sp());
C.push(Fuente('Secciones 4.2 a 4.6; F1 (Seminario: "hipótesis o supuesto concordante con los datos disponibles y no con expectativas previas").'));

// 9
C.push(H1('9. Qué cambia en el programa de innovación social'));
C.push(P('**Decisión tomada (pendiente de confirmación del equipo):** el programa se reencuadra alrededor de la asequibilidad del cuidado domiciliario. **No se ha elegido** todavía un diseño concreto. Estas son alternativas que la evidencia permite considerar, con su sustento y su mayor riesgo:'));
C.push(T(['Alternativa', 'Sustento en la evidencia', 'Riesgo principal / qué falta'], [
  ['A. Esquema de pago compartido o subsidio al cuidado domiciliario', 'Precio alto frente al ingreso (4.5); preferencia por el cuidado en casa (4.3).', 'Requiere un aliado que financie (gobierno, empresa, OSC). No hay dato de CDMX sobre la disposición a pagar.'],
  ['B. Red o cooperativa de cuidadoras capacitadas con tarifa accesible', 'Oferta declarada de 40% y disposición a capacitarse de 95% (4.4); la confianza pesa (4.5, 4.6).', 'La oferta declarada puede no volverse oferta real. Tiene implicaciones laborales y legales.'],
  ['C. Respiro y apoyo a cuidadoras familiares', 'Norma de que la familia cuida (4.6); costo laboral para las cuidadoras (4.7).', 'No aumenta el cuidado contratado. Es la respuesta si H2 resulta cierta.'],
  ['Matching puro (original)', 'Ninguna: la barrera de información no se observa (4.2).', 'Queda descartado como programa central. Puede ser un componente operativo de A o B.'],
], [2.4, 3, 3]));
C.push(sp());
C.push(Fuente('Secciones 4.2 a 4.7; F14, decisión del 2026-09-20 21:50.'));
C.push(P('**Sobre la aplicación.** La demostración del prototipo del Observatorio como "aplicación o plataforma" es un requisito de la presentación final (F1). La aplicación sigue existiendo como plataforma del Observatorio (datos, indicadores, tablero). La demo del 11 de septiembre (clasificador NLP y redes de cuidado, con datos sintéticos) **no se presenta como el programa** ni como evidencia.'));
C.push(Fuente('F1, "Presentación y defensa"; F14, entrada 2026-09-11.'));

// 10
C.push(H1('10. Aportación de cada UCA con el replanteamiento'));
C.push(T(['UCA', 'Responsable', 'Qué aporta ahora'], [
  ['Inteligencia de Negocios', 'Alondra Danae Madrigal', 'Indicadores de la brecha: necesidad, preferencia, oferta declarada, contratación y costo/ingreso, cada uno con su CV. Tablero del Observatorio.'],
  ['Analítica para los Negocios', 'Alondra Danae Madrigal', 'Modelo de sostenibilidad de la alternativa elegida (A, B o C): quién paga, costo por hora y escenarios.'],
  ['Herramientas y Técnicas Avanzadas', 'Omar Gutiérrez', 'Estimación con diseño muestral (ya en F6); modelo comparado contra una alternativa simple; componente territorial (F7).'],
  ['Leyes para la Protección de Datos', 'Daniel Cureño', 'Protocolo para los datos del piloto, que involucran a población vulnerable. Si se elige B, marco laboral de las cuidadoras.'],
  ['Práctica Profesional I', 'Daniel Cureño', 'Piloto que mida por qué una familia no contrata cuidado domiciliario y pruebe H1 contra H2. Sede por definir.'],
  ['Seminario de Titulación I', 'Omar Gutiérrez', 'El docente informó que no se realizará para el problema prototípico. La historia del supuesto (sección 2) puede servir al anteproyecto individual.'],
], [2.2, 1.8, 4.4]));
C.push(sp());
C.push(Fuente('Asignación de UCA registrada en la memoria del proyecto (equipo confirmado); F1, "Saberes mínimos a integrar".'));

// 11
C.push(H1('11. Lo que este documento NO permite afirmar'));
C.push(T(['Afirmación que NO se puede hacer', 'Por qué'], [
  ['"En Iztapalapa las familias no contratan cuidado por su costo."', 'La ENASIC es nacional. No hay ningún dato de la CDMX sobre contratación ni precio.'],
  ['"El cuidado en casa cuesta el 53% del ingreso."', `Es la mediana de ${V.precio2.n} hogares sin ponderar, que depende de las horas. Solo sirve como orden de magnitud.`],
  ['"El matching no sirve."', 'Lo descartado es la barrera de información para servicios **institucionales**. Contratar cuidado en casa no se preguntó directamente.'],
  ['"Hay 32 millones de cuidadoras disponibles."', 'La P6.47 mide intención ante una pregunta hipotética, no oferta real.'],
  ['"Faltan residencias en el oriente y hay que abrirlas."', 'El faltante de plazas es probable (fuentes sin origen documentado), y la residencia es la forma de cuidado menos pedida.'],
  ['"La brecha va en aumento."', 'Solo hay una edición de la ENASIC; no hay tendencia.'],
  ['Cualquier cifra de la demo del 11 de septiembre.', 'Son datos sintéticos.'],
], [3.5, 4.5]));
C.push(sp());
C.push(Fuente('Instrucciones del proyecto ("Afirmaciones acotadas"); F6; F7; F14.'));

// 12
C.push(H1('12. Pendientes'));
C.push(T(['Pendiente', 'Por qué importa', 'Responsable'], [
  ['Confirmar el replanteamiento con Daniel y Danae', 'Protocolo de doble revisión: hoy es decisión de Omar, no del equipo.', 'Omar'],
  ['Elegir una alternativa (A, B o C) o una combinación', 'Sin eso no hay programa que modelar ni que probar en el piloto.', 'Equipo'],
  ['Verificar la ENESS 2017 (representatividad por entidad, pago a cuidadores)', 'Sería el primer dato de precio para la CDMX.', 'Por asignar'],
  ['Documentar el origen del CSV de capacidad y de las 4 alcaldías faltantes', 'Para pasar la sección 5 de probable a confirmada.', 'Por asignar'],
  ['Confirmar que el CSV de población 60+ es del Censo 2020', 'Hoy es probable, no confirmado.', 'Por asignar'],
  ['Definir la sede del piloto', 'Condiciona la priorización territorial y el tamaño del piloto.', 'Daniel'],
  ['Actualizar las instrucciones del proyecto (etapa vigente)', 'Todavía dicen "exploración", pero el equipo decidió pasar a diseño el 18 de septiembre.', 'Omar'],
  ['Revisar este documento y firmar la versión', 'Doble revisión.', 'Daniel o Danae'],
], [3.2, 3.4, 1.4]));

// 13
C.push(H1('13. Registro de fuentes'));
C.push(P('Rutas relativas a la carpeta del proyecto (pp26-2). "Verificación" indica qué se comprobó y qué no.'));
C.push(T(['ID', 'Archivo / ubicación', 'Qué contiene', 'Cobertura', 'Verificación'], [
  ['F1', 'PROBLEMA PROTOTÍPICO 7° SEM LCDN 20262.pdf', 'Planteamiento institucional, objetivos, evidencias por UCA, incidentes críticos.', '—', 'Documento oficial del curso.'],
  ['F2', 'enasic_2022_presentacion.pdf → Analysis/datos/enasic_2022_cifras_presentacion.csv', 'Principales resultados de la ENASIC 2022 (INEGI, 25 feb 2025).', 'Nacional', 'Cifras transcritas a mano con número de lámina.'],
  ['F3', 'ENASIC_23.pdf (comunicado 578/23)', 'Comunicado de prensa con resultados y nota técnica.', 'Nacional', 'p. 14 transcrita al CSV de F2.'],
  ['F4', '889463927082.pdf', 'ENASIC 2022: Conociendo la base de datos (tablas, llaves, factores, diseño, CV).', '—', 'Documento oficial del INEGI.'],
  ['F5', 'Analysis/datos/enasic/ (microdatos CSV, 6 tablas)', 'Microdatos, diccionarios y catálogos.', 'Nacional', 'Descargados del INEGI por el equipo. No se versionan (38 MB).'],
  ['F6', 'Analysis/03_enasic_barreras_uso_servicios.ipynb → resultados/03_enasic_barreras_estimaciones.csv, 03_precio_vs_ingreso_muestra.csv', 'Estimaciones con diseño muestral: búsqueda, razones, preferencia, oferta, contratación y precio.', 'Nacional', 'Reproduce cifras publicadas (32.0%; 31.7 M).'],
  ['F7', 'Analysis/02_capacidad_residencial_vs_poblacion.ipynb → resultados/02_indice_capacidad_residencial.csv, 02_fichas_fuentes.csv', 'QL de capacidad residencial privada contra 60+, 80+ y dependencia.', 'CDMX por alcaldía', 'Probable: fuentes de entrada sin origen documentado.'],
  ['F8', 'Capacidad disponible en residencias permanentes de sector privado… .csv', 'Plazas por alcaldía.', '12 alcaldías', 'Productor, año y método desconocidos.'],
  ['F9', 'Población de más de 60 años.csv', '% de la población total CDMX, por alcaldía y grupo quinquenal 60+.', 'CDMX', 'Suma verificada; año probable 2020.'],
  ['F10', 'Población con discapacidad que necesita ayuda… .csv', 'Personas con limitación o discapacidad, por actividad y alcaldía (todas las edades).', 'CDMX', 'Origen desconocido; tipología del Censo 2020 (probable).'],
  ['F11', 'Centros de día para adultos y adultas mayores del sector público.csv', 'Número de instituciones públicas por tipo y alcaldía.', 'CDMX', 'Conteos, no capacidad. Origen desconocido.'],
  ['F12', 'Proyección de la población por grupos de edad y alcaldía en porcentaje.csv', 'Proyección 2015–2030 por alcaldía, sexo y edad.', 'CDMX', 'Se usó solo para acotar el año de F9. Productor desconocido.'],
  ['F13', 'Analysis/01_denue_oferta_cuidado.ipynb + DENUE 05_2026', 'Establecimientos de cuidado por clase SCIAN y alcaldía.', 'CDMX', 'Resultados tomados de F14; no re-ejecutado para este documento.'],
  ['F14', 'claude/bitacora-decisiones.md (Project)', 'Registro fechado de decisiones y hallazgos.', '—', 'Fuente interna.'],
  ['F15', 'Manual. Seminario de Investigación 1.pdf', 'Caso "El espejismo tecnológico".', '—', 'Documento del curso.'],
], [0.5, 2.6, 2.4, 1.1, 1.8]));

// 14
C.push(H1('14. Referencias (APA 7)'));
const refs = [
  'Instituto Nacional de Estadística y Geografía. (2023, 3 de octubre). *Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022* [Comunicado de prensa núm. 578/23].',
  'Instituto Nacional de Estadística y Geografía. (2023). *Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022: Conjunto de datos* [Microdatos en CSV]. https://www.inegi.org.mx/programas/enasic/2022/',
  'Instituto Nacional de Estadística y Geografía. (2025). *Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022: Principales resultados* [Presentación]. https://www.inegi.org.mx/contenidos/programas/enasic/2022/doc/enasic_2022_presentacion.pdf',
  'Instituto Nacional de Estadística y Geografía. (2025). *Encuesta Nacional para el Sistema de Cuidados 2022. ENASIC: Conociendo la base de datos*. https://www.inegi.org.mx/contenidos/productos/prod_serv/contenidos/espanol/bvinegi/productos/nueva_estruc/889463927082.pdf',
  'Instituto Nacional de Estadística y Geografía. (s. f.). *Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022: Cuestionario*. https://www.inegi.org.mx/contenidos/programas/enasic/2022/doc/enasic_2022_cuestionario.pdf',
  'Universidad Nacional Rosario Castellanos. (2026). *Problema prototípico, 7.º semestre, Licenciatura en Ciencia de Datos para el Negocio, 2026-2* [Documento institucional].',
];
for (const r of refs) {
  C.push(new Paragraph({
    indent: { left: 720, hanging: 720 }, spacing: { after: 120 },
    children: r.split(/(\*[^*]+\*)/).filter(Boolean).map(t => t.startsWith('*') ? new TextRun({ text: t.slice(1, -1), italics: true }) : new TextRun(t))
  }));
}
C.push(P('**Nota:** el comunicado 578/23 se cita sin URL porque el archivo lo proporcionó el equipo y su dirección en el sitio del INEGI no se verificó. Las fuentes F8 a F12 no se citan en APA porque se desconoce su productor. Deben documentarse antes de entrar en una versión final.'));

// --- documento ------------------------------------------------------------
const doc = new Document({
  creator: 'Equipo Observatorio del Cuidado', title: 'Replanteamiento del problema y del programa',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, font: FONT, color: '9F2241' }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: FONT, color: '333333' }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ]
  },
  numbering: { config: [
    { reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
                                     { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } }] },
    { reference: 'numeros', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'Replanteamiento v0.1 · borrador sin revisión · pág. ', size: 16, color: '777777' }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '777777' })] })] }) },
    children: C
  }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(__dirname + '/Replanteamiento_problema_programa_v0.1.docx', b); console.log('ok'); });
