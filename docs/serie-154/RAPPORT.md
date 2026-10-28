# Serie 154 · PDF — plantegning per etasje

## 154

**Commit:** «154: PDF — plantegning per etasje etter forsiden (_renderFloorToImage), valg og forhåndsvisning i dialogen».
Committet på `main`, **ikke pushet**.

### Hva som er gjort (`index.html`)

- **`S.ui._pdfOverview`** — en liten variant av `_pdfMode` for akkurat plantegningen, ikke en kopi av tegnelogikken:
  - `drawRooms` pass 1: romnavn + **netto** areal vises (papirstørrelse via `_labelFontCm`, navnet 1,2 × produktetikettene,
    vekt 600; ✓/⚠-merket fra planimporten utelates). Ny hjelper `_pdfOverviewFontPx()` ved `_labelFontCm`.
  - `drawAllDimAnnotations`: returnerer straks (målkjeder utenfor rommene av).
  - `drawScaleBar`: av (50 cm-pillen ble en uleselig 1 mm-flekk, se SPØRSMÅL 4).
- **`_renderFloorToImage(floor, opts)`** rett etter `_renderRoomToImage`, samme mekanisme (midlertidig view på hovedlerretet,
  300 DPI, `_pdfMode`, hvit bunn, gjenoppretting i `finally`). Ingen rom er valgt under tegningen, så alle rom går gjennom
  pass 1 og ser like ut. Hjelpere: `PDF_FLOOR_PAD_CM = 100`, `_pdfFloorRooms` (tegnede rom på etasjen: ikke `listDraft`,
  ikke `listMode`), `_pdfFloorStairs` (trappene `drawStairs` ville tegnet med etasjens del aktiv — trapper har `partId`,
  ikke `floorId`), `_pdfFloorBox` (én kilde for bbox, `worldW/H`, aspekt og `landscape = bredere enn høy`),
  `_pdfFloorplanGroups(selIds)` (etasjer med minst ett valgt rom, sortert med `_floorLevelCompare`; tittel «Plantegning»
  når prosjektet har ≤ 1 etasje, ellers «Plantegning – <etasje>»).
- **`exportPDF`:** sidene legges rett før romsidene (altså etter forside og prosjektoversikt). Liggende side når etasjen er
  bredere enn høy — samme grep som trappesidene (`addPage('a4','landscape')`, side 1 byttes ut om plantegningen er første
  seksjon). Overskrift, underlinje «N rom · m² netto · W», bildet skalert til plassen som er igjen etter romlista, Kartverket-
  kreditering når etasjen har kartbakgrunn, og romlista «Rom · Netto m² · Produkt · W» i to kolonner. Radene er
  **Romoversiktens egne** (`floorSummaries`: samme `stats.nettoM2`, `_roomRatedEffectW`, `_roomProductFamilyName`), så
  tallene kan ikke sprike.
- **Dialogen:** «Plantegning (alle rom per etasje)» (`#exp-floorplan`, `opts.floorplan`) mellom Prosjektoversikt og
  Romtegninger, vises bare når prosjektet har rom; på som standard ved mer enn ett rom. Forhåndsvisning
  `_expPreviewSection('floorplan')` viser bildet av første etasje med «‹ Forrige / Etasje 1 av N / Neste ›» når det er flere
  (`_expFloorplanIdx`, nullstilles når dialogen åpnes).
- **Bunnteksten** (siste pass i `exportPDF`) leser nå sidens egen størrelse (avrundet til hele mm): liggende sider fikk før
  ingen bunntekst (tegnet på y = 289 på en 210 mm høy side). Stående sider er bit-identiske. ⚠ Dette er et avvik fra
  «Skal IKKE endre noen annen side»: liggende **trappesider** får nå også bunntekst (se SPØRSMÅL 5).
- **`_pdfExportSmokeTest`:** `kjør(ekstra)` tar overstyringer, stubben logger side per tekst (`smokeSide`), `minSider`
  regner med plantegningene. Ny fixture «to etasjer, tre rom — plantegning (154)» (etasjene lagt inn i feil rekkefølge med
  vilje): side 3 = 1. etasje, side 4 = 2. etasje, begge før første romside, romlista har Bad/Stue med netto 20,0/28,0 og
  ikke Soverom, valget av → ingen «Plantegning» og nøyaktig 2 sider færre, bare Bad valgt → bare 1. etasje, vaksine
  (`_pdfFloorplanGroups` → [] gjør sjekken rød). Rom uten etasjer → tittelen er bare «Plantegning».

### STEG 0

1. **Hva `_pdfMode` skjuler i dag** (lest): infokortene (`drawRoomCards`), romnavn/areal-etiketten (begge pass i
   `drawRooms`), hjørnepunkter, rommets transform-gizmo, matte-/frihåndsgizmo og valgt-bredde-utheving, skjermgulvet for
   etikettstørrelse (`LABEL_MIN_PX`) og papirregelen i `_labelFontCm`, kabel-debug, kartsnapp-hint, hover/drag, bakgrunn
   bare for aktiv etasje (ikke referanser), presentasjonsmodusens regler. Rutenettet skjules via `showGrid = false`, ikke
   `_pdfMode`. **Vises på plantegningen:** romnavn + netto areal (ny gate `_pdfOverview` i pass 1, etiketten tegnes ved
   polygonets punktgjennomsnitt som på skjermen). **Ikke:** infokort, gizmo, hjørner, ✓/⚠-merket, målkjeder, målestokk-pille.
   Funn: `drawScaleBar` er **ikke** gated på `_pdfMode`, så romsidene har i dag en ~1 mm 50 cm-pille nederst til venstre.
2. **Bildestørrelse** (måleprosjekt, 2 etasjer, 8 rom, kabel + folie + matte + hindring + sone, katalogen fra 145):

   | Etasje | bbox rom (cm) | + pad | side | px | JPEG | tid |
   |---|---|---|---|---|---|---|
   | 1. etasje (5 rom) | 1490 × 870 | 1690 × 1070 | liggende | 2600 × 1646 | 164 KB | 39 ms |
   | 2. etasje (3 rom) | 1190 × 400 | 1390 × 600 | liggende | 2600 × 1122 | 107 KB | 14 ms |

   180 mm ved 300 DPI = 2126 px (stående); 267 mm = 3154 px → `MAXPX` 2600 (≈ 247 DPI) på liggende sider. Hele eksporten:

   | | sider | fil | tid (varm, headless) |
   |---|---|---|---|
   | valget av | 15 | 968 KB | ~145 ms |
   | valget på | 17 | 1246 KB | ~166 ms |

   Altså +278 KB og ~+20 ms for to plantegninger. Ikke tungt.
3. **Rekkefølge:** PDF-en sorterer etasjene med `_floorLevelCompare` (første tall i navnet, så `order`) når `floorSummaries`
   bygges; Romoversikten leser samme liste. `_pdfFloorplanGroups` bruker samme komparator — bekreftet i røyktesten med
   etasjene lagt inn omvendt.
4. **Huskes valgene?** Nei — dialogen husker ingen avkrysninger (bare rabatter og tilleggstekst, per prosjekt). Samme som 145:
   ingenting å huske.

### Test

1. **To etasjer, 8 rom:** to plantegning-sider (3 og 4) rett etter forsiden + prosjektoversikten, 1. før 2. etasje, alle rom med
   navn og netto areal, romlista = Romoversiktens tall (Bad 7,5 / FlexFoil 60W / 144 W osv.). Skjermbilder
   `plantegning-1-etasje.png`, `plantegning-2-etasje.png` (pdftoppm, 110 DPI).
2. **Ett rom:** valget finnes, av som standard; på → én side «Plantegning» (røyktest: fixture uten etasjer).
3. **Bare noen rom valgt:** bare etasjer med valgt rom (røyktest: bare Bad → bare «Plantegning – 1. etasje»); alle rom
   tegnes. Se SPØRSMÅL 1 om demping.
4. **Trappeprosjekt uten rom:** valget vises ikke, og `floorplan: true` gir ingen side (7 sider, 0 «Plantegning»-tekster).
5. **Forhåndsvisning:** klikk viser bildet, «Forrige/Neste» blar (`dialog-etasje-1.png`, `dialog-etasje-2.png`).
6. **`_pdfExportSmokeTest` 37/37** (var 25), ingen konsollfeil. **Valget av = identisk:** alle PDF-tekstkall med koordinater
   (738 kall, 15 sider) mot `1d1ce4f` på port 4001 — 0 linjer forskjell. Med valget på: 802 kall, 17 sider.

### Merk

- Rom uten etasje i et prosjekt **med** etasjer får ingen plantegning (`_effectiveActiveFloorId` kan ikke filtrere på «ingen
  etasje» — alle rom ville blitt tegnet). De står i Romoversikten under «Uten etasje». Prosjekt uten etasjer → én side.
- Hurtig prosjektering-rom (`listMode`) har ingen polygon og tegnes ikke, men står i romlista (som i Romoversikten).
- Brukerens egne målelinjer (`drawUserDimLines`) tegnes fortsatt; bare de automatiske kjedene er av.
- Gammel kode kjører på port 4001 fra `/tmp/cdp154/old` (sammenligning); CDP-harness i `/tmp/cdp154` (`smoke.mjs`,
  `measure.mjs`, bruker `/tmp/cdp142/cdp.mjs` og katalogen i `/tmp/cdp145/catalog.json`).

## 155

**Commit:** «155: PDF-dialog — levende forhåndsvisning: zoom/flytt lagres per rom (pdfView), labels kan dras der, Tilbakestill; PDF bruker samme utsnitt».
Committet på `main`, **ikke pushet**.

### STEG 0

**0.1 · Labels på hovedlerretet** (alle fire er egne grener i `canvas`-mousedown/-mousemove/-mouseup, ingen felles funksjon):

| Label | Treff (lerretspx, AABB bygd per `render()`) | Lagres (verdens-cm) | Drag-vei | Angre ved kropps-drag |
|---|---|---|---|---|
| Kabel | `hitCableLabel` → `_cableLabelBounds` | `cable.labelPos` (+ `labelRotation`, `labelScale`) | seed fra `_cableLabelGeom`-senter, offset = peker − labelPos, mousemove skriver `labelPos = s2w(peker) − offset`, mouseup → `_scheduleAutoSave` | **nei** (bare håndtak-drag tar `pushUndo`) |
| Rektangulær matte | `hitMatRectLabel` → `_matRectLabelBounds` | `mat.labelPos` (+ rot/skala) | som kabel | **nei** |
| Frihånds-matte | `hitMatLabel` → `_matLabelBounds` | `matPath.labelPos` (+ rot/skala) | som kabel | **nei** |
| Folie | `hitStripLabel` → `_stripLabelBounds` | `strip.labelPos` (+ rot/skala) | `labelPos` og angre utsatt til første reelle bevegelse (≥ 4 px), seed fra boksens senter | ja |

Treffrekkefølge: kabel → rektangulær matte → frihånds-matte → folie (107-«tre til side» i mellom). Ingen felles «hit + drag»-vei
som kan kalles med et annet lerret/view — men **boksene bygges av `render()` i lerretspiksler for det lerretet som tegnes akkurat
nå**. Etter PDF-tegningen i `_renderRoomToImage` inneholder de altså PDF-bildets koordinater, fram til gjenopprettingen tegner
hovedlerretet på nytt. Det er kroken 155 bruker: `_renderRoomToImage(…, { captureLabels: true })` tar en kopi av de fire lagrene
rett etter tegningen, og dialogen treffer med nøyaktig samme bokser som hovedlerretet ville brukt. Reset: `resetStripLabel`/
`resetCableLabel`/`resetMatLabel`/`resetMatRectLabel` slettet de tre feltene hver for seg — nå via én `_labelClearManual(obj)`.
Fri folie (`foilFree`) har ingen `labelPos` og kan ikke dras noe sted.

**0.2 · Romsiden i `exportPDF`** leser bare `imgRes.url` (`addImage(url, 'JPEG', imgX, y, imgW2, imgH)`); `w`, `h`, `aspect`
leses av ingen. Plasseringen regnes FØR rendringen fra `_pdfRoomAspect(room)` (bbox + 2 × 150 cm) — eneste andre leser er
`_prefsRegressionTest` F. Forhåndsvisningen (`_expPreviewRoom`) leste også bare `url`.

**0.3 · Målt** (headless Chrome, 8 rom/2 etasjer, største rom «Stue» 700 × 500 cm med 12 kabelløp, hindring og label; median av 7):

| Kall | Piksler | Tid |
|---|---|---|
| `_renderRoomToImage` 300 DPI (PDF, 180 mm) | 2126 × 1701 | 17 ms (inkl. JPEG) |
| `_renderRoomToImage` 300 DPI, plassert bredde 139 mm | 1642 × 1314 | 9 ms |
| `_renderRoomToImage` 96 DPI | 680 × 544 | 3 ms |
| **Forhåndsvisningen** (`_pdfPrevDraw`: tegning + kopi + gjenoppretting av hovedlerretet) | 562 × 450 | **1,5 ms** (maks 2,4; 0,7 ved 1,5×) |

300 DPI hadde også vært raskt nok for hjulet, men forhåndsvisningen tegnes i dialoglerretets egen oppløsning (CSS-bredde ×
devicePixelRatio, maks 2) og kopieres rett inn uten JPEG-omvei — skarpt, og ingen base64 per hjulhakk. PDF-en tegnes i 300 DPI som før.

### Hva som er gjort (`index.html`)

- **A · `room.pdfView = { cx, cy, scale }`** (ved `PDF_ROOM_PAD_CM`): `_pdfViewOf(room)` normaliserer (mangler/ugyldig → `null`
  = auto; skala klemmes til 0,5–4). `_renderRoomToImage` leser den: senter = `cx, cy`, verdensbredde = auto ÷ `scale`, verdenshøyde
  likedan — **aspektet er alltid auto-utsnittets**, så `_pdfRoomAspect` trenger ikke lese `pdfView` (sideoppsettet er uavhengig av
  utsnittet, testet). `_pdfScaleMmPerCm = targetWmm / worldW` følger med, så labelene har **samme mm på papiret uansett zoom** (051).
  Lagres med rommet i prosjekt-JSON (`_buildSaveData` sprer hele romobjektet), ingen migrasjon. ⚠ `pushUndo` kopierer rom grunt —
  `pdfView` skrives alltid som nytt objekt.
- **Nye valg i `_renderRoomToImage`** (PDF-veien uendret): `outW` (eksakt pikselbredde), `toCanvas` (pikslene rett inn i et annet
  lerret), `noUrl` (ingen JPEG), `captureLabels` (kopi av label-boksene). Returen har i tillegg `view` (zoom/pan/px/verdensbredde/skala)
  og `labels`.
- **B · `_expPreviewRoom`** viser et `<canvas>` i stedet for `<img>` (`_pdfPrev*`, 230 linjer rett etter): knapperad «Tilbakestill
  utsnitt» (av når auto) · «Labels til auto» (med `confirm`, teller labels) · «Rull for zoom · dra for å flytte · dra labels ·
  dobbeltklikk label = auto» · gjeldende zoom «1,46×». Hjul = zoom rundt pekeren (verdenspunktet under pekeren står stille), dra på
  tomt område = flytt, begge skriver `room.pdfView` og tegner på nytt via rAF. Dra på en label = `labelPos` (seed fra boksens senter,
  samme offset-regning som hovedlerretet; bare rommets egne objekter). Dobbeltklikk på label = `_labelClearManual`. **Ett angresteg per
  bevegelse** (hjul-serie / ett drag), `_scheduleAutoSave` etterpå (→ `_markProjectDirty` via `pushUndo`). Klikk uten bevegelse
  (< 3 px) endrer ingenting. Skrivebeskyttet vindu (060): alt vises, ingenting kan endres, teksten sier det. ‹ Forrige · Rom i av N ·
  Neste › nederst. Rommet velges aldri på hovedlerretet; hovedlerretet tegnes på nytt ved hver forhåndsvisning (gjenopprettingen), så
  en flyttet label synes der med én gang. Rom uten polygon (kalkyle) får tekst i stedet for lerret.
- **C · PDF-en** går gjennom samme `_renderRoomToImage`, så romsiden viser nøyaktig forhåndsvisningen (300 DPI). Målkjedene tegnes som
  før og klippes av kanten.
- **`_pdfExportSmokeTest`** 37 → 42: stubben logger `addImage` (side, x, y, w, h, JPEG-lengde); med `pdfView` på kabelrommet: samme
  sideantall, samme bildeplassering på alle sider, samme tekst (revisjonen normalisert), romsidens JPEG er en annen; vaksine
  (`_pdfViewOf → null` gjør bildet auto igjen).
- **Ny `_pdfPreviewRegressionTest()` 57/57** (rett etter røyktesten): A1–A3 (`view` auto, skala 2 → bredde halvert, senter fra
  `pdfView`, aspekt og pikselstørrelse uendret, labelboks like bred = fast mm på papiret, NaN → auto, 9 → 4, 0,1 → 0,5,
  tilstand gjenopprettet) · B0–B12 (canvas ikke img, rom uvalgt, hjul i senter → 1,1× med senter i ro, tre hjul = ett angresteg, hjul
  ved 10 %/10 % holder verdenspunktet i ro, dra 50 px → senter −50/sc, label-drag kabel 40/20 px = samme forskyvning i bildet og
  hovedlerretet tegner labelen på `labelPos`, folie- og matte-label, klikk uten bevegelse, dobbeltklikk → auto for akkurat den,
  «Labels til auto» spør «Tilbakestill 2 labels i «Stue»…» / nei / ja / toast når ingen, «Tilbakestill utsnitt», `pdfView` i
  `_buildSaveData` og 1,3× ved gjenåpning, skrivebeskyttet, ‹ › blar uten å røre avkryssingen) · vaksine.

### Delt med hovedlerretet / nytt

Delt: `_renderRoomToImage` (hele tegningen, `_pdfMode`, gjenoppretting), label-boksene (`_*LabelBounds`), `labelPos`-feltene og
offset-regningen, `_labelClearManual`, `_pdfRoomAspect`, `pushUndo`/`_scheduleAutoSave`-gatene (060/030). Nytt: `pdfView`-lesingen,
`_pdfPrev*` (hendelser på dialoglerretet, zoom rundt pekeren, undo-per-bevegelse), fire valg i `_renderRoomToImage`.

### Test

1. **Zoom 1,46× + flytt i forhåndsvisningen** (`155-dialog-foer.png` → `155-dialog-zoom.png`) → `pdfView {cx 685,7, cy 237, scale 1,464}`
   i `_buildSaveData` → PDF-romsiden viser samme utsnitt (`155-romside-pdfview.png`, mot `155-romside-auto.png`). Gjenåpning:
   forhåndsvisningen starter på lagret zoom (test B10). «Tilbakestill utsnitt» → auto.
2. **Label-drag** (`155-dialog-label.png`): kabel-labelen dratt 80/−70 px i dialogen → `labelPos` satt, hovedlerretet viser den der
   (`155-hovedlerret.png`) og PDF-en også. Dobbeltklikk → auto (test B7). Folie- og matte-label likedan (B5).
3. **Rom uten `pdfView` — bit-identisk med 46f1c67** (gammel kode på port 4003): SHA-256 av JPEG-en fra `_renderRoomToImage` lik
   for alle 8 rom; hele PDF-en (17 sider): 807 tekstkall med koordinater like, alle `addImage`-plasseringer like, 1241 KB begge.
4. **‹ ›** blar rom, avkryssingen uendret (B12).
5. **Ytelse:** hjul-zoom på største rom **1,5 ms** per tegning (tabellen over). PDF-eksport 8 rom + 2 plantegninger: gammel
   149/150/154/194 ms, ny 147/148/149/175 ms (4 kjøringer) — innenfor ±10 %. Med `pdfView` på Stue: 147 ms, 1232 KB.
6. `_pdfExportSmokeTest` 42/42, `_pdfPreviewRegressionTest` 57/57, `_prefsRegressionTest` 47, `_matPathClickRegressionTest` 28,
   `_roomMoveRegressionTest` 42, `_foilRegressionTest` 9, `_matArrangementRegressionTest` 65, `_matPathEqualizeRegressionTest` 56,
   `_matFreeRegressionTest` 65 — alle grønne, ingen konsollfeil.

### Funn

- På hovedlerretet er **kropps-drag av kabel-, matte- og frihåndsmatte-label ikke angrebart** (ingen `pushUndo`; bare folie og
  håndtakene tar snapshot). Dialogen tar alltid ett angresteg. Ikke rørt på lerretet (utenfor 155).
- Målkjedetekstene («V1 700 cm») følger ikke papirregelen (051) — de er små på romsiden uansett utsnitt (fantes før 155).
- CDP-harness i `/tmp/cdp155` (`fixture.mjs`, `measure0.mjs`, `preview-test.mjs`, `compare.mjs`, `run-tests.mjs`, `shots.mjs`);
  gammel kode (46f1c67) på port 4003 fra `/tmp/cdp155/old`. ⚠ Port 4002 er opptatt av en Python-tjeneste — ikke Varmeplan.
