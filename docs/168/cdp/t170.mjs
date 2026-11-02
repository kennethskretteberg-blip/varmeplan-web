// 170: modul-lås for kundebedrifter — dashbord, modulvalg, hurtigprosjektering, romtype, delt
// snøprosjekt, «vis som», forespørselsdialogen og Cenikas avkrysningsliste. Alt mot mock: rpc og
// organizations-oppslag — ingen database-lesing eller -skriving.
import { openPage } from './cdp.mjs';
const out = process.argv[2] || '/tmp/t170';
const p = await openPage(null);
await p.goto('http://localhost:4000/');
const errs = () => p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
console.log('sidefeil ved lasting:', errs().length, errs().slice(0, 3));

const MOCK = `{
  window._real = window._real || _db;
  window._calls = { rpc: [], from: [] };
  window._rpcAnswers = window._rpcAnswers || {};
  _db = Object.assign(Object.create(_real), {
    rpc: async (fn, args) => { _calls.rpc.push([fn, args]); const a = _rpcAnswers[fn]; return typeof a === 'function' ? a(args) : (a || { data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }); },
    from: (t) => { const q = { select(c){ _calls.from.push([t, c]); return q; }, eq(){ return q; },
      maybeSingle: async () => (window._orgRow ? { data: window._orgRow, error: null } : { data: null, error: { code: '42703', message: 'column organizations.allowed_modules does not exist' } }) }; return q; } });
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = function(){};
  for (const k in _modContactCache) delete _modContactCache[k];
}`;
const KUNDE = `_currentUser = { id: 'u-kunde', app_metadata: {}, user_metadata: { full_name: 'Ola Welhaven' } };
  _viewAsOrg = null;
  _userOrg = { id: 'org-kunde', name: 'Welhaven Elektro AS', org_type: 'installer', allowed_modules: ['indoor', 'list'] };
  _rpcAnswers.module_request_contact = { data: { supplier_org_id: 'org-cenika', supplier_name: 'Cenika', contact_email: 'post@cenika.no' }, error: null };`;
const dash = `document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'none';
  document.getElementById('module-screen').style.display = 'none';
  document.getElementById('project-list-screen').style.display = 'flex';
  _renderDashModules(); _renderDashTools();`;
const tiles = `[...document.querySelectorAll('#dash-modules .dash-tile, #dash-tools .dash-tile')].map(b => b.querySelector('.dt-lbl').innerText + (b.classList.contains('locked') ? ' 🔒' : ''))`;
const dlg = `(() => { const o = document.getElementById('_modlock-ov'); if (!o) return null; const a = document.getElementById('_modlock-mail');
  return { tekst: document.getElementById('_modlock-txt').innerText, knapp: a ? a.innerText : null, href: a ? decodeURIComponent(a.getAttribute('href')) : null }; })()`;
const wait = ms => `await new Promise(r => setTimeout(r, ${ms}));`;

// ── 1. Kundebedrift på dashbordet ────────────────────────────────────────────
const r1 = await p.eval(`(async () => {
  ${MOCK} ${KUNDE} ${dash}
  const res = { fliser: ${tiles} };
  document.querySelector('#dash-modules .dash-tile.locked').click();   // første låste: Trapper
  ${wait(80)}
  res.trappDialog = ${dlg};
  document.getElementById('_modlock-ov')?.remove();
  _quickStartModule('snow'); ${wait(80)}
  res.snoDialog = ${dlg};
  res.snoStartetIkke = document.getElementById('project-list-screen').style.display !== 'none';
  document.getElementById('_modlock-ov')?.remove();
  _openFrostModule(); ${wait(50)}
  res.frostModalÅpnet = !!document.getElementById('frost-modal-bg');
  res.frostDialog = !!document.getElementById('_modlock-ov');
  document.getElementById('_modlock-ov')?.remove();
  _openSnowCalc(); ${wait(50)}
  res.snowcalcModalÅpnet = !!document.getElementById('snow-modal-bg');
  document.getElementById('_modlock-ov')?.remove();
  return res;
})()`);
console.log('1 kunde dashbord', JSON.stringify(r1, null, 1));

await p.eval(`(async () => { ${dash} _quickStartModule('snow'); ${wait(80)} })()`);
await p.shot(out + '-1-dialog.png');
await p.eval(`document.getElementById('_modlock-ov')?.remove()`);

// ── 2. Nytt prosjekt: modulvalget, innendørs, romtype, produktpanel ───────────
const r2 = await p.eval(`(async () => {
  ${MOCK} ${KUNDE}
  _resetProjectState(); S.project.name = 'Hytta'; S.project.description = 'Fjellvegen 1'; _supabaseProjectId = 'abc-123';
  showModuleScreen();
  const res = { modulvalg: [...document.querySelectorAll('#module-grid .module-tile')].map(t => t.querySelector('.module-tile-name').innerText + (t.classList.contains('locked') ? ' 🔒' : '')) };
  addPart('snow'); ${wait(80)}
  res.snoDelLaget = S.project.parts.length;
  res.dialogMedProsjekt = ${dlg};
  document.getElementById('_modlock-ov')?.remove();
  addPart('indoor');
  res.inneDel = S.project.parts.map(p => p.moduleType);
  const room = createRoom([{x:0,y:0},{x:400,y:0},{x:400,y:300},{x:0,y:300}], 'rect', 'Bad', S.floors[0]?.id ?? null, true);
  res.romLaget = !!room;
  res.fryseromSvar = setRoomType(room.id, 'fryserom');
  res.romtypeEtterFryserom = room.roomType;
  res.fryseromDialog = !!document.getElementById('_modlock-ov');
  document.getElementById('_modlock-ov')?.remove();
  setRoomType(room.id, 'bathroom');
  res.romtypeBad = room.roomType;
  S.ui.selectedRoomId = room.id; renderSidebar();
  res.sidepanelFryseromMerket = [...document.querySelectorAll('select option')].some(o => o.value === 'fryserom' && /🔒/.test(o.textContent));
  showUnifiedProductPanel(); ${wait(30)}
  res.produktpanelÅpent = !!document.getElementById('upc-room-type') && !document.getElementById('_modlock-ov');
  res.upcFryseromMerket = [...document.querySelectorAll('#upc-room-type option')].filter(o => /🔒/.test(o.textContent)).map(o => o.value);
  _upcRoomTypeChanged('fryserom');
  res.upcEtter = room.roomType + ' / select=' + document.getElementById('upc-room-type').value;
  document.getElementById('_modlock-ov')?.remove();
  setRoomModuleType(room.id, 'snow'); ${wait(30)}
  res.varmetypeUteSperret = (room.moduleType || 'indoor') + ' / dialog=' + !!document.getElementById('_modlock-ov');
  document.getElementById('_modlock-ov')?.remove();
  res.dupeUte = dupeRoom(room.id, { withProducts: false, moduleType: 'snow' }) === null;
  document.getElementById('_modlock-ov')?.remove();
  res.dupeInne = !!dupeRoom(room.id, { withProducts: false, moduleType: 'indoor' });
  renderModuleNav();
  res.modulNav = [...document.querySelectorAll('#tb-module-nav .tb-mod-grid .tb-mod-btn')].map(b => b.querySelector('.mod-lbl').innerText + (/lock|leverandøren/.test(b.title) ? ' 🔒' : ''));
  return res;
})()`);
console.log('2 nytt prosjekt', JSON.stringify(r2, null, 1));
await p.eval(`(async () => { showModuleScreen(); })()`);
await p.shot(out + '-2-modulvalg.png');

// ── 3. Hurtigprosjektering: Utendørs låst ─────────────────────────────────────
const r3 = await p.eval(`(async () => {
  ${MOCK} ${KUNDE} ${dash}
  _quickStartModule('list'); ${wait(100)}
  const d = _listDraftRoom();
  const res = { utkast: !!d, env: d && d.moduleType };
  const sel = document.getElementById('li-env-' + d.id);
  res.uteMerket = sel ? [...sel.options].map(o => o.textContent) : null;
  _listOnEnv(d.id, 'snow'); ${wait(30)}
  res.etterUte = d.moduleType + ' / select=' + (sel && sel.value) + ' / dialog=' + !!document.getElementById('_modlock-ov');
  document.getElementById('_modlock-ov')?.remove();
  const part = _listActivePart();
  res.arvSnoBlirInne = _listCreateRoomObj(part, S.floors.find(f => f.partId === part.id), 'snow').moduleType;
  S.counters.nextRoomId--;
  return res;
})()`);
console.log('3 hurtigprosjektering', JSON.stringify(r3, null, 1));
await p.shot(out + '-3-hurtig.png');

// ── 4. Delt snøprosjekt (Cenika prosjekterte, kunden åpner) ──────────────────
const r4 = await p.eval(`(async () => {
  ${MOCK} ${KUNDE}
  _resetProjectState(); S.project.name = 'Oppkjørsel Berg';
  S.project.parts = [{ id: 1, name: 'Utendørs snøsmelting', moduleType: 'snow', createdAt: 1 }]; S.project.type = 'snow';
  S.counters.nextPartId = 2;
  S.floors = [{ id: 1, name: 'Plan 1', order: 0, partId: 1 }];
  S.rooms = [{ id: 1, name: 'Oppkjørsel', floorId: 1, partId: 1, moduleType: 'snow', shape: 'rect', points: [{x:0,y:0},{x:600,y:0},{x:600,y:400},{x:0,y:400}], walls: [], dims: [], annotOffsets: {} }];
  S.counters.nextRoomId = 2;
  _enterPart(S.project.parts[0]); ${wait(50)}
  const res = { åpnet: document.getElementById('app').style.display === 'flex', rom: S.rooms.length };
  renderModuleNav();
  res.modulNav = [...document.querySelectorAll('#tb-module-nav .tb-mod-grid .tb-mod-btn')].map(b => b.querySelector('.mod-lbl').innerText + (/leverandøren/.test(b.title) ? ' 🔒' : ''));
  _navToModule('snow');
  res.byttTilSnoOk = S.ui.activePartId === 1 && !document.getElementById('_modlock-ov');
  res.nyttSnoRom = createRoom([{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}], 'rect', 'Ny', 1, true);
  res.nyttSnoRomDialog = !!document.getElementById('_modlock-ov');
  document.getElementById('_modlock-ov')?.remove();
  S.ui.selectedRoomId = 1;
  showUnifiedProductPanel(); ${wait(30)}
  res.utleggSperret = !!document.getElementById('_modlock-ov');
  document.getElementById('_modlock-ov')?.remove();
  res.romFortsatt = S.rooms.length;
  return res;
})()`);
console.log('4 delt snøprosjekt', JSON.stringify(r4, null, 1));

// ── 5. Superadmin og «vis som» ───────────────────────────────────────────────
const r5 = await p.eval(`(async () => {
  ${MOCK} ${dash}
  _currentUser = { id: 'u-adm', app_metadata: { is_superadmin: true } };
  _userOrg = { id: 'org-cenika', name: 'Cenika AS', org_type: 'supplier', allowed_modules: null };
  _viewAsOrg = null; _renderDashModules(); _renderDashTools();
  const res = { superadmin: ${tiles} };
  _viewAsOrgs = [{ id: 'org-kunde', name: 'Welhaven Elektro AS', org_type: 'installer' }];
  window._orgRow = { allowed_modules: ['indoor', 'list'] };
  await _viewAsSet('org-kunde');
  res.visSomKunde = ${tiles};
  res.hentetModuler = _calls.from.filter(f => f[0] === 'organizations' && /allowed_modules/.test(f[1])).length;
  _viewAsEnd();
  res.etterVisSom = ${tiles}.filter(t => /🔒/.test(t)).length;
  // Fail-open: kolonnen mangler → ingen lås
  window._orgRow = null;
  const o = { id: 'x', name: 'X' }; await _loadOrgModules(o);
  res.utenMigrasjon = o.allowed_modules === undefined && _moduleAllowed('snow', o);
  return res;
})()`);
console.log('5 superadmin / vis som', JSON.stringify(r5, null, 1));

// ── 6. Uten kontaktadresse / uten migrasjon ──────────────────────────────────
const r6 = await p.eval(`(async () => {
  ${MOCK} ${KUNDE} ${dash}
  _rpcAnswers.module_request_contact = { data: { supplier_name: 'Cenika', contact_email: null }, error: null };
  _moduleLockDialog('stair'); ${wait(60)}
  const res = { utenAdresse: document.getElementById('_modlock-ov').innerText.replace(/\\s+/g, ' ') };
  document.getElementById('_modlock-ov')?.remove();
  delete _rpcAnswers.module_request_contact; for (const k in _modContactCache) delete _modContactCache[k];
  _moduleLockDialog('fryserom'); ${wait(60)}
  res.utenFunksjon = document.getElementById('_modlock-ov').innerText.replace(/\\s+/g, ' ');
  document.getElementById('_modlock-ov')?.remove();
  return res;
})()`);
console.log('6 uten adresse/migrasjon', JSON.stringify(r6, null, 1));

// ── 7. Cenika: moduler per kunde ─────────────────────────────────────────────
const r7 = await p.eval(`(async () => {
  ${MOCK}
  _currentUser = { id: 'u-cen', app_metadata: {} }; _viewAsOrg = null;
  _userOrg = { id: 'org-cenika', name: 'Cenika AS', org_type: 'supplier', supplier_name: 'Cenika', allowed_modules: null };
  ${dash}
  _showProjectListScreen && _showProjectListScreen();
  _switchDashTab('customers');
  const res = { knapp: getComputedStyle(document.getElementById('cust-mod-btn')).display !== 'none' };
  _rpcAnswers.list_customer_modules = { data: [
    { org_id: 'k1', name: 'Welhaven Elektro AS', org_nr: '123456785', allowed_modules: ['indoor', 'list'] },
    { org_id: 'k2', name: 'Gammel Elektro AS', org_nr: null, allowed_modules: null } ], error: null };
  _rpcAnswers.set_customer_modules = (a) => ({ data: { org_id: a.p_org_id, allowed_modules: a.p_modules }, error: null });
  _cmodState = { open: false, rows: null, err: null, busy: {}, msg: {} };
  _cmodToggle(); ${wait(80)}
  res.rader = [...document.querySelectorAll('.cmod-row')].map(r => r.innerText.split('\\n')[0]);
  res.avkrysset = [...document.querySelectorAll('.cmod-row[data-org="k1"] .cmod-cb')].filter(c => c.checked).map(c => c.dataset.key);
  const cb = document.querySelector('.cmod-row[data-org="k1"] .cmod-cb[data-key="snow"]');
  cb.checked = true; cb.dispatchEvent(new Event('change')); ${wait(80)}
  res.setKall = _calls.rpc.filter(c => c[0] === 'set_customer_modules').map(c => c[1]);
  res.melding = document.querySelector('.cmod-row[data-org="k1"]').innerText.split('\\n').pop();
  _rpcAnswers.set_customer_modules = { data: null, error: { message: 'NOT_ALLOWED: kundebedriften er opprettet eller godkjent av en annen leverandoer' } };
  await _cmodSet('k2', 'frost', false);
  res.feilmelding = document.querySelector('.cmod-row[data-org="k2"]').innerText.split('\\n').pop();
  return res;
})()`);
console.log('7 Cenika moduler', JSON.stringify(r7, null, 1));
await p.shot(out + '-7-cenika.png');

// Kundebedrift ser ikke knappen
const r8 = await p.eval(`(async () => { ${MOCK} ${KUNDE} _showProjectListScreen && _showProjectListScreen(); return { kundeSerKnapp: getComputedStyle(document.getElementById('cust-mod-btn')).display !== 'none' }; })()`);
console.log('8', JSON.stringify(r8));
console.log('sidefeil totalt:', errs().length, errs().slice(0, 3));
await p.close();
