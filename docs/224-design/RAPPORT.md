# 224 · Inter-skrift og skjul-knapp på venstrepanelet — rapport

09.11.2026 · gren `design/varmeplan-stil` (worktree `~/Code/varmeplan-web-design`) · én commit `cd4cf2a` (+ hash-oppfølging), ikke pushet · ingen SQL ·
tredje prompt i løpet serie-223-design (KUN design: ingen knapp, meny, flyt, hurtigtast, snapping eller beregning er endret;
skjul-knappen er den ene nye knappen prompten ba om).

## Kort

- **Skrift:** Inter (400/500/600/700 fra Google Fonts, samme `<link>` som før) er nå `--font-ui` og lerretsskriften;
  Space Grotesk bare i logoen (`.np-logo`, `.tb-logo`); IBM Plex Mono bare i tallfelt der man skriver inn mål.
  Bytte til systemskrift = fjern `'Inter'` i `--font-ui` (CSS) og i `CANVAS_UI_FONT` (ved `BASE_SCALE`).
- **Lerretet:** 112 `ctx.font`/`c.font`-linjer byttet fra hardkodet `'Space Grotesk'`, `sans-serif`, `system-ui` og
  `DM Sans/DM Mono` til `${CANVAS_UI_FONT}` / `${CANVAS_NUM_FONT}` (begge Inter). **Ingen størrelse er endret** — PDF-målene
  fra 226 står. `document.fonts.ready` og `loadingdone` → `markDirty()`, så første bilde tegnes på nytt når Inter er lastet.
- **Minste lesetekst 12 px:** 87 steder i CSS-blokken og 756 inline-stiler i HTML-malene (10–11,5 px → 12 px);
  overskrifter med store bokstaver minst 11 px; ikonklasser (▸ ○ ⚠), 8 px-piler og en SVG-etikett unntatt. `LABEL_MIN_PX`
  (13) står. Like brede sifre (`font-variant-numeric:tabular-nums`) i sidepanel, statuslinje, ctxbar, `#wip`, tabeller og
  de 15 visningsklassene som før var Plex Mono (areal, lengder, zoom-merke …).
- **Skjul-knapp:** `‹` øverst til høyre i `#sidebar` (`#sb-collapse`, `_sbToggleCollapse`); trykk → `body.sb-collapsed`,
  panelet er en 28 px stripe med `›` midt i, dra-håndtaket skjult; trykk igjen → bredden fra før (står urørt i
  `style.width`). Husket i `localStorage` (`varmeplan_sb_collapsed`, try/catch), aldri i prosjektet; panelet skjuler seg
  aldri av seg selv. `aria-label`/`title` «Skjul venstrepanel» / «Vis venstrepanel». Presentasjon og app-innebygging
  skjuler hele panelet som før (`display:none` vinner). Ingen ny hurtigtast.
- **Tegningen hopper ikke:** lerretet vokser mot venstre med Δ px, og `panX` flyttes Δ/2 (cm), så hvert skjermpunkt
  beholder sin verdenskoordinat — målt 0 cm avvik ved dpr 1 og 2, standard og 420 px panel, etter skjul og etter vis
  (`klikk.json`). `_savePrefs` lagrer bredden fra før (ikke 28) når panelet er lagt ned. Arbeidsflyt-panelet (som dekker
  sidepanelet) dokkes rett til høyre for stripa med bredden fra før, så `›` alltid er synlig.

## Målt (`docs/224/probe/`, HEAD-kopi mot arbeidskopi, headless Chrome 9333, server 4013, deviceScaleFactor 2)

### Etiketter på lerretet (`etiketter.mjs`)

Tekstbredder på samme side (Space Grotesk er fortsatt lastet for logoen), 11 px:

| Tekst | Space Grotesk | Inter | Inter bold vs SG bold |
|---|---|---|---|
| FlexFoil 60W B=60cm | 112,3 | 114,3 (+1,8 %) | 118,0 vs 113,0 (+4,4 %) |
| 400 cm | 39,8 | 40,0 | 41,4 vs 39,9 |
| TestKabel 10T 600W 60m | 132,2 | 134,2 (+1,5 %) | 139,3 vs 133,2 (+4,6 %) |
| 0 8 6 9 | 35,8 | 36,7 | 36,7 vs 35,7 |

Alle tekster tegnet på lerretet (fillText fanget) i fire utsnitt — oversikt, folie (rom 32), kabel (rom 31), matte (rom 35)
— er **identiske mengder før og etter** (70/73/73/73 tekster): ingen folie-, kabel- eller matteetikett mistet plassen
eller ble forkortet. Én etikett fikk dårligere plass: **hesteskotrappens CC-kjede over armen** (VK-trappa, skala 1,5 og 3):
tre «9»-tall får ikke plass hver for seg med Inters bredere sifre og står nå som ett «3 × 9» — malerens egen regel 2
(`_stairHsDrawArmChain`), som 186.x for fire trinn alt godtok. Test 186.2 er oppdatert til å godta begge former uten
utelatte tall (274/274).

### Klikk → verden (`klikk.mjs`, 217-fixturet, zoom 1,1)

| | lerret åpent → skjult → vist (px) | største avvik skjult / vist (cm) | panX åpent → skjult → vist |
|---|---|---|---|
| dsf 1, standardpanel | 1215 → 1372 → 1215 | 0 / 0 | 700 → 652,4 → 700 |
| dsf 1, 420 px panel | 975 → 1372 → 975 | 0 / 0 | 700 → 579,7 → 700 |
| dsf 2, standard / 420 | som dsf 1 | 0 / 0 | som dsf 1 |

Ekte klikk på klientpunktet der rom 32 sitt midtpunkt sto, treffer rom 32 (eller folien i rom 32, via klikk-syklusen)
før, under og etter.

### PDF (`pdf.mjs`, samme prosjekt, 7 sider)

| | Før | Etter |
|---|---|---|
| Rom 31 (kabel) `_renderRoomToImage` | 2126 × 1822, bbox 14,454–1671,1811 | identisk |
| Rom 32 (folie) | 2126 × 1822, bbox 14,347–1755,1811 | identisk |
| Plantegning | 2126 × 462, bbox 91,91–2034,370 | identisk |
| Hel PDF | 7 sider, 754 589 byte | 7 sider, 772 772 byte |

Rommene står nøyaktig likt; bare glyfene er Inter (`pdf-rom31/32-foer/etter.png`, `pdf-plan-*.png`). jsPDF-teksten
(Helvetica) er uberørt. +18 kB er PNG-ene med andre glyfer.

### Skjermbilder (`skjerm.mjs`, lyst tema, 1400 × 900 CSS-punkter → 2800 × 1800 px)

- `foer-dashbord.png` / `etter-dashbord.png` — dashbordet med fem falske prosjekter (uten innlogging).
- `foer-prosjekt.png` / `etter-prosjekt.png` — rom 31 (kabel + hindring) og 32 (folie + hindring, valgt), sidepanel,
  verktøylinje, ctxbar og statuslinje (statuslinja får nå plass på én linje).
- `etter-prosjekt-skjult.png` — samme med panelet lagt ned; `etter-prosjekt-skjult-arbeidsflyt.png` — arbeidsflyt-panelet
  dokket ved stripa; `etter-moerkt-skjult.png` — mørkt tema.
- `foer-utsnitt-2x.png` / `etter-utsnitt-2x.png` — 2× av folieetikettene og hindringsmålene i rom 32.

### Regresjonstester (`alle.mjs` + `sammenlign.js`)

| | Tester | Grønne | Deltester |
|---|---|---|---|
| HEAD (`15371c3`) | 93 | 86 | 4 305 |
| Nå | 94 | 87 | 4 329 |

Ny `_designRegressionTest224` 22/22 ved dsf 1 og 2 (Inter i UI/lerret, logo i Space Grotesk, ≥ 12 px lesetekst, ≥ 11 px
uppercase, Plex Mono i `.wbw-inp`, Inter lastet; skjul: 28 px, dra-håndtak skjult, lerret = CSS × dpr, klikk → verden
uendret, localStorage, presentasjon skjuler, vis: bredden tilbake, panX uten drift, egen bredde 400 → 28 → 400,
`_savePrefs` lagrer 400). `_stairHorseshoeRegressionTest` 274/274 etter oppdateringen av 186.2 (var 272/274 med Inter).
De sju røde er de samme som på HEAD uten innlogging (`_prosjektlaasRegressionTest` E, `_kundeforslagRegressionTest`
L/138, fem `_geo*RegressionTest(results)` som ikke kan kjøres alene). Rådata `alle-head.json`/`alle-etter.json`.

## Ikke rettet / funnet underveis

- **`_savePrefs` lagrer `sidebarWidth: 0`** når den kalles mens `#app` er skjult (offsetWidth 0) → 180 px ved neste
  lasting. Fantes på HEAD (så i headless-profilen etter testkjøringer); én linje å rette.
- **Rom-lista i sidepanelet:** arealet og ikonene overlapper ved 180–272 px panel, før og etter.
- **Tall på lerretet har proporsjonale sifre** (Canvas 2D kan ikke slå på `tnum`); gjelder trappetabellen og
  PDF-oversiktens materialliste. Spørsmål 3.
- **Port 4010** er fortsatt Python-serveren; 4013 brukt.
- `CANVAS_NUM_FONT` er flyttet til CONSTANTS (ved `BASE_SCALE`) — den gamle `const` ved kommentaren fra 18.09.2026 er
  erstattet av en henvisning, siden en `const` to ganger i samme skript er en syntaksfeil.
