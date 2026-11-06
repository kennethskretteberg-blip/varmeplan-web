// 199: to påstander i rapporten målt — raden forsvinner fra filteret når nummeret legges inn, og tom-liste-teksten.
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const ev = x => p.eval(x);
const ut = {};
try {
  await ev(fs.readFileSync('docs/199/probe/fix.js', 'utf8'));
  const rader = () => ev(`[...document.querySelectorAll('#pl-tbody tr')].map(r => (r.textContent.match(/#[0-9]+/) || [''])[0])`);
  const tom = () => ev(`(() => { const e = document.getElementById('pl-empty'); return getComputedStyle(e).display === 'none' ? null : e.textContent; })()`);
  const filter = v => ev(`(async () => { document.getElementById('dash-filter-status').value = '${v}'; await _renderProjectList(); })()`);
  await filter('uten_tilbudsnr'); ut.foer = await rader();
  await p.clickSel('.pl-visma-no'); await sov(300);
  await ev(`document.getElementById('visma-no-offer').focus()`);
  await p.send('Input.insertText', { text: '104499' }); await sov(80);
  await p.clickSel('#visma-no-save'); await sov(400);
  ut.etter = await rader(); ut.tomTekst = await tom();
  ut.melding = await ev(`(document.getElementById('visma-no-toast') || {}).textContent`);
  await filter('uten_ordrenr'); ut.ordreFoer = await rader();
  await ev(`(async () => { await _setProjectVismaNo('p4', { order: '207721' }); await _renderProjectList(); })()`);
  ut.ordreEtter = await rader(); ut.ordreTom = await tom();
  await ev(`(async () => { document.getElementById('dash-search').value = 'finnesikke'; await _renderProjectList(); })()`);
  ut.tomMedSok = await tom();
  await ev(`(async () => { document.getElementById('dash-search').value = ''; })()`);
  await filter('tapt'); ut.tomTapt = await tom();
  console.log(JSON.stringify(ut, null, 1));
} catch (e) { console.log('FEIL', e.message, JSON.stringify(ut, null, 1)); }
await p.close(); process.exit(0);
