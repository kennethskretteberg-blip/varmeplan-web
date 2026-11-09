# 220 · Prosjektstatus — ny status «Grossist» — rapport

09.11.2026 · `main` · én commit, ikke pushet · **én ny SQL-migrasjon, ikke kjørt** · `varmeplan-app` ikke rørt.
(Nummeret 220 er brukt fra før av «Tak 220 tegn møne», `docs/220/`; derfor ligger denne i `docs/220-grossist/`,
samme løsning som 216–219, se SPØRSMÅL 1.)

## Kort

Kenneth 09.11.2026: «På status i prosjektlista ønsker vi et nytt valg som heter "Grossist". Det er for prosjekter
hvor vi kun tegner/prosjekterer for grossistene. De gir pris til elektrikerne selv.»

- Ny salgsstatus **Grossist** (`grossist`, lilla `#a855f7`) sist i `SALES_STATUSES`.
- Kan velges i chipen på raden, i masseendringen (avkryssede rader → Status) og i kundekortets prosjektliste;
  kan filtreres på i nedtrekket (leverandør: rett etter Tapt) og i kundekortet; vises som chip med navn og farge.
- **Databasen må oppdateres før statusen kan lagres**: `supabase-migration-grossist-220.sql` (se under).
  Uten den avviser databasen verdien, og appen sier nå *«Kunne ikke lagre status — databasen kjenner ikke
  denne statusen ennå (kjør supabase-migration-grossist-220.sql)»* i stedet for bare «Kunne ikke endre status».
- Ingen eksisterende status er endret eller fjernet. Priser er ikke rørt (SPØRSMÅL 4).

## STEG 0 — det som fantes

### Statuslistene (`index.html`, blokken «PROJECT STATUS & TYPES», ~linje 3652)

Det er **to** lister. Den som vises i prosjektlista er `SALES_STATUSES` (akse A, salgstrakt):

| # | id | Navn | Farge |
|---|----|------|-------|
| 1 | `under_arbeid` | Under arbeid | `#94a3b8` grå |
| 2 | `tilbud_sendt` | Tilbud sendt | `#3b82f6` blå |
| 3 | `vunnet` | Vunnet | `#22c55e` grønn |
| 4 | `tapt` | Tapt | `#ef4444` rød |
| 5 | `grossist` | **Grossist** (ny, 220) | `#a855f7` lilla |

Ved siden av: `DELIVERY_STATUSES` (akse B, leveranse — Klar for montering, Under montering, Montert – venter dok,
Klar for levering, Levert, Ferdig; bare `ferdig` brukes av listene i dag) og `LOST_REASONS` (tapt-årsak).

Den eldre `PROJECT_STATUSES` (Utkast `#94a3b8`, Planlagt `#8890a4`, Pågår `#eab308`, Tilbudsklar `#3b82f6`,
Ferdig `#22c55e`, Arkivert `#6b7280`) hører til den gamle `status`-kolonnen. Lista er definert, men **ingen
kode leser den** (målt: ett treff i fila, definisjonen). Grossist er ikke lagt til der (SPØRSMÅL 10).

### Hvor statusen lagres

I **Supabase**, som kolonner — ikke i `data`-blobben:

- Eget prosjekt: `romtegner_projects.sales_status` (+ `delivery_status`, `lost_reason`, `status_changed_at`).
- Delt prosjekt (046/171): én rad per (prosjekt, bedrift) i `project_org_status.sales_status`.

Begge kolonnene har en **CHECK-begrensning** som bare godtar de fire gamle verdiene:

- `romtegner_projects`: inline `CHECK (sales_status IN ('under_arbeid','tilbud_sendt','vunnet','tapt'))` fra
  `supabase-migration-project-status.sql` — automatisk navn (normalt `romtegner_projects_sales_status_check`).
- `project_org_status`: `project_org_status_sales_chk` fra `supabase-migration-prosjektstatus-per-org.sql`.

Ingen enum, ingen oppslagstabell, ingen RPC/trigger som validerer verdien (målt i alle `*.sql`). Derfor
**trengs en migrasjon**. Indeksen `romtegner_projects_active_idx` (`WHERE sales_status <> 'tapt'`) dekker
Grossist automatisk.

### Alle stedene statusen brukes (målt med grep på `_salesStatus`, `SALES_STATUSES`, `sales_status`)

| Sted | Funksjon / linje | Hva skjer med Grossist |
|------|------------------|------------------------|
| Prosjektlista, chip (select på raden) | `_renderProjectList` ~112114, `_quickSetStatus` | Valg + farge fra `SALES_STATUSES` → virker |
| Prosjektlista, statusnedtrekk | markup ~1815, `_PL_STATUS_OPTS_SUPPLIER`, `_plStatusOpts`, `_plSyncStatusSelect` | Nytt valg «Grossist» etter Tapt (leverandør). Installatør-nedtrekket (faner) uendret |
| Filteret | `_filterProjectsList` ~111928 | Hadde en egen kopi `['under_arbeid','tilbud_sendt','vunnet','tapt']` → leser nå `SALES_STATUSES`. «Aktive» viser Grossist (ikke tapt/ferdig) |
| Installatør-faner | `_projectStage`, `_plRenderStageTabs`, `_plRowActionsHtml` | Grossist = «Prosjektert» (alt som ikke er vunnet/ferdig/tapt). «Vi fikk jobben»-knappen vises der. SPØRSMÅL 9 |
| Masseendring | `_batchAction('status')` ~111185, `_applyBatchStatus` | Chips fra `SALES_STATUSES` → virker (målt E5) |
| Kundekortet | `_renderCustomerCardProjects` ~104218 (nedtrekk), `_cardProjectRowHtml` ~104832 (chip) | Begge fra `SALES_STATUSES` → virker (målt D4) |
| Dashbord-tellere | `_renderDashStats` ~114093 | Faste nøkler under_arbeid/tilbud_sendt/vunnet/tapt: Grossist teller bare i «Totalt», ikke i vinnraten. Uendret — SPØRSMÅL 5 |
| «Vi fikk jobben» | `_plWeGotTheJob` | Setter `vunnet` uansett utgangspunkt — også fra Grossist |
| Tapt / Angre | `_plMarkLost`, `_plUndoStatus`, `_promptLostReason` | Uendret; Angre tilbake til Grossist virker (samme skriver) |
| Priset PDF → Tilbud sendt | `exportPDF` ~97663 | Betinget på `sales_status = 'under_arbeid'` → et Grossist-prosjekt flyttes **ikke** (målt E6). SPØRSMÅL 7a |
| Signert garantibevis → Vunnet + Ferdig | `_docSign…` ~105443 | Ubetinget → også fra Grossist. SPØRSMÅL 7b |
| Visma tilbudsnr./ordrenr. | `_vismaNoAfterStatus` ~112854, `_vismaNoMissing` ~113021 | Bare for tilbud_sendt/vunnet → Grossist spør ikke, mangler ingenting (målt E3/E7) |
| Dokumentasjon-fanen | ~104925 | Viser bare `vunnet` → Grossist vises ikke der (som under_arbeid/tilbud_sendt) |
| Presentasjonslenka | — | Leser/skriver ikke `sales_status` (målt: ingen treff). Status 'applied' der er presentasjonens egen |
| PDF (innhold) | — | Skriver ikke statusen i PDF-en; bare overgangen over |
| Skriver | `_setProjectStatus` → kolonnene / `_setOrgProjectStatus` → `project_org_status` | Begge sender verdien rett til databasen; ingen validering i JS |
| Feltappen `~/Code/varmeplan-app` | `src/lib/projectStatus.ts`, `src/db/repo.ts` | Se under |

### Feltappen (kun lest)

Appen leser `sales_status` via `select('*')` og lagrer lokalt (SQLite, `src/db/repo.ts`). Regelen i
`src/lib/projectStatus.ts` `projectStage`: `tapt` → ingen liste, `delivery 'ferdig'` → Ferdig, `vunnet` →
Til montering, **alt annet → Prosjektert**. Et Grossist-prosjekt havner derfor i lista «Prosjektert» med
chipen «Prosjektert» — **ingen krasj, ingenting rart**. Typen `SalesStatus` er bare en TypeScript-type
(ingen kjøretidssjekk). Datakontrakten (`docs/datakontrakt-web-app.md` §5b) lister de fire verdiene;
bør oppdateres i en egen app-prompt. Appen skriver bare `vunnet` («Vi fikk jobben»)/`tapt` selv.

## Bygget

`index.html` (fem steder) + én ny SQL-fil:

1. `SALES_STATUSES`: `{ id:'grossist', label:'Grossist', color:'#a855f7' }` sist.
2. Statisk markup `#dash-filter-status`: `<option value="grossist">Grossist</option>` etter Tapt.
3. `_PL_STATUS_OPTS_SUPPLIER`: `['grossist','Grossist']` etter Tapt (foran «Ferdige leveranser»).
4. `_filterProjectsList`: `SALES` leses fra `SALES_STATUSES.map(s => s.id)` i stedet for en egen kopi.
5. `_plStatusErrText`: en avvist CHECK (`violates check constraint … sales …`) gir en melding som sier at
   migrasjonen må kjøres.
6. Ny `_grossistRegressionTest220` (30 deltester, falsk database med og uten migrasjonen).
7. `supabase-migration-grossist-220.sql` — **ikke kjørt**.

## Migrasjonen — må kjøres før statusen kan lagres

Fil: `supabase-migration-grossist-220.sql`. Kjøres manuelt i Supabase Dashboard → SQL Editor (lim inn hele
fila, Run). Idempotent. **Additiv**: den slår opp CHECK-begrensningen på `romtegner_projects.sales_status`
i `pg_constraint` (navnet antas ikke), fjerner den bare hvis den mangler `grossist`, og legger den inn
igjen med de fire gamle verdiene **pluss** `grossist`. Samme for `project_org_status_sales_chk` (hoppes
over om tabellen fra 171 ikke finnes). Ingen rader, RLS, triggere eller indekser røres; `delivery_status`
og `lost_reason` er urørt. Siste SELECT i fila viser begge definisjonene — begge skal inneholde `grossist`.

Før migrasjonen: alt annet virker som før; velger man Grossist, avvises lagringen av databasen (23514),
raden går tilbake til den lagrede statusen, og meldingen sier hva som mangler (målt F1–F4).

## Test

`_grossistRegressionTest220` **30/30** (`docs/220-grossist/probe/t220.mjs`, headless Chrome mot
`localhost:4000`, falsk database):

- A: Grossist finnes, står sist, egen farge; de fire gamle er bit-identiske.
- B: nedtrekket (leverandør) har Grossist etter Tapt, før Ferdige leveranser; Visma-varianten beholder den;
  `<select>` har valget etter synkronisering; installatør-nedtrekket uendret.
- C: filter «Grossist» → bare g1; «Aktive» og «Alle statuser» tar den med; de fire andre filtrene viser den
  ikke; `_projectStage` → prosjektert; kundekortets filter (samme hjelper).
- D: raden har select med «Grossist» valgt i `rgb(168,85,247)`, alle fem valg; kundekortets rad viser navn
  og farge; dashbord-tellerne tåler verdien.
- E: Under arbeid → Grossist lagres (delivery null, lost_reason null, status_changed_at satt); Grossist →
  Tilbud sendt → Grossist via chipen; Tapt → Grossist rydder årsaken; masseendring; priset PDF (betinget)
  flytter ikke Grossist; ingen Visma-dialog.
- F: uten migrasjonen: raden uendret, meldingen nevner `supabase-migration-grossist-220.sql`, ingen
  Angre-oppføring, de gamle statusene lagres fortsatt.

Skjermbilder (falsk database, uten innlogging): `liste-alle-statuser.png` (fem rader, fem chips) og
`liste-filter-grossist.png` (bare Rådhusgata 4). `vis.mjs` lager dem.

**Ikke målt mot ekte Supabase** (ingen innlogging i denne økta): «lagret etter omlasting» er dekket av at
skriveren sender verdien uendret til kolonnen, og av migrasjonen. Kjør migrasjonen, sett et prosjekt til
Grossist, last siden på nytt.

Hele regresjonssuiten (`alle.mjs`, alle `_…RegressionTest…` i fila, hver i egen fane) mot HEAD (219):
92 tester (91 på HEAD + den nye), 84 grønne på HEAD og 85 nå (den nye medregnet), 4 280 deltester. Én ulik: `_vismaNoRegressionTest198`
K9 forventet den gamle nedtrekkslista bokstavelig (`…,tapt,ferdig,trash`) og ble rød (118/119); forventningen er oppdatert
med `grossist` etter `tapt` og kjørt på nytt → 119/119 (`probe/t198.mjs`). De sju røde er de samme som på HEAD og
uten innlogging (prosjektlås E, kundeforslag L/138, fem geo-tester som kaster uten karttjenesten) — se
`probe/sammenligning.txt`.

## Filer

- `index.html` — fem steder + ny regresjonstest.
- `supabase-migration-grossist-220.sql` — ny, ikke kjørt.
- `docs/220-grossist/RAPPORT.md`, `SPØRSMÅL.md`, `liste-alle-statuser.png`, `liste-filter-grossist.png`,
  `probe/` (`cdp.mjs`, `t220.mjs`, `vis.mjs`, `alle.mjs`, `sammenlign.js`, `alle-head.json`, `alle-etter.json`).
- `docs/endringslogg.md`, `STATUS.md`.
