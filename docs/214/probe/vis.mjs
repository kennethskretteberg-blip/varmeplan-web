// 214: bilder av de fire stegene + før/etter av statuslinja. Ekte klikk på knappene.
//   node docs/214/probe/vis.mjs            arbeidskopien
//   URL0=…/probe/head/index.html node docs/214/probe/vis.mjs foer   statuslinja på HEAD
import { openPage, sov } from './cdp.mjs';
const url = process.env.URL0 || 'http://localhost:4000/', foer = process.argv[2] === 'foer';
const p = await openPage(url);
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '214 · Steinliveien 1'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  const bg = _installTileBackground(fid, { east: 574200, north: 6670300 }, 'Steinliveien 1'); window.__bg = bg;
  const ox = bg.originX + bg.widthCm / 2 - 600, oy = bg.originY + bg.heightCm / 2 - 450;
  const P = [[0,0],[1200,0],[1200,500],[800,500],[800,900],[400,900],[400,500],[0,500]].map(([x, y]) => ({ x: ox + x, y: oy + y }));
  S.geo = { [fid]: { address: 'Steinliveien 1', chosen: null, candidates: [{ bygningsnr: '300100', type: 'Enebolig', distance_m: 3, footprintWorld: P, footprintSource: 'INSPIRE', footprintConfidence: 0.9 }] } };
  S.tak = { [fid]: _takFromModel({ origin: { epsg: 25833, east: 574200, north: 6670300, ground_z: 182 }, footprint: { polygon: [] }, heights: {}, roof: { roof_type: null, planes: [], edges: [], prov: { confidence: 0.5 } } }, bg, null) };
  S.tak[fid] = _takManual(P); const s = S.tak[fid].surfaces[0];
  s.footprint.prov = { source: 'FKB', confidence: 0.9, note: 'Kartverket (INSPIRE)' }; S.tak[fid].building = { bygningsnr: '300100' };
  s.heights.eave_m = { value: 4.1, height_ref: 'terreng', prov: { source: 'DOM_RASTER', confidence: 0.6, note: 'median' } };
  s.heights.ridge_m = { value: 7.2, height_ref: 'terreng', prov: { source: 'DOM_RASTER', confidence: 0.4 } };
  fitAll(); renderSidebar(); updateCtxBar(); render(); document.activeElement && document.activeElement.blur(); })()`);
await sov(1800);
const hent = () => p.eval(`({ hint: document.getElementById('sb-hint').textContent, bar: document.getElementById('ctxbar').innerText.replace(/\\s+/g,' '), msg: (document.querySelector('.tak-step-msg')||{}).textContent, rows: [...document.querySelectorAll('.tak-step-row')].map(e => e.textContent.replace(/\\s+/g,' ').trim()), z: S.view.zoom, msgTop: Math.round(document.querySelector('.tak-step-msg')?.getBoundingClientRect().top ?? -1), sbTop: Math.round(document.querySelector('.tak-wizard')?.closest('#sidebar, .sidebar, aside')?.getBoundingClientRect().top ?? -1) })`);
const statusRect = await p.eval(`(() => { const e = document.getElementById('sb-hint').parentElement; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top - 1, width: Math.min(1400, b.width), height: b.height + 2 }; })()`);
if (foer) { await p.shot('docs/214/statuslinje-foer.png', statusRect); await p.shot('docs/214/foer-hel-skjerm.png'); console.log(JSON.stringify(await hent())); await p.close(); process.exit(0); }
const ut = {};
await p.eval(`_takStepOpen[__fid] = 1; renderSidebar(); updateCtxBar(); render();`); await sov(400);
ut.steg1 = await hent(); await p.shot('docs/214/steg1-finn-bygget.png'); await p.shot('docs/214/statuslinje-etter.png', statusRect);
await p.clickSel('.tak-step-next button'); await sov(400);
ut.steg2 = await hent(); await p.shot('docs/214/steg2-kontroller.png');
// Kontrollmål med ekte klikk: M, så hjørne → hjørne → plassering.
await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'm', text: 'm', code: 'KeyM' }); await sov(150);
const q = await p.eval(`(() => { const W = _takSurface(__fid).footprint.world, r = canvas.getBoundingClientRect(), k = r.width / canvas.width, f = pt => { const s = w2s(pt.x, pt.y); return { x: r.left + s.x * k, y: r.top + s.y * k }; }; return { a: f(W[0]), b: f(W[1]) }; })()`);
for (const c of [{ x: q.a.x + 2, y: q.a.y + 2 }, { x: q.b.x - 2, y: q.b.y + 2 }, { x: (q.a.x + q.b.x) / 2, y: q.a.y + 60 }]) { if (process.env.DBG) console.log('over', JSON.stringify(c), await p.eval(`(() => { const e = document.elementFromPoint(${c.x},${c.y}); return e.id || e.className || e.tagName; })()`)); await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y }); await sov(60); await p.click(c.x, c.y); await sov(350); if (process.env.DBG) console.log(await p.eval(`JSON.stringify({ rs: S.drawing.rectStart, dp: !!S.drawing.dimPending, m: S.ui.drawMode, f: S.ui.activeFloorId, n: (_takCheckDims[__fid]||[]).length })`)); }
await sov(300);
ut.kontrollmaal = { ...(await hent()), dims: await p.eval(`(_takCheckDims[__fid]||[]).map(d => Math.round(Math.hypot(d.p2.x-d.p1.x,d.p2.y-d.p1.y)))`) };
await p.shot('docs/214/steg2-kontrollmaal.png');
await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await sov(150);
await p.eval(`document.activeElement && document.activeElement.blur(); _takSetRoofType(__fid, 'pitched');`); await sov(200);
await p.clickSel('.tak-step-tool button.snap-chip.on[onclick^="_takToDrawing"]'); await sov(500);
ut.steg3 = await hent(); await p.shot('docs/214/steg3-kanter.png');
await p.eval(`(() => { const f = __fid, t = S.tak[f]; t.edges.forEach((e, i) => _takSetEdgeType(f, e.id, i % 2 ? 'rake' : 'eave')); const k = t.edges.find(e => e.type === 'eave'); const g = _takAddGutter(f, k.id); _takAddDownspout(f, g.id, 6); _takFeatSel = null; })()`);
await sov(200); await p.clickSel('.tak-step-next button'); await sov(400);
ut.steg4 = await hent(); await p.shot('docs/214/steg4-kabel.png');
await p.clickSel('.tak-map-toggle input'); await sov(800);
ut.visKart = await hent(); await p.shot('docs/214/vis-kart-tilbake.png');
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
