/* Reglas del programa de relevo por horas (opción C). Namespace: Care.relevo
 *
 * 1. Focalización: regla simple de horas (+ ayuda en actividades básicas para ordenar la prioridad).
 *    - Notebook 11: el modelo no supera de forma demostrable a la regla "≥ 40 h" para "algún daño"
 *      (+2.2 pp de cobertura, IC 90 % de −4.1 a 8.5). Por eso la app usa la regla, no un modelo.
 *    - Notebook 07 (nacional, "sin necesidad" declarada): % con algún daño (salud o trabajo) por grupo.
 *      Son cifras NACIONALES; para la CDMX son "probables", no confirmadas.
 * 2. Paquete: 3, 6, 9 o 12 h/semana, horario fijo y lista cerrada de tareas (sin tareas clínicas).
 * 3. Jornada y costo: mismo criterio que Analysis/15 (LFT arts. 60-61). Sin prestaciones salvo que se fije un factor.
 *    Mes = 4.33 semanas, mismo supuesto que Analysis/10.
 * 4. Asignación: solo restricciones (aprobada, certificada, cerca, disponible, con cupo, tareas cubiertas).
 *    Se asigna UNA persona; no se muestra un catálogo ni una calificación.
 */
(function () {
  'use strict';

  const L = Care.legal;
  const SEMANAS_MES = 4.33;

  /* ---------- 1. Focalización ---------- */
  // Fuente: Analysis/resultados/07_enasic_necesidad_vs_norma_estimaciones.csv, bloque 5_danos_entre_sin_necesidad,
  // "Algún daño (salud o trabajo)". pct, li90, ls90.
  const DANO_07 = {
    P1: { grupo: '40 h o más y ayudan en actividades básicas', pct: 79.6, li: 70.8, ls: 88.5 },
    P2: { grupo: '40 h o más', pct: 70.5, li: 62.5, ls: 78.4 },
    m20: { grupo: 'de 20 a 39 h', pct: 54.9, li: 46.6, ls: 63.2 },
    m0: { grupo: 'menos de 20 h', pct: 42.6, li: 34.7, ls: 50.4 },
  };
  const UMBRAL_HORAS = 40;

  /** { nivel: 'P1'|'P2'|'NP', etiqueta, ref } */
  function prioridad(horas, abvd) {
    const h = +horas || 0;
    if (h >= UMBRAL_HORAS && abvd) return { nivel: 'P1', etiqueta: 'Prioridad 1', motivo: `${UMBRAL_HORAS} h o más y ayuda en actividades básicas`, ref: DANO_07.P1 };
    if (h >= UMBRAL_HORAS) return { nivel: 'P2', etiqueta: 'Prioridad 2', motivo: `${UMBRAL_HORAS} h o más por semana`, ref: DANO_07.P2 };
    return { nivel: 'NP', etiqueta: 'Fuera de la regla', motivo: `menos de ${UMBRAL_HORAS} h por semana`, ref: h >= 20 ? DANO_07.m20 : DANO_07.m0 };
  }

  /* ---------- 2. Paquetes y tareas ---------- */
  const PAQUETES = [3, 6, 9, 12];
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  // Lista cerrada. Nada clínico: curaciones, sondas o administrar medicamentos requieren enfermería y salen del programa.
  const TAREAS = [
    'Acompañamiento y supervisión', 'Apoyo para comer', 'Apoyo en higiene personal', 'Apoyo para moverse en casa',
    'Recordatorio de medicamentos (sin administrarlos)', 'Preparar alimentos sencillos', 'Acompañar a cita cercana',
  ];
  const PAGADORES = { familia: 'Familia', subsidio: 'Subsidio', mixto: 'Mixto' };

  /* ---------- 3. Jornada y costo ---------- */
  const fmtHora = (min) => { const m = ((min % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  /** Tipo de jornada de un tramo que empieza en `iniMin` (minutos desde 00:00) y dura `durMin`. Regla del script 15. */
  function tipoJornada(iniMin, durMin) {
    let noct = 0;
    for (let i = 0; i < durMin; i++) { const m = (iniMin + i) % 1440; if (m >= 1200 || m < 360) noct++; }
    if (noct === 0) return 'diurna';
    if (noct === durMin || noct >= 210) return 'nocturna';
    return 'mixta';
  }

  /** Describe un paquete { horas, dias:[idx], inicio:'HH:MM' } → visitas, duración, jornada, costo, validez. */
  function evaluarPaquete(pq, factorPrest) {
    const visitas = (pq.dias || []).length;
    const [hh, mm] = String(pq.inicio || '09:00').split(':').map(Number);
    const ini = hh * 60 + (mm || 0);
    const durMin = visitas ? Math.round((pq.horas * 60) / visitas) : 0;
    const tipo = durMin ? tipoJornada(ini, durMin) : 'diurna';
    const max = L.MAX_H[tipo];
    const errores = [];
    if (!visitas) errores.push('Elige al menos un día de visita.');
    if (durMin > max * 60) errores.push(`Cada visita duraría ${(durMin / 60).toFixed(1)} h y la jornada ${tipo} permite ${max} h: agrega días.`);
    if (durMin && durMin < 60) errores.push('Cada visita debe durar al menos 1 h.');
    const hora = L.HORA[tipo];
    const semana = hora * pq.horas;
    const mes = semana * SEMANAS_MES;
    const f = +factorPrest || 0;
    return {
      visitas, durMin, iniMin: ini, finMin: ini + durMin, tipo, max, errores, ok: errores.length === 0,
      horario: `${fmtHora(ini)}-${fmtHora(ini + durMin)}`,
      hora, semana, mes, mesConPrest: f > 0 ? mes * (1 + f / 100) : null, factor: f,
    };
  }

  /** Lo que paga la familia al mes según el pagador. */
  function pagoFamilia(ev, pagador, pctSubsidio) {
    const total = ev.mesConPrest || ev.mes;
    if (pagador === 'subsidio') return 0;
    if (pagador === 'mixto') return total * (1 - (+pctSubsidio || 0) / 100);
    return total;
  }

  /* ---------- 4. Asignación por restricciones ---------- */
  function haversineKm(a, b) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function distanciaKm(zA, zB) {
    const a = Care.ZONAS[zA], b = Care.ZONAS[zB];
    return a && b ? haversineKm(a, b) : null;
  }

  // Horas por semana ya comprometidas de una persona de relevo (asignaciones activas).
  function cargaDe(relevoId, state, excluirCaso) {
    return state.casos.filter((c) => c.asignacion && c.asignacion.relevoId === relevoId && c.id !== excluirCaso && c.estado === 'activo')
      .reduce((t, c) => t + c.paquete.horas, 0);
  }

  // ¿La ventana de disponibilidad cubre el horario de la visita? Ventanas que cruzan medianoche se permiten.
  function cubreHorario(r, ev) {
    const [dh, dm] = String(r.desde || '00:00').split(':').map(Number);
    const [hh, hm] = String(r.hasta || '00:00').split(':').map(Number);
    let d = dh * 60 + (dm || 0), h = hh * 60 + (hm || 0);
    if (h <= d) h += 1440;
    let ini = ev.iniMin, fin = ev.finMin;
    if (ini < d) { ini += 1440; fin += 1440; }
    return ini >= d && fin <= h;
  }

  /** Evalúa cada restricción para un par caso–relevo. Devuelve { ok, checks:[{id, ok, txt}], km, carga } */
  function evaluarPar(caso, r, state, cfg) {
    const ev = evaluarPaquete(caso.paquete, cfg.factorPrest);
    const km = distanciaKm(caso.alcaldia, r.alcaldia);
    const carga = cargaDe(r.id, state, caso.id);
    const faltanDias = caso.paquete.dias.filter((d) => !(r.dias || []).includes(d));
    const faltanTareas = caso.paquete.tareas.filter((t) => !(r.tareas || []).includes(t));
    const checks = [
      { id: 'aprob', ok: Care.store.aprobado(r), txt: 'Documentos revisados y aprobados' },
      { id: 'cert', ok: r.certificacion === 'certificada', txt: r.certificacion === 'certificada' ? 'Certificación vigente' : 'Sin certificación vigente (' + (r.certificacion === 'en_proceso' ? 'en proceso' : 'no tiene') + ')' },
      { id: 'cerca', ok: km != null && km <= cfg.maxKm, txt: km == null ? 'Alcaldía sin ubicar' : `A ${km.toFixed(1)} km entre centros de alcaldía (máx. ${cfg.maxKm} km)` },
      { id: 'dias', ok: faltanDias.length === 0, txt: faltanDias.length ? 'No disponible: ' + faltanDias.map((d) => DIAS[d]).join(', ') : 'Disponible todos los días del paquete' },
      { id: 'hora', ok: cubreHorario(r, ev), txt: `Horario ${ev.horario} dentro de su disponibilidad (${r.desde}-${r.hasta})` },
      { id: 'cupo', ok: carga + caso.paquete.horas <= r.horasMax, txt: `Cupo: ${carga} + ${caso.paquete.horas} h de ${r.horasMax} h/semana` },
      { id: 'tareas', ok: faltanTareas.length === 0, txt: faltanTareas.length ? 'No cubre: ' + faltanTareas.join(', ') : 'Cubre todas las tareas del paquete' },
    ];
    return { ok: checks.every((c) => c.ok), checks, km, carga };
  }

  /** Propone UNA persona: la más cercana entre las que cumplen todo; empate → menor carga. */
  function proponer(caso, state, cfg, excluir) {
    const ex = new Set(excluir || []);
    const evals = state.relevos.filter((r) => !ex.has(r.id)).map((r) => ({ r, e: evaluarPar(caso, r, state, cfg) }));
    const elegibles = evals.filter((x) => x.e.ok).sort((a, b) => a.e.km - b.e.km || a.e.carga - b.e.carga);
    // Diagnóstico agregado: qué restricción descarta a más personas (útil cuando no hay nadie)
    const descartes = {};
    evals.filter((x) => !x.e.ok).forEach((x) => x.e.checks.filter((c) => !c.ok).forEach((c) => { descartes[c.id] = (descartes[c.id] || 0) + 1; }));
    return { propuesta: elegibles[0] || null, nElegibles: elegibles.length, descartes, total: evals.length };
  }

  const ETIQUETA_DESCARTE = { aprob: 'sin aprobar', cert: 'sin certificación', cerca: 'lejos', dias: 'sin esos días', hora: 'fuera de horario', cupo: 'sin cupo', tareas: 'no cubre tareas' };

  window.Care.relevo = {
    SEMANAS_MES, UMBRAL_HORAS, DANO_07, PAQUETES, DIAS, TAREAS, PAGADORES, ETIQUETA_DESCARTE,
    prioridad, evaluarPaquete, pagoFamilia, tipoJornada, fmtHora, distanciaKm, cargaDe, evaluarPar, proponer,
  };
})();
