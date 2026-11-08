import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const r0 = await p.eval(`(async () => { window._scheduleAutoSave = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid; delete _takStepOpen[fid];
  renderSidebar(); updateCtxBar(); render();
  window.__logg = []; const el0 = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function(){ __logg.push('focus '+(this.id||this.tagName)+' @ '+new Error().stack.split('\\n').slice(2,4).map(s=>s.trim().slice(0,40)).join(' < ')); return el0.apply(this, arguments); };
  document.addEventListener('focusout', e => __logg.push('focusout '+(e.target.id||e.target.tagName)), true);
  const o = updateCtxBar; window.updateCtxBar = function(){ const had=!!document.getElementById('_tak-addr'); o(); __logg.push('updateCtxBar had='+had+' has='+!!document.getElementById('_tak-addr')+' active='+(document.activeElement.id||document.activeElement.tagName)); };
  const r=canvas.getBoundingClientRect();return {x:r.x+r.width*.6,y:r.y+r.height*.7}; })()`);
await sov(200);
await p.click(r0.x, r0.y); await sov(200);
console.log(await p.eval(`({a:document.activeElement.id||document.activeElement.tagName, l:__logg})`));
for (const w of [1400, 1180, 1000]) { await p.send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:1,mobile:false});
  console.log(w, await p.eval(`(async()=>{ _resetProjectState(); addPart('roof'); const fid=S.floors[0].id; S.ui.activePartId=S.project.parts[0].id; S.ui.activeFloorId=fid; _installTileBackground(fid,{east:262000,north:6630000},'x'); resizeCanvas(); renderSidebar(); updateCtxBar(); await new Promise(r=>setTimeout(r,250)); const b=document.getElementById('ctxbar').getBoundingClientRect(), c=canvas.getBoundingClientRect(); return {h:Math.round(b.height),l:Math.round(b.left),r:Math.round(b.right),canvasL:Math.round(c.left),canvasR:Math.round(c.right),tekst:document.getElementById('ctxbar').innerText.replace(/\\s+/g,' ')} })()`)); }
await p.close(); process.exit(0);
