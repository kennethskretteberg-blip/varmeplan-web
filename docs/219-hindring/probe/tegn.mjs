// 219: tegner de tre måtene i ett rom (Pipe vegg til vegg med navn, femkant uten navn, 60×40 via Mål uten navn)
// + viser feil-markering i menyen, + et «gammelt» rom med navngitte hindringer. Skjermbilder i docs/219-hindring/.
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const p = await openPage(null);
await p.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 650, deviceScaleFactor: 1, mobile: false });
await p.goto('http://localhost:4000/');
const FIX = `
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {}; window.alert = m => (window._alerts = window._alerts || []).push(String(m));
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, navn, pts) => ({ id, floorId: 1, partId: 71, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [], wallThicknessCm: 0, annotOffsets: {} });
  S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.zones = []; S.hindrings = []; S.stairs = []; S.foilFree = []; S.strips = []; S.floatingDims = [];
  S.project = { name: 'Hindring 219', customer: 'Test', projectNo: 219, revision: 0, createdAt: Date.now(), parts: [{ id: 71, name: 'Innendørs', moduleType: 'indoor' }] };
  S.floors = [{ id: 1, name: '1. etasje', order: 1, partId: 71 }]; S.ui.activePartId = 71; S.ui.activeFloorId = 1; S.ui.theme = 'light'; document.body.classList.remove('dark'); document.body.classList.add('light');
  S.rooms = [ mk(31, 'Stue', rect(0, 0, 400, 300)), mk(32, 'Gammelt prosjekt', rect(600, 0, 400, 300)) ];
  S.counters.nextHindringId = 910; S.snap.a90 = true; S.snap.a45 = false; S.snap.grid = false; S.shiftHeld = false;
  // «Gammelt prosjekt»: hindringer lagret før 219 med typenavn som label
  S.hindrings.push({ id: 801, type: 'kjokkenoy', label: 'Kjøkkenøy', roomId: 32, floorId: 1, points: rect(700, 100, 120, 80), clearance: 'wall' });
  S.hindrings.push({ id: 802, type: 'pipe', label: 'Pipe', roomId: 32, floorId: 1, points: rect(900, 0, 50, 50), clearance: 'wall' });
  S.hindrings.push({ id: 803, type: 'skap', label: 'Innebygd skap', roomId: 32, floorId: 1, points: rect(600, 240, 200, 60), clearance: 'wall' });
  window._vis = (rid) => { const r = S.rooms.find(x => x.id === rid); const xs = r.points.map(p => p.x), ys = r.points.map(p => p.y);
    S.ui.selectedRoomId = r.id; S.ui.selectedHindringId = null;
    const sc = 1; S.view.zoom = sc / BASE_SCALE; S.view.panX = (Math.max(...xs) + Math.min(...xs)) / 2 + (canvas.width / 2 - Math.round(canvas.width / 2)) / sc; S.view.panY = (Math.max(...ys) + Math.min(...ys)) / 2 - 20 + (canvas.height / 2 - Math.round(canvas.height / 2)) / sc;
    renderSidebar(); updateCtxBar(); render(); const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; };
  window._scr = (x, y) => { const sp = w2s(x, y), r = canvas.getBoundingClientRect(); return { x: r.left + sp.x * (r.width / canvas.width), y: r.top + sp.y * (r.height / canvas.height) }; };
  window._klikk = (x, y) => { const s = _scr(x, y); canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: s.x, clientY: s.y, button: 0, bubbles: true })); canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: s.x, clientY: s.y, button: 0, bubbles: true })); };
  window._dbl = (x, y) => { const s = _scr(x, y); canvas.dispatchEvent(new MouseEvent('dblclick', { clientX: s.x, clientY: s.y, button: 0, bubbles: true })); };
  window._el = id => document.getElementById(id);
`;
const ut = {};
ut.oppsett = await p.eval(`(() => { ${FIX} return { rom: S.rooms.length, gamle: S.hindrings.length }; })()`);
// 1) Vegg til vegg via menyen, navn «Pipe», fire klikk fra samme vegg (218)
ut.w2w = await p.eval(`(() => { _vis(31); showHindringModal(31, null); _el('hindring-name-inp').value = 'Pipe'; _el('hindring-w2w-btn').click();
  const modus = S.ui.drawMode; for (const [x, y] of [[170, -3], [172, 40], [230, 41], [231, -3]]) _klikk(x, y);
  const h = S.hindrings[S.hindrings.length - 1]; return { modusEtterKnapp: modus, antall: S.hindrings.length, label: h && h.label, pkt: h && h.points.length, m2: h && +(compArea(h.points) / 10000).toFixed(2), modusNaa: S.ui.drawMode, alerts: window._alerts || [] }; })()`);
// 2) Polygon via menyen, tomt navn — femkant
ut.polygon = await p.eval(`(() => { showHindringModal(31, null); _el('hindring-polygon-btn').click(); const modus = S.ui.drawMode;
  const P = [[40, 180], [120, 180], [140, 230], [80, 280], [20, 230]]; for (const [x, y] of P) _klikk(x, y); _klikk(40, 180);
  if (S.ui.drawMode === 'hindring-polygon') { try { _dbl(40, 180); } catch (e) {} }
  if (S.ui.drawMode === 'hindring-polygon' && S.drawing.points.length >= 3) createHindringFromPolygon(S.drawing.points);
  const h = S.hindrings[S.hindrings.length - 1]; return { modusEtterKnapp: modus, antall: S.hindrings.length, label: h && JSON.stringify(h.label), pkt: h && h.points.length, modusNaa: S.ui.drawMode }; })()`);
// 3) Mål 60 × 40 via Enter, tomt navn
ut.maal = await p.eval(`(() => { showHindringModal(31, null); _el('hindring-bredde-inp').value = '60'; _el('hindring-lengde-inp').value = '40';
  _el('hindring-lengde-inp').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  const h = S.hindrings[S.hindrings.length - 1]; return { antall: S.hindrings.length, label: h && JSON.stringify(h.label), pkt: h && h.points.map(q => [q.x, q.y]), lukket: _el('modal-ov').style.display === 'none' }; })()`);
// Skjermbilde av rommet med de tre
{ const b = await p.eval(`(() => { const b = _vis(31); S.ui.selectedRoomId = 31; render(); return b; })()`); await sov(200); await p.shot('docs/219-hindring/etter-tegning-tre-maater.png', { x: b.x, y: b.y, width: b.width, height: b.height }); }
// 4) Feilmarkering: 0 og bokstaver
ut.feil = await p.eval(`(() => { showHindringModal(31, null); _el('hindring-bredde-inp').value = '0'; _el('hindring-lengde-inp').value = ''; const n = S.hindrings.length; _el('hindring-dims-btn').click();
  return { antall: S.hindrings.length - n, B: _el('hindring-bredde-inp').className, H: _el('hindring-lengde-inp').className, fokus: document.activeElement && document.activeElement.id, aapen: _el('modal-ov').style.display !== 'none' }; })()`);
await sov(200); await p.shot('docs/219-hindring/etter-meny-feil-1366x650.png');
await p.eval(`closeModal()`);
// 5) Gammelt prosjekt: navnene vises som før
{ const b = await p.eval(`(() => { const b = _vis(32); return b; })()`); await sov(200); await p.shot('docs/219-hindring/etter-gammelt-prosjekt.png', { x: b.x, y: b.y, width: b.width, height: b.height }); }
ut.gammelt = await p.eval(`(() => { const t = []; const o = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { t.push(String(s)); return o.call(this, s, ...a); }; _vis(32); CanvasRenderingContext2D.prototype.fillText = o;
  return { tegnet: t.filter(s => /Kjøkkenøy|Pipe|Innebygd skap|annet|undefined/.test(s)) }; })()`);
// 6) Panel-tittel for valgt hindring uten navn
ut.panel = await p.eval(`(() => { _vis(31); const h = S.hindrings.find(x => x.roomId === 31 && x.label === ''); S.ui.selectedHindringId = h.id; updateObjInfo(); const p = document.querySelector('.soi-title'); return { tittel: p && p.textContent.trim() }; })()`);
fs.writeFileSync('docs/219-hindring/probe/tegn.json', JSON.stringify(ut, null, 1));
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
