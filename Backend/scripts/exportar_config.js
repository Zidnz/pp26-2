/* Exporta Frontend/js/config.js a Backend/app/config_programa.json, con la huella SHA-256 del original.
 * Correr desde la raíz del repo cada vez que cambie config.js:
 *     node Backend/scripts/exportar_config.js
 * El backend compara la huella al arrancar: si config.js cambió y no se exportó, /salud y /puntaje/config lo dicen.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const raiz = path.resolve(__dirname, '..', '..');
const origen = path.join(raiz, 'Frontend', 'js', 'config.js');
const destino = path.join(raiz, 'Backend', 'app', 'config_programa.json');

const bytes = fs.readFileSync(origen);
const config = require(origen);
const salida = {
  origen: 'Frontend/js/config.js',
  sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  exportado: new Date().toISOString(),
  config,
};
fs.writeFileSync(destino, JSON.stringify(salida, null, 2) + '\n', 'utf8');
console.log(`OK  ${path.relative(raiz, destino)}  (config ${config.version}, sha256 ${salida.sha256.slice(0, 12)}…)`);
