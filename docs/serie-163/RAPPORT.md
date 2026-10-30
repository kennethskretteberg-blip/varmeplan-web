# Serie 163 — folietilbehøret i tilbehørsdialogen

## 163 · Dekket m² på plater og plastfolie, klemmer med tegnet + 15 %, Kapton Disc i hele ruller

Kenneth 30.10.2026: «Tilbehør: ønsker at det vises med liten skrift hvor mange kvadratmeter antallet
underlagsplater dekker, f.eks. 60 stk (43,2 m²). … Det samme gjelder for plastfolie. For tilkoblingsklemmer
ønsker jeg samme oppsett som for FlexFoil varmefolie … Kapton Disc selges nå kun som hel rull, så antallet må
enten være 0 eller 100 stk.»

Alt er målt uten innlogging på et **P0378-lignende** syntetisk prosjekt (ett rom 700 × 560 cm = 39,2 m² brutto,
10 foliebredder à 5,00 m × 50 cm = 25,0 m² folie), satt opp direkte i `S` med en testfolie i katalogen.
Harness: `/tmp/cdp163` (headless Chrome på 9333; `steg0.mjs` = dialog/PDF/Excel/Visma/GBAO10-målingen,
`pdfshot.mjs` = selve PDF-fila, `tests.mjs` = testbatteriet). Gammel kode (f522c83) servert fra
`/tmp/cdp163/old` på port 4011. Skjermbilder i `docs/serie-163/bilder/`.

### STEG 0 — slik var det (f522c83)

**0.1 Dialogen på P0378-rommet** (`163-dialog-foer.png`). Toppen av foliedelen: «10 strips · 25.0 m² folie ·
39.2 m² brutto».

| Rad | Forslag før | Liten skrift før | Utregning |
|---|---|---|---|
| Underlagsplater | 60 stk | ingen | 39,2 / 0,72 = 54,4 · 1,10 = 59,9 → 60 |
| Plastfolie over | 1 rull | ingen | 25,0 / 39 = 0,64 → 1 |
| Plastfolie under | 1 rull (uavhuket) | ingen | samme |
| Tilkoblingsklemmer | 20 stk | ingen | 10 bredder × 2 |
| Kapton Disc | 20 stk | ingen | 10 bredder × 2 — **ikke hel rull** |

`basisText` i `renderRow` havner som en `<br>`-linje i liten, dempet skrift rett under navnet (10 px,
`var(--dim)`). Bare kabel- og mattetilbehøret sendte den inn (`cableBasis`/`matBasis`); folieradene kalte
`renderRow(a, qty)` uten tekst. Skrev man 130 på Kapton og bekreftet, ble det lagret **130** (ingen avrunding,
ingen melding) — målt.

**0.2 Hvor `calc`-resultatet leses.** Tre steder, alle i `showAccessoriesModal`:

1. `foilAutoQtys[a.id] = _applyAccessoryCalc(a, foilCtx)` — forslaget («forslag: N») og `data-auto-qty`.
2. `renderRow`: `startVal = savedQty != null ? savedQty : autoQty` — **lagret tall vinner alltid** for
   tilbehør (125-regelen «lagret vinner til tegningen vokser» gjelder bare *folieradene* via `_foilOrderQtyM`;
   tilbehøret har ikke noen «tegningen vokste»-sjekk, det står i kommentaren der).
3. `readRow` ved bekreftelse: feltverdi, ellers `fallbackQty` = forslaget; `roundTo > 1` rundet opp til hele
   hundre (kabel-strips).

Eksportene (PDF `_accRenderGroup`, Excel «Bestilling» `_emit`, Visma `_vismaPasteBuild`, GBAO10
`_gbao10Build`) leser **bare** de lagrede radene (`S.project.accessories.items` → `_aggregateAccessoryItems`),
aldri `calc`. Et nytt forslag endrer altså aldri en lagret rad — bare dialogen viser det nye forslaget ved
siden av det lagrede tallet.

**0.3 Platemål og rullareal.** Navnet «Underlagsplate Gul 50T 6mm **60×120**» → 0,60 × 1,20 = **0,72 m²**,
samme tall som `calc` deler på. «Plastfolie 0,20mm **2,60×15m (39 m²)**» → 2,6 × 15 = **39 m²**, samme som
`calc`. Begge står nå som `coversM2PerUnit` på oppføringen, så tallet finnes ett sted per vare.

### Gjort

Alt i `index.html`, ingen endring i katalog/DB, foliemengde-oppsettet (125), kabeltilbehør eller RKK.

1. **Tre valgfrie felt på `FOIL_ACCESSORIES`-oppføringen** (kommentert over lista):
   `coversM2PerUnit` + `coversRef` ('gross' | 'foil'), `packSize`, og `basis(ctx, qty)` (samme konvensjon
   som kabeltilbehøret alt hadde).
   - underlagsplater: `coversM2PerUnit: 0.72, coversRef: 'gross'`
   - plast_over / plast_under: `coversM2PerUnit: 39, coversRef: 'foil'` (dekningen måles mot tegnet
     folieareal, som `calc` gjør — se spørsmål 3)
   - tilkoblingsklemmer: `overheadPct: 15`, `basis` → «Tegnet: 20 stk (2 pr foliebredde)»
   - kapton_disc: `packSize: 100` med kommentar «sett til 50 når 50-rullene kommer»
2. **Én formatter, `_accInfoText(acc, qty, ctx)`**, ved siden av `_applyAccessoryCalc`:
   «= 43,2 m² (brutto 39,2 m²)», «= 39,0 m² (folie 25,0 m²)», «= 1 rull à 100 (behov 20)», og
   «… — rundes opp til 200 stk» når tallet i feltet ikke er hel pakke. `renderRow` fikk en femte parameter
   `infoCtx`; bare folieradene sender `foilCtx`, så kabel/matte er urørt. Linja har `data-acc-info` og en
   `input`-lytter oppdaterer den **live** mens man skriver.
3. **Hele pakker:** `_accPackSize(acc)` / `_accRoundToPack(acc, qty)` — `packSize` og det gamle `roundTo`
   går samme vei (rund opp, 0 forblir 0). `_applyAccessoryCalc` = `_accRoundToPack(acc, _accNeedQty(acc, ctx))`,
   der `_accNeedQty` er behovet før pakking (calc × påslag, med 1e-9 mot flyttallsstøy — 40 × 1,15 =
   46,00000000000001 skal bli 46, ikke 47). `readRow` bruker samme `_accRoundToPack`; når tallet endres,
   vises en gul toast: «FlexFoil Kapton Disc endeforsegling: selges bare i hele ruller à 100 — 130 rundet opp
   til 200 stk».
4. **Eksportene:** `_accCoversSuffix(id, qty)` → « (43,2 m²)» for oppføringer med `coversM2PerUnit`, ellers
   tom. PDF-tilbehørslista: bak enheten (Antall «60», Enhet «stk (43,2 m²)» — 16,4 mm i en 20 mm-kolonne,
   målt med `getTextWidth`). Excel «Bestilling»: «60 stk (43,2 m²)» i Antall-cellen. Visma-lim, GBAO10 og
   Excel «Materialliste» urørt (tall, ikke tekst).

### Etter (målt, `steg0-etter.json`)

| Rad | Liten skrift | Forslag | Felt |
|---|---|---|---|
| Underlagsplater | = 43,2 m² (brutto 39,2 m²) | 60 | 60 |
| Plastfolie over | = 39,0 m² (folie 25,0 m²) | 1 | 1 |
| Plastfolie under | = 39,0 m² (folie 25,0 m²) | 1 | 1 |
| Tilkoblingsklemmer | Tegnet: 20 stk (2 pr foliebredde) | 23 | 23 |
| Kapton Disc | = 1 rull à 100 (behov 20) | 100 | 100 |

Kontrollert for hånd: 60 × 0,72 = 43,2; 1 × 39 = 39,0; 20 × 1,15 = 23,0 → 23; 20 → ⌈20/100⌉ × 100 = 100.

- **Live:** 70 i platefeltet → «= 50,4 m² (brutto 39,2 m²)» uten å forlate feltet. 130 på Kapton →
  «= 2 rull à 100 (behov 20) — rundes opp til 200 stk».
- **Bekreft** med 70 plater og 130 Kapton: lagret 70 / **200**, toast «… 130 rundet opp til 200 stk».
- **PDF** (`163-pdf-tilbehor-etter.png`): «60 | stk (43,2 m²)», «1 | rull (39,0 m²)», «23 | stk»,
  «100 | stk». **Excel Bestilling:** `70 stk (50,4 m²)`, `1 rull (39,0 m²)`, `23 stk`, `200 stk`.
- **Visma-lim / GBAO10:** CVA54206 70, CVA54212 1, CVA54124 23, CVA54214 200, CVA54211 2, CVA54213 1 —
  bare tall, Kapton i hel pakke.
- **Lagret rad fra før** (testet i regresjonstesten med Kapton 20 / plater 50 lagret): tallene står,
  Kapton-linja sier «… — rundes opp til 100 stk», platene «= 36,0 m² (brutto 38,0 m²)». **0 bredder → Kapton 0**
  (`_applyAccessoryCalc` gir 0; dialogen vises uansett ikke uten folie).

### Tester

`_accessoryFoilQtyRegressionTest`: **46 → 84 sjekker, grønn** (38 merket 163: regelen, info-tekstene,
selve dialogen i DOM med live-oppdatering og bekreftelse, lagret rad, Excel- og PDF-teksten, og **vaksinen**:
med `packSize` fjernet går 130 rett gjennom → sjekken ville blitt rød). `_pdfExportSmokeTest` 55/55,
`_foilRegressionTest` 9/9, `_pdfPreviewRegressionTest` 84/84, `_bgFloorRegressionTest` 31/31,
`_nyttProsjektRegressionTest` 25/25. Gammel kode (4011): tilbehørstesten 46/46, PDF 55/55 (`tests-foer.txt`).

Commit: «163: folietilbehør — dekket m² på plater og plastfolie (coversM2PerUnit), klemmer med tegnet + 15 %
forslag, Kapton Disc i hele ruller (packSize)». Ikke pushet.
