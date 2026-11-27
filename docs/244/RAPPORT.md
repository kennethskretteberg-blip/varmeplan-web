# 244 – Tilbehør: knapp for å legge til andre foliebredder manuelt

27.11.2026 · `main` · commit `2e43f0f` · ikke pushet · ingen SQL

## Hva som er endret
- **Knapp «+ Legg til bredde»** nederst i «Varmefolie (meter)» i Tilbehør-dialogen (`showAccessoriesModal`). Den åpner et nedtrekk med foliebreddene fra produktkatalogen som ikke alt står i lista (`_foilCatalogProducts` – samme filtre som produktvelgeren: foliekategori, aktiv, synlig for org-en). Med dagens katalog: FlexFoil B=20 … 140 cm.
- **Manuell rad** ser ut som en tegnet rad (tallfelt, «+1 m», «+5 m», «m»), men med teksten «lagt til manuelt», uten forslag, tomt felt som start, og en liten «×» som fjerner den. Tegnede rader har ingen «×» og er urørt.
- **En tegnet bredde kan ikke legges til en gang til** – den står ikke i nedtrekket. Det samme gjelder en bredde som alt er lagt til manuelt.
- **Seksjonen vises også uten tegnet folie** (prosjekt med bare kabel eller matte), med teksten «Ingen folie er tegnet i prosjektet.»
- **Hjelpetekst under knappen:** «Manuelt lagt til folie påvirker ikke beregnet tilbehør.» Tilbehøret regnes fortsatt av tegnet mengde (`foilCtx`), ingenting der er rørt.
- **Lagring:** `S.project.accessories.items`, som `{ type: 'foilProduct', productId, qty, autoQty: 0, drawnM: 0, manual: true, … }` med id `_foilAccId(pid)`. Raden følger prosjektet og kommer tilbake når dialogen åpnes igjen. 125-regelen (`autoQty`) og `_foilOrderQtyM` er urørt – for en bredde som ikke er tegnet er forslaget 0, så funksjonen gir brukerens tall.

## Eksportene – alle fire måtte endres
Alle fire itererte bare over tegnede produkter, så en lagret manuell bredde kom ikke med i noen av dem. Mengden leses fortsatt av `_foilOrderQtyM`; det nye er én felles kilde for *hvilke* folieprodukter som skal med:

| Eksport | Endring |
|---|---|
| Visma-lim (`_vismaPasteBuild`) | `_foilAggWithManual(…)` rundt `_aggregateMaterialItems` |
| GBAO10 (`_gbao10Build`) | samme |
| Excel «Bestilling» (`_exportMaterialListXLSX`) | samme – manuell folie rett etter tegnet folie |
| PDF-materialliste (`exportPDF`) | `_foilManualRows(…)` lagt til i `_matEntries` (ikke i `matList`, som også mater Tilbud-sida) |

Artikkelnummer og el-nummer kommer fra produktet, som for tegnet folie (mangler art.nr, havner bredden i mangellista / el-nr-valget i GBAO10). 0 m gir ingen linje. En lagret rad teller bare som manuell når den har `manual: true` – en tegnet rad der folien siden er slettet fra tegningen, blir ikke hengende igjen som bestillingslinje.

## Bare kabel + manuell folie
Virker: folien kommer på bestillingen i alle fire (foran kabelen, 179-regelen). Men **folietilbehøret vises ikke** – den seksjonen finnes bare når folie er tegnet, så tape, klemmer og RKK kan ikke legges til der. Se spørsmål 1. Et helt tomt prosjekt åpner fortsatt ikke dialogen (spørsmål 2).

## Kontroll
- **Ny `_foilManualWidthRegressionTest244`: 47/47.** Går gjennom den ekte dialogen: legg til → raden vises → lagres → tilbake ved ny åpning; verdien i Visma-lim, GBAO10, Excel «Bestilling» og PDF-materialliste med art.nr og el-nr; 0 m og tomt felt gir ingen linje; «×» fjerner fra alle fire; tegnet bredde står ikke i nedtrekket; prosjekt med bare kabel får manuell folie; tilbehørstallene (dialogen og det bekreftede resultatet) er like med og uten manuell folie. Vaksine: uten `_foilAggWithManual` forsvinner linja.
- `_accessoryFoilQtyRegressionTest` (125/144/163/175/179): 105/105, som før.
- **Hele suiten** (`docs/244/probe/alle.mjs`): 109 tester, 101 grønne. De 108 gamle er like test for test med resultatet fra 243 (`docs/243/probe/alle-etter.json` – samme kode som HEAD, siden commiten etter bare var dokumenter; HEAD ble ikke kjørt på nytt). Samme åtte røde uten innlogging, ingen nye.
- Skjermbilder i `docs/244/`: `foer-dialog.png`, `etter-knapp-og-valg.png`, `etter-manuell-rad.png`, `etter-bare-kabel.png`.

## Ikke gjort / verdt å vite
- Excel-arkene «Materialliste» og «Per rom» og Tilbud-sida i PDF tar ikke med manuell folie (spørsmål 6 og 7).
- Mobilappen er ikke sjekket (spørsmål 9).
- Ikke prøvd for hånd med innlogget bruker og ekte lagring til skyen; testen sjekker at raden ligger i `_buildSaveData()`.

Spørsmål: `docs/244/SPØRSMÅL.md`.
