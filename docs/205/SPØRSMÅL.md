# 205 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Valmtak ser ut som saltak i omrisset.** Et rektangulært bygg med valmtak får forslaget «to
   takfot, to gavl, møne». Det er feil på gavlene. Tjenesten sier bare `pitched`, og omrisset kan ikke
   skille saltak fra valm. Jeg har latt forslaget stå, men med lav confidence (0,4) og teksten «Valm-
   eller pulttak? Rett kantene.» Valmtak rettes raskest med «Merk alle som takfot». Alternativet er å
   ikke gjette på skråtak i det hele tatt før brukeren har sagt «saltak». Det krever et tredje
   taktypevalg (Saltak / Valmtak / Pulttak i stedet for bare Skråtak, se 204-spørsmål 1). Vil du
   det?

2. **Fall-sider, ikke takflater.** Prompten vil at kanten skal vise til flatene den deler. Vi har
   ingen takflater (`roof.planes` er tom). Jeg har lagt inn de to fall-sidene som saltak-forslaget
   innebærer, `f1.a` og `f1.b`, med hvilke takfotkanter som hører til hver. Mønet peker på begge.
   Helning, normal og areal per side står tomt, fordi tallene ikke finnes. Er det greit at «flate» i
   kantmodellen betyr fall-side til vi har ekte takflater?

3. **«Merk alle som takfot/parapet» fjerner mønet.** Mønet i forslaget går mellom midtpunktene på de
   to gavlene. Er alle kantene takfot (valm), er linja feil. Er alle parapet (flatt), finnes det
   ikke noe møne. Jeg fjerner det derfor. Det finnes ingen måte å tegne et møne selv. Det hører
   sammen med gradrenner og grater, og jeg har ikke bygget det. Skal 205b eller 209 få «tegn
   linje» (møne, grat, gradrenne)?

   **Svar (220):** Ja, møne er bygget. «+ Møne» i steg 3 tegner mønet selv. «Merk alle som takfot» beholder nå et møne du har tegnet, og fjerner bare forslaget. Gradrenne hadde egen knapp fra 206. Grat har ikke noe eget objekt, men i 3D blir den skjæringen mellom to flater. Se `docs/220/RAPPORT.md`.

4. **Nesten kvadratisk gjettes ikke.** Er lang side mindre enn 5 % lengre enn kort side (f.eks.
   10 × 9,8 m), vet appen ikke hvilken vei mønet går. Den sier da «Bygget er nesten kvadratisk —
   appen vet ikke hvilken vei mønet går. Merk kantene selv.» Toleransene er 5° for rette hjørner og
   5 % for kvadrat. Er de passe?

5. **Gavl og parapet er begge grå.** Tabellen din har «Gavl: grå» og «Parapet: grå strek». Gavl er en
   lys grå, 4 px bred linje. Parapet er en mørk grå (nesten svart), 3 px bred linje. «Ikke valgt» er
   rød og stiplet, slik at den skiller seg ut. Ser det riktig ut på et ekte kart?

6. **«Nullstill» betyr «ikke valgt» på alle kanter, ikke «tilbake til forslaget».** Prompten sier
   «Nullstill … for å begynne på nytt». Jeg har tolket det som blanke ark, med advarsel til alle er
   merket. For å komme tilbake til appens forslag har jeg lagt til en fjerde knapp: «Foreslå på
   nytt». Er det riktig tolkning?

7. **Tak lagret av 204 får ikke forslag av seg selv.** Kantene der er tomme. Når et slikt tak åpnes,
   flyttes den tomme listen opp, og kortet viser «Foreslå kanttyper». Jeg lager ikke forslaget ved
   åpning, fordi det å åpne et prosjekt ikke skal endre det. Det gjelder bare tak laget i dag med 204.

8. **Kantklikk åpner en meny, ikke en verktøylinje.** Menyen er den vanlige høyreklikk-menyen, åpnet
   ved kanten på venstreklikk. Den viser lengden, typen og om typen er forslag eller merket av deg.
   På mobil/nettbrett er treffsonen 8 px, og det kan være lite for en finger. Skal treffsonen være
   større på berøringsskjerm?
