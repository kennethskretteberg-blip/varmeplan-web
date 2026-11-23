// 243: regresjon — veggmålene («680 cm») følger 240-regelen: ingen veggmåltekst skrives oppå en annen
// måltekst eller en veggetikett, ingen står utenfor rombildet, alle vegglengder står i PDF-bildet, og
// rom uten korte vegger får ingen flyttede veggmål (Normal og Ekstra stor; PDF og skjerm).
function _wallDimNoOverlapRegressionTest243() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name, ok: !!cond, expected, got });
  const saved = { rooms: S.rooms, strips: S.strips, foilFree: S.foilFree, cables: S.cables, mats: S.mats, matPaths: S.matPaths,
    hindrings: S.hindrings, stairs: S.stairs, floors: S.floors, project: S.project, counters: { ...S.counters }, floatingDims: S.floatingDims,
    activeFloorId: S.ui.activeFloorId, activePartId: S.ui.activePartId, selectedRoomId: S.ui.selectedRoomId, selectedDimId: S.ui.selectedDimId, selectedAnnot: S.ui.selectedAnnot,
    prods: HEATING_PRODUCTS.slice(), cats: PRODUCT_CATEGORIES.slice(), profile: (typeof _currentProfile !== "undefined") ? _currentProfile : undefined,
    autoSave: window._performAutoSave, sched: window._scheduleAutoSave, toast: window._showToast, view: { ...S.view } };
  try {
    window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
    const foil = b => ({ id: 993000 + b, category_id: 1, active: true, name: "FlexFoil B=" + b + "cm", width_mm: b * 10 - 10, netto_width_mm: b * 10 - 10, watt_per_lm: b * 0.6, watt_per_m2: 60, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25 });
    PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 1, name: "Folie", module_type: "foil" });
    HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(foil(80), foil(60), foil(100), foil(50));
    const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
    const mk = (id, navn, pts) => ({ id, floorId: null, partId: null, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [], annotOffsets: {}, dimSnap: true });
    // N: korte vegger — pilaster 12 × 15, rørkasse 8 × 20, hjørnekasse 30 × 20, trappet hjørne 3 × 10 cm. N2: samme med folie og kjede.
    const NP = [[0,0],[180,0],[180,15],[192,15],[192,0],[500,0],[500,370],[490,370],[490,380],[480,380],[480,390],[470,390],[470,400],[30,400],[30,380],[0,380],[0,220],[8,220],[8,200],[0,200]];
    const N = mk(993001, "Nisjerom", NP.map(([x, y]) => ({ x, y })));
    const N2 = mk(993002, "Nisjerom folie", NP.map(([x, y]) => ({ x: x + 2000, y }))); N2.stripDimSnap = true;
    const K = mk(993003, "L-rom folie (240)", [[0, 0], [400, 0], [400, 319], [700, 319], [700, 680], [0, 680]].map(([x, y]) => ({ x: x + 4000, y }))); K.stripDimSnap = true;
    const R = mk(993004, "Rektangel", rect(6000, 0, 400, 300));
    const alle = [N, N2, K, R];
    S.rooms = alle; S.floors = []; S.stairs = []; S.matPaths = []; S.foilFree = []; S.floatingDims = []; S.hindrings = []; S.cables = []; S.mats = [];
    S.ui.activeFloorId = null; S.ui.activePartId = null; S.ui.selectedAnnot = null; S.project = { name: "VEGGMAAL-243", parts: [], revision: 0 };
    let sid = 993100; S.strips = [];
    { let x = 2012; for (const b of [80, 60, 100, 60, 80, 50]) { S.strips.push({ id: sid++, roomId: N2.id, productId: 993000 + b, direction: "v", pos_cm: x, start_cm: 20, length_cm: 340 }); x += b - 1 + 2; } }
    { let y = 321; for (const [b, gap] of [[80, 3.6], [60, 2.4], [100, 2], [60, 4], [50, 0]]) { S.strips.push({ id: sid++, roomId: K.id, productId: 993000 + b, direction: "h", pos_cm: y, start_cm: 4002.5, length_cm: 694 }); y += b - 1 + gap; } }
    if (typeof _rebuildActiveFloorRoomIds === "function") _rebuildActiveFloorRoomIds();
    _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache(); _invalidateMatCache && _invalidateMatCache();
    const tegn = room => _renderRoomToImage(room, { focusRoom: true, targetWidthMm: _pdfRoomImgLayout(room).imgW2, noUrl: true });
    const hit = (a, b) => a.x0 < b.x1 - 0.5 && a.x1 > b.x0 + 0.5 && a.y0 < b.y1 - 0.5 && a.y1 > b.y0 + 0.5;
    const vegg = t => /^V\d+ \d+ cm$/.test(t.str), tall = t => /^[\d.]+ cm( \?)?$/.test(t.str);
    const par = (tx, erMaal) => { const ut = [];
      for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) { const a = tx[i], b = tx[j];
        if ((erMaal(a) || erMaal(b)) && (erMaal(a) || vegg(a)) && (erMaal(b) || vegg(b)) && hit(a, b)) ut.push(a.str + " × " + b.str); }
      return ut; };
    const veggmaal = room => room.walls.map(w => Math.round(w.length) + " cm");
    const mangler = (vil, har) => { const n = {}; for (const s of har) n[s] = (n[s] || 0) + 1; return vil.filter(s => !(n[s]-- > 0)); };
    // A · én kode: veggmålene og kjedene flytter med samme funksjon, og veggmålene sjekker _dimPlaced
    const srcW = String(_drawDimAnnotationsForRoom), srcC = String(_drawDimChainLayout);
    check("A1: veggmålene og kjedene bruker samme _dimFlushMoved", "begge", /_dimFlushMoved\(pend/.test(srcW) && /_dimFlushMoved\(pend/.test(srcC), "");
    check("A2: veggmålet sjekker plass i linja og _dimPlaced, og utsettes via _dimDefer", "ja", /_dimHitsBox\(fb/.test(srcW) && /bw\+LUFT<=/.test(srcW) && /_dimDefer\) _dimDefer\.push\(_flush\)/.test(srcW), "");
    check("A3: de flyttede veggmålene legges i køen også i bareVegger-varianten (før returen)", "før", srcW.indexOf("_dimFlushMoved(pend") > 0 && srcW.indexOf("_dimFlushMoved(pend") < srcW.indexOf("opts.bareVegger"), "");
    // B · PDF-bildet: ingen overlapp, ingen utenfor, alle veggmål med — Normal og Ekstra stor
    for (const sk of [1, 1.5]) {
      _currentProfile = { prefs: { pdfLabelScale: sk } };
      for (const room of alle) {
        const r = tegn(room), dims = r.texts.filter(t => t.dim), tag = `B: «${room.name}», skala ${sk}`;
        const p = par(r.texts, t => t.dim), ute = dims.filter(t => t.x0 < -0.5 || t.y0 < -0.5 || t.x1 > r.w + 0.5 || t.y1 > r.h + 0.5);
        const vil = veggmaal(room), m = mangler(vil, dims.map(t => t.str));
        check(tag + ": ingen måltekst overlapper en annen måltekst eller en veggetikett", "0 par", p.length === 0, p);
        check(tag + ": ingen måltekst utenfor bildet", "0", ute.length === 0, ute.map(t => t.str));
        check(tag + ": alle veggmålene står i bildet (PDF skjuler aldri)", vil.length + " veggmål", m.length === 0, "mangler: " + m.join(" | "));
      }
    }
    _currentProfile = null;
    // C · VAKSINE: de korte veggene flyttes faktisk — og rom uten korte vegger får ingen flyttede veggmål
    S.rooms = [N]; tegn(N);
    check("C1: nisjerommets korte vegger (8–30 cm) flyttes ut med leder", "≥ 10 flyttet, 0 skjult", _dimMovedStat.wallMoved >= 10 && _dimMovedStat.wallHidden === 0, { ..._dimMovedStat });
    for (const sk of [1, 1.5]) { _currentProfile = { prefs: { pdfLabelScale: sk } }; S.rooms = [K, R]; tegn(K); const a = { ..._dimMovedStat }; tegn(R); const b = { ..._dimMovedStat };
      check(`C2: L-rommet (240) og rektangelet, skala ${sk}: ingen veggmål flyttes (ser ut som før)`, "0 / 0", a.wallMoved === 0 && a.wallHidden === 0 && b.wallMoved === 0 && b.wallHidden === 0, [a, b]);
      check(`C3: L-rommets korte kjedeledd flyttes fortsatt (240 urørt), skala ${sk}`, "≥ 7", a.moved >= 7, a); }
    _currentProfile = null; S.rooms = alle;
    // D · skjermen: rommet fyller lerretet og sterkt utzoomet — ingen måltekster overlapper (veggmål kan skjules)
    const skjerm = (room, f) => {
      const xs = room.points.map(p => p.x), ys = room.points.map(p => p.y), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
      S.view.zoom = f * Math.min(_cvW() / (w + 320), _cvH() / (h + 320)) / BASE_SCALE; S.view.panX = (Math.max(...xs) + Math.min(...xs)) / 2; S.view.panY = (Math.max(...ys) + Math.min(...ys)) / 2;
      S.rooms = [room];
      const cap = _pdfCapStart(room); let stat;
      try { render(); stat = { ..._dimMovedStat }; } finally { _pdfCapStop(); S.rooms = alle; }
      return { tx: cap.boxes.filter(t => tall(t) || vegg(t)), stat };
    };
    if (_cvW() >= 400 && _cvH() >= 300) {
      for (const room of alle) for (const f of [1, 0.3]) {
        const a = skjerm(room, f), pa = par(a.tx, tall), m = mangler(veggmaal(room), a.tx.filter(tall).map(t => t.str));
        check(`D: skjerm «${room.name}», zoom × ${f}: ingen måltekster overlapper`, "0 par", pa.length === 0, [pa, a.stat]);
        check(`D: skjerm «${room.name}», zoom × ${f}: veggmål som mangler er talt som skjult`, "mangler ≤ skjult", m.length <= a.stat.wallHidden, [m, a.stat]);
      }
      const r1 = skjerm(R, 1);
      check("D: skjerm, rektangelet fyller lerretet: ingen veggmål flyttet eller skjult", "0 / 0", r1.stat.wallMoved === 0 && r1.stat.wallHidden === 0, r1.stat);
    } else check("D: skjerm — lerretet er ikke synlig i denne kjøringen (hoppet over)", "-", true, [_cvW(), _cvH()]);
  } catch (e) {
    results.push({ name: "UNNTAK", ok: false, expected: "-", got: String(e && e.stack || e) });
  } finally {
    Object.assign(S, { rooms: saved.rooms, strips: saved.strips, foilFree: saved.foilFree, cables: saved.cables, mats: saved.mats, matPaths: saved.matPaths,
      hindrings: saved.hindrings, stairs: saved.stairs, floors: saved.floors, project: saved.project, floatingDims: saved.floatingDims });
    Object.assign(S.counters, saved.counters); Object.assign(S.view, saved.view);
    S.ui.activeFloorId = saved.activeFloorId; S.ui.activePartId = saved.activePartId; S.ui.selectedRoomId = saved.selectedRoomId; S.ui.selectedDimId = saved.selectedDimId; S.ui.selectedAnnot = saved.selectedAnnot;
    HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(...saved.prods);
    PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push(...saved.cats);
    if (saved.profile !== undefined) _currentProfile = saved.profile;
    window._performAutoSave = saved.autoSave; window._scheduleAutoSave = saved.sched; window._showToast = saved.toast;
    if (typeof _rebuildActiveFloorRoomIds === "function") _rebuildActiveFloorRoomIds();
    _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache(); _invalidateMatCache && _invalidateMatCache();
    try { renderSidebar(); updateCtxBar(); render(); } catch (e) {}
  }
  const allOk = results.every(r => r.ok);
  console[allOk ? "log" : "error"](`_wallDimNoOverlapRegressionTest243: ${allOk ? "BESTÅTT" : "FEILET"} (${results.filter(r => r.ok).length}/${results.length})`, results.filter(r => !r.ok));
  return { ok: allOk, results };
}
