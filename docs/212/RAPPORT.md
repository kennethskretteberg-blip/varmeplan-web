# 212 · Flatt tak: sluk, gradrenner og varmefelt, med c/c regnet av flateeffekten — rapport

07.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.

## Kort

- **Samme Tak-modul, annen objektpalett.** Når takflaten er «Flatt tak», viser panelet et eget kort: «Flatt tak — sluk, gradrenner, varmefelt». Skråtak har ikke kortet.
- **Tre metoder, som i Cenikas film:**
  1. **Sluk.** Ring rundt sluket + kabel ned i røret. Dette er grunnlaget og er alltid med.
  2. **Gradrenner.** Bånd mellom sluk (eller fra parapet til sluk) med bredde og W/m².
  3. **Varme på taket.** Et varmefelt: et polygon du klikker, eller «Hele takflaten» med ett klikk.
- **c/c regnes, den oppgis ikke.** Du velger kabel fra produktkatalogen og skriver W/m². Panelet viser regnestykket i klartekst, for eksempel «30 W/m ÷ 300 W/m² = c/c 10 cm · 6 løp over 60 cm · 48,00 m».
- **Et sluk er ikke et nedløp.** Sluket har et eget felt, «Ned i røret», som er **tomt** til du fyller det. Er det tomt, er sluket ikke ferdig: summen får «≥» foran og sier «1 sluk mangler rørlengde». Byggehøyden brukes ikke. Nedløpsmodellen fra 206/213 kalles aldri.
- **Ingen tall er funnet på.** Appen foreslår ingen W/m², har ingen kurslengdegrense, og W/m² står tomt til du skriver det. Det eneste tallet fra filmen er ringradien (0,40 m). Den er redigerbar og merket «fra Cenikas animasjon».
- **Oppsettene kan sammenlignes.** Tre knapper viser kabelmeter før du velger, på samme måte som i 208:
  - «1 · Sluk»
  - «1 + 2 · Sluk + gradrenner»
  - «1 + 3 · Sluk + varme på taket»

  Er både gradrenner og varmefelt tegnet, regner appen ingen sum før du har valgt. Den regner 2 og 3 som alternativer, ikke som tillegg til hverandre (spm. 1).

## STEG 0 — hva som fantes

### Flateeffekt-motoren for rom

Det finnes **ingen egen funksjon** som regner c/c fra W/m². Rommene regner den andre veien, fra et kabelprodukt med fast lengde: `CC = netto ÷ lengde`, og flateeffekten følger av det. Formelen står inline flere steder:

| Hvor | Hva |
|---|---|
| `_cableWm2Floor` (~:3222) | `W/m² = W/m × 100 / CC_cm` — kommentaren forklarer formelen (prompt 063) |
| `_computeRoomStats` (~:5924) | `watt_per_m / ccM` vektet per kabel |
| `:8703`, `:8799`, `:9152` | `flateeffekt = watt_per_m / (cc_cm / 100)` (Romoversikt, lister) |
| `selectCableByPower` (~:39252), `_listSuggestCableFrom` (~:79040) | kabelforslag: `desiredW = netto × W/m²`, `cc = netto / lengde × 100` |
| `_roomFlateeffektWm2` (~:14668) | den ene kilden for rommets viste flateeffekt (W/m ÷ CC) |

**Grensene finnes som egne funksjoner, og dem gjenbruker taket:**
- `_ccLimits(prod)` (016): kabelens minste c/c (`min_spacing_mm`, hard) og anbefalte største c/c (`max_spacing_mm`, advarsel).
- `_ccOverWarn` / `_ccWarnText` (016): teksten «CC … er over anbefalt maks (20 cm) for InSnow 30T».
- `_roomWm2OverWarn` (159, ~:111836): «Flateeffekt X W/m² er Y W/m² over taket på Z W/m²». Taket kommer fra `_wm2MaxFor` → `_moduleContext(modul).wm2Max`.

**Hva jeg gjorde:**
- **Formelen:** én liten ren funksjon, `_ccCmFromWm2(wpm, wm2) = wpm × 100 / wm2`. Det er rommenes formel snudd, med samme enheter. Testen sjekker at `c/c × W/m² / 100 = W/m` for 24 kombinasjoner. Rommenes inline-kopier er ikke rørt.
- **159-advarselen:** sammenligningen og overskriften er trukket ut i `_wm2OverCore(wm2, max)`, og `_roomWm2OverWarn` bygger nå på den. Romteksten er uendret: `_wm2OverWarnTest` er 9/9 både på HEAD og etter (kjørt i hver sin fane), og 212-testen kjører den. Taket bruker den samme kjernen.
- **Taket for flatt tak:** `_moduleContext('snow').wm2Max`, altså 450 W/m² (utendørs). Tak-modulens egen `_moduleContext('roof')` gir innendørs-tallene (300, standard 130), fordi `snow` er det eneste utendørs-flagget der (spm. 2).
- **Ingen ny regnemotor:** `_takFlatCalc` setter sammen formelen og de tre gjenbrukte advarslene for ett felt. Den regner ingenting selv utover `areal × W/m² ÷ W/m`.

### InSnow 30T i `heating_products`

Lest med den publiserbare nøkkelen, 07.11:
- **InSnow 30T** (230 V, 19 rader) og **InSnow 30T 400V** (17 rader): `watt_per_m = 30`, `active = true`, `min_spacing_mm = 60`, `max_spacing_mm = 200`, kategori 5 «Varmekabel utendørs» (`available_contexts = ['outdoor']`).
- **InSnow 20T, 20T 400V, 40T og 40T 400V:** `active = false`. De tilbys ikke (`_listCableProducts` filtrerer `active !== false`). Testen sjekker dette.

W/m leses fra `watt_per_m` på produktraden. Taket lagrer `product_id` og et øyeblikksbilde (familie, W/m, c/c-grenser). Er katalogen lastet, leses W/m fra katalogen; ellers fra øyeblikksbildet, og panelet sier «lagret ved valget — katalogen er ikke lastet».

**Funn:** kabellisten er den samme som snømodulen bruker (`_listCableProducts('snow')`), og den tar med **InFloor 10T og 17T**. Kategori 2 «Varmekabel» er merket både `indoor` og `outdoor` i katalogen. Jeg følger katalogen, men sorterer rene utendørskategorier først, så InSnow kommer øverst (spm. 3).

### `roof_type = 'flat'` og parapet

- `surfaces[].roof_type.value` kan være `'flat'` (204 B/E). `_takSetRoofType(fid,'flat')` gir et kantforslag med **alle kanter parapet** (205).
- `_takEdgeTakesGutter` slipper bare en kant merket «Takfot» av brukeren (USER_CONFIRMED) igjennom på et flatt tak. Parapeten får altså ikke rennestrekk før brukeren sier at det finnes en utvendig renne. Det var bygget i 205 og er uendret. Testen sjekker at `_takAddGutter` nekter på parapet.

### Side om side med skråtak

Flate objekter lagres i `S.tak[fid].flat`, **ikke** i `t.features`. Ingen skråtaksfunksjon leser `flat`:
- `_takRecalc`, `_takCableRows`, `_takAccessories`, snittet (210), «Finn like» (209) og hit-testen til 206 itererer bare `t.features`.
- Flatt-tak-koden kjører bare når takflaten er flat (`_takIsFlat`). Mutasjonene nekter på skråtak.
- `flat` lages først når brukeren legger inn noe. Et tak uten flate objekter lagres byte-identisk med før.

**Avvik fra prompten:** prompten kaller gradrenna `VALLEY_GUTTER`. 206 har alt en `VALLEY_GUTTER` for skråtak (mellom to takflater, lengde i 3D, løp × lengde). Typenavnet er beholdt, men den flate gradrenna har `roof: 'flat'` og ligger i `t.flat.features`. De to kan dermed aldri blandes. På et flatt tak viser 206-kortet ikke lenger «+ Gradrenne»: den hører til flatt-tak-kortet der.

## Datamodellen

```
S.tak[fid].flat = {
  v: 1,
  cable:   { product_id, family, name, watt_per_m, min_spacing_mm, max_spacing_mm, prov: CATALOG } | null,
  setup:   'drains' | 'valleys' | 'field' | null,      // null = avledet av det som er tegnet
  features: [
    ROOF_DRAIN    { id 'sl<n>', geometry.pt, ring_runs {2}, ring_r_m {0,40}, pipe_cable_m {null},
                    ring_m, cable_total_m (null når røret mangler) },
    VALLEY_GUTTER { id 'gr<n>', roof:'flat', geometry.pts [a,b], width_m, covered_width_m (følger bredden),
                    wm2, length_m (i plan), cable_total_m },
    HEAT_FIELD    { id 'vf<n>', whole (følger omrisset), geometry.pts, wm2, area_m2, cable_total_m },
  ]
}
```

- Alle felt er `{ value, prov }`.
- Standardverdiene er `ESTIMATE` (ringene: «standard 2 ringer»; radien: «hentet fra Cenikas animasjon»). Det brukeren skriver blir `USER_CONFIRMED`.
- Et tomt felt blir `value: null`, aldri 0.
- 0 i «Ned i røret» er et svar («ingen kabel i røret») og regnes som ferdig.

## Formelkontrollen, begge veier

Fra `_takRegressionTest212` A og D. Kabel: InSnow 30T, 30 W/m.

| | Regnet | Andre veien | Fasit |
|---|---|---|---|
| c/c | 30 ÷ 300 = **0,10 m** | c/c × W/m² / 100 = 30 W/m | 0,10 m |
| Hele taket 40 × 20 m | 800 m² × 300 ÷ 30 = **8000 m** | 800 m² ÷ 0,10 m = 8000 m | 8000 m |
| Gradrenne 8 m, 60 cm | 8 × 0,6 × 300 ÷ 30 = **48 m** | 6 løp × 8 m = 48 m | 48 m |
| Antall løp, 60 cm | 0,60 ÷ 0,10 = **6** | — | 6 |
| 24 kombinasjoner (17/30 W/m × 150/250/300/375 W/m² × 1/12,5/800 m²) | `areal × W/m² ÷ W/m` | `areal ÷ c/c` | like (≤ 1e-6) |

**Ni sluk:** 2 ringer à r = 0,40 m gir 9 × 2 × 2π × 0,40 = 9 × 2 × 2,51 = **45,24 m** (prompten: 45,2), uten `pipe_cable_m`.

**Når løpene ikke går opp:** 65 cm ÷ 10 cm = 6,5 løp. Kabelmeter regnes da av arealet, som formelen sier, og panelet varsler: «6,50 løp er ikke et helt tall — kabelmeter er regnet av arealet. Juster bredden eller flateeffekten.» (spm. 4)

## Advarslene, som rommenes

| W/m² (30 W/m) | c/c | Advarsel | Kilde |
|---|---|---|---|
| 100 | 30 cm | «CC 30.0 cm er over anbefalt maks (20 cm) for InSnow 30T» (punktum i tallet, som i romkortet) | `_ccWarnText` (016) |
| 300 | 10 cm | ingen | — |
| 500 | 6 cm | «Flateeffekt 500 W/m² er 50 W/m² over taket på 450 W/m²» | `_wm2OverCore` (159) |
| 600 | 5 cm | 159 + «c/c 5,0 cm er tettere enn kabelens minste c/c (6,0 cm) — kan ikke legges» (rød) | `_ccLimits.minSp` |

Ingen av dem sperrer noe. Tallet regnes, og advarselen står under formelen.

## Bildene (filmens tak, 40 × 20 m, ni sluk)

Laget med `probe/vis.mjs`. Kabel InSnow 30T. Sluk sl5 står uten rørlengde, de åtte andre har 1,50 m.

| Metode | Lerret | Panel |
|---|---|---|
| 1 · Sluk | `metode1-sluk-lerret.png`, nærbilde `metode1-sluk-naer.png` (to ringer à 0,40 m) | `metode1-sluk-kort.png`, valgt sluk `metode1-sluk-rad.png` |
| 2 · Gradrenner (12 stk, 60 cm, 300 W/m²) | `metode2-gradrenner-lerret.png`, nærbilde `metode2-gradrenne-naer.png` (6 løp, c/c 10 cm, virkelig bredde) | `metode2-gradrenner-kort.png`, valgt `metode2-gradrenne-rad.png` |
| 3 · Hele taket (300 W/m²) | `metode3-hele-taket-lerret.png` | `metode3-hele-taket-kort.png` |
| Valg av oppsett når både 2 og 3 er tegnet | — | `valg-oppsett-kort.png` |
| Advarsel ved 500 W/m² | — | `advarsel-500-kort.png` |

Summene i bildene:

| Oppsett | Sum | Merknad |
|---|---|---|
| 1 · Sluk | ≥ 57,24 m | 45,24 ring + 8 × 1,50 rør; sl5 mangler |
| 1 + 2 · Sluk + gradrenner | ≥ 777,24 m | 120 m gradrenne × 0,6 m × 300 ÷ 30 = 720 m |
| 1 + 3 · Sluk + varme på taket | ≥ 8057,24 m | |

## På lerretet

- **Sluk:** fylt prikk med ringene i virkelig radius. «sl5 · rør ?» står i oransje når røret mangler.
- **Gradrenne:** bånd i virkelig bredde, med dekket bredde mørkere. Løpene er tynne linjer med c/c, når det er ≤ 80 løp og de er minst 2 px fra hverandre. Uten W/m² tegnes en stiplet midtlinje.
- **Varmefelt:** skravert, med stiplet kant og etiketten øverst i feltet: «vf1 · 800,0 m² · 300 W/m² · c/c 10,0 cm · 8000 m».
- **Objekter utenfor valgt oppsett** tegnes svakere (35 %) og er nedtonet i panelet. Ingenting slettes når du bytter oppsett.

**Verktøy:**
- «+ Sluk»: klikk på taket.
- «+ Gradrenne»: klikk to ender. De snapper til sluk, så til hjørner og parapet.
- «+ Varmefelt»: klikk hjørnene. Enter eller første hjørne lukker.
- «Hele takflaten»: ett klikk.

Klikk på et objekt utenfor verktøyene velger det. Med mange sluk eller gradrenner er radene i panelet kompakte (feltet «Ned i røret» og regnestykket står alltid). Valgt objekt viser alle feltene.

**PDF:** PDF-en leser hovedlerretet, så alt tegnes med. Utvalg og forhåndsvisning skjules i PDF-modus.

## Tester

- **Ny `_takRegressionTest212` 70/70:**
  - formelen begge veier;
  - ni sluk;
  - tomt rør (ett sluk, 0 som svar, tømt felt);
  - tom W/m² og ingen kabel;
  - de fire advarslene;
  - sluket følger ikke gesimsen, og ingen DOWNSPOUT;
  - gradrenne: bredde, dekket bredde som følger/rettes/tømmes;
  - «Hele takflaten» 800 m²;
  - oppsettene, og at knappens tall = summen etter klikk;
  - lagring/åpning, angre, prosjektlås;
  - ekte lerretsklikk (sluk, gradrenne snappet til sluk, velg);
  - skråtak uendret (110,15 / 80,15, ingen `flat`, «+ Gradrenne» står);
  - prosjekt uten tak;
  - 159-testen.
- **Alle regresjonstestene** (`probe/alle.mjs`, én fane per test, arbeidskopi mot HEAD):
  - 80 tester, hvorav 79 gamle **like med HEAD** og 1 ny (212: 70/70).
  - De sju røde er de samme som på HEAD: innlogging (`_prosjektlaas` E, `_kundeforslag` L/138) og karttjenesten (`_geo*`).
  - Se `probe/alle-head.json` og `probe/alle-etter.json`.
- **Skråtak og tomt prosjekt mot HEAD** (`probe/skraa.mjs`, HEAD-kopi og arbeidskopi i hver sin fane):
  - Skråtaket: 25 m renne, tre nedløp, ett med 1 løp og boks, ett under bakken, gradrenne, takvindu og startpunkt.
  - Lagring, panelets HTML, kabelsum (117,46 m) og lerretsbildet er **bit-identiske** med HEAD.
  - Et tomt prosjekt er også likt, når tidsstemplene er tatt ut (`probe/skraa.log`).

## Sjekkliste for Kenneth

1. Åpne et skråtaksprosjekt fra 206–210. Det skal se ut og regne nøyaktig som før.
2. Nytt Tak-prosjekt → «Tegn for frihånd» 40 × 20 m → «Flatt tak». Kantene blir parapet, og kortet «Flatt tak — sluk, gradrenner, varmefelt» kommer.
3. Velg «InSnow 30T · 30 W/m». Sett ni sluk. Summen viser «≥ 45,24 m · 9 sluk mangler rørlengde». Fyll «Ned i røret» på alle, og «≥» forsvinner.
4. «+ Gradrenne» fra sluk til sluk, bredde 0,6, W/m² 300. Panelet viser «30 W/m ÷ 300 W/m² = c/c 10 cm · 6 løp over 60 cm · …».
5. «Hele takflaten», W/m² 300 → 8000 m. Begge 2 og 3 er nå tegnet: velg oppsett med knappene.
6. Skriv 500 W/m². 159-advarselen skal komme med samme ordlyd som i romkortet.
