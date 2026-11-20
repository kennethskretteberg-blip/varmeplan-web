// 239: PDF-side → PNG (200 DPI) med pdf.js i nettleseren (etter docs/230/probe/render.mjs).
//   node -e ' import("./docs/239/probe/render.mjs") '
import fs from "node:fs";
import { openPage } from "./cdpklient.mjs";
const p = await openPage("http://localhost:4000/docs/230/probe/tom.html", 9333, 1);
await p.eval(`new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
  s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"; res(1); }; s.onerror = () => rej(new Error("pdf.js")); document.head.appendChild(s); })`);
for (const tag of (process.env.TAGS || "eget,iplan").split(",")) {
  const n = await p.eval(`(async () => { const buf = await (await fetch("/docs/239/probe/${tag}.pdf")).arrayBuffer(); window.__pdf = await pdfjsLib.getDocument({ data: buf }).promise; return __pdf.numPages; })()`);
  for (let nr = 1; nr <= n; nr++) {
    const r = await p.eval(`(async () => { const pg = await __pdf.getPage(${nr}), vp = pg.getViewport({ scale: 200 / 72 }); const cv = document.createElement("canvas"); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
      const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); await pg.render({ canvasContext: g, viewport: vp }).promise;
      const txt = (await pg.getTextContent()).items.map(i => i.str).join(" ");
      return { w: cv.width, h: cv.height, b64: cv.toDataURL("image/png").split(",")[1], sider: (txt.match(/Avstand sider: [^|]*?(?=   |$| Kabel| CC)/g) || []).slice(0, 3) }; })()`);
    fs.writeFileSync(`docs/239/${tag}-pdf-side${nr}.png`, Buffer.from(r.b64, "base64"));
    console.log(tag, "side", nr, r.w + "x" + r.h, JSON.stringify(r.sider));
  }
}
await p.close(); process.exit(0);
