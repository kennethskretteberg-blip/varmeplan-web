// 218: kjører _hindW2WRegressionTest218 i arbeidskopien, og måler «før» på HEAD-kopien (hva skjer ved klikk 4 på samme vegg).
import { openPage } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t = _hindW2WRegressionTest218(); return t.map(x => (x.ok ? 'OK   ' : 'FEIL ') + x.name + (x.ok ? '' : ' — forventet ' + JSON.stringify(x.expected) + ', fikk ' + JSON.stringify(x.got))); })()`);
console.log(r.join('\n'));
await p.close();
const h = await openPage('http://localhost:4000/docs/218-hindring/probe/head-index.html');
const foer = await p.eval ? await h.eval(`(() => {
  const alerts = []; window.alert = m => alerts.push(String(m)); window._performAutoSave = () => Promise.resolve(); window._showToast = () => {};
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const pts = rect(0, 0, 400, 300);
  S.rooms = [{ id: 9218, floorId: S.ui.activeFloorId, partId: S.ui.activePartId, name: '218', points: pts, walls: compWalls(pts), area: 120000, dims: [], annotOffsets: {} }]; S.hindrings = [];
  S.view.zoom = Math.min(canvas.width / 520, canvas.height / 420) / BASE_SCALE; S.view.panX = 200; S.view.panY = 150;
  const click = (x, y) => { const sp = w2s(x, y), r = canvas.getBoundingClientRect(); canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: r.left + sp.x * (r.width / canvas.width), clientY: r.top + sp.y * (r.height / canvas.height), button: 0, bubbles: true })); };
  S.ui.hindringRoomId = 9218; S.ui.hindringType = 'annet'; S.ui.hindringCustomName = 'Pipe'; S.ui.drawMode = 'hindring-w2w'; S.drawing.active = true; S.drawing.points = [];
  S.drawing.hindringW2W = { startWallIdx: null, startPt: null, endWallIdx: null, endPt: null, phase: 0, pendingSplit: null, hoverSide: null };
  for (const [x, y] of [[170, -3], [172, 40], [230, 41], [231, -3]]) click(x, y);
  // og hva splitRoomWithPolyline ville gitt for samme vegg
  const [A, B] = splitRoomWithPolyline(S.rooms[0], [{x:170,y:0},{x:170,y:40},{x:230,y:40},{x:230,y:0}], 0, 0);
  return { alerts, hindringer: S.hindrings.length, fase: S.drawing.hindringW2W.phase, punkter: S.drawing.points.length, modus: S.ui.drawMode, splitA: A.length + ' pkt ' + Math.round(compArea(A)) + ' cm²', splitB: B.length + ' pkt ' + Math.round(compArea(B)) + ' cm²' };
})()`) : null;
console.log('FØR (HEAD):', JSON.stringify(foer));
await h.close(); process.exit(0);
