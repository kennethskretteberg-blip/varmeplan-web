// 224: skjermbilder (deviceScaleFactor 2, lyst tema) før (HEAD-kopi) og etter: dashbordet, et prosjekt med
// folie + kabel + hindring, samme prosjekt med venstrepanelet skjult (bare etter), og et 2×-utsnitt av etiketter.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/224/probe/head/index.html"; import("./docs/224/probe/skjerm.mjs") '
//   node -e ' process.env.TAG="etter"; import("./docs/224/probe/skjerm.mjs") '
import { openPage, sov } from './cdpklient.mjs';
import { FIX, VIS_PROSJEKT, DASHBORD } from './fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const ut = {};
const del = process.env.DEL || 'alle';   // 'dashbord' | 'prosjekt' | 'alle'

// 1. Dashbordet
if (del !== 'prosjekt') {
  const p = await openPage(url, 9333, 2);
  await p.eval(`document.fonts.ready.then(() => 1)`);
  ut.dashbord = await p.eval(DASHBORD);
  await sov(400);
  await p.shot(`docs/224/${tag}-dashbord.png`);
  await p.close();
}

// 2. Prosjekt (hele vinduet), 3. panelet skjult, 4. utsnitt 2×
if (del !== 'dashbord') {
  const p = await openPage(url, 9333, 2);
  await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX} return 1; })()`);
  await p.eval(`document.fonts.ready.then(() => 1)`);
  const r = await p.eval(VIS_PROSJEKT);
  await sov(400);
  await p.shot(`docs/224/${tag}-prosjekt.png`);
  ut.prosjekt = r;
  // utsnitt 2× rundt folie-etikettene i rom 32 (verden 600..1000 × 0..300) — her ser man skriften
  const r2 = await p.eval(`(() => { const a = w2s(590, -10), b = canvas.getBoundingClientRect(); return { x: b.left + a.x, y: b.top + a.y, width: 330, height: 250 }; })()`);
  await p.shot(`docs/224/${tag}-utsnitt-2x.png`, { ...r2, scale: 2 });
  const harKnapp = await p.eval(`typeof _sbToggleCollapse === 'function'`);
  if (harKnapp) {
    ut.skjult = await p.eval(`(() => { const w0 = canvas.getBoundingClientRect().width; _sbToggleCollapse(); render(); const b = canvas.getBoundingClientRect();
      return { lerretFoer: w0, lerretEtter: b.width, sidepanel: document.getElementById('sidebar').offsetWidth, knapp: document.getElementById('sb-collapse').getAttribute('aria-label') }; })()`);
    await sov(400);
    await p.shot(`docs/224/${tag}-prosjekt-skjult.png`);
    await p.eval(`(() => { _sbToggleCollapse(); render(); return 1; })()`);
  }
  await p.close();
}
console.log(tag, JSON.stringify(ut));
process.exit(0);
