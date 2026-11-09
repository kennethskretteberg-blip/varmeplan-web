// 220: kjører _vismaNoRegressionTest198 og _grossistRegressionTest220 på nytt etter K9-oppdateringen.
import { openPage } from './cdp.mjs';
for (const n of ['_vismaNoRegressionTest198', '_grossistRegressionTest220']) {
  const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
  const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t0 = await ${n}(); const t = Array.isArray(t0) ? t0 : t0.results; return t.filter(x => !x.ok).map(x => x.name).concat(['TOTAL ' + t.length]); })()`);
  await p.close();
  console.log(n, r.join(' | '));
}
process.exit(0);
