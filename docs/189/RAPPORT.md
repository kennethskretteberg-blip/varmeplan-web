# 189 · Trapp: 75 % er et varsel, ikke en sperre, og dialogen åpnes også uten forslag

`main`, ikke pushet. Commit «189: …». Alt ligger i `index.html`. Svarene dine står under hvert spørsmål i
`docs/188/SPØRSMÅL.md`.

Harness: headless Chrome på port 9333 (`/tmp/cdp189`). Ny kode på 4000, HEAD (`3178aa1`) på 4188 fra `git archive` i
`/tmp/old188`. Katalogen er den syntetiske fra 176–188 (InSnow 30T: 20, 30, 40,1, 49,7, 55, 60, 70, 78,7, 89,1, 98 m).
Testtrappene har opptrinn/nese 2. Ingen skyprosjekter er rørt.

## Kort svar

| Ønske | Nå |
|---|---|
| **75 % er et varsel** | Ingen løser stopper lenger på 75 %. Under 75 % står det gult: «⚠ Varmet bredde N cm (X % av trinnet), under 75 %». Det vises på kortet, i Bla-linja og i panelet. Statusen kan likevel være «Passer». |
| **Harde grenser som står** | **Hestesko:** armen (strengene går aldri forbi hjørnet). **Alle trapper:** strengen må være minst **30 cm** (se spørsmål 1). Regel 7 som før. |
| **Rekkefølgen** | Et sett med 75 % eller mer kommer foran et sett under 75 %. Går bare sett under 75 % opp, er det beste av dem A (med merket), og «litt for langt»-settet (≤ 5 %) er B. |
| **«Stor kantavstand»** | Slått sammen: står 75 %-merket, vises ikke «Stor kantavstand» i tillegg. |
| **Ingen forslag** | Dialogen åpnes med meldingen øverst og «Bla i kabler» under (Ti trinn 28). For trapper med soner står meldingen og «velg kabel per sone i panelet», uten Bla (se spørsmål 3). |

## 1 · Testtrappene: endret forslag og status

Bare trappene som endret seg er tatt med. «Åpnet» er trappa lagret med forslaget fra før 188 og åpnet i ny kode.
Alle andre testtrapper (11 rette og 11 hestesko fra 187/188) har samme forslag, samme tall og samme status som HEAD.

| Trapp | Før (HEAD) | Nå |
|---|---|---|
| **Rett 8 trinn 120** (og topp-start) | Forslag 30 @ 15,4 · 30 @ 15,6 (3/3). **Åpnet: 15, «0.3 m for kort»** | Forslag **30 @ 15,4**, gult «89 cm (74 %)». **Åpnet: 15,4, «Passer»**. Forslag, Velg og åpning er nå like (test 2). B forsvinner: det var samme kabel med dybdemargin 3, og 084-regelen viser aldri samme sett to ganger når A er én kabel. |
| **Trinn 240 (3) → repos 100** | Forslag 30 @ 13,5 · 30 @ 16,8. **Åpnet 30 @ 9,8: rødt «1.5 m for kort!»** | Forslag **30 @ 13,5**, gult (repos 100: 73 %). **Åpnet: 13,5, «Passer»**, gult merke (test 3, bilde 4). |
| **Trinn 240 (4) → repos 100** | Åpnet 19,6: gult «1.4 m for kort» | **Åpnet: 22, «Passer»**, gult (repos 100: 56 %) |
| **Smal 120 × 6, gulv 2** | A = 30 m @ 2, «1.1 m til overs» (20 m ville gitt under 75 %) | **A = 20 m @ 20,5**, gult «79 cm (66 %)». **B = 30 m @ 2, «1.1 m til overs»** (bilde 3) |
| **Bred 240 × 9 trinn, 20 m** (ny) | Bla: «går ikke … over grensen (under 75 %)». Manuelt: rødt | Bla: «Passer hvis svingene trekkes inn **94,6 cm**» + gult «**Varmet bredde 50.8 cm (21 % av trinnet)**». Bruk → **«Passer»** med gult varsel (test 1, bilde 1–2) |
| **Smal 120 × 16, 20 m** (ny) | «går ikke … (under 75 %)» | «**2.4 m for kort ved største avstand (45.0 cm)** … over grensen (**strengen under 30 cm**)» (test 4, bilde 5) |
| **HS VK 31, 49,7 m i Bla** | rødt «går ikke», tak 58,8 (75 %) | «Passer hvis … **68,0 cm**» + gult «334 cm (71 %)». Armen er 72, så det er lovlig nå (bilde 6) |
| **HS VK 31, 40,1 m i Bla** | rødt, «under 75 %», tak 58,8 | rødt, «**forbi hjørnet, armen er 72 cm**», mangelen målt ved 72 (test 5, bilde 6b) |
| **HS Ti trinn 28** | bare en melding (toast) | dialogen med meldingen og Bla (starter på 98 m) (test 6, bilde 7) |
| **Soner (4 trinn + repos)** | bare en melding | dialogen med meldingen og «velg kabel per sone» (bilde 8) |

**Hestesko (test 5):** for alle 11 hesteskotrappene er forslagene identiske med HEAD, og ingen margin i Forslag
eller Bla går forbi armen. VK: 20, 30 og 40,1 m er fortsatt «går ikke, forbi hjørnet».

**Forslag for 50 cm-feltet:** Forslag velger fortsatt kabelen som gir mest dekning (240 × 9: 78,7 m @ 13). Et smalt
felt med vilje velges med «Bla i kabler» eller kabellista i panelet. Begge gir «Passer» og det gule merket. Med denne
katalogen kan Forslag aldri lande på 50 cm av seg selv, fordi det alltid finnes en lengre kabel nærmere behovet.

## 2 · Hva som er endret (med teskje)

- **Det harde taket** heter nå `maxMarginHard` i `_stairMarginProbe`: det minste av armen (hestesko), «strengen ≥ 30 cm»
  (`(minste flate − 30) / 2`) og halve flata − 1. Alle løsere bruker dette taket i stedet for 75 %:
  manuelt sett og åpning (`_stairFitFixedSet`), én-kabel-forslaget, flerkabelsøket og «Fyll toppflaten».
  `maxMargin75` er beholdt bare som tall (varselet og 185-testen).
- **+15 cm-taket** i det frie flerkabelsøket står. Det er ikke 75 %, det er «foretrekk et annet sett framfor et som
  trenger mye mer margin». Én kabel og manuelt sett har aldri hatt det. Se spørsmål 2.
- **Varselet** regnes av én hjelper, `_stairHeated75`: varmet bredde = smaleste flate − 2 × margin, under 75 % → gult.
  Teksten er «Varmet bredde N cm (X % av trinnet), under 75 %» (`_stairUnder75Txt`), og den er lik overalt.
  Soner bruker den samme teksten. Før gjaldt den bare låst avstand.
- **Hver trapp i 188-åpningen** som før sto «for kort» fordi 75 % stoppet, går nå opp. `keepOnFail` står fortsatt
  for sett som ikke kan gå opp (for eksempel strengen under 30 cm), og det er testet.
- **«Ingen forslag»-dialogen** gjenbruker forslagsdialogen uten kort. Toasten står bare igjen når produktgruppa ikke
  har noen kabler.

## Endringer (endringslogg)
- **Nye:** `STAIR_MIN_STRING_CM = 30`, `_stairHeated75`, `_stairUnder75Txt`, `_stairLayoutHeated75`.
- **`_stairMarginProbe`**: `maxMarginHard`. `maxSaneMargin` (fillTop) bruker det i stedet for 75 %, og valg 1 har det i tillegg.
- **`_stairFitFixedSet`**: stopper på `maxMarginHard` (`limit: 'arm' | 'streng'`, før `'75'`). Svarer med `under75`,
  `heatedWidth_cm`, `heatedPct`, `minSurfW_cm`.
- **`_stairSolveExactCableSet`**: én-kabel-kandidaten stopper på `maxMarginHard` (`overWhy: 'streng'`). Nytt `overAlt`
  er «litt for langt»-settet når alt som går opp er under 75 %.
- **`_generateStairProposals`**: `under75`/`heated75` på alle kort. ≥ 75 % rangeres foran under 75 %, og `overAlt` er B.
- **`_renderStairProposalPanel`**: gult 75 %-merke (`.stair-warn75`), «Stor kantavstand» skjules når det står.
  Tom dialog (`#stair-proposal-none`). Grunnen «strenger under 30 cm».
- **`_stairBrowseCableInfo` / `_stairBrowseInnerHtml`**: `warn75` og gul linje (`#stair-browse-75`). «Går ikke» sier
  «strengen under 30 cm» eller «forbi hjørnet».
- **`_renderStairSettingsPanel`**: gul linje under statusen, og sonepanelet bruker samme tekst for alle soner.
- **`showStairProposals`**: åpner dialogen også uten forslag.

## Test

| | resultat |
|---|---|
| `_stairHorseshoeRegressionTest` | **265/265** (252 → 265) |
| `_stairRegressionTest` | **45/45** (47 → 45: test 3 og 4 hadde to sjekker hver for «ingen én-kabel + grå tekst», nå én hver) |
| `_stairManualSetRegressionTest` | 42/42 |
| `_stairZoneRegressionTest102` | 106/106, uendret |
| `_stairBuilderMoveRegressionTest110` | 59/59, uendret |
| `_stairSideRegressionTest` | 25/25, uendret |

Endrede forventninger (alle merket «189» i koden). Alle er 75 %-endringen:
- 084-test 3 (100 cm, 5 trinn): før ingen én-kabel. Nå 15 m @ 14,5, gult (71 %).
- 084-test 4 (240 × 40 trinn): før ingen én-kabel. Nå er A flerkabelsettet (≥ 75 %) og B 139,9 m @ 78,7 (34 %, gult).
- Manuelt B3: 20 m på 240 × 8 ble avvist. Nå @ 90,9, gult (24 %). Ny B3b: 5 m avvises (strengen under 30 cm).
- 188.1: 8 trinn 120, 30 m @ 15 åpnes nå 15,4 «Passer» (før: 15 «for kort»). Ny sjekk: et sett som ikke kan gå opp, står som lagret.
- 188.3: 120 × 6: A = 20 m @ 20,5 (gult), B = 30 m «til overs» (før A).
- 188.4: VK 49,7 m «passer hvis … 68» med gult (før «går ikke»). «Går ikke»-sjekken bruker 40,1 m (forbi hjørnet).

Ny seksjon 189: testene 1–7 fra oppgaven (240 × 9 med 20 m og Bruk, Forslag = Velg = åpning, 240 (3) → repos åpnet,
strengen under 30 cm, armen i Forslag og Bla for VK og BRED, tom dialog for Ti trinn 28 og Soner, ett gult merke på
kortet, rekkefølgen ≥ 75 % foran).

Ikke kjørt: hel `exportPDF`-smoke. PDF-en leser marginen fra trappa og har ingen egen 75 %-regel.

## Bilder (`docs/189/`, før = HEAD, etter = ny kode)
1 · 240 × 9, Bla på 20 m · 2 · samme, panelet etter Bruk (før: manuelt valgt) · 3 · smal 120 × 6, Forslag ·
4 · 240 (3) → repos 100 åpnet · 5 · 120 × 16, Bla på 20 m · 6 / 6b · VK, Bla på 49,7 og 40,1 m ·
7 · Ti trinn 28 · 8 · Soner.
