(() => {
  const LENS = [5, 10, 15, 20, 25, 30, 35, 40.1, 45, 49.7, 55.3, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: "cable", name: "TESTKABEL" });
  HEATING_PRODUCTS.length = 0;
  LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: "InSnow 30T", name: "InSnow 30T " + L + "m", cable_length_m: L, watt_per_m: 30, voltage: 230 }));
  const pid = L => HEATING_PRODUCTS.find(p => Math.abs(p.cable_length_m - L) < 0.001).id;
  window._performAutoSave = async () => {};
  const mk = (extra, zones) => {
    S.counters.nextStairId = 998001;
    const st = _createStairObj({ name: "T238", width_cm: 210, step_depth_cm: 30, step_height_cm: 17, step_count: 10, edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, cableSpacing_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, ...(extra || {}) });
    st.segments = [{ type: "steps", width_cm: 210, stepDepth_cm: 30, stepHeight_cm: 17, stepCount: 4 }, { type: "landing", width_cm: 210, depth_cm: 120 }, { type: "steps", width_cm: 210, stepDepth_cm: 30, stepHeight_cm: 17, stepCount: 6 }];
    if (zones) st.segments.forEach((g, i) => g.zone = zones[i]);
    st.cables = []; st.selectedProposal = null; S.stairs = [st]; S.ui.selectedStairId = st.id; _regenerateStairCable(st); return st;
  };
  const sig = st => {
    const ms = {}; st.runs.forEach(r => { const t = st.surfaces[r.surfaceIdx].type; const k = t + ":" + Math.round(r.segments[0].start_cm * 10) / 10; ms[k] = (ms[k] || 0) + 1; });
    return { em: st.edgeMargin_cm, ls: st.landingEdgeMarginSolved_cm, tot: Math.round(st.totalCableLength_cm * 100) / 100, cov: Math.round(st.coveredCableLength_cm * 100) / 100, runs: st.runs.length, ms, unc: (st.uncoveredRuns || []).length, mf: st.manualFit && { ok: st.manualFit.ok, em: st.manualFit.edgeMargin_cm, lm: st.manualFit.landingEdgeMargin_cm, ph: st.manualFit.lmPhase, res: st.manualFit.residual_cm, reason: st.manualFit.reason, note: st.manualFit.note }, fit: _stairCableSetFit(st).label };
  };
  const setC = (st, lens) => { st.cables = lens.map((L, i) => ({ index: i, productId: pid(L) })); st.cableProductId = pid(lens[0]); st.selectedProposal = null; _regenerateStairCable(st); return sig(st); };
  const out = {};
  let st = mk(); out.base = sig(st);
  out.baseProps = _generateStairProposals(st).map(p => p.products.map(x => x.length_m).join("+") + "@" + p.edgeMargin_cm + "/" + p.landingEdgeMargin_cm);
  for (const L of [[128.2], [106.9], [98], [89.1], [60], [139.9]]) { st = mk(); out["man" + L] = setC(st, L); }
  st = mk({ landingEdgeMargin_cm: 15 }); out.lm15 = sig(st);
  out.lm15Props = _generateStairProposals(st).map(p => p.products.map(x => x.length_m).join("+") + "@" + p.edgeMargin_cm + "/" + p.landingEdgeMargin_cm + (p.under75 ? " u75" : ""));
  for (const L of [[128.2], [106.9], [98], [89.1], [60], [139.9]]) { st = mk({ prioritizeSteps: true }); out["pri" + L] = setC(st, L); }
  st = mk({ prioritizeSteps: true }); out.priProps = _generateStairProposals(st).map(p => p.products.map(x => x.length_m).join("+") + "@" + p.edgeMargin_cm + "/" + p.landingEdgeMargin_cm + (p.under75 ? " u75" : ""));
  st = mk(null, [1, 2, 2]); out.zBase = st.cables.map(c => c.zone + ":" + (HEATING_PRODUCTS.find(p => p.id === c.productId) || {}).cable_length_m + "@" + c.edgeMargin_cm + "/" + c.landingEdgeMargin_cm + "/" + c.error);
  st = mk({ prioritizeSteps: true }, [1, 2, 2]); out.zPri = st.cables.map(c => c.zone + ":" + (HEATING_PRODUCTS.find(p => p.id === c.productId) || {}).cable_length_m + "@" + c.edgeMargin_cm + "/" + c.landingEdgeMargin_cm + "/" + c.error); out.zPriSig = sig(st);
  return out;
})()
