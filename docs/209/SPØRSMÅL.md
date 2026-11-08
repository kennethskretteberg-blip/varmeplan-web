# 209 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **«Finn like» er tynn uten takflater.** Taket har ingen flater (`roof.planes` er tom), og vi har ikke flyfoto.
   Appen kan derfor ikke *se* et takvindu. «Like steder» kommer bare fra omrisset:
   - speiling over midtlinjene og over mønet, og dreiing 180° — men bare når omrisset faktisk tåler det (sjekket
     innen 25 cm, ikke antatt);
   - «neste i raden»: står det to like vinduer, foreslås ett steg videre hver vei.

   På et rektangulært saltak gir ett vindu tre forslag. På et L-formet hus gir det ingenting («Fant ingen like»).
   Er dette nyttig nok, eller skal knappen vente til `/roof/model?level=full` gir takflater? Mitt valg: beholde den,
   fordi den aldri plasserer noe selv.

2. **«Høyde» på takvinduet** er målet *i plan*, på tvers av nærmeste takkant (bredden ligger langs kanten).
   På et skrått tak er vinduet lengre langs taket enn i plan. Skal feltet være lengden *langs taket* (og tegningen
   krympes med helningen)? Vi kjenner ikke helningen per flate ennå, så jeg har latt tallet stå som plan-mål.

3. **Standardmål.** Et nytt takvindu får 0,78 × 1,18 m (et vanlig takvindu), en hindring 0,5 × 0,5 m. Begge er
   merket `ESTIMATE` og står i oransje «standardmål — rett til målt» til de rettes. Vil du heller ha tomme felt?

4. **«Kabel må forbi»: tillegg per løp.** Tallet du skriver gjelder ett løp og ganges med løpene på delstrekket
   (0,6 m × 2 løp = 1,20 m). Det blir en egen rad «⤳ h2» i Kabelmeter. Er det riktig, eller skal tallet være
   totalen? Appen foreslår ikke noe tall — feltet står tomt med en melding til du skriver det.

5. **Rekkefølgen fra startpunktet.** Fra startpunktet går montøren først den **korteste grenen** langs renna,
   og så den lengste. Ved et innløp kommer nedløpet før delstrekket videre. Start nede i n3 på IceFix-bygget gir
   n3 → r1.4 → r1.3 → n2 → r1.2 → n1 → r1.1. Andre rennestrekk og gradrenner står etter, i tegnerekkefølge.
   Er det slik montøren faktisk går?

6. **Startpunktet og tilkoblingen i 208.** Tilbehøret (208) finner fortsatt sin egen start, for eksempel
   «start: bunnen av n1», uavhengig av startpunktet du har satt. De to kan altså vise forskjellige steder. Skal
   startpunktet bestemme hvor tilkoblingen står, der det er lovlig (en kabelende)? Jeg har ikke koblet dem, fordi
   prompten sier at startpunktet bare styrer rekkefølgen.

7. **Kursens farge.** Taket har ingen kurser ennå (T8), så hvert rennestrekk er én kurs med sin egen farge
   (r1 = samme farge som før, r2 lilla, r3 oransje …). Nedløpene tegnes nå i kursens farge. Med ett strekk betyr
   det at nedløpssymbolet er litt lysere enn før (`#0891b2` i stedet for `#0e7490`). Løse takvinduer og
   hindringer er grå, fordi de ikke hører til noen kurs.

8. **Sletting.** Slettes rennestrekket, blir hindringen på det stående som en løs hindring og mister «kabel må
   forbi». Slettes nedløpet eller strekket med startpunktet, forsvinner startpunktet. Angre henter alt tilbake.
   Er det riktig, eller skal hindringen gå med strekket som nedløpene gjør?

9. **SNOW_GUARD og ROOF_DRAIN.** Prompten sier at de «finnes i §6.3». De står i planen, men ikke i koden. Jeg har
   ikke laget dem. Skal snøfanger og sluk komme i 210 eller senere?

   **Svar (215, 08.11.2026):** Begge er bygd. `ROOF_DRAIN` kom med 212 (sluk på flatt tak, i `t.flat`). `SNOW_GUARD` kom med 215:
   «+ Snøfanger» på en takfot, standard 0,50 m inn på taket (Kenneths regel 08.11.2026, ikke fra datablad). Snøfangeren får ingen
   kabel selv. Den er grensen for et valgfritt varmet felt mellom takkant og snøfanger, regnet med 212s motor.

10. **Etiketten til en hindring på renna** kan dekke delstrekkets lengde-etikett når hindringen står midt på
    delstrekket (se `tegning-start-n3.png`, h2 over «10,5 ×2»). Jeg har ikke flyttet etikettene. Si fra hvis det
    plager.
