// 211: bilder av de tre veiene. node docs/211/probe/vis.mjs  → docs/211/*.png
// Plantegningen tegnes med EKTE museklikk (CDP Input.dispatchMouseEvent) gjennom rom-modulens polygonverktøy.
import { openPage, sov } from './cdp.mjs';
const OUT = 'docs/211/';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const ev = s => p.eval(`(async () => { ${s} })()`);
const kort = async (fil) => {
  const c = await ev(`const e = document.querySelector('.tak-card'); if (!e) return null; e.scrollIntoView({ block: 'start' }); const b = e.getBoundingClientRect(); return { x: Math.max(0, b.left - 4), y: Math.max(0, b.top - 4), width: b.width + 8, height: Math.min(880, b.height + 8) };`);
  if (c) await p.shot(OUT + fil, c);
};
const hel = fil => p.shot(OUT + fil);
await ev(`window._showToast = () => {}; window._scheduleAutoSave = () => {}; window.confirm = () => true;
  for (const id of ['auth-screen', 'project-list-screen']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  S.ui.promptRoomNameOnCreate = false;
  window.__nytt = () => { _resetProjectState(); addPart('roof'); const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
    S.project.name = 'Nybygg 211'; S.ui.activePartId = part.id; S.ui.activeFloorId = fid; S.ui.drawMode = null; renderSidebar(); updateCtxBar(); render(); return fid; };
  window.__fid = __nytt(); return 1;`);
await sov(300);
await kort('valg-tre-veier.png'); await hel('valg-hel.png');

// ── Vei 2: plantegning ──
await ev(`const can = document.createElement('canvas'); can.width = 1200; can.height = 700; const c2 = can.getContext('2d');
  c2.fillStyle = '#fff'; c2.fillRect(0, 0, 1200, 700); c2.strokeStyle = '#111'; c2.lineWidth = 6; c2.strokeRect(100, 100, 1000, 400);
  c2.lineWidth = 3; c2.beginPath(); c2.moveTo(500, 100); c2.lineTo(500, 500); c2.moveTo(800, 100); c2.lineTo(800, 500); c2.stroke();
  c2.lineWidth = 2; c2.beginPath(); c2.moveTo(100, 70); c2.lineTo(1100, 70); c2.moveTo(1130, 100); c2.lineTo(1130, 500); c2.moveTo(100, 620); c2.lineTo(500, 620); c2.stroke();
  c2.fillStyle = '#111'; c2.font = '24px sans-serif'; c2.fillText('25 000', 560, 60); c2.fillText('10 000', 1140, 310); c2.fillText('0          10 m', 100, 650);
  c2.font = '28px sans-serif'; c2.fillText('NYBYGG · PLAN 1. ETASJE · 1:100', 380, 570);
  const url = can.toDataURL('image/png'); const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = url; });
  _installBgImage(img, url, 'nybygg-plan.png', null, _bgImportCtx(__fid)); renderSidebar(); return 1;`);
await sov(400);
await hel('plan-1-uten-maalestokk-hel.png');
await ev(`const ov = document.getElementById('bg-calib-overlay'); if (ov) ov.style.display = 'none'; renderSidebar(); return 1;`);
await kort('plan-1-uten-maalestokk.png');
// kalibrer med ekte klikk på målestokklinja
const px = async (u, v) => ev(`const bg = S.bgs[__fid]; const w = { x: bg.originX + ${u} / bg._srcW * bg.widthCm, y: bg.originY + ${v} / bg._srcH * bg.heightCm }; const q = w2s(w.x, w.y), r = canvas.getBoundingClientRect(); return { x: r.left + q.x, y: r.top + q.y };`);
await ev(`startBgCalibrate(); return 1;`);
for (const [u, v] of [[100, 620], [500, 620]]) { const q = await px(u, v); await p.click(q.x, q.y); await sov(150); }
await sov(200); await hel('plan-2-kalibrer-hel.png');
await ev(`document.getElementById('bg-calib-dist').value = '10'; document.getElementById('bg-calib-dec').value = '0'; setCalibUnit('m'); confirmBgCalibrate(); renderSidebar(); render(); return 1;`);
await sov(300); await kort('plan-3-maalestokk-satt.png');
await p.clickSel(`.tak-way[data-way="2"] button`);
await sov(200);
const hj = [];
for (const [u, v] of [[100, 100], [1100, 100], [1100, 500], [100, 500]]) hj.push(await px(u, v));
for (const q of hj.slice(0, 3)) { await p.click(q.x, q.y); await sov(120); }
await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hj[3].x, y: hj[3].y });
await sov(200); await hel('plan-4-tegner-hel.png');
await p.click(hj[3].x, hj[3].y); await sov(120); await p.click(hj[0].x, hj[0].y); await sov(300);
const lenP = await ev(`const W = _takSurface(__fid).footprint.world; return W.map((p, i) => { const q = W[(i + 1) % W.length]; return (Math.hypot(q.x - p.x, q.y - p.y) / 100).toFixed(3); });`);
console.log('plan, ekte klikk:', lenP.join(' / '), 'm');
await kort('plan-5-tegnet-kort.png');
await ev(`_takSetRoofType(__fid, 'pitched'); _takSetHeight(__fid, 'eave_m', '6,2'); _takSetHeight(__fid, 'ridge_m', '9,1'); render(); renderSidebar(); return 1;`);
await sov(300); await hel('plan-6-ferdig-hel.png'); await kort('plan-6-ferdig-kort.png');

// ── Vei 3: frihånd ──
await ev(`__fid = __nytt(); return 1;`);
await p.clickSel(`.tak-way[data-way="3"] button`);
await sov(200);
await ev(`const el = document.getElementById('wbw-len'); for (const [l, d] of [[1200, 'right'], [400, 'up'], [600, 'right'], [900, 'down']]) { el.value = String(l); wbwDirPlace(d); } el.value = '1800'; render(); renderSidebar(); return 1;`);
await sov(250); await hel('fri-1-tegner-hel.png');
await ev(`const el = document.getElementById('wbw-len'); el.value = '1800'; wbwDirPlace('left'); finishWbwRoom(); fitAll(); render(); renderSidebar(); return 1;`);
await sov(300); await kort('fri-2-tegnet-kort.png');
const lenF = await ev(`const W = _takSurface(__fid).footprint.world; return W.map((p, i) => { const q = W[(i + 1) % W.length]; return (Math.hypot(q.x - p.x, q.y - p.y) / 100).toFixed(2); });`);
console.log('frihånd:', lenF.join(' / '), 'm');
await ev(`_takSetRoofType(__fid, 'flat'); _takSetHeight(__fid, 'eave_m', '7'); render(); renderSidebar(); return 1;`);
await sov(250); await hel('fri-3-ferdig-hel.png'); await kort('fri-3-ferdig-kort.png');

// ── Vei 1: adressen (stubbet tjenestesvar, samme som 204-testen) ──
await ev(`__fid = __nytt();
  const E = 574200, N = 6670300; const bg = _installTileBackground(__fid, { east: E, north: N }, 'Testveien 4'); S.bgs = { [__fid]: bg };
  const ring = [[574210, 6670320], [574235, 6670320], [574235, 6670330], [574210, 6670330], [574210, 6670320]];
  const fpW = ring.map(([e, n]) => _geoToWorld(bg, e, n));
  S.geo = { [__fid]: { address: 'Testveien 4', center: { east: E, north: N }, chosen: null, candidates: [{ bygningsnr: '300100', type: 'Enebolig', distance_m: 3, footprintWorld: fpW, footprintSource: 'INSPIRE', footprintConfidence: 0.9 }] } };
  fitAll(); renderSidebar(); render(); return 1;`);
await sov(500); await kort('adresse-1-velg.png');
await ev(`const bg = S.bgs[__fid]; const cx = 574222.5, cy = 6670325;
  const ring = [[574210, 6670320], [574235, 6670320], [574235, 6670330], [574210, 6670330], [574210, 6670320]];
  const model = { origin: { epsg: 25833, east: cx, north: cy, ground_z: 182.4, prov: { source: 'DOM_RASTER', confidence: 0.8 } }, footprint: { polygon: ring.map(([e, n]) => [e - cx, n - cy]) },
    heights: { eave_m: { value: 6.1, prov: { source: 'DOM_RASTER', confidence: 0.6 } }, ridge_m: { value: 9.3, prov: { source: 'DOM_RASTER', confidence: 0.4 } } },
    roof: { roof_type: 'pitched', planes: [], edges: [], prov: { confidence: 0.5 } }, quality: { warnings: [] }, attribution: '© Kartverket (CC BY 4.0)' };
  S.geo[__fid].chosen = S.geo[__fid].candidates[0];
  S.tak = { [__fid]: _takFromModel(model, bg, S.geo[__fid].candidates[0]) }; renderSidebar(); render(); return 1;`);
await sov(400); await kort('adresse-2-statuskort.png');
await p.close(); process.exit(0);
