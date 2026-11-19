// 238 — regresjonstest: egen avstand fra sidene på repos, og trinnene prioriteres. Kjøres fra konsollen:
// _stairLandingMarginRegressionTest238(). Samme syntetiske katalog og «rør ikke lagring»-oppsett som 084/101/102.
// Låser: (A) trapper som ikke bruker valgene er som før 238 (fasit = hash målt på koden før 238), (B) repos-feltet,
// (C) «Prioriter trinn», (D) repos på taket → trinnene → for kort, (E) soner og låst sone (105), (F) forslag,
// (G) låst avstand på trappa (120), (H) hestesko, (I) PDF-blokka og målene leser reposets verdi, (J) panelet.
function _stairLandingMarginRegressionTest238() {
  const saved = { stairs: S.stairs, sel: S.ui.selectedStairId, zone: S.ui.selectedStairZone, prods: HEATING_PRODUCTS.slice(), cats: PRODUCT_CATEGORIES.slice(),
    nextStair: S.counters.nextStairId, undoLen: _undoStack.length, autosave: window._performAutoSave };
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name, ok: !!cond, expected, got });
  const ny = typeof _stairLmOn === 'function';
  try {
    window._performAutoSave = async () => {};
    const LENS = [5, 10, 15, 20, 25, 30, 35, 40.1, 45, 49.7, 55.3, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
    PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: 'cable', name: 'TESTKABEL' });
    HEATING_PRODUCTS.length = 0;
    LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: 'InSnow 30T',
      name: `InSnow 30T ${Math.round(L * 30)}W ${L}m`, cable_length_m: L, watt_per_m: 30, voltage: 230 }));
    const pid = L => (HEATING_PRODUCTS.find(p => Math.abs(p.cable_length_m - L) < 0.001) || {}).id;
    const lenOf = id => (HEATING_PRODUCTS.find(p => p.id === id) || {}).cable_length_m;
    const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
    const reg = st => { S.stairs = [st]; S.ui.selectedStairId = st.id; S.ui.selectedStairZone = null; _regenerateStairCable(st); return st; };
    // Rett trapp: 4 trinn + repos 120 + 6 trinn, 210 cm bred (Kenneths testtrapp). zones = sonenummer per segment.
    const mk = (extra, zones, zoneSettings) => {
      S.counters.nextStairId = 998001;
      const st = _createStairObj({ name: 'T238', width_cm: 210, step_depth_cm: 30, step_height_cm: 17, step_count: 10,
        edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, cableSpacing_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, ...(extra || {}) });
      st.segments = [{ type: 'steps', width_cm: 210, stepDepth_cm: 30, stepHeight_cm: 17, stepCount: 4 }, { type: 'landing', width_cm: 210, depth_cm: 120 },
        { type: 'steps', width_cm: 210, stepDepth_cm: 30, stepHeight_cm: 17, stepCount: 6 }];
      if (zones) st.segments.forEach((g, i) => { g.zone = zones[i]; });
      if (zoneSettings) st.zoneSettings = JSON.parse(JSON.stringify(zoneSettings));
      st.cables = []; st.selectedProposal = null; st.lastProposal = null; st.desiredCableCount = null;
      return reg(st);
    };
    const setC = (st, lens) => { st.cables = lens.map((L, i) => ({ index: i, productId: pid(L) })); st.cableProductId = pid(lens[0]); st.selectedProposal = null; _regenerateStairCable(st); return st; };
    // Hele utlegget som én streng: hver streng (flate, posisjon, start/slutt/kabel), behov, dekket, marginer.
    const full = st => JSON.stringify({ r: st.runs.map(r => [r.surfaceIdx, r2(r.pos_cm), r.segments.map(g => [r2(g.start_cm), r2(g.end_cm), g.cableIdx])]),
      t: r2(st.totalCableLength_cm), c: r2(st.coveredCableLength_cm), em: st.edgeMargin_cm, u: (st.uncoveredRuns || []).length,
      k: (st.cables || []).map(c => [c.zone, c.productId, c.edgeMargin_cm, c.error || null]) });
    const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); };
    const propSig = st => _generateStairProposals(st).map(p => p.products.map(x => x.length_m).join('+') + '@' + p.edgeMargin_cm + '/' + (p.marginResidual_cm || 0)).join(' | ');
    const HS = { topW_cm: 470, topD_cm: 70, count: 1, front_cm: 31 };
    const mkHs = extra => { S.counters.nextStairId = 998001;
      return reg(_createStairObj({ name: 'HS238', design: 'horseshoe', horseshoe: { ...HS }, segments: _stairHsSegments(_stairHsParams({ horseshoe: HS })),
        riserOffset_cm: 2, noseOffset_cm: 2, edgeMargin_cm: 2, edgeMarginMin_cm: 2, stepCC_cm: 10, landingCC_cm: 10, x_cm: 0, y_cm: 0, ...(extra || {}) })); };
    const mkRett = extra => { S.counters.nextStairId = 998001;
      return reg(_createStairObj({ name: 'R238', width_cm: 240, step_depth_cm: 30, step_height_cm: 17, step_count: 8, edgeMargin_cm: 5, stepCC_cm: 10, cableSpacing_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, ...(extra || {}) })); };
    // ── A: uendret uten de nye valgene. Fasit = hash av hele utlegget (+ forslagslista), målt på koden før 238. ──
    const FASIT = { a1_rett8_forslagA: '1xj5xxb', a2_repos_manuelt98: '1uahn20', a3_repos_manuelt106_9: 'fxp6de', a4_repos_forslag: 'mi885r', a5_soner123: '16ja5tm', a6_soner122: '18jkvn2',
      a7_soner122_laast8: 'inghdd', a8_hestesko: 'hwsc1u', a9_hestesko_fyllTopp: '18kf9dl', a10_repos_laast6: '2lb6fd', a11_reposTopp_forslagA: '1rdkpel' };
    const fx = {
      a1_rett8_forslagA: () => { const st = mkRett(); const p = _generateStairProposals(st); st.proposals = p; _applyStairProposal(st, p[0]); return full(st) + propSig(st); },
      a2_repos_manuelt98: () => full(setC(mk(), [98])),
      a3_repos_manuelt106_9: () => full(setC(mk(), [106.9])),
      a4_repos_forslag: () => { const st = mk(); return full(st) + propSig(st); },
      a5_soner123: () => full(mk(null, [1, 2, 3])),
      a6_soner122: () => full(mk(null, [1, 2, 2])),
      a7_soner122_laast8: () => full(mk(null, [1, 2, 2], { 2: { edgeMargin_cm: 8 } })),
      a8_hestesko: () => { const st = mkHs(); const p = _generateStairProposals(st); if (p[0]) _applyStairProposal(st, p[0]); return full(st) + propSig(st); },
      a9_hestesko_fyllTopp: () => { const st = mkHs({ horseshoe: { ...HS, marginMode: 'fillTop' } }); const p = _generateStairProposals(st); if (p[0]) _applyStairProposal(st, p[0]); return full(st) + propSig(st); },
      a10_repos_laast6: () => { const st = mk(); st.edgeMarginLocked_cm = 6; return full(setC(st, [98])); },
      a11_reposTopp_forslagA: () => { const st = mkRett({ landing_position: 'top', landing_depth_cm: 120, landingCC_cm: 10, landingMargin_cm: 5 }); const p = _generateStairProposals(st); if (p[0]) _applyStairProposal(st, p[0]); return full(st) + propSig(st); },
    };
    for (const k of Object.keys(fx)) { const h = hash(fx[k]()); check('A: ' + k + ' — utlegg og forslag som før 238', FASIT[k], h === FASIT[k], h); }
    if (ny) {
      const stA = setC(mk(), [98]);
      check('A: ingen 238-felt på en trapp som ikke bruker valgene', 'ingen', !('landingEdgeMargin_cm' in stA) && !('prioritizeSteps' in stA) && !('landingEdgeMarginSolved_cm' in stA) && !_stairLmOn(stA),
        ['landingEdgeMargin_cm', 'prioritizeSteps', 'landingEdgeMarginSolved_cm'].filter(f => f in stA).join(',') || 'ingen');
      check('A: flatene har ikke landingOwn', 'ingen', stA.surfaces.every((f, i) => !_stairSurfSettings(stA, i).landingOwn), 'se kode');
      const stZ = mk(null, [1, 2, 2]);
      check('A: sonekabler uten repos-felt', 'ingen', stZ.cables.every(c => !('landingEdgeMargin_cm' in c)), stZ.cables.map(c => c.landingEdgeMargin_cm).join(','));
    }
    if (ny) {
      const land = st => st.surfaces.findIndex(f => f.type === 'landing');
      const ss = (st, si) => _stairSurfSettings(st, si);
      const span = (st, type) => [...new Set(st.runs.filter(r => st.surfaces[r.surfaceIdx].type === type).map(r => r1(r.segments[0].start_cm) + '–' + r1(r.segments[r.segments.length - 1].end_cm)))].join(',');
      const posSig = st => JSON.stringify(st.runs.map(r => [r.surfaceIdx, r2(r.pos_cm)]));
      const fitLbl = st => _stairCableSetFit(st).label;
      const panel = () => { _updateStairSettingsPanel(); return document.getElementById('stair-settings-panel'); };
      const base = mk(); const basePos = posSig(base), baseFull = full(base);
      // ── B: repos-feltet ──
      let st = mk({ landingEdgeMargin_cm: 15 });
      check('B1: repos-felt 15 → trinn 5, repos 15 (flatenes innstillinger)', '5/15/15', ss(st, 0).edgeMargin_cm === 5 && ss(st, land(st)).edgeMargin_cm === 15 && ss(st, land(st)).edgeMarginFloor_cm === 15 && ss(st, land(st)).landingOwn === true,
        [ss(st, 0).edgeMargin_cm, ss(st, land(st)).edgeMargin_cm, ss(st, land(st)).edgeMarginFloor_cm].join('/'));
      check('B2: strengene: trinn 5–205, repos 15–195', '5–205 / 15–195', span(st, 'tread') === '5–205' && span(st, 'landing') === '15–195', span(st, 'tread') + ' / ' + span(st, 'landing'));
      check('B3: kabellengde 103,96 m (106,16 − 12 strenger × 20 cm + ruten 2 × 10 cm)', '10396 (uten felt 10616)', st.totalCableLength_cm === 10396 && base.totalCableLength_cm === 10616, st.totalCableLength_cm + ' / ' + base.totalCableLength_cm);
      check('B4: samme strenger og samme CC som uten feltet (52 strenger)', 'lik', posSig(st) === basePos && st.runs.length === 52, st.runs.length);
      st = mk(); _setStairLandingEdgeMargin('15');
      check('B5: feltet via panelets setter', '15 · 10396', st.landingEdgeMargin_cm === 15 && st.totalCableLength_cm === 10396, st.landingEdgeMargin_cm + ' · ' + st.totalCableLength_cm);
      _setStairLandingEdgeMargin('500');
      check('B6: over taket klemmes til reposets tak (210 / 2 − 1)', 104, st.landingEdgeMargin_cm === 104 && _stairMaxEdgeMarginCm(_stairLandingSurfaces(st), st.width_cm) === 104, st.landingEdgeMargin_cm);
      _setStairLandingEdgeMargin('0.2');
      check('B7: under 1 cm klemmes til 1 (som dagens felt)', 1, st.landingEdgeMargin_cm === 1, st.landingEdgeMargin_cm);
      _setStairLandingEdgeMargin('');
      check('B8: tomt felt = feltet borte, utlegget som uten', 'lik', !('landingEdgeMargin_cm' in st) && full(st) === baseFull, ('landingEdgeMargin_cm' in st) ? 'feltet står' : (full(st) === baseFull ? 'lik' : 'ULIK'));
      st = setC(mk({ landingEdgeMargin_cm: 15 }), [98]);
      check('B9: felt 15 + 98 m manuelt: trinn 5 står, repos 42,1, Passer', '5 · 42.1 · Passer', st.edgeMargin_cm === 5 && st.edgeMarginMin_cm === 5 && ss(st, land(st)).edgeMargin_cm === 42.1 && fitLbl(st) === 'Passer' && !st.uncoveredRuns.length,
        st.edgeMargin_cm + ' · ' + ss(st, land(st)).edgeMargin_cm + ' · ' + fitLbl(st));
      check('B10: gulvet for repos er feltet (15), ikke trinnenes 5', '15', st.manualFit.lmLandingFloor_cm === 15 && st.manualFit.lmStepFloor_cm === 5, st.manualFit.lmLandingFloor_cm + '/' + st.manualFit.lmStepFloor_cm);
      // ── C: «Prioriter trinn» ──
      st = setC(mk({ prioritizeSteps: true }), [98]);
      check('C1: 98 m (går ikke opp ved 5 cm): trinnenes avstand står på 5, repos øker til 42,1', '5 · 42.1 · fase 1', st.edgeMargin_cm === 5 && st.landingEdgeMarginSolved_cm === 42.1 && ss(st, land(st)).edgeMargin_cm === 42.1 && st.manualFit.lmPhase === 1,
        st.edgeMargin_cm + ' · ' + st.landingEdgeMarginSolved_cm + ' · fase ' + st.manualFit.lmPhase);
      check('C2: strengene: trinn 5–205, repos 42,1–167,9', '5–205 / 42.1–167.9', span(st, 'tread') === '5–205' && span(st, 'landing') === '42.1–167.9', span(st, 'tread') + ' / ' + span(st, 'landing'));
      check('C3: CC uendret — samme strenger på samme plass som uten valget', 'lik', posSig(st) === basePos, posSig(st) === basePos ? 'lik' : 'ULIK');
      check('C4: kabelsettet går opp (rest under 1,3 cm etter mm-snapping), ingenting udekket', 'Passer', fitLbl(st) === 'Passer' && Math.abs(st.totalCableLength_cm - 9800) < 1.3 && !st.uncoveredRuns.length, fitLbl(st) + ' · ' + st.totalCableLength_cm);
      { const t = panel().textContent;
        check('C5: panelteksten skiller repos og trinn', 'Repos: … 42.1 cm (din: 5 cm) … Trinn: 5.0 cm.', /Repos: avstand fra sidene justert til 42\.1 cm \(din: 5 cm\) så kabelsettet går opp/.test(t) && /Trinn: 5\.0 cm\./.test(t), (t.match(/Repos: avstand[^.]*\.\d[^.]*\.[^.]*\.\d cm\./) || [t.slice(0, 80)])[0]); }
      st = setC(mk({ prioritizeSteps: true }), [106.9]);
      check('C6: 106,9 m (0,7 m til overs ved gulvet): begge står på 5, merknad som før', '5 · 5 · 74 cm til overs', st.edgeMargin_cm === 5 && ss(st, land(st)).edgeMargin_cm === 5 && st.manualFit.note === '74 cm til overs', st.edgeMargin_cm + ' · ' + ss(st, land(st)).edgeMargin_cm + ' · ' + st.manualFit.note);
      st = setC(mk({ prioritizeSteps: true }), [98]); _setStairPrioritizeSteps(false);
      check('C7: valget av igjen → nøyaktig som før 238 (12,8 på alt)', FASIT.a2_repos_manuelt98, hash(full(st)) === FASIT.a2_repos_manuelt98 && !('prioritizeSteps' in st) && !('landingEdgeMarginSolved_cm' in st), hash(full(st)));
      // ── D: repos når taket → trinnene justeres → «for kort» ──
      st = setC(mk({ prioritizeSteps: true }), [60]);
      check('D1: 60 m: repos på taket 90 (strengen 30 cm), deretter trinnene til 38,5', '38.5 · 90 · fase 2 · Passer', st.edgeMargin_cm === 38.5 && ss(st, land(st)).edgeMargin_cm === 90 && st.manualFit.lmPhase === 2 && fitLbl(st) === 'Passer' && st.edgeMarginMin_cm === 5,
        st.edgeMargin_cm + ' · ' + ss(st, land(st)).edgeMargin_cm + ' · fase ' + st.manualFit.lmPhase + ' · ' + fitLbl(st));
      check('D2: CC uendret også da', 'lik', posSig(st) === basePos, posSig(st) === basePos ? 'lik' : 'ULIK');
      check('D3: panelteksten sier at repos ikke rakk', 'repos rakk ikke alene', /Repos: avstand fra sidene justert til 90\.0 cm.*Trinn: justert til 38\.5 cm \(din: 5 cm\) — repos rakk ikke alene\./.test(panel().textContent), (panel().textContent.match(/Repos: avstand.*alene\./) || ['mangler'])[0]);
      st = setC(mk({ prioritizeSteps: true }), [10]);
      check('D4: 10 m (for kort selv med alt trukket inn): begge på gulvet, udekkede løp, «for kort»', 'ikke ok · 5 · 5 · udekket · for kort',
        st.manualFit.ok === false && st.edgeMargin_cm === 5 && ss(st, land(st)).edgeMargin_cm === 5 && st.uncoveredRuns.length > 0 && /for korte/.test(st.manualFit.reason) && /Repos er alt regnet med største avstand \(90\.0 cm\)/.test(st.manualFit.reason) && /for kort/.test(fitLbl(st)),
        st.manualFit.ok + ' · ' + st.edgeMargin_cm + ' · ' + ss(st, land(st)).edgeMargin_cm + ' · ' + st.uncoveredRuns.length + ' · ' + fitLbl(st) + ' · ' + st.manualFit.reason);
      st = setC(mk({ prioritizeSteps: true }), [128.2]);
      check('D5: 128,2 m (for lang): begge på gulvet, «for lange» som før', 'ikke ok · 5 · 5', st.manualFit.ok === false && /22\.0 m for lange/.test(st.manualFit.reason) && st.edgeMargin_cm === 5 && ss(st, land(st)).edgeMargin_cm === 5 && st.totalCableLength_cm === 10616,
        st.manualFit.reason + ' · ' + st.edgeMargin_cm + ' · ' + ss(st, land(st)).edgeMargin_cm);
      // ── E: soner, og låst sone (105) ──
      const zc = (s, z) => s.cables.find(c => c.zone === z);
      st = mk({ prioritizeSteps: true }, [1, 2, 2]);
      check('E1: sone 1 (bare trinn) som før: 30 m @ 13,2, uten repos-felt', '30@13.2', lenOf(zc(st, 1).productId) === 30 && zc(st, 1).edgeMargin_cm === 13.2 && !('landingEdgeMargin_cm' in zc(st, 1)), lenOf(zc(st, 1).productId) + '@' + zc(st, 1).edgeMargin_cm);
      check('E2: sone 2 (repos + 6 trinn): 70 m, trinn 5 (før 9,6), repos 19,3', '70@5/19.3', lenOf(zc(st, 2).productId) === 70 && zc(st, 2).edgeMargin_cm === 5 && zc(st, 2).landingEdgeMargin_cm === 19.3 && !zc(st, 2).error,
        lenOf(zc(st, 2).productId) + '@' + zc(st, 2).edgeMargin_cm + '/' + zc(st, 2).landingEdgeMargin_cm + ' ' + (zc(st, 2).error || ''));
      check('E3: flatene leser sonens verdier', '13.2 · 19.3 · 5', ss(st, 0).edgeMargin_cm === 13.2 && ss(st, land(st)).edgeMargin_cm === 19.3 && ss(st, land(st) + 1).edgeMargin_cm === 5 && span(st, 'landing') === '19.3–190.7', [ss(st, 0).edgeMargin_cm, ss(st, land(st)).edgeMargin_cm, ss(st, land(st) + 1).edgeMargin_cm].join(' · '));
      st = mk({ prioritizeSteps: true }, [1, 2, 2], { 2: { edgeMargin_cm: 8 } });
      check('E4: låst sone (105) + «Prioriter trinn»: ingenting løses, utlegget som før 238', FASIT.a7_soner122_laast8, hash(full(st)) === FASIT.a7_soner122_laast8 && zc(st, 2).edgeMargin_cm === 8 && zc(st, 2).locked === true && zc(st, 2).landingEdgeMargin_cm === 8, hash(full(st)) + ' · ' + zc(st, 2).edgeMargin_cm + '/' + zc(st, 2).landingEdgeMargin_cm);
      st = mk({ prioritizeSteps: true, landingEdgeMargin_cm: 20 }, [1, 2, 2], { 2: { edgeMargin_cm: 8 } });
      check('E5: låst sone + repos-felt 20: trinn låst 8 (urørt), repos nøyaktig 20 (ikke løst)', '8 · 20 · låst', zc(st, 2).edgeMargin_cm === 8 && zc(st, 2).locked === true && zc(st, 2).landingEdgeMargin_cm === 20 && ss(st, land(st) + 1).edgeMargin_cm === 8 && ss(st, land(st)).edgeMargin_cm === 20,
        zc(st, 2).edgeMargin_cm + ' · ' + zc(st, 2).landingEdgeMargin_cm + ' · ' + (zc(st, 2).locked ? 'låst' : 'ikke låst'));
      st = mk({ landingEdgeMargin_cm: 20 }, [1, 2, 2], { 2: { landingEdgeMargin_cm: 12 } });
      check('E6: sonens eget repos-felt (12) går foran trappas (20)', 'gulv 12', ss(st, land(st)).edgeMarginFloor_cm === 12 && zc(st, 2).landingEdgeMargin_cm >= 12 && zc(st, 2).edgeMargin_cm === 5, ss(st, land(st)).edgeMarginFloor_cm + ' · ' + zc(st, 2).landingEdgeMargin_cm + ' · ' + zc(st, 2).edgeMargin_cm);
      _setStairZoneLandingEdgeMargin(2, '14');
      check('E7: sonens setter skriver zoneSettings[2].landingEdgeMargin_cm', 14, _stairZoneSettings(st, 2).landingEdgeMargin_cm === 14 && ss(st, land(st)).edgeMarginFloor_cm === 14, _stairZoneSettings(st, 2).landingEdgeMargin_cm);
      st = mk({ landingEdgeMargin_cm: 20 }, [1, 2, 3]);
      check('E8: sone med bare repos: feltet er sonens gulv', '≥ 20', zc(st, 2).edgeMargin_cm >= 20 && ss(st, land(st)).edgeMargin_cm === zc(st, 2).edgeMargin_cm && zc(st, 1).edgeMargin_cm === zc(mk(null, [1, 2, 3]), 1).edgeMargin_cm, zc(st, 2).edgeMargin_cm);
      // ── F: Forslag ──
      st = mk({ prioritizeSteps: true });
      const pF = _generateStairProposals(st);
      const lblF = p => p.products.map(x => x.length_m).join('+') + ' @ trinn ' + p.edgeMargin_cm + ' / repos ' + p.landingEdgeMargin_cm;
      check('F1: Forslag A = 98 m med trinn 5 / repos 42,1 (før 238: 98 m @ 12,8 på alt)', '98 @ trinn 5 / repos 42.1', pF[0] && lblF(pF[0]) === '98 @ trinn 5 / repos 42.1' && pF[0].landingAdjusted === true && !pF[0].marginAdjusted && !pF[0].under75, pF.map(lblF).join(' | '));
      st.proposals = pF; _applyStairProposal(st, pF[0]);
      check('F2: «Velg»: trinn 5, repos 42,1, Passer, forslaget står som valgt', '5 · 42.1 · Passer', st.edgeMargin_cm === 5 && st.landingEdgeMarginSolved_cm === 42.1 && fitLbl(st) === 'Passer' && !!st.selectedProposal && span(st, 'landing') === '42.1–167.9',
        st.edgeMargin_cm + ' · ' + st.landingEdgeMarginSolved_cm + ' · ' + fitLbl(st));
      { const kopi = JSON.parse(JSON.stringify(st)); S.stairs = [kopi]; S.ui.selectedStairId = kopi.id; _stairReopen(kopi);
        check('F3: lagret og åpnet igjen: samme utlegg', 'lik', full(kopi) === full(st) && kopi.landingEdgeMarginSolved_cm === 42.1, full(kopi) === full(st) ? 'lik' : 'ULIK');
        S.stairs = [st]; S.ui.selectedStairId = st.id; }
      _setStairPrioritizeSteps(false);
      check('F4: valget av med valgt forslag: samme sett løses på nytt som før 238 (12,8 på alt)', '12.8 · forslag', st.edgeMargin_cm === 12.8 && !('landingEdgeMarginSolved_cm' in st) && !!st.selectedProposal && !('landingEdgeMargin_cm' in st.selectedProposal) && span(st, 'landing') === '12.8–197.2',
        st.edgeMargin_cm + ' · ' + (st.selectedProposal ? 'forslag' : 'manuelt') + ' · ' + span(st, 'landing'));
      // ── G: låst avstand på trappa (120) ──
      st = mk({ prioritizeSteps: true }); st.edgeMarginLocked_cm = 6; setC(st, [98]);
      check('G1: hengelås 6 + «Prioriter trinn»: ingenting løses, som før 238', FASIT.a10_repos_laast6, hash(full(st)) === FASIT.a10_repos_laast6 && st.manualFit.locked === true && ss(st, land(st)).edgeMargin_cm === 6, hash(full(st)) + ' · ' + ss(st, land(st)).edgeMargin_cm);
      st = mk({ landingEdgeMargin_cm: 15 }); st.edgeMarginLocked_cm = 6; setC(st, [98]);
      check('G2: hengelås 6 + repos-felt 15: trinn 6, repos 15, ikke løst', '6 · 15 · låst', st.edgeMargin_cm === 6 && ss(st, land(st)).edgeMargin_cm === 15 && st.manualFit.locked === true && !('landingEdgeMarginSolved_cm' in st), st.edgeMargin_cm + ' · ' + ss(st, land(st)).edgeMargin_cm);
      // ── H: hestesko (ingen repos) — valget har ingen virkning ──
      { const sh = mkHs({ prioritizeSteps: true }); const p = _generateStairProposals(sh); if (p[0]) _applyStairProposal(sh, p[0]);
        check('H1: hestesko med «Prioriter trinn» satt: som før 238', FASIT.a8_hestesko, hash(full(sh) + propSig(sh)) === FASIT.a8_hestesko && !_stairLmOn(sh), hash(full(sh) + propSig(sh))); }
      // ── I: PDF-blokka og målene leser reposets verdi fra _stairSurfSettings ──
      st = setC(mk({ prioritizeSteps: true }), [98]);
      { const b = _stairSoneGeometryBlocks(st), b0 = _stairSoneGeometryBlocks(setC(mk(), [98]));
        check('I1: PDF-blokka: sider 5, repos 42,1', '5 / 42.1', b[0] && b[0].edgeMargin_cm === 5 && b[0].landingEdgeMargin_cm === 42.1, b[0] && (b[0].edgeMargin_cm + ' / ' + b[0].landingEdgeMargin_cm));
        check('I2: uten valget har blokka ikke feltet', 'mangler', b0[0] && !('landingEdgeMargin_cm' in b0[0]) && b0[0].edgeMargin_cm === 12.8, b0[0] && Object.keys(b0[0]).join(',')); }
      // ── J: panelet ──
      st = mk();
      { const el = panel(), f = el.querySelector('#stair-landing-edge-margin'), c = el.querySelector('#stair-prioritize-steps');
        check('J1: trapp med repos: feltet (tomt, plassholder = trinnenes 5) og avkrysningen (av) vises', 'tomt · 5 · av', !!f && f.value === '' && f.placeholder === '5' && f.max === '104' && !!c && !c.checked && !el.querySelector('#stair-lm-info'),
          f ? (f.value || 'tomt') + ' · ' + f.placeholder + ' · ' + (c && c.checked ? 'på' : 'av') : 'feltet mangler'); }
      mkRett();
      { const el = panel(); check('J2: trapp uten repos: verken felt eller avkrysning', 'ingen', !el.querySelector('#stair-landing-edge-margin') && !el.querySelector('#stair-prioritize-steps'), el.querySelector('#stair-landing-edge-margin') ? 'feltet vises' : 'ingen'); }
      st = setC(mk({ prioritizeSteps: true }), [98]);
      { const el = panel(), i = el.querySelector('#stair-lm-info'), c = el.querySelector('#stair-prioritize-steps');
        check('J3: valget på: avkrysset, og linja under viser begge tall', 'Trinn 5.0 cm · repos 42.1 cm fra sidene', !!c && c.checked && !!i && i.textContent === 'Trinn 5.0 cm · repos 42.1 cm fra sidene', i ? i.textContent : 'mangler'); }
      st = mk({ prioritizeSteps: true }, [1, 2, 2]); S.ui.selectedStairZone = 2;
      { const el = panel(), rad = el.querySelector('#stair-zone-lm-row'), t = el.textContent;
        check('J4: sonepanelet: egen rad for repos og teksten skiller trinn og repos', '19.3 cm', !!rad && /19\.3 cm/.test(rad.textContent) && /Repos: avstand fra sidene justert til 19\.3 cm \(din: 5 cm\) så kabelen går opp/.test(t) && /Trinn: 5\.0 cm\./.test(t), rad ? rad.textContent : 'raden mangler'); }
      S.ui.selectedStairZone = null;
    }
  } catch (e) {
    results.push({ name: 'UNNTAK', ok: false, expected: 'ingen', got: String(e && e.stack || e).slice(0, 400) });
  } finally {
    HEATING_PRODUCTS.length = 0; saved.prods.forEach(p => HEATING_PRODUCTS.push(p));
    PRODUCT_CATEGORIES.length = 0; saved.cats.forEach(c => PRODUCT_CATEGORIES.push(c));
    S.stairs = saved.stairs; S.ui.selectedStairId = saved.sel; S.ui.selectedStairZone = saved.zone; S.counters.nextStairId = saved.nextStair;
    _undoStack.length = saved.undoLen; window._performAutoSave = saved.autosave;
    try { _invalidateStairCache(); _updateStairSettingsPanel(); render(); } catch (e) {}
  }
  const allOk = results.every(r => r.ok);
  console[allOk ? 'log' : 'error'](`_stairLandingMarginRegressionTest238: ${allOk ? 'BESTÅTT' : 'FEILET'} (${results.filter(r => r.ok).length}/${results.length})`, results);
  return { ok: allOk, results };
}
