# 182 · Hesteskotrapp: «Ulik dybde per trinn»

`main`, ikke pushet. Commit «182: …». Alt ligger i `index.html`. Bare hesteskotrapper er endret.

Harness: headless Chrome på port 9333 (`/tmp/cdp182`). Ny kode er servert på 4000, HEAD (`01e5f8b`, 181) via
`git archive` på 4182. Katalogen er syntetisk (samme InSnow 30T-lengder som 176–178). Ingen skyprosjekter er rørt.

## Kort svar

- I hesteskobyggeren står nå avkrysningen **«Ulik dybde per trinn»** rett under «Toppflate». Den er av som standard.
- **Når den er på**, får du én rad per hesteskotrinn:
  - Øverst står en grå info-rad: «Trinn 1 (topp) · 300 × 60 cm · endres i feltene over».
  - Deretter kommer **Trinn 2** (rett rundt toppflaten) og utover til det nederste trinnet.
  - Hver rad har et tallfelt (hele cm), **▲ / ▼** (1 cm), og piltastene i feltet gjør det samme. **Shift + pil** endrer
    10 cm.
  - En overstyrt rad får merket **«endret»** og en **↺** som setter den tilbake til felles inntrinn.
- **Felles inntrinn endres:** radene som ikke er overstyrt, følger med. De overstyrte blir stående.
- **Antall trinn endres:** listen vokser og krymper i ytterkant. Nye rader får felles verdi, og overstyringene blir
  stående.
- **Valget slås av:** alle trinn bruker felles verdi. Overstyringene lagres likevel og er der igjen når du slår valget
  på.
- **Forhåndsvisningen og «Ytre totalmål»** oppdateres for hvert trykk. Et trinn som er for grunt, blir rødt både i
  listen og i forhåndsvisningen.
- **Gyldighet:**
  - Et trinn er ugyldig hvis det ikke har brukbar dybde (dybde ≤ opptrinn + nese, det vil si færre enn 2 strenger), eller
    hvis det ligger utenfor 10–200 cm.
  - Da blir feltet rødt, og en melding sier hvilket trinn det gjelder, for eksempel «Trinn 5 er for grunt: 5 cm gir
    ingen brukbar dybde (opptrinn 3 + nese 3 cm)».
  - «Plasser trapp» / «Lagre endringer» er sperret til feilen er rettet. Se `4-bygger-rod-rad.png`.
- **Kabelen** følger Regel 23 per flate. Hvert trinn får N og CC fra sin egen dybde (Regel 3 og 7), og strenglengdene
  følger av den nye konturen. Plan, sidevisning, måltabell og PDF leser rutingen som før (Regel 9).
- **Gamle trapper er identiske.** Det gjelder også «valget på, alle rader lik felles verdi». Det er målt mot HEAD, se
  under.

## Fredriks eksempel (målt)

Toppflate 300 × 60, 10 hesteskotrinn à 28, trinn 5 satt til 35 med 7 × ▲. Testmarginene er opptrinn 3, nese 3 og maks
CC 10.

| | før | etter |
|---|---|---|
| Ytre totalmål | 860 × 340 | **874 × 347** (+2 × 7 i bredden, +7 foran) |
| Trinn 5 | 28 cm · 4 strenger · CC 7,33 | **35 cm · 4 strenger · CC 9,67** (brukbar 29 → N = ceil(2,9) + 1 = 4) |
| Trinn 2–4 (innenfor) | | dybde, N, CC, strengposisjoner **og strenglengder** uendret |
| Trinn 6–11 (utenfor) | | dybde, N, CC og posisjoner uendret. Strengene er **28 cm** lengre (konturen er 14 cm bredere og 7 cm dypere: +14 + 2 · 7) |
| Toppflaten og bakkanten i planen | x 380, y 200 | **x 380, y 200** (står i ro) |

Med byggerens standardmarginer (2 + 2), som er det `5-pdf-plan-trinn5-35.png` viser, får trinn 5 **5 strenger og CC
7,8**, mens alle de andre får 4 strenger og CC 8.

## STEG 0

### 0.1 Hvor felles `front` og `side` ble brukt

| Sted | Før | 182 |
|---|---|---|
| `_stairHsParams` (`index.html:52540`) | `outerW = topW + 2·count·side`, `outerD = topD + count·front` | gir nå `fronts[]`/`sides[]` per trinn, `cumFront(i)`/`cumSide(i)` (Σ av de i innerste) og `sideTot`. Når alle er like (`uniform`), regnes summene **nøyaktig som før** (`i · front`), så flyttallene er bit-like |
| `_generateHorseshoeSurfaces` (`:52595`) | `(k − 1)·side`, `(k − 1)·front`, `sideTot = count·side`, `d_cm = front`, `hsWidths = [side, front, side]` | akkumulerte summer, `d_cm = fronts[k−1]`, `hsWidths = [sides[k−1], fronts[k−1], sides[k−1]]` |
| `_stairHsPreviewSVG` | tekstene «foran X» / «side Y» med felles verdi | ytterste trinns egne tall (= felles verdi når alle er like). Ugyldige trinn tegnes røde |
| `_stairHsSummaryHtml` | `outerW × outerD` fra parameterne | uendret kode, får de nye summene |
| `_confirmHsBuilder`, ankeret ved redigering | `dx = old.count·old.side − p.count·p.side` | `dx = old.sideTot − p.sideTot` (`:67406`). Toppflaten og bakkanten står i ro (test 182.7) |
| `_confirmHsBuilder`, ny trapp | `step_depth_cm: p.front` | uendret. Det er det gamle flate feltet, og hesteskogeometrien leser det ikke |
| `_stairHsSegments` | `stepDepth_cm: p.front` | uendret. Det er det bakoverkompatible segmentet, som flatene ikke leses fra |
| `_stairUCountDepth` (`:52701`) | leste allerede `sf.hsWidths` **per flate** | uendret |
| Motor, tegner, måltabell, dybdekjede, sidevisning, PDF | leste allerede `sf.d_cm`/`sf.hsWidths`/`stair.runs` per flate | uendret |

### 0.2 N per flate for hestesko

N regnes i `generateStairCable` (`index.html:53021`):
`_stairRunCount(isU ? _stairUCountDepth(surf, ss) : usableDepth, maxCC)`. Det skjer **per flate** i flateløkka, fra
det bredeste båndet på *den* flaten. `usableDepth` (og dermed CC = brukbar / (N − 1)) kommer fra
`_stairSurfSettings(stair, si)` med flatens egen `d_cm`. Siden hver flate nå bærer sin egen dybde, gjelder «N fra det
bredeste båndet» fortsatt, og nå per trinn. Motoren er ikke endret.

## Lagring (additiv)

- `stair.horseshoe.perStepDepth: true` skrives bare når valget er på. Mangler feltet, er valget av.
- `stair.horseshoe.depths_cm: [d2, d3, …]` skrives bare når minst én rad er overstyrt (`null` = følger felles). Feltet
  står også når valget er av, slik at overstyringene huskes. Rader utenfor «Antall hesteskotrinn» lagres ikke.
- Når byggeren åpner en lagret trapp, brukes verdiene uendret. Det er ingen avrunding (hele cm gjelder bare det du
  skriver). En verdi lik felles inntrinn følger felles.
- `_createStairObj` og «Lagre endringer» kopierer lista, så angre-stakken ikke deler referanse.

## Inntrinn sider

- **«Følger foran»** (standard): sidene på hvert trinn følger trinnets egen dybde. Listen sier det: «Sidene på hvert
  trinn følger trinnets egen dybde.»
- **Egen verdi:** sidene holder den på alle trinn, og bare fronten følger listen. Listen sier: «Inntrinn sider er satt
  til 50 cm og holder det på alle trinn — listen endrer fronten.» Testet: `hsWidths` 50/28/50 · 50/40/50 · 50/28/50.
- Om du heller vil ha en egen sidekolonne, står det som spørsmål 1.

## Test

`_stairHorseshoeRegressionTest`: **61 → 101 sjekker, alle grønne**. De 61 gamle har identiske verdier mot HEAD. Nye
sjekker (`182.*`), etter promptens nummer:

1. VK, fire trinn og sider 60: «på, ingen overstyring», «på, alle = felles» og «av, med lagrede overstyringer» gir
   samme flater, ruting og kabel som uten feltene (9 sjekker).
2. Fredriks eksempel gjennom byggerens egne knapper (DOM):
   - valget er av som standard
   - 10 rader à 28, toppflaten som grå info-rad, første rad «Trinn 2»
   - 7 × ▲ gir 35 og «endret»
   - ytre mål og «Ytre totalmål» stemmer
   - pil gir 1 cm og Shift + pil 10 cm. Tilbake på 28 er raden ikke lenger endret
   - lagring er additiv: `[null,null,null,35]`
   - trinn 5 har egne N og CC, de andre trinnene er uendret, og trinnene utenfor er +28
   - måltabellen viser «5 · 4 · … · 9.7»
3. Felles 28 → 30: resten blir 30, trinn 5 står på 35. ↺ gir 30.
4. 10 → 12 → 8 rader: trinn 5 = 35 hele veien, og nye rader får 28.
5. Gjenåpnet trapp: valget er på og 35 står. Av: alle 30, og 35 er fortsatt lagret. På igjen: 35.
6. Rødt felt ved 5 cm, meldingen sier «Trinn 5», knappen er sperret og «Lagre» gjør ingenting. Rettet: meldingen
   forsvinner. En ny trapp med et 4 cm-trinn kan ikke plasseres. Meldingstekstene for ingen brukbar dybde, for dypt og
   for grunt (< 10) er sjekket.
7. Toppflaten og bakkanten står i ro i planen når et trinn endres (x og y uendret, alle U-konturer starter og slutter
   på y = 0).

I tillegg er sjekket at sider med egen verdi holdes på alle trinn, og at ytre bredde blir topp + 2 · Σ sider.

**Mot HEAD** (`/tmp/cdp182/cmp182.js`, samme skript på 4000 og 4182). Fem trapper ble testet: VK Hovedterrasse, fire
trinn, sider 60, en med brøktall og `flush`, og 10 × 28. Hver ble kjørt i fire varianter: uten feltene, på uten
overstyring, på med alle = felles og av med lagrede overstyringer. Følgende er **identisk** for alle 20:

- flater og ruting, før og etter forslag A
- forslagene selv
- PDF-plan og PDF-sidevisning (piksler)
- mål og grenser
- måltabell og sone-blokker
- produktrader og lengdeoppdeling
- detaljutsnitt
- skjermpiksler
- byggerens oppsummering og forhåndsvisning

Den eneste forskjellen: når en trapp *med* de nye feltene lagres på nytt i byggeren, beholder ny kode feltene, mens
HEAD kaster dem. Det er ventet.

Gamle trapptester, verdi for verdi identiske mot HEAD:

- `_stairRegressionTest` 47
- `_stairManualSetRegressionTest` 42
- `_stairZoneRegressionTest102` 106
- `_stairBuilderMoveRegressionTest110` 59
- `_stairSideRegressionTest` 25

Hel `exportPDF` med Fredriks trapp (trinn 5 = 35) går uten unntak.

Underveis fant sammenligningen én feil hos meg, og den er rettet: byggeren rundet lagrede dybder ved åpning, så
40,5 ble 41.

## Bilder (`docs/182/`)

- `1-bygger-av.png`: byggeren med valget av, som før pluss avkrysningen.
- `2-bygger-paa.png`: valget på, med 10 rader à 28.
- `3-bygger-trinn5-35.png`: trinn 5 = 35 med «endret» og ↺. Ytre totalmål er 874 × 347.
- `4-bygger-rod-rad.png`: trinn 8 = 5 gir rød rad, rødt trinn i forhåndsvisningen, melding og sperret «Lagre
  endringer».
- `5-pdf-plan-trinn5-35.png`: PDF-planen med måltabellen. Trinn 5 har 5 strenger og CC 7,8, de andre 4 og CC 8.
- `6-skjerm-plan-trinn5-35.png`: samme trapp på lerretet.
- `7-pdf-side-trinn5-35.png`: sidevisningen med de ulike dybdene.

## Endringslogg

- **Modell:**
  - `_stairHsParams` gir `perStepDepth`, `fronts`, `sides`, `uniform`, `cumFront`, `cumSide` og `sideTot`.
    `outerW` og `outerD` er summer.
  - `_generateHorseshoeSurfaces` bruker akkumulerte summer og egen `d_cm` og `hsWidths` per trinn.
  - Ny `_stairHsDepthProblems` og nye konstanter `STAIR_HS_STEP_MIN_CM` / `STAIR_HS_STEP_MAX_CM` (10 / 200).
- **Byggeren:**
  - `_stairHsB.perStep`/`depths`.
  - `_stairHsBParams` skriver feltene additivt.
  - Nye funksjoner: `_stairHsBDepth`, `_stairHsBMargins`, `_stairHsBListHtml`, `_stairHsBListRender`,
    `_stairHsBRowState`, `_stairHsBStepSet`, `_stairHsBStepBy`, `_stairHsBStepKey`, `_stairHsBStepReset`,
    `_stairHsBPerStep`, `_stairHsBProblems` og `_stairHsBValidate`.
  - Ny HTML: `#shs-perstep`, `#shs-steps`, `#shs-steps-list`, `#shs-err` og `#shs-ok`.
  - `_stairHsBUpd` tegner listen på nytt når felles inntrinn, antall, sider eller toppflate endres.
  - Radfeltene oppdateres på stedet, så markøren står mens du skriver.
- **Lagring:** `_confirmHsBuilder` stopper ved ugyldige trinn, flytter ankeret med `Δ sideTot` og kopierer
  `depths_cm`. `_createStairObj` kopierer `depths_cm`.
- **Forhåndsvisningen:** «foran/side» viser det ytterste trinnets tall. Ugyldige trinn er røde.
- **Ikke rørt:** motoren, kabelreglene, rette trapper og toppflatens felt.

Spørsmålene står i `docs/182/SPØRSMÅL.md`.
