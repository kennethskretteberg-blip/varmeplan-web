(async () => {
  const mk = (id, name, cust, st, offer, order, no) => ({ id, name, description: '', parts: [], _customer: cust, _customerId: null, _contact: '',
    _type: 'indoor', _status: 'in_progress', _salesStatus: st, _deliveryStatus: null, _lostReason: null, _responsible: 'Fredrik Hansen',
    _responsibleUserId: null, _projectNo: no, _deletedAt: null, _savedAt: Date.parse('2026-11-0' + (1 + no % 6) + 'T10:15:00'), updated_at: '2026-11-05T10:00:00Z',
    org_id: 'org-cenika', user_id: 'u1', _sharedIn: false, _customerWon: 0, _vismaNoKnown: true, _vismaOfferNo: offer, _vismaOrderNo: order, visma_offer_no: offer, visma_order_no: order });
  _userOrg = { id: 'org-cenika', name: 'Cenika', org_type: 'supplier', erp_format: 'visma_paste,gbao10' };
  _currentUser = { id: 'u1', app_metadata: {} };
  _db = _db || {};
  _cachedProjects = [
    mk('p1', 'Enebolig Solbakken 12', 'Welhaven Elektro AS', 'tilbud_sendt', '104482', '', 381),
    mk('p2', 'Rehab bad og gang, Storgata 4', 'Bravida Norge avd Ålesund', 'vunnet', '104455', '2026-7719', 380),
    mk('p3', 'Hytte Geilo, garasje og bod', 'Elektro Service Hallingdal', 'tilbud_sendt', '', '', 379),
    mk('p4', 'Kontorbygg 2. etasje', 'GK Norge AS', 'vunnet', '104391', '', 378),
    mk('p5', 'Leilighet 302', 'Privat', 'under_arbeid', '', '', 377),
  ];
  _projectListDirty = false;
  window._fetchKundeStatus = async () => new Map();
  document.querySelectorAll('#auth-screen, #login-screen, .auth-overlay').forEach(e => e.style.display = 'none');
  document.getElementById('project-list-screen').style.display = 'flex';
  document.getElementById('dash-filter-status').value = '';
  await _renderProjectList();
  _projectOwnerMeta.set('p5', { org_id: 'org-cenika', user_id: 'u1' });
  _vismaNoOfferSentToast('p5');
  return document.getElementById('visma-no-toast').textContent;
})()
