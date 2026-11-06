(async () => {
  // Ende-til-ende: ekte exportPDF (priset) mot en minne-database → statusovergang → melding med lenke.
  const rad = { id: 'p1', org_id: 'org-cenika', user_id: 'u1', sales_status: 'under_arbeid', visma_offer_no: null, visma_order_no: null };
  const kall = [];
  const from = () => {
    const st = { op: 'select', f: [], p: null };
    const treff = () => st.f.every(([k, v]) => rad[k] === v);
    const exec = async () => { kall.push(st.op + ':' + JSON.stringify(st.p)); if (st.op === 'update') { if (!treff()) return { data: [], error: null }; Object.assign(rad, st.p); return { data: [{ id: rad.id }], error: null }; } return { data: treff() ? [{ ...rad }] : [], error: null }; };
    const q = { select() { return q; }, eq(k, v) { st.f.push([k, v]); return q; }, is() { return q; }, update(p) { st.op = 'update'; st.p = p; return q; },
      maybeSingle: async () => { const r = await exec(); return { data: r.data[0] || null, error: null }; }, then(a, b) { return exec().then(a, b); } };
    return q;
  };
  _db = { from }; _userOrg = { id: 'org-cenika', org_type: 'supplier', erp_format: 'visma_paste' }; _currentUser = { id: 'u1', app_metadata: {} };
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
  window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
  const Ekte = window.jspdf.jsPDF; let lagret = 0;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); d.save = function () { lagret++; return d; }; return d; };
  _supabaseProjectId = 'p1';
  const pts = [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }];
  S.rooms = [{ id: 995101, floorId: null, partId: null, name: 'Stue', points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] }];
  S.project = { name: 'E2E-198', parts: [], revision: 0, lastExportedAt: null, createdAt: Date.now() };
  if (typeof _rebuildActiveFloorRoomIds === 'function') _rebuildActiveFloorRoomIds();
  const OPTS = { cover: true, summary: true, floorplan: false, rooms: [995101], stairs: [], roomTable: true, stairTable: false, materialList: false,
    resistance: false, cableTable: false, pricing: true, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' };
  await exportPDF({ ...OPTS });
  await new Promise(r => setTimeout(r, 200));
  const el = document.getElementById('visma-no-toast');
  const ut = { pdfLagret: lagret, status: rad.sales_status, melding: el && el.querySelector('span').textContent, lenke: el && el.querySelector('button') && el.querySelector('button').textContent,
    dialogRettEtter: !!document.getElementById('visma-no-overlay') };
  el.querySelector('button').click();
  await new Promise(r => setTimeout(r, 200));
  ut.dialogEtterKlikk = !!document.getElementById('visma-no-offer');
  document.getElementById('visma-no-offer').value = '104500';
  await document.getElementById('visma-no-overlay')._vismaSave();
  ut.lagretNr = rad.visma_offer_no;
  // Andre eksport: prosjektet er alt «Tilbud sendt» → ingen ny melding (cond-not-met).
  document.getElementById('visma-no-toast')?.remove();
  await exportPDF({ ...OPTS }); await new Promise(r => setTimeout(r, 200));
  ut.andreEksportMelding = !!document.getElementById('visma-no-toast');
  // Uten prising: status røres ikke.
  rad.sales_status = 'under_arbeid';
  await exportPDF({ ...OPTS, pricing: false }); await new Promise(r => setTimeout(r, 200));
  ut.utenPris = rad.sales_status + ' / melding ' + !!document.getElementById('visma-no-toast');
  return ut;
})()
