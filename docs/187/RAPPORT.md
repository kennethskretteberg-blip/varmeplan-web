# 187 · Trapp: svar på 185 og 186

`main`, ikke pushet. Commit «187: …». Alt ligger i `index.html`. Svarene dine står under hvert spørsmål i
`docs/185/SPØRSMÅL.md` og `docs/186/SPØRSMÅL.md`.

Harness: headless Chrome på port 9333 (`/tmp/cdp187`). Ny kode på 4000, HEAD (`4b8435b`) på 4186 fra `git archive`
i `/tmp/old186`. Katalogen er syntetisk (InSnow 30T: 20, 30, 40,1, 49,7, 55, 60, 70, 78,7, 89,1, 98 m), samme som
176–186. Testtrappene har opptrinn/nese 2 og gulv 2, som VK Hovedterrasse. Ingen skyprosjekter er rørt.

## Kort svar

| Ønske | Nå |
|---|---|
| **185/1, 2, 4** | Ingen endring. Gulv 80 uten lås på VK legges på 80, uten sperre (testet). |
| **185/3 · BRED** | Forslag A er **70 m på gulvet, gult, «1.5 m til overs»**. Forslag B er 20 + 49,7 = 69,7 m («1.2 m til overs», under 2 %, dempet). Kortene sier «Kortere kabler måtte gått forbi hjørnet». Gjelder bare hestesko, og bare når ingen sett går opp. |
| **186/1 · ruten i plan** | Hestesko: overgangen er **opptrinn + ruten i plan**. VK @ 19,4: 17 + 38,8 = 55,8 cm, og behovet øker med nøyaktig 38,8 cm. Tegning, behov, Forslag, panel, måltabell, materialliste og PDF leser samme rute. |
| **186/2, 5** | Ingen endring. |
| **186/3 · «2 + 2»** | Nese + opptrinn ved trinngrensen er ett tall «2 + 2», alt på **én rad**. Se avsnittet om kjeden: CC-tallene kan bli «4 × 9». |
| **186/4 · rette trapper** | Overgangen går fra strengens ende rettvinklet til neste strengs start, på skjerm og i PDF, med samme funksjon. **Kabellengden er identisk med HEAD** for alle 9 rette testtrapper. |

## 1 · Hesteskotrapper: hva endret seg (tabell)

«Forslag» er første forslag. «Åpnet igjen» er en trapp lagret med HEAD-forslaget og åpnet i ny kode. Den regnes om
ved åpning, men margin og kabelsett står som lagret.

| Trapp | Behov ved gulv (m) | Forslag HEAD | Forslag nå | Overganger nå (cm) | Åpnet igjen |
|---|---|---|---|---|---|
| **VK 31 (Kenneth)** | 64,17 → 64,21 | 60 @ 19,4 | **60 @ 21,1**, Passer | 59,2 (17 + 42,2) | **«0.4 m for kort»**, 38 cm stiplet rødt |
| VK 31, Kabelstart Topp | 64,17 → 64,21 | 60 @ 19,4 | 60 @ 21,1, Passer | 59,2 | «0.4 m for kort», 38 cm rødt |
| VK 31, Fyll toppflaten | 64,17 → 64,21 | 60 @ 54,1 | 60 @ 62,1, Passer | 81,1 (17 + 64,1) | «0.6 m for kort», 56 cm rødt |
| VK 46 | 79,33 → 79,37 | 78,7 @ 4,3 | 78,7 @ 4,6, Passer | 26,2 | Passer, 7 cm rødt |
| Fire trinn | 168,60 → 168,76 | 40,1 + 49,7 + 78,7 @ 2,2 | **20 + 70 + 78,7 @ 2,1** | 21 · 21 · 21 · 21,2 | «0.2 m for kort», 16 cm rødt |
| Ulik dybde 40/45/40/30 | 167,00 → 167,16 | 40,1 + 55 + 70 @ 5,5 | samme @ 6,0 | 21 · 21 · 21 · 29 | «0.2 m for kort», 24 cm rødt |
| Sider 60 (2 trinn) | 152,14 → 152,22 | 20 + 60 + 70 @ 6,9 | samme @ 7,3 | 23 · 31,6 | «0.2 m for kort», 18 cm rødt |
| Brøk 333,3 × 61,7 (3 trinn, i plan) | 127,92 → 128,04 | 55 + 70 @ 8,6 | **30 + 98 @ 2,1** | 21 · 21 · 21,2 | «0.3 m for kort», 26 cm rødt |
| Ti trinn 28 | 412,8 → 413,2 | ingen (for lang) | ingen | — | — |
| Ti trinn, Fredrik | 428,3 → 428,7 | ingen (for lang) | ingen | — | — |
| **BRED 700 × 40** | 68,49 → 68,53 | **ingen** | **70 @ 2, gult, 1.5 m til overs** | 21 | (ingen lagret) |

Slik leser du tabellen:
- **Forslag er «som før»** på alle trappene der et sett går opp. Ingen av dem får «for langt»-varianten. Marginen
  løses litt høyere, fordi behovet er litt større.
- **To trapper får et annet sett:**
  - Fire trinn: 168,5 og 168,7 m gir nesten samme margin, og da vinner settet som står først (uavgjort).
  - Brøk: 128 m (30 + 98) var 8 cm for langt på HEAD og ble ikke vurdert. Nå er behovet 12 cm større, og 128 m går
    opp på gulvet.
- **Passer → for kort:** ja, alle lagrede hesteskotrapper med et valgt forslag skifter fra «Passer» til
  «0.2–0.6 m for kort», med en stiplet rød bit på slutten. VK 46 er unntaket (7 cm, fortsatt «Passer»). Statusen
  blir ikke rød, fordi avviket er under 2 %. Trykker du Forslag på nytt, går de opp igjen. Se SPØRSMÅL 1.
- Med et **manuelt** kabelsett (ikke forslag) løses marginen på nytt ved åpning. Da står det fortsatt «Passer».
  VK 31 med 60 m: 19,4 → 21,1.

### Test 3 · VK 31, 60 m
- Ved samme margin (19,4) øker behovet fra 59,99 til 60,38 m. Det er **+38,8 cm**, og overgangen er 17 → 55,8.
- Ved 60 m løses marginen til **21,1**. Ruten i plan er da 42,2 cm (den vokser 2 cm per cm margin), og 60 m går opp.
- Tallene er like overalt (testet): panel 60 m (Overganger **0,6 m**), måltabellens «Kabel»-kolonne 34,2 + 25,2 +
  0,6 = 60, materialliste 60, PDF-blokk 60. Det samme gjelder «Fyll toppflaten», Kabelstart Topp og fire trinn.
- Bilde: `2-vk-forslag-panel-for.png` / `-etter.png`, `2-vk-pdf-*.png`.

### Marginløseren (ny detalj)
Før regnet løseren med at behovet faller 2 cm per streng per cm margin (`2 × strenger`). Ruten i plan går fra
strengenden ved marginen, så den **vokser** med marginen. For VK faller behovet derfor 22 cm per cm, ikke 24.
Stigningen måles nå på motoren selv (`_stairMarginProbe.slope`, to beregninger 5 cm fra hverandre), og bare for
hestesko. Rette trapper regner nøyaktig som før.

## 2 · BRED (185/3)
- Behovet ved gulvet er 68,5 m. 60 m ville gitt 49,2 cm (forbi armen 42). Alt kortere må altså forbi hjørnet.
- **Forslag A: 70 m**, 2,2 % for lang → gult kort og gult merke «Kortere kabler måtte gått forbi hjørnet — 1.5 m til
  overs». Når forslaget er valgt, er panelet gult: «1.5 m til overs». Ingen streng går forbi armen.
- **Forslag B: 20 + 49,7 = 69,7 m**, 1,7 % for lang → dempet. Det er det *korteste* settet. Jeg har satt én kabel
  som A, slik Forslag gjør ellers (084), og det gir 70 m som du skrev. Se SPØRSMÅL 2.
- Bilder: `1-bred-forslag-for.png` (ingen forslag), `1-bred-forslag-etter.png`, `1-bred-valgt-etter.png`.

## 3 · Kjeden «2 + 2» på én rad (186/3)
- Nese og opptrinn ved trinngrensen står som ett tall, «2 + 2», sentrert over grensen. Ytterkantene står alene.
- Alle tallene står på **én rad**. Ingen stabling, og PDF-en reserverer nå én rad i stedet for fire.
- **Funn:** med fire trinn og CC 9 i PDF er det ikke plass til fire «9» per trinn på én rad. Før lå de i fire rader.
  Det jeg har gjort:
  1. Får ikke alle CC-tallene på et trinn plass hver for seg, står de som ett tall over trinnets CC-strekk:
     **«4 × 9»** (eller «4 × 8.5–9» om de er ulike).
  2. Får heller ikke det plass, tegnes hele kjeden med mindre skrift, ned til 60 %. Det trengs i PDF-en med fire
     trinn (`3-fire-trinn-pdf-etter.png`).

  Ingen tall utelates, og ingen overlapper (testet i målestokk 1, 1,5 og 3). VK har plass til alle tallene hver for
  seg og ser ut som før. Se SPØRSMÅL 3.

## 4 · Rette trapper (186/1 og 186/4)

### Overgangen
- Overgangen går nå fra **siste strengs ende** til **neste strengs start**. Før gikk den fra flategrense til
  flategrense på skjermen, og fra nese til bakkant i PDF-en.
- Med like brede trinn er det en loddrett strek på 4 cm (nese 2 + opptrinn 2). Før var det et punkt på skjermen og
  en lang strek i PDF-en.
- Trinn 240 → repos 100 med utgang høyre: loddrett opp til reposets første streng, så vannrett inn.
- Skjerm og PDF bruker samme funksjon (`_stairConnPlanRoute`).
- **Funn under arbeidet:** på rette trapper er `run.isGoingRight` bare pariteten inne i flaten. Tegneren speiler
  flaten etter inngangssiden. Ruten bruker derfor `conn.exitRight` på rette trapper. Uten det gikk ruten tvers over
  trappa.
- Bilder: `4-rett-240-repos-100-skjerm/pdf-for/etter.png`, `5-rett-8-trinn-skjerm/pdf-for/etter.png`.

### Kabellengden er uendret
For alle 9 rette testtrapper (8 trinn, topp-start, trinn + repos + trinn, bred 240, to kabler, soner og tre varianter
av 240 + repos 100) er runs, connections og total **hash-identiske med HEAD**. Bare skjerm og PDF er ulike, som
ventet.

### Hvor mye ruten i plan *ville* lagt til (ikke telt)

| Rett trapp | Behov (m) | Overganger | Ruten i plan per overgang | Sum | Andel |
|---|---|---|---|---|---|
| 8 trinn 120 | 36,39 | 7 | 4 cm | 28 cm | 0,8 % |
| 8 trinn, topp-start | 36,39 | 7 | 4 | 28 | 0,8 % |
| Trinn + repos + trinn (120) | 49,76 | 8 | 4 / 7 (repos) | 38 | 0,8 % |
| Bred 240, 10 trinn | 93,53 | 9 | 4 | 36 | 0,4 % |
| To kabler, 14 trinn 210 | 114,21 | 13 | 4 | 52 | 0,5 % |
| Soner (4 trinn + repos) | 54,18 | 3 | 4 | 12 | 0,2 % |
| Frydenbø 8 trinn 240 (32/16) | 74,72 | 7 | 4 | 28 | 0,4 % |
| Trinn 240 (4) + repos 100, utgang venstre | 48,28 | 4 | 4 / 7 | 19 | 0,4 % |
| **Trinn 240 (1) + repos 100, utgang høyre** | 17,87 | 1 | **147** (7 + 140) | 147 | **8,2 %** |
| **Trinn 240 (3) + repos 100, utgang H-V-H** | 32,01 | 3 | 4 / **147** | 155 | **4,8 %** |

På vanlige trapper er tillegget under 1 % (4 cm per trinn). Det monner bare når kabelen går ut på motsatt side av et
smalere repos: da går den 140 cm tvers over trinnet.

## Endringer (endringslogg)
- **`_stairRunEndPt`, `_stairConnRouteBetween`, `_stairConnPlanRoute`** (nye): et punkt og en fartsretning på en
  streng, og ruten mellom to strenger. `_stairHsConnRoute` er nå et alias.
- **`generateStairCable`**: for hestesko legges ruten i plan til hver overgangsbit (`riser_cm`, `plan_cm`, `len_cm`).
  Den samme ruten tegnes.
- **`_stairMarginProbe`**: ny `slope` (målt for hestesko, `2 × strenger` ellers). Den brukes i `solve` og i «for
  korte»-meldingen i `_stairFitFixedSet`.
- **`_stairSolveExactCableSet`**: husker sett som er for lange. For hestesko uten løsning returneres korteste sett
  ≤ 5 % (`overSet`, `fitStatus`), med én kabel som `single`. `_generateStairProposals` bærer `overSet`, og kortet
  får gult/dempet merke og farge.
- **`_stairHsDrawArmChain`**: én rad, `_stairHsArmChainLabels` («2 + 2»), «N × cc» og mindre skrift ved behov.
  `padT` i PDF-en reserverer én rad.
- **Rette trapper**: skjerm (`_drawStairPlan`) og PDF (`_stairDrawToCanvas`) bruker `_stairConnPlanRoute`.
- **`_restoreProject`**: hesteskotrapper regnes om ved åpning (`_regenerateStairCable`). Det skjer bare når
  katalogen er lastet, og ingenting lagres.

## Test

| | resultat |
|---|---|
| `_stairHorseshoeRegressionTest` | **235/235** (206 → 235) |
| de fem gamle trapptestene | grønne, uendret (47 + 42 + 106 + 59 + 25) |
| 9 rette trapper mot HEAD | kabel identisk, tegning ulik (ventet) |

Endrede forventninger i hesteskotesten, alle på grunn av ruten i plan:
- 1: 7 157 → **7 167** (overgang 17 + 10)
- 4: margin 11 → **12** ((7167 − 7000) / 24)
- 7: «600–760» → «598–758» (margin 12)
- 186.3: teller «2 + 2» og «N × cc»
- 186.5: overgangen = 17 + ruten
- 184.1: VK 31 med 60 m: 19,4 → **21,1** (427,8 · 575,8–683,8)

Ny seksjon 187:
- VK @ 19,4 +38,8, stigningen 22, 60 m går opp
- like tall i panel/tabell/liste/PDF for fire trapper
- overgang = 17 + rute for Fyll toppflaten, fire trinn og Kabelstart Topp
- BRED A/B/kort/panel
- Forslag som før på VK 31, VK 46 og fire trinn
- gulv 80 uten lås
- én rad med 3 «a + b»
- rette trapper: ruten fra ende til start, rettvinklet, lengde 17

Ikke kjørt: hel `exportPDF`-smoke (bare trappens PDF-tegning er laget og sett på).
