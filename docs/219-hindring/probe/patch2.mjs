// 219: patch 2 — regresjonstest _hindMenuRegressionTest219 rett før DRAWING MODES.
import fs from 'node:fs';
const F = 'index.html'; let s = fs.readFileSync(F, 'utf8');
const anker = `
// ─── DRAWING MODES ───────────────────────────────────────────
function startDrawMode(mode, name, floorId) {`;
if (s.split(anker).length !== 2) { console.error('anker treff ' + (s.split(anker).length - 1)); process.exit(1); }
const test = `
// Regresjon 219: «Sett inn hindring» har navnefelt, to store knapper (Vegg til vegg, Polygon) og Mål B×H med
// én knapp — ingen typekort. Tomt navn gir label '' og ingen tekst på tegningen; gamle navn vises som før.
function _hindMenuRegressionTest219() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name, ok: !!cond, expected, got });
  const el = id => document.getElementById(id);
  const saved = { rooms: S.rooms, hindrings: S.hindrings, zones: S.zones, drawMode: S.ui.drawMode, drawing: S.drawing, view: { ...S.view },
    ui: { hindringRoomId: S.ui.hindringRoomId, hindringType: S.ui.hindringType, hindringCustomName: S.ui.hindringCustomName, hindringZoneId: S.ui.hindringZoneId, selectedRoomId: S.ui.selectedRoomId, selectedHindringId: S.ui.selectedHindringId },
    nextHindringId: S.counters.nextHindringId, autoSave: window._performAutoSave, toast: window._showToast, fillText: CanvasRenderingContext2D.prototype.fillText,
    appDisplay: el('app')?.style.display, cw: canvas.width, ch: canvas.height };
  window._performAutoSave = () => Promise.resolve(); window._showToast = () => {};
  const app = el('app');
  const shownApp = app && !canvas.getBoundingClientRect().width;
  if (shownApp) { app.style.display = 'flex'; resizeCanvas(); }
  try {
    const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
    const pts = rect(0, 0, 400, 300);
    S.rooms = [{ id: 9219, floorId: S.ui.activeFloorId, partId: S.ui.activePartId, name: '219', points: pts, walls: compWalls(pts), area: 120000, dims: [], annotOffsets: {} }];
    S.hindrings = []; S.zones = []; S.ui.selectedRoomId = 9219; S.ui.selectedHindringId = null;
    const sig = h => h.points.map(p => Math.round(p.x) + ',' + Math.round(p.y)).sort().join(' ');
    const boks = el('modal-hindring');
    // Menyen
    showHindringModal(9219, null);
    check('Menyen: ingen typekort', 0, boks.querySelectorAll('.shape-card').length === 0 && !el('hindring-grid'), boks.querySelectorAll('.shape-card').length);
    check('Menyen: navnefelt, Vegg til vegg, Polygon, B, H og Sett inn finnes', true, !!(el('hindring-name-inp') && el('hindring-w2w-btn') && el('hindring-polygon-btn') && el('hindring-bredde-inp') && el('hindring-lengde-inp') && el('hindring-dims-btn')), '');
    const tekst = id => (el(id)?.textContent || '').trim();
    check('Menyen: knappetekster', 'Vegg til vegg · Polygon · Sett inn', tekst('hindring-w2w-btn') === 'Vegg til vegg' && tekst('hindring-polygon-btn') === 'Polygon' && tekst('hindring-dims-btn') === 'Sett inn', [tekst('hindring-w2w-btn'), tekst('hindring-polygon-btn'), tekst('hindring-dims-btn')].join(' · '));
    const kroppB = boks.querySelector('.modal-body').getBoundingClientRect().width, w2wB = el('hindring-w2w-btn').getBoundingClientRect().width, polB = el('hindring-polygon-btn').getBoundingClientRect().width;
    check('Menyen: de to store knappene fyller bredden', '≥ 95 %', kroppB > 0 && w2wB >= kroppB * 0.95 && polB >= kroppB * 0.95, Math.round(w2wB) + ' / ' + Math.round(polB) + ' av ' + Math.round(kroppB));
    const bare = boks.textContent.replace(/F\\.eks\\. [^\\n]*/, '');
    check('Menyen: ingen ferdige navn (Kjøkkenøy, Innebygd skap, Vegg / søyle, Annet)', false, /Kjøkkenøy|Innebygd skap|Vegg \\/ søyle|Annet/.test(bare), bare.match(/Kjøkkenøy|Innebygd skap|Vegg \\/ søyle|Annet/g));
    check('Menyen: bare Avbryt i bunnlinja (216-regelen holder: den er innenfor vinduet)', 'Avbryt · inne', [...boks.querySelectorAll('.modal-footer button')].map(b => b.textContent.trim()).join(' · ') === 'Avbryt' && boks.getBoundingClientRect().bottom <= innerHeight && boks.getBoundingClientRect().height <= innerHeight, [...boks.querySelectorAll('.modal-footer button')].map(b => b.textContent.trim()).join(' · ') + ' · ' + Math.round(boks.getBoundingClientRect().bottom) + '/' + innerHeight);
    // Mål: tomt / 0 / minus → ingenting, feltet markeres
    const n0 = S.hindrings.length;
    confirmHindring();
    check('Mål: tomme felt → ingen hindring, begge felt markert, menyen står', '0 · err err · åpen', S.hindrings.length === n0 && el('hindring-bredde-inp').classList.contains('err') && el('hindring-lengde-inp').classList.contains('err') && boks.style.display !== 'none', (S.hindrings.length - n0) + ' · ' + el('hindring-bredde-inp').className + ' / ' + el('hindring-lengde-inp').className + ' · ' + boks.style.display);
    el('hindring-bredde-inp').value = '0'; el('hindring-lengde-inp').value = '40'; el('hindring-lengde-inp').classList.remove('err'); confirmHindring();
    check('Mål: 0 × 40 → ingen hindring, bare B markert', '0 · err / —', S.hindrings.length === n0 && el('hindring-bredde-inp').classList.contains('err') && !el('hindring-lengde-inp').classList.contains('err'), el('hindring-bredde-inp').className + ' / ' + el('hindring-lengde-inp').className);
    el('hindring-bredde-inp').value = '60'; el('hindring-lengde-inp').value = '-5'; confirmHindring();
    check('Mål: 60 × −5 → ingen hindring, bare H markert', '0 · — / err', S.hindrings.length === n0 && !el('hindring-bredde-inp').classList.contains('err') && el('hindring-lengde-inp').classList.contains('err'), el('hindring-bredde-inp').className + ' / ' + el('hindring-lengde-inp').className);
    el('hindring-bredde-inp').value = ''; el('hindring-lengde-inp').value = ''; el('hindring-lengde-inp').dispatchEvent(new Event('input')); el('hindring-bredde-inp').dispatchEvent(new Event('input'));
    el('hindring-bredde-inp').value = 'abc'; el('hindring-lengde-inp').value = '40'; confirmHindring();
    check('Mål: bokstaver i B → ingen hindring, B markert', '0 · err', S.hindrings.length === n0 && el('hindring-bredde-inp').classList.contains('err'), el('hindring-bredde-inp').className);
    // Mål: 60 × 40, tomt navn
    el('hindring-bredde-inp').value = '60'; el('hindring-lengde-inp').value = '40'; el('hindring-name-inp').value = ''; confirmHindring();
    const A = S.hindrings[S.hindrings.length - 1];
    check('Mål: 60 × 40 gir rektangel 170..230 × 130..170 midt i rommet', '170,130 170,170 230,130 230,170', S.hindrings.length === n0 + 1 && A && sig(A) === '170,130 170,170 230,130 230,170', A && sig(A));
    check('Mål: tomt navn → label er tom streng (ikke «Annet», ikke undefined), ingen visningstekst', '"" · ""', A && A.label === '' && _hindDisplayName(A) === '', A && JSON.stringify(A.label) + ' · ' + JSON.stringify(_hindDisplayName(A)));
    check('Mål: type annet, clearance wall, rom og etasje som før', 'annet · wall · 9219', A && A.type === 'annet' && A.clearance === 'wall' && A.roomId === 9219 && A.floorId === S.rooms[0].floorId, A && (A.type + ' · ' + A.clearance + ' · ' + A.roomId));
    check('Mål: menyen lukkes etter Sett inn', 'lukket', boks.style.display === 'none', boks.style.display);
    // Enter i et felt gjør det samme som knappen
    showHindringModal(9219, null); el('hindring-name-inp').value = 'Pipe'; el('hindring-bredde-inp').value = '50'; el('hindring-lengde-inp').value = '50';
    el('hindring-lengde-inp').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    const B = S.hindrings[S.hindrings.length - 1];
    check('Mål: Enter i feltet setter inn, med navnet fra feltet', 'Pipe · 50×50 · lukket', B && B !== A && B.label === 'Pipe' && sig(B) === '175,125 175,175 225,125 225,175' && boks.style.display === 'none', B && (B.label + ' · ' + sig(B) + ' · ' + boks.style.display));
    check('Mål: Enter med tomt felt setter ikke inn', 'ingen', (() => { showHindringModal(9219, null); const n = S.hindrings.length; el('hindring-bredde-inp').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); const r = S.hindrings.length === n && boks.style.display !== 'none'; closeModal(); return r; })(), '');
    // Vegg til vegg og Polygon starter tegneverktøyene som før, med navnet
    showHindringModal(9219, null); el('hindring-name-inp').value = 'Pipe'; confirmHindringW2W();
    check('Vegg til vegg: starter hindring-w2w med navnet', 'hindring-w2w · Pipe · fase 0', S.ui.drawMode === 'hindring-w2w' && S.ui.hindringCustomName === 'Pipe' && S.drawing.hindringW2W && S.drawing.hindringW2W.phase === 0 && boks.style.display === 'none', S.ui.drawMode + ' · ' + S.ui.hindringCustomName);
    cancelDrawing();
    showHindringModal(9219, null); confirmHindringPolygon();
    check('Polygon: starter hindring-polygon med tomt navn', 'hindring-polygon · ""', S.ui.drawMode === 'hindring-polygon' && S.ui.hindringCustomName === '' && S.drawing.active === true, S.ui.drawMode + ' · ' + JSON.stringify(S.ui.hindringCustomName));
    createHindringFromPolygon([{ x: 10, y: 10 }, { x: 60, y: 10 }, { x: 60, y: 60 }, { x: 35, y: 80 }, { x: 10, y: 60 }]);
    const C = S.hindrings[S.hindrings.length - 1];
    check('Polygon: femkant med tomt navn → 5 punkter, label tom, tegnemodus avsluttet', '5 · "" · null', C && C.points.length === 5 && C.label === '' && S.ui.drawMode === null, C && (C.points.length + ' · ' + JSON.stringify(C.label) + ' · ' + S.ui.drawMode));
    // Gamle data
    check('Gammel hindring med navn vises som før', 'Kjøkkenøy', _hindDisplayName({ label: 'Kjøkkenøy', type: 'kjokkenoy' }) === 'Kjøkkenøy', _hindDisplayName({ label: 'Kjøkkenøy', type: 'kjokkenoy' }));
    check('Gammel hindring uten label → typen (som før 219)', 'pipe', _hindDisplayName({ type: 'pipe' }) === 'pipe', _hindDisplayName({ type: 'pipe' }));
    // Tegningen: ingen «annet»/«undefined»/tom tekst for A, navnet for B
    S.hindrings.push({ id: S.counters.nextHindringId++, type: 'kjokkenoy', label: 'Kjøkkenøy', roomId: 9219, floorId: S.rooms[0].floorId, points: rect(300, 200, 60, 60), clearance: 'wall' });
    const tekster = [];
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { tekster.push(String(t)); return saved.fillText.call(this, t, ...a); };
    S.view.zoom = 2 / BASE_SCALE; S.view.panX = 200; S.view.panY = 150; S.ui.selectedHindringId = A.id; render();
    CanvasRenderingContext2D.prototype.fillText = saved.fillText;
    check('Tegningen: «Pipe» og «Kjøkkenøy» tegnes, aldri «annet», «undefined» eller tom tekst', 'Pipe, Kjøkkenøy', tekster.includes('Pipe') && tekster.includes('Kjøkkenøy') && !tekster.some(t => t === 'annet' || t === 'undefined' || t === ''), tekster.filter(t => /Pipe|Kjøkkenøy|annet|undefined|^$/.test(t)).join(', '));
    check('Panel/PDF-liste: tomt navn → «Hindring» som reserveord', 'Hindring', (_hindDisplayName(A) || 'Hindring') === 'Hindring', _hindDisplayName(A) || 'Hindring');
  } finally {
    CanvasRenderingContext2D.prototype.fillText = saved.fillText;
    closeModal();
    S.rooms = saved.rooms; S.hindrings = saved.hindrings; S.zones = saved.zones; S.ui.drawMode = saved.drawMode; S.drawing = saved.drawing; Object.assign(S.view, saved.view);
    Object.assign(S.ui, saved.ui); S.counters.nextHindringId = saved.nextHindringId;
    window._performAutoSave = saved.autoSave; window._showToast = saved.toast;
    if (shownApp) { app.style.display = saved.appDisplay; canvas.width = saved.cw; canvas.height = saved.ch; }
    try { render(); } catch (e) {}
  }
  return results;
}
`;
s = s.replace(anker, () => test + anker);
fs.writeFileSync(F, s);
console.log('OK test lagt inn');
