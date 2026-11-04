# 185 · Hesteskotrapp: svar på 183 og 184

`main`, ikke pushet. Commit «185: …». Alt ligger i `index.html`. Bare hesteskotrapper er berørt. Rette trapper
er identiske med HEAD (målt).

Harness: headless Chrome på port 9333 (`/tmp/cdp185`). Ny kode på 4000, HEAD (`fdc8083`, 184) på 4184 fra
`git archive` i `/tmp/old184`. Katalogen er syntetisk (InSnow 30T, samme som 176–184). Ingen skyprosjekter er rørt.
Svarene dine står under hvert spørsmål i `docs/183/SPØRSMÅL.md` og `docs/184/SPØRSMÅL.md`.

## Kort svar

| Svar | Hva som skjer nå |
|---|---|
| **184/5 Armtaket i begge valg** | Løst margin, Forslag og manuelt sett i «Lik avstand» stopper ved hjørnet, som i «Fyll toppflaten». Går settet ikke opp: «for korte … forbi hjørnet (armen er X cm)». |
| **184/6 Gult merke** | Skjult i «Fyll toppflaten». I «Lik avstand» som før. |
| **184/7 Låst avstand ved hjørnet** | Gjelder begge valg. Feltets `max` = armen. En låst verdi over armen gir rødt felt og «Maks 72 cm, ellers går strengene forbi hjørnet. Låst 80 cm brukes ikke.» Gamle trapper åpnes og viser rødt. |
| **183/3 Slipp ved Enter/Tab** | En overstyrt rad slippes først når «Inntrinn foran» forlates (Enter, Tab eller klikk utenfor). |
| **183/4 Avkuttet dybdemål** | Hele teksten står nå («180», ikke «80»). |
| 184/1–4, 184/8, 183/1, 183/2, 183/5 | Ingen endring, som du skrev. |

## Mål først (184/5): endres testtrappene i valg 1?

**Nei. Ingen av de eksisterende testtrappene endres.** Grunnen er at armen ligger *over* 75 %-taket i alle sammen.
Da var det allerede 75 %-taket (og +15-taket) som stoppet marginen, og et ekstra tak ved armen biter ikke.

Målt på HEAD, valg 1:

| Trapp | Armen | 75 %-taket | Flerkabeltak (gulv + 15) | Forslag | Manuelle sett forbi armen |
|---|---|---|---|---|---|
| VK 31 (opptrinn/nese 2, gulv 2) | 72 | 58,75 | 17 | 60 @ 19,4 | ingen |
| VK 46 (3/3, gulv 5) | 73 | 58,75 | 20 | 70 @ 11 | ingen |
| VK 46 (2/2, gulv 2) | 72 | 58,75 | 17 | 78,7 @ 4,3 · 70 @ 11 | ingen |
| Fire trinn | 63 | 37,5 | 20 | 60 + 106,9 @ 5,1 | ingen |
| Ulik dybde | 63 | 37,5 | 20 | 20 + 60 + 78,7 @ 5,2 | ingen |
| Sider 60 | 73 | 58,75 | 20 | 139,9 @ 29,8 · 20 + 60 + 70 @ 6,9 | ingen |
| Brøk, i plan | 64,7 | 41,66 | 20 | 55 + 70 @ 8,6 | ingen |
| Ti trinn | 63 | 37,5 | 20 | 128,2 + 139,9 + 139,9 @ 7,1 | ingen |

«Manuelle sett forbi armen» betyr: hver katalogkabel (13 lengder) som manuelt sett, og om den løste marginen ville
gått forbi armen. Det skjedde ikke på én eneste trapp.

**Når biter armen da?** Når toppflaten er grunn i forhold til bredden. 75 %-taket regnes av den smaleste flaten
(oftest toppflatens bredde), mens armen er toppflatens dybde + opptrinnsavstanden. Testtrappa **BRED** (toppflate
700 × 40, ett hesteskotrinn på 31, opptrinn/nese 2, gulv 2) viser det:
- Armen er 40 + 2 = **42**, mens 75 %-taket er **87,5**.
- **HEAD:** Forslag ga «60 m @ 49,2» med gult merke, altså strenger **7,2 cm forbi hjørnet**. Manuelt 55 m ga 76,9.
- **Nå:** 60 m som manuelt sett gir «Kablene er 1.3 m for korte — hesteskoen måtte fått 49.2 cm avstand fra sidene,
  og strengene ville gått forbi hjørnet (armen er 42 cm).» Utlegget ligger på gulvet, med udekkede løp stiplet rødt.
- **Forslag gir ingen kort for BRED** med denne katalogen. 70 m er 1,5 m lengre enn behovet ved gulvet (68,5 m), og
  Forslag tar aldri et sett som er lengre enn behovet. Alt kortere må forbi armen. 70 m som manuelt sett passer
  (marginen på gulvet, «til overs»). Se SPØRSMÅL 3.

## Endringene

### 184/5 · Armtaket i begge valg
- `_stairMarginProbe`: `armCap` gjelder alle hesteskotrapper, ikke bare «Fyll toppflaten». Det inngår i 75 %-taket
  (én-kabel-forslaget og manuelle sett) og nå også i flerkabeltaket i valg 1 (`min(…, gulv + 15, armen)`).
- `_stairFitFixedSet`: meldingen «… forbi hjørnet (armen er X cm)» brukes i begge valg når det er armen som stopper.
- Én-kabel-grunnen i Forslag sier «strengene ville gått forbi hjørnet, armen er X cm» i stedet for «under 75 % varmet
  bredde» når det er armen som stopper.
- `_stairHsArmCapCm` leser ikke lenger `_stairSurfSettings`. Innerste streng ligger på opptrinnsavstanden, så den
  setter `depthStart`/`depthEnd` direkte. Det er de samme tallene (hesteskotrapper har ingen soner), men nå kan
  låsen spørre armen uten å gå i ring (`_stairLockedMargin` → armen → `_stairSurfSettings` → `_stairLockedMargin`).

### 184/6 · Gult merke
- `wideMargin` er `false` i «Fyll toppflaten». VK 31 med 60 m: valg 1 viser merket (19,4 > 2 + 15), valg 2 ikke (54,1).

### 184/7 · Låst avstand stopper ved hjørnet
- `_stairLockedMargin` gir `null` når en hesteskotrapp har en låst verdi over armen. Trappa oppfører seg da som uten
  lås: gulvet står, og Forslag/manuelt sett løser marginen (med armtaket). Det er det «brukes ikke» betyr her (SPØRSMÅL 1).
- Den lagrede verdien står (`edgeMarginLocked_cm`), så feltet kan vise den rødt til den er rettet. Nye hjelpere:
  `_stairLockedRawCm` (lagret verdi), `_stairLockedOverArm` (`{ cm, cap }` eller null) og `_stairLockMaxCm` (armen,
  rundet ned til 0,1; rette trapper: ingen grense).
- `_setStairEdgeMargin`: med hengelås og en verdi over armen lagres bare den låste verdien. Utlegget og gulvet
  (`edgeMargin_cm`, `edgeMarginMin_cm`) røres ikke. 70 virker som før.
- Panelet: feltet får `max` = armen når hengelåsen er på, rød kant og rød bakgrunn over armen, og meldingen under.
  Hengelåsen viser «låst» også for en verdi over armen, så du kan låse opp med ett trykk.
- Gjelder ikke rette trapper (målt: rett trapp med låst 80 har ingen armgrense).

### 183/3 · Slipp ved Enter/Tab
- Ny `_stairHsBFrontCommit`, kalt fra `onchange` (Tab/klikk utenfor) og Enter på «Inntrinn foran». Slippingen er tatt
  ut av `_stairHsBUpd`, som fortsatt kjører mens du skriver (forhåndsvisning, rader som følger felles).
- Trinn 5 = 35, skriv 350: trinn 5 er fortsatt «endret» 35, også etter at du går ut av feltet (35 ≠ 350). Skriv 35 og
  trykk Tab (eller Enter): trinn 5 slippes.

### 183/4 · Dybdemålet
- Teksten står 13 px til venstre for planens venstre kant. Når planen fylte hele bredden, var det bare 26 px igjen,
  og et tresifret tall kom utenfor bildet.
- Nå flyttes og krympes planen litt når teksten trenger mer plass. Ellers er skala og plassering som før (samme uttrykk,
  så SVG-en er bit for bit lik).
- **Dette gjaldt flere enn «180».** Målt på HEAD (tekstens venstre kant mot bildets kant): VK 46 «116» −2,2 px, fire
  trinn «220» −5,4 px, felles 12 «180» −4 px. Nå +7,4 / +4,2 / +5,6 px. En smal, dyp trapp (78,8 px) er uendret.
  Derfor er forhåndsvisningen ulik HEAD for alle 22 testtrappene (se under).

## Test

`_stairHorseshoeRegressionTest`: **144 → 168, alle grønne.**

- **Endret etter svaret** (én gammel sjekk): 183.3 slipper raden nå med `_stairHsBFrontCommit` (Tab), ikke mens man
  skriver. Samme forventede verdier.
- **Nye `185.*`:**
  1. BRED: armen 42 < 87,5; 60 m i valg 1 gir «for korte … forbi hjørnet (armen er 42 cm)», marginen på gulvet,
     udekket stiplet; ingen forslag forbi armen. VK 31, VK 46, fire trinn og ulik dybde: armen ligger over begge takene.
  2. VK 31 med 60 m: gult merke i valg 1, ikke i valg 2 (begge sjekket i det tegnede forslagspanelet).
  3. VK 31 (armen 72), begge valg: lås 80 lagres, men utlegget er nøyaktig som uten lås og gulvet er urørt; rødt felt,
     `max` 72 og meldingen. Lås 70 virker (valg 1 «70 / 70», valg 2 «2 / 70»), ikke rødt. Gammel trapp med låst 80
     åpnes, tegnes og viser rødt. Rett trapp: ingen armgrense.
  4. Med ekte `input`-, `change`- og `keydown`-hendelser: 3 → 35 → 350 slipper ikke trinn 5, heller ikke ved Tab med
     350. 35 + Tab slipper. Enter slipper også.
  5. Felles 12 på ti trinn (540 × 180): «180» står helt inne i forhåndsvisningen (5,6 px fra kanten).
- **Mot HEAD** (`cmp183.js`, 22 hesteskotrapper med fire trinn, ulik dybde, sider 60, i plan): flater og ruting (før
  og etter forslag A), forslag, PDF-plan og -side (piksler), mål og grenser, måltabell, sone-blokker, produktrader,
  lengdeoppdeling, detaljutsnitt, skjermpiksler, byggerens oppsummering og ny lagring er **identiske**. Bare
  `preview` (byggerens forhåndsvisning) er ulik, og det er 183/4-rettingen.
- De 104 gamle hestesko-sjekkene (utenom 182) gir **samme verdier** som på HEAD.
- **Gamle trapptester**, verdi for verdi identiske mot HEAD: `_stairRegressionTest` 47, `_stairManualSetRegressionTest`
  42, `_stairZoneRegressionTest102` 106, `_stairBuilderMoveRegressionTest110` 59, `_stairSideRegressionTest` 25.
  Hel `exportPDF` er lik.

## Bilder (`docs/185/`)

- `1-valg1-bred-60m-forbi-hjornet.png`: BRED 700 × 40 i «Lik avstand» med 60 m: rød melding med armen 42, 1,3 m for korte.
- `2-valg1-forslag-gult-merke.png`: VK 31, forslagskortet med gult merke i valg 1 (som før).
- `3-valg2-forslag-uten-gult-merke.png`: samme trapp i «Fyll toppflaten»: 54,1 cm, uten merke.
- `4-valg1-laast-80-rodt.png`: lås 80 i valg 1: rødt felt, «Maks 72 cm …», utlegget ligger på 19,4 som uten lås.
- `5-valg2-laast-80-rodt.png`: det samme i valg 2.
- `6-valg2-laast-70-virker.png`: lås 70 i valg 2: hesteskoen 70, toppflaten 2, ikke rødt.
- `7-bygger-350-trinn5-fortsatt-endret.png`: 350 i felles inntrinn, trinn 5 står fortsatt på 35 «endret».
- `8-bygger-felles-12-dybdemal-180.png`: felles 12, «180» står helt.

## Endringslogg

- `_stairHsArmCapCm`: setter dybdeavstandene direkte, uten `_stairSurfSettings` (ingen rekursjon via låsen).
- `_stairMarginProbe`: `armCap` for alle hesteskotrapper; flerkabeltaket i valg 1 tar også armen.
- `_stairFitFixedSet`: «forbi hjørnet»-meldingen i begge valg.
- `_stairSolveExactCableSet`: én-kabel-grunnen sier «forbi hjørnet» når armen stopper; `wideMargin` av i «Fyll toppflaten».
- `_stairLockedMargin` + nye `_stairLockedRawCm`, `_stairLockedOverArm`, `_stairLockMaxCm`.
- `_setStairEdgeMargin`, `_setStairEdgeMarginLock`: ser den lagrede låste verdien; verdi over armen lagres uten å
  røre utlegg og gulv.
- Kabelpanelet: «Avstand sider» har `id="stair-edge-margin"`, `max` = armen med lås, rødt over armen, ny melding
  `#stair-edge-margin-err`.
- Hesteskobyggeren: ny `_stairHsBFrontCommit`; «Inntrinn foran» har `onchange` og Enter. Slippingen er tatt ut av `_stairHsBUpd`.
- `_stairHsPreviewSVG`: plass til venstre dybdemål.
- `_stairHorseshoeRegressionTest`: 183.3 tilpasset, nye 185.1–185.5.
- `docs/183/SPØRSMÅL.md`, `docs/184/SPØRSMÅL.md`: svarene dine er skrevet inn. `STATUS.md` er oppdatert.

Spørsmålene står i `docs/185/SPØRSMÅL.md`.
