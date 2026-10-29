# Kabelmotor 068–076 — status, merge-sjekkliste og hva som ikke er løst

Gren `kabelmotor`. `main` er urørt.
Galleriet: `docs/kabel/galleri.html` · Arkitektur: `docs/kabel/arkitektur.md` ·
Spørsmål: `docs/kabel/prompter/SPØRSMÅL.md`

---

## 1. Hva som er bygget, på én side

**Geometrikontrollen `_cableGeometryCheck(cable, room)` (068)** er fasiten. Den leser kabelens
senterlinje slik rendereren faktisk tegner den, og måler den mot de harde kravene i spec §1:
ligger kabelen i lovlig område, krysser den seg selv, kommer to deler nærmere hverandre enn
produktets minsteavstand, er noen sving trangere enn bøyeradien, stemmer lengden med produktet
(±1 %), er CC innenfor intervallet, og er banen sammenhengende. Myke mål (CC-variasjon,
kantsymmetri, hopp, dekning) måles også, men avviser ikke.

**Motoren `generateCableGeo(roomId, productId)` (069)** bygger utlegget lagvis:

| Lag | Hva den gjør |
|---|---|
| **A** Normalisering | Lovlig område = rom − kantavstand − hindringer − forbudte soner, med ekte polygon-offset (clipper-lib@6.4.2). |
| **B** Celler | Rommet deles i celler der skanlinjene skifter karakter: enten fordi de splittes/slås sammen (et hakk sett på tvers), eller fordi grensen gjør et **trinn** større enn én CC. |
| **C** Global avstand | **Ett** løpsrutenett for hele rommet: `pos_i = x0 + i × CC`, der `x0` velges én gang mot hele det lovlige området. Cellene sier bare hvilke løp de inneholder. Dette er rettelsen av «ulik CC». |
| **D** Rute | Cellene kobles til **én** bane. To celler kan bare kobles når løpene deres ligger ved siden av hverandre på rutenettet og begge snur i samme ende. Finnes ingen slik kjede → «ingen løsning». |
| **E** Svinger | Halvsirkler med radius CC/2, lagt på et nivå begge løp når. Løpene slutter CC/2 inne i lovlig område, så svingen får plass. |
| **F** Lengde | Søk over CC (bisekssjon) og symmetrisk inntrukne vendepunkter, mot produktets lengde ±1 %. Lengden **måles**, den tilordnes aldri. |
| **G** Start/slutt | Brukerens starthjørne brukes når det er lovlig; ellers nærmeste lovlige. |
| **H** Optimalisering | Harde krav er **filter** — et ulovlig utlegg kan aldri vinne på poeng. Myke mål er poeng. |

**I kaskaden (070):** ny motor og dagens kaskade kjøres begge, begge måles, og en dominans-test
avgjør. Ny motor tar bare over når den ikke er dårligere på noe mål. Bryter et utlegg likevel et
hardt krav, legges det ut **merket** — rød stiplet romkontur, røde ringer på bruddene, ⚠ i
labelen, defektliste og forslag i panelet, egen linje på PDF-romsiden.

---

## 2. Galleriet, rom for rom

30 rader = 15 fixture-rom × 2 retninger (`badHakk41` kom til i 074).
«Før» = kaskaden slik den var ved `1519bb0`.

| | består | bryter et hardt krav |
|---|---|---|
| **Før (068)** | 5 | 23 |
| **Etter (070)** | 20 | 8 |
| **Etter (072)** | 22 | 6 |
| **Etter (074)** | **24** | **6** (av 30) |

De to som kom til i 072 er **Kenneths bad loddrett** (var «ingen løsning» — fantes ingen lovlig
én-kabel-bane) og **`enHindring` i begge retninger** (var ⚠ i begge). Begge løses av
transittløpet. `enHindring` loddrett erstatter dermed «2 kabler»-forslaget med én kabel.

Dekningen steg bredt da løpsrutenettet begynte å nå helt ut til det lovlige områdets kant
(lag C, se §7): rektangel 98,8 → 99,5 %, L-rom 97,9/98,5, U-rom 92,6/93,1,
asymmetriske vegger 93,9 → 96,1 %.

| Rom | v | h |
|---|---|---|
| Rektangel 400×300 | ok 97,9 % | ok 99,5 % |
| L-rom | ok 97,9 % | ok 98,5 % |
| U-rom | ok 92,6 % | ok 93,1 % |
| **Én hindring** | **ok 94,2 %** (1 transitt) | **ok 91,8 %** (1 transitt) |
| Flere hindringer | ⚠ (se §3a) | ⚠ (se §3a) |
| Smal passasje | ok 90,3 % | ok 90,3 % |
| Utsparing | ok 95,1 % | ok 93,8 % |
| Asymmetriske vegger | ok 96,1 % | ok 96,1 % |
| Kabel for lang | ⚠ (§3b) | ⚠ (§3b) |
| Kabel for kort | ok | ok |
| Bøyeradius umulig | ⚠ (§3c) | ⚠ (§3c) |
| Umulig starthjørne | ok 99,0 % | ok 99,1 % |
| Skrå (18°) | ok 97,4 % | ok 96,8 % |
| **Kenneths bad** (47 m) | **ok 92,7 %** (1 transitt) | ok 88,5 % |
| **Kenneths bad, 41 m** (074) | **ok 91,0 %** · +0,07 % · CC 13,18 | **ok 91,4 %** · +0,57 % · CC 13,45 |

⚠ **Én endring i et rom som alt var gyldig:** rent rektangel vannrett lå på boustrophedon og
ligger nå på ny motor. Den er bedre på hvert eneste mål (CC 12,40 → 12,60 cm, dekning
98,8 → 99,5 %, lengdeavvik −0,94 → −0,91 %, klaring 12,40 → 12,60, bøyeradius 6,20 → 6,30) og
dårligere på ingen, så overtakelsen følger dominans-regelen fra 070. Påstanden i
`_cableGeometryRegressionTest` er endret fra «identisk utlegg som før» til «identisk ELLER bedre
på hvert mål», med målingene i koden ved testen. **Dette må godkjennes før merge.**

## 3. Hva motoren IKKE løser — og hva brukeren får se

### a) Hindring midt i rommet
**`enHindring`: LØST i 072.** Transittløpet (§7) reserverer én bane langs hindringens kant, og
begge retninger gir nå én sammenhengende, lovlig kabel (94,2 % / 91,8 % dekning).

**`flereHindringer`: står igjen.** Målt: rommet deler seg i **10 celler** i begge retninger, og
**6 av cellepartene er stablet** — de ligger på samme løpsposisjoner, bare oppå hverandre, og
krever hver sin transittkorridor. Søket bygger varianter i to lag (inntil 2 reserverte baner);
ingen av de 11–12 variantene × alle Hamilton-rekkefølgene gir en lovlig kjede. Det er altså ikke
at transitten ikke virker — det er at rommet trenger flere korridorer enn det er plass til.
Seks reserverte baner i et 4 m²-rom er mesteparten av gulvet, og hver av dem er en kald stripe.
**Brukeren får:** dagens V6-utlegg, merket ⚠ med defektlista, pluss et prøvd «2 kabler»-forslag
med målte lengder. Kenneths beslutning 5 gjelder altså for én hindring; for flere er «2 kabler»
fortsatt riktig svar.

### b) Kabel for lang for rommet (`kabelForLang`)
Et 3 m² rom med 96 m kabel: CC klemmes til produktets minimum 5 cm, og bøyeradien 3,2 cm krever
CC ≥ 6,4. Ingen lovlig CC finnes.
**Brukeren får:** ⚠ og forslag om et kortere produkt i samme familie.

### c) Bøyeradius umulig (`boyUmulig`)
Samme mekanisme: 10 m² med 200 m kabel gir CC 5,0 cm, og en U-sving med radius 2,5 cm er
trangere enn produktets 3,2 cm.
**Brukeren får:** ⚠ og forslaget om et produkt med mindre bøyeradius eller kortere lengde.

### d) Skrå og roterte rom (`skraa`)
Utenfor denne runden (spec §0.5). Rom med en vegg mer enn 5° fra aksen svarer «ikke
akseparallelt» og overlates til skew-motoren, som består galleriet for dem.
**Brukeren får:** samme utlegg som før.

### e) Flerkabel-soner
`_buildNCableZones` tvinger felles CC i alle soner (lik W/m² over sømmen). Ny motor søker sin
egen CC og kjenner ikke bindingen. Soner kjører derfor uendret på dagens kaskade.

### f) Utlegg som allerede er lagret — LØST i 072
Kenneths beslutning 6: «Lagrede utlegg kontrolleres **ved åpning** — bare merkes (⚠), aldri
endres.» `_geomSjekkLagredeUtlegg()` kjører fra `_restoreProject`, som er DET ENE punktet alle
lastinger går gjennom (sky, fil, versjon, duplisering). Den skriver bare merkefeltene
(`_geomDefects`/`_geomMetrics`/`_geomOk`), rører ikke geometrien, markerer ikke prosjektet som
endret og utløser ingen autolagring. Er noe merket, kommer banneret
«⚠ N kabelutlegg i prosjektet bryter regler — se ⚠ i romlista.» Kontrollen er asynkron og
fail-soft: laster ikke polygonbiblioteket, skjer ingenting.

### g) Dekningen har et ARITMETISK tak
Dekning er andelen av netto areal som ligger innenfor ½ CC fra kabelen. En slynge med lengde L og
avstand CC dekker derfor høyst `L × CC`. For badet: 47,00 m × CC mot 5,887 m² netto.

| CC | tak | merknad |
|---|---|---|
| 11,21 cm (vannrett, N=19) | **89,5 %** | motoren måler 88,5 — 1 poeng under taket |
| 11,60 cm (loddrett, N=18 + transitt) | **93,1 %** | motoren måler 92,7 |
| 11,65 cm | 93,0 % | det som trengs for målet «≥ 93 %» |
| 12,53 cm | 100 % | nøyaktig det referansen (skew) brukte — men den lå 0,83 cm fra veggen |

Vannrett kan rutenettet bare tilby CC 11,21 (19 løp) eller 11,87 (18 løp). 18 løp gir **44,31 m**,
altså 5,7 % for kort — utenfor ±1 %. **Målet «≥ 93 % i begge retninger» er derfor ikke oppnåelig
vannrett med InFloor 17T 47 m**, og det er ikke en mangel i koden. Kenneths EGEN vannrette fasit,
bygget og målt, lander på 92,1 % — og bruker da 48,83 m, 3,9 % mer kabel enn produktet har.

## 4. Legge til et nytt testrom i galleriet

Én oppføring i `_cableFixtures` i `index.html`:

```js
mittRom: {
  name: 'Beskrivende navn',            // vises som overskrift i galleriet
  klasse: 'rettvinklet uregelmessig',  // fri tekst, grupperer i rapporten
  productId: 31,                       // et ekte produkt fra katalogen
  points: [{x:0,y:0},{x:400,y:0},{x:400,y:300},{x:0,y:300}],   // innvendig polygon, cm
  hindrings: [[{x:150,y:110},/* … */]],                        // valgfritt
  zones: [{ type:'forbidden', points:[/* … */] }],             // valgfritt
  note: 'Hvorfor dette rommet er med'                          // valgfritt
}
```

Deretter, i konsollen med dev-serveren i gang:

```
await _cableGalleryExport()
```

Den kjører alle rom × begge retninger × kaskaden + fem motorer, skriver
`docs/kabel/galleri.html` og legger tabellen i konsollen. For ett rom:
`await _cableGalleryExport({ only: ['mittRom'] })`.

---

## 5. Merge-sjekkliste (spec §8)

- [x] **badHakk får gyldig utlegg i BEGGE retninger, med én kabel.**
      Loddrett: **47,24 m, avvik +0,51 %, CC 11,60 cm, dekning 92,7 %**, 0 kryssinger, 0 knekker,
      minste klaring 11,60 cm, bøyeradius 5,79 cm (krav 3,2), 1 sammenhengende bane, 1 transittløp.
      Vannrett: **47,00 m, avvik 0,00 %, CC 11,21 cm, dekning 88,5 %**, 0 utenfor.
- [x] **Kenneths fasit er bygget og kontrollert** (`_cableFasitCable`, vist i galleriet).
      Loddrett-fasiten **består** — og er numerisk identisk med det motoren legger.
      Vannrett-fasiten **faller på lengden alene**: formen rommer 48,83 m (+3,9 %) der produktet
      har 47,00. Alt annet er rent (0 utenfor, 0 kryssinger, klaring 11,21, dekning 92,1 %).
      Nærmeste lovlige variant er samme form med vendepunktene trukket symmetrisk inn — det er
      nøyaktig det motoren gjør, og det koster 3,6 prosentpoeng dekning.
- [ ] **Dekning ≥ 93 % i begge retninger** — loddrett 92,7 %, vannrett 88,5 %.
      **Ikke oppnåelig** med dette produktet; aritmetikken står i §3g. Kenneth må avgjøre om
      målet skal justeres, eller om badet skal ha et annet produkt/en annen kabellengde.
- [x] **Ingen galleri-rom dårligere enn før.** 22 gyldige mot 20, ingen tapte dekning.
      Ett rom BYTTET motor uten å bli dårligere (rektangel vannrett, se §2) — må godkjennes.
- [x] **Alle regresjonsbatterier grønne: 22 batterier.** `_cableGeometryRegressionTest` utvidet
      fra 24 til **36 påstander** (badHakk begge retninger, hindringsrom, åpningskontroll).
- [x] **Ingen endring i lagret dataformat.** Transittløpet er vanlige punkter i den samme
      `pathEls`-kjeden; ingen nye felt i prosjekt-JSON-en utover merkefeltene 070 alt skrev.
- [x] **`docs/kabel/galleri.html` oppdatert** — med Kenneths tegninger i tre kolonner for badet.
- [ ] **Kenneth har sett galleriet og forhåndsvisningen, og sagt «merge».**

---

## 6. Åpne beslutninger før merge

1. **Dekningsmålet ≥ 93 %** (§3g). Vannrett kan ikke nå det med InFloor 17T 47 m. Skal målet
   justeres til «så nær taket som mulig», eller skal badet ha et annet produkt?
2. **Rektangel vannrett bytter motor** (§2). Bedre på hvert mål, men det er en endring i et rom
   som alt var gyldig. Godkjennes?
3. **Dra-redigering** (Kenneths beslutning 3: uavklart). Ingenting bygget. Spørsmålet står.
4. **`flereHindringer`** (§3a) beholder «2 kabler» som forslag. Godtas det?
6. **Jevnhet som koster CC** (§6c): to rom har fortsatt et hull på 2 × CC. Den jevne løsningen
   der krever en mindre CC og koster ~6 prosentpoeng dekning. Skal motoren ta den prisen?
5. **`auto`-retningen på badet** velger fortsatt vannrett (lengdeavviket 0,00 % veier tyngre i
   poengsummen enn 4,2 prosentpoeng dekning). Loddrett får man ved å velge retningen selv.
   Skal poengsummen vekte dekning høyere når begge retninger er lovlige?

---

## 6b. 074 — bugen Kenneth meldte 14.10.2026

> «Jeg velger retning og innsetting, men den hopper tilbake og bytter visning av seg selv.
> Varselen kommer opp flere ganger, det hjelper ikke å trykke den bort.»

### Hva som var galt, målt

| # | Funn |
|---|---|
| 1 | `confirm(...)` ble kalt fra `_finishCableAutoFill` **inne i kandidatsøket**. Målt stakk: `confirm ← _finishCableAutoFill ← _autoFillCableLegacy ← _cableLegacyInDirection ← _cableCandidatesForDirection`. Én per kjøring — og `autoFillCable` kjøres på nytt ved hvert produktklikk, hver retningsendring (`_reapplyCableDirection`) og hver romflytting (mouseup-grenen som regenererer kabler). «Avbryt» ga `return null`, som utløste neste forsøk. |
| 2 | **25 % gjaldt et utlegg Kenneth aldri så.** Tallet kom fra den GAMLE kaskadens kandidat med den gamle formelen (Σ segment × CC). Vinneren (ny motor) hadde **91 %** målt av `_cableGeometryCheck`. |
| 3 | Produktforslaget brukte `getProductFamily` (blander 17T og 10T, målt i 043) og valgte på **lengde alene** → «InFloor 10T 300W 30m» i et rom som skal ha 706 W. |
| 4 | Retningsbyttet ble meldt med en toast som druknet i dialogene. |

### Hva som er rettet

- **`_finishCableAutoFill` måler og merker — den snakker ikke.** Ingen `confirm`, ingen toast,
  ingen `return null` på grunn av dekning.
- **`_cableSearchDepth`** er vakten: alt som kjøres mens den er > 0 er kandidatmåling, og
  `_cableStille()` leses av toast-veiene. En ny vei inn i søket kan ikke begynne å snakke igjen.
- **`_cableStatusLines(cable, room)` er den ene kilden** til alt brukeren ser om et utlegg:
  dekning fra `_geomMetrics.coveragePct` (068-definisjonen), gyldighet fra `_geomDefects`,
  retning fra `_dirFallback`, forslag fra `_betterProduct`. Panelet tegner linjene, toasten slår
  dem sammen — ingen av dem regner selv.
- **`_cableBetterProduct`** henter forslaget fra samme serie (`_forslagKabelSerie`, samme
  `watt_per_m` og spenning) og fra `selectCableByPower` for rommets ønskede W/m². Badet får nå
  **InFloor 17T 800W 47m (799 W)**, ikke 10T 300 W.
- **Valgt retning står.** `S.varmefolie.direction` skrives ikke av et fallback (målt: den var
  faktisk aldri skrevet — `_cableLegacyInDirection` legger den tilbake i `finally`), og panelet
  sier nå eksplisitt «Retning: loddrett (valgt)» med «Prøv loddrett likevel» når noe annet ble lagt.
- **Effekt-merket er merket som effekt.** «129 W/m² ● ok» leste som en dom over hele utlegget;
  det står nå «● ok effekt», så det ikke forveksles med dekningen rett under.

### Målt etter

Badet med **InFloor 17T 700W 41m, 120 W/m², start nedre høyre, loddrett valgt**:
**null nettleserdialoger, null toasts**, ett gyldig loddrett utlegg (geo, CC 13,18 cm, 41,03 m,
+0,07 %, dekning 91 %), retningsvelgeren uendret. Panelet sier:

> ● Forhåndsvises — InFloor 17T 700W 41m
> 129 W/m² ● ok effekt · CC 13,2 cm · 41,0 m kabel
> Retning: loddrett (valgt)
> ⚠ 0,53 m² (9 %) uten kabel
> Bedre: InFloor 17T 800W 47m (799 W) · **Bytt**

**Loddrett med 41 m ER gyldig** (STEG 0.2) — fallbacken slår altså ikke inn på denne geometrien.
Forhåndsvisning → Godkjenn kjører kaskaden **én** gang totalt (målt teller: 1 før, 1 etter).

---

## 6c. 074b — jevn avstand går foran dekning

Kenneths regel, 14.10.2026: **«Det er alltid viktigere å få en jevn avstand mellom kabelløpene
enn å dekke helt ut mot veggene — heller dra inn kabel fra vegg for å få jevnest mulig utlegg.»**

⚠ Dette måles **per bånd**, ikke globalt. Transittbanen brukes bare på den ene siden av
hindringen, så en global CC-måling sa «helt jevnt» mens båndet over stubben hadde et hull på
2 × CC. `_geoWorstBandGap` sampler sju høyder, og teller bare mellomrom der midtpunktet ligger i
lovlig område — et stort mellomrom over en hindring er ikke en feil.

Transitt-variantene prøves nå i denne rekkefølgen:

1. **skjøvet** — cellen gir fra seg sitt ytterste løp (mot veggen) og overtar den tomme
   transittbanen. CC uendret, hullet flyttes ut til veggen. *Dette er Kenneths regel.*
2. **kappet** — banen beholdes av eieren, kappet til A-siden.
3. **fjernet** — den opprinnelige 072-varianten, med en overgang på 2 CC.

Poengsummen straffer hull tungt (−40 × overskytende), tyngre enn dekningsleddet (30), så et
jevnt utlegg vinner over et med hull selv når det dekker mer.

**Badet loddrett, 47 m:** 0 tomme baner, CC uendret 11,60, dekning 92,7 → 92,5 %.
**Badet loddrett, 41 m:** 0 tomme baner, CC 13,18 → 13,81, dekning 91,0 → **94,9 %**.

⚠ **074d: CC-valget er 016 sitt, men jevnhets-søket får ikke røre det.** Kenneth ba om at «CC
aldri skal utenfor anbefalt område». En GLOBAL sperre går ikke: 016 bestemte bevisst at CC over
anbefalingen er en advarsel, ikke en sperre, fordi kabelens lengde styrer flateeffekten (36 m i
10 m² trenger CC 27,8 for 60 W/m²; klemt til 20 blir det 85). Sperren ligger derfor på
nabotrinn-søket alene, sammen med en dominans-vakt: et nabotrinn får bare overta når det er
bedre eller likt på HVERT mål (gyldig · lengde · dekning · klaring · bøyeradius · utenfor · ⚠ CC).

⚠ **Og ⚠-et på etiketten betyr ikke «CC utenfor anbefaling»** — det tennes også av
`_geomDefects`. I Kenneths bugrapport betydde det at utleggene BRØT EN HARD REGEL. Det var den
ekte skaden i 074c, og dominans-vakten er svaret på den.

⚠ **074c rettet selve målingen.** Avstandsmålingen fra 074b slo ut på kantsonen mellom løpenes
ender og stubben, og rapporterte «9 × CC» for et utlegg der hver naboavstand var 13,8 cm — den
straffet altså det jevneste utlegget hardest. Riktig måling er BANEBRUK (`_geoInteriorHoles`):
en bane som står helt tom med brukte naboer på begge sider er et hull; ligger den ytterst, er
det stripen inntil veggen. CC er dessuten TRINN, ikke en skala — den jevne løsningen for 41 m lå
på nabotrinnet, og søket prøver nå N ± 1 og N ± 2 når vinneren har et hull.

**Ikke løst:** `enHindring` loddrett og `uRom` begge veier har fortsatt én tom bane — der er den
skjøvede varianten ikke gyldig, og den eneste jevne løsningen krever en annen CC. Målt på 47 m
ville det kostet **6 prosentpoeng dekning** (92,7 → 86,7 %). Det er en annen avveining enn den
Kenneth beskrev, og er derfor ikke tatt av motoren — se §6 åpen beslutning 6.

---

## 7. Transittløpet (072) — hva det er, og hva det koster

**Problemet, målt:** veggstubben i badet deler de ni venstre løpene i to celler som ligger på
NØYAKTIG samme løpsposisjoner, bare stablet oppå hverandre. En U-sving kobler to naboløp ved
siden av hverandre — ikke to biter av samme løp. `_geoHandoff` svarte «samme løpsposisjon», og
hele retningen endte som «ingen løsning». Det var ikke en geometrisk kjensgjerning; det var en
manglende korridor.

**Hva et transittløp er:** ett vanlig løp som får sin egen bane i rutenettet —
(1) et **tverrløp** langs hindringens kant, én CC fra nærmeste U-sving og med kantavstand til
veggen, (2) en **sving rundt hindringens ende**, (3) et **nedløp** i den reserverte banen, der en
helt alminnelig U-sving tar over. Det er ikke et hopp, og det får ingen dispensasjon:
`utenfor`, `naerforing`, `boy` og `kryssing` måles på det som på alt annet.

**Hva det koster:** banen tas ut av cellen den ellers hørte til, så overgangen over den blir én
bredere halvsirkel (radius CC i stedet for CC/2 — en *slakere* sving, ikke en trangere), og
stykket av banen som ikke brukes blir en kald stripe. Søket prøver derfor alltid **uten** transitt
først; færrest transitter vinner når alt annet er likt.

**Kenneths egen tegning viser nøyaktig dette:** over stubben ligger løpene hans på 778 og 801 —
to CC fra hverandre, med bane ~790 tom. Målt i tegningen med pikselprobe, ikke anslått.

**Grensen:** inntil to transitter per utlegg (to lag varianter). `flereHindringer` trenger seks
og løses ikke — se §3a.

---

## 8. Lag C: rutenettet når helt ut til kanten (072)

**Før:** `N = floor(W/cc)+1`, og resten av bredden (opptil én CC) ble delt likt på begge sider.
Symmetrisk — men ytterste løp havnet opptil en halv CC inne i det lovlige området, og hele
kantstripen lå kaldt uten at noe krav var brutt. Målt på badet: 5 cm-marginbåndet rundt rommet
er 0,58 m² av 5,89 m² = **9,9 %**.

**Nå:** antallet løp N er den frie HELTALLS-knappen, og CC utledes av den: `cc = W/(N−1)`.
Rutenettet spenner nøyaktig over det lovlige området, ytterste løp ligger PÅ grensen, og
dekningen deres rekker helt bort til veggen. Kantavstanden er fortsatt symmetrisk — nå med null
slark i stedet for lik slark. Kallerens `cc` er et ØNSKE; `grid.cc` er den faktiske, og kabelen
bærer den videre (uten det siste løy `spacing_cm` om CC, og kontrollen målte dekningen med feil
radius).

---

## 9. Like lange løp — regelen er BEGRENSET, ikke fjernet

Kenneths beslutning 2: «Løpene skal følge vegger og trinn innenfor sin celle … ikke kappes til
lik lengde.» Den låste regelen i CLAUDE.md («Equal-length runs (LOCKED) — after generating
polygon-clipped runs, find the shortest common sweep range and clip ALL runs to match») klippet
hvert eneste løp i cellen til `[max(lo), min(hi)]`.

**Nå gjelder den bare for PARET som faktisk møtes i en U-sving.** Svingen mellom løp k og k+1
legges på det nivået begge når; løp mellom to trinn blir nøyaktig så langt dets eget lovlige
område tillater. Trinn-splitten (et trinn større enn én CC gir en cellegrense) står uendret — uten
den ville «paret» måtte spenne over et 107 cm sprang, og svingen blitt en lang diagonal: nettopp
Y-greina den låste regelen verner mot.

⚠ **Ved merge må CLAUDE.md oppdateres.** Den låste regelen der er skrevet for de gamle motorene og
stemmer ikke lenger for `generateCableGeo`. Endringen er gjort på Kenneths eksplisitte ønske
(beslutning 2), ikke på eget initiativ.

⚠ **Målt, mot forventning:** like-lengde-regelen var *ikke* der dekningen forsvant. Den klippet
bare 0,1 % vannrett og 0,7 % loddrett i badet. De manglende prosentpoengene lå i kantstripen
(§8) og i lengdetrimmingen (§3g).

---

## 10 · Status 14.10.2026 — hva som virket, hva som ikke virket, og hvorfor

Skrevet på Kenneths bestilling: «gi meg heller en status på hva som gjorde at det funket veldig
bra i sta.» Underlag for sparring før neste runde.

### 10.1 Tidslinje med Kenneths egne dommer

| commit | hva den gjorde | Kenneths dom |
|---|---|---|
| `884fc74` 072 | transittløp — én reservert bane forbi veggstubben | — |
| `5463546` 074 | stille kandidatsøk, én beskjed, riktig produktforslag | — |
| `baa6e37` 074b | hullet flyttet ut til veggen (**ved uendret CC**) | «47 m er perfekt» |
| `9f60af9` 074c | finere hullmåling + **fritt søk over CC-stigen** | **«nå ble det dårligere»** |
| `cad5ee0` | tilbakerulling av 074c | — |
| `30ea330` 074d | 074c på nytt, + dominans-vakt, + CC-sperre på trinnsøket | **«mye bedre»** ← beste kjente |
| `c6d198c` 074e | hullmåling per bane-BIT + bredere trinnsøk | **«like dårlig igjen»** |

**Beste kjente tilstand er `30ea330` (074d).**

### 10.2 Mønsteret: å flytte CC ødelegger, å flytte BANER gjør det ikke

Dette er den ene linja som forklarer alle tre rundene.

| type endring | hva den rører | resultat |
|---|---|---|
| **Baneeierskap** (072 transitt, 074b skjøvet/kappet) | hvilken celle som eier hvilken bane. **CC uendret.** | Virket hver gang. «47 m perfekt». |
| **CC-flytting** (074c og 074e sitt trinnsøk) | hvilket trinn på CC-stigen utlegget legges på | Ødela hver gang, i Kenneths rom. |

CC er ikke en fri knapp. Den henger sammen med **lengden** (produktet skal brukes opp, ±1 %),
**flateeffekten** (016: 36 m i 10 m² TRENGER CC 27,8 for 60 W/m²) og **celleinndelingen** (et
nytt CC gir et nytt rutenett, nye celler, en ny rute). Når søket flytter CC for utseendets
skyld, rives alle tre.

### 10.3 Hva ⚠ på etiketten faktisk betyr

Jeg tok feil om dette én gang, og det kostet en runde. Etiketten (`:35138`):

```js
(_ccOverWarn(prod, ccCm) || cable._geomDefects.length) ? '⚠ ' : ''
```

Romtypen «Bad» har hverken nedre eller øvre CC-grense, og produktets anbefaling er 20 cm. Når
Kenneth ser «⚠ CC 14,9» betyr det derfor **ikke** at CC er utenfor anbefalingen — det betyr at
utlegget **bryter en hard regel** (utenfor lovlig område, kryssing, bøy, nærføring, lengde).
«Krysser vegger» i 074e er nøyaktig det.

### 10.4 ⚠ Den egentlige svakheten: jeg tester mot feil rom

Alle tre rundene er målt mot `badHakk` / `badHakk41` — badet i **Ekebergveien 28**, 5,887 m²,
rekonstruert fra prosjektets koordinater i 072.

Kenneths skjermbilder er fra et **annet** bad: **Rom 5, 5,70 m²**, V1 260 · V2 75 · V3 39 ·
V4 129 · V5 300 · V8 13 · V9 100 · V10 93. Annen bredde, annen stubbe, annet trinn.

Målt på fixturene etter 074e: **null rom krysser vegger, null rom er ugyldige.** Samme kode gir
et ugyldig utlegg i Kenneths rom. Jeg har altså tre ganger på rad erklært noe som «grønt» på et
grunnlag som ikke dekker tilfellet det skulle løse.

**Dette er blokkeringen, ikke geometrien.** Uten Rom 5 som fixture er hver neste runde like
blind som de tre foregående.

### 10.5 Det som står igjen, teknisk

- **Vannrett** har fortsatt tomme baner for 500/600/700 W (loddrett er ryddet).
- `flereHindringer` trenger seks transittkorridorer; taket er to. «2 kabler» er riktig svar der.
- `kabelForLang` og `boyUmulig` er fysisk umulige og merkes.
- CLAUDE.md sin låste like-lengde-regel må oppdateres ved merge (begrenset i 072).
- Rent rektangel vannrett byttet motor i 072 (geo dominerer på hvert mål) — må godkjennes.

### 10.6 Spørsmål til sparringen

1. **Skal CC i det hele tatt få flyttes for jevnhetens skyld?** Alternativet: lås CC til
   lengde/effekt, og la jevnheten bare avgjøres av baneeierskapet (det som alltid har virket).
   Prisen er at noen rom beholder én tom bane.
2. **Hva er riktig når jevn avstand og full kabellengde slåss?** I dag vinner lengden (±1 % er
   et hardt krav). Skal et utlegg kunne være 2 % kort hvis det blir jevnt?
3. **Rom 5 som fixture** — kan jeg få koordinatene (f.eks. prosjekt-JSON for rommet)? Uten dem
   kan jeg ikke etterprøve det du faktisk ser.

---

## 11 · 076 — Rom 5 er fasiten, CC er låst, og beste tilstand er merket

### 11.1 Hvilken commit ga fasiten (STEG 0.2)

Rom 5, InFloor 17T 700W 41m, loddrett, start øverst til høyre:

| commit | CC | lengde | gyldig | kryss/knekk | ⚠ |
|---|---|---|---|---|---|
| `30ea330` 074d | **13,20** | 40,97 m (−0,07 %) | ja | 0 / 0 | nei |
| `c6d198c` 074e | **13,20** | 40,97 m (−0,07 %) | ja | 0 / 0 | nei |

⚠ **De er identiske.** Alle fire kabellengder og begge retninger ga bit for bit samme resultat
på de to versjonene. Forskjellen Kenneth så i nettleseren lå altså IKKE i `generateCableGeo`.

Jeg klarte heller ikke å reprodusere ⚠-et fra den LAGREDE Rom 5-geometrien: gjennom hele
kaskaden (`_autoFillCableImpl`), alle fire starthjørner, begge retninger og auto — alt gyldig,
ingen defekter, ingen CC-advarsel, på begge versjoner. Den mest sannsynlige forklaringen er at
rommet på skjermen var redigert og ikke identisk med det lagrede (Rom 5 har ingen lagret kabel).
**Dette står åpent** — se 11.5.

Tag satt på den eldste av de to, altså den med færrest bevegelige deler:
`kabelmotor-fasit-rom5` → `30ea330`.

### 11.2 Veien videre ble bygget PÅ tagen, ikke ved tilbakerulling

`git diff e7a37b2 30ea330 -- index.html` var tom — koden i HEAD var allerede 074d (074e ble
rullet tilbake i `e7a37b2` på Kenneths ord). 076 er derfor bygget rett oppå, uten ny revert.

### 11.3 CC er låst

Nabotrinn-søket — det eneste som flyttet CC for utseendets skyld — er **fjernet**
(`generateCableGeo`, lengdesøket). CC regnes av lengden og netto areal som 016 bestemte, og
klemmes til grensene. Hullstraffen i `_geoScore` står: en jevn variant vinner fortsatt over en
holete **på samme CC**, men kan ikke lenger kjøpe jevnhet ved å flytte CC.
`fastLenHullfri` er borte. Dominans-vakten fra 070/074d står.

**Prisen, målt:** `badHakk41` mister sin hullfrie løsning. Ved CC 13,18 er kappet-varianten den
eneste uten hull, og den lander på 42,23 m = +3,01 % — utenfor ±1 %. Rommet beholder derfor
én tom bane (91,0 % dekning mot 94,9 % med trinnsøket). `rom5` og `badHakk` er hullfrie.

### 11.4 Rom 5 som fast regresjon

`_cableFixtures.rom5` — ekte geometri hentet lesende fra «Ekebergveien 28 (kopi)» / «Rom 5»,
5,698 m² netto, ti punkter, ingen hindringer/soner/kundedata. Veggmålene stemmer med Kenneths:
V1 260 · V2 75 · V3 39 · V4 129 · V5 300 · V6 99 · stubbe 100/13/98 · V10 93.

`_cableGeometryRegressionTest` låser nå: gyldig · CC 13,2 ± 0,2 · én sammenhengende bane ·
ett transittløp · ingen tom bane midt i en celle · start i valgt hjørne · 0 kryss / 0 knekk.
De andre lengdene og vannrett: gyldige, eller en BEGRUNNET «ingen løsning».
Galleriet viser Rom 5 øverst, med tegning · fasit bygget og kontrollert · motoren.

**Rom 5 i galleriet:** loddrett ok 93,4 % CC 13,20 · vannrett ok 93,4 % CC 12,93.
500 W og 800 W loddrett gir «ingen løsning» (begrunnet: fire soner); begge går vannrett.

### 11.5 Fremgangsmåte for hver videre runde — ufravikelig

Før Kenneth ser noe som helst:

1. Kjør galleriet med **rom5 + badHakk + badHakk41**, alle lengder, begge retninger.
2. Sammenlign rom for rom mot `kabelmotor-fasit-rom5` (`git show kabelmotor-fasit-rom5:index.html`
   kan serveres som en egen side og måles med samme probe).
3. **Avvis endringen** hvis ett eneste av dem blir dårligere på noe mål.

Kenneths dom i nettleseren er sluttkontrollen, ikke måleinstrumentet. ⚠ Og `rom5`-fixturen er
den LAGREDE geometrien — er rommet redigert på skjermen, måler fixturen noe annet. Spør om en
fersk kopi når et skjermbilde og en måling er uenige.

---

## 12 · ⚠ FEIL DIAGNOSE — TRUKKET TILBAKE (se §13)

Her sto påstanden «en LÅST CC hopper over hele den nye motoren», basert på hengelåsen ved
«149 mm» i Kenneths skjermbilde. **Den var feil.** Hengelåsen er ikke en CC-lås, og Rom 5 går
ikke den veien. Rettelsen og den etterprøvde forklaringen står i §13.

Det som ble målt den gangen STEMMER fortsatt, og er verdt å beholde: setter man
`room._forcedSpacingCm = 14,9` på Rom 5, kjøres utlegget på V6 og lander 293 cm utenfor rommet
med 34 kryssinger. Det er en ekte svakhet i den veien — men det var ikke det Kenneth så.

---

## 13 · Hva hengelåsen faktisk er, og hva «den gamle veien» er

### 13.1 «149 mm 🔒» er `cable.lockedEnd` — ikke en CC-lås

Ctxbar-koden (`updateCtxBar`, kabelgrenen):

```js
const ccLocked = cable?.lockedEnd;
const spDisabled = ccLocked ? ' disabled style="opacity:0.4;pointer-events:none"' : '';
… `${spMm} mm${ccLocked ? '<lås-ikon>' : ''}`
```

`lockedEnd` settes automatisk for **ethvert produkt med fast kabellengde**:
`lockedEnd: !!prod.cable_length_m` (sju steder i motorene). Den er altså PÅ for alle InFloor-
kabler, uten at noen har trykket på noe.

Hva den gjør: sperrer ⟷ − og ⟷ + (`_cableSpacingDelta` returnerer tidlig på `lockedEnd`).
Det er riktig oppførsel — en kabel med fast lengde kan ikke kappes, så CC kan ikke settes fritt;
CC følger av lengden og arealet. Låsen er med andre ord **normaltilstanden**, ikke en feil, og
ikke noe Kenneth har slått på.

### 13.2 `_forcedSpacingCm` er noe HELT annet, og har ingen knapp

Det er feltet §12 forvekslet låsen med. Det settes **bare to steder**, begge i flerkabel-sone-
maskineriet (`_buildNCableZones` og sone-orkestreringen), aldri fra verktøylinja.

### 13.3 «Den gamle veien» — hva det betyr

Siden 070 er kabelmotoren en konkurranse: ny motor (`generateCableGeo`) og de fire gamle
(skew, boustrophedon, V6, serpentine) legger hvert sitt forslag, alle måles med
`_cableGeometryCheck`, og ny motor tar bare over når den ikke er dårligere på noe mål.

Men `_autoFillCableImpl` har en tidlig retur FØR konkurransen:

```js
if (room._forcedSpacingCm != null || room._zoneId != null || S.ui.fillTargetZoneId != null) {
  return _autoFillCableLegacy(roomId, productId, opts);   // ← «den gamle veien»
}
```

Altså: **et rom som er delt i flerkabel-soner kjører kun de gamle motorene.** Begrunnelsen fra
070 er ekte: sonene må ha SAMME CC for å få lik W/m² over sømmen, og ny motor søker sin egen CC
per sone uten å kjenne den bindingen — målt 20,67 cm i én sone mot 20,6 i nabosonen.

⚠ **Rom 5 har ingen soner og ingen tvungen CC.** Det går gjennom konkurransen som alle andre rom.
§12 sin forklaring gjaldt derfor ikke Kenneths tilfelle.

### 13.4 Hva som er utelukket — og hva som gjenstår

Målt på `rom5`-fixturen, gjennom hele kaskaden (`_autoFillCableImpl`), alt gyldig, ingen defekter:

| prøvd | resultat |
|---|---|
| 074d mot 074e | identisk, begge gyldige |
| alle fire starthjørner | gyldig |
| begge retninger + auto | gyldig |
| flateeffekt null og 120 W/m² | gyldig (endrer bare produktforslaget) |
| veggmargin 0 → 10 cm | gyldig i hele området |
| 500/600/700/800 W | gyldig (500/800 loddrett: begrunnet «ingen løsning») |

**Ingen av dem gir CC 14,9 i loddrett.** Fixturen gir 15,28 loddrett og 14,91 VANNRETT — og
Kenneths panel sa «Retning: loddrett (valgt)» med loddrette løp og CC 14,9.

**Konklusjonen står åpen.** Mest sannsynlig er rommet på skjermen ikke identisk med det lagrede
Rom 5 (det har ingen lagret kabel, så det er aldri godkjent). Det som ville avgjøre det:
Kenneth trykker GODKJENN og lagrer, og sier fra — da kan rommet OG kabelen leses ut som de
faktisk var, i stedet for å gjettes.

---

## 14 · ✅ ROTÅRSAKEN, MÅLT PÅ KENNETHS EGET LAGREDE UTLEGG

Kenneth godkjente og lagret kabelen i Rom 5 15.10.2026 03:33 UTC. Da kunne den leses ut, og
spørsmålet som sto åpent i §13.4 er nå besvart.

### Den lagrede kabelen

| felt | verdi |
|---|---|
| motor | **`v6`** — den gamle motoren, ikke `geo` |
| CC | 14,949 cm (= «149 mm» i verktøylinja) |
| form | 20 `runs`, 2 `connections`, **0 `pathEls`** |
| `_geomOk` | **false** |
| `_geomDefects` | **utenfor · kryssing · nærføring · lengde · brudd** |

Rommet er bit for bit identisk med `rom5`-fixturen (samme ti punkter), ingen soner, ingen
hindringer, ingen tvungen CC. Den nye motoren deltok altså ikke i konkurransen — V6 vant fordi
den var alene.

### Hvorfor: clipper-lib var ikke lastet

`_cableLegalRegion` trenger clipper-lib for ekte polygon-offset. Biblioteket lastes **lat fra et
CDN** (`_cblLoadClipper`, 068), og er det ikke lastet, faller funksjonen tilbake på
`_offsetPolygon` — hjørnevis offset, som kommentaren selv sier er «mindre riktig i konkave
hjørner». Rom 5 har en konkav veggstubbe.

Målt på fixturen, samme rom og samme innstillinger:

| | motor | CC | gyldig | defekter |
|---|---|---|---|---|
| `_cblClipperReady() === false` | **v6** | 14,14 | **nei** | utenfor · kryssing · nærføring · lengde · brudd |
| clipper lastet | **geo** | 15,28 | **ja** | ingen |

Den øverste raden er Kenneths utlegg.

### ⚠ Ingen venter på lastingen før kabel legges

`_cblLoadClipper()` kalles bare **tre** steder:

| sted | hva |
|---|---|
| `_cableGalleryRun` | galleriet |
| `_cableGeometryRegressionTest` | testbatteriet |
| `_geomSjekkLagredeUtlegg` | 072-kontrollen ved prosjektåpning |

**Ingen av dem er utleggsveien.** `_autoFillCableImpl` er synkron og sjekker aldri om
biblioteket er klart — den bare kjører. Første auto-utlegg i en økt treffer derfor et
`_cblClipperState === 'idle'` med mindre prosjektåpningen rakk å laste det først.

Det forklarer alt som har vært uforklart:

- **hvorfor det vekslet mellom Kenneths skjermbilder** — et kappløp mot CDN-et,
- **hvorfor alle mine målinger var grønne** — jeg `await _cblLoadClipper()` alltid først,
- **hvorfor 074d og 074e var identiske** — ingen av dem rører dette,
- **hvorfor det så ut som en geometrifeil** — utlegget KOM fra en motor 068 allerede hadde målt
  til å krysse seg selv.

Tilbakefallet er dessuten **stumt**: `_cableLegalRegion` setter `approx: true`, men ingenting
leser det, og brukeren får ingen beskjed.

### Forslag (BYGGET 15.10.2026 som 077 — se §15)

1. **Forhåndslast ved oppstart.** Ett `_cblLoadClipper()` i oppstarten fjerner kappløpet i
   praksis.
2. **Ikke tap stumt.** `_autoFillCableImpl` bør vite at området er tilnærmet: enten utsette
   utlegget til biblioteket er klart, eller merke kabelen slik 070 merker alt annet.
3. **Egen fixture-variant** i galleriet som kjører med clipper slått av, så dette ikke kan
   komme tilbake uoppdaget.

⚠ Dette er en **gren-feil**, ikke i drift: hele clipper/geo-maskineriet kom i 068, og `main`
står på 073 (bygget på 1519bb0, før 068).

---

## §15 · 077 — fiksen (bygget 15.10.2026)

Alle tre forslagene i §14 er bygget. Ingen terskel og ingen motor er rørt; dette handler bare om
at biblioteket er på plass før noe legges ut.

**1. Forhåndslast ved oppstart.** Ett `_cblLoadClipper()` rett etter `initSupabase()`.
Målt på en kald lasting: skriptet hentes 112 ms etter navigasjonsstart og er i minnet etter 114 ms
— lenge før noen kan rekke å klikke et produkt. Kommentaren på `_cblLoadClipper` som fortsatt
påsto «LAT, bare når kontrollen faktisk kjøres» er oppdatert; den var blitt usann.

**2. Utleggsveien venter — betinget.** `_cablePreviewPlace` er delt i to:
en vakt som venter, og `_cablePreviewPlaceNow` med den gamle kroppen.

> ⚠ **Første forsøk gjorde hele funksjonen `async`, og det var feil.** Jeg skrev i kommentaren at
> «ingen kallsted leser tilstand synkront etter kallet». Det var en antakelse, ikke en måling:
> `_soneRegressionTest` (8 påstander) og «Fyll rom automatisk» (`room._cablePreviewMeta`,
> `_confirmCablePreview`) gjør nøyaktig det. Testbatteriet fanget det. Vakten venter derfor bare
> når biblioteket faktisk ikke er klart — er det klart, er kallet synkront akkurat som før.

**3. Ikke tap stumt.** `_autoFillCableImpl` setter `cable._geomApprox = true` når området bare var
tilnærmet, og `_cableStatusLines` gir en advarsel: *«Lagt uten polygonbiblioteket — kantene er
tilnærmet. Legg på nytt for et eksakt utlegg.»* Fail-open som 060: det legges fortsatt ut.

**4. Låst med en test.** Seks nye påstander i `_cableGeometryRegressionTest` kjører Rom 5 **med
clipper slått av** og sammenligner:

| | motor | gyldig | merket |
|---|---|---|---|
| clipper av | v6 | nei (utenfor · kryssing · nærføring · lengde · brudd) | `_geomApprox` + panellinje |
| clipper på | **geo** | **ja** | — |

Pluss to oppførselspåstander som hindrer at `async`-feilen kommer tilbake: klart bibliotek skal
gi et **synkront** kall, ulastet skal gi et løfte.

**Status:** 22 av 22 batterier grønne (`_cableGeometryRegressionTest` 77 påstander).
Galleriet er ikke regenerert — det `await`-er biblioteket selv og har derfor uendrede tall.

**Sidefunn, rettet i samme runde:** `_prosjektlaasRegressionTest` sin påstand «i går gir «i går
HH:MM»» brukte «30 timer siden», som før kl. 06 lander i forgårs. Den var rød av klokka, ikke av
koden. Bygger nå i går eksplisitt (kl. 12 lokalt).

---

## §16 · 078 — «GODKJENN lagrer ikke» var feil. Indikatoren løy.

Jeg tilbød en fiks for at GODKJENN ikke lagret. **Den feilen finnes ikke, og målingen viste det
med en gang.** Diagnosen var en grep etter `_scheduleAutoSave` i bekreftelsesveien — ikke en
måling av kodestien. `pushUndo` kaller `_scheduleAutoSave()` på siste linje, og `_cablePreviewPlace`
kaller `pushUndo`. Målt på den ekte veien:

| steg | planlagte lagringer |
|---|---|
| `_cablePreviewPlace` | **1** |
| `_confirmCablePreview` | 0 (trenger ikke) |
| `finishRoomWorkflow` | 0 (trenger ikke) |

Den ene grenen i `pushUndo` som hopper over planleggingen (`_undoSuppress > 0`) er også tett:
alle fem undertrykkelsene kaller `pushUndo()` **før** de skrur den på.

**Men symptomet Kenneth opplevde var ekte, og årsaken lå i indikatoren.** Målt: etter GODKJENN er
`_projectDirty === true`, mens lagre-indikatoren er **byte-identisk** med før endringen —
«Lagret 05:54:47», grønn prikk. Den hadde ingen tilstand for «ikke lagret ennå»; de fem den kjente
var `saving`, `saved`, `offline`, `error`, `readonly`. I vinduet mellom en endring og at
autolagringen fyrer (≥ 5 s, lenger hvis man fortsetter å jobbe) påsto den at alt var lagret.
Derfor trykket han Lagre manuelt — indikatoren ga ham ingen grunn til å tro noe annet.

**Fiksen** er en sjette tilstand, satt i `_scheduleAutoSave` — funnelen alle 50 mutasjonsveiene
går gjennom, ikke på 50 kallsteder, samme arkitektur som 030 og 060 §3 bruker:

| tilstand | prikk | tekst | tittel |
|---|---|---|---|
| `saved` | grønn, fylt | 05:56:52 | Lagret 05:56:52 |
| `dirty` | grå, **åpen ring** | 05:56:52 | Ulagrede endringer – sist lagret 05:56:52. Lagres automatisk. |
| `saving` | oransje, fylt | — | Lagrer… |

Dempet og åpen, ikke rød: autolagringen tar det om fem sekunder, så dette er en opplysning, ikke
en feil. Tidspunktet står igjen fordi «sist lagret 05:56» er nyttig. Kontrast regnet (panelet var
skjult, så ikke sett): `#9097a8` på `#1b1d21` ≈ 5,8:1.

Fem nye påstander i `_prosjektlaasRegressionTest`, som alt eier regelen «indikatoren lyver ikke»:
skitten ≠ lagret, teksten sier «Ulagrede endringer», tidspunktet beholdes, kundemodus rører den
ikke (030), og skrivebeskyttet vinner over skitten (060 §3).

**Lærdom, samme som §15:** jeg skrev en grep som om den var en måling. Begge gangene i samme
serie. STEG 0 er ikke å lese koden — det er å kjøre den.

---

## §17 · 079 — jevn CC over hele gulvet (15.10.2026)

Kenneths regel, ordrett 15.10.2026:

> «Kabelstrengen som går vannrett langs utstikkeren må fortsette litt lenger inn i rommet, slik
> at løpet som skal gå loddrett flukter med løpet ovenfor. Da skal siste løp mot yttervegg under
> utstikker flukte med siste løpet mot yttervegg over utstikker. Dersom kabel blir litt for kort,
> justeres dette med at alle løp reduseres litt på lengde. Dersom kabel er for lang, justeres
> dette med tettere cc og flere løp.»

### Hva som faktisk var galt (målt, ikke antatt)

Fixturet `rom5` ble først verifisert **bit-identisk** med Kenneths live-rom i Supabase, og det
lagrede utlegget ble lest ut og målt. Banene i det var:

```
ØVRE:  697,2 … 788,9   [804,2 TOM]   819,4 … 972,3
NEDRE: 681,9 … 972,3   (alle 20 baner)
```

Hullet oppstår **i rutingen, ikke i celledelingen.** Rutenettet ga 804,2 full høyde
(−1027→−849). Transitten kapper bane 788,9 ned til A-siden men lar den ligge igjen *inne i*
nabocellens serpentin, og U-svingen ut av en kappet bane må ligge på det kappede nivået — da
dras naboen 804,2 ned til 58 cm. Det var de 30,5 cm Kenneth så.

Og forslaget hans var forbudt av én linje i `_geoFindTransits`:
`if (Math.abs(nearB.pos - t.pos) > cc * 1.25) continue;` — klatrebanen måtte ligge inntil
ytterste bane over hindringen, så 804,2 ble aldri vurdert.

### Fire endringer

1. **079 · A-eid transittbane** (ny fjerde variant ved siden av skjøvet/kappet/fjernet).
   A-siden av transittbanen gis til celle A i stedet for å bli liggende i nabocellen. Nabocellen
   står da uklippet.
2. **079b · ytterste løp flukter.** A gir fra seg sitt ytterste løp slik at det flukter med
   cellen over hindringen. ⚠ Dette er ikke kosmetikk: med transittbanen lagt til fikk A et
   **partall** baner (8), og boustrophedon gir da inn- og utgang i samme ende — hullet flyttet
   seg bare én bane. Med oddetall kan A komme inn nede og gå ut oppe. Kenneths to instruksjoner
   viste seg å være én og samme løsning.
3. **079c · `jtRound` i `_cableLegalRegion`.** Ved et innstikkende hjørne strekker en gjæring seg
   `delta/sin(θ/2)` fra hjørnepunktet — 7,07 cm for et rett hjørne med 5 cm margin. Transittens
   sving lå 5,36 cm fra stubbenesen, lovlig etter produktkravet, men ble underkjent med «1,1 cm
   utenfor». Det ugyldiggjorde **hele CC-trinnet** for alle varianter. Kantavstand er en avstand,
   ikke en gjæring. Endringen kan bare gjøre området større.
4. **079d · for lang kabel → tettere CC og flere løp.** Kjører bare når vinneren har et hull.
   ⚠ Dette er ikke nabotrinn-søket 076 fjernet: der ble CC flyttet for å *lete etter* jevnhet, og
   det ble rullet tilbake tre ganger. Her er jevnheten allerede avgjort av baneeierskapet, og det
   eneste som gjenstår er at det jevne utlegget bruker mindre kabel enn produktet har.

### To målefeil funnet underveis

**`_geoInteriorHoles` leste `grid.lanes`,** som ikke oppdateres når en transittvariant fjerner en
bane (`Object.assign({}, grid, {cells, …})` lar `lanes` følge med urørt). Blind flekk: en bane
tom i det nedre båndet men i bruk i det øvre meldte «0 hull». Målingen leser nå senterlinja, og
teller to former for hull: sprang over 1,5 CC mellom naboløp i samme bånd, **og** en kolonne som
ikke dekker det båndet begge naboene dekker. Den siste manglet helt.

**Min egen instrumentering løy.** Jeg satte taggen i `_geoPlanTraversals`, og den siste sjekken
`_autoFillCableImpl` kjører på vinneren arvet forrige tagg. Jeg leste «A-EID GYLDIG» for tall som
kom fra `kappet`, og var i ferd med å melde en seier som ikke fantes. Tellingen per steg
(bygget / plan / sjekk / scoret) avslørte det.

### Målt resultat

| fixture | før | etter |
|---|---|---|
| rom5 600W | CC 15,28 · 34,89 m (−0,32 %) · dekning 91,5 % · **1 hull** | CC 14,52 · **35,00 m (0,00 %)** · 89,1 % · **0 hull** |
| rom5 700W | CC 13,20 · 40,97 m (−0,07 %) · 93,4 % · 0 hull | **uendret** |
| badHakk 41 m | CC 13,18 · 41,03 m (+0,07 %) · 91,0 % · **1 hull** | CC 12,61 · **41,00 m (0,00 %)** · 86,7 % · **0 hull** |

Begge rommene ga fra seg dekning og fikk jevn CC **og** eksakt produktlengde tilbake. Dekningsgulvet
i regresjonen er senket 88 → 85 %, og innrømmelsen «badHakk41 får ha ett hull» (076) er fjernet:
ingen fixture har lenger lov til å ha hull. 22/22 batterier grønne, 996 påstander.

Motoren bruker 338 ms mot 173 ms på rom5 600W — 079d kjører bare når vinneren har hull.

---

## §18 · 080 — hjørnevelgeren betyr noe (15.10.2026)

> ⚠ **Målt med speilvendt y-akse — se §26.** Tallene er riktige, men hjørnene de
> er målt mot er byttet om: «øvre» var i virkeligheten nedre. Historikken står urørt.

Kenneth, etter at utlegget ble godkjent: *«Det eneste som ikke stemmer er start kabel ifht
velgeren øverst til venstre i menyen hvor man setter innsetningspunkt og retning.»*

### Hva som var galt

**Hjørnevalget var dødt i geo-motoren.** Målt: alle fire valg ga identisk start, (972, −923),
oppe til høyre. To uavhengige grunner:

1. `_geoMakeCable` bar `startCorner` videre som en ren **etikett**. Ingenting orienterte banen.
2. `_geoScore` fikk `corner: wantCorner, wantCorner` inn, så `ctx.corner === ctx.wantCorner` var
   **alltid sant**. De tre poengene for riktig hjørne ble delt ut uansett hvor kabelen startet.

### Fiksen

En varmekabel har ingen egen retning — den kalde halen kan sitte i hvilken som helst ende — så
punktlista snus gratis. `_geoMakeCable` velger nå den av rutens to ender som ligger nærmest det
valgte hjørnet, og `_geoScore` måler det **faktiske** hjørnet, slik at søket kan foretrekke en
rute som virkelig starter der.

### Grensen, og hvorfor den sies fra om

Rutens to ender er gitt av geometrien. På Rom 5 med 600W er **hver eneste** kandidat `tl→tr`
eller `tl→br` — ingen rute ender nede til venstre, fordi nettopp det hjørnet er der transitten
går ut, og den enden kan ikke også være kabelens ende.

Derfor lagres `_startCornerActual` på kabelen, og panelet sier:
*«Start: oppe til venstre — nede til venstre er ikke mulig i dette rommet.»*
Nivå `ok`, ikke `advarsel`: ingenting er galt med utlegget, og `_cableStatusToast` siler bort
`ok`, så dette blir ikke en toast på hvert utlegg. Samme prinsipp som `_geomApprox` i 077 —
aldri et stumt avvik.

### Målt sluttresultat (Rom 5, loddrett, nedre venstre valgt)

| produkt | CC | lengde | hull | maks gap øvre/nedre | start |
|---|---|---|---|---|---|
| InFloor 17T 600W 35m | 14,5 | **35,00 m (0,00 %)** | 0 | 14,6 / 14,6 | tl |
| InFloor 17T 700W 41m | 13,2 | 40,97 m (−0,07 %) | 0 | 13,2 / 13,2 | tl |
| InFloor 10T 600W 60m | 8,8 | **60,00 m (0,00 %)** | 0 | 8,8 / 8,8 | tl |

22/22 batterier grønne, 1003 påstander.

---

## §19 · 081 — opp/ned i hjørnevelgeren, og hindringer målt

> ⚠ **Målt med speilvendt y-akse — se §26.** Tallene er riktige, men hjørnene de
> er målt mot er byttet om: «øvre» var i virkeligheten nedre. Historikken står urørt.

Kenneth 15.10.2026: *«Hjørnevelgeren funker fortsatt ikke helt. Spesielt på de vannrette
utleggene, den tar ikke høyde for om jeg setter start opp eller nede, kun venstre eller høyre.
Og når jeg velger loddrett og setter velgeren øverst til venstre, starter den [midt på veggen],
ønsker at den starter helt øverst i venstre hjørnet. Hvordan er denne motoren ifht hindringer?»*

### Hvorfor opp/ned ble ignorert

080 gjorde hjørneleddet levende, men det var fortsatt **binært på kvadrant**
(`ctx.corner === ctx.wantCorner`). ⚠ MÅLT: starten på Rom 5 lå 21 cm over rommets midtlinje og
ble derfor målt som «øvre» — poengleddet så ingen forskjell på den og et punkt 68 cm høyere
oppe. Leddet er nå **gradert på avstand** til det valgte hjørnet
(`_geoCornerDist`, `s += 4 * (1 − d/diagonal)`), og da teller sveipeaksen med.

Målt på Rom 5, 700W vannrett: `tl` → y = −841, `bl` → y = −1035 (rommet er −836 … −1040).
Opp/ned blir hørt på.

### Loddrett: paritet låser starten, og det er den samme loven som 079b

Alle kandidater starter på (695, −917) — **ingen rute ender øverst til venstre**. Det øvre
venstre feltet har **6 baner, et partall**. Kabelen kommer inn nedenfra via transitten under
utstikkeren, og med partall baner må den ut i samme ende den kom inn. For å komme ut øverst må
feltet ha et oddetall baner — altså ett løp mindre, som koster dekning og endrer utlegget
Kenneth nettopp godkjente. **Ikke gjort. Venter på Kenneths beslutning.**

I stedet lagres `_startCornerOffCm` og panelet sier:
*«Start: 83 cm fra oppe til venstre — nærmere er ikke mulig med dette utlegget.»*
(Nivå `ok`, så den ikke toaster.) Kvadrant-meldinga fra 080 står ved siden av, for de tilfellene
der hjørnet er helt umulig.

### Hindringer — målt, ikke antatt

| fixture | resultat |
|---|---|
| `enHindring` loddrett | 96,00 m (0,00 %) · 0 hull · 0 kryssinger · 0 utenfor · dekning 90,7 % · **gyldig** |
| `enHindring` vannrett | 96,00 m (0,00 %) · 0 hull · dekning 91,8 % · **gyldig** |
| `flereHindringer` (3 stk) | **UGYLDIG** — 2139 cm utenfor, brudd, nærføring 0 cm, +24 % lengde |

Med **én** hindring legger motoren seg rundt den på nøyaktig samme måte som rundt veggstubben —
samme transittmekanikk, samme kantavstand. Med **tre** faller den gjennom: 10 celler som trenger
6 transittkorridorer mot et tak på 2. Ny motor finner ingen løsning, og en av de gamle vinner
alene med et ugyldig utlegg. Står fra før på lista over ting som må løses før merge.

### Uendret

| | |
|---|---|
| 600W 35m | CC 14,5 · 35,00 m (0,00 %) · 0 hull · gap 14,6/14,6 · 89,1 % |
| 700W 41m | CC 13,2 · 40,97 m (−0,07 %) · 0 hull · gap 13,2/13,2 · 93,4 % |
| 10T 600W 60m | CC 8,8 · 60,00 m (0,00 %) · 0 hull · gap 8,8/8,8 · 91,8 % |
| badHakk41 | CC 12,6 · 41,00 m (0,00 %) · 0 hull · gap 12,7/12,7 · 86,7 % |

22/22 batterier grønne, 1008 påstander.

---

## §20 · 082 — ett løp mindre, og hva det faktisk koster

> ⚠ **Målt med speilvendt y-akse — se §26.** Tallene er riktige, men hjørnene de
> er målt mot er byttet om: «øvre» var i virkeligheten nedre. Historikken står urørt.

Kenneth 15.10.2026: *«ta ett løp mindre i øvre felt.»*

### Mekanismen virker

Paritetsvarianten er bygget (`_geoParityVariants`): ytterste bane fjernes fra én celle, aldri en
inne i cellen. Det flipper pariteten, og dermed hvilken ende kabelen kommer ut i. **Målt at den
når hjørnet for alle tre produktene på Rom 5: 26 / 33 / 25 cm, hullfritt.**

### Men prisen er høyere enn den så ut

Med fritt søk nedover CC-stigen brøt runden to låste påstander:

| | før | med fritt paritetssøk |
|---|---|---|
| Rom 5 700W | CC **13,2** (Kenneths fasit) · 93,4 % | CC 12,6 · 91,4 % |
| badHakk loddrett | 92,5 % dekning | 89,7 % |
| regresjonssuiten | 14 s | **over 100 s** |

Runden kjøpte altså hjørnet ved å forringe utlegg Kenneth allerede har godkjent — og 076 låser
nettopp CC 13,2 som fasit for Rom 5.

### Hva som står i koden nå

Paritetsrunden kjører **bare på vinnerens egen CC**, ett forsøk, og aksepterer bare når
resultatet er hullfritt, like nær lengden, og ikke har lavere dekning. Da:

| produkt (Rom 5, loddrett, «øvre venstre») | start | utlegg |
|---|---|---|
| InFloor 17T 600W 35m | **26 cm fra hjørnet** | CC 14,52 · 35,00 m · 0 hull · 89,1 % |
| InFloor 17T 700W 41m | 83 cm | CC 13,20 · 40,97 m · 0 hull · 93,4 % (fasit, urørt) |
| InFloor 10T 600W 60m | 83 cm | CC 8,80 · 60,00 m · 0 hull · 91,8 % |

Panelet oppgir avstanden: *«Start: 83 cm fra oppe til venstre — nærmere er ikke mulig med dette
utlegget.»*

### Beslutningen som gjenstår

For 700W og 10T er valget: **hjørnet, eller fasiten.** 33 cm fra hjørnet koster CC 12,6 i stedet
for 13,2 og 2 prosentpoeng dekning. Koden ligger der (`_geoParityVariants` + `_parityOn`); det
som mangler er å slippe runden ned CC-stigen igjen. **Venter på Kenneth.**

22/22 batterier grønne, 1019 påstander, suiten 19,5 s.

---

## §21 · Trenger vi de gamle motorene? (målt 15.10.2026)

> ⚠ **Målt med speilvendt y-akse — se §26.** Tallene er riktige, men hjørnene de
> er målt mot er byttet om: «øvre» var i virkeligheten nedre. Historikken står urørt.

Kenneths spørsmål. Målt over alle 16 fixturer × begge retninger = 32 utlegg:

| motor | vinner | av disse gyldige |
|---|---|---|
| **geo** | 24 | **24** |
| **skew** | 2 | 2 — begge er `skraa` (rotert rom 18°), som geo ikke håndterer |
| **v6** | 6 | **0 — alle seks ugyldige** |

De seks v6-seirene er `boyUmulig` (CC under 2 × bøyeradius — umulig per konstruksjon),
`kabelForLang` (96 m i et 200×150-rom) og `flereHindringer` (tre hindringer, kjent hull).
v6 vinner altså bare der INGEN motor har et gyldig svar, og tegner da noe som ser plausibelt ut
i stedet for å si «ingen løsning». Det er nøyaktig feilmodusen bak Rom 5-hendelsen i §14.

**Anbefaling (ikke bygget, venter på beslutning):** behold `skew` — den dekker roterte rom geo
ikke tar. Ta `v6`/boustrophedon/serpentine ut av konkurransen, eller la dem aldri vinne over
`_geoNoSolution`, som allerede gir grunn, konflikter og forslag. De tre fixturene over ville da
gi et ærlig «ingen løsning» i stedet for et ugyldig utlegg.

## §22 · «Nedre venstre» loddrett er strukturelt umulig i Rom 5

> ⚠ **Målt med speilvendt y-akse — se §26.** Tallene er riktige, men hjørnene de
> er målt mot er byttet om: «øvre» var i virkeligheten nedre. Historikken står urørt.

Enumerert, ikke sluttet: loddrett gir nøyaktig fire endepar, og to er gyldige —

```
(695,−917) ↔ (972,−1028)        (708,−848) ↔ (972,−1028)
```

Ingen ende ligger ved (677, −1040). Nærmeste er 124 cm unna. Grunnen er at det nedre venstre
feltets frie ende er **brukt opp av transitten**: den må gå under utstikkeren for å nå det øvre
venstre feltet, som er en blindvei. Kabelens frie ender havner derfor i det øvre feltet eller på
høyre side.

Startbanen (x = 695) har to løp — det øvre (−917 → −848) og det nedre (−1028 → −966). Den nedre
enden ligger 22 cm fra hjørnet, men der svinger kabelen videre; den er ikke fri.

**Vannrett klarer det derimot:** `bl` gir start (695, −1035) — **18 cm fra hjørnet**, 41,00 m,
0 hull. Vil man ha starten nede til venstre i dette rommet, er vannrett veien.

---

## §23 · 083 — R-START: start i valgt hjørne. DELVIS FERDIG, to åpne punkter.

> ⚠ **Målt med speilvendt y-akse — se §26.** Tallene er riktige, men hjørnene de
> er målt mot er byttet om: «øvre» var i virkeligheten nedre. Historikken står urørt.

### STEG 0.1 — hvorfor S lå nede til venstre i skjermbildet

**Ingenting snur kabelen i dag.** Målt gjennom hele kjeden — `generateCableGeo` →
`_autoFillCableImpl` → `_cablePreviewPlace` → GODKJENN — er `start` = (697, −841) og
`end` = (695, −1035), uendret i hvert ledd. `_cableEndpoints` returnerer `cable.start`/`end`
rått for geo-kabler, så merkene tegnes der motoren sa.

Uten 080-snuingen ville `start` vært `pts[0]` = (695, −1035), altså **nede til venstre —
nøyaktig skjermbildet**. Skjermbildet er fra kode før 080. Dagens feil er en annen og større:
**ingen av endene er i nærheten av valgt hjørne** (281 og 346 cm fra øvre høyre).

### STEG 0.2 — 128 kombinasjoner (16 fixturer × 2 retninger × 4 hjørner)

| | før (e5127f6) | etter 083 |
|---|---|---|
| treffer hjørnet (≤ 40 cm) | **43** | **68** |
| bommer | 61 | 36 |
| ingen løsning | 24 | 24 |
| motorer som vant | geo 55, skew 6, **v6 6 (alle ugyldige)** | geo 96, skew 8, **v6 0** |

### Bygget

* **v6 ut av konkurransen, skew beholdt** (`_cableCandidatesForDirectionImpl`). Kaskaden er
  ikke fjernet — `_autoFillCableLegacy` er fortsatt fail-open for soner, tvungen CC og manglende
  geometrikontroll.
* **Én hjørnedefinisjon for alle motorer**: `_cableCornerPoint` / `_cableStartCornerOffCm` /
  `_cableHitsCorner`. `_geoMakeCable` bruker den nå både til orientering og til `_startCornerOffCm`.
* **R-START som filter**, ikke poeng: `_cableFilterByCorner` på kaskadenivå, og `treff || best`
  inne i geos `attempt`.
* **Hjørnerunden**: bommer vinneren, letes det ned CC-stigen med paritetsvarianter. Dekningsvakten
  og «samme CC»-kravet fra 082 er fjernet — de var nettopp det Kenneth sa skulle tape.
* **Retningsfallback for hjørnet** + panellinjer (`ok` ved retningsbytte, **⚠ advarsel** når
  hjørnet er umulig, med avstand og grunn).

### ⚠ ÅPENT 1 — regresjonssuiten er 177 s, kravet er 40 s

Kuttene jeg gjorde (arbeidsbudsjett 40 lengdemålinger, stige 5 trinn, tidlig avslutning på
hullfritt treff, hjørnerunden av for alt-retningen, runden kjører bare når vinneren er gyldig)
holdt ikke. Årsaken er strukturell, ikke en innstilling: **hjørnerunden er et nytt, nesten
fullstendig CC-søk som kjører etter hovedsøket**, og i batteriet bommer de fleste utlegg på
hjørnet. Riktig løsning er å gjøre hjørnet til en betingelse **inne i** hovedsøkets CC-løkke
(la `fastLen`/bisekssjonen styre mot trinn som gir hjørnetreff) i stedet for et etter-søk.
Det er en omskriving av lengdesøket, ikke en justering. **Ikke gjort.**

### ⚠ ÅPENT 2 — R-START og 076-fasiten kan ikke begge gjelde for Rom 5 loddrett `tr`

Oppdraget krever både at «Rom 5 / 700W / loddrett / `tr` skal være uendret: CC 13,2, start oppe
til høyre» og at R-START gjelder. Målt: **loddrett kan ikke starte oppe til høyre i Rom 5.**
Rommets øvre høyre hjørnepunkt er (938,6, −836,1) (trinnet), og loddrett-rutens ender er
(972, −1028) og (695, −917) — 195 og 231 cm unna. Under R-START bytter motoren derfor til
vannrett, og fasiten brytes.

Dette er en motsigelse i oppdraget, ikke en feil i koden. **Kenneth må velge**: enten gjelder
R-START også her (og 076-fasiten for `tr` oppdateres), eller `tr` loddrett unntas.

### Prisen målt der R-START slo til

Verste tilfelle er Rom 5 vannrett `tr` (skjermbildet): hjørnet treffes på 30 cm, men dekningen
faller fra ~91 % til **73,9 %** og CC fra 12,93 til 10,20. Lengden er fortsatt eksakt (41,00 m,
0,00 %) og utlegget hullfritt. Panelet sier «⚠ 1,49 m² (26 %) uten kabel» og foreslår et lengre
produkt. Det er regelen Kenneth ba om — men tallet bør han se før dette merges.

---

## §24 · To funn fra Kenneths kontroll 15.10.2026

> ⚠ **Målt med speilvendt y-akse — se §26.** Tallene er riktige, men hjørnene de
> er målt mot er byttet om: «øvre» var i virkeligheten nedre. Historikken står urørt.

### 1. «Innsett øverst venstre, kabel starter nederst venstre» — gammel kode i nettleseren

Målt på 083 (commit e13d2b9), Rom 5 / 600W / loddrett / `tl`:
start **(696, −853) = 24 cm** fra hjørnepunktet (678,8, −836,1). Starten ligger der velgeren
peker. Kenneths skjermbilde mangler dessuten ⚠-linja 083 legger inn — begge deler stemmer med
at nettleseren kjører kode fra før 083. **Hard reload.**

⚠ Skjermbildet viser også V9 = **100 cm** og 5,71 m², mens fixturet har 98 cm og 5,70 m².
Rommet er altså endret i skyen etter at bit-identiteten ble verifisert i §17. Fixturet bør
hentes på nytt før neste runde.

### 2. Det udekkede feltet øverst til venstre — det er plass til ETT løp til, ikke to

> ⚠ **Denne målingen gjaldt NEDRE felt** (speilvendt y-akse, se §26), og den ble gjort på et
> fixture som hadde drevet fra Kenneths faktiske rom. Det ØVRE feltet er målt i §28: der er det
> **48,4 cm** fra vegg til første løp — plass til to løp, akkurat som Kenneth sa.

| | |
|---|---|
| venstre vegg over stubben | x = 678,8 |
| første øvre løp | x = 696,4 → gap **17,6 cm** |
| gap mot trinnet på andre siden | 9,9 cm |
| brukbar bredde mellom marginene | 249,8 cm |
| 17 løp ved CC 14,52 | 232,3 cm |
| **18 løp** | **246,8 cm — får plass, 3 cm til overs** |

Det 18. løpet ville ligget på x = 681,9 = **3,1 cm fra veggen** (krav 5). Men skyves hele
rutenettet 1,9 cm til høyre, lander det på 683,8 = nøyaktig 5 cm, og ytterste løp flyttes fra
928,7 til 930,6 — fortsatt 8 cm fra trinnet. **Lovlig.**

**Rotårsak:** banerutenettet fases GLOBALT for hele rommet (300,4 cm), ikke per felt. Nedre felt
har vegg på 676,9 og øvre på 678,8 — 1,9 cm forskjell — og fasen passer det nedre. To løp får
ikke plass uansett: 2 × 14,52 = 29 cm mot 17,6 cm tilgjengelig.

**Forslag til neste runde (ikke bygget):** la rutenettets FASE (ikke CC) optimaliseres slik at
flest mulig baner får plass i hvert felt, med CC uendret. Det bevarer jevn CC (079) og den
globale avstanden (lag D) — det er bare startpunktet for banerekka som flyttes. ⚠ Må måles mot
alle fixturer: en faseforskyvning som gir ett løp mer i ett felt kan koste et løp i et annet.

---

## §25 · 083b — `hitCable` krasjet på hver museklikk. Lerretet var dødt.

Kenneth 15.10.2026: «jeg får ikke trykket på kabel … får heller ikke valgt rommet ved å trykke
på det, jeg må gå i romliste.» Konsollen: **732 uncaught `TypeError: Cannot read properties of
undefined (reading 'x')` fra `hitCable`.**

```js
const a = el.kind === 'run' ? el.a : el.from;      // ← geo har hverken a eller from
const b = el.kind === 'run' ? el.b : el.to;
if (distSeg(wx, wy, a.x, a.y, …))                  // ← kaster
```

`hitCable` kjente bare **skew**-motorens to baneformer. Geo sender ETT element
`{kind:'uturn', pts:[…]}`. Kastet skjer i canvas-mousedown, så **hele klikk-kaskaden avbrytes** —
verken kabel, rom eller vegg lar seg velge. Romlista virker, fordi den ikke går via lerretet.

**Feilen har ligget der siden 068**, da geo begynte å sende `pathEls`. Den var usynlig i alle 22
batteriene fordi **ingen av dem klikker på lerretet** — de kaller motorene og måler resultatet.

Fiksen bruker samme trygge uttrekk som linje ~5193 allerede hadde (`el.pts || [el.from, el.to]`),
og hopper over elementer uten brukbar geometri i stedet for å kaste. En ukjent `kind` kan ikke
lamme lerretet igjen. Fire nye påstander låser det, inkludert et element med ukjent `kind`.

⚠ **Lærdom for testdekningen:** alt som bare kan nås via et museklikk er utenfor alle batteriene.
Det var min feilslutning gjennom hele denne runden at «data stemmer» var det samme som «appen
virker». Kenneth kunne ikke engang velge kabelen for å kjøre diagnosen jeg ba om.

Dette forklarer også hvorfor S/E-merkene så feil ut: jeg sammenlignet piksler i skjermbilder mot
data, og kom til at merkene var byttet om. Det var en gjetning jeg ikke kunne måle. Den står
fortsatt uavklart — men nå kan kabelen velges, så den lar seg endelig sjekke.

---

## §26 · 088 — hjørnene var SPEILVENDT. Rotårsaken bak alt fra 080 til 083.

### STEG 0 — bekreftet før noe ble endret

`w2s` (:4662) er `y = (wy − panY)·sc + h/2`. Større world-y ligger altså lenger **NED**.
Målt på Rom 5, world-y mot skjerm-y side om side:

| world-y | skjerm-y | kant | på skjermen |
|---|---|---|---|
| **−1040,1** | **−1485** | 300 cm (**V5**) | **ØVERST** |
| −836,1 | −1179 | 260 cm (**V1**) | **NEDERST** |

«Topp» er **minst** y. De fire hjørnehjelperne i geo-motoren hadde motsatt regel, og
kommentaren min påsto til og med at det var «samme konvensjon som `_uTurnIsHigh`» — det var
feil; de gamle motorene hadde riktig akse hele tiden.

Rettet: `_cornerTarget` (ny, felles), `_cableCornerPoint`, `_geoCornerPoint`, `_geoCornerDist`,
`_geoCornerOf`. Panelets hjørnetekster leser samme funksjon og ble riktige av seg selv.

### Hva det betyr for det jeg har meldt tidligere

* **§24.1 «gammel kode i nettleseren» var FEIL.** Kenneth så riktig: han valgte øvre venstre og
  fikk nedre venstre. Min måling «24 cm fra hjørnepunktet (678,8, −836,1)» var riktig regnet mot
  **nedre** venstre. Konklusjonen om hard reload var min feil, ikke hans.
* **§23 ÅPENT 2 er LØST.** Rom 5 / 700W / loddrett / `tr` gir nå **CC 13,2 · loddrett ·
  start 13 cm fra hjørnet · 0 hull · dekning 93,4 %**. 076-fasiten og R-START gjelder samtidig,
  uten unntak. Det var aldri en motsigelse — det var en speilvending.
* **§22** («nedre venstre loddrett strukturelt umulig») gjaldt i virkeligheten **øvre** venstre.
* **§19/§20** (83 cm, paritet i «øvre» felt) er speilet på samme måte.

### 128 kombinasjoner

| | før 083 | 083 (speilvendt) | **088** |
|---|---|---|---|
| treffer hjørnet (≤ 40 cm) | 43 | 68 | **71** |
| bommer | 61 | 36 | **33** |
| ingen løsning | 24 | 24 | 24 |

### Rom 5, loddrett

| produkt · hjørne | start-avstand | retning | CC | dekning | hull |
|---|---|---|---|---|---|
| 600W · tl | 13 cm | vannrett (byttet) | 14,91 | 90,2 % | 0 |
| 600W · tr | 28 cm | loddrett | 11,61 | **71,3 %** | 0 |
| 600W · bl | 24 cm | loddrett | 14,52 | 89,1 % | 0 |
| 600W · br | **97 cm** | loddrett | 14,52 | 89,1 % | 0 |
| 700W · tl | 18 cm | vannrett (byttet) | 12,93 | 93,4 % | 0 |
| **700W · tr (fasit)** | **13 cm** | **loddrett** | **13,20** | **93,4 %** | **0** |
| 700W · bl | 24 cm | loddrett | 11,61 | 84,3 % | 0 |
| 700W · br | **195 cm** | loddrett | 13,20 | 93,4 % | 0 |

Skjermbildets tilfelle (600W / loddrett / tl) har nå **90,2 % dekning mot 89,1 % før 083** og
0 hull — de tomme banene øverst til venstre er borte, og dekningen er bedre enn før.

### ⚠ Fortsatt åpent

* **Suitetiden.** `_cableGeometryRegressionTest` alene bruker **over 4 minutter**; kravet er 40 s
  for hele suiten. Hjørnerunden er fortsatt et nytt CC-søk etter hovedsøket (§23 ÅPENT 1).
  Etter instruks er omskrivingen av lengdesøket IKKE påbegynt. 8 av 128 utlegg tar over 1,5 s,
  verste 3,5 s.
* **33 bommer.** Mønsteret er nå tydelig: `kabelForKort` (8) er 10 m kabel i et stort rom —
  utlegget dekker bare et hjørne uansett. `skraa` (4) er skew-motoren, som ikke har hjørnesøk.
  `asymmetriskeVegger` (4) bommer på alle fire. Resten er enkelttilfeller der ruten ikke har
  noen ende i nærheten av hjørnet.
* **600W · tr koster dekning** (71,3 %). R-START vinner over dekning etter spec §0.9, men
  tallet bør Kenneth se.

### Byggstempel (088)

`serve-varmeplan.js` svarer på `/__build.json` med gren, commit og starttid, og statuslinja viser
`kabelmotor @ e3d42f2 · startet 11:05` — **kun på localhost**. Kabelpanelet viser dessuten én grå
linje på geo-kabler: `geo · ønsket øvre venstre · start 18 cm fra hjørnet`. Da avgjør et
skjermbilde om utlegget er nytt eller lagret fra før. Det var nettopp dét spørsmålet som kostet
oss tre runder 15.10.

---

## §27 · 088b — valgt retning er hard. Hjørnet bytter den aldri.

Kenneth meldte to ganger at «retningsvelgeren virker ikke». Han hadde rett, men ikke på den måten
jeg lette etter: motoren gjorde akkurat det spec §0.9 sa — **R-START rangerte foran retningen** —
så når loddrett ikke kunne starte i hjørnet, byttet den til vannrett.

**Målt, Rom 5, «øvre venstre»:**

| | start-avstand | dekning | lengde |
|---|---|---|---|
| 600W **loddrett** (valgt) | **188 cm** | 89,1 % | 35,00 m |
| 600W vannrett | 13 cm | 90,2 % | 35,29 m |
| 700W **loddrett** (valgt) | **124 cm** | 93,4 % | 40,97 m |
| 700W vannrett | 18 cm | 93,4 % | 41,00 m |

Loddrett **kan ikke** starte øverst til venstre i det rommet. Byttet var altså ikke en feil — det
var feil rangering.

**Kenneths egne ord 15.10.2026:** «start kabel følger retningsvelgeren … den må vinne over
**dekning**». Han sa aldri over **retning**. Den rekkefølgen kom inn i spec'en i 083-oppdraget,
ikke fra ham.

**Ny rekkefølge (spec §0.9):** harde krav → **valgt retning** → R-START → jevn CC → dekning →
fasit-CC.

Den andre retningen måles fortsatt, men bare for å kunne **tilbys**:

> ⚠ Loddrett kan ikke starte oppe til venstre i dette rommet — nærmeste er 188 cm unna.
> **[Vis vannrett i stedet (start 13 cm)]**

**Målt etter endringen:** retningen beholdes i alle fire prøvene. 076-fasiten urørt (Rom 5 / 700W
/ loddrett / `tr`: CC 13,20, loddrett, 13 cm, 0 hull, 93,4 %). Kenneths tilfelle (600W / loddrett
/ `tl`) beholder loddrett med 89,1 % dekning og 0 hull, og panelet sier hvorfor starten ble
188 cm unna.

⚠ Suitetiden er uendret og fortsatt over kravet (§26).

---

## §28 · 089 — Kenneth har rett: 48,4 cm fra veggen i det ØVRE feltet. Fixturet hadde drevet.

### Reprodusert på Kenneths faktiske geometri

⚠ **Først måtte fixturet hentes på nytt.** `_cableFixtures.rom5` var fra 13.10 og stemte ikke
lenger med rommet i skyen: venstre vegg over stubben sto på x = 678,8 i fixturet mot **677,4** i
virkeligheten, og hjørnet ved stubben 678,1 mot **676,7**. På den gamle geometrien lå begge
venstre felt 19,5 cm fra veggen — **feilen Kenneth meldte fantes ikke i fixturet**. Et fixture som
har drevet fra virkeligheten er verre enn ingen: det gir grønne tester for et rom som ikke finnes.

Med riktig geometri, Rom 5 loddrett, start nede til venstre:

| produkt | CC | ØVRE felt: avstand fra vegg | NEDRE felt | dekning | hull |
|---|---|---|---|---|---|
| **600W 35m** | 14,53 | **48,4 cm** (≈ 3 × CC) | 19,6 cm | 87,2 % | 0 |
| 700W 41m | 12,10 | 17,0 cm | 17,2 cm | 86,1 % | 0 |
| 10T 600W 60m | 6,46 | 17,8 cm | 18,0 cm | 67,3 % | 0 |

Kenneth så riktig, og det gjelder **bare 600W**. De to banene han tegnet i lilla finnes i det
globale rutenettet — det nedre feltet bruker dem — men det øvre feltet starter tre baner inn.

### ⚠ Mekanismen er IKKE fastslått (STEG 0.2 står åpen)

Jeg forsøkte å logge hver kandidat med CC, lengde og veggavstand, men instrumenteringen lider av
samme korrelasjonsfeil som lurte meg i §23: `_cableGeometryCheck` kalles også UTENFOR geo-motoren,
og `window.__p` peker da på en annen senterlinje enn den som måles. Loggen ga motstridende tall
(samme CC og lengde med både 19,4 og 48,4 cm). **Ingen rotårsak er meldt.**

Lengdebudsjettet er fortsatt den mest sannsynlige forklaringen — to løp til koster ≈ 1,9 m, og
kabelen er fast 35,00 m ved CC 14,53 — men det er en hypotese, ikke en måling. Neste runde må
måle den med instrumentering som ikke kan feilkoble kandidat og senterlinje (tagg på selve
kabelobjektet, ikke på en global variabel).

**R-VEGG, større CC og faseforskyvning er derfor IKKE bygget.** Grunnlaget mangler.

---

## §29 · 089 — mekanismen: å fylle veggstripen koster et HULL, og 074b forbyr det

### Instrumenteringen, rettet

Den forrige loggingen brukte en global variabel for senterlinja, og `_cableGeometryCheck` kalles
også utenfor geo-motoren — så kandidat og senterlinje kunne feilkobles (§28). Rettet ved å lese
senterlinja **av kabelen som sendes inn som første argument**. Ingen global. Tallene under er
derfor etterprøvbare.

### Mekanismen

| score | CC | lengde | veggstripe | hull | dekning |
|---|---|---|---|---|---|
| **80,4** ← vinner | 14,53 | 35,00 m (0,00 %) | 48,5 cm (3,34 CC) | **0** | 87,2 % |
| 76,5 | 13,83 | 35,00 m (0,00 %) | 32,6 cm (2,36 CC) | 0 | 83,8 % |
| 57,1 | 13,83 | 35,22 m (+0,62 %) | **18,7 cm (1,35 CC)** | **1** | 84,3 % |

**Det er ikke lengdebudsjettet.** Et gyldig utlegg som fyller stripen finnes, innenfor ±1 %.
Men det har et **hull inne i feltet**, og 074b — Kenneths egen låste regel — sier at jevn avstand
går foran å dekke helt ut mot veggen. Hull-straffen er 25 poeng; R-VEGG-straffen er bevisst 18,
altså lettere, nøyaktig som 089-oppdraget ba om.

Motoren gjør derfor akkurat det reglene sier. **Kenneths to lilla løp kan ikke fås uten et hull
— blant de kandidatene motoren genererer i dag.**

### Bygget

* `_cableWallStripe(cable, room, legal)` → `metrics.wallStripeCm` / `wallStripeCC`.
  Måles **per løp**, ikke per bånd: finnes det et annet løp mellom dette og veggen som overlapper
  det i sveiperetningen? Gjør det ikke, er avstanden en ekte tom stripe.
  ⚠ To feil måtte rettes underveis, begge målt: båndgruppering ble rekkefølge-avhengig og tok et
  felts ytterkant for en vegg (ga 252 cm i et rom på 300), og et 14 cm langt koblingsstykke ble
  telt som feltløp (ingen nabo kan overlappe det med én CC). Løp kortere enn 1,5 CC hoppes over,
  og overlappskravet skaleres med løpets egen lengde.
* R-VEGG-straff i `_geoScore`, gradert fra «kant + 1 CC» til «kant + 2 CC», vekt 18.
  Vekten er målt: lengdeleddet ga vinneren 12 poeng forsprang, så straffen må overstige 12 —
  og tape mot hull-straffen 25.

### Målt, Rom 5 (loddrett, start nede til venstre)

| produkt | CC | veggstripe | i CC | hull | dekning |
|---|---|---|---|---|---|
| 600W 35m | 14,53 | 48,5 cm | **3,34** | 0 | 87,2 % |
| 700W 41m | 12,10 | 17,0 cm | 1,40 | 0 | 86,1 % |
| 10T 600W 60m | 6,46 | 17,8 cm | 2,76 | 0 | 67,3 % |
| 600W **vannrett** | 14,92 | 5,1 cm | 0,34 | 0 | 90,1 % |

### Det som gjenstår, og som er Kenneths valg

Kenneths tegning forlenger transitten langs stubben helt bort til de to nye løpene. **Om den
topologien finnes uten hull er ikke målt** (STEG 0.3) — det krever at varianten bygges for hånd
og kontrolleres. Enten:

* **a)** den finnes → motoren mangler en variant, og den skal bygges, eller
* **b)** den finnes ikke → da forbyr 074b det Kenneth ber om, og han må velge hvilken av de to
  reglene som veier tyngst i dette rommet.

⚠ Suitetiden er uendret og fortsatt over målet (§26). Utleggene tar nå 1,4–5,2 s per rom.

---

## §30 · 089b — varianten finnes, og den koster ingenting. Kenneth hadde rett hele veien.

### Varianten ble bygget og målt (STEG 0.3)

Instrumentert på rutenettet `_geoMakeCable` får inn (ingen globale), viste søket at Kenneths
topologi **allerede genereres**:

```
CC 14,53 · øvre celle 6 baner fra 696,3 · stripe 19,4 cm  →  34,25 m (−2,14 %)  AVVIST: lengde
CC 14,53 · øvre celle 6 baner fra 696,3 · stripe 19,4 cm  →  36,03 m (+2,94 %)  AVVIST: lengde
```

Seks baner, første på 696,3 — nøyaktig de to løpene Kenneth tegnet i lilla. Den ble avvist på
**lengde**: 34,25 m er for kort, 36,03 m for lang, og ±1 %-vinduet (34,65–35,35) treffes ikke.
Lengden er en sagtann i baneantallet (072).

**Men den for lange kan trimmes ned.** `extraSweep` gjør nøyaktig det — motoren prøvde det bare
aldri på denne varianten, fordi `jevnLen` måler den HULLFRIE kandidaten, ikke den som fyller
stripen. Samme feilklasse som 079d: *trimmingen styres av en kandidat vi prøver å komme oss bort
fra.*

### Veggrunden (089b)

Ny `veggLen` + en runde som kjører **bare når vinneren bryter R-VEGG**, og som godtar bare noe
som er like bra på alt annet: gyldig, innenfor ±1 %, hullfritt, og ikke dårligere dekning.

### Målt, Rom 5 (loddrett, start nede til venstre)

| | før 089 | **etter 089b** |
|---|---|---|
| løp i øvre felt | 4, fra 725,3 | **6, fra 696,3** |
| veggstripe | 48,5 cm (**3,34 CC**) | **19,4 cm (1,34 CC)** |
| CC | 14,53 | 14,53 (uendret) |
| lengde | 35,00 m (0,00 %) | 35,00 m (0,00 %) |
| hull | 0 | 0 |
| **dekning** | 87,2 % | **88,7 %** |
| start fra hjørnet | 23 cm | 25 cm |

Bedre på dekning, bedre på veggstripe, uendret på CC, lengde og hull. **Ingenting ble byttet bort.**

| øvrige | CC | stripe | dekning | hull |
|---|---|---|---|---|
| 700W loddrett | 12,10 | 17,0 cm (1,40 CC) | 86,1 % | 0 |
| 10T 60m loddrett | 6,46 | 17,8 cm (2,76 CC) | 67,3 % | 0 |
| 600W vannrett | 14,92 | 5,1 cm (0,34 CC) | 90,1 % | 0 |

⚠ 10T ligger fortsatt på 2,76 CC. Veggrunden fant ingen bedre kandidat innenfor budsjettet der —
ikke undersøkt videre.

⚠ Suitetiden er uendret og fortsatt over målet (§26). 600W tar 2,8 s.

### Rettelsen til §29

§29 konkluderte at «å fylle veggstripen koster et hull, og 074b forbyr det». **Det var feil** —
eller rettere: det gjaldt bare de kandidatene som ble scoret. Den hullfrie varianten fantes, men
nådde aldri poengsummen fordi den ble avvist på lengde før den kom dit. Konklusjonen var riktig om
datagrunnlaget og feil om virkeligheten.

---

## §31 · 090 — den speilede slyngen manglet. Hjørnerunden kjøpte hjørnet med 43 løp.

### STEG 0 — hvem valgte 44 løp, og hvorfor

Nytt fixture `rekt398` (398 × 271, loddrette løp). 1650W 96m, per hjørne, **før**:

| hjørne | N | CC | sving fra vegg | dekning | start-avstand |
|---|---|---|---|---|---|
| tl | 36 | 11,08 | 5,0 cm | 98,4 % | 12 cm |
| tr | 36 | 11,08 | 5,0 cm | 98,4 % | 12 cm |
| bl | 36 | 11,08 | 5,0 cm | 98,4 % | **261 cm** |
| **br** | **43** | **9,02** | **26,3 cm** | **80,0 %** | 31 cm ← Kenneths bilde |

Coworks regnestykke stemmer: 36 løp ved CC 11,08 gir 96,06 m (+0,06 %) uten noen innkorting.
Motoren **finner** det — for tre av fire hjørner.

**Mekanismen (STEG 0.4, og svaret er ja — varianten manglet):** for N = 36, et PARTALL, ender
kabelen med begge endene i samme ende av rommet. Loggen for `br`:

```
N=36 · 96,06 m (+0,06 %) · start (393,−260) slutt (5,−260)  → begge ØVERST · off 261 · GYLDIG
N=36 · 93,33 m (−2,78 %) · start (393,−11)  slutt (16,−260) → avvist paa lengde
```

Varianten med **begge ender nederst** — samme lengde, samme CC — ble aldri bygget.
`_geoCellTraversals` lager fire traverseringer, men `_geoPlanTraversals` gjorde dybde-først og
returnerte **første** lovlige kjede. For et rom med én celle ble det alltid den samme.

Siden `br` da bommet med 261 cm, startet hjørnerunden (083) og lette nedover CC-stigen til den
fant et ODDETALL løp med en ende nede: 43 løp ved CC 9,02. Hjørnerunden har ingen dekningsvakt,
så svingene ble trukket 26 cm inn og dekningen falt til 80 %.

### Rettet

`_geoPlanTraversals(grid, order, hopp)` kan nå hente den 2., 3., … lovlige kjeden, og `attempt`
prøver fire. Å speile slyngen er gratis: samme lengde, samme CC, samme jevnhet.

**Etter — alle fire hjørner likt:** N = 36 · CC 11,08 · 96,06 m (+0,06 %) · sving 5,0 cm fra
begge svingvegger · stripe 5,1 cm · dekning 98,4 % · 0 hull · start 12 cm.
`br` gikk fra 517 ms til 283 ms, fordi hjørnerunden ikke lenger trengs.
1450W 84m er uendret (N = 32, CC 12,51).

### ⚠ «REGRESJONEN» PÅ 076-FASITEN VAR INGEN REGRESJON — se §32 nedenfor

| Rom 5 / 700W / loddrett / `tr` | før 090 | etter 090 |
|---|---|---|
| CC | **13,20** (fasit) | 11,62 |
| dekning | **93,4 %** | 84,3 % |
| start | 13 cm | 19 cm |

CC 13,2-kandidaten **scores ikke lenger i det hele tatt**. Årsaken er en kjedereaksjon, ikke
poengsummen: med flere varianter finner `attempt` et hjørnetreff tidligere, og `tries`-løkka i
lengdesøket bryter av (`if (bestR && |dev| <= tol && !hull) break;`) før CC-trinnet 13,2 prøves.

Dette er IKKE undersøkt videre — økten var på slutten, og jeg ville ikke starte en
justeringsrunde til på tampen. Mest sannsynlige fiks: avbruddsbetingelsen må også kreve at
R-VEGG er oppfylt og at dekningen ikke er vesentlig dårligere enn beste kjente, slik at søket
ikke stopper på det første hjørnetreffet.

### Øvrige fixturer (loddrett, `bl`) — alle gyldige, 0 hull, start ≤ 40 cm

| | CC | stripe | dekning |
|---|---|---|---|
| rom5 600W | 14,53 | 19,4 | 88,7 % |
| rom5 10T | 6,46 | 17,8 | 67,3 % |
| badHakk | 11,60 | 16,7 | 92,5 % |
| lRom | 11,82 | 16,9 | 96,2 % |
| enHindring | 10,26 | 5,1 | 89,0 % |
| rektangel | 12,18 | 5,1 | 97,9 % |

⚠ STEG 0.5 (hullet i Rom 5) ble besvart i §30: varianten fantes, men ble avvist på lengde før
den nådde poengsummen. Ikke en paritetsvariant.

⚠ Suitetiden er ikke målt i denne runden. Enkeltutlegg tar 0,06–1,8 s.

---

## §32 · 090b — «regresjonen» var fasiten målt på et rom som ikke finnes

Jeg meldte i §31 at 090 brøt 076-fasiten (Rom 5 / 700W / loddrett / `tr`: CC 13,20 → 11,62).
**Det var feil**, og jeg bommet to ganger til før jeg målte det ordentlig:

1. **Første hypotese:** avbruddet i `tries`-løkka stoppet på første hjørnetreff. Jeg fjernet det.
   Resultatet var uendret CC 11,62, og alt ble 3–7× tregere. Rullet tilbake.
2. **Andre hypotese:** veggrunden (089b) byttet vinner. Nøytralisert `_cableWallStripe` →
   fortsatt CC 11,62. Avkreftet.
3. **Avgjørende test:** slo av 090s ekstra varianter (`hopp > 0` → null). **Fortsatt CC 11,62.**
   090 var altså ikke årsaken i det hele tatt.

Da sto bare én endring igjen: **089 hentet `_cableFixtures.rom5` på nytt fra skyen.** Målt side
om side på samme kode:

| geometri | CC | lengde | dekning | stripe | start |
|---|---|---|---|---|---|
| gammelt fixture (før 089) | **13,20** | 40,97 m (−0,07 %) | **93,4 %** | 16,7 | 13 cm |
| Kenneths rom i dag | 11,62 | 41,00 m (0,00 %) | 84,3 % | 16,5 | 19 cm |

**076-fasiten «CC 13,2» ble registrert på et rom som ikke finnes lenger.** Kenneth endret Rom 5
etter 13.10 (venstre vegg 678,8 → 677,4, hjørnet ved stubben 678,1 → 676,7). Fasiten må settes
på nytt på den ekte geometrien, eller forkastes.

⚠ **Men ett spørsmål står igjen, og det er ikke besvart:** at ~2 cm veggendring flytter dekningen
fra 93,4 % til 84,3 % er mye. Om det er reelt (rommet er genuint vanskeligere) eller et tegn på
noe annet, er **ikke målt**. Det bør være neste sak.

**Ytelse:** 090s fire varianter koster lite — Rom 5 / `tr` tar 655 ms med og 624 ms uten.
De 4,3 s jeg målte i §31 kom fra det fjernede avbruddet, ikke fra 090.

---

## §33 · 091 — knekkpunktet er funnet og målt. Fiksen er IKKE bygget.

### Hvor det knekker (STEG 0.2)

Interpolert mellom gammel og ny Rom 5-geometri (begge punktene flytter seg 1,41 cm til venstre),
700W, loddrett, `tr`:

| venstre vegg x | CC | dekning | veggstripe | tid |
|---|---|---|---|---|
| 678,79 … **677,49** | **13,20** | **93,4 %** | 16,7 → 17,9 | 0,7–1,0 s |
| **677,47** … 677,38 | 11,62 | 84,3 % | 16,6 | 4,3 s |

**Det er ett hopp, ikke en glidning — og det skjer på 0,2 mm.** Rett før knekket har
CC 13,2-kandidaten veggstripe 17,9 mot grensen 18,2: tre millimeter klaring.

### Hvorfor (STEG 0.3)

Poengsummene på hver side:

```
FØR  (x=677,49):  86,0 · CC 13,20 · 40,97 m · dekn 93,4 %     ← eneste scorede kandidat
ETTER(x=677,47):  97,7 · CC 11,62 · 41,00 m · dekn 84,3 %
                  82,1 · CC 12,10 · 41,00 m · dekn 86,1 %
                  48,0 · CC 12,63 · 40,76 m · dekn 90,7 % (1 hull)
```

**CC 13,20 blir ikke utkonkurrert — den genereres ikke lenger i det hele tatt.**

Rotårsaken ligger i `_geoBuildGrid`:

```js
let N = Math.max(2, Math.round(usable / cc) + 1);
```

`Math.round` er en knivsegg. En breddeendring på 0,2 mm får `usable/cc` til å krysse en
halvgrense, **N hopper med 1**, lengden endres med et helt løp (≈ 2,4 %), og bisekssjonen i
lag F — som antar at lengden varierer jevnt med CC — lander på et annet trinn. Det er
sagtannen lag F-kommentaren allerede beskriver, nå med et målt utslag på 9 prosentpoeng.

### To fikser forsøkt, begge rullet tilbake

1. **Fjerne avbruddet i `tries`-løkka** (090b-hypotesen gjentatt): uendret CC 11,62, og 3–7×
   tregere. Rullet tilbake.
2. **Legge CC-ene for N−2 … N+2 inn i `tries`**, så nabotrinnene alltid prøves: uendret
   CC 11,62, og 0,7 s → 6,5 s. Rullet tilbake.

Nabotrinnene i N er altså ikke nok — CC 13,2 er utilgjengelig på den nye geometrien av en grunn
som ligger dypere enn hvilke CC-verdier søket prøver.

### STEG 0.4 er IKKE besvart

Jeg forsøkte å bygge formen med CC ≈ 13 direkte på dagens geometri, men probe-en brukte bare
BASISrutenettet og utelot transittvariantene motoren faktisk bruker — den ga «ingen rute» for
alle CC rundt 13, og det er ikke en gyldig konklusjon. **Om formen finnes på dagens rom er
fortsatt ukjent.**

### Anbefaling

Den riktige fiksen er den 090-oppdraget allerede beskrev og som ikke er bygget:
**lengdesøket skal iterere over antall løp N, ikke over CC.** Da er N variabelen, CC følger av
N (`cc = W/(N−1)`), og sagtannen forsvinner ved kilden i stedet for å lappes rundt. Det er en
omskriving av lag F og bør være en egen oppgave med eget budsjett — ikke noe å begynne på på
tampen av en økt, som disse to forsøkene viste.

**Robusthetstesten og den nye fasit-påstanden er derfor heller ikke bygget** — de skal måles mot
en motor som er robust, ikke mot en som har knivseggen i seg.

⚠ «CC 13,2» var den GAMLE geometriens tall. Det skal ikke låses igjen.

---

## §34 · 091b — lengdesøket itererer over N. Og den ekte mekanismen bak knekket.

### Omskrivingen

Lag F hadde en innebygd selvmotsigelse som kommentaren selv beskrev: «antall løp N er et
HELTALL, så lagt lengde er en SAGTANN i CC». En bisekssjon forutsetter en jevn kurve. Den lette
altså med feil verktøy på en funksjon den visste var trappeformet.

N er den egentlige frie variabelen (`cc = W/(N−1)`, lag C). Søket teller nå N over hele det
lovlige intervallet i stedet for å halvere CC, med tidlig avslutning når et trinn treffer.

**Resultat: identiske utlegg, 4–8× raskere.**

| fixture | før | etter |
|---|---|---|
| rekt398 1650W | 531 ms | **79 ms** |
| rom5 600W `bl` | 3566 ms | **445 ms** |
| rom5 700W `tr` | 4202 ms | **619 ms** |
| lRom | 4729 ms | **526 ms** |
| badHakk | 1914 ms | **130 ms** |
| enHindring | 1785 ms | 1785 ms |

CC, lengde, dekning, hull og start-avstand er uendret i alle ti prøvene.

### ⚠ Men knekket i Rom 5 består — og mekanismen er en annen enn antatt

Omskrivingen fjerner bisekssjonens blindsoner, men ikke knekket. Målt hvilke CC `attempt`
faktisk kalles med ved t = 0,94:

```
CC 17,08 · 14,52 · 12,63 · 12,10        →  N−1 = 17, 20, 23, 24
```

**Ikke sammenhengende.** Trinnene N−1 = 18, 19, 21 og 22 mangler, og CC 13,2 er nettopp 22.
Disse trinnene hoppes ikke over av søket — `measure` returnerer **null**: rutenettet på de N-ene
lar seg ikke rute i det hele tatt ved den veggposisjonen (`_geoPlanTraversals` finner ingen
lovlig overgangskjede for noen cellerekkefølge).

Så knekket ligger ikke i lengdesøket og ikke i `Math.round`-knivseggen. Det ligger i at
**rutingen mister et helt N-trinn når veggen flyttes 0,2 mm** — sannsynligvis fordi en bane
faller utenfor lovlig område eller en celle blir for tynn til at transitten kan kobles.
Det er neste sak, og den skal måles i `_geoPlanTraversals`, ikke i lag F.

### Hva som IKKE er gjort

Robusthetstesten (±1/±2 cm) og den nye fasit-påstanden for Rom 5 er fortsatt ikke bygget — de
skal måles mot en motor der N-stigen er sammenhengende.

---

## §35 · 092 — rotårsaken er funnet og målt i millimeter. Fiksen er IKKE klar.

### ⚠ §34 var feil. Rutingen mister ingen trinn.

Første måling i 092 avkreftet premissen: ved **begge** veggposisjoner ruter hvert N-trinn fra
17 til 24 (`RUTER 4` overalt). `_geoPlanTraversals` feiler ikke.

⚠ Og min egen «W faller fra 290,4 til 278,3 cm» var en **målefeil**: jeg utledet W fra antall
baner i et prøverutenett, og når en bane mangler blir W for lav — så de to tabellene ba om
*forskjellige* CC-verdier. Det lovlige området er i virkeligheten stabilt (areal 5,117–5,119 m²,
x fra 681,70–681,85 til 972,31 over hele intervallet).

### Den ekte mekanismen, i millimeter

Med faste CC-verdier ved begge posisjoner er forskjellen den samme i hver rad — **celle 0 mister
sin ytterste bane**:

| cc 13,20 | celle 0 | lengde |
|---|---|---|
| x = 677,49 | **8 baner fra 681,9** | **40,97 m** (−0,07 %) ✓ |
| x = 677,47 | 7 baner fra 695,0 | 39,57 m (−3,5 %) ✗ |

Hvorfor: rutenettet spenner **nøyaktig** fra `pMin + EDGE_EPS` til `pMax − EDGE_EPS` — ingen
slakk (det var 072-fiksen). `pMin` er det lovlige områdets ytterste PUNKT, og med en lett skrå
vegg berører området det punktet bare i ett y; den brukbare loddrette grensen ligger noen
hundredeler lenger inn.

```
x = 677,49:  pMin 681,81 → bane 0 på 681,86  → innenfor grensen 681,85  ✓
x = 677,47:  pMin 681,79 → bane 0 på 681,84  → 0,01 cm UTENFOR          ✗
```

**Ett løp er ≈ 1,4 m kabel.** Uten det faller CC 13,20 ut av ±1 %, søket går ned til 12,10/12,63
og ender på 11,62 etter trimming — og dekningen faller fra 93,4 % til 84,3 % av en halv
millimeter veggflytting.

### Fiksen som er forsøkt

Ytterste bane (`i === 0` eller `i === N−1`) flyttes noen tideler INN til skanlinja gir
intervaller — og blant posisjonene velges den som betjener **flest felt**, ikke den første som
gir noe (målt: ved +0,10 cm fikk Kenneths rom ett intervall, ved +0,20 to). CC er uendret, alle
andre baner står stille, og banen flyttes aldri ut av lovlig område.

**Virker på hovedsaken:**

| | før | etter |
|---|---|---|
| rom5 / 700W / `tr` (Kenneths rom) | CC 11,62 · 84,3 % | **CC 13,20 · 41,00 m (0,00 %) · 94,1 %** |
| rom5 / 10T / `bl` | CC 6,46 · 67,3 % | **CC 8,80 · 92,1 %** |

Knekket er flyttet fra x = 677,48 til ≈ 677,25 — Kenneths geometri (677,3816) ligger nå trygt
innenfor i stedet for en tidel utenfor.

### ⚠ MEN: R-START brekker på to tilfeller. Skal ikke pushes.

| | før | etter |
|---|---|---|
| rom5 / 600W / `bl` | start **25 cm** · stripe 19,4 | start **77 cm** · stripe 33,8 |
| rom5 / 10T / `bl` | start **31 cm** | start **67 cm** |

R-START krever ≤ 40 cm. Den forskjøvede ytterste banen endrer hvor serpentinens frie ender
havner, og hjørnet mistes. Dette er **ikke** undersøkt videre — økten var på slutten.

Øvrige fixturer er uendret (rekt398 98,4/98,2 %, badHakk 92,5 %, lRom 96,2 %, uRom 92,6 %,
rektangel 97,9 %, enHindring 89,0 %).

### Ikke bygget

Robusthetstesten (±1/±2 cm), den sammenhengende-stige-påstanden og den nye fasit-påstanden er
ikke bygget — de skal måles mot en motor der R-START står.

### Tid

rom5 0,9–2,0 s · rekt398 0,05 s · badHakk 0,14 s · lRom 0,53 s · enHindring 1,8 s.

---

## §36 · 093 — forskjøvet ytterbane som VARIANT. R-START og R-VEGG tilbake.

### STEG 0.3 — minste forskyvning

På Kenneths geometri (x = 677,3816), cc 13,20, bane 0 på 681,75:

| forskyvning | intervaller |
|---|---|
| 0 … +0,05 cm | **0** |
| **+0,08 cm** | **1** |
| +0,10 cm | 1 |
| **+0,15 cm** | **2** (begge felt) |

### Fiksen

092 forskjøv ALLTID. Det løste to rom og brakk to andre — forskyvningen flytter hvor
serpentinens frie ender havner, og det er gunstig noen steder og ugunstig andre.

Samme lærdom som den speilede slyngen i 090: **en slik endring skal være en variant, ikke en ny
standard.** `_geoBuildGrid` tar nå `forskyv` (0 = ingen, 1 = minste som gir et intervall,
2 = minste som betjener flest felt), rutenettet rapporterer `ytterbaneFalt`, og `gridsFor` bygger
de forskjøvne variantene **bare når basisrutenettet faktisk mistet en ytterbane**. Alle går
gjennom transittvariantene, rutingen, kontrollen og R-START-filteret. Reglene velger.

### Målt — alle ti fixturer

| | før 092 (`8b888dd`) | 092 (ødelagt) | **093** |
|---|---|---|---|
| rom5 700W `tr` | CC 11,62 · 84,3 % · start 13 | CC 13,20 · 94,1 % · start 13 | **CC 13,20 · 94,1 % · start 13** |
| rom5 600W `bl` | CC 14,53 · 88,7 % · stripe 19,4 · start 25 | 88,2 % · **stripe 33,8 · start 77** | **88,9 % · stripe 19,4 · start 25** |
| rom5 10T `bl` | CC 6,46 · 67,3 % · start 31 | CC 8,80 · 92,1 % · **start 67** | **CC 6,46 · 67,3 % · start 31** |
| rekt398 1650W `br` | 98,4 % · start 12 | — | 98,4 % · start 12 |
| rekt398 1450W `tl` | 98,2 % · start 15 | — | 98,2 % · start 15 |
| badHakk `bl` | 92,5 % · start 20 | — | 92,5 % · start 20 |
| lRom `bl` | 96,2 % · start 13 | — | 96,2 % · start 13 |
| rektangel `bl` | 97,9 % · start 15 | — | 97,9 % · start 15 |
| uRom `bl` | 92,6 % · start 16 | — | 92,6 % · start 16 |

Ingen fixture er dårligere enn på `8b888dd` på retning, R-START, hull, lengde eller R-VEGG.
Alle har start ≤ 40 cm og 0 hull.

### ⚠ 10T beholder IKKE 092-gevinsten — og det er riktig

Oppdraget ba om at både 700W `tr` og 10T `bl` skulle beholde gevinsten fra 092. **Det går ikke
for 10T.** Målt: den forskjøvne varianten gir 92,1 % dekning men start **67 cm** fra hjørnet.
R-START (≤ 40 cm) rangerer over dekning (spec §0.9), så motoren velger den uforskjøvne med
67,3 % og start 31 cm. Gevinsten i 092 var altså kjøpt ved å bryte R-START — den var ikke reell.

Vil Kenneth ha 92 % der, må han velge et annet starthjørne for 10T, eller R-START må vike for
dekning i det ene tilfellet. Det er hans beslutning, ikke motorens.

### Tid

rekt398 0,04–0,09 s · rektangel 0,04 s · uRom 0,06 s · badHakk 0,14 s · rom5 700W 0,40 s ·
lRom 0,53 s · rom5 600W 0,79 s · rom5 10T 4,5 s.

### ⚠ Ikke bygget

**Forstyrrelsestesten (±1/±2 cm) er ikke bygget.** Et forsøk på å kjøre den som måling tidsavbrøt:
Rom 5 har 10 punkter, og hver vegg × 4 forskyvninger × ~1 s blir for mye for ett kall. Den må
bygges som en egen, tidsbudsjettert test — og det er fortsatt den som hadde fanget både knekket
i 091 og regresjonen i 092. Den nye fasit-påstanden og fixture-hashene er heller ikke bygget.

---

## §37 · 094 — R-ENDE: de frie endene rekker like langt som naboløpenes svinger

Kenneths melding (16.10.2026, 700W innsett øverst til høyre): «her er siste løp kortere enn løpene
ved siden. Det skal det ikke være. Siste løp må forlenges, og heller øke avstand fra alle løpene
mot vegger.» Skjermbilde: `docs/kabel/fasit/rom5-700W-tr-korte-endelop.png`.

### ⚠ Det kortes ikke inn noe sted — og avviket var tre ganger større enn pikselmålingen

STEG 0 på `2d047b5`, Rom 5 · 700W · loddrett · `tr` (CC 13,20 · 33 løp):

| | perp | sveip | høyde |
|---|---|---|---|
| FØRSTE løp | 972,3 | −1028,5 → −922,4 | 106,1 — **lik naboen** |
| SISTE løp | 681,9 | −917,0 → **−904,4** | **12,6** |
| naboen (x 695) | 695,0 | −917,0 → −847,7 | 69,4 |

Siste løp er **56,8 cm** for kort, ikke ~18 som pikslene tilsa. Og «hvor kortes de inn?» har ikke
noe svar: endeløpet er **full høyde i sin egen rutenettcelle**. Cellen (id 1) har **én bane** og er
12,6 cm høy. `_geoBuildCenterline` setter den frie enden til `ln.hi`/`ln.lo` — banens eget lovlige
område — så ingen kode kapper noe. Rotårsaken ligger i **rutingen**: `_geoRouteOrders` krever en
Hamilton-sti, altså at hver celle besøkes, og en 12,6 cm høy bane har ikke plass til en U-sving
(radius CC/2 = 6,6) i **begge** ender. Rekkefølgene `4>3>2>1>0` og `4>3>0>1>2` finnes, men de
**traverserer** sliveren og lar seg ikke bygge. Den eneste kjeden som går, ender i den.

### Omfanget, målt over 136 kombinasjoner (17 fixtures × 2 retninger × 4 hjørner)

9 brudd, alle med samme mekanisme — en **én-banes** celle lavere enn naboen:
rom5 `v` (12,6 mot 69,4 · 3 hjørner), badHakk `h` (78,1 mot 268,9 · 4), badHakk41 `h` (85,9 mot 276,7 · 2).

### ⚠ To feilspor jeg målte meg ut av

**1. «Grad 1 i naboskapsgrafen» var feil kriterium.** Sliveren i Rom 5 har `adj[0,2]` — grad 2 — så
filteret slo aldri inn. Resultatet var det verst mulige: R-ENDE-straffen slo ut 13,2-kandidaten
**uten** at noe alternativ fantes, og CC falt til 11,62 med dekning 84,3 %. Nøyaktig det utfallet
oppdraget forbyr. Kriteriet er nå «én bane og lavere enn naboen», uansett grad.

**2. «Kandidaten med hel ende finnes og er gyldig» gjaldt feil retning.** Jeg leste CC 11,60 ·
92,5 % · poeng 81,2 av en logg og meldte at den tapte på poeng i vannrett. Den var **loddrett** —
retningsfallbacken kjører i samme kall. Med retningen lest av kabelen selv: i `h` finnes 26 gyldige
kandidater med hel ende, men de dekker 81,9–83,6 % mot vinnerens 88,6 %.

### Hva som er bygget

* `_cableEndeKort(cable, room)` → `metrics.endeKortCm`. Overlappskravet skaleres etter løpets egen
  lengde (`min(CC, len × 0,6)`) — **samme felle som i `_cableWallStripe` (089)**: et fast krav på
  én CC gjorde at et 12,6 cm løp ikke fant noen nabo, og målingen meldte 0.
* R-ENDE-straff i `_geoScore`, gradert, vekt **22** — over R-VEGG (18), under hull (25).
* `_geoRouteOrders`: ekstra rekkefølger som **utelater** en kort én-banes celle. Lagt bakerst,
  aldri som erstatning (093). Bare ekte Hamilton-stier — var sliveren eneste bro, finnes ingen
  variant, og utlegget står.
* `endeLen` + **enderunden**, bygget på veggrunden (089b). Nødvendig fordi **CC velges av
  lengdesøket før poengene sammenlignes** — en bedre kandidat under en annen CC er usynlig for
  rangeringen. ⚠ Stigen går over **N**, ikke brøkdeler av CC-intervallet: med 5 brøkdelstrinn traff
  runden aldri CC 9,61 på badHakk. Grovsveip-fella fra 091, flyttet inn i en runde.
* Galleri-kolonner: `stripe (cm)` (089, manglet) og `ende kort (cm)`.

### Dominanstest mot `2d047b5` — 130 av 136 rader identiske, 0 harde brudd før og etter

| kombinasjon | ende | CC | lengde | dekning | stripe |
|---|---|---|---|---|---|
| rom5 `v` tr/tl/br | 56,8 → **0** | 13,20 (uendret) | 41,30 → 40,97 m | 94,1 → 93,4 % | 17,9 (uendret) |
| badHakk `h` bl | 190,8 → **0** | 9,17 → 9,61 | 47,00 → 46,65 m | 72,6 → **75,0 %** | 14,2 → **13,4** |
| badHakk41 `h` tr/br | 190,8 → **0** | uendret | 41,37 → 40,74 m | 82,9 → 81,5 % | 5,1 → 16,9 |

Kenneths rom er reparert med **CC og form i behold**; prisen er 0,7 prosentpoeng dekning — sliverens
eget areal. badHakk41s stripe går 0,95 cm over R-VEGG-grensen (margin + CC = 15,95), altså nøyaktig
den avveiningen Kenneth selv avgjorde: «heller øke avstand fra alle løpene mot vegger».

### Tid

**Kaskadeveien, 136 utlegg: 74,2 s → 93,7 s (+26 %).** +18,1 av de +19,5 s ligger i de tre
fixturene med korte løvceller (22,8 → 40,9 s for gruppen rom5/badHakk/badHakk41/rekt398/
rektangel/lRom); resten er støy.

**Geo-motoren alene, 34 kjøringer (galleriets vei): 18,9 s → 22,8 s (+21 %).** Verste enkeltrom
rom5 `v` 1,67 → 2,21 s, badHakk `h` → 2,37 s, enHindring `h` 3,41 → 3,39 s (uendret).

Budsjettet i enderunden er **målt**: 24 sparte 1 s men mistet reparasjonen av badHakk `h` bl,
60 ga ingen flere treff enn 40.

⚠ **`_cableGeometryRegressionTest` fullførte ikke innen 13 minutter under 094, og jeg har ikke
etablert baselinjen for den.** Den kjører sju motorer × 17 fixtures × 2 retninger, og V6 flommet
konsollen mens den gikk — altså er hovedkostnaden ikke geo. Tallene over er det jeg faktisk har
målt på begge versjoner. Suitetiden fra §35 står fortsatt uløst og vokser med dette.

### ⚠ Fem brudd står igjen — en beslutning for Kenneth, ikke for motoren

badHakk `h` tr/tl/br og badHakk41 `h` bl/tl står på `endeKortCm` 190,8. En hel ende finnes der, er
gyldig og innenfor lengden, men koster **5–7 prosentpoeng dekning**. Enderunden godtar ikke det
(089b-prinsippet: like god på alt annet), og R-ENDE skal ikke kjøpes med dekning uten at Kenneth
har sagt det. Samme form som 10T-avveiningen i §36.

Dette er dessuten verdt et spørsmål om regelen selv: i badHakk er endecellen **78 cm dyp fordi
rommet er 78 cm dypt der**. Enden *kan* ikke rekke lenger uten å la den nisjen stå udekket. R-ENDE
som den er formulert, forbyr å dekke en grunn nisje med kabelens ende.

### ⚠ Fortsatt ikke bygget

Forstyrrelsestesten (±1/±2 cm) fra §35, den nye fasit-påstanden og fixture-hashene. Suitetiden
(>4 min) er heller ikke rørt — den vokser med dette.

---

## §38 · 095 — R-ENDE gjelder restceller; rask port med lagret baselinje; forstyrrelsestesten

Kenneths beslutninger 16.10.2026: (1) ikke kjøp R-ENDE med dekning — 5–7 prosentpoeng er for dyrt,
badHakk står som i dag; (2) regelen presiseres til **restceller**, ikke ekte nisjer.

### R-ENDE: bruddlista før og etter

| rad | før (094) | etter (095) | utlegget |
|---|---|---|---|
| rom5 `v` tr/tl/br | 0 (reparert) | 0 | uendret — 12,6 < 2 × 13,2 ER en restcelle |
| badHakk `h` tr/bl/tl/br | **190,8** | **0** | uendret — 78,1 > 2 × 11,21, ekte nisje |
| badHakk41 `h` bl/tl | **190,8** | **0** | uendret |
| badHakk41 `h` tr/br | 0 (endret av 094) | 0 | **tilbake til 2d047b5** |
| badHakk `h` bl | 0 (endret av 094) | 0 | **tilbake til 2d047b5** |

Terskelen er **2 × CC**: en celle med én bane som er lavere enn det, har ikke plass til en vanlig
sving (radius CC/2) i begge ender. Null brudd igjen på 136 rader.

### ⚠ Porten måtte inn i RUTINGEN også, ikke bare i målingen

Første runde rettet bare `_cableEndeKort` og straffen. Da sto badHakk41 `h` tr/br fortsatt endret —
og grunnen var ikke R-ENDE i det hele tatt: `_geoRouteOrders` lager dropp-varianten for **enhver**
lav én-banes celle, og på badHakk41 vant den på **lengdeleddet** (40,74 m mot 41,37 mot et mål på
41,00). Et utlegg ble altså endret i et rom uten restcelle-ende, og både dekning (82,9 → 81,5) og
veggstripe (5,1 → 16,9) ble dårligere. Samme 2 × CC-port i `_geoRouteOrders` (nytt `cc`-argument,
alle sju kallsteder) rettet det. **Mot `2d047b5` er nå bare rom5 `v` tr/tl/br endret — 133 av 136
rader identiske.**

### Den raske porten: `_cableGeoSuite()`

136 rader (17 fixtures × 2 retninger × 4 hjørner), ni felt per rad: N, CC, lengde, dekning, stripe,
endeKort, start-avstand, hull, gyldig (+ celler/transitt/R-VEGG-grense for forstyrrelsestesten).
Dominans: gyldighet, hull, R-START, R-VEGG, R-ENDE og dekning (> 1 pp tap) **feiler**. N og CC
**rapporteres** — CC velges av lengdesøket, og et annet trinn er ikke i seg selv dårligere.

**Tid: 63,0 s** (24,1 + 11,4 + 27,5 s i tre biter), som stemmer med summen av fixturene målt hver
for seg (63,6 s). Dyreste: enHindring 14,6 s · umuligStartHjorne 9,6 s · rom5 8,7 s · utsparing 7,8 s.

⚠ **Kjørt som ÉN uavbrutt blokk er porten upålitelig:** én tilfeldig fixture baller på seg
(enHindring 64 s i én kjøring, utsparing over 120 s i neste) mens de andre holder normal tid.
Jeg fikk ikke tak i årsaken — angrelageret er kappet på 50, og scenen bygges rent per rad.
Kjør porten i biter med `only` + `flett` til det er forstått. **Det er den ene tingen som ikke er
løst her.**

⚠ **To av mine egne målefeil underveis, begge verdt å huske.** (1) «Ingen R-ENDE-brudd» ble lest av
et TALL: baselinje-grenen returnerte `rader` som antall og sammenligningsgrenen som objekt, så
`Object.entries(tall)` ga tom liste. Samme felt skal ha samme type i alle grener. (2) Porten kunne
**aldri** lese baselinjen sin: dev-serveren faller tilbake til `index.html` for `/docs/...`, så
`fetch('/docs/kabel/baseline.json')` svarte 200 med HTML og `r.json()` kastet — inni en stille
`catch`. Nytt endepunkt `GET /__baseline`, og feilen sies nå høyt.

### ⚠ `rekt398` hadde `productId: null` — åtte rader som ikke kunne feile

Alle åtte rekt398-radene var «ingen løsning» i baselinjen, fordi fixturen aldri fikk koblet et
produkt. Notens egen tekst navnga det: InFloor 17T 1650W 96m (id 31). Målt med det: CC 11,08 ·
36 løp · 98,4 % · start 12 cm. En fixture uten produkt er en test som ikke kan bli rød.

### Forstyrrelsestesten (ventet siden 091) — 34 brudd av 136 kjørte forstyrrelser

| rom / produkt | kjørt | brudd | signatur |
|---|---|---|---|
| rom5 / 700W | 40 av 40 | **20** | `celler 5 → 4`; dekning 93,4 → ~84, CC 13,20 → 11,62 |
| rom5 / 600W | 16 av 40 (vegg 0–3) | **9** | CC 13,20 → 11,62, dekning 78,4 → ~71 |
| rom5 / 10T 400W | 4 av 40 (vegg 0) | **4** | **R-START tapt** — start 118 cm |
| rekt398 / 1650W | 16 av 16 | 0 | — |
| rekt398 / 1450W | 16 av 16 | 0 | — |
| badHakk / egen | 44 av 44 | **1** | vegg 5 −2 cm → «ingen løsning» |

**091-knekken står.** N-iterasjonen i 091b gjorde søket *komplett*, ikke utlegget *robust*: hver
eneste brudd-rad i rom5 700W har samme signatur — en vegg flyttet 1 cm fjerner en celle (5 → 4),
og da er trinnet CC 13,20 ikke lenger mulig. 094-reparasjonen avhenger av 5-celle-rutenettet.

Ett brudd går **oppover**: rom5 600W vegg 0 +2 cm gir 90,2 % mot referansens 78,4 % (CC 15,29).
Et rom som blir 2 cm større burde ikke finne 12 prosentpoeng mer dekning — det er samme knekk,
bare på den hyggelige siden, og det bekrefter at CC-valget henger på en knivsegg.

**Ikke fullført:** rom5 600W vegg 4–9 (24 forstyrrelser) og rom5 10T vegg 1–9 (36). Grunnen er
målt: enkelte forstyrrede utlegg bruker **minutter** i ett kall (10T koster 4,5 s per utlegg selv
uforstyrret, jf. §36), og budsjettet kan bare sjekkes MELLOM utlegg — en synkron motorkjøring kan
ikke avbrytes. `veggFra`/`veggTil` deler jobben.

### Ikke rukket

§5 i oppdraget: 076-fasiten som form-og-krav, og fixtures med dato + geometri-hash med
localhost-varsel ved drift. Suitetiden for det store batteriet står fortsatt urørt (ikke en port nå).

---

## §39 · 096 — flerkabel-soner går gjennom geo-motoren med felles CC og søm

Kenneths skjermbilde fra varmeplan.no 16.10.2026: Rom 8 («Annet», 50,34 m², 2 × InFloor 17T 3400W
200m, loddrett, to soner). K1 en jevn slynge med røde ringer i hjørnene; K2 ødelagt — store buer,
løp av ulik lengde, vannrette strekk. Begge labelene ⚠ CC 12,5.

### STEG 0 — hvem la K2, og var det nytt eller lagret?

**Lagret, og merket ved åpning.** Sonestien regner ALDRI defekter selv: `_buildNCableZones` kaller
`autoFillCable`, som treffer soneporten i `_autoFillCableImpl` og går rett til `_autoFillCableLegacy`
— ingen `_cableGeometryCheck`, ingen `_geomDefects`. Det eneste stedet et sonekabel-utlegg kan bli
merket, er åpningskontrollen `_geomSjekkLagredeUtlegg` (072), som leser geometrien URØRT og bare
setter flagg. ⚠ og de røde ringene i skjermbildet kommer altså derfra.

Reprodusert lokalt (syntetisk scene, aldri mot produksjonsdata) på et rektangel med nettoareal
50,34 m² og lang akse 12 m — de to tallene som driver `sharedCC`:

| | motor | CC | lengde | dekning | gyldig | defekter |
|---|---|---|---|---|---|---|
| K1 | boustrophedon | 12,59 | **−2,18 %** | 48,8 % | nei | `lengde` |
| K2 | boustrophedon | 12,59 | **−2,18 %** | 48,8 % | nei | `lengde` |

⚠ Det eksakte polygonet kan ikke leses av et skjermbilde (12 × 7 m gir 84 m², ikke 50,34), så
fixturen `rom8` bruker arealet og retningen, som er det motoren faktisk regner på.

**De store buene er V6.** Et rent rektangel gir aldri dem — jeg sveipte ti sideforhold, alle ga
boustrophedon med 0 koblinger. Med **én hindring i høyre sone** falt K2 til `v6` med **5 koblinger**,
mens K1 ble ren boustrophedon: nøyaktig bildet Kenneth sendte. Koblingene ER buene. V6 ble tatt ut
av konkurransen i 083, men soneveien har aldri sett den avgjørelsen.

### Hvorfor det står ⚠ CC — det er ikke CC-en

`_ccOverWarn(InFloor 17T, 12,59)` er **false**: anbefalt maks er 20 cm, og romtypen «Annet» har
ingen nedre grense. ⚠ kommer fra labelen selv, som skriver den når `_ccOverWarn(...) ||
cable._geomDefects.length`. Det er altså geometridefekten (lengde), ikke avstanden.

### Rotårsaken bak lengdefeilen: den IDEELLE CC-en holder ikke når den diskretiseres

`sharedCC = nettoareal / total kabellengde` = 12,59 cm. Den regner ikke med at kantavstanden og
U-svingenes inntrekking spiser ekte bredde. ⚠ MÅLT: 96 løp (48 per sone) krever 1196 cm, det
lovlige området er 1190 — 6 cm for lite. Ved 12,59 får hver sone 47 løp og 191,60 m mot 200.

Og sømmen alene kan ikke rette det — **målt som et nullsumspill**:

| søm flyttet | sone 1 | sone 2 |
|---|---|---|
| 0 | 47 løp, −4,2 % | 47 løp, −4,2 % |
| −3,15 cm | 187,48 m (−6,3 %) | **48 løp, −0,10 %** |
| +3,15 cm | **48 løp, −0,10 %** | 187,48 m (−6,3 %) |

Én sone får sitt 48. løp bare ved å ta bredden fra den andre.

**Løsningen er én felles CC på 12,53 — samme verdi i BEGGE soner.** Regelen er urørt (lik W/m² over
sømmen); det er bare verdien som justeres 0,5 % ned fra den ideelle, og da får begge soner 48 løp.
Forpasset `_zoneSharedCcFromGeo` spør hver sone «hvilken CC trenger DU med din søm?» (søm pinnet,
CC fri — løst i lukket form: (N−½) trinn ved én søm) og tar den MINSTE.

### Rom 8 før og etter

| | motor | CC | lengde | dekning | søm | gyldig |
|---|---|---|---|---|---|---|
| **FØR** | boustrophedon + boustrophedon | 12,59 / 12,59 | −2,18 % / −2,18 % | 48,8 % | 12,59 | **nei** (⚠ lengde) |
| **ETTER** | **geo + geo** | **12,53 / 12,53** | **−0,11 % / −0,11 %** | 99,2 % / 99,9 % | **12,53 = 1 CC** | **ja** |

Tid 2047 → **365 ms**. Vannrett: geo + geo, CC 12,41, 0,00 %. Figur: `docs/kabel/fasit/096-rom8.svg`.

⚠ **Og en ærlig nyanse:** med soneporten slått av (`window._geoZoneAv`) gir boustrophedon nå også
CC 12,53 og −0,10 %, fordi CC-forpasset mater den samme verdien til de gamle motorene. Lengdefeilen
kom altså fra CC-VALGET, ikke fra motorvalget. Motorvalget er det som fjerner K2s store buer.

### Hvor mye sømmen måtte flyttes: 0 cm

CC-forpasset løste lengden alene i alle de målte rommene, så sømsøket aldri slo inn. Det står
likevel (høyst ± 1 CC, trinn CC/4, felles CC urørt), med et arbeidstak på **2 ombygginger** — målt:
uten taket brukte søket 29 s på et rom geo ikke kan ta, mot 2,8 s med.

### V6 kan ikke vinne en sone — men et hardt brudd er verre enn en bue

⚠ Et blindt bytte var MÅLT skadelig: erstatningen `serpentine-fallback` ga −9,36 % **og** defekten
`utenfor` — kabel utenfor rommet — der V6 lå på 0,00 %. «Ikke verre» holdt heller ikke, for V6 hadde
samme grove defekt. Kravet er derfor at erstatningen er **gyldig** (eller strengt bedre på
utenfor/kryss/bøy). Står V6 igjen, beholdes den og **merkes** med sine defekter — aldri stum.

Hindring-rommet etter 096: K1 **geo, gyldig, +0,74 %**; K2 v6 beholdt, men merket med
`utenfor, kryssing, nærføring, bøy, lengde, brudd`. Før: K1 boustrophedon og K2 v6, begge umerkede.

**Hver sonekabel kontrolleres nå der den LAGES.** Det var det som manglet: ⚠ sto på et utlegg som
nettopp var lagt, fordi bare åpningskontrollen i 072 hadde regnet på det.

### Start og retning

Retningen er felles for alle soner, som før. Starten følger dagens regel: **hver sone starter i
brukerens valgte hjørne av SIN EGEN sone.** Målt på Rom 8 med `bl`: K1 (5, −11) — R-START 12 cm —
og K2 (606, −11), altså 606 cm fra rommets hjørne. Med `tr` er det speilvendt. R-START er dermed
oppfylt for nøyaktig den kabelen velgerens hjørne ligger i. Regelen for de andre er IKKE endret.

### Regresjon

Tre nye fixtures (bare geometri): `rom8`, `rekt2kab` (2 × 200 m) og `rekt2kabUlike` (200 + 140 m).
Porten har nå en egen flerkabelrad (`nøkkel|retning|soner`) som måler Kenneths fem krav:

| rad | motorer | CC (Δ) | lengde | søm | koblinger | største bue |
|---|---|---|---|---|---|---|
| rom8 v | geo+geo | 12,53 / 12,53 (0) | −0,11 % | 12,53 | 0 / 0 | 0 |
| rom8 h | geo+geo | 12,41 / 12,41 (0) | 0,00 % | 12,41 | 0 / 0 | 0 |
| rekt2kab v | geo+geo | 12,53 / 12,53 (0) | −0,67 % | 12,53 | 0 / 0 | 0 |
| rekt2kab h | geo+geo | 12,56 / 12,56 (0) | −0,38 % | 12,56 | 0 / 0 | 0 |
| rekt2kabUlike v | geo+geo | 17,62 / 17,62 (0) | −0,13 / +0,87 % | 17,62 | 0 / 0 | 0 |
| rekt2kabUlike h | geo+geo | 16,80 / 16,80 (0) | 0,00 % | 16,80 | 0 / 0 | 0 |

Baselinjen er nå **142 rader**. Flerkabelradene tar **1,3 s** til sammen. **Ingen enkabelrom er
endret** — porten er grønn på alle 136 rader fra 095. `_soneRegressionTest`, `_cableSkewRegressionTest`
og 16 andre batterier grønne.

⚠ **Én påstand er bevisst endret:** `_cableZoneRegressionTest` B sto «rektangelrom uendret — ren
boustrophedon», altså den gamle kaskaden. Den er nå «geo i begge soner» PLUSS tre nye påstander
(gyldig, ±1 %, felles CC) — strengere enn før. En påstand som låser et design, må oppdateres når
designet er det som endres.

⚠ **Og en målefeil hos meg:** jeg meldte først at påstand A (fasit-rommet) falt fra 4 til 6
koblinger. Det var en forurenset side — isolert og på fersk side gir A 4 koblinger både før og etter.
Kjør batteriet etter en reload, ikke etter en haug med sceneoppsett.

---

## §40 · 099 — «celler 5 → 4» var ikke et cellesnitt. Fire centimeter kabel avgjorde ni prosentpoeng.

### STEG 0.1 — hypotesen var feil, og det er målt

Oppdraget antok at lag B deler rommet der et trinn i grensen vipper over «én CC»-terskelen. Sonden
(`_p099`, rutenett ved CC 13,20 på Rom 5 / 700W / loddrett / `tr`) viser trinnene ved cellegrensene:
**105,4 · 111,4 · 74,7 cm** — alle langt over CC. Ingen av dem er i nærheten av en terskel, hverken
før eller etter forstyrrelsen.

«Celle 5» er 093-varianten: basisrutenettet mister ytterbanen (`ytterbaneFalt`), forskyv2 (+0,15 cm)
henter den tilbake i øvre venstre felt (8 baner) og lager samtidig en **12,6 cm lang én-banes
«celle»** i nedre venstre felt, fordi V10 er skrå (0,7 cm over 93 cm). Tegningen har 8 + 7 + 12 + 3
baner uansett — transitten tar sliveren. Tallet «5» var en artefakt.

### Den ekte mekanismen (sporing `opts.trace` i lengdesøket)

| | CC 12,605 | CC 13,205 | `tries` | vinner |
|---|---|---|---|---|
| referansen | 40,96 m (**−3,9 cm**) | 41,30 m (+30 cm) | 12,605 (best) **og 13,205 (nærmeste for lange)** | 13,205 · hull 0 · **93,4 %** |
| vegg 2 +1 cm | 41,00 m (**+0,1 cm**) | 41,34 m (+34 cm) | 12,605 er nå selv «nærmeste for lange» → **13,205 prøves aldri** | 12,605 · hull 1 → 079d → 11,62 · **84,7 %** |

Begge trinnene treffer lengden innenfor ±1 % på begge geometriene, og 13,205-kandidaten FINNES på
den forstyrrede (41,34 m, 93,5 %, gyldig, start 13). Den ble bare ikke vist for poengsummen. Det er
094-klassen (§37) om igjen: **CC velges av lengdesøket FØR poengene sammenlignes.**

### STEG 0.2 — én mekanisme eller flere?

| rom / produkt | før | mekanisme |
|---|---|---|
| rom5 / 700W | 20 av 40 | 16 er «tries»-knivseggen over; 4 er ytterbanen som ikke når øvre felt (V6 inn 1–2 cm / V10 ut 1–2 cm: øvre felts grense ligger 1,1–2,1 cm innenfor `pMin`, og 093-lista rakk 0,5 cm) |
| rom5 / 600W | 20 av 40 | samme to, men referansen (78,4 %, hull 0) er den som står igjen alene — se under |
| rom5 / 10T | **40 av 40** | ⚠ **feilmålt i §38**: 28 av 40 var «start 118 cm», og referansen har SELV start 118 cm. R-START ble aldri tapt — testen målte et absolutt krav uten å se på referansen. Resten (12) er CC-trinnet 13,83 → 12,63 |
| badHakk | 1 av 44 | vegg 5 −2 cm → «ingen løsning» — ikke undersøkt |

### STEG 0.3 — er 5-celle-utlegget gyldig på forstyrret geometri?

Ja: vegg 2 +1: 41,34 m, +0,83 %, 94,2 %, start 13 · vegg 0 +2: 41,33 m, +0,8 %, 93,4 % · vegg 8 +1:
41,23 m, 94,1 %. Alle gyldige i `_cableGeometryCheck`. For vegg 9 +1 og vegg 5 −1/−2 fantes det
IKKE før 093-rekkevidden ble utvidet (ytterbanen nådde ikke øvre felt).

### Bygget

1. **Stigetrinn innenfor toleransen er varianter** (etter `tries` og 079d, i `generateCableGeo`):
   hvert trinn hvis målte lengde ligger innenfor ±1 %, pluss N ± 1 rundt det beste trinnet (sonden
   ser bare én rute per rutenett, 074b), kjøres gjennom `attempt` — med trim via `jevnLen` når den
   hullfrie varianten er for lang (vegg 4 +2: 41,43 m = +1,05 % → trimmet til 0,00 %). Valg:
   **R-START først, så poeng.** Gate: kjører bare når `tries` ikke ga et hullfritt treff innenfor
   lengden — rader der `tries` traff, er bit for bit uendret.
2. **093-rekkevidden 0,5 cm → 0,2 × CC** (2,6 cm ved 13,2). Fortsatt en variant; på Kenneths
   geometri velges fortsatt +0,15.
3. Delt `_geoCcStige` (brukes av enderunden; identisk logikk som sto der).
4. Sporing: `generateCableGeo(…, { trace: [] })` logger stige, tries, attempt, 079d, 099 og hjørnerunden.
5. Forstyrrelsestesten: «R-START tapt» krever at referansen traff (ellers `hoppet`-merknad);
   `_geoCells` teller celler med ≥ 2 baner (sliveren telte som form).

### To ting som ble MÅLT og rullet tilbake

* **«099 alltid på»** (`window._geo099Alltid`): fire røde rader — lRom h tl/br 98,5 → 93,6,
  badHakk41 h tl 91,4 → 85,3, rom5 h tr/br 90,7 → 86–87. Poengsummen bytter bort dekning når den
  får velge fritt. Derfor gaten.
* **Hjørnerunden på N-stigen nærmeste-først** (som enderunden): sju røde rader — budsjettet på 40
  brukes opp på nære trinn, og lRom h tr falt 98,5 → 89, umuligStartHjorne h br 99,1 → 89,9,
  badHakk41 v bl R-START 24 → 83. Grovsveipet er også det som rekker langt. ⚠ Men fella er ekte:
  på enHindring `br` fant hjørnerunden 9,07 / 77,4 % fordi 10,54 / 90,7 % (hjørne, hull 0) aldri
  ble prøvd — det reddes i dag av at 099-blokken ligger ETTER 079d med R-START-prioritet, ikke av
  hjørnerunden selv. **Åpent punkt.**

### Forstyrrelsestesten før → etter (loddrett, `tr`, ± 1 / ± 2 cm per vegg)

| rom / produkt | før | etter | det som står igjen |
|---|---|---|---|
| rom5 / 700W | **20** av 40 | **1** | vegg 4 −2 cm: 93,4 → 84,4 (CC 11,62) |
| rom5 / 600W | 20 av 40 | **23** | ⚠ referansen er den som står alene: 78,4 % (hull 0) — gaten slår ikke inn, og de forstyrrede finner enten 92,6 % (CC 15,29, via 099) eller 71 % (CC 11,62). Det RIKTIGE utlegget på referansen er trolig 92,6 % — se SPØRSMÅL |
| rom5 / 10T 400W | 40 av 40 (28 feilmålt) | **6** | CC 13,83 → 12,63, 94,7 → 87–91 %; R-START måles ikke (referansen bommer selv) |
| badHakk | 1 av 44 | 1 | vegg 5 −2 cm «ingen» |
| **sum** | **81 av 164** | **31** | |

### Porten: grønn, 142 rader, 19,8 s (3 biter: 7,8 + 6,0 + 6,1 s)

Endrede rader mot baselinjen fra 096:

| rad | før | etter |
|---|---|---|
| enHindring v tr | N 51 · CC 10,26 · 89,0 % | N 48 · CC 11,14 · **95,3 %** |
| enHindring v tl | N 49 · CC 10,54 · 90,2 % | N 48 · CC 11,14 · **95,3 %** |

Ingen rad dårligere. Baselinjen er skrevet på nytt (`1422d23 + 099`) med `celler` i ny betydning.
⚠ Tiden: §38 oppga 63 s for 136 rader; nå 19,8 s for 142. Jeg har ikke målt 096-koden på denne
maskinen i dag, så hvor mye som er 099 (079d-løkka kjøres sjeldnere) og hvor mye som er dagsform,
vet jeg ikke. Heap mellom bitene: 20 MB flatt. «Balling» oppsto ikke i noen av de seks kjøringene.

### Tid per utlegg (rom5 / 700W / v / tr)

referansen 181 → **132 ms** · vegg 2 +1 861 → **328–548 ms** · vegg 4 +2 1119 → **387 ms**.
Forstyrrede utlegg er RASKERE enn før, fordi 079d sin ti-trinns nedstigning ikke lenger kjøres når
099 har funnet et hullfritt trinn.

---

## §44 · De røde sjekkene i `_cableGeometryRegressionTest` — målt, ikke gjettet (20.10.2026, prompt 103)

**Først en korreksjon av min egen rapport.** Endringsloggen for 102 sier «tre gamle, røde sjekker».
Det var feil, og feilen var min: jeg skrev ut `results.filter(!ok).slice(0, 3)` og leste de tre som
kom ut som «tre røde». Det er **åtte**. Batteriet har 127 påstander på `ffb8db7` og bruker 127 s.

### Metode

En egen kjøring med KUN de åtte påstandene (samme fixtures, samme oppsett, samme uttrykk) gjør det
samme på **0,4–15 s** i stedet for 127 s. Halveringen gikk i en egen `git worktree`
(`../arqely-bisect`) på port 4300, med en egen liten statisk server — de gamle `serve-varmeplan.js`
mangler `.json`-MIME (lagt til i 065), så serveren måtte være uavhengig av commiten som testes.
Produktkatalogen ligger bare i skyen bak innlogging, og en annen port er en annen origin: katalogen
ble derfor hentet fra den innloggede fanen og lagt som en fil worktreen serverte. **Arbeidskopien
ble ikke rørt.** Worktreen er fjernet.

Nedre grense: `20c14a1` (082) — alle åtte grønne, like-for-like med samme kjøring.

### De åtte

| # | Påstand | Fixture | Forventet | Faktisk (`ffb8db7`) | Ble rød i | Type | Målt grunnlag |
|---|---|---|---|---|---|---|---|
| 1 | `076 rom5: geometrien er 5,698 m² netto` | rom5 | 5,698 m² | **5,711 m²** | `a365c70` (089 delvis) | **(b) utdatert påstand** | Commiten heter «Rom 5-fixturet hadde drevet fra virkeligheten — hentet paa nytt». Fixturens eget navn er «Bad 5,71 m²», og `da17f9a` (090b) sier «fasiten var maalt paa et rom som ikke finnes». Påstanden låser det gamle, feil rommet. |
| 2 | `081: vannrett hører på OPP/NED` | rom5 | tl starter høyere enn bl | **tl y=−1035, bl y=−841** (byttet om) | `5c929ef` (088) | **(b)** | `w2s(0,−1040).y = −1485`, `w2s(0,−836).y = −1179` — **world-y øker nedover**, så −1040 ER toppen. 088 er nettopp fiksen av den speilvendte aksen. Påstandens kommentar («rommets topp er −836») er den gamle, speilvendte troen. |
| 3 | `081: vannrett tl starter nær taket` | rom5 | y > −860 | **y = −1035** | `5c929ef` (088) | **(b)** | Samme måling som #2. −1035 ER nær taket etter 088. |
| 4 | `081: vannrett bl starter nær gulvet` | rom5 | y < −1020 | **y = −841** | `5c929ef` (088) | **(b)** | Samme måling som #2. |
| 5 | `081: panelet oppgir avstanden i cm` | rom5 | linje som matcher `/^Start: \d+ cm fra /` | **«geo · ønsket øvre venstre · start 124 cm fra hjørnet»** + «⚠ Loddrett kan ikke starte oppe til venstre i dette rommet — nærmeste er 124 cm unna.» | `b11dc9e` (088b) | **(b)** | Opplysningen er der — to ganger, og tydeligere enn før. Bare ordlyden er endret; påstanden regexer en tekst som ikke finnes lenger. |
| 6 | `082 600W: starten når øvre venstre hjørne` | rom5 | ≤ 40 cm | **189 cm** | `b11dc9e` (088b) | **(b), men med en reell UX-kostnad** | 088b heter «valgt retning er hard - hjoernet bytter den aldri». Hjørnerunden kan ikke lenger snu retningen for å nå hjørnet. Påstanden låser en oppførsel 088b bevisst fjernet — men at 600W ikke lenger når hjørnet er en ekte endring Kenneth bør se. |
| 7 | `077: uten biblioteket legges det fortsatt ut` | rom5, clipper av | kabelobjekt | **null** | `e13d2b9` (083) | **(a) ekte forverring** | 083 heter «låst regel: start i valgt hjørne (≤ 40 cm) går foran dekning og fasit-CC, **filter på kaskadenivå**». Uten clipper finnes ingen kandidat som passerer filteret, og kaskaden gir `null`. Det bryter fail-open-regelen (077/060): uten biblioteket SKAL det legges ut, bare merket som tilnærmet. |
| 8 | `074b badHakk 41 m: dekningen holder seg (≥ 85 %)` | badHakk41, `v`/`tr` | ≥ 85 % | **63,3 %** (CC 9,06, 0 hull, 41,01 m) | `5c929ef` (088) | **(b)** | `baseline.json` (`1422d23 + 099`) har `badHakk41\|v\|tr` = **cc 9.06 · dek 63.3 · hull 0 · gyldig true** — altså er 63,3 % den AKSEPTERTE tilstanden for den raden, og `_cableGeoSuite()` er grønn på den. Etter 088 peker `tr` på et annet fysisk hjørne; det gamle resultatet (CC 13,81 · 94,9 %) finnes fortsatt, under `tl`/`br`. Påstanden sammenligner to ulike hjørner. |

### Hva dette betyr

Sju av åtte er **(b)**: påstander som låser tall eller ordlyd fra før 088/089 rettet henholdsvis den
speilvendte y-aksen og et fixture som hadde drevet fra virkeligheten. De målte utleggene er ikke
dårligere — de er målt mot et annet hjørne, et annet rom eller en annen tekst.

Den ene som er **(a)** er #7: `077 fail-open`. 083s harde kaskadefilter gjorde at et rom uten
polygonbiblioteket ikke får noe utlegg i det hele tatt. Det er den eneste av de åtte som peker på en
regel som faktisk er brutt.

**Ingenting er rettet her** — verken motoren eller forventningene. Forslag til retting står i
`docs/trapp/prompter/SPØRSMÅL.md` under «103». Kenneth avgjør.

---

## §45 · 121 — fail-open uten polygonbiblioteket gjenopprettet, de sju påstandene oppdatert, rask variant (21.10.2026)

Kenneths svar på §44 (`docs/trapp/prompter/SPØRSMÅL.md`, 103): oppdater de sju, rett fail-open i
motoren, behold hard retning, flytt badHakk41-påstanden, rask variant permanent.

### STEG 0

- **0.1** De åtte på `bca0959`: fortsatt nøyaktig de samme åtte, 127 påstander — men **30 s**, ikke
  127 s som §44 målte 20.10. Samme maskin og nettleser; jeg har ikke funnet hvorfor.
- **0.2 Hvor `null` kommer fra — §44 bommet på mekanismen.** §44 skrev «083s harde kaskadefilter
  slipper ingen tilnærmet kandidat gjennom». Målt: `_cableFilterByCorner` returnerer hele lista når
  ingen treffer hjørnet — den kaster aldri alle. Det som ga `null` var `if (!chosen) return null` i
  `_autoFillCableImpl`, fordi kandidatlista var **tom**: uten clipper gir `generateCableGeo` «ingen
  løsning» (lovlig område tilnærmet), og 083 (samme commit `e13d2b9`) tok V6 ut av konkurransen —
  skew legges bare i lista for roterte rom. Før 083 lå V6-kandidaten der (ugyldig, men til stede), og
  det var den «tilnærmede kandidaten» 077 slapp gjennom. «Tilnærmet» merkes i dag med
  `cable._geomApprox` → panellinja «Lagt uten polygonbiblioteket — kantene er tilnærmet».
- **0.3** `baseline.json` (`1422d23 + 099`): `badHakk41|v|tr` = cc 9,06 · dek 63,3 · hull 0 · gyldig;
  `tl` og `br` = cc 13,81 · dek 94,9. Bekreftet.

### Fail-open (motoren)

I `_autoFillCableImpl`, inne i `if (!chosen)`, og bare når `!_cblClipperReady()`: dagens kaskade
(`_cableLegacyInDirection`, innenfor 074-dybdetelleren så ingen dialog åpnes) måles med
`_cableGeometryCheck`, merkes `_geomApprox`, `_geomOk` (ærlig — kan være ugyldig, som før 083),
`_geomDefects`, `_startCornerOffCm`, og returneres. Med clipper lastet er veien uendret: ny påstand
`077/121: med biblioteket er utlegget det samme med og uten grenen` låser senterlinja bit for bit
(`opts._ingenFailOpen` kjører forbi grenen). R-START, R-VEGG, R-ENDE er ikke rørt.

### De sju påstandene

| # | påstand | før | nå | hvorfor (commit) |
|---|---|---|---|---|
| 1 | 076 rom5 areal | 5,698 m² | **5,711 m²** | 089 `a365c70` hentet fixturet på nytt |
| 2 | 081 OPP/NED | tl > bl + 50 | **tl < bl − 50** | 088 `5c929ef`: world-y øker nedover, topp = minst y |
| 3 | 081 tl nær taket | y > −860 | **y < −1020** | samme |
| 4 | 081 bl nær gulvet | y < −1020 | **y > −860** | samme |
| 5 | 081 panel-linja | `/^Start: N cm fra /` | **`/start N cm fra hjørnet/`** | 088b `b11dc9e` ny ordlyd |
| 6 | 082 600W hjørnet | ≤ 40 cm | **> 40 cm, fortsatt loddrett + panelet melder avstand og «nærmeste er N cm unna»** | 088b: retningen er hard (Kenneth 103/4) |
| 8 | 074b badHakk41 dekning | `tr` ≥ 85 % | **`tl` ≥ 85 %** (94,9) | 088 flyttet hjørnene; `tr` = 63,3 % er baselinjens aksepterte rad |

### Rask variant

`_cableGeometryRegressionTest({ rask: true })` = `_cableGeometryQuickTest()`. Hovedløkka på
`_CABLE_GEO_RASK_FIXTURES` (rektangel, skraa, rom5, badHakk41, rekt2kab, lRom — én per motorfamilie),
og bare seksjonene i `_CABLE_GEO_RASK_SEKSJONER` (076, 080 — der 081 ligger —, 082, 077, 074b).
Målt per seksjon alene: 080 6,8 s · 082 4,5 s · 076 3,8 s · 077 2,0 s · 088 1,9 s · 072b 1,6 s ·
resten < 0,5 s. Hovedløkka med alle 20 fixturer koster bare ~8 s — det var seksjonene (21 s) som bar
tiden. **Rask: 67 påstander, 18,8 s. Fullt: 132 påstander (127 + 5 nye), 30,0 s, helt grønt.**

### Portene

`_cableGeoSuite()`: **142 rader, 0 feil, 0 bedre, 0 endret, 0 nye, 0 borte** — 19,7 s (én blokk, uten
ballingen §38 beskrev). `_cableForstyrrelsesTest()`: **31 brudd**, 1 hoppet, 67,9 s — ikke verre enn sist.

## §46 · 161 — kabel + liten hindring: krympet felt var aldri et mål (29.10.2026)

Kenneths rom 312 × 323 med én 20 × 20 hindring, InFloor 17T 1200 W: vannrett fikk CC 12,0 med svingene
21,7 cm fra veggen og 83,8 % dekning. Lengdesøket HADDE 14,223 (98,5 %), men den bommer på hjørnet, og
hjørnerunden (083) kjøpte hjørnet med 16,7 cm jevn inntrekking — aksepttesten så gyldig · lengde ·
hjørne, aldri feltet. Loddrett `tl`/`br` samme klasse via 079d (26 cm). Cellene var lærebok-BCD (ingen
cellefeil). Nye mål `loseEnder` og `kantGapCm` i kontrollen, poeng og aksepttest i 079d/099/hjørnerunden,
nabotrinn i hjørnerunden med eget budsjett, retningsvalg færrest defekter → R-START → dekning → poeng,
merknad i panelet når den andre retningen er renere. **Alt bak `legal.blockers`** — uten avgrensningen
endret vaktene seks rom uten hindring (R-START tapt i fem rader). Funn: `_cableCovCache`-nøkkelen i
kontrollen blandet varianter med samme lengde/CC/segmenttall (hullfri arvet 94,0 % for 96,2 %) — rettet
med geometrisum. Fixture `hind1` (8 rader, `laas`), baselinje 144 → 152 rader med `lose`/`kantGapCC`;
enHindring og umuligStartHjorne bedre (77 → 89, 79 → 96,5 %). Suite 26 s, fullt batteri 159/159, rask
94/94. Hele målingen: `docs/161/RAPPORT.md`, spørsmål `docs/161/SPØRSMÅL.md`.
