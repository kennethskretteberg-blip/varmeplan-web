# 212 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Utelukker metode 2 (gradrenner) og metode 3 (varme på hele taket) hverandre, eller kan de kombineres?**

   Cowork antar at de utelukker hverandre: et varmefelt over hele taket dekker gradrennene. Det er ikke bekreftet av deg.

   Mitt valg: **de utelukker hverandre.** Panelet har tre oppsett, og sluk er alltid med:
   - «1 · Sluk»
   - «1 + 2 · Sluk + gradrenner»
   - «1 + 3 · Sluk + varme på taket»

   Hvert oppsett viser kabelmeter før du velger. Er bare én av 2 og 3 tegnet, velges den av seg selv. Er begge tegnet, regner appen ingen sum før du har valgt, og sier hvorfor. Ingenting slettes: objekter utenfor valgt oppsett er bare nedtonet.

   Kan de kombineres, er det ett nytt oppsett «1 + 2 + 3». Men da må appen vite om et varmefelt og en gradrenne overlapper, ellers telles samme areal to ganger. Gjelder det bare et varmefelt over *deler* av taket (ikke hele)?

2. **Hvilket flateeffekt-tak gjelder for tak?** 159-advarselen sammenligner med modulens tak (`_moduleContext(...).wm2Max`). Tak-modulen har ikke noe eget, og `_moduleContext('roof')` gir innendørs-tallene (300, standard 130), fordi bare `snow` regnes som utendørs der.

   Mitt valg: **utendørs-taket, 450 W/m²**, lest fra `_moduleContext('snow')`. `_moduleContext` er ikke endret, fordi det ville påvirket resten av tak-delen. Er 450 riktig for tak? Eller skal Tak-modulen få sitt eget tall (T1)?

3. **Hvilke kabler skal kunne velges?** Listen er den samme som snømodulen bruker: aktive kabler i kategorier som er merket `outdoor`. Kategori 2 «Varmekabel» (InFloor 10T og 17T) er merket både `indoor` og `outdoor` i katalogen, så de kommer med.

   Mitt valg: **katalogen avgjør**, men rene utendørskategorier (InSnow) står først. InSnow 30T og InSnow 30T 400V er to valg, fordi de er to familier i katalogen. Skal InFloor bort fra tak (og fra snø)? I så fall er det `available_contexts` på kategori 2 som bør rettes, ikke koden.

4. **Når dekket bredde ÷ c/c ikke er et helt tall.** 65 cm med c/c 10 cm gir 6,5 løp. Formelen i prompten (`areal × W/m² ÷ W/m`) gir da kabelmeter for 6,5 løp, og det kan ikke legges.

   Mitt valg: **formelen gjelder**, og panelet varsler: «6,50 løp er ikke et helt tall … Juster bredden eller flateeffekten.» Alternativet er å runde til helt antall løp, med kabelmeter = løp × lengde og en faktisk W/m² som avviker litt fra den du skrev. Hva vil du ha?

5. **«Ned i røret» — én lengde eller per løp?** Feltet er det du skriver: kabelmeter i røret for det sluket, tomt som standard. Går kabelen ned og opp igjen (sløyfe), er det din lengde × 2 i virkeligheten.

   Mitt valg: **feltet er total kabel i røret**, ikke rørdybden. Skal feltet heller være dybden til frostfritt nivå, med antall løp ved siden av (som nedløpene i 207)?

6. **Ringene rundt sluket.** Prompten sier én radius per sluk (standard 0,40 m), og testen regner 2 × 2π × 0,40 = 5,03 m per sluk. Filmen viser to ringer med ulik radius, 0,33 og 0,42 m. Det gir 2π × (0,33 + 0,42) = 4,71 m, som er tallet «≈ 4,7 m per sluk» i prompten.

   Mitt valg: **som prompten**, med samme radius på alle ringene (5,03 m per sluk, 45,24 for ni). Skal hver ring ha sin egen radius, med standard 0,33 / 0,42?

7. **Én kabel per tak, eller per objekt?** Kabelen velges én gang for det flate taket og gjelder alle gradrenner og varmefelt. Mitt valg: **én per tak.** Skal gradrennene kunne ha en annen kabel enn varmefeltet?

8. **Gradrennas lengde i plan.** Fallet mot slukene (filmen: 0,18 m reisning) er ikke med. Over 6,67 m utgjør det 0,02 %. Mitt valg: **plan**, og panelet sier det. Skal fallet med?

9. **Skal sluk og varmefelt kunne flyttes ved å dra?** I dag kan de velges, endres i panelet og slettes (✕). Flytting skjer ved å slette og sette på nytt, som for takvinduer i 209. Mitt valg: **ikke bygget.** Skal det med i en senere prompt?

10. **PDF og materialliste.** Det flate taket er med i PDF-en der PDF-en leser lerretet. Det er ikke med i materiallisten eller tilbudet, fordi produktet ikke har kurslengder (T8). Antall kabler kan altså ikke regnes. Mitt valg: **ikke bygget.** Når T8 er avklart, er det `t.flat`-summen som skal inn.

## Kenneth må gjøre

- Ingenting før du har svart. Ingen SQL, ingen deploy.
