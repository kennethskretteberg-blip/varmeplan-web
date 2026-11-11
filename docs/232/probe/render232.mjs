// 232: PDF-side → PNG med pdf.js i nettleseren. JOBB="fil:side:dpi:utnavn[:xMm:yMm:wMm:hMm];…"
//   node -e ' process.env.JOBB="med:6:200:tabellside"; import("./docs/232/probe/render232.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
const p = await openPage('http://localhost:4000/docs/232/probe/tom.html', 9333, 1);
await p.eval(`new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
  s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; res(1); }; s.onerror = () => rej(new Error('pdf.js')); document.head.appendChild(s); })`);
for (const j of process.env.JOBB.split(';').filter(Boolean)) {
  const [fil, side, dpi, navn, x, y, w, h] = j.split(':');
  const cl = x != null ? [+x, +y, +w, +h] : null;
  const r = await p.eval(`(async () => { const buf = await (await fetch('/docs/232/probe/${fil}.pdf')).arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const pg = await pdf.getPage(${+side}), vp = pg.getViewport({ scale: ${+dpi} / 72 }), k = ${+dpi} / 25.4; const cl = ${JSON.stringify(cl)};
    const cv = document.createElement('canvas'); cv.width = Math.round(cl ? cl[2] * k : vp.width); cv.height = Math.round(cl ? cl[3] * k : vp.height);
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); if (cl) g.translate(-cl[0] * k, -cl[1] * k);
    await pg.render({ canvasContext: g, viewport: vp }).promise;
    return { w: cv.width, h: cv.height, b64: cv.toDataURL('image/png').split(',')[1] }; })()`);
  fs.writeFileSync(`docs/232/${navn}.png`, Buffer.from(r.b64, 'base64'));
  console.log(navn, r.w + 'x' + r.h);
}
await p.close(); process.exit(0);
