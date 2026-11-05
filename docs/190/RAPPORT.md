# 190 · Trapp: Forslag A gir aldri for mye kabel (maks 0,5 m til overs), Bla per sone og bedre tekster

`main`, ikke pushet. Commit «190: …». Alt ligger i `index.html`. Svarene dine står under hvert spørsmål i
`docs/189/SPØRSMÅL.md`.

Harness: headless Chrome på port 9333 (`/tmp/cdp190`). Ny kode på 4000, HEAD (`d22f80f`) på 4189 fra `git archive` i
`/tmp/old189`. Katalogen er den syntetiske fra 176–189 (InSnow 30T: 20, 30, 40,1, 49,7, 55, 60, 70, 78,7, 89,1, 98 m).
Ingen skyprosjekter er rørt.

## Kort svar

| Ønske | Nå |
|---|---|
| **Høyst 0,5 m til overs = «Passer»** | Overskudd måles i meter, ikke prosent. Til og med 0,5 m: «Passer» (grønt) i panelet, i Forslag og i Bla. Over 0,5 m: «X.X m til overs», gult. Rødt fra 5 % som før. «For kort» er uendret. |
| **Forslag A går alltid opp** | Et sett med mer enn 0,5 m til overs er aldri A. Det står som **«Alternativ (for lang)»** (oransje tittel, «X.X m til overs» stort). |
| **Ingenting går opp** | Ingen A, ingen «Anbefalt». Øverst: **«Ingen kabel går opp på denne trappa.»** Under: de beste for lange settene som alternativer, og «Bla i kabler» (bilde 2). |
| **Rekkefølgen** | Går opp og ≥ 75 % → går opp og < 75 % (gult merke) → for lange alternativer. |
| **Soner: Bla per sone** | Bla har en sonevelger (Sone 1, Sone 2 …) og starter på den valgte sonen. Behovet og tekstene er sonens. «Bruk denne kabelen» legger kabelen i den sonen, de andre sonene røres ikke (bilde 5a–5c). |
| **Ny melding for soner** | «Trappa er delt i soner, og hver sone får sin egen kabel. Velg sone og bla i kabler under, eller velg kabel per sone i panelet.» |
| **Ny geometrimelding** | «Ingen geometri å beregne kabel for.» er nå «Fant ingen trinn eller repos å legge kabel på. Sjekk trappas mål (bredde, trinndybde og avstand foran/bak) og maks CC.» |
| **«av reposet»** | Varselet sier «… % av reposet» når den smaleste flata er et repos, ellers «… av trinnet». Like brede = «trinnet» (bilde 6). |

## 1 · Testtrappene der A endret seg

«+X m» = til overs ved din kantavstand. «u75» = gult 75 %-merke. Alle andre testtrapper (rette fra 187–189 og alle 11
hestesko) har samme forslag og samme status som HEAD.

| Trapp | Før (HEAD) | Nå |
|---|---|---|
| **Smal 120 × 6, gulv 2** | A 20 m @ 20,5 u75 · B 30 m (+1,1 m) | A 20 m @ 20,5 u75 · **Alternativ (for lang)** 30 m (+1,1 m) (test 1, bilde 1) |
| **HS BRED 700 × 40** | **A 70 m (+1,5 m)**, gult · B 20 + 49,7 (+1,2 m) | **Ingen A.** Meldingen, alternativ 70 m (+1,5 m), alternativ 20 + 49,7 (+1,2 m), Bla (test 2, bilde 2) |
| **100 × 13, gulv 5** | A 40,1 m @ 13,9 u75 · B 49,7 m (+0,4 m) | **A 49,7 m @ 5 (+0,4 m), «Passer»**, 90 % varmet bredde (test 3, bilde 3) |
| **120 × 4, gulv 2** | A 20 m (+0,8 m), gult | **Ingen A.** Meldingen og alternativ 20 m (+0,8 m). Korteste kabel er lengre enn behovet (19,2 m) |
| Trinn 240 (1, d 24) → repos 100 | A 20 m @ 5 (+0,7 m), gult «66 cm til overs» | A 20 m @ 8,4 (dybdemargin 3, går opp), Alternativ 20 m @ 5 (+0,7 m) |
| 110 × 9, gulv 2 | A 30 m @ 15,7 u75 · B 20 + 20 (+0,2 m) | A 40,1 m @ 2 (+0,3 m), «Passer» |
| 160 × 8, gulv 5 | A 40,1 m @ 19,6 | A 49,7 m @ 5 (+0,2 m) |
| 80 × 10, gulv 5 | A 20 m @ 17,4 u75 · B 30 m (+0,1 m) | A 30 m @ 5 (+0,1 m) |
| 180 × 10, gulv 5 | A 60 m @ 17,4 · B 20 + 49,7 @ 5,2 | A 70 m @ 5 (+0,1 m) |
| HS VK 46 | A 78,7 @ 4,6 · B 70 @ 11,9 | A uendret · B 30 + 49,7 @ 2 (+0,3 m) |

**Hvorfor flere A-er endret seg:** når 0,5 m til overs går opp, finnes det ofte en kabel som passer på din egen
kantavstand. Den slår en kortere kabel som måtte trekke svingene langt inn (160 × 8: 49,7 m på 5 cm i stedet for
40,1 m på 19,6 cm). Dette følger av regelen. Se spørsmål 1.

**Bla (test 4):** 100 × 13 med 49,7 m: «Passer med 5.0 cm fra sidene, 0.4 m til overs», grønt (før: «38 cm til overs»,
grått). 120 × 4 med 20 m: «0.8 m til overs», gult (før: «81 cm til overs», grått) (bilde 4a, 4b).

**Soner (test 5):** Soner (4 trinn + repos), sone 2 valgt. Bla starter i sone 2 (behov 24,0 m) på 20 m: «4.0 m for kort
ved minste avstand (5.0 cm). Passer hvis svingene trekkes inn 21.7 cm fra sidene». «Bruk» → sone 2 får 20 m @ 21,7,
sone 1 står som før (30 m @ 13,2).

## 2 · Hva som er endret (med teskje)

- **Én regel for overskudd:** `_stairFitFromLengths` (den alle trappestatusene bruker). Til overs ≤ `STAIR_OVER_OK_CM`
  (50 cm) = ok/«Passer». Over det: gult, rødt over 5 %. Gjelder panelet, PDF-statusen, manuelt sett, soner og låst avstand.
  Bare trapp, rom og andre moduler bruker ikke denne funksjonen.
- **Løseren** (`_stairSolveExactCableSet`): et sett med høyst 0,5 m til overs ved gulvet regnes som et sett som går opp
  (marginen står på gulvet). Én-kabel-kandidaten tar lengste kabel ≤ behovet + 0,5 m. Like marginer og like mange
  kabler: det som går opp eksakt kommer foran det som har litt til overs. Når ingenting går opp, merkes svaret `noFit`.
- **Forslag** (`_generateStairProposals`): til slutt sjekkes at A går opp. Er første kort for langt og et annet sett går
  opp (i hvilken som helst dybdevariant), blir det A. For lange kort får `alternative`. Er alle for lange: `noFit`, ingen
  `recommended`.
- **Dialogen** (`_renderStairProposalPanel`): «Alternativ (for lang)» som tittel, meldingen øverst ved `noFit`.
  Et kort som går opp med litt til overs sier «Passer · 0.4 m til overs».
- **Bla**: «Passer …, 0.4 m til overs» (grønt) til og med 0,5 m, ellers «0.8 m til overs» (gult/rødt). Låst avstand
  bruker samme grense (før: 0,5 **cm**).
- **Bla per sone**: `_stairBrowseZoneBasis` gjør sonen til en egen liten trapp (`_stairZoneSubStair`, samme som
  soneløseren, med sonens låste avstand når den finnes). `_stairBrowseZone` bytter sone. «Bruk» går via
  `_setStairZoneProductIds`, samme vei som sonepanelet.
- **«av reposet»**: `_stairMinSurfInfo` finner den smaleste flata og om den er et repos. `_stairHeated75` får flata med.

## Endringslogg
- **Nye:** `STAIR_OVER_OK_CM = 50`, `_stairOverTxt`, `STAIR_NO_GEO_MSG`, `STAIR_ZONES_MSG`, `_stairMinSurfInfo`,
  `_stairBrowseZoneBasis`, `_stairBrowseTarget`, `_stairBrowseZone`.
- **`_stairFitFromLengths`**: til overs måles i meter (≤ 0,5 m = «Passer»).
- **`_renderStairSettingsPanel`**: det store gule overskuddet vises bare over 0,5 m.
- **`_stairHeated75` / `_stairUnder75Txt`**: `flate` («trinnet»/«reposet»). `_stairMarginProbe` svarer med `minSurfFlate`.
- **`_stairFitFixedSet`**: over-grenen svarer også med varmet bredde (75 %-merket på «Passer»).
- **`_stairSolveExactCableSet`**: ≤ 0,5 m til overs går opp, ny tiebreak, `noFit`.
- **`_generateStairProposals`**: A går alltid opp, `alternative`, `noFit`.
- **`_renderStairProposalPanel`**: «Alternativ (for lang)», `#stair-proposal-nofit`, sonemeldingen.
- **`_stairBrowseCableInfo` / `_stairBrowseInit` / `_stairBrowseHtml` / `_stairBrowseInnerHtml` / `_stairBrowseUse` /
  `_stairBrowseStep`**: 0,5 m-regelen og soner.

## Test

| | resultat |
|---|---|
| `_stairHorseshoeRegressionTest` | **274/274** (265 → 274) |
| `_stairRegressionTest` | 45/45, uendret |
| `_stairManualSetRegressionTest` | 42/42, uendret |
| `_stairZoneRegressionTest102` | **106/106** (én forventning endret) |
| `_stairBuilderMoveRegressionTest110` | 59/59, uendret |
| `_stairSideRegressionTest` | 25/25, uendret |

Endrede forventninger (merket «190» i koden):
- 102 C10: sone 3 med 49,7 m (behov 48,8 m) har 0,9 m til overs. Det er over 0,5 m, så merknaden er gul (før: dempet, ≤ 2 %).
- 187.2: BRED kort 2 (20 + 49,7, 1,2 m til overs) er gult (før: ok). Ny sjekk: ingen A, begge er alternativer.
- 189.3: varselet sier «av reposet» (reposet på 100 cm er smalest).
- 189.6: Soner har Bla med sonevelger og den nye meldingen (før: ingen Bla).

Ny seksjon 190 (8 sjekker): testene 1–6 fra oppgaven, regelen i `_stairFitFromLengths` (0,5 / 0,6 m / 6,7 % / for kort)
og den nye geometrimeldingen.

Ikke kjørt: hel `exportPDF`-smoke. PDF-en leser statusen fra `_stairCableSetFit`, altså den samme regelen.

## Bilder (`docs/190/`, «for» = HEAD, «etter» = ny kode)
1 · smal 120 × 6, Forslag · 2 · BRED 700 × 40, Forslag · 3 · 100 × 13, Forslag · 4a · 100 × 13, Bla på 49,7 m ·
4b · 120 × 4, Bla på 20 m · 5a · Soner, dialogen · 5b · Soner, Bla i sone 2 (bare etter) · 5c · panelet etter «Bruk» (bare
etter) · 6 · 240 (3) → repos 100, Forslag.
