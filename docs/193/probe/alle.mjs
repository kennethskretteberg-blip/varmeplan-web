// 198: kjører ALLE regresjonstester (function _xxxRegressionTest[NNN]) i index.html, hver i sin fane,
// og skriver docs/193/probe/<TAG>.json. URL0 velger side (HEAD-kopi eller arbeidskopi).
//   node -e ' process.env.TAG="alle-etter"; import("./docs/193/probe/alle.mjs") '
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
const html = fs.readFileSync(process.env.SRC || 'index.html', 'utf8');
const names = [...new Set([...html.matchAll(/^(?:async )?function (_[A-Za-z0-9]*RegressionTest[0-9]*)\b/gm)].map(m => m[1]))];
const url = process.env.URL0 || 'http://localhost:4000/';
const ut = {};
for (const n of names) {
  const p = await openPage(url);
  try {
    ut[n] = await p.eval(`(async () => {
      try { await _loadProducts(); } catch (e) {}
      if (typeof ${n} !== 'function') return { raw: 'finnes ikke som global' };
      const t = await ${n}();
      const arr = Array.isArray(t) ? t : (t && Array.isArray(t.results) ? t.results : null);
      if (!arr) return { raw: String(JSON.stringify(t)).slice(0, 200) };
      const fail = arr.filter(x => !(x.ok === true || x.pass === true));
      return { pass: arr.length - fail.length, total: arr.length, fail: fail.map(x => x.name || x.label || JSON.stringify(x).slice(0, 120)) };
    })()`);
  } catch (e) { ut[n] = { unntak: String(e.message).slice(0, 200) }; }
  await p.close();
}
fs.writeFileSync(`docs/193/probe/${process.env.TAG || 'alle'}.json`, JSON.stringify(ut, null, 1));
console.log('tester:', names.length, '→', process.env.TAG);
process.exit(0);
