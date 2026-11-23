# 243 – Veggmålene («680 cm») legger seg heller ikke oppå hverandre

23.11.2026 · `main` · commit `@@HASH@@` · ikke pushet · ingen SQL

## Hva som er endret
- **Veggmålene** (`_drawDimAnnotationsForRoom`, også `bareVegger`-varianten i presentasjonen) følger nå 240-regelen: teksten står midt på målelinja som før bare når den får plass i linja (boks + 0,3 × skrifthøyde ≤ linjas lengde) og ikke treffer en tekst som alt står i `_dimPlaced`. Ellers flyttes den ut på utsiden av målelinja med en tynn leder.
- **Én kode:** flyttingen fra 240 er løftet ut av `_drawDimChainLayout` til `_dimFlushMoved`, som både kjedene og veggmålene kaller (samme spredning, rader, søk og prioritet – `_dimSpread1D` / `_dimFindSpot` er urørt). Korte vegger på samme linje behandles som én gruppe, som leddene i en kjede.
- **Begge veier:** veggmål som står i linja, registreres i `_dimPlaced` som før; flyttede veggmål legges i `_dimDefer` og plasseres sist, sammen med de flyttede kjedetekstene, og registreres med boks og leder. Kjedetekster og veggmål går dermed utenom hverandre.
- **Skjerm og PDF som i 240:** skjermen skjuler et veggmål som ikke får plass innen 1,5 tekstbredder og tre rader (zoom inn for å se det); PDF tegner alltid alle. 228 utvider fortsatt utsnittet når en flyttet tekst havner utenfor.
- Skriftstørrelse, strektykkelse, farger, 300 DPI/PNG, målelinjenes plassering og kjedetekstene er urørt. Målelinja og endemerkene tegnes der de sto; bare teksten flytter seg. Klikk/dra på veggmålet treffer linja som før.
- `_dimMovedStat` har fått `wallMoved` / `wallHidden` ved siden av kjedenes `moved` / `hidden`.

## Kontroll
Testrom «Nisjerom» 500 × 400 med pilaster 12 × 15, rørkasse 8 × 20, hjørnekasse 30 × 20 og trappet hjørne 3 × 10 cm (20 vegger, 13 av dem 8–30 cm); samme rom med seks foliebaner og foliekjede; og 240-eksempelet (L-rommet). Rombildet i 300 DPI, overlappende tekstpar der minst én er en måltekst og den andre er måltekst eller veggetikett:

| Rom | Mål i bildet | Par før, Normal | Par etter, Normal | Par før, Ekstra stor | Par etter, Ekstra stor | Utenfor bildet |
|---|---|---|---|---|---|---|
| Nisjerom | 20 | 9 | 0 | 35 | 0 | 0 |
| Nisjerom med folie | 35 | 0 | 0 | 13 | 0 | 0 |
| L-rommet fra 240 | 20 | 0 | 0 | 0 | 0 | 0 |

- **L-rommet:** bildet er bit-likt med HEAD i både Normal og Ekstra stor (`docs/243/probe/lik.cjs`).
- **Skjermen** (nisjerommet, veggmål mot veggmål/kjedetekst): rommet fyller lerretet 3 par → 0; sterkt utzoomet 56 par → 0. I hele tegningen skjules da 2 og 7 veggmål til man zoomer inn.
- Bilder i `docs/243/`: `foer-/etter-nisje-normal.png`, `-nisje-xstor.png`, `-nisjefolie-normal.png`, `-nisjefolie-xstor.png`, `-lrom-*.png`, og skjermen `foer-/etter-skjerm-nisje-fyller.png`, `-utzoomet.png` (samme for `nisjefolie`).
- **Ny `_wallDimNoOverlapRegressionTest243`:** 49/49 med synlig lerret (28/49 mot koden før), 33/33 i suiten (skjermdelen hoppes over bak innloggingen). Fire rom × Normal og Ekstra stor: ingen måltekst oppå en annen måltekst eller veggetikett, ingen utenfor bildet, alle veggmål står i PDF-bildet; L-rommet og et rektangel får ingen flyttede veggmål; skjerm uten overlapp.
- `_dimNoOverlapRegressionTest240`: 45/45 med synlig lerret, som før.
- **Hele suiten** (`docs/243/probe/alle.mjs`): suiten 108 tester, de 107 gamle like med HEAD (samme åtte røde uten innlogging, på HEAD og nå).

## Funn, ikke rettet
- **Rom med korte vegger ser annerledes ut også uten overlapp:** et veggmål som er bredere enn linja si (f.eks. «15 cm» på en 15 cm-vegg) flyttes ut selv om det ikke traff noe. Det er regelen fra 240 («får plass i linja»), men det betyr at «Nisjerom med folie» i Normal er endret selv om det hadde 0 par før.
- **Skrå vegger** har ikke fått regelen (flyttingen er akseparallell). De tegnes som før og står i lista som opptatt plass.
- **Veggetikettene («V7 10 cm») ligger fortsatt oppå hverandre** på korte vegger (trappet hjørne, pilaster). De var ikke en del av prompten. Veggmålene går utenom dem.
- **Lang leder i Ekstra stor:** i det trappede hjørnet (seks «10 cm» på 30 × 30 cm) sender PDF-søket én tekst langt ut (`etter-nisje-xstor.png`, øverst til høyre). Ingen overlapp, men lite pent.
- **Flyttet tekst oppå en annen målelinje:** «15 cm» fra pilasteren legger den hvite boksen over «180 cm»-linja i Ekstra stor (samme valg som 240-spørsmål 2).
- **Skrå kabelkjeder, hindringsmål og egne mål:** ikke rørt. Hindringsmålene i testprosjektet overlapper hverandre på skjermen ved sterk utzooming (17 par før og etter); de er ikke med i `_dimPlaced`.
- Veggmål for vegger som vender inn mot rommet (pilasterens sider) har «utsiden» inne i rommet, som før – flyttede tekster havner da på gulvet.

Spørsmål: `docs/243/SPØRSMÅL.md`.
