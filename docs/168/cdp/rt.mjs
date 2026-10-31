import { openPage } from './cdp.mjs';
const p = await openPage(`http://localhost:4000/`);
await p.eval(`(async () => { await _loadProducts(); document.getElementById('auth-screen').style.display='none'; document.getElementById('project-list-screen').style.display='none'; document.getElementById('app').style.display='flex'; window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = function(){}; window.VARMEPLAN_ROOF_URL='https://varmeplan-roof.fly.dev'; return 1; })()`);
for (const Z of [80,200]) {
const r = await p.eval(`(async () => {
  const E=233598.159, N=6682393.678;
  S.bgs={}; S.geo={}; S.floors=[]; S.ui.activeFloorId=null;
  _roofDlg = _roofNewDlg(null,'x'); _roofDlg.sizeM=${Z}; _roofDlg.query={point:{east:E,north:N}}; _roofDlg.chosen=null; _roofDlg.candidates=[];
  await _roofFetchBackground();
  const before = Object.values(S.bgs)[0];
  const data = JSON.parse(JSON.stringify(_buildSaveData()));
  const k = Object.keys(data.bgs||{});
  _restoreProject(data);
  await new Promise(r=>setTimeout(r,1500));
  const after = Object.values(S.bgs)[0];
  return { keys:k, before:{w:before.widthCm,h:before.heightCm,ox:before.originX,oy:before.originY}, saved:k.map(x=>({w:data.bgs[x].widthCm,geoW:data.bgs[x].geo&&data.bgs[x].geo.widthM, dl: data.bgs[x].dataUrl.length})), after: after && {w:after.widthCm,h:after.heightCm,ox:after.originX,oy:after.originY,geoW:after.geo&&after.geo.widthM, nat: after.img.naturalWidth} };
})()`);
console.log(Z, JSON.stringify(r));
}
await p.close();
