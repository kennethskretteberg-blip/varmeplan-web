# Kart-laget — stedfestet tegneflate

Bygget i prompt-serien 001–007 (`docs/tak-modul/prompter/`). Dette dokumentet er det du trenger
for å bygge videre **uten å lese koden** — særlig for Tak-editoren, som skal gjenbruke alt her.

## Ideen på én linje

Et kartutsnitt med **kjent utstrekning i meter** *er* en kalibrert bakgrunn. Derfor trengs verken
kartbibliotek i nettleseren eller to-punkts kalibrering: tjenesten leverer ett georeferert PNG,
klienten regner `widthCm = width_m × 100`, og ferdig.

## Koordinatregelen (viktigst)

```
Utsnittets SØRVESTRE hjørne = verdens (0, 0)
x vokser mot ØST
y vokser NEDOVER (som ellers i appen) ⇒ NORD = MINKENDE y
Utsnittets nordkant ligger derfor på  y = −heightCm
```

Alt går gjennom to funksjoner — bruk dem, ikke regn selv:

```js
_geoToWorld(bg, east, north) // EPSG:25833-meter → verdens-cm
_worldToGeo(bg, wx, wy)      // verdens-cm       → EPSG:25833-meter
```

`_geoRegressionTest()` låser denne regelen (24 sjekker). Bommer man på fortegnet på y, havner alt
som snappes mot kartet speilvendt — og det er vanskelig å se på skjermen, fordi selve bildet
uansett ligger riktig. Kjør testen.

## Datastrukturene

| Hvor | Hva | Lagres? |
|---|---|---|
| `bg.geo` | `{epsg, east0, north0, widthM, heightM, mPerPx, layers, attribution, fetchedAt}` — georeferansen til kartbildet. `east0/north0` er SV-hjørnet. | Ja (`_serializeBgFields`) |
| `S.geo[floorId]` | `{address, center, chosen, candidates[]}` — valgt bygg og naboer, med `footprintWorld` i **verdens-cm**. | Ja (`_buildSaveData` → `geo`) |
| `room.terrain` | `{slope_pct_mean, slope_pct_max, aspect_deg, prov, fetchedAt}` fra `/roof/slope`. | Ja (del av rommet) |
| `room.geoDistanceM` | Korteste avstand fra valgt bygningsomriss til rommet. Rent geometrisk, ingen tjeneste. | Ja |

`delFloor` rydder `S.geo[id]` sammen med `S.bgs[id]`/`S.bgRefs[id]`.

## En geo-bakgrunn er en vanlig `S.bgs`-bakgrunn

…med `widthCm/heightCm` satt fra meter, `originX = 0`, `originY = −heightCm`, `rotation = 0`,
`locked = true`, `_needsCalibration = false`. **Ingen egen rendering-vei** — `drawBgImage` tegner
den som alle andre.

**Derfor er disse valgene skjult for geo-bakgrunner** (i `_bgSelMore` og ctxbar): roter,
speilvend, «rett opp etter vegg», «tilpass til visning», «skaler på nytt», «målestokk 1:_».
Alle ville brutt koblingen til EPSG:25833 — og dermed gjort alle koordinater feil uten at noe
ser galt ut. «Bytt plantegning» er erstattet av «Hent nytt utsnitt».

`_bgIsGeo(bg)` er sjekken. Bruk den før du tilbyr noe som endrer geometri.

## Klienten finner tjenesten selv

`_roofApi` speiler mønsteret til tolkemotoren (`varmeplan-motor`), men med **egne** konstanter og **egen** cache — en død
motoradresse skal aldri kunne blokkere kart-henting.

```
window.VARMEPLAN_ROOF_URL  →  localStorage varmeplan_roof_url  →  localhost:4100  →  Fly
nøkkel: window.VARMEPLAN_ROOF_KEY  →  localStorage varmeplan_roof_key  →  ROOF_APP_KEY (konstant, 139)
```

`ROOF_APP_KEY` er en appnøkkel (ligger i nettleseren uansett; CORS i tjenesten avgrenser bruken) og
må ha samme verdi som `ROOF_API_KEY` i Fly.

**Steg 1 i «Hent fra kart» (139):** adressesøket går **direkte mot Kartverkets adresse-API** via
`_kvAddrLookup` (delt med prosjektfeltet), ikke via karttjenesten. Brukeren velger et treff, og
`/roof/locate` får alltid `{lat, lon}` — aldri fritekst. Tjenestestatus vises i dialogen
(`_roofSvcCheck` ved åpning, `_roofDlgStatus` for kaldstart), så søket virker og brukeren ser hva
som skjer også når tjenesten er nede.

**Ett steg (142):** dialogen er bare steg 1. «Hent kart» / valg i adresselista kjører `_roofGo` =
`locate` → `background` (200 m som standard, `ROOF_DEFAULT_SIZE_M`; `px` 1600) → dialogen lukkes. Kartet
sentreres på **adressepunktet** (`query.point`), `S.geo[floor].chosen` er `null`, og alle kandidater får
omriss i `S.geo[floor].candidates` (snapping går mot alle, `_geoSnapPolys`). Kandidatlista (steg 2) og
utsnittsvalget (steg 3) ligger igjen i `_roofRender` men nås ikke i vanlig flyt — 143 gjenbruker
`_roofPick`/`_roofCandCenter`. `locate` leter bare innen 40 m fra adressen, så bygg lenger ut i
utsnittet har ikke vektoromriss. Utsnitt/eiendom/terrengskygge: `_roofPrefs()` (localStorage
`varmeplan_roof_prefs`), redigeres i «Kartinnstillinger …» i ⋯-menyen på kartbakgrunnen.

Kaldstart-ventingen (20 s) skjer **kun i produksjon**. På localhost feiler kallet umiddelbart —
der betyr «svarer ikke» nesten alltid «jeg har ikke startet tjenesten», og 20 s spinner før samme
melding hjelper ingen.

Endepunkter: `locate`, `background`, `slope`, `modelQuick`. Se `varmeplan-roof/docs/README.md`.

## Snapping

`_geoSnap(p)` kalles i `getWorldPos` for `polygon`, `rect2`, `lshape` og `hindring-polygon`.
Rekkefølge: **grid → angle → geo → (ikke re-grid)**. Traff geo-snappen, skal rasteret ikke få
trekke punktet vekk fra hushjørnet igjen — samme «lås akse, så snap til vegg»-regel som skillevegg.

Hjørne vinner over kant (et hushjørne er et mer meningsfullt festepunkt). Radius er 14
skjermpiksler, samme konstant frihånds-matta bruker. `Shift` eller `S.snap.geo = false` slår av.
«Bygg»-chipen i verktøylinja vises kun når det finnes et omriss å snappe til.

## Vektorlaget

`drawGeoFeatures()` tegnes rett etter `drawBgImage()`, **før** rommene. Omrisset er en **vektor
oppå bildet**, ikke brent inn — derfor kan det snappes til, byttes og fargelegges etter kilde:

- valgt bygg: mørkeblå heltrukken
- naboer: tynn grå (byttes via ⋯-menyen på kartet)
- `source === 'DOM1'`: **stiplet** — avledet av 1 m høyderaster, ikke målt vektordata
- `confidence ≤ 0,5`: ⚠ ved omrisset

Omrisset blir med i PDF (nyttig for montøren). Bryter «Omriss» i kart-ctxbar.

## Kreditering er et lisenskrav

Alle data er Kartverket under **CC BY 4.0**. Krediteringen følger med fire steder, og ingen av dem
er valgfrie: brent inn i selve PNG-en (tjenesten), i `bg.geo.attribution`, i ctxbar, og i PDF —
både en rad på forsiden og en linje under hver romtegning med hentedato.

OpenStreetMap brukes **ikke** (ODbL, share-alike på avledede databaser). Hele datavegen er CC BY 4.0.

## Hva Tak-editoren skal gjenbruke

1. **Kartbildet** — samme `/roof/background`, samme `_installGeoBackground`. Et tak trenger samme
   stedfestede flate som en innkjørsel.
2. **Vektorlaget** — `drawGeoFeatures()` tegner allerede omrisset; takflater legges oppå.
3. **Snappingen** — `_geoSnap` fungerer uendret for takgeometri.
4. **`_roofApi.modelQuick(footprint)`** — gir `BuildingModel` med gesimshøyde, taktype og
   møne-anslag, alt med `prov`/`confidence`. Kontrakten står i
   `~/Code/varmeplan-roof/docs/roof-contract.md`, generert fra Pydantic-modellene.

**Hva quick-nivået IKKE lover:** takflater, møner eller gradrenner. DOM1 er 1 m og har
oppoverbias; det krever punktsky (fase 2). Modellen sier det selv via `roof.planes: []` og
`confidence 0,4` på mønehøyden — ikke overtolk den.
