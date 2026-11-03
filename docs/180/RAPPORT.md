# 180 · PDF: motstandsmålingen heter tydelig «Motstandsmåling – varmefolie»

Fredriks ønske (02.11.2026, via Kenneth): «Må stå at dette er ‹motstandsmåling – varmefolie›.»

## Kort fortalt
- **Tabellsiden** het «Motstandsmåling — oversikt for elektriker» — ordet «varmefolie» manglet. Nå:
  **«Motstandsmåling – varmefolie»** (samme størrelse 16 pt, fet), og «Oversikt for elektriker» står som
  undertittel på linja under (10 pt, grå).
- **Romblokken** het «Motstandsmåling — varmefolie» med lang strek (—). Nå **«Motstandsmåling – varmefolie»**
  med kort strek (–), helt likt tabellsiden.
- **PDF-dialogen:** valget het «Motstandsmåling (varmefolie)». Nå **«Motstandsmåling – varmefolie»**.
  Begrunnelse: de andre valgene i dialogen heter det samme som overskriften på siden de lager
  («Romoversikt», «Trappeoversikt», «Materialliste»), så valget skal også hete det samme som siden.
  Forhåndsvisningen i dialogen fikk samme tittel.
- Ingen tall, grenser, kolonner, utvalg av rom eller andre sider er endret (bevist under).

**Strektegnet:** promptens tekst har kort strek (–, U+2013), mens koden hadde lang strek (—, U+2014). Jeg fulgte
prompten: kort strek begge steder. jsPDFs helvetica har tegnet (WinAnsi), det tegnes riktig (se bildene).

## STEG 0 — alle tekster om motstand (målt før endring)
Fixture: 4 rom på 2 etasjer, 3 med folie (Stue 2×B=60 + 1×B=100, Kjøkken 2×B=60, Bad 1×B=60), «Bod uten folie».
Alle valg på (forside, prosjektoversikt, romsider, romoversikt, materialliste, motstandsmåling) → 12 sider.
Ekte prosjekt kunne ikke dupliseres (ingen innlogging i headless) — samme fremgangsmåte som 145.

| Sted | Tekst før | Tekst etter |
|---|---|---|
| PDF, romblokk (s. 4, 6, 8), 9 pt fet blå | Motstandsmåling — varmefolie | **Motstandsmåling – varmefolie** |
| PDF, tabellside (s. 11), tittel 16 pt fet | Motstandsmåling — oversikt for elektriker | **Motstandsmåling – varmefolie** |
| PDF, tabellside, undertittel 10 pt grå | (fantes ikke) | **Oversikt for elektriker** |
| PDF, topptekst | ingen topptekst finnes | uendret |
| PDF, bunntekst | «MOTSTAND 180 · rev. 1» + «Side n av 12» (prosjektnavn, ikke seksjon) | uendret |
| PDF, bokmerker / innholdsliste | finnes ikke i PDF-en | — |
| Dialog, avkrysningsvalg | Motstandsmåling (varmefolie) | **Motstandsmåling – varmefolie** |
| Dialog, forhåndsvisning (boks-tittel) | Motstandsmåling — varmefolie | **Motstandsmåling – varmefolie** |

Brødtekster som nevner motstand («Mål motstanden på tilkoblingen …», «Ingen motstand», «Kilde: … beregning av
motstand», «Foliebreddene kobles parallelt …») er ikke titler og er uendret. Kodesøk på «Motstand»/«motstand»:
de øvrige treffene er dokumentasjonsmodulen («Motstand målt (Ω)» i sjekklistene, «Nominell motstand» i
garantibevis-PDF, «Effekt / motstand» i portalen) — egen modul, ikke denne PDF-en, ikke rørt.

## Før/etter — bevis for at ingenting annet endret seg
Alle `doc.text`-kall med side, font, størrelse og x/y, HEAD (port 4180) mot ny kode (port 4000):
- Før: 541 tekstkall, 12 sider. Etter: 542 tekstkall (+ undertittelen), 12 sider.
- Normalisert (undertittelen tatt ut, titlene tilbake til gammel tekst, side 11 flyttet −5 mm): **0 ulike av 541.**
  Altså: samme tall, samme rader, samme rom, sidene 1–10 og 12 identiske; side 11 er bare skjøvet 5 mm ned under
  tittelen for å gi plass til undertittelen.
- **Prosjekt uten folie:** 8 sider → 8 sider, 322 → 322 tekstkall, **0 ulike**; ingen motstandstekst, valget
  vises ikke i dialogen.

## Skjermbilder (macOS PDF-motor)
- `docs/180/tabellside-for.png` → `docs/180/tabellside-etter.png` (toppen av tabellsiden)
- `docs/180/romblokk-for.png` → `docs/180/romblokk-etter.png` (romblokken)

## Tester
- `_foilResistanceRegressionTest` **52/52** (var 49). Endret, ikke slettet:
  - «blokk på hvert av de tre folierommene» teller nå blokkene **utenom** tabellsiden (de deler tittel nå).
  - «tabelltittel finnes én gang» → «undertittel ‹Oversikt for elektriker› finnes én gang».
  - Ny: tabellsidens tittel er «Motstandsmåling – varmefolie» rett over undertittelen.
  - Ny: ingen «Motstandsmåling —» med lang strek igjen (rød på gammel kode).
  - Ny: tabellside + tre romblokker = fire «Motstandsmåling – varmefolie».
  - Tabellsiden finnes via undertittelen (etasje-grupperingssjekken).
- `_pdfExportSmokeTest` **55/55**: de to foliesjekkene ser nå etter ny tittel (+ «Oversikt for elektriker»).
- Også grønne: `_foilRegressionTest` 9/9, `_accessoryFoilQtyRegressionTest` 105/105.
- Ingen konsollfeil.

## Funn (ikke rettet — utenfor oppdraget)
I fixturen får romblokken ikke plass på romsiden og havner **alene øverst på neste side, uten romnavn** (s. 4, 6, 8
starter direkte med «Motstandsmåling – varmefolie»). Elektrikeren ser da ikke hvilket rom målingen gjelder uten å
bla tilbake. Var slik før 180 også. Se SPØRSMÅL 1.

## Verktøy
`docs/180/probe/` (`maal.mjs` = PDF-tekst + dialog, `tester.mjs`, `render.swift` = PDF-side til PNG, `patch.js`).
Kjøres mot headless Chrome på port 9333.

Ikke pushet.
