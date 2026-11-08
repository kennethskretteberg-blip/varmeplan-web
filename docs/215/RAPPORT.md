# 215 · Tak: snøfanger som grense, og varmet felt mellom takkant og snøfanger — rapport

08.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.

## Kort

- **«+ Snøfanger»** står i panelet og i verktøylinja i steg 3, ved siden av «+ Rennestrekk» og «+ Gradrenne». Den legges på en takfot med ett klikk (hele kanten) eller to (fra–til).
- **Snøfangeren får ingen kabel og ingen løp.** Den tegnes som en linje parallelt med takfoten, med etiketten «snøfanger 0,50 m». Standardavstanden er merket «Kenneths regel 08.11.2026, ikke fra datablad», og kan rettes.
- **Feltet er valgfritt.** «Varm feltet mot takkanten» gjør stripen til et felt med W/m² og kabel fra katalogen. Appen foreslår ingen W/m² (T1). Panelet viser regnestykket i klartekst.
- **Samme motor som 212.** `_takFlatCalc` er brukt uendret. Det finnes ingen ny formel.
- **Renna er urørt.** Snøfanger og felt på samme kant endrer ikke rennas rader, nedløpene eller tilbehøret. Feltet har sin egen sum.
- **Tester.** Ny `_takRegressionTest215` 65/65. De 81 andre gir samme resultat som på HEAD. Sju av dem er røde uten innlogging, også på HEAD (se under).

## Regnestykket, begge veier

Målt i appen med InSnow 30T (30 W/m fra katalogen) og 300 W/m²:

| Felt | c/c | Løp | Vei 1: b × L × W/m² ÷ W/m | Vei 2: løp × L = areal ÷ c/c |
|---|---|---|---|---|
| 12 m × 0,50 m = 6,0 m² | 30 ÷ 300 = 0,10 m | 0,50 ÷ 0,10 = 5 | 12 × 0,5 × 300 ÷ 30 = **60,00 m** | 5 × 12 = 6,0 ÷ 0,10 = **60,00 m** |
| 12 m × 0,80 m = 9,6 m² | 0,10 m | 0,80 ÷ 0,10 = 8 | 12 × 0,8 × 300 ÷ 30 = **96,00 m** | 8 × 12 = 9,6 ÷ 0,10 = **96,00 m** |

Panelet viser: «30 W/m ÷ 300 W/m² = c/c 10 cm · 5 løp over 50 cm · 60,00 m».

## STEG 0 — hva som fantes

| Antakelse i prompten | Målt | Følge |
|---|---|---|
| Motoren fra 212 kan brukes på et felt langs en kant | **Stemmer.** `_takFlatCalc(kabel, W/m², areal, bredde)` er en ren funksjon og vet ikke om polygoner | Kalles med areal = lengde × avstand, bredde = avstand |
| `SNOW_GUARD` står i §6.3, men ikke i koden | **Stemmer** | Bygd, i `t.features` som de andre skråtaksobjektene |
| Rennestrekket legges på en takfot | **Stemmer.** Verktøyet `gutter` med `_takHitGutterEdge` | Samme kant-verktøy, `kind: 'guard'` |
| Kabelvalget fra 212 kan gjenbrukes | **Delvis.** Det ligger i `t.flat`, og et skråtak skal aldri ha `flat` (212-testen krever det) | Egen `t.guard_cable`, samme velger og samme oppslag i katalogen |
| Id-er | `s1` er opptatt av startpunktet (`CABLE_START`) | Snøfanger heter `sf<n>` |
| Hvilken side er «inn på taket» | `_takOutward` bruker omrissets midtpunkt, som bommer på innoverbøyde kanter i L/T-form | Egen `_takGuardInward` som spør omrisset. Målt på alle åtte kanter i en T-form |

## Slik er det bygd

- **Lagring.** `SNOW_GUARD` ligger på takfoten (`geometry.pts`, `on_edge`), som rennestrekket. Linja på taket regnes ut ved tegning (`_takGuardLine`) og lagres ikke.
- **Plan og tak.** `offset_m` er avstanden langs taket, og det er den som regnes. Tegningen er i plan: avstand × cos(takvinkel) når vinkelen er kjent (`_takPitch`), ellers avstanden (spm. 1). 0,50 m på 30° = 43,3 cm i plan, kabelmeterne er de samme.
- **Summen.** `_takCableRows` og `_takCableSummary` er ikke endret og ser aldri snøfangeren. `_takGuardSummary` gir feltets sum, med «≥» når et felt mangler W/m² eller kabel (spm. 4).
- **Etikettene** står innenfor linja, altså på motsatt side av kanten fra rennas. De tegnes til slutt, og flytter seg sidelengs bort fra bokser og nedløp på samme kant.
- **Trukket ut for gjenbruk, uten endret oppførsel:** `_takEdgeOverlap`, `_takCableResolve`, `_takCableSnapshot`, `_takCableSelectHtml`, `_takFlatCalcHtml`.

## Tester

`_takRegressionTest215` 65/65, mot punktene i prompten:

| Punkt | Resultat |
|---|---|
| 12 m takfot, 0,50 m: 6,0 m², c/c 0,10, 5 løp, 60,00 m, begge veier | grønn |
| 0,80 m: 8 løp, 96,00 m | grønn |
| Uten varmet felt: 0 kabelmeter, objektet er i lista | grønn |
| W/m² tomt: «flateeffekt ikke satt», ingen kabelmeter | grønn |
| Renne og snøfanger på samme kant: begge 25 m, etikettene dekker ikke hverandre (tre zoomnivåer, tre nedløp, én boks) | grønn |
| Rennas og nedløpenes tall mot 213: 110,15 m, rader, tilbehør og renneobjekter bit for bit like, med og uten felt | grønn |
| Prosjekt uten snøfanger: `_takRecalc` endrer ingenting, ingen nye felt | grønn |
| I tillegg: klikk i lerretet, L/T-form, takvinkel, overlapp, annen kanttype, flatt tak, lagring, angre, readOnly, stegene | grønn |

**Hele regresjonssettet** (`docs/215/probe/alle.mjs`, HEAD-kopi mot arbeidskopi): 81 av 81 eksisterende tester gir samme resultat som på HEAD.

⚠ Prompten ber om at alle eksisterende tester er grønne. Sju er røde, og de er røde også på HEAD, fordi testkjøringen ikke er innlogget (samme liste som i 198):
`_prosjektlaasRegressionTest` 66/67, `_kundeforslagRegressionTest` 270/271, og `_geoTile194`, `_geoScale`, `_geoCenter`, `_geoOneStep`, `_geoAddr`, som kaster når de kjøres alene.

## Ikke testet

- Snøfanger i PDF. Prompten ba ikke om det (spm. 13).
- I ekte, innlogget økt. Alt er kjørt i headless Chrome med katalogen lastet, uten innlogging.
- Etiketten mot takvindu og løse hindringer (spm. 12).

## Bilder

- `uten-varmet-felt.png` — snøfanger uten felt, panelet i steg 3
- `med-varmet-felt.png` — feltet med fem løp, panelet i steg 4
- `felt-uten-flateeffekt.png` — feltet på, W/m² tomt
- `med-renne-samme-kant.png`, `naerbilde-etiketter.png` — renne, nedløp, boks og snøfanger på samme kant
- `verktoy-forhandsvisning.png` — verktøyet før klikket
- `hel-skjerm-steg3.png` — verktøylinja i steg 3, én rad (58 px, samme høyde som på HEAD)

## Prøv selv

1. Lag et tak med skråtak og takfot. I steg 3, trykk «+ Snøfanger» og klikk en takfot.
2. Trykk «Varm feltet mot takkanten», og gå til steg 4.
3. Velg kabel, skriv 300 W/m². Sjekk regnestykket, og at linja «Kabelmeter» for renna ikke endrer seg.

14 spørsmål i `SPØRSMÅL.md`. Viktigst: 1 (langs taket eller i plan) og 2 (valmtak).
