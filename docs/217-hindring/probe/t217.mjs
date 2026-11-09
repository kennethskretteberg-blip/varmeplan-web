import { openPage } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} const t = _hindDimRegressionTest217(); return t.results.map(x => (x.ok ? '✓ ' : '✗ ') + x.name + (x.ok ? '' : '  → ventet ' + JSON.stringify(x.expected) + ' fikk ' + JSON.stringify(x.got))); })()`);
console.log(r.join('\n')); await p.close(); process.exit(0);
