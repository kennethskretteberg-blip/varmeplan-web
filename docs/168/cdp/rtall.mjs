// Kjører ALLE regresjonstester i index.html (alle `function _xxxRegressionTest`), hver i sin egen fane.
// Bruk: node rtall.mjs [url] > utskrift.txt
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage } from './cdp.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, '../../../index.html'), 'utf8');
const names = [...html.matchAll(/^(?:async )?function (_[A-Za-z0-9]*RegressionTest)\b/gm)].map(m => m[1]);
const URL = process.argv[2] || 'http://localhost:4000/';
console.log('tester:', names.length);
for (const n of names) {
  const p = await openPage(URL);
  try {
    const r = await p.eval(`(async () => {
      try { await _loadProducts(); } catch(e) {}
      if (typeof ${n} !== 'function') return { raw: 'finnes ikke som global' };
      const t = await ${n}();
      const arr = Array.isArray(t) ? t : (t && Array.isArray(t.results) ? t.results : null);
      if (!arr) return { raw: JSON.stringify(t).slice(0, 300) };
      const fail = arr.filter(x => !(x.ok === true || x.pass === true));
      return { pass: arr.length - fail.length, total: arr.length, fail: fail.slice(0, 5).map(x => x.name || x.label || JSON.stringify(x).slice(0, 120)) };
    })()`);
    console.log(n, JSON.stringify(r));
  } catch (e) { console.log(n, 'FEIL', String(e.message).slice(0, 300)); }
  await p.close();
}
