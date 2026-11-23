# 240 – Målekjeder: korte mål skrives aldri oppå hverandre

23.11.2026 · `main` · commit `6c08f0f` · ikke pushet · ingen SQL

## Hva som er endret
- `_drawDimChainLayout` (folie-, kabel- og mattekjedene, skjerm og PDF) sjekker nå om teksten får plass i leddet før den tegnes. Tekster som ikke får plass, flyttes ut på utsiden av kjeden med en tynn leder.
- Ny felles liste `_dimPlaced` per tegning: tekstbokser fra veggetiketter («V5 680 cm»), produktetiketter, veggmål, kjedetekster og mattemerknaden, pluss målelinjer og ledere. Nullstilles i `render()`.
- De flyttede tekstene plasseres til slutt i `drawAllDimAnnotations`, når alle rom og kjeder er tegnet, så de kjenner alt som står der.
- Mattemerknaden «Kabel → vegg min …» skyves utover hvis den treffer en tekst (den lå oppå veggmålet i Ekstra stor).
- Skriftstørrelse, strektykkelse, farger, hvit boks, 300 DPI/PNG og kjedenes plassering er urørt. Ingen mål er fjernet. 228 utvider fortsatt utsnittet når en flyttet tekst havner utenfor.

## Regelen for flytting
1. **Får plass:** tekstboks + 0,3 × skrifthøyde ≤ leddets lengde, og boksen treffer ingen tekst som alt står der → tegnes midt på leddet, nøyaktig som før.
2. **Får ikke plass:** teksten flyttes til en rad på utsiden av kjeden (bort fra rommet), med leder fra leddets midtpunkt til teksten.
3. **Flere korte ledd etter hverandre:** tekstene spres langs kjeden i leddenes rekkefølge, sentrert om leddene sine. Må en tekst flyttes mer enn én tekstbredde for det, fordeles de annenhver / hver tredje … på flere rader (færrest mulig, høyst 8).
4. **Opptatt plass:** forskyvning langs kjeden og neste rad utover prøves, billigst først. Boksen skal ikke treffe en annen tekst eller en leder, og lederen skal ikke krysse en fremmed tekst eller leder. En boks oppå en målelinje (veggmålet utenfor kjeden) er lov, men velges sist.
5. **Skjermen:** høyst 1,5 tekstbredder langs kjeden og tre rader ut. Finnes det ikke plass, skjules teksten til man zoomer inn. **PDF:** alle mål tegnes; søket utvides til det finnes plass.

## Kontroll
- **Kenneths eksempel** (L-rom 700 × 680, vannrette baner B=80/60/100/60/50, mellomrom 2 / 3,6 / 2,4 / 2 / 4 / 2 cm), rombildet i 300 DPI:

| | Mål i bildet | Overlappende par, Normal | Overlappende par, Ekstra stor | Utenfor bildet |
|---|---|---|---|---|
| Før (HEAD) | 20 | 6 | 12 | 0 |
| Etter | 20 | 0 | 0 | 0 |

  Bilder i `docs/240/`: `foer-/etter-normal-hel.png`, `-hoyre.png` (høyre kjede), `-hjorne.png` (nedre høyre hjørne), og det samme for `xstor`. Skjermen: `foer-/etter-skjerm-fyller.png` og `-utzoomet.png`.
- **Ytterpunkt** (300 × 300, 13 baner B=20 med 2 cm mellomrom, 34 mål): før 37 / 50 overlappende par (Normal / Ekstra stor), etter 0 / 0, ingen utenfor bildet. `foer-/etter-smale-*.png`.
- **Ny `_dimNoOverlapRegressionTest240`:** 34/34 i suiten (skjermdelen hoppes over når lerretet er skjult bak innloggingen), 45/45 med synlig lerret (`docs/240/probe/t240.js`). Fem rom (L-rom folie, smale baner, L-rom kabel, matte, rom uten veggmål) × Normal og Ekstra stor: ingen måltekst overlapper en annen måltekst eller en veggetikett, ingen utenfor bildet, alle kjedens tall står i bildet. Skjerm: ingen overlapp når rommet fyller lerretet og ved sterk utzooming.
- **Hele suiten** (`docs/240/probe/alle.mjs`, kopi av 236-utgaven): 105 tester, de 104 gamle like med HEAD. Åtte røde uten innlogging, de samme på HEAD og nå (prosjektlås, kundeforslag, fem `_geo*`, tak-216) – ikke sju.

## Funn, ikke rettet
- **Veggmålene** («680 cm») og **skrå kabelkjeder** (`_drawCableSkewDimChain`) går ikke gjennom `_drawDimChainLayout` og har ikke fått regelen. De er med i lista som opptatt plass, men flyttes ikke selv.
- **Hindringsmål og egne mål** tegnes etter kjedene og er ikke med i lista.
- **«V5 680 cm» oppå kjeden** ble ikke gjenskapt: i mitt L-rom står veggetikettene inne i rommet. Regelen flytter en kjedetekst som treffer en veggetikett, men jeg har ikke sett Kenneths rom.
- **Ekstra stor:** de flyttede tekstene legger seg oppå veggmålets linje (linja brytes av de hvite boksene), og i ytterpunktet er høyre halvdel rotete, om enn uten overlapp.
- I L-rommet ligger foliens langs-kjede («694 cm») tett inntil veggmålet «400 cm» øverst; de overlapper ikke. Kjedenes plassering er ikke rørt.

Spørsmål: `docs/240/SPØRSMÅL.md`.
