// 219: tegner alle fem fixturene i begge stiler i ekte WebGL og lagrer PNG.  node docs/219/probe/bilder.mjs
import fs from 'node:fs';
import { openPage, sov } from '../../213/probe/cdp.mjs';
const FIX = ['1-filmens-bygg', '2-saltak', '3-l-form-8-kanter', '4-flatt-tak', '5-nedlop-under-bakken'];
const p = await openPage('http://localhost:4000/docs/3d/forhandsvisning.html');
const vent = async () => { for (let i = 0; i < 100; i++) { if (await p.eval('!!(window.__vis && window.__vis.ferdig) || !!document.getElementById("feil").textContent')) return; await sov(200); } throw new Error('timeout'); };
await vent();
const feil0 = await p.eval('document.getElementById("feil").textContent');
if (feil0) { console.log('FEIL', feil0); process.exit(1); }
for (const id of FIX) {
  await p.eval(`window.__vis = null; document.getElementById('fix').value = ${JSON.stringify(id)}; document.getElementById('fix').dispatchEvent(new Event('change'))`);
  await sov(100); await vent();
  for (const stil of ['strek', 'farge']) {
    await p.eval(`document.getElementById('s-${stil}').click(); document.getElementById('vismaal').checked = true; document.getElementById('vismaal').dispatchEvent(new Event('change'))`);
    await sov(300);
    await p.shot(`docs/219/${id}-${stil}.png`);
    console.log(id, stil, await p.eval(`(() => { const c = document.querySelector('#vis canvas'), g = c.getContext('webgl2') || c.getContext('webgl'); const d = new Uint8Array(4 * c.width * c.height); g.readPixels(0, 0, c.width, c.height, g.RGBA, g.UNSIGNED_BYTE, d); const s = new Set(); for (let i = 0; i < d.length; i += 4000) s.add(d[i] + ',' + d[i+1] + ',' + d[i+2]); return s.size; })()`));
  }
}
const logg = p.events.filter(e => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')).map(e => JSON.stringify(e.params).slice(0, 300));
console.log('konsollfeil:', logg.length, logg.slice(0, 5));
await p.close(); process.exit(0);
