// 181: PDF-tekst (side + font + størrelse + x/y) for et testprosjekt. Bruk:
//   node maal.mjs <port> <tag> <fixture: blandet|folie|mange> [cableTable: 1|0|-]
// «-» = valget sendes ikke (som før 181). Skriver /tmp/cdp181/<tag>.{json,pdf}.
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const [,, port, tag, fixture = 'blandet', ct = '-'] = process.argv;
const p = await openPage(`http://localhost:${port}/`);
if (process.env.SHOT) await p.eval('window.__STOPP = true');
const r = await p.eval(`(async()=>{
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
  window._showToast = () => {}; window.showAccessoriesModal = () => Promise.resolve({ items: [] });
  window._pdfBranding = () => Promise.resolve(null);
  const F60  = { id: 996101, category_id: 1, active: true, name: 'FlexFoil B=60cm',  width_mm: 590, netto_width_mm: 590, watt_per_lm: 36, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25, el_no: '1001060', article_no: 'FF-60' };
  const K1 = { id: 996201, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 600W 60m',  voltage: 230, cable_length_m: 60, watt_per_m: 10, total_effect_w: 600, el_no: '1002601', article_no: 'TK10-600' };
  const K2 = { id: 996202, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 400W 40m',  voltage: 230, cable_length_m: 40, watt_per_m: 10, total_effect_w: 400, el_no: '1002401', article_no: 'TK10-400' };
  const K4 = { id: 996204, category_id: 2, active: true, product_family: 'InSnow 20T', name: 'InSnow 20T 2350W 117.4m 400V', voltage: 400, cable_length_m: 117.4, watt_per_m: 20, total_effect_w: 2350, el_no: '1002235' };
  const K3 = { id: 996203, category_id: 2, active: true, product_family: 'TestKabel 17T', name: 'TestKabel 17T 1020W 60m', voltage: 230, cable_length_m: 60, watt_per_m: 17, total_effect_w: 1020, el_no: '1002102', article_no: 'TK17-1020' };
  HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(F60, K1, K2, K3, K4);
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 1, name: 'Folie', module_type: 'foil' }, { id: 2, name: 'Kabel', module_type: 'cable' });
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, navn, pts, floorId) => ({ id, floorId, partId: null, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
  const st = (id, roomId, productId, dir, pos, start, len) => ({ id, roomId, productId, direction: dir, pos_cm: pos, start_cm: start, length_cm: len });
  // Kabel: serpentin med n løp i x0..x0+w, y0..y0+h, CC = cc.
  const cab = (id, roomId, prod, cc, x0, y0, w, h, extra) => {
    const runs = []; for (let x = x0 + cc / 2; x < x0 + w; x += cc) runs.push({ pos_cm: x, segments: [{ start_cm: y0 + cc / 2, end_cm: y0 + h - cc / 2 }] });
    return Object.assign({ id, roomId, productId: prod.id, direction: 'v', spacing_cm: cc, startCorner: 'bl', totalLength_cm: prod.cable_length_m * 100, runs, connections: [] }, extra || {});
  };
  S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.zones = []; S.hindrings = []; S.stairs = []; S.foilFree = []; S.strips = [];
  S.project = { name: 'KABEL 181', parts: [], revision: 0, lastExportedAt: null, createdAt: Date.now() };
  S.floors = [{ id: 1, name: '1. etasje', order: 1 }, { id: 2, name: '2. etasje', order: 2 }];
  const F = ${JSON.stringify(fixture)};
  if (F === 'mange') {
    S.rooms = []; 
    for (let i = 0; i < 40; i++) { S.rooms.push(mk(100 + i, 'Rom ' + (i + 1), rect((i % 8) * 400, Math.floor(i / 8) * 400, 300, 250), i < 20 ? 1 : 2));
      S.cables.push(cab(5000 + i, 100 + i, [K1, K2, K3][i % 3], 10, (i % 8) * 400, Math.floor(i / 8) * 400, 300, 250)); }
  } else {
    S.rooms = [ mk(11, 'Stue', rect(0,0,600,400), 1), mk(12, 'Bad', rect(700,0,300,250), 1), mk(13, 'Gang', rect(700,300,400,200), 1),
                mk(14, 'Vaskerom', rect(0,0,500,400), 2), mk(15, 'Bad 2. etg', rect(600,0,300,250), 2) ];
    S.strips = [ st(1,11,F60.id,'v',50,20,360), st(2,11,F60.id,'v',115,20,360) ];
    if (F === 'blandet' || F === 'reserve') S.cables = [
      cab(901, 12, K2, 7.5, 700, 0, 300, 250),
      cab(902, 13, K1, 6.7, 700, 300, 400, 200),
      cab(903, 14, K3, 10, 0, 0, 250, 400, { multiCableGroup: 1, multiCableIndex: 0 }),
      cab(904, 14, K3, 10, 250, 0, 250, 400, { multiCableGroup: 1, multiCableIndex: 1 }),
      cab(905, 15, K2, 7.5, 600, 0, 300, 250) ];
    if (F === 'reserve') S.cables.push(cab(906, 15, K2, 7.5, 600, 0, 300, 250, { reserve: true, _manual: true, mainCableId: 905 }), cab(907, 11, K4, 10, 0, 0, 600, 400));
  }
  _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
  _showExportDialog();
  const dlg = document.getElementById('export-dialog');
  const dlgTxt = dlg ? [...dlg.querySelectorAll('.exp-check')].map(e => (e.querySelector('input')?.id || '') + '=' + (e.querySelector('input')?.checked ? 'på' : 'av') + ' ' + e.textContent.trim().replace(/\\s+/g,' ')) : [];
  let prev = '';
  if (document.getElementById('exp-cabletable')) { _expPreviewSection('cabletable'); await new Promise(r=>setTimeout(r,200)); const pv = document.querySelector('#exp-preview, #export-dialog .exp-right'); prev = pv ? pv.innerText.replace(/\\s+/g,' ').slice(0, 1500) : ''; }
  if (window.__STOPP) return { stopp: true };
  if (dlg) dlg.style.display = 'none';
  const Ekte = window.jspdf.jsPDF; let tekst = [], b64 = null, sider = 0;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); const t0 = d.text.bind(d);
    d.text = function (txt, ...rr) { const f = d.getFont(); tekst.push({ t: f.fontName === 'symbol' ? 'Ω' : (Array.isArray(txt) ? txt.join(' ') : String(txt)), page: d.internal.getCurrentPageInfo().pageNumber, font: f.fontName + '/' + f.fontStyle, size: d.getFontSize(), x: +(+(rr[0]||0)).toFixed(1), y: +(+(rr[1]||0)).toFixed(1) }); return t0(txt, ...rr); };
    d.save = function () { sider = d.internal.getNumberOfPages(); b64 = d.output('datauristring').split(',')[1]; return d; }; return d; };
  const opts = { cover: true, summary: true, floorplan: false, rooms: S.rooms.map(r => r.id), stairs: [], roomTable: true, stairTable: false, materialList: true, resistance: true, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' };
  const CT = ${JSON.stringify(ct)}; if (CT !== '-') opts.cableTable = CT === '1';
  await exportPDF(opts);
  window.jspdf.jsPDF = Ekte;
  // Overskrift per side (første 16 pt-tekst, ellers første tekst)
  const sideTittel = {}; for (const x of tekst) if (x.size >= 14 && !sideTittel[x.page]) sideTittel[x.page] = x.t;
  return { sider, dlgTxt, prev, sideTittel, tekst, b64 };
})()`);
if (r.stopp) { await p.shot(process.env.SHOT); await p.close(); process.exit(0); }
fs.mkdirSync('/tmp/cdp181', { recursive: true });
fs.writeFileSync(`/tmp/cdp181/${tag}.pdf`, Buffer.from(r.b64 || '', 'base64'));
delete r.b64;
fs.writeFileSync(`/tmp/cdp181/${tag}.json`, JSON.stringify(r, null, 1));
console.log('sider', r.sider); console.log('sidetitler', r.sideTittel); console.log('dialog', r.dlgTxt.join('\n  ')); if (r.prev) console.log('forhåndsvisning', r.prev);
await p.close(); process.exit(0);
