/*
 * Clasificador de peticiones de cuidado — DEMO por reglas (palabras clave y expresiones regulares).
 * No es un modelo entrenado: los puntajes son heurísticos y sirven para mostrar el flujo
 * petición → clasificación → publicación → contratación → red del hogar.
 */
(function () {
  'use strict';

  const H = Care.HABILIDADES;
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

  // Minúsculas y sin acentos; conserva la longitud para poder mapear posiciones al texto original.
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const CATEGORIAS = {
    'Cuidados de larga duración': [
      /\bcuid(ar|o|a|ado|adora|ando|arla|arlo)\b/, /postrad/, /no puede(n)? (quedarse|estar) sol/, /unic[oa] (que|persona)/,
      /demencia|alzheimer/, /discapacidad/, /depende(n)? de/, /adult[oa]s? mayor/, /relevo|descanso/,
      /centro de dia|donde (la|lo) reciban/,
      /\bmi (mama|papa|madre|padre|abuel[oa]|espos[oa]|herman[oa]|suegr[oa])\b/,
    ],
    'Salud / adulto mayor': [
      /medic(ament|ina)/, /enferm/, /hospital|clinica/, /\bcay(o|eron)\b|caida/, /cirug|operaron|operacion|cadera|fractura|accidente/,
      /silla de ruedas/, /terapia|rehabilit/, /presion|diabet|glucosa|derrame/, 'edad60',
    ],
    'Empleo e ingreso': [/trabaj/, /empleo|ingreso|dinero|econom|sueldo/, /deje (la|mi|el) (prepa|escuela|trabajo|universidad|secundaria)/],
    'Servicios urbanos': [/fuga|drenaje|alcantarill/, /\bagua\b|\bluz\b|alumbrado/, /bache|banqueta|\bcalle\b|avenida/, /basura|poda|arbol/, /semaforo|transporte|camion/],
    'Infancia y educación': [/\bnin[oa]s?\b|bebe|hijit[oa]/, /guarderia|estancia infantil/, /hij[oa]s? de \d/, /prepa|escuela|primaria/, 'edad15'],
  };

  const EVIDENCIA = [
    ['dependencia', /(ya )?no puede(n)? (quedarse|estar) sol[oa]/g],
    ['dependencia', /soy (la|el) unic[oa][^.,;]{0,40}/g],
    ['dependencia', /postrad[oa]/g],
    ['dependencia', /(tiene|con|padece) (alzheimer|demencia)/g],
    ['dependencia', /discapacidad( motriz)?/g],
    ['dependencia', /no puede(n)? (caminar|moverse|valerse por si mism[oa])/g],
    ['dependencia', /(usa|en) silla de ruedas/g],
    ['dependencia', /(se queda|queda) sol[oa]s?( por (la|las) noches?)?/g],
    ['dependencia', /trabajar de noche/g],
    ['dependencia', /nadie (mas )?(la|lo|los|las) cuida/g],
    ['ingreso', /llevo [a-z0-9 ]{1,20}sin poder (ir a )?trabajar/g],
    ['ingreso', /deje (la|mi|el) (prepa|escuela|secundaria|universidad|trabajo|empleo)/g],
    ['ingreso', /perdi (mi )?(trabajo|empleo)/g],
    ['ingreso', /no puedo (ir a )?trabajar/g],
    ['riesgo', /se cayo( (dos|tres|varias|muchas) veces| una vez)?/g],
    ['riesgo', /caidas?( recurrentes)?/g],
    ['riesgo', /se (lastimo|golpeo|quemo)/g],
    ['riesgo', /no tome sus medicinas|no toma sus medicinas|sin (sus )?medicamentos/g],
    ['riesgo', /accidente/g],
  ];

  const PARENT = {
    mama: ['madre', 'Mamá'], madre: ['madre', 'Madre'], papa: ['padre', 'Papá'], padre: ['padre', 'Padre'],
    abuela: ['abuela', 'Abuela'], abuelo: ['abuelo', 'Abuelo'], esposa: ['esposa', 'Esposa'], esposo: ['esposo', 'Esposo'],
    hermana: ['hermana', 'Hermana'], hermano: ['hermano', 'Hermano'], hija: ['hija', 'Hija'], hijo: ['hijo', 'Hijo'],
    suegra: ['suegra', 'Suegra'], suegro: ['suegro', 'Suegro'], tia: ['tía', 'Tía'], tio: ['tío', 'Tío'],
    nieta: ['nieta', 'Nieta'], nieto: ['nieto', 'Nieto'],
  };

  const COLONIAS = {
    guerrero: 'Cuauhtémoc', roma: 'Cuauhtémoc', condesa: 'Cuauhtémoc', doctores: 'Cuauhtémoc', centro: 'Cuauhtémoc',
    'del valle': 'Benito Juárez', narvarte: 'Benito Juárez', portales: 'Benito Juárez',
    'santa fe': 'Álvaro Obregón', polanco: 'Miguel Hidalgo', tacuba: 'Miguel Hidalgo', lindavista: 'Gustavo A. Madero',
    'del carmen': 'Coyoacán', 'copilco': 'Coyoacán',
  };

  const NECESIDADES = [
    [0, /movilizar|mover|levantar|silla de ruedas|postrad|caida|se cayo|caminar/],
    [1, /medic(ament|ina)|pastilla|inyecc|insulina/],
    [2, /herida|curacion|ulcera|escara|cirug|operaron|operacion/],
    [3, /banar|higiene|aseo|panal/],
    [4, /\bcomer\b|aliment|tragar/],
    [5, /\bsol[oa]s?\b|compan|soledad/],
    [6, /alzheimer|demencia|olvid|desorient|se pierde/],
    [7, /\bnin[oa]s?\b|bebe|guarderia|hij[oa]s? de \d|hij[oa]s? pequen/],
    [8, /presion|signos|glucosa|diabet|oxigen|hipertens/],
    [9, /sonda|ostomia|colostomia/],
    [10, /rehabilit|terapia|derrame|fisioterap|ejercicios/],
    [11, /motriz|paralisis|silla de ruedas/],
  ];

  const DEFECTO_TIPO = {
    'Adulto mayor': [5, 3], Infantil: [7], Discapacidad: [11, 0], Postoperatorio: [2, 8],
  };

  const puntaje = (hits) => Math.min(0.97, Math.round((1 - Math.pow(0.55, hits)) * 100) / 100);
  const cuenta = (re, t) => (re.test(t) ? 1 : 0);

  function analizar(texto) {
    const orig = String(texto || '').normalize('NFC');
    const t = norm(orig);
    const ok = t.length === orig.length; // si cambia la longitud no se pueden mapear posiciones

    // Edades mencionadas
    const edades = [];
    const reEdad = /(\d{1,3}) anos/g;
    let m;
    while ((m = reEdad.exec(t))) { const n = +m[1]; if (n > 0 && n < 120) edades.push({ n, ini: m.index, fin: m.index + m[0].length }); }
    const hayMayor = edades.some((e) => e.n >= 60), hayMenor = edades.some((e) => e.n < 15);

    // Categorías
    const categorias = Object.keys(CATEGORIAS).map((nombre) => {
      const hits = CATEGORIAS[nombre].reduce((a, r) => {
        if (r === 'edad60') return a + (hayMayor ? 1 : 0);
        if (r === 'edad15') return a + (hayMenor ? 1 : 0);
        return a + cuenta(r, t);
      }, 0);
      return { nombre, score: hits ? puntaje(hits) : 0 };
    }).filter((c) => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    const top = categorias[0] || null;
    const cuidado = categorias.filter((c) => c.nombre !== 'Servicios urbanos' && c.nombre !== 'Empleo e ingreso');
    const esCuidado = !!top && top.nombre !== 'Servicios urbanos' && cuidado.length > 0;

    // Evidencia resaltable
    let ev = [];
    const cont = { dependencia: 0, ingreso: 0, riesgo: 0 };
    EVIDENCIA.forEach(([tipo, re]) => {
      re.lastIndex = 0;
      let x;
      while ((x = re.exec(t))) { ev.push({ ini: x.index, fin: x.index + x[0].length, tipo }); cont[tipo]++; if (x[0].length === 0) re.lastIndex++; }
    });
    edades.filter((e) => e.n >= 60).forEach((e) => { ev.push({ ini: e.ini, fin: e.fin, tipo: 'dependencia' }); cont.dependencia++; });
    ev.sort((a, b) => a.ini - b.ini || b.fin - a.fin);
    const sinSolape = [];
    ev.forEach((e) => { if (!sinSolape.length || e.ini >= sinSolape[sinSolape.length - 1].fin) sinSolape.push(e); });
    ev = ok ? sinSolape : [];

    // Persona que necesita cuidado
    const pm = t.match(/\bmi (mama|madre|papa|padre|abuela|abuelo|esposa|esposo|hermana|hermano|hija|hijo|suegra|suegro|tia|tio|nieta|nieto)\b/);
    const par = pm ? PARENT[pm[1]] : null;
    let edadCuidada = null;
    if (pm) {
      const cerca = t.slice(pm.index, pm.index + 60).match(/(\d{1,3}) anos/);
      if (cerca) edadCuidada = +cerca[1];
    }
    if (edadCuidada == null && edades.length) edadCuidada = edades[0].n;
    const cuidada = { nombre: par ? par[1] : 'Persona', edad: edadCuidada, rol: par ? par[0] : 'otro' };

    // Tipo de cuidado
    let tipo = 'Adulto mayor';
    if (/discapacidad|silla de ruedas|paralisis|invidente|sordo/.test(t)) tipo = 'Discapacidad';
    else if (/cirug|operaron|operacion|cadera|fractura|postrad|accidente|postoperator/.test(t)) tipo = 'Postoperatorio';
    else if (/\bnin[oa]s?\b|bebe|guarderia|hij[oa]s? pequen/.test(t) || (edadCuidada != null && edadCuidada < 15)) tipo = 'Infantil';
    else if (/mama|papa|madre|padre|abuel|suegr|adult[oa]s? mayor/.test(t) || (edadCuidada != null && edadCuidada >= 60)) tipo = 'Adulto mayor';

    const perfil = /sonda|herida|curacion|inyecc|medicament|glucosa|oxigeno|postoperator|cirug|ostomia|insulina/.test(t) ? 'enfermero' : 'cualquiera';

    // Necesidades (habilidades)
    const idx = [];
    NECESIDADES.forEach(([i, re]) => { if (re.test(t) && !idx.includes(i)) idx.push(i); });
    if (tipo === 'Infantil' && !idx.includes(7)) idx.push(7);
    if (!idx.length) DEFECTO_TIPO[tipo].forEach((i) => idx.push(i));
    const necesidades = idx.slice(0, 5).map((i) => H[i]);

    // Turnos
    const turnos = [];
    if (/por (la )?manana|por las mananas|en la manana|de manana|temprano/.test(t)) turnos.push('Mañana');
    if (/por (la )?tarde|por las tardes|en la tarde|de tarde|sale de la guarderia/.test(t)) turnos.push('Tarde');
    if (/de noche|por (la|las) noches?|nocturn|en la noche/.test(t)) turnos.push('Noche');
    if (/fin(es)? de semana|sabados?|domingos?/.test(t)) turnos.push('Fines de semana');
    if (!turnos.length) turnos.push('Mañana', 'Tarde');

    // Zona
    let zona = null;
    const tSinPunto = t.replace(/\./g, '');
    Object.keys(Care.ZONAS).forEach((z) => { if (!zona && tSinPunto.indexOf(norm(z).replace(/\./g, '')) >= 0) zona = z; });
    if (!zona) Object.keys(COLONIAS).forEach((k) => { if (!zona && new RegExp('\\b' + k + '\\b').test(t)) zona = COLONIAS[k]; });

    // Señales
    const unico = /soy (la|el) unic[oa]|nadie mas|no hay quien|no hay quien mas/.test(t);
    let senal = null;
    if (cont.ingreso && (cont.dependencia || unico)) {
      const cosas = [];
      if (cont.ingreso) cosas.push('pérdida de empleo o de ingreso');
      if (cont.riesgo) cosas.push('riesgo físico (' + (/cay/.test(t) ? 'caídas recurrentes' : 'lesiones o accidentes') + ')');
      if (unico) cosas.push('que una sola persona sostiene el cuidado');
      senal = { titulo: 'Persona cuidadora principal sin relevo', detalle: 'La petición pide un apoyo; el texto describe además ' + cosas.join(', ') + '.' };
    } else if (unico && cont.dependencia) {
      senal = { titulo: 'Persona cuidadora principal sin relevo', detalle: 'El texto indica que una sola persona sostiene el cuidado.' };
    } else if (/trabajar de noche|trabajo (por la )?manana|trabajo hasta/.test(t) && cont.dependencia + (tipo === 'Infantil' ? 1 : 0) > 0) {
      senal = { titulo: 'Persona dependiente sin supervisión en horario laboral', detalle: 'Quien cuida trabaja en el horario en que la persona necesita compañía o ayuda.' };
    }

    const urgente = /urgente|inmediat|grave/.test(t);
    const urgencia = urgente || (cont.riesgo && cont.dependencia) ? 'alta' : (cont.dependencia || cont.riesgo ? 'media' : 'baja');

    const presupuesto = perfil === 'enfermero' ? 220 : tipo === 'Infantil' ? 90 : 120;

    const titulo = par
      ? 'Cuidado de mi ' + par[1].toLowerCase() + (edadCuidada != null ? ' (' + edadCuidada + ' años)' : '')
      : 'Solicitud de cuidado · ' + tipo.toLowerCase();

    // Derivación sugerida (categorías generales; no verifican disponibilidad real)
    const derivaciones = [];
    if (esCuidado) {
      derivaciones.push({ titulo: 'Profesional de cuidado a domicilio', razon: 'Cubre los turnos solicitados y sirve de relevo a quien cuida', accion: 'contratar' });
      if (tipo === 'Adulto mayor') derivaciones.push({ titulo: 'Centro de día para personas mayores', razon: cont.dependencia ? 'La persona no puede quedarse sola durante el día' : 'Apoyo de cuidado durante el día' });
      if (tipo === 'Infantil') derivaciones.push({ titulo: 'Estancia infantil o guardería', razon: 'Cuidado en horario laboral' });
      if (tipo === 'Discapacidad') derivaciones.push({ titulo: 'Rehabilitación y apoyo a personas con discapacidad', razon: 'Complementa el cuidado en casa' });
      if (tipo === 'Postoperatorio') derivaciones.push({ titulo: 'Seguimiento médico posoperatorio', razon: 'Coordinar curaciones y medicación con enfermería' });
      if (cont.ingreso) derivaciones.push({ titulo: 'Apoyo económico a personas cuidadoras', razon: 'Pérdida de ingreso por cuidar' });
    }

    return { categorias, esCuidado, tipo, perfil, necesidades, turnos, zona, urgencia, presupuesto, cuidada, unicoSosten: unico, senal, evidencia: ev, derivaciones, titulo };
  }

  // Lo que se guarda con la petición (el texto ya vive en la publicación).
  function resumen(a) {
    return { categorias: a.categorias, esCuidado: a.esCuidado, senal: a.senal, evidencia: a.evidencia, derivaciones: a.derivaciones };
  }

  const CLASES = { dependencia: 'ev-dep', ingreso: 'ev-ing', riesgo: 'ev-rie' };

  // HTML del texto con la evidencia resaltada. Todo el texto se escapa.
  function resaltar(texto, evidencia) {
    const orig = String(texto || '').normalize('NFC');
    let out = '', pos = 0;
    (evidencia || []).forEach((e) => {
      if (e.ini < pos || e.fin > orig.length) return;
      out += esc(orig.slice(pos, e.ini)) + '<mark class="' + (CLASES[e.tipo] || '') + '">' + esc(orig.slice(e.ini, e.fin)) + '</mark>';
      pos = e.fin;
    });
    return out + esc(orig.slice(pos));
  }

  window.Care.clasificador = { analizar, resumen, resaltar };
})();
