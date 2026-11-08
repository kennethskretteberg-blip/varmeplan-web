// 220: ekte museklikk (CDP) på L-formen: tegn to møner, se koblingen, rett en takfot. Skriver bilder til docs/220/.
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
let feil = 0;
const ok = (navn, c, fikk) => { if (!c) feil++; console.log(c ? '  ✓' : '  ✗', navn, c ? '' : '| fikk ' + JSON.stringify(fikk)); };
await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[1400,0],[1400,700],[900,700],[900,1200],[200,1200],[200,900],[0,900]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '5,4'); _takSetHeight(fid, 'ridge_m', '8,2'); _takStepGo(fid, 3);
  for (const [id, ty] of Object.entries({ k1:'eave',k2:'rake',k3:'eave',k4:'eave',k5:'rake',k6:'eave',k7:'eave',k8:'eave' })) _takSetEdgeType(fid, id, ty);
  _takAddGutter(fid, 'k1'); fitAll(); renderSidebar(); updateCtxBar(); render(); })()`);
await sov(400);
const W = (x, y) => p.eval(`(() => { const s = w2s(${x},${y}), r = canvas.getBoundingClientRect(), k = r.width/canvas.width; return { x: r.left + s.x*k, y: r.top + s.y*k }; })()`);
const flytt = async q => { await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: q.x, y: q.y }); await sov(40); };
const klikk = async (x, y, dx = 0, dy = 0) => { const q0 = await W(x, y), q = { x: q0.x + dx, y: q0.y + dy }; await flytt(q); await p.click(q.x, q.y); await sov(250); };
const kant = id => p.eval(`S.tak[__fid].edges.find(e => e.id === '${id}')`);
const esc = async () => { await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await sov(150); };
const menyOpen = () => p.eval(`document.getElementById('ctx-menu').style.display !== 'none'`);

await p.clickSel(`#ctxbar [onclick*="_takFeatStart"][onclick*="'ridge'"]`); await sov(300);
ok('knappen starter verktøyet', (await p.eval(`_takFeat && _takFeat.kind`)) === 'ridge', await p.eval(`_takFeat`));
await klikk(1400, 350, -6, 4);
await klikk(550, 350);
await klikk(550, 1200, 5, -7);
const q = await W(550, 350); await flytt({ x: q.x + 7, y: q.y + 5 });
await sov(100); await p.shot('docs/220/tegner-mone.png');
await klikk(550, 350, 7, 5);
await esc();
ok('Esc avslutter verktøyet', (await p.eval(`_takFeat === null`)), '');
const m1 = await kant('m1'), m2 = await kant('m2');
ok('møne 1 starter eksakt på kantmidten', m1.a.x === 1400 && m1.a.y === 350, m1.a);
ok('møne 2 starter eksakt på kantmidten', m2.a.x === 550 && m2.a.y === 1200, m2.a);
ok('de deler punkt eksakt', m1.b.x === m2.b.x && m1.b.y === m2.b.y, [m1.b, m2.b]);
ok('alle takfot er koblet', (await p.eval(`S.tak[__fid].edges.filter(e => e.type === 'eave').every(e => e.ridge_link)`)), '');

await p.eval(`_takRidgeSelect(__fid, 'm1')`); await sov(150);
await p.shot('docs/220/kobling-m1.png');
await p.eval(`_takRidgeSelect(__fid, 'm2')`); await sov(150);
await p.shot('docs/220/kobling-m2.png');

await klikk(700, 0);   // k1 har renna r1 på seg
ok('klikk på takfot (med renne) bytter til valgt møne', (await kant('k1')).ridge_link.id === 'm2', (await kant('k1')).ridge_link);
ok('prov blir USER_CONFIRMED', (await kant('k1')).ridge_link.prov.source === 'USER_CONFIRMED', '');
ok('ingen meny', !(await menyOpen()), '');
await p.shot('docs/220/kobling-rettet.png');
await esc();
ok('Esc slipper mønet', (await p.eval(`_takRidgeSel === null`)), '');
await klikk(700, 0);
ok('etter Esc: klikk på takfot åpner menyen som før', await menyOpen(), '');
await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
const lg = p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => JSON.stringify(e.params).slice(0, 300));
ok('ingen konsollfeil', lg.length === 0, lg);
await p.close();
console.log(feil ? 'FEILET ' + feil : 'BESTÅTT');
process.exit(feil ? 1 : 0);
