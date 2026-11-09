import { bytt, skriv } from './patch.mjs';

// (1) autoDimHindrings: hid + innover-offset
bytt(`    const hs=S.hindrings.filter(h=>h.roomId===S.ui.selectedRoomId&&h.points&&h.points.length>=3);
    const AUTO_OFFSET=20;
    for(const h of hs){
      const pts=h.points, n=pts.length;
      for(let i=0;i<n;i++){
        const p1=pts[i], p2=pts[(i+1)%n];
        const dx=p2.x-p1.x, dy=p2.y-p1.y, len=Math.hypot(dx,dy);
        if(len<1) continue;
        const wnx=-dy/len, wny=dx/len;
        const mx=(p1.x+p2.x)/2, my=(p1.y+p2.y)/2;
        const inward=ptInPoly(mx+wnx,my+wny,pts)?1:-1;
        const offset=AUTO_OFFSET*(-inward);
        room.dims.push({id:S.counters.nextDimId++,p1:{x:p1.x,y:p1.y},p2:{x:p2.x,y:p2.y},wnx,wny,offset,auto:'hindring'});
      }
    }`,
`    const hs=S.hindrings.filter(h=>h.roomId===S.ui.selectedRoomId&&h.points&&h.points.length>=3);
    // 217 (Kenneth 09.11.2026): målene står INNE i hindringen (positivt = innover), ikke 20 cm
    // utenfor over kabel og folie. \`hid\` binder målet til hindringen, så tegningen kan sjekke
    // at tekst og streker holder seg innenfor omrisset (_hindDimLayout).
    for(const h of hs){
      const pts=h.points, n=pts.length;
      for(let i=0;i<n;i++){
        const p1=pts[i], p2=pts[(i+1)%n];
        const dx=p2.x-p1.x, dy=p2.y-p1.y, len=Math.hypot(dx,dy);
        if(len<1) continue;
        const wnx=-dy/len, wny=dx/len;
        const offset=_hindDimInwardSign(pts,p1,p2)*_hindDimInsetCm(pts,p1,p2);
        room.dims.push({id:S.counters.nextDimId++,p1:{x:p1.x,y:p1.y},p2:{x:p2.x,y:p2.y},wnx,wny,offset,auto:'hindring',hid:h.id});
      }
    }`);

// (2) drawUserDimLines: hindringsmål går sin egen vei
bytt(`  for (const dim of _dims) {
    const isSel=dim.id===S.ui.selectedDimId;
    const off=dim.offset||0;
    // World-space perpendicular unit vector
    const wdx=dim.p2.x-dim.p1.x, wdy=dim.p2.y-dim.p1.y;
    const wLen=Math.hypot(wdx,wdy); if(wLen<1) continue;
    const wnx=-wdy/wLen, wny=wdx/wLen;
    // Offset dim line endpoints (world → screen)
    const sd1=w2s(dim.p1.x+wnx*off, dim.p1.y+wny*off);`,
`  for (const dim of _dims) {
    const isSel=dim.id===S.ui.selectedDimId;
    // 217: mål på en hindring legges inne i hindringen (egen plassering, egen tegning).
    if (dim.auto==='hindring') { const L=_hindDimLayout(dim); if (L) { if (L.draw) _drawHindDim(L,isSel); continue; } }
    const off=dim.offset||0;
    // World-space perpendicular unit vector
    const wdx=dim.p2.x-dim.p1.x, wdy=dim.p2.y-dim.p1.y;
    const wLen=Math.hypot(wdx,wdy); if(wLen<1) continue;
    const wnx=-wdy/wLen, wny=wdx/wLen;
    // Offset dim line endpoints (world → screen)
    const sd1=w2s(dim.p1.x+wnx*off, dim.p1.y+wny*off);`);

// (3) ny blokk
bytt(`// ─── HINDRING DISTANCE LINES ──────────────────────────────────
function drawHindringDistances(h, room) {`,
`// ─── 217 · MÅL INNE I HINDRINGEN ──────────────────────────────
// Kenneth 09.11.2026: «Målsett hindring — jeg ønsker at målene vises inne i hindringen. I dag
// vises den på utsiden og legger seg over varmekabel og varmefolie.»
//
// Et hindringsmål er fortsatt et vanlig \`room.dims\`-objekt (auto:'hindring'), med to tillegg:
// \`hid\` (hindringen det hører til) og offset med fortegn INNOVER. Plasseringen regnes ved
// tegning (_hindDimLayout) fordi «får teksten plass» avhenger av zoom på skjermen og av
// papirskalaen i PDF-en. Samme funksjon brukes av tegning, klikk-treff og gizmo.
//
// Regelen: (1) målestrek inne i hindringen, parallelt med siden, med luft inn fra kanten;
// (2) tekst, streker og T-ender helt innenfor omrisset, og ikke over hindringens navn;
// (3) for liten → teksten krympes trinnvis ned til minstestørrelsen (skjerm 8 px, PDF 0,9 mm);
// får den fortsatt ikke plass vises målet utenfor som før, og for to like, motstående sider
// (rektangel) vises bare det med minst kabel/folie/matte under seg; (4) i PDF følger størrelsen
// profilens labelstørrelse (1,2 mm × skala, som kjedetekstene); (5) teksten leses alltid fra
// bunnen eller fra høyre.
const HIND_DIM_SCREEN_PX = 11, HIND_DIM_SCREEN_MIN_PX = 8;   // skjerm: som andre mål → minst 8 px
const HIND_DIM_PDF_MM = 1.2, HIND_DIM_PDF_MIN_MM = 0.9;      // papir: ved Normal; × pdfLabelScale
const HIND_DIM_OUT_CM = 20;                                    // reserveplassering utenfor (som før 217)
function _hindDimFontPx() {
  if (S.ui?._pdfMode && S.ui._pdfScaleMmPerCm > 0) {
    const pxPerMm = (S.view.zoom * BASE_SCALE) / S.ui._pdfScaleMmPerCm;
    const sk = _userPrefs().pdfLabelScale || 1;
    return { base: HIND_DIM_PDF_MM * sk * pxPerMm, min: HIND_DIM_PDF_MIN_MM * sk * pxPerMm };
  }
  return { base: HIND_DIM_SCREEN_PX, min: HIND_DIM_SCREEN_MIN_PX };
}
// +1 når normalen (-dy,dx) fra siden p1→p2 peker inn i polygonet, ellers -1.
function _hindDimInwardSign(pts, p1, p2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy); if (len < 1e-9) return 1;
  const nx = -dy / len, ny = dx / len, mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
  return ptInPoly(mx + nx * 0.5, my + ny * 0.5, pts) ? 1 : -1;
}
// Luft inn fra kanten: 10 cm, men aldri mer enn en tredel av dybden bak siden (15 × 15 → 5 cm).
function _hindDimInsetCm(pts, p1, p2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy); if (len < 1e-9) return 10;
  const s = _hindDimInwardSign(pts, p1, p2), nx = -dy / len * s, ny = dx / len * s;
  let depth = 0; for (const v of pts) depth = Math.max(depth, (v.x - p1.x) * nx + (v.y - p1.y) * ny);
  return Math.min(10, Math.max(2, depth / 3));
}
// Gamle mål (før 217) har ingen hid: finn hindringen som eier siden p1→p2.
function _hindDimFindOwner(dim, roomId) {
  const near = (a, b) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
  for (const h of S.hindrings) {
    if (roomId != null && h.roomId !== roomId) continue;
    const pts = h.points || []; const n = pts.length; if (n < 3) continue;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; if ((near(a, dim.p1) && near(b, dim.p2)) || (near(a, dim.p2) && near(b, dim.p1))) return h; }
  }
  return null;
}
// Ved åpning: gamle hindringsmål får hid og flyttes inn (offset 20 cm utover → inset innover).
function _hindDimMigrate() {
  for (const room of S.rooms) {
    for (const d of (room.dims || [])) {
      if (d.auto !== 'hindring' || d.hid != null) continue;
      const h = _hindDimFindOwner(d, room.id); if (!h) continue;
      d.hid = h.id; d.offset = _hindDimInwardSign(h.points, d.p1, d.p2) * _hindDimInsetCm(h.points, d.p1, d.p2);
    }
  }
}
// Lesbar vinkel: fra bunnen eller fra høyre, aldri opp ned (loddrett → leses nedenfra og opp).
function _hindDimReadAng(ang) {
  let a = ang; if (a > Math.PI / 2 - 1e-6 || a < -Math.PI / 2 - 1e-6) a += Math.PI;
  while (a > Math.PI) a -= 2 * Math.PI; return a;
}
// Hvor mye kabel/folie/matte ligger under en boks (verdens-cm)? Teller 15 prøvepunkter.
function _hindDimHeatUnder(corners, roomId) {
  const cableNear = (wx, wy) => {
    for (const c of S.cables) {
      if (c.roomId !== roomId) continue;
      const tol = (c.spacing_cm || 10) / 2;
      if (c.pathEls && c.pathEls.length) {
        for (const el of c.pathEls) { if (!el) continue; const pts = el.kind === 'run' ? [el.a, el.b] : (el.pts || [el.from, el.to]); if (!pts) continue;
          for (let k = 0; k + 1 < pts.length; k++) { const a = pts[k], b = pts[k + 1]; if (a && b && distSeg(wx, wy, a.x, a.y, b.x, b.y) <= tol) return true; } }
      } else for (const r of (c.runs || [])) for (const sg of (r.segments || [])) {
        const d = c.direction === 'h' ? distSeg(wx, wy, sg.start_cm, r.pos_cm, sg.end_cm, r.pos_cm) : distSeg(wx, wy, r.pos_cm, sg.start_cm, r.pos_cm, sg.end_cm);
        if (d <= tol) return true;
      }
    }
    return false;
  };
  let n = 0;
  const [A, B, C, D] = corners;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
    const u = (i + 0.5) / 5, v = (j + 0.5) / 3;
    const x = A.x + (B.x - A.x) * u + (D.x - A.x) * v + (A.x - B.x + C.x - D.x) * u * v;
    const y = A.y + (B.y - A.y) * u + (D.y - A.y) * v + (A.y - B.y + C.y - D.y) * u * v;
    const st = hitStrip(x, y); if ((st && st.roomId === roomId) || hitFoilFree(x, y) || hitMatRun(x, y) || cableNear(x, y)) n++;
  }
  return n;
}
// Plasseringen av ett hindringsmål i skjerm-px. null = ikke et hindringsmål vi kan plassere
// (hindringen er borte) → tegnes som et vanlig mål. draw:false = skjult (partneren vant).
function _hindDimLayout(dim) {
  if (dim.auto !== 'hindring') return null;
  let h = dim.hid != null ? S.hindrings.find(x => x.id === dim.hid) : null;
  if (!h) { h = _hindDimFindOwner(dim, null); if (h) dim.hid = h.id; }
  if (!h || !h.points || h.points.length < 3) return null;
  const pts = h.points, p1 = dim.p1, p2 = dim.p2;
  const wdx = p2.x - p1.x, wdy = p2.y - p1.y, wLen = Math.hypot(wdx, wdy); if (wLen < 1) return null;
  const wnx = -wdy / wLen, wny = wdx / wLen;
  const inw = _hindDimInwardSign(pts, p1, p2);
  const offCm = dim.offset || inw * _hindDimInsetCm(pts, p1, p2);
  const sp1 = w2s(p1.x, p1.y), sp2 = w2s(p2.x, p2.y);
  const text = Math.round(wLen) + ' cm';
  const TICK = 7, OVERHANG = 6;
  const place = (o) => {
    const sd1 = w2s(p1.x + wnx * o, p1.y + wny * o), sd2 = w2s(p2.x + wnx * o, p2.y + wny * o);
    const ang = Math.atan2(sd2.y - sd1.y, sd2.x - sd1.x);
    return { sd1, sd2, ang, cx: (sd1.x + sd2.x) / 2, cy: (sd1.y + sd2.y) / 2, ux: Math.cos(ang), uy: Math.sin(ang) };
  };
  const base = { dim, h, sp1, sp2, wnx, wny, wLen, text, TICK, OVERHANG, draw: true };
  const F = _hindDimFontPx();
  ctx.save();
  try {
    if (offCm * inw > 0) {
      // Inne: prøv fra normal størrelse ned til minste.
      const P = place(offCm), vx = -P.uy, vy = P.ux, lenPx = Math.hypot(P.sd2.x - P.sd1.x, P.sd2.y - P.sd1.y);
      // Hindringens navn står i tyngdepunktet (drawHindrings) — teksten skal ikke legge seg over det.
      const cxs = pts.reduce((a, p) => a + p.x, 0) / pts.length, cys = pts.reduce((a, p) => a + p.y, 0) / pts.length;
      const cs = w2s(cxs, cys); ctx.font = "11px 'Space Grotesk',sans-serif";
      const lw = ctx.measureText(h.label || h.type || 'Hindring').width / 2 + 2;
      const lab = { x1: cs.x - lw, x2: cs.x + lw, y1: cs.y - 7, y2: cs.y + 7 };
      const inside = (sx, sy) => { const w = s2w(sx, sy); return ptInPoly(w.x, w.y, pts); };
      const step = Math.max(0.25, (F.base - F.min) / 6);
      for (let fpx = F.base; fpx >= F.min - 1e-9; fpx -= step) {
        ctx.font = \`\${fpx}px \${CANVAS_NUM_FONT}\`;
        const tw = ctx.measureText(text).width, hw = tw / 2 + 3, hh = fpx * 0.62 + 1.5;
        if (2 * hw > lenPx - 2 * TICK) continue;                       // teksten er lengre enn siden
        const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([a, b]) => ({ x: P.cx + P.ux * a + vx * b, y: P.cy + P.uy * a + vy * b }));
        const ends = [P.sd1, P.sd2].flatMap(p => [{ x: p.x + vx * TICK, y: p.y + vy * TICK }, { x: p.x - vx * TICK, y: p.y - vy * TICK }]);
        const over = [P.sd1, P.sd2].map(p => ({ x: p.x + wnx * inw * OVERHANG * Math.sign(S.view.zoom), y: p.y + wny * inw * OVERHANG }));
        if (![...corners, ...ends, ...over].every(s => inside(s.x, s.y))) continue;
        const xs = corners.map(c => c.x), ys = corners.map(c => c.y);
        if (Math.min(...xs) < lab.x2 && Math.max(...xs) > lab.x1 && Math.min(...ys) < lab.y2 && Math.max(...ys) > lab.y1) continue;   // over navnet
        return { ...base, ...P, inside: true, fontPx: fpx, tw };
      }
      // Reserve: utenfor som før 217. Motstående, like lang side i samme hindring → bare den med
      // minst varme under teksten vises (likt → laveste id).
      const Q = place(-inw * HIND_DIM_OUT_CM);
      ctx.font = \`\${F.base}px \${CANVAS_NUM_FONT}\`;
      const tw = ctx.measureText(text).width;
      const boxW = (d) => {
        const ddx = d.p2.x - d.p1.x, ddy = d.p2.y - d.p1.y, L = Math.hypot(ddx, ddy), nx = -ddy / L, ny = ddx / L;
        const s = _hindDimInwardSign(pts, d.p1, d.p2), o = -s * HIND_DIM_OUT_CM;
        const mx = (d.p1.x + d.p2.x) / 2 + nx * o, my = (d.p1.y + d.p2.y) / 2 + ny * o, sc = S.view.zoom * BASE_SCALE;
        const ux = ddx / L, uy = ddy / L, a = (tw / 2 + 3) / sc, b = (F.base * 0.65 + 2) / sc;
        return [[-a, -b], [a, -b], [a, b], [-a, b]].map(([p, q]) => ({ x: mx + ux * p + nx * q, y: my + uy * p + ny * q }));
      };
      const room = S.rooms.find(r => r.id === h.roomId);
      const partner = room ? (room.dims || []).find(d => d !== dim && d.auto === 'hindring' && d.hid === h.id && d.id !== dim.id
        && Math.abs(Math.hypot(d.p2.x - d.p1.x, d.p2.y - d.p1.y) - wLen) < 1
        && ((d.p2.x - d.p1.x) * wdx + (d.p2.y - d.p1.y) * wdy) / (wLen * wLen) < -0.999) : null;
      let draw = true;
      if (partner) {
        const mine = _hindDimHeatUnder(boxW(dim), h.roomId), theirs = _hindDimHeatUnder(boxW(partner), h.roomId);
        draw = mine < theirs || (mine === theirs && dim.id < partner.id);
      }
      return { ...base, ...Q, inside: false, fontPx: F.base, tw, draw, partnerId: partner ? partner.id : null };
    }
    // Brukeren har dratt målet ut selv (offset peker utover): tegn der, i normal størrelse.
    const Q = place(offCm);
    ctx.font = \`\${F.base}px \${CANVAS_NUM_FONT}\`;
    return { ...base, ...Q, inside: false, fontPx: F.base, tw: ctx.measureText(text).width, draw: true };
  } finally { ctx.restore(); }
}
function _drawHindDim(L, isSel) {
  const { sd1, sd2, sp1, sp2, ang, TICK, OVERHANG, text, fontPx } = L;
  const col = isSel ? _lc('rgba(8,80,130,0.95)', 'rgba(34,211,238,0.95)') : _lc('rgba(26,111,204,0.85)', 'rgba(71,180,255,0.8)');
  ctx.save(); ctx.setLineDash([]);
  ctx.strokeStyle = col; ctx.lineWidth = 0.8;
  for (const [sp, sd] of [[sp1, sd1], [sp2, sd2]]) {
    const el = Math.hypot(sd.x - sp.x, sd.y - sp.y); if (el <= 2) continue;
    const ux = (sd.x - sp.x) / el, uy = (sd.y - sp.y) / el;
    ctx.beginPath(); ctx.moveTo(sp.x + ux * 3, sp.y + uy * 3); ctx.lineTo(sd.x + ux * OVERHANG, sd.y + uy * OVERHANG); ctx.stroke();
  }
  ctx.lineWidth = isSel ? 1.8 : 1.2;
  ctx.beginPath(); ctx.moveTo(sd1.x, sd1.y); ctx.lineTo(sd2.x, sd2.y); ctx.stroke();
  const tx = -Math.sin(ang) * TICK, ty = Math.cos(ang) * TICK;
  ctx.beginPath(); ctx.moveTo(sd1.x - tx, sd1.y - ty); ctx.lineTo(sd1.x + tx, sd1.y + ty); ctx.moveTo(sd2.x - tx, sd2.y - ty); ctx.lineTo(sd2.x + tx, sd2.y + ty); ctx.stroke();
  ctx.translate((sd1.x + sd2.x) / 2, (sd1.y + sd2.y) / 2); ctx.rotate(_hindDimReadAng(ang));
  ctx.font = \`\${fontPx}px \${CANVAS_NUM_FONT}\`;
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = _lc('rgba(240,244,248,0.88)', 'rgba(13,14,16,0.75)');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle2 = null;
  if (L.inside) {   // teksten ligger PÅ streken, symmetrisk — da er den aldri nærmere kanten enn streken
    ctx.fillRect(-tw / 2 - 3, -fontPx * 0.62 - 1.5, tw + 6, fontPx * 1.24 + 3);
    ctx.fillStyle = col; ctx.fillText(text, 0, 0.5);
  } else {          // utenfor: over streken, som de andre målene
    ctx.fillRect(-tw / 2 - 3, -fontPx * 0.82, tw + 6, fontPx * 1.18);
    ctx.fillStyle = col; ctx.fillText(text, 0, -fontPx * 0.2);
  }
  ctx.restore();
}

// ─── HINDRING DISTANCE LINES ──────────────────────────────────
function drawHindringDistances(h, room) {`);

// (4) klikk-treff på mållinja
bytt(`    for (const dim of _allDims) {
      const off=dim.offset||0;
      const wdx=dim.p2.x-dim.p1.x, wdy=dim.p2.y-dim.p1.y;
      const wLen=Math.hypot(wdx,wdy); if(wLen<1) continue;
      const wnx=-wdy/wLen, wny=wdx/wLen;
      const sd1=w2s(dim.p1.x+wnx*off,dim.p1.y+wny*off);
      const sd2=w2s(dim.p2.x+wnx*off,dim.p2.y+wny*off);
      const sp1=w2s(dim.p1.x,dim.p1.y), sp2=w2s(dim.p2.x,dim.p2.y);`,
`    for (const dim of _allDims) {
      const off=dim.offset||0;
      const wdx=dim.p2.x-dim.p1.x, wdy=dim.p2.y-dim.p1.y;
      const wLen=Math.hypot(wdx,wdy); if(wLen<1) continue;
      const wnx=-wdy/wLen, wny=wdx/wLen;
      let sd1=w2s(dim.p1.x+wnx*off,dim.p1.y+wny*off);
      let sd2=w2s(dim.p2.x+wnx*off,dim.p2.y+wny*off);
      const sp1=w2s(dim.p1.x,dim.p1.y), sp2=w2s(dim.p2.x,dim.p2.y);
      // 217: hindringsmål treffes der de faktisk er tegnet (inne, eller reserven utenfor); skjulte hoppes over.
      const _hl = dim.auto==='hindring' ? _hindDimLayout(dim) : null;
      if (_hl) { if (!_hl.draw) continue; sd1=_hl.sd1; sd2=_hl.sd2; }`);

// (5) gizmo
bytt(`  const sd1=w2s(dim.p1.x+wnx*off,dim.p1.y+wny*off);
  const sd2=w2s(dim.p2.x+wnx*off,dim.p2.y+wny*off);
  const mx=(sd1.x+sd2.x)/2, my=(sd1.y+sd2.y)/2;
  const ang=Math.atan2(sd2.y-sd1.y,sd2.x-sd1.x);
  return {mx,my,pa:ang+Math.PI/2,wnx,wny,off,dim};`,
`  let sd1=w2s(dim.p1.x+wnx*off,dim.p1.y+wny*off);
  let sd2=w2s(dim.p2.x+wnx*off,dim.p2.y+wny*off);
  const _hl = dim.auto==='hindring' ? _hindDimLayout(dim) : null;   // 217: gizmoen sitter på streken slik den er tegnet
  if (_hl) { sd1=_hl.sd1; sd2=_hl.sd2; }
  const mx=(sd1.x+sd2.x)/2, my=(sd1.y+sd2.y)/2;
  const ang=Math.atan2(sd2.y-sd1.y,sd2.x-sd1.x);
  return {mx,my,pa:ang+Math.PI/2,wnx,wny,off,dim};`);

// (6) migrering ved åpning
bytt(`  S.rooms.forEach(r=>{ if(!r.dims) r.dims=[]; if(!r.annotOffsets) r.annotOffsets={}; if(r.wallThicknessCm==null) r.wallThicknessCm=0; if(r.stripDimSnap==null) r.stripDimSnap=false; if(r.matDimSnap==null) r.matDimSnap=false;
    if(r.walls) r.walls.forEach(w=>{ if(w.thicknessCm==null) w.thicknessCm=r.wallThicknessCm||0; if(!w.side) w.side='out'; });
  });`,
`  S.rooms.forEach(r=>{ if(!r.dims) r.dims=[]; if(!r.annotOffsets) r.annotOffsets={}; if(r.wallThicknessCm==null) r.wallThicknessCm=0; if(r.stripDimSnap==null) r.stripDimSnap=false; if(r.matDimSnap==null) r.matDimSnap=false;
    if(r.walls) r.walls.forEach(w=>{ if(w.thicknessCm==null) w.thicknessCm=r.wallThicknessCm||0; if(!w.side) w.side='out'; });
  });
  _hindDimMigrate();   // 217: hindringsmål fra før 217 (20 cm utenfor, uten hid) flyttes inn i hindringen`);
skriv();
