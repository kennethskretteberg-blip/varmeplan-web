# STATUS — prompt-serie «Stedfestet tegneflate» (001–007)

| # | Status | Commit | Repo | Notat |
|---|---|---|---|---|
| 001 | **ferdig** | `50461f7` | varmeplan-roof | skjelett, nøkkel, 9 tester grønne, ruff rent |
| 002 | **ferdig** | `7c5c331` | varmeplan-roof | `/roof/locate`, 21 tester grønne · **INSPIRE er oppe, men dekker ikke Oslo** |
| 003 | **ferdig** | `b858c0d` | varmeplan-roof | `/roof/background`, 39 tester grønne · ferdig skyggerelieff fra Kartverket |
| 004 | **ferdig** | `dd05eb1` | varmeplan-roof | `/roof/slope` + `/roof/model` + DOM1-omriss, 58 tester grønne |
| 005 | **ferdig** | `d40d3e5` | arqely-mvp | «Hent fra kart», bg.geo, ny `_geoRegressionTest` (14 sjekker) |
| 006 | **ferdig** | `e93e612` | arqely-mvp | vektorlag, snapping, helning + avstand |
| 007 | **ferdig** | `65b4241` | arqely-mvp | PDF-kreditering, hurtigtaster, dokumentasjon |
| 139 | **ferdig** | se git | varmeplan-web | «Hent fra kart» steg 1: adresseliste (Kartverket direkte), synlig tjenestestatus i dialogen, `ROOF_APP_KEY` · `_geoRegressionTest` 24 → 58 sjekker |

---

# TIL KENNETH — prioritert

**Serien er ferdig kjørt.** Alt virker mot ekte Kartverket-data lokalt. Under er det som gjenstår,
sortert etter hvor mye det blokkerer.

## 1. Blokkerer produksjon (krever dine hender)

- [ ] **Fly-deploy av `varmeplan-roof`.** Alt er forberedt (`fly.toml`, `Dockerfile`, README):
      `fly auth login` → `fly launch --no-deploy --copy-config --name varmeplan-roof` →
      `fly secrets set ROOF_API_KEY=<lang tilfeldig streng>` → `fly deploy`.
      **Dockerfile er aldri bygget lokalt** (Docker mangler på maskinen) — Fly bygger remote, men
      første deploy er også første gang den kjøres.
- [x] **Nøkkelen inn i klienten** — gjort i 139: `ROOF_APP_KEY` (konstant ved `ROOF_FLY_URL` i
      `index.html`). Samme verdi må settes i Fly, se «139 · Til Kenneth» under.

## 2. Påvirker hvor godt produktet faktisk virker

- [ ] **INSPIRE dekker ikke Norge sør for ~60 °N** (målt: Oslo 0 bygg, Hønefoss 20). Det gjør
      DOM1-avledet omriss til **hovedveien** i Oslo/Sørlandet/store deler av Vestlandet — og det
      omrisset er ~26 % større enn veggomrisset (takutstikk) med IoU 0,724 mot fasit.
      → **Send e-posten** (`varmeplan-roof/docs/epost-kartverket-inspire.md`): finnes en nasjonal
      variant? Vurder samtidig pris på FKB-Bygning via Norkart/Geodata.
- [ ] **Helningsregelen er din fagvurdering.** I dag: ≥ 6 % gir kun teksten «bratt — vurder høyere
      W/m²», ingen automatisk endring. Skal 300 → 350 W/m² foreslås over en viss helning?
- [ ] **DOM1-omriss: tak vs. bakke.** For takvarme er det ~riktig (det ER taket); for et
      bakkeareal er det for stort. Skal vi krympe det ~0,4 m når det brukes som bakkeareal?
- [ ] **400 m²-terskelen** for «kan inneholde vegetasjon» er tunet for eneboliger — i Oslo sentrum
      fikk alle omriss ⚠ fordi byggene der faktisk er 900–1600 m². Skal terskelen følge
      `bygningstype`?

## 3. Bør sjekkes, men blokkerer ingenting

- [ ] **Åpne én PDF** og se at 6,5 pt-krediteringslinja under romtegningen er lesbar. Jeg kunne
      ikke generere PDF i testmiljøet (jsPDF lar seg ikke konstruere hodeløst) — verdiene er
      verifisert, men ikke det trykte resultatet.
- [ ] **`ROOF_USER_AGENT`** har en placeholder-e-post. Kartverket kontakter den adressen før de
      blokkerer, så feil adresse = blokkert uten forvarsel.
- [ ] Standard utsnitt er **80 m** (valg 60/80/120), eiendomsgrenser **på**, terrengskygge **av**
      (koster ~1,6 s og er ikke cachet). Si fra om du vil ha andre standarder.
- [ ] **Eiendomsgrenser finnes kun som raster** i kartbildet — det går ikke å snappe til dem.
      Skal vi hente Teig-WFS som vektor (ville blitt «003b»)?
- [ ] **«Bytt bygg» ligger i ⋯-menyen**, ikke som klikk i lerretet. Hit-test-kaskaden er ømfintlig
      (rom tegnes oppå bygget) og et nytt lag der er reell regresjonsrisiko. `_geoHitCandidate`
      finnes og er testet hvis du vil ha klikket likevel.
- [ ] **`mypy` er utelatt** i `varmeplan-roof` (lumelo har det). `ruff` alene holder foreløpig.

## Hvor ting ligger

| Hva | Sti |
|---|---|
| Klient-dokumentasjon | `docs/kart-lag.md` |
| RoofModel-kontrakt (til Tak-editoren) | `~/Code/varmeplan-roof/docs/roof-contract.md` |
| Alle målinger mot Kartverket | `~/Code/varmeplan-roof/docs/datakilder.md` |
| Tjenestens README (endepunkt, cache, deploy) | `~/Code/varmeplan-roof/docs/README.md` |
| Åpne spørsmål med mine midlertidige valg | `docs/tak-modul/SPØRSMÅL.md` |

---

## 139 — «Hent fra kart» steg 1: adresseliste og synlig status · 25.10.2026

**Forutsetning som ikke stemte:** prompten sier «etter at 138 er kjørt». HEAD var `b630840` (137) —
138 finnes ikke i loggen. Bygget derfor rett på `b630840`, som også er commiten Cowork målte på.

### STEG 0 — målt på `b630840`

Alle fem bakgrunnspunkter bekreftet (linjenummer i `b630840`):
- Steg 1 var et fritekstfelt (`_roof-addr`, l. 73643); Enter → `_roofFindBuildings` (l. 73699) →
  `_roofApi.locate({ address })` (l. 73711–73712). Ingen adresseliste.
- `_roofFetch` (l. 73324): helsesjekk 2,5 s (l. 73314) → fetch → `_engineFetchWithRetry` venter
  opptil 20 s (l. 73259) → feil. Kaldstart-status bare som toast (`_roofColdStartToast`, l. 73354).
- `_roofKey()` (l. 73300) leste kun `window.VARMEPLAN_ROOF_KEY` / localStorage → tom i produksjon.
- Prosjektfeltet: `_addrSearch`/`_addrFetch`/`_addrPick` (l. 83510/83521/83544), bundet til
  `dash-addr-results`/`dash-proj-desc`, direkte mot `ws.geonorge.no` med `representasjonspunkt`.
- `varmeplan-roof` er ikke på Fly: `varmeplan-roof.fly.dev` gir **ENOTFOUND** (DNS finnes ikke).

| Måling (headless Chrome, «Finn bygg» med adresse) | Tid til feiltekst i dialogen |
|---|---|
| `window.VARMEPLAN_ROOF_URL = https://example.invalid` (localhost, ingen kaldstart-venting) | **56 ms** |
| Produksjonsveien (hostname ≠ localhost, Fly utilgjengelig) | **21,1 s** — én toast etter 0,1 s, ellers bare «Søker …» |

**Funn utenom scope:** på denne maskinen svarte `localhost:4100` med `{"status":"ok","dwg":"libredwg"}`
— det er **tolkemotoren**, ikke karttjenesten. `_roofResolveUrl` sjekker bare `r.ok` på `/health`,
så klienten velger motoren som karttjeneste og får «Fant ikke adressen» (404). 001 la inn
`service`-feltet nettopp for å kunne skille dem; klienten bruker det ikke. Skrevet i SPØRSMÅL (139-3).

### Bygget

- **A. Adresseliste i steg 1.** Felles `_kvAddrLookup(raw, { treff, prefix })` brukes av prosjektfeltet
  (6 treff, uendret) og dialogen (8 treff). Fra 3 tegn, 250 ms forsinkelse, svar på gammel tekst
  ignoreres (sekvensnummer + tekstsammenligning). Rad: adressetekst fet, «postnr poststed · kommune»,
  min. 44 px, lista ligger i flyten inne i dialogen. Pil opp/ned, Enter, Esc, klikk. Enter uten
  markering: ett treff → velg, flere → marker første + vis lista, ingen → «Fant ingen adresse som
  passer …». Valgt adresse lagres som `d.addrPoint`; `locate` får alltid `{lat, lon}` — fritekst
  sendes ikke lenger. Prosjektadresse med lagret punkt og uendret tekst går rett videre.
  **Målt mot Kartverket:** «Storg» gir 0 treff, «Storg*» 5314, «Storgata 1 Osl*» nøyaktig 1 —
  derfor legger dialogen (bare den) på `*` bak siste ord.
- **B. Synlig status.** `_roofSvcCheck` ved åpning: «Starter karttjenesten …» → skjult (oppe) eller
  «Karttjenesten er ikke tilgjengelig akkurat nå. Adressesøket virker, men kart og bygg kan ikke
  hentes.» Kaldstart-status (`coldstart`/`retrying`/`failed`) skrives i `busyText` via egen
  `_roofDlgStatus` (sendes som `onStatus` til `_roofApi.locate/background`; toasten er fallback for
  kall uten dialog, `_engine*` urørt). Feil beholder adresse + punkt og har «Prøv igjen» (`d.retry`).
- **C. Nøkkel.** `ROOF_APP_KEY` ved `ROOF_FLY_URL`; `_roofKey()` faller tilbake på den etter
  `window.` og localStorage. `_roofWarmResolve` fjernet (eneste kaller erstattet av `_roofSvcCheck`).

### Tester

`_geoRegressionTest`: 24 → **58 sjekker, alle grønne** (34 nye, asynkrone med stubbet fetch — ingen
ekte nettkall; `await _geoRegressionTest().async` gir alt). Hele regresjonssuiten (37 tester) kjørt
headless mot både ny kode og `b630840`: **identisk resultat** — de som er røde (katalog-/innloggings-
avhengige: `_kundeforslag`, `_listevisning`, `_cableZone` F, `_reserveCable` A, `_cableGeometry(rask)`,
`_prosjektlaas` E, de tre matte-testene med 0 sjekker) er like røde før 139.

### Til Kenneth

1. **Sett nøkkelen i Fly (samme verdi som `ROOF_APP_KEY`):**
   `fly secrets set ROOF_API_KEY=4793530c986eade76b152a1ad276ca83f5986349e052d126 -a varmeplan-roof`
   (og deploy tjenesten — den finnes ikke på Fly ennå, se punkt 1 øverst).
2. **Test på varmeplan.no etter push:** snø-del → etasje → «Hent fra kart». Skriv «Storgata 1 Osl» —
   lista skal komme etter ~¼ s; velg raden → «Finner bygg …». Uten Fly-tjeneste skal du se
   «Starter karttjenesten …» i dialogen, deretter den rolige linja om at kart/bygg ikke kan hentes,
   og ved «Finn bygg» feiltekst med «Prøv igjen». Adressesøket virker uansett.
3. Ikke pushet, ikke deployet (som bedt om).

**Tid:** ~2 t.

---

## 007 — PDF-kreditering, hurtigtaster, dokumentasjon · 24.09.2026

**Gjort:** Kreditering i PDF (rad på forsiden + linje med hentedato under hver romtegning),
`_SHORTCUTS`-gruppa «Kart (snø)», tom-tilstanden for snø nevner «Hent fra kart» først,
`_geoRegressionTest` utvidet til **24 sjekker** (inkl. lagre→gjenopprett av `bg.geo`, `S.geo` og
`room.terrain`), og dokumentasjonen: `docs/kart-lag.md` (ny), to avsnitt i `CLAUDE.md`, og
endepunkt-/cache-/fixture-dokumentasjon i `varmeplan-roof/docs/README.md`.

**Ikke verifisert:** PDF-generering end-to-end. **jsPDF lar seg ikke konstruere i det hodeløse
testmiljøet** (`new jsPDF(...)` kaster «Cannot read properties of undefined»), så hverken
krediteringen eller helningsradene kunne måles på papir. Jeg verifiserte i stedet vilkårene og de
faktiske strengene direkte: forsideraden blir `['Kartgrunnlag', 'Kartverket (CC BY 4.0)']`,
romside-linja blir `Kartgrunnlag © Kartverket (CC BY 4.0) · hentet 24.9.2026`, og helningsradene
får verdiene `15,7 %` / `37 %` / `241°` / `1,0 m`. **Kenneth bør åpne én PDF og se at
6,5 pt-linja er lesbar** — det er det eneste som gjenstår å bekrefte.

**Tid:** ~30 min.

---

## 005 — «Hent fra kart» · commit `d40d3e5` · 24.09.2026

**Gjort:** Kartutsnitt fra Kartverket installeres som **ferdig kalibrert** bakgrunn
(`widthCm = width_m × 100`, origo SV-hjørne, låst). `_roofApi` med egen URL-oppløsning,
`_geoToWorld`/`_worldToGeo`, tre-stegs dialog, `bg.geo` + `S.geo[floorId]` lagret og gjenopprettet,
egen ctxbar for kart. Ny `_geoRegressionTest()` (14 sjekker).

**Koordinatbeviset:** arealet regnet fra de lagrede verdens-cm gir **105,2 m²** — nøyaktig samme
tall INSPIRE oppgir — og omrisset ligger 0,9 m fra kartsenteret. Målestokken er altså riktig hele
veien fra EPSG:25833 til canvas, uten at noen har kalibrert noe.

### Tre reelle problemer funnet underveis

1. **Zoom-gulvet 0,2 er tunet for plantegninger.** Et 80 m-kart trenger ~0,076 for å få plass —
   kartet kunne verken tilpasses skjermen *eller* zoomes ut til, og brukeren så ~40 % av utsnittet
   uten vei ut. Nytt `_minZoom()` senker gulvet til 0,05 **kun** når aktiv etasje har kart-bakgrunn.
2. **Kaldstart-ventingen ga 21,7 s spinner** når den lokale tjenesten bare var stoppet — før
   nøyaktig samme feilmelding. Ventes nå kun i produksjon: **21,7 s → 0,1 s**.
3. **`_invalidateBgCache` finnes ikke** — jeg gjettet navnet. En udeklarert identifikator kaster
   `ReferenceError` selv med `&&`-vakt. Fant det i konsollen, fjernet.

**STEG 0-funn:** `S.project.address.representasjonspunkt` er **EPSG:4258-grader** (klienten kaller
adresse-API-et uten `utkoordsys`), så lat/lon-veien inn i `/roof/locate` er riktig. Deler ligger på
`S.project.parts`, ikke `S.parts`.

**Bytt-dialogen fra `8bdf684`** ble IKKE gjenbrukt: kart-bakgrunner har sin egen «Hent nytt
utsnitt» i ⋯-menyen i stedet, fordi Bytt/Ny versjon-dialogen handler om plantegninger man
importerer — et kartutsnitt hentes alltid på nytt fra tjenesten.

**Nøkkelen** ligger i `localStorage.varmeplan_roof_key` + `window.VARMEPLAN_ROOF_KEY` (som foreslått
i SPØRSMÅL). Ikke i Supabase ennå — se SPØRSMÅL.

**Tid:** ~50 min.

---

## 004 — `/roof/slope`, `/roof/model?level=quick`, DOM1-omriss · commit `dd05eb1` · 24.09.2026

**Gjort:** Helning/fallretning for et polygon (DTM1), quick-BuildingModel (gesims, taktype,
møne-anslag) og DOM1-avledet omriss som nå fyller `resolve_footprint` sin TODO fra 002.
Kontrakten i `varmeplan-roof/docs/roof-contract.md`, generert fra Pydantic-modellene.
58 tester grønne, ruff rent.

**STEG 0:** rasterio leste DTM1/DOM1 rett ut (float32, 1 m, 0,32–0,37 s) —
`tifffile`-reserveplanen var unødvendig. **`nodata` er `None` i headeren**, så det finnes ingen
markør å stole på; alt under −100 m regnes som hull. Manuell kontrollregning på testbygget ga
gesims **4,28 m** / møne 7,61 m — endepunktet gir nå 4,3 / 7,5. Innenfor promptens 2,5–9 m.

### Den viktigste målingen: DOM1-omriss mot INSPIRE-fasit

Samme bygg (Steinliveien 3), begge kilder:

| Kilde | Areal | Hjørner | IoU |
|---|---|---|---|
| INSPIRE (fasit) | 105,2 m² | 8 | — |
| DOM1 − DTM1 | 133,0 m² | 28 | **0,724** |

**+26,4 % areal.** Ikke tilfeldig støy: DOM1 ser *taket*, INSPIRE gir *veggen*, og takutstikket
forklarer mesteparten. For **takvarme er DOM1 strengt tatt riktigere** enn veggomrisset; for et
**bakkeareal er det for stort**. 1 m-rutenettet gir dessuten 28 trappetrinn-hjørner mot 8 rene.
Derfor confidence 0,5 og ⚠ til brukeren — og derfor prøver koden `minimum_rotated_rectangle`
først (IoU ≥ 0,85) for renere snapping i 006.

Dette er verdt å merke seg fordi DOM1 er **hovedveien** til omriss sør for 60 °N (se 002).

**Funn:** i Oslo sentrum fikk ALLE DOM1-omriss confidence 0,3, fordi byggene der faktisk er
900–1600 m². 400 m²-terskelen fra prompten er tunet for eneboliger → falskt varsel for legitimt
store bygg. Skrevet i SPØRSMÅL.

**Avvik fra prompten (bevisste):**
1. **scipy ble ikke lagt til.** Prompten ba om `scipy.ndimage` til morfologisk åpning; den er
   skrevet i numpy (11 linjer) i stedet — én funksjon rettferdiggjør ikke en tung ny avhengighet.
2. **Hull-andelen regnes for bygget**, ikke for hele rasteret, ellers ville et skogholt i
   utsnittet gjort taktypen «unknown» selv om huset er godt dekket.
3. **Aspekt fra midlere gradientvektor**, ikke middel av vinkler (som gir tull rundt 0/360°).

**Røyktest (live):** `/roof/model` → gesims 4,3 m, møne 7,5 m, `pitched`, 8 eave-kanter,
105,13 m², terreng 226,93 moh, 0 % hull. `/roof/slope` på hagen → 16,9 % middel, 61,9 % maks,
fall mot 246,8°, 234 celler. `/roof/locate` i Oslo leverer nå DOM1-omriss.

**Tid:** ~55 min.

---

## 003 — `/roof/background` · commit `b858c0d` · 24.09.2026

**Gjort:** Ett georeferert PNG per utsnitt — topokart + eiendomsgrenser + valgfritt
DOM1-skyggerelieff, kreditering brent inn. `widthCm = width_m × 100` → ingen kalibrering.
39 tester grønne, ruff rent. Eksempelbilde i `varmeplan-roof/docs/eksempler/`.

**STEG 0-funn som forenklet oppgaven:** WCS har en coverage `nhm_dom_topo_25833_skyggerelieff` —
et **ferdig rendret skyggerelieff**. Prompten ba om «GeoTIFF → rasterio → egen hillshade»; det er
unødvendig. Kartverkets eget er like raskt, ¼ så tungt, og holder rasterio ute av bildeveien.
Rå høyde ligger klar i `dom1.fetch_dom_tiff` til 004.

**Andre funn:** TileMatrixSet for 25833 heter **`utm33n`** (ikke «EPSG:25833»); nivå 16/17/18 =
0,3306/0,1653/0,0826 m/px; eiendomsgrense-laget heter `eiendomsgrense`; WMS maks 8192 px.

**Feil funnet av testene, som også ville rammet ekte klienter:** `X-Roof-Geo`-headeren inneholder
«©». HTTP-headere er latin-1/ASCII og Pydantic skriver rå UTF-8 → headeren lot seg ikke kode.
Rettet med `ensure_ascii=True`.

**Avvik fra prompten (bevisst):** WMTS-nivået låses ikke til 17–18 — `pick_level()` velger
groveste nivå som fortsatt er fint nok, så et 200 m-utsnitt henter ¼ så mange fliser.

### Målte svartider (80 m, 1600 px)

| Tilfelle | Tid |
|---|---|
| Kaldt, topo + eiendom + hillshade | 3,67 s |
| Varmt (flis-cache), med hillshade | 2,23 s |
| **Varmt, topo + eiendom (standard)** | **0,59 s** |
| Kaldt, 200 m-utsnitt | 4,03 s |

Hillshade koster ~1,6 s ved 1600 px (mitt første 0,5 s-tall var målt ved 400 px — korrigert) og
er ikke cachet. **Av som standard** er derfor riktig, som antatt i SPØRSMÅL.

**Tid:** ~40 min.

---

## 002 — `/roof/locate` · commit `7c5c331` · 24.09.2026

**Gjort:** Adresse/lat-lon/east-north → adressepunkt i EPSG:25833 + bygningspunkt fra Matrikkelen
innen 40 m (sortert på avstand, SOSI-koder oversatt til tekst) + omriss fra INSPIRE der det
finnes. Disk-cache, delt httpx-klient, `resolve_footprint()` som eier kilde-kjeden. 21 tester
grønne, ruff rent. Full kildedokumentasjon i `varmeplan-roof/docs/datakilder.md`.

### To funn som endrer premissene i prompten

**1. INSPIRE-WFS er oppe.** Prompten (og research-notatet fra 21.09) sier den ikke svarte — to
timeouts på 55 s. Målt 24.09: GetCapabilities svarer på **0,13–1,2 s**, hver gang. Ingen syntetisk
fixture var nødvendig; alle fixtures er ekte svar.

**2. Men dekningen utelukker Oslo — og det er den viktige nyheten.** GetCapabilities oppgir
WGS84-bbox **9,73–29,07 °Ø / 60,03–70,68 °N**. Oslo ligger på 59,91 °N, altså *under* sørgrensa.

| Adresse | Bygg fra INSPIRE |
|---|---|
| Storgata 1, 0155 Oslo (59,91 °N) | **0** |
| Steinliveien 3, 3518 Hønefoss (60,19 °N) | **20** |

Konsekvenser, i rekkefølge etter hvor mye de betyr:
- **`footprint: null` er normalt, ikke en feil.** Det blir utfallet for en stor del av landets
  befolkning (hele Oslo/Sørlandet/Vestlandet sør for 60 °N) inntil 004 leverer DOM1-omriss.
- **004 sin DOM1-fallback er ikke en reserveløsning — den er hovedveien i Sør-Norge.** Det bør
  prege hvor mye arbeid som legges i den.
- Promptens foreslåtte testadresse (Storgata 1) kan ikke brukes til omriss-testen. Den er i
  stedet den *naturlige* null-fixturen — ekte svar, ikke konstruert.
- E-posten til Kartverket er derfor verdt å sende: finnes en produksjonsvariant med nasjonal
  dekning? Utkast ligger klart i `varmeplan-roof/docs/epost-kartverket-inspire.md`.

### Andre målte funn

- **Adresse-API-felle:** med `utkoordsys=25833` heter feltene fortsatt `lat`/`lon`, men inneholder
  **nord/øst i meter**. Koden leser `epsg`-feltet og tolker deretter — aldri navnene.
- Klienten (`_addrFetch` i index.html) kaller *uten* `utkoordsys` → lagrer EPSG:4258-grader.
  Derfor tar endepunktet imot `{lat, lon}` i grader. Det er veien 005 skal bruke.
- Matrikkel: `typeNames=app:Bygning`, **kun GML** (ingen GeoJSON). `numberReturned` står som `0`
  selv når svaret har features — vi teller elementene selv.
- `bygningstype`/`bygningsstatus` er SOSI-koder (`111`, `TB`), ikke tekst. Oversettelsestabell i
  `matrikkel_wfs.py`; ukjent kode gir «Bygningstype 999» (finnes i ekte Oslo-data), aldri tomt.

### Avvik fra prompten (bevisste)

1. **Testadresse byttet** til Steinliveien 3, Hønefoss for omriss-veien (se over). Storgata 1
   beholdt som null-fixture.
2. **Omriss hentes kun for de 5 nærmeste** kandidatene, ikke alle — ett WFS-kall per kandidat, og
   lista blir lang i tett bebyggelse (Oslo ga 7, Hønefoss 8). De øvrige har `footprint: null`.
3. **Kandidater filtreres til radius**, ikke bare bbox — et kvadrat på ±40 m har hjørner 56 m ute.

**Røyktest (live):** Steinliveien 3 → 8 kandidater, enebolig 105,2 m² / garasje 59,1 m², alle med
INSPIRE-omriss. Storgata 1 → 7 kandidater, 0 omriss, 200. Ugyldig adresse → 404. Cache: 16 ms.

**Tid:** ~45 min.

---

## 001 — Nytt repo `varmeplan-roof` · commit `50461f7` · 24.09.2026

**Gjort:** Kjørbar FastAPI-tjeneste på `~/Code/varmeplan-roof`. `/health`, app-nøkkel
(`X-Varmeplan-Key`) på `roof_router`, CORS, structlog-request-logging, `fly.toml` + `Dockerfile`,
`docs/README.md` + `docs/endringslogg.md`, `scripts/record_fixtures.py` (skall). 9 tester grønne,
`ruff check` rent.

**STEG 0-funn:**
- `uv` 0.11.20 ✓, Python 3.12.13 ✓, port 4100 ledig ✓.
- **Docker finnes ikke på maskinen** → Dockerfile er *uverifisert*. Fly bygger med remote builder,
  så det blokkerer ikke deploy, men det er utestet kode.
- Lumelos CORS-liste inneholder `varmeplan.no` + `www.varmeplan.no` i tillegg til det prompten
  listet. Speilet den faktiske lista, ikke prompten.

**Avvik fra prompten (bevisste):**
1. **Nøkkelen er strengere enn bedt om.** Prompten: «Når `ROOF_DEV=1` **og** nøkkelen er tom →
   slipp gjennom». Implementert nøyaktig sånn — men i tillegg: er en nøkkel SATT, kreves den også
   i dev (ellers tester utvikleren en annen kodesti enn produksjon), og feilkonfigurert produksjon
   (ingen nøkkel, `ROOF_DEV=0`) **stenger** med 401 i stedet for å åpne. Begge tilstander logger
   advarsel ved oppstart.
2. **`/health` gir `{ok, service, version}`** som spesifisert — merk at lumelo gir `{status:"ok"}`.
   Klienten i 005 må kunne skille «tjenesten svarer» fra «noe annet svarer på porten», derfor
   `service`-feltet.
3. **`rasterio` trengte ingen reserveplan.** Prompten ba om å bytte til `tifffile` hvis wheelen
   ikke fantes. `rasterio` 1.5.1 installerte rent på py3.12/macOS-arm64 — ingen systempakker.
   Samme gjelder shapely/pyproj/pillow, derfor **ingen apt-pakker** i Dockerfile (lumelo trenger
   `libgl1` m.fl. kun for ifcopenshell/OpenCASCADE).
4. **`mypy` utelatt.** Lumelo har det; ruff dekker behovet på denne størrelsen. Lett å legge til.
5. Auth-testene monterer en minimal rute med *samme* kobling som `app/main.py`, i stedet for å
   teste en kopi av regelen — 002 arver dekningen når ekte ruter legges på `roof_router`.

**Røyktest (manuell, live):** tjenesten startet på 4100, `/health` svarte
`{"ok":true,"service":"varmeplan-roof","version":"0.1.0"}`, dev-advarselen ble logget, og
request-middlewaren ga `{"method":"GET","path":"/health","status":200,"ms":0.5}`.

**Tid:** ~25 min.

---

## 24.09.2026 — første kjøreforsøk: serien startet IKKE

**Ingen prompter kjørt. Ingen commits. Ingen filer endret utenom denne.**

### Blokkering: prompt-filene finnes ikke

Kjøreinstruksen (000) viser til sju filer som skal kjøres i rekkefølge. Ingen av dem finnes.
Søkt i: arbeidsmappa, hele git-historikken (`--all --diff-filter=A`), alle brancher, untracked
filer, samt `~/Downloads`, `~/Desktop`, `~/Documents` (maxdepth 5).

| Forventet | Status |
|---|---|
| `001-varmeplan-roof-repo.md` … `007-*.md` | **finnes ikke** noe sted |
| `planer/Varmeplan-plan-tak-modul.md` (§19, fase 3a-0) | **finnes ikke**; `planer/` finnes ikke |
| `~/Code/varmeplan-roof` | **finnes ikke** (skal opprettes av 001) |

Eneste eksisterende artefakt fra dette sporet: `docs/tak-modul/research-og-arkitektur.md`
(skrevet 21.09.2026 — datakilder, lisenser, arkitekturforslag, RoofModel-skjema).

### Hvorfor jeg ikke gikk videre

Å kjøre serien uten filene ville betydd å finne på sju detaljerte spesifikasjoner —
endepunkt-former, responsskjemaer, symbolnavn i `index.html`, UI-oppførsel — og så bygge et nytt
repo på dem. Kjøreinstruksen behandler prompt-innholdet som fasit («symbolnavnene er fasit»), så
oppdiktet spec ville gitt mye kode som ser ut som planen, men ikke er den.

Regel 4 («spørsmål stilles ikke — de skrives») gjelder designvalg UNDERVEIS i en prompt. Her
mangler selve inndataene: det finnes ikke noe å utføre. Regel 3 sier at serien skal stoppes når
noe ikke kan fikses innenfor omfanget.

### Hva kjøreinstruksen ALLEREDE låser (gjenbrukbart når filene kommer)

Dette trenger ikke gjentas i promptene — det er allerede bestemt i 000:

- Nytt repo `varmeplan-roof` i `~/Code/`, Python 3.12, FastAPI, `uv`, lokal port **4100**
- Klient: `arqely-mvp/index.html` (prompt 005–007)
- Kartbildet: **ett georeferert PNG per etasje**, installert som vanlig bakgrunn (`S.bgs`) med
  kjent cm-størrelse → ingen kalibrering, ingen kartbibliotek i nettleseren
- Lokalt verdensrom per etasje: (0,0) = utsnittets **sørvestre** hjørne, x mot øst, y positiv
  nedover, nordkant på `y = −heightCm`. Alt i `bg.geo` (prompt 005)
- Lisens: Kartverket CC BY 4.0 → «© Kartverket» i `bg.geo.attribution`, vist i ctxbar og PDF
- Bygningsomriss: INSPIRE-WFS først, OSM (ODbL) kun som merket fallback
- Tester: ingen eksterne kall — fixtures i `tests/fixtures/`, tatt opp av
  `scripts/record_fixtures.py`
- Frontend uten tjeneste skal virke (pen feilmelding, alt annet uendret)

Koordinatkonvensjonen stemmer med kodebasen: `w2s()`/`s2w()` har ingen fortegnsbytte på Y —
verdens Y øker nedover, og `drawBgImage()` tegner med `(originX, originY)` som øvre venstre hjørne.
Samme konvensjon `_installBgImage` allerede bruker (`originY = −heightCm`).

### Kenneth må gjøre

1. **Legg prompt-filene 001–007 et sted jeg kan lese dem** (f.eks. `docs/tak-modul/prompter/`),
   eventuelt lim dem inn i chatten. Blokkerer HELE serien.
2. **`planer/Varmeplan-plan-tak-modul.md`** — samme; 000 viser til §19 og fase 3a-0 som kontekst
   for hvorfor kart-laget gjenbrukes av Tak-modulen.
3. Avklar om `docs/tak-modul/research-og-arkitektur.md` fortsatt er gjeldende grunnlag, eller om
   planen har gått videre siden 21.09. Særlig §1.4 (Google Solar API sine to lisensfeller) og
   §1.1 (FKB-Bygning er ikke åpne data) er fortsatt ubesvarte og påvirker 002–004.

### Åpne spørsmål fra research-dokumentet som fortsatt står

Disse ble dokumentert 21.09 og er ikke besvart — de treffer prompt 002–004 direkte:

- Bygningsomriss via OSM er **ODbL** (share-alike på «Derivative Database»). 000 sier «OSM bare som
  fallback og merket som det — Kenneth avgjør til slutt». Trenger et faktisk svar før 002 lander,
  ellers bygges en datavei som kanskje ikke kan brukes kommersielt.
- INSPIRE bu-core2d WFS svarte **ikke** på to direkte forsøk (55 s timeout) og står ikke i
  Kartverkets eget katalogsøk — «limited dataset for test purpose». Fungerer den ikke i praksis,
  faller 002 tilbake på OSM, og da er ODbL-spørsmålet over blokkerende, ikke teoretisk.
- NDH-LiDAR: noen enkeltprosjekter er Norge digitalt-begrenset, og uttak er **asynkront**
  (jobb-kø, minutter–timer). Det er en UX-forutsetning for 004, ikke bare en teknisk detalj.

### Neste steg

Ingen. Serien står til prompt-filene foreligger. Ingenting er halvferdig — repoet er urørt og
`main` er i sync med `origin/main`.
