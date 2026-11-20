(() => {
  window._performAutoSave = async () => {};
  const LENS = [5, 10, 15, 20, 25, 30, 35, 40.1, 45, 49.7, 55.3, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: 'cable', name: 'TESTKABEL' });
  HEATING_PRODUCTS.length = 0;
  LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: 'InSnow 30T',
    name: `InSnow 30T ${Math.round(L * 30)}W ${L}m`, cable_length_m: L, watt_per_m: 30, voltage: 230 }));
  const pid = L => (HEATING_PRODUCTS.find(p => Math.abs(p.cable_length_m - L) < 0.001) || {}).id;
  const r2 = v => Math.round(v * 100) / 100;
  const reg = st => { S.stairs = [st]; S.ui.selectedStairId = st.id; S.ui.selectedStairZone = null; _regenerateStairCable(st); return st; };
  const mk = (extra, zones) => {
    S.counters.nextStairId = 998001;
    const st = _createStairObj({ name: 'T239', width_cm: 210, step_depth_cm: 30, step_height_cm: 17, step_count: 10,
      edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, cableSpacing_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, ...(extra || {}) });
    st.segments = [{ type: 'steps', width_cm: 210, stepDepth_cm: 30, stepHeight_cm: 17, stepCount: 4 }, { type: 'landing', width_cm: 210, depth_cm: 120 },
      { type: 'steps', width_cm: 210, stepDepth_cm: 30, stepHeight_cm: 17, stepCount: 6 }];
    if (zones) st.segments.forEach((g, i) => { g.zone = zones[i]; });
    st.cables = []; st.selectedProposal = null; st.lastProposal = null; st.desiredCableCount = null;
    return reg(st);
  };
  const setC = (st, lens) => { st.cables = lens.map((L, i) => ({ index: i, productId: pid(L) })); st.cableProductId = pid(lens[0]); st.selectedProposal = null; _regenerateStairCable(st); return st; };
  const full = st => JSON.stringify({ r: st.runs.map(r => [r.surfaceIdx, r2(r.pos_cm), r.segments.map(g => [r2(g.start_cm), r2(g.end_cm), g.cableIdx])]),
    t: r2(st.totalCableLength_cm), c: r2(st.coveredCableLength_cm), em: st.edgeMargin_cm, u: (st.uncoveredRuns || []).length,
    k: (st.cables || []).map(c => [c.zone, c.productId, c.edgeMargin_cm, c.error || null]) });
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); };
  const propSig = st => _generateStairProposals(st).map(p => p.products.map(x => x.length_m).join('+') + '@' + p.edgeMargin_cm + '/' + (p.marginResidual_cm || 0)).join(' | ');
  const HS = { topW_cm: 200, topD_cm: 35, count: 2, front_cm: 35, stepHeight_cm: 17 };
  const mkHs = (hx, extra) => { S.counters.nextStairId = 998001; const H = { ...HS, ...(hx || {}) };
    return reg(_createStairObj({ name: 'HS239', design: 'horseshoe', horseshoe: H, segments: _stairHsSegments(_stairHsParams({ horseshoe: H })),
      riserOffset_cm: 2, noseOffset_cm: 2, edgeMargin_cm: 5, edgeMarginMin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, x_cm: 0, y_cm: 0, ...(extra || {}) })); };
  const mkRett = extra => { S.counters.nextStairId = 998001;
    return reg(_createStairObj({ name: 'R239', width_cm: 240, step_depth_cm: 30, step_height_cm: 17, step_count: 8, edgeMargin_cm: 5, stepCC_cm: 10, cableSpacing_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, ...(extra || {}) })); };
  const prop = st => { const p = _generateStairProposals(st); if (p[0]) _applyStairProposal(st, p[0]); return full(st) + propSig(st); };
  const fx = {
    b1_hs_lik_forslag: () => prop(mkHs()),
    b2_hs_fyllTopp_forslag: () => prop(mkHs({ marginMode: 'fillTop' })),
    b3_hs_iplan_fyllTopp_49_7: () => full(setC(mkHs({ marginMode: 'fillTop', topLevel: 'flush' }), [49.7])),
    b4_hs_lik_55_3: () => full(setC(mkHs(), [55.3])),
    b5_rett_prioriter_98: () => full(setC(mk({ prioritizeSteps: true }), [98])),
    b6_rett_prioriter_soner122: () => full(mk({ prioritizeSteps: true }, [1, 2, 2])),
    b7_reposTopp_prioriter_felt15_forslag: () => prop(mkRett({ landing_position: 'top', landing_depth_cm: 120, landingCC_cm: 10, landingMargin_cm: 5, landingEdgeMargin_cm: 15, prioritizeSteps: true })),
    b8_rett_prioriter_forslag: () => prop(mk({ prioritizeSteps: true })),
  };
  const out = {}; for (const k of Object.keys(fx)) { try { out[k] = hash(fx[k]()); } catch (e) { out[k] = 'FEIL ' + e.message; } }
  return JSON.stringify(out);
})()
