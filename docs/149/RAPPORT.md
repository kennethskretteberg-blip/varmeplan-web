# 149 · Frihånds-matte: bare dekket del av en bane er opptatt gulv

Kenneth 27.10.2026: den udekkede delen av en bane («ghost», tegnet lengre enn nærmeste katalogrull) hindret andre matter.

## STEG 0 (målt på 7515620)

**Gjenskapt** (rom 1000×600, rull 6 m, bane A tegnet 8 m ved x 60–860 → dekket 60–660, udekket 660–860; ny matte 1 m ved x 700):

| | Før | Etter |
|---|---|---|
| Liten matte i udekket felt (x 700–800) | `{ok:false, reason:'overlapper en annen matte'}` | `{ok:true}` |
| Matte over dekket del (x 500–600) | avvist | avvist (uendret) |

Meldingen «overlapper en annen matte» kommer fra `_matPathOverlapsOthers` via `_matPathMoveValid`. Den treffer ved Avslutt matte (`_matFreeExitInner` → toast «Frihånd avbrutt: …»), ved klikk utenfor rommet (`_chk`), ved flytting (`_matDragInvalid`, rød ramme + toast ved slipp) og i arrangement-dra-slipp (toast «Flyttet, men: …»).

**Hvem regnet hele den tegnede banen som opptatt:**

| Sted | Før | Hva det stoppet | Nå |
|---|---|---|---|
| `_matPathOverlapsOthers` (denne + andre baner) | hele | commit, flytting, arrangement-sjekk | dekket mot dekket |
| `_matPathLaneRects` | hele | `_matPriorMatsFor` (sone/auto/kapittel-planlegging, mattebenk), commit-vakt mot S.mats (`_matCommitPieces`) | dekket |
| `_matFreeLanesOverlap` (selv-overlapp) | hele | live-kandidat + commit | **uendret** (bevisst) |
| `_matFreeExistingEdges` (snapp-kanter for ny bane) | hele | kun snapp, stopper ingenting | uendret |
| `_matPathRunIssue` / rødmerking 124/135 | veggmargin/utenfor/hindring, ingen overlapp | — | uendret; en bane rødmerkes aldri på grunn av overlapp |
| `_matRunPlacementIssue` (S.mats) | ingen sjekk mot baner | — | uendret |

**Tegning:** den udekkede delen ble tegnet inne i `_drawMatPathObj` (stiplet grå, 10 % fyll), altså **oppå** S.mats og baner som ble tegnet før. Plan og PDF bruker samme render-vei.

## Endringer (`index.html`)

- `_matFreeCovLen(coverCm, acc, rl)`: én akkumulering, brukt av `_drawMatPathObj`, `_drawMatPathCable`, `_matPathCoveredLaneRects` og det nye udekket-passet.
- `_matPathCoveredLaneRects(mp)`: bredderektangler for kun den dekkede delen (kutt ved `_matFreeCatalog(mp).coverCm`). Dekker katalogen alt → rektanglene er de samme som før (bit-identisk).
- `_matPathOverlapsOthers` og `_matPathLaneRects` bruker den.
- `_drawMatPathUncovered()` kjøres rett før `drawMats()` i render → ghosten ligger under alle matter. Rødmerkede bredder tegnes fortsatt hele i rødt av `_drawMatPathObj`.

## Test

- `_matFreeRegressionTest` 44 → **57** (13 nye: dekket/udekket, Kenneths tilfelle, dekket del avvist, udekket over annen matte lov, `_matPriorMatsFor`, `_matPathLaneRects`, commit i udekket felt, bit-identisk uten udekket del, tegning (udekket ikke i `_drawMatPathObj`, ett rektangel i eget pass), **vaksine**: hele banen som opptatt gir avvist igjen).
- `_matPathClickRegressionTest` 28/28, `_matChapterRegressionTest` 25/25, `_matCrossFillRegressionTest` 32/32, `_matArrangementRegressionTest` 65/65, `_matRunAdjustRegressionTest` 70/70, `_pdfExportSmokeTest` 25/25. Identisk med baseline 7515620 for alle utenom den utvidede.
- **Mattebenk** (`_matBench(42,64)`): 224 rader, JSON byte-identisk før/etter (ingen rad lavere). Samme 12 kjente `autoFillMatSerpentine`-feillogger før og etter.

## Skjermbilder

`/tmp/cdp149/before.png`, `after.png` (+ `-zoom`): lite visuell forskjell, siden ghosten bare har 10 % fyll og stiplet kant. Forskjellen er at den stiplede grå kanten ikke lenger tegnes over den lille matta. Rekkefølgen er målt i testen, ikke bare sett.

## Avvik fra oppgaven

Punkt 3 («aktiv bane sjekkes med tegnede bredder»): det finnes ingen live-sjekk av den aktive banen mot andre baner (`_matFreeCandidate` sjekker bare selv-overlapp). Den eneste for-commit-sjekken (klikk utenfor rommet) bruker `_matPathMoveValid`, som nå regner dekket del også for den ferske banen (katalogen kan regnes for en bane som ikke er committet). Hadde vi brukt tegnet lengde der, ville klikk utenfor avvist en bane som Avslutt matte godtar. Se spørsmål 1.
