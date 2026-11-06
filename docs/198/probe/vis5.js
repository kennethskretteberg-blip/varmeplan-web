(async () => {
  const rad = { id: 'p4', org_id: 'org-cenika', user_id: 'u1', visma_offer_no: '104391', visma_order_no: '2026-7733' };
  const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: rad, error: null }) };
  _db = { from: () => q };
  _userOrg = { id: 'org-cenika', name: 'Cenika', org_type: 'supplier', erp_format: 'visma_paste,gbao10' };
  _currentUser = { id: 'u1', app_metadata: {} };
  _supabaseProjectId = 'p4';
  S.project = Object.assign(S.project || {}, { name: 'Kontorbygg 2. etasje', description: 'Storgata 4, 6002 Ålesund', contact_name: 'Ola Nordmann', responsible: 'Fredrik Hansen' });
  document.querySelectorAll('#auth-screen, #login-screen, .auth-overlay').forEach(e => e.style.display = 'none');
  _wfKundeModal();
  for (let i = 0; i < 100 && document.getElementById('wf-k-visma')?.dataset.loaded !== '1'; i++) await new Promise(r => setTimeout(r, 20));
  return [document.getElementById('wf-k-visma-offer').value, document.getElementById('wf-k-visma-order').value];
})()
