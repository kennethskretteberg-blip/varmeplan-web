# 044v2-web · `create_customer_org()` — Cenika gir en elektrobedrift tilgang (fra Visma-lista)

Løp 168 (demo Cenika), 02.11.2026. Erstatter 044 v1. Ingen migrasjon kjørt, ingenting pushet.

## STEG 0 — åtte funn

1. **`supabase-migration-auth.sql`:131–144** — to policyer på `organizations`, ingen andre i noen `.sql`:
   ```sql
   create policy "Superadmin full tilgang org" on organizations
     for all using (is_superadmin());
   create policy "Medlemmer ser sine org" on organizations
     for select using (
       exists (select 1 from organization_members
               where org_id = organizations.id and user_id = auth.uid()));
   ```
   (Linjene er 134–144, ikke 129–137.) `organization_members`: «Superadmin full tilgang members» (all,
   :152) + select-policyer (:155, `org-member-visibility.sql`:43). Ingen skrivepolicy for medlemmer.
2. **`supabase-migration-orgtypes.sql`** — `org_type text not null default 'installer'` (:9–15),
   `supplier_name text` (:19–25, matcher `heating_products.supplier` / `suppliers.name`),
   `org_invitations (id, org_id, email, role default 'member', invited_by, token unique default
   encode(gen_random_bytes(32),'hex'), status default 'pending', created_at, expires_at default
   now()+7 dager)` (:37–47). Innsetting: superadmin eller owner/admin i **samme** org (:66–75).
   Trigger `handle_invitation_on_signup` (:92–125).
3. **`supabase-migration-org-supplier-access.sql`** — kolonner `org_id, supplier_id, enabled,
   granted_by, created_at`, PK `(org_id, supplier_id)` (:15–22). Skriving: bare «osa superadmin
   full» (:27–29); medlemmer kan bare lese egne rader (:33–41). **Bekreftet superadmin-only.**
4. **Påloggingssjekkene** — stemmer, men står nå i `_authCheckProfileAndProceed`
   `index.html`:86437–86514 (ikke 70996–71015). Ordrett:
   ```js
   // Org subscription check
   const sub = userOrgData.subscription_status || 'trial';
   if (sub === 'suspended' || sub === 'cancelled') {
     _authShowMsg('auth-org-suspended-msg');
     return;
   }
   if (sub === 'trial' && userOrgData.trial_ends_at && new Date(userOrgData.trial_ends_at) < new Date()) {
     _authShowMsg('auth-org-suspended-msg');
     return;
   }
   // Profile pending (org exists but waiting for superadmin to approve org)
   if (_currentProfile.status === 'pending') {
     _authShowMsg('auth-org-pending-msg');
     return;
   }
   ```
   (+ uten medlemskap: `if (_currentProfile.status === 'pending') _authShowMsg('auth-org-pending-msg')`, :86484.)
   Alle tre fellene finnes → ingen stopp.
5. **`supabase-migration-admin-panel.sql`:9–11** — `subscription_status text not null default 'trial'`,
   `plan text not null default 'free'`, `trial_ends_at timestamptz default now() + interval '30 days'`. Bekreftet.
6. **Mønster for `security definer`** (`supabase-migration-kundelenke.sql`:58–118, `-028.sql`:13–72):
   `language plpgsql security definer set search_path = public`, kallersjekk inne i funksjonen,
   `revoke all on function … from public` + `grant execute … to …`. Fulgt. I tillegg `revoke … from anon`,
   fordi Supabase gir `anon` execute som standardprivilegium.
7. **Visma-kundelista** = `erp_customers` (`…-erp-customers-register.sql`:12–23): `erp_no` (kundenr.),
   `name`, `name_norm`, `active`, `org_number` (`…-orgnr.sql`:11, 3034 av 3130 rader har det),
   `postal_code`, `city`. **Ingen e-post, ingen kontaktperson, ingen gateadresse.** RLS: alle medlemmer
   i Cenika-orgen leser/skriver (register.sql:31–38). Klienten laster den med `_erpCustomersForOrg()`.
8. **044 v1 ikke kjørt.** `create_customer_org` fantes ikke i noen `.sql`/`.html`. 042 er committet
   (6c71f64, migrasjonen `supabase-migration-org-orgnr.sql` ikke kjørt) — 044v2 krever den.

## Oppgave A — funksjonen

Fil: `supabase-migration-opprett-kundebedrift.sql` (hele SQL-en står der; tester nederst i fila).

- Ny kolonne `organizations.erp_customer_no text` (additiv).
- `create_customer_org(p_name, p_org_nr, p_parent_org_nr, p_address, p_contact_email,
  p_erp_customer_no, p_orgnr_override default null) returns jsonb`.
  **Avvik:** sjuende, valgfri parameter `p_orgnr_override` (begrunnelse). Spec regel 27 sier at et
  ugyldig/utenlandsk nummer krever en eksplisitt overstyring *i funksjonen*; uten parameteren kunne
  den ikke skille «glemte å fylle ut» fra «bevisst uten nummer». Seks-argument-kall virker uendret.
- Rekkefølge: kaller (ikke innlogget → `NOT_AUTHENTICATED`; ikke leverandør-medlem → `NOT_SUPPLIER`;
  medlem av flere leverandører → `AMBIGUOUS_SUPPLIER`; leverandøren uten rad i `suppliers` →
  `SUPPLIER_NOT_LINKED`) → inndata (navn, e-post, MOD11 på org.nr, hovedenhet) → duplikat →
  opprett → én tilgangsrad → (ingen medlemskap) → invitasjon.
- Duplikat: samme ni siffer → `{existed:true, matched_on:'org_nr', org_id, name}`. Også samme
  Visma-kundenummer fra **samme** leverandør. **Ingen invitasjon og ingen endring** på en eksisterende
  org. Kappløp på den unike indeksen fanges (`unique_violation`) og gir også den eksisterende.
- Ny org: `org_type='installer'` (hardkodet), `subscription_status='active'`, `trial_ends_at=null`,
  `org_nr`, `parent_org_nr`, `erp_customer_no`, `print_address` (= adressen), unik `slug`
  (navn → `-2`, `-3` …), `created_by_user=auth.uid()`, `created_by_org=<leverandøren fra medlemskapet>`.
  Uten gyldig org.nr: `org_nr=null`, og `admin_notes` får `[Ingen norsk organisasjonsnummer - overstyrt
  av <e-post fra JWT> <dato> via create_customer_org; oppgitt nummer: …; begrunnelse: …]`.
- `organization_supplier_access`: én rad, kallerens egen `suppliers.id`, `granted_by=auth.uid()`.
- `org_invitations`: e-posten (små bokstaver), rolle `admin`, `invited_by=auth.uid()`, **30 dagers**
  utløp (standard er 7). Tokenet returneres.
- Kalleren legges aldri i `organization_members` — det står ingen insert mot den tabellen i funksjonen.

## Oppgave B — profilen blir aktiv

**Ingen ny kode — det finnes allerede, på stedet invitasjoner tas imot.** Invitasjoner tas imot ett
sted i dag: triggeren `handle_invitation_on_signup` (`supabase-migration-orgtypes.sql`:92–125, `after
insert on auth.users`). For hver ventende, ikke utløpte invitasjon på e-posten legger den inn
medlemskapet med invitasjonens rolle, merker den `accepted` og kjører
`UPDATE profiles SET status = 'active', approved_at = now()`. Den gjelder **alle** invitasjoner, også de
fra `create_customer_org`. Klienten har ingen egen mottaksvei (`?invite=` bare forhåndsutfyller
registreringsskjemaet, `_loadInviteInfo` :86254).

Rekkefølgen holder: Postgres fyrer `after`-triggere i navnerekkefølge — `on_auth_user_created`
(`handle_new_user`, lager profilen som `pending`) før `on_user_check_invitations`. Og `handle_new_user`
lager **ikke** egen org når det finnes en ventende invitasjon (`org-centric.sql`:29–33).

Hvorfor det er trygt: den aktiverer bare en *ny* konto med nøyaktig den e-posten en invitasjon er laget
for, og invitasjoner kan bare lages av superadmin, owner/admin i samme org, eller av
`create_customer_org` for en org den selv nettopp opprettet.

Hull (til 045): finnes e-posten alt som bruker, fyrer triggeren aldri, og invitasjonen blir stående
`pending`. Spec regel 31 legger det på 045. Kontrollspørring for at triggerne er live står nederst i
migrasjonsfila (punkt c).

## Oppgave C — grensesnittet

- **Kunder-fanen**: knappen «Gi kunden tilgang til Varmeplan» ved «＋ Ny kunde», bare for leverandør
  (`cust-grant-access-btn`, vist i dashbord-oppstarten ved `_isSupplier`).
- **Kundekortet**: samme knapp for bedriftskunder når brukeren er leverandør; fyller ut fra
  Varmeplan-kunden (navn, org.nr, kundenr., adresse, **e-post**).
- Dialogen (`_coOpen`, blokken «044v2 · GI KUNDEN TILGANG» i `index.html`): søk i Visma-lista med
  `_erpCustomersForOrg()` (cachet) og **samme treffregel** som kundekortets Visma-felt — regelen er
  trukket ut av `_ccErpSearch` til `_erpRegMatcher` og brukes av begge. Utvidet med org.nr (tre eller
  flere siffer). Valgt rad fyller navn, org.nr, adresse (postnr + sted) og kundenr.
- Org.nr: live MOD11 med 042 sin `_validOrgNr`/`_orgNrExplain`. Mangler/ugyldig → boks «Ingen norsk
  organisasjonsnummer (utenlandsk firma) — opprett likevel» + påkrevd begrunnelse. Ikke Brreg.
- Avdelinger: har flere Visma-kunder samme org.nr, vises de som valg, med forklaringen at Varmeplan
  lager én bedrift per org.nr, og lenken «flytt <nr> til hovedenhet» (avdelingen må da ha eget nummer).
- E-post: påkrevd, finnes aldri i Visma-lista (se SPØRSMÅL 13); foreslås fra kundekortet.
- Etter oppretting: «✓ X finnes nå i Varmeplan. Invitasjonen er laget for e-post» + lenken med «Kopier».
  **E-posten sendes ikke ennå**: `send-invite-email` krever at avsenderen er owner/admin i målorgen
  (index.ts:78–86), og det er Cenika med vilje ikke. Dialogen sier det rett ut. 045 sender den.
- Fantes bedriften: «Bravida Drammen finnes allerede. Vil du dele prosjektet dit i stedet?» — ingen
  ny invitasjon. Deling kommer i 046/047.
- Feilmeldinger i klartekst, også «Funksjonen finnes ikke i databasen ennå …» før migrasjonen er kjørt.

Skjermbilder: `docs/044v2/t044-1-valgt.png`, `t044-2-opprettet.png`.

## Oppgave D — det en Cenika-ansatt IKKE skal kunne

| Kan ikke | Hvorfor (kode) |
|---|---|
| Endre `subscription_status`/`plan` | Eneste skrivepolicy på `organizations` er «Superadmin full tilgang org» (`auth.sql`:134). Funksjonen setter `active` bare på en org den **selv oppretter** i samme kall; den oppdaterer aldri en eksisterende. |
| Se andre bedrifters prosjekter | `romtegner_projects` SELECT = medlem av orgen eller `user_id = auth.uid()` (live, STATUS-MALING). Kalleren blir aldri medlem (ingen insert i `organization_members` i funksjonen; tabellen er superadmin-skrevet, `auth.sql`:152). |
| Slette organisasjoner | Bare superadmin-policyen dekker DELETE på `organizations`. |
| Gi tilgang til andre leverandørers produkter | `organization_supplier_access` har bare superadmin-skriving (`org-supplier-access.sql`:27–29). Funksjonen skriver én rad med `suppliers.id` slått opp fra kallerens **eget** medlemskap; ingen parameter styrer leverandøren. |
| Lage en leverandør-org | `org_type` er hardkodet `'installer'`; ingen parameter (test 5). |

**Funn (veier jeg fant):**
1. **E-posten er fri.** En Cenika-ansatt kan skrive en e-post de selv kontrollerer (f.eks. privat
   Gmail), registrere seg med den og bli **admin** i kundebedriften — og se prosjektene kundebedriften
   senere lager der. Regel 25 holdes for kontoen som kaller, men ikke for en ny konto de lager. Kunden
   ser medlemmet i medlemslista. Kan ikke stenges helt (e-posten er per definisjon ukjent), se SPØRSMÅL 15.
2. **Eksistens-orakel:** funksjonen returnerer navnet på enhver org med et gitt org.nr — også orgs
   Cenika ikke har noe med (f.eks. en kunde av en annen leverandør). Navn + org.nr er offentlig i
   Brreg, men *at bedriften bruker Varmeplan* er det ikke. Prompten krever meldingen.
3. **Kjent fra 168:** INSERT-policyen på `romtegner_projects` sjekker bare innlogging. En Cenika-bruker
   kan legge et prosjekt inn i kundebedriftens org (med seg selv som `user_id`, og dermed beholde
   lese/skrive). Det er å plante, ikke å se andres. Står allerede på lista til `TIL-KENNETH.md`.
4. **Eksisterende policy-felle:** «Bruker ser egne invitasjoner» på `org_invitations`
   (`orgtypes.sql`:79–82) leser `auth.users` → 42501 for `authenticated`/`anon`. `_loadInviteInfo`
   svelger feilen, så invitasjonsbanneret kan mangle når lenken åpnes. Registreringen virker likevel
   (triggeren går server-side). Ikke rettet her; nevnt for 045.

## Tester

- Nettleser (CDP mot 9333/4000, `docs/168/cdp/t044.mjs`, RPC mocket — ingen databaseskriving):
  søk (navn, tokens, kundenr., org.nr med mellomrom), utfylling, avdelinger, e-post påkrevd,
  overstyring krever avkryssing + begrunnelse, riktige RPC-argumenter, duplikat-melding, feilmeldinger
  (migrasjon ikke kjørt, ikke leverandør), knapp på kundekort bare for leverandør. 0 sidefeil.
- Regresjon (`docs/168/cdp/rtests.mjs`): `_orgNrRegressionTest` 22/22, `_gbao10` 18/18,
  `_nyttProsjekt` 25/25, `_kundelenke` 330/330, `_edgeMail` 14/14, `_appEmbed` 30/30,
  `_profileName` 15/15, `_prefs` 47/47, `_pwa` 13/13, `_computedStamp` 19/19, `_listevisning` 54/54,
  `_kundeforslag` 270/271, `_prosjektlaas` 66/67.
  De to røde (`L/138: piltast i et felt bytter IKKE rom`, `E: egen lås sier «Deg (annet vindu)»`)
  feiler **identisk på HEAD** (kjørt mot `git show HEAD:index.html`) — headless, ikke denne endringen.
- To tester oppdatert: `_kundelenkeRegressionTest` G og `_edgeMailRegressionTest` D teller
  invitasjonslenker bygget på `_PUBLIC_BASE_URL`; nå 4 (den nye i `_coShowResult`), før 3. Regelen
  («aldri `location.origin`») er uendret og grønn.
- SQL-testene 1–5 (+4b) står som kommentarer nederst i migrasjonsfila, alle i `begin … rollback`.
- `grep service_role index.html admin.html` → 0.

## SQL Kenneth må kjøre (i rekkefølge)

1. `supabase-migration-org-orgnr.sql` (042) — hvis ikke alt kjørt.
2. `supabase-migration-opprett-kundebedrift.sql` (denne).
3. Kontrollene a–c og testene nederst i fila 2 (erstatt `<LEVERANDOR_USER_ID>`/`<INSTALLATOR_USER_ID>`).
