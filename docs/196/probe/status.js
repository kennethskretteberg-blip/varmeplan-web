// 196: oppdaterer feltlinjene i STATUS.md (formatet på linjene beholdes nøyaktig).
const fs = require('fs');
const f = 'STATUS.md';
const felt = {
  'Sist oppdatert': '06.11.2026',
  'Sist gjort': '196 (`main`, ikke pushet): PDF — valg «Merking på tegningen: Label / Nummer» i PDF-dialogen. Label er standard og uendret (PDF-en byte-identisk med HEAD, sha målt). Nummer: ingen store labels, hvert element (matte, kabel, foliebane) får et nummer i en fylt sirkel (4,6 mm, 8 pt på papiret uansett romstørrelse) i elementets farge, nummerert venstre → høyre, så topp → bunn, fra 1 per rom; forklaring Nr · farge · Produkt · Mål · Effekt som ekte PDF-tekst — øverst til høyre for høye smale rom, under tegningen for brede, egen side «<rom> – forklaring» ved flere enn 15 rader (regel: størst tegning vinner). Valget huskes per bruker (`profiles.prefs.pdfMarkMode`), forhåndsvisningen følger valget. Ny `_pdfNumberModeRegressionTest` (47), de ni PDF-/profil-testene grønne med like tall. Trapper, plantegningssiden og kundelenka er ikke med (spørsmål). Rapport i docs/196/. Før det: 195 PDF «Lagre som», 194 kartet uten kant.',
  'Neste steg': 'Kenneth ser på `docs/196/RAPPORT.md` + `docs/196/eksempel-nummer.pdf` og svarer på `docs/196/SPØRSMÅL.md` (særlig 1 trapper, 2 egen side ved ledig plass, 8 Spesifikasjon). 195: håndsjekken nederst i `docs/195/RAPPORT.md` og `docs/195/SPØRSMÅL.md` (2 og 5). 194: `docs/194/SPØRSMÅL.md` (1 og 3). 197 (oppløsning/bildeformat) er neste PDF-oppgave. Push 190–196 når godkjent.',
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
