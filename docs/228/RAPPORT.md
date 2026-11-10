# 228 – PDF: mål som kuttes i kanten av rombildet

10.11.2026 · `main` · committet, ikke pushet · commit `09d5c7b`

## Årsaken

Ingenting sjekket at målteksten fikk plass i bildet. Utsnittet regnes i cm (luft `_pdfRoomPadCm`, eller et lagret `room.pdfView` = senter + skala), mens målteksten etter 226 har fast størrelse i mm på papiret.

- **Auto-utsnitt kutter ikke** i et 3 × 3 m rom. Målt på testrommet: alle 27 mål innenfor, både Normal og Ekstra stor. Det stemmer med at «Spisestue» på side 5 står pent.
- **Et lagret utsnitt kutter.** Med `pdfView` 1,6× skjøvet mot venstre står «300 cm» halvveis utenfor venstre kant, og tre av de fire romkjedene er helt borte (`foer-kutt-*.png`).
- **P0402 er ikke åpnet** – jeg har ingen innlogging herfra. At «Kjøkken» har et lagret `pdfView` fra før 226 er derfor sannsynlig, ikke bekreftet. Sjekk: åpne forhåndsvisningen av Kjøkken – er «Tilbakestill utsnitt» klikkbar, har rommet et lagret utsnitt.

## Hva som er endret (`index.html`)

1. **Fangst av måltekst** (blokken «228 · INGEN MÅLTEKST KUTTES AV BILDEKANTEN»). Mens `_renderRoomToImage` tegner, noteres boksen til hver tekst i lerretspiksler. Tekst i målfargen fra 226, tegnet for rommet som vises, teller som mål. Naborommenes mål teller ikke.
2. **Auto-utsnitt:** står noe utenfor, flyttes/zoomes utsnittet ut akkurat nok, og bildet tegnes på nytt. Rommet selv holdes i bildet. Der alt har plass fra før, er bildet uendret.
3. **Lagret utsnitt:** samme justering, men bare når den er liten – høyst 20 % zoom ut og høyst 20 % av bildebredden i flytting. Forhåndsvisningen viser da «Utsnittet ble justert så målene får plass». Det lagrede utsnittet skrives ikke over.
4. **Lagret utsnitt som krever mer** (brukeren har zoomet inn på en detalj): utsnittet står urørt. Står mål delvis utenfor, sier forhåndsvisningen «N mål står delvis utenfor utsnittet — zoom ut eller flytt». Dette er valget prompten ba meg si fra om, se spørsmål 1.
5. **Målestokken:** tegnes i målenes papirstørrelse (2,0 mm × labelstørrelse, samme grå, samme strek), uten den gamle pillen. Den legges i første ledige felt av nede venstre, nede høyre, oppe venstre, oppe høyre, nede midt, oppe midt – ledig betyr 1,5 mm fra nærmeste tekst og tomme piksler under. Er det for trangt for 50 cm, prøves 20 og 10 cm. Finnes ikke noe felt, tegnes den ikke.
6. **Forhåndsvisningen** regner hjul og dra fra det lagrede utsnittet, ikke det justerte. Ellers kunne man aldri zoome seg forbi justeringen.

Bildestørrelse, aspekt, sideoppsett og sideantall er uendret. Skjermen er urørt.

## Før/etter (300 DPI, `docs/228/`)

| Tilfelle | Før | Etter |
|---|---|---|
| Lagret utsnitt 1,6× som skjærer venstre kant | `foer-kutt-venstre.png`: «300 cm» halvveis, tre kjeder borte | `etter-kutt-venstre.png`: alle 27 mål inne, tegnet i 1,46× |
| Målestokken | `foer-kutt-maalestokk.png`: 0,85 mm tekst i pille | `etter-kutt-maalestokk.png`: 2,0 mm, «20 cm» fordi 50 cm ikke får plass |
| Auto | `foer-auto-hel.png` | `etter-auto-hel.png`: samme utsnitt, bare ny målestokk («50 cm») |
| Ekstra stor + lagret utsnitt | `foer-kutt-xstor-hel.png` | `etter-kutt-xstor-hel.png`: alle mål inne, 1,45× |
| Detalj 3× | `foer-detalj-hel.png` | `etter-detalj-hel.png`: urørt utsnitt, 1 mål meldt som kuttet |

## Tester

- Ny `_pdfDimFitRegressionTest228`: **83/83**. Fire rom (1,5 × 1,2 m, 3 × 3 m med hindring, 9 × 7 m, L-form med kabel) × auto / `pdfView` 1,2× skjøvet / 0,8× × Normal og Ekstra stor: ingen måltekst utenfor bildet, samme bildestørrelse, målestokken aldri over en tekst. Pluss solveren alene, Kjøkken-tilfellet med vaksine (uten justering står mål utenfor), detaljutsnitt urørt, målestokkens størrelse.
- Hele suiten (`docs/225/probe/alle.mjs`): 97 tester, 90 grønne. **De samme sju røde som HEAD** (prosjektlås, kundeforslag og fem kart-tester – innlogging/karttjeneste), ingen nye.
- `_pdfPreviewRegressionTest` 96/96. Én sjekk er skrevet om (B2, zoom rundt pekeren): den måler nå mot det lagrede utsnittet, siden det tegnede kan være justert.
- Forhåndsvisningen prøvd i nettleser (`probe/varsel.mjs`): varselet vises ved 1,6×, og fire hjulklikk tar utsnittet forbi justeringen til 2,3×.

## Ikke gjort

- PDF av P0402 side 3 – ingen innlogging.
- Plantegningen per etasje (`_renderFloorToImage`) er ikke rørt. Den tegner ikke målkjeder utenfor rommene.

## Funn som ikke er rettet

- Veggetikettene «V1 300 cm» ligger under produktetikettene og er delvis skjult (V2 og V4 i alle bildene). Fantes før.
- Ekstra stor: hindringsmålene «80 cm» ligger over produktetikettene (`etter-kutt-xstor-hel.png`). Kjent fra 226.
- Frittstående mål (`S.floatingDims`) og naborommenes mål kan fortsatt kuttes av kanten – de hører ikke til rommet og flytter ikke utsnittet.
- Et lagret utsnitt mellom ca. 1,2× og 1,8× i et rom med romkjeder på alle sider tegnes nå i praksis som ca. 1,2–1,46×. Zoom-tallet i forhåndsvisningen viser det som tegnes, ikke det som er lagret.
