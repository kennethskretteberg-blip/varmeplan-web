import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const c = await p.eval(`(async () => { window._scheduleAutoSave = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid; delete _takStepOpen[fid];
  window.fetch = async () => new Response(JSON.stringify({adresser:[{adressetekst:'A 1',postnummer:'1',poststed:'B',representasjonspunkt:{lat:1,lon:1}},{adressetekst:'A 2',postnummer:'1',poststed:'B',representasjonspunkt:{lat:1,lon:1}}]}),{status:200});
  renderSidebar(); updateCtxBar(); render(); window.__l=[]; const f0=HTMLElement.prototype.focus; HTMLElement.prototype.focus=function(){__l.push('CALL focus '+new Error().stack.split('\\n').slice(2,5).map(x=>x.trim().split(' ')[1]).join('<'));return f0.apply(this,arguments)}; const b0=_takAddrAfter; window._takAddrAfter=function(w){__l.push('after was='+JSON.stringify(w&&{f:w.focus})+' marker='+_takAddrFocusFid);return b0(w)};
  for (const t of ['focusout','focusin','mousedown']) document.addEventListener(t, e => __l.push(t+' '+(e.target.id||e.target.tagName)+' prevented='+e.defaultPrevented), false);
  const r=canvas.getBoundingClientRect();return {x:r.x+r.width*.6,y:r.y+r.height*.7}; })()`);
await sov(200);
for (const ch of 'Stein') { await p.send('Input.dispatchKeyEvent', { type:'keyDown', text:ch, key:ch }); await p.send('Input.dispatchKeyEvent', { type:'keyUp', key:ch }); }
await sov(400);
const t = () => p.eval(`({a:document.activeElement.id||document.activeElement.tagName, rader:document.querySelectorAll('#_tak-addr-list .roof-addr-row').length, l:__l.splice(0)})`);
console.log('før', await t()); await p.click(c.x, c.y); await sov(200); console.log('etter klikk', await t());
await p.close(); process.exit(0);
