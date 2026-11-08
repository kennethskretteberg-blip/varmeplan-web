# 204 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **«Skråtak», ikke «Saltak».** Prompten viser «Saltak (antatt)». Tjenesten sier bare `pitched`, altså
   «ikke flatt». Den kan ikke skille saltak fra valmtak, pulttak eller et sammensatt tak. Å kalle det
   saltak ville vært et anslag oppå et anslag. Knappene heter derfor **Skråtak / Flatt tak**, som i
   ordene dine: «skråtak og takrenner eller flatt tak med taksluk». Vil du ha saltak/valmtak/pulttak
   som egne valg, er det naturlig å ta det inn i 205, der formen styrer kantforslaget.

2. **Terrenghøyden har `height_ref: 'moh'`.** Prompten sier at høydene skal ha `'takfot' | 'terreng' |
   'møne'`. Gesims og møne fra tjenesten er målt over terrenget, så de får `'terreng'`. Terrenget selv
   (182,4) er meter over havet (NN2000). Å merke det `'terreng'` ville betydd «0 m over terrenget».
   Jeg har derfor lagt til `'moh'`. Er det greit?

3. **Tak finnes bare som dashbordflis.** «Hva ønsker du å prosjektere?» (`+ Del`) har fortsatt dine
   fire valg fra 066. Modulknappene øverst i sidepanelet har også fortsatt fire kolonner. Et prosjekt
   som starter som gulvvarme, kan derfor ikke få en tak-del. Skal Tak bli femte valg i dialogen og
   femte knapp i navet? Det bryter 066-regelen, og navet må få plass til fem.

4. **«(målt i høydedata)», ikke «(målt)».** I kontrakten betyr `MEASURED` at *montøren* har målt.
   Gesimsen kommer fra laserdata (`DOM_RASTER`, ±0,5 m). «(målt)» alene kunne blitt lest som at noen
   har stått der med målebånd. Er ordlyden grei?

5. **Omriss tegnet for hånd på et kart får ingen høyder.** Tjenesten tar imot et hvilket som helst
   polygon, så et omriss du tegner selv oppå kartet kunne fått gesims, møne og taktype akkurat som et
   Kartverket-omriss. Jeg har ikke gjort det, fordi prompten sier at et omriss tegnet for hånd ikke skal
   ha noe forvalgt. Skal det hente høyder når det ligger på et kart?

6. **Hvor skal delte kanter bo (205)?** Prompten vil ha `edges` på hver takflate, og slik er det
   bygget (tomt). Felles-reglene sier at møne, grad og gradrenne lagres **én gang**. Med flere flater
   blir det enklest å ha én kantliste på `S.tak[fid].edges` med `planes: [flateA, flateB]`, slik
   tak-planen §6.3 har det, og ikke én liste per flate. Mitt forslag til 205 er å flytte listen opp et
   nivå før den får innhold. Det koster ingenting nå. Er du enig?

7. **I tak-modulen velger et klikk på bygget det.** I snø henter «Hent bygg» bare omrisset (201). I
   tak er klikket valget av bygg, og høydene hentes med en gang. «Bytt bygg» i ⋯-menyen gjør det samme.
   Har taket rettede verdier eller merkede kanter, spør appen før det bytter. Stemmer det med det du
   ser for deg?

8. **Kundebedrifter ser Tak med hengelås.** `roof` var allerede en låsenøkkel (170), og
   `['indoor','list']` er standard for kundebedrifter. Tak er derfor låst for dem, med «Be om
   prosjektering», som snø og trapp. Riktig?

9. **Funn: `_resetProjectState` nullstiller ikke `S.geo`.** Et nytt prosjekt arver forrige prosjekts
   `S.geo` helt til et lagret prosjekt åpnes. Det er harmløst i dag, fordi kartet (`S.bgs`) nullstilles
   og `_activeGeo` krever det. Jeg har ikke rørt det, fordi det ikke hører til 204. `S.tak` nullstilles
   der. Skal jeg rette `S.geo` i en egen liten prompt?

   **Svar (217):** rettet. `_resetProjectState` setter nå `S.geo = {}`. Det var ikke harmløst: målt i 217 ble
   forrige prosjekts `S.geo` lagret i det nye prosjektets JSON ved «Opprett prosjekt». Se `docs/217/RAPPORT.md`.

10. **Gesimsen er én verdi for hele bygget.** Kortet sier det rett under tallet: «Én verdi for hele
    bygget (median) — rett den hvis takfoten ligger ulikt.» Høyde per kant hører til 205/206. Til da
    gjelder den ene verdien som standard for alle kanter.
