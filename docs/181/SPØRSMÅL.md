# 181 · Spørsmål

1. **Er dette «oversikten i Varmeplan» Fredrik mener?** Skjermbildet hans har vi ikke. Ingen skjerm i appen viser én
   rad per kabel for hele prosjektet. Jeg brukte **listevisningen** som mal (Etasje, Rom, Netto, Produkt, Effekt,
   W/m², CC) og la til El.nr, Lengde og K1/K2 per kabel. Hvis skjermbildet viser noe annet, for eksempel et bestemt
   panel eller andre kolonner, så send det, så justerer jeg kolonnene.
2. **W/m²: rommets eller kabelens?** Kolonnen viser rommets W/m² (ratet effekt ÷ netto gulv), likt Romoversikten og
   listevisningen, og bare på rommets første rad. Det finnes også kabelens egen flateeffekt (W/m ÷ CC, «Flateeffekt»
   på romsiden). Den er ofte høyere, i fixturen 170 mot 102 W/m² i Vaskerom. I et rom med både folie og kabel
   inkluderer rommets tall folien. Skal flateeffekten stå i stedet, eller i tillegg?
3. **Hvilke rom:** siden tar med alle rom, som Romoversikten og materiallista, også rom som ikke er hakt av som
   romsider. Motstandsmåling – varmefolie tar bare med rommene som er hakt av. Hvilken regel er riktig for kabelsiden?
4. **Motstandsmåling for kabel (egen sak senere):** PDF-en har ingen motstandstall for innendørs kabel i dag.
   Dokumentasjonsmodulen regner nominell R = U²/P (`_doc*`) og har leverandørens toleranse (±10 %) i `suppliers`. Det
   meste av grunnlaget finnes altså, og tabellen kan få kolonner for nedre/nominell/øvre Ω og «Målt», som på foliesiden.
5. **Snø, tak og trapp:** de er ikke med nå. Trapper har allerede sin egen Trappeoversikt. Skal snø- og takrom få en
   egen «Varmekabler – utendørs»-side, eller stå på denne siden under en egen overskrift?
6. **Kurs/fase:** det finnes ikke i datamodellen, og K1/K2 er det nærmeste. Ønsker elektrikeren en tom «Kurs»-kolonne
   å skrive i, som «Målt Ω» på foliesiden?
7. **Tallformat:** siden bruker komma (40,0), som motstandsmålingssiden. Romoversikten bruker punktum (40.0). Skal hele
   PDF-en over på komma? Det er en egen sak.
8. **Funn, ikke rettet:** Romoversikten kutter lange produktnavn. «InSnow 20T 2350W 117.4m 400V» blir «InSnow 20T
   2350W», så spenningen forsvinner, og «TestKabel 17T 1020W 60m» blir «TestKabel 17T». Den nye siden krymper navnet i
   stedet. Bør Romoversikten gjøre det samme?
