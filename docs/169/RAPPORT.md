# 169_v2-web — kunden registrerer bedriften selv, Cenika godkjenner (+ «Velg passord»)

02.11.2026, løp 168. Ikke pushet, ingen migrasjon kjørt, ingen Edge Function deployet.

## STEG 0 — funn

1. **Registreringen i dag** (`_authRegister` → `auth.signUp` med `company_name` → trigger
   `handle_new_user`, `supabase-migration-org-centric.sql`:11–49): lager installatør-org, eieren blir
   `owner`, profilen står `pending`. Org.nr fra skjemaet (`org_number` i metadata) ble ikke lagret.
   Påloggingen (`_authCheckProfileAndProceed`) stenger ute `pending` — stemmer med målingen.
2. **`create_customer_org` (044v2)** hadde reglene inline. De like reglene (MOD11, installer + active +
   trial null + erp-nr + én tilgangsrad, kalleren blir ikke medlem) er nå trukket ut i to interne
   funksjoner i **`supabase-migration-opprett-kundebedrift.sql`**: `_orgnr_valid_digits(text)` og
   `_activate_customer_org(org, leverandør-org, erp, av)`. `create_customer_org` kaller dem nå
   (`perform public._activate_customer_org(...)`), og `approve_customer_org` gjør det samme.
   044-fila er ikke kjørt, så den er endret på stedet (merket «169» i hodet).
3. **security definer-mønster** (kundelenke-RPC-ene, 044, 047): `set search_path = public`, kallersjekk
   inne i funksjonen, `revoke all … from public/anon` + `grant execute … to authenticated`. Fulgt.
4. **E-post fra Edge Functions:** `send-invite-email` (Resend, `RESEND_API_KEY`/`FROM_EMAIL`, eksplisitt
   `auth.getUser`, alt slås opp server-side). 045 (`opprett-kundebruker`) bruker Supabase Auth sin e-post.
5. **STOPP-betingelsen:** løsningen krever **ingen** anonym skriving. Den eneste nye anon-rettigheten er
   `list_registration_suppliers()` (leser id + navn på leverandør-orger koblet til `suppliers`).
   Org-opprettingen ved registrering skjer som før, i triggeren.
6. **Sikkerhetsfunn:** `profiles_update_own` (146) lar en bruker endre sin egen `status`. Vakt-trigger lagt
   til (SPØRSMÅL 37). Ingen policy endret.
7. Flere versjoner av `handle_new_user` i repoet (auth.sql og org-centric.sql) → SPØRSMÅL 36.

## Hva er bygget

**Migrasjon `supabase-migration-kundesoknad.sql`** (ny, ikke kjørt — kjøres etter 042, 044v2, 046, 047):
- Additive kolonner på `organizations`: `requested_supplier_org_id`, `requested_org_nr`,
  `customer_request_decision` (null/approved/rejected), `…_decided_at`, `…_decided_by`,
  `…_reject_reason`, `…_notified_at`. Org.nr lagres i `org_nr` (042) når det er gyldig og ledig.
- `handle_new_user` — ordrett kopi fra `supabase-migration-org-centric.sql`:11–49 + 169-blokka
  (diff under). Blokka kan aldri felle registreringen (exception-handler, org.nr bare når ledig).
- `list_registration_suppliers()` (anon + authenticated, lesing).
- `approve_customer_org(p_org_id, p_erp_customer_no)` / `reject_customer_org(p_org_id, p_reason)` med
  felles kallersjekk `_customer_request_supplier` (medlem av orgens `requested_supplier_org_id`, som må være
  `supplier`; orgen må være `installer`; eierprofil `pending`). Org.nr hos en annen org → `existing_org`,
  ingenting endres. Godkjenning → `_activate_customer_org` + eierprofil `active`. Kalleren blir ikke medlem.
- `list_customer_requests()` — Cenikas liste, med treff i `erp_customers.org_number` (normalisert).
- Vakt-trigger `profiles_self_status_guard_trg`.
- `list_customer_orgs()` — ordrett kopi fra 047 + én OR-linje for godkjente bedrifter (SPØRSMÅL 40).
- Superadmin-godkjenningen (`_admApproveOrg`, `_admQuickApprove`) er urørt.

**Edge Function `supabase/functions/kundesoknad-svar/index.ts`** (ny, ikke deployet):
`supabase functions deploy kundesoknad-svar` — samme hemmeligheter som `send-invite-email`.

**`index.html`:**
- Innloggingssiden: lenken «Ny kunde? Søk om tilgang for bedriften din» (`#auth-apply-link`).
- Registrering steg 2: «Kunde hos» (`#auth-reg-supplier`, `_regLoadSuppliers`, `_regSupplierOptions`,
  forhåndsvalgt ved én leverandør, «Ingen av disse» = dagens vei), org.nr-validering med `_validOrgNr`
  (`_regCheck`, `_regOrgNrHint`). Metadata: `org_number` (siffer), `requested_supplier_org_id`,
  `requested_supplier_name`.
- Ventesiden: «Søknaden er sendt til Cenika AS. Du får e-post når den er behandlet.» (`request-sent`,
  `request-pending` i `_AUTH_STATUS`; `_authOpenRequestSupplier`).
- «Velkommen til Varmeplan — velg passord» (`#auth-setpw-form`, `_velkommenDecide`, `_velkommenMaybeShow`,
  `_velkommenSubmit`): `?velkommen=1`, `type=invite`/`type=recovery` i hashen (fanget ved parsing, før
  supabase-js tømmer den), merke i localStorage og `invited_at` uten `password_set`. To felt, samme regel som
  registreringen (≥ 8 tegn) → `auth.updateUser({ password, data:{ password_set:true } })` →
  `_authCheckProfileAndProceed`. URL ryddes med `history.replaceState`. Ingen «hopp over». Utløpt lenke
  gir en forklaring på innloggingssiden.
- Cenika: «Søknader om tilgang» i **Kunder-fanen** (ved «Gi kunden tilgang til Varmeplan», 044), tall på
  knappen og på Kunder-fanen (`_creq*`). Rad: firmanavn, org.nr, kontaktperson, e-post, telefon, dato,
  «Kunde i Visma: 30470 Welhaven Elektro» / «Ikke funnet i kundelista» (velger ved flere kundenumre).
  Godkjenn sender kundenummeret med; Avslå med valgfri begrunnelse. `existing_org` vises på forhånd.

## Tester

- Ny `_velkommenRegressionTest` **23/23** (URL-varianter: `?velkommen=1`, `type=invite`, `type=recovery`,
  begge, andre parametre, ingen økt, utløpt lenke `otp_expired`, `velkommen=0`, `type=signup/magiclink`,
  lukket fane, invitert uten/med passord, passordregler, URL-rydding, rekkefølgen i `initSupabase`).
- Ny `_kundesoknadRegressionTest` **30/30** (leverandørvalg, `_regCheck`, ventetekst, Visma-tekst,
  `existing_org`-tekst, e-postkallet sender bare `org_id`, ingen direkte tabellskriving, ingen `org_id`-filter
  i klienten, «service role» ikke i klienten).
- CDP `docs/168/cdp/t169.mjs` (mock av `signUp`, `rpc`, `updateUser`, `fetch` — ingen database):
  registrering (forhåndsvalgt Cenika, org.nr påkrevd/ugyldig/gyldig, metadata), «Ingen av disse», uten
  migrasjon skjules feltet; ventesiden (pending slippes ikke inn, 0 kall til `_initAfterAuth`); velg passord
  (for kort, ulike, `updateUser({password, data})`, videre inn, URL `/`, merket fjernet, ikke vist igjen;
  recovery-tittel); Cenika-lista (tall 3, Visma-treff, godkjenn med `p_erp_customer_no: '30470'`, e-post 404 →
  ærlig tekst, `existing_org`, avslag med begrunnelse, tall 1 etterpå, uten migrasjon). **0 sidefeil.**
  Utskrift: `t169-utskrift.txt`. Bilder: `t169-1-sendt.png` … `t169-5-behandlet.png`.
- Regresjon (CDP, `rtests.mjs`): edgeMail 14/14, orgNr 22/22, delMedElektriker 17/17, portalDesign 15/15,
  kundelenke 330/330, nyttProsjekt 25/25, bgFloor 31/31, computedStamp 19/19, pwa 13/13, appEmbed 30/30,
  gbao10 18/18, accessoryFoilQty 84/84, listevisning 54/54, profileName 15/15, prefs 47/47.
  **prosjektlaas 66/67** — samme rad som i 162/049 («E: egen lås sier «Deg (annet vindu)»», krever
  innlogget bruker), ikke forårsaket av 169.
- `grep -rn "service_role" index.html admin.html` → 0.
- SQL-testene (9 blokker, alle med `rollback`) står nederst i migrasjonsfila. Kenneth kjører dem.

## Til Kenneth

1. Kjør `select pg_get_functiondef('public.handle_new_user'::regproc);` og sammenlign med
   org-centric-versjonen (SPØRSMÅL 36) **før** fila kjøres.
2. Rekkefølge: `supabase-migration-org-orgnr.sql` (042) → `supabase-migration-opprett-kundebedrift.sql`
   (044v2, versjonen fra 169) → `supabase-migration-project-shares.sql` (046) →
   `supabase-migration-del-med-elektriker.sql` (047) → **`supabase-migration-kundesoknad.sql`** (169).
3. `supabase functions deploy kundesoknad-svar`.
4. Demo: bruk et firmanavn som ikke finnes fra før (SPØRSMÅL 42).

## Diff av handle_new_user (org-centric.sql → kundesoknad.sql)

Også i `docs/169/handle_new_user.diff`.

```diff
@@ DECLARE
   new_org_id uuid;
   company text;
+  v169_orgnr text;
+  v169_sup_txt text;
+  v169_sup uuid;
 BEGIN
@@ etter «Link profile to org»
       UPDATE public.profiles SET org_id = new_org_id WHERE id = NEW.id;
+
+      -- 169: org.nr og "Kunde hos" fra registreringsskjemaet. ...
+      BEGIN
+        v169_orgnr := public._orgnr_valid_digits(NEW.raw_user_meta_data->>'org_number');
+        v169_sup_txt := NEW.raw_user_meta_data->>'requested_supplier_org_id';
+        IF v169_sup_txt ~* '^[0-9a-f]{8}-...$' THEN
+          SELECT o.id INTO v169_sup FROM public.organizations o
+           WHERE o.id = v169_sup_txt::uuid AND o.org_type = 'supplier';
+        END IF;
+        UPDATE public.organizations
+           SET requested_org_nr = v169_orgnr,
+               requested_supplier_org_id = v169_sup
+         WHERE id = new_org_id;
+        IF v169_orgnr IS NOT NULL AND NOT EXISTS (<annen org med samme ni siffer>) THEN
+          UPDATE public.organizations SET org_nr = v169_orgnr WHERE id = new_org_id;
+        END IF;
+      EXCEPTION WHEN others THEN
+        RAISE WARNING 'handle_new_user 169: ...', NEW.id, SQLERRM;
+      END;
     END IF;
   END IF;
```

## Hele SQL-en

Se `supabase-migration-kundesoknad.sql` (hele fila, med tester) og de to nye interne funksjonene øverst i
`supabase-migration-opprett-kundebedrift.sql`. (Ikke kopiert inn her, for at det bare skal finnes én versjon
å kjøre.)
