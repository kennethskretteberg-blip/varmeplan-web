# 049-web · Avvik fra prosjekteringen i Garantiportalen

Løp 168 (demo Cenika), 02.11.2026. Ingen migrasjon, ingen ny flate, ingen ny fane.

## STEG 0

1. **`_portal*`** (linjenummer før endring): `_renderPortal` 90994, `_portalLoad` 91011
   (`warranty_certificates … certificate_products(*, measurements(*))` — `*` betyr at nye kolonner
   kommer med uten endring i spørringen), `_portalDeviation` 91021 (= **måleavvik**, `m.ok === false`),
   `_portalStatus` 91024, bevislista `_portalApplyAndRender` 91031, KPI `_portalRenderStats` 91077,
   detaljvisning `_portalDetail` 91093.
2. **Produktene i detaljvisningen:** løkka over `cert.certificate_products` i `_portalDetail`
   (91110–91128), ett kort per produkt med navn + dimensjon/W/nominell Ω og måletabellen.
3. **Kolonnene fra 041:** app-commit `ca32c87` (041) har
   `docs/supabase-schema/supabase-migration-doc-avvik.sql` i app-repoet:
   `designed_product_id integer` + `deviates_from_design boolean default false` på
   `certificate_products`. Appen skriver dem (`swapCertificateProduct`, `writeRepo.ts`:415) og sender
   dem bare for byttede rader. **Migrasjonen er ikke kjørt** (løpet kjører ingen). Jeg stoppet ikke:
   løpet er bygget slik at ingen migrasjon kjøres, så «kjørt» kan aldri bli sant her. I stedet er
   web-delen fail-open (se under). Valget står i løp-SPØRSMÅL 34.
4. **Filtrene:** fire `<select>`/`<input>` i `#portal-filters` (index.html 1807–1824), alle
   `onchange="_portalApplyAndRender()"`, lest som verdier inne i `filtered = certs.filter(…)`.

**Viktig funn:** portalen har alt et «Avvik» — status-pillen og KPI-en «Med avvik» betyr
**måleavvik** (resistans/isolasjon utenfor grensene). Et byttet produkt kan være helt riktig
montert. Derfor er det nye begrepet overalt «avvik fra prosjektering», og den gamle KPI-en heter nå
«Med måleavvik» (bare etiketten er endret).

## De fire tilleggene

| # | Hva | Hvor |
|---|---|---|
| 1 | Merke **«Byttet»** (liten oransje kontur-pille, tooltip «Elektrikeren byttet produkt — montert avviker fra prosjekteringen») i Produkter-kolonnen når minst ett produkt avviker | `_portalApplyAndRender`, `_portalDesignChip` |
| 2 | Linje under produktnavnet i detaljkortet: **«Prosjektert: InFloor 17T 700 W · Montert: InFloor 17T 600 W»** | `_portalDetail` → `_portalDesignLine` |
| 3 | Filter **«Bare avvik fra prosjektering»** (ny `<select id="portal-filter-design">`, «Alle bevis» som standard) | index.html 1815–1819, `_portalApplyAndRender` |
| 4 | KPI **«Avvik fra prosjektering»**: `NN %` + «n av N bevis» | `_portalRenderStats` → `_portalDesignShare` |

Hjelpere i blokken «049 · AVVIK FRA PROSJEKTERINGEN» rett etter `_portalDeviation`.

**Prosjektert navn:** slås opp i `HEATING_PRODUCTS`. Den lista er filtrert til leverandørens egne
produkter (`_filterProductsByOrg`), så var det prosjekterte produktet fra en annen leverandør, hentes
navnene med **ett** `heating_products.select('id, name').in('id', …)` ved innlasting
(`_portalLoadDesignedNames`). Finnes det ikke: «Produkt #id» — ingen gjetning. Montert navn =
`product_name` på raden (appen skriver det nye navnet ved bytte).

## Hva KPI-en regner på

- **Teller:** bevis med minst én produktrad der `deviates_from_design === true` **og**
  `designed_product_id` ikke er null. Byttet tilbake til det prosjekterte → `false` → teller ikke.
- **Nevner:** alle bevis Garantiportalen viser (= det RLS gir leverandøren: bevis der deres produkter
  er montert), samme grunnlag som de andre KPI-ene. **Ikke** det filtrerte utvalget — KPI-en står
  stille når man filtrerer.
- **Svakhet:** nevneren tar med bevis der ingenting var prosjektert (rom opprettet på byggeplass,
  produkt lagt til i felt). Det kan ikke skilles ut i dag: `designed_product_id` er null både for
  «aldri byttet» og «aldri prosjektert». Andelen blir dermed heller for lav enn for høy. Spørsmål 35.
- **Før migrasjonen er kjørt:** radene mangler kolonnene. Da viser KPI-en **«—»** og «Ikke
  registrert ennå», ikke et falskt «0 %». Ingen merker, filteret gir tom liste. Lista, detaljene og
  de gamle KPI-ene virker som før.

## Tester

- Ny `_portalDesignRegressionTest` **15/15** (rene funksjoner: byttet/tilbake/aldri/blandet, bare
  boolean `true`, uavhengig av måleavvik, KPI 2 av 4 = 50 %, «—» før migrasjon, detaljlinja ordrett,
  «Produkt #id», escaping).
- CDP `docs/168/cdp/t049.mjs` (mock av `_portalLoad` og `heating_products`, ingen database): KPI
  «50 % · 2 av 4 bevis», to «Byttet»-merker, filteret gir CEN-0001 + CEN-0003, KPI uendret ved
  filter, ett navneoppslag (bare id-en som ikke er i `HEATING_PRODUCTS`), detaljlinjer for begge,
  før-migrasjon «—». 0 sidefeil. Bilder: `t049-1-liste.png`, `t049-2-detalj.png`.
- Regresjon (CDP, `rtests.mjs`): delMedElektriker 17/17, orgNr 22/22, edgeMail 14/14, kundelenke
  330/330, nyttProsjekt 25/25, bgFloor 31/31, computedStamp 19/19, pwa 13/13, appEmbed 30/30,
  gbao10 18/18, accessoryFoilQty 84/84, listevisning 54/54, profileName 15/15, prefs 47/47.
  **prosjektlaas 66/67** — raden «E: egen lås sier «Deg (annet vindu)»» feiler likt på HEAD og
  krever innlogget bruker (`_currentUser`); med `_currentUser = {id:'min-uuid'}` satt: **67/67**.
  Ikke forårsaket av 049 (samme funn som i 162).

## Til Kenneth

Kjør `supabase-migration-doc-avvik.sql` **fra app-repoet** (`docs/supabase-schema/`) — det er den
som får tallet til å vise noe. Ingen egen web-migrasjon.
