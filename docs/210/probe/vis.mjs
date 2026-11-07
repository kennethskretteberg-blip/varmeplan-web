// 210: bilder av snittet. node docs/210/probe/vis.mjs <scenario> <fil.png> [inset|pdf]
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const [scen = 'to', fil = '/tmp/s.png', how = 'inset'] = process.argv.slice(2);
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(async () => {
  window._showToast = () => {}; window._scheduleAutoSave = () => {};
  const auth = document.getElementById('auth-screen'); if (auth) auth.style.display = 'none';
  const pl = document.getElementById('project-list-screen'); if (pl) pl.style.display = 'none';
  _resetProjectState(); addPart('roof');
  const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
  S.project.name = 'IceFix-bygget';
  S.ui.activePartId = part.id; S.ui.activeFloorId = fid; S.ui.drawMode = null;
  S.tak = { [fid]: _takManual([{ x: 0, y: 0 }, { x: 2500, y: 0 }, { x: 2500, y: 1000 }, { x: 0, y: 1000 }]) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10'); _takSetHeight(fid, 'ridge_m', '12,887');
  _takAddGutter(fid, 'k1'); [2, 12.5, 23].forEach(a => _takAddDownspout(fid, 'r1', a));
  const sc = ${JSON.stringify(scen)};
  let on = { type: 'DOWNSPOUT', id: 'n1' };
  if (sc === 'en') { _takSetRuns(fid, 'r1.1', 1); _takSetRuns(fid, 'n1', 1); }
  if (sc === 'under') { _takSetDownspout(fid, 'n2', 'under', true); on = { type: 'DOWNSPOUT', id: 'n2' }; }
  if (sc === 'over') { _takSetDownspout(fid, 'n3', 'above', '9,6'); on = { type: 'DOWNSPOUT', id: 'n3' }; }
  if (sc === 'midt') { ['n1','n2','n3'].forEach(id => _takDeleteFeature(fid, id)); on = { type: 'GUTTER', id: 'r1' }; }
  if (sc === 'ukjent') { S.tak[fid].surfaces[0].heights.ridge_m.value = null; }
  _takFeatSel = null; fitAll();
  _takSectionShow(fid, on.type, on.id);
  render(); renderSidebar();
  if (${JSON.stringify(how)} === 'pdf') { const r = _takSectionToImage(fid, on, { outW: 2600 }); return { url: r.url }; }
  if (${JSON.stringify(how)} === 'kort') { const sc = document.querySelector('.tak-section-card'); sc.scrollIntoView({ block: 'start' }); const b = sc.getBoundingClientRect(); return { clip: { x: 0, y: Math.max(0, b.top - 6), width: 190, height: b.height + 12 } }; }
  if (${JSON.stringify(how)} === 'panel') { const e = document.querySelector('.tak-downspout[data-id="' + on.id + '"]'); e && e.scrollIntoView({ block: 'start' }); const sc = document.querySelector('.tak-section-card'); const b1 = e.getBoundingClientRect(), b2 = sc.getBoundingClientRect(); return { clip: { x: 0, y: Math.max(0, b1.top - 4), width: 190, height: Math.min(880, b2.bottom - b1.top + 10) } }; }
  const cr = canvas.getBoundingClientRect(); return { box: _takSectionBox && { x: cr.left + _takSectionBox.x, y: cr.top + _takSectionBox.y, w: _takSectionBox.w, h: _takSectionBox.h }, notes: _takSectionBox && _takSectionBox.info.notes };
})()`);
await sov(300);
if (how === 'pdf') fs.writeFileSync(fil, Buffer.from(r.url.split(',')[1], 'base64'));
else if (how === 'panel' || how === 'kort') await p.shot(fil, r.clip);
else if (how === 'hel') await p.shot(fil);
else await p.shot(fil, { x: r.box.x - 4, y: r.box.y - 4, width: r.box.w + 8, height: r.box.h + 8 });
console.log(JSON.stringify(r.notes || 'pdf', null, 1));
await p.close(); process.exit(0);
