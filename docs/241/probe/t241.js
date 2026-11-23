// 241: regresjon — vegg-for-vegg (WBW) og L-form er alltid i «TEGN ROM»-baren, også over importert
// plantegning; over plantegning settes startpunktet med klikk og utsnittet står i ro; lengdene er cm;
// ukalibrert tegning gir ingen tegneknapper og W starter ikke; uten bakgrunn er baren og WBW som før.
async function _wbwOverBgRegressionTest241() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name: '241: ' + name, expected, got, ok: !!cond });
  const lagret = _buildSaveData();
  const app = document.getElementById('app');
  const keep = { toast: window._showToast, save: window._scheduleAutoSave, confirm: window.confirm, ro: S.ui.readOnly, kunde: S.ui.kundeMode,
                 part: S.ui.activePartId, floor: S.ui.activeFloorId, sb: _supabaseProjectId, view: { ...S.view }, bgs: S.bgs, appDisp: app.style.display,
                 snap: { ...S.snap }, len: document.getElementById('wbw-len').value };
  const feil = []; const paaFeil = e => feil.push(String(e.message || e));
  window.addEventListener('error', paaFeil);
  const tast = key => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  const mus = (type, x, y) => { const q = w2s(x, y), r = canvas.getBoundingClientRect(), k = r.width / _cvW();
    canvas.dispatchEvent(new MouseEvent(type, { clientX: r.left + q.x * k, clientY: r.top + q.y * k, button: 0, bubbles: true, cancelable: true })); };
  const klikkV = (x, y) => { for (const t of ['mousemove', 'mousedown', 'mouseup', 'click']) mus(t, x, y); };
  const bar = () => { updateCtxBar(); return document.getElementById('ctxbar').innerHTML; };
  const hint = () => { updHint(); return document.getElementById('sb-hint').textContent; };
  const status = () => document.getElementById('wbw-status').textContent;
  const knapper = () => { updateCtxBar(); return [...document.querySelectorAll('#ctxbar button')].map(b => b.textContent.trim()); };
  const rekke = (liste, navn) => navn.map(n => liste.findIndex(t => t.includes(n)));
  const stiger = a => a.every((v, i) => v >= 0 && (i === 0 || v > a[i - 1]));
  const wbwKnapp = () => { updateCtxBar(); return [...document.querySelectorAll('#ctxbar button')].find(b => (b.getAttribute('onclick') || '').includes("abStartDraw('wbw')")); };
  const visning = () => S.view.zoom + '/' + S.view.panX + '/' + S.view.panY;
  const nytt = () => { if (S.ui.drawMode) cancelDrawing(); _resetProjectState(); addPart('indoor'); const p = S.project.parts[0];
    S.ui.activePartId = p.id; const fid = (S.floors.find(f => f.partId === p.id) || S.floors[0]).id; S.ui.activeFloorId = fid;
    S.ui.selectedBg = null; S.ui.drawMode = null; S.ui.kundeMode = null; S.ui.readOnly = false;
    S.view.zoom = 1; S.view.panX = 500; S.view.panY = 400; return fid; };
  const medBg = (fid, kalibrert) => { const bg = _newBgObj(); bg.img = document.createElement('canvas'); bg.img.width = 200; bg.img.height = 160;
    bg.widthCm = 1000; bg.heightCm = 800; bg._needsCalibration = !kalibrert; S.bgs[fid] = bg; return bg; };
  const TEGN = ['Rektangel', 'Mål', 'Polygon', 'L-form', 'WBW'];
  try {
    window._showToast = () => {}; window._scheduleAutoSave = () => {}; window.confirm = () => true;
    app.style.display = 'flex'; resizeCanvas();
    S.snap.grid = true;

    // ── A. Uten bakgrunn: baren som før ──
    let fid = nytt();
    let k = knapper();
    check('A: uten bakgrunn — Rektangel, Mål, Polygon, L-form, WBW i den rekkefølgen', 'stigende', stiger(rekke(k, TEGN)), k.join(' | '));
    check('A: uten bakgrunn — «Importer plantegning» vises, Yttervegg og Mållinje ikke', 'ja', k.some(t => t.includes('Importer plantegning')) && !k.some(t => t.includes('Yttervegg') || t.includes('Mållinje')), k.join(' | '));
    wbwKnapp().click();
    check('A: uten bakgrunn — WBW starter som før (startpunkt satt, x = 0, y = 0)', 'started, 0/0', S.ui.drawMode === 'wbw' && S.drawing.wbw.started === true && S.drawing.wbw.startPoint.x === 0 && S.drawing.wbw.startPoint.y === 0, JSON.stringify(S.drawing.wbw.startPoint));
    check('A: uten bakgrunn — statuslinja som før', 'Skriv lengde', /Steg 1: Skriv lengde/.test(hint()) && /Skriv lengde/.test(status()), hint());
    cancelDrawing();

    // ── B. Kalibrert plantegning: WBW og L-form vises, i samme rekkefølge, så bakgrunnsverktøyene ──
    fid = nytt(); medBg(fid, true);
    k = knapper();
    check('B: kalibrert — Rektangel, Mål, Polygon, L-form, WBW, Yttervegg, Mållinje i den rekkefølgen', 'stigende', stiger(rekke(k, [...TEGN, 'Yttervegg', 'Mållinje'])), k.join(' | '));
    check('B: kalibrert — «Importer plantegning» vises ikke', 'nei', !k.some(t => t.includes('Importer plantegning')), k.join(' | '));
    check('B: kalibrert — nøyaktig én WBW- og én L-form-knapp', '1 + 1', k.filter(t => t.includes('WBW')).length === 1 && k.filter(t => t.includes('L-form')).length === 1, k.join(' | '));

    // ── C. Knappen starter WBW over tegningen: klikk setter startpunktet, utsnittet står i ro ──
    const v0 = visning();
    wbwKnapp().click();
    check('C: knappen starter vegg-for-vegg, panelet vises', 'wbw + panel', S.ui.drawMode === 'wbw' && document.getElementById('wbw-panel').style.display === 'block', S.ui.drawMode);
    check('C: startpunktet er ikke satt ennå', 'started = false', S.drawing.wbw.started === false && S.drawing.wbw.startPoint === null, JSON.stringify(S.drawing.wbw));
    check('C: utsnittet er ikke flyttet', v0, visning() === v0, visning());
    check('C: statuslinja og panelet ber om klikk på tegningen', 'Klikk på tegningen', /Klikk på tegningen/.test(hint()) && /Klikk på tegningen/.test(status()), hint() + ' / ' + status());
    render();
    document.getElementById('wbw-len').value = '400'; tast('ArrowRight');
    check('C: pil før startpunktet legger ingen vegg', '0 vegger', S.drawing.wbw.walls.length === 0 && S.ui.drawMode === 'wbw', S.drawing.wbw.walls.length);
    setWbwMode('mouse'); mus('mousemove', 300, 300); setWbwMode('keyboard');
    check('C: musemodus før startpunktet kaster ikke', 'ingen feil', feil.length === 0, feil.join(' ; '));
    klikkV(200, 300);
    const sp = S.drawing.wbw.startPoint;
    check('C: klikk på tegningen setter startpunktet der det ble klikket (rastersnapp som ellers)', '200/300', S.drawing.wbw.started === true && sp && sp.x === gridSnap(200, 300).x && sp.y === gridSnap(200, 300).y && Math.hypot(sp.x - 200, sp.y - 300) < 10, JSON.stringify(sp));
    check('C: etter startpunktet — vanlig WBW-status', 'Skriv lengde', /Skriv lengde/.test(status()) && /Steg 1: Skriv lengde/.test(hint()), status());
    klikkV(700, 700);
    check('C: nytt klikk flytter ikke startpunktet', JSON.stringify(sp), S.drawing.wbw.startPoint.x === sp.x && S.drawing.wbw.startPoint.y === sp.y, JSON.stringify(S.drawing.wbw.startPoint));

    // ── D. Rommet får riktige mål (cm, ikke bildepiksler) og blir stående der det ble tegnet ──
    const n0 = S.rooms.length;
    document.getElementById('wbw-len').value = '400'; tast('ArrowRight');
    document.getElementById('wbw-len').value = '300'; tast('ArrowDown');
    document.getElementById('wbw-len').value = '400'; tast('ArrowLeft');
    tast('Enter');
    const rom = S.rooms[S.rooms.length - 1];
    check('D: Enter lukker rommet', n0 + 1, S.rooms.length === n0 + 1 && !S.ui.drawMode, S.rooms.length);
    if (rom) {
      const len = rom.points.map((p, i) => { const q = rom.points[(i + 1) % rom.points.length]; return Math.round(Math.hypot(q.x - p.x, q.y - p.y)); });
      check('D: veggene er 400 / 300 / 400 / 300 cm', '400,300,400,300', len.join(',') === '400,300,400,300', len.join(','));
      check('D: arealet er 12 m²', '120000 cm²', Math.abs(Math.abs(rom.area) - 120000) < 1, rom.area);
      check('D: rommet står der det ble tegnet (første hjørne = startpunktet)', JSON.stringify(sp), rom.points[0].x === sp.x && rom.points[0].y === sp.y, JSON.stringify(rom.points[0]));
      check('D: rommet ligger på etasjen med plantegningen, form «wbw»', fid + '/wbw', rom.floorId === fid && rom.shape === 'wbw', rom.floorId + '/' + rom.shape);
    }
    check('D: utsnittet står fortsatt i ro', v0, visning() === v0, visning());
    closeModal();

    // ── E. Hurtigtast W og «Nytt rom»-dialogen går samme vei over plantegning ──
    S.ui.selectedRoomId = null; updateCtxBar();
    tast('w');
    check('E: W over kalibrert plantegning = vegg-for-vegg med klikk-start', 'wbw, started = false', S.ui.drawMode === 'wbw' && S.drawing.wbw.started === false && visning() === v0, S.ui.drawMode + '/' + S.drawing.wbw.started);
    cancelDrawing();
    S.ui.pendingRoomName = 'Test'; _pendingFloorId = fid; selShape('wbw'); confirmShape();
    check('E: «Nytt rom»-dialogen → Vegg-for-vegg over plantegning = klikk-start', 'wbw, started = false', S.ui.drawMode === 'wbw' && S.drawing.wbw.started === false, S.ui.drawMode + '/' + S.drawing.wbw.started);
    cancelDrawing();

    // ── F. Ukalibrert plantegning: «Sett målestokk» først, ingen tegning ──
    fid = nytt(); medBg(fid, false);
    const hb = bar(); k = knapper();
    check('F: ukalibrert — baren sier «Sett målestokk», ingen tegneknapper', '0 abStartDraw', /Sett målestokk/.test(hb) && !hb.includes('abStartDraw(') && !k.some(t => t.includes('WBW') || t.includes('L-form') || t.includes('Rektangel')), k.join(' | '));
    abStartDraw('wbw');
    check('F: ukalibrert — abStartDraw(wbw) tegner ikke', 'ingen modus', !S.ui.drawMode, S.ui.drawMode);
    updateCtxBar(); tast('w');
    check('F: ukalibrert — W tegner ikke', 'ingen modus', !S.ui.drawMode, S.ui.drawMode);
    if (S.ui.drawMode) cancelDrawing();

    // ── G. Tak-delen og kundesiden er holdt utenfor; hurtigtastpanelet har raden ──
    fid = nytt(); medBg(fid, true); S.ui.kundeMode = 'tegn';
    check('G: kundesiden — ikke klikk-start', 'false', _wbwClickStart() === false, _wbwClickStart());
    S.ui.kundeMode = null;
    check('G: innendørs med plantegning — klikk-start', 'true', _wbwClickStart() === true, _wbwClickStart());
    fid = nytt();
    check('G: uten plantegning — ikke klikk-start', 'false', _wbwClickStart() === false, _wbwClickStart());
    check('G: hurtigtastpanelet har W = Vegg-for-vegg og L = L-form', 'ja', _SHORTCUTS.some(r => r.keys[0] === 'W' && r.what === 'Vegg-for-vegg') && _SHORTCUTS.some(r => r.keys[0] === 'L' && r.what === 'L-form'), '');
    check('G: statuslinja uten valg viser L=L-form og W=WBW', 'ja', /L=L-form/.test(hint()) && /W=WBW/.test(hint()), hint());
    check('ingen feil i vinduet underveis', 'ingen', feil.length === 0, feil.join(' ; '));
  } catch (e) {
    check('testen kastet ikke', 'ingen feil', false, e.stack || String(e));
  } finally {
    window.removeEventListener('error', paaFeil);
    window._showToast = keep.toast; window._scheduleAutoSave = keep.save; window.confirm = keep.confirm;
    if (S.ui.drawMode) cancelDrawing();
    try { closeModal(); } catch (e) {}
    _restoreProject(lagret); S.bgs = keep.bgs; S.ui.readOnly = keep.ro; S.ui.kundeMode = keep.kunde;
    S.ui.activePartId = keep.part; S.ui.activeFloorId = keep.floor; _supabaseProjectId = keep.sb;
    Object.assign(S.view, keep.view); Object.assign(S.snap, keep.snap); document.getElementById('wbw-len').value = keep.len;
    app.style.display = keep.appDisp;
    renderSidebar(); updateCtxBar(); render();
  }
  const allOk = results.every(r => r.ok);
  console[allOk ? 'log' : 'error'](`_wbwOverBgRegressionTest241: ${allOk ? 'BESTÅTT' : 'FEILET'} (${results.filter(r => r.ok).length}/${results.length})`, results.filter(r => !r.ok));
  return { ok: allOk, results };
}
