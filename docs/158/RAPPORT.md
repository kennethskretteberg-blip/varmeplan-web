# 158 · Plantegning: rom uten varme dempes, trapper holdes utenfor

**Commit:** «158: plantegning — rom uten varme dempet uten produkter, trapper utelatt». På `main`, ikke pushet.

## STEG 0 (målt før endring, kode = 653f6bb)

- `_renderFloorToImage` tegner `S.ui._pdfOverview` med `selectedRoomId = null`, så alle rom gikk gjennom drawRooms pass 1 likt.
  Bbox kom fra `_pdfFloorBox`: alle tegnede rom + `_stairBounds` for trapper i etasjens del, pad 100 cm.
- «Valgt for egen romside» = `opts.rooms` i `exportPDF` (hakene `.exp-room-cb`), gitt til `_pdfFloorplanGroups(selIds)`. Ble bare brukt til å
  velge hvilke etasjer som får side — ikke til å tegne.
- Måling (155-fixturen, 1. etasje, 5 rom, én trapp lagt 2400 cm til høyre for rommene):

  | | utsnitt (cm, inkl. pad) | bilde ved 267 mm |
  |---|---|---|
  | før, uten trapp | 1690 × 1340 | – |
  | før, med trapp | **3080 × 1340** | 2600 × 1131 px (liggende) |
  | etter (trapp finnes, utelatt) | **1690 × 1340** | 2600 × 2062 px |

  Rommene fikk altså 82 % mer bredde (1,82×) og arket gikk fra et sterkt liggende til et nesten stående format. Tegnetid 23 → 32 ms.

## Bygg

- **A. Demping.** Ny `S.ui._pdfMuted` (Set av room.id), satt bare av `_renderFloorToImage` ut fra ny `opts.selIds` (rommene på etasjen som
  *ikke* er valgt; `null` = ingen dempet) og gjenopprettet i `finally`. Hjelper `_pdfRoomMuted(id)`.
  - Rommets egen tegning (`drawRooms` pass 1): strek 0,5 → **0,22** alfa (veggbånd likedan), fyll 0,07 → 0,025, romnavn 0,95 → **0,5**, areal 0,9 → 0,45.
  - Ingen produkter: strips, fri folie, kabler, matter, frihånds-matter, plater, aluboard og soner hoppes over for dempede rom.
    Hindringer (søyle, peis) står igjen — de er byggets ting, ikke produkter.
  - **Hvorfor 0,22/0,5:** mørk marineblå på hvit bunn. Streken skal ligge klart under de valgte rommenes (0,5) men fortsatt overleve
    300 DPI-JPEG og svart/hvitt-kopi; 0,5 alfa på teksten gir ca. 40 % grånivå, lesbart i 11–12 pt men tydelig svakere enn
    valgte rom (0,95). Under ~0,15 forsvant streken i JPEG-komprimeringen i sjekkbildet. Verdiene er vurdert på 110 DPI-bilde, ikke på papir.
  - Dialogens forhåndsvisning bruker nå de hakede rommene (som PDF-en) i stedet for «alle».
- **B. Trapper.** `_pdfFloorBox` regner bare på rom; `_pdfFloorStairs` og `box.stairs` er fjernet. `drawStairs` returnerer under `_pdfOverview`
  (trapper rett utenfor bbox ville ellers tegnet seg inn i bildet).
- **C. Tom etasje.** `_pdfFloorBox` ga allerede `null` for etasje uten tegnede rom, og `_pdfFloorplanGroups` hopper over `null`. Etter B teller
  trappene ikke lenger, så en etasje med bare trapp → ingen side. Ingen ny kode, bare test.

## Tester

`_pdfExportSmokeTest` 42 → 49 (7 nye, 154-fixturen): sanity (kabel tegnes når rommet er valgt), dempet rom = pikselidentisk med og uten kabel,
dempet ≠ valgt, `_pdfMuted` ryddet, utsnitt uavhengig av trapp (1500×600 med og uten), bildet identisk med og uten trapp, etasje uten rom (bare trapp)
gir `_pdfFloorBox === null` og ingen «3. etasje»-side. Kjørt mot gammel kode ville sjekkene 2, 3, 5, 6 feile.
Alle 40 `*Test`-funksjoner kjørt mot HEAD (port 4005) og ny kode (4000): utdata identisk bortsett fra de 7 nye radene.
Allerede røde før 158 (uendret): `_cableZoneRegressionTest` (katalog uten InSnow 230 V) og `_kundeforslagRegressionTest` (testprodukter/innlogging).

## Skjermbilder

`docs/158/plantegning-for.jpg` (alle rom likt, trapp med, rommene krympet) og `docs/158/plantegning-etter.jpg` (Stue og Kjøkken valgt;
Bad, Gang og Vaskerom dempet uten produkter; ingen trapp).
