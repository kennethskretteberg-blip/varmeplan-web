import { bytt, skriv } from './patch.mjs';
bytt(`      const inside = (sx, sy) => { const w = s2w(sx, sy); return ptInPoly(w.x, w.y, pts); };`,
     `      // På kanten teller som inne: T-endene står nøyaktig på nabosidenes linje (ptInPoly er eksklusiv der).
      const inside = (sx, sy) => { const w = s2w(sx, sy); return ptInPoly(w.x, w.y, pts) || _hindDimOnEdge(w.x, w.y, pts, 0.05); };`);
bytt(`// Gamle mål (før 217) har ingen hid: finn hindringen som eier siden p1→p2.`,
     `function _hindDimOnEdge(x, y, pts, tol) {
  for (let i = 0, n = pts.length; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; if (distSeg(x, y, a.x, a.y, b.x, b.y) <= tol) return true; }
  return false;
}
// Gamle mål (før 217) har ingen hid: finn hindringen som eier siden p1→p2.`);
skriv();
