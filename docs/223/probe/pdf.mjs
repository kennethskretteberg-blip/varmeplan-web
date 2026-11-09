// 223: PDF-bildene tegnes på hovedlerretet og skal være 1:1 som før — samme pikselstørrelse, samme
// plassering av rommet, samme målstørrelser (226). Ved deviceScaleFactor 2 (der feilen ville vist seg)
// hentes _renderRoomToImage for rom 31/32 og _renderFloorToImage, og vi noterer bredde/høyde, bbox for
// ikke-hvite piksler (plasseringen) og en hash av pikslene. HEAD-kopi mot arbeidskopi. I tillegg bygges
// hele PDF-en (som 226) og lagres, så bytestørrelse kan sammenlignes.
//   node -e ' process.env.TAG="head"; process.env.URL0="http://localhost:4013/docs/223/probe/head/index.html"; import("./docs/223/probe/pdf.mjs") '
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
import { BYGG } from '../../200/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const p = await openPage(url, 9333, 2);
const ut = await p.eval(`(async () => {
  S.varmefolie.gapCm = 2; ${FIX} window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null); _currentProfile = null;
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  const bbox = cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) { const i = (y * cv.width + x) * 4; if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    return [x0, y0, x1, y1]; };
  const out = { dpr: window.devicePixelRatio, skjermBacking: [canvas.width, canvas.height], rom: {} };
  for (const rid of [31, 32]) {
    const cv = document.createElement('canvas');
    const r = _renderRoomToImage(S.rooms.find(x => x.id === rid), { toCanvas: cv, noUrl: true });
    out.rom[rid] = { w: r.w, h: r.h, lerret: [cv.width, cv.height], bbox: bbox(cv), hash: hash(cv.toDataURL('image/png')) };
  }
  const cvF = document.createElement('canvas');
  const f = _renderFloorToImage(S.floors[0], { toCanvas: cvF, noUrl: true });
  out.etasje = { w: f.w, h: f.h, lerret: [cvF.width, cvF.height], bbox: bbox(cvF), hash: hash(cvF.toDataURL('image/png')) };
  out.skjermEtter = [canvas.width, canvas.height];
  out.dprEtter = typeof _cvDpr === 'number' ? _cvDpr : 'n/a';
  return out;
})()`);
const t0 = Date.now();
const opts = `({ cover: false, summary: false, floorplan: true, rooms: [31, 32, 33, 34], stairs: [], roomTable: false, stairTable: false, materialList: false, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' })`;
const pdf = await p.eval(BYGG(opts));
ut.pdf = { sider: pdf.sider, bytes: Buffer.from(pdf.b64, 'base64').length, ms: Date.now() - t0 };
fs.writeFileSync(`docs/223/probe/pdf-${tag}.pdf`, Buffer.from(pdf.b64, 'base64'));
fs.writeFileSync(`docs/223/probe/pdf-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, JSON.stringify(ut));
await p.close(); process.exit(0);
