/* Interfaz de RedCare: casos (con solicitud, entrevista y resultado), personas de relevo, seguimiento
 * (programa, visitas, red, KPI) y ajustes. Listas de una mirada; el detalle se abre al tocar cada tarjeta.
 * Cambio 20 oct 2026: la canalización con 3 preguntas y la regla de 40 h se sustituyen por solicitud con dos vías
 * de entrada, entrevista de valoración, puntaje provisional, tres niveles y reparto de una bolsa de horas. */
(function () {
  'use strict';

  Care.store.load();
  const { ZONAS, TIPOS_INCIDENTE, store, red, legal, relevo: RV, fechas: F, prioridad: PR, CONFIG_PROGRAMA: CP, contrato: CT, huella: HU } = Care;
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
  const ui = { rol: rolGuardado, estilo: 'pop', view: 'casos', casoFiltro: 'todos', relFiltro: 'aprobada', segSub: 'caso', dia: F.hoyISO(), scCaso: '', apagado: false, objetivo: null };

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
  const NV_CSS = { dentro: 'p1', fuera: 'np' }; // reutiliza los estilos de prioridad
  const primeraAsignacion = (c) => (c.asignacion ? ((c.asignacion.historial || [])[0] || {}).desde || c.asignacion.fecha : null);
  const bolsa = () => (cfg().bolsaSim != null ? cfg().bolsaSim : CP.presupuesto_horas_mes);
  function valorar(entrevista, sexo, fecha, hasta) {
    const v = PR.puntuar(Object.assign({}, entrevista.modelo, { sexo }), CP);
    const ef = PR.puntajeEfectivo(v.base, v.dentro ? PR.semanasEnCola(fecha, hasta || F.hoyISO()) : 0, CP); // fuera de la regla no hay cola ni espera
    return Object.assign(v, ef, { nivel: PR.nivel(v.base, CP), barthel: PR.totalBarthel(entrevista.barthel), zarit: PR.totalZarit(entrevista.zarit, CP), regla: PR.reglaHoras(entrevista.modelo.horas) });
  }
  const valDe = (c) => valorar(c.entrevista, c.cuidadora.sexo, c.fecha, primeraAsignacion(c));
  const enPlan = (c) => c.estado !== 'cerrado' && c.entrevista;
  /** Reparto de la bolsa entre todos los casos valorados que no están cerrados. `extra`: caso aún no guardado. */
  function calcularPlan(extra) {
    const cs = store.state.casos.filter(enPlan).map((c) => ({ c, v: valDe(c) })).filter((x) => x.v.nivel === 'dentro').map((x) => ({ id: x.c.id, efectivo: x.v.efectivo }));
    if (extra) cs.push(extra);
    const r = PR.asignarHoras(cs, CP, bolsa());
    r.sem = {}; Object.keys(r.horas).forEach((id) => { r.sem[id] = PR.horasSemana(r.horas[id], CP); });
    return r;
  }
  let plan = calcularPlan();
  const horasDe = (c) => ({ mes: plan.horas[c.id] || 0, sem: plan.sem[c.id] || 0, cola: plan.en_cola.includes(c.id), fuera: valDe(c).nivel === 'fuera' });
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

  /* Personajes propios de la app (26 oct 2026; generados con build_personajes_app.py). Los tres resultados muestran
   * relevo ocurriendo: cambian quién cuida y a quién se cuida, no cuánto sufre la cuidadora, para que la imagen no
   * funcione como semáforo de necesidad. Son ilustración: no son datos ni personas reales. */
  const ILU = 'observatorio/ilustraciones/';
  const PERSONAJE = {
    bienvenida: ILU + 'bienvenida_relevo.webp', alta: ILU + 'resultado_alta.webp', media: ILU + 'resultado_media.webp',
    baja: ILU + 'resultado_baja.webp', dentro: ILU + 'resultado_alta.webp', fuera: ILU + 'resultado_baja.webp', relevo: ILU + 'relevo_equipo.webp',
  };
  const personaje = (k, cls) => `<img class="personaje ${cls || ''}" src="${PERSONAJE[k]}" alt="" loading="lazy">`;
  /* 21 nov 2026: la ilustración pasa a ser una «marca de agua» de un solo color, como el Ángel en los carteles de la CDMX. */
  const MONO = { bienvenida: 'bienvenida_relevo', alta: 'resultado_alta', media: 'resultado_media', baja: 'resultado_baja', dentro: 'resultado_alta', fuera: 'resultado_baja', relevo: 'relevo_equipo', puedo: 'puedo_cuidar' };
  /* 24 nov 2026: versiones de un solo color (lavanda sobre fondo claro, blanco sobre fondo oscuro), generadas desde las ilustraciones. */
  const fantasma = (k, tono) => `<img class="ghost" src="img/marca_agua/${MONO[k] || MONO.bienvenida}_${tono || 'lavanda'}.webp" alt="" aria-hidden="true">`;
  const banner = (k, inner, cls) => `<div class="gbanner ${cls || ''}">${fantasma(k)}<div class="gb-in">${inner}</div></div>`;

  /* ================= Navegación ================= */
  /* Cada rol ve solo lo suyo (24 oct 2026). La cuidadora no ve casos de otras familias; la persona de relevo
   * no ve a las demás personas de relevo; el programa ve todo. En el piloto, cada rol entraría con su cuenta. */
  const VISTAS_ROL = { cuidadora: ['mia'], relevo: ['yo'], programa: ['seguimiento', 'casos', 'relevos', 'ajustes'] };
  const VIEWS = VISTAS_ROL.programa;
  const TITULOS = { mia: 'Necesito relevo', yo: 'Puedo cuidar', casos: 'Casos', relevos: 'Personas de relevo', seguimiento: 'Red de cuidado', ajustes: 'Ajustes' };
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
    const filtro = (c) => ui.casoFiltro === 'todos' ? c.estado !== 'cerrado' : c.estado === ui.casoFiltro;
    const lista = casos.filter(filtro).slice().sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || valDe(b).efectivo - valDe(a).efectivo || a.fecha.localeCompare(b.fecha));
    const n = (e) => casos.filter((c) => c.estado === e).length;
    const rev = casos.filter((c) => enRevision(c) || apelAbiertas(c).length).length;
    $('#caso-count').innerHTML = `<b>${n('espera')}</b> en cola · <b>${n('activo')}</b> con relevo${rev ? ` · <b>${rev}</b> por revisar` : ''}`;
    $$('#caso-list .ccard').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 12)));
    $('#caso-list').innerHTML = lista.length ? lista.map(casoCard).join('') : '<div class="empty">Sin casos.</div>';
  }

  function casoCard(c) {
    const v = valDe(c), hz = horasDe(c), nv = NV_CSS[v.nivel];
    const r = c.asignacion && c.estado === 'activo' && relById(c.asignacion.relevoId);
    const inc = store.state.incidentes.filter((i) => i.casoId === c.id && i.estado === 'abierto').length;
    const marcas = '';
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
      <div class="facts f-cuida"><span><b>${pts(v.efectivo)}</b> h/sem${v.extra ? ` (${pts(v.base)} + ${pts(v.extra)} espera)` : ''}</span><span>${esc(canalTxt(c))}</span><span>${esc(c.alcaldia)}</span></div>
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

  /* Bloque de explicación: horas declaradas y regla de entrada. Lo usan el detalle y el resultado. */
  function factoresHTML(v) {
    return `<div class="regla ${v.dentro ? 'ok' : 'no'}"><b class="mono">${pts(v.horas)} h</b><span>${v.dentro ? 'Cumple' : 'No cumple'} la regla de ${CP.regla_horas} h por semana</span></div>`;
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
        ${tile(pts(v.efectivo) + '<small> h</small>', 'horas efectivas por semana', '', v.extra ? `<em>${pts(v.base)} + ${pts(v.extra)} espera</em>` : '<em>sin espera</em>')}
        ${tile(hz.mes + '<small>h</small>', 'al mes', '', `<em>${hz.fuera ? 'fuera de la regla: sin horas' : hz.cola ? 'en cola: bolsa agotada' : '≈ ' + hz.sem + ' h/sem'}</em>`)}
        ${tile(v.barthel == null ? '—' : String(v.barthel), 'Barthel', '', `<em>${esc(PR.nivelBarthel(v.barthel))}</em>`)}
      </div>

      ${PR.requiereEnfermeria(c.entrevista && c.entrevista.modelo) ? '<div class="slot">Requiere enfermería: orientar a un servicio de salud (el relevo no hace tareas clínicas)</div>' : ''}
      <p class="wk-n">Convenio: ${esc(firmaTxt(c.contrato))}<br>Consentimiento de ${esc(c.persona.alias)}: ${esc(c.consentimientoPersona ? CP_ESTADO[c.consentimientoPersona.estado] + (c.consentimientoPersona.tipo ? ' (' + c.consentimientoPersona.tipo + ')' : '') : 'sin registro')}</p>
      ${c.domicilio ? `<p class="wk-n">Domicilio (ficticio): ${esc(c.domicilio.texto)} · se borra al cerrar el caso</p>` : ''}
      ${(c.contactos || []).length ? `<p class="wk-n">Contactos: ${c.contactos.map((k) => `${k.tipo === 'emergencia' ? 'emergencia' : 'autorizada'} · ${esc(k.parentesco)}`).join('; ')}</p>` : ''}
      ${enRevision(c) ? `<p class="wk-n">En revisión: ${c.revision.motivos.map((m) => esc(m.txt.replace(/[.\s]+$/, ''))).join('; ')}.</p>` : ''}
      ${c.revision && c.revision.estado === 'revisada' ? `<p class="wk-n">Revisado ${esc(c.revision.fechaResolucion)}: ${esc(c.revision.nota)}</p>` : ''}

      ${apelAbiertas(c).length || (c.apelaciones || []).length ? `<section class="blk"><h5>Solicitudes de revisión</h5>
        ${(c.apelaciones || []).map((a) => `<div class="inc"><span class="badge ${a.estado === 'abierta' ? 'pendiente' : 'aprobada'}">${a.estado === 'abierta' ? 'Abierta' : 'Resuelta'}</span><span>${esc(a.motivo)}<small>${esc(a.fecha)}${a.resolucion ? ' · ' + esc(a.resolucion) : ''}</small></span>${a.estado === 'abierta' ? `<button type="button" class="btn-ghost sm" data-action="resolver-ap" data-id="${esc(c.id)}" data-ap="${esc(a.id)}">Resolver</button>` : ''}</div>`).join('')}
      </section>` : ''}

      ${pref ? `<section class="blk"><h5>${c.paquete ? 'Paquete · ' + c.paquete.horas + ' h/sem' : 'Preferencias para el relevo'}</h5>
        ${semana(pref.dias, ev ? `<b>${esc(ev.horario)}</b> · jornada ${esc(ev.tipo)} · $${ev.hora.toFixed(2)}/h` : `desde las ${esc(pref.inicio)}`)}
        <div class="tags">${tags(pref.tareas, 'alt')}</div>
        ${c.paquete && hz.sem && hz.sem !== c.paquete.horas ? `<p class="wk-n">El ciclo actual le da ${hz.sem} h/sem.</p>` : ''}
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
    if (c.estado !== 'cerrado' && !cpOk(c)) acc += A('cp-registrar', c.consentimientoPersona && c.consentimientoPersona.estado === 'por_acreditar' ? 'Acreditar representación' : 'Registrar consentimiento');
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
    if (res.propuesta) {
      const rp = res.propuesta.r;
      h += `<p class="wk-n">Convenio del hogar: ${esc(firmaTxt(c.contrato))}<br>Contrato de ${esc(rp.nombre)}: ${esc(firmaTxt(rp.contrato))}<br>Consentimiento de ${esc(c.persona.alias)}: ${esc(c.consentimientoPersona ? CP_ESTADO[c.consentimientoPersona.estado] : 'sin registro')}</p>`;
      if (!cpOk(c)) h += '<div class="warnbox">Falta el consentimiento de la persona cuidada o acreditar a su representante: regístralo desde el detalle del caso.</div>';
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
    const r = relById(ui.asig.relevoId);
    // 20 nov 2026: «por escrito» ya no es una casilla: se comprueba que los dos contratos estén firmados.
    return { jornadaOk: evalDe(c).ok, escrito: !!(c.contrato && r && r.contrato), imss: e.imss.checked, pagadorOk: !!RV.PAGADORES[c.pagador], motivo: e.motivo.value.trim(),
      personaOk: cpOk(c), acepta: e.acepta.checked };
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
    if (window.Interaccion) Interaccion.confeti();
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

  // La referencia se muestra para llamarle mientras el registro está en revisión; al resolverlo se borra (matriz D24).
  const refTxt = (ref) => (!ref ? '' : ref.nombre
    ? `<p class="wk-n">Referencia por verificar: <b>${esc(ref.nombre)}</b> · ${esc(ref.tel)}. Se borra al aprobar o rechazar.</p>`
    : `<p class="wk-n">Referencia ${ref.estado === 'verificada' ? 'verificada' : 'descartada'} ${esc(ref.fecha || '')}: nombre y teléfono borrados.</p>`);
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
      ${L.curp ? `<section class="blk"><h5>Documentos</h5><div class="docs"><span>CURP <b class="mono">••••••••••••••${esc(L.curp.ultimos4 || '')}</b></span><span>${esc(L.docId || 'sin identificación')}</span></div>
        ${refTxt(L.referencia)}${v.estado === 'rechazada' ? `<p class="wk-n">Motivo: ${esc(v.motivo)}</p>` : ''}</section>` : ''}
      <p class="wk-n">Contrato: ${esc(firmaTxt(r.contrato))}</p>
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
    else renderSegCaso(); // 21 nov 2026: se quitó la pestaña Mapa
  }
  segmento('#seg-sub', 'segSub', () => render());

  /* ---------- Programa: bolsa, niveles, puntajes por canal, revisión y apelaciones ---------- */
  function renderPrograma() {
    const s = store.state, cs = s.casos.filter(enPlan);
    const vals = cs.map((c) => ({ c, v: valDe(c), h: horasDe(c) }));
    const B = plan.presupuesto, minimos = vals.filter((x) => x.v.nivel === 'dentro').length * CP.horas_minimas;
    const dentro = vals.filter((x) => x.v.nivel === 'dentro').length, fuera = vals.length - dentro;
    const mM = Math.min(100, pct(Math.min(minimos, B), B)), mR = Math.max(0, Math.min(100 - mM, pct(plan.usado - Math.min(minimos, plan.usado), B)));
    // Una barra por canal: cuántas cuidadoras entran por la regla de 40 h y cuántas no (cuenta, no promedio).
    const filas = Object.keys(CP.canales).map((k) => {
      const g = vals.filter((x) => x.c.canal_origen === k);
      const d = g.filter((x) => x.v.base >= CP.regla_horas).length, f = g.length - d;
      return { k, n: g.length, d, f };
    }).filter((x) => x.n);
    const mx = Math.max(1, ...filas.map((x) => x.n));
    const canales = filas.map((x) => `<div class="cn"><span class="cn-t">${esc(CP.canales[x.k])}</span><span class="cn-bar" role="img" aria-label="${x.d} dentro de la regla, ${x.f} fuera"><i class="d" style="flex:${x.d}"></i><i class="f" style="flex:${x.f}"></i></span><b class="mono">${x.n}</b></div>`.replace('class="cn-bar"', `class="cn-bar" style="width:${Math.round((x.n / mx) * 100)}%"`)).join('');
    const rev = s.casos.filter(enRevision), aps = s.casos.filter((c) => apelAbiertas(c).length);
    const lnk = (c, txt) => `<button type="button" class="linkrow" data-action="ver-caso" data-id="${esc(c.id)}"><span class="mono">${esc(c.folio)}</span><span>${esc(txt)}</span></button>`;
    $('#prog-body').innerHTML = `
      <div class="card panel">
        <div class="eyebrow">Bolsa del mes · simulada</div>
        <div class="bolsa"><b class="mono">${plan.usado}</b><span>de ${B} h repartidas</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${mM}%"></div><div class="bar-fill b2" style="width:${mR}%"></div></div>
        <div class="bkey"><span><i class="k1"></i>mínimo garantizado ${Math.min(minimos, B)} h</span><span><i class="k2"></i>reparto extra</span></div>
        ${plan.capacidad_ok ? '' : `<div class="warnbox"><b>No alcanza para los mínimos.</b> ${plan.en_cola.length} caso(s) esperan.</div>`}
      </div>
      <div class="card panel">
        <div class="eyebrow">Cuidadoras por origen</div>
        <div class="cn-leg"><span><i class="d"></i>cuidan ${CP.regla_horas} h o más (${dentro})</span><span><i class="f"></i>menos de ${CP.regla_horas} h (${fuera})</span></div>
        ${canales || '<p class="sub">Sin casos.</p>'}
      </div>
      ${rev.length || aps.length ? `<div class="pend"><div class="eyebrow">Por revisar</div>${rev.map((c) => lnk(c, c.revision.motivos[0].txt)).join('')}${aps.map((c) => lnk(c, apelAbiertas(c)[0].motivo)).join('')}</div>` : ''}
      <button class="btn-ghost wide" data-action="aplicar-ciclo">Aplicar horas del ciclo</button>
      <p class="sub foot">${s.ultimoCiclo ? 'Último ciclo: ' + esc(s.ultimoCiclo) + '. ' : ''}Datos simulados.</p>`;
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
        <div class="qrow"><span>Trabajo o estudio</span><div class="chips radio">${[['si', 'Sí pude'], ['parcial', 'En parte'], ['no', 'No pude']].map(([k, t]) => `<label class="chip"><input type="radio" name="empleo" value="${k}"${ya && ya.empleo === k ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div></div>
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
      const c = f.elements.cansancio.value, n = f.elements.noches.value, emp = f.elements.empleo.value;
      if (c === '' || n === '' || !emp || +n < 0 || +n > 7) { toast('Responde las tres'); return; }
      store.addCheckin(ui.scCaso, +c, +n, emp); toast('Guardado');
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
    const vacio = () => { svg.innerHTML = ''; ['#fragScore', '#cobPct', '#horasSinCubrir'].forEach((q) => { $(q).textContent = '—'; }); $('#noteBox').textContent = ''; $('#nodeInfo').innerHTML = ''; $('#depList').innerHTML = ''; $('#redHead').innerHTML = ''; };
    if (!c) { vacio(); return; }
    const base = analisisHogar(c, null);
    if (!ui.objetivo || !base.porId[ui.objetivo] || !(base.out[ui.objetivo] > 0)) ui.objetivo = base.principal;
    const X = ui.objetivo, off = !!(ui.apagado && X);
    const a = analisisHogar(c, off ? X : null);
    red.dibujar(svg, a, X, off);
    $('#graphWrap').classList.toggle('off', off);
    const nom = X ? a.porId[X].nombre : '';
    const cl = fragClase(base.fragilidad);
    // Cuánto del cuidado que necesita el hogar llega hoy (o llegaría sin la persona apagada)
    const rec = (id) => a.rel.filter((r) => r.a === id && !(off && r.de === X)).reduce((t, r) => t + r.horas, 0);
    const deps = a.personas.filter((p) => p.id !== (off ? X : null) && a.need(p) > 0);
    const nec = deps.reduce((t, p) => t + a.need(p), 0), cub = deps.reduce((t, p) => t + Math.min(rec(p.id), a.need(p)), 0);
    const cob = nec ? Math.round((cub / nec) * 100) : 100;
    const ETQ = { r: 'Un solo sostén', a: 'Sostén parcial', n: 'Cuidado repartido' };
    $('#redHead').innerHTML = `<span class="gh-n"><b>${a.personas.length}</b> personas</span><span class="gh-n"><b>${base.sostenes.length}</b> cuidan</span><span class="gh-n"><b>${Math.round(base.total)}</b> h/sem</span><span class="gh-t t-${cl}">${ETQ[cl]}</span>`;
    $('#fragScore').textContent = off ? `${a.sinCuidado.length}/${a.dependientes}` : f2(a.fragilidad);
    $('#fragScore').className = 'mono ' + (off ? 'r' : fragClase(a.fragilidad));
    $('#fragLabel').textContent = off ? 'sin cuidado' : 'fragilidad';
    $('#cobPct').textContent = cob + '%';
    $('#cobPct').className = 'mono ' + (cob >= 100 ? 'n' : cob >= 60 ? 'a' : 'r');
    $('#horasSinCubrir').textContent = a.horasSinCubrir + ' h';

    // Ficha de la persona elegida
    const lista = (rs, k) => rs.map((r) => `<span class="pill"><span>${esc(a.porId[r[k]].nombre)}</span><b>${r.horas} h</b></span>`).join('');
    const da = a.rel.filter((r) => r.de === X), rb = a.rel.filter((r) => r.a === X && !(off && r.de === X));
    const P = X ? a.porId[X] : null;
    if (P) {
      const nP = a.need(P), rP = rec(X);
      const tag = off ? ['off', 'Apagada · simulación'] : P.pro ? ['pro', 'Relevo del programa'] : X === a.principal ? ['hub', 'Sostén principal'] : ['', 'Cuida'];
      $('#nodeInfo').innerHTML = `
        <div class="ni-top"><span class="ni-av ${P.pro ? 'pro' : X === a.principal ? 'hub' : ''}">${esc(P.nombre.charAt(0).toUpperCase())}</span>
          <div class="ni-id"><b>${esc(P.nombre)}</b><small>${esc((P.edad ? P.edad + ' años · ' : '') + P.rol)}</small></div><span class="ni-tag ${tag[0]}">${tag[1]}</span></div>
        <div class="ni-rows">
          <div><i>Cuida a</i><span class="pills">${lista(da, 'a') || '<em>a nadie</em>'}</span></div>
          <div><i>Recibe de</i><span class="pills">${lista(rb, 'de') || '<em>de nadie</em>'}</span></div>
          ${nP > 0 ? `<div><i>Necesita</i><span class="ni-cov"><span class="cbar"><i style="width:${Math.min(100, Math.round((rP / nP) * 100))}%"></i></span><b class="mono">${rP} de ${nP} h</b></span></div>` : ''}
        </div>
        <button type="button" class="${off ? 'btn-dark' : 'btn-alert'}" data-action="apagar">${off ? 'Restaurar' : 'Apagar a ' + esc(nom)}</button>`;
    } else $('#nodeInfo').innerHTML = '<p class="sub">Sin personas con horas de cuidado.</p>';

    // Quién necesita cuidado y cuánto recibe
    $('#depList').innerHTML = deps.length ? deps.map((p) => {
      const n = a.need(p), r = rec(p.id), pc = Math.min(100, Math.round((r / n) * 100)), k = r === 0 ? 'r' : r < n ? 'a' : 'n';
      return `<div class="dep"><span class="dn">${esc(p.nombre)}<small>${esc((p.edad ? p.edad + ' · ' : '') + p.rol)}</small></span><span class="cbar ${k}"><i style="width:${pc}%"></i></span><b class="mono">${r}/${n} h</b></div>`;
    }).join('') : '<p class="sub">Nadie necesita cuidado en este hogar.</p>';

    const note = $('#noteBox');
    note.classList.toggle('off', off);
    if (!X) note.textContent = '';
    else if (off) note.textContent = a.relevosSinX === 0 ? `Si falta ${nom}, nadie la cubre.` : a.horasSinCubrir === 0 ? `Si falta ${nom}, la red la cubre.` : `Si falta ${nom}, quedan ${a.horasSinCubrir} h sin cubrir (hoy: ${base.horasSinCubrir} h).`;
    else note.textContent = proDe(c) ? 'Toca a una persona para ver su ficha y apágala para simular una semana sin ella.' : 'Sin relevo del programa todavía. Toca a una persona para ver su ficha.';
  }
  $('#nodeInfo').addEventListener('click', (e) => { if (e.target.closest('[data-action="apagar"]')) { ui.apagado = !ui.apagado; drawRed(); } });
  function elegirNodo(g) { if (!g || !g.classList.contains('act')) return; ui.objetivo = g.dataset.id; drawRed(); try { $('#nodeInfo').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* sin soporte */ } }
  $('#graphSvg').addEventListener('click', (e) => elegirNodo(e.target.closest('.g-node')));
  // Al pasar sobre una persona se resaltan sus conexiones y se atenúa el resto.
  const gs = $('#graphSvg');
  function resalta(g) {
    gs.querySelectorAll('.on').forEach((x) => x.classList.remove('on'));
    if (!g) { gs.classList.remove('hl'); return; }
    const id = g.dataset.id; gs.classList.add('hl'); g.classList.add('on');
    gs.querySelectorAll('[data-de]').forEach((x) => { if (x.dataset.de === id || x.dataset.a === id) { x.classList.add('on'); [x.dataset.de, x.dataset.a].forEach((o) => { const n = gs.querySelector(`.g-node[data-id="${CSS.escape(o)}"]`); if (n) n.classList.add('on'); }); } });
  }
  gs.addEventListener('pointerover', (e) => resalta(e.target.closest('.g-node')));
  gs.addEventListener('pointerleave', () => resalta(null));
  gs.addEventListener('focusin', (e) => resalta(e.target.closest('.g-node')));
  gs.addEventListener('focusout', () => resalta(null));
  $('#graphSvg').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegirNodo(e.target.closest('.g-node')); } });

  /* 21 nov 2026: se quitó el mapa de Seguimiento (y su código). */

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
      ['Regla de referencia', `≥ ${RV.UMBRAL_HORAS} h/sem`, ''],
    ].map(([a, b, n]) => `<li><span>${esc(a)}<small>${esc(n)}</small></span><b class="mono">${esc(b)}</b></li>`).join('');
    if (document.activeElement !== $('#cfg-bolsa')) $('#cfg-bolsa').value = bolsa();
    $('#cfg-bolsa-val').textContent = bolsa().toLocaleString('es-MX') + ' h';
    $('#cfg-bolsa-nota').textContent = 'Solo simula; no cambia la bolsa real.';
    $('#cfg-prio').innerHTML = [
      ['Bolsa (presupuesto_horas_mes)', CP.presupuesto_horas_mes + ' h', 'ilustrativo'],
      ['Mínimo garantizado', CP.horas_minimas + ' h/mes', '≈ 3 h/sem'],
      ['Tope por hogar', CP.horas_maximas + ' h/mes', '≈ 12 h/sem'],
      ['Regla de entrada', `${CP.regla_horas} h o más a la semana`, ''],
      ['Envejecimiento', `+${CP.envejecimiento.horas_por_semana} h/sem · tope ${CP.envejecimiento.tope_envejecimiento} h`, 'provisional, solo ordena el reparto'],
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
    $$('dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    $$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  }

  /* ================= Contratos (20 nov 2026; texto en js/contrato.js) =================
   * Primero un resumen de una pantalla; el texto completo va plegado. Se guarda solo el registro de la firma. */
  function contratoHTML(doc) {
    return `<div class="ct">
      <p class="ct-tit"><b>${esc(doc.titulo)}</b><small class="mono">${esc(doc.version)}</small></p>
      <dl class="ct-res">${doc.resumen.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <details class="ct-full"><summary>Leer el texto completo (${doc.clausulas.length} cláusulas)</summary>
        ${doc.clausulas.map((c) => `<p><b>${esc(c.t)}.</b> ${esc(c.txt)}</p>`).join('')}
        <p class="wk-n">Borrador para el prototipo. No está dictaminado jurídicamente.</p>
      </details></div>`;
  }
  const firmaTxt = (f) => (f ? `${f.metodo === 'simulado' ? 'Firma simulada' : 'Firmado'} por ${f.firmante} · ${String(f.fecha).slice(0, 10)} · ${f.version}${f.huellaTexto ? ' · huella ' + f.huellaTexto.slice(0, 8) : ''}` : 'Sin firma');

  /* ================= Solicitud de relevo ("Necesito cuidado") =================
   * Entrada (autorregistro o referencia) → Registro → Consentimiento → Entrevista (3 bloques) → Resultado
   * (puntaje, nivel, horas estimadas, factores, solicitar revisión, canal alterno) → entra a la cola.
   * Minimización: solo se pide lo que usa el puntaje o la asignación. Sin CURP, sin diagnósticos, sin edad. */
  const PASOS = [
    { id: 'entrada', t: 'Cómo llega' }, { id: 'registro', t: 'Registro' }, { id: 'consentimiento', t: 'Consentimiento' },
    { id: 'persona', t: 'Persona cuidada' }, // 20 nov 2026: consentimiento de la persona cuidada (matriz D20)
    { id: 'modelo', t: 'Entrevista 1/3' }, { id: 'zarit', t: 'Entrevista 2/3' }, { id: 'barthel', t: 'Entrevista 3/3' }, { id: 'resultado', t: 'Resultado' },
    { id: 'contrato', t: 'Convenio' }, // 20 nov 2026: se firma al terminar el registro
  ];
  const nuevaSol = () => ({
    canal: '', institucion: '', quien: '', presente: false, alias: '', sexo: '', palias: '', psexo: '', alcaldia: '',
    aviso: false, expreso: false, modelo: { horas: '', enfermeria: null }, zarit: {}, barthel: {},
    pref: { dias: [], inicio: '09:00', tareas: [] }, apelacion: null, firma: false,
    cp: { via: '', acepta: false, tipo: '', acredita: false },
  });
  const CP_TIPOS = ['Representación legal o tutela', 'Persona de apoyo designada', 'Poder notarial'];
  /** Estado del consentimiento de la persona cuidada que se guarda en el caso (sin identidad del representante). */
  const cpEstado = (cp, hoy) => ({ via: cp.via, tipo: cp.via === 'representante' ? cp.tipo : null,
    estado: cp.via === 'propio' ? 'otorgado' : cp.via === 'representante' ? 'por_acreditar' : 'pendiente', fecha: hoy });
  const CP_ESTADO = { otorgado: 'Otorgado por la persona cuidada', acreditado: 'Representación acreditada', por_acreditar: 'Representación por acreditar', pendiente: 'Pendiente: se pide en la primera visita' };
  const cpOk = (c) => !!(c.consentimientoPersona && ['otorgado', 'acreditado'].includes(c.consentimientoPersona.estado));
  /** Sin consentimiento de la persona cuidada no se pregunta el Barthel: el paso se salta. */
  const saltar = (id) => id === 'barthel' && ui.sol && ui.sol.d.cp.via === 'pendiente';
  function mover(dir) {
    do { ui.sol.paso += dir; } while (ui.sol.paso > 0 && ui.sol.paso < PASOS.length - 1 && saltar(PASOS[ui.sol.paso].id));
  }
  const radio = (name, val, lab, on) => `<label class="chip"><input type="radio" name="${name}" value="${esc(val)}"${on ? ' checked' : ''}><span>${lab}</span></label>`;
  const check = (name, val, lab, on) => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(val)}"${on ? ' checked' : ''}><span>${esc(lab)}</span></label>`;
  const sinoChips = (name, v) => radio(name, 'si', 'Sí', v === true) + radio(name, 'no', 'No', v === false);
  const codigo = () => '';
  // 20 nov 2026: la entrevista guarda solo horas y «requiere enfermería» (sin actividades básicas ni lista de tareas de salud).
  const entrevistaDe = (d) => ({ modelo: PR.minimizarModelo(d.modelo),
    zarit: PR.totalZarit(d.zarit, CP) == null ? null : Object.assign({}, d.zarit), barthel: Object.assign({}, d.barthel) });

  function pintaPaso() {
    const d = ui.sol.d, paso = PASOS[ui.sol.paso];
    $('#sol-paso').textContent = `${ui.sol.paso + 1}/${PASOS.length} · ${paso.t}`;
    $('#sol-bar').style.width = Math.round(((ui.sol.paso + 1) / PASOS.length) * 100) + '%';
    $('#sol-atras').textContent = ui.sol.paso ? 'Atrás' : 'Cancelar';
    $('#sol-sig').textContent = paso.id === 'contrato' ? 'Firmar y enviar' : paso.id === 'consentimiento' ? 'Acepto y sigo' : 'Siguiente';
    $('#sol-err').textContent = '';
    let h = '';
    if (paso.id === 'entrada') {
      h = `${banner('bienvenida', `<span class="rx-kick">Necesito relevo</span><h3 class="marca">${esc(CP.nombre)}</h3><p class="eslogan">${esc(CP.eslogan)}</p>`)}
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
      h = `<h3>Registro</h3><p class="sub">Solo lo necesario. Sin CURP, diagnósticos ni domicilio.</p>
        <div class="eyebrow sep">Quien cuida</div>
        <div class="row-sx"><div class="chips radio">${['M', 'H'].map((v) => `<label class="chip ico"><input type="radio" name="sexo" value="${v}"${d.sexo === v ? ' checked' : ''}><span>${SX[v]}${SEXO_TXT[v]}</span></label>`).join('')}</div>
          <input name="alias" maxlength="24" autocomplete="off" placeholder="Alias o apodo (sin apellidos)" aria-label="Alias de quien cuida" value="${esc(d.alias)}"></div>
        <div class="eyebrow sep">Persona cuidada</div>
        <div class="row-sx"><div class="chips radio">${['M', 'H'].map((v) => `<label class="chip ico"><input type="radio" name="psexo" value="${v}"${d.psexo === v ? ' checked' : ''}><span>${SX[v]}${SEXO_TXT[v]}</span></label>`).join('')}</div>
          <input name="palias" maxlength="24" autocomplete="off" placeholder="Alias o apodo (sin apellidos)" aria-label="Alias de la persona cuidada" value="${esc(d.palias)}"></div>
        <label class="fld">Alcaldía (para asignar relevo cerca)<select name="alcaldia"><option value="">Elige…</option>${options(Object.keys(ZONAS), d.alcaldia)}</select></label>`;
    } else if (paso.id === 'consentimiento') {
      h = `<h3>Consentimiento</h3>
        <p class="sub">Te preguntaremos cuánto cuidas y cómo está la persona que cuidas. Son <b>datos sensibles</b>: se usan solo para tu prioridad y para asignar relevo. Puedes retirar tu consentimiento cuando quieras.</p>
        <button type="button" class="link" data-action="ver-aviso">Leer el aviso de privacidad</button>
        <label class="check"><input type="checkbox" name="aviso"${d.aviso ? ' checked' : ''}><span>Leí el aviso de privacidad</span></label>
        <label class="check"><input type="checkbox" name="expreso"${d.expreso ? ' checked' : ''}><span>Acepto de forma expresa que se registren datos sobre mi salud, mi carga de cuidado y la dependencia de la persona que cuido</span></label>`;
    } else if (paso.id === 'modelo') {
      const m = d.modelo;
      h = `<h3>Tu cuidado</h3>        <label class="fld">${esc(PR.PREGUNTAS_MODELO[0].txt)} ${codigo('P6_7 + P6_26')}<input name="horas" type="number" min="0" max="168" inputmode="numeric" value="${esc(m.horas)}"></label>
        <div class="fld">${esc(PR.PREGUNTAS_MODELO[1].txt)} ${codigo('P6_2 · salud')}<div class="chips radio">${sinoChips('enfermeria', m.enfermeria)}</div>
          <small class="hint">Solo se guarda sí o no. La persona de relevo no hace tareas de salud: si dices que sí, te orientamos a enfermería.</small></div>`;
    } else if (paso.id === 'zarit') {
      h = `<h3>Cómo te has sentido</h3>
        <p class="sub">Pensando en el último mes. Es opcional y no cambia tu prioridad.</p>
        ${PR.reactivosZarit(CP).map((it) => `<div class="fld zq">${esc(it.txt)}<div class="chips radio">${PR.ESCALA_ZARIT.map((t, n) => radio(it.id, n, esc(t), String(d.zarit[it.id]) === String(n))).join('')}</div></div>`).join('')}
        <p class="sub" id="zarit-total"></p>`;
    } else if (paso.id === 'barthel') {
      h = `<h3>La persona que cuidas</h3>        ${PR.BARTHEL.map((it) => `<div class="fld">${esc(it.txt)}<div class="chips radio">${it.niveles.map(([p, t]) => radio(it.id, p, esc(t), String(d.barthel[it.id]) === String(p))).join('')}</div></div>`).join('')}
        <p class="sub" id="barthel-total"></p>`;
    } else if (paso.id === 'persona') {
      const p = esc(d.palias), cp = d.cp;
      h = `<h3>${p}</h3>
        <p class="sub">El Barthel y el relevo son sobre ${p} y ocurren en su casa. Por eso también necesitamos su consentimiento, no solo el tuyo.</p>
        <div class="vias">
          <label class="via"><input type="radio" name="cpvia" value="propio"${cp.via === 'propio' ? ' checked' : ''}><span><b>${p} está aquí y decide</b><small>Lo marca ella o él</small></span></label>
          <label class="via"><input type="radio" name="cpvia" value="representante"${cp.via === 'representante' ? ' checked' : ''}><span><b>${p} no puede expresar su voluntad</b><small>Yo la o lo represento</small></span></label>
          <label class="via"><input type="radio" name="cpvia" value="pendiente"${cp.via === 'pendiente' ? ' checked' : ''}><span><b>${p} no está ahora</b><small>Se le pregunta en la primera visita</small></span></label>
        </div>
        ${cp.via === 'propio' ? `<button type="button" class="link" data-action="ver-aviso">Leer el aviso de privacidad</button>
          <label class="check"><input type="checkbox" name="cpacepta"${cp.acepta ? ' checked' : ''}><span>Soy ${p}. Acepto recibir relevo en mi casa y que se registre cómo hago mis actividades diarias. Puedo retirar mi consentimiento cuando quiera.</span></label>` : ''}
        ${cp.via === 'representante' ? `<label class="fld">Tipo de representación<select name="cptipo"><option value="">Elige…</option>${options(CP_TIPOS, cp.tipo)}</select></label>
          <label class="check"><input type="checkbox" name="cpacredita"${cp.acredita ? ' checked' : ''}><span>Mostraré el documento en la primera visita. Sin él no se asigna relevo.</span></label>` : ''}
        ${cp.via === 'pendiente' ? `<p class="wk-n">No te preguntaremos por la dependencia de ${p} (Barthel) hasta tener su consentimiento, y no se asigna relevo antes.</p>` : ''}`;
    } else if (paso.id === 'contrato') {
      h = `<h3>Convenio</h3>
        <p class="sub">Lee el resumen. Al firmar aceptas el convenio con el alias «${esc(d.alias)}»; la identidad se verifica en la primera visita.</p>
        ${contratoHTML(docConvenio(d))}
        <label class="check"><input type="checkbox" name="firma"${d.firma ? ' checked' : ''}><span>Leí el convenio y lo firmo como «${esc(d.alias)}»</span></label>`;
    } else {
      const ent = entrevistaDe(d);
      const v = valorar(ent, d.sexo, F.hoyISO());
      const est = calcularPlan(v.nivel === 'dentro' ? { id: '__nuevo', efectivo: v.efectivo } : null);
      const hMes = est.horas.__nuevo || 0;
      const ch = PR.chequeos(ent, CP);
      const st = estadoSimple(v.nivel, hMes, !hMes && v.nivel === 'dentro');
      const tec = ui.rol === 'programa' ? `<p class="rx-tec">${v.nivel === 'dentro' ? 'Entra a la bolsa' : 'No entra a la bolsa'} · cuida ${pts(v.base)} h a la semana</p>` : '';
      const notas = [];
      if (ent.modelo.enfermeria) notas.push(['salud', 'Tareas de salud', 'El relevo no da medicinas ni hace curaciones: te orientamos a enfermería.']);
      if (ch.length) notas.push(['rev', 'Una persona revisará tu caso', ch.map((x) => x.txt).join(' ')]);
      if (v.nivel === 'fuera') notas.push(['apoyo', 'Apoyo cerca de ti', `Redes de personas cuidadoras y centros de día públicos en ${d.alcaldia || 'tu alcaldía'}, y el módulo del Sistema Público de Cuidados.`]);
      h = `${heroRes(st, hMes, PR.horasSemana(hMes, CP), fantasma(v.nivel, 'blanco'), tec)}
        ${notas.map(([k, t, x]) => `<div class="rx-note rx-${k}"><b>${esc(t)}</b><span>${esc(x)}</span></div>`).join('')}
        <div class="rx-apela">${d.apelacion ? `<span>Revisión solicitada: «${esc(d.apelacion)}»</span>` : '<span>¿No estás de acuerdo con el resultado?</span>'}
          <button type="button" class="link" data-action="sol-apelar">${d.apelacion ? 'Cambiar motivo' : 'Pedir revisión'}</button></div>
        <div class="eyebrow sep">¿Cuándo te sirve el relevo?</div>
        <div class="chips">${RV.DIAS.map((t, i) => check('pdias', i, t, d.pref.dias.includes(i))).join('')}</div>
        <label class="fld">Desde las<input name="pinicio" type="time" step="1800" value="${esc(d.pref.inicio)}"></label>
        <div class="fld">¿Con qué te ayudaría la persona de relevo?<div class="chips">${RV.TAREAS.map((t) => check('ptareas', t, t, d.pref.tareas.includes(t))).join('')}</div></div>`;
    }
    $('#sol-body').innerHTML = h;
    totalesSol();
    $('#dlg-sol').scrollTop = 0;
  }
  function totalesSol() {
    const d = ui.sol.d;
    const z = $('#zarit-total'), b = $('#barthel-total');
    if (z) { const n = Object.keys(d.zarit).length, t = PR.totalZarit(d.zarit, CP); z.textContent = n ? `${n} de ${CP.zarit.n_reactivos} respondidas` : ''; }
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
      d.modelo.horas = val('horas'); const enf = val('enfermeria'); d.modelo.enfermeria = enf === 'si' ? true : enf === 'no' ? false : null;
    } else if (id === 'zarit') { PR.reactivosZarit(CP).forEach((it) => { const v = val(it.id); if (v !== '') d.zarit[it.id] = +v; }); }
    else if (id === 'barthel') { PR.BARTHEL.forEach((it) => { const v = val(it.id); if (v === '') delete d.barthel[it.id]; else d.barthel[it.id] = +v; }); }
    else if (id === 'contrato') { d.firma = !!(e.firma && e.firma.checked); }
    else if (id === 'persona') {
      const via = val('cpvia'), cambio = via !== d.cp.via;
      d.cp.via = via; d.cp.acepta = !!(e.cpacepta && e.cpacepta.checked); d.cp.tipo = val('cptipo'); d.cp.acredita = !!(e.cpacredita && e.cpacredita.checked);
      if (via === 'pendiente') d.barthel = {};
      if (cambio) pintaPaso(); // muestra las casillas de la opción elegida
    }
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
      if (/\d{3,}|@/.test(d.alias + ' ' + d.palias)) return 'El alias no lleva teléfono, correo ni números: usa un apodo.';   // 11 nov 2026: minimización de datos
    } else if (id === 'consentimiento') {
      if (!d.aviso || !d.expreso) return 'Sin consentimiento expreso no se puede hacer la entrevista.';
    } else if (id === 'modelo') {
      const h = d.modelo.horas;
      if (h === '' || isNaN(+h) || +h < 0 || +h > 168) return 'Escribe las horas a la semana (0 a 168).';
      if (typeof d.modelo.enfermeria !== 'boolean') return 'Responde si haces alguna tarea de salud.';
    } else if (id === 'zarit') {
      const n = Object.keys(d.zarit).length;
      if (n && n < CP.zarit.n_reactivos) return `Responde las ${CP.zarit.n_reactivos} preguntas o deja el bloque vacío.`;
    } else if (id === 'barthel') {
      if (d.cp.via !== 'pendiente' && PR.totalBarthel(d.barthel) == null) return 'Responde las 10 actividades.';
    } else if (id === 'contrato') {
      if (!d.firma) return 'Para enviar la solicitud hay que firmar el convenio.';
    } else if (id === 'persona') {
      if (!d.cp.via) return 'Elige una opción.';
      if (d.cp.via === 'propio' && !d.cp.acepta) return 'La persona cuidada tiene que marcar que acepta.';
      if (d.cp.via === 'representante' && (!d.cp.tipo || !d.cp.acredita)) return 'Elige el tipo de representación y confirma que la acreditarás.';
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
  /** Convenio con los datos de esta solicitud: horas estimadas, tareas y días preferidos. */
  function docConvenio(d) {
    const ent = entrevistaDe(d), v = valorar(ent, d.sexo, F.hoyISO());
    const est = calcularPlan(v.nivel === 'dentro' ? { id: '__nuevo', efectivo: v.efectivo } : null);
    const hMes = est.horas.__nuevo || 0;
    return CT.convenioServicio({ folio: null, alias: d.alias, palias: d.palias, alcaldia: d.alcaldia, horasMes: hMes, horasSemana: PR.horasSemana(hMes, CP),
      dentro: v.nivel === 'dentro', enfermeria: ent.modelo.enfermeria, consentimientoPersona: d.cp.via, tareas: d.pref.tareas, dias: d.pref.dias.map((i) => RV.DIAS[i]), inicio: d.pref.inicio });
  }
  function guardarSol() {
    const d = ui.sol.d, hoy = F.hoyISO(), ent = entrevistaDe(d);
    const ch = PR.chequeos(ent, CP);
    const caso = {
      id: store.uid('k'), folio: store.nextFolio(), fecha: hoy, alcaldia: d.alcaldia, estado: 'espera',
      canal_origen: d.canal, referencia: d.canal === 'referencia' ? { institucion: d.institucion, quien: d.quien, fecha: hoy } : null,
      cuidadora: { alias: d.alias, sexo: d.sexo, horas: ent.modelo.horas },
      persona: { alias: d.palias, sexo: d.psexo || null },
      entrevista: ent,
      consentimiento: { expreso: true, aviso: CP.version_aviso || '2026-11-21', fecha: hoy },
      contrato: CT.firmar(docConvenio(d), d.alias, Care),
      consentimientoPersona: cpEstado(d.cp, hoy),
      hogar: Care.buildHogar({ cuidadora: { nombre: d.alias, rol: 'cuidadora', horas: ent.modelo.horas }, cuidada: { nombre: d.palias, rol: 'familiar' } }),
      preferencias: { dias: d.pref.dias.slice(), inicio: d.pref.inicio, tareas: d.pref.tareas.slice() },
      pagador: 'subsidio', pctSubsidio: 0, asignacion: null,
      apelaciones: d.apelacion ? [{ id: store.uid('ap'), fecha: hoy, motivo: d.apelacion, estado: 'abierta' }] : [],
      revision: ch.length ? { estado: 'pendiente', motivos: ch, fecha: hoy } : null,
    };
    store.addSolicitud(caso);
    $('#dlg-sol').close();
    if (ui.rol === 'cuidadora') { guardarId('mientras-mi-caso', caso.id); show('mia'); toast(`Solicitud ${caso.folio} enviada`); if (window.Interaccion) Interaccion.confeti(); return; }
    ui.casoFiltro = 'espera';
    $$('#caso-filter button').forEach((x) => x.classList.toggle('on', x.dataset.val === 'espera'));
    show('casos');
    const v = valDe(caso);
    if (window.Interaccion) Interaccion.confeti();
    toast(`${caso.folio} · nivel ${PR.NIVEL[v.nivel]}${ch.length ? ' · a revisión humana' : ''}`);
  }
  ['input', 'change'].forEach((ev) => $('#form-sol').addEventListener(ev, leerPaso));
  $('#form-sol').addEventListener('submit', (e) => {
    e.preventDefault();
    leerPaso();
    const err = errorPaso();
    if (err) { $('#sol-err').textContent = err; return; }
    if (PASOS[ui.sol.paso].id === 'contrato') { guardarSol(); return; }
    mover(1); pintaPaso();
  });
  $('#sol-atras').addEventListener('click', () => { if (!ui.sol.paso) { $('#dlg-sol').close(); return; } leerPaso(); mover(-1); pintaPaso(); });

  /* ---------- Registrar persona de relevo ---------- */
  function openRelevo() {
    const f = $('#form-relevo'); f.reset(); $('.form-error', f).textContent = '';
    ui.relFirma = null;
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
      tareas: checked(f, 'tareas'), curp, docId: e.docId.value, refNombre: e.refNombre.value, refTel: e.refTel.value,
      privacidad: e.privacidad.checked, veracidad: e.veracidad.checked, duplicada: v.ok && store.existeRelevoCURP(v.curp), curpOk: v.ok, edad: v.edad,
    };
  }
  /** Contrato de trabajo con los datos que lleva capturados el registro. */
  const docTrabajo = (d) => CT.contratoTrabajo({ nombre: d.nombre, alcaldia: d.alcaldia, dias: d.diasSel.map((i) => RV.DIAS[i]), desde: d.desde, hasta: d.hasta, horasMax: d.horasMax, tareas: d.tareas });
  function refreshRelevo() {
    const d = datosRelevo();
    // La firma vale solo para el texto que se firmó: si cambian nombre, horario, días o tareas, hay que volver a firmar.
    d.contrato = !!(ui.relFirma && CT.verificar(ui.relFirma, docTrabajo(d), Care));
    const est = $('#rel-ct-estado');
    if (est) est.textContent = d.contrato ? firmaTxt(ui.relFirma) : ui.relFirma ? 'Cambiaste datos del contrato: vuelve a firmarlo' : 'Sin firmar';
    const reqs = legal.requisitosRelevo(d);
    if (!d.nombre) reqs.unshift({ ok: false, txt: 'Nombre' });
    if (!d.tareas.length) reqs.push({ ok: false, txt: 'Al menos una tarea' });
    pintaReqs($('#rel-reqs'), reqs);
    $('#rel-ok').disabled = legal.pendientes(reqs).length > 0;
  }
  ['input', 'change'].forEach((ev) => $('#form-relevo').addEventListener(ev, refreshRelevo));
  // Firma del contrato de trabajo: se lee el resumen y se firma escribiendo el mismo nombre del registro.
  $('#rel-ct-btn').addEventListener('click', () => {
    const d = datosRelevo();
    if (!d.nombre || !d.diasSel.length || !d.tareas.length) { $('.form-error', $('#form-relevo')).textContent = 'Antes de firmar: nombre, días y tareas.'; return; }
    $('.form-error', $('#form-relevo')).textContent = '';
    ui.relDoc = docTrabajo(d);
    $('#ct-body').innerHTML = contratoHTML(ui.relDoc);
    $('#form-contrato').reset(); $('#ct-err').textContent = '';
    $('#dlg-contrato').showModal(); $('#dlg-contrato').scrollTop = 0;
  });
  $('#form-contrato').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = datosRelevo().nombre, escrito = e.target.elements.firmaNombre.value;
    if (!CT.firmaCoincide(escrito, nombre)) { $('#ct-err').textContent = `Escribe «${nombre}», igual que en el registro.`; return; }
    ui.relFirma = CT.firmar(ui.relDoc, nombre, Care);
    $('#dlg-contrato').close();
    refreshRelevo();
  });
  $('#form-relevo').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#rel-ok').disabled) return;
    const d = datosRelevo(), nuevoId = store.uid('r');
    store.update((s) => s.relevos.unshift({
      id: nuevoId, nombre: d.nombre, sexo: d.sexo || null, alcaldia: d.alcaldia, dias: d.diasSel, desde: d.desde, hasta: d.hasta, horasMax: d.horasMax,
      tareas: d.tareas, certificacion: d.certificacion, experiencia: d.experiencia,
      // 20 nov 2026: la CURP se validó y se descarta; se guarda solo su huella y los últimos 4 caracteres (js/huella.js).
      legal: { curp: HU.curp(d.curp), mayorDeEdad: d.edad >= legal.EDAD_MIN, docId: d.docId, referencia: { nombre: d.refNombre.trim(), tel: d.refTel.replace(/\D/g, '') }, aceptado: new Date().toISOString() },
      contrato: ui.relFirma,
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
      case 'ver-aviso': { const dl = $('#dlg-aviso'); $('#aviso-body').innerHTML = Care.aviso.html(CP); dl.showModal(); dl.scrollTop = 0; break; }
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
      case 'mia-convenio': { const c = casoById(leerId('mientras-mi-caso')); if (c) await pedir(`${firmaTxt(c.contrato)}. Guardamos la huella del texto que firmaste, no una copia: si el texto cambia, la huella deja de coincidir.`, { ok: 'Entendido' }); break; }
      case 'mia-datos': { const c = casoById(leerId('mientras-mi-caso')); if (c) await pedir(`Lo que guardamos de ti: alias «${c.cuidadora.alias}», sexo, alcaldía ${c.alcaldia}, ${c.cuidadora.horas} h de cuidado a la semana, si haces tareas de salud (sí/no), tus respuestas de la entrevista y, cada semana, cansancio, noches de mal sueño y si pudiste trabajar o estudiar. De la persona cuidada: alias, sexo, su Barthel y su consentimiento.${c.domicilio ? ' Domicilio para las visitas (ficticio en este prototipo); se borra al cerrar el caso.' : ' Tu domicilio se pide solo cuando se te asigna relevo.'} Contactos registrados: ${(c.contactos || []).length}. Sin CURP ni nombre completo. Para acceder, corregir, cancelar u oponerte: ${CP.contacto_datos}.`, { ok: 'Entendido' }); break; }
      case 'mia-contactos': abrirContactos(); break;
      case 'yo-nuevo': guardarId('mientras-mi-relevo', ''); render(); break;
      case 'proponer': abrirAsignacion(id, false); break;
      case 'reasignar': abrirAsignacion(id, true); break;
      case 'seguir': case 'see-red': cerrarDet(); ui.scCaso = id; ui.segSub = 'caso'; ui.objetivo = null; ui.apagado = false; show('seguimiento'); break;
      case 'cp-registrar': {
        cerrarDet();
        const c = casoById(id), rep = c.consentimientoPersona && c.consentimientoPersona.estado === 'por_acreditar';
        const txt = rep ? `¿Viste el documento de ${c.consentimientoPersona.tipo || 'representación'}? No se guarda copia.` : `¿${c.persona.alias} dio su consentimiento en persona? Después se captura su Barthel en la visita.`;
        if (await pedir(txt, { ok: rep ? 'Acreditada' : 'Sí, lo dio' })) {
          store.update(() => { c.consentimientoPersona = Object.assign({}, c.consentimientoPersona, { estado: rep ? 'acreditado' : 'otorgado', via: rep ? 'representante' : 'propio', fechaRegistro: F.hoyISO() }); });
          toast('Consentimiento registrado');
        }
        break;
      }
      case 'cerrar': { cerrarDet(); const m = await pedir('Motivo del cierre:', { input: true, ok: 'Cerrar caso' }); if (m) { store.cerrarCaso(id, m); toast('Caso cerrado'); } break; }
      case 'del-caso': cerrarDet(); if (await pedir('Eliminar el caso y su historial.', { ok: 'Eliminar', peligro: true })) store.removeCaso(id); break;
      case 'aprobar': cerrarDet(); if (await pedir('¿Identidad y referencia revisadas, y entrevista de verificación hecha? Al aprobar se borran el nombre y el teléfono de la referencia.', { ok: 'Aprobar' })) { store.resolverRelevo(id, true); toast('Aprobada'); } break;
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
  const NIVEL_TXT = { dentro: 'Dentro de la regla de entrada', fuera: 'Fuera de la regla de entrada' };
  /* Rediseño del resultado (20 nov 2026): una cifra grande, un estado en palabras simples y el recorrido en 4 pasos.
   * Lo técnico (regla ≥ 40 h, horas declaradas) solo se muestra en la vista Programa. */
  function estadoSimple(nivel, hMes, cola) {
    if (nivel === 'fuera') return { k: 'reg', kick: 'Ya estás en la red', big: 'Te acompañamos', s: 'Las horas de relevo son para quien cuida 40 horas o más a la semana. Quedas registrada: si tus horas cambian, actualízalas. Mientras, te conectamos con apoyo cerca de ti.' };
    if (cola || !hMes) return { k: 'cola', kick: 'Estás en la lista', big: 'Tu turno viene', s: 'Este mes no alcanzaron las horas. Tu lugar sube cada semana que esperas.' };
    return { k: 'ok', kick: 'Tu tiempo para ti', s: 'Úsalo para descansar, ir al médico o hacer algo para ti. Una persona del programa lo confirma antes de asignarte relevo.' };
  }
  /* Rediseño 21 nov 2026: «pase de tiempo». Una cifra, las semanas del mes y para qué sirve; sin lenguaje técnico. */
  function semanasDe(hMes) {
    const b = Math.floor(hMes / 4), r = hMes - b * 4;
    return [0, 1, 2, 3].map((i) => b + (i < r ? 1 : 0));
  }
  function heroRes(st, hMes, sem, img, extra) {
    const cuerpo = st.k === 'ok'
      ? `<div class="rx-big"><b>${hMes}</b><span>horas<br>este mes</span></div>
         <div class="rx-weeks">${semanasDe(hMes).map((x, i) => `<span><i>Semana ${i + 1}</i><b>${x} h</b></span>`).join('')}</div>`
      : `<div class="rx-big rx-word"><b>${esc(st.big)}</b></div>
         ${st.k === 'cola' ? '<div class="rx-bar"><i></i></div>' : ''}`;
    return `<div class="rx-pass rx-${st.k}">${img}
      <div class="rx-top"><span class="rx-kick">${esc(st.kick || st.t || '')}</span></div>
      ${cuerpo}
      <p class="rx-msg">${esc(st.s)}</p>${extra || ''}
    </div>`;
  }
  /** Recorrido: firmado → consentimiento → relevo → primera visita. */
  function pasosRes(c) {
    const cp = c ? ['otorgado', 'acreditado'].includes((c.consentimientoPersona || {}).estado) : false;
    const asig = c && c.estado === 'activo';
    const visita = asig && store.state.visitas.some((v) => v.casoId === c.id && v.estado === 'realizada');
    const P = [['Convenio firmado', !c || !!c.contrato], ['Consentimiento de la persona cuidada', cp], ['Relevo asignado', asig], ['Primera visita', visita]];
    let actual = P.findIndex(([, ok]) => !ok);
    return `<ol class="rx-steps">${P.map(([t, ok], i) => `<li class="${ok ? 'ok' : i === actual ? 'now' : ''}"><i>${ok ? '✓' : i + 1}</i><span>${esc(t)}</span></li>`).join('')}</ol>`;
  }
  const dato = (val, lab) => `<div class="tl"><b class="mono">${val}</b><span>${esc(lab)}</span></div>`;
  /* 21 nov 2026: cada vista propia muestra cómo se ve sin registro (arriba) y un ejemplo con datos simulados (abajo). */
  function tarjetaCaso(c, ejemplo) {
    const v = valDe(c), hz = horasDe(c);
    const r = c.estado === 'activo' && c.asignacion && relById(c.asignacion.relevoId);
    const st = r ? { k: 'ok', kick: 'Con relevo', s: `${r.nombre} te acompaña. Revisa tus visitas en Seguimiento.` } : estadoSimple(v.nivel, hz.mes, hz.cola);
    return `<div class="rx-card${ejemplo ? ' ej' : ''}">
        <div class="mia-top"><span>${ejemplo ? 'Ejemplo' : 'Tu solicitud'} · ${esc(c.alcaldia)}</span><span class="mono">${esc(c.folio)}</span></div>
        ${heroRes(st, hz.mes, hz.sem, fantasma(r ? 'relevo' : v.nivel, 'blanco'))}
        ${pasosRes(c)}
        ${!ejemplo && enRevision(c) ? '<div class="rx-note rx-rev"><b>En revisión</b><span>Una persona revisará algunas respuestas. Tu lugar no cambia.</span></div>' : ''}
      </div>`;
  }
  const sepEjemplo = (t) => `<div class="ej-sep"><span>Ejemplo</span>${esc(t)}</div>`;
  function renderMia() {
    const c = casoById(leerId('mientras-mi-caso'));
    if (!c) {
      const ej = store.state.casos.find((x) => x.estado === 'activo' && x.asignacion) || store.state.casos[0];
      $('#mia-body').innerHTML = `${banner('bienvenida', `<span class="rx-kick">Necesito relevo</span>
          <h2>¿Cuidas a alguien muchas horas a la semana?</h2>
          <p>Una persona capacitada cuida a tu familiar mientras tú descansas.</p>`, 'gb-hero')}
        <button type="button" class="btn-primary wide" data-action="new-sol">Solicitar relevo</button>
        <p class="complementario">${esc(CP.aviso_complementario)}</p>
        ${ej ? sepEjemplo('Así se ve una solicitud con relevo') + tarjetaCaso(ej, true) : ''}`;
      return;
    }
    $('#mia-body').innerHTML = `${tarjetaCaso(c)}
      <div class="rx-acc">
        <button type="button" data-action="mia-convenio">Mi convenio</button>
        <button type="button" data-action="mia-contactos">Contactos</button>
        <button type="button" data-action="mia-datos">Mis datos</button>
        <button type="button" data-action="ver-aviso">Aviso de privacidad</button>
      </div>
      <button type="button" class="link rx-demo" data-action="mia-nueva">Hacer otra solicitud (demostración)</button>`;
  }
  function tarjetaRelevo(r, ejemplo) {
    const aprob = store.aprobado(r), carga = RV.cargaDe(r.id, store.state);
    const casos = store.state.casos.filter((c) => c.estado === 'activo' && c.asignacion && c.asignacion.relevoId === r.id);
    const ver = r.verificacion || {};
    const estado = !aprob ? (ver.estado === 'rechazada' ? 'Registro rechazado' : 'En revisión: el programa valida tus documentos') : r.certificacion === 'certificada' ? 'Aprobada y certificada' : 'Aprobada · falta certificación para recibir casos';
    return `<div class="rx-card${ejemplo ? ' ej' : ''}">
        <div class="mia-top"><span>${ejemplo ? 'Ejemplo' : 'Tu registro'} · ${esc(r.alcaldia)}</span><span class="mono">${esc(diasTxt(r.dias))}</span></div>
        <div class="rx-pass rx-ok">${fantasma('relevo', 'blanco')}
          <div class="rx-top"><span class="rx-kick">${esc(estado)}</span></div>
          <div class="rx-big rx-word"><b>${esc(r.nombre)}</b></div>
          <div class="rx-weeks dos"><span><i>Esta semana</i><b>${carga} de ${r.horasMax} h</b></span><span><i>Casos</i><b>${casos.length}</b></span></div>
          <p class="rx-msg">Con contrato, seguro de riesgos de trabajo y pago por visita al piso legal.</p>
        </div>
        ${casos.map((c) => `<div class="rx-note"><b>Visita a ${esc(c.persona.alias)}</b><span>${esc(c.domicilio ? c.domicilio.texto + ' (ficticio)' : c.alcaldia)} · ${esc(diasTxt(c.paquete ? c.paquete.dias : []))}</span></div>`).join('')}
        ${r.pago ? `<div class="rx-note rx-pago"><b>Cuenta para tu pago</b><span>${esc(r.pago.banco)} · terminación ${esc(r.pago.ultimos4)}${r.pago.simulado ? ' (ficticia)' : ''}</span></div>` : ''}
      </div>`;
  }
  function renderYo() {
    const r = relById(leerId('mientras-mi-relevo'));
    if (!r) {
      const ej = store.state.relevos.find((x) => store.aprobado(x) && x.certificacion === 'certificada' && store.state.casos.some((c) => c.estado === 'activo' && c.asignacion && c.asignacion.relevoId === x.id)) || store.state.relevos[0];
      $('#yo-body').innerHTML = `${banner('relevo', `<span class="rx-kick">Puedo cuidar</span>
          <h2>¿Quieres trabajar dando relevo?</h2>
          <p>Registra tus días, horario y zona. El programa te asigna casos. Con contrato, IMSS y pago justo.</p>`, 'gb-hero')}
        <button type="button" class="btn-primary wide" data-action="new-relevo">Registrarme</button>
        ${ej ? sepEjemplo('Así se ve un registro aprobado') + tarjetaRelevo(ej, true) : ''}`;
      return;
    }
    $('#yo-body').innerHTML = `${tarjetaRelevo(r)}
      <button type="button" class="btn-ghost wide" data-action="yo-nuevo">Registrar a otra persona (demostración)</button>`;
  }

  /* ================= Contactos de la cuidadora (24 nov 2026) ================= */
  function abrirContactos() {
    const c = casoById(leerId('mientras-mi-caso')); if (!c) return;
    const f = $('#form-contactos'); f.reset(); $('#cto-err').textContent = '';
    const e = (c.contactos || []).find((k) => k.tipo === 'emergencia'), a = (c.contactos || []).find((k) => k.tipo === 'autorizada');
    if (e) { f.elements.eNombre.value = e.nombre; f.elements.eParentesco.value = e.parentesco; f.elements.eTel.value = e.telefono; }
    if (a) { f.elements.aNombre.value = a.nombre; f.elements.aParentesco.value = a.parentesco; f.elements.aTel.value = a.telefono;
      $$('#form-contactos input[name=aRecibe]').forEach((x) => { x.checked = (a.recibe || []).includes(x.value); }); }
    $('#dlg-contactos').showModal(); $('#dlg-contactos').scrollTop = 0;
  }
  $('#form-contactos').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = ev.target, c = casoById(leerId('mientras-mi-caso')); if (!c) return;
    const lista = [], err = [];
    const uno = (tipo, n, p, t, extra) => {
      const nombre = f.elements[n].value.trim(), par = f.elements[p].value.trim(), tel = f.elements[t].value.trim();
      if (!nombre && !par && !tel) return;
      if (!nombre || !par || !/^\d{10}$/.test(tel)) { err.push(tipo === 'emergencia' ? 'Completa el contacto de emergencia (teléfono de 10 dígitos)' : 'Completa la persona autorizada (teléfono de 10 dígitos)'); return; }
      lista.push(Object.assign({ id: 'ct' + tipo, tipo, nombre, parentesco: par, telefono: tel, simulado: true }, extra || {}));
    };
    uno('emergencia', 'eNombre', 'eParentesco', 'eTel');
    uno('autorizada', 'aNombre', 'aParentesco', 'aTel', { recibe: $$('#form-contactos input[name=aRecibe]:checked').map((x) => x.value) });
    if (err.length) { $('#cto-err').textContent = err.join('. ') + '.'; return; }
    store.setContactos(c.id, lista); $('#dlg-contactos').close(); toast(lista.length ? 'Contactos guardados' : 'Contactos borrados');
  });

  /* ================= Bienvenida (primera vez que se abre la app) =================
   * Pantalla de carga con el logo y, después, «¿Cómo vas a usar RedCare?» para elegir el rol.
   * Se muestra una sola vez (localStorage «mientras-intro»); se puede repetir con ?intro o desde Ajustes. */
  const INTRO_K = 'mientras-intro';
  /* 24 nov 2026: carga «Pulso». Completa (≈3.4 s) la primera vez de cada sesión; después, corta (≈0.9 s).
   * La barra marca el tiempo de la animación, no una descarga: la app carga en menos de un segundo. */
  const PULSO_K = 'redcare-pulso-visto';
  const PULSO_MSG = [[0, 'Abriendo RedCare…'], [35, 'Preparando los datos simulados…'], [75, 'Armando tu red…'], [100, 'Listo']];
  let pulsoT = null;
  function abrirIntro() {
    const el = $('#intro');
    el.hidden = false; el.classList.remove('fuera', 'elegir', 'corta');
    elegirRol(null);
    const sinMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visto = false; try { visto = sessionStorage.getItem(PULSO_K) === '1'; sessionStorage.setItem(PULSO_K, '1'); } catch (err) { /* sin almacenamiento */ }
    const corta = sinMov || visto;
    el.classList.toggle('corta', corta);
    void el.offsetWidth;   // reinicia las animaciones CSS al reabrir desde Ajustes
    const dur = corta ? 700 : 3000, espera = corta ? 900 : 3400;
    clearInterval(pulsoT);
    const t0 = performance.now() + (corta ? 0 : 400);
    const paso = () => {
      const pc = Math.max(0, Math.min(100, Math.round((performance.now() - t0) / dur * 100)));
      $('#ip-pct').textContent = pc + ' %';
      $('#ip-msg').textContent = PULSO_MSG.filter((m) => pc >= m[0]).pop()[1];
      if (pc >= 100) clearInterval(pulsoT);
    };
    paso(); pulsoT = setInterval(paso, 60);
    setTimeout(() => { el.classList.add('elegir'); }, espera);
  }
  /* 24 nov 2026: bienvenida como red. Tocar un nodo lo enciende, ilumina su línea y muestra la ficha con «Entrar». */
  const ROLES_INTRO = {
    cuidadora: { k: 'Cuido a un familiar', t: 'Pide horas de relevo: una persona capacitada cuida a tu familiar mientras tú descansas, trabajas o vas al médico.', c: '#aa95d1', e: 'Entrar para pedir relevo' },
    relevo: { k: 'Quiero dar relevo', t: 'Registra tus días, horario y zona. Te asignamos visitas con contrato, seguro de riesgos de trabajo y pago por visita.', c: '#7dd1c1', e: 'Entrar para dar relevo' },
    programa: { k: 'Trabajo en el programa', t: 'Revisa solicitudes, reparte la bolsa de horas, asigna relevos y da seguimiento a cada visita.', c: '#e5677f', e: 'Entrar al programa' },
  };
  function elegirRol(rol) {
    const R = ROLES_INTRO[rol], el = $('#intro');
    el.dataset.rol = rol || '';
    $$('#intro .ie-nodo').forEach((n) => { const on = n.dataset.pick === rol; n.classList.toggle('on', on); n.setAttribute('aria-pressed', on); });
    $$('#intro .ie-l').forEach((l) => { l.classList.toggle('on', l.dataset.l === rol); });
    $('#ie-kick').textContent = R ? R.k : 'Elige un nodo';
    $('#ie-txt').textContent = R ? R.t : 'Cada persona tiene su lugar en la red: quien cuida, quien da relevo y quien coordina.';
    const b = $('#intro-entrar'); b.disabled = !R; if (R) { b.dataset.intro = rol; b.textContent = R.e; } else { delete b.dataset.intro; b.textContent = 'Entrar'; }
    el.style.setProperty('--rolc', R ? R.c : 'rgba(255,255,255,.35)');
  }
  $$('#intro .ie-nodo').forEach((n) => n.addEventListener('click', (e) => { e.stopPropagation(); elegirRol(n.dataset.pick); }));
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
    $('#topTag').textContent = ui.view === 'seguimiento' ? { prog: 'programa · simulado', hoy: 'visitas · simulado', caso: 'datos simulados', mapa: 'territorio · simulado' }[ui.segSub] : 'datos simulados';   // 11 nov 2026: la etiqueta se ve en todos los roles
    renderAjustes();
    if (ui.view === 'mia') renderMia();
    else if (ui.view === 'yo') renderYo();
    else if (ui.view === 'casos') renderCasos();
    else if (ui.view === 'relevos') renderRelevos();
    else if (ui.view === 'seguimiento') renderSeguimiento();
  }

  store.subscribe(render);
  initForms();
  show(location.hash.slice(1));
  let introVista = '';
  try { introVista = localStorage.getItem(INTRO_K) || ''; } catch (e) { /* sin almacenamiento */ }
  abrirIntro(); // 21 nov 2026: la bienvenida sale siempre al abrir la app
})();
