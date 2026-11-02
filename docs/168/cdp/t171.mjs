// 171: prosjektlista med faner (installatør), «Vi fikk jobben», ⋯-meny, Vis tapte, Dokumentasjon-fanen,
// og Cenika-visningen med «Kunden fikk jobben». Alt mot en minne-mock av _db — ingen database.
import { openPage } from './cdp.mjs';
const out = process.argv[2] || '/tmp/t171';
const p = await openPage(null);
await p.goto('http://localhost:4000/');
const errs = () => p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
console.log('sidefeil ved lasting:', errs().length, errs().slice(0, 3));
const wait = ms => `await new Promise(r => setTimeout(r, ${ms}));`;

const MOCK = `{
  window._real = window._real || _db;
  window._T = window._T || {};
  const mk = () => ({
    from(table) {
      const st = { op: 'select', f: [], payload: null };
      const rows = () => _T[table];
      const match = r => st.f.every(([k, v]) => r[k] === v);
      const exec = async () => {
        if (rows() === undefined) return { data: [], error: null };
        if (rows() === null) return { data: null, error: { code: 'PGRST205', message: "Could not find the table 'public." + table + "' in the schema cache" } };
        if (st.op === 'update') { const h = rows().filter(match); h.forEach(r => Object.assign(r, st.payload)); return { data: h.map(r => ({ id: r.id })), error: null }; }
        if (st.op === 'upsert') { const x = st.payload; let r = rows().find(y => y.project_id === x.project_id && y.org_id === x.org_id);
          if (!r) { r = { sales_status: 'under_arbeid', delivery_status: null, lost_reason: null, ...x }; rows().push(r); } else Object.assign(r, x);
          return { data: [{ project_id: r.project_id }], error: null }; }
        return { data: rows().filter(match).map(r => ({ ...r })), error: null };
      };
      const q = new Proxy({}, { get(_, k) {
        if (k === 'then') return (a, b) => exec().then(a, b);
        if (k === 'eq') return (c, v) => { st.f.push([c, v]); return q; };
        if (k === 'update') return (x) => { st.op = 'update'; st.payload = x; return q; };
        if (k === 'upsert') return (x) => { st.op = 'upsert'; st.payload = x; return q; };
        if (k === 'maybeSingle' || k === 'single') return async () => { const r = await exec(); return r.error ? r : { data: (r.data || [])[0] || null, error: null }; };
        return () => q;
      } });
      return q;
    },
    rpc: async () => ({ data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }),
    storage: { from: () => ({}) },
  });
  _db = mk();
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
}`;
const DATA = `
  const d = (n) => new Date(Date.now() - n * 864e5).toISOString();
  _T.romtegner_projects = [
    { id: 'p1', name: 'Bad og vaskerom', description: 'Storgata 4', org_id: 'org-elektro', user_id: 'u-ola', sales_status: 'tilbud_sendt', delivery_status: null, updated_at: d(1), data: { project: { customer: 'Hansen', type: 'indoor' } } },
    { id: 'p2', name: 'Kjeller Nordby', description: 'Nordbyvegen 2', org_id: 'org-elektro', user_id: 'u-ola', sales_status: 'under_arbeid', delivery_status: null, updated_at: d(2), data: { project: { customer: 'Nordby', type: 'list' } } },
    { id: 'p3', name: 'Enebolig Berg (fra Cenika)', description: 'Bergsvingen 9', org_id: 'org-cenika', user_id: 'u-cen', sales_status: 'tilbud_sendt', delivery_status: null, updated_at: d(3), data: { project: { customer: 'Berg', type: 'indoor' } } },
    { id: 'p4', name: 'Hytte Fjellro', description: 'Fjellvegen 1', org_id: 'org-elektro', user_id: 'u-ola', sales_status: 'vunnet', delivery_status: null, updated_at: d(4), data: { project: { customer: 'Fjellro', type: 'indoor' } } },
    { id: 'p5', name: 'Leilighet Sentrum', description: 'Torget 3', org_id: 'org-elektro', user_id: 'u-ola', sales_status: 'vunnet', delivery_status: 'ferdig', updated_at: d(5), data: { project: { customer: 'Sentrum', type: 'indoor' } } },
    { id: 'p6', name: 'Garasje Lie', description: 'Lieveien 8', org_id: 'org-elektro', user_id: 'u-ola', sales_status: 'tapt', lost_reason: 'pris', delivery_status: null, updated_at: d(6), data: { project: { customer: 'Lie', type: 'indoor' } } },
  ];
  _T.project_org_status = [];
`;
const INST = `_currentUser = { id: 'u-ola', email: 'ola@welhaven.no', app_metadata: {}, user_metadata: { full_name: 'Ola Welhaven' } };
  _viewAsOrg = null; _userOrg = { id: 'org-elektro', name: 'Welhaven Elektro AS', org_type: 'installer', _role: 'owner' };
  document.getElementById('auth-screen').style.display = 'none';`;
const state = `(() => ({
  faner: [...document.querySelectorAll('#pl-stage-tabs .pl-stage-tab')].map(b => (b.classList.contains('active') ? '▶ ' : '') + b.innerText.replace(/\\s+/g, ' ').trim()),
  filter: document.getElementById('dash-filter-status').value,
  valg: [...document.getElementById('dash-filter-status').options].map(o => o.textContent),
  rader: [...document.querySelectorAll('#pl-tbody tr.pl-tr')].map(tr => tr.querySelector('.pl-proj-name').innerText + ' | ' + tr.querySelector('.pl-status-sel').selectedOptions[0].textContent + (tr.querySelector('.pl-won-btn') ? ' [Vi fikk jobben]' : '') + (tr.querySelector('.pl-cust-won') ? ' [Kunden fikk jobben]' : '')),
  tom: document.getElementById('pl-empty').style.display !== 'none' ? document.getElementById('pl-empty').innerText : null,
}))()`;

// 1. Installatør: fanen Prosjektert
const r1 = await p.eval(`(async () => { ${MOCK} ${DATA} ${INST} _invalidateProjectCache(); _plStage = 'prosjektert';
  _showProjectListScreen(); ${wait(300)} return ${state}; })()`);
console.log('1 Prosjektert', JSON.stringify(r1, null, 1));
await p.shot(out + '-1-prosjektert.png', { x: 0, y: 0, width: 1400, height: 900 });

// 2. «Vi fikk jobben» på det delte Cenika-prosjektet
const r2 = await p.eval(`(async () => {
  const tr = [...document.querySelectorAll('#pl-tbody tr.pl-tr')].find(t => /Berg/.test(t.innerText));
  tr.querySelector('.pl-won-btn').click(); ${wait(400)}
  const toast = document.getElementById('pl-action-toast');
  return { toast: toast && toast.innerText.replace(/\\s+/g, ' '), orgRad: _T.project_org_status, cenikaRad: _T.romtegner_projects.find(x => x.id === 'p3').sales_status, ...${state} };
})()`);
console.log('2 etter «Vi fikk jobben»', JSON.stringify(r2, null, 1));
await p.shot(out + '-2-flyttet.png');

// 3. Til montering
const r3 = await p.eval(`(async () => { _plSetStage('montering'); ${wait(300)} return ${state}; })()`);
console.log('3 Til montering', JSON.stringify(r3, null, 1));
await p.eval(`(async () => { const b = document.querySelector('#pl-tbody tr.pl-tr .pl-more-btn'); b.click(); ${wait(100)} })()`);
const r3m = await p.eval(`[...document.querySelectorAll('#pl-status-menu button')].map(b => b.textContent + (b.disabled ? ' (grå)' : ''))`);
console.log('3m ⋯-meny', JSON.stringify(r3m));
await p.shot(out + '-3-montering.png');

// 4. Angre fra menyen (det delte prosjektet sto først? finn Berg)
const r4 = await p.eval(`(async () => { document.getElementById('pl-status-menu')?.remove();
  await _plUndoStatus('p3'); ${wait(300)} const a = ${state}; _plSetStage('prosjektert'); ${wait(300)}
  return { montering: a.rader, prosjektert: ${state}.rader, orgRad: _T.project_org_status }; })()`);
console.log('4 Angre', JSON.stringify(r4, null, 1));

// 5. Ferdig + Vis tapte + Alle statuser
const r5 = await p.eval(`(async () => { _plSetStage('ferdig'); ${wait(250)} const f = ${state};
  const sel = document.getElementById('dash-filter-status'); sel.value = 'tapt'; sel.dispatchEvent(new Event('change')); ${wait(250)} const t = ${state};
  sel.value = ''; sel.dispatchEvent(new Event('change')); ${wait(250)} const a = ${state};
  _plSetStage('montering'); ${wait(250)}
  return { ferdig: f, visTapte: t, alle: a.rader.length, tilbakeTilFane: ${state}.filter }; })()`);
console.log('5 Ferdig / Vis tapte / Alle', JSON.stringify(r5, null, 1));

// 6. Dokumentasjon-fanen (installatør): vunne prosjekter, også delte
const r6 = await p.eval(`(async () => {
  await _plWeGotTheJob('p3'); ${wait(300)}
  _switchDashTab('docs'); ${wait(300)}
  const res = { docs: [...document.querySelectorAll('#doc-picker-list .t1')].map(e => e.innerText), docsKnapp: getComputedStyle(document.getElementById('dash-tab-docs')).display !== 'none' };
  _switchDashTab('projects'); return res; })()`);
console.log('6 Dokumentasjon', JSON.stringify(r6, null, 1));

// 7. Cenika: ingen faner, «Kunden fikk jobben», Dokumentasjon skjult
const r7 = await p.eval(`(async () => { ${MOCK}
  _currentUser = { id: 'u-cen', email: 'svein@cenika.no', app_metadata: {}, user_metadata: { full_name: 'Svein Tore' } };
  _viewAsOrg = null; _userOrg = { id: 'org-cenika', name: 'Cenika AS', org_type: 'supplier', supplier_name: 'Cenika', _role: 'owner' };
  document.getElementById('auth-screen').style.display = 'none';
  _T.romtegner_projects = _T.romtegner_projects.filter(x => x.org_id === 'org-cenika');
  _invalidateProjectCache(); _showProjectListScreen(); ${wait(300)}
  return { ...${state}, fanerSynlig: document.getElementById('pl-stage-tabs').style.display !== 'none',
    docsKnapp: getComputedStyle(document.getElementById('dash-tab-docs')).display !== 'none' }; })()`);
console.log('7 Cenika', JSON.stringify(r7, null, 1));
await p.shot(out + '-7-cenika.png');

// 8. Fail-open: tabellen finnes ikke
const r8 = await p.eval(`(async () => { ${MOCK} ${DATA} ${INST} _T.project_org_status = null; _orgStatusDisabled = false; _invalidateProjectCache();
  _plStage = 'prosjektert'; _showProjectListScreen(); ${wait(300)}
  const a = ${state};
  const r = await _setProjectStatus('p3', { sales_status: 'vunnet', delivery_status: null });
  return { rader: a.rader, skriv: r, avskrudd: _orgStatusDisabled, tekst: _plStatusErrText(r) }; })()`);
console.log('8 uten migrasjon', JSON.stringify(r8, null, 1));
console.log('sidefeil totalt:', errs().length, errs().slice(0, 3));
await p.close();
