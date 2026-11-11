(() => {
  const ut = {};
  for (const id of window.__RIDS) {
    const room = S.rooms.find(r => r.id === id), st = _computeRoomStats(room), m = _cableFieldMeasure(room, 4);
    // Uavhengig fasit: samme modell som _cableCoveredCm2, men 1 cm rutenett
    const info = _cableFieldInfo(room); let fin = 0; const h2 = (info.ccCm / 2) ** 2;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of room.points) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    for (let y = y0 + 0.5; y < y1; y++) for (let x = x0 + 0.5; x < x1; x++) {
      if (!ptInPoly(x, y, room.points) || info.blockers.some(b => ptInPoly(x, y, b.points))) continue;
      for (const s of info.segs) if (_distSeg2(x, y, s) <= h2) { fin++; break; }
    }
    ut[room.name] = { tegnetM2: +(m.areaCm2 / 10000).toFixed(4), fasit1cmM2: fin / 10000, cableAreaM2: +st.cableAreaM2.toFixed(4), avvikTallPst: +((m.areaCm2 / 10000 / st.cableAreaM2 - 1) * 100).toFixed(2),
      ute: m.ute, sperret: m.sperret, cc: info.ccCm, wm2: st.cableWm2, lengdeXcc: +(st.cableLenM * info.ccCm / 100).toFixed(3) };
  }
  return ut;
})()
