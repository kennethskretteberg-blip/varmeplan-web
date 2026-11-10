// 224: får etikettene på folie, kabel og matte fortsatt plass med Inter? Måler (a) tekstbredder for typiske
// etiketter i Space Grotesk (fortsatt lastet for logoen) mot Inter på samme side, og (b) hvilke tekster som faktisk
// tegnes på lerretet (ctx.fillText fanget) i 217-fixturet + matterom, før (HEAD-kopi) og etter. En etikett som
// mister plassen forsvinner fra settet eller får «…». Skriver docs/224/probe/etiketter-<tag>.json.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/224/probe/head/index.html"; import("./docs/224/probe/etiketter.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
import { FIX } from '../../223/probe/fixture.mjs';   // 217-rommene + matterom + trapp + brukermål
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const p = await openPage(url, 9333, 2);
await p.eval(`document.fonts.ready.then(() => 1)`);
const ut = await p.eval(`(async () => {
  S.varmefolie.gapCm = 2; ${FIX}
  await document.fonts.ready;
  // (a) bredder
  const tekster = ['FlexFoil 60W B=60cm', '400 cm', '12,5 m²', 'TestKabel 10T 600W 60m', '60 m · 600 W', 'InSnow 300T 0,5x16m', '2 400 W', 'V1 400 cm', '0 8 6 9'];
  const m = (fam, px, w) => { ctx.font = (w || '') + ' ' + px + 'px ' + fam; return tekster.map(t => Math.round(ctx.measureText(t).width * 10) / 10); };
  const bredder = {};
  for (const [navn, fam] of [['Space Grotesk', "'Space Grotesk',sans-serif"], ['Inter', "'Inter',sans-serif"], ['Plex Mono', "'IBM Plex Mono',monospace"]]) {
    bredder[navn] = { '11': m(fam, 11), 'bold 11': m(fam, 11, 'bold'), '9': m(fam, 9) };
  }
  // (b) tekster tegnet på lerretet i tre utsnitt
  const fang = (zoom, px, py, sel) => {
    S.view.zoom = zoom; S.view.panX = px; S.view.panY = py; S.ui.selectedRoomId = sel; S.ui.showGrid = true;
    const sett = new Map(); const o = ctx.fillText;
    ctx.fillText = function (t, x, y, mw) { const k = String(t); sett.set(k, (sett.get(k) || 0) + 1); return o.call(this, t, x, y, mw); };
    try { render(); } finally { ctx.fillText = o; }
    return [...sett.entries()].sort((a, b) => a[0].localeCompare(b[0], 'nb')).map(([t, n]) => n > 1 ? t + ' ×' + n : t);
  };
  return { tekster, bredder, lerret: { oversikt: fang(0.45, 1050, 350, null), folie: fang(1.2, 800, 150, 32), kabel: fang(1.2, 200, 150, 31), matte: fang(1.2, 150, 700, 35) } };
})()`);
fs.writeFileSync(`docs/224/probe/etiketter-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, 'bredder 11px:', JSON.stringify(ut.bredder));
for (const k of Object.keys(ut.lerret)) console.log(tag, k, ut.lerret[k].length, 'tekster');
await p.close(); process.exit(0);
