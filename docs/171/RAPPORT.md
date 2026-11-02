# 171-web · «Vi fikk jobben»: Prosjektert, Til montering og Ferdig i hver sin fane

Løp 168 (demo Cenika), 02.11.2026. Prompt `171-web-prosjektstatus-vi-fikk-jobben_v2.md`. Boksen øverst gjelder foran resten.

## STEG 0 — målt

1. **Planen var bygget, P1–P3, juli 2026.** Kolonnene `sales_status`/`delivery_status`/`lost_reason`/`status_changed_at`
   ligger på `romtegner_projects` og er kjørt (endringsloggen 14.07.2026). `_setProjectStatus(projectId, patch, cond)` er
   eneste skriver. `_applySalesTransition` nuller `delivery_status` (Kenneth 21.08.2026: vunnet er sluttstasjon), og
   `_deliveryCellHtml` returnerer `''`. Auto-overgangene finnes: priset PDF → `tilbud_sendt` (betinget på
   `under_arbeid`), signert garanti → `vunnet` + `ferdig`. **Koblingen (A.4):** kolonnene er fortsatt kilden for egne
   prosjekter, uendret. Den nye tabellen brukes bare for delte prosjekter. Ingen ny funksjon med samme navn.
   `_setProjectStatus` er utvidet med ruting.
2. **Prosjektlista:** én tabell (`_renderProjectList`), filter via `_filterProjectsList` (delt med kundekortet),
   status-nedtrekk `#dash-filter-status` med «Aktive» (standard), søk, type-filter, sortering `_plSort`. Ingen faner.
   `_fetchProjectList` hentet **ikke** `org_id`/`user_id`, så weben kunne ikke skille delte prosjekter fra egne.
3. **«Må dokumenteres»:** Dokumentasjon-fanen (`_renderDocPicker`) viser bare `vunnet`. Fanen er skjult for
   leverandør (`_showProjectListScreen`). Dashbordets teller-kort ble fjernet 28.08.2026. **Oppgave D er derfor
   allerede gjort.** Bekreftet i CDP (steg 6 og 7).
4. **Policyer:** `romtegner_projects` = fix-permission-settet (målt av Kenneth 02.11). 046 legger en OR-gren på SELECT.
   UPDATE er «user_id = meg eller org-medlem». Elektrikeren kan altså ikke skrive Cenikas rad. `project_shares`: eier
   leser/skriver, delt org leser egen rad. Hjelperne `project_shares_my_project_ids()` og `project_owned_by_my_org(uuid)`.

## Oppgave A — SQL (`supabase-migration-prosjektstatus-per-org.sql`, IKKE kjørt, krever 046)

- `project_org_status (project_id, org_id, sales_status default 'under_arbeid', delivery_status, lost_reason,
  updated_by, updated_at, primary key (project_id, org_id))`, samme CHECK-verdier som kolonnene, `on delete cascade`.
- Trigger `project_org_status_stamp_trg` setter `updated_at = now()` og `updated_by = auth.uid()` (klienten kan ikke
  forfalske hvem som endret).
- `project_visible_to_org(project_id, org_id)` (security definer): orgen eier prosjektet, eller har en **akseptert**
  deling på et prosjekt som ikke er i papirkurven.
- RLS: superadmin alt · **lese** = medlem av radens org ELLER prosjekteier (`project_owned_by_my_org`) · **insert/update**
  = medlem av radens org OG `project_visible_to_org` · ingen delete-policy · ingen grant til anon.
- Ingen eksisterende policy er endret. Ingen tilbakefylling. Kolonnene på `romtegner_projects` er urørt.
- Sju SQL-tester nederst i fila (alle med ROLLBACK, savepoints rundt de forventede feilene): elektriker setter status på
  delt → ok i egen org · for Cenika-orgen → avvist · på prosjekt han ikke ser → avvist · Cenika leser elektrikerens
  status → ok (men kan ikke skrive den) · tredje org → 0 · trukket deling → kan ikke lenger skrive · anon → nektet.

## Oppgave B — én leser, én skriver

- `_projectStatus(p)` → `{ sales, delivery, lost, shared, source }`. Delt (`_projectIsShared`: annen org, ikke mitt
  personlige, ikke superadmin) → min orgs rad i `project_org_status`, mangler den → `under_arbeid`. Ellers kolonnene.
- `_fetchProjectList` henter statusradene i samme runde og legger svaret i `p._salesStatus`/`_deliveryStatus`/
  `_lostReason`. Alle eksisterende lesere (filter, tellere, chip, kundekort, Dokumentasjon-fanen) følger dermed med.
  `org_id, user_id` er lagt til i de to øverste rungene i kandidatstigen.
- `_setProjectStatus` ruter: delt → `_setOrgProjectStatus` (upsert på `(project_id, org_id)`, `cond` evaluert mot
  raden der manglende rad = `under_arbeid`). Samme `{ok, reason}`. PDF → `tilbud_sendt`, garanti → `vunnet` + `ferdig`,
  chip, batch og Tapt-årsak virker dermed også for delte prosjekter (boksens punkt 4).
- Fail-open: mangler tabellen, regnes delte prosjekter som `under_arbeid`, og skriving gir `no-table` med en ærlig
  melding. Egne prosjekter virker nøyaktig som før.

## Oppgave C — hvor fanene og knappen ligger

- `index.html`: markup `#pl-stage-tabs` rett under «Lagrede prosjekter». Seksjonen «171 · PROSJEKTSTATUS PER BEDRIFT»
  ligger rett etter `_applyLostReason`. CSS `.pl-stage-*`, `.pl-won-btn`, `.pl-more-btn`, `.pl-status-menu`,
  `.pl-action-toast` og `.pl-cust-won` står etter `.pl-act-btn`.
- Installatør (`_plUseStages`: alt som ikke er leverandør, via `_effectiveOrg` så «vis som» virker): nedtrekket er
  `Etter fane · Alle statuser · Vis tapte · Papirkurv`. Fanene erstatter «Aktive».
- «Vi fikk jobben» (`_plWeGotTheJob`) = `_applySalesTransition(id, 'vunnet')`, deretter toast «Flyttet til Til
  montering · Angre». «⋯» (`_plStatusMenu`) har «Tapt …» (årsakvalget fra P3) og «Angre» (`_plUndoStatus`, setter
  forrige salg/leveranse/årsak tilbake). Chip-endringer kan også angres.
- Leverandør: lista og nedtrekket er som før. Merket «✓ Kunden fikk jobben» vises når en kundebedrift har `vunnet`.

## Skjermbilde med teskje (`t171-1-prosjektert.png`, `t171-3-montering.png`, `t171-7-cenika.png`)

Ola i Welhaven Elektro åpner Varmeplan. Under søkefeltet står tre knapper: **Prosjektert 3 · venter svar**
(valgt, blå strek under), **Til montering 1 · vi fikk jobben** (tallet i grønt) og **Ferdig 1 · dokumentert**.
Til høyre for søket står «Etter fane». I lista står tre prosjekter: Bad og vaskerom (Tilbud sendt), Kjeller Nordby
(Under arbeid) og Enebolig Berg, som Cenika har delt. Under statusen har hver rad en grønn knapp **✓ Vi fikk jobben**
og tre prikker. Ola trykker på knappen ved Enebolig Berg. Raden forsvinner, og nederst kommer en grønn stripe:
«Flyttet til Til montering» med knappen **Angre**. Fanen viser nå 2 / 2 / 1. I «Til montering» står Enebolig Berg og
Hytte Fjellro, begge «Vunnet». Prikkene gir en liten meny: «Tapt …» og «Angre».
Svein Tore i Cenika ser ingen faner, bare «Aktive» som før. Ved Enebolig Berg står et lite grønt merke:
**✓ Kunden fikk jobben**. Cenikas egen status er fortsatt «Tilbud sendt».

## Tester

- **Ny:** `_projectStatusRegressionTest` **36/36**. Den tester at manglende rad gir `under_arbeid` (og at Cenikas
  vunnet/ferdig ikke lekker), at «Vi fikk jobben» skriver `vunnet` i min orgs rad og ikke rører prosjektraden, at Angre
  gir forrige verdi (delt: `under_arbeid`, eget: `tilbud_sendt`), PDF-cond, garanti, de tre fanene, tapt, papirkurv,
  fail-open, RLS-avvisning, leverandørmerket og superadmin.
  **Avvik fra prompten:** «Vi fikk jobben gir `vunnet` + `klar_for_montering`» er testet som `vunnet` + `null`
  (boksen, løp-SPØRSMÅL 54).
- **CDP** `docs/168/cdp/t171.mjs` (mock, ingen database): åtte steg grønne, 0 sidefeil. Utskrift i `t171-utskrift.txt`.
- **Hele regresjonssettet** (ny `docs/168/cdp/rtall.mjs` kjører alle 56 `*RegressionTest`): `rt-for.txt` /
  `rt-etter.txt` er like linje for linje, pluss den nye testen. Kjente røde rader, også på HEAD:
  `_prosjektlaasRegressionTest` 66/67 (krever innlogging), `_kundeforslagRegressionTest` 270/271 (L/138), fire
  mattetester 0/0. De fire `_geo*`-deltestene (Scale/Center/OneStep/Addr) kaster når de kjøres alene. De tar `results`
  som parameter og kjøres inne i `_geoRegressionTest` (24/24). Det er en artefakt av harnessen, ikke en feil.
- `grep service_role index.html admin.html` → 0.

## SPØRSMÅL.md (løp-mappa)

53 Cenika ser kundens status (si nei = én linje i policyen) · 54 `vunnet` + null i stedet for `klar_for_montering` ·
55 definisjonen av «delt» · 56 forslag om salgs-nudge, og at PDF → `tilbud_sendt` alt var bygget · 57 Angre lever bare
i økta · 58 «Gjør om til prosjektering» skriver fortsatt rett på raden.

## Til Kenneth

1. Kjør `supabase-migration-prosjektstatus-per-org.sql` **etter** 046 (`supabase-migration-project-shares.sql`).
   Verifisering: `4 | 5 | 0`. Kjør testene nederst i fila.
2. Ingen Edge Function, ingen ny hemmelighet.
