# 202 · Trapp: svar på 193 — etikett, høydetekst, og måling av båndinndelingen i PDF

Committet på `main`, **ikke pushet**. Ingen ny SQL. Kenneths svar står under hvert spørsmål i `docs/193/SPØRSMÅL.md`.

## Kort fortalt

- **Etiketten** over segmentlista sier nå hva lista er: «SEGMENTER (øverste først)» for «Ovenfra og ned» og
  «SEGMENTER (nederste først)» for «Nedenfra og opp». Den har ikke lenger noen pil, og de to er symmetriske.
- **Under forhåndsvisningen** står nå «Forhåndsvisningen viser trappa slik den står.», i begge retninger, både ved
  første visning og etter hver endring.
- **Høyden** heter nå «… cm til gulvet over». En ny trapp viser «34 cm til gulvet over», og tallet er det samme som før.
- **Statistikklinja brytes pent på 360 px:** to rader, hvert felt på én linje. Før ble hvert felt brutt *inne i seg
  selv* («8 / trinn», «170 cm / høyde»).
- **Båndinndelingen i PDF-en er målt og ikke endret.** Ingen av de 141 trappene i trappetestene bytter båndantall.
  Bytter finnes, men bare i konstruerte trapper med få trinn og lange repos. Kundenes trapper er ikke målt (se D).
- **PDF-en er byte-identisk med HEAD** (sha256 `c59b1085…`, se under).

## STEG 0 — funn med linjenummer (HEAD 8fa81ca)

| Prompten sa | Fant | Avvik |
|---|---|---|
| Etiketten i dialogens HTML, ca. 69695 | 69695 | — |
| Etiketten i `_stairBuilderRefreshPreviewStats`, ca. 69774 | 69774, men i **`_stairBuilderRefreshSegs`** | Annen funksjon. `_stairBuilderRefreshPreviewStats` rører ikke etiketten. Bygget på det jeg fant. |
| `cm høyde` i dialogens HTML, ca. 69716 | 69716 | — |
| `cm høyde` i `_stairBuilderRefreshPreviewStats`, ca. 69764 | 69764 | — |
| Kommentaren om etiketten, ca. 69573 | 69570–69577 | — |
| `_renderStairSidePrintImages`, ca. 90343 | 90343 | — |
| *(ikke nevnt)* | Forhåndsvisningens innhold («Sidevisning» + SVG) bygges også to steder: 69709 og 69760 | Samme feilklasse. Forklaringslinja hører hjemme der, så den er tatt med i opprydningen. |

**Ett avvik i sak, ikke i linjenummer (se SPØRSMÅL 1):** kommentaren over `_generateStairSurfaces` (linje 52978–52990)
og orienteringsregelen fra 11.09 i trappeutskriften (linje 90012–90019 nå) sier at `segs[0]` alltid er trappas **fysisk
nederste** trinn, og at «Ovenfra og ned» bare styrer hvor det **tegnes** i planen. «Øverste først» er derfor riktig om
planen, men ikke om trappa slik den står. Jeg har brukt teksten din ordrett, fordi den er eksplisitt bestemt.
`dialog-900-ovenfra-usym-a.png` viser det: 2 trinn + repos + 6 trinn, der 2-trinnssegmentet står øverst i lista
under «(øverste først)» og nederst i bildet.

## Hva er bygget (alt i `index.html`)

Det er bare tre hjelpere, ingen omskriving av dialogen. Hver tekst som ble rendret fra to steder, har nå én kilde:

| Hjelper (linje nå) | Brukes av |
|---|---|
| `_stairBuilderSegLabelText()` (69729) | dialogens HTML (69787) og `_stairBuilderRefreshSegs` (69855) |
| `_stairBuilderPreviewInnerHtml()` (69733): «Sidevisning» + SVG + forklaringslinja (`#stair-builder-preview-note`, 11 px, `var(--muted)`) | dialogens HTML og `_stairBuilderRefreshPreviewStats` (69838) |
| `_stairBuilderStatsHtml(stats)` (69740): fire felt, hvert med `white-space:nowrap`, høyden som «til gulvet over» | dialogens HTML og `_stairBuilderRefreshPreviewStats` |

- `#stair-builder-stats` har fått `flex-wrap:wrap; gap:4px 16px`. Før var det `gap:16px`, og radavstanden er ny.
- Malen rundt forhåndsvisningen er strammet, slik at første visning og oppdatering gir **nøyaktig samme HTML**.
  Testen sjekker det.
- Kommentaren ved 69570 beskriver nå den nye ordningen: lista er inntastingsrekkefølgen og bildet er trappa slik den
  står. Sidevisningen snus ikke.
- Ikke rørt: `_renderStairSidePrintImages`, `_stairSurfaceBands`, PDF, tegning, kabel, panel og høydekjeden.

## Bilder (`docs/202/`)

`dialog-<bredde>-<retning>-<før|etter>-<a|b>.png`. **a** = etiketten og lista, **b** = forhåndsvisningen og
statistikken. Trappa er 4 trinn + repos 90 + 4 trinn (17/25).

| | Nedenfra og opp | Ovenfra og ned |
|---|---|---|
| 900 px før/etter | `dialog-900-nedenfra-{for,etter}-{a,b}.png` | `dialog-900-ovenfra-{for,etter}-{a,b}.png` |
| 360 px før/etter | `dialog-360-nedenfra-{for,etter}-{a,b}.png` | `dialog-360-ovenfra-{for,etter}-{a,b}.png` |
| Usymmetrisk trapp (spm 1) | — | `dialog-900-ovenfra-usym-a.png` |

## Breddemåling, 360 px (mobil, `deviceScaleFactor` 2)

Statistikklinja er 278 px bred (modal `min(500px, 92vw)` minus 24 px polstring på hver side). Den samme trappa ble målt
i begge retninger, og tallene er like.

| | Før | Etter |
|---|---|---|
| Felt | «8 trinn» · «170 cm høyde» · «290 cm dybde» · «⬜ 1 repos» | «8 trinn» · «170 cm til gulvet over» · «290 cm dybde» · «⬜ 1 repos» |
| Linjebredde / innholdsbredde (`scrollWidth`) | 278 / 278 | 278 / 278 |
| Rader med felt | 1, men **hvert felt brutt i to linjer inne i seg selv** (se `dialog-360-*-for-b.png`) | **2**: «8 trinn · 170 cm til gulvet over» / «290 cm dybde · 1 repos», hvert felt på én linje |
| Felt helt innenfor linja | 4 av 4 | 4 av 4 |
| Vannrett rulling i modalen (`scrollWidth`/`clientWidth`) | 326/326, ingen | 326/326, ingen |

Allerede på HEAD trengte de fire feltene ca. 279 px på 278 px. Ingenting ble kuttet, men feltene ble presset sammen
og brukket. Med «til gulvet over» ville det blitt verre, og derfor brytes linja nå mellom feltene. På 900 px er linja
447 px før og etter, med 1 rad.

## D — måling av båndinndelingen i PDF-en (ingen kodeendring)

**Metode** (`docs/202/probe/baand.js`): i en egen fane pakkes `_generateStairSurfaces` inn mens de ni trappetestene
kjører (hestesko, regresjon, sone, bygger 110, bygger 193, side, 191, 192 og manuelt sett). Hver unik trapp regnes
med:

- **dagens formel**, ordrett fra `_renderStairSidePrintImages`: dybde / (Σ opptrinn på trinnflater + 17), der repos
  teller 0
- **høydekjeden**: dybde / `_stairSideTotalHeightCm`. Kjeden har allerede med opptrinnet til gulvet over, og det er
  det +17 forsøker å tilnærme, så det legges ikke til 17 en gang til.

Testene ga samme resultat med innpakningen som uten: 274/274, 45/45, 106/106, 59/59, 31/31, 25/25, 15/15, 40/40 og 42/42.

**Resultat: 141 unike trapper, og 0 bytter båndantall.** Dagens formel gir 138 trapper med 1 bånd, 2 med 2 bånd og 1
med 3 bånd, og kjeden gir nøyaktig det samme. Medianforholdet er 1,95. Hele tabellen, sortert etter avstand til
grensene, står i **`docs/202/BAAND-TABELL.md`**.

De tolv trappene nærmest grensene 4 og 8:

| Test | Retning | Trapp | Dybde | H dagens → kjede | Forhold dagens → kjede | Bånd | Bytter |
|---|---|---|---|---|---|---|---|
| hestesko | nedenfra | 1×17/24 + R120 | 144 | 34 → 34 | 4,24 → 4,24 | 2 → 2 | nei |
| bygger193 | nedenfra | 1×17/30 + R120 | 150 | 34 → 34 | 4,41 → 4,41 | 2 → 2 | nei |
| regresjon | nedenfra | 6×17/30 + R140 + R90 | 410 | 119 → 135 | 3,45 → 3,04 | 1 → 1 | nei |
| hestesko | nedenfra | hestesko, 1 trinn, topp 470×70 (to varianter) | 116 | 51 → 34 | 2,27 → 3,41 | 1 → 1 | nei |
| manuelt | nedenfra | R120 + 4×16/32 | 248 | 81 → 80 | 3,06 → 3,10 | 1 → 1 | nei |
| bygger110 | nedenfra | 10×17/50 + R140 + 6×16/28 | 808 | 283 → 299 | 2,86 → 2,70 | 1 → 1 | nei |
| hestesko | nedenfra | 3×17/24 + R120 | 192 | 68 → 68 | 2,82 → 2,82 | 1 → 1 | nei |
| hestesko / regresjon | nedenfra | 4×17/30 + R120 | 240 | 85 → 85 | 2,82 → 2,82 | 1 → 1 | nei |
| bygger193 | begge | 4×17/30 + R90 + R90 + 4×17/30 | 420 | 153 → 187 | 2,75 → 2,25 | 1 → 1 | nei |

Trappa med 3 bånd er en hestesko med 350 cm front og forhold 15,91 → 15,91, altså langt over 8.

**Hvilken vei avviket går (målt):**

- **Repos midt i eller under trinn** (20 trapper): kjeden er **høyere** (153 → 170, 157 → 175, 283 → 316 med to
  repos). Forholdet faller, og et bytte kan bare gå **ned** (2 → 1, 3 → 2). Det er feilen 193 pekte på.
- **Hestesko med toppflaten i plan med gulvet over** (`topLevel: 'flush'`, alle 9; `docs/202/probe/hs2.js`): kjeden er
  **lavere** (51 → 34, 102 → 85, 204 → 187). Dagens formel teller toppflaten som et trinn (den er `tread`, ikke
  `landing`) **og** legger til +17 for gulvet over. Kjeden har ikke noe opptrinn over en toppflate som ligger i plan med
  gulvet over. Forholdet stiger, og et bytte kan gå **opp** (1 → 2, 2 → 3). Hesteskoer uten `topLevel` har samme høyde
  etter begge formler.
- **Trinnhøyde 16** (8 trapper): kjeden er 1 cm lavere (145 → 144), fordi dagens formel alltid legger til 17, ikke
  trinnhøyden. Det gir ±0,01 i forholdet og har ingen betydning i praksis.
- 104 trapper har samme høyde etter begge formler, blant annet alle rette trapper uten repos med 17 cm trinn, og
  trapper med repos øverst.

**Bytter finnes, men bare i trapper testene ikke har** (konstruert, `docs/202/probe/konstr.js`, 17/30-trinn):

| Konstruert trapp | Dybde | H dagens → kjede | Forhold | Bånd |
|---|---|---|---|---|
| 1 + R120 + 1 | 180 | 51 → 68 | 3,53 → 2,65 | 1 → 1 |
| 1 + R150 + 1 | 210 | 51 → 68 | 4,12 → 3,09 | **2 → 1** |
| 1 + R180 + 1 | 240 | 51 → 68 | 4,71 → 3,53 | **2 → 1** |
| 2 + R200 + 2 | 320 | 85 → 102 | 3,76 → 3,14 | 1 → 1 |
| 1 + R150 + R150 + 1 | 360 | 51 → 85 | 7,06 → 4,24 | 2 → 2 |
| 2 + R300 + R300 + 2 | 720 | 85 → 119 | 8,47 → 6,05 | **3 → 2** |

Felles for dem er få trinn og mye repos: en lang gang eller rampe med ett eller to trinn i hver ende.

**⚠ Trapper i kundenes egne prosjekter er IKKE målt.** Det krever databasetilgang, og denne økten har ingen
innlogging. Jeg gir ikke noe anslag. Tabellen over gjelder bare trappene i testene og de konstruerte eksemplene.
`baand.js` kan kjøres på et åpent prosjekt med en liten endring (løkke over `S.stairs` i stedet for testene). Se
SPØRSMÅL 3.

## Tester

| Test | Resultat |
|---|---|
| **Ny `_stairBuilderTextRegressionTest202`** | **22/22.** Begge retninger × fem rendringsveier: første visning, `_stairBuilderRefreshPreviewStats` uten endring (byte-lik HTML med første visning), endret antall (`_stairBuilderUpd`), «＋ Trinn» (`_stairBuilderRefreshSegs`) og bytte av byggeretning i nedtrekket. Sjekker etiketten, «til gulvet over», at «cm høyde» er borte, og at forklaringslinja finnes og står under bildet. I tillegg: ny trapp = «34 cm til gulvet over», og etikettene er symmetriske uten pil. |
| Trappetestene | hestesko 274/274, regresjon 45/45, manuelt sett 42/42, sone 106/106, bygger 110 59/59, side 25/25, 191 15/15, 192 40/40, 193 31/31. **Ingen forventninger er endret.** |
| PDF byte-identisk med HEAD (`docs/202/probe/pdf.mjs`, dato og fil-ID låst) | Tre trapper: «4 + R120 + 6» (repos, 1 bånd), «8 trinn» (uten repos, 1 bånd) og «1 + R150 + 1» (repos, 2 bånd i dag). HEAD og etter: 15 sider, 36 576 905 byte, sha256 `c59b10850dab197960feb10a282ccaac777c0aa0c38aadba6d5703a847744416`, **identiske**. Et nytt bygg av arbeidskopien ga samme hash, så sammenligningen er deterministisk. |
| Hele regresjonssettet mot HEAD (`docs/202/probe/alle.mjs` + `sammenlign.js`) | **67 av 67 like med HEAD**, 0 ulike, og 1 ny (`_stairBuilderTextRegressionTest202` 22/22). De sju røde er røde på HEAD også og krever innlogging eller kart: prosjektlås 66/67, kundeforslag 270/271 og fem `_geo*`-tester som kaster. |

## Harness

`docs/202/probe/`: `dialog.mjs` (bilder og breddemåling, `TAG`/`W`/`SEGS`), `tests.js` + `runf.mjs` (trappetestene),
`baand.js` (måling D), `baand.json` (rådata), `konstr.js`, `pdf.mjs` (PDF mot HEAD; HEAD-kopien er slettet før
commit), `alle.mjs` + `sammenlign.js`. Kjøres mot `serve-varmeplan.js` på 4000 og headless Chrome på 9333.
