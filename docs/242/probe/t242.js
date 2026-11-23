// 242: regresjon — hurtigtastene R, M og P (og L, W) krever kalibrert plantegning, som knappene;
// med kalibrert eller ingen plantegning starter R/M/P som før med riktig romnavn og etasje;
// WBW-statuslinja teller veggene (wbw.walls) og følger med etter hver vegg, med og uten plantegning.
async function _drawHotkeyCalibRegressionTest242() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name: '242: ' + name, expected, got, ok: !!cond });
  const lagret = _buildSaveData();
  const app = document.getElementById('app');
  const keep = { toast: window._showToast, save: window._scheduleAutoSave, confirm: window.confirm, ro: S.ui.readOnly, kunde: S.ui.kundeMode,
                 part: S.ui.activePartId, floor: S.ui.activeFloorId, sb: _supabaseProjectId, view: { ...S.view }, bgs: S.bgs, appDisp: app.style.display,
                 snap: { ...S.snap }, len: document.getElementById('wbw-len').value, prompt: S.ui.promptRoomNameOnCreate, pf: _pendingFloorId };
  const feil = []; const paaFeil = e => feil.push(String(e.message || e));
  window.addEventListener('error', paaFeil);
  const tast = key => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  const mus = (type, x, y) => { const q = w2s(x, y), r = canvas.getBoundingClientRect(), k = r.width / _cvW();
    canvas.dispatchEvent(new MouseEvent(type, { clientX: r.left + q.x * k, clientY: r.top + q.y * k, button: 0, bubbles: true, cancelable: true })); };
  const klikkV = (x, y) => { for (const t of ['mousemove', 'mousedown', 'mouseup', 'click']) mus(t, x, y); };
  // Statuslinja leses som den STÅR — uten å kalle updHint() først (feilen var også at den ikke ble oppdatert).
  const linje = () => document.getElementById('sb-hint').textContent;
  const status = () => document.getElementById('wbw-status').textContent;
  const tittel = () => document.getElementById('wbw-panel-title').textContent;
  const barTekst = () => document.getElementById('ctxbar').textContent;
  // Nytt prosjekt med TO etasjer, den andre aktiv — da skiller «aktiv etasje» seg fra «første etasje».
  const nytt = () => { if (S.ui.drawMode) cancelDrawing(); _resetProjectState(); addPart('indoor'); const p = S.project.parts[0];
    S.ui.activePartId = p.id; const fid = _addFloorToPart(p.id, '2. etasje').id; S.ui.activeFloorId = fid;
    S.ui.selectedBg = null; S.ui.drawMode = null; S.ui.kundeMode = null; S.ui.readOnly = false; S.ui.selectedRoomId = null;
    S.view.zoom = 1; S.view.panX = 500; S.view.panY = 400; renderSidebar(); updateCtxBar(); return fid; };
  const medBg = (fid, kalibrert) => { const bg = _newBgObj(); bg.img = document.createElement('canvas'); bg.img.width = 200; bg.img.height = 160;
    bg.widthCm = 1000; bg.heightCm = 800; bg._needsCalibration = !kalibrert; S.bgs[fid] = bg; updateCtxBar(); return bg; };
  const MODUS = { r: 'rect2', m: 'rect-dim', p: 'polygon' };
  // R/M/P starter, og rommet som tegnes får navnet fra navnefeltet og ligger på den aktive etasjen.
  const starter = (lbl, fid) => {
    for (const key of ['r', 'M', 'p']) {
      const modus = MODUS[key.toLowerCase()], navn = 'Kjøkken ' + key, K = key.toUpperCase();
      S.ui.selectedRoomId = null; updateCtxBar();
      const ni = document.getElementById('ctxbar-room-name');
      check(lbl + ': navnefeltet finnes i baren (' + K + ')', 'ja', !!ni, '');
      if (ni) ni.value = navn;
      S.ui.pendingFloorId = null; S.ui.pendingRoomName = null; _pendingFloorId = null;
      const n0 = S.rooms.length;
      tast(key);
      check(lbl + ': ' + K + ' starter «' + modus + '»', modus, S.ui.drawMode === modus, S.ui.drawMode);
      check(lbl + ': ' + K + ' — romnavn fra navnefeltet, aktiv etasje i begge etasje-variablene', navn + '/' + fid + '/' + fid,
        S.ui.pendingRoomName === navn && S.ui.pendingFloorId === fid && _pendingFloorId === fid, S.ui.pendingRoomName + '/' + S.ui.pendingFloorId + '/' + _pendingFloorId);
      if (modus === 'rect2') { klikkV(100, 100); klikkV(400, 300); }
      else if (modus === 'rect-dim') { document.getElementById('ddp-w').value = '400'; document.getElementById('ddp-h').value = '300'; confirmDdpRect(); }
      else { klikkV(600, 100); klikkV(900, 100); klikkV(900, 400); tast('Enter'); }
      const rom = S.rooms[S.rooms.length - 1];
      check(lbl + ': ' + K + ' — rommet er tegnet, heter «' + navn + '» og ligger på aktiv etasje', navn + '/' + fid,
        S.rooms.length === n0 + 1 && rom && rom.name === navn && rom.floorId === fid && !S.ui.drawMode, S.rooms.length + ' rom · ' + (rom && (rom.name + '/' + rom.floorId)) + ' · modus ' + S.ui.drawMode);
    }
    // Tomt navnefelt → «Rom N» som før.
    S.ui.selectedRoomId = null; updateCtxBar();
    const ni = document.getElementById('ctxbar-room-name'); if (ni) ni.value = '';
    const std = _roomWord(true) + ' ' + S.counters.nextRoomId;
    tast('R');
    check(lbl + ': tomt navnefelt gir standardnavnet', std, S.ui.drawMode === 'rect2' && S.ui.pendingRoomName === std, S.ui.drawMode + '/' + S.ui.pendingRoomName);
    cancelDrawing();
  };
  // Veggnummeret i statuslinja nederst, i panelet og i panelets tittel etter 0, 1, 2 og 3 vegger.
  const vegger = (lbl, klikkStart) => {
    S.ui.selectedRoomId = null; updateCtxBar();
    tast('w');
    if (klikkStart) {
      check(lbl + ': før startpunktet — «Klikk på tegningen»', 'Klikk på tegningen', /^Steg 1: Klikk på tegningen/.test(linje()), linje());
      klikkV(200, 300);
    }
    check(lbl + ': vegg-for-vegg er startet', 'wbw, started', S.ui.drawMode === 'wbw' && S.drawing.wbw.started === true, S.ui.drawMode);
    const steg = [[400, 'ArrowRight'], [300, 'ArrowDown'], [200, 'ArrowLeft']];
    for (let n = 0; n <= 3; n++) {
      if (n > 0) { document.getElementById('wbw-len').value = String(steg[n - 1][0]); tast(steg[n - 1][1]); }
      const ant = S.drawing.wbw ? S.drawing.wbw.walls.length : -1;
      const ventet = n === 0 ? 'Steg 1: Skriv lengde på første vegg' : 'Vegg ' + (n + 1) + ':';
      check(lbl + ': ' + n + ' vegger lagt — statuslinja', ventet, ant === n && linje().startsWith(ventet), ant + ' vegger · ' + linje());
      check(lbl + ': ' + n + ' vegger lagt — panelet', n === 0 ? 'Skriv lengde' : n + ' vegg(er) lagt til, tittel Vegg ' + (n + 1),
        (n === 0 ? /^Skriv lengde/.test(status()) : status().startsWith(n + ' vegg' + (n !== 1 ? 'er' : '') + ' lagt til')) && tittel().startsWith('Vegg ' + (n + 1) + ' '), status() + ' / ' + tittel());
    }
    check(lbl + ': 3 vegger — statuslinja sier at Enter lukker rommet', 'Enter uten lengde lukker', /Enter uten lengde lukker rom/.test(linje()), linje());
    undoWbwWall();
    check(lbl + ': angre siste vegg → «Vegg 3:»', 'Vegg 3:', linje().startsWith('Vegg 3:'), linje());
    setWbwMode('mouse'); setWbwMode('keyboard');
    check(lbl + ': bytte Mus/Tastatur beholder veggnummeret', 'Vegg 3:', linje().startsWith('Vegg 3:'), linje());
    cancelDrawing();
    check(lbl + ': etter avbrudd — vanlig statuslinje igjen', 'R=Rektangel', /R=Rektangel/.test(linje()) && !S.ui.drawMode, linje());
  };
  try {
    window._showToast = () => {}; window._scheduleAutoSave = () => {}; window.confirm = () => true;
    app.style.display = 'flex'; resizeCanvas();
    S.snap.grid = true; S.ui.promptRoomNameOnCreate = false;

    // ── A. Ukalibrert plantegning: ingen av R, M, P, L, W starter tegning ──
    let fid = nytt(); medBg(fid, false);
    for (const key of 'rRmMpPlLwW') {
      updateCtxBar();
      const n0 = S.rooms.length;
      tast(key);
      const ls = document.getElementById('modal-lshape'), ddp = document.getElementById('ddp-w');
      const stille = !S.ui.drawMode && !S.drawing.active && S.rooms.length === n0 && (!ls || ls.style.display === 'none')
        && document.getElementById('wbw-panel').style.display !== 'block' && !(ddp && ddp.offsetParent);
      check('A: ukalibrert — ' + key + ' starter ingen tegning', 'ingen modus, ingen dialog', stille, 'modus ' + S.ui.drawMode + ' · aktiv ' + S.drawing.active);
      check('A: ukalibrert — ' + key + ' gir «Ikke kalibrert / Sett målestokk» i baren', 'ja', /Ikke kalibrert/.test(barTekst()) && /Sett målestokk/.test(barTekst()), barTekst().replace(/\s+/g, ' ').slice(0, 120));
      if (S.ui.drawMode) cancelDrawing();
      try { closeModal(); } catch (e) {}
    }
    check('A: ukalibrert — ingen rom laget', 0, S.rooms.length === 0, S.rooms.length);

    // ── B. Kalibrert plantegning: R, M, P som før, riktig navn og etasje ──
    fid = nytt(); medBg(fid, true);
    check('B: aktiv etasje er ikke den første (testen skiller dem)', 'ulik', S.floors[0].id !== fid, S.floors[0].id + '/' + fid);
    starter('B kalibrert', fid);

    // ── C. Ingen plantegning: R, M, P som før ──
    fid = nytt();
    starter('C uten plantegning', fid);

    // ── D. WBW-statuslinja teller veggene, uten og med plantegning ──
    fid = nytt();
    vegger('D uten plantegning', false);
    fid = nytt(); medBg(fid, true);
    vegger('D med plantegning', true);

    // ── E. Hurtigtastpanelet har radene ──
    check('E: hurtigtastpanelet har R, M, P, L og W', 'alle fem', ['R', 'M', 'P', 'L', 'W'].every(t => _SHORTCUTS.some(r => r.keys[0] === t)), _SHORTCUTS.filter(r => 'RMPLW'.includes(r.keys[0])).map(r => r.keys[0] + '=' + r.what).join(', '));
    check('ingen feil i vinduet underveis', 'ingen', feil.length === 0, feil.join(' ; '));
  } catch (e) {
    check('testen kastet ikke', 'ingen feil', false, e.stack || String(e));
  } finally {
    window.removeEventListener('error', paaFeil);
    window._showToast = keep.toast; window._scheduleAutoSave = keep.save; window.confirm = keep.confirm;
    if (S.ui.drawMode) cancelDrawing();
    try { closeModal(); } catch (e) {}
    _restoreProject(lagret); S.bgs = keep.bgs; S.ui.readOnly = keep.ro; S.ui.kundeMode = keep.kunde;
    S.ui.activePartId = keep.part; S.ui.activeFloorId = keep.floor; _supabaseProjectId = keep.sb; _pendingFloorId = keep.pf;
    S.ui.promptRoomNameOnCreate = keep.prompt;
    Object.assign(S.view, keep.view); Object.assign(S.snap, keep.snap); document.getElementById('wbw-len').value = keep.len;
    app.style.display = keep.appDisp;
    renderSidebar(); updateCtxBar(); render();
  }
  const allOk = results.every(r => r.ok);
  console[allOk ? 'log' : 'error']('_drawHotkeyCalibRegressionTest242: ' + (allOk ? 'BESTÅTT' : 'FEILET') + ' (' + results.filter(r => r.ok).length + '/' + results.length + ')', results.filter(r => !r.ok));
  return { ok: allOk, results };
}
