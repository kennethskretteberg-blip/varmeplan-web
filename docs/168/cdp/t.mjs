import { openPage } from './cdp.mjs';
const p = await openPage(`http://localhost:4000/`);
await p.eval(`(async () => { await _loadProducts(); document.getElementById('auth-screen').style.display='none'; document.getElementById('project-list-screen').style.display='none'; document.getElementById('app').style.display='flex'; window._performAutoSave = () => Promise.resolve(); return 1; })()`);
const r = await p.eval(`(async () => { const t = _geoRegressionTest(); const a = await t.async; return { n: a.results.length, fail: a.results.filter(x=>!x.ok), c168: a.results.filter(x=>x.name.startsWith('168')).length, ok: a.ok }; })()`);
console.log(JSON.stringify(r,null,1).slice(0,2500));
await p.close();
