# 215 · Spørsmål til Kenneth

Alt under er bygd med det midlertidige valget som står der. Ingenting er vanskelig å endre.

1. **Er 0,50 m målt langs taket eller i plan?** Du skrev «opp på taket», så jeg tolket `offset_m` som avstand langs takflaten. Det er også bredden kabelen ligger over, så 12 × 0,5 = 6,0 m² står uendret uansett takvinkel. Tegningen er i plan, så på et 30°-tak ligger linja 43,3 cm inn fra kanten. Er vinkelen ukjent, tegnes den 50 cm inn. Stemmer det, eller måler montøren vannrett?

2. **Valmtak: feltet regnes som et rektangel.** Prompten sier bredde × lengde, og det har jeg fulgt. Der takfoten møter en grat, smalner feltet, så på et valmtak blir arealet og kabelmeterne litt for høye. Skal feltet kappes av gratene?

3. **Takvindu og hindringer i feltet trekkes ikke fra.** Et takvindu inne i stripen endrer ikke kabelmeterne, og appen sier ikke fra. Skal det trekkes fra, eller holder det med en advarsel?

4. **Summen står for seg.** Rennas tabell «Kabelmeter» er uendret (110,15 m på 213-bygget). Under den står «Felt mot takkanten» med sum, og en linje «Renner + felt». Verktøylinja viser «Kabel 110,15 m + felt 125,00 m». Grunnen er at du skrev at de regnes for seg, og at renna ennå ikke har noe produkt (T1). Skal feltet inn i selve tabellen når produkt og kurs finnes?

5. **Én kabel for alle feltene på taket**, som i 212. Den lagres i `t.guard_cable`, ikke i `t.flat`, fordi et skråtak ikke skal ha `flat` (212-testen krever det). Vil du kunne velge kabel per felt?

6. **Flatt tak får ikke «+ Snøfanger».** Regelen din handler om tak som heller ned mot renna, og flatt tak har sitt eget kort med sluk og varmefelt. Trengs snøfanger på flatt tak med utvendig renne?

7. **Løp som ikke går opp.** Med 250 W/m² gir 0,50 m 4,17 løp. Som i 212 er kabelmeter regnet av arealet (50,00 m), og panelet sier fra om at løpene ikke er et helt tall. Skal appen heller runde til hele løp, og regne W/m² tilbake?

8. **Kabelmeter i feltet er rette lengder.** Svinger mellom løpene og tilførselen fra renna eller boksen er ikke med, slik heller ikke svingene er med i renna (213). Formelen er din, og den gir akkurat 60,00 m. Skal det legges til noe når produktet (T1) er valgt?

9. **Delt på to steg.** Avstanden og valget «Varm feltet» står i steg 3, og valget står også i steg 4. Flateeffekt, kabel og regnestykket står bare i steg 4, i tråd med 214. Slår du på feltet i steg 3, sier panelet at resten settes i steg 4.

10. **Steg 4 regnes ikke som ferdig** når et varmet felt mangler flateeffekt eller kabel. Et tak med bare ett ferdig regnet felt, uten renne, regnes som ferdig. En snøfanger som ikke varmes, holder ikke steget åpent, men heller ikke ferdig alene: da står det «Varm feltet mot takkanten, eller legg et rennestrekk». Er det riktig?

11. **Snøfangeren kan ikke flyttes etter at den er lagt**, verken langs kanten eller i lengde. Det må gjøres med slett og tegn på nytt, slik det er for rennestrekk. Avstanden fra kanten kan rettes. Overlapp på samme kant avvises, siden samme felt ellers ville blitt telt to ganger.

12. **Etikettene.** Snøfangerens etikett står innenfor linja, mens rennas står utenfor kanten. Står en boks eller et nedløp midt på kanten, flytter etiketten seg sidelengs. Målt ved tre zoomnivåer på 25 m-bygget med tre nedløp og én boks: ingen overlapp. Takvindu og hindringer er ikke med i den vurderingen, så en løs hindring rett innenfor snøfangeren kan fortsatt dekke etiketten.

13. **PDF og materialliste.** Snøfangeren står ikke i noen materialliste, og jeg har ikke testet hvordan den ser ut i PDF. Prompten ba ikke om noen av delene. Skal snøfanger (antall meter) inn i materiallista?

14. **Avstanden kan ikke settes så stor at linja havner utenfor taket** (midtpunktet sjekkes). Det avvises med en melding, ikke bare en advarsel, siden linja da ikke betyr noe. Grensene er 0,05–20 m.
