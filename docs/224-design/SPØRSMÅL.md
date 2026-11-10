# 224 · Inter-skrift og skjul-knapp på venstrepanelet — spørsmål til Kenneth

Valgene er tatt så løpet kunne gå videre. Svar når du har tid; ingenting av dette stopper 225.

1. **Tegningen står stille når panelet skjules.** Prompten sa både «tegningen skal ikke hoppe» og «samme verdenspunkt
   skal stå midt på skjermen». Valgt: hvert skjermpunkt beholder sin verdenskoordinat — lerretet vokser mot venstre med
   Δ px, og `panX` flyttes Δ/2 (i cm), så rommene står nøyaktig der de sto i vinduet (målt: 0 cm avvik, dpr 1 og 2).
   *Alternativ:* la `panX` stå, så verdenspunktet midt på *lerretet* står fast — da glir tegningen Δ/2 mot venstre.
   Dra-håndtaket kompenserer ikke (som før): drar du panelet bredere, glir tegningen.

2. **Arbeidsflyt-panelet (rom-arbeidsflyt) når panelet er lagt ned.** Det dekker normalt hele sidepanelet. Valgt: lagt ned
   dokkes det RETT TIL HØYRE for 28 px-stripa, med bredden panelet hadde, så «›»-knappen alltid er synlig
   (`docs/224/etter-prosjekt-skjult-arbeidsflyt.png`). Mens arbeidsflyt-panelet er åpent over et ÅPENT sidepanel dekker
   det «‹»-knappen (Ferdig-knappen sitter øverst til høyre der) — man skjuler panelet etter at arbeidsflyten er ferdig.
   *Alternativ:* legge «‹» over arbeidsflyt-panelet med egen plass i headeren.

3. **Tall på lerretet har proporsjonale sifre.** Space Grotesk hadde like brede sifre; Inter har det bare med OpenType-
   funksjonen `tnum`, som Canvas 2D ikke kan slå på (`ctx.font` har ingen `font-feature-settings`). I HTML gjør
   `font-variant-numeric:tabular-nums` jobben (sidepanel, statuslinje, ctxbar, tabeller). På lerretet gjelder det bare
   tekst som står i kolonner — trappetabellen (186) og materiallista i PDF-oversikten. Alternativ: laste Inter fra egen
   `@font-face` med `font-feature-settings:"tnum"` (virker i Safari/Firefox, ikke i Chrome), eller bruke «Inter Tight»/en
   font med tabulære sifre som standard.

4. **Inline-størrelser 10–11,5 px → 12 px (756 steder) og CSS 87 steder.** Prompten sa 12 px for all lesetekst; jeg tok alle
   inline-stiler i HTML-malene under ett (unntatt 8 px-piler i Liste-visningen og en SVG-etikett i viewBox-enheter).
   Overskrifter med store bokstaver → minst 11 px. Ikonklasser (▸, ○, ⚠ i sidepanelet) er unntatt. Ingen regresjonstest
   måler disse, så kontrollen er visuell (skjermbildene). Rominfo-blokka i sidepanelet brekker «Bredde: 400 cm» over to
   linjer ved 180 px panel — det gjorde den også før (`foer-prosjekt.png`).

5. **IBM Plex Mono beholdt** i: `.wbw-inp` (vegg-for-vegg), kalibrerings- og målestokkfeltene, trappens tallfelt,
   inline-redigering av lengder (`inp.style.cssText`), `kbd` i hurtigtast-panelet, debug-overlayet og artikkelnummer-
   cellene i admin/Visma (generisk `monospace`, ikke Plex). Alt annet som viste tall i Plex Mono (areal, lengder i
   sidepanelet, zoom-merket, statuslinja, ctxbar-verdier) er nå Inter med like brede sifre.

6. **`_savePrefs` lagrer `sidebarWidth: 0`** når den kalles mens `#app` er skjult (offsetWidth = 0) — f.eks. fra
   regresjonstester på innloggingsskjermen. Neste lasting klemmer det til 180 px, så sidepanelet blir smalt. Fantes før
   224 (HEAD gjør det samme); ikke rettet (kun design). Én linje å rette: hopp over lagring når bredden er 0.

7. **Port 4010 er fortsatt Python-serveren** (404); brukte 4013 fra 226. Alle skript i `docs/224/probe/` peker dit.

8. **Rom-lista i sidepanelet:** arealet («12.00 m²») og ikonene overlapper ved 180–272 px panel — både før og etter
   (`foer-prosjekt.png`/`etter-prosjekt.png`). Bør 225 ta det med under «flater»?
