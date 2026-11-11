// 232: testprosjektet (fire folierom, ett uten folie, EKTE produkter fra databasen) → PDF med og uten
// «Motstandsmåling», tekstdump per side, og PNG (pdf.js, 200 DPI) + utsnitt (600 DPI).
//   node -e ' import("./docs/232/probe/pdf232.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
const ut = {};
for (const [tag, res] of [['med', true], ['uten', false]]) {
  const p = await openPage(process.env.URL0 || 'http://localhost:4000/', 9333, 1);
  const r = await p.eval(`(async () => {
    await _loadProducts();
    window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
    window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
    const P = b => HEATING_PRODUCTS.find(p => p.name === 'FlexFoil B=' + b + 'cm');
    const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
    const mkRoom = (id, navn, pts) => ({ id, floorId: 998001, partId: null, name: navn, points: pts.map(q => ({ ...q })), walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
    let sid = 998300;
    const strip = (roomId, b, pos, start, len) => ({ id: ++sid, roomId, productId: P(b).id, direction: 'v', pos_cm: pos, start_cm: start, length_cm: len });
    S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.foilFree = []; S.zones = []; S.hindrings = []; S.stairs = [];
    S.project = { name: 'Testprosjekt 232', customer: 'Test', projectNo: 232, parts: [], revision: 0, lastExportedAt: null, createdAt: 0 };
    S.floors = [{ id: 998001, name: '1. etasje', order: 1 }];
    S.rooms = [mkRoom(1, 'Stue', rect(0, 0, 600, 500)), mkRoom(2, 'Kjøkken', rect(700, 0, 500, 400)), mkRoom(3, 'Bod uten folie', rect(1300, 0, 300, 300)),
      mkRoom(4, 'Kontor', rect(0, 600, 500, 400)), mkRoom(5, 'Gang', rect(700, 600, 500, 300))];
    S.strips = [strip(1, 100, 50, 20, 450), strip(1, 100, 160, 20, 450), strip(2, 60, 750, 20, 360), strip(2, 100, 830, 20, 300),
      strip(4, 20, 50, 620, 300), strip(4, 40, 80, 620, 300), strip(4, 100, 130, 620, 300),
      strip(5, 20, 750, 620, 200), strip(5, 40, 780, 620, 200), strip(5, 60, 830, 620, 200)];
    _invalidateStripCache();
    const Ekte = window.jspdf.jsPDF; let out = null; const tekst = [];
    window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); const t0 = d.text.bind(d);
      d.text = function (t, ...q) { tekst.push([d.internal.getCurrentPageInfo().pageNumber, d.getFont().fontName === 'symbol' ? 'Ω' : (Array.isArray(t) ? t.join(' ') : String(t))]); return t0(t, ...q); };
      d.save = function () { out = { sider: d.internal.getNumberOfPages(), b64: d.output('datauristring').split(',')[1] }; return d; }; return d; };
    try { await exportPDF({ cover: false, summary: false, floorplan: false, rooms: S.rooms.map(r => r.id), stairs: [], roomTable: false, stairTable: false,
      materialList: false, resistance: ${res}, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' }); } finally { window.jspdf.jsPDF = Ekte; }
    const rr = _foilResistanceRooms(S.rooms);
    return Object.assign(out, { tekst, eksempel: (_foilResistanceExample(rr) || { room: {} }).room.name,
      rom: rr.map(e => ({ navn: e.room.name, areal: e.res.areaM2, P: e.res.P, areal60: e.res.areaM2 * 60, avvikPst: (e.res.areaM2 * 60 / e.res.P - 1) * 100, rNom: e.res.rNom })),
      produkter: HEATING_PRODUCTS.filter(p => p.category_id === 1).map(p => ({ navn: p.name, width_mm: p.width_mm, netto_width_mm: p.netto_width_mm, watt_per_lm: p.watt_per_lm, w60: 60 * (p.netto_width_mm || p.width_mm) / 1000, avvikPst: p.watt_per_lm ? (60 * (p.netto_width_mm || p.width_mm) / 1000 / p.watt_per_lm - 1) * 100 : null })) });
  })()`);
  fs.writeFileSync(`docs/232/probe/${tag}.pdf`, Buffer.from(r.b64, 'base64')); delete r.b64;
  ut[tag] = r; console.log(tag, r.sider, 'sider', 'eksempel:', r.eksempel);
  await p.close();
}
fs.writeFileSync('docs/232/probe/pdf232.json', JSON.stringify(ut, null, 1));
console.log(JSON.stringify(ut.med.rom)); console.log(JSON.stringify(ut.med.produkter));
process.exit(0);
