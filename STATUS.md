# Status – Varmeplan (nettsiden)

Oppdateres på slutten av hver økt. Leses av prosjektoversikten.

- **Prosjekt:** Varmeplan (nettsiden)
- **Mappe:** `~/Code/varmeplan-web`
- **Fase:** bygger
- **Sist oppdatert:** 09.11.2026
- **Sist gjort:** 220 Prosjektstatus (`main`, committet, ikke pushet, **SQL ikke kjørt**): ny salgsstatus «Grossist» (lilla) sist i lista — valgbar i chipen, masseendring og kundekort, filtrerbar i nedtrekket; `_filterProjectsList` leser statuslista. Databasen har CHECK på de fire gamle verdiene → additiv migrasjon `supabase-migration-grossist-220.sql` må kjøres i Supabase SQL Editor før Grossist kan lagres (før det avvises lagringen med en melding som sier hvilken fil). Priser og dashbord-tellere urørt (spørsmål). Ny `_grossistRegressionTest220` 30/30. Se `docs/220-grossist/RAPPORT.md`.
- **Neste steg:** Kjør `supabase-migration-grossist-220.sql` i Supabase SQL Editor, sett et prosjekt til Grossist og last på nytt. Kenneth svarer på `docs/220-grossist/SPØRSMÅL.md` (plassering i lista; farge; skjule priser for Grossist; tellerne; «Aktive»; automatiske overganger; Visma; installatør/feltapp; gamle PROJECT_STATUSES). Kenneth svarer på `docs/219-hindring/SPØRSMÅL.md` (det skjulte rektangel-tegneverktøyet; reserveordet «Hindring» i PDF/panel; B/H-ordene; Mål-rektangelet midt i rommet over romnavnet). Kenneth svarer på `docs/218-hindring/SPØRSMÅL.md` (ingen «velg halvdel» for samme vegg; Enter; snapp mot skrå vegg; hjørne nær nabovegg). Kenneth svarer på `docs/217-hindring/SPØRSMÅL.md` (minstestørrelse 8 px / 0,9 mm; én av paret skjules; navnet vinner over målet). Kenneth svarer på `docs/216-dialoger/SPØRSMÅL.md` (nummer 216 er brukt fra før; Innstillinger uten felles bunnlinje; prøve dialogene som krever innlogging/import/kart). Tak: prøve 3D på det ekte huset og svare på `docs/221/SPØRSMÅL.md`, `docs/220/SPØRSMÅL.md` og `docs/219/SPØRSMÅL.md`. Egne prompter gjenstår for 3D i presentasjonslenka og PDF-en.
- **Blokkert av:** ingenting
- **Live:** https://varmeplan.no
