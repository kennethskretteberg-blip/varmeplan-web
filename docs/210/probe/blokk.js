// ═══ 210 · SNITT GJENNOM TAKFOTEN — renneprofil, kabelløp, nedløp over og under bakken, og mål ═══════
// Kenneth 07.11.2026: «Dette er det montøren trenger — ikke 3D.» Snittet tas VED ET NEDLØP (der alt møtes),
// eller midt på et rennestrekk uten nedløp (da uten nedløpsdel). Ett klikk: «Vis snitt» på nedløpet.
//
// Samme oppdeling som trappas mål (_stairGeometryDims regner, _drawStairGeoDims tegner):
//   _takSectionModel(t, on)    ren: tallene — lest fra 206/207/213 (_takDownpipeCable, segments.run_pos), ingen ny formel
//   _takSectionLayout(M)       ren: geometrien i snitt-cm (x ut fra veggen, y opp fra terrenget), med BRUDD —
//                              en 10 m vegg og en Ø100-renne får ikke plass i samme målestokk
//   _takSectionDims(M, L)      ren: målene [{ a, b, label, side:'left'|'right'|'top', level, key }] i snitt-cm
//   _takSectionPaint(c, M, box, o)  tegner i ENHVER 2D-kontekst. Skjerm-innfeltet og PDF-bildet
//                              (_takSectionToImage, som leser hovedlerretet) bruker den samme tegneren.
// Ingen produkter, festeavstander eller watt (T1). Målene fra IceFix-filmen er ikke bekreftet mot datablad.
// Ingenting her lagres, bortsett fra takvinkelen brukeren selv skriver (surfaces[0].pitch_deg).
const TAK_SECTION_MM = { gutterD: 100, pipeD: 80, cableW: 9.75, cableH: 5.5 };   // IceFix-filmen 07.11.2026
const TAK_SECTION_GUTTER_OUT_M = 0.16;   // rennas senter ut fra vegg/takkant (filmen, «I renna»)
const TAK_SECTION_SCHEMATIC_DEG = 30;    // BARE for å tegne når vinkelen er ukjent — skrives aldri som et tall
const TAK_SECTION_SRC = 'Mål fra IceFix-filmen (renne Ø100, nedløp Ø80, kabel 9,75 × 5,5 mm, renne 0,16 m ut) — ikke bekreftet mot datablad.';
const TAK_SECTION_POS_TXT = { bunn: 'bunn', midt: 'midt', hengkant: 'mot hengkant' };
var _takSection = null;     // { fid, on: { type:'DOWNSPOUT'|'GUTTER', id } } — snittet som vises. Transient, lagres aldri.
var _takSectionBox = null;  // skjermboksen innfeltet sist ble tegnet i (× og «klikket svelges»)

/** Stedene et snitt kan tas: hvert nedløp, og midten av hvert rennestrekk som ikke har nedløp. */
function _takSectionTargets(t) {
  const out = [];
  for (const g of _takFeats(t, 'GUTTER')) {
    const ds = _takFeats(t, 'DOWNSPOUT').filter(d => d.gutter === g.id).sort((a, b) => a.at_m - b.at_m);
    for (const d of ds) out.push({ on: { type: 'DOWNSPOUT', id: d.id }, label: `${d.id} · ${g.id} ved ${_takNum(d.at_m)} m` });
    if (!ds.length) out.push({ on: { type: 'GUTTER', id: g.id }, label: `${g.id} midt · ingen nedløp` });
  }
  return out;
}
/** Takvinkelen ved et punkt: flatt tak = 0 · brukerens tall · (møne − gesims) / avstand til mønelinja · ellers ukjent. */
function _takPitch(t, s, pt) {
  const rt = s && s.roof_type && s.roof_type.value;
  if (rt === 'flat') return { deg: 0, src: 'flat', note: 'flatt tak' };
  const pv = s && s.pitch_deg;
  if (pv && pv.value != null && isFinite(pv.value)) return { deg: pv.value, src: 'user', note: 'satt av bruker' };
  const H = (s && s.heights) || {}, ev = H.eave_m && H.eave_m.value, rv = H.ridge_m && H.ridge_m.value;
  const ridge = _takEdgesOf(t, s).find(e => e.type === 'ridge');
  if (ev != null && rv != null && rv > ev && ridge && pt) {
    const dx = ridge.b.x - ridge.a.x, dy = ridge.b.y - ridge.a.y, L = Math.hypot(dx, dy);
    const run = L ? Math.abs((pt.x - ridge.a.x) * dy - (pt.y - ridge.a.y) * dx) / L / 100 : 0;
    if (run > 0.5) return { deg: Math.atan((rv - ev) / run) * 180 / Math.PI, src: 'derived', rise_m: rv - ev, run_m: run,
      note: `(møne − gesims) / avstand til mønet = ${_takNum(rv - ev, 2)} / ${_takNum(run, 2)} m` };
  }
  return { deg: null, src: 'unknown', note: rt === 'pitched' ? 'mangler mønehøyde eller mønelinje' : 'taktype ikke valgt' };
}
/** Ren funksjon: tallene i snittet. `on` = { type:'DOWNSPOUT', id } | { type:'GUTTER', id }. null = finnes ikke. */
function _takSectionModel(t, on) {
  if (!t || !on) return null;
  const s = t.surfaces && t.surfaces[0]; if (!s) return null;
  let g = null, d = null, at = 0;
  if (on.type === 'DOWNSPOUT') { d = _takFeat_(t, on.id); if (!d || d.type !== 'DOWNSPOUT') return null; g = _takFeat_(t, d.gutter); at = d.at_m; }
  else { g = _takFeat_(t, on.id); at = g ? (g.length_m || _takPolyLenM(g.geometry.pts)) / 2 : 0; }
  if (!g || g.type !== 'GUTTER') return null;
  // Ved et nedløp møtes to delstrekk. Profilen er delstrekket som leder INN i nedløpet; i renneenden det som finnes.
  const segs = g.segments || [];
  let sg = segs.find(x => x.from_m < at - 1e-6 && at <= x.to_m + 1e-6) || segs.find(x => x.from_m - 1e-6 <= at && at <= x.to_m + 1e-6) || null;
  const other = d && sg ? segs.find(x => x !== sg && x.from_m - 1e-6 <= at && at <= x.to_m + 1e-6) : null;
  const pt = d && d.geometry && d.geometry.pt ? d.geometry.pt : _takPolyAt(g.geometry.pts, at);
  const ev = (s.heights && s.heights.eave_m) || {};
  const eave = ev.value != null ? ev.value : null;
  let D = null, takfot = eave, outlet = null, end = null;
  if (d) {
    const above = d.above_ground_m ? d.above_ground_m.value : null;
    const below = !!(d.continues_below_ground && d.continues_below_ground.value);
    const under = below && d.below_ground_m ? d.below_ground_m.value : null;
    D = { id: d.id, runs: d.runs, above_m: above, above_prov: d.above_ground_m ? d.above_ground_m.prov : null, below, under_m: under,
          under_prov: below && d.below_ground_m ? d.below_ground_m.prov : null, cable: _takDownpipeCable(d, d.runs) };
    // Nedløpets lengde over bakken måles fra takfoten (206). Ført under bakken: røret går helt ned, så takfoten
    // står `above` over terrenget. Over bakken: takfoten er gesimsen (eller høyere, hvis nedløpet er lengre),
    // og utløpet står det som er igjen over terrenget.
    if (above != null) { takfot = below || eave == null ? above : Math.max(eave, above); outlet = below ? 0 : takfot - above; }
    end = below ? { kind: 'frost', depth_m: under } : { kind: 'tail', tail_m: TAK_DOWNPIPE_TAIL_M };
  }
  return {
    on: { type: on.type, id: on.id }, gutter: g.id, at_m: at, pt: pt ? { x: pt.x, y: pt.y } : null,
    seg: sg ? { id: sg.id, runs: sg.runs, run_pos: (sg.run_pos || []).map(p => ({ at: p.at, deg: p.deg })) } : null,
    otherSeg: other && sg && other.runs !== sg.runs ? { id: other.id, runs: other.runs } : null,
    downspout: D, end, takfot_m: takfot, outlet_m: outlet,
    eave: { value: eave, height_ref: ev.height_ref || 'terreng', prov: ev.prov || null },
    roof_type: s.roof_type && s.roof_type.value || null, pitch: _takPitch(t, s, pt),
    color: _takKursColor(t, g.id) || TAK_FEAT_COLOR.GUTTER, gutterOut_m: TAK_SECTION_GUTTER_OUT_M, mm: { ...TAK_SECTION_MM },
  };
}
function _takSectionTitle(M) {
  if (!M) return '';
  return M.downspout ? `Snitt ved nedløp ${M.downspout.id} · ${M.gutter} ved ${_takNum(M.at_m)} m` : `Snitt midt på ${M.gutter} (${_takNum(M.at_m)} m) · ingen nedløp`;
}
/** Ren funksjon: geometrien i snitt-cm. y = cm over terrenget (opp), x = cm ut fra veggen. Høydene mellom
 *  de interessante områdene (takfoten, utløpet, terrenget, frostfritt nivå) BRYTES: `ymap` gir tegne-cm. */
function _takSectionLayout(M) {
  const mm = M.mm, r = mm.gutterD / 20, pr = mm.pipeD / 20, cw = mm.cableW / 10, ch = mm.cableH / 10;
  const schematic = M.pitch.deg == null;
  const deg = schematic ? TAK_SECTION_SCHEMATIC_DEG : M.pitch.deg, tan = Math.tan(deg * Math.PI / 180);
  const H = (M.takfot_m != null ? M.takfot_m : 3) * 100;
  const gx = M.gutterOut_m * 100, wallT = 20, slab = 4;
  const Rin = tan > 1e-6 ? Math.min(60, 45 / tan) : 60;     // så mye av takflaten som tegnes innover
  const sl = slab / Math.cos(deg * Math.PI / 180);
  const heX = gx - r * 0.5, heY = H - heX * tan;            // hengkanten: takflaten slutter over rennas indre halvdel
  const rimY = heY - 3;                                      // rennekanten 3 cm under hengkanten
  const roofTopY = H + Rin * tan, pipeTop = rimY - r;
  let pipeBot = null, outY = null, cableEnd = null;
  if (M.downspout) {
    if (M.downspout.below) { outY = 0; pipeBot = -(M.downspout.under_m != null ? M.downspout.under_m : TAK_BELOW_GROUND_DEFAULT_M) * 100; cableEnd = pipeBot; }
    else { outY = (M.outlet_m != null ? M.outlet_m : 0) * 100; pipeBot = outY; cableEnd = outY - TAK_DOWNPIPE_TAIL_M * 100; }
  }
  const iv = [[pipeTop - 24, Math.max(roofTopY, H) + 6], [-26, 26]];
  if (M.downspout) iv.push([Math.min(pipeBot, cableEnd) - 22, pipeBot + 24]);
  iv.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const v of iv) { const last = merged[merged.length - 1]; if (last && v[0] - last[1] < 45) last[1] = Math.max(last[1], v[1]); else merged.push(v.slice()); }
  const BRK = 14;
  let acc = 0; const zones = [];
  for (const [lo, hi] of merged) { zones.push({ lo, hi, d0: acc }); acc += (hi - lo) + BRK; }
  const drawH = acc - BRK;
  const ymap = y => {
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i], n = zones[i + 1];
      if (y <= z.hi || !n) return z.d0 + Math.max(z.lo, Math.min(z.hi, y)) - z.lo;
      if (y < n.lo) return z.d0 + (z.hi - z.lo) + BRK * (y - z.hi) / (n.lo - z.hi);
    }
    return 0;
  };
  const breaks = zones.slice(0, -1).map((z, i) => ({ d_lo: z.d0 + z.hi - z.lo, d_hi: zones[i + 1].d0, real: [z.hi, zones[i + 1].lo] }));
  return { r, pr, cw, ch, deg, tan, schematic, H, gx, wallT, slab, sl, Rin, heX, heY, rimY, roofTopY, pipeTop, pipeBot, outY, cableEnd,
           zones, breaks, drawH, ymap, xMin: -Rin, xMax: gx + pr + 6 };
}
/** Ren funksjon: målene, i snitt-cm. Høydene har alltid referansepunktet i teksten (fellesregel). */
function _takSectionDims(M, L) {
  const m = v => _takNum(v, 2) + ' m', dims = [];
  dims.push({ key: 'takfot', a: { x: -L.wallT, y: 0 }, b: { x: 0, y: L.H }, side: 'left', level: 1,
    label: M.takfot_m != null ? `takfot ${m(M.takfot_m)} over terreng` : 'takfot: høyden er ikke kjent' });
  dims.push({ key: 'renne', a: { x: 0, y: L.H }, b: { x: L.gx, y: L.rimY }, side: 'top', level: 1, label: `${m(M.gutterOut_m)} til rennesenter` });
  const D = M.downspout;
  if (D) {
    const x = L.gx + L.pr;
    dims.push({ key: 'over', a: { x, y: L.H }, b: { x, y: L.outY }, side: 'right', level: 2,
      label: D.above_m != null ? `nedløp ${m(D.above_m)} over bakken (fra takfot)` : 'nedløp: lengden er ikke kjent' });
    if (D.below) dims.push({ key: 'under', a: { x, y: 0 }, b: { x, y: L.pipeBot }, side: 'right', level: 2,
      label: D.under_m != null ? `${m(D.under_m)} under bakken` : 'under bakken: ikke satt' });
    else {
      dims.push({ key: 'tail', a: { x, y: L.outY }, b: { x, y: L.cableEnd }, side: 'right', level: 1, label: `${Math.round(TAK_DOWNPIPE_TAIL_M * 100)} cm ut av nedløpet` });
      if (L.outY >= 1) dims.push({ key: 'utlop', a: { x, y: 0 }, b: { x, y: L.outY }, side: 'right', level: 3, label: `utløp ${m(L.outY / 100)} over terreng` });
    }
  }
  return dims;
}
/** Ren funksjon: tekstlinjene under detaljen. */
function _takSectionNotes(M, L) {
  const n = [], D = M.downspout, posTxt = p => `${TAK_SECTION_POS_TXT[p.at] || p.at} (${p.deg}°)`;
  if (M.seg) n.push(`Renna ${M.seg.id}: ${M.seg.runs} løp — ${M.seg.run_pos.map(posTxt).join(' og ')}.`);
  if (M.otherSeg) n.push(`På andre siden av nedløpet (${M.otherSeg.id}): ${M.otherSeg.runs} løp.`);
  if (D) {
    const c = D.cable;
    n.push(`Nedløp ${D.id}: ${D.runs} løp${c ? ` · ${_takNum(c.len_m, 2)} m × ${D.runs}${c.tail_m ? ' + 0,05' : ''} = ${_takNum(c.cable_m, 2)} m kabel` : ' · kabelmeter mangler høyde'}.`);
    n.push(D.below ? `Kabelen slutter på frostfritt nivå, ${D.under_m != null ? _takNum(D.under_m, 2) + ' m' : '? m'} under bakken.`
                   : `Kabelen slutter ${Math.round(TAK_DOWNPIPE_TAIL_M * 100)} cm ut av nedløpet.`);
    n.push('Avlaster ved innløpet: bøyd 90°, strips i hver ende.');
  } else n.push(`Ingen nedløp på ${M.gutter} — snittet er tatt midt på strekket.`);
  const P = M.pitch;
  n.push(P.src === 'flat' ? 'Takvinkel: flatt tak.' : P.src === 'user' ? `Takvinkel ${_takNum(P.deg, 1)}° (satt av bruker).`
       : P.src === 'derived' ? `Takvinkel ≈ ${_takNum(P.deg, 1)}° — ${P.note}.` : `Takvinkel ukjent (${P.note}) — taket er tegnet skjematisk. Skriv vinkelen i panelet.`);
  const e = M.eave;
  n.push(e.value != null ? `Gesims for bygget: ${_takNum(e.value, 2)} m over terreng (${e.prov && e.prov.source === 'USER_CONFIRMED' ? 'rettet' : 'én verdi for hele bygget, ±0,5 m'}).`
                         : 'Gesims for bygget: ikke kjent.');
  if (M.takfot_m != null && e.value != null && Math.abs(M.takfot_m - e.value) > 0.005) n.push(`Takfoten ved snittet: ${_takNum(M.takfot_m, 2)} m over terreng (nedløpets høyde).`);
  n.push('Klips: avstand ikke satt (venter på produkt).');
  if (L && L.breaks.length) n.push('Tegningen er brutt — lengdene står i målene, ikke i målestokk.');
  n.push(TAK_SECTION_SRC);
  return n;
}
/** Tegner snittet i boksen `box` (piksler) i 2D-konteksten `c`. Skjerm og PDF bruker samme kode.
 *  → { gutterCables: [{ at, deg, x, y }], pipeRuns, pipe, cableEnd: {x,y}|null, dims, k } (for testene). */
function _takSectionPaint(c, M, box, o) {
  o = o || {};
  const L = _takSectionLayout(M), dims = _takSectionDims(M, L), notes = _takSectionNotes(M, L);
  const u = Math.max(0.7, box.w / 820);
  const font = (px, w) => `${w || 400} ${Math.max(6, px * u).toFixed(1)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const INK = '#1f2937', DIM = '#475569', col = M.color, info = { gutterCables: [], pipeRuns: 0, pipe: false, cableEnd: null, dims };
  c.save();
  c.beginPath(); c.rect(box.x, box.y, box.w, box.h); c.clip();
  c.lineCap = 'butt'; c.lineJoin = 'round'; c.setLineDash([]);
  const head = 30 * u;
  c.fillStyle = INK; c.font = font(14, 700); c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillText(_takSectionTitle(M), box.x + 12 * u, box.y + head / 2 + 2 * u);
  // ── Hovedsnittet (venstre ~60 %) ──
  const mainW = box.w * 0.6, ml = 44 * u, mr = 158 * u, mt = 40 * u, mb = 14 * u;
  const xSpan = L.xMax - L.xMin;
  const k = Math.min((mainW - ml - mr) / xSpan, (box.h - head - mt - mb) / L.drawH);
  info.k = k;
  const ox = box.x + ml + Math.max(0, (mainW - ml - mr - xSpan * k) / 2), oy = box.y + head + mt;
  const P = (x, y) => ({ x: ox + (x - L.xMin) * k, y: oy + (L.drawH - L.ymap(y)) * k });
  const poly = (pts, close) => { c.beginPath(); pts.forEach((p, i) => { const q = P(p[0], p[1]); i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y); }); if (close) c.closePath(); };
  const lw = v => Math.max(1, v * u);
  const yLow = L.zones[0].lo;
  // Terrenget
  poly([[L.xMin - 4, 0], [L.xMax + 4, 0], [L.xMax + 4, yLow], [L.xMin - 4, yLow]], true); c.fillStyle = '#efe9df'; c.fill();
  { const a = P(L.xMin - 4, 0), b = P(L.xMax + 4, 0);
    c.strokeStyle = '#78716c'; c.lineWidth = lw(2); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    c.lineWidth = lw(0.8); c.beginPath(); for (let x = a.x + 4 * u; x < b.x; x += 9 * u) { c.moveTo(x, a.y); c.lineTo(x - 6 * u, a.y + 6 * u); } c.stroke();
    c.fillStyle = DIM; c.font = font(10); c.textAlign = 'left'; c.textBaseline = 'bottom'; c.fillText('terreng', a.x + 2 * u, a.y - 2 * u); }
  // Veggen (skjematisk tykkelse) og takflaten med vinkelen
  poly([[-L.wallT, -20], [0, -20], [0, L.H - L.sl], [-L.wallT, L.H + L.wallT * L.tan - L.sl]], true);
  c.fillStyle = '#e5e7eb'; c.fill(); c.strokeStyle = '#9ca3af'; c.lineWidth = lw(1); c.stroke();
  poly([[L.xMin, L.roofTopY], [L.heX, L.heY], [L.heX, L.heY - L.sl], [L.xMin, L.roofTopY - L.sl]], true);
  c.fillStyle = '#cbd5e1'; c.fill(); c.strokeStyle = '#64748b'; c.lineWidth = lw(1); c.stroke();
  poly([[L.xMin, L.roofTopY], [L.heX, L.heY]]); c.strokeStyle = INK; c.lineWidth = lw(2); c.stroke();
  { const q = P(L.xMin + 4, L.roofTopY - (4 * L.tan) + 3);
    c.fillStyle = L.schematic ? '#b45309' : DIM; c.font = font(10, 600); c.textAlign = 'left'; c.textBaseline = 'bottom';
    c.fillText(L.schematic ? 'takflate · vinkel ukjent (skjematisk)' : M.pitch.src === 'flat' ? 'flatt tak' : `takflate ${_takNum(L.deg, 1)}°`, q.x, q.y - 4 * u);
    const he = P(L.heX, L.heY); c.fillStyle = DIM; c.font = font(9); c.textAlign = 'left'; c.textBaseline = 'bottom';
    c.beginPath(); c.arc(he.x, he.y, 2 * u, 0, Math.PI * 2); c.fill(); }
  // Renna: halvrund. Med nedløp: hull i bunnen der røret går ned.
  const pc = P(L.gx, L.rimY), R = L.r * k;
  c.strokeStyle = INK; c.lineWidth = lw(1.8);
  if (M.downspout) { const a1 = Math.acos(L.pr / L.r); c.beginPath(); c.arc(pc.x, pc.y, R, 0, a1); c.stroke(); c.beginPath(); c.arc(pc.x, pc.y, R, Math.PI - a1, Math.PI); c.stroke(); }
  else { c.beginPath(); c.arc(pc.x, pc.y, R, 0, Math.PI); c.stroke(); }
  for (const sx of [-1, 1]) { c.beginPath(); c.arc(pc.x + sx * R, pc.y, Math.max(1.2 * u, 0.5 * k), 0, Math.PI * 2); c.fillStyle = INK; c.fill(); }
  // Kabelløpene i renna — flate, i riktig forhold, på innsiden av profilen. «Mot hengkant» = mot veggen.
  const cableAt = (cx, cy, Rp, p, scale) => {
    const side = p.at === 'hengkant' ? -1 : 1, phi = p.deg * Math.PI / 180;
    const ux = side * Math.cos(phi), uy = Math.sin(phi);                 // radielt ut (skjerm: y ned)
    const w = Math.max(4 * u, L.cw * scale), h = Math.max(2.2 * u, L.ch * scale), rr = Rp - h / 2 - lw(1);
    const x = cx + ux * rr, y = cy + uy * rr, vx = -uy, vy = ux;
    c.beginPath();
    [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(([a, b], i) => { const px = x + vx * a * w / 2 + ux * b * h / 2, py = y + vy * a * w / 2 + uy * b * h / 2; i ? c.lineTo(px, py) : c.moveTo(px, py); });
    c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = '#0f172a'; c.lineWidth = Math.max(0.6, 0.6 * u); c.stroke();
    return { x, y };
  };
  for (const p of (M.seg ? M.seg.run_pos : [])) { const q = cableAt(pc.x, pc.y, R, p, k); info.gutterCables.push({ at: p.at, deg: p.deg, x: q.x, y: q.y }); }
  // Nedløpet med kabelen i
  const labels = [];
  if (M.downspout) {
    info.pipe = true;
    const yTopPipe = L.rimY - Math.sqrt(L.r * L.r - L.pr * L.pr);
    poly([[L.gx - L.pr, yTopPipe], [L.gx + L.pr, yTopPipe], [L.gx + L.pr, L.pipeBot], [L.gx - L.pr, L.pipeBot]], true);
    c.fillStyle = 'rgba(241,245,249,0.9)'; c.fill();
    c.strokeStyle = INK; c.lineWidth = lw(1.4);
    poly([[L.gx - L.pr, yTopPipe], [L.gx - L.pr, L.pipeBot]]); c.stroke();
    poly([[L.gx + L.pr, yTopPipe], [L.gx + L.pr, L.pipeBot]]); c.stroke();
    if (M.downspout.below) {
      const a = P(L.gx - 18, L.pipeBot), b = P(L.gx + L.pr + 4, L.pipeBot);
      c.save(); c.setLineDash([5 * u, 4 * u]); c.strokeStyle = '#1d4ed8'; c.lineWidth = lw(1.2); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); c.restore();
      c.fillStyle = '#1d4ed8'; c.font = font(9, 600); c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText('frostfritt nivå', a.x - 3 * u, a.y);
    } else { const a = P(L.gx - L.pr, L.pipeBot), b = P(L.gx + L.pr, L.pipeBot); c.lineWidth = lw(2.4); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    const n = M.downspout.runs === 2 ? 2 : 1, off = 1.6, yTop = L.pipeTop + 0.8, lwc = Math.max(2.2 * u, L.ch * k);
    info.pipeRuns = n;
    c.strokeStyle = col; c.lineWidth = lwc; c.lineCap = 'round';
    if (n === 2) {
      const r0 = Math.max(off * k, 3 * u), e = P(L.gx, L.cableEnd), ee = { x: e.x, y: e.y - r0 };
      const t1 = P(L.gx - off, yTop), t2 = P(L.gx + off, yTop);
      c.beginPath(); c.moveTo(t1.x, t1.y); c.lineTo(ee.x - r0, ee.y); c.arc(ee.x, ee.y, r0, Math.PI, 0, true); c.lineTo(t2.x, t2.y); c.stroke();
    } else {
      const t1 = P(L.gx, yTop), e = P(L.gx, L.cableEnd);
      c.beginPath(); c.moveTo(t1.x, t1.y); c.lineTo(e.x, e.y); c.stroke();
      c.lineCap = 'butt'; c.lineWidth = lw(2.5); c.strokeStyle = '#0f172a'; c.beginPath(); c.moveTo(e.x - 4 * u, e.y); c.lineTo(e.x + 4 * u, e.y); c.stroke();
    }
    c.lineCap = 'butt';
    const ce = P(L.gx, L.cableEnd); info.cableEnd = { x: ce.x, y: ce.y };
    c.beginPath(); c.arc(ce.x, ce.y, 5 * u, 0, Math.PI * 2); c.strokeStyle = '#dc2626'; c.lineWidth = lw(1.6); c.stroke();
    labels.push({ y: ce.y, ax: ce.x, ay: ce.y, lines: M.downspout.below ? ['kabelen slutter på', 'frostfritt nivå'] : ['kabelen slutter', `${Math.round(TAK_DOWNPIPE_TAIL_M * 100)} cm ut av nedløpet`], color: '#b91c1c' });
    // Avlasteren ved innløpet: bøyd 90°, strips i hver ende.
    const ax = L.gx + (n === 1 ? 2.2 : 0), ay = L.pipeTop + 1.4;
    const A = P(ax + 3.4, ay), B = P(ax, ay), C = P(ax, ay - 12);
    c.strokeStyle = '#374151'; c.lineWidth = Math.max(2 * u, 0.4 * k); c.lineJoin = 'miter';
    c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.lineTo(C.x, C.y); c.stroke(); c.lineJoin = 'round';
    c.lineWidth = lw(1.6); c.strokeStyle = '#0f172a';
    c.beginPath(); c.moveTo(A.x, A.y - 3 * u); c.lineTo(A.x, A.y + 3 * u); c.moveTo(C.x - 3 * u, C.y); c.lineTo(C.x + 3 * u, C.y); c.stroke();
    labels.push({ y: C.y, ax: C.x, ay: C.y, lines: ['avlaster, bøyd 90°', 'strips i hver ende'], color: DIM });
    labels.push({ y: P(0, L.H - 60).y, ax: P(L.gx + L.pr, L.pipeTop - 30).x, ay: P(L.gx + L.pr, L.pipeTop - 30).y, lines: [`nedløp Ø${M.mm.pipeD}`, `${n} løp`], color: DIM });
  }
  labels.push({ y: pc.y - R - 6 * u, ax: pc.x + R, ay: pc.y, lines: [`renne Ø${M.mm.gutterD}`, M.seg ? `${M.seg.runs} løp (${M.seg.id})` : 'ingen delstrekk'], color: col });
  // Bruddene: hvitt bånd + bruddlinje.
  for (const b of L.breaks) {
    const y1 = oy + (L.drawH - b.d_hi) * k, y2 = oy + (L.drawH - b.d_lo) * k, x1 = P(L.xMin - 4, 0).x, x2 = P(L.xMax + 4, 0).x;
    c.fillStyle = '#ffffff'; c.fillRect(x1 - 2, y1 + 1, x2 - x1 + 4, y2 - y1 - 2);
    c.strokeStyle = '#6b7280'; c.lineWidth = lw(1);
    for (const yy of [y1 + 1, y2 - 1]) {
      const m = (x1 + x2) / 2, z = 5 * u;
      c.beginPath(); c.moveTo(x1, yy); c.lineTo(m - z, yy); c.lineTo(m - z / 2, yy - z); c.lineTo(m + z / 2, yy + z); c.lineTo(m + z, yy); c.lineTo(x2, yy); c.stroke();
    }
  }
  // Ledetekster i kolonnen til høyre for målene.
  const xLab = P(L.xMax, 0).x + 58 * u;
  labels.sort((a, b) => a.y - b.y);
  let yPrev = -1e9;
  c.font = font(9.5, 600); c.textAlign = 'left'; c.textBaseline = 'top';
  for (const lb of labels) {
    const y = Math.max(lb.y - 6 * u, yPrev + 4 * u);
    c.strokeStyle = 'rgba(100,116,139,0.55)'; c.lineWidth = Math.max(0.6, 0.7 * u);
    c.beginPath(); c.moveTo(lb.ax, lb.ay); c.lineTo(xLab - 3 * u, y + 6 * u); c.stroke();
    c.fillStyle = lb.color; lb.lines.forEach((t, i) => c.fillText(t, xLab, y + i * 12 * u));
    yPrev = y + lb.lines.length * 12 * u;
  }
  // Målene — samme uttrykk som trappas geometrimål: grå, tikk i endene, korte hjelpelinjer, tall midt på.
  c.save();
  c.strokeStyle = '#4b5563'; c.fillStyle = '#374151'; c.font = font(9.5, 600);
  const base = 12 * u, step = 15 * u, tk = 3.5 * u, xL = P(L.xMin, 0).x, xR = P(L.xMax, 0).x, yT = P(0, L.roofTopY).y;
  for (const d of dims) {
    const ea = P(d.a.x, d.a.y), eb = P(d.b.x, d.b.y);
    let a, b;
    if (d.side === 'left') { const x = xL - base - (d.level - 1) * step; a = { x, y: ea.y }; b = { x, y: eb.y }; }
    else if (d.side === 'right') { const x = xR + base + (d.level - 1) * step; a = { x, y: ea.y }; b = { x, y: eb.y }; }
    else { const y = Math.min(yT, ea.y, eb.y) - base - (d.level - 1) * step; a = { x: ea.x, y }; b = { x: eb.x, y }; }
    c.globalAlpha = 0.35; c.lineWidth = Math.max(0.6, 0.8 * u);
    c.beginPath(); c.moveTo(ea.x, ea.y); c.lineTo(a.x, a.y); c.moveTo(eb.x, eb.y); c.lineTo(b.x, b.y); c.stroke();
    c.globalAlpha = 1;
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    c.beginPath();
    if (d.side === 'top') { c.moveTo(a.x, a.y - tk); c.lineTo(a.x, a.y + tk); c.moveTo(b.x, b.y - tk); c.lineTo(b.x, b.y + tk); }
    else { c.moveTo(a.x - tk, a.y); c.lineTo(a.x + tk, a.y); c.moveTo(b.x - tk, b.y); c.lineTo(b.x + tk, b.y); }
    c.stroke();
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, tw = c.measureText(d.label).width, span = Math.hypot(b.x - a.x, b.y - a.y);
    if (d.side === 'top') { c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText(d.label, mx, my - 2 * u); }
    else if (span >= tw + 6 * u) {
      c.save(); c.translate(mx + (d.side === 'left' ? -2 * u : 2 * u), my); c.rotate(-Math.PI / 2);
      c.textAlign = 'center'; c.textBaseline = d.side === 'left' ? 'bottom' : 'top'; c.fillText(d.label, 0, 0); c.restore();
    } else {
      // For kort for et rotert tall (5 cm-halen): vannrett, ved siden av.
      c.textAlign = d.side === 'left' ? 'right' : 'left'; c.textBaseline = 'middle';
      c.fillStyle = '#b91c1c'; c.fillText(d.label, d.side === 'left' ? a.x - 4 * u : a.x + 5 * u, my); c.fillStyle = '#374151';
    }
  }
  c.restore();
  // ── Høyre kolonne: renneprofilen i detalj + notatene ──
  const sx = box.x + mainW + 8 * u, sw = box.w - mainW - 18 * u, sy = box.y + head;
  c.strokeStyle = '#e2e8f0'; c.lineWidth = 1; c.beginPath(); c.moveTo(sx - 6 * u, sy); c.lineTo(sx - 6 * u, box.y + box.h - 8 * u); c.stroke();
  c.fillStyle = INK; c.font = font(11, 700); c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText(`Renneprofil Ø${M.mm.gutterD} (detalj)`, sx, sy + 2 * u);
  const dh = Math.min(box.h * 0.42, sw * 0.62), Rd = Math.min(sw * 0.26, dh * 0.5);
  const dcx = sx + sw * 0.5, dcy = sy + 22 * u + Rd * 0.55, sc = Rd / L.r;
  // Takflaten inn mot hengkanten (fra venstre = veggsiden).
  { const hx = dcx - L.r * 0.5 * sc, hy = dcy - 3 * sc, len = Rd * 1.25, ca = Math.cos(L.deg * Math.PI / 180), sa = Math.sin(L.deg * Math.PI / 180);
    c.beginPath(); c.moveTo(hx - len * ca, hy - len * sa); c.lineTo(hx, hy); c.lineTo(hx, hy + L.sl * sc * 0.6); c.lineTo(hx - len * ca, hy - len * sa + L.sl * sc * 0.6); c.closePath();
    c.fillStyle = '#cbd5e1'; c.fill(); c.strokeStyle = '#64748b'; c.lineWidth = lw(1); c.stroke();
    c.fillStyle = DIM; c.font = font(9); c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText('hengkant', hx - 3 * u, hy - 3 * u); }
  c.strokeStyle = INK; c.lineWidth = lw(2.2);
  if (M.downspout) {
    const a1 = Math.acos(L.pr / L.r);
    c.beginPath(); c.arc(dcx, dcy, Rd, 0, a1); c.stroke(); c.beginPath(); c.arc(dcx, dcy, Rd, Math.PI - a1, Math.PI); c.stroke();
    const yy = dcy + Math.sqrt(L.r * L.r - L.pr * L.pr) * sc;
    c.lineWidth = lw(1.4); c.beginPath(); c.moveTo(dcx - L.pr * sc, yy); c.lineTo(dcx - L.pr * sc, yy + Rd * 0.35); c.moveTo(dcx + L.pr * sc, yy); c.lineTo(dcx + L.pr * sc, yy + Rd * 0.35); c.stroke();
  } else { c.beginPath(); c.arc(dcx, dcy, Rd, 0, Math.PI); c.stroke(); }
  c.save(); c.setLineDash([3 * u, 3 * u]); c.strokeStyle = '#94a3b8'; c.lineWidth = Math.max(0.6, 0.8 * u);
  c.beginPath(); c.moveTo(dcx - Rd - 6 * u, dcy); c.lineTo(dcx + Rd + 6 * u, dcy); c.stroke(); c.restore();
  info.detail = [];
  for (const [i, p] of (M.seg ? M.seg.run_pos : []).entries()) {
    const q = cableAt(dcx, dcy, Rd, p, sc); info.detail.push({ at: p.at, deg: p.deg, x: q.x, y: q.y });
    c.save(); c.setLineDash([2 * u, 3 * u]); c.strokeStyle = '#94a3b8'; c.lineWidth = Math.max(0.6, 0.8 * u);
    c.beginPath(); c.moveTo(dcx, dcy); c.lineTo(q.x, q.y); c.stroke(); c.restore();
    const side = p.at === 'hengkant' ? -1 : 1, phi = p.deg * Math.PI / 180, tx = dcx + side * Math.cos(phi) * (Rd + 10 * u), ty = dcy + Math.sin(phi) * (Rd + 10 * u);
    c.fillStyle = col; c.font = font(9.5, 700); c.textAlign = p.deg >= 80 ? 'center' : side < 0 ? 'right' : 'left'; c.textBaseline = p.deg >= 80 ? 'top' : 'middle';
    c.fillText(`løp ${i + 1} · ${TAK_SECTION_POS_TXT[p.at] || p.at} ${p.deg}°`, tx, ty + (p.deg >= 80 && M.downspout ? Rd * 0.38 : 0));
  }
  // Notatene
  let ny = dcy + Rd + (M.downspout ? Rd * 0.38 + 22 * u : 24 * u);
  c.font = font(9.5); c.textAlign = 'left'; c.textBaseline = 'top';
  const wrap = (txt) => { const w = txt.split(' '), out = []; let line = ''; for (const x of w) { const t2 = line ? line + ' ' + x : x; if (c.measureText(t2).width > sw && line) { out.push(line); line = x; } else line = t2; } if (line) out.push(line); return out; };
  for (const t of notes) {
    const warnLine = /ukjent|ikke kjent|ikke satt|mangler/.test(t) && !/^Klips/.test(t);
    c.fillStyle = t === TAK_SECTION_SRC ? '#64748b' : warnLine ? '#b45309' : INK;
    for (const l of wrap(t)) { if (ny > box.y + box.h - 12 * u) break; c.fillText(l, sx, ny); ny += 12.5 * u; }
    ny += 3 * u;
  }
  c.restore();
  info.notes = notes; info.layout = L;
  return info;
}

// ── På skjermen: innfelt snitt oppå tegningen (ikke i PDF-modus) ──
function _takSectionActive() {
  const S0 = _takSection; if (!S0 || S0.fid !== S.ui.activeFloorId || !_takPartOfFloor(S0.fid)) return null;
  return _takSectionModel(_takOf(S0.fid), S0.on);
}
function _takDrawSectionInset() {
  _takSectionBox = null;
  if (S.ui && S.ui._pdfMode) return;
  const M = _takSectionActive(); if (!M) return;
  const w = Math.max(420, Math.min(860, canvas.width * 0.62)), h = Math.max(300, Math.min(w * 0.66, canvas.height - 32));
  const box = { x: canvas.width - w - 16, y: 16, w, h };
  ctx.save();
  ctx.shadowColor = 'rgba(15,23,42,0.25)'; ctx.shadowBlur = 14; ctx.fillStyle = '#ffffff';
  ctx.fillRect(box.x, box.y, box.w, box.h); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
  ctx.restore();
  const info = _takSectionPaint(ctx, M, box, {});
  const cl = { x: box.x + box.w - 26, y: box.y + 6, s: 20 };
  ctx.save(); ctx.fillStyle = '#f1f5f9'; ctx.fillRect(cl.x, cl.y, cl.s, cl.s); ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(cl.x + 6, cl.y + 6); ctx.lineTo(cl.x + cl.s - 6, cl.y + cl.s - 6); ctx.moveTo(cl.x + cl.s - 6, cl.y + 6); ctx.lineTo(cl.x + 6, cl.y + cl.s - 6); ctx.stroke(); ctx.restore();
  _takSectionBox = { ...box, close: cl, info };
}
/** Klikk i innfeltet tilhører innfeltet (ikke tegningen under). × lukker. */
function _takSectionMouseDown(e) {
  const B = _takSectionBox; if (!B || e.button !== 0) return false;
  const { x, y } = _evToCanvas(e);
  if (x < B.x || x > B.x + B.w || y < B.y || y > B.y + B.h) return false;
  if (x >= B.close.x && x <= B.close.x + B.close.s && y >= B.close.y && y <= B.close.y + B.close.s) _takSectionClose();
  e.preventDefault && e.preventDefault();
  return true;
}
function _takSectionShow(fid, type, id) {
  const same = _takSection && _takSection.fid === fid && _takSection.on.type === type && _takSection.on.id === id;
  _takSection = same ? null : { fid, on: { type, id } };
  if (!same && type === 'DOWNSPOUT') _takFeatSel = { fid, id };
  renderSidebar(); markDirty(); render();
}
function _takSectionClose() { _takSection = null; _takSectionBox = null; renderSidebar(); markDirty(); render(); }
/** Takvinkelen brukeren skriver. Tomt felt = tilbake til utregnet/ukjent. Lagres på takflaten med opphav. */
function _takSetPitch(fid, str) {
  const t = _takFeatMut(fid), s = t && t.surfaces && t.surfaces[0]; if (!s) { renderSidebar(); return false; }
  const raw = String(str == null ? '' : str).trim();
  if (raw === '') { if (!s.pitch_deg) return false; pushUndo(); delete s.pitch_deg; _takFeatDone(t); return true; }
  const v = _takParse(raw);
  if (v == null || v < 0 || v > 75) { _showToast && _showToast('Skriv takvinkelen i grader, 0–75', 'warn'); renderSidebar(); return false; }
  if (s.pitch_deg && Math.abs(s.pitch_deg.value - v) < 1e-9) return false;
  pushUndo();
  s.pitch_deg = { value: v, prov: { source: 'USER_CONFIRMED', confidence: 1, note: 'satt av bruker (210)' } };
  _takFeatDone(t);
  return true;
}
/** Panelet: «Snitt gjennom takfoten» — velg sted fra lista, vinkel, skjul og PDF. */
function _takSectionCardHtml(fid, t, s) {
  const T = _takSectionTargets(t); if (!T.length) return '';
  const cur = _takSection && _takSection.fid === fid ? _takSection.on : null;
  const M = cur ? _takSectionModel(t, cur) : null;
  let h = `<div class="tak-section-card" style="margin-top:6px;border-top:1px solid var(--border);padding-top:4px"><div style="font-weight:700">Snitt gjennom takfoten</div>`;
  h += `<div style="font-size:10px;color:var(--dim)">Tas ved et nedløp — der renne, nedløp og kabel møtes.</div>`;
  h += T.map(x => { const on = cur && cur.type === x.on.type && cur.id === x.on.id;
    return `<button class="tak-section-pick${on ? ' on' : ''}" data-key="${x.on.id}" onclick="_takSectionShow(${fid},'${x.on.type}','${x.on.id}')" style="display:block;width:100%;text-align:left;margin-top:2px;padding:2px 5px;border:1px solid ${on ? 'var(--accent,#0891b2)' : 'var(--border)'};border-radius:4px;background:${on ? 'rgba(8,145,178,0.12)' : 'transparent'};color:var(--text);cursor:pointer;font-size:11px">${on ? '▣' : '▢'} ${x.label}</button>`; }).join('');
  if (M) {
    const P = M.pitch, pv = s && s.pitch_deg ? s.pitch_deg.value : null;
    const txt = P.src === 'flat' ? 'flatt tak' : P.src === 'user' ? 'satt av deg' : P.src === 'derived' ? `≈ ${_takNum(P.deg, 1)}° av møne og gesims` : 'ukjent — tegnes skjematisk';
    h += `<div class="tak-pitch" style="display:flex;align-items:center;justify-content:space-between;gap:3px;margin-top:4px;font-size:11px;white-space:nowrap"><span style="color:var(--dim)">Takvinkel</span><span>${P.src === 'flat' ? '0' : `<input type="text" inputmode="decimal" value="${_takNum(pv)}" placeholder="${P.deg != null ? _takNum(P.deg, 1) : '—'}" onchange="_takSetPitch(${fid},this.value)" onkeydown="if(event.key==='Enter')this.blur()" style="width:40px;padding:1px 4px;font-size:12px;text-align:right;border:1px solid var(--border);border-radius:4px;background:var(--bg2,transparent);color:var(--text)">`} °</span></div>`;
    h += `<div class="tak-pitch-src" style="font-size:10px;color:${P.src === 'unknown' ? 'var(--warn,#d97706)' : 'var(--dim)'}">${txt}</div>`;
    h += `<div>${_takBtn('_takSectionClose()', 'Skjul snitt')}${_takBtn(`_takSectionPDF(${fid},{type:'${M.on.type}',id:'${M.on.id}'})`, 'Snitt som PDF')}</div>`;
  }
  return h + '</div>';
}

// ── PDF: bildet leses av HOVEDLERRETET (fellesregel), som _renderRoomToImage ──
function _takSectionToImage(fid, on, opts) {
  opts = opts || {};
  const M = _takSectionModel(_takOf(fid), on); if (!M) return null;
  const outW = Math.round(opts.outW || 2600), outH = Math.round(outW * (opts.aspect || 0.62));
  const saved = { w: canvas.width, h: canvas.height };
  let url = null, info = null;
  try {
    canvas.width = outW; canvas.height = outH;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, outW, outH);
    info = _takSectionPaint(ctx, M, { x: 0, y: 0, w: outW, h: outH }, { pdf: true });
    ctx.restore();
    const flat = document.createElement('canvas'); flat.width = outW; flat.height = outH;
    const f = flat.getContext('2d'); f.fillStyle = '#ffffff'; f.fillRect(0, 0, outW, outH); f.drawImage(canvas, 0, 0);
    url = flat.toDataURL('image/jpeg', opts.quality || 0.9);
  } finally {
    canvas.width = saved.w; canvas.height = saved.h;
    if (typeof markDirty === 'function') markDirty();
    if (typeof render === 'function') render();
  }
  return { url, w: outW, h: outH, model: M, info };
}
/** Én liggende A4-side med snittet. `opts.noSave` = bare bygg dokumentet (testene). Tekst i PDF-en er
 *  ren Latin-1 (standardfonten har ikke piler/tankestrek). */
function _takSectionPDF(fid, on, opts) {
  opts = opts || {};
  if (!window.jspdf) { _showToast && _showToast('PDF-bibliotek ikke lastet. Prøv igjen.', 'warn'); return null; }
  const img = _takSectionToImage(fid, on, { outW: 2600, aspect: 0.62 });
  if (!img || !img.url) { _showToast && _showToast('Fant ikke snittet.', 'warn'); return null; }
  const { jsPDF } = window.jspdf;
  const doc = _pdfSuperscriptPatch(new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }));
  const W = 297, Hh = 210, Mg = 12, plain = s => String(s).replace(/[—–]/g, '-').replace(/[^\x20-\xff]/g, '');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(30, 41, 59);
  doc.text('Snitt gjennom takfoten', Mg, Mg + 3);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
  doc.text(plain(`${(S.project && S.project.name) || 'Prosjekt'} · ${_takSectionTitle(img.model)}`), Mg, Mg + 8.5);
  const top = Mg + 12, maxW = W - 2 * Mg, maxH = Hh - top - 12;
  let iw = maxW, ih = iw * img.h / img.w; if (ih > maxH) { ih = maxH; iw = ih * img.w / img.h; }
  doc.addImage(img.url, 'JPEG', Mg + (maxW - iw) / 2, top, iw, ih);
  doc.setFontSize(7); doc.setTextColor(120, 130, 150);
  doc.text(plain(`Varmeplan · ${new Date().toLocaleDateString('nb-NO')} · Ingen produkt valgt - ingen watt, festeavstander eller artikkelnumre. ${TAK_SECTION_SRC}`), Mg, Hh - 6, { maxWidth: W - 2 * Mg });
  if (!opts.noSave) doc.save(_exportFileName('Snitt-takfot-' + on.id, 'pdf'));
  return { doc, img };
}

