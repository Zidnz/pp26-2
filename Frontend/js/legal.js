/* Marco legal y filtros de admisión. Namespace: Care.legal
 *
 * Las referencias normativas son orientativas para el prototipo: confirmar redacción, artículos y vigencia
 * contra el texto oficial (DOF) o con asesoría jurídica (revisión: Daniel) antes de usarlas en un documento formal.
 * Sin backend, los filtros se aplican en la interfaz; no sustituyen una verificación real de identidad.
 *
 * Cambio 2026-10-08 (opción C, relevo por horas): el piso pasa de salario mínimo general ÷ 8 a salario mínimo
 * profesional de personas trabajadoras del hogar con divisor por tipo de jornada (mismo criterio que el script 15).
 * La familia ya no captura CURP: la identidad y la legitimación las valida la institución que canaliza.
 */
(function () {
  'use strict';

  /* ---------- Parámetros (los mismos que Analysis/15_anuncios_pago_implicito.py) ---------- */
  // Salario mínimo profesional diario de personas trabajadoras del hogar 2026 (CONASAMI, DOF 09-dic-2025). POR VERIFICAR vigencia.
  const SALARIO_DIARIO = 342.47;
  // LFT art. 61: jornada máxima por tipo. La hora ordinaria = salario diario / máximo de la jornada.
  const MAX_H = { diurna: 8, nocturna: 7, mixta: 7.5 };
  const HORA = { diurna: SALARIO_DIARIO / 8, nocturna: SALARIO_DIARIO / 7, mixta: SALARIO_DIARIO / 7.5 };
  const MIN_HORA = Math.ceil(HORA.diurna * 100) / 100; // piso más bajo posible (jornada diurna)
  const EDAD_MIN = 18;                   // criterio de plataforma
  const VIGENCIA_ANTECEDENTES_DIAS = 90; // criterio de plataforma

  /* ---------- Catálogo normativo ---------- */
  const MARCO = {
    lftHogar: { norma: 'Ley Federal del Trabajo, Título Sexto, Cap. XIII (arts. 331-343)', tema: 'Trabajo del hogar: jornada, descansos, modalidades y condiciones.' },
    lftJornada: { norma: 'Ley Federal del Trabajo, arts. 60 y 61', tema: 'Jornada diurna (06:00-20:00), nocturna (20:00-06:00) y mixta; máximos de 8, 7 y 7.5 h.' },
    lftEscrito: { norma: 'Ley Federal del Trabajo, arts. 24 y 25', tema: 'Las condiciones de trabajo constan por escrito.' },
    lftMenores: { norma: 'Ley Federal del Trabajo, art. 22', tema: 'Restricciones al trabajo de menores de edad.' },
    salario: { norma: 'Resolución CONASAMI (DOF 09-dic-2025)', tema: 'Salario mínimo profesional de personas trabajadoras del hogar como piso de la remuneración.' },
    imss: { norma: 'Ley del Seguro Social', tema: 'Aseguramiento de las personas trabajadoras del hogar (verificar artículos y vigencia).' },
    datos: { norma: 'Ley de protección de datos personales aplicable (particulares o sujetos obligados, según la institución)', tema: 'Aviso de privacidad. La ayuda en actividades básicas y los daños a la salud son datos sensibles: consentimiento expreso. Verificar la ley vigente tras la reforma de 2025.' },
  };

  const DOCS_ID = ['INE/IFE vigente', 'Pasaporte vigente', 'Tarjeta de residente'];

  /* ---------- Validadores ---------- */
  const CURP_RE = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;
  const DICC = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

  function digitoCURP(c17) {
    let s = 0;
    for (let i = 0; i < 17; i++) s += DICC.indexOf(c17[i]) * (18 - i);
    return (10 - (s % 10)) % 10;
  }

  function edadDesdeCURP(curp, hoy) {
    const aa = +curp.slice(4, 6), mm = +curp.slice(6, 8), dd = +curp.slice(8, 10);
    const anio = (/\d/.test(curp[16]) ? 1900 : 2000) + aa;
    const h = hoy || new Date();
    let e = h.getFullYear() - anio;
    if (h.getMonth() + 1 < mm || (h.getMonth() + 1 === mm && h.getDate() < dd)) e--;
    return e;
  }

  function validarCURP(txt) {
    const curp = String(txt || '').trim().toUpperCase();
    if (!CURP_RE.test(curp)) return { ok: false, curp, error: 'CURP no válida: revisa que tenga 18 caracteres con el formato oficial.' };
    if (digitoCURP(curp.slice(0, 17)) !== +curp[17]) return { ok: false, curp, error: 'CURP no válida: el dígito verificador no coincide.' };
    const edad = edadDesdeCURP(curp);
    if (edad < 0 || edad > 110) return { ok: false, curp, error: 'CURP no válida: la fecha de nacimiento no es plausible.' };
    return { ok: true, curp, edad };
  }

  const enmascarar = (curp) => (curp ? curp.slice(0, 4) + '••••••••••' + curp.slice(-4) : '');
  const validarTelefono = (txt) => /^\d{10}$/.test(String(txt || '').replace(/[\s()-]/g, ''));

  function diasDesde(iso, hoy) {
    const t = Date.parse(iso);
    if (isNaN(t)) return null;
    return Math.floor(((hoy || new Date()).getTime() - t) / 86400000);
  }

  /* ---------- Canalización de un caso ("Necesito cuidado") ---------- */
  // La familia no se registra sola: la institución canaliza, valida identidad y legitimación fuera de la app.
  function requisitosCanalizacion(d) {
    return [
      { id: 'inst', ok: !!d.inst, txt: 'La institución validó identidad y relación con la persona cuidada (fuera de la app; no se guarda CURP de la familia)', base: null },
      { id: 'privacidad', ok: !!d.privacidad, txt: 'Se entregó el aviso de privacidad a la cuidadora familiar', base: MARCO.datos },
      { id: 'sensibles', ok: !!d.sensibles, txt: 'Consentimiento expreso para registrar ayuda en actividades básicas y daños a la salud (datos sensibles)', base: MARCO.datos },
    ];
  }

  /* ---------- Registro de una persona de relevo ("Puedo cuidar") ---------- */
  function requisitosRelevo(d) {
    const cur = validarCURP(d.curp);
    const r = [];
    r.push({ id: 'curp', ok: cur.ok && cur.edad >= EDAD_MIN, txt: cur.ok ? (cur.edad >= EDAD_MIN ? 'CURP válida de persona mayor de edad' : `Debes ser mayor de ${EDAD_MIN} años`) : (d.curp ? cur.error : 'Captura tu CURP'), base: MARCO.lftMenores });
    if (d.duplicada) r.push({ id: 'dup', ok: false, txt: 'Ya existe un registro con esta CURP', base: null });
    r.push({ id: 'doc', ok: !!d.docId, txt: 'Elige el documento de identidad que presentarás en la revisión', base: null });
    const dias = diasDesde(d.antecedentesFecha);
    r.push({ id: 'antec', ok: dias != null && dias >= 0 && dias <= VIGENCIA_ANTECEDENTES_DIAS, txt: `Carta de no antecedentes penales con menos de ${VIGENCIA_ANTECEDENTES_DIAS} días de expedida`, base: null });
    r.push({ id: 'ref', ok: !!(d.refNombre && d.refNombre.trim().length >= 3 && validarTelefono(d.refTel)), txt: 'Una referencia con nombre y teléfono de 10 dígitos', base: null });
    r.push({ id: 'disp', ok: d.dias > 0 && d.horasMax >= 3, txt: 'Al menos un día disponible y 3 h por semana o más', base: null });
    r.push({ id: 'contrato', ok: !!d.contrato, txt: 'Acepto contrato por escrito, alta en el IMSS y pago al piso legal según el tipo de jornada', base: MARCO.lftEscrito });
    r.push({ id: 'privacidad', ok: !!d.privacidad, txt: 'He leído el aviso de privacidad', base: MARCO.datos });
    r.push({ id: 'veracidad', ok: !!d.veracidad, txt: 'Declaro bajo protesta de decir verdad que mis datos y documentos son ciertos', base: null });
    return r;
  }

  /* ---------- Formalización de la asignación ---------- */
  function requisitosAsignacion(d) {
    return [
      { id: 'jornada', ok: !!d.jornadaOk, txt: 'Cada visita respeta la jornada máxima de su tipo (diurna 8 h, nocturna 7 h, mixta 7.5 h)', base: MARCO.lftJornada },
      { id: 'escrito', ok: !!d.escrito, txt: 'Contrato por escrito antes de la primera visita', base: MARCO.lftEscrito },
      { id: 'imss', ok: !!d.imss, txt: 'La persona de relevo queda inscrita en el IMSS', base: MARCO.imss },
      { id: 'pagador', ok: !!d.pagadorOk, txt: 'Quién paga está definido (familia, subsidio o mixto)', base: null },
    ];
  }

  const pendientes = (reqs) => reqs.filter((x) => !x.ok);

  window.Care.legal = {
    MARCO, DOCS_ID, SALARIO_DIARIO, MAX_H, HORA, MIN_HORA, EDAD_MIN, VIGENCIA_ANTECEDENTES_DIAS,
    validarCURP, validarTelefono, enmascarar,
    requisitosCanalizacion, requisitosRelevo, requisitosAsignacion, pendientes,
  };
})();
