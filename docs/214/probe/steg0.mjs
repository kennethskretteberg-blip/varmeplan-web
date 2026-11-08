// 214 STEG 0: måling på uendret kode. L-formet tak med 8 kanter, ekte museklikk.
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '214'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[1200,0],[1200,500],[800,500],[800,900],[400,900],[400,500],[0,500]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '5');
  fitAll(); renderSidebar(); updateCtxBar(); render(); })()`);
await sov(300);
const st = () => p.eval(`({ edges: S.tak[__fid].edges.map(e => e.type), hint: (document.getElementById('hint-bar')||document.querySelector('[id*=hint]')||{}).textContent, bar: document.getElementById('ctxbar').innerText, mode: S.ui.drawMode, menu: document.getElementById('ctx-menu').style.display })`);
console.log('før', JSON.stringify(await st()));
let klikk = 0;
const edges = await p.eval(`S.tak[__fid].edges.map(e => { const a = w2s(e.a.x,e.a.y), b = w2s(e.b.x,e.b.y), r = canvas.getBoundingClientRect(); const sx = r.width/canvas.width; return { id: e.id, x: r.left + (a.x+b.x)/2*sx, y: r.top + (a.y+b.y)/2*sx }; })`);
console.log(edges.length, 'kanter');
for (const e of edges) {
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: e.x, y: e.y }); await sov(40);
  await p.click(e.x, e.y); klikk++; await sov(60);
  const open = await p.eval(`document.getElementById('ctx-menu').style.display`);
  if (open === 'none') { console.log('meny ikke åpnet', e.id); continue; }
  await p.clickSel(`#ctx-menu [data-tak-edge-type="eave"]`); klikk++; await sov(60);
}
console.log('klikk', klikk, JSON.stringify((await st()).edges));
await p.shot('docs/214/probe/steg0-foer.png');
for (const k of ['r','m','p','l','w']) {
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, text: k, code: 'Key' + k.toUpperCase() }); await sov(120);
  const s = await st(); console.log('tast', k, '→ mode', s.mode, '| bar:', s.bar.replace(/\s+/g,' ').slice(0, 120));
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await sov(120);
  await p.eval(`if (S.ui.drawMode) cancelDrawing(); document.querySelectorAll('.modal,.modal-bg').forEach(()=>{}); try{ closeModal(); }catch(e){}`);
}
await p.close(); process.exit(0);
