import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[1200,0],[1200,500],[0,500]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid,'pitched'); fitAll(); _takStepGo(fid,2); document.activeElement && document.activeElement.blur(); })()`);
await sov(300);
await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'm', text: 'm', code: 'KeyM' }); await sov(150);
const q = await p.eval(`(() => { const W = _takSurface(__fid).footprint.world, r = canvas.getBoundingClientRect(), k = r.width / canvas.width, f = pt => { const s = w2s(pt.x, pt.y); return { x: r.left + s.x * k, y: r.top + s.y * k }; }; return { a: f(W[0]), b: f(W[1]), r: {l:r.left,t:r.top,w:r.width,h:r.height,cw:canvas.width} }; })()`);
console.log(JSON.stringify(q));
const st = () => p.eval(`({ m: S.ui.drawMode, rs: S.drawing.rectStart, dp: S.drawing.dimPending && [S.drawing.dimPending.p1,S.drawing.dimPending.p2], n: (_takCheckDims[__fid]||[]).length, el: 0 })`);
for (const c of [{ x: q.a.x + 2, y: q.a.y + 2 }, { x: q.b.x - 2, y: q.b.y + 2 }, { x: (q.a.x + q.b.x) / 2, y: q.a.y - 40 }]) {
  console.log('over', await p.eval(`(() => { const e = document.elementFromPoint(${c.x},${c.y}); return e.id || e.className || e.tagName; })()`));
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y }); await sov(60); await p.click(c.x, c.y); await sov(350); console.log(JSON.stringify(await st()));
}
await p.close(); process.exit(0);
