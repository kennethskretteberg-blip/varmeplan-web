# 230 – Trapp i PDF: én hel plantegning i høy oppløsning, samme målestokk som sidevisningen

10.11.2026 · `main` · commit `HASH230` · ikke pushet · bare `index.html` er endret i appen

## Hva som er endret

- **Én plantegning per trapp.** Ingen bånd lenger. Siden blir stående eller liggende etter hva som gir størst målestokk; en lang trapp legges langs en liggende side med trinn 1 til venstre, som i sidevisningen. Teksten står vannrett selv om planen er rotert (før sto den sidelengs).
- **300 DPI** på trykt størrelse (før 150 DPI og tak på 1,4 Mpx). Lengste side er høyst 8000 px; blir den lengre, senkes DPI.
- **PNG med Flate.** Trappebildene ble før lagt inn som PNG *uten* komprimering – derfor var en trappe-PDF på 6–9 MB. Nå 0,1–0,2 MB.
- **Samme målestokk** på plan og sidevisning: den største som lar begge få plass på sin side, rundet ned til en vanlig verdi (1:5, 10, 15, 20, 25, 30, 40, 50, 75, 100 …). «Målestokk 1:N (A4)» står under begge tegningene. Bildene settes inn i naturlig størrelse, så målestokken stemmer når siden skrives ut i 100 %.
- **Mål etter 226-regelen:** 2,0 mm skrift på papiret, 0,2 / 0,15 mm streker, mørk grå, hvit boks bak tallet. Trinnummer og «Repos 1» er 2,2 mm. Kabelfarger, start-/sluttprikker og stiplede udekkede løp er som før.
- **Detaljutsnittene er tatt ut.** Se under.
- Tegnforklaringen (start/slutt kabel) står rett under planen, på samme linje som målestokken.

Skjermen, trappebyggeren, romsidene og forhåndsvisningen er ikke rørt. Tallene (kabelmeter, CC, effekt, mål) er de samme.

## Tallene (fire trapper, før → etter)

| Trapp | Sider | Målestokk | Skrift på papir | Planbilde (px) | Sidevisning (px) | PDF |
|---|---|---|---|---|---|---|
| Kort rett, 8 trinn (100 × 240 cm) | 3 → 2 | 1:15 | 2,0 mm | 1083 × 2114 | 2091 × 1406 | 6,85 MB → 0,15 MB |
| Lang rett, 30 trinn (100 × 900 cm, forhold 9) | 4 → 3 | 1:40 | 2,0 mm | 2953 × 591 | 2858 × 1757 | 9,17 MB → 0,21 MB |
| Med repos, 4 + R120 + 6 (150 × 420 cm) | 5 → 3 | 1:20 | 2,0 mm | 2776 × 1181 | 2681 × 1406 | 8,93 MB → 0,23 MB |
| Hestesko (562 × 116 cm) | 2 → 2 | 1:25 | 2,0 mm | 2962 × 860 | 749 × 442 | 6,25 MB → 0,11 MB |

- Før: planen i 1 bånd (kort, repos, hestesko) eller 3 bånd (lang), pluss 1–2 detaljutsnitt per trapp. Bildene var høyst 1,4 Mpx.
- Tid for hele eksporten: 0,1 s → 0,2–0,4 s per trapp. Minne i nettleseren: under 180 MB i alle fire.
- Før hadde plan og sidevisning hver sin målestokk, og ingen av dem sto på arket.

Før/etter som PNG i 300 DPI: `docs/230/foer-*-sideN.png` og `etter-*-sideN.png`. Innzoomet utsnitt (300 % av siden) per trapp: `etter-*-utsnitt.png`. Etter-PDF-ene ligger i `docs/230/probe/etter-*.pdf`; før-PDF-ene (31 MB) er ikke lagt i repoet.

## Billedtekstene fra detaljutsnittene

Billedtekstene sa antall strenger, CC og kabelmeter per trinn-type og per repos. For trinn sto det meste i soneblokkene fra før, men **ikke per repos**. Derfor står det nå en liten teksttabell «Kabel per flate» etter sidevisningen: Flate | Strenger | CC | Kabel (m). Den har én rad per tidligere utsnitt, samme gruppering og samme regning. Testen sammenligner rad for rad med de gamle billedtekstene.

`_renderStairDetailInsets`, `_renderStairPrintImages`, `_renderStairSidePrintImages`, `_stairSurfaceBands`, `_stairSidePrintBandCount` og `_stairRotateCanvas90` ligger igjen i koden. PDF-en bruker dem ikke lenger; bare testene gjør det (203 og 230). De kan slettes når du har sett resultatet.

## Når felles målestokk gjør en tegning liten

- **Hestesko:** planen bestemmer (1:25). Sidevisningen alene kunne vært 1:5, men blir nå 63 × 37 mm. Den er lesbar (2,0 mm skrift), men liten.
- **Kort rett trapp:** sidevisningen bestemmer. Planen alene kunne vært 1:10,6, men blir 1:15 (92 × 179 mm).
- **Lang trapp:** planen bestemmer (1:37 → 1:40). Her får ikke hvert CC-tall plass mellom strengene, så de står som ett tall: «3 × 8.7».

## Kontroll

- Ny `_stairPdfRegressionTest230`: 121/121. Den sjekker én plan og én sidevisning per trapp, ingen bånd, samme målestokk, naturlig størrelse, minst 300 DPI, 2,0 mm målskrift, ingen tekst kuttet av bildekanten, ingen detaljutsnitt, og at tabellen sier det billedtekstene sa.
- Hele suiten: 98 tester. De 97 som fantes fra før, gir nøyaktig samme resultat som HEAD (90 grønne, de samme sju røde uten innlogging: prosjektlås, kundeforslag og fem `_geo*`). Ingen nye røde.
- `_stairSideRegressionTest` 25/25, `_stairHorseshoeRegressionTest` 274/274, `_stairSideBandRegressionTest203` 8/8.

## Funn jeg ikke rettet

1. Kabelmålene for bredde (5 · 100 · 5) tegnes over trinn 1, altså oppå trinn 2. Slik var det før også; med hvit boks bak tallene dekker de nå litt av kabelen der.
2. Forhåndsvisningen av en trapp i eksportdialogen (klikk på trappenavnet) bruker fortsatt den gamle tegnemåten og viser ikke målestokk eller sideoppsett.
3. Sidevisningens høydekjede sier «12 × 17 = 204» for 10 trinn + repos. Det er regelen fra 191/193, ikke endret her.
4. På HEAD deler en trapp med forhold 9 seg i båndene 1–19, 20 og 21–30 – midtbåndet er ett trinn. Borte nå, siden båndene er borte.
5. Hesteskoens måltabell tegnes fortsatt inne i planbildet, i tillegg til den nye teksttabellen under. De sier delvis det samme.
