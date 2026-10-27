# 148 — Varmefolie: produktradene med smaleste bredde øverst

**Status:** ferdig, committet på `main`, ikke pushet. Bare `index.html` (+ denne mappa og `STATUS.md`).

## Resultat
Folieradene står nå 80 → 100 → 120 → 140 i Spesifikasjon, Romoversikt (PDF og Excel), listevisning og presentasjon —
lik motstandsmålingen. Før: 80, 140, 120, 100 (etter effekt). Effekt, antall og lengder er uendret.

## STEG 0 — alle lesere av `_roomProductRows` / `_roomProductBreakdown`
| Sted | Bruk | Rekkefølgen |
|---|---|---|
| PDF Spesifikasjon (`specRows`) | viser rader | synes → endres |
| PDF Romoversikt (`variants`) | viser rader; El.nr/Art.nr/Gruppe leses **per rad** (`v.product`) | synes → endres |
| Excel per rom (`variants`) | viser rader, samme som PDF | synes → endres |
| Listevisning (`bd`) | viser rader (`bdDrawn.map`); `bd[0].kind` for Type-cella | rader endres; Type-cella var «størst» → rettet til `_roomLargestRow` |
| `_presentRoomProduktNavn` | viser rader | synes → endres |
| `_roomDominantProduct` → `_presentRoomProduct` | `rows[0]` som «størst» | **rettet** til `_roomLargestRow` |
| `_roomRatedEffectW`, `_roomProductFamilyName` | summerer | uten betydning |
| `_foilPower` (motstand) | egen sortering på W/m | nå samme komparator `_foilRowCmp` |

Merk: promptens antakelse om at Romoversiktens «dominerende produkt» står på romraden stemmer ikke — PDF/Excel viser
El.nr/Art.nr/Gruppe for hver variantrad, og bare Rom/Areal står på første rad. Ingenting der bruker dominerende produkt.

## Valget i punkt 4
Sorteringen ligger **i `_roomProductRows`** (`_orderProductRowsForDisplay`), ikke i en egen visningsfunksjon.
Begrunnelse: alle lesere bortsett fra to viser rader; en separat `…ForDisplay` krever at hver leser huskes
(og én glemt leser = to rekkefølger, nøyaktig feilen Kenneth ser). To steder brukte `[0]` som «størst», og de er
rettet til `_roomLargestRow(rows)` (eksplisitt maks). Én kopi av sorteringen; `_foilRowCmp` deles med `_foilPower`.

## Regler som er implementert
- Folie: nettobredde stigende, ved lik bredde lengste først.
- Radene grupperes per type; typer med størst samlet effekt først; Reservekabel hører til kabel-gruppa.
  Innad i kabel/matte/plate/aluboard: som før (størst effekt først).

## ⚠ Avvik å se på
Før 148 var rommets rader ÉN liste sortert på effekt, så et rom med både kabel og matte kunne ha dem
flettet (kabel 500, matte 400, kabel 300). Gruppering per type (punkt 2) bryter flettingen: kabel-kabel-matte.
Rom med bare én type er bit-identiske. Reservekabel (0 W) lå før sist i hele rommet; nå sist i kabel-gruppa.

## Test
- `_foilEffectRegressionTest` 24 → 32/32: Kenneths rom 80/100/120/140 og lik `_foilPower`; dominerende = B=80;
  syntetisk (lik bredde → lengste først, typerekkefølge, reserve under kabel); `_roomLargestRow`.
  **Vaksine verifisert:** `_roomDominantProduct` satt tilbake til `rows[0]` → «gir største effekt selv når den står sist»
  blir rød. (Kenneths eget rom skiller ikke, der er største også smaleste; derfor syntetisk.)
  Ingen eksisterende «størst først»-forventning for folie fantes; ingen test slettet.
- `_foilResistanceRegressionTest` 49/49, `_pdfExportSmokeTest` 25/25, `_gbao10RegressionTest` 18/18,
  `_profileNameRegressionTest` 15/15, `_accessoryFoilQtyRegressionTest` 46/46, `_listKalkyleClear` 32/32,
  `_stair` 47/47. `_reserveCable`, `_listevisning`, `_kundeforslag` feiler på katalog/innlogging — identisk med
  baseline (`git stash`-kjøring på b500797).
- Ikke gjort: duplisert Kenneths prosjekt i innlogget app og lest PDF/Excel visuelt (ingen innlogging i harness);
  rekkefølgen er målt i den delte kilden alle flatene leser.
