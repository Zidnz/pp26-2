/* Interfaz: peticiones (clasificador), contratación, red del hogar y configuración. */
(function () {
  'use strict';

  const { ZONAS, HABILIDADES, TURNOS, TIPOS, PARENTESCOS, store, matching, clasificador, red, legal } = Care;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const f2 = (n) => Number(n).toFixed(2);
  const cfg = () => store.state.config;
  const pubById = (id) => store.state.publicaciones.find((p) => p.id === id);
  const cuiById = (id) => store.state.cuidadores.find((c) => c.id === id);
  const PERFIL = { cuidador: 'Cuidador/a', enfermero: 'Enfermero/a', cualquiera: 'Cuidador/a o enfermero/a' };
  const ui = { view: 'publicaciones', estado: 'todas', senal: 'todas', hirePub: '', perfil: 'todos', zona: 'todas', q: '', sub: 'grafo', redPub: '', apagado: false, objetivo: null };

  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  const tags = (arr, cls) => (arr || []).map((t) => `<span class="tag ${cls || ''}">${esc(t)}</span>`).join('');
  const options = (list, sel, label) => list.map((v) => `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>${esc(label ? label(v) : v)}</option>`).join('');

  /* ---------- Modelo derivado ---------- */
  function proDe(p) {
    const h = store.contratacionDePub(p.id);
    const c = h && cuiById(h.cuiId);
    return c ? { nombre: c.nombre, horas: matching.turnosCubiertos(p, c) * cfg().horasTurno } : null;
  }
  function hogarDe(p) {
    if (p.hogar && Array.isArray(p.hogar.personas) && Array.isArray(p.hogar.relaciones)) return p.hogar;
    return Care.buildHogar({ solicitante: { nombre: p.contacto || 'Solicitante', rol: 'solicitante', horas: 30 }, cuidada: { nombre: 'Persona', rol: 'otro' }, turnos: (p.turnos || []).length, horasTurno: cfg().horasTurno });
  }
  const analisisHogar = (p, apagado) => red.analizar(hogarDe(p), proDe(p), apagado || null);
  const fragClase = (F) => (F >= 0.85 ? 'r' : F >= 0.6 ? 'a' : 'n');
  const folioDe = (p) => p.folio || p.id;
  const ok = store.aprobado;
  const pubsOk = () => store.state.publicaciones.filter(ok);
  const estadoRev = (x) => (x.verificacion || {}).estado;
  const hoyISO = (d) => { const t = d || new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); };

  function pintaReqs(ul, reqs) {
    ul.innerHTML = reqs.map((r) => `<li class="${r.ok ? 'ok' : ''}">${esc(r.txt)}${r.base ? `<small>${esc(r.base.norma)}</small>` : ''}</li>`).join('');
  }

  /* ================= Navegación ================= */
  const VIEWS = ['publicaciones', 'contratar', 'grafo', 'config'];
  const TITULOS = { publicaciones: ['Peticiones de cuidado', 'clasificador · demo'], contratar: ['Contratar cuidado', 'matching · demo'], grafo: ['Redes de cuidado', 'datos sintéticos'], config: ['Configuración', 'v0.1'] };

  function show(view) {
    if (!VIEWS.includes(view)) view = 'publicaciones';
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

  /* ================= 1. Peticiones (publicaciones) ================= */
  const CAT_COL = ['var(--accent)', 'var(--amber)', 'rgba(63,71,96,.38)'];

  function renderPubs() {
    const { publicaciones } = store.state;
    const lista = publicaciones
      .filter((p) => ui.estado === 'todas' || (ui.estado === 'revision' ? !ok(p) : ok(p) && p.estado === ui.estado))
      .filter((p) => ui.senal === 'todas' || (p.clasificacion && p.clasificacion.senal));
    const conSenal = publicaciones.filter((p) => p.clasificacion && p.clasificacion.senal).length;
    const enRev = publicaciones.filter((p) => estadoRev(p) === 'pendiente').length;
    $('#pub-count').textContent = `${publicaciones.length} peticiones · ${conSenal} con señal no declarada · ${enRev} en revisión`;
    $('#pub-list').innerHTML = lista.length ? lista.map(pubCard).join('') :
      '<div class="empty">No hay peticiones con este filtro.</div>';
  }

  function pubCard(p) {
    const cl = p.clasificacion;
    const top = cl && cl.categorias && cl.categorias[0];
    const a = analisisHogar(p);
    const cui = proDe(p) && cuiById((store.contratacionDePub(p.id) || {}).cuiId);
    const aprobada = ok(p);
    const rev = estadoRev(p);
    const cands = aprobada && p.estado === 'abierta'
      ? matching.rankPara(p, store.state.cuidadores.filter((c) => ok(c) && !store.contratacionDeCui(c.id)), cfg()).filter((r) => r.m.total >= cfg().umbral).length
      : 0;
    return `<article class="card item${p.estado === 'cubierta' ? ' done' : ''}" data-id="${esc(p.id)}">
      <div class="item-top">
        <span class="mono folio">${esc(folioDe(p))}</span>
        <span class="badges">
          ${cl && cl.senal ? '<span class="badge senal">Señal</span>' : ''}
          ${aprobada ? `<span class="badge ${p.estado}">${p.estado === 'abierta' ? 'Abierta' : 'Cubierta'}</span>` : `<span class="badge ${rev}">${rev === 'rechazada' ? 'Rechazada' : 'En revisión'}</span>`}
          ${p.urgencia === 'alta' ? '<span class="badge alta">Urgente</span>' : ''}
        </span>
      </div>
      <h3>${esc(p.titulo)}</h3>
      ${p.texto ? `<p class="quote">“${esc(p.texto)}”</p>` : ''}
      ${top ? `<div class="cls"><span style="color:var(--accent)">${esc(top.nombre)}</span><span class="mono">${f2(top.score)}</span></div>` : ''}
      <p class="meta">${esc(p.contacto)} · ${esc(p.zona)} · ${esc(p.tipo)} · busca <b>${esc(PERFIL[p.perfil] || p.perfil)}</b> · hasta <b>$${esc(p.presupuesto)}</b>/h</p>
      <div class="tags">${tags(p.necesidades)}</div>
      <div class="tags">${tags(p.turnos, 'alt')}</div>
      <div class="fragrow"><span>Fragilidad del hogar</span><b class="${fragClase(a.fragilidad)}">${f2(a.fragilidad)}</b></div>
      ${!aprobada
        ? (rev === 'rechazada'
          ? `<div class="motivo"><b>Rechazada:</b> ${esc(p.verificacion.motivo || 'sin motivo registrado')}</div>`
          : '<div class="espera">En revisión: aún no recibe candidatos ni aparece en las redes.</div>')
        : cui ? `<div class="hired">Cubierta por ${esc(cui.nombre)}</div>` : `<p class="meta">${cands} candidato${cands === 1 ? '' : 's'} sobre el umbral de compatibilidad</p>`}
      <div class="btn-row">
        ${!aprobada ? ''
          : p.estado === 'abierta'
            ? `<button class="btn-primary sm" data-action="see-candidates" data-id="${esc(p.id)}">Ver candidatos</button>`
            : `<button class="btn-ghost sm" data-action="unhire" data-id="${esc(p.id)}">Deshacer</button>`}
        ${aprobada ? `<button class="btn-ghost sm" data-action="see-red" data-id="${esc(p.id)}">Ver red</button>` : ''}
        <button class="btn-ghost sm danger" data-action="del-pub" data-id="${esc(p.id)}">Eliminar</button>
      </div>
    </article>`;
  }

  $('#pub-filter').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    ui.estado = b.dataset.val;
    $$('#pub-filter button').forEach((x) => x.classList.toggle('on', x === b));
    renderPubs();
  });
  $('#pub-senal').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    ui.senal = b.dataset.val;
    $$('#pub-senal button').forEach((x) => x.classList.toggle('on', x === b));
    renderPubs();
  });

  /* ================= 2. Contratar ================= */
  function catBars(cats) {
    return `<div class="clsbar">${cats.map((c, i) =>
      `<div><div class="l" style="color:${i ? 'var(--ink-soft)' : 'var(--ink)'}"><span>${esc(c.nombre)}</span><span class="mono">${f2(c.score)}</span></div>
       <div class="bar-track"><div class="bar-fill" style="width:${Math.round(Number(c.score) * 100)}%;background:${CAT_COL[i] || CAT_COL[2]}"></div></div></div>`).join('')}</div>`;
  }

  function senalBox(s) {
    return `<div class="darkbox"><div class="eyebrow">Necesidad no declarada</div><div class="t">${esc(s.titulo)}</div><div class="d">${esc(s.detalle)}</div></div>`;
  }

  function resumenPub(p, a) {
    const cl = p.clasificacion;
    const otras = cl && cl.derivaciones ? cl.derivaciones.filter((d) => d.accion !== 'contratar') : [];
    return `<div class="card sumcard">
      <div class="item-top"><span class="mono folio">${esc(folioDe(p))}</span><span class="badges">${cl && cl.senal ? '<span class="badge senal">Señal</span>' : ''}${p.urgencia === 'alta' ? '<span class="badge alta">Urgente</span>' : ''}</span></div>
      <h3>${esc(p.titulo)}</h3>
      <p class="meta">${esc(p.zona)} · ${esc(p.tipo)} · busca <b>${esc(PERFIL[p.perfil] || p.perfil)}</b> · hasta <b>$${esc(p.presupuesto)}</b>/h</p>
      <div class="tags">${tags(p.necesidades)}${tags(p.turnos, 'alt')}</div>
      ${cl && cl.categorias && cl.categorias.length ? catBars(cl.categorias.slice(0, 3)) : ''}
      ${cl && cl.senal ? senalBox(cl.senal) : ''}
      <div class="fragrow"><span>Fragilidad del hogar</span><b class="${fragClase(a.fragilidad)}">${f2(a.fragilidad)}</b></div>
      <div class="fragrow"><span>Horas semanales sin cubrir</span><b>${a.horasSinCubrir} h</b></div>
      ${otras.length ? `<p class="meta">También sugerido: ${otras.map((d) => esc(d.titulo)).join(' · ')}</p>` : ''}
    </div>`;
  }

  const PARTES = { hab: 'Habilidades', zona: 'Cercanía', turnos: 'Turnos', tarifa: 'Tarifa' };

  function cuiCard({ cui, m }, pub, base) {
    const h = store.contratacionDeCui(cui.id);
    const ocupado = !!h;
    const asignado = ocupado && pubById(h.pubId);
    const nivel = m ? (m.total >= 75 ? 'alto' : m.total >= cfg().umbral ? 'medio' : 'bajo') : '';
    let extra = '';
    if (m && pub) {
      const hip = red.conProfesional(hogarDe(pub), { nombre: cui.nombre, horas: matching.turnosCubiertos(pub, cui) * cfg().horasTurno });
      extra = `<div class="fragrow"><span>Si contratas · fragilidad</span><b>${f2(base.fragilidad)} <span class="arrow">→</span> ${f2(hip.fragilidad)}</b></div>
        <div class="fragrow"><span>Horas sin cubrir</span><b>${base.horasSinCubrir} h <span class="arrow">→</span> ${hip.horasSinCubrir} h</b></div>`;
    }
    const bars = m ? `<div class="score">
        <div class="score-head"><span>Compatibilidad</span><b class="lvl-${nivel}">${m.total}%</b></div>
        <div class="bar-track"><div class="bar-fill lvl-${nivel}" style="width:${m.total}%"></div></div>
        <ul class="parts">${Object.keys(PARTES).map((k) =>
          `<li><span>${PARTES[k]}</span><span class="mini"><i style="width:${Math.round(m.partes[k] * 100)}%"></i></span></li>`).join('')}</ul>
        <p class="meta">${m.km == null ? '' : `A ${m.km.toFixed(1)} km · `}$${esc(cui.tarifa)}/h</p>
      </div>` : '';
    return `<article class="card item${ocupado ? ' done' : ''}" data-id="${esc(cui.id)}">
      <div class="item-top">
        <span class="badge ${esc(cui.perfil)}">${esc(PERFIL[cui.perfil] || cui.perfil)}</span>
        <span class="rating">${cui.rating == null ? 'Sin calificaciones' : '★ ' + esc(Number(cui.rating).toFixed(1))}</span>
      </div>
      <h3>${esc(cui.nombre)}</h3>
      <p class="meta">${esc(cui.zona)} · ${esc(cui.experiencia)} año${cui.experiencia === 1 ? '' : 's'} de experiencia · $${esc(cui.tarifa)}/h</p>
      <div class="tags">${tags(cui.habilidades)}</div>
      <div class="tags">${tags(cui.turnos, 'alt')}</div>
      <p class="meta">Atiende: ${esc(cui.tipos.join(', '))}</p>
      ${cui.verificacion && cui.verificacion.origen === 'revision' ? `<div class="tags"><span class="tag alt">Documentos revisados${cui.perfil === 'enfermero' && cui.legal && cui.legal.cedula ? ' · cédula capturada' : ''}</span></div>` : ''}
      ${bars}
      ${extra}
      ${ocupado ? `<div class="hired">Contratado/a${asignado ? ' para «' + esc(asignado.titulo) + '»' : ''}</div>` : ''}
      <div class="btn-row">
        <button class="btn-primary sm" data-action="hire" data-id="${esc(cui.id)}" ${!pub || ocupado ? 'disabled' : ''}>Contratar</button>
        <button class="btn-ghost sm danger" data-action="del-cui" data-id="${esc(cui.id)}">Eliminar</button>
      </div>
    </article>`;
  }

  function renderHire() {
    const cuidadores = store.state.cuidadores.filter(ok);
    const abiertas = pubsOk().filter((p) => p.estado === 'abierta');
    if (ui.hirePub && !abiertas.some((p) => p.id === ui.hirePub)) ui.hirePub = '';
    $('#hire-pub').innerHTML = '<option value="">Sin petición (explorar)</option>' +
      abiertas.map((p) => `<option value="${esc(p.id)}"${p.id === ui.hirePub ? ' selected' : ''}>${esc(folioDe(p))} · ${esc(p.titulo)}</option>`).join('');
    $('#hire-zona').innerHTML = '<option value="todas">Todas</option>' + options(Object.keys(ZONAS), ui.zona);
    $('#hire-perfil').value = ui.perfil;

    const pub = ui.hirePub ? pubById(ui.hirePub) : null;
    const base = pub ? analisisHogar(pub) : null;
    const sum = $('#hire-summary');
    sum.hidden = !pub;
    sum.innerHTML = pub ? resumenPub(pub, base) : '';

    const q = ui.q.trim().toLowerCase();
    let filas = cuidadores
      .filter((c) => ui.perfil === 'todos' || c.perfil === ui.perfil)
      .filter((c) => ui.zona === 'todas' || c.zona === ui.zona)
      .filter((c) => !q || c.nombre.toLowerCase().includes(q) || c.habilidades.some((h) => h.toLowerCase().includes(q)))
      .map((c) => ({ cui: c, m: pub ? matching.score(pub, c, cfg()) : null }));
    if (pub) { filas = filas.filter((r) => r.m).sort((a, b) => b.m.total - a.m.total); }
    else { filas.sort((a, b) => (b.cui.rating || 0) - (a.cui.rating || 0)); }

    $('#hire-list').innerHTML = filas.length ? filas.map((r) => cuiCard(r, pub, base)).join('') :
      `<div class="empty">${pub ? 'Ningún profesional cumple el perfil y el tipo de cuidado de esta petición.' : 'No hay profesionales con estos filtros.'}</div>`;
  }

  $('#hire-pub').addEventListener('change', (e) => { ui.hirePub = e.target.value; renderHire(); });
  $('#hire-perfil').addEventListener('change', (e) => { ui.perfil = e.target.value; renderHire(); });
  $('#hire-zona').addEventListener('change', (e) => { ui.zona = e.target.value; renderHire(); });
  $('#hire-q').addEventListener('input', (e) => { ui.q = e.target.value; renderHire(); });

  /* ================= 3. Grafo (red del hogar) ================= */
  const nRel = (n) => (n === 0 ? 'Ninguno' : n === 1 ? '1 parcial' : n + ' parciales');
  const nombres = (arr) => arr.map((p) => p.nombre).join(', ');

  function renderRedSelect() {
    const pubs = pubsOk();
    if (!pubs.some((p) => p.id === ui.redPub)) { ui.redPub = pubs[0] ? pubs[0].id : ''; ui.objetivo = null; ui.apagado = false; }
    $('#red-pub').innerHTML = pubs.map((p) => `<option value="${esc(p.id)}"${p.id === ui.redPub ? ' selected' : ''}>${esc(folioDe(p))} · ${esc(p.titulo)}</option>`).join('');
  }

  function renderRed() {
    renderRedSelect();
    $$('#redes-seg button').forEach((b) => b.classList.toggle('on', b.dataset.sub === ui.sub));
    $$('#view-grafo [data-sub-panel]').forEach((p) => { p.hidden = p.dataset.subPanel !== ui.sub; });
    if (ui.sub === 'territorio') { drawTerritorio(); return; }
    drawRed();
  }

  function drawRed() {
    const p = pubById(ui.redPub);
    const svg = $('#graphSvg');
    if (!p) {
      svg.innerHTML = '';
      $('#fragScore').textContent = '—'; $('#fragLabel').textContent = 'No hay hogares cargados.';
      $('#noteBox').textContent = 'Publica una petición para ver la red de cuidado de su hogar.'; $('#redActions').innerHTML = '';
      $('#nodeBtn').hidden = true; return;
    }
    $('#nodeBtn').hidden = false;
    const base = analisisHogar(p, null);
    if (!ui.objetivo || !base.porId[ui.objetivo] || !(base.out[ui.objetivo] > 0)) ui.objetivo = base.principal;
    const X = ui.objetivo;
    const off = ui.apagado && X;
    const a = analisisHogar(p, off ? X : null);
    red.dibujar(svg, a, X, !!off);
    $('#graphWrap').classList.toggle('off', !!off);

    const nom = X ? a.porId[X].nombre : '';
    const btn = $('#nodeBtn');
    btn.textContent = off ? 'Restaurar nodo' : 'Apagar nodo' + (nom ? ' · ' + nom : '');
    btn.className = off ? 'btn-dark sm' : 'btn-alert sm';
    btn.disabled = !X;

    const fs = $('#fragScore');
    fs.classList.toggle('alert', !!off);
    fs.textContent = off ? `${a.sinCuidado.length}/${a.dependientes}` : f2(a.fragilidad);
    $('#fragLabel').textContent = off
      ? `personas quedan sin cuidado si ${nom} falta una semana`
      : 'índice de fragilidad del hogar (1.0 = un solo sostén)';
    $('#sinCuidado').textContent = a.sinCuidado.length;
    $('#conParcial').textContent = a.parcial.length;
    $('#horasSinCubrir').textContent = a.horasSinCubrir + ' h';
    $('#relevos').textContent = nRel(off ? a.relevosSinX : base.relevos);

    // Nota explicativa
    const note = $('#noteBox');
    note.classList.toggle('off', !!off);
    if (!X) {
      note.textContent = 'Este hogar no registra horas de cuidado.';
    } else if (off) {
      const restantes = a.total - base.out[X];
      if (a.relevosSinX === 0) note.textContent = `Hogar sin redundancia: ningún miembro puede absorber las tareas de ${nom}.`;
      else if (a.horasSinCubrir === 0) note.textContent = `Otros integrantes absorberían las tareas de ${nom} (${restantes} h por semana en el resto de la red).`;
      else note.textContent = `${a.relevosSinX === 1 ? 'Queda 1 sostén' : 'Quedan ' + a.relevosSinX + ' sostenes'} con ${restantes} h por semana; no alcanzan a cubrir las ${base.out[X]} h que aporta ${nom}.`;
    } else {
      const destinos = new Set(base.rel.filter((r) => r.de === X).map((r) => r.a));
      let t = `${nom} sostiene a ${destinos.size} persona${destinos.size === 1 ? '' : 's'}.`;
      base.sostenes.filter((s) => s.id !== X).slice(0, 2).forEach((s) => {
        const objs = base.rel.filter((r) => r.de === s.id).map((r) => base.porId[r.a]);
        t += ` ${s.nombre} cubre parcialmente a ${nombres(objs)}.`;
      });
      note.textContent = t;
    }
    $('#statLine').textContent = `grado ${a.grado} · concentración ${f2(base.fragilidad)} · ${base.relevos === 0 ? 'sin nodo redundante' : 'con relevo'}`;

    $('#redActions').innerHTML = p.estado === 'abierta'
      ? `<button class="btn-primary" data-action="see-candidates" data-id="${esc(p.id)}">Contratar relevo para este hogar</button>`
      : `<div class="hired" style="flex:1">Con profesional: ${esc((cuiById((store.contratacionDePub(p.id) || {}).cuiId) || {}).nombre || '')}</div>`;
  }

  /* ---- Mapa vectorial de la CDMX (límites de alcaldías: INEGI, vía datos.cdmx.gob.mx) ---- */
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
    const alcs = root.append('g');
    const nombres = root.append('g');
    const puntos = root.append('g');
    alcs.selectAll('path').data(geo.features).join('path').attr('class', 'alc').attr('d', path)
      .append('title').text((f) => f.properties.nombre);
    const centros = {};
    geo.features.forEach((f) => { centros[f.properties.nombre] = proj(d3.geoCentroid(f)); });
    nombres.selectAll('text').data(geo.features).join('text').attr('class', 'alcname')
      .attr('x', (f) => centros[f.properties.nombre][0]).attr('y', (f) => centros[f.properties.nombre][1] + 2)
      .text((f) => f.properties.nombre.replace(' de Morelos', '').replace('La Magdalena Contreras', 'Magdalena C.'));
    const zoom = d3.zoom().scaleExtent([1, 10]).translateExtent([[0, 0], [w, h]]).on('zoom', (e) => {
      root.attr('transform', e.transform);
      mapa.k = e.transform.k;
      escalarMapa();
    });
    svg.call(zoom).on('dblclick.zoom', null);
    svg.on('click', (e) => { if (!e.target.closest('.dot')) $('#mapCard').hidden = true; });
    mapa = { w, h, svg, root, alcs, nombres, puntos, centros, zoom, k: 1 };
    return true;
  }

  // Mantiene el tamaño visual de puntos y etiquetas al acercar el mapa
  function escalarMapa() {
    const k = mapa.k;
    mapa.puntos.selectAll('.dot').attr('r', 7 / k);
    mapa.puntos.selectAll('.halo').attr('r', 15 / k);
    mapa.nombres.selectAll('text').style('font-size', 7 / k + 'px')
      .style('display', (f) => (k >= 2.2 || mapa.conHogares.has(f.properties.nombre) ? null : 'none'));
  }

  function mostrarTarjeta(d) {
    const c = $('#mapCard');
    c.innerHTML = `<button type="button" class="x" data-action="map-close" aria-label="Cerrar">×</button>
      <div class="f">${esc(folioDe(d.p))} · ${esc(d.p.zona)}</div><b>${esc(d.p.titulo)}</b>
      <div class="m"><span>Fragilidad del hogar</span><span class="mono" style="color:${COLOR_FRAG[fragClase(d.F)]}">${f2(d.F)}</span></div>
      <div class="m"><span>${d.p.estado === 'abierta' ? 'Abierta' : 'Cubierta'}</span><span>${esc(d.p.tipo)}</span></div>
      <button type="button" data-action="see-red" data-id="${esc(d.p.id)}">Ver red del hogar</button>`;
    c.hidden = false;
  }

  function drawMapa(datos) {
    const el = $('#map');
    if (!window.d3 || !window.CDMX_GEO) {
      el.outerHTML = '<div class="maperr" id="map">No se pudo cargar el mapa. La lista por alcaldía de abajo sigue disponible.</div>';
      return;
    }
    if (!construirMapa()) return;
    $('#mapCard').hidden = true;
    mapa.conHogares = new Set(datos.map((d) => d.p.zona));
    mapa.alcs.selectAll('path').classed('con', (f) => mapa.conHogares.has(f.properties.nombre));
    // Un punto por hogar; los de una misma alcaldía se reparten en círculo para no encimarse
    const pts = [];
    Object.keys(ZONAS).forEach((z) => {
      const grupo = datos.filter((d) => d.p.zona === z);
      const c = mapa.centros[z]; if (!c) return;
      grupo.forEach((d, i) => {
        const ang = (2 * Math.PI * i) / grupo.length - Math.PI / 2;
        const r = grupo.length > 1 ? 11 : 0;
        pts.push({ d, x: c[0] + r * Math.cos(ang), y: c[1] + r * Math.sin(ang), color: COLOR_FRAG[fragClase(d.F)] });
      });
    });
    mapa.puntos.selectAll('*').remove();
    const g = mapa.puntos.selectAll('g').data(pts).join('g');
    g.append('circle').attr('class', 'halo').attr('cx', (p) => p.x).attr('cy', (p) => p.y).attr('fill', (p) => p.color);
    g.append('circle').attr('class', 'dot').attr('cx', (p) => p.x).attr('cy', (p) => p.y).attr('fill', (p) => p.color)
      .attr('tabindex', 0).attr('role', 'button')
      .attr('aria-label', (p) => `${folioDe(p.d.p)}, ${p.d.p.zona}, fragilidad ${f2(p.d.F)}`)
      .on('click', (e, p) => { e.stopPropagation(); mostrarTarjeta(p.d); })
      .on('keydown', (e, p) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostrarTarjeta(p.d); } });
    escalarMapa();
    $('#mapNote').textContent = 'los puntos se ubican en el centro de cada alcaldía, no en domicilios · límites: INEGI, Marco Geoestadístico 2020 (datos.cdmx.gob.mx)';
  }

  function drawTerritorio() {
    const pubs = pubsOk();
    const datos = pubs.map((p) => ({ p, F: analisisHogar(p).fragilidad }));
    drawMapa(datos);
    const solos = datos.filter((d) => d.F >= 0.85).length;
    $('#terrPct').textContent = pubs.length ? Math.round((100 * solos) / pubs.length) + '%' : '—';
    $('#terrSub').textContent = `Muestra sintética · ${pubs.length} hogar${pubs.length === 1 ? '' : 'es'} cargado${pubs.length === 1 ? '' : 's'}`;
    const zonas = Object.keys(ZONAS).filter((z) => datos.some((d) => d.p.zona === z));
    $('#terrList').innerHTML = zonas.length ? `<div class="terr">${zonas.map((z) =>
      `<div class="terr-row"><span class="z">${esc(z)}</span><span class="dots">${datos.filter((d) => d.p.zona === z).map((d) =>
        `<button class="dotbtn ${fragClase(d.F)}" data-action="see-red" data-id="${esc(d.p.id)}" title="${esc(folioDe(d.p))} · fragilidad ${f2(d.F)}" aria-label="${esc(folioDe(d.p))}, fragilidad ${f2(d.F)}"></button>`).join('')}</span></div>`).join('')}</div>`
      : '<div class="empty" style="margin-top:16px">Sin hogares para mostrar.</div>';
  }

  $('#redes-seg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    ui.sub = b.dataset.sub; renderRed();
  });
  $('#mapReset').addEventListener('click', () => { if (mapa) mapa.svg.transition().duration(300).call(mapa.zoom.transform, d3.zoomIdentity); });
  $('#red-pub').addEventListener('change', (e) => { ui.redPub = e.target.value; ui.objetivo = null; ui.apagado = false; drawRed(); });
  $('#nodeBtn').addEventListener('click', () => { ui.apagado = !ui.apagado; drawRed(); });
  function elegirNodo(g) {
    if (!g || !g.classList.contains('act')) return;
    ui.objetivo = g.dataset.id; drawRed();
  }
  $('#graphSvg').addEventListener('click', (e) => elegirNodo(e.target.closest('.g-node')));
  $('#graphSvg').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegirNodo(e.target.closest('.g-node')); }
  });

  /* ================= 4. Configuración ================= */
  const PESO_LABELS = { hab: 'Habilidades', zona: 'Cercanía', turnos: 'Turnos', tarifa: 'Tarifa' };

  function buildWeights() {
    $('#cfg-weights').innerHTML = Object.keys(PESO_LABELS).map((k) =>
      `<label class="fld">${PESO_LABELS[k]}: <b data-peso-val="${k}"></b><input type="range" min="0" max="100" step="5" data-peso="${k}"></label>`).join('');
    $$('[data-peso]').forEach((inp) => inp.addEventListener('input', () => {
      store.update((s) => { s.config.pesos[inp.dataset.peso] = +inp.value; });
    }));
  }

  function renderConfig() {
    const c = cfg();
    const suma = Object.values(c.pesos).reduce((a, b) => a + b, 0);
    Object.keys(PESO_LABELS).forEach((k) => {
      const inp = $(`[data-peso="${k}"]`);
      if (document.activeElement !== inp) inp.value = c.pesos[k];
      $(`[data-peso-val="${k}"]`).textContent = suma ? Math.round(100 * c.pesos[k] / suma) + '%' : '0%';
    });
    [['umbral', '#cfg-umbral', '%'], ['km', '#cfg-km', ' km'], ['ht', '#cfg-ht', ' h']].forEach(([k, sel, u]) => {
      const key = k === 'km' ? 'maxKm' : k === 'ht' ? 'horasTurno' : 'umbral';
      if (document.activeElement !== $(sel)) $(sel).value = c[key];
      $(sel + '-val').textContent = c[key] + u;
    });
    renderRevision();
    renderMarco();
    const s = store.state;
    $('#cfg-stats').textContent = `${s.publicaciones.length} peticiones · ${s.cuidadores.length} profesionales · ${s.contrataciones.length} contrataciones`;
  }

  function renderMarco() {
    const el = $('#cfg-marco');
    if (el.childElementCount) return;
    el.innerHTML = Object.values(legal.MARCO).map((m) => `<li><b>${esc(m.norma)}</b>${esc(m.tema)}</li>`).join('') +
      `<li><b>Criterios de la plataforma (no son ley)</b>Edad mínima ${legal.EDAD_MIN} años · carta de no antecedentes con menos de ${legal.VIGENCIA_ANTECEDENTES_DIAS} días · máximo ${legal.MAX_PETICIONES_ACTIVAS} peticiones activas por CURP · piso de $${legal.MIN_HORA.toFixed(2)}/h (salario mínimo diario de referencia ÷ 8 h; verificar el vigente).</li>`;
  }

  function revCard(tipo, x) {
    const L = x.legal || {};
    const badge = `<span class="badge ${tipo === 'pub' ? 'abierta' : x.perfil}">${tipo === 'pub' ? 'Petición' : esc(PERFIL[x.perfil] || x.perfil)}</span>`;
    let lineas;
    if (tipo === 'pub') {
      lineas = [`Solicita: ${esc(x.contacto)} · CURP ${esc(legal.enmascarar(L.curp))}`, `Relación: ${esc((legal.LEGITIMACION[L.legit] || {}).t || '—')}`,
        `${esc(x.zona)} · ${esc(x.tipo)} · hasta $${esc(x.presupuesto)}/h`];
    } else {
      lineas = [`CURP ${esc(legal.enmascarar(L.curp))} · ${esc(L.docId || 'sin documento')}`,
        x.perfil === 'enfermero' ? `Cédula profesional: ${esc(L.cedula || '—')}` : '',
        `Carta de antecedentes: ${esc(L.antecedentesFecha || '—')} · Referencia: ${esc((L.referencia || {}).nombre || '—')}`].filter(Boolean);
    }
    const rechazada = estadoRev(x) === 'rechazada';
    return `<div class="rev">
      <div class="item-top">${badge}<span class="badge ${rechazada ? 'rechazada' : 'pendiente'}">${rechazada ? 'Rechazada' : 'Pendiente'}</span></div>
      <h4>${esc(tipo === 'pub' ? x.titulo : x.nombre)}</h4>
      ${lineas.map((l) => `<p class="meta">${l}</p>`).join('')}
      ${rechazada ? `<div class="motivo" style="margin-top:8px"><b>Motivo:</b> ${esc(x.verificacion.motivo)}</div>` : ''}
      <div class="btn-row">
        ${rechazada ? '' : `<button class="btn-primary sm" data-action="aprobar" data-tipo="${tipo}" data-id="${esc(x.id)}">Aprobar</button>
        <button class="btn-ghost sm danger" data-action="rechazar" data-tipo="${tipo}" data-id="${esc(x.id)}">Rechazar</button>`}
        ${rechazada ? `<button class="btn-ghost sm danger" data-action="${tipo === 'pub' ? 'del-pub' : 'del-cui'}" data-id="${esc(x.id)}">Eliminar</button>` : ''}
      </div>
    </div>`;
  }

  function renderRevision() {
    const { publicaciones, cuidadores } = store.state;
    const items = [
      ...publicaciones.filter((p) => estadoRev(p) !== 'aprobada').map((p) => ['pub', p]),
      ...cuidadores.filter((c) => estadoRev(c) !== 'aprobada').map((c) => ['cui', c]),
    ];
    $('#cfg-revision').innerHTML = items.length ? items.map(([t, x]) => revCard(t, x)).join('') : '<div class="empty">No hay solicitudes en revisión.</div>';
  }

  $('#cfg-umbral').addEventListener('input', (e) => store.update((s) => { s.config.umbral = +e.target.value; }));
  $('#cfg-km').addEventListener('input', (e) => store.update((s) => { s.config.maxKm = +e.target.value; }));
  $('#cfg-ht').addEventListener('input', (e) => store.update((s) => { s.config.horasTurno = +e.target.value; }));

  $('#cfg-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'observatorio-cuidado.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#cfg-import').addEventListener('click', () => $('#cfg-file').click());
  $('#cfg-file').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.publicaciones) || !Array.isArray(data.cuidadores)) throw new Error('formato');
      store.replace(data);
      toast('Datos importados');
    } catch (err) { toast('Archivo no válido'); }
  });
  $('#cfg-seed').addEventListener('click', () => {
    if (confirm('Se reemplazarán peticiones, profesionales y contrataciones por los datos de ejemplo.')) { store.resetSeed(); toast('Datos de ejemplo restaurados'); }
  });
  $('#cfg-clear').addEventListener('click', () => {
    if (confirm('Se borrarán todas las peticiones, profesionales y contrataciones. ¿Continuar?')) { store.clearAll(); toast('Datos borrados'); }
  });

  /* ================= Formularios ================= */
  function chips(container, list) {
    container.innerHTML = list.map((v) => `<label class="chip"><input type="checkbox" value="${esc(v)}"><span>${esc(v)}</span></label>`).join('');
  }
  const checked = (form, name) => $$(`[data-name="${name}"] input:checked`, form).map((i) => i.value);
  function setChecked(form, name, values) {
    $$(`[data-name="${name}"] input`, form).forEach((i) => { i.checked = values.includes(i.value); });
  }

  const EJEMPLOS = [
    ['Mi mamá tiene 82 años y ya no puede quedarse sola', 'Buenas tardes, escribo porque llevo tres meses sin poder ir a trabajar. Mi mamá tiene 82 años y ya no puede quedarse sola, se cayó dos veces. Vivo con ella en la colonia Guerrero y soy la única que la puede cuidar. Quiero saber si hay algún apoyo o algún lugar donde la reciban de día.'],
    ['Dejé la escuela para cuidar', 'Dejé la prepa porque cuido a mi hermano con discapacidad y no hay quién más lo haga'],
    ['Mi esposa quedó postrada', 'Mi esposa quedó postrada tras el accidente y yo tengo que trabajar de noche, no sé qué hacer con ella sola'],
    ['Fuga de agua en mi calle', 'Fuga de agua en mi calle, lleva tres días sin repararse'],
  ];

  function apoyoRow() {
    return `<div class="apoyo">
      <label>Nombre<input name="an" maxlength="30" autocomplete="off"></label>
      <label>Parentesco<select name="ap">${options(PARENTESCOS, 'hijo', cap)}</select></label>
      <label>h/sem<input name="ah" type="number" min="0" max="168" value="10" inputmode="numeric"></label>
      <button type="button" class="x" data-action="rm-apoyo" aria-label="Quitar persona">×</button>
    </div>`;
  }

  function initForms() {
    $('#pet-tipo').innerHTML = options(TIPOS);
    $('#pet-zona').innerHTML = '<option value="">Elige zona…</option>' + options(Object.keys(ZONAS));
    $('#pet-parentesco').innerHTML = options(PARENTESCOS, 'otro', cap);
    $('#cui-zona').innerHTML = options(Object.keys(ZONAS));
    $('#cui-doc').innerHTML = '<option value="">Elige…</option>' + options(legal.DOCS_ID);
    $('#gate-legit').innerHTML = '<option value="">Elige…</option>' + Object.keys(legal.LEGITIMACION).map((k) => `<option value="${k}">${esc(legal.LEGITIMACION[k].t)}</option>`).join('');
    $('#hire-modalidad').innerHTML = '<option value="">Elige…</option>' + options(legal.MODALIDADES);
    const piso = Math.ceil(legal.MIN_HORA);
    [$('#form-pet').elements.presupuesto, $('#form-cui').elements.tarifa, $('#form-hire').elements.tarifa].forEach((i) => { i.min = piso; });
    const fa = $('#form-cui').elements.antecedentesFecha;
    fa.max = hoyISO(); fa.min = hoyISO(new Date(Date.now() - legal.VIGENCIA_ANTECEDENTES_DIAS * 86400000));
    chips($('#form-pet [data-name="necesidades"]'), HABILIDADES);
    chips($('#form-pet [data-name="turnos"]'), TURNOS);
    chips($('#form-cui [data-name="habilidades"]'), HABILIDADES);
    chips($('#form-cui [data-name="tipos"]'), TIPOS);
    chips($('#form-cui [data-name="turnos"]'), TURNOS);
    $('#pet-ejemplos').innerHTML = EJEMPLOS.map((e, i) => `<button type="button" data-action="ejemplo" data-i="${i}">${esc(e[0])}</button>`).join('');
    $$('dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    $$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  }

  function openPet() {
    const dlg = $('#dlg-pet'), f = $('#form-pet');
    f.reset();
    $('#pet-result').hidden = true; $('#pet-result').innerHTML = '';
    $('#pet-datos').hidden = true; $('#pet-apoyos').innerHTML = '';
    $('#pet-publicar').disabled = true;
    $('.form-error', f).textContent = '';
    ui.gate = null;
    $('#gate-legit').value = ''; $('#gate-mayor').checked = false; $('#gate-emerg').checked = false;
    $('#gate-msg').textContent = ''; $('#gate-msg').className = 'gate-msg';
    $('#pet-gate').hidden = false; $('#pet-body').hidden = true; $('#pet-reqs').innerHTML = '';
    dlg.showModal(); dlg.scrollTop = 0;
    $('#gate-legit').focus();
  }

  /* --- Filtro de admisión: sin pasarlo no se puede redactar la petición --- */
  $('#gate-ok').addEventListener('click', () => {
    const a = { mayor: $('#gate-mayor').checked, legit: $('#gate-legit').value, emergencia: $('#gate-emerg').checked };
    const r = legal.admisionPeticion(a);
    const msg = $('#gate-msg');
    msg.textContent = r.ok ? '' : r.motivo;
    msg.className = 'gate-msg' + (r.emergencia ? ' emerg' : '');
    if (!r.ok) return;
    ui.gate = { legit: a.legit };
    const pide = legal.LEGITIMACION[a.legit].pide;
    $('#pet-acredita-row').hidden = !pide;
    $('#pet-acredita-txt').textContent = pide || '';
    $('#pet-gate').hidden = true; $('#pet-body').hidden = false;
    $('#pet-texto').focus();
    refreshPet();
  });

  function datosLegalPet() {
    const e = $('#form-pet').elements;
    const curp = e.curp.value.trim().toUpperCase();
    const v = legal.validarCURP(curp);
    return {
      curp, legit: ui.gate && ui.gate.legit, acredita: e.acredita.checked, edadCuidada: e.pedad.value === '' ? null : +e.pedad.value,
      presupuesto: +e.presupuesto.value || 0, contrato: e.contrato.checked, imss: e.imss.checked, condiciones: e.condiciones.checked,
      privacidad: e.privacidad.checked, sensibles: e.sensibles.checked, veracidad: e.veracidad.checked,
      duplicada: v.ok && store.peticionesActivasDe(v.curp) >= legal.MAX_PETICIONES_ACTIVAS,
    };
  }

  function refreshPet() {
    const visible = !$('#pet-datos').hidden;
    if (!visible || !ui.gate) { $('#pet-publicar').disabled = true; $('#pet-reqs').innerHTML = ''; return; }
    const reqs = legal.requisitosPeticion(datosLegalPet());
    pintaReqs($('#pet-reqs'), reqs);
    $('#pet-publicar').disabled = legal.pendientes(reqs).length > 0;
  }
  ['input', 'change'].forEach((ev) => $('#form-pet').addEventListener(ev, refreshPet));
  function openCui() {
    const dlg = $('#dlg-cui'), f = $('#form-cui');
    f.reset(); $('.form-error', f).textContent = '';
    dlg.showModal(); dlg.scrollTop = 0;
    refreshCui();
  }

  function datosLegalCui() {
    const e = $('#form-cui').elements;
    const curp = e.curp.value.trim().toUpperCase();
    const v = legal.validarCURP(curp);
    return {
      curp, perfil: e.perfil.value, docId: e.docId.value, cedula: e.cedula.value.trim(), alcance: e.alcance.checked,
      antecedentesFecha: e.antecedentesFecha.value, refNombre: e.refNombre.value, refTel: e.refTel.value, tarifa: +e.tarifa.value || 0,
      contrato: e.contrato.checked, privacidad: e.privacidad.checked, veracidad: e.veracidad.checked,
      duplicada: v.ok && store.existeCuidadorCURP(v.curp),
    };
  }

  function refreshCui() {
    const d = datosLegalCui();
    $('#cui-enf').hidden = d.perfil !== 'enfermero';
    const reqs = legal.requisitosProfesional(d);
    pintaReqs($('#cui-reqs'), reqs);
    $('#cui-enviar').disabled = legal.pendientes(reqs).length > 0;
  }
  ['input', 'change'].forEach((ev) => $('#form-cui').addEventListener(ev, refreshCui));

  /* --- Formalización de la contratación --- */
  function datosHire() {
    const e = $('#form-hire').elements;
    return { tarifa: +e.tarifa.value || 0, modalidad: e.modalidad.value, escrito: e.escrito.checked, imss: e.imss.checked, descansos: e.descansos.checked };
  }
  function refreshHire() {
    const reqs = legal.requisitosContratacion(datosHire());
    pintaReqs($('#hire-reqs'), reqs);
    $('#hire-ok').disabled = legal.pendientes(reqs).length > 0;
  }
  function openHire(cuiId) {
    const p = pubById(ui.hirePub), c = cuiById(cuiId);
    if (!p || !c || !ok(p) || !ok(c)) return;
    const f = $('#form-hire');
    f.reset();
    ui.hireCui = cuiId;
    $('#hire-who').textContent = `${c.nombre} para «${p.titulo}»`;
    f.elements.tarifa.value = c.tarifa;
    $('#dlg-hire').showModal();
    refreshHire();
  }
  ['input', 'change'].forEach((ev) => $('#form-hire').addEventListener(ev, refreshHire));
  $('#form-hire').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = datosHire();
    if (legal.pendientes(legal.requisitosContratacion(d)).length) return;
    const p = pubById(ui.hirePub), c = cuiById(ui.hireCui);
    if (!p || !c) return;
    const antes = analisisHogar(p);
    if (!store.hire(p.id, c.id, Object.assign(d, { fecha: hoyISO() }))) { toast('No se puede contratar: la petición y el profesional deben estar aprobados'); return; }
    $('#dlg-hire').close();
    toast(`${c.nombre} contratado/a · fragilidad ${f2(antes.fragilidad)} → ${f2(analisisHogar(p).fragilidad)}`);
  });

  function showDatos(on) {
    $('#pet-datos').hidden = !on;
    refreshPet();
  }

  function fillDatos(a) {
    const f = $('#form-pet'), e = f.elements;
    e.titulo.value = a.titulo;
    e.pnombre.value = a.cuidada.nombre;
    e.pedad.value = a.cuidada.edad == null ? '' : a.cuidada.edad;
    e.pparentesco.value = PARENTESCOS.includes(a.cuidada.rol) ? a.cuidada.rol : 'otro';
    e.tipo.value = a.tipo; e.perfil.value = a.perfil; e.zona.value = a.zona || '';
    e.presupuesto.value = a.presupuesto; e.urgencia.value = a.urgencia; e.horas.value = 30;
    setChecked(f, 'necesidades', a.necesidades); setChecked(f, 'turnos', a.turnos);
    $('#pet-apoyos').innerHTML = '';
  }

  function resultadoHTML(a, texto) {
    const leyenda = '<div class="evlegend"><span><i style="background:rgba(97,85,134,.4)"></i>dependencia</span><span><i style="background:rgba(169,113,26,.5)"></i>pérdida de ingreso</span><span><i style="background:rgba(192,67,90,.4)"></i>riesgo físico</span></div>';
    let h = '<div class="eyebrow sep">Clasificación</div>';
    h += a.categorias.length ? catBars(a.categorias) : '<p class="meta" style="margin-top:10px">Sin categorías reconocidas por las reglas.</p>';
    if (!a.esCuidado) {
      h += '<div class="warnbox">Esta petición no parece una solicitud de cuidado' + (a.categorias[0] ? ' (categoría principal: ' + esc(a.categorias[0].nombre) + ')' : '') + '. No se publica como petición de cuidado; si es un caso de cuidado, puedes llenar los datos a mano.</div>';
    } else {
      if (a.senal) h += senalBox(a.senal);
      if (a.derivaciones.length) {
        h += '<div class="eyebrow" style="margin-top:16px">Derivación sugerida</div><div class="deriv">' +
          a.derivaciones.map((d, i) => `<div class="${i === 0 ? 'first' : ''}"><div class="t">${esc(d.titulo)}</div><div class="d">${esc(d.razon)}</div></div>`).join('') + '</div>';
      }
      if (a.evidencia.length) {
        h += `<button type="button" class="evtoggle" data-action="toggle-ev">Ver evidencia resaltada en el texto</button>
          <div class="evbox" id="pet-evidencia" hidden><p>${clasificador.resaltar(texto, a.evidencia)}</p>${leyenda}</div>`;
      }
    }
    h += '<div class="notecls">clasificador de reglas (demo): los puntajes son heurísticos, no un modelo entrenado · las derivaciones son sugerencias generales sin verificar disponibilidad</div>';
    return h;
  }

  function analizarPeticion() {
    const f = $('#form-pet'), err = $('.form-error', f);
    const texto = $('#pet-texto').value.trim();
    if (!texto) { err.textContent = 'Escribe o pega una petición.'; return; }
    err.textContent = '';
    const a = clasificador.analizar(texto);
    const box = $('#pet-result');
    box.innerHTML = resultadoHTML(a, texto);
    box.hidden = false;
    if (a.esCuidado) { fillDatos(a); showDatos(true); } else { showDatos(false); }
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  $('#pet-analizar').addEventListener('click', analizarPeticion);
  $('#pet-manual').addEventListener('click', () => {
    $('#pet-result').hidden = true; $('#pet-result').innerHTML = '';
    showDatos(true);
    $('#form-pet').elements.titulo.focus();
  });
  $('#pet-add-apoyo').addEventListener('click', () => {
    if ($$('#pet-apoyos .apoyo').length >= 4) return;
    $('#pet-apoyos').insertAdjacentHTML('beforeend', apoyoRow());
  });

  $('#form-pet').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, v = (n) => f.elements[n].value.trim();
    const err = $('.form-error', f);
    const necesidades = checked(f, 'necesidades'), turnos = checked(f, 'turnos');
    const presupuesto = +v('presupuesto');
    if (!v('titulo') || !v('contacto')) { err.textContent = 'Escribe un título y quién solicita.'; return; }
    if (!v('zona')) { err.textContent = 'Elige la zona.'; return; }
    if (!turnos.length) { err.textContent = 'Elige al menos un turno.'; return; }
    if (!(presupuesto > 0)) { err.textContent = 'El presupuesto debe ser mayor que cero.'; return; }
    const dl = datosLegalPet();
    const falta = legal.pendientes(legal.requisitosPeticion(dl));
    if (falta.length) { err.textContent = 'Falta cumplir: ' + falta[0].txt + '.'; return; }
    const apoyos = $$('.apoyo', f).map((row) => ({
      nombre: $('[name="an"]', row).value.trim(), rol: $('[name="ap"]', row).value, horas: Math.max(0, +$('[name="ah"]', row).value || 0),
    })).filter((x) => x.nombre);
    const texto = $('#pet-texto').value.trim();
    const hogar = Care.buildHogar({
      solicitante: { nombre: v('contacto'), rol: 'solicitante', horas: Math.max(0, +v('horas') || 0) },
      cuidada: { nombre: v('pnombre') || 'Persona', edad: +v('pedad') || null, rol: v('pparentesco') },
      apoyos, turnos: turnos.length, horasTurno: cfg().horasTurno,
    });
    const pub = {
      id: store.uid('p'), folio: store.nextFolio(), titulo: v('titulo'), contacto: v('contacto'), texto,
      tipo: v('tipo'), perfil: v('perfil'), necesidades, zona: v('zona'), turnos, presupuesto, urgencia: v('urgencia'),
      hogar, estado: 'abierta', fecha: new Date().toISOString().slice(0, 10),
      clasificacion: texto ? clasificador.resumen(clasificador.analizar(texto)) : null,
      legal: {
        curp: dl.curp, legit: dl.legit, acredita: dl.acredita, contrato: true, imss: true, condiciones: true, privacidad: true, sensibles: true, veracidad: true,
        aceptado: new Date().toISOString(),
      },
      verificacion: { estado: 'pendiente', fecha: hoyISO() },
    };
    store.update((s) => s.publicaciones.unshift(pub));
    $('#dlg-pet').close();
    ui.estado = 'revision'; ui.senal = 'todas';
    $$('#pub-filter button').forEach((x) => x.classList.toggle('on', x.dataset.val === 'revision'));
    $$('#pub-senal button').forEach((x) => x.classList.toggle('on', x.dataset.val === 'todas'));
    render();
    toast(`Petición ${pub.folio} enviada a revisión`);
  });

  $('#form-cui').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, v = (n) => f.elements[n].value.trim();
    const err = $('.form-error', f);
    const habilidades = checked(f, 'habilidades'), tipos = checked(f, 'tipos'), turnos = checked(f, 'turnos');
    if (!v('nombre')) { err.textContent = 'Escribe el nombre.'; return; }
    if (!tipos.length || !turnos.length) { err.textContent = 'Elige al menos un tipo de cuidado y un turno.'; return; }
    if (!(+v('tarifa') > 0)) { err.textContent = 'La tarifa debe ser mayor que cero.'; return; }
    const dl = datosLegalCui();
    const falta = legal.pendientes(legal.requisitosProfesional(dl));
    if (falta.length) { err.textContent = 'Falta cumplir: ' + falta[0].txt + '.'; return; }
    store.update((s) => s.cuidadores.unshift({
      id: store.uid('c'), nombre: v('nombre'), perfil: v('perfil'), habilidades, tipos, zona: v('zona'),
      turnos, tarifa: +v('tarifa'), experiencia: Math.max(0, +v('experiencia') || 0), rating: null,
      legal: {
        curp: dl.curp, docId: dl.docId, cedula: dl.perfil === 'enfermero' ? dl.cedula : '', antecedentesFecha: dl.antecedentesFecha,
        referencia: { nombre: dl.refNombre.trim(), tel: dl.refTel.replace(/\D/g, '') }, aceptado: new Date().toISOString(),
      },
      verificacion: { estado: 'pendiente', fecha: hoyISO() },
    }));
    $('#dlg-cui').close();
    toast('Registro enviado a revisión: no será visible hasta que se aprueben tus documentos');
  });

  /* ================= Acciones (delegación) ================= */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const id = b.dataset.id;
    switch (b.dataset.action) {
      case 'new-pub': openPet(); break;
      case 'new-cui': openCui(); break;
      case 'ejemplo': $('#pet-texto').value = EJEMPLOS[+b.dataset.i][1]; analizarPeticion(); break;
      case 'toggle-ev': {
        const box = $('#pet-evidencia'); box.hidden = !box.hidden;
        b.textContent = box.hidden ? 'Ver evidencia resaltada en el texto' : 'Ocultar evidencia';
        break;
      }
      case 'map-close': $('#mapCard').hidden = true; break;
      case 'rm-apoyo': b.closest('.apoyo').remove(); break;
      case 'see-candidates': ui.hirePub = id; show('contratar'); break;
      case 'see-red': ui.redPub = id; ui.sub = 'grafo'; ui.objetivo = null; ui.apagado = false; show('grafo'); break;
      case 'hire': if (ui.hirePub) openHire(id); break;
      case 'aprobar':
        if (confirm('¿Confirmas que revisaste los datos y documentos y cumplen los requisitos?')) { store.resolver(b.dataset.tipo, id, true); toast('Aprobado'); }
        break;
      case 'rechazar': {
        const motivo = (prompt('Motivo del rechazo (obligatorio, se muestra a la persona solicitante):') || '').trim();
        if (!motivo) { toast('El rechazo requiere un motivo'); break; }
        store.resolver(b.dataset.tipo, id, false, motivo); toast('Rechazado');
        break;
      }
      case 'unhire': store.unhire(id); toast('Contratación deshecha'); break;
      case 'del-pub': if (confirm('¿Eliminar esta petición?')) store.removePub(id); break;
      case 'del-cui': if (confirm('¿Eliminar a este profesional?')) store.removeCui(id); break;
    }
  });

  /* ================= Render general ================= */
  function render() {
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'view-' + ui.view; });
    $$('.tabbtn').forEach((t) => {
      const on = t.dataset.view === ui.view;
      t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
    });
    let [titulo, tag] = TITULOS[ui.view];
    if (ui.view === 'grafo') {
      const p = pubById(ui.redPub) || pubsOk()[0];
      titulo = ui.sub === 'territorio' ? 'Redes de cuidado · Territorio' : 'Redes de cuidado' + (p ? ' · Hogar ' + folioDe(p) : '');
    }
    $('#topTitle').textContent = titulo; $('#topTag').textContent = tag;
    renderConfig();
    if (ui.view === 'publicaciones') renderPubs();
    else if (ui.view === 'contratar') renderHire();
    else if (ui.view === 'grafo') renderRed();
  }

  function tick() {
    const d = new Date();
    $('#clock').textContent = 'v0.1 · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  store.subscribe(render);
  store.init();
  buildWeights();
  initForms();
  tick(); setInterval(tick, 30000);
  show(location.hash.slice(1));
})();
