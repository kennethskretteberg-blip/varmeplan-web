# 240 – spørsmål

Jeg har tatt et valg på hvert punkt og gått videre. Si fra der du vil ha det annerledes.

1. **Skjermen – skjules eller flyttes?** Valgt: på skjermen flyttes en tekst høyst 1,5 tekstbredder langs kjeden og høyst tre rader ut. Finnes det ikke plass der, skjules den til du zoomer inn. I PDF-en skjules aldri noe. Greit, eller vil du heller ha alle tekster synlige på skjermen også (med lange ledere ved sterk utzooming)?
2. **Tekst oppå veggmålets linje.** Når flyttede tekster ikke får plass mellom kjeden og veggmålet utenfor («361 cm»-linja), kan boksen legges oppå den linja (den hvite boksen bryter linja). Det skjer i Ekstra stor, ikke i Normal i eksempelet. Alternativet er å legge tekstene utenfor veggmålet, med lengre ledere som krysser det. Hvilket vil du ha?
3. **Flere rader.** Må en tekst flyttes mer enn én tekstbredde fra leddet sitt for å stå på én rad, fordeles tekstene annenhver / hver tredje osv. på flere rader (høyst 8). Lederen til en ytre rad går da bak tekstene i de indre radene. Greit, eller skal det heller være lange skrå ledere på én rad?
4. **«Får plass» = boks + 0,3 × skrifthøyde.** En tekst som akkurat fyller leddet sitt, blir stående. Vil du ha mer luft (flere tekster flyttes ut)?
5. **Veggmålene («680 cm») og skrå kabelkjeder går ikke gjennom `_drawDimChainLayout`** og har ikke fått regelen. Veggmål på svært korte vegger kan fortsatt overlappe hverandre. Skal de inn under samme regel?
6. **Hindringsmål og egne mål (måleverktøyet)** tegnes etter kjedene og er ikke med i lista over opptatte bokser. Skal kjedetekstene gå utenom dem også?
7. **Ytterpunktet** (13 baner B=20 i et rom på 3 m, Ekstra stor – `etter-smale-xstor.png`): ingen overlapp og alt i bildet, men høyre halvdel er rotete. Er dette et tilfelle som finnes i praksis?
8. **«V5 680 cm» oppå kjedens øverste ledd** fikk jeg ikke gjenskapt – i mitt L-rom står veggetikettene inne i rommet og kjeden utenfor. Regelen dekker det likevel (en kjedetekst som treffer en veggetikett, flyttes ut). Har du prosjektnummeret, kan jeg se på akkurat det rommet.
