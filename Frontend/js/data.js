/* Catálogos, datos SIMULADOS y almacenamiento local. Namespace global: Care
 *
 * Todo lo que trae `seed()` es sintético: nombres, hogares, visitas, incidentes y respuestas semanales.
 * Sirve para demostrar que el flujo funciona; no valida la hipótesis ni mide impacto.
 * Las respuestas semanales (cansancio, malas noches) se generan SIN tendencia a propósito: un patrón inventado
 * se leería como efecto del relevo.
 */
(function () {
  'use strict';

  // Centro aproximado de cada alcaldía [lat, lon]. Solo para la restricción de cercanía; la app no guarda domicilios.
  const ZONAS = {
    'Álvaro Obregón': [19.359, -99.203],
    'Azcapotzalco': [19.487, -99.184],
    'Benito Juárez': [19.3727, -99.158],
    'Coyoacán': [19.3467, -99.1617],
    'Cuajimalpa de Morelos': [19.357, -99.299],
    'Cuauhtémoc': [19.4326, -99.15],
    'Gustavo A. Madero': [19.483, -99.113],
    'Iztacalco': [19.396, -99.097],
    'Iztapalapa': [19.3574, -99.067],
    'La Magdalena Contreras': [19.307, -99.241],
    'Miguel Hidalgo': [19.433, -99.2],
    'Milpa Alta': [19.192, -99.023],
    'Tláhuac': [19.286, -99.005],
    'Tlalpan': [19.29, -99.167],
    'Venustiano Carranza': [19.43, -99.105],
    'Xochimilco': [19.257, -99.103],
  };

  const GRUPOS = ['Persona de 60+', 'Persona con discapacidad', 'Persona de 60+ con discapacidad', 'Otra situación de dependencia'];
  const PARENTESCOS = ['madre', 'padre', 'abuela', 'abuelo', 'esposa', 'esposo', 'hija', 'hijo',
    'hermana', 'hermano', 'suegra', 'suegro', 'tía', 'tío', 'nieta', 'nieto', 'otro'];
  const TIPOS_INCIDENTE = ['No llegó', 'Llegó tarde', 'Se fue antes', 'Trato inadecuado', 'Riesgo en el domicilio', 'Cambio en la salud de la persona cuidada', 'Otro'];

  // maxKm: cercanía máxima entre centros de alcaldía. factorPrest: % sobre el costo para prestaciones (0 = sin prestaciones; POR DEFINIR con Daniel).
  const CONFIG_DEFAULT = { maxKm: 12, factorPrest: 0 };

  /** Hogar: cuidadora familiar (s), persona cuidada (c) y hasta N apoyos. `horas` = horas de cuidado por semana. */
  function buildHogar(o) {
    const personas = [], relaciones = [];
    const s = { id: 's', nombre: o.cuidadora.nombre, edad: o.cuidadora.edad || null, rol: o.cuidadora.rol || 'cuidadora' };
    const c = { id: 'c', nombre: o.cuidada.nombre, edad: o.cuidada.edad || null, rol: o.cuidada.rol || 'familiar' };
    personas.push(s, c);
    relaciones.push({ de: 's', a: 'c', horas: o.cuidadora.horas || 0 });
    (o.apoyos || []).filter((a) => a.nombre).forEach((a, i) => {
      const id = 'a' + (i + 1);
      personas.push({ id, nombre: a.nombre, edad: a.edad || null, rol: a.rol || 'familiar' });
      relaciones.push({ de: id, a: 'c', horas: a.horas || 0 });
    });
    c.necesita = relaciones.reduce((t, r) => t + r.horas, 0);
    return { foco: 'c', personas, relaciones: relaciones.filter((r) => r.horas > 0) };
  }

  /* ---------- Fechas ---------- */
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const hoyISO = () => iso(new Date());
  const desdeISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const sumaDias = (s, n) => { const d = desdeISO(s); d.setDate(d.getDate() + n); return iso(d); };
  const diaIdx = (s) => (desdeISO(s).getDay() + 6) % 7; // 0 = lunes
  const lunesDe = (s) => sumaDias(s, -diaIdx(s));

  /* ---------- Datos de ejemplo (SIMULADOS) ---------- */
  function rng(seed) { // mulberry32: el ejemplo sale igual cada vez que se restaura
    return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function seed() {
    const hoy = hoyISO();
    const hace = (n) => sumaDias(hoy, -n);
    const T = Care.relevo ? Care.relevo.TAREAS : [];
    const ok = { estado: 'aprobada', origen: 'precargado' };
    const consentido = { inst: true, privacidad: true, sensibles: true, fecha: hace(40) };

    const R = (id, nombre, alcaldia, dias, desde, hasta, horasMax, tareas, certificacion, experiencia, verificacion) =>
      ({ id, nombre, sexo: SEXO_R[id], alcaldia, dias, desde, hasta, horasMax, tareas, certificacion, experiencia, verificacion: verificacion || ok });
    const SEXO_R = { r1: 'M', r2: 'M', r3: 'H', r4: 'M', r5: 'H', r6: 'M', r7: 'M', r8: 'M', r9: 'M', r10: 'H', r11: 'M' };
    const todas = T.slice();
    const relevos = [
      R('r1', 'Rosa M.', 'Coyoacán', [0, 1, 2, 3, 4], '08:00', '18:00', 20, todas, 'certificada', 8),
      R('r2', 'Guadalupe I.', 'Benito Juárez', [0, 2, 4], '12:00', '20:00', 15, todas, 'certificada', 12),
      R('r3', 'Pedro S.', 'Cuauhtémoc', [3, 4, 5], '20:00', '08:00', 14, [T[0], T[4], T[1]], 'en_proceso', 3),
      R('r4', 'Ana B.', 'Tlalpan', [5, 6], '08:00', '20:00', 12, [T[0], T[1], T[5]], 'certificada', 4),
      R('r5', 'Jorge A.', 'Iztapalapa', [5, 6], '07:00', '19:00', 16, todas, 'certificada', 7),
      R('r6', 'Claudia I.', 'Azcapotzalco', [0, 1, 2, 3, 4], '07:00', '15:00', 24, todas, 'certificada', 6),
      R('r7', 'Elena R.', 'Cuauhtémoc', [0, 1, 2, 3, 4], '09:00', '17:00', 20, todas, 'en_proceso', 10),
      R('r8', 'Sofía D.', 'Gustavo A. Madero', [0, 1, 2, 3, 4], '07:00', '13:00', 20, todas, 'certificada', 9),
      R('r9', 'Marta Q.', 'Xochimilco', [0, 1, 2, 3, 4], '08:00', '14:00', 15, [T[0], T[1], T[2], T[3], T[4]], 'certificada', 5),
      R('r10', 'Diego P.', 'Coyoacán', [1, 3], '14:00', '21:00', 12, todas, 'certificada', 5),
      R('r11', 'Karla V.', 'Iztacalco', [0, 2, 4], '09:00', '15:00', 12, [T[0], T[1]], 'en_proceso', 1,
        { estado: 'pendiente', fecha: hace(1) }),
    ];
    relevos[10].legal = { curp: 'VAKK950312MDFLRR08', docId: 'INE/IFE vigente', antecedentesFecha: hace(20), referencia: { nombre: 'Ref. simulada', tel: '5500000000' } };

    const C = (o) => Object.assign({ institucion: 'Institución canalizadora (simulada)', consentimiento: consentido, pagador: 'familia', pctSubsidio: 0, inclusion: null, asignacion: null }, o);
    const casos = [
      C({ id: 'k1', folio: 'C-0001', fecha: hace(40), alcaldia: 'Cuauhtémoc', estado: 'activo',
        cuidadora: { alias: 'Marisol', sexo: 'M', horas: 56, abvd: true, danoSalud: true, danoTrabajo: true },
        persona: { alias: 'Elvira', sexo: 'M', grupo: GRUPOS[0], edad: 82 },
        hogar: {
          foco: 'elvira',
          personas: [
            { id: 'marisol', nombre: 'Marisol', edad: 47, rol: 'hija' }, { id: 'elvira', nombre: 'Elvira', edad: 82, rol: 'madre', necesita: 70 },
            { id: 'tomas', nombre: 'Tomás', edad: 51, rol: 'esposo' }, { id: 'ana', nombre: 'Ana', edad: 14, rol: 'hija' },
            { id: 'beto', nombre: 'Beto', edad: 9, rol: 'hijo' }, { id: 'nico', nombre: 'Nico', edad: 3, rol: 'nieto' },
          ],
          relaciones: [
            { de: 'marisol', a: 'elvira', horas: 40 }, { de: 'marisol', a: 'ana', horas: 20 }, { de: 'marisol', a: 'beto', horas: 20 },
            { de: 'marisol', a: 'nico', horas: 46 }, { de: 'tomas', a: 'nico', horas: 10 },
          ],
        },
        paquete: { horas: 6, dias: [1, 3], inicio: '09:00', tareas: [T[0], T[2], T[3]] }, pagador: 'mixto', pctSubsidio: 50,
        asignacion: { relevoId: 'r1', fecha: hace(35), historial: [] } }),
      C({ id: 'k2', folio: 'C-0002', fecha: hace(26), alcaldia: 'Benito Juárez', estado: 'activo',
        cuidadora: { alias: 'Ernesto', sexo: 'H', horas: 50, abvd: true, danoSalud: true, danoTrabajo: false },
        persona: { alias: 'Carmen', sexo: 'M', grupo: GRUPOS[2], edad: 74 },
        hogar: buildHogar({ cuidadora: { nombre: 'Ernesto', edad: 76, rol: 'esposo', horas: 50 }, cuidada: { nombre: 'Carmen', edad: 74, rol: 'esposa' }, apoyos: [{ nombre: 'Luis', edad: 44, rol: 'hijo', horas: 6 }] }),
        paquete: { horas: 9, dias: [0, 2, 4], inicio: '15:00', tareas: [T[0], T[1], T[4]] }, pagador: 'subsidio',
        asignacion: { relevoId: 'r2', fecha: hace(21), historial: [] } }),
      C({ id: 'k3', folio: 'C-0003', fecha: hace(48), alcaldia: 'Iztapalapa', estado: 'activo',
        cuidadora: { alias: 'Laura', sexo: 'M', horas: 45, abvd: true, danoSalud: false, danoTrabajo: true },
        persona: { alias: 'Hermano', sexo: 'H', grupo: GRUPOS[1], edad: 29 },
        hogar: buildHogar({ cuidadora: { nombre: 'Laura', edad: 34, rol: 'hermana', horas: 45 }, cuidada: { nombre: 'Hermano', edad: 29, rol: 'hermano' }, apoyos: [{ nombre: 'Doña Rosa', edad: 62, rol: 'madre', horas: 10 }] }),
        paquete: { horas: 6, dias: [5], inicio: '09:00', tareas: [T[2], T[3], T[0]] }, pagador: 'familia',
        asignacion: { relevoId: 'r5', fecha: hace(42), historial: [] } }),
      C({ id: 'k4', folio: 'C-0004', fecha: hace(9), alcaldia: 'Cuauhtémoc', estado: 'espera',
        cuidadora: { alias: 'Sofía', sexo: 'M', horas: 42, abvd: false, danoSalud: true, danoTrabajo: false },
        persona: { alias: 'Abuelo', sexo: 'H', grupo: GRUPOS[0], edad: 85 },
        hogar: buildHogar({ cuidadora: { nombre: 'Sofía', edad: 29, rol: 'nieta', horas: 42 }, cuidada: { nombre: 'Abuelo', edad: 85, rol: 'abuelo' } }),
        paquete: { horas: 6, dias: [4], inicio: '23:00', tareas: [T[0], T[4]] }, pagador: 'mixto', pctSubsidio: 70 }),
      C({ id: 'k5', folio: 'C-0005', fecha: hace(18), alcaldia: 'Gustavo A. Madero', estado: 'activo',
        cuidadora: { alias: 'Jorge', sexo: 'H', horas: 40, abvd: true, danoSalud: true, danoTrabajo: true },
        persona: { alias: 'Papá', sexo: 'H', grupo: GRUPOS[2], edad: 74 },
        hogar: buildHogar({ cuidadora: { nombre: 'Jorge', edad: 50, rol: 'hijo', horas: 40 }, cuidada: { nombre: 'Papá', edad: 74, rol: 'padre' }, apoyos: [{ nombre: 'Marta', edad: 47, rol: 'hija', horas: 15 }] }),
        paquete: { horas: 12, dias: [0, 1, 2, 3], inicio: '08:00', tareas: [T[1], T[3], T[2]] }, pagador: 'subsidio',
        asignacion: { relevoId: 'r8', fecha: hace(14), historial: [] } }),
      C({ id: 'k6', folio: 'C-0006', fecha: hace(12), alcaldia: 'Tlalpan', estado: 'fuera',
        cuidadora: { alias: 'Paula', sexo: 'M', horas: 24, abvd: false, danoSalud: false, danoTrabajo: true },
        persona: { alias: 'Mamá', sexo: 'M', grupo: GRUPOS[0], edad: 68 },
        hogar: buildHogar({ cuidadora: { nombre: 'Paula', edad: 41, rol: 'hija', horas: 24 }, cuidada: { nombre: 'Mamá', edad: 68, rol: 'madre' }, apoyos: [{ nombre: 'Tío', edad: 66, rol: 'tío', horas: 8 }] }),
        paquete: { horas: 3, dias: [5], inicio: '10:00', tareas: [T[0]] } }),
      C({ id: 'k7', folio: 'C-0007', fecha: hace(1), alcaldia: 'Xochimilco', estado: 'espera',
        cuidadora: { alias: 'Rocío', sexo: 'M', horas: 60, abvd: true, danoSalud: true, danoTrabajo: true },
        persona: { alias: 'Suegra', sexo: 'M', grupo: GRUPOS[2], edad: 88 },
        hogar: buildHogar({ cuidadora: { nombre: 'Rocío', edad: 55, rol: 'nuera', horas: 60 }, cuidada: { nombre: 'Suegra', edad: 88, rol: 'suegra' }, apoyos: [{ nombre: 'Raúl', edad: 58, rol: 'hijo', horas: 4 }] }),
        paquete: { horas: 6, dias: [0, 2], inicio: '10:00', tareas: [T[0], T[1], T[2]] }, pagador: 'subsidio' }),
      C({ id: 'k8', folio: 'C-0008', fecha: hace(33), alcaldia: 'Coyoacán', estado: 'activo',
        cuidadora: { alias: 'Andrés', sexo: 'H', horas: 48, abvd: false, danoSalud: true, danoTrabajo: false },
        persona: { alias: 'Mamá', sexo: 'M', grupo: GRUPOS[0], edad: 79 },
        hogar: buildHogar({ cuidadora: { nombre: 'Andrés', edad: 52, rol: 'hijo', horas: 48 }, cuidada: { nombre: 'Mamá', edad: 79, rol: 'madre' } }),
        paquete: { horas: 6, dias: [1, 3], inicio: '16:00', tareas: [T[0], T[1], T[5]] }, pagador: 'familia',
        asignacion: { relevoId: 'r10', fecha: hace(16), historial: [{ relevoId: 'r1', desde: hace(28), hasta: hace(16), motivo: 'Dos ausencias sin aviso; la familia pidió cambio' }] } }),
    ];

    // Visitas pasadas (SIMULADAS) desde el inicio de cada asignación hasta ayer
    const rand = rng(20261008);
    const visitas = [];
    casos.filter((c) => c.asignacion).forEach((c) => {
      const tramos = (c.asignacion.historial || []).map((h) => ({ relevoId: h.relevoId, desde: h.desde, hasta: h.hasta }))
        .concat([{ relevoId: c.asignacion.relevoId, desde: c.asignacion.fecha, hasta: hoy }]);
      const ev = Care.relevo.evaluarPaquete(c.paquete, 0);
      tramos.forEach((t, ti) => {
        for (let d = t.desde; d < t.hasta; d = sumaDias(d, 1)) {
          if (!c.paquete.dias.includes(diaIdx(d))) continue;
          const u = rand();
          const anterior = ti < tramos.length - 1; // tramo con la persona reemplazada: más ausencias
          let estado = 'realizada';
          if (u < (anterior ? 0.25 : 0.04)) estado = 'no_llego';
          else if (u < (anterior ? 0.28 : 0.07)) estado = 'cancelada';
          const tarde = estado === 'realizada' && rand() < 0.15 ? 10 + Math.floor(rand() * 25) : Math.floor(rand() * 6);
          visitas.push({
            id: 'v' + visitas.length, casoId: c.id, relevoId: t.relevoId, fecha: d,
            ini: Care.relevo.fmtHora(ev.iniMin), fin: Care.relevo.fmtHora(ev.finMin), estado,
            llegada: estado === 'realizada' ? Care.relevo.fmtHora(ev.iniMin + tarde) : null,
            salida: estado === 'realizada' ? Care.relevo.fmtHora(ev.finMin + Math.floor(rand() * 5)) : null,
          });
        }
      });
    });

    const incidentes = [
      { id: 'i1', casoId: 'k8', fecha: hace(21), reporta: 'familia', tipo: 'No llegó', nota: 'Segunda ausencia sin aviso.', estado: 'cerrado', resolucion: 'Reasignación' },
      { id: 'i2', casoId: 'k3', fecha: hace(30), reporta: 'relevo', tipo: 'Riesgo en el domicilio', nota: 'Escalera sin barandal en el acceso.', estado: 'cerrado', resolucion: 'Se avisó a la institución' },
      { id: 'i3', casoId: 'k1', fecha: hace(3), reporta: 'familia', tipo: 'Llegó tarde', nota: '30 min tarde, sin aviso.', estado: 'abierto' },
    ];

    // Respuestas semanales SIMULADAS sin tendencia (0-4 cansancio; 0-7 noches con mal sueño)
    const checkins = [];
    casos.filter((c) => c.asignacion).forEach((c) => {
      const inicio = (c.asignacion.historial[0] || c.asignacion).desde || c.asignacion.fecha;
      for (let s = lunesDe(inicio); s < hoy; s = sumaDias(s, 7)) {
        if (rand() < 0.15) continue; // semanas sin respuesta
        checkins.push({ id: 'q' + checkins.length, casoId: c.id, semana: s, cansancio: Math.min(4, Math.max(0, Math.round(2.6 + (rand() - 0.5) * 2.4))), malasNoches: Math.floor(rand() * 6) });
      }
    });

    return { casos, relevos, visitas, incidentes, checkins };
  }

  /* ---------- Almacenamiento ---------- */
  const KEY = 'care-relevo-v2'; // v2: agrega sexo (íconos)
  const listeners = [];
  let state = null;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const aprobado = (x) => !!(x && x.verificacion && x.verificacion.estado === 'aprobada');

  function normalize(s) {
    const arr = (k) => (Array.isArray(s && s[k]) ? s[k] : []);
    return {
      casos: arr('casos'), relevos: arr('relevos'), visitas: arr('visitas'), incidentes: arr('incidentes'), checkins: arr('checkins'),
      config: Object.assign({}, CONFIG_DEFAULT, (s && s.config) || {}),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = normalize(JSON.parse(raw)); return; }
    } catch (e) { /* almacenamiento no disponible: se usa memoria */ }
    state = normalize(Object.assign(seed(), { config: clone(CONFIG_DEFAULT) }));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ } }
  function emit() { save(); listeners.forEach((fn) => fn(state)); }
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const caso = (id) => state.casos.find((c) => c.id === id);

  /** Visitas programadas para una fecha (casos activos cuya asignación ya empezó). */
  function programadasEn(fecha) {
    return state.casos.filter((c) => c.estado === 'activo' && c.asignacion && c.asignacion.fecha <= fecha && c.paquete.dias.includes(diaIdx(fecha)))
      .map((c) => {
        const ev = Care.relevo.evaluarPaquete(c.paquete, 0);
        const reg = state.visitas.find((v) => v.casoId === c.id && v.fecha === fecha);
        return { caso: c, relevoId: c.asignacion.relevoId, ini: Care.relevo.fmtHora(ev.iniMin), fin: Care.relevo.fmtHora(ev.finMin), reg };
      });
  }

  function visitaDe(casoId, fecha) {
    let v = state.visitas.find((x) => x.casoId === casoId && x.fecha === fecha);
    if (!v) {
      const p = programadasEn(fecha).find((x) => x.caso.id === casoId);
      if (!p) return null;
      v = { id: uid('v'), casoId, relevoId: p.relevoId, fecha, ini: p.ini, fin: p.fin, estado: 'pendiente', llegada: null, salida: null };
      state.visitas.push(v);
    }
    return v;
  }
  const ahora = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  const store = {
    get state() { return state; },
    subscribe(fn) { listeners.push(fn); },
    update(mutator) { mutator(state); emit(); },
    replace(next) { state = normalize(next); emit(); },
    resetSeed() { state = normalize(Object.assign(seed(), { config: state.config })); emit(); },
    clearAll() { state = normalize({ config: state.config }); emit(); },
    uid, aprobado, programadasEn,
    nextFolio() {
      const n = state.casos.reduce((m, c) => Math.max(m, parseInt(String(c.folio || '').split('-')[1], 10) || 0), 0);
      return 'C-' + String(n + 1).padStart(4, '0');
    },
    resolverRelevo(id, aprobada, motivo) {
      const r = state.relevos.find((x) => x.id === id); if (!r) return;
      r.verificacion = { estado: aprobada ? 'aprobada' : 'rechazada', motivo: aprobada ? '' : motivo, fecha: hoyISO(), origen: 'revision' };
      emit();
    },
    existeRelevoCURP(curp) { return state.relevos.some((r) => r.legal && r.legal.curp === curp && (r.verificacion || {}).estado !== 'rechazada'); },
    asignar(casoId, relevoId, formalizacion) {
      const c = caso(casoId); if (!c) return false;
      c.asignacion = { relevoId, fecha: hoyISO(), formalizacion, historial: (c.asignacion && c.asignacion.historial) || [] };
      c.estado = 'activo';
      emit(); return true;
    },
    reasignar(casoId, relevoId, motivo, formalizacion) {
      const c = caso(casoId); if (!c || !c.asignacion) return false;
      const h = c.asignacion.historial || [];
      h.push({ relevoId: c.asignacion.relevoId, desde: c.asignacion.fecha, hasta: hoyISO(), motivo });
      c.asignacion = { relevoId, fecha: hoyISO(), formalizacion, historial: h };
      emit(); return true;
    },
    cerrarCaso(casoId, motivo) { const c = caso(casoId); if (c) { c.estado = 'cerrado'; c.cierre = { fecha: hoyISO(), motivo }; emit(); } },
    incluirPorCriterio(casoId, motivo) { const c = caso(casoId); if (c) { c.inclusion = { motivo, fecha: hoyISO() }; c.estado = 'espera'; emit(); } },
    registrarLlegada(casoId, fecha) { const v = visitaDe(casoId, fecha); if (v) { v.llegada = ahora(); v.estado = 'en_curso'; emit(); } },
    registrarSalida(casoId, fecha) { const v = visitaDe(casoId, fecha); if (v) { v.salida = ahora(); v.estado = 'realizada'; emit(); } },
    marcarVisita(casoId, fecha, estado) { const v = visitaDe(casoId, fecha); if (v) { v.estado = estado; v.llegada = null; v.salida = null; emit(); } },
    addIncidente(i) { state.incidentes.unshift(Object.assign({ id: uid('i'), fecha: hoyISO(), estado: 'abierto' }, i)); emit(); },
    cerrarIncidente(id, resolucion) { const i = state.incidentes.find((x) => x.id === id); if (i) { i.estado = 'cerrado'; i.resolucion = resolucion; emit(); } },
    addCheckin(casoId, cansancio, malasNoches) {
      const semana = lunesDe(hoyISO());
      state.checkins = state.checkins.filter((q) => !(q.casoId === casoId && q.semana === semana));
      state.checkins.push({ id: uid('q'), casoId, semana, cansancio, malasNoches });
      emit();
    },
    removeCaso(id) {
      state.casos = state.casos.filter((c) => c.id !== id);
      ['visitas', 'incidentes', 'checkins'].forEach((k) => { state[k] = state[k].filter((x) => x.casoId !== id); });
      emit();
    },
    removeRelevo(id) {
      if (state.casos.some((c) => c.estado === 'activo' && c.asignacion && c.asignacion.relevoId === id)) return false;
      state.relevos = state.relevos.filter((r) => r.id !== id); emit(); return true;
    },
  };

  window.Care = { ZONAS, GRUPOS, PARENTESCOS, TIPOS_INCIDENTE, CONFIG_DEFAULT, buildHogar, store,
    fechas: { iso, hoyISO, sumaDias, diaIdx, lunesDe, desdeISO } };
  // load() se llama desde app.js, cuando Care.relevo ya existe (el ejemplo usa sus catálogos).
  Care.store.load = load;
})();
