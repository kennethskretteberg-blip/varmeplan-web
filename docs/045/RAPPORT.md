# 045-web · Edge Function `opprett-kundebruker` (løp 168, demo Cenika)

**Skrevet, ikke deployet.** Fil: `supabase/functions/opprett-kundebruker/index.ts`.
Spec: `spec-overfor-prosjekt-til-elektriker.md` regel 30–31. Avhenger av 044v2 (`create_customer_org`)
og 042 (`organizations.created_by_org`). Ingen klientfil er endret.

## STEG 0 — funn

1. **`send-invite-email/index.ts`, kommentarblokken øverst** (målt 07.10.2026). Den forrige utgaven
   leste **aldri** `Authorization`. Den tok både `to` og `invite_url` rett fra klientens body. Et kall
   helt uten Authorization nådde funksjonens egen kode (400, ikke 401). Hvem som helst kunne altså
   sende en vilkårlig lenke til en vilkårlig adresse med Varmeplan som avsender: **en ferdig
   phishing-kanal på vårt eget, verifiserte domene**. `org_name`/`invited_by` ble i tillegg
   interpolert uescapet inn i HTML. Og: **`verify_jwt` er ikke et vern. Anon-nøkkelen ER en gyldig
   JWT og ligger åpent i klienten.** Brukeren må verifiseres med `auth.getUser(jwt)`.
2. **Mønsteret** (`send-invite-email`, `kundelenke-mail`):
   - CORS-headere med `authorization, x-client-info, apikey, content-type` og `OPTIONS` → `ok`.
   - Service-role-klient fra `Deno.env`, aldri fra koden.
   - Lag 1: `Bearer`-JWT → `auth.getUser(jwt)` → 401 **før** noe slås opp. `kundelenke-mail` målte at
     et oppslag før autentisering lekket om et token finnes.
   - Lag 2: medlemskap i nettopp den aktuelle orgen.
   - Alt innhold slås opp server-side. Fra klienten kommer bare tokenet.
   - HTML escapes med `esc()`. Ikke relevant her, fordi funksjonen ikke lager HTML.
   - `PUBLIC_BASE_URL = "https://varmeplan.no"`, aldri kallerens origin.
   - Deploy-kommando og hemmeligheter i kommentaren øverst.
3. **`kundelenke-mail/README.md`** sier det samme, og at `FROM_EMAIL` er en *prosjekt*-secret som
   deles av alle e-postfunksjonene.
4. **Hemmeligheter i bruk:** `RESEND_API_KEY`, `FROM_EMAIL` (+ `KUNDE_VIDEO_ID` i kundelenke-mail).
   `SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` er innebygd i kjøretiden. **045 trenger ingen av
   Resend-hemmelighetene.** Supabase Auth sender invitasjonsmailen.

Andre funn som formet funksjonen:
- `org_invitations` (`supabase-migration-orgtypes.sql`:38–48) har `token`, `email`, `role`, `status`
  (`pending|accepted|expired`) og `expires_at`. 044v2 lager raden med rolle `admin` og 30 dager.
- **Nye brukere håndteres alt av triggerne.** `inviteUserByEmail` setter inn i `auth.users`.
  `handle_new_user` lager profilen (uten `company_name` lages ingen org).
  `handle_invitation_on_signup` gir medlemskap med invitasjonens rolle, `accepted` og profil
  `active`. Funksjonen gjør det samme etterpå, idempotent, slik at den ikke avhenger av at triggeren
  er live.
- `profiles.email` finnes (`supabase-migration-auth.sql`:11). Det er slik en eksisterende bruker slås
  opp. `auth.users` er ikke eksponert gjennom PostgREST.
- **Weben har ingen «Velg passord»-skjerm for invitasjonslenka.** Se løp-SPØRSMÅL 19. Dette må på
  plass før lenka gir det Kenneth beskrev.

## Funksjonen

Se `supabase/functions/opprett-kundebruker/index.ts` (hele koden, med kommentarblokken). Gangen:

1. `POST { token }`. Ingenting annet leses fra body.
2. `Authorization: Bearer <jwt>` → `auth.getUser(jwt)`. Mangler den eller er den ugyldig: **401**.
3. Invitasjonen slås opp på token. Ukjent, `status != 'pending'`, utløpt, mangler e-post/org, orgen
   er ikke `installer`, `created_by_org` mangler, eller kalleren er ikke medlem av en `supplier`-org
   med den id-en: **samme 400** «Invitasjonen kan ikke brukes. Be om en ny.» Grunnen logges med
   `console.warn`, men sendes ikke ut. Superadmin slipper medlemskapskravet (SPØRSMÅL 16).
4. E-posten kommer fra invitasjonsraden, i små bokstaver.
5. `auth.admin.inviteUserByEmail(email, { redirectTo: "https://varmeplan.no/?velkommen=1" })`.
   Domenet er hardkodet.
6. Ny bruker → medlemskap (upsert, `ignoreDuplicates`), invitasjonen `accepted` og profilen
   `pending → active`. Svaret er **200 `{ ok:true, result:"opprettet" }`**.
7. Brukeren finnes alt (`code` `email_exists`/`user_already_exists`, eller meldingen «already
   registered») → se under. Svaret er **200 `{ ok:true, result:"fantes_fra_for" }`**.
8. Andre Auth-feil → **500** «Kunne ikke opprette brukeren. Prøv igjen senere.» Detaljene logges.

## Når brukeren finnes fra før (regel 31)

- **Ingen ny konto og ingen e-post.** `inviteUserByEmail` har feilet uten bivirkning.
- Brukeren slås opp i `profiles` på e-post (`ilike` med `%`/`_` escapet, slik at det blir eksakt).
- **Er hun medlem av en leverandør-org, avvises det med 409** «Denne e-postadressen kan ikke brukes
  for kundebedriften». Invitasjonen blir stående. Dette lukker den delen av SPØRSMÅL 15 som kan
  lukkes (SPØRSMÅL 18).
- Ellers legges hun i orgen med invitasjonens rolle. Finnes medlemskapet alt, røres det ikke.
  Invitasjonen markeres `accepted`, og en profil som står `pending` blir `active`. `rejected` og
  `blocked` røres ikke (SPØRSMÅL 17).
- Hun logger inn med passordet hun alt har. Har hun en egen org fra før, er hun nå medlem av to.
  Påloggingen tar `memberships[0]` (SPØRSMÅL 21).

«Fantes fra før» forteller kalleren at e-posten har en konto. Det er bevisst, for regel 31 sier
«og sier det». Bare en innlogget leverandør-ansatt med et gyldig, åpent invitasjonstoken for en
bedrift hennes egen leverandør opprettet, kan få det svaret. Alle andre får 401 eller den
nøytrale 400-en.

## Deploy og oppsett (Kenneth)

```bash
supabase functions deploy opprett-kundebruker
```

- **Ingen nye secrets.** `SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` er innebygd.
- **Krever** at `supabase-migration-org-orgnr.sql` (042) og `supabase-migration-opprett-kundebedrift.sql`
  (044v2) er kjørt. Uten `created_by_org` avvises alle kall med 400.
- Supabase Dashboard:
  - **Auth → URL Configuration:** `https://varmeplan.no` (eller `https://varmeplan.no/**`) må stå i
    Redirect URLs, ellers sendes brukeren til Site URL.
  - **Auth → Email Templates → «Invite user»:** teksten kontaktpersonen får (norsk tekst settes der).
  - **Auth → SMTP:** Supabases innebygde SMTP har en lav timegrense. Sett egen SMTP (Resend SMTP på
    varmeplan.no) før demoen.
- `verify_jwt` kan stå på standard (på). Funksjonen verifiserer uansett selv.

Rask røyktest etter deploy (uten token → 401, ikke 400):
```bash
curl -i -X POST https://<prosjekt>.supabase.co/functions/v1/opprett-kundebruker \
  -H "apikey: <ANON>" -H "Authorization: Bearer <ANON>" -H "Content-Type: application/json" -d '{"token":"x"}'
# forventet: 401 «innlogging kreves» (anon-nøkkelen er en JWT, men ingen bruker)
```

## Tester

- `node --experimental-strip-types --check` → syntaks OK. Deno finnes ikke på maskinen, så
  typesjekk med `deno check` er ikke kjørt.
- Norsk-sjekken: mønsteret fra `scripts/sjekk-norsk-i-epost.sh` kjørt på den nye fila med grep →
  0 treff. Selve skriptet ba om tillatelse og er ikke kjørt. Fila har ingen e-post-HTML, så
  charset-kravet gjelder ikke.
- Regresjon (`docs/168/cdp/rtests.mjs` mot 9333/4000): `_edgeMailRegressionTest` 14/14,
  `_kundelenkeRegressionTest` 330/330, `_orgNrRegressionTest` 22/22, `_appEmbedRegressionTest` 30/30.
  Klientfilene er uendret.
- `grep -rn "service_role" index.html admin.html` → **0 treff**.
- Funksjonen er **ikke** kjørt mot Supabase (ikke deployet, med vilje).
