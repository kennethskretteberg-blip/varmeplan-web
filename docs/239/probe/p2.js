(() => {
  window._performAutoSave = async () => {};
  const LENS = [5, 10, 15, 20, 25, 30, 35, 40.1, 45, 49.7, 55.3, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: 'cable', name: 'TESTKABEL' });
  HEATING_PRODUCTS.length = 0;
  LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: 'InSnow 30T', name: 'InSnow 30T ' + L + 'm', cable_length_m: L, watt_per_m: 30, voltage: 230 }));
  const pid = L => (HEATING_PRODUCTS.find(p => Math.abs(p.cable_length_m - L) < 0.001) || {}).id;
  const lenOf = id => (HEATING_PRODUCTS.find(p => p.id === id) || {}).cable_length_m;
  const reg = st => { S.stairs = [st]; S.ui.selectedStairId = st.id; S.ui.selectedStairZone = null; _regenerateStairCable(st); return st; };
  const HS = { topW_cm: 200, topD_cm: 35, count: 2, front_cm: 35, stepHeight_cm: 17 };
  const mk = (hx, extra) => { S.counters.nextStairId = 998001; const H = { ...HS, ...(hx || {}) };
    return reg(_createStairObj({ name: 'K239', design: 'horseshoe', horseshoe: H, segments: _stairHsSegments(_stairHsParams({ horseshoe: H })),
      riserOffset_cm: 2, noseOffset_cm: 2, edgeMargin_cm: 5, edgeMarginMin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, x_cm: 0, y_cm: 0, ...(extra || {}) })); };
  const setC = (st, lens) => { st.cables = lens.map((L, i) => ({ index: i, productId: pid(L) })); st.cableProductId = pid(lens[0]); st.selectedProposal = null; _regenerateStairCable(st); return st; };
  const r1 = v => Math.round(v * 10) / 10;
  const sig = st => ({ mode: _stairAdjustMode(st), own: _stairHsLandingOwn(st), segs: st.segments.map(g => g.type + ':' + (g.zone ?? '-')).join(','),
    m: st.surfaces.map((f, i) => (f.hsLanding ? 'L' : f.hsTop ? 'T' : 'U') + r1(_stairSurfSettings(st, i).edgeMargin_cm)).join(' '),
    runs: st.surfaces.map((f, i) => st.runs.filter(r => r.surfaceIdx === i).length).join('/'),
    pos: st.surfaces.map((f, i) => st.runs.filter(r => r.surfaceIdx === i).map(r => r1(r.pos_cm)).join(',')).join(' | '),
    need: r1(st.totalCableLength_cm) / 100, cov: r1(st.coveredCableLength_cm) / 100, em: st.edgeMargin_cm,
    k: st.cables.map(c => [c.zone, lenOf(c.productId), c.edgeMargin_cm, c.error || ''].join('|')).join(' ; '), zerr: st.zoneError || '', fit: JSON.stringify(st.manualFit || null).slice(0, 160) });
  const out = {};
  const L1 = { w_cm: 340, d_cm: 120 };
  let st = mk({ landing: L1, marginMode: 'fillTop' }); out.s_auto = JSON.stringify(_stairHsLandingAuto(st)); out.s_keys = Object.keys(_stairSurfSettings(st, 3)).join(',');
  out.s_hs98 = sig(setC(st, [98]));
  st = mk({ landing: L1, marginMode: 'equal' }, { prioritizeSteps: true }); out.s_land98 = sig(setC(st, [98]));
  st = mk({ landing: L1, marginMode: 'equal' }); out.s_all98 = sig(setC(st, [98]));
  st = mk({ landing: L1, marginMode: 'fillTop' }); out.s_props = _generateStairProposals(st).map(p => p.products.map(x => x.length_m).join('+') + '@' + p.edgeMargin_cm).join(' ; ');
  // setter-flyt
  st = mk({ landing: L1, marginMode: 'fillTop' }); setC(st, [98]);
  _setStairAdjustMode('landing'); out.f_land = sig(st); out.f_land_f = [st.horseshoe.marginMode, st.prioritizeSteps].join('/');
  _setStairAdjustMode('all'); out.f_all = sig(st); out.f_all_f = [st.horseshoe.marginMode, st.prioritizeSteps].join('/');
  _setStairAdjustMode('hsSteps'); out.f_hs = sig(st); out.f_hs_f = [st.horseshoe.marginMode, st.prioritizeSteps].join('/');
  _setStairHsLandingCable('own'); out.f_own = sig(st);
  _setStairHsLandingCable('shared'); out.f_shared = sig(st);
  _setStairHsLandingCable('auto'); out.f_auto = sig(st);
  // Kenneths eksempel
  const LK = { w_cm: 540, d_cm: 200 };
  st = mk({ landing: LK, marginMode: 'fillTop' }); out.k_eget = sig(st); out.k_h = _stairSideTotalHeightCm(st); out.k_surf = st.surfaces.map(f => [f.type, f.shape, f.x_cm, f.y_cm, f.w_cm, f.d_cm].join('/')).join(' ');
  st = mk({ landing: LK, marginMode: 'fillTop', topLevel: 'flush' }); out.k_iplan = sig(st); out.k_h2 = _stairSideTotalHeightCm(st);
  st = mk({ landing: { ...LK, ownCable: false }, marginMode: 'fillTop' }); out.k_shared = sig(st);
  st = mk({ landing: LK, marginMode: 'equal' }, { prioritizeSteps: true }); out.k_land = sig(st);
  st = mk({ landing: LK, marginMode: 'equal' }); out.k_all = sig(st);
  st = mk({ landing: LK, marginMode: 'fillTop', stepEdgeMargin_cm: 8 }); out.k_felt8 = sig(st);
  st = mk({ landing: LK, marginMode: 'fillTop' }, { landingEdgeMargin_cm: 12 }); out.k_repos12 = sig(st);
  out.rows = JSON.stringify(_stairHsTableRows(mk({ landing: LK, marginMode: 'fillTop' }))).slice(0, 500);
  return out;
})()
