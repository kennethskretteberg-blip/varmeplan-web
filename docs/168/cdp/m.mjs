import { openPage } from './cdp.mjs';
const p = await openPage(`http://localhost:4000/`);
await p.eval(`(async () => { await _loadProducts(); document.getElementById('auth-screen').style.display='none'; document.getElementById('project-list-screen').style.display='none'; document.getElementById('app').style.display='flex'; window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = function(){}; window.VARMEPLAN_ROOF_URL='https://varmeplan-roof.fly.dev'; return 1; })()`);
for (const Z of [80,120,200]) {
const r = await p.eval(`(async () => {
  const E=233598.159, N=6682393.678;
  const res = await _roofApi.background({east:E,north:N,size_m:${Z},px:1600,layers:'topo,eiendom'});
  S.bgs = {}; S.geo = {};
  const bg = _installGeoBackground(1, res.geo, res.png_base64, 'T');
  const a = _geoToWorld(bg, E-20, N-10), b = _geoToWorld(bg, E+30, N+25);
  const wd = Math.hypot(b.x-a.x, b.y-a.y)/100, td = Math.hypot(50,35);
  // screen
  const sa = w2s(a.x,a.y), sb = w2s(b.x,b.y);
  const sc = S.view.zoom*BASE_SCALE;
  const ser = JSON.parse(JSON.stringify(_serializeBgFields(bg)));
  return { geo: res.geo, widthCm: bg.widthCm, heightCm: bg.heightCm, srcW: bg._srcW, imgNat: bg.img.naturalWidth, worldDistM: wd, trueM: td, ratio: wd/td, serWidthCm: ser.widthCm, serGeoW: ser.geo.widthM, scrPxPerM: Math.hypot(sb.x-sa.x,sb.y-sa.y)/td, expectPxPerM: 100*sc };
})()`);
console.log(Z, JSON.stringify(r));
}
await p.close();
