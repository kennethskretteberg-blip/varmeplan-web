// 195: oppdaterer feltlinjene i STATUS.md (formatet på linjene beholdes nøyaktig).
const fs = require('fs');
const f = 'STATUS.md';
const felt = {
  'Sist oppdatert': '06.11.2026',
  'Sist gjort': '195 (`main`, ikke pushet): PDF — velg navn og mappe ved lagring. I Chrome/Edge åpner «Generer PDF» nettleserens «Lagre som» med dagens filnavn ferdig utfylt (dialogen åpnes først, PDF-en bygges etterpå — et klikk gjelder i 5 s, målt); mappa huskes av nettleseren. Safari/Firefox/mobil laster ned som før, med en forklaring i PDF-dialogen. Avkrysning «Velg navn og mappe ved lagring» i PDF-dialogen, på som standard, husket per bruker (`profiles.prefs.pdfSavePicker`). Avbryt er stille (ingen fil, ingen revisjon, ingen status). Ny `_pdfSavePickerRegressionTest195` (43), de åtte PDF-/profil-testene grønne med like tall. Selve lagre-dialogen på skjermen er IKKE prøvd (testnettleseren har ingen skjerm) — håndsjekk i rapporten. Rapport i docs/195/. Før det: 194 kartet uten kant (flislag).',
  'Neste steg': 'Kenneth gjør håndsjekken nederst i `docs/195/RAPPORT.md` (to minutter i Chrome) og svarer på `docs/195/SPØRSMÅL.md` (særlig 2 og 5). 194: se `docs/194/RAPPORT.md` og svar på `docs/194/SPØRSMÅL.md` (særlig 1 og 3). Push 190–195 når godkjent.',
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
console.log(s);
