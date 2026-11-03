# 182 · Spørsmål til Kenneth

1. **Egen kolonne for sider?** Står «Inntrinn sider» på egen verdi, holder sidene den verdien på alle trinn, og bare
   fronten følger listen. Det er slik prompten sa det. Vil du heller ha en kolonne til i listen, «sider» per trinn?
   Motoren tåler det allerede, siden `hsWidths` er per trinn.
2. **Gyldighet også når valget er av.** Sjekken «ingen brukbar dybde» gjelder alle hesteskotrinn, ikke bare listen.
   Har felles inntrinn ≤ opptrinn + nese (for eksempel 3 cm med 2 + 2), blir feltet rødt, og trappa kan ikke plasseres.
   Før 182 kunne den plasseres, og motoren la da én enkelt streng (N = 1) på trinnet. Grensen 10–200 cm gjelder bare listefeltene. Er det greit?
3. **En overstyrt rad som blir lik felles verdi.** Skriver du felles verdi i en rad, følger raden felles igjen. Merket
   «endret» forsvinner. Men står trinn 5 på 35 og du **endrer felles inntrinn til 35**, blir trinn 5 stående som
   overstyrt («endret») og følger ikke neste endring av felles inntrinn. Skal den heller slippes automatisk?
4. **Rader utenfor antall trinn.** I samme dialog kommer overstyringene tilbake hvis du går 10 → 8 → 10. Lagrer du
   med 8 trinn, glemmes overstyringene på trinn 9–10. Skal de huskes også etter lagring?
5. **▲/▼ stopper på 1 og 200 cm.** Felt under 10 cm kan bare skrives inn (de blir røde). Er det riktig, eller skal ▼
   stoppe på 10?
6. **Forhåndsvisningen med mange trinn.** «foran 28» under ytterste trinn kolliderer med trinnummeret «11» når det er
   10 trinn. Det gjorde det også før 182. Skal tallene i forhåndsvisningen tynnes ut ved mange trinn?
