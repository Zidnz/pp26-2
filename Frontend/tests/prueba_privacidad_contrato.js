/* Prueba de los cambios de minimización y contratos del 20 nov 2026.
 * Correr desde Frontend/:  node tests/prueba_privacidad_contrato.js
 * Verifica: huella SHA-256 (contra crypto de Node), CURP sin guardar en claro, entrevista sin actividades básicas,
 * bandera de enfermería (también con datos viejos), chequeos sin el de actividades básicas y firma de contratos.
 * Sale con código 1 si algo falla. */
'use strict';
const path = require('path');
const crypto = require('crypto');
const J = (f) => require(path.join(__dirname, '..', 'js', f));
const HU = J('huella.js'), CFG = J('config.js'), P = J('prioridad.js'), CT = J('contrato.js');
global.window = { Care: {} }; J('legal.js'); const L = global.window.Care.legal; // legal.js solo se registra en window

let fallas = 0;
const ok = (c, t) => { console.log(`  ${c ? 'OK   ' : 'FALLA'} ${t}`); if (!c) fallas++; };

console.log('\n1) Huella');
['', 'abc', 'ñandú — 2026', 'x'.repeat(300)].forEach((s) => ok(HU.sha256(s) === crypto.createHash('sha256').update(s, 'utf8').digest('hex'), `SHA-256 igual a Node para ${JSON.stringify(s.slice(0, 12))}`));
const c1 = HU.curp('VAKK950312MDFLRR08'), c2 = HU.curp(' vakk950312mdflrr08 ');
ok(c1.huella === c2.huella, 'misma CURP con espacios o minúsculas → misma huella (detecta duplicados)');
ok(!JSON.stringify(c1).includes('VAKK950312'), 'lo guardado no contiene la CURP');
ok(c1.ultimos4 === 'RR08' && Object.keys(c1).length === 2, 'solo se guardan huella y últimos 4');
ok(HU.curp('VAKK950312MDFLRR09').huella !== c1.huella, 'CURP distinta → huella distinta');

console.log('\n2) Entrevista');
const viejo = { horas: '56', abvd: ['P6_2_01', 'P6_2_02'], clin: ['P6_2_10'], req: true, fuerza: true };
const m = P.minimizarModelo(viejo);
ok(JSON.stringify(Object.keys(m).sort()) === '["enfermeria","horas"]', `modelo minimizado = ${JSON.stringify(m)}`);
ok(m.enfermeria === true && P.minimizarModelo({ horas: 10, clin: [] }).enfermeria === false, 'datos anteriores: lista de tareas de salud → bandera');
ok(!('ABVD' in P) && !('CLIN' in P) && P.PREGUNTAS_MODELO.length === 2, 'ya no existen ABVD ni la lista CLIN; 2 preguntas');
ok(!('abvd_muchas' in CFG.chequeos), 'config sin el umbral de actividades básicas');
const bart = Object.fromEntries(P.BARTHEL.map((it) => [it.id, it.niveles[it.niveles.length - 1][0]]));
ok(P.chequeos({ modelo: { horas: 50, enfermeria: false }, barthel: bart }, CFG).some((x) => x.id === 'horas_vs_barthel'), 'chequeo horas vs Barthel sigue funcionando sin tareas de salud');
ok(!P.chequeos({ modelo: { horas: 50, enfermeria: true }, barthel: bart }, CFG).some((x) => x.id === 'horas_vs_barthel'), '…y no se activa si requiere enfermería');
ok(!P.chequeos({ modelo: viejo, barthel: bart }, CFG).some((x) => x.id === 'abvd_vs_barthel'), 'ya no existe el chequeo de actividades básicas');

console.log('\n3) Contratos');
const deps = { CONFIG_PROGRAMA: CFG, huella: HU, relevo: { TAREAS: ['Acompañamiento y supervisión'] },
  legal: L };
const cs = CT.convenioServicio({ alias: 'Mari', palias: 'Elvira', alcaldia: 'Coyoacán', horasMes: 26, horasSemana: 6, dentro: true, enfermeria: true, consentimientoPersona: 'propio', tareas: [], dias: ['Lun'], inicio: '09:00' }, deps);
ok(/responsable solidario/.test(cs.texto) && /\$0/.test(cs.texto), 'convenio: el hogar es usuario, no patrón ni responsable solidario, y no paga');
ok(/aceptó por sí misma/.test(cs.texto), 'convenio: cláusula 7 refleja el consentimiento propio de la persona cuidada');
ok(/primera visita/.test(CT.convenioServicio({ alias: 'a', palias: 'b', consentimientoPersona: 'pendiente', tareas: [], dias: [] }, deps).clausulas[6].txt), 'convenio: consentimiento pendiente se pide en la primera visita');
ok(/enfermer/i.test(cs.clausulas.find((x) => x.t.startsWith('5')).txt), 'convenio: orienta a enfermería si la declaró');
ok(cs.resumen.length <= 8, `convenio: resumen de ${cs.resumen.length} renglones (una pantalla)`);
const ct = CT.contratoTrabajo({ nombre: 'Karla Vázquez', alcaldia: 'Iztacalco', dias: ['Lun', 'Mié'], desde: '09:00', hasta: '15:00', horasMax: 12, tareas: [] }, deps);
ok(Math.abs(L.FACTOR_291F - 0.2489) < 0.001, `factor 291-F = ${L.FACTOR_291F.toFixed(4)} (descanso 1/6 + aguinaldo 15/365 + vacaciones 12/365 + prima)`);
ok(ct.texto.includes('$53.46'), 'contrato: pago diurno $53.46/h = 342.47 ÷ 8 × 1.2489');
ok(/Cap[ií]tulo IX Bis/.test(ct.texto) && /rechazar/.test(ct.texto) && /30 días/.test(ct.texto), 'contrato: régimen de plataformas, libertad de rechazar y baja a 30 días');
ok(/no llegas/.test(ct.texto) && /\$9,582\.47/.test(ct.texto), 'contrato: avisa que con 12 h/sem no alcanza el umbral del IMSS completo');
ok(CT.POLITICA.length >= 5 && ct.texto.includes(CT.POLITICA[1]), 'contrato: incluye la política de asignación (291-J)');
ok(/no se guarda completa/.test(ct.texto), 'contrato: CURP no guardada');
const u = L.umbral291C(42);
ok(u.alcanza && !L.umbral291C(40).alcanza, `umbral IMSS: hacen falta ≈ ${Math.ceil(u.horasMesNecesarias)} h/mes (≈ 42 h/sem)`);
const f = CT.firmar(ct, 'Karla Vázquez', deps, new Date('2026-11-20T19:00:00Z'));
ok(f.huellaTexto && f.huellaTexto.length === 64 && !('texto' in f), 'firma guarda huella del texto, no el texto');
ok(CT.verificar(f, ct, deps), 'la firma corresponde al texto firmado');
const ct2 = CT.contratoTrabajo({ nombre: 'Karla Vázquez', alcaldia: 'Iztacalco', dias: ['Lun'], desde: '09:00', hasta: '15:00', horasMax: 12, tareas: [] }, deps);
ok(!CT.verificar(f, ct2, deps), 'si cambian los días, la firma ya no vale');
ok(CT.firmaCoincide('karla vazquez', 'Karla Vázquez') && !CT.firmaCoincide('Karla', 'Karla Vázquez'), 'el nombre de la firma debe coincidir con el registro');

console.log(fallas ? `\n${fallas} FALLA(S)` : '\nTodo OK');
process.exit(fallas ? 1 : 0);
