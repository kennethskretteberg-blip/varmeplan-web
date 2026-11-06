// 195: testprosjekter som JS-kildetekst (limes inn i sidens eval). STORT = 40 rom på to etasjer,
// kabel i alle, folie i hvert fjerde. LITE = to rom. Samme produkt-fixtures som docs/181/probe.
const FELLES = `
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
  window.showAccessoriesModal = () => Promise.resolve({ items: [] });
  window._pdfBranding = () => Promise.resolve(null);
  const F60 = { id: 996101, category_id: 1, active: true, name: 'FlexFoil B=60cm', width_mm: 590, netto_width_mm: 590, watt_per_lm: 36, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25, el_no: '1001060', article_no: 'FF-60' };
  const K1 = { id: 996201, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 600W 60m', voltage: 230, cable_length_m: 60, watt_per_m: 10, total_effect_w: 600, el_no: '1002601', article_no: 'TK10-600' };
  const K2 = { id: 996202, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 400W 40m', voltage: 230, cable_length_m: 40, watt_per_m: 10, total_effect_w: 400, el_no: '1002401', article_no: 'TK10-400' };
  const K3 = { id: 996203, category_id: 2, active: true, product_family: 'TestKabel 17T', name: 'TestKabel 17T 1020W 60m', voltage: 230, cable_length_m: 60, watt_per_m: 17, total_effect_w: 1020, el_no: '1002102', article_no: 'TK17-1020' };
  HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(F60, K1, K2, K3);
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 1, name: 'Folie', module_type: 'foil' }, { id: 2, name: 'Kabel', module_type: 'cable' });
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, navn, pts, floorId) => ({ id, floorId, partId: null, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
  const st = (id, roomId, productId, dir, pos, start, len) => ({ id, roomId, productId, direction: dir, pos_cm: pos, start_cm: start, length_cm: len });
  const cab = (id, roomId, prod, cc, x0, y0, w, h) => {
    const runs = []; for (let x = x0 + cc / 2; x < x0 + w; x += cc) runs.push({ pos_cm: x, segments: [{ start_cm: y0 + cc / 2, end_cm: y0 + h - cc / 2 }] });
    return { id, roomId, productId: prod.id, direction: 'v', spacing_cm: cc, startCorner: 'bl', totalLength_cm: prod.cable_length_m * 100, runs, connections: [] };
  };
  S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.zones = []; S.hindrings = []; S.stairs = []; S.foilFree = []; S.strips = [];
  S.floors = [{ id: 1, name: '1. etasje', order: 1 }, { id: 2, name: '2. etasje', order: 2 }];
`;
export const STORT = FELLES + `
  S.project = { name: 'STORT 195', parts: [], revision: 0, lastExportedAt: null, createdAt: Date.now() };
  S.rooms = [];
  for (let i = 0; i < 40; i++) {
    const x0 = (i % 8) * 400, y0 = Math.floor(i / 8) * 400;
    S.rooms.push(mk(100 + i, 'Rom ' + (i + 1), rect(x0, y0, 300, 250), i < 20 ? 1 : 2));
    if (i % 4 === 3) { for (let k = 0; k < 4; k++) S.strips.push(st(7000 + i * 10 + k, 100 + i, F60.id, 'v', x0 + 40 + k * 62, y0 + 20, 210)); }
    else S.cables.push(cab(5000 + i, 100 + i, [K1, K2, K3][i % 3], 10, x0, y0, 300, 250));
  }
  _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
`;
export const LITE = FELLES + `
  S.project = { name: 'LITE 195', customer: 'Elektro 24 AS', projectNo: 264, parts: [], revision: 0, lastExportedAt: null, createdAt: Date.now() };
  S.rooms = [mk(11, 'Stue', rect(0, 0, 600, 400), 1), mk(12, 'Bad', rect(700, 0, 300, 250), 1)];
  S.strips = [st(1, 11, F60.id, 'v', 50, 20, 360), st(2, 11, F60.id, 'v', 115, 20, 360)];
  S.cables = [cab(901, 12, K2, 7.5, 700, 0, 300, 250)];
  _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
`;
