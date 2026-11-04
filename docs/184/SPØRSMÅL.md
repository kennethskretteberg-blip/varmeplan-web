# 184 · Spørsmål

1. **Hvilken VK Hovedterrasse?** Skjermbildet ditt (8 × 431,2, 4 × 579,2–687,2 ved 19,4) passer bare med
   **inntrinn 31 cm**: opptrinn og nese 2, maks CC 10, gulv 2 og 1 × 60 m. Med 46 cm (176-eksemplet) får hesteskoen
   6 strenger. Stemmer 31, eller har trappa andre avstander foran/bak enn 2?

   > **Kenneths svar (04.11.2026):** 31 cm var bare til testen. Ingen endring.

2. **«For lang» eller «for kort»?** Du skrev at et sett som ikke går opp i valg 2 skal vise «for lang kabel». Men når
   hesteskoen må trekkes forbi armen, er kabelen for **kort**, fordi større margin gir kortere strenger. Appen sier nå
   «Kablene er 3.6 m for korte — hesteskoen måtte fått 116.6 cm … forbi hjørnet (armen er 72 cm)», og legger
   kabelen på gulvet med udekkede løp stiplet rødt, som i dag. Er det riktig? Et sett som er for langt, er for langt
   også i valg 1, fordi behovet ved gulvet er det samme i begge valg.

   > **Kenneths svar (04.11.2026):** Riktig slik det er. Ingen endring.

3. **Hengelåsen i valg 2.** Låst avstand gjelder hesteskoen, og toppflaten bruker gulvet. Med hengelåsen på skrev
   feltet før **både** låst verdi og gulv. Da ville toppflaten fulgt med (låst 10 → toppflate 10). I valg 2 skriver
   feltet nå bare den låste verdien. For å endre gulvet må du låse opp, skrive gulvet og låse igjen (låsen tar da
   hesteskoens nåværende margin). Er det slik du vil ha det, eller bør toppflatens avstand ha et eget felt i valg 2?

   > **Kenneths svar (04.11.2026):** Greit slik det er. Ingen endring.

4. **Produktets minimum.** Du skrev «gulvet, eller produktets minimum hvis det er høyere». Trappemotoren har ingen
   produktminimum for sidemargin i dag, og InSnow har `min_wall_margin_mm = 0`. Toppflaten bruker derfor bare
   gulvet. Skal trappemotoren begynne å lese produktets minimum (i begge valg)?

   > **Kenneths svar (04.11.2026):** Ikke nå. Ingen endring.

5. **Hjørnetaket i valg 1.** Armtaket (`Di + opptrinnsavstand`, VK = 72) gjelder bare i valg 2, fordi valg 1 ikke
   skulle endres. Men i valg 1 er 75 %-taket for VK 76,25, altså over armen. En stor nok løst margin kan derfor i
   prinsippet trekke strengene forbi hjørnet også i valg 1. Skal armtaket gjelde der også?

   > **Kenneths svar (04.11.2026):** Armtaket skal gjelde i begge valg. Strenger skal aldri gå forbi hesteskoens hjørne, heller ikke i «Lik avstand». → Gjort i 185.

6. **Gult merke og +15-taket.** I valg 2 ligger hesteskoens margin med vilje langt over gulvet. Derfor:
   - Det frie flerkabelsøket bruker ikke «gulv + 15»-taket i valg 2, bare 75 % og armen.
   - Én-kabel-kortet kan få det gule merket «Stor kantavstand» (over gulv + 15).

   Skal merket skjules i valg 2, eller måles mot noe annet?

   > **Kenneths svar (04.11.2026):** Merket skjules i «Fyll toppflaten», der stor avstand er meningen. I valg 1 er det som før. → Gjort i 185.

7. **Låst avstand forbi armen.** En låst verdi brukes nøyaktig (Regel 22). Låser du hesteskoen på for eksempel 80 cm
   i valg 2, går strengene forbi hjørnet. Appen stopper det ikke i dag, verken i valg 1 eller 2. Skal feltet stoppe på
   armen for hestesko?

   > **Kenneths svar (04.11.2026):** Ja, låst avstand stopper ved hjørnet for hestesko, i begge valg. `max` = armtaket; en verdi over gir rødt felt og «Maks X cm, ellers går strengene forbi hjørnet», og brukes ikke. Gamle trapper åpnes, men viser rødt til verdien er rettet. → Gjort i 185.

8. **Bytte med valgt forslag som ikke går opp.** Bytter du valg, og forslagets kabelsett ikke går opp i det nye
   valget, blir det et manuelt sett med rød melding. «Tilbakestill» tar deg tilbake til forslaget. Vil du heller at
   appen lager nye forslag automatisk ved bytte?

   > **Kenneths svar (04.11.2026):** Behold dagens oppførsel. Ingen endring.
