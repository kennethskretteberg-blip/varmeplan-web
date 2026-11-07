(() => { const out = []; const orig = window._generateStairSurfaces; const seen = new Set();
  window._generateStairSurfaces = function (st) { const r = orig.apply(this, arguments);
    if (st.design === 'horseshoe' && r && r.length) { let H = 0, D = 0; r.forEach(s => { D += s.d_cm; if (s.type !== 'landing') H += (s.stepHeight_cm || st.step_height_cm || 17); });
      const k = _stairSideTotalHeightCm(Object.assign({}, st, { surfaces: r }));
      if (k < H + 17) { const key = JSON.stringify(st.horseshoe); if (!seen.has(key)) { seen.add(key); out.push({ hs: st.horseshoe, typer: r.map(s => s.type).join(','), dagens: H + 17, kjede: k }); } } }
    return r; };
  try { _stairHorseshoeRegressionTest(); } finally { window._generateStairSurfaces = orig; }
  return out.map(o => ({ topLevel: o.hs.topLevel, count: o.hs.count, front: o.hs.front_cm, typer: o.typer, dagens: o.dagens, kjede: o.kjede })); })()
