# 160 · «Rett opp etter vegg» i høyreklikkmenyen

## STEG 0
**0.1 Dagens vei (før):** høyreklikk på plantegningen viste «Velg / flytt plantegning», «Sett målestokk på nytt»,
«Bytt plantegning», «Lås opp underlag», «Fjern bakgrunn» — ingen rett-opp. Veien var: høyreklikk → «Velg / flytt
plantegning» → ⋯ i toppbaren → «Rett opp etter vegg» (tre steg). Merk: høyreklikkmenyen er `_bgCtxMenuItems`
(≈ :71233), ikke `_bgCtxMore` (≈ :72314, som er ⋯ i den faste «Bakgrunn»-gruppen).

**0.2 Lås:** `startBgStraighten` og klikk-grenen `bg-straighten` leser aldri `bg.locked`, og `_ctxBg()` faller tilbake til
`_activeBgLayer()` når ingenting er valgt. Målt på testprosjekt (ett rom, bilde med vegg på 5,71°, låst, uvalgt):
valget starter flyten, hint vises, to klikk gir `bg.rotation` = 354,31° og rommet roteres likt (hjørne
(300,200) → (281,221)); `locked` forblir `true`. Ingen fiks nødvendig. Esc avbryter og skjuler hinten.

**0.3 Innganger til bakgrunnshandlinger**

| Inngang | Funksjon | Rett opp før | Rett opp nå |
|---|---|---|---|
| Høyreklikk på lerret (vanlig) | `_bgCtxMenuItems` | nei | **ja** |
| Høyreklikk, ikke kalibrert | `_bgCtxMenuItems` (grein) | nei | nei (urørt – må kalibreres først) |
| ⋯ i fast «Bakgrunn»-gruppe (uvalgt) | `_bgCtxMore` | nei | **ja** (se spørsmål) |
| ⋯ for valgt underlag | `_bgSelMore` | ja | ja (uendret) |
| Kart (`_bgIsGeo`) | alle tre | nei | nei |

## Endring
Ett kall til `startBgStraighten()` i to menyer, ruler-ikon, rett under «Sett målestokk på nytt». I
`_bgCtxMenuItems` med `_bgIsGeo`-vakt. Ingen kopi av logikk, `_finishBgStraighten` urørt.
Test: tre sjekker i `_planRegressionTest` (F-blokken, «160:»).

## Verifisert (headless Chrome, /tmp/cdp160)
- Høyreklikk uvalgt+låst: valget står der (`meny-etter.png`), hint «første» vises (`hint.png`), Esc avbryter, to klikk retter.
- ⋯ valgt: som før. Kart: ingen av menyene har valget.
- `_planRegressionTest`, `_pdfExportSmokeTest`, `_geoRegressionTest`, `_pdfPreviewRegressionTest`: grønne.
