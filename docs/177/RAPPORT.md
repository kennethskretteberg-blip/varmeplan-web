# 177 · Hesteskotrapp: mål på toppflaten (strenglengde og avstand fra svingene til sidekantene)

Branch `176-hesteskotrapp` (worktree `~/Code/varmeplan-web-176`). **Ikke pushet, ikke flettet inn i main.**
Commit: «177: …». Alt ligger i `index.html`. Bare hesteskotrapper er endret.

Harness: headless Chrome på port 9376. Ny kode er servert på 4176, HEAD (`4044185`) via `git show` på 4177.
Katalogen er syntetisk (InSnow 30T-lengder, samme som 176). Ingen skyprosjekter er rørt.

## Kort svar

- **Toppflaten** har nå en målkjede rett over bakkanten: **«11 · streng 447–448 cm · 11»**.
  - Kjeden har en tikk ved venstre kant av toppflaten, ved svingene og ved høyre kant, og tynne hjelpelinjer ned
    til bakkanten.
  - Tallene leses fra rutingen (`stair.runs`). Ingenting regnes på nytt.
  - Målene vises på skjermen når mållinjene er på, det vil si fra zoom over 0,25, samme bryter som dybdekjeden.
    De vises også i PDF-planen og i detaljutsnittet for toppflaten.
- **Hvorfor «447–448» og ikke «448»:** med testkatalogen (forslag A, 70 m) slutter kabelen 1 cm før enden av den
  siste strengen, og strengen blir 447. Du ba om spennet når strengene er ulikt lange, så det står. Med låst 10 cm
  rekker ikke kabelen, og kjeden viser «streng 423–450 cm». Den 423 cm lange strengen er den siste, og resten av
  den er stiplet rødt.
- **Hesteskotrinnet:**
  - Målet «11 (sider)» fra bakkanten til svingene fantes fra før. Det er ikke endret.
  - PDF-tabellen viste bare **snittet** av strengene (680). Nå viser den **spennet** «600–760» i Streng-kolonnen,
    og linja over tabellen viser «600–760 cm/streng (snitt 680 cm)».
  - Det svarer på spørsmål 6 i `docs/176/SPØRSMÅL.md` med «begge». Si fra hvis du heller vil ha bare snittet.

## STEG 0

### 0.1 Hvordan en rett trapp målsetter sidemarginen og strenglengden i dag

**Sidemarginen** finnes, og målet ligger alltid **over** flaten:
- Skjerm: `_drawSurfWidthDims` i `_drawStairPlan`.
  - Vannrett mål venstre kant → `edgeM` og `w − edgeM` → høyre kant på `y − 4 cm`.
  - Totalbredden står på en egen linje på `y − 14 cm`.
  - Teksten står sentrert over linja, og tikkene er loddrette.
- PDF: `_stairDrawToCanvas`, blokken «STEG 4». Samme mål på `y − 2 px` og `y − 7 px`, med etiketten utelatt under
  7 px.
- Avrunding: `_stairDimRound` overalt (én desimal).
- Tallet leses fra `_stairSurfSettings(...).edgeMargin_cm`, altså feltet og ikke rutingen. For rette trapper er
  det det samme tallet.

**Strenglengden** som eget mål i cm **finnes ikke** for rette trapper:
- Skjermen viser bare kabel per flate i meter, til venstre for flaten («3.4 m»). Det regnes som
  `N × (w − 2 · margin)`.
- Detaljutsnittene (`_renderStairDetailInsets`) har bare billedteksten «N strenger · CC … · X m kabel per trinn».
- PDF-tabellen har kolonnen «Streng (cm)» per trinnserie.

Jeg gjenbrukte derfor **plasseringen og stilen** fra sidemarginen: over flaten, vannrett, tekst sentrert over
linja, loddrette tikker, blå målfarge og `_stairDimRound`. Strenglengden står i samme kjede, mellom de to
marginene. Teksten er «streng … cm», som du foreslo.

### 0.2 Hvilken margin toppflaten faktisk bruker

Målt fra rutingen for VK Hovedterrasse, forslag A med testkatalogen:

| | |
|---|---|
| løst sidemargin (`stair.edgeMargin_cm`) | 11 |
| toppflaten, 8 strenger, `segments[0].start_cm` | 11 for alle |
| toppflaten, `segments[-1].end_cm` | 459 for 7 strenger, **458** for den siste (kabelslutten, 1 cm hale) |
| bredde 470 → sving høyre | 470 − 459 = 11 |
| hesteskoen, 5 strenger | start 11, slutt 611/651/691/731/771 |

Toppflaten bruker altså samme løste sidemargin som resten av trappa. På skjermbildet ditt var den 35,3.

Hvordan tallene leses (`_stairHsTopDims`):
- Svingen ligger ytterst i strengens ende, fordi buen buler ut akkurat til endepunktet (se `_stairHsPaint`).
- **Kant → sving** er derfor `start_cm` for svingene på venstre side og `w − end_cm` for svingene på høyre side.
  Bare svingene telles. Kabelens start og slutt teller ikke med.
- Den siste strengens hale (458) påvirker derfor ikke høyremålet, som er 11. Den vises bare i strengspennet.

## Endringslogg

- **Ny `_stairHsTopDims(stair, si)`:** returnerer `{ left, right, strand, chain, leftTxt, rightTxt, strandTxt }` lest
  fra `stair.runs`, der hver verdi er [min, maks]. Er tallene like, står ett tall, ellers «a–b». Gir null for
  U-flater.
  - Har en side ingen sving (to strenger eller færre), brukes strengendene på den siden.
- **Ny `_stairHsTopChainOffPx`:** kjeden står 4 cm over bakkanten. Den løftes over «Bakkant»-teksten hvis den teksten
  stikker inn under kjedens venstre ende, noe som skjer med smale U-armer.
- **`_stairHsPaint`, blokk 6:** tegner kjeden for toppflaten.
  - Et marginledd som er for smalt for tallet, får tallet utenfor kjeden: venstre margin mot venstre, høyre mot høyre.
  - Funksjonen returnerer nå `{ dimTopPx }`.
- **`_drawStairPlanHs`:** navnet «VK Hovedterrasse · hestesko» løftes over kjeden. Før ville det ha ligget oppå
  «streng …».
- **`_stairDrawToCanvasHs` (PDF):** `padT` regnes ut fra plassen kjeden trenger i den faktiske målestokken (to
  pass). PDF-planen til VK Hovedterrasse blir 1064 × 433 px. Før var den 1064 × 404.
- **`_stairSoneGeometryBlocks`:** U-grupper får i tillegg `strandMin_cm` og `strandMax_cm`. Rette trinn får ingen nye
  felt.
- **PDF-tabellen:**
  - Kolonnen «Streng (cm)» viser spennet for U.
  - Linja over tabellen viser spenn og snitt.
  - Excel (`stairRows`) er **uendret** og viser fortsatt snittet, fordi kolonnen er numerisk.
- **Motor, kabellengder, marginer og rette trapper:** ikke rørt.

## Test

| | resultat |
|---|---|
| `_stairHorseshoeRegressionTest` | **44/44**. Var 35. De 35 gamle har samme verdier, med ett unntak: «5: PDF-plan tegnes», der lerretet er 404 → 433 px høyt. Det er ventet. |
| `_stairRegressionTest` | 47/47, verdi for verdi identisk mot HEAD |
| `_stairManualSetRegressionTest` | 42/42, identisk |
| `_stairZoneRegressionTest102` | 106/106, identisk |
| `_stairBuilderMoveRegressionTest110` | 59/59, identisk |
| `_stairSideRegressionTest` | 25/25, identisk |
| rette trapper, 7 varianter (ruting, skjermpiksler, PDF-bilder, detaljutsnitt, sidevisning, `_stairSoneGeometryBlocks`) | hash identisk mot HEAD |
| full `exportPDF` med hesteskotrapp | 5 sider, ingen unntak |

Ny seksjon 7 i hestesko-testen:
1. Venstre og høyre sving → kant = rutingen (`start_cm` / `w − end_cm`) = løst margin. `leftTxt`/`rightTxt` = «11».
2. Strengmålet inneholder bredde − 2 × margin (448), og teksten = spennet av strengene i rutingen.
3. Teksten som **tegnes** (opptatt fra `fillText` i `_stairHsPaint`) har «11», «streng … cm» og «11».
4. Låst 10 cm: «10 · streng …450 cm · 10». Målene følger med.
5. Hesteskoen i PDF-tabellen: spenn = rutingen (600–760), snittet (680) beholdt.
6. Fire hesteskotrinn i målestokk 1,5 og 3 px/cm: de tre nye tekstene overlapper **ingen** annen tekst (boks mot
   boks).

## Bilder (`docs/177/bilder/`, før = HEAD, etter = ny kode)

- `1-vk-skjerm-for/-etter.png`, `1-vk-pdf-for/-etter.png`: VK Hovedterrasse, forslag A
- `2-vk-laast10-*.png`: låst 10 cm («10 · streng 423–450 cm · 10»)
- `3-fire-trinn-*.png`: fire hesteskotrinn (300 × 60, 4 × 40), med to kabler
- `4-pdf-side2-for/-etter.png`: PDF-siden med plan, sidevisning og detaljutsnittet for trinn 2
- `5-pdf-tabell-for/-etter.png`: trappeoversikten med «600–760» i Streng-kolonnen

## Funn (fantes før 177, ikke rettet)

- Fire trinn: «K1»-merket ved startprikken ligger oppå «8.7 (sider)». Se `3-fire-trinn-*-for.png`.
- PDF med geometrimål: breddemålene for de indre flatene («300», «380», «470» …) ligger tett oppå «Trinn N»-teksten og
  strengene. Det er de grå geometrimålene fra 085, som står under hver flate og havner inne i U-en.
- Toppflaten i PDF-tabellen regnes fortsatt som N × første streng (448), slik rette trinn gjør. Halen på 1 cm står
  derfor med der. Dette var allerede beskrevet i 176.
