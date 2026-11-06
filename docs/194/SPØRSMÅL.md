# 194 · Spørsmål

1. **Eiendomsgrenser og terrengskygge er borte for nye kart.** De var lag brent inn i bildet fra `/roof/background`;
   WMTS gir bare `topo`/`topograatone`. Avkrysningsboksene i «Kartinnstillinger» gjør nå ingenting i flismodus.
   Skal vi (a) skjule dem, (b) bygge dem som egne flislag fra `varmeplan-roof` senere, eller (c) la nye kart
   ha et valg «Fast bilde med eiendom» (gammel vei)? Jeg lot dem stå uendret.
2. **Gråtone-laget** (`topograatone`) er støttet i motoren (`tiles.layer`) men har ingen bryter. Ønskes den?
3. **«Taste en gate og dra seg bort»:** panorering er nå fri, men omriss/kandidater hentes bare for adressen i
   «Hent fra kart». Skal omriss hentes for det synlige utsnittet mens man drar (krever `/roof`-kall per utsnitt)?
4. **«Kartet slutter her» for gamle prosjekter** beholdes (ellers ville et gammelt bilde-utsnitt se ut til å
   ha uendelig kart). Vil du heller konvertere gamle prosjekter til flislag ved åpning? Det ville gitt
   mindre prosjektrader, men bryter «åpne uendret».
5. **Zoom ut:** gulvet er nå 0,0003 (≈ 30 km). Vil du ha lavere/høyere?
6. **PDF-forhåndsvisningen** (dialogen) bruker bare fliser som allerede ligger i cache — er brukeren ikke
   i nærheten av rommet på kartet, tegnes oppskalerte grovere fliser der. Selve eksporten laster alltid først.
7. **Pre-eksisterende rød test:** `142: ctxbar sier «Kartet slutter her…»` feiler også på HEAD. Skal den fikses?
