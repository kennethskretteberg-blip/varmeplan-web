# Serie 163 — folietilbehøret i tilbehørsdialogen

## 163 · Dekket m² på plater og plastfolie, klemmer med tegnet + 15 %, Kapton Disc i hele ruller

Kenneth 30.10.2026: «Tilbehør: ønsker at det vises med liten skrift hvor mange kvadratmeter antallet
underlagsplater dekker, f.eks. 60 stk (43,2 m²). … Det samme gjelder for plastfolie. For tilkoblingsklemmer
ønsker jeg samme oppsett som for FlexFoil varmefolie … Kapton Disc selges nå kun som hel rull, så antallet må
enten være 0 eller 100 stk.»

Alt er målt uten innlogging på et **P0378-lignende** syntetisk prosjekt (ett rom 700 × 560 cm = 39,2 m² brutto,
10 foliebredder à 5,00 m × 50 cm = 25,0 m² folie), satt opp direkte i `S` med en testfolie i katalogen.
Harness: `/tmp/cdp163` (headless Chrome på 9333; `steg0.mjs` = dialog/PDF/Excel/Visma/GBAO10-målingen,
`pdfshot.mjs` = selve PDF-fila, `tests.mjs` = testbatteriet). Gammel kode (f522c83) servert fra
`/tmp/cdp163/old` på port 4011. Skjermbilder i `docs/serie-163/bilder/`.

### STEG 0 — slik var det (f522c83)

**0.1 Dialogen på P0378-rommet** (`163-dialog-foer.png`). Toppen av foliedelen: «10 strips · 25.0 m² folie ·
39.2 m² brutto».

| Rad | Forslag før | Liten skrift før | Utregning |
|---|---|---|---|
| Underlagsplater | 60 stk | ingen | 39,2 / 0,72 = 54,4 · 1,10 = 59,9 → 60 |
| Plastfolie over | 1 rull | ingen | 25,0 / 39 = 0,64 → 1 |
| Plastfolie under | 1 rull (uavhuket) | ingen | samme |
| Tilkoblingsklemmer | 20 stk | ingen | 10 bredder × 2 |
| Kapton Disc | 20 stk | ingen | 10 bredder × 2 — **ikke hel rull** |

`basisText` i `renderRow` havner som en `<br>`-linje i liten, dempet skrift rett under navnet (10 px,
`var(--dim)`). Bare kabel- og mattetilbehøret sendte den inn (`cableBasis`/`matBasis`); folieradene kalte
`renderRow(a, qty)` uten tekst. Skrev man 130 på Kapton og bekreftet, ble det lagret **130** (ingen avrunding,
ingen melding) — målt.

**0.2 Hvor `calc`-resultatet leses.** Tre steder, alle i `showAccessoriesModal`:

1. `foilAutoQtys[a.id] = _applyAccessoryCalc(a, foilCtx)` — forslaget («forslag: N») og `data-auto-qty`.
2. `renderRow`: `startVal = savedQty != null ? savedQty : autoQty` — **lagret tall vinner alltid** for
   tilbehør (125-regelen «lagret vinner til tegningen vokser» gjelder bare *folieradene* via `_foilOrderQtyM`;
   tilbehøret har ikke noen «tegningen vokste»-sjekk, det står i kommentaren der).
3. `readRow` ved bekreftelse: feltverdi, ellers `fallbackQty` = forslaget; `roundTo > 1` rundet opp til hele
   hundre (kabel-strips).

Eksportene (PDF `_accRenderGroup`, Excel «Bestilling» `_emit`, Visma `_vismaPasteBuild`, GBAO10
`_gbao10Build`) leser **bare** de lagrede radene (`S.project.accessories.items` → `_aggregateAccessoryItems`),
aldri `calc`. Et nytt forslag endrer altså aldri en lagret rad — bare dialogen viser det nye forslaget ved
siden av det lagrede tallet.

**0.3 Platemål og rullareal.** Navnet «Underlagsplate Gul 50T 6mm **60×120**» → 0,60 × 1,20 = **0,72 m²**,
samme tall som `calc` deler på. «Plastfolie 0,20mm **2,60×15m (39 m²)**» → 2,6 × 15 = **39 m²**, samme som
`calc`. Begge står nå som `coversM2PerUnit` på oppføringen, så tallet finnes ett sted per vare.

### Gjort

Alt i `index.html`, ingen endring i katalog/DB, foliemengde-oppsettet (125), kabeltilbehør eller RKK.

1. **Tre valgfrie felt på `FOIL_ACCESSORIES`-oppføringen** (kommentert over lista):
   `coversM2PerUnit` + `coversRef` ('gross' | 'foil'), `packSize`, og `basis(ctx, qty)` (samme konvensjon
   som kabeltilbehøret alt hadde).
   - underlagsplater: `coversM2PerUnit: 0.72, coversRef: 'gross'`
   - plast_over / plast_under: `coversM2PerUnit: 39, coversRef: 'foil'` (dekningen måles mot tegnet
     folieareal, som `calc` gjør — se spørsmål 3)
   - tilkoblingsklemmer: `overheadPct: 15`, `basis` → «Tegnet: 20 stk (2 pr foliebredde)»
   - kapton_disc: `packSize: 100` med kommentar «sett til 50 når 50-rullene kommer»
2. **Én formatter, `_accInfoText(acc, qty, ctx)`**, ved siden av `_applyAccessoryCalc`:
   «= 43,2 m² (brutto 39,2 m²)», «= 39,0 m² (folie 25,0 m²)», «= 1 rull à 100 (behov 20)», og
   «… — rundes opp til 200 stk» når tallet i feltet ikke er hel pakke. `renderRow` fikk en femte parameter
   `infoCtx`; bare folieradene sender `foilCtx`, så kabel/matte er urørt. Linja har `data-acc-info` og en
   `input`-lytter oppdaterer den **live** mens man skriver.
3. **Hele pakker:** `_accPackSize(acc)` / `_accRoundToPack(acc, qty)` — `packSize` og det gamle `roundTo`
   går samme vei (rund opp, 0 forblir 0). `_applyAccessoryCalc` = `_accRoundToPack(acc, _accNeedQty(acc, ctx))`,
   der `_accNeedQty` er behovet før pakking (calc × påslag, med 1e-9 mot flyttallsstøy — 40 × 1,15 =
   46,00000000000001 skal bli 46, ikke 47). `readRow` bruker samme `_accRoundToPack`; når tallet endres,
   vises en gul toast: «FlexFoil Kapton Disc endeforsegling: selges bare i hele ruller à 100 — 130 rundet opp
   til 200 stk».
4. **Eksportene:** `_accCoversSuffix(id, qty)` → « (43,2 m²)» for oppføringer med `coversM2PerUnit`, ellers
   tom. PDF-tilbehørslista: bak enheten (Antall «60», Enhet «stk (43,2 m²)» — 16,4 mm i en 20 mm-kolonne,
   målt med `getTextWidth`). Excel «Bestilling»: «60 stk (43,2 m²)» i Antall-cellen. Visma-lim, GBAO10 og
   Excel «Materialliste» urørt (tall, ikke tekst).

### Etter (målt, `steg0-etter.json`)

| Rad | Liten skrift | Forslag | Felt |
|---|---|---|---|
| Underlagsplater | = 43,2 m² (brutto 39,2 m²) | 60 | 60 |
| Plastfolie over | = 39,0 m² (folie 25,0 m²) | 1 | 1 |
| Plastfolie under | = 39,0 m² (folie 25,0 m²) | 1 | 1 |
| Tilkoblingsklemmer | Tegnet: 20 stk (2 pr foliebredde) | 23 | 23 |
| Kapton Disc | = 1 rull à 100 (behov 20) | 100 | 100 |

Kontrollert for hånd: 60 × 0,72 = 43,2; 1 × 39 = 39,0; 20 × 1,15 = 23,0 → 23; 20 → ⌈20/100⌉ × 100 = 100.

- **Live:** 70 i platefeltet → «= 50,4 m² (brutto 39,2 m²)» uten å forlate feltet. 130 på Kapton →
  «= 2 rull à 100 (behov 20) — rundes opp til 200 stk».
- **Bekreft** med 70 plater og 130 Kapton: lagret 70 / **200**, toast «… 130 rundet opp til 200 stk».
- **PDF** (`163-pdf-tilbehor-etter.png`): «60 | stk (43,2 m²)», «1 | rull (39,0 m²)», «23 | stk»,
  «100 | stk». **Excel Bestilling:** `70 stk (50,4 m²)`, `1 rull (39,0 m²)`, `23 stk`, `200 stk`.
- **Visma-lim / GBAO10:** CVA54206 70, CVA54212 1, CVA54124 23, CVA54214 200, CVA54211 2, CVA54213 1 —
  bare tall, Kapton i hel pakke.
- **Lagret rad fra før** (testet i regresjonstesten med Kapton 20 / plater 50 lagret): tallene står,
  Kapton-linja sier «… — rundes opp til 100 stk», platene «= 36,0 m² (brutto 38,0 m²)». **0 bredder → Kapton 0**
  (`_applyAccessoryCalc` gir 0; dialogen vises uansett ikke uten folie).

### Tester

`_accessoryFoilQtyRegressionTest`: **46 → 84 sjekker, grønn** (38 merket 163: regelen, info-tekstene,
selve dialogen i DOM med live-oppdatering og bekreftelse, lagret rad, Excel- og PDF-teksten, og **vaksinen**:
med `packSize` fjernet går 130 rett gjennom → sjekken ville blitt rød). `_pdfExportSmokeTest` 55/55,
`_foilRegressionTest` 9/9, `_pdfPreviewRegressionTest` 84/84, `_bgFloorRegressionTest` 31/31,
`_nyttProsjektRegressionTest` 25/25. Gammel kode (4011): tilbehørstesten 46/46, PDF 55/55 (`tests-foer.txt`).

Commit: «163: folietilbehør — dekket m² på plater og plastfolie (coversM2PerUnit), klemmer med tegnet + 15 %
forslag, Kapton Disc i hele ruller (packSize)». Ikke pushet.


## 164 · Målekjedene per faktisk veggkant i L-/T-/U-rom (felles kantmodell for folie, kabel og matte)

Kenneth 30.10.2026 (P0378 side 2): «der ligger det en målelinje i bunnen. Det blir feil for denne type rom, da
målene ikke stemmer. Kan vi heller få mål under hver vegg, og ikke en felles, når det er slike rom?»
Lukker serie-157 spørsmål 4 (svaret er skrevet inn der).

Alt er målt uten innlogging. **P0378 «Rom 2» er gjenskapt fra PDF-en** (`…_KS_P0378_rev2.pdf`, side 2, rendret i
500 dpi og veggmålene lest av): V9 824 (topp), V8 323, V7 364, V6 644, V5 77, V4 121, V3 77, V2 137, V1 765,
V13 13, V12 37, V11 310, V10 360 — polygonet lukker (824 × 1088). Foliebreddene lagt slik PDF-ens bunnkjede
viser (3 × B=100 à 3,5 m i venstre arm, B=20 og B=120 (10,83 m) i stammen, B=80 1,16 m i utstikkeren, 3 × B=100 +
B=60 à 3,2 m i høyre arm). **Kontroll:** gammel kode på kopien gir nøyaktig PDF-ens tall — bunnkjeden
8,2 | 99 | 2 | 99 | 2 | 99 | 2 | 19 | 2 | 119 | 2 | 79 | 22 | 99 | 2 | 99 | 2 | 59 | 8,8 og venstrekjeden
2,5 | 1083 | 2,5. Harness: `/tmp/cdp164` (`fx.mjs` = fiksturen: P0378 + rektangler med folie/kabel/matte +
L-/U-rom; `measure.mjs` = kjedetall, lerretshash og PDF-rombilde per rom; `present.mjs` = presentasjon/kundelenke;
`tests.mjs` = testbatteriet). Gammel kode (29d466f) fra `/tmp/cdp164/old` på port 4012. Bilder i
`docs/serie-163/bilder/164-*`.

### STEG 0 — slik var det (29d466f)

**0.1 Dagens bunnkjede på P0378** (`164-app-foer-P0378.png`, `164-pdf-foer-P0378.jpg`). Én kjede langs hele
ytterboksen, tegnet 25 cm under y = 1088 — altså **7,3 m under venstre arms egen vegg** (y = 360) og 7,6 m under
høyre arms (y = 323). Tall for tall:

| Tall | Hva det måler | Riktig? |
|---|---|---|
| 8,2 og 8,8 | venstre/høyre ytterkant → første/siste bredde | riktig, men bare fordi armenes yttervegger faller sammen med boksen |
| 2 (mellom 3. bredde i venstre arm, slutt 309,2, og B=20 ved 311,2) | «mellomrom» | **galt** — vegg V11 ender ved x = 310 mellom dem; venstre arms siste bredde ligger 0,8 cm fra sin vegg |
| 22 (mellom B=80 i utstikkeren, slutt 532,2, og høyre arms første bredde 554,2) | «mellomrom» | **galt** — utstikkerens vegg står ved 537 (4,8 cm), og høyre arms bredde ligger 94,2 cm fra stammens vegg x = 460 |
| 2 | 19 | 2 | 119 (B=20 og B=120 i stammen) | bredder | bredder riktig, men «2» før B=20 går over V13 (13 cm notch) |
| venstre 2,5 | 1083 | 2,5 | stammens B=120 | riktig for stammen, men armenes bredder (5 / 2,5 / 0,5 cm fra egne vegger) finnes ikke i kjeden |

**0.2 Hvordan kjedene fant «vegg».** Alle tre — `_drawStripDimChainForRoom`, `_drawCableDimChainForRoomInner`
og `_matDimChainData` — tok `min/max` av `room.points` og laget én tverr-kjede på fjern side og én langs-kjede på
nær side, med **tre kopier** av samme tegnekode (haker, stiplede hjelpelinjer, tekst). Delte primitiver som
fantes: `_rectToPolyEdgeCm` (minste avstand rektangel → polygonkant, 157-merknaden), `clipStripToRoom`
(skannelinjer på tvers av båndet), `_skClipVertical` (skannelinje → intervaller), `snapToWalls` (prøvepunkt på
hver side av en kant, 136). Ingen av dem svarer på «hvilken veggkant vender denne bredden mot», så det ble en
liten ny modell (under) i stedet for å bøye en av dem.

**0.3 Antall kjeder og plass med den nye regelen** (målt på fiksturen):

| Rom | Tverr-kjeder (én per kant med produkter) | Langs-kjeder (én per (nær, fjern) vegg) |
|---|---|---|
| P0378 (T) | **4**: V11, V13 (13 cm), V2+V3 (slått sammen), V7 | **4**: venstre arm (venstre, −25), høyre arm + B=20 (høyre, +25), stammen (venstre, **ett trinn ut, −45**), utstikkeren (ved V1, x = 298) |
| L | 2 | 2 (venstre og høyre side) |
| U | 3 | 2 (begge armene deler (0, 400) → én; midten → høyre side) |
| rektangel | 1 | 1 — som før |

Når to langs-kjeder må ligge på samme side i overlappende bånd (stammen og venstre arm), legges den andre
20 cm lenger ut (25 → 45), og romdimensjonen på den veggen følger: **V10 72 cm** i stedet for 52 (de andre
veggene 52 som før). PDF-luften som trengs for P0378 er 72 + 58 = 130 cm < 150 → `PDF_ROOM_PAD_CM` holder; den
regnes nå likevel per rom (`_pdfRoomPadCm`) så dypere stabling ikke klippes. Hit-testen for å dra
romdimensjoner (`hitAnnotation`/`hitAnnotGizmo`) brukte fortsatt 65 cm for kabel/matte der tegningen bruker 20 —
den traff altså 45 cm utenfor streken; nå samme kilde.

### Gjort

Alt i `index.html`; romdimensjonene V1–Vn, utlegget, marginene og 157-merknaden er urørt.

1. **Felles kantmodell** (blokken «164 · FELLES KANTMODELL …» rett før matteseksjonen):
   - `_dimRoomEdges(room)` — rommets maksimale kollineære, akseparallelle kanter (polygonkanter slås sammen når
     de fortsetter hverandre; vegg-for-vegg-rom med mellompunkter blir ett rektangel), hver med `side` (hvor
     utsiden er, funnet med prøvepunkt 0,5 cm til hver side). Skjeve kanter inngår ikke.
   - `_dimEdgeFacing(model, dir, pc, a0, a1, sign)` — kanten en bredde vender mot: nærmeste kant med riktig side
     som dekker breddens midtpunkt på tvers, regnet fra breddens egen start (en bredde som stikker litt over
     veggen finner den fortsatt → 0 / rødt som før). Ingen kant → ytterboksen (syntetisk kant) → roterte rom
     tegnes som før.
   - `_dimChainLayout(room, dir, items, build)` — tverr-kjeder gruppert per kant, langs-kjeder gruppert per
     (nær vegg, fjern vegg) med plassering: rommets utstrekning i gruppens bånd (`_dimPolyExtentInBand`), vanlig
     side først, så motsatt side, så ett trinn (20 cm) ut, til den ikke kolliderer.
   - `_drawDimChainLayout(layout, stil)` — ÉN tegnerutine for alle tre (før: tre kopier).
   - `_dimBeyondEdgeInside` — fortsetter rommet forbi kantens ende i breddens høyde (B=20 over stammens åpning,
     en kort matte i L-rommets øvre felt), finnes ingen vegg der og veggmålet sløyfes; utenfor rommet → 0, rødt
     som før (mattekjeden).
2. **Folie** `_stripDimChainLayout`, **kabel** `_cableDimChainLayout`, **matte** `_matDimChainData` (samme
   navn og returform som før, men `chains[dir]` er nå et oppsett med `across[]`/`along[]` à `segs`). Segment-
   reglene per type er uendret (folie: cursor/mellomrom ved > 0,1; kabel: vegg → første, CC første to, CC siste
   to, siste → vegg; matte: bånd slås sammen, rødt under nettmargin). Skjeve kabler (`_drawCableSkewDimChain`)
   urørt.
3. **Romdimensjonens avstand** `_roomDimBaseOffCm(room, vegg)` = 32 + 20 per aktiv kjede-type × (1 + antall
   ekstra trinn kjedene av den typen er stablet utenfor akkurat den veggen). Brukes av tegning, `hitAnnotation`
   og `hitAnnotGizmo` (én kilde). Oppsettene huskes per tegneomgang (`_dimLayoutMemo`, tømmes i
   `drawAllDimAnnotations` og i de tre cache-invalideringene).
4. **PDF** `_pdfRoomPadCm(room)` = max(150, største romdim-avstand med PDF-ens brytere + 58) i `_pdfRoomAspect`
   og `_renderRoomToImage` (rektangler: 92 + 58 = 150, som før).
5. **Tester:** ny `_dimChainEdgeRegressionTest` (31 sjekker) og `_matDimChainRegressionTest` tilpasset (H:
   L-rommet måler nå 147,5 til den innvendige veggen, ikke 347,5 til boksen).

### Etter (målt, `measure-etter.json`, `164-app-etter-P0378.png`, `164-pdf-etter-P0378.jpg`)

P0378, de fire tverr-kjedene (hver under sin vegg, i veggens egen bredde):

| Kant | Kjede | Kontroll for hånd |
|---|---|---|
| V11 (y = 360, x 0–310) | 8,2 \| 99 \| 2 \| 99 \| 2 \| 99 \| **0,8** | 310 − 309,2 = 0,8 ✓ |
| V13 (y = 323, x 310–323) | 1,2 \| 19 | 311,2 − 310 = 1,2 ✓; B=20 fortsetter over stammen → ikke noe «→ vegg» |
| V2+V3 (y = 1088, x 323–537) | **9,2** \| 119 \| 2 \| 79 \| **4,8** | 332,2 − 323 = 9,2 ✓; 537 − 532,2 = 4,8 ✓ |
| V7 (y = 323, x 460–824) | **94,2** \| 99 \| 2 \| 99 \| 2 \| 59 \| 8,8 | 554,2 − 460 = 94,2 ✓; 824 − 815,2 = 8,8 ✓ |

Langs: venstre arm 5 \| 350 \| 5 (x = −25), stammen 2,5 \| 1083 \| 2,5 (x = −45), høyre arm + B=20 2,5 \| 320 \| 0,5
(x = 849), utstikkeren 2,5 \| 116 \| 2,5 (x = 298). «22» og «2 over V11» er borte. L (`164-pdf-etter-L.jpg`):
5 \| 99 \| 2 \| 99 under y = 400 og 7 \| 79 \| 114 under y = 200 (før: 5 \| 99 \| 2 \| 99 \| 2 \| 79 \| 114 i ett).
U (`164-pdf-etter-U.jpg`): tre kjeder. L med kabel (`164-pdf-etter-L-kabel.jpg`): 20 \| 20 \| 20 \| **20** (før:
… \| 220 til boksen). L med matte (`164-pdf-etter-L-matte.jpg`): veggmål mot faktisk vegg, ingen falske røde.

**Bit-identisk for rektangler:** lerretshash før/etter lik for rektangel med folie (5e980da2), kabel
(699c94ce), matte (ecce2883) og alle tre (8ad7aae5); PDF-rombildene byte-like (md5). **Presentasjon /
kundelenke** (`present.mjs`): mållenka (`kundeMode 'maal'`) tegner nøyaktig appens 33 kjedetall; forslags-
visningen og ren presentasjon skjuler produktmålene som før (119).

Igjen å se på (spørsmål): V13-kjeden (1,2 \| 19) er klemt mellom romdimensjonene «13 cm» og «37 cm»;
romdimensjonene for innerveggene (V7 364, V11 310) tegnes fortsatt *innvendig* i armen (tyngdepunktregelen,
urørt); to produkttyper i samme rom ligger fortsatt oppå hverandre ved 25 cm.

### Tester

`_dimChainEdgeRegressionTest` **31/31** (kantmodellen, P0378-tallene for hånd, transponert T-rom med vannrette
bredder, rektangel og rektangel med mellompunkter, romdim-avstander 52/72/92, PDF-luft, kabel og matte i L, og
**vaksinen**: ytterboks-regning ville gitt 514,8 som siste mål under venstre arm, kantmodellen gir 0,8).
`_matDimChainRegressionTest` 43/43, `_pdfExportSmokeTest` 55/55, `_pdfPreviewRegressionTest` 84/84,
`_foilRegressionTest` 9/9, `_matFreeRegressionTest` 65/65, `_matPathClickRegressionTest` 28/28,
`_matArrangementRegressionTest` 65/65, `_bgFloorRegressionTest` 31/31, `_accessoryFoilQtyRegressionTest` 84/84,
`_nyttProsjektRegressionTest` 25/25. `_cableZoneRegressionTest` 16/17 — «InSnow 30T finnes i katalogen» er rød
også på gammel kode uten innlogging (katalogen er tom), ikke 164.

Commit: «164: målekjeder per faktisk veggkant i L-/T-/U-rom (delt kantmodell for folie/kabel/matte), rektangler
bit-identiske; lukker serie-157 spm 4». Ikke pushet.

## 165

Kenneth 30.10.2026: «Dialogboks for utskrift PDF: bunnen av tegningen overdekkes av målelinje — bare på visningen, det
vises bra på selve PDF-en.» (P0378 «Rom 2» i 155-forhåndsvisningen, 1,0×.)

Alt er målt uten innlogging på 164-fiksturen (`/tmp/cdp165`, `fx.mjs` = P0378 «Rom 2» gjenskapt fra PDF-en + rektangler
+ L-/U-rom). Harness: `steg0.mjs` (dialog og PDF-rombilde av samme rom, alle tekster og 14-px-etikettbokser regnet
om til verdens-cm), `sammenlign.mjs` (ekte `exportPDF` på gammel kode, port 4001, og ny, port 4000: hash av hvert
rom-/etasjebilde og av hele PDF-en uten dato/ID, dialogbilder ved 1,0× og 1,5×, plantegning, tidsbruk), `tests.mjs`.

### STEG 0 — hvilket ledd som skilte

Kjede**linjene** ligger i cm (25 cm utenfor kanten, 164) og lander likt i dialog og PDF. Alt rundt dem er faste
**piksler**: fonten 10 px, etikettboksen 14 px høy og 12 px over linjen, hakene 8 px, 4 px luft på hjelpelinjene,
157-merknaden 14 px under, romdimensjonenes tekst (og `annotOffsets`, i px), hindringsmålenes 20 px. Dialogen tegnet
i sitt eget lerrets piksler (`opts.outW` = 364 px i det hodeløse vinduet), PDF-en i 300 DPI for den *plasserte*
bredden (P0378: 132 mm → 1559 px). Samme kode, men én piksel er 3,09 cm i dialogen mot 0,72 cm i PDF-en:

| | Dialog før | PDF | Dialog etter |
|---|---|---|---|
| px per cm | 0,324 | 1,387 | tegnet med 1,387, vist med 0,324 |
| 10 px font i verden | 30,9 cm | 7,2 cm | 7,2 cm |
| Boksen «99 cm» under V12 (vegg y = 360) | y 326–370 — **34 cm inn i armen** | y 371–381 — 11 cm under veggen | y 371–381 |
| «0,8 cm» ved x = 310 (stammen begynner ved x = 323) | 109 cm bred, 205–314 | 25 cm bred | 25 cm bred |

Så det var ikke bunnkjeden spesielt: **alle** kjedene, romdimensjonene, 157-merknaden og plantegningens
tekster hadde samme feil, mest synlig der en kjede ligger inntil en annen del av rommet (T-/L-rom). I tillegg
leste dialogen `targetWidthMm` = 180 (standard), mens romsiden plasserer bildet smalere når siden er høydebegrenset
(P0378: 132 mm) — derfor hadde også produktetikettene (051, `_pdfScaleMmPerCm`) en annen størrelse og plassering
i dialogen enn på papiret (FlexFoil-labelen i venstre arm: 48,9/82 i dialogen mot 45,7/96,8 i PDF-en).

### Valgt vei og hvorfor

Dialogen tegner nå i **nøyaktig PDF-ens piksler og papirbredde** og skaleres ned til lerretet (`_pdfPrevFit`):
`_renderRoomToImage`/`_renderFloorToImage` kalles med samme `targetWidthMm` som `exportPDF` (uten `outW`), inn i
et skjult lerret, og `drawImage` krymper det til dialogen; label-boksene og `view.outW/outH` skaleres med samme
faktor, så hjul/dra/label-drag (155) regner i det brukeren ser. Alternativet — gjøre px-leddene cm-baserte — hadde
endret PDF-en for alle rom unntatt ett kalibreringsrom (skalaen varierer med romstørrelsen) og hovedlerretet med.
PDF-veien er urørt.

For at papirbredden skal være *den samme* som eksportens, er sidebudsjettet (spesifikasjonsrader, hindringer/soner,
CC-linje, notater, fryserom) og plasseringen flyttet ut av `exportPDF` til `_pdfRoomPageBudget` /
`_pdfRoomImgLayout` (romside) og `_pdfFloorImgLayout` (plantegning); `exportPDF` leser dem. Notatene brytes med
jsPDF-fonten som før — dialogen lager et midlertidig jsPDF-dokument bare når rommet har notater. En felle på veien:
eksporten leste `doc.internal.pageSize.getHeight()` = 297,00008 mm (841,89 pt), ikke 297 — med 297 ble PDF-en
10 byte kortere (bildene like, plasseringstallene ikke). `PDF_A4_H_MM` = jsPDFs eget tall.

### Resultat

- **P0378 i dialogen** (`165-dialog-foer-P0378.png` → `165-dialog-etter-P0378.png`): kjeden under V12 ligger under
  veggen, ikke oppå; stammen er ren. 1,5× (`165-dialog-etter-P0378-1,5x.png`): følger med. Rektangel
  (`165-dialog-*-rekt.png`) og plantegning (`165-plan-*.png`): samme bilde som før, bare med PDF-ens tekststørrelser.
- **Alle tekster på samme verdenspunkt** i dialog og PDF (steg0 etter: romdimensjoner, kjedetall, etiketter,
  157-merknaden — identiske lister, 0,1 cm-oppløsning); bokser identiske.
- **PDF bit-identisk:** hvert rom-/etasjebilde (10 stk) har samme hash på gammel og ny kode, plassert bredde lik i
  4. desimal (131,9972 / 178,0001 / 125,8126 / 159,6522), og hele PDF-en (1 464 414 byte, uten dato/ID) har samme hash.
- **Tid:** `_pdfPrevDraw` P0378 2,3 ms (før 1,8), plantegning 4,1 ms (før 4,1) i det hodeløse vinduet; største
  romsiden tegnes nå i opptil 2126 px bredde (155 målte 17 ms for det største rommet).

**Funn underveis:** dialogen viser nå sannheten om papiret — kjedetallene er 10 px i et 1559 px bredt bilde, altså
≈ 1,2 mm høye på A4 (P0378), og blir små i dialogen akkurat som på papiret. Før 165 så de store ut i dialogen fordi
dialogen tegnet dem feil. Det er samme sak som serie-154 spm 11 / serie-157 («tekststørrelse på papir»), se spørsmål.

### Tester

`_pdfPreviewRegressionTest` 84 → **96/96**: ny seksjon D — D1 dialogen tegner i PDF-ens piksler (renderW = 2126 for
Stue, lerretet mindre), D2 alle tekster og 14-px-bokser på samme verdens-cm i dialog og PDF, D3 ingen boks ved
bunnkjeden krysser veggen og boksen er PDF-ens 5,3 cm (før: 24 cm over linjen → inne i rommet), D4 kabel-labelens
boks i dialogen → samme verdenssenter som PDF-bildets, D5 1,5×, D6 lange notater krymper bildet i PDF-en og dialogen
følger, D7 plantegningen; **vaksine**: annen papirbredde i dialogen → renderW ≠ PDF-ens. `_pdfExportSmokeTest`
55/55, `_matDimChainRegressionTest` 43/43, `_dimChainEdgeRegressionTest` 31/31. Ingen unntak ved lasting.

Commit: «165: PDF-forhåndsvisningen tegner kjedene med samme verdensgeometri som PDF-en — ingen overlapp i dialogen;
PDF uendret». Ikke pushet.
