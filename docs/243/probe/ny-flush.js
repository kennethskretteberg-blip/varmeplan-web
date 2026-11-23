// 243: de flyttede tekstene — felles for kjedene (240) og veggmålene (243), så regelen er ÉN.
// pend: [{ str, col, mx, my, isVert, sign, bw, chain (gruppe), line, rid }]. k: { FONT, BOXH, LUFT, LWX,
// pdf, base(sign, RG) = avstand fra linja til første rads senter, label(it, cx, cy, V) tegner
// teksten, wall = telles som veggmål }. Per gruppe, i leddenes rekkefølge, på utsiden med leder.
function _dimFlushMoved(pend, k) {
  if (!pend.length) return;
  const { FONT, BOXH, LUFT, LWX } = k;
  ctx.save();
  ctx.font = `${FONT}px ${CANVAS_NUM_FONT}`;
  const RG = FONT * 0.35;                                 // luft mellom kjedelinje / rader
  const groups = new Map();
  for (const it of pend) { if (!groups.has(it.chain)) groups.set(it.chain, []); groups.get(it.chain).push(it); }
  for (const its of groups.values()) {
    const V = its[0].isVert, sign = its[0].sign, line = its[0].line;
    for (const it of its) it.t = V ? it.my : it.mx;
    its.sort((a, b) => a.t - b.t);
    // Én rad når tekstene kan spres uten å flyttes langt (høyst én tekstbredde fra leddet sitt);
    // ellers fordeles de annenhver / hver tredje / … på flere rader (færrest mulig, høyst 8) —
    // tekstene holder seg da ved kjeden i stedet for å bli skjøvet langt ut til siden.
    let R = 1, want = [];
    for (; R <= 8; R++) {
      let worst = 0;
      for (let j = 0; j < R; j++) {
        const idx = its.map((_, i) => i).filter(i => i % R === j);
        const w = _dimSpread1D(idx.map(i => ({ c: its[i].t, w: its[i].bw + LUFT })));
        idx.forEach((i, n) => { want[i] = w[n]; worst = Math.max(worst, Math.abs(w[n] - its[i].t) / (its[i].bw + LUFT)); });
      }
      if (worst <= 1 || R === 8) break;
    }
    const own = {}, plan = [];
    const base = k.base(sign, RG);
    const rowAt = r => line + sign * (base + r * (BOXH + RG));
    const lastT = {};
    its.forEach((it, i) => {
      const pos = _dimFindSpot({ t0: want[i], mid: it.t, bw: it.bw, bh: BOXH, V, sign, line, rowAt, lastT, luft: LUFT, pdf: k.pdf, pref: i % R, own });
      if (!pos) { _dimMovedStat[k.wall ? "wallHidden" : "hidden"]++; return; }   // bare skjermen: skjules heller enn å kollidere
      _dimMovedStat[k.wall ? "wallMoved" : "moved"]++;
      lastT[pos.r] = pos.t;
      const pc = rowAt(pos.r), cx = V ? pc : pos.t, cy = V ? pos.t : pc, edge = pc - sign * BOXH / 2;
      const a = V ? { x: line, y: it.t } : { x: it.t, y: line }, b = V ? { x: edge, y: pos.t } : { x: pos.t, y: edge };
      ctx.strokeStyle = it.col; ctx.lineWidth = LWX; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      _dimPlaced.leaders.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, own });
      const bx = _dimBoxAt(cx, cy, it.bw, BOXH, V); bx.own = own;
      _dimPlaced.boxes.push(bx);
      plan.push({ it, cx, cy });
    });
    // tekstene tegnes etter ALLE gruppens ledere, så en leder aldri går over en tekst
    for (const pl of plan) {
      const rid0 = _pdfCap ? _pdfCap.rid : undefined;
      if (_pdfCap) _pdfCap.rid = pl.it.rid;               // 228: teksten hører til rommet den ble tegnet for
      k.label(pl.it, pl.cx, pl.cy, V);
      if (_pdfCap) _pdfCap.rid = rid0;
    }
  }
  ctx.restore();
}
