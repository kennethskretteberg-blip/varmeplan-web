# 232 – Varmefolie i PDF: motstandsmålingen på egen side, nominell motstand på romsiden, folieareal i tabellen

11.11.2026 · `main` · commit `HASH232` · ikke pushet · ingen SQL

## Hva som er endret (bare PDF-en og forhåndsvisningen i utskriftsdialogen)

1. **Romsidene:** utregningsblokken «Motstandsmåling – varmefolie» er borte fra romsidene. Vaktene som flyttet Hindringer/Notater/Fryserom til ny side når blokken tok plassen, er fjernet sammen med den – romsiden er nå lagt opp som den var uten blokk.
2. **Nytt felt «Nom. motstand»** i «Areal, effekt og dekning», femte felt i første rad, til høyre for «Total effekt» (f.eks. «183,7 Ω»). Vises for rom med folie, ikke for rom uten, og uavhengig av om tabellsiden er valgt. Tallet er `rNom` fra `_roomFoilResistance`; Ω tegnes med `_pdfTextOhm`.
3. **Tabellsiden** (valget «Motstandsmåling – varmefolie», avkrysset som standard, som før):
   - «Folie (m)» er byttet med **«Folieareal (m²)»** = Σ foliebredde × tegnet lengde, to desimaler.
   - Forklaringslinja: «Effekt = ca. 60 W/m² folieareal (regnet som tegnet lengde × W per løpemeter). Folieareal = foliebredde × tegnet lengde.»
   - **«Eksempel på utregning – [romnavn]»** nederst, etter «Hva målingen betyr» og «Målt av / Dato»: den samme blokken som før sto under hvert rom (`_drawResistanceBlock`, nå med valgfri tittel – ingen kopi). Holdes samlet; får den ikke plass, går hele blokken til neste side.
   - Rommet velges av `_foilResistanceExample`: flest ulike foliebredder, ved likhet det første i PDF-rekkefølgen.
4. **Forhåndsvisningen** i dialogen (`_expResistanceHtml`) viser samme tabell med areal, samme forklaring og samme eksempel. Den ruller nå fra toppen (innholdet er høyere enn feltet).
5. Valget av: ingen tabellside og ikke noe eksempel. «Nom. motstand» står fortsatt.

Effekt, grenser (48 400 / 52 900 / 57 600 ÷ effekt) og avrunding er ikke rørt. Ingen ny effektformel – grep-vakten i `_foilEffectRegressionTest` er grønn (32/32). Kabel, matte, andre PDF-seksjoner og skjermen er ikke rørt.

## Bredden arealet bygger på – og avviket fra 60 W/m²

Arealet bruker `netto_width_mm` (ellers `width_mm`) – samme bredde som «Oppvarmet areal» på romsiden. I databasen er de to feltene like for alle åtte FlexFoil, og begge er **1 cm smalere enn navnet**. W/m er derimot 60 × navnets bredde. Derfor går **areal × 60 ikke helt opp** for noe produkt:

| Produkt | Bredde i databasen | W/m | 60 × bredde | Avvik |
|---|---|---|---|---|
| FlexFoil B=20cm | 190 mm | 12 | 11,4 | −5,0 % |
| FlexFoil B=40cm | 390 mm | 24 | 23,4 | −2,5 % |
| FlexFoil B=50cm | 490 mm | 30 | 29,4 | −2,0 % |
| FlexFoil B=60cm | 590 mm | 36 | 35,4 | −1,7 % |
| FlexFoil B=80cm | 790 mm | 48 | 47,4 | −1,3 % |
| FlexFoil B=100cm | 990 mm | 60 | 59,4 | −1,0 % |
| FlexFoil B=120cm | 1190 mm | 72 | 71,4 | −0,8 % |
| FlexFoil B=140cm | 1390 mm | 84 | 83,4 | −0,7 % |

Arealet er ikke justert for å få regnestykket til å gå opp, og forklaringslinja sier derfor «ca.». Med navnets bredde (20, 40 … 140 cm) ville det gått opp nøyaktig – se spørsmål 1.

## Testprosjektet

Fire folierom og ett uten folie, ekte produkter fra databasen. PDF-ene ligger i `docs/232/probe/med.pdf` (6 sider) og `uten.pdf` (5 sider).

| Rom | Folie | Folieareal | Effekt | Areal × 60 | Avvik | Nom. motstand |
|---|---|---|---|---|---|---|
| Stue | 9,0 m B=100 | 8,91 m² | 540,0 W | 534,6 W | −1,0 % | 98,0 Ω |
| Kjøkken | 3,6 m B=60 + 3,0 m B=100 | 5,09 m² | 309,6 W | 305,6 W | −1,3 % | 170,9 Ω |
| Kontor | 3,0 m av B=20, 40 og 100 | 4,71 m² | 288,0 W | 282,6 W | −1,9 % | 183,7 Ω |
| Gang | 2,0 m av B=20, 40 og 60 | 2,34 m² | 144,0 W | 140,4 W | −2,5 % | 367,4 Ω |
| Bod uten folie | – | – | – | – | – | (ikke vist) |

**Største avvik areal × 60 mot effekt: −2,5 % (Gang).** **Eksempelet valgte Kontor** (tre bredder; Gang har også tre, men står etter).

Bilder i `docs/232/`: `romside-kontor.png` og `utsnitt-felt-nom-motstand.png` (feltet), `romside-bod-uten-folie.png`, `tabellside.png`, `utsnitt-eksempel.png`, `utsnitt-forklaring.png`, `uten-valg-romside-kontor.png` (valget av – feltet står), `dialog-forhaandsvisning.png`.

## Tester

- Ny `_foilPdfRegressionTest232`: **57/57**. Ingen blokk på romsidene; «Nom. motstand» med håndregnet verdi på hvert av de fire folierommene, i første rad til høyre for «Total effekt», og ikke på rommet uten folie; «Folieareal (m²)» med håndregnede areal; areal × 60 mot effekt (største avvik −2,5 %, per produkt −5,0 til −1,0 %); eksempelet er Kontor med Kontors tall; med 13 og 18 folierom står eksempelet samlet på én side (ved 18 flyttet til neste side); valget av → 5 sider, ingen tabell, ikke noe eksempel, feltet står; forhåndsvisningen og dialogvalget.
- `_foilResistanceRegressionTest` er **bevisst skrevet om**, 52 → 59 deltester: «blokk på hvert av de tre folierommene» er nå «ingen blokk på romsidene»; tittelen står én gang (før fire); utregningstallene sjekkes for eksempel-rommet (rom c, tre bredder, 191,4 W) i stedet for rom b; nye sjekker for arealkolonnen, «Nom. motstand» og at feltet står når valget er av.
- Hele suiten (`docs/232/probe/alle.mjs`, HEAD mot ny kode): 99 tester, 92 grønne. 97 er like med HEAD, én er endret med vilje (over), én er ny. **De samme sju røde som før** (uten innlogging): `_prosjektlaasRegressionTest` 66/67, `_kundeforslagRegressionTest` 270/271 og fem `_geo*` som kaster. Ingen nye.

## Funn jeg ikke rettet

1. **Bredden i databasen** er 1 cm under navnet for alle FlexFoil (se over og spørsmål 1).
2. **jsPDF måler «×» for smalt** (0,12 mm ved 7 pt). `_pdfSuperscriptPatch` plasserer den hevede toeren etter målt bredde, så «m²» etter flere «×» i samme tekst havner oppå neste tegn. Jeg skrev forklaringslinja slik at «²» står før første «×»; selve målefeilen står.
3. **Forhåndsvisningsfeltet sentrerer innholdet**, så andre høye seksjoner (f.eks. en lang materialliste) kan få toppen kuttet uten å kunne rulles dit. Rettet bare for motstandsmålingen.
4. **Desimaltegn på romsiden:** «Nom. motstand» har komma, arealfeltene i samme rad har punktum (som før).
5. `_noteH` og `_frysH` på romsiden brukes ikke lenger av noen vakt etter at blokken er borte. Ikke ryddet.
6. Ikke prøvd på et ekte prosjekt (ingen innlogging) – bare på testprosjektet over.

Spørsmål: `docs/232/SPØRSMÅL.md`.
