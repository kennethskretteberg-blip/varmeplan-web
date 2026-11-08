# 220 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Er L-formen i testene faktisk huset ditt?** Omrisset i fixture 3 er det 219 satte opp, og begge mønene er plassert av meg, midt i hver fløy (møtes i 5,5 / 3,5 m). Testene viser at verktøyet virker, ikke at taket ditt ser slik ut. **Valgt nå:** fixturen står. Tegn gjerne mønene på det ekte prosjektet og se om 3D stemmer.

2. **Skal k6, k7 og k8 være én takflate?** De er alle koblet til m2, men k6 står 3,5 m fra mønet og k8 står 5,5 m fra mønet. Da kan de ikke ligge i ett plan. Motoren tegner flaten med knekk og sier fra («ligger ikke i ett plan»). På et ekte hus er det som regel en egen liten takflate eller et utspring. **Valgt nå:** vise knekken og advare. Trengs en måte å tegne et lite tilbygg som egen flate?

3. **«r3» i meldingen.** Prompten skriver «r3 har ingen møne». Kantene heter k1–k8, og det er bare rennestrekkene som står med navn i tegningen. **Valgt nå:** navnet på renna hvis en renne ligger på kanten, ellers kantens navn («k6 har ingen møne»). Stemmer det med det du mente?

4. **Klikk på et møne gjør to ting.** Det velger mønet, så koblingene lyser, og åpner typemenyen fra 205 (Møne / Gradrenne / Fjern). Menyen er beholdt fordi den var der fra før. **Valgt nå:** begge. Vil du heller at klikk bare velger, og at menyen ligger på høyreklikk?

5. **Eget møne på et rektangel.** Forslaget `m1` står når du tegner et møne selv, så du får to møner til du fjerner det ene. **Valgt nå:** appen sletter ikke noe du ikke har bedt om, men et tegnet møne gir samme tak som forslaget. Skal det første tegnede mønet fjerne forslaget?

6. **Takvinkelen ved flere møner (`_takPitch`).** Den tok det første mønet på taket, så en snøfanger på k4 ville blitt regnet mot feil møne (6 m i stedet for 3,5 m). Det er endret til det nærmeste mønet, med mønets egen høyde. Tak med ett møne og uten egen høyde regnes nøyaktig som før, og kabelformlene er ikke rørt. Snøfangerens plassering i plan bruker tallet, og varmefeltet kan gjøre det også. **Valgt nå:** rettet, fordi den gamle regelen ville gitt et feil tall uten å si fra. Greit, selv om prompten sier at kabelberegningen ikke skal endres?

7. **Gradrenna i fixture 3 stemmer ikke med mønene.** g1 går fra (6,5 / 3,5) til det innvendige hjørnet, satt av 219. Møtepunktet til mønene er (5,5 / 3,5), så i 3D ligger gradrenna ved siden av knekken i taket. Det er slik «3D som kontroll» skal virke, og lengden 5,13 m er uendret. Motoren binder ikke gradrenna til mønene. En gradrenne du tegner selv, snapper til møneendene (`_takValleySnap`). **Valgt nå:** latt fixturen stå, så 219s tall kan sammenlignes. Skal jeg flytte g1 til møtepunktet?

8. **Hintet om gradrenne står også når gradrenna er tegnet.** Prompten sier «når to møner er tegnet på en form med et innvendig hjørne». **Valgt nå:** som prompten. Skal det bort når det finnes minst like mange gradrenner som innvendige hjørner?

9. **Bare valgt møne viser koblingen.** Alle møner har samme gule farge, og bare det valgte mønets takfot lyser. **Valgt nå:** slik prompten beskriver det. Med mange møner kunne hvert møne fått sin egen farge, så alle koblinger vises samtidig. Ønskes det?

10. **Mønet kan ikke flyttes.** Du fjerner det og tegner det på nytt. Høyden går da tilbake til takflatens. **Valgt nå:** ikke bygget (ikke bedt om). Trengs dra-håndtak i endene?

11. **«Merk alle som takfot» beholder tegnede møner, «Nullstill» fjerner dem.** Merk alle er det raske valget for valmtak, og da trengs mønet. Nullstill er «begynn på nytt». **Valgt nå:** som beskrevet. «Foreslå på nytt» spør nå også når du har tegnet møner selv.

12. **Verktøylinja ved 1280 px.** «+ Møne» gjorde den 59 px bredere, så den brakk til to rader og dekket øverste takkant. Under 1340 px skjules ordet «Merk som:» i verktøylinja, og den er én rad igjen. Fargeknappene står uten overskrift der. **Valgt nå:** det. Ved 1100 px er den to rader, som før (218 spm. 6).
