// 230: fire trapper med testkabler (samme produktliste som _stairHorseshoeRegressionTest).
const FIXTUR230 = (() => {
  const LENS = [20, 30, 40.1, 49.7, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: 'cable', name: 'TESTKABEL' });
  HEATING_PRODUCTS.length = 0;
  LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: 'InSnow 30T',
    name: 'InSnow 30T ' + Math.round(L * 30) + 'W ' + L + 'm', cable_length_m: L, watt_per_m: 30, voltage: 230 }));
  S.rooms = []; S.strips = []; S.cables = []; S.mats = []; S.stairs = []; S.floors = [];
  const T = (n, w) => ({ type: 'steps', stepCount: n, stepDepth_cm: 30, stepHeight_cm: 17, width_cm: w });
  const L = (d, w) => ({ type: 'landing', depth_cm: d, width_cm: w });
  const ferdig = st => { S.stairs = [st]; S.ui.selectedStairId = null; if (!(st.runs && st.runs.length)) _regenerateStairCable(st); return st; };
  const rett = (id, navn, w, segs) => { S.counters.nextStairId = id; return ferdig(_createStairObj({ name: navn, width_cm: w, step_depth_cm: 30, step_height_cm: 17,
    buildDirection: 'bottom', edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, x_cm: 0, y_cm: 0, segments: segs })); };
  return {
    kort: () => rett(923001, 'Kort rett trapp (8 trinn)', 100, [T(8, 100)]),
    lang: () => rett(923002, 'Lang rett trapp (30 trinn)', 100, [T(30, 100)]),
    repos: () => rett(923003, 'Trapp med repos (4 + R120 + 6)', 150, [T(4, 150), L(120, 150), T(6, 150)]),
    hestesko: () => { S.counters.nextStairId = 923004; const hs = { topW_cm: 470, topD_cm: 70, count: 1, front_cm: 46, stepHeight_cm: 17 };
      return ferdig(_createStairObj({ name: 'Hesteskotrapp', design: 'horseshoe', horseshoe: hs, segments: _stairHsSegments(_stairHsParams({ horseshoe: hs })),
        riserOffset_cm: 3, noseOffset_cm: 3, edgeMargin_cm: 5, edgeMarginMin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, x_cm: 100, y_cm: 200 })); },
  };
})();
