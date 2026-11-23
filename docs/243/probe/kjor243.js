(async () => {
  try { await _loadProducts(); } catch (e) {}
  for (const id of ["auth-screen","project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  document.getElementById("app").style.display = "flex"; resizeCanvas();
  const ut = {};
  for (const n of ["_wallDimNoOverlapRegressionTest243", "_dimNoOverlapRegressionTest240"]) { const t = window[n](); ut[n] = { n: t.results.length, ok: t.results.filter(r => r.ok).length, feil: t.results.filter(r => !r.ok).map(r => r.name + " ⇒ " + JSON.stringify(r.got).slice(0, 700)) }; }
  return ut;
})()
