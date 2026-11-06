# 198 · Spørsmål til Kenneth

Ingenting her blokkerer. Alt er løst på en måte som kan snus med små endringer.

1. **Bedrifter uten Visma.** Feltet ved statusendring vises for alle bedrifter på egne prosjekter, også ved
   «Vi fikk jobben» (som bare installatører har), med teksten «(Visma)». Det grå hintet «+ Tilbudsnr.» i
   lista vises bare for bedrifter med Visma-format satt. Skal elektrikere uten Visma heller slippe feltet
   helt, eller få det som «Tilbudsnr.» / «Ordrenr.» uten «(Visma)»?

2. **Delte prosjekter.** Elektrikeren ser ikke Cenikas tilbudsnr. på et prosjekt som er delt med ham, og kan
   ikke legge inn egne numre der (statusen hans ligger i `project_org_status`, numrene på Cenikas rad). Vil du
   at han skal kunne *se* Cenikas tilbudsnr. (nyttig når han ringer om tilbudet)? Skal han ha egne numre, må
   de inn i `project_org_status` — det er en egen, liten jobb.

3. **PDF og Visma-eksport (forslag, ikke gjort).** Tilbudsnr. kunne stått på PDF-forsiden («Tilbud 104455»),
   og ordrenr. kunne fulgt med i GBAO10-fila / «Kopier til Visma» hvis Visma har et felt for det. Ønsket?

4. **Vunnet uten tilbudsnr.** Ved Vunnet vises bare ordrenr.-feltet, som bestilt. Går et prosjekt rett fra
   Under arbeid til Vunnet, kan tilbudsnr. legges inn ved å klikke på linja i lista. Skal Vunnet-dialogen
   vise begge feltene når tilbudsnr. mangler?

5. **Signert garantibevis** setter Vunnet automatisk (dokumentasjonsflyten). Der kommer ingen nummerdialog
   — den som signerer står ofte på byggeplassen. I lista står da «+ Ordrenr.» på raden. Greit?

6. **Angre og tilbake til Under arbeid.** Numrene blir stående når status angres eller settes tilbake.
   Jeg tenker det er riktig (nummeret finnes fortsatt i Visma), men si fra om de heller skal tømmes.

7. **Samme nummer på to prosjekter.** Appen varsler ikke. Det kan være riktig (revisjon, kopi av prosjekt),
   men et varsel «nummeret står også på #0378» er lett å legge til.

8. **Format.** Fritekst, maks 30 tegn. Har Visma Global et fast format (bare siffer, fast lengde)? Da kan
   feltet strammes inn og tastefeil fanges.

9. **Mobilappen.** Jeg fikk ikke lese `~/Code/varmeplan-app` i denne økta, så STEG 0.5 er ikke målt.
   Vil du at jeg måler det i en økt som har tilgang til mappa? Og skal appen vise numrene?

10. **Filter.** «Vis bare tilbud uten tilbudsnr.» / «vunnet uten ordrenr.» som valg i statusfilteret ville
    gjort oppfølgingen enda enklere. Ønsket?
