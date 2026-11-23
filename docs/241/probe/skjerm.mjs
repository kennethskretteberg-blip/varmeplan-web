// 241: skjermbilder av «TEGN ROM»-baren uten og med plantegning, og av WBW tegnet over plantegningen.
//   node -e ' import("./docs/241/probe/skjerm.mjs") '
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
// En enkel «plantegning»: hvit flate med et rom 400 × 300 cm tegnet i svart, 1000 × 800 cm i verden.
const BG = `(() => { const c = document.createElement('canvas'); c.width = 1000; c.height = 800; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 1000, 800); x.strokeStyle = '#222'; x.lineWidth = 6; x.strokeRect(200, 300, 400, 300); x.strokeRect(600, 300, 250, 300);
  x.fillStyle = '#444'; x.font = '28px sans-serif'; x.fillText('Stue', 360, 460); x.fillText('Bad', 700, 460);
  const bg = _newBgObj(); bg.img = c; bg.widthCm = 1000; bg.heightCm = 800; bg.originX = 0; bg.originY = 0; bg._needsCalibration = KAL;
  S.bgs[S.ui.activeFloorId] = bg; S.ui.selectedBg = null; updateCtxBar(); render(); return Object.keys(bg).join(','); })()`;
const barKlipp = `(() => { const b = document.getElementById('ctxbar').getBoundingClientRect(); return { x: 0, y: Math.max(0, b.top - 8), width: 1400, height: b.height + 16 }; })()`;
await p.eval(OPP); await sov(300);
await p.shot('docs/241/bar-uten-plantegning.png', await p.eval(barKlipp));
console.log('bg-felt:', await p.eval(BG.replace('KAL', 'true'))); await sov(300);
await p.shot('docs/241/bar-ukalibrert-plantegning.png', await p.eval(barKlipp));
await p.eval(BG.replace('KAL', 'false')); await sov(300);
await p.shot('docs/241/bar-med-plantegning.png', await p.eval(barKlipp));
await p.shot('docs/241/skjerm-med-plantegning.png');
// WBW over tegningen: ekte klikk på knappen, ekte klikk på hjørnet (200, 300), så tre vegger med tastene.
await p.clickSel(`#ctxbar button[onclick="abStartDraw('wbw')"]`); await sov(300);
await p.shot('docs/241/wbw-1-venter-paa-startpunkt.png');
const q = await p.eval(`(() => { const q = w2s(200, 300), r = canvas.getBoundingClientRect(), k = r.width / _cvW(); return { x: r.left + q.x * k, y: r.top + q.y * k }; })()`);
await p.click(q.x, q.y); await sov(200);
for (const [len, key] of [[400, 'ArrowRight'], [300, 'ArrowDown']]) {
  await p.eval(`(() => { document.getElementById('wbw-len').value = '${len}'; document.dispatchEvent(new KeyboardEvent('keydown', { key: '${key}', bubbles: true, cancelable: true })); return 1; })()`); }
await p.eval(`(() => { document.getElementById('wbw-len').value = '400'; render(); return 1; })()`); await sov(300);
await p.shot('docs/241/wbw-2-to-vegger-over-plantegning.png');
console.log(await p.eval(`JSON.stringify({ start: S.drawing.wbw.startPoint, vegger: S.drawing.wbw.walls.map(w => w.length), status: document.getElementById('wbw-status').textContent, hint: document.getElementById('sb-hint').textContent })`));
await p.close(); process.exit(0);
