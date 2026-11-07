// 205: skjermbilder av de fire tilfellene. Tak tegnet som omriss (ingen kart i headless), taktype valgt.
import { openPage, sov } from './cdp.mjs';
const CASES = {
  'flatt-tak':  { rt: 'flat',    pts: [[0,0],[1200,0],[1200,800],[0,800]] },
  'saltak':     { rt: 'pitched', pts: [[0,0],[1200,0],[1200,800],[0,800]], hover: [600, 0] },
  'l-form':     { rt: 'pitched', pts: [[0,0],[1000,0],[1000,400],[400,400],[400,900],[0,900]] },
  'femkant':    { rt: 'pitched', pts: [[0,0],[1000,0],[1000,600],[500,900],[0,600]] },
  'saltak-meny':{ rt: 'pitched', pts: [[0,0],[1200,0],[1200,800],[0,800]], menu: [600, 800] },
};
for (const [navn, c] of Object.entries(CASES)) {
  const p = await openPage('http://localhost:4000/');
  const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
    window._scheduleAutoSave = () => {}; window._showToast = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); S.project.name = '205 · ${navn}'; addPart('roof');
    document.getElementById('app').style.display = 'flex'; resizeCanvas();
    const fid = S.floors[0].id; S.ui.activeFloorId = fid;
    S.tak = { [fid]: _takManual(${JSON.stringify(c.pts)}.map(([x, y]) => ({ x, y }))) };
    _takSetRoofType(fid, '${c.rt}');
    fitAll(); S.view.zoom *= 0.8; renderSidebar(); render();
    const cr = canvas.getBoundingClientRect();
    const at = (x, y) => { const q = w2s(x, y); return { x: cr.left + q.x, y: cr.top + q.y }; };
    const card = document.querySelector('.tak-card').getBoundingClientRect();
    return { hover: ${c.hover ? `at(${c.hover})` : 'null'}, menu: ${c.menu ? `at(${c.menu})` : 'null'}, card: { x: card.left, y: card.top, w: card.width, h: card.height } };
  })()`);
  if (r.hover) await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.hover.x, y: r.hover.y });
  if (r.menu) { await p.click(r.menu.x, r.menu.y); }
  await sov(400);
  await p.shot(`docs/205/${navn}.png`);
  console.log(navn, JSON.stringify(r));
  await p.close();
}
process.exit(0);
