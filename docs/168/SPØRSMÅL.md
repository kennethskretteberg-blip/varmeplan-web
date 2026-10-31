# 168 · Spørsmål

1. **Hvilken adresse/prosjekt målte du på?** Uten den kan jeg ikke gjenskape ≈ 1 m. Send adresse (eller prosjektlenke) og
   hvilket utsnitt (80/120/200) som sto i Kartinnstillinger. Med adressen kjører jeg `docs/168/maalestokk-live.py <lat> <lon>`
   og målingen på akkurat det stedet — og kan se om bildet der avviker.
2. **Hvilket verktøy målte du med, og var et rom valgt?** «Mållinje» uten valgt rom lager et fritt mål på kartet (riktig).
   Var det en plantegning (kalibrert) på samme etasje under/over kartet? Det forklarer lettest et avvik på 5×.
3. **Kjør snutten i `RAPPORT.md` («Gamle prosjekter»)** i prosjektet der du målte, og send resultatet. Sjekk også i konsollen
   `localStorage.getItem('varmeplan_roof_url')` — en gammel verdi kan peke appen mot en annen tjeneste enn Fly.
4. Kan målingen gjentas med en kjent avstand du har ≥ 5 m (f.eks. en husvegg med mål fra tegning) på samme kart? Da får vi
   sann avstand å sammenligne med, ikke bare «jeg vet at lastebilene står der».
5. Skal `maalestokk-live.py` kobles til deploy av `varmeplan-roof` (egen prompt i det repoet), så avvik fanges før produksjon?
