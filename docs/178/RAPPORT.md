# 178 · Hesteskotrapp: toppflaten er et eget trinn (standard) eller i plan med øverste nivå

`main`, ikke pushet. Commit «178: …». Alt ligger i `index.html`. Bare hesteskotrapper er endret.

Harness: headless Chrome på port 9333 (`/tmp/cdp178`). Ny kode er servert på 4000, HEAD (`4737859`) via
`git show` på 4178. Katalogen er syntetisk (samme InSnow 30T-lengder som 176). Ingen skyprosjekter er rørt.

## Kort svar

- Hesteskobyggeren har fått valget **«Toppflate: Eget trinn / I plan med øverste nivå»** under inntrinnsfeltene,
  med hjelpetekst under knappene (se `bygger-below.png` og `bygger-flush.png`).
- Valget lagres som `stair.horseshoe.topLevel = 'below' | 'flush'`. **Mangler feltet, gjelder `'below'`.**
  Gamle trapper ser derfor nøyaktig ut som før. Det er målt mot HEAD og var likt piksel for piksel.
- **`'flush'`:** sidevisningen på skjermen og i PDF-en tegner ikke opptrinnet over toppflaten. Høydekjeden, grensene
  og snappingen følger med, så det blir ikke noe tomrom. Kabelen er **uendret**: 7 157 cm og samme ruting i begge
  valg.
- Ordet «terrasse» er tatt bort fra byggeren. Bakkant-teksten sier nå «mot det trappa fører til». Det eneste stedet
  ordet står igjen, er i hjelpeteksten du skrev selv: «Ett opptrinn opp til døra, reposet eller terrassen».

## ⚠ Ett tall stemmer ikke med prompten. Les dette først.

Prompten sier at VK Hovedterrasse med `'flush'` skal få høyden **1 × 17 = 17 cm**. Det får den i
**oppsummeringen** i byggeren, men **ikke i tegningen**. Tegningen viser **2 × 17 = 34**.

Grunnen er at oppsummeringen og tegningen var uenige med ett opptrinn allerede før 178:

| VK Hovedterrasse (1 hesteskotrinn + toppflate) | Tegningen (sidevisning) | Oppsummeringen i byggeren |
|---|---|---|
| Før 178 / `'below'` | **3 × 17 = 51** (bakken → trinn 2 → toppflaten → øverste nivå) | **høyde 34** (`(count + 1) × 17`) |
| `'flush'` | **2 × 17 = 34** (bakken → trinn 2 → toppflaten = øverste nivå) | **høyde 17** (`count × 17`, som prompten sier) |

Begge tallene faller med nøyaktig ett opptrinn, slik prompten ber om. Men tegningen har opptrinnet fra **bakken**
opp til det ytterste trinnet, og det har ikke oppsummeringen. Skulle tegningen også vise 17, måtte opptrinnet fra
bakken bort. Da ville trinn 2 ligge på bakken uten opptrinn, og det ba du ikke om.

**Jeg har latt begge regnemåtene stå som før og trukket fra ett opptrinn i hver.** Hva som er riktig «høyde», står
som spørsmål 1 i `docs/178/SPØRSMÅL.md`. Rettelsen er én linje uansett hva du svarer.

## STEG 0

### 0.1 Hvor det øverste opptrinnet tegnes og regnes

Profilen i sidevisningen regnes på fem steder med samme regnestykke. Hver trinnflate «eier» opptrinnet **rett over
seg**. Toppflaten er siste flate (`surfaces[last]`, `hsTop: true`), så det øverste opptrinnet er toppflatens eget
`stepHeight_cm`.

| Sted | Hva det gjør | Hvordan toppflatens opptrinn kom inn |
|---|---|---|
| `_drawStairSide` | profilen på skjermen | `totalH` summerte alle trinn, og etter toppflaten ble det lagt til et «riser bottom»-punkt |
| `_stairDrawSideToCanvas` | profilen i PDF-en | samme `totalH`, `coords[].stepH`, og punktet `yTop − stepH` for toppflaten |
| `_stairGeometryDims(stair, 'side')` | høydekjeden («3 × 17 = 51») | `riserItems` fikk ett ledd per trinn, også toppflaten |
| `_stairSideBounds` | grensene (`totalHeight + surfs[0].stepHeight_cm`) | `totalHeight` summerte alle trinn |
| snapping mot trappeprofilen (rundt `_drawStairSide`-kopien i snap-koden) | snappunkter i sidevisningen | samme profil |
| `_stairHsSummaryHtml` | byggerens oppsummering | `høyde (count + 1) × stepHeight` |

**Løsning:** én ny hjelper, `_stairSideRiserCm(stair, surf)`. Den gir opptrinnet sidevisningen skal tegne rett over
en flate:
- 0 for et repos (som før),
- **0 for toppflaten når `horseshoe.topLevel === 'flush'`**,
- ellers `surf.stepHeight_cm || stair.step_height_cm || 17`. Det er nøyaktig det gamle uttrykket.

Alle fem stedene bruker hjelperen. Der opptrinnet er 0, legges det ikke inn noe punkt og ikke noe ledd i
høydekjeden. Opptrinnet fra bakken (`firstStepH`) er ikke rørt. Rette trapper har aldri `hsTop`, så de går
nøyaktig samme vei som før.

### 0.2 Kabelen påvirkes ikke

- Kabelen regner opptrinn **bare mellom flatene** (Regel 5). I `generateStairCable` er det `lowerSurf.stepHeight_cm`
  for overgangen `si → nextSi`, og `lowerSurf` er den lavest indekserte av de to.
- I kabelestimatet er det `if (si < surfs.length - 1) totalLen += surf.stepHeight_cm`.
- Toppflaten er alltid den **siste** flaten. Den er derfor aldri «lowerSurf», og estimatet hopper over den. Ingen
  kabelkode leser opptrinnet over toppflaten.
- Hjelperen brukes bare i sidevisningen. Kabelkoden er ikke endret.
- **Målt:** kabellengde, strengposisjoner, strenglengder og forbindelser er identiske for «mangler», `'below'` og
  `'flush'`, både for VK Hovedterrasse og for fire hesteskotrinn.

## Endret

- `_stairHsTopFlush(stair)` og `_stairSideRiserCm(stair, surf)` står rett etter `_stairIsHorseshoe`.
- `_stairHsParams` gir `topLevel` (`'flush'` eller `'below'`). `STAIR_HS_DEFAULTS` er ikke endret, så et manglende
  felt betyr `'below'`.
- Følgende bruker hjelperen: `_drawStairSide`, `_stairDrawSideToCanvas`, `_stairGeometryDims('side')`,
  `_stairSideBounds` og snappingen.
- Byggeren:
  - `_stairHsB.topLevel` og `_stairHsBParams().topLevel` er nye.
  - Knappene heter `shs-top-below` / `shs-top-flush`, og hjelpeteksten er `STAIR_HS_TOPLEVEL_HELP`.
  - `_stairHsBTopLevel(v)` bytter valg og oppdaterer oppsummeringen live.
  - Når du lagrer, går valget inn i `stair.horseshoe`. Det er samme vei som de andre feltene, så angre virker.
- Oppsummeringen viser `count × stepHeight` ved `'flush'` (se ⚠ over).

## Test

`_stairHorseshoeRegressionTest` har gått fra **50 → 61**, alle grønne. Nye sjekker (`178: …`):

| Sjekk | Resultat |
|---|---|
| Mangler `topLevel` = `'below'` (mål, grenser, PDF-piksler) | identisk, 116 × 51 |
| `'below'`: høydekjeden 3 × 17 = 51 som før | ✓ |
| `'below'`: oppsummeringen sier høyde 34 som før | ✓ |
| `'flush'`: øverste opptrinn borte, høydekjeden 2 × 17 = 34 | ✓ |
| `'flush'`: sidegrensen er 17 cm lavere (116 × 51 → 116 × 34) | ✓ |
| `'flush'`: PDF-sidevisningen er endret | ✓ |
| `'flush'`: oppsummeringen sier høyde 1 × 17 = 17 | ✓ |
| `'flush'`: kabel og ruting identisk med `'below'` og «mangler» | ✓ |
| Fire hesteskotrinn `'flush'`: oppsummeringen sier 4 × 17 = 68 (`'below'`: 85) | ✓ |
| Fire hesteskotrinn `'flush'`: tegningen mister nøyaktig ett opptrinn (6 × 17 = 102 → 5 × 17 = 85) | ✓ |
| Fire hesteskotrinn `'flush'`: kabelen er identisk | ✓ |

**Mot HEAD** (samme skript kjørt på 4178 og 4000, `diff` på resultatet):
- VK Hovedterrasse uten `topLevel` (`viewMode: 'both'`): skjermpikslene, PDF-sidevisningen, PDF-planen,
  høydekjeden, grensene, oppsummeringen og kabelen (7 157 cm) er **identiske**.
- `_stairRegressionTest` 47, `_stairSideRegressionTest` 25, `_stairZoneRegressionTest102` 106,
  `_stairManualSetRegressionTest` 42 og `_stairBuilderMoveRegressionTest110` 59 er alle grønne, og resultatene er
  identiske. Rette trapper er ikke rørt.
- Den eneste forskjellen i `diff` er at hestesko-testen har gått fra 50 til 61 sjekker.

**Byggeren, testet for hånd i headless:** trappa åpnes i byggeren, du trykker «I plan med øverste nivå» og
«Lagre endringer». Da blir `topLevel` `'flush'`, sidegrensen går fra 116 × 51 til 116 × 34, og kabelen er uendret
(7 157). Angre gir 116 × 51, og «Eget trinn» er valgt igjen.

## Bilder (`docs/178/`)

- `skjerm-side-below.png` og `skjerm-side-flush.png` viser sidevisningen på lerretet. Ved `'below'` går profilen opp
  ett opptrinn over toppflaten. Ved `'flush'` er toppflaten øverst.
- `pdf-side-below.png` og `pdf-side-flush.png` viser sidevisningen i PDF-en med høydekjeden «3 × 17 = 51» og
  «2 × 17 = 34».
- `bygger-below.png` og `bygger-flush.png` viser valget i byggeren med hjelpeteksten og oppsummeringen.

## Svar skrevet inn

Svarene dine på spørsmål 3 og 5 står nå i `docs/176/SPØRSMÅL.md`.
