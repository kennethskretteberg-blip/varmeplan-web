# 225 · Flater, farger og ryddigere verktøylinje — rapport

**Dato:** 09.11.2026 · **Gren:** `design/varmeplan-stil` (worktree `~/Code/varmeplan-web-design`), committet, ikke pushet ·
**Commit:** `ca4731c` · **Løp:** serie-223-design, prompt 4 av 4, kun design.

## Kort

Lyst tema etter Flow Busbars `tokens.css`-oppskrift (kjølig lys grå app-bakgrunn, hvite paneler som kort med 1 px kant,
tekstfarger med god kontrast, statusfarger med Varmeplans semantikk), men **Varmeplans turkise aksent `#0891b2` står**.
Verktøylinja har samme knapper i samme rekkefølge med samme tekst, men 32 px høye, 13 px tekst, kvadratiske ikonknapper,
skillelinjer mellom gruppene og valgt knapp fylt turkis. Mørkt tema virker og er lesbart (ikke finpusset). PDF-en er
bit-identisk med etter 226. Alle regresjonstester er like grønne som på HEAD; én test (`_takRegressionTest220`) fikk
probepunktene flyttet av en rutenettlinje (se «Funn»).

## Tokens før/etter

### Lyst tema (`body.light-theme`, `index.html` linje 57)

| Token | Før | Etter | Merknad |
|---|---|---|---|
| `--bg` | `#f0f4f8` | `#f5f7fa` | Flows app-bakgrunn |
| `--surface` | `#ffffff` | `#ffffff` | kort/paneler |
| `--surface2` | `#eaecf1` | `#f2f4f7` | knappeflate, hover |
| `--border` | `#c8cdd8` | `#e3e8ef` | Flows kant |
| `--border-strong` | — | `#cbd3e0` | **ny**: skillelinjer som skal synes |
| `--text` | `#12151c` | `#0f1729` | Flows tekst |
| `--muted` | `#4a5266` | `#45506b` | |
| `--dim` | `#8890a4` | `#5d6c87` | **løftet** 3,2 → 5,3:1 (Flows `#62718c` ga 4,47:1 på knappeflaten) |
| `--accent` | `#0891b2` | `#0891b2` | **uendret — Varmeplans turkis** |
| `--accent2` | `#1a6fcc` | `#1a6fcc` | |
| `--on-accent` | — | `#ffffff` | **ny**: tekst oppå aksenten |
| `--accent-soft` | — | `#e6f5f9` | **ny**: svak aksentflate (hover, valgt rad) |
| `--warn` | `#d05820` | `#9a6b08` | Flows rav (4,7:1); semantikk «mangler/venter» står |
| `--warn-soft` | — | `#fbf2de` | ny |
| `--success` | `#16a34a` | `#1e7a4d` | Flows grønn (5,3:1 mot 3,3) |
| `--success-soft` | — | `#e7f4ee` | ny |
| `--danger` | `#dc2626` | `#c2341f` | Flows rød (5,5:1) |
| `--danger-soft` | — | `#fdece9` | ny |
| `--info` | `#2563eb` | `#2563eb` | |
| `--info-soft` | — | `#e8effb` | ny |
| `--shadow-sm` | — | `0 1px 2px rgba(15,23,41,.06)` | ny: kort |
| `--shadow-md` | — | `0 1px 2px rgba(15,23,41,.06), 0 8px 24px -16px rgba(15,23,41,.24)` | ny: flytende paneler |
| `--canvas-bg`, `--grid-*`, `--modal-*` | | | uendret fra 223 |

### Mørkt tema (`:root`, linje 23–47) — bare det som trengs for at det virker

| Token | Før | Etter |
|---|---|---|
| `--dim` | `#555d6e` | `#7b849a` (2,8 → 4,9:1) |
| `--border-strong` | — | `#353a46` |
| `--on-accent` | — | `#0d0e10` (mørk tekst på cyan, 12,6:1) |
| `--accent-soft` / `--*-soft` | — | aksent/status med 12–14 % alfa |
| `--shadow-sm` / `--shadow-md` | — | `0 1px 2px rgba(0,0,0,.35)` / `0 4px 20px rgba(0,0,0,.45)` |
| alt annet | | uendret |

### Alias-tokens (linje 50–52, på `body`)

`--fg`, `--panel`, `--hover`, `--brd` var brukt 53 steder i CSS-en og 118 i HTML-maler **uten å være definert** (falt bort —
elementene arvet farge eller ble gjennomsiktige, bl.a. prosjektnavnene i dashbordet og dokumentasjonspanelets kanter). Nå
alias til `--text`/`--surface`/`--surface2`/`--border`. ⚠ De **må** stå på `body`, ikke `:root`: `var()` løses der
variabelen defineres, og `body.light-theme` setter `--text` på `body` — i `:root` ble `--fg` alltid den mørke teksten
(verktøylinja ble svart i lyst tema, første forsøk). Toppstripa har egne `--tb-bg/--tb-fg/--tb-line` (alias til
`--surface/--text/--border`).

## Kontrast (WCAG, lyst tema, etter — tallene i `docs/225/probe/kontrast-etter.json`)

| Par | Før | Etter |
|---|---|---|
| `--text` på `--surface` | 18,3 | **17,9** |
| `--muted` på `--surface` / `--bg` / `--surface2` | 7,8 / 7,1 / 6,6 | **8,0 / 7,5 / 7,3** |
| `--dim` på `--surface` / `--bg` / `--surface2` / lerret | 3,2 / 2,9 / 2,7 / 3,1 | **5,3 / 4,9 / 4,8 / 5,2** |
| `--warn` på `--surface` | 4,1 | **4,7** |
| `--success` på `--surface` | 3,3 | **5,3** |
| `--danger` på `--surface` | 4,8 | **5,5** |
| `--info` på `--surface` | 5,2 | 5,2 |
| `--accent` på `--surface` (som tekst) | 3,7 | 3,7 (uendret aksent) |
| `--on-accent` (hvit) på `--accent` | — | **3,7** — godkjent for UI-komponenter/stor tekst, under 4,5 for liten tekst (spørsmål 1) |

Alle tekstfarger (`--text`, `--muted`, `--dim`) og statusfargene er ≥ 4,5:1 på hvitt, på `--bg` og på `--surface2`.
Mørkt tema etter: `--dim` 4,9 / 5,2 / 4,5 på surface / bg / surface2 (før 2,8 / 2,9 / 2,6).

## Flater (CSS linje ≈ 640–700)

- `#content`: bakgrunn `--bg`, 6 px luft. `#sidebar` og `#canvas-wrap`: 1 px `--border`, 8 px radius, `--shadow-sm` (Flows
  `.ws-panel`). Sidepanelets dra-håndtak er en 5 px stripe uten egen kantlinje. Lagt ned panel (224) = 28 px kort.
- **Presentasjon, kundelenke og innebygd modus** (`body.present-mode/.kunde-maal/.app-embed`) har hele flaten uten luft og
  ramme, som før. `@media print` nuller kant/radius/skygge.
- Tegneflaten blir 14 px smalere og 14 px lavere i appen. Ingenting flyttes i verden (klikk → verden leser rektangelet;
  `_designRegressionTest225` sjekker 0 cm avvik).
- Flytende paneler/menyer (`#ctxbar`, `#wbw-panel`, `#draw-dim-panel`, `#bg-panel`, `#draw-toolbar`, `#wip`, `#ctx-menu`,
  `#produkt-menu`, `#gap-panel`, `#label-color-panel`, brukermeny, statusmeny, transform-chips, m.fl.): hvite (`--surface`),
  `--shadow-md`, 8 px radius (var 10 og egne `rgba(0,0,0,…)`-skygger). `#zoom-badge`: `--shadow-sm`.
- 35 hardkodede farger i CSS-blokken byttet til tokens: `color:#0d0e10` på aksent → `--on-accent` (10), cyan-tinter
  `rgba(34,211,238,…)` → `--accent-soft` (12: sb-icon-btn:hover, wbw-chip:hover, dir-btn, floor-hdr-active, wip-move-btn.act,
  shape-card.sel, lv-card.sel, ctx-item.sel, pf-msg.ok, auth-success, adm-nav-item.active, fb-type.active), `.wbw-act.ok/.cancel`
  → success/danger, skygger på flytende kort (13). **≈ 160 distinkte hardkodede farger står igjen** (dialoger, dashbord-merker,
  dokumentasjonsmodulen) — bare det åpenbart trygge er byttet.
- `<meta name="theme-color">` lyst → `#f5f7fa`.

## Verktøylinja (`#topbar`, CSS linje ≈ 527–560)

Samme knapper, samme rekkefølge, samme tekst og hurtigtaster. Høyden 56 px står.

| | Før | Etter |
|---|---|---|
| Knappehøyde | 44 px | **32 px** |
| Tekst | 12 px | **13 px** |
| Ikonknapper (+/−/⊡, fil) | 44 × 44 | **32 × 32** (kvadratiske) |
| Radius | 10/8 px | 6 px |
| Skillelinjer `.tc-sep` | 1 px `--border` 18 px høy | 1 px `--border-strong` 22 px høy, 5 px luft |
| Valgt (`.snap-chip.on`, `.tool-chip.act`) | kantlinje + svak cyan-flate | **fylt `--accent`, tekst `--on-accent`, 600** |
| Hover | lysere kant | `--border-strong` + `--text` |
| Rulling begynner under | **1306 px** | **1292 px** |
| Ved 1280 px skjult | 26 px av «+» | 12 px av «+» |

Ingenting som var synlig ved 1280 px før er borte etter (alle knapper står; «+»-knappens ytterste del er utenfor i begge).
Målt med `docs/225/probe/topbar.mjs` (`topbar-foer/etter.json`). Fylt valgt-tilstand gjelder alle chips i appen (ctxbar,
sidepanel, dialoger), ikke bare verktøylinja (spørsmål 2). `.tb-mod-btn.active` (modulknappene) bruker `--accent-soft`,
`.tc-chip.active` fylt aksent.

De to **«Flytt»-knappene** (`✥ Flytt` = Marker ↔ Hånd, `↔ Flytt` = Flytt ↔ Roter) er **ikke** døpt om — beskrevet i
`docs/225/SPØRSMÅL.md`. `#chip-transform` hadde klassen `active` i JS uten CSS før; nå ser den ut som valgt når Roter er på.

## Mørkeblå toppstripe (valgfritt, 3 linjer)

Oppskriften står som kommentar «225 · TOPPSTRIPE» i `index.html` linje 58–63. Legg inn disse tre CSS-linjene (etter
`body.light-theme{…}`), ingenting annet:

```css
body.light-theme{--tb-bg:#0f365a;--tb-fg:#ffffff;--tb-line:#0f365a}
body.light-theme #topbar{--surface2:rgba(255,255,255,.1);--border:rgba(255,255,255,.22);--border-strong:rgba(255,255,255,.3);--muted:rgba(255,255,255,.85);--text:#fff;--dim:rgba(255,255,255,.7)}
body.light-theme #topbar .tb-logo{color:#fff}
```

Bevist med `docs/225/probe/morkeblaa.mjs` → `variant-morkeblaa-toppstripe.png` og `variant-morkeblaa-verktoylinje-2x.png`.
Knappene leser `--surface2/--border/--muted/--text/--dim`, så de settes om inne i `#topbar`; aksenten og resten av appen er urørt.

## Kontroll

1. **Regresjon** (`docs/225/probe/alle.mjs`, alle `_…RegressionTest` i egen fane): HEAD 94 tester / 87 grønne / 4327 deltester;
   nå 95 / 88 / 4354 — de sju røde er de samme som på HEAD og i 223/224 (`_prosjektlaasRegressionTest` E og
   `_kundeforslagRegressionTest` L/138 krever innlogging, fem `_geo*` kaster uten karttjeneste). Ny `_designRegressionTest225`
   27/27 (tokens, alias på `body`, kontrast ≥ 4,5 for tekst/muted/dim og statusfarger, kort-kant/radius/skygge,
   presentasjonsmodus uten ramme, verktøylinjas høyder/størrelser/kvadratiske ikoner/fylt valgt, klikk → verden 0 cm,
   lyst↔mørkt gjenopprettes). `_canvasRegressionTest223` 24/24 og `_designRegressionTest224` 22/22 ved dsf 1 og 2.
2. **PDF uendret mot 226**: SHA-256 for rom 31, rom 32 og plantegningen (PNG) og hele 7-siders PDF-en identiske før/etter
   (`docs/225/probe/pdf-foer/etter.json`), også med mørkt tema på skjermen (PDF-veien tvinger lyst tema; CSS-tokens lekker ikke).
3. **Skjermbilder** før/etter, lyst + mørkt, i `docs/225/`: `foer-/etter-dashbord(-moerkt)`, `-prosjekt(-moerkt)` (fire rom
   med folie, kabel og hindring), `-tak(-moerkt)` (3D-filmens bygg), `-pdf-forhaandsvisning(-moerkt)`, `-verktoylinje-2x`
   (0–700 px, 2×) og `-verktoylinje-1280`.
4. **Kontrast** med tall: over, og `docs/225/probe/kontrast-foer/etter.json` (`kontrast.mjs` leser tokens fra den kjørende sida).

## Funn (ikke rettet, eller rettet i test)

- **`_takRegressionTest220` gikk 43/44 etter 225 — en skjør probe, ikke en tegnefeil.** Testen leser én piksel 6 px innenfor
  takfoten for å se om glorien (valgt møne → koblede takfoter) lyser. Rutenettet tegnes **over** takflaten (før og etter 223),
  og probepunktet for k8 lå på verdens-y 450 — en 50 cm-linje. Med lerretet 14 px mindre havnet den linja på en hel piksel
  akkurat i proberaden, og pikselen ble rutenettfarge. Bevist ved å kjøre HEAD-kopien med 14 px mindre vindu (43/44) og
  arbeidskopien med 14 px større (44/44); lerretsbildene `docs/225/probe/t220-lerret(-head).png` viser glorien i begge.
  Rettet ved å flytte de fem probepunktene 25 cm langs kanten (unna både 10- og 50 cm-linjer) — `index.html` linje ≈ 90117.
  Nå 44/44 ved 1400×900, 1386×886 og dsf 2. At rutenettet ligger over takflaten er et eget (eldre) designspørsmål.
- **≈ 160 hardkodede farger** i CSS-en er ikke byttet (dialoger, dashbord-merker, dokumentasjon/portal, admin). De følger ikke tema.
- **Valgt knapp: hvit på turkis er 3,7:1.** Alternativer i SPØRSMÅL.md (mørk tekst 4,9:1 eller fyll `#0e7490` 5,4:1); én linje.
- Mørkt tema er bare justert der det trengtes (`--dim`, nye tokens); kort-kantene i mørkt er `#252830` på `#0d0e10` (lavkontrast, som før).
- **Port 4010** er fortsatt den gamle Python-serveren (pid 81926, 404 på alt); løpet brukte 4013 (pid 97427). Begge kan drepes.

## Filer

- `index.html` — eneste kildeendring (CSS-blokken, `_designRegressionTest225`, probepunktene i `_takRegressionTest220`).
- `docs/225/RAPPORT.md`, `docs/225/SPØRSMÅL.md`, skjermbilder, `docs/225/probe/*` (CDP-klient, skjerm, verktøylinje,
  kontrast, PDF, mørkeblå variant, t220-probe, regresjonskjøringer `alle-head/etter.json|log`).
- `docs/endringslogg.md`, `STATUS.md`, og `TIL-KENNETH.md` i løpsmappa.
