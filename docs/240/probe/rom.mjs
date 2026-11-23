// 240: Kenneths eksempel — L-rom 700 × 680 med vannrette foliebaner B=80/60/100/60/50 og 2–4 cm
// mellomrom, loddrett kjede til høyre og vannrett kjede nederst. Tegner romsidens bilde i 300 DPI
// (samme kall som exportPDF) og lagrer hele bildet + utsnitt av høyre kjede og nedre høyre hjørne.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4000/docs/240/probe/head/index.html"; import("./docs/240/probe/rom.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
import { ROM, OVERLAPP } from './felles.mjs';
const tag = process.env.TAG || 'etter';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/', 9333, 1);
const ut = await p.eval(`(async () => {
  try { await _loadProducts(); } catch (e) {}
  S.varmefolie.gapCm = 2; ${FIX} _currentProfile = null;
  ${ROM} ${OVERLAPP}
  const png = (cv, x, y, w, h) => { x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y)); w = Math.min(cv.width - x, Math.round(w)); h = Math.min(cv.height - y, Math.round(h));
    const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(cv, x, y, w, h, 0, 0, c.width, c.height); return c.toDataURL('image/png').split(',')[1]; };
  const kjor = (navn, skala) => {
    _currentProfile = skala ? { prefs: { pdfLabelScale: skala } } : null;
    const lay = _pdfRoomImgLayout(L), cv = document.createElement('canvas');
    const r = _renderRoomToImage(L, { focusRoom: true, targetWidthMm: lay.imgW2, toCanvas: cv, noUrl: true });
    const W = cv.width, H = cv.height, sc = W / r.view.worldW;
    const px = (wx, wy) => [(wx - r.view.panX) * sc + W / 2, (wy - r.view.panY) * sc + H / 2];
    const a = px(X0 + 600, 280), b = px(X0 + 640, 560);
    const tx = (r.texts || []);
    return { navn, W, H, mm: lay.imgW2, dimFit: r.dimFit || null, antallMaal: tx.filter(t => t.dim).length,
      maal: tx.filter(t => t.dim).map(t => t.str), overlapp: overlapp(tx, W, H),
      hel: png(cv, 0, 0, W, H), hoyre: png(cv, a[0], a[1], W - a[0], H - a[1]), hjorne: png(cv, b[0], b[1], W - b[0], H - b[1]) };
  };
  return [kjor('normal', 0), kjor('xstor', 1.5)];
})()`);
for (const r of ut) {
  for (const k of ['hel', 'hoyre', 'hjorne']) { fs.writeFileSync(`docs/240/${tag}-${r.navn}-${k}.png`, Buffer.from(r[k], 'base64')); delete r[k]; }
  console.log(JSON.stringify(r));
}
fs.writeFileSync(`docs/240/probe/rom-${tag}.json`, JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
