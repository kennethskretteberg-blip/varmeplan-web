// 216: ekte tastetrykk og klikk (CDP), stubbet nett. Det regresjonstesten ikke kan se: at hurtigtaster ikke slår inn,
// at lista tegnes over lerretet, og at klikk i lerretet lukker den.
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
await p.eval(`(async () => { window._scheduleAutoSave = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid; delete _takStepOpen[fid];
  window.__n = 0; window.__f = window.fetch; window.fetch = async (u, o) => { u = String(u); if (u.includes('ws.geonorge.no/adresser')) { window.__n++; return new Response(JSON.stringify({ adresser: [
    { adressetekst:'Steinliveien 1', postnummer:'1400', poststed:'SKI', kommunenavn:'NORDRE FOLLO', representasjonspunkt:{lat:59.7,lon:10.8} },
    { adressetekst:'Steinliveien 1B', postnummer:'1400', poststed:'SKI', kommunenavn:'NORDRE FOLLO', representasjonspunkt:{lat:59.71,lon:10.81} }] }), {status:200}); }
    if (u.endsWith('/health')) return new Response('{"ok":true}',{status:200});
    if (u.includes('/roof/locate')) return new Response(JSON.stringify({ query:{point:{east:262000,north:6630000}}, candidates:[] }),{status:200});
    return window.__f(u, o); };
  window.VARMEPLAN_ROOF_URL='http://roof.test'; _roofResolved=null;
  renderSidebar(); updateCtxBar(); render(); })()`);
await sov(300);
const tilstand = () => p.eval(`({ fokus: document.activeElement.id||document.activeElement.tagName, verdi: document.getElementById('_tak-addr')?.value, rader: document.querySelectorAll('#_tak-addr-list .roof-addr-row').length, draw: S.ui.drawMode, tool: S.ui.tool, kall: window.__n, panel: !!document.getElementById('shortcut-panel') })`);
const skriv = async s => { for (const c of s) { await p.send('Input.dispatchKeyEvent', { type:'keyDown', text:c, key:c }); await p.send('Input.dispatchKeyEvent', { type:'keyUp', key:c }); await sov(25); } };
const tast = async (key, code, vk) => { await p.send('Input.dispatchKeyEvent', { type:'keyDown', key, code, windowsVirtualKeyCode:vk, nativeVirtualKeyCode:vk }); await p.send('Input.dispatchKeyEvent', { type:'keyUp', key, code, windowsVirtualKeyCode:vk }); await sov(40); };
console.log('start', await tilstand());
await skriv('RPMW?');  console.log('etter R P M W ?', await tilstand());
await p.eval(`document.getElementById('_tak-addr').select()`);
await skriv('Steinliveien 1'); await sov(400);
console.log('skrevet', await tilstand());
await p.shot('docs/216/etter-treffliste.png');
await tast('ArrowDown','ArrowDown',40); console.log('pil', await p.eval(`document.querySelector('#_tak-addr-list .hi')?.innerText`));
const c = await p.eval(`(()=>{const r=canvas.getBoundingClientRect();return {x:r.x+r.width*.6,y:r.y+r.height*.7}})()`);
await p.click(c.x, c.y); await sov(100);
console.log('klikk i lerretet', await tilstand());
await p.clickSel('#_tak-addr'); await sov(50); await p.eval(`document.getElementById('_tak-addr').select()`); await skriv('Steinliveien 1B'); await sov(400);
console.log('skrevet på nytt', await tilstand());
await p.clickSel('#_tak-addr-list .roof-addr-row:nth-child(2)'); 
for (let i=0;i<60;i++){ await sov(50); if (await p.eval(`!!(S.geo&&S.geo[S.ui.activeFloorId]&&_bgIsGeo(S.bgs[S.ui.activeFloorId]))`)) break; }
console.log('musevalg', await tilstand(), await p.eval(`({adr:S.geo[S.ui.activeFloorId].address, dlg:!!document.getElementById('_roof-ov'), bar:document.getElementById('ctxbar').innerText.replace(/\\s+/g,' ')})`));
for (const w of [1400, 1180, 1000]) { await p.send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:1,mobile:false});
  console.log(w, await p.eval(`(async()=>{ _resetProjectState(); addPart('roof'); const fid=S.floors[0].id; S.ui.activePartId=S.project.parts[0].id; S.ui.activeFloorId=fid; resizeCanvas(); renderSidebar(); updateCtxBar(); await new Promise(r=>setTimeout(r,250)); const b=document.getElementById('ctxbar').getBoundingClientRect(), c=canvas.getBoundingClientRect(); return {h:Math.round(b.height),l:Math.round(b.left),r:Math.round(b.right),canvasL:Math.round(c.left),canvasR:Math.round(c.right)} })()`)); }
console.log('unntak', p.events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>JSON.stringify(e.params.exceptionDetails).slice(0,300)));
await p.close(); process.exit(0);
