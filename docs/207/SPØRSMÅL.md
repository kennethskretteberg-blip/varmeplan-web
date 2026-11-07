# 207 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Standard er to løp i renna, på hvert delstrekk. Er det riktig?** Du svarte «ingen preferanse» på
   om det alltid er to. Valget er derfor mitt (Cowork sitt), ikke ditt. Jeg valgte to fordi du ville
   ha metode 2 som standard for nedløpene (07.11), og fordi to løp i renna er felles for begge
   metodene i filmen. Standarden kan endres per delstrekk, og strekket har hurtigvalgene «Alle
   delstrekk 1 løp» og «Alle delstrekk 2 løp». Skal standarden heller være ett løp, eller skal den
   følge nedløpene?

   > **Kenneths svar (07.11.2026, prompt 213):** Behold to løp som standard, på hvert delstrekk. Begge metodene i filmen har to løp i renna, og standarden beskytter mot å regne for lite — den farlige retningen i et tilbud. Hurtigvalgene og endring per delstrekk blir som de er.

2. **Nedløp med to løp: 5 cm regnes to ganger.** Prompten gir formelen
   `(above_ground_m + 0,05) × løp`, og den er bygget slik. Det gir 2 × 10,05 = 20,10 m. Men to løp i
   et nedløp er vel én sløyfe: kabelen går ned, snur i bunnen og går opp igjen. Da stikker den bare
   ut én gang, og det riktige er 2 × 10 + 0,05 = 20,05 m. Forskjellen er 5 cm per nedløp, altså
   0,15 m på filmens bygg (110,30 → 110,15). Under bakken er det ingen forskjell, fordi det ikke er
   noe tillegg der. Skal jeg endre til «høyde × løp + 0,05»?

   > **Kenneths svar (07.11.2026, prompt 213):** Du har rett, og formelen i 206 var feil. Kabelen kommer ut av nedløpet én gang («ut av bendet, snur og går opp igjen»). To løp i et nedløp er én sløyfe. Tillegget på 5 cm hører til nedløpet, ikke til løpet: slutter over bakken = `above_ground_m × løp + 0,05`; under bakken = `(above_ground_m + below_ground_m) × løp` (ingen 0,05). → **Bygget i 213.**

3. **«Standard» følger ikke en ny standard.** Hvert objekt lagrer `runs` og `runs_src: 'standard' |
   'user'`. Hvis standarden endres senere (svaret på 1), beholder objekter som allerede er lagt,
   tallet sitt. Merket `standard` gjør det mulig å la dem følge, slik nedløpene følger gesimsen
   (206). Det er ikke bygget. Skal de følge?

   > **Kenneths svar (07.11.2026, prompt 213):** Nei, objekter skal ikke følge en endret standard. Et objekt som er lagt, beholder tallet sitt. Tall som endrer seg stille mellom to åpninger er hvordan et tilbud blir feil. Behold `runs_src`, men ikke bygg automatikk på den. (Nedløpets gesimshøyde er noe annet: der følger et *målt* tall som blir rettet, ikke en innstilling som endres.)

4. **Gradrenna har to løp som standard (v3 §3), men ingen posisjon.** For renna lagres hvor løpene
   ligger: bunnen (90°) og opp mot hengkanten (40°). Ett løp ligger i bunnen. For gradrenna har jeg
   ingen profil og har ikke lagret noen posisjon. Trenger snittet i 210 det?

   > **Kenneths svar (07.11.2026, prompt 213):** Gradrenna trenger ingen posisjon nå. Snittet i 210 går gjennom takfoten, ikke gjennom en gradrenne.

5. **Ett løp i renna ligger i bunnen.** Filmen viser bare to løp. Midt-posisjonen (65°) er lagret
   som konstant, men den brukes ikke. Er bunnen riktig for ett løp?

   > **Kenneths svar (07.11.2026, prompt 213):** Ja, ett løp ligger i bunnen. Vannet renner der, og isen legger seg der først.

6. **Appen sjekker ikke at løpene henger sammen til én kabel.** Din rute fra 07.11 blir
   r1.1 = 2, r1.2 = 1, r1.3 = 1, r1.4 = 2, n1 = 1, n2 = 2, n3 = 1 (se rapporten). Men appen godtar
   også kombinasjoner som ikke kan legges med én kabel uten Y-skjøt. Kabelmeter er bare summen. En
   sjekk av at løpene henger sammen hører naturlig til koblingsboksene i 208. Skal den med der?

   > **Kenneths svar (07.11.2026, prompt 213):** Ja — sjekken av at løpene henger sammen hører til 208, sammen med koblingsboksene. Den er tatt inn i prompt 208. Ikke bygg den her.

7. **Endene er ikke med.** Der kabelen snur i enden av renna (to løp), og overgangen fra renne til
   nedløp (206 spm. 4), regnes som null. Med rette lengder er det slik prompten vil ha det. Skal det
   inn et tillegg per snu og per overgang når produktet er valgt?

   > **Kenneths svar (07.11.2026, prompt 213):** Senere, sammen med produktet. Svingen i enden av renna og overgangen renne–nedløp regnes fortsatt som null. Bøyeradien avhenger av kabelen (T1). Men panelet skal si det. → **Bygget i 213:** linja «Kabelmeter er rette lengder. Svinger i renneenden og overgangen renne–nedløp er ikke med, så tallet er et minimum.» under summen.

8. **Tegningen viser løp som «×2» og «×1»** ved hvert delstrekk, nedløp og gradrenne, for eksempel
   «10,5 ×1» og «10,0 m ×2». Er det forståelig, eller vil du ha «2 løp»? «2 løp» tar mer plass,
   og på et helt hus er delstrekkene korte på skjermen.

   > **Kenneths svar (07.11.2026, prompt 213):** Behold «×2». Panelet skriver det ut i tabellen.

9. **Kurslengdegrensen er én tom parameter for hele appen** (`TAK_CIRCUIT_LIMIT_M = null`). Panelet
   sier «Kurslengde: grense ikke satt» og «Produkt ikke valgt. Kabelmeter er geometri.». Når et
   produkt velges (T1/T8), er planen at grensen kommer fra produktet og ikke fra et tall i koden. Det
   finnes ingen oppdeling i kurser. Et tak er ikke én kurs, så jeg har ikke regnet «antall kurser».
   Stemmer det?

   > **Kenneths svar (07.11.2026, prompt 213):** Stemmer. Et tak er ikke én kurs, og «antall kurser» skal ikke regnes før T1 og T8 er avklart.

10. **Hurtigvalgene merker alle delstrekk som «valgt».** Det finnes ingen knapp for «tilbake til
    standard». Trengs den?

    > **Kenneths svar (07.11.2026, prompt 213):** Ingen «tilbake til standard»-knapp. «Nullstill» dekker behovet.
