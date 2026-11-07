# 193 · Trapp: byggerens høyde går til gulvet over, og forhåndsvisningen følger tegningen

Committet på `main`, **ikke pushet**. Ingen ny SQL.

## Kort fortalt

- **Høyden i byggeren er nå det samme tallet som høydekjeden i sidevisningen**, altså fra bakken til gulvet over.
  Byggeren har ikke lenger en egen formel. Den lager en midlertidig trapp av segmentene i dialogen og regner med de
  samme hjelperne som tegningen.
- **Forhåndsvisningen i byggeren tegner samme profil som sidevisningen, i begge byggeretninger.** Med «Ovenfra og ned»
  ble den før tegnet speilvendt, med første segment øverst. Nå ligger første segment nederst til venstre, som i
  tegningen.
- **«Maks CC repos» i dialogen for ny trapp vises bare når byggeren har minst ett repos.** Feltet skjules, men
  fjernes ikke, så et tall du har skrevet står der fortsatt når du legger til et repos igjen.
- Tegningen, kabelen, PDF-en og panelet er ikke rørt. Alle 66 gamle regresjonstester gir nøyaktig samme resultat
  som HEAD.

## Hva du ser forskjellig

| Trapp | Byggeren før | Byggeren nå = kjeden |
|---|---|---|
| repos + 6 × 17 | 102 | **119** (7 × 17) |
| 4 + repos + 4 (17) | 153 | **170** (10 × 17) |
| 4 × 17 + repos + 4 × 18 | 157 | **175** (5 × 17 + 5 × 18) |
| 6 + repos øverst | 119 | 119 (uendret: ingen opptrinn over et repos øverst) |
| 8 trinn uten repos | 136 | **153** (9 × 17) |
| ny trapp, 1 trinn (standard i dialogen) | 17 | **34** (opp på trinnet og opp til gulvet over) |

Alle trapper med et trinn øverst får altså **+1 opptrinn** i byggeren. Det er opptrinnet fra øverste trinn til
gulvet over, og det har høydekjeden alltid hatt med (178/183). For hesteskotrapper gjorde 183 dette allerede.

## Testene fra prompten

| # | Test | Resultat |
|---|---|---|
| 1 | repos + 6 × 17 og 4 + repos + 4: byggerens høyde = høydekjeden | 119 = 119 og 170 = 170, i begge byggeretninger ✔ |
| 2 | «Ovenfra og ned»: forhåndsvisningen har samme rekkefølge som tegningen | ✔ Se bildene under. Testen sammenligner også hvert hjørne i forhåndsvisningen med tegningens profil for 6 trapper × 2 retninger. |
| 3 | Ny trapp uten repos: «Maks CC repos» skjult; legg til repos → vises | ✔ Testet med ekte museklikk på «＋ Repos» (`dialog-uten-repos.png` → `dialog-med-repos.png`). Fjernes reposet, skjules feltet igjen, og verdien står. |
| 4 | Gamle trapptester og 192-testen | Alle grønne: hestesko 274, regresjon 45, manuelt sett 42, sone 106, bygger 59, side 25, 191 15, 192 40. |

**Forventninger som er endret (forklart):** tre sjekker i `_stairReposRiserRegressionTest191` låste byggerens gamle
høyde. De er endret til kjedens tall, med de gamle i en kommentar: 102 → 119, 153 → 170 og 157 → 175. Sjekken
«6 + repos øverst = 119» er uendret. Ingen andre forventninger er endret.

**Bred regresjon mot HEAD** (`docs/193/probe/alle.mjs` + `sammenlign.js`, HEAD-kopi på port 4193): 66 av 66 tester
er like med HEAD. Den nye `_stairBuilderHeightRegressionTest193` gir 31/31. De sju røde er røde på HEAD også og
krever innlogging eller kart (prosjektlås, kundeforslag og fem kart-tester).

## Bilder (`docs/193/`)

For hver trapp er det fire bilder, `<trapp>-{nedenfra,ovenfra}-{for,etter}.png`. Til venstre ser du byggerens tall og
forhåndsvisning, og til høyre tegningens sidevisning med høydekjeden:

- `repos-6-ovenfra-for.png`: byggeren sier **102**, og reposet ligger **øverst**. Tegningen sier 119, og reposet ligger
  nederst. `…-etter.png`: begge sier 119, og reposet ligger nederst i begge.
- `4-repos-4x18-ovenfra-for.png`: før var forhåndsvisningen speilet, med 18-trinnene nederst og uten opptrinn fra
  reposet. Etter er rekkefølgen som i tegningen, og tallet er 175.
- `4-repos-4-*` og `6-repos-*`: samme sammenligning. `6-repos` har det samme tallet før og etter.
- `dialog-uten-repos.png` / `dialog-med-repos.png`: «Maks CC repos» vises først når reposet er lagt til.

## Endringslogg (alt i `index.html`)

- Ny `_stairBuilderPreviewStair()` lager en midlertidig trapp av segmentene, byggeretningen og standardhøyden.
  Standardhøyden er trappas egen ved redigering, ellers første trinnsegment, som er det «Plasser trapp» lagrer.
  Flatene kommer fra `_generateStairSurfaces`.
- `_stairBuilderStats`: høyden = `_stairSideTotalHeightCm` (som leser `_stairGeometryDims('side')`), avrundet som
  målene (`_stairDimRound`). Trinn, dybde og repos telles som før.
- `_stairBuilderPreviewSVG`: tegner profilen med `_stairGroundRiserCm` og `_stairSideRiserCm`, i flatenes egen
  rekkefølge. Den snur ikke lenger for «Ovenfra og ned».
- `_stairBuilderLandingRiserCm` (191) er fjernet, siden den ikke brukes lenger.
- Dialogen for ny trapp: «Maks CC repos» har fått `id="stair-landing-cc-wrap"` og vises eller skjules i
  `_stairBuilderRefreshPreviewStats`. Alle endringer av segmentene går gjennom den funksjonen.
- Ny test `_stairBuilderHeightRegressionTest193()`, og tre forventninger er oppdatert i 191-testen (se over).
- Kenneths svar er skrevet under hvert spørsmål i `docs/191/SPØRSMÅL.md`.

## Verdt å vite

- **Høydetall i panel og PDF:** det finnes ikke noe høydetall der utenom høydekjeden, og den kommer allerede fra
  `_stairGeometryDims`. Den er derfor ikke endret. PDF-en har én egen høydeformel igjen, i
  `_renderStairSidePrintImages`. Den viser ikke noe tall, men avgjør om sidevisningen deles i 1, 2 eller 3 bånd.
  Den er ikke rørt, fordi en endring kan flytte sideinndelingen i eksisterende PDF-er (se SPØRSMÅL 2).
- Etiketten «SEGMENTER (topp → bunn)» for «Ovenfra og ned» står som før. Nå som forhåndsvisningen legger første
  segment nederst, peker etiketten motsatt vei av bildet rett under (se SPØRSMÅL 1).

Harness: `/tmp/cdp193`, kopiert til `docs/193/probe/` (`shots.mjs`, `dialog.mjs`, `tests.js`, `runf.mjs`,
`alle.mjs`, `sammenlign.js`).
