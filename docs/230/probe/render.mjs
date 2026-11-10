// 230: PDF-side → PNG i 300 DPI med pdf.js i nettleseren (samme bibliotek som appen bruker for bakgrunner).
//   node -e ' process.env.TAG="etter"; import("./docs/230/probe/render.mjs") '
// UTSNITT="navn:side:xMm:yMm:wMm:hMm;…" gir i tillegg et innzoomet utsnitt (900 DPI) per trapp.
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
const tag = process.env.TAG || 'etter';
const bare = process.env.BARE ? process.env.BARE.split(',') : ['kort', 'lang', 'repos', 'hestesko'];
const uts = {};
for (const u of (process.env.UTSNITT || '').split(';').filter(Boolean)) { const [n, s, x, y, w, h] = u.split(':'); uts[n] = [+s, +x, +y, +w, +h]; }
const p = await openPage('http://localhost:4000/docs/230/probe/tom.html', 9333, 1);
await p.eval(`new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
  s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; res(1); }; s.onerror = () => rej(new Error('pdf.js')); document.head.appendChild(s); })`);
for (const navn of bare) {
  const n = await p.eval(`(async () => { const buf = await (await fetch('/docs/230/probe/${tag}-${navn}.pdf')).arrayBuffer(); window.__pdf = await pdfjsLib.getDocument({ data: buf }).promise; return __pdf.numPages; })()`);
  const side = async (nr, dpi, clip) => p.eval(`(async () => { const pg = await __pdf.getPage(${nr}), vp = pg.getViewport({ scale: ${dpi} / 72 }), k = ${dpi} / 25.4;
    const cl = ${JSON.stringify(clip || null)}; const cv = document.createElement('canvas');
    cv.width = Math.round(cl ? cl[2] * k : vp.width); cv.height = Math.round(cl ? cl[3] * k : vp.height);
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    if (cl) g.translate(-cl[0] * k, -cl[1] * k);
    await pg.render({ canvasContext: g, viewport: vp }).promise;
    return { w: cv.width, h: cv.height, b64: cv.toDataURL('image/png').split(',')[1] }; })()`);
  for (let nr = 1; nr <= n; nr++) {
    const r = await side(nr, 300);
    fs.writeFileSync(`docs/230/${tag}-${navn}-side${nr}.png`, Buffer.from(r.b64, 'base64'));
    console.log(navn, 'side', nr, r.w + 'x' + r.h);
  }
  if (uts[navn]) {
    const [s, x, y, w, h] = uts[navn];
    const r = await side(s, 900, [x, y, w, h]);
    fs.writeFileSync(`docs/230/${tag}-${navn}-utsnitt.png`, Buffer.from(r.b64, 'base64'));
    console.log(navn, 'utsnitt', r.w + 'x' + r.h);
  }
}
await p.close(); process.exit(0);
