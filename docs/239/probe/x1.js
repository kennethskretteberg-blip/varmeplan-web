(async () => {
  try { await _loadProducts(); } catch (e) {}
  window._performAutoSave = async () => {};
  const LENS = [5, 10, 15, 20, 25, 30, 35, 40.1, 45, 49.7, 55.3, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: 'cable', name: 'TESTKABEL' });
  HEATING_PRODUCTS.length = 0;
  LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: 'InSnow 30T', name: 'InSnow 30T ' + Math.round(L * 30) + 'W ' + L + 'm', cable_length_m: L, watt_per_m: 30, voltage: 230 }));
  const out = {};
  const mk = (hsx, extra) => { const HS = { topW_cm: 200, topD_cm: 35, count: 2, front_cm: 35, stepHeight_cm: 17, landing: { w_cm: 540, d_cm: 200 }, marginMode: 'fillTop', ...(hsx || {}) };
    const st = _createStairObj({ name: 'K239', design: 'horseshoe', horseshoe: HS, segments: _stairHsSegments(_stairHsParams({ horseshoe: HS })),
      riserOffset_cm: 2, noseOffset_cm: 2, edgeMargin_cm: 5, edgeMarginMin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, x_cm: 0, y_cm: 0, ...(extra || {}) });
    S.stairs = [st]; S.ui.selectedStairId = st.id; return st; };
  const sig = st => ({ surf: st.surfaces.map(f => [f.type, f.shape, f.x_cm, f.y_cm, f.w_cm, f.d_cm, f.segIdx].join('/')), zones: JSON.stringify(_stairZoneRanges(st)),
    cables: st.cables.map(c => [c.zone, (HEATING_PRODUCTS.find(p => p.id === c.productId) || {}).cable_length_m, c.edgeMargin_cm, c.error || '', Math.round(c.length_cm) / 100].join(' | ')),
    need: st.totalCableLength_cm / 100, covered: st.coveredCableLength_cm / 100, em: st.edgeMargin_cm,
    ss: st.surfaces.map((f, i) => _stairSurfSettings(st, i).edgeMargin_cm), runs: st.surfaces.map((f, i) => st.runs.filter(r => r.surfaceIdx === i).length),
    conn: st.connections.map(c => [c.fromSurf, c.toSurf, Math.round(c.length_cm * 10) / 10].join('>')), auto: JSON.stringify(_stairHsLandingAuto(st)), h: _stairSideTotalHeightCm(st), err: st.zoneError, issues: st.zoneIssues });
  out.auto = sig(mk());
  out.flush = sig(mk({ topLevel: 'flush' })).h;
  const sh = mk({ landing: { w_cm: 540, d_cm: 200, ownCable: false } });
  out.shared = sig(sh);
  out.sharedProps = _generateStairProposals(sh).map(p => p.products.map(x => x.length_m).join('+') + '@' + p.edgeMargin_cm + ' need ' + p.totalCableLength_m);
  return out;
})()
