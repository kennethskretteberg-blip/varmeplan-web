# 152 · Frihånds-matte: «Like lengder», endedrag og flytte-gizmo

## STEG 0
**Kenneths oransje matte.** 526 × ~412 cm kan ikke romme tre bredder à 5,4 m, så den er gjenskapt i et 700 × 700 cm rom med
samme rull og bredder: EcoMat 150T 0,5 × 18 m (raster 16 cm), start nede til venstre, moves 544 / 544 / 544 / 304 (U-svinger,
`first`/`uturn`). `_matFreeCatalog`: coverCm 1800, ett segment, 136 cm udekket. I dag flytter dra-i-matta bare `start`
(`labelPos` følger ikke, 137-2), og ingenting endrer lengdene bortsett fra å tegne på nytt.

**Hvor mange baner får knappen** (mattebenken, `_matBench(42, 64)`, målt med innpakning rundt vei 4 og `_matChapterPieces`):

| Kilde | Baner | Får knappen | Får den ikke |
|---|---|---|---|
| Vei 4 (frihånd, benk) | 56 | 33 | 12 flere ruller · 11 bare én bredde |
| 131-kapittelbaner | 79 | 16 | 61 med hopp · 2 bare én bredde |

(a) bare `uturn`, én akse, én rull = knappen; (b) hopp / flere ruller / én bredde = dempet. Hjørner og tverrstykker finnes ikke i
benken, men er avvist av samme sjekk (testet).

**`startCm` / `shiftCm` ved lengdeendring:** `startCm` nullstilles (knappen bestemmer lengdene på nytt), `shiftCm` beholdes.
Under endedrag settes `moves[i].len` direkte og `startCm` er nullstilt av samme kopi.

## Valget i regel 3 (begge tallene)
18 m / 4 bredder / 150T: **L = 448 → siste 456 (+8 cm)** mot L = 464 → siste 408 (−56). Minst forskjell vinner: 448 / 456.
Lik forskjell (syntetisk 18,24 m): 464 / 432 vinner over 448 / 480 (kortest siste).
⚠ Kenneths matte starter ved veggen, og da kan siste ikke bli lengre enn L (den ville gått gjennom startveggen). Der er
resultatet derfor **464 / 464 / 464 / 408** (siste 56 cm kortere), ikke 448 / 456. Starter matta midt i rommet, blir det 448 / 456.

## Før / etter (700 × 700, 150T 18 m)
| | Lengder (cm) | Σ | Udekket |
|---|---|---|---|
| Før (Kenneths) | 544 / 544 / 544 / 304 | 1936 | 136 |
| Like lengder (start ved veggen) | 464 / 464 / 464 / 408 | 1800 | 0 |
| Like lengder (start midt i rommet) | 448 / 448 / 448 / 456 | 1800 | 0 |
| Hindring i bane 1 (start 600, rom 900) | 416 ×3 / 552 (L satt ned til det bane 1 får plass til) | 1800 | 0 |
| Hindring i siste bane | 480 ×3 / 360 (L økt, siste kortet) | 1800 | 0 |
| Hindring som sperrer alt | avvist, melding «Like lengder: rullen (18,0 m) får ikke plass som 4 bredder her — …», uendret | | |
Endedrag (448×3 / 456): siste +48 cm → 432 / 432 / 432 / 504 (Σ 1800), stopper ved vegg, tilbake forbi utgangspunktet gir kortere siste.

Skjermbilder: `docs/152/1-for.png`, `2-like-lengder.png`, `3-endedrag.png` (live-tall «Bredde 1–3: 4,32 m · siste: 5,04 m»), `4-gizmo.png`
(flyttet til ugyldig plassering → rød). Etikettene bruker dagens ett desimal («4,3 m»).

## Hva som er bygget (index.html)
- `_matPathEqualEligible`, `_matPathEqualRank` (ren rangering), `_matPathEqualFeasible`, `_matPathEqualize` — regel 1–5.
- Endehåndtak «E» (`_matEndDragBegin/Move/Finish`, `hitMatPathEndHandle`, `_drawMatPathEndHandle`), drag-art `'mpend'`; ett angresteg tatt ved første endring, Esc fjerner det igjen.
- Flytte-gizmo (`_matPathGizmoPos`, `hitMatPathGizmo`, `drawMatPathMoveGizmo`; glyfen delt med S.mats via `_drawMatGizmoGlyph`, uten rotasjon). Dagens dra-i-matta og gizmoen går begge gjennom `_matPathMoveBegin/_matPathMoveApply` (original + delta via `_translatedFieldsFor` for `_ROOM_TRANSLATE_SPEC.matPaths`) → `labelPos` følger med (137-2 lukket), og «Sentrer»-offset gir ikke lenger et hopp ved dra. Piltaster: `_matPathNudge`.
- Knapp «Like lengder» i panelet og i verktøylinja (dempet med forklaring for andre baner). Hurtigtast-rader i `_SHORTCUTS`.
- Gater: `S.ui.readOnly` / `kundeMode` skjuler og stopper knapp, håndtak, gizmo og piltaster.
- Ingen høyreklikkmeny finnes for frihånds-matte (matter har ingen kontekstmeny), så knappen ligger i panelet og verktøylinja.

## Tester
`_matPathEqualizeRegressionTest` 56/56 (punkt 1–8: Kenneths matte, regel 3 med tall og lik forskjell, hindringer, endedrag inkl. Esc/angre/klikk
uten drag, gizmo inkl. 149-regelen, bane med hjørne/hopp/tverr/én bredde, klikk på bredde, skrivebeskyttet). Vaksine: snudd tie-break,
`startCm` beholdt og «ingen vakt» gir hver sine røde tester. `_matFreeRegressionTest` 65/65, `_matPathClickRegressionTest` 28/28,
`_matRunAdjustRegressionTest` 70/70, `_matArrangementRegressionTest` 65/65, `_roomMoveRegressionTest` 42/42, `_matRegressionTest` 2/2,
`_pdfExportSmokeTest` 25/25. Kjørt i headless Chrome (CDP, /tmp/cdp152); ikke testet på et duplisert prosjekt i Kenneths konto (krever innlogging).

Spec: ny **Regel 30** i `spec-matte-utlegg.md`.
