// 225: PDF-bildene (rom 31 kabel, rom 32 folie, plantegning) før (HEAD-kopi) og etter — skal være BIT-IDENTISKE,
// siden ingen tokenendring skal lekke inn i PDF-en. Tegnes i mørkt tema på skjermen for å provosere en lekkasje
// (PDF-veien tvinger S.ui.theme='light' selv). Skriver sha256 av pikslene og hele PDF-ens størrelse.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/225/probe/head/index.html"; import("./docs/225/probe/pdf.mjs") '
//   node -e ' process.env.TAG="etter"; import("./docs/225/probe/pdf.mjs") '
import fs from 'node:fs';
import crypto from 'node:crypto';
import { openPage, TEMA } from './cdpklient.mjs';
import { FIX } from '../../224/probe/fixture.mjs';
import { BYGG } from '../../200/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const p = await openPage(url, 9333, 2);
await p.eval(`document.fonts.ready.then(() => 1)`);
const ut = await p.eval(`(async () => {
  S.varmefolie.gapCm = 2; ${FIX} window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null); _currentProfile = null;
  ${TEMA('dark')}
  await document.fonts.ready;
  const out = { rom: {}, png: {}, temaFoer: S.ui.theme };
  for (const rid of [31, 32]) {
    const cv = document.createElement('canvas');
    const r = _renderRoomToImage(S.rooms.find(x => x.id === rid), { toCanvas: cv, noUrl: true });
    out.rom[rid] = { w: r.w, h: r.h };
    out.png[rid] = cv.toDataURL('image/png').split(',')[1];
  }
  const cvF = document.createElement('canvas');
  const f = _renderFloorToImage(S.floors[0], { toCanvas: cvF, noUrl: true });
  out.etasje = { w: f.w, h: f.h };
  out.png.etasje = cvF.toDataURL('image/png').split(',')[1];
  out.temaEtter = S.ui.theme; out.lysKlasse = document.body.classList.contains('light-theme');
  return out;
})()`);
ut.sha = {};
for (const k of Object.keys(ut.png)) { const b = Buffer.from(ut.png[k], 'base64'); ut.sha[k] = crypto.createHash('sha256').update(b).digest('hex').slice(0, 16); fs.writeFileSync(`docs/225/probe/pdf-${k === 'etasje' ? 'plan' : 'rom' + k}-${tag}.png`, b); }
delete ut.png;
const opts = `({ cover: false, summary: false, floorplan: true, rooms: [31, 32, 33, 34], stairs: [], roomTable: true, stairTable: false, materialList: true, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' })`;
const pdf = await p.eval(BYGG(opts));
const pb = Buffer.from(pdf.b64, 'base64');
ut.pdf = { sider: pdf.sider, bytes: pb.length, sha: crypto.createHash('sha256').update(pb).digest('hex').slice(0, 16) };
fs.writeFileSync(`docs/225/probe/pdf-${tag}.pdf`, pb);
fs.writeFileSync(`docs/225/probe/pdf-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, JSON.stringify(ut));
await p.close(); process.exit(0);
