# 226 · Lesbare mål i PDF-en — spørsmål til Kenneth

Valgene er tatt så løpet kunne gå videre. Svar når du har tid; ingenting av dette stopper 223–225.

1. **Én farge på alle mål i PDF-en.** Prompten sa «heltrukken mørk grå (#374151)» for målene. På skjermen har
   romdimensjonene (blå), foliekjeden (oransje), kabelkjeden (brun) og mattekjeden (mørk oransje) hver sin
   farge; på papiret er de nå alle like grå. Røde (usikre/for små) mål er fortsatt røde, men heldekkende.
   *Valgt:* én grå. *Alternativ:* beholde fargene, men heldekkende — én linje per kjede i `_dimPdfStyle`-bruken.

2. **2,0 mm målskrift mot 2,2 mm produktetikett.** Målt: tallene er 1,44 mm høye (versalhøyde) ved Normal, 2,2 mm ved
   Ekstra stor. Er 2,0 mm riktig, eller skal målene være like store som etikettene?

3. **Veggetikettene «V1 400 cm» inne i rommet** er også mål i Kenneths bilde, og tegnes av `drawRooms`, ikke av
   målfunksjonene. De har fått samme størrelse og farge i PDF-en, og luften inn fra veggen er skalert med skriften
   (ellers hadde teksten stått oppå veggstreken). De ligger UNDER folie og etiketter (tegnes før varmeelementene),
   så en etikett kan dekke dem — som før. Skal de over, eller skal de ut av PDF-en når romdimensjonene er på?

4. **Ekstra stor (1,5) kolliderer.** Verste tilfelle, `docs/226/etter-xstor-kjede-kollisjon.png` og
   `etter-xstor-hindring.png`: i kjeden får korte segmenter («2 cm», «2.5 cm») etiketter som er bredere enn
   segmentet, og de legger seg over nabotallet; i en 60 × 40-hindring legger de fire målene seg over hverandre
   (217-plasseringen sjekker bare mot omrisset og navnet, ikke mot hverandre). Ved Normal og Stor er det lesbart.
   *Valgt:* ikke rettet. *Alternativ:* la kjedetekster krympe ned mot 1,6 mm når segmentet er kortere enn teksten,
   og la hindringsmål vike for hverandre (217-regelen utvidet).

5. **Hindringens navn («Pipe») i PDF-en** er fortsatt 11 skjermpunkter ≈ 0,9 mm. Det er ikke et mål, så det er
   ikke rørt. Skal navnet følge etikettstørrelsen (2,2 mm)?

6. **PNG i stedet for JPEG.** Valgt PNG med Flate («FAST») — PDF-en ble 719 kB mot 695 kB før (samme fem sider),
   men byggingen tar ~0,2 s mer per side (jsPDF pakker i JavaScript). ⚠ Uten Flate-flagget legger jsPDF PNG-piksler
   RÅ i fila (målt 67 MB). JPEG 0,95 ved 300 DPI ga 908 kB og nesten like skarp tekst (`variant-jpeg95-hjorne-folie.png`);
   400 DPI ga 1,4 MB. Trappesidene var alt PNG; tak-snittet er fortsatt JPEG (egen kodevei, ikke rørt).

7. **Serveren på port 4010 var ikke worktreet.** `kjor-lop.sh` fant «noe som svarer» på 4010 og startet ikke sin egen —
   men det var en gammel `python3 -m http.server 4010` (pid 81926, fra 30.10) som svarer 404 på alt. Jeg startet
   worktreets `serve-varmeplan.js` på **port 4013** (pid 97427, løsrevet) og brukte den; alle skript i `docs/226/probe/`
   peker dit. 223–225 vil møte det samme — drep pid 81926 (og 97427 etterpå) eller endre PORT i skriptet.

8. **Regresjonstestene lekker til localStorage.** Mens suiten kjørte i andre faner, fikk PDF-bygget et foliegap på 20 cm
   (en test skriver prefs), og før/etter fikk ulikt utlegg. `pdf.mjs` låser nå `S.varmefolie.gapCm = 2`. Bør testene
   rydde etter seg?

9. **Stiplinger og små luftmål er skalert** ([2,3] px → 0,4/0,6 mm osv., `P.dash`), ellers blir hjelpelinjene en
   nesten heltrukken grå strek i 300 DPI. Ingen mål er flyttet; kjedeavstandene (25 + 20 cm) er uendret.

10. **Ekte tekst i PDF-en (punkt 5 i prompten)** — se RAPPORT.md. Anbefaler et eget nummer hvis det skal gjøres.
