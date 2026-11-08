import { openPage } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
await p.eval(`(()=>{ for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; } window._scheduleAutoSave=()=>{}; document.getElementById('app').style.display='flex'; })()`);
for (const kart of [false, true]) for (const w of [1400, 1180, 1000]) { await p.send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:1,mobile:false});
  console.log(kart ? 'kart' : 'tomt', w, JSON.stringify(await p.eval(`(async()=>{ _resetProjectState(); addPart('roof'); const fid=S.floors[0].id; S.ui.activePartId=S.project.parts[0].id; S.ui.activeFloorId=fid; ${kart ? "_installTileBackground(fid,{east:262000,north:6630000},'x');" : ''} resizeCanvas(); renderSidebar(); updateCtxBar(); await new Promise(r=>setTimeout(r,250)); const b=document.getElementById('ctxbar').getBoundingClientRect(), c=canvas.getBoundingClientRect(); return {b:Math.round(b.width),l:Math.round(b.left),r:Math.round(b.right),canvas:[Math.round(c.left),Math.round(c.right)]} })()`))); }
await p.close(); process.exit(0);
