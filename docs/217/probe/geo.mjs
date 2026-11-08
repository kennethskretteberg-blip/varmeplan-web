import { openPage } from './cdp.mjs';
for (const [t,u] of [['HEAD','http://localhost:4000/docs/217/probe/head/index.html'],['NÅ','http://localhost:4000/']]) {
  const p = await openPage(u);
  const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t = _geoRegressionTest(); const a = await t.async; const arr = Array.isArray(a) ? a : (a && a.results) || t.results; return { pass: arr.filter(x => x.ok).length, total: arr.length, fail: arr.filter(x => !x.ok).map(x => x.name) }; })()`);
  console.log(t, JSON.stringify(r)); await p.close();
}
process.exit(0);
