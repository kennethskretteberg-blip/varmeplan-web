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
