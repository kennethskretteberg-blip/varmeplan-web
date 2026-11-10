// 223: skjermbilder med deviceScaleFactor 2, lyst tema, tre zoomnivåer (langt ut / normal / tett inn),
// samme prosjekt, HEAD-kopi («foer») og arbeidskopi («etter»). Lagres i docs/223/<TAG>-<nivå>.png.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/223/probe/head/index.html"; import("./docs/223/probe/skjerm.mjs") '
import { openPage, sov } from './cdp.mjs';
import { FIX, VIS } from './fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const p = await openPage(url, 9333, 2);
await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX} ${VIS} return 1; })()`);
const niv = [['langt-ut', 0.22, 1100, 500, null], ['normal', 0.6, 650, 450, null], ['tett-inn', 1.6, 800, 150, 32]];
for (const [navn, zoom, px, py, sel] of niv) {
  const r = await p.eval(`(() => { S.view.zoom = ${zoom}; S.view.panX = ${px}; S.view.panY = ${py}; S.ui.selectedRoomId = ${sel}; renderSidebar(); updateCtxBar(); render();
    const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; })()`);
  await sov(250);
  await p.shot(`docs/223/${tag}-${navn}.png`, { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 });
  console.log(tag, navn, JSON.stringify(r));
}
// Utsnitt 2× av et hjørne i rom 32 ved normal zoom — her ser man skarpheten tydeligst
const r2 = await p.eval(`(() => { S.view.zoom = 1.0; S.view.panX = 700; S.view.panY = 60; S.ui.selectedRoomId = 32; renderSidebar(); updateCtxBar(); render();
  const b = canvas.getBoundingClientRect(); const s = w2s(600, 0); return { x: b.left + s.x - 40, y: b.top + s.y - 40, width: 320, height: 220 }; })()`);
await sov(250);
await p.shot(`docs/223/${tag}-utsnitt-2x.png`, { ...r2, scale: 2 });
await p.close(); process.exit(0);
