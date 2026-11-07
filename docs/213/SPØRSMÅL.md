# 213 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Hvor skal 0,05 stå i tabellen?** Lengde-kolonnen for et nedløp viser nå nedløpets lengde per løp
   og tillegget for seg: «10,00+0,05 | 2 | 20,05». Da går regnestykket opp når man leser raden
   (lengde × løp + tillegg). Før stod det «10,05 | 2 | 20,10». Er det lesbart, eller vil du heller ha
   «10,00 | 2 | 20,05» og bare forklaringen under tabellen?

2. **Forhåndsvisningen viser nå to desimaler** («+20,05 m kabel (×2) → …», og «+50,00» for et strekk).
   Før viste den én desimal («+20,1»). Med én desimal blir 20,05 til «20,1», og da viser
   forhåndsvisningen et annet tall enn tabellen etterpå. Prompten krever samme tall, så jeg valgte to
   desimaler for begge. Greit, eller vil du ha én desimal i tegningen og ta avviket?

3. **206-feltet `cable_m` betyr nå «kabel med ett løp».** Det har samme verdi som før (10,05 eller
   11,00), så ingen lagrede prosjekter og ingen 206-tester endres. Men det er ikke lenger «per løp»
   ganget opp: `cable_total_m` regnes direkte fra formelen. Ingen kode leser `cable_m` til å gange i
   dag. Skal feltet bort på sikt, eller beholdes det for 208 (koblingsbokser)?

4. **Et nedløp som ikke er koblet til en kabel med to løp.** Med formelen regnes 0,05 også for et
   nedløp med 1 løp der kabelen starter nede (din rute, n1). Der stikker kabelen ut i bunnen, så det
   stemmer. Men om kabelen starter i en koblingsboks på veggen ved siden av nedløpet (208), kan halen
   være lengre enn 5 cm. Skal 208 eie halen da, slik at nedløpet ikke regner den?
