// 199: testoppsett for skjermbildene — prosjektliste med seks prosjekter og en minne-database
// (ingen innlogging). Numrene er 6 siffer. Kjøres i nettleseren av vis.mjs.
(async () => {
  const mk = (id, name, cust, st, offer, order, no) => ({ id, name, description: '', parts: [], _customer: cust, _customerId: null, _contact: '',
    _type: 'indoor', _status: 'in_progress', _salesStatus: st, _deliveryStatus: null, _lostReason: null, _responsible: 'Fredrik Hansen',
    _responsibleUserId: null, _projectNo: no, _deletedAt: null, _savedAt: Date.parse('2026-11-0' + (1 + no % 6) + 'T10:15:00'), updated_at: '2026-11-05T10:00:00Z',
    org_id: 'org-cenika', user_id: 'u1', _sharedIn: false, _customerWon: 0, _vismaNoKnown: true, _vismaOfferNo: offer, _vismaOrderNo: order });
  _userOrg = { id: 'org-cenika', name: 'Cenika', org_type: 'supplier', erp_format: 'visma_paste,gbao10' };
  _currentUser = { id: 'u1', app_metadata: {} };
  _cachedProjects = [
    mk('p1', 'Enebolig Solbakken 12', 'Welhaven Elektro AS', 'tilbud_sendt', '104482', '', 381),
    mk('p2', 'Rehab bad og gang, Storgata 4', 'Bravida Norge avd Ålesund', 'vunnet', '104455', '207719', 380),
    mk('p3', 'Hytte Geilo, garasje og bod', 'Elektro Service Hallingdal', 'tilbud_sendt', '', '', 379),
    mk('p4', 'Kontorbygg 2. etasje', 'GK Norge AS', 'vunnet', '104391', '', 378),
    mk('p5', 'Leilighet 302', 'Privat', 'under_arbeid', '', '', 377),
    mk('p6', 'Rekkehus Åsen 7', 'Welhaven Elektro AS', 'under_arbeid', '', '', 382),
  ];
  const dbRows = () => _cachedProjects.map(p => ({ id: p.id, name: p.name, project_no: p._projectNo, org_id: p.org_id, user_id: p.user_id, deleted_at: null,
    sales_status: p._salesStatus, delivery_status: p._deliveryStatus, lost_reason: p._lostReason, visma_offer_no: p._vismaOfferNo || null, visma_order_no: p._vismaOrderNo || null }));
  window.__kall = [];
  const builder = table => {
    const st = { op: 'select', f: [], payload: null };
    const match = r => st.f.every(([k, v, kind]) => kind === 'neq' ? r[k] !== v : kind === 'is' ? (r[k] ?? null) === null : r[k] === v);
    const exec = async () => {
      window.__kall.push(table + ':' + st.op + ':' + st.f.map(x => x[0] + (x[2] === 'neq' ? '!=' : '=') + x[1]).join('&'));
      if (table !== 'romtegner_projects') return { data: null, error: { code: 'PGRST205', message: 'ingen slik tabell i testoppsettet' } };
      const hit = dbRows().filter(match);
      if (st.op === 'update') {
        hit.forEach(h => { const p = _cachedProjects.find(x => x.id === h.id);
          if ('visma_offer_no' in st.payload) p._vismaOfferNo = st.payload.visma_offer_no || '';
          if ('visma_order_no' in st.payload) p._vismaOrderNo = st.payload.visma_order_no || '';
          if ('sales_status' in st.payload) p._salesStatus = st.payload.sales_status; });
        return { data: hit.map(h => ({ id: h.id })), error: null };
      }
      return { data: hit, error: null };
    };
    const q = { select() { return q; }, order() { return q; }, limit() { return q; }, range() { return q; },
      eq(k, v) { st.f.push([k, v, 'eq']); return q; }, neq(k, v) { st.f.push([k, v, 'neq']); return q; }, is(k) { st.f.push([k, null, 'is']); return q; },
      update(pl) { st.op = 'update'; st.payload = pl; return q; },
      maybeSingle: async () => { const r = await exec(); return r.error ? r : { data: (r.data || [])[0] || null, error: null }; },
      then(a, b) { return exec().then(a, b); } };
    return q;
  };
  _db = { from: builder };
  window._invalidateProjectCache = () => {};   // lista leses fra _cachedProjects, som minne-databasen oppdaterer
  _projectOwnerMeta.clear(); _cachedProjects.forEach(p => _projectOwnerMeta.set(p.id, { org_id: p.org_id, user_id: p.user_id }));
  _projectListDirty = false; _vismaNoDisabled = false;
  window._fetchKundeStatus = async () => new Map();
  document.querySelectorAll('#auth-screen, #login-screen, .auth-overlay').forEach(e => e.style.display = 'none');
  document.getElementById('project-list-screen').style.display = 'flex';
  await _renderProjectList();
  document.getElementById('dash-filter-status').value = '';
  await _renderProjectList();
  return { rader: document.querySelectorAll('#pl-tbody tr').length, valg: [...document.getElementById('dash-filter-status').options].map(o => o.textContent) };
})()
