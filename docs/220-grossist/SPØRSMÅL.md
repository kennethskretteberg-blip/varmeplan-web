# 220 · Spørsmål til Kenneth

1. **Nummeret 220 er brukt fra før** («Tak 220 tegn møne», `docs/220/`). Rapporten ligger derfor i
   `docs/220-grossist/`, som 216–219. Greit?

2. **Plassering i lista.** «Grossist» står sist, etter Tapt — både i chipen på raden, i masseendringen og i
   nedtrekket (der står den rett etter Tapt og før «Ferdige leveranser»). Skal den stå et annet sted, f.eks.
   mellom Tilbud sendt og Vunnet (siden det er en parallell til «Tilbud sendt» der grossisten gir prisen)?

3. **Fargen** er lilla (`#a855f7`), så den skiller seg fra grå/blå/grønn/rød. Greit, eller ønsker du en annen?

4. **Priser.** Skal prosjekter med «Grossist» skjule priser — i PDF-en, materiallista og presentasjonslenka?
   Ingenting er gjort med priser i 220. Hvis ja: skal *alle* prisfelt bort, eller bare summene (slik at
   grossisten ser produktene, men ikke våre priser)?

5. **Tellerne på dashbordet.** I dag teller et Grossist-prosjekt bare i «Totalt» — ikke i Under arbeid,
   Tilbud sendt, Vunnet, Tapt eller vinnraten (vinnrate = vunnet av vunnet + tapt, Grossist holdes utenfor).
   Skal Grossist få en egen rute, holdes utenfor «Totalt» også, eller er dette riktig?

6. **«Aktive».** Standardfilteret «Aktive» skjuler tapt og ferdige leveranser og viser alt annet — så
   Grossist-prosjekter vises der. Riktig? (Alternativet er at Grossist bare vises under «Alle statuser» og
   sitt eget filter.)

7. **Automatiske overganger.** (a) En *priset* PDF flytter bare «Under arbeid» → «Tilbud sendt»; et
   Grossist-prosjekt blir stående som Grossist (målt, E6). (b) Et *signert garantibevis* setter
   «Vunnet + Ferdig» uansett status — også fra Grossist. Er begge riktige?

8. **Visma.** Grossist spør ikke etter tilbudsnr./ordrenr., og telles ikke som «mangler nummer». Riktig?

9. **Installatør-visningen (faner) og feltappen.** For installatørbedrifter og i feltappen havner et
   Grossist-prosjekt i fanen «Prosjektert» (alt som ikke er vunnet/ferdig/tapt). Chipen med alle fem valgene
   vises også for dem. Skal Grossist bare kunne velges av leverandør (Cenika), eller av alle?

10. **Gamle `status`-kolonnen.** `PROJECT_STATUSES` (Utkast/Planlagt/Pågår/Tilbudsklar/Ferdig/Arkivert) og
    kolonnen `status` er ikke i bruk i UI-et lenger (lista er definert, men leses ingen steder). Grossist er
    *ikke* lagt til der. Skal den gamle lista ryddes bort i en egen prompt?
