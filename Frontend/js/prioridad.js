/* Priorización de Mientras: entrevista, puntaje, niveles, envejecimiento en cola, reparto de horas y chequeos.
 * Namespace: Care.prioridad. Funciones puras (sin DOM): las usa la app y las prueba Node (tests/prueba_asignacion.js).
 *
 * Flujo: Registro → Consentimiento → Entrevista → Puntaje y nivel → Horas asignadas → Asignación de relevo por el programa.
 *
 * El puntaje es la tarjeta de puntos del script 22 (ENASIC 2022, NACIONAL, exploratoria, sin doble revisión).
 * No hay modelo serializado que cargar, así que SIEMPRE se muestra «Puntaje provisional — modelo en validación».
 * La tarjeta no supera a la regla de 40 h de forma demostrable: la app muestra las dos.
 */
(function (raiz) {
  'use strict';

  /* ================= Bloque 1. Variables del modelo (codificación de la ENASIC 2022) ================= */
  // Mismas definiciones que Analysis/22_tarjeta_puntos.py (bloque PREPARACIÓN).
  // HORAS = P6_7 + P6_26 (horas de cuidado a la semana, bloques de discapacidad y de 60+), topado en 168.
  // La app pregunta el total de horas a la semana en una sola pregunta.
  // PENDIENTE: confirmar la redacción literal de cada reactivo contra el cuestionario de la ENASIC 2022.
  const ABVD = [ // N_ABVD = número de «Sí» (código 1) en estas 5
    { id: 'P6_2_01', txt: 'Darle de comer' },
    { id: 'P6_2_02', txt: 'Vestirle' },
    { id: 'P6_2_03', txt: 'Cambiarle el pañal o llevarle al baño' },
    { id: 'P6_2_04', txt: 'Bañarle o asearle' },
    { id: 'P6_2_08', txt: 'Acostarle o levantarle de la cama' },
  ];
  const CLIN = [ // N_CLINICAS = número de «Sí» en estas 4
    { id: 'P6_2_10', txt: 'Darle medicinas' },
    { id: 'P6_2_11', txt: 'Hacerle curaciones' },
    { id: 'P6_2_12', txt: 'Ayudarle con terapias' },
    { id: 'P6_2_13', txt: 'Ayudarle con tratamientos' },
  ];
  // Preguntas de la entrevista. `codigo` documenta la variable de origen.
  const PREGUNTAS_MODELO = [
    { id: 'horas', codigo: 'P6_7 + P6_26', txt: '¿Cuántas horas a la semana dedica a cuidar a esta persona?', tipo: 'numero', min: 0, max: 168 },
    { id: 'abvd', codigo: 'P6_2_01…P6_2_08', txt: '¿En cuáles de estas actividades le ayuda?', tipo: 'multi', opciones: ABVD },
    { id: 'clin', codigo: 'P6_2_10…P6_2_13', txt: '¿Cuáles de estas tareas de salud hace usted?', tipo: 'multi', opciones: CLIN },
    { id: 'req', codigo: 'P6_9_4 / P6_28_4', txt: '¿Necesita que otra persona le apoye para poder cuidar?', tipo: 'sino' },
    { id: 'fuerza', codigo: 'P6_9_1 / P6_28_1', txt: '¿Se le dificulta cuidar porque le falta fuerza física?', tipo: 'sino' },
    // SEXO = 2 (mujer) se captura en el registro. Lo usa la tarjeta (2 puntos).
  ];
  // Variables con 0 puntos en la tarjeta «completa»: NO se preguntan (minimización). h80 sale de las horas.
  const NO_PREGUNTADAS = { disc: 'FILTRO6_1 (cuida a persona con discapacidad)', edad60: 'EDAD ≥ 60 de quien cuida' };

  const ETIQUETA = {
    h40: 'Cuida 40 horas o más a la semana',
    h80: 'Cuida 80 horas o más a la semana',
    abvd1: 'Ayuda en al menos una actividad básica (comer, vestir, baño, aseo, cama)',
    abvd3: 'Ayuda en tres o más actividades básicas',
    clin1: 'Hace al menos una tarea de salud (medicinas, curaciones, terapias o tratamientos)',
    disc: 'Cuida a una persona con discapacidad',
    req: 'Necesita que otra persona le apoye para cuidar',
    fuerza: 'Se le dificulta cuidar porque le falta fuerza física',
    mujer: 'Es mujer: las mujeres cargan la mayor parte del cuidado',
    edad60: 'Tiene 60 años o más',
  };

  /** Respuestas de la entrevista → 10 variables binarias, igual que binarias() del script 22. */
  function variables(m) {
    const horas = Math.min(168, Math.max(0, +m.horas || 0));
    const nAbvd = (m.abvd || []).length, nClin = (m.clin || []).length;
    return {
      h40: horas >= 40 ? 1 : 0, h80: horas >= 80 ? 1 : 0,
      abvd1: nAbvd >= 1 ? 1 : 0, abvd3: nAbvd >= 3 ? 1 : 0, clin1: nClin >= 1 ? 1 : 0,
      disc: m.disc ? 1 : 0, req: m.req ? 1 : 0, fuerza: m.fuerza ? 1 : 0,
      mujer: m.sexo === 'M' ? 1 : 0, edad60: m.edad60 ? 1 : 0,
    };
  }

  /** Intenta cargar un modelo entrenado. Hoy no hay ninguno: devuelve null y la app usa la tarjeta. */
  function cargarModelo(cfg) { return cfg && cfg.modelo && cfg.modelo.archivo && raiz && raiz.Care && raiz.Care.MODELO ? raiz.Care.MODELO : null; }

  /**
   * Puntaje de la entrevista. Devuelve { base, max, detalle:[{var, etiqueta, puntos}], top3, provisional, fuente }.
   * `top3`: las 3 variables presentes que más puntos sumaron (para explicar en lenguaje simple).
   */
  function puntuar(m, cfg) {
    const modelo = cargarModelo(cfg);
    const x = variables(m);
    const W = cfg.pesos;
    const detalle = Object.keys(W).map((k) => ({ var: k, etiqueta: ETIQUETA[k], presente: !!x[k], puntos: x[k] ? W[k] : 0, peso: W[k] }));
    const base = modelo ? modelo.puntuar(x) : detalle.reduce((t, d) => t + d.puntos, 0);
    const max = Object.values(W).reduce((t, v) => t + Math.max(0, v), 0);
    const top3 = detalle.filter((d) => d.puntos > 0).sort((a, b) => b.puntos - a.puntos || a.var.localeCompare(b.var)).slice(0, 3);
    return {
      base, max, detalle, top3, variables: x,
      provisional: !modelo,
      fuente: modelo ? 'Modelo cargado' : `Tarjeta de puntos «${cfg.variante_tarjeta}» (script 22, ENASIC 2022 nacional)`,
    };
  }

  /** Regla de referencia (la que hoy no se supera): ≥ 40 h. Se muestra junto al puntaje. */
  const reglaHoras = (horas) => (+horas >= 40 ? 'dentro' : 'fuera');

  /* ================= Cola: envejecimiento y niveles ================= */
  const DIA_MS = 86400000;
  const fechaUTC = (s) => { const [y, mo, d] = String(s).split('-').map(Number); return Date.UTC(y, mo - 1, d); };
  /** Semanas completas en cola: desde la valoración hasta la primera asignación de relevo (o hasta `hoy`). */
  function semanasEnCola(desde, hasta) {
    if (!desde || !hasta) return 0;
    return Math.max(0, Math.floor((fechaUTC(hasta) - fechaUTC(desde)) / DIA_MS / 7));
  }
  /** Puntaje efectivo = base + min(tope, x × semanas). El envejecimiento nunca pasa el tope. */
  function puntajeEfectivo(base, semanas, cfg) {
    const e = cfg.envejecimiento;
    const extra = Math.min(e.tope_envejecimiento, Math.max(0, semanas) * e.puntos_por_semana);
    return { efectivo: base + extra, extra, semanas };
  }
  function nivel(p, cfg) {
    if (p >= cfg.umbrales.alta) return 'alta';
    if (p >= cfg.umbrales.media) return 'media';
    return 'baja';
  }
  const NIVEL = { alta: 'Alta', media: 'Media', baja: 'Baja' };

  /* ================= Reparto de horas ================= */
  /**
   * personas: [{ id, efectivo }]. Devuelve { horas:{id: h/mes}, usado, sobrante, capacidad_ok, en_cola:[id], presupuesto }.
   * 1. Mínimo garantizado a todas. Si la bolsa no alcanza para todas (presupuesto < n × mínimo), el mínimo va primero a
   *    quien tiene mayor puntaje efectivo y el resto queda EN COLA con 0 h ese mes: su puntaje sigue envejeciendo.
   *    «Nadie queda fuera» solo se cumple si la bolsa alcanza para los mínimos: es una restricción de presupuesto, no de código.
   * 2. Lo que sobra se reparte en proporción al puntaje efectivo, con tope `horas_maximas` por hogar (lo que rebasa
   *    se redistribuye entre las demás). Horas enteras por mes (método del mayor residuo); la suma nunca pasa la bolsa.
   */
  function asignarHoras(personas, cfg, presupuesto) {
    const B = Math.max(0, Math.floor(presupuesto != null ? presupuesto : cfg.presupuesto_horas_mes));
    const m = cfg.horas_minimas, M = Math.max(cfg.horas_maximas, m);
    const orden = personas.slice().sort((a, b) => b.efectivo - a.efectivo || String(a.id).localeCompare(String(b.id)));
    const horas = {}; orden.forEach((p) => { horas[p.id] = 0; });
    const n = orden.length;
    if (!n) return { horas, usado: 0, sobrante: B, capacidad_ok: true, en_cola: [], presupuesto: B };

    if (B < n * m) {
      const k = Math.floor(B / m);
      orden.slice(0, k).forEach((p) => { horas[p.id] = m; });
      const usado = k * m;
      return { horas, usado, sobrante: B - usado, capacidad_ok: false, en_cola: orden.slice(k).map((p) => p.id), presupuesto: B };
    }

    // Reparto continuo proporcional con tope (llenado por agua).
    const extra = {}; orden.forEach((p) => { extra[p.id] = 0; });
    let resto = B - n * m;
    let abiertos = orden.filter(() => M > m);
    for (let it = 0; it < n + 1 && resto > 1e-9 && abiertos.length; it++) {
      const pesos = abiertos.map((p) => Math.max(0, p.efectivo));
      const suma = pesos.reduce((t, v) => t + v, 0);
      const parte = abiertos.map((p, i) => (suma > 0 ? (resto * pesos[i]) / suma : resto / abiertos.length));
      let rebasa = 0; const siguen = [];
      abiertos.forEach((p, i) => {
        const cupo = M - m - extra[p.id];
        if (parte[i] >= cupo) { extra[p.id] += cupo; rebasa += parte[i] - cupo; } else { extra[p.id] += parte[i]; siguen.push(p); }
      });
      resto = rebasa; abiertos = siguen;
    }
    // Enteros: piso y después el mayor residuo, sin pasar el tope ni la bolsa.
    let usado = 0;
    const residuos = orden.map((p) => { const v = m + extra[p.id]; horas[p.id] = Math.floor(v + 1e-9); usado += horas[p.id]; return { id: p.id, r: v - horas[p.id] }; });
    let libres = Math.min(B - usado, Math.round(residuos.reduce((t, x) => t + x.r, 0)));
    residuos.sort((a, b) => b.r - a.r || String(a.id).localeCompare(String(b.id)));
    for (let i = 0; i < residuos.length && libres > 0; i++) {
      if (horas[residuos[i].id] < M && residuos[i].r > 1e-9) { horas[residuos[i].id] += 1; usado += 1; libres -= 1; }
    }
    return { horas, usado, sobrante: B - usado, capacidad_ok: true, en_cola: [], presupuesto: B };
  }
  /** Horas por semana del paquete a partir de las horas del mes (hacia abajo: nunca pasa lo asignado). */
  const horasSemana = (hMes, cfg) => Math.floor(hMes / cfg.semanas_por_mes);

  /* ================= Bloque 2. Sobrecarga (estructura tipo Zarit) ================= */
  // Los reactivos de la escala de Zarit tienen derechos de autor: la app NO los escribe. Hasta tener licencia
  // solo existen los ID, la escala de respuesta y el cálculo. Se usa para seguimiento y chequeos, NO para el puntaje.
  function reactivosZarit(cfg) {
    return Array.from({ length: cfg.zarit.n_reactivos }, (_, i) => ({ id: 'Z' + String(i + 1).padStart(2, '0'), txt: `[Reactivo Zarit ${i + 1} — requiere licencia]` }));
  }
  const ESCALA_ZARIT = ['0', '1', '2', '3', '4']; // etiquetas verbales pendientes de la versión licenciada
  /** Total de Zarit: suma de respuestas. null si falta alguna (no se imputa). */
  function totalZarit(resp, cfg) {
    const items = reactivosZarit(cfg);
    if (!resp) return null;
    let t = 0;
    for (const it of items) {
      const v = resp[it.id];
      if (v == null || v === '' || isNaN(+v) || +v < cfg.zarit.escala_min || +v > cfg.zarit.escala_max) return null;
      t += +v;
    }
    return t;
  }

  /* ================= Bloque 3. Dependencia de la persona cuidada (índice de Barthel) ================= */
  // Puntuación estándar del índice de Barthel (0-100). Redacción propia y abreviada de cada nivel.
  // PENDIENTE: confirmar la versión en español validada y sus condiciones de uso.
  const BARTHEL = [
    { id: 'B01', txt: 'Comer', niveles: [[0, 'No puede sin ayuda'], [5, 'Necesita algo de ayuda'], [10, 'Lo hace sola o solo']] },
    { id: 'B02', txt: 'Bañarse', niveles: [[0, 'Necesita ayuda'], [5, 'Lo hace sola o solo']] },
    { id: 'B03', txt: 'Vestirse', niveles: [[0, 'No puede sin ayuda'], [5, 'Necesita algo de ayuda'], [10, 'Lo hace sola o solo']] },
    { id: 'B04', txt: 'Arreglarse (cara, pelo, dientes)', niveles: [[0, 'Necesita ayuda'], [5, 'Lo hace sola o solo']] },
    { id: 'B05', txt: 'Control de evacuaciones', niveles: [[0, 'No controla'], [5, 'Accidente ocasional'], [10, 'Controla']] },
    { id: 'B06', txt: 'Control de orina', niveles: [[0, 'No controla'], [5, 'Accidente ocasional'], [10, 'Controla']] },
    { id: 'B07', txt: 'Usar el baño', niveles: [[0, 'No puede sin ayuda'], [5, 'Necesita algo de ayuda'], [10, 'Lo hace sola o solo']] },
    { id: 'B08', txt: 'Pasar de la silla a la cama', niveles: [[0, 'No puede'], [5, 'Mucha ayuda'], [10, 'Poca ayuda'], [15, 'Lo hace sola o solo']] },
    { id: 'B09', txt: 'Caminar', niveles: [[0, 'No puede'], [5, 'Solo en silla de ruedas'], [10, 'Con ayuda'], [15, 'Sola o solo']] },
    { id: 'B10', txt: 'Subir y bajar escaleras', niveles: [[0, 'No puede'], [5, 'Necesita ayuda'], [10, 'Lo hace sola o solo']] },
  ];
  function totalBarthel(resp) {
    if (!resp) return null;
    let t = 0;
    for (const it of BARTHEL) {
      const v = resp[it.id];
      if (v == null || v === '' || !it.niveles.some(([p]) => p === +v)) return null;
      t += +v;
    }
    return t;
  }
  function nivelBarthel(t) {
    if (t == null) return '';
    if (t < 20) return 'dependencia total';
    if (t < 60) return 'dependencia severa';
    if (t < 91) return 'dependencia moderada';
    if (t < 100) return 'dependencia leve';
    return 'independiente';
  }

  /* ================= F. Chequeos de consistencia ================= */
  /** Devuelve [{ id, txt }]. Si hay alguno, el caso pasa a REVISIÓN HUMANA. El puntaje no se toca. */
  function chequeos(ent, cfg) {
    const c = cfg.chequeos, m = ent.modelo || {};
    const b = totalBarthel(ent.barthel), z = totalZarit(ent.zarit, cfg);
    const nAbvd = (m.abvd || []).length, nClin = (m.clin || []).length, h = +m.horas || 0;
    const out = [];
    if (h >= c.horas_altas && b != null && b >= c.barthel_independiente && nClin === 0)
      out.push({ id: 'horas_vs_barthel', txt: `Declara ${h} h/semana de cuidado, pero la persona cuidada es casi independiente (Barthel ${b}) y no hay tareas de salud.` });
    if (nAbvd >= c.abvd_muchas && b != null && b >= c.barthel_sin_ayuda)
      out.push({ id: 'abvd_vs_barthel', txt: `Declara ayuda en ${nAbvd} actividades básicas, pero según Barthel la persona las hace sola (${b}/100).` });
    if (h >= c.horas_inverosimiles)
      out.push({ id: 'horas_inverosimiles', txt: `${h} h/semana es casi todo el día, todos los días: verificar la captura o si hay más de una persona cuidada.` });
    if (z != null && z <= c.zarit_bajo && m.fuerza && m.req)
      out.push({ id: 'zarit_vs_fuerza', txt: `Declara que le falta fuerza y que necesita apoyo, pero su sobrecarga es baja (Zarit ${z}).` });
    return out;
  }

  const API = {
    ABVD, CLIN, PREGUNTAS_MODELO, NO_PREGUNTADAS, ETIQUETA, BARTHEL, ESCALA_ZARIT, NIVEL,
    variables, cargarModelo, puntuar, reglaHoras, semanasEnCola, puntajeEfectivo, nivel, asignarHoras, horasSemana,
    reactivosZarit, totalZarit, totalBarthel, nivelBarthel, chequeos,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (raiz) { raiz.Care = raiz.Care || {}; raiz.Care.prioridad = API; }
})(typeof window !== 'undefined' ? window : null);
