# 162 · Plantegninger lekker mellom etasjer — måling, årsak og fiks

Fredrik (via Kenneth 30.10.2026): «plantegning plan 1 legger seg også i plan 2», og «plantegning for plan 3 blir
med inn i plan 2 når han bytter mellom etasje». Begge er reprodusert på syntetiske prosjekter (tre etasjer,
`docs/162/bilder/`), og begge har én felles rot: **målretasjen ble avgjort da fila var ferdig lastet, ikke da
importen startet** — og uten valgt etasje ble den `'__global__'`, en nøkkel tegnefilteret viste på *alle* etasjer.

Harness: `/tmp/cdp162` (headless Chrome på 9333, `steg0.mjs` = målingene, `tests.mjs` = testbatteriet,
`shots.mjs` = skjermbildene). Gammel kode (045f7ae) servert fra `/tmp/cdp162/old` på port 4010.
Alt er målt uten innlogging (`_restoreProject` på et syntetisk prosjekt) — ingen ekte prosjekter er rørt.

## STEG 0 — alle importveier til `S.bgs` / `S.bgRefs` (målt FØR endring, 045f7ae)

«Før/etter await» = om målretasjen leses før eller etter at fila er lest/rendret. «Global?» = kunne den lande på
`'__global__'` i et prosjekt MED etasjer.

| # | Inngang | Kjede | Hvor floorId ble bestemt | Før/etter await | Global? | Målt |
|---|---|---|---|---|---|---|
| 1 | Etasjerad «Legg til plantegning» | `_addBgToFloor` → `bg-file-inp` → `handleBgFile` → `_loadFileAsBackground` | global `_bgImportTargetFloorId`, lest i `_pdfBgLoad`/`_loadBgDwg` **etter** await; raster leste `activeBg()` etter FileReader/Image | etter | nei (mål satt) | b3: riktig alene — men **c1: dobbeltimport, første fil FORSVANT** (B overskrev målet, A havnet på Bs etasje og ble så overskrevet av B) |
| 2 | «Bytt plantegning» (etasjerad, ⋯-meny, høyreklikk) | `_replaceFloorBg` → som 1, pluss global `_bgReplaceFloorId` | globale variabler, lest etter await | etter | nei | samme overskrivingsrisiko som 1 |
| 3 | Verktøylinje «Importer plantegning», tom-tilstand, høyreklikk på tomt lerret | `_emptyPickImport` → `_startImportFile` → `_rasterMethodChoice` → `_rasterChoose` → `_loadFileAsBackground` / `_autoReadStart` / `_planStartFraFil` | `S.ui.activeFloorId` i `_pdfBgLoad`/`_loadBgDwg`/`_installBgImage` | **etter** | **ja** når aktiv etasje er `null` eller strengen `'__global__'` | **b1 (PDF) og b2 (raster): startet på Plan 3, byttet til Plan 2 underveis → landet på Plan 2.** a1/a2: uten aktiv etasje → `'__global__'`, vist på alle tre etasjer |
| 4 | Dra-og-slipp på lerretet | `_canvasFileDrop` → `_startImportFile` (som 3) | som 3 | etter | ja | som 3 |
| 5 | Dra-og-slipp på en etasjerad | `_floorRowDrop` → `_activateFloor(id)` → `_startImportFile` | aktiverer etasjen først, men leser aktiv etasje etter await | etter | nei | bytte underveis flytter tegningen (som b1) |
| 6 | Startskjermens slippsone / «Importer» | `_emptyDrop` / `_emptyPickImport` (som 3) | som 3 | etter | ja | som 3 |
| 7 | Slipp på etasje som alt har plantegning | `_dropTargetChoice` → `_dropTargetChoose` (bytt / ny versjon / ny etasje) | bundet ved slippet (`fl.id`) — men via de globale variablene | etter (globalene) | nei | overskrivbar av ny import |
| 8 | Flerside-PDF | `_pdfShowPagePicker` → `_pdfPagePickerShowModal` → `_pdfPagePickerRun` | «(denne)» fra global etter miniatyr-await; side→etasje låses ved «Importer» (riktig) | blandet | nei | d1: «(denne)» riktig; **duplikat mulig** (Plan 3 på rad 2, så Plan 3 på rad 1 → begge Plan 3); **d2: etasje slettet underveis → siden skrevet til `S.bgs[3]` for en etasje som ikke finnes (usynlig, evig), neste side fikk stille en «Ny etasje», aktiv etasje = den slettede** |
| 9 | Liste-import «klikk et kjent mål» | `_listImportStartTwoPoint` → `_loadBgPdf` | aktiv etasje etter await | etter | ja | ikke kjørt (krever liste-modulen), samme kode som 3 |
| 10 | Auto-les rom | `_autoReadStart` → `_loadBgPdf` | aktiv etasje etter await | etter | ja | samme kode som 3 |
| 11 | Plan/vegg-sjekk (046) | `_planStartFraFil` → `_loadFileAsBackground` + poll på `_planBg()` (aktiv etasje) | aktiv etasje etter await, og pollet fulgte aktiv etasje | etter | ja | samme kode som 3 |
| 12 | Kart (005) | `_roofOpenDialog(floorId)` → `_installGeoBackground(d.floorId)` | bundet i dialogen ved åpning | **før** | nei | trygg — urørt |
| 13 | Åpning (`_restoreProject`) | nøkler fra `data.bgs`; gammel enkelt-bakgrunn `data.bg` → `'__global__'` (bare når `data.bgs` mangler helt) | — | **ja** (gammel `__global__` lastes rett inn) | a3: `__global__` + tre etasjer → vist på alle |
| 14 | bgLayers-migrasjonen ved åpning | oppretter nye etasjer KUN når `data.bgLayers` har >1 lag på en nøkkel — appen har aldri skrevet `bgLayers` | — | nei | treffer ikke Fredrik |
| 15 | Duplisering (`_duplicateProject`) | ren JSON-kopi av `data` | arver originalens nøkler | — | arver | ryddes ved åpning (13) |
| 16 | «+ Ny etasje med plantegning» | `confirmAddFloorWithBg` → `setActiveBgFloor` → `bg-file-inp` | aktiv etasje etter await | etter | nei | som 3 ved bytte |
| 17 | Etasjeradens kart-knapp | `setActiveBgFloor(fl.id); openBgImportPanel()` | aktiv etasje etter await | etter | nei | som 3 ved bytte |

I tillegg: `setActiveBgFloor(null)` satte `activeFloorId` til **strengen** `'__global__'` (`!= null`), så fallbacken
`activeFloorId != null ? activeFloorId : '__global__'` traff den rett inn på globalnøkkelen (a2: `typeof` = string).

### Rådata (fra `steg0.json`, gammel kode)

- **a1** aktiv etasje `null`, import PNG → `S.bgs.__global__`, `visiblePerFloor`: Plan 1/2/3 alle viser tegningen.
- **a2** `setActiveBgFloor(null)` → `activeFloorId = '__global__'` (string) → samme som a1.
- **a3** åpning med `bgs.__global__` + 3 etasjer → vist på alle tre.
- **b1** PDF startet på Plan 3, `_activateFloor(2)` 30 ms senere → `S.bgs[2] = Plan_3_tegning.pdf`. **b2** raster: samme.
- **b3** via etasjeraden (mål satt) → riktig (Plan 3).
- **c1** to importer rett etter hverandre (A→Plan 1, B→Plan 2) → bare `S.bgs[2] = B`; **A borte**, Plan 1 tom.
- **d1** flerside: «(denne)» på Plan 1 (riktig), men rad 1 og rad 2 kunne begge stå på Plan 3.
- **d2** flerside med Plan 3 slettet underveis → `S.bgs[3] = Fler.pdf#1` (foreldreløs), «Ny etasje» opprettet for side 2,
  `activeFloorId = 3` (slettet).

## Hvilke hull traff Fredrik

- **«Plan 1 vises også i plan 2»** = en plantegning på `'__global__'` (rad 3/6/13). Nøyaktig dette symptomet kan bare
  `'__global__'` gi — ingen etasjenøkkel tegnes på en annen etasje. Hvordan den havnet der kan jeg ikke måle uten
  prosjektet hans: importert fra verktøylinja/slipp uten aktiv etasje (`null` etter sletting av siste etasje, eller
  strengen fra `setActiveBgFloor(null)`), eller en gammel enkelt-bakgrunn. Tellesnutten under svarer på om det er slik.
- **«Plan 3 havner i plan 2 ved etasjebytte»** = rad 3/4/5/16/17: målretasjen lest etter await (b1/b2). Byttet han
  etasje mens en stor PDF ble lest, landet den der han sto da. Dobbeltimport (c1) gjør det samme og verre.

## Gjort (commit 162)

1. **Import-kontekst** (`_bgImportCtx`, blokken «162 · IMPORT-KONTEKST» ved `_addBgToFloor`): hver import bærer
   `{ floorId, replace, keepTransform, fallback }` som **parameter** gjennom hele kjeden — `handleBgFile` →
   `_loadFileAsBackground(file, ctx)` → `_loadBgPdf/_pdfBgLoad`, `_loadBgDwg`, `_installBgImage`; `_startImportFile`
   → `_startImportFileRaster` → `_rasterMethodChoice/_rasterChoose` → `_planStartFraFil/_autoReadStart`;
   `_dropTargetChoose`; `_listImportStartTwoPoint`. Konteksten lages synkront når fila velges/slippes. De globale
   `_bgImportTargetFloorId`/`_bgReplaceFloorId`/`_bgReplaceKeepTransform` er fjernet. Det eneste som ligger mellom to
   steg er `_bgPendingImport` (fra `bg-file-inp.click()` til `change`) — OS-dialogen er modal, og `cancel` nullstiller.
   Etter await brukes `_bgCtxResolveFloor(ctx)`: finnes ikke etasjen lenger → `_bgCtxAbort` (toast, ingenting skrives).
   `_installBgImageForFloor` har samme vakt (`_bgFloorKeyAlive`) og returnerer `null`; `_pdfRenderPageToBg` løser
   med `false` da.
2. **`'__global__'` bare uten etasjer.** `_bgImportFloorNow`: aktiv etasje hvis den finnes, ellers første etasje i
   aktiv del med `fallback` → toast «Ingen etasje var valgt — plantegningen er lagt på Plan 1». `setActiveBgFloor(null)`
   gir første etasje når prosjektet har etasjer. `activeBg()`/`selectBgLayer`/`_activeBgLayer` går via `_bgActiveKey()`.
   Tegnefilteret `_bgKeyOnActiveFloor` viser `'__global__'` **bare** når prosjektet ikke har etasjer (sikringen bak alt).
3. **Opprydding ved åpning** (`_bgMigrateGlobalKeys` i `_restoreProject`, før bildene lastes): `__global__`-bakgrunn
   og -referanser flyttes til etasjen hvis rom overlapper tegningens boks (entydig), ellers første etasje i delen.
   Har målet alt en aktiv plantegning, blir den globale en referanse der. Konsoll-logg + toast (ikke i `?present=`/
   `?kunde=`). I minnet, som 137/E — skyen skrives først når brukeren endrer noe.
4. **«Flytt til etasje …»** (`_bgMoveToFloor`/`_bgMoveMenu`) i ⋯-menyen i ctxbaren og i etasjeradens høyreklikkmeny:
   samme objekt flyttes (kalibrering/plassering urørt), referanser, planvegger (046) og `S.geo` følger med, angre
   (`pushUndo`), 060-gaten. Har målet alt en tegning, blir den referanse (som «Legg til som ny versjon»).
5. **Flerside-velgeren:** «(denne)» og BYTT-etasjen fra konteksten (ikke globale/aktiv etasje etter miniatyr-await);
   lista låses ved «Importer» (var alt slik) og vaktes mot duplikater; nedtrekket **tilbakestiller** den andre raden
   når samme etasje velges to steder (før ble den bare grået ut, og eget valg var unntatt); en etasje slettet
   underveis → siden hoppes over med toast «Side N ble ikke importert — etasjen ble slettet underveis», resten
   importeres; navigeringen etterpå går bare til en etasje som finnes. Modalen ellers urørt.
6. **`_bgFloorRegressionTest()`** (31 sjekker, T1–T10): PDF og raster bundet til Plan 3 lander på Plan 3 når aktiv
   etasje byttes til Plan 2 under lasting (stubbet pdf.js med utsatt promise); fallback uten aktiv etasje; dobbelt-
   import; etasje slettet underveis; `__global__` nektes med etasjer og filteret viser aldri en annen etasjes
   tegning; prosjekt uten etasjer uendret; opprydding (rom-overlapp, første etasje, referanse); «Flytt til etasje»;
   velgerens «(denne)»/duplikat/slettet etasje; de gamle globalene finnes ikke.

### Vaksine

`_bgCtxResolveFloor = (ctx) => S.ui.activeFloorId` (fallbacken etter await gjeninnført) → T1, T1 aktiv etasje,
T1b, T1c, T2, T3 røde (`tests.mjs 4000 vaksine`). Med ekte kode: 31/31 grønne.

### Testbatteri (ny kode, port 4000 — og gammel, port 4010)

| Test | Før (045f7ae) | Etter |
|---|---|---|
| `_bgFloorRegressionTest` | finnes ikke | **31/31 grønn** |
| `_pdfExportSmokeTest` | 55 grønn | 55 grønn |
| `_pdfPreviewRegressionTest` | 84 grønn | 84 grønn |
| `_planRegressionTest` | 87 grønn | 87 grønn (to kildetekst-sjekker på `_rasterChoose` godtar nå `(file, ctx)`) |
| `_geoRegressionTest` | 24 grønn | 24 grønn |
| `_nyttProsjektRegressionTest` | 25 grønn | 25 grønn |
| `_kundeforslagRegressionTest` | rød (katalog ikke lastet — ingen innlogging) | samme, uendret |
| `_prosjektlaasRegressionTest` | 7 røde (harnessens autosave-stubber og «Kenneth» uten innlogging) | samme 7, uendret |

Målingene på nytt etter fiksen (`steg0.mjs 4000`): a1/a2 → Plan 1 med toast; a3 → Plan 1 med toast; b1/b2 → Plan 3;
c1 → A på Plan 1, B på Plan 2; d1 → «(denne)» Plan 1, duplikat tilbakestilt (`rad2opt3disabled: true`); d2 → ingen
foreldreløs nøkkel, aktiv etasje finnes.

## Skjermbilder (`docs/162/bilder/`)

- `foer-a-global-plan2.png` — gammel kode: «PLAN 1»-tegningen på `__global__` vises mens Plan 2 er aktiv.
- `etter-a-global-plan2.png` — ny kode, samme prosjekt: Plan 2 er tom, tegningen ligger under Plan 1 i sidepanelet.
- `foer-b-plan2.png` — gammel: PDF startet på Plan 3, etasjebytte under lasting → «PLAN_3.pdf» ligger under Plan 2.
- `etter-b-plan3.png` — ny: samme forløp, tegningen ligger under Plan 3 (Plan 2 tom, `etter-b-plan2.png`).
- `etter-flytt-til-etasje.png` — etter «Flytt plantegningen til etasje … → Plan 2».

## Tellesnutt (STEG 0.4) — kjør innlogget i konsollen på dashbordet, bare telling

```js
(async () => {
  const { data, error } = await _db.from('romtegner_projects').select('id,name,data').limit(1000);
  if (error) { console.error(error); return; }
  const rader = [];
  for (const r of data) {
    const d = r.data || {}; const floors = (d.floors || []).length;
    const gBg = !!(d.bgs && d.bgs.__global__ && d.bgs.__global__.dataUrl) || (!d.bgs && !!(d.bg && d.bg.dataUrl));
    const gRef = ((d.bgRefs || {}).__global__ || []).filter(x => x && x.dataUrl).length;
    if (gBg || gRef) rader.push({ id: r.id, navn: r.name || (d.project || {}).name, etasjer: floors, globalBg: gBg, globalRefs: gRef, treffer: floors > 0 });
  }
  console.table(rader);
  console.log(`${data.length} prosjekter lest · ${rader.length} med noe på __global__ · ${rader.filter(x => x.treffer).length} av dem HAR etasjer (= vist på alle etasjer før 162)`);
})();
```

## Hva Fredrik må gjøre

1. Oppdatere (last siden på nytt) og **åpne prosjektet**: ligger plan 1-tegningen på `__global__`, flyttes den ved
   åpning med toast «1 plantegning var ikke knyttet til en etasje — lagt på <etasje>». Er det feil etasje: høyreklikk
   etasjeraden → «Flytt plantegningen til etasje …» (eller ⋯ i Bakgrunn-linja → «Flytt til etasje …»). Kalibreringen
   beholdes. Lagre.
2. Plan 3-tegningen som ligger under plan 2: samme «Flytt til etasje … → Plan 3». Ingen ny import, ingen ny
   kalibrering.
3. Heretter: importer gjerne fra etasjeraden, bytt etasje fritt mens den laster — tegningen lander der importen startet.
