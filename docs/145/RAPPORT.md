# 145 · PDF: motstandsmåling for varmefolie

## Hva som er gjort
- **`_roomFoilResistance(room)`** (rett over `_computeRoomStats`) → `{ rows:[{product, lenM, wPerM, W}], P, lenM, rLow, rNom, rHigh }`, `null` uten folie. `rHigh = 57 600/P`, `rNom = 52 900/P`, `rLow = 48 400/P` (`FOIL_R_U2`).
- **Én løkke:** `_foilRoomItems(room)` (utvalget, flyttet uendret) og `_foilPower(items)` (effekten) brukes av både `_computeRoomStats` og `_roomFoilResistance`. P summeres element for element i samme rekkefølge som før, så romkort/PDF-hode er bit-identiske.
- **Romsiden:** blokken «Motstandsmåling — varmefolie» rett etter Spesifikasjon, bare for folierom, med Kenneths mal (rad per bredde, installert effekt, øvre/nominell/nedre med `240² / P = 57 600 / P = …`, grensene uthevet og med blå bakgrunn, målelinje og forklaring). Tegningen krympes ikke; blokken holdes samlet med `_checkPage`. Blokkene under (Hindringer, Notater, Fryserom) får egne `_checkPage`-vakter **bare** når blokken er med.
- **Oversiktstabellen** «Motstandsmåling — oversikt for elektriker» på egen side rett før Materialliste (etter Romoversikt/Trappeoversikt): Etasje · Rom · Folie (m) · Effekt (W) · Nedre · Nominell · Øvre · Målt (strek) · OK (boks), gruppert per etasje (etasjenavn står på første rad i gruppa; etasjer sortert som Romoversikten), Cenikas måletabell, kilde, «Målt av / Dato». Bare valgte rom med folie; ingen folie → ingen side.
- **Dialog:** «Motstandsmåling (varmefolie)» (`#exp-resistance`, `opts.resistance`), på som standard, vises bare når et rom har folie, med forhåndsvisning. Dialogen husker ingen avkrysninger i dag, så ingenting å huske.
- Hjelpere: `_fmtNo` (norsk tall, tusenskille fra fem sifre: «57 600», «1066,8»), `_foilResistanceRooms`, `_floorLevelNum/_floorLevelCompare` flyttet til toppnivå (uendret kode).
- **Ω:** jsPDFs helvetica har ikke Ω — den tegnes som «©» (målt, `omega.pdf`). `_pdfTextOhm` tegner Ω fra standardfonten `symbol`. Samme problem finnes i dokumentasjonsmodulens PDF (se SPØRSMÅL).

## STEG 0
1. **Katalogen mot produktbladet:** lest anonymt fra Supabase (`heating_products`, 265 rader). Alle åtte FlexFoil (B=20…140, CVA55000–55007) har `watt_per_lm` 12/24/30/36/48/60/72/84 — **ingen avvik**. Ingen andre produkter har `watt_per_lm`.
2. **Tre rom** (fixture i `_foilResistanceRegressionTest`, håndregnet):

| Rom | Innhold | P (W) | Øvre 240 V | Nominell 230 V | Nedre 220 V |
|---|---|---|---|---|---|
| A | 36 W/m × 5,8 m | 208,8 | 275,9 | 253,4 | 231,8 |
| B | 36 × 7,8 + 60 × 13,1 | 1066,8 | 54,0 | 49,6 | 45,4 |
| C | strips 36 × 2,0 + fri folie 60 × 1,5 + produkt uten `watt_per_lm` 0,49 m × 60 W/m² × 1,0 m | 191,4 | 300,9 | 276,4 | 252,9 |

`_computeRoomStats(...).totalW` = `round(P)` for alle tre (testet). Veiledningens 1109,2 W → 51,9 / 47,7 / 43,6 Ω.
3. **Plass nederst:** typisk folierom uten notater har ca. **60 mm** ledig (A4, bunnmarg 15 mm) etter Spesifikasjon; blokken trenger ca. **49 mm** (1 rad; +4 mm per ekstra bredde) → får plass uten ny side. Med Notater (ca. 42 mm ledig) får den ikke plass sammen med dem: blokken blir værende, Hindringer/Notater flyttes til neste side (+1 side). Målt i fixturen med tegningsbudsjettet urørt.
4. **Dialogen:** `_showExportDialog` (avkrysning per seksjon) → `_runExportPDF` bygger `opts`. Nytt valg = én rad + ett felt i `opts`.

## Tester
- `_foilResistanceRegressionTest` **49/49** (nytt): veiledningseksempel, de tre rommene (P, øvre/nominell/nedre, mot `_computeRoomStats`), null uten folie, tallformat, PDF-tekst (blokk ×3, tabell, tallene i blokk og tabellrad like, per-etasje-gruppering, rom uten folie ikke med, måletabell/kilde/«Målt av»), valget av = identisk tekst og sideantall (9 → 4 romsider uten tillegg), uten folie = ingenting, **vaksine** (57 600 → 52 900 gjør fasit-sjekken rød, grønn igjen etter).
- `_pdfExportSmokeTest` **25/25** (var 20): ny foliefixture; blokk, tabell og grenser 224,1/244,9/266,7 finnes i PDF-teksten.
- Grønne: `_foilRegressionTest` 9, `_accessoryFoilQtyRegressionTest` 46, `_gbao10RegressionTest` 18, `_soneRegressionTest` 40, `_flateeffektRegressionTest` 9, `_computedStampRegressionTest` 19, `_gapRegressionTest` 11, `_listKalkyleClearRegressionTest` 32.
- Røde både før og etter (trenger innlogget katalog, kjørt mot `3c6664e` på port 4001): `_listevisningRegressionTest`, `_reserveCableRegressionTest`, `_kundeforslagRegressionTest`.
- **Valget av = bit-identisk:** samme prosjekt (4 rom, hindring, sone, notater, folie + fri folie), alle PDF-tekstkall med koordinater sammenlignet mot `3c6664e`: **identisk** (9 sider, 391 tekstkall). Med valget på: 11 sider (+ tabell + Notater på egen side).
- Ingen konsollfeil.

## Skjermbilder
`docs/145/romside-stue.png` (romside med blokken), `docs/145/tabellside.png` (oversikten), `docs/145/dialog.png` (valget + forhåndsvisning). Gjengitt med macOS' PDF-motor.

## Ikke gjort / merk
- Ikke pushet. Katalog, foliens effekt andre steder og dokumentasjonsmodulens ±10 %-regel er urørt.
