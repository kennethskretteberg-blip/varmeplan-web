// 212: skråtak (206–210) og prosjekt uten tak — HEAD mot arbeidskopi. Lagring, panel og lerret skal være like.
import { openPage } from './cdp.mjs';
import crypto from 'node:crypto';
const run = async url => {
  const p = await openPage(url);
  const r = await p.eval(`(async () => {
    window._showToast = () => {}; window._scheduleAutoSave = () => {}; window.confirm = () => true;
    for (const id of ['auth-screen', 'project-list-screen']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
    const ut = {};
    _resetProjectState(); ut.tom = JSON.stringify(_buildSaveData()).replace(/"(createdAt|savedAt)":[0-9]+/g, "");
    addPart('roof'); const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
    S.ui.activePartId = part.id; S.ui.activeFloorId = fid;
    S.tak = { [fid]: _takManual([{ x: 0, y: 0 }, { x: 2500, y: 0 }, { x: 2500, y: 1000 }, { x: 0, y: 1000 }], { method: 'free' }) };
    _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10'); _takSetHeight(fid, 'ridge_m', '13');
    const g = _takAddGutter(fid, 'k1'); _takAddDownspout(fid, g.id, 2); _takAddDownspout(fid, g.id, 12.5); _takAddDownspout(fid, g.id, 23);
    _takSetRuns(fid, 'n2', 1); _takSetBox(fid, 'n2', true); _takSetDownspout(fid, 'n3', 'under', true);
    _takAddValley(fid, { x: 500, y: 500 }, { x: 0, y: 1000 });
    _takAddObject(fid, 'SKYLIGHT', { x: 1200, y: 400 }, {}); _takSetStart(fid, { type: 'DOWNSPOUT', id: 'n1' });
    _takFeatSel = null; renderSidebar(); fitAll(); render();
    const d = _buildSaveData(); delete d.savedAt; delete d.updatedAt;
    ut.lagring = JSON.stringify(d.tak);
    ut.kort = _takCardHtml(fid);
    ut.sum = _takCableSummary(_takOf(fid)).total_m;
    ut.lerret = canvas.toDataURL('image/png');
    return ut; })()`);
  await p.close(); return r;
};
const H = await run('http://localhost:4000/docs/212/probe/head/index.html');
const N = await run('http://localhost:4000/');
const h = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
for (const k of Object.keys(H)) console.log(k.padEnd(8), h(String(H[k])), h(String(N[k])), String(H[k]) === String(N[k]) ? 'LIK' : 'ULIK', k === 'sum' ? H[k] : '');
process.exit(0);
