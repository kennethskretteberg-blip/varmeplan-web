window.__MODUS='feil';
(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {};
  const as = document.getElementById('auth-screen'); if (as) as.style.display = 'none';
  const pl = document.getElementById('project-list-screen'); if (pl) pl.style.display = 'none';
  _resetProjectState(); S.project.name = 'Steinliveien 3 (stub)';
  addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id, E = 574200, N = 6670300;
  const bg = _installTileBackground(fid, { east: E, north: N }, 'Testveien 4'); S.bgs = { [fid]: bg };
  const ring = [[574210, 6670320], [574222, 6670320], [574222, 6670328], [574210, 6670328]];
  const cx = 574216, cy = 6670324;
  S.geo = { [fid]: { address: 'Testveien 4', center: { east: E, north: N }, chosen: null,
    candidates: [{ bygningsnr: '300100', type: 'Enebolig', distance_m: 3, footprintWorld: ring.map(([e, n]) => _geoToWorld(bg, e, n)), footprintSource: 'INSPIRE', footprintConfidence: 0.9 }] } };
  window.VARMEPLAN_ROOF_URL = 'http://stub204';
  window.fetch = async (u, init) => { if (window.__feil) throw new TypeError('x'); return new Response(JSON.stringify({ id: 'b', origin: { epsg: 25833, east: cx, north: cy, ground_z: 182.4, prov: { source: 'DOM_RASTER', confidence: 0.8 } },
    footprint: { polygon: ring.map(([e, n]) => [e - cx, n - cy]), area_m2: 96, prov: { source: 'FOOTPRINT', confidence: 0.9 } },
    heights: { eave_m: { value: 4.3, prov: { source: 'DOM_RASTER', confidence: 0.6 } }, ridge_m: { value: 7.5, prov: { source: 'DOM_RASTER', confidence: 0.4 } } },
    roof: { roof_type: 'pitched', planes: [], edges: [], prov: { source: 'DOM_RASTER', confidence: 0.5 } }, quality: { dom_nodata_frac: 0, warnings: [] }, attribution: '© Kartverket (CC BY 4.0)' }), { status: 200 }); };
  window.__feil = (window.__MODUS === 'feil');
  if (window.__MODUS !== 'velg') await _takChooseBuilding(fid, '300100');
  fitAll(); renderSidebar(); render();
  await new Promise(r => setTimeout(r, 1500)); render();
  const c = document.querySelector('.tak-card'); const b = c && c.getBoundingClientRect();
  return b ? { x: b.left, y: b.top, w: b.width, h: b.height } : 'ingen kort';
})()
