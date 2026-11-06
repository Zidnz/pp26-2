/* RedCare · interacción: lista propia dentro de la hoja, conteo animado y confeti.
 * La lista nativa (<select>) se dibuja fuera de la página y se sale de la hoja en el celular;
 * aquí se reemplaza por una lista en el flujo del formulario. El <select> sigue existiendo (oculto),
 * así que valores, validaciones y eventos «change» de la app no cambian. */
(function () {
  'use strict';
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  let uid = 0;

  /* ---------- Lista propia ---------- */
  function mejora(sel) {
    if (sel.dataset.cs || sel.hasAttribute('data-nativo') || sel.multiple) return;
    sel.dataset.cs = '1';
    const id = 'cs' + (++uid);
    const wrap = document.createElement('div'); wrap.className = 'cs';
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'cs-btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    const aria = sel.getAttribute('aria-label'); if (aria) btn.setAttribute('aria-label', aria);
    const lista = document.createElement('div');
    lista.className = 'cs-list'; lista.id = id; lista.setAttribute('role', 'listbox'); lista.hidden = true;
    btn.setAttribute('aria-controls', id);
    wrap.appendChild(btn); wrap.appendChild(lista);
    let act = -1;

    const opciones = () => Array.from(sel.options);
    function pintaBoton() {
      const o = sel.options[sel.selectedIndex];
      const vacio = !o || o.value === '';
      btn.innerHTML = `<span class="cs-t${vacio ? ' vacio' : ''}">${esc(o ? o.textContent : '')}</span>${CHEV}`;
      btn.disabled = sel.disabled;
    }
    function pintaLista() {
      lista.innerHTML = opciones().map((o, i) =>
        `<button type="button" role="option" class="cs-opt" data-i="${i}" aria-selected="${i === sel.selectedIndex}"${o.disabled ? ' disabled' : ''}>${esc(o.textContent)}</button>`).join('');
    }
    function marca(i) {
      const bs = lista.querySelectorAll('.cs-opt'); if (!bs.length) return;
      act = Math.max(0, Math.min(bs.length - 1, i));
      bs.forEach((b, k) => b.classList.toggle('act', k === act));
      bs[act].scrollIntoView({ block: 'nearest' });
    }
    function abre() {
      if (sel.disabled) return;
      cierraOtras(wrap);
      pintaLista(); lista.hidden = false; wrap.classList.add('abierto'); btn.setAttribute('aria-expanded', 'true');
      marca(sel.selectedIndex < 0 ? 0 : sel.selectedIndex);
      // La hoja debe mostrar la lista completa sin que el usuario tenga que buscarla.
      setTimeout(() => { try { lista.scrollIntoView({ block: 'nearest', behavior: reducido() ? 'auto' : 'smooth' }); } catch (e) { /* sin soporte */ } }, 30);
    }
    function cierra(devuelveFoco) {
      if (lista.hidden) return;
      lista.hidden = true; wrap.classList.remove('abierto'); btn.setAttribute('aria-expanded', 'false');
      if (devuelveFoco) btn.focus();
    }
    function elige(i) {
      if (i < 0 || i >= sel.options.length) return;
      const cambio = sel.selectedIndex !== i;
      sel.selectedIndex = i; pintaBoton();
      if (cambio) { sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
      cierra(true);
    }
    wrap._cierra = cierra; wrap._refresca = pintaBoton;
    btn.addEventListener('click', () => (lista.hidden ? abre() : cierra()));
    lista.addEventListener('click', (e) => { const b = e.target.closest('.cs-opt'); if (b && !b.disabled) elige(+b.dataset.i); });
    btn.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); if (lista.hidden) abre(); else marca(act + (e.key === 'ArrowDown' ? 1 : -1)); }
      else if ((e.key === 'Enter' || e.key === ' ') && !lista.hidden) { e.preventDefault(); elige(act); }
      else if (e.key === 'Escape' && !lista.hidden) { e.preventDefault(); e.stopPropagation(); cierra(true); }
      else if (e.key === 'Tab') cierra();
      else if (e.key.length === 1 && /\S/.test(e.key)) { // búsqueda por letra
        const k = e.key.toLowerCase(), os = opciones(), n = os.length;
        for (let d = 1; d <= n; d++) { const j = ((lista.hidden ? sel.selectedIndex : act) + d) % n; if (os[j].textContent.trim().toLowerCase().startsWith(k)) { if (lista.hidden) abre(); marca(j); break; } }
      }
    });
    new MutationObserver(() => { pintaBoton(); if (!lista.hidden) pintaLista(); }).observe(sel, { childList: true, subtree: true });
    sel.addEventListener('change', pintaBoton);
    pintaBoton();
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function cierraOtras(salvo) { document.querySelectorAll('.cs.abierto').forEach((w) => { if (w !== salvo && w._cierra) w._cierra(); }); }
  document.addEventListener('click', (e) => { if (!e.target.closest('.cs')) cierraOtras(null); });

  let pendiente = false;
  function barre() { pendiente = false; document.querySelectorAll('select:not([data-cs])').forEach(mejora); }
  new MutationObserver(() => { if (!pendiente) { pendiente = true; requestAnimationFrame(barre); } }).observe(document.body, { childList: true, subtree: true });
  // La app a veces fija select.value por código (sin evento): se refresca la etiqueta de las listas visibles.
  setInterval(() => document.querySelectorAll('.cs').forEach((w) => { if (w._refresca && w.offsetParent !== null) w._refresca(); }), 500);
  barre();

  /* ---------- Conteo animado ---------- */
  function cuenta(el, a, b) {
    if (reducido() || a === b) return;
    const t0 = performance.now(), dur = 700;
    (function paso(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(a + (b - a) * e));
      if (k < 1) requestAnimationFrame(paso); else el.textContent = String(b);
    })(t0);
  }
  let ultBolsa = 0;
  new MutationObserver(() => {
    const b = document.querySelector('#prog-body .bolsa b');
    if (b && !b.dataset.v) { const n = parseInt(b.textContent, 10); if (!isNaN(n)) { b.dataset.v = n; cuenta(b, ultBolsa, n); ultBolsa = n; } }
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------- Confeti ---------- */
  function confeti() {
    if (reducido()) return;
    const host = document.getElementById('app') || document.body;
    const c = document.createElement('canvas'); c.className = 'confeti'; host.appendChild(c);
    const w = c.width = host.clientWidth, h = c.height = host.clientHeight, g = c.getContext('2d');
    const col = ['#aa95d1', '#e5677f', '#7dd1c1', '#aa95d1', '#77689d', '#ffffff'];
    const ps = Array.from({ length: 110 }, () => ({ x: w / 2 + (Math.random() - .5) * 120, y: h * .62, vx: (Math.random() - .5) * 14, vy: -8 - Math.random() * 11, r: Math.random() * 6.3, vr: (Math.random() - .5) * .4, s: 6 + Math.random() * 7, c: col[(Math.random() * col.length) | 0] }));
    const t0 = performance.now();
    (function cuadro(t) {
      g.clearRect(0, 0, w, h);
      const vida = (t - t0) / 1900;
      ps.forEach((p) => { p.vy += .42; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr; g.save(); g.globalAlpha = Math.max(0, 1 - Math.max(0, vida - .55) / .45); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.strokeStyle = '#2b3045'; g.lineWidth = 1.5; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.strokeRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
      if (vida < 1) requestAnimationFrame(cuadro); else c.remove();
    })(t0);
  }
  /* ---------- Hojas dentro del marco de la app ----------
   * showModal() usa la capa superior del navegador y se dibuja fuera de #app. Se sustituye por show()
   * (hoja no modal, colocada dentro de #app) más un velo propio y manejo de Esc. */
  const scrim = document.getElementById('scrim');
  const abiertas = () => Array.from(document.querySelectorAll('#app dialog[open]'));
  const velo = () => { if (scrim) scrim.hidden = abiertas().length === 0; };
  HTMLDialogElement.prototype.showModal = function () {
    if (!this.open) this.show();
    velo();
    const f = this.querySelector('input:not([type=hidden]):not([type=checkbox]), textarea, button.btn-primary');
    if (f && !this.querySelector('.cs-list:not([hidden])')) try { f.focus({ preventScroll: true }); } catch (e) { /* sin foco */ }
  };
  document.addEventListener('close', velo, true);
  if (scrim) scrim.addEventListener('click', () => { const a = abiertas(); if (a.length) a[a.length - 1].close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const a = abiertas(); if (a.length) { e.preventDefault(); a[a.length - 1].close(); }
  });

  window.Interaccion = { confeti, mejora };
})();
