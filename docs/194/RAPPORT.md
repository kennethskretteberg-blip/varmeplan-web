# 194 · Kartet uten kant — flislag i tegneflaten

## STEG 0 — CORS-målingen (ordrett)

```
== topo       (cache.kartverket.no/v1/wmts/1.0.0/topo/default/utm33n/15/3700/1300.png)
HTTP/2 200
content-type: image/png
access-control-allow-origin: *
== topograatone
HTTP/2 200
content-type: image/png
access-control-allow-origin: *
== OPTIONS (preflight)
HTTP/2 200
access-control-allow-origin: *
```

**Praktisk prøve** (headless Chrome, `<img crossOrigin='anonymous'>` → canvas → `toDataURL('image/jpeg')`):

```
topo 15 / topo 18 / topograatone 15 / topograatone 18: OK  (toDataURL ga data:image/jpeg;base64,…)
kontroll uten crossOrigin:                              SecurityError
```

**Vei: direkte henting fra Kartverket.** Ingen endring i `varmeplan-roof`, ingen `/roof/tile` nødvendig.
Kontrollen viser at taint-risikoen er reell: uten `crossOrigin='anonymous'` hadde PDF-eksporten dødd.

## Hva som ble bygget (alt i `index.html`, seksjonen «194 · FLISLAG»)

- **Flismotor:** `_tileIndex/_tileSpanM/_tilePickLevel`, cache (`_tileCache`, maks 700, utkastes eldst først),
  maks 8 samtidige hentinger, nyeste/midtre flis først, flis som ikke lenger er i bildet droppes fra køen.
  Feilede fliser prøves på nytt etter 15 s. Mangler en flis, skaleres nærmeste lastede forelder (grovere nivå) opp,
  så kartet ikke blinker tomt; ellers grå rute (hvit i PDF).
- **Tegning:** `drawBgImage` kaller `_tilesDraw(bg)` for flisbakgrunner (i stedet for `drawImage` av ett bilde).
  Flisene plasseres via de samme formlene som `_geoToWorld`/`w2s` — geometrien er uendret.
- **Zoom → nivå:** skjermens m/px = `0,01 ÷ (zoom × BASE_SCALE)`; `_tilePickLevel` velger groveste nivå som
  er finere enn eller lik det (samme regel som `pick_level` i `wmts.py`). Nivå 6–18 (6–14 målt til å finnes med curl;
  nivå 14 = 4722,3772 og halveres). Overstiger et bilde 200 fliser, gås ett nivå grovere.
- **`GEO_MIN_ZOOM`:** den gamle konstanten (0,02) står for bilde-utsnitt. Flislaget har egen
  `GEO_TILE_MIN_ZOOM = 0,0003` (≈ 30 km over 1000 px, nivå ~10). Grunnen: nivåvalget holder antall fliser per bilde
  nede uansett zoom, så gulvet trenger bare å hindre at brukeren zoomer ut til meningsløse nivåer.
- **Kanten:** `_geoViewOffMap` er alltid `false` for flislag. Meldingen «Kartet slutter her» ligger igjen for
  *gamle bilde-prosjekter* — den er fortsatt sann for dem (D sier de skal være uendret).
- **Gamle prosjekter:** skilles med `_bgIsTiles(bg)` = `bg.geo.tiles` finnes. Gamle har `bg.dataUrl` og ingen
  `geo.tiles` og går gjennom den uendrede bildeveien (lagring, gjenåpning, tegning). Ingen automatisk konvertering.
- **Lagring:** flisbaserte kart lagrer **ingen** `dataUrl`, bare `bg.geo` (senter/vindu, `tiles:{layer}`) —
  515 byte i stedet for ~2 MB base64 (målt `savedBg` = 515, test låser < 1 kB). Gjenåpning bygger bakgrunnen
  synkront uten bildelasting. `bg.img` er en 1×1-plassholder (med `naturalWidth/Height` 1600) slik at de ~40
  `bg.img`-vaktene i appen fortsatt ser «en bakgrunn».
- **Vindu:** nominelt 200 × 200 m rundt adressen som før (`east0/north0` = SV-hjørne). «Tilpass til visning»,
  hit-test og alle geo-regnestykker er dermed identiske; vinduet har bare ikke lenger noe med synlig kart å gjøre.
- **Kreditering:** `_tilesDrawCredit` tegner «© Kartverket (CC BY 4.0)» nederst til høyre på lerretet (også i
  PDF-bildet, større i `_pdfMode`), og ctxbar viser fortsatt `geo.attribution`. PDF-tekstlinjene (`geo.attribution`)
  er uendret.
- **PDF:** `_renderRoomToImage` er synkron, så `exportPDF` kaller `await _tilesPreloadForPdf()` etter
  `_pdfBranding()`: flisene som dekker rommene (+5 m) på nivå 18/17/16 og 14 lastes (maks 80 per nivå, 12 s timeout).
- **«Hent fra kart»:** hopper over `/roof/background` (`_roofTileMode`, standard `true`) — raskere, og
  karttjenesten trengs bare for adresse/omriss/helning. `_roofTileMode=false` beholder bildeveien; de fire
  eldre async-testene (139/142/168) kjører med den, siden de stubber `/roof/background`.

## Tester (`_geoTileRegressionTest194`, kjøres av `_geoRegressionTest().async`)

32 nye sjekker, alle grønne: flis for Steinliveien 1 på nivå 16 (27930/32302) og 18 (111720/129209) mot
formelen skrevet ut på nytt; flisside; URL; nivåvalg; flisenes skjermplassering = `w2s(_geoToWorld(…))` ved tre
pan/zoom-kombinasjoner (inkl. 4 km vekk); 100 m = 10 000 cm × zoom × BASE_SCALE px; ingen «kartet slutter her»;
kreditering på lerret og i PDF-modus; lagring (flislag < 1 kB uten `dataUrl`, gammelt prosjekt beholder `dataUrl`);
**PDF med ekte Kartverket-flis: `_renderRoomToImage` og `_renderFloorToImage` gir `data:image/jpeg`** og bildet har
kartinnhold (kontrast 173/255). Ved manglende nett hoppes PDF-sjekken over med tydelig melding (ikke stille grønn).

Totalt 141 sjekker i `_geoRegressionTest().async`: 140 grønne. Den ene røde,
`142: ctxbar sier «Kartet slutter her…»`, feiler **identisk på HEAD** (målt på `git archive HEAD` på port 4301;
109 sjekker, samme ene feil) — ikke berørt av denne endringen. `_geoScaleRegressionTest` (168) og
`_geoRegressionTest` er grønne.

Manuelt: lagre → `_restoreProject` gir flisbakgrunnen tilbake (`geo.tiles`, `locked`); kartet panorert ~4 km
fra utsnittet lastet 21 fliser og tegnet (`docs/194/kart-4km-unna.png`, med kreditering; rutenettet er appens eget).

## Ikke gjort / avgrensning

- Ikke pushet. `varmeplan-roof` er urørt.
- Ingen adressesøk-i-kartet eller «dra til gate» ennå: kartet er nå uendelig, men «taste en gate» går fortsatt via
  «Hent fra kart» (som flytter nominelt vindu + omriss). Se SPØRSMÅL.
