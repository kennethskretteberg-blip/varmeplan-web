# 219 · Hindring — enklere meny: Vegg til vegg, Polygon og Mål B×H — rapport

09.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.
(Nummeret 219 er brukt fra før av «Tak 219 3D fase 0», `docs/219/`; derfor ligger denne i `docs/219-hindring/`,
samme løsning som 217 og 218, se SPØRSMÅL 1.)

## Kort

Kenneth 09.11.2026: «Vi trenger ikke så mange valg her. Ta bort alle navnene. Vi trenger å kunne velge følgende:
1: Vegg til vegg, 2: Polygon, 3: Mål B×H. … felt for navn på hindring kan være fortsatt.»

Menyen `#modal-hindring` («Lag hindring — velg type») heter nå **«Sett inn hindring»** og har:

- **Navn (valgfritt)** — samme felt som før (`#hindring-name-inp`), gjelder alle tre måtene.
- **Vegg til vegg** — stor knapp i full bredde, starter `hindring-w2w` som før (med 218: start og stopp kan være
  på samme vegg).
- **Polygon** — stor knapp i full bredde, starter `hindring-polygon` som før.
- **Mål** — `B [__] cm  H [__] cm` og én knapp **Sett inn**. Knappen (eller Enter i et av feltene) setter inn et
  rektangel B×H midt i rommet (eller i sonen, når menyen ble åpnet derfra — 011), som før.
- Bunnlinja har bare **Avbryt** (216-strukturen: `.modal` / `.modal-body` / `.modal-footer` er uendret).

Tegneverktøyene selv er ikke rørt — bare menyen, og hva som skrives i `label`.

## STEG 0 — det som sto i menyen, og hva navnene brukes til

**Valgene som er fjernet fra menyen** (kortruta `#hindring-grid`, bygget fra `HINDRING_TYPES`):

| id | Navn i menyen | Ikon |
|---|---|---|
| `kjokkenoy` | Kjøkkenøy | 🍳 |
| `skap` | Innebygd skap | (dør-ikon) |
| `pipe` | Pipe | 🏭 |
| `vegg` | Vegg / søyle | 🧱 |
| `annet` | Annet (forhåndsvalgt) | ⬛ |

I snø-/utendørsmodulen sto bare ett kort, «Hindring» (`HINDRING_TYPES_SNOW`). Menyen er nå lik i begge moduler.

I tillegg er disse knappene borte fra bunnlinja: «⬡ Tegn polygon →», «⤬ Vegg-til-vegg →» og «Legg til →».
Det **fjerde** valget som lå skjult i «Legg til →» — tomme målfelt startet et rektangel-*tegneverktøy*
(`drawMode:'hindring'`, dra opp et rektangel) — er ikke lenger nåbart fra menyen (SPØRSMÅL 2). Koden for
verktøyet står igjen urørt.

**Hva typen og navnet brukes til (målt med grep over hele `index.html`):**

- `h.type` styrer **ingenting** i utregningen. Ingen av kabel-, folie- eller mattemotorene leser `type` på en
  hindring (det finnes ikke ett `h.type ===`-oppslag utenfor takmodulen, som er noe annet). Avstandskravet mot
  hindringen (`clearance`, 25 mm eller ingen) er en egen egenskap som settes via høyreklikk — typebaserte
  standardvalg ble fjernet bevisst tidligere (kommentaren over `HINDRING_TYPES`). Ingenting å stoppe for.
- `h.label` (navnet) vises på **tegningen** (`drawHindrings`, to steder), i **PDF-ens** romoversikt (punktliste
  «• navn»), i **objektpanelet** til venstre (tittel), i **advarselen** om for liten avstand til hindring
  (`hindringLabel`), og 217-målene **viker for navnet** i tyngdepunktet (`_hindDimLayout`). Ikke i materiallista.
- Før 219 ble `label` satt til `navnefeltet || typens navn` — en hindring uten navn het «Annet».

## Datamodellen

Uendret: `{id, type, label, roomId, floorId, points, clearance}`. `type` er alltid `'annet'` for nye hindringer
(`S.ui.hindringType` settes fortsatt i `showHindringModal`), `label` er **det brukeren skrev**, og tomt felt gir
`label: ''`. Gamle prosjekter med `kjokkenoy`/`skap`/`pipe`/`vegg` og navn leses og vises som før.

Ny hjelper `_hindDisplayName(h)` (rett etter `HINDRING_TYPES_SNOW`): `label` når det er en streng (også tom),
ellers `type` (hindringer fra før 070-fiksen uten `label` viser typen, som før). Alle seks visningsstedene går
gjennom den:

- tegningen: ingen tekst når navnet er tomt (før: `h.label||h.type||'Hindring'` → ville gitt «annet»);
- 217-målene: ingen navnefelt å vike for når navnet er tomt (`lab = null`);
- PDF-lista, objektpanelet og avstandsadvarselen: reserveordet **«Hindring»** når navnet er tomt (SPØRSMÅL 3).

## Målvalidering

`_hindDimsRead()`: begge feltene må være et tall > 0. Tomt, 0, minus eller bokstaver → feltet får klassen `err`
(rød ramme, også med fokus), det første ugyldige får fokus, ingenting settes inn og menyen står. Markeringen
forsvinner når brukeren skriver (`oninput`). `pushUndo()` kalles først når målene er gyldige (før lå det foran
valideringen, så «Legg til» med tomme felt la et tomt undo-trinn).

Enter i B- eller H-feltet kaller `confirmHindring()` direkte (og stopper boblingen, så dialogens felles
Enter-håndterer ikke også klikker en fokusert knapp).

## Test

Alt kjørt i headless Chrome (1366×650) mot `localhost:4000`, harness i `docs/219-hindring/probe/`
(`meny.mjs` skjermbilder/mål av menyen, `tegn.mjs` de tre tegnemåtene + gammelt prosjekt, `t219.mjs` testene,
`alle.mjs` + `sammenlign.js` hele suiten mot HEAD-kopien `probe/head-index.html`).

| Krav fra prompten | Resultat |
|---|---|
| Menyen: navnefelt + tre valg, to store knapper | ✅ Begge store knappene 422 px = hele innholdsbredden; `kort: []` |
| «Pipe» + vegg til vegg → navnet | ✅ `label: "Pipe"`, 0,24 m², fire klikk fra samme vegg (218), ingen alert |
| Tomt felt → ingen navn | ✅ `label: ""`; ingen `fillText` med «annet», «undefined» eller tom streng |
| Polygon: femkant | ✅ 5 punkter, `drawMode` tilbake til null |
| Mål 60 og 40 → 60 × 40 midt i rommet, knapp og Enter | ✅ 170..230 × 130..170 i rom 400 × 300; Enter gir det samme |
| Tomt / 0 / minus / bokstaver → ingenting, feltet markeres | ✅ Bare det ugyldige feltet får `err`, fokus flyttes dit, menyen står |
| Gammelt prosjekt med navngitte hindringer | ✅ Kjøkkenøy, Pipe, Innebygd skap tegnes som før (`etter-gammelt-prosjekt.png`) |
| PDF | ✅ på kodenivå: romoversikten går gjennom `_hindDisplayName(h) \|\| 'Hindring'`; PDF-tegningen bruker samme `drawHindrings`. Ikke åpnet som fil (SPØRSMÅL 4) |
| 1366×650 (216) | ✅ Boksen 81..569 av 650, alle knapper innenfor og klikkbare; `_dialogRegressionTest216` 197/197 |
| Regresjon | `_hindMenuRegressionTest219` **23/23** (ny), `_hindW2WRegressionTest218` 22/22, hele suiten: se under |

**Skjermbilder** (i `docs/219-hindring/`):

- `foer-meny-1366x650.png` — menyen på HEAD: fem typekort, fire knapper i bunnlinja, boksen 19..632 av 650.
- `etter-meny-1366x650.png` — menyen nå.
- `etter-meny-feil-1366x650.png` — «Sett inn» med B = 0 og tomt H: begge feltene røde, menyen står.
- `etter-tegning-tre-maater.png` — Pipe (vegg til vegg, med navn), femkant (polygon, uten navn) og 60 × 40
  (Mål, uten navn) i samme rom.
- `etter-gammelt-prosjekt.png` — hindringer lagret før 219 med typenavn som label.

**Hele regresjonssettet** (`alle.mjs`, HEAD-kopi mot arbeidskopi): se `probe/sammenligning.txt`.

| | HEAD | Nå |
|---|---|---|
| Tester | 90 (83 grønne) | 91 (84 grønne) |
| Deltester | 4236 | 4250 |

- 89 tester like med HEAD, én ny (`_hindMenuRegressionTest219` 23/23).
- Én ulik: `_dialogRegressionTest216` 206/206 → **197/197** — fortsatt helt grønn; ni færre deltester fordi
  bunnlinja i `#modal-hindring` gikk fra fire knapper til én (testen sjekker hver knapp for «innenfor vinduet»
  og «klikkbar» ved hver vindusstørrelse).
- De sju røde er de samme som på HEAD og trenger innlogging/karttjeneste (`_prosjektlaasRegressionTest` 66/67,
  `_kundeforslagRegressionTest` 270/271, fem `_geo*`-tester som kaster når de kjøres alene) — se
  memory «regresjon-alle-tester-mot-head».

## Filer

- `index.html`: modal-HTML (`#modal-hindring`), CSS (`.hind-way-btn`, `.hind-dims-row`, `.modal-inp.err`),
  `_hindDisplayName`, `showHindringModal`, `_hindDimsRead`, `confirmHindring` (uten fritegnings-grenen),
  `createHindringFromPolygon`, de to vegg-til-vegg-opprettelsene, rektangel-verktøyets opprettelse, seks
  visningssteder, `_hindMenuRegressionTest219`. `selHindring` er fjernet (ingen kort å velge).
- `docs/219-hindring/` — denne rapporten, SPØRSMÅL.md, skjermbilder, `probe/`.
- `docs/endringslogg.md`, `STATUS.md`.
