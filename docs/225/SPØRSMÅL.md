# 225 · Flater, farger og verktøylinje — spørsmål til Kenneth

Valg er tatt så løpet kunne gå videre. Svar når du vil; ingenting av dette blokkerer.

## De to «Flytt»-knappene i verktøylinja (ikke døpt om — du bestemmer navn)

| Knapp | Hva den gjør | Viser | Hurtigtast |
|---|---|---|---|
| **✥ Flytt** (`#chip-tool-mode`, `toggleToolMode`) | Bytter *verktøymodus* for musa: **Marker** (pil — velg og dra objekter) ↔ **Hånd** (dra i selve tegneflaten for å panorere; markøren blir en hånd). Flytter ikke noe i prosjektet. | Knappen viser det du bytter **til**: står det «✥ Flytt», er du i Marker-modus; står det «Marker», er du i Hånd-modus. Fylt (valgt) når Hånd er på. | V / H |
| **↔ Flytt** (`#chip-transform`, `toggleTransformMode`) | Bytter *transformasjon* for det valgte rommet/hindringen: **Flytt** (dra objektet) ↔ **Roter** (vri det rundt ⊕-punktet). Samme bryter som chipsene over tegningen. | Også her det du bytter **til**: «↻ Roter» når Flytt er modus, «↔ Flytt» når Roter er modus. Fylt når Roter er på (klassen `active` fantes i JS, men hadde ingen CSS før 225 — nå ser den ut som valgt). | Cmd/Ctrl+F / Cmd/Ctrl+R |

Forslag (ikke gjort): den første kunne hete **Panorer** eller **Hånd**, den andre **Roter** / **Flytt objekt**. Begge viser i dag
*neste* modus, ikke *gjeldende* — det er lett å lese feil, men er en UX-endring og hører ikke til designløpet.

## Valg tatt i 225

1. **Valgt tilstand er fylt turkis med hvit tekst** (`--accent` + `--on-accent`), som prompten ba om («lys tekst»). Hvit på
   `#0891b2` er **3,7:1** — godkjent for UI-komponenter og store/fete tekster (WCAG 3:1), men under 4,5:1 for liten
   brødtekst. Alternativ: mørk tekst `#0f1729` oppå (4,9:1), eller en litt mørkere fyllfarge bare for valgt
   (`#0e7490`, hvit 5,4:1) uten å røre aksenten ellers. Én linje å bytte (`--on-accent` i `body.light-theme`).
2. **Fylt valgt-tilstand gjelder alle `.snap-chip.on`/`.tool-chip.act`**, ikke bare verktøylinja — ctxbar («Lerret»,
   «Raster», «+ Produkt» …), sidepanelets widgets og dialogene ser likt ut. Alternativ: bare `#topbar`.
3. **Flatene er kort også i appen** (ikke bare på dashbordet): `#content` har grå bakgrunn og 6 px luft, venstrepanelet og
   tegneflaten er hvite kort med 1 px kant og 8 px radius (Flow Busbars `.ws-panel`). Tegneflaten blir 14 px smalere og
   14 px lavere; ingenting flyttes i verden (klikk → verden leser rektangelet). Presentasjon/kundelenke/innebygd modus har
   hele flaten uten ramme som før. Alternativ: bare kantlinjer, ingen luft.
4. **`--warn` er Flows rav-brune `#9a6b08`** (4,7:1 på hvitt) i stedet for oransje `#d05820` (4,1:1). Semantikken (oransje =
   mangler/venter) står, men tonen er mer «rav» enn «oransje». Alternativ: beholde `#d05820` (da under 4,5:1 som tekst).
5. **`--dim` løftet i begge temaer**: lyst `#8890a4` → `#5d6c87` (3,2 → 5,3:1 på hvitt, 4,8:1 på knappeflaten); mørkt
   `#555d6e` → `#7b849a` (2,8 → 4,9:1). Mørkt tema ellers ikke finpusset (som avtalt).
6. **Alias-tokens** `--fg`, `--panel`, `--hover`, `--brd` var brukt 53 + 118 steder i CSS-en uten å være definert (fall bort,
   elementene arvet farge eller ble gjennomsiktige — bl.a. prosjektnavnene i dashbordet og dokumentasjonspanelets kanter).
   Nå alias til `--text`/`--surface`/`--surface2`/`--border` på `body`. Det er en liten synlig endring der de brukes.
7. **Verktøylinja ruller fra 1292 px** (før: 1306 px) — ved 1280 px er bare 12 px av «+»-knappen utenfor (før 26 px). Ingenting
   som var synlig før er borte. Høyden 56 px står.
8. **Hardkodede farger**: 35 steder i CSS-blokken byttet til tokens (mørk-tekst-på-aksent, cyan-tinter, skygger på
   flytende kort, ok/avbryt i vegg-for-vegg). Resten (≈ 160 distinkte farger, mest dialoger og dashbord-merker) er
   ikke rørt.
9. **Port 4010** er fortsatt den gamle Python-serveren (404); 4013 brukt, som i 226/223/224. Drep pid 81926 og 97427.
