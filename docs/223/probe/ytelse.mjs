// 223: tid per bilde ved panorering i et stort prosjekt (60 rom: 40 med folie, 20 med kabel, + 217-rommene),
// med deviceScaleFactor 1 og 2, rutenett på og av. HEAD-kopi mot arbeidskopi.
//   node -e ' process.env.TAG="head"; process.env.URL0="http://localhost:4013/docs/223/probe/head/index.html"; import("./docs/223/probe/ytelse.mjs") '
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const ut = {};
for (const dsf of [1, 2]) {
  const p = await openPage(url, 9333, dsf);
  ut['dsf' + dsf] = await p.eval(`(async () => {
    S.varmefolie.gapCm = 2; ${FIX}
    S.ui.theme = 'light'; document.body.classList.add('light-theme');
    // 60 rom til i et 10 × 6-rutenett sør for 217-rommene
    let id = 100;
    for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) {
      const x = c * 450, y = 500 + r * 380, pts = rect(x, y, 400, 300);
      S.rooms.push(mk(id, 'Rom ' + id, pts));
      if ((r + c) % 3 === 2) { const cb = autoFillCable(id, K1.id); if (cb && !S.cables.includes(cb)) S.cables.push(cb); }
      else autoAddStrips(id, F60.id);
      id++;
    }
    for (const rm of S.rooms) { rm.dimSnap = true; }
    _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
    S.ui.selectedRoomId = null; renderSidebar(); updateCtxBar();
    const maal = (grid, zoom) => {
      S.ui.showGrid = grid; S.view.zoom = zoom; S.view.panX = 2000; S.view.panY = 1500; render();
      const t = [];
      for (let i = 0; i < 40; i++) { S.view.panX += 7; S.view.panY += 3; const t0 = performance.now(); render(); t.push(performance.now() - t0); }
      t.sort((a, b) => a - b);
      return { median: Math.round(t[20] * 100) / 100, p90: Math.round(t[36] * 100) / 100, snitt: Math.round(t.reduce((a, b) => a + b, 0) / t.length * 100) / 100 };
    };
    return { dpr: window.devicePixelRatio, backing: [canvas.width, canvas.height], rom: S.rooms.length, strips: S.strips.length, kabler: S.cables.length,
      oversikt_grid: maal(true, 0.25), oversikt_uten: maal(false, 0.25), normal_grid: maal(true, 0.7), normal_uten: maal(false, 0.7), tett_grid: maal(true, 1.6), tett_uten: maal(false, 1.6) };
  })()`);
  await p.close();
  console.log(tag, 'dsf', dsf, JSON.stringify(ut['dsf' + dsf]));
}
fs.writeFileSync(`docs/223/probe/ytelse-${tag}.json`, JSON.stringify(ut, null, 1));
process.exit(0);
