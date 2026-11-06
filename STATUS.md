# Status – Varmeplan (nettsiden)

Oppdateres på slutten av hver økt. Leses av prosjektoversikten.

- **Prosjekt:** Varmeplan (nettsiden)
- **Mappe:** `~/Code/varmeplan-web`
- **Fase:** bygger
- **Sist oppdatert:** 06.11.2026
- **Sist gjort:** 198 (`main`, ikke pushet, SQL ikke kjørt): Prosjektstatus — tilbudsnr. (Visma) ved «Tilbud sendt» og ordrenr. (Visma) ved «Vunnet»/«Vi fikk jobben». Statusen lagres først (uendret `_setProjectStatus`), så kommer et valgfritt felt; tomt felt eller «Hopp over» mister ingenting. To nye kolonner på `romtegner_projects` (`visma_offer_no`, `visma_order_no`), skrevet av `_setProjectVismaNo` (error leses). Numrene kan rettes senere ved å klikke på dem i prosjektlista og i «Kunde & prosjektinfo»; de vises kort og grått under statusen («Tilbud 104455 · Ordre 2026-7719», «+ Tilbudsnr.» der det mangler) og er søkbare. Priset PDF som setter Tilbud sendt gir en melding med knappen «Legg inn tilbudsnr.», ingen dialog. Batch uendret. Før SQL er kjørt: feltene er skjult, status lagres som før (fail-open). Delte prosjekter har verken felt eller visning. Ny `_vismaNoRegressionTest198` (67); øvrige tester like med HEAD. Mobilappen ikke lest (ingen tilgang til mappa i økta). Rapport i docs/198/. Før det: 196 PDF Label/Nummer, 195 PDF «Lagre som».
- **Neste steg:** Kenneth kjører `supabase-migration-visma-tilbud-ordrenr.sql` i Supabase SQL Editor (skal vise 2), laster siden på nytt og prøver 198; ser på `docs/198/RAPPORT.md` og svarer på `docs/198/SPØRSMÅL.md` (særlig 1 bedrifter uten Visma, 2 delte prosjekter, 3 numre i PDF/Visma-eksport). 196: `docs/196/SPØRSMÅL.md` (1, 2, 8). 195: håndsjekken nederst i `docs/195/RAPPORT.md`. 194: `docs/194/SPØRSMÅL.md` (1 og 3). 197 (oppløsning/bildeformat) er neste PDF-oppgave. Push 190–198 når godkjent.
- **Blokkert av:** ingenting
- **Live:** https://varmeplan.no
