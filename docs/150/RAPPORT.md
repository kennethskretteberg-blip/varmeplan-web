# 150 · Frihånds-matte: korteste bredde er ett kuttraster

Kenneth 27.10.2026: en ny bredde kunne ikke legges kortere enn ca. 1 m. Skal være ett raster (2 × CC, 24 cm på 100T/60T, 16 cm på 150T).

## STEG 0 (målt på 7515620, rom 600×400, første bredde 240 cm, så drag rett «opp» d cm fra endepunktet)

`_matFreeCandidate(...).len`:

| Drag d (cm) | 1 | 5 | 10 | 12 | 15 | 20 | 24 | 34 | 40 | 70 | 99 | 100 | 110 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Før** 100T / 60T | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 120 |
| **Før** 150T | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 112 |
| **Etter** 100T / 60T | 0 | 0 | 0 | 24 | 24 | 24 | 24 | 24 | 48 | 72 | 96 | 96 | 120 |
| **Etter** 150T | 0 | 0 | 16 | 16 | 16 | 16 | 32 | 32 | 48 | 64 | 96 | 96 | 112 |

(Etter 150T, d=5 → 0 og d=10 → 16: terskel er 8 cm.)

1. **Hva avviste:** `_matFreeCandidate`, blokken «FEIL 2 / Regel 24» (`if (move.len < minLenCm) move.len = 0`, `minLenCm = mat_min_length_mm/10 = 100`). Rastret ga 96 for et drag på 99–100 cm, så alt under 110 ble avvist — også 34/40/70. Samme for 150T og 60T.
2. **Tilgivende avslutning:** klikk-handleren (`mousedown`, mat-freehand) leser `moves.length >= 1 && m.len <= 0` → `_matFreeExit(true)`. Før: klikk 1, 5, 10 og 20 cm fra endepunktet ga alle len 0 → avsluttet. Etter (100T): 1, 5, 10 → avsluttet; 20 cm → 24 cm bredde.
3. **Katalogvalget** (`_matFreeCatalog`, `tooShort = segments.length === 0`) er urørt: ingen rull ≤ tegnet lengde → `tooShort` (toast/panel som før).

## Endring

- `_matFreeForgiveCm(mp)` = `RASTER / 2` — én navngitt terskel (12 cm for 100T/60T, 8 cm for 150T).
- Minstelengde-sjekken per bredde er fjernet; erstattet av `raw < _matFreeForgiveCm(mp)` → `len = 0`. Fra et halvt raster og opp er len alt rundet til nærmeste raster (minst ett). Kommentaren (FEIL 2 / Regel 24) forklarer den nye regelen. Ubrukt `wantedLen`/`wasClamped` fjernet.
- Breddepanelets gule «under minste lengde»-merknad for frihånd er fjernet (den ville ellers advart på hver 24 cm-bredde). Auto-matte uendret.
- Spec: linje under Regel 24 i `spec-matte-utlegg.md` (Cowork-mappa).

## Test

- `_matFreeRegressionTest` 57 → 62 (nye: 100T-drag, 150T-drag, 240+24+240 ikke `tooShort` og velger 5 m rull, én bredde 48 cm → `tooShort`, vaksine: terskelen satt til 100 cm → 40/70 avvises igjen = rød).
- `_matPathClickRegressionTest` 28/28; alle øvrige `_mat*RegressionTest` grønne.
- Mattebenk (42, 64): 224 rader, **0 forskjeller** i score/lovlighet/dekning mot 149.
- Skjermbilde: `docs/150/bredde-24cm.png` — 240 cm-bane og en 24 cm-bredde (merket «0,2 m») i samme rom.

## Ikke gjort / merk

- Ikke testet i nettleseren med ekte museklikk (testene kaller `_matFreeCandidate`/`_matPathClickRegressionTest`).
- Skjermbildet viser en 24 cm-bredde ved siden av en annen matte, ikke nøyaktig 34 cm gulvfelt med 5 cm margin på begge sider.
