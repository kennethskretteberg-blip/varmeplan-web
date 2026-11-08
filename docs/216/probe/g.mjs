// 216: 007-testen ligger i _geoRegressionTest (async-delen, _roofTileMode=false). alle.mjs kaller delene uten `results` og får bare «KASTER».
import { openPage } from './cdp.mjs';
for (const [navn, url] of [['head', 'http://localhost:4000/docs/216/probe/head/index.html'], ['etter', 'http://localhost:4000/']]) {
  const p = await openPage(url);
  const r = await p.eval(`(async()=>{ const t = await _geoRegressionTest().async; const f=t.results.filter(x=>!x.ok); const k=t.results.find(x=>/knappen heter/.test(x.name)); return {n:t.results.length, pass:t.results.length-f.length, fail:f.map(x=>x.name), knapp:k&&{name:k.name,ok:k.ok}} })()`);
  console.log(navn, JSON.stringify(r).slice(0,700)); await p.close();
}
process.exit(0);
