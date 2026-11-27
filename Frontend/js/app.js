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
  const VISTAS_ROL = { cuidadora: ['mia', 'toca', 'incluye', 'pasos'], relevo: ['yo', 'pago', 'req', 'asig'], programa: ['seguimiento', 'casos', 'relevos', 'ajustes'] };
  const TITULOS = { mia: 'Necesito relevo', toca: '¿Me toca?', incluye: 'Qué incluye', pasos: 'Pasos', yo: 'Puedo cuidar', pago: 'Tu pago', req: 'Requisitos', asig: 'Asignación', casos: 'Casos', relevos: 'Personas de relevo', seguimiento: 'Red de cuidado', ajustes: 'Ajustes' };
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
    const VIEWS = VISTAS_ROL[ui.rol] || VISTAS_ROL.cuidadora;
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
        ${v && (v.llegadaPor || v.marcadoPor || v.confirmadaFamilia || v.disputaFamilia) ? `<div class="facts reg-por">${v.llegadaPor ? `<span>llegada: ${QUIEN_REG[v.llegadaPor]}</span>` : ''}${v.salidaPor ? `<span>salida: ${QUIEN_REG[v.salidaPor]}</span>` : ''}${v.marcadoPor && !v.llegada ? `<span>marcó ${QUIEN_REG[v.marcadoPor]}</span>` : ''}${v.llegada ? `<span class="${v.confirmadaFamilia ? 'ok' : 'pend'}">${v.disputaFamilia ? 'la familia dice que no vino: revisar' : v.confirmadaFamilia ? 'familia confirmó' : 'sin confirmar por la familia'}</span>` : ''}</div>` : ''}
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
        <div class="eyebrow">Semana · ${esc(c.cuidadora.alias)}${ya ? ` · respondió ${QUIEN_REG[ya.por || 'programa']}` : ' · sin respuesta'}</div>
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
      store.addCheckin(ui.scCaso, +c, +n, emp, 'programa'); toast('Guardado');
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

  /* ================= 4. Ajustes =================
   * 26 nov 2026: Ajustes como simulador. Cada palanca muestra su efecto sobre los datos simulados y cada supuesto
   * dice qué tan firme es (por verificar, provisional, ilustrativo, supuesto). Nada de esto cambia config.js. */
  const PRESETS = {
    bolsaSim: [[130, '130 h'], [260, '260 h · ejemplo'], [520, '520 h'], [CP.presupuesto_horas_mes, CP.presupuesto_horas_mes.toLocaleString('es-MX') + ' h · archivo']],
    maxKm: [[6, '6 km'], [12, '12 km · base'], [20, '20 km']],
    factorPrest: [[0, 'Sin prestaciones'], [Math.round(legal.FACTOR_291F * 100), `${Math.round(legal.FACTOR_291F * 100)} % · proporcionales 291-F`]],
  };
  /* 26 nov 2026: en lugar de los supuestos, Ajustes reúne lo legal: aviso, convenio, contrato, protección de datos y marco. */
  const PROTECCION = [
    ['Sin CURP ni diagnósticos de la familia', 'La cuidadora da un alias; la identidad se valida fuera de la app.'],
    ['Datos sensibles con consentimiento expreso', 'Horas de cuidado, Barthel, tareas de salud (sí o no) y cómo se siente quien cuida.'],
    ['La persona cuidada también consiente', 'Ella o su representante; sin su consentimiento no se pregunta el Barthel.'],
    ['CURP de la persona de relevo: solo una huella', 'Se valida al registrarse y se guardan la huella y los últimos 4 caracteres, para evitar duplicados.'],
    ['Domicilio solo mientras hay relevo', 'Se pide al asignar y se borra al cerrar el caso.'],
    ['Lo mínimo para pagar', 'De la cuenta de pago solo se guardan el banco y los últimos 4 dígitos.'],
    ['La persona de relevo ve lo indispensable', 'Alias, domicilio, horario y tareas. Nada de la entrevista.'],
    ['Firmas con huella, no con copia', 'Se guarda la huella del texto firmado: si el texto cambia, deja de coincidir.'],
    ['Estadísticas solo agregadas', 'El JSON para el Observatorio no trae folios, alias, alcaldías ni fechas por caso.'],
    ['Una persona revisa antes de asignar', 'El puntaje no decide solo; hay revisión humana y se puede pedir otra revisión.'],
  ];
  function docEjemplo(tipo) {
    const st = store.state;
    if (tipo === 'trabajo') {
      const r = st.relevos.find((x) => store.aprobado(x)) || st.relevos[0];
      return r ? CT.contratoTrabajo({ nombre: r.nombre, alcaldia: r.alcaldia, dias: (r.dias || []).map((i) => RV.DIAS[i]), desde: r.desde, hasta: r.hasta, horasMax: r.horasMax, tareas: r.tareas }) : null;
    }
    const c = ejemploCaso();
    return c ? convenioDeCaso(c) : null;
  }
  /** Convenio con los datos actuales de un caso ya registrado. */
  function convenioDeCaso(c) {
    const hz = horasDe(c), pq = c.paquete || paqueteProbable(c);
    return CT.convenioServicio({ folio: c.folio, alias: c.cuidadora.alias, palias: c.persona.alias, alcaldia: c.alcaldia, horasMes: hz.mes, horasSemana: hz.sem,
      dentro: valDe(c).nivel === 'dentro', enfermeria: !!c.entrevista.modelo.enfermeria, consentimientoPersona: (c.consentimientoPersona || {}).via || 'propio',
      tareas: pq.tareas, dias: pq.dias.map((i) => RV.DIAS[i]), inicio: pq.inicio });
  }
  function verDoc(tipo) {
    const doc = docEjemplo(tipo);
    if (!doc) { toast('Sin datos de ejemplo'); return; }
    $('#det-body').innerHTML = `<p class="aj-docnote">Plantilla con datos simulados de ejemplo.</p>${contratoHTML(doc)}`;
    $('#det-acciones').innerHTML = '<button type="button" class="btn-ghost" data-close>Cerrar</button>';
    $('#det-acciones [data-close]').addEventListener('click', () => $('#dlg-det').close());
    $('#dlg-det').showModal(); $('#dlg-det').scrollTop = 0;
  }
  /** Paquete con el que se evaluaría un caso en espera (igual que abrirAsignacion, sin modificar el caso). */
  function paqueteProbable(c) {
    if (c.paquete) return c.paquete;
    const pf = c.preferencias || { dias: [0], inicio: '09:00', tareas: [RV.TAREAS[0]] };
    return { horas: Math.max(RV.PAQUETES[0], horasDe(c).sem || 0), dias: pf.dias.slice(), inicio: pf.inicio, tareas: pf.tareas.slice() };
  }
  function cobertura(maxKm) {
    const conf = Object.assign({}, cfg(), { maxKm });
    const espera = store.state.casos.filter((c) => c.estado === 'espera' && valDe(c).nivel === 'dentro');
    const desc = {};
    let con = 0;
    espera.forEach((c) => {
      const p = RV.proponer(Object.assign({}, c, { paquete: paqueteProbable(c) }), store.state, conf);
      if (p.nElegibles) con++;
      else Object.keys(p.descartes).forEach((k) => { desc[k] = (desc[k] || 0) + p.descartes[k]; });
    });
    const top = Object.keys(desc).sort((a, b) => desc[b] - desc[a])[0];
    return { n: espera.length, con, top: top ? RV.ETIQUETA_DESCARTE[top] : null };
  }
  const barra = (v, max, marcas) => `<div class="aj-bar"><i style="width:${Math.min(100, (100 * v) / (max || 1)).toFixed(1)}%"></i>${(marcas || []).map(([x, t]) => `<s style="left:${Math.min(100, (100 * x) / (max || 1)).toFixed(1)}%" title="${esc(t)}"></s>`).join('')}</div>`;
  const pintaRango = (el) => { const p = ((el.value - el.min) / (el.max - el.min)) * 100; el.style.setProperty('--p', p + '%'); };

  function renderAjustes() {
    if (ui.view !== 'ajustes') return;
    const c = cfg(), s = store.state;
    [['#cfg-km', c.maxKm], ['#cfg-fp', c.factorPrest], ['#cfg-bolsa', bolsa()]].forEach(([sel, v]) => {
      const el = $(sel); if (document.activeElement !== el) el.value = v; pintaRango(el);
    });
    $$('#view-ajustes .aj-presets').forEach((box) => {
      const k = box.dataset.cfg, actual = k === 'bolsaSim' ? bolsa() : c[k];
      box.innerHTML = PRESETS[k].map(([v, t]) => `<button type="button" data-cfg-v="${v}" class="${+v === +actual ? 'on' : ''}">${esc(t)}</button>`).join('');
    });

    // Bolsa: cuántos hogares reciben horas con lo que hay
    const n = Object.keys(plan.horas).length, cola = plan.en_cola.length, reciben = n - cola;
    const minTodos = n * CP.horas_minimas, topeTodos = n * CP.horas_maximas, B = bolsa();
    $('#cfg-bolsa-val').textContent = B.toLocaleString('es-MX') + ' h';
    $('#cfg-bolsa-imp').innerHTML = `${barra(plan.usado, Math.max(B, topeTodos), [[minTodos, 'Mínimo para todos'], [topeTodos, 'Tope para todos']])}
      <p><b>${reciben} de ${n}</b> hogares dentro de la regla reciben horas${cola ? ` · <b class="neg">${cola} en cola</b>` : ''}${reciben ? ` · promedio ${pts(plan.usado / reciben)} h/mes` : ''}.</p>
      <p class="aj-mute">Para dar el mínimo a todos hacen falta ${minTodos.toLocaleString('es-MX')} h; para llegar al tope, ${topeTodos.toLocaleString('es-MX')} h.</p>`;

    // Distancia: cuántos casos en espera tienen al menos una persona elegible
    const cob = cobertura(c.maxKm);
    $('#cfg-km-val').textContent = c.maxKm + ' km';
    $('#cfg-km-imp').innerHTML = cob.n ? `${barra(cob.con, cob.n)}
      <p><b>${cob.con} de ${cob.n}</b> casos en espera tienen al menos una persona elegible.</p>
      ${cob.top ? `<p class="aj-mute">Lo que más descarta a quienes faltan: <b>${esc(cob.top)}</b>.${cob.top === 'lejos' ? '' : ' Subir la distancia no lo resuelve.'}</p>` : ''}`
      : '<p class="aj-mute">No hay casos en espera dentro de la regla.</p>';

    // Prestaciones: costo por hora y de los casos con relevo
    const activos = s.casos.filter((x) => x.estado === 'activo' && x.paquete);
    const costo = activos.reduce((t, x) => t + costoMes(evalDe(x)), 0);
    const hBase = legal.HORA.diurna, hCon = hBase * (1 + c.factorPrest / 100);
    $('#cfg-fp-val').textContent = c.factorPrest ? c.factorPrest + ' %' : 'sin prestaciones';
    $('#cfg-fp-imp').innerHTML = `<div class="aj-duo"><span><i>Hora diurna</i><b class="mono">$${f2(hCon)}</b><small>base $${f2(hBase)}</small></span>
      <span><i>${activos.length} casos con relevo</i><b class="mono">${pesos(costo)}</b><small>al mes</small></span></div>
      <p class="aj-mute">Quién paga sigue sin definirse: esto es costo, no presupuesto.</p>`;

    // Héroe: el mes simulado de un vistazo
    const certCupo = s.relevos.filter((r) => store.aprobado(r) && r.certificacion === 'certificada' && RV.cargaDe(r.id, s) < r.horasMax).length;
    $('#aj-hero').innerHTML = `<div class="rx-pass aj-hero">
      <div class="rx-top"><span class="rx-kick">Este mes · simulado</span><span class="aj-tag">${esc(CP.nombre)}</span></div>
      <div class="rx-big"><b>${reciben}</b><span>de ${n} hogares<br>reciben relevo</span></div>
      <div class="rx-bar"><i style="width:${Math.min(100, (100 * plan.usado) / (B || 1)).toFixed(1)}%"></i></div>
      <p class="aj-hero-sub">${plan.usado.toLocaleString('es-MX')} de ${B.toLocaleString('es-MX')} h de la bolsa asignadas</p>
      <div class="rx-weeks"><span><i>En cola</i><b>${cola}</b></span><span><i>Sin propuesta</i><b>${cob.n - cob.con}</b></span><span><i>Relevos con cupo</i><b>${certCupo}</b></span><span><i>Costo/mes</i><b>${costo >= 1000 ? '$' + Math.round(costo / 1000) + 'k' : pesos(costo)}</b></span></div>
    </div>`;

    // Legal y datos
    const DOC = (act, ico, t, sub, v) => `<button type="button" class="aj-doc" data-aj-doc="${act}"><svg viewBox="0 0 24 24" aria-hidden="true">${ico}</svg><span><b>${esc(t)}</b><small>${esc(sub)}</small></span><em class="mono">${esc(v)}</em></button>`;
    $('#aj-docs').innerHTML = DOC('aviso', '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>', 'Aviso de privacidad', 'Simplificado · LFPDPPP', 'v' + String(CP.version_aviso).split(' ')[0])
      + DOC('servicio', '<path d="M4 12h4l2-3 4 6 2-3h4"/><rect x="3" y="4" width="18" height="16" rx="3"/>', CT.TITULO.servicio, 'Lo firma el hogar al terminar la solicitud', CT.VERSION.servicio)
      + DOC('trabajo', '<rect x="4" y="7" width="16" height="13" rx="2.5"/><path d="M9 7V5h6v2M4 12h16"/>', CT.TITULO.trabajo, 'Lo firma la persona de relevo · LFT Cap. IX Bis', CT.VERSION.trabajo);
    const pr = $('#aj-prot');
    if (!pr.childElementCount) pr.innerHTML = PROTECCION.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')
      + '<li class="aj-warn"><b>«Exportar todo» incluye alias y respuestas de salud</b><span>Con datos reales, ese archivo no sale de la institución.</span></li>';
    $('#aj-marco-n').textContent = `${Object.keys(legal.MARCO).length} normas · artículos por verificar`;
    const el = $('#cfg-marco');
    if (!el.childElementCount) el.innerHTML = Object.values(legal.MARCO).map((m) => `<li><b>${esc(m.norma)}</b>${esc(m.tema)}</li>`).join('');
    const abiertos = s.incidentes.filter((i) => i.estado === 'abierto').length;
    $('#cfg-stats').innerHTML = [[s.casos.length, 'casos'], [s.relevos.length, 'relevos'], [s.visitas.length, 'visitas'], [abiertos, 'incidentes abiertos']]
      .map(([v, t]) => `<span><b class="mono">${v}</b><i>${t}</i></span>`).join('');
  }
  $('#cfg-km').addEventListener('input', (e) => { pintaRango(e.target); store.update((s) => { s.config.maxKm = +e.target.value; }); });
  $('#cfg-fp').addEventListener('input', (e) => { pintaRango(e.target); store.update((s) => { s.config.factorPrest = +e.target.value; }); });
  $('#cfg-bolsa').addEventListener('input', (e) => { pintaRango(e.target); store.update((s) => { s.config.bolsaSim = +e.target.value; }); });
  $('#view-ajustes').addEventListener('click', (e) => {
    const p = e.target.closest('[data-cfg-v]');
    if (p) { const k = p.closest('[data-cfg]').dataset.cfg; store.update((s) => { s.config[k] = +p.dataset.cfgV; }); return; }
    const d = e.target.closest('[data-aj-doc]');
    if (d) { if (d.dataset.ajDoc === 'aviso') { const dl = $('#dlg-aviso'); $('#aviso-body').innerHTML = Care.aviso.html(CP); dl.showModal(); dl.scrollTop = 0; } else verDoc(d.dataset.ajDoc); }
  });
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
      case 'mia-convenio': { const c = casoById(leerId('mientras-mi-caso')); if (c) abrirHoja('Mi convenio', convenioHoja(c)); break; }
      case 'mia-datos': { const c = casoById(leerId('mientras-mi-caso')); if (c) abrirHoja('Mis datos', misDatosHTML(c)); break; }
      case 'mia-contactos': if ($('#dlg-hoja').open) $('#dlg-hoja').close(); abrirContactos(); break;
      case 'yo-nuevo': guardarId('mientras-mi-relevo', ''); render(); break;
      case 'mia-demo': guardarId('mientras-mi-caso', id); render(); toast('Viendo la solicitud de ejemplo'); break;
      case 'yo-demo': guardarId('mientras-mi-relevo', id); render(); toast('Viendo el registro de ejemplo'); break;
      case 'rv-llegue': store.registrarLlegada(id, F.hoyISO(), 'relevo'); toast('Llegada registrada'); break;
      case 'rv-sali': store.registrarSalida(id, F.hoyISO(), 'relevo'); toast('Salida registrada'); break;
      case 'cu-confirmo': store.confirmarVisita(id, F.hoyISO()); toast('Visita confirmada'); break;
      case 'cu-nollego': {
        const p = store.programadasEn(F.hoyISO()).find((x) => x.caso.id === id); if (!p) break;
        const llegada = p.reg && p.reg.llegada;
        const aviso = llegada ? `Hay una llegada registrada a las ${llegada}. Avisaremos al programa que, según tú, no vino. El registro no se borra: una persona lo revisa.`
          : 'Avisaremos al programa que la persona de relevo no llegó. Se registra como ausencia e incidente.';
        if (!(await pedir(aviso, { ok: 'Avisar' }))) break;
        if (llegada) store.disputarVisita(id, F.hoyISO()); else store.marcarVisita(id, F.hoyISO(), 'no_llego', 'cuidadora');
        store.addIncidente({ casoId: id, reporta: 'familia', tipo: 'No llegó', nota: llegada ? `La cuidadora indica que no vino; hay llegada registrada a las ${llegada}` : 'Reportado por la cuidadora desde la app' });
        toast('Aviso enviado'); break;
      }
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
    const cuando = c.paquete ? ` ${diasTxt(c.paquete.dias)}, ${evalDe(c).horario}` : '';
    const st = r ? { k: 'ok', kick: 'Con relevo', s: `${r.nombre} te acompaña${cuando}.` } : estadoSimple(v.nivel, hz.mes, hz.cola);
    return `<div class="rx-card${ejemplo ? ' ej' : ''}">
        <div class="mia-top"><span>${ejemplo ? 'Ejemplo' : 'Tu solicitud'} · ${esc(c.alcaldia)}</span><span class="mono">${esc(c.folio)}</span></div>
        ${heroRes(st, hz.mes, hz.sem, fantasma(r ? 'relevo' : v.nivel, 'blanco'))}
        ${pasosRes(c)}
        ${!ejemplo && enRevision(c) ? '<div class="rx-note rx-rev"><b>En revisión</b><span>Una persona revisará algunas respuestas. Tu lugar no cambia.</span></div>' : ''}
      </div>`;
  }
  const sepEjemplo = (t) => `<div class="ej-sep"><span>Ejemplo</span>${esc(t)}</div>`;
  /* 26 nov 2026: antes de solicitar, la cuidadora ve si le corresponde (sin guardar nada), qué incluye y cómo sigue.
   * No se muestran tiempos de espera ni costos: con datos simulados serían promesas sin respaldo. */
  const ejemploCaso = () => {
    const cs = store.state.casos.filter((x) => x.estado === 'activo' && x.asignacion && x.paquete);
    const hoyIds = store.programadasEn(F.hoyISO()).map((p) => p.caso.id);
    cs.sort((a, b) => hoyIds.includes(b.id) - hoyIds.includes(a.id));
    const completo = cs.find((x) => x.contrato && cpOk(x) && store.state.visitas.some((v) => v.casoId === x.id && v.estado === 'realizada'));
    return completo || cs[0] || null;
  };
  function chequeoHTML(h) {
    const dentro = h >= CP.regla_horas;
    const hMin = RV.PAQUETES[0], hMax = RV.PAQUETES[RV.PAQUETES.length - 1];
    return dentro
      ? `<b class="pre-ok">Sí te corresponde</b><span>Podrías recibir de ${hMin} a ${hMax} h de relevo a la semana.</span>`
      : `<b class="pre-no">Aún no te corresponde</b><span>Es para quien cuida ${CP.regla_horas} h o más. Igual puedes registrarte.</span>`;
  }
  /* 26 nov 2026: la cuidadora y la persona de relevo tienen su propia barra de pestañas, como el Programa.
   * Cuidadora: Inicio · ¿Me toca? · Incluye · Pasos. Relevo: Inicio · Pago · Requisitos · Asignación. */
  const pasoPre = (n, t, d) => `<li><i>${n}</i><span><b>${esc(t)}</b><small>${esc(d)}</small></span></li>`;
  const ctaMia = () => (casoById(leerId('mientras-mi-caso')) ? '' : '<button type="button" class="btn-primary wide pre-cta" data-action="new-sol">Solicitar relevo</button>');
  const ctaYo = () => (relById(leerId('mientras-mi-relevo')) ? '' : '<button type="button" class="btn-primary wide pre-cta" data-action="new-relevo">Registrarme</button>');
  function renderMia() {
    const c = casoById(leerId('mientras-mi-caso'));
    if (!c) {
      const ej = ejemploCaso();
      $('#mia-body').innerHTML = `${banner('bienvenida', `<span class="rx-kick">Necesito relevo</span>
          <h2>¿Cuidas a alguien muchas horas a la semana?</h2>
          <p>Una persona capacitada cuida a tu familiar mientras tú descansas.</p>`, 'gb-hero')}
        <button type="button" class="btn-primary wide" data-action="new-sol">Solicitar relevo</button>
        <div class="pre-links">
          <button type="button" data-go="toca"><b>¿Me toca?</b><small>Revisa tus horas</small></button>
          <button type="button" data-go="incluye"><b>Qué incluye</b><small>Horas, horario, tareas</small></button>
          <button type="button" data-go="pasos"><b>Pasos</b><small>Cómo sigue</small></button>
        </div>
        ${ej ? sepEjemplo('Así se ve una solicitud con relevo') + tarjetaCaso(ej, true) + `<button type="button" class="btn-ghost wide" data-action="mia-demo" data-id="${esc(ej.id)}">Probar con esta solicitud (demostración)</button>` : ''}`;
      return;
    }
    $('#mia-body').innerHTML = `${tarjetaCaso(c)}
      ${panelCuidadora(c)}
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
          <p class="rx-msg">Con contrato, seguro y pago por visita.</p>
        </div>
        ${casos.map((c) => `<div class="rx-note"><b>Visita a ${esc(c.persona.alias)}</b><span>${esc(c.domicilio ? c.domicilio.texto + ' (ficticio)' : c.alcaldia)} · ${esc(diasTxt(c.paquete ? c.paquete.dias : []))}</span></div>`).join('')}
        ${r.pago ? `<div class="rx-note rx-pago"><b>Cuenta para tu pago</b><span>${esc(r.pago.banco)} · terminación ${esc(r.pago.ultimos4)}${r.pago.simulado ? ' (ficticia)' : ''}</span></div>` : ''}
      </div>`;
  }
  /* 26 nov 2026: antes de registrarse, la persona de relevo estima su pago y ve si llegaría al IMSS completo (LFT 291-C).
   * Estimación con pago diurno y proporcionales del prototipo: por verificar. */
  function pagoHTML(h) {
    const u = legal.umbral291C(h, RV.SEMANAS_MES);
    const hImss = Math.ceil(u.horasMesNecesarias / RV.SEMANAS_MES);
    return `<div class="pre-money"><b>${pesos(u.ingreso)}</b><span>al mes, aprox.</span></div>
      <div class="pre-res">${u.alcanza
        ? `<b class="pre-ok">Con IMSS completo</b><span>Con estas horas tienes todo el seguro social.</span>`
        : `<b class="pre-no">Con seguro de accidentes de trabajo</b><span>El IMSS completo empieza cerca de ${hImss} h a la semana.</span>`}</div>`;
  }
  function renderYo() {
    const r = relById(leerId('mientras-mi-relevo'));
    if (!r) {
      const conCaso = (x) => store.aprobado(x) && x.certificacion === 'certificada' && store.state.casos.some((c) => c.estado === 'activo' && c.asignacion && c.asignacion.relevoId === x.id);
      const hoyRel = store.programadasEn(F.hoyISO()).map((p) => p.relevoId);
      const ej = store.state.relevos.find((x) => conCaso(x) && hoyRel.includes(x.id)) || store.state.relevos.find(conCaso) || store.state.relevos[0];
      $('#yo-body').innerHTML = `${banner('relevo', `<span class="rx-kick">Puedo cuidar</span>
          <h2>¿Quieres trabajar dando relevo?</h2>
          <p>Elige tus días y tu zona. Con contrato y pago según la ley.</p>`, 'gb-hero')}
        <button type="button" class="btn-primary wide" data-action="new-relevo">Registrarme</button>
        <div class="pre-links">
          <button type="button" data-go="pago"><b>Pago</b><small>Estima tu ingreso</small></button>
          <button type="button" data-go="req"><b>Requisitos</b><small>Qué te pedimos</small></button>
          <button type="button" data-go="asig"><b>Asignación</b><small>Cómo te toca</small></button>
        </div>
        ${ej ? sepEjemplo('Así se ve un registro aprobado') + tarjetaRelevo(ej, true) + `<button type="button" class="btn-ghost wide" data-action="yo-demo" data-id="${esc(ej.id)}">Probar como ${esc(ej.nombre)} (demostración)</button>` : ''}`;
      return;
    }
    $('#yo-body').innerHTML = `${tarjetaRelevo(r)}
      ${panelRelevo(r)}
      <button type="button" class="btn-ghost wide" data-action="yo-nuevo">Registrar a otra persona (demostración)</button>`;
  }
  /* 26 nov 2026 (4): textos cortos para cuidadoras y personas de relevo. Sin notas técnicas: las fuentes viven
   * en Programa, el README y los documentos. */
  const fila = (t, d, cls) => `<li class="${cls || ''}"><b>${esc(t)}</b>${d ? `<span>${esc(d)}</span>` : ''}</li>`;
  const tarjeta = (kick, tit, cuerpo, cls) => `<section class="pre-card ${cls || ''}"><div class="pre-h"><span class="rx-kick">${esc(kick)}</span><h3>${esc(tit)}</h3></div>${cuerpo}</section>`;
  const NO_HACE = ['Enfermería ni medicamentos', 'Limpieza de la casa', 'Cuidar a otra persona', 'Llevarla en auto', 'Manejar dinero'];

  /* ---------- Cuidadora · ¿Me toca? ---------- */
  function tocaDinamico() {
    const hd = ui.chkDia == null ? 6 : ui.chkDia, dd = ui.chkDias == null ? 5 : ui.chkDias, h = hd * dd;
    return `<div class="pre-total"><b class="mono">${h}</b><span>horas a la semana</span></div>
      <div class="pre-meter"><i style="width:${Math.min(100, (h / 80) * 100)}%"></i><s style="left:${(CP.regla_horas / 80) * 100}%"><em>${CP.regla_horas} h</em></s></div>
      <div class="pre-res">${chequeoHTML(h)}</div>`;
  }
  function renderToca() {
    const hd = ui.chkDia == null ? 6 : ui.chkDia, dd = ui.chkDias == null ? 5 : ui.chkDias;
    $('#toca-body').innerHTML = tarjeta('Revisa en un minuto', '¿Te corresponde?', `
        <label class="pre-q" for="chk-dia">Horas al día que cuidas <b class="mono" id="chk-dia-v">${hd} h</b></label>
        <input type="range" id="chk-dia" min="0" max="24" step="1" value="${hd}" style="--p:${(hd / 24) * 100}%">
        <label class="pre-q" for="chk-dias">Días a la semana <b class="mono" id="chk-dias-v">${dd}</b></label>
        <input type="range" id="chk-dias" min="1" max="7" step="1" value="${dd}" style="--p:${((dd - 1) / 6) * 100}%">
        <div id="toca-din" aria-live="polite">${tocaDinamico()}</div>`)
      + tarjeta('Para sumar bien', 'Cuenta como cuidar', `<div class="pre-tags solo">${['Bañar o vestir', 'Dar de comer', 'Acompañar al baño', 'Mover de la cama a la silla', 'Vigilar de día o de noche', 'Dar medicinas', 'Acompañar a citas'].map((t) => `<span>${t}</span>`).join('')}</div>`)
      + ctaMia();
  }

  /* ---------- Cuidadora · Incluye ---------- */
  const DIAS_EJ = { 3: [2], 6: [1, 3], 9: [0, 2, 4], 12: [0, 1, 3, 4] };
  function semanaHTML(h) {
    const ev = RV.evaluarPaquete({ horas: h, dias: DIAS_EJ[h], inicio: '10:00' }, 0);
    return `<div class="pre-week">${RV.DIAS.map((d, i) => `<span class="${DIAS_EJ[h].includes(i) ? 'on' : ''}"><i>${d}</i>${DIAS_EJ[h].includes(i) ? `<b>${ev.horario.replace('-', '<br>')}</b>` : '<b>·</b>'}</span>`).join('')}</div>
      <p class="pre-line2">Tú eliges los días y la hora.</p>`;
  }
  function renderIncluye() {
    const pk = ui.chkPaq || 6;
    $('#incluye-body').innerHTML = tarjeta('Qué incluye', 'Horas para ti', `
        <div class="pre-bento">
          <span class="b1"><b>${RV.PAQUETES[0]}-${RV.PAQUETES[RV.PAQUETES.length - 1]} h</b><i>por semana</i></span>
          <span class="b2"><b>$0</b><i>para tu hogar</i></span>
          <span class="b3"><b>1 persona</b><i>de confianza</i></span>
        </div>`)
      + tarjeta('Tu semana', 'Mismos días, mismo horario', `
        <div class="pre-seg" role="group" aria-label="Horas por semana">${RV.PAQUETES.map((p) => `<button type="button" data-paq="${p}" class="${p === pk ? 'on' : ''}">${p} h</button>`).join('')}</div>
        <div id="paq-din">${semanaHTML(pk)}</div>`)
      + tarjeta('La persona de relevo', 'Qué hace y qué no', `
        <div class="pre-two cols">
          <div><div class="pre-sub">Sí</div><ul class="pre-list ok compact">${RV.TAREAS.map((t) => fila(t.replace(' (sin administrarlos)', ''))).join('')}</ul></div>
          <div><div class="pre-sub">No</div><ul class="pre-list no compact">${NO_HACE.map((t) => fila(t)).join('')}</ul></div>
        </div>`)
      + ctaMia();
  }

  /* ---------- Cuidadora · Pasos ---------- */
  function renderPasos() {
    const c = casoById(leerId('mientras-mi-caso'));
    $('#pasos-body').innerHTML = (c ? tarjeta('Tu avance', c.folio, pasosRes(c)) : '')
      + tarjeta('Cómo funciona', 'Cuatro pasos', `<ol class="pre-steps">
          ${pasoPre(1, 'Solicitud', 'Unas preguntas sobre tu cuidado.')}
          ${pasoPre(2, 'Revisión', 'Una persona revisa tu solicitud.')}
          ${pasoPre(3, 'Convenio', 'Firmas y la persona que cuidas acepta.')}
          ${pasoPre(4, 'Primera visita', 'Conoces a tu persona de relevo.')}
        </ol>`)
      + tarjeta('Tu privacidad', 'No te pedimos', `<div class="pre-tags solo neg">${['CURP', 'Nombre completo', 'Diagnósticos', 'Tu edad'].map((t) => `<span>${t}</span>`).join('')}</div>`)
      + tarjeta('Con relevo', 'Desde Inicio puedes', `<ul class="pre-list ok compact">
          ${fila('Confirmar cada visita')}${fila('Contar cómo vas cada semana')}${fila('Avisar si algo pasa')}
        </ul><p class="pre-fine">En una emergencia, llama al 911.</p>`)
      + ctaMia();
  }

  /* ---------- Relevo · Pago ---------- */
  function pagoDin(h) {
    const u = legal.umbral291C(h, RV.SEMANAS_MES), hImss = Math.ceil(u.horasMesNecesarias / RV.SEMANAS_MES);
    return `${pagoHTML(h)}
      <div class="pre-imss"><div class="pre-meter dark"><i style="width:${Math.min(100, (h / 48) * 100)}%"></i><s style="left:${(hImss / 48) * 100}%"><em>IMSS ${hImss} h</em></s></div></div>`;
  }
  function renderPago() {
    const r = relById(leerId('mientras-mi-relevo'));
    const h = ui.chkPago == null ? (r ? Math.max(3, r.horasMax) : 12) : ui.chkPago;
    const base = legal.HORA.diurna, P = legal.PROPORCIONALES;
    const partes = [['Salario', base, 'b0'], ['Descanso', base * P.descanso_semanal, 'b1'], ['Aguinaldo', base * P.aguinaldo, 'b2'], ['Vacaciones', base * P.vacaciones, 'b3'], ['Prima', base * P.prima_vacacional, 'b4']];
    const tot = partes.reduce((t, p) => t + p[1], 0);
    $('#pago-body').innerHTML = tarjeta('Calcula', '¿Cuánto ganarías?', `
        <label class="pre-q" for="chk-pago">Horas a la semana <b class="mono" id="pago-val">${h} h</b></label>
        <input type="range" id="chk-pago" min="3" max="48" step="1" value="${h}" style="--p:${((h - 3) / 45) * 100}%">
        <div id="pago-res" aria-live="polite">${pagoDin(h)}</div>`, 'pre-dark')
      + tarjeta('Por hora', `$${f2(tot)} de día`, `<div class="pre-rates">
          <span><i>De día</i><b class="mono">$${f2(legal.HORA_PLATAFORMA.diurna)}</b></span>
          <span><i>Mixta</i><b class="mono">$${f2(legal.HORA_PLATAFORMA.mixta)}</b></span>
          <span><i>De noche</i><b class="mono">$${f2(legal.HORA_PLATAFORMA.nocturna)}</b></span>
        </div>
        <details class="pre-det"><summary>Ya incluye aguinaldo y vacaciones</summary>
          <div class="pre-stack">${partes.map(([, v, c]) => `<i class="${c}" style="width:${(v / tot) * 100}%"></i>`).join('')}</div>
          <ul class="pre-legend">${partes.map(([t, v, c]) => `<li><i class="${c}"></i><span>${t}</span><b class="mono">$${f2(v)}</b></li>`).join('')}</ul>
        </details>`)
      + tarjeta('Así te pagamos', 'Cada semana', `<ul class="pre-list ok compact">
          ${fila('Con recibo, por visita')}${fila('Si cancelan tarde, se paga')}${fila('Horas extra, solo si aceptas')}
        </ul>`)
      + ctaYo();
  }

  /* ---------- Relevo · Requisitos ---------- */
  const REQS = [
    ['curp', `CURP, mayor de ${legal.EDAD_MIN} años`],
    ['id', 'Identificación vigente'],
    ['ref', 'Una referencia'],
    ['disp', 'Un día y 3 h libres a la semana'],
    ['cert', 'Certificación vigente'],
    ['ct', 'Firmar tu contrato'],
  ];
  function reqDin() {
    const t = ui.reqTengo || {}, n = REQS.filter(([k]) => t[k]).length;
    return `<div class="pre-prog"><div class="pre-ring" style="--p:${(n / REQS.length) * 100}%"><b class="mono">${n}/${REQS.length}</b></div>
      <span><b>${n === REQS.length ? 'Tienes todo' : `Te falta${REQS.length - n > 1 ? 'n' : ''} ${REQS.length - n}`}</b><small>Marca lo que ya tienes</small></span></div>`;
  }
  function renderReq() {
    const t = ui.reqTengo || {};
    $('#req-body').innerHTML = tarjeta('Lo que necesitas', 'Requisitos', `<div id="req-din">${reqDin()}</div>
        <ul class="pre-chk">${REQS.map(([k, tit]) => `<li><label><input type="checkbox" data-req="${k}"${t[k] ? ' checked' : ''}><i aria-hidden="true"></i><span><b>${esc(tit)}</b></span></label></li>`).join('')}</ul>
        <p class="pre-fine">No pedimos carta de antecedentes penales.</p>`)
      + tarjeta('El trabajo', 'Qué harías y qué no', `
        <div class="pre-two cols">
          <div><div class="pre-sub">Sí</div><ul class="pre-list ok compact">${RV.TAREAS.map((x) => fila(x.replace(' (sin administrarlos)', ''))).join('')}</ul></div>
          <div><div class="pre-sub">No</div><ul class="pre-list no compact">${NO_HACE.map((x) => fila(x)).join('')}</ul></div>
        </div>`)
      + ctaYo();
  }

  /* ---------- Relevo · Asignación ---------- */
  function renderAsig() {
    $('#asig-body').innerHTML = tarjeta('Cómo funciona', 'Así te llegan los casos', `<ol class="pre-steps">
          ${pasoPre(1, 'Te registras', 'Días, horario y zona.')}
          ${pasoPre(2, 'Te revisamos', 'Documentos y una entrevista.')}
          ${pasoPre(3, 'Te ofrecemos una visita', 'La más cercana que quepa en tu horario.')}
        </ol>`)
      + tarjeta('Reglas claras', 'Te protegen', `<ul class="pre-list ok compact">
          ${fila('Sin estrellas ni ranking')}${fila('Puedes rechazar sin castigo')}${fila('Te avisamos si algo cambia')}
        </ul>`)
      + tarjeta('Tu parte', 'Cuando aceptas', `<ul class="pre-list compact">
          ${fila('Registra llegada y salida')}${fila('Si dejas un caso, avisa con una semana')}
        </ul>`)
      + ctaYo();
  }

  $('#toca-body').addEventListener('input', (e) => {
    const id = e.target.id;
    if (id !== 'chk-dia' && id !== 'chk-dias') return;
    const v = +e.target.value;
    if (id === 'chk-dia') { ui.chkDia = v; e.target.style.setProperty('--p', (v / 24) * 100 + '%'); $('#chk-dia-v').textContent = v + ' h'; }
    else { ui.chkDias = v; e.target.style.setProperty('--p', ((v - 1) / 6) * 100 + '%'); $('#chk-dias-v').textContent = v; }
    $('#toca-din').innerHTML = tocaDinamico();
  });
  $('#incluye-body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-paq]'); if (!b) return;
    ui.chkPaq = +b.dataset.paq;
    $$('#incluye-body [data-paq]').forEach((x) => x.classList.toggle('on', x === b));
    $('#paq-din').innerHTML = semanaHTML(ui.chkPaq);
  });
  $('#pago-body').addEventListener('input', (e) => {
    if (e.target.id !== 'chk-pago') return;
    const h = +e.target.value; ui.chkPago = h;
    e.target.style.setProperty('--p', ((h - 3) / 45) * 100 + '%');
    $('#pago-val').textContent = h + ' h'; $('#pago-res').innerHTML = pagoDin(h);
  });
  $('#req-body').addEventListener('change', (e) => {
    const k = e.target.dataset.req; if (!k) return;
    ui.reqTengo = Object.assign({}, ui.reqTengo, { [k]: e.target.checked });
    $('#req-din').innerHTML = reqDin();
  });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) show(b.dataset.go); });

  /* ================= Visitas y semana desde la cuidadora y la persona de relevo (26 nov 2026) =================
   * La persona de relevo registra llegada y salida; la cuidadora confirma la visita, avisa si no llegó
   * y responde las tres preguntas semanales. El Programa supervisa y corrige desde Red › Visitas. */
  const QUIEN_REG = { relevo: 'la persona de relevo', cuidadora: 'la cuidadora', programa: 'el programa' };
  function proximasVisitas(filtro, dias) {
    const hoy = F.hoyISO(), out = [];
    for (let i = 0; i < (dias || 7); i++) {
      const f = F.sumaDias(hoy, i);
      store.programadasEn(f).filter(filtro).forEach((p) => out.push(Object.assign({ fecha: f, hoy: i === 0 }, p)));
    }
    return out;
  }
  const fechaCorta = (iso) => { const d = F.desdeISO(iso); return cap(d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })).replace('.', ''); };
  const estVis = (p) => (p.reg ? p.reg.estado : 'pendiente');
  const opcionesInc = (rol) => TIPOS_INCIDENTE.filter((t) => rol === 'relevo' ? !['No llegó', 'Llegó tarde', 'Se fue antes'].includes(t) : true);
  function formIncidente(id, casos, rol) {
    if (!casos.length) return '';
    return `<details class="pre-det mi-inc"><summary>Reportar un incidente</summary>
      <form id="${id}" class="mi-incf" novalidate>
        ${casos.length > 1 ? `<select name="caso" aria-label="Caso">${casos.map((c) => `<option value="${esc(c.id)}">${esc(c.folio)} · ${esc(c.persona.alias)}</option>`).join('')}</select>` : `<input type="hidden" name="caso" value="${esc(casos[0].id)}">`}
        <select name="tipo" aria-label="Tipo de incidente"><option value="">Elige el tipo</option>${options(opcionesInc(rol))}</select>
        <input name="nota" maxlength="140" autocomplete="off" placeholder="Qué pasó (sin nombres)" aria-label="Qué pasó">
        <button class="btn-primary sm" type="submit">Enviar al programa</button>
        <p class="pre-fine">En una emergencia, llama al 911.</p>
      </form></details>`;
  }

  /* ---------- Persona de relevo ---------- */
  function panelRelevo(r) {
    const vis = proximasVisitas((p) => p.relevoId === r.id, 7);
    const casos = store.state.casos.filter((c) => c.estado === 'activo' && c.asignacion && c.asignacion.relevoId === r.id);
    const hoy = vis.filter((p) => p.hoy), prox = vis.filter((p) => !p.hoy);
    const tarjetaHoy = (p) => {
      const est = estVis(p), v = p.reg, id = esc(p.caso.id);
      let acc = '';
      if (est === 'pendiente') acc = `<button type="button" class="btn-primary wide" data-action="rv-llegue" data-id="${id}">Llegué</button>`;
      else if (est === 'en_curso') acc = `<button type="button" class="btn-primary wide" data-action="rv-sali" data-id="${id}">Salí</button>`;
      const lin = v && v.llegada ? `<div class="mi-times"><span><i>Llegada</i><b class="mono">${esc(v.llegada)}</b></span><span><i>Salida</i><b class="mono">${esc(v.salida || '—')}</b></span><span><i>Familia</i><b>${v.disputaFamilia ? 'En revisión' : v.confirmadaFamilia ? 'Confirmó' : 'Sin confirmar'}</b></span></div>` : '';
      return `<article class="mi-vis ${est}"><div class="mi-vis-top"><span class="mi-hora mono">${esc(p.ini)}-${esc(p.fin)}</span><span class="badge v-${est}">${EST_VISITA[est]}</span></div>
        <b class="mi-vis-quien">${esc(p.caso.persona.alias)}</b><small>${esc(p.caso.alcaldia)} · ${esc(p.caso.folio)}${p.caso.domicilio ? ' · ' + esc(p.caso.domicilio.texto) + ' (ficticio)' : ''}</small>
        ${lin}${acc}</article>`;
    };
    return `<section class="pre-card">
        <div class="pre-h"><span class="rx-kick">Hoy</span><h3>${hoy.length ? `${hoy.length} visita${hoy.length > 1 ? 's' : ''}` : 'Sin visitas hoy'}</h3></div>
        ${hoy.map(tarjetaHoy).join('') || `<p class="pre-p">${casos.length ? 'Tu próxima visita aparece abajo.' : 'Las visitas aparecen aquí cuando el programa te asigne un caso.'}</p>`}
      </section>
      ${prox.length ? `<section class="pre-card"><div class="pre-h"><span class="rx-kick">Próximos 7 días</span><h3>Tu semana</h3></div>
        <ul class="mi-prox">${prox.map((p) => `<li><b>${fechaCorta(p.fecha)}</b><span class="mono">${esc(p.ini)}-${esc(p.fin)}</span><span>${esc(p.caso.persona.alias)}</span></li>`).join('')}</ul></section>` : ''}
      ${casos.length ? `<section class="pre-card"><div class="pre-h"><span class="rx-kick">Algo pasó</span><h3>Avisa al programa</h3></div>${formIncidente('form-inc-rv', casos, 'relevo')}</section>` : ''}`;
  }

  /* ---------- Cuidadora ---------- */
  const CANSANCIO = ['Nada', 'Poco', 'Algo', 'Bastante', 'Mucho'];
  function panelCuidadora(c) {
    if (c.estado !== 'activo' || !c.asignacion) return '';
    const vis = proximasVisitas((p) => p.caso.id === c.id, 8), r = relById(c.asignacion.relevoId);
    const hoyV = vis.find((p) => p.hoy), prox = vis.find((p) => !p.hoy);
    let hoyHTML = '';
    if (hoyV) {
      const est = estVis(hoyV), v = hoyV.reg, id = esc(c.id);
      const quien2 = (k) => (k ? ` · registró ${QUIEN_REG[k] || k}` : '');
      const txt = est === 'pendiente' ? `${r ? esc(r.nombre) : 'Tu relevo'} llega a las ${esc(hoyV.ini)}. Aún no registra su llegada.`
        : est === 'en_curso' ? `Llegó a las ${esc(v.llegada)}${quien2(v.llegadaPor)}.`
          : est === 'realizada' ? `Llegó a las ${esc(v.llegada)} y salió a las ${esc(v.salida)}.`
            : `${EST_VISITA[est]}${quien2(v && v.marcadoPor)}.`;
      let acc = '';
      const yaEsHora = new Date().toTimeString().slice(0, 5) >= hoyV.ini; // antes de su hora no se puede reportar ausencia
      if (est === 'pendiente' && yaEsHora) acc = `<button type="button" class="btn-ghost sm danger" data-action="cu-nollego" data-id="${id}">No ha llegado</button>`;
      if ((est === 'en_curso' || est === 'realizada') && !(v && v.confirmadaFamilia)) acc = `<button type="button" class="btn-primary sm" data-action="cu-confirmo" data-id="${id}">Sí vino, confirmo</button><button type="button" class="btn-ghost sm danger" data-action="cu-nollego" data-id="${id}">No vino</button>`;
      if (v && v.confirmadaFamilia) acc = `<span class="mi-ok">Confirmaste la visita a las ${esc(v.confirmadaFamilia)}</span>`;
      if (v && v.disputaFamilia) acc = `<span class="mi-ok">Avisaste que no vino. El programa lo revisa.</span>`;
      hoyHTML = `<article class="mi-vis ${est}"><div class="mi-vis-top"><span class="mi-hora mono">Hoy · ${esc(hoyV.ini)}-${esc(hoyV.fin)}</span><span class="badge v-${est}">${EST_VISITA[est]}</span></div>
        <p class="pre-p">${txt}</p>${acc ? `<div class="btn-row">${acc}</div>` : ''}</article>`;
    }
    const qs = store.state.checkins.filter((q) => q.casoId === c.id).sort((a, b) => a.semana.localeCompare(b.semana));
    const ya = qs.find((q) => q.semana === F.lunesDe(F.hoyISO()));
    const chip = (name, val, txt, on) => `<label class="mi-chip"><input type="radio" name="${name}" value="${val}"${on ? ' checked' : ''}><span>${txt}</span></label>`;
    return `<section class="pre-card">
        <div class="pre-h"><span class="rx-kick">Tu relevo</span><h3>${hoyV ? 'Visita de hoy' : 'Próxima visita'}</h3></div>
        ${hoyHTML}
        ${prox ? `<div class="mi-next"><span><i>${hoyV ? 'Después' : 'Siguiente'}</i><b>${fechaCorta(prox.fecha)} · <span class="mono">${esc(prox.ini)}-${esc(prox.fin)}</span></b></span><span>${r ? esc(r.nombre) : ''}</span></div>` : ''}
        ${!hoyV && !prox ? '<p class="pre-p">No hay visitas en los próximos días.</p>' : ''}
      </section>
      <section class="pre-card">
        <div class="pre-h"><span class="rx-kick">Esta semana · opcional</span><h3>¿Cómo vas?</h3></div>
        <form id="form-q-cu" class="mi-q" novalidate>
          <fieldset><legend>¿Qué tan cansada o cansado te sientes?</legend><div class="mi-chips">${CANSANCIO.map((t, i) => chip('cansancio', i, t, ya && ya.cansancio === i)).join('')}</div></fieldset>
          <fieldset><legend>¿Cuántas noches dormiste mal?</legend><div class="mi-chips n">${[0, 1, 2, 3, 4, 5, 6, 7].map((n) => chip('noches', n, n, ya && ya.malasNoches === n)).join('')}</div></fieldset>
          <fieldset><legend>¿Pudiste trabajar o estudiar?</legend><div class="mi-chips">${[['si', 'Sí'], ['parcial', 'En parte'], ['no', 'No'], ['na', 'No aplica']].map(([k, t]) => chip('empleo', k, t, ya && (ya.empleo || 'na') === k)).join('')}</div></fieldset>
          <button class="btn-primary wide" type="submit">${ya ? 'Actualizar respuestas' : 'Enviar'}</button>
        </form>
        ${qs.length ? `<div class="mi-hist"><span>Tu cansancio, últimas semanas</span><div class="spark">${qs.slice(-8).map((q) => `<span title="${esc(q.semana)}"><i style="height:${6 + q.cansancio * 8}px"></i><small>${q.cansancio}</small></span>`).join('')}</div></div>` : ''}
        <p class="pre-fine">Solo lo ve el programa.</p>
      </section>
      <section class="pre-card"><div class="pre-h"><span class="rx-kick">Algo pasó</span><h3>Avisa al programa</h3></div>${formIncidente('form-inc-cu', [c], 'cuidadora')}</section>`;
  }

  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'form-q-cu') {
      e.preventDefault();
      const c = f.elements.cansancio.value, n = f.elements.noches.value, emp = f.elements.empleo.value;
      if (c === '' || n === '' || !emp) { toast('Responde las tres'); return; }
      store.addCheckin(leerId('mientras-mi-caso'), +c, +n, emp === 'na' ? null : emp, 'cuidadora'); toast('Gracias, quedó guardado');
    } else if (f.id === 'form-inc-rv' || f.id === 'form-inc-cu') {
      e.preventDefault();
      const nota = f.elements.nota.value.trim();
      if (!f.elements.tipo.value) { toast('Elige el tipo de incidente'); return; }
      if (nota.length < 4) { toast('Describe qué pasó'); return; }
      store.addIncidente({ casoId: f.elements.caso.value, reporta: f.id === 'form-inc-rv' ? 'relevo' : 'familia', tipo: f.elements.tipo.value, nota }); toast('Enviado al programa');
    }
  });

  /* ================= Mis datos y Mi convenio (26 nov 2026) ================= */
  function abrirHoja(titulo, html) {
    $('#hoja-titulo').textContent = titulo;
    $('#hoja-body').innerHTML = html;
    $('#dlg-hoja').showModal(); $('#dlg-hoja').scrollTop = 0;
  }
  const DERECHOS = [
    ['Ver', 'Pide una copia de todo lo que guardamos de ti.'],
    ['Corregir', 'Dinos qué dato está mal y cuál es el correcto.'],
    ['Cancelar', 'Pide que borremos tus datos.'],
    ['Oponerme', 'Pide que dejemos de usar un dato para algo en particular.'],
  ];
  const derechoHTML = (i) => `<b>${esc(DERECHOS[i][1])}</b><br>Escribe a ${esc(CP.contacto_datos)}.`;
  const dTile = (lab, val, nota, cls) => `<div class="md-t ${cls || ''}"><i>${esc(lab)}</i><b>${esc(val)}</b>${nota ? `<small>${esc(nota)}</small>` : ''}</div>`;
  /** Lo que se guarda de la cuidadora, de la persona cuidada y para las visitas, con los valores reales del caso. */
  function misDatosHTML(c) {
    const cu = c.cuidadora, p = c.persona, ent = c.entrevista, pq = c.paquete || c.preferencias;
    const qs = store.state.checkins.filter((q) => q.casoId === c.id).sort((a, b) => a.semana.localeCompare(b.semana));
    const nVis = store.state.visitas.filter((v) => v.casoId === c.id).length, nInc = store.state.incidentes.filter((i) => i.casoId === c.id).length;
    const cts = c.contactos || [], cp = c.consentimientoPersona || {};
    const barthel = PR.totalBarthel(ent.barthel || {}) != null;
    const tu = `<div class="md-grid">
        <div class="md-t grande lila"><i>Cuidas</i><b>${esc(cu.horas)} h</b><small>a la semana</small></div>
        <div class="md-t grande menta"><i>Respuestas semanales</i><b>${qs.length}</b><small>cansancio, sueño y trabajo o estudio</small></div>
        ${dTile('Sexo', SEXO_TXT[cu.sexo] || 'Sin dato')}
        ${dTile('Alcaldía', c.alcaldia)}
        ${dTile('Tareas de salud', ent.modelo.enfermeria ? 'Sí' : 'No')}
        ${dTile('Tu entrevista', 'Guardada', 'Cómo te sientes al cuidar')}
        ${pq && pq.dias && pq.dias.length ? dTile('Días y hora de relevo', `${diasTxt(pq.dias)} · ${pq.inicio}`, '', 'ancha') : ''}
        ${qs.length ? `<div class="md-t ancha"><i>Tu cansancio, últimas semanas</i><div class="spark">${qs.slice(-8).map((q) => `<span title="${esc(q.semana)}"><i style="height:${6 + q.cansancio * 8}px"></i><small>${q.cansancio}</small></span>`).join('')}</div></div>` : ''}
      </div>`;
    const persona = `<div class="md-grid">
        ${dTile('Alias', p.alias, '', 'lila')}
        ${dTile('Sexo', SEXO_TXT[p.sexo] || 'Sin dato', '', 'lila')}
        ${dTile('Su consentimiento', CP_ESTADO[cp.estado] || 'Sin registro', '', 'ancha menta')}
        ${dTile('Ayuda que necesita cada día', barthel ? 'Registrada' : 'Aún no se pregunta', barthel ? 'Se usa para asignar el relevo' : '', 'ancha')}
      </div>`;
    const casa = `<div class="md-grid">
        ${c.domicilio ? dTile('Domicilio para las visitas', c.domicilio.texto, 'Ficticio en este prototipo · se borra al cerrar el caso', 'ancha lila')
    : dTile('Domicilio', 'No lo tenemos', c.estado === 'cerrado' ? 'Se borró al cerrar el caso' : 'Se pide solo cuando se te asigna relevo', 'ancha lila')}
        ${cts.map((k) => dTile(k.tipo === 'emergencia' ? 'Contacto de emergencia' : 'Persona autorizada', `${k.nombre} · ${k.parentesco}`, k.telefono, 'ancha')).join('')}
        <div class="md-t ancha menta"><i>Tus contactos</i><b>${cts.length ? `${cts.length} guardado${cts.length > 1 ? 's' : ''}` : 'Ninguno'}</b>
          <button type="button" class="btn-ghost" data-action="mia-contactos">${cts.length ? 'Editar' : 'Agregar'}</button></div>
        ${dTile('Visitas registradas', String(nVis))}
        ${dTile('Incidentes', String(nInc))}
      </div>`;
    return `<div class="md">
        <div class="md-yo"><span class="md-av" aria-hidden="true">${esc(cu.alias.charAt(0).toUpperCase())}</span>
          <div><b>${esc(cu.alias)}</b><small>Solo usamos tu alias · ${esc(c.folio)}</small></div></div>
        <div class="md-tabs" role="tablist" aria-label="Tus datos">${[['tu', 'Tú'], ['persona', 'Quien cuidas'], ['casa', 'Casa y visitas']].map(([k, t], i) =>
    `<button type="button" role="tab" data-md="${k}" aria-selected="${!i}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div>
        ${[['tu', tu], ['persona', persona], ['casa', casa]].map(([k, h], i) => `<div class="md-panel" role="tabpanel" data-md-panel="${k}"${i ? ' hidden' : ''}>${h}</div>`).join('')}
        <h4 class="md-h">Nunca te pedimos</h4>
        <div class="md-no">${['CURP', 'Nombre completo', 'Diagnósticos', 'Tu edad'].map((t) => `<span>${t}</span>`).join('')}</div>
        <h4 class="md-h">Tú decides</h4>
        <div class="md-arco" role="group" aria-label="Tus derechos">${DERECHOS.map(([t], i) => `<button type="button" data-arco="${i}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div>
        <p class="md-como" id="md-como" aria-live="polite">${derechoHTML(0)}</p>
      </div>`;
  }
  const fechaLarga = (iso) => F.desdeISO(String(iso).slice(0, 10)).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  /** El convenio como documento: encabezado, partes, cifras, tareas, cláusulas y firma. Usa los datos de hoy. */
  function convenioHoja(c) {
    const doc = convenioDeCaso(c), f = c.contrato, hz = horasDe(c), dentro = valDe(c).nivel === 'dentro';
    const operador = CP.operador || 'Operador de RedCare';
    const tareas = doc.datos.tareas && doc.datos.tareas.length ? doc.datos.tareas : RV.TAREAS;
    const quienFirma = f ? f.firmante : c.cuidadora.alias;
    const estado = f ? (f.metodo === 'simulado' ? 'Firma simulada' : 'Firmado') : 'Sin firma todavía';
    return `<div class="cv-estado${f ? ' ok' : ''}"><i aria-hidden="true">${f ? '✓' : '!'}</i><div><b>${estado}</b><small>${f ? `${esc(fechaLarga(f.fecha))} · el texto muestra tus datos de hoy` : 'Así se ve el convenio con tus datos de hoy'}</small></div></div>
      <article class="cv-hoja">
        <div class="cv-marca"><img src="observatorio/ilustraciones/logo_marca.svg" alt=""><b>RedCare</b><span>${esc(c.folio)}</span></div>
        <h4>${esc(doc.titulo)}</h4>
        <p class="cv-ver">Versión ${esc(doc.version)}</p>
        <div class="cv-partes">
          <div><i>De una parte</i><b>${esc(operador)}</b><small>Opera el programa</small></div>
          <div><i>De la otra</i><b>«${esc(c.cuidadora.alias)}»</b><small>Cuida a «${esc(c.persona.alias)}»</small></div>
        </div>
        <div class="cv-cifras">
          <div><i>Horas al mes</i><b>${dentro && hz.mes ? `${hz.mes} h` : dentro ? 'En cola' : '0 h'}</b></div>
          <div><i>Costo para ti</i><b>$0</b></div>
          <div><i>Alcaldía</i><b style="font-size:12px">${esc(c.alcaldia)}</b></div>
        </div>
        <div class="cv-tareas">
          <div><h5>Sí hace</h5><ul>${tareas.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
          <div class="no"><h5>No hace</h5><ul>${NO_HACE.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
        </div>
        <p class="cv-sec">Cláusulas</p>
        <div class="cv-cls">${doc.clausulas.map((k) => `<h5>${esc(k.t)}</h5><p>${esc(k.txt)}</p>`).join('')}</div>
        <div class="cv-firma">
          <div class="cv-trazo${f ? '' : ' vacio'}">${f ? esc(quienFirma) : 'Aquí va tu firma'}</div>
          <b>«${esc(quienFirma)}» · quien cuida</b>
          ${!f ? '' : f.metodo === 'simulado' ? '<small>Firma de ejemplo</small>' : `<small>Versión firmada: ${esc(f.version)}${f.huellaTexto ? `<br>Huella ${esc(f.huellaTexto.slice(0, 8))}` : ''}</small>`}
        </div>
        <p class="cv-pie">Borrador para el prototipo. No está dictaminado jurídicamente.</p>
      </article>`;
  }
  $('#hoja-body').addEventListener('click', (e) => {
    const t = e.target.closest('[data-md]'), d = e.target.closest('[data-arco]');
    if (t) {
      $$('#hoja-body [data-md]').forEach((x) => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
      $$('#hoja-body [data-md-panel]').forEach((x) => { x.hidden = x.dataset.mdPanel !== t.dataset.md; });
    } else if (d) {
      $$('#hoja-body [data-arco]').forEach((x) => x.classList.toggle('on', x === d));
      $('#md-como').innerHTML = derechoHTML(+d.dataset.arco);
    }
  });

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
  /* 24 nov 2026: bienvenida como red. 25 nov 2026: sin ficha ni botón «Entrar»; un clic enciende el nodo
   * y su línea, y el doble clic (o doble toque) entra con ese rol. */
  const ROLES_INTRO = { cuidadora: '#aa95d1', relevo: '#7dd1c1', programa: '#e5677f' };
  function elegirRol(rol) {
    const el = $('#intro');
    el.dataset.rol = rol || '';
    $$('#intro .ie-nodo').forEach((n) => { const on = n.dataset.pick === rol; n.classList.toggle('on', on); n.setAttribute('aria-pressed', on); });
    $$('#intro .ie-l').forEach((l) => { l.classList.toggle('on', l.dataset.l === rol); });
    el.style.setProperty('--rolc', ROLES_INTRO[rol] || 'rgba(255,255,255,.35)');
  }
  function entrarRol(rol) {
    try { localStorage.setItem(INTRO_K, '1'); } catch (err) { /* sin almacenamiento */ }
    cambiarRol(rol);
    const el = $('#intro'); el.classList.add('fuera');
    setTimeout(() => { el.hidden = true; }, 350);
  }
  let toquePrevio = { rol: null, t: 0 };
  $$('#intro .ie-nodo').forEach((n) => n.addEventListener('click', (e) => {
    const rol = n.dataset.pick;
    // Se mide el tiempo entre clics porque no todos los celulares emiten «dblclick».
    // Con teclado (detail 0), Enter sobre el nodo ya encendido entra.
    const doble = e.detail === 0
      ? $('#intro').dataset.rol === rol
      : toquePrevio.rol === rol && (e.detail === 2 || e.timeStamp - toquePrevio.t < 500);
    toquePrevio = { rol, t: e.timeStamp };
    elegirRol(rol);
    if (doble) entrarRol(rol);
  }));
  $('#cfg-intro').addEventListener('click', abrirIntro);

  /* ================= Render general ================= */
  function render() {
    plan = calcularPlan();
    $('#brandline').textContent = `${CP.nombre} · ${CP.eslogan}`;
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'view-' + ui.view; });
    $$('#rolbar button').forEach((b) => { const on = b.dataset.rol === ui.rol; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $$('.tabbtn').forEach((t) => { t.hidden = t.dataset.rol !== ui.rol; });
    $$('.tabbtn').forEach((t) => { const on = t.dataset.view === ui.view; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('#topTitle').textContent = TITULOS[ui.view];
    $('#topTag').textContent = ui.view === 'seguimiento' ? { prog: 'programa · simulado', hoy: 'visitas · simulado', caso: 'datos simulados', mapa: 'territorio · simulado' }[ui.segSub] : 'datos simulados';   // 11 nov 2026: la etiqueta se ve en todos los roles
    renderAjustes();
    if (ui.view === 'mia') renderMia();
    else if (ui.view === 'yo') renderYo();
    else if (ui.view === 'toca') renderToca();
    else if (ui.view === 'incluye') renderIncluye();
    else if (ui.view === 'pasos') renderPasos();
    else if (ui.view === 'pago') renderPago();
    else if (ui.view === 'req') renderReq();
    else if (ui.view === 'asig') renderAsig();
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
