// 047: «Del med elektriker» — ark, søk, deling, trekk tilbake, invitasjonsflyt. Mock av RPC og
// Edge Function — ingen database-skriving.
import { openPage } from './cdp.mjs';
const out = process.argv[2] || '/tmp/t047';
const p = await openPage(null);
await p.goto('http://localhost:4000/');
const errs = p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
console.log('sidefeil ved lasting:', errs.length, errs.slice(0, 3));

const r1 = await p.eval(`(async () => {
  const res = {};
  const rt = _delMedElektrikerRegressionTest();
  res.regresjon = rt.filter(x => x.ok).length + '/' + rt.length;
  res.regresjonFeil = rt.filter(x => !x.ok).map(x => x.name);
  _userOrg = { id:'org-cenika', org_type:'supplier', supplier_name:'Cenika AS', name:'Cenika AS' };
  const now = Date.now(), iso = d => new Date(now + d * 864e5).toISOString();
  window._orgs = [
    { org_id:'o1', name:'Krøderen Elektro AS', org_nr:'123456785', erp_customer_no:'20001', address:'3536 Noresund', created_by_us:true, members:1, last_sign_in_at:null },
    { org_id:'o2', name:'Bravida Norge AS avd Ålesund', org_nr:'941163343', erp_customer_no:'31114', address:'6003 Ålesund', created_by_us:true, members:2, last_sign_in_at:iso(-1) },
    { org_id:'o3', name:'Lyn Elektro AS', org_nr:'999888777', erp_customer_no:null, address:null, created_by_us:true, members:0, last_sign_in_at:null },
  ];
  window._shares = [
    { share_id:'s1', org_id:'o1', org_name:'Krøderen Elektro AS', org_nr:'123456785', status:'accepted', created_at:iso(-2), accepted_at:iso(-2), members:1, last_sign_in_at:null, invite:null },
    { share_id:'s2', org_id:'o2', org_name:'Bravida Norge AS avd Ålesund', org_nr:'941163343', status:'accepted', created_at:iso(-3), accepted_at:iso(-3), members:2, last_sign_in_at:iso(-1), invite:null },
    { share_id:'s3', org_id:'o3', org_name:'Lyn Elektro AS', org_nr:'999888777', status:'accepted', created_at:iso(-1), accepted_at:iso(-1), members:0, last_sign_in_at:null, invite:{ email:'ole@lyn.no', expires_at:iso(29), token:'tokLyn' } },
    { share_id:'s4', org_id:'o4', org_name:'Gammel Elektro AS', org_nr:null, status:'revoked', created_at:iso(-10), accepted_at:iso(-10), members:1, last_sign_in_at:iso(-5), invite:null },
  ];
  window._rpcCalls = [];
  window._rpcReply = {};
  _db = Object.assign(Object.create(_db || {}), { rpc: async (fn, args) => {
    _rpcCalls.push({ fn, args });
    if (_rpcReply[fn]) return _rpcReply[fn];
    if (fn === 'list_customer_orgs') return { data: _orgs, error: null };
    if (fn === 'list_project_shares') return { data: _shares, error: null };
    if (fn === 'share_project') return { data: { share_id:'sNy', status:'accepted', existed:false }, error: null };
    if (fn === 'revoke_project_share') return { data: { status:'revoked' }, error: null };
    return { data: null, error: { message: 'ukjent ' + fn } };
  }, auth: Object.assign(Object.create((_db && _db.auth) || {}), { getSession: async () => ({ data: { session: { access_token: 'jwt-test' } } }) }) });
  window._fetchCalls = [];
  window._fnReply = { status: 200, body: { ok: true, result: 'opprettet' } };
  const ekteFetch = window.fetch;
  window.fetch = async (url, opt) => {
    if (String(url).includes('/functions/v1/opprett-kundebruker')) {
      _fetchCalls.push({ url: String(url), body: opt && opt.body, auth: opt && opt.headers && opt.headers.Authorization });
      return new Response(JSON.stringify(_fnReply.body), { status: _fnReply.status, headers: { 'Content-Type': 'application/json' } });
    }
    return ekteFetch(url, opt);
  };
  await _shrOpen('proj-1', 'Enebolig Noresund');
  res.treff = document.querySelectorAll('#_shr-treff > div').length;
  res.treffDelt = document.querySelectorAll('#_shr-treff button').length;   // o3 er delt → bare o1? nei: o1,o2,o3 delt → 0 knapper
  res.liste = [...document.querySelectorAll('#_shr-liste [data-share]')].map(d => d.innerText.replace(/\\s+/g,' ').slice(0, 140));
  res.sendKnapp = !!document.querySelector('#_shr-liste [data-share="s3"] button') && /Send invitasjon/.test(document.querySelector('#_shr-liste [data-share="s3"]').innerText);
  res.delIgjen = /Del igjen/.test(document.querySelector('#_shr-liste [data-share="s4"]').innerText);
  return res;
})()`);
console.log(JSON.stringify(r1, null, 1));
await p.shot(out + '-1-ark.png');

const r2 = await p.eval(`(async () => {
  const res = {};
  // Søk: org.nr og navn
  _shares = _shares.filter(s => s.share_id !== 's1');   // o1 ikke delt → Del-knapp
  await _shrLoadShares();
  const sok = document.getElementById('_shr-sok');
  sok.value = '123 456'; _shrSearch(); res.sokOrgnr = [...document.querySelectorAll('#_shr-treff > div')].map(d => d.innerText.split('\\n')[0]);
  sok.value = 'bravida ålesund'; _shrSearch(); res.sokNavn = [...document.querySelectorAll('#_shr-treff > div')].map(d => d.innerText.split('\\n')[0]);
  sok.value = 'krøderen'; _shrSearch();
  _rpcCalls.length = 0;
  document.querySelector('#_shr-treff button').click();
  await new Promise(r => setTimeout(r, 300));
  res.delKall = _rpcCalls.filter(c => c.fn === 'share_project').map(c => c.args);
  // Trekk tilbake (confirm → ja)
  window.confirm = () => true;
  _rpcCalls.length = 0;
  await _shrRevoke('s2', 'Bravida Norge AS avd Ålesund');
  res.revokeKall = _rpcCalls.filter(c => c.fn === 'revoke_project_share').map(c => c.args);
  // Send invitasjon på nytt
  _fetchCalls.length = 0;
  await _shrResendInvite('tokLyn', null);
  res.resend = _fetchCalls.map(c => ({ body: c.body, auth: c.auth }));
  return res;
})()`);
console.log(JSON.stringify(r2, null, 1));

const r3 = await p.eval(`(async () => {
  const res = {};
  // Vei 2: ny bedrift via 044-skjemaet i delingsmodus
  const mk = (erp_no, name, org_number, postal_code, city) => ({ erp_no, name, name_norm:_custNoNormalize(name), org_number, postal_code, city, active:true });
  _cachedErpCustomers = [ mk('20009','Nordlys Elektro AS','123456785','3000','Drammen') ];
  _shrInvite();
  await new Promise(r => setTimeout(r, 200));
  res.coZ = document.getElementById('co-overlay').style.zIndex;
  res.tittel = document.querySelector('#co-overlay h3').textContent;
  res.knapp = document.getElementById('co-submit').textContent;
  await _coPick('20009');
  document.getElementById('co-email').value = 'kari@nordlys.no';
  _rpcCalls.length = 0; _fetchCalls.length = 0;
  _rpcReply.create_customer_org = { data: { org_id:'oNy', existed:false, name:'Nordlys Elektro AS', invite_token:'tokNy', invite_email:'kari@nordlys.no' }, error:null };
  await _coSubmit();
  res.rekkefolge = _rpcCalls.map(c => c.fn).filter(f => f === 'create_customer_org' || f === 'share_project');
  res.shareArgs = (_rpcCalls.find(c => c.fn === 'share_project') || {}).args;
  res.edge = _fetchCalls.map(c => c.body);
  res.resultat = document.getElementById('co-result').innerText.replace(/\\s+/g,' ').slice(0, 400);
  return res;
})()`);
console.log(JSON.stringify(r3, null, 1));
await p.shot(out + '-2-ny-bedrift.png');

const r4 = await p.eval(`(async () => {
  const res = {};
  // E-posten har alt konto
  _shrInvite(); await new Promise(r => setTimeout(r, 100)); await _coPick('20009');
  document.getElementById('co-email').value = 'per@nordlys.no';
  _fnReply = { status: 200, body: { ok: true, result: 'fantes_fra_for' } };
  await _coSubmit();
  res.fantes = document.getElementById('co-result').innerText.replace(/\\s+/g,' ').slice(0, 300);
  // Eksisterende bedrift (duplikat i 044) → «finnes allerede — deler dit», ingen Edge-kall
  _shrInvite(); await new Promise(r => setTimeout(r, 100)); await _coPick('20009');
  document.getElementById('co-email').value = 'x@bravida.no';
  _rpcReply.create_customer_org = { data: { org_id:'oB', existed:true, matched_on:'org_nr', name:'Bravida Drammen', invite_token:null }, error:null };
  _fetchCalls.length = 0; _rpcCalls.length = 0;
  await _coSubmit();
  res.dup = document.getElementById('co-result').innerText.replace(/\\s+/g,' ').slice(0, 300);
  res.dupEdgeKall = _fetchCalls.length;
  res.dupShare = (_rpcCalls.find(c => c.fn === 'share_project') || {}).args;
  // Edge Function ikke deployet (404)
  _rpcReply.create_customer_org = { data: { org_id:'oN2', existed:false, name:'Ny AS', invite_token:'tok2', invite_email:'a@ny.no' }, error:null };
  _fnReply = { status: 404, body: { message: 'Requested function was not found' } };
  _shrInvite(); await new Promise(r => setTimeout(r, 100)); await _coPick('20009');
  document.getElementById('co-email').value = 'a@ny.no';
  await _coSubmit();
  res.ikkeDeployet = document.getElementById('co-result').innerText.replace(/\\s+/g,' ').slice(0, 300);
  res.lenkeVist = /\\?invite=tok2/.test(document.getElementById('co-result').innerHTML);
  // Migrasjonen ikke kjørt
  _rpcReply.list_project_shares = { data:null, error:{ code:'PGRST202', message:'Could not find the function public.list_project_shares' } };
  document.getElementById('co-overlay').style.display = 'none';
  await _shrOpen('proj-2', 'Test');
  res.ikkeKjort = document.getElementById('_shr-liste').innerText;
  delete _rpcReply.list_project_shares;
  // 044 uten deling er uendret
  document.getElementById('_shr-ov').remove();
  await _coOpen();
  res.coVanlig = { z: document.getElementById('co-overlay').style.zIndex, knapp: document.getElementById('co-submit').textContent, tittel: document.querySelector('#co-overlay h3').textContent };
  document.getElementById('co-overlay').style.display = 'none';
  // Prosjektdialogen: knapp for leverandør, ikke for installatør
  _supabaseProjectId = 'proj-1';
  _wfKundeModal(); res.dialogLev = !!document.getElementById('wf-k-del'); document.getElementById('wf-kunde-modal').remove();
  _userOrg = { id:'org-inst', org_type:'installer' };
  _wfKundeModal(); res.dialogInst = !!document.getElementById('wf-k-del'); document.getElementById('wf-kunde-modal').remove();
  // Prosjektlista: radknapp for leverandør, ikke for installatør
  _cachedProjects = [{ id:'proj-1', name:'Enebolig Noresund', data:{}, updated_at:new Date().toISOString(), _salesStatus:'under_arbeid' }];
  _projectListDirty = false;
  const rad = async () => { await _renderProjectList(); return !!document.querySelector('#pl-tbody button[title="Del med elektriker"]'); };
  res.radInst = await rad();
  _userOrg = { id:'org-cenika', org_type:'supplier', supplier_name:'Cenika AS' };
  res.radLev = await rad();
  return res;
})()`);
console.log(JSON.stringify(r4, null, 1));
const errs2 = p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
console.log('sidefeil totalt:', errs2.length, errs2.slice(0, 3));
await p.close();
