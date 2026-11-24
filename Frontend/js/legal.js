/* Marco legal y filtros de admisión. Namespace: Care.legal
 *
 * Las referencias normativas son orientativas para el prototipo: confirmar redacción, artículos y vigencia
 * contra el texto oficial (DOF) o con asesoría jurídica (revisión: Daniel) antes de usarlas en un documento formal.
 * Sin backend, los filtros se aplican en la interfaz; no sustituyen una verificación real de identidad.
 *
 * Cambio 2026-10-08 (opción C, relevo por horas): el piso pasa de salario mínimo general ÷ 8 a salario mínimo
 * profesional de personas trabajadoras del hogar con divisor por tipo de jornada (mismo criterio que el script 15).
 * La familia ya no captura CURP: la identidad y la legitimación las valida la institución que canaliza.
 *
 * Cambio 2026-11-20: la CURP del relevo se valida aquí y se descarta; se guarda solo su huella (js/huella.js).
 * La referencia (nombre y teléfono) se borra al aprobar o rechazar el registro (store.resolverRelevo).
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

  /* ---------- Trabajo en plataformas digitales (modelo Uber, DiDi, Rappi; 20 nov 2026) ----------
   * LFT, Título Sexto, Capítulo IX Bis (arts. 291-A a 291-U), DOF 24-dic-2024, vigente desde jun 2025.
   *  - 291-B: quien gestiona la plataforma es el patrón; usuarios y beneficiarios NO son patrones ni responsables solidarios.
   *  - 291-C: es persona trabajadora (IMSS completo) quien gana en el mes al menos un salario mínimo mensual neto;
   *    si no, es independiente y la plataforma la asegura solo contra riesgos de trabajo en el tiempo trabajado.
   *  - 291-F: el pago es por tarea e incluye la parte proporcional de descanso semanal, vacaciones, prima y aguinaldo.
   * La regla oficial para calcular el ingreso neto la emite la STPS (transitorio sexto); el factor de abajo es del prototipo. */
  const SM_GENERAL_DIARIO = 315.04;      // 2026, CONASAMI (DOF 09-dic-2025)
  const SM_MENSUAL = 9582.47;            // 315.04 × 365 / 12
  const PROPORCIONALES = {               // POR VERIFICAR (Daniel): aproximación del prototipo a la regla del 291-F
    descanso_semanal: 1 / 6,             // un día de descanso por cada seis trabajados
    aguinaldo: 15 / 365,                 // 15 días al año
    vacaciones: 12 / 365,                // 12 días el primer año (reforma de 2023)
    prima_vacacional: (12 / 365) * 0.25, // 25 % de las vacaciones
  };
  const FACTOR_291F = Object.values(PROPORCIONALES).reduce((t, v) => t + v, 0); // ≈ 0.249
  const HORA_PLATAFORMA = { diurna: 0, nocturna: 0, mixta: 0 };
  Object.keys(HORA).forEach((k) => { HORA_PLATAFORMA[k] = HORA[k] * (1 + FACTOR_291F); });
  /** Ingreso mensual de una persona de relevo y si llega al umbral del 291-C (estimación con pago diurno). */
  function umbral291C(horasSemana, semanasMes) {
    const ingreso = (+horasSemana || 0) * (semanasMes || 4.33) * HORA_PLATAFORMA.diurna;
    return { ingreso, umbral: SM_MENSUAL, alcanza: ingreso >= SM_MENSUAL, horasMesNecesarias: SM_MENSUAL / HORA_PLATAFORMA.diurna };
  }

  /* ---------- Catálogo normativo ---------- */
  const MARCO = {
    plataformas: { norma: 'Ley Federal del Trabajo, Título Sexto, Cap. IX Bis (arts. 291-A a 291-U), DOF 24-dic-2024', tema: 'Trabajo en plataformas digitales: la plataforma es el patrón; los hogares usuarios no son patrones; pago por tarea con proporcionales; política de gestión algorítmica.' },
    lftHogar: { norma: 'Ley Federal del Trabajo, Título Sexto, Cap. XIII (arts. 331-343)', tema: 'Trabajo del hogar: jornada, descansos, modalidades y condiciones.' },
    lftJornada: { norma: 'Ley Federal del Trabajo, arts. 60 y 61', tema: 'Jornada diurna (06:00-20:00), nocturna (20:00-06:00) y mixta; máximos de 8, 7 y 7.5 h.' },
    lftEscrito: { norma: 'Ley Federal del Trabajo, arts. 24 y 25', tema: 'Las condiciones de trabajo constan por escrito.' },
    lftMenores: { norma: 'Ley Federal del Trabajo, art. 22', tema: 'Restricciones al trabajo de menores de edad.' },
    salario: { norma: 'Resolución CONASAMI (DOF 09-dic-2025)', tema: 'Salario mínimo profesional de personas trabajadoras del hogar como piso de la remuneración.' },
    imss: { norma: 'Ley del Seguro Social', tema: 'Aseguramiento de las personas trabajadoras del hogar (verificar artículos y vigencia).' },
    // 18 nov 2026: RedCare se trata como sector privado (decisión de Omar). Artículos por verificar (Daniel).
    datos: { norma: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20-mar-2025)', tema: 'Aviso de privacidad. Las horas de cuidado, la dependencia de la persona cuidada (Barthel), la bandera de tareas de salud y cómo se siente quien cuida son datos sensibles: consentimiento expreso.' },
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
    // 21 nov 2026: se retira la carta de no antecedentes penales. La SCJN invalidó exigirla de forma general
    // (AI 38/2022: personal de cuidado infantil; AI 111/2023: conductores de plataformas). La sustituyen la
    // entrevista de verificación, la referencia, la certificación y la primera visita acompañada.
    r.push({ id: 'ref', ok: !!(d.refNombre && d.refNombre.trim().length >= 3 && validarTelefono(d.refTel)), txt: 'Una referencia con nombre y teléfono de 10 dígitos', base: null });
    r.push({ id: 'disp', ok: d.dias > 0 && d.horasMax >= 3, txt: 'Al menos un día disponible y 3 h por semana o más', base: null });
    // 20 nov 2026: ya no es una casilla. Se firma el contrato de trabajo (js/contrato.js) escribiendo el mismo nombre del registro.
    r.push({ id: 'contrato', ok: !!d.contrato, txt: 'Contrato de trabajo firmado (alta en el IMSS y pago al piso legal)', base: MARCO.lftEscrito });
    r.push({ id: 'privacidad', ok: !!d.privacidad, txt: 'He leído el aviso de privacidad', base: MARCO.datos });
    r.push({ id: 'veracidad', ok: !!d.veracidad, txt: 'Declaro bajo protesta de decir verdad que mis datos y documentos son ciertos', base: null });
    return r;
  }

  /* ---------- Formalización de la asignación ---------- */
  function requisitosAsignacion(d) {
    return [
      { id: 'jornada', ok: !!d.jornadaOk, txt: 'Cada visita respeta la jornada máxima de su tipo (diurna 8 h, nocturna 7 h, mixta 7.5 h)', base: MARCO.lftJornada },
      { id: 'escrito', ok: !!d.escrito, txt: 'Convenio del hogar y contrato de la persona de relevo firmados', base: MARCO.lftEscrito },
      { id: 'imss', ok: !!d.imss, txt: 'La persona de relevo queda inscrita en el IMSS', base: MARCO.imss },
      { id: 'pagador', ok: !!d.pagadorOk, txt: 'Quién paga está definido (familia, subsidio o mixto)', base: null },
      // 20 nov 2026
      { id: 'persona', ok: !!d.personaOk, txt: 'Consentimiento de la persona cuidada otorgado, o representación acreditada', base: MARCO.datos },
      { id: 'acepta', ok: !!d.acepta, txt: 'La persona de relevo aceptó la oferta (puede rechazarla sin penalización)', base: MARCO.plataformas },
    ];
  }

  const pendientes = (reqs) => reqs.filter((x) => !x.ok);

  window.Care.legal = {
    MARCO, DOCS_ID, SALARIO_DIARIO, MAX_H, HORA, MIN_HORA, EDAD_MIN,
    SM_GENERAL_DIARIO, SM_MENSUAL, PROPORCIONALES, FACTOR_291F, HORA_PLATAFORMA, umbral291C,
    validarCURP, validarTelefono, enmascarar,
    requisitosCanalizacion, requisitosRelevo, requisitosAsignacion, pendientes,
  };
})();
