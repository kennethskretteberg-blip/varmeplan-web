# 176 · Trapp: velg trappedesign (Rett / Hestesko) og ny hesteskotrapp (Regel 23)

Branch `176-hesteskotrapp` (egen worktree `~/Code/varmeplan-web-176`). **Ikke pushet, ikke flettet inn i main.**
Commit: «176: trapp — velg trappedesign (rett/hestesko) og ny hesteskotrapp med kabel som følger U-en (Regel 23)».
Alt ligger i `index.html`, og nesten alt står samlet i tre nye blokker i trappedelen («176 · HESTESKOTRAPP»,
«— TEGNING», «VELG TRAPPEDESIGN» / «HESTESKOBYGGEREN»). I eksisterende funksjoner er det bare små kroker.

Harness: headless Chrome på port 9376. Ny kode er servert på 4176, HEAD (`3c6e746`) via `git show` på 4177 (ingen
ekstra worktree). Katalogen er syntetisk (InSnow 30T-lengder). Ingen skyprosjekter er rørt.

## Kort svar

- **Designvalget** kommer først når man legger til en trapp, med kort i samme stil som romform-valget: Rett trapp ·
  Hesteskotrapp · Fritegnet trapp (grått, «kommer», kan ikke velges). Lagres som `stair.design = 'horseshoe'`.
  Feltet settes **bare** på hesteskotrapper. Mangler det, er trappa rett.
- **Hesteskobyggeren** har disse feltene: toppflate B × D, antall hesteskotrinn, inntrinn foran og sider (sider følger
  foran til det endres), opptrinnshøyde, avstand opptrinn / nese / sider, maks CC og kabel. Forhåndsvisningen viser de
  nestede U-ene med mål og **ytre totalmål 562 × 116 cm**. Kabelbehovet regnes av motoren.
- **Motoren** følger Regel 23 / alternativ A. Strengene er U-linjer med fast avstand t fra den indre konturen. Lengden
  regnes langs senterlinja med skarpe hjørner, svinger telles ikke, og opptrinn legges til. Sidemarginen er
  justeringsvariabelen (2·Δ per streng). Forslag, manuelt kabelsett, låst margin og statustersklene går gjennom
  **samme** kode som før, fordi den lineære margin-matematikken (`_stairMarginProbe`) holder uendret for U.
- **Kontrolltallene stemmer eksakt:** 3 680 + 3 460 = **7 140 cm** + 17 cm opptrinn = 7 157 cm.
- **Rette trapper er uendret**, og det er målt. De fem gamle trapptestene gir identiske verdier mot HEAD. Sju rette
  trappevarianter (repos, topp/bunn, kabelstart topp, bred, CC 13) gir identisk ruting, skjermpiksler, PDF-bilder,
  detaljutsnitt, sidevisning og PDF-tabelldata.

## STEG 0 (målt før endring)

### 0.1 Hvordan en trapp lagres, og hvor rektangelet er antatt

- `stair.segments` = `[{type:'steps', width_cm, stepDepth_cm, stepHeight_cm, stepCount, zone?}, {type:'landing', width_cm, depth_cm}]`
  pluss `buildDirection` og de gamle flate feltene (`width_cm`, `step_*`). Byggeren redigerer en kopi
  (`_stairBuilderSegs`).
- `_generateStairSurfaces` folder segmentene ut til `surfaces = [{type, segIdx, stepIdx, x_cm: 0, y_cm, w_cm, d_cm, stepHeight_cm}]`.
  Hver flate er **et rektangel** stablet i y, alltid med `x = 0`.
- `stair.dims` er brukerens egne mållinjer (087) i trapp-lokale cm. `_stairGeometryDims` er de automatiske målene,
  regnet fra flatene.

Rektangelantakelsen (`w × d`, strengen = rett linje fra `x = margin` til `w − margin` i høyde `y + pos`) ligger her:

| funksjon | antakelse | 176 |
|---|---|---|
| `_generateStairSurfaces` | rektangler stablet i y | egen gren: `_generateHorseshoeSurfaces` |
| `generateStairCable` | `runLength = w − 2m`, lik for alle strenger på flata | U: lengde per streng langs U-linja (buelengde-koordinater) |
| `_stairCableLength` (estimat) | `N × (w − 2m)` | hestesko: delegerer til motoren |
| `_drawStairPlan` | `fillRect`, rette strenger, buer i x-kantene, overganger mellom x-kantene | hestesko: `_drawStairPlanHs` |
| `_stairDrawToCanvas` (PDF) | som planen | hestesko: `_stairDrawToCanvasHs` (samme tegner) |
| `_stairCableEndpoints` | `x_cm = sf.x_cm + s` (langs x) | uendret. Tegneren leser `s` som buelengde |
| `_stairSurfaceBands` | bånd etter y | hestesko: aldri bånd |
| `_renderStairDetailInsets` | `N × (w − 2m)` i billedteksten | U: sum fra rutingen |
| `_stairSoneGeometryBlocks` | `N × første streng` | U: sum fra rutingen, streng = snitt |
| `_stairMarginProbe`, `_stairFitLockedMargin`, `_stairSolveLockedCableSet`, `_stairMaxEdgeMarginCm` | `minSurfW` fra `w_cm` (75 % og geometrisk tak) | `_stairSurfSpanCm`: `w_cm` for rektangler (uendret), indre kontur for U |
| `_hitStairSurface`, `_stairDimSnap`, `_stairPlanBounds` | rektangel per flate | U bærer frontbåndet som rektangel (godt nok for treff/snap) |
| `_drawStairSide`, `_stairDrawSideToCanvas`, `_stairGeometryDims('side')` | bare dybde og høyde | **virker uendret** som et snitt gjennom fronten |
| `_regenerateStairCable`, `_stairProductRows`, `_stairCableLengthBreakdown`, `_stairFitFromLengths`, `_generateStairProposals` | formuavhengige (leser runs/cables/motoren) | uendret, med ett unntak: `runsPerStep` fra forslaget ignoreres for hestesko |

### 0.2 Utendørs

Det finnes **ikke** noe flagg per trapp. Trappemodulen er utendørs per definisjon: `part.moduleType === 'stair'` gir
kategori `'outdoor'` (sammen med snø). Trappa får produktgruppe InSnow 30T 230V (`preferredFamily`), maks CC
`STAIR_DEFAULT_MAX_CC_CM = 10`, leverandørens `max_spacing_mm` og effektvarsel under 250 W/m². En hesteskotrapp er en
trapp i samme modul og arver alt dette uten nye felt.

### 0.3 Romform-valget

`#modal-shape` (rundt linje 2461): `.shape-grid` med `.shape-card` (ikon, `.shape-nm`, `.shape-desc`). Kort som ikke
er tilgjengelige, får `.dim` + `.shape-badge`, og valget styres av `selShape`/`updShapeCards`/`confirmShape`.
Trappedesign-valget bruker **de samme CSS-klassene**, inkludert `.dim` + «KOMMER»-merket.

### 0.4 Soner

Sonene henger på segmentene (`seg.zone` → `_stairZoneRanges`). Motoren leser innstillingene per flate
(`_stairSurfSettings`) og ville tålt en hestesko. Problemet er at en hesteskotrapp bærer **ett** bakoverkompatibelt
segment uten sone og ingen segmentliste i byggeren. Soner er derfor av og skjult for hestesko (SPØRSMÅL 8).

### 0.5 Anker og rotasjon

`stair.x_cm`/`y_cm` er øvre venstre hjørne av planutsnittet, og flatene ligger i trapp-lokale cm. Trapper kan **ikke**
roteres i planen. Det finnes ikke noe rotasjonsfelt, bare liggende PDF-bilde (`_stairRotateCanvas90`). Ved
redigering holder rett trapp «ankersegmentet» i ro (110).

Hesteskotrappa har bakkanten på lokal `y = 0` og x = 0 i ytterste venstre arm. Når antall trinn eller inntrinn sider
endres, flyttes `x_cm` med Δ(antall · inntrinn sider). Da står toppflaten og bakkanten i ro i verden. Målt i testen:
redigering fra 1 til 4 trinn flytter dem ikke.

## Modellen (Regel 23)

- **Lagring:** `stair.design = 'horseshoe'` og `stair.horseshoe = { topW_cm, topD_cm, count, front_cm, side_cm (null = følger front), stepHeight_cm }`.
  `stair.segments` er ett bakoverkompatibelt `steps`-segment (ingen sone, ingen repos).
- **Flater:** `surfaces[0]` er det ytterste hesteskotrinnet (nederst, der kabelen starter, Regel 14), så innover, og
  toppflaten sist. Nummereringen er Kenneths (toppflaten = trinn 1). En hesteskoflate bærer `shape:'u'`, `hsInner` og
  `hsWidths`:
  - `hsInner` er den indre konturen som en åpen polylinje fra bakkant til bakkant.
  - `hsWidths` er båndbredden per kant: sider / foran / sider.
- **Generelt, ikke bare rektangulære U-er:** `_stairOffsetOpen(polylinje, bredde per kant)` forskyver en vilkårlig
  åpen kontur og skjærer endene mot baklinja. En streng er konturen forskjøvet med `riser + f·(bredde − riser − nese)`
  per kant. En fritegnet trinnkontur kan senere gå samme vei: gi `hsInner` som polygonets indre kant og én bredde per
  kant.
- **Antall:** `N = ceil(brukbar / maks CC) + 1` fra det **bredeste** båndet (like inntrinn gir samme tall).
  CC langs fronten = brukbar / (N − 1).
- **Retning:** for hestesko setter motoren strengens *faktiske* retning, med paritetskjeden over flategrensen. Med 5
  strenger (oddetall) snur inngangssiden fra trinn til trinn. Tegning, start/slutt og skjøter leser den.

## Kontrolltall (eksempelmarginer 3 / 3 / 5, maks CC 10, bare i testen)

| | brukbar | N | CC | strenger (cm) | sum |
|---|---|---|---|---|---|
| Trinn 1, rektangel 470 × 70 | 64 | 8 | 9,14 | 8 × 460 | **3 680** |
| Trinn 2, hestesko 46 | 40 | 5 | 10,0 | t = 3/13/23/33/43 → 612 / 652 / 692 / 732 / 772 | **3 460** |
| Opptrinn | | | | 1 × 17 | 17 |
| **Totalt** | | | | | **7 140 + 17 = 7 157** |

Alle tallene er målt fra rutingen (`stair.runs`), ikke regnet på nytt. Formelen `Wi + 2·Di + 4t − 2·margin` stemmer
med avvik 0 for alle fem strengene.

**Forslag** (testkatalog): Forslag A = 1 × 70 m, sidemargin løst til 11 cm (7 157 − 2·13·6 = 7 001), «Passer»,
anbefalt. PDF-en viser trinn 2: 3 400 + trinn 1: 3 584 + 17 = 7 001 cm = 70,0 m, som er samme tall i trinntabell,
trappeoversikt og materialliste.

## Test

`_stairHorseshoeRegressionTest()`: **35/35**.

1. Ytre mål 562 × 116 og alle kontrolltallene over.
2. Fire hesteskotrinn (300 × 60, 4 × 40):
   - Flatene er 620×220 > 540×180 > 460×140 > 380×100 > 300×60.
   - Alle deler bakkanten y = 0, og kjeden går 0 → 4.
   - Største hopp over et opptrinn er 8,2 cm i plan, og strengene veksler retning (ingen Y-splitt).
   - Redigering fra 1 til 4 trinn flytter ikke toppflaten.
3. +1 cm sidemargin: 13 → 13 strenger, hver nøyaktig 2 cm kortere, CC uendret (Regel 7).
4. Forslag gir én kabel som går opp, start på ytterste trinn og slutt på toppflaten. Låst 2 cm gir «2,4 m for kort»
   med udekket løp stiplet rødt. Låst 40 cm gir «7,5 m til overs!».
5. Regel 9: ruting = dekket = materialliste (`_stairProductRows`) = panel/PDF (`_stairCableLengthBreakdown`) =
   tegnede strenger (summert langs samme `_stairRunPath` som tegneren bruker). PDF-plan og -sidevisning tegnes.
   PDF-trinnseriene stemmer innen ±5 cm. Toppflaten er et rektangel og regnes etter dagens regel N × første streng, og
   en hale under 5 cm som kabelen ikke rekker, står da med i tabellen. Det er eksisterende oppførsel for rette trinn.
6. En rett trapp får ikke `design`-felt og ingen U-flater.

Gamle tester, ny kode mot HEAD, verdi for verdi (`got`):

| test | ny | HEAD | identisk |
|---|---|---|---|
| `_stairRegressionTest` | 47/47 | 47/47 | ja |
| `_stairManualSetRegressionTest` | 42/42 | 42/42 | ja |
| `_stairZoneRegressionTest102` | 106/106 | 106/106 | ja |
| `_stairBuilderMoveRegressionTest110` | 59/59 | 59/59 | ja |
| `_stairSideRegressionTest` | 25/25 | 25/25 | ja |

Fant ingen nyere trapptester enn disse.

Rette trapper, sju varianter, hash for ny kode mot HEAD:

- ruting, kabler og forslag: lik
- skjermpiksler i plan + side: lik
- PDF-bilder, detaljutsnitt og sidevisning: lik
- `_stairSoneGeometryBlocks`: lik

Kanttilfeller, målt:
- «Kabelstart: Topp» snur kjeden (4 → 0) med samme hopp på 8,2 cm.
- Inntrinn 46 foran / 60 sider gir N = 7 fra sidene, CC 9 på sidene og 5,67 foran, uten varsler.
- Hel `exportPDF` med hesteskotrapp gir 5 sider uten feil.

## Bilder (`docs/176/bilder/`)

- `1-designvalg.png`: designvalget (hestesko valgt, fritegnet grå og «KOMMER»)
- `2-hesteskobygger.png`: byggeren med Kenneths eksempel, 562 × 116, kabelbehov 71,6 m / 13 strenger
- `3-forslag.png`: forslagsdialogen rett etter plassering (A = 1 × 70 m, kantavstand 11)
- `4-plan-med-kabel.png`: planen med kabel og panelet (Lagt 70 m, Passer)
- `5-pdf-plan.png`, `6-pdf-side2.png`: PDF-planen, sidevisning og detaljutsnitt
- `7-fire-hesteskotrinn.png`, `10-sidevisning-fire-trinn.png`: fire trinn, to kabler med skjøt, og sidevisning
  (4 × 40 + 60)
- `8-zoom-venstre.png`, `9-zoom-hoyre-opptrinn.png`: svinger ved bakkanten, opptrinnet (stiplet) og CC-kjeden
  3 · 9,1 … · 3 / 3 · 10 … · 3
- `11-ulike-inntrinn-46-60.png`

## Endringslogg

- **Ny:** `stair.design`, `stair.horseshoe`, og funksjonene `_stairIsHorseshoe`, `_stairHsParams`, `_stairHsSegments`,
  `_generateHorseshoeSurfaces`, `_stairSurfSpanCm`, `_stairOffsetOpen`, `_stairPolyLen`/`At`/`Slice`,
  `_stairRunPath`, `_stairUCountDepth`.
- **Ny tegner:** `_stairHsPaint` (én for skjerm og PDF), med `_drawStairPlanHs` og `_stairDrawToCanvasHs`.
- **Nytt UI:**
  - designvalg: `_showStairDesignPicker`, `_stairDesignPick`/`Next`
  - hesteskobygger: `_showHsBuilder`, `_renderHsBuilder`, `_stairHsPreviewSVG`, `_stairHsSummaryHtml`, `_confirmHsBuilder`
  - `showStairBuilderModal` viser nå designvalget. Den gamle byggeren heter `_showStraightStairBuilder` og er
    ellers uendret.
  - `showStairEditModal` åpner hesteskobyggeren for hestesko, og panelknappen heter «Rediger hesteskotrapp».
- **Motor (`generateStairCable`):** bare for hestesko:
  - lengde per streng langs U-linja
  - N fra det bredeste båndet
  - forslagets `runsPerStep` ignoreres
  - faktisk strengretning
  - toppflaten legges bakfra

  Rette trapper går nøyaktig samme gren som før.
- **Små kroker:** `_stairCableLength` (delegerer for hestesko), `minSurfW` / `_stairMaxEdgeMarginCm` via
  `_stairSurfSpanCm` (= `w_cm` for rette), `_renderStairPrintImages` (ett bånd), `_renderStairDetailInsets` og
  `_stairSoneGeometryBlocks` (U-sum; feltet `laidU_cm` finnes bare på U-grupper), og `_createStairObj`
  (design/horseshoe).
- **Ny test:** `_stairHorseshoeRegressionTest` (35 sjekker).

## Ikke gjort (med vilje)

Ingen polygon- eller fritegning (bare det grå kortet), ingen repos i hesteskotrapp, ingen endring for rette trapper,
ikke pushet, ikke flettet inn. Spørsmålene står i `docs/176/SPØRSMÅL.md`. Blant dem er 75 %-grensen for U og
hjørneradius mot minste bøyeradius.
