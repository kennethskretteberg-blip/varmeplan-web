(async () => {
  try { await _loadProducts(); } catch (e) {}
  const ids = _cableField234Fixture(), ut = {};
  for (const k of ["A", "B", "C"]) {
    const room = S.rooms.find(r => r.id === ids[k]), st = _computeRoomStats(room), m = _cableFieldMeasure(room, 4), info = _cableFieldInfo(room);
    const h2 = (info.ccCm / 2) ** 2;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of room.points) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    const grid = step => { let tot = 0, cov = 0;
      for (let y = y0 + step / 2; y < y1; y += step) for (let x = x0 + step / 2; x < x1; x += step) {
        if (!ptInPoly(x, y, room.points) || info.blockers.some(b => ptInPoly(x, y, b.points))) continue;
        tot++; for (const s of info.segs) if (_distSeg2(x, y, s) <= h2) { cov++; break; }
      } return { tot, cov, m2: +(cov / tot * st.nettoM2).toFixed(4), raaM2: cov * step * step / 10000 }; };
    ut[k] = { tegnet: +(m.areaCm2 / 10000).toFixed(4), tall: +st.cableAreaM2.toFixed(4), steg: Math.max(info.ccCm / 2, 5), grov: grid(Math.max(info.ccCm / 2, 5)), fin1cm: grid(1), fin05: grid(0.5) };
  }
  return ut;
})()
