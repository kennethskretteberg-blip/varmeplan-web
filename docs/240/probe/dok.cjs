// 240: skriver endringslogg og STATUS, retter én setning i rapporten og sletter HEAD-kopien.
const fs = require('fs');
const kort = '240 Målekjeder: korte mål skrives aldri oppå hverandre (`main`, committet `@@HASH@@`, ikke pushet, ingen SQL): `_drawDimChainLayout` (folie-, kabel- og mattekjedene, skjerm og PDF) tegner teksten midt på leddet bare når den får plass (boks + 0,3 × skrifthøyde ≤ leddet) og ikke treffer en tekst som alt står der; ellers flyttes den ut på utsiden av kjeden med en tynn leder, spredt langs kjeden i leddenes rekkefølge og fordelt på flere rader når én rad blir for lang. Ny felles liste `_dimPlaced` per tegning (veggetiketter, produktetiketter, veggmål, kjedetekster, målelinjer, ledere); de flyttede tekstene plasseres sist i `drawAllDimAnnotations`. Skjermen: finnes ingen plass innen 1,5 tekstbredder og tre rader, skjules teksten til man zoomer inn; PDF: alle mål tegnes. Kenneths L-rom (700 × 680, B=80/60/100/60/50): 6 overlappende par i Normal og 12 i Ekstra stor på HEAD, 0 og 0 nå, 20 mål før og etter, ingen utenfor bildet. Skrift, streker, farger, 300 DPI og kjedenes plassering urørt. Ny `_dimNoOverlapRegressionTest240` 34/34 (45/45 med synlig lerret); suiten 105 tester, de 104 gamle like med HEAD (åtte røde uten innlogging, på HEAD og nå). Ikke rettet: veggmålene og skrå kabelkjeder har ikke regelen; hindringsmål og egne mål er ikke med i lista; «V5 680 cm» oppå kjeden ble ikke gjenskapt. Se `docs/240/RAPPORT.md`.';
let st = fs.readFileSync('STATUS.md', 'utf8');
st = st.replace(/(\*\*Sist oppdatert:\*\* )[0-9.]+/, (m, a) => a + '23.11.2026');
st = st.replace('**Sist gjort:** ', () => '**Sist gjort:** ' + kort + ' Før det: ');
st = st.replace('**Neste steg:** ', () => '**Neste steg:** Kenneth lager PDF av et folierom med smale mellomrom (gjerne rommet fra skjermbildet), ser på høyre kjede og hjørnene i Normal og Ekstra stor, og svarer på `docs/240/SPØRSMÅL.md` (skjule eller flytte på skjermen; tekst oppå veggmålets linje; flere rader eller lange ledere; hvor mye luft; veggmål og skrå kabelkjeder inn under regelen; hindringsmål og egne mål; ytterpunktet med 13 smale baner; prosjektnummeret til rommet med «V5 680 cm»). Deretter: ');
fs.writeFileSync('STATUS.md', st);
let el = fs.readFileSync('docs/endringslogg.md', 'utf8');
const ny = '## 240 — Målekjeder: korte mål skrives aldri oppå hverandre (23.11.2026, `@@HASH@@`, `main`, ikke pushet)\n\n' + kort.replace(/^240 [^(]+\([^)]*\): /, '') + '\n\n';
if (!el.includes('## 240 — ')) el = el.replace('## 239 — ', () => ny + '## 239 — ');
fs.writeFileSync('docs/endringslogg.md', el);
let ra = fs.readFileSync('docs/240/RAPPORT.md', 'utf8');
ra = ra.replace('bare 5 mm fra veggmålet «400 cm» øverst; de overlapper ikke, men står tett', () => 'tett inntil veggmålet «400 cm» øverst; de overlapper ikke');
fs.writeFileSync('docs/240/RAPPORT.md', ra);
fs.rmSync('docs/240/probe/head', { recursive: true, force: true });
console.log('ok', st.includes('240 Målekjeder'), el.includes('## 240 — '), fs.existsSync('docs/240/probe/head'));
