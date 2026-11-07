(() => {
  const T = (n, d) => ({ type: 'steps', stepCount: n, stepDepth_cm: d || 30, stepHeight_cm: 17, width_cm: 100 });
  const L = d => ({ type: 'landing', depth_cm: d, width_cm: 100 });
  const C = { '1 + R120 + 1': [T(1), L(120), T(1)], '1 + R150 + 1': [T(1), L(150), T(1)], '1 + R180 + 1': [T(1), L(180), T(1)],
    '2 + R200 + 2': [T(2), L(200), T(2)], '1 + R150 + R150 + 1': [T(1), L(150), L(150), T(1)], '2 + R300 + R300 + 2': [T(2), L(300), L(300), T(2)] };
  const band = r => r > 8 ? 3 : r > 4 ? 2 : 1, out = {};
  for (const [k, segs] of Object.entries(C)) {
    const st = { segments: segs, buildDirection: 'bottom', step_height_cm: 17 }; st.surfaces = _generateStairSurfaces(st);
    let D = 0, H = 0; for (const s of st.surfaces) { D += s.d_cm; if (s.type !== 'landing') H += (s.stepHeight_cm || st.step_height_cm || 17); }
    const k2 = _stairSideTotalHeightCm(st), rA = D / (H + 17), rB = D / k2;
    out[k] = `D ${D} · H ${H + 17} → ${k2} · r ${rA.toFixed(2)} → ${rB.toFixed(2)} · bånd ${band(rA)} → ${band(rB)}`;
  }
  return out;
})()
