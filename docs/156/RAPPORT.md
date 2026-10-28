# 156 · Fryserom: reservekabelen tegnes som ghost

## STEG 0 — målt på `4f9bec9` (fixture: Stue 700×500, romtype Fryserom, InFloor 10T 600W 60m, auto → geo)

| | Hovedkabel | Reserve (før) |
|---|---|---|
| `_engine` | geo | geo (klonet) |
| `pathEls.length` | 1 (én `uturn`-kjede, 380 pkt) | **0** |
| `runs` | 0 | 0 |
| `drawnLength_cm` | – | **0** |
| i `S.cables` / lister | ja | ja (derfor tellet den, men ble aldri tegnet) |

- `_reserveClipToRoom` sin `pathEls.filter(… every(keep))` er det som tømmer reserven. Forskjøvet 5 cm
  (`RESERVE_OFFSET_CM`, 067 — **ikke** ½ CC som i prompten) lå **7 av 380** punkter utenfor innsatt polygon
  (margin 5 cm); hovedkabelen selv har 0 utenfor. Ett punkt ute = hele banen kastet.
- `centerline` ble klonet uforskjøvet. Ingen leser den på en reserve (alle leserne kjører på motorens egen
  nye kabel) → slettes på reserven.
- Runs-form (eldre motor) klippes per segment som før — koden for den er uendret.

### Hvor reserven står (kjørt, ikke antatt)

| Sted | Reserven | Effekt |
|---|---|---|
| `_roomProductBreakdown` / `_roomProductRows` | rad `Reservekabel`, antall 1 | 0 W |
| `_collectMaterialItems` | `Kabel` + `Reservekabel` | 0 W på reserven |
| `_computeRoomStats` | `reserveCount`, `reserveLenM`; hoppes over i W/dekning/W/m² | totalW 600 med og uten (målt) |
| `_roomRatedEffectW` | 600 (ikke 1200) | – |
| Romoversikt (PDF/Excel), Visma, GBAO10 | via `kind: 'Reservekabel'` (025, uendret) | `—` / 0 |
| Tegning (plan, PDF-romside, plantegning 154, presentasjon) | én vei: `drawCables` | før: ikke tegnet |

Alle tegnemåter går gjennom `drawCables` (`_renderRoomToImage`, `_renderFloorToImage` og presentasjonen kaller `render()`), så
én endring dekker alle. Ingen filtrering av reserven i noen tegnevei.

## Gjort

- **A** `_clipChainToPoly` (ny): klipper en punktkjede mot det innsatte polygonet og returnerer delene innenfor, med
  skjæringspunkt mot nærmeste kant i overgangene. `_reserveClipToRoom` klipper `uturn`-kjeder (`pts`) og `run`
  (`a`/`b`) per delstrekning; connector uten kjede som før. Ingen ny margin-regel (`_effectiveMarginCm`).
- **B** Forskyvningen er uendret (`_reserveOffsetSign` velger siden med flest punkter inne). Ytterste løp som likevel faller
  utenfor blir klippet bort, ikke hele kabelen.
- **C** Ghost: stiplet + alpha 0,7 og produktets farge fantes (025). Ny etikett «Reserve · <produkt>» /
  «60 m · ikke tilkoblet» ved **starten** av reserven (klemt inn i rommet), ikke W/m²/CC (de hører til hovedkabelen).
  Kabelpanelets reserve-avkrysning sier «Reservekabel: 1 × <produkt> (ikke tilkoblet, teller ikke i effekt)».
- **D** Telling: uendret (tabellen over).
- **E** Synk: `setRoomType` etter kabel → 1 reserve, `pathEls` 1, tegnet 5622 cm; kabel etter romtype → reserve finnes
  (begge målt). Ingen rettelse nødvendig.

## Før/etter
- Før: ingenting tegnet for reserven (`pathEls = []`, `drawnLength_cm = 0`).
- Etter: `pathEls` 1 kjede, `drawnLength_cm` 5622 av 6000 cm (94 %) — resten er klippet bort mot marginen.
  Skjermbilde: `docs/156/etter-romside.jpg` (PDF-romside-renderen, stiplet reserve inntil hvert hovedløp).

## Test
- `_reserveCableRegressionTest`: ny seksjon H (geo-kabel med løp ved begge marginer): `pathEls ≥ 1`, tegnet ≥ 50 %
  av hovedkabelen (8750 mot 10269 cm), ingen punkt utenfor innsatt rom, 0 W / reserveCount 1, **vaksine** (gammel
  alt-eller-ingenting-klipping → 0 elementer, sjekken blir rød). H: 5/5.
- ⚠ A-seksjonens tre rader feiler (`got 15 / null`) — **identisk på `4f9bec9` uten min endring** (stash-sammenligning);
  de avhenger av modulkontekst som min CDP-fixture ikke har. Ikke rørt.
- `_pdfExportSmokeTest` med fryserom i prosjektet: grønn. `_cableGeoSuite()`: samme (tomt) svar som før; hovedkabelens geometri er ikke rørt.
- Flytt/bytt produkt/slett: uendret (025 klonar på nytt i `_invalidateCableCache`); slå av/på avkryssing: 0 ↔ 1 reserve, effekt/flateeffekt/dekning identiske.

## Ikke gjort / merk
- Runs-form-rom: koden er uendret, men jeg har ikke kjørt en egen bit-sammenligning (skew-motorens `pathEls` med `run`-elementer klippes nå delvis i stedet for å bli kastet hele — ønsket, men en endring).
- Ikke pushet.
