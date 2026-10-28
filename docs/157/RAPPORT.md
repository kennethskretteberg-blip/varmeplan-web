# 157 · Fryserom: veggmargin = halv CC

## STEG 0 — målt på `ac203ae` (Stue 700×500, Fryserom, InFloor 10T 600 W 60 m, auto → geo)

| Måling | Verdi |
|---|---|
| `_effectiveMarginCm(44, rom)` | **5 cm** (bekreftet: `Math.max(5, produktminimum 5)`, ingen romønske) |
| `main.spacing_cm` | 49,28 cm (geo), 380 punkter |
| Hovedkabelens minste veggavstand | 5,05 cm |
| Reserve uklippet, mot margin 5 | **7 av 380** punkter utenfor innsatt polygon (som 156) |
| Gammel layout forskjøvet mot ½ CC (24,6) | hovedkabel 26 ute, reserve 25 ute — **ikke en gyldig test**: layouten må lages på nytt med den nye marginen, ellers flytter bare polygonet |

Hypotesen ble derfor testet ved faktisk å legge ut på nytt (se «Sirkelen» og «Etter»). Den holder: 0 punkter utenfor rommet, ingen klipping.

### Hvor marginen brukes for et fryserom
~45 kall til `_effectiveMarginCm`. De som betyr noe for kabel: `_autoFillCableImpl` og motorene under den
(`generateCableLayoutLengthDriven`, geo, serpentin, boustrophedon, celle-dekomponering) leser alle
`_effectiveMarginCm(productId, roomId)`; `_reserveClipToRoom` (156); validering/flytting av kabel
(`:30494`, `:54862`…); `_offsetPolygon`-kallene. Ved å endre **funksjonen** i stedet for kallstedene får alle samme tall.

## Sirkelen (margin → areal → CC → margin)
- **Under utlegg** (`_autoFillFryserom`, kalt fra `autoFillCable` for fryserom + kabelprodukt): start på `ccStandardCm/2 = 20`.
  Gir utlegget CC/2 > margin, settes margin = CC/2 og utlegget lages på nytt (maks 6 runder).
- **Målt konvergens** (Stue): margin 20 → CC 47,14 · margin 23,57 → CC 50,0 · margin 25 → CC 49,99 → ferdig (3 runder).
  Merk: CC *stiger* her med margin (geo-motoren bytter løpstall), så det er ikke en ren avtagende følge. 6-rundersgrensen
  og en konsoll-advarsel («konvergerte ikke») dekker det; stemplet er alltid marginen utlegget FAKTISK ble laget med.
- **Etter utlegg**: utlegget stemples `cable._frysMarginCm`; `_effectiveMarginCm` leser stempelet. Ingen sirkel, ingen avhengighet av nåværende CC.
- **Uten kabel**: `ccStandardCm/2 = 20`.

## Gjort
- **A** `_effectiveMarginCm`: fryserom + kabelprodukt → `max(produktminimum, stemplet/halv CC)`. Foliefri, ikke snø, ikke andre romtyper.
  Kabelprodukt = kategori `cable` ELLER fast `cable_length_m` (`_isCableProductId`) — kategoriene kan mangle i en kald last.
- **B** Utlegget (`_autoFillFryserom`) legger alle motorer innenfor den nye marginen (de leser samme funksjon). Ingen ny klippelogikk.
- **C** `_reserveClipToRoom` og `_clipChainToPoly` står. Klipper den noe på et fryserom → `console.warn('[157] …')`.
  **Én nødvendig justering:** reserven ligger 5 cm nærmere veggen enn hovedkabelen (25 → 20 cm). Klippet mot hovedkabelens margin
  ville den kuttet akkurat det løpet, så for *stemplede* fryseromsutlegg klippes det mot `margin − reserveoffset`. Rommet er fortsatt
  helt overholdt (reserven ≥ 20 cm fra vegg). Uten dette ga målingen 7 punkter klippet og en falsk advarsel.
- **D** Gamle prosjekter, se under.

## Etter (Stue, målt)
| | Før | Etter |
|---|---|---|
| margin | 5 | 25 (stempel; CC 49,99) |
| hovedkabel minste veggavstand | 5,05 | 25,05 |
| hovedkabel utenfor innsatt polygon | 0 | 0 |
| reserve utenfor rommet | 0 (etter 156-klipping) | 0 uten klipping |
| reserve tegnet | 5622 av 6000 cm (klippet) | **6000 av 6000** |
| klippe-advarsel | – | ingen |

## Gamle prosjekter (D)
Kabler lagret før 157 har ikke `_frysMarginCm` → `_frysMarginCm()` gir `null` → margin som før (5 cm), og
reserveklippingen bruker uendret 156-logikk (målt: margin 5, reserve tegnet 5622). Ingenting regnes om automatisk.
«Fyll rom» / nytt utlegg gir ny margin og stempel (målt: 25 cm, reserve 6000). Fryserom UTEN kabel får 20 cm for manuell tegning.

## Tester
`_reserveCableRegressionTest`, ny seksjon **I** (12 rader, alle grønne): margin 20 uten kabel; auto-utlegg stemplet;
margin ≥ ½ CC; hovedkabel 0 ute; reserve 0 utenfor rommet, ikke klippet; CC 40 → 20; CC 8 → produktets minimum vinner;
eldre utlegg uten stempel uendret; bad uendret; `RESERVE_OFFSET_CM` 5; `ccMinCm` 30 / `ccStandardCm` 40.
⚠ I CDP-harnessen mangler kabelkategorien, så produktets gulv er 2,5 (ikke 5) og «CC 8»-raden forventer `max(gulv, 4)`
(=4 her, =5 i appen). A-seksjonens tre rader feiler (`got 15 / null`) **identisk på `ac203ae`** (stash-sammenligning); `_cableGeoSuite` `{}` og
`_pdfExportSmokeTest` `false` er likeledes identiske før/etter i denne harnessen.
