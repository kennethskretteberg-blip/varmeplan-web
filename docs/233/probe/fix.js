(async () => {
  await _loadProducts();
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  _resetProjectState(); S.project.name = "Testprosjekt 233"; S.project.customer = "Test";
  document.getElementById("app").style.display = "flex"; resizeCanvas();
  S.ui.theme = "light"; document.body.classList.add("light-theme"); if (typeof _gridColorsCache !== "undefined") _gridColorsCache = null;
  const cabCat = PRODUCT_CATEGORIES.filter(c => c.module_type === "cable").map(c => c.id);
  const kand = HEATING_PRODUCTS.filter(q => cabCat.includes(q.category_id) && q.product_family && q.product_family !== FRYSEROM.godkjentFamilie && q.cable_length_m >= 60 && q.cable_length_m <= 130);
  const CAB = kand[0];
  if (!CAB) return { feil: "fant ingen kabel", fam: [...new Set(HEATING_PRODUCTS.map(q => q.product_family))] };
  const fid = (S.floors[0] || {}).id || null, part = (S.project.parts || [])[0];
  const RID = 995001, PTS = [{x:0,y:0},{x:600,y:0},{x:600,y:800},{x:0,y:800}];
  S.rooms = [{ id: RID, name: "Fryselager", floorId: fid, partId: part ? part.id : null, shape: "rect", wallThicknessCm: 0,
    points: PTS.map(q => ({...q})), walls: compWalls(PTS), dims: [], area: Math.abs(compArea(PTS)), roomType: "fryserom", targetWm2: 25, reserveCable: false }];
  const cc = 40, n = 14, L = CAB.cable_length_m * 100, runLen = Math.min(740, (L - (n - 1) * Math.PI * cc / 2) / n);
  const runs = []; for (let i = 0; i < n; i++) runs.push({ pos_cm: 40 + i * cc, segments: [{ start_cm: 30, end_cm: 30 + runLen }] });
  S.cables = [{ id: S.counters.nextCableId++, roomId: RID, productId: CAB.id, direction: "v", spacing_cm: cc, totalLength_cm: L, runs }];
  _invalidateCableCache();
  S.ui.selectedRoomId = RID;
  setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render();
  _renderDetailPanel(RID);
  await document.fonts.ready;
  const el = document.getElementById("sb-detail-panel"); el.style.maxHeight = "none"; el.scrollTop = 0;
  const sec = el.querySelector(".sb-detail-section"); const bb = sec.getBoundingClientRect(), hd = el.getBoundingClientRect();
  window.__RID = RID;
  return { produkt: CAB.name, familie: CAB.product_family, avvik: _fryseromAvvik(RID).map(a => a.tekst), mont: _fryseromMontasjeLinjer(),
    blokk: sec.innerText, panel: { x: Math.floor(hd.left), y: Math.floor(hd.top), w: Math.ceil(hd.width), h: Math.ceil(bb.bottom - hd.top) + 6 } };
})()
