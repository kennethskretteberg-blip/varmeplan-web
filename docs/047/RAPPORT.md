# 047-web · Del prosjektet fra prosjektlista («Del med elektriker»)

Løp 168 (demo Cenika), 02.11.2026. Klientkode i `index.html` + én ny migrasjon
`supabase-migration-del-med-elektriker.sql`. **Ikke kjørt.** Ingen Edge Function deployet.

## STEG 0

### 1. Prosjektlistas radmeny
Det finnes ingen nedtrekksmeny. Radmenyen er handlingsknappene i siste kolonne (`.pl-actions`,
`_renderProjectList`, rad-HTML ved `index.html` «pl-td-actions»): «Bytt kunde», «Gi nytt navn»,
«Dupliser», «Eksporter», «Flytt til papirkurv». Hver er en `button.pl-act-btn` med
`event.stopPropagation()` og et 14 px ikon. Papirkurv-radene har egne knapper (gjenopprett/slett).
«Prosjektdialogen» er «Kunde & prosjektinfo» (`_wfKundeModal`), som åpnes ved klikk på prosjektinfo i
sidepanelet.

### 2. Slik deles presentasjonslenka og kundelenka i dag
- **«Del presentasjon»** (`_presentShareModal`, `#_del-ov`): mørk overlay (z 3000), kort 520 px,
  tittel 17 px + ×, en grå undertekst, avsnitt med 12 px fet overskrift, lenketekst + aksentknapp
  «Kopier» (`_copyLinkRich`), ren adresse + «Kopier adresse» (`_copyLinkPlain`), «Åpne» / «Lukk» nederst.
- **Kundelenka** (`openKundeLinkModal` → resultat): samme to rader (lenketekst + «Kopier», adresse +
  «Kopier adresse»), utløpsdato, og under en strek «Eller send den direkte:» e-post + «Send på e-post»
  (`_kundeSendInvite` → `_kundeMailCall`, eksplisitt innloggingstoken, svaret leses også ved feil).
  «Trekk tilbake» står i prosjektinfo (`spi-btn`).
- **Fulgt:** arket har samme overlay, kort, tittel/×, overskriftsstil og «Lukk». Edge-kallet følger
  `_kundeMailCall`. Reserven når invitasjonen ikke kan sendes er den samme adresseraden med «Kopier
  adresse». Delingen i seg selv er **ingen lenke**: elektrikeren logger inn og finner prosjektet.
  Derfor er det ingen «Kopier»-knapp for selve delingen.

### 3. 046-signaturene (lest i `supabase-migration-project-shares.sql`)
- `share_project(p_project_id uuid, p_org_id uuid default null, p_invited_email text default null) returns jsonb`
  → `{share_id, project_id, org_id, status, invited_email, token, existed}`. Grant: authenticated.
- `revoke_project_share(p_share_id uuid) returns jsonb` → `{share_id, project_id, org_id, status}`.
- Begge stemmer med prompten. **Migrasjonen er ikke kjørt.**

### Funn som formet løsningen
Cenika **kan ikke lese** elektrobedriftenes `organizations`-rad («Medlemmer ser sine org»), deres
medlemmer eller `org_invitations`. Uten noe mer kan arket verken liste bedriftene eller vise navn og
status på delingene (`project_shares` gir bare `org_id`). Løst med to **lesende** `security definer`-
funksjoner i ny fil (løp-SPØRSMÅL 26). Ingen policy er endret.

## Hvor handlingen ligger
1. **Prosjektlista:** ny knapp i radmenyen (ikon «users», tittel «Del med elektriker»), foran
   «Dupliser». Bare for leverandør-medlemmer (`_shrCanShare()`), ikke i papirkurven.
2. **Kunde & prosjektinfo** (`_wfKundeModal`): en rad «Elektrobedriften som skal montere og
   dokumentere» med knappen «Del med elektriker». Krever at prosjektet er lagret i skyen. Vises ikke i
   kunde- eller presentasjonsmodus.

Begge åpner samme ark (`_shrOpen`):
- **Velg bedrift:** søk på navn eller org.nr (samme treffregel som Visma-søket, `_erpRegMatcher`).
  «Del» → `share_project(p, org)` → delt med en gang. Allerede delt → «✓ Delt».
- **Inviter på e-post:** åpner 044-skjemaet i delingsmodus (Visma-søk, org.nr-sjekk, e-post). Ett klikk
  på «Opprett, inviter og del»: `create_customer_org` → `share_project(p, ny_org)` →
  `opprett-kundebruker(token)`. Resultatet viser hvert steg som det gikk.
- **Delt med:** navn, org.nr, status, dato, forklaring. «Trekk tilbake» (bekreft →
  `revoke_project_share`), «Send invitasjon» når invitasjonen ikke er sendt, «Del igjen» på trukne.

### Ærlig status (punkt 4)
Avledes i `_shrStatus` av antall brukere, siste innlogging og ventende invitasjon (løp-SPØRSMÅL 27):

| Grunnlag | Vises som |
|---|---|
| 0 brukere, ventende invitasjon | **Invitasjonen er ikke sendt** (rød) + «Send invitasjon» |
| 0 brukere, ingen invitasjon | Ingen bruker i bedriften |
| brukere, ingen har logget inn | **Invitert — ikke åpnet ennå** (gul) |
| siste innlogging før delingen | Delt — ingen innlogging siden |
| innlogget etter delingen | **Delt** (grønn) |
| `revoked` | Trukket tilbake (grå) + «Del igjen» |
| `pending` uten org (bare fra direkte 046-kall) | Venter — ikke koblet til en bedrift |

«Invitert» blir aldri vist som «Delt» (egen sjekk i regresjonstesten).

### Bedriften finnes fra før (punkt 5)
Returnerer `create_customer_org` en eksisterende bedrift, står det øverst: **«Bravida Drammen finnes
allerede — deler dit.»** Så kommer hvordan den ble funnet (org.nr / kundenummer i Visma), at ingen ny
bedrift og ingen invitasjon ble laget, og at e-posten som ble skrevet inn ikke har fått noe. Prosjektet
deles dit. Edge Function kalles ikke (målt: 0 kall).

## Bekreftelse punkt 6 — ingen medlemskap
- **Klientkoden i 047** (`_shr*`, og endringene i `_coOpen`/`_coSubmit`) nevner verken
  `organization_members` eller `org_invitations`, og skriver ikke direkte til `project_shares` (bare RPC).
  `_delMedElektrikerRegressionTest` sjekker kildeteksten.
- **`share_project` / `revoke_project_share`** (046): skriver bare `project_shares`.
- **`list_customer_orgs` / `list_project_shares`** (047): bare `select`. Fila har 0 linjer med
  insert/update/delete.
- **`create_customer_org`** (044v2): ingen insert i `organization_members`. Kalleren blir ikke medlem.
  Lager én invitasjon i den **nye** bedriften.
- **`opprett-kundebruker`** (045): det **eneste** medlemskapet i hele flyten. Kontaktpersonen legges i
  **sin egen, nye** bedrift (invitasjonens `org_id`), server-side. Leverandør-medlemmer avvises (409).
- Altså: Cenika blir aldri medlem hos elektrikeren, og elektrikeren aldri hos Cenika.

## Når e-posten alt har konto
`opprett-kundebruker` svarer `fantes_fra_for`. Det lages ingen ny konto og sendes ingen e-post. Brukeren
legges i den nye bedriften, invitasjonen markeres akseptert, og en `pending`-profil blir aktiv (045).
Arket sier: «<e-post> har alt en konto i Varmeplan. Ingen e-post er sendt. Brukeren er lagt inn i
<bedrift> og ser prosjektet neste gang hen logger inn med passordet sitt. Si gjerne fra selv.» Hører
e-posten til en leverandør-ansatt, kommer 045 sin 409-melding som «Invitasjonen ble ikke sendt», med
lenka som reserve. Har brukeren fra før en egen bedrift, blir hen medlem av to (løp-SPØRSMÅL 21).

## Tester
- **`docs/168/cdp/t047.mjs`** (mock av RPC og Edge Function, ingen database-skriving), mot 9333/4000:
  ark med fire delinger (alle fire statusene riktige), søk på org.nr «123 456» og «bravida ålesund», «Del»
  → `share_project(proj-1, o1, null)`, trekk tilbake → `revoke_project_share(s2)`, «Send invitasjon» →
  body `{"token":"tokLyn"}` med `Bearer`. Ny bedrift: rekkefølge `create_customer_org` → `share_project`
  → Edge med bare tokenet. `fantes_fra_for`, duplikat (0 Edge-kall, «finnes allerede — deler dit»), 404
  (ærlig melding + `?invite=`-lenke), manglende migrasjon (meldingen peker på fila). 044 uten deling er
  uendret (z 1150, «Opprett og inviter»). Knapp i dialog og rad for leverandør, ikke for installatør.
  0 sidefeil. Bilder: `docs/047/t047-1-ark.png`, `docs/047/t047-2-ny-bedrift.png`.
- **Regresjon** (`docs/168/cdp/rtests.mjs`): `_delMedElektrikerRegressionTest` 17/17 (ny),
  `_orgNrRegressionTest` 22/22, `_kundelenkeRegressionTest` 330/330, `_edgeMailRegressionTest` 14/14,
  `_appEmbedRegressionTest` 30/30, `_bgFloorRegressionTest` 31/31. `t044.mjs` uendret grønn.
  - Kundelenke- og edgeMail-testene teller invitasjonslenker på `_PUBLIC_BASE_URL`. Telleren går fra
    4 til 5, slik 044v2 gikk fra 3 til 4. Den nye lenka er reserven i `_shrShowCreateResult`.
- `grep -rn "service_role" index.html admin.html` → **0 treff**. Migrasjonsfila er ren ASCII.
- Ikke testet mot databasen: ingen av migrasjonene 042/044v2/046/047 er kjørt, og 045 er ikke deployet.

## SQL og oppsett for Kenneth (rekkefølge)
1. `supabase-migration-org-orgnr.sql` (042)
2. `supabase-migration-opprett-kundebedrift.sql` (044v2)
3. `supabase-migration-project-shares.sql` (046), med testene i fila
4. **`supabase-migration-del-med-elektriker.sql` (047)**. Verifisering: `2 | false | false`. Testene står
   nederst (TEST 1–2, alle med `rollback`).
5. `supabase functions deploy opprett-kundebruker` (045) + Redirect URL / SMTP / «Invite user»-mal
   (`docs/045/RAPPORT.md`).

## Spørsmål
Løp-`SPØRSMÅL.md` 26–31: ny lesemigrasjon, hva «ærlig status» betyr, 044-skjemaet i delingsmodus som
kaller 045 nå, «Velg passord»-skjermen mangler fortsatt (19), ingen invitasjon til eksisterende bedrift,
og hvem som ser knappen / prosjektlåsen.
