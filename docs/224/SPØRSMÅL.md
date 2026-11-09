# 224 · Spørsmål til Kenneth

1. **Prosjekter lagret før 224 får ingen advarsel.** Tittelen blir riktig med en gang («Omriss avledet av
   høydedata»), fordi kilde og tillit alltid er lagret. Tjenestens notat ble derimot aldri lagret, så et gammelt
   prosjekt med tillit 0,3 viser ikke «sjekk omrisset — kan inneholde vegetasjon». Jeg har ikke skrevet en reservetekst,
   slik prompten sa. Bygget må hentes på nytt for å få notatet. Holder det?

2. **Eksempelteksten i prompten mot regelen.** Eksempelet viser «Kontroller omrisset mot kartet før du legger
   renner», men reglene sier «bruk tjenestens notat» og «ikke skriv en egen advarselstekst». Jeg fulgte reglene.
   Kortet viser tjenestens tekst ordrett, også med liten forbokstav: «⚠ sjekk omrisset — kan inneholde vegetasjon».
   Vil du ha en annen ordlyd, bør den endres i `varmeplan-roof`.

3. **Kartet og kortet har ulik grense.** Den gule ⚠ på kartet (fra før, `lavTillit`) vises ved tillit ≤ 0,5.
   Kortets advarsel vises bare under 0,5, altså ved 0,3, slik prompten ba om. Et omriss med 0,5 får dermed ⚠ på
   kartet, men ingen advarsel på kortet. Skal de to være like?

4. **Sammenslått steg 1 viser adressen, ikke omrisstypen.** Når steg 1 er lukket, står adressen der om den finnes,
   slik som før. Typen ses først når steget åpnes. Skal den stå i oppsummeringen også?

5. **0,3 betyr ikke alltid vegetasjon.** Tjenesten setter 0,3 når omrisset er over arealgrensen eller har mange eller få
   hjørner. Joseph Kellers vei 27 er en industribygning på 4 189 m² med 182 hjørner. Notatet nevner bare
   vegetasjon, så teksten kan villede på store bygg. Det er en sak for `varmeplan-roof`, om du vil ha den.
