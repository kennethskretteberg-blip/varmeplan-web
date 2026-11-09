# 216 · Dialoger — fast bunnlinje med knapper, bare innholdet scroller, aldri høyere enn vinduet — rapport

09.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.
(Nummeret 216 er brukt fra før av «Tak 216 adressefelt»; derfor ligger denne i `docs/216-dialoger/`, se SPØRSMÅL 1.)

## Kort

Kenneth 08.11.2026: «Det er ofte valgknappene blir borte i bunnen. Det har jeg sett på flere steder.»

- **Årsaken i Eksporter PDF (målt):** boksen var `height:80vh; overflow:hidden`, og inni den lå en topp på 57 px
  *pluss* en `.exp-split` som også var `height:80vh`. Delingen stakk dermed 57 px under boksen, og knappene som lå
  nederst i venstre kolonne var alltid kuttet — ved 1366×650 lå de på y = 1406–1460 i et vindu på 650 px, og
  heller ikke scrolling i kolonnen nådde dem (kolonnen selv var klippet).
- **Mønsteret som gikk igjen:** 15 andre dialoger hadde `max-height:85–94vh; overflow:auto` på selve boksen og
  knappene nederst i innholdet — de var nåbare bare ved scrolling (L-form rom, Snøsmelting, begge
  trappebyggerne, Tilbehør, Ny kunde, Excel-import, «Om rommet» m.fl.), og to hadde ingen `max-height` i det hele
  tatt (Kunde & prosjektinfo, Del presentasjon).
- **Rettingen, én gang og felles:** CSS-blokken «216 · FELLES DIALOGOPPSETT» med `.vp-modal` / `__head` / `__body` /
  `__foot` (+ `__body--split`). Boksen er en flex-kolonne med `max-height: calc(100dvh − 32px)` (`100vh` som
  reserve), topp og bunn `flex:0 0 auto`, innholdet `flex:1 1 auto; min-height:0; overflow-y:auto`. De ni faste
  dialogene i `#modal-ov` fikk samme oppsett via `.modal` (flex-kolonne) + ny `.modal-body` rundt feltene;
  `showModal` setter nå `display:''` i stedet for `'block'` så CSS-en bestemmer. Avstandene er kompensert
  (`.modal-body > :first-child{margin-top:0}`, `.modal-body > .modal-field:last-child{margin-bottom:0}`) — alle ni
  boksene målt til nøyaktig samme høyde som før ved 1440×900.
- **Eksporter PDF:** knappene flyttet ut av venstre kolonne til `.vp-modal__foot.exp-foot` under begge kolonnene;
  `.exp-split` er `flex:1; min-height:0` i stedet for 80vh, hver kolonne scroller for seg.
- **Resultat:** 26 dialoger åpnet i headless Chromium ved 1366×650, 1280×720, 1440×900 og 1024×600 — alle
  knapper i bunnlinja helt innenfor vinduet og klikkbare uten scrolling, innholdet kan rulles til bunns. Før:
  9 av dem kuttet ved 1366×650 (12 ved 1024×600). Ingen tekster, rekkefølge eller knappelogikk endret.
- **Regresjon:** ny `_dialogRegressionTest216` (206 sjekker, grønn ved 1366×650, 1024×600 og 1400×900, med og
  uten fixture). Alle regresjonstester: 88 tester på arbeidskopien (87 på HEAD + den nye), 206/206 i den nye, og de samme sju røde uten innlogging som på HEAD — ingen test endret resultat (`probe/alle-head.json` vs `probe/alle-etter.json`).

## Regelen (nå i CLAUDE.md)

1. Aldri høyere enn vinduet: `max-height: calc(100dvh − 32px)` (`100vh` som reserve). Ikke sett `max-height`/`overflow`
   inline på boksen — klassen gjør det.
2. Tre deler: topp (tittel + ×), innhold, bunn (knapper). Topp og bunn står fast; bare innholdet scroller.
3. Knappene i en egen bunnlinje over hele dialogens bredde — aldri inne i en kolonne som scroller.
4. Flere kolonner: hver kolonne scroller for seg inne i innholdsdelen (`.vp-modal__body--split`); bunnlinja under begge.
5. `min-height:0` på flex-barn som skal scrolle.

Ny dialog → bruk klassene og legg til en rad i `_DIALOG_TEST_216` (lista er manuell, som `_SHORTCUTS`).

## STEG 0 — kartleggingen

«Kuttes 1366×650 før» er **målt** i headless Chromium på HEAD-kopien der det står *målt*, ellers vurdert fra
markup (agentens gjennomgang av hele `index.html`). «ja (rull)» = knappene nås bare ved scrolling; «ja» = nås ikke.
Åpnes fra = funksjonen som bygger/viser dialogen.

| Dialog | Åpnes fra | Kuttes 1366×650 før | Endret |
|---|---|---|---|
| **Eksporter PDF** (`#export-dialog`) | `_showExportDialog` (verktøylinja) | **ja — alltid** (målt: knapper y 1406–1460) | `.vp-modal`; knappene til `.vp-modal__foot.exp-foot` under begge kolonner; `.exp-split` flex:1/min-height:0; kolonnene scroller hver for seg |
| Legg til rom (`#modal-room1`) | `backToRoomName`/sidepanel | nei (målt, 304 px) | `.modal` flex + `.modal-body` |
| Velg romform (`#modal-shape`) | `goToShapePicker` | nei (målt, 450 px) | samme |
| Lag hindring (`#modal-hindring`) | `showHindringModal` | nei (målt, 405 px) | samme |
| Rektangulært rom (`#modal-rect`) | `selShape('rect')`→`confirmShape` | nei (målt, 431 px) | samme |
| **L-form rom** (`#modal-lshape`) | `confirmShape` | **ja (rull)** (målt: 690 px innhold, 552 px boks) | samme — nå 618 px boks, feltene scroller, knappene står |
| Legg til etasje (`#modal-floor`) | `showAddFloorModal` | nei (målt) | samme |
| Sett målestokk (`#modal-bg-calib`) | bakgrunnskalibrering | nei (målt) | samme |
| Fast målestokk (`#modal-fixed-scale`) | `showFixedScaleModal` | nei (målt) | samme |
| Endre status (`#modal-batch-status`) | prosjektlista, flervalg | nei (målt, uten chips) | samme |
| Innstillinger (`.profile-card`) | `_openProfile` | ja (rull) — 1050 px innhold; ingen felles bunnlinje (tre seksjoner med hver sin knapp) | flex-kolonne, max-height mot vinduet, tittel fast, `.vp-modal__body` scroller (SPØRSMÅL 3) |
| **Importer produkter fra Excel** (`#excel-modal`) | `openExcelModal` (admin, superadmin) | **ja (rull)** (målt med 40 rader) | `.vp-modal`; knappene ut av `#excel-preview` til `#excel-foot` som vises/skjules sammen med forhåndsvisningen |
| **Snøsmelting – effektbehov** (`#snow-modal-bg`) | `_openSnowCalc` (dashbord) | **ja (rull)** (målt) | `.vp-modal`; lagre-raden i `__foot`, metode-noten under den |
| Frostsikring rør (`#frost-modal-bg`) | `_openFrostModule` | nei (målt, 583 px) | samme mønster |
| Be kunde om mål (`#_kunde-ov`) | `openKundeLinkModal` | nei (målt, 492 px) | `.vp-modal` + body/foot |
| Del presentasjon (`#_del-ov`) | `_presentShareModal` | nei (målt, 436 px) — men ingen max-height | `.vp-modal` + body/foot |
| Del med elektriker (`#_shr-ov`) | `_shrOpen` | nei (målt, 427 px uten treffliste) | `.vp-modal` + body/foot |
| Kunde & prosjektinfo (`#wf-kunde-modal`) | `_wfKundeModal` (sidepanel) | nei (målt, 454 px) — ingen max-height, klippes uten scroll når «Endre» er åpen på 600 px | `.vp-modal` + body/foot |
| Velg side(r) fra PDF (`#_pdf-page-picker-ov`) | `_pdfPagePickerShowModal` | ja (rull) ved mange sider (vurdert) | `.vp-modal` + body/foot — **ikke åpnet i nettleser** |
| Importer tegning (`#_pdf-import-ov`) | `_pdfImportShowModal` | ja (rull) (vurdert, ~670 px) | `.vp-modal` + body/foot — **ikke åpnet i nettleser** |
| Hva er vegger? (`#_ar-layer-ov`) | `_autoReadLayerDialog` | nei (vurdert) | `.vp-modal` + body/foot — **ikke åpnet i nettleser** |
| **Bygg/Rediger hesteskotrapp** (`#stair-modal-bg`) | `_showHsBuilder` | **ja (rull)** (målt) | `.vp-modal` + body/foot |
| **Bygg trapp / Rediger trinn** (`#stair-modal-bg`) | `_showStraightStairBuilder`, `showStairEditModal` | **ja (rull)** (målt; ok først ved 1440×900) | `.vp-modal` + body/foot |
| **Tilbehør** (`#modal-accessories`) | `showAccessoriesModal` (fra Eksporter PDF/Visma) | **ja (rull)** (målt) | `.vp-modal` + body/foot |
| **Ny kunde** (`#new-customer-popup-overlay`) | `_showNewCustomerPopup` | **ja (rull)** (målt) | `.vp-modal` + body/foot |
| Forslag til kundenumre (`#custno-suggest-overlay`) | `_custNoRenderSuggestions` | ja (rull) ved mange rader (vurdert) | `.cust-card.vp-modal` + body/foot — **ikke åpnet i nettleser** |
| Gi kunden tilgang / Inviter elektrobedriften (`#co-overlay`) | `_coOpen` | nei ved 1366×650, **ja ved 1024×600** (målt) | `.cust-card.vp-modal`; skjemaknappen i `#co-foot`, skjules sammen med skjemaet når resultatet vises |
| Kopier til Visma (`#visma-paste-overlay`) | `_showVismaPasteDialog` | usikker (vurdert ~520 px) | `.vp-modal` + body/foot — **ikke åpnet i nettleser** |
| Hent fra kart (`#_roof-ov`) | `_roofOpenDialog` (snø/tak) | nei (målt steg 1, 258 px) | `.vp-modal`; stegets knapper i egen `foot`-variabel → `__foot`, kreditt-linja under |
| Én matte gjennom N soner (`#mat-zone-panel`) | `_showMatZoneProposalPanel` | usikker (rull) (vurdert) | `.vp-modal` + body/foot — **ikke åpnet i nettleser** (SPØRSMÅL 5) |
| Del så matta går opp (`#mwb-panel`) | `showMatWholeBandPanel` | usikker (vurdert) | `.vp-modal` + body/foot — **ikke åpnet i nettleser** |
| **Om rommet** (kundelenke, `#_kunde-roomform`) | `_kundeRoomForm` | **ja (rull)** (målt) | `.vp-modal` + body/foot (bunnark) |
| Gi tilbakemelding (`.fb-card`) | `_openFeedback` | nei (~380 px) | bare `max-height` mot vinduet som reserve |
| Kundekort / Synk mot Visma / Eksporter fil til Visma (`.cust-card`) | `_openCustomerCard`, `_custNoRenderSyncReview`, `_gbao10OpenOverlay` | nei / usikker; knappene ikke nederst | `.cust-card` fikk flex-kolonne + max-height mot vinduet (reserve) |

**Ikke endret** (allerede riktig oppsett eller små bekreftelsesdialoger uten høydeproblem): Svar fra kunde
(`#kunde-rev-ov`), Kundedialog (`#_logg-ov`), Kundeforslag (`#fors-rev-ov`), Dokumentasjon (`#doc-panel`),
Versjonshistorikk (`.vh-panel`), `#doc-screen`/`#claim-screen` (`.doc-foot`), `#import-review-screen` (`.rv-foot`),
Tilbake til dashboard, Slett/Flytt prosjekt, Gi prosjektet et navn, Plasseringsregel brutt, Prosjektlås,
Modullås, Tapt-årsak, Visma-numre, Lukk kundelenke, Tolkemotor-feil, Velg trappedesign, Velg sonetype, Del i like
soner, Rommet har N matter, Rommet trenger flere matter, Fyll kilen, Automatisk plassering, Send til (forslag),
Hurtigtaster, Vis som, Velg kunde, Standard varmetype. Innebygde `confirm()`/`prompt()` (~137 steder) er
nettleserens egne og utenfor regelen (SPØRSMÅL 10).

## Målinger (headless Chromium, `docs/216-dialoger/probe/maal.mjs`)

Fire vindusstørrelser. Per dialog: boksens topp/bunn, hver knapp i bunnlinja (`getBoundingClientRect().bottom ≤
innerHeight` og `elementFromPoint` treffer knappen uten scrolling), og at innholdet kan rulles til bunns
(siste element i det rullende feltet synlig etter `scrollTop = ∞`). Eksporter PDF måles med 27 rom (7 fra
fixturen + 20 ekstra), så romlista er lang.

| Dialog | Før 1366×650 | Før 1024×600 | Etter (alle fire) |
|---|---|---|---|
| Eksporter PDF (27 rom) | knapper y 1406–1460 — **kuttet** | kuttet | inne, klikkbare; boks 65–585; romlista scroller til bunns |
| L-form rom | kuttet (boks 49–601, innhold 690) | kuttet | inne; boks 16–634 / 16–584 |
| Innstillinger | × inne; innhold 1050 px | — | boks 16–634, × fast, innholdet scroller |
| Excel-import (40 rader) | kuttet | kuttet | inne; boks 16–634 |
| Snøsmelting | kuttet | kuttet | inne; boks 16–634 |
| Frostsikring | inne | inne | inne |
| Be kunde om mål / Del presentasjon / Del med elektriker / Kunde & prosjektinfo | inne | inne | inne |
| Bygg hesteskotrapp | kuttet | kuttet | inne |
| Bygg trapp | kuttet (ok først ved 1440×900) | kuttet | inne |
| Tilbehør | kuttet | kuttet | inne |
| Ny kunde | kuttet | kuttet | inne |
| Gi kunden tilgang | inne | **kuttet** | inne |
| Hent fra kart (steg 1) | inne | inne | inne |
| Om rommet (kundelenke) | kuttet | kuttet | inne |
| De åtte andre faste `.modal`-dialogene | inne | inne | inne, samme bokshøyde som før (±0 px) |

Rådata: `probe/foer.json`, `probe/foer-b.json` (HEAD-kopi), `probe/etter.json`, `probe/etter-b.json`.

## Skjermbilder (1366×650)

- Eksporter PDF: `foer-eksporter-pdf.png` (knappene mangler, romlista kuttet) → `etter-eksporter-pdf.png`
  (bunnlinje med Avbryt / Generer PDF under begge kolonnene).
- L-form rom: `foer-lform-rom.png` → `etter-lform-rom.png`.
- Snøsmelting: `foer-snosmelting.png` → `etter-snosmelting.png`.
- Bygg trapp: `foer-bygg-trapp.png` → `etter-bygg-trapp.png`.
- Tilbehør: `foer-b-tilbehor.png` → `etter-b-tilbehor.png`.
- I tillegg `foer-*/etter-*` for alle de andre målte dialogene i samme mappe.

## Test og regresjon

- **Playwright finnes ikke på maskinen** (og repoet har «no npm»). Testen er derfor kjørt med Chrome DevTools
  Protocol mot headless Chromium på port 9333 (samme motor som Playwright driver), `probe/cdp.mjs` + `probe/maal.mjs`.
  Vindusstørrelsen settes med `Emulation.setDeviceMetricsOverride`. Se SPØRSMÅL 7.
- **Ny regresjonstest i appen:** `_dialogRegressionTest216` (rett etter `closeModal`). Åpner hver dialog i
  `_DIALOG_TEST_216` (Eksporter PDF, de ni faste, Innstillinger, Excel, Snø, Frost, Del presentasjon, Kunde &
  prosjektinfo, begge trappebyggerne, Ny kunde, Gi kunden tilgang) og sjekker: boksen har `max-height ≤ innerHeight`
  (regelen gjelder uansett vindusstørrelse), boksen ligger i vinduet, hver knapp i bunnlinja er innenfor vinduet og
  klikkbar uten scrolling, og ingen knapp ligger inne i et element som scroller. Pluss Eksporter PDF med 40
  midlertidige rom: romlista scroller, knappene står. 206 sjekker, grønn ved 1366×650, 1024×600 og 1400×900
  (`probe/kjor216.mjs`). Innloggings-/prosjektlisteskjermen skjules under testen og settes tilbake.
- **Alle regresjonstester** (`probe/alle.mjs`, HEAD-kopi i `probe/head/` på port 4000): HEAD = 87 tester, 7 røde
  uten innlogging (`_prosjektlaasRegressionTest` 66/67, `_kundeforslagRegressionTest` 270/271 og fem `_geo*` som
  kaster alene) — samme sju som i 198/221. Etter: se «Regresjon» i Kort.
- `probe/syntaks.mjs` kompilerer inline-skriptet (vm.Script) etter hver patch — 0 feil.

## Ikke testet i nettleser

Rettet fra koden med samme mønster, men ikke åpnet headless (krever innlogging, importmotor, kart eller
tilstand fixturen ikke har): Velg side(r) fra PDF, Importer tegning, Hva er vegger?, Forslag til kundenumre,
Kopier til Visma, Én matte gjennom N soner, Del så matta går opp. Hent fra kart er åpnet i steg 1 (adresse) —
steg 2 og 3 trenger karttjenesten. Excel-import er åpnet med simulert forhåndsvisning (40 rader). Se SPØRSMÅL 6.

## Filer

- `index.html`: CSS (`.modal`, `.modal-body`, `.vp-modal*`, `.exp-split/.exp-left/.exp-right/.exp-foot`,
  `.profile-card`, `.cust-card`, `.fb-card`), `showModal`, de ni faste dialogene, `_showExportDialog`, 24 JS-bygde
  dialoger, `_dialogRegressionTest216`.
- `CLAUDE.md`: ny seksjon «Dialoger (216) — felles modal-struktur». `docs/endringslogg.md`, `STATUS.md`.
- `docs/216-dialoger/`: denne rapporten, `SPØRSMÅL.md`, skjermbilder, `probe/` (skript, patch-filer, rådata;
  `probe/head/index.html` er HEAD-kopien for sammenligning og slettes før commit).
