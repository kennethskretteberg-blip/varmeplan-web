# Gjenoppretting fra sikkerhetskopi av Varmeplan

Denne veiledningen ligger også inne i hver kopi, så du har den selv om Macen og repoet er borte.

**Det du trenger:** en Mac, kopien (en fil som heter `varmeplan-backup-ÅÅÅÅ-MM-DD.dmg`) og **krypteringspassordet**. Uten passordet kan ingen åpne kopien.

Kopiene ligger her:

- iCloud Drive, mappa **Varmeplan-backup** (i Finder: iCloud Drive i sidestolpen)
- den eksterne disken, mappa **Varmeplan-backup** (bare de ukene disken var koblet til)

Det tas en kopi hver søndag kl. 21:00. De 8 siste ukene beholdes, pluss én kopi per måned et halvt år tilbake.

Innhold:

- A. Åpne en kopi
- B. Se hva som er i den
- C. Hente tilbake ett prosjekt
- D. Gjenopprette alt til et nytt Supabase-prosjekt
- E. Det som IKKE er i kopien
- F. Hvis noe ikke virker

---

## A. Åpne en kopi

1. Finn fila i Finder og **dobbeltklikk** på den.
2. Skriv krypteringspassordet når Macen spør. **Ikke** kryss av for «Husk passordet i nøkkelringen» hvis det er en lånt Mac.
3. Kopien dukker opp som en disk som heter **Varmeplan-backup ÅÅÅÅ-MM-DD** i sidestolpen i Finder. Du kan se på alt, men ikke endre noe – den er skrivebeskyttet.
4. Når du er ferdig: trykk på utløserknappen (⏏) ved siden av navnet.

Har du glemt passordet, men har Macen der kopien ble satt opp? Åpne programmet **Nøkkelringtilgang**, søk etter `Varmeplan-backup`, dobbeltklikk på linja **krypteringspassord** og kryss av for «Vis passord».

## B. Se hva som er i den

| I kopien | Hva det er |
|---|---|
| `MANIFEST.txt` | Kvittering: når kopien ble tatt, hvor mange rader hver tabell hadde, antall brukere, antall filer. **Åpne denne først.** |
| `database/varmeplan.dump` | Hele databasen (prosjekter, kunder, brukerkontoer, produkter, garantibevis, reklamasjoner). Kan ikke leses direkte – se del C og D. |
| `storage/documentation/` | Dokumentasjonsbilder, signaturer og PDF-er |
| `storage/branding/` | Logoer |
| `storage/…` | Eventuelle andre lagre («bøtter») som fantes da kopien ble tatt |
| `storage-buckets.json` | Liste over lagrene og om de er offentlige eller private |
| `hent-prosjekt.sh` | Henter ut ett prosjekt (del C) |
| `last-opp-filer.sh` | Laster filene opp til et nytt Supabase-prosjekt (del D) |

Bilder og PDF-er under `storage/` kan du åpne og kopiere ut helt vanlig i Finder.

---

## C. Hente tilbake ett prosjekt

Bruk dette når ett prosjekt er ødelagt, overskrevet eller slettet, og resten av Varmeplan er i orden.

**Forberedelse (én gang):** programmet `pg_restore` må finnes på Macen. Det gjør det på Macen der kopien ble satt opp. På en annen Mac: installer Homebrew fra https://brew.sh og kjør `brew install libpq` i Terminal.

### Steg 1 – finn prosjektet i kopien

Åpne kopien (del A). Åpne så programmet **Terminal** og lim inn denne linja – bytt datoen til den som står i navnet på kopien du åpnet:

```
bash "/Volumes/Varmeplan-backup 2026-11-15/hent-prosjekt.sh"
```

Du får en liste over alle prosjektene slik de var da kopien ble tatt: nummer, når de sist ble endret, id og navn. Er prosjektet ikke i lista, eller er «sist endret» for nytt (skaden hadde alt skjedd), prøv en eldre kopi.

### Steg 2 – hent det ut

Samme linje, med prosjektnummeret bakerst:

```
bash "/Volumes/Varmeplan-backup 2026-11-15/hent-prosjekt.sh" P0402
```

Nå ligger det tre filer på Skrivebordet:

- `prosjekt-P0402.json` – innholdet i prosjektet (til å se på, eller sende til en utvikler)
- `prosjekt-P0402-oppdater.sql` – legger innholdet tilbake i prosjektet når prosjektet **finnes** i Varmeplan
- `prosjekt-P0402-rad.sql` – setter hele prosjektet inn igjen når det er **slettet helt**

Ingenting er endret i Varmeplan ennå.

### Steg 3 – legg det tilbake

Be først alle som har prosjektet åpent i Varmeplan om å **lukke det**. Ellers lagrer de sitt over det du legger tilbake.

Ligger prosjektet i papirkurven i Varmeplan, hent det tilbake derfra først.

**Prosjektet finnes, men innholdet er feil.** Lim inn disse to linjene i Terminal (bytt nummeret):

```
export PATH="/opt/homebrew/opt/libpq/bin:/usr/local/opt/libpq/bin:$PATH"
psql "$(security find-generic-password -s no.varmeplan.backup -a tilkoblingsstreng -w)" -f ~/Desktop/prosjekt-P0402-oppdater.sql
```

Svaret skal være `UPDATE 1`. Da er innholdet lagt tilbake. Åpne prosjektet i Varmeplan og se at det stemmer.
Står det `UPDATE 0`, finnes ikke prosjektet lenger – bruk neste variant.

**Prosjektet er slettet helt.** Samme to linjer, men med `-rad.sql` til slutt:

```
export PATH="/opt/homebrew/opt/libpq/bin:/usr/local/opt/libpq/bin:$PATH"
psql "$(security find-generic-password -s no.varmeplan.backup -a tilkoblingsstreng -w)" -f ~/Desktop/prosjekt-P0402-rad.sql
```

Svaret skal være `COPY 1`. Står det `duplicate key`, finnes prosjektet fortsatt – bruk varianten over.

Den lange linja henter tilkoblingsstrengen fra nøkkelringen. På en annen Mac skriver du i stedet tilkoblingsstrengen mellom anførselstegnene (Supabase → Connect → Session pooler → URI, med passordet satt inn).

Bare prosjektet legges tilbake. Garantibevis, målinger og bilder som hørte til, ligger i egne tabeller og røres ikke.

### For utviklere: det samme med en lokal database og en SQL-spørring

Ikke prøvd mot en ekte kopi. Krever en lokal Postgres-tjener av samme hovedversjon som står i `MANIFEST.txt` (for eksempel `brew install postgresql@17` og `brew services start postgresql@17`).

```
KOPI="/Volumes/Varmeplan-backup 2026-11-15"
createdb vp_gjenopprett
pg_restore --no-owner --no-privileges -n public -t romtegner_projects -d vp_gjenopprett "$KOPI/database/varmeplan.dump"
psql -d vp_gjenopprett -c "select id, project_no, name, updated_at from romtegner_projects order by updated_at desc"
psql -d vp_gjenopprett -At -c "select data from romtegner_projects where id = 'ID-FRA-LISTA'" -o ~/Desktop/prosjekt.json
dropdb vp_gjenopprett
```

`pg_restore` kan klage på fremmednøkler, regler og funksjoner som mangler lokalt. Det gjør ingenting så lenge tabellen og radene kommer inn. Kommer ikke tabellen inn (for eksempel fordi en standardverdi bruker en utvidelse som mangler), bruk `hent-prosjekt.sh`, som ikke trenger noen database.

---

## D. Gjenopprette alt til et nytt Supabase-prosjekt

Bruk dette bare når hele Supabase-prosjektet er tapt eller ødelagt. **Prøv alltid Supabase sin egen backup først** hvis skaden er under en uke gammel: Supabase → Database → Backups → Restore. Den gjenoppretter hele databasen (men ikke filene).

> **Ærlig advarsel:** denne delen er skrevet etter beste kunnskap, men er **ikke prøvd** fra start til slutt. Regn med småfeil underveis, og ta gjerne med en utvikler. Det lureste er å øve én gang på et tomt gratisprosjekt mens alt virker.

### Steg 1 – lag et nytt prosjekt

1. supabase.com/dashboard → **New project**. Samme region som før. Velg et databasepassord og skriv det ned.
2. Sjekk at Postgres-versjonen er lik eller nyere enn den som står i `MANIFEST.txt` («Postgres (server)»).
3. Trykk **Connect** → **Session pooler** → kopier URI-en og sett inn passordet.

### Steg 2 – legg inn databasen

Åpne kopien (del A). I Terminal – bytt datoen, og lim inn din egen tilkoblingsstreng mellom anførselstegnene:

```
export PATH="/opt/homebrew/opt/libpq/bin:/usr/local/opt/libpq/bin:$PATH"
KOPI="/Volumes/Varmeplan-backup 2026-11-15"
NY="postgresql://postgres.xxxxxxxx:PASSORDET@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
```

Først brukerkontoene (skjemaet `auth` finnes alt i et nytt prosjekt, så bare innholdet legges inn):

```
pg_restore --data-only --no-owner -n auth -d "$NY" "$KOPI/database/varmeplan.dump"
```

Feilmeldinger om `schema_migrations` og «duplicate key» er ventet og ufarlige.

Så Varmeplans egne tabeller, funksjoner og regler:

```
pg_restore --no-owner -n public -d "$NY" "$KOPI/database/varmeplan.dump"
```

Så tilgangsreglene for filene (skjemaet `storage` finnes fra før; her vil det komme mange «already exists» – det som skal inn, er linjene med `POLICY`):

```
pg_restore --no-owner -n storage --section=post-data -d "$NY" "$KOPI/database/varmeplan.dump"
```

Kontroll – tallene skal stemme med `MANIFEST.txt`:

```
psql "$NY" -c "select count(*) from auth.users" -c "select count(*) from public.romtegner_projects"
```

### Steg 3 – legg inn filene

```
bash "$KOPI/last-opp-filer.sh"
```

Skriptet spør om adressen til det nye prosjektet (Project Settings → Data API → Project URL) og service_role-nøkkelen der (Project Settings → API Keys). Det lager lagrene på nytt og laster opp alle filene. Til slutt står det hvor mange som ble lastet opp – tallet skal være «SUM filer» i `MANIFEST.txt`.

### Steg 4 – pek Varmeplan på det nye prosjektet

Det nye prosjektet har ny adresse og nye nøkler. Dette er utviklerarbeid:

- `index.html` i `varmeplan-web`: bytt Supabase-adressen og anon-nøkkelen, og publiser (Vercel)
- feltappen (`varmeplan-app`) og karttjenesten (`varmeplan-roof`) hvis de bruker Supabase-adressen eller nøkler
- kjør `installer.sh` på nytt, så sikkerhetskopien peker på det nye prosjektet
- gå gjennom hele lista i del E

---

## E. Det som IKKE er i kopien

Kopien inneholder data – ikke innstillinger. Dette må du ha notert et annet sted (for eksempel i passordhvelvet ditt) for å kunne bygge opp alt på nytt:

- [ ] **Auth-innstillinger** i Supabase (Authentication): Site URL, Redirect URLs, hvilke innloggingsmåter som er på, e-postmalene (bekreft konto, glemt passord, invitasjon), regler for passord
- [ ] **SMTP (Resend)**: at Supabase sender e-post gjennom Resend, avsenderadresse og -navn, og Resend-nøkkelen (Authentication → Emails → SMTP Settings). Selve Resend-kontoen og det bekreftede domenet ligger hos Resend
- [ ] **Edge Function-hemmeligheter** (Edge Functions → Secrets). Koden til funksjonene ligger i repoet under `supabase/functions/`, men hemmelighetene gjør det ikke, og funksjonene må publiseres på nytt
- [ ] **Vercel-oppsett**: hvilket repo og hvilken gren som publiseres, miljøvariabler, omdirigeringer (`vercel.json` ligger i repoet)
- [ ] **Domene**: hvor varmeplan.no er registrert, DNS-oppføringene (Vercel og e-post/Resend) og innloggingen dit
- [ ] **Supabase-kontoen**: innlogging, betalingsplan (Pro), databasepassordet
- [ ] **Databaseutvidelser og andre prosjektinnstillinger** som er slått på i Supabase (Database → Extensions, Webhooks, Cron)
- [ ] **Krypteringspassordet** til kopiene – et trygt sted utenfor Macen
- [ ] **Koden** ligger ikke i kopien, men i git (GitHub): `varmeplan-web`, `varmeplan-app`, `varmeplan-roof`

---

## F. Hvis noe ikke virker

**Se om kopiene blir tatt.** Hver søndag kveld skal det komme et varsel: «Varmeplan-kopi tatt: N prosjekter, M filer, X MB». Du kan også se i mappa Varmeplan-backup i iCloud Drive at det ligger en fil med søndagens dato, eller lese loggen:

```
open ~/Library/Logs/varmeplan-backup.log
```

En vellykket kopi slutter med en linje som begynner med `FERDIG.` En mislykket slutter med `FEILET under: …`, og linjene rett over forteller hvorfor.

**Ta en kopi nå, uten å vente til søndag:**

```
bash ~/.config/varmeplan-backup/bin/ta-kopi.sh
```

**Varselet sa «FEILET».** Vanlige årsaker:

- *Får ikke kontakt med databasen* – Macen var uten nett. Den prøver igjen neste kveld kl. 21:00, og hver kveld til den lykkes.
- *password authentication failed* – databasepassordet er byttet. Kjør `installer.sh` på nytt og lim inn ny tilkoblingsstreng.
- *Storage-API-et svarte ikke* – service_role-nøkkelen er byttet. Kjør `installer.sh` på nytt.
- *pg_dump er versjon …, men serveren er …* – Supabase er oppgradert. Kjør `brew upgrade libpq`.
- *Fikk ikke lagt kopien i … iCloud Drive* / *Operation not permitted* – macOS har ikke gitt lov. Åpne Systeminnstillinger → Personvern og sikkerhet → **Filer og mapper**, finn **bash** og slå på iCloud Drive (og Flyttbare volumer for den eksterne disken). Står ikke bash der: Personvern og sikkerhet → **Full disktilgang** → pluss-tegnet → trykk Cmd+Shift+G, skriv `/bin/bash`, legg til.

**Varselet sa «Ekstern disk ikke tilkoblet».** Det er ikke en feil. Kopien ligger i iCloud. Koble til disken før søndag kveld hvis du vil ha den der også, eller ta en kopi for hånd (linja over) mens disken er koblet til.

**Varselet sa «N filer manglet».** Noen filer lot seg ikke laste ned. Hvilke står nederst i `MANIFEST.txt` i kopien. Resten av kopien er god.

**Det kommer ikke noe varsel.** Varslene sendes som «Skriptredigering» (Script Editor). Sjekk Systeminnstillinger → Varslinger. Kopien tas uansett – se i loggen.

**Macen var av eller sov søndag kveld.** Kopien tas når Macen våkner igjen, eller når du logger inn. Lyktes den ikke da, prøver den hver kveld kl. 21:00.

**Endre noe** (ny disk, nytt passord, ny nøkkel): kjør `installer.sh` på nytt. Bytter du krypteringspassord, åpnes gamle kopier fortsatt bare med det gamle.

**Slå av:** `bash ~/Code/varmeplan-web/scripts/backup/avinstaller.sh`. Kopiene blir liggende.

**Øv.** En kopi du aldri har åpnet, vet du ikke om virker. Åpne den nyeste kopien et par ganger i året, les `MANIFEST.txt` og kjør steg 1 i del C.
