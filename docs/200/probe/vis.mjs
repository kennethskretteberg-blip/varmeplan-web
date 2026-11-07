// 200 (kopi fra 196): PDF-side → PNG + tekstinnhold, med pdf.js i nettleseren (samme bibliotek appen bruker for
// plantegninger). Bruk:
//   node -e ' process.env.PDF="docs/200/probe/for.pdf"; process.env.SIDE="1"; process.env.UT="docs/196/x.png"; import("./docs/200/probe/vis.mjs") '
// TEKST=1 skriver også ut tekstbitene på siden (det som er ekte tekst i PDF-en, ikke bilde).
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const pdf = fs.readFileSync(process.env.PDF).toString('base64');
const side = +(process.env.SIDE || 1), skala = +(process.env.SKALA || 2);
const p = await openPage('http://localhost:4000/');
const r = await p.eval(`(async () => {
  if (!window.pdfjsLib) await new Promise((ok, nei) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'; s.onload = ok; s.onerror = () => nei(new Error('pdf.js lastet ikke')); document.head.appendChild(s); });
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  const bin = atob(${JSON.stringify(pdf)}); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const doc = await pdfjsLib.getDocument({ data: u8 }).promise;
  const pg = await doc.getPage(${side}); const vp = pg.getViewport({ scale: ${skala} });
  const cv = document.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
  await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
  const tc = await pg.getTextContent();
  const ops = await pg.getOperatorList(); let bilder = 0;
  for (const f of ops.fnArray) if (f === pdfjsLib.OPS.paintImageXObject || f === pdfjsLib.OPS.paintJpegXObject) bilder++;
  return { sider: doc.numPages, w: cv.width, h: cv.height, bilder, png: cv.toDataURL('image/png').split(',')[1],
    tekst: tc.items.map(i => ({ s: i.str, x: +(i.transform[4] / 72 * 25.4).toFixed(1), y: +(297 - i.transform[5] / 72 * 25.4).toFixed(1) })).filter(i => i.s.trim()) };
})()`);
if (process.env.UT) fs.writeFileSync(process.env.UT, Buffer.from(r.png, 'base64'));
console.log('sider', r.sider, 'side', side, r.w + 'x' + r.h, 'bilder på siden:', r.bilder, 'tekstbiter:', r.tekst.length, process.env.UT ? '→ ' + process.env.UT : '');
if (process.env.TEKST) for (const t of r.tekst) console.log('  ', String(t.x).padStart(6), String(t.y).padStart(6), t.s);
await p.close(); process.exit(0);
