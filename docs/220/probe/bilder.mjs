// 220: L-formen i ekte WebGL etter at mønene er tegnet, begge stiler. Før-bildene er 219s.
import { openPage, sov } from '../../213/probe/cdp.mjs';
const p = await openPage('http://localhost:4000/docs/3d/forhandsvisning.html');
const vent = async () => { for (let i = 0; i < 100; i++) { if (await p.eval('!!(window.__vis && window.__vis.ferdig) || !!document.getElementById("feil").textContent')) return; await sov(200); } throw new Error('timeout'); };
await vent();
for (const id of ['1-filmens-bygg', '2-saltak', '3-l-form-8-kanter']) {
  await p.eval(`window.__vis = null; document.getElementById('fix').value = ${JSON.stringify(id)}; document.getElementById('fix').dispatchEvent(new Event('change'))`);
  await sov(100); await vent();
  for (const stil of ['strek', 'farge']) {
    await p.eval(`document.getElementById('s-${stil}').click(); document.getElementById('vismaal').checked = false; document.getElementById('vismaal').dispatchEvent(new Event('change'))`);
    await sov(300);
    await p.shot(`docs/220/${id}-${stil}-etter.png`);
  }
  console.log(id, await p.eval(`document.body.innerText.split('\\n').filter(x => /advar|Takflate|⚠|lokk|plan/i.test(x)).slice(0, 8).join(' | ')`));
}
const logg = p.events.filter(e => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')).map(e => JSON.stringify(e.params).slice(0, 300));
console.log('konsollfeil:', logg.length, logg.slice(0, 5));
await p.close(); process.exit(0);
