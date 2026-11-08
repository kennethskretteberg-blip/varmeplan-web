// 216: før/etter-bilder av toppmeny og panel på tomt tak. BILDE=foer|etter, URL0 = side.
import { openPage, sov } from './cdp.mjs';
const url = process.env.URL0 || 'http://localhost:4000/', navn = process.env.BILDE || 'etter';
const p = await openPage(url);
const r = await p.eval(`(async () => { window._scheduleAutoSave = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid; delete _takStepOpen[fid];
  renderSidebar(); updateCtxBar(); render(); await new Promise(r => setTimeout(r, 400));
  const b = document.getElementById('ctxbar'), r = b.getBoundingClientRect(), c = document.querySelector('.tak-wizard')?.getBoundingClientRect();
  return { tekst: b.innerText.replace(/\\s+/g,' '), bar: {x:r.x,y:r.y,width:r.width,height:r.height}, panel: c && {x:c.x,y:c.y,width:c.width,height:Math.min(c.height,620)}, aktiv: document.activeElement.id||document.activeElement.tagName }; })()`);
console.log(JSON.stringify(r));
await sov(300);
await p.shot(`docs/216/${navn}-hel-skjerm.png`);
await p.shot(`docs/216/${navn}-toppmeny.png`, { x: Math.max(0,r.bar.x-10), y: Math.max(0,r.bar.y-6), width: r.bar.width+20, height: r.bar.height+12 });
if (r.panel) await p.shot(`docs/216/${navn}-panel.png`, r.panel);
await p.close(); process.exit(0);
