// 199: oppdaterer feltlinjene i STATUS.md (formatet på linjene beholdes nøyaktig), retter én linje i
// rapporten, og fjerner HEAD-kopien som bare ble brukt til sammenligningen.
const fs = require('fs');
const f = 'STATUS.md';
const felt = {
  'Sist oppdatert': '06.11.2026',
  'Sist gjort': '199 (`main`, ikke pushet, ingen ny SQL): Visma-numre, svar på 198. Bare Visma-bedrifter (`organizations.erp_format` satt) får feltene, hintene, knappen i PDF-meldingen og filtervalgene; et nummer som alt finnes hos en bedrift uten Visma, vises og er søkbart, men kan ikke endres. Nøyaktig 6 siffer: mellomrom fjernes («104 455» → «104455»), melding under feltet og sperret «Lagre» ellers, skriveren `_setProjectVismaNo` avviser ugyldige verdier selv; gamle fritekst-verdier står urørt. Vunnet (også «Vi fikk jobben») viser begge feltene når tilbudsnr. mangler. Samme nummer på et annet prosjekt i samme organisasjon lagres, men gir gul melding (ett oppslag mot databasen). To nye filtervalg: «Tilbud sendt uten tilbudsnr.» og «Vunnet uten ordrenr.». Ny `_vismaNoAudit199()` (konsollen, leser bare) teller gamle verdier. `_vismaNoRegressionTest198` 119/119; de 65 andre testene like med HEAD. Antall gamle verdier i produksjon er ikke målt (ingen innlogging). Rapport i docs/199/. Før det: 198 tilbudsnr./ordrenr. fra Visma, 196 PDF Label/Nummer.',
  'Neste steg': 'Kenneth tar håndsjekken nederst i `docs/199/RAPPORT.md`, kjører `await _vismaNoAudit199()` i konsollen (antall numre som ikke er 6 siffer / hos bedrifter uten Visma) og svarer på `docs/199/SPØRSMÅL.md` (særlig 1, 3 og 6). Mobilappen (198 spm 9) tas i egen prompt. 196: `docs/196/SPØRSMÅL.md` (1, 2, 8). 195: håndsjekken nederst i `docs/195/RAPPORT.md`. 194: `docs/194/SPØRSMÅL.md` (1 og 3). 197 (oppløsning/bildeformat) er neste PDF-oppgave. Push 199 når godkjent.',
};
let s = fs.readFileSync(f, 'utf8');
for (const [k, v] of Object.entries(felt)) {
  const linjer = s.split('\n');
  const i = linjer.findIndex(l => l.startsWith('- **' + k + ':**'));
  if (i < 0) throw new Error('fant ikke feltet ' + k);
  linjer[i] = '- **' + k + ':** ' + v;
  s = linjer.join('\n');
}
fs.writeFileSync(f, s);
let r = fs.readFileSync('docs/199/RAPPORT.md', 'utf8');
const fra = 'Logg inn som en bedrift uten Visma (eller be meg lage en testbedrift): ingen felt ved statusendring, ingen\n   nye filtervalg.';
if (r.split(fra).length !== 2) throw new Error('fant ikke rapportlinja');
r = r.split(fra).join('Logg inn som en bedrift uten Visma: ingen felt ved statusendring, ingen nye filtervalg.');
fs.writeFileSync('docs/199/RAPPORT.md', r);
fs.rmSync('docs/199/probe/head', { recursive: true, force: true });
for (const t of ['t0.json', 't1.json']) fs.rmSync('docs/199/probe/' + t, { force: true });
console.log('STATUS.md oppdatert, rapportlinje rettet, HEAD-kopi fjernet');
