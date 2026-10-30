# 167 · Spørsmål til Kenneth

1. **Eksakt geometri.** Begge rommene er rekonstruert fra vegglengder (D2-100) og form (D1-102), ikke fra prosjektet. Lim gjerne inn `room.points` + hindringene for begge (eller del en kopi av «ringhusveien»), så byttes fixturene til ekte geometri (`_cableFixtures['ringhus-d2100'/'ringhus-d1102']`).

2. **D2-100 fungerer i auto allerede på HEAD med min geometri** (0°, 92 %). Ditt rom feilet. Hva er annerledes — er trappa tegnet som hindring, som trapp (trappemodulen), eller ikke i det hele tatt? Var retningen låst (loddrett)? Loddrett gir i min fixture ingen kandidat på HEAD (v6 → kastet av 083), så et låst retningsvalg kan være hele forklaringen.

3. **Løse endepunkter — ny unntaksregel.** En ende der svingpartneren står ved sin egen kant (skråvegg, hindring, innerhjørne) telles ikke lenger som løs (svingen er en halvsirkel, så partnerne må slutte likt). Det senker tallet i 30 geo-rader (rom5 h: 3 → 0, badHakk41 h: 2 → 0, utsparing h: 2 → 0 …) — `hind1` og rektanglene er uendret. Baselinjen er oppdatert med de nye tallene. Er det riktig definisjon, eller vil du ha 161-tellingen tilbake for akseparallelle rom (da må skew-kabler få sin egen variant)?

4. **Auto-vinkel i D2-100: 109° (93 %) framfor 0° (91,2 %).** Motoren velger høyest dekning; 109° legger løpene langs skråseksjonen, men gangen får en tom stripe («Kabelfeltet stopper 21 cm fra veggen», 1,14 CC). Skal auto foretrekke rommets lengste vegg (gangens retning, 0°) når dekningen er innen ±2 pp, eller står dekning?

5. **Meldingen når kaskaden gir opp** legger nå produktet som label og toaster grunnen. Vil du heller ha *bare* meldingen (ingen label lagt automatisk), eller er label + melding riktig?

6. **Ambisjonsnivå for flercelle-skew.** I D1-102 (0°) finnes ingen rute forbi trappa (6 cm mellom trapp og vegg); koblingsstykket kan bare gå rundt trappas *andre* ende, som cellegrafen ikke modellerer. 90° løser rommet. Skal skew lære «vegg-følging rundt hindringen» (egen runde), eller holder det at en annen vinkel tar rommet?

7. **CC på etiketten (15,4/15,3) mot lagt CC (14,0/14,4).** Etiketten regnes som netto/lengde; motoren mister ~6 % i trekanter ved skrå vegger og sving-klipping. Skal etiketten vise motorens CC når det finnes et utlegg (den gjør det allerede for tegnede kabler — spørsmålet gjelder bare «kun label»-tall)?
