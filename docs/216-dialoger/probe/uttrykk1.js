(async () => {
  const ut = {};
  try { const f = _computeFoilContext(); ut.foil = f && f.stripCount; } catch (e) { ut.foilFeil = String(e.message); }
  try { const c = _computeCableContext(); ut.cable = c && c.cableCount; } catch (e) { ut.cableFeil = String(e.message); }
  try { const m = _computeMatContext(); ut.mat = m && m.matCount; } catch (e) { ut.matFeil = String(e.message); }
  let resolved = "nei";
  try { const pr = showAccessoriesModal(); pr.then(v => { resolved = JSON.stringify(v).slice(0, 80); }); } catch (e) { ut.showFeil = String(e.message) + " " + String(e.stack).slice(0, 300); }
  await new Promise(r => setTimeout(r, 2500));
  const o = document.getElementById("modal-accessories");
  ut.resolved = resolved; ut.overlay = !!o; ut.display = o ? o.style.display : null; ut.boks = !!document.querySelector("#modal-accessories > div");
  ut.toast = window.__toast;
  return ut;
})()
