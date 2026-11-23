# 241 – Vegg-for-vegg (WBW) alltid tilgjengelig, også over importert plantegning

23.11.2026 · `main` · commit `HASH241` · ikke pushet · ingen SQL

## Årsak (bekreftet)
I «TEGN ROM»-baren (`_ctxBarItems`) sto L-form og WBW inne i `if (!hasBg)`. Med plantegning forsvant begge knappene. Hurtigtasten W virket, men startet WBW «til høyre for alle rom» og flyttet utsnittet bort fra tegningen – altså ikke brukbart over en plantegning.

## Hva som er endret
- **Baren:** L-form og WBW vises alltid. Rekkefølge med plantegning: Rektangel, Mål, Polygon, L-form, WBW, Yttervegg, Mållinje. «Importer plantegning» vises fortsatt bare uten bakgrunn. Uten bakgrunn er baren uendret.
- **Start over plantegning:** når etasjen har en bakgrunn, settes startpunktet med første klikk på tegningen (vanlig snapping, samme `getWorldPos` som ellers), og utsnittet står i ro. Panelet og statuslinja sier «Klikk på tegningen …» til punktet er satt. Deretter er WBW som før (lengde i cm + pil, eller Mus-modus). Uten bakgrunn starter WBW nøyaktig som før.
- **Hurtigtast W** går nå samme vei som knappen (`abStartDraw`). Dermed gjelder kalibreringskravet også for W: før startet W tegning over en ukalibrert plantegning.
- **Ikke endret:** selve WBW-verktøyet (vegger, lukking, panel), de andre verktøyene, tak-delens frihånd og kundesiden. Tre små tillegg var nødvendige rundt klikk-starten: fokus tilbake til lengdefeltet etter klikket, en vakt i musemodus før startpunktet finnes, og statusteksten.

L-form vises også. Den åpner mål-skjemaet og legger rommet til høyre for eksisterende rom – samme oppførsel som «Mål», som alt var synlig med plantegning. Ingen grunn til å skjule den.

## Andre steder rom tegnes
| Sted | WBW? | Gjort |
|---|---|---|
| «TEGN ROM»-baren | manglet med plantegning | lagt til |
| Hurtigtast W | virket, men feil start og uten kalibreringskrav | går via `abStartDraw` |
| «Nytt rom»-dialogen (+ i sidepanelet → formvelger) | har WBW-kort | får klikk-start over plantegning |
| Gjennomgang etter tolkemotoren / flere etasjer og sider | ingen egne verktøyvalg – bruker samme bar per etasje | ingenting å legge til |
| Kundesidens «Tegn rommene» | har WBW | urørt |
| Tak-delen («Tegn frihånd») | egen flyt | urørt |
| `#draw-toolbar` (gammel markup) | død kode, vises aldri | urørt |

Hurtigtastpanelet (`_SHORTCUTS`) hadde alt W og L – ingen ny rad trengs.

## Kontroll
- Ny `_wbwOverBgRegressionTest241`: **33/33**. Dekker: bar uten/med/ukalibrert bakgrunn og rekkefølge; knappen starter WBW; klikk setter startpunktet; utsnittet står i ro; rom 400 × 300 tegnet over bakgrunnen får veggene 400/300/400/300 cm og 12 m² og blir stående der det ble tegnet; W og «Nytt rom»-dialogen; ukalibrert → ingen tegneknapper, verken knapp eller W tegner; uten bakgrunn → som før.
- Hele suiten (`docs/236/probe/alle.mjs`): 106 tester, de 105 gamle like med forrige kjøring. Røde: de samme **åtte** som i 238–240 (ikke sju): prosjektlås, kundeforslag, fem geo-tester og tak-216 – alle uten innlogging/karttjeneste. Ingen nye.
- Skjermbilder i `docs/241/`: `bar-uten-plantegning.png`, `bar-med-plantegning.png`, `bar-ukalibrert-plantegning.png`, `wbw-1-venter-paa-startpunkt.png`, `wbw-2-to-vegger-over-plantegning.png`.
- Ikke prøvd på en ekte importert PDF (ingen innlogging her) – bakgrunnen i testene er et tegnet bilde med kjent målestokk.

## Funn, ikke rettet
- Statuslinja i WBW sier «Steg 1: Skriv lengde på første vegg …» også etter at vegger er lagt (den teller `S.drawing.points`, som WBW ikke bruker). Gammel feil, gjelder med og uten plantegning.
- R, M og P som hurtigtaster starter fortsatt tegning over en ukalibrert plantegning (knappene gjør det ikke). Bare W er rettet her.
- L-form og «Mål» legger rommet ved siden av eksisterende rom, ikke på plantegningen.

## Spørsmål
1. Skal R/M/P også kreve kalibrering, som W nå gjør?
2. Skal L-form og «Mål» plasseres med klikk når det finnes plantegning?
3. Skal WBW ha klikk-start også uten plantegning?
