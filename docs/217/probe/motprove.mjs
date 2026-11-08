// 217: kjører den nye testen mot GAMMEL kode (HEAD-kopien): de testene som handler om arv skal bli røde.
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
const html = fs.readFileSync('index.html', 'utf8');
const a = html.indexOf('async function _takRegressionTest217()'), b = html.indexOf('// 215: snøfanger — regnestykket begge veier');
const p = await openPage('http://localhost:4000/docs/217/probe/head/index.html');
await p.eval('window._takRegressionTest217 = ' + html.slice(a, b).trim());
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t = await window._takRegressionTest217(); return { pass: t.results.filter(x => x.ok).length, total: t.results.length, fail: t.results.filter(x => !x.ok).map(x => x.name + ' → ' + String(x.got).slice(0, 70)) }; })()`);
console.log(JSON.stringify(r, null, 1)); await p.close(); process.exit(0);
