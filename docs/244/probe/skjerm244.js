(async () => {
  try { await _loadProducts(); } catch (e) {}
  for (const id of ["auth-screen","project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  document.getElementById("app").style.display = "flex"; resizeCanvas();
  const modus = location.hash.slice(1);
  const cats = new Set(PRODUCT_CATEGORIES.filter(c => (c.module_type || "foil") === "foil" && c.active !== false).map(c => c.id));
  const fol = HEATING_PRODUCTS.filter(p => cats.has(p.category_id) && p.active !== false).sort((a, b) => (b.width_mm || 0) - (a.width_mm || 0));
  if (fol.length < 3) return "for få folieprodukter i katalogen: " + fol.length;
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mkRoom = (id, navn, pts) => ({ id, floorId: null, partId: null, name: navn, points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
  S.rooms = [mkRoom(1, "Stue", rect(0, 0, 500, 400)), mkRoom(2, "Bad", rect(600, 0, 300, 250))];
  S.floors = []; S.ui.activeFloorId = null; S.cables = []; S.mats = []; S.matPaths = []; S.stairs = []; S.foilFree = [];
  S.project = { name: "244", parts: [], revision: 0 };
  const strip = (id, roomId, p, pos, len) => ({ id, roomId, productId: p.id, direction: "v", pos_cm: pos, start_cm: 5, length_cm: len });
  const a = fol[0], b = fol[1];
  S.strips = modus === "kabel" ? [] : [strip(1, 1, a, 30, 390), strip(2, 1, a, 100, 390), strip(3, 1, a, 170, 390), strip(4, 2, b, 30, 240), strip(5, 2, b, 80, 240)];
  if (modus === "kabel") {
    const kc = new Set(PRODUCT_CATEGORIES.filter(c => c.module_type === "cable").map(c => c.id));
    const k = HEATING_PRODUCTS.find(p => kc.has(p.category_id) && p.active !== false && p.cable_length_m > 0);
    S.cables = [{ id: 1, roomId: 2, productId: k.id, totalLength_cm: k.cable_length_m * 100 }];
    _invalidateCableCache && _invalidateCableCache();
  }
  _invalidateStripCache(); if (typeof _rebuildActiveFloorRoomIds === "function") _rebuildActiveFloorRoomIds();
  try { render(); } catch (e) {}
  showAccessoriesModal();
  const ov = document.getElementById("modal-accessories");
  const sel = ov.querySelector("#acc-foil-add-sel"), knapp = ov.querySelector("#acc-foil-add");
  let valg = null;
  if (modus === "rad" || modus === "kabel") {
    knapp.click(); valg = [...sel.options].map(o => o.textContent);
    sel.value = sel.options[sel.options.length - 1].value; sel.dispatchEvent(new Event("change"));
    const qi = ov.querySelector("[data-foil-manual] input"); qi.value = "20"; qi.blur();
  }
  if (modus === "rad" || modus === "valg") { knapp.click(); valg = valg || [...sel.options].map(o => o.textContent); sel.blur(); }
  ov.querySelector(".vp-modal__body").scrollTop = 0;
  return { modus, tegnet: [a.name, b.name], valg, knapp: !!knapp };
})()
