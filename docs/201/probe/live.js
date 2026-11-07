(async () => {
  const E = 233598.159, N = 6682393.678, FID = 'live201', C0 = {"bygningsnr": "159278689", "type": "Enebolig", "type_kode": "111", "status": "Tatt i bruk", "status_kode": "TB", "point": {"east": 233598.159, "north": 6682393.678, "lat": 60.19105686038477, "lon": 10.193283094745865}, "distance_m": 0.0, "footprint": {"polygon": [[233601.729, 6682396.91], [233600.212, 6682400.214], [233591.516, 6682396.213], [233593.495, 6682391.902], [233595.506, 6682387.508], [233606.362, 6682392.498], [233605.13, 6682395.183], [233603.88, 6682397.9], [233601.729, 6682396.91]], "area_m2": 105.78, "source": "INSPIRE", "prov": {"source": "FKB", "confidence": 0.9, "note": "INSPIRE Buildings core2D (Kartverket, CC BY 4.0)"}}};
  window.VARMEPLAN_ROOF_URL = 'https://varmeplan-roof.fly.dev';
  document.getElementById('auth-screen').style.display = 'none'; document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const toasts = [], ot = window._showToast; window._showToast = (m, t) => { toasts.push(m); try { ot(m, t); } catch (e) {} };
  window._scheduleAutoSave = () => {};
  S.floors = [{ id: FID, name: 'Live', partId: null }]; S.rooms = []; S.ui.activeFloorId = FID; S.ui.activePartId = null;
  const bg = _installTileBackground(FID, { east: E, north: N }, 'Steinliveien 1'); S.bgs = { [FID]: bg };
  const fw = C0.footprint.polygon.map(([e, n]) => _geoToWorld(bg, e, n));
  S.geo = { [FID]: { address: 'Steinliveien 1', center: { east: E, north: N }, chosen: { bygningsnr: C0.bygningsnr, type: C0.type, footprintWorld: fw, footprintSource: 'INSPIRE', footprintConfidence: 0.9 },
     candidates: [{ bygningsnr: C0.bygningsnr, type: C0.type, distance_m: 0, footprintWorld: fw }] } };
  const chosen0 = JSON.stringify(S.geo[FID].chosen);
  _rebuildActiveFloorRoomIds && _rebuildActiveFloorRoomIds(); updateCtxBar();
  const out = {};
  async function klikk(east, north, navn) {
    const w = _geoToWorld(bg, east, north);
    S.view.zoom = 0.35; S.view.panX = w.x; S.view.panY = w.y; render();
    _geoPickStart(); toasts.length = 0;
    const s = w2s(w.x, w.y), r = canvas.getBoundingClientRect();
    const c = { clientX: r.left + s.x * r.width / canvas.width, clientY: r.top + s.y * r.height / canvas.height, button: 0, bubbles: true };
    const t0 = performance.now();
    canvas.dispatchEvent(new MouseEvent('mousedown', c)); canvas.dispatchEvent(new MouseEvent('mouseup', c));
    const busyKnapp = _geoPickBtnHtml().includes('Henter bygg');
    while (_geoPick && _geoPick.busy && performance.now() - t0 < 60000) await new Promise(r => setTimeout(r, 100));
    const g = S.geo[FID];
    out[navn] = { ms: Math.round(performance.now() - t0), busyKnapp, modusPå: !!_geoPick, toasts: toasts.slice(), rader: g.candidates.map(x => x.bygningsnr + ':' + x.type),
      geoFraKlikk: _worldToGeo(bg, w.x, w.y), worldX: w.x, worldY: w.y, snapPolys: _geoSnapPolys().length, chosenUendret: JSON.stringify(g.chosen) === chosen0 };
    _geoPickStop();
  }
  await klikk(236846.291, 6679297.916, 'storgata1_4km');
  await klikk(236846.291, 6679297.916, 'storgata1_igjen');
  await klikk(236700, 6679500, 'tomt_punkt'); await klikk(236845.0, 6679240.0, 'nabobygg_sor');
  const rad = S.geo[FID].candidates.find(x => x.bygningsnr === '159160750');
  out.radBytes = rad && JSON.stringify(rad).length; out.radPunkter = rad && rad.footprintWorld.length;
  out.alleKandBytes = JSON.stringify(S.geo[FID]).length;
  const w = _geoToWorld(bg, 236846.291, 6679297.916); S.view.zoom = 0.06; S.view.panX = w.x; S.view.panY = w.y + 2500; S.ui.selectedRoomId = null; render();
  await new Promise(r => setTimeout(r, 4000)); render(); await new Promise(r => setTimeout(r, 300));
  return JSON.stringify(out, null, 1);
})()