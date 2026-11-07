// 212: bilder av de tre metodene på filmens tak (40 × 20 m, ni sluk). node docs/212/probe/vis.mjs → docs/212/*.png
import { openPage, sov } from './cdp.mjs';
const OUT = 'docs/212/';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const ev = s => p.eval(`(async () => { ${s} })()`);
const kort = async (fil, sel) => {
  const c = await ev(`const e = document.querySelector('${sel || '.tak-flat-card'}'); if (!e) return null; e.scrollIntoView({ block: 'start' }); const b = e.getBoundingClientRect(); return { x: Math.max(0, b.left - 4), y: Math.max(0, b.top - 4), width: b.width + 8, height: Math.min(890, b.height + 8) };`);
  if (c) await p.shot(OUT + fil, c);
};
const lerret = async fil => { const c = await ev(`const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height };`); await p.shot(OUT + fil, c); };
await ev(`try { await _loadProducts(); } catch (e) {}
  window._showToast = () => {}; window._scheduleAutoSave = () => {}; window.confirm = () => true;
  for (const id of ['auth-screen', 'project-list-screen']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  _resetProjectState(); addPart('roof'); const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
  S.project.name = 'Flatt tak 212'; S.ui.activePartId = part.id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([{ x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 4000, y: 2000 }, { x: 0, y: 2000 }], { method: 'free' }) };
  _takSetRoofType(fid, 'flat'); _takSetHeight(fid, 'eave_m', '11');
  _takFlatSetCable(fid, 'InSnow 30T');
  const X = [666.7, 2000, 3333.3], Y = [333.3, 1000, 1666.7];
  for (const x of X) for (const y of Y) _takFlatAddDrain(fid, { x, y });
  _takFlatFeats(_takOf(fid), 'ROOF_DRAIN').forEach((d, i) => { if (i !== 4) _takFlatSet(fid, d.id, 'pipe_cable_m', '1,5'); });
  _takFeatSel = null; renderSidebar(); fitAll(); render(); return 1;`);
await sov(300);
await lerret('metode1-sluk-lerret.png'); await kort('metode1-sluk-kort.png');
// Nærbilde av ett sluk: to ringer à 0,40 m.
await ev(`const d = _takFlatFeats(_takOf(__fid), 'ROOF_DRAIN')[4]; S.view.zoom = 3;
  S.view.panX = d.geometry.pt.x; S.view.panY = d.geometry.pt.y; render(); return 1;`).catch(() => {});
await sov(200); await lerret('metode1-sluk-naer.png');
// Metode 2: gradrenner mellom slukene (rutenettet), 60 cm, 300 W/m².
await ev(`const fid = __fid, X = [666.7, 2000, 3333.3], Y = [333.3, 1000, 1666.7];
  for (const y of Y) for (let i = 0; i < 2; i++) _takFlatAddValley(fid, { x: X[i], y }, { x: X[i + 1], y });
  for (const x of X) for (let i = 0; i < 2; i++) _takFlatAddValley(fid, { x, y: Y[i] }, { x, y: Y[i + 1] });
  for (const v of _takFlatFeats(_takOf(fid), 'VALLEY_GUTTER')) { _takFlatSet(fid, v.id, 'width_m', '0,6'); _takFlatSet(fid, v.id, 'wm2', '300'); }
  _takFeatSel = null; renderSidebar(); fitAll(); render(); return 1;`);
await sov(300);
await lerret('metode2-gradrenner-lerret.png'); await kort('metode2-gradrenner-kort.png');
await ev(`_takFlatSelect(__fid, 'gr1'); return 1;`); await sov(150); await kort('metode2-gradrenne-rad.png', '.tak-fvalley[data-id="gr1"]');
await ev(`_takFlatSelect(__fid, 'sl5'); return 1;`); await sov(150); await kort('metode1-sluk-rad.png', '.tak-drain[data-id="sl5"]');
await ev(`const v = _takFlatFeats(_takOf(__fid), 'VALLEY_GUTTER')[2]; S.view.zoom = 1.2; const a = v.geometry.pts[0];
  S.view.panX = a.x + 250; S.view.panY = a.y; render(); return 1;`).catch(() => {});
await sov(200); await lerret('metode2-gradrenne-naer.png');
// Metode 3: hele taket 300 W/m², valgt oppsett «sluk + varme på taket».
await ev(`const fid = __fid; const f = _takFlatAddField(fid, null); _takFlatSet(fid, f.id, 'wm2', '300');
  _takFeatSel = null; renderSidebar(); fitAll(); render(); return 1;`);
await sov(300);
await kort('valg-oppsett-kort.png', '.tak-flat-sum');
await ev(`_takFlatSetSetup(__fid, 'field'); _takFeatSel = null; renderSidebar(); fitAll(); render(); return 1;`);
await sov(300);
await lerret('metode3-hele-taket-lerret.png'); await kort('metode3-hele-taket-kort.png');
// Advarselen: 500 W/m² på taket.
await ev(`const f = _takFlatFeats(_takOf(__fid), 'HEAT_FIELD')[0]; _takFlatSet(__fid, f.id, 'wm2', '500'); renderSidebar(); return 1;`);
await sov(200); await kort('advarsel-500-kort.png', '.tak-field');
await p.shot(OUT + 'hel-skjerm.png');
await p.close(); process.exit(0);
