// 230: PDF for fire trapper (kort rett, lang rett, med repos, hestesko), én PDF per trapp.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4000/docs/230/probe/head/index.html"; import("./docs/230/probe/pdf.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
const tag = process.env.TAG || 'etter';
const bare = process.env.BARE ? process.env.BARE.split(',') : null;
const FIX = fs.readFileSync(new URL('./fixtur.js', import.meta.url), 'utf8');
const ut = [];
for (const navn of ['kort', 'lang', 'repos', 'hestesko']) {
  if (bare && !bare.includes(navn)) continue;
  const p = await openPage(process.env.URL0 || 'http://localhost:4000/', 9333, 1);
  const r = await p.eval(`(async () => {
    window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
    window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
    ${FIX}
    const st = FIXTUR230['${navn}']();
    S.project = { name: 'Trapp 230', customer: 'Test', projectNo: 230, revision: 0, lastExportedAt: null, createdAt: 0, parts: [] };
    const Ekte = window.jspdf.jsPDF; let res = null; const img = [], tekst = [];
    window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); d.setCreationDate(new Date(2026, 10, 10, 12, 0, 0)); d.setFileId('0123456789ABCDEF0123456789ABCDEF');
      const ai = d.addImage.bind(d); d.addImage = function (u, f, x, y, w, h, ...r) { img.push({ side: d.internal.getCurrentPageInfo().pageNumber, w: +w.toFixed(1), h: +h.toFixed(1), url: typeof u === 'string' ? u.length : -1 }); return ai(u, f, x, y, w, h, ...r); };
      const t0 = d.text.bind(d); d.text = function (t, ...r) { tekst.push([d.internal.getCurrentPageInfo().pageNumber, Array.isArray(t) ? t.join(' ') : String(t)]); return t0(t, ...r); };
      d.save = function (n) { res = { sider: d.internal.getNumberOfPages(), b64: d.output('datauristring').split(',')[1] }; return d; }; return d; };
    const opts = { cover: false, summary: false, floorplan: false, rooms: [], stairs: [st.id], roomTable: false, stairTable: false, materialList: false,
      resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' };
    const t0 = performance.now();
    try { await exportPDF(opts); } finally { window.jspdf.jsPDF = Ekte; }
    const ms = Math.round(performance.now() - t0);
    const lay = typeof _stairPdfLayout === 'function' ? _stairPdfLayout(st) : null;
    const sp = typeof _renderStairPdfImages === 'function' ? _renderStairPdfImages(st) : null;
    const px = sp ? { plan: sp.plan.wPx + 'x' + sp.plan.hPx, side: sp.side && (sp.side.wPx + 'x' + sp.side.hPx),
      skriftMm: [...new Set(sp.plan.texts.concat(sp.side ? sp.side.texts : []).filter(t => t.dim).map(t => +(t.fontPx * 25.4 / lay.dpi).toFixed(2)))] } : null;
    const gml = !sp ? { plan: _renderStairPrintImages(st).length, side: _renderStairSidePrintImages(st).length, utsnitt: _renderStairDetailInsets(st).length } : null;
    if (lay) { delete lay.plan.texts; }
    return Object.assign(res || {}, { ms, img, tekst, lay, px, gml, flater: st.surfaces.length, kabel_m: st.totalCableLength_cm / 100,
      heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null });
  })()`);
  const buf = Buffer.from(r.b64 || '', 'base64'); delete r.b64;
  fs.writeFileSync(`docs/230/probe/${tag}-${navn}.pdf`, buf);
  r.navn = navn; r.bytes = buf.length; ut.push(r);
  console.log(navn, JSON.stringify({ sider: r.sider, bytes: r.bytes, ms: r.ms, img: r.img, lay: r.lay, px: r.px, gml: r.gml, heap: r.heap }));
  await p.close();
}
fs.writeFileSync(`docs/230/probe/pdf-${tag}.json`, JSON.stringify(ut, null, 1));
process.exit(0);
