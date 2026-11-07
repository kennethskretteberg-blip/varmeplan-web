# 201 · Spørsmål

1. **Store bygg og tett bebyggelse.** `/roof/locate` leter etter bygningspunkter innen 40 m fra klikket og gir
   bare omriss for de 5 nærmeste. Klikker man midt i et stort bygg (en lagerhall over ~80 m), kan bygningspunktet
   ligge mer enn 40 m unna. I et tett sentrum kan bygget man står i, være nr. 6 eller lenger ut. I begge tilfeller
   blir svaret «Fant ingen bygning her», selv om det står et bygg der. Ingen av delene skjedde i Hønefoss sentrum.
   Bør jeg i så fall gjøre et nytt kall fra klienten (for eksempel mot et hjørne), eller bør tjenesten få en egen
   «bygg i dette punktet»-spørring? Det siste er en endring i `varmeplan-roof`, så den har jeg ikke gjort.

2. **Bare det klikkede bygget, eller alle fem?** Tjenesten sender omriss for opptil 5 bygg per kall. Jeg legger
   bare inn det du klikket i, som du sa: «bare for det bygget». Skal de fire naboene også inn i samme slengen,
   så man får snapping mot dem uten å klikke på hvert enkelt? Det koster ingenting ekstra i nettkall, men
   lista i «Bytt bygg» blir lengre.

3. **«Bytt bygg» viser bare 6.** ⋯-menyen tar de 6 første kandidatene med omriss, i lagringsrekkefølge.
   Bygg du henter etter de 5 fra adressesøket, havner bak og blir ikke synlige der. Skal hentede bygg vises
   først, eller skal grensen opp?

4. **Avrunde omrissene til 1 mm?** En kandidat veier 600–1 300 B, og omtrent en tredjedel av det er flyttall-støy
   (`334813.1999999983`). Avrundet til 1 mm går en enebolig fra 600 til 400 B. Det gjelder også omrissene fra
   adressesøket. Jeg har ikke endret det, fordi da ville lagrede prosjekter fått litt andre tall enn nye.

5. **Etter et bom står modusen på.** Etter et treff slår modusen seg av, slik prompten sier. Etter «Fant ingen
   bygning her» (og etter en feil) står den på, så man kan prøve igjen uten å trykke på knappen. Er det riktig,
   eller skal den alltid slå seg av etter ett klikk?

6. **Hentede bygg ser ut som de andre kandidatene.** De tegnes med samme tynne grå strek. Oppå et kart som
   allerede tegner bygningene, er den vanskelig å se (se `live-4km.png`). Kvitteringen kommer som en toast.
   Ønsker du en tydeligere markering, i hvert fall like etter hentingen?

7. **Berøring (mobil/nettbrett)** er ikke koblet til modusen. Krokene sitter på musehendelsene. Hvis
   nettleseren lager museklikk av et trykk, virker det, men jeg har ikke testet det. Er snø-modulen i bruk på
   nettbrett ute på befaring?
