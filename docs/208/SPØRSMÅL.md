# 208 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Stemmer tilbehørsreglene med Cenikas datablad?** Alt er lest ut av IceFix-filmen (07.11.2026), og ingenting er
   kontrollert mot et datablad. Sjekk særlig disse punktene:
   - Trengs det endeavslutning der kabelen snur i bunnen av et nedløp med 2 løp? Jeg har regnet nei, fordi kabelen bare snur der.
   - Er tilkoblingen i «sammenhengende» en boks, eller en kald tilkobling som følger med kabelen? Prompten sier «0 bokser», så jeg teller den som tilkobling, men ikke som boks.
   - Hører avlasteren til hvert nedløp, eller til hvert løp i nedløpet? Jeg har regnet én per nedløp, slik filmen viser det.

2. **«Seks tilbehørsdeler mindre».** Etter regelen er forskjellen 4 deler: metode 1 har 1 + 2 + 3 = 6, og metode 2 har
   1 tilkobling + 1 avslutning = 2. Det blir seks bare hvis start og avslutning i metode 2 følger med kabelen og ikke telles som
   tilbehør. Hvilken telling er riktig? Panelet viser i dag delene hver for seg. Knappene viser bare kabelmeter og bokser, så
   tallet «seks» står ikke noe sted.

3. **Tilkoblingsboksen dekker den første overgangen, også uten avkrysning.** Hvis du bare setter n1 til 1 løp, regner appen
   tilkoblingsboksen ved n1 («første overgang») og gir ingen melding. Det er fortsatt én kabel: start ved innløpet og slutt nede
   i n1. Meldingen kommer først ved overgang nummer to. Stemmer det, eller skal hver overgang krysses av?

4. **Tilkobling per rennestrekk.** «1 per kurs», men taket har ingen kurser (T8). Hvert rennestrekk med nedløpene sine regnes
   som ett kabelnett med én tilkobling. To strekk på samme hus gir altså 2 tilkoblinger. Er det riktig?

5. **Gradrenner er ikke med i tilbehøret.** I modellen er gradrenna ikke koblet til noe rennestrekk, så appen vet ikke om den
   har egen tilkobling eller henger på renna. Panelet sier «Gradrenner er ikke med i tilbehøret.» Hvordan henger de sammen?

6. **Hvor boksen står.** Den tegnes 0,6 m før nedløpet. Det er filmens 12,5 − 11,9 og 23 − 22,4. Tilkoblingen sto på 0,5 m,
   altså 1,5 m før n1, men jeg bruker 0,6 m for alle. Boksen tegnes innenfor renna, fordi utsiden har lengdeetikettene. Plasseringen
   påvirker ikke kabelmeter (213 spm. 4: halen fra boks til renne er ikke regnet). Skal boksens hale inn i kabelmeter når
   produktet er valgt?

7. **«Kursens farge»** er rennestrekkets farge, fordi taket ikke har kurser ennå. Alle symboler går gjennom én hjelper
   (`_takKursColor`), så fargen kan byttes når T8 er avklart.

8. **En boks der den ikke trengs** (for eksempel etter «Boks ved hvert nedløp» og så 2 løp på et nedløp) telles fortsatt som
   T-forgrening, og panelet sier «— trengs ikke her». Den fjernes ikke av seg selv. Skal den telles?
