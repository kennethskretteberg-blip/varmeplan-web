# 210 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **T9: Hva må snittet inneholde for at montøren kan jobbe etter det?** (v3 §9)

   Snittet har nå dette:
   - takflaten med vinkel og hengkanten;
   - renna Ø100 med kabelløpene der de ligger (bunn 90°, mot hengkant 40°);
   - nedløpet Ø80 med én eller to tråder;
   - avlasteren ved innløpet;
   - terrenget, strekningen under bakken og hvor kabelen slutter;
   - målene: takfot over terreng, nedløp over bakken, under bakken, 5 cm og 0,16 m til rennesenter;
   - en egen detalj av renneprofilen i større målestokk.

   Kan noe av dette mangle?
   - **Rennebredde/profil.** Det finnes bare halvrund Ø100. Boksrenne og andre størrelser finnes ikke.
   - **Nedløpsdiameter per nedløp.** Den er fast Ø80, uten noe felt.
   - **Festeavstand for klips.** Det står «avstand ikke satt». Jeg har ikke funnet på noe tall, fordi det venter på T1.
   - **Bend og utkast på nedløpet.** Nedløpet er tegnet rett ned.
   - **Rennekroker, takutstikk og kabeltype/produkt.**

   Mitt valg: bygge det over og ikke legge til felt før du sier hva som trengs.

2. **Er omrisset veggen eller takkanten?** Snittet bruker omrisset som én linje: «vegg/takkant». Rennesenteret står fast **0,16 m** ut fra den, slik filmen viser.
   - Et FKB-omriss er som regel veggen.
   - Et omriss avledet fra DOM1 er takkanten.
   - Takutstikket finnes ikke i dataene.

   Hengkanten er tegnet så den slutter over den indre halvdelen av renna. Det er bare tegning, og det står ikke noe mål på den. Mitt valg: 0,16 m som konstant (`TAK_SECTION_GUTTER_OUT_M`), ikke et felt. Skal det være et felt per rennestrekk?

3. **«Opp mot hengkanten»** har jeg tolket som rennas **innerside**: siden mot veggen, under takets hengkant. Det andre løpet ligger derfor 40° ned på veggsiden. Stemmer det med filmen?

4. **Hvor høyt står utløpet?** Modellen fra 206 har ingen egen høyde for utløpet. Nedløpets «over bakken» måles fra takfoten.
   - Over bakken regner snittet utløpet som gesims − nedløp. Med standardverdiene (nedløp = gesims) står utløpet på terrenget. Da havner 5 cm-halen under terrenglinja i tegningen.
   - Retter du nedløpet til 9,6 m, står utløpet 0,40 m over terreng, og det får et eget mål.

   Skal nedløpet ha et eget felt «utløp over terreng», for eksempel med 0,3 m som standard? Mitt valg: ikke legge til noe felt, siden kabelmeter (213) ikke endres av det.

5. **Takvinkelen.** Prosjektet hadde ingen vinkel før dette. Snittet bruker:
   1. flatt tak: 0°;
   2. vinkelen du skriver i snitt-kortet, som lagres som `surfaces[0].pitch_deg` med `USER_CONFIRMED`;
   3. ellers (møne − gesims) ÷ avstanden i plan til mønelinja, når mønet er merket (205). IceFix-bygget gir 2,887 / 5,00 m = 30,0°;
   4. ellers «ukjent». Da tegnes taket skjematisk, men det står ikke noe tall på det.

   Valmtak og flater med ulik vinkel får likevel én vinkel per flate. Er det riktig sted å lagre den? Mitt valg: én vinkel per takflate.

6. **Hvilket delstrekk vises ved et nedløp?** Ved et nedløp møtes to delstrekk. Profilen viser det som leder **inn** i nedløpet langs strekket. Har det andre delstrekket et annet antall løp, står det i notatene («På andre siden av nedløpet (r1.2): 2 løp»). Vil du heller ha to profiler side om side?

7. **Snittet i prosjekt-PDF-en.** Nå finnes knappen **«Snitt som PDF»**, som lager én liggende A4-side med det snittet som er valgt. Hoved-PDF-en (`exportPDF`) har ennå ingen tak-sider, og jeg har ikke rørt den. Skal snittene med der? I så fall: alle nedløp, eller de du velger? Mitt valg: vente til tak-delen får sin egen PDF-side (plan + kabelmeter + tilbehør + snitt).

8. **Brutt tegning.** En 10 m vegg og en renne på 10 cm får ikke plass i samme målestokk. Snittet bryter derfor høyden mellom takfoten, utløpet, terrenget og frostfritt nivå (bruddlinje med sikksakk). Lengdene står i målene, og notatet sier at tegningen ikke er i målestokk. Renna, nedløpet og kabelen er tegnet i riktig forhold til hverandre. Er det greit, eller vil du ha en liten skisse i målestokk ved siden av?

9. **Avlasteren** er tegnet i snittplanet: en vannrett del i renna, 90° bøy og en loddrett del ned i røret, med strips i hver ende. I virkeligheten ligger den vannrette delen *langs* renna, altså inn i papiret. Er symbolet forståelig?
