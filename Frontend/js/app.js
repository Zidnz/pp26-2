/* Interfaz del programa de relevo: casos, personas de relevo, seguimiento (con redes) y ajustes.
 * Listas de una mirada; el detalle se abre al tocar cada tarjeta. */
(function () {
  'use strict';

  Care.store.load();
  const { ZONAS, GRUPOS, PARENTESCOS, TIPOS_INCIDENTE, store, red, legal, relevo: RV, fechas: F } = Care;
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
  let estiloGuardado = 'lista';
  try { estiloGuardado = localStorage.getItem('relevo-estilo') || 'lista'; } catch (e) { /* sin almacenamiento */ }
  const ui = { estilo: estiloGuardado, view: 'casos', casoFiltro: 'todos', relFiltro: 'aprobada', segSub: 'hoy', dia: F.hoyISO(), scCaso: '', apagado: false, objetivo: null };

  /* ---------- Íconos de persona (mujer / hombre) ---------- */
  const SX = {
    M: '<svg class="sx sx-m" viewBox="0 0 16 20" role="img" aria-label="mujer"><circle cx="8" cy="4" r="3.2"/><path d="M8 8.4c-2.4 0-3.6 1.6-4.1 3.6L2.6 16.4h3.1V20h4.6v-3.6h3.1L12.1 12C11.6 10 10.4 8.4 8 8.4z"/></svg>',
    H: '<svg class="sx sx-h" viewBox="0 0 16 20" role="img" aria-label="hombre"><circle cx="8" cy="4" r="3.2"/><path d="M4.6 8.6h6.8c.9 0 1.6.7 1.6 1.6v5h-2V20H5v-4.8H3v-5c0-.9.7-1.6 1.6-1.6z"/></svg>',
  };
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
  const prioDe = (c) => RV.prioridad(c.cuidadora.horas, c.cuidadora.abvd);
  const evalDe = (c) => RV.evaluarPaquete(c.paquete, cfg().factorPrest);
  const proDe = (c) => {
    const r = c.estado === 'activo' && c.asignacion && relById(c.asignacion.relevoId);
    return r ? { nombre: r.nombre, horas: c.paquete.horas } : null;
  };
  const analisisHogar = (c, apagado) => red.analizar(c.hogar, proDe(c), apagado || null);
  const fragClase = (x) => (x >= 0.85 ? 'r' : x >= 0.6 ? 'a' : 'n');
  const ESTADO = { espera: 'Espera', activo: 'Activo', fuera: 'Fuera de regla', cerrado: 'Cerrado' };
  const PRIO_CORTO = { P1: 'P1', P2: 'P2', NP: '—' };
  const CERT = { certificada: 'Certificada', en_proceso: 'En proceso', no: 'Sin certificar' };
  const primeraAsignacion = (c) => (c.asignacion ? ((c.asignacion.historial || [])[0] || {}).desde || c.asignacion.fecha : null);
  const diasEntre = (a, b) => Math.round((F.desdeISO(b) - F.desdeISO(a)) / 86400000);
  const costoMes = (ev) => ev.mesConPrest || ev.mes;

  /* ================= Navegación ================= */
  const VIEWS = ['casos', 'relevos', 'seguimiento', 'ajustes'];
  const TITULOS = { casos: 'Necesito cuidado', relevos: 'Puedo cuidar', seguimiento: 'Seguimiento', ajustes: 'Ajustes' };

  function show(view) {
    if (view === 'redes') { view = 'seguimiento'; ui.segSub = 'caso'; }
    if (!VIEWS.includes(view)) view = 'casos';
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
  const ORDEN = { espera: 0, activo: 1, fuera: 2, cerrado: 3 };
  function renderCasos() {
    const { casos } = store.state;
    const lista = casos.filter((c) => ui.casoFiltro === 'todos' || (ui.casoFiltro === 'otros' ? ['fuera', 'cerrado'].includes(c.estado) : c.estado === ui.casoFiltro))
      .slice().sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || prioDe(a).nivel.localeCompare(prioDe(b).nivel) || a.fecha.localeCompare(b.fecha));
    const n = (e) => casos.filter((c) => c.estado === e).length;
    $('#caso-count').innerHTML = `<b>${n('espera')}</b> en espera · <b>${n('activo')}</b> activos`;
    $('#caso-list').innerHTML = lista.length ? lista.map(casoCard).join('') : '<div class="empty">Sin casos.</div>';
  }

  function casoCard(c) {
    const p = prioDe(c);
    const ev = evalDe(c);
    const r = c.asignacion && c.estado === 'activo' && relById(c.asignacion.relevoId);
    const inc = store.state.incidentes.filter((i) => i.casoId === c.id && i.estado === 'abierto').length;
    let pie;
    if (c.estado === 'espera') pie = `<span class="wait">${diasEntre(c.fecha, F.hoyISO())} d sin relevo</span><button type="button" class="btn-primary sm" data-action="proponer" data-id="${esc(c.id)}">Proponer</button>`;
    else if (r) pie = `<span class="relv"><small>relevo</small>${quien(r.sexo, r.nombre)}</span>${inc ? `<span class="badge alta">${inc} incidente${inc > 1 ? 's' : ''}</span>` : ''}`;
    else pie = `<span class="wait">${ESTADO[c.estado]}</span>`;
    const espera = c.estado === 'espera' ? ` · ${diasEntre(c.fecha, F.hoyISO())} d` : '';
    return `<article class="card ccard s-${p.nivel.toLowerCase()}${['fuera', 'cerrado'].includes(c.estado) ? ' done' : ''}" data-action="ver-caso" data-id="${esc(c.id)}" tabindex="0" role="button" aria-label="Ver caso ${esc(c.folio)}">
      <div class="chead"><span>${esc(p.nivel === 'NP' ? 'Fuera de regla' : p.nivel)} · ${ESTADO[c.estado]}${espera}</span><span class="mono">${esc(c.folio)}</span></div>
      <div class="cbig"><b class="mono">${esc(c.cuidadora.horas)}<small>h</small></b><span>cuida por semana</span></div>
      <div class="crow"><i class="pdot" aria-hidden="true"></i>
        ${quien(c.cuidadora.sexo, c.cuidadora.alias)}<span class="arrow" aria-hidden="true">→</span>${quien(c.persona.sexo, c.persona.alias, c.persona.edad ? String(c.persona.edad) : '')}
        <span class="badge pr ${p.nivel.toLowerCase()}" title="${esc(p.etiqueta)}">${PRIO_CORTO[p.nivel]}</span>
      </div>
      <div class="facts f-cuida"><span><b>${esc(c.cuidadora.horas)} h</b> cuida</span><span>${c.cuidadora.abvd ? 'ABVD' : 'sin ABVD'}</span><span>${esc(c.alcaldia)}</span></div>
      <div class="facts"><span><b>${c.paquete.horas} h</b> ${esc(diasTxt(c.paquete.dias))} ${esc(hhmm(ev.horario))}</span><span><b>${pesos(costoMes(ev))}</b>/mes</span></div>
      <div class="cfoot">${pie}</div>
    </article>`;
  }
  segmento('#caso-filter', 'casoFiltro', renderCasos);
  function pintaEstilo() {
    $('#caso-list').className = 'list estilo-' + ui.estilo;
    $$('#caso-estilo button').forEach((b) => { const on = b.dataset.estilo === ui.estilo; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  $('#caso-estilo').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    ui.estilo = b.dataset.estilo;
    try { localStorage.setItem('relevo-estilo', ui.estilo); } catch (err) { /* sin almacenamiento */ }
    pintaEstilo();
  });
  pintaEstilo();

  /* ---------- Detalle de un caso (visual) ---------- */
  const semana = (dias, nota) => `<div class="wk">${RV.DIAS.map((d, i) => `<span class="${dias.includes(i) ? 'on' : ''}">${esc(d.charAt(0))}</span>`).join('')}</div>${nota ? `<p class="wk-n">${nota}</p>` : ''}`;
  const tile = (val, lab, cls, extra) => `<div class="tl ${cls || ''}"><b class="mono">${val}</b><span>${esc(lab)}</span>${extra || ''}</div>`;
  const medidor = (x) => `<i class="meter"><i style="width:${Math.round(Math.min(1, x) * 100)}%"></i></i>`;
  function puntos(pctV) {
    const n = Math.round(pctV / 10);
    return `<div class="dots10">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
  }

  function abrirCaso(id) {
    const c = casoById(id); if (!c) return;
    const p = prioDe(c), ev = evalDe(c), a = analisisHogar(c);
    const r = c.asignacion && relById(c.asignacion.relevoId);
    const total = costoMes(ev), fam = RV.pagoFamilia(ev, c.pagador, c.pctSubsidio);
    const pf = total ? Math.round((100 * fam) / total) : 0;
    const hist = (c.asignacion && c.asignacion.historial) || [];
    $('#det-body').innerHTML = `
      <div class="hero h-${p.nivel.toLowerCase()}">
        <div class="hero-top"><span class="mono">${esc(c.folio)} · ${esc(c.alcaldia)}</span><span class="badge e-${c.estado}">${ESTADO[c.estado]}</span></div>
        <div class="hero-who">${quien(c.cuidadora.sexo, c.cuidadora.alias, 'cuida')}<span class="arrow">→</span>${quien(c.persona.sexo, c.persona.alias, c.persona.edad ? c.persona.edad + ' años' : '')}</div>
        <div class="hero-tags"><span class="pill-p">${esc(p.etiqueta)}</span><span class="pill-s">${esc(c.persona.grupo)}</span></div>
      </div>
      <div class="tiles">
        ${tile(esc(c.cuidadora.horas) + '<small>h</small>', 'cuida / semana', '', `<em>${c.cuidadora.abvd ? 'con ABVD' : 'sin ABVD'}</em>`)}
        ${tile(pesos(total), 'al mes', '', `<em>${ev.mesConPrest ? '+' + ev.factor + ' % prest.' : 'sin prest.'}</em>`)}
        ${tile(f2(a.fragilidad), 'fragilidad', 'fr-' + fragClase(a.fragilidad), medidor(a.fragilidad))}
      </div>

      <section class="blk"><h5>Paquete · ${c.paquete.horas} h/sem</h5>
        ${semana(c.paquete.dias, `<b>${esc(ev.horario)}</b> · jornada ${esc(ev.tipo)} · $${ev.hora.toFixed(2)}/h`)}
        <div class="tags">${tags(c.paquete.tareas, 'alt')}</div>
      </section>

      <section class="blk"><h5>Quién paga · ${esc(RV.PAGADORES[c.pagador])}</h5>
        <div class="split"><i class="fam" style="width:${pf}%"></i><i class="sub" style="width:${100 - pf}%"></i></div>
        <div class="split-l"><span><i class="fam"></i>Familia ${pesos(fam)}</span><span><i class="sub"></i>Subsidio ${pesos(total - fam)}</span></div>
      </section>

      <section class="blk"><h5>Relevo</h5>
        ${r ? `<div class="slot ok">${quien(r.sexo, r.nombre, 'desde ' + c.asignacion.fecha.slice(5))}</div>` : '<div class="slot">Sin relevo asignado</div>'}
        ${hist.map((h) => `<p class="wk-n">Antes ${esc((relById(h.relevoId) || {}).nombre || '')}: ${esc(h.motivo)}</p>`).join('')}
      </section>

      <section class="blk"><h5>Daño reportado</h5>
        <div class="harm"><span class="${c.cuidadora.danoSalud ? 'on' : ''}">Salud</span><span class="${c.cuidadora.danoTrabajo ? 'on' : ''}">Trabajo</span></div>
        <div class="enasic">${puntos(p.ref.pct)}<p><b>${Math.round(p.ref.pct / 10)} de cada 10</b> personas en su situación reportan daño · ENASIC 2022, nacional</p></div>
      </section>
      ${c.inclusion ? `<p class="wk-n">Incluido por criterio: ${esc(c.inclusion.motivo)}</p>` : ''}
      ${c.cierre ? `<p class="wk-n">Cerrado: ${esc(c.cierre.motivo)}</p>` : ''}`;
    const A = (act, txt, cls) => `<button type="button" class="${cls || 'btn-ghost'} sm" data-action="${act}" data-id="${esc(c.id)}">${txt}</button>`;
    let acc = '';
    if (c.estado === 'espera') acc = A('cerrar', 'Cerrar caso') + A('proponer', 'Proponer relevo', 'btn-primary');
    else if (c.estado === 'activo') acc = A('reasignar', 'Cambiar relevo') + A('seguir', 'Seguimiento', 'btn-primary');
    else if (c.estado === 'fuera') acc = A('del-caso', 'Eliminar', 'btn-ghost danger') + A('incluir', 'Incluir por criterio', 'btn-primary');
    else acc = A('del-caso', 'Eliminar', 'btn-ghost danger');
    $('#det-acciones').innerHTML = acc;
    $('#dlg-det').showModal(); $('#dlg-det').scrollTop = 0;
  }

  /* ---------- Asignación ---------- */
  function abrirAsignacion(casoId, reasignar) {
    const c = casoById(casoId); if (!c) return;
    if ($('#dlg-det').open) $('#dlg-det').close();
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
  $('#form-asig').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#asig-ok').disabled || !ui.asig.relevoId) return;
    const d = datosAsig();
    const c = casoById(ui.asig.casoId), r = relById(ui.asig.relevoId);
    const antes = analisisHogar(c).fragilidad;
    const formal = { escrito: true, imss: true, fecha: F.hoyISO() };
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
    if (ui.segSub === 'hoy') renderDia();
    else if (ui.segSub === 'caso') renderSegCaso();
    else if (ui.segSub === 'mapa') drawTerritorio();
    else renderKPI();
  }
  segmento('#seg-sub', 'segSub', () => render());

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
      pct_dentro_de_la_regla: pct(casos.filter((c) => prioDe(c).nivel !== 'NP').length, casos.length),
      pct_cuidadoras_mujeres: pct(conSexo.filter((c) => c.cuidadora.sexo === 'M').length, conSexo.length),
      incluidos_por_criterio: casos.filter((c) => c.inclusion).length,
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
      ${t('casos', k.casos_canalizados, `${k.pct_dentro_de_la_regla} % en la regla`)}
      ${t('cuidadoras mujeres', k.pct_cuidadoras_mujeres + ' %')}
      ${t('en espera', k.casos_en_espera, `máx. ${k.max_dias_en_espera} d`, k.casos_en_espera > 0)}
      ${t('días a asignar', k.mediana_dias_canalizacion_a_asignacion, 'mediana')}
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
      ['Regla', `≥ ${RV.UMBRAL_HORAS} h/sem`, 'notebook 11'],
      ['Tasas de daño', '79.6 / 70.5 / 54.9 / 42.6 %', 'resultados/07 · nacional'],
    ].map(([a, b, n]) => `<li><span>${esc(a)}<small>${esc(n)}</small></span><b class="mono">${esc(b)}</b></li>`).join('');
    const el = $('#cfg-marco');
    if (!el.childElementCount) el.innerHTML = Object.values(legal.MARCO).map((m) => `<li><b>${esc(m.norma)}</b>${esc(m.tema)}</li>`).join('');
    const s = store.state;
    $('#cfg-stats').textContent = `${s.casos.length} casos · ${s.relevos.length} relevos · ${s.visitas.length} visitas`;
  }
  $('#cfg-km').addEventListener('input', (e) => store.update((s) => { s.config.maxKm = +e.target.value; }));
  $('#cfg-fp').addEventListener('input', (e) => store.update((s) => { s.config.factorPrest = +e.target.value; }));
  $('#cfg-export').addEventListener('click', () => descargar(store.state, 'relevo-cuidado-completo.json'));
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
    el.innerHTML = ['M', 'H'].map((v) => `<label class="chip ico"><input type="radio" name="${n}" value="${v}"><span>${SX[v]}</span></label>`).join('');
  }
  function apoyoRow() {
    return `<div class="apoyo">
      <input name="an" maxlength="24" autocomplete="off" placeholder="Nombre" aria-label="Nombre">
      <select name="ap" aria-label="Parentesco">${options(PARENTESCOS, 'hijo', cap)}</select>
      <input name="ah" type="number" min="0" max="168" value="10" inputmode="numeric" aria-label="Horas por semana">
      <button type="button" class="x" data-action="rm-apoyo" aria-label="Quitar">×</button>
    </div>`;
  }

  function initForms() {
    $('#caso-alcaldia').innerHTML = '<option value="">Elige…</option>' + options(Object.keys(ZONAS));
    $('#caso-parentesco').innerHTML = options(PARENTESCOS, 'madre', cap);
    $('#caso-grupo').innerHTML = options(GRUPOS);
    $('#caso-pagador').innerHTML = Object.keys(RV.PAGADORES).map((k) => `<option value="${k}">${RV.PAGADORES[k]}</option>`).join('');
    $('#caso-horas-pq').innerHTML = RV.PAQUETES.map((h) => `<label class="chip"><input type="radio" name="pq" value="${h}"${h === 6 ? ' checked' : ''}><span>${h} h/sem</span></label>`).join('');
    chips($('#form-caso [data-name="dias"]'), RV.DIAS, (d) => d);
    chips($('#form-caso [data-name="tareas"]'), RV.TAREAS);
    $('#rel-alcaldia').innerHTML = options(Object.keys(ZONAS));
    $('#rel-doc').innerHTML = '<option value="">Elige…</option>' + options(legal.DOCS_ID);
    chips($('#form-relevo [data-name="dias"]'), RV.DIAS, (d) => d);
    chips($('#form-relevo [data-name="tareas"]'), RV.TAREAS);
    $$('.sxpick').forEach(sxPick);
    const fa = $('#form-relevo').elements.antecedentesFecha;
    fa.max = F.hoyISO(); fa.min = F.sumaDias(F.hoyISO(), -legal.VIGENCIA_ANTECEDENTES_DIAS);
    $$('dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    $$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  }

  /* ---------- Canalizar caso ---------- */
  function openCaso() {
    const f = $('#form-caso'); f.reset();
    $('#caso-apoyos').innerHTML = ''; $('.form-error', f).textContent = '';
    $('#dlg-caso').showModal(); $('#dlg-caso').scrollTop = 0;
    refreshCaso();
    f.elements.horas.focus();
  }
  function datosCaso() {
    const f = $('#form-caso'), e = f.elements;
    return {
      emergencia: e.emergencia.checked, horas: e.horas.value === '' ? null : +e.horas.value, abvd: e.abvd.value,
      danoSalud: e.danoSalud.checked, danoTrabajo: e.danoTrabajo.checked,
      sexo: e.sexo.value, psexo: e.psexo.value,
      alias: e.alias.value.trim(), alcaldia: e.alcaldia.value, palias: e.palias.value.trim(), pedad: e.pedad.value === '' ? null : +e.pedad.value,
      prol: e.prol.value, grupo: e.grupo.value,
      paquete: { horas: +e.pq.value, dias: checked(f, 'dias').map(Number), inicio: e.inicio.value || '09:00', tareas: checked(f, 'tareas') },
      pagador: e.pagador.value, pct: +e.pct.value || 0,
      inst: e.inst.checked, privacidad: e.privacidad.checked, sensibles: e.sensibles.checked,
    };
  }
  function refreshCaso() {
    const d = datosCaso();
    $('#caso-emerg').hidden = !d.emergencia;
    $('#caso-body').hidden = d.emergencia;
    $('#caso-pct-row').hidden = d.pagador !== 'mixto';
    if (d.horas == null || !d.abvd) $('#caso-prio-res').innerHTML = '';
    else {
      const p = RV.prioridad(d.horas, d.abvd === 'si');
      $('#caso-prio-res').innerHTML = `<div class="priores ${p.nivel.toLowerCase()}"><b>${esc(p.etiqueta)}</b> · ${p.ref.pct} % con daño (ENASIC)${p.nivel === 'NP' ? ' · queda fuera de la regla' : ''}</div>`;
    }
    const ev = RV.evaluarPaquete(d.paquete, cfg().factorPrest);
    const fam = RV.pagoFamilia(ev, d.pagador, d.pct);
    $('#caso-pq-res').innerHTML = d.paquete.dias.length ? `<div class="pqsum"><span>${ev.visitas}×${(ev.durMin / 60).toFixed(1)} h · ${esc(ev.horario)} · ${esc(ev.tipo)}</span><b>${pesos(costoMes(ev))}/mes</b><span>familia ${pesos(fam)}</span>
      ${ev.errores.map((x) => `<p class="form-error">${esc(x)}</p>`).join('')}</div>` : '';
    const reqs = legal.requisitosCanalizacion(d);
    const completo = d.horas != null && d.abvd && d.alias && d.alcaldia && d.palias && ev.ok && d.paquete.tareas.length && legal.pendientes(reqs).length === 0;
    $('#caso-ok').disabled = d.emergencia || !completo;
  }
  ['input', 'change'].forEach((ev) => $('#form-caso').addEventListener(ev, refreshCaso));
  $('#caso-add-apoyo').addEventListener('click', () => { if ($$('#caso-apoyos .apoyo').length < 4) $('#caso-apoyos').insertAdjacentHTML('beforeend', apoyoRow()); });
  $('#form-caso').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#caso-ok').disabled) { $('.form-error', e.target).textContent = 'Faltan datos.'; return; }
    const d = datosCaso();
    const apoyos = $$('#caso-apoyos .apoyo').map((row) => ({ nombre: $('[name="an"]', row).value.trim(), rol: $('[name="ap"]', row).value, horas: Math.max(0, +$('[name="ah"]', row).value || 0) })).filter((x) => x.nombre);
    const p = RV.prioridad(d.horas, d.abvd === 'si');
    const caso = {
      id: store.uid('k'), folio: store.nextFolio(), fecha: F.hoyISO(), institucion: 'Institución canalizadora (simulada)', alcaldia: d.alcaldia,
      estado: p.nivel === 'NP' ? 'fuera' : 'espera',
      cuidadora: { alias: d.alias, sexo: d.sexo || null, horas: d.horas, abvd: d.abvd === 'si', danoSalud: d.danoSalud, danoTrabajo: d.danoTrabajo },
      persona: { alias: d.palias, sexo: d.psexo || null, grupo: d.grupo, edad: d.pedad },
      hogar: Care.buildHogar({ cuidadora: { nombre: d.alias, rol: 'cuidadora', horas: d.horas }, cuidada: { nombre: d.palias, edad: d.pedad, rol: d.prol }, apoyos }),
      paquete: d.paquete, pagador: d.pagador, pctSubsidio: d.pagador === 'mixto' ? d.pct : 0, inclusion: null, asignacion: null,
      consentimiento: { inst: true, privacidad: true, sensibles: true, fecha: F.hoyISO() },
    };
    store.update((s) => s.casos.unshift(caso));
    $('#dlg-caso').close();
    ui.casoFiltro = caso.estado === 'fuera' ? 'otros' : 'espera';
    $$('#caso-filter button').forEach((x) => x.classList.toggle('on', x.dataset.val === ui.casoFiltro));
    render();
    toast(`${caso.folio} · ${p.etiqueta}`);
  });

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
    const d = datosRelevo();
    store.update((s) => s.relevos.unshift({
      id: store.uid('r'), nombre: d.nombre, sexo: d.sexo || null, alcaldia: d.alcaldia, dias: d.diasSel, desde: d.desde, hasta: d.hasta, horasMax: d.horasMax,
      tareas: d.tareas, certificacion: d.certificacion, experiencia: d.experiencia,
      legal: { curp: d.curp, docId: d.docId, antecedentesFecha: d.antecedentesFecha, referencia: { nombre: d.refNombre.trim(), tel: d.refTel.replace(/\D/g, '') }, aceptado: new Date().toISOString() },
      verificacion: { estado: 'pendiente', fecha: F.hoyISO() },
    }));
    $('#dlg-relevo').close();
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
      case 'new-caso': openCaso(); break;
      case 'new-relevo': openRelevo(); break;
      case 'rm-apoyo': b.closest('.apoyo').remove(); break;
      case 'proponer': abrirAsignacion(id, false); break;
      case 'reasignar': abrirAsignacion(id, true); break;
      case 'seguir': case 'see-red': cerrarDet(); ui.scCaso = id; ui.segSub = 'caso'; ui.objetivo = null; ui.apagado = false; show('seguimiento'); break;
      case 'map-close': $('#mapCard').hidden = true; break;
      case 'incluir': { cerrarDet(); const m = await pedir('Motivo para incluirlo fuera de la regla:', { input: true, min: 5, ok: 'Incluir' }); if (m) { store.incluirPorCriterio(id, m); toast('Incluido; pasa a espera'); } break; }
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

  /* ================= Render general ================= */
  function render() {
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'view-' + ui.view; });
    $$('.tabbtn').forEach((t) => { const on = t.dataset.view === ui.view; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('#topTitle').textContent = TITULOS[ui.view];
    $('#topTag').textContent = ui.view === 'seguimiento' ? { hoy: 'visitas', caso: 'red y semana', mapa: 'territorio', kpi: 'simulado' }[ui.segSub] : '';
    renderAjustes();
    if (ui.view === 'casos') renderCasos();
    else if (ui.view === 'relevos') renderRelevos();
    else if (ui.view === 'seguimiento') renderSeguimiento();
  }
  function tick() { const d = new Date(); $('#clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

  store.subscribe(render);
  initForms();
  tick(); setInterval(tick, 30000);
  show(location.hash.slice(1));
})();
