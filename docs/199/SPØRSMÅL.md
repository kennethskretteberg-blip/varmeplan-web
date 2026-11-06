# 199 · Spørsmål til Kenneth

Ingenting her blokkerer. Alt er løst på en måte som kan snus med små endringer.

1. **Gammel verdi som ikke er 6 siffer.** Meldingen vises under feltet, men «Lagre» er ikke sperret så lenge
   feltet er urørt. Da kan du legge inn ordrenr. uten å måtte rette et gammelt tilbudsnr. først. Endres det
   gamle nummeret, må det nye være 6 siffer eller tomt. Greit, eller skal en gammel verdi sperre «Lagre» til
   den er rettet?

2. **«Lagret.» foran varselet.** Meldingen lyder «Lagret. Tilbudsnr. 104455 står også på #0380 …». Du skrev
   teksten uten «Lagret.». Jeg la det til så meldingen ikke leses som en feil. Si fra om det skal bort.

3. **Gamle numre med mellomrom.** Ble «104 455» lagret med mellomrom i 198, står det slik i databasen.
   Da treffer verken søk på `104455` eller varselet om samme nummer. Jeg har ikke rørt slike (du ba om ingen
   automatisk endring). Kjør `await _vismaNoAudit199()` og se om det finnes noen. Er det få, er det raskest å
   åpne og lagre dem på nytt. Er det mange, trengs en egen liten opprydding.

4. **Vunnet uten tilbudsnr. i lista.** Dialogen spør nå om begge. Men raden viser bare «+ Ordrenr.», ikke
   «+ Tilbudsnr.», på et vunnet prosjekt som mangler tilbudsnr., og det finnes ikke noe filter for det.
   Ønsket?

5. **PDF-meldingen uten Visma.** Bedrifter uten Visma får fortsatt meldingen «Prosjektet er satt til Tilbud
   sendt» når en priset PDF flytter status, bare uten knappen. Meldingen kom med 198. Skal den bort for dem,
   eller er den nyttig uansett?

6. **«Vis som» (superbruker).** Visma-sjekken følger din egen bedrift, ikke bedriften du viser som. Viser du
   som en elektriker, ser du altså fortsatt feltene og filtervalgene. Det er samme oppførsel som hintet hadde
   i 198. Skal «Vis som» skjule dem? Da må bedriftslista i «Vis som» også hente `erp_format`.

7. **Papirkurven i varselet.** Et nummer som bare står på et prosjekt i papirkurven, gir ikke varsel. Greit?

8. **Installatør med Visma.** Finnes en slik bedrift, får den de to filtervalgene foran «Papirkurv», med
   samme tekst som hos leverandør. Så vidt jeg vet har bare Cenika Visma i dag, så dette er ikke prøvd på
   ekte data.

9. **`_vismaNoAudit199`.** Tellefunksjonen ligger i appen (leser bare). Skal den fjernes når du har fått tallene?
