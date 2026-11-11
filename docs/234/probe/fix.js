// 234: tre kabelrom. A = Kenneths eksempel (270 x 150, InFloor 10T 100 W 10 m, vegg 20 cm, reserve),
// B = L-rom med hindring, C = rom der halv CC gaar forbi veggen (margin 5 cm).
(async () => {
  await _loadProducts();
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  _resetProjectState(); S.project.name = "Testprosjekt 234"; S.project.customer = "Test";
  document.getElementById("app").style.display = "flex"; resizeCanvas();
  S.ui.theme = "light"; document.body.classList.add("light-theme"); if (typeof _gridColorsCache !== "undefined") _gridColorsCache = null;
  const kab = HEATING_PRODUCTS.filter(q => /InFloor 10T/.test(q.name || "") && _isCableProductId(q.id));
  const lm = n => kab.find(q => Math.round(q.cable_length_m) === n);
  const K100 = lm(10), K300 = lm(30) || lm(32) || lm(28), K500 = lm(50) || lm(52) || lm(48);
  if (!K100) return { feil: "fant ikke InFloor 10T 10 m", navn: kab.map(q => q.name + " " + q.cable_length_m) };
  const fid = (S.floors[0] || {}).id || null, part = (S.project.parts || [])[0];
  const mk = (id, name, PTS, extra) => ({ id, name, floorId: fid, partId: part ? part.id : null, shape: "poly", wallThicknessCm: 0,
    points: PTS.map(q => ({ ...q })), walls: compWalls(PTS), dims: [], area: Math.abs(compArea(PTS)), roomType: "bad", ...extra });
  const A = 994001, B = 994002, C = 994003;
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  S.rooms = [
    mk(A, "A Eksempel", rect(0, 0, 270, 150), { wallMarginCm: 20, reserveCable: true }),
    mk(B, "B L-rom", [{ x: 400, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 250 }, { x: 600, y: 250 }, { x: 600, y: 450 }, { x: 400, y: 450 }], {}),
    mk(C, "C Forbi veggen", rect(950, 0, 300, 250), {}),
  ];
  const hp = rect(650, 60, 90, 70);
  S.hindrings = [{ id: 994101, roomId: B, floorId: fid, name: "Sluk", points: hp, walls: compWalls(hp) }];
  S.cables = [];
  const ut = { produkter: [K100, K300, K500].map(q => q && q.name) };
  {
    const cc = 28.7, n = 9, L = 1000, rl = (L - (n - 1) * Math.PI * cc / 2) / n, y0 = 25 + cc / 2;
    const runs = []; for (let i = 0; i < n; i++) runs.push({ pos_cm: 20 + i * cc, segments: [{ start_cm: y0, end_cm: y0 + rl }] });
    S.cables.push({ id: S.counters.nextCableId++, roomId: A, productId: K100.id, direction: "v", spacing_cm: cc, startCorner: "tl", totalLength_cm: L, runs, connections: [] });
    ut.A = { rl, y0, slutt: y0 + rl };
  }
  const legg = (rid, prod, tag) => {
    try {
      const r = generateCableLayoutLengthDriven(rid, prod.id, "v", "tl");
      ut[tag] = { nokler: r ? Object.keys(r) : null };
      const res = r && (r.cable || r.result || r);
      if (res && res.runs && res.runs.length) {
        S.cables.push({ id: S.counters.nextCableId++, roomId: rid, productId: prod.id, direction: res.direction || "v", spacing_cm: res.spacing_cm || r.spacing_cm, startCorner: "tl",
          totalLength_cm: res.totalLength_cm || prod.cable_length_m * 100, runs: res.runs, connections: res.connections || [], pathEls: res.pathEls });
        ut[tag].cc = res.spacing_cm || r.spacing_cm; ut[tag].runs = res.runs.length;
      } else ut[tag].feil = "ingen runs";
    } catch (e) { ut[tag] = { feil: String(e.message) }; }
  };
  if (K500) legg(B, K500, "B");
  if (K300) legg(C, K300, "C");
  _invalidateCableCache();
  S.ui.selectedRoomId = null;
  setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render();
  await document.fonts.ready;
  window.__RIDS = [A, B, C];
  for (const [k, id] of [["A", A], ["B", B], ["C", C]]) {
    const st = _computeRoomStats(S.rooms.find(r => r.id === id));
    const hk = S.cables.find(c => c.roomId === id && !c.reserve);
    ut[k] = { ...ut[k], cableAreaM2: st.cableAreaM2, cableWm2: st.cableWm2, heatedM2: st.heatedM2, nettoM2: st.nettoM2, wm2Total: st.wm2Total, wm2Heated: st.wm2Heated, totalW: st.totalW,
      reserveCount: st.reserveCount, margin: hk ? _effectiveMarginCm(hk.productId, id) : null, kabler: S.cables.filter(c => c.roomId === id).length };
  }
  return ut;
})()
