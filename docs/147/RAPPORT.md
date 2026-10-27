# 147 — Varmefolie: én effektformel (`_foilItemW`)

**Status:** ferdig, committet på `main`, ikke pushet. Bare `index.html` er endret (+ denne mappa og `STATUS.md`).

## Resultat i én linje
Kenneths rom viser nå **1411 / 294 / 353 / 412 W og 2470 W** i Spesifikasjon, Romoversikt, «Total effekt», romkort og
tegningsetikett, og **2469,6 W** i motstandsmålingen (samme sum, ikke avrundet). Før: 1394 / 291 / 350 / 409 = 2443 W.

## STEG 0.1 — alle steder som regnet folieeffekt (før)
| Sted (linje før endring) | Formel før | Vises i | Etter |
|---|---|---|---|
| `_foilPower` (5537) | `watt_per_lm × lengde`, fallback 60 W/m² | romkort (`_computeRoomStats`), romoverskrift, motstandsmåling | `_foilItemW` |
| `_roomProductRows` (14500) ✘ | `watt_per_m2 × netto × lengde` | Spesifikasjon, Romoversikt, `_roomRatedEffectW` («Total effekt», W/m²), Excel per rom, lister | `_foilItemW` |
| Etikett på strip i tegning (43238) ✘ | `(watt_per_m2 ∥ watt_per_m) × netto × lengde` | tegning + PDF-bilde | `_foilItemW` |
| Etikett på fri folie (43352) ✘ | samme | tegning + PDF-bilde | `_foilItemW` |
| `_layoutRulePenalty` (25515) ✘ | `(watt_per_m2 ∥ 60) × netto × lengde` | auto-utleggets «for lite watt»-straff | `_foilItemW` |
| `_foilLayoutStats` (25561) ✘ | samme | `totalWatt`/`wattPerM2` i utleggsalternativene | `_foilItemW` |
| `_soneStats` (48989) ✘ | `(watt_per_m2 ∥ 60) × areal` | sonekort | `_foilItemW` |
| Excel-bestilling/romliste (87508) ✘ | `watt_per_m2 × areal` | XLSX-ark med folie per rom | `_foilItemW` |
| Valgt-strip-panel (64899), multi-valg (64875), fri-folie-panel (64920) ✔ | `watt_per_lm × lengde` (ingen fallback) | sidepanel | `_foilItemW` |
| Materialliste-watt (80031), dokumentasjon-prefill (86107) ✔ | `watt_per_lm × lengde` (ingen fallback) | materialliste, garanti | `_foilItemW` |

Plate og matte (`watt_per_m2 × areal`) er IKKE rørt — de har ikke `watt_per_lm`.
Ingen folieformel står igjen utenfor `_foilItemW` (grep-vakt i testen).

## STEG 0.2 — Kenneths rom, målt FØR (kode 9b52af8, port 4012) og ETTER
Rom 8,0 × 5,5 m, 6 × 4,9 m B=80 + 4,9 m B=100/120/140 (44 m²).

| Sted | B=80 | B=100 | B=120 | B=140 | Sum før | Sum etter |
|---|---|---|---|---|---|---|
| `_roomProductRows` (Spesifikasjon/Romoversikt/PDF-tekst) | 1394 → **1411** | 291 → **294** | 350 → **353** | 409 → **412** | 2443 | **2470** |
| `_roomRatedEffectW` («Total effekt», PDF «Total effekt») | | | | | 2443 | **2470** |
| `_computeRoomStats.totalW` (romkort/overskrift) | | | | | 2470 | 2470 |
| `_roomFoilResistance.P` (motstand, PDF) | 1411,2 | 294,0 | 352,8 | 411,6 | 2469,6 | 2469,6 |
| Strip-etikett i tegning (`_foilItemW`) | 1411 | 294 | 353 | 412 | | |

PDF-tekstene (jsPDF-`text`-kall) bekrefter: før «2443, 2443, 1394, 409, 350, 291, 2469,6», etter «2470, 2470, 1411, 412, 353, 294, 2469,6».

## STEG 0.3 — katalogen mot databladet
`watt_per_lm` for de åtte FlexFoil-produktene (id 5–12): B=20 12 · 40 24 · 50 30 · 60 36 · 80 48 · 100 60 · 120 72 · 140 84.
**Alle stemmer med fasiten.** Ingen mangler `watt_per_lm`. Katalogen er ikke rørt.

## Flateeffekt og W/m² før/etter (Kenneths rom)
| Tall | Før | Etter |
|---|---|---|
| Flateeffekt (`wm2Heated`, ratet ÷ dekket areal 40,5 m²) | 61 | **61** |
| Effekt pr brutto (ratet ÷ 44 m²) | 56 (2443/44 = 55,5) | **56** (2470/44 = 56,1) |
| Romoversiktens W/m² (`_roomOversiktWm2`, ratet ÷ netto) | 56 | **56** |

Tallene endret seg altså ikke i avrundede heltall. Flateeffekt var allerede W/lm-basert (den leser `totalW` fra
`_foilPower`), og de to andre flyttet seg 55,5 → 56,1, begge 56 etter avrunding. Forventningen «61 → høyere» stemte ikke:
oppgaven antok at Flateeffekt kom fra spesifikasjonen, men den kom fra den riktige kilden hele tiden. Se spørsmål 1.

## Tester
- **Ny `_foilEffectRegressionTest` 24/24**: Kenneths rom håndregnet (48 × 29,4 = 1411,2 osv.), Σ folierader =
  `_foilPower().P` for tre rom (Kenneth, blandet strips + fri folie + uten W/lm, folie + kabel), kabeldelen uendret
  (500 W), fallback uten `watt_per_lm` (100 cm × 0,49 m × 60 = 29,4 W), ukjent produkt = 0, grep-vakt, Romoversiktens
  W/m². **Vaksine kjørt:** gammel linje satt tilbake i `_roomProductRows` (kopi på port 4013) → 10 sjekker røde
  (1394, 2443, Σ-sjekkene …); fjernet igjen → grønn.
- Grønne før og etter (uendret antall): `_foilRegressionTest` 9, `_pdfExportSmokeTest` 25, `_foilResistanceRegressionTest` 49,
  `_flateeffektRegressionTest` 9, `_soneRegressionTest` 40, `_computedStampRegressionTest` 19, `_gapRegressionTest` 11,
  `_accessoryFoilQtyRegressionTest` 46, `_gbao10RegressionTest` 18, `_listKalkyleClearRegressionTest` 32,
  `_cableZoneRegressionTest` 33, `_matRegressionTest` 2, `_planRegressionTest` 84.
- Røde både før og etter (trenger innlogget katalog, identiske feil på 9b52af8): `_listevisningRegressionTest`,
  `_reserveCableRegressionTest`, `_kundeforslagRegressionTest`.
- **Ingen eksisterende test låste de gamle folietallene** (ingen hadde 1394/2443 e.l.), så ingen fikk nye tall.
- Ikke verifisert piksel for piksel: etikettene på tegningen (strip/fri folie) — de bruker `_foilItemW` direkte, og
  tallet er det samme som `_roomProductRows` gir; render() kjørte uten konsollfeil.
