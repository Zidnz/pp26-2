/* Observatorio del Cuidado · js/vistas/nodo.js
   Pestaña Método, caja «El nodo»: réplica de la pantalla «Red» de la app con un CASO DE EJEMPLO de DATOS SINTÉTICOS
   (hogar de Marisol, caso C-0001 de Frontend/js/data.js; relevo de Rosa, 7 h). No viene de la ENASIC ni de otra encuesta.
   analizar / posiciones / dibujar son copia de Frontend/js/red.js y el resto de drawRed de Frontend/js/app.js: si cambian
   allá, hay que sincronizar aquí. Ninguna cifra está escrita a mano: todas se calculan de HOGAR y PRO. */
(function () {
  'use strict';
  const host = document.getElementById('nodoEj'); if (!host) return;

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const corto = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const r1 = (n) => Math.round(n * 10) / 10;
  const f2 = (x) => x.toFixed(2);
  const fragClase = (x) => (x >= 0.85 ? 'r' : x >= 0.6 ? 'a' : 'n');
  const movimiento = () => !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const HOGAR = {
    foco: 'elvira',
    personas: [
      { id: 'marisol', nombre: 'Marisol', edad: 47, rol: 'hija' }, { id: 'elvira', nombre: 'Elvira', edad: 82, rol: 'madre', necesita: 70 },
      { id: 'tomas', nombre: 'Tomás', edad: 51, rol: 'esposo' }, { id: 'ana', nombre: 'Ana', edad: 14, rol: 'hija' },
      { id: 'beto', nombre: 'Beto', edad: 9, rol: 'hijo' }, { id: 'nico', nombre: 'Nico', edad: 3, rol: 'nieto' }],
    relaciones: [
      { de: 'marisol', a: 'elvira', horas: 40 }, { de: 'marisol', a: 'ana', horas: 20 }, { de: 'marisol', a: 'beto', horas: 20 },
      { de: 'marisol', a: 'nico', horas: 46 }, { de: 'tomas', a: 'nico', horas: 10 }]
  };
  const PRO = { nombre: 'Rosa', horas: 7 };

  /* ---- copia de red.js ---- */
  function analizar(hogar, pro, apagado) {
    const personas = hogar.personas.map((p) => Object.assign({}, p));
    const rel = hogar.relaciones.map((r) => Object.assign({}, r));
    if (pro) {
      personas.push({ id: 'pro', nombre: pro.nombre.split(' ')[0], edad: null, rol: 'relevo', pro: true });
      if (pro.horas > 0) rel.push({ de: 'pro', a: hogar.foco, horas: pro.horas });
    }
    const inc = {}, out = {};
    personas.forEach((p) => { inc[p.id] = 0; out[p.id] = 0; });
    rel.forEach((r) => { out[r.de] += r.horas; inc[r.a] += r.horas; });
    const total = rel.reduce((t, r) => t + r.horas, 0);
    const need = (p) => Math.max(p.necesita || 0, inc[p.id]);
    let principal = null;
    personas.forEach((p) => { if (out[p.id] > 0 && (!principal || out[p.id] > out[principal])) principal = p.id; });
    const fragilidad = total > 0 ? out[principal] / total : 0;
    const porId = {};
    personas.forEach((p) => { porId[p.id] = p; });
    const sostenes = personas.filter((p) => out[p.id] > 0);
    const info = { personas, rel, inc, out, need, total, principal, fragilidad, porId, sostenes };
    const rest = {};
    personas.forEach((p) => { rest[p.id] = 0; });
    rel.forEach((r) => { if (r.de !== apagado) rest[r.a] += r.horas; });
    const deps = personas.filter((p) => p.id !== apagado && need(p) > 0);
    const estado = {}, sin = [], parcial = [];
    let horasSinCubrir = 0;
    deps.forEach((p) => {
      const perdido = inc[p.id] - rest[p.id];
      horasSinCubrir += Math.max(0, need(p) - rest[p.id]);
      if (rest[p.id] === 0) { sin.push(p); estado[p.id] = 'sin'; }
      else if (apagado && perdido > 0) { parcial.push(p); estado[p.id] = 'parcial'; }
    });
    info.estado = estado; info.sinCuidado = sin; info.parcial = parcial; info.dependientes = deps.length;
    info.horasSinCubrir = horasSinCubrir;
    info.relevosSinX = sostenes.filter((p) => p.id !== apagado).length;
    info.apagado = apagado;
    return info;
  }

  function posiciones(info) {
    const cx = 150, cy = 122, rx = 100, ry = 88;
    const centro = info.principal || (info.personas[0] && info.personas[0].id);
    const pendientes = info.personas.filter((p) => p.id !== centro);
    const vecinos = (a, b) => info.rel.some((r) => r.de !== centro && r.a !== centro && ((r.de === a && r.a === b) || (r.de === b && r.a === a)));
    const otros = [];
    while (pendientes.length) {
      const ult = otros[otros.length - 1];
      let i = ult ? pendientes.findIndex((p) => vecinos(ult.id, p.id)) : -1;
      if (i < 0) i = 0;
      otros.push(pendientes.splice(i, 1)[0]);
    }
    const pos = {}; pos[centro] = [cx, cy];
    const n = otros.length;
    otros.forEach((p, i) => {
      const a = ((-145 + (n === 1 ? 175 : (360 / n) * i)) * Math.PI) / 180;
      pos[p.id] = [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    });
    return { pos, centro };
  }

  function dibujar(svg, info, objetivo, apagadoActivo) {
    const { pos, centro } = posiciones(info);
    const anim = movimiento();
    let aristas = '', etiquetas = '', particulas = '', nodos = '';
    info.rel.forEach((r, i) => {
      const a = pos[r.de], b = pos[r.a];
      if (!a || !b) return;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const curva = (r.de < r.a ? 1 : -1) * 16;
      const cxp = (a[0] + b[0]) / 2 - (dy / len) * curva, cyp = (a[1] + b[1]) / 2 + (dx / len) * curva;
      const d = `M${r1(a[0])} ${r1(a[1])} Q${r1(cxp)} ${r1(cyp)} ${r1(b[0])} ${r1(b[1])}`;
      const parcial = r.horas < 0.5 * info.need(info.porId[r.a]);
      const cae = apagadoActivo && r.de === info.apagado;
      const cls = 'g-edge' + (parcial ? ' parcial' : '') + (r.de === 'pro' ? ' pro' : '') + (cae ? ' off' : '');
      aristas += `<path class="${cls}" d="${d}" stroke-width="${r1(1.6 + Math.min(r.horas, 60) / 24)}"><title>${esc(info.porId[r.de].nombre)} → ${esc(info.porId[r.a].nombre)}: ${r.horas} h/sem</title></path>`;
      const tt = 0.64, k0 = (1 - tt) * (1 - tt), k1 = 2 * tt * (1 - tt), k2 = tt * tt;
      const mx = k0 * a[0] + k1 * cxp + k2 * b[0], my = k0 * a[1] + k1 * cyp + k2 * b[1];
      etiquetas += `<g class="g-h${cae ? ' off' : ''}"><rect x="${r1(mx - 11)}" y="${r1(my - 6.5)}" width="22" height="13" rx="6.5"/><text x="${r1(mx)}" y="${r1(my + 3)}" text-anchor="middle">${r.horas}h</text></g>`;
      if (anim && !cae) {
        const dur = r1(2.2 + (i % 3) * 0.5);
        particulas += `<circle class="g-p${r.de === 'pro' ? ' pro' : ''}" r="2.3"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${d}"/></circle>`;
      }
    });
    info.personas.forEach((p) => {
      const [x, y] = pos[p.id];
      const hub = p.id === centro;
      const radio = hub ? 25 : 18;
      const off = apagadoActivo && p.id === info.apagado;
      const st = apagadoActivo ? info.estado[p.id] : (info.estado[p.id] === 'sin' ? 'sin' : '');
      const cls = ['g-node', hub ? 'hub' : '', p.pro ? 'pro' : '', off ? 'off' : '', st, p.id === objetivo ? 'sel' : '', info.out[p.id] > 0 ? 'act' : ''].filter(Boolean).join(' ');
      const sub = (p.edad ? p.edad + ' · ' : '') + p.rol;
      const ini = esc((p.nombre || '?').trim().charAt(0).toUpperCase());
      nodos += `<g class="${cls}" data-id="${esc(p.id)}" ${info.out[p.id] > 0 ? 'tabindex="0" role="button"' : ''} aria-label="${esc(p.nombre)}, ${esc(sub)}">` +
        (p.id === objetivo ? `<circle class="g-pulse" cx="${r1(x)}" cy="${r1(y)}" r="${radio + 4}"/>` : '') +
        `<circle class="g-c" cx="${r1(x)}" cy="${r1(y)}" r="${radio}"/>` +
        `<text class="g-i" x="${r1(x)}" y="${r1(y + (hub ? 5 : 4))}" text-anchor="middle" font-size="${hub ? 15 : 12}">${ini}</text>` +
        `<text class="g-n" x="${r1(x)}" y="${r1(y + radio + 10)}" text-anchor="middle" font-size="9">${esc(corto(p.nombre, 10))}</text>` +
        `<text class="g-s" x="${r1(x)}" y="${r1(y + radio + 19)}" text-anchor="middle" font-size="6.8">${esc(corto(sub, 16))}</text></g>`;
    });
    svg.innerHTML = aristas + particulas + etiquetas + nodos;
  }

  /* ---- estructura (mismas piezas que la pantalla Red de la app) ---- */
  host.innerHTML =
    '<div class="rc-col"><div class="rc-card graphcard"><div class="ghead"></div>' +
    '<svg class="g-svg" viewBox="0 0 300 250" role="img" aria-label="Red de cuidado del hogar de Marisol (ejemplo con datos sintéticos)"></svg>' +
    '<div class="glegend"><span><i class="lg"></i> cuida</span><span><i class="lg dashed"></i> parcial</span><span><i class="lg pro"></i> relevo del programa</span></div></div>' +
    '<p class="rc-note" aria-live="polite"></p><button type="button" class="btn btn-ghost rc-toggle"></button></div>' +
    '<div class="rc-col"><div class="rc-card panel nodeinfo"></div>' +
    '<div class="redbar"><div><b class="mono fs"></b><span class="fl">fragilidad</span></div><div><b class="mono cp"></b><span>cuidado cubierto</span></div><div><b class="mono hs"></b><span>sin cubrir</span></div></div>' +
    '<div class="rc-card panel dep-card"><div class="eyebrow">Quién necesita cuidado</div><div class="dep-list"></div></div></div>';
  const $ = (q) => host.querySelector(q);
  const svg = $('.g-svg'), card = $('.graphcard'), head = $('.ghead'), info = $('.nodeinfo'), note = $('.rc-note'), tog = $('.rc-toggle');
  const ui = { objetivo: null, apagado: false, relevo: true };

  function render() {
    const pro = ui.relevo ? PRO : null;
    const base = analizar(HOGAR, pro, null);
    if (!ui.objetivo || !base.porId[ui.objetivo] || !(base.out[ui.objetivo] > 0)) ui.objetivo = base.principal;
    const X = ui.objetivo, off = !!(ui.apagado && X);
    const a = analizar(HOGAR, pro, off ? X : null);
    dibujar(svg, a, X, off);
    card.classList.toggle('off', off);
    const nom = a.porId[X].nombre;
    const cl = fragClase(base.fragilidad);
    const rec = (id) => a.rel.filter((r) => r.a === id && !(off && r.de === X)).reduce((t, r) => t + r.horas, 0);
    const deps = a.personas.filter((p) => p.id !== (off ? X : null) && a.need(p) > 0);
    const nec = deps.reduce((t, p) => t + a.need(p), 0), cub = deps.reduce((t, p) => t + Math.min(rec(p.id), a.need(p)), 0);
    const cob = nec ? Math.round((cub / nec) * 100) : 100;
    const ETQ = { r: 'Un solo sostén', a: 'Sostén parcial', n: 'Cuidado repartido' };
    head.innerHTML = `<span class="gh-n"><b>${a.personas.length}</b> personas</span><span class="gh-n"><b>${base.sostenes.length}</b> cuidan</span><span class="gh-n"><b>${Math.round(base.total)}</b> h/sem</span><span class="gh-t t-${cl}">${ETQ[cl]}</span>`;
    const fs = $('.fs');
    fs.textContent = off ? `${a.sinCuidado.length}/${a.dependientes}` : f2(a.fragilidad);
    fs.className = 'mono fs ' + (off ? 'r' : fragClase(a.fragilidad));
    $('.fl').textContent = off ? 'sin cuidado' : 'fragilidad';
    const cp = $('.cp'); cp.textContent = cob + '%'; cp.className = 'mono cp ' + (cob >= 100 ? 'n' : cob >= 60 ? 'a' : 'r');
    $('.hs').textContent = a.horasSinCubrir + ' h';

    const lista = (rs, k) => rs.map((r) => `<span class="pill"><span>${esc(a.porId[r[k]].nombre)}</span><b>${r.horas} h</b></span>`).join('');
    const da = a.rel.filter((r) => r.de === X), rb = a.rel.filter((r) => r.a === X && !(off && r.de === X));
    const P = a.porId[X], nP = a.need(P), rP = rec(X);
    const tag = off ? ['off', 'Apagada · simulación'] : P.pro ? ['pro', 'Relevo del programa'] : X === a.principal ? ['hub', 'Sostén principal'] : ['', 'Cuida'];
    info.innerHTML = `
      <div class="ni-top"><span class="ni-av ${P.pro ? 'pro' : X === a.principal ? 'hub' : ''}">${esc(P.nombre.charAt(0).toUpperCase())}</span>
        <div class="ni-id"><b>${esc(P.nombre)}</b><small>${esc((P.edad ? P.edad + ' años · ' : '') + P.rol)}</small></div><span class="ni-tag ${tag[0]}">${tag[1]}</span></div>
      <div class="ni-rows">
        <div><i>Cuida a</i><span class="pills">${lista(da, 'a') || '<em>a nadie</em>'}</span></div>
        <div><i>Recibe de</i><span class="pills">${lista(rb, 'de') || '<em>de nadie</em>'}</span></div>
        ${nP > 0 ? `<div><i>Necesita</i><span class="ni-cov"><span class="cbar"><i style="width:${Math.min(100, Math.round((rP / nP) * 100))}%"></i></span><b class="mono">${rP} de ${nP} h</b></span></div>` : ''}
      </div>
      <button type="button" class="btn ${off ? 'btn-dark' : 'btn-alert'}" data-action="apagar">${off ? 'Restaurar' : 'Apagar a ' + esc(nom)}</button>`;

    $('.dep-list').innerHTML = deps.map((p) => {
      const n = a.need(p), r = rec(p.id), pc = Math.min(100, Math.round((r / n) * 100)), k = r === 0 ? 'r' : r < n ? 'a' : 'n';
      return `<div class="dep"><span class="dn">${esc(p.nombre)}<small>${esc((p.edad ? p.edad + ' · ' : '') + p.rol)}</small></span><span class="cbar ${k}"><i style="width:${pc}%"></i></span><b class="mono">${r}/${n} h</b></div>`;
    }).join('');

    note.classList.toggle('off', off);
    if (off) note.textContent = a.relevosSinX === 0 ? `Si falta ${nom}, nadie la cubre.` : a.horasSinCubrir === 0 ? `Si falta ${nom}, la red la cubre.` : `Si falta ${nom}, quedan ${a.horasSinCubrir} h sin cubrir (hoy: ${base.horasSinCubrir} h).`;
    else note.textContent = ui.relevo ? 'Toca a una persona para ver su ficha y apágala para simular una semana sin ella.' : 'Sin relevo del programa todavía. Toca a una persona para ver su ficha.';
    tog.textContent = ui.relevo ? `Ver el caso sin el relevo de ${PRO.nombre}` : `Sumar el relevo de ${PRO.nombre} (${PRO.horas} h)`;
  }

  function elegir(g) {
    if (!g || !g.classList.contains('act')) return;
    if (ui.objetivo !== g.dataset.id) ui.apagado = false;
    ui.objetivo = g.dataset.id; render();
  }
  svg.addEventListener('click', (e) => elegir(e.target.closest('.g-node')));
  svg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(e.target.closest('.g-node')); } });
  info.addEventListener('click', (e) => { if (e.target.closest('[data-action="apagar"]')) { ui.apagado = !ui.apagado; render(); } });
  tog.addEventListener('click', () => { ui.relevo = !ui.relevo; ui.apagado = false; render(); });
  render();
})();
