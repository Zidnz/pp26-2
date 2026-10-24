// Genera las portadas (JPG 2040×2640) de los documentos del segundo avance sobre src/cover_base.png,
// con el mismo diseño que la portada del Documento técnico v1 (documento_tecnico/src/portada.html).
// Uso: node portadas.js   (requiere playwright)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORTADAS = [
  { arch: 'portada_guia_tablero.jpg', sub: 'Guía del tablero', desc: 'Qué contiene cada pestaña, qué explica cada gráfica, por qué la elegimos y de dónde salen los datos.',
    pills: ['¿Quién lo carga?', '¿Por qué no se contrata?', '¿Cuánto cuesta?', '¿A quién primero?', '¿Dónde?'], ver: 'v2.0 · 21 oct 2026' },
  { arch: 'portada_doc_tecnico.jpg', sub: 'Documento técnico', desc: 'Con qué está hecho, cómo se arma cada pestaña, cómo se dibujan las gráficas y cómo se conecta cada pieza.',
    pills: ['Arquitectura y flujo de datos', 'Tecnologías', 'Cómo se conectan los módulos', 'Almacén de datos', 'Pestaña por pestaña'], ver: 'v2.0 · 21 oct 2026' },
  { arch: 'portada_guia_app.jpg', sub: 'Guía de la app Mientras', desc: 'Relevo por horas para quien cuida: cómo se usa, cómo decide a quién y cuántas horas, y qué todavía no está validado.',
    pills: ['Recorrido de la solicitud', 'Puntaje y niveles', 'Bolsa de horas', 'Seguimiento del programa', 'Datos personales'], ver: 'v1.0 · 21 oct 2026' },
  { arch: 'portada_maestro.jpg', sub: 'Documento maestro', desc: 'Segundo avance. Lo que encontramos, cómo lo modelamos y lo que proponemos: el Observatorio y el programa de relevo por horas.',
    pills: ['Hallazgos', 'Modelos y su comparación', 'Programa y app Mientras', 'Sostenibilidad', 'Aportación de cada UCA'], ver: 'v2.0 · 21 oct 2026' },
];

const html = (p) => `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;width:2040px;height:2640px;position:relative;font-family:Inter,sans-serif;background:url(cover_base.png) no-repeat 0 0/2040px 2640px}
.sub{position:absolute;left:112px;top:1000px;width:1000px;font-weight:800;font-size:${p.sub.length > 22 ? 66 : 78}px;color:#77689d;letter-spacing:-1px;line-height:1.05}
.desc{position:absolute;left:113px;top:${p.sub.length > 22 ? 1200 : 1140}px;width:800px;font-size:36px;line-height:1.5;color:#3f4760}
.pills{position:absolute;left:112px;top:1625px;display:flex;flex-direction:column;gap:22px}
.pill{display:inline-block;width:max-content;background:#fff;border:3px solid #ddd6ee;border-radius:50px;padding:14px 34px;font-size:32px;font-weight:600;color:#2b3045}
.pill b{color:#77689d;margin-right:12px}
.ver{position:absolute;right:107px;top:2358px;font-size:38px;font-weight:700;color:#7dd1c1}
</style></head><body>
<div class="sub">${p.sub}</div>
<div class="desc">${p.desc}</div>
<div class="pills">${p.pills.map((t, i) => `<div class="pill"><b>0${i + 1}</b>${t}</div>`).join('')}</div>
<div class="ver">${p.ver}</div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 2040, height: 2640 } });
  for (const p of PORTADAS) {
    const tmp = path.join(__dirname, 'src', '_portada_tmp.html');
    fs.writeFileSync(tmp, html(p));
    await pg.goto('file://' + tmp); await pg.waitForTimeout(300);
    await pg.screenshot({ path: path.join(__dirname, 'fig', p.arch), type: 'jpeg', quality: 88 });
    fs.unlinkSync(tmp);
    console.log('ok', p.arch);
  }
  await b.close();
})();
