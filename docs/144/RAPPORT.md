# 144 · FlexFoil-tilbehøret i Kenneths faste rekkefølge

## Hva som er gjort
- `FOIL_ACC_ORDER` (13 id-er, `plast_over` før `plast_under`), `_foilAccOrderIdx(id)` og `_sortFoilAccessories(list)` rett under `RKK_PRODUCTS`. Ukjente id-er kommer etter de kjente, sortert på `art_no`.
- **PDF:** `_accRenderGroup` bruker `_sortFoilAccessories` for «Tilbehør varmefolie». Kabel/annet er uendret (art.nr stigende).
- **Dialog:** «Øvrig tilbehør» følger lista; RKK-blokka står på sin plass (etter dobbelsidig tape, før tang). Lista deles i «Øvrig tilbehør» / «Øvrig tilbehør (forts.)». Innlesningen (`acc-confirm`, `readRow`) er uendret.
- **Excel «Bestilling», Visma-lim, GBAO10:** sorteres der dataene samles, i `_aggregateAccessoryItems` (folie først i `FOIL_ACC_ORDER`, resten i innsettingsrekkefølge). Raden bærer nå også `id` og `type`.
- **Excel «Materialliste»-arket** (fant i STEG 0, ikke nevnt i oppgaven): folietilbehøret sorteres også der.

## STEG 0 — rekkefølgen FØR (utledet fra koden, ikke målt på kjørende gammel kode)
| Sted | Rekkefølge før |
|---|---|
| PDF | art.nr stigende: RKK 1,5 blå/sort, RKK 2,5 blå/sort (54120–23), klemme 54124, dobbeltsidig 54210, lerret 54211, plast 54212, vulk 54213, kapton 54214, … underlag 54206 før klemme, tang 55200 sist |
| Dialog | RKK-blokka først, så «Øvrig tilbehør» på art.nr stigende |
| Excel Bestilling / Visma / GBAO10 | innsettingsrekkefølge: auto (klemme, kapton, lerret, vulk, underlag, plast over, plast under), manuell (dobbeltsidig, tang), RKK |

(PDF/dialog er art.nr stigende, så underlag 54206 kom i praksis først; Visma/GBAO/Bestilling var en tredje rekkefølge.)

## Steder som ordner tilbehør
| Sted | Hva |
|---|---|
| `_accRenderGroup` (PDF) | sorterte på art_no → nå `_sortFoilAccessories` for folie |
| `showAccessoriesModal` `foilSorted` | sorterte på art_no → nå `_sortFoilAccessories`, delt rundt RKK |
| `_aggregateAccessoryItems` | innsettingsrekkefølge → folie sortert, så resten |
| `_exportMaterialListXLSX` Materialliste-arket | usortert → folie sortert |
| `_vismaPasteBuild`, `_gbao10Build`, Bestilling | leser `_aggregateAccessoryItems` (ingen egen kode) |

## Etter (målt)
Dialogen (alt huket av, RKK 2,5): `underlagsplater, plast_over, plast_under, tilkoblingsklemmer, kapton_disc, lerretstape, vulk_tape, dobbeltsidig_tape, [RKK-blokk], flexfoil_tang`. Skjermbilde: `docs/144/dialog.png`. De fire eksportene er målt i testen under (alle 13 id-er innsatt baklengs → fasitrekkefølge i PDF, Bestilling, Visma, GBAO10). Merk: `plast_over`/`plast_under` har samme art.nr, så Visma/GBAO10 får to linjer med CVA54212 (som før).

## Tester
- `_accessoryFoilQtyRegressionTest` utvidet (+8 sjekker `144 …`): sortering av alle id-er, ukjent sist, folie→ukjent→kabel i aggregering, delmengde uten RKK/tang, og rekkefølgen i Bestilling, Visma, GBAO10 og PDF. 46/46 grønne. Ingen eksisterende test forventet stigende art.nr, så ingen ble endret.
- `_gbao10RegressionTest` og `_pdfExportSmokeTest` grønne. Ingen konsollfeil.
- Ikke kjørt: PDF-skjermbilde av materiallista (rekkefølgen er verifisert på tekstnivå i testen), og ikke testet med vaksine på gammel kode.
