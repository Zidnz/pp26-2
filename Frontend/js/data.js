/* Catálogos, datos sintéticos y almacenamiento local. Namespace global: Care */
(function () {
  'use strict';

  const ZONAS = {
    'Álvaro Obregón': [19.359, -99.203],
    'Azcapotzalco': [19.487, -99.184],
    'Benito Juárez': [19.3727, -99.158],
    'Coyoacán': [19.3467, -99.1617],
    'Cuauhtémoc': [19.4326, -99.15],
    'Gustavo A. Madero': [19.483, -99.113],
    'Iztapalapa': [19.3574, -99.067],
    'Miguel Hidalgo': [19.433, -99.2],
    'Tlalpan': [19.29, -99.167],
    'Xochimilco': [19.257, -99.103],
  };

  const HABILIDADES = [
    'Movilización de pacientes', 'Administración de medicamentos', 'Curación de heridas',
    'Higiene personal', 'Alimentación asistida', 'Compañía y conversación',
    'Demencia y Alzheimer', 'Cuidado infantil', 'Signos vitales', 'Sondas y ostomías',
    'Rehabilitación básica', 'Discapacidad motriz',
  ];

  const TURNOS = ['Mañana', 'Tarde', 'Noche', 'Fines de semana'];
  const TIPOS = ['Adulto mayor', 'Infantil', 'Discapacidad', 'Postoperatorio'];
  const PARENTESCOS = ['madre', 'padre', 'abuela', 'abuelo', 'esposa', 'esposo', 'hija', 'hijo',
    'hermana', 'hermano', 'suegra', 'suegro', 'tía', 'tío', 'nieta', 'nieto', 'otro'];

  const PESOS_DEFAULT = { hab: 40, zona: 25, turnos: 25, tarifa: 10 };
  // horasTurno: horas de cuidado por semana que aporta un profesional por cada turno cubierto (supuesto del prototipo).
  const CONFIG_DEFAULT = { pesos: PESOS_DEFAULT, umbral: 50, maxKm: 25, horasTurno: 15 };

  const H = HABILIDADES;

  /**
   * Hogar sencillo: una persona que solicita (cuidadora principal), una persona que necesita cuidado
   * y hasta N apoyos. `horas` = horas de cuidado por semana. La necesidad de la persona cuidada es lo
   * que hoy se cubre más lo que aportaría un profesional en los turnos solicitados.
   */
  function buildHogar(o) {
    const ht = o.horasTurno || 15;
    const personas = [], relaciones = [];
    const s = { id: 's', nombre: o.solicitante.nombre, edad: o.solicitante.edad || null, rol: o.solicitante.rol || 'solicitante' };
    const c = { id: 'c', nombre: o.cuidada.nombre, edad: o.cuidada.edad || null, rol: o.cuidada.rol || 'familiar' };
    personas.push(s, c);
    relaciones.push({ de: 's', a: 'c', horas: o.solicitante.horas || 0 });
    (o.apoyos || []).filter((a) => a.nombre).forEach((a, i) => {
      const id = 'a' + (i + 1);
      personas.push({ id, nombre: a.nombre, edad: a.edad || null, rol: a.rol || 'familiar' });
      relaciones.push({ de: id, a: 'c', horas: a.horas || 0 });
    });
    c.necesita = relaciones.reduce((t, r) => t + r.horas, 0) + (o.turnos || 0) * ht;
    return { foco: 'c', personas, relaciones: relaciones.filter((r) => r.horas > 0) };
  }

  function seed() {
    const hoy = new Date().toISOString().slice(0, 10);
    const P = (id, folio, titulo, contacto, texto, tipo, perfil, necesidades, zona, turnos, presupuesto, urgencia, hogar, estado) =>
      ({ id, folio, titulo, contacto, texto, tipo, perfil, necesidades, zona, turnos, presupuesto, urgencia, hogar, estado: estado || 'abierta', fecha: hoy });

    const publicaciones = [
      P('p1', '2026-08814', 'Cuidado de mi mamá (82 años)', 'Marisol',
        'Buenas tardes, escribo porque llevo tres meses sin poder ir a trabajar. Mi mamá tiene 82 años y ya no puede quedarse sola, se cayó dos veces. Vivo con ella en la colonia Guerrero y soy la única que la puede cuidar. Quiero saber si hay algún apoyo o algún lugar donde la reciban de día.',
        'Adulto mayor', 'cualquiera', [H[5], H[3], H[0]], 'Cuauhtémoc', ['Mañana', 'Tarde'], 130, 'alta',
        {
          foco: 'elvira',
          personas: [
            { id: 'marisol', nombre: 'Marisol', edad: 47, rol: 'hija' },
            { id: 'elvira', nombre: 'Elvira', edad: 82, rol: 'madre', necesita: 70 },
            { id: 'tomas', nombre: 'Tomás', edad: 51, rol: 'esposo' },
            { id: 'ana', nombre: 'Ana', edad: 14, rol: 'hija' },
            { id: 'beto', nombre: 'Beto', edad: 9, rol: 'hijo' },
            { id: 'nico', nombre: 'Nico', edad: 3, rol: 'nieto' },
          ],
          relaciones: [
            { de: 'marisol', a: 'elvira', horas: 40 }, { de: 'marisol', a: 'ana', horas: 20 },
            { de: 'marisol', a: 'beto', horas: 20 }, { de: 'marisol', a: 'nico', horas: 46 },
            { de: 'tomas', a: 'nico', horas: 10 },
          ],
        }),
      P('p2', '2026-08815', 'Curaciones tras operación de cadera', 'Sr. Ramírez',
        'Operaron a mi esposa de la cadera hace una semana. Necesita curaciones y sus medicamentos en casa, yo trabajo por la mañana y no puedo estar con ella. Vivimos en la colonia Del Valle.',
        'Postoperatorio', 'enfermero', [H[2], H[1], H[0], H[8]], 'Benito Juárez', ['Mañana', 'Noche'], 220, 'alta',
        buildHogar({ solicitante: { nombre: 'Sr. Ramírez', edad: 72, rol: 'esposo', horas: 20 }, cuidada: { nombre: 'Esposa', edad: 70, rol: 'esposa' }, apoyos: [{ nombre: 'Luis', edad: 40, rol: 'hijo', horas: 8 }], turnos: 2 })),
      P('p3', '2026-08816', 'Niña de 4 años, salida de la guardería', 'Familia Paredes',
        'Mi hija de 4 años sale de la guardería a las 2 y nadie la cuida por la tarde. Vivimos en Tlalpan y yo trabajo hasta las 7.',
        'Infantil', 'cuidador', [H[7], H[4]], 'Tlalpan', ['Tarde'], 90, 'media',
        buildHogar({ solicitante: { nombre: 'Paula', edad: 31, rol: 'madre', horas: 20 }, cuidada: { nombre: 'Niña', edad: 4, rol: 'hija' }, apoyos: [{ nombre: 'Abuelo', edad: 66, rol: 'padre', horas: 6 }], turnos: 1 }), 'cubierta'),
      P('p4', '2026-08817', 'Apoyo para hermano con discapacidad motriz', 'Laura M.',
        'Vivo con mi hermano, que tiene discapacidad motriz y usa silla de ruedas. Por las mañanas y los fines de semana necesito quien nos ayude a moverlo y bañarlo. Estamos en Iztapalapa.',
        'Discapacidad', 'cualquiera', [H[11], H[0], H[3]], 'Iztapalapa', ['Mañana', 'Fines de semana'], 110, 'media',
        buildHogar({ solicitante: { nombre: 'Laura', edad: 34, rol: 'hermana', horas: 30 }, cuidada: { nombre: 'Hermano', edad: 29, rol: 'hermano' }, apoyos: [{ nombre: 'Doña Rosa', edad: 62, rol: 'madre', horas: 10 }], turnos: 2 })),
      P('p5', '2026-08818', 'Compañía nocturna para mi abuelo', 'Familia Salgado',
        'Mi abuelo de 85 años se queda solo por las noches y me preocupa que no tome sus medicinas. Necesito alguien que lo acompañe de noche, en la colonia Roma.',
        'Adulto mayor', 'cuidador', [H[5], H[1], H[8]], 'Cuauhtémoc', ['Noche'], 150, 'baja',
        buildHogar({ solicitante: { nombre: 'Sofía', edad: 29, rol: 'nieta', horas: 6 }, cuidada: { nombre: 'Abuelo', edad: 85, rol: 'abuelo' }, turnos: 1 })),
      P('p6', '2026-08819', 'Sonda y curaciones por las tardes', 'Dra. Vega',
        'Necesito una enfermera para curaciones y cambio de sonda de mi papá por las tardes, en Polanco. Se lastimó y no puedo hacerlo sola.',
        'Postoperatorio', 'enfermero', [H[9], H[2]], 'Miguel Hidalgo', ['Tarde'], 240, 'alta',
        buildHogar({ solicitante: { nombre: 'Elena', edad: 45, rol: 'hija', horas: 12 }, cuidada: { nombre: 'Papá', edad: 78, rol: 'padre' }, turnos: 1 })),
      P('p7', '2026-08820', 'Rehabilitación tras derrame de mi papá', 'Familia Cruz',
        'Mi papá tuvo un derrame hace dos meses y necesita terapia de rehabilitación y ayuda para comer y moverse por las mañanas y las tardes. Vivimos en Lindavista.',
        'Adulto mayor', 'cualquiera', [H[10], H[0], H[4]], 'Gustavo A. Madero', ['Mañana', 'Tarde'], 140, 'media',
        buildHogar({ solicitante: { nombre: 'Jorge', edad: 50, rol: 'hijo', horas: 25 }, cuidada: { nombre: 'Papá', edad: 74, rol: 'padre' }, apoyos: [{ nombre: 'Marta', edad: 47, rol: 'hija', horas: 15 }], turnos: 2 })),
      P('p8', '2026-08821', 'Cuidado de mis dos hijos, fines de semana', 'Familia Núñez',
        'Necesito quien cuide a mis dos hijos de 6 y 8 años los sábados y domingos, vivo en Santa Fe.',
        'Infantil', 'cuidador', [H[7]], 'Álvaro Obregón', ['Fines de semana'], 100, 'baja',
        {
          foco: 'hijo',
          personas: [
            { id: 'paola', nombre: 'Paola', edad: 36, rol: 'madre' },
            { id: 'hijo', nombre: 'Hijo', edad: 8, rol: 'hijo', necesita: 27 },
            { id: 'hija', nombre: 'Hija', edad: 6, rol: 'hija' },
          ],
          relaciones: [{ de: 'paola', a: 'hijo', horas: 12 }, { de: 'paola', a: 'hija', horas: 12 }],
        }),
    ];

    const c = (id, nombre, perfil, habilidades, tipos, zona, turnos, tarifa, experiencia, rating) =>
      ({ id, nombre, perfil, habilidades, tipos, zona, turnos, tarifa, experiencia, rating });

    const cuidadores = [
      c('c1', 'Rosa Martínez', 'cuidador', [H[6], H[3], H[5], H[4]], ['Adulto mayor'], 'Coyoacán', ['Mañana', 'Tarde'], 120, 8, 4.8),
      c('c2', 'Luis Hernández', 'enfermero', [H[2], H[1], H[0], H[8], H[9]], ['Postoperatorio', 'Adulto mayor'], 'Benito Juárez', ['Mañana', 'Noche'], 210, 6, 4.7),
      c('c3', 'Ana Beltrán', 'cuidador', [H[7], H[4], H[5]], ['Infantil'], 'Tlalpan', ['Tarde', 'Fines de semana'], 85, 4, 4.5),
      c('c4', 'Marta Quiroz', 'cuidador', [H[7], H[4]], ['Infantil'], 'Tlalpan', ['Tarde'], 90, 5, 4.9),
      c('c5', 'Jorge Aguilar', 'cuidador', [H[11], H[0], H[3], H[10]], ['Discapacidad', 'Adulto mayor'], 'Iztapalapa', ['Mañana', 'Fines de semana'], 105, 7, 4.6),
      c('c6', 'Elena Rojas', 'enfermero', [H[9], H[2], H[1], H[8]], ['Postoperatorio'], 'Cuauhtémoc', ['Tarde', 'Noche'], 235, 10, 4.9),
      c('c7', 'Pedro Salinas', 'cuidador', [H[5], H[1], H[8], H[3]], ['Adulto mayor'], 'Cuauhtémoc', ['Noche'], 140, 3, 4.3),
      c('c8', 'Sofía Delgado', 'enfermero', [H[10], H[0], H[8], H[1]], ['Adulto mayor', 'Discapacidad'], 'Gustavo A. Madero', ['Mañana', 'Tarde'], 190, 9, 4.8),
      c('c9', 'Ricardo Mena', 'cuidador', [H[7], H[5]], ['Infantil'], 'Álvaro Obregón', ['Fines de semana', 'Tarde'], 95, 2, 4.2),
      c('c10', 'Guadalupe Islas', 'cuidador', [H[6], H[5], H[4], H[3]], ['Adulto mayor'], 'Xochimilco', ['Mañana'], 100, 12, 4.7),
      c('c11', 'Diego Paredes', 'enfermero', [H[2], H[9], H[8]], ['Postoperatorio', 'Discapacidad'], 'Miguel Hidalgo', ['Tarde'], 225, 5, 4.4),
      c('c12', 'Claudia Ibarra', 'cuidador', [H[11], H[3], H[5], H[0]], ['Discapacidad', 'Adulto mayor'], 'Azcapotzalco', ['Mañana', 'Tarde', 'Fines de semana'], 115, 6, 4.6),
    ];

    const contrataciones = [{ id: 'h1', pubId: 'p3', cuiId: 'c4', fecha: hoy }];
    return { publicaciones, cuidadores, contrataciones };
  }

  /* ---------- Almacenamiento ---------- */
  const KEY = 'care-match-v2';
  const listeners = [];
  let state = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Registros anteriores al filtro legal (datos de ejemplo o JSON viejo) se marcan como precargados y aprobados.
  const PRECARGADO = () => ({ estado: 'aprobada', origen: 'precargado' });
  function conVerificacion(x) { if (!x.verificacion) x.verificacion = PRECARGADO(); return x; }
  const aprobado = (x) => !!(x && x.verificacion && x.verificacion.estado === 'aprobada');

  function normalize(s) {
    const cfg = Object.assign({}, CONFIG_DEFAULT, (s && s.config) || {});
    cfg.pesos = Object.assign({}, PESOS_DEFAULT, cfg.pesos || {});
    return {
      publicaciones: (Array.isArray(s && s.publicaciones) ? s.publicaciones : []).map(conVerificacion),
      cuidadores: (Array.isArray(s && s.cuidadores) ? s.cuidadores : []).map(conVerificacion),
      contrataciones: Array.isArray(s && s.contrataciones) ? s.contrataciones : [],
      config: cfg,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = normalize(JSON.parse(raw)); return; }
    } catch (e) { /* almacenamiento no disponible: se usa memoria */ }
    state = normalize(Object.assign(seed(), { config: clone(CONFIG_DEFAULT) }));
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
  }

  function emit() { save(); listeners.forEach((fn) => fn(state)); }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  // Completa la clasificación de las peticiones que traen texto y aún no fueron clasificadas.
  function ensureClasificacion() {
    if (!Care.clasificador) return;
    let cambio = false;
    state.publicaciones.forEach((p) => {
      if (p.texto && !p.clasificacion) { p.clasificacion = Care.clasificador.resumen(Care.clasificador.analizar(p.texto)); cambio = true; }
    });
    if (cambio) save();
  }

  const store = {
    get state() { return state; },
    subscribe(fn) { listeners.push(fn); },
    update(mutator) { mutator(state); emit(); },
    init() { ensureClasificacion(); },
    replace(next) { state = normalize(next); ensureClasificacion(); emit(); },
    resetSeed() { state = normalize(Object.assign(seed(), { config: state.config })); ensureClasificacion(); emit(); },
    clearAll() { state = normalize({ config: state.config }); emit(); },
    uid,
    nextFolio() {
      const n = state.publicaciones.reduce((m, p) => Math.max(m, parseInt(String(p.folio || '').split('-')[1], 10) || 0), 8813);
      return '2026-' + String(n + 1).padStart(5, '0');
    },
    contratacionDePub(pubId) { return state.contrataciones.find((h) => h.pubId === pubId) || null; },
    contratacionDeCui(cuiId) { return state.contrataciones.find((h) => h.cuiId === cuiId) || null; },
    // Solo se contrata entre registros aprobados y con la formalización (contrato, IMSS, tarifa) capturada.
    hire(pubId, cuiId, formalizacion) {
      const p = state.publicaciones.find((x) => x.id === pubId);
      const c = state.cuidadores.find((x) => x.id === cuiId);
      if (!aprobado(p) || !aprobado(c) || !formalizacion) return false;
      state.contrataciones = state.contrataciones.filter((h) => h.pubId !== pubId && h.cuiId !== cuiId);
      state.contrataciones.push({ id: uid('h'), pubId, cuiId, fecha: new Date().toISOString().slice(0, 10), formalizacion });
      p.estado = 'cubierta';
      emit();
      return true;
    },
    aprobado,
    // Revisión: la resuelve quien modera (rol simulado en el prototipo).
    resolver(tipo, id, aprobada, motivo) {
      const lista = tipo === 'pub' ? state.publicaciones : state.cuidadores;
      const x = lista.find((y) => y.id === id);
      if (!x) return;
      x.verificacion = { estado: aprobada ? 'aprobada' : 'rechazada', motivo: aprobada ? '' : motivo, fecha: new Date().toISOString().slice(0, 10), origen: 'revision' };
      emit();
    },
    // Cuántas peticiones vigentes (en revisión o aprobadas y abiertas) tiene una CURP; y si un profesional ya existe con ella.
    peticionesActivasDe(curp) {
      return state.publicaciones.filter((p) => p.legal && p.legal.curp === curp && p.verificacion.estado !== 'rechazada' && p.estado === 'abierta').length;
    },
    existeCuidadorCURP(curp) {
      return state.cuidadores.some((c) => c.legal && c.legal.curp === curp && c.verificacion.estado !== 'rechazada');
    },
    unhire(pubId) {
      state.contrataciones = state.contrataciones.filter((h) => h.pubId !== pubId);
      const p = state.publicaciones.find((x) => x.id === pubId);
      if (p) p.estado = 'abierta';
      emit();
    },
    removePub(id) {
      state.publicaciones = state.publicaciones.filter((p) => p.id !== id);
      state.contrataciones = state.contrataciones.filter((h) => h.pubId !== id);
      emit();
    },
    removeCui(id) {
      const h = state.contrataciones.find((x) => x.cuiId === id);
      if (h) {
        const p = state.publicaciones.find((x) => x.id === h.pubId);
        if (p) p.estado = 'abierta';
      }
      state.cuidadores = state.cuidadores.filter((c) => c.id !== id);
      state.contrataciones = state.contrataciones.filter((x) => x.cuiId !== id);
      emit();
    },
  };

  load();

  window.Care = { ZONAS, HABILIDADES, TURNOS, TIPOS, PARENTESCOS, PESOS_DEFAULT, CONFIG_DEFAULT, buildHogar, store };
})();
