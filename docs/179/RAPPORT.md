# 179 · Visma-importen: varmekablene sist

**Ønsket** (Fredrik via Kenneth, 02.11.2026): «Varmekabler legger seg mellom folie og tilbehør ved import til
visma. Burde legge seg sist.» Kenneth 03.11: kablene skal **sist**.

**Kort fortalt:** I Visma-lim, GBAO10-fila og Excel «Bestilling» kommer nå varmekabel og kabeltilbehør som
én blokk helt nederst. Alt annet står i samme rekkefølge som før. Antall linjer og summer er uendret. Ingen
endring i PDF-materiallista, tilbehørsdialogen, mengder, navn, art.nr, felt eller filformat.
COMMITTET, ikke pushet.

---

## STEG 0 · 1 — slik var rekkefølgen før (målt på HEAD 7a8106e)

Testprosjekt: to foliebredder, to kabler, én matte, én trappekabel, folietilbehør (3), kabeltilbehør
(strips + følerrør) og mattetilbehør (følerrør). Kabelen ligger i første rom. Innsamlingen er satt opp
syntetisk i nettleseren (`docs/179/probe/maal.mjs`), fordi ekte prosjekter krever innlogging. Ordningen skjer
etter innsamlingen, så det er nettopp den delen som måles.

| # | Visma-lim (FØR) | GBAO10 (FØR) | Excel «Bestilling» (FØR) |
|---|---|---|---|
| 1 | *(tom rad)* | TF50 folie | **K50 kabel** ← innsettingsrekkefølge |
| 2 | TF50 folie | TF30 folie | TF50 folie |
| 3 | TF30 folie | **K50 kabel** | M2 matte |
| 4 | *(tom)* | **K30 kabel** | TF30 folie |
| 5 | **K50 kabel** | M2 matte | **K30 kabel** |
| 6 | **K30 kabel** | **TK20 trappekabel** | **TK20 trappekabel** |
| 7 | *(tom)* | UP plater | — Tilbehør — Varmefolie — |
| 8 | M2 matte | KL klemmer | UP, KL, LT |
| 9 | *(tom)* | LT tape | — Tilbehør — Varmekabel — |
| 10 | **TK20 trappekabel** | **Strips** | **Strips, Følerrør** |
| 11 | *(tom)* *(tom)* | **Følerrør (kabel)** | — Tilbehør — Annet — |
| 12 | UP, KL, LT | Følerrør (matte) | Følerrør (matte) |
| 13 | **Strips, Følerrør (kabel)**, Følerrør (matte) | | |

Fredriks beskrivelse stemmer: kablene står mellom folien og tilbehøret. I Excel står produktene dessuten i
innsettingsrekkefølge (rom for rom), så kabelen kunne til og med komme **først**.

## STEG 0 · 2 — hvor linjene settes sammen

| Sted | Hva det gjør |
|---|---|
| `MATERIAL_GROUPS` / `_groupByMaterialGroups` | Produktgrupper i fast rekkefølge: Folie, **Kabel**, Matte, Plate, Aluboard, Kabel (trapp), Andre. Brukt av Visma-lim og GBAO10. Det er her kabelen havnet som gruppe 2. |
| `_aggregateMaterialItems` | Én rad per produkt. Map → innsettingsrekkefølge. Excel «Bestilling» brukte denne direkte (uten grupper). |
| `_aggregateAccessoryItems` | Én rad per tilbehør. Folietilbehør først i `FOIL_ACC_ORDER` (144), så resten (kabel, matte) i innsettingsrekkefølge. |
| `_sortFoilAccessories` / `FOIL_ACC_ORDER` | Rekkefølgen inne i folietilbehøret (144). Ikke rørt. |
| `_vismaPasteBuild` | Visma-lim: produktseksjoner (én tom rad foran hver), så **alt** tilbehøret (to tomme rader foran). |
| `_gbao10Build` | GBAO10: samme produktgrupper, så alt tilbehøret, flatt. |
| `_exportMaterialListXLSX` → ark «Bestilling» | Produktene i innsettingsrekkefølge, så tilbehøret under overskriftene Varmefolie / Varmekabel / Annet. |
| `showAccessoriesModal` | Lager tilbehørsradene med `type`: `'foil'`, `'cable'`, `'mat'` (og `'foilProduct'` for folieradene). Ikke rørt. |

## Endringen

Én regel, ett sted, rett over «KOPIER TIL VISMA» i `index.html`:

- `VISMA_CABLE_KINDS = ['Kabel', 'Kabel (trapp)']` og `_vismaIsCableKind(kind)`
- `_vismaCableLastBlocks(products, isCableProduct, acc)` deler linjene **stabilt** i to blokker:
  1. alt som ikke er kabel: produktene, så tilbehøret
  2. kabelblokka: kabelproduktene, så kabeltilbehøret (`type === 'cable'`)

  Kommentar: «Fredriks ønske 02.11.2026 (179): varmekabel og kabeltilbehør sist.»

Alle tre utdataene bruker den: `_vismaPasteBuild` (seksjoner + tilbehør), `_gbao10Build` (grupper + tilbehør)
og Excel «Bestilling» (aggregerte produkter + tilbehør, med de samme overskriftene som før). Innbyrdes
rekkefølge i hver blokk er urørt (folietilbehøret følger fortsatt 144). Tomrad-regelen i Visma-lim er den samme
som før: én tom rad foran hver produktseksjon, to foran en tilbehørsblokk. Forhåndsvisningen i «Kopier til
Visma»-dialogen leser nå de samme seksjonene (`built.parts`), så den viser det som faktisk limes inn.

## Før / etter — hele testprosjektet

| # | Visma-lim ETTER | GBAO10 ETTER | Excel «Bestilling» ETTER |
|---|---|---|---|
| 1 | *(tom)* | TF50 folie | TF50 folie |
| 2 | TF50, TF30 folie | TF30 folie | M2 matte |
| 3 | *(tom)* | M2 matte | TF30 folie |
| 4 | M2 matte | UP plater | — Tilbehør — Varmefolie — |
| 5 | *(tom)* *(tom)* | KL klemmer | UP, KL, LT |
| 6 | UP, KL, LT, Følerrør (matte) | LT tape | — Tilbehør — Annet — |
| 7 | *(tom)* | Følerrør (matte) | Følerrør (matte) |
| 8 | **K50, K30 kabel** | **K50 kabel** | **K50, K30 kabel** |
| 9 | *(tom)* | **K30 kabel** | **TK20 trappekabel** |
| 10 | **TK20 trappekabel** | **TK20 trappekabel** | — Tilbehør — Varmekabel — |
| 11 | *(tom)* *(tom)* | **Strips** | **Strips, Følerrør** |
| 12 | **Strips, Følerrør (kabel)** | **Følerrør (kabel)** | |

Tall, før → etter:

| Scenario | Visma linjer / sum antall | GBAO10 linjer / sum | Excel rader | Rekkefølge |
|---|---|---|---|---|
| Alt (folie+matte+kabel+trapp) | 12 / 378 → 12 / 378 | 12 / 378 → 12 / 378 | 16 → 16 | kabelblokka sist |
| Bare folie | 5 / 70 → 5 / 70 | 5 / 70 → 5 / 70 | 7 → 7 | **identisk** |
| Bare kabel | 4 / 304 → 4 / 304 | 4 / 304 → 4 / 304 | 6 → 6 | **identisk** (kabel, så kabeltilbehør) |
| Folie + kabel, uten kabeltilbehør | 5 / 65 → 5 / 65 | 5 / 65 → 5 / 65 | 7 → 7 | kabel sist, ingen tom tilbehørsblokk |

Samme linjer med samme antall i alle scenarier (sortert sammenlikning lik for GBAO10 og Excel). I Visma-lim
har «Alt»-scenariet **to tomme rader mer** enn før, fordi det nå er to tilbehørsblokker (to tomme rader foran
hver, slik formatet sier). Varelinjene er de samme. Se `SPØRSMÅL.md` 3.

Folie + kabel uten kabeltilbehør, Visma-lim: `tom · TF50 · tom · tom · UP · KL · LT · tom · K50`. Ingen tomme
rader til slutt.

## Tester

| Test | Resultat |
|---|---|
| `_accessoryFoilQtyRegressionTest` | **105/105** (var 96). **Ny blokk «179»** med 9 sjekker: alt-prosjektet i Visma-lim, GBAO10 og Excel (kabel sist), tomrad-regelen, bare folie, bare kabel, folie + kabel uten kabeltilbehør (Visma, GBAO10, Excel uten tom overskrift, ingen tomrader til slutt). |
| `_gbao10RegressionTest` (synkron + async) | **42/42** |
| `_pdfExportSmokeTest` | **55/55** |
| Samme tre på HEAD | grønne (ingen røde fra før) |

Ingen eksisterende test forventet den gamle rekkefølgen. 144-testene sjekker bare folietilbehøret innbyrdes,
og det er uendret. Ingen tester ble endret eller slettet.

Målescriptene ligger i `docs/179/probe/` (`maal.mjs` for før/etter-tabellene, `tester.mjs` for testene; krever
headless Chrome på port 9333 og appen på en port).

## Spørsmål

Se `docs/179/SPØRSMÅL.md`: Aluboard (plate + kabel) står ikke i kabelblokka · matte kommer før folietilbehøret
(som i dag), ikke etter · to ekstra tomme rader i Visma-lim når det er to tilbehørsblokker · Excel-produktene
står fortsatt i rom-rekkefølge innenfor blokka.
