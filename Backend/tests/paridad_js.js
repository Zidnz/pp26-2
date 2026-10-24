/* Corre Frontend/js/prioridad.js sobre los casos que le pasa tests/test_paridad.py y escribe los resultados en JSON.
 * Uso: node Backend/tests/paridad_js.js casos.json   (la prueba lo llama sola)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..', '..');
const CFG = require(path.join(raiz, 'Frontend', 'js', 'config.js'));
const P = require(path.join(raiz, 'Frontend', 'js', 'prioridad.js'));

const casos = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = {
  evaluaciones: casos.evaluaciones.map((c) => {
    const p = P.puntuar(c.modelo, CFG);
    const ef = P.puntajeEfectivo(p.base, c.semanas, CFG);
    const b = P.totalBarthel(c.barthel);
    return {
      base: p.base, max: p.max, top3: p.top3.map((d) => d.var), variables: p.variables,
      efectivo: ef.efectivo, extra: ef.extra, nivel: P.nivel(ef.efectivo, CFG), regla: P.reglaHoras(c.modelo.horas),
      barthel: b, nivel_barthel: P.nivelBarthel(b), zarit: P.totalZarit(c.zarit, CFG),
      chequeos: P.chequeos({ modelo: c.modelo, barthel: c.barthel, zarit: c.zarit }, CFG),
    };
  }),
  repartos: casos.repartos.map((r) => {
    const res = P.asignarHoras(r.personas, CFG, r.presupuesto);
    res.horas_semana = Object.fromEntries(Object.entries(res.horas).map(([k, v]) => [k, P.horasSemana(v, CFG)]));
    return res;
  }),
  semanas: casos.semanas.map(([a, b]) => P.semanasEnCola(a, b)),
};
process.stdout.write(JSON.stringify(out));
