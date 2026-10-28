# Serie 157 · Målsett matte

## 157

**Commit:** «157: målsett matte — virker for S.mats og S.matPaths (én geometrikilde), vegg→nettkant/mellomrom/ender + kabelkrav, knapp i menyene, alltid med i PDF». På `main`, ikke pushet.
Merk: nummeret 157 er alt brukt av `653f6bb` («157: fryserom», rapport i `docs/157/`). Denne serien ligger i `docs/serie-157/` som prompten ba om.

## STEG 0 (målt før endring, kode = 7ff5113)

**P0373 kunne ikke åpnes:** den headless-økten har ingen innlogging mot Supabase (samme sperre som 137 / E). Målingen er gjort på en
kopi bygget etter PDF-beskrivelsen — prosjekt «MÅLING 157 (P0373-kopi)» i `/tmp/cdp157/fixture.mjs`, katalogen fra
`/tmp/cdp145/catalog.json`, produkt **EcoMat 100T 0.5×16m** (id 88: cc 120 mm, kant-inntrekk 25 mm → nettmargin 2,5 cm, standard
mellomrom 7 cm):

| Rom | Lagret som | Geometri |
|---|---|---|
| 138 HC Gard (frihånd) · 200 × 600 | `S.matPaths` (3 bredder 528 / 528 / 544 cm = 1600, rullen dekker alt) | nettkanter x 2,5–52,5 · 59,5–109,5 · 116,5–166,5; y 2,5–546,5 |
| 125 HC (auto) · 250 × 500 | `S.mats` (3 bredder × 495, gap 7) | nettkanter x 302,5–352,5 · 359,5–409,5 · 416,5–466,5; y 2,5–497,5 |
| Begge typer · 300 × 400 | én `S.mats`-bredde + `S.matPaths` med to bredder | — |
| For nær vegg · 200 × 300 | `S.matPaths`, nettkant 1 cm fra venstre vegg (rødmerket av 135) | — |

1. **Hva kjeden tegnet før** (fillText fanget i `_drawMatDimChainForRoom`):
   - 138 HC Gard (`S.matPaths`): **ingenting**. For nær vegg: ingenting. Det er grunnen til at P0373-sidene mangler mål.
   - 125 HC (`S.mats`): «2.5 cm, 50 cm, 7 cm, 50 cm, 7 cm, 50 cm, 83.5 cm» på tvers, «2.5 cm, 495 cm, 2.5 cm» på langs.
   - Begge typer: bare auto-matta («2.5, 50, 247.5 | 2.5, 395, 2.5») — frihåndsbreddene usynlige for kjeden.
   - PDF: romsiden for 138 HC Gard uten kjede (`/tmp/cdp157/foer-side-1.png`), 125 HC med. Skjermbilde app: `/tmp/cdp157/foer-app.png`.
2. **Foliekjeden** (`_drawStripDimChainForRoom`): på tvers vegg → stripekant (`pos_cm`), netto bredde, mellomrom, … → vegg; på langs
   vegg → tidligste start, utstrekning, seneste ende → vegg. 25 cm utenfor rommet (verdens-cm), 10 px font, oransje, stiplede
   hjelpelinjer, tverrstreker 8 px, etikett 12 px innenfor linja. Punktum som desimaltegn («3.2 cm»), én desimal når tallet ikke er helt.
   Mattekjeden bruker nå nøyaktig samme tegnehjelpere og plassering (tverr under / langs venstre for loddrette bredder).
3. **Kabelens ytterste streng** (målt ved å fange `ctx.moveTo/lineTo/arc` under `_drawMatPathCable` på bane 1 i 138 HC Gard, cc 12):
   - på tvers: strengene ligger **8,5 cm** innenfor nettkanten (2,5 + cc/2), U-svingene er halvsirkler radius 6 (cc/2) → **svingens topp 2,5 cm** innenfor nettkanten;
   - på langs: første streng **6 cm** (cc/2) fra laneenden, siste 18 cm (paritetsregelen i `_matCableEntrySide` droppet én);
   - auto-matte (`_matCablePlan`, 125 HC): cc 12, strenger y 10 … 490 → **7,5 cm** fra hver nettende (`edgeMgn = (495 − 40·12)/2`), på tvers samme 2,5 + cc/2.
   - Regelen (128 / Regel 12): `_matEdgeInsetCm` = 2,5 (60T/100T) / 2,0 (150T), nettmargin = 5 − inntrekk = 2,5 / 3,0.
   **Valg:** kabelmerknaden regner nettkant → faktisk romkant + `_matEdgeInsetCm(prod)` (regelen). Tegningen legger aldri kabelen
   nærmere enn det (2,5 på tvers, ≥ cc/2 på langs), så merknaden er en nedre grense. Prompten sa «cc/2 innenfor nettkanten» — det
   stemmer bare for endene; på tvers er det 2,5 cm (svingens topp). Se spørsmål 3.

## Bygg

- **`_matDimChainData(room)`** (ren data, testbar) — rektangler fra samme kilder som tegningen: `_matRunWorldRects` (→ `_matRunWorldGeom`, 133)
  for `S.mats` (uten `labelOnly`) og `_matPathCoveredLaneRects` (149, dekket del) for `S.matPaths`. Per retning ('v' bredder langs Y /
  'h' langs X): bredder som overlapper på tvers slås sammen til ett bånd; tverr-kjede = vegg → nettkant, bredde, mellomrom, …, nettkant → vegg;
  langs-kjede = vegg → tidligste matteende, utstrekning, seneste ende → vegg. Veggmål under strengeste `_matWallMarginCm` i båndet → `red`.
  Kabelmerknad: min over rektanglene av `_rectToPolyEdgeCm` + `_matEdgeInsetCm`, rød under `MAT_CABLE_WALL_CM`.
- **`_drawMatDimChainForRoom`** tegner fra dataene: samme utseende som folie/kabel; røde tall i 027-rødt; et rødt 0-mål vises (før: alt
  under 0,3 cm ble hoppet over). Merknaden «Kabel → vegg min X cm (krav ≥ 5 cm)» 14 px under tverr-kjeden. `try/catch` som kabelkjeden.
  Tall i hele cm, én desimal under 10 (`_matDimFmtCm`).
- **`_rectToPolyEdgeCm(R, pts)`** (ved `_ptToPolyEdgeCm`): minste avstand rektangel → polygonkant, 0 når kanten krysser.
- **`_matPathCoveredLaneRects`**: hvert rektangel får `axis` som **ikke-tellbar** egenskap (`Object.defineProperty`), så 149-testen
  «dekkede rektangler = de fulle (bit-identisk)» (JSON) står; ingen tall endret.
- **Knappen:** `_matRoomHasMats(roomId)` (S.mats uten labelOnly, eller S.matPaths). Høyreklikkmenyen («Vis/Skjul målsett matte»),
  hurtigmenyen ⋯ («Målsett matte ✓»), romlista i sidepanelet (linjalknapp, som folie/kabel), og chip-en «Målsett Matte» i den flytende
  linja når en frihånds-/kapittelmatte er valgt. `toggleMatDimSnap` finner rommet også via `selectedMatPathId`. Samme `room.matDimSnap`.
- **PDF:** `_renderRoomToImage` setter `matDimSnap` når rommet har `S.mats` **eller** `S.matPaths`. Plantegningen (154/158) er urørt
  (`drawAllDimAnnotations` returnerer tidlig på `_pdfOverview`). Presentasjon/kundelenke følger bryteren som før (119-gaten).
- **Plass:** kjeden ligger 25 cm utenfor rommet + merknaden 14 px (≈ 7 cm ved 300 DPI); `PDF_ROOM_PAD_CM` 150 holder — kontrollert i
  `/tmp/cdp157/etter-s1-crop-1.png` og `etter-s4-crop-4.png` (ingenting klippet).

## Tallene for ett rom, kontrollert for hånd (138 HC Gard, 200 × 600)

`start.x` 27,5 → bane 1 nettkanter 2,5–52,5; U-sving flytter NET + gap = 57 → 59,5–109,5 og 116,5–166,5. Tverr: 2,5 | 50 | 7 | 50 | 7 | 50 |
200 − 166,5 = 33,5 → «34 cm». Langs: y 2,5 → «2.5 cm»; lengste bredde 544 → ende 546,5; 600 − 546,5 = 53,5 → «54 cm». Kabel: 2,5 + 2,5 = 5,0 →
ikke rød. Kjeden tegner nøyaktig: `2.5 cm, 50 cm, 7 cm, 50 cm, 7 cm, 50 cm, 34 cm | 2.5 cm, 544 cm, 54 cm | Kabel → vegg min 5 cm (krav ≥ 5 cm)`.

For nær vegg (nettkant 1 cm fra veggen): «**1 cm**» rødt, «Kabel → vegg min **3.5 cm** (krav ≥ 5 cm)» rødt, resten oransje — i app og PDF.

## Skjermbilder

Kopier av bildene under ligger i `docs/serie-157/bilder/` (app før/etter, PDF side 1 før/etter, utsnittene).

| | Før | Etter |
|---|---|---|
| App, fire rom | `/tmp/cdp157/foer-app.png` | `/tmp/cdp157/etter-app.png` |
| PDF side 1 (138 HC Gard) | `/tmp/cdp157/foer-side-1.png` (ingen kjede) | `/tmp/cdp157/etter-side-1.png`, utsnitt `etter-s1-crop-1.png` |
| PDF side 4 (For nær vegg) | `foer-side-4.png` | `etter-side-4.png`, utsnitt `etter-s4-crop-4.png` (rødt) |

## Før/etter (HEAD 7ff5113 på port 4004 mot ny kode, samme fixture, `compare.mjs`)

| Rom | Bilde-hash |
|---|---|
| 138 HC Gard, 125 HC, Begge typer, For nær vegg | ULIK (kjeden er ny/endret) |
| Uten matter, Folie | **LIK** (bit-identisk) |

PDF 11 sider begge, 520 tekstkall identiske, 954 → 982 KB (fire romsider med kjede).

## Tester

- Ny **`_matDimChainRegressionTest`**: **43/43** — geometrikilde med to vaksiner (10 cm forskyvning i `_matRunWorldGeom` flytter kjeden;
  fulle rektangler i stedet for dekkede gir 1104 i stedet for 1000), tallene for frihånd/auto/begge/vannrett/L-rom/150T, rødmerking,
  tegnede tekster og farger, PDF-auto-på for rom med bare `S.matPaths` (bryteren settes tilbake), rom uten matter uten kjede,
  menyene og chip-en, `toggleMatDimSnap` via frihåndsmatte.
- Matte-batteriene: `_matFreeRegressionTest` 65/65, `_matRunAdjustRegressionTest` 70/70, `_matPathEqualizeRegressionTest` 56/56,
  `_matArrangementRegressionTest` 65/65, `_matPathClickRegressionTest` 28/28.
- `_pdfExportSmokeTest` 49/49, `_pdfPreviewRegressionTest` 57/57.
- `_kundeforslagRegressionTest` 233/237 med den mellomlagrede katalogen — de 4 (10T/17T-kabelserier) feiler identisk på 7ff5113;
  N-sjekken på `drawAllDimAnnotations` er grønn. Med målefixturen lastet feiler 4 «151»-rader i `_matFreeRegressionTest` identisk
  på 7ff5113 (uten fixturen 65/65) — fixtur-tilstand, ikke 157.
- Kjøring: `node /tmp/cdp157/run-tests.mjs 4000 <tester>` (headless Chrome på 9333), fixture + skjermbilder `node /tmp/cdp157/steg0.mjs etter`.

## Ikke gjort

- Matteutlegget, marginene, 133/149, folie- og kabelkjedene er urørt. Ikke pushet.
- Kjeden måler mot rommets bbox-vegg (som foliekjeden) — i L-rom kan et tverrmål gå til en vegg som ikke er der; kabelmerknaden
  bruker den faktiske kanten. Se spørsmål 4.

## 158

**Commit:** «158: plantegning — uten romliste (bildet får siden), zoom/flytt per etasje lagret (floor.pdfView), levende forhåndsvisning som 155». På `main`, ikke pushet.
(Nummeret 158 er også brukt av `467ae7f` «158: plantegning — rom uten varme dempet», rapport i `docs/158/`. Denne ligger her, i serie-157, som prompten ba om.)

### STEG 0 (målt før endring, kode = b47764e)

**P0373 kunne ikke åpnes** (ingen innlogging i den headless økten — samme sperre som 157/137). Målt på samme P0373-kopi som 157
(`/tmp/cdp158/fixture.mjs` → `P0373`: 138 HC Gard 200 × 600 og 125 HC 250 × 500, EcoMat 100T, én etasje), PDF med forside +
plantegning + to romsider. `addImage`-kallene fanget (side, x, y, b, h i mm):

| | Før (b47764e) | Etter |
|---|---|---|
| Side | stående (bbox 750 × 800 cm, aspekt 1,067 → `landscape` = nei) | samme |
| Tittel + undertittel + strek | y 15–36 mm | samme |
| Bildet | x 15, y 36, **180 × 192 mm** | x 15, y 36, **180 × 192 mm** |
| Romlista | overskrift y 234, én rad y 240 (2 rom i to kolonner), 12,2 mm + 6 mm luft | **borte** |
| Tekst på siden | 24 `text`-kall (Rom/Netto m²/Produkt/W × 2, navn, 12.0, EcoMat 100T, 800 …) | 6 (tittel, undertittel, bunntekst) |

Ærlig funn: på denne etasjen vokser **ikke** bildet. Det var allerede begrenset av bredden (180 mm på stående side), ikke av høyden —
romlista lå under med luft igjen. Bildet får bare mer plass når etasjen er høyere enn bred nok til at lista presset det ned
(aspekt > (240 − listehøyde) / 180 ≈ 1,27 med 2 rom, 1,17 med 10 rom); da er gevinsten 12–29 mm i høyden. Se spørsmål 1.
Skjermbilder: `bilder/158-foer-side-2.png` / `158-etter-side-2.png`.

**Hvordan 155 koblet utsnittet inn** (lest i koden): `room.pdfView {cx, cy, scale}` leses av én funksjon, `_pdfViewOf(room)`
(gyldighet + klemming 0,5–4). `_renderRoomToImage` deler `worldW`/`worldH` på skalaen og bruker `cx`/`cy` som pan; `_pdfRoomAspect`
er bare geometri (uavhengig av utsnittet), så sideoppsettet og `_pdfScaleMmPerCm` er de samme. Forhåndsvisningen (`_expPreviewRoom`
+ `_pdfPrev*`) tegner med `opts.outW/toCanvas/noUrl/captureLabels` og leser `res.view` + `res.labels`. Det som kunne gjenbrukes
direkte: `_pdfViewOf` (tar hvilket som helst objekt med `pdfView`), hele `_pdfPrev*`-kjeden (hjul, dra, label-treff, angre,
autolagring, skrivebeskyttet) — forutsatt at `_renderFloorToImage` returnerer det samme som `_renderRoomToImage`.

### Bygg

- **PDF-siden** (`exportPDF`, «154 · Plantegning per etasje»): romlista (to kolonner, `_fpHead`, radløkka) er fjernet.
  `availImgH = (pageH − M) − y − 6`; bildet får resten av siden med bevart aspekt, liggende side som i 154. Undertittelen
  «N rom · m² netto · W» står (tallene fra `floorSummaries`, som før), kartattribusjonen under bildet som før.
- **Utsnitt per etasje:** `_pdfFloorViewOf(floor)` / `_pdfFloorViewSet(floor, v)` ved `_pdfViewOf` — samme leser, samme klemming.
  Bor på `floor.pdfView`; prosjekt uten etasjer: `S.project.pdfViewFloorplan`. `_pdfFloorBox(floor)` deler `worldW`/`worldH` på
  skalaen og gir `cx`/`cy` (lagret eller bbox-midten) og `scale`; aspekt og `landscape` er uendret av utsnittet.
  `_renderFloorToImage` bruker `box.cx/cy` som pan (før: bbox-midten regnet på nytt) og har fått `opts.outW`, `opts.toCanvas`,
  `opts.noUrl`, `opts.captureLabels` og returnerer `view` + `labels` — nøyaktig samme form som `_renderRoomToImage`.
  Lagres av `_buildSaveData` (`floors.map(f => ({...f}))` / `{...S.project}`) uten ny kode; `pushUndo` kopierer etasjer grunt,
  derfor skrives alltid et nytt objekt.
- **Forhåndsvisningen:** `_expPreviewRoom` er delt i to: rom-spesifikt (statistikk, ‹ › rom) og `_expPreviewLive(cfg)` som
  monterer verktøylinje, lerret, infotekst og lyttere. Ny `_expPreviewFloor(idx)` bruker den samme monteringen med etasjens
  tittel/tall og ‹ › mellom etasjer; `_expPreviewSection('floorplan')` delegerer dit (stillbildet med `<img>` er borte).
  `_pdfPrev` har fått `kind` ('room'/'floor'), `floorId` og `roomIds` (Set): `_pdfPrevDraw` velger `_pdfRoomAspect`/
  `_renderRoomToImage` eller `_pdfFloorBox`/`_renderFloorToImage`; `_pdfPrevSetView`/`_pdfPrevResetView`/`_pdfPrevHasView` skriver
  til rommet eller etasjen; `_pdfPrevHitLabel` treffer labels i alle rommene på etasjen (dempede rom har ingen). Hjul, dra,
  label-drag, dobbeltklikk, angre-per-bevegelse, autolagring og skrivebeskyttelse er uendret kode. «Labels til auto» på etasjen
  tar alle rommene på etasjen (bekreftelse med antall).
- **Delt med 155 (ikke kopiert):** `_pdfViewOf`, `PDF_VIEW_SCALE_MIN/MAX`, `_expPreviewLive`, `_pdfPrevDraw`, `_pdfPrevWheel`,
  `_pdfPrevDown/Move/Up`, `_pdfPrevDblClick`, `_pdfPrevHitLabel`, `_pdfPrevSetView`, `_pdfPrevResetView`, `_pdfPrevResetLabels`,
  `_labelClearManual`, `_labelScaleNum`. Romsidene og romforhåndsvisningen er funksjonelt urørt (regresjonstestens A/B 57 sjekker grønne).

### Test (på `TOETG`-fixturen, 8 rom / 2 etasjer, `/tmp/cdp158/shots.mjs`, `reset.mjs`, `lerret.mjs`)

1. Plantegning-siden: bare tittel, undertittel, bilde, bunntekst (P0373-kopi: 24 → 6 tekstkall; mm i tabellen over).
2. Zoom 3 hjul (1,331×) + flytt i forhåndsvisningen → `S.floors[0].pdfView = {cx 546.8, cy 469.4, scale 1.331}`; PDF-ens
   plantegningsbilde har samme plassering (x 15, y 36, 267 × 115,25 mm) men annet innhold (JPEG 145 199 → 158 331 byte), og
   bildet i `bilder/158-toetg-pdfview-01.png` er det samme utsnittet som `158-etter-dialog-zoom.png`.
   Lagre/åpne: `_buildSaveData()` → `_restoreProject()` gir begge etasjenes `pdfView` tilbake uendret.
   Tilbakestill (begge etasjer) → `pdfView` borte, knappen av, etasjebildene **bit-identiske** med auto (SHA-256 `57deb5c85dc9` /
   `953e947280d2` før og etter, JPEG-lengder 238 975 / 145 199). (Merk: en `_restoreProject`-runde på fixturen endrer bildet fordi
   restore legger på romfelter fixturen mangler — `foilGapCm`, `wallThicknessCm` — så bit-sjekken er gjort uten den i mellom.)
3. To etasjer: 1. etasje 1,331×, 2. etasje 1,21× (`{cx 595, cy 200, scale 1.21}`), hver sin — `158-etter-dialog-etasje2.png`.
4. Label-drag i plantegningen (kabelen i Stue): `cable.labelPos = {871.1, 224.2}`; romforhåndsvisningen (`158-etter-dialog-romside.png`)
   og hovedlerretet (`158-etter-hovedlerret.png`, `_cableLabelBounds[1]` flyttet) viser labelen der.
5. `_pdfExportSmokeTest` 49 → **55** grønne: de to romliste-sjekkene byttet ut med «ingen romliste», «undertittelen står»,
   «bildet får resten av siden» (180/267 mm bredt eller til 6 mm over bunnmargen), `floor.pdfView` → samme sideantall, samme
   bildeplassering, annet bilde for 1. etasje, uendret for 2. etasje, og VAKSINE (`_pdfFloorViewOf` → null gir auto igjen).
   `_pdfPreviewRegressionTest` 57 → **84** grønne: ny seksjon C — uten etasjer (`S.project.pdfViewFloorplan`), `_pdfFloorBox`/
   `_renderFloorToImage` leser det, ett angresteg, rommenes utsnitt urørt, dra = flytt (40 px → 40·k/sc cm), label-drag deler
   `labelPos` med romsiden, tilbakestill bit-identisk, med etasjer hver sin `floor.pdfView`, ‹ › uten å røre avkryssingen,
   skrivebeskyttet. Ingen konsollfeil.

### Skjermbilder (`docs/serie-157/bilder/`)

`158-foer-dialog.png` (stillbilde før) · `158-etter-dialog-auto.png` · `158-etter-dialog-zoom.png` · `158-etter-dialog-label.png` ·
`158-etter-dialog-etasje2.png` · `158-etter-dialog-romside.png` · `158-etter-hovedlerret.png` · `158-toetg-auto-01.png` /
`158-toetg-pdfview-01.png` (PDF-siden auto / med utsnitt) · `158-toetg-pdfview-02.png` (2. etasje).

### Ikke gjort

- Romsidene/155 og romlista er ikke flyttet noe sted (Romoversikten finnes).
- Avkryssing av rom i dialogen tegner ikke det levende lerretet på nytt før seksjonen klikkes igjen (som stillbildet før). Spørsmål 4.
- Ikke pushet.
