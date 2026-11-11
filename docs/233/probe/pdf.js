(async () => {
  window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
  const Ekte = window.jspdf.jsPDF; let out = null; const tekst = [];
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); const t0 = d.text.bind(d);
    d.text = function (t, ...q) { tekst.push(Array.isArray(t) ? t.join(" ") : String(t)); return t0(t, ...q); };
    d.save = function () { out = { sider: d.internal.getNumberOfPages(), b64: d.output("datauristring").split(",")[1] }; return d; }; return d; };
  try { await exportPDF({ cover: false, summary: false, floorplan: false, rooms: [window.__RID], stairs: [], roomTable: false, stairTable: false,
    materialList: false, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: "" }); } finally { window.jspdf.jsPDF = Ekte; }
  if (!out) return { feil: "ingen PDF", tekst };
  await new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
    s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"; res(1); }; s.onerror = () => rej(new Error("pdf.js")); document.head.appendChild(s); });
  const bin = atob(out.b64), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const pg = await pdf.getPage(1), vp = pg.getViewport({ scale: 150 / 72 });
  const cv = document.createElement("canvas"); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
  const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
  await pg.render({ canvasContext: g, viewport: vp }).promise;
  out.png = cv.toDataURL("image/png").split(",")[1]; out.tekst = tekst;
  return out;
})()
