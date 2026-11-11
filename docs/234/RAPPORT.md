# 234 – Kabel: det tegnede oppvarmede feltet går halv CC ut fra kabelen

Commit: `HASH` på `main`, ikke pushet.

## Hva det lyseblå feltet var
Ikke en sone og ikke kabelens boks. Det var **romfyllet** (rommets vanlige lyseblå farge) som sto igjen
innenfor **randsonen**: `_drawCableMarginZone` la en svak beige tone på ringen mellom veggen og
kantavstanden (`_effectiveMarginCm`, i eksempelet 20 cm) og en stiplet linje i grensen. Feltet var altså
«rommet minus kantavstanden» – 230 × 110 cm i eksempelet – og hadde ingenting med CC å gjøre. Likt på
skjermen og i PDF-en (PDF-bildet er samme tegnekode).

## Hva som er endret
- Nytt lag `_drawCableHeatedLayer` (kalles først i `drawCables`): rommet **uten** det oppvarmede feltet får
  randsonens tone, så det lyse feltet nå er det oppvarmede feltet. Feltet er en strek med bredde = CC og
  runde ender langs alle kabelsegmenter (strenger og U-svinger) = alt innenfor halv CC, klippet mot
  rommet, med hindringer og forbudte soner tatt ut. Samme modell og samme utvalg som `_cableCoveredCm2`.
- Reserven er ikke med. Brukerens soner (`S.zones`) er ikke rørt og tegnes som før.
- Den stiplede kantavstand-linja står som før. Kantavstandsmål, leggeregler, folie, matte, aluboard, snø
  og trapp er ikke rørt. Ingen tall er endret.
- Rom som også har folie/matte/plater beholder den gamle ringen langs veggene (der betyr «ikke kabel»
  ikke «ikke oppvarmet»), med kabelfeltet skåret ut av ringen.
- Skjerm og PDF bruker samme kode (`_cableFieldPaint`). `_cableFieldMeasure` måler det tegnede feltet.

## Arealtall fra kontrollen
Ekte produkter (InFloor 10T), `docs/234/probe/fix.js`:

| Rom | Tegnet felt | «Oppvarmet areal» | Avvik | Flateeffekt | Utenfor rom / i hindring |
|---|---|---|---|---|---|
| A Kenneths eksempel 270 × 150, 100 W 10 m, CC 28,7, reserve | 2,92 m² | 2,92 m² | +0,14 % | 35 W/m² | 0 / 0 |
| B L-rom med hindring, 500 W 50 m, CC 16,3 | 8,04 m² | 8,04 m² | −0,01 % | 61 W/m² | 0 / 0 |
| C halv CC forbi veggen, 300 W 30 m, CC 26,2 | 7,37 m² | 7,31 m² | +0,82 % | 38 W/m² | 0 / 0 |

Eksempelet gir 2,92 m², ikke 2,87: 2,87 er lengde × CC (10 m × 0,287). Feltet er litt større fordi
halvsirklene i endene stikker halv CC ut forbi buene. Tallene er like før og etter (målt på HEAD-kopien).

## Tester
- Ny `_cableFieldRegressionTest234`: 31/31.
- Hele suiten: 101 tester (`docs/225/probe/alle.mjs`, kopi i `probe/`), de 100 gamle gir nøyaktig samme resultat som HEAD – de samme sju røde uten innlogging, ingen nye. Første kjøring avslørte at laget krasjet når lerretet er 0 × 0 (skjult app); rettet med en vakt før commit.

## Funn som ikke er rettet
1. **«Oppvarmet areal» er selv unøyaktig.** `_cableCoveredCm2` teller på et rutenett med steg = halv CC
   (minst 5 cm). I testens L-rom (CC 20, hindring og forbudt sone inntil kabelen) gir det 6,79 m², mens
   samme modell på 1 cm rutenett gir 6,54 m² (+3,8 %). Tegningen treffer 1 cm-fasiten innenfor 0,02 %.
   Ikke rettet fordi tallene ikke skulle endres.
2. Naborom synes i kanten av PDF-bildet når rommene ligger tett (også før 234).
3. To kabler med ulik CC i samme rom: tallet bruker den første kabelens CC for begge, og tegningen gjør
   det samme for å stemme med tallet.

Bilder: `foer-*.png` og `etter-*.png` (skjerm, nærbilde av A, PDF-side A/B/C).
