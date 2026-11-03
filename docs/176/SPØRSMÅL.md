# 176 · Spørsmål til Kenneth — hesteskotrapp

1. **75 %-grensen for en U.** Regel 19 sier at varmet bredde skal være minst 75 % av den smaleste flata, altså høyst 12,5 % sidemargin per side. På en hestesko er «bredden» det marginen spiser av, nemlig hele U-lengden. Jeg har brukt den indre konturens lengde (`Wi + 2·Di`, for eksempel 610 cm på trinn 2 i VK Hovedterrasse) som hesteskoens «bredde». Den smaleste flata i trappa avgjør, og i eksempelet er det toppflaten (470 cm), så taket blir 58,75 cm. Er det riktig tolkning? Alternativer:
   - (a) 12,5 % av hver U-lengde, som nå.
   - (b) Sidemarginen skal aldri være lengre enn armen (`Di + t`), slik at strengen aldri «går rundt hjørnet» og slutter på fronten.
   - (c) Bare toppflaten avgjør.

2. **Hjørneradius mot minste bøyeradius.** Lengden regnes med skarpe hjørner (samme forenkling som Regel 10), og hjørnene tegnes også skarpe. En bue med radius r sparer `(2 − π/2)·r ≈ 0,43·r` per hjørne, altså to hjørner per streng. Med r = 4 cm blir det ≈ 3,4 cm per streng og 17 cm på trinn 2. Den innerste strengen ligger bare 3 cm fra opptrinnshjørnet. Skal hjørnene tegnes med leverandørens minste bøyeradius, og skal lengden regnes med den? Da trengs `min_bend_radius_mm` på produktet. Det feltet finnes ikke i dag.

3. **Toppflaten legges bakfra.** Hesteskoens strenger slutter ved bakkanten, så kabelen kommer opp på toppflaten der. Jeg legger derfor toppflaten fra bakkanten og ut mot nesen (ved «Kabelstart: Topp» blir det motsatt). Ellers måtte kabelen ha gått rundt 60 cm langs siden for å nå nesestrengen. Regel 14 sier «nesen først», og dette er et bevisst avvik **bare på toppflaten**. Kabelens slutt (rød prikk) havner da foran på toppflaten, og den kalde enden må tilbake til veggen derfra. Er det greit, eller vil du heller ha slutten ved bakkanten? Det kan oppnås ved å kreve et partall strenger på toppflaten, eller ved at toppflaten legges med strengene fra bakkant til nese.


   > **Svar (Kenneth 03.11.2026):** InSnow 30T er en tolederkabel. Den kalde enden sitter bare i starten (grønn prikk ved bakkanten), og slutten er en endemuffe. At kabelen slutter foran på toppflaten, er derfor riktig. **Ingen endring.**
4. **Ulike inntrinn foran og på sidene.** Strengene ligger med samme *brøkdel* av båndet på hver kant. Ved 46 foran og 60 på sidene er avstanden derfor 5,67 cm foran og 9 cm på sidene. Antallet regnes fra det **bredeste** båndet, slik at CC aldri går over maks noe sted. Fronten får dermed tettere CC enn nødvendig. Er det riktig, eller vil du ha fast CC langs fronten, slik at sidene får CC over maks? Varselet for CC ser i dag bare på fronten (`getStairCableViolations` leser `pos_cm`).

5. **Opptrinn over toppflaten.** Sidevisningen bruker dagens felles profil. Den tegner ett opptrinn fra bakken og ett over hvert trinn, også over toppflaten («3 × 17 = 51» for to trinn). Kabelen regner bare opptrinnet mellom trinnene, som kontrolltallet sier («+ 1 opptrinn»). Ligger toppflaten ett opptrinn under terrassen, slik tegningen viser, eller i plan med terrassen? Hvis den ligger i plan, bør sidevisningen for hestesko ikke tegne det øverste opptrinnet.


   > **Svar (Kenneth 03.11.2026):** «Ta utgangspunkt i ett trinn under terrassen, men fint om det kan velges.» Tillegg: «Vi trenger kanskje ikke å bruke ordet terrassen? Trappen kan være opp til et repos eller til en inngangsdør.» → **Gjort i 178:** byggeren har valget «Toppflate: Eget trinn (standard) / I plan med øverste nivå» (`stair.horseshoe.topLevel`). Ved «I plan» tegner sidevisningen ikke opptrinnet over toppflaten. Se `docs/178/RAPPORT.md`.
6. **Strenglengde i PDF-tabellene.** På en hesteskoflate er strengene ulikt lange (612 … 772). Tabellene viser **snittet**, for eksempel «680 cm/streng» med margin 11, slik at «N × streng = kabel per trinn» fortsatt stemmer. Vil du heller ha et spenn («600–760»), eller begge?

7. **Panelet og forslagskortet viser første trinn.** «Løp per trinn 5 · CC i trinn 10» og forslagets «CC trinn» leser det ytterste hesteskotrinnet. Toppflaten har 8 strenger med CC 9,14. «Manuelt»-kortet i forslagsdialogen (6 løp · CC 8 / 5 løp · CC 10) regnes nå av motoren for hele trappa. Holder det med én linje i panelet, eller vil du ha toppflate og hestesko på hver sin linje?

8. **Soner er skjult for hestesko.** Soner henger på segmentlista, og en hesteskotrapp har ingen segmentliste i byggeren. Motoren ville klart det, fordi innstillingene leses per flate. Trengs soner på hesteskotrapp, for eksempel én kabel per trinn på store terrasser? Det er i så fall en egen, liten prompt: sonevalg per trinn i hesteskobyggeren.

9. **Forslag B mangler ofte.** For VK Hovedterrasse gir motoren bare Forslag A (1 × 70 m, margin 11). Det er samme logikk som for rett trapp: B vises bare når et annet sett eller margin-variant 3/3 gir noe nytt, og her er brukerens egne marginer allerede 3/3. Er det greit?
