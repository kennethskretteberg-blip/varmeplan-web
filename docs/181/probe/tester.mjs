// Kjører regresjonstestene i en ny fane. node tester.mjs <port> [navn ...]
import { openPage } from './cdp.mjs';
const [,, port, ...navn] = process.argv;
const liste = navn.length ? navn : ['_cableOverviewRegressionTest', '_pdfExportSmokeTest', '_foilResistanceRegressionTest', '_gbao10RegressionTest'];
const p = await openPage(`http://localhost:${port}/`);
for (const n of liste) {
  const r = await p.eval(`(async()=>{ if (typeof ${n} !== 'function') return { mangler: true }; const r = await ${n}(); const res = r.results || r; return { ok: r.ok, n: res.length, feil: res.filter(x => !x.ok).map(x => x.name + ' → ' + JSON.stringify(x.got).slice(0, 300)) }; })()`);
  console.log(n, r.mangler ? 'MANGLER' : (r.ok ? 'BESTÅTT' : 'FEILET'), r.n != null ? (r.n - r.feil.length) + '/' + r.n : '', r.feil && r.feil.length ? '\n  ' + r.feil.join('\n  ') : '');
}
const errs = p.events.filter(e => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error'));
console.log('konsollfeil:', errs.length, errs.slice(0, 5).map(e => JSON.stringify(e.params).slice(0, 200)).join('\n'));
await p.close(); process.exit(0);
