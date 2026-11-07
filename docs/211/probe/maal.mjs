// 211: målestokk-kontrollen — kjør testen og skriv tallene (også uten rastersnapp).
import { openPage } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  const ut = {};
  const t1 = await _takRegressionTest211(); ut.medSnapp = { ok: t1.ok, ..._takRegressionTest211.maal, grid: S.snap.grid };
  const g = S.snap.grid; S.snap.grid = true; const t3 = await _takRegressionTest211(); ut.medRaster = { ok: t3.ok, ..._takRegressionTest211.maal }; S.snap.grid = false;
  const t2 = await _takRegressionTest211(); ut.utenSnapp = { ok: t2.ok, ..._takRegressionTest211.maal };
  S.snap.grid = g; return ut; })()`);
console.log(JSON.stringify(r, null, 1));
await p.close(); process.exit(0);
