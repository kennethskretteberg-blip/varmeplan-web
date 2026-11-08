// 217 STEG 0: måler hva som står i S.geo rett etter _resetProjectState, langs den ekte «nytt prosjekt»-veien
// (_createProjectInline). URL0 velger kode. Bare lagring/åpning mot Supabase er stubbet (ingen innlogging i headless).
import { openPage } from './cdp.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const p = await openPage(url);
const r = await p.eval(`(async () => {
  const E = 574200, N = 6670300, ut = {};
  window._showToast = () => {}; window._scheduleAutoSave = () => {};
  // Prosjekt A: tak med kart, to kandidater, valgt bygg
  _resetProjectState(); S.project.name = 'A'; addPart('roof');
  const pA = S.project.parts[0], fA = S.floors.find(f => f.partId === pA.id).id;
  S.ui.activePartId = pA.id; S.ui.activeFloorId = fA;
  const bg = _installTileBackground(fA, { east: E, north: N }, 'Prosjekt A-veien 1'); S.bgs = { [fA]: bg };
  const fp = [[E,N],[E+12,N],[E+12,N+8],[E,N+8]].map(([e,n]) => _geoToWorld(bg, e, n));
  S.geo = { [fA]: { address: 'Prosjekt A-veien 1', addrPoint: { lat: 59.7, lon: 10.8 }, center: { east: E, north: N }, chosen: { bygningsnr: '300100', type: 'Enebolig', footprintWorld: fp },
    candidates: [{ bygningsnr: '300100', type: 'Enebolig', distance_m: 3, footprintWorld: fp }, { bygningsnr: '300200', type: 'Garasje', distance_m: 15, footprintWorld: fp.map(q => ({ x: q.x + 2000, y: q.y })) }] } };
  ut.foer = { noekler: Object.keys(S.geo), kandidater: S.geo[fA].candidates.length, valgt: S.geo[fA].chosen.bygningsnr };
  // Direkte: rett etter _resetProjectState
  const fasit = JSON.stringify(S.geo);
  const skygge = S.geo;
  _resetProjectState();
  ut.rettEtterReset = { noekler: Object.keys(S.geo), sammeObjekt: S.geo === skygge, innhold: JSON.stringify(S.geo).slice(0, 110), bgs: Object.keys(S.bgs).length, tak: Object.keys(S.tak).length };
  // Ekte vei: Opprett prosjekt
  S.geo = JSON.parse(fasit);
  let lagret = null; const orig = { s: window._saveToSupabase, o: window._openCloudProject, r: window._renderProjectList };
  window._saveToSupabase = async () => { lagret = JSON.parse(JSON.stringify(_buildSaveData())); _supabaseProjectId = 'stub'; };
  window._openCloudProject = async () => {}; window._renderProjectList = () => {};
  document.getElementById('dash-proj-name').value = 'B — nytt prosjekt';
  await _createProjectInline();
  ut.lagretINyttProsjekt = { navn: lagret && lagret.project.name, geoNoekler: lagret && Object.keys(lagret.geo), kandidater: lagret && lagret.geo[fA] ? lagret.geo[fA].candidates.length : 0, adresse: lagret && lagret.geo[fA] ? lagret.geo[fA].address : null, bgs: lagret && Object.keys(lagret.bgs || {}).length };
  // Nytt prosjekt får samme etasje-id. Hva ser takmodulen, uten kart?
  addPart('roof'); const pB = S.project.parts[0], fB = S.floors.find(f => f.partId === pB.id).id; S.ui.activePartId = pB.id; S.ui.activeFloorId = fB;
  ut.nyEtasje = { fA, fB, sammeId: fA === fB, activeGeo: _activeGeo() === null ? null : 'ARVET' };
  window.fetch = async () => new Response('{}', { status: 502 });
  const v = await _takChooseBuilding(fB, '300100');
  ut.velgForrigeProsjektsBygg = v && v.kind;
  ut.takEtterVelg = JSON.stringify(S.tak).slice(0, 120);
  return ut;
})()`);
console.log(JSON.stringify(r, null, 1));
await p.close(); process.exit(0);
