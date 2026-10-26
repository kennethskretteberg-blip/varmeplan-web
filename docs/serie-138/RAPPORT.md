# 138 · Venstrepanelet i to nivåer (romliste ↔ ett rom)

Commit: «138: presentasjon — venstrepanelet i to nivåer …». Alt i `index.html`. Ikke pushet.

## STEG 0 — målt (8 rom, PC 1400 × 900, panel 320 px, forslagslenke)

Før = `HEAD` (be7de4f) på port 4001, etter = arbeidskopien på port 4000. Samme skript (`/tmp/cdp138/steg0.mjs`).

| px | før | etter |
|---|---|---|
| `#_pp-prosjekt` | 78 | (kun nivå 1) 78 |
| `#_pp-romliste` | 397 | (kun nivå 1) 397 |
| `#_pp-maal` | 107 | (kun nivå 1) 107 |
| `#_pp-valgt`, kabelrom | 846 | 762 |
| `#_pp-valgt`, matterom | 783 | 647 |
| Kroppens synlige høyde | 828 | 719 (+ 109 px fast hode) |
| «Hva synes du?» ligger så langt ned fra toppen | **701 px** | **40 px** |
| Første knapp i kortet (bunn) | 831 px — utenfor synsfeltet (828) | kabel 170 px, matte 118 px |
| OK/Foreslå-knappene (bunn) | utenfor, må scrolles | kabel 647 px, matte 532 px — **innenfor 719, ingen scroll** |

Før: kunden måtte scrolle ca. 700 px før «Hva synes du?» var synlig, og bare ~125 px av kortet (selve overskriften) fikk plass uten scroll. Etter: hele kortet fra overskrift til OK/Foreslå-knappene står uten scroll i et 900 px-vindu, både for kabel- og matterom.

Mobil 375 × 812, skuff åpen, nivå 2: skuffhode 68 px + nav 65 px + kropp 438 px; kortet er 696 px ned til OK-knappene, så på mobil må det fortsatt scrolles litt (skuffen er maks 78 vh). «Hva synes du?» ligger likevel øverst i kroppen. Se spørsmål 138-1.

### Hvem leser `#_pp-valgt` / `#_pp-romliste` / `#_pp-maal`

| id | CSS | JS | tester |
|---|---|---|---|
| `_pp-valgt` | – | `_presentPanelKroppHtml` (tegner), `_presentPanelVelgRom` (leste den for scrollIntoView – fjernet) | L (3), K via `_presentRoomDetailHtml` |
| `_pp-romliste` | – | `_presentPanelKroppHtml` | L (2) |
| `_pp-maal` | – | `_presentPanelKroppHtml` | L (1), M (6) |
| `_pp-rom-<id>` | `.pp-rom` | `_presentPanelRomlisteHtml`, tegne-klikk (scrollIntoView fjernet) | L (5) |

### Åpningsnivå og ren presentasjon

- `_presentEnter` setter `presentRoomId = _presentForhaandsvalgtRom()` — lenka åpner dermed allerede i **nivå 2** (116/119). Ingen endring nødvendig utover å fjerne hint-teksten.
- Ren presentasjon (innlogget og `presentPublic` uten forslag) bruker samme kropp: samme hode, **alle** rader åpne i gammel rekkefølge, ingen «Hva synes du?», ingen `#_pp-send`.

## Hva som er gjort

- **Nivå 1** (`presentRoomId == null`): `#_pp-prosjekt` → `#_pp-romliste` → `#_pp-maal`. Rader 40 px (PC) / 44 px (mobil, målt 44).
- **Nivå 2**: fast hode `#_pp-nav` **utenfor** den scrollende `#_pp-kropp`: `← Alle rom`, romnavn med rommets farge, etasje · romtype, ✓/!-merke, `‹` `›` (dempet i endene). Kroppen: «Hva synes du?» → Areal/Produkt/Flateeffekt → `<details id="_pp-detaljer">` («Detaljer», lukket, åpen/lukket i `_ppDetaljerApen`) med installert effekt, c/c, kabellengde, spenning, motstand, toppgulv, gulvbanner. Rom uten varme: tomt-rom-kortet, så areal og toppgulv.
- Innledningssetningen («Si fra om rommet er greit …») vises bare for første rom kunden åpner (`_ppIntroRomId`).
- `← Alle rom` (`_presentPanelTilbake`): `presentRoomId = null`, ingen `fitAll`, lista scrolles til sist valgte rom som markeres (`.pp-rom.sist`) i 1,5 s. `‹ ›` og piltastene ← → (`_presentPanelNabo`; ikke i felt, ikke i målmodus, ikke med modal åpen). Ny rad i `_SHORTCUTS`.
- `scrollIntoView` i `_presentPanelVelgRom` og i tegne-klikket er fjernet; kroppen starter på 0 ved rombytte, og beholder plasseringen ellers.
- Hint-teksten «Trykk på et annet rom i tegningen …» er fjernet.
- Målmodus: `#_pp-maal` ligger **øverst** i kroppen på begge nivåer. Utenfor målmodus bor «Endre mål» i nivå 1; på nivå 2 er den skjult.
- Mobil: skuffhodet får `← Alle rom` når skuffen er åpen på nivå 2; nav-raden under viser «n av m», `‹ ›` og merke (navnet står i skuffhodet). Lukket skuff og målmodus-skuffen er uendret.
- `_presentRoomDetailHtml(room, utenNavn)` — panelet sender `true` (navnet står i hodet); det gamle kortet (`#present-detail`) beholder navnet. Innholdet i `_forslagKortHtml` og payloaden er uendret (bortsett fra den betingede innledningen).

### Funn underveis (rettet)

`_presentPanelRender` ga `scroll` til `_kundeMonterBar`, som setter `scrollTop` på **panelet** — som ikke scroller. Kroppens scroll ble dermed aldri bevart: i forrige utgave hoppet kroppen til toppen for hvert valg kunden tok (▲/▼ osv.) når kortet lå nederst. Nå settes `scrollTop` på `#_pp-kropp` etter montering.

## Tester

- `_kundeforslagRegressionTest`: **250/250** (25 nye 138-sjekker i K/L/M). Den krever produktkatalogen: kjørt med `await _loadProducts()` først — katalogen laster anonymt.
- `_kundelenkeRegressionTest`: **330/330**. `_pdfExportSmokeTest`: **20/20**.
- Oppdatert (ikke slettet): K «hjelpelinja står» → `checkIkke` (hintet er borte); L: lista leses på nivå 1, rommet på nivå 2, «plassen for Endre mål» flyttet til nivå 1, ✓-merket sjekkes både i hodet og i lista, åpen skuff sjekkes med `← Alle rom`; M: panelet startes på nivå 1 (der «Endre mål» bor) + ny sjekk av at den er skjult på nivå 2.
- Nye: nivå 1 har lista og ikke `#_pp-valgt`; nivå 2 motsatt; «Hva synes du?» står før «Installert effekt»; `scrollTop === 0`; nøkkeltall utenfor/resten inni `<details>`; «Detaljer» lukket med innhold i DOM; hodet utenfor kroppen; innledning bare for første rom; `›` på siste rom gjør ingenting; `‹ ›`; piltast ← bytter, piltast i felt gjør ikke; `← Alle rom` + sist valgte markert; mobil `← Alle rom` i skuffhodet; målmodus øverst på begge nivåer.
- Manuelt (CDP, `/tmp/cdp138`): kommentar skrevet i `#_fors-komm` beholder fokus; «Foreslå endring» → gult ! i hodet og lista; «OK som det er» → ✓; ren presentasjon innlogget (Artikkelnr vises) og `presentPublic` (Artikkelnr og «Hva synes du?» borte). **Ikke gjort:** sammenligning av `kundelenke_answer`-JSON mot før — payload-koden er ikke rørt og testene som bygger payload (M) er grønne, men jeg har ikke sendt en ekte lenke.

## Skjermbilder (`docs/serie-138/skjermbilder/`)

`pc-nivaa1`, `pc-nivaa2-kabel`, `pc-nivaa2-matte`, `pc-nivaa2-detaljer`, `pc-tilbake` (lista etter ← Alle rom), `pc-maalmodus-nivaa2`, `pc-ren`, `mob-skuff-nivaa2`, `mob-skuff-nivaa1`, `mob-maal-nivaa1`, `mob-maal-nivaa2`.
