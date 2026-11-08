import { openPage, sov } from './cdp.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const p = await openPage(url);
const W = Number(process.env.W || 1400);
await p.send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: false });
await p.eval(`(async () => { window._scheduleAutoSave = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[1200,0],[1200,500],[800,500],[800,900],[400,900],[400,500],[0,500]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '5'); _takStepGo(fid, 3); fitAll(); renderSidebar(); updateCtxBar(); render(); })()`);
await sov(400);
console.log(JSON.stringify(await p.eval(`(() => { const b = document.getElementById('ctxbar').getBoundingClientRect(), c = canvas.getBoundingClientRect(), s = w2s(0,0), k = c.width/canvas.width; return { bar: [b.left|0,b.top|0,b.width|0,b.height|0], canvas: [c.left|0,c.top|0,c.width|0,c.height|0], k1y: (c.top + s.y*k)|0, panel: (document.querySelector('#sidebar')||{}).clientWidth }; })()`)));
await p.shot(process.env.SHOT || '/tmp/p218/bar.png');
await p.close(); process.exit(0);
