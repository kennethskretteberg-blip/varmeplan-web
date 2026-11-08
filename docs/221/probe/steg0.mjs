// STEG 0: nettkall før 3D åpnes, og tid for byggTak + tegnScene.
import fs from 'node:fs';
import { aapne, sov, FILM, LFORM } from './oppsett.mjs';
const ut = {};
const p = await aapne();
const før = p.nett();
ut.nett_totalt_for_aapning = før.length;
ut.treff_for = før.filter(u => /varmeplan-3d|three|jsdelivr.*three/.test(u));
ut.moduler_i_dom = await p.eval(`[...document.scripts].map(s => s.src).filter(s => /varmeplan-3d|three/.test(s))`);
const i = før.length;
await p.clickSel('.tak3d-chip');
const klar = await p.klar();
await sov(300);
ut.klar = klar;
ut.nett_etter_aapning = p.nettFra(i);
await p.close();
for (const fix of [FILM, LFORM]) {
  const q = await aapne({ fix });
  await q.clickSel('.tak3d-chip'); await q.klar(); await sov(200);
  ut[fix] = await q.eval(`(async () => {
    const mod = await import('./varmeplan-3d.js'), t = JSON.parse(JSON.stringify(S.tak[window.__fid]));
    const bygg = [], teg = [];
    for (let n = 0; n < 11; n++) { let a = performance.now(); const s = mod.byggTak(t, {}); bygg.push(performance.now() - a);
      const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:500px;height:500px'; document.body.appendChild(d);
      a = performance.now(); const v = await mod.tegnScene(s, d, {}); teg.push(performance.now() - a); v.lukk(); d.remove(); }
    const med = x => x.slice(1).sort((a, b) => a - b)[5];
    let a = performance.now(); for (let n = 0; n < 200; n++) JSON.stringify(S.tak[window.__fid]); const poll = (performance.now() - a) / 200;
    return { byggTak_ms: +med(bygg).toFixed(2), tegnScene_ms: +med(teg).toFixed(2), tekst_kB: +(JSON.stringify(t).length / 1000).toFixed(1), poll_stringify_ms: +poll.toFixed(3) }; })()`);
  await q.close();
}
fs.writeFileSync('docs/221/probe/steg0.json', JSON.stringify(ut, null, 1));
console.log(JSON.stringify(ut, null, 1));
process.exit(0);
