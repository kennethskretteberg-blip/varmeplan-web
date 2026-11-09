// 224: ekte app. DOM 0,3 er Joseph Kellers vei 27 fra EKTE karttjeneste (lokal, port 4110);
// de tre andre er stubbede svar med samme form. Bilder av kortet i steg 1 — og en mutasjonssjekk.
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const SVC = 'http://127.0.0.1:4110';
const LAT = 59.816240441669954, LON = 10.290792726174327;
const ut = {};
const start = async () => {
  const p = await openPage(null);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
  await p.goto('http://localhost:4000/');
  await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); S.project.name = '224'; addPart('roof');
    document.getElementById('app').style.display = 'flex'; resizeCanvas();
    const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
    S.ui.activePartId = part.id; S.ui.activeFloorId = fid; window.__fid = fid; S.ui.readOnly = false; renderSidebar(); })()`);
  await sov(200);
  return p;
};
const kort = p => p.eval(`(() => { const H = _takCardHtml(__fid, 1), d = document.createElement('div'); d.innerHTML = H;
  return { tekst: d.innerText || d.textContent, prov: _takSurface(__fid).footprint.prov, chosen: { ...S.geo[__fid].chosen, footprintWorld: undefined } }; })()`);
const bilde = async (p, navn) => {
  await p.eval(`(() => { _takStepOpen[__fid] = 1; renderSidebar(); updateCtxBar(); try { _fitViewToBg(S.bgs[__fid]); } catch (e) {} render(); })()`);
  await sov(1800);
  await p.shot(`docs/224/${navn}.png`);
};

// ── Ekte: Joseph Kellers vei 27, adressedialogens vei ─────────────────────────────
{
  const p = await start();
  const r = await p.eval(`(async () => { window.VARMEPLAN_ROOF_URL = '${SVC}';
    const res = await _roofApi.locate({ lat: ${LAT}, lon: ${LON} });
    _roofDlg = _roofNewDlg(__fid, 'Joseph Kellers vei 27, 3409'); _roofDlg.candidates = res.candidates; _roofDlg.chosen = null; _roofDlg.query = res.query;
    await _roofFetchBackground();
    return { n: res.candidates.length, tak: await _takChooseBuilding(__fid, res.candidates[0].bygningsnr) }; })()`);
  ut.ekte_dom03 = { r, kort: await kort(p) };
  await bilde(p, '3-dom-0-3-ekte');
  // Lagre og åpne igjen i samme fane.
  ut.ekte_lagret = await p.eval(`(() => { const fid = __fid, for_ = _takCardHtml(fid, 1); const sd = JSON.parse(JSON.stringify(_buildSaveData()));
    _resetProjectState(); _restoreProject(sd); S.ui.activeFloorId = fid; S.ui.activePartId = S.floors.find(f => f.id === fid).partId;
    return { likt: _takCardHtml(fid, 1) === for_, note: _takSurface(fid).footprint.prov.note, geoNote: S.geo[fid].chosen.footprintNote }; })()`);
  await p.close();
}
// ── Stubbet: FKB, DOM 0,5, tegnet ────────────────────────────────────────────────
const E = 236023, N = 6640332, W = 12, H = 8;
const ring = [[E,N],[E+W,N],[E+W,N+H],[E,N+H],[E,N]];
const tilf = { '1-fkb': ['INSPIRE', { source: 'FKB', confidence: 0.9, note: 'INSPIRE Buildings (Kartverket)' }],
               '2-dom-0-5': ['DOM1', { source: 'DOM_RASTER', confidence: 0.5, note: 'avledet av DOM1 − DTM1 (1 m raster, Kartverket)' }] };
for (const [navn, [source, prov]] of Object.entries(tilf)) {
  const p = await start();
  await p.eval(`(async () => { const ring = ${JSON.stringify(ring)}, cx = ${E + W / 2}, cy = ${N + H / 2};
    window.VARMEPLAN_ROOF_URL = 'http://stub224';
    window.fetch = (o => async (u, i) => String(u).includes('/roof/model') ? new Response(JSON.stringify({ bygningsnr:'1', origin:{epsg:25833,east:cx,north:cy,ground_z:10,prov:{source:'DOM_RASTER',confidence:.8}},
      footprint:{polygon:ring.map(([e,n])=>[e-cx,n-cy]),area_m2:96,prov:{source:'FOOTPRINT',confidence:.9,note:'omriss fra kalleren'}},
      heights:{eave_m:{value:4,prov:{source:'DOM_RASTER',confidence:.6}},ridge_m:{value:7,prov:{source:'DOM_RASTER',confidence:.4}}},
      roof:{planes:[],edges:[],roof_type:'pitched',prov:{source:'DOM_RASTER',confidence:.5}},quality:{dom_nodata_frac:0,method:'quick',warnings:[]}}), {status:200}) : o(u, i))(window.fetch);
    _roofDlg = _roofNewDlg(__fid, 'Testveien 1'); _roofDlg.candidates = [{ bygningsnr:'1', type:'Enebolig', distance_m:0, point:{east:cx,north:cy},
      footprint:{ polygon:ring, area_m2:96, source:${JSON.stringify(source)}, prov:${JSON.stringify(prov)} } }]; _roofDlg.chosen = null; _roofDlg.query = { point:{east:cx,north:cy} };
    await _roofFetchBackground(); await _takChooseBuilding(__fid, '1'); })()`);
  ut[navn] = await kort(p);
  await bilde(p, navn);
  await p.close();
}
{
  const p = await start();
  await p.eval(`(() => { S.tak = { [__fid]: _takManual([[0,0],[1200,0],[1200,800],[0,800]].map(([x,y])=>({x,y}))) }; S.geo = { [__fid]: { chosen: {} } }; })()`);
  ut['4-tegnet'] = await kort(p);
  await bilde(p, '4-tegnet');
  await p.close();
}
// ── Mutasjon: fanger testen at notatet eller teksten forsvinner? ─────────────────
const MUT = {
  'notat droppes i _geoSetChosen': `{ const o = _geoSetChosen; _geoSetChosen = (g, c) => { o(g, c); delete g.chosen.footprintNote; }; }`,
  'notat ignoreres i _takFootprintProv': `{ const o = _takFootprintProv; _takFootprintProv = c => ({ ...o(c), note: 'Kartverket (DOM1)' }); }`,
  'steg 1 hardkodet som før 224': `{ const o = _takStep1Inner; _takStep1Inner = (f, t, s) => o(f, t, s).replace('Omriss avledet av høydedata', 'Omriss fra Kartverket'); }`,
};
ut.mutasjoner = {};
for (const [navn, kode] of Object.entries(MUT)) {
  const p = await openPage('http://localhost:4000/');
  ut.mutasjoner[navn] = await p.eval(`(async () => { ${kode}; const t = await _takRegressionTest224(); return { røde: t.filter(x => !x.ok).length, av: t.length }; })()`);
  await p.close();
}
fs.writeFileSync('docs/224/probe/ekte.json', JSON.stringify(ut, null, 1));
console.log(JSON.stringify(ut, null, 1).slice(0, 5000));
process.exit(0);
