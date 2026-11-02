// 049: avvik fra prosjekteringen i Garantiportalen — merke i lista, detaljlinje, filter, KPI.
// Mock av _portalLoad og heating_products-oppslaget — ingen database-lesing eller -skriving.
import { openPage } from './cdp.mjs';
const out = process.argv[2] || '/tmp/t049';
const p = await openPage(null);
await p.goto('http://localhost:4000/');
const errs = () => p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
console.log('sidefeil ved lasting:', errs().length, errs().slice(0, 3));

const r1 = await p.eval(`(async () => {
  const res = {};
  const rt = _portalDesignRegressionTest();
  res.regresjon = rt.filter(x => x.ok).length + '/' + rt.length;
  res.regresjonFeil = rt.filter(x => !x.ok).map(x => x.name + ' ' + JSON.stringify(x.got));
  _userOrg = { id:'org-cenika', org_type:'supplier', supplier_name:'Cenika AS', name:'Cenika AS' };
  HEATING_PRODUCTS = [{ id: 501, name: 'InFloor 17T 700 W' }];
  const iso = d => new Date(Date.now() - d * 864e5).toISOString();
  const pr = (o) => Object.assign({ id: Math.random().toString(36).slice(2), product_name: 'InFloor 17T 600 W', kind: 'cable', meters: 35, effect_w: 600, nominal_ohm: 88.2, designed_product_id: null, deviates_from_design: false, measurements: [] }, o);
  window._mockCerts = [
    { id:'c1', garanti_id:'CEN-0001', created_at: iso(2), status:'signed', installer_company:'Krøderen Elektro AS', project_name:'Enebolig Noresund', room_name:'Bad', certificate_products:[ pr({ designed_product_id: 501, deviates_from_design: true }) ], certificate_photos:[] },
    { id:'c2', garanti_id:'CEN-0002', created_at: iso(5), status:'signed', installer_company:'Lyn Elektro AS', project_name:'Leilighet Oslo', room_name:'Gang', certificate_products:[ pr({ product_name:'InFloor 17T 700 W', effect_w:700 }) ], certificate_photos:[] },
    { id:'c3', garanti_id:'CEN-0003', created_at: iso(8), status:'draft', installer_company:'Lyn Elektro AS', project_name:'Hytte Geilo', room_name:'Stue', certificate_products:[ pr({ product_name:'Folie 60', kind:'foil' }), pr({ product_name:'Folie 100', kind:'foil', designed_product_id: 777, deviates_from_design: true }) ], certificate_photos:[] },
    { id:'c4', garanti_id:'CEN-0004', created_at: iso(9), status:'signed', installer_company:'Krøderen Elektro AS', project_name:'Rekkehus', room_name:'Kjøkken', certificate_products:[ pr({ designed_product_id: 501, deviates_from_design: false }) ], certificate_photos:[] },
  ];
  window._hpCalls = [];
  _db = Object.assign(Object.create(_db || {}), { from: (t) => {
    if (t !== 'heating_products') return { select(){ return this; }, order(){ return Promise.resolve({ data: [], error: null }); } };
    return { select(){ return this; }, in(col, ids){ _hpCalls.push(ids); return Promise.resolve({ data: ids.filter(i => i === 777).map(i => ({ id: i, name: 'Folie 80 (annen leverandør)' })), error: null }); } };
  } });
  _portalLoad = async () => JSON.parse(JSON.stringify(_mockCerts));
  _docLoadSuppliers = async () => {};
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('project-list-screen').style.display = 'flex';
  _switchDashTab('portal');
  await new Promise(r => setTimeout(r, 300));
  res.oppslag = _hpCalls;
  res.kpi = [...document.querySelectorAll('#portal-stats .dash-stat')].map(d => d.innerText.replace(/\\s+/g, ' '));
  res.rader = [...document.querySelectorAll('#portal-tbody tr')].map(tr => tr.innerText.replace(/\\s+/g, ' '));
  res.merker = document.querySelectorAll('#portal-tbody .doc-pill[title^="Elektrikeren byttet"]').length;
  const f = document.getElementById('portal-filter-design');
  f.value = 'byttet'; _portalApplyAndRender();
  res.filtrert = [...document.querySelectorAll('#portal-tbody tr td:first-child')].map(td => td.innerText);
  res.kpiUendretVedFilter = [...document.querySelectorAll('#portal-stats .dash-stat')].map(d => d.innerText.replace(/\\s+/g, ' '))[3];
  return res;
})()`);
console.log(JSON.stringify(r1, null, 1));
await p.shot(out + '-1-liste.png');

const r2 = await p.eval(`(async () => {
  const res = {};
  await _portalDetail('c1');
  res.detaljC1 = [...document.querySelectorAll('#portal-detail-overlay div')].map(d => d.innerText).filter(t => /^Prosjektert:/.test(t));
  _portalCloseDetail();
  await _portalDetail('c3');
  res.detaljC3 = [...document.querySelectorAll('#portal-detail-overlay div')].map(d => d.innerText).filter(t => /^Prosjektert:/.test(t));
  return res;
})()`);
console.log(JSON.stringify(r2, null, 1));
await p.shot(out + '-2-detalj.png');

const r3 = await p.eval(`(async () => {
  const res = {};
  _portalCloseDetail();
  // Før migrasjonen: radene mangler kolonnene → KPI «—», ingen merker, filteret gir tom liste
  _mockCerts = _mockCerts.map(c => Object.assign({}, c, { certificate_products: c.certificate_products.map(p => { const q = Object.assign({}, p); delete q.designed_product_id; delete q.deviates_from_design; return q; }) }));
  document.getElementById('portal-filter-design').value = '';
  await _renderPortal();
  res.kpiFørMigrasjon = [...document.querySelectorAll('#portal-stats .dash-stat')].map(d => d.innerText.replace(/\\s+/g, ' '))[3];
  res.merkerFørMigrasjon = document.querySelectorAll('#portal-tbody .doc-pill[title^="Elektrikeren byttet"]').length;
  res.raderFørMigrasjon = document.querySelectorAll('#portal-tbody tr').length;
  return res;
})()`);
console.log(JSON.stringify(r3, null, 1));
console.log('sidefeil totalt:', errs().length, errs().slice(0, 3));
await p.close();
