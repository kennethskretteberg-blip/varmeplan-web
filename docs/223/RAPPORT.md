# 223 · Skarp tegneflate og tydeligere rutenett — rapport

09.11.2026 · gren `design/varmeplan-stil` (worktree `~/Code/varmeplan-web-design`) · én commit, ikke pushet · ingen SQL ·
andre prompt i løpet serie-223-design (KUN design: ingen knapp, meny, flyt, snapping eller beregning er endret).

## Kort

- **Årsak, bekreftet:** `resizeCanvas()` satte `canvas.width = wrap.clientWidth`. På Mac (devicePixelRatio 2) ble
  lerretet tegnet i halv oppløsning og blåst opp — målt i headless Chrome med `deviceScaleFactor: 2`: buffer 1215 × 814
  vist på 2430 × 1628 fysiske piksler. Alle streker, rutenett og tekst ble myke (`docs/223/foer-utsnitt-2x.png`).
- **Nå:** bufferen er `CSS-størrelse × dpr` (2430 × 1628 i samme måling), dpr begrenset til maks 2, og `render()` setter
  `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` først. All tegnekode regner fortsatt i CSS-punkter.
- **Nytt rutenett** etter Flow Busbar-regelen (`_gridSteps`): 1 m hovedlinjer (5 m når 1 m < 12 px), 10 cm fine linjer
  bare når de står ≥ 6 px fra hverandre, ellers 50 cm ved ≥ 8 px, ellers ingen. Faste farger fra CSS-variabler, linjer
  på hele fysiske piksler, egen lerretsbakgrunn `#fbfcfd` i lyst tema.
- **Målt:** klikk → verdenskoordinat identisk med HEAD ved dpr 1 og 2, også med bredere sidepanel; tegningen uten
  rutenett er **bit-identisk** med HEAD ved dpr 1 (rom, folie, kabel, matte, hindring, mål, trapp, tak); PDF-bildene
  er bit-identiske (2126 px bredt, samme plassering, PDF 735 783 byte begge); tid per bilde uendret.

## Valget i punkt 1 — logisk størrelse som funksjon av bufferen

Tre måter ble vurdert:

| | Hva | Hvorfor ikke / hvorfor |
|---|---|---|
| A | La `canvas.width` være fysisk, og la all geometri regne i fysiske piksler (sc × dpr) | Alle 146 `ctx.font`, alle linjebredder, 12 px-kryss, målestokken «height − 22» osv. måtte skaleres hver for seg — hundrevis av steder, lett å glemme ett. |
| B | Egne variabler `_lw/_lh` som `resizeCanvas` setter, og `canvas.width` i geometrien byttes til dem | Koden som setter `canvas.width` **direkte** (PDF-bildene, `_takSectionToImage`, flere regresjonstester) måtte også huske å sette variablene, ellers går de ut av synk — nettopp den klassen feil kommentaren over `_evToCanvas` alt advarer mot. |
| **C (valgt)** | `_cvDpr` + `_cvW() = canvas.width / _cvDpr`, `_cvH()` likedan; `render()` setter transformen | Den logiske størrelsen **kan ikke** gå ut av synk med bufferen — den er avledet av den. Kode som setter `canvas.width` direkte fortsetter å virke: den setter `_cvDpr = 1` og tegner 1:1 som før (PDF-veiene gjør det eksplisitt, lagret/gjenopprettet sammen med bufferen). |

Gjennomføring: 60 lesesteder for `canvas.width/height` i geometri og «fyll lerretet»-mål er byttet til `_cvW()/_cvH()`
(w2s, s2w, _evToCanvas, clearRect, drawGrid, fitAll-variantene, bakgrunnsplassering, kortplassering, tak, tester som
regner klient ↔ lerret). 49 steder står igjen med `canvas.width` med vilje: tilordningene (`resizeCanvas`, PDF-bildene,
tester), lagring/gjenoppretting av bufferstørrelse, `!canvas.width`-vakter, og tre lokale `canvas`-variabler (trapp,
import) som ikke er hovedlerretet. `ctx.setTransform`/`resetTransform` midt i tegningen fantes bare ett sted
(`_takSectionToImage`, som nå tegner med `_cvDpr = 1`); `ctx.save/restore` (142/147) gjenoppretter transformen vår.
`ctx.getImageData` leser fysiske piksler — brukes bare i to tak-tester, som nå ganger med `_cvDpr`.

dpr-endring: `matchMedia('(resolution: Ndppx)')` fyrer når vinduet flyttes mellom skjerm med og uten retina (eller
nettleseren zoomes) → `resizeCanvas()` → ny lytter.

## Rutenett

| | Før | Nå |
|---|---|---|
| Fine linjer | 10 cm fra 4 px, svart 7 % | 10 cm fra 6 px, ellers 50 cm fra 8 px, ellers ingen — `--grid-fine` |
| Hovedlinjer | 50 cm (svart 14 %) + 500 cm (svart 25 %) | 1 m, 5 m når 1 m < 12 px — `--grid-major` |
| Akser x = 0 / y = 0 | som 500 cm-linjene | egen farge `--grid-axis` |
| Origo-kryss | svart 22 % | aksefargen, samme form |
| Lerretsbakgrunn (lyst) | `#f0f4f8` (= appen) | `#fbfcfd` (`--canvas-bg`) |
| Piksler | hvor de falt (ofte 2 px utsmurt) | hele fysiske piksler, bredde `round(dpr)` fysiske (1 på vanlig skjerm, 2 på Mac) |

Farger: lyst `#edf0f5` / `#d9dee7` / `#b9c3d1` (som Busbar); mørkt `#141720` / `#20242d` / `#323848` på lerret `#0d0e10`
(samme vekt som de gamle hvite 1,3 / 6 / 10 %, bilde `etter-moerkt-normal.png`). Variablene ligger i `:root` og
`body.light-theme`; `drawGrid` leser dem via `_gridColors()` (getComputedStyle bare ved temabytte).
Snapping urørt: `GRID 50`, `SUBGRID 10`, `AGRID 500` står og brukes som før (`gridSnap` m.fl.). «Raster»-knappen
(`S.ui.showGrid`) og målestokken er urørt.

## Målt (`docs/223/probe/`, HEAD-kopi mot arbeidskopi, headless Chrome 9333, server 4013)

### Klikk → verdenskoordinat (`klikk.mjs`, 217-fixturet, zoom 1,1)

Fem klientpunkter + ett ekte klikk midt i rom 32, ved deviceScaleFactor 1 og 2, med sidepanel 272 px og 480 px:

| | HEAD buffer | Nå buffer | Verdenskoordinater | Klikk velger rom 32 |
|---|---|---|---|---|
| dsf 1, smalt panel | 1215 × 814 | 1215 × 814 | like (5/5) | ja / ja |
| dsf 1, bredt panel | 915 × 814 | 915 × 814 | like (5/5) | — |
| dsf 2, smalt panel | 1215 × 814 | **2430 × 1628** | like (5/5) | ja / ja |
| dsf 2, bredt panel | 915 × 814 | **1830 × 1628** | like (5/5) | — |

### Plassering (`plassering.mjs`, utvidet fixture: 217-rommene + matterom + trapp med repos + brukermål, og tak-modulen)

Hash av hele lerretet (PNG) uten rutenett: oversikt, kabel + hindring, folie + mål, matte, trapp, tak — **6/6 identiske
med HEAD ved dpr 1** (`a0c34548`, `b51ff85e`, `a6e7a7aa`, `667bdff0`, `8723be8a`, `ee425d3f`). Ved dpr 2 er `w2s` for
origo, rom, matte, trapp og takhjørne identiske med HEAD (CSS-punkter), mens pikselhashen naturlig er en annen (bufferen
er 2×).

### PDF-bildene (`pdf.mjs`, deviceScaleFactor 2 — der feilen ville vist seg)

| | HEAD | Nå |
|---|---|---|
| Rom 31 (kabel) `_renderRoomToImage` | 2126 × 1822, bbox 14,454–1671,1811, hash `91d0b991` | identisk |
| Rom 32 (folie) | 2126 × 1822, bbox 14,347–1755,1811, hash `35a89ef3` | identisk |
| Plantegning `_renderFloorToImage` | 2126 × 462, bbox 91,91–2034,370, hash `20f4d66c` | identisk |
| Hel PDF (5 sider) | 735 783 byte, 0,99 s | 735 783 byte, 0,99 s |
| Hovedlerretet etterpå | 1215 × 814 | 2430 × 1628, `_cvDpr` 2 (gjenopprettet) |

Målstørrelsene fra 226 er dermed uendret (bit-like bilder).

### Ytelse (`ytelse.mjs`, 64 rom: 217-rommene + 60 nye, 202 foliebaner, 22 kabler; 40 bilder panorering, median ms)

| Utsnitt | HEAD dsf 1 | Nå dsf 1 | HEAD dsf 2 | Nå dsf 2 |
|---|---|---|---|---|
| Oversikt (zoom 0,25), rutenett på | 27,9 | 27,8 | 27,9 | 27,7 |
| Oversikt, rutenett av | 27,7 | 27,5 | 27,7 | 27,2 |
| Normal (0,7), rutenett på | 3,8 | 3,7 | 3,7 | 3,6 |
| Normal, rutenett av | 3,5 | 3,5 | 3,5 | 3,6 |
| Tett (1,6), rutenett på | 2,6 | 2,7 | 2,6 | 2,7 |
| Tett, rutenett av | 2,6 | 2,5 | 2,6 | 2,6 |

Tiden er geometri-bundet (oversikten tegner alle 202 baner og 22 kabler), ikke pikselbundet; 4× flere piksler ved dsf 2
koster ingenting målbart i headless. Rutenettet koster ≤ 0,3 ms (ett `stroke()` per linjestyrke i stedet for ett per linje).

### Skjermbilder (`skjerm.mjs`, `moerk.mjs`, deviceScaleFactor 2, lyst tema, 1215 × 814 CSS-punkter → 2430 × 1628 px)

- `foer-langt-ut.png` / `etter-langt-ut.png` — zoom 0,22: 50 cm fine + 1 m hoved (10 cm = 4,4 px → av).
- `foer-normal.png` / `etter-normal.png` — zoom 0,6: 10 cm fine (12 px) + 1 m hoved.
- `foer-tett-inn.png` / `etter-tett-inn.png` — zoom 1,6, rom 32 valgt.
- `foer-utsnitt-2x.png` / `etter-utsnitt-2x.png` — hjørnet av rom 32 i 2× forstørrelse: her ser man utsmøringen før og
  skarpheten nå (tekst «60 cm», hindringsmålene, folie-kantene).
- `etter-moerkt-normal.png` — mørkt tema.

### Regresjonstester

Ny `_canvasRegressionTest223` (24 sjekker: buffer = CSS × dpr; klikk → verden som formelen fra før 223 ved dpr 1 og 2 og
etter bredere sidepanel; rutenett-trinn; CSS-farger i begge temaer; bare faste farger og hele piksler i `drawGrid`;
PDF-bildet 800 px bredt med hjørnene der 1:1-formelen sier, lerretet gjenopprettet) — **24/24 ved dsf 1 og dsf 2**.

Hele suiten (`alle.mjs` + `sammenlign.js`, 92 tester på HEAD): se avsnittet «Suiten» nederst.

## Ikke rettet / funnet underveis

- **Port 4010** er fortsatt den gamle Python-serveren (404); 4013 fra 226 ble brukt (spørsmål 5).
- **Sju røde tester også på HEAD** uten innlogging: `_prosjektlaasRegressionTest` (E), `_kundeforslagRegressionTest` (L/138),
  og de fem `_geo*RegressionTest(results)` som tar et `results`-argument og ikke kan kjøres alene (kaster) — de kjøres av
  `_geoRegressionTest`, som er grønn. Samme som i 226.
- **Nettleserzoom under 100 %** gir dpr < 1 og en mindre buffer (riktig for skjermen); ikke begrenset nedad (spørsmål 7).
- Hovedlerretets `toDataURL` gir nå 2× bilder på Mac — brukes bare av PDF-veiene (1:1) og tester (spørsmål 8).
- `SUBGRID` brukes ikke lenger av `drawGrid` (trinnene regnes i `_gridSteps`), men konstanten står som før.

## Suiten

`alle.mjs` (hver test i egen fane, dsf 1) mot HEAD-kopien og arbeidskopien, `sammenlign.js`:

| | Tester | Grønne | Deltester |
|---|---|---|---|
| HEAD (`3e39ffb`) | 92 | 85 | 4 281 |
| Nå | 93 | 86 | 4 305 |

87 tester har nøyaktig samme tall som HEAD; de 5 «ulike» er de fem `_geo*RegressionTest(results)`-funksjonene som
kaster samme `TypeError` på begge sider (bare linjenummeret i stakken er flyttet); 1 ny (`_canvasRegressionTest223`
24/24). De sju røde er de samme som på HEAD (se «Ikke rettet»). Ingen test har endret resultat. Rådata:
`docs/223/probe/alle-head.json`, `alle-etter.json`, `alle-*.log`.
