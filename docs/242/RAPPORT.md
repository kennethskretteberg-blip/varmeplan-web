# 242 – R/M/P krever kalibrert plantegning, og WBW-statuslinja teller veggene

23.11.2026 · `main` · commit HASH242 · ikke pushet · ingen SQL

## Hva som er endret
- **Hurtigtastene R, M og P** går nå via `abStartDraw(...)`, som L og W og som knappene i baren. Over en ukalibrert plantegning kommer «Ikke kalibrert / Sett målestokk» i baren, og ingen tegning starter. Med kalibrert plantegning og uten plantegning starter de som før.
- **Navn og etasje** er som før: navnet leses fra samme navnefelt i baren (tomt felt → «Rom N»), og rommet havner på aktiv etasje. Linja som setter `S.ui.pendingRoomName`/`S.ui.pendingFloorId` i keydown står, og `abStartDraw` setter i tillegg `_pendingFloorId` – så begge etasje-variablene er satt (før var `_pendingFloorId` urørt av R/M/P).
- **WBW-statuslinja:** to årsaker, begge rettet.
  1. Hint-funksjonen telte `S.drawing.points`, som alltid er tom i WBW – veggene ligger i `S.drawing.wbw.walls`. Den teller nå veggene.
  2. Statuslinja ble bare satt når verktøyet startet, aldri etter en vegg. `updWbw()` (kjøres etter hver vegg, angre og bytte Taster/Mus) oppdaterer den nå.
  Resultat: «Steg 1: Skriv lengde på første vegg …», så «Vegg 2: …», «Vegg 3: …», «Vegg 4: …». Likt med og uten plantegning. Teksten i panelet («2 vegger lagt til …») og panelets tittel («Vegg 3») var riktige fra før og er urørt.
- **Ikke rørt:** L-form og «Mål» legges fortsatt ved siden av eksisterende rom (beslutningen), verktøyene ellers, tak-delen og kundesiden.

## Kontroll
- Ny `_drawHotkeyCalibRegressionTest242`: **77/77**. Samme test mot koden før endringen: 47/77 (de 30 røde er nettopp R/M/P over ukalibrert tegning, `_pendingFloorId`, og veggnummeret).
  - Ukalibrert: r/R, m/M, p/P, l/L, w/W starter ingen tegning, ingen dialog, ingen rom; baren viser varselet.
  - Kalibrert og uten plantegning, i et prosjekt med to etasjer der den andre er aktiv: R, M og P starter riktig modus, og rommet som tegnes får navnet fra navnefeltet og ligger på aktiv etasje; tomt navnefelt gir standardnavnet.
  - WBW etter 0, 1, 2 og 3 vegger, uten og med plantegning: statuslinja, panelteksten og tittelen; angre og bytte Taster/Mus beholder riktig nummer. Statuslinja leses slik den står, uten å tvinge en oppdatering.
- `_wbwOverBgRegressionTest241`: 33/33, uendret.
- Hele suiten (`docs/242/probe/alle.mjs`), kjørt mot både HEAD og ny kode: 107 tester, de 106 gamle **like med HEAD**. Røde: de samme **åtte** uten innlogging/karttjeneste (prosjektlås, kundeforslag, fem geo-tester, tak-216). Ingen nye.
- Skjermbilder: `r-over-ukalibrert-plantegning.png`, `wbw-statuslinje-etter-to-vegger.png`.
- Ikke prøvd på en ekte importert PDF (ingen innlogging her) – bakgrunnen i testene er et tegnet bilde.

## Funn, ikke rettet
- D (mål) starter også over en ukalibrert plantegning.
- «Ignorer» i varselet lukker bare varselet; man kan fortsatt ikke tegne før målestokken er satt.

Spørsmål: `docs/242/SPØRSMÅL.md`.
