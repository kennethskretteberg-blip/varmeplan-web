// 199: skjermbildene til rapporten. Ekte tastetrykk (Input.insertText) og ekte museklikk.
//   node -e ' import("./docs/199/probe/vis.mjs") '
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const D = 'docs/199/';
const p = await openPage('http://localhost:4000/');
const ut = {};
const ev = x => p.eval(x);
const skriv = async (sel, tekst) => {
  await ev(`(() => { const e = document.querySelector('${sel}'); e.focus(); e.select(); })()`);
  await p.send('Input.insertText', { text: tekst });
  await sov(80);
};
const dialog = () => ev(`(() => { const o = document.getElementById('visma-no-overlay'); if (!o) return null;
  return { felt: [...o.querySelectorAll('label')].map(l => l.textContent), verdier: [...o.querySelectorAll('input')].map(i => i.value),
    meldinger: [...o.querySelectorAll('[id^=visma-no-msg-]')].filter(m => m.style.display !== 'none').map(m => m.textContent),
    lagreSperret: o.querySelector('#visma-no-save').disabled, fokus: document.activeElement && document.activeElement.id }; })()`);
const toast = () => ev(`(() => { const t = document.getElementById('visma-no-toast'); return t ? { tekst: t.textContent, gul: t.classList.contains('warn') } : null; })()`);
try {
  ut.oppsett = await ev(fs.readFileSync('docs/199/probe/fix.js', 'utf8'));
  // 1. Vunnet uten tilbudsnr. → begge feltene
  await ev(`_quickSetStatus('p6', 'vunnet', null)`); await sov(300);
  ut.vunnet = await dialog();
  await p.shot(D + 'dialog-vunnet-begge-felt.png');
  // 2. Fem siffer → melding, Lagre sperret
  await skriv('#visma-no-offer', '10445');
  ut.femSiffer = await dialog();
  await p.shot(D + 'dialog-feilmelding.png');
  await p.clickSel('#visma-no-save').catch(e => { ut.klikkSperret = String(e.message); }); await sov(200);
  ut.etterKlikkPaaSperret = { dialogStaar: !!(await dialog()), lagret: await ev(`_cachedProjects.find(x => x.id === 'p6')._vismaOfferNo`) };
  // 3. Samme tilbudsnr. som #0380 → lagres + gul melding
  await skriv('#visma-no-offer', '104 455');
  await skriv('#visma-no-order', '207720');
  ut.foerLagre = await dialog();
  await p.clickSel('#visma-no-save'); await sov(400);
  ut.varsel = await toast();
  ut.lagret = await ev(`(() => { const x = _cachedProjects.find(x => x.id === 'p6'); return [x._vismaOfferNo, x._vismaOrderNo, x._salesStatus]; })()`);
  ut.oppslag = await ev(`window.__kall.filter(k => /!=/.test(k))`);
  await p.shot(D + 'varsel-samme-nummer.png');
  await ev(`document.getElementById('visma-no-toast')?.remove()`);
  // 4. Filtrene
  const filter = async v => { await ev(`(async () => { const s = document.getElementById('dash-filter-status'); s.value = '${v}'; await _renderProjectList(); })()`); await sov(150);
    return ev(`[...document.querySelectorAll('#pl-tbody tr .pl-name, #pl-tbody tr')].length ? [...document.querySelectorAll('#pl-tbody tr')].map(r => r.textContent.replace(/\\s+/g, ' ').trim().slice(0, 60)) : []`); };
  ut.utenTilbudsnr = await filter('uten_tilbudsnr'); await p.shot(D + 'filter-uten-tilbudsnr.png');
  ut.utenOrdrenr = await filter('uten_ordrenr'); await p.shot(D + 'filter-uten-ordrenr.png');
  await filter('');
  await ev(`(() => { const s = document.getElementById('dash-filter-status'); s.size = s.options.length; s.style.height = 'auto'; s.style.position = 'relative'; s.style.zIndex = 5; })()`); await sov(150);
  await p.shot(D + 'filter-valg.png');
  await ev(`(() => { const s = document.getElementById('dash-filter-status'); s.size = 0; s.style.height = ''; })()`);
  fs.writeFileSync('docs/199/probe/vis.json', JSON.stringify(ut, null, 1));
  console.log(JSON.stringify(ut, null, 1));
} catch (e) { console.log('FEIL', e.message, JSON.stringify(ut, null, 1)); }
await p.close(); process.exit(0);
