// 218: skjermbilder + sjekk av flytt/slett/målsett. Bruk:  node docs/218-hindring/probe/kjor.mjs
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const dir = 'docs/218-hindring';
const p = await openPage('http://localhost:4000/');
const FIX = `
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {}; window.alert = m => (window._alerts = window._alerts || []).push(String(m)); window.confirm = () => true;
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const F60 = { id: 996101, category_id: 1, active: true, name: 'FlexFoil 60W B=60cm', width_mm: 590, netto_width_mm: 590, watt_per_lm: 36, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25, el_no: '1001060', article_no: 'FF-60' };
  const K1 = { id: 996201, category_id: 2, active: true, product_family: 'TestKabel 10T', name: 'TestKabel 10T 600W 60m', voltage: 230, cable_length_m: 60, watt_per_m: 10, total_effect_w: 600, el_no: '1002601', article_no: 'TK10-600' };
  HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(F60, K1);
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 1, name: 'Folie', module_type: 'foil' }, { id: 2, name: 'Kabel', module_type: 'cable' });
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, navn, pts) => ({ id, floorId: 1, partId: 71, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [], wallThicknessCm: 0, annotOffsets: {} });
  S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.zones = []; S.hindrings = []; S.stairs = []; S.foilFree = []; S.strips = []; S.floatingDims = [];
  S.project = { name: 'Hindring 218', customer: 'Test', projectNo: 218, revision: 0, lastExportedAt: null, createdAt: Date.now(), parts: [{ id: 71, name: 'Innendørs', moduleType: 'indoor' }] };
  S.floors = [{ id: 1, name: '1. etasje', order: 1, partId: 71 }];
  S.ui.activePartId = 71; S.ui.activeFloorId = 1; S.ui.theme = 'light'; document.body.classList.remove('dark'); document.body.classList.add('light');
  S.rooms = [ mk(31, 'Stue kabel', rect(0, 0, 400, 300)), mk(32, 'Stue folie', rect(600, 0, 400, 300)), mk(33, 'Kontor kabel', rect(1200, 0, 400, 300)), mk(34, 'Bad', rect(1800, 0, 400, 300)) ];
  S.counters.nextHindringId = 910; S.counters.nextDimId = 5000; S.counters.nextCableId = 7000;
  S.snap.a90 = true; S.snap.a45 = false; S.snap.grid = false; S.shiftHeld = false;
  window._vis = (rid) => { const r = S.rooms.find(x => x.id === rid); const xs = r.points.map(p => p.x), ys = r.points.map(p => p.y);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    S.ui.selectedRoomId = r.id; S.ui.selectedDimId = null; S.ui.selectedHindringId = null; S.ui.selectedCableId = null; S.ui.selectedStripId = null; S.ui.selectedStripIds = new Set();
    const sc = 2; S.view.zoom = sc / BASE_SCALE; S.view.panX = (Math.max(...xs) + Math.min(...xs)) / 2 + (canvas.width / 2 - Math.round(canvas.width / 2)) / sc; S.view.panY = (Math.max(...ys) + Math.min(...ys)) / 2 - 40 + (canvas.height / 2 - Math.round(canvas.height / 2)) / sc;
    renderSidebar(); updateCtxBar(); render(); const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height, zoom: S.view.zoom }; };
  window._scr = (x, y) => { const sp = w2s(x, y), r = canvas.getBoundingClientRect(); return { x: r.left + sp.x * (r.width / canvas.width), y: r.top + sp.y * (r.height / canvas.height) }; };
  window._klikk = (x, y) => { const s = _scr(x, y); canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: s.x, clientY: s.y, button: 0, bubbles: true })); canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: s.x, clientY: s.y, button: 0, bubbles: true })); };
  window._flytt = (x, y) => { const s = _scr(x, y); canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: s.x, clientY: s.y, bubbles: true })); };
  window._startW2W = (rid, type, navn) => { S.ui.hindringRoomId = rid; S.ui.hindringType = type; S.ui.hindringCustomName = navn || ''; S.ui.drawMode = 'hindring-w2w'; S.drawing.active = true; S.drawing.points = []; S.drawing.rectStart = null;
    S.drawing.hindringW2W = { startWallIdx: null, startPt: null, endWallIdx: null, endPt: null, phase: 0, pendingSplit: null, hoverSide: null }; canvas.style.cursor = 'crosshair'; updMode(); };
`;
const ut = {};
ut.oppsett = await p.eval(`(() => { ${FIX} return { rom: S.rooms.length }; })()`);
// 1) Pipe 60 × 40 midt på øvre vegg i Stue kabel — fire klikk, klikk 1 til venstre
ut.pipe = await p.eval(`(() => { _vis(31); _startW2W(31, 'pipe', ''); for (const [x, y] of [[170, -3], [172, 40], [230, 41], [231, -3]]) _klikk(x, y);
  const h = S.hindrings[S.hindrings.length - 1]; return { antall: S.hindrings.length, modus: S.ui.drawMode, pkt: h && h.points.map(q => [+q.x.toFixed(2), +q.y.toFixed(2)]), m2: h && +(compArea(h.points) / 10000).toFixed(4), label: h && h.label, alerts: window._alerts || [] }; })()`);
// 2) Samme pipe motsatt vei i Stue folie (klikk 1 til høyre)
ut.pipeMotsatt = await p.eval(`(() => { _vis(32); _startW2W(32, 'pipe', ''); for (const [x, y] of [[830, -3], [829, 40], [770, 39], [769, -3]]) _klikk(x, y);
  const h = S.hindrings[S.hindrings.length - 1]; return { antall: S.hindrings.length, modus: S.ui.drawMode, pkt: h && h.points.map(q => [+q.x.toFixed(2), +q.y.toFixed(2)]), m2: h && +(compArea(h.points) / 10000).toFixed(4) }; })()`);
// 3) Knekk i Kontor kabel — seks klikk fra samme vegg
ut.knekk = await p.eval(`(() => { _vis(33); _startW2W(33, 'skap', 'Skap med knekk'); for (const [x, y] of [[1300, -3], [1300, 60], [1360, 60], [1360, 30], [1420, 30], [1420, -3]]) _klikk(x, y);
  const h = S.hindrings[S.hindrings.length - 1]; return { antall: S.hindrings.length, modus: S.ui.drawMode, pkt: h && h.points.map(q => [+q.x.toFixed(2), +q.y.toFixed(2)]), m2: h && +(compArea(h.points) / 10000).toFixed(4) }; })()`);
// Utlegg rundt hindringene: kabel i 31 og 33, folie i 32. Deretter 217-mål.
ut.utlegg = await p.eval(`(() => { _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
  for (const rid of [31, 33]) { const c = autoFillCable(rid, 996201); if (c && !S.cables.includes(c)) S.cables.push(c); }
  autoAddStrips(32, 996101); _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
  for (const r of S.rooms.slice(0, 3)) { S.ui.selectedRoomId = r.id; autoDimHindrings(); }
  const inne = (h, pts) => pts.some(q => ptInPoly(q.x, q.y, h.points));
  // Kabelbanen ligger i pathEls (hver med pts); prøv punkter hver 2 cm langs banen mot hindringen
  const kab = S.cables.map(c => { const h = S.hindrings.find(x => x.roomId === c.roomId); let treff = 0, n = 0, lengde = 0; for (const el of (c.pathEls || [])) { const P = el.pts || []; for (let i = 1; i < P.length; i++) { const L = Math.hypot(P[i].x - P[i-1].x, P[i].y - P[i-1].y); lengde += L; for (let t = 0; t <= L; t += 2) { n++; const q = { x: P[i-1].x + (P[i].x - P[i-1].x) * t / L, y: P[i-1].y + (P[i].y - P[i-1].y) * t / L }; if (ptInPoly(q.x, q.y, h.points)) treff++; } } } return { rom: c.roomId, els: (c.pathEls || []).length, banepunkter: n, baneM: +(lengde / 100).toFixed(1), punkterInneIHindring: treff }; });
  const h32 = S.hindrings.find(x => x.roomId === 32); const str = S.strips.filter(s => s.roomId === 32);
  let striperInne = 0; for (const s of str) { const prod = HEATING_PRODUCTS[0]; const w = prod.width_mm / 10; for (let t = s.start_cm + 1; t < s.start_cm + s.length_cm; t += 2) for (let u = 1; u < w; u += 5) { const q = s.direction === 'v' ? { x: s.pos_cm + u, y: t } : { x: t, y: s.pos_cm + u }; if (ptInPoly(q.x, q.y, h32.points)) { striperInne++; break; } } }
  return { kabler: kab, striper32: str.length, striperInneIHindring: striperInne, dims: S.rooms.map(r => r.id + ':' + r.dims.length) }; })()`);
const navn = { 31: 'pipe-kabel', 32: 'pipe-motsatt-folie', 33: 'knekk-kabel' };
for (const rid of [31, 32, 33]) { const b = await p.eval(`_vis(${rid})`); await sov(150); await p.shot(`${dir}/etter-${navn[rid]}.png`, { x: b.x, y: b.y, width: b.width, height: b.height }); }
// 4) Underveis: tre klikk i Bad, pekeren tilbake ved veggen → forhåndsvisning av lukkingen langs veggen
{ const b = await p.eval(`(() => { const b = _vis(34); _startW2W(34, 'pipe', ''); for (const [x, y] of [[1970, -3], [1970, 40], [2030, 40]]) _klikk(x, y); _flytt(2031, -4); render(); return b; })()`); await sov(150);
  await p.shot(`${dir}/etter-underveis-forhandsvisning.png`, { x: b.x, y: b.y, width: b.width, height: b.height });
  ut.underveis = await p.eval(`(() => { const r = { fase: S.drawing.hindringW2W.phase, pkt: S.drawing.points.length, hint: document.getElementById('sb-hint')?.textContent }; _klikk(2031, -4); r.etterKlikk4 = { antall: S.hindrings.length, modus: S.ui.drawMode }; return r; })()`); }
// 5) Velg, flytt med gizmo, slett — som andre hindringer
ut.flyttSlett = await p.eval(`(() => { _vis(31); const h = S.hindrings.find(x => x.roomId === 31); const id = hitHindring(200, 20);
  S.ui.selectedHindringId = h.id; S.ui.transformMode = 'move'; render();
  const gp = getHindringGizmoPos(h); const r = canvas.getBoundingClientRect(); const cx = r.left + gp.x, cy = r.top + gp.y; const sc = S.view.zoom * BASE_SCALE;
  const before = h.points.map(q => [+q.x.toFixed(1), +q.y.toFixed(1)]);
  canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: cx, clientY: cy, button: 0, bubbles: true }));
  canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: cx + 50 * sc, clientY: cy + 100 * sc, bubbles: true }));
  canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: cx + 50 * sc, clientY: cy + 100 * sc, button: 0, bubbles: true })); window.dispatchEvent(new MouseEvent('mouseup', { clientX: cx + 50 * sc, clientY: cy + 100 * sc, button: 0, bubbles: true }));
  const after = h.points.map(q => [+q.x.toFixed(1), +q.y.toFixed(1)]);
  const n0 = S.hindrings.length; deleteHindring(h.id); return { treffId: id === h.id, foer: before, etter: after, slettet: S.hindrings.length === n0 - 1 && !S.hindrings.includes(h) }; })()`);
fs.writeFileSync(`${dir}/probe/etter.json`, JSON.stringify(ut, null, 1));
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
