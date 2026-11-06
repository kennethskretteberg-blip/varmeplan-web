# 195 · Spørsmål

Hvert spørsmål har et forslag. Svarer du ikke, står forslaget.

## 1. Skal kunden på kundelenka også få «Lagre som»?

Kundelenka (`?present=`) har sin egen «Last ned PDF»-knapp og bruker samme `exportPDF`. Jeg lot
den laste ned som før. Grunnen: kunden har ikke PDF-dialogen og kan derfor ikke slå valget av, og
valget tilhører brukeren, ikke kunden.

**Forslag:** la det stå.

## 2. Delingsarket på mobil finnes ikke — hva siktes det til?

Prompten sier at delingsarket (`navigator.share`) «skal beholdes som i dag». Det finnes ikke i
`index.html` eller ellers i repoet; på mobil lastes hoved-PDF-en ned med `doc.save`, og det er
uendret. Gjelder setningen feltappen (annet repo), eller ønsker du at hoved-PDF-en skal få
delingsark på mobil?

**Forslag:** egen liten prompt hvis du vil ha det. På mobil er «del til e-post / Filer» ofte
nyttigere enn en nedlasting.

## 3. De andre filtypene (STEG 0.2)

| Fil | I dag | Forslag |
|---|---|---|
| Materialliste (Excel) | vanlig nedlasting | Samme «Lagre som», med egen huskemappe. Liten jobb — hjelperne fra 195 kan brukes direkte. Gjør det hvis Fredrik savner det samme der. |
| Garantibevis | lastes opp til skyen, åpnes i ny fane fra portalen | Ingen endring. Brukeren lagrer fra PDF-visningen. |
| Visma-fil | har allerede mappevalg | Ingen endring. |
| Prosjektfil (.json) fra menyen | har allerede «Lagre som» | Ingen endring. |
| Prosjektfil (.json) fra prosjektlista | vanlig nedlasting | Lav verdi — la stå. |
| Kundelenka | vanlig nedlasting | Se spørsmål 1. |

## 4. Godtar du prisen for «dialogen først»?

Chrome oppretter fila i det du trykker «Lagre», før PDF-en er bygget. Feiler byggingen etterpå,
fjerner appen den tomme fila og viser rød feilmelding. Valgte du å **erstatte** en eksisterende
PDF, er den gamle da borte.

Alternativet er å bygge først og spørre etterpå. Da er den gamle fila trygg, men klikket kan ha
gått ut (5 s), og vi trenger en ekstra «Lagre PDF …»-knapp for de tilfellene.

**Forslag:** la det stå. En byggefeil er sjelden, og navnet har klokkeslett og revisjon, så det er
uvanlig å erstatte en eksisterende fil.

## 5. På som standard for alle — greit?

Prompten sier «på som standard der API-et finnes». Det betyr at alle som bruker Chrome eller Edge
får lagre-dialogen ved første eksport etter at dette er ute, uten å ha bedt om det. De som heller
vil ha rett nedlasting, slår av avkrysningen én gang.

**Forslag:** ja, men si fra til brukerne (én linje i neste melding til dem).

## 6. Avbryt i lagre-dialogen lukker alt

Når lagre-dialogen kommer, er PDF-dialogen (med alle avkrysningene) allerede lukket — slik
tilbehørsvinduet også virker i dag. Avbryter du, må du åpne «Eksporter PDF» på nytt. Valgene dine
der er de samme som sist for rabatter og fritekst, men ikke for hvilke rom som var haket av.

**Forslag:** la stå nå. Vil du at PDF-dialogen skal komme tilbake ved avbryt, er det en liten
oppfølging.
