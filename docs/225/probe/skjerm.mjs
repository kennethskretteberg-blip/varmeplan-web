// 225: skjermbilder (deviceScaleFactor 2) før (HEAD-kopi) og etter, lyst og mørkt tema: dashbordet, prosjekt med
// folie + kabel + hindring (217-fixturet), tak-modulen (fixture 1-filmens-bygg, steg 3) og PDF-forhåndsvisningen.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/225/probe/head/index.html"; import("./docs/225/probe/skjerm.mjs") '
//   node -e ' process.env.TAG="etter"; import("./docs/225/probe/skjerm.mjs") '
import fs from 'node:fs';
import { openPage, sov, TEMA } from './cdpklient.mjs';
import { FIX, VIS_PROSJEKT, DASHBORD } from '../../224/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const del = process.env.DEL || 'alle';
const ut = {};
const vil = n => del === 'alle' || del.split(',').includes(n);

if (vil('dashbord')) for (const tema of ['light', 'dark']) {
  const p = await openPage(url, 9333, 2);
  await p.eval(`document.fonts.ready.then(() => 1)`);
  ut['dashbord-' + tema] = await p.eval(DASHBORD);
  await p.eval(`(() => { S.ui.theme = '${tema}'; document.body.classList.toggle('light-theme', '${tema}' === 'light'); return 1; })()`);
  await sov(400);
  await p.shot(`docs/225/${tag}-dashbord${tema === 'dark' ? '-moerkt' : ''}.png`);
  await p.close();
}

if (vil('prosjekt')) {
  const p = await openPage(url, 9333, 2);
  await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX} return 1; })()`);
  await p.eval(`document.fonts.ready.then(() => 1)`);
  ut.prosjekt = await p.eval(VIS_PROSJEKT);
  await sov(400);
  await p.shot(`docs/225/${tag}-prosjekt.png`);
  // utsnitt 2× av verktøylinja (venstre halvdel) — her ser man knapphøyde, tekst og valgt tilstand
  await p.shot(`docs/225/${tag}-verktoylinje-2x.png`, { x: 0, y: 0, width: 700, height: 60, scale: 2 });
  await p.eval(TEMA('dark')); await sov(300);
  await p.shot(`docs/225/${tag}-prosjekt-moerkt.png`);
  await p.eval(TEMA('light'));
  await p.close();
}

if (vil('tak')) {
  const p = await openPage(url, 9333, 2);
  const fix = fs.readFileSync('docs/3d/fixtures/1-filmens-bygg.json', 'utf8');
  ut.tak = await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); S.project.name = '225 tak'; addPart('roof');
    document.getElementById('app').style.display = 'flex'; resizeCanvas();
    const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
    S.ui.activePartId = part.id; S.ui.activeFloorId = fid; window.__fid = fid;
    S.tak = { [fid]: ${fix} }; _takStepOpen[fid] = 3;
    S.ui.theme = 'light'; document.body.classList.add('light-theme'); if (typeof _gridColorsCache !== 'undefined') _gridColorsCache = null;
    setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render(); document.activeElement && document.activeElement.blur();
    await document.fonts.ready; return { fid, kanter: (S.tak[fid].edges || []).length }; })()`);
  await sov(500);
  await p.shot(`docs/225/${tag}-tak.png`);
  await p.eval(TEMA('dark')); await sov(300);
  await p.shot(`docs/225/${tag}-tak-moerkt.png`);
  await p.close();
}

if (vil('pdf')) {
  const p = await openPage(url, 9333, 2);
  await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX} return 1; })()`);
  await p.eval(`document.fonts.ready.then(() => 1)`);
  await p.eval(VIS_PROSJEKT);
  ut.pdf = await p.eval(`(() => { window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
    _showExportDialog(); _expPreviewRoom(32); const d = document.getElementById('export-dialog'); return { synlig: !!d && d.style.display !== 'none' }; })()`);
  await sov(900);
  await p.shot(`docs/225/${tag}-pdf-forhaandsvisning.png`);
  await p.eval(TEMA('dark')); await p.eval(`(() => { _expPreviewRoom(32); return 1; })()`); await sov(900);
  await p.shot(`docs/225/${tag}-pdf-forhaandsvisning-moerkt.png`);
  await p.close();
}
console.log(tag, JSON.stringify(ut));
process.exit(0);
