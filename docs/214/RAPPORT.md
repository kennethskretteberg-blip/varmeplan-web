# 214 · Tak: stegveiviser, kontrollmål, «gjør om til tegning» og menyer som bare viser det som gjelder — rapport

08.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.

## Kort

- **Fire steg, ett åpent om gangen.** Øverst i tak-panelet står det hvor du er og hva som er neste handling: «Steg 3 av 4 — merk kantene. 8 kanter står som «ikke valgt».» De andre stegene er sammenslåtte med en kort oppsummering («Steg 1 ✓ Steinliveien 1 · gesims 4,1 m»), og et klikk åpner dem.
- **Appen hopper ikke og sperrer ikke.** Et steg som ikke er ferdig kan åpnes, og linja sier hva som mangler. Bare «Gjør om til tegning» flytter deg til neste steg, og det er noe du selv trykker på. Et prosjekt åpner på det steget det faktisk står på.
- **Kontrollmål.** `M` (og `D`) slår på rom-modulens måleverktøy. Det snapper til hjørnene på omrisset, ikke til rasteret. Målet tegnes som i rom, men lagres ikke, kommer ikke på PDF og står ikke i angre-historikken.
- **«Gjør om til tegning».** Kartet legges bort, bygget fyller skjermen, og verktøylinja blir steg 3. «Vis kart» henter kartet tilbake. Bare `bg.visible` endres; `bg`, georeferansen og flisene røres ikke. Nabobyggene (de grå omrissene) forsvinner sammen med kartet.
- **Menyene følger steget.** Verktøylinja viser bare det steget trenger. Statuslinja viser ikke lenger R/M/P/L/W i tak-delen.
- **Tester.** Ny `_takRegressionTest214` 74/74. De 80 andre gir samme resultat som på HEAD. Rom, snø og trapp er like med HEAD i 43 av 43 sammenligninger med ekte tastetrykk og museklikk.

## STEG 0 — hva som fantes

| Antakelse i prompten | Målt | Følge |
|---|---|---|
| Statuslinja viser R/M/P/L/W i tak-delen | **Stemmer.** Bygges i `updHint`, siste gren | Egen gren for tak (`_takHintText`) |
| «Ingen av dem virker der» (204-rapporten) | **Stemmer ikke lenger.** Siden 211 starter R, M, P og W rom-tegning i tak-delen, under verktøylinja «TEGN ROM». Resultatet går til `createRoom` → `_takRoomDrawCommit` og kan erstatte omrisset. L åpner ikke noe | Tastene er slått av i tak-delen (spm. 2) |
| Alle blokkene vises samtidig | **Stemmer.** `_takCardHtml` bygger alt i ett kort | `_takCardHtml(fid, only)` |
| Måleverktøyet for rom er `M` | **Stemmer ikke.** `M` = «Rektangel med mål». Mållinja er `D` (`startDimMode`) | `M` og `D` = kontrollmål i tak-delen, rom uendret (spm. 1) |
| Måleverktøyet kan gjenbrukes uten å endre rom | **Stemmer, med to forskjeller.** I tak-delen ville målet gått til `S.floatingDims` og blitt lagret, og rasteret (50 cm) ville rundet av tallet | Egen transient liste og egen snapp, begge bare for tak |
| «Vis» i BAKGRUNN-linja | Setter bare `bg.visible`, som lagres (`_serializeBgFields`). Omrisset står. **Men** nabobyggenes vektorlag ble tegnet videre | Laget skjules når kartet er borte (bare tak) |
| Klikk for å merke 8 kanter | **16 klikk** (ett på kanten, ett i menyen), målt med ekte klikk på et 8-kants L-tak | Ikke endret (spm. 7) |

## Slik er det bygd

- **Hvilket steg som er åpent er visning, ikke prosjektdata** (`_takStepOpen`). Første gang en etasje vises, avledes steget av hvor langt prosjektet er kommet (`_takStepDerive`), og så står det der til du bytter. Bare `t.asDrawing` er nytt i lagringen.
- **`_takCardHtml(fid, only)`.** Uten `only` er kortet som før. Med `only` (1–4) viser det bare det steget. Samme parameter går gjennom kortene for kanter, renner, objekter og flatt tak. Test C sjekker at ingen tak-blokk faller ut av stegene.
- **Hva som hører hvor.** Steg 3 har rennene med lengder, nedløp med høyder, gradrenner, takvindu og hindringer. Steg 4 har løp, ferdige oppsett, bokser, snitt, startpunkt, kabelmeter og tilbehør. Flatt tak: sluk, gradrenner og felt i steg 3; kabelvalg, formler og oppsett i steg 4.
- **Kabelberegningen fra 207/213 er ikke endret** (testene 207 og 213 er grønne, men se under).
- **Kontrollmålet** ligger i `_takCheckDims`, utenfor `S`, med negative id-er. `S.counters` røres ikke, og lagringen er byte-lik med og uten mål (test E).
- **Etter steg-bytte ruller panelet til toppen**, slik at linja om hvor du er blir det første du ser.

## Tester

| Hva | Resultat |
|---|---|
| Nytt prosjekt åpner på 1; omriss alene 2; kanter + nedløp 3 eller 4 | ✓ |
| Steg som ikke er ferdig sperrer ingenting, meldingen sier hva som mangler | ✓ |
| Kontrollmål med ekte klikk: 1200 cm på en 12 m-vegg, og ikke lagret | ✓ |
| «Gjør om» skjuler kartet, beholder omriss og objekter; «Vis kart» henter det; lagret og åpnet: kartet er der | ✓ |
| Statuslinja: ingen R/P/L/W i tak, fortsatt der i rom | ✓ |
| Rom, snø og trapp (taster, rektangel med museklikk, mållinje, Esc, lagring) mot HEAD-kopi, ekte hendelser | 43/43 like (tidsstempler trukket fra) |
| Alle regresjonstester | 81 stk: 80 samme resultat som HEAD, ny 74/74 |

**Røde på HEAD og fortsatt røde (ikke fra denne endringen):** `_prosjektlaasRegressionTest` 66/67, `_kundeforslagRegressionTest` 270/271 og fem `_geo*`-tester som kaster. De samme sju var røde før endringen; jeg har ikke undersøkt hvorfor. HEAD-tallene er kjøringen fra 212, som er HEAD-commiten.

**Endring i gamle tester:** 206–210, 212 og 213 klikker og leser i hele panelet, som nå er delt på steg. De er satt til å vise hele kortet (`_takWizardWhole`) mens de kjører, så tallene deres er ikke endret, men de prøver ikke lenger veiviserens inndeling. Det gjør 214.

**Ikke sjekket:**
- Kartflisene lastet ikke i headless, så bildene viser ikke selve kartet. At det er skjult og tilbake er sjekket på `bg.visible` og i lagringen. Se på det med øynene i en ekte nettleser.
- Bildene bruker et oppdiktet bygg med 8 kanter og adressen «Steinliveien 1» som testdata. Det er ikke huset ditt og er ikke hentet fra Kartverket.

## Bilder

- `steg1-finn-bygget.png`, `steg2-kontroller.png`, `steg2-kontrollmaal.png`, `steg3-kanter.png`, `steg4-kabel.png`, `vis-kart-tilbake.png`
- `statuslinje-foer.png` og `statuslinje-etter.png`

## Sjekkliste for deg

1. Åpne et tak-prosjekt og hent bygget. Står du på steg 1, med «Videre til steg 2»?
2. Trykk `M` og mål en vegg du kjenner lengden på.
3. Trykk «Gjør om til tegning». Forsvinner kartet, og fyller bygget skjermen? Prøv «Vis kart».
4. Lagre, åpne på nytt. Står du på riktig steg, og finnes kartet?
5. Åpne et innendørsprosjekt. Alt skal være som før.

Spørsmål i `SPØRSMÅL.md`, særlig 1, 3, 5 og 7.
