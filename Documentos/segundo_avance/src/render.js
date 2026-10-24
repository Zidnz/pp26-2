// Renderiza src/*.html a fig/*.png a 1400 px y escala 2 (igual que el documento técnico v1).
const path = require('path'); const fs = require('fs'); const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 800 }, deviceScaleFactor: 2 });
  for (const f of fs.readdirSync(__dirname).filter((x) => /^f_.*\.html$/.test(x))) {
    await p.goto('file://' + path.join(__dirname, f)); await p.waitForTimeout(200);
    const el = await p.$('.f'); await el.screenshot({ path: path.join(__dirname, '..', 'fig', f.replace('.html', '.png')) }); console.log('ok', f); }
  await b.close(); })();
