// 203: som 202 D, men regner i tillegg bNy med den NYE koden (_stairSidePrintBandCount).
// 202 D: MÅLING av båndinndelingen i PDF-ens sidevisning — ingen endring i koden.
// Pakker inn _generateStairSurfaces i DENNE fanen, kjører trappetestene, og regner for hver unik trapp
// forholdet dybde/høyde med (a) dagens formel i _renderStairSidePrintImages og (b) høydekjeden.
(() => {
  const TESTS = { hestesko: '_stairHorseshoeRegressionTest', regresjon: '_stairRegressionTest', sone: '_stairZoneRegressionTest102',
    bygger110: '_stairBuilderMoveRegressionTest110', bygger193: '_stairBuilderHeightRegressionTest193', side: '_stairSideRegressionTest',
    '191': '_stairReposRiserRegressionTest191', '192': '_stairLandingCCRegressionTest192', manuelt: '_stairManualSetRegressionTest' };
  const orig = window._generateStairSurfaces;
  const rows = new Map(); let cur = null, busy = false;
  const band = r => r > 8 ? 3 : r > 4 ? 2 : 1;
  window._generateStairSurfaces = function (st) {
    const res = orig.apply(this, arguments);
    if (busy || !res || !res.length) return res;
    busy = true;
    try {
      const segs = st.segments || [];
      const key = JSON.stringify([st.design || 'rett', st.horseshoe || null, st.buildDirection || 'bottom', st.step_height_cm,
        res.map(s => [s.type, Math.round(s.d_cm * 10), s.stepHeight_cm || null, s.y_cm != null ? Math.round(s.y_cm) : null])]);
      if (!rows.has(key)) {
        // (a) dagens formel, ordrett fra _renderStairSidePrintImages
        let totalD = 0, totalH = 0;
        for (const s of res) { totalD += s.d_cm; if (s.type !== 'landing') totalH += (s.stepHeight_cm || st.step_height_cm || 17); }
        const rA = totalD / Math.max(totalH + 17, 1);
        // (b) høydekjeden (bakken → gulvet over; opptrinnet til gulvet over er med, så ingen +17)
        const chain = _stairSideTotalHeightCm(Object.assign({}, st, { surfaces: res }));
        const rB = totalD / Math.max(chain, 1);
        const segTxt = st.design === 'horseshoe' ? 'hestesko ' + JSON.stringify(st.horseshoe || {}).slice(0, 80)
          : segs.map(s => s.type === 'landing' ? `R${s.depth_cm}` : `${s.stepCount}×${s.stepHeight_cm || st.step_height_cm || 17}/${s.stepDepth_cm}`).join(' + ');
        rows.set(key, { test: cur, navn: st.name || '', dir: st.buildDirection || 'bottom', hestesko: st.design === 'horseshoe',
          segs: segTxt, flater: res.length, repos: res.filter(s => s.type === 'landing').length,
          dybde: Math.round(totalD * 10) / 10, hDagens: totalH + 17, hKjede: Math.round(chain * 10) / 10,
          rDagens: +rA.toFixed(2), rKjede: +rB.toFixed(2), bDagens: band(rA), bKjede: band(rB), bNy: _stairSidePrintBandCount(Object.assign({}, st, { surfaces: res })) });
      }
    } catch (e) { rows.set('FEIL' + rows.size, { test: cur, feil: e.message }); }
    busy = false;
    return res;
  };
  const kjoring = {};
  try {
    for (const [k, f] of Object.entries(TESTS)) {
      cur = k;
      try { const r = window[f](); const arr = Array.isArray(r) ? r : (r && r.results) || []; kjoring[k] = arr.filter(x => x.ok).length + '/' + arr.length; }
      catch (e) { kjoring[k] = 'FEIL ' + e.message; }
    }
  } finally { window._generateStairSurfaces = orig; }
  return { kjoring, rader: [...rows.values()] };
})()
