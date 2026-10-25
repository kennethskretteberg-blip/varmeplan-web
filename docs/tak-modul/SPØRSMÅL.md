# SPØRSMÅL til Kenneth — samles under kjøringen, besvares til slutt

Skriv ett punkt per spørsmål. Ta med **ditt midlertidige valg** (det du gikk videre med) så Kenneth
bare trenger å si «ok» eller «nei, gjør X».

## Kenneth må gjøre (kan ikke gjøres av Claude Code)

- [ ] **Fly-deploy av `varmeplan-roof`**: `fly auth login` → `fly launch --no-deploy --copy-config
      --name varmeplan-roof` → `fly secrets set ROOF_API_KEY=<lang tilfeldig streng>` → `fly deploy`.
      (Forberedt i 001. Til da kjører alt mot `localhost:4100`.)
- [x] **App-nøkkel i klienten** — avgjort i 139: konstant `ROOF_APP_KEY` i `index.html` (appnøkkel,
      synlig i nettleseren uansett; CORS avgrenser bruken). `window.`/localStorage vinner fortsatt.
      Du må sette samme verdi i Fly: `fly secrets set ROOF_API_KEY=<verdien i ROOF_APP_KEY> -a varmeplan-roof`.

## Avklaringer (midlertidig valg står i parentes)

- [x] Bygningsomriss-kilde: **avgjort 24.09** — kun CC BY 4.0: INSPIRE → DOM1-avledet (004) →
      brukeren tegner. OSM (ODbL) brukes ikke. *(Gjenstår: send e-posten til Kartverket om
      INSPIRE-status — utkast i `varmeplan-roof/docs/epost-kartverket-inspire.md` etter 002.)*
- [x] Ble INSPIRE-WFS verifisert live under 002? **Ja — den er oppe** (0,13–1,2 s, 24.09).
      Ingen syntetisk fixture; alle fixtures er ekte svar. **MEN:** dekningen er 60,03–70,68 °N,
      så **Oslo er ikke dekket** (0 bygg på Storgata 1; 20 i Hønefoss). Se neste punkt.
- [ ] **VIKTIGST NÅ — INSPIRE dekker ikke Sør-Norge under 60 °N.** Det betyr at `footprint: null`
      blir utfallet for en stor del av landets befolkning, og at **004 sin DOM1-avledede omriss
      ikke er en reserveløsning, men hovedveien** i Oslo/Sørlandet/store deler av Vestlandet.
      Midlertidig valg: bygger 003–004 som planlagt og lar 004 bære omriss-byrden i sør.
      **Spørsmål til deg:** (a) send e-posten til Kartverket (utkast klart i
      `varmeplan-roof/docs/epost-kartverket-inspire.md`) — finnes en nasjonal variant?
      (b) Skal vi samtidig hente pris på FKB-Bygning via Norkart/Geodata, gitt at den er den
      eneste kilden med ekte nasjonal dekning?
- [ ] Standard utsnitt rundt adressen: *(valg: 80 × 80 m, valg 60/80/120 i dialogen)*.
- [ ] Skal eiendomsgrenser tegnes som standard? *(valg: ja, tynn oransje, kan skjules)*.
- [ ] Skal DOM1-hillshade (skyggelagt høydemodell) ligge i kartbildet? *(valg: av som standard,
      bryter i dialogen — det tar 1–3 s ekstra)*.

## Oppdaget underveis

### Fra 139 (25.10.2026)

- [ ] **139-1 Valg i lista går rett til «Finn bygg».** Klikk/Enter på en rad fyller feltet, lagrer
      punktet OG starter byggsøket med én gang (som tomterom.no). Alternativ: bare fylle feltet og la
      brukeren trykke «Finn bygg». Midlertidig valg: rett videre — færre klikk, og feilen (om
      tjenesten er nede) vises uansett i dialogen med «Prøv igjen».
- [ ] **139-2 Jokertegn bare i kartdialogen.** Kartverkets API matcher hele ord: «Storg» gir 0 treff,
      «Storg*» 5314, «Storgata 1 Osl*» nøyaktig 1. Dialogen legger derfor `*` bak siste ord
      (`_kvAddrLookup(…, { prefix: true })`). Prosjektfeltet er uendret (prompten: «nøyaktig som
      før») — det gir altså fortsatt ingen liste før et helt ord er skrevet. Skal prosjektfeltet
      også få jokertegnet?
- [ ] **139-3 Klienten kan ta feil tjeneste for karttjenesten.** `_roofResolveUrl` godtar alt som
      svarer 200 på `/health` — på denne maskinen sto tolkemotoren på 4100 (`{"status":"ok","dwg":…}`),
      og dialogen sa «tjenesten er oppe» mens `locate` ga 404 («Fant ikke adressen»). 001 la inn
      `service: "varmeplan-roof"` i `/health` nettopp for dette. Ikke rettet (utenfor 139); forslag:
      egen `_roofHealthCheck` som krever `service === "varmeplan-roof"`.
- [ ] **139-4 Feiltekst ved override på localhost** sier «Kjører den lokalt på port 4100?» også når
      `window.VARMEPLAN_ROOF_URL` peker et annet sted. Kosmetisk, ikke rettet.
- [ ] **139-5 `_roofWarmResolve` er fjernet** — eneste kaller var `_roofOpenDialog`, som nå kaller
      `_roofSvcCheck` (samme oppvarming + synlig svar). Si fra hvis noe eksternt brukte den.
- [ ] **139-6 Escape i steg 1** lukker bare lista (når den er åpen), ikke dialogen — dialogen hadde
      ingen Esc-håndtering fra før heller. Skal Esc med lukket liste lukke dialogen?

### Fra 005–007

- [ ] **PDF-krediteringen er ikke sett på papir.** jsPDF lar seg ikke konstruere i testmiljøet, så
      jeg verifiserte strengene og vilkårene i stedet. Åpne én PDF og se at 6,5 pt-linja under
      romtegningen er lesbar.
- [ ] **Eiendomsgrenser er kun raster** (i kartbildet) — det går ikke å snappe til dem. Vil du ha
      dem som vektor, blir det en «003b» mot Teig-WFS. Midlertidig valg: raster holder.
- [ ] **«Bytt bygg» ligger i ⋯-menyen**, ikke som klikk i lerretet. Midlertidig valg: menyen —
      hit-test-kaskaden er ømfintlig og et nytt lag der er reell regresjonsrisiko.
      `_geoHitCandidate` finnes og er testet hvis du vil ha klikket.
- [x] **Standard utsnitt:** 80 m, med valg 60/80/120 i dialogen. Som foreslått.
- [x] **Eiendomsgrenser som standard:** ja, på. (Tegnes av Kartverkets egen WMS, grønt — ikke
      oransje som antydet; det er deres farge, og å overstyre den krever egen vektorkilde.)
- [x] **Terrengskygge:** av som standard. Målt til ~1,6 s ekstra ved 1600 px, og laget er ikke
      cachet — antakelsen «1–3 s» i denne lista stemte.

### Fra 004

- [ ] **400 m²-terskelen for DOM1-omriss er tunet for eneboliger.** I Oslo sentrum fikk ALLE
      omriss confidence 0,3 fordi byggene der faktisk er 900–1600 m² — altså falskt varsel for
      legitimt store bygg. Midlertidig valg: beholdt 400 m² som prompten sa. Alternativ: la
      terskelen avhenge av Matrikkelens `bygningstype` (enebolig 111 → 400 m², kontor/butikk
      311/322 → 3000 m²). Si fra om du vil ha det.
- [ ] **DOM1-omrisset er ~26 % større enn veggomrisset** (takutstikk — målt mot INSPIRE-fasit,
      IoU 0,724). For TAKvarme er det strengt tatt riktigere enn veggen; for BAKKEareal er det
      for stort. Midlertidig valg: samme omriss brukes til begge, med ⚠ og confidence 0,5, og
      brukeren kan rette det i 006. Alternativ: krympe DOM1-omriss med ~0,4 m når det brukes som
      bakkeareal. Trenger din fagvurdering.

### Fra 001

- [ ] **Kontakt-e-post i User-Agent.** Kartverket ber om en identifiserbar klient. Midlertidig
      valg: `varmeplan-roof/0.1 (+kontakt@varmeplan.no)` i `ROOF_USER_AGENT`. **Er det en adresse
      som faktisk leses?** Hvis ikke, oppgi riktig — det er den de kontakter hvis vi lager for mye
      trafikk, så feil adresse betyr at vi blir blokkert uten forvarsel.
- [ ] **Docker er ikke installert på maskinen** → `Dockerfile` er skrevet, men *aldri bygget*.
      Fly bruker remote builder, så `fly deploy` vil fungere uten lokal Docker — men første deploy
      er også første gang dockerfila kjøres. Midlertidig valg: ingen apt-pakker (alle wheels er
      manylinux med bundlede GEOS/PROJ/GDAL). Klager bygget på en manglende `.so`, legg den til
      i `Dockerfile` og noter i endringsloggen.
- [ ] **`mypy` utelatt** (lumelo har det). Midlertidig valg: `ruff` alene. Si fra hvis du vil ha
      typesjekk på denne tjenesten også.
- [x] **`rasterio`-wheel:** installerte rent på Python 3.12 — `tifffile`-reserveplanen fra 001
      er ikke nødvendig. Ingen systempakker kreves.
