// 196: testprosjekt som JS-kildetekst (limes inn i sidens eval). Seks rom:
//   21 Nedkjøring  570 × 1600 (91,2 m², snødel)  7 InSnow 300T-matter i stående striper (4 × 0,5×16 + 3 × 1×16)
//   22 Lager      1400 × 500   22 foliebaner 60 cm (stående)
//   23 Kontor      780 × 400   24 foliebaner 30 cm (stående, smale → sirklene må forskyves)
//   24 Bad         300 × 250   én kabel
//   25 Stue        800 × 400   6 foliebaner 60 cm (liggende) → bredt rom
//   26 Gang        400 × 300   to kabler (flerkabel-gruppe)
export const FIX = `
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
  window.showAccessoriesModal = () => Promise.resolve({ items: [] });
  window._pdfBranding = () => Promise.resolve(null);
  const F60 = { id: 996101, category_id: 1, active: true, name: 'FlexFoil 60W B=60cm', width_mm: 590, netto_width_mm: 590, watt_per_lm: 36, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25, el_no: '1001060', article_no: 'FF-60' };
  const F30 = { id: 996102, category_id: 1, active: true, name: 'FlexFoil 60W B=30cm', width_mm: 290, netto_width_mm: 290, watt_per_lm: 18, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25, el_no: '1001030', article_no: 'FF-30' };
  const K1 = { id: 996201, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 600W 60m', voltage: 230, cable_length_m: 60, watt_per_m: 10, total_effect_w: 600, el_no: '1002601', article_no: 'TK10-600' };
  const K2 = { id: 996202, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 400W 40m', voltage: 230, cable_length_m: 40, watt_per_m: 10, total_effect_w: 400, el_no: '1002401', article_no: 'TK10-400' };
  const M05 = { id: 996316, category_id: 3, active: true, product_family: 'InSnow 300T', name: 'InSnow 300T 0,5x16m', voltage: 400, mat_area_m2: 8, mat_width_mm: 500, watt_per_m2: 300, total_effect_w: 2400, mat_cc_mm: 100, el_no: '1003516', article_no: 'IS300-0516' };
  const M10 = { id: 996317, category_id: 3, active: true, product_family: 'InSnow 300T', name: 'InSnow 300T 1x16m', voltage: 400, mat_area_m2: 16, mat_width_mm: 1000, watt_per_m2: 300, total_effect_w: 4800, mat_cc_mm: 100, el_no: '1003116', article_no: 'IS300-1016' };
  HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(F60, F30, K1, K2, M05, M10);
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 1, name: 'Folie', module_type: 'foil' }, { id: 2, name: 'Kabel', module_type: 'cable' }, { id: 3, name: 'Varmematte utendørs', module_type: 'mat' });
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, navn, pts, floorId, partId) => ({ id, floorId, partId, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
  const st = (id, roomId, productId, dir, pos, start, len) => ({ id, roomId, productId, direction: dir, pos_cm: pos, start_cm: start, length_cm: len });
  const cab = (id, roomId, prod, cc, x0, y0, w, h, ekstra) => {
    const runs = []; for (let x = x0 + cc / 2; x < x0 + w; x += cc) runs.push({ pos_cm: x, segments: [{ start_cm: y0 + cc / 2, end_cm: y0 + h - cc / 2 }] });
    return { id, roomId, productId: prod.id, direction: 'v', spacing_cm: cc, startCorner: 'bl', totalLength_cm: prod.cable_length_m * 100, runs, connections: [], ...(ekstra || {}) };
  };
  S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.zones = []; S.hindrings = []; S.stairs = []; S.foilFree = []; S.strips = [];
  S.project = { name: 'AMFI Moa Øst (fixture 196)', customer: 'Elektro 24 AS', projectNo: 196, revision: 0, lastExportedAt: null, createdAt: Date.now(),
    parts: [{ id: 71, name: 'Innendørs', moduleType: 'indoor' }, { id: 72, name: 'Utendørs — Snøsmelting', moduleType: 'snow' }] };
  S.floors = [{ id: 1, name: '1. etasje', order: 1, partId: 71 }, { id: 2, name: 'Uteareal', order: 2, partId: 72 }];
  S.ui.activePartId = 71; S.ui.activeFloorId = 1;
  S.rooms = [
    mk(21, 'Nedkjøring', rect(0, 0, 570, 1600), 2, 72),
    mk(22, 'Lager', rect(1000, 0, 1400, 500), 1, 71),
    mk(23, 'Kontor', rect(3000, 0, 780, 400), 1, 71),
    mk(24, 'Bad', rect(4200, 0, 300, 250), 1, 71),
    mk(25, 'Stue', rect(5000, 0, 800, 400), 1, 71),
    mk(26, 'Gang', rect(6200, 0, 400, 300), 1, 71),
  ];
  // Nedkjøring: 4 × 0,5 m + 3 × 1 m, 5 cm mellomrom, 20 cm til kant. Lagt inn i STOKKET rekkefølge
  // (id og listeplass følger ikke x), så nummereringen må sortere selv.
  const xs = [[20, M05], [75, M05], [130, M05], [185, M05], [240, M10], [345, M10], [450, M10]];
  const rekke = [4, 0, 6, 2, 5, 1, 3];
  rekke.forEach((k, i) => S.mats.push({ id: 300 + i, roomId: 21, productId: xs[k][1].id, x_cm: xs[k][0], y_cm: 0, width_cm: xs[k][1].mat_width_mm / 10, length_cm: 1600,
    num_runs: 1, last_run_length_cm: null, gap_cm: 5, rotation_deg: 0, matCoordV: 2, startCorner: 'bl' }));
  for (let k = 0; k < 22; k++) S.strips.push(st(2200 + k, 22, F60.id, 'v', 1020 + k * 62, 20, 460 - (k % 3) * 20));
  for (let k = 0; k < 24; k++) S.strips.push(st(2300 + k, 23, F30.id, 'v', 3018 + k * 31, 20, 360));
  S.cables.push(cab(2400, 24, K2, 7.5, 4200, 0, 300, 250));
  for (let k = 0; k < 6; k++) S.strips.push(st(2500 + k, 25, F60.id, 'h', 15 + k * 62, 5020, 760 - k * 30));
  S.cables.push(cab(2600, 26, K1, 10, 6200, 0, 200, 300, { multiCableGroup: 1, multiCableIndex: 0 }));
  S.cables.push(cab(2601, 26, K2, 10, 6400, 0, 200, 300, { multiCableGroup: 1, multiCableIndex: 1 }));
  _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache(); _invalidateMatCache && _invalidateMatCache();
`;
export const OPTS = `({ cover: false, summary: false, floorplan: false, rooms: S.rooms.map(r => r.id), stairs: [], roomTable: false, stairTable: false, materialList: true, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' })`;
// Bygger PDF-en uten nedlasting; returnerer base64 + sideantall. Dato/ID/revisjon låses så to
// bygg kan sammenlignes byte for byte.
export const BYGG = (optsUttrykk) => `(async () => {
  const Ekte = window.__ekteJsPDF || (window.__ekteJsPDF = window.jspdf.jsPDF); let ut = null;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); d.setCreationDate(new Date(2026, 10, 6, 12, 0, 0)); d.setFileId('0123456789ABCDEF0123456789ABCDEF');
    d.save = function (n) { ut = { navn: n, sider: d.internal.getNumberOfPages(), b64: d.output('datauristring').split(',')[1] }; return d; }; return d; };
  const RealDate = Date; const fast = new RealDate(2026, 10, 6, 12, 0, 0).getTime();
  S.project.revision = 0; S.project.lastExportedAt = null;
  try { await exportPDF(${optsUttrykk}); } finally { window.jspdf.jsPDF = Ekte; }
  return ut;
})()`;
