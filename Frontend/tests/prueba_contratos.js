/* Prueba de los textos legales de RedCare (18 nov 2026). Ejecutar: node tests/prueba_contratos.js
 * Verifica que el aviso y los dos contratos estén completos y que la huella de firma no guarde la imagen. */
'use strict';
const assert = require('assert');
const K = require('../js/contratos.js');

assert.strictEqual(K.AVISO_INTEGRAL.length, 10, 'el aviso integral tiene 10 apartados');
assert.ok(K.AVISO_SIMPLIFICADO.join(' ').includes('opcional'), 'la finalidad del Observatorio es opcional');
assert.ok(K.AVISO_INTEGRAL.some(([t, x]) => /art\. 8/.test(x)), 'cita el art. 8 de la LFPDPPP (datos sensibles)');
assert.strictEqual(K.SERVICIO.clausulas.length, 12, 'el acuerdo de servicio tiene 12 cláusulas');
assert.strictEqual(K.RELEVO.clausulas.length, 10, 'el contrato de relevo tiene 10 cláusulas');
assert.ok(K.SERVICIO.clausulas.some(([t]) => t.startsWith('Segunda. Alcance')), 'el alcance excluye tareas clínicas');
assert.ok(K.RELEVO.clausulas.some(([t]) => t.includes('gestión algorítmica')), 'incluye la política de gestión algorítmica (LFT cap. IX Bis)');
assert.ok(!K.SERVICIO.clausulas.some(([, x]) => /no es responsable de nada|se deslinda/i.test(x)), 'ninguna cláusula excluye toda responsabilidad');
assert.strictEqual(K.MODALIDADES.length, 4, 'cuatro formas de firmar por la persona cuidada');

K.huella('data:image/png;base64,AAAA' + '2026-11-18').then((h) => {
  assert.ok(/^(sha256|fnv):[0-9a-f]+$/.test(h), 'la huella es un hash corto');
  assert.ok(h.length < 30, 'no se guarda la imagen de la firma');
  console.log('OK · aviso, acuerdo de servicio y contrato de relevo completos; huella', h);
});
