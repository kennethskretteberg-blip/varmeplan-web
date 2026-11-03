import { openPage } from './cdp.mjs';
const [,, port, ...names] = process.argv;
const out = {};
for (const n of names) {
  const p = await openPage(`http://localhost:${port}/`);
  const r = await p.eval(`(async()=>{ try { await Promise.race([_loadProducts(), new Promise(r=>setTimeout(r,5000))]); } catch(e){}
    window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
    const norm = (x) => { const arr = Array.isArray(x) ? x : (x && (x.results || x.checks)) || null; return arr; };
    let r = ${n}();
    let a = r && r.async ? await r.async : null;
    r = await r;
    const all = [].concat(norm(r) || [], norm(a) || []);
    const fails = all.filter(c => c && c.ok === false).map(c => ({ name: c.name, got: c.got, expected: c.expected }));
    return { total: all.length, fails, raw: all.length ? undefined : JSON.stringify(r).slice(0, 400) };
  })()`).catch(e => ({ FEIL: e.message }));
  out[n] = r; await p.close();
}
console.log(JSON.stringify(out, null, 1).slice(0, 12000)); process.exit(0);
