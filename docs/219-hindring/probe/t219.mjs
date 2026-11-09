// 219: kjører _hindMenuRegressionTest219 (+ 218 og 216-dialogtesten for modal-hindring) i arbeidskopien.
import { openPage } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  const ut = [];
  for (const n of ['_hindMenuRegressionTest219', '_hindW2WRegressionTest218']) { if (typeof window[n] !== 'function') { ut.push(n + ': finnes ikke'); continue; }
    const t = await window[n](); const arr = Array.isArray(t) ? t : t.results; const f = arr.filter(x => !x.ok);
    ut.push(n + ': ' + (arr.length - f.length) + '/' + arr.length); for (const x of f) ut.push('  FEIL ' + x.name + ' — forventet ' + JSON.stringify(x.expected) + ', fikk ' + JSON.stringify(x.got)); }
  if (typeof _dialogRegressionTest216 === 'function') { const t = await _dialogRegressionTest216(); const arr = Array.isArray(t) ? t : t.results; const h = arr.filter(x => /hindring/i.test(x.name || '')); ut.push('_dialogRegressionTest216 (modal-hindring): ' + h.filter(x => x.ok).length + '/' + h.length + ' · alle: ' + arr.filter(x => x.ok).length + '/' + arr.length); for (const x of arr.filter(x => !x.ok)) ut.push('  FEIL ' + (x.name)); }
  return ut; })()`);
console.log(r.join('\n'));
await p.close(); process.exit(0);
