# 183 · Hesteskotrapp: svar på 178 og 182

`main`, ikke pushet. Commit «183: …». Alt ligger i `index.html`. Bare hesteskobyggeren er endret.
Motoren, kabelen, rutingen, tegningen og PDF-en er **ikke** rørt.

Harness: headless Chrome på port 9333 (`/tmp/cdp183`). Ny kode er servert på 4000 og HEAD (`cd52fbb`, 182) på
4182. Katalogen er syntetisk (samme InSnow 30T som 176–182). Ingen skyprosjekter er rørt.

## Kort svar

| Svar | Hva som skjer nå |
|---|---|
| **178/1 Høyden** | Byggeren viser samme tall som høydekjeden i sidevisningen. Tallet hentes fra `_stairGeometryDims(…, 'side')`, ikke fra en egen formel. VK Hovedterrasse: **51** (eget trinn) og **34** (i plan). |
| **182/1 Egen sidekolonne** | Ikke endret. |
| **182/2 Gyldighet når valget er av** | Ikke endret. |
| **182/3 Overstyrt rad blir lik felles** | Raden slippes automatisk. Trinn 5 = 35, felles → 35: «endret» forsvinner og verdien lagres som `null`. Felles → 30: trinn 5 blir 30. |
| **182/4 Overstyringer etter lagring** | Ikke endret. |
| **182/5 Minste dybde 15 cm** | ▼ og pil ned stopper på 15. Gyldig område er **15–200 cm**, både i listen og for felles inntrinn. 12 skrevet inn gir rødt felt, melding og sperret plassering. |
| **182/6 Forhåndsvisningen** | «foran X» og «side X» vises bare på ytterste trinn og på overstyrte trinn. Trinnummer vises bare der det ikke treffer annen tekst. Ingen tekst overlapper ved 10 trinn, og heller ikke ved 20. |

## Høyden (178/1)

- Ny hjelper `_stairSideTotalHeightCm(stair)`. Den leser venstre kjede fra `_stairGeometryDims(stair, 'side')`
  (samme kilde som tegningen, via `_stairSideRiserCm`) og gir avstanden fra bakken til øverste nivå.
- `_stairHsSummaryHtml` lager toppflatene fra byggerens verdier og spør hjelperen.
- Målt (oppsummeringen og høydekjeden til den samme trappa, plassert):

| Trapp | Eget trinn | I plan |
|---|---|---|
| VK Hovedterrasse (1 hesteskotrinn) | **51** = 51 | **34** = 34 |
| 4 hesteskotrinn | 102 = 102 | 85 = 85 |
| 10 hesteskotrinn | 204 = 204 | 187 = 187 |

Mot HEAD er tallet i oppsummeringen **17 cm (ett opptrinn) høyere for alle 22 testtrappene**. Resten av teksten er
lik. Tegningen er uendret.

## Minste dybde 15 cm (182/5)

- `STAIR_HS_STEP_MIN_CM` er endret fra 10 til **15**.
- **▲/▼ og piltastene** stopper på 15 og 200. Står et felt allerede utenfor (skrevet inn for hånd), flytter pila det
  ikke lenger ut. ▼ på 12 blir stående på 12, den hopper ikke opp til 15.
- **Felles inntrinn** følger samme regel. 12 gir:
  - rødt felt (også «Inntrinn sider» når sidene følger fronten)
  - én melding: «Inntrinn foran er for grunt: minst 15 cm (står 12). Rett inntrinnet før trappa kan lagres.»
  - sperret «Plasser trapp» / «Lagre endringer»
  - Listen gir ikke ti like meldinger. Radene er røde, men meldingen står bare én gang.
- **Gamle trapper** med inntrinn under 15 åpnes og tegnes som før. Bare byggeren sjekker grensen. Testet med 12 cm.
- Feltene «Inntrinn foran/sider» har fått `min="15" max="200"`, så nettleserens egne piler også stopper.

## Forhåndsvisningen (182/6)

- «foran X» står midt i fronten på trinnet. «side X» står **rotert i høyre arm** på det samme trinnet, så flere
  side-tall ikke kan treffe hverandre.
- Gjelder ytterste trinn og overstyrte trinn. Toppflaten har som før sitt eget «1 · B × D».
- Trinnummer prøves først midt i fronten, så i venstre arm. Treffer det et mål eller et annet tall begge steder,
  vises det ikke.
- Testen henter de virkelige tekstboksene (`getBoundingClientRect`) og sjekker hvert par: **ingen overlapp** ved
  10 trinn med 2 overstyrte (20 tekster, alle trinnumre 2–11 vises) og ved 20 trinn med 4 overstyrte.

## Test

`_stairHorseshoeRegressionTest`: **101 → 117 sjekker, alle grønne.**

- **Endret etter svarene** (fire gamle sjekker):
  - 178-sjekkene på oppsummeringen: 34 → 51, 17 → 34, 68/85 → 85/102.
  - 182.6-meldingssjekken: 10 cm er nå ugyldig, 15 cm er gyldig.
- **Nye `183.*`** (etter promptens nummer):
  1. VK med eget trinn og i plan: oppsummeringen er lik høydekjeden (51 og 34).
  2. 4 og 10 trinn, begge valg: oppsummeringen er lik høydekjeden.
  3. Trinn 5 = 35 → felles 35 slipper raden → felles 30 gir trinn 5 = 30, og ingen `depths_cm` lagres.
  4. ▼ stopper på 15 (17 + 5 × ▼, Shift + ▼ fra 20). 12 skrevet inn gir rødt felt, melding og sperret knapp. ↺ gjør
     raden gyldig igjen. Felles 12 gir rødt felt, én melding, sperret knapp, og «Lagre» gjør ingenting. En gammel trapp
     med 12 åpnes og tegnes, men byggeren viser rødt.
  5. Ingen overlapp ved 10 og 20 trinn. «foran/side» står bare på ytterste og overstyrte trinn.
- **Mot HEAD** (`/tmp/cdp183/cmp183.js`, 22 trapper: de 20 fra 182 pluss Fredriks trinn 5 = 35 og fire trinn med to
  overstyringer): flater og ruting (før og etter forslag A), forslag, PDF-plan og -side (piksler), mål og grenser,
  måltabell, sone-blokker, produktrader, lengdeoppdeling, detaljutsnitt, skjermpiksler og ny lagring er **identiske**.
  Bare byggerens høydetall og forhåndsvisningen er ulike, og det er ventet.
- **Gamle trapptester**, verdi for verdi identiske mot HEAD: `_stairRegressionTest` 47,
  `_stairManualSetRegressionTest` 42, `_stairZoneRegressionTest102` 106, `_stairBuilderMoveRegressionTest110` 59,
  `_stairSideRegressionTest` 25. Hel `exportPDF` er lik.

## Bilder (`docs/183/`)

- `1-vk-eget-trinn-51.png`: VK Hovedterrasse med «høyde 51 cm».
- `2-vk-i-plan-34.png`: samme trapp i plan, «høyde 34 cm».
- `3-ti-trinn-to-overstyrte.png`: ti trinn med trinn 5 = 35 og trinn 8 = 40. Tallene er tynnet ut.
- `4-rod-rad-12.png`: trinn 8 = 12 gir rød rad, rødt trinn, melding og sperret «Lagre endringer».
- `5-felles-inntrinn-12.png`: felles inntrinn 12 gir røde felt, én melding og sperret knapp.
- `6-tjue-trinn-fire-overstyrte.png`: 20 trinn uten overlapp.

## Endringslogg

- Ny `_stairSideTotalHeightCm` (rett etter `_stairGeometryDims`). `_stairHsSummaryHtml` bruker den.
- `STAIR_HS_STEP_MIN_CM` 10 → 15. `_stairHsDepthProblems` sjekker også felles inntrinn og egne sider
  (`common`, `i = -1`). Rader som bare følger et ugyldig felles inntrinn, får `quiet` (røde, uten egen melding).
- `_stairHsBValidate`: viser meldinger uten `quiet`, gjør felles felt røde og skriver «Rett inntrinnet» når bare
  felles felt er feil.
- `_stairHsBStepBy`: grensene er 15/200, og pila flytter aldri verdien lenger ut.
- `_stairHsBUpd('front')`: rader som blir lik felles verdi, slippes (`null`).
- `_stairHsPreviewSVG`: tekstplassering med kollisjonssjekk. Side-tallet står rotert i armen og må holde seg under
  bakkanten.
- Feltene «Inntrinn foran/sider» har `min/max` 15/200.
- STATUS.md: tatt med endringen fra 182 som ikke var committet.

Spørsmålene står i `docs/183/SPØRSMÅL.md`.
