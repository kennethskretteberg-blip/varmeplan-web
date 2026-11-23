// 242: skjermbilder — R over ukalibrert plantegning (varsel i baren), og WBW-statuslinja etter to vegger.
//   node -e ' import("./docs/242/probe/skjerm.mjs") '
import { openPage, sov } from '../../240/probe/cdpklient.mjs';
const p = await openPage('http://localhost:4000/', 9333, 2, 1400, 900);
const OPP = `(async () => { try { await _loadProducts(); } catch (e) {}
  window._showToast = () => {}; window._scheduleAutoSave = () => {}; window._performAutoSave = () => Promise.resolve();
  for (const id of ['auth-screen', 'project-list-screen']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  _resetProjectState(); addPart('indoor'); const pt = S.project.parts[0]; S.ui.activePartId = pt.id;
  S.ui.activeFloorId = (S.floors.find(f => f.partId === pt.id) || S.floors[0]).id;
  if (typeof _emptyStateDismissed !== 'undefined') { _emptyStateDismissed = true; _updateEmptyState(); }
  S.view.zoom = 1; S.view.panX = 500; S.view.panY = 400; renderSidebar(); updateCtxBar(); render(); return 1; })()`;
const BG = `(() => { const c = document.createElement('canvas'); c.width = 1000; c.height = 800; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 1000, 800); x.strokeStyle = '#222'; x.lineWidth = 6; x.strokeRect(200, 300, 400, 300); x.strokeRect(600, 300, 250, 300);
  const bg = _newBgObj(); bg.img = c; bg.widthCm = 1000; bg.heightCm = 800; bg.originX = 0; bg.originY = 0; bg._needsCalibration = KAL;
  S.bgs[S.ui.activeFloorId] = bg; S.ui.selectedBg = null; updateCtxBar(); render(); return 1; })()`;
const tast = k => p.eval(`(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', bubbles: true, cancelable: true })); return String(S.ui.drawMode); })()`);
await p.eval(OPP); await sov(300);
await p.eval(BG.replace('KAL', 'true')); await sov(200);
console.log('R ukalibrert → modus:', await tast('r')); await sov(300);
await p.shot('docs/242/r-over-ukalibrert-plantegning.png');
await p.eval(BG.replace('KAL', 'false')); await sov(200);
console.log('W kalibrert → modus:', await tast('w')); await sov(200);
const q = await p.eval(`(() => { const q = w2s(200, 300), r = canvas.getBoundingClientRect(), k = r.width / _cvW(); return { x: r.left + q.x * k, y: r.top + q.y * k }; })()`);
await p.click(q.x, q.y); await sov(200);
for (const [len, key] of [[400, 'ArrowRight'], [300, 'ArrowDown']]) {
  await p.eval(`(() => { document.getElementById('wbw-len').value = '${len}'; return 1; })()`); await tast(key); }
await sov(300);
await p.shot('docs/242/wbw-statuslinje-etter-to-vegger.png');
console.log(await p.eval(`JSON.stringify({ vegger: S.drawing.wbw.walls.length, hint: document.getElementById('sb-hint').textContent, status: document.getElementById('wbw-status').textContent })`));
await p.close(); process.exit(0);
