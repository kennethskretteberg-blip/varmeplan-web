# 159 · Advarsel når valgte kabler gir flateeffekt over taket

**Commit:** «159: advarsel når valgte kabler gir flateeffekt over taket — utlegget tegnes likevel». På `main`, ikke pushet.

## STEG 0 (målt før endring, kode = 467ae7f)

1. `_wm2MaxFor(roomId)`: fryserom 30, innendørs 300, utendørs 450 — bekreftet (`_roomTypeOf(...).wm2Max` mot `_moduleContext(...).wm2Max`, minste vinner).
2. Hullet bekreftet. `_clampTargetWm2` (og `setRoomTargetWm2`) klamper bare et **skrevet** måltall. Flateeffekten som følger av valgte kabler
   regnes i `_computeRoomStats` (`cableWm2`, `wm2Total`) og leses via `_roomFlateeffektWm2(room, stats)` (den ene kilden for romkort,
   Romoversikt, Excel); ingenting sammenligner den med taket.
3. 153-tilfellet (4 × InSnow 30T 3210 W, id 151, rom 300 × 1100 cm = 33,0 m², loddrett):
   - motoren legger ut 4 kabler (`S.cables` = 4, `_geomOk` false på alle — 153 sa «ugyldig boustrophedon»);
   - romkortet viser «Installert effekt 11 805 W», «W/m² (rom) 358», «Flateeffekt 389 W/m²»;
   - **ingen** advarsel, ingen markering. Brukeren ser bare en rar tegning.
4. Mønsteret for romadvarsler er `_roomCcOverWarn` + `_ccWarnText`: én oppslagsvei, brukt i canvas-romkortet (`drawRoomCard`), romlista,
   footer/toast og PDF (Senteravstand-linja). Canvas-kortet bruker en rad `['⚠ …', verdi]`; PDF en tekstlinje under CC.

## Bygg

- `_roomWm2OverWarn(room)` (ved `_roomCcOverWarn`): `null` når rommet ikke har produkt, ikke har netto areal, eller
  `round(_roomFlateeffektWm2) ≤ _wm2MaxFor(roomId)`. Ellers `{ wm2, max, overWm2, ratedW, netto, antall, noun, overW, minM2, kort, lang }`.
  Sammenlignes med samme tall romkortet viser som «Flateeffekt». Reservekabel (0 W) teller ikke.
- **Canvas-romkort:** rad «⚠ Flateeffekt — 389 W/m² · tak 300» (under «Flateeffekt», ved siden av 153-raden «⚠ Dekning»; får plass, ≤ 171 av 200 px).
- **PDF:** fet oransje tekst «Advarsel: …» (flere linjer) under Senteravstand på romsiden.
- Ingen sperre: `autoFillCable`, `_clampTargetWm2` og `_wm2MaxFor` er uendret; utlegget tegnes som før.

Tekst (153-tilfellet): «Flateeffekt 389 W/m² er 89 W/m² over taket på 300 W/m² (4 kabler, 12 840 W på 33,0 m²). Ca 2 940 W for mye —
bruk færre eller kortere kabler, eller et rom på minst 42,8 m².»

## 153-tilfellet før og etter

| | før | etter |
|---|---|---|
| Utlegg | 4 kabler tegnet | 4 kabler tegnet (uendret) |
| Flateeffekt (kort/panel) | 389 W/m², ingen advarsel | 389 W/m² + «⚠ Flateeffekt 389 W/m² · tak 300» |
| PDF | ingen advarsel | «Advarsel: Flateeffekt 389 W/m² er 89 W/m² over taket …» |
| 2 kabler i samme rom (197 W/m²) | ingen | ingen |

## Tester

`_wm2OverWarnTest()` (ny, 9/9): 4 × 3210 W i 33 m² gir advarsel med tall; utlegget tegnes (4 kabler); `_clampTargetWm2` urørt;
kablene fjernes → ingen advarsel; normalt rom (197 W/m²) → ingen; fryserom bruker taket 30; flateeffekt 1 over taket → advarsel, lik taket → ingen.
`_cableGeometryQuickTest({rask:true})` 67/67 og `_pdfExportSmokeTest` 49/49 uendret. PDF-linja verifisert ved å tvinge advarselen og fange `doc.text`.

## Begrensninger

- Skjermbilde av romkortet mangler: appen er bak innlogging i headless Chrome. Radbredden er målt i stedet.
- Fryserom på 31 W/m² er testet som grense (tak = flateeffekt − 1 → advarsel, lik → ingen) ved å senke romtypens tak midlertidig, ikke med et ekte
  31 W/m²-utlegg (én kabel legges ikke i så stort rom).
- Ikke pushet.
