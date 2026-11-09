# Status – Varmeplan (nettsiden)

Oppdateres på slutten av hver økt. Leses av prosjektoversikten.

- **Prosjekt:** Varmeplan (nettsiden)
- **Mappe:** `~/Code/varmeplan-web`
- **Fase:** bygger
- **Sist oppdatert:** 09.11.2026
- **Sist gjort:** 224 Tak (`main`, committet og pushet, ingen SQL): kortet sier nå om omrisset er kartlagt («Omriss fra Kartverket»), avledet («Omriss avledet av høydedata», 1 m raster) eller tegnet. Feilen var hardkodet tekst i steg 1 (`_takStep1Inner`); tjenestens notat ble også kastet på veien inn og følger nå med. Ved tillit 0,3 vises tjenestens notat ordrett. Ny `_takRegressionTest224` 68/68; 92 eksisterende tester gir samme resultat som HEAD (de sju som er røde uten innlogging, er uendret). Se `docs/224/RAPPORT.md`.
- **Neste steg:** Kenneth svarer på `docs/224/SPØRSMÅL.md` (gamle prosjekter uten notat; ulik grense på kart og kort; omrisstype i lukket steg 1; notatet på store bygg). Kjør `supabase-migration-grossist-220.sql` i Supabase SQL Editor, sett et prosjekt til Grossist og last på nytt. Kenneth svarer på `docs/220-grossist/SPØRSMÅL.md` (plassering i lista; farge; skjule priser for Grossist; tellerne; «Aktive»; automatiske overganger; Visma; installatør/feltapp; gamle PROJECT_STATUSES). Kenneth svarer på `docs/219-hindring/SPØRSMÅL.md` (det skjulte rektangel-tegneverktøyet; reserveordet «Hindring» i PDF/panel; B/H-ordene; Mål-rektangelet midt i rommet over romnavnet). Kenneth svarer på `docs/218-hindring/SPØRSMÅL.md` (ingen «velg halvdel» for samme vegg; Enter; snapp mot skrå vegg; hjørne nær nabovegg). Kenneth svarer på `docs/217-hindring/SPØRSMÅL.md` (minstestørrelse 8 px / 0,9 mm; én av paret skjules; navnet vinner over målet). Kenneth svarer på `docs/216-dialoger/SPØRSMÅL.md` (nummer 216 er brukt fra før; Innstillinger uten felles bunnlinje; prøve dialogene som krever innlogging/import/kart). Tak: prøve 3D på det ekte huset og svare på `docs/221/SPØRSMÅL.md`, `docs/220/SPØRSMÅL.md` og `docs/219/SPØRSMÅL.md`. Egne prompter gjenstår for 3D i presentasjonslenka og PDF-en.
- **Blokkert av:** ingenting
- **Live:** https://varmeplan.no
