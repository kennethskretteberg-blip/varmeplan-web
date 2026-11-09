import { bytt, skriv } from './patch.mjs';
bytt(`// ─── HINDRING DISTANCE LINES ──────────────────────────────────
function drawHindringDistances(h, room) {`,
`// 217: regresjon — plassering inne/krymp/reserve, partnervalg, migrering, lesevinkel, PDF-størrelse.
function _hindDimRegressionTest217() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name, ok: !!cond, expected, got });
  const saved = { rooms: S.rooms, hindrings: S.hindrings, cables: S.cables, strips: S.strips, foilFree: S.foilFree, mats: S.mats, floors: S.floors,
    view: { ...S.view }, ui: { activeFloorId: S.ui.activeFloorId, activePartId: S.ui.activePartId, selectedRoomId: S.ui.selectedRoomId, selectedDimId: S.ui.selectedDimId, pdf: S.ui._pdfMode, sc: S.ui._pdfScaleMmPerCm },
    nextDimId: S.counters.nextDimId, profile: (typeof _currentProfile !== 'undefined') ? _currentProfile : undefined, autoSave: window._performAutoSave, toast: window._showToast };
  window._performAutoSave = () => Promise.resolve(); window._showToast = () => {};
  try {
    const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
    const pts = rect(0, 0, 400, 300);
    const room = { id: 9217, floorId: S.ui.activeFloorId, partId: S.ui.activePartId, name: '217', points: pts, walls: compWalls(pts), area: 120000, dims: [], annotOffsets: {} };
    S.rooms = [room]; S.strips = []; S.foilFree = []; S.mats = [];
    S.hindrings = [
      { id: 9301, type: 'annet', label: 'Pipe', roomId: 9217, floorId: room.floorId, points: rect(170, 130, 60, 40), clearance: 'wall' },
      { id: 9302, type: 'annet', label: 'Søyle', roomId: 9217, floorId: room.floorId, points: rect(100, 120, 15, 15), clearance: 'wall' },
      { id: 9303, type: 'annet', label: 'Skap', roomId: 9217, floorId: room.floorId, points: [{ x: 300, y: 50 }, { x: 390, y: 50 }, { x: 390, y: 100 }, { x: 345, y: 100 }, { x: 345, y: 150 }, { x: 300, y: 150 }], clearance: 'wall' },
    ];
    // Kabel bare i nedre halvdel (y 150–290): over Søyle er det tomt, under er det kabel.
    const runs = []; for (let x = 10; x < 400; x += 20) runs.push({ pos_cm: x, segments: [{ start_cm: 150, end_cm: 290 }] });
    S.cables = [{ id: 9401, roomId: 9217, productId: 0, direction: 'v', spacing_cm: 20, startCorner: 'bl', totalLength_cm: 6000, runs, connections: [] }];
    S.ui.selectedRoomId = 9217; S.ui.selectedDimId = null; S.ui._pdfMode = false; S.ui._pdfScaleMmPerCm = undefined;
    S.view.panX = 200; S.view.panY = 150;
    autoDimHindrings();
    const dims = room.dims;
    check('A: 4 + 4 + 6 = 14 mål, alle med hid', 14, dims.length === 14 && dims.every(d => d.hid != null && d.auto === 'hindring'), dims.length);
    const ofA = dims.filter(d => d.hid === 9301).map(d => d.offset);
    check('A: 60 × 40 får 10 cm innover (positivt mot innsiden)', '10,10,10,10', ofA.every(o => o === 10), ofA.join(','));
    const ofB = dims.filter(d => d.hid === 9302).map(d => d.offset);
    check('A: 15 × 15 får 5 cm (en tredel av dybden)', '5', ofB.every(o => o === 5), ofB.join(','));
    const insideWorld = (L) => {   // uavhengig: tekstboks + T-ender innenfor hindringen (kanten teller som inne)
      const ux = Math.cos(L.ang), uy = Math.sin(L.ang), vx = -uy, vy = ux, cx = (L.sd1.x + L.sd2.x) / 2, cy = (L.sd1.y + L.sd2.y) / 2;
      const hw = L.tw / 2 + 3, hh = L.fontPx * 0.62 + 1.5;
      const P = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([a, b]) => ({ x: cx + ux * a + vx * b, y: cy + uy * a + vy * b }));
      for (const e of [L.sd1, L.sd2]) P.push({ x: e.x + vx * 7, y: e.y + vy * 7 }, { x: e.x - vx * 7, y: e.y - vy * 7 });
      return P.every(s => { const w = s2w(s.x, s.y); return ptInPoly(w.x, w.y, L.h.points) || _hindDimOnEdge(w.x, w.y, L.h.points, 0.05); });
    };
    const lay = (hid) => dims.filter(d => d.hid === hid).map(d => ({ d, L: _hindDimLayout(d) }));
    // B: zoom 1,3 — 60 × 40 inne i full størrelse
    S.view.zoom = 1.3;
    let A = lay(9301);
    check('B: 60 × 40 ved zoom 1,3 — alle fire inne, 11 px', 'inne × 4', A.every(x => x.L && x.L.inside && x.L.draw && x.L.fontPx === 11), A.map(x => x.L && x.L.inside + '/' + x.L.fontPx).join(' '));
    check('B: ...og tekst/T-ender er innenfor omrisset (uavhengig sjekk)', true, A.every(x => insideWorld(x.L)), '');
    check('B: L-formen (6 sider) — alle inne', 'inne × 6', lay(9303).every(x => x.L && x.L.inside && x.L.draw && insideWorld(x.L)), lay(9303).map(x => x.L.inside).join(','));
    // C: zoom 0,8 — 40-sidene må krympe, men holder seg inne
    S.view.zoom = 0.8;
    A = lay(9301); const k40 = A.filter(x => Math.round(x.L.wLen) === 40), k60 = A.filter(x => Math.round(x.L.wLen) === 60);
    check('C: zoom 0,8 — 40-sidene inne med krympet tekst (8 ≤ px < 11)', 'inne, <11', k40.every(x => x.L.inside && x.L.fontPx < 11 && x.L.fontPx >= 8 && insideWorld(x.L)), k40.map(x => x.L.inside + '/' + x.L.fontPx.toFixed(2)).join(' '));
    check('C: ...60-sidene fortsatt 11 px', 11, k60.every(x => x.L.inside && x.L.fontPx === 11), k60.map(x => x.L.fontPx).join(','));
    // D: zoom 0,45 — 40-sidene får ikke plass → utenfor, bare én av paret
    S.view.zoom = 0.45;
    A = lay(9301); const u40 = A.filter(x => Math.round(x.L.wLen) === 40);
    check('D: zoom 0,45 — 40-sidene utenfor', 'ute × 2', u40.every(x => !x.L.inside), u40.map(x => x.L.inside).join(','));
    check('D: ...og bare én av de to vises', 1, u40.filter(x => x.L.draw).length === 1, u40.map(x => x.L.draw).join(','));
    // E: 15 × 15 ved zoom 1,3 — utenfor; toppen (ingen kabel over) vinner over bunnen (kabel under)
    S.view.zoom = 1.3;
    const B = lay(9302);
    check('E: 15 × 15 — alle utenfor', 'ute × 4', B.every(x => !x.L.inside), B.map(x => x.L.inside).join(','));
    const topp = B.find(x => x.d.p1.y === 120 && x.d.p2.y === 120), bunn = B.find(x => x.d.p1.y === 135 && x.d.p2.y === 135);
    check('E: toppen vises (ingen varme over), bunnen skjules (kabel under)', 'topp:true bunn:false', topp && bunn && topp.L.draw && !bunn.L.draw, 'topp:' + (topp && topp.L.draw) + ' bunn:' + (bunn && bunn.L.draw));
    check('E: nøyaktig to av fire vises', 2, B.filter(x => x.L.draw).length === 2, B.filter(x => x.L.draw).length);
    check('E: reserven ligger 20 cm utenfor', 20, topp && Math.abs(s2w(topp.L.sd1.x, topp.L.sd1.y).y - 100) < 0.01, topp && s2w(topp.L.sd1.x, topp.L.sd1.y).y);
    // F: brukeren drar målet ut selv (negativt offset) → tegnes der
    const d0 = dims.find(d => d.hid === 9301); const o0 = d0.offset; d0.offset = -25;
    const Lf = _hindDimLayout(d0);
    check('F: offset utover (−25) → tegnes utenfor på 25 cm', 'ute, 25', Lf && !Lf.inside && Lf.draw && Math.abs(Math.abs(s2w(Lf.sd1.x, Lf.sd1.y).y - d0.p1.y) - 25) < 0.01, Lf && Lf.inside);
    d0.offset = o0;
    // G: gizmoen sitter på den tegnede streken
    S.ui.selectedDimId = d0.id; const g = _dimGizmoCenter(), L0 = _hindDimLayout(d0);
    check('G: gizmo-senter = midtpunktet av den indre streken', 'likt', g && Math.abs(g.mx - (L0.sd1.x + L0.sd2.x) / 2) < 1e-6 && Math.abs(g.my - (L0.sd1.y + L0.sd2.y) / 2) < 1e-6, g && [g.mx, g.my]);
    S.ui.selectedDimId = null;
    // H: migrering av gamle mål (uten hid, 20 cm utover)
    const gml = { id: 99991, p1: { x: 170, y: 130 }, p2: { x: 230, y: 130 }, wnx: 0, wny: 1, offset: -20, auto: 'hindring' };
    room.dims.push(gml); _hindDimMigrate();
    check('H: gammelt mål får hid og offset 10 innover', 'hid 9301, 10', gml.hid === 9301 && gml.offset === 10, gml.hid + ', ' + gml.offset);
    room.dims.pop();
    // I: lesevinkel — fra bunnen eller fra høyre
    const deg = a => a * Math.PI / 180, r = a => Math.round(_hindDimReadAng(deg(a)) * 180 / Math.PI);
    check('I: 0° → 0°, 90° (nedover) → −90°, −90° → −90°, 180° → 0°, 135° → −45°, −135° → 45°', '0,-90,-90,0,-45,45', [0, 90, -90, 180, 135, -135].map(r).join(',') === '0,-90,-90,0,-45,45', [0, 90, -90, 180, 135, -135].map(r).join(','));
    // J: PDF — 1,2 mm ved Normal, × profilens labelstørrelse; minste 0,9 mm
    S.ui._pdfMode = true; S.ui._pdfScaleMmPerCm = 0.3; S.view.zoom = 2;
    const pxPerMm = S.view.zoom * BASE_SCALE / 0.3;
    if (typeof _currentProfile !== 'undefined') _currentProfile = null;
    let F = _hindDimFontPx();
    check('J: PDF Normal → 1,2 mm / minst 0,9 mm', '1.2 / 0.9', Math.abs(F.base / pxPerMm - 1.2) < 1e-9 && Math.abs(F.min / pxPerMm - 0.9) < 1e-9, (F.base / pxPerMm).toFixed(2) + ' / ' + (F.min / pxPerMm).toFixed(2));
    if (typeof _currentProfile !== 'undefined') { _currentProfile = { prefs: { pdfLabelScale: 1.5 } }; F = _hindDimFontPx();
      check('J: Ekstra stor (1,5) → 1,8 mm', 1.8, Math.abs(F.base / pxPerMm - 1.8) < 1e-9, (F.base / pxPerMm).toFixed(2)); _currentProfile = null; }
    S.ui._pdfMode = false; S.ui._pdfScaleMmPerCm = undefined;
    check('J: skjerm → 11 px / minst 8 px', '11 / 8', _hindDimFontPx().base === 11 && _hindDimFontPx().min === 8, JSON.stringify(_hindDimFontPx()));
    // K: chip-en slår av igjen
    autoDimHindrings();
    check('K: andre trykk fjerner alle hindringsmål', 0, room.dims.filter(d => d.auto === 'hindring').length === 0, room.dims.length);
  } catch (e) { results.push({ name: 'UNNTAK', ok: false, expected: '', got: String(e && e.stack || e) }); }
  finally {
    S.rooms = saved.rooms; S.hindrings = saved.hindrings; S.cables = saved.cables; S.strips = saved.strips; S.foilFree = saved.foilFree; S.mats = saved.mats; S.floors = saved.floors;
    S.view.zoom = saved.view.zoom; S.view.panX = saved.view.panX; S.view.panY = saved.view.panY;
    S.ui.activeFloorId = saved.ui.activeFloorId; S.ui.activePartId = saved.ui.activePartId; S.ui.selectedRoomId = saved.ui.selectedRoomId; S.ui.selectedDimId = saved.ui.selectedDimId; S.ui._pdfMode = saved.ui.pdf; S.ui._pdfScaleMmPerCm = saved.ui.sc;
    S.counters.nextDimId = saved.nextDimId; if (saved.profile !== undefined) _currentProfile = saved.profile;
    window._performAutoSave = saved.autoSave; window._showToast = saved.toast;
    try { render(); } catch (e) {}
  }
  const allOk = results.every(r => r.ok);
  console.log(\`[217] hindringsmål: \${results.filter(r => r.ok).length}/\${results.length}\`);
  for (const r of results) if (!r.ok) console.warn('  ✗', r.name, '→ ventet', r.expected, 'fikk', r.got);
  return { ok: allOk, results };
}

// ─── HINDRING DISTANCE LINES ──────────────────────────────────
function drawHindringDistances(h, room) {`);
skriv();
