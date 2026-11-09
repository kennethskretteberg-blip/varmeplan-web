// 223: kjører bare _canvasRegressionTest223, ved deviceScaleFactor 1 og 2.
//   node -e ' import("./docs/223/probe/t223.mjs") '
import { openPage } from './cdp.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
for (const dsf of [1, 2]) {
  const p = await openPage(url, 9333, dsf);
  const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t = _canvasRegressionTest223(); return { dpr: window.devicePixelRatio, pass: t.filter(x => x.ok).length, total: t.length, fail: t.filter(x => !x.ok) }; })()`);
  console.log('dsf', dsf, JSON.stringify(r, null, 1));
  await p.close();
}
process.exit(0);
