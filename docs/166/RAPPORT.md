# 166 · Forslagslenka åpner i hele planen med intro; rommets handlinger samlet på nivå 2

Commit: «166: forslagslenka — åpner i hele planen med intro (kommenter, foreslå, rett mål), rommets handlinger samlet på nivå 2 («Rett målene på dette rommet»), nivå 1 viser bare oppsummering av målendringer». Alt i `index.html`. **Ikke pushet.**
Bygger på 117/118/119/122/123/138. Spec `docs/kundelenke/spec-kundeforslag.md` regel 2/5 står: payloaden (`kundelenke_answer`) er uendret — målt (JSON gammel = ny, se Test 3).

Harness: `/tmp/cdp166/` (ny fane per kjøring, headless Chrome på 9333). Gammel kode = HEAD (7eb64db, identisk med `/tmp/cdp165/old` på port 4001 for alt dette gjelder), ny = arbeidskopien på port 4000. Fikstur: 8 rom (4 kabel, 3 matte, 1 tomt) uten innlogging (`setup.js`, fra 138).

## STEG 0 — slik var det (målt på HEAD)

**0.1 Hva vises først.** Bilder `bilder/foer-*`.

| | forslagslenke | ren presentasjon |
|---|---|---|
| Åpner i | **nivå 2, Stue** (første rom med produkter, 116/119) | nivå 2, Stue |
| Første i panelet | «← Alle rom», romhode, «Hva synes du?» | «← Alle rom», romhode, alle rader |
| Forklaring | ingen (bare kortets linje «Si fra om rommet er greit …», 138) | ingen |
| `fitAll` | zoom 0,359, panX 1150 — **kjørt FØR panelet (320 px) ble montert**: Stue begynte i x = 320, altså kant i kant med panelet, og WC var kuttet til høyre | samme |
| «Endre mål» | nivå 1, nederst (`#_pp-maal`, 107 px, etter prosjekt 78 px + romliste 397 px). Kunden måtte: «← Alle rom» → rulle forbi lista → «Endre mål». Fra et rom: ikke mulig (138 spm 2) | – |
| Mobil (375 px, åpen skuff) | nivå 1: prosjekt 62 + liste 397 + mål 115 px; «Endre mål» nederst | – |

Også målt: mållenka (`?kunde=`, modus maal) fikk det samme forhåndsvalget — `#present-detail`-kortet for Stue (areal, produkt) lå synlig til høyre fra åpning (`kort: block`). Ingen har bedt om det; 116 satte det ved et uhell gjennom `_presentEnter`. Etter 166 er kortet borte der (`kort: none`). Se spørsmål 4.

**0.2 Testene som låste 119-åpningen og `#_pp-maal`-plasseringen** (`_kundeforslagRegressionTest`), alle oppdatert med henvisning, ingen slettet:

| blokk | sjekk (før) | nå |
|---|---|---|
| K (116) | «forhåndsvalget er første rom MED produkter (Bad)», «uten produkter velges første rom», «_presentEnter bruker forhåndsvalget og tegner kortet» | K/166: forhåndsvalget finnes ikke; `_presentEnter` setter bare `presentRoomId = null` og monterer panelet før `fitAll`; `_forslagStart` setter nivå 1 |
| L (117/138) | «plassen for «Endre mål» (118) finnes (nivå 1)» | L/166: `#_pp-maal` finnes, er skjult uten rettede mål, uten «Endre mål»; + intro øverst, uten mål-lov ingen «Stemmer ikke målene» og ingen «Rett målene»; + `_presentEnter(true)` åpner på nivå 1; + ren presentasjon har én intro-linje |
| M (118) | «Mål-seksjonen finnes med Endre mål når lenka tillater det», «på nivå 2 er Endre mål skjult», «etter låsing står endringen i panelet med Angre, og Endre mål kan åpnes igjen», «lenke uten innstillingen viser ingen Endre mål» | M/166: nivå 1 uten «Endre mål» + intro med orgnavn; nivå 2 har «Rett målene på dette rommet» før kortet; etter låsing: nivå 1 «1 mål rettet · vis» → liste med hopp + Angre, raden merket, rommet lister sin egen endring, Bad ikke Stues; + 9 sjekker på målmodus fra rom (under) |
| N (119) | «forhåndsvalget finner rommet med produkter i 2. etasje», «_presentEnter bytter til rommets etasje FØR fitAll», «uten produkter noe sted: første rom i første etasje», «tom første etasje: første rom i etasjerekkefølge» | N/166: forhåndsvalget finnes ikke og `_presentEnter` bytter ikke etasje; etasjerekkefølgen (lever videre for ‹ ›) og etasjebyttet (romlista + «Rett målene») sjekkes for seg |

`_kundelenkeRegressionTest` blokk H (`_presentEnter(true)` beholder offentlig) og 039-rekkefølgen (`kundeMode` før `_presentEnter(true)`) var uberørt og er grønne.

**0.3 Mål-gatingen (118).** `_kundeMaalAktiv()` er den ene gaten (mållenka ELLER forslagslenka med `_forslagState.maal.modus`), brukt 13 steder i lerret-håndtererne. `_forslagMaalStart()` lager `_kundeState` (original, edits, vertexDelta) ved første start og slår på modus; `_forslagMaalLaas()` slår av. Hvilke rom som kan velges var ikke gatet noe sted — vegg-treffet var `hitTest(wx, wy)` rett i mousedown og i markør-grenen i mousemove, hjørne-treffet et `S.rooms.find(ptInPoly …)` begge steder. **Å starte «for ett rom» = velge rommet (`_presentPanelVelgRom`-veien: etasjebytte + `presentRoomId` + `fitRoom`) og samme `_forslagMaalStart`, pluss en gate på fire linjer** (to i mousedown, to i mousemove) — billig, så den er gjort (C under), ikke alternativet.

## Hva som er gjort

**A · Intro på nivå 1** (`_presentPanelIntroHtml`, seksjon `#_pp-intro`). Forslagslenka: øverst, FØR prosjektet (Kenneth: «det første som vises i venstrebaren bør være en god forklaring»): «Se gjennom planen og si din mening. Velg et rom i lista under, eller trykk på rommet i tegningen. For hvert rom kan du si at det er greit, foreslå et annet produkt eller en annen effekt, og skrive en kommentar. [Stemmer ikke målene? Du kan rette dem selv inne på rommet — da regner <orgnavn> om utlegget etterpå.] Til slutt trykker du Send forslag nederst.» Målsetningen bare når `maal.kan` (123). 175 px på PC, 156 på mobil. Ren presentasjon: én linje («Velg et rom i lista eller trykk i tegningen for detaljer»), 60 px, mellom prosjektet og romlista — der er prosjektnavnet fortsatt det første. Vises alltid, ingen lukking.

**B · Åpner alltid i hele planen.** `_presentEnter`: `presentRoomId = null`, `_presentAutoValgt = false`, panelet monteres (`_presentRenderDetail`), så `resizeCanvas()` + `fitAll()`. `_presentForhaandsvalgtRom` er fjernet (ingen annen bruk); `_presentRomIEtasjerekkefolge` (‹ ›, piltaster) og `_presentByttTilRommetsEtasje` (romlista, «Rett målene») står. `_forslagStart` setter også nivå 1 eksplisitt (ingen ny `fitAll` — panelet er like bredt med forslagslaget, bare foten kommer til). **Funn:** `fitAll` lå før panelmonteringen siden 117 — nå ligger den etter, så hele planen får plass ved siden av panelet (zoom 0,359 → 0,277 på 1400 px; bilde `etter-pc-forslag-aapning`). Mållenka (123) er ikke rørt i kode, men mister det utilsiktede detaljkortet (STEG 0.1).

**C · Rommets handlinger på nivå 2.**
- `#_pp-rommaal` rett under det faste hodet, før `#_pp-valgt`: rommets egne rettede mål (uten romnavn, med Angre) og knappen **«📐 Rett målene på dette rommet»**. Bare når `maal.kan`; skjult i målmodus (da står `#_pp-maal` øverst som i 138). 61 px på PC (uten endringer), 107 på mobil med én endring.
- **Ingen egen «Foreslå endring»-knapp.** Kortet «Hva synes du?» med «OK som det er / Foreslå endring» ER det valget og står alt først i kortet (138 flyttet det dit) — en knapp til hadde pekt 40 px lenger ned og gitt to «Foreslå endring» i samme skjermbilde. Kostnad: «Hva synes du?» ligger nå 101 px fra toppen (før 40); OK/Foreslå-knappene bunn 708 px (kabel) / 593 (matte) mot kroppens 719 — fortsatt uten rulling på 900 px-skjerm. Mobil: 803 mot 428 (rullet før også, 138 spm 1).
- «Rett målene …» = `_forslagMaalStart(roomId)`: etasjebytte, `presentRoomId`, `fitRoom`, så samme 118-maskineri. **Gaten er avledet, ikke lagret:** `_forslagMaalGateRom()` = det åpne rommet på nivå 2 i målmodus; `_forslagMaalRomLov(roomId)`. Mousedown og markør-grenen bruker `_kundeVeggTreff` (hitTest med rommet som foretrukket — en vegg delt med naborommet ville ellers truffet naboen — og null for andre rom) og `_forslagMaalRomLov` i hjørne-søket. ‹ › og trykk inne i et annet rom bytter rom, og gaten følger. «← Alle rom» i målmodus = alle rom som i 118 (nivå 1). Mållenka har aldri gate (`_forslagMaalModus` er false der). Hodet sier «Mål · du retter nå · Bad» og hintet «Trykk på en vegg eller et hjørne i Bad …».
- **Funn (rettet):** et tomt trykk i lerretet i målmodus (ved siden av veggen, eller på en vegg i et annet rom) gikk present-veien i `_canvasMouseUp` og satte `presentRoomId = null` → nivå 1 → gaten borte. Nå beholdes rommet ved tomt trykk i målmodus; trykk inne i et rom bytter som før.
- «Lås mål» rører ikke `presentRoomId` → tilbake til romvisningen med endringen listet og knappen igjen.
- `_forslagMaalEndringer()` bærer nå også `romNavn` og `detalj` (tekst som før); én radtegner `_forslagMaalRadHtml` for nivå 1, nivå 2 og målmodus.
- **Nivå 1 `#_pp-maal`** = oppsummering: «**1** mål rettet · vis» → liste med romnavn som hopp (`_presentPanelVelgRom`) og Angre; skjult uten endringer; ingen «Endre mål». Raden i romlista får «· mål rettet». `_forslagMaalHtml` tegner ingenting utenfor målmodus (grenen med «Endre mål» er borte).

**D · Foten** og payloaden urørt. «Hva synes du?» (122) urørt. PDF/plantegning/høyre bar urørt.

## Tester

- `_kundeforslagRegressionTest`: **271/271** (250 før; 18 oppdatert/erstattet som i 0.2, 21 nye 166-sjekker). Krever katalogen (`await _loadProducts()`).
- `_kundelenkeRegressionTest`: **328/328**. `_pdfExportSmokeTest`: **55/55**.
- ⚠ Pre-eksisterende: `_pdfExportSmokeTest` feiler (`_drawDimAnnotationsForRoom … reading 'NaN'`) når den kjøres **etter** `_kundelenkeRegressionTest` i samme fane — også på HEAD (port 4001). Alene og etter kundeforslag-testen er den grønn. Ikke rørt. Spørsmål 5.

Prompt-testene:
1. Forslagslenke åpner i nivå 1: intro øverst, romlista, hele planen (`fitAll` etter panelet), ingen `#_pp-valgt` — målt (`steg0.mjs etter`). Ren presentasjon: kort linje, ellers likt.
2. Rom fra lista og via `_presentPanelVelgRom`/trykk: nivå 2 med «Rett målene på dette rommet» + «Hva synes du?»; uten mål-lov (`maal.kan=false`) bare kortet (test M/166 og L/166).
3. Målmodus fra Bad: ekte museklikk på Kjøkkens vegg → ingenting valgt, rommet står; på Bads vegg → vegg valgt. «Lås mål» → Bad med «vegg 1 500 → 520 cm · Angre». Nivå 1 → «1 mål rettet · vis». **Payload** (mål i Bad + OK i Stue + 80 W/m² og kommentar i Kjøkken + retning i Soverom 1): JSON gammel (4001) = ny (4000), byte for byte (608 tegn, `payload-foer.json` / `payload-etter.json`).
4. Mobil 375 × 812: intro på nivå 1 i åpen skuff; nivå 2 med knappen; målmodus lukker skuffen og viser «Trykk på en vegg eller et hjørne i Bad …» + Lås mål.
5. Tester som over.

## Skjermbilder (`docs/166/bilder/`)

Før: `foer-pc-forslag-aapning` (nivå 2 Stue, plan bak panelet), `foer-pc-forslag-nivaa1` («Endre mål» nederst), `foer-pc-forslag-nivaa2`, `foer-pc-ren-aapning`, `foer-mob-forslag-nivaa1`.
Etter: `etter-pc-forslag-aapning` (intro + liste, hele planen), `etter-pc-ren-aapning`, `etter-pc-nivaa2` (Rett målene + Hva synes du), `etter-pc-maalmodus`, `etter-pc-maalmodus-vegg` (Bad · Vegg 4 valgt, 500 → 520 listet), `etter-pc-nivaa2-etter-maal`, `etter-pc-nivaa1-oppsum` / `-apen`, `etter-mob-nivaa1`, `etter-mob-nivaa2`, `etter-mob-maalmodus`.
