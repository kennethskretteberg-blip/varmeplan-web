# 238 – Trapp: egen «avstand fra sidene» på repos, og trinnene prioriteres

19.11.2026 · `main` · commit `803c8ae` · ikke pushet · ingen SQL

## Hva som er endret
- **Nytt felt «Avstand fra sidene – repos»** i trappepanelet, rett under «Avstand sider», bare når trappa har både trinn og repos. Tomt = samme som trinnene. Tall = egen avstand på repos (minst 1 cm, høyst halve smaleste repos minus 1 – samme klemme som dagens felt). Lagres som `stair.landingEdgeMargin_cm`; per sone som `zoneSettings[z].landingEdgeMargin_cm` (ny rad «Avstand sider repos» i sonepanelet, tomt = som trappa).
- **Ny avkrysning «Prioriter trinn»** (`stair.prioritizeSteps`, av som standard), under feltet.
- **`_stairSurfSettings`** gir repos sin egen `edgeMargin_cm` / `edgeMarginFloor_cm` (og `landingOwn: true`) når ett av valgene er i bruk. Plan, sidevisning, PDF, kabellengde og mål leser derfra som før – ingen egen kopi.
- **Løserne** (`_stairFitFixedSet`, `_stairSolveExactCableSet`, og gjennom dem `_stairSolveZones`, Forslag og «Bla i kabler») går nå to-fase når valgene er i bruk – se under. De gamle funksjonskroppene heter `…1` og er urørt i regnemåten.
- **Panelteksten** skiller trinn og repos: «Repos: avstand fra sidene justert til 42.1 cm (din: 5 cm) så kabelsettet går opp — 0.2 cm til overs. Trinn: 5.0 cm.» Under feltet står «Trinn 5.0 cm · repos 42.1 cm fra sidene». Forslagskortet får merket «Repos: 42.1 cm fra sidene (din: 5 cm) · trinn 5.0 cm».
- **PDF:** linja «Avstand sider: 5 cm (repos 42.1 cm)», og planen får et eget sidemål på reposet når det avviker fra trinnene.

Begge valg av = ingen av de nye feltene finnes på trappa, og all ny kode er død.

## Hvordan løserne prioriterer nå
Gjelder når repos-feltet er brukt **eller** «Prioriter trinn» er på (`_stairLmOn`, `_stairLmSolve`):
1. **Trinnene står på gulvet** (det brukeren har satt). **Repos er variabelen** og øker fra repos-gulvet (feltet, ellers trinnenes verdi).
2. Rekker ikke repos, **står repos på taket** og trinnene justeres som før.
3. Går det fortsatt ikke opp: begge tilbake på gulvet, og «for kort / for lang» vises som før (stiplet rødt + tekst, med tillegget «Repos er alt regnet med største avstand (90.0 cm).»).

CC og antall strenger røres aldri (målt: samme strenger på samme plass). Et for langt sett stopper i fase 1 – å trekke inn trinnene hjelper ikke. Låst avstand (hengelås på trappa, 120, eller låst sone, 105) løses ikke i det hele tatt: trinnene får den låste verdien, repos får feltet (eller den låste verdien når feltet er tomt).

Med ulik avstand på trinn og repos flytter overgangens rute seg med forskjellen, så behovet er bare stykkevis lineært. Margin-proben måler derfor på motoren selv i disse tilfellene (regula falsi, få runder) i stedet for formelen.

## Eksempel (4 trinn + repos 120 + 6 trinn, 210 cm bred, 98 m kabel)
| | Trinn | Repos | Behov |
|---|---|---|---|
| Før / valgene av | 12,8 cm | 12,8 cm | 98,05 m |
| «Prioriter trinn» | 5,0 cm | 42,1 cm | 98,00 m |
| 60 m kabel, «Prioriter trinn» | 38,5 cm | 90,0 cm (taket) | 59,99 m |
| Repos-felt 15, ingen løsning nødvendig | 5,0 cm | 15,0 cm | 103,96 m |

Bilder i `docs/238/`: `foer-*` (valgene av), `etter-*` («Prioriter trinn»), `felt-*` (repos-felt 15): panel, PDF side 1 (plan), side 2 (sidevisning), side 3 (tabell).

## Tester
- Ny `_stairLandingMarginRegressionTest238`: **57/57**. Del A: elleve trapper (rett, repos, soner, låst sone, hestesko begge valg, låst trapp, repos øverst) gir samme hash av hele utlegget og forslagslista som koden før 238 – fasiten er målt på HEAD-kopien. B–J: repos-feltet, «Prioriter trinn», repos på taket → trinnene → for kort, soner og låst sone, forslag, hengelås, hestesko, PDF-blokka, panelet.
- Hele suiten (`docs/238/probe/alle.mjs`): 103 tester. De 102 gamle gir **nøyaktig samme resultat som HEAD**. Ingen eksisterende test er endret.
- **Åtte** er røde uten innlogging, på HEAD og nå (ikke sju): `_prosjektlaasRegressionTest` 66/67, `_kundeforslagRegressionTest` 270/271, de fem geo-testene (kaster), `_takRegressionTest216` 56/58.

## Funn jeg ikke rettet
- Suiten har åtte røde på HEAD, ikke sju som i oppdraget. Ikke undersøkt hvilken som er kommet til.
- Sidevisningen er et snitt langs trappa og viser ikke avstand fra sidene i det hele tatt (heller ikke før). Verdien står i planen og i tabellen.
- Endrer brukeren «Avstand sider» mens et forslag er valgt, løses ikke forslaget på nytt (slik var det også før). De to nye kontrollene løser settet på nytt.
- Sonepanelets 75 %-varsel regner fortsatt med trinnenes avstand på sonens smaleste flate, også når den er et repos.
- Tallene i panelet har punktum («42.1 cm»), som resten av trappepanelet.
- Edit-verktøyet var sperret i økta; alt er lagt inn med patch-skript (`docs/236/probe/pb.js`).
