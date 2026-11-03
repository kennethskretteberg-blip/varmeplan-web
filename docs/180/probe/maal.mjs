// STEG 0 / etter: PDF-tekst (side + font + størrelse) for et folieprosjekt med 4 rom (3 folie) på 2 etasjer.
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const [,, port, tag, mode] = process.argv;
const p = await openPage(`http://localhost:${port}/`);
const r = await p.eval(`(async()=>{
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
  window._showToast = () => {}; window.showAccessoriesModal = () => Promise.resolve({ items: [] });
  window._pdfBranding = () => Promise.resolve(null);
  const F60  = { id: 996101, category_id: 1, active: true, name: 'FlexFoil B=60cm',  width_mm: 590, netto_width_mm: 590, watt_per_lm: 36, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25 };
  const F100 = { id: 996102, category_id: 1, active: true, name: 'FlexFoil B=100cm', width_mm: 990, netto_width_mm: 990, watt_per_lm: 60, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25 };
  HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(F60, F100);
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 1, name: 'Folie' });
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, navn, pts, floorId) => ({ id, floorId, partId: null, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
  const st = (id, roomId, productId, dir, pos, start, len) => ({ id, roomId, productId, direction: dir, pos_cm: pos, start_cm: start, length_cm: len });
  S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.zones = []; S.hindrings = []; S.stairs = [];
  S.project = { name: 'MOTSTAND 180', parts: [], revision: 0, lastExportedAt: null, createdAt: Date.now() };
  S.floors = [{ id: 1, name: '1. etasje', order: 1 }, { id: 2, name: '2. etasje', order: 2 }];
  S.rooms = [ mk(11, 'Stue', rect(0,0,600,400), 1), mk(12, 'Kjøkken', rect(700,0,500,400), 1), mk(13, 'Bad', rect(0,0,300,250), 2), mk(14, 'Bod uten folie', rect(400,0,200,200), 2) ];
  S.strips = ${mode === 'utenfolie' ? '[]' : `[ st(1,11,F60.id,'v',50,20,360), st(2,11,F60.id,'v',115,20,360), st(3,11,F100.id,'v',180,20,360),
    st(4,12,F60.id,'v',750,20,360), st(5,12,F60.id,'v',815,20,360), st(6,13,F60.id,'v',30,20,210) ]`};
  S.foilFree = [];
  _invalidateStripCache();
  // Dialogen
  _showExportDialog();
  const dlg = document.getElementById('export-dialog');
  const dlgTxt = dlg ? [...dlg.querySelectorAll('.exp-check span, .exp-check, .exp-group-title')].map(e => e.textContent.trim().replace(/\\s+/g,' ')).filter(t => /otstand/i.test(t)) : [];
  let prev = '';
  if (document.getElementById('exp-resistance')) { _expPreviewSection('resistance'); await new Promise(r=>setTimeout(r,300)); const pv = document.querySelector('#export-dialog .exp-right, #exp-preview'); prev = pv ? pv.innerText.split('\\n').filter(t=>/otstand/i.test(t)).join(' | ') : '(fant ikke forhåndsvisning)'; }
  if (dlg) dlg.style.display = 'none';
  const Ekte = window.jspdf.jsPDF; let tekst = [], b64 = null, sider = 0;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); const t0 = d.text.bind(d);
    d.text = function (txt, ...rr) { const f = d.getFont(); tekst.push({ t: f.fontName === 'symbol' ? 'Ω' : (Array.isArray(txt) ? txt.join(' ') : String(txt)), page: d.internal.getCurrentPageInfo().pageNumber, font: f.fontName + '/' + f.fontStyle, size: d.getFontSize(), x: +(rr[0]||0).toFixed?.(1), y: +(rr[1]||0).toFixed?.(1) }); return t0(txt, ...rr); };
    d.save = function () { sider = d.internal.getNumberOfPages(); b64 = d.output('datauristring').split(',')[1]; return d; }; return d; };
  await exportPDF({ cover: true, summary: true, floorplan: false, rooms: S.rooms.map(r => r.id), stairs: [], roomTable: true, stairTable: false, materialList: true, resistance: true, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' });
  window.jspdf.jsPDF = Ekte;
  return { sider, dlgTxt, prev, tekst, b64 };
})()`);
fs.writeFileSync(`/tmp/cdp180/${tag}.pdf`, Buffer.from(r.b64 || '', 'base64'));
delete r.b64;
fs.writeFileSync(`/tmp/cdp180/${tag}.json`, JSON.stringify(r, null, 1));
console.log('sider', r.sider); console.log('dialog', r.dlgTxt); console.log('forhåndsvisning', r.prev);
for (const x of r.tekst) if (/otstand|elektriker/i.test(x.t)) console.log(x.page, x.font, x.size, JSON.stringify(x.t).slice(0, 140));
await p.close(); process.exit(0);
