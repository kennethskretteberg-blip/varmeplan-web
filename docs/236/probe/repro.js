// 236: gjenskaper feilene. Fryserom 600 x 800 satt (a) med setRoomType (hoyreklikk/sidepanel) og
// (b) med _upcRoomTypeChanged (varmepanelet), deretter auto-utlegg med InFloor 10T. Leser rommet,
// kablene og tekstene maalekjeden tegner.
(async () => {
  await _loadProducts();
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  const ut = {};
  const kab = HEATING_PRODUCTS.filter(q => /InFloor 10T/.test((q.product_family || "") + " " + (q.name || "")) && _isCableProductId(q.id));
  ut.produkter = kab.length;
  const bygg = (vei) => {
    _resetProjectState(); S.project.name = "Test 236";
    document.getElementById("app").style.display = "flex"; resizeCanvas();
    S.ui.theme = "light"; document.body.classList.add("light-theme"); if (typeof _gridColorsCache !== "undefined") _gridColorsCache = null;
    const fid = (S.floors[0] || {}).id || null, part = (S.project.parts || [])[0];
    const PTS = [{ x: 0, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 800 }, { x: 0, y: 800 }];
    const RID = 996001;
    S.rooms = [{ id: RID, name: "Fryselager", floorId: fid, partId: part ? part.id : null, shape: "rect", wallThicknessCm: 0,
      points: PTS.map(q => ({ ...q })), walls: compWalls(PTS), dims: [], area: Math.abs(compArea(PTS)), roomType: null, targetWm2: null }];
    S.cables = []; S.hindrings = []; S.ui.selectedRoomId = RID;
    if (vei === "hoyreklikk") setRoomType(RID, "fryserom");
    else if (vei === "varmepanel") _upcRoomTypeChanged("fryserom");
    else if (vei === "bad") setRoomType(RID, "bathroom");
    const room = S.rooms[0];
    const w = room.area / 10000 * (room.targetWm2 || 100);
    const prod = kab.slice().sort((a, b) => Math.abs(a.total_effect_w - w) - Math.abs(b.total_effect_w - w))[0];
    let c = null, feil = null;
    try { c = autoFillCable(RID, prod.id); } catch (e) { feil = String(e.message); }
    if (c) { c.id = S.counters.nextCableId++; S.cables.push(c); }
    _invalidateCableCache();
    room.cableDimSnap = true;
    return { room, prod, feil };
  };
  const les = (room) => {
    const cabs = S.cables.filter(c => c.roomId === room.id);
    const tekst = []; const ft = ctx.fillText; ctx.fillText = function (t, ...q) { tekst.push(String(t)); return ft.call(this, t, ...q); };
    let lay = null;
    try { _dimLayoutMemo.clear(); _drawCableDimChainForRoom(room); lay = _cableDimChainLayout(room); } finally { ctx.fillText = ft; }
    return { roomType: room.roomType, targetWm2: room.targetWm2, reserveCable: room.reserveCable,
      kabler: cabs.map(c => ({ id: c.id, reserve: !!c.reserve, cc: c.spacing_cm, dir: c.direction, runs: (c.runs || []).length, pathEls: (c.pathEls || []).length,
        runEls: (c.pathEls || []).filter(e => e.kind === "run").length, frysM: c._frysMarginCm, pos: (c.runs || []).slice(0, 3).map(r => r.pos_cm),
        forsteRun: ((c.pathEls || []).find(e => e.kind === "run") || null) })),
      margin: cabs[0] ? _effectiveMarginCm(cabs[0].productId, room.id) : null,
      kjedeTekst: tekst, layout: lay ? { across: lay.across.map(a => a.segs), along: lay.along.map(a => a.segs) } : null,
      avvik: _fryseromAvvik(room.id).map(a => a.id) };
  };
  for (const vei of ["hoyreklikk", "varmepanel", "bad"]) {
    const b = bygg(vei);
    ut[vei] = { produkt: b.prod && b.prod.name, feil: b.feil, ...les(b.room) };
    if (vei === "varmepanel") { b.room.reserveCable = true; _invalidateCableCache(); ut.varmepanelMedReserve = les(b.room); }
  }
  return ut;
})()
