/* Contratos de RedCare. Namespace: Care.contrato
 *
 * Decisión del 18 nov 2026: al terminar el registro de «Necesito cuidado» o de «Puedo cuidar» se firma un contrato.
 * Redacción del 20 nov 2026. BORRADOR PARA LA UCA: no es asesoría jurídica y nada aquí está dictaminado (Daniel).
 *
 * Modelo de partes (20 nov 2026, segunda versión): RedCare funciona como Uber, DiDi o Rappi.
 *   - El OPERADOR de RedCare gestiona la plataforma y es el PATRÓN de las personas de relevo, conforme al Capítulo IX Bis de
 *     la LFT (trabajo en plataformas digitales, arts. 291-A a 291-U, DOF 24-dic-2024). El 291-B dice que los usuarios y
 *     beneficiarios no son patrones ni responsables solidarios: el hogar es usuario.
 *   - La persona de relevo decide cuándo se conecta y puede aceptar o rechazar cada oferta sin penalización (291-E).
 *   - Pago por visita que ya incluye la parte proporcional de descanso, vacaciones, prima y aguinaldo (291-F).
 *   - IMSS completo si en el mes gana al menos un salario mínimo mensual neto; si no, es independiente y el operador la
 *     asegura contra riesgos de trabajo mientras trabaja (291-C).
 *   - Las reglas de asignación se explican en una política de gestión algorítmica que forma parte del contrato (291-J).
 *   Esto reemplaza la primera versión del mismo día (operador como patrón por el régimen general), que chocaba con la
 *   prohibición de subcontratación de personal. Sigue por dictaminar (Daniel): si el trabajo de cuidado en casas cabe en el
 *   Cap. IX Bis (el 291-A no lista servicios: habla de actividades que requieren presencia física) y el registro del modelo
 *   de contrato ante el Centro Federal de Conciliación y Registro Laboral (291-G).
 *
 * Firma en el prototipo: firma electrónica simple. Se guarda tipo, versión, fecha y hora, quién firmó (alias o nombre)
 * y la HUELLA SHA-256 del texto firmado (js/huella.js), para probar qué versión se aceptó. No se guarda el texto.
 *
 * Funciones puras: reciben los datos y las dependencias; no tocan el DOM. Las usa app.js y las prueba Node.
 */
(function (raiz) {
  'use strict';

  const VERSION = { servicio: 'RC-CS-2026-11-26', trabajo: 'RC-CT-2026-11-21.3' };
  const TITULO = {
    servicio: 'Convenio de servicio de relevo',
    trabajo: 'Contrato de trabajo en plataforma digital',
  };
  /** Política de gestión algorítmica (LFT 291-J): las reglas reales de js/relevo.js (proponer), en lenguaje llano. */
  const POLITICA = [
    'RedCare te ofrece un caso solo si cumples todo esto: registro aprobado, certificación vigente, tu alcaldía a la distancia máxima configurada, disponible esos días y horas, con horas libres en tu semana y que puedas hacer las tareas que pide el hogar.',
    'Si varias personas cumplen, la oferta va a quien está más cerca. Si hay empate, a quien tiene menos horas asignadas esa semana.',
    'No hay calificaciones de estrellas ni ranking. Rechazar una oferta no te baja de lugar ni te quita ofertas futuras.',
    'Un incidente reportado no te quita casos de forma automática: lo revisa una persona del programa, que te escucha antes de decidir.',
    'No se usan tu sexo, edad ni ninguna característica personal para decidir quién recibe una oferta.',
    'Si estas reglas cambian, se te avisa antes y tienes que aceptarlas de nuevo.',
  ];
  const NO_PERMITIDAS = [
    'Tareas de salud o de enfermería: dar o inyectar medicamentos, curaciones, sondas, signos vitales o terapias',
    'Limpieza general de la casa, lavar ropa o cocinar para todo el hogar',
    'Cuidar a otra persona distinta de la persona cuidada',
    'Trasladar a la persona en vehículo propio',
    'Manejar dinero, tarjetas o claves de la familia',
  ];

  // Cláusula 7 según cómo consintió la persona cuidada (paso «Persona cuidada» de la solicitud).
  const CP_TXT = {
    propio: '«{p}» estuvo presente y aceptó por sí misma recibir relevo en su casa y que se registre cómo hace sus actividades diarias.',
    representante: 'Quien cuida declara representar a «{p}», que no puede expresar su voluntad, y acreditará la representación con documento en la primera visita.',
    pendiente: '«{p}» no estuvo presente: su consentimiento se pedirá en persona en la primera visita, antes de cualquier relevo.',
  };
  const pesos = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dep = (d) => d || (raiz && raiz.Care) || {};

  /* ---------- Convenio de servicio («Necesito cuidado») ---------- */
  /**
   * s: { folio, alias, palias, alcaldia, horasMes, horasSemana, dentro, enfermeria, tareas:[...], dias:[...], inicio }
   * Devuelve { tipo, version, titulo, resumen:[[etiqueta, valor]], clausulas:[{t, txt}], texto }.
   */
  function convenioServicio(s, deps) {
    const C = dep(deps), CP = C.CONFIG_PROGRAMA || {}, RV = C.relevo || {};
    const tareas = (s.tareas && s.tareas.length ? s.tareas : RV.TAREAS || []).join('; ');
    const horas = s.dentro
      ? (s.horasMes ? `${s.horasMes} h al mes (≈ ${s.horasSemana} h por semana), estimadas con la bolsa actual` : 'Entra a la cola: las horas se asignan cuando la bolsa alcance')
      : 'Sin horas este mes: la solicitud queda registrada (cuida menos de 40 h a la semana)';
    const resumen = [
      ['Partes', `${CP.operador || 'Operador de RedCare'} y quien cuida («${s.alias}»), folio ${s.folio || 'por asignar'}`],
      ['Para quién', `Relevo para quien cuida, en beneficio de «${s.palias}»`],
      ['Horas', horas],
      ['Costo para el hogar', '$0. Lo paga el programa. Cualquier aportación se pide por escrito y se firma aparte'],
      ['Quién es patrón', 'El operador de RedCare, como en Uber o Rappi. El hogar es usuario: no es patrón ni le paga a la persona de relevo'],
      ['Puede hacer', tareas],
      ['No puede hacer', 'Tareas de salud o enfermería, limpieza general, cuidar a otra persona, trasladar en auto, manejar dinero'],
      ['Salida', 'Puedes terminar cuando quieras, sin costo, desde la app o con el programa'],
    ];
    const clausulas = [
      { t: '1. Objeto', txt: `El operador ofrece relevo de cuidado por horas para que quien cuida («${s.alias}») descanse, trabaje o atienda sus asuntos. El relevo se da en el domicilio de «${s.palias}», en la alcaldía ${s.alcaldia || 'registrada'}. RedCare es un componente complementario del Sistema Público de Cuidados: no sustituye servicios de salud.` },
      { t: '2. Horas', txt: `${horas}. Las horas dependen del presupuesto del programa y se confirman cada mes. No son un derecho adquirido. Los días y el horario de inicio preferidos (${(s.dias || []).join(', ') || 'por acordar'}, desde las ${s.inicio || '09:00'}) se respetan en lo posible.` },
      { t: '3. Persona de relevo', txt: 'El operador ofrece el caso a una persona de relevo verificada y con certificación vigente, que puede aceptarlo o no. Funciona como una plataforma digital: el operador es su patrón, le paga y responde por ella (Ley Federal del Trabajo, Capítulo IX Bis). El hogar es usuario: no es patrón ni responsable solidario, no le paga, no le da propinas obligatorias y no le da órdenes fuera de este convenio.' },
      { t: '4. Costo', txt: 'El hogar no paga por el relevo. Si el programa llegara a pedir una aportación, se avisará por escrito antes, con el monto, y solo aplica si quien cuida firma un anexo.' },
      { t: '5. Tareas', txt: `Permitidas: ${tareas}. No permitidas: ${NO_PERMITIDAS.join('; ')}.${s.enfermeria ? ' Como declaraste tareas de salud, el programa te orientará a un servicio de enfermería: la persona de relevo no las hace.' : ''}` },
      { t: '6. Compromisos del hogar', txt: 'Tratar con respeto a la persona de relevo; no pedirle tareas ni horas fuera de lo acordado; avisar cancelaciones con 24 horas; mantener condiciones seguras en la casa (sin armas a la vista ni animales sueltos que pongan en riesgo).' },
      { t: '7. Persona cuidada', txt: (CP_TXT[s.consentimientoPersona] || CP_TXT.pendiente).replace('{p}', s.palias) + ` No se asigna relevo sin ese consentimiento. Si «${s.palias}» no quiere el relevo o retira su consentimiento, el servicio no se presta.` },
      { t: '8. Seguimiento e incidentes', txt: 'Se registran llegada y salida de cada visita. Quien cuida puede responder tres preguntas semanales (opcionales): cansancio, noches de mal sueño y si pudo trabajar o estudiar. Cualquiera de las partes puede reportar un incidente; el programa responde y puede cambiar de persona de relevo. En una emergencia, llamar al 911.' },
      { t: '9. Identidad', txt: 'En la app solo se usa un alias. La identidad de quien cuida y su relación con la persona cuidada se verifican en la primera visita o por la institución que refiere; ahí se ratifica este convenio con nombre completo.' },
      { t: '10. Terminación', txt: 'Quien cuida puede terminar el convenio en cualquier momento, sin costo. El operador puede suspenderlo por un incidente grave, con aviso por escrito y derecho a pedir revisión.' },
      { t: '11. Datos personales', txt: `Los datos se tratan según el aviso de privacidad de RedCare y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Los datos de salud se usan solo para la prioridad y la asignación. Para acceder, corregir, cancelar u oponerte: ${CP.contacto_datos || 'contacto por definir'}.` },
    ];
    return armar('servicio', resumen, clausulas, s);
  }

  /* ---------- Contrato de trabajo en plataforma («Puedo cuidar») ---------- */
  /**
   * r: { nombre, alcaldia, dias:[...], desde, hasta, horasMax, tareas:[...] }
   */
  function contratoTrabajo(r, deps) {
    const C = dep(deps), CP = C.CONFIG_PROGRAMA || {}, L = C.legal || {}, RV = C.relevo || {};
    const HP = L.HORA_PLATAFORMA || {}, MAX = L.MAX_H || {};
    const pago = `${pesos(HP.diurna || 0)} por hora diurna, ${pesos(HP.mixta || 0)} mixta y ${pesos(HP.nocturna || 0)} nocturna`;
    const tareas = (r.tareas && r.tareas.length ? r.tareas : RV.TAREAS || []).join('; ');
    const dias = (r.dias || []).join(', ') || 'los que elijas';
    const u = L.umbral291C ? L.umbral291C(r.horasMax) : null;
    const imss = u
      ? `IMSS completo el mes que tus ingresos netos lleguen a ${pesos(u.umbral)} (≈ ${Math.ceil(u.horasMesNecesarias)} h de relevo diurno). Con tus ${r.horasMax} h por semana serían ≈ ${pesos(u.ingreso)}${u.alcanza ? '' : ': no llegas, así que quedas como independiente con seguro de riesgos de trabajo mientras trabajas'}`
      : 'IMSS según los ingresos del mes';
    const resumen = [
      ['Partes', `${CP.operador || 'Operador de RedCare'} (plataforma y patrón) y ${r.nombre || 'la persona de relevo'}`],
      ['Cómo funciona', 'Como Uber o Rappi: te conectas cuando quieres y aceptas o rechazas cada oferta sin castigo'],
      ['Disponibilidad', `Hasta ${r.horasMax} h por semana, ${dias}, de ${r.desde} a ${r.hasta}. La cambias cuando quieras`],
      ['Pago por visita', `${pago}. Ya incluye descanso, vacaciones, prima y aguinaldo. Pago cada semana con recibo`],
      ['Seguro social', imss],
      ['Puede hacer', tareas],
      ['No puede hacer', 'Tareas de salud o enfermería, limpieza general, cuidar a otra persona, trasladar en auto, manejar dinero'],
      ['Tu protección', 'Puedes retirarte de una visita si hay riesgo y reportar maltrato; no pierdes el pago de esa visita'],
    ];
    const clausulas = [
      { t: '1. Partes y régimen', txt: `${CP.operador || 'El operador de RedCare'} gestiona la plataforma RedCare y es el patrón de ${r.nombre || 'la persona de relevo'}, conforme al Capítulo IX Bis de la Ley Federal del Trabajo (trabajo en plataformas digitales). Los hogares que reciben el relevo son usuarios: no son patrones ni responsables solidarios. Este contrato es distinto de los términos de uso de la app.` },
      { t: '2. Cuándo empieza', txt: 'Puedes recibir ofertas cuando el programa verifique tu identidad y tu referencia, tenga una entrevista contigo y tengas certificación vigente; tu primera visita es acompañada. La relación de trabajo existe durante el tiempo efectivamente trabajado: desde que aceptas una visita hasta que termina. Si pasan 30 días seguidos sin actividad, la relación termina sin indemnización; si vuelves, empieza una nueva.' },
      { t: '3. Libertad para conectarte', txt: `Tú decides tus días y horario (hoy: ${dias}, de ${r.desde} a ${r.hasta}, hasta ${r.horasMax} h por semana) y los cambias en la app. Puedes aceptar o rechazar cada oferta. Rechazar no tiene consecuencias. Si aceptas un caso con visitas semanales fijas, te comprometes a esas visitas hasta que avises que lo dejas, con al menos una semana de anticipación, para que el hogar no se quede sin relevo.` },
      { t: '4. Jornada', txt: `Ninguna visita pasa de ${MAX.diurna || 8} h (diurna), ${MAX.mixta || 7.5} h (mixta) o ${MAX.nocturna || 7} h (nocturna). No hay horas extra sin tu acuerdo; si las hay, se pagan conforme a la ley.` },
      { t: '5. Pago', txt: `Por visita, según sus horas: ${pago}. Se calcula con el salario mínimo profesional de personas trabajadoras del hogar (CONASAMI, DOF 9-dic-2025) y ya incluye la parte proporcional de descanso semanal, vacaciones, prima vacacional y aguinaldo, como pide el artículo 291-F. Las propinas no son obligatorias y no forman parte del salario. Se paga cada semana, con recibo. Si el hogar cancela con menos de 24 horas, la visita se paga.` },
      { t: '6. Seguridad social', txt: `${imss}. En cualquier caso, el operador te asegura contra riesgos de trabajo durante el tiempo trabajado (artículo 291-C).` },
      { t: '7. Tareas', txt: `Permitidas: ${tareas}. No permitidas: ${NO_PERMITIDAS.join('; ')}. Puedes negarte a cualquier tarea no permitida y debes reportar si te la piden.` },
      { t: '8. Trato y seguridad', txt: 'Derecho a trato digno y a no ser discriminada. Si hay riesgo para tu integridad, puedes retirarte de la visita, avisar al programa y no pierdes el pago de esa visita. Cada incidente lo revisa una persona.' },
      { t: '9. Registro y contacto', txt: 'La app registra la llegada y la salida de cada visita; con eso se calculan tu tiempo y tu pago. Tu contacto con el programa es la app y la coordinación del programa.' },
      { t: '10. Confidencialidad', txt: 'No tomar fotos, grabar ni compartir datos, imágenes o información de los hogares. Esta obligación sigue después de terminar el contrato.' },
      { t: '11. Política de asignación (anexo)', txt: POLITICA.join(' ') },
      { t: '12. Terminación', txt: 'Puedes darte de baja cuando quieras. El operador puede terminar la relación por las causas que prevé la Ley Federal del Trabajo, después de escucharte.' },
      { t: '13. Datos personales', txt: `La CURP se valida al registrarte y no se guarda completa: solo una huella para evitar duplicados. Los datos para el IMSS se entregan al operador por separado. Para acceder, corregir, cancelar u oponerte: ${CP.contacto_datos || 'contacto por definir'}.` },
    ];
    return armar('trabajo', resumen, clausulas, r);
  }

  function armar(tipo, resumen, clausulas, datos) {
    const titulo = TITULO[tipo];
    const texto = [titulo, `Versión ${VERSION[tipo]}`, '', ...resumen.map(([k, v]) => `${k}: ${v}`), '', ...clausulas.map((c) => `${c.t}. ${c.txt}`)].join('\n');
    return { tipo, version: VERSION[tipo], titulo, resumen, clausulas, texto, datos };
  }

  /** Normaliza un nombre para comparar la firma con el registro (sin acentos, espacios ni mayúsculas). */
  const normal = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const firmaCoincide = (escrito, esperado) => normal(escrito).length >= 3 && normal(escrito) === normal(esperado);

  /** Registro de la firma. Lo único que se guarda del contrato. */
  function firmar(doc, firmante, deps, ahora) {
    const C = dep(deps);
    const sha = C.huella && C.huella.sha256;
    return {
      tipo: doc.tipo, version: doc.version, firmante: String(firmante || '').trim(),
      fecha: (ahora || new Date()).toISOString(), huellaTexto: sha ? sha(doc.texto) : null, metodo: 'firma electrónica simple',
    };
  }

  /** ¿La firma guardada corresponde a este texto? Sirve para probar qué versión se aceptó. */
  const verificar = (firma, doc, deps) => !!(firma && dep(deps).huella && firma.huellaTexto === dep(deps).huella.sha256(doc.texto));

  const API = { VERSION, TITULO, NO_PERMITIDAS, POLITICA, convenioServicio, contratoTrabajo, firmar, verificar, firmaCoincide };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (raiz) { raiz.Care = raiz.Care || {}; raiz.Care.contrato = API; }
})(typeof window !== 'undefined' ? window : null);
