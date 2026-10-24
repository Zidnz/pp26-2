/* Prueba del reparto de horas de Mientras (punto D).
 * Correr desde Frontend/:  node tests/prueba_asignacion.js
 *
 * Simula 100 personas con puntajes aleatorios (semilla fija) y semanas de espera aleatorias, y verifica:
 *   (a) nadie recibe menos de horas_minimas;
 *   (b) la suma no excede presupuesto_horas_mes;
 *   (c) el envejecimiento respeta el tope.
 * Además corre dos escenarios que el enunciado no pide pero que deciden si (a) es posible:
 *   - bolsa insuficiente (presupuesto < 100 × mínimo): (a) NO se puede cumplir; se verifica que el mínimo vaya
 *     primero a los puntajes más altos, que el resto quede en cola y que la bolsa no se rebase;
 *   - más horas por persona: el tope por hogar se respeta y lo que rebasa se redistribuye.
 * Sale con código 1 si algo falla.
 */
'use strict';
const path = require('path');
const CFG = require(path.join(__dirname, '..', 'js', 'config.js'));
const P = require(path.join(__dirname, '..', 'js', 'prioridad.js'));

function rng(seed) { // mulberry32, igual que data.js
  return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const MAXPUNTOS = Object.values(CFG.pesos).reduce((t, v) => t + Math.max(0, v), 0);

function simular(n, semilla) {
  const r = rng(semilla);
  return Array.from({ length: n }, (_, i) => {
    const base = Math.round(r() * MAXPUNTOS);
    const semanas = Math.floor(r() * 30); // hasta 29 semanas en cola
    const ef = P.puntajeEfectivo(base, semanas, CFG);
    return { id: 'p' + String(i + 1).padStart(3, '0'), base, semanas, efectivo: ef.efectivo, extra: ef.extra };
  });
}

let fallas = 0;
const ok = (cond, txt) => { console.log(`  ${cond ? 'OK   ' : 'FALLA'} ${txt}`); if (!cond) fallas++; };
const resumen = (pers, res) => {
  const hs = pers.map((p) => res.horas[p.id]);
  const porNivel = {};
  pers.forEach((p) => { const nv = P.nivel(p.efectivo, CFG); (porNivel[nv] = porNivel[nv] || []).push(res.horas[p.id]); });
  const media = (a) => (a.reduce((t, v) => t + v, 0) / a.length).toFixed(1);
  console.log(`  bolsa ${res.presupuesto} h · usado ${res.usado} h · sobrante ${res.sobrante} h · min ${Math.min(...hs)} · max ${Math.max(...hs)} h/mes · en cola ${res.en_cola.length}`);
  ['alta', 'media', 'baja'].forEach((nv) => { if (porNivel[nv]) console.log(`  ${P.NIVEL[nv].padEnd(5)} n=${String(porNivel[nv].length).padStart(3)}  promedio ${media(porNivel[nv])} h/mes`); });
};

/* ---------- Escenario principal: valores de config.js ---------- */
console.log(`\n1) 100 personas, valores de config.js (bolsa ${CFG.presupuesto_horas_mes} h, mínimo ${CFG.horas_minimas}, tope hogar ${CFG.horas_maximas}, envejecimiento ${CFG.envejecimiento.puntos_por_semana}/sem tope ${CFG.envejecimiento.tope_envejecimiento})`);
const pers = simular(100, 20261020);
const res = P.asignarHoras(pers, CFG);
resumen(pers, res);
ok(pers.every((p) => res.horas[p.id] >= CFG.horas_minimas), `(a) nadie recibe menos de ${CFG.horas_minimas} h`);
ok(res.usado <= CFG.presupuesto_horas_mes && Object.values(res.horas).reduce((t, v) => t + v, 0) === res.usado, `(b) suma ${res.usado} ≤ ${CFG.presupuesto_horas_mes}`);
ok(pers.every((p) => p.extra <= CFG.envejecimiento.tope_envejecimiento && p.efectivo - p.base <= CFG.envejecimiento.tope_envejecimiento), `(c) envejecimiento ≤ ${CFG.envejecimiento.tope_envejecimiento} puntos (máx. observado ${Math.max(...pers.map((p) => p.extra))})`);
ok(pers.some((p) => p.semanas * CFG.envejecimiento.puntos_por_semana > CFG.envejecimiento.tope_envejecimiento), '    (c) la simulación sí incluye casos que rebasarían el tope sin él');
ok(pers.every((p) => res.horas[p.id] <= CFG.horas_maximas), `    nadie pasa el tope por hogar (${CFG.horas_maximas} h)`);
// Monotonía: a mayor puntaje efectivo, no menos horas
const ord = pers.slice().sort((a, b) => a.efectivo - b.efectivo);
ok(ord.every((p, i) => i === 0 || res.horas[p.id] + 1 >= res.horas[ord[i - 1].id]), '    a mayor puntaje efectivo, no menos horas (tolerancia de 1 h por redondeo)');

/* ---------- Bolsa insuficiente ---------- */
const chica = 1000;
console.log(`\n2) Bolsa insuficiente: ${chica} h para 100 personas (los mínimos piden ${100 * CFG.horas_minimas} h)`);
const r2 = P.asignarHoras(pers, CFG, chica);
resumen(pers, r2);
ok(!r2.capacidad_ok, '    se reporta que la bolsa no alcanza para todos los mínimos');
ok(r2.usado <= chica, `(b) suma ${r2.usado} ≤ ${chica}`);
ok(pers.every((p) => r2.horas[p.id] === 0 || r2.horas[p.id] >= CFG.horas_minimas), '    quien recibe horas recibe al menos el mínimo');
const minAtendido = Math.min(...pers.filter((p) => r2.horas[p.id] > 0).map((p) => p.efectivo));
const maxEnCola = Math.max(...pers.filter((p) => r2.horas[p.id] === 0).map((p) => p.efectivo));
ok(minAtendido >= maxEnCola, `    el mínimo va primero a los puntajes más altos (corte ${minAtendido} ≥ ${maxEnCola} en cola)`);
console.log(`  → (a) NO se cumple con esta bolsa: ${r2.en_cola.length} personas esperan el siguiente ciclo con su puntaje envejeciendo.`);

/* ---------- Bolsa holgada: tope por hogar ---------- */
const grande = 6000;
console.log(`\n3) Bolsa holgada: ${grande} h para 100 personas`);
const r3 = P.asignarHoras(pers, CFG, grande);
resumen(pers, r3);
ok(pers.every((p) => r3.horas[p.id] <= CFG.horas_maximas && r3.horas[p.id] >= CFG.horas_minimas), '    todos entre el mínimo y el tope');
ok(r3.usado <= grande, `(b) suma ${r3.usado} ≤ ${grande} (sobran ${r3.sobrante} h porque todos llegaron al tope)`);

console.log(`\n${fallas ? fallas + ' FALLA(S)' : 'Todo OK'}\n`);
process.exit(fallas ? 1 : 0);
