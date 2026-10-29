# 161 · Kabel + liten hindring — hvorfor det rotete utlegget vant, og hva som er gjort

Rommet er rekonstruert fra skjermbildene (mål, ikke piksler): 312 × 323 cm, InFloor 17T 1200 W 70,5 m
(produkt-id 28, kantavstand 5 cm, CC 5–20 cm), én hindring 20 × 20 cm med venstrekant 232 cm fra venstre
vegg og overkant 50 cm fra toppen (60 cm fra høyre vegg). Netto 10,04 m², arealregelen gir CC 14,24 cm.
Harness: `/tmp/cdp161` (headless Chrome, katalogen fra `/tmp/cdp145/catalog.json`), gammel kode på port 4009.

## STEG 0 — målt FØR endring (commit 1fd7acc)

### 0.1 Begge retninger, hjørne «nede til venstre» (velgerens standard)

| retning | gren som vant | CC | N løp | lengde | avvik | dekning | poeng | celler | transitt | hull | vegg → felt (v/h/t/b) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| vannrett (Kenneths bilde) | **hjørnerunden (083)** | 12,035 | 28 | 70,50 m | 0,00 % | **83,8 %** | 98,8* | 4 | 1 | 0 | **21,7 / 21,7 / 17,1 / 5,1** |
| vannrett, det lengdesøket fant | `tries` | 14,223 | 27 | 70,60 m | +0,14 % | 98,5 % | 87,1 | 4 | 1 | 0 | 5 / 5 / 5 / 5,1 |
| loddrett | 099 | 14,376 | 26 | 69,94 m | −0,80 % | 98,5 % | 74,4 | 4 | 1 | 0 | 5 / 5,1 / 5 / 5 |

\* poengsummen i hjørnerunden regnes med `parity: true` (hjørneleddet 20 i stedet for 4) — den er ikke
sammenlignbar med de andre, og hjørnerunden sammenligner heller ikke poeng.

Vannrett ga nøyaktig Kenneths tall: CC 12,0, 141 W/m² flate (1200 / (70,5 × 0,12035) = 141,4), svingene
21,7 cm fra veggen, 17,1 cm tom stripe øverst. Loddrett var rent. Skjermbilder: `bilder/foer-vannrett-bl.png`,
`bilder/foer-loddrett-bl.png`.

**Trace vannrett (bl):** N-stigen gikk 19,56 → 14,22 og traff på første trinn innenfor toleransen: N=23,
CC 14,223, 70,60 m (+10 cm). `tries` → attempt(14,223) gyldig, 98,5 %, hull 0 — men starten ligger 300 cm
fra «nede til venstre» (N er et oddetall; endene ligger i motsatte hjørner, og transitten eier det ene).
Hjørnerunden (083) lette så ned grovsveipet 17 → 14 → 11 → 8 → 5 og fant ETT treff: CC 11,84 → rutenettet
runder til 12,035 (N=27 baner + 2 delte), 79,6 m, trukket inn 16,68 cm i hver ende for å treffe 70,5 m.
Aksepttesten så bare gyldig · lengde · hjørne — ikke at feltet var krympet. Dekningen falt 14,7
prosentpoeng, og R-START-regelen (083: «start kabel følger retningsvelgeren, den må vinne over dekning»)
lot det skje.

**Trace loddrett (bl):** stigen 15,89 … 6,42; beste trinn 13,723 (−56 cm), `overCc` 13,126. `tries`:
13,723 gyldig men **hull 1** (94,2 %); 13,126 ugyldig på lengde. 079d gikk ned stigen og fant 12,076
hullfri — med 21,3 cm inntrekking (85,9 %). 099 fant så 14,376 (hull 0, 98,5 %, treffer `bl`) og vant.
For `tl`/`tr` bommer 14,376 på hjørnet, og 079d-kandidaten (12,076, 26,3 cm fra topp og bunn, 85,9 %)
vant på R-START — samme feilklasse som vannrett, via en annen runde.

### 0.2 Cellene (konsoll-dump, `_geoBuildGrid`)

Vannrett CC 14,223: celle 0 = 3 baner over hindringens bånd (y 5–33,5, full bredde), celle 1 = 2 baner
til venstre for hindringen (x 12–221), celle 2 = 2 baner til høyre (x 263–300), celle 3 = 18 baner under
(full bredde). Naboskap 0–{1,2}, 3–{1,2}. 14 transittvarianter, alle med T = bane 33,5, cl = 227.
Loddrett CC 14,376: 16 baner til venstre (full høyde), 2 over hindringen (y 12–38), 2 under (y 82–311),
4 til høyre. Dette er lærebok-BCD: hindringens kolonne/bånd er delt bare i hindringens eget bånd, ikke i
hele rommets høyde. **Ingen cellefeil** — Gjør 3 utløses ikke. «Bredder som stopper midt i rommet
langt under hindringen» i Kenneths bilde er de 16,7 cm inntrukne endene i ALLE løp (jevn inntrekking),
pluss at celle 2 (høyre for hindringen) ble stående tom i den varianten hjørnerunden fant.

### 0.3 Auto (ingen retningslås)

Auto valgte **vannrett** — samme 83,8 %-utlegg. `generateCableGeo` velger retning på poeng mellom
retningenes beste kandidat FØR reparasjonsrundene: vannrett 87,1 (+0,14 %) mot loddrett 74,4 (−0,80 %);
lengdeleddet (20 poeng per %) avgjorde, så hjørnerunden ødela vinneren. Hva `S.varmefolie.direction`
sto på i Kenneths økt vet jeg ikke; med låst vannrett er resultatet identisk, med auto også — bildet
hans er altså forklart uansett.

### 0.4 Poengleddene (rent loddrett 74,4 mot rotete vannrett 98,8 / 87,1)

| ledd | loddrett 14,376 | vannrett 12,035 (hjørnerunde) | vannrett 14,223 |
|---|---|---|---|
| lengde 60 − 20·|avvik| | 44,0 (−0,80 %) | 60,0 | 57,2 |
| dekning 0,3·% | 29,6 | 25,1 | 29,6 |
| myke avvik −2 | −2 (hopp) | −4 (kant_asymmetri, dekning) | −2 |
| ønsket retning +4 | +4 | 0 / +4 | 0 |
| hjørne (4 el. 20 i paritet)·nærhet | ≈3,7 | ≈18 (paritet) | ≈0 |
| celler −1,5·(n−1) | −4,5 | −4,5 | −4,5 |
| hull −25 | 0 | 0 | 0 |

Det som drar det rotete opp: lengdeleddet (16 poeng for 0,8 % — begge er innenfor ±1 %) og
paritetshjørnet. Det som mangler helt: ett eneste ledd som ser at svingene står 16,7 cm fra veggen.

### 0.5 Fragmentering — fantes det et mål?

Nei. `_geoInteriorHoles` teller tomme baner INNE i feltet, R-VEGG (`wallStripeCm`) måler på tvers av
løpene, R-ENDE bare de to frie endene. Ingen måler løpsender som stopper i åpent rom, og ingen måler
jevn inntrekking langs løpene. Målt med det nye målet (`loseEnder`, se under): 0 i BEGGE retninger i
dette rommet — Kenneths rotete bilde er ikke fragmentering, det er krympet felt (kantgap). Målet biter
likevel: i hjørnerundens nabotrinn 13,604 vannrett finnes et gyldig treff med `lose 1, hull 2` (93,5 %),
og det avvises nå av nettopp dette.

### 0.6 Kantavstanden

`_effectiveMarginCm(28, rom)` = 5 cm (produktets 50 mm, ingen romønske). Målt vegg → ytterste streng /
svingtopp, alle fire sider:

| | venstre | høyre | topp | bunn |
|---|---|---|---|---|
| vannrett 12,035 (før) | 21,7 (sving) | 21,7 (sving) | 17,1 (tom bane + streng) | 5,1 (streng) |
| loddrett 14,376 (før og nå) | 5,0 (streng) | 5,1 (streng) | 5,0 (sving) | 5,0 (sving) |
| vannrett 14,223 (nå) | 5,0 | 5,0 | 5,0 | 5,1 |

Feltet krympet av `extraSweep` = 16,68 cm: hjørnerunden valgte CC 12,0 (79,6 m kabel i rutenettet) og
trakk alle svinger inn for å treffe 70,5 m. Samme feilklasse som 153 (tettere CC enn arealet tilsier),
men årsaken var ikke CC-søket — N-stigen HADDE 14,223 — det var reparasjonsrunden som kjøpte hjørnet.

### 0.7 Feiltypen er systematisk (25 hindringsposisjoner, bl)

Hindringen flyttet 50–70 cm fra høyre vegg × 40–60 cm fra toppen, vannrett + loddrett, hjørne `bl`:
20 av 50 utlegg hadde 17–32 cm fra vegg til sving og 80–86 % dekning. Alltid samme mekanisme.

### 0.8 Funn underveis: dekningsbufferen blandet varianter

`_cableGeometryCheck` sin nøkkel til `_cableCovCache` var `rom:antall segmenter:lengde:CC:netto`. Den
holete og den hullfrie varianten på CC 13,72 loddrett har samme tall → den hullfrie ARVET 94,0 %
(sann verdi 96,2 %, målt med tømt buffer). Poengene og hjørnerundens «ikke mer enn 3 pp dårligere»
leste feil tall. Rettet: en geometrisum i nøkkelen (romkortets kall hadde det allerede). Ingen
baselinjerad endret seg av dette alene.

## Hva som er gjort (alt avgrenset til rom med hindring/forbudt sone, `legal.blockers`)

1. **To nye mål i `_cableGeometryCheck.metrics`:** `loseEnder` (`_cableLoseEnder`: et løpsende er løst
   når det lovlige området fortsetter > 1 CC forbi enden, enden ikke ligger inntil en hindring, og et
   naboløp i samme bånd går > 1 CC lenger) og `kantGapCm`/`kantGapCC`/`kantGapSider` (`_cableKantGap`:
   senterlinjens ytterste punkt per side, strålekastet til romkonturen, minus kantavstanden).
   Ikke myke avvik (et `soft`-innslag trekker poeng i ALLE rom) — panelet leser målene direkte.
2. **Poeng (`_geoScore`, bak `ctx.hind`):** kantgap gradert 0 → −20 fra kant+1 CC til kant+2 CC;
   −6 per løs ende, høyst −24. Begge under hull-straffen 25.
3. **Aksepttest i reparasjonsrundene (`_geoKantOk`):** 079d, 099 og hjørnerunden godtar ikke lenger en
   kandidat med `kantGapCm > CC + 1`. Hjørnerunden krever i tillegg ikke flere løse ender og ikke flere
   hull enn vinneren (hjørnet kjøpes ikke for et hull, 074b).
4. **Hjørnerunden prøver de to nærmeste N-trinnene** før grovsveipet, med +15 sonder i budsjettet per
   trinn (grovsveipet har like mye igjen som før — det var 099s grunn til å rulle «hele stigen nærmest
   først» tilbake). Den kjører også når vinneren treffer hjørnet MED hull, og bytter bare til et treff
   med færre hull.
5. **099:** et nabotrinn `tries` alt prøvde utrimmet får prøve den trimmede varianten (det var slik
   13,126 → 3,7 cm trim → hullfri, treffer `tl`/`br` ble synlig).
6. **Retningsvalget i auto:** færrest defekter (hull + løse ender + krympet felt) → R-START → dekning
   (> 2 pp) → poeng. Bommer vinneren på hjørnet etter rundene, kjøres hele søket i den andre retningen,
   og den tas bare om den treffer hjørnet uten defekter og ≥ dekning − 3 pp.
7. **Låst retning:** har det låste utlegget en defekt eller < 95 % dekning, måles den andre retningen;
   er den uten defekter og minst like godt dekket (eller ≥ 5 pp bedre), får panelet «Loddrett/Vannrett
   gir et renere utlegg her (dekning 98 % mot 92 %, CC 14,2 cm)» med knapp «Vis … i stedet»
   (`_cableLeggRetning`: setter velgeren, legger på nytt gjennom kaskaden, angre, gated på
   readOnly/kundeMode). Panelet sier også «⚠ Kabelfeltet stopper N cm fra veggen» og «⚠ N løp slutter
   midt i rommet uten grunn» når målene slår ut.
8. **Fixture `hind1`** i `_cableFixtures` med `laas: { dekMin 95, devMax 1, loseMax 0, kantGapCCMax 1 }`;
   `lose`, `kantGapCC`, `dev` i hver suite-rad; `_cableGeoSuiteCompare` feiler på flere løse ender,
   kantgap som går over 1 CC, og fixturens egne krav. Seksjon «161» i `_cableGeometryRegressionTest`
   (også i den raske porten) med hind1 + hindringen midt i rommet + nede til venstre.

## Etter — samme rom, samme hjørne (`bl`)

| retning | CC | N | lengde | avvik | dekning | hull | løse | kantgap | start fra hjørnet |
|---|---|---|---|---|---|---|---|---|---|
| vannrett låst | 14,223 | 27 | 70,60 m | +0,14 % | **98,5 %** | 0 | 0 | 0,01 CC | 300 cm (kan ikke nås vannrett — panelet sier det og tilbyr loddrett, 13 cm) |
| loddrett låst | 14,376 | 26 | 69,94 m | −0,80 % | 98,5 % | 0 | 0 | 0,01 CC | 13 cm |
| **auto** | **loddrett** 14,376 | 26 | 69,94 m | −0,80 % | **98,5 %** | 0 | 0 | 0,01 CC | 13 cm |

Alle åtte rader i fixturen: dekning 95,1–98,5 %, løse ender 0, kantgap ≤ 1,01 CC (`v/tr`: én tom bane
ved høyre vegg, lov etter 074b), lengde innenfor ±0,91 %. Bare løpene som treffer hindringen tar omvei
(`bilder/etter-loddrett-tl.png`, `bilder/etter-auto-tr.png`). Loddrett `tl`/`br` gikk fra 85,9 % og
26,3 cm til 95,1 % og 5,4 cm (0,39 CC) inntrekking på CC 13,72 (fix 5). `v/tr` fra hull 1 til hullfri
96,2 % (fix 4 + bufferfiksen).

Hvorfor vannrett `bl` ikke treffer hjørnet: hjørnerunden prøvde N=24 (13,604: 68,6 m, for kort; den
gyldige varianten har hull 2 og 1 løs ende), N=22 (for kort), og grovsveipet; det eneste treffet var
Kenneths 16,7 cm-utlegg, som nå avvises. Det finnes altså ikke et rent vannrett utlegg som starter nede
til venstre i dette rommet — da er det riktig at panelet sier det og tilbyr loddrett (088b-mønsteret).

**Variantene (test 3):** hindring midt i rommet — auto `bl` loddrett 98,5 %, `tr` vannrett 90 % (treffer
hjørnet; loddrett 98,5 % bommer 311 cm — R-START står over dekning, 083), ingen løse ender, ingen hull.
Hindring nede til venstre — vannrett 98,4 %, loddrett 91,5 %; låst loddrett får merknaden «Vannrett gir
et renere utlegg her (dekning 98 % mot 92 %)» med knapp.

## Portene

- `_cableGeoSuite()`: først målt mot den gamle baselinjen: **GRØNN, 152 rader, 0 feil, 5 bedre, 8 nye**.
  Rom uten hindring: **bit for bit identiske** på alle rapporterte felt (n, CC, m, dekning, stripe, ende,
  start, hull, celler, transitt) — målt mot før-kjøringen. Underveis (før avgrensningen til
  `legal.blockers`) endret vaktene lRom, uRom, utsparing, badHakk, rom5 og badHakk41 og kostet R-START i
  fem rader; det er grunnen til at ALT i 161 ligger bak `_har161`.
- Baselinje skrevet på nytt (`oppdaterBaseline: true, commit: '161'`), 144 → 152 rader, nye felt `lose`
  og `kantGapCC` i alle rader. Diff: enHindring v/bl 89 → 93,8 %, v/br 90,7 → 93,7 %, h/bl og h/tl
  77,1 → 89,3 % (stripe 14,1 → 5,1, start 32/35 → 19); umuligStartHjorne v/tr 79,1 → 96,5 % (start 36 →
  12). Sone-radene fikk `dek` (feltet fantes ikke i den gamle baselinjen fra 27.10). Verifisert GRØNN
  mot den nye: 0 feil, 0 bedre, 0 endret. 26,3 s (før: 20,0 s; hind1 koster 5,1 s).
- `_cableGeometryRegressionTest()`: **159/159**, 47,8 s. `_cableGeometryQuickTest()`: **94/94**, 29,1 s
  (67 → 94 med 161-seksjonen). `_pdfExportSmokeTest()`: **55/55**.

## Ikke gjort / ærlig

- Kenneths skjermbilde hadde «bølgete ender». Min rekonstruksjon gir jevnt inntrukne ender (alle 16,7 cm)
  og en tom celle til høyre for hindringen — samme CC, samme dekning, samme 141 W/m², men ikke bølgete.
  Løse ender måles til 0 i begge retninger. Enten var hindringen plassert litt annerledes (25
  posisjoner sveipet, ingen ga bølger), eller bølgene kom av en variant jeg ikke når. Målet
  `loseEnder` er bygget og fanger slikt (det avviste 13,604-varianten), men det er ikke bevist på
  nettopp hans bilde.
- Vannrett låst nede til venstre treffer ikke hjørnet i dette rommet (se over). Det er ikke en feil i
  motoren — løsningen finnes ikke uten krympet felt — men brukeren får et 300 cm-avvik med forklaring.
- Timing: suiten 20 → 26 s (grensen 40). hind1 er den tyngste fixturen (5,1 s) fordi hjørnerunden med
  nabotrinn kjører i fire av åtte rader.
