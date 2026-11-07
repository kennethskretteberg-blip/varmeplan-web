// 205: kjør én eller flere regresjonstester i ny fane:  node docs/211/probe/t.mjs _takRegressionTest205 …
import { openPage } from './cdp.mjs';
for (const n of process.argv.slice(2)) {
  const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
  const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
    const t = await ${n}(); const a = t.results || t; const f = a.filter(x => !x.ok);
    return { pass: a.length - f.length, total: a.length, fail: f.map(x => x.name + ' | forventet ' + x.expected + ' | fikk ' + x.got) }; })()`);
  console.log(n, r.pass + '/' + r.total); for (const f of r.fail) console.log('  ✗', f);
  await p.close();
}
process.exit(0);
