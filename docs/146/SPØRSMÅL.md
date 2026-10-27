# 146 — spørsmål

1. **Gamle prosjekter uten id (C).** Skal et prosjekt der `responsible` er *nøyaktig* brukerens gamle navn
   («Kenneth Skretteberg (test)») kobles til brukeren (`responsible_user_id` settes) ved første åpning? Ikke gjort.
2. **Presentasjon/kundelenke** viser lagret tekst. Teksten oppdateres først når et koblet prosjekt lagres på nytt
   (`_buildSaveData`). Prosjekter som ikke åpnes igjen beholder «(test)» der. Ønskes en engangs-oppdatering?
3. Står `profiles_update_own` allerede i databasen? (SQL i rapporten.) Hvis ja, var årsaken bare upserten.
