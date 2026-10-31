import { openPage } from './cdp.mjs';
const p = await openPage(`http://localhost:4000/`);
await p.eval(`(async () => { await _loadProducts(); document.getElementById('auth-screen').style.display='none'; document.getElementById('project-list-screen').style.display='none'; document.getElementById('app').style.display='flex'; window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = function(){}; window.VARMEPLAN_ROOF_URL='https://varmeplan-roof.fly.dev'; return 1; })()`);
const Z = +process.argv[2]||200;
const r = await p.eval(`(async () => {
  const E=233598.159, N=6682393.678;
  S.bgs={}; S.geo={}; S.floors=[]; S.ui.activeFloorId=null;
  _roofDlg = _roofNewDlg(null,'Steinliveien 1'); _roofDlg.sizeM=${Z}; _roofDlg.query={point:{east:E,north:N}}; _roofDlg.chosen=null; _roofDlg.candidates=[];
  await _roofFetchBackground();
  const bg = Object.values(S.bgs)[0];
  const info = { err: _roofDlg && _roofDlg.error, widthCm: bg && bg.widthCm, zoom: S.view.zoom, cw: canvas.width, ch: canvas.height, rect: JSON.stringify(canvas.getBoundingClientRect()), dpr: devicePixelRatio, gridOn: S.snap.grid, GRID };
  // klikk to punkter 5 m fra hverandre i verden → via skjermen
  const a = {x:5000,y:-5000}, b = {x:5500,y:-5000};
  const sa = w2s(a.x,a.y), sb = w2s(b.x,b.y);
  const back = s2w(sa.x, sa.y);
  info.s2wRoundtrip = back; info.screenPxFor5m = sb.x-sa.x;
  startDimMode();
  const rect = canvas.getBoundingClientRect();
  const fire = (t, s) => canvas.dispatchEvent(new MouseEvent(t, {clientX: rect.left + s.x, clientY: rect.top + s.y, bubbles:true, button:0}));
  for (const s of [sa, sb]) { fire('mousemove', s); fire('mousedown', s); fire('mouseup', s); }
  info.floating = JSON.stringify((S.floatingDims||[]).map(d=>({p1:d.p1,p2:d.p2,len:Math.hypot(d.p2.x-d.p1.x,d.p2.y-d.p1.y)})));
  info.pending = JSON.stringify(S.drawing.dimPending||null);
  return info;
})()`);
console.log(Z, JSON.stringify(r, null, 1));
await p.close();
