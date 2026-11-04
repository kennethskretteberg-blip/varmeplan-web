# 184 · Hesteskotrapp: bryter for sidemargin, «Lik avstand» eller «Fyll toppflaten»

`main`, ikke pushet. Commit «184: …». Alt ligger i `index.html`. Bare hesteskotrapper med valg 2 får nytt
utlegg. Valg 1 og rette trapper er identiske med HEAD (målt).

Harness: headless Chrome på port 9333 (`/tmp/cdp184`). Ny kode er servert på 4000 og HEAD (`4fa7c06`) på 4183
fra `git archive` i `/tmp/old183`. Katalogen er syntetisk (InSnow 30T, samme som 176–183, pluss 55 m i test 4).
Ingen skyprosjekter er rørt.

## Kort svar

| | Valg 1 · Lik avstand | Valg 2 · Fyll toppflaten |
|---|---|---|
| Toppflaten, 8 strenger | 431,2 cm, avstand sider **19,4** | **466 cm**, avstand sider **2** |
| Hesteskoen, 4 strenger | 579,2–687,2 cm, avstand sider **19,4** | **509,8–617,8 cm**, avstand sider **54,1** |
| Kabel 1 × 60 m | Passer | Passer (behov 60,0 m) |

- Valg 1 er tallene fra skjermbildet ditt, gjenskapt nøyaktig (se «Hvilken trapp» under).
- I valg 2 ligger toppflaten 2 cm fra kantene, altså på gulvet («din: 2»). Hesteskoen tar hele justeringen.
  Hver hesteskostreng blir 2 · 34,7 cm kortere, og det udekkede feltet ved bakkanten blir større (54,1 cm).
- Antall strenger og CC er de samme i begge valg (Regel 7). Bare lengdene endres.
- Bryteren står i kabelpanelet rett over «Avstand sider»: **Lik avstand / Fyll toppflaten**. I valg 2 står
  hjelpeteksten under, og i tillegg en linje «Toppflate 2 cm · hestesko 54.1 cm».

### Hvilken trapp

Skjermbildet passer ikke med inntrinn 46. Det passer nøyaktig med VK Hovedterrasse med **inntrinn 31**:
toppflate 470 × 70, opptrinn og nese 2, maks CC 10, gulv 2 og 1 × 60 m. Det gir 8 × 431,2 og 4 × 579,2–687,2 ved
19,4. Med 46 cm blir det 6 hesteskostrenger, ikke 4. Jeg har brukt 31 cm i testen (SPØRSMÅL 1).

## STEG 0

### 0.1 Hvor sidemarginen per flate bestemmes

- `generateStairCable` leser marginen per flate fra `_stairSurfSettings(stair, si).edgeMargin_cm`
  (`surfMargin`). For hestesko er strengen `fullLen − 2 · surfMargin` langs U-linja.
- `_stairSurfSettings` gir i dag `stair.edgeMargin_cm` til alle flater. Bare soner overstyrer den, og
  hesteskotrapper har ingen soner.
- Alle visninger leser rutingen eller `_stairSurfSettings`:
  - Måltabellen (`_stairHsTableRows` → `_stairHsSurfDims`) leser `stair.runs`.
  - «(sider)» ved bakkanten leser `_stairSurfSettings` for den ytterste flaten.
  - PDF-planen bruker samme tegner (`_stairHsPaint`).
  - PDF-tekstlinja «Avstand sider» leste `stair.edgeMargin_cm`.
- **Toppflatens faste margin settes derfor inn i `_stairSurfSettings`** (én krok): `surf.hsTop` og valg 2 gir
  margin = gulvet. Motoren, tabellen, tegningen og PDF-planen følger med uten egne endringer (Regel 9). PDF-tekstlinja
  fikk en egen gren, fordi den ikke er per flate.

### 0.2 Hvordan Forslag og manuelt sett løser marginen i dag

- Begge går gjennom `_stairMarginProbe`:
  - Den legger kabelen ved gulvet og teller `totalStrands = alle strenger`.
  - `solve(sum) = gulv + (behov − sum) / (2 · totalStrands)`.
  - Takene `maxMargin75` og `maxSaneMargin` kommer fra den smaleste flaten.
- Forslag: `_stairSolveExactCableSet`. Manuelt sett: `_stairFitFixedSet`. Låst: `_stairFitLockedMargin` og
  `_stairSolveLockedCableSet`. De tre siste legger kabelen med `generateStairCable({ ...stair, edgeMargin_cm: m })`.
- **Dette måtte endres for at bare hesteskoen skal variere:**
  1. `totalStrands` teller bare hesteskostrengene. Toppflatens strenger endrer seg ikke med m.
  2. Takene regnes bare over hesteskoflatene, og i tillegg kommer armen (se under).
  3. `maxSaneMargin` (gulv + 15) gjelder ikke i valg 2. Hesteskoens margin er ment å ligge langt over gulvet.
  4. Kallene til `generateStairCable` trenger ingen endring, fordi kroken i `_stairSurfSettings` holder toppflaten på
     gulvet uansett hvilken m som sendes inn. Ett unntak: `_regenerateStairCable` satte `edgeMarginMin_cm = låst`
     for låst avstand, og da ville toppflaten fått den låste verdien. I valg 2 settes den ikke lenger.

## Motoren

- `stair.horseshoe.marginMode = 'equal' | 'fillTop'`. Mangler feltet, gjelder `'equal'`.
- `_stairHsFillTop(stair)` sier om valg 2 gjelder. `_stairHsTopFillCm(stair)` gir toppflatens margin: gulvet
  `edgeMarginMin_cm`, **uten** låsen.
- **Tak for hesteskoen** (`_stairHsArmCapCm`): den korteste armen til den innerste strengen, fra bakkant til hjørne,
  som er `Di + opptrinnsavstand`. VK: 70 + 2 = **72**. Taket er minste av 12,5 % av hesteskoens indre kontur (76,25)
  og armen. Forslag velger aldri et sett over taket, og et manuelt sett over taket får «for korte».
- **Låst avstand i valg 2:** den låste verdien gjelder hesteskoen, og toppflaten bruker gulvet. Låst 10 gir
  toppflate 2 og hestesko 10. Med hengelåsen på skriver feltet nå bare den låste verdien i valg 2, ikke gulvet.
  Ellers ville toppflaten fulgt med til 10 (SPØRSMÅL 3).
- **Bytte med valgt forslag:** marginen løses på nytt for samme kabelsett (`_stairFitFixedSet`, samme formel som
  Forslag). 60 m: 19,4 → 54,1 → 19,4, og forslaget er beholdt. Går settet ikke opp i det nye valget, blir det et
  manuelt sett, og panelet viser grunnen rødt. Forslagskortene som var regnet for det andre valget, nullstilles.
- **Hesteskobyggeren** («Rediger hesteskotrapp» → Lagre) beholder valget.
- **PDF-tekstlinja** i valg 2: «Avstand sider: toppflate 2 cm, hestesko 54.1 cm». Målt i hel `exportPDF` (6 sider).

### Et sett som ikke går opp (test 4)

1 × 55 m på VK 31:
- Valg 1: går opp med 40,2 cm.
- Valg 2: hesteskoen måtte fått 116,6 cm, som er forbi armen på 72 cm.

Panelet viser rødt:

> «Kablene er 3.6 m for korte — hesteskoen måtte fått 116.6 cm avstand fra sidene, og strengene ville gått forbi
> hjørnet (armen er 72 cm).»

Utlegget ligger da på gulvet, som for et manuelt sett som ikke går opp i dag. Ingen streng går forbi hjørnet. To løp er
udekket og vist stiplet rødt, og statusen er «3,6 m for korte».

**Merk:** du skrev «for lang» i prompten. Når hesteskoen må trekkes forbi armen, er kabelen for **kort**: større
margin gir kortere strenger. Meldingen sier derfor «for korte», som i dag (SPØRSMÅL 2).

## Test

`_stairHorseshoeRegressionTest`: **117 → 144, alle grønne.** De 117 gamle sjekkene gir samme verdier.

Nye `184.*`:
1. Valg 1, `'equal'` = uten felt (ruting, kabel og tabell) for VK 31, VK 46, fire trinn og ulik dybde. VK 31 i valg 1
   gir skjermbildets tall: 19,4 · 431,2 · 579,2–687,2.
2. Valg 2:
   - toppflaten har 8 × 466 med start 2
   - hesteskoen har 54,1 (> 19,4), fire strenger og «Passer»
   - måltabellen viser «2 / 54.1», og toppflatens kant → sving er 2 på begge sider
   - «(sider)» viser 54,1
   - Forslag gir 1 × 60 @ 54,1
3. Fram og tilbake gir samme ruting, både med manuelt sett og med valgt forslag. Byggeren beholder valget.
4. 55 m: «for korte … forbi hjørnet», marginen på gulvet, udekket stiplet, rød status. Ingen forslag over armen (72).
5. Låst 10 gir «2 / 10», både satt direkte og via hengelås + tast 10 i panelet (gulvet står på 2). Fire trinn med ulik
   dybde og toppflate i plan i valg 2: toppflate 2, alle hesteskotrinn samme løste margin, går opp.

**Mot HEAD** (`cmp183.js`, 22 hesteskotrapper med fire trinn, ulik dybde og «i plan»):
- flater og ruting før og etter forslag A
- forslag
- PDF-plan og -side (piksler)
- mål og grenser, måltabell, sone-blokker, produktrader, lengdeoppdeling, detaljutsnitt
- skjermpiksler, byggerens oppsummering og ny lagring

Alt er **identisk** (0 avvik), og det gjelder også de gamle hestesko-sjekkene.

**Gamle trapptester**, verdi for verdi identiske mot HEAD: `_stairRegressionTest`, `_stairManualSetRegressionTest`,
`_stairZoneRegressionTest102`, `_stairBuilderMoveRegressionTest110`, `_stairSideRegressionTest`. Hel `exportPDF`
er lik.

(To kjøringer i parallell ga ulik skjermhash fordi fanene tegnet samtidig. Kjørt én og én er hashene like.)

## Bilder (`docs/184/`)

- `1-valg1-lik-avstand-skjerm.png`: valg 1, plan, måltabell (19.4 / 19.4) og panel med bryteren.
- `2-valg1-lik-avstand-pdf-plan.png`: valg 1, PDF-planen med måltabell.
- `3-valg2-fyll-toppflaten-skjerm.png`: valg 2, toppflaten ut til 2 og hesteskoen 54,1, med tabellen «2 / 54.1»,
  «Passer» og hjelpeteksten.
- `4-valg2-fyll-toppflaten-pdf-plan.png`: valg 2, PDF-planen.
- `5-valg2-55m-for-kort-skjerm.png`: test 4, rød melding, udekket stiplet.
- `6-valg2-laast-10-skjerm.png`: låst 10 i valg 2, tabellen «2 / 10».

## Endringslogg

- **Nye funksjoner:** `_stairHsFillTop`, `_stairHsTopFillCm`, `_stairAdjSurfaces`, `_stairHsArmCapCm` (ved
  `_stairSurfSpanCm`), samt `_setStairHsMarginMode` og `_stairResolveMarginForSet` (ved `_setStairEdgeMarginLock`).
- **`_stairSurfSettings`:** toppflaten i valg 2 får `edgeMargin_cm = edgeMarginFloor_cm = gulvet` og `topFill: true`.
- **`_stairMarginProbe`:** teller strenger og regner tak over hesteskoflatene i valg 2. Nytt tak er armen. Den gir
  også ut `armCap` og `fillTop`, og +15-taket gjelder ikke i valg 2. Valg 1 får samme tall som før (taket er
  `Math.min(…, Infinity)`).
- **`_stairFitFixedSet`:** egen tekst når det er hjørnet og ikke 75 % som stopper.
- **`_stairFitLockedMargin`, `_stairSolveLockedCableSet`:** varmet bredde regnes over hesteskoflatene i valg 2.
- **`_regenerateStairCable`:** låst avstand overstyrer ikke gulvet i valg 2.
- **`_setStairEdgeMargin`:** med hengelås i valg 2 skrives bare den låste verdien, ikke gulvet.
- **`_confirmHsBuilder`:** beholder `marginMode`.
- **Kabelpanelet:** bryteren og hjelpeteksten, bare for hesteskotrapper.
- **PDF:** tekstlinja «Avstand sider» viser begge marginene i valg 2.
- **STATUS.md:** oppdatert. Det var ingen ucommittet STATUS-endring fra 183 (`git status` var ren).

Spørsmålene står i `docs/184/SPØRSMÅL.md`.
