# 167 · Kabel i skrå L-rom (ringhusveien) — «kun label» i to gang/trapp-rom

Commit: «167: kabel i skrå L-rom (ringhusveien) — skew-motoren brøt kantavstanden sideveis og mot skrå vegger, koblingsstykket gikk gjennom trappa, og kaskaden ga opp uten ord; løse endepunkter/kantGap regnes mot faktiske kanter; ærlig melding når kaskaden gir opp; fixtures ringhus-d2100/d1102». Alt i `index.html` + `docs/kabel/baseline.json`. **Ikke pushet.**

Harness: `/tmp/cdp167/` (ny fane per kjøring, headless Chrome på 9333). Gammel kode = `045f7ae^` (før 161) servert fra `/tmp/cdp167/old` på port 4005 (ingen worktree — bare `git show` av fila), HEAD (e7bf2cc) = port 4001, ny = arbeidskopien på port 4000. Produktkatalogen lastes uten innlogging (`_loadProducts`), rommene bygges som fixtures (`_cableGalleryBuildScene`). Ingen skyprosjekter rørt.

## Kort svar

**161 er ikke årsaken.** Samme fixtures gir nøyaktig samme utfall på `045f7ae^` som på HEAD (tabellene under er identiske før/etter 161; 161-målene var `null` for skew-kabler og telte aldri). Årsaken ligger i **skew-motoren og kaskaden**, i tre lag:

1. **Skew-motoren brøt kantavstanden med 1,1–1,5 cm** på alle skrå vinkler, og geometrikontrollen (hard grense 1 cm) avviste dem. Målt: på tvers av løpene ble kantavstanden bare holdt mot den roterte *boksens* ytterkanter — en vegg eller trappeside som løper *langs* løpet inne i boksen (innerhjørnet i L-en, trappa) ble aldri sett. I løpets ende ble avstanden målt *langs* løpet, ikke vinkelrett på en skrå vegg.
2. **Koblingsstykket mellom to celler** var bare `{from, to}` og ble tegnet, målt og lengdeberegnet som en L i *verdensaksene*. I D1-102 (0°) gikk den rett gjennom trappas kantavstand (12,4 cm utenfor).
3. **Kaskaden ga opp stille.** Den gamle kaskaden lar skew velge *én* vinkel selv og godtar den bare ved dekning ≥ 70 % og korte hopp. I D1-102 valgte den 0° (to celler, langt hopp) → avvist → boustrophedon, som 083 tok ut av konkurransen → kandidatlista TOM → `_autoFillCableImpl` ga `null` → `_cablePreviewPlace` la ingenting og sa ingenting. 90° var gyldig hele tiden (94 % dekning). Fra romlista («Tegn utlegg») kom det en generell toast og angre — labelen sto igjen.

## STEG 0 — målt før endring

### 0.1 Polygonene (rekonstruert, ikke fra piksler)

**D2-100** (bilder: `bilder/foer-d2100.png`). Vegglengdene fra skjermbildet: V1 780 · V2 331 · V3 221 · V4 101 · V5 107 · V6 244 · V7 395 · V8 109. Antakelser: V1 er hele bunnen; V8 (109, loddrett) og V7 (395, vannrett) gir en 109 cm bred gang til venstre; V2 går opp mot høyre fra bunnens høyre ende; V3 står vinkelrett på V2 (samme skråvinkel); V4 vannrett; V5/V6 lukker. Løst numerisk (`/tmp/cdp167/solve.mjs`, 21 437 lukkende kandidater): V2 på 71° gir V6 = 244,8 cm (eksakt lukking) og 19,21 m² — nærmest 19,6. Skråseksjonen ligger 19–26° fra aksen.

| hjørne | x | y (skjerm: mindre y = opp) |
|---|---|---|
| P1 | 0 | 0 |
| P2 | 780 | 0 |
| P3 | 887,8 | −313 |
| P4 | 678,8 | −384,9 |
| P5 | 577,8 | −384,9 |
| P6 | 481,6 | −338 |
| P7 | 395 | −109 |
| P8 | 0 | −109 |

**Trappa.** Etiketten «CC 15,4 · 110 W/m²» på et 96 m-produkt betyr netto ≈ 96 × 0,154 = **14,8 m²** (`_cableLabelOnlyStats`: CC = netto / lengde), altså ≈ 4,8 m² hindring i et 19,6 m² rom. Lagt inn som en 220 × 220 hindring i hjørnet V2/V3, rotert med seksjonen: (887,8, −313) (679,7, −384,6) (608,1, −176,5) (816,2, −105). Netto i fixturen: 14,37 m².

**D1-102** (ingen vegglengder i skjermbildet): konstruert i samme ånd — gang 300 × 109 + hall med én skrå vegg (14°), 13,21 m² brutto: (0,0) (620,0) (690,−280) (300,−280) (300,−109) (0,−109). Etiketten «CC 15,3» på 70,5 m ⇒ netto ≈ **10,8 m²** — som «10,77 m² i underlaget». Trapp 90 × 260 langs skråveggen: (620,0) (683,1,−252,3) (595,8,−274,1) (532,7,−21,8). Netto 10,87 m².

⚠ Begge er **rekonstruksjoner**. D2-100 fungerer i auto allerede på HEAD med min geometri (0°, 92 %) — Kenneths ekte rom må ha en detalj min ikke har (se SPØRSMÅL 1–2). D1-102 gjenskaper feilen eksakt.

### 0.2 Kaskaden med trace (HEAD, InFloor 17T 1650W 96m / 1200W 70.5m)

**D2-100**

| retning | geo | skew (motorens valg) | gammel kaskade returnerer | kandidater | `_autoFillCableImpl` |
|---|---|---|---|---|---|
| auto | nei: ikke akseparallelt (26°) | 0°, CC 13,88, 96,88 m, 1 celle, GYLDIG 92 % | skew 0° | 1 (skew) | **skew 0°, gyldig, 92 %** |
| loddrett | nei | 90°, 3 celler, hopp 246 cm, UGYLDIG (utenfor 48 cm, nærføring) | **v6** (−38,7 % lengde) → kastet av 083 | **0** | faller til vannrett → skew 0° (merket retningsbytte) |
| vannrett | nei | 0° som auto | skew 0° | 1 | skew 0°, gyldig |

Skrå vinkler (19°, 109°, 110,7°) var alle UGYLDIGE med «utenfor 1,2–1,5 cm» (løp og svinger), selv om 109° dekker 95,7 %.

**D1-102**

| retning | geo | skew (motorens valg) | gammel kaskade returnerer | kandidater | `_autoFillCableImpl` |
|---|---|---|---|---|---|
| auto | nei (14°) | 0°, CC 14,29, 2 celler, hopp 97,7 cm, UGYLDIG (utenfor 12,4) | avvist av 70 %/hopp-gaten → **boustrophedon** → kastet av 083 | **0** | **NULL** («ikke akseparallelt») → «kun label» |
| loddrett | nei | 90°, 1 celle, UGYLDIG utenfor **1,02 cm** | skew 90° | 1 (ugyldig) | skew 90°, lagt UGYLDIG-merket |
| vannrett | nei | 0° som auto | **v6** → kastet | 0 | **NULL** |

### 0.3 Før/etter 161 (`045f7ae^` på port 4005)

Identisk, rad for rad (`/tmp/cdp167/trace-gammel.json` mot `trace-ny.json`). 161-målene (`loseEnder`, `kantGapCm`) var `null` for skew-kabler (ingen `centerline`, skrå løp) og inngår ikke i `_cableCandidateScore`. **161 drepte ingenting.**

### 0.4 Veien til «kun label»

- Lerretet (`_cablePreviewPlace`, én kabel): `const c = autoFillCable(…); if (c) {…}` — ved `null` ble ingenting lagt, ingen toast, ingen linje i panelet. Målt: `kabler: []`, `toasts: []` (bilde `bilder/foer-d1102.png`).
- Romlista (`_listDrawLayout`, «Tegn utlegg»): toast «Kunne ikke tegne utlegget: motoren fikk ikke lagt utlegget i rommet» (ingen grunn) + `undo()` → labelen fra hurtigprosjekteringen sto igjen. Det er mest sannsynlig denne veien Kenneths rom tok («kun label» er hurtigprosjekteringens form).

### 0.5 Er lengden mulig?

Ja. D2-100: 96 m × CC 14,0–14,4 cm = 13,4–13,8 m² av netto 14,37 (93 %). D1-102: 70,5 m × 14,4 = 10,2 m² av 10,87 (94 %). Begge innenfor produktets CC-område (5–20 cm) og bøyeradius (3,2 cm).

## Hva som er gjort

**A · Skew-motoren regner mot faktiske kanter** (`_skLaneIntervals`, `_skClipVerticalAng`, `_skIntersect`; kalles fra `_skGenerateRotated`). Per løp: (1) som før — rommet klippet på løpets linje, hindringer trukket fra med kantavstand, svingemarg i begge ender; (2) *ny* ende-marg: kantavstand / cos θ mot en vegg som står skrått på løpet (tak 5 × margin); (3) *ny* sidevakt: løpet og svingen (CC/2) må ligge innenfor rommet og utenfor hindringene én kantavstand til hver side. Rektangler og roterte rektangler i sitt eget plan: bit for bit som før (cos θ = 1, sidevakten ligger innenfor boksen) — `_cableSkewRegressionTest` A–E 16/16, `_cableZoneRegressionTest` 33/33.

**B · Koblingsstykket rutes innenfor lovlig område** (`_skRouteConnector`, kalt fra `_skEngineCore`, som nå får `legal` fra `generateCableSkew` når clipper er lastet — fail-open ellers). Fem ruter prøves (L i verdensaksene som før, speilvendt, L langs løpene, speilvendt, rett linje); første som ligger innenfor får `pts`. Holder den gamle L-en, settes ingen `pts` (uendret). `_cableWorldSegments`, `_cableCenterlinePaths` og `_drawCableSkewPath` leser `pts` (samme mønster som svingene); lengden i `_skEngineCore` summerer polylinja. I D1-102 (0°) finnes ingen rute forbi trappa (6 cm mellom trapp og vegg) — den vinkelen er med rette ugyldig, 90° vinner.

**C · Kaskaden: redning per vinkel i skrå rom** (`_cableCandidatesForDirectionImpl`). Når geo sier «ikke akseparallelt» og kaskaden *ikke* ga et gyldig skew-utlegg: skew kjøres én gang per kantvinkel i rommet (auto) eller for valgt retning (eksplisitt), hver måles av `_cableGeometryCheck` og konkurrerer etter de vanlige reglene (`_cablePickWinner` uendret). Har kaskaden alt et (ugyldig) skew-utlegg, slipper bare *gyldige* redningskandidater inn — ellers fortrengte en annen ugyldig vinkel kaskadens eget valg (målt: A–C i skew-testen falt fra 12°/20° til 0°/136,6° i første utgave). Akseparallelle rom berøres ikke.

**D · Ærlig melding når kaskaden gir opp.** `_cablePreviewPlace` (én kabel, `null`): produktet legges som label (`labelFallback = 1`, samme ærlighet som N-kabel-grenen), grunnen (`room._cableNoSolution.reason`) går i `labelReason`; toast «Fikk ikke lagt kabelen automatisk i dette rommet — <grunn>. Produktet er notert som label.»; panelets fot (`_cablePreviewFooterHtml`) har egen tekst for én kabel; `_listDrawLayout` tar grunnen med i sin toast. `_autoFillCableImpl` gir en lesbar grunn for skrå rom («rommet har skrå vegger, og skrå-motoren fant ikke et utlegg innenfor kantavstanden (prøvde N vinkler)») i stedet for «ikke akseparallelt». Målt i `kabelForLang` (200 × 150, 96 m): label lagt, toast «… — Fant ingen lovlig sammenhengende bane for én kabel. Produktet er notert som label.» (bilde `bilder/umulig-rom.png`).

**E · 161-målene på skew-kabler** (`_cable161Frame`; `_cableLoseEnder`, `_cableKantGap`). Senterlinje, lovlig område og rom roteres til motorens plan ((90 − vinkel)°, løp loddrette) og måles som akseparallelt. To presiseringer mot *faktiske kanter*: (i) en ende der svingpartneren står ved *sin* kant (skråvegg, hindring, innerhjørne) er ikke løs — svingen er en halvsirkel (LÅST), så to naboløp må slutte i samme høyde; (ii) kantGap-strålen stopper på første kant den treffer, også en hindringskant (et felt som slutter ved trappa leses ikke som «stopper 100 cm fra veggen»). ⚠ (i) senker også tallet i 30 geo-rader (L/U/utsparing/asymmetrisk/badHakk/rom5/badHakk41) — se baseline-diff og SPØRSMÅL 3. `hind1` (161-fixturen) og rektanglene: uendret.

**F · Fixtures og port.** `ringhus-d2100` og `ringhus-d1102` (`kaskade: true`) kjøres gjennom hele kaskaden i porten (`_cableGeoSuiteKaskadeRow`, to rader v/h), låst: `laas: { dekMin: 90/93, devMax: 1, loseMax: 0 }`.

## Etter (målt, arbeidskopien)

| rom | retning | motor | vinkel | CC | lengde | avvik | dekning | løse ender | kantGap | gyldig |
|---|---|---|---|---|---|---|---|---|---|---|
| D2-100 | auto | skew | 109° | 14,0 | 96,00 m | −0,01 % | 93,0 % | 0 | 1,14 CC (16 cm) | ja |
| D2-100 | loddrett → vannrett (merket) | skew | 0° | 13,88 | 96,09 m | +0,09 % | 91,2 % | 0 | 0,22 CC | ja |
| D2-100 | vannrett | skew | 0° | 13,88 | 96,09 m | +0,09 % | 91,2 % | 0 | 0,22 CC | ja |
| D1-102 | auto | skew | 90° | 14,39 | 70,51 m | 0,00 % | 94,0 % | 0 | 0,47 CC | ja |
| D1-102 | loddrett | skew | 90° | 14,39 | 70,51 m | 0,00 % | 94,0 % | 0 | 0,47 CC | ja |
| D1-102 | vannrett → loddrett (merket) | skew | 90° | 14,39 | 70,51 m | 0,00 % | 94,0 % | 0 | 0,47 CC | ja |

CC 14,0–14,4 mot etikettens 15,3–15,4 (etiketten regnet på netto/lengde uten geometri; med trappa som hindring er netto i fixturene 14,37/10,87). Bilder: `bilder/etter-d2100.png`, `bilder/etter-d1102.png`. Panelet D2-100 auto sier «⚠ 1,01 m² (7 %) uten kabel», «⚠ Kabelfeltet stopper 21 cm fra veggen» (109°-valget, se SPØRSMÅL 4) og «Start kan ikke ligge nede til venstre — nærmeste er 61 cm unna».

## Tester

| test | resultat |
|---|---|
| `_cableSkewRegressionTest` | 16/16 |
| `_cableZoneRegressionTest` | 33/33 |
| `_pdfExportSmokeTest` | 55/55 |
| `_cableGeometryQuickTest` | 96/96 (80 s) |
| `_cableGeoSuite()` (full, 156 rader) | GRØNN, 0 feil, 0 endret, 4 nye, 30 «bedre» (løse ender ned) |
| Rom med 45° skråvegg (`skraa`) + rektangler | som før (porten: ingen rad dårligere) |

PDF-romsiden tegner kabler via lerretet (`drawCables` → `_drawCableSkewPath`) og `_cableWorldSegments` — begge leser koblingsstykkets `pts`.

## Baseline-diff (`docs/kabel/baseline.json`, commit 161 → 167)

Se `BASELINE-DIFF` nederst (fylt inn fra `git show HEAD:docs/kabel/baseline.json` mot arbeidskopien). Ingen rad endret N, CC, lengde, dekning, R-START/R-VEGG/R-ENDE eller gyldighet — bare `lose` (ned) i 30 rader, og 4 nye rader.

## BASELINE-DIFF

Port etter oppdatering: `_cableGeoSuite()` GRØNN — 156 rader, 0 feil, 0 bedre, 0 endret, 0 nye, 0 borte.

```
BASELINE-DIFF (34 rader):
lRom|v|tr: lose 1 → 0
uRom|v|tr: lose 1 → 0
uRom|v|bl: lose 1 → 0
uRom|v|tl: lose 1 → 0
uRom|v|br: lose 1 → 0
utsparing|h|tr: lose 2 → 0
utsparing|h|bl: lose 2 → 0
utsparing|h|tl: lose 2 → 0
utsparing|h|br: lose 2 → 0
asymmetriskeVegger|h|tr: lose 2 → 0
asymmetriskeVegger|h|bl: lose 2 → 0
asymmetriskeVegger|h|tl: lose 2 → 0
asymmetriskeVegger|h|br: lose 2 → 0
badHakk|v|tr: lose 2 → 1
badHakk|v|bl: lose 2 → 1
badHakk|v|tl: lose 2 → 1
badHakk|v|br: lose 2 → 1
badHakk|h|tr: lose 1 → 0
badHakk|h|tl: lose 1 → 0
badHakk|h|br: lose 1 → 0
rom5|v|tr: lose 3 → 2
rom5|v|tl: lose 3 → 2
rom5|v|br: lose 3 → 2
rom5|h|tr: lose 3 → 0
rom5|h|br: lose 3 → 0
badHakk41|v|bl: lose 3 → 2
badHakk41|h|tr: lose 2 → 0
badHakk41|h|bl: lose 1 → 0
badHakk41|h|tl: lose 1 → 0
badHakk41|h|br: lose 2 → 0
ringhus-d2100|v|kaskade: NY {"motor":"skew","vinkel":0,"cc":13.88,"m":96.09,"dek":91.2,"lose":0,"kantGapCC":0.22,"dev":0.09}
ringhus-d2100|h|kaskade: NY {"motor":"skew","vinkel":0,"cc":13.88,"m":96.09,"dek":91.2,"lose":0,"kantGapCC":0.22,"dev":0.09}
ringhus-d1102|v|kaskade: NY {"motor":"skew","vinkel":90,"cc":14.39,"m":70.5,"dek":94,"lose":0,"kantGapCC":0.47,"dev":0}
ringhus-d1102|h|kaskade: NY {"motor":"skew","vinkel":90,"cc":14.39,"m":70.5,"dek":94,"lose":0,"kantGapCC":0.47,"dev":0}
```
