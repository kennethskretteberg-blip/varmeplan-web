# 168 · Kart: målestokken (Kenneth 31.10.2026, «5 m målt som ca. 1 m»)

**Kort konklusjon: jeg fant ingen målestokkfeil i noe ledd, ikke ved 200 m og ikke ved 80/120 m.**
Hypotesen om at 142 (200 m som standard) ødela målestokken stemmer ikke etter målingene under.
Jeg har derfor **ikke endret noen produksjonskode** — «ikke endre før du vet hvilket ledd som er galt»
ga ikke noe ledd. Det som er lagt inn er vakten (ny test) og målescriptene, slik at neste avvik
fanges, og slik at Kenneth kan sjekke sitt eget prosjekt (se «Gamle prosjekter»).

Observasjonen er likevel ikke avvist: jeg har ikke adressen eller prosjektet han målte på, og kan
ikke logge inn. Se spørsmål 1–3 i `SPØRSMÅL.md` — det er der videre graving må starte.

## STEG 0 — målt, ledd for ledd

Testadresse: Steinliveien 1, 3518 Hønefoss (E 233598.159, N 6682393.678, EPSG:25833), ekte tjeneste
(`varmeplan-roof.fly.dev`), ekte klientkode i Chrome (CDP).

| Bestilt `size_m` | `geo` fra tjenesten (`width_m` / `px` / `m_per_px`) | Dekning i bildet (målt) | `widthCm` i klienten | Avstand mellom to kjente punkter i verdens-cm | Skjermmålestokk |
|---|---|---|---|---|---|
| 80  | 80 / 1600 / 0,05  | forhold 1,000 (NCC 0,996–0,998) | 8 000  | 61,033 m (sann 61,033 m, forhold 1,0000) | 150 px/m = zoom × BASE_SCALE × 100 |
| 120 | 120 / 1600 / 0,075 | forhold 1,000 (NCC 0,992–0,996) | 12 000 | 61,033 m (forhold 1,0000) | 150 px/m |
| 200 | 200 / 1600 / 0,125 | forhold 1,000 (NCC 0,998) | 20 000 | 61,033 m (forhold 1,0000) | 150 px/m |

1. **Hva ber klienten om?** `_roofFetchBackground` sender `size_m = d.sizeM`, `px = 1600`, lag `topo[,eiendom][,hillshade]`.
   `d.sizeM` kommer fra `_roofPrefs()`, som godtar bare 80/120/200 (en lagret `varmeplan_roof_prefs` med
   annen verdi faller tilbake til 200). Ingenting annet enn dette tallet påvirker utstrekningen.
2. **Hva svarer tjenesten?** `geo` er internt konsistent for alle tre (`m_per_px × px = width_m`,
   SV-hjørnet = senter − size/2). Se tabellen.
3. **Dekker bildet det geo påstår?** To uavhengige målinger:
   - *Innbyrdes:* 80 m-bildet søkt inn i 200 m-bildet over skalaer (beskåret sentrert, NCC): beste skala er
     nøyaktig 0,4000 (forventet 0,4000) — forhold **1,000**. Samme for 120 i 200 (0,6000) og 80 i 120 (0,6667).
   - *Absolutt:* matrikkelens bygningsomriss (`/roof/locate`, EPSG:25833) tegnet inn med `geo`-feltene ligger
     presist på bygningene i 200 m-bildet (Steinliveien) og i Bergen sentrum (Strandgaten, vest for sonen).
     Tromsø hentet uten feil (ikke inspisert visuelt).
   Altså: **forholdstallet er 1,000, ikke 5.** `wmts.pick_level`/`fetch_mosaic` er ikke problemet — nivå 18 for 200 m,
   mosaikk, beskjæring og skalering gir riktig dekning (ingen `fliser_mangler`-tegn: bildene har ingen hvite hull).
4. **Hva setter klienten?** `_installGeoBackground`: `bg.widthCm = geo.width_m × 100`, `bg._srcW = geo.px`,
   `originY = −heightCm`. Bekreftet i appen (se tabellen). Klikk i målemodus (ekte `mousedown`/`mouseup` på lerretet)
   mellom to punkter 500 cm fra hverandre ga en mållinje på 499 cm (rest = musepiksel ved zoom 0,027 → 1 px ≈ 25 cm).
5. **Bare 200 m?** Nei — alle tre er riktige.

## Lagrings-/gjenåpningsveien

`_buildSaveData` → JSON → `_restoreProject` bevarer `widthCm`, `heightCm`, `originX/Y` og `geo` eksakt
(målt for 80 og 200 m; bildet laster som 1600 × 1600). `_restoreProject` rører aldri bredden på en geo-bakgrunn
(`_needsCalibration = false`, `locked = true`). Ingen annen kodevei setter `widthCm` på en geo-bakgrunn
(grep over alle `.widthCm =`: kalibrering, fast målestokk, DWG/PDF-import og dra-skalering — alle skjult/sperret for
`_bgIsGeo`). Produksjons-`index.html` er byte-identisk med denne working copy (`diff` mot varmeplan.no = 0 linjer).

## Gamle prosjekter — det viktigste spørsmålet

**Svar: ingenting tyder på at lagrede mål er gale.** Mekanisme: det som lagres er `widthCm = width_m × 100` og `geo`
(begge fra tjenestens svar) — og de er riktige for alle tre størrelser. Rom og kabler lagres i verdens-cm, uavhengig av
bildet, og er målt mot `geo`-koordinatene. En feil bare i *visningen* ville ikke endret noe lagret; en feil i
*lagringen* ville krevd at `widthCm` ble feil, og det er den ikke.

**Begrensning:** jeg har ikke åpnet Kenneths ekte prosjekter (ingen innlogging) og har ikke rørt lagrede data.
Konsollsnutt han kan kjøre i et åpent kartprosjekt — leser bare, endrer ingenting:

```js
Object.entries(S.bgs).filter(([,b]) => _bgIsGeo(b)).map(([k,b]) => ({
  etasje: k, size_m: b.geo.widthM, widthCm: b.widthCm, forventet: b.geo.widthM * 100,
  mPerPx: b.geo.mPerPx, px: b._srcW, mPerPx_x_px: b.geo.mPerPx * b._srcW,
  riktig: Math.abs(b.widthCm - b.geo.widthM*100) < 1e-6 && Math.abs(b.geo.mPerPx*b._srcW - b.geo.widthM) < 1e-3 }))
```

`riktig: true` på alle rader = lagret målestokk stemmer med georeferansen. Er den `false` et sted, send meg raden.

## Vakt mot gjentakelse

`_geoScaleRegressionTest` (kjøres via `_geoRegressionTest().async`; 21 nye sjekker, 109 totalt):
stubbet `fetch`, kjører hele `_roofFetchBackground` for 80, 120 og 200 m (utsnittet bestemmes av det **klienten ber om**),
og sjekker per størrelse: klienten ber om riktig `size_m`; to punkter med kjente koordinater får avstand i verdens-cm
innenfor 1 % av sann avstand (61,03 m); bildekantene = georeferansens kanter i verden; `mPerPx × px = bredde`;
skjermmålestokk = zoom × BASE_SCALE; samme avstand etter lagring/gjenåpning.
Vaksine: `bg.widthCm = geo.width_m * 20` → 6 av sjekkene blir røde.

Det en klientside-test **ikke** kan se er om selve bildet dekker det `geo` påstår (klienten leser aldri bildepiksler).
Derfor `docs/168/maalestokk-live.py` — kjøres mot ekte tjeneste (innbyrdes skala-søk + omriss-overlegg, exit 1 ved avvik).
Kjørt nå: OK for alle tre par. Anbefaling: kjør den etter hver deploy av `varmeplan-roof`.

Den ene røde raden i `_geoRegressionTest` (`142: ctxbar sier «Kartet slutter her …»`) er **pre-eksisterende**: den feiler
identisk på HEAD uten mine endringer (headless Chrome). Rørt ikke.

## Hva jeg tror kan ha skjedd (hypoteser, ikke målt)

- Målingen skjedde på noe annet enn kartbildet: et romobjekt, en gammel/kalibrert plantegning på samme etasje, eller
  mållinjen festet til et rom i stedet for fritt på kartet. Plantegninger har kalibrering, kart har ikke.
- Lasterampen er tegnet smalere på topokartet enn virkelig bredde (topo generaliserer; rampekanter vises ofte som én linje).
  Er den virkelig ≥ 5 m, men kartet viser ≈ 1 m mellom kantene, kan det være en kartografisk forenkling, ikke målestokk.
- En nettleser/PWA som kjørte eldre kode eller en annen tjeneste-URL (`localStorage.varmeplan_roof_url`/`window.VARMEPLAN_ROOF_URL`
  overstyrer — en gammel verdi peker kanskje på en lokal/gammel tjeneste). Se spørsmål 3.

## Filer

- `index.html` — `_geoScaleRegressionTest` (ny) + kobling i `_geoRegressionTest`. Ingen produksjonslogikk endret.
- `docs/168/maalestokk-live.py` — live bildekontroll mot tjenesten.
- `docs/168/cdp/` — harness som ble brukt (`m.mjs` kjeden, `e2e.mjs` ekte klikk i målemodus, `rt.mjs` lagring/gjenåpning, `t.mjs` test).
