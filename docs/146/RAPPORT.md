# 146 — profilnavn og «Prosjektert av»

## STEG 0 (ikke målt mot databasen — ingen innlogget tilgang i økta)
**Funn bekreftet ved lesing:** `_saveProfile` brukte `upsert` i `try/catch` uten å lese `{ error }`, så en RLS-avvisning
(INSERT-policy mangler for vanlige brukere) ga likevel «✓ Profil oppdatert!» og lokal oppdatering; ved neste
innlasting leses det gamle navnet fra `profiles`. Hva `upsert` faktisk svarer for Kenneth er **ikke målt**.

**Kenneth kan kjøre (SQL editor, bare lesing):**
```sql
select policyname, cmd, qual, with_check from pg_policies where schemaname='public' and tablename='profiles';
select id, full_name, initials from profiles where full_name ilike '%(test)%';
select count(*) filter (where data->'project'->>'responsible' ilike '%(test)%') as test_navn,
       count(*) filter (where data->'project'->>'responsible' ilike '%(test)%'
                          and coalesce(data->'project'->>'responsible_user_id','') <> '') as med_id
from romtegner_projects;
```

**Lesertabell for «Prosjektert av»**
| Sted | Leste | Nå |
|---|---|---|
| PDF-forside / Excel (`_pdfCoverMetaRows`) | tekst | `_projResponsibleName` (id → nåværende navn) |
| Filnavn-initialer (`_profileInitialsForFile` → `_plResponsibleInitials`) | tekst + id | nåværende navn; egen id uten initialer → initialer av nåværende navn |
| Prosjektliste (tooltip, søk, initialer) | tekst + id | `_responsibleDisplayName` |
| Sidepanel «Prosjektert av …» (`_renderSbProjInfo`) | tekst | `_projResponsibleName` |
| Kunde-modal, forhåndsutfylt navn | tekst | `_projResponsibleName` |
| PDF-dialogens «Bruk <navn>» | `_myDisplayName()` | uendret (leser allerede nåværende navn) |
| Presentasjon / kundelenke (uten innlogging) | lagret tekst | lagret tekst — oppdatert ved neste lagring av koblet prosjekt |
Dokumentasjon/FDV og GBAO10 leser ikke `responsible`.

## Gjort
- **A:** `_writeProfileRow`: `update(...).eq('id').select('id')`, 0 rader → `insert`, mangler `initials`/`prefs` → ny
  prøving uten kolonnen. Alle `{ error }` leses; feil vises som «Navnet ble ikke lagret: …», `_currentProfile` røres ikke,
  «✓» bare ved skrevet rad. `supabase-migration-profiles-update-own.sql` laget (ikke kjørt): idempotent egen-rad-UPDATE.
- **B:** `_responsibleDisplayName(text, uid)` / `_projResponsibleName(proj)`; lagring av koblet prosjekt skriver nåværende
  navn i teksten (`_buildSaveData`), fritekst uten id røres aldri.
- **C:** ingen automatisk endring, se SPØRSMÅL.

## Test
`_profileNameRegressionTest()` 15/15, `_prefsRegressionTest` (inkl. 062), `_pdfExportSmokeTest`, `_gbao10RegressionTest` grønne.
Ikke testet mot ekte Supabase (stubbet `_db`).

## Kenneth må selv
1. Kjøre `supabase-migration-profiles-update-own.sql` i SQL editor (trygg å kjøre flere ganger).
2. Etter utrulling: lagre navnet i Innstillinger på nytt, og se at «✓» kommer. Kommer en feilmelding, send den.
3. Åpne/lagre gamle prosjekter som skal få nytt navn i presentasjon/kundelenke (kobla prosjekter følger ellers automatisk i PDF/Excel/liste).
