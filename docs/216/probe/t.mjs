import { openPage } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const r = await p.eval(`(async()=>{ try{await _loadProducts()}catch(e){} const t = await _takRegressionTest216(); const f=t.results.filter(x=>!x.ok); return {n:t.results.length, pass:t.results.length-f.length, f:f.map(x=>x.name+' :: '+x.got)} })()`);
console.log(JSON.stringify(r, null, 1)); console.log('unntak ved lasting:', p.events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>JSON.stringify(e.params.exceptionDetails).slice(0,300))); await p.close(); process.exit(0);
