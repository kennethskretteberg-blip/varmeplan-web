import { openPage, sov } from './cdp.mjs';
for (const [navn, url] of [['head', 'http://localhost:4000/docs/215/probe/head/index.html'], ['etter', 'http://localhost:4000/']]) {
  const p = await openPage(url);
  console.log(navn, JSON.stringify(await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
    const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid;
    S.tak = { [fid]: _takManual([[0,0],[1200,0],[1200,800],[0,800]].map(([x,y]) => ({x,y}))) };
    _takSetRoofType(fid, 'pitched'); _takAddGutter(fid, S.tak[fid].edges.find(e => e.type === 'eave').id);
    fitAll(); _takStepGo(fid, 3); renderSidebar(); updateCtxBar(); render();
    await new Promise(r => setTimeout(r, 300));
    const b = document.getElementById('ctxbar'), r = b.getBoundingClientRect();
    return { h: Math.round(r.height), w: Math.round(r.width), chips: [...b.querySelectorAll('button')].map(c => Math.round(c.getBoundingClientRect().height)), cw: canvas.getBoundingClientRect().width, tekst: b.innerText.replace(/\\s+/g,' ') }; })()`)));
  await p.close();
}
process.exit(0);
