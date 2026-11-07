# 201 · Hent bygg ved klikk i kartet

07.11.2026 · `main`, én commit, ikke pushet. Ingen ny SQL, `varmeplan-roof` er ikke endret.

## Kort

Kartets verktøylinje har fått knappen **«Hent bygg»**. Når den er på, viser markøren et trådkors. Et klikk
henter omrisset av bygget du klikker på, og legger det inn i `S.geo[etasje].candidates`. Der vises det grått
som de andre kandidatene, og snappingen virker mot det med en gang. Etter et treff slår modusen seg av.
Bommer du, kommer meldingen «Fant ingen bygning her», og modusen blir stående så du kan klikke på nytt.
Esc eller et nytt trykk på knappen avslutter. Trykk + dra mens modusen er på panorerer kartet, men henter
ingenting. `g.chosen` blir aldri rørt. «Bytt bygg» i ⋯-menyen er fortsatt veien til å bytte bygg.

Live mot Fly (headless Chrome, ekte klikk i lerretet), kartet hentet for Steinliveien 1:

| Klikk | Svar | Resultat |
|---|---|---|
| Storgata 1, Hønefoss (4,5 km fra nullpunktet) | 1,1 s | «Hentet butikkbygning (363 m²) …», 1 ny rad |
| Samme bygg igjen | 0,1 s (tjenestens cache) | «… var hentet fra før — omrisset er oppdatert», fortsatt 1 rad |
| Tomt punkt (236700, 6679500) | 0,9 s | «Fant ingen bygning her», ingen rad, modusen står på |
| Nabobygget i sør | 0,1 s | 1 ny rad, nå 3 omriss i `_geoSnapPolys()` |

`g.chosen` var byte-likt etter alle fire. Skjermbildet ligger i `docs/201/live-4km.png`.

## STEG 0

### 1. `/roof/locate` med east/north virker

```
curl … -d '{"east":233598.159,"north":6682393.678}'   → 200 på 8,0 s (kald, ikke i cache)
```
Svaret ga 11 kandidater. De **5 nærmeste har omriss** (alle INSPIRE: enebolig 106 m² på 0,0 m,
garasje 59 m² på 8,6 m, enebolig 18 m, kjedehus 26 m, enebolig 28,5 m), og de 6 neste har `footprint: null`
(32,6–38,3 m). Hele svaret ligger i `docs/201/probe/locate-steg0.json`.

**Hvor langt tjenesten leter** (lest i koden, ikke gjettet):
- `SEARCH_RADIUS_M = 40.0` i `varmeplan-roof/app/api/locate.py`. Matrikkelens bygningspunkter hentes i en
  bbox på ±40 m og filtreres så til en sirkel på 40 m. Avstanden måles fra klikket til **bygningens
  representasjonspunkt**, ikke til omrisset.
- Omriss hentes bare for de **5 nærmeste** (`candidates[:5]`). De andre får `footprint: null`.
- Omrisset for et bygningspunkt: INSPIRE-polygonet som inneholder punktet, ellers det nærmeste innen
  `NEAREST_TOLERANCE_M = 5.0` (`app/geo/footprint.py`). Finnes det ikke noe INSPIRE-omriss, brukes et omriss
  avledet fra DOM1 i et vindu på 40 × 40 m.
- Tjenesten cacher svar i 7 døgn per nøyaktig koordinat. Derfor tok klikk nr. 2 på samme punkt 0,1 s.

Hva det betyr for klikket: et bygg blir funnet når representasjonspunktet ligger innen 40 m fra klikket
**og** bygget er blant de 5 nærmeste punktene. Klikker man inne i et stort bygg (> ~80 m langt), kan punktet
ligge mer enn 40 m unna. I tett bebyggelse kan bygget man klikker i, havne som nr. 6 eller lenger ut og
dermed mangle omriss. Begge deler gir «Fant ingen bygning her» (se spørsmål 1).

### 2. Dagens kode

- `_roofFetchBackground` fyller `S.geo[floorId] = { address, addrPoint, center, chosen, candidates }`.
  Hver kandidat lagres som `{ bygningsnr, type, distance_m, pointWorld, footprintWorld, footprintSource,
  footprintConfidence }`, og `footprintWorld` regnes med `_geoToWorld(bg, e, n)`. Den nye hentingen skriver
  **nøyaktig samme form**.
- `_geoSnapPolys()` tar `chosen` og alle kandidater med omriss. En ny rad er derfor med uten flere endringer.
- `_geoHitCandidate` har ingen kallere (død kode siden 006/007). `_geoChooseCandidate` kalles bare fra
  «Bytt bygg» i ⋯-menyen. Ingen av dem er rørt.

### 3. `_worldToGeo` 4 km unna

`_worldToGeo` er ren lineær regning fra `east0/north0`, og den har ingen grense. Testen viser at 4 000 m øst
for nullpunktet gir nøyaktig 400 000 cm, og at tur-retur avviker mindre enn 1 mm. Live: klikket på
Storgata 1 (verdens-x = 334 813 cm fra nullpunktet) sendte `east 236846.291 / north 6679297.916` til
tjenesten. Det er nøyaktig punktet som ble beregnet, og tjenesten fant bygget med rett bygningsnummer
(159160750). Vinduet `east0/north0` er altså bare nullpunktet.

## Hvor modusen ligger, og hvorfor

**Knappen** står i kartets ctxbar, ved siden av ⋯. Det er både den faste «Bakgrunn»-gruppa
(`_bgCtxGroupHtml`) og gruppa for valgt kart. Det er der kartets andre handlinger ligger. Knappen vises bare
når aktiv etasje har et geo-kart (`_geoPickBtnHtml`).

**Modusen** er en egen tilstand, `_geoPick`, etter samme mønster som merkemodus (034): én variabel og fire
kroker som alle starter med `if (_geoPick …)`. De ligger øverst i hver sin håndterer og returnerer før noe
annet kjører:

| Håndterer | Krok | Hva den gjør i modusen |
|---|---|---|
| `canvas mousedown` | første linje | Venstreknapp: start panorering (`_panning`, samme `_panMove` som håndverktøyet) og husk trykkpunktet |
| `canvas mousemove` | rett etter `_lastCanvasClient` | Panorerer, eller viser trådkors/«progress» |
| `_canvasMouseUp` | første linje | Slipp ≤ 5 px fra trykket = hent bygget der. Ellers var det panorering |
| `dblclick` | første linje | Svelges |
| `keydown` | før merkemodus-linja | **Bare** Esc avslutter modusen. Andre taster går videre som før |

Jeg valgte ikke «ett klikk = hent, ingen panorering». Med Mac-styreflate er dra-for-å-panorere det
naturlige, og brukeren må kunne flytte seg til bygget uten å gå ut av modusen. Panoreringen bruker den
eksisterende `_panning`-flaggen, så `_canvasDragActive`/`_endCanvasDrag` (107) avslutter et drag som slippes
utenfor lerretet. Et slikt slipp ligger normalt langt fra trykkpunktet og henter derfor ingenting.

Andre vern:
- Modusen kan ikke slås på i skrivebeskyttet prosjekt (`_lockToast`) eller mens en tegnemodus står på.
- Etasje og bakgrunn bindes **ved klikket** (lærdommen fra 162). Byttes kartet mens kallet går, blir ingenting
  skrevet (`kind: 'gone'`).
- Feil vises med `err.message` fra `_roofFetch`. Det er samme tekst som resten av `_roofApi`, ingen ny variant.
- Mens kallet går, står det «Henter bygg …» på knappen og en pulserende ring ved klikket.

## Hvilket bygg som legges inn

Tjenesten svarer med opptil 5 omriss. Jeg legger inn **bare det omrisset klikket ligger i** (eller som er
≤ 1 m fra kanten, slik at et klikk på selve veggstreken teller). Uten den regelen ville et klikk på plenen ved
siden av et hus stille lagt inn naboen. Det ville også gjort «klikk uten bygning gir ingen rad» umulig. Se
spørsmål 2 om de andre fire også bør legges inn.

**Ingen duplikater:** finnes bygningsnummeret fra før (fra adressesøket eller et tidligere klikk), oppdateres
raden. `distance_m` regnes fra adressens senter (`g.center`), slik som de andre radene, så «Bytt bygg» viser
en meningsfull avstand. Prosjekter uten `S.geo[etasje]` (gamle eller ufullstendige) får en tom struktur med
`chosen: null`.

## Hva en kandidat veier

Kandidatene lagres som verdens-cm i prosjektets `data`, på samme måte som før.

| Bygg | Punkter | Lagret |
|---|---|---|
| Enebolig, Steinliveien | 9 | 600–618 B |
| Garasje, Steinliveien | 11 | 732 B |
| Butikkbygning Storgata 1 | 23 | 1 279 B |
| Testfikstur (kvadrat) | 5 | 280 B |

Regelen er omtrent **60 B per hjørne + 80 B**. Mesteparten er flyttall-støy (`334813.1999999983`). Avrundet
til 1 mm blir en enebolig 400 B i stedet for 600 B (spørsmål 4). 100 hentede bygg ≈ 60–130 kB. Det er ikke
et problem før noen henter et helt boligfelt.

## Slik er den vanlige klikk-kaskaden sikret

1. **I koden:** alle krokene er `if (_geoPick && …)`, og `_geoPick` er `null` med mindre knappen er trykket.
   Uten modus kjører altså nøyaktig samme kode som før. Ingen eksisterende linje i kaskaden er endret, og det
   finnes ingen ny gren *inne i* den.
2. **Test med ekte hendelser** (`_geoPickRegressionTest201`, del 10). Et rom legges oppå bygget, og ekte
   `mousedown`/`mouseup` sendes til lerretet:
   - modus av: klikket **velger rommet**, ingen kart-kall, kandidatlista uendret
   - modus på: samme slags klikk velger **ikke** rommet, og bygget hentes
   - modus på, trykk + dra: kartet panoreres, ingen kall
3. **Mutasjonsprøve.** I en kopi gjorde jeg hentingen om til et lag som alltid er på (modusen slås på av seg
   selv ved første klikk). Da blir tre rader røde: «modus av: vanlig klikk på rommet velger rommet»
   (`null`), «… gjør ingen kart-kall» (1 kall) og «modus på: klikket henter bygget» (et ekstra kall). Testen fanger altså akkurat den regresjonen 007
   advarte mot. Kall-tellingen bet først etter at jeg la inn 50 ms ventetid, fordi kallet går etter et par
   mikrooppgaver.
4. **Hele regresjonssettet** mot HEAD: se under.

## Tester

`_geoPickRegressionTest201`: **34/34**, med stubbet fetch og ingen ekte nettkall. Lerretet er 0×0 bak
innloggingsskjermen i headless Chrome, så testen viser appen midlertidig for de ekte klikkene og setter den
tilbake etterpå. Testen dekker:
klikk i kjent bygg → kandidat med omriss · samme bygg to ganger → én rad · klikk uten bygning → melding, ingen
rad, modusen på · tjenesten svarer ikke (502) → `_roofFetch`-teksten · nytt omriss i `_geoSnapPolys()`, og
`_geoSnap` snapper til hjørnet · `g.chosen` uendret (sjekket fire ganger) · koordinat 4 km unna, også i selve
forespørselen · kartet fjernet mens kallet går → ingen rad · Esc · lagring · kaskaden (se over).

`_geoRegressionTest` (med `_geoScaleRegressionTest` og `_geoTileRegressionTest194`): **140/141**, likt med
HEAD. Den røde raden «142: ctxbar sier «Kartet slutter her …»» er rød også på HEAD (kjent fra 168/194).

Hele settet (`docs/201/probe/alle.mjs`, hver test i egen fane) mot HEAD: **69 av 69 eksisterende tester er like med HEAD**, test for test (3 121 deltester). Den nye `_geoPickRegressionTest201` gir 34/34. Røde både før og etter: `_prosjektlaasRegressionTest` 66/67 og `_kundeforslagRegressionTest` 270/271 (krever innlogging), og fem `_geo*`-deltester som kaster når de kjøres alene. Alle fem er grønne gjennom `_geoRegressionTest` over.

## Filer

- `index.html`: blokken «201 · HENT BYGG» etter `_geoChooseCandidate`, fem kroker (mousedown, mousemove,
  mouseup, dblclick, keydown), knappen i to ctxbar-grupper, ventering i `drawGeoFeatures`, og testen
  `_geoPickRegressionTest201` foran 194-testen.
- `docs/201/probe/`: `live.js` (live mot Fly), `tomt.sh` (finn punkt uten bygning), `t.js` (kjør testen),
  `geo.js`, `alle.mjs`/`sammenlign.js`, og curl-svarene fra STEG 0.
