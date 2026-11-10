// 228: testrommet som gjenskaper P0402 «Kjøkken» — 3 × 3 m, hindringen «ØY» midt i, folie, og et
// lagret pdfView som skjærer venstre kant. Tegner romsidens bilde i 300 DPI (samme kall som exportPDF)
// og lagrer hele bildet + utsnitt av venstre kant og målestokken som PNG i docs/228/.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4000/docs/228/probe/head/index.html"; import("./docs/228/probe/rom.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
const tag = process.env.TAG || 'etter';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/', 9333, 1);
const ut = await p.eval(`(async () => {
  try { await _loadProducts(); } catch (e) {}
  S.varmefolie.gapCm = 2; ${FIX} _currentProfile = null;
  const kj = mk(41, 'Kjøkken', rect(3000, 0, 300, 300)); S.rooms.push(kj);
  hind(941, 41, rect(3100, 110, 100, 80), 'ØY');
  _invalidateStripCache(); autoAddStrips(41, F60.id); _invalidateStripCache();
  S.ui.selectedRoomId = 41; autoDimHindrings(); S.ui.selectedRoomId = null; S.ui.selectedDimId = null;
  kj.dimSnap = true;
  const png = (cv, x, y, w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(cv, x, y, w, h, 0, 0, c.width, c.height); return c.toDataURL('image/png').split(',')[1]; };
  const kjor = (navn, pv) => {
    if (pv) kj.pdfView = pv; else delete kj.pdfView;
    const lay = _pdfRoomImgLayout(kj), cv = document.createElement('canvas');
    const r = _renderRoomToImage(kj, { focusRoom: true, targetWidthMm: lay.imgW2, toCanvas: cv, noUrl: true });
    const W = cv.width, H = cv.height, sb = r.scaleBar;
    const dims = (r.texts || []).filter(t => t.dim);
    const bar = sb ? [Math.max(0, sb.x - 250), Math.max(0, sb.y - 250), Math.min(W, sb.w + 500), Math.min(H, sb.h + 500)] : [0, H - 420, 800, 420];
    return { navn, W, H, mm: lay.imgW2, view: r.view, dimFit: r.dimFit || null, scaleBar: sb || null, antallMaal: dims.length,
      utenfor: r.texts ? dims.filter(b => b.x0 < 0 || b.y0 < 0 || b.x1 > W || b.y1 > H).map(b => b.str) : 'ukjent (HEAD)',
      hel: png(cv, 0, 0, W, H), venstre: png(cv, 0, 0, 520, H), maalestokk: png(cv, bar[0], bar[1], Math.min(bar[2], W - bar[0]), Math.min(bar[3], H - bar[1])) };
  };
  const res = [];
  res.push(kjor('kutt', { cx: 3135.5, cy: 150, scale: 1.6 }));          // lagret utsnitt som skjærer venstre kant
  res.push(kjor('auto', null));                                          // auto-utsnitt
  res.push(kjor('detalj', { cx: 3080, cy: 80, scale: 3 }));              // zoomet inn på en detalj med vilje
  _currentProfile = { prefs: { pdfLabelScale: 1.5 } };
  res.push(kjor('kutt-xstor', { cx: 3135.5, cy: 150, scale: 1.6 }));
  return res;
})()`);
for (const r of ut) {
  for (const k of ['hel', 'venstre', 'maalestokk']) { fs.writeFileSync(`docs/228/${tag}-${r.navn}-${k}.png`, Buffer.from(r[k], 'base64')); delete r[k]; }
  console.log(JSON.stringify(r));
}
fs.writeFileSync(`docs/228/probe/rom-${tag}.json`, JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
