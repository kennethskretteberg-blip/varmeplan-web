# 203 · Trapp: svar på 202 — etiketten sier «trinn 1 først», og PDF-ens båndinndeling bruker høydekjeden

Committet på `main`, **ikke pushet**. Ingen ny SQL. Kenneths svar står under hvert spørsmål i `docs/202/SPØRSMÅL.md`.

## Kort fortalt

- **Etiketten** over segmentlista er nå «SEGMENTER (trinn 1 først)», med samme tekst i begge byggeretninger. Ordene
  «øverste» og «nederste» er borte.
- **PDF-ens båndinndeling** av sidevisningen regner nå høyden med høydekjeden (`_stairSideTotalHeightCm`), uten +17.
  Grensene 4 og 8 og `_stairSurfaceBands` er ikke endret.
- **Kryssjekk mot 202:** alle 141 trappene får nøyaktig det tallet «Kjede»-kolonnen viste. 138 får 1 bånd, 2 får 2 og 1 får 3,
  og ingen bytter.
- **PDF:** «4 + R120 + 6» og «8 trinn» er byte-identiske med HEAD. «1 + R150 + 1» går fra 2 til 1 bånd og fra 6 til 5 sider.

## STEG 0: funn med linjenummer (HEAD 6b8706f)

| Prompten sa | Fant | Avvik |
|---|---|---|
| `_stairBuilderSegLabelText()` ca. 69729, én hjelper for begge rendringsveier | 69729. Brukt av dialogens HTML (69787) og `_stairBuilderRefreshSegs` (69855), ingen andre steder | — |
| Kommentar over hjelperen ca. 69725–69728 | 69725–69728 | — |
| Kommentar ved ca. 69570 | **69642–69646** (blokken som starter med 110-kommentaren ved 69636) | Ca. 70 linjer lenger ned. Linje 69570 er hesteskobyggeren. |
| `_stairSideTotalHeightCm(stair)` ca. 47811 | 47811 | — |
| `_renderStairSidePrintImages` ca. 90343 | **90424** | Ca. 80 linjer lenger ned. Formelen var som beskrevet: `totalD / max(Σ opptrinn på ikke-repos + 17, 1)` |

**Hestesko med `topLevel: 'flush'` gir et riktig tall, så det var ingen grunn til å stoppe.** `docs/203/probe/hs2.js` mot HEAD:
høydekjeden gir 34, 85 og 187 for 1, 4 og 10 trinn, altså (antall + 1) · 17. Det stemmer med trappa: toppflaten ligger
ett opptrinn over det øverste trinnet og er selv gulvet over, så det kommer ikke noe opptrinn over den. Det samme tallet
står i hesteskobyggerens oppsummering, og hesteskotesten låser det allerede: `exp = (n + (tl === 'flush' ? 1 : 2)) * 17`
(linje 57345 på HEAD) og «flush 85 / below 102». `below` gir (antall + 2) · 17, som er det samme som den gamle formelen.

## Hva er endret (alt i `index.html`)

| Sted (linje nå) | Endring |
|---|---|
| `_stairBuilderSegLabelText()` (69771) | Returnerer `'SEGMENTER (trinn 1 først)'` og leser ikke `_stairBuilderDir`. |
| Kommentaren over hjelperen (69766–69770) | Lista er **trinnrekkefølgen**. Første rad er `segs[0]`, altså trinn 1 og trappas fysisk nederste trinn, i begge byggeretninger. Byggeretningen styrer bare hvor trinn 1 tegnes. Den gamle etiketten står i kommentaren. |
| Kommentaren ved segmentlista (69680–69685) | Skrevet om på samme måte. Den sa før «inntastingsrekkefølgen … symmetrisk». |
| Ny `_stairSidePrintBandCount(stair)` (90470) | `ratio = Σ d_cm / max(_stairSideTotalHeightCm(stair), 1)` og `> 8 → 3, > 4 → 2, ellers 1`. Kommentaren over forklarer de to feilene som gikk hver sin vei. |
| `_renderStairSidePrintImages` (90479) | `_stairSurfaceBands(surfs, _stairSidePrintBandCount(stair))`. Resten er uendret. |

Formelen ligger i en egen hjelper og ikke inne i `_renderStairSidePrintImages`. Da kan kryssjekken og testen lese
båndantallet uten å tegne lerreter, og uten at `_stairSurfaceBands` skjuler tallet når trappa har bare én flate. Det er
fortsatt én formel, og den har én bruker.

Ikke rørt: forklaringslinja under forhåndsvisningen, statistikklinja, «til gulvet over», `_stairSurfaceBands`, grensene
4 og 8, tegningen på skjerm, kabel, panel og høydekjeden.

## Bilder av etiketten (`docs/203/`, 900 px, 4 trinn + repos 90 + 4 trinn)

| | Nedenfra og opp | Ovenfra og ned |
|---|---|---|
| Før (HEAD) | `dialog-900-nedenfra-for-a.png`: «SEGMENTER (nederste først)» | `dialog-900-ovenfra-for-a.png`: «SEGMENTER (øverste først)» |
| Etter | `dialog-900-nedenfra-etter-a.png`: «SEGMENTER (trinn 1 først)» | `dialog-900-ovenfra-etter-a.png`: «SEGMENTER (trinn 1 først)» |

Tekstene er lest fra DOM-en (`docs/203/probe/dialog-900-{for,etter}.json`).

## Kryssjekk mot 202 (`BAAND-TABELL.md`)

`docs/203/probe/baand.js` er 202-målingen med ett felt til, `bNy`, som er `_stairSidePrintBandCount` fra den nye koden.
Den bruker de samme ni trappetestene og den samme innpakningen av `_generateStairSurfaces`. `kryss.js` sammenligner
resultatet rad for rad med `docs/202/probe/baand.json`:

```
kjøring 203: 191 15/15 · 192 40/40 · hestesko 274/274 · regresjon 45/45 · sone 106/106 · bygger110 59/59 · bygger193 31/31 · side 25/25 · manuelt 42/42
rader 202/203: 141 141
samme trapp på samme rad: 141 · avvik bNy ≠ bKjede(202): 0
bånd ny kode: {"1":138,"2":2,"3":1} · 202 kjede: {"1":138,"2":2,"3":1} · 202 dagens: {"1":138,"2":2,"3":1}
bytter (gammel formel → ny kode): 0
```

Alle 141 er identiske med «Kjede»-kolonnen, så målingen og endringen stemmer overens.

## PDF (`docs/203/probe/pdf.mjs`, én PDF per trapp, dato og fil-ID låst)

| Trapp | HEAD | Etter | |
|---|---|---|---|
| 4 + R120 + 6 | 6 sider, 1 bånd, `ac2bf1c30fb7f547e0fc104c8fbfbd9dc0cb798ed2d8375c17154334201c9de5` | samme | **byte-identisk** |
| 8 trinn | 3 sider, 1 bånd, `e3b98900bfc5e0cd46556d1234613642c8d26b2c1255e4f7c20959e4f2af6746` | samme | **byte-identisk** |
| 1 + R150 + 1 | **6 sider, 2 bånd**, `cbe497eb027ecd2cfde1130a550d335e152c24d4de8886329a10d772117c677d` | **5 sider, 1 bånd**, `e64c330bc90fa50d87f3791dbf0d23ab5c8da5565445e6217d78112d52dbae01` | ulik, som ventet |

I 202 lå de tre trappene i én felles PDF. Her bygges én PDF per trapp, slik at hver trapp kan sammenlignes for seg.

## Tester

| Test | Resultat |
|---|---|
| **Ny `_stairSideBandRegressionTest203`** | **8/8.** 8 trinn: 1 bånd. 4 + R120 + 6: 1. 1×17/24 + R120: 2 (uendret). 1 + R150 + 1: **1** (før 2). 2 + R300 + R300 + 2: **2** (før 3). Hestesko med 1 trinn og topp 470×120 i plan: høyde 34 og **2** bånd (før 1). Samme hestesko med eget trinn: 51 og 1 (uendret). `_renderStairSidePrintImages` gir ett bilde for 1 + R150 + 1. |
| `_stairBuilderTextRegressionTest202` (utvidet) | **24/24** (før 22). Se under. |
| Trappetestene | Hestesko 274/274, regresjon 45/45, sone 106/106, bygger 110 59/59, bygger 193 31/31, side 25/25, 191 15/15, 192 40/40 og manuelt sett 42/42. **Ingen forventninger er endret.** |
| Hele settet mot HEAD (`alle.mjs` + `sammenlign.js`) | 67 av 68 er like med HEAD. **1 er ulik**, og det er ventet: `_stairBuilderTextRegressionTest202` gikk fra 22/22 til 24/24 fordi forventningene er endret (se under). **1 er ny**: `_stairSideBandRegressionTest203` med 8/8. Ingen test som ikke gjelder trapper har endret tall. De samme sju er røde på HEAD og etter, og de krever innlogging eller kart: prosjektlås 66/67, kundeforslag 270/271, og fem `_geo*`-tester som kaster. |

**Endrede forventninger i `_stairBuilderTextRegressionTest202`** (de gamle verdiene står i en kommentar i testen):

- `LBL` var `{ bottom: 'SEGMENTER (nederste først)', top: 'SEGMENTER (øverste først)' }`. Nå er den
  `'SEGMENTER (trinn 1 først)'` for begge. Alle etikettsjekkene som før låste 202-tekstene, bruker `LBL`: første visning,
  etter «＋ Trinn» og etter bytte i nedtrekket, i begge retninger.
- Sjekken «etikettene er symmetriske (begge «… først)», ingen pil)» er fjernet. Etter at begge tekstene er like, sier den
  ingenting. Den er erstattet av tre nye sjekker:
  - Alle sju etikettene testen leser, fra tre rendringsveier i begge retninger og fra en ny trapp, er «SEGMENTER (trinn 1 først)».
  - Ingen av dem inneholder «øverste», «nederste», «topp → bunn» eller «bunn → topp».
  - Hjelperen gir samme tekst for `top` og `bottom`.

## Harness

`docs/203/probe/`: `runf.mjs` + `t.js` kjører de to testene. `hs2.js` er STEG 0 for hesteskoen. `baand.js` + `kryss.js`
er kryssjekken, og `baand.json` er rådataene. `pdf.mjs` tar `IDX=0|1|2` og `TAG=head|etter`. `dialog.mjs` lager bildene
og tar `URL0` for HEAD. `alle.mjs` + `sammenlign.js` kjører hele settet. Alt kjøres mot `serve-varmeplan.js` på port 4000
og headless Chrome på 9333. HEAD-kopien `docs/203/probe/head/` og PDF-filene er slettet før commit.
