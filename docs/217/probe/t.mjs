import { openPage } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t = await _takRegressionTest217(); return { pass: t.results.filter(x => x.ok).length, total: t.results.length, fail: t.results.filter(x => !x.ok), names: t.results.map(x => x.name) }; })()`);
console.log(JSON.stringify(r, null, 1)); await p.close(); process.exit(0);
