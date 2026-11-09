// 220: skjermbilder av prosjektlista med «Grossist» — chip, nedtrekk, filter — uten innlogging
// (falsk database, samme mønster som regresjonstesten). node docs/220-grossist/probe/vis.mjs
import { openPage, sov } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const sett = `(async () => {
  try { await _loadProducts(); } catch (e) {}
  window._showToast = () => {};
  _viewAsOrg = null; _currentUser = { id: 'u-cenika', app_metadata: {} };
  _userOrg = { id: 'org-cenika', name: 'Cenika AS', org_type: 'supplier' };
  _orgStatusDisabled = true; _orgStatusMine = new Map(); _orgStatusOthers = new Map();
  const rows = [
    { id: 'g1', name: 'Rådhusgata 4 — grossistjobb', org_id: 'org-cenika', user_id: 'u-cenika', sales_status: 'grossist', updated_at: '2026-11-09T10:00:00Z', status_changed_at: '2026-11-09T10:00:00Z' },
    { id: 'u1', name: 'Bjerkealléen 12', org_id: 'org-cenika', user_id: 'u-cenika', sales_status: 'under_arbeid', updated_at: '2026-11-08T10:00:00Z', status_changed_at: '2026-11-08T10:00:00Z' },
    { id: 't1', name: 'Storgata 1', org_id: 'org-cenika', user_id: 'u-cenika', sales_status: 'tilbud_sendt', updated_at: '2026-11-07T10:00:00Z', status_changed_at: '2026-11-07T10:00:00Z' },
    { id: 'v1', name: 'Fjellveien 9', org_id: 'org-cenika', user_id: 'u-cenika', sales_status: 'vunnet', updated_at: '2026-11-06T10:00:00Z', status_changed_at: '2026-11-06T10:00:00Z' },
    { id: 'x1', name: 'Havnegata 3', org_id: 'org-cenika', user_id: 'u-cenika', sales_status: 'tapt', lost_reason: 'pris', updated_at: '2026-11-05T10:00:00Z', status_changed_at: '2026-11-05T10:00:00Z' },
  ].map(r => ({ delivery_status: null, lost_reason: null, ...r }));
  const q = (table) => { const st = { f: [], op: 'select', pl: null }; const rows2 = table === 'romtegner_projects' ? rows : null;
    const exec = async () => { if (!rows2) return { data: null, error: { code: 'PGRST205', message: 'Could not find the table' } };
      if (st.op === 'update') { const hit = rows2.filter(r => st.f.every(([k, v]) => r[k] === v)); hit.forEach(r => Object.assign(r, st.pl)); return { data: hit.map(r => ({ id: r.id })), error: null }; }
      return { data: rows2.filter(r => st.f.every(([k, v]) => r[k] === v)).map(r => ({ ...r })), error: null }; };
    const o = { select() { return o; }, order() { return o; }, range() { return o; }, eq(k, v) { st.f.push([k, v]); return o; }, is() { return o; },
      update(pl) { st.op = 'update'; st.pl = pl; return o; }, maybeSingle: async () => { const r = await exec(); return r.error ? r : { data: (r.data || [])[0] || null, error: null }; },
      then(a, b) { return exec().then(a, b); } }; return o; };
  _db = { from: q };
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('project-list-screen').style.display = 'flex';
  _projectListDirty = true; _cachedProjects = null;
  const sel = document.getElementById('dash-filter-status'); delete sel.dataset.mode; _plSyncStatusSelect(); sel.value = '';
  await _renderProjectList();
  return [...document.querySelectorAll('#pl-tbody .pl-status-sel')].map(s => s.value + ':' + s.options[s.selectedIndex].text + ':' + s.style.color);
})()`;
console.log('chips:', await p.eval(sett));
await sov(300);
await p.shot('docs/220-grossist/liste-alle-statuser.png');
console.log('filter grossist:', await p.eval(`(async () => { const sel = document.getElementById('dash-filter-status'); sel.value = 'grossist'; await _renderProjectList(); return [...document.querySelectorAll('#pl-tbody tr')].map(tr => tr.textContent.replace(/\\s+/g,' ').trim().slice(0, 60)); })()`));
await sov(300);
await p.shot('docs/220-grossist/liste-filter-grossist.png');
console.log('nedtrekk:', await p.eval(`[...document.getElementById('dash-filter-status').options].map(o => o.value + '=' + o.text)`));
// Nedtrekket åpent kan ikke fotograferes i headless; vis chipens egne valg i stedet (åpne select-lista som tekst).
await p.close();
process.exit(0);
