// 216: snø-modulens panel, toppmeny og kartdialog, tekst og HTML, HEAD mot arbeidskopi.
import { openPage } from './cdp.mjs';
import crypto from 'node:crypto';
const h = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
for (const [navn, url] of [['head', 'http://localhost:4000/docs/216/probe/head/index.html'], ['etter', 'http://localhost:4000/']]) {
  const p = await openPage(url);
  const r = await p.eval(`(async () => { window._scheduleAutoSave = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); addPart('snow'); document.getElementById('app').style.display = 'flex'; resizeCanvas();
    const fl = S.floors[0]; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fl.id; renderSidebar(); updateCtxBar(); render();
    await new Promise(r => setTimeout(r, 300));
    const ut = { bar: document.getElementById('ctxbar').innerHTML, side: document.getElementById('sidebar').innerHTML };
    _roofDlg = _roofNewDlg(fl.id, 'Testveien 1'); _roofRender(); ut.dlg = document.getElementById('_roof-ov').innerHTML; _roofClose();
    ut.hentKart = (ut.side.match(/Hent kart/g) || []).length; return ut; })()`);
  console.log(navn, 'bar', h(r.bar), 'side', h(r.side), 'dialog', h(r.dlg), '«Hent kart» i siden:', r.hentKart, '· i dialogen:', (r.dlg.match(/Hent kart/g) || []).length);
  await p.close();
}
process.exit(0);
