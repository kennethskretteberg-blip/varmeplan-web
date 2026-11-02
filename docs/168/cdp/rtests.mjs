// Kjører navngitte regresjonstester (konsollfunksjoner i index.html), hver i sin egen fane.
// Bruk: node rtests.mjs [url] _orgNrRegressionTest _gbao10RegressionTest ...
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2);
const URL = /^https?:/.test(args[0] || '') ? args.shift() : 'http://localhost:4000/';
const names = args;
for (const n of names) {
  const p = await openPage(URL);
  try {
    const r = await p.eval(`(async () => {
      try { await _loadProducts(); } catch(e) {}
      // Ingen stubbing av autosave: flere tester leser kildeteksten til _performAutoSave/_scheduleAutoSave.
      const t = await ${n}();
      const arr = Array.isArray(t) ? t : (t && Array.isArray(t.results) ? t.results : null);
      if (!arr) return { raw: JSON.stringify(t).slice(0, 300) };
      const fail = arr.filter(x => !(x.ok === true || x.pass === true));
      return { pass: arr.length - fail.length, total: arr.length, fail: fail.slice(0, 5).map(x => x.name || x.label || JSON.stringify(x).slice(0, 120)) };
    })()`);
    console.log(n, JSON.stringify(r));
  } catch (e) { console.log(n, 'FEIL', String(e.message).slice(0, 300)); }
  await p.close();
}
