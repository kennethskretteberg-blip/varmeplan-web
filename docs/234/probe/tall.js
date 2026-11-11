(async () => {
  try { await _loadProducts(); } catch (e) {}
  const src = await (await fetch("/index.html")).text();
  const a = src.indexOf("function _cableField234Fixture()"), b = src.indexOf("\n}\n", a);
  (0, eval)(src.slice(a, b + 2));
  const ids = _cableField234Fixture(), ut = {};
  for (const k of ["A", "B", "C"]) {
    const st = _computeRoomStats(S.rooms.find(r => r.id === ids[k]));
    ut[k] = { bruttoM2: st.bruttoM2, nettoM2: st.nettoM2, cableAreaM2: st.cableAreaM2, heatedM2: st.heatedM2, totalW: st.totalW, cableWm2: st.cableWm2,
      wm2Total: st.wm2Total, wm2Heated: st.wm2Heated, cableLenM: st.cableLenM, reserveCount: st.reserveCount, kabler: S.cables.filter(c => c.roomId === ids[k]).length };
  }
  return JSON.stringify(ut);
})()
