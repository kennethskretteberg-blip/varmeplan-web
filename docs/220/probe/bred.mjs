import { openPage, sov } from './cdp.mjs';
for (const W of [1400, 1280, 1100]) {
  const p = await openPage('http://localhost:4000/');
  await p.send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: false });
  await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); addPart('roof'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
    const fid = S.floors[0].id; S.ui.activeFloorId = fid;
    S.tak = { [fid]: _takManual([[0,0],[1200,0],[1200,500],[0,500]].map(([x, y]) => ({ x, y }))) };
    _takSetRoofType(fid, 'pitched'); _takStepGo(fid, 3); _takAddGutter(fid, 'k1'); fitAll(); renderSidebar(); updateCtxBar(); render(); })()`);
  await sov(300);
  console.log(W, JSON.stringify(await p.eval(`(() => { const b = document.getElementById('ctxbar').getBoundingClientRect(), c = canvas.getBoundingClientRect(); return { w: b.width|0, h: b.height|0, venstre: (b.left - c.left)|0, hoyre: (c.right - b.right)|0 }; })()`)));
  await p.close();
}
process.exit(0);
