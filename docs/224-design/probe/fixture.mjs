// 224: fixtures for skjermbilder og målinger. Prosjektet er 217-fixturet (fire rom: kabel + hindring,
// folie + hindring, kabel + søyle, folie + L-hindring). Dashbordet vises uten innlogging med en
// håndfull falske prosjekter i _cachedProjects (ingen Supabase-kall — _fetchProjectList stubbes).
export { FIX } from '../../217-hindring/probe/fixture.mjs';

// Lyst tema, rutenett, hele vinduet: rom 31 (kabel + hindring) og 32 (folie + hindring) i bildet.
export const VIS_PROSJEKT = `(() => {
  S.ui.theme = 'light'; document.body.classList.add('light-theme'); S.ui.showGrid = true;
  S.view.zoom = 0.75; S.view.panX = 520; S.view.panY = 190; S.ui.selectedRoomId = 32;
  renderSidebar(); updateCtxBar(); render();
  const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height };
})()`;

export const DASHBORD = `(async () => {
  // bare identifikatorer: _cachedProjects/_projectListDirty er let-bindinger (window.x ville vært en annen variabel)
  _showToast = () => {}; _lockRelease = () => Promise.resolve();
  _fetchProjectList = () => Promise.resolve(_cachedProjects); _fetchKundeStatus = () => Promise.resolve({});
  const d = (n) => new Date(Date.now() - n * 864e5).toISOString();
  const mk = (id, navn, kunde, status, type, nr, dager, ansv) => ({ id: 'p' + id, name: navn, customer: kunde, customer_name: kunde, _custName: kunde,
    _salesStatus: status, _type: type, _projectNo: nr, project_no: nr, updated_at: d(dager), created_at: d(dager + 3), _updatedAt: d(dager), _createdAt: d(dager + 3),
    responsible_name: ansv, _responsible: ansv, _responsibleName: ansv, data: null });
  _cachedProjects = [
    mk(1, 'Kjøkken - gang', 'Elektro Nord AS', 'under_arbeid', 'indoor', 395, 0, 'Kenneth Skretteberg'),
    mk(2, 'Enebolig Solbakken', 'Bygg & Bo AS', 'sendt', 'indoor', 394, 1, 'Kenneth Skretteberg'),
    mk(3, 'Innkjørsel og trapp', 'Privat', 'vunnet', 'snow', 391, 4, 'Ola Montør'),
    mk(4, 'Hytte Geilo – bad', 'Fjell Elektro AS', 'under_arbeid', 'indoor', 388, 9, 'Kenneth Skretteberg'),
    mk(5, 'Takrenner Storgata 12', 'Sameiet Storgata', 'tapt', 'roof', 380, 21, 'Ola Montør'),
  ];
  _projectListDirty = false;
  S.ui.theme = 'light'; document.body.classList.add('light-theme');
  const auth = document.getElementById('auth-screen'); if (auth) auth.style.display = 'none';
  try { _showProjectListScreen(); } catch (e) { console.warn('showProjectList', e.message); document.getElementById('project-list-screen').style.display = 'flex'; }
  let feil = null;
  try { await _renderProjectList(); } catch (e) { feil = e.message; }
  await new Promise(r => setTimeout(r, 300));
  const tb = document.getElementById('pl-tbody');
  return { rader: tb ? tb.querySelectorAll('tr').length : -1, feil };
})()`;
