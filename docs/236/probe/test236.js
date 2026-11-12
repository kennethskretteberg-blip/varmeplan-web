// ═══════════════ 236 · REGRESJON: ÉN VEI FOR ROMTYPE + MÅLKJEDE FOR KABEL I FRYSEROM ═══════════════
// A: fryserom satt fra hvert sted gir samme rom. B: andre romtyper som før. C: låsen (170) fra alle
// steder. D: eksisterende rom endres ikke. E–G: målkjeden bygges av hovedkabelen (geo- og runs-form),
// reserven er ikke med. H: måleverktøyet fester seg til kabelstrengen, likt i fryserom og bad.
async function _roomTypeRegressionTest236() {
  const results = [];
  const check = (name, expected, ok, got) => results.push({ name, ok: !!ok, expected, got });
  const K = ['rooms', 'cables', 'hindrings', 'floors', 'strips', 'mats', 'matPaths', 'zones', 'project', 'floatingDims', 'stairs'];
  const saved = {}; for (const k of K) saved[k] = S[k];
  const sUi = { f: S.ui.activeFloorId, p: S.ui.activePartId, r: S.ui.selectedRoomId, dm: S.ui.drawMode, pdf: S.ui._pdfMode, st: S.ui.selectedStairId };
  const sCnt = { ...S.counters }, sView = { ...S.view }, sSnap = { ...S.snap }, sShift = S.shiftHeld, undoLen = _undoStack.length;
  const sDraw = { rectStart: S.drawing.rectStart, dimPending: S.drawing.dimPending };
  const sOrg = _viewAsOrg, sToast = window._showToast, sAuto = window._scheduleAutoSave, sDlg = window._moduleLockDialog;
  const sProds = HEATING_PRODUCTS.slice(), sVf = S.varmefolie;
  const app = document.getElementById('app'), sApp = app ? app.style.display : null;
  let dialoger = 0;
  try {
    window._showToast = () => {}; window._scheduleAutoSave = () => {}; window._moduleLockDialog = () => { dialoger++; };
    try { await _cblLoadClipper(); } catch (e) {}
    for (let i = 0; i < 50 && !_cblClipperReady(); i++) await new Promise(r => setTimeout(r, 100));
    _viewAsOrg = { id: 't236', name: 'Leverandør', org_type: 'supplier', allowed_modules: null };   // ingen lås
    const CABCAT = (PRODUCT_CATEGORIES.find(c => c.module_type === 'cable' && _catAvailableInModule(c, 'indoor')) || {}).id;
    const CAB = { id: 998361, category_id: CABCAT, active: true, product_family: 'InFloor 10T', name: 'TEST 10T 1200W 120m', article_no: 'T236',
      watt_per_m: 10, cable_length_m: 120, total_effect_w: 1200, voltage: 230, min_spacing_mm: 50, max_spacing_mm: 500 };
    const CAB2 = { ...CAB, id: 998362, name: 'TEST 10T 2000W 200m', cable_length_m: 200, total_effect_w: 2000 };
    HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(CAB, CAB2);
    S.varmefolie = Object.assign({}, S.varmefolie, { direction: 'v', dirExplicit: true, startCorner: 'bl', wallMarginCm: null });
    const RID = 998363, FID = 998364;
    const PTS = [{ x: 0, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 800 }, { x: 0, y: 800 }];
    const haandlagt = () => { const runs = [];
      for (let i = 0; i < 14; i++) runs.push({ pos_cm: 40 + i * 40, segments: [{ start_cm: 40, end_cm: 760 }] });
      return { id: S.counters.nextCableId++, roomId: RID, productId: CAB.id, direction: 'v', spacing_cm: 40, totalLength_cm: 12000, runs, connections: [] }; };
    const ny = (medKabel) => {
      S.mats = []; S.matPaths = []; S.strips = []; S.zones = []; S.hindrings = []; S.stairs = []; S.floatingDims = [];
      S.project = { name: 'TEST 236', parts: [], revision: 0, lastExportedAt: null, createdAt: Date.now() };
      S.floors = [{ id: FID, name: '1. etasje', order: 1 }];
      S.ui.activeFloorId = FID; S.ui.activePartId = null; S.ui.selectedStairId = null; S.ui.selectedRoomId = RID;
      S.rooms = [{ id: RID, name: 'Rom 236', floorId: FID, partId: null, shape: 'rect', wallThicknessCm: 0,
        points: PTS.map(p => ({ ...p })), walls: compWalls(PTS), dims: [], annotOffsets: {}, area: Math.abs(compArea(PTS)), roomType: null, targetWm2: null }];
      S.cables = medKabel ? [haandlagt()] : [];
      _invalidateCableCache();
      return S.rooms[0];
    };
    const sig = r => [r.roomType, r.targetWm2, !!r.reserveCable].join('|');
    const pk = (type) => { const a = document.createElement('input'); a.id = '_pk-navn'; a.value = '';
      const b = document.createElement('input'); b.id = '_pk-type'; b.value = type;
      document.body.appendChild(a); document.body.appendChild(b);
      try { _planKortBekreft(RID); } finally { a.remove(); b.remove(); try { _planKortLukk(); } catch (e) {} } };
    const imp = (type) => { _drawCreateRoomsFromReview([{ poly: [[10, 0], [16, 0], [16, 8], [10, 8]], name: 'Importert', type, calcType: 'none' }], { fitAll: false, yDown: true });
      return S.rooms[S.rooms.length - 1]; };
    const VEIER = {
      'høyreklikk/sidepanel (setRoomType)': t => { setRoomType(RID, t); return S.rooms[0]; },
      'varmepanelet (_upcRoomTypeChanged)': t => { _upcRoomTypeChanged(t); return S.rooms[0]; },
      'plankortet (_planKortBekreft)': t => { pk(t); return S.rooms[0]; },
      'kjernen (_applyRoomType)': t => { _applyRoomType(S.rooms[0], t); return S.rooms[0]; },
      'plantegningsimport (_drawCreateRoomsFromReview)': t => imp(t),
    };

    // ─── A — fryserom fra hvert sted gir samme rom ───
    const W = _roomTypeDefaults('fryserom').targetWm2, FASIT = 'fryserom|' + W + '|true';
    for (const [navn, fn] of Object.entries(VEIER)) {
      const erImport = /import/.test(navn);
      ny(true);
      const r = fn('fryserom');
      check('A: ' + navn + ' → romtype, W/m², reserve', FASIT, sig(r) === FASIT, sig(r));
      if (!erImport) check('A: ' + navn + ' → kabelbufferen er tømt (reserven er lagt)', 1,
        S.cables.filter(c => c.roomId === RID && c.reserve).length === 1, S.cables.filter(c => c.roomId === RID && c.reserve).length);
      if (!erImport) check('A: ' + navn + ' → ingen avvik om reservekabel', 'ingen', !_fryseromAvvik(RID).some(a => a.id === 'reserve'), _fryseromAvvik(RID).map(a => a.id).join(','));
    }
    for (const fnNavn of ['setRoomType', '_upcRoomTypeChanged', '_planKortBekreft', '_kundeBrukNyeRom', '_pdfCreateListRooms', '_drawCreateRoomsFromReview', '_pdfCreateListRoomsFromReview']) {
      const src = String(window[fnNavn]);
      check('A: ' + fnNavn + ' går gjennom _applyRoomType og skriver ikke roomType selv', true,
        src.includes('_applyRoomType(') && !/\.roomType\s*=[^=]/.test(src.replace(/room\.roomType = null;/g, '')), src.includes('_applyRoomType('));
    }

    // ─── B — andre romtyper som før ───
    for (const t of ['bathroom', 'kitchen', 'living', 'other']) {
      const d = _roomTypeDefaults(t), fasit = t + '|' + d.targetWm2 + '|false';
      for (const [navn, fn] of Object.entries(VEIER)) {
        ny(true); const r = fn(t);
        check('B: ' + t + ' via ' + navn, fasit, sig(r) === fasit && !S.cables.some(c => c.reserve), sig(r));
      }
    }
    ny(true); setRoomType(RID, 'bathroom'); setRoomType(RID, '');
    check('B: «ingen romtype» fra høyreklikk gir W/m² null (som før)', '|', sig(S.rooms[0]) === '||false', sig(S.rooms[0]));
    ny(true); _upcRoomTypeChanged('bathroom'); _upcRoomTypeChanged('');
    check('B: «ingen romtype» fra varmepanelet gir 130 W/m² (som før)', '|130|false', sig(S.rooms[0]) === '|130|false', sig(S.rooms[0]));
    ny(true); _upcRoomTypeChanged('fryserom'); _upcRoomTypeChanged('bathroom');
    check('B: reservekabel slås aldri AV ved bytte bort fra fryserom', true, S.rooms[0].reserveCable === true && S.cables.some(c => c.reserve), sig(S.rooms[0]));

    // ─── C — låsen for kundebedrifter (170) fra alle steder ───
    _viewAsOrg = { id: 'k236', name: 'Kunde AS', org_type: 'installer', allowed_modules: ['indoor', 'list'] };
    check('C: fryserom er låst for kundebedriften', true, _roomTypeLocked('fryserom') === true, _roomTypeLocked('fryserom'));
    for (const [navn, fn] of Object.entries(VEIER)) {
      ny(true); dialoger = 0;
      const r = fn('fryserom');
      check('C: låst — ' + navn + ' setter ikke fryserom', '||false', sig(r) === '||false' && !S.cables.some(c => c.reserve), sig(r));
      if (/setRoomType|_upc|_planKort/.test(navn)) check('C: låst — ' + navn + ' viser låsdialogen', 1, dialoger === 1, dialoger);
    }
    ny(true); check('C: låst — kjernen svarer false', false, _applyRoomType(S.rooms[0], 'fryserom') === false, 'true');
    ny(true); setRoomType(RID, 'bathroom');
    check('C: låst — andre romtyper virker', 'bathroom', S.rooms[0].roomType === 'bathroom', S.rooms[0].roomType);
    _viewAsOrg = { id: 't236', name: 'Leverandør', org_type: 'supplier', allowed_modules: null };

    // ─── D — eksisterende rom: fryserom uten reservekabel endres ikke av seg selv ───
    {
      const r = ny(true); r.roomType = 'fryserom'; r.targetWm2 = W;   // slik varmepanelet etterlot det før 236
      _invalidateCableCache(); _syncAllReserveCables(); renderSidebar(); render();
      check('D: rommet står uten reservekabel etter synk og tegning', false, !r.reserveCable && !S.cables.some(c => c.reserve), sig(r));
      check('D: sidepanelets avvik vises fortsatt', 'Reservekabel er påkrevd for fryserom.',
        (_fryseromAvvik(RID).find(a => a.id === 'reserve') || {}).tekst === 'Reservekabel er påkrevd for fryserom.', _fryseromAvvik(RID).map(a => a.tekst).join(' | '));
    }

    // ─── E — målkjeden i et fryserom med auto-lagt kabel (geo-form) og reservekabel ───
    const tekster = (room) => { const t = [], ft = ctx.fillText; ctx.fillText = function (s, ...q) { t.push(String(s)); return ft.call(this, s, ...q); };
      try { _dimLayoutMemo.clear(); _drawCableDimChainForRoom(room); } finally { ctx.fillText = ft; } return t; };
    const strenger = c => [...new Set(_cableGeoStraights(c).filter(s => s.dir === 'v').map(s => Math.round(s.p * 100) / 100))].sort((a, b) => a - b);
    const tverr = L => L ? L.across.map(a => a.segs.map(s => [Math.round(s.from * 100) / 100, Math.round(s.to * 100) / 100])) : null;
    const leggAuto = (type, prod) => { const r = ny(false); setRoomType(RID, type);
      const c = autoFillCable(RID, prod.id); if (c) { c.id = S.counters.nextCableId++; S.cables.push(c); } _invalidateCableCache(); r.cableDimSnap = true; return r; };
    let room = leggAuto('fryserom', CAB);
    let main = S.cables.find(c => c.roomId === RID && !c.reserve), res = S.cables.find(c => c.roomId === RID && c.reserve);
    check('E: auto-utlegget er geo-form (én punktkjede, ingen runs) med reserve', true,
      !!main && !!res && !(main.runs || []).length && (main.pathEls || []).length > 0 && !main.pathEls.some(e => e.kind === 'run'), main && Object.keys(main).join(','));
    if (main && res) {
      const ps = strenger(main), rs = strenger(res), n = ps.length;
      let L = _cableDimChainLayout(room);
      const fasit = [[[0, ps[0]], [ps[0], ps[1]], [ps[n - 2], ps[n - 1]], [ps[n - 1], 600]]];
      check('E: kjeden finnes (før 236: ingen kjede for geo-form)', true, !!L && L.across.length === 1 && L.along.length === 1, L ? L.across.length : 'null');
      check('E: tverr = vegg → første HOVEDstreng, CC, CC, siste hovedstreng → vegg', JSON.stringify(fasit), JSON.stringify(tverr(L)) === JSON.stringify(fasit), JSON.stringify(tverr(L)));
      check('E: første ledd er kantavstanden til hovedkabelen', _frysMarginCm(RID), Math.abs(ps[0] - _frysMarginCm(RID)) < 0.11, ps[0]);
      check('E: CC i kjeden = kabelens CC', +main.spacing_cm.toFixed(2), Math.abs((ps[1] - ps[0]) - main.spacing_cm) < 0.02, ps[1] - ps[0]);
      check('E: reservens strenger ligger 5 cm ved siden av og er IKKE et punkt i kjeden', true,
        Math.abs(Math.abs(rs[0] - ps[0]) - RESERVE_OFFSET_CM) < 0.01 && !tverr(L)[0].some(s => rs.some(q => Math.abs(q - s[0]) < 0.01 || Math.abs(q - s[1]) < 0.01)), rs[0] + ' / ' + ps[0]);
      check('E: bare hovedkabelen er kilde', '1 hoved', _cableDimChainSources(room).length === 1 && !_cableDimChainSources(room)[0].cable.reserve, _cableDimChainSources(room).length);
      const al = L.along[0].segs, r2 = main.spacing_cm / 2, st = _cableGeoStraights(main).filter(s => s.dir === 'v');
      const lo = Math.min(...st.map(s => s.a0)) - r2, hi = Math.max(...st.map(s => s.a1)) + r2;
      check('E: langs = vegg → kabelens ytterkant (strengende + CC/2) → vegg', [0, +lo.toFixed(1), +hi.toFixed(1), 800].join(','),
        al.length === 3 && Math.abs(al[0].to - lo) < 0.01 && Math.abs(al[1].to - hi) < 0.01 && al[2].to === 800, al.map(s => s.to.toFixed(1)).join(','));
      const t1 = tekster(room);
      check('E: tegnet: sju mål, CC-en to ganger, ikke noe 5 cm-ledd', true,
        t1.length === 7 && t1.filter(s => s === _dimFmtCmTenths(ps[1] - ps[0])).length === 2 && !t1.includes('5 cm'), t1.join(' · '));
      S.ui._pdfMode = true; let t2; try { t2 = tekster(room); } finally { S.ui._pdfMode = sUi.pdf; }
      check('E: PDF-modus tegner de samme målene', t1.join(' · '), t2.join(' · ') === t1.join(' · '), t2.join(' · '));
      const medRes = JSON.stringify(tverr(L)) + JSON.stringify(L.along[0].segs);
      room.reserveCable = false; S.cables = S.cables.filter(c => !c.reserve); _invalidateCableCache(); L = _cableDimChainLayout(room);
      check('E: kjeden er lik med og uten reservekabel', true, JSON.stringify(tverr(L)) + JSON.stringify(L.along[0].segs) === medRes, JSON.stringify(tverr(L)));
    }

    // ─── F — bad med auto-lagt kabel: samme kjede-regel (kontroll for «andre rom») ───
    room = leggAuto('bathroom', CAB2); main = S.cables.find(c => c.roomId === RID);
    if (main) { const ps = strenger(main), n = ps.length, L = _cableDimChainLayout(room);
      const fasit = [[[0, ps[0]], [ps[0], ps[1]], [ps[n - 2], ps[n - 1]], [ps[n - 1], 600]]];
      check('F: bad (geo-form) har kjede med vegg → streng og CC', JSON.stringify(fasit), JSON.stringify(tverr(L)) === JSON.stringify(fasit), JSON.stringify(tverr(L)));
      check('F: bad har ingen reservekabel', 1, S.cables.length === 1, S.cables.length);
    } else check('F: bad fikk auto-utlegg', true, false, 'null');

    // ─── G — håndlagt kabel (runs-form): reserven er ute av kjeden, uten reserve er alt som før ───
    {
      const r = ny(true); r.cableDimSnap = true;
      const uten = JSON.stringify(tverr(_cableDimChainLayout(r)));
      check('G: runs-form uten reserve — som før 236', '[[[0,40],[40,80],[520,560],[560,600]]]', uten === '[[[0,40],[40,80],[520,560],[560,600]]]', uten);
      setRoomType(RID, 'fryserom');
      const rs = S.cables.find(c => c.reserve);
      check('G: reserven er lagt 5 cm ved siden av (runs-form)', 45, !!rs && rs.runs[0].pos_cm === 45, rs && rs.runs[0].pos_cm);
      const med = JSON.stringify(tverr(_cableDimChainLayout(r)));
      check('G: kjeden er uendret av reserven (før 236: 0→40, 40→45, 555→560 …)', uten, med === uten, med);
    }

    // ─── H — måleverktøyet fester seg til kabelstrengen, likt i fryserom og bad ───
    if (app) app.style.display = 'flex'; resizeCanvas();
    for (const [type, prod] of [['fryserom', CAB], ['bathroom', CAB2]]) {
      room = leggAuto(type, prod); main = S.cables.find(c => c.roomId === RID && !c.reserve); res = S.cables.find(c => c.roomId === RID && c.reserve);
      if (!main) { check('H: ' + type + ' fikk auto-utlegg', true, false, 'null'); continue; }
      const ps = strenger(main);
      S.view.zoom = 4 / BASE_SCALE; S.view.panX = 100; S.view.panY = 400; S.ui.drawMode = 'dim'; S.drawing.rectStart = null; S.drawing.dimPending = null;
      S.snap.grid = true; S.shiftHeld = false;
      const rect = canvas.getBoundingClientRect();
      const pek = (wx, wy, dpx) => { const s = w2s(wx, wy);
        return getWorldPos({ clientX: rect.left + (s.x + (dpx || 0)) * rect.width / _cvW(), clientY: rect.top + s.y * rect.height / _cvH() }); };
      let p = pek(ps[1], 430, 3);
      check('H: ' + type + ' — 3 px fra andre hovedstreng → målet står PÅ strengen', ps[1], Math.abs(p.x - ps[1]) < 0.01, p.x);
      check('H: ' + type + ' — langs strengen følger målet rasteret som før', 450, p.y === 450, p.y);
      p = pek((ps[1] + ps[2]) / 2 + 3, 430, 0);
      check('H: ' + type + ' — midt mellom to strenger → rasteret (ikke kabelen)', 'raster', p.x % GRID === 0, p.x);
      S.shiftHeld = true; p = pek(ps[1], 430, 3); S.shiftHeld = false;
      check('H: ' + type + ' — Shift = fritt mål', 'ikke på strengen', Math.abs(p.x - ps[1]) > 0.5, p.x);
      S.drawing.rectStart = { x: 0, y: 450 }; p = pek(ps[0], 430, -2); S.drawing.rectStart = null;
      check('H: ' + type + ' — vegg → første streng måler kantavstanden nøyaktig', +ps[0].toFixed(2), Math.abs(p.x - ps[0]) < 0.01 && p.y === 450, p.x + ',' + p.y);
      if (res) { const rs = strenger(res); p = pek(rs[0], 430, 0);
        check('H: fryserom — reservestrengen kan også festes (hoved ↔ reserve = 5 cm kan måles)', +rs[0].toFixed(2), Math.abs(p.x - rs[0]) < 0.01, p.x); }
    }
    S.ui.drawMode = sUi.dm;
  } catch (e) {
    results.push({ name: 'UNNTAK', ok: false, expected: '-', got: String(e && e.stack || e) });
  } finally {
    for (const k of K) S[k] = saved[k];
    Object.assign(S.counters, sCnt); Object.assign(S.view, sView); Object.assign(S.snap, sSnap); S.shiftHeld = sShift;
    S.drawing.rectStart = sDraw.rectStart; S.drawing.dimPending = sDraw.dimPending; S.varmefolie = sVf;
    S.ui.activeFloorId = sUi.f; S.ui.activePartId = sUi.p; S.ui.selectedRoomId = sUi.r; S.ui.drawMode = sUi.dm; S.ui._pdfMode = sUi.pdf; S.ui.selectedStairId = sUi.st;
    HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(...sProds);
    _viewAsOrg = sOrg; window._showToast = sToast; window._scheduleAutoSave = sAuto; window._moduleLockDialog = sDlg;
    _undoStack.length = Math.min(_undoStack.length, undoLen);
    if (app && sApp != null) app.style.display = sApp;
    _invalidateCableCache();
    try { resizeCanvas(); renderSidebar(); updateCtxBar(); render(); } catch (e) {}
  }
  const bad = results.filter(r => !r.ok);
  console[bad.length ? 'error' : 'log']('[236] _roomTypeRegressionTest236: ' + (results.length - bad.length) + '/' + results.length, bad.length ? bad : 'GRØNN');
  return { ok: !bad.length, results };
}

