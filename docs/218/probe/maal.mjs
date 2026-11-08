// 218: klikktellingen, ekte museklikk på samme 8-kants L-tak som 214 (før = menyen, etter = penselen).
//   node docs/218/probe/maal.mjs meny     (mot URL0 = HEAD-kopi eller arbeidskopi)
//   node docs/218/probe/maal.mjs pensel
import { openPage, sov } from './cdp.mjs';
const mode = process.argv[2] || 'meny';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '218'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[1200,0],[1200,500],[800,500],[800,900],[400,900],[400,500],[0,500]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '5');
  _takStepGo(fid, 3); fitAll(); renderSidebar(); updateCtxBar(); render(); })()`);
await sov(300);
const edges = await p.eval(`S.tak[__fid].edges.map(e => { const a = w2s(e.a.x,e.a.y), b = w2s(e.b.x,e.b.y), r = canvas.getBoundingClientRect(); const k = r.width/canvas.width; return { id: e.id, x: r.left + (a.x+b.x)/2*k, y: r.top + (a.y+b.y)/2*k }; })`);
// 4 takfot + 2 gavl + 1 møne + 1 parapet, samme fordeling i begge målinger
const plan = { k1: 'eave', k3: 'eave', k5: 'eave', k7: 'eave', k2: 'rake', k8: 'rake', k4: 'ridge', k6: 'parapet' };
let klikk = 0;
const mus = async (e) => { await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: e.x, y: e.y }); await sov(40); await p.click(e.x, e.y); await sov(380); };
if (mode === 'meny') {
  for (const e of edges) {
    await mus(e); klikk++;
    await p.clickSel(`#ctx-menu [data-tak-edge-type="${plan[e.id]}"]`); klikk++; await sov(120);
  }
} else if (mode === 'pensel') {
  for (const t of ['eave', 'rake', 'ridge', 'parapet']) {
    await p.clickSel(`#ctxbar [data-tak-brush="${t}"]`); klikk++; await sov(450);   // 214: raskere klikk faller bort i CDP
    for (const e of edges.filter(x => plan[x.id] === t)) { await mus(e); klikk++; }
  }
}
if (mode === 'dra') {
  const W = (x, y) => p.eval(`(() => { const s = w2s(${x},${y}), r = canvas.getBoundingClientRect(), k = r.width/canvas.width; return { x: r.left + s.x*k, y: r.top + s.y*k }; })()`);
  const dra = async (pts) => { const P = []; for (const [x, y] of pts) P.push(await W(x, y));
    await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: P[0].x, y: P[0].y }); await sov(40);
    await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: P[0].x, y: P[0].y, button: 'left', buttons: 1, clickCount: 1 }); await sov(30);
    for (const q of P.slice(1)) { await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: q.x, y: q.y, button: 'left', buttons: 1 }); await sov(40); }
    const L = P[P.length - 1]; await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: L.x, y: L.y, button: 'left', buttons: 0, clickCount: 1 }); await sov(400); klikk++; };
  const velg = async t => { await p.clickSel(`#ctxbar [data-tak-brush="${t}"]`); klikk++; await sov(450); };
  await velg('eave'); await dra([[200,500],[200,250],[200,0],[1000,250],[1000,500],[600,300],[600,900]]);
  await velg('rake'); await dra([[1200,250],[600,250],[0,250]]);
  await velg('ridge'); await dra([[800,700]]);
  await velg('parapet'); await dra([[400,700]]);
  await p.shot('docs/218/probe/dra-etter.png');
}
const typer = await p.eval(`S.tak[__fid].edges.map(e => e.id + ':' + e.type + ':' + e.prov.source).join(' ')`);
console.log(mode, 'klikk', klikk, 'riktig', Object.entries(plan).every(([k, v]) => typer.includes(k + ':' + v + ':USER_CONFIRMED')), typer);
await p.close(); process.exit(0);
