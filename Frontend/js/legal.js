/* Marco legal y filtros de admisión. Namespace: Care.legal
 *
 * Las referencias normativas son orientativas para el prototipo: confirmar redacción, artículos y vigencia
 * contra el texto oficial (DOF) o con asesoría jurídica antes de usarlas en un documento formal.
 * Sin backend, los filtros se aplican en la interfaz; no sustituyen una verificación real de identidad. */
(function () {
  'use strict';

  /* ---------- Parámetros de plataforma (criterios propios, ajustables) ---------- */
  // Salario mínimo general diario. Valor de referencia 2026: verificar contra CONASAMI antes de citarlo.
  const SALARIO_MIN_DIARIO = 315.04;
  const JORNADA_HORAS = 8;
  const MIN_HORA = Math.ceil((SALARIO_MIN_DIARIO / JORNADA_HORAS) * 100) / 100;
  const EDAD_MIN = 18;                 // criterio de plataforma: más estricto que la edad mínima laboral
  const VIGENCIA_ANTECEDENTES_DIAS = 90; // criterio de plataforma para la carta de no antecedentes penales
  const MAX_PETICIONES_ACTIVAS = 2;    // por CURP de quien solicita

  /* ---------- Catálogo normativo ---------- */
  const MARCO = {
    lftHogar: { norma: 'Ley Federal del Trabajo, Título Sexto, Cap. XIII (arts. 331-343)', tema: 'Trabajo del hogar: jornada, descansos, modalidades (de planta / entrada por salida) y condiciones.' },
    lftEscrito: { norma: 'Ley Federal del Trabajo, arts. 24 y 25', tema: 'Las condiciones de trabajo constan por escrito.' },
    lftMenores: { norma: 'Ley Federal del Trabajo, art. 22', tema: 'Restricciones al trabajo de menores de edad.' },
    salario: { norma: 'Ley Federal del Trabajo, art. 90 y resoluciones de la CONASAMI', tema: 'Salario mínimo general vigente como piso de la remuneración.' },
    imss: { norma: 'Ley del Seguro Social', tema: 'Aseguramiento de las personas trabajadoras del hogar (verificar artículos y vigencia).' },
    datos: { norma: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares', tema: 'Aviso de privacidad; los datos de salud son sensibles y requieren consentimiento expreso.' },
    salud: { norma: 'Ley General de Salud, art. 79, y Ley Reglamentaria del art. 5º constitucional', tema: 'Ejercer enfermería exige título registrado y cédula profesional.' },
    civil: { norma: 'Código Civil (patria potestad, tutela y representación)', tema: 'Quién puede solicitar cuidado en nombre de un menor o de una persona sin capacidad de ejercicio.' },
  };

  const LEGITIMACION = {
    propia: { t: 'Solicito cuidado para mí', pide: null },
    familiar: { t: 'Familiar de la persona a cuidar', pide: null },
    tutor: { t: 'Madre, padre, tutor/a o curador/a', pide: 'Declaro ejercer patria potestad, tutela o curatela sobre la persona a cuidar.' },
    apoderado: { t: 'Representante o apoderado/a', pide: 'Declaro contar con autorización escrita de la persona a cuidar o de su representante legal.' },
    ninguna: { t: 'Ninguna de las anteriores', pide: null },
  };

  const DOCS_ID = ['INE/IFE vigente', 'Pasaporte vigente', 'Tarjeta de residente'];
  const MODALIDADES = ['Entrada por salida', 'De planta'];

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

  /** { ok, curp, edad, error } */
  function validarCURP(txt) {
    const curp = String(txt || '').trim().toUpperCase();
    if (!CURP_RE.test(curp)) return { ok: false, curp, error: 'CURP no válida: revisa que tenga 18 caracteres con el formato oficial.' };
    if (digitoCURP(curp.slice(0, 17)) !== +curp[17]) return { ok: false, curp, error: 'CURP no válida: el dígito verificador no coincide.' };
    const edad = edadDesdeCURP(curp);
    if (edad < 0 || edad > 110) return { ok: false, curp, error: 'CURP no válida: la fecha de nacimiento no es plausible.' };
    return { ok: true, curp, edad };
  }

  const enmascarar = (curp) => (curp ? curp.slice(0, 4) + '••••••••••' + curp.slice(-4) : '');
  const validarCedula = (txt) => /^\d{7,8}$/.test(String(txt || '').trim());
  const validarTelefono = (txt) => /^\d{10}$/.test(String(txt || '').replace(/[\s()-]/g, ''));

  function diasDesde(iso, hoy) {
    const t = Date.parse(iso);
    if (isNaN(t)) return null;
    return Math.floor(((hoy || new Date()).getTime() - t) / 86400000);
  }

  /* ---------- Filtro de admisión de la petición (antes de escribir nada) ---------- */
  /** { ok, motivo, emergencia } a partir de { mayor, legit, emergencia } */
  function admisionPeticion(a) {
    if (a.emergencia) return { ok: false, emergencia: true, motivo: 'Si hay riesgo inmediato para la vida o la salud, llama al 911. Esta plataforma no atiende emergencias.' };
    if (!a.mayor) return { ok: false, motivo: `Para publicar una petición debes ser mayor de ${EDAD_MIN} años.` };
    if (!a.legit) return { ok: false, motivo: 'Indica cuál es tu relación con la persona a cuidar.' };
    if (a.legit === 'ninguna') return { ok: false, motivo: 'Solo pueden solicitar cuidado la propia persona, su familia, su tutor/a o quien la represente con autorización. Pide a quien corresponda que publique la petición.' };
    return { ok: true };
  }

  /* ---------- Requisitos legales de la petición ---------- */
  /** Devuelve [{ id, ok, txt, base }] con todo lo que exige publicar. `d` = datos capturados. */
  function requisitosPeticion(d) {
    const cur = validarCURP(d.curp);
    const r = [];
    r.push({ id: 'curp', ok: cur.ok && cur.edad >= EDAD_MIN, txt: cur.ok ? (cur.edad >= EDAD_MIN ? 'CURP válida de persona mayor de edad' : `La CURP corresponde a una persona menor de ${EDAD_MIN} años`) : (d.curp ? cur.error : 'Captura tu CURP'), base: MARCO.civil });
    const pide = LEGITIMACION[d.legit] && LEGITIMACION[d.legit].pide;
    const menor = d.edadCuidada != null && d.edadCuidada < 18;
    if (pide || menor) {
      const txt = menor && d.legit !== 'tutor' && d.legit !== 'apoderado'
        ? 'La persona a cuidar es menor de edad: solo madre, padre, tutor/a o representante autorizado puede solicitar'
        : (pide || LEGITIMACION.tutor.pide);
      const legitOk = (!menor || d.legit === 'tutor' || d.legit === 'apoderado') && (!pide || d.acredita);
      r.push({ id: 'legit', ok: legitOk, txt, base: MARCO.civil });
    }
    r.push({ id: 'salario', ok: d.presupuesto >= MIN_HORA, txt: `Presupuesto de al menos $${MIN_HORA.toFixed(2)}/h (salario mínimo diario ÷ ${JORNADA_HORAS} h)`, base: MARCO.salario });
    r.push({ id: 'contrato', ok: !!d.contrato, txt: 'Me comprometo a formalizar un contrato por escrito con la persona contratada', base: MARCO.lftEscrito });
    r.push({ id: 'imss', ok: !!d.imss, txt: 'Me comprometo a inscribir a la persona contratada en el IMSS', base: MARCO.imss });
    r.push({ id: 'condiciones', ok: !!d.condiciones, txt: 'Respetaré jornada, descansos y pago acordados (trabajo del hogar)', base: MARCO.lftHogar });
    r.push({ id: 'privacidad', ok: !!d.privacidad, txt: 'He leído el aviso de privacidad', base: MARCO.datos });
    r.push({ id: 'sensibles', ok: !!d.sensibles, txt: 'Consiento el tratamiento de datos de salud de la persona a cuidar (o cuento con su consentimiento)', base: MARCO.datos });
    r.push({ id: 'veracidad', ok: !!d.veracidad, txt: 'Declaro bajo protesta de decir verdad que los datos son ciertos', base: null });
    if (d.duplicada) r.push({ id: 'dup', ok: false, txt: `Ya tienes ${MAX_PETICIONES_ACTIVAS} peticiones activas o en revisión con esta CURP`, base: null });
    return r;
  }

  /* ---------- Requisitos legales del profesional ---------- */
  function requisitosProfesional(d) {
    const cur = validarCURP(d.curp);
    const r = [];
    r.push({ id: 'curp', ok: cur.ok && cur.edad >= EDAD_MIN, txt: cur.ok ? (cur.edad >= EDAD_MIN ? 'CURP válida de persona mayor de edad' : `Debes ser mayor de ${EDAD_MIN} años`) : (d.curp ? cur.error : 'Captura tu CURP'), base: MARCO.lftMenores });
    if (d.duplicada) r.push({ id: 'dup', ok: false, txt: 'Ya existe un registro con esta CURP', base: null });
    r.push({ id: 'doc', ok: !!d.docId, txt: 'Elige el documento de identidad que presentarás en la revisión', base: null });
    if (d.perfil === 'enfermero') {
      r.push({ id: 'cedula', ok: validarCedula(d.cedula), txt: validarCedula(d.cedula) ? 'Cédula profesional capturada (7 u 8 dígitos)' : 'Cédula profesional (7 u 8 dígitos) — obligatoria para enfermería', base: MARCO.salud });
      r.push({ id: 'alcance', ok: !!d.alcance, txt: 'Ejerceré solo dentro del alcance de mi título y cédula', base: MARCO.salud });
    }
    const dias = diasDesde(d.antecedentesFecha);
    r.push({ id: 'antec', ok: dias != null && dias >= 0 && dias <= VIGENCIA_ANTECEDENTES_DIAS, txt: `Carta de no antecedentes penales con menos de ${VIGENCIA_ANTECEDENTES_DIAS} días de expedida`, base: null });
    r.push({ id: 'ref', ok: !!(d.refNombre && d.refNombre.trim().length >= 3 && validarTelefono(d.refTel)), txt: 'Una referencia con nombre y teléfono de 10 dígitos', base: null });
    r.push({ id: 'salario', ok: d.tarifa >= MIN_HORA, txt: `Tarifa de al menos $${MIN_HORA.toFixed(2)}/h`, base: MARCO.salario });
    r.push({ id: 'contrato', ok: !!d.contrato, txt: 'Acepto que el trabajo se formaliza con contrato por escrito y afiliación al IMSS', base: MARCO.lftEscrito });
    r.push({ id: 'privacidad', ok: !!d.privacidad, txt: 'He leído el aviso de privacidad', base: MARCO.datos });
    r.push({ id: 'veracidad', ok: !!d.veracidad, txt: 'Declaro bajo protesta de decir verdad que los datos y documentos son ciertos', base: null });
    return r;
  }

  /* ---------- Formalización de la contratación ---------- */
  function requisitosContratacion(d) {
    return [
      { id: 'tarifa', ok: d.tarifa >= MIN_HORA, txt: `Tarifa pactada de al menos $${MIN_HORA.toFixed(2)}/h`, base: MARCO.salario },
      { id: 'modalidad', ok: MODALIDADES.includes(d.modalidad), txt: 'Modalidad definida (de planta o entrada por salida)', base: MARCO.lftHogar },
      { id: 'escrito', ok: !!d.escrito, txt: 'Firmaremos contrato por escrito antes de iniciar', base: MARCO.lftEscrito },
      { id: 'imss', ok: !!d.imss, txt: 'La persona contratada será inscrita en el IMSS', base: MARCO.imss },
      { id: 'descansos', ok: !!d.descansos, txt: 'Se respetarán jornada, descanso semanal y pago', base: MARCO.lftHogar },
    ];
  }

  const pendientes = (reqs) => reqs.filter((x) => !x.ok);

  window.Care.legal = {
    MARCO, LEGITIMACION, DOCS_ID, MODALIDADES, MIN_HORA, EDAD_MIN, VIGENCIA_ANTECEDENTES_DIAS, MAX_PETICIONES_ACTIVAS,
    validarCURP, validarCedula, validarTelefono, enmascarar,
    admisionPeticion, requisitosPeticion, requisitosProfesional, requisitosContratacion, pendientes,
  };
})();
