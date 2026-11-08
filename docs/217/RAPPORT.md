# 217 · Rydding: STATUS.md, og `S.geo` tømmes ved nytt prosjekt — rapport

08.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.

## Kort

- `_resetProjectState` setter nå `S.geo = {}`, på linja rett før `S.tak`. Det er hele kodeendringen. Resten i `index.html` er testen.
- **Feilen var verre enn meldt.** Den var ikke bare arv i minnet: «Opprett prosjekt» **lagret** forrige prosjekts adresse, kandidater og valgte bygg i det nye prosjektets JSON.
- `STATUS.md` er rettet: 204–216 er pushet, origin står på `b18956f`.
- **Tester:** ny `_takRegressionTest217` 26/26. De 83 andre gir samme resultat som på HEAD. Sju av dem er røde både før og etter, se under.

## STEG 0

| Spørsmål | Funn |
|---|---|
| Hva nullstiller `_resetProjectState`? | Prosjekt, etasjer, rom, varmeelementer, visning, valg, `S.bgs`, `S.bgRefs`, `S.tak` og tak-verktøyene. `S.geo` var ikke med. |
| `S.tak` nullstilt fra 204? | Ja, med kommentaren «204 · 210». |
| Hvorfor ble `S.geo` utelatt? | Ingen grunn funnet. `S.geo` kom inn i 005 (`d40d3e5`), som endret `_buildSaveData`, `_restoreProject` og etasjesletting, men ikke `_resetProjectState`. Det ser ut som en forglemmelse. |
| Leser noe den før `_restoreProject`? | Ingen leser trenger gammelt innhold. De fem produksjonskallene til `_resetProjectState` fortsetter med nytt prosjekt, lagring eller prosjektlista. Alle produksjonslesere av `S.geo` tåler et tomt objekt (`S.geo && S.geo[fid]`). |

### Måling (`probe/steg0.mjs`)

Prosjekt med tak, kart, to kandidater og valgt bygg, og deretter nytt prosjekt langs den ekte `_createProjectInline`. Bare lagring og åpning mot Supabase er stubbet, siden headless ikke er innlogget.

| Målt | Før 217 | Etter 217 |
|---|---|---|
| `S.geo` rett etter `_resetProjectState` | `{"1":{"address":"Prosjekt A-veien 1",…}}`, samme objekt | `{}`, nytt objekt |
| `S.bgs` / `S.tak` rett etter | tomme | tomme |
| `geo` i JSON-en «Opprett prosjekt» lagrer | etasje 1, 2 kandidater, «Prosjekt A-veien 1» | `{}` |
| Ny tak-etasje får id | 1, samme som forrige prosjekt | 1 |
| `_activeGeo()` i det nye prosjektet | `null` | `null` |

**Hva som faktisk var galt:** på skjermen fant jeg ingen følge. `_activeGeo`, panelet og `_takChooseBuilding` krever alle kart, og kartet nullstilles. Feilen lå i dataene: etasje-id-ene starter på nytt, så gamle data havnet på den nye etasjen og ble lagret der.

## Tester

`_takRegressionTest217`, 26/26:

- **A. Nytt prosjekt etter tak-prosjekt:** `S.geo` er tom, ingen kandidater, ingen valgt bygning, og «Opprett prosjekt» lagrer `{}`.
- **B. Åpne lagret prosjekt med kart:** `S.geo` fylles som før. Rundturen er byte-identisk for `geo` og for hele prosjektet (uten `savedAt`, og fra andre runde, som i 206).
- **C. Bytte mellom to kartprosjekter med samme etasje-id:** hvert viser sine egne kandidater, og en endring i det ene smitter ikke. Gjelder også åpning uten nullstilling først.
- **D. Snø, egen test:** hele `_roofGo`-flyten (med stubbet fetch) etter en nullstilling fyller `S.geo`, kartet er georeferert, og neste snøprosjekt arver ingenting.

**Motprøve** (`probe/motprove.mjs`): samme test mot gammel kode gir 20/26. De seks røde er nettopp arvetestene (to rett etter nullstilling, lagringen, kandidatene og to i snø). Sjekkene «panelet nevner ikke» og «kan ikke velges» er grønne også på gammel kode, som målingen over forklarer.

### Hele regresjonen (`probe/sammenligning.txt`)

| | Tester | Grønne | Deltester |
|---|---|---|---|
| HEAD (`b18956f`) | 83 | 76 | 3867 |
| Nå | 84 | 77 | 3893 |

Alle 83 eksisterende er like med HEAD, og ingen er endret. **Ikke alle er grønne.** Sju var røde også før 217, og kjøringen er uten innlogging:

- `_prosjektlaasRegressionTest` 66/67 og `_kundeforslagRegressionTest` 270/271.
- Fem `_geo…`-deltester kaster når de kjøres alene, fordi de krever `results`. Kjørt samlet med `await _geoRegressionTest().async` gir de **140/141 både på HEAD og nå**. Den røde er «142: ctxbar sier Kartet slutter her».

Jeg har ikke undersøkt disse sju videre, fordi de er uendret og ligger utenfor prompten.

## STATUS.md

«Sist gjort» og «Neste steg» er skrevet fra `git log`, `git rev-parse origin/main` og `SPØRSMÅL`-filene. Den gamle teksten ba om push av 199, 200 og 201, men de ligger allerede på origin, så det er fjernet. At 3D-motoren ikke er bygget, står med henvisning til tak-planen, fase 8.

## Ikke gjort

- `_restoreProject` og resten av `_resetProjectState` er ikke rørt. Ikke pushet.
- Lagrede prosjekter med arvede data er ikke ryddet (spm. 1). Ingen ekte innlogget kjøring er gjort.

Spørsmål: `SPØRSMÅL.md`.
