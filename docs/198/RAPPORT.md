# 198 · Prosjektstatus: tilbudsnummer og ordrenummer fra Visma

**Dato:** 06.11.2026 · **Branch:** `main` · **Ikke pushet.** · **SQL er skrevet, ikke kjørt.**

## Kort fortalt

- Når et prosjekt settes til **Tilbud sendt**, kommer et lite felt «Tilbudsnr. (Visma)». Ved **Vunnet**
  (også «Vi fikk jobben») kommer «Ordrenr. (Visma)». Feltet er valgfritt. Statusen er alt lagret når feltet
  vises, så «Hopp over» eller tomt felt mister ingenting.
- Numrene kan **rettes eller legges inn senere** to steder: ved å klikke på nummeret i prosjektlista, og i
  «Kunde & prosjektinfo» inne i prosjektet (der uavhengig av status).
- Numrene **vises** kort og grått under statusen i prosjektlista («Tilbud 104455 · Ordre 2026-7719»), og de
  er **søkbare** i søkefeltet. «ordrenr» i søkefeltets tekst stemmer nå.
- Priset PDF som setter Tilbud sendt: ingen dialog, bare meldingen «Prosjektet er satt til Tilbud sendt» med
  knappen «Legg inn tilbudsnr.».
- Batch-endring er uendret (ingen nummerfelt).
- **Du må kjøre én SQL-fil** (nederst). Før den er kjørt, virker alt som før 198: feltene er skjult, og
  statusendringer lagres som vanlig.

Bilder: `liste.png`, `liste-1100.png`, `liste-installator.png`, `dialog-tilbud-sendt.png`, `dialog-rette-senere.png`, `melding-pdf.png`, `prosjektinfo.png`.

## Det du må gjøre

1. Åpne Supabase → SQL Editor, lim inn hele `supabase-migration-visma-tilbud-ordrenr.sql` (står nederst her) og kjør.
   Svaret skal vise `visma_kolonner = 2`. Fila kan kjøres flere ganger.
2. Last Varmeplan på nytt i nettleseren (appen husker «kolonnene mangler» til siden lastes på nytt).
3. Prøv: sett et prosjekt til Tilbud sendt, skriv et nummer, søk på nummeret.

**Rekkefølge:** kjør SQL-en *før* koden pushes til varmeplan.no. SQL-en er bare to nye, tomme kolonner og
påvirker ikke koden som ligger ute i dag. Pushes koden først, får hver bruker den gule meldingen «databasen
er ikke oppdatert (198)» én gang per økt ved første statusendring, til SQL-en er kjørt.

## STEG 0 — målt før endring (linjenummer i `index.html` på HEAD `60a4c74`)

### 0.1 Alle steder som endrer `sales_status`

Alle går gjennom én skriver, `_setProjectStatus` (:103016). Eget prosjekt → kolonnene på `romtegner_projects`.
Delt prosjekt (046) → raden i `project_org_status` (`_setOrgProjectStatus`, :103276).

| Sted | Funksjon | Fra → til | Nummerfelt etter 198 |
|---|---|---|---|
| Statusnedtrekket i raden (:102949) | `_quickSetStatus` (:103114) → `_applySalesTransition` (:103056) | hvilken som helst → valgt | Ja: Tilbud sendt → tilbudsnr., Vunnet → ordrenr. |
| «Vi fikk jobben» (installatør, :103368) | `_plWeGotTheJob` (:103385) | → vunnet | Ja: ordrenr. |
| «Endre status» for flere (`modal-batch-status`, :2728) | `_batchAction('status')` (:101988) → `_applyBatchStatus` (:102017) | valgte → valgt | Nei (uendret) |
| Priset PDF-eksport | `exportPDF` (:88589–88591) | under_arbeid → tilbud_sendt (bare da) | Melding med lenke, ingen dialog |
| Signert garantibevis | `_docGenerate` (:96192, statuslinja :96267) | → vunnet + leveranse ferdig | Nei (se spørsmål 5) |
| «⋯ → Tapt …» | `_plMarkLost` (:103398) | → tapt | Nei |
| «⋯ → Angre» / Angre i toasten | `_plUndoStatus` (:103409) | → forrige status | Nei (nummeret blir stående) |
| Tapt-årsak | `_applyLostReason` (:103160) | bare `lost_reason` | Nei |

`_convertToProsjektering` (:103086) skriver `delivery_status`, ikke `sales_status`. `admin.html`, `sw.js` og
`supabase/` skriver ikke status.

### 0.2 Hvor prosjektinfo kan redigeres etter opprettelse

| Sted | Hva | Funksjon |
|---|---|---|
| Inne i prosjektet: klikk på prosjektinfo-blokka øverst i sidepanelet (:2251) | Kontaktperson, adresse, matrikkel, boligmappenr., prosjektert av | `_wfKundeModal` (:81786) → `_wfKundeSave` (:81896) |
| Inne i prosjektet | Navn / kunde | `editProjName`, `_spiPickCustomer` |
| Prosjektlista, radknappene | Navn (blyant), kunde (bygning), status (nedtrekk) | `_inlineRenameProject` (:102971), `_quickSetCustomer` (:103634) |

Lista har ingen høyreklikkmeny og ingen egen «rediger prosjektinfo»-dialog.

### 0.3 Søketekst og kolonner

`_filterProjectsList` (:102709–102722) bygger én streng per prosjekt: navn, adresse (`description`),
prosjektert av, kunde (fritekst), kontaktperson, prosjektnr., og fra kunderaden navn, telefon og e-post.
Hvert ord i søket må finnes et sted i strengen. Det fantes ikke noe ordrenummer der.

Lista har åtte kolonner (:1773–1785): avkryssing · Firma · Prosjekt · Prosjektert av · Type · Status · Oppdatert · knapper.

### 0.4 Finnes det lignende kolonner fra før?

Nei. I repoets SQL-filer har `romtegner_projects` ingen `erp_*`, `visma_*` eller `order_no`. Det som ligner
ligger andre steder: `customers.erp_customer_no` (kundenummer), `organizations.erp_format`, tabellen
`erp_customers`. Dette er lest fra SQL-filene i repoet, ikke fra live-databasen (jeg har ikke tilgang til den).
Migrasjonen bruker `add column if not exists`, så den er trygg også om kolonnene skulle finnes.

### 0.5 Mobilappen (`varmeplan-app`)

**Ikke målt.** Denne økta fikk ikke lese `~/Code/varmeplan-app` (både søk og lesing ble avvist av
tilgangsreglene), så jeg kan ikke si om appen leser eller viser salgsstatus. Appen er ikke endret.
Det eneste jeg vet, er fra notatene etter 171: appen (172) skulle lese samme statusdefinisjon som web
(`project_org_status` for delte prosjekter). Det er ikke bekreftet i dag. De to nye kolonnene er uansett
nye og valgfrie, så de kan ikke ødelegge noe appen gjør i dag — med mindre appen skriver hele prosjektraden
tilbake med en fast kolonneliste (da ville den bare latt numrene stå urørt).

## Hva som er gjort, og hvorfor slik

### Lagring: to kolonner, ikke prosjekt-JSON

`visma_offer_no` og `visma_order_no` er vanlige tekstkolonner på `romtegner_projects`, ved siden av
`sales_status`. De ligger **ikke** i prosjekt-JSON-en, av to grunner: lista og søket leser dem uten å åpne
prosjektet, og et nummer rettet fra lista kan ikke bli skrevet over av autolagringen i et åpent prosjekt.
Prosjektnummeret (`project_no`), filnavn, PDF og Visma-eksport er ikke rørt.

**Statusen lagres først, nummeret etterpå.** `_setProjectStatus` er uendret. Nummeret skrives av en egen,
liten skriver (`_setProjectVismaNo`) som bruker samme mønster: rett kolonneoppdatering, `.select('id')`, og
`error` leses. Jeg la bevisst ikke nummeret inn i selve statusskrivet: mangler kolonnene, ville hele
oppdateringen feilet og tatt statusen med seg. Slik kan et nummer som ikke lar seg lagre, aldri koste en
statusendring. Skriveren rører ikke `status_changed_at` (tilbudets alder nullstilles ikke av at du retter et nummer).

Feiler lagringen av nummeret, blir dialogen stående med det du skrev, og feilen vises i den.

### Ved statusendring (ett prosjekt)

Samme mønster som «Hvorfor ble prosjektet tapt?»: statusen lagres, så kommer et lite felt.

- Tilbud sendt → «Tilbudsnr. (Visma)». Vunnet og «Vi fikk jobben» → «Ordrenr. (Visma)».
- Forhåndsutfylt med det som står i databasen (leses ferskt, så en kollegas nummer kommer med).
- Enter eller «Lagre» lagrer. «Hopp over», Esc eller klikk utenfor lukker uten å skrive.
- Maks 30 tegn. Mellomrom foran og bak fjernes, flere mellomrom blir til ett. Bokstaver, tall og tegn som
  `-` og `/` er lov.

### Priset PDF som setter Tilbud sendt

Ingen dialog. Når overgangen faktisk slår til (prosjektet var «Under arbeid»), vises meldingen
«Prosjektet er satt til Tilbud sendt» med knappen «Legg inn tilbudsnr.» i ti sekunder. Knappen åpner feltet.
Er prosjektet alt Tilbud sendt/Vunnet/Tapt, skjer ingenting (som før). Meldingen står litt høyere enn de
vanlige meldingene, så den ikke dekker «PDF lagret: …».

### Rette senere

- **Prosjektlista:** klikk på det grå nummeret under statusen. Dialogen viser begge feltene.
- **Inne i prosjektet:** «Kunde & prosjektinfo» har fått «Tilbudsnr. (Visma)» og «Ordrenr. (Visma)» side om
  side. De virker uansett status. Bare felt du faktisk endrer, skrives. I et skrivebeskyttet prosjekt (060)
  vises numrene, men kan ikke endres.

### Visning i lista — hvorfor ikke en ny kolonne

Lista har alt åtte kolonner, og «Firma» og «Prosjekt» trenger bredden. Numrene står derfor på en egen grå
linje **under statusen**, i Status-kolonnen: «Tilbud 104455 · Ordre 2026-7719». Lange numre kuttes
med «…», hele nummeret står i verktøytipset.

Målt (fem rader, `probe/bredde.mjs`), Status-kolonnen uten → med nummerlinje:

| Skjermbredde | Status-kolonnen | Radhøyde | |
|---|---|---|---|
| 1400 px | 137 → 219 px | 52 → 57 px | Det er plass: begge numrene på én linje. Firma 245 → 216, Prosjekt 284 → 251. |
| 1100 px | 108 → 137 px | 52 → 57 (ett nummer) / 72 (to) | Linja brytes mellom tilbudsnr. og ordrenr. |
| 900 px | 102 → 103 px | som 1100 | Kolonnen blir ikke bredere. |

Første utgave hadde linja på én ubrytelig linje. Da ble kolonnen 82 px bredere uansett skjerm. Nå tar den
plassen bare når den finnes, og brytes i to når lista er trang (`liste-1100.png`).

Mangler nummeret som hører til statusen, står et dempet **«+ Tilbudsnr.»** eller **«+ Ordrenr.»** der. Da ser
du med ett blikk hvilke tilbud som ikke har fått nummer — det var poenget med «lett å følge opp». Hintet
vises bare for bedrifter som bruker Visma (`organizations.erp_format` er satt), så en elektriker uten Visma
ikke får det på hver rad. Et nummer som finnes, vises for alle.

Numrene står også i underteksten på prosjektradene i kundekortet.

### Søk

Begge numrene er med i søkestrengen i `_filterProjectsList`. Den brukes av både prosjektlista og
kundekortet, så søket virker begge steder.

### Delte prosjekter (046)

På et prosjekt Cenika har delt med en elektriker, står numrene på Cenikas rad. Elektrikeren kan ikke skrive
den raden (RLS), og numrene er Cenikas egne. Derfor: ingen felt, ingen visning og ingen søketreff for den
delte bedriften. Se spørsmål 2.

### Prosjektlås (060)

Nummerskrivingen er gatet på `S.ui.readOnly` og `S.ui.kundeMode`/`presentPublic`, som annen skyskriving.
Fra prosjektlista holdes ingen lås, så der kan numre rettes selv om en kollega har prosjektet åpent — på
samme måte som status i dag. Låsetriggeren i databasen gjelder bare `data`-kolonnen og slår ikke til.

## Før og etter at SQL er kjørt

| | Før SQL | Etter SQL (+ last siden på nytt) |
|---|---|---|
| Prosjektlista laster | Ja. Første forsøk på å hente de nye kolonnene feiler stille, lista hentes med gammelt kolonnesett. Forsøket gjentas ikke i samme økt. | Ja, med numrene |
| Statusendring | Lagres som før | Lagres som før, så kommer nummerfeltet |
| Nummerfelt ved statusendring | Vises ikke. Første gang i økta kommer en gul melding: «Statusen er lagret. Tilbudsnr. og ordrenr. fra Visma kan ikke fylles inn ennå — databasen er ikke oppdatert (198).» | Vises |
| Felt i «Kunde & prosjektinfo» | Skjult | Vises |
| Numre i lista og søk | Ingenting | Vises og er søkbare |
| PDF → Tilbud sendt | Melding uten knapp | Melding med «Legg inn tilbudsnr.» |
| Batch | Uendret | Uendret |

Ingen krasj i noen av tilfellene, og ingen statusendring går tapt.

**RLS:** ingen nye policyer. `"Eier kan oppdatere prosjekter"` (UPDATE) gjelder hele raden: den som kan
endre status i dag, kan lagre numrene. Dette er lest fra policy-lista du målte live 02.11.2026 (gjengitt i
`supabase-migration-project-shares.sql`) og fra SQL-filene i repoet (ingen kolonnevise `grant`). Jeg har
ikke målt mot live-databasen i dag. Skulle lagring gi «du har ikke tilgang», er det her det ligger.

## Kjent og bevisst

- **Last siden på nytt etter SQL.** Appen husker «kolonnene mangler» resten av økta (slik at lista ikke gjør
  et mislykket forsøk hver gang). Etter at SQL er kjørt, må fanen lastes på nytt én gang.
- **Angre** setter status tilbake, men lar nummeret stå (spørsmål 6).
- **Dupliser** kopierer ikke numrene (kopien er en ny rad uten nummer). Det er riktig: en kopi er ikke samme tilbud.
- **Signert garantibevis** (setter Vunnet) gir ingen nummerdialog (spørsmål 5).
- **Bedrift uten Visma:** feltet vises ved statusendring, men lista maser ikke med «+ Tilbudsnr.» (spørsmål 1).
- **`_vismaNoRegressionTest198`** er ny. I `_projectStatusRegressionTest` (171) er nummerdialogen koblet ut
  (to linjer), ellers ville testen latt en dialog stå igjen på skjermen. Ingen forventninger er endret der.
- En feil jeg laget og fanget underveis: en kommentar bak søkelinja slukte `.filter().join().toLowerCase()`,
  så søk på navn sluttet å virke. Testen F5 avslørte det; rettet, og F4b tester nå vanlig søk eksplisitt.

## Endrede filer

- `index.html` — ny seksjon «198 · TILBUDSNR. OG ORDRENR. FRA VISMA» (rett etter 171-seksjonen):
  `_vismaNoClean`, `_vismaNoRead`, `_setProjectVismaNo`, `_vismaNoAfterStatus`, `_vismaNoOpen`,
  `_vismaNoDialog`, `_plVismaNoHtml`, `_vismaNoOfferSentToast`, `_wfVismaNo*`, `_vismaNoRegressionTest198`.
  Koblet inn i: `_fetchProjectList` (ny øverste rung + tre felt), `_filterProjectsList` (søk),
  `_renderProjectList` (raden), `_cardProjectRowHtml` (kundekortet), `_quickSetStatus`, `_plWeGotTheJob`,
  `exportPDF` (meldingen), `_wfKundeModal`/`_wfKundeSave`, og litt CSS.
- `supabase-migration-visma-tilbud-ordrenr.sql` — ny. **Ikke kjørt.**
- `docs/198/` — rapport, spørsmål, bilder og verktøy (`probe/`).
- `STATUS.md`.

Mobilappen er ikke rørt. Ingenting er pushet.

## SQL du skal kjøre (hele fila)

`supabase-migration-visma-tilbud-ordrenr.sql` — lim inn i Supabase → SQL Editor → Run.

```sql
-- ============================================================
-- 198-web: tilbudsnr. og ordrenr. fra Visma paa prosjektet.
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent (kan kjores flere ganger). Ren ASCII.
--
-- Onsket (Fredrik 02.11.2026): ved "Tilbud sendt" skal tilbudsnummeret fra Visma kunne
-- fylles inn, ved "Vunnet" ordrenummeret. Gjor det lett aa folge opp senere.
--
-- To nye, valgfrie tekstkolonner paa romtegner_projects. Fritekst (bokstaver og tall),
-- klienten trimmer og kutter paa 30 tegn. NULL = ikke fylt inn.
--
-- Dette er Cenikas egne numre fra Visma Global. De er IKKE Varmeplans prosjektnummer:
-- project_no, triggeren romtegner_projects_assign_no og filnavn rores ikke.
--
-- RLS: INGEN endring. "Eier kan oppdatere prosjekter" (UPDATE) gjelder hele raden, saa
-- den som kan endre status i dag, kan ogsaa lagre numrene. Laas-triggeren
-- romtegner_projects_lock_guard_trg er "before update of data" og slaar ikke til her
-- (samme som for sales_status).
--
-- Appen virker ogsaa FOER denne fila er kjort: feltene skjules, og en statusendring
-- lagres som foer.
-- ============================================================

alter table romtegner_projects add column if not exists visma_offer_no text;
alter table romtegner_projects add column if not exists visma_order_no text;

comment on column romtegner_projects.visma_offer_no is '198: tilbudsnummer fra Visma (fritekst, valgfritt)';
comment on column romtegner_projects.visma_order_no is '198: ordrenummer fra Visma (fritekst, valgfritt)';

-- --- VERIFISER -------------------------------------------------------------
-- Skal gi 2.
select count(*) as visma_kolonner
  from information_schema.columns
 where table_schema = 'public'
   and table_name = 'romtegner_projects'
   and column_name in ('visma_offer_no', 'visma_order_no');
```

Fila er ikke kjørt av meg, heller ikke mot en lokal testdatabase (det ble avvist i denne økta). At den tåler
å kjøres to ganger, følger av setningene selv: `add column if not exists` gjør ingenting andre gang,
`comment on column` skriver bare samme tekst på nytt, og den siste setningen er en ren `select`.

## Test

Alt er testet i headless Chrome mot **en minne-kopi av Supabase** (ingen innlogging i denne økta, og jeg skal
ikke kjøre SQL-en). Det betyr: logikken, skjermbildene og feilveiene er målt, men ikke mot den ekte databasen.
Håndsjekken under tar det siste stykket.

| # | Test fra prompten | Resultat | Hvor det er målt |
|---|---|---|---|
| 1 | Tilbud sendt med nummer → vises i lista og er søkbart | OK | `_vismaNoRegressionTest198` C1–C4, F1, F4, F7 · `liste.png` |
| 2 | Samme prosjekt → Vunnet med ordrenr. → begge vises | OK | C5, C8, F7 |
| 3 | Tomt felt → status lagres, ingen nummer vises | OK | C6, C7, F11 |
| 4 | PDF som setter Tilbud sendt → melding med lenke, ingen dialog | OK | G1–G4, ende-til-ende med ekte `exportPDF` (`probe/x3.js`), `_pdfSavePickerRegressionTest195` 43/43 · `melding-pdf.png` |
| 5 | Batch virker som før, ingen nummerfelt | OK | D1, D2 |
| 6 | Redigere nummeret i ettertid → lagres og vises | OK | C10 (lista), H1–H3 («Kunde & prosjektinfo») |
| 7 | Uten migrasjon → ingen krasj, status lagres, tydelig melding | OK | E1–E9, H6 |
| 8 | Migrasjonen kan kjøres to ganger | **Ikke kjørt** — følger av setningene (se under SQL-en) | — |
| 9 | Eksisterende tester grønne | Like med HEAD | se under |

**Hele regresjonssettet, HEAD mot ny kode** (hver test i sin egen fane, `probe/alle.mjs` + `probe/sammenlign.js`):

- HEAD: 65 tester, 58 grønne, 2927 deltester.
- Nå: 66 tester, 59 grønne, 2994 deltester. Den nye er `_vismaNoRegressionTest198` (67/67).
- **Alle 65 gamle tester gir nøyaktig samme tall som på HEAD.**
- De sju som er røde, er røde på HEAD også, og har ingenting med 198 å gjøre: `_prosjektlaasRegressionTest`
  66/67 og `_kundeforslagRegressionTest` 270/271 (begge trenger en innlogget bruker), og fem `_geo*`-deltester
  som kaster når de kjøres alene (de er laget for å kalles fra en samletest).

Ende-til-ende for PDF (ekte `exportPDF`, priset, minne-database): status ble `tilbud_sendt`, meldingen kom
med knappen, ingen dialog åpnet seg av seg selv, knappen åpnet feltet, nummeret ble lagret. Ny eksport av
samme prosjekt ga ingen ny melding. Eksport uten priser rørte ikke status.

### Håndsjekk for deg (etter at SQL er kjørt og siden er lastet på nytt)

1. Sett et prosjekt til **Tilbud sendt** → feltet kommer → skriv et nummer → «Lagre». Nummeret skal stå grått under statusen.
2. Skriv nummeret i søkefeltet → prosjektet skal være eneste treff.
3. Sett samme prosjekt til **Vunnet** → skriv ordrenr. → begge numrene vises.
4. Sett et annet prosjekt til Tilbud sendt og trykk «Hopp over» → status er endret, raden viser «+ Tilbudsnr.».
5. Klikk på «+ Tilbudsnr.» eller på et nummer → begge feltene kan rettes.
6. Åpne et prosjekt → klikk prosjektinfo øverst i sidepanelet → de to feltene står nederst → endre → «Lagre».
7. Eksporter en priset PDF fra et prosjekt som er «Under arbeid» → grønn melding med «Legg inn tilbudsnr.».
8. Kryss av to prosjekter → «Endre status» → som før, uten nummerfelt.

Gir punkt 1 «du har ikke tilgang», er det UPDATE-policyen (se RLS-avsnittet). Si fra, så ser jeg på det.

## Spørsmål

Ti stykker i `docs/198/SPØRSMÅL.md`. De viktigste: 1 (skal bedrifter uten Visma få feltet), 2 (skal
elektrikeren se Cenikas tilbudsnr. på et delt prosjekt), 3 (numrene i PDF og Visma-eksport) og 9 (mobilappen
ble ikke lest i denne økta).

`liste-installator.png` viser installatørvisningen (faner + «Vi fikk jobben»): nummerlinja står mellom
statusen og knappen, og en slik rad blir 18 px høyere (65 → 83).
