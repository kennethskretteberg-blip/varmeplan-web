# 226 · Lesbare mål på rommene i PDF-en — rapport

09.11.2026 · gren `design/varmeplan-stil` (worktree `~/Code/varmeplan-web-design`) · én commit, ikke pushet · ingen SQL ·
første prompt i løpet serie-223-design (KUN design; skjermen er bit-identisk med før, målt).

## Kort

Kenneth 09.11.2026: «Målene på rommene i PDF-en er for små og for svake. Når man zoomer inn i PDF-en, blir de uskarpe.»

- **Årsak, bekreftet i koden:** veggmål (`_drawDimAnnotationsForRoom`), målekjedene for folie/kabel/matte
  (`_drawDimChainLayout`, `_drawCableSkewDimChain`), brukerens mål (`drawUserDimLines`) og veggetikettene «V1 400 cm»
  (`drawRooms`) tegnet alle med 10–11 px skrift og 0,5–1,2 px streker i SKJERMPUNKTER. Romsiden tegnes i 2126 px over
  180 mm (300 DPI) → 10 px = **0,85 mm** tekst på papiret, strekene 0,04–0,1 mm. Hindringsmålene (217) hadde en egen
  papirregel på 1,2 mm. Produktetikettene hadde alt riktig regel (`_labelFontCm`, 051): fast størrelse på papiret.
  Bildet ble i tillegg lagret som JPEG 0,9, som smører ut liten tekst og tynne streker.
- **Nå — én hjelper, `_dimPdfStyle()`** (rett etter `_labelFontCm`): returnerer `null` utenfor PDF-modus eller uten kjent
  skala (da bruker hvert tegnested nøyaktig de gamle skjermtallene), ellers px-tall regnet fra `S.ui._pdfScaleMmPerCm`:
  skrift **2,0 mm × pdfLabelScale** (`DIM_PDF_MM`), minste 1,6 mm (`DIM_PDF_MIN_MM`, brukes av 217-krympingen),
  målestrek 0,2 mm, hjelpelinje 0,15 mm, endemerke 1,5 mm, farge `#374151` heldekkende (rødt beholdes, heldekkende),
  hvit boks bak teksten (1,4 × skriften høy). Alle seks tegnestedene leser den. Hindringsmålene (`_hindDimFontPx`) går
  fra 1,2/0,9 mm til den felles 2,0/1,6 mm.
- **Ingen mål er flyttet:** kjedeavstandene (25 + 20 cm), romdimensjonenes avstand (`_roomDimBaseOffCm`), hindringsmålenes
  innrykk og brukerens offset er urørt. Det som skalerer med skriften er tekstens løft over kjedelinja (12 px ≙ 1,2 × skrift
  på skjermen → 0,9 × skrift i PDF, så boksen ikke når veggen), stiplinger og luften mellom vegg og hjelpelinje.
- **PNG i stedet for JPEG** for romsidene og plantegningen (`_pdfImgEncode`, delt av `_renderRoomToImage` og
  `_renderFloorToImage`; `doc.addImage(…, 'PNG', …, undefined, 'FAST')`). ⚠ Flate-flagget er nødvendig: uten det legger
  jsPDF 2.5.2 pikslene rå i fila (67 MB for fem sider). Forhåndsvisningen i dialogen (`toCanvas`/`noUrl`) er uendret.
- **Ikke rørt:** trappesidene (`_stairDrawToCanvas` har egne mål og var alt PNG), tak-snittet (`_takSectionPaint`, egen
  kodevei, JPEG), romnavn/areal på plantegningen (`_pdfOverviewFontPx`), hindringens navn («Pipe», 11 px også i PDF).

## Målt

Fixture `docs/217-hindring/probe/fixture.mjs` (fire rom: kabel + hindring 60 × 40, folie + hindring, kabel + 15 × 15,
folie + L-hindring + femkant) + plantegning = 5 sider. Prosjekt #0395 krever innlogging og var ikke tilgjengelig.
`docs/226/probe/pdf.mjs` bygger PDF-en som `exportPDF` (dato/ID låst), `maal.mjs` måler tekst på papiret,
`skjerm.mjs` hasher skjermtegningen, `alle.mjs` + `sammenlign.js` kjører alle regresjonstester.

### Skrifthøyde på papiret (A4, romside 180 mm bred)

| Mål | Normal: skrift / tallhøyde | Ekstra stor (1,5): skrift / tallhøyde |
|---|---|---|
| Veggetikett «V1 400 cm» | 2,00 / 1,44 mm | 3,00 / 2,20 mm |
| Foliekjede «395 cm» | 2,00 / 1,44 mm | 3,00 / 2,12 mm |
| Hindringsmål «60 cm» (60 × 40, Stue kabel) | 2,00 / 1,44 mm | 2,90 / 2,12 mm (krympet ett trinn for å få plass) |
| Hindringsmål «15 cm» (15 × 15, utenfor) | 2,00 / 1,44 mm | 3,00 / 2,12 mm |
| Før (HEAD): alle mål | 0,85 mm (10 px) / ≈ 0,6 mm | — |

Tallhøyde = målte mørke pikselrader i det ferdige bildet (versalhøyde ≈ 0,72 × skriften for Space Grotesk).
Produktetikettene er 2,2 mm (uendret), så rangeringen etikett > mål beholdes.

### Filstørrelse (samme fem sider, foliegap låst til 2 cm)

| Variant | PDF | Byggetid (5 sider) |
|---|---|---|
| Før (HEAD): JPEG 0,9, 300 DPI | 695 kB | 0,16 s |
| **Etter: PNG, Flate FAST, 300 DPI (valgt)** | **719 kB** | 1,0 s |
| PNG, Flate MEDIUM | 778 kB | 1,15 s |
| PNG, Flate SLOW | 633 kB | 1,8 s |
| PNG uten Flate (jsPDF-standard) | **67 352 kB** | 1,5 s |
| JPEG 0,9 på ny tegning | 744 kB | 0,17 s |
| JPEG 0,95, 300 DPI | 908 kB | 0,16 s |
| JPEG 0,95, 400 DPI | 1 384 kB | 0,25 s |
| PNG FAST, 400 DPI | 987 kB | 1,8 s |

PNG er ikke «mer enn dobbelt så stor» (3 % større), så PNG ved 300 DPI er valgt; JPEG-alternativene ble likevel målt.
Byggetiden øker med ca. 0,2 s per side (jsPDFs Flate i JavaScript). Stor/Ekstra stor: 761 / 818 kB.

### Bilder (300 DPI fra `pdftoppm`, beskåret med `probe/utsnitt.mjs`)

- `foer-hjorne-folie.png` / `etter-hjorne-folie.png` — øvre høyre hjørne av Stue folie med tverr- og langs-kjede (2×).
- `foer-hindring-kabel.png` / `etter-hindring-kabel.png` — hindringsmålene i Stue kabel (3×).
- `foer-stue-folie.png` / `etter-stue-folie.png` — hele romtegningen.
- `variant-jpeg95-hjorne-folie.png` — samme hjørne som JPEG 0,95 (til sammenligning med PNG).
- `etter-plantegning.png` — plantegningen (hindringsmålene vises der; kjedene er av på plantegningen som før).
- `etter-stor-stue-folie.png` — Stor (1,25): lesbart, ingen kollisjon.
- **Verste tilfelle, Ekstra stor (1,5):** `etter-xstor-kjede-kollisjon.png` (korte segmenter «2 cm»/«2.5 cm» får tekst
  bredere enn segmentet, som legger seg over nabotallet), `etter-xstor-hindring.png` (de fire målene i en 60 × 40-hindring
  over hverandre), `etter-xstor-kontor.png` (produktetiketter over hverandre og over veggetiketten — som før 226).

### Skjermen

`skjerm.mjs`: lerretshash for fire rom med veggmål, foliekjede, kabelkjede, hindringsmål og et brukermål, pluss
PDF-modus uten kjent skala — **identiske** mellom HEAD-kopien og arbeidskopien (93a47827 / bf6b6fc8 / 250a39d9 / 710ef4f3 / aa19baad).

### Regresjon

92 tester (`alle.mjs`, port 4013, kjørt på nytt etter siste endring). HEAD: 85 grønne. Nå: 85 grønne, **91 like** (fem geo-
tester kaster med samme feil, bare linjenummeret i unntaksteksten har flyttet seg); eneste reelle ulike er
`_hindDimRegressionTest217` 23/23 → 24/24 (J bevisst endret: 1,2/0,9 mm → `DIM_PDF_MM`/`DIM_PDF_MIN_MM` 2,0/1,6, Ekstra stor
1,8 → 3,0 mm, + én ny sjekk mot `_dimPdfStyle`). `_pdfPreviewRegressionTest` D2/D3 fanger nå målbokser på 1,4 × målskriften
(før: 14 px) og venter 2,8 mm ≈ 12,4 cm (før 5,3 cm) — fortsatt 96/96. De sju røde er de samme som på HEAD og trenger
innlogging (prosjektlås E, kundeforslag L/138, fem geo-tester som kaster uten `S.bgs`).

## Punkt 5 — ekte tekst i PDF-en (undersøkt, ikke bygget)

Mulig, og det ville gjort målene skarpe uansett zoom og søkbare. Skisse: mens `_renderRoomToImage` tegner, fanges
`ctx.fillText` (samme grep som `_pdfPreviewRegressionTest` D, linje ~95440) for tekster tegnet av målfunksjonene; hvert kall
gir tekst, lerretspunkt (via `ctx.getTransform()`), rotasjon og skrift i px. Lerretspunkt → mm på siden er lineært
(`imgX + x / outW · imgW2`), og `doc.text(s, x, y, { angle, align: 'center', baseline: 'middle' })` skriver dem oppå bildet
etter `addImage`. Den hvite boksen tegnes fortsatt i bildet (eller som `doc.rect` med fyll). Målfunksjonene må da hoppe
over `fillText` i PDF-modus (eller tekstene maskeres), ellers står de dobbelt.

Omfang: ca. 60–100 linjer — en fangstliste i `_renderRoomToImage`/`_renderFloorToImage` (retur `texts`), skriving i de to
`addImage`-stedene i `exportPDF`, og et flagg i `_dimPdfStyle` («tekst skrives av PDF-en»). Det som kan gå galt:

1. **Skrift.** jsPDF har bare Helvetica/Times/Courier innebygd; Space Grotesk må legges inn som TTF (base64, ~100–300 kB i
   `index.html` eller lastet fra CDN) for at tallene skal se ut som på skjermen. Helvetica er smalere → boksen i bildet
   passer ikke tekstens bredde (bruk `doc.getTextWidth` og tegn boksen som `doc.rect` i stedet).
2. **Latin-1.** jsPDF-standardfontene mangler «→», «≥», «−», «Ø» i noen varianter — mattemerknaden «Kabel → vegg min …»
   og «?» på usikre mål må kontrolleres (tak-PDF-en har alt en `plain()`-vask for dette).
3. **Forhåndsvisningen** (155/165) tegner bildet i dialogen — den får ingen `doc.text`, så dialog og PDF viser ikke lenger
   det samme med mindre dialogen også tegner tekstene (den har lerretet og kan tegne dem der).
4. **Rotasjon og baseline.** jsPDF roterer om tekstens startpunkt, ikke om midten; `align:'center'` + `angle` krever at
   startpunktet regnes om. Lesevinkelen (217: nedenfra/fra høyre) må følge med.
5. **Nummer-modus (196)** og 217-krympingen bruker lerretsgeometri til plassering — uendret, bare teksten flyttes ut.
6. **Rekkefølge/lag.** Tekst skrevet etter bildet ligger alltid øverst — også over produktetiketter den i dag ligger under.

Anbefaling: eget nummer; bruk 226-størrelsene som tekst-størrelse (`fontPx / pxPerMm · 72 / 25,4` pt), og begynn med
kjedetekstene (flest, enkel geometri).

## Funnet, ikke rettet

- Ekstra stor-kollisjonene over (spørsmål 4). Kjedetekster for segmenter kortere enn teksten kunne krympe mot 1,6 mm;
  hindringsmål kunne vike for hverandre.
- Hindringens navn står i 11 px (0,9 mm) i PDF-en — ikke et mål, ikke rørt (spørsmål 5).
- Veggetikettene («V1 …») tegnes før varmeelementene og dekkes av folie/etiketter — som før.
- Port 4010 var en gammel Python-server, ikke worktreet (spørsmål 7); regresjonstestene lekker prefs via localStorage
  til andre faner (spørsmål 8).
- `_renderRoomToImage` nullstiller ikke `S.ui.selectedDimId`; et valgt brukermål ville før blitt tegnet i «valgt»-farge i
  PDF-en. I PDF-modus bruker 226 nå den grå uansett, så det er ikke synlig lenger — men gizmoen (`drawDimMoveGizmo`)
  er ikke undersøkt.
