# 151 · Frihånds-matte: udekket «ghost» tegnes ikke lenger

## STEG 0 — hvor ghost og tegnet lengde syntes (før)
| Sted | Før | Nå |
|---|---|---|
| Plan / PDF / presentasjon / kundelenke (samme `render`) | `_drawMatPathUncovered()` tegnet stiplet grått felt | kallet og funksjonen fjernet |
| Lengdeetikett per bredde («8,0 m») | `_matFreeRunLen` = **tegnet** lengde, midt på hele bredden | dekket lengde (`_matFreeCovLen`), midt på dekket del («6,0 m») |
| Mattelabelens plassering (bbox) | over alle bredder inkl. udekket | over `_matPathCoveredLaneRects` |
| Klikk/treff (`_matPathAtWorld`) | hele tegnede rektangel, ghost valgte matta | dekket del (`_matFreeCoveredSplit(...).covR`) |
| Endemarkør/kabel | fikk allerede `coverCm` | uendret |
| Materialliste, romoversikt, PDF-spesifikasjon, Excel | leser `_matFreeCatalog(mp).segments` (dekket) | uendret, ingen «udekket»-tekst funnet |
| Frihånds-panel «Udekket» / «· X m udekket» / toast «tegnet X m» | kun for prosjekterende | beholdt |
| 149 opptatt-regel, katalogvalg, `moves` | — | uendret |

## Skjermbilder
`/tmp/cdp151/before.png` (etikett «8,0 m») og `/tmp/cdp151/after.png` («6,0 m»). Utsnittet er avskåret ved
høyre kant, så selve ghost-feltet (x 660–860) er utenfor bildet; fraværet er dekket av testen under.
PDF og presentasjon bruker samme render; PDF-røyktesten er grønn, men egne PDF-/presentasjonsbilder er ikke tatt.

## Tester (CDP, /tmp/cdp151)
`_matFreeRegressionTest` 65/65 (149-tegnetesten erstattet av 151: ingen udekket rektangel i hele `drawMatPaths`,
etikett 6,0 m ikke 8,0 m, klikk dekket treffer / ghost ikke, vaksine biter), `_matPathClickRegressionTest` 28/28,
`_pdfExportSmokeTest` 25/25, `_matRegressionTest` 2/2, Zone 17/17, RunAdjust 70/70, Arrangement 65/65.
Bane uten udekket del: 149-testen «bit-identisk» står grønn (rektanglene er de samme).
