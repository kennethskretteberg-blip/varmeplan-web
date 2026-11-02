// 044v2: «Gi kunden tilgang til Varmeplan» — dialog, søk og RPC-kall med mock (ingen database-skriving).
import { openPage } from './cdp.mjs';
const out = process.argv[2] || '/tmp/t044';
const p = await openPage(null);
await p.goto('http://localhost:4000/');
const errs = p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
console.log('sidefeil ved lasting:', errs.length, errs.slice(0, 3));
const r = await p.eval(`(async () => {
  const res = {};
  const rt = _orgNrRegressionTest();
  res.orgNrTest = Array.isArray(rt) ? rt.filter(x=>x.ok).length + '/' + rt.length : JSON.stringify(rt).slice(0,200);
  // Mock: leverandør-org, Visma-register, RPC
  _userOrg = { id:'org-cenika', org_type:'supplier', supplier_name:'Cenika AS', name:'Cenika AS' };
  const mk = (erp_no, name, org_number, postal_code, city) => ({ erp_no, name, name_norm:_custNoNormalize(name), org_number, postal_code, city, active:true });
  _cachedErpCustomers = [
    mk('31114','Bravida Norge AS avd Ålesund','941163343','6003','Ålesund'),
    mk('31115','Bravida Norge AS avd Molde','941163343','6413','Molde'),
    mk('20001','Krøderen Elektro AS','123456785','3536','Noresund'),
    mk('20002','Utenlandsk Elektro AB',null,null,'Göteborg'),
  ];
  const m = q => _cachedErpCustomers.filter(_erpRegMatcher(q)).map(x=>x.erp_no).join(',');
  res.search = { 'bravida ålesund': m('bravida ålesund'), '31114': m('31114'), 'ålesund': m('ålesund'),
                 '941 163': m('941 163'), '123456785': m('123456785'), 'krøderen': m('krøderen'), '12': m('12') };
  window._rpcCalls = [];
  window._rpcReply = { data: { org_id:'new-1', existed:false, name:'Bravida Norge AS avd Ålesund', invite_token:'abc123', invite_email:'ole@bravida.no' }, error:null };
  _db = Object.assign(Object.create(_db || {}), { rpc: async (fn, args) => { _rpcCalls.push({ fn, args }); return _rpcReply; } });
  await _coOpen();
  document.getElementById('co-search').value = 'bravida ålesund';
  await _coSearch();
  res.hits = document.querySelectorAll('#co-search-results > div[onclick]').length;
  await _coPick('31114');
  res.filled = ['co-name','co-orgnr','co-erp','co-addr','co-email'].map(id => document.getElementById(id).value);
  res.siblingsShown = document.getElementById('co-siblings').style.display !== 'none';
  res.siblingsText = document.getElementById('co-siblings').innerText.slice(0,120);
  return res;
})()`);
console.log(JSON.stringify(r, null, 1));
await p.shot(out + '-1-valgt.png');
const r2 = await p.eval(`(async () => {
  const res = {};
  await _coSubmit();
  res.msgUtenEpost = document.getElementById('co-msg').textContent; res.callsUtenEpost = _rpcCalls.length;
  document.getElementById('co-email').value = 'ole@bravida.no';
  await _coSubmit();
  res.call = _rpcCalls[0];
  res.result = document.getElementById('co-result').innerText.slice(0, 300);
  return res;
})()`);
console.log(JSON.stringify(r2, null, 1));
await p.shot(out + '-2-opprettet.png');
const r3 = await p.eval(`(async () => {
  const res = {};
  // Duplikat
  _rpcReply = { data: { org_id:'old-1', existed:true, matched_on:'org_nr', name:'Bravida Drammen', invite_token:null }, error:null };
  await _coOpen(); await _coPick('20001'); document.getElementById('co-email').value='a@b.no'; await _coSubmit();
  res.dup = document.getElementById('co-result').innerText.slice(0, 200);
  // Uten org.nr: krever overstyring + begrunnelse
  _rpcCalls.length = 0;
  await _coOpen(); await _coPick('20002'); document.getElementById('co-email').value='x@y.se';
  res.overrideBoxShown = document.getElementById('co-override-box').style.display !== 'none';
  await _coSubmit(); res.utenOverstyring = { msg: document.getElementById('co-msg').textContent, calls: _rpcCalls.length };
  document.getElementById('co-override').checked = true; _coCheckOrgNr();
  await _coSubmit(); res.utenBegrunnelse = { msg: document.getElementById('co-msg').textContent, calls: _rpcCalls.length };
  document.getElementById('co-override-reason').value = 'Svensk firma'; _coCheckOrgNr();
  _rpcReply = { data: { org_id:'new-2', existed:false, name:'Utenlandsk Elektro AB', invite_token:'t2', invite_email:'x@y.se' }, error:null };
  await _coSubmit(); res.medBegrunnelse = _rpcCalls[0] && _rpcCalls[0].args;
  // Ugyldig nummer tastet inn
  await _coOpen(); document.getElementById('co-orgnr').value = '123456789'; res.ugyldig = _coCheckOrgNr().ok + ' / ' + document.getElementById('co-orgnr-hint').textContent;
  // Avdeling: flytt til hovedenhet
  await _coOpen(); await _coPick('31115'); _coMoveToParent(); document.getElementById('co-orgnr').value = '833911872';
  res.avdeling = _coCheckOrgNr();
  // Feilmelding når migrasjonen ikke er kjørt
  _rpcReply = { data:null, error:{ code:'PGRST202', message:'Could not find the function public.create_customer_org' } };
  document.getElementById('co-email').value='a@b.no'; await _coSubmit();
  res.ikkeKjort = document.getElementById('co-msg').textContent;
  _rpcReply = { data:null, error:{ code:'42501', message:'NOT_SUPPLIER: bare medlemmer av en leverandoer kan opprette kundebedrifter' } };
  await _coSubmit(); res.ikkeLeverandor = document.getElementById('co-msg').textContent;
  // Kundekort-knapp vises bare for leverandør
  _cachedCustomers = [{ id:'c1', name:'Krøderen Elektro AS', org_number:'123456785', erp_customer_no:'20001', email:'post@kroderen.no', postal_code:'3536', city:'Noresund', category:'business' }];
  document.getElementById('co-overlay').style.display='none';
  _openCustomerCard('c1');
  res.kortKnappLev = /Gi kunden tilgang/.test(document.getElementById('customer-card-overlay').innerHTML);
  await _coOpen({ customerId:'c1' });
  res.fraKort = ['co-name','co-orgnr','co-erp','co-addr','co-email'].map(id => document.getElementById(id).value);
  document.getElementById('co-overlay').style.display='none';
  _userOrg = { id:'org-inst', org_type:'installer' };
  _openCustomerCard('c1');
  res.kortKnappInst = /Gi kunden tilgang/.test(document.getElementById('customer-card-overlay').innerHTML);
  return res;
})()`);
console.log(JSON.stringify(r3, null, 1));
const errs2 = p.events.filter(e => e.method === 'Runtime.exceptionThrown').length;
console.log('sidefeil totalt:', errs2);
await p.close();
