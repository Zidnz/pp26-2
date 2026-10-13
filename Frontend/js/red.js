/*
 * Red de cuidado de un hogar: quién sostiene a quién (horas por semana), índice de fragilidad
 * y simulación de "apagar" a una persona. Dibuja el grafo en SVG.
 *
 * Definiciones (del prototipo, no de una fuente externa):
 *  - Fragilidad = mayor proporción de las horas de cuidado del hogar que aporta una sola persona (1.0 = un solo sostén).
 *  - Necesidad de una persona = max(necesita declarada, horas que recibe hoy).
 *  - Al apagar a X: "sin cuidado" = personas cuyo cuidado restante es 0; "parcial" = pierden horas pero conservan algo.
 */
(function () {
  'use strict';

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const corto = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  /** pro: { nombre, horas } | null. apagado: id | null. */
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
    const info = { personas, rel, inc, out, need, total, principal, fragilidad, porId, sostenes,
      grado: principal ? rel.filter((r) => r.de === principal || r.a === principal).length : 0 };

    // Estado de cada persona con `apagado` en cero horas (o nadie apagado)
    const rest = {};
    personas.forEach((p) => { rest[p.id] = 0; });
    rel.forEach((r) => { if (r.de !== apagado) rest[r.a] += r.horas; });
    const deps = personas.filter((p) => p.id !== apagado && need(p) > 0);
    const estado = {};
    const sin = [], parcial = [];
    let horasSinCubrir = 0;
    deps.forEach((p) => {
      const perdido = inc[p.id] - rest[p.id];
      const falta = Math.max(0, need(p) - rest[p.id]);
      horasSinCubrir += falta;
      if (rest[p.id] === 0) { sin.push(p); estado[p.id] = 'sin'; }
      else if (apagado && perdido > 0) { parcial.push(p); estado[p.id] = 'parcial'; }
    });
    info.estado = estado;
    info.sinCuidado = sin;
    info.parcial = parcial;
    info.dependientes = deps.length;
    info.horasSinCubrir = horasSinCubrir;
    info.relevos = sostenes.filter((p) => p.id !== apagado && p.id !== principal).length;
    info.relevosSinX = sostenes.filter((p) => p.id !== apagado).length;
    info.apagado = apagado;
    return info;
  }

  function posiciones(info) {
    const cx = 150, cy = 122, rx = 100, ry = 88;
    const centro = info.principal || (info.personas[0] && info.personas[0].id);
    // Personas conectadas entre sí (sin contar al nodo central) van una junto a otra para que sus aristas no crucen el centro.
    const pendientes = info.personas.filter((p) => p.id !== centro);
    const vecinos = (a, b) => info.rel.some((r) => r.de !== centro && r.a !== centro && ((r.de === a && r.a === b) || (r.de === b && r.a === a)));
    const otros = [];
    while (pendientes.length) {
      const ult = otros[otros.length - 1];
      let i = ult ? pendientes.findIndex((p) => vecinos(ult.id, p.id)) : -1;
      if (i < 0) i = 0;
      otros.push(pendientes.splice(i, 1)[0]);
    }
    const pos = {};
    pos[centro] = [cx, cy];
    const n = otros.length;
    otros.forEach((p, i) => {
      const a = ((-145 + (n === 1 ? 175 : (360 / n) * i)) * Math.PI) / 180;
      pos[p.id] = [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    });
    return { pos, centro };
  }

  const r1 = (n) => Math.round(n * 10) / 10;

  function dibujar(svg, info, objetivo, apagadoActivo) {
    const { pos, centro } = posiciones(info);
    let s = '';
    // aristas
    info.rel.forEach((r) => {
      const a = pos[r.de], b = pos[r.a];
      if (!a || !b) return;
      const parcial = r.horas < 0.5 * info.need(info.porId[r.a]);
      const cls = 'g-edge' + (parcial ? ' parcial' : '') + (r.de === 'pro' ? ' pro' : '') + (apagadoActivo && r.de === info.apagado ? ' off' : '');
      s += `<line class="${cls}" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke-width="${r1(1.4 + Math.min(r.horas, 60) / 30)}"><title>${esc(info.porId[r.de].nombre)} → ${esc(info.porId[r.a].nombre)}: ${r.horas} h/sem</title></line>`;
    });
    // nodos
    info.personas.forEach((p) => {
      const [x, y] = pos[p.id];
      const hub = p.id === centro;
      const radio = hub ? 27 : 20;
      const off = apagadoActivo && p.id === info.apagado;
      const st = apagadoActivo ? info.estado[p.id] : (info.estado[p.id] === 'sin' ? 'sin' : '');
      const cls = ['g-node', hub ? 'hub' : '', p.pro ? 'pro' : '', off ? 'off' : '', st, p.id === objetivo ? 'sel' : '', info.out[p.id] > 0 ? 'act' : ''].filter(Boolean).join(' ');
      const sub = (p.edad ? p.edad + ' · ' : '') + p.rol;
      s += `<g class="${cls}" data-id="${esc(p.id)}" ${info.out[p.id] > 0 ? 'tabindex="0" role="button"' : ''} aria-label="${esc(p.nombre)}, ${esc(sub)}">` +
        (p.id === objetivo ? `<circle class="g-ring" cx="${r1(x)}" cy="${r1(y)}" r="${radio + 5}"/>` : '') +
        `<circle class="g-c" cx="${r1(x)}" cy="${r1(y)}" r="${radio}"/>` +
        `<text class="g-n" x="${r1(x)}" y="${r1(y - (hub ? 1 : 2))}" text-anchor="middle" font-size="${hub ? 10.5 : 9.5}">${esc(corto(p.nombre, hub ? 9 : 8))}</text>` +
        `<text class="g-s" x="${r1(x)}" y="${r1(y + (hub ? 11 : 9.5))}" text-anchor="middle" font-size="${hub ? 7.2 : 6.8}">${esc(corto(sub, 12))}</text></g>`;
    });
    svg.innerHTML = s;
  }

  // Lo que ocurriría con el hogar si se asigna un relevo.
  function conProfesional(hogar, pro) { return analizar(hogar, pro, null); }

  window.Care.red = { analizar, dibujar, conProfesional };
})();
