(async () => {
  try { await _loadProducts(); } catch (e) {}
  const w = []; const ow = console.warn; console.warn = (...a) => { w.push(a.map(x => x && x.stack ? x.stack : String(x)).join(' ').slice(0, 600)); };
  const o = _dimFindSpot; const kall = [];
  _dimFindSpot = function (q) { const r = o.apply(this, arguments); kall.push([q.pdf, q.bw, q.bh, q.t0, JSON.stringify(r)]); return r; };
  const t = await _roomTypeRegressionTest236();
  console.warn = ow; _dimFindSpot = o;
  return { w, kall: kall.slice(-12), feil: t.results.filter(r => !r.ok).map(r => r.name + ' ⇒ ' + JSON.stringify(r.got)) };
})()
