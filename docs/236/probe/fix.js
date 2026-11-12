// 236: to fryserom 600 x 800, begge satt med setRoomType (hoyreklikk). A = auto-lagt (geo-form),
// B = haandlagt (runs-form, CC 40). Begge faar reservekabel. Maalsett kabel paa. Kjorer paa HEAD og etter.
(async () => {
  await _loadProducts();
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  _resetProjectState(); S.project.name = "Testprosjekt 236"; S.project.customer = "Test";
  document.getElementById("app").style.display = "flex"; resizeCanvas();
  S.ui.theme = "light"; document.body.classList.add("light-theme"); if (typeof _gridColorsCache !== "undefined") _gridColorsCache = null;
  const prod = HEATING_PRODUCTS.find(q => /InFloor 10T 1200W/.test(q.name || ""));
  if (!prod) return { feil: "fant ikke InFloor 10T 1200W" };
  const fid = (S.floors[0] || {}).id || null, part = (S.project.parts || [])[0];
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mk = (id, name, PTS) => ({ id, name, floorId: fid, partId: part ? part.id : null, shape: "rect", wallThicknessCm: 0,
    points: PTS.map(q => ({ ...q })), walls: compWalls(PTS), dims: [], annotOffsets: {}, area: Math.abs(compArea(PTS)), roomType: null, targetWm2: null });
  const A = 996101, B = 996102;
  S.rooms = [mk(A, "A Fryserom auto", rect(0, 0, 600, 800)), mk(B, "B Fryserom lagt for hånd", rect(900, 0, 600, 800))];
  S.cables = []; S.hindrings = [];
  S.varmefolie = Object.assign({}, S.varmefolie, { direction: "v", dirExplicit: true, startCorner: "bl" });
  setRoomType(A, "fryserom"); setRoomType(B, "fryserom");
  const c = autoFillCable(A, prod.id); if (c) { c.id = S.counters.nextCableId++; S.cables.push(c); }
  const runs = []; for (let i = 0; i < 14; i++) runs.push({ pos_cm: 940 + i * 40, segments: [{ start_cm: 40, end_cm: 760 }] });
  S.cables.push({ id: S.counters.nextCableId++, roomId: B, productId: prod.id, direction: "v", spacing_cm: 40, totalLength_cm: 12000, runs, connections: [] });
  _invalidateCableCache();
  for (const r of S.rooms) r.cableDimSnap = true;
  S.ui.selectedRoomId = null;
  setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render();
  await document.fonts.ready;
  window.__RIDS = [A, B];
  const ut = { produkt: prod.name };
  for (const [k, id] of [["A", A], ["B", B]]) {
    const room = S.rooms.find(r => r.id === id), t = [], ft = ctx.fillText;
    ctx.fillText = function (s, ...q) { t.push(String(s)); return ft.call(this, s, ...q); };
    try { _dimLayoutMemo.clear(); _drawCableDimChainForRoom(room); } finally { ctx.fillText = ft; }
    const cabs = S.cables.filter(x => x.roomId === id);
    ut[k] = { rom: [room.roomType, room.targetWm2, room.reserveCable].join("|"), kabler: cabs.map(x => (x.reserve ? "reserve" : "hoved") + " cc " + (+x.spacing_cm.toFixed(2)) + (x.runs && x.runs.length ? " runs" : " geo")).join(", "), kjede: t };
  }
  // maaleverktoyet: pekeren 3 px til hoyre for andre hovedstreng i B (x = 980), raster paa
  S.ui.drawMode = "dim"; S.snap.grid = true; S.shiftHeld = false; S.drawing.rectStart = null;
  const rc = canvas.getBoundingClientRect(), s = w2s(980, 430);
  const p = getWorldPos({ clientX: rc.left + (s.x + 3) * rc.width / _cvW(), clientY: rc.top + s.y * rc.height / _cvH() });
  S.shiftHeld = true; const pf = getWorldPos({ clientX: rc.left + (s.x + 3) * rc.width / _cvW(), clientY: rc.top + s.y * rc.height / _cvH() }); S.shiftHeld = false;
  S.ui.drawMode = null;
  ut.maaleverktoy = { streng: 980, medRaster: p, medShift: pf };
  render();
  return ut;
})()
