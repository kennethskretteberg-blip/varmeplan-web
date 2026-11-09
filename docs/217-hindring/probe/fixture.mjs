// 217: testprosjekt som JS-kildetekst (limes inn i sidens eval). Fire rom på én etasje:
//   31 Stue kabel   400 × 300  kabel (autoFillCable)       hindring 60 × 40
//   32 Stue folie   400 × 300  folie 60 cm (autoAddStrips) hindring 60 × 40
//   33 Bad liten    300 × 250  kabel                        hindring 15 × 15
//   34 Kontor       400 × 300  folie                        L-hindring + rotert femkant
export const FIX = `
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const F60 = { id: 996101, category_id: 1, active: true, name: 'FlexFoil 60W B=60cm', width_mm: 590, netto_width_mm: 590, watt_per_lm: 36, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25, el_no: '1001060', article_no: 'FF-60' };
  const K1 = { id: 996201, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 600W 60m', voltage: 230, cable_length_m: 60, watt_per_m: 10, total_effect_w: 600, el_no: '1002601', article_no: 'TK10-600' };
  const K2 = { id: 996202, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 400W 40m', voltage: 230, cable_length_m: 40, watt_per_m: 10, total_effect_w: 400, el_no: '1002401', article_no: 'TK10-400' };
  HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(F60, K1, K2);
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 1, name: 'Folie', module_type: 'foil' }, { id: 2, name: 'Kabel', module_type: 'cable' });
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, navn, pts) => ({ id, floorId: 1, partId: 71, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [], wallThicknessCm: 0, annotOffsets: {} });
  S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.zones = []; S.hindrings = []; S.stairs = []; S.foilFree = []; S.strips = []; S.floatingDims = [];
  S.project = { name: 'Hindring 217', customer: 'Test', projectNo: 217, revision: 0, lastExportedAt: null, createdAt: Date.now(), parts: [{ id: 71, name: 'Innendørs', moduleType: 'indoor' }] };
  S.floors = [{ id: 1, name: '1. etasje', order: 1, partId: 71 }];
  S.ui.activePartId = 71; S.ui.activeFloorId = 1; S.ui.theme = 'light'; document.body.classList.remove('dark'); document.body.classList.add('light');
  S.rooms = [ mk(31, 'Stue kabel', rect(0, 0, 400, 300)), mk(32, 'Stue folie', rect(600, 0, 400, 300)), mk(33, 'Bad liten', rect(1200, 0, 300, 250)), mk(34, 'Kontor', rect(1700, 0, 400, 300)) ];
  const hind = (id, roomId, pts, label) => S.hindrings.push({ id, type: 'annet', label: label || 'Hindring', roomId, floorId: 1, points: pts, clearance: 'wall' });
  hind(901, 31, rect(90, 60, 60, 40), 'Pipe');
  hind(902, 32, rect(690, 60, 60, 40), 'Pipe');
  hind(903, 33, rect(1260, 60, 15, 15), 'Søyle');
  hind(904, 34, [{x:1750,y:50},{x:1850,y:50},{x:1850,y:100},{x:1800,y:100},{x:1800,y:150},{x:1750,y:150}], 'Skap');
  const pent = []; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + 0.3 + k * 2 * Math.PI / 5; pent.push({ x: Math.round(1960 + 45 * Math.cos(a)), y: Math.round(205 + 45 * Math.sin(a)) }); }
  hind(905, 34, pent, 'Øy');
  S.counters.nextHindringId = 910; S.counters.nextDimId = 5000; S.counters.nextCableId = 7000;
  _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
  for (const [rid, prod] of [[31, K1], [33, K2]]) { const c = autoFillCable(rid, prod.id); if (c && !S.cables.includes(c)) S.cables.push(c); }
  autoAddStrips(32, F60.id); autoAddStrips(34, F60.id);
  _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
  for (const r of S.rooms) { S.ui.selectedRoomId = r.id; autoDimHindrings(); }
  S.ui.selectedRoomId = null; S.ui.selectedDimId = null;
`;
// Zoom så rommet fyller lerretet med litt luft; returnerer lerretets plass i vinduet (for utsnitt).
export const VIS = (rid) => `(() => { const r = S.rooms.find(x => x.id === ${rid}); const xs = r.points.map(p => p.x), ys = r.points.map(p => p.y);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  S.ui.selectedRoomId = r.id; S.ui.selectedDimId = null; S.ui.selectedHindringId = null; S.ui.selectedCableId = null; S.ui.selectedStripId = null; S.ui.selectedStripIds = new Set();
  S.view.zoom = Math.min(canvas.width / (w + 120), canvas.height / (h + 120)) / BASE_SCALE; S.view.panX = (Math.max(...xs) + Math.min(...xs)) / 2; S.view.panY = (Math.max(...ys) + Math.min(...ys)) / 2;
  renderSidebar(); updateCtxBar(); render(); const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height, zoom: S.view.zoom }; })()`;
