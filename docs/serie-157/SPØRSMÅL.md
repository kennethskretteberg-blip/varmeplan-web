# Serie 157 · Spørsmål til Kenneth

1. **Desimaltegn:** mattekjeden skriver punktum («2.5 cm») fordi folie- og kabelkjeden gjør det; resten av appen bruker komma.
   Skal alle tre kjedene over på komma i én omgang?
2. **Hele cm:** prompten sa hele cm (én desimal under 10). 83,5 blir da «84 cm», og summen av tverr-kjeden stemmer ikke lenger på
   0,5 cm (2,5 + 50 + 7 + 50 + 7 + 50 + 84 = 250,5 i et 250-rom). Vil du heller ha én desimal også over 10 cm når tallet ikke er helt
   (slik foliekjeden gjør)?
3. **Kabelmerknaden** regner med regelens inntrekk (`_matEdgeInsetCm`: 2,5 cm for 60T/100T, 2,0 for 150T), ikke tegningens
   (U-svingens topp 2,5 cm på tvers, cc/2 = 6 cm i endene). For 150T viser merknaden derfor 0,5 cm mindre enn tegningen på tvers.
   Er en nedre grense riktig, eller skal den lese kabelgeometrien?
4. **Bbox-vegg:** kjeden måler mot rommets omsluttende rektangel (som foliekjeden). I et L-rom kan et tverrmål vise lang avstand
   til en vegg som ikke er der, mens matta ligger 2,5 cm fra den innvendige veggen. Merknaden måler mot faktisk kant. Skal kjeden
   også måle mot nærmeste faktiske vegg (gjelder da folie og kabel også)?
   **Svar (Kenneth 30.10):** mål per faktisk vegg, se 164 (`docs/serie-163/RAPPORT.md` «## 164» — felles kantmodell for folie, kabel og matte).
5. **Mellomrom:** mellomrom under produktets minste nett-til-nett-avstand (Regel 18) rødmerkes ikke — bare veggmålene. Ønskelig?
6. **Sidepanelet:** romlista fikk også en linjalknapp for matte (folie og kabel hadde det fra før). Ikke bedt om — beholde?
7. **Begge retninger i ett rom:** loddrette og vannrette matter gir hver sin kjede (under + venstre, og høyre + over).
   Kabelmerknaden står bare én gang, under den første. Greit?
8. **Tekst på papiret:** 10 px som de andre kjedene — liten på A4 (står alt som 154-spørsmål 11). Skal alle tre kjedene skaleres i PDF?

## 158

1. **Bildet vokser ikke på P0373-kopien:** på en stående side er bildet begrenset av bredden (180 mm), ikke av høyden — romlista lå
   under med luft igjen. Gevinsten kommer bare på etasjer som er høyere enn brede. Skal sideformatet velges etter størst bilde
   (stående vinner mellom aspekt 0,85 og 1,0 — i dag blir det liggende der), eller står 154-regelen «liggende når bredere enn høy»?
2. **Uten etasjer:** utsnittet bor da på `S.project.pdfViewFloorplan`, og `pushUndo` tar ikke prosjektobjektet (bare `parts`) — zoom/
   flytt på plantegningen kan ikke angres i et prosjekt uten etasjer (lagres og tilbakestilles som normalt). Greit, eller skal
   prosjektet inn i angre-stabelen?
3. **«Labels til auto» på plantegningen** tilbakestiller labels i alle rommene på etasjen (med bekreftelse og antall). Ønsket, eller
   skal knappen bare finnes på romsidene?
4. **Avkryssing av rom** demper rom i plantegningen (forrige 158), men det levende lerretet tegnes ikke på nytt når du haker av/på før
   du klikker «Plantegning» igjen. Skal det følge med live?
5. **Zoomtrinn:** hjulet gir 1,1 per klikk (som 155), så «1,3×» blir 1,331× etter tre klikk. Vil du ha et tallfelt/faste trinn?
