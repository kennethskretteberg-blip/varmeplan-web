# 153 · Flerkabel: felles CC følger arealregelen igjen

## Årsak (STEG 0, målt)

Kenneths område: 300 × 1100 cm = 33,0 m², 3 × InSnow 30T 3210 W 106,9 m (id 151, `min_spacing_mm` 60,
`max_spacing_mm` 200, hard 500 → `_ccLimits` minSp 6 / maxWarn 20 / maxHard 50, ingen romtype-overstyring), loddrett.
Veggmargin 5 cm.

| Utlegg | CC (v) | Lengde/kabel | Dekning* | Flateeffekt / W/m² rom |
|---|---|---|---|---|
| Før 153, med forpass (096) | 8,33 | 106,9 | 78 % (25,64 m²) | 360 / 292 |
| Uten forpass (`_ccFellesAv`) | 10,29 | 98,5 (−8 %) | — | boustrophedon, ugyldig |
| Etter 153 | 9,99 | 106,9 | 97 % (32,07 m²) | 300 / 292 |

Vannrett: 10,19 (før og etter, dekning 98,5 %). *Dekning = romkortets «Dekket av kabel» / netto.

Før 096 (`ca60811^`): CC 10,29, men boustrophedon med 98,5 m (−8 %, ugyldig). På `ca60811`: 8,33 / geo / 106,9 m.
Så 096 ga riktig lengde, men feil CC.

**Linja som valgte 8,3:** lengdesøkets N-stige i `generateCableGeo`, `note()` (bestCc = trinnet med minst |diff|).
Sone med søm på begge sider (100 cm): N=10 gir CC 10,00 og 109,41 m (+251 cm, trimmes). Neste trinn ber om CC 8,57;
`_geoBuildGrid` runder til 12 løp à 8,33, men der faller ytterløpene ut (CC/2 = 4,17 fra sømmen er innenfor
veggmarginen 5), og sonden `fastLen` måler en 10-løpsvariant på 109,34 m (+244 cm). Sju cm nærmere målet → trinnet
vant → CC 8,33 med 12 løp trimmet ~100 cm per løp. Forpasset (`_zoneSharedCcFromGeo`) tok minste svar for alle tre soner.
Hypotesen om at `min_spacing` var 83 mm stemte ikke (er 60).

## Endringer (`index.html`)

1. **Geo (`note()` i lengdesøket):** et trinn som bare er < 0,3 % av kabellengden nærmere målet flytter ikke vinneren
   så lenge vinneren trenger trimming (utenfor ±1 %). Dermed vinner det største CC-trinnet som trimmes inn.
2. **Gulv for forpasset:** `ccIdeal = netto ÷ samlet lengde` (klemt til `[minSp, maxHard]`); forpass-svar under 90 % av ideell
   klemmes til 90 % (konsollvarsel).
3. **Dekningsvakt:** rent rektangel uten hindring (`_roomIsPlainRect`) med estimert dekning (`_cableCoverageEst` =
   Σ lengde × CC ÷ netto) under 90 % → arealregel-resultatet uten forpass prøves og tas hvis gyldig, lengde ±1 % og
   bedre dekning; ellers beholdes forpass-resultatet. Konsollen sier hvorfor.
4. **Romkortet:** rad «⚠ Dekning — bare X % · CC for tett» for flere kabler i rent rektangel under 90 %.
5. **Fixture `ute3kab`** i `_cableFixtures` med `laas` (CC 10,1 ± 0,35, dekning ≥ 95 %, forhold ≤ 1,05) og to nye
   baselinjerader (`ute3kab|v|soner`, `|h|soner`); `_cableGeoSuiteZoneRow` rapporterer `dek` og `forhold`,
   `_cableGeoSuiteCompare` feiler på `laas`.

## Test

- `_cableGeoSuite()`: GRØNN, 144 rader, 20 s. Ingen eksisterende rad endret (ingen feil/bedre/endret). Baselinjen
  fikk bare de to nye radene (+ tidsstempel); `commit`-feltet er nå `null`.
- Rom 8 og rekt2kab uendret: CC 12,53 / 12,53, begge soner fullt antall løp, dekning 99,4 % / 99,6 %.
- 2 like kabler (3210 W, 300×1100): CC 15,26 (areal 15,43), dekning ~99 %, begge retninger gyldige.
- 4 like kabler 400×1100: 9,99 (før 8,33), gyldig. 
- `_cableGeometryQuickTest({rask:true})` 67/67, `_pdfExportSmokeTest` 25/25.
- Skjermbilder av tegningen: appen er bak innlogging i headless-Chrome, så jeg har bare en enkel linjetegning av
  kablene (`/tmp/cdp153/before.png`, `after.png`) og romkortets tall fra `_computeRoomStats` (før: 25,64 m² / 360;
  etter: 32,07 m² / 300 / W/m² rom 292). Panelet viser ikke advarsel etter endringen.

## Funn / åpent

- **4 × 3210 W i 300×1100 m² (389 W/m²)** gir fortsatt ugyldig boustrophedon (CC 7,72, forpass null). Uendret fra før 153; urealistisk effekt, ikke rørt.
- CC 10,29 (arealregelen) er ikke nåbar i en 100 cm sone: 10 løp gir 10,00. Derfor ble Kenneths «10,3 ± 0,3» satt til 10,1 ± 0,35 i fixturen.
- Under testing drepte en `pkill` mine midlertidige servere og i tillegg den gamle serveren på port 4001 (brukt til hash-sammenligning i tidligere økter); 4000 er startet på nytt. 4001 må startes på nytt ved behov.
- Ikke pushet.
