# 046-web · Del prosjektet — tabell og tilgangsregel

Løp 168 (demo Cenika), 02.11.2026. Én migrasjonsfil: `supabase-migration-project-shares.sql`.
**Ikke kjørt.** Kenneth kjører den. Ingen klientkode er endret (knappen kommer i 047).

## STEG 0

### 1. `supabase-migration-org-centric.sql`:52–58, ordrett

```sql
DROP POLICY IF EXISTS "Users see org projects" ON romtegner_projects;
CREATE POLICY "Users see org projects" ON romtegner_projects
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'is_superadmin' = 'true')
  );
```

**Denne policyen er ikke live.** `supabase-fix-permission.sql`:33 dropper den. Kenneth kjørte
`pg_policies` 02.11.2026 06:52 (limt inn i løpets `STATUS-MALING.md`), og der finnes den ikke.
Prompten ba om `drop/create "Users see org projects"`. Det ville ha **laget en ny, ekstra**
SELECT-policy ved siden av den som er live. Jeg har derfor endret den som faktisk er live.

### 2. Alle policyer på `romtegner_projects` (live, fra `pg_policies`), ordrett

| policyname | cmd | qual (USING) | with_check |
|---|---|---|---|
| Superadmin full tilgang prosjekter | ALL | `is_superadmin()` | null |
| Eier kan slette prosjekter | DELETE | `(user_id = auth.uid()) OR (org_id IN (SELECT organization_members.org_id FROM organization_members WHERE organization_members.user_id = auth.uid() AND organization_members.role = ANY (ARRAY['owner','admin'])))` | null |
| Autentiserte kan opprette prosjekter | INSERT | null | `(auth.uid() IS NOT NULL)` |
| Org-medlemmer ser prosjekter | SELECT | `(org_id IN (SELECT organization_members.org_id FROM organization_members WHERE organization_members.user_id = auth.uid())) OR (user_id = auth.uid())` | null |
| Eier kan oppdatere prosjekter | UPDATE | `(user_id = auth.uid()) OR (org_id IN (SELECT organization_members.org_id FROM organization_members WHERE organization_members.user_id = auth.uid()))` | null |

Kilde i repoet: `supabase-fix-permission.sql`:36–62 (stemmer med live-settet). Eldre sett som er
droppet: `supabase-migration-auth.sql`:181–197 og org-centric over.

Andre policyer som leser `romtegner_projects` (grep i alle `.sql` i begge repoer):
`project_versions` «Users manage own versions» (`supabase-fix-permission.sql`:68–75). Den har sin
egen eksplisitte `where user_id = auth.uid() or org_id in (…)` i subqueryen. En delt org består
ikke den sjekken, så den får **ikke** tilgang til versjonene. Kundelenke- og presentasjons-RPC-ene
er `security definer` og påvirkes ikke.

### 3. Prosjektlåsen (`supabase-migration-prosjektlaas.sql`)

Fem kolonner (`locked_by`, `locked_by_name`, `locked_at`, `lock_seen_at`, `lock_session`), tre
RPC-er som er `security invoker` (`project_lock_acquire/heartbeat/release`), og triggeren
`romtegner_projects_lock_guard_trg`, `before update of data`. Den reiser `PROJECT_LOCKED` når en
annen bruker har en låsing som ikke er sovende (3 min). Den hindrer bare at `data` overskrives.
Status, kundelenke og INSERT slipper gjennom.

**For en delt org:** `project_lock_acquire` gjør `select … for update`. Med RLS krever `FOR UPDATE`
at raden består UPDATE-policyen også. Den delte orgen får derfor `{ok:false, not_found:true}`.
Selv om den kom forbi, ville `update` truffet 0 rader og gitt `no_write`. Låsen er ikke det som
stopper elektrikeren. UPDATE-policyen gjør det. **047 må vise et delt prosjekt skrivebeskyttet
uten å tolke `not_found` som «prosjektet finnes ikke».**

### 4. Papirkurven (`supabase-migration-trash.sql`)

Myk sletting: `deleted_at = now()` via UPDATE. Gjenoppretting: `deleted_at = null`. Permanent er en
DELETE, og bare owner/admin får lov. RLS filtrerer **ikke** på `deleted_at`. Det gjør klienten
(web-filteret `trash`, appen hopper over i `repo.ts`:314). Permanent sletting kaskaderer til
`project_shares` (`on delete cascade`). Bevisene får `project_id = null` (`on delete set null`) og
lever av snapshot-feltene.

**Valg:** delingsgrenen krever `deleted_at is null`. Et prosjekt Cenika har kastet, forsvinner da
fra elektrikerens liste. Ellers ville det havnet i hans papirkurv, der han verken kan gjenopprette
eller slette det (løp-SPØRSMÅL 23).

### 5. Mønsteret fra `organization_supplier_access`

Koblingstabell med RLS på. «osa superadmin full» `for all using (is_superadmin()) with check
(is_superadmin())`. «osa medlemmer ser egne» `for select using (exists (… organization_members om
where om.org_id = <tabell>.org_id and om.user_id = auth.uid()))`. Medlemmene får ingen
skrivepolicy. `project_shares` følger det samme: superadmin har alt, den delte orgen leser bare
sin egen rad, og eierens skriverett kommer i tillegg.

## Avvik fra prompten, og hvorfor

1. **ALTER på den live policyen «Org-medlemmer ser prosjekter», ikke drop/create av «Users see org
   projects».** Se punkt 1. `alter policy` beholder navnet og har ingen glipp mellom drop og create.
   Finnes ikke policyen, feiler setningen, og ingenting blir opprettet ved siden av.
2. **Hjelpefunksjoner i stedet for inline `exists`.** SQL-en i prompten ville gitt **uendelig
   rekursjon**. Prosjekt-policyen leser `project_shares`, og eier-policyen på `project_shares` må
   lese `romtegner_projects`. Postgres ville da avvist hver lesing av prosjekttabellen med «infinite
   recursion detected in policy», også for Cenika. To `security definer`-funksjoner bryter ringen.
   Begge returnerer bare data om kalleren (`auth.uid()`):
   - `project_shares_my_project_ids()` gir prosjekt-id-ene som er **akseptert** delt med en av mine
     orger.
   - `project_owned_by_my_org(p_project_id)` svarer på om jeg er medlem av eier-orgen.
3. **Ingen `org_invitations`-rad ved deling på e-post.** `org_id` er `NOT NULL` der, og triggeren
   `handle_invitation_on_signup` gjør den inviterte til medlem av invitasjonens org. Med Cenikas org
   ville elektrikeren fått se alle Cenika-prosjektene (løp-SPØRSMÅL 22).
4. Ekstra sikringer på den nye tabellen:
   - CHECK på `status` (pending/accepted/revoked) og `role` (documenter).
   - «org eller e-post må finnes».
   - `accepted` krever `org_id`.
   - Unik indeks på ventende e-postdeling per prosjekt.
   - `share_project` nekter prosjekter i papirkurven, egen org og leverandør-orger (løp-SPØRSMÅL 24).
     Er en deling trukket tilbake, åpner et nytt kall den samme raden igjen (25).

## Den nye policyen

```sql
alter policy "Org-medlemmer ser prosjekter" on romtegner_projects
  using (
    (org_id in (select organization_members.org_id from organization_members
                 where organization_members.user_id = auth.uid()))
    or (user_id = auth.uid())
    or (deleted_at is null
        and id in (select public.project_shares_my_project_ids()))
  );
```

De to første grenene er ordrett live-uttrykket. Bare den tredje er ny.

## Bekreftelser (lest i fila, ikke kjørt)

- **Ingen skrive-policy rørt.** Fila inneholder ingen `create/alter/drop policy` på
  `romtegner_projects` utenom `alter policy "Org-medlemmer ser prosjekter"` (SELECT). INSERT, UPDATE,
  DELETE og superadmin-ALL står som før. Verifiseringsspørringen i fila teller skrive-policyer som
  nevner `project_shares` (forventet 0) og policyer totalt (forventet 5, uendret).
- **Ingen bevis-policy rørt.** `warranty_certificates`, `certificate_products`, `measurements`
  og `certificate_photos` står bare i kommentarer: i hodet («roeres ikke») og i testene, som er
  kommentert ut. Bevisene er org-scopet («Org members manage own certificates», `org_id in mine
  orger`), så elektrikerens bevis ligger i hans org.
- **`status = 'accepted'` kreves.** Hjelpefunksjonen filtrerer på det. `pending` og `revoked` gir
  ingen tilgang.
- **Revoke:** prosjektet forsvinner fordi grenen ikke lenger slår til, og ingen annen policy gir
  elektrikeren tilgang (han er ikke i eier-orgen og ikke `user_id`). Bevisene blir liggende. De er i
  hans org, og ingen policy på dem ser på prosjekt eller deling. `on delete set null` gjelder bare
  permanent sletting av prosjektet. Det stemmer med regel 5 og 8.
- **Den delte orgen kan ikke skrive delinger.** Den har bare SELECT-policyen på `project_shares`.

## Kostnad / `explain`

**Ikke målt.** Jeg har ingen tilgang til databasen. Ut fra planen:
- Grenen er `id in (select project_shares_my_project_ids())`, en *uncorrelated* subquery. Postgres
  kjører den **én gang** per spørring som en hashet subplan. Hver rad i lista får da bare et
  hash-oppslag, ikke et funksjonskall.
- Inne i funksjonen: `project_shares` filtrert på `org_id in (mine orger)` og
  `status = 'accepted'`. Indeksen `project_shares_org_idx` dekker det. Indeksen
  `project_shares_project_idx` dekker eier-sjekken og cascade.
- For Cenika, som ikke har noen delinger til seg, gir subqueryen 0 rader. Ekstrakostnaden er da ett
  tomt indeksoppslag per listehenting.
- Merk: `project_owned_by_my_org(project_id)` i policyen på `project_shares` er korrelert (ett kall
  per rad). Den gjelder bare lesing av `project_shares`, som har få rader per prosjekt, og ikke
  prosjektlista.

En `explain analyze`-snutt ligger nederst i fila. Forventet resultat er «hashed SubPlan», ikke
«SubPlan» per rad. Execution Time skal være omtrent som før.

## SQL Kenneth må kjøre

1. **Før migrasjonen:** «KJOR FOER MIGRASJONEN» nederst i fila. Noter `count(*)` for en Cenika-bruker.
2. `supabase-migration-project-shares.sql` i SQL Editor. Krever bare tabeller som er live
   (`romtegner_projects` med `deleted_at`, `organizations`, `organization_members`, `is_superadmin()`,
   `pgcrypto`). Den er **uavhengig av 042/044v2/045**.
3. Verifiseringsraden skal gi 5 | 1 | 0 | 3 | 6.
4. Testene nederst i fila, hver blokk for seg. Alle ender i `rollback`. Bruk et **duplisert**
   prosjekt (KJOR regel 11).
5. Feiler test 1 (Cenika ser et annet antall): kjør ROLLBACK-blokken nederst. Den setter
   SELECT-policyen tilbake ordrett.

## Testene, slik de står skrevet (ikke kjørt, ingen databasetilgang)

| # | Test | Forventet |
|---|---|---|
| 1 | Cenika-brukerens `count(*)` før/etter + rader synlige bare via deling | likt antall, 0 |
| 2 | Elektro-bruker ser prosjektet før deling | 0 |
| 3 | `share_project(p, elektro_org, null)` to ganger, så elektrikeren teller | accepted / existed true / 1 |
| 4 | Elektrikeren gjør `update`/`delete`/lås/`insert` i `project_shares` | UPDATE 0, DELETE 0, `not_found`, RLS-feil |
| 5 | Ventende deling (også med org satt) | 0 |
| 6 | Etter `revoke_project_share` | 0 |
| 7 | Bevis laget før revoke, lest etter | 1 |
| 8 | Elektrikeren prøver å dele | `NOT_PROJECT_OWNER` |

NB test 4: RLS gir **ingen feilmelding** på UPDATE eller DELETE som ikke slipper gjennom. Svaret er
`UPDATE 0`. Supabase-klienten får `error = null` og 0 rader. 047 og 048 må ikke tolke det som
«lagret».

## Annet

- Regresjon (`docs/168/cdp/rtests.mjs` mot 9333/4000): `_orgNrRegressionTest` 22/22,
  `_kundelenkeRegressionTest` 330/330, `_edgeMailRegressionTest` 14/14, `_appEmbedRegressionTest`
  30/30. Klientfilene er uendret.
- `grep -rn "service_role" index.html admin.html` gir **0 treff**.
- Migrasjonsfila er ren ASCII (0 linjer med tegn utenfor ASCII).
- Til 047: et delt prosjekt kan leses, men bakgrunnstegninger i Storage følger egne policyer. Det er
  ikke målt om den delte orgen får lest dem.
