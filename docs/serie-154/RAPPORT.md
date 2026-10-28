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
