# 219 · Spørsmål til Kenneth

1. **Nummeret 219 er brukt fra før** («Tak 219 3D fase 0», `docs/219/`). Rapporten ligger derfor i
   `docs/219-hindring/`, som 217 og 218. Greit?

2. **Det skjulte fjerde valget er borte.** Før 219 startet «Legg til →» med *tomme* målfelt et rektangel-tegneverktøy
   (dra opp et rektangel med musa, `drawMode:'hindring'`). Prompten sier tre valg, så det er ikke lenger nåbart fra
   menyen; koden står urørt. Skal det bort for godt, eller inn igjen som et fjerde valg?

3. **Reserveordet «Hindring»** der et navn *må* stå: i PDF-ens romoversikt («• Hindring»), som tittel i objektpanelet
   og i advarselen om for liten avstand. På tegningen vises ingenting når navnet er tomt, som bedt om. Riktig?

4. **PDF-en er sjekket på kodenivå, ikke åpnet som fil.** Romoversikten og tegningen går gjennom samme
   navnefunksjon som skjermen, og hele regresjonssettet (med PDF-testene) er kjørt. Vil du ha et PDF-skjermbilde
   med et gammelt prosjekt i tillegg?

5. **B og H.** Feltene heter B (bredde, vannrett ↔) og H (høyde, loddrett ↕ i plan), med plassholderne «Bredde» og
   «Høyde» — samme ord som objektpanelet bruker for en valgt hindring. Før sto det «Bredde (↔) × Lengde (↕)».
   Riktig ord for ↕, eller skal det hete lengde/dybde?

6. **Mål-rektangelet legges midt i rommet**, der romnavnet og arealet også står (se `etter-tegning-tre-maater.png`:
   «Stue 12,00 m²» ligger oppå det nye rektangelet til det flyttes). Slik var det også før 219. Skal det
   heller legges inn ved markøren, eller i et hjørne?

7. **Enter i navnefeltet** gjør ingenting (som før). Skal det f.eks. gå til B-feltet?

8. **`type` lagres fortsatt** (alltid `'annet'` for nye). Feltet brukes ikke til noe i utregningen; det står igjen
   bare så gamle prosjekter leses uendret. Skal det ryddes bort i en senere runde, eller stå?
