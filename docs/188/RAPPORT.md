# 188 · Trapp: svar på 187 og «Bla i kabler»

`main`, ikke pushet. Commit «188: …». Alt ligger i `index.html`. Svarene dine står under hvert spørsmål i
`docs/187/SPØRSMÅL.md`.

Harness: headless Chrome på port 9333 (`/tmp/cdp187`). Ny kode på 4000, HEAD (`294b4cd`, samme kode som `c28cf0d`)
på 4187 fra `git archive` i `/tmp/old187`. Katalogen er den syntetiske fra 176–187 (InSnow 30T: 20, 30, 40,1, 49,7,
55, 60, 70, 78,7, 89,1, 98 m). Testtrappene har opptrinn/nese 2. Ingen skyprosjekter er rørt.

## Kort svar

| Ønske | Nå |
|---|---|
| **187/1 · valgt forslag ved åpning** | Løses på nytt som et manuelt sett: samme kabler, marginen løses så kabelen går opp. VK 31 lagret på 19,4 åpnes nå på **21,1, «Passer»**. Går settet fortsatt ikke opp, står forslaget og marginen som lagret, og avviket vises som før. |
| **187/4 · «til overs» for alle trapper** | Gjelder nå også rette trapper. Overskuddet står **stort og gult** øverst på kortet («1.1 m til overs», 15 px), med grunnen under. I panelet står det gult i 13 px. |
| **187/5 · ruten i plan på rette trapper** | Telles nå (Regel 5 er lik for alle: opptrinn + ruten i plan). 240 → repos 100 med utgang høyre: **+147 cm**. Like brede trinn: **+4 cm per overgang** (se spørsmål 1). Lagrede trapper regnes om ved åpning. |
| **187/2, 3, 6** | Ingen endring. |
| **Bla i kabler** | Ny linje nederst i forslagsdialogen med ▲/▼ (piltastene virker også). Den viser passformen live for hver enkeltkabel. «Bruk denne kabelen» legger kabelen ut som manuelt sett. |
| **Funn (rettet)** | Forslag på trapper med repos ga «Passer» i kortet, men «for kort» etter Velg. Se avsnitt 5. |

## 1 · Rette trapper: endret behov og forslag (tabell)

«Behov» er behovet ved minste avstand. «Etter Velg» er panelet rett etter at Forslag A er valgt. «Åpnet igjen» er en
trapp lagret med HEAD-forslaget og åpnet i ny kode.

| Rett trapp | Behov (m) | Forslag HEAD | Forslag nå | Etter Velg HEAD → nå | Åpnet igjen |
|---|---|---|---|---|---|
| 8 trinn 120 | 36,39 → 36,67 (+28) | 30 @ 15 | 30 @ 15,4 · 30 @ 15,6 | Passer → Passer | 15 står, «0.3 m for kort» (30 m trenger 15,4, over 75 %-taket 15) |
| 8 trinn, topp-start | 36,39 → 36,67 | 30 @ 15 | 30 @ 15,4 · 30 @ 15,6 | Passer → Passer | som over |
| Trinn + repos + trinn (120) | 49,76 → 50,14 (+38) | 49,7 @ 5,1 | **49,7 @ 7,9** | **2.2 m for kort** → Passer | 5,1 → **7,9, Passer** |
| Bred 240, 10 trinn | 93,53 → 93,89 (+36) | 89,1 @ 10,5 · 20+70 @ 9,4 | 89,1 @ 11 · 20+70 @ 9,9 | Passer → Passer | 10,5 → 11, Passer |
| To kabler, 14 trinn 210 | 114,21 → 114,73 (+52) | 55+55 @ 8,8 | 55+55 @ 9,2 · @ 9,5 | Passer → Passer | 8,8 → 9,2, Passer |
| Soner (4 trinn + repos) | 56,68 → 56,80 (+12) | ingen | ingen | — | — |
| Frydenbø 8 trinn 240 (32/16) | 74,72 → 75,00 (+28) | 70 @ 12,4 | 70 @ 12,8 · 20+55 @ 5 | Passer → Passer | 12,4 → 12,8, Passer |
| Trinn 240 (4) + repos 100 | 48,28 → 48,47 (+19) | 40,1 @ 19,6 (×2) | **49,7 @ 6** | **1.2 m for kort** → Passer | 19,6 står, «1.4 m for kort» |
| **Trinn 240 (1) + repos 100, utgang H** | 17,87 → **19,34 (+147)** | ingen | **20 @ 5, gult, 0,7 m til overs** | — → «66 cm til overs» | (ingen lagret) |
| **Trinn 240 (3) + repos 100, H-V-H** | 32,01 → **33,56 (+155)** | 30 @ 9,8 | 30 @ 13,5 · 30 @ 16,8 | Passer → Passer | 9,8 står, **rødt «1.5 m for kort!»** (spørsmål 2) |
| Smal 120 × 6, gulv 2 | 28,69 → 28,89 (+20) | ingen | **30 @ 2, gult, 1,1 m til overs** | — → «1.1 m til overs» | (ingen lagret) |

Slik leser du tabellen:
- **Like brede trinn:** behovet øker med 4 cm per overgang (nese 2 + opptrinn 2). Det er 0,2–0,8 %, ikke under 1 cm.
  Se spørsmål 1.
- **240 → repos 100 med utgang høyre:** +147 cm per slik overgang (140 tvers over trinnet + 7), som målt i 187.
- **Nye «til overs»-forslag (187/4):** tre rette trapper som før ikke fikk noe forslag, eller fikk et som var for
  kort etter Velg, får nå det korteste settet innenfor 5 %, på gulvet og gult.
- **Åpnet igjen:** fire trapper går opp etter omregningen. Tre står som lagret, fordi settet ikke kan løses innenfor
  75 % (spørsmål 2). De viser avviket slik du ba om.

### Hesteskotrapper (kontroll)
Alle 11 testtrappene fra 187 har **samme behov og samme forslag som HEAD**. Ruten i plan var alt telt der.
Åpnet igjen med HEAD-forslaget står alle på «Passer» (BRED på «1.5 m til overs»). VK 31 lagret før 187 (60 m @ 19,4,
som 187 åpnet med «0.4 m for kort») åpnes nå på 21,1 med «Passer». Det er test 188.1.

## 2 · «Bla i kabler» (nytt)

- Nederst i forslagsdialogen, for rette trapper og hestesko: **Bla i kabler ▲ ▼**, kabelnavn, «6 av 10» og
  **Bruk denne kabelen**. Dialogen får fokus når den åpnes, så **↑ / ↓** virker med en gang (også etter klikk på en
  knapp i dialogen). Raden er lagt inn i hurtigtast-panelet (`_SHORTCUTS`).
- Lista er enkeltkablene i trappas produktgruppe, sortert etter lengde. Den starter på kabelen nærmest behovet
  (VK: 60 m, behovet er 64,2 m).
- Tallene kommer fra `_stairFitFixedSet`, den samme løseren som manuelt sett og Forslag bruker (med stigningen fra
  187). Den har fått noen ekstra felt i svaret, men ingen ny regning. Testen sjekker at marginen i linja er lik det
  manuelle settets margin for alle kabler.

VK 31, alle ti kablene:

| Kabel | Linja |
|---|---|
| 20 · 30 · 40,1 m | rødt: «31.7 / 21.7 / 11.6 m for kort ved største avstand (58.8 cm). Måtte trukket svingene inn 203 / 157,5 / 111,6 cm, over grensen (under 75 % varmet bredde)» |
| 49,7 m | rødt: «2.0 m for kort ved største avstand (58.8 cm). Måtte trukket svingene inn 68.0 cm, over grensen (under 75 % varmet bredde)» |
| 55 m | turkis: «9.2 m for kort ved minste avstand (2.0 cm). Passer hvis svingene trekkes inn 43.9 cm fra sidene» |
| **60 m (start)** | turkis: «4.2 m for kort ved minste avstand (2.0 cm). Passer hvis svingene trekkes inn 21.1 cm fra sidene» |
| 70 · 78,7 · 89,1 · 98 m | rødt: «5.8 / 14.5 / 24.9 / 33.8 m til overs (over 5 %)» |

Med en 64 m-kabel i katalogen (bare for bildet) står det grønt **«Passer med 3.0 cm fra sidene»** (`5-vk-bla-64-passer.png`).

Fargene: grønt = passer, turkis = passer hvis svingene trekkes inn, gult = til overs 2–5 %, rødt = går ikke eller
over 5 %, dempet = til overs under 2 %.

**Bruk denne kabelen:** avbryter en eventuell forhåndsvisning (tilbake til trappa linja regnet på). Så legges
kabelen ut som manuelt sett, samme vei som kabelvalget i panelet (`_stairApplyManualCables`), med ett angresteg.
Dialogen lukkes. Testet på VK: 60 m → 21,1, «Passer», samme tall som linja viste (`4-vk-bruk-denne-kabelen.png`).
Knappen er grå i 060-lesemodus og kundemodus.

**Ikke laget:** svak forhåndsvisning i planen. Utlegget tegnes fra `stair.runs`, så det ville krevd en egen
skyggeutgave av tegneren. Si fra om du vil ha det.

Bilder: `1-vk-bla-60-passer-hvis.png`, `2-vk-bla-70-til-overs.png`, `3-vk-bla-55-passer-hvis.png`,
`3b-vk-bla-49-gaar-ikke.png`, `4-vk-bruk-denne-kabelen.png`, `5-vk-bla-64-passer.png`.

## 3 · «Til overs» tydelig (187/4)

- **Kortet:** gul boks øverst med «1.1 m til overs» i 15 px fet skrift. Under står grunnen: «Kortere kabler ville gitt
  under 75 % varmet bredde», «… måtte gått forbi hjørnet» (hestesko) eller «Korteste kabel er lengre enn behovet».
  Boksen er gul også under 2 % (BRED B), som du ba om.
- **Panelet:** «🟡 1.1 m til overs» i 13 px, gult. Det gjelder alle sett som er for lange med under 5 %, ikke bare
  forslag.
- Bilder: `6-rett-120x6-forslag-for.png` (HEAD: ingen forslag, bare melding) og `-etter.png`,
  `7-rett-120x6-panel-etter.png`, `8-bred-forslag-for/etter.png`.

## 4 · Ruten i plan telles for rette trapper (187/5)

- `generateStairCable`: hver overgang er nå opptrinnet + ruten i plan for alle trapper. Rette trapper bruker
  `conn.exitRight`, samme regel som tegneren (`_stairConnPlanRoute`), så tegning og lengde er enige. En overgang over
  en sonegrense tilhører ingen kabel og får ingen rute.
- `_stairMarginProbe`: stigningen måles nå for alle trapper. Står ruten stille når marginen endres (like brede trinn,
  240 → repos 100), er den målte stigningen 2 × strenger, og da brukes det tallet eksakt.

## 5 · Funn: Forslag på trapper med repos (rettet)

`_applyStairProposal` legger reposet ut med forslagets repos-CC (= trinnets CC, for eksempel 8,7), men settet ble
løst med trappas egen «Maks CC repos» (10). Reposet fikk da flere strenger etter Velg enn i regnestykket.

- Trinn + repos + trinn (120): kortet sa 49,7 m @ 5,1 «Passer», men etter Velg sto det **«2.2 m for kort»**. Det gjaldt
  også på HEAD.
- Nå regnes forslaget med repos-CC-en det legger ut: 49,7 m @ 7,9, og «Passer» etter Velg.
- Samme feil ga «1.2 m for kort» på 240 (4) + repos 100 og «1.6 m for kort» på testen A3 (4 trinn + repos 180).
- Hesteskotrapper og trapper uten repos er ikke berørt.

Under arbeidet: **Avbryt** etter en forhåndsvisning satte ikke tilbake strengantallet (`runsPerStep`). Etter å ha
forhåndsvist 3/3-forslaget ble det stående med dine egne dybdemarginer. Det er rettet (test 188.5).

## Endringer (endringslogg)
- **`generateStairCable`**: ruten i plan for alle trapper (rette via `conn.exitRight`), ingen rute over sonegrense.
- **`_stairMarginProbe`**: målt stigning for alle trapper, eksakt 2 × strenger når ruten står stille.
- **`_stairSolveExactCableSet`**: «korteste sett ≤ 5 % for langt» for alle trapper, og `overWhy` (kortest | arm | 75).
- **`_generateStairProposals`**: regner med forslagets repos-CC (funn 5), og bærer `overWhy`.
- **`_renderStairProposalPanel`**: gul boks med stort «til overs» og grunnen, «Bla i kabler», fokus og piltaster.
- **`_renderStairSettingsPanel`**: «til overs» gult og 13 px (`stair-fit-over`).
- **`_stairFitFixedSet`**: ekstra felt i svaret (`neededAtFloor_cm`, `sum_cm`, `wantMargin_cm`, `capMargin_cm`, `limit`,
  `shortAtCap_cm`, `over`). Ingen endret oppførsel.
- **Nye**: `_stairBrowseCables`, `_stairBrowseBasis`, `_stairBrowseCableInfo`, `_stairBrowseInit`, `_stairBrowseHtml`,
  `_stairBrowseStep`, `_stairBrowseUse`, `_stairBrowseKey`, `_stairReopen`.
- **`_restoreProject`**: alle trapper regnes om ved åpning (`_stairReopen`). Et valgt forslag løses på nytt
  (`_stairResolveMarginForSet` med `keepOnFail`). Ingenting lagres.
- **`_stairPreviewProposal` / `_stairCancelPreview`**: `runsPerStep` med i øyeblikksbildet.
- **`_SHORTCUTS`**: ↑ / ↓ «Bla i kabler».

## Test

| | resultat |
|---|---|
| `_stairHorseshoeRegressionTest` | **252/252** (235 → 252) |
| `_stairRegressionTest` | 47/47 |
| `_stairManualSetRegressionTest` | 42/42 |
| `_stairZoneRegressionTest102` | 106/106 |
| `_stairBuilderMoveRegressionTest110` | 59/59, uendret |
| `_stairSideRegressionTest` | 25/25, uendret |

Endrede forventninger (alle forklart i koden med «188»):
- Ruten i plan (+4 cm per overgang): Frydenbø 70 m @ 12,4 → **12,8** (084-test 1/2, B1, G3, J17, J27), varmet bredde
  215,2 → 214,4, B 25+49,7 → 5+70, A1/A2-fasitene, soneauto `1:30@12.8` → `13.2` og `3:45@13` → `13.4`, B3 23,2 → 23,6,
  J4 4850 → 4859, J9 ~4885 → ~4905, C8 innenfor ett mm-snapp (rest på motsatt side nå).
- J20/J21/J24: ved låst 6 er B nå 78,7 m (for lang) i stedet for 70 m. J24 bygger «valgt forslag med 70 m» fra B.
- 084-test 3 (smal trapp uten én-kabel-forslag) bruker 5 trinn i stedet for 8. Med 8 trinn går 30 m nå opp på 5,3 cm.
- B2h («like over 5 %») måles på gulv 5,5 i stedet for 5.
- A3 (4 trinn + repos): 45 @ 10,8 → **49,7 @ 5,7** (funn 5).
- 187.2: korttekst i ny form. 187.5: overgangen = 17 + ruten (før: bare 17).

Ny seksjon 188: åpning (løses / står), behov = strenger + 17 + rute (4 og 147), rett 120 × 6 med kort og panel,
Bla (start, alle slag, samme tall som manuelt sett, tekstene, piltaster/knapper legger ikke ut noe, Bruk etter
forhåndsvisning med angre), Avbryt og `runsPerStep`, hurtigtast-raden.

Ikke kjørt: hel `exportPDF`-smoke. Kabellengden i PDF leser de samme feltene, men den er ikke kjørt på nytt.
