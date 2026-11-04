# 186 · Hesteskotrapp, tegningen: CC-kjede langs bakkanten, flyttbar måltabell og rettvinklet overgang

`main`, ikke pushet. Commit «186: …». Alt ligger i `index.html`. Ingen kabelregler, marginer eller strengantall er
endret. Motoren, rutingen, forslagene, måltabellens tall og materiallisten er identiske mot HEAD for 22 hesteskotrapper.

Harness: headless Chrome på port 9333 (`/tmp/cdp186`). Ny kode på 4000, HEAD (`4fc221e`) på 4185 fra `git archive`
i `/tmp/old185`. Katalogen er syntetisk (InSnow 30T, samme som 176–185). VK Hovedterrasse er bygget som på
skjermbildet ditt: 470 × 70, ett hesteskotrinn på 31, opptrinn/nese 2, gulv 2, Forslag 60 m @ 19,4. Ingen
skyprosjekter er rørt.

## Kort svar

| Ønske | Nå |
|---|---|
| **1 · CC-mål for hesteskotrinnene** | Toppflatens kjede står loddrett til høyre som før. Hesteskotrinnenes kjede står **vannrett over bakkanten, over høyre arm**: opptrinn · CC … · nese, trinn 2 innerst og trinn 3, 4, 5 videre mot høyre. |
| **2 · Flyttbar tabell** | Standard **nederst til høyre** (under trappa, høyre kant ved toppflatens kjede). Den dras med musa (pekeren blir en hånd). Plasseringen lagres på trappa (`horseshoe.tableOffset_cm`) og følger trappa. Dobbeltklikk eller **↺** gir standard tilbake. Angre virker. |
| **3 · Rettvinklet overgang** | Overgangen tegnes nå **først vannrett ut til venstre, så 90° ned** til der kabelen begynner på trinn 2. Den har aldri skrå ledd, heller ikke med «Kabelstart: Topp», «Fyll toppflaten» eller fire trinn. Rette trapper bruker samme funksjon. |

## STEG 0

### 0.1 · Hvor tegnes kjeden og tabellen, og hvor regnes PDF-plassen?
- **Kjeden:** `_stairHsPaint` blokk 6. Én loddrett kjede per flate (`vtick`) på `x = maxX + 4 cm`. Toppflaten og
  hesteskotrinnet sto altså i samme kolonne til høyre. Det er derfor de «står nedover». Hesteskotrinnets tall var
  frontbåndets dybde, ikke armens.
- **Tabellen:** samme blokk. Den sto **over** bakkanten med høyre kant ved kjeden og ble flyttet oppover til den ikke
  traff «Bakkant», navnet eller «Plan»/«Side» (`o.avoid`).
- **PDF:** `_stairDrawToCanvasHs`. `padT` ble regnet fra tabellens høyde i to runder, fordi målestokken avhenger av
  `padT`.

### 0.2 · Hvordan regnes overgangen i kabellengden?
**Bare opptrinnshøyden (Regel 5).** `generateStairCable`: `connLen = lowerSurf.stepHeight_cm` (17 cm). Avstanden i plan
telles ikke. Det gjaldt også den skrå streken. **Lengderegelen er ikke endret.**

| Trapp | Skrå strek (før) | Rettvinklet rute (nå) | Telt i kabelen |
|---|---|---|---|
| **VK 31, Forslag 60 m @ 19,4** | 27,6 cm | **38,8 cm** (21,4 vannrett + 17,4 loddrett) | 17 cm |
| VK 31, Kabelstart: Topp | 27,6 | 38,8 | 17 |
| VK 31, Fyll toppflaten (54,1) | 52,3 | 56,1 (4 + 52,1) | 17 |
| Fire trinn, hestesko → hestesko | 4,0 | 4,0 (rett vannrett, uendret) | 17 |
| Fire trinn, trinn 2 → toppflaten | 4,2 | 4,4 | 17 |

Punktene for VK: kabelen forlater trinn 2 i venstre arm i (29; 19,4), altså innerste streng 2 cm fra opptrinnet,
19,4 cm fra bakkanten. Den kommer til toppflaten i (50,4; 2), altså toppflatens første streng 19,4 cm inn og 2 cm fra
bakkanten. Den rettvinklede ruten går (50,4; 2) → (29; 2) → (29; 19,4).

Avstanden i plan er altså **ikke** med i kabellengden. For VK er det 38,8 cm (rettvinklet) som ikke telles. Panelet
viser «Overganger 0,2 m», som er opptrinnet. Se SPØRSMÅL 1.

### 0.3 · Har rette trapper og repos skrå overganger?
**På skjermen: nei.** Skjermen tegner overgangen langs grensen mellom de to flatene (samme y i begge ender). Den er
derfor vannrett eller ingenting.

**I PDF-en: ja, i ett tilfelle.** Det skjer når trinnene er bredere enn reposet og kabelen går ut på høyre side.
PDF-en tegner overgangen fra trinnets nese til neste flates bakkant, og med ulik x blir den skrå. Jeg målte 144
overganger (trinn 240 + repos 100, trinndybde 24–40, 1–3 trinn, begge retninger, begge kabelstarter). **12 var skrå**,
alle av denne typen. Alle overganger med lik bredde er loddrette (og like før og etter).

- Før/etter: `3-rett-240-repos-100-pdf-for.png` / `-etter.png`. Før gikk en skrå strek over tomt område fra
  trinn 3 til reposet. Nå går den rett opp og så vannrett inn til reposets strengende.
- Sju vanlige rette trapper (8 trinn, toppstart, trinn + repos + trinn, bred 240, to kabler, soner, 240 + repos 100
  med utgang venstre): **identiske med HEAD** (skjerm valgt/ikke valgt, PDF og kabel, målt med hash).
- Funn: skjermen og PDF-en tegner overgangen på rette trapper ulikt. Skjermen bruker grensen, PDF-en går over begge
  flatene. Se SPØRSMÅL 4.

## Endringene

### 1 · CC-kjeden langs bakkanten
- **`_stairHsArmChain(stair, range)`** (ny): leser strengenes x i høyre arm fra rutingen. Det er `_stairRunPath`, siste
  punkt (strengens ende ved bakkanten), samme senterlinje som motoren måler langs. Per trinn får vi armens indre kant →
  første streng (opptrinn), CC …, siste streng → armens ytre kant (nese). Trinnene ligger innenfra og ut, så kjeden er
  sammenhengende.
- Armen måles, ikke fronten. Med «Inntrinn sider 60» (front 46) summerer kjeden til 60 per trinn. Med «Ulik dybde per
  trinn» får hvert trinn sine egne tall.
- **`_stairHsDrawArmChain`** (ny): tegner kjeden 4 cm over bakkanten med tallene over linja. CC-tallene får første
  rad. Et tall som ville truffet naboen, løftes én rad (høyst fire rader). Opptrinn og nese er ofte 2–3 cm, og ved
  trinngrensen står «nese | opptrinn» tett. Det var der «2» og «9» ellers leste som «29».
- Toppflatens loddrette kjede står som før, med samme kode. Hesteskotrinnene er bare tatt ut av den.
- Navnet (og «Plan» i «plan + side») løftes over kjeden hvis den står under dem. Det skjer med smal toppflate og mange
  trinn. VK og fire trinn løftes ikke.
- PDF: `padT` rommer fire rader tall.

### 2 · Måltabellen
- Standard **nederst til høyre**: høyre kant der den var, toppen under trappas fremkant og forbi breddemålene (6 cm og
  tallet på skjerm, 9 cm og tallet i PDF).
- `stair.horseshoe.tableOffset_cm = { x, y }`: tabellens øvre venstre hjørne i trapp-lokale cm. Lagringen er additiv,
  og et manglende felt betyr standard. Den følger trappa fordi den er relativ.
- **Skjerm** (`_stairHsScreen`, `_stairHsTableHitAt`, `_stairHsTableDragStart`/`Move`, `_stairHsTableReset`):
  - Over tabellen er pekeren `grab`, og den blir `grabbing` under draget.
  - Å dra velger og flytter **ikke** trappa. Treffet ligger før trappas egne treff i mousedown.
  - `pushUndo` kalles ved første faktiske flytt (> 2 px), så et klikk uten flytt gir ikke et tomt angresteg.
  - ↺ vises over tabellens øvre høyre hjørne bare når den er flyttet. Dobbeltklikk på tabellen gjør det samme.
  - Skrivebeskyttet (060), kundelenke og presentasjon: tabellen kan ikke flyttes.
  - Skjermboksene lagres i en modulvariabel og **aldri i `S`**.
- **PDF** (`_stairDrawToCanvasHs`): arket regnes to ganger, med og uten den lagrede plasseringen. Plasseringen brukes
  når (a) tabellen ikke dekker tegningen (flatene med kabelmål og geometrimål) og (b) tegningen blir høyst 15 % mindre
  enn med standardplasseringen. Ellers står tabellen nederst til høyre. Tallene 15 % og «tegningen» er mine (SPØRSMÅL 2).
- **«Gjør om» finnes ikke i appen.** Det er bare angre (Ctrl+Z). Angre virker for flyttingen og for ↺.

### 3 · Rettvinklet overgang (Regel 9: én funksjon)
- **`_stairConnRoute(A, uA, B, uB)`** (ny): ruten mellom strengenden A og strengstarten B. Ligger de på linje, er den
  rett. Ellers er det ett hjørne, enten (B.x, A.y) eller (A.x, B.y): det som **forlenger** strengene (A videre i sin
  retning, B bakfra inn i sin) og aldri det som går tilbake langs en streng. For VK gir det «ut til venstre, 90° ned».
- **`_stairHsConnRoute`** (hestesko) gir A, B og fartsretningene fra `_stairRunPath`. `_stairRouteAt`/`_stairRouteSlice`
  deler ruten når en skjøt ligger i overgangen. Med to punkter er regningen nøyaktig den gamle, så rette trapper er
  piksel for piksel like.
- Brukt av: hesteskoens tegner (skjerm og PDF), rette trappers skjerm (`_drawStairPlan`) og PDF (`_stairDrawToCanvas`),
  og testene. Kabellengden bruker den **ikke** (0.2).

## Test

| | resultat |
|---|---|
| `_stairHorseshoeRegressionTest` | **206/206** (168 → 206), ny seksjon 186 og 177-sjekken «tabellen over tegningen» → «under tegningen» |
| de fem gamle trapptestene | grønne (47 + 42 + 106 + 59 + 25) |
| hel `exportPDF` med hesteskotrapp (Fredriks ti trinn) | uten feil |
| 22 hesteskotrapper mot HEAD | motor, forslag, tabellrader, PDF-tabeller, materialliste og oppsummering **identiske**. Ulike: PDF-plan, detaljutsnitt og skjerm (ventet) |
| 9 rette trapper mot HEAD | 7 identiske. 2 med PDF-endring = de skrå overgangene fra 0.3 |
| ekte mus (CDP) | hånd over tabellen, dra 400 × 80 px → `tableOffset_cm` satt, ett angresteg, trappa ikke valgt og ikke flyttet, ↺ vist; PDF bruker plasseringen; dobbeltklikk → standard; angre → flyttet igjen |

Seksjon 186 i testen:
1. Kjeden = rutingen for VK, fire trinn og ulik dybde. Fasiten er regnet uavhengig fra `pos_cm` (sidene følger
   fronten). Kjeden er sammenhengende innenfra og ut.
2. VK i målestokk 1,5 og 3: trinn 2 sine tall står vannrett over armen, og til høyre står bare toppflatens tall.
   Ingen tekst over bakkanten overlapper.
3. Fire trinn i målestokk 1, 1,5 og 3: kjedens tall og tabellens tekster mot alle andre tekster, boks mot boks.
   0 overlapp, og alle 24 kjedetall står.
4. Ulik dybde 40/45/40/30 og sider 60: hvert trinns kjede summerer til egen dybde (sider: 60).
5. Overganger for VK, Kabelstart Topp, Fyll toppflaten, fire trinn og ulik dybde: bare vannrette og loddrette ledd.
   VK-hjørnet = (strengens x på trinn 2, toppflatens y). Overgangens kabellengde er fortsatt 17.
6. Rette trapper: lik x gir to punkter. 240 → 100 til høyre gir loddrett, så vannrett.
7. `tableOffset_cm` flytter tabellen. PDF-en bruker den når den får plass og faller tilbake når den ville dekket
   tegningen eller krympet arket.
8. Dra (under 2 px gir ingenting), ett angresteg, trappa står og er ikke valgt. Tabellen følger når trappa flyttes.
   ↺, angre, dobbeltklikk/↺-funksjonen og skrivebeskyttet er også testet.

## Bilder (`docs/186/`)

- `1-vk-skjerm-for.png` / `-etter.png`: VK Hovedterrasse, ett hesteskotrinn (kjeden, tabellen, overgangen øverst til
  venstre)
- `1-vk-pdf-for.png` / `-etter.png`: samme i PDF (med geometrimål)
- `2-fire-trinn-skjerm-for.png` / `-etter.png`, `2-fire-trinn-pdf-for.png` / `-etter.png`: fire hesteskotrinn
- `3-rett-240-repos-100-pdf-for.png` / `-etter.png`: den eneste rette-trapp-endringen (0.3)
- `4-vk-tabell-flyttet-skjerm.png`: tabellen dratt ned til venstre, med ↺
- `5-vk-tabell-flyttet-pdf.png`: PDF-en med samme plassering

## Funn (fantes før, ikke rettet)

- I PDF-en står kabeletiketten «K1» oppå «Bakkant» og «(sider)»-målet ved venstre hjørne når trappa har flere
  kabler (fire trinn). Gjelder også HEAD.
- I PDF-en står breddemålet for toppflaten («470», «300» …) inne i neste trinn, oppå trinnteksten. Gjelder også HEAD.
- «19,4 (sider)» står helt inntil den nye loddrette overgangen i VK (berører, ikke over).
- Skjerm og PDF tegner overgangen på rette trapper ulikt (0.3).
