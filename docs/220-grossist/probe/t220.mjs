// 220: kjører bare _grossistRegressionTest220 i en ny fane og skriver resultatet.
//   node docs/220-grossist/probe/t220.mjs
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t = await _grossistRegressionTest220(); return t; })()`);
await p.close();
const fail = r.filter(x => !x.ok);
console.log(`_grossistRegressionTest220: ${r.length - fail.length}/${r.length}`);
fail.forEach(x => console.log('  ✗', x.name, JSON.stringify(x.info || '').slice(0, 300)));
fs.writeFileSync('docs/220-grossist/probe/t220.json', JSON.stringify(r, null, 1));
process.exit(0);
