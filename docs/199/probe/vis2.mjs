// 199: skjermbilder 2 — bedrift uten Visma (lista), og «Kunde & prosjektinfo» med feilmelding.
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const D = 'docs/199/';
const p = await openPage('http://localhost:4000/');
const ut = {};
const ev = x => p.eval(x);
try {
  await ev(fs.readFileSync('docs/199/probe/fix.js', 'utf8'));
  // Bedrift uten Visma: samme prosjekter, erp_format tomt.
  ut.utenVisma = await ev(`(async () => {
    _userOrg.erp_format = '';
    await _renderProjectList();
    const s = document.getElementById('dash-filter-status');
    const foer = _cachedProjects.find(x => x.id === 'p3')._salesStatus;
    await _quickSetStatus('p5', 'tilbud_sendt', null); await new Promise(r => setTimeout(r, 200));
    await _renderProjectList();
    const klikk = document.querySelector('.pl-visma-no');
    if (klikk) klikk.click();
    await new Promise(r => setTimeout(r, 200));
    return { valg: [...s.options].map(o => o.textContent), numreVist: [...document.querySelectorAll('.pl-visma-no')].map(e => e.textContent.trim()),
      hint: document.querySelectorAll('.pl-visma-add').length, klikkbare: [...document.querySelectorAll('.pl-visma-no')].filter(e => e.getAttribute('onclick')).length,
      p5status: _cachedProjects.find(x => x.id === 'p5')._salesStatus, dialogEtterStatus: !!document.getElementById('visma-no-overlay'),
      melding: !!document.getElementById('visma-no-toast'),
      sokTreff: _filterProjectsList(_cachedProjects, { search: '104391', status: '' }).map(x => x.name) };
  })()`);
  await p.shot(D + 'liste-uten-visma.png');
  // «Kunde & prosjektinfo» (Visma-bedrift): fire siffer i ordrenr.
  await ev(`(async () => {
    _userOrg.erp_format = 'visma_paste,gbao10';
    document.getElementById('pl-action-toast')?.remove();
    _supabaseProjectId = 'p4';
    S.project = Object.assign(S.project || {}, { name: 'Kontorbygg 2. etasje', description: 'Storgata 4, 6002 Ålesund', contact_name: 'Ola Nordmann', responsible: 'Fredrik Hansen' });
    _wfKundeModal();
    for (let i = 0; i < 100 && document.getElementById('wf-k-visma')?.dataset.loaded !== '1'; i++) await new Promise(r => setTimeout(r, 20));
    document.getElementById('wf-k-visma-order').focus();
  })()`);
  await p.send('Input.insertText', { text: '2077' }); await sov(100);
  ut.prosjektinfo = await ev(`(() => ({ tilbudsnr: document.getElementById('wf-k-visma-offer').value, ordrenr: document.getElementById('wf-k-visma-order').value,
    meldinger: [...document.querySelectorAll('[id^=wf-k-visma-msg-]')].filter(m => m.style.display !== 'none').map(m => m.textContent),
    lagreSperret: document.getElementById('wf-k-save').disabled, inputmode: document.getElementById('wf-k-visma-order').getAttribute('inputmode') }))()`);
  await p.shot(D + 'prosjektinfo-feilmelding.png');
  fs.writeFileSync('docs/199/probe/vis2.json', JSON.stringify(ut, null, 1));
  console.log(JSON.stringify(ut, null, 1));
} catch (e) { console.log('FEIL', e.message, JSON.stringify(ut, null, 1)); }
await p.close(); process.exit(0);
