# 211 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Skal kalibreringen slutte å snappe til rasteret?** (funn, rom-modulen)

   Slår du på rastersnapp (`S.snap.grid`, 50 cm) før du kalibrerer en ny plantegning, snapper de to kalibreringsklikkene til 50 cm-rasteret. Det skjer i den *ukalibrerte* verdenen, der tegningen bare er noen få meter bred. Målestokken blir da feil.

   Målt med testtegningen (10 m-linje, bygget 25 × 10 m):
   - raster av: 2,5024 cm/px og kanter 25,03 / 10,01 m (0,11 %);
   - raster på: 2,2950 cm/px og kanter 22,50 / 9,50 m (**10 %**).

   Dette gjelder rom like mye som tak. Raster er av som standard. Mitt valg: **ikke rørt**, fordi prompten sier at rom-modulens plantegning skal være uendret. Rettingen er én linje i `getWorldPos`, som da ikke skal snappe i `bg-calibrate`. Skal jeg gjøre det, for både rom og tak?

2. **Hva skal skje med 204-modusen «Tegn omrisset selv» (`_takDraw`)?** Den er en egen tegnemodus for tak, altså det prompten sier vi ikke skal lage. Rom-modulens polygonverktøy gjør det samme, inkludert snapping til bygningsomriss i kartet.

   Mitt valg: **beholdt, men bare synlig når etasjen har kart.** Da sporer man bygget i kartet, som en del av adresse-veien. Uten kart er knappen byttet ut med plantegning og frihånd. 204-testen bruker den fortsatt. Skal den erstattes med polygonverktøyet og slettes i en egen prompt?

3. **Terrenget på et tegnet bygg: nullpunkt eller moh.?** Prompten sier «0 som standard». Jeg har lagret det som `{ value: 0, height_ref: 'terreng' }`, altså «terrenget er nullpunktet», og merket det «standard». Det står ikke som 0 moh.

   Skriver brukeren et tall, beholder det `height_ref: 'terreng'`. Et tall som 182 blir da tvetydig. Ingen kode bruker terrenget til noe i dag. Mitt valg: nullpunkt, med teksten «nullpunkt for høydene · valgfritt». Skal feltet heller være moh., som for hentede bygg?

4. **Skal gesims være en hard sperre?** Prompten sier «påkrevd». I dag kan man tegne renner og nedløp uten gesims. Panelet sier «Gesimshøyden mangler — uten den får nedløpene ingen lengde». Nedløpene viser «? m», og Kabelmeter sier at summen mangler dem. Ingenting regnes med 0.

   Mitt valg: **varsel, ikke sperre.** Montøren kan tegne ruta først og sette høyden etterpå. Skal rennestrekk og nedløp sperres til gesims er satt?

5. **Hurtigtastene R/M/P/L/W i tak-delen.** Før 211 avviste `createRoom` dem med «Tak-delen har ingen rom». Nå tegner de takets omriss med samme verktøy:
   - P over en plantegning blir «plantegning»;
   - W blir «frihånd»;
   - har taket arbeid, spør appen før omrisset byttes.

   Over en ukalibrert plantegning lagres ingenting. Mitt valg: tillatt, fordi det er rom-verktøyene prompten ber meg gjenbruke. Er det greit, eller skal tastene fortsatt avvises i tak-delen?

6. **Frihånd = vegg-for-vegg (W), ikke polygon (P).** «Brukeren oppgir mål på kantene, som ved frihåndstegning av rom i dag.» Rom-modulens verktøy der man skriver lengden på hver kant er vegg-for-vegg. Det har tastemodus (lengde + pil) og musemodus (lengde + pek, Shift gir fri vinkel). Polygon er klikk uten mål.

   Mitt valg: vegg-for-vegg. Skal frihånd også tilby polygon, med mål som skrives underveis?

7. **Hva skjer hvis plantegningen kalibreres på nytt etter at omrisset er tegnet?** Omrisset ligger i verdens-cm og skaleres ikke med. Rom gjør det på samme måte.

   Mister plantegningen målestokken, sperrer kortet kanter og renner med meldingen «Målestokken på plantegningen er ikke satt lenger». Det skjer for eksempel hvis tegningen byttes med en i et annet format. Målestokken omrisset ble tegnet med, står lagret på omrisset (`prov.scale`).

   Mitt valg: ingen automatisk omskalering. Skal appen tilby «skaler omrisset med» når målestokken endres?

8. **«Velg en annen vei»** fjerner taket (kan angres) og viser de tre valgene igjen. Har taket arbeid, spør appen først. Mitt valg: én knapp i kortet, ved siden av «Tegn på nytt». Er det for lett å slette?

9. **Møne-feltet vises bare for skråtak på et tegnet bygg.** Før taktypen er valgt, vises det ikke. På et hentet bygg vises det alltid, uendret fra 204. Mitt valg: skjult til «Skråtak» er valgt. Riktig?
