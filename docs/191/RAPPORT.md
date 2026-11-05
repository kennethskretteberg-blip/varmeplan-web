# 191 · Trapp: ett opptrinn mellom et repos og et trinn (Regel 24)

Committet på `main`, **ikke pushet**. Bygger på 190 (`6a6eef1`).

## Kort fortalt

- Før: et repos hadde **ikke** noe opptrinn over seg. Trinnet over et repos lå i samme høyde som reposet. Et repos
  nederst svevde 17 cm over bakken, og trinn 1 lå i flukt med det (se `1-repos-nederst-6-*-for.png`).
- Nå: mellom to flater er det alltid nøyaktig ett opptrinn. Et repos nederst ligger på bakken, og trinn 1 står ett
  opptrinn over det. Et repos øverst har ikke noe opptrinn over seg.
- Én felles hjelper, `_stairRiserBetweenCm(stair, lower, upper)`, brukes nå av tegningen (skjerm, PDF, mål,
  grenser og snapping), av kabelen og av byggeren. Kabel og tegning kan ikke lenger være uenige.
- Rette trapper uten repos og alle hesteskotrapper er **bit-identiske med HEAD**. Det gjelder kabel, mål, grenser,
  PDF-bilder, skjermbilder og forslag (målt med hash, se tabellen).
- Ingen forslag endret seg på noen testtrapp. Kabelbehovet endret seg bare når trinnet over reposet har en annen
  høyde enn trappas standard: +1 cm (18 over) og +2 cm (19 over).

## STEG 0, målt i HEAD (`6a6eef1`)

Målt med `/tmp/cdp191/m0.js` på HEAD (port 4191) og ny kode (port 4000). Alle trinn er 17 cm og 30 cm dype, og
repos er 90 cm dype, med mindre noe annet står.

1. **Bekreftet.** `_stairSideRiserCm` ga 0 for et repos (`if (surf.type === 'landing') return 0`). Byggerens
   `_stairBuilderStats` og `_stairBuilderPreviewSVG` la bare til `stepCount × stepHeight` og 0 for repos.
   Kabelen (`generateStairCable`) brukte `lowerSurf.stepHeight_cm || stair.step_height_cm || 17`. Et repos har
   ingen `stepHeight_cm`, så ved repos → trinn ble trappas standardhøyde brukt. Funn: det samme gjaldt i
   lengdeestimatet (`totalLen += surf.stepHeight_cm || …`, ca. linje 53 767). Det følger nå også hjelperen.
2. **4 trinn + repos + 4 trinn, før endringen:**
   - opptrinn per flate i tegningen: `17,17,17,17,0,17,17,17,17` (+ 17 fra bakken)
   - høydekjeden: `9 × 17 = 153`, og 10 flater gir altså 9 opptrinn
   - reposet og trinn 5 lå i samme høyde, som en lang flate på 90 + 30 cm (`2-4-repos-4-skjerm-side-for.png`)
   - kabelens opptrinn mellom flater: `17 × 8`. Kabelen telte altså opptrinnet repos → trinn 5, men tegningen
     gjorde det ikke.
   - med 18 cm over reposet: kabelen brukte 17 (trappas standard), tegningen 0
3. **Repos nederst i dag:** reposet ble tegnet **17 cm over bakken** (profilen lukkes ved `totalH + 17`), uten
   høydemål for den biten. Trinn 1 lå i flukt med reposet. Høydekjeden viste `6 × 17 = 102`, men grensene var
   119 høye. Svaret på spørsmålet i prompten er altså **ja**: koden la et opptrinn fra bakken opp til et repos
   nederst, uten mål og med trappas standardhøyde. Nå ligger reposet på bakken (se SPØRSMÅL 1).
   **Repos øverst i dag:** ingen opptrinn over det. Det var riktig fra før og er uendret.

## Regelen slik den er kodet (`_stairRiserBetweenCm`)

| Mellom | Opptrinn |
|---|---|
| bakken → trinn | trinnets høyde (som før) |
| bakken → repos | **0**: reposet ligger på bakken (før: 17, og reposet svevde) |
| trinn → trinn | trinnet under (som før; hver flate «eier» opptrinnet over seg) |
| trinn → repos | trinnet under (som før) |
| repos → trinn | **nabotrinnet, altså trinnet over** (før: 0 i tegningen, trappas standard i kabelen) |
| repos → repos | trappas standardhøyde (før: 0 i tegningen) |
| trinn → etasjen over | trinnets høyde (178: «8 trinn tegnes med 9 opptrinn», uendret) |
| repos øverst → over | 0 (uendret) |
| hesteskotopp i plan → over | 0 (178, uendret) |

## Endringer

- `_stairRiserBetweenCm(stair, lower, upper)` er ny, med `null` = bakken eller etasjen over.
  `_stairSideRiserCm(stair, surfs, i)` tar nå hele lista og en indeks, og `_stairGroundRiserCm(stair, surfs)` er
  ny.
- Følgende fem steder bruker nå hjelperen, og repos-unntakene i løkkene er fjernet:
  - `_drawStairSide`
  - `_stairDrawSideToCanvas` (PDF)
  - `_stairGeometryDims('side')` (høydekjeden, som nå viser opptrinnet over reposet)
  - `_stairSideBounds`
  - snappingen
- Kabelen: `connLen` i `generateStairCable` og lengdeestimatet kaller `_stairRiserBetweenCm`.
- Byggeren: `_stairBuilderLandingRiserCm` legger til opptrinnet under et repos som ikke ligger nederst, i
  statistikken og i forhåndsvisningen. Byggeren teller fortsatt «ett opptrinn under hvert trinn». Høyden der er
  høyden opp til øverste flate, slik som før.
- Ny test: `_stairReposRiserRegressionTest191()` med 15 sjekker (prompttest 1–4 og repos → repos).

## Prompttestene

| # | Trapp | Resultat |
|---|---|---|
| 1 | repos nederst + 6 × 17 | Det er ikke noe opptrinn fra bakken, og trinn 1 står 17 over reposet. Byggeren viser **102**, som er høyden til øverste trinn. Høydekjeden i sidevisningen viser **7 × 17 = 119**, fordi den har med opptrinnet fra trinn 6 til etasjen over (178/183). ✔ (se SPØRSMÅL 2) |
| 2 | 4 + repos + 4 (17) | Det er et opptrinn opp til reposet og et fra reposet. Kabelen har 8 opptrinn mellom flatene, alle 17. Byggeren viser **153 = 9 × 17**, mens høydekjeden viser **10 × 17 = 170** fordi opptrinnet til etasjen over er med. ✔ (se SPØRSMÅL 2) |
| 3 | 4 × 17 + repos + 4 × 18 | Opptrinnet fra reposet er **18 i tegningen og 18 i kabelen** (før: 0 og 17). ✔ |
| 4 | 6 + repos øverst | Det er ikke noe opptrinn over reposet. Tegningen er identisk med HEAD, og byggeren viser 102 → 119, som nå stemmer med tegningen. ✔ |
| 5 | rette uten repos, alle hestesko | Alt er bit-identisk med HEAD (tabellen under). ✔ |
| 6 | gamle trapptester | Alle seks gamle trappetester er grønne uten endrede forventninger: 274 + 45 + 42 + 106 + 59 + 25. Ingen av dem låste høyden ved repos. ✔ |

## Testtrapper HEAD → 191 (`/tmp/cdp191/cmp191.js`)

Disse hashes: kabel (runs, connections og total), mål, grenser, PDF-side, PDF-plan, skjerm i side- og
«begge»-visning, og forslag.

| Trapp | Høyde (kjede) | Kabelbehov | Forslag |
|---|---|---|---|
| Rett 8 trinn, topp-start, byggeretning topp, 4×17 + 4×18, bred 240, to kabler 14, 100 × 13 | identisk | identisk | identisk |
| Alle 11 hesteskotrapper (VK 31, i plan, ulik dybde, BRED 700 …) | identisk | identisk | identisk |
| R + 6 trinn | 6 × 17 = 102 → **7 × 17 = 119** (grensene var 119 fra før) | 30,99 m, uendret | uendret |
| 4 + R + 4 (også topp-start og byggeretning topp) | 153 → **170** | 38,64 m, uendret | uendret |
| 4 + R + 4, 18 over | 157 → **175** | 50,17 → **50,18 m** | uendret |
| 4 + R + 6, 19 over | 199 → **218** | 47,26 → **47,28 m** | uendret |
| 4 + R + R + 4 | 153 → **187** | 47,01 m, uendret | uendret |
| 6 + R (øverst), soner 4 + R, trinn 240 + repos 100 (3, 24) | identisk | identisk | identisk |

Kabelbehovet endrer seg ikke ved 17 over reposet, fordi kabelen allerede telte opptrinnet med trappas standard
(17). Det er bare tegningen og høyden som var feil der.

## Bilder (`docs/191/`)

For hver trapp finnes `*-skjerm-side-{for,etter}.png`, `*-pdf-side-{for,etter}.png` og
`*-bygger-{for,etter}.png`:

1. `1-repos-nederst-6`: før svevde reposet 17 cm og trinn 1 lå i flukt med det. Etter ligger reposet på bakken, og
   trinn 1 står 17 over det.
2. `2-4-repos-4`: før gikk det én lang flate over repos og trinn 5. Etter er det et opptrinn fra reposet.
3. `3-4-repos-4x18`: etter er opptrinnet fra reposet 18, og kjeden viser `5 × 18 = 90`.
4. `4-6-repos-overst`: tegningen er uendret, og byggerens forhåndsvisning har nå et opptrinn opp til reposet.

Harness: `/tmp/cdp191` (`runf.mjs`, `m0.js`, `b0.js`, `cmp191.js`, `tests.js`, `shots191.mjs`). HEAD kjører
fra `/tmp/old191` på port 4191.
