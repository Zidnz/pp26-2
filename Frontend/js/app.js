/* Interfaz de Mientras: casos (con solicitud, entrevista y resultado), personas de relevo, seguimiento
 * (programa, visitas, red, mapa, KPI) y ajustes. Listas de una mirada; el detalle se abre al tocar cada tarjeta.
 * Cambio 20 oct 2026: la canalización con 3 preguntas y la regla de 40 h se sustituyen por solicitud con dos vías
 * de entrada, entrevista de valoración, puntaje provisional, tres niveles y reparto de una bolsa de horas. */
(function () {
  'use strict';

  Care.store.load();
  const { ZONAS, TIPOS_INCIDENTE, store, red, legal, relevo: RV, fechas: F, prioridad: PR, CONFIG_PROGRAMA: CP } = Care;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const f2 = (n) => Number(n).toFixed(2);
  const pesos = (n) => '$' + Math.round(n).toLocaleString('es-MX');
  const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
  const cfg = () => store.state.config;
  const casoById = (id) => store.state.casos.find((c) => c.id === id);
  const relById = (id) => store.state.relevos.find((r) => r.id === id);
  const diasTxt = (arr) => arr.slice().sort().map((d) => RV.DIAS[d]).join(' ');
  const hhmm = (s) => String(s).replace(/:00/g, '');
  let rolGuardado = 'cuidadora';
  try { rolGuardado = localStorage.getItem('mientras-rol') || 'cuidadora'; } catch (e) { /* sin almacenamiento */ }
  const ui = { rol: rolGuardado, estilo: 'lista', view: 'casos', casoFiltro: 'todos', relFiltro: 'aprobada', segSub: 'prog', dia: F.hoyISO(), scCaso: '', apagado: false, objetivo: null };

  /* ---------- Íconos de persona (mujer / hombre) ---------- */
  const SX = {
    M: '<svg class="sx sx-m" viewBox="0 0 16 20" role="img" aria-label="mujer"><circle cx="8" cy="4" r="3.2"/><path d="M8 8.4c-2.4 0-3.6 1.6-4.1 3.6L2.6 16.4h3.1V20h4.6v-3.6h3.1L12.1 12C11.6 10 10.4 8.4 8 8.4z"/></svg>',
    H: '<svg class="sx sx-h" viewBox="0 0 16 20" role="img" aria-label="hombre"><circle cx="8" cy="4" r="3.2"/><path d="M4.6 8.6h6.8c.9 0 1.6.7 1.6 1.6v5h-2V20H5v-4.8H3v-5c0-.9.7-1.6 1.6-1.6z"/></svg>',
  };
  const SEXO_TXT = { M: 'Mujer', H: 'Hombre' };
  const sx = (s) => SX[s] || '<svg class="sx sx-n" viewBox="0 0 16 20" role="img" aria-label="sin dato"><circle cx="8" cy="4" r="3.2"/><rect x="4" y="8.6" width="8" height="11.4" rx="2"/></svg>';
  const quien = (sexo, nombre, extra) => `<span class="who">${sx(sexo)}<span>${esc(nombre)}${extra ? `<small>${esc(extra)}</small>` : ''}</span></span>`;

  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* Diálogo propio: confirm() y prompt() no funcionan en todos los visores. */
  function pedir(texto, opt) {
    const o = opt || {};
    const dlg = $('#dlg-msg'), f = $('#form-msg');
    $('#msg-texto').textContent = texto;
    $('#msg-input-row').hidden = !o.input;
    $('#msg-input').value = '';
    $('#msg-ok').textContent = o.ok || 'Aceptar';
    $('#msg-ok').className = o.peligro ? 'btn-alert' : 'btn-primary';
    $('#msg-err').textContent = '';
    return new Promise((resolve) => {
      const fin = (v) => { f.onsubmit = null; dlg.onclose = null; if (dlg.open) dlg.close(); resolve(v); };
      f.onsubmit = (e) => {
        e.preventDefault();
        if (!o.input) return fin(true);
        const v = $('#msg-input').value.trim();
        if (v.length < (o.min || 1)) { $('#msg-err').textContent = o.min > 1 ? `Al menos ${o.min} caracteres.` : 'Escribe el motivo.'; return; }
        fin(v);
      };
      dlg.onclose = () => fin(null);
      dlg.showModal();
      if (o.input) $('#msg-input').focus();
    });
  }

  const tags = (arr, cls) => (arr || []).map((t) => `<span class="tag ${cls || ''}">${esc(t)}</span>`).join('');
  const options = (list, sel, label) => list.map((v) => `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>${esc(label ? label(v) : v)}</option>`).join('');
  function pintaReqs(ul, reqs) {
    const falta = reqs.filter((r) => !r.ok);
    ul.innerHTML = falta.slice(0, 3).map((r) => `<li>${esc(r.txt)}</li>`).join('') + (falta.length > 3 ? `<li>y ${falta.length - 3} más</li>` : '');
  }

  /* ---------- Modelo derivado ---------- */
  // Puntaje, nivel y horas NO se guardan: se calculan con config.js en cada render, así un cambio de pesos o de bolsa
  // se refleja en todos los casos.
  const NV_CSS = { alta: 'p1', media: 'p2', baja: 'np' }; // reutiliza los estilos de prioridad
  const primeraAsignacion = (c) => (c.asignacion ? ((c.asignacion.historial || [])[0] || {}).desde || c.asignacion.fecha : null);
  const bolsa = () => (cfg().bolsaSim != null ? cfg().bolsaSim : CP.presupuesto_horas_mes);
  function valorar(entrevista, sexo, fecha, hasta) {
    const v = PR.puntuar(Object.assign({}, entrevista.modelo, { sexo }), CP);
    const ef = PR.puntajeEfectivo(v.base, PR.semanasEnCola(fecha, hasta || F.hoyISO()), CP);
    return Object.assign(v, ef, { nivel: PR.nivel(ef.efectivo, CP), barthel: PR.totalBarthel(entrevista.barthel), zarit: PR.totalZarit(entrevista.zarit, CP), regla: PR.reglaHoras(entrevista.modelo.horas) });
  }
  const valDe = (c) => valorar(c.entrevista, c.cuidadora.sexo, c.fecha, primeraAsignacion(c));
  const enPlan = (c) => c.estado !== 'cerrado' && c.entrevista;
  /** Reparto de la bolsa entre todos los casos valorados que no están cerrados. `extra`: caso aún no guardado. */
  function calcularPlan(extra) {
    const cs = store.state.casos.filter(enPlan).map((c) => ({ id: c.id, efectivo: valDe(c).efectivo }));
    if (extra) cs.push(extra);
    const r = PR.asignarHoras(cs, CP, bolsa());
    r.sem = {}; Object.keys(r.horas).forEach((id) => { r.sem[id] = PR.horasSemana(r.horas[id], CP); });
    return r;
  }
  let plan = calcularPlan();
  const horasDe = (c) => ({ mes: plan.horas[c.id] || 0, sem: plan.sem[c.id] || 0, cola: plan.en_cola.includes(c.id) });
  const enRevision = (c) => !!(c.revision && c.revision.estado === 'pendiente');
  const apelAbiertas = (c) => (c.apelaciones || []).filter((a) => a.estado === 'abierta');
  const evalDe = (c) => RV.evaluarPaquete(c.paquete, cfg().factorPrest);
  const proDe = (c) => {
    const r = c.estado === 'activo' && c.asignacion && relById(c.asignacion.relevoId);
    return r ? { nombre: r.nombre, horas: c.paquete.horas } : null;
  };
  const analisisHogar = (c, apagado) => red.analizar(c.hogar, proDe(c), apagado || null);
  const fragClase = (x) => (x >= 0.85 ? 'r' : x >= 0.6 ? 'a' : 'n');
  const ESTADO = { espera: 'En cola', activo: 'Con relevo', cerrado: 'Cerrado' };
  const CERT = { certificada: 'Certificada', en_proceso: 'En proceso', no: 'Sin certificar' };
  const diasEntre = (a, b) => Math.round((F.desdeISO(b) - F.desdeISO(a)) / 86400000);
  const costoMes = (ev) => ev.mesConPrest || ev.mes;
  const pts = (n) => (Math.round(n * 10) / 10).toLocaleString('es-MX');
  const canalTxt = (c) => (c.canal_origen === 'referencia' ? `Referencia · ${c.referencia ? c.referencia.institucion : ''}` : 'Autorregistro');

  /* Personajes (ilustraciones del Observatorio, sin copiarlas). Ver README: cuáles conviene reemplazar. */
  const ILU = 'observatorio/ilustraciones/';
  const PERSONAJE = {
    bienvenida: ILU + 'logo_personajes.webp', alta: ILU + 'agotada.png', media: ILU + 'cuidadoraSilla.png',
    baja: ILU + 'familia.png',
  };
  const personaje = (k, cls) => `<img class="personaje ${cls || ''}" src="${PERSONAJE[k]}" alt="" loading="lazy">`;

  /* ================= Navegación ================= */
  /* Cada rol ve solo lo suyo (24 oct 2026). La cuidadora no ve casos de otras familias; la persona de relevo
   * no ve a las demás personas de relevo; el programa ve todo. En el piloto, cada rol entraría con su cuenta. */
  const VISTAS_ROL = { cuidadora: ['mia'], relevo: ['yo'], programa: ['casos', 'relevos', 'seguimiento', 'ajustes'] };
  const VIEWS = VISTAS_ROL.programa;
  const TITULOS = { mia: 'Necesito relevo', yo: 'Puedo cuidar', casos: 'Casos', relevos: 'Personas de relevo', seguimiento: 'Seguimiento', ajustes: 'Ajustes' };
  const leerId = (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const guardarId = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } };
  function cambiarRol(rol) {
    if (!VISTAS_ROL[rol]) rol = 'cuidadora';
    ui.rol = rol;
    try { localStorage.setItem('mientras-rol', rol); } catch (e) { /* sin almacenamiento */ }
    show(VISTAS_ROL[rol][0]);
  }
  $('#rolbar').addEventListener('click', (e) => { const b = e.target.closest('button[data-rol]'); if (b) cambiarRol(b.dataset.rol); });

  function show(view) {
    if (view === 'redes') { view = 'seguimiento'; ui.segSub = 'caso'; }
    const permitidas = VISTAS_ROL[ui.rol] || VISTAS_ROL.cuidadora;
    if (!permitidas.includes(view)) view = permitidas[0];
    ui.view = view;
    if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
    render();
    const s = $('#view-' + view); if (s) s.scrollTop = 0;
  }
  $$('.tabbtn').forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
  $('.tabbar').addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    show(VIEWS[(VIEWS.indexOf(ui.view) + d + VIEWS.length) % VIEWS.length]);
    $('.tabbtn.on').focus();
  });
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  function segmento(sel, key, cb) {
    $(sel).addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      ui[key] = b.dataset.val || b.dataset.sub;
      $$(sel + ' button').forEach((x) => x.classList.toggle('on', x === b));
      cb();
    });
  }

  /* ================= 1. Casos ================= */
  const ORDEN = { espera: 0, activo: 1, cerrado: 2 };
  function renderCasos() {
    const { casos } = store.state;
    const filtro = (c) => ui.casoFiltro === 'todos' ? c.estado !== 'cerrado' : ui.casoFiltro === 'revision' ? enRevision(c) || apelAbiertas(c).length > 0 : c.estado === ui.casoFiltro;
    const lista = casos.filter(filtro).slice().sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || valDe(b).efectivo - valDe(a).efectivo || a.fecha.localeCompare(b.fecha));
    const n = (e) => casos.filter((c) => c.estado === e).length;
    const rev = casos.filter((c) => enRevision(c) || apelAbiertas(c).length).length;
    $('#caso-count').innerHTML = `<b>${n('espera')}</b> en cola · <b>${n('activo')}</b> con relevo${rev ? ` · <b>${rev}</b> por revisar` : ''}`;
    $('#caso-list').innerHTML = lista.length ? lista.map(casoCard).join('') : '<div class="empty">Sin casos.</div>';
  }

  function casoCard(c) {
    const v = valDe(c), hz = horasDe(c), nv = NV_CSS[v.nivel];
    const r = c.asignacion && c.estado === 'activo' && relById(c.asignacion.relevoId);
    const inc = store.state.incidentes.filter((i) => i.casoId === c.id && i.estado === 'abierto').length;
    const marcas = (enRevision(c) ? '<span class="badge alta">revisión</span>' : '') + (apelAbiertas(c).length ? '<span class="badge pendiente">apelación</span>' : '');
    let pie;
    if (c.estado === 'espera') pie = `<span class="wait${!hz.cola && !v.semanas ? ' nueva' : ''}">${hz.cola ? 'sin horas este ciclo' : v.semanas ? v.semanas + ' sem en cola' : 'Nueva'}</span>${marcas}<button type="button" class="btn-primary sm" data-action="proponer" data-id="${esc(c.id)}"${hz.cola ? ' disabled' : ''}>Asignar</button>`;
    else if (r) pie = `<span class="relv"><small>relevo</small>${quien(r.sexo, r.nombre)}</span>${marcas}${inc ? `<span class="badge alta">${inc} incidente${inc > 1 ? 's' : ''}</span>` : ''}`;
    else pie = `<span class="wait">${ESTADO[c.estado]}</span>`;
    return `<article class="card ccard s-${nv}${c.estado === 'cerrado' ? ' done' : ''}" data-action="ver-caso" data-id="${esc(c.id)}" tabindex="0" role="button" aria-label="Ver caso ${esc(c.folio)}">
      <div class="chead"><span>Nivel ${PR.NIVEL[v.nivel]} · ${ESTADO[c.estado]}</span><span class="mono">${esc(c.folio)}</span></div>
      <div class="cbig"><b class="mono">${hz.mes}<small>h</small></b><span>al mes · ≈ ${hz.sem} h/sem</span></div>
      <div class="crow"><i class="pdot" aria-hidden="true"></i>
        ${quien(c.cuidadora.sexo, c.cuidadora.alias)}<span class="arrow" aria-hidden="true">→</span>${quien(c.persona.sexo, c.persona.alias)}
        <span class="badge pr ${nv}" title="Nivel ${PR.NIVEL[v.nivel]}">${pts(v.efectivo)}</span>
      </div>
      <div class="facts f-cuida"><span><b>${pts(v.efectivo)}</b> pts${v.extra ? ` (${pts(v.base)} + ${pts(v.extra)} espera)` : ''}</span><span>${esc(canalTxt(c))}</span><span>${esc(c.alcaldia)}</span></div>
      <div class="cfoot">${pie}</div>
    </article>`;
  }
  segmento('#caso-filter', 'casoFiltro', renderCasos);
  function pintaEstilo() {
    $('#caso-list').className = 'list estilo-' + ui.estilo;
  }
  pintaEstilo();

  /* ---------- Detalle de un caso (visual) ---------- */
  const semana = (dias, nota) => `<div class="wk">${RV.DIAS.map((d, i) => `<span class="${dias.includes(i) ? 'on' : ''}">${esc(d.charAt(0))}</span>`).join('')}</div>${nota ? `<p class="wk-n">${nota}</p>` : ''}`;
  const tile = (val, lab, cls, extra) => `<div class="tl ${cls || ''}"><b class="mono">${val}</b><span>${esc(lab)}</span>${extra || ''}</div>`;
  const medidor = (x) => `<i class="meter"><i style="width:${Math.round(Math.min(1, x) * 100)}%"></i></i>`;
  function puntos(pctV) {
    const n = Math.round(pctV / 10);
    return `<div class="dots10">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
  }

  /* Bloque de explicación: los 3 factores que más pesaron, en lenguaje simple. Lo usan el detalle y el resultado. */
  function factoresHTML(v) {
    const top = v.top3.length ? v.top3.map((d) => `<li><b class="mono">+${d.puntos}</b><span>${esc(d.etiqueta)}</span></li>`).join('') : '<li><span>Ninguna respuesta sumó puntos.</span></li>';
    return `<ol class="factores">${top}</ol>
      ${v.extra ? `<p class="wk-n">Más ${pts(v.extra)} por ${v.semanas} semana${v.semanas === 1 ? '' : 's'} en cola (tope ${CP.envejecimiento.tope_envejecimiento}).</p>` : ''}
      ${v.provisional ? '<p class="provisional">Puntaje provisional — modelo en validación</p>' : ''}`;
  }

  function abrirCaso(id) {
    const c = casoById(id); if (!c) return;
    const v = valDe(c), hz = horasDe(c), nv = NV_CSS[v.nivel];
    const r = c.asignacion && relById(c.asignacion.relevoId);
    const hist = (c.asignacion && c.asignacion.historial) || [];
    const ev = c.paquete ? evalDe(c) : null;
    const total = ev ? costoMes(ev) : 0, fam = ev ? RV.pagoFamilia(ev, c.pagador, c.pctSubsidio) : 0;
    const pf = total ? Math.round((100 * fam) / total) : 0;
    const pref = c.paquete || c.preferencias;
    $('#det-body').innerHTML = `
      <div class="hero h-${nv}">
        <div class="hero-top"><span class="mono">${esc(c.folio)} · ${esc(c.alcaldia)}</span><span class="badge e-${c.estado}">${ESTADO[c.estado]}</span></div>
        <div class="hero-who">${quien(c.cuidadora.sexo, c.cuidadora.alias, 'cuida')}<span class="arrow">→</span>${quien(c.persona.sexo, c.persona.alias)}</div>
        <div class="hero-tags"><span class="pill-p">Nivel ${PR.NIVEL[v.nivel]}</span><span class="pill-s">${esc(canalTxt(c))}</span></div>
      </div>
      <div class="tiles">
        ${tile(pts(v.efectivo) + `<small>/${v.max}</small>`, 'puntaje efectivo', '', v.extra ? `<em>${pts(v.base)} + ${pts(v.extra)} espera</em>` : '<em>sin espera</em>')}
        ${tile(hz.mes + '<small>h</small>', 'al mes', '', `<em>${hz.cola ? 'en cola: bolsa agotada' : '≈ ' + hz.sem + ' h/sem'}</em>`)}
        ${tile(v.barthel == null ? '—' : String(v.barthel), 'Barthel', '', `<em>${esc(PR.nivelBarthel(v.barthel))}</em>`)}
      </div>

      ${enRevision(c) ? `<section class="blk revbox"><h5>Revisión humana pendiente</h5>
        <ul class="motivos">${c.revision.motivos.map((m) => `<li>${esc(m.txt)}</li>`).join('')}</ul>
        <p class="wk-n">El puntaje no se cambia de forma automática: una persona del programa revisa el caso.</p></section>` : ''}
      ${c.revision && c.revision.estado === 'revisada' ? `<p class="wk-n">Revisado ${esc(c.revision.fechaResolucion)}: ${esc(c.revision.nota)}</p>` : ''}

      <section class="blk"><h5>Por qué este puntaje</h5>${factoresHTML(v)}
        <p class="wk-n">Regla de referencia (≥ 40 h/sem): <b>${v.regla === 'dentro' ? 'dentro' : 'fuera'}</b>. La tarjeta no la supera de forma demostrable (script 22).</p>
        <p class="wk-n">Sobrecarga (Zarit): ${v.zarit == null ? 'sin capturar · reactivos pendientes de licencia' : v.zarit + ' / ' + CP.zarit.n_reactivos * CP.zarit.escala_max} · se usa para seguimiento, no para el puntaje.</p>
      </section>

      ${apelAbiertas(c).length || (c.apelaciones || []).length ? `<section class="blk"><h5>Solicitudes de revisión</h5>
        ${(c.apelaciones || []).map((a) => `<div class="inc"><span class="badge ${a.estado === 'abierta' ? 'pendiente' : 'aprobada'}">${a.estado === 'abierta' ? 'Abierta' : 'Resuelta'}</span><span>${esc(a.motivo)}<small>${esc(a.fecha)}${a.resolucion ? ' · ' + esc(a.resolucion) : ''}</small></span>${a.estado === 'abierta' ? `<button type="button" class="btn-ghost sm" data-action="resolver-ap" data-id="${esc(c.id)}" data-ap="${esc(a.id)}">Resolver</button>` : ''}</div>`).join('')}
      </section>` : ''}

      ${pref ? `<section class="blk"><h5>${c.paquete ? 'Paquete · ' + c.paquete.horas + ' h/sem' : 'Preferencias para el relevo'}</h5>
        ${semana(pref.dias, ev ? `<b>${esc(ev.horario)}</b> · jornada ${esc(ev.tipo)} · $${ev.hora.toFixed(2)}/h` : `desde las ${esc(pref.inicio)}`)}
        <div class="tags">${tags(pref.tareas, 'alt')}</div>
        ${c.paquete && hz.sem && hz.sem !== c.paquete.horas ? `<p class="wk-n">El ciclo actual le da ${hz.sem} h/sem. Se aplica desde Seguimiento › Programa.</p>` : ''}
      </section>` : ''}

      ${ev ? `<section class="blk"><h5>Quién paga · ${esc(RV.PAGADORES[c.pagador])}</h5>
        <div class="split"><i class="fam" style="width:${pf}%"></i><i class="sub" style="width:${100 - pf}%"></i></div>
        <div class="split-l"><span><i class="fam"></i>Familia ${pesos(fam)}</span><span><i class="sub"></i>Subsidio ${pesos(total - fam)}</span></div>
      </section>` : ''}

      <section class="blk"><h5>Relevo</h5>
        ${r && c.estado === 'activo' ? `<div class="slot ok">${quien(r.sexo, r.nombre, 'desde ' + c.asignacion.fecha.slice(5))}</div>` : '<div class="slot">El programa todavía no asigna relevo</div>'}
        ${hist.map((h) => `<p class="wk-n">Antes ${esc((relById(h.relevoId) || {}).nombre || '')}: ${esc(h.motivo)}</p>`).join('')}
      </section>
      ${c.cierre ? `<p class="wk-n">Cerrado: ${esc(c.cierre.motivo)}</p>` : ''}`;
    const A = (act, txt, cls) => `<button type="button" class="${cls || 'btn-ghost'} sm" data-action="${act}" data-id="${esc(c.id)}">${txt}</button>`;
    let acc = '';
    if (enRevision(c)) acc += A('revisado', 'Marcar revisado');
    if (c.estado === 'espera') acc += A('cerrar', 'Cerrar caso') + (hz.cola ? '' : A('proponer', 'Asignar relevo', 'btn-primary'));
    else if (c.estado === 'activo') acc += A('reasignar', 'Cambiar relevo') + A('seguir', 'Seguimiento', 'btn-primary');
    else acc += A('del-caso', 'Eliminar', 'btn-ghost danger');
    $('#det-acciones').innerHTML = acc;
    $('#dlg-det').showModal(); $('#dlg-det').scrollTop = 0;
  }

  /* ---------- Asignación ---------- */
  function abrirAsignacion(casoId, reasignar) {
    const c = casoById(casoId); if (!c) return;
    if ($('#dlg-det').open) $('#dlg-det').close();
    // Primera asignación: el paquete sale de las horas del ciclo y de las preferencias de la solicitud.
    if (!c.paquete) {
      const hz = horasDe(c), pf = c.preferencias || { dias: [0], inicio: '09:00', tareas: [RV.TAREAS[0]] };
      if (!hz.sem) { toast('Sin horas este ciclo: la bolsa no alcanza'); return; }
      c.paquete = { horas: hz.sem, dias: pf.dias.slice(), inicio: pf.inicio, tareas: pf.tareas.slice() };
      c.paqueteTemporal = true; // se descarta si se cancela la asignación
    }
    const res = RV.proponer(c, store.state, cfg(), reasignar && c.asignacion ? [c.asignacion.relevoId] : []);
    ui.asig = { casoId, reasignar, relevoId: res.propuesta ? res.propuesta.r.id : null };
    $('#form-asig').reset();
    $('#asig-titulo').textContent = reasignar ? 'Cambiar relevo' : 'Asignar relevo';
    $('#asig-motivo-row').hidden = !reasignar;
    const ev = evalDe(c);
    let h = `<p class="sub">${esc(c.folio)} · ${c.paquete.horas} h · ${esc(diasTxt(c.paquete.dias))} ${esc(ev.horario)}</p>`;
    if (res.propuesta) {
      const { r, e } = res.propuesta;
      h += `<div class="card propuesta"><div class="crow big">${quien(r.sexo, r.nombre, r.alcaldia)}</div>
        <div class="facts"><span><b>${e.km.toFixed(1)} km</b></span><span>cupo <b>${e.carga + c.paquete.horas}/${r.horasMax} h</b></span><span>${CERT[r.certificacion]}</span></div>
        <p class="sub">Cumple las 7 restricciones${res.nElegibles > 1 ? ` · ${res.nElegibles - 1} más también` : ' · única opción'}.</p></div>`;
    } else {
      const d = Object.keys(res.descartes).sort((a, b) => res.descartes[b] - res.descartes[a]).slice(0, 3).map((k) => `${res.descartes[k]} ${RV.ETIQUETA_DESCARTE[k]}`).join(' · ');
      h += `<div class="warnbox"><b>Nadie cumple.</b> ${esc(d)}.<br>Ajusta horario o distancia, o certifica a alguien.</div>`;
    }
    $('#asig-body').innerHTML = h;
    $('#asig-formal').hidden = !res.propuesta;
    $('#asig-ok').hidden = !res.propuesta;
    $('#asig-ok').textContent = reasignar ? 'Cambiar' : 'Asignar';
    $('#dlg-asig').showModal();
    refreshAsig();
  }
  function datosAsig() {
    const e = $('#form-asig').elements;
    const c = casoById(ui.asig.casoId);
    return { jornadaOk: evalDe(c).ok, escrito: e.escrito.checked, imss: e.imss.checked, pagadorOk: !!RV.PAGADORES[c.pagador], motivo: e.motivo.value.trim() };
  }
  function refreshAsig() {
    if (!ui.asig || !ui.asig.relevoId) return;
    const d = datosAsig();
    const ok = legal.pendientes(legal.requisitosAsignacion(d)).length === 0 && (!ui.asig.reasignar || d.motivo.length >= 5);
    $('#asig-ok').disabled = !ok;
  }
  ['input', 'change'].forEach((ev) => $('#form-asig').addEventListener(ev, refreshAsig));
  $('#dlg-asig').addEventListener('close', () => {
    const c = ui.asig && casoById(ui.asig.casoId);
    if (c && c.paqueteTemporal) { if (c.estado !== 'activo') delete c.paquete; delete c.paqueteTemporal; }
  });
  $('#form-asig').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#asig-ok').disabled || !ui.asig.relevoId) return;
    const d = datosAsig();
    const c = casoById(ui.asig.casoId), r = relById(ui.asig.relevoId);
    const antes = analisisHogar(c).fragilidad;
    const formal = { escrito: true, imss: true, fecha: F.hoyISO() };
    delete c.paqueteTemporal;
    if (ui.asig.reasignar) store.reasignar(c.id, r.id, d.motivo, formal); else store.asignar(c.id, r.id, formal);
    $('#dlg-asig').close();
    toast(`${r.nombre} asignada · fragilidad ${f2(antes)} → ${f2(analisisHogar(casoById(c.id)).fragilidad)}`);
  });

  /* ================= 2. Personas de relevo ================= */
  function renderRelevos() {
    const { relevos } = store.state;
    const lista = relevos.filter((r) => (ui.relFiltro === 'aprobada' ? store.aprobado(r) : !store.aprobado(r)));
    const aprob = relevos.filter(store.aprobado);
    const cert = aprob.filter((r) => r.certificacion === 'certificada').length;
    $('#rel-count').innerHTML = `<b>${cert}</b> asignables de ${aprob.length}`;
    $('#rel-list').innerHTML = lista.length ? lista.map(relCard).join('') : '<div class="empty">Sin registros.</div>';
  }
  function relCard(r) {
    const carga = RV.cargaDe(r.id, store.state);
    const enRev = !store.aprobado(r);
    const v = r.verificacion || {};
    const cls = enRev ? 'pendiente' : r.certificacion === 'certificada' ? 'aprobada' : 'pendiente';
    return `<article class="card ccard rcard" data-action="ver-relevo" data-id="${esc(r.id)}" tabindex="0" role="button" aria-label="Ver ${esc(r.nombre)}">
      <div class="crow">${quien(r.sexo, r.nombre)}<span class="badge ${enRev && v.estado === 'rechazada' ? 'rechazada' : cls}">${enRev ? (v.estado === 'rechazada' ? 'Rechazada' : 'Revisión') : CERT[r.certificacion]}</span></div>
      <div class="facts"><span>${esc(r.alcaldia)}</span><span>${esc(diasTxt(r.dias))}</span><span>${esc(hhmm(r.desde))}-${esc(hhmm(r.hasta))}</span></div>
      ${enRev ? '' : `<div class="cupo"><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, pct(carga, r.horasMax))}%"></div></div><span class="mono">${carga}/${r.horasMax} h</span></div>`}
    </article>`;
  }
  segmento('#rel-filter', 'relFiltro', renderRelevos);

  function abrirRelevo(id) {
    const r = relById(id); if (!r) return;
    const enRev = !store.aprobado(r), v = r.verificacion || {}, L = r.legal || {};
    const carga = RV.cargaDe(r.id, store.state);
    const casos = store.state.casos.filter((c) => c.estado === 'activo' && c.asignacion && c.asignacion.relevoId === r.id);
    const estado = enRev ? (v.estado === 'rechazada' ? 'Rechazada' : 'En revisión') : CERT[r.certificacion];
    $('#det-body').innerHTML = `
      <div class="hero ${!enRev && r.certificacion === 'certificada' ? 'h-ok' : 'h-p2'}">
        <div class="hero-top"><span class="mono">${esc(r.alcaldia)}</span><span class="badge ${enRev ? (v.estado === 'rechazada' ? 'rechazada' : 'pendiente') : r.certificacion === 'certificada' ? 'aprobada' : 'pendiente'}">${esc(estado)}</span></div>
        <div class="hero-who">${quien(r.sexo, r.nombre, r.experiencia ? r.experiencia + ' años de experiencia' : '')}</div>
      </div>
      <div class="tiles">
        ${tile(`${carga}<small>/${r.horasMax} h</small>`, 'cupo semanal', '', medidor(carga / r.horasMax))}
        ${tile(String(casos.length), casos.length === 1 ? 'caso activo' : 'casos activos', '', casos.length ? `<em>${casos.map((c) => esc(c.folio)).join(' ')}</em>` : '')}
        ${tile(String(r.tareas.length), 'tareas', '')}
      </div>
      <section class="blk"><h5>Disponibilidad</h5>${semana(r.dias, `<b>${esc(r.desde)}-${esc(r.hasta)}</b>`)}</section>
      <section class="blk"><h5>Puede hacer</h5><div class="tags">${tags(r.tareas, 'alt')}</div></section>
      ${enRev ? `<section class="blk"><h5>Documentos</h5><div class="docs"><span>CURP <b class="mono">${esc(legal.enmascarar(L.curp))}</b></span><span>${esc(L.docId || 'sin identificación')}</span><span>Carta ${esc(L.antecedentesFecha || '—')}</span></div>${v.estado === 'rechazada' ? `<p class="wk-n">Motivo: ${esc(v.motivo)}</p>` : ''}</section>` : ''}
      ${!enRev && r.certificacion !== 'certificada' ? '<div class="slot">Sin certificación vigente: no recibe asignaciones</div>' : ''}`;
    const A = (act, txt, cls) => `<button type="button" class="${cls || 'btn-ghost'} sm" data-action="${act}" data-id="${esc(r.id)}">${txt}</button>`;
    let acc = A('del-relevo', 'Eliminar', 'btn-ghost danger');
    if (enRev && v.estado !== 'rechazada') acc += A('rechazar', 'Rechazar', 'btn-ghost danger') + A('aprobar', 'Aprobar', 'btn-primary');
    else if (!enRev && r.certificacion !== 'certificada') acc += A('certificar', 'Registrar certificación', 'btn-primary');
    $('#det-acciones').innerHTML = acc;
    $('#dlg-det').showModal(); $('#dlg-det').scrollTop = 0;
  }

  /* ================= 3. Seguimiento ================= */
  const EST_VISITA = { pendiente: 'Pendiente', en_curso: 'En curso', realizada: 'Hecha', no_llego: 'No llegó', cancelada: 'Cancelada' };

  function renderSeguimiento() {
    $$('#view-seguimiento [data-sub-panel]').forEach((p) => { p.hidden = p.dataset.subPanel !== ui.segSub; });
    $$('#seg-sub button').forEach((b) => b.classList.toggle('on', b.dataset.sub === ui.segSub));
    if (ui.segSub === 'prog') renderPrograma();
    else if (ui.segSub === 'hoy') renderDia();
    else if (ui.segSub === 'caso') renderSegCaso();
    else if (ui.segSub === 'mapa') drawTerritorio();
    else renderKPI();
  }
  segmento('#seg-sub', 'segSub', () => render());

  /* ---------- Programa: bolsa, niveles, puntajes por canal, revisión y apelaciones ---------- */
  function franjaPuntajes(vals, max) {
    // Un punto por caso sobre la escala 0-max; la línea marca la mediana.
    const W = 280, H = 40, x = (v) => 10 + ((W - 20) * v) / max;
    const cuenta = {};
    const puntos = vals.slice().sort((a, b) => a - b).map((v) => { const k = Math.round(v * 2) / 2; cuenta[k] = (cuenta[k] || 0) + 1; return `<circle cx="${x(v).toFixed(1)}" cy="${(30 - (cuenta[k] - 1) * 7).toFixed(1)}" r="3.4"/>`; }).join('');
    const med = vals.length ? vals.slice().sort((a, b) => a - b)[Math.floor((vals.length - 1) / 2)] : null;
    const cortes = [CP.umbrales.media, CP.umbrales.alta].map((u) => `<line class="corte" x1="${x(u)}" x2="${x(u)}" y1="2" y2="36"/>`).join('');
    return `<svg class="franja" viewBox="0 0 ${W} ${H}" role="img" aria-label="Puntajes">${cortes}<line class="eje" x1="10" x2="${W - 10}" y1="36" y2="36"/>${med != null ? `<line class="med" x1="${x(med)}" x2="${x(med)}" y1="4" y2="36"/>` : ''}${puntos}</svg>`;
  }
  function renderPrograma() {
    const s = store.state, cs = s.casos.filter(enPlan);
    const vals = cs.map((c) => ({ c, v: valDe(c), h: horasDe(c) }));
    const B = plan.presupuesto, minimos = cs.length * CP.horas_minimas;
    const porNivel = ['alta', 'media', 'baja'].map((nv) => { const g = vals.filter((x) => x.v.nivel === nv); return { nv, n: g.length, h: g.length ? Math.round(g.reduce((t, x) => t + x.h.mes, 0) / g.length) : 0 }; });
    const max = Object.values(CP.pesos).reduce((t, v) => t + Math.max(0, v), 0);
    const canales = Object.keys(CP.canales).map((k) => {
      const g = vals.filter((x) => x.c.canal_origen === k).map((x) => x.v.base);
      const prom = g.length ? g.reduce((t, v) => t + v, 0) / g.length : null;
      return `<div class="canal"><div class="row-between"><b>${esc(CP.canales[k])}</b><span class="mono sub">n = ${g.length}${prom != null ? ` · promedio ${pts(prom)} · baja ${g.filter((v) => v < CP.umbrales.media).length}` : ''}</span></div>${franjaPuntajes(g, max)}</div>`;
    }).join('');
    const rev = s.casos.filter(enRevision), aps = s.casos.filter((c) => apelAbiertas(c).length);
    const lnk = (c, txt) => `<button type="button" class="linkrow" data-action="ver-caso" data-id="${esc(c.id)}"><span class="mono">${esc(c.folio)}</span><span>${esc(txt)}</span></button>`;
    $('#prog-body').innerHTML = `
      <div class="card panel">
        <div class="eyebrow">Bolsa del mes${cfg().bolsaSim != null ? ' · simulada' : ''}</div>
        <div class="bolsa"><b class="mono">${plan.usado}</b><span>de ${B} h asignadas</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, pct(minimos, B))}%"></div><div class="bar-fill b2" style="width:${Math.max(0, Math.min(100, pct(plan.usado - Math.min(minimos, plan.usado), B)))}%"></div></div>
        <p class="sub">${Math.min(minimos, B)} h son mínimos garantizados (${cs.length} × ${CP.horas_minimas} h) · el resto se reparte por puntaje · sobran ${plan.sobrante} h${plan.sobrante && !plan.en_cola.length ? ' (todos en el tope de ' + CP.horas_maximas + ' h)' : ''}.</p>
        ${plan.capacidad_ok ? '' : `<div class="warnbox"><b>La bolsa no alcanza para los mínimos.</b> ${plan.en_cola.length} caso(s) quedan en cola sin horas este mes; su puntaje sigue subiendo por la espera.</div>`}
      </div>
      <div class="kpigrid">${porNivel.map((x) => `<div class="kpi nv-${x.nv}"><b class="mono">${x.n}</b><span>nivel ${PR.NIVEL[x.nv].toLowerCase()}</span><small>${x.h} h/mes en promedio</small></div>`).join('')}</div>
      <div class="card panel">
        <div class="eyebrow">Puntaje base por canal de origen</div>
        <p class="sub">¿El autorregistro capta a cuidadoras de menor intensidad? Cada punto es un caso; líneas punteadas: cortes Media (${CP.umbrales.media}) y Alta (${CP.umbrales.alta}); línea sólida: mediana. Con pocos casos no se concluye nada.</p>
        ${canales}
      </div>
      <div class="card panel">
        <div class="eyebrow">Revisión humana · ${rev.length}</div>
        ${rev.map((c) => lnk(c, c.revision.motivos[0].txt)).join('') || '<p class="sub">Ninguna.</p>'}
        <div class="eyebrow sep">Solicitudes de revisión abiertas · ${aps.length}</div>
        ${aps.map((c) => lnk(c, apelAbiertas(c)[0].motivo)).join('') || '<p class="sub">Ninguna.</p>'}
      </div>
      <button class="btn-ghost wide" data-action="aplicar-ciclo">Aplicar horas del ciclo a los casos con relevo</button>
      <p class="sub foot">${s.ultimoCiclo ? 'Último ciclo aplicado: ' + esc(s.ultimoCiclo) + '. ' : ''}Puntajes de la tarjeta «${esc(CP.variante_tarjeta)}» (script 22), provisionales. Datos simulados.</p>`;
  }

  function renderDia() {
    const hoy = F.hoyISO(), d = ui.dia, fecha = F.desdeISO(d);
    $('#dia-titulo').textContent = d === hoy ? 'Hoy' : cap(fecha.toLocaleDateString('es-MX', { weekday: 'long' }));
    $('#dia-sub').textContent = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    const prog = store.programadasEn(d);
    const futuro = d > hoy;
    $('#dia-list').innerHTML = prog.length ? prog.map((p) => {
      const r = relById(p.relevoId), v = p.reg, est = v ? v.estado : 'pendiente', id = esc(p.caso.id);
      let btns = '';
      if (!futuro && est === 'pendiente') btns = `<button class="btn-primary sm" data-action="llego" data-id="${id}">Llegó</button><button class="btn-ghost sm danger" data-action="nollego" data-id="${id}">No llegó</button><button class="btn-ghost sm" data-action="cancelo" data-id="${id}">Canceló</button>`;
      else if (est === 'en_curso') btns = `<button class="btn-primary sm" data-action="salio" data-id="${id}">Salió</button>`;
      return `<article class="card ccard"><div class="crow"><b class="mono hora">${esc(p.ini)}</b>${quien(r && r.sexo, r ? r.nombre : '—')}<span class="arrow">→</span>${quien(p.caso.persona.sexo, p.caso.persona.alias)}<span class="badge v-${est}">${EST_VISITA[est]}</span></div>
        ${v && v.llegada ? `<div class="facts mono"><span>llegó ${esc(v.llegada)}</span>${v.salida ? `<span>salió ${esc(v.salida)}</span>` : ''}</div>` : ''}
        ${btns ? `<div class="btn-row">${btns}</div>` : ''}</article>`;
    }).join('') : '<div class="empty">Sin visitas este día.</div>';
  }

  function renderSegCaso() {
    const cs = store.state.casos.filter((c) => c.estado !== 'cerrado');
    if (!cs.some((c) => c.id === ui.scCaso)) { const act = cs.find((c) => c.estado === 'activo') || cs[0]; ui.scCaso = act ? act.id : ''; ui.objetivo = null; ui.apagado = false; }
    $('#sc-caso').innerHTML = cs.map((c) => `<option value="${esc(c.id)}"${c.id === ui.scCaso ? ' selected' : ''}>${esc(c.folio)} · ${esc(c.cuidadora.alias)} → ${esc(c.persona.alias)}${c.estado !== 'activo' ? ' (' + ESTADO[c.estado].toLowerCase() + ')' : ''}</option>`).join('');
    drawRed();
    const c = casoById(ui.scCaso);
    if (!c || c.estado !== 'activo') { $('#sc-body').innerHTML = c ? '<div class="empty">Sin relevo activo.</div>' : ''; return; }
    const vis = store.state.visitas.filter((v) => v.casoId === c.id && v.estado !== 'pendiente').sort((a, b) => b.fecha.localeCompare(a.fecha));
    const inc = store.state.incidentes.filter((i) => i.casoId === c.id);
    const abiertos = inc.filter((i) => i.estado === 'abierto').length;
    const qs = store.state.checkins.filter((q) => q.casoId === c.id).sort((a, b) => a.semana.localeCompare(b.semana));
    const ya = qs.find((q) => q.semana === F.lunesDe(F.hoyISO()));
    const hechas = vis.filter((v) => v.estado === 'realizada').length, aus = vis.filter((v) => v.estado === 'no_llego').length;
    $('#sc-body').innerHTML = `
      <div class="minis"><div><b class="mono">${hechas}</b><span>visitas</span></div><div><b class="mono${aus ? ' warn' : ''}">${aus}</b><span>ausencias</span></div><div><b class="mono${abiertos ? ' warn' : ''}">${abiertos}</b><span>incidentes</span></div></div>

      <form id="form-q" class="card panel" novalidate>
        <div class="eyebrow">Semana · ${esc(c.cuidadora.alias)}</div>
        <div class="qrow"><span>Cansancio</span><div class="chips radio">${[0, 1, 2, 3, 4].map((n) => `<label class="chip"><input type="radio" name="cansancio" value="${n}"${ya && ya.cansancio === n ? ' checked' : ''}><span>${n}</span></label>`).join('')}</div></div>
        <div class="qrow"><span>Noches mal</span><input name="noches" type="number" min="0" max="7" inputmode="numeric" value="${ya ? ya.malasNoches : ''}" aria-label="Noches que durmió mal"><button class="btn-primary sm" type="submit">${ya ? 'Actualizar' : 'Guardar'}</button></div>
        ${qs.length ? `<div class="spark">${qs.slice(-10).map((q) => `<span title="${esc(q.semana)}"><i style="height:${6 + q.cansancio * 8}px"></i><small>${q.cansancio}</small></span>`).join('')}</div>` : ''}
      </form>

      <div class="card panel">
        <div class="eyebrow">Incidentes</div>
        ${inc.map((i) => `<div class="inc"><span class="badge ${i.estado === 'abierto' ? 'alta' : 'aprobada'}">${i.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</span><span><b>${esc(i.tipo)}</b><small>${esc(i.fecha)} · ${esc(i.reporta)}</small></span>${i.estado === 'abierto' ? `<button type="button" class="btn-ghost sm" data-action="cerrar-inc" data-id="${esc(i.id)}">Cerrar</button>` : ''}</div>`).join('') || '<p class="sub">Ninguno.</p>'}
        <details class="mini-form"><summary>+ Registrar</summary>
          <form id="form-inc" novalidate>
            <div class="row2">
              <select name="reporta" aria-label="Quién reporta"><option value="familia">Familia</option><option value="relevo">Relevo</option></select>
              <select name="tipo" aria-label="Tipo">${options(TIPOS_INCIDENTE)}</select>
            </div>
            <input name="nota" maxlength="140" autocomplete="off" placeholder="Qué pasó (sin nombres)" aria-label="Qué pasó">
            <button class="btn-primary sm" type="submit">Registrar</button>
          </form>
        </details>
      </div>

      <details class="card panel"><summary>Últimas visitas</summary>
        <div class="vlist">${vis.slice(0, 8).map((v) => `<div><span class="mono">${esc(v.fecha.slice(5))}</span><span>${esc((relById(v.relevoId) || {}).nombre || '')}</span><span class="badge v-${v.estado}">${EST_VISITA[v.estado]}</span></div>`).join('') || '<p class="sub">Sin registros.</p>'}</div>
      </details>`;
  }
  $('#sc-caso').addEventListener('change', (e) => { ui.scCaso = e.target.value; ui.objetivo = null; ui.apagado = false; renderSegCaso(); });
  $('#sc-body').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.id === 'form-q') {
      const c = f.elements.cansancio.value, n = f.elements.noches.value;
      if (c === '' || n === '' || +n < 0 || +n > 7) { toast('Responde las dos'); return; }
      store.addCheckin(ui.scCaso, +c, +n); toast('Guardado');
    } else if (f.id === 'form-inc') {
      const nota = f.elements.nota.value.trim();
      if (nota.length < 4) { toast('Describe qué pasó'); return; }
      store.addIncidente({ casoId: ui.scCaso, reporta: f.elements.reporta.value, tipo: f.elements.tipo.value, nota }); toast('Incidente registrado');
    }
  });

  /* ---------- Red del hogar (Seguimiento › Caso) ---------- */
  function drawRed() {
    const c = casoById(ui.scCaso);
    const svg = $('#graphSvg');
    if (!c) { svg.innerHTML = ''; $('#fragScore').textContent = '—'; $('#noteBox').textContent = ''; $('#nodeBtn').hidden = true; return; }
    $('#nodeBtn').hidden = false;
    const base = analisisHogar(c, null);
    if (!ui.objetivo || !base.porId[ui.objetivo] || !(base.out[ui.objetivo] > 0)) ui.objetivo = base.principal;
    const X = ui.objetivo, off = ui.apagado && X;
    const a = analisisHogar(c, off ? X : null);
    red.dibujar(svg, a, X, !!off);
    $('#graphWrap').classList.toggle('off', !!off);
    const nom = X ? a.porId[X].nombre : '';
    const btn = $('#nodeBtn');
    btn.textContent = off ? 'Restaurar' : 'Apagar ' + nom;
    btn.className = off ? 'btn-dark sm' : 'btn-alert sm';
    $('#fragScore').textContent = off ? `${a.sinCuidado.length}/${a.dependientes}` : f2(a.fragilidad);
    $('#fragScore').className = 'mono ' + (off ? 'r' : fragClase(a.fragilidad));
    $('#fragLabel').textContent = off ? 'sin cuidado' : 'fragilidad';
    $('#horasSinCubrir').textContent = a.horasSinCubrir + ' h';
    const note = $('#noteBox');
    note.classList.toggle('off', !!off);
    if (!X) note.textContent = '';
    else if (off) note.textContent = a.relevosSinX === 0 ? `Si falta ${nom}, nadie la cubre.` : a.horasSinCubrir === 0 ? `Si falta ${nom}, la red la cubre.` : `Si falta ${nom}, quedan ${a.horasSinCubrir} h sin cubrir.`;
    else note.textContent = proDe(c) ? 'Toca un nodo y apágalo para simular una semana sin esa persona.' : 'Sin relevo del programa todavía.';
  }
  $('#nodeBtn').addEventListener('click', () => { ui.apagado = !ui.apagado; drawRed(); });
  function elegirNodo(g) { if (!g || !g.classList.contains('act')) return; ui.objetivo = g.dataset.id; drawRed(); }
  $('#graphSvg').addEventListener('click', (e) => elegirNodo(e.target.closest('.g-node')));
  $('#graphSvg').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegirNodo(e.target.closest('.g-node')); } });

  /* ---------- Mapa (Seguimiento › Mapa) ---------- */
  const COLOR_FRAG = { r: '#e5677f', a: '#d09a35', n: '#7dd1c1' };
  let mapa = null;
  function construirMapa() {
    const el = $('#map');
    const w = el.clientWidth, h = el.clientHeight;
    if (w < 50 || h < 50) return false;
    if (mapa && mapa.w === w && mapa.h === h) return true;
    const geo = window.CDMX_GEO;
    const proj = d3.geoMercator().fitExtent([[12, 12], [w - 12, h - 12]], geo);
    const path = d3.geoPath(proj);
    const svg = d3.select(el).attr('viewBox', `0 0 ${w} ${h}`);
    svg.selectAll('*').remove();
    const root = svg.append('g');
    const alcs = root.append('g'), nomb = root.append('g'), puntos = root.append('g');
    alcs.selectAll('path').data(geo.features).join('path').attr('class', 'alc').attr('d', path).append('title').text((f) => f.properties.nombre);
    const centros = {};
    geo.features.forEach((f) => { centros[f.properties.nombre] = proj(d3.geoCentroid(f)); });
    nomb.selectAll('text').data(geo.features).join('text').attr('class', 'alcname')
      .attr('x', (f) => centros[f.properties.nombre][0]).attr('y', (f) => centros[f.properties.nombre][1] + 2)
      .text((f) => f.properties.nombre.replace(' de Morelos', '').replace('La Magdalena Contreras', 'Magdalena C.'));
    const zoom = d3.zoom().scaleExtent([1, 10]).translateExtent([[0, 0], [w, h]]).on('zoom', (e) => { root.attr('transform', e.transform); mapa.k = e.transform.k; escalarMapa(); });
    svg.call(zoom).on('dblclick.zoom', null);
    svg.on('click', (e) => { if (!e.target.closest('.dot')) $('#mapCard').hidden = true; });
    mapa = { w, h, svg, root, alcs, nombres: nomb, puntos, centros, zoom, k: 1, conCasos: new Set() };
    return true;
  }
  function escalarMapa() {
    const k = mapa.k;
    mapa.puntos.selectAll('.dot').attr('r', 7 / k);
    mapa.puntos.selectAll('.halo').attr('r', 15 / k);
    mapa.nombres.selectAll('text').style('font-size', 7 / k + 'px').style('display', (f) => (k >= 2.2 || mapa.conCasos.has(f.properties.nombre) ? null : 'none'));
  }
  function mostrarTarjeta(d) {
    const c = $('#mapCard');
    c.innerHTML = `<button type="button" class="x" data-action="map-close" aria-label="Cerrar">×</button>
      <div class="f">${esc(d.c.folio)} · ${esc(d.c.alcaldia)} · ${ESTADO[d.c.estado]}</div><b>${esc(d.c.cuidadora.alias)} → ${esc(d.c.persona.alias)}</b>
      <div class="m"><span>Fragilidad</span><span class="mono" style="color:${COLOR_FRAG[fragClase(d.F)]}">${f2(d.F)}</span></div>
      <button type="button" data-action="see-red" data-id="${esc(d.c.id)}">Ver red</button>`;
    c.hidden = false;
  }
  function drawTerritorio() {
    const cs = store.state.casos.filter((c) => c.estado !== 'cerrado');
    const datos = cs.map((c) => ({ c, F: analisisHogar(c).fragilidad }));
    $('#terrPct').textContent = cs.length ? pct(datos.filter((d) => d.F >= 0.85).length, cs.length) + '%' : '—';
    $('#terrSub').textContent = `${cs.length} casos`;
    const el = $('#map');
    if (!window.d3 || !window.CDMX_GEO) { el.outerHTML = '<div class="maperr" id="map">No se pudo cargar el mapa.</div>'; return; }
    if (!construirMapa()) return;
    $('#mapCard').hidden = true;
    mapa.conCasos = new Set(datos.map((d) => d.c.alcaldia));
    mapa.alcs.selectAll('path').classed('con', (f) => mapa.conCasos.has(f.properties.nombre));
    const pts = [];
    Object.keys(ZONAS).forEach((z) => {
      const grupo = datos.filter((d) => d.c.alcaldia === z);
      const ce = mapa.centros[z]; if (!ce) return;
      grupo.forEach((d, i) => {
        const ang = (2 * Math.PI * i) / grupo.length - Math.PI / 2, r = grupo.length > 1 ? 11 : 0;
        pts.push({ d, x: ce[0] + r * Math.cos(ang), y: ce[1] + r * Math.sin(ang), color: COLOR_FRAG[fragClase(d.F)] });
      });
    });
    mapa.puntos.selectAll('*').remove();
    const g = mapa.puntos.selectAll('g').data(pts).join('g');
    g.append('circle').attr('class', 'halo').attr('cx', (p) => p.x).attr('cy', (p) => p.y).attr('fill', (p) => p.color);
    g.append('circle').attr('class', 'dot').attr('cx', (p) => p.x).attr('cy', (p) => p.y).attr('fill', (p) => p.color)
      .attr('tabindex', 0).attr('role', 'button').attr('aria-label', (p) => `${p.d.c.folio}, fragilidad ${f2(p.d.F)}`)
      .on('click', (e, p) => { e.stopPropagation(); mostrarTarjeta(p.d); })
      .on('keydown', (e, p) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostrarTarjeta(p.d); } });
    escalarMapa();
  }
  $('#mapReset').addEventListener('click', () => { if (mapa) mapa.svg.transition().duration(300).call(mapa.zoom.transform, d3.zoomIdentity); });

  /* ---------- Indicadores (solo agregados) ---------- */
  const mediana = (a) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const minutos = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
  const durH = (v) => { let d = minutos(v.fin) - minutos(v.ini); if (d <= 0) d += 1440; return d / 60; };

  function calcularKPI() {
    const s = store.state, hoy = F.hoyISO(), desde = F.sumaDias(hoy, -28);
    const casos = s.casos;
    const asignados = casos.filter((c) => c.asignacion);
    const enEspera = casos.filter((c) => c.estado === 'espera');
    const v28 = s.visitas.filter((v) => v.fecha >= desde && v.fecha < hoy && v.estado !== 'pendiente');
    const progH = v28.reduce((t, v) => t + durH(v), 0);
    const real = v28.filter((v) => v.estado === 'realizada');
    const entH = real.reduce((t, v) => t + durH(v), 0);
    const horasTot = s.visitas.filter((v) => v.estado === 'realizada').reduce((t, v) => t + durH(v), 0);
    const elegCont = asignados.filter((c) => diasEntre(primeraAsignacion(c), hoy) >= 28);
    const continuos = elegCont.filter((c) => c.estado === 'activo' && !(c.asignacion.historial || []).some((h) => diasEntre(primeraAsignacion(c), h.hasta) <= 28));
    const activos = casos.filter((c) => c.estado === 'activo');
    const semPrev = F.sumaDias(F.lunesDe(hoy), -7);
    const qPrev = s.checkins.filter((q) => q.semana === semPrev && activos.some((c) => c.id === q.casoId));
    const aprob = s.relevos.filter(store.aprobado);
    const cert = aprob.filter((r) => r.certificacion === 'certificada');
    const conSexo = casos.filter((c) => c.cuidadora.sexo);
    return {
      casos_canalizados: casos.length,
      pct_dentro_de_la_regla_40h: pct(casos.filter((c) => c.entrevista && PR.reglaHoras(c.entrevista.modelo.horas) === 'dentro').length, casos.length),
      casos_nivel_alta: casos.filter((c) => enPlan(c) && valDe(c).nivel === 'alta').length,
      casos_nivel_media: casos.filter((c) => enPlan(c) && valDe(c).nivel === 'media').length,
      casos_nivel_baja: casos.filter((c) => enPlan(c) && valDe(c).nivel === 'baja').length,
      casos_autorregistro: casos.filter((c) => c.canal_origen === 'autorregistro').length,
      casos_referencia: casos.filter((c) => c.canal_origen === 'referencia').length,
      casos_en_revision_humana: casos.filter(enRevision).length,
      apelaciones_abiertas: casos.reduce((t, c) => t + apelAbiertas(c).length, 0),
      bolsa_horas_mes: plan.presupuesto,
      horas_asignadas_mes: plan.usado,
      pct_cuidadoras_mujeres: pct(conSexo.filter((c) => c.cuidadora.sexo === 'M').length, conSexo.length),
      mediana_dias_canalizacion_a_asignacion: mediana(asignados.map((c) => diasEntre(c.fecha, primeraAsignacion(c)))),
      casos_en_espera: enEspera.length,
      max_dias_en_espera: enEspera.length ? Math.max(...enEspera.map((c) => diasEntre(c.fecha, hoy))) : 0,
      horas_programadas_28d: Math.round(progH),
      horas_entregadas_28d: Math.round(entH),
      pct_cumplimiento_28d: pct(entH, progH),
      pct_puntualidad_28d: pct(real.filter((v) => v.llegada && minutos(v.llegada) <= minutos(v.ini) + 10).length, real.length),
      pct_ausencias_28d: pct(v28.filter((v) => v.estado === 'no_llego').length, v28.length),
      incidentes_por_100h: horasTot ? Math.round((1000 * s.incidentes.length) / horasTot) / 10 : null,
      incidentes_abiertos: s.incidentes.filter((i) => i.estado === 'abierto').length,
      casos_evaluables_continuidad_4sem: elegCont.length,
      pct_continuidad_4sem: pct(continuos.length, elegCont.length),
      pct_respuesta_semanal: pct(qPrev.length, activos.length),
      cansancio_promedio_semana_previa: qPrev.length ? Math.round((10 * qPrev.reduce((t, q) => t + q.cansancio, 0)) / qPrev.length) / 10 : null,
      relevos_aprobados: aprob.length,
      relevos_certificados: cert.length,
      horas_cupo_libre_semana: cert.reduce((t, r) => t + Math.max(0, r.horasMax - RV.cargaDe(r.id, s)), 0),
    };
  }

  function renderKPI() {
    const k = calcularKPI();
    const t = (titulo, val, nota, warn) => `<div class="kpi${warn ? ' warn' : ''}"><b class="mono">${val == null ? '—' : esc(val)}</b><span>${esc(titulo)}</span>${nota ? `<small>${esc(nota)}</small>` : ''}</div>`;
    $('#kpi-body').innerHTML = `<div class="kpigrid">
      ${t('casos', k.casos_canalizados, `${k.pct_dentro_de_la_regla_40h} % con ≥ 40 h`)}
      ${t('niveles', `${k.casos_nivel_alta}·${k.casos_nivel_media}·${k.casos_nivel_baja}`, 'alta · media · baja')}
      ${t('revisión', k.casos_en_revision_humana + k.apelaciones_abiertas, `${k.casos_en_revision_humana} chequeos · ${k.apelaciones_abiertas} apelaciones`, k.casos_en_revision_humana + k.apelaciones_abiertas > 0)}
      ${t('cuidadoras mujeres', k.pct_cuidadoras_mujeres + ' %')}
      ${t('en espera', k.casos_en_espera, `máx. ${k.max_dias_en_espera} d`, k.casos_en_espera > 0)}
      ${t('días a asignar', k.mediana_dias_canalizacion_a_asignacion, 'mediana, de la valoración al relevo')}
      ${t('horas entregadas', `${k.pct_cumplimiento_28d} %`, `${k.horas_entregadas_28d}/${k.horas_programadas_28d} h · 28 d`)}
      ${t('puntualidad', k.pct_puntualidad_28d + ' %', '≤ 10 min')}
      ${t('ausencias', k.pct_ausencias_28d + ' %', '28 d', k.pct_ausencias_28d >= 10)}
      ${t('incidentes / 100 h', k.incidentes_por_100h, `${k.incidentes_abiertos} abiertos`, k.incidentes_abiertos > 0)}
      ${t('continuidad 4 sem', k.casos_evaluables_continuidad_4sem ? k.pct_continuidad_4sem + ' %' : null, `${k.casos_evaluables_continuidad_4sem} casos`)}
      ${t('cansancio prom.', k.cansancio_promedio_semana_previa, `0-4 · ${k.pct_respuesta_semanal} % respondió`)}
      ${t('relevos asignables', `${k.relevos_certificados}/${k.relevos_aprobados}`, 'certificadas', k.relevos_certificados < k.relevos_aprobados)}
      ${t('cupo libre', k.horas_cupo_libre_semana + ' h', 'por semana')}
    </div>`;
  }
  $('#kpi-export').addEventListener('click', () => descargar({
    simulado: true, generado: new Date().toISOString(), fuente: 'Frontend/ (prototipo de relevo por horas)',
    advertencia: 'Datos SIMULADOS. Prueban el circuito app -> Observatorio; no son resultados del programa.', indicadores: calcularKPI(),
  }, 'operacion_agregados_SIMULADO.json'));

  function descargar(obj, nombre) {
    const txt = JSON.stringify(obj, null, 2);
    $('#json-nombre').textContent = nombre;
    $('#json-txt').value = txt;
    ui.json = { txt, nombre };
    $('#dlg-json').showModal();
  }
  $('#json-copiar').addEventListener('click', () => {
    const t = $('#json-txt');
    const sel = () => { t.focus(); t.select(); toast('Seleccionado: copia con Ctrl+C'); };
    try { navigator.clipboard.writeText(ui.json.txt).then(() => toast('Copiado'), sel); } catch (e) { sel(); }
  });
  $('#json-bajar').addEventListener('click', () => {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ui.json.txt], { type: 'application/json' })); a.download = ui.json.nombre; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) { toast('Usa Copiar'); }
  });

  /* ================= 4. Ajustes ================= */
  function renderAjustes() {
    const c = cfg();
    if (document.activeElement !== $('#cfg-km')) $('#cfg-km').value = c.maxKm;
    if (document.activeElement !== $('#cfg-fp')) $('#cfg-fp').value = c.factorPrest;
    $('#cfg-km-val').textContent = c.maxKm + ' km';
    $('#cfg-fp-val').textContent = c.factorPrest ? c.factorPrest + ' %' : 'sin prestaciones';
    $('#cfg-params').innerHTML = [
      ['Salario diario', '$' + legal.SALARIO_DIARIO.toFixed(2), 'CONASAMI, DOF 09-dic-2025 · por verificar'],
      ['Hora diurna (÷ 8)', '$' + legal.HORA.diurna.toFixed(2), '06:00-20:00'],
      ['Hora mixta (÷ 7.5)', '$' + legal.HORA.mixta.toFixed(2), '< 3.5 h nocturnas'],
      ['Hora nocturna (÷ 7)', '$' + legal.HORA.nocturna.toFixed(2), '20:00-06:00 o ≥ 3.5 h nocturnas'],
      ['Semanas por mes', RV.SEMANAS_MES, 'como el script 10'],
      ['Regla de referencia', `≥ ${RV.UMBRAL_HORAS} h/sem`, 'notebook 11 · se muestra junto al puntaje'],
    ].map(([a, b, n]) => `<li><span>${esc(a)}<small>${esc(n)}</small></span><b class="mono">${esc(b)}</b></li>`).join('');
    if (document.activeElement !== $('#cfg-bolsa')) $('#cfg-bolsa').value = bolsa();
    $('#cfg-bolsa-val').textContent = bolsa().toLocaleString('es-MX') + ' h';
    $('#cfg-bolsa-nota').textContent = `El archivo js/config.js fija ${CP.presupuesto_horas_mes.toLocaleString('es-MX')} h (ilustrativo). Este control solo simula: no cambia el archivo.`;
    $('#cfg-prio').innerHTML = [
      ['Bolsa (presupuesto_horas_mes)', CP.presupuesto_horas_mes + ' h', 'ilustrativo'],
      ['Mínimo garantizado', CP.horas_minimas + ' h/mes', '≈ 3 h/sem'],
      ['Tope por hogar', CP.horas_maximas + ' h/mes', '≈ 12 h/sem'],
      ['Niveles', `Alta ≥ ${CP.umbrales.alta} · Media ≥ ${CP.umbrales.media}`, 'Media = umbral del script 22; Alta provisional'],
      ['Envejecimiento', `+${CP.envejecimiento.puntos_por_semana}/sem · tope ${CP.envejecimiento.tope_envejecimiento}`, 'provisional'],
      ['Tarjeta', CP.variante_tarjeta, 'script 22 · ENASIC 2022 nacional'],
      ...Object.keys(CP.pesos).map((k) => [PR.ETIQUETA[k], CP.pesos[k] + ' pts', k]),
    ].map(([a, b, n]) => `<li><span>${esc(a)}<small>${esc(n)}</small></span><b class="mono">${esc(b)}</b></li>`).join('');
    const el = $('#cfg-marco');
    if (!el.childElementCount) el.innerHTML = Object.values(legal.MARCO).map((m) => `<li><b>${esc(m.norma)}</b>${esc(m.tema)}</li>`).join('');
    const s = store.state;
    $('#cfg-stats').textContent = `${s.casos.length} casos · ${s.relevos.length} relevos · ${s.visitas.length} visitas`;
  }
  $('#cfg-km').addEventListener('input', (e) => store.update((s) => { s.config.maxKm = +e.target.value; }));
  $('#cfg-fp').addEventListener('input', (e) => store.update((s) => { s.config.factorPrest = +e.target.value; }));
  $('#cfg-bolsa').addEventListener('input', (e) => store.update((s) => { s.config.bolsaSim = +e.target.value; }));
  $('#cfg-export').addEventListener('click', () => descargar(store.state, 'mientras-completo.json'));
  $('#cfg-import').addEventListener('click', () => $('#cfg-file').click());
  $('#cfg-file').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.casos) || !Array.isArray(data.relevos)) throw new Error('formato');
      store.replace(data); toast('Importado');
    } catch (err) { toast('Archivo no válido'); }
  });
  $('#cfg-seed').addEventListener('click', async () => { if (await pedir('Reemplazar todo por los datos de ejemplo.', { ok: 'Restaurar' })) { store.resetSeed(); toast('Ejemplo restaurado'); } });
  $('#cfg-clear').addEventListener('click', async () => { if (await pedir('Borrar casos, relevos, visitas e incidentes.', { ok: 'Borrar todo', peligro: true })) { store.clearAll(); toast('Borrado'); } });

  /* ================= Formularios ================= */
  function chips(container, list, label) {
    container.innerHTML = list.map((v, i) => `<label class="chip"><input type="checkbox" value="${esc(label ? i : v)}"><span>${esc(label ? label(v) : v)}</span></label>`).join('');
  }
  const checked = (form, name) => $$(`[data-name="${name}"] input:checked`, form).map((i) => i.value);
  function sxPick(el) {
    const n = el.dataset.sx;
    el.innerHTML = ['M', 'H'].map((v) => `<label class="chip ico"><input type="radio" name="${n}" value="${v}"><span>${SX[v]}${SEXO_TXT[v]}</span></label>`).join('');
  }
  function initForms() {
    $('#rel-alcaldia').innerHTML = options(Object.keys(ZONAS));
    $('#rel-doc').innerHTML = '<option value="">Elige…</option>' + options(legal.DOCS_ID);
    chips($('#form-relevo [data-name="dias"]'), RV.DIAS, (d) => d);
    chips($('#form-relevo [data-name="tareas"]'), RV.TAREAS);
    $$('#form-relevo .sxpick').forEach(sxPick);
    const fa = $('#form-relevo').elements.antecedentesFecha;
    fa.max = F.hoyISO(); fa.min = F.sumaDias(F.hoyISO(), -legal.VIGENCIA_ANTECEDENTES_DIAS);
    $$('dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    $$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  }

  /* ================= Solicitud de relevo ("Necesito cuidado") =================
   * Entrada (autorregistro o referencia) → Registro → Consentimiento → Entrevista (3 bloques) → Resultado
   * (puntaje, nivel, horas estimadas, factores, solicitar revisión, canal alterno) → entra a la cola.
   * Minimización: solo se pide lo que usa el puntaje o la asignación. Sin CURP, sin diagnósticos, sin edad. */
  const PASOS = [
    { id: 'entrada', t: 'Cómo llega' }, { id: 'registro', t: 'Registro' }, { id: 'consentimiento', t: 'Consentimiento' },
    { id: 'modelo', t: 'Entrevista 1/3' }, { id: 'zarit', t: 'Entrevista 2/3' }, { id: 'barthel', t: 'Entrevista 3/3' }, { id: 'resultado', t: 'Resultado' },
  ];
  const nuevaSol = () => ({
    canal: '', institucion: '', quien: '', presente: false, alias: '', sexo: '', palias: '', psexo: '', alcaldia: '',
    aviso: false, expreso: false, modelo: { horas: '', abvd: [], clin: [], req: null, fuerza: null }, zarit: {}, barthel: {},
    pref: { dias: [], inicio: '09:00', tareas: [] }, apelacion: null,
  });
  const radio = (name, val, lab, on) => `<label class="chip"><input type="radio" name="${name}" value="${esc(val)}"${on ? ' checked' : ''}><span>${lab}</span></label>`;
  const check = (name, val, lab, on) => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(val)}"${on ? ' checked' : ''}><span>${esc(lab)}</span></label>`;
  const sinoChips = (name, v) => radio(name, 'si', 'Sí', v === true) + radio(name, 'no', 'No', v === false);
  const codigo = (txt) => (ui.rol === 'programa' ? `<span class="cod mono">${esc(txt)}</span>` : '');
  const entrevistaDe = (d) => ({ modelo: { horas: +d.modelo.horas, abvd: d.modelo.abvd.slice(), clin: d.modelo.clin.slice(), req: !!d.modelo.req, fuerza: !!d.modelo.fuerza },
    zarit: PR.totalZarit(d.zarit, CP) == null ? null : Object.assign({}, d.zarit), barthel: Object.assign({}, d.barthel) });

  function pintaPaso() {
    const d = ui.sol.d, paso = PASOS[ui.sol.paso];
    $('#sol-paso').textContent = `${ui.sol.paso + 1}/${PASOS.length} · ${paso.t}`;
    $('#sol-bar').style.width = Math.round(((ui.sol.paso + 1) / PASOS.length) * 100) + '%';
    $('#sol-atras').textContent = ui.sol.paso ? 'Atrás' : 'Cancelar';
    $('#sol-sig').textContent = paso.id === 'resultado' ? 'Entrar a la cola' : paso.id === 'consentimiento' ? 'Acepto y sigo' : 'Siguiente';
    $('#sol-err').textContent = '';
    let h = '';
    if (paso.id === 'entrada') {
      h = `${personaje('bienvenida', 'hero-img')}
        <h3 class="marca">${esc(CP.nombre)}</h3><p class="eslogan">${esc(CP.eslogan)}</p>
        <p class="complementario">${esc(CP.aviso_complementario)}</p>
        <div class="eyebrow sep">¿Cómo llega esta solicitud?</div>
        <div class="vias">
          <label class="via"><input type="radio" name="canal" value="autorregistro"${d.canal === 'autorregistro' ? ' checked' : ''}><span><b>Me registro yo</b><small>Autorregistro</small></span></label>
          <label class="via"><input type="radio" name="canal" value="referencia"${d.canal === 'referencia' ? ' checked' : ''}><span><b>Me refiere una institución</b><small>DIF, centro de salud, escuela, clínica o módulo</small></span></label>
        </div>
        <div id="sol-ref"${d.canal === 'referencia' ? '' : ' hidden'}>
          <p class="sub">Lo llena la persona de la institución.</p>
          <label class="fld">Institución<select name="institucion"><option value="">Elige…</option>${options(CP.instituciones, d.institucion)}</select></label>
          <label class="fld">Quién refiere (cargo, sin nombre)<input name="quien" maxlength="60" autocomplete="off" value="${esc(d.quien)}" placeholder="Ej. trabajadora social"></label>
          <label class="check"><input type="checkbox" name="presente"${d.presente ? ' checked' : ''}><span>La persona referida está presente y quiere continuar</span></label>
        </div>`;
    } else if (paso.id === 'registro') {
      h = `<h3>Registro</h3><p class="sub">Solo pedimos lo que usan el puntaje o la asignación. No pedimos CURP, diagnósticos ni domicilio.</p>
        <div class="eyebrow sep">Quien cuida</div>
        <div class="row-sx"><div class="chips radio">${['M', 'H'].map((v) => `<label class="chip ico"><input type="radio" name="sexo" value="${v}"${d.sexo === v ? ' checked' : ''}><span>${SX[v]}${SEXO_TXT[v]}</span></label>`).join('')}</div>
          <input name="alias" maxlength="24" autocomplete="off" placeholder="Alias" aria-label="Alias de quien cuida" value="${esc(d.alias)}"></div>
        ${ui.rol === 'programa' ? '<p class="wk-n">El sexo de quien cuida entra al puntaje (variable SEXO de la ENASIC).</p>' : ''}
        <div class="eyebrow sep">Persona cuidada</div>
        <div class="row-sx"><div class="chips radio">${['M', 'H'].map((v) => `<label class="chip ico"><input type="radio" name="psexo" value="${v}"${d.psexo === v ? ' checked' : ''}><span>${SX[v]}${SEXO_TXT[v]}</span></label>`).join('')}</div>
          <input name="palias" maxlength="24" autocomplete="off" placeholder="Alias" aria-label="Alias de la persona cuidada" value="${esc(d.palias)}"></div>
        <label class="fld">Alcaldía (para asignar relevo cerca)<select name="alcaldia"><option value="">Elige…</option>${options(Object.keys(ZONAS), d.alcaldia)}</select></label>`;
    } else if (paso.id === 'consentimiento') {
      h = `<h3>Consentimiento</h3>
        <p class="sub">Para valorar tu solicitud te preguntaremos cuántas horas cuidas, en qué actividades ayudas, qué tareas de salud haces, qué tan dependiente es la persona que cuidas y cómo te sientes con el cuidado.</p>
        <p class="sub">Son <b>datos sensibles</b>. Se usan solo para calcular tu prioridad, tus horas y asignar relevo. Puedes retirar tu consentimiento cuando quieras.</p>
        <button type="button" class="link" data-action="ver-aviso">Leer el aviso de privacidad</button>
        <label class="check"><input type="checkbox" name="aviso"${d.aviso ? ' checked' : ''}><span>Leí el aviso de privacidad</span></label>
        <label class="check"><input type="checkbox" name="expreso"${d.expreso ? ' checked' : ''}><span>Acepto de forma expresa que se registren datos sobre mi salud, mi carga de cuidado y la dependencia de la persona que cuido</span></label>`;
    } else if (paso.id === 'modelo') {
      const m = d.modelo;
      h = `<h3>Tu cuidado</h3><p class="sub">Bloque 1 de 3. Mismas preguntas y categorías que la ENASIC 2022: con ellas se calcula el puntaje.</p>
        <label class="fld">${esc(PR.PREGUNTAS_MODELO[0].txt)} ${codigo('P6_7 + P6_26')}<input name="horas" type="number" min="0" max="168" inputmode="numeric" value="${esc(m.horas)}"></label>
        <div class="fld">${esc(PR.PREGUNTAS_MODELO[1].txt)} ${codigo('P6_2 · ABVD')}<div class="chips">${PR.ABVD.map((o) => check('abvd', o.id, o.txt, m.abvd.includes(o.id))).join('')}</div></div>
        <div class="fld">${esc(PR.PREGUNTAS_MODELO[2].txt)} ${codigo('P6_2 · clínicas')}<div class="chips">${PR.CLIN.map((o) => check('clin', o.id, o.txt, m.clin.includes(o.id))).join('')}</div></div>
        <div class="fld">${esc(PR.PREGUNTAS_MODELO[3].txt)} ${codigo('P6_9_4 / P6_28_4')}<div class="chips radio">${sinoChips('req', m.req)}</div></div>
        <div class="fld">${esc(PR.PREGUNTAS_MODELO[4].txt)} ${codigo('P6_9_1 / P6_28_1')}<div class="chips radio">${sinoChips('fuerza', m.fuerza)}</div></div>`;
    } else if (paso.id === 'zarit') {
      // Los textos del Zarit requieren licencia: mientras no la haya, el bloque no se pregunta (antes mostraba 22 marcadores).
      h = `<h3>Cómo te sientes</h3>
        <div class="card panel pendiente-lic"><b>Este bloque todavía no está activo.</b>
          <p class="sub">Aquí irán preguntas sobre tu cansancio y tu carga de cuidado (escala tipo Zarit). Se activan cuando el programa tenga la licencia del cuestionario. No cambian tu prioridad.</p></div>
        <p class="sub">Puedes seguir al siguiente bloque.</p>`;
    } else if (paso.id === 'barthel') {
      h = `<h3>La persona que cuidas</h3><p class="sub">Bloque 3 de 3 · actividades básicas de la vida diaria (índice de Barthel).</p>
        ${PR.BARTHEL.map((it) => `<div class="fld">${esc(it.txt)}<div class="chips radio">${it.niveles.map(([p, t]) => radio(it.id, p, esc(t), String(d.barthel[it.id]) === String(p))).join('')}</div></div>`).join('')}
        <p class="sub" id="barthel-total"></p>`;
    } else {
      const ent = entrevistaDe(d);
      const v = valorar(ent, d.sexo, F.hoyISO());
      const est = calcularPlan({ id: '__nuevo', efectivo: v.efectivo });
      const hMes = est.horas.__nuevo || 0;
      const ch = PR.chequeos(ent, CP);
      h = `${personaje(v.nivel, 'hero-img')}
        ${ui.rol === 'programa'
          ? `<div class="resnivel nv-${v.nivel}"><span>Nivel</span><b>${PR.NIVEL[v.nivel]}</b><small class="mono">${pts(v.base)} de ${v.max} puntos</small></div>`
          : `<div class="resnivel neutro"><span>Prioridad</span><b>${PR.NIVEL[v.nivel]}</b></div>`}
        <p class="provisional">Puntaje provisional — modelo en validación</p>
        <section class="blk"><h5>Lo que más pesó</h5>${factoresHTML(Object.assign({}, v, { provisional: false }))}</section>
        <section class="blk"><h5>Horas asignadas</h5>
          <div class="bolsa"><b class="mono">${hMes}</b><span>h al mes · ≈ ${PR.horasSemana(hMes, CP)} h por semana</span></div>
          <p class="wk-n">${hMes ? `Estimado con la bolsa actual (${est.presupuesto} h) y los casos en cola. Se confirma en el ciclo del mes.` : 'La bolsa de este mes no alcanza: entras a la cola y tu puntaje sube cada semana de espera.'} Mínimo garantizado: ${CP.horas_minimas} h/mes si la bolsa alcanza.</p>
          <p class="complementario">${esc(CP.aviso_complementario)}</p>
        </section>
        ${v.nivel === 'baja' ? `<section class="blk alterno"><h5>Además de tus horas</h5>
          <p class="sub">Mientras llega tu relevo, estos apoyos pueden ayudarte. [Directorio pendiente: se llenará con servicios reales de tu alcaldía.]</p>
          <ul class="motivos"><li>Redes de apoyo para personas cuidadoras cerca de ${esc(d.alcaldia || 'tu alcaldía')}</li><li>Centros de día públicos para personas mayores o con discapacidad</li><li>Módulo del Sistema Público de Cuidados más cercano</li></ul></section>` : ''}
        ${ch.length ? `<section class="blk revbox"><h5>Una persona revisará tu caso</h5><ul class="motivos">${ch.map((x) => `<li>${esc(x.txt)}</li>`).join('')}</ul><p class="wk-n">Algunas respuestas no coinciden entre sí. Tu puntaje no cambia; una persona del programa lo revisa.</p></section>` : ''}
        <section class="blk"><h5>¿No estás de acuerdo?</h5>
          ${d.apelacion ? `<p class="sub">Solicitud de revisión registrada: «${esc(d.apelacion)}». Se guarda con tu caso.</p>` : '<p class="sub">Puedes pedir que una persona revise tu valoración.</p>'}
          <button type="button" class="btn-ghost sm" data-action="sol-apelar">${d.apelacion ? 'Cambiar motivo' : 'Solicitar revisión'}</button>
        </section>
        <div class="eyebrow sep">¿Cuándo te sirve el relevo?</div>
        <div class="chips">${RV.DIAS.map((t, i) => check('pdias', i, t, d.pref.dias.includes(i))).join('')}</div>
        <label class="fld">Desde las<input name="pinicio" type="time" step="1800" value="${esc(d.pref.inicio)}"></label>
        <div class="fld">¿Con qué te ayudaría la persona de relevo?<div class="chips">${RV.TAREAS.map((t) => check('ptareas', t, t, d.pref.tareas.includes(t))).join('')}</div></div>
        <p class="wk-n">El programa asigna a la persona de relevo según la prioridad; no se elige de un catálogo.</p>`;
    }
    $('#sol-body').innerHTML = h;
    totalesSol();
    $('#dlg-sol').scrollTop = 0;
  }
  function totalesSol() {
    const d = ui.sol.d;
    const z = $('#zarit-total'), b = $('#barthel-total');
    if (z) { const n = Object.keys(d.zarit).length, t = PR.totalZarit(d.zarit, CP); z.textContent = t == null ? `${n} de ${CP.zarit.n_reactivos} respondidos` : `Total: ${t} de ${CP.zarit.n_reactivos * CP.zarit.escala_max}`; }
    if (b) { const t = PR.totalBarthel(d.barthel); b.textContent = t == null ? '' : `Total: ${t}/100 · ${PR.nivelBarthel(t)}`; }
  }
  function leerPaso() {
    const d = ui.sol.d, f = $('#form-sol'), e = f.elements, id = PASOS[ui.sol.paso].id;
    const val = (n) => (e[n] ? e[n].value : '');
    const marcados = (n) => $$(`input[name="${n}"]:checked`, f).map((i) => i.value);
    if (id === 'entrada') { d.canal = val('canal'); d.institucion = val('institucion'); d.quien = val('quien').trim(); d.presente = !!(e.presente && e.presente.checked); $('#sol-ref').hidden = d.canal !== 'referencia'; }
    else if (id === 'registro') { d.sexo = val('sexo'); d.psexo = val('psexo'); d.alias = val('alias').trim(); d.palias = val('palias').trim(); d.alcaldia = val('alcaldia'); }
    else if (id === 'consentimiento') { d.aviso = e.aviso.checked; d.expreso = e.expreso.checked; }
    else if (id === 'modelo') {
      d.modelo.horas = val('horas'); d.modelo.abvd = marcados('abvd'); d.modelo.clin = marcados('clin');
      d.modelo.req = val('req') ? val('req') === 'si' : null; d.modelo.fuerza = val('fuerza') ? val('fuerza') === 'si' : null;
    } else if (id === 'zarit') { PR.reactivosZarit(CP).forEach((it) => { const v = val(it.id); if (v !== '') d.zarit[it.id] = +v; }); }
    else if (id === 'barthel') { PR.BARTHEL.forEach((it) => { const v = val(it.id); if (v === '') delete d.barthel[it.id]; else d.barthel[it.id] = +v; }); }
    else { d.pref.dias = marcados('pdias').map(Number); d.pref.inicio = val('pinicio') || '09:00'; d.pref.tareas = marcados('ptareas'); }
    totalesSol();
  }
  function errorPaso() {
    const d = ui.sol.d, id = PASOS[ui.sol.paso].id;
    if (id === 'entrada') {
      if (!d.canal) return 'Elige cómo llega la solicitud.';
      if (d.canal === 'referencia' && (!d.institucion || d.quien.length < 3 || !d.presente)) return 'La referencia necesita institución, cargo de quien refiere y que la persona esté presente.';
    } else if (id === 'registro') {
      if (!d.sexo || !d.alias || !d.palias || !d.alcaldia) return 'Faltan datos del registro.';
    } else if (id === 'consentimiento') {
      if (!d.aviso || !d.expreso) return 'Sin consentimiento expreso no se puede hacer la entrevista.';
    } else if (id === 'modelo') {
      const h = d.modelo.horas;
      if (h === '' || isNaN(+h) || +h < 0 || +h > 168) return 'Escribe las horas a la semana (0 a 168).';
      if (d.modelo.req == null || d.modelo.fuerza == null) return 'Responde las dos preguntas de sí o no.';
    } else if (id === 'zarit') {
      const n = Object.keys(d.zarit).length;
      if (n && n < CP.zarit.n_reactivos) return `Responde los ${CP.zarit.n_reactivos} reactivos o deja el bloque vacío.`;
    } else if (id === 'barthel') {
      if (PR.totalBarthel(d.barthel) == null) return 'Responde las 10 actividades.';
    } else {
      if (!d.pref.dias.length || !d.pref.tareas.length) return 'Elige al menos un día y una tarea para el relevo.';
    }
    return '';
  }
  function openSol() {
    ui.sol = { paso: 0, d: nuevaSol() };
    $('#dlg-sol').showModal();
    pintaPaso();
  }
  function guardarSol() {
    const d = ui.sol.d, hoy = F.hoyISO(), ent = entrevistaDe(d);
    const ch = PR.chequeos(ent, CP);
    const caso = {
      id: store.uid('k'), folio: store.nextFolio(), fecha: hoy, alcaldia: d.alcaldia, estado: 'espera',
      canal_origen: d.canal, referencia: d.canal === 'referencia' ? { institucion: d.institucion, quien: d.quien, fecha: hoy } : null,
      cuidadora: { alias: d.alias, sexo: d.sexo, horas: ent.modelo.horas, abvd: ent.modelo.abvd.length > 0 },
      persona: { alias: d.palias, sexo: d.psexo || null },
      entrevista: ent,
      consentimiento: { expreso: true, aviso: 'pendiente revisión legal', fecha: hoy },
      hogar: Care.buildHogar({ cuidadora: { nombre: d.alias, rol: 'cuidadora', horas: ent.modelo.horas }, cuidada: { nombre: d.palias, rol: 'familiar' } }),
      preferencias: { dias: d.pref.dias.slice(), inicio: d.pref.inicio, tareas: d.pref.tareas.slice() },
      pagador: 'subsidio', pctSubsidio: 0, asignacion: null,
      apelaciones: d.apelacion ? [{ id: store.uid('ap'), fecha: hoy, motivo: d.apelacion, estado: 'abierta' }] : [],
      revision: ch.length ? { estado: 'pendiente', motivos: ch, fecha: hoy } : null,
    };
    store.addSolicitud(caso);
    $('#dlg-sol').close();
    if (ui.rol === 'cuidadora') { guardarId('mientras-mi-caso', caso.id); show('mia'); toast(`Solicitud ${caso.folio} enviada`); return; }
    ui.casoFiltro = 'espera';
    $$('#caso-filter button').forEach((x) => x.classList.toggle('on', x.dataset.val === 'espera'));
    show('casos');
    const v = valDe(caso);
    toast(`${caso.folio} · nivel ${PR.NIVEL[v.nivel]}${ch.length ? ' · a revisión humana' : ''}`);
  }
  ['input', 'change'].forEach((ev) => $('#form-sol').addEventListener(ev, leerPaso));
  $('#form-sol').addEventListener('submit', (e) => {
    e.preventDefault();
    leerPaso();
    const err = errorPaso();
    if (err) { $('#sol-err').textContent = err; return; }
    if (PASOS[ui.sol.paso].id === 'resultado') { guardarSol(); return; }
    ui.sol.paso++; pintaPaso();
  });
  $('#sol-atras').addEventListener('click', () => { if (!ui.sol.paso) { $('#dlg-sol').close(); return; } leerPaso(); ui.sol.paso--; pintaPaso(); });

  /* ---------- Registrar persona de relevo ---------- */
  function openRelevo() {
    const f = $('#form-relevo'); f.reset(); $('.form-error', f).textContent = '';
    $('#dlg-relevo').showModal(); $('#dlg-relevo').scrollTop = 0;
    refreshRelevo();
  }
  function datosRelevo() {
    const f = $('#form-relevo'), e = f.elements;
    const curp = e.curp.value.trim().toUpperCase();
    const v = legal.validarCURP(curp);
    return {
      nombre: e.nombre.value.trim(), sexo: e.sexo.value, alcaldia: e.alcaldia.value, certificacion: e.certificacion.value, experiencia: 0,
      diasSel: checked(f, 'dias').map(Number), dias: checked(f, 'dias').length, desde: e.desde.value, hasta: e.hasta.value, horasMax: +e.horasMax.value || 0,
      tareas: checked(f, 'tareas'), curp, docId: e.docId.value, antecedentesFecha: e.antecedentesFecha.value, refNombre: e.refNombre.value, refTel: e.refTel.value,
      contrato: e.contrato.checked, privacidad: e.privacidad.checked, veracidad: e.veracidad.checked, duplicada: v.ok && store.existeRelevoCURP(v.curp),
    };
  }
  function refreshRelevo() {
    const d = datosRelevo();
    const reqs = legal.requisitosRelevo(d);
    if (!d.nombre) reqs.unshift({ ok: false, txt: 'Nombre' });
    if (!d.tareas.length) reqs.push({ ok: false, txt: 'Al menos una tarea' });
    pintaReqs($('#rel-reqs'), reqs);
    $('#rel-ok').disabled = legal.pendientes(reqs).length > 0;
  }
  ['input', 'change'].forEach((ev) => $('#form-relevo').addEventListener(ev, refreshRelevo));
  $('#form-relevo').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#rel-ok').disabled) return;
    const d = datosRelevo(), nuevoId = store.uid('r');
    store.update((s) => s.relevos.unshift({
      id: nuevoId, nombre: d.nombre, sexo: d.sexo || null, alcaldia: d.alcaldia, dias: d.diasSel, desde: d.desde, hasta: d.hasta, horasMax: d.horasMax,
      tareas: d.tareas, certificacion: d.certificacion, experiencia: d.experiencia,
      legal: { curp: d.curp, docId: d.docId, antecedentesFecha: d.antecedentesFecha, referencia: { nombre: d.refNombre.trim(), tel: d.refTel.replace(/\D/g, '') }, aceptado: new Date().toISOString() },
      verificacion: { estado: 'pendiente', fecha: F.hoyISO() },
    }));
    $('#dlg-relevo').close();
    if (ui.rol === 'relevo') { guardarId('mientras-mi-relevo', nuevoId); show('yo'); toast('Enviado a revisión'); return; }
    ui.relFiltro = 'revision';
    $$('#rel-filter button').forEach((x) => x.classList.toggle('on', x.dataset.val === 'revision'));
    render();
    toast('Enviado a revisión');
  });

  /* ================= Acciones (delegación) ================= */
  const cerrarDet = () => { if ($('#dlg-det').open) $('#dlg-det').close(); };
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.ccard[data-action]')) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const id = b.dataset.id;
    switch (b.dataset.action) {
      case 'ver-caso': abrirCaso(id); break;
      case 'ver-relevo': abrirRelevo(id); break;
      case 'new-sol': openSol(); break;
      case 'ver-aviso': await pedir(CP.aviso_privacidad + ' Datos que se recogen: horas de cuidado, actividades y tareas de salud, dependencia de la persona cuidada (Barthel) y sobrecarga. Sin CURP ni diagnósticos.', { ok: 'Entendido' }); break;
      case 'sol-apelar': { const m = await pedir('¿Por qué crees que tu valoración no refleja tu situación?', { input: true, min: 5, ok: 'Registrar' }); if (m) { ui.sol.d.apelacion = m; pintaPaso(); } break; }
      case 'revisado': { cerrarDet(); const m = await pedir('Nota de la revisión (qué se verificó):', { input: true, min: 5, ok: 'Marcar revisado' }); if (m) { store.resolverRevision(id, m); toast('Revisión registrada; el puntaje no cambia'); } break; }
      case 'resolver-ap': { cerrarDet(); const apId = b.dataset.ap; const m = await pedir('Resolución (si cambia una respuesta, se vuelve a entrevistar):', { input: true, min: 5, ok: 'Resolver' }); if (m) { store.resolverApelacion(id, apId, m); toast('Solicitud de revisión resuelta'); } break; }
      case 'aplicar-ciclo': {
        const activos = store.state.casos.filter((c) => c.estado === 'activo' && c.paquete);
        if (await pedir(`Ajustar el paquete semanal de ${activos.length} casos con relevo a las horas de este ciclo. Puede cambiar días y costos.`, { ok: 'Aplicar' })) { store.aplicarCiclo(Object.assign({}, plan.sem)); toast('Ciclo aplicado'); }
        break;
      }
      case 'new-relevo': openRelevo(); break;
      case 'mia-nueva': guardarId('mientras-mi-caso', ''); render(); break;
      case 'yo-nuevo': guardarId('mientras-mi-relevo', ''); render(); break;
      case 'proponer': abrirAsignacion(id, false); break;
      case 'reasignar': abrirAsignacion(id, true); break;
      case 'seguir': case 'see-red': cerrarDet(); ui.scCaso = id; ui.segSub = 'caso'; ui.objetivo = null; ui.apagado = false; show('seguimiento'); break;
      case 'map-close': $('#mapCard').hidden = true; break;
      case 'cerrar': { cerrarDet(); const m = await pedir('Motivo del cierre:', { input: true, ok: 'Cerrar caso' }); if (m) { store.cerrarCaso(id, m); toast('Caso cerrado'); } break; }
      case 'del-caso': cerrarDet(); if (await pedir('Eliminar el caso y su historial.', { ok: 'Eliminar', peligro: true })) store.removeCaso(id); break;
      case 'aprobar': cerrarDet(); if (await pedir('¿Identidad, carta y referencia revisadas?', { ok: 'Aprobar' })) { store.resolverRelevo(id, true); toast('Aprobada'); } break;
      case 'rechazar': { cerrarDet(); const m = await pedir('Motivo del rechazo:', { input: true, ok: 'Rechazar', peligro: true }); if (m) { store.resolverRelevo(id, false, m); toast('Rechazada'); } break; }
      case 'certificar': cerrarDet(); store.update(() => { relById(id).certificacion = 'certificada'; }); toast('Certificación registrada'); break;
      case 'del-relevo': cerrarDet(); if (await pedir('Eliminar este registro.', { ok: 'Eliminar', peligro: true }) && !store.removeRelevo(id)) toast('Tiene casos activos: cámbialos primero'); break;
      case 'dia': ui.dia = F.sumaDias(ui.dia, +b.dataset.d); renderDia(); break;
      case 'llego': store.registrarLlegada(id, ui.dia); toast('Llegada registrada'); break;
      case 'salio': store.registrarSalida(id, ui.dia); toast('Salida registrada'); break;
      case 'nollego': store.marcarVisita(id, ui.dia, 'no_llego'); toast('Ausencia registrada'); break;
      case 'cancelo': store.marcarVisita(id, ui.dia, 'cancelada'); toast('Cancelada por la familia'); break;
      case 'cerrar-inc': { const m = await pedir('¿Cómo se resolvió?', { input: true, ok: 'Cerrar' }); if (m) { store.cerrarIncidente(id, m); toast('Incidente cerrado'); } break; }
    }
  });

  /* ================= Vistas propias de la cuidadora y de la persona de relevo ================= */
  const NIVEL_TXT = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja' };
  const dato = (val, lab) => `<div class="tl"><b class="mono">${val}</b><span>${esc(lab)}</span></div>`;
  function renderMia() {
    const c = casoById(leerId('mientras-mi-caso'));
    if (!c) {
      $('#mia-body').innerHTML = `<div class="hero-rol">${personaje('bienvenida', 'hero-img')}
        <h2>¿Cuidas a alguien muchas horas a la semana?</h2>
        <p>Mientras te da horas de relevo: una persona capacitada cuida a tu familiar mientras tú descansas o resuelves tus pendientes.</p>
        <button type="button" class="btn-primary wide" data-action="new-sol">Solicitar relevo</button>
        <p class="complementario">${esc(CP.aviso_complementario)}</p></div>`;
      return;
    }
    const v = valDe(c), hz = horasDe(c);
    const r = c.estado === 'activo' && c.asignacion && relById(c.asignacion.relevoId);
    const estado = r ? `Con relevo: <b>${esc(r.nombre)}</b>` : c.estado === 'espera' ? (hz.cola ? 'En espera: este mes no alcanzó la bolsa de horas' : 'En espera de que el programa te asigne relevo') : ESTADO[c.estado];
    $('#mia-body').innerHTML = `<div class="card panel mia">
        <div class="mia-top"><span>Tu solicitud · ${esc(c.alcaldia)}</span><span class="mono">${esc(c.folio)}</span></div>
        <h2>${NIVEL_TXT[v.nivel]}</h2>
        <p class="sub">${estado}</p>
        <div class="tiles dos">${dato(hz.mes + '<small>h</small>', 'de relevo al mes')}${dato('≈ ' + hz.sem + '<small>h</small>', 'a la semana')}</div>
        ${enRevision(c) ? '<p class="sub">Una persona del programa revisará algunas respuestas. Tu lugar en la fila no cambia.</p>' : ''}
      </div>
      <p class="complementario">${esc(CP.aviso_complementario)}</p>
      <button type="button" class="btn-ghost wide" data-action="mia-nueva">Hacer otra solicitud (demostración)</button>`;
  }
  function renderYo() {
    const r = relById(leerId('mientras-mi-relevo'));
    if (!r) {
      $('#yo-body').innerHTML = `<div class="hero-rol">${personaje('media', 'hero-img')}
        <h2>¿Quieres trabajar dando relevo?</h2>
        <p>Registras tus días, horario y zona. El programa te asigna casos según su prioridad: no eliges familia ni la familia te elige. Trabajo con contrato, IMSS y pago al piso legal.</p>
        <button type="button" class="btn-primary wide" data-action="new-relevo">Registrarme</button></div>`;
      return;
    }
    const aprob = store.aprobado(r), carga = RV.cargaDe(r.id, store.state);
    const casos = store.state.casos.filter((c) => c.estado === 'activo' && c.asignacion && c.asignacion.relevoId === r.id);
    const ver = r.verificacion || {};
    const estado = !aprob ? (ver.estado === 'rechazada' ? 'Registro rechazado' : 'En revisión: el programa valida tus documentos') : r.certificacion === 'certificada' ? 'Aprobada y certificada' : 'Aprobada · falta certificación para recibir casos';
    $('#yo-body').innerHTML = `<div class="card panel mia">
        <div class="mia-top"><span>Tu registro · ${esc(r.alcaldia)}</span><span class="mono">${esc(diasTxt(r.dias))}</span></div>
        <h2>${esc(r.nombre)}</h2>
        <p class="sub">${estado}</p>
        <div class="tiles dos">${dato(carga + '<small>/' + r.horasMax + ' h</small>', 'por semana')}${dato(casos.length, casos.length === 1 ? 'caso' : 'casos')}</div>
      </div>
      <button type="button" class="btn-ghost wide" data-action="yo-nuevo">Registrar a otra persona (demostración)</button>`;
  }

  /* ================= Bienvenida (primera vez que se abre la app) =================
   * Pantalla de carga con el logo y, después, «¿Cómo vas a usar Mientras?» para elegir el rol.
   * Se muestra una sola vez (localStorage «mientras-intro»); se puede repetir con ?intro o desde Ajustes. */
  const INTRO_K = 'mientras-intro';
  function abrirIntro() {
    const el = $('#intro');
    el.hidden = false; el.classList.remove('fuera', 'elegir');
    const lenta = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { el.classList.add('elegir'); const b = $('#intro .intro-opc button'); if (b) b.focus(); }, lenta ? 1700 : 200);
  }
  $('#intro').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-intro]'); if (!b) return;
    try { localStorage.setItem(INTRO_K, '1'); } catch (err) { /* sin almacenamiento */ }
    cambiarRol(b.dataset.intro);
    const el = $('#intro'); el.classList.add('fuera');
    setTimeout(() => { el.hidden = true; }, 350);
  });
  $('#cfg-intro').addEventListener('click', abrirIntro);

  /* ================= Render general ================= */
  function render() {
    plan = calcularPlan();
    $('#brandline').textContent = `${CP.nombre} · ${CP.eslogan}`;
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'view-' + ui.view; });
    $$('#rolbar button').forEach((b) => { const on = b.dataset.rol === ui.rol; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('.tabbar').hidden = ui.rol !== 'programa';
    $$('.tabbtn').forEach((t) => { const on = t.dataset.view === ui.view; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('#topTitle').textContent = TITULOS[ui.view];
    $('#topTag').textContent = ui.view === 'seguimiento' ? { prog: 'programa', hoy: 'visitas', caso: 'red y semana', mapa: 'territorio', kpi: 'simulado' }[ui.segSub] : '';
    renderAjustes();
    if (ui.view === 'mia') renderMia();
    else if (ui.view === 'yo') renderYo();
    else if (ui.view === 'casos') renderCasos();
    else if (ui.view === 'relevos') renderRelevos();
    else if (ui.view === 'seguimiento') renderSeguimiento();
  }
  function tick() { const d = new Date(); $('#clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

  store.subscribe(render);
  initForms();
  tick(); setInterval(tick, 30000);
  show(location.hash.slice(1));
  let introVista = '';
  try { introVista = localStorage.getItem(INTRO_K) || ''; } catch (e) { /* sin almacenamiento */ }
  if (!introVista || /[?&]intro\b/.test(location.search)) abrirIntro();
})();
