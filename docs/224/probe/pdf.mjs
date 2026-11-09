// 224: PDF før/etter av samme prosjekt (217-fixturet). jsPDF-teksten er Helvetica og uberørt; bare lerretsbildene
// (rom og plantegning) tegnes med Inter. Noterer sider, bytes, bildestørrelse og bbox, og lagrer rombildene som PNG
// så de kan sammenlignes visuelt (docs/224/pdf-rom3x-<tag>.png). deviceScaleFactor 2, lyst tema.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/224/probe/head/index.html"; import("./docs/224/probe/pdf.mjs") '
//   node -e ' process.env.TAG="etter"; import("./docs/224/probe/pdf.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
import { FIX } from './fixture.mjs';
import { BYGG } from '../../200/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const p = await openPage(url, 9333, 2);
await p.eval(`document.fonts.ready.then(() => 1)`);
const ut = await p.eval(`(async () => {
  S.varmefolie.gapCm = 2; ${FIX} window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null); _currentProfile = null;
  S.ui.theme = 'light'; document.body.classList.add('light-theme');
  await document.fonts.ready;
  const bbox = cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) { const i = (y * cv.width + x) * 4; if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    return [x0, y0, x1, y1]; };
  const out = { rom: {}, png: {} };
  for (const rid of [31, 32]) {
    const cv = document.createElement('canvas');
    const r = _renderRoomToImage(S.rooms.find(x => x.id === rid), { toCanvas: cv, noUrl: true });
    out.rom[rid] = { w: r.w, h: r.h, bbox: bbox(cv) };
    out.png[rid] = cv.toDataURL('image/png').split(',')[1];
  }
  const cvF = document.createElement('canvas');
  const f = _renderFloorToImage(S.floors[0], { toCanvas: cvF, noUrl: true });
  out.etasje = { w: f.w, h: f.h, bbox: bbox(cvF) };
  out.png.etasje = cvF.toDataURL('image/png').split(',')[1];
  return out;
})()`);
for (const k of Object.keys(ut.png)) fs.writeFileSync(`docs/224/pdf-${k === 'etasje' ? 'plan' : 'rom' + k}-${tag}.png`, Buffer.from(ut.png[k], 'base64'));
delete ut.png;
const t0 = Date.now();
const opts = `({ cover: false, summary: false, floorplan: true, rooms: [31, 32, 33, 34], stairs: [], roomTable: true, stairTable: false, materialList: true, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' })`;
const pdf = await p.eval(BYGG(opts));
ut.pdf = { sider: pdf.sider, bytes: Buffer.from(pdf.b64, 'base64').length, ms: Date.now() - t0 };
fs.writeFileSync(`docs/224/probe/pdf-${tag}.pdf`, Buffer.from(pdf.b64, 'base64'));
fs.writeFileSync(`docs/224/probe/pdf-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, JSON.stringify(ut));
await p.close(); process.exit(0);
