# 193 · Spørsmål til Kenneth

1. **Etiketten i segmentlista.** Med «Ovenfra og ned» står det «SEGMENTER (topp → bunn)» over lista, og første rad
   er segs[0]. Tegningens sidevisning, og nå også forhåndsvisningen, legger første segment **nederst**. Det er bare
   planen som snur. Etiketten sier altså at første rad er øverst, mens bildet rett under viser den nederst. Skal
   etiketten endres? Eller skal «Ovenfra og ned» også snu sidevisningen i tegningen? Det siste ville endre tegning,
   PDF og høydemål for alle slike trapper.

   > **Kenneth (07.11.2026):** Etiketten endres. Sidevisningen i tegningen skal IKKE snus. Lista er
   > inntastingsrekkefølgen, bildet er trappa slik den står — begge er riktige, de beskriver to forskjellige ting.
   > Etiketten skal si hva lista er, og det skal stå under bildet hva bildet er. *(Gjort i 202.)*

2. **Båndinndelingen i PDF-ens sidevisning** (`_renderStairSidePrintImages`) bruker fortsatt en egen høyde:
   trinnene + 17, og repos teller 0. Den viser ikke noe tall, men avgjør om sidevisningen deles i 1, 2 eller 3 bånd.
   Skal den også lese høydekjeden? Da kan sideinndelingen endre seg i noen få eksisterende PDF-er, nemlig der
   forholdet lengde/høyde ligger rett ved grensene 4 eller 8.

   > **Kenneth (07.11.2026):** Båndinndelingen skal rettes, men først måles. I 202 endres `_renderStairSidePrintImages`
   > IKKE — bare måling og rapport. Beslutningen tas av Kenneth etterpå. *(Målt i 202, se `docs/202/RAPPORT.md`.)*

3. **Ny trapp med 1 trinn** viser nå «34 cm høyde» (opp på trinnet + opp til gulvet over). Det følger regelen, men
   det er standardvalget i dialogen og det første tallet en ny bruker ser. Er det greit?

   > **Kenneth (07.11.2026):** Tallet beholdes (regelen står), men det skal merkes så ingen leser det som
   > trinnhøyden. *(202: «34 cm til gulvet over».)*
