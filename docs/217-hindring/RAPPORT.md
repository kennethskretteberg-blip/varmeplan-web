# 217 · Hindring — målene står inne i hindringen, ikke over kabel og folie — rapport

09.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.
(Nummeret 217 er brukt fra før av «Rydding 217 S.geo», `docs/217/`; derfor ligger denne i `docs/217-hindring/`, se SPØRSMÅL 1.)

## Kort

Kenneth 09.11.2026: «Målsett hindring — her ønsker jeg at målene vises inne i hindringen. I dag vises den på
utsiden og legger seg dermed over varmekabel og varmefolie, som er forstyrrende.»

- **Før (målt på HEAD-kopien):** `autoDimHindrings` la hvert mål 20 cm *utenfor* siden (`offset = 20 · (−innover)`),
  og det vanlige `drawUserDimLines` tegnet strek, hjelpelinjer og tekst der — rett over kabelsløyfene og foliebanene.
- **Nå:** et hindringsmål er fortsatt et vanlig `room.dims`-objekt (`auto:'hindring'`), men med `hid` (hindringen det
  hører til) og offset med fortegn **innover** (10 cm, aldri mer enn en tredel av dybden bak siden: 15 × 15 → 5 cm).
  Plasseringen regnes ved tegning i `_hindDimLayout`, fordi «får teksten plass» avhenger av zoom på skjermen og av
  papirskalaen i PDF-en. Samme funksjon brukes av tegning (`_drawHindDim`), klikk-treff på mållinja og flyttegizmoen.
- **Regelen slik den er bygget:**
  1. Målestreken ligger inne i hindringen, parallelt med siden, 10 cm inn (justerbart med gizmoen som før).
  2. Tekstboksen, T-endene og hjelpelinjenes overheng må alle ligge innenfor omrisset (kanten teller som inne — T-endene
     står nøyaktig på nabosidenes linje), og teksten får ikke legge seg over hindringens navn i tyngdepunktet. Teksten
     ligger *på* streken, symmetrisk, så den aldri er nærmere kanten enn streken selv.
  3. Får den ikke plass: teksten krympes trinnvis fra 11 px til **minst 8 px** (skjerm); i PDF fra 1,2 mm til **minst
     0,9 mm** på papiret. Får den fortsatt ikke plass: målet vises 20 cm utenfor som før — og for to like lange,
     motstående sider (rektangel) vises **bare den med minst kabel/folie/matte under teksten** (15 prøvepunkter i
     tekstboksen mot `hitStrip`/`hitFoilFree`/`hitMatRun` og kabelens bane ± CC/2; likt → laveste id).
  4. PDF: størrelsen er `1,2 mm × profilens pdfLabelScale` (Normal 1,2 · Stor 1,5 · Ekstra stor 1,8 mm) — samme
     papirstørrelse som kjedetekstene (165). Skjermen er 11 px som de andre målene.
  5. Teksten leses fra bunnen eller fra høyre (`_hindDimReadAng`): loddrette sider leses nedenfra og opp, aldri opp ned.
- **Gamle prosjekter:** `_hindDimMigrate()` kjøres ved åpning (samme sted som de andre rom-migreringene): mål med
  `auto:'hindring'` uten `hid` får hindringen som eier siden, og offset flyttes inn (−20 → +10). Finnes ikke hindringen
  lenger, tegnes målet som før.
- **Brukeren kan fortsatt dra målet ut:** peker offset utover (gizmoen), tegnes det der i full størrelse, uten partnerregel.
- **Ikke endret:** rom- og veggmål (`auto:'room'`, frie mål, trappemål), hindringens virkning på utlegget,
  `drawHindringDistances` (avstand hindring → vegg ved valgt hindring).

## Målt

Fixture `probe/fixture.mjs`: fire rom på én etasje — Stue kabel 400 × 300 (kabel 60 m via `autoFillCable`, hindring 60 × 40),
Stue folie 400 × 300 (FlexFoil 60, hindring 60 × 40), Bad liten 300 × 250 (kabel 40 m, hindring 15 × 15), Kontor 400 × 300
(folie, L-hindring 100 × 100 med 50-hakk, rotert femkant r = 45). Skjerm 1400 × 900, rommet fyller lerretet (zoom 1,29 / 1,47).

| Rom | Før (HEAD) | Etter — skjerm | Etter — PDF (180 mm) |
|---|---|---|---|
| Kabel, 60 × 40 | 4 mål 20 cm utenfor, over sløyfene | 4 inne, 11 px, uavhengig sjekk «innenfor» ✓ | 4 inne, 1,2 mm |
| Folie, 60 × 40 | 4 mål utenfor, over banene | 4 inne, 11 px ✓ | 4 inne, 1,2 mm |
| Liten, 15 × 15 | 4 mål utenfor | 0 inne (15 cm = 22 px, teksten er 33 px) → 2 av 4 vist utenfor: topp og venstre | 2 av 4, 1,2 mm |
| Polygon (L + femkant) | 11 mål utenfor | 11 inne (6 + 5), femkantens tekst rotert langs sidene ✓ | 11 inne |

Bilder: `foer-*.png` / `etter-*.png` (skjerm), `foer-pdf-*.jpg` / `etter-pdf-*.jpg` (rombildet som går inn i PDF-en,
`_renderRoomToImage`), `foer-pdf-side1.png` / `etter-pdf-side1.png` (ekte `exportPDF`, side 1, via `render.swift`).

Krymping og reserve ved lavere zoom (regresjonstesten, 60 × 40 «Pipe»):

| Zoom | 40-sidene | 60-sidene |
|---|---|---|
| 1,3 | inne, 11 px | inne, 11 px |
| 0,8 | inne, krympet (≈ 9 px) | utenfor, én av paret — navnet «Pipe» 24 px inn ville kollidert med teksten 12 px inn |
| 0,45 | utenfor, én av paret | — |

60 × 80 (navnet 40 cm inn) ved zoom 0,8: alle fire inne i 11 px. Dette er den samme regelen som sender et mål ut når
hindringen er for liten: «for liten» betyr at tekst, T-ender eller navn ikke får plass sammen.

**Minstestørrelsen** jeg valgte: 8 px på skjermen (rommets øvrige mål er 11 px; 8 px er fortsatt lesbart i Space Grotesk),
0,9 mm på papiret (≈ 2,6 pt — omtrent det rommets veggmål har i dag: 11 px på 2126 px = 0,93 mm). Se SPØRSMÅL 2.

## Hvor det gjelder

Én tegnevei: `drawUserDimLines` kalles av `render()` både på skjermen, i presentasjonslenka (`?present=`/`?kunde=`) og i
PDF-en (`_renderRoomToImage` tegner på hovedlerretet med `_pdfMode`). PDF-forhåndsvisningen (155) går samme vei.
Hindringer er alltid polygoner (`points`, ≥ 3) — rektangel, L-form, vegg-til-vegg-halvdel og frihåndspolygon — så
regelen virker per side for alle former, også roterte/skrå.

## Regresjon

- Ny `_hindDimRegressionTest217` — 23/23: antall/hid/offset, inne ved 1,3, krymp ved 0,8, reserve ved 0,45 med én av
  paret, 15 × 15 → topp (ingen varme) vinner over bunn (kabel), reserve 20 cm, offset utover tegnes utenfor, gizmo på den
  indre streken, migrering av gammelt mål, lesevinkel (0/90/−90/180/135/−135°), PDF 1,2 / 0,9 / 1,8 mm, chip av igjen.
- Alle regresjonstester på HEAD-kopien og arbeidskopien: se «Alle tester» under (`probe/sammenligning.txt`).

**Alle tester** (`probe/alle.mjs`, hver test i egen fane, HEAD-kopien og arbeidskopien på port 4000):
HEAD 88 tester / 81 grønne / 4191 deltester → nå 89 tester / 81 grønne / 4214 deltester. 87 like med HEAD, 1 ny
(`_hindDimRegressionTest217` 23/23), 1 ulik: `_takRegressionTest216` 58/58 → 57/58 («E: trefflista kommer») i
samlekjøringen — kjørt alene to ganger etterpå gir den 58/58 på begge kopier (tidsavhengig adresseliste), ikke 217.
De sju røde er de samme som på HEAD uten innlogging (prosjektlås, kundeforslag L/138, fem geo-tester som kaster).
HEAD-kopien lages med `git show HEAD~1:index.html > docs/217-hindring/probe/head-index.html` (ikke sjekket inn, 7 MB).

## Filer

- `index.html`: `autoDimHindrings` (hid + innover), blokken «217 · MÅL INNE I HINDRINGEN» (`_hindDimFontPx`,
  `_hindDimInwardSign`, `_hindDimInsetCm`, `_hindDimOnEdge`, `_hindDimFindOwner`, `_hindDimMigrate`, `_hindDimReadAng`,
  `_hindDimHeatUnder`, `_hindDimLayout`, `_drawHindDim`, `_hindDimRegressionTest217`), to linjer i `drawUserDimLines`,
  klikk-treff på mållinja, `_dimGizmoCenter`, migreringskallet ved åpning.
- `docs/217-hindring/probe/`: `fixture.mjs`, `kjor.mjs` (skjerm + PDF-rombilder + JSON), `pdf.mjs` (ekte eksport),
  `t217.mjs`, `alle.mjs`/`sammenlign.js`, `patch*.mjs`, `head-index.html` (HEAD-kopien, serveres på port 4000).
