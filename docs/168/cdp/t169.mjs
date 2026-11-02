// 169: selvregistrering med «Kunde hos», ventesiden, «Velg passord» og Cenikas godkjenningsliste.
// Alt mot mock: signUp, rpc, updateUser og fetch til Edge Functions — ingen database-lesing eller -skriving.
import { openPage } from './cdp.mjs';
const out = process.argv[2] || '/tmp/t169';
const p = await openPage(null);
await p.goto('http://localhost:4000/');
const errs = () => p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
console.log('sidefeil ved lasting:', errs().length, errs().slice(0, 3));

const MOCK = `{
  window._real = window._real || _db;
  window._calls = { rpc: [], signUp: [], updateUser: [], fetch: [], proceed: 0, init: 0 };
  const auth = Object.create(_real.auth);
  auth.signUp = async (a) => { _calls.signUp.push(a); return { data: { user: { id: 'u-ny' } }, error: null }; };
  auth.updateUser = async (a) => { _calls.updateUser.push(a); return { data: { user: Object.assign({}, _currentUser, { user_metadata: Object.assign({}, _currentUser && _currentUser.user_metadata, a.data || {}) }) }, error: null }; };
  auth.getSession = async () => ({ data: { session: { access_token: 'tok-cenika' } } });
  window._rpcAnswers = window._rpcAnswers || {};
  _db = Object.assign(Object.create(_real), { auth,
    rpc: async (fn, args) => { _calls.rpc.push([fn, args]); const a = _rpcAnswers[fn]; return typeof a === 'function' ? a(args) : (a || { data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }); },
    from: (t) => {
      const q = { _t: t, select(){ return q; }, eq(){ return q; }, single: async () => (t === 'profiles' ? { data: window._mockProfile, error: null } : { data: null, error: null }),
        then(res){ return Promise.resolve(t === 'organization_members' ? { data: window._mockMembers || [], error: null } : { data: [], error: null }).then(res); } };
      return q; } });
  window.fetch = async (url, opt) => { _calls.fetch.push([String(url), opt && opt.body]); if (/kundesoknad-svar/.test(url)) return new Response(JSON.stringify(window._mailAnswer || { ok: true, result: 'sendt', sent_to: 'ola@welhaven.no' }), { status: window._mailStatus || 200 }); return new Response('{}', { status: 200 }); };
}`;

// ── 1. Registrering med «Kunde hos» ──────────────────────────────────────────
const r1 = await p.eval(`(async () => {
  ${MOCK}
  _rpcAnswers.list_registration_suppliers = { data: [{ id: '11111111-2222-3333-4444-555555555555', name: 'Cenika AS' }], error: null };
  _regSuppliers = null; _inviteToken = null;
  _authShowScreen(); _authSwitchTab('register');
  const res = {};
  res.lenkePåLogin = !!document.querySelector('#auth-apply-link a') && document.querySelector('#auth-apply-link a').innerText;
  document.getElementById('auth-reg-name').value = 'Ola Welhaven';
  document.getElementById('auth-reg-email').value = 'ola@welhaven.no';
  document.getElementById('auth-reg-pass').value = 'hemmelig123';
  _authRegNext();
  await new Promise(r => setTimeout(r, 100));
  const sel = document.getElementById('auth-reg-supplier');
  res.kundeHosSynlig = document.getElementById('auth-reg-supplier-field').style.display !== 'none';
  res.kundeHosValg = [...sel.options].map(o => o.text);
  res.forhåndsvalgt = sel.options[sel.selectedIndex].text;
  document.getElementById('auth-reg-company').value = 'Welhaven Elektro AS';
  document.getElementById('auth-reg-orgnr').value = '';
  await _authRegister();
  res.utenOrgnr = document.getElementById('auth-error').innerText;
  document.getElementById('auth-reg-orgnr').value = '123456789'; _regOrgNrHint();
  res.hintUgyldig = document.getElementById('auth-reg-orgnr-hint').innerText;
  await _authRegister();
  res.ugyldigOrgnr = document.getElementById('auth-error').innerText;
  res.signUpFørGyldig = _calls.signUp.length;
  document.getElementById('auth-reg-orgnr').value = '123 456 785'; _regOrgNrHint();
  res.hintGyldig = document.getElementById('auth-reg-orgnr-hint').innerText;
  await _authRegister();
  res.signUpMeta = _calls.signUp[0] && _calls.signUp[0].options.data;
  res.statusTekst = document.getElementById('auth-status').innerText.replace(/\\s+/g, ' ');
  res.adminVarsel = _calls.fetch.filter(f => /notify-admin-registration/.test(f[0])).length;
  return res;
})()`);
console.log('1 registrering', JSON.stringify(r1, null, 1));
await p.shot(out + '-1-sendt.png');

// ── 1b. «Ingen av disse» → dagens vei, ingen leverandør i metadata ────────────
const r1b = await p.eval(`(async () => {
  ${MOCK}
  _rpcAnswers.list_registration_suppliers = { data: [{ id: '11111111-2222-3333-4444-555555555555', name: 'Cenika AS' }], error: null };
  _authSwitchTab('register'); _authRegStep(2);
  await new Promise(r => setTimeout(r, 50));
  document.getElementById('auth-reg-supplier').value = '__none__';
  document.getElementById('auth-reg-company').value = 'Annen Elektro AS';
  document.getElementById('auth-reg-orgnr').value = '';
  await _authRegister();
  const res = { meta: _calls.signUp[0] && _calls.signUp[0].options.data, status: document.getElementById('auth-status').innerText.replace(/\\s+/g, ' ').slice(0, 80) };
  // Funksjonen finnes ikke (migrasjonen ikke kjørt) → feltet skjules, registreringen som før
  ${MOCK}
  _regSuppliers = null; delete _rpcAnswers.list_registration_suppliers;
  _authSwitchTab('register'); _authRegStep(2);
  await new Promise(r => setTimeout(r, 50));
  res.utenMigrasjonSkjult = document.getElementById('auth-reg-supplier-field').style.display === 'none';
  return res;
})()`);
console.log('1b ingen av disse / uten migrasjon', JSON.stringify(r1b, null, 1));

// ── 2. Ventesiden ved innlogging ─────────────────────────────────────────────
const r2 = await p.eval(`(async () => {
  ${MOCK}
  const res = {};
  const realInit = _initAfterAuth; _initAfterAuth = async () => { _calls.init++; };
  _currentUser = { id: 'u-ny', app_metadata: {}, user_metadata: { requested_supplier_org_id: '11111111-2222-3333-4444-555555555555', requested_supplier_name: 'Cenika AS' } };
  window._mockProfile = { id: 'u-ny', status: 'pending' };
  window._mockMembers = [{ org_id: 'o1', role: 'owner', organizations: { id: 'o1', name: 'Welhaven Elektro AS', org_type: 'installer', subscription_status: 'trial', trial_ends_at: new Date(Date.now() + 864e5 * 20).toISOString() } }];
  await _authCheckProfileAndProceed();
  res.pending = document.getElementById('auth-status').innerText.replace(/\\s+/g, ' ');
  res.slippetInnPending = _calls.init;
  window._mockMembers = [];
  await _authCheckProfileAndProceed();
  res.pendingUtenMedlemskap = document.getElementById('auth-status').innerText.replace(/\\s+/g, ' ');
  _currentUser.user_metadata = {};
  window._mockMembers = [{ org_id: 'o1', role: 'owner', organizations: { id: 'o1', name: 'X', org_type: 'installer', subscription_status: 'trial' } }];
  await _authCheckProfileAndProceed();
  res.vanligPending = document.getElementById('auth-status').innerText.replace(/\\s+/g, ' ');
  window._mockProfile = { id: 'u-ny', status: 'rejected' };
  await _authCheckProfileAndProceed();
  res.avvist = document.getElementById('auth-status').innerText.replace(/\\s+/g, ' ').slice(0, 40);
  res.slippetInnTotalt = _calls.init;
  _initAfterAuth = realInit;
  return res;
})()`);
console.log('2 ventesiden', JSON.stringify(r2, null, 1));
await p.shot(out + '-2-venter.png');

// ── 3. Velkommen — velg passord ──────────────────────────────────────────────
const r3 = await p.eval(`(async () => {
  ${MOCK}
  const res = {};
  const realChk = _authCheckProfileAndProceed; _authCheckProfileAndProceed = async () => { _calls.proceed++; };
  localStorage.removeItem(_VELKOMMEN_FLAG);
  history.replaceState({}, '', '/?velkommen=1');
  _VELKOMMEN_BOOT.search = '?velkommen=1'; _VELKOMMEN_BOOT.hash = '#access_token=x&refresh_token=y&type=invite';
  const user = { id: 'u-inv', invited_at: '2026-11-02T10:00:00Z', user_metadata: {} };
  _currentUser = user;
  res.vist = _velkommenMaybeShow(user);
  res.tittel = document.getElementById('auth-setpw-title').innerText;
  res.skjemaSynlig = document.getElementById('auth-setpw-form').style.display !== 'none';
  res.loginSkjult = document.getElementById('auth-login-form').style.display === 'none';
  res.merkeSatt = localStorage.getItem(_VELKOMMEN_FLAG) === 'u-inv';
  // Lukket fane: ren URL, men merket står → vises igjen
  res.etterLukketFane = _velkommenDecide({ search: '', hash: '', hasSession: true, localFlag: _velkommenFlagGet('u-inv') }).show;
  document.getElementById('auth-setpw-pass').value = 'kort';
  document.getElementById('auth-setpw-pass2').value = 'kort';
  await _velkommenSubmit();
  res.forKort = document.getElementById('auth-error').innerText;
  document.getElementById('auth-setpw-pass').value = 'langtpassord1';
  document.getElementById('auth-setpw-pass2').value = 'langtpassord2';
  await _velkommenSubmit();
  res.ulike = document.getElementById('auth-error').innerText;
  res.updateUserFør = _calls.updateUser.length;
  document.getElementById('auth-setpw-pass2').value = 'langtpassord1';
  await _velkommenSubmit();
  res.updateUser = _calls.updateUser;
  res.videreInn = _calls.proceed;
  res.urlEtter = location.pathname + location.search + location.hash;
  res.merkeFjernet = localStorage.getItem(_VELKOMMEN_FLAG) === null;
  res.ikkeIgjen = _velkommenMaybeShow(_currentUser) === false;
  _authCheckProfileAndProceed = realChk;
  return res;
})()`);
console.log('3 velg passord', JSON.stringify(r3, null, 1));

const r3b = await p.eval(`(async () => {
  ${MOCK}
  _VELKOMMEN_BOOT.search = ''; _VELKOMMEN_BOOT.hash = '#access_token=x&type=recovery';
  _velkommenMaybeShow({ id: 'u-rec', user_metadata: { password_set: true } });
  const t = document.getElementById('auth-setpw-title').innerText;
  localStorage.removeItem(_VELKOMMEN_FLAG); _VELKOMMEN_BOOT.hash = '';
  return { recoveryTittel: t };
})()`);
console.log('3b recovery', JSON.stringify(r3b));
await p.shot(out + '-3-velg-passord.png');

// ── 4. Cenikas godkjenningsliste ─────────────────────────────────────────────
const r4 = await p.eval(`(async () => {
  ${MOCK}
  const res = {};
  _userOrg = { id: 'org-cenika', org_type: 'supplier', supplier_name: 'Cenika AS', name: 'Cenika AS' };
  const iso = d => new Date(Date.now() - d * 864e5).toISOString();
  _rpcAnswers.list_customer_requests = { data: [
    { org_id: 'a1', name: 'Welhaven Elektro AS', org_nr: '123456785', org_nr_taken: false, contact_name: 'Ola Welhaven', email: 'ola@welhaven.no', phone: '900 00 000', message: 'Vi kjøper kabel fra dere', created_at: iso(1), erp_matches: [{ erp_no: '30470', name: 'Welhaven Elektro' }] },
    { org_id: 'a2', name: 'Ny Elektro AS', org_nr: '914939828', org_nr_taken: false, contact_name: 'Kari Ny', email: 'kari@ny.no', created_at: iso(2), erp_matches: [] },
    { org_id: 'a3', name: 'Bravida Drammen', org_nr: '941163343', org_nr_taken: true, contact_name: 'Per Fremmed', email: 'per@gmail.com', created_at: iso(3), erp_matches: [{ erp_no: '1001', name: 'Bravida avd Drammen' }, { erp_no: '1002', name: 'Bravida avd Kongsberg' }] },
  ], error: null };
  _rpcAnswers.approve_customer_org = (a) => ({ data: a.p_org_id === 'a2' ? { result: 'existing_org', org_id: 'a2' } : { result: 'approved', org_id: a.p_org_id, name: 'Welhaven Elektro AS' }, error: null });
  _rpcAnswers.reject_customer_org = (a) => ({ data: { result: 'rejected', org_id: a.p_org_id }, error: null });
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('project-list-screen').style.display = 'flex';
  document.getElementById('cust-req-btn').style.display = '';
  _creqState = { rows: null, err: null, open: false, busy: {}, results: {}, rejectFor: null, erpPick: {} };
  await _creqRefresh();
  res.tallKnapp = document.getElementById('cust-req-count').innerText;
  res.tallFane = document.getElementById('dash-tab-customers-count').innerText;
  _switchDashTab('customers');
  _creqToggle();
  await new Promise(r => setTimeout(r, 100));
  res.rader = [...document.querySelectorAll('.creq-row')].map(d => d.innerText.replace(/\\s+/g, ' '));
  res.godkjennKnapper = [...document.querySelectorAll('.creq-row')].map(d => [...d.querySelectorAll('button')].map(b => b.innerText).join('|'));
  return res;
})()`);
console.log('4 liste', JSON.stringify(r4, null, 1));
await p.shot(out + '-4-liste.png');

const r5 = await p.eval(`(async () => {
  const res = {};
  window._mailStatus = 404; window._mailAnswer = { error: 'not found' };
  await _creqApprove('a1');
  res.approveArgs = _calls.rpc.filter(c => c[0] === 'approve_customer_org').map(c => c[1]);
  res.mailKall = _calls.fetch.filter(f => /kundesoknad-svar/.test(f[0])).map(f => f[1]);
  res.radA1 = document.querySelector('.creq-row[data-org="a1"]').innerText.replace(/\\s+/g, ' ');
  await _creqApprove('a2');
  res.radA2 = document.querySelector('.creq-row[data-org="a2"]').innerText.replace(/\\s+/g, ' ');
  window._mailStatus = 200; window._mailAnswer = { ok: true, result: 'sendt', sent_to: 'per@gmail.com' };
  _creqState.rejectFor = 'a3'; _creqRender();
  document.getElementById('creq-reason-a3').value = 'Søkeren er ikke ansatt i Bravida';
  await _creqReject('a3');
  res.rejectArgs = _calls.rpc.filter(c => c[0] === 'reject_customer_org').map(c => c[1]);
  res.radA3 = document.querySelector('.creq-row[data-org="a3"]').innerText.replace(/\\s+/g, ' ');
  res.tallEtter = document.getElementById('cust-req-count').innerText + '/' + document.getElementById('dash-tab-customers-count').style.display;
  // Ikke-leverandør: knappen skjules (gate i dashbordet), RPC gir tom liste uansett
  return res;
})()`);
console.log('5 godkjenn/avslå', JSON.stringify(r5, null, 1));
await p.shot(out + '-5-behandlet.png');

const r6 = await p.eval(`(async () => {
  ${MOCK}
  _creqState = { rows: null, err: null, open: true, busy: {}, results: {}, rejectFor: null, erpPick: {} };
  delete _rpcAnswers.list_customer_requests;
  await _creqRefresh();
  return { utenMigrasjon: document.getElementById('cust-req-section').innerText.replace(/\\s+/g, ' '), tall: document.getElementById('cust-req-count').style.display };
})()`);
console.log('6 uten migrasjon', JSON.stringify(r6));
console.log('sidefeil totalt:', errs().length, errs().slice(0, 3));
await p.close();
