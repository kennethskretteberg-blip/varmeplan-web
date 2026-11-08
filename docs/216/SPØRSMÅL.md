# 216 · spørsmål til Kenneth

1. **Knapp 2 når tegningen alt er importert.** Den heter da «Sett målestokk» eller «Tegn omrisset», ikke «Importer plantegning». Tanken er din: navnet sier hva du skal gjøre nå. Vil du heller ha fast navn og at knappen bytter tegning?
2. **Med kart finnes to knapper for det samme i panelet:** «Tegn omrisset» (punkt 2) og «Tegn omrisset selv» (punkt 1). Toppmenyen viser bare den siste. Skal den ene bort fra panelet?
3. **Bygget er funnet:** feltet er sperret. Alternativet er at det er åpent og spør «Bytte bygg? Merkede kanter nullstilles». Hva vil du ha?
4. **Punkt 1 i panelet heter fortsatt «Finn bygget fra adressen»,** mens toppmenyen sier «Skriv inn adresse». Prompten ba om å beholde forklaringene. Skal overskriften også byttes?
5. **Knappen inne i kartdialogen heter fortsatt «Hent kart».** Dialogen er felles med snø, og den åpnes også fra kartikonet på etasjeraden i tak-panelet (verktøytips «Hent kart fra Kartverket»). Skal ikonet bli stående i tak?
6. **`S.geo` tømmes ikke når et nytt prosjekt startes** (`S.bgs` gjør det). Feltet er sikret mot dette, men andre steder kan lese gammel adresse. Skal jeg rette det i en egen prompt?
   **Svar (217):** rettet. `_resetProjectState` setter nå `S.geo = {}`, og et nytt prosjekt lagrer ikke lenger forrige prosjekts kartdata. Se `docs/217/RAPPORT.md`.
