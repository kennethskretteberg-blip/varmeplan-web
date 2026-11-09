# 218 · Hindring — kan starte og slutte på samme vegg, lukkes langs veggen — rapport

09.11.2026 · `main` · én commit, ikke pushet · ingen SQL · `varmeplan-roof` ikke rørt.
(Nummeret 218 er brukt fra før av «Tak 218 pensel», `docs/218/`; derfor ligger denne i `docs/218-hindring/`,
samme løsning som 217, se SPØRSMÅL 1.)

## Kort

Kenneth 09.11.2026: «Sett inn hindring med vegg til vegg. I dag går det ikke å gjøre dette så lenge man starter
og slutter mot samme vegg. … F.eks. en pipe midt på en vegg — da er det kjekt å bare klikke på veggen, to klikk
for hjørnene og siste klikk tilbake til veggen.»

**Årsaken til feilen (målt på HEAD-kopien):** klikket tilbake på startveggen ble **avvist** med en alert,
«Hindringen må gå mellom to forskjellige vegger.» Ingen hindring ble laget, og verktøyet ble stående i steg 2
med de tre punktene (`punkter: 3, fase: 1`). Formen ble altså verken null i areal eller lukket feil vei — den kom
aldri så langt. Hadde avvisningen ikke stått der, ville delefunksjonen `splitRoomWithPolyline` med samme vegg som
start og slutt gått **rundt hele rommet begge veier** (målt: 8 punkter og 117 600 cm² / 122 400 cm² for en pipe
på 2 400 cm² i et rom på 120 000 cm²), fordi den går fra sluttveggens neste hjørne rundt til startveggen. Det er
nettopp «rundt hele rommet»-fellen fra oppgaven.

**Slik lukkes det på ulike vegger (uendret):** polylinjen (klikkene) + rommets hjørner fra sluttveggen rundt til
startveggen = halvdel A; det speilvendte = halvdel B; brukeren klikker i den halvdelen som skal bli hindring (steg 3).

**Nå, samme vegg:** siste og første klikk ligger begge på veggen, så polygonens egen lukkekant (siste → første)
*er* veggen — den korte veien, ingen hjørner å ta med, ingen halvdel å velge. Hindringen opprettes direkte ved klikk 4
(`_hindW2WSameWallPoly`), med samme felter som andre hindringer (`roomId`, `floorId`, `clearance:'wall'`, navn fra
typen eller feltet). Flere hjørner (knekk) virker likt: så lenge første og siste klikk er på samme vegg.

- **Rette vinkler:** klikkene vinkelsnappes fra forrige punkt som før (`angleSnap`, 90°/45° etter brikkene, Shift =
  fritt). Nytt er `_hindW2WAngleSnap`: i tillegg til de faste retningene snapper streken **vinkelrett på og parallelt
  med startveggen**, så klikk 2 går rett ut fra veggen og klikk 3 langs den også når veggen står skrått. På en
  vannrett/loddrett vegg er de to settene identiske (regresjonstest G måler det), og den vanlige snappen vinner når
  den er like nær.
- **Sluttpunktet:** klikk 4 vinkelsnappes fra siste hjørne og projiseres på veggen (`_hindW2WSameWallEnd`). Ligger
  hånden litt skjevt (233, −4 fra hjørnet 230, 40), lander punktet likevel på (230, 0) — pipa blir et rektangel.
- **Forhåndsvisning:** når pekeren er tilbake ved startveggen med minst ett hjørne ute i rommet, vises hindringen
  grønt slik den lukkes, den stiplede streken måler til punktet på veggen (40 cm, ikke 44 cm til pekeren), og
  lukkelengden står på utsiden av veggen (60 cm). Lengder på strekene underveis var der fra før.
- **Uten hjørner** (klikk 1 og 2 begge på veggen) avvises lukkingen med en alert og tegningen fortsetter — en strek
  langs veggen er ingen hindring.
- **Hintet i steg 2** sier nå «Klikk for å legge til hjørne · Klikk på en vegg for å avslutte (samme vegg lukkes
  langs veggen)».
- **Ikke endret:** start og stopp på ulike vegger (deling + valg av halvdel, samme kode), de andre tegnemåtene
  (rektangel, polygon, frihånd), hvordan hindringer påvirker utlegget, flytting/sletting/målsetting.

## Målt

Regresjonstesten `_hindW2WRegressionTest218` sender **ekte museklikk** på lerretet gjennom `mousedown`-håndtereren
(2 px/cm, rommets origo på en hel piksel — musehendelser har heltalls `clientX`), rom 400 × 300:

| Test | Klikk | Resultat |
|---|---|---|
| A pipe 60 × 40 midt på 4 m vegg | (170,−3) (172,40) (230,41) (231,−3) | én hindring, 170..230 × 0..40, **0,24 m²** (2 403 cm² — angleSnap beholder lengden 40,05 på det skjeve klikket), ingen alert |
| B samme, motsatt vei | (230,−3) (229,40) (170,39) (169,−3) | samme fire hjørner, 0,24 m² |
| C knekk, seks klikk | (100,−3) (100,50) (130,50) (130,30) (160,30) (160,−3) | seks punkter, 2 400 cm² |
| D nær hjørnet, øvre vegg | klikk 1 20 cm fra (0,0) | lukkes langs øvre vegg: 20..80 × 0..40 |
| D2 nær hjørnet, venstre vegg | klikk 1 20 cm fra (0,0) | lukkes langs venstre vegg: 0..40 × 20..80 |
| D3 pipe i selve hjørnet | (60,−2) (60,40) (−2,40) → to vegger | som før: steg 3, den lille halvdelen er 60 × 40 via hjørnet (0,0), klikk i den gir 2 400 cm² |
| E ulike vegger (regresjon) | (−2,100) (100,100) (100,−2) | steg 3 med halvdeler 10 000 / 110 000 cm², klikk i den lille gir 100 × 100 |
| F to klikk på veggen uten hjørne | (170,−3) (230,−3) | avvist, ingen hindring, fortsatt steg 2 |
| G/H snapp og sluttpunkt | se over | vannrett = angleSnap; 30°-vegg: 125° → vinkelrett, 35° → parallelt; Shift = rått; (233,−4) → (230,0) |

22/22. Hele suiten (`probe/alle.mjs`, uten innlogging): HEAD 89 tester, 82 grønne; nå 90 tester, 83 grønne,
**alle 89 like med HEAD**, den nye 22/22. De sju røde er de samme som på HEAD (prosjektlås og kundeforslag krever
innlogging, fem geo-tester krever karttjenesten på 4100).

Fixture `probe/kjor.mjs` (fire rom 400 × 300, kabel 60 m / folie 60 cm lagt ut *etter* at hindringen er tegnet,
deretter «Målsett hindring» fra 217):

| Bilde | Hva | Målt |
|---|---|---|
| `etter-pipe-kabel.png` | pipe tegnet venstre → høyre, kabel | 0,2403 m²; kabelbanen 60 m prøvd hver 2 cm (3 233 punkter): **0 inne i hindringen**; fire mål inne (217) |
| `etter-pipe-motsatt-folie.png` | pipe tegnet høyre → venstre, folie | 0,2401 m², samme fire hjørner; 3 baner, ingen under pipa |
| `etter-knekk-kabel.png` | skap med knekk, seks klikk, kabel | 0,54 m²; 59,4 m bane, 0 punkter inne; seks mål inne |
| `etter-underveis-forhandsvisning.png` | tre klikk, pekeren tilbake ved veggen | grønn forhåndsvisning, 40 cm til veggen, 60 cm langs veggen |

Flytt/slett: `hitHindring` treffer den nye hindringen, flyttegizmoen drar den (170,0)→(220,100) som andre
hindringer, `deleteHindring` fjerner den.

## Nærmere om et par valg

- **Ingen steg 3 for samme vegg.** Oppgaven sier «lukkes automatisk», og den andre «halvdelen» (hele rommet minus
  pipa) er aldri det man mener. Vil Kenneth ha valget likevel, er det to linjer (SPØRSMÅL 2).
- **Hjørner nær en annen vegg.** Et hjørneklikk nærmere enn snappeavstanden (30 px) til *en annen* vegg regnes som
  klikk på den veggen — slik har verktøyet alltid virket (det er sånn man avslutter på en annen vegg). En pipe helt
  inne i et hjørne tegnes derfor med klikk 3 på naboveggen (D3), og lukkes via hjørnet som før. Det første testutkastet
  med hjørner 3 cm fra naboveggen traff akkurat dette.
- **Enter** finnes ikke i denne modusen og er ikke lagt til (SPØRSMÅL 3).

## Filer

- `index.html`: `_hindW2WAngleSnap`, `_hindW2WSameWallEnd`, `_hindW2WSameWallPoly`, `_hindW2WRegressionTest218`
  (etter `splitRoomWithPolyline`); klikk-håndtereren for `hindring-w2w` steg 2; forhåndsvisningen; hintet.
- `docs/218-hindring/probe/`: `patch1–4.mjs` (patchene), `t218.mjs` (testen + «før» på HEAD-kopien), `kjor.mjs`
  (bilder og målinger → `etter.json`), `alle.mjs` + `sammenlign.js` (`alle-head.json`, `alle-etter.json`,
  `sammenligning.txt`). `head-index.html` er HEAD-kopien (ikke committet).
