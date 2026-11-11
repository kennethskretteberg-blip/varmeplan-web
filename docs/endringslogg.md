# Endringslogg — Romtegner

Kronologisk logg over arbeid i `romtegner.html`. Nyeste øverst.

---

## 232 — Varmefolie i PDF: motstandsmålingen på egen side, «Nom. motstand» på romsiden, folieareal i tabellen (11.11.2026, `HASH232`, `main`, ikke pushet)

Kenneth 11.11.2026. **Endret:** utregningsblokken «Motstandsmåling – varmefolie» står ikke lenger under hvert rom; romsiden har nytt felt «Nom. motstand» i «Areal, effekt og dekning» (til høyre for «Total effekt», bare rom med folie, også når tabellsiden ikke er valgt); tabellsiden viser «Folieareal (m²)» i stedet for «Folie (m)» og har ETT «Eksempel på utregning – [rom]» nederst (samme blokk som før, `_drawResistanceBlock`), for folierommet med flest ulike bredder (`_foilResistanceExample`); forhåndsvisningen i dialogen viser det samme. Arealet bruker databasens bredde (`netto_width_mm`, lik `width_mm`), som er 1 cm under navnet for alle FlexFoil – areal × 60 ligger derfor 0,7–5,0 % under W/m (B=140 … B=20); arealet er ikke justert, forklaringslinja sier «ca. 60 W/m²». Testprosjekt (fire folierom + ett uten): eksempelet valgte Kontor (B=20/40/100), største avvik areal × 60 mot effekt −2,5 % (Gang). Ny `_foilPdfRegressionTest232` 57/57; `_foilResistanceRegressionTest` bevisst skrevet om 52 → 59; suiten 99 tester, de samme sju røde uten innlogging. Effektformel, grenser, kabel/matte og skjermen urørt. Se `docs/232/RAPPORT.md`. **Ikke rettet:** foliebredden i databasen (1 cm under navnet); jsPDF måler «×» for smalt, så en hevet toer etter flere «×» havner oppå neste tegn (`_pdfSuperscriptPatch`) – omgått i ordlyden; forhåndsvisningsfeltet sentrerer høyt innhold så toppen kuttes (rettet bare for motstandsmålingen); `_noteH`/`_frysH` er ubrukte på romsiden. Åtte spørsmål i `docs/232/SPØRSMÅL.md`.

---

## 230 — Trapp i PDF: én hel plantegning, 300 DPI, samme målestokk som sidevisningen (10.11.2026, `cead1dc`, `main`, ikke pushet)

Kenneth 10.11.2026: én tegning ovenfra som viser hele trappa og tåler innzooming, sidevisningen beholdes, detaljutsnittene bort, plan og side i samme størrelsesforhold. **Endret:** trappesiden i `exportPDF` får ÉN plan (ingen bånd) og ÉN sidevisning fra `_renderStairPdfImages`; `_stairPdfLayout` velger stående/liggende side, om planen roteres (lang trapp langs liggende side, trinn 1 til venstre, teksten vannrett) og den største felles målestokken, rundet ned til vanlig verdi (`STAIR_PDF_SCALES`, minst 66 % av størrelsen beholdt). Tegnerne `_stairDrawToCanvas`, `_stairDrawToCanvasHs` og `_stairDrawSideToCanvas` har fått utskriftsmodus `opts.print` (300 DPI på trykt størrelse, lengste side høyst 8000 px, luft i mm på papiret, mål etter 226-regelen: 2,0 mm, mørk grå, hvit boks); uten `opts.print` tegner de som før. Bildene settes inn i naturlig størrelse som PNG med Flate, med «Målestokk 1:N (A4)» under hver. Detaljutsnittene er byttet ut med teksttabellen «Kabel per flate» (`_stairDetailRows`: Flate | Strenger | CC | Kabel (m)), samme gruppering og regning som billedtekstene. **Tall (før → etter):** kort rett 3 → 2 sider, 1:15, 6,85 → 0,15 MB; lang rett (forhold 9, tre bånd før) 4 → 3 sider, 1:40, 9,17 → 0,21 MB; med repos 5 → 3 sider, 1:20, 8,93 → 0,23 MB; hestesko 2 → 2 sider, 1:25, 6,25 → 0,11 MB. De gamle PDF-ene var store fordi trappebildene lå ukomprimert. **Tester:** ny `_stairPdfRegressionTest230` 121/121; suiten 98 tester, de 97 gamle som HEAD (samme sju røde uten innlogging). **Ikke rettet:** kabelmålene for bredde står oppå trinn 2; forhåndsvisningen i eksportdialogen viser gammel tegning; hesteskoens sidevisning blir 63 × 37 mm i felles målestokk; seks gamle bånd-/utsnittsfunksjoner brukes bare av testene. Før/etter i `docs/230/`. Se `docs/230/RAPPORT.md` og `docs/230/SPØRSMÅL.md`.

---

## 229 — Ukentlig kryptert sikkerhetskopi av Varmeplan på Macen (10.11.2026, `main`, ikke pushet; ingen endring i appen)

Bakgrunn: Supabase Pro tar daglig backup en uke tilbake, men bare for hele databasen, uten PITR og **uten Storage**; eneste egne kopi var én `pg_dump` fra 03.11 på Skrivebordet. Nytt i `scripts/backup/` (`index.html` er ikke rørt): **`installer.sh`** – interaktivt på norsk; sjekker `pg_dump` (libpq) og at hovedversjonen er lik eller nyere enn serveren, spør om tilkoblingsstreng (Session pooler), service_role-nøkkel og krypteringspassord (to ganger, minst 12 tegn, ikke æøå) uten å vise dem, prøver begge mot Supabase, lagrer alle tre i macOS-nøkkelringen (tjeneste `no.varmeplan.backup`; via `security -i` med hex på stdin, aldri som argument), lar Kenneth velge ekstern disk fra `/Volumes` (bare navnet lagres, i `~/.config/varmeplan-backup/config`), kopierer skriptene til `~/.config/varmeplan-backup/bin/` (så kopien går uansett hvilken gren repoet står på), installerer LaunchAgent `no.varmeplan.backup` og tar første kopi gjennom launchd mens den følger loggen. **`ta-kopi.sh`** – `pg_dump -Fc` av `public`, `auth`, `storage` (faller tilbake til `public` + `auth` og sier det i manifestet), laster ned alle filer i alle bøtter rekursivt via Storage-API-et (1000 om gangen, mappestruktur og filnavn bevart byte for byte), skriver `MANIFEST.txt` (dato, Postgres-versjon, rader per tabell i `public`, `auth.users`, filer og byte per bøtte, SHA-256 av dumpen), pakker i AES-256-kryptert APFS-`.dmg` (`hdiutil -stdinpass`), **kontrollerer** (monterer skrivebeskyttet, `pg_restore --list`, SHA-256, filantall), legger den i iCloud Drive `Varmeplan-backup/` og på den eksterne disken hvis den er koblet til (ellers «Ekstern disk ikke tilkoblet» i varselet), rydder begge steder til de 8 nyeste + nyeste per måned i 6 måneder, sletter alt ukryptert også ved feil (`trap`), logger til `~/Library/Logs/varmeplan-backup.log` og sender macOS-varsel. Passord går som miljøvariabler/stdin/curl-konfigstrøm, aldri som argument eller i logg. **Tidsplan:** launchd spør hver kveld kl. 21:00 og ved innlogging; `--planlagt` tar bare kopi når det ikke finnes en vellykket kopi etter siste søndag kl. 21:00 – altså søndag 21:00, og ellers første anledning etterpå hvis Macen var av eller kopien feilet. **`GJENOPPRETTING.md`** (ligger også inne i hver kopi): åpne kopien, innholdet, hente ett prosjekt (`hent-prosjekt.sh` leser tabellen rett ut av dumpen uten database og lager `.json`, `-oppdater.sql` og `-rad.sql`), gjenopprette alt til nytt Supabase-prosjekt (`last-opp-filer.sh` for filene), sjekkliste over det som ikke er i kopien (Auth-innstillinger, SMTP/Resend, Edge Function-hemmeligheter, Vercel, domene), feilsøking. **`avinstaller.sh`** fjerner LaunchAgent og (etter spørsmål) nøklene; kopiene blir liggende. **Testet** (`bash scripts/backup/test/torrkjoring.sh`, 81/81, `/bin/bash` 3.2, stier med mellomrom): `bash -n` på alt, tolking av tilkoblingsstreng, lagring/lesing i nøkkelringen (prøvenøkkel, fjernet igjen), full kjøring mot falsk Storage-tjener med falsk dump gjennom nedlasting (1203 filer i én mappe, æøå og mellomrom, én fil som mangler), manifest, kryptering (feil passord avvises), kontroll, kopiering til «iCloud» og «disk», rydding (40 gamle ukekopier → riktige 11), disk frakoblet, feil nøkkel / skrivebeskyttet mål / uleselig dump (alle rydder opp og avmonterer), `--planlagt`, lås, opplasting til tomt prosjekt, uthenting av ett prosjekt; LaunchAgent-fila validert med `plutil`. **Ikke testet:** ekte Supabase (ingen innlogging her), `pg_dump`, radtelling og `pg_restore --list` på en ekte dump (bare libpq er installert, ingen tjener – en uleselig dump blir riktig avvist), `installer.sh` interaktivt, launchd, iCloud Drive og personverntillatelsen der, varsler, `shellcheck` (ikke installert). Del D i veiledningen (full gjenoppretting) er skrevet, ikke prøvd – det står i veiledningen. `kjor-sql.sh` fra løp 168 fikk jeg ikke lese (utenfor mappa); libpq finnes via `finn_pg` i `felles.sh`.

---

## 228 — PDF: mål som kuttes i kanten av rombildet (10.11.2026, `09d5c7b`, `main`, ikke pushet)

Kenneth 10.11.2026 (P0402 «Kjøkken», side 3): den loddrette målkjeden var kuttet av bildekanten, og målestokken overlappet nederste kjede. **Årsak:** utsnittet regnes i cm (luft `_pdfRoomPadCm`, eller lagret `room.pdfView`), målteksten etter 226 i mm på papiret, og ingenting sjekket at teksten fikk plass. Auto-utsnittet kutter ikke i et 3 × 3 m rom (målt, også Ekstra stor); et lagret utsnitt gjør det. P0402 er ikke åpnet (ingen innlogging), så at Kjøkken har et lagret utsnitt er sannsynlig, ikke bekreftet. **Endret:** `_renderRoomToImage` fanger hver tekstboks mens den tegner (`_pdfCap`, blokken «228 · INGEN MÅLTEKST KUTTES AV BILDEKANTEN»); rommets egne mål sjekkes mot lerretet, og utsnittet flyttes/zoomes ut akkurat nok (`_pdfDimFitSolve`) før det tegnes på nytt. Auto: alltid. Lagret utsnitt: bare når endringen er høyst 20 % zoom og 20 % av bildebredden – forhåndsvisningen viser «Utsnittet ble justert så målene får plass», det lagrede skrives ikke over. Krever det mer (detaljutsnitt), står utsnittet urørt og forhåndsvisningen sier hvor mange mål som står delvis utenfor. Målestokken tegnes i målenes papirstørrelse (2,0 mm) i første ledige hjørne/kantfelt, 20 eller 10 cm når 50 ikke får plass, og utelates når ingenting er ledig (`_pdfDrawScaleBar`). Forhåndsvisningen regner hjul og dra fra det lagrede utsnittet. Bildestørrelse, aspekt og sideantall uendret; skjermen urørt. **Tester:** ny `_pdfDimFitRegressionTest228` 83/83; suiten 97 tester, 90 grønne, samme sju røde som HEAD; `_pdfPreviewRegressionTest` B2 måler nå mot det lagrede utsnittet. **Ikke rettet:** veggetiketter delvis skjult bak produktetiketter; frittstående mål og naborommenes mål kan fortsatt kuttes; plantegningen per etasje urørt. Før/etter i `docs/228/`. Se `docs/228/RAPPORT.md` og `docs/228/SPØRSMÅL.md`.

---

## 225 — Flater, farger og ryddigere verktøylinje (09.11.2026, `ca4731c`, gren `design/varmeplan-stil`, ikke pushet; løp serie-223-design, kun design)

Designanalysen 09.11.2026 pkt. A/B/D. **Tokens:** lyst tema (`body.light-theme`) etter Flow Busbars `tokens.css`-oppskrift — `--bg #f5f7fa`, `--surface #fff`, `--surface2 #f2f4f7`, `--border #e3e8ef`, ny `--border-strong #cbd3e0`, `--text #0f1729`, `--muted #45506b`, `--dim #5d6c87` (løftet fra `#8890a4`, 3,2 → 5,3:1), statusfarger som Flow med Varmeplans semantikk (`--success #1e7a4d`, `--danger #c2341f`, `--warn #9a6b08` rav, `--info` som før) med `--*-soft`-flater, `--on-accent #fff`, `--accent-soft`, `--shadow-sm/-md`; **aksenten `#0891b2` er uendret (Varmeplans turkis)**. Mørkt tema: bare `--dim` løftet (`#555d6e` → `#7b849a`, 2,8 → 4,9:1) og de nye tokens lagt til, ellers urørt. Udefinerte `--fg/--panel/--hover/--brd` (53 + 118 bruk) er nå alias til `--text/--surface/--surface2/--border` **på `body`** (ikke `:root` — `var()` løses der den defineres). Toppstripa har egne `--tb-bg/--tb-fg/--tb-line`; mørkeblå Flow-stripe = tre CSS-linjer, oppskriften står som kommentar «225 · TOPPSTRIPE». 35 hardkodede farger i CSS-blokken byttet til tokens (mørk tekst på aksent, cyan-tinter, skygger på flytende kort, ok/avbryt i vegg-for-vegg); ≈ 160 står igjen. **Flater:** `#content` grå med 6 px luft, `#sidebar` og `#canvas-wrap` hvite kort med 1 px kant, 8 px radius og `--shadow-sm` (Flows `.ws-panel`); flytende paneler/menyer hvite med `--shadow-md` og 8 px radius; presentasjon/kundelenke/innebygd modus og utskrift uten ramme som før. Tegneflaten 14 px smalere/lavere — klikk → verden 0 cm avvik. **Verktøylinja:** samme knapper/rekkefølge/tekst; 32 px høye (var 44), 13 px tekst (var 12), kvadratiske 32 px ikonknapper, skillelinjer `--border-strong` 22 px, valgt knapp fylt `--accent` med `--on-accent` (gjelder alle `.snap-chip.on`/`.tool-chip.act`); rulling fra 1292 px (før 1306), ved 1280 px er 12 px av «+» utenfor (før 26) — ingenting som var synlig er borte; høyden 56 px står. De to «Flytt»-knappene ikke døpt om (beskrevet i `docs/225/SPØRSMÅL.md`). **Kontrast** lyst etter: text 17,9, muted 8,0/7,5/7,3, dim 5,3/4,9/4,8, warn 4,7, success 5,3, danger 5,5, info 5,2 (alle ≥ 4,5); hvit på aksent 3,7 (UI-komponent-nivå; spørsmål). PDF bit-identisk med etter 226 (SHA-256 på rom 31/32, plantegning og hele PDF-en, også med mørkt tema på skjermen). Ny `_designRegressionTest225` 27/27; suiten 95 tester, 88 grønne, sju røde som HEAD (innlogging/karttjeneste). `_takRegressionTest220` gikk 43/44 etter 225: probepunktet for k8 lå på en 50 cm-rutenettlinje som tegnes over takflaten og havnet på en hel piksel da lerretet ble 14 px mindre (HEAD feiler likt med 14 px mindre vindu) — probepunktene flyttet 25 cm langs kantene, 44/44. Skjermbilder før/etter lyst + mørkt (dashbord, prosjekt med folie/kabel/hindring, tak, PDF-forhåndsvisning, verktøylinje 2× og 1280 px) og mørkeblå variant i `docs/225/`. Se `docs/225/RAPPORT.md`.

---

## 224 — Inter-skrift og skjul-knapp på venstrepanelet (09.11.2026, `cd4cf2a`, gren `design/varmeplan-stil`, ikke pushet; løp serie-223-design, kun design)

Designanalysen 09.11.2026 pkt. C/E. **Skrift:** Inter (400/500/600/700, samme Google Fonts-`<link>`) er `--font-ui` og lerretsskriften (`CANVAS_UI_FONT`/`CANVAS_NUM_FONT` ved `BASE_SCALE`, begge Inter — bytte til systemskrift er de to linjene); Space Grotesk bare i logoen (`.np-logo`, `.tb-logo`); IBM Plex Mono bare i tallfelt der man skriver inn mål (`.wbw-inp`, kalibrering, trapp, inline-redigering, `kbd`). 112 `ctx.font`-linjer byttet fra hardkodet `'Space Grotesk'`/`sans-serif`/`system-ui`/`DM Sans|Mono` til konstantene — **ingen størrelse endret** (PDF-målene fra 226 står); `document.fonts.ready`/`loadingdone` → `markDirty()`. Minste lesetekst 12 px: 87 steder i CSS og 756 inline-stiler (10–11,5 → 12 px), uppercase-overskrifter minst 11 px, ikonklasser og 8 px-piler unntatt; `LABEL_MIN_PX` 13 står. Like brede sifre (`tabular-nums`) i sidepanel, statuslinje, ctxbar, tabeller og de 15 visningsklassene som var Plex Mono. Etiketter: Inter er 1,5–2 % bredere (bold 4,5 %); alle tekster tegnet på lerretet i fire utsnitt er identiske mengder før/etter; hesteskotrappens CC-kjede slår tre «9» sammen til «3 × 9» ved skala 1,5/3 (malerens regel 2) — test 186.2 godtar nå begge former. PDF: rombildene står nøyaktig likt (samme bbox), bare glyfene er Inter; 7 sider, 755 → 773 kB. **Skjul-knapp:** `‹` øverst til høyre i `#sidebar` (`#sb-collapse`, `_sbToggleCollapse`, blokken «224 · SKJUL VENSTREPANEL»); `body.sb-collapsed` → 28 px stripe med `›`, dra-håndtak skjult, bredden fra før urørt i `style.width`; husket i `localStorage` (`varmeplan_sb_collapsed`), aldri i prosjektet; «Skjul venstrepanel»/«Vis venstrepanel»; presentasjon/app-innebygging som før; ingen hurtigtast. Tegningen står stille: lerretet vokser Δ mot venstre, `panX` flyttes Δ/2 — klikk → verden 0 cm avvik ved dpr 1 og 2, standard og 420 px panel, etter skjul og vis. `_savePrefs` lagrer bredden fra før (ikke 28) når panelet er lagt ned; arbeidsflyt-panelet dokkes til høyre for stripa med bredden fra før. Ny `_designRegressionTest224` 22/22; suiten ellers lik HEAD (sju røde uten innlogging som før). Funn ikke rettet: `_savePrefs` lagrer `sidebarWidth: 0` når `#app` er skjult (→ 180 px neste gang; fantes før); rom-lista overlapper areal/ikoner ved smalt panel (før og etter); tall på lerretet har proporsjonale sifre (Canvas kan ikke slå på `tnum`). Skjermbilder før/etter i `docs/224/`. Se `docs/224/RAPPORT.md`.

---

## 223 — Skarp tegneflate på Mac/retina og nytt rutenett (09.11.2026, gren `design/varmeplan-stil`, ikke pushet; løp serie-223-design, kun design)

Designanalysen 09.11.2026: `resizeCanvas()` satte `canvas.width = wrap.clientWidth`, så på Mac (devicePixelRatio 2) ble lerretet tegnet i halv oppløsning og blåst opp — alle streker, rutenett og tekst ble myke. Nå er bufferen `CSS-størrelse × dpr` (dpr begrenset til 2, lyttes på med `matchMedia` når vinduet bytter skjerm), `render()` setter `ctx.setTransform(dpr,0,0,dpr,0,0)` først, og all geometri leser den **logiske** størrelsen `_cvW()/_cvH() = canvas.width / _cvDpr` (60 lesesteder byttet; w2s/s2w/_evToCanvas gir nøyaktig samme verdenskoordinater som før — målt identisk mot HEAD ved dpr 1 og 2, også med bredere sidepanel). Valget «logisk størrelse avledet av bufferen + én skala» framfor egne variabler: da kan koden som setter `canvas.width` direkte (PDF-bildene `_renderRoomToImage`/`_renderFloorToImage`/`_takSectionToImage`, tester) fortsette med det — de setter `_cvDpr = 1` og tegner 1:1 som før (PDF-bildene bit-identiske med HEAD: 2126 px, samme plassering, PDF 735 783 byte; 226-målene uendret). Tegningen uten rutenett er bit-identisk med HEAD ved dpr 1 (rom, folie, kabel, matte, hindring, mål, trapp, tak). Tid per bilde uendret (64 rom, 202 baner, 22 kabler: 27,8 ms oversikt, 3,7 ms normal, 2,7 ms tett, begge versjoner, dsf 1 og 2). **Nytt rutenett** (`drawGrid`, `_gridSteps`) etter Flow Busbar-regelen: hoved 1 m (5 m når 1 m < 12 px), fine 10 cm ved ≥ 6 px, ellers 50 cm ved ≥ 8 px, ellers ingen; faste farger fra CSS-variablene `--grid-fine/--grid-major/--grid-axis` (lyst `#edf0f5/#d9dee7/#b9c3d1`, mørkt `#141720/#20242d/#323848`), akser x=0/y=0 i egen farge, linjer på hele fysiske piksler (bredde `round(dpr)`), egen lerretsbakgrunn `--canvas-bg` `#fbfcfd` i lyst tema (mørkt som før). Snapping (`GRID`/`SUBGRID`/`AGRID`), «Raster»-knappen og målestokken urørt. Ny `_canvasRegressionTest223` 24/24 ved dsf 1 og 2. Port 4010 er fortsatt Python-serveren; 4013 brukt. Skjermbilder før/etter i `docs/223/`. Se `docs/223/RAPPORT.md`.

---

## 226 — Lesbare mål på rommene i PDF-en (09.11.2026, gren `design/varmeplan-stil`, ikke pushet; løp serie-223-design)

Kenneth 09.11.2026: «Målene på rommene i PDF-en er for små og for svake … blir de uskarpe.» Veggmål, målekjedene (folie/kabel/matte, også skjeve), brukerens mål og veggetikettene «V1 400 cm» ble tegnet med 10–11 px skrift og 0,5–1,2 px streker i skjermpunkter — i et 2126 px bredt bilde over 180 mm er det 0,85 mm tekst og hårstreker; hindringsmålene (217) hadde egen 1,2 mm. Ny felles hjelper `_dimPdfStyle()` (ved `_labelFontCm`, samme regel som produktetikettene): i PDF-modus 2,0 mm × `pdfLabelScale` (`DIM_PDF_MM`; minste 1,6 mm ved 217-krymping), streker 0,2/0,15 mm, endemerker 1,5 mm, heldekkende mørk grå `#374151` (rødt beholdes, heldekkende) og hvit boks bak teksten; utenfor PDF-modus `null` → skjermen er bit-identisk (målt, fire rom med alle måltyper). Ingen mål er flyttet; tekstløft, stiplinger og luft skalerer med skriften. Romsidene og plantegningen lagres nå som **PNG** med Flate (`_pdfImgEncode`, `addImage(…,'PNG',…,undefined,'FAST')`) — ⚠ uten Flate-flagget legger jsPDF pikslene rå (67 MB); målt 719 kB mot 695 kB JPEG for fem sider, +0,2 s per side. Målt skrifthøyde: 2,0 mm (tall 1,44 mm) ved Normal, 3,0 mm (2,2) ved Ekstra stor; Ekstra stor gir kollisjoner mellom korte kjedesegmenters tekster og mellom hindringsmål i små hindringer (ikke rettet, bilder i `docs/226/`). Tester: `_hindDimRegressionTest217` J endret til felles størrelse (24/24), `_pdfPreviewRegressionTest` D2/D3 følger ny bokshøyde (96/96); suiten ellers lik HEAD. Trapp og tak urørt. Punkt 5 (ekte `doc.text` oppå bildet) undersøkt, ikke bygget — se `docs/226/RAPPORT.md`. Port 4010 var en gammel Python-server; egen server på 4013 (spørsmål).

---

## 220 — Prosjektstatus: ny status Grossist (kun prosjektering for grossist, ingen pris fra oss) (09.11.2026, `main`, ikke pushet, **SQL ikke kjørt**)

Kenneth 09.11.2026: «et nytt valg som heter "Grossist" … prosjekter hvor vi kun tegner/prosjekterer for grossistene. De gir pris til elektrikerne selv.» Ny salgsstatus `grossist` («Grossist», lilla `#a855f7`) sist i `SALES_STATUSES`; kan velges i chipen på raden, i masseendringen og i kundekortet, filtreres på (nedtrekket: etter Tapt) og vises som chip. `_filterProjectsList` leser nå statuslista i stedet for en egen kopi. Statusen lagres i Supabase-kolonnene `romtegner_projects.sales_status` / `project_org_status.sales_status`, som begge har en CHECK på de fire gamle verdiene → ny **additiv** migrasjon `supabase-migration-grossist-220.sql` (slår opp begrensningen i `pg_constraint`, legger bare til verdien) — **må kjøres i SQL Editor før Grossist kan lagres**; før det avviser databasen verdien, og `_plStatusErrText` sier nå hvilken fil som må kjøres. Ingen eksisterende status endret; priser og tellere urørt (spørsmål). Feltappen legger Grossist i «Prosjektert» uten feil. Ny `_grossistRegressionTest220` 30/30. Se `docs/220-grossist/RAPPORT.md`.

---

## 219 — Hindring: enklere meny — Vegg til vegg, Polygon og Mål B×H, uten ferdige navngitte valg (09.11.2026, `main`, ikke pushet)

Kenneth 09.11.2026: «Vi trenger ikke så mange valg her. Ta bort alle navnene.» Menyen «Sett inn hindring» hadde fem typekort (Kjøkkenøy, Innebygd skap, Pipe, Vegg / søyle, Annet) og fire knapper i bunnlinja. Nå: navnefelt (valgfritt, gjelder alle), to store knapper **Vegg til vegg** og **Polygon** i full bredde, og **Mål** med B og H i cm og én knapp **Sett inn** (Enter i feltet gjør det samme); bunnlinja har bare Avbryt. Tomt/0/minus/bokstaver → feltet markeres rødt, ingenting settes inn. Tegneverktøyene er urørt; det skjulte fjerde valget (tomme felt startet rektangel-tegning) er ikke lenger nåbart fra menyen. `label` er nå det brukeren skrev — tomt felt gir `''` og ingen tekst på tegningen (før: «Annet»); `_hindDisplayName(h)` samler de seks visningsstedene, gamle prosjekter med navn vises som før, PDF/panel/advarsel bruker reserveordet «Hindring». Datamodellen uendret (`type` alltid `'annet'` for nye). Typen styrte ingenting i utregningen (målt). Ny `_hindMenuRegressionTest219` 23/23; `_dialogRegressionTest216` 197/197. Se `docs/219-hindring/RAPPORT.md`.

---

## 218 — Hindring: kan starte og slutte på samme vegg, lukkes langs veggen (09.11.2026, `main`, ikke pushet)

Kenneth 09.11.2026: «en pipe midt på en vegg — klikk på veggen, to klikk for hjørnene og siste klikk tilbake til veggen». Klikk 4 på startveggen ble avvist med alert («må gå mellom to forskjellige vegger»); uten avvisningen ville delefunksjonen gått rundt hele rommet begge veier. Nå lukkes hindringen rett langs veggen mellom siste og første klikk (polygonens egen lukkekant er veggen), uten «velg halvdel»; knekk (flere hjørner) virker likt. Hjørnene snapper også vinkelrett/parallelt med startveggen (`_hindW2WAngleSnap`, identisk med før på rette vegger), siste klikk projiseres på veggen fra siste hjørne, grønn forhåndsvisning av lukkingen med lengder. Ulike vegger, andre tegnemåter og utlegget urørt. Ny `_hindW2WRegressionTest218` 22/22 med ekte klikk; hele suiten lik HEAD. Se `docs/218-hindring/RAPPORT.md`.

---

## 217 — Hindring: målene står inne i hindringen, ikke over kabel og folie (09.11.2026, `main`, ikke pushet)

Kenneth 09.11.2026: «målene vises på utsiden og legger seg over varmekabel og varmefolie». `autoDimHindrings` la hvert mål 20 cm utenfor siden. Nå: samme `room.dims`-objekt med `hid` og offset innover (10 cm, maks en tredel av dybden); plasseringen regnes ved tegning i `_hindDimLayout` (delt av tegning, klikk-treff og gizmo): tekst på streken, alt innenfor omrisset og ikke over navnet; for liten → krymp (skjerm 11→8 px, PDF 1,2→0,9 mm × labelstørrelse) → utenfor som før, og for et rektangel bare den siden med minst kabel/folie/matte under teksten. Teksten leses fra bunnen eller høyre. Gamle mål migreres ved åpning (`_hindDimMigrate`). Rom-/veggmål, utlegget og avstandslinjene urørt. Ny `_hindDimRegressionTest217` 23/23. Se `docs/217-hindring/RAPPORT.md`.

---

## 216 — Dialoger: fast bunnlinje med knapper, bare innholdet scroller, aldri høyere enn vinduet (09.11.2026, `main`, ikke pushet)

Kenneth 08.11.2026: «valgknappene blir borte i bunnen … på flere steder». Eksporter PDF hadde en 80vh-deling inni en 80vh-boks med en 57 px topp over seg — knappene lå nederst i venstre kolonne og var alltid kuttet. Felles struktur `.vp-modal` / `__head` / `__body` / `__foot` (max-height mot `100dvh − 32px`, topp og bunn faste, bare innholdet scroller); `.modal` i `#modal-ov` er nå en flex-kolonne med `.modal-body` rundt feltene (bokshøydene målt identiske med før). 34 dialoger lagt om: Eksporter PDF, de ni faste, Innstillinger, Excel-import, Snøsmelting, Frostsikring, Be kunde om mål, Del presentasjon, Del med elektriker, Kunde & prosjektinfo, PDF-sidevelger, Importer tegning, Hva er vegger?, begge trappebyggerne, Tilbehør, Ny kunde, Forslag til kundenumre, Gi kunden tilgang, Kopier til Visma, Hent fra kart, matte-panelene og kundelenkas «Om rommet». Ingen tekster, rekkefølge eller logikk endret. Ny `_dialogRegressionTest216` + `docs/216-dialoger/probe/maal.mjs` (1366×650, 1280×720, 1440×900, 1024×600). Se `docs/216-dialoger/RAPPORT.md`.

---

## 219 — 3D fase 0: motoren som bygger taket fra prosjektets egne data (08.11.2026, `main`, ikke pushet)

Ny fil `varmeplan-3d.js` med `byggTak`, `maal` og `tegnScene` (three.js 0.160.0, lastes først når 3D åpnes). `index.html` er urørt. Forhåndsvisning på `docs/3d/forhandsvisning.html`. `docs/3d/test-3d.mjs` sammenligner med den ekte 2D-motoren, skåret ut av `index.html`: 640 av 640, filmens bygg 110,15/80,15 m. Funn: L-formede skråtak har ingen lagret mønelinje og kan ikke reises. Se `docs/219/RAPPORT.md`.

---

## 218 — Tak: penselmodus for kantmerking (08.11.2026, `main`, ikke pushet)

«Merk som:» med fem typeknapper i steg 3, i verktøylinja og panelet. Ett klikk merker en kant, ett dra merker flere, og Esc eller samme knapp slår av. Menyen står som før. 8-kants L-tak: 16 klikk før, 12 med klikk, 8 med dra. Ny `_takRegressionTest218`. Se `docs/218/RAPPORT.md`.

---

## 217 — Rydding: STATUS.md à jour, og `S.geo` tømmes ved nytt prosjekt (08.11.2026, `main`, ikke pushet)

`_resetProjectState` setter nå `S.geo = {}`. Før arvet et nytt prosjekt forrige prosjekts adresse, kandidater og valgte bygg, og «Opprett prosjekt» lagret dem i det nye prosjektets JSON. Ny `_takRegressionTest217`. Se `docs/217/RAPPORT.md`.

---

## 215 — Tak: snøfanger som grense, og varmet felt mellom takkant og snøfanger med c/c regnet av flateeffekten (08.11.2026, `main`, ikke pushet)

- Nytt objekt `SNOW_GUARD` (`sf<n>`) i `S.tak[fid].features`, lagt på en takfot som rennestrekket. `offset_m` har standard 0,50 m, merket «Kenneths regel 08.11.2026, ikke fra datablad». Snøfangeren har ingen løp og ingen kabel.
- Valgfritt felt (`g.field`): areal = lengde × avstand, regnet med `_takFlatCalc` fra 212. Ingen standard W/m². Kabelen ligger i `t.guard_cable`, ikke i `t.flat`.
- Linja ligger inne på taket: avstand × cos(takvinkel) i plan. Omrisset avgjør hvilken side som er innover.
- `_takCableRows`/`_takCableSummary` ser aldri snøfangeren. Egen sum, «Felt mot takkanten».
- Trukket ut uten endret oppførsel: `_takEdgeOverlap`, `_takCableResolve`, `_takCableSnapshot`, `_takCableSelectHtml`, `_takFlatCalcHtml`.
- Svar på 209 spm. 9 er skrevet i `docs/209/SPØRSMÅL.md`. Ny test: `_takRegressionTest215`.

---

## 214 — Tak: stegveiviser i fire steg, kontrollmål, «gjør om til tegning» uten kart, og menyer som bare viser det som gjelder (08.11.2026, `main`, ikke pushet)

- Tak-panelet viser ett åpent steg om gangen (`_takWizardHtml`), med en linje som sier hvor du er og hva som mangler. Appen hopper ikke og sperrer ikke. Åpent steg er visning (`_takStepOpen`), aldri lagret; ved åpning avledes det av prosjektet (`_takStepDerive`).
- `_takCardHtml(fid, only)`: uten `only` som før, med `only` bare det steget.
- Kontrollmål: `M`/`D` i tak-delen, rom-modulens verktøy, snapper til omrisset, ligger i `_takCheckDims` utenfor `S` og lagres ikke.
- «Gjør om til tegning»: `t.asDrawing`, `bg.visible = false`, `fitAll`, steg 3. «Vis kart» henter kartet tilbake. Nabobyggenes omriss skjules med kartet (bare tak).
- Verktøylinja følger steget. Statuslinja viser ikke R/M/P/L/W i tak-delen, og tastene R/P/L/W er av der.
- Ny `_takRegressionTest214` 74/74; de 80 andre som HEAD; rom/snø/trapp 43/43 like med HEAD. 206–210, 212, 213 kjører med hele kortet (`_takWizardWhole`). Rapport i `docs/214/RAPPORT.md`, ti spørsmål i `docs/214/SPØRSMÅL.md`.

## 212 — Tak: flatt tak med sluk, gradrenner og varmefelt; c/c og kabelmeter regnes av flateeffekten og kabelens W/m (07.11.2026, `main`, ikke pushet)

- Flatt tak (`roof_type = 'flat'`) får et eget kort i Tak-modulen: kabel fra produktkatalogen (W/m leses derfra), «+ Sluk», «+ Gradrenne», «+ Varmefelt» og «Hele takflaten». Samme modul. Alt ligger i `S.tak[fid].flat`, ikke i `t.features`, så ingen skråtakslogikk (206–210) ser det. Uten flate objekter finnes ikke `flat`.
- c/c regnes: `c/c = W/m ÷ W/m²`, `kabelmeter = areal × W/m² ÷ W/m`, `løp = dekket bredde ÷ c/c`. Regnestykket står i panelet («30 W/m ÷ 300 W/m² = c/c 10 cm · 6 løp over 60 cm · 48,00 m»). Tom W/m² → «flateeffekt ikke satt», ingen kabelmeter. Ingen anbefalt W/m², ingen kurslengdegrense.
- Sluk ≠ nedløp: ring rundt sluket (2 × 2π × 0,40 m, radien fra Cenikas film, redigerbar) + «Ned i røret», tomt som standard. Tomt = «1 sluk mangler rørlengde» og «≥» foran summen. Nedløpsmodellen fra 206/213 brukes ikke.
- Gjenbruk: formelen er rommenes (`W/m² = W/m × 100 / CC`) snudd (`_ccCmFromWm2`); grensene er `_ccLimits`/`_ccWarnText` (016) og 159-advarselen, hvis kjerne er trukket ut i `_wm2OverCore` (romteksten uendret, `_wm2OverWarnTest` 9/9). Tak bruker utendørs-taket 450 W/m².
- Tre oppsett med kabelmeter før valg: «1 · Sluk», «1 + 2 · Sluk + gradrenner», «1 + 3 · Sluk + varme på taket». Er både 2 og 3 tegnet, ingen sum før valg (antakelse: de utelukker hverandre, spm. 1).
- Kontroll: 30 W/m / 300 W/m² → c/c 0,10 m; 800 m² → 8000 m begge veier; 60 cm → 6 løp; ni sluk → 45,24 m.
- Ny `_takRegressionTest212` 70/70; de 79 andre like med HEAD; skråtak og tomt prosjekt bit-identiske med HEAD (lagring, panel, sum, lerret). Rapport i `docs/212/RAPPORT.md`, ti spørsmål i `docs/212/SPØRSMÅL.md`.

## 211 — Tak: tegn bygget over en plantegning eller for frihånd, med høyder og taktype satt manuelt (07.11.2026, `main`, ikke pushet)

- Uten omriss viser Tak-kortet tre veier: 1 Finn bygget fra adressen (204, standard), 2 Tegn over en plantegning, 3 Tegn for frihånd. For nybygg som ikke finnes i Kartverkets data.
- Ingen ny tegnemotor: plantegning = rom-modulens polygonverktøy over rom-modulens bakgrunn (import, to-punkts-kalibrering / fast målestokk), frihånd = vegg-for-vegg. `createRoom` i tak-delen leverer omrisset til `S.tak[fid].surfaces[0].footprint` (samme form som tjenesten) via `_takRoomDrawCommit`.
- Målestokken sperrer: plantegning kan verken startes eller fullføres før `_needsCalibration` er false; målestokken vises i panelet og lagres på omrisset (`prov.scale`). Kontroll: 25 × 10 m-tegning → 25,027 / 10,007 m (0,11 %), ekte klikk 25,010 / 10,031 m.
- Tegnet bygg: eget statuskort, «Høydene er oppgitt av deg, ikke målt». Høyder USER_DRAWN/1 med height_ref; gesims påkrevd (varsel, nedløp «? m» uten), møne bare for skråtak, terreng 0 som standard. Taktype aldri forvalgt; kantene kan ikke merkes uten den (melding i kort og toast).
- Funn (ikke rørt): med rastersnapp på snapper rom-modulens kalibreringsklikk til 50 cm i ukalibrert verden → 8 % feil målestokk (spm. 1).
- Ny `_takRegressionTest211` 64/64; 204 C/I endret til ny regel; de 78 andre like med HEAD. Rapport i `docs/211/RAPPORT.md`, spørsmål i `docs/211/SPØRSMÅL.md`.

## 210 — Tak: snitt gjennom takfoten med renneprofil, kabelløp, nedløp over og under bakken, og mål (07.11.2026, `main`, ikke pushet)

- «Vis snitt» på et nedløp (eller lista «Snitt gjennom takfoten» i panelet) viser et snitt nede til høyre på tegneflaten: takflate med vinkel og hengkant, renne Ø100 med løpene (bunn 90°, mot hengkant 40°), nedløp Ø80 med én tråd eller sløyfe, avlaster bøyd 90° med strips, terreng, strekning under bakken og hvor kabelen slutter (5 cm ut / frostfritt nivå). Detalj av renneprofilen og notater til høyre. × eller Esc lukker; rennestrekk uten nedløp gir snitt på midten.
- Mål i trappas stil: takfot over terreng, nedløp over bakken (fra takfot), under bakken, 5 cm, 0,16 m til rennesenter, utløp over terreng. Høyden brytes (bruddlinjer) — renne, rør og kabel i riktig forhold.
- Ingen ny formel: kabelmeter fra `_takDownpipeCable` (213), løp fra `segments[].run_pos` (207). Takvinkel: flatt 0 · brukerens `pitch_deg` (USER_CONFIRMED) · (møne − gesims)/avstand til mønet · ellers skjematisk.
- «Snitt som PDF»: én liggende A4-side, bildet tegnet på hovedlerretet og lest som JPEG. `exportPDF` ikke rørt (spm. 7).
- Ny `_takRegressionTest210` 49/49, de 77 andre like med HEAD. Rapport i `docs/210/RAPPORT.md`, spørsmål (med T9) i `docs/210/SPØRSMÅL.md`.

## 209 — Tak: takvindu, hindringer, «finn like», startpunkt for kabel og symboler i kursens farge (07.11.2026, `main`, ikke pushet)

- Nye typer i `S.tak[fid].features`: `SKYLIGHT` (v<n>) og `OBSTACLE` (h<n>) med bredde/høyde som `{value, prov}`, `prov.source = USER_DRAWN`. En hindring på et rennestrekk følger det (`gutter`, `at_m`) men deler ikke delstrekket; «Kabel må forbi» + tillegg per løp gir egen rad ⤳ i Kabelmeter.
- «Finn like»: speilinger/halv-rotasjon omrisset tåler, mønelinja og «neste i raden» — markerer felt, plasserer ingenting før klikk; ellers «Fant ingen like». Tynn uten takflater (spm. 1).
- `CABLE_START` (ett per tak), nede i et nedløp eller på et strekk: styrer rekkefølgen i Kabelmeter (`_takCableOrder`), endrer aldri kabelmeter (ni startpunkt testet).
- `_takKursColor` gir én farge per rennestrekk (r1 som før); nedløp, hindringer på strekket og startpunktet tegnes i den.
- Ny `_takRegressionTest209` 48/48, resten likt HEAD. Rapport i `docs/209/RAPPORT.md`.

## 208 — Tak: tilbehør telles av antall løp, to ferdige oppsett, bokser og avlastere i tegningen (07.11.2026, `main`, ikke pushet)

- `_takAccessories`: tilbehøret telles av hvor antall løp endrer seg. Oddetall kabeltråder i et innløp krever boks (den første = tilkoblingsboksen, resten T-forgrening). 1 løp i en ende = endeavslutning. Uten boks må nettet være én kabel. Avlaster per nedløp; klips «avstand ikke satt».
- Sammenhengssjekk: «Her endrer antall løp seg uten boks» i panelet og som rød ring i tegningen — ingenting rettes automatisk.
- `box: true` på nedløpet (avkrysning «Boks før nedløpet»). Knappene «Sammenhengende løp» (110,15 m · 0 bokser) og «Boks ved hvert nedløp» (80,15 m · 3 bokser) med forhåndsvisning.
- `TAK_ACCESSORY_TABLE` (fra IceFix-filmen, ikke bekreftet mot datablad) er bare kontroll i testen.
- Ny `_takRegressionTest208` 37/37. Rapport i `docs/208/RAPPORT.md`.

## 207 — Tak: ett eller to kabelløp per delstrekk, nedløp og gradrenne, med kabelmeter (07.11.2026, `main`, ikke pushet)

- `runs: 1 | 2` (standard 2) og `runs_src` på hvert delstrekk (`segments`), nedløp og gradrenne. Delstrekket lagrer også `run_pos` (to løp: bunn 90° + hengkant 40°, ett løp: bunn). Arves ved deling.
- Kabelmeter = lengde × løp (`cable_total_m`, avledet i `_takRecalc`); nedløp = kabelfeltet fra 206 × løp. `_takCableSummary` gir rader og sum; tabellen «Kabelmeter» i panelet, sum nederst.
- «1 | 2»-velger per objekt og hurtigvalg «Alle delstrekk 1/2 løp». Forhåndsvisningen viser kabelmeter mens du tegner. Tegningen viser «×1»/«×2».
- Ingen produkt, watt eller kursgrense: `TAK_CIRCUIT_LIMIT_M = null`, «Produkt ikke valgt. Kabelmeter er geometri.».
- `_restoreProject` regner avledede tak-felt ved åpning, så 206-tak får 2 løp.
- Ny `_takRegressionTest207` 39/39 (filmen: 80,15 / 110,30). Én 206-sjekk justert. Rapport i `docs/207/RAPPORT.md`.

## 206 — Tak: rennestrekk, delstrekk, nedløp og gradrenne med lengder (07.11.2026, `main`, ikke pushet)

- Nye objekter i `S.tak[fid].features` (§6.3): `GUTTER` på en takfot (`on_edge`, polylinje med z = gesimsen), `DOWNSPOUT` på et strekk (`gutter`, `at_m`) og `VALLEY_GUTTER` (topp/bunn, lagret én gang). Lengder regnes alltid av geometrien (`_takRecalc`).
- Rennestrekk: «Hele kanten» med ett klikk (verktøyet eller kantmenyen), eller «Fra–til» med to klikk. Bare kanter `_takEdgeTakesGutter` godtar. Flere strekk per kant er lov, overlapp avvises.
- Nedløpene deler strekket i delstrekk (`segments`, id `r1.1` …) med egen lengde. 207 setter løp der, og egenskapene arves når et delstrekk deles.
- Nedløp: `above_ground_m` (standard = gesimsen, merket som én verdi for hele bygget ±0,5 m), bryteren `continues_below_ground` og `below_ground_m` (standard 1,0). Etiketten viser «10,0 m» eller «10,0 + 1,0 m». Kabelfeltet `cable_m` = over + 0,05, eller over + under uten 5 cm (spørsmål 1).
- Gradrenne tegnes for hånd med topp = mønet og bunn = gesimsen som anslag, og lengden regnes i 3D.
- Ny `_takRegressionTest206` 59/59. Rapport i `docs/206/RAPPORT.md`.

## 205 — Tak: kanttyper med fargekode, forslag og retting (07.11.2026, `main`, ikke pushet)

- Kantene ligger nå på taket og ikke på flaten: `S.tak[fid].edges`. Delte kanter (mønet) lagres én gang, med `planes: [a, b]`. Tak fra 204 med `surfaces[i].edges` flyttes opp når de åpnes (`_takNormalize`).
- Fargene er takfot grønn, gavl grå, møne gul, gradrenne blå, parapet mørk grå og «ikke valgt» rød stiplet.
- Forslaget (`_takSuggest`, `AI_SUGGESTION` med lav confidence) gjør dette:
  - Flatt tak: alle kanter blir parapet.
  - Rektangulært skråtak: de lange sidene blir takfot og de korte gavl. Mønet blir en ny linje mellom gavlenes midtpunkter.
  - Andre former: ingenting gjettes, og kortet sier «Formen er for sammensatt …».
- Klikk på en kant åpner typemenyen. Valget gir `USER_CONFIRMED`. Dette virker bare i tak-modulen, og klikk andre steder er uendret (testet).
- Panelet viser en teller og en advarsel for «ikke valgt», og har knappene «Merk alle som takfot/parapet», «Nullstill» og «Foreslå på nytt».
- Ny `_takEdgeTakesGutter`, som 206 skal spørre: bare takfot kan få renne, og på flatt tak bare når brukeren selv har merket den.
- Ny `_takRegressionTest205` 63/63. `_takRegressionTest204` C/D er skrevet om (64/64). Rapport i `docs/205/RAPPORT.md`.

## 204 — Tak-modulen slås på (07.11.2026, `main`, ikke pushet)

- `MODULE_TYPES.roof.available = true`. Flisa «Tak & renner» vises på dashbordet, med hengelås for kundebedrifter (170). 066-dialogen og modul-navet har fortsatt fire valg, se `docs/204/SPØRSMÅL.md` 3.
- Tak-delen får etasjen «Tak», og sidepanelet viser ett kort: finn bygget, velg bygget, statuskort. I verktøylinja er rom-verktøyene erstattet med «Tegn omrisset selv».
- Når et bygg velges (fra kortet, ved klikk i kartet med «Hent bygg» eller fra «Bytt bygg»), kalles `_roofApi.modelQuick`. Funksjonen var ikke i bruk før.
- Ny state `S.tak[floorId] = { v, building, surfaces: [ { roof_type, footprint, heights, edges } ], features, model }`. `surfaces` er en liste fra første linje. Alle høyder har `height_ref` og `prov`.
- Lokale meter regnes om til verden med `_geoToWorld(bg, origin.east + x, origin.north + y)`.
- Statuskortet viser opphavet til hver verdi: målt i høydedata, anslag eller rettet. Taktypen er antatt eller valgt. Alle verdier kan redigeres, og retting gir `USER_CONFIRMED`/1. Byttes taktypen etter at kanter er merket, spør appen først.
- Tjenestefeil vises i kortet med «Prøv igjen» og «Tegn omrisset selv». Manuell tegning skjer i en egen modus `_takDraw` med geo-snapping.
- Lagres i `data.tak` bare når et tak finnes. Et prosjekt uten tak er identisk med HEAD (samme hash). Taket er med i angre, rydding ved sletting av etasje og flytting av bakgrunn.
- Ny `_takRegressionTest204` 64/64. 170-testen B3 er snudd. Rapport i `docs/204/RAPPORT.md`.

## 178 — Hesteskotrapp: toppflate eget trinn eller i plan med øverste nivå (03.11.2026, `main`, ikke pushet)

- Hesteskobyggeren har fått valget «Toppflate: Eget trinn / I plan med øverste nivå» med hjelpetekst. Det lagres som `stair.horseshoe.topLevel = below | flush`, og mangler feltet, gjelder `below`.
- Ny felles hjelper `_stairSideRiserCm(stair, surf)` gir opptrinnet sidevisningen tegner over en flate: 0 for repos og for en toppflate i plan. Den brukes i `_drawStairSide`, `_stairDrawSideToCanvas` (PDF), `_stairGeometryDims(side)`, `_stairSideBounds` og snappingen.
- Kabelen er ikke rørt, fordi opptrinn bare regnes mellom flatene (Regel 5). Kabelen er identisk i begge valg.
- Oppsummeringen i byggeren viser `count × opptrinn` ved «I plan».
- ⚠ Oppsummeringen og tegningen var uenige med ett opptrinn (opptrinnet fra bakken) allerede før 178, se `docs/178/SPØRSMÅL.md` 1.
- Ordet «terrasse» er tatt ut av byggerens tekster.
- `_stairHorseshoeRegressionTest` har gått fra 50 til 61. Gamle trapptester og VK Hovedterrasse uten feltet er identiske mot HEAD (skjermpiksler, PDF og oppsummering).
- Rapport i `docs/178/RAPPORT.md`, bilder i `docs/178/`. Svarene på 176-spørsmål 3 og 5 er skrevet inn i `docs/176/SPØRSMÅL.md`.

---

## Løp 168 — Varmeplan klar for demo hos Cenika (02.11.2026, `main`, ikke pushet)

Hele løpet i én oppføring (KJOR regel 12). Prompter, regler og spørsmål i Cowork-mappa
`prompter/lop-168-demo-cenika/` (`KJOR.md`, `STATUS-MALING.md`, `SPØRSMÅL.md` 1–71, `TIL-KENNETH.md`).
Rapport per prompt i `docs/<nr>/RAPPORT.md`. **Ingen migrasjon kjørt, ingen Edge Function deployet.**
Loggen hopper fra 134 hit; 135–168 er dokumentert i `docs/<nr>/RAPPORT.md` og `docs/serie-*/`.

| Prompt | Commit | Hva |
|---|---|---|
| 042 | `6c71f64` | `organizations.org_nr`/`parent_org_nr`/`created_by_*` + unik indeks på ni siffer; `_validOrgNr` (MOD11); admin-panelet viser duplikat og «ingen norsk org.nr» |
| 044v2 | `81195f9` | `create_customer_org()` (security definer, bare leverandør-medlem, kalleren blir ikke medlem); «Gi kunden tilgang til Varmeplan» fra Visma-lista (`erp_customers`) |
| 045 | `3c6e746` | Edge Function `opprett-kundebruker` (invitasjonstoken → konto, `inviteUserByEmail`, service-role bare server-side) |
| 046 | `62ee2fb` | `project_shares` + OR-gren på live SELECT-policyen «Org-medlemmer ser prosjekter» via `alter policy`; security definer-hjelpere mot RLS-rekursjon |
| 047 | `32fa650` | «Del med elektriker» (velg bedrift / inviter på e-post i ett klikk / ærlig status); `list_customer_orgs`, `list_project_shares` |
| 049 | `7f8a86f` | Garantiportalen: «Byttet», «Prosjektert: X · Montert: Y», filter og KPI «Avvik fra prosjektering» (fail-open før app-migrasjonen doc-avvik) |
| 169 | `38cc464` | Selvregistrering med «Kunde hos» og org.nr; «Søknader om tilgang» med Godkjenn/Avslå; vakt-trigger mot egen statusendring; «Velkommen — velg passord»; Edge Function `kundesoknad-svar` |
| 170 | `31139e8` | `organizations.allowed_modules` (kunder: `['indoor','list']`), 13 inngangspunkter gatet i `_moduleAvailable`, «Be Cenika om prosjektering» (mailto, `contact_email`) |
| 171 | `644bfdd` | Fanene Prosjektert / Til montering / Ferdig, «Vi fikk jobben» med Angre; `project_org_status` for delte prosjekter; «✓ Kunden fikk jobben» for Cenika |

App-siden (038, 041, 048, 172, 173) står i `varmeplan-app/docs/WORKLOG.md`.

**Migrasjoner, i rekkefølge** (174 sjekket at ingen fil viser til noe som kommer senere):
app `supabase-migration-doc-avvik.sql` → `supabase-migration-org-orgnr.sql` →
`supabase-migration-opprett-kundebedrift.sql` → `supabase-migration-project-shares.sql` →
`supabase-migration-del-med-elektriker.sql` → `supabase-migration-kundesoknad.sql` →
`supabase-migration-kundemoduler.sql` → `supabase-migration-prosjektstatus-per-org.sql`.
`del-med-elektriker` må aldri kjøres på nytt etter `kundesoknad` (den overskriver `list_customer_orgs`).

**174 · gjennomgang:**
- Regresjon (`docs/168/cdp/rtall.mjs`): 49 → 56 tester, 2 286/2 288 sjekker. Røde, og like før løpet:
  `_prosjektlaasRegressionTest` 66/67 (krever innlogging), `_kundeforslagRegressionTest` 270/271; fire
  `_geo*` krasjer alene (del av `_geoRegressionTest` 24/24); fire mattetester har 0 sjekker.
- `grep service_role index.html admin.html`: 0.
- Statusverdier og delt-regel er like i web (`_projectStatus`/`_projectStage`/`_projectIsShared`) og app
  (`src/lib/projectStatus.ts`). Appens romformat åpnet i web uten feil (`docs/173/web-sjekk.mjs`, kjørt på nytt).
- Ingen kode rettet i 174.

**Funn som ikke er rettet:** INSERT-policyen på `romtegner_projects` sjekker bare innlogging (SPØRSMÅL 65);
modul-låsen er bare i grensesnittet (170); folie fra appens hurtigrom vises ikke i web (66); samme firmanavn
to ganger feller registreringen (42, eldre feil); bruker i to orger kan havne i feil org (21).

---

## 134 — Matte: Kenneths svar på serie-128, motor (24.10.2026, `main`, ikke pushet)

Rapport «## 134» i `docs/serie-133/RAPPORT.md`, svar i `docs/serie-128/SPØRSMÅL.md`, skjermbilder `docs/serie-133/skjermbilder/134-*`.

- **A · Sentrering:** `_matZoneAnchorSide` gir `'mid'` når begge sider stoppes av matter — kapittel, tverrstykker og
  de gamle `S.mats`-veiene sentrerer blokka mellom dem (lik slakk).
- **B · Rullvalg uten stubb:** `_matChapterStubAt` + `_matChapterRollPlans(Σ, prod, path)`: ender største rull i en
  bredde under ett kuttraster eller i et tverrstykke under 2 × CC, velges nest største (like: neste lengde, blandet:
  neste kombinasjon ved samme K, `_matChapterBestAtKFree`); den større står som `equalAlt`/`mixedAlt` i panelet.
- **C · Startende:** `_matChapterRunOrder` — alle kapitler starter i velgerens ende, senere kapitler i ytterbredden
  nærmest forrige kapittel.
- **D · Regel 29 i rektangler:** `_matPlanZones` planlegger én sone og returnerer null bare uten tverrkapittel
  (`S.mats` bit-identisk); med: `zonePlan.single`, eget panelhode og toast.
- **E · Andre retning:** `_matChapterBlock(…, opts)` med `opts.dir`/`opts.fail`; `_matPlanZones` prøver den andre
  retningen ved Regel 27-avvisning. **Snapp innover** i `_matZoneFreeRoom` (boksen trekkes inn til nabomatte +
  mellomrom) — det som faktisk manglet for hindring #30.
- Tester: `_matChapterRegressionTest` 22/22, `_matCrossFillRegressionTest` 30/30. Spec Regel 11/24/27/28/29.

---

## 133 — Vannrett matte: én koordinatkonvensjon (24.10.2026, `main`, ikke pushet)

Rapport, spørsmål og skjermbilder i `docs/serie-133/`. Bakgrunn: 124 «Funn 1», SPØRSMÅL 128-1/130-4.

- **Konvensjon (kommentar ved `S.mats`, `matCoordV: 2`):** `x_cm/y_cm` = blokkas lave hjørne for 0° og
  90°; bredder stables i +tvers (x / y), kabel i +langs (y / x), `runStarts` absolutte. 90° er en
  transponering av 0°-blokka — motorens eksisterende A-konvensjon. Fri vinkel = rotasjon om senteret som før.
- **`_matFrame(mat)`** (senter, aksevektorer, `toW`) leses av `_matRunWorldGeom`, `drawMats`
  (`ctx.transform(0,1,1,0)` for 90°), label, `_matRunDragDelta`, målkjeden, `_matCenter`, gizmo,
  rotasjonspivot og `_clampMatToRoom`. Treff/rødmerking/130/131/127/PDF gikk alt via `_matRunWorldGeom`.
- **Motoren:** `autoFillMatSerpentine` 'h' skriver `matX = alongCenter − L/2`, `matY = acrossCenter −
  totalW/2` (var byttet om siden `b85c30a`). `_matRunOrder`: høy along-ende for 90° = høyre; piltaster følger.
- **`_matSetRotationDeg`:** ↻ 90°-knappen og håndtaket holder senteret inn i/ut av 90°, `runStarts` følger.
- **`_matMigrateCoordV2`** i `_restoreProject`: gamle 90°-matter konverteres fra tegnet posisjon
  (speilede `runStarts`, materialisert ved kort siste/klipp, `startCorner: 'tl'` når feltet mangler).
  To gamle prosjekter (11 matter): 0 geometriavvik, canvas-hash identisk i vanlig og PDF-modus.
- **Resultat:** 900 × 300 'h' 8,64 → 15,0 m² (= speilet 'v'); rect #10 'h' 8,0 → 10,0 m² = estimatet;
  benk 29 'h'-rader opp, 6 InSnow-rader ned (talte nett utenfor rommet før), ingen 'v'-rad endret.
- **Ny `_matRotationRegressionTest`** 35/35 (gammel formel tilbake → 9 røde). Alle andre batterier og
  `_pdfExportSmokeTest` grønne.

---

## 128 — Matte: veggmargin etter Regel 12 (kabel 5 cm fra vegg = nett 2,5/3 cm), én kilde (23.10.2026, `main`, ikke pushet)

Kenneth: «Min 5 cm fra kabel til vegg, dvs. 2,5 cm fra ytterkant nettet til vegg.» Rapport, spørsmål og
skjermbilder i `docs/serie-128/`. Spec Regel 12 oppdatert (avgjørelsen skrevet inn, konflikt lukket).

- **`MAT_CABLE_WALL_CM = 5` + `_matWallMarginCm(prod)`** = `max(0, 5 − kant-inntrekk)` → 2,5 cm
  (60T/100T), 3,0 cm (150T); `min_wall_margin_mm === 0` (InSnow) → 0, uendret. Erstatter
  `prod.min_wall_margin_mm ?? 50` (= 5 cm nett, 7–7,5 cm kabel) i auto, flermatte, soner, omlegging
  (127), klikk-plassering, gruppe-avstand, varsel, mattebenk og frihånd — kortside OG langside
  (kortsiden var `max(cc/2, 5)`, altså 6 cm for 60T/100T). Basen urørt.
- Mattebenk (absolutt m²): auto +54 m² over 56 rom, 38 rader høyere, 183 like, **3 lavere** — alle
  retningsbytter (v↔h) der 'h'-veien leverer under sitt eget estimat (124-funnet om vannrett matte).
  Med retningen holdt fast er alle rom identiske. Stoppet og rapportert, ikke rettet.
- Funn (ikke rettet, før 128): frihånd-vakten godtar 1 cm innenfor marginen langs banen og sjekker
  ikke tverr-marginen.
- `_matFreeRegressionTest`: (30,295) → (28,297). Alle matte-batterier og `_pdfExportSmokeTest` grønne.

---

## 127 — Matte: flytt alle matter i rommet sammen; mellomrom per valgt matte (23.10.2026, `main`, ikke pushet)

Kenneth: «markere en matte og flytte hele arrangementet … velge avstand mellom breddene på den valgte
matten.» Rapport og skjermbilder i `docs/serie-127/`.

- **«Flytt alle matter i rommet»** (chip i ctxbar for matte/frihånds-matte) slår på arrangement-modus:
  et drag på hvilken som helst matte flytter alle matter og frihånds-matter i rommet med samme delta.
  **Alt + dra** på en matte gjør det samme uten modus (Alt + dra utenfor en matte panorerer som før).
  Bygget på 108-flyttingen (`_snapshotRoomForMove(roomId, ['mats','matPaths'])` +
  `_applyRoomMoveSnapshot`), rutenett-snap og akselås som for én matte, ett pushUndo per drag.
  Validering ved slipp (124-prinsippet): rød toast og rødmerkede bredder, aldri sprett.
- **«Mellomrom i denne matta»**: er en lagt matte valgt, viser Mellomrom-feltet (produktpanel,
  objektinfo, ctxbar-chip med popup) mattas eget `gap_cm`, og en endring legger breddene i DENNE matta
  om (`_matRelayWithGap`): første bredde i kabelrekkefølgen ligger fast, klipp mot rom/hindringer/sone
  regnes på nytt per bredde (ny delt `_matClipRunToRoom`, trukket ut av motoren uendret), bredder som
  ikke får plass legges ikke ut og gir gul merknad «N bredder får ikke plass med X cm mellomrom»,
  `runAdjust` nullstilles med toast. Uten valgt matte er feltet globalt som før. Frihånds-matte: samme
  etikett på chip/popup/sidepanel.
- Funn (ikke rettet): enkelt-matte-drag flytter ikke `runStarts` (klippet matte blir liggende igjen
  langs dragaksen); vannrett matte har fortsatt to koordinatkonvensjoner (124) — ankeret holdes i
  motorens. `clipStripToRoom` godtar delvis tverr-overlapp — omleggingen sjekker tverrplass selv.
- Ny `_matArrangementRegressionTest()` (55 sjekker). Eksisterende matte-/rom-/PDF-tester grønne,
  mattebenk 224 rader uendret.

---

## 126 — GBAO10-eksport: «Ferdig» (primær) og «Eksporter på nytt» etter eksport; Esc lukker (23.10.2026, `main`, `b40496e`, pushet)

Kenneth: «"Avbryt" er feil ord på knappen etter at det er eksportert.» Rapport i `docs/serie-126/`.

- Etter vellykket eksport (mappe eller nedlasting) blir «Avbryt» til **«Ferdig»** (blå) og «Eksporter»
  til **«Eksporter på nytt»** (sekundær). Feil (ingen tilgang, unntak) setter knappene tilbake.
  Én funksjon, `_gbao10SetDone`, skriver tekstene; tilstanden overlever re-render i samme åpning.
- **Esc** lukker dialogen i begge tilstander (gjorde det ikke før). Alle lukkeveier går via `_gbao10Close`.
- Målt før: et nytt «Eksporter»-trykk lastet ned samme fil en gang til uten spørsmål; mappe-veien
  skriver `_2.txt` (kollisjonsvernet) — «Avbrutt.»-grenen er død kode i dag.
- Andre eksportdialoger (PDF, XLSX, Kopier til Visma, Tilbehør) lukker seg selv — ingen har problemet.
- `_gbao10RegressionTest` har fått del D (11 sjekker, async): knappetekst før/etter, re-render,
  Esc, tilgangsnekt, ny åpning.

---

## 125 — Materialliste: foliemengde (m per produkt) i tilbehørsdialogen, justerbar og lagret (23.10.2026, `main`, `89c1cd7`, pushet)

Kenneth: «beregnet mengde kommer opp i samme listen, slik at bruker kan justere mengde opp eller ned
selv … kanskje gå opp litt siden det kan være snaut». Rapport og skjermbilder i `docs/serie-125/`.

- Ny seksjon **«Varmefolie (meter)»** øverst i tilbehørsdialogen: én rad per folieprodukt med «tegnet
  47,3 m i 2 rom», «forslag: 48 m», tallfelt i hele meter og knappene **+1 m** / **+5 m**.
- Lagres i `S.project.accessories.items` som `{ type: 'foilProduct', productId, qty, autoQty }` — følger
  prosjektet og foreslås igjen. Lagret ≥ forslag → lagret. Lagret < forslag → forslaget med gul merknad
  «Tegnet mengde har økt siden sist (var N m)». 0 m lagres (bevisst valg) og gir ingen linje.
- **Én kilde:** `_foilOrderQtyM` for PDF-materialliste, XLSX «Bestilling», Kopier til Visma og GBAO10.
  Før regnet de fire hver for seg og ulikt (PDF/XLSX «47.3 m», Visma/GBAO10 48). Nå hele meter overalt.
  Uten dialog (Visma/GBAO10 gjenbruker lagret valg) vinner forslaget hvis tegningen har økt siden tallet
  ble bekreftet; ellers står brukerens tall, også 0.
- Tilbehør som regnes av folien (tape, plater, klemmer, RKK) leser fortsatt tegnet mengde, ikke det
  justerte tallet.
- Ny `_accessoryFoilQtyRegressionTest()` (38 sjekker, inkl. én kilde i alle fire eksporter + vaksine).
  `_pdfExportSmokeTest` grønn.
- Funn utenfor scope: `_assertProductSurfacesCoverAllCollections` er rød for XLSX også uten 125
  (sjekken kjenner ikke `_collectMaterialItems`). Se rapporten.

---

## 124 — Matte: start og første bredde følger velgeren, mellomrom før utlegg, én bredde kan justeres (23.10.2026, `main`, `e3b5904`, pushet)

Regel 26 i `spec-matte-utlegg.md`. Rapport og skjermbilder i `docs/serie-124/`.

- **A.** `mat.startCorner` lagres ved utlegg (auto og flermatte); `_matCablePlan` tar breddene i
  kabelrekkefølge fra velgeren (`_matRunOrder`/`_matRunCableOrder`), inn-/utside speiles. Matte
  uten feltet tegnes som før. Grønn start / rød slutt på matte og frihånd, også i PDF. Målt: alle
  8 velgerstillinger stemmer (før: 2 av 8).
- **B.** «Mellomrom»-felt i matte-produktpanelet før utlegg — samme `setMatGap`/`mat-gap-cm-input`
  som chippen etter utlegg (`_matGapFieldState` er én kilde).
- **C.** `mat.runAdjust[i] = { acrossCm, startCm }` / `moves[i].shiftCm, startCm`. Klikk på bredde i
  valgt matte velger den; dra sidelengs 5 cm (Shift glidende, delta fra grepspunktet), S-håndtak
  for forskjøvet start (slutt fast, bredden kortes), piler 5 cm / Shift 1 cm, «Start +cm»,
  «Nullstill», Esc. Ingenting regnes om (Regel 17); «Dekker» følger geometrien. Gul merknad under
  minste lengde, rød kant uten sprett utenfor rom / over hindring. Angre, lagring, flytting av hele
  matta og nytt utlegg (nullstiller) dekket.
- `hitMat` leser nå mattas `gap_cm` og klippet lengde (før: produktets `min_gap_mm` og nominell
  lengde). Kuttlinjer tegnes bare innenfor breddens faktiske utstrekning.
- Ny `_matRunAdjustRegressionTest()` (70 sjekker). `_matPathClickRegressionTest` starter hvert klikk
  fra uvalgt matte (andre klikk velger nå en bane). Alle matte-batterier, PDF-røyktest og
  mattebenken (224 rader, ingen endring) grønne.
- Funn utenfor scope: vannrett matte (rotation 90) har to koordinatkonvensjoner mellom utlegg og
  tegning (2 av 5 bredder klippet til 0 i 900 × 300 «h»). Se rapporten.

---

## 123 — Navnebytte del 2: `arqely_usage` og IndexedDB-databasene flyttet til `varmeplan_*` (22.10.2026, `main`, `06d784b`, pushet)

- `arqely_usage` → `varmeplan_usage`, med samme kopiering ved oppstart som prefs.
- `arqely_gbao10` → `varmeplan_gbao10` og `arqely_recovery` → `varmeplan_recovery` via ny felles
  `_idbOpenFlyttet`:
  - Kopierer manglende oppføringer én gang. Merket ligger i localStorage, så en slettet
    gjenopprettingskopi kommer ikke tilbake.
  - Oppretter aldri en gammel database som ikke fantes.
- Gamle nøkler og databaser slettes ikke. Kopieringen kan fjernes etter 1.2.2027.
- Målt i Kenneths nettleser: gjenopprettingskopien `p-044` er identisk, og bruksloggen (69 produkter)
  er kopiert.
- 28 av 31 batterier er grønne. De tre røde er røde også med den gamle koden. Detaljer i
  `docs/serie-122/NAVNEBYTTE.md`.

---

## 122 — Navnebytte arqely/lumelo → Varmeplan (web) (22.10.2026, `main`, `94a469a`, pushet)

Repoet heter nå `varmeplan-web` (mappe og GitHub). Motoren heter `varmeplan-motor`, men kjører
fortsatt på `lumelo-backend.fly.dev`.

- `arqely_prefs` → `varmeplan_prefs` og `lumelo_engine_url` → `varmeplan_engine_url`. Den gamle
  verdien kopieres over ved oppstart, og den gamle nøkkelen står igjen til 1.2.2027.
  «Nullstill lagret adresse» fjerner begge motornøklene.
- `LUMELO_FLY_URL` → `VARMEPLAN_MOTOR_URL` og `LUMELO_LOCAL_URL` → `VARMEPLAN_MOTOR_LOCAL_URL`.
  `window.VARMEPLAN_ENGINE_URL` erstatter `window.LUMELO_ENGINE_URL`, og det gamle navnet leses
  fortsatt. URL-verdien er urørt.
- Kommentarer, `sw.js`, `launch.json` og `docs/kart-lag.md` er oppdatert.
- Ingen synlig tekst måtte endres. Avsenderdomenet (arqely.no), arqely.com og Supabase er urørt.
- Rapporten med alle gjenværende treff ligger i `docs/serie-122/NAVNEBYTTE.md`.

---

## 122 — Presentasjon: frihånds-matte og aluboard gjenkjent, areal alltid synlig, «Foreslå endring» med type → gruppe → ▲/▼ og live resultat (22.10.2026, `main`, `73c15a8`, pushet)

Kenneth: en presentasjon med EcoMat lagt i frihånd sa «Ingen varme er planlagt», og kortet sa
«Produkt: ikke plassert», selv om effekten var 1500 W.

- **Rotårsak:** `_presentRoomProduct` hadde sin egen liste og manglet `S.matPaths` og `S.aluboard`.
  Den leser nå `_roomDominantProduct` (den felles kilden fra 097). Kortet viser alle produktene,
  f.eks. «2 × …».
- **Areal:** netto og brutto vises alltid i kortet og i romlista, med «før → etter» etter Endre mål.
- **Én velger** (`_forslagVelgerHtml`) for rom med og uten produkt: type → produktgruppe → ▲/▼, med
  live resultat (effekt, flateeffekt, CC, dekning, mot ønsket og «Nå:» til sammenligning).
  - Mattegruppa er nå «EcoMat» (60/100/150). Før var den én død rad per W/m².
- **Godkjenning:** ved typebytte ryddes rommet først. En frihånds-matte beholder banen og bytter bare
  produktfamilie.
- **Testene:** oppsettet tømmer nå matPaths, foilFree og aluboard (testen var miljøavhengig). Den
  automatiske lagringen av valget lekker ikke lenger inn i ekte tilstand. Ny seksjon M.
- `_kundeforslagRegressionTest` 227/227 og `_kundelenkeRegressionTest` 330/330.
- Rapport og fire spørsmål: `docs/serie-122/RAPPORT.md`.

---

## 121 — Kabelmotor: fail-open uten polygonbibliotek gjenopprettet (tilnærmet kandidat), 7 utdaterte påstander oppdatert med begrunnelse, rask variant av batteriet (21.10.2026, `main`, `89c1cd7`, pushet)

Kenneths svar på SPØRSMÅL 103 (skrevet inn i `docs/trapp/prompter/SPØRSMÅL.md`). Full måling i
`docs/kabel/STATUS.md` §45.

### STEG 0

- De åtte røde på `bca0959`: de samme åtte, 127 påstander, 30 s (§44 målte 127 s 20.10 — ikke forklart).
- **`null` kom ikke fra hjørnefilteret** (§44s hypotese): `_cableFilterByCorner` kaster aldri alle.
  Kandidatlista var TOM — uten clipper gir geo «ingen løsning», og 083 tok V6 ut av konkurransen.
- `baseline.json`: `badHakk41|v|tr` 63,3 % (akseptert), `tl`/`br` 94,9 %. Bekreftet.

### Endring

- **Fail-open i `_autoFillCableImpl`** (inne i `if (!chosen)`, bare når `!_cblClipperReady()`): dagens
  kaskade som tilnærmet kandidat — målt, merket `_geomApprox`/`_geomOk`/`_geomDefects`, panelet sier
  «tilnærmet». Innenfor 074-dybdetelleren (ingen dialoger). Med clipper: bit-identisk (ny påstand).
- **Sju påstander** oppdatert til målte verdier, hver med én kommentar om hvorfor og hvilken commit
  (5,711 m² / topp = minst y / 088b-ordlyd / 600W starter ved nærmeste lovlige punkt og panelet
  melder det / badHakk41 måles i `tl`).
- **Rask variant:** `_cableGeometryQuickTest()` / `{ rask: true }` — utvalg av fixturer og de
  seksjonene som bærer de åtte. Seksjonene i testen er gatet med `_vil(tag)`; uten `rask` kjører alt.

### Målt etter

- `_cableGeometryRegressionTest()` 132/132 (127 + 5 nye) på 30,0 s. Rask: 67/67 på 18,8 s.
- `_cableGeoSuite()`: 142 rader, 0 feil, 0 endret, 0 nye, 0 borte (19,7 s). `_cableForstyrrelsesTest()`:
  31 brudd, som sist målt (§38/§40: 31).

---

## 120 — Trapp: alle soner starter på samme side som sone 1, «Antall kabler» i sonen, auto 2 kabler når 1 ikke holder, låst/auto også på trappenivå (21.10.2026, `main`, `89c1cd7`, pushet)

Kenneths svar på SPØRSMÅL fra serie 104/105/106 (skrevet inn i `docs/serie-104/SPØRSMÅL.md`).

### STEG 0 (målt med syntetisk katalog, samme fixturer som `_stairZoneRegressionTest102`)

- **104/1 Startside:** alle soner startet ALT fra venstre (104-trappa: V/V/V, også med «Kabelstart: Topp») —
  sonens første flate har ingen innkommende forbindelse, så tegningen begynner fra venstre. Men
  paritetskjeden (`prevExitRight`) løp videre over sonegrensen. Med oddetall strenger (CC 13 → N=3 per
  trinn, to trinn-soner 3+5) ga det ett SIDEBRUDD inne i sone 2: flate 3 forlot til høyre, flate 4 ble
  møtt fra venstre (`3:V>H 4:V>H 5:H>V …`). Kostnaden ved å tvinge samme side: **0 cm** — forbindelsen over
  sonegrensen tilhører ingen kabel, og sonens strenger er like lange uansett side (4850 cm før og etter).
- **105/5 Låst på trappenivå:** `edgeMarginMin_cm` (084) er gulvet for Forslag, `edgeMargin_cm` det løste
  utlegget. «Låst» for Forslag må bety: behovet regnes ved den låste avstanden, settene rangeres på passform,
  ingen margin-løsning. `_stairFitLockedMargin` (105) gjør akkurat det for et gitt sett.
- **106/6 Auto i sonen:** `_stairSolveZones` → `_stairSolveExactCableSet(subStair, { maxCables: 1 })`. Når
  ingen enkeltkabel holder, er svaret `{ ok:false, reason: 'Ingen kombinasjon … dekker behovet …' }`, og sonen
  får feil. Grensen for én kabel i sonen er `maxSaneMargin` (gulv + 15 cm / halve flata), ikke 75 %.

### Endring

- **`generateStairCable`:** ved sonegrense nullstilles `prevExitRight` (neste sone starter fra venstre, som
  kjeden selv). A/B-bryter `window._stair120Av` for vaksinetesten.
- **`_setStairZoneCableCount(zoneNo, val)`** + tallfelt «Antall kabler» i sonepanelet over kabellista.
- **`_stairSolveZones`:** auto prøver `maxCables: 2` når én kabel feiler; `zoneResults[].autoTo`,
  `_stairZoneInfo().autoTo`, panelet: «Auto: 2 kabler (én rakk ikke)».
- **Trappenivå:** `stair.edgeMarginLocked_cm` (null = auto = som før). `_stairLockedMargin`, `_stairFloorMargin`
  returnerer låst verdi, `_setStairEdgeMarginLock(on)`, `_setStairEdgeMargin('')` = lås av, 🔒/🔓 ved feltet.
  `_regenerateStairCable`: låst → `edgeMargin_cm` = låst og manuelt sett vurderes med `_stairFitLockedMargin`.
  `_stairSolveLockedCableSet(stair)`: Forslag ved låst avstand — bare settet varierer, rangert på passform
  (≤ 2 % / 2–5 % / > 5 %), A = best, B = annet sett (aldri samme sett to ganger — målt og rettet). Forslagskortet
  får «🔒 Avstand sider låst X cm · Y for kort/til overs». `_stairZoneSubStair` nuller låsen (arves som gulv).
- **Sidefunn, rettet:** med «Kabelstart: Topp» slapp sonefilteret i `generateStairCable` forbindelsen over
  sonegrensen (3 → 2, høyere til lavere flate) inn i den NEDRE sonen (`fromSurf >= from && toSurf <= to`
  antok fromSurf < toSurf). Sonen fikk et opptrinn som ikke er dens og forrige sones utgangsside som inngang
  — J5 var rød på det. Begge ender må ligge i sonen (`min/max`). 104-trappa med Topp: nå bit-identisk med Bunn
  (3000 / 2500 / 4500 cm, 10 036,8 totalt).
- Spec: Regel 21 (samme startside, Antall kabler, auto 2), Regel 22 (gjelder trappenivå).
- `_stairZoneRegressionTest102` seksjon J: 29 nye påstander (77 → 106). J1 er vaksinert (bryteren gir 1 brudd).

### Målt etter

- 3+5-trappa (CC 13): sone 2 `3:V>H 4:H>V 5:V>H 6:H>V 7:V>H`, 0 sidebrudd, 4850 cm. 104-trappa 10 036,8 cm.
- Sone med behov > 139,9 m (20 trinn × 250 cm): auto gir 55,3 + 139,9 m, panelet sier «Auto: 2 kabler».
- Trapp 240 × 8 trinn, låst 6 cm: Forslag A = 25 + 49,7 m (62 cm til overs), B = 70 m (4,1 m for kort, rødt);
  manuelt 70 m: «Kabelen er 4,1 m for kort — 2 løp dekkes ikke», stiplet rødt. Lås av: 70 m @ 12,4 som før.

---

## 119 — Presentasjon: produktmål skjult for kunden, klikk-styring, forhåndsvalg over etasjer, vegg-tabell per vegg i forslagssvar, UTLEGG-merket ryddes ved nytt utlegg (21.10.2026, `main`, `89c1cd7`, pushet)

Kenneths svar på SPØRSMÅL fra serie 116/117/118 (svarene står under hvert spørsmål i
`docs/serie-116/SPØRSMÅL.md`).

### STEG 0 (målt på forslagslenka til «Vestre Hals 43», bare lest)

- **116/3 Produktmål:** de tre kjedene (`_drawStripDimChainForRoom`/`Cable`/`Mat`) tegnes i
  `drawAllDimAnnotations` på rommets egne brytere `stripDimSnap`/`cableDimSnap`/`matDimSnap`
  (lagret i prosjektet). Rommet i Vestre Hals hadde `stripDimSnap: true` → hele foliekjeden
  («3.2 cm», «871.8 cm», «2.5 cm», sidekjeden) sto i forslagslenka. PDF-en slår bryterne på selv
  (`_pdfMode`, :74018) — den var allerede utenfor.
- **116/4 Hover:** `_presentHover` (mousemove i `S.ui.present`) byttet rom ved hover i ren
  presentasjon, gated bare på `_forslagAktiv()`. Klikk-veien fantes allerede i `_canvasMouseUp`
  (tap uten drag → `_presentRoomAt`).
- **116/5 Forhåndsvalg:** `_presentForhaandsvalgtRom` filtrerte på `_roomOnActiveFloor`; etasjebyttet
  fra 117/4 lå som fire linjer inne i `_presentPanelVelgRom`. `_presentEnter` kalte `fitAll()` FØR
  forhåndsvalget.
- **118/1 Vegg-tabellen:** `_kundeRevRender(groups)` leste `_kundeLinkCache` for navn/dato/kommentar/
  `answer.points`/`axisBalance`, og knappene gikk til `_kundeApplyRoom`/`_kundeApplyAll`/
  `_kundeBrukKundePunkter`/`_kundeRejectAnswer` + `_kundeNyeRomHtml()` — alle bundet til mållenka.
  Avkryssingen lå alt i `_kundeRevState.picked` og `_kundeApplyWalls(groups, onlyPicked)` fantes.
  Det som måtte bli argument: `k` (svaret) og knappenes mål.
- **118/5 Felles kanal:** alle plasseringsveiene ender i `renderSidebar()` (109 brukte den samme).
  `_clearRoomProductCollections` fjernet alt merket, men manuell plassering og frihånds-matte rydder
  ikke først.

### Endring

- **`_presentProduktMaalSkjult()`** — presentasjon/forslagslenke uten `_pdfMode` og uten annen
  kundemodus → `drawAllDimAnnotations` hopper over de tre produktkjedene etter at veggmålene er tegnet.
  Rommets brytere røres ikke; editor, PDF og mållenka er uendret.
- **`_presentHover`** setter bare markøren. Testen G som krevde `_forslagAktiv()`-gaten er snudd til
  «kilden nevner ikke `presentRoomId`».
- **`_presentRomIEtasjerekkefolge()`** + **`_presentByttTilRommetsEtasje(roomId)`** (delt med romlista).
  `_presentEnter`: forhåndsvalg → etasjebytte → `fitAll`.
- **`_kundeRevRender(groups, ctx)`**: `ctx = { forslag, k }` i `_kundeRevState.ctx`. Med ctx: tittel «Mål
  fra kunden (forslagssvar)», ingen «Avvis svaret», ingen nye-rom-blokk, knappene går til
  `_forslagRevBrukAlle/Rom/Punkter`. Uten ctx: bit-identisk mållenke-oppførsel.
- **`_forslagArbeidInnMaal()`** åpner vinduet (var: arbeidet inn alt). `_forslagRevBruk*` →
  `_kundeApplyWalls`/`_kundeBrukKundePunkter` → `_forslagMaalEtterInnarbeiding(beroerte)` (merke +
  protokollrad `roomId:'maal'`, rom slås sammen ved flere innarbeidinger). Målblokka får «Vis målene»
  etter innarbeiding.
- **UTLEGG-merket:** `utleggMerkeSig = _roomProduktSignatur(roomId)` (id-ene i alle `ROOM_PRODUCT_KEYS`)
  settes med merket; `_utleggMerkeRydd()` i `renderSidebar` fjerner merket når signaturen avviker.
  Merker uten signatur (før 119) står til de klikkes bort.
- Test L i `_kundeforslagRegressionTest` var rød på HEAD i editoren (grønn i en levende lenke): seksjon
  C etterlot en fast `#_fors-bunn`. L kaller nå `_forslagRenderBunn()` selv.

### Målt etter

- Forslagslenka: foliekjeden borte, veggmål (blå) står. Ren presentasjon («Varmematter 60W», 5 rom):
  hover over rom 4 → valgt rom fortsatt 2, markør peker; klikk → 4.
- Kenneths side (Vestre Hals, lest med stubbet lagring): vinduet med tre vegger, én krysset bort,
  «Arbeid inn valgte mål» → vegg 1/2 = 454/204 (kundens tall), vegg 3 fulgte geometrien (215 → 203,
  slik «Blir»-kolonnen viste) — ikke kundens 205. UTLEGG-merke satt; én ny folie + `renderSidebar` →
  merket borte.
- `_kundeforslagRegressionTest` 189/189 (33 nye: M/119 + seksjon N), `_kundelenkeRegressionTest` 328/328.

---

## 118 — Forslagslenke: «Endre mål» / «Lås mål», mål følger med i svaret, «Arbeid inn målene» hos Kenneth (21.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 21.10.2026: «Bør være knapp: Endre mål — da blir veggene valgbare og kan flyttes. Når kunde
har flyttet vegger, må hen trykke på "Lås mål". Så kan man fylle inn "hva synes du om" som vanlig og
velge "send forslag".» Avklart: produktene dempes i endrede rom, ingen ny utlegging hos kunden.

### STEG 0

- **0.1 Mållenkas maskineri inne i forslagslenka:** gatet 13 steder på `S.ui.kundeMode === 'maal'`
  (mousedown/-move/-up, keydown, `drawVertexGizmo`, `drawKundeValgtVegg/FastEnde/ValgtHjorne`,
  `_kundeLaasHover/Klikk`, `_kundeKobleBeroring`) og på `_kundeState` (edits, vertexDelta, fixedEnd,
  original). Eneste antakelse om S: `_kundeLagreOriginal` har tatt vare på originalen, og rom har
  `points`/`walls`. I det fulle prosjektet bygger `_kundeRebuildRoomMedHjorner` `walls` om med
  `compWalls` (vegginnstillinger er visuelle hos kunden, ingenting lagres), og produktene blir
  liggende der de lå. `_kundeRenderBar()` kalles fra 19 steder og måtte omdirigeres.
- **0.2 Kenneths side:** mål-svar arbeides inn med `_kundeAnswerByRoom` → `_kundeApplyWalls` →
  `_kundeFinishApply` (vegg-modus) eller `_kundeBrukKundePunkter` (punkt-modus) — alle leste
  `_kundeLinkCache.answer` direkte og `_kundeFinishApply` satte MÅLlenka til applied. Forslagssvar
  vises i `_forslagRevRender`, beslutninger i `applied_result` per roomId.
- **0.3 `kundelenke_answer`:** `p_answer jsonb`, eneste sjekk er `pg_column_size ≤ 200 000`
  (`supabase-migration-kundelenke.sql` :133). Målt svar med ett rom (vegg + 4 punkter): 368 tegn;
  15 rom ≈ 5,5 kB. Ingen migrasjon.
- Ekte drag målt i Playwright: første forsøk på 15 px ga ingen flytting (ikke reprodusert); tre
  påfølgende drag på 10/15/22 px flyttet veggen (327 → 335/339/345 cm). `S.snap.grid` følger
  brukerens nettleser i det fulle prosjektet (50 cm rutenett) — skrus av i målmodus, som på mållenka.

### Endring

- **`_kundeMaalAktiv()`** — én gate for målmaskineriet: mållenka som før, forslagslenka når
  `_forslagState.maal.modus`. Alle 13 gatene bruker den; `_kundelenkeRegressionTest` I/J/L er
  oppdatert til å kreve den delte gaten i stedet for de gamle strengene.
- **Kundesiden:** seksjon «Mål» i panelet (117): «Stemmer målene? Du kan rette dem.» + **Endre mål**
  (`_forslagMaalStart`: lager `_kundeState`, `_kundeLagreOriginal`, `body.kunde-maal`, berøring,
  snap av). I målmodus: valgt vegg med tallfelt (`_kf-<rom>-<idx>`, samme id som mållenka), −/+/↺
  og hintet «Dra veggen inn eller ut, eller skriv inn riktig mål»; valgt hjørne; **Lås mål**
  (`_forslagMaalLaas`). Etter låsing: liste «Stue: vegg 2 400 → 412 cm» med **Angre**
  (`_kundeTilbakestillVegg/Hjorne`), og Endre mål kan åpnes igjen. Mobil: den lukkede skuffen viser
  målkontrollene. `_kundeRenderBar()` tegner panelet i forslagslenka.
- **Demping:** `drawForslagMaalDemping()` fra `render()` etter produktlagene — originalens og
  dagens polygon fylles i én bane, dagens omriss strekes opp, tekst «Utlegget oppdateres etter at
  målene er bekreftet». Kortet: banner + «(før endring)» på effekt og flateeffekt.
- **Svaret:** `_forslagPayload()` + `maal: _kundeBuildAnswer()` når noe er endret. Send krever låst
  målmodus («Trykk «Lås mål» først»); Send er mulig med bare mål rettet (foten: «· mål rettet»).
- **Kenneths side:** `_forslagMaalBlokkHtml` i forslagsvinduet («Kunden har rettet målene» + liste +
  **Arbeid inn målene**). `_forslagArbeidInnMaal` kaller den EKSISTERENDE innarbeidingen med svaret
  gitt inn: `_kundeAnswerByRoom(a)` → `_kundeApplyWalls` → `_kundeFinishApply(…, { ikkeLukkLenke })`
  eller `_kundeBrukKundePunkter(id, a)`. Rommene får `utleggMaaOppdateres` (badge **UTLEGG** i
  romlista, fjernes av `_clearRoomProductCollections` eller klikk). Protokoll: egen rad
  `{ roomId: 'maal', status: 'innarbeidet' }` i `applied_result` — rom-beslutninger og mål er
  uavhengige; `_kundeMaybeOpenReview` åpner også for et rent mål-svar; `_forslagSendSvar` beholder raden.
- **Lenka:** avkryssing «Kunden kan rette mål» (på som standard) i Del-dialogen; av lagres som
  `note = 'innstilling:maal=av'` på lenka (ingen ny kolonne), lest i `_forslagStart`.
- `_kundeforslagRegressionTest` seksjon M (32 sjekker). 156/156 grønne; `_kundelenkeRegressionTest`
  330/330.

Skjermbilder: `docs/serie-116/skjermbilder/118-*.png`.

---

## 117 — Presentasjon: ett venstre panel (romliste, valgt rom, Hva synes du, Send); skuff på mobil (21.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 21.10.2026: «Kanskje alt skulle stått i en venstre bar slik som vi har i Varmeplan-appen?
Da er alt samlet.»

### STEG 0 — tre steder å se (målt på forslagslenka til «Vestre Hals 43»)

| element | desktop 1440 | 390 px |
|---|---|---|
| Topplinje `#present-bar` (navn, avsender, dato) | 58 px øverst, over lerretet | 92 px |
| Detaljkort `#present-detail` (produkt, effekt, Hva synes du) | 320 px fast til høyre | bunnark som dekket 522 av 844 px |
| Bunnlinje `#_fors-bunn` (teller + Send) | 59 px nederst | 67 px |

Mållenkas 032-panel er flex-søsken til `#canvas-wrap` i `#content` på PC (lerretet tar resten via
`flex:1`, ResizeObserver kaller `resizeCanvas`) og et fast bunnark på mobil. Monteringen
(`_kundeMonterBar`) gjenbrukes rett av; innholdet (vegg-tabellen) er spesielt for mål og deles ikke.

### Endring

- **`#_present-panel`** (`_presentPanelRender`, 320 px): Prosjekt (navn, avsender; KPI-ene fra
  topplinja i ren presentasjon; Del lenke/PDF/Avslutt når innlogget) → Rom (alle tegnede rom med
  areal og produkt, gruppert per etasje ved flere; valgt rom uthevet; ✓/! fra kundens valg; «Vis
  hele planen») → Valgt rom (samme `_presentRoomDetailHtml`, med «Hva synes du?» i forslagslenka)
  → tom `#_pp-maal` for 118 → fot med «n av N rom vurdert» og blå Send (116).
- Topplinje, detaljkort og bunnlinje er borte i panelmodus (`_presentPanelAktiv()` = presentasjon
  eller forslagslenke; mållenka `?kunde=` beholder sitt eget panel). `_presentRenderDetail` og
  `_forslagRenderBunn` er dispatchere: den første bygger panelet, den andre bare foten (fokusregelen
  — `_forslagKomm` kaller den for hver tast).
- Klikk i lista = `_presentPanelVelgRom`: velger, bytter etasje ved behov, `fitRoom`, ruller til
  detaljene. Klikk i tegningen ruller lista til rommet og åpner skuffen på mobil.
- **Mobil (< 760 px):** skuff nederst. Lukket (69 px): valgt rom + Send + ▲. Åpen (maks 78 vh):
  hele panelet. Trykk veksler, sveip opp/ned åpner/lukker.
- `_kundeforslagRegressionTest` seksjon L (25 sjekker). 124/124 grønne; `_kundelenkeRegressionTest`
  330/330.

Skjermbilder: `docs/serie-116/skjermbilder/117-*.png`.

---

## 116 — Presentasjon: forhåndsvalgt rom, mål på alle vegger, blå «Send forslag» (21.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 21.10.2026: «Jeg ønsker at et rom allerede er valgt når presentasjonen åpner. Det er ikke
lett å forstå at man skal trykke på et rom for å få opp detaljer. Jeg ønsker også at målene på alle
veggene er synlig i presentasjonen. […] Send forslag-knappen nederst bør være BLÅ slik at den synes.»

### STEG 0 — målt på forslagslenka til «Vestre Hals 43» (lest, ikke sendt)

| | før |
|---|---|
| Valgt rom ved åpning | `S.ui.presentRoomId = null` (`_presentEnter` nuller det); `#present-detail` har `display:none` |
| Veggmål | styres KUN av `room.dimSnap` (Kenneths «Målsett rom», lagret i prosjektet). I prosjektet: `false` → ingen veggmål. Bare foliekjeden (`stripDimSnap`) vistes |
| «Send forslag» | dempet: `--surface2`/`--dim`; aktiv: `--accent` = **turkis** (#0891b2 lyst / #22d3ee mørkt) med mørk tekst |

Ren presentasjon på desktop var i tillegg hover-drevet: `_presentHover` satte `presentRoomId = null`
straks musa forlot et rom — et forhåndsvalg ville forsvunnet ved første musebevegelse.

### Endring

- **Forhåndsvalgt rom** (`_presentForhaandsvalgtRom`): første rom med produkter på aktiv etasje, i
  `S.rooms`-rekkefølge; ellers første rom. Settes i `_presentEnter` etter `fitAll()` — hele planen
  vises, rommet er uthevet, kortet er åpent. `_forslagStart` tegner kortet på nytt når forslagslaget
  er lastet (det ble tegnet før `_forslagState` fantes, uten «Hva synes du?»). Hjelpelinja «Trykk på
  et annet rom i tegningen for å se det.» står i kortet til kunden selv har valgt et annet rom
  (`_presentAutoValgt`). Hover utenfor et rom nuller ikke lenger valget.
- **Mål på alle vegger** (`_presentDimsOn`): i presentasjon/forslagslenke tegnes veggmålene for alle
  tegnede rom, uten hindringsmål (`{ bareVegger: true }`), **uten å skrive `dimSnap`** i rommet.
  Tetthet: ved liten zoom (rommets korteste side < `PRESENT_DIM_MIN_PX` = 120 px) vises bare det
  valgte rommets mål. PDF-rendring (`_pdfMode`) og mål-/tegnelenka holdes utenfor.
- **Blå Send**: `var(--info)` + hvit tekst når det er noe å sende (samme på bekreftelsens «Send»);
  dempet som før ellers.
- `_kundeforslagRegressionTest` seksjon K (14 sjekker). 99/99 grønne; `_kundelenkeRegressionTest`
  330/330.

Skjermbilder: `docs/serie-116/skjermbilder/116-*.png`. Spørsmål: `docs/serie-116/SPØRSMÅL.md`.

---

## 115 — Maks CC trinn/repos: leverandørens grense, ikke et blankt tall (21.10.2026, `main`, `ecb71c4`, pushet)

Kenneth: «ta bort maks på maks CC trinn/repos også.»

### Denne var IKKE som 111/112/114

`STAIR_MAX_CC_CM = 12` var merket «hard sikkerhetsgrense» og ble håndhevet helt nede i motoren
(`_stairSurfSettings`), ikke bare i settere og `max`-attributter. Et tall i panelet over 12 ville
vært en **løgn** uten at klemma også gikk.

### Målt på katalogen

| | |
|---|---|
| Trappekabler i katalogen | 148 |
| Som har egen `max_spacing_mm` | **148 (alle)** |
| Verdier | **200 mm** (noen 500) |

Det blanke 12-tallet var altså strengere enn **enhver** leverandørs egen regel — stikk i strid med
husregelen om at monteringsregler er leverandørspesifikke (CLAUDE.md). Konstanten er fjernet.

### Taket nå

Det strengeste av:

* **leverandørens** maks (strengeste på tvers av hele kabelsettet, `_stairSetSpacingLimits`)
* det **geometriske** — forbi største brukbare dybde er strengantallet alt på gulvet (N = 2), og
  større CC endrer ingenting

Uten valgt kabel står det geometriske alene. Sonens tak følger sonens egne flater, som 111/114.
`_stairMaxCcCm` er den ene kilden; elleve steder leser den.

**Forslagsmotoren måtte følge med.** Den leste brukerens maks og klemte den til 12, så en trapp
satt til 16 fikk forslag bygget på 12. Målt etter: ved 16 gir motoren stepCC 12,5 og 240 W/m², og
scoren faller fra 256 til 76 — tetthets-scoringen regulerer seg selv uten et blankt tak.

### Sikkerheten ligger nå der den hører hjemme

Varselet om lav flateeffekt (`STAIR_MIN_DENSITY_WM2` = 250) fantes, men ble **beregnet og aldri
vist** — kun et stumt ⚠️ uten tekst eller `title`. Med CC-taket løftet er dette eneste signalet,
så det sier nå hva som er galt:

```
🪜 Trapp  CC-TEST — InSnow 30T 1200W 40.1m · 77.7 m · 2331 W · 231 W/m² ⚠️ · 231 W/m² er under anbefalt 250
```

Full liste (CC over/under leverandørens grense, kabellengde) i `title`-en.

### Test

`_stairRegressionTest` sjekk 23–29: taket er leverandørens 20 og ikke 12, det geometriske regnes av
brukbar dybde, 16 cm går inn, klemming ved leverandørens maks, **motoren bruker faktisk tallet
brukeren satte**, lav flateeffekt varsles med tall og forsvinner ved normal CC.

---

## 114 — Avstand foran/bak trinn: bort med det faste 10 cm-taket (21.10.2026, `main`, `189075f`, pushet)

Kenneth: «ta bort maks på avstand foran/bak trinn også.»

Fire steder, samme mønster som 111 og 112: `_setStairFrontBackOffset`, `_setStairZoneFrontBack`,
`max="10"` på trappefeltet og 10 som maks i sonens `inheritRow`.

Taket er geometrisk, målt på **trinnenes dybde**. «Avstand foran/bak» er én kontroll som setter
*både* nese og opptrinn, så den spises fra begge kanter av samme trinn:
`usableDepth = d_cm − 2 × verdien`. Passerer den halve trinndybden, faller trinnet stille ut av
utlegget (`if (usableDepth < 0.5) continue`). Taket følger det **grunneste** trinnet — 30 cm gir
14 cm, 22 cm gir 10 cm. Sonens tak følger sonens egne trinn.

Målt: 12 og 13,9 cm går inn der 10 cm før var veggen, og alle ti trinn har fortsatt løp ved taket.

`_stairMaxFrontBackCm` er tredje bruker av `_stairHalfMinusOne` (111/112): **bredde** for sidene,
**reposdybde** for reposmarginen, **trinndybde** for nese/opptrinn.

### Test

`_stairRegressionTest` sjekk 19–22.

---

## 113 — PDF: «Skriv ut / PDF» gjorde ingenting (21.10.2026, `main`, `b9f3fe4`, pushet)

Kenneth 21.10.2026: «Print PDF funker ikke.» Ingen dialog, ingen nedlasting, ingen melding —
i nettleseren og i den installerte Windows-appen.

### STEG 0 — hva kastet, og hvor

Kenneths trappeprosjekt (`Varmekabel i trapp`, 21.10) lastet på localhost, `exportPDF` kalt med
`doc.save` stubbet og tilbehørsvinduet automatisk besvart:

```
ReferenceError: ci is not defined
    at exportPDF (index.html:71986)
```

Linja:

```js
const _sbCab = (stair.cables || [])[ci];   // ci har ALDRI finnes i denne scopen
```

Løkka rundt er `for (const sb of _soneBlocks)` — en `for…of` uten indeks, uendret siden før
feilen ble innført. `ci` var aldri deklarert noe sted i `exportPDF`.

**Commiten som brakk det:** `3eb4500` (105, 20.10) — «avstand sider i sone … for kort kabel
tegnes stiplet rødt og står i panel/PDF». Linja ble lagt inn i en løkke den ikke passet i.
098 (17.10) verifiserte sidene og var grønn; feilen kom to dager etter.

### Hvem var rammet

Linja ligger i trappeseksjonen, innenfor `if (_soneBlocks.length > 0)` — altså enhver trapp med
et kabelutlegg. Målt på `2687b9d` mot seks ekte prosjekter:

| Prosjekt | Før rettingen | Etter |
|---|---|---|
| Varmekabel i trapp (trapp) | **FEIL: ci is not defined** | OK, 11 sider |
| Test Kenneth (trapp) | **FEIL: ci is not defined** | OK, 7 sider |
| Bad | OK, 5 sider | OK, 5 sider |
| Varmekabel 60W | OK, 8 sider | OK, 8 sider |
| Varmematter 60W (EcoMat) | OK, 8 sider | OK, 8 sider |
| P307691/Ektvedt | OK, 7 sider | OK, 7 sider |

Nøyaktig Kenneths avgrensning: alle trappeprosjekter, ingen andre.

### Rettingen

Kabelindeksen bæres allerede av blokka selv — `cableIdx`, satt av
`_stairCableLengthBreakdown` og spredt videre av `_stairSoneGeometryBlocks`:

```js
const _sbCab = (stair.cables || [])[sb.cableIdx];
```

At unntaket forsvinner beviser ikke at indeksen treffer riktig. Målt med en unik markørtekst per
kabel på en trapp der ÉN sone har to kabler (106):

```
Sone 2 · K1   ! MARKØR-kabel-0-sone-2-k0
Sone 2 · K2   ! MARKØR-kabel-1-sone-2-k1
Sone 1        ! MARKØR-kabel-2-sone-1-k0
```

Hver sone-blokk får sin egen kabels avvikstekst. Dette er låst som egen sjekk i røyktesten.

### Ingen stille unntak igjen

`exportPDF` er `async` og ble kalt uten `await`/`catch` fra alle fire kallstedene — et unntak ble
et uhåndtert promise, og brukeren så absolutt ingenting. Ny felles vakt `_runExport(hva, fn)`:

* toast: «PDF kunne ikke lages: &lt;kort melding&gt;. Prøv igjen, eller send skjermbilde av konsollen.»
* full stack i konsollen med prefikset `[PDF]`
* alle sju kallstedene går nå gjennom `exportPDFGuarded` / `exportMaterialListXLSXGuarded`

**Revisjonstelleren** ble talt opp tidlig i funksjonen — målt 4 → 5 på en PDF som aldri ble laget.
Tallet regnes fortsatt ut tidlig (det står på forsiden og i bunnteksten på hver side), men
`S.project.revision` og `lastExportedAt` SKRIVES først rett etter at `doc.save` har gått.

### Test

`_pdfExportSmokeTest()` — 20 sjekker. Kjører hele `exportPDF` med `doc.save` stubbet og
tilbehørsvinduet besvart, på én fixture per type:

| Fixture | Sider |
|---|---|
| innendørs rom med kabel | 5 |
| trapp med soner og FLERE kabler i én sone (106) | 9 |
| trapp med LÅST avstand og udekkede løp (105) | 9 |
| rom med kalkyle + tegnet produkt (109) | 5 |
| rom med frihånds-matte | 5 |
| listedel (Hurtig prosjektering) | 3 |

Krav per fixture: ingen unntak, og minst én side per valgt seksjon (forside + sammendrag + én
per rom og per trapp). I tillegg: riktig kabel-mapping, revisjonen telles kun ved suksess,
vakten returnerer `false` og viser toasten.

**Vaksine:** feilen ble gjeninnført i kilden, og testen ble rød på nøyaktig de to
trappe-fixturene. Røyktesten har i tillegg en innebygd vaksine som injiserer en feil hver gang
den kjører, slik at en test som ikke måler noe ikke kan stå grønn.

---

## 112 — Dybdemargin repos: bort med det faste 20 cm-taket (21.10.2026, `main`, `2687b9d`, pushet)

Kenneth: «ta bort maks på avstand foran/bak repos også.»

Samme to steder som i 111: `_setStairLandingMargin` og `max="20"` på tallfeltet.

Taket er geometrisk, men målt på **dybden**: reposets dybdemargin spises foran *og* bak av samme
flate (`usableDepth = d_cm − 2 × margin` i `_stairSurfSettings`). Passerer den halve dybden, blir
`usableDepth` null og flata faller stille ut av utlegget. Taket følger det **grunneste** reposet —
et 90 cm repos gir 44 cm.

Målt: 25 og 40 cm går rett inn, og begge repos har fortsatt løp helt oppe ved taket.

`_stairMaxEdgeMarginCm` (111) og `_stairMaxLandingMarginCm` deler nå kjernen `_stairHalfMinusOne`:
halve minste flate, minus 1 cm.

### Test

`_stairRegressionTest` sjekk 15–18.

---

## 111 — Avstand sider: bort med det faste 20 cm-taket (21.10.2026, `main`, `ece894e`, pushet)

Kenneth: «ta bort maks verdi på avstand sider. nå får jeg ikke satt mer enn 20 cm.»

### Taket lå FIRE steder, ikke ett

`_setStairEdgeMargin`, `_setStairZoneEdgeMargin`, og `max="20"` på **begge** tallfeltene. En
innstilling med både setter og `max`-attributt per nivå (trapp + sone) har fire kallsteder — let
etter alle fire før den meldes som fjernet.

### Igjen står ett geometrisk tak

`_stairMaxEdgeMarginCm(surfaces, fallbackW)` = `minSurfW / 2 − 1`. Grunnen: avstanden spises av
**begge** sider av samme flatebredde, og passerer 2 × avstand bredden, faller flata **stille** ut
av utlegget — `if (runLength <= 0) continue` i `generateStairCable` gir ingen kabel og ingen
beskjed. Samme uttrykk som `_stairMarginProbe` alt brukte for solverens eget tak.

Sonens tak følger sonens **egne** flater (`_stairZoneSurfaces`, tåler delt sone fra 110) — 240 cm
trinn gir 119 cm, 100 cm repos gir 49 cm.

### Skillet som avgjorde designet

`STAIR_SINGLE_MAX_MARGIN_FRAC` (75 % varmet bredde) styrer hva **motoren** får velge i et forslag.
Et tall brukeren taster brukes nøyaktig og skal ikke underlegges den regelen — se 101 og
105/Regel 22.

---

## 110 — Trappebyggeren: flytt segmenter og sett inn hvor som helst (21.10.2026, `main`, `de6623a`, pushet)

Kenneth: «Jeg har fått slettet nederste repos. Ønsker nå å legge til et repos, men jeg får kun lagt
til trinn eller repos på slutten og ikke på starten. Vil det være mulig å kunne flytte på
"modulene" ved å dra opp/ned eller pil opp/ned?»

Hver segmentrad fikk drahåndtak (⠿) og ▲/▼ (deaktivert i endene, fokuserbare for tastatur). Mellom
hver rad — og over første / under siste — ligger en ＋-stripe som ved hover tilbyr «Trinn» og
«Repos», og som under et drag vokser til slippmål med blå innsettingslinje. Én hjelper,
`_stairBuilderMoveSeg`, brukes av både piler og drag.

### STEG 0 — målt, ikke antatt

**Lista var snudd for «Ovenfra og ned».** `displayIdxs` reverserte for `'top'`, men
`_generateStairSurfaces` gir `segs[0]` `y = 0` (øverst) for den retningen — så rad 0 var segmentet
som ligger **nederst** i planen (målt: y = 160), under overskriften «SEGMENTER (topp → bunn)» og
motsatt vei av sidevisningen rett under. Da ville ▲/▼ og draget flyttet segmenter motsatt vei av
det brukeren ser. Lista er nå byggerekkefølgen i begge retninger (`_stairBuilderDisplayIdxs`); bare
etiketten snur. Det var også dette som gjorde at ＋-knappene la til i feil ende.

**Trappa hoppet.** Med «Nedenfra og opp» flyttet alle eksisterende flater seg 100 cm nedover da et
100 cm repos ble lagt til på slutten. Men «hold den nederste kanten i ro» er ikke nok alene: den
regelen flytter i stedet hele trappa 140 cm **oppover** når et repos settes inn nederst. Begge
ender holdes samtidig ved å feste et **punkt** i stedet for en kant — `_stairBuilderAnchorSeg` er
segmentet som lå først da modalen ble åpnet, holdt på **objekt-identitet** gjennom flyttinger. Da
flytter ingen eksisterende flate seg, uansett hvor det settes inn. `stair.dims` (trappe-lokale)
kompenseres tilsvarende.

**`runsPerStep` overlevde en formendring.** Målt: trinndybde 30 → 50 cm beholdt 3 strenger der
geometrien krever 6 — faktisk CC 23 cm, over den daværende harde grensen. Alle andre settere
nullstiller cachen; nettopp denne veien gjorde det ikke. Et valgt forslag sperret i tillegg
margin-reberegningen; det degraderes nå til `lastProposal` (101/Regel 20), så «↩ Tilbakestill»
fortsatt virker.

### Arv ved innsetting

Nærmeste nabo, ikke «siste i lista»: bredde fra nærmeste segment uansett type, trinn arver
dybde/høyde/antall fra nærmeste trinn, repos arver dybde fra nærmeste repos (ellers 120 cm).

### Soner

`seg.zone` følger segmentet. Deler en flytting en sone, eller lager en innsetting et hull, vises et
gult varsel i modalen før «Lagre» — uten å blokkere.

### Bifunn (ikke rettet)

CSS-variabelen `--brd` brukes **118 steder** i `index.html`, men er **aldri definert**. `var(--brd)`
er ugyldig, og hele deklarasjonen den står i faller bort. Oppdaget fordi innsettingslinja var
usynlig. Ny CSS her bruker `--border`.

### Test

`_stairBuilderMoveRegressionTest110` — 59 sjekker, begge byggeretninger.

---

## 109 — Listevisning: slett kalkyle-produktet i et tegnet rom (20.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 20.10.2026: «Vi må ha en slette-knapp for produkter som er lagt inn i listevisning etter
at rommet er tegnet opp … Hvis jeg i ettertid går inn på canvas og tegner inn et nytt produkt i
samme rom, så kommer rommet opp med to produkter. Jeg ønsker å gå inn på liste og slette det
første produktet jeg la inn.»

### STEG 0.1 — ble begge talt? Ja.

Målt på et rom 500×400: kabel valgt i lista (InSnow 20T 370 W), deretter en ekte matte tegnet på
lerretet (EcoMat 60T).

| | Kun kalkyle | Etter tegnet matte |
|---|---|---|
| `_listRoomDrawnState` | `label` | `drawn` (raden låses) |
| Installert effekt | 370 W | **1270 W** (900 matte + 370 kalkyle) |
| Materialliste | 1 linje | **3 linjer**: kalkyle-kabel 18,2 m · 364 W, DENS reservekabel 18,2 m · 0 W, matta |
| «Bestilles» | 2 stk (1 + 1 reserve) | 2 stk (1 + 1 reserve) — fortsatt kalkylens |
| `_projectKalkyleStatus` | «Kalkyle — ikke detaljprosjektert» | 0 kalkyle / 1 tegnet |

PDF-ens spesifikasjonstabell bygges av `_roomProductRows` og effekten av `_roomRatedEffectW` —
nøyaktig de to funksjonene som ga 3 rader og 1270 W over. Begge produktene telles altså også i
PDF-en. Og forsiden sier ikke lenger at noe er en kalkyle, mens kalkyle-produktet fortsatt
bestilles: det er den stille delen.

### STEG 0.2 — fantes det en vei ut?

Nei, ikke fra lista. Raden er låst når rommet er «drawn» — ingen produktvelger, ingen knapp.
Den ENESTE veien i dag er å velge «kun label»-kabelen på **lerretet** og trykke Slett i ctxbar-en
(`deleteCable`) — og den lar `room.listModType/listCount` bli stående. «Tøm rom» tar ALT, også
det tegnede (målt: `_roomProductCount` = 3).

### STEG 0.3 — hva bærer kalkylen?

`labelOnly`-kabler, `labelOnly`-matter, de AUTO-genererte reservene av disse (reserven av en
`labelOnly`-kabel er selv `labelOnly` — `_syncReserveCables` sprer hovedkabelen), og
`room.listModType` / `listCount` / `listMix`. `room.listFamily` er bare forvalget i
klasse-nedtrekket og røres bevisst ikke.

### Endringen

1. **`_roomProductRows` merker kalkyle-rader** (`row.kalkyle`) og gir dem sin EGEN nøkkel — samme
   grunn som reserven alltid har hatt det: uten den smeltet en kalkyle-kabel og en tegnet kabel av
   samme produkt sammen til «2 stk», og da kan ingen flate skille dem.
2. **`_listClearKalkyle(roomId)`** — den ene operasjonen. Filteret er `labelOnly`, så et tegnet
   utlegg kan aldri rammes (reserven av en TEGNET kabel lages av `_offsetCableClone` og er aldri
   `labelOnly`). Ett `pushUndo` før, cacher invalideres, `markDirty`. `_listClearKalkyleConfirm`
   er bekreftelsen lista og sidepanelet kaller.
3. **Lista**: i en låst rad med kalkyle deles produktcella i to linjer — `TEGNET …` og
   `KALKYLE … 🗑 Slett` — og statuscella får `⚠ N produkter (kalkyle + tegnet)`.
4. **Sidepanelet**: «kun label»-kabler og -matter får et gult **K**-merke og samme 🗑 når rommet
   også har et tegnet utlegg. Bonus: en `labelOnly`-matte sto her som «NaN×NaN cm» — den viser nå
   sitt lagrede areal.
5. **Varselet**: når et ekte utlegg legges i et rom som har kalkyle, kommer en toast med
   «[Fjern kalkylen] [Behold begge]». Den blokkerer ikke, og ingenting fjernes automatisk.
   ⚠ Hvorfor ÉN sjekk og ikke et kall per utleggsmotor: det finnes 20+ steder som pusher et
   tegnet produkt. En liste med kallsteder er nøyaktig «to lister som må holdes i synk»-fella
   108 og `ROOM_PRODUCT_KEYS` ryddet bort. Det som skal varsles er en TILSTAND, og den sjekkes
   i `renderSidebar()` — som hver eneste utleggsvei allerede kaller til slutt. Billig vakt først:
   uten `labelOnly` noe sted koster sjekken to array-skann.

### Test

Ny **`_listKalkyleClearRegressionTest()`** — 32 sjekker, inkludert kalkyle-matte + tegnet kabel
(motsatt vei), frihånds-matte som det tegnede produktet, nabo-rom urørt, og vaksinen: en TEGNET
kabel av SAMME produkt som kalkylen overlever slettingen.

Målt i den ekte listevisningen, på raden:

| | Før | Etter 🗑 |
|---|---|---|
| Produktcelle | `TEGNET EcoMat 60T 0.5×30m` + `KALKYLE InSnow 20T 370W 18.2m 🗑` | `EcoMat 60T 0.5×30m` |
| Status | `⚠ 3 produkter (kalkyle + tegnet)` + `● Tegnet` | `● Tegnet` |
| Installert | 1270 W | **900 W** |
| Bestilles | 2 stk (1 + 1 reserve) | **1 stk** |
| Materialliste | 3 linjer | **1 linje** |
| Toppteksten | 1 tegnet · 0 kun label | 1 tegnet · 0 kun label |

Angre: alt tilbake (1270 W, 2 kabler, `listModType` 'cable', `listCount` 1). ⚠ Det finnes ingen
`redo()` i appen, så «gjør om» kunne ikke testes (samme funn som i 108). Avbryt i bekreftelsen
fjerner ingenting. Rom uten tegnet utlegg: `state=label`, ingen kollisjon, ingen 🗑, og
produktvelgeren står som før.

Batterier (alle grønne, 538 sjekker): `_listevisningRegressionTest` (54 — 059/061),
`_listKalkyleClearRegressionTest` (32), `_geoRegressionTest` (24), `_nyttProsjektRegressionTest`
(25), `_kundeforslagRegressionTest` (85), `_roomMoveRegressionTest` (42),
`_matPathClickRegressionTest` (28), `_matFreeRegressionTest` (13), `_matRegressionTest` (2),
`_matZoneRegressionTest` (4), `_foilRegressionTest` (9), `_cableSkewRegressionTest` (16),
`_cableZoneRegressionTest` (33), `_stairRegressionTest` (24), `_stairManualSetRegressionTest`
(42), `_stairZoneRegressionTest102` (77), `_stairSideRegressionTest` (25).

## 108 — Flytt rom: alt innhold følger med (20.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 20.10.2026: «Når jeg flytter et rom med produkter og hindringer i, så ønsker jeg at alt
flyttes. Slik det er nå så flyttes kun rommet og produktene står igjen. Går det an uten konsekvens
for noe annet?»

Svaret er ja: en flytting er en ren forskyvning. Alt flyttes like langt, ingenting regnes om, og
utlegget blir bit-for-bit det samme — bare et annet sted.

### STEG 0.1 — inventar (lest i koden, verifisert i en kjørende økt)

| Samling | `roomId`? | Koordinatfelt | Fløt med FØR | Nå |
|---|---|---|---|---|
| `rooms` (selve rommet) | — | `points[]`, `walls[]`, `cardPos` | punkter ja, `cardPos` nei | ja |
| `room.dims` | via rommet | `p1`, `p2` (`wnx/wny/offset` er invariante) | **nei** | ja |
| `hindrings` | ja | `points[]` | ja | ja |
| `zones` | ja | `points[]` | **nei** | ja |
| `strips` | ja | `pos_cm`/`start_cm` (akse fra `direction`), `labelPos` | ja (uten `labelPos`) | ja |
| `foilFree` | ja | `cx_cm`, `cy_cm` | **nei** | ja |
| `mats` | ja | `x_cm`, `y_cm`, **`runStarts[]`**, `labelPos` | **nei** | ja |
| `matPaths` | ja | `start`, `labelPos` (`offX/offY` er relative) | **nei** | ja |
| `plates` | ja | `x_cm`, `y_cm` | **nei** | ja |
| `aluboard` | ja | *ingen* — utlegget avledes av rommet | n/a | n/a (eksplisitt tom i tabellen) |
| `cables` | ja | `runs[]`, `connections[].path`, `pathEls[].pts`, `centerline`, `start`, `end`, `labelPos`, `commonStartPt`, `zoneBounds`, `leadRun`, `cells[].bounds`, `_geomDefects[].at` | **nei — ble generert på nytt** | ja, forskjøvet |
| `stairs` | nei — `partId` | — | n/a | n/a (hører til en del, ikke et rom) |
| `floatingDims` | **nei** — `floorId`/`partId` | `p1`, `p2` | n/a | n/a (utenfor; se merknad) |
| `groups` | nei — `stripIds` | — | n/a | følger stripene |
| `documentation` | `roomId` som nøkkel | ingen geometri | n/a | n/a |

`mats.runStarts[]` er den lumske: det er **absolutte** verdenskoordinater langs mattas egen akse
(romform-klippet av `autoFillMatSerpentine`). Glemmes de, blir en klippet matte liggende igjen selv
om `x_cm/y_cm` flytter seg.

### STEG 0.2 — endret kabelen seg av en flytting?

Ja, men ikke geometrien. Målt:
- **Geometrien er forskyvnings-invariant.** L-rom, seks forskyvninger (137/−52, 3/7, −11/23,
  55/55, 1/1, 250/−130): identisk lengde, identisk c/c, identisk antall senterlinje-punkter,
  startpunkt forskjøvet nøyaktig dx/dy i alle seks.
- **Men brukerens valg gikk tapt.** `autoFillCable` leser de globale innstillingene på nytt og
  `Object.assign` overskriver hvert felt den ferske kabelen har. Målt: `startCorner` 'tr' → 'bl'
  etter en ren flytting, og `direction` 'v' → 'h' når `S.varmefolie.direction` var endret i
  mellomtiden. Å forskyve i stedet for å regenerere er derfor strengt bedre.

### STEG 0.3 — andre flytteveier

Ingen. Piltastene flytter en markert **stripe** eller **fri folie**, aldri et rom.
«Rett opp etter vegg» (`startBgStraighten`) retter opp **bakgrunnsbildet**, ikke et rom. Det finnes
ingen kopier/lim-inn av rom. Flyttehåndtaket (X-pil, Y-pil, senter-⊕) er den ene veien, og alle tre
inngangene deler samme kode.

### STEG 0.4 — angre

`pushUndo` dekker alle samlingene i tabellen. ⚠ `S.floatingDims` mangler fortsatt helt i
`pushUndo`/`undo` — kjent hull fra før, men de har `floorId`/`partId` og ikke `roomId`, så de er
utenfor 108. Det finnes heller ingen `redo()` i appen i det hele tatt — «gjør om» kunne derfor ikke
testes.

⚠ Konsekvens for all ny kode her: `pushUndo` klonér bare ETT nivå for de fleste samlingene
(`{...m}`), så snapshotet deler `runStarts`/`labelPos`/`pathEls`-objektene med den levende
tilstanden. Derfor **erstatter** forskyvningen alltid feltene med nye objekter — aldri muterer i
plass — ellers ville angre vært en stille no-op.

### Endringen

1. **`_ROOM_TRANSLATE_SPEC`** — én tabell over samling → koordinatfelt. En ny samling trenger én ny
   linje, ingenting annet.
2. **`_snapshotRoomForMove` / `_applyRoomMoveSnapshot` / `_translateRoomContents`** — flyttingen
   skrives alltid som «startbilde + delta», aldri «legg til litt mer», så rutenett-snappingen ikke
   akkumulerer avrundingsfeil gjennom et langt drag.
3. **Drag-koden har mistet sine egne løkker.** De separate hindring- og stripe-løkkene i
   flytte-grenen er borte; begge ligger nå i tabellen sammen med resten.
4. **Kablene forskyves** ved en flytting i stedet for å genereres på nytt. `autoFillCable` ved
   slipp beholdes KUN for rotasjon.
5. **Veggene forskyves i stedet for å bygges på nytt.** ⚠ MÅLT: `compWalls(rm.points)` kjørte i
   HVER mousemove-frame under et flytte-drag og nullstilte alt brukeren har satt per vegg —
   `thicknessCm` 12 → 0, label «Yttervegg nord» → «Vegg 1», `side` 'in' → 'out', usikkert-flagget
   true → false, og vegg-id 29 → 33 (som gjør `S.ui.selectedWallId` foreldet midt i draget). En
   forskyvning endrer bare endepunktene; lengde og vinkel er invariante.
6. Cacher invalideres og `markDirty` kalles ved slipp.

### Test

Ny **`_roomMoveRegressionTest()`** — 42 sjekker, ett av hver samling, forskjøvet 137/−52:
hvert koordinatfelt forskjøvet nøyaktig, felt som IKKE skal røres (`runLengths`, `offX/offY`,
vegglengde/vinkel, kabelens lengde/cc/retning/startCorner) uendret, nabo-rommet bit-for-bit urørt,
og fram-og-tilbake gir nøyaktig utgangspunktet. **Vaksinen er kjørt:** fjernes én samling fra
`_ROOM_TRANSLATE_SPEC` blir testen rød for alle sju (mats, matPaths, plates, foilFree, cables,
zones, hindrings) — 2 til 12 røde sjekker hver — og grønn igjen når linja settes tilbake.

Ekte drag gjennom lerret-hendelsene, med rom + kabel (valgt retning og hjørne) + frihånds-matte +
folie + plate + fri folie + hindring + sone + mål:

| | delta | resultat |
|---|---|---|
| Fritt drag (senter-⊕) | 136,80 / −52,42 | alt følger, kabel lik lengde/cc/retning, `startCorner` 'tr' beholdt |
| X-låst pil | 136,80 / 0 | alt følger |
| Y-låst pil | 0 / −52,42 | alt følger |
| Rutenett-snap PÅ | 150 / −50 | alt følger SAMME snappede delta |

Angre: tilbake til nøyaktig tilstanden før flyttingen. Lagre + åpne på nytt: alle koordinater
identiske. Andre rom urørt i alle kjøringene.

Batterier (alle grønne, 331 sjekker): `_roomMoveRegressionTest` (42), `_matPathClickRegressionTest`
(28), `_matFreeRegressionTest` (13), `_matRegressionTest` (2), `_matZoneRegressionTest` (4),
`_foilRegressionTest` (9), `_cableSkewRegressionTest` (16), `_cableZoneRegressionTest` (33),
`_stairRegressionTest` (24), `_stairManualSetRegressionTest` (42), `_stairZoneRegressionTest102`
(77), `_stairSideRegressionTest` (25). **`_cableGeoSuite()`: `ok: true`, 142 rader, ingen `feil`,
ingen `endret`, ingen `nye`, ingen `borte`** — altså bit-for-bit samme fasit som før (66,5 s).

### SPØRSMÅL — rotasjon (målt, IKKE bygget)

Rotert et rom med én av hver samling: **rommet, hindringene og stripene roterer med. Mattene,
frihånds-mattene, platene, den frie folien, sonene og rommets mållinjer står igjen.** Kablene
genereres på nytt fra det roterte rommet.

Rotasjon er en annen sak enn flytting, og den har en reell modellbegrensning: matter og plater er
akse-justerte rektangler (`rotation_deg` kjenner bare 0 og 90), og en frihånds-matte er en
akse-justert serpentin. En vilkårlig vinkel har de ingen representasjon for. Selv stripene, som
roterer i dag, roterer bare sitt *posisjonspunkt* — de tegnes fortsatt akse-justert, så ved en
skrå vinkel havner de feil i forhold til rommet.

Mitt forslag, i prioritert rekkefølge:
1. **Rotér innholdet stivt sammen med rommet ved 90°-steg**, og la 90° være det eneste rotasjons-
   trinnet håndtaket tilbyr som standard (det er det montøren faktisk bruker). Da er alt
   representerbart: matter/plater bytter `rotation_deg` 0 ↔ 90, frihånds-mattas `moves[].axis`
   bytter `h` ↔ `v`, og alle punkter roteres om ankeret.
2. **Ved en fri vinkel: advar i stedet for å miste innhold.** Enten blokkér rotasjonen når rommet
   har akse-bundet innhold, eller si tydelig fra at utlegget må legges på nytt etterpå — og rotér
   i det minste punktene (soner, hindringer, mållinjer, kabler) som faktisk tåler det.
3. **Stripenes nåværende halv-rotasjon bør rettes samtidig** — den er misvisende i dag.

Ikke bygget. Si fra hvis du vil ha punkt 1.

## 107 — Frihånds-matte: klikket «hang seg» (20.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 20.10.2026: «Jeg har nettopp lagt ut en EcoMat 60T for frihånd i et rom. Det skjer
ingenting når jeg trykker i canvas … hvis jeg går inn på rommet og trykker på matten som er lagt
ut med frihånd, så henger den seg.» F5 hjalp.

**STEG 0 (målt, ikke antatt).** Kjørt mot Kenneths eget prosjekt «Varmematter 60W» (to
frihånds-matter, EcoMat 60T, 9 og 8 baner, 26,2 m og 16,0 m), lastet inn som ren tilstand med
`_performAutoSave` stubbet — ingen skyskriving.
(0.1) Fanen var **aldri** låst. JS-tråden svarte hele tiden; symptomet var at matta hang fast i
markøren og at klikkene ikke lenger gjorde det de skulle.
(0.2) Ingen ledd var tungt: `_matFreeCatalog`, `_matFreeUsableAreaM2`, `_matFreeCoveredAreaM2` og
`_matPathMoveValid` alle **< 1 ms**, `_matPathPanel` 0,3 ms, `render()` 7–13 ms, én `mousemove`
under drag 0,5–1 ms (snitt 1,1 ms over 20), og **hele mousedown (klikk → valgt matte → panel)
9–28 ms**. `_matFreeSplitPlan` ble målt separat over totalCm 100–30 000 cm: ≤ 0,1 ms for alle
realistiske banelengder (de 19 EcoMat-rullene 2–30 m). Hypotesen «tung eller uendelig beregning»
er **avkreftet med tall**.
(0.3) Ingen unntak — hverken `error`- eller `unhandledrejection`-lytteren fanget noe.
(0.4) Ikke matte-spesifikt: samme oppførsel på begge mattene og på et syntetisk fikstur.
(0.5) **Rotårsaken, reprodusert:** `mousedown` på en frihånds-matte starter umiddelbart en
flytting (`_matDragging=true`, `_matDragKind='matpath'`). Avslutningen — inkludert
tilbakestillingen av en ugyldig posisjon — lå **kun** i mouseup-håndtereren, og den var registrert
på `canvas` alene. `mouseleave` rører med vilje ikke drag-tilstanden. Et museslipp som landet et
annet sted (sidepanelet, verktøylinja, ctxbar-en oppå lerretet, utenfor vinduet) nådde derfor
ingenting: `_matDragging` ble stående `true`, hver senere `mousemove` flyttet matta videre, og
`mp.start` ble aldri tilbakestilt. Reprodusert med et ekte drag sluppet over sidepanelet, bekreftet
visuelt (matta følger markøren, tegnet rød «⚠ ugyldig plassering»).
(0.6) **Symptom 1, egen årsak:** `_applyCycleSelection` rydder `S.ui.selectedMatPathId` for alle
andre typer — men typer med en egen nedfallsgren (rom, stripe, matte, hindring …) går aldri
gjennom den ved idx 0. Målt i Kenneths prosjekt: etter at matta var valgt, viste ctxbar-en **og**
høyrepanelet fortsatt «Frihånds-matte» etter et klikk rett på rommet, så romnes egen verktøylinje
(+Produkt) aldri kom tilbake — «jeg får ikke mulighet til å velge rom, produkt eller opprette nytt
rom», ordrett.

**Endringen.**
1. Mouseup-håndtereren er **navngitt** (`_canvasMouseUp`) i stedet for inline på `canvas` — ingen
   endring i innholdet, slik at reservene under kjører nøyaktig samme avslutning.
2. Ny `window`-reserve: et slipp som ikke traff lerretet kjører samme avslutning. Gatet på
   `_canvasDragActive()`, slik at et hvilket som helst klikk i verktøylinja **aldri** kan falle ned
   i kaskadens hale, der `wbw`/`rect`/`hindring` lager geometri av et museslipp.
3. `blur` og `Escape` avslutter også et pågående lerret-drag, via samme vei.
4. Fall-gjennom-grenen i klikk-syklingen rydder nå `S.ui.selectedMatPathId` på samme sted og etter
   samme regel som `S.ui.selectedBg` allerede ble ryddet.

**Test.** Ny `_matPathClickRegressionTest()` — 20 sjekker gjennom de **ekte** hendelsene (ingen
direkte funksjonskall): klikk → panel på 5,1 ms (krav < 50), slipp utenfor lerretet / `blur` /
`Escape` avslutter draget og tilbakestiller posisjonen, matta følger ikke musa etterpå, og et annet
objekt kan velges. Grønn. Kjørt i tillegg: `_matFreeRegressionTest` (13), `_matRegressionTest` (2),
`_matZoneRegressionTest` (4), `_foilRegressionTest` (9), `_cableSkewRegressionTest` (16),
`_cableZoneRegressionTest` (33), `_stairRegressionTest` (24), `_stairManualSetRegressionTest` (42),
`_stairZoneRegressionTest102` (77), `_stairSideRegressionTest` (25) — alle grønne.
`_cableGeometryRegressionTest` er asynkron og ble ikke ferdig innen økta (rører ingen
lerret-hendelser) — ikke brukt som bevis.

### 107 del 2 — labelen dekket matta (samme runde)

Kenneth: «ja, ta label-dekker-matta også».

**STEG 0 (målt på nytt, med produktkatalogen lastet).** Ved den zoomen prosjektet ÅPNER på
(`fitAll` → 0,287):
- 29 % og 37 % av de to frihånds-mattenes baner ligger under mattas egen label
- 17 % av rommenes samlede gulvflate (214 av 1288 prøvepunkter) ligger under en matte-label
- labelen måler 236×45 px og endrer seg **ikke** når man zoomer ut (pikselgulvet `LABEL_MIN_PX`),
  mens matta krymper — ved zoom 0,3 er label-arealet 0,33–0,53× hele mattas bbox; zoomet inn er
  den nede i 1–5 %

⚠ **Rettelse til min egen første rapport:** påstanden «ingen klikkbar flate ved zoom 0,9+» var
FEIL. Den sonden hadde knekt innramming, så matta lå utenfor lerretet og alle prøvepunkter ble
silt bort. Tallene over er målt på nytt med riktig innramming. Problemet er reelt, men det er et
utzoomet-problem, ikke et «alltid»-problem.

**Årsaken.** Alle fire label-typene (kabel, matte-rektangel, frihånds-matte, folie) svelger
klikket helt — «klikk LÅSER labelen; lag-syklingen kjøres aldri». For en folie-stripe er labelen
liten mot objektet; for en frihånds-matte dekker den en tredjedel, og da er hverken matta eller
rommet under nåbart med musa.

**Endringen (én delt regel, ikke fire kopier).** `_labelStepsAside()`: FØRSTE trykk på en label
oppfører seg bit-for-bit som før (låser + kan dras). Et REPETERT, rent trykk på samme punkt —
samme toleranse (`CYCLE_TOL_PX`) og samme «forrige trykk dro ikke»-test (`_pressMoved`) som
klikk-syklingen selv bruker — lar labelen tre til side, og klikket fortsetter ned til syklingen:
matte → rom → matte, med 1/N-merket synlig. Et slikt gjennomfall **velger kun** (`_cycleSkipDrag`),
starter aldri et drag, så et uhell kan ikke flytte geometri. Minnet nullstilles så snart et trykk
ikke traff noen label, så førstegangs-oppførselen er i behold. Label-drag i én bevegelse (trykk →
flytt → slipp) virker uendret.

I tillegg: «Truly empty grid — clear ALL selections» manglet `selectedMatPathId` — målt: etter et
klikk på tomt lerret sto ctxbar-en fortsatt på «Frihånds-matte». Rettet. (`selectedFoilFreeId`
mangler fortsatt i samme liste — samme hull, bevisst ikke rørt denne runden.)

**Målt etter** med ekte museklikk på Kenneths prosjekt, samme punkt tre ganger: trykk 1 → label
låst; trykk 2 → «🟫 Frihånds-matte» i ctxbar; trykk 3 → «Rom · +Produkt · +Hindring · +Sone» —
altså nøyaktig den verktøylinja han ikke fikk fram. Ingen drag startet underveis.

**Test.** `_matPathClickRegressionTest()` utvidet til 28 sjekker (KRAV 6: label låses ved første
trykk, matta nås ved andre, rommet ved tredje, gjennomfall starter aldri drag, labelen låses igjen
etter et trykk utenfor, og label-drag i én bevegelse virker fortsatt). Alle 11 batterier grønne.

---

## 106 — Trapp: kabelvalg — produktgruppe først, fullt produktnavn, flere kabler per sone (20.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 20.10.2026: «Når man skal endre til en kabel manuelt, bør man kunne først velge
produktgruppe: InSnow 30T 230V eller InSnow 400V. Så bør listen komme opp med "InSnow 30T 3000W
100m". Man kan fint ha et valg for antall kabler også … En knapp for "tilbake til auto" er fint.»

**STEG 0 (målt).**
(0.1) Elleve steder antok **én kabel per sone** — at `stair.cables[zi]` ER sone `zi`:
`_stairZoneInfo`, `_stairSurfSettings`, `_stairSolveZones`, sone-grenen i `generateStairCable`,
sonevelgeren, sammendragsradene, venstremenyens `_stairSoneRowsHtml`, `_stairCableLengthBreakdown`
sin etikett, `_stairSoneGeometryBlocks` og regresjonstesten. Alle leser nå `zone` i stedet for
indeksen, via de nye `_stairZoneCables`/`_stairZoneProductIds`.
(0.2) Åtte produktgrupper finnes (InFloor 10T/17T 230V, InSnow 20T/30T/40T i 230V og 400V).
`product.name` er **alltid** «\<familie\> \<W\>W \<lengde\>m», og 400 V-familiene bærer «400V» i
selve familienavnet — så den gamle etiketten `familie + ' ' + volt + 'V'` ga «InSnow 30T 400V 400V».
Rettet i den felles gruppe-velgeren.

**Endringen.**
1. **Produktgruppe først.** Nytt nedtrekk øverst i kabeldelen, både i sonepanelet og i
   trappepanelet, fra samme kilde (`_stairCableGroups`). Sonens gruppe lagres i
   `zoneSettings[z].preferredFamily/preferredVoltage`; tomt = trappas gruppe. Auto i sonen søker i
   sonens gruppe.
2. **Kabelliste med fullt navn.** `_stairCableListHtml` er **én** komponent, brukt av både sonen og
   trappa uten soner (101). Etiketten er `product.name` — «InSnow 30T 750W 25m» — der det før sto
   «25m · 750W». K-nummer, farge, ✕, «＋ Legg til kabel» og «↩ Tilbake til auto».
3. **Flere kabler per sone.** `zoneSettings[z].productIds = [...]`; 102s `productId` leses som
   `[productId]`, så gamle prosjekter er uendret (målt, I12/I13). `stair.cables` har nå **én
   oppføring per kabel** med `zone`, `zoneCableIdx` og `zoneCableCount`. Sone-grenen sender alle
   sonens kapasiteter til samme `_stairAllocateCables`, så skjøten mellom to kabler i samme sone
   følger Regel 11/13 — målt: K2 starter **innenfor 1 cm** av der K1 slutter, midt i et trinn.
4. **Farger:** sonen eier fargen, og kabel 2, 3 … i samme sone får en gradvis lysere nyanse
   (`_stairZoneCableColor`). Soneinndelingen er det man skal se først.
5. **Sidefunn, målt og rettet:** tegningen hentet kabelfargen med et **indeksoppslag** i en global
   liste (`STAIR_CABLE_COLORS[seg.cableIdx]`, og i PDF-en en lokal liste med bare **tre** farger).
   Med to kabler i sone 3 ble den andre tegnet i sone 1s oransje, og markøren het «K4».
   Fargen leses nå fra kabelen selv (`_stairCableColorAt`), og etiketten er «S1/S2» per sone og
   «K1/K2» innenfor en sone med flere.
6. Venstremenyens sonerad viser «2 kabler · 1350 W», PDF-ens Regel 17-blokk «Sone 3 · K1» og
   «Sone 3 · K2» med hvert sitt el.nr/art.nr, og materialliste/XLSX får begge via `_stairProductRows`.

**Målt resultat.** Sone 3 (6 trinn, behov 45,0 m) med 25 m + 20 m: begge lagt (25,0 + 20,0 m),
margin 13,0 cm — **samme som auto fant for én 45 m-kabel** — status 🟢 Passer, sone 1 og 2 uendret.
«Tilbake til auto» gir bit-identisk samme utlegg som før 106. Gruppebytte til «InSnow 30T 400V»
flytter begge radene til nærmeste lengde (25 → 25,5 m).

**Ny test:** `_stairZoneRegressionTest102` fikk seksjon I (77 påstander totalt) — flere kabler per
sone, skjøten, at sonen fortsatt går nedenfra og opp (104), «tilbake til auto», migreringen fra 102,
gruppe per sone og at etiketten ikke dobler spenningen.

---

## 105 — Trapp: avstand fra sidene i en sone — tomt = auto, tall = låst nøyaktig (Regel 22) (20.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 20.10.2026: «Jeg ser også at det ikke skjer noe endring når jeg reduserer avstand til sider
nærmere enn 6 cm. Det bør kunne gå. Da skal kabel bli for kort i enden, og det må vises.»

**STEG 0 (målt).**
(0.1) Bekreftet. Feltet var et GULV. Tastet 9, 7, 5 og 3 cm i sone 2 — løst avstand ble **15,7 cm i
alle fire tilfellene**, fordi løserens eget svar allerede lå over gulvet. Riktig etter Regel 12, men
ikke det Kenneth ville ha.
(0.2) En for kort kabel ble **ikke tegnet i det hele tatt**: `_stairAllocateCables` stoppet når
kapasiteten tok slutt og kastet resten (`continue`). Målt på sone 3 med 20 m mot et behov på 48,9 m:
trinn 5–6 fikk fire løp, trinn 7 fikk to, og trinn 8–10 fikk **null** — uten en strek på tegningen.
PDF-en viste samme: bare gruppene som faktisk ble lagt.
(0.3) `zoneSettings[z].edgeMarginMin_cm` leses tre steder: `_stairSurfSettings` (visning),
`_stairZoneSubStair` (sonens gulv til løseren) og sonepanelets felt. Verken PDF eller venstremeny
leser det direkte — de leser den LØSTE verdien på `stair.cables[zi].edgeMargin_cm`.

**Migreringsvalget.** `edgeMarginMin_cm` beholder sin gamle betydning («gulv»), og den LÅSTE verdien
får et nytt felt, `zoneSettings[z].edgeMargin_cm`. Prosjekter laget før 105 oppfører seg derfor
nøyaktig som før — målt (test H13/H14). Et gammelt gulv vises fortsatt i feltet, merket «(min)»;
først når brukeren redigerer feltet, blir avstanden låst, og det gamle gulvet ryddes bort.

**Endringen.**
1. **To tilstander, ett felt.** Tomt = auto (plassholderen viser hva auto landet på, «auto: 15.7»).
   Tall = låst: brukes nøyaktig, og en «↩ Tilbake til auto-avstand»-knapp tømmer det. Låst felt har
   hengelås og accent-ramme.
2. **`_stairFitLockedMargin`** — med låst avstand løses ingen margin. Behovet regnes ved den låste
   verdien, og avviket vurderes med `_stairFitFromLengths` (≤ 2 % passer, 2–5 % gul, > 5 % rød).
   AUTO-kabel velger den i familien som er nærmest behovet, helst **kortere** (Regel 11).
3. **Det synes.** `_stairAllocateCables` bærer nå ut de delene kabelen ikke rakk (`uncoveredRuns`)
   i stedet for å kaste dem. De tegnes **stiplet rødt** i planen, i sidevisningen og i PDF-en.
   Terskel 5 cm, så mm-snappingens restavvik (Regel 15, målt 0,4–1,4 cm) ikke blir til falske
   «udekkede løp».
4. Panelet sier «Kabelen er X m for kort — Y løp dekkes ikke», PDF-ens trappeside det samme per
   sone, og venstremenyens sonerad får ⚠ ved gul OG rød (før bare rød) pluss 🔒 når avstanden er låst.
5. 75 %-grensen (Regel 19) gjelder ikke en låst avstand — under 75 % varmet bredde er en gul merknad.

**Målt resultat** (sone 2 = repos, behov 28,0 m ved 5 cm):

| oppsett | avstand | kabel | status |
|---|---|---|---|
| auto | 15,7 cm | 25 m | 🟢 Passer, 0 udekkede |
| låst 5 cm, manuell 25 m | **5,0 cm** | 25 m | 🔴 3,0 m for kort — **2 løp** stiplet rødt |
| låst 9 cm, manuell 25 m | **9,0 cm** | 25 m | 🔴 1,9 m for kort — 1 løp |
| låst 20 cm, manuell 25 m | **20,0 cm** | 25 m | 🟡 1,2 m for lang |
| låst 20 cm, AUTO-kabel | 20,0 cm | **20 m** (nærmeste kortere) | — |
| tomt igjen | 15,7 cm | 25 m | som før 105 |

Angre, lagre og åpne på nytt: begge holder (målt). **Trapper uten soner er urørt.**

**Ny test:** `_stairZoneRegressionTest102` fikk seksjon H (61 påstander totalt) — auto, «et gulv under
auto-svaret flytter ingenting» (selve 105-klagen), låst brukes nøyaktig, for kort gir udekkede løp,
for lang gir gul, auto-kabel med låst avstand velger nærmeste kortere, og migreringen fra 102.

---

## 104 — Trapp: hver sone legges nedenfra og opp (Regel 14 per sone) (20.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 20.10.2026: «Trappen er bygd nedenfra og opp. Da starter kabel nederst i sone 1. Men i sone 2,
så starter repos i motsatt retning slik at kabelendene på sone 1 og sone 2 møtes og ligger et trinn
fra hverandre.»

**STEG 0 (målt på 4 trinn / repos / 6 trinn, tre soner, bygd nedenfra).** Tabellen under er verdens-y;
**større y = lenger NED** (`w2s` måler det, se 103).

| sone | flater | start | slutt | nedenfra og opp? |
|---|---|---|---|---|
| 1 (trinn 1–4) | 0–3 | flate 0, y=418 | flate 3, y=302 | ✅ |
| 2 (repos) | 4 | flate 4, **y=185** | flate 4, **y=295** | ❌ **motsatt** |
| 3 (trinn 5–10) | 5–10 | flate 5, y=178 | flate 10, y=2 | ✅ |

Sone 1 slutter ved y=302 og sone 2 starter ved y=185 — **117 cm unna, i motsatt ende**. Sone 2
slutter ved y=295, rett ved der sone 1 sluttet. Nøyaktig det Kenneth så.

**Årsak: rutingen, ikke markørene.** Promptens to hypoteser var (a) omvendt emisjon i sone-grenen
eller (b) feil gjetning i markørkoden. Målt: ingen av dem — feilen lå i `generateStairCable` sin
posisjonsformel:
```
const pos = (isLanding || startFromTop) ? (depthStart + ri*CC) : (depthEnd - ri*CC);
```
`isLanding` tvang reposet til å telle fra motsatt kant av et trinn. Kommentaren begrunnet det med
«Repos har ingen retningspreferanse (symmetrisk landingMargin)» — og **den premissen er feil**:
marginen er symmetrisk, men retningen kabelen traverserer flaten i er det ikke.

**Gjelder også uten soner.** Målt på samme trapp uten soner: kabelen gjorde to hopp på 117 cm over
reposet i stedet for én gjennomgående kjede. Soner gjorde bare feilen synlig, som to kabelender ved
siden av hverandre.

**Endringen.** Én betingelse, som nå leser begge flaggene som bestemmer hvilken vei kjeden går:
```
const bottomUp = (stair.buildDirection || 'bottom') !== 'top';
const enterAtLargePos = bottomUp !== startFromTop;
const pos = enterAtLargePos ? (depthEnd - ri*CC) : (depthStart + ri*CC);
```
`buildDirection` er samme flagg sidevisningen alt bruker (`_stairSideX`). Et repos følger nå samme
regel som et trinn, i alle fire kombinasjonene av `buildDirection` × «Kabelstart: Topp».

**Målt resultat** (avstand mellom der kabelen forlater én flate og møter den neste, innenfor hver
kabel — et sonebytte er en ny, fysisk atskilt kabel og telles ikke):

| oppsett | før | etter |
|---|---|---|
| bunn, med soner | K1 4,4,4 · **K2–K3 117 cm fra hverandre** | K1 4,4,4 · K2 · K3 4,4,4,4,4 |
| bunn, uten soner | 4,4,4,**117**,**117**,4,4 | 4,4,4,7,7,4,4 |
| bunn + «Kabelstart: Topp» | — | 4,4,4 · K2 · 4,4,4,4,4 |
| `buildDirection:'top'` | **56 cm på hvert trinn** | 4,4,4 · K2 · 4,4,4,4,4 |

Strengantall, CC og total kabellengde er **uendret** i alle oppsett (10 036,8 cm med soner,
10 970 cm uten) — bare rekkefølgen flatene traverseres i endret seg.

**Én kilde for start/slutt.** Plan, sidevisning og PDF hadde tre ordrette kopier av «hvilken vei går
kabelen». Plan-tegningen og PDF-ens plan leser nå `_stairCableEndpoints` (098), som sidevisningen
alt gjorde — to kopier mindre å holde i synk.

**Ny test:** `_stairZoneRegressionTest102` fikk seksjon F (47 påstander totalt): hver sone starter i
sin nedre halvdel og slutter i den øvre, sone 1→2 og 2→3 møtes innenfor 15 cm, og «Kabelstart: Topp»
snur alle sonene likt. Vaksinetestet — med den gamle repos-retningen blir 5 av dem røde.

---

## 103 — Trapp: Kenneths svar på 101/102; lite overskudd er «Passer» med merknad; dobbelt produktnavn bort; åtte røde sjekker målt (20.10.2026, `main`, `89c1cd7`, pushet)

**Del A.** Kenneths svar på alle 14 spørsmålene fra 101 og 102 er skrevet inn under hvert spørsmål i
`docs/trapp/prompter/SPØRSMÅL.md`. To av dem krevde endring (101/1 og 101/6); resten var bekreftelser.

**Del B.1 — én regel for overskudd (101/1).** `_stairFitFixedSet` ga `ok:false` straks settet var
lengre enn behovet ved gulvet — også for 8 cm av 70 m (0,1 %). Panelet ble rødt rett over en grønn
«Passer»-linje: **to regler for samme sak.** Overskudd vurderes nå med `_stairFitFromLengths`,
den samme funksjonen «Samlet behov / Samlet kabel» alt brukte:

| Overskudd | Før 103 | Etter 103 |
|---|---|---|
| ≤ 2 % | rød «for lange» | `ok:true`, «Passer», dempet merknad «X til overs» |
| 2–5 % | rød «for lange» | `ok:true`, gul merknad «X til overs» |
| > 5 % | rød | rød (uendret) |

Marginen står på gulvet i alle tre tilfellene — den kan ikke gå lenger ned (Regel 12). «For kort»
(75 %-grensen, Regel 19) er uendret og fortsatt rød. Gjelder både manuelt kabelsett (101) og kabel
per sone (102), siden begge går gjennom `_stairFitFixedSet`. Ny linje under Regel 20 i spec-en.

**Del B.2 — dobbelt produktnavn (101/6).** Linja over kabellista gjentok det lista alt viste
(«InSnow 30T 2100W 70m 70m»). Den vises nå bare når det ikke finnes noen kabel («Ingen kabel valgt»).
Samme dobling i sonens eget panel («… 25m (25 m)») er fjernet.

**Målt resultat.** Frydenbø Trapp 1 med 70 m-kabelen: 8 cm over behovet = 0,11 % → «🟢 Passer» med
dempet merknad, ikke rødt. Samme trapp med 78,7 m (11,2 % over) → fortsatt rød. Tester utvidet:
`_stairManualSetRegressionTest` fikk B2d–B2l (≤ 2 % passer med merknad, like over 5 % fortsatt rød,
2–5 % gul på en trapp med gulv 4 der 78,7 m er 4,24 % over), `_stairZoneRegressionTest102` fikk
C8–C13 (lite overskudd i en sone er merknad, ikke feil). 42 + 36 påstander, alle grønne.
`_cableGeoSuite()` grønn, 142 rader, uendret mot baselinjen (Del B rører ikke rommotoren).

**Del C — måling, ingen retting.** De røde sjekkene i `_cableGeometryRegressionTest` er **åtte**,
ikke tre som 102-loggen sa (min egen `.slice(0, 3)`). En egen kjøring med bare de åtte tar under
15 s mot batteriets 127 s, og halveringen i en egen `git worktree` fant commiten for hver enkelt:
083 (`e13d2b9`) tok én, 088 (`5c929ef`) tok fire, 088b (`b11dc9e`) tok to, 089 (`a365c70`) tok én.
Sju er **utdaterte påstander** (de låser tall fra før den speilvendte y-aksen ble rettet, og før
Rom 5-fixturet ble hentet på nytt); én er en **ekte forverring** (`077: uten biblioteket legges det
fortsatt ut` — 083s harde kaskadefilter bryter fail-open-regelen). Full tabell med målt grunnlag i
`docs/kabel/STATUS.md` §44, forslag til retting i `SPØRSMÅL.md` under «103». Ingenting er rettet.

---

## 102 — Trapp: hver sone som eget rom — velg sone, bytt kabel, se sonens egne mål (19.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 19.10.2026: «Den fyller seg ut automatisk når jeg setter soner, det er bra. Men jeg ønsker
også etterpå å kunne velge en sone og endre kabel manuelt. Jeg savner også å kunne se detaljer i
sidemenyen, som f.eks. avstand fra kanter i hver sone. Jeg ønsker at hver sone blir som hvert sitt
rom.» Nytt: spec-trapp-kabelutlegg.md **Regel 21**.

**STEG 0 (målt på en trapp delt i 4 trinn / repos / 6 trinn).**
(0.1) Alle fire påstandene bekreftet: `_stairSolveZones` løste ALLTID auto; et manuelt kabelvalg
(`_setStairCableProduct`) satte `cableProductId` uten å nå fram (sonene skrev over `cables` ved hver
regenerering); én sone som feilet ga `ok:false` for HELE trappa, og `_regenerateStairCable` frøs de
forrige kablene; panelet viste trappas felles tall (kantavstand 8,5) der sonene hadde 12,8 / 15,7 /
13,0.
(0.2) **Begge.** Trapper STÅR i venstremenyen (`stairItemHtml`), men hadde ingen underrader — mens
rom har dem (`_soneRowsHtml`). Bygget begge steder: sone-underrader i venstremenyen og sonevelger i
panelet.
(0.3) **Nei.** `hitStair` treffer bare trappas ytre boks. Flategeometrien finnes
(`surf.x_cm/y_cm/w_cm/d_cm`, samme regning som `_stairDimSnap` sin plan-gren), så en liten ny
`_hitStairSurface(stair, wx, wy)` var alt som manglet.
(0.4) Bare SIDEMARGINEN ble lest per flate (`zoneMarginForSurf`). Maks CC (trinn/repos), avstand
foran/bak og repos-dybdemargin ble lest ÉN gang for hele trappa, utenfor flate-løkka — og
`runsPerStep`-cachen fra et forslag gjaldt alle trinn, også i soner med egen CC.

**Endringen.**
1. **`stair.zoneSettings[<sonenummer>]`** = `{ productId, edgeMarginMin_cm, stepCC_cm, landingCC_cm,
   noseOffset_cm }`. Alt valgfritt; tomt = arv fra trappa. Nøkkelen er sonenummeret, ikke en indeks,
   så innstillingene følger sone 2 selv om segmentene flyttes. Lagres med trappa, er med i angre, og
   ryddes ved lagring (`_stairPruneZoneSettings`) for nummer som ikke lenger finnes.
2. **`_stairSurfSettings(stair, si, zoneRanges)`** — de EFFEKTIVE målene for én flate (sonen først,
   så trappa). Én kilde, brukt av motoren, panelet, skjermtegningen, PDF-tegningen, målsettingen,
   detaljutsnittene og PDF-ens sonetekst. Uten soner gir den nøyaktig trappas verdier.
3. **`_stairZoneSubStair(stair, range)`** — sonen som sin egen lille trapp (egne flater, eget gulv,
   egen maks CC og avstand foran/bak). `segments: []` gjør at `_stairZoneRanges` på den returnerer
   null, så motoren regner sonen som en helt vanlig trapp — ingen rekursjon.
4. **`_stairSolveZones`**: auto som før (`_stairSolveExactCableSet`, `maxCables:1`), manuell kabel
   via **`_stairFitFixedSet`** fra 101 — ingen ny margin-matte. Hver sone feiler for seg: feilen
   legges på sonen (`stair.cables[zi].error`), marginen på gulvet, og de andre sonene løses og
   tegnes. `stair.zoneError` betyr nå KUN «sonene kan ikke brukes» (hull i inndelingen) — det er det
   eneste `generateStairCable` faller tilbake fra. Sammendraget ligger i `stair.zoneIssues`.
5. **Panelet**: sonevelger øverst («Hele trappa · Sone 1 · Sone 2 …», med sonens farge og ⚠).
   «Hele trappa» viser dagens felles innstillinger + én klikkbar linje per sone. En valgt sone viser
   sitt eget panel: kabel (Auto / produkt / «Tilbake til auto»), sonens gulv og løste kantavstand,
   avstand foran/bak, maks CC trinn/repos (alle med «som trappa» som tomt felt), og sonens resultat
   — behov, lagt, kabel, effekt, flateeffekt (Regel 16), løp og faktisk CC.
6. **Venstremenyen**: underrader per sone under trappa (samme mønster som romsonene), med dekning,
   kabel, W og kantavstand. Klikk velger sonen.
7. **Tegningen**: valgt sone uthevet, de andre dempet. `S.ui.selectedStairZone` (nytt felt — IKKE
   `selectedZoneId`, som er romsoner) nullstilles når trappa velges bort. Klikk på et trinn velger
   sonen (`_hitStairSurface`).
8. **Sidefunn, rettet samtidig** (samme årsak — trappas verdi brukt per flate): U-svingbuene,
   per-flate-lengdene, overgangslinjene mellom flater, målsettingen på skjerm OG i PDF, og
   detaljutsnittenes bildetekst leste alle trappas sidemargin. I tillegg fikk et REPOS tegnet
   SIDE-marginen som dybdemål i målsettingen (motoren har alltid brukt `landingMargin_cm`): utsnittet
   av Repos 1 sto «8,5 / 5» og «27 m kabel på repos» — nå «5 / 5» og «25 m».

**Målt resultat.** Auto-sonene er bit-identiske med før 102 (målt mot `b47a65d`: 30 m@12,8 /
25 m@15,7 / 45 m@13,0, samme strengantall per flate). Manuell 40,1 m i sone 3 gir kantavstand
23,2 cm mens sone 1 og 2 står helt stille. En for lang kabel i sone 2 gir rød melding PÅ SONEN, og
sone 1 og 3 tegnes som normalt. Maks CC 6 cm i sone 3 gir 6 løp per trinn der og 4 i de andre;
tomt felt gir det gamle tilbake.

**Ny regresjonstest:** `_stairZoneRegressionTest102()` (30 sjekker). `_stairRegressionTest`,
`_stairSideRegressionTest` og `_stairManualSetRegressionTest` er fortsatt grønne, sammen med 22
andre batterier. `_cableGeometryRegressionTest` har gamle, røde sjekker (romkabel-geometri) —
nøyaktig de samme på `b47a65d`, altså ikke rørt av 102.
⚠ **Rettet i 103:** her sto det «tre» røde sjekker. Det er **åtte**. Feilen var min — jeg skrev ut
bare `results.filter(!ok).slice(0, 3)` og leste de tre som kom ut som hele listen. Full måling av
alle åtte, med commiten som gjorde hver enkelt rød, står i `docs/kabel/STATUS.md` §44.

---

## 101 — Trapp: manuelt kabelsett (ulike kabler i lista), fast sett løser sidemarginen som Forslag (19.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 19.10.2026: «Jeg ønsker også å kunne legge ut kabler manuelt, dvs. at jeg f.eks. kan velge
tre ulike kabler som legger seg jevnt ut i hele trappa.» Avklart: «jevnt» = hele trappa dekkes, lik
CC hele veien, og sideavstanden justeres automatisk så summen av kabellengdene går opp — slik
Forslag gjør i dag. Nytt: spec-trapp-kabelutlegg.md **Regel 20**.

**STEG 0 (målt før endring).**
(0.1) Et Forslag med ULIKE lengder (Frydenbø, forslag B = 20 m + 49,7 m) viste allerede riktige,
forskjellige produkter i materiallista, PDF-ens trappeside, Trappeoversikten og XLSX — de går alle
gjennom `_stairCableLengthBreakdown`/`_stairSoneGeometryBlocks`, som leser `stair.cables[]`. Det var
altså IKKE «første kabel ganger antall» der. Feilen lå i de små, enkeltprodukt-lesende stedene.
(0.2) Sju lesesteder leste `stair.cableProductId` (rad 1) i stedet for settet: `_stairSpacingDelta`,
`_stairPerStepWm2`, `_renderStairSettingsPanel` (produktlinja + variant-nedtrekket),
`getStairCableViolations`, ctx-barens én-kabel-gren, `_expPreviewStair` og PDF-ens fallback-gren.
Fire til leste `cables[]` MEN med hver sin egen fallback-kopi (`_projectUsedProductIds`,
HTML-forhåndsvisningens materialliste, PDF-materiallista, `_collectMaterialItems`).
(0.3) `stair.cables` OVERLEVER alle målendringer etter et Forslag (kantavstand, maks CC trinn/repos,
dybdemargin, CC-piler, og redigering av trinn/segmenter). Det er bare `_setStairFamily`,
`_setStairCableProduct`, `_setStairDesiredCableCount` og «Fjern varmekabel» som nullstilte lista.

**Endringen.**
1. **`_stairMarginProbe(stair)`** — den delte margin-matematikken (strengantall + behov ved gulvet,
   den lineære margin-løsningen, mm-snapping, begge margin-takene). `_stairSolveExactCableSet` sin
   `tryCombo` og dens én-kabel-kandidat regner nå gjennom den; ingen kopi.
2. **`_stairFitFixedSet(stair, productIds)`** — fast kabelsett → `{ ok, edgeMargin_cm, residual_cm,
   reason }`. For langt (Regel 11: kan ikke kappes) → «Kablene er X for lange — velg en kortere
   kabel». Over 75 %-grensen (Regel 19) → «Kablene er X for korte». Ellers margin snappet til hele
   mm (Regel 15) + restavvik. Brukes også av 102 (kabel per sone).
3. **Kabellista i trappepanelet** (når soner er AV): én rad per kabel i `stair.cables` — farge-prikk,
   K1/K2/…, produktvelger og ✕, pluss «＋ Legg til kabel» (kopierer siste rads produkt). Lista ER
   `stair.cables`; `cableProductId` følger rad 1. «Antall kabler» viser antall rader og legger til /
   fjerner bakfra. Nye funksjoner: `_setStairCableRow`, `_addStairCableRow`, `_removeStairCableRow`,
   `_stairApplyManualCables`.
4. **Marginen løses ÉTT sted**: i `_regenerateStairCable`, gated på «ikke soner, ikke et valgt
   forslag, ikke uten kabel». Dermed følger marginen med når brukeren senere endrer et mål — alle
   setterne går gjennom der. Et valgt forslag røres ikke (det har allerede løst sin egen margin, og
   de to takene er ikke identiske).
5. **`_stairProductRows(stair)`** — én kilde for trappens produkter (produkt, lengde, lagt lengde,
   W), i samme ånd som `_roomProductRows` (097). Alle elleve lesestedene fra STEG 0.2 leser nå den.
   `_stairSetSpacingLimits` gir strengeste min/maks CC på tvers av settet.
6. **«Tilbakestill»**: et manuelt bytte setter `selectedProposal = null` (Regel 20), men forslaget
   huskes i `lastProposal`, og `_resetStairToProposal` gjenoppretter nå også forslagets KABELSETT.
7. Panelet viser ÉN sannhet: er det manuelle settet ugyldig, blir «Samlet behov / Samlet kabel»-linja
   rød med samme grunn — ikke grønn «Passer» rett under en rød melding.

**Målt resultat.** Forslag er bit-identisk før/etter for Frydenbø Trapp 1, Test Cenika Trapp 1 og en
trapp med repos (#276), og for tre syntetiske trapper målt mot `64876ef`. Tre ulike InSnow 30T
(10 + 20 + 49,7 m) på Test Cenika Trapp 1: kjeden dekker hele trappa (79,69 m av 79,7 m kabel), lik
CC 8,67 cm på alle ti trinn, sideavstand justert 5 → 7,3 cm, brukerens gulv urørt.
**Frydenbø, én manuell kabel:** 70 m-kabelen er 8 cm LENGER enn behovet ved brukerens 12,5 cm gulv.
Før sto det grønt «Passer»; nå står marginen på gulvet (uendret utlegg) og panelet sier hvorfor.

**Ny regresjonstest:** `_stairManualSetRegressionTest()` (33 sjekker) — Forslag-fasit for tre
trappeformer, `_stairFitFixedSet` for ok/for langt/for kort/blandet sett, kabellista, «et valgt
forslag refittes ikke», Tilbakestill, og at soner er urørt. `_stairRegressionTest` og
`_stairSideRegressionTest` er fortsatt grønne, sammen med 18 andre batterier.

---

## 100-web — Innebygd modus `?embed=app`: Varmeplan inne i feltappen, økt fra appen uten fornying, bare visning, berøring (18.10.2026, `main`, `89c1cd7`, pushet)

Fellesprompt 100 for app og web (`prompter/feltapp/lop-051-052-100/100-…md`). Kenneth 18.10.2026:
kabelmotoren bor bare i weben; appen viser weben i en WebView, allerede innlogget, og tegningen kan
flyttes og zoomes med fingrene. **Ingen redigering** — det er neste prompt. App-delen ligger i
`varmeplan-app` (commit 100 der: `react-native-webview`, `app/(modules)/varmeplan-web.tsx`,
`src/lib/webEmbed.ts`).

**STEG 0 (målt før endring).** (0.1) web på `f9fe084` (036), `main` ren og lik `origin/main`; ingen
serie midt i. App på `c3e666d` (051 + 052 kjørt). (0.2) **Øktoverføringen, målt i klientkoden:**
appen bruker `@supabase/auth-js` 2.108.2 — `_callRefreshToken` → `_refreshAccessToken` → POST
`/token?grant_type=refresh_token`, og hvert svar gir et NYTT refresh-token; `getSession()` fornyer
bare når `autoRefreshToken` er satt (GoTrueClient.js l. 4004). Weben laster `supabase-js@2` fra CDN
med `createClient(url, key)` uten innstillinger → `autoRefreshToken: true` og `persistSession: true`
(localStorage) som standard. **Hypotese (dokumentert serveroppførsel, ikke målt her):** Supabase Auth
roterer refresh-token og oppdager gjenbruk utenfor et kort reuse-intervall → hele token-familien
trekkes tilbake. To klienter som fornyer samme refresh-token hver for seg ville altså logget ut
begge — også appen. Påstanden i prompten **bekreftes** så langt klientkoden kan vise det; derfor
fornyer bare appen. (0.3) «tilpass»-funksjoner: `fitAll()` (l. 60959, hele prosjektet/aktiv del) og
`fitRoom(id)` (l. 53871, ett rom); `selRoom(id)` (l. 53843) velger rommet og kaller `fitRoom`.
(0.4) Lerretet: `canvas.addEventListener('wheel')` (l. 60320) zoomet mot pekeren med formelen inline;
mus-pan satte `_panning/_panStart/_panSV` i `mousedown` (l. 57453 readOnly-grenen, l. 57466 present,
l. 57485/57491 vanlig) og regnet `S.view.panX/panY` inline i `mousemove` to steder (l. 59046 present,
l. 59239 vanlig). Ingen berøring på hovedlerretet (bare signaturfeltene og 030s kundeside-bro).
(0.5) Prosjektskjermen i appen etter 051 er `app/(modules)/prosjekt.tsx`; «Åpne i Varmeplan» ligger
under prosjektnavn/adresse, og hvert rom har «Vis rommet i Varmeplan» (sender `room=`).

**Design valgt:** det prompten beskriver — appen eier kjeden. Appen sprøyter økten inn før siden
laster (`window.__VP_APP_SESSION`, bare på tillatt vert), weben lager `_db` med
`{persistSession:false, autoRefreshToken:false, storageKey:'vp-embed'}` og kaller `setSession()`.
Under 5 min igjen → `postMessage({type:'vp:need-token'})`; appen fornyer med egen klient og sender ny
økt via samme global + `CustomEvent('vp:session')`. Token aldri i URL, aldri i logg; global slettes
etter bruk. Et **utløpt** access-token avvises uten `setSession` (det ville fått biblioteket til å
fornye selv, utenfor appens kjede) — weben ber appen om nytt i stedet.

**Gjort (alt gatet på `_isAppEmbed()` = `?embed=app`, strengt):**
* `initSupabase()`: embed-grenen er første setning i `try`; resten av funksjonen (`?present=`,
  `?kunde=`, `&forslag=`, eksisterende økt, `?dev`, innloggingsskjerm) er uendret.
* `_appEmbedInit()`: body-klasse `app-embed`, viewport låses mot nettleser-zoom, høyreklikk
  stoppes, egen klient, venter inntil 3 s på økten, `setSession`, token-vakt hvert minutt,
  `vp:session`-lytter, `SIGNED_OUT` → «Logg inn i appen på nytt». Uten økt fra appen vises
  **«Logg inn i appen på nytt»** (`#embed-login`), ikke Varmeplans innlogging. Deretter samme
  `_authCheckProfileAndProceed()` som vanlig innlogging.
* `_initAfterAuth()`: i innebygd modus hoppes prosjektliste, autosave og gjenoppretting over;
  `?project=` åpnes med eksisterende `_kundeOpenFromMail` → `_openCloudProject` (ingen kopi), så
  `_appEmbedAfterOpen()`.
* `_openCloudProject()`: **ingen lås** i innebygd modus (en kollega i web skal ikke se montøren som
  «arbeider i prosjektet»); `S.ui.readOnly = true` gater all redigering som ved lås. Panelet for
  kundesvar åpnes ikke. `_lockToast()` sier «Visning – redigering kommer» i stedet for lås-teksten.
* `_appEmbedAfterOpen()`: body `readonly` (CSS-gating, uten banner), romlinje `#embed-bar`
  (prosjektnavn, rom-chips → `selRoom`, merke «Visning – redigering kommer»), `resizeCanvas()`,
  `&room=` → `selRoom(id)` (zoomer dit med `fitRoom`), ellers `fitAll()`; `vp:ready` til appen.
  CSS skjuler `#topbar #sidebar #sidebar-resizer #ctxbar #wip #statusbar #feedback-btn #zoom-badge`.
* **Berøring** (`_appEmbedTouch`, bare i innebygd modus, `touch-action:none` på lerretet): én finger
  panorerer, to fingre zoomer rundt midtpunktet. Kaller de **samme** funksjonene som musa: ny
  `_panMove(clientX, clientY)` (formelen fra `mousemove`, som nå kaller den begge steder) og ny
  `_zoomAtCanvasPoint(mx, my, zoom)` (formelen fra hjul-håndtereren, som nå kaller den). Ingen ny
  tegneregel; kabelmotoren og utleggsreglene er urørt. `sw.js` urørt.
* **Regresjonstest** `_appEmbedRegressionTest()` (30 sjekker, synkron): porten (`_isAppEmbed` streng),
  `initSupabase`-grenene (embed før `createClient`, `present`/`kunde`/`dev`/`forslag`/innlogging står),
  `_openCloudProject` uten lås men med `_lockEnterProject` uten flagget, `_initAfterAuth`-gatingen,
  zoom-mot-punkt (punktet står stille, klemmes til 8 og `_minZoom()`), `_panMove`-formelen, berøring
  bruker hjelperne og regner ikke selv, utløpt økt → `vp:need-token` uten `setSession`, ingen
  `console.` i øktkoden, klienten fornyer aldri selv, CSS-porten finnes.

**Kjørt headless (Chromium via Playwright i scratchpad, dev-server port 4333, `?dev`-autologin, 321
produkter):** de 21 fra 036 + `_appEmbedRegressionTest` — **22 av 22 BESTÅTT.** I tillegg en
innebygd-røyktest på det **dupliserte** prosjektet «Ekebergveien 28 (kopi)» (bare lesing): økt
sprøytet inn med `addInitScript`, `?embed=app&project=…&room=5` → `vp:ready`, `body.app-embed` +
`readonly`, `#app` vist, topplinje/sidepanel skjult, 4 rom-chips med «Rom 5» aktiv, `S.ui.readOnly`
true, **ingen lås** (`_lockState.projectId` null, ingen hjerteslag), ingen periodisk lagring, zoom
0,43 (fitRoom), `touch-action: none`, økten slettet fra `window`; syntetisk én-finger-drag flyttet
`panX` uten å endre zoom, to-finger-knip økte zoom 0,43 → 0,95; `vp:session`-event med ny økt →
fortsatt innlogget. Uten økt: «Logg inn i appen på nytt», `#auth-screen` skjult, `vp:error` sendt.
Uten flagget: `/` viser innloggingsskjermen, `?present=…` går presentasjonsgrenen — ingen
`app-embed`. Ikke kjørt (som i 036): `_prosjektlaasRegressionTest`, `_planRegressionTest`,
`_cableGeometryRegressionTest`, `_kundelenkeRegressionTest`, `_pwaRegressionTest`. Én konsollfeil ved
innlasting (`_assertProductSurfacesCoverAllCollections` om XLSX-bestilling) er uavhengig av 100.

**Manuelt (Kenneth):** `node serve-varmeplan.js` på Mac-en; appen med
`EXPO_PUBLIC_VARMEPLAN_WEB_URL=http://<Mac-IP>:4000`; prosjekt → «Åpne i Varmeplan»; rom → «Vis
rommet i Varmeplan»; la stå > 1 time (appen skal fortsatt være innlogget); flymodus → appens melding.
**Virker på varmeplan.no først når Kenneth har pushet `main`.**

**Skal IKKE / ikke gjort:** ingen redigering, ingen talltastede rom, ingen auto i innebygd modus;
ingen migrasjon, ingen RLS-endring, ingen Edge Function, ingen push.

---

## 036 — Matrikkel/boligmappenr på prosjektet, og beregnet c/c + flateeffekt stemplet per rom (17.10.2026, `main`, `89c1cd7`, pushet)

To ting feltappen (varmeplan-app) trenger fra web og som bare web kan lage. Kenneth 17.10.2026: web skal
sende matrikkel og boligmappenummer så de tastes **én gang** ved prosjektering, og appen skal vise c/c og
flateeffekt når montøren åpner et rom — uten å regne en regel på nytt (låst arkitektur 07.10.2026).

**STEG 0 (målt før endring).** (1) `_computeRoomStats(room)` (l. 5406) returnerer bl.a. `nettoM2`,
`cableCcCm` (første kabels `spacing_cm`), `cableWm2`, `matWm2`, `heatedM2`, `wm2Heated`, og hopper over
reservekabelen (025); `_roomFlateeffektWm2(room, stats)` (l. 13276) = kabel-rom → `cableWm2`, ellers
`wm2Heated`, tomt rom → ønsket W/m²; `_roomRatedEffectW(room)` (l. 13393) = Σ `_roomProductRows` (reserven
0 W); `roomAreas(room)` (l. 48014) og `_calcNetArea(room)` (l. 52345) = samme nettoareal i cm²/tekst.
**Romoversikt avgjør flateeffekt per rom** tre steder med samme uttrykk (PDF l. 67810, PDF-romoversikt
l. 68519, Excel l. 77161): snø → `_roomFlateeffektWm2`, innendørs → `round(ratedW / nettoM2)`.
(2) Lagring: `_saveToSupabase()` (l. 77686) skriver `row.data = _buildSaveData()` (l. 66010) til
`romtegner_projects`; samme `_buildSaveData` brukes av autosave (IndexedDB + sky), versjonssnapshot og
fileksport — stemplingen hører derfor hjemme i `_buildSaveData`. (3) `data.project` har i dag: `name`,
`description` (**adresseteksten**), `address` (**objekt** `{text, representasjonspunkt}` fra adressesøket,
ikke en streng), `customer`, `customer_id`, `contact_name`, `contact_id`, `responsible`,
`responsible_user_id`, `type`, `parts`, `status`, `projectNo`, `revision`, `accessories`, `pricing`,
`savedAt`, `_prog` m.fl. — **ingen `matrikkel`/`boligmappeNr`**. (4) `data.rooms[]` har **ikke** noe
`computed` (0 treff). (5) Kundeopplysninger tastes i «Kunde & prosjektinfo» (`_wfKundeModal`, l. 64800:
kontaktperson, adresse, prosjektert av; lagres i `_wfKundeSave`). (6) 26 regresjonsfunksjoner i
`index.html`; romstatistikk dekkes av `_flateeffektRegressionTest`, `_reserveCableRegressionTest`,
`_listevisningRegressionTest` og `_ccWarnRegressionTest`.

**Gjort**
* **A — prosjektdialogen:** «Kunde & prosjektinfo» har fått **Matrikkel** (hjelpetekst
  `kommunenr-gnr/bnr/fnr/snr`) og **Boligmappenummer (valgfritt)** under Adresse. Lagres i
  `data.project.matrikkel` / `data.project.boligmappeNr`. Tomt felt → nøkkelen **slettes** (ikke tom
  streng), så appen skiller «ikke oppgitt» fra «oppgitt». Ingen nye kolonner.
* **B — `room.computed`:** `_buildSaveData` stempler hvert rom med `_roomComputedStamp(r)` (ny, ved
  `_isSnowRoom`). Gjenbruker `_computeRoomStats`, `_roomRatedEffectW`, `_roomFlateeffektWm2`,
  `_isSnowRoom`, `_roomProductRows` — ingen ny formel. `_roomOversiktWm2(room, stats)` er Romoversiktens
  per-rom-avgjørelse (snø/innendørs) samlet i én funksjon; de tre eksisterende kallerne er **ikke** rørt
  (byte-identisk uttrykk — se SPØRSMÅL i app-løpet). `_roomCcCm(room)`: ett tall bare når alle produkter
  med c/c i rommet har det samme (kabel `spacing_cm`, matte `mat_cc_mm`/80 mm-fallback, aluboard 10 cm);
  ellers `null`. Reserven teller ikke. Rom uten produkter → `flateeffektWm2: null`, `ccCm: null`
  (ønsket W/m² er ikke «beregnet»). Et gammelt `computed` fra innlastingen kastes før nytt settes.
  Ingen `pushUndo`, ingen render, ingen mutasjon av `S.rooms` (sjekket i testen).
* **Kostnad (B5):** målt i `_computedStampRegressionTest` sjekk 8: 40 rom med hindring og kabel stemples
  på **0,5 ms** (hurtigprosjekterte kabler uten geometri). For tegnede kabler kjører
  `_cableCoveredCm2`-samplingen, men den er allerede signatur-cachet og kjøres uansett per rom ved hver
  Romoversikt-render — lagringen legger ikke til regnearbeid som ikke gjøres fra før.
* **Regresjonstest** `_computedStampRegressionTest()` (19 sjekker): ett produkt → ccCm 10 og flateeffekt
  = Romoversiktens tall (1000 W ÷ 19 m² = 53); to ulike c/c → null; hovedkabel + reserve → samme
  flateeffekt og c/c som uten; tomt rom → nettoM2 20, flateeffekt null; listMode → nettoM2 = areal −
  `listHindCm2`; to stempler like (unntatt `stampedAt`); kildesjekk av `_buildSaveData`; tidsmåling.
* **Kjørt headless (Chromium, `?dev`-autologin, 300 produkter):** `_computedStampRegressionTest`,
  `_flateeffektRegressionTest`, `_reserveCableRegressionTest`, `_ccWarnRegressionTest`,
  `_soneRegressionTest`, `_cableZoneRegressionTest`, `_cableSkewRegressionTest`,
  `_listevisningRegressionTest`, `_nyttProsjektRegressionTest`, `_kundeforslagRegressionTest`,
  `_geoRegressionTest`, `_foilRegressionTest`, `_matRegressionTest`, `_matZoneRegressionTest`,
  `_matFreeRegressionTest`, `_prefsRegressionTest`, `_gapRegressionTest`, `_stairRegressionTest`,
  `_stairSideRegressionTest`, `_edgeMailRegressionTest`, `_gbao10RegressionTest` — **21 av 21 BESTÅTT**.
  Ikke kjørt (async mot nett/lås eller tunge): `_prosjektlaasRegressionTest`, `_planRegressionTest`,
  `_cableGeometryRegressionTest`, `_kundelenkeRegressionTest`, `_pwaRegressionTest`.

### Til datakontrakten i feltappen (`varmeplan-app/docs/datakontrakt-web-app.md`)

Web stempler fra og med 036 følgende i `romtegner_projects.data` ved **hver lagring** (manuell, autosave,
versjonssnapshot, fileksport):

| Felt | Type | Betydning |
|---|---|---|
| `data.project.matrikkel` | `string` \| *fraværende* | Matrikkel, fritekst (`kommunenr-gnr/bnr/fnr/snr`). Nøkkelen finnes **ikke** når tomt. |
| `data.project.boligmappeNr` | `string` \| *fraværende* | Boligmappenummer, fritekst, valgfritt. Nøkkelen finnes **ikke** når tomt. |
| `data.rooms[].computed` | `object` \| *fraværende* | Fraværende bare på prosjekter lagret før 036, eller hvis stemplingen kastet. |
| `computed.nettoM2` | `number` (2 des.) | Nettoareal i m² = brutto − hindringer − forbudte soner (listMode: brutto − `listHindCm2`). |
| `computed.flateeffektWm2` | `number` (0 des.) \| `null` | Det Romoversikt viser: snø-rom → produktets W/m² der det ligger; innendørs → ratet effekt ÷ netto m². Reserven teller ikke. `null` når rommet ikke har produkter. |
| `computed.ccCm` | `number` (1 des.) \| `null` | Rommets c/c i cm — **bare** når alle produkter med c/c har samme verdi. `null` ved flere ulike, ved folie/plate alene, og i tomme rom. |
| `computed.stampedAt` | `string` ISO 8601 | Når stempelet ble satt. Eldre enn prosjektets `savedAt`/`updated_at` ⇒ tallene er fra en tidligere lagring. |

Merk for appen: `data.project.address` er et **objekt** (`{text, representasjonspunkt}`), ikke en streng —
adresseteksten ligger i `data.project.description`.

---

## 065 — Varmeplan som installerbar app (PWA) på Windows (17.10.2026, `main`, `89c1cd7`, pushet)

Kenneth 12.10.2026: «Jeg ønsker å lage Varmeplan-appen som en desktop-app på Windows-PC.» Valgt:
installerbar nettapp (PWA) fremfor .exe — Edge/Chrome installerer varmeplan.no som egen app med eget
vindu, ikon i Start-meny og oppgavelinje. Appen er fortsatt varmeplan.no: hver deploy er ute neste
gang den åpnes, ingen installasjonsfil, ingen kodesignering. En .exe (Electron/Tauri) er utsatt til
det finnes et behov en nettside ikke dekker. «Ikke Cenika-ikon eller farger — kjør Varmeplan.»

**STEG 0.** (1) Ingen `package.json`/Node-verktøykjede i repoet — PNG-ene er rastrert én gang fra
SVG-ene med den lokale Chromium-en (Playwright), ingen npm-pakke lagt til. (2) Vercel svarer **404**
(`text/plain`) på `/sw.js` og `/manifest.webmanifest` før filene finnes — en gammel cache kan altså
ikke ha sett en HTML-side som sw. (3) Oppstartsstier: `?present=<token>` (+ `&forslag=<token>`),
`?kunde=<token>`, `?invite=<token>` (leses og vaskes av URL-en før Supabase starter), `?dev`
(localhost). Install-knapp og sw-registrering er stengt på alle kundeflatene.

**Gjort**
* **Ikon:** `icons/varmeplan.svg` (512, avrundet kvadrat `#0d0e10` med kant `#252830`, tykk geometrisk
  V i `#22d3ee` med flat bunn, varmekabel i slynge med fire U-svinger under, opacity .55, kun stier),
  `varmeplan-maskable.svg` (80 % innenfor trygg sone, fyller flaten), `favicon.svg` (bare V, større —
  slyngen blir grøt under 32 px). PNG: 192, 512, maskable 512, apple-touch 180, favicon 16/32,
  `favicon.ico` (16+32, Pillow). `docs/pwa/ikon-forhandsvisning.html` viser alt på lys/mørk bakgrunn
  og i en simulert Windows-oppgavelinje (32/48). 16 px: V-en er lesbar; slyngen ikke.
* **`manifest.webmanifest`:** standalone, `start_url /?kilde=app`, `launch_handler focus-existing`,
  fire ikoner. **`window-controls-overlay` er droppet** (bare `standalone`): topplinja har knapper
  øverst til høyre som ville havnet under Windows-knappene, og dra-området måtte bygges med
  `titlebar-area-*` — kan ikke måles her uten en Windows-PC.
* **`<head>`:** manifest, favicon svg/png/ico, apple-touch-icon, to `theme-color`-metaer (mørk/lys);
  `_pwaSyncThemeColor()` setter begge til appens eget tema ved oppstart og i `setTheme`. Samme
  ikonlenker i `admin.html`.
* **`sw.js`:** `install → skipWaiting`, `activate → clients.claim + slett alle cacher`; `fetch`
  håndterer BARE `mode === 'navigate'`, nettverk først, og svarer ved nettverksfeil med en innebygd
  «Varmeplan trenger internett»-side (503). Ingen `caches.put` — aldri en gammel versjon.
  Registreres etter `load`, bare på https/localhost, aldri på kundeflatene. `vercel.json`: `no-cache` +
  `Service-Worker-Allowed` for `/sw.js`, `application/manifest+json` for manifestet. Dev-serveren fikk
  `.webmanifest/.ico/.json` i MIME-tabellen (ellers falt manifestet tilbake til index.html).
* **«⬇ Installer Varmeplan»:** `beforeinstallprompt` fanges; knapp i avatar-menyen (dashbord og
  topplinje) og en engangslinje på dashbordet («Installer · Ikke nå», «Ikke nå» huskes i
  localStorage). `appinstalled` → begge skjules, toast «Varmeplan er installert — finn den i
  Start-menyen». Kjører appen alt installert (`display-mode: standalone`) → ingen knapp. Nettlesere
  uten `beforeinstallprompt` (Firefox, Safari): ingen knapp, ingen feil.
* `?kilde=app` fjernes fra adressen ved oppstart. `docs/pwa/INSTALLER.md`: tre linjer til Fredrik.
* Ny `_pwaRegressionTest()` (13 sjekker, grønn): manifest-lenke, theme-color, ikoner, registreringen
  gatet (kildesjekk), sw.js uten `caches.put/open/add`, bare navigasjon, egen offline-side, manifest
  som JSON med riktige felt.

**Målt lokalt (headless Chromium):** sw registrert og aktiv på `/?dev`; `?present=` og `?kunde=` →
ingen registrering, ingen knapp; simulert `beforeinstallprompt` → knapp i begge menyer + linja;
«Ikke nå» → skjult og husket; «Installer» → `prompt()` kalt; `appinstalled` → toast; theme-color
`#0d0e10` i mørkt og `#f0f4f8` i lyst tema; **nettet av → «Varmeplan trenger internett»-siden med
Prøv igjen**, ikke hvit side. Ikke testet: selve installasjonen i Edge på Windows, Lighthouse.

---

## 099 — Kabelmotor: stigetrinn innenfor toleransen er varianter; robust mot 1 cm veggflytting (17.10.2026, `main`, `89c1cd7`, pushet)

Underlag: STATUS §38 (forstyrrelsestesten: 34 brudd av 136, «celler 5 → 4»). Full måling i STATUS §40.

**STEG 0 — hypotesen var feil.** Trinnene ved cellegrensene i Rom 5 er 75–111 cm, ikke nær én CC.
«Celle 5» var en 12,6 cm lang én-banes sliver fra 093-varianten. Det som faktisk skjedde: stigen
gir CC 12,605 → 40,96 m (−3,9 cm) og CC 13,205 → 41,30 m (+30 cm) på referansen, så begge havner i
`tries` og 13,205 vinner på poeng (hull 0, 93,4 %). Flyttes vegg 2 én cm, blir 12,605 → 41,00 m
(+0,1 cm): da er 12,605 selv «nærmeste for lange», 13,205 prøves aldri, vinneren har et hull, og
079d går ned til 11,62 / 84,7 %. Fire centimeter kabel avgjorde ni prosentpoeng.

**Gjort** (`generateCableGeo`): (1) etter `tries` og 079d prøves hvert stigetrinn som treffer lengden
innenfor ±1 % pluss N ± 1 rundt beste trinn, med trim via `jevnLen`; valg R-START først, så poeng;
bare når `tries` ikke ga et hullfritt treff. (2) 093-forskyvningen rekker 0,2 × CC (var 0,5 cm).
(3) Delt `_geoCcStige`. (4) `opts.trace` i lengdesøket. (5) Forstyrrelsestesten: «R-START tapt»
krever at referansen traff; `_geoCells` teller celler med ≥ 2 baner.

**Målt:** rom5/700W **20 → 1** brudd av 40 · 10T 40 → 6 (28 av de 40 var feilmålt — referansen
har selv start 118 cm) · 600W 20 → 23 (⚠ referansen står igjen alene på 78,4 %, se SPØRSMÅL) ·
badHakk 1 → 1. **Porten grønn, 142 rader, 19,8 s**; to rader bedre (enHindring v tr/tl 89 → 95,3 %),
ingen dårligere. Baselinjen skrevet på nytt. Rullet tilbake etter måling: «099 alltid på» (4 røde)
og hjørnerunden på N-stigen (7 røde).

---

## 075 — Høyreklikkmenyer måler egen høyde og holdes innenfor skjermen; romtyper i to kolonner (17.10.2026, `main`, `89c1cd7`, pushet)

Kenneth: «Menyen som kommer opp ved høyreklikk fra rom er så stor at den går under skjermen, ingen
mulighet å se hva som står nederst.»

**Målt i koden:** `showCtxAt` plasserte alle 15 høyreklikkmenyene med en fast antakelse
(`top = min(y, innerHeight − 230)`, `left = min(x, innerWidth − 180)`); `#ctx-menu` hadde verken
`max-height` eller rulling. Rom-menyen har ~20 rader (ti romtyper som én rad hver — tolv i
Oslo Elektriske-kopien, der orgen har egne typer) og var 740+ px høy. `showProduktDropdown`
gjettet 200 px bredde og leste `scrollHeight` før layout. De seks panelene (avstand, veggmargin,
labelfarge m.fl.) måler allerede `offsetWidth/Height` og er urørt.

**Gjort**
* Ny `_placePopupAt(el, x, y)`: viser elementet usynlig, leser målt bredde/høyde, og plasserer det
  under pekeren hvis det er plass, ellers OVER pekeren, ellers klemt til `[8, innerHeight − h − 8]`;
  samme mot høyre/venstre kant. Brukes av `showCtxAt` (alle 15 menyene) og `showProduktDropdown`.
* CSS: `#ctx-menu` og `#produkt-menu` har `max-height: calc(100vh − 16px); overflow-y: auto` —
  på et lavt vindu rulles menyen i stedet for å forsvinne. `scrollTop` nullstilles ved åpning.
* Rom-menyen: romtypene i et to-kolonners rutenett (`.ctx-grid`, ikon + navn, samme
  `setRoomType`-klikk, rekkefølgen beholdt radvis), gjeldende romtype uthevet (`.ctx-item.sel`).
  Lange navn får ellipse og `title`.

**Målt etter** (1440 × 900, Ekebergveien 28-kopi, 12 romtyper): rom-menyen er 543 px (før ≈ 740).
Høyreklikk 40 px over bunnen → åpner over pekeren (topp 311, bunn 854), «Slett rom» klikkbar.
Øverst → under pekeren som før. Helt til høyre → speilet til venstre for pekeren (høyre kant 1420).
Vindu 500 px høyt → menyen 484 px, rullbar (innhold 541), alt innenfor 8 px-margen. Vegg-, hjørne-
og produktmenyene åpner riktig. Skjermbilder: `docs/serie-098/skjermbilder/075-*`.

---

## 098 — Trapp, sidevisning: start og slutt speilet riktig per trinn; «Sidevisning» følger tegningen (17.10.2026, `main`, `89c1cd7`, pushet)

Kenneth (Test Cenika, P0341): «Grønt og rødt merke … ligger feil plassert på sidevisning av trappen.
Grønn start bør ligge helt til venstre. Rød stopp bør ligge helt til høyre.»

**STEG 0 — målt, ikke antatt** (syntetisk trapp 10 × 30 cm, kantavstand 2 cm, og Kenneths egen Trapp 1):

| | plan: brøk fra forkanten | sidevisning før | sidevisning etter |
|---|---|---|---|
| start, trinn 1, `bottom` | 0,067 (2 cm) | **0,933** (ved opptrinnet) | 0,067 |
| slutt, trinn 10, `bottom` | 0,933 | **0,067** | 0,933 |

* `run.pos_cm` er plan-lokal: `pos = 0` er `surf.y_cm`. Med byggeretning `bottom` (standard) ligger
  neste trinn ved MINKENDE y, så `pos = 0` er opptrinnssiden og `pos = d_cm` forkanten (Regel 14).
  Sidevisningen tegner opptrinnet i HØYRE ende, men brukte `xStart + pos_cm` — hele løpsrekka var
  speilet innenfor hvert trinn. Det syntes bare på prikkene, fordi løpene ellers ligger jevnt.
* **Avhenger av byggeretning:** med `top` ligger neste trinn ved ØKENDE y, så der er `pos = d_cm`
  den delte kanten. Motoren (`generateStairCable`) leser ikke byggeretningen, så for `top`-trapper
  legger PLANEN starten 2 cm fra opptrinnet, ikke fra forkanten (målt: brøk 0,933). Det er en
  motor-/plan-sak utenfor 098 («Skal IKKE endre kabelutlegget») — står i SPØRSMÅL.
* Repos: symmetriske marginer, samme løpsposisjoner speilet — bildet er likt, hvert løp får riktig side.
* Skjermens `_drawStairSide` hadde samme speiling på løpsmerkene, og tegnet INGEN start-/sluttprikker.

**Gjort**
* Ny `_stairSideX(stair, sc, pos_cm)`: `xStart + depth − pos` for `bottom`, `xStart + pos` for `top`
  — altså planens klatreretning projisert på sidevisningens x-akse. Brukes for løpsmerkene og
  prikkene i både `_stairDrawSideToCanvas` (PDF) og `_drawStairSide` (skjerm).
* Ny `_stairCableEndpoints(stair)`: start/slutt per kabel uavhengig av visning (kabelens egen
  reiserekkefølge, første/siste segment per `cableIdx`). PDF-sidevisningen og skjermens sidevisning
  leser den; skjermen har nå også grønn/rød prikk (og K1/K2 ved flere kabler). Planvisningene er urørt.
* PDF: «Sidevisning» sto alene på side 3 med tegningen på side 4. Plasskontrollen var
  `min(bildehøyde, 60) + 10`; nå sjekkes HELE blokken (overskrift + bilde + luft) før overskriften,
  og bildets makshøyde holder av plass til overskriften. Tegnforklaringen «Start kabel · Slutt
  kabel» hører til plantegningen: det siste planbildet får 12 mm mindre (6 mm linje + 6 mm luft),
  så linja ikke skyves alene over på neste side. Målt: Test Kenneth-PDF-en gikk fra 7 til 6 sider,
  side 2 = plan + tegnforklaring, side 3 = «Sidevisning» + tegning.
* Ny `_stairSideRegressionTest()` (25 sjekker, grønn): trapper med/uten repos, begge byggeretninger,
  snudd kabelstart og to kabler — brøken «avstand fra forkanten / trinndybde» er lik i plan og side
  for hver kabels start og slutt; standardoppsettet har start < 0,2 og slutt > 0,8 fra venstre.
  `_stairRegressionTest()` fortsatt grønn (24/24).

Skjermbilder før/etter: `docs/serie-098/skjermbilder/098-*`.

---

## 097 — PDF: én kilde for rommets produkter, og «m²» vises som m² (16.10.2026, `main`, `89c1cd7`, pushet)

Kenneth (Coop Ålen, P0339 rev. 3): «Her regner ikke appen med rampe og inngang som jeg har lagt ut
med frihånd. Den bør regnes med. Den er tatt med kun for produkter, så den kom med på materiallisten.»

**STEG 0 — hvem leste hva.** Romsiden hadde riktige tall (3000 W og 34 800 W) fordi
`_computeRoomStats` går gjennom `S.matPaths` via `_matFreeCatalog`. Oversiktene gjorde ikke:

| sted | kilde | matPaths | aluboard |
|---|---|---|---|
| Romsidens topp | `_computeRoomStats` | **JA** | JA |
| Romsidens Spesifikasjon | fire egne løkker | **NEI** | **NEI** |
| Prosjektoversikt KPI + W | `_roomRatedEffectW` | **NEI** | JA |
| Prosjektoversikt «Type» | `_roomProductFamily` (lokal) | **NEI** | **NEI** |
| Romoversikt | `_roomProductBreakdown` | **NEI** | JA |
| Materialliste (PDF/XLSX/Visma) | `_collectMaterialItems` | JA | JA |
| Forhåndsvisning / kundeside | `_roomRatedEffectW` | **NEI** | JA |

Fri folie (`foilFree`) var dekket overalt, via `_foilCountItemsForRoom`. **XLSX-hullet fra 19.08 er
allerede lukket** — `_collectMaterialItems` har matPaths i dag, så materiallista trengte ingen endring.

* Ny `_roomProductRows(room)` er **den ene kilden** og dekker alle ROOM_PRODUCT_KEYS:
  strips/foilFree, cables, mats, **matPaths** (via `_matFreeCatalog(mp).segments`), plates, **aluboard**.
  `_roomRatedEffectW`, `_roomDominantProduct`, `_roomProductBreakdown`, PDF-ens «Type»
  (`_roomProductFamilyName`) og romsidens Spesifikasjon er alle uttrykt gjennom den.
* Romsidens «Effekt» leser nå samme kilde som tabellene. ⚠ Det flytter ett tall: et kabelrom med
  InFloor 17T 600W viste 595 W (geometri) på romsiden og 600 W i oversikten — nå 600 på begge.
* **«m²» fikset ÉN gang for hele dokumentet** (`_pdfSuperscriptPatch`): tegnet manglet ikke i
  kilden — jsPDFs StandardEncoding har det ikke, så det forsvant stille. `doc.text` overstyres og
  tegner basisteksten pluss en mindre, løftet «2»; strenger uten «²» går urørt videre. Venstre-,
  midt- og høyrejustering er målt riktige (høyre: 88,07 = 100 − 11,93).

**Målt før → etter** (samme tre rom, lest ut av jsPDF med spion på `doc.text`): Installert effekt
8400 → **46 200 W**; «Ingen produkter» 2 → **0**; Rampe/Inngang Type «—» → **InSnow 300T**;
gjenstående «²» 6 ulike strenger → **0**, erstattet av 29 løftede toere. Materiallista 9 linjer,
uendret. Figur: `docs/kabel/fasit/097-pdf-for-etter.svg`. 22 regresjonsbatterier grønne.

---

## 096 — flerkabel-soner går gjennom geo-motoren med felles CC og søm (16.10.2026, `main`, `89c1cd7`, pushet)

Kenneths skjermbilde fra varmeplan.no: Rom 8, 2 × 3400W 200m i to soner. K1 jevn med røde ringer,
K2 ødelagt med store buer. Begge ⚠.

**STEG 0:** K2 var et **lagret** utlegg, merket ved åpning (072) — sonestien regner aldri defekter
selv, så ⚠ kunne bare komme derfra. De store buene er **V6-koblinger**: et rent rektangel gir dem
aldri (ti sideforhold målt, alle boustrophedon/0 koblinger), men med én hindring i høyre sone falt
K2 til v6 med 5 koblinger mens K1 ble ren boustrophedon — nøyaktig bildet. V6 ble tatt ut av
konkurransen i 083, men soneveien har aldri sett den avgjørelsen. ⚠ i labelen er for øvrig ikke en
CC-advarsel: `_ccOverWarn(17T, 12,59)` er false (anbefalt maks 20 cm) — labelen skriver ⚠ også når
`_geomDefects` finnes.

* `generateCableGeo` tar nå imot **bundet CC** og **søm**: CC utledes ikke av N, N-stigen og alle tre
  rundene hoppes over, søm-løpet pinnes CC/2 fra kuttet (1 CC over sømmen).
* **Rotårsaken bak lengdefeilen var CC-VALGET, ikke motoren.** `sharedCC = areal/lengde` = 12,59
  regner ikke med kantavstand og U-sving-inntrekking: 96 løp krever 1196 cm, det lovlige området er
  1190. Nytt forpass `_zoneSharedCcFromGeo` spør hver sone hva den trenger og tar den minste —
  12,53, **samme verdi i begge soner**, og da får begge 48 løp. Regelen (lik W/m² over sømmen) er urørt.
* Sømmen kan flyttes høyst ± 1 CC hvis lengden ikke går opp (arbeidstak 2 ombygginger; uten taket
  29 s mot 2,8 s). Den trengte 0 cm i alle målte rom — CC-forpasset løste det alene.
* **V6 kan ikke vinne en sone**, men byttet krever at erstatningen er GYLDIG: ⚠ målt ga et blindt
  bytte `utenfor` (kabel utenfor rommet, −9,36 %) der V6 lå på 0,00 %. Står V6 igjen, merkes den.
* Hver sonekabel kontrolleres nå **der den lages**, ikke først ved neste åpning.

**Rom 8 før → etter:** boustrophedon/boustrophedon CC 12,59 · −2,18 % · ugyldig (⚠ lengde) →
**geo/geo CC 12,53 i begge · −0,11 % · gyldig · dekning 99,2/99,9 % · søm = 1 CC**, og 2047 → 365 ms.
Figur: `docs/kabel/fasit/096-rom8.svg`.

Tre nye fixtures (`rom8`, `rekt2kab`, `rekt2kabUlike`) og en egen flerkabelrad i porten som måler
felles CC, lengde, søm, store buer og V6. Alle seks rader grønne, baselinjen er 142 rader,
flerkabelradene tar 1,3 s. **Ingen enkabelrom endret.** 18 batterier grønne.
⚠ `_cableZoneRegressionTest` B er bevisst endret fra «boustrophedon» til «geo» + tre nye påstander.
Se `docs/kabel/STATUS.md` §39.

---

## 095 — R-ENDE gjelder restceller; rask geo-port med lagret baselinje; forstyrrelsestest (16.10.2026, `main`, `89c1cd7`, pushet)

Kenneths beslutninger: ikke kjøp R-ENDE med dekning (5–7 prosentpoeng er for dyrt), og presiser
regelen til **restceller**, ikke ekte nisjer.

* **R-ENDE (spec §0.11, ny tekst):** den frie enden skal ikke ligge i en restcelle — en celle med
  én bane lavere enn **2 × CC**, altså for lav til en vanlig sving i begge ender. En ende som fyller
  sin egen celle helt ut, også en grunn nisje, er ikke et brudd. Rom 5 (12,6 < 26,4) er en restcelle
  og reparasjonen står; badHakk (78,1 > 22,4) er en nisje. **Bruddlista gikk fra 6 rader til 0.**
* ⚠ Porten måtte inn i **rutingen** også: `_geoRouteOrders` lagde dropp-varianten for enhver lav
  én-banes celle, og på badHakk41 vant den på **lengdeleddet** — et utlegg endret i et rom uten
  restcelle-ende, med dårligere dekning og veggstripe. Nytt `cc`-argument og samme 2 × CC-terskel.
  **Mot `2d047b5` er nå bare rom5 `v` tr/tl/br endret: 133 av 136 rader identiske.**
* **Ny rask port `_cableGeoSuite()`** — bare geo-motoren, 136 rader mot `docs/kabel/baseline.json`
  (ni felt per rad), dominans på låste mål, baselinjen oppdateres bare med et eksplisitt kall.
  **63,0 s.** `_cableGeometryRegressionTest` beholdes som manuell kjøring, ikke port; V6-loggingen
  ligger bak `window._cableQuietV6`. Nye endepunkter `GET /__baseline` og `POST /__write-baseline`.
* **Ny `_cableForstyrrelsesTest()`** (ventet siden 091): hver vegg ± 1 og ± 2 cm. **34 brudd av 136
  kjørte forstyrrelser.** 091-knekken står: hver brudd-rad i rom5 700W har signaturen `celler 5 → 4`
  — en vegg flyttet 1 cm fjerner en celle, og CC 13,20 blir umulig. N-iterasjonen i 091b gjorde
  søket komplett, ikke utlegget robust. rekt398 er helt stabil, badHakk har ett brudd.
* ⚠ `rekt398` hadde `productId: null` — åtte rader som ikke kunne feile. Koblet til 1650W 96m
  (noten navnga det selv): CC 11,08 · 98,4 % · start 12 cm.
* ⚠ To egne målefeil rettet: et felt som var tall i én gren og objekt i en annen («ingen brudd» lest
  av et tall), og en stille `catch` som skjulte at porten aldri kunne lese baselinjen sin
  (dev-serveren svarer med `index.html` for `/docs/...`).

⚠ **Uløst:** porten er upålitelig kjørt som én uavbrutt blokk — én tilfeldig fixture baller på seg
(enHindring 64 s i én kjøring, utsparing over 120 s i neste). Kjør i biter med `only` + `flett`.
Ikke rukket: 076-fasiten som form-og-krav, og fixture-hash med drift-varsel.
Se `docs/kabel/STATUS.md` §38.

---

## 094 — R-ENDE: de frie endene rekker like langt som naboløpenes svinger (16.10.2026, `main`, `89c1cd7`, pushet)

Kenneth: «700W innsett øverst til høyre: her er siste løp kortere enn løpene ved siden. Det skal det
ikke være. Siste løp må forlenges, og heller øke avstand fra alle løpene mot vegger.»

**Målt først: ingenting kortes inn.** Siste løp i Rom 5 700W `tr` går −917,0 → −904,4 — **12,6 cm**
mot naboens 69,4, altså **56,8 cm** for kort (tre ganger mer enn pikselmålingen tilsa). Endeløpet er
full høyde i sin **egen** rutenettcelle; cellen har én bane og er 12,6 cm høy. Rotårsaken ligger i
rutingen: `_geoRouteOrders` krever en Hamilton-sti, og en 12,6 cm høy bane har ikke plass til en
U-sving i begge ender — så den eneste kjeden som lar seg bygge, **ender** i sliveren.

* Ny regel **R-ENDE** (spec §0.11): de to frie endene rekker like langt som naboløpenes svinger
  ± 1 cm, og lengde som må bort tas opp jevnt i alle svinger (`extraSweep`), aldri ved å kappe én ende.
* `_cableEndeKort` → `metrics.endeKortCm`, straff vekt 22 i `_geoScore` (over R-VEGG, under hull).
* `_geoRouteOrders` gir ekstra rekkefølger som **utelater** en kort én-banes celle — variant, ikke
  erstatning (093). `endeLen` + enderunden, bygget på veggrunden (089b), med stige over **N**.
* Galleri-kolonner `stripe (cm)` (manglet fra 089) og `ende kort (cm)`.
* Spec §0.10 (R-VEGG) skrevet inn — den sto bare i STATUS.

**Dominans mot `2d047b5`: 130 av 136 kombinasjoner identiske, 0 harde brudd før og etter.** Rom 5 `v`
reparert med CC 13,20 og formen i behold (dekning 94,1 → 93,4 %, sliverens eget areal); badHakk `h`
bl ble bedre på alt (75,0 % mot 72,6, stripe 13,4 mot 14,2). Tid: kaskadeveien 74,2 → 93,7 s for
136 utlegg (+26 %), geo-motoren alene 18,9 → 22,8 s (+21 %); +18,1 av +19,5 s ligger i de tre
fixturene med korte løvceller. 21 regresjonsbatterier grønne — `_cableGeometryRegressionTest`
fullførte ikke innen 13 min og har ingen etablert baselinje (den kjører sju motorer; V6 dominerer).

⚠ **Fem brudd står igjen** (badHakk/badHakk41 vannrett, 190,8 cm): en hel ende finnes og er gyldig,
men koster 5–7 prosentpoeng dekning. R-ENDE skal ikke kjøpes med dekning uten at Kenneth sier det.
Der er endecellen dessuten 78 cm dyp **fordi rommet er 78 cm dypt** — R-ENDE som formulert forbyr å
dekke en grunn nisje med kabelens ende. Se `docs/kabel/STATUS.md` §37.

---

## 093 — forskjøvet ytterbane som variant, ikke erstatning (15.10.2026, `main`, `89c1cd7`, pushet)

092 forskjøv alltid ytterbanen. Det løste Rom 5 / 700W `tr` (84,3 → 94,1 %) men brakk R-START og
R-VEGG på 600W `bl` (start 25 → 77 cm, stripe 19,4 → 33,8) og R-START på 10T `bl` (31 → 67 cm).

Samme lærdom som den speilede slyngen i 090: en endring som er gunstig i noen rom og ugunstig i
andre skal være en VARIANT. `_geoBuildGrid` tar nå `forskyv` (0/1/2), rutenettet rapporterer
`ytterbaneFalt`, og `gridsFor` bygger de forskjøvne variantene bare når basisrutenettet faktisk
mistet en ytterbane. R-START-filteret, R-VEGG og dekningen velger.

Resultat: 700W `tr` beholder CC 13,20 og 94,1 %, 600W `bl` har stripe 19,4 og start 25 tilbake,
og ingen av de ti fixturene er dårligere enn før 092 på noen låst regel.

⚠ 10T `bl` beholder ikke 092-gevinsten, og det er riktig: den forskjøvne varianten gir 92,1 %
men start 67 cm, og R-START rangerer over dekning. Gevinsten var kjøpt ved regelbrudd.
⚠ Forstyrrelsestesten er fortsatt ikke bygget — se STATUS §36.

## 092 (delvis) — rotårsaken funnet i millimeter; fiksen brekker R-START (15.10.2026, `main`, `89c1cd7`, pushet)

⚠ STATUS §34 var feil: rutingen mister ingen N-trinn — hvert trinn 17–24 ruter ved begge
veggposisjoner. Og «W falt 290,4 → 278,3» var min egen målefeil.

Den ekte mekanismen: rutenettet spenner nøyaktig fra `pMin + EDGE_EPS` til `pMax − EDGE_EPS`,
uten slakk. `pMin` er områdets ytterste PUNKT, og med en skrå vegg berører området det bare i
ett y. Ved x = 677,47 lander bane 0 på 681,84 — 0,01 cm utenfor den brukbare grensen 681,85 —
og forsvinner. Med den forsvinner 1,4 m kabel, CC 13,20 faller ut av ±1 %, og dekningen går fra
93,4 % til 84,3 %.

Fiksen (flytt ytterste bane noen tideler inn, til posisjonen som betjener flest felt) virker på
hovedsaken: Kenneths rom går fra CC 11,62/84,3 % til **CC 13,20 · 41,00 m · 94,1 %**, og 10T fra
67,3 % til 92,1 %.

⚠ MEN R-START brekker på to tilfeller (rom5 600W `bl`: start 25 → 77 cm; 10T `bl`: 31 → 67 cm).
**Skal ikke pushes.** Se STATUS §35.

## 091b — lengdesøket itererer over antall løp N (15.10.2026, `main`, `89c1cd7`, pushet)

Lag F brukte grovsveip + bisekssjon over CC, mens kommentaren selv slo fast at lengden er en
SAGTANN i CC. N er den egentlige frie variabelen (`cc = W/(N−1)`). Søket teller nå N over hele
det lovlige intervallet, med tidlig avslutning når et trinn treffer.

Identiske utlegg i alle ti prøvene, og **4–8× raskere**: rekt398 531 → 79 ms, rom5 `tr`
4202 → 619 ms, lRom 4729 → 526 ms, badHakk 1914 → 130 ms.

⚠ Knekket i Rom 5 består. Målt: ved knekkpunktet kalles `attempt` med N−1 = 17, 20, 23, 24 —
ikke sammenhengende. Trinnene 18, 19, 21 og 22 gir ingen rute i det hele tatt
(`_geoPlanTraversals` returnerer null). Mekanismen ligger altså i RUTINGEN, ikke i lengdesøket
og ikke i `Math.round`-knivseggen. Se STATUS §34.

## 091 (delvis) — knekkpunktet funnet: N hopper på 0,2 mm (15.10.2026, `main`)

Rom 5 / 700W / loddrett / `tr` faller fra CC 13,20 og 93,4 % dekning til CC 11,62 og 84,3 % når
venstre vegg flyttes fra x = 677,49 til 677,47 — **0,2 mm**. Ett hopp, ikke en glidning.

CC 13,20 blir ikke utkonkurrert; den genereres ikke lenger. Rotårsaken er
`N = Math.round(usable / cc) + 1` i `_geoBuildGrid`: en knivsegg der N hopper med 1, lengden
endres med et helt løp, og bisekssjonen i lag F lander på et annet trinn.

⚠ To fikser forsøkt og rullet tilbake (fjerne avbruddet i `tries`; legge N±2 inn i `tries`) —
begge uendret resultat og 3–9× tregere. Riktig fiks er å la lengdesøket iterere over N i stedet
for CC. Ikke bygget. Se STATUS §33.

## 090b — «regresjonen» på 076-fasiten var ingen regresjon (15.10.2026, gren `kabelmotor`)

Jeg meldte at 090 brøt 076-fasiten (Rom 5 / 700W / loddrett / `tr`: CC 13,20 → 11,62). Feil.
To hypoteser ble avkreftet ved måling (avbruddet i `tries`-løkka; veggrunden fra 089b), og den
avgjørende testen — å slå av 090s ekstra varianter — ga fortsatt CC 11,62.

Årsaken er at **089 hentet rom5-fixturet på nytt fra skyen**. Målt side om side på samme kode:
gammel geometri gir CC 13,20 og 93,4 % dekning, Kenneths faktiske rom gir CC 11,62 og 84,3 %.
Fasiten var registrert på et rom som ikke finnes lenger og må settes på nytt.

⚠ Åpent: at ~2 cm veggendring koster 9 prosentpoeng dekning er mye, og om det er reelt er ikke
målt. 090s fire varianter koster lite (655 ms mot 624 ms).

## 090 — den speilede slyngen manglet (15.10.2026, gren `kabelmotor`)

Kenneth: «Hvorfor legger 1650W-kabelen seg ikke lenger ut mot veggene?» Målt på et nytt fixture
`rekt398` (398 × 271): for hjørnet `br` ga motoren 43 løp ved CC 9,02, svingene 26 cm inn fra
veggen og dekning 80 %. For `tl` og `tr` ga den 36 løp ved CC 11,08 — det riktige.

Mekanismen: for 36 løp (partall) ender kabelen med begge endene i samme ende av rommet.
`_geoPlanTraversals` gjorde dybde-først og returnerte første lovlige kjede, så varianten med
begge ender NEDERST ble aldri bygget. `br` bommet derfor med 261 cm, og hjørnerunden kjøpte
hjørnet med 43 løp. `_geoPlanTraversals(grid, order, hopp)` kan nå hente de speilede variantene,
og `attempt` prøver fire.

Etter: alle fire hjørner gir N = 36 · CC 11,08 · 96,06 m (+0,06 %) · sving 5 cm fra veggen ·
dekning 98,4 % · 0 hull · start 12 cm. 1450W uendret.

⚠ REGRESJON: 076-fasiten (Rom 5 / 700W / loddrett / `tr`) gikk fra CC 13,20 / 93,4 % til
CC 11,62 / 84,3 %. Lengdesøkets avbruddsbetingelse stopper nå på det første hjørnetreffet.
Ikke undersøkt videre — se STATUS §31.

## 089b — veggrunden: varianten Kenneth tegnet finnes, og den koster ingenting (15.10.2026, gren `kabelmotor`)

Kenneths topologi (6 baner i øvre felt, de to ekstra løpene langs V6) genereres allerede av
motoren — men ble avvist på LENGDE: 34,25 m (−2,14 %) eller 36,03 m (+2,94 %), aldri innenfor
±1 %. Den for lange kan trimmes med `extraSweep`, men motoren prøvde det aldri på denne
varianten, fordi `jevnLen` måler den hullfrie kandidaten og ikke den som fyller stripen.

Ny `veggLen` + en runde som kjører bare når vinneren bryter R-VEGG, og som godtar bare noe som
er like bra på alt annet.

Rom 5 / 600W / loddrett: øvre felt 4 → **6 løp**, veggstripe 48,5 → **19,4 cm** (3,34 → 1,34 CC),
dekning 87,2 → **88,7 %**. CC, lengde og hull uendret. 700W, 10T og vannrett uendret.

⚠ Rettelse til STATUS §29: konklusjonen «å fylle stripen koster et hull» gjaldt bare de
kandidatene som ble scoret. Den hullfrie varianten fantes, men ble avvist på lengde før den nådde
poengsummen.

## 089 — R-VEGG måles, og mekanismen er funnet (15.10.2026, gren `kabelmotor`)

Instrumenteringen er rettet: senterlinja leses av kabelen som sendes inn i
`_cableGeometryCheck`, ikke av en global variabel som kunne feilkoble kandidat og måling.

Mekanismen bak de to tomme banene i Rom 5 med 600W: det er **ikke** lengdebudsjettet. Et gyldig
utlegg som fyller stripen finnes (CC 13,83 · 35,22 m · +0,62 % · stripe 1,35 CC) — men det har
et **hull inne i feltet**, og 074b sier at jevn avstand går foran å dekke ut mot veggen.
Vinneren (CC 14,53 · 0 hull · stripe 3,34 CC) scorer 80,4 mot 57,1.

- Ny `metrics.wallStripeCm` / `wallStripeCC`, målt per løp (ikke per bånd — to målefeil rettet
  underveis, begge dokumentert i STATUS §29).
- R-VEGG-straff i `_geoScore`, vekt 18: tyngre enn lengdeleddets 12 poeng forsprang, lettere enn
  hull-straffen 25.

⚠ Om Kenneths tegnede topologi (transitten forlenget til de to nye løpene) finnes uten hull er
IKKE målt. Det avgjør om motoren mangler en variant, eller om 074b forbyr det han ber om.

## 089 (delvis) — fixturet for Rom 5 hadde drevet fra virkeligheten (15.10.2026, gren `kabelmotor`)

Kenneth meldte at det er plass til to løp til oppe til venstre i Rom 5. Han har rett — men feilen
lot seg ikke reprodusere, fordi `_cableFixtures.rom5` var fra 13.10 og rommet var endret siden.
På fixturet lå begge venstre felt 19,5 cm fra veggen; på den ekte geometrien ligger det ØVRE
feltet **48,4 cm** unna. Fixturet er hentet på nytt fra skyen.

Målt med riktig geometri (loddrett, start nede til venstre): 600W har 48,4 cm i øvre felt mot
19,6 i nedre. 700W (17,0/17,2) og 10T (17,8/18,0) er ikke berørt.

⚠ Mekanismen er IKKE fastslått: kandidat-loggingen ga motstridende tall fordi
`_cableGeometryCheck` også kalles utenfor geo-motoren. R-VEGG er derfor ikke bygget — se
STATUS §28.

## 088b — valgt retning er hard (15.10.2026, gren `kabelmotor`)

083 lot R-START rangere foran retningen, så motoren byttet til vannrett når loddrett ikke kunne
starte i hjørnet. Kenneth meldte det to ganger som at «retningsvelgeren virker ikke».

Målt på Rom 5 «øvre venstre»: loddrett kommer 188 cm (600W) og 124 cm (700W) fra hjørnet,
vannrett 13 og 18 cm. Byttet var ikke en feil — det var feil rangering. Kenneths egne ord var at
starten må vinne over DEKNING; han sa aldri over RETNING.

Ny rekkefølge (spec §0.9): harde krav → valgt retning → R-START → jevn CC → dekning → fasit-CC.
Den andre retningen måles fortsatt, men tilbys i panelet med tall i stedet for å byttes til:
«⚠ Loddrett kan ikke starte oppe til venstre — nærmeste er 188 cm. [Vis vannrett i stedet
(start 13 cm)]». 076-fasiten er urørt.

## 088 — hjørnene var speilvendt (15.10.2026, gren `kabelmotor`)

`w2s` gir `y = (wy − panY)·sc + h/2`, så større world-y ligger lenger NED på skjermen. «Topp» er
altså MINST y. De fire hjørnehjelperne i geo-motoren hadde motsatt regel — og kommentaren påsto
at det var «samme konvensjon som `_uTurnIsHigh`», noe det ikke var. Målt på Rom 5: toppveggen V5
(300 cm) har y = −1040,1, bunnveggen V1 (261 cm) har y = −836,1.

Alt jeg har meldt om hjørner fra 080 til 083 var speilvendt av denne ene antakelsen. Kenneth så
riktig hele tiden; min konklusjon om «gammel kode i nettleseren» (STATUS §24.1) var feil.

- Én felles `_cornerTarget(room, corner)` med skjermens akse; de fire hjelperne bruker den.
- Ny test som binder hjørnet til `w2s`: hjørnepunktet og starten skal ligge i riktig halvdel av
  SKJERMEN, ikke bare nær et tall. Det var testen som manglet — batteriene målte riktige tall mot
  feil hjørne og var grønne hele tiden.
- Byggstempel på localhost: `/__build.json` + statuslinja + grå linje på geo-kabler i panelet.

Treff på valgt hjørne: 43 (før 083) → 68 (speilvendt) → **71 av 128**.
076-fasiten er løst: Rom 5 / 700W / loddrett / `tr` gir CC 13,2 loddrett med start 13 cm fra
hjørnet — R-START og fasiten gjelder samtidig. ⚠ Suitetiden er fortsatt over kravet (§26).

## 083b — hitCable krasjet på hvert museklikk (15.10.2026, gren `kabelmotor`)

732 uncaught TypeError i Kenneths konsoll: `hitCable` kjente bare skew-motorens baneformer
(`kind:'run'` med a/b, ellers from/to), mens geo sender `{kind:'uturn', pts:[…]}`. `a` var
undefined og `a.x` kastet. Kastet skjer i canvas-mousedown, så hele klikk-kaskaden døde —
verken kabel, rom eller vegg lot seg velge på lerretet.

Feilen har ligget der siden 068 og var usynlig i alle 22 batteriene, fordi ingen av dem klikker
på lerretet. Fiksen bruker samme trygge uttrekk som resten av koden og hopper over elementer
uten brukbar geometri. Fire nye påstander, inkludert et element med ukjent `kind`.

## 083 — R-START: kabelen starter i valgt hjørne (15.10.2026, gren `kabelmotor`) — DELVIS

Ny låst regel (spec §0.9): kabelens tilkoblingsende ligger ≤ 40 cm fra det hjørnet
retningsvelgeren peker på, og regelen slår dekning, fasit-CC og om nødvendig valgt retning.

- v6 ut av motorkonkurransen, skew beholdt (målt: v6 vant 6 ganger, alle seks ugyldige).
- Én hjørnedefinisjon for alle motorer; hjørnet er et FILTER på kaskadenivå, ikke et poeng.
- Hjørnerunde ned CC-stigen med paritetsvarianter; dekningsvakten fra 082 fjernet.
- Retningsfallback + panellinjer (⚠ når hjørnet er umulig, med avstand og grunn).

Treff på valgt hjørne: 43 → 68 av 128 kombinasjoner.

⚠ TO ÅPNE PUNKTER, se STATUS §23: regresjonssuiten er 177 s mot kravet 40 s (hjørnerunden må inn
i hovedsøket, ikke etter det), og R-START kan ikke gjelde samtidig som 076-fasiten for Rom 5
loddrett `tr` — loddrett kan ikke starte oppe til høyre i det rommet. Begge trenger Kenneths svar.

## 082 — ett løp mindre flytter starten til hjørnet (15.10.2026, gren `kabelmotor`)

Ny paritetsvariant: ytterste bane fjernes fra én celle, aldri en inne i cellen. Det flipper
pariteten og dermed hvilken ende kabelen kommer ut i — som er det som låste starten 83 cm nede
på veggen med «øvre venstre» valgt.

Mekanismen når hjørnet for alle tre produktene på Rom 5 (26/33/25 cm, hullfritt). ⚠ Men med
fritt søk nedover CC-stigen brøt den Kenneths egen fasit (Rom 5 CC 13,2 → 12,6), senket badHakk
fra 92,5 til 89,7 % dekning, og gjorde regresjonssuiten 7× tregere. Runden kjører derfor bare på
vinnerens EGEN CC og aksepterer bare når utlegget ikke blir dårligere på noe mål.

Resultat: 600W treffer hjørnet (26 cm). 700W og 10T står på 83 cm med fasiten urørt, og panelet
oppgir avstanden. Valget mellom hjørnet og fasiten gjenstår — se STATUS §20.
22/22 batterier grønne (1019 påstander).

## 081 — hjørnevelgeren hører på opp/ned (15.10.2026, gren `kabelmotor`)

080 gjorde hjørneleddet levende, men det var fortsatt binært på KVADRANT. Målt: en start 21 cm
over rommets midtlinje ble regnet som «øvre», og poengleddet så ingen forskjell på den og et
punkt 68 cm høyere oppe. Derfor hørte vannrette utlegg bare på venstre/høyre.

- Leddet er nå gradert på avstand til valgt hjørne, så sveipeaksen teller med.
  Rom 5 vannrett: `tl` → y = −841, `bl` → y = −1035 (rommet er −836 … −1040).
- Loddrett er låst av paritet: det øvre feltet har 6 baner, og med partall må kabelen ut i samme
  ende den kom inn. Panelet oppgir avstanden: «Start: 83 cm fra oppe til venstre — nærmere er
  ikke mulig med dette utlegget.»

Hindringer, målt: én hindring gir 96,00 m eksakt, 0 hull, 0 kryssinger, 0 utenfor — motoren
legger seg rundt den som rundt en veggstubbe. Tre hindringer er fortsatt ugyldig (10 celler
trenger 6 transittkorridorer, taket er 2). Utleggene ellers uendret.
22/22 batterier grønne (1008 påstander).

## 080 — hjørnevelgeren betyr noe (15.10.2026, gren `kabelmotor`)

Innsetningspunkt-velgeren var død i geo-motoren: alle fire hjørnevalg ga identisk start.
`_geoMakeCable` bar `startCorner` videre som en etikett uten å orientere banen, og `_geoScore`
fikk `corner: wantCorner` inn — sammenligningen var alltid sann.

- Banen orienteres nå etter valget (en varmekabel har ingen egen retning, så å snu punktlista
  er gratis), og poengleddet måler det faktiske hjørnet.
- Rutens to ender er gitt av geometrien. Finnes ikke det valgte hjørnet — på Rom 5 ender ingen
  rute nede til venstre, fordi det er der transitten går ut — sier panelet fra:
  «Start: oppe til venstre — nede til venstre er ikke mulig i dette rommet.» Nivå `ok`, så den
  ikke toaster på hvert utlegg.

Utleggene er ellers uendret: 600W 35,00 m / 0 hull, 700W 40,97 m / 0 hull, 10T 60,00 m / 0 hull,
alle med jevn CC. 22/22 batterier grønne (1003 påstander).

## 079 — jevn CC over hele gulvet (15.10.2026, gren `kabelmotor`)

Kenneths regel: ytterste løp under utstikkeren skal flukte med det over, den vannrette strengen
langs utstikkeren skal fortsette lenger inn i rommet, og lengden justeres med trimming hvis
kabelen er for kort og med tettere CC hvis den er for lang.

Hullet på 2 × CC i Rom 5 oppsto i RUTINGEN, ikke i celledelingen: transitten lot den kappede
banen ligge igjen inne i nabocellens serpentin, og U-svingen ut av den dro naboen ned fra
179 til 58 cm.

- Ny fjerde transittvariant: A-siden av transittbanen eies av cellen under hindringen.
- Ytterste løp flukter — og det er paritet, ikke kosmetikk: med partall baner må inn- og utgang
  ligge i samme ende, og hullet flytter seg bare.
- `jtRound` i `_cableLegalRegion`: kantavstand er en avstand, ikke en gjæring. Et rett
  innstikkende hjørne ga 7,07 cm forbudt sone mot kravet på 5.
- For lang kabel → tettere CC og flere løp, men bare når vinneren har hull.
- `_geoInteriorHoles` leser nå senterlinja i stedet for et rutenett som ikke oppdateres, og
  fanger også en kolonne som er tom i ett bånd men brukt i et annet.

Rom 5 600W: 34,89 m / 1 hull → 35,00 m eksakt / 0 hull, jevn CC 14,5 over hele gulvet.
700W uendret. Prisen er dekning: 91,5 → 89,1 % (rom5) og 91,0 → 86,7 % (badHakk).
22/22 batterier grønne (996 påstander).

## 078 — lagre-indikatoren lyver ikke om ulagrede endringer (15.10.2026, gren `kabelmotor`)

Indikatoren hadde fem tilstander — `saving`, `saved`, `offline`, `error`, `readonly` — men ingen
for «ikke lagret ennå». Målt: etter GODKJENN er `_projectDirty` `true` mens indikatoren er
byte-identisk med før endringen, grønn prikk og «Lagret 05:54:47». I vinduet mellom en endring og
at autolagringen fyrer (≥ 5 s) påsto den at alt var lagret.

- Ny tilstand `dirty`: åpen grå ring, tittel «Ulagrede endringer – sist lagret HH:MM:SS. Lagres
  automatisk.» Dempet, ikke rød — autolagringen tar det om fem sekunder.
- Settes i `_scheduleAutoSave`, funnelen alle 50 mutasjonsveiene går gjennom, etter gatene: i
  kundemodus røres indikatoren ikke (030), og skrivebeskyttet eier sin egen tilstand (060 §3).
- Fem nye påstander i `_prosjektlaasRegressionTest`.

⚠ Rettelse: jeg meldte dette som «GODKJENN lagrer ikke». **Den feilen finnes ikke** — `pushUndo`
kaller `_scheduleAutoSave()`, og utlegget planlegges for lagring i det det legges. Diagnosen var
en grep, ikke en måling. Se STATUS §16.

## 077 — kabelutlegget ventet ikke på polygonbiblioteket (15.10.2026, gren `kabelmotor`)

Rotårsaken bak de ugyldige utleggene i Rom 5. `clipper-lib` ble lastet LAT, og utleggsveien
ventet ikke på den: tapte man kappløpet mot CDN-et, regnet `_cableLegalRegion` det lovlige
området hjørnevis, ny motor fant ingen gyldig kandidat, og den gamle V6-motoren vant alene med
20 løp som krysset seg selv. Målt: **v6 / CC 14,14 / ugyldig** uten biblioteket mot
**geo / CC 15,28 / gyldig** med.

- Biblioteket forhåndslastes ved oppstart (ferdig 114 ms etter navigasjonsstart).
- `_cablePreviewPlace` venter på biblioteket — men bare når det ikke er klart, fordi sone-testen
  og «Fyll rom automatisk» leser tilstand synkront rett etter kallet.
- Et tilnærmet utlegg merkes (`_geomApprox`) og sier det i panelet, i stedet for å tape stumt.
- Seks nye påstander kjører Rom 5 med clipper slått av, så dette ikke kan komme tilbake uoppdaget.
- Sidefiks: tidspåstanden i `_prosjektlaasRegressionTest` var rød av klokka før kl. 06.

Ingen terskel og ingen motor er endret. 22 av 22 regresjonsbatterier grønne.

## 076: Kabelmotor — Rom 5 som fasit og fast regresjon, CC låst, beste tilstand merket — 2026-10-14

Etter sparring: Kenneth svarte på de tre spørsmålene i STATUS §10.6. CC skal ikke flyttes for
jevnhetens skyld, lengden er fortsatt hard (±1 %), og Rom 5 blir fast testrom.

### STEG 0.2 — hvilken commit gir fasiten

Rom 5, InFloor 17T 700W 41m, loddrett, start øverst til høyre:

| commit | CC | lengde | gyldig | kryss/knekk | ⚠ |
|---|---|---|---|---|---|
| `30ea330` 074d | **13,20** | 40,97 m (−0,07 %) | ja | 0 / 0 | nei |
| `c6d198c` 074e | **13,20** | 40,97 m (−0,07 %) | ja | 0 / 0 | nei |

⚠ **Identiske.** Alle fire kabellengder og begge retninger ga bit for bit samme resultat.
Forskjellen Kenneth så lå altså ikke i `generateCableGeo`. Jeg klarte heller ikke å reprodusere
⚠-et fra den LAGREDE geometrien: hele kaskaden, fire starthjørner, begge retninger og auto —
alt gyldig på begge versjoner. Mest sannsynlig var rommet på skjermen redigert og ulikt det
lagrede (Rom 5 har ingen lagret kabel). **Står åpent.**

Tag: `kabelmotor-fasit-rom5` → `30ea330` (den eldste av de to, færrest bevegelige deler).
HEAD-koden var allerede 074d, så 076 er bygget rett oppå — ingen ny revert.

### Rettet

- **CC er låst.** Nabotrinn-søket — det eneste som flyttet CC for utseendets skyld — er fjernet,
  sammen med `fastLenHullfri`. CC regnes av lengden og netto areal som 016 bestemte.
  Hullstraffen står: en jevn variant vinner over en holete **på samme CC**. Dominans-vakten står.
- **Rom 5 er fast fixture** med den ekte geometrien (hentet lesende, 5,698 m², ti punkter, ingen
  kundedata). Veggmålene stemmer med Kenneths oppgitte: V1 260 · V2 75 · V3 39 · V4 129 ·
  V5 300 · V6 99 · stubbe 100/13/98 · V10 93.
- **Galleriet** viser Rom 5 **øverst**, med tegning · fasit bygget og kontrollert · motoren.
- **Fasit-byggeren rettet:** den tok den FØRSTE transitt-varianten som lot seg rute, mens motoren
  tar den best scorende. På Rom 5 ga det 39,57 m (−3,48 %, lengdebrudd) — kolonnen påsto altså at
  Kenneths egen fasit var ugyldig. Nå velges varianten som treffer produktlengden best: 40,97 m,
  identisk med motoren.

### Prisen for låst CC, målt

`badHakk41` mister sin hullfrie løsning. Ved CC 13,18 er kappet-varianten den eneste uten hull,
og den lander på 42,23 m = **+3,01 %** — utenfor ±1 %. Rommet beholder derfor én tom bane
(91,0 % dekning mot 94,9 % med trinnsøket). Påstanden i regresjonstesten er endret fra «0 hull»
til «høyst 1 hull for badHakk41», med målingen i koden. `rom5` og `badHakk` er hullfrie.

### Verifisering

`_cableGeometryRegressionTest` 52 → **70 påstander** (18 nye for Rom 5 og CC-låsen).
**22 batterier grønne.** Galleriet: 16 rom × 2 retninger, **26 gyldige / 6** — samme seks
umulige som før. Rom 5: loddrett ok 93,4 % CC 13,20 · vannrett ok 93,4 % CC 12,93.

---

## 074d: Kabelmotor — 074c på nytt, med vakt mot at utlegget blir dårligere — 2026-10-14

074c ble rullet tilbake fordi Kenneth målte at det ble verre i hans eget bad (Rom 5, 5,70 m²).
«Prøv på nytt, men CC må aldri utenfor anbefalt område.»

### ⚠ To ting jeg hadde feil om, begge rettet av måling

**1. ⚠-et på etiketten betyr ikke «CC utenfor anbefaling».** Kenneths to utlegg viste «⚠ CC
14,9» og «⚠ CC 10,1». Jeg antok at CC lå utenfor området. Målt i koden (`:35138`):

```js
_info.push(((_ccOverWarn(prod, ccCm) || (cable._geomDefects && cable._geomDefects.length))
            ? '⚠ ' : '') + 'CC ' + ccCm.toFixed(1) + ' cm');
```

Romtypen «Bad» har hverken `ccMinCm` eller `ccMaxCm`, og produktets anbefaling er 20 cm — så
14,9 og 10,1 er godt INNENFOR. Trekanten kom fra `_geomDefects`: **utleggene brøt en hard
regel.** Det er alvorligere enn en CC utenfor anbefaling, og det var den ekte skaden i 074c.

**2. En GLOBAL CC-sperre går ikke — den bryter 016.** Første forsøk var å søke i det anbefalte
vinduet først. Det fikk fem påstander i `_ccWarnRegressionTest` til å falle. 016 bestemte
bevisst at CC over anbefalingen er en ADVARSEL, ikke en sperre, fordi **kabelens lengde styrer
flateeffekten**: 36 m i 10 m² TRENGER CC 27,8 cm for å gi de ønskede 60 W/m². Klemmes CC til
20, blir det 85 W/m² — testen sier det rett ut: «var 85 før 016».

### Rettet

Sperren er lagt **der den hører hjemme**, ikke globalt: på nabotrinn-søket som 074c innførte —
det eneste som flytter CC for utseendets skyld. Motorens primære CC-valg (lengden bestemmer) er
uendret.

Et nabotrinn får bare overta når det er **bedre eller likt på hvert mål** — samme dominans-regel
070 bruker når ny motor tar over for den gamle:

```
gyldig · lengde innenfor ±1 % · dekning ikke dårligere · klaring ikke dårligere
       · bøyeradius ikke dårligere · ikke mer utenfor · ingen ⚠ CC
```

Uten den vakten byttet søket geometri på en poengsum brukeren ikke ser. Det var nettopp det som
skjedde i 074c.

### Målt på alle 15 fixture-rom

| | |
|---|---|
| Rom som får ⚠ (brudd på hard regel) | **de samme seks som før** — flereHindringer ×2, kabelForLang ×2, boyUmulig ×2 |
| Rom med ⚠ CC | kun `kabelForKort` (48,7 cm — en 3 m kabel i et stort rom; 016-oppførsel, uendret) |
| Badet 47 m loddrett | 0 hull · CC 11,60 · dekning 92,5 % |
| Badet 41 m loddrett | 0 hull · CC 13,81 · dekning **94,9 %** (var 91,0) |

Ingen rom ble dårligere, og ingen rom fikk et merke det ikke hadde før. Det er sjekken som
manglet i 074c.

### Står igjen

`enHindring` loddrett og `uRom` begge veier har fortsatt én tom bane — syntetiske testrom.

### Verifisering

`_cableGeometryRegressionTest` **52 påstander**. **22 batterier grønne**, inkludert
`_ccWarnRegressionTest` (016). Galleriet 24/30.

---

## 074c: Kabelmotor — hullmålingen var feil, og den straffet det jevneste utlegget — 2026-10-14

Kenneth sendte to skjermbilder av SAMME rom: 47 m «perfekt», 41 m ikke.

### To ekte hull i 41 m-utlegget

Målt løp for løp:

| bane | hvor det er kabel |
|---|---|
| 774,4 | over OG under stubben |
| **787,6** | **bare under** — øvre del tom |
| **800,8** | **bare over** — nedre del tom |
| 813,9 | over og under |

To tomme halvbaner ved siden av hverandre, forskjøvet — det er den hvite stripen som ser ut
til å gå gjennom hele rommet i bildet.

### ⚠ Målingen fra 074b var feil

Jeg målte avstanden mellom løpene på sju høyder. Den slo ut på **kantsonen**: i høyden mellom
løpenes ender og veggstubben finnes det nesten ingen løp, og den tomme stripen der er marginen,
ikke et hull. Målt på 41 m rapporterte den **«9 × CC»** for et utlegg der hver eneste
naboavstand var 13,8 cm — og poengsummen straffet dermed det JEVNESTE utlegget hardest.

**Riktig måling er ikke avstand, men banebruk** (`_geoInteriorHoles`): rutenettet vet hvilke
baner som finnes og hvor langt hver av dem er lovlig. En bane som står helt tom er et hull — og
bare når det ligger brukte baner på BEGGE sider. Ligger den ytterst, er den tomme stripen inntil
veggen, og det er nettopp prisen Kenneth sa han ville betale.

### CC er trinn, ikke en skala

Den jevne løsningen for 41 m lå på **nabotrinnet**: CC 13,81 i stedet for 13,18. Søket valgte
13,18 fordi lengden traff **1 cm** nærmere — og tok med det et hull og 4 prosentpoeng dårligere
dekning. Søket prøver nå nabotrinnene (N ± 1, N ± 2) når vinneren har et hull.

Bevisst begrenset til noen få trinn: et fritt søk over hele stigen fant jevne løsninger som
krevde mye mindre CC og kostet 6 prosentpoeng dekning (målt på 47 m: 92,7 → 86,7 %). Det er en
annen avveining enn «dra kabelen litt inn fra veggen», og skal ikke tas av motoren.

### Resultat — badet loddrett

| | 41 m før | 41 m etter | 47 m |
|---|---|---|---|
| Tomme baner i feltet | **2** | **0** | 0 |
| CC | 13,18 cm | 13,81 cm | 11,60 cm |
| Lengde | 41,03 m (+0,07 %) | 41,04 m (+0,09 %) | 47,09 m (+0,19 %) |
| Dekning | 91,0 % | **94,9 %** | 92,5 % |

41 m ble altså både jevnere OG bedre dekket — nabotrinnet var bedre på begge deler.

### Står igjen

`enHindring` loddrett og `uRom` begge veier har fortsatt én tom bane. Det er syntetiske
testrom, ikke Kenneths bad.

### Verifisering

`_cableGeometryRegressionTest` 48 → **52 påstander** (begge badene låst: null tomme baner,
dekning ≥ 92 %). **22 batterier grønne.** Galleriet 24/30.

---

## 074b: Kabelmotor — jevn avstand går foran dekning — 2026-10-14

Kenneth, med skjermbilde og grønn ramme rundt feltet over veggstubben:
«Jeg ønsker at kabelutlegget skyves slik at cc blir jevn, og heller at vi får et udekket område
inntil veggen. **Det er alltid viktigere å få en jevn avstand mellom kabelløpene enn å dekke helt
ut mot veggene — heller dra inn kabel fra vegg for å få jevnest mulig utlegg.**»

### Målt

Alle 25 naboavstander i utlegget var 11,6 cm — så en global CC-måling sa «helt jevnt». Men målt
**per bånd**, i høyden y = −1000 (over stubben):

```
… 763,3 · 774,9 · [23,2 cm] · 798,1 · 809,7 …
```

Hullet er transittbanen. Den brukes bare *under* stubben, så over stubben sto den tom — et hull
på nøyaktig 2 × CC midt i feltet. Det var den hvite stripen i den grønne rammen.

### Rettet

- **`_geoWorstBandGap`** måler avstanden PER BÅND, ikke globalt, og teller bare mellomrom der
  det faktisk er gulv (midtpunktet må ligge i lovlig område — et stort mellomrom over en
  hindring eller et hakk er ikke en feil).
- **Ny transitt-variant: cellen skyves én bane.** Den gir fra seg sitt ytterste løp (det mot
  veggen) og overtar den tomme transittbanen. CC er uendret — løpene ligger fortsatt på det
  globale rutenettet, bare ett hakk bortenfor — og hullet flyttes fra midten av feltet ut mot
  veggen. Prøves FØRST, før de to gamle variantene.
- **Hull straffes i poengsummen** (`−40 × overskytende`), tungt nok til å slå 30-poengs-
  dekningsleddet: et jevnt utlegg skal vinne over et med hull selv når det dekker mer.
- **Lengdesøket måler alle variantene** og følger den som kan treffe lengden. Før fulgte det
  den første, og meldte «ingen løsning» for en retning som hadde en helt gyldig løsning.

### Resultat — badet, 47 m loddrett

| | før | etter |
|---|---|---|
| Verste hull i feltet | **2 × CC** (23,2 cm) | **1 × CC** |
| CC | 11,60 cm | 11,60 cm (uendret) |
| Lengde | 47,24 m (+0,51 %) | 47,09 m (+0,19 %) |
| Dekning | 92,7 % | **92,5 %** |

Prisen for jevnheten er 0,2 prosentpoeng dekning — en smal kald stripe inn mot veggen, nøyaktig
slik Kenneth beskrev. `uRom` vannrett ble også bedre (verste hull 4 → 2 × CC).

### Det som står igjen

`badHakk41` loddrett og `enHindring` loddrett har fortsatt et hull på 2 × CC: der er den skjøvede
varianten ikke gyldig (paritet/overgangskjede), og den eneste jevne løsningen krever en annen CC
— målt på 47 m ville det kostet 6 prosentpoeng dekning (92,7 → 86,7 %). **Det er en helt annen
avveining enn «dra kabelen litt inn fra veggen», så den er ikke tatt av motoren.** Kenneth må si
om han vil ha den.

### Verifisering

`_cableGeometryRegressionTest` 44 → **48 påstander**. **22 batterier grønne.**

---

## 074: Kabelmotor — stille kandidatsøk, én beskjed med vinnerens tall — 2026-10-14

Gren `kabelmotor`, **ikke merget**. Bugrapport fra Kenneth 14.10.2026 med skjermbilde:
«Jeg velger retning og innsetting, men den hopper tilbake og bytter visning av seg selv.
Varselen kommer opp flere ganger, det hjelper ikke å trykke den bort.»

### STEG 0 (målt før endring)

Oppsett: badet, InFloor 17T 700W 41m, 120 W/m², start nedre høyre, loddrett valgt.

| # | Målt |
|---|---|
| 0.1 | **Én `confirm` + én toast per kjøring**, stakk: `confirm ← _finishCableAutoFill ← _autoFillCableLegacy ← _cableLegacyInDirection ← _cableCandidatesForDirection`. Altså fra den GAMLE kaskadens kandidat i valgt retning. Gjentakelsen kommer av hvor mange ganger `autoFillCable` kjøres: hvert produktklikk, hver retningsendring (`_reapplyCableDirection`) og hver romflytting |
| 0.2 | **Ja — loddrett med 41 m gir et gyldig utlegg** fra ny motor: geo, CC 13,18 cm, 41,03 m (+0,07 %), dekning 91 %, alle harde krav ok. Fallbacken slår ikke inn på denne geometrien. `badHakk41` er lagt i galleriet |
| 0.3 | Retningsvelgeren leser `S.varmefolie.direction`, **ikke** kabelens `direction` (`_drawRwpDirection` → `_vfPickerLabel`). Et fallback skriver den ikke — `_cableLegacyInDirection` legger den tilbake i `finally`. Målt med en settere-vakt på feltet: **null skrivinger** gjennom hele kjøringen |
| 0.4 | I kabelflyten finnes `confirm` bare på det ene stedet (:26612). De andre i fila ligger i rom-/hindring-/bakgrunnsveier som kandidatsøket ikke passerer |

### De tre tallene som ikke var enige

Kenneths skjermbilde hadde **25 %** (nettleserdialog), **10 %** (toast) og **● ok** (panelet).
De kom fra tre forskjellige utlegg — to av dem kandidater som tapte — og to forskjellige
dekningsformler. Vinneren hadde 91 % dekning målt av `_cableGeometryCheck`.

### Rettet

- **`_finishCableAutoFill` måler og merker, den snakker ikke.** Ingen `confirm`, ingen toast,
  ingen `return null` på grunn av dekning.
- **`_cableSearchDepth`** som vakt: alt som kjøres mens den er > 0 er kandidatmåling. En
  dybdeteller, ikke et `opts`-flagg som kan glemmes i ett kallsted.
- **`_cableStatusLines(cable, room)`** er den ene kilden til alt brukeren ser: dekning fra
  `_geomMetrics.coveragePct`, gyldighet fra `_geomDefects`, retning fra `_dirFallback`, forslag
  fra `_betterProduct`. Panelet tegner linjene, toasten slår dem sammen.
- **`_cableBetterProduct`** — samme serie (`_forslagKabelSerie`) og riktig effekt
  (`selectCableByPower` mot rommets ønskede W/m²). Badet: **17T 800W 47m (799 W)**, ikke
  10T 300 W. Forslaget regnes nå på VINNERENS dekning: den gamle formelen leser `cable.coverage`,
  et felt ny motor aldri setter, så et geo-utlegg fikk alltid «100 % dekket» og aldri noe forslag.
- **Valgt retning står.** Panelet sier «Retning: loddrett (valgt)», og ved et fallback kommer
  «Prøv loddrett likevel» som legger beste kandidat i valgt retning, merket ⚠, uten dialoger.
- **Effekt-merket er merket som effekt** («129 W/m² ● ok effekt»), så det ikke leses som en dom
  over dekningen rett under.

### Målt etter

Samme oppsett: **null nettleserdialoger, null toasts**. Ett gyldig loddrett utlegg.
Retningsvelgeren uendret. Forhåndsvisning → Godkjenn kjører kaskaden **én** gang totalt
(teller: 1 før, 1 etter — «Godkjenn» tar det som vises).

Panelet:

> ● Forhåndsvises — InFloor 17T 700W 41m
> 129 W/m² ● ok effekt · CC 13,2 cm · 41,0 m kabel
> Retning: loddrett (valgt)
> ⚠ 0,53 m² (9 %) uten kabel
> Bedre: InFloor 17T 800W 47m (799 W) · Bytt

### Byggefelle

`badHakk41` kopierte punktene fra `badHakk` inne i `const _cableFixtures = {...}`. Objektet er i
TDZ mens initialiseringen kjører, så oppslaget kastet «Cannot access `_cableFixtures` before
initialization» — og hele testbatteriet døde. Kopieringen skjer nå i en løkke rett etter
literalen, via feltet `sammeGeometriSom`.

### Verifisering

Galleriet: 15 rom × 2 retninger = 30 rader, **24 gyldige / 6** (samme seks som etter 072;
`badHakk41` består begge veier). `_cableGeometryRegressionTest` 36 → **44 påstander**.
**22 batterier grønne.**

---

## 071: kabelmotor — dokumentasjon og merge-sjekkliste — 2026-10-13

`docs/kabel/STATUS.md`: hva motoren gjør (lag A–H) på én side, galleritabellen rom for rom før
(068) og etter (070), **hva den ikke løser** med årsak og hva brukeren får se, hvordan et nytt
testrom legges til, og den utfylte merge-sjekklista.

`main` hadde ingen nye commits — ingen rebase nødvendig.

Sjekklista er oppfylt på seks av sju punkter; det sjuende er Kenneths «merge».
Dataformat-punktet er verifisert på tre ekte prosjekter, åpnet **lesende**, med begge lagrede
former: «Vidsynveien 175» (1 kabel, `runs`), «Vålerengahjemmet» (4 kabler, `runs`, 15 rom) og
«Kiwi Søvik» (16 kabler, `pathEls`). Alle gir romstatistikk og tegnet romside uten feil.

**Ett hull dokumentert, ikke tettet:** kontrollen kjører ved auto-utlegg, ikke ved åpning av et
prosjekt. Utlegg lagret før denne serien står umerket til kabelen legges på nytt. Å merke alle
gamle prosjekter ved åpning er en stor endring og bør være Kenneths valg (STATUS §3f).

---

## 070: kabelmotor — geometrikontroll i kaskaden, ⚠ for ugyldige utlegg, debug-visning — 2026-10-13

Gren `kabelmotor`. Etter 070 kan appen **aldri** vise et utlegg som bryter et hardt krav uten at
det står merket.

### Galleriet, kaskaden gjennom tre runder (28 rom × retning)

| | består | bryter et hardt krav | merket for brukeren |
|---|---|---|---|
| før 068 | 5 | 23 | **0 — alle stille** |
| etter 070 | **20** | 8 | **8 — alle merket** |

De 8 som står igjen er de geometrisk harde: hindring midt i rommet (4), kabel for lang for
rommet (2), bøyeradius umulig ved lovlig CC (2). Alle har nå årsak og forslag.

### Hvordan ny motor tar over — konkurranse, ikke hviteliste

Prompten foreslo en liste over romklasser. I stedet kjøres **begge** veier (ny `generateCableGeo`
og dagens kaskade), begge måles med `_cableGeometryCheck`, og en **dominans-test** avgjør:

- dagens ugyldig, ny gyldig → ny tar over
- ny ugyldig, dagens gyldig → dagens beholdes
- begge gyldige → ny tar over BARE om den ikke er dårligere på noe mål (dekning, lengdeavvik)
- begge ugyldige → færrest harde brudd

Det oppfyller merge-kriterium §8.2 («ingen rom dårligere, på hvert mål») direkte, i stedet for å
stole på at hvitelista er riktig. Målt før/etter på alle 28: **15 bedre, 5 uendret, 0 dårligere**,
og ingen rom der begge var gyldige tapte dekning. Et rent rektangel vannrett beholder dagens
boustrophedon (98,8 % dekning mot ny motors 97,1 %); badet vannrett bytter til ny motor (dagens
har 203 cm utenfor lovlig område, ny har 0).

### Annen retning — aldri stille

Valgt retning uten gyldig utlegg, mens den andre har ett → den gyldige legges, og det **sies**:
toast + rad i sidepanelet + knapp «Prøv vertikal likevel» (`_cableForceDirection`, legger ut i
valgt retning merket ⚠). Målt: badet med eksplisitt **vertikal** gir `v→h` og et gyldig utlegg.
Badet på **auto** gir gyldig utlegg uten ⚠.

### ⚠-visning og debug-visning

- `cable._geomDefects` (med posisjon) → rød stiplet romkontur + røde ringer på lerretet,
  «⚠» foran CC i labelen, defektliste + forslag + knapper i sidepanelet.
- PDF-romsiden får linja «Utlegget er ikke kontrollert — se app (…)». Eksport blokkeres aldri.
- Debug-visning (spec §7) i debug-overlayet (⌘⇧D) → «Kabelgeometri»: lovlig område, senterlinje,
  start/slutt, CC, klaring, bøyeradius, lagt lengde mot produktlengde. Av som standard, og
  **aldri med i PDF** (verifisert: romsiden er pikselidentisk med debug på og av).

### Soner holdes utenfor — en målt regresjon som ble fanget

`_buildNCableZones` tvinger felles CC i alle soner av et område (lik W/m² over sømmen).
`generateCableGeo` søker sin egen CC og kjente ikke bindingen — første forsøk ga 20,67 cm i én
sone og 20,6 i nabosonen (`_cableZoneRegressionTest`). Soner, `_zoneId` og `_forcedSpacingCm`
kjører derfor uendret på dagens kaskade til ny motor kan ta imot en bundet CC.

### To feil funnet underveis

1. **`pathEls`-kontrakten var brutt ett sted.** Label-sentreringen i `drawCables` antok at hvert
   ikke-`run`-element har `from`/`to`; ny motor leverer hele banen som ett `pts`-element, og da
   krasjet tegningen (`_soneRegressionTest`). Alle tre formene (`a`/`b`, `pts`, `from`/`to`)
   håndteres nå, i samme rekkefølge som `_cableWorldSegments`. Alle andre `pathEls`-lesere
   (`_offsetCableClone`, `_reserveClipToRoom`, `_drawCableSkewPath`, `_cableRunNormal`) var
   allerede riktige — gjennomgått.
2. **Sidefunn:** en hindring uten `label` OG uten `type` tegnet teksten «undefined» på tegningen
   og i PDF (`ctx.fillText(h.label||h.type,…)`). Nå `|| 'Hindring'`.

### Én gammel test endret — med begrunnelse, ikke stille

`_cableSkewRegressionTest` D («akseparallelt rom bruker IKKE skew, uendret motor») på et
600×300-rom med 30 m kabel: dagens boustrophedon la **36,3 m av en 30 m kabel** (+20,98 %) — mer
kabel enn produktet har. Kontrollen avviser det; ny motor legger 30,00 m (avvik 0,00 %).
Testens navn og hensikt står; det som er løsnet er kravet om `runs`-form, siden ny motor leverer
`pathEls`. Begrunnelsen står i koden ved testen.

Nytt batteri `_cableGeometryRegressionTest` (24 påstander): var gyldig før → må være gyldig nå,
dekning ikke dårligere, ugyldig utlegg MÅ være merket, ingen stille retningsbytte, og rektangel
vannrett bit-identisk med før. Alle 22 batterier grønne.

---

## 069: kabelmotor — generateCableGeo, ny motor isolert bak bryter — 2026-10-13

Gren `kabelmotor`. Kenneth sa ja til 068s arkitekturforslag. Ny motor
`generateCableGeo(roomId, productId, opts)` ved siden av de fire gamle; **ikke** i kaskaden
(det er 070). Bryter `S.ui.cableGeoEngine`, av som standard. Galleriet fikk `geo` som egen
kolonne (168 rader nå).

### Resultat, målt

| | Kaskaden i dag | `generateCableGeo` |
|---|---|---|
| består alle harde krav | 5 av 28 | **13 av 28** |
| bryter et hardt krav | **23 av 28** | **0 av 28** |
| ærlig «ingen løsning» (spec §5) | 0 | 15 |

Den viktigste egenskapen er den siste raden: motoren leverer **aldri** et ulovlig utlegg.
Ytelse: median 13 ms per rom, maks 83 ms (mål: godt under 500 ms).

**Kenneths bad vannrett: 47,00 m, avvik 0,00 %, CC 11,22, 0 kryssinger, 0 knekker, 0 cm utenfor
lovlig område, minste klaring 11,22 cm.** Referansen (skew) hadde 203 cm utenfor og −2,03 %.

### Fire ting STEG 0-modellen ikke forutså

1. **Akseparallellhet må måles i grader.** Badets vegger bøyer 5,2 cm over 197 cm = 1,5°. En
   cm-terskel kastet badet ut sammen med et ekte 18°-rotert rom. Grensen er nå 5°.
2. **En celle må også deles ved TRINN i grensen**, ikke bare ved kritiske punkter. Uten det
   havner badets smale bånd (190 cm forbi hakket) i samme celle som den brede delen (250 cm),
   og like-lengde-utjevningen klipper hele rommet ned til 190 — målt 22,4 m der 46 m skulle vært.
   Terskel: ett trinn større enn én CC.
3. **Lengden er en SAGTANN i CC.** N er et heltall: på 400×300 med 96 m gir N=32 → 94,9 m og
   N=33 → 97,8 m. 96,00 m finnes ikke for noen CC. Søket holder nå også den nærmeste
   FOR LANGE kandidaten, siden bare den kan trimmes ned med inntrukne vendepunkter. Etter
   fiksen: 96,00 m, avvik 0,00 %.
4. **Celleovergangen må være en U-sving, ikke en L-formet omvei.** Første forsøk rutet
   ortogonalt fra celle til celle; det beinet går tvers over løpenes ender og ga kryssing,
   klaring 0 og skarpe knekker i hvert eneste flercelle-rom.

### Hva den ikke løser — og hvorfor det er riktig

Hindring midt i rommet (`enHindring`, `flereHindringer`, badet LODDRETT): cellene ligger som
`0 < {1,2} < 3` langs tverraksen. En bane innom alle fire må ut i en endekolonne og tilbake,
og tilbaketuren har ingen lovlig korridor. **Geometrisk kjensgjerning, ikke en kodemangel** —
V6 «løste» det ved å tegne tvers over, som er feilen 068 målte.
`_geoTrySplitTwo` PRØVER todelingen før den foreslås: begge gruppene rutes for seg, og bare når
begge gir lovlig bane foreslås to kabler, med målte lengder og produkt i riktig størrelse
(`enHindring` loddrett: 39,2 m + 39,2 m).

### Åpent til 070/071

- **Dekning er litt lavere enn kaskaden i noen rom** (badet vannrett 88,3 % mot skews 96,5 %;
  rektangel vannrett 97,1 % mot 98,8 %) — prisen for like lange løp i hver celle. Merge-kriterium
  §8.2 («ikke dårligere på hvert mål») må Kenneth ta stilling til.
- `kabelForKort` godtas med CC 48,6 og 44 % dekning — lovlig etter `_ccLimits.maxHard` (50), men
  ikke et godt utlegg. Hører hjemme i romtypens CC-grenser.
- Transittkorridor for hindringsrom er mulig senere (som `leadRun` for flerkabel), men koster
  dekning og bør være et bevisst valg.

Alle 21 regresjonsbatterier grønne.

---

## 068: kabelmotor — geometrikontroll for harde krav, romgalleri, analyse — 2026-10-13

Gren `kabelmotor` (worktree). Kenneth: «Jeg forstår ikke at kablene i bildet kan krysse
hverandre, ha forskjellige CC-avstander og krysse vegger? Her er det brudd på minst tre
harde regler.» Rom «Bad», 5,89 m², InFloor 17T 800W 47m.

### STEG 0 (målt før kode)

Badet ble funnet i skyen: **«Ekebergveien 28» → rom «Bad»**, 5,887 m². Geometri (11 punkter,
ingen hindringer, ingen soner) kopiert inn som `_cableFixtures.badHakk`; prosjektet bare lest.

| | Målt |
|---|---|
| Vertikalt (det ødelagte) | **V6** vinner. Skew prøves først og avvises: `openLen` 186,6 cm mot terskel 18,8 |
| Horisontalt (det «perfekte») | **SKEW** vinner. CC 12,53 → 136 W/m² — nøyaktig Kenneths tall |
| Hvorfor forskjellen | Hakket er 12 cm høyt. **Vertikalt** kutter det løpene → 3 celler. **Horisontalt** går hvert løp uavbrutt langs det → 1 celle |
| v6/v, lagt vs. rapportert | 51,03 m tegnet, 46,99 m rapportert, 46,39 m i dekningen — **tre tall for samme kabel** |
| v6/v, CC | 11,09 cm mellom de fleste løp, **22,18 cm** over en cellegrense |
| v6/v, utenfor | 284 cm av banen utenfor lovlig område, verst 11,0 cm (gjennom hakket) |
| skew/h, kantavstand | **0,83 cm** fra veggen der 5 cm kreves, over 213 cm — også i det «perfekte» utlegget |

**Rotårsakene, med linje:**

1. **Kabelen har ingen geometri i datamodellen.** `runs[]` er bare de rette løpene.
   U-svinger og vegg-følge-linjer finnes bare i `_drawCableUTurns` (:32637, skjerm-
   koordinater) og regnes om med *andre* formler i `_calcTotalCableLength` (bue = π·CC/2,
   ikke den faktiske løpsavstanden) og `_cableWorldSegments` (hopper over vegg-følge-linjene
   og `connections[]`). Derfor kunne ingen kontroll finnes, og derfor var feilen usynlig.
2. **Hver celle sentrerer sitt eget rutenett** — `_v6SweepCell` :24702 `firstPos = pMin + sideM`.
   Naboceller får ulik fase → CC over grensen blir hva som helst. Det er «halv CC».
3. **Cellekoblingen kommer i TILLEGG til U-svingen.** `_v6ConnectCells` bygger `connections[]`,
   men setter ikke `_chainBreaks`, så `_drawCableUTurns` tegner *også* halvsirkel + to rette
   vegg-følge-linjer over samme cellegrense. To baner, åpne ender, kryssing.
4. **Kantavstanden måles mot omsluttende rektangel, ikke polygonet** — `_skGenerateRotated`
   :25418 (`bb.minX + margin`) og `_v6BuildHeatableArea` :24394. En skrå eller trappet vegg
   ligger innenfor det rektangelet. Det er svingene «helt inntil den skrå veggen».
5. **`_v6OptimizeLength` fase 3 tilordner lengden** (`totalLength_cm = targetLen_cm`) etter å ha
   trimmet løpene — og `_tryFull(spacing, extraSweepMargin)` bruker aldri sitt andre argument,
   så hele fase 2 er et søk som regner samme svar 25 ganger.

### Bygget (leser bare — ingen motor og ikke kaskaden er rørt)

- `_cableCenterlinePaths(cable)` — én ordnet senterlinje, tro mot rendereren, for begge former.
- `_cableLegalRegion(roomId, productId)` — rom − kantavstand − hindringer − soner, ekte
  polygon-offset med **clipper-lib@6.4.2** (spec §0.6), lastet lat fra CDN, fail-soft til
  `_offsetPolygon` med `metrics.legalAreaApprox`.
- `_cableGeometryCheck(cable, room)` → `{ ok, hard[], soft[], metrics }`. Harde: `utenfor`,
  `kryssing`, `nærføring`, `bøy`, `lengde`, `cc`, `brudd`. Myke: `cc_variasjon`,
  `kant_asymmetri`, `hopp`, `dekning`. Logger `[cable-check]` når `S.ui.debugCableEngine`.
- `_cableFixtures` — 14 rom (spec §6), inkl. `badHakk`.
- `_cableGalleryRun()` / `_cableGalleryExportHtml()` → `docs/kabel/galleri.html`, 140 rader
  (14 rom × 2 retninger × kaskaden + 4 motorer), SVG med rød bane og blå ring på hvert brudd.
- `serve-varmeplan.js`: `PORT` fra miljøet, og `POST /__write-galleri` (dev-server, skriver
  nøyaktig den ene filen) — forhåndsvisningsruten blokkerer nedlastinger en side selv starter.

### To målefeil funnet og rettet i kontrollen selv (ikke terskler)

- Klaringssveipet hoppet over segmentpar «4 indekser fra hverandre». En U-sving tegnes som 24
  punkter, så to prøver 4 fra hverandre i SAMME sving ligger 2,4 cm fra hverandre rent
  geometrisk. Det ga `nærføring` i 117 av 140 utlegg — et rent rektangel med CC 12,4 inkludert.
  Rettet til et fysisk vindu: banelengde mellom segmentene < π·CC/2 (én hel sving).
- Første forsøk målte banelengden til segmentenes **midtpunkt**. Et 378 cm langt løp har
  midtpunktet 189 cm fra sin egen skjøt, så to segmenter som deler endepunkt slapp gjennom og
  ga klaring 0. Rettet til intervall-avstand (`s0`/`s1`).

### Galleriet «før» — 14 ok, 113 feil, 13 ingen løsning av 140

Harde brudd i alt: `lengde` 99 · `utenfor` 59 · `nærføring` 40 · `bøy` 34 · `brudd` 28 ·
`kryssing` 21. Rene rektangler består (alle fem motorer, horisontalt). Alt med hakk, hindring
eller passasje feiler. **Tersklene er ikke rørt for å gjøre galleriet grønt.**

### Åpne spørsmål → `docs/kabel/prompter/SPØRSMÅL.md`

Lengdetoleransen ±1 % (avgjør 99 av 140), om Kenneths horisontale referanse selv skal rettes,
om `pathEls` (auto-bare) er greit, og om rettvinklede overganger skal regnes som hardt brudd.

**STOPP** — 069 kjøres først når Kenneth har lest analysen og arkitekturforslaget
(`docs/kabel/arkitektur.md`).

---

## 072: Kabelmotor — transittløp, løp som følger veggene, Kenneths fasit — 2026-10-13

Gren `kabelmotor`, **ikke merget**. Kenneths håndtegnede fasit for badet
(`docs/kabel/fasit/*.png`) er oppgaven; spec `docs/kabel/spec-kabelmotor.md`, status
`docs/kabel/STATUS.md`.

---

## 087: Trapp — mållinje (D) virker i trappmodulen og blir stående — 2026-10-15

Kenneth: «Ønsker å kunne bruke målefunksjon (distanse) slik som for innendørs — i dag blir målet
borte fra tegningen.»

### STEG 0 (målt på Frydenbø, lesende — prosjekt med bare trapp-del, ingen etasjer)

| | Målt |
|---|---|
| Hvor havnet målet? | `S.floatingDims` med **`floorId: null`** (`_effectiveActiveFloorId()` gir null når det ikke finnes etasjer) |
| Hvorfor usynlig? | `_onActiveFloor` krever roomId eller floorId; objektet hadde ingen → «vises aldri» (dev-varselet i konsollen bekreftet det). **Årsak 2.** |
| Årsak 1 (rom valgt)? | `_enterPart` nullstiller `selectedRoomId`, og `selectStair` gjør det samme — kan bare skje hvis man går rett fra rom til D uten å bytte del. Gatet uansett nå |
| Årsak 3 (klikk velger trappa)? | **Nei.** Mål-modus håndteres før trappeklikket i mousedown; ingen drag startet |
| Bare-trapp-prosjekt | Virket ikke (samme feil) |
| Lagring | `stairs` og `floatingDims` lagres/leses; men `_restoreProject` **gjettet første etasje** på et fritt mål uten floorId |
| Bifunn | Frie mål hadde **ingen gizmo og kunne ikke flyttes** (`_dimGizmoCenter` og avstandsdraget søkte bare `room.dims`) — gjaldt også innendørs etter kalibrering |

### Gjort

- **Én kilde for brukerens mål:** `_findUserDim(id)`, `_dimWorld(dim, stair)` og
  `_collectVisibleDims()` (rom på aktiv etasje + frie mål via `_onActiveFloor` + `stair.dims` for
  trapper i aktiv del). Tegning, treff, klikkvalg, gizmo, avstandsdrag, Delete, ctxbar og
  angre-gyldighet går gjennom dem.
- **Trapp-delen:** trapp valgt → `stair.dims[]` med punkter relativt til `x_cm/y_cm` (følger
  flytting, slettes med trappa). Ingen trapp valgt → fritt mål med `partId`, aldri gjettet
  `floorId`. `_onActiveFloor`: `partId` ⇒ synlig når delen er aktiv (ny rad i revisjonstabellen).
- **Snapping:** `_stairDimSnap` — hjørner (prioritert) og kanter på hver flate i plan, og profilen i
  sidevisning (samme forskyvning som `drawStairs`). Shift gir fri lengde som før.
- **Knapp «Mållinje»** i trapp-ctxbar både uten og med valgt trapp.
- **Delete-sikkerhet:** å klikke et mål avvelger trappa (Delete sjekker trapp før mål).
- Lagring/angre: `stair.dims` dypkopieres i `pushUndo` og `_buildSaveData`; `_restoreProject` lar
  frie mål med `partId` beholde den.
- Rører ikke mål som alt ligger «gjemt» (lesende telling under).

### Verifisert (33 sjekker, syntetisk på Frydenbø-kopi + midlertidig innendørs-del)

Trapp valgt/ikke valgt, rom valgt innendørs først, klikkvalg + gizmo + drag + Delete (sletter målet,
ikke trappa), snap til hjørne/kant/sideprofil, lagre → gjenopprett, slett trappa, innendørs uendret,
bare-trapp-prosjekt. `_stairRegressionTest` (084) fortsatt grønn.

### Lesende telling av «gjemte» mål (180 prosjekter)

5 mål i rom med begge punkter > 2 m utenfor rommets boks (Knut Arne og Bente: 1, Fossilveien 18: 4)
og 1 fritt mål uten gyldig etasje (prosjektet «Trapp»). Ikke rørt.

## 086: Trapp — Raster-knappen også i trappmodulen — 2026-10-15

Kenneth: «Ønsker å kunne skru av visning for raster.» (i trappmodulen)

### STEG 0

| | Målt |
|---|---|
| Eneste grunn til at knappen manglet? | **Ja.** `updateTopbarForModule` skjuler alt med `data-modules` som ikke nevner modulen; Raster lå i gruppa `indoor snow` sammen med Snap/Bygg/90°/45° |
| Eget raster i trappmodulen? | **Nei.** `drawStairs`/`_drawStairPlan`/`_drawStairSide` tegner ingen hjelpelinjer; rasteret kommer kun fra `render()` → `drawGrid()` gatet på `S.ui.showGrid` |
| Lagres `showGrid`? | **Nei** — ikke i `_savePrefs` (den lagrer `snap`), ikke i prosjektet. Økt-innstilling; PDF-eksporten slår den av/på selv rundt rendringen (urørt) |

### Gjort

- Raster-knappen flyttet til egen gruppe `data-modules="indoor stair snow"`. Snap/Bygg/90°/45°
  står igjen i `indoor snow`.
- `updateTopbarForModule` setter knappens `on`-tilstand fra `S.ui.showGrid` ved modulbytte, så én
  felles innstilling vises riktig i alle moduler (SPØRSMÅL 4: felles, ikke per modul).
- Ingen ny hurtigtast.

### Verifisert (Frydenbø, lesende)

Trapp: knapp synlig, Snap-gruppa skjult. Klikk → `showGrid=false`, knappen grå, tomt lerretsområde
går fra 65 farger til 1 (rasteret borte). Bytt til innendørs → knappen viser «av», Snap-gruppa
tilbake. Liste: ingen knapp.

## 085: Trapp — sidevisning i PDF, trappen målsatt i plan og side — 2026-10-15

Kenneth: «Trapp utendørs: jeg ønsker at sidevisning av trapp kommer med i eksport-PDF og at trappen
er målsatt, begge visninger.»

### STEG 0

| | Målt |
|---|---|
| Bryter for rom-målkjeder | **Finnes ikke globalt.** `toggleSnap('dims')` slår `room.dimSnap` per rom (auto-målene på veggene). Trappens kabelmål tegnes alltid (DEL B fjernet «valgt»-kravet i 2026-09). Geometrimålene tegnes derfor **når trappen er valgt** |
| `stepHeight_cm` på flater | Settes av `_generateStairSurfaces` fra segmentet; `_migrateStairToSegments` fyller `step_height_cm \|\| 17` for gamle trapper. Fallback som i `_drawStairSide` beholdt |
| PDF Frydenbø før | Én plan-side (0,94 aspekt, urotert) med kabelmål. Ingen sidevisning, ingen mål på selve trappen (`085-before-plan.png` i økta) |

### Gjort

- **`_stairGeometryDims(stair, view, range)`** — én kilde for trappens egne mål, i trapp-cm, brukt
  av skjerm og utskrift. Plan: inntrinn-kjede (like trinn slått sammen «8 × 32 = 256», repos for seg)
  og total lengde til venstre, bredde per serie under. Side: opptrinn-kjede og total høyde til
  venstre, inntrinn-kjede og total lengde under. Totalen vises bare når den indre kjeden har mer
  enn ett ledd. **Opptrinn-kjeden følger tegningen: 8 trinn → «9 × 16 = 144»** (bakken → trinn 1,
  og ett opptrinn over hvert trinn, det siste opp til planet over). Se SPØRSMÅL.
- **`_drawStairGeoDims`** tegner dem grått (kabelmålene er blå), tikk i endene, tall midt på
  (rotert langs venstre kjede), utenfor trappen — geometri venstre/under, kabel høyre/over.
- **Skjerm:** `_drawStairPlan` og `_drawStairSide` tegner dem når trappen er valgt (zoom > 0,2).
- **PDF:** ny `_stairDrawSideToCanvas` (profil, kabelstreker ved sin dybdeposisjon, opptrinn-
  forbindelser, start/slutt-prikker, trinnummer, mål) og `_renderStairSidePrintImages` (1–3 bånd
  langs lengden, samme terskler som planen, aldri rotert). Plasseres **etter planen, før
  detaljutsnittene** med overskrift «Sidevisning». Plan-bildet får geometrimålene i tillegg
  (`opts.geoDims`, mer plass til venstre/under); detaljutsnittene er uendret.
- **Eksportdialog:** underavkrysning «Sidevisning» per trapp (på som standard, `opts.stairSide`).
  Kallere uten opsjonen får sidevisningen med.

### Verifisert

- Frydenbø (8 × 32 × 16, 240 cm): PDF side 2 = plan med «8 × 32 = 256» / «240» + kabelmål, side 3 =
  «Sidevisning» med «9 × 16 = 144» / «8 × 32 = 256», deretter «Trinn 1–8 (typisk)». Avhuket
  «Sidevisning» → ingen sidevisning, resten uendret.
- Syntetisk 31-trinns trapp med to repos (150 cm): sidevisningen deles i bånd, repos målt for seg.

## 084: Trapp — alltid et én-kabel-forslag; brukerens kantavstand er gulv — 2026-10-15

Kenneth: «Jeg ønsker at det alltid kommer opp et forslag med 1 stk kabel så lenge beregnet
lengdebehov er mindre enn den lengste kabelen i katalogen … en kabel som er nærmest, gjerne
kortere, og så trekke inn avstand fra kant helt til kabellengden treffer godt.» Spec Regel 19.

### STEG 0 (målt på Frydenbø · Trapp 1, 8 trinn à 32 × 16 cm, 240 cm bred, InSnow 30T 230V)

| | Målt |
|---|---|
| Lagret `edgeMargin_cm` | **12,5** — ikke Kenneths egen verdi, men marginen fra 70 m-kabelen han alt har valgt (produkt 147) |
| Strenger / behov ved gulv 12,5 | 32 strenger (8 × 4) · 69,92 m |
| Vinner med gulv 12,5 | **20 + 49,7 m ved 12,8 cm** — skrallen bekreftet: gulvet krøp 12,5 → 12,8 |
| Behov ved gulv 5 | 74,72 m |
| Vinner med gulv 5 | 25 + 49,7 m ved 5,0 cm (sum 74,7, 2 cm for kort) |
| Én kabel (70 m) ved gulv 5 | lå i lista med **12,4 cm** margin, men tapte på «minst marginøkning» — nøyaktig det Kenneth beskrev |
| 3/3-varianten | ga samme strengantall (4) og samme kandidater; A og B var to kopier av samme kabelsett |
| W/m² ved større sidemargin | **uendret** (321 W/m², CC 9,3) — Regel 16 regner av CC, ikke areal |
| Varmet bredde ved 12,4 cm | 215,2 av 240 cm (90 %) |

### Rettet

- **`_stairSolveExactCableSet` returnerer nå også `single`**: lengste katalogkabel ≤ behovet ved
  gulvet, med sidemarginen løst (samme lineære formel, mm-snapping, Regel 15). Egen grense:
  varmet bredde ≥ 75 % av smaleste flate (`STAIR_SINGLE_MAX_MARGIN_FRAC = 0,125`); over
  gulv + 15 cm får den gult merke, ikke avslag. Dagens `best`-sortering og returfelt er uendret.
  Bare i det frie søket — Regel 18 (N like kabler) og soner (`maxCables:1`) er urørt.
- **Forslag A = én kabel (Anbefalt), B = flerkabelsettet** fra samme margin-variant når det er et
  annet sett; ellers B fra 3/3-varianten som før. Finnes ingen én-kabel-løsning: som før, pluss en
  grå linje med grunnen («1 kabel: … ville gitt 34 cm kantavstand (under 75 % varmet bredde)» eller
  «behovet (128 m) er lengre enn lengste kabel (139,9 m)»).
- **Nytt felt `stair.edgeMarginMin_cm`** = det brukeren taster i «Avstand sider».
  `_stairFloorMargin(stair)` er gulvet løseren bruker. Et forslag skriver fortsatt bare
  `edgeMargin_cm` (utlegget). Eldre trapper: gulvet settes til dagens `edgeMargin_cm` ved innlasting
  (Frydenbø får 12,5 — Kenneth må sette den ned selv én gang). Innstillingspanelet viser
  «(din: 5)» ved siden av «Avstand sider» når utlegget ligger lenger inn enn gulvet.
- Én-kabel-kortet: «1 × InSnow 30T 2100W 70m · Kantavstand 12,4 cm (din: 5 cm) · Varmet bredde
  215,2 av 240 cm (90 %)». `_scoreStairProposal` trekker ikke lenger for justert margin på dette
  kortet.
- Ny `_stairRegressionTest()` (24 sjekker, syntetisk InSnow-katalog): Frydenbø-trappen, ny runde
  etter Velg (gulvet står), smal trapp (grå linje 75 %), lang trapp (lengre enn lengste), 3 like
  kabler (uendret), kantavstand-setter skriver begge felt. Soner verifisert manuelt (3-sone-trapp
  løses per sone som før).

### Avklart underveis

- Test 5 i prompten («3 like kabler» på Trapp 1) går ikke opp: 3 × 20 m krever +23 cm margin,
  over +15-taket. Det var slik før 084 også — testen bruker en 24-trinns trapp (3 × 70 m).
- Trapp-spec-en er ikke kopiert inn i `docs/` (Regel 19 står i Cowork-spec-en).

## 073: Kundestatus kan lukkes fra prosjektinfo — 2026-10-14

Kenneth: «Ofte svarer kunden meg på e-post at det ser greit ut. Da vil jeg gå inn på prosjektet
og få bort statusen «Venter på mål».» Spec-kundelenke, ny **regel 12**.

### STEG 0 (målt før endring)

| | Målt |
|---|---|
| Fjerner `revoked` OG `applied` «⏳ Venter på mål» fra lista? | **Ja** — `_fetchKundeStatus` hentet bare `open`/`answered` |
| Tillater CHECK-constrainten `applied` uten svar? | **Ja** — `check (status in ('open','answered','applied','expired','revoked'))` binder ikke `answer`. 028-panelet nås kun fra `answered`, og `_kundeLoggRunde` leser `k.answer \|\| {}` |
| Hva ser kunden på en `applied` lenke? | `kundelenke_get` gir null → «Lenken er ikke lenger gyldig … utløpt eller trukket tilbake». Tydelig, men **feil grunn** — den var ferdigbehandlet |

### Rettet

- **Knapper i stedet for lenketekst** i prosjektinfo-boksen, i tre tilstander:
  - åpen målforespørsel: **[✓ Kunden bekreftet]** · [Kopier] · [Trekk tilbake]
  - mottatte mål: **[Gå gjennom]** · [Lukk uten endring]
  - **åpen presentasjon: ny rad** «📄 Presentasjon sendt … · ingen svar ennå» med
    **[✓ Kunden godkjente]** · [Kopier]
- **Felles dialog** (kanal e-post/telefon/annet + merknad). `confirm`/`prompt` i «Avvis» er byttet
  til samme dialog — handlingen er uendret.
- **Egne logg-hendelser.** `bekreftet` og `lukket_uten_endring` leses som «Du lukket
  forespørselen: kunden bekreftet på e-post («Ser greit ut»)» og «Du lukket uten å bruke målene».
  «Trukket» er uendret. En manuelt lukket lenke får ikke lenger «Du innarbeidet målene» på toppen.
- **060-gaten** i alle fem skrivende veier (de skriver til `kundelenker`, som servertriggeren
  ikke dekker), og knappene er grå i skrivebeskyttet modus.
- **Kundens side:** «Lenken er avsluttet — den er enten ferdigbehandlet, utløpt eller trukket
  tilbake.»

### Funn: brikken forsvant der den skulle bli stående

Prompten ba om at «✓ Kunden godkjente» skulle gi «✓ Godkjent av kunde» i lista. Det var ikke
mulig slik koden sto: `status:'applied'` filtrerte raden bort fra `_fetchKundeStatus`.
`_fetchKundeStatus` henter nå også `applied` — men **bare rader med `approve_all_at`**, altså
hele-prosjektet-godkjenninger. En lukket målforespørsel forsvinner fortsatt, som Kenneth ba om.

⚠ **Synlig sideeffekt:** dette gjelder også en godkjenning kunden gjorde i appen og Kenneth
siden behandlet. Den brikken ble borte før; nå blir den stående. Det er riktigere (044s egen
formulering: «En godkjenning av hele prosjektet er grønn — den er et svar, ikke en oppgave»),
men det er en endring i noe som virket.

### To tekster endret

«⏳ Kundelenke: åpen» → «⏳ Venter på mål» og «✓ Svar fra kunde» → «✓ Mål mottatt», altså de
samme ordene som brikkene i prosjektlista og som Kenneth selv bruker. To påstander i
`_kundelenkeRegressionTest` matchet de gamle tekstene ordrett og er oppdatert; fargekravet
(grønn for svar, oransje for åpen) er uendret.

### Måling: «Kopier lenke» fikk ikke plass

Sidepanelet er 180 px (156 px innvendig). «Kopier lenke» (80 px) + «Trekk tilbake» (83 px) + 5 px
mellomrom = 168 px, så de falt ned på hver sin linje og tre stablede knapper spiste boksen.
Kortet til **«Kopier»** (etiketten som har stått der siden 028, med fullt navn i `title`) →
51 + 83 + 5 = 139 px, begge på én linje.

### Verifisering

`_kundelenkeRegressionTest` utvidet med seksjon **S** (23 påstander, 307 → 330): stubbet `_db`
måler hva hver vei faktisk skriver, at `bekreftet` ≠ `trukket`, at skrivebeskyttet ikke åpner
dialogen, og at loggtekstene skiller seg. **21 batterier grønne.**

---

| badHakk loddrett | **«ingen løsning»** — 4 soner, ingen lovlig kjede |
| badHakk vannrett | gyldig, 47,00 m, 0,00 %, dekning **88,3 %** |
| Hvorfor like lange løp? | `_geoBuildGrid` klippet hvert løp til cellens felles `[max(lo), min(hi)]` — CLAUDE.md «Equal-length runs (LOCKED)» |
| Hva den regelen faktisk kostet | **0,1 %** vannrett, 0,7 % loddrett. Ikke der dekningen forsvant. |

### Rotårsaken til «ingen løsning»

Veggstubben deler de ni venstre løpene i to celler som ligger på **nøyaktig samme
løpsposisjoner**, bare stablet oppå hverandre. En U-sving kobler to naboløp ved siden av
hverandre — ikke to biter av samme løp. `_geoHandoff` svarte «samme løpsposisjon», og hele
retningen falt. Det var ikke en geometrisk kjensgjerning, slik 071 antok; det var en manglende
korridor.

### Rettet

- **Transittløp (lag D).** Én bane reserveres i det globale rutenettet: tverrløp langs
  hindringens kant (én CC fra nærmeste sving, kantavstand til veggen) · sving rundt enden ·
  nedløp i banen. Ikke et hopp, og ingen dispensasjon fra kontrollen. Søket prøver alltid uten
  transitt først. Inntil to per utlegg.
- **Løp som følger veggene.** Like-lengde-regelen er BEGRENSET til paret som møtes i en U-sving,
  ikke hele cellen. Trinn-splitten står — uten den blir svingen en lang diagonal.
- **Rutenettet når helt ut til kanten (lag C).** `N` er heltalls-knappen og `cc = W/(N−1)`, så
  ytterste løp ligger PÅ det lovlige områdets grense i stedet for opptil en halv CC inne i det.
- **Kabelen bærer rutenettets faktiske CC.** `spacing_cm` var kallerens ØNSKE; kontrollen brukte
  det som dekningsradius og målte 10,93 der løpene lå 11,21 fra hverandre.
- **Kontroll av lagrede utlegg ved åpning.** `_geomSjekkLagredeUtlegg()` fra `_restoreProject`
  (det ene punktet alle lastinger går gjennom). Merker bare — endrer aldri geometri, markerer
  aldri prosjektet som endret, utløser aldri autolagring. Banner når noe er merket.
- **Galleriet** viser badet i tre kolonner: Kenneths tegning · fasiten bygget og kontrollert ·
  motoren.

### Resultat

| | før 072 | etter |
|---|---|---|
| Galleriet (kaskaden) | 20 ok / 8 feil | **22 ok / 6 feil** |
| badHakk loddrett | ingen løsning | **47,24 m, +0,51 %, CC 11,60, dekning 92,7 %, 1 transitt** |
| badHakk vannrett | 88,3 % | 88,5 % |
| `enHindring` v/h | ⚠ begge | **ok 94,2 % / 91,8 %**, én kabel via transitt |

### Fasiten, bygget og kontrollert

**Loddrett består** — og er numerisk identisk med det motoren legger.
**Vannrett faller på lengden alene:** formen rommer 48,83 m (+3,9 %) der produktet har 47,00.
Alt annet er rent (0 utenfor, 0 kryssinger, dekning 92,1 %). Nærmeste lovlige variant er samme
form med vendepunktene trukket symmetrisk inn — det er nøyaktig det motoren gjør, og det koster
3,6 prosentpoeng dekning.

### Dekningsmålet ≥ 93 % er ikke oppnåelig vannrett

Dekning har et aritmetisk tak: en slynge med lengde L og avstand CC dekker høyst `L × CC`. Med
47,00 m i 5,887 m² kreves CC ≥ 11,65 cm for 93 %. Vannrett kan rutenettet bare tilby 11,21 (19
løp) eller 11,87 (18 løp), og 18 løp gir 44,31 m — 5,7 % for kort. Kenneths egen vannrette fasit
lander på 92,1 %, med 3,9 % for mye kabel. Loddrett når 92,7 % mot et tak på 93,1 %.

### To funn utover oppgaven

- **Rent rektangel vannrett bytter motor.** Kant-rutenettet gjorde ny motor dominerende også der:
  CC 12,40 → 12,60, dekning 98,8 → 99,5 %, lengdeavvik −0,94 → −0,91 %, klaring og bøyeradius
  begge opp. Påstanden i regresjonstesten er endret fra «identisk utlegg som før» til «identisk
  ELLER bedre på hvert mål». **Må godkjennes før merge.**
- **CLAUDE.md må oppdateres ved merge.** «Equal-length runs (LOCKED)» stemmer ikke lenger for
  `generateCableGeo`. Endringen er gjort på Kenneths eksplisitte beslutning 2.

### Målefelle

Tegningene ble lest med **pikselprobe**, ikke anslått: kartlegg cyan romkontur → to
referansepunkter → skala 3,988 px/cm, og les rødt per rad. Det var slik det ble bekreftet at
Kenneths loddrette fasit har to CC mellom løpene over stubben (778 og 801, med bane ~790 tom) —
altså at han selv ofrer en bane til transitten. Et øyemål på det nedskalerte bildet hadde ikke
skilt 1 CC fra 2 CC.

### Verifisering

`_cableGeometryRegressionTest` utvidet 24 → **36 påstander**. **22 batterier grønne.**
Galleriet regenerert: 170 rader.

---

## 066: «Nytt prosjekt» går rett inn — dialogen velger typen — 2026-10-13

Kenneth: «ønsker å komme rett inn på prosjektet når jeg trykker Opprett prosjekt … Fjern
nedtrekksmenyen og la dialogboksen bestemme.»

### STEG 0 (målt før endring)

| | Målt | |
|---|---|---|
| Opprett | `_createProjectInline` lagret og kalte `_renderProjectList()` | Brukeren sto igjen på dashbordet |
| Type | `#dash-proj-type` → `S.project.type` | Leses ALDRI for oppførsel — kun lista-ikonet og typefilteret |
| Åpning | `_openCloudProject` → 060-låsen → `_restoreProject` → ingen deler → `showModuleScreen()` | Dialogen som faktisk lager delen |
| Dialogen | viste alle sju `MODULE_TYPES` | Kenneth vil ha fire |
| `PROJECT_TYPE_MAP` | ingen `list`-oppføring | Et Hurtig prosjektering-prosjekt sto som «Innendørs gulvvarme» |

### Rettet

- **Rett inn i prosjektet.** `_createProjectInline` går nå via `await _openCloudProject(...)` —
  samme vei som et klikk i lista, så 060-låsen tas og kundestatus hentes. Ingen snarvei rundt
  låsen. Feiler lagringen: skjemaet blir stående med «Kunne ikke opprette prosjektet — prøv
  igjen», ikke en tom dialog over et ulagret prosjekt.
- **Type-nedtrekket fjernet** (`#dash-proj-type` + `_populateProjTypeSelect`). Prosjekttypen
  eies nå av **første del**: `addPart` setter den når den mangler, senere deler endrer den ikke.
- **Dialogen gir fire valg i fast rekkefølge** — Innendørs gulvvarme · Utendørs snøsmelting ·
  Snøsmelting i trapper · Hurtig prosjektering (`MODULE_SCREEN_ORDER`). Kalkulatorene og tak
  vises ikke der. `MODULE_TYPES` sin egen rekkefølge er urørt — fem andre steder leser den.
- **«Snøsmelting i grunn» → «Utendørs snøsmelting»** alle fem stedene. Eksisterende, lagrede
  deler døpes ikke om — `part.name` kan være brukerens eget.
- **Egne dialogikoner** (`_MODSCREEN_ICON`): hus med varme inne / hus med varme ute.
  `_MOD_ICON` er urørt — sidepanelets modul-nav skal ikke ha husmotiv (sak 6b).

### Tre funn utover oppgaven

- **`_newProjectState()` satte `type:'indoor'`.** Uten å endre den til `null` ville regelen
  «addPart setter typen når den mangler» ALDRI slått til — et nytt prosjekt var allerede
  innendørs før dialogen var vist. Prompten nevner ikke funksjonen; den er forutsetningen.
- **`type:'list'` lagres nå for ekte.** `_prosjekteringBridgeHtml` («Gjør om til prosjektering»
  på en vunnet kalkyle) hadde ventet på den typen siden STEG 4, men ingen kodesti satte den —
  broen var i praksis død kode. `PROJECT_TYPE_MAP` har fått `list`, `_PL_TYPE_ICON` har fått
  `clipboard`, og begge typefiltre har fått valget.
- **Ingen flere forekomster av det gamle navnet.** PDF-forsiden leser ikke prosjekttypen i det
  hele tatt, og sidepanelets korte etikett het allerede «Ute».

### Ikonene måtte tegnes om

`home-heat-out` tegnet bølgen på y=21,5 mot en husbunn på y=20. Med strektykkelse 1,75 smeltet
de **helt sammen**: huset mistet gulvet sitt og leste som et hus på knudrete bein, ikke som
varme utenfor. Å flytte bølgen 1–2 enheter ned går ikke — viewBox-en slutter på 24 og bølgen
ville blitt klippet. Huset er derfor krympet (bunn 20 → 17,6) i **begge** ikonene med samme
tak/vegg-bane, så paret står likt i prosjektlistas Type-kolonne; `home-heat-in` sine
innvendige bølger er flyttet opp tilsvarende. Egen farge ble ikke nødvendig.

### Målefelle

**Nettleserpanelets skjermbilde er 0,625× og duger ikke til å vurdere et 32 px-ikon.** Målingen
ble gjort med en piksel-eksakt probe i stedet: SVG → `drawImage` på et 32×32-canvas → 8×
oppforstørring med `imageSmoothingEnabled = false`. Det var først der sammensmeltingen ble
synlig — på det nedskalerte skjermbildet så ikonet bare «litt rotete» ut.

### Verifisering

Ny `_nyttProsjektRegressionTest()` (25 påstander). Hele kjeden opprett → dialog kjørt for ekte
med DB-laget og 060-RPC-ene stubbet, så ingen junk-prosjekter ble laget i skyen. Feilgrenen
testet med simulert nettverksfeil. 21 suiter / 912 påstander grønne; konsollstøyen ved
innlasting er identisk med `78fc852` (verifisert ved å stashe og laste om).

Kenneth må kjøre test 1–5 live én gang for å se låsen og lagringen i ekte drift.

---

## 067: Fryserom kontrollert mot BL-001 / DEVI / Nexans — 2026-10-13

Kenneth samlet kildene; denne økten gikk gjennom 025 og 063–064f mot dem.
Spec: `docs/spec-fryserom.md`. Migrasjon: `supabase-migration-fryserom-067.sql`.

### Avvikstabell (STEG 0, før endring)

| # | Regel | I dag | |
|---|---|---|---|
| 1 | Standard **25** W/m² | `targetWm2 20`, DB global 20 | **Avvik** |
| 2 | c/c standard **40**, aldri > 50 | auto-utlegg landet på **49,9 cm**; område 30–50 OK | **Avvik** |
| 3 | 15–30 W/m² | `wm2Min 15`/`wm2Max 30`, fysisk gulv 20 → 20–30. 10T@40 = 25 slipper | OK |
| 4 | Reserve **2,5–5 cm** | `RESERVE_OFFSET_CM = 10` | **Avvik** |
| 5 | Reserve påkrevd | arves som `true`, men kan slås av **uten advarsel** | **Avvik** |
| 6 | Reserve i liste, ikke effekt | 2 stk / 1000 W begge veier | OK |
| 7 | Bare InFloor 10T godkjent | 17T i fryserom gav **40 W/m²** uten noen advarsel | **Avvik** |
| 8 | To termostater + alarm, egne kurser | ingenting for fryserom | **Mangler** |
| 9 | Montasjetekst | fantes ikke noe sted | **Mangler** |
| 10 | Varmetap P = Δt × U × 1,3 | fantes ikke | **Mangler** |
| 11 | Kilder i koden | kun «Kenneth 06.10 / 12.10» | **Avvik** |

### Rettet

- **Standard 25 W/m².** BL-001: InFloor 10T ved c/c 40 → 10 × 100/40 = 25.
- **c/c 40 følger av seg selv.** CC **lagres ikke noe sted** — den utledes av målet og
  kabellengden i `_autoFillCableImpl`. Med mål 25 lander auto-utlegget på **39,4 cm** (målt).
  Den ene kilden er altså rommets `targetWm2`; ingen egen CC-standard er innført.
- **Reserveavstand 5 cm** (`RESERVE_OFFSET_CM`), klemmen `min(…, cc/2)` beholdt. Teksten i
  avkrysningen sa «forskjøvet ½ CC» og er rettet.
- **Advarsler** (`_fryseromAvvik`, én kilde for skjerm og PDF): reserve av, annet produkt enn
  InFloor 10T, og installert effekt under 1,5 × beregnet varmetap. Ingenting blokkeres.
- **Montasje- og styringstekst** (`_fryseromMontasjeLinjer`, sju linjer) i romdetaljene og på
  PDF-ens romside.
- **Varmetapskontroll** (`_fryseromVarmetap`): P = Δt × U × 1,3, U = λ/tykkelse. DEVIs eksempel
  −25/+5 °C, 200 mm, λ 0,04 → **7,8 W/m²**. Rommet kan overstyre alle fire feltene.
  Påvirker aldri utlegget.
- **Kildene** står nå i koden (`FRYSEROM`-blokken) og i spec-en, med begrunnelse for at Nexans'
  c/c 50–70 ikke brukes.

### Verifisering

Test 1–4 kjørt mot ekte katalog: 48 m² fryserom → mål 25, InFloor 10T 1200W 120m,
**c/c 39,4 cm**, installert 25 W/m², reserve **5 cm**, «2 stk (1 + 1 reserve)», effekt 1200 W,
varmetap 7,8 ✓. c/c 55 og 25 gir advarsel, 40 ikke. 12 W/m² → 20, 35 → 30. 17T gir
produktadvarsel; reserve av gir påkrevd-advarsel. PDF-en verifisert ved å bytte ut
`jspdf.jsPDF` med en spion — hele blokken skrives, 103 tekstkall, ingen feil.

`_reserveCableRegressionTest` utvidet til **46 påstander**. Hele batteriet grønt.

### To målefeller

- **jsPDF legger `text` og `save` som EGNE EGENSKAPER på instansen**, ikke på prototypen. To
  PDF-målinger var derfor verdiløse («0 tekstkall») før jeg byttet ut selve konstruktøren.
- **`check(navn, false, betingelse, …)` feiler nettopp når koden er riktig.**
  `_kundelenkeRegressionTest` advarer mot akkurat dette; jeg gikk i den likevel.

### SPØRSMÅL — besvart samme dag (067b)

Kenneth 13.10.2026: «1. ingen av delene. 2. ikke nevn noe om termostater. 3. ikke medta.»

1. **Ekstra strenger langs yttervegger og varme ved søylefot:** appen gjør **ingen av delene** —
   verken forslag eller omtale. Uendret (var aldri bygget).
2. **Termostater:** fjernet. Montasjeteksten hadde linja «Egen termostat per kabel: hoved +5 °C,
   reserve +3 °C med alarm (lys og lyd)» — den er ute. Ingen termostater i materiallista.
3. **Varmetapskontrollen:** bygget og **fjernet igjen**. `_fryseromVarmetap`, varmetapsavviket,
   skjermblokken og PDF-linjene er borte; `FRYSEROM`-konstantene for λ/tykkelse/faktor likeså.

Montasjeteksten er dermed seks linjer: kabelavstand, kurs/vern/jordfeilvern, dybde og innstøping,
følerplassering, godkjenningen og ansvarslinja. Formelen P = Δt × U × 1,3 står igjen i
`docs/spec-fryserom.md` som referanse for den som prosjekterer — appen regner den ikke.

To nye regresjonspåstander låser begge beslutningene: at `_fryseromVarmetap` ikke finnes, og at
montasjeteksten ikke nevner termostat eller alarm.

---

## 064: Fryserom — CC 30–50 cm og 15–30 W/m², og en arvefeil i romtype-lagene — 2026-10-12

Kenneth: «cc skal ligge mellom 30 og 50 cm uavhengig kabel type. w/m skal ligge mellom
15 - 30 w/m2 uavhengig type.»

### Grensene

Romtypen eier begge områdene, uavhengig av hvilken kabel som velges:

| | Før | Nå |
|---|---|---|
| CC | 20–50 cm | **30–50 cm** |
| W/m² | min 10, tak = modulens 300 | **15–30** |

`wm2Max` er ny per romtype (`_wm2MaxFor`, speilbilde av `_wm2MinFor`) og klemmer sammen med
`_clampTargetWm2`. De fire W/m²-inputfeltene leste modulens tak (300) mens klemmen kappet på 30 —
de leser nå samme kilde, ellers viser feltet ett tall og koden gjør noe annet.

### ⚠ De to områdene møtes ikke i den nedre CC-enden

Med 10 W/m: cc 30 cm gir 33,3 W/m², altså **over** taket på 30. Det brukbare vinduet for en
10 W/m kabel er derfor:

- **W/m²: 20–30** (nedre grense fra fysikken, 063)
- **CC: 33,3–50 cm**

Cc helt ned til 30 cm krever en kabel på **9 W/m eller svakere**. Begge reglene står som oppgitt;
det er skjæringspunktet som gjelder, og klemmen håndhever det (målt: 10/15/18 → 20, 20/25/30
slipper, 33/50 → 30).

### Arvefeilen — rettet, og en korreksjon av det jeg rapporterte i 063

I 063 skrev jeg at «databasen motsier koden på tre punkter». Det var upresist. Det er **to rader**:

| | `default_mod_type` | `reserve_cable` | `target_wm2` | `cc_min_mm` | `wm2_min` |
|---|---|---|---|---|---|
| **global** | `cable` | `true` | 20 | 200 | 10 |
| **org** | `null` | `false` | 25 | `null` | `null` |

Den globale raden er riktig. Feilen lå i KODEN: lagene ble slått sammen med rå spread
(`{...global, ...org}`), så org-radens **null-er overskrev** de globale verdiene. Et fryselager
mistet dermed `default_mod_type: 'cable'` (ble 'foil' via fallbacken) og CC-området 200–500 mm —
nøyaktig det 025 ble bygget for å sikre. En null i et overstyringslag betyr **arv**, ikke «sett
til ingenting». Rettet: bare felt som faktisk har en verdi overstyrer.

Etter rettingen arver fryserom `cable` igjen. `reserve_cable: false` står fortsatt, fordi den er
en EKSPLISITT false i org-raden — den må respekteres som et valg. Se under.

### Migrasjon: `supabase-migration-fryserom-grenser.sql`

Den globale raden holder fortsatt `cc_min_mm = 200` og `wm2_min = 10`, og de vinner over kodens
hardkodede fasit. **Taket på 30 virker allerede** (ingen `wm2_max`-kolonne → fallbacken gjelder),
men CC-30 og W/m²-gulvet 15 krever at migrasjonen kjøres.

### ⚠ Krever Kenneths avgjørelse

1. **Org-raden slår AV reservekabel for fryserom** (`reserve_cable: false`). 025 ble bygget fordi
   «en kabel støpt under et fryselager kan ikke byttes». Skal den tilbake, settes feltet til null
   (= arv fra global = true). SQL-en ligger klar, utkommentert, nederst i migrasjonen.
2. **Org-raden har `target_wm2 = 25`** mot globalt 20. 25 er lovlig innenfor 15–30 — men hvilket
   tall er riktig for organisasjonen?

### Verifisering

`_reserveCableRegressionTest` **pinner nå romtypen** til kodens egen fasit i stedet for å lese den
levende ROOM_TYPES. Før målte den databasens innhold og feilet når en org satte et fullt lovlig
`target_wm2 = 25`. En regresjonstest skal måle koden, ikke hva en organisasjon har stilt inn.
To påstander kodet dessuten det gamle CC-området («CC 25 er INNENFOR 20-50») og er oppdatert.

**Hele batteriet grønt** (20 tester). `_prosjektlaasRegressionTest` består med 62 påstander når
den kjøres UTEN stubber — den kildeinspiserer hele lagringskjeden (`_scheduleAutoSave`,
`_performAutoSave`, `_saveToSupabase`), så det finnes ikke noe trygt stubbepunkt for den.
Kontrollert at ingen nye prosjekter ble opprettet (315 før og etter).

---

## 063: W/m²-gulvet for kabel utledes av W/m og maks CC — 2026-10-12

Kenneth: «10 W/m kabel forlagt med cc avstand mellom 30-50 cm gir mellom 3,33 meter og 2 meter
kabel som igjen gir 33,3 W/m2 og 20 W/m2. Da bør min tillate cc med 10W/m kabel være 20 W/m2.
Men hvis vi en gang får 8W/m kabel, så kan det fortsatt gå fint med 15 W/m2 så lenge cc ikke
overstiger 50 cm.»

### Regelen

`W/m² = W/m × 100 / CC_cm`. Gulvet er derfor **ikke en konstant**, men laveste flateeffekt noen
tilgjengelig kabel kan gi uten å overstige maks CC (`_cableWm2Floor`). Målt mot katalogen:

| Kabel | W/m | Maks CC | Laveste W/m² |
|---|---|---|---|
| InFloor 10T | 10 | 50 cm | **20,0** |
| InFloor 17T | 17 | 50 cm | 34,0 |

og 10 W/m ved cc 30 cm = 33,3 W/m² — begge Kenneths tall, eksakt.

**Politikk mot fysikk.** Romtypens `wm2Min` er en politikk («ikke undervarm et bad»); det utledede
er fysikk («ingen kabel kan gi mindre»). Fysikken kan bare **løfte** politikken, aldri senke den.
Derfor:

- **fryserom: 10 → 20.** Gamle 10 W/m² krevde cc 100 cm — dobbelt av maks, altså uoppnåelig.
- **Bad beholder 50**, matte-/folie-/uterom likeså (målt, ingen endring).

Gulvet gjelder bare rom som faktisk varmes med KABEL (`_roomUsesCable`) — en matte har sin egen
faste flateeffekt, folie regnes per bredde, og ingen av dem har en CC å regne gulvet fra.
Taket i regnestykket er den HARDE grensen (`maxHard`), ikke anbefalingen: en CC over anbefaling
er lovlig med varsel (016), så et gulv regnet på anbefalingen ville sperret lovlige utlegg.

### ⚠ Avvik fra Kenneths eget tall

Kenneth sa **15** W/m² for en framtidig 8 W/m kabel. Hans egen grense (cc ≤ 50 cm) gir
8 × 100/50 = **16,0**. 15 W/m² ville krevd cc 53 cm. Koden følger regelen, ikke tallet.

### ⚠ Databasen motsier koden for fryserom

Org-raden for `fryserom` (`_source: 'org'`) overstyrer tre felt stikk i strid med det 025 bygget:

| Felt | Kodens fasit (025) | DB-raden |
|---|---|---|
| `defaultModType` | `cable` | **`foil`** |
| `reserveCable` | `true` | **`false`** |
| `targetWm2` | 20 | 25 |

Et fryselager får altså FOLIE som standard og **ingen reservekabel** — nettopp det 025 ble bygget
for å hindre («en kabel støpt under et fryselager kan ikke byttes»). Ser ut som en backfill som
har skrevet standardverdier over de tiltenkte. **Ikke rørt** — det er data, ikke kode, og
Kenneths avgjørelse. `_reserveCableRegressionTest` sin «20 W/m² er standard» feiler av denne
grunnen, og står rød med vilje framfor å sementere data som ser feil ut.

### Verifisering

`_reserveCableRegressionTest` utvidet (31 påstander): det utledede gulvet, at 15 løftes til 20,
at 33 slipper gjennom, at Bad beholder 50. Testens syntetiske kabel hadde `category_id: 9000` —
en kategori som ikke finnes, så de modul-scopede hjelperne aldri så den og `_cableWm2Floor` ga
null. Nå peker den på en ekte kabelkategori. Resten av batteriet uendret.

---

## 059b: resultatboks + tastaturflyt i listevisningen — 2026-10-12

Kenneth: «på listevisning ønsker jeg mer likt "liste" hurtigprosjektering, hvor man har en
resultatboks som viser totalt areal, effekt, cc og flate effekt på både matter og kabler …
la oss si det er 27 m². Hvis jeg da velger 2 stk matter à 12 m², bør det stå tydelig at mattene
dekker 24 m², og hvor mange prosent det er av totalen. tab, pil og enter prinsippene.»

**Status: ferdig, committet lokalt — IKKE pushet** (Kenneth jobbet i repoet fra en annen økt da
dette ble skrevet). Bygget oppå 062; 060/061/062 landet derfra mens 059 lå ute.

### Resultatboks

Samme boks og samme visuelle språk som utkast-kortet i Hurtig prosjektering (`resItem`), over
tabellen, for den VALGTE raden. Alle tallene fantes allerede i `_computeRoomStats` — boksen viser
dem, den regner ingenting nytt. Målt på Kenneths eksempel:

| | |
|---|---|
| Areal (netto) | 27,00 m² |
| **Dekket** | **24 m² · 89 %** |
| Udekket | 3 m² |
| Ønsket effekt | 8100 W |
| Installert | 7200 W |
| W/m² brutto | 267 W/m² |
| W/m² flate | 300 W/m² |
| Størrelse | 2 × 12 m² |
| Bestilles | 2 stk |

Kabelrader viser CC i stedet for Størrelse, og «Dekket 100 %» med tooltip om at en «kun label»-
kabel ANTAS å dekke hele nettoarealet (modellantakelse, ikke en måling). Topplinja fikk
«· dekket 56,0 m² (95 %)» for hele delen. Egne id-er (`lb-*`), ikke radenes (`li-*-<rom>`).

### Tastatur

- **Pil opp/ned** stepper Type/Klasse/Produkt/antall (virket fra før).
- **Enter** flytter til neste felt, og fra siste felt i en rad til FØRSTE felt i neste rad — som
  i et regneark. Wrapper rundt fra siste til første.
- **Tab** faller gjennom til nettleserens egen flyt (ingen «Legg til rom»-knapp å vikle seg i).
- Boksen følger raden man er i, både ved pil, Tab (`onfocus`) og museklikk. Radmarkeringen følger
  boksen, så de to aldri peker på hvert sitt rom.

### Tre feil rettet

1. **Enter opprettet et listerom inne i snødelen.** `_listKey` falt ned i `_listFinalizeDraft()`
   fordi en tegnet del verken har utkast-kort eller «Legg til rom»-knapp. Målt: toast «Skriv inn
   brutto areal først» og et `listMode`-utkastrom midt i en snødel. Innført i 059.
2. **«Bestilles» sto som «—» for hvert eneste matte-rom.** `_listCountStr` leste bare `S.cables`.
   Gjaldt også utkast-kortet i Hurtig prosjektering.
3. **«(ingen produkter)» for et rom som beviselig hadde produkt.** `_listClassOptionsHtml` utledet
   familien (produktets egen, ellers standard), mens `_listProductOptionsHtml` leste
   `room.listFamily` rått. Et rom som fikk «kun label» fra LERRETET (der `listFamily` aldri settes)
   og så ble åpnet i lista, viste klasse i det ene nedtrekket og tomt i det andre. Ny delt
   `_listRowFamily` — én kilde for begge.

### Verifisering

`_listevisningRegressionTest` utvidet fra 24 til **54 påstander** (dekning 24/27 = 89 %,
udekket 3 m², matte-telling, familie-utledning uten `listFamily`, Enter oppretter aldri listerom).
Tastaturflyten målt ved å instrumentere `focus()` — fokus er ikke observerbar i en skjult rute
(`document.hasFocus()` er false), så `document.activeElement` duger ikke som målepunkt.

### ⚠ To feil som IKKE er mine — de lå på ren 062

Kontrollert ved å stashe endringene og kjøre batteriet på ren 062: **nøyaktig samme to feil**.

1. **`_reserveCableRegressionTest`: «20 W/m² er standard» — forventet 20, fikk 25.**
   `_roomTypeDefaults('fryserom').targetWm2` er 25 i databasen. Enten er DB-verdien endret eller
   testen er skrevet mot en annen verdi. Data mot test, ikke kode.
2. **`_prosjektlaasRegressionTest`** feiler bare fordi en teststubb erstatter funksjonen den
   kildeinspiserer. **Stubb `_performAutoSave`, ikke `_scheduleAutoSave`** — 060-testen leser
   begges `.toString()`. (`_scheduleAutoSave` → `_performAutoSave` → `_ensureDraftProject` er
   forresten veien som lager «Prosjekt – <dato>»-utkast i skyen under syntetisk testing.)

### Testfelle

**Test-rom-id-er kolliderer.** 90106 var 061-seksjonens eget «Område 6 (mix)»; jeg gjenbrukte den.
To rom med samme id → `S.rooms.find` traff mitt, mens 061 holdt på sitt, og `M.listMix` ble
stående undefined. Ny seksjon = ny id-serie (059b bruker 9012x).

---

## 062: «Prosjektert av» — ingen felt ved opprettelse, lesbar linje med «Endre» — 2026-10-12

Kenneth: «Vi trenger ikke utfylling av «Prosjektert av» nå som den henter infoen fra innlogget
bruker?» Avklart: feltet bort fra opprettelsen, endres i prosjektinfo, og initialene i
PDF-filnavnet skal følge **den som prosjekterte** — 051s åpne spørsmål er dermed besvart: ja.

**Status: kodeferdig, UPUSHET. Én migrasjon gjenstår:**
`supabase-migration-org-member-names.sql` (ny RPC). Appen er fail-open uten den.

### STEG 0 — målt, ikke antatt

- **0.1 RLS på `profiles`: en vanlig org-bruker ser i dag KUN sin egen profil.**
  Basis er `supabase-migration-auth.sql:118-125` — `"Bruker ser egen profil" for select using
  (auth.uid() = id)` + `"Superadmin full tilgang profiler" for all using (is_superadmin())`.
  Det finnes altså ingen vanlig-bruker-vei til kollegers `full_name`/`initials`.
  **Funn:** `supabase-migration-org-member-visibility.sql` legger til en bredere policy
  («Medlem ser profiler i egne orgs», ALLE kolonner for medlemmer i egne orgs) via
  `user_org_ids()`. Om den er kjørt i produksjon kan ikke leses av repoet. Den gir dessuten
  mer enn 062 trenger. Derfor bygges RPC-en uansett — den er kolonne-låst og virker enten
  den migrasjonen er kjørt eller ikke.
  **Sidefunn:** `organization_members` har kolonnene `(org_id, user_id, role)` — det finnes
  INGEN `status`-kolonne. Promptens «bare `status = 'active'`» er ikke byggbar; i dette skjemaet
  ER en medlemsrad aktivt medlemskap (fjerning er en `DELETE`, se `_removeOrgMember`).
  Filteret er utelatt med vilje, dokumentert i migrasjonen.
- **0.2 Redigering til en kollega nullet `responsible_user_id` — bekreftet.**
  `_wfKundeSave` hadde `if (S.project.responsible !== _myDisplayName()) responsible_user_id =
  null`, og `_plResponsibleInitials` regnet da initialene av teksten («Fredrik Hansen» → FH,
  selv om profilen hans sier FHA). **Verre enn beskrevet:** regelen slo til selv når ingenting
  ble endret — bare å åpne og lagre Kunde-modalen på en kollegas prosjekt slettet id-en.
  **Sidefunn:** `responsible_user_id` lever KUN i prosjekt-JSON (ingen DB-kolonne, `_saveToSupabase`
  skriver `project: S.project` i sin helhet), og `_fetchProjects` bar den **aldri** fram til
  prosjektlista — uten den kunne ikke lista slå opp noen profil-initialer i det hele tatt.
- **0.3 Alle lesesteder for `S.project.responsible` — ingen endrer oppførsel:**
  `_renderSbProjInfo` (sidepanelets «Prosjektert av …»), PDF-dialogens gule «tomt»-linje,
  PDF-forsidens «Prosjektopplysninger»-rad, `_profileInitialsForFile` (filnavn på PDF **og**
  Visma-fil), `_fetchProjects` → `_responsible` → prosjektlistas kolonne + fritekstsøket, og
  `_restoreProject` som **kun** defaulter til `''`. 051-regelen holder: ingen autofyll ved
  åpning (dekket av en `checkIkke` i regresjonstesten).

### Endringer

1. **Ny RPC `org_member_names()`** (`supabase-migration-org-member-names.sql`, idempotent,
   ren ASCII). `security definer`, returnerer `(user_id, full_name, initials)` — bare de tre
   kolonnene, bare for medlemmer i samme org som `auth.uid()`. `grant execute` til
   `authenticated`, `revoke` fra `public`/`anon`.
2. **Klient-cache per økt** — `_orgMemberNamesCache` / `_loadOrgMemberNames()` /
   `_orgMemberList()`. Hentes JIT (første «Endre», eller første filnavn/listerad som trenger
   en kollegas initialer), og samtidige kall deler ett nettverkskall. **Fail-open som 060s
   prosjektlås:** mangler RPC-en, settes cachen til en tom `Map` og alt oppfører seg nøyaktig
   som før 062. Lander cachen mens prosjektlista står åpen, tegnes lista på nytt — raden
   retter seg selv.
3. **Kunde & prosjektinfo: lesbar linje.** «Prosjektert av: **Navn** · Endre» (tomt →
   «— · Sett meg · Endre»). «Endre» åpner et nedtrekk med org-medlemmene (innlogget bruker
   først, så alfabetisk) + «Annen (fritekst) …». `#wf-k-resp` lever videre som **skjult
   verdibærer** med `dataset.uid` — `_wfKundeSave` leser samme felt som før, ingen ny
   lagringsvei. Valg fra nedtrekket setter `responsible_user_id`; fritekst nuller den.
   `dataset.uid` forhåndssettes fra prosjektet, så 0.2-nullingen er borte.
4. **Initialer følger den som prosjekterte.** `_plResponsibleInitials` slår opp
   `responsible_user_id` i cachen → kollegaens egne `profiles.initials` (fallback: utledet av
   hans fulle navn fra RPC-en, ikke av fritekst-navnet). Er det mitt eget prosjekt, vinner
   mine initialer fra Innstillinger (ferskest). Cache-miss blokkerer aldri — dagens tekstregel
   brukes og hentingen starter i bakgrunnen. `_fetchProjects` bærer nå `_responsibleUserId`,
   og `_profileInitialsForFile` sender den med.
5. **Rydding.** `#dash-proj-responsible` + label fjernet fra «Nytt prosjekt»;
   `_toggleCreateProject` forhåndsfyller ikke lenger; `_createProjectInline` setter stille
   `_myDisplayName()` + `_currentUser.id` (samme ene vei som `_quickStartModule`).
   `_setMeAsResponsible` plukker ikke lenger knappen ut av DOM-en via `parentElement` —
   linja avgjør selv at «Sett meg» skal bort.

### Målt etter endringen (ekte kodesti i nettleseren, ikke syntetisk state)

| | Resultat |
|---|---|
| `_prefsRegressionTest` | **43/43 BESTÅTT** (G oppdatert + 10 nye 062-sjekker) |
| Opprettelse (`_createProjectInline`, lagring stubbet) | `responsible` = «Kenneth Skretteberg», `responsible_user_id` = `u-kenneth` |
| Hurtig prosjektering | identisk |
| Nedtrekk etter «Endre» | `Kenneth Skretteberg`, `Fredrik Hansen`, `Annen (fritekst) …` — meg først |
| Velg Fredrik → Lagre | `responsible_user_id` = `u-fredrik`, **filnavn-initialer «FHA»** (ikke «FH») mens Kenneth er innlogget |
| «Annen» → «Kari Nordmann» | `responsible_user_id` = `null`, filnavn «KN» |
| Tomt prosjekt | «Prosjektert av: — · Sett meg · Endre»; «Sett meg» → navn + min id |
| RPC mangler (fail-open) | cache-størrelse 0, filnavn «FH» — nøyaktig som før 062 |

### Etterpå — migrasjonen kjørt og verifisert mot ekte Supabase (12.10.2026)

Innlogget som `ksk@cenika.no`: `org_member_names()` gir nøyaktig `user_id, full_name, initials`
og 2 rader (Fredrik + Kenneth i Cenika) — ingen e-post, ingen roller, ingen andre orgs.
`_loadOrgMemberNames()` fyller cachen via den ekte veien.

**Men begge profilene har `initials = null` i databasen**, så kollega-oppslaget faller tilbake
på `_initialsOf(full_name)` til noen fyller inn feltet «Initialer» i Innstillinger. Koden er
riktig; dataene mangler.

**Pre-eksisterende feil funnet i samme sveip (rettet):** `_initialsOf('Kenneth Skretteberg
(test)')` ga **«KS(»** — parentes-tillegget ble et tegn i initialene, i prosjektlista og i
PDF-/Visma-filnavn. `_userInitials` har alltid strippet parenteser; `_initialsOf` gjorde det
ikke, så de to ga ulikt svar på samme navn. Nå strippes parentesen begge steder. Består navnet
KUN av en parentes, fjernes selve tegnene i stedet («(test)» → «T») — første forsøk returnerte
råteksten og ga «(», altså nøyaktig feilen som skulle rettes; fanget av en egen sjekk.

Regresjon etter rettelsen: **47/47 bestått** (fire nye `_initialsOf`-sjekker, inkludert at
`_initialsOf` og `_userInitials` er enige om samme navn).

### Gjenstår

- Ingenting. Migrasjonen er kjørt og RPC-en er verifisert mot ekte data.

---

## 061: Hurtig prosjektering — «Ulike kabler» på ett rom — 2026-10-12

Kenneth: «Kan vi få en knapp for å velge ulike kabler på et rom? Trykk «Ulike kabler», så kommer
det opp to linjer hvor man kan velge valgfrie kabler, og en pluss for å legge til en linje til
hvis man skal ha enda flere. Må fortsatt se samme resultater: total effekt, flateeffekt, CC.»

**Status: kodeferdig, UPUSHET.** Ingen migrasjon, ingen deploy — `room.listMix` er bare et felt
på rommet og følger prosjekt-blobben. Spec: `docs/spec-utendors-produkter-hurtig-prosjektering.md`
(ny seksjon «061 · «Ulike kabler» på ett rom»).

### STEG 0 — målt, ikke antatt

Syntetisk rom «Stue» 45 m² brutto / 1 m² hindring / 80 W/m², InFloor 10T 230 V (ekte katalog),
1 × 1800 W + 1 × 1200 W pushet manuelt med lik `spacing_cm`.

- **0.1 Resultatboksen summerer riktig uten en eneste endring.** `_computeRoomStats` ga
  `cableLenM` 300 m (sum), `cableW` 3000 W (sum), `cableWm2` 68, `heatedM2` 44 (= netto, «kun
  label»-antakelsen); `_roomRatedEffectW` 3000 W; W/m² brutto 67, flate 68, dekning 100 %.
  **MEN `cableCcCm` tar den FØRSTE kabelens `spacing_cm` og ignorerer resten stille** — satte
  jeg kabel 2 til 99 cm, sto CC-feltet fortsatt på 14,7 mens den lengdevektede flateeffekten
  falt fra 68 til 45 W/m². Felles CC på alle kablene er derfor betingelsen for at tallene er
  sanne, ikke en finesse. `_listRoomProductId` returnerte 56 — bare det første produktet.
- **0.2 `_syncReserveCables` lager én reserve PER KABEL, ikke per produkt.** Målt: fire kabler
  (56, 50, 56-reserve→1, 50-reserve→2), «4 stk (2 + 2 reserve)», effekt uendret 3000 W.
  `_roomProductBreakdown` gir egne «Reservekabel»-rader per produkt. Riktig som den står.
- **0.3 Materialliste og Romoversikt ga allerede to linjer.** `_collectMaterialItems` går per
  kabel og `_aggregateMaterialItems` grupperer per produkt-id → CVA10087 ×1 + CVA10081 ×1, samme
  i Visma-pasten; `_roomProductBreakdown` → 1800 W + 1200 W. **Ingen endring nødvendig noe sted.**
  Det eneste som kollapset til første produkt var `_listFinalizedRowHtml` og «Bestilles».
- **0.4 Produktlista kan gjenbrukes rad for rad.** `_listFamilyProducts('cable','InFloor 10T|230',
  'indoor')` = 19 varianter. `_generateMixedCombos` ga 20 kombinasjoner, første ULIKE =
  1700 + 1800 = 3500 W (behov 3520), CC 12,6 cm. `_autoFillMixedCables` **tåler tre kabler**
  (180 + 120 + 60 m i 45 m² → tre kabler, felles CC 12,5 cm) og avviser ulik familie av seg selv.

### Gjort

1. **Modell.** `room.listMix = [{productId, count}, …]`; `_listSetRoomProductMix` (felles CC =
   netto/Σlengde, klemt til strengeste `minSp`…`maxHard` over produktene), `_listMixRows`,
   `_listMixCcCm`, `_listMixSumW`, `_listMixCableIds`, `_listPlacedProducts`, `_listMixProdText`.
   `_listSetRoomProduct` nullstiller `listMix` — ett sted. Gaten i `_listAutoSuggest` ligger på
   plasserings-laget, så areal/hindring/W-m² bare regner CC på nytt uten å røre radene.
2. **Kortet.** «Ulike kabler»-knapp ved Antall (kun Kabel) → radliste med produktvelger, ▲▼,
   antall, ✕, «+ Legg til kabel», «Foreslå», «Like kabler i stedet». Resultatboksen urørt.
3. **Raden og eksportene.** `_listFinalizedRowHtml` viser «InFloor 10T 1800 W + 1200 W + 600 W»
   med tooltip; `_listCountStr` lister per produkt. Materialliste/Romoversikt/Visma uendret
   (0.3). 059s tegnede rader får samme radliste i kompakt form; «Tegn utlegg» kaller
   `_placeMixedCables` med IDene utvidet med antall.
4. **Regresjon.** `_listevisningRegressionTest()` utvidet fra 30 til 45 sjekker (§ 5).

### Funn underveis

- **Nedtrekket fulgte ikke modellen.** `_listMixSetRow` oppdaterte bare state, så et kall fra
  modellsiden («Foreslå», test) lot rad 2 stå på «— velg kabel —» mens resultatboksen under sa
  «3000 W / 14,7 cm / 1 × 1800 W, 1 × 1200 W». Samme feilklasse som statiske DOM-elementer mot
  en ombygd container. Fikset (`select.value` settes eksplisitt) og låst med en DOM-sjekk i
  regresjonstesten — ikke bare state.
- **`pushUndo` kopierer rommene flatt**, så `listMix`-arrayet deles med angre-steget. Hver
  mutasjon bygger derfor et nytt array; låst av egen sjekk.
- To kosmetiske retter etter skjermbilde: «Foreslå»/«Like kabler i stedet» sto i `--dim` på
  11 px og forsvant nesten i den kompakte raden (nå `--text`), og klasse-velgeren var midtstilt
  mot en radstabel som vokser (nå toppstilt).

### Målt resultat (ekte katalog, ekte handlere, ekte DOM)

| Test | Fasit | Målt |
|---|---|---|
| 1 Stue 45 m²: 1800 + 1200 | 3000 W · 68 W/m² flate · CC 14,7 · «2 stk (1 × 1800 W, 1 × 1200 W)» | ✓ alle fire |
| 1b + 600 W | 3600 W · CC 12,2 | ✓ |
| 2 «Foreslå» | to rader innen ±12 % av 3520 W | 1700 + 1800 = 3500 W, CC 12,6 ✓ |
| 3 ✕ ned til én rad | like kabler, Antall = 1 | ✓ |
| 4 Ferdig rad + areal 45 → 60 | «1800 W + 1200 W + 600 W», CC regnes på nytt | 3600 W, CC 16,4, produktene står ✓ |
| 5 Materialliste / Romoversikt / fryserom | tre linjer, reserve per kabel | 3 + 3 linjer; «6 stk (… + 3 reserve)», effekt fortsatt 3600 W ✓ |
| 6 059 «Tegn utlegg» + Ctrl+Z | tre kabler, felles CC, ett angre-steg | 3 kabler, CC 12,5/12,5/12,5, 1 angre-steg, Ctrl+Z → «Kun label» ✓ |
| 7 Regresjon | utvidet | 45/45 ✓ |

Naboene står: `_foilRegressionTest` 9/9, `_matRegressionTest` 2/2, `_matZoneRegressionTest` 4/4,
`_cableSkewRegressionTest` 16/16.

### Åpent

- Blanding **på tvers av klasser** (10T + 17T) er bevisst ikke bygget — ulik W/m gir ulik
  flateeffekt i hver sone under felles CC. `_autoFillMixedCables` avviser det allerede selv.
- `_placeCableLabelOnly` i hovedmodulen fikk ikke blandet modus (den har «Komponer ulike kabler
  selv…» fra før). Bekreftet at et rom som fikk blandede label-kabler fra lista vises riktig i
  hovedmodulens romstatistikk: 3000 W, CC 15,0, flate 67 W/m², breakdown per produkt, og
  sidepanel + lerret rendrer uten feil.

---

## 060: Prosjektlås — én redigerende bruker om gangen — 2026-10-12

Kenneth: «Siden Fredrik nå skal begynne å jobbe i Varmeplan, kan det fort være at vi går
inn på samme prosjekt samtidig. Kan vi få en sikkerhet på dette?»

**Status: kodeferdig, UPUSHET. ⚠ `supabase-migration-prosjektlaas.sql` MÅ kjøres i Supabase
før deploy.** Spec: `docs/spec-prosjektlaas.md`.

### STEG 0 — målt, ikke antatt

- **0.1 Tapet er reelt og tyst.** To vinduer mot den EKTE databasen, prosjekt «R-test»:
  vindu A satte `rooms[0].name = 'A-ENDRET-AV-VINDU-A'` og lagret → databasen hadde
  `['A-ENDRET-AV-VINDU-A', 'Område 2']`. Vindu B (blob bygget FØR A lagret) satte
  `rooms[1].name` og lagret → databasen hadde `['Område 1', 'B-ENDRET-AV-VINDU-B']`.
  **A sin endring var borte.** Ingen feilmelding i noen av vinduene, og begge
  lagre-indikatorene sto på grønt «Lagret». Prosjektet er gjenopprettet etterpå.
- **0.2 `_fetchProjectList` er en fallback-stige** av tolv kolonnesett. Tåler to (fire)
  kolonner til — men BARE i de øverste rungene, samme mønster som `project_no` fikk i
  DEL B. Står de i alle tolv, blir lista tom for et skjema uten migrasjonen.
- **0.3 `_currentProfile.full_name` er tilgjengelig i tide.** Den settes i
  `_authCheckProfileAndProceed` (linje ~63105), som kaller `_initAfterAuth`, som kaller
  `_kundeOpenFromMail` helt til slutt. Målt verdi i dev-økta: «Kenneth Skretteberg (test)».
- **0.4 Det fantes INGEN `visibilitychange`-håndterer i fila** før 060, og `readOnly`
  fantes bare som DOM-egenskap på input-felter — ikke som app-begrep.

### Fem målte funn underveis

1. **Promptens `pushUndo`-plan holder ikke alene.** Alle 230 kallsteder kaller
   `pushUndo()` som en bar setning og ser aldri på returverdien — et `return false`
   stopper ikke mutasjonen på neste linje. Gaten er beholdt som bakstopp (den toaster og
   holder angre-stabelen ren), men garantien ligger i gaten mot skyen, triggeren,
   lerret-/tastatur-gaten og `body.readonly`.
2. **`#sb-hdr` fantes ikke.** Elementet har `sb-hdr` som KLASSE, ikke id. «Nytt område»
   sto fullt klikkbar i skrivebeskyttet modus. En ren kildesjekk ville ikke funnet det —
   CSS-en var «der», den pekte bare på ingenting. Målt i nettleseren: antall fortsatt
   klikkbare mutasjonsknapper gikk fra **64 → 0** etter at dette og fire JS-gater kom på.
3. **`project_lock_is_stale` må være `stable`, ikke `immutable`** (som prompten sa).
   Funksjonen leser `now()`; en immutable funksjon kan foldes ved planlegging.
4. **`acquire` trenger `for update`.** Uten radlåsen kunne to samtidige forsøk begge lest
   «fri» og begge skrevet seg inn som eier.
5. **RLS kan slippe SELECT men nekte UPDATE** (f.eks. `org_id is null` og `user_id` = en
   kollega). Da traff `acquire` sin UPDATE null rader og ville svart `ok=true` på en lås
   den aldri fikk. Lagt til en `row_count`-sjekk → `no_write` → skrivebeskyttet.

### Nytt

- **Migrasjon** `supabase-migration-prosjektlaas.sql` (ren ASCII, idempotent): fem
  kolonner, fire funksjoner, og triggeren `before update of data` som reiser
  `PROJECT_LOCKED`. INSERT og andre kolonner røres ikke — feltappen oppretter fortsatt
  prosjekter, og statusendringer slipper gjennom.
- **`_lockSession`** — tilfeldig uuid per SIDELASTING (regel 6), ikke per bruker.
- **Seksjonen «060 · PROSJEKTLÅS»** i `index.html`: `_lockAcquire`,
  `_lockHeartbeatStart/Stop/Tick`, `_lockRelease`, `_lockReleaseKeepalive`, `_lockLost`,
  `_lockRetryNow`, `_lockBusyModal`, `_lockEnterProject`, bannerets tekstfunksjoner.
- **`S.ui.readOnly`** med gater i `_scheduleAutoSave`, `_performAutoSave`,
  `_saveToSupabase` (kaster), `_createVersionSnapshot`, `saveProject`, `_restoreVersion`,
  `_duplicateProject`, `_wfKundeSave`, `_spiPickCustomer`, `_addBgToFloor`, `pushUndo`.
- **Lerret-gaten** i `canvas mousedown` — ren panorering, samme form som den eksisterende
  `S.ui.present`-grenen rett under (den var fasiten å kopiere).
- **Tastatur-HVITELISTE**: `Escape ? + - = 0` og Ctrl/Cmd. Piltastene er med vilje
  utelatt — de flytter valgt objekt.
- **Banner + modal + `body.readonly`-CSS**, og «Skrivebeskyttet» på lagre-indikatoren.
- **🔒-brikke i prosjektlista** (grå; sovende lås gir intet merke; egen lås sier «Deg
  (annet vindu)»).
- **`_prosjektlaasRegressionTest()`** — 62 sjekker. Verifisert at den har tenner: fire
  bevisste regresjoner (fjernet autosave-gate, fjernet pushUndo-gate, lot indikatoren
  lyve «Lagret», lot sovende lås gi merke) ga 7 røde sjekker; alle grønne etter at de ble
  tatt ut igjen.

### Valget i §4: hjerteslag via triggeren

Prompten åpnet for to løsninger. **Valgt: triggeren setter `lock_seen_at = now()` når
`locked_by = auth.uid()`.** Den fyrer uansett på hver `data`-skriving, og den som lagrer
er aktiv per definisjon. Alternativet (et eget `project_lock_heartbeat`-kall etter hver
vellykkede autosave) ville doblet antall nettverkskall uten å gi noe ekstra.

### Hva som IKKE er testet

Serversiden. Migrasjonen er ikke kjørt — å legge en trigger som kan AVVISE skrivinger på
en produksjonsbase med 303 prosjekter er Kenneths avgjørelse, ikke min. Det betyr at
`PROJECT_LOCKED`, `p_force`-vakten, `for update`-serialiseringen og selve SQL-syntaksen er
HÅNDGJENNOMGÅTT, ikke kjørt — det fantes ingen lokal Postgres-server på maskinen (kun
libpq-klientverktøy, ingen `postgres`-binær, ingen Docker). Testpunkt 1–7 i prompten
krever to ekte brukere og en kjørt migrasjon.

Det som ER testet mot den ekte appen: STEG 0.1-tapet, fail-open uten migrasjonen (prosjekt
åpnes og lagres nøyaktig som før), alle tre modalvariantene, banneret, de fire gatene
(ingen rom lagt til, intet navn endret, angre-stabelen urørt, `drawMode` null etter «r»),
at normal redigering er helt uendret når `readOnly` er av, at `_restoreProject` ikke
nullstiller `readOnly`, 🔒-brikka i lista, og at `_kundeforslagRegressionTest` og
`_geoRegressionTest` fortsatt består.

---

## 059: «Lerret | Liste» i snø- og innendørsdelen — 2026-10-12

Tegnede deler (inne/ute) kan nå vises som SAMME tabell som Hurtig prosjektering, med
«kun label»-produkter per rom. Kenneth: «Jeg har tegnet opp 15 utendørs områder for
snøsmelting på en LARK-tegning. Ofte er vi i tilbudsfase og vil ikke bruke tid på å
detaljprosjektere.»

**Status: ferdig, pushet (`2dae80b`).** Spec: `docs/spec-utendors-produkter-hurtig-prosjektering.md`.

### STEG 0 — målt, ikke antatt

- **0.1** `_listRooms()` ga `[]` for 15 tegnede snøområder (filteret krever `listMode`).
  Men `_listSetRoomProduct` virker fullt ut på et TEGNET rom: `(rom, 'cable', 136, 2)` på
  Område 2 (brutto 12,42 m², hindring 1,80 → **netto 10,62 m²**) ga to `labelOnly`-kabler,
  **CC 50,0 cm, 600 W**, dekning 86 %, flate 60 W/m². `_listAutoSuggest` valgte
  `InSnow 30T|230` → InSnow 30T 3210W 106.9m, CC 9,9 cm, **303 W/m² mot 300 ønsket**.
  → Ingen ny areal-, produkt- eller statistikk-logikk trengs. Kun tabellens KILDE manglet.
- **0.2** Ingenting *inne i* `_listFinalizedRowHtml` forutsetter `listMode` — den rendrer
  feilfritt for et polygon-rom (målt). Det listMode-bundne er radens **klikkmål**
  (`_listEditRoom` → utkast-kortet, der Brutto areal/Hindringer skriver rett til
  `room.area`/`listHindCm2` og ville overskrevet polygonets eget areal), `Etasje`/«+ Bygg»
  (`_listMoveRoomToFloor` flytter rom og rydder etasjer) og slette-knappen.
- **0.3** `_pdfCoverMetaRows` er ETT sted, delt av `exportPDF` og `_expPreviewSection('cover')`.
  Romoversikten hadde **ingen** `labelOnly`-markering (`_roomProductBreakdown` har ikke feltet).
- **0.4** Begge motorveiene kjører UTEN åpent produktpanel — `_refreshCablePanel` og
  `_upcRefreshResults` er rene no-ops uten DOM. `_cablePreviewPlace(150, 1, …)` ga 40 strenger
  / 98,1 m i Område 1.

### Nytt

- **Bryter «Lerret | Liste»** i topplinja (`#tb-partview`, `_setPartView`) for `indoor`/`snow`.
  Tilstand i `S.ui.partView[partId]`, lagret med prosjektet (`_buildSaveData` → `ui.partView`,
  lest i loaderen). Trapp og listedelen urørt.
- **Kilde etter deltype** (`_listTableRooms` / `_listDrawnPartRooms`). Listedelen er bit-for-bit
  uendret; en tegnet del gir alle sine rom, etasje for etasje.
- **Egen rad for tegnede rom** (`_listDrawnRowHtml`): netto lesbart med tooltip «Fra tegningen —
  brutto X, hindringer Y», Varmetype låst, Type/Klasse/Produkt/antall som i dag (gjenbruker
  `_listOnType`/`_listOnClass`/`_listStepProduct`/`_listStepCount`).
- **Status-kolonne** (`_listRoomDrawnState`): `Tegnet` (LÅST, «Endre på lerretet») /
  `Kun label` («Tegn utlegg») / `—`. Lista erstatter aldri et tegnet utlegg.
- **«Tegn utlegg»** (`_listDrawLayout`) og **«Grovprosjekter alle»** (`_listGrovprosjekterAlle`).
- **Arv av familie + type** fra nærmeste rad over med produkt (`_listPrevRowFamily`), med
  `room.listFamilyBy = 'auto'|'user'` og kaskade til senere auto-rader (`_listCascadeFamily`).
  Gjelder også listedelen.
- **Kalkyle-merke** fra ÉN kilde (`_roomIsKalkyle` / `_projectKalkyleStatus`): PDF-forside
  («Status: Kalkyle — ikke detaljprosjektert» / «Delvis detaljprosjektert (9 av 15 rom tegnet)»),
  grå underlinje + fotnote i Romoversikten, ingen romdetaljside for rene kalkyle-rom, «K» i
  sidepanelets romliste.
- **`_listevisningRegressionTest()`** — 24 påstander: kilde per deltype, låsing av tegnede rom,
  arveregel (auto mot user, inkl. kaskade), Kalkyle-merkets betingelse.

### Fem feil funnet ved MÅLING, ikke ved lesing

1. **Snø-matta pushet TO angre-steg.** `_packSnowMats` → `autoFillMatSerpentine` pusher igjen
   ETTER at `_beginProductSwapSession` alt har ryddet label-mattene, så ett Ctrl+Z landet på et
   TOMT rom i stedet for på kalkylen. `_listDrawLayout` pusher nå én gang og undertrykker
   motorens egne (`_undoSuppress`, samme mønster som `_drawCreateRoomsFromReview`).
2. **Utkast-rommet står ikke i tabellen**, så et nytt listerom arvet aldri forrige rads familie
   (test 7: rom 1 = InSnow 300T 400 V matte → rom 2 fikk InSnow 30T 230 V kabel). `i<0` tolkes
   nå som «raden er den nye siste».
3. **Type-nedtrekket fulgte ikke modellen** når arveregelen endret `listModType` — kortet sa
   «Kabel» mens rommet hadde matter. `_listUpdateRowSelects` synkroniserer nå `li-type-*`.
4. **Overlayet hardkodet mørk bakgrunn** → hele tabellen usynlig i LYST tema (målt tekstfarge
   `rgb(18,21,28)` på nesten svart; cellene arver tekstfarge fra body og har aldri hatt egen).
   Nå `color-mix(in srgb, var(--bg) 92%, transparent)`.
5. **Status-kolonnen lå 266 px utenfor synsfeltet** (tabell 1366 px, rute 1046 px) — «Tegn
   utlegg» var usynlig. Nå `position:sticky;right:0`, og Varmetype-kolonnen vises bare når delen
   faktisk har begge slag (samme regel som Bygg-kolonnen), som frigjorde 78 px ren støy.

### Verifisering

`http://localhost:4000/?dev` (appens egen auto-innlogging), `await _loadProducts()`, ekte
produktkatalog (321 produkter), ekte DOM-hendelser (`.click()` / `dispatchEvent('change')`).
Alle åtte testene i prompten kjørt. **19 regresjonsbatterier grønne.** Begge temaer verifisert
visuelt. Ingen horisontal scroll på `body`; tabellen scroller i sin egen rute (132 px).

### ⚠ ÅPNE SPØRSMÅL / IKKE RØRT

1. **«Forrige rad» = nærmeste rad over med produkt, ikke rad 1.** Setter Kenneth rad 5 manuelt
   til kabel, arver rad 6–15 fra RAD 5, ikke fra rad 1. Prompten sier både «nærmeste rom over»
   (§3 arveregel) og «rad 2…15 følger rad 1» (§3 kaskade) — de divergerer når en manuell rad
   ligger i midten. Valgt tolkning: nærmeste over. Test 2 krever bare at rad 5 selv står fast,
   og det gjør den. **Bør bekreftes av Kenneth.**
2. **Et rent Hurtig prosjektering-prosjekt får nå «Status: Kalkyle» på PDF-forsiden**
   (`_roomIsKalkyle` teller et listerom som kalkyle per definisjon). Korrekt etter §4s ordlyd,
   men nytt for de prosjektene.
3. **Snø-pakkeren kan bytte variant.** `_packSnowMats` er fasiten og valgte produkt 266 der
   raden foreslo 252 — effekten kan endre seg når «Tegn utlegg» kjøres. Raden viser etterpå det
   som faktisk ligger der. Med vilje, men verdt å vite.
4. **SIDEFUNN, IKKE RETTET:** den doble angre-pushen finnes også i snø-mattas EGEN panelvei
   (`_upcPlaceMat('auto')` fra produktpanelet). Ett Ctrl+Z etter «Bruk» gir et tomt rom i stedet
   for forrige produkt.
5. **SIDEFUNN, IKKE RETTET:** `_kundelenkeRegressionTest` ERSTATTER `S.counters` med et partielt
   objekt (via loaderens `S.counters = data.counters || S.counters`). Etterpå er `nextRoomId`,
   `nextWallId` og `nextHindringId` **NaN**, så alt som lages i samme fane får NaN-id — og
   `NaN !== NaN` gjør at rom, strips og hindringer ikke finner hverandre. Dette kostet to
   feilsøkingsrunder her. **Kjør aldri hele batteriet før en syntetisk live-test.**
   Fiks: `Object.assign(S.counters, saved)` i testens `finally` i stedet for en erstatning.
6. **Spec-filen fantes ikke i repoet** — bare referert fra kodekommentarer (DEL A/B/C). Opprettet
   `docs/spec-utendors-produkter-hurtig-prosjektering.md` med KUN den nye seksjonen; det gamle
   DEL A–C-innholdet er ikke rekonstruert (ville vært gjetting) og bor fortsatt i kommentarene.

---

## Opprydding: den døde fasebalanse-seksjonen fjernet — 2026-10-12

Sidefunn fra 058s STEG 0.1, nå ryddet bort.

### Målt før sletting

`showCablePlacePanel` ruter snø rett til `showUnifiedProductPanel()`, så
`_updateCableSelectionInner` nås **bare innendørs** — og der er `isSnow` alltid false. Målt
live med en teller rundt begge funksjonene mens snø-panelet ble åpnet: **0 kall** til
`_updateCableSelectionInner` og **0** til `_snowPhaseBalance`. I DOM-en finnes `#upc-results`,
ikke `#cable-selection-results`.

### Fjernet

- Snø-grenen «Beste løsninger» i `_updateCableSelectionInner` (~1 220 tegn)
- Snø-grenen «Fasebalanse (3 eller 6 like kabler)» samme sted (~2 560 tegn)
- `_snowPhaseBalance` og `_snowNCandidates`, som dermed ble ubrukte

Begge `if (isSnow) { … } else …` er erstattet av den grenen som faktisk kjører, med en
kommentar som sier hva som sto der og hvorfor det ble målt som dødt. Vakten `if (!isSnow)`
rundt «Andre gyldige» står igjen: den hopper bare over en liste, den tegner ikke en funksjon
brukeren tror finnes.

### ⚠ Hva som IKKE lenger finnes noe sted

Den gamle seksjonen tilbød et fasebalansert alternativ (3/6 like kabler) **også når én kabel
nådde målet**. 058s `overBalanced` fyrer bare når ingen enkeltkabel rekker. For et snøområde
der én kabel holder, finnes det nå **ingen** fasebalansert forslag.

Det var allerede tilfellet før denne oppryddingen — koden kjørte jo ikke. Forskjellen er at
hullet nå er synlig i stedet for skjult bak kode som så ut til å dekke det.

**Regresjon:** 17 batterier, 735 sjekker, alle grønne. Innendørs-panelet verifisert manuelt:
«▼ Under» og «▲ Over» som før.

---

## Kabelforslag: alltid to valg — «Over» fylles med N × like kabler — 2026-10-12

Prompt 058. Kenneth: «14,4 m², ønsket 300 W/m². Appen foreslår 1 stk InSnow 30T 4200 W som gir
290 W/m². Jeg ønsker alltid to valg.»

### STEG 0 — tre målinger

**0.1 Hvilket panel?** `showCablePlacePanel` ruter rett til `showUnifiedProductPanel()` når
`_isSnowModule()`. Snø bruker altså **UPC-panelet**. ⚠ Sidefunn: den gamle veiens
«Fasebalanse»-seksjon (`_snowPhaseBalance`, bygget i snøkabel-serien) er dermed **død for snø**
— den bor i et panel snø aldri åpner.

**0.2 Reprodusert.** `selectCableByPower.above` er **tom** (største InSnow 30T 230 V er 4197 W,
målet 4320). Og `selectMultiCables` hjelper ikke: `byN[2]` er **2 × 2100 = 4200 W** — fortsatt
*under* målet, fordi den velger minst **avvik**. `strategy` er `'1x'` (4197/4320 = 97 % ≥
`SINGLE_OK_COVERAGE`), så «Flere kabler»-seksjonen skjules helt. Tre mekanismer, ingen av dem
med ansvar for å fylle den tomme plassen.

**0.3** 2 × 2361 gir CC 9,1 cm og 3 × 1491 gir CC 9,7 — begge innenfor InSnow 30Ts [6, 50].
De var lovlige hele tiden; de ble bare aldri foreslått.

### En rettelse av promptens egen regel

Prompten sa: «over = kandidaten med **minst totalW**; ved likhet færrest kabler → 2 × 2360 =
4720». Målt gir den regelen **3 × 1491 = 4473**, som er mindre enn 4722 og dermed vinner på
totalW. Kenneths egne ord lister to kabler først («2 stk à 2360 W, evt. 3 like à 1490 W»), og
det er også riktig teknisk: hver kabel er en kurs og en termostatutgang. Regelen er derfor
**færrest kabler først, så minst overskytende effekt** — og da faller tallene nøyaktig på plass.

### Resultat

`_cableTwoPicks(roomId, prods, targetWm2, {isSnow})` er én delt seleksjon brukt av begge
panelene. På Kenneths område:

| | |
|---|---|
| ▼ Under | 1 × InSnow 30T 4200 W — 291 W/m² — CC 10,3 — **▼ under mål** |
| ▲ Over ★ | **2 × InSnow 30T 2360 W = 4722 W** — 328 W/m² — CC 9,1 — **● ok** |
| ⚡ Fasebalansert | **3 × InSnow 30T 1490 W = 4473 W** — 311 W/m² — CC 9,7 |

Klikk legger ut riktig antall (`_cablePreviewPlace(pid, N, …)`), raden sier «2 kabler → 2
kurser/termostatutganger», og «Manuelt» starter på antallet fra Over.

**Snø-merket:** «▼ under mål» for alt under målet, «● ok» 0…+15 %, «▲ høy» over +15 %. Før
fikk 328 mot 300 merket «▲ høy» i samme panel som anbefalte nettopp den raden. Innendørs er
uendret (±8 %).

### Målt på de andre tilfellene

- **Innendørs 60 m², 80 W/m² (4800 W), InFloor 10T (maks 2000):** Over = **3 × 1600 = 4800 W**
  på målet. Ingen fasebalansert rad (ikke snø).
- **Innendørs der begge enkeltkabler finnes:** nøyaktig som før — samme produkter, N = 1, ingen
  ekstra rad.
- **0,4 m² ved 300 W/m² (120 W), minste kabel 150 W:** «Under» mangler, bare «Over» vises —
  ingen tom plass, ingen feil.

Motorene er urørt: `selectCableByPower`, `selectMultiCables` og `SINGLE_OK_COVERAGE` styrer
fortsatt auto-utlegg og rangering. Dette er bare hva som *vises* som to valg.

**Regresjon:** 17 batterier, **735 sjekker** (fra 718), alle grønne. Kontrollert: slås N×-fyllet
av, blir «Over» `null` igjen.

---

## Plantegning: de manglende veggene — én linje kan pares med flere biter — 2026-10-11

047d-fortsettelsen Kenneth ba om. Etter 057 sto 177 vegg-kandidater fortsatt ubrukt, dekningen
på 48 %, og flere romlabels utenfor alle rom.

### Rotårsaken, målt

For hver av de 177: finnes det en annen kandidat som `_pair_centerline` faktisk godtar?
**91 av 177 — over halvparten — hadde en fullt gyldig partner.** Den var bare allerede brukt.
En 765 cm linje med partner på 25,8 cm tykkelse og overlapp 1,0 sto igjen som «rest».

**«Hver linje kan bare pares én gang» er feil modell.** En arkitekt tegner ytterveggens ytre
linje som ÉN sammenhengende strek langs hele fasaden, mens den indre er delt i biter av hver
tverrvegg. Den ene ytre linja er den ekte partneren til *flere* veggbiter.

### En løsning jeg prøvde og forkastet

**Gjensidig-beste paring** (stabil matching): alle foreslår til sin beste partner, bare
gjensidige par bindes. Den løser «grådighet» — hvem som velger først. Men det var ikke
problemet. Målt: rester 177 → **177**, helt uendret. Problemet er ikke rekkefølgen, det er at
antallet partnere er begrenset til én.

### Løsningen

Lag **alle** gyldige par — 875 senterlinjer med mange duplikater — og la `_merge_collinear` og
`dedupe_overlapping` (som 047d allerede bygget) rydde dem ned til 166.

### Prisen, fanget av en eksisterende test

`test_moebel_paa_eget_lag_blir_ikke_vegg` feilet. Møbellinja i DXF-fixturen fikk en «partner» i
veggen 50 cm unna — innenfor [4, 60] cm. Før endringen tapte møbelet fordi veggen alt var
oppbrukt; nå var den ledig, og den tilfeldige nærheten ble til en vegg.

Vakten er fysisk: **de to flatene av én vegg er hverandres nærmeste parallelle.** Møbelet
ligger 50 cm fra veggen, men veggens egen andre flate ligger 12,8 cm unna — møbelet er ikke
veggens nærmeste, og paret avvises fra veggens side. Fasade-tilfellet overlever, fordi alle
bitene ligger i *samme* avstand fra den lange ytre linja.

`PAIR_NEAREST_FACTOR` målt — rom / romlabels truffet av 34:

| 1,5 | 2,0 | **2,5** | 3,0 | 4,0 | ingen vakt |
|---|---|---|---|---|---|
| 33 / 30 | 35 / 31 | **37 / 34** | 35 / 34 | 37 / 33 (møbel) | 42 / 32 (møbel) |

### Resultat

| | 047d | 057 | **047e** |
|---|---|---|---|
| lukkede rom | 0 | 13 | **37** (42 i appen) |
| romlabels truffet | — | 14 av 34 | **34 av 34** |
| rester | 177 | 177 | **103** |
| dekning | 48,3 % | 48,3 % | **58,2 %** |

I appen: **42 rom** på lerretet, 28 med navn fra tegningen, alle innenfor underlaget, ett
angre-steg. Hver eneste romlabel på tegningen havner nå inni et rom.

**Regresjon:** lumelo 115 tester (3 nye som låser rotårsaken), `ruff` + `mypy` rene. arqely
718 sjekker. Den nye testen er kontrollert mot den gamle modellen: der gir den 2 rester i
stedet for 0.

---

## Plantegning: vegger over dører og vinduer, så rommene lukker — 2026-10-10

Prompt 057. Kenneth: «Det ble bare 4 rom opprettet. Jeg tror den største feilen er at vinduer
og dører bryter veggene slik at det ikke blir opprettet rom.» Riktig diagnose.

### STEG 0.2 — 199 frie veggender, målt

| vei | antall | fordeling |
|---|---|---|
| kollineær ende-mot-ende | 59 par | klynger på **90–109 cm** og **130–159 cm**; 110–119 er tomt |
| ende peker på en tverrvegg | 149 | 39 innen 130 cm, median 214 |
| hjørne som ikke møtes | 9 | ≤ 25 cm, ~90° |

**⚠ Første måling ga 0 par.** `_open_ends` returnerer `(punkt, utover-RETNING)`, ikke
`(punkt, nabopunkt)` — måleskriptet mitt leste andre element som et punkt. En måling kan være
like gal som en hypotese.

**STEG 0.3:** tegningen har 10 535 symbolsegmenter å lete i. Av 14 gap i 131–400 cm fikk
**11 vindusbevis**; de tre siste — alle 132 cm — hadde **73, 118 og 164** symbolpunkter i
dørslagets ring.

### Motoren

`bridge_openings` legger åpningene som **egne vegger** (`source='opening'`,
`opening='door'|'window'`): kollineær bro (dør ≤ 130 uten bevis, 130–400 bare med vindussymbol
eller dørslag, aldri over 400), fri ende → tverrvegg innen 130, og hjørner som ikke møtes.
Dekningen regnes **før** broene — en åpningsvegg dekker ingen råstrek.

### To målinger som endret planen

1. **Promptens tykkelses-sjekk (±2 cm) er feil.** Den avviste 22 av 59 kandidater, og alle var
   ekte dører: 12,8 mot 24,6 cm er en dør mellom en inner- og en yttervegg. ⚠ Men målt ga det
   bare **+1 bro og 0 rom** — regel (b) fanget dem opp likevel. Fjernet uansett, fordi filteret
   ikke beskytter mot noe.
2. **`DOOR_MAX_CM = 150` ville gitt 15 rom mot 13.** Beholdt **130**: Kenneths egen regel sier
   at en ekte åpning bredere enn en dør skal stå. Dørslag-beviset lukker de brede gapene som
   faktisk *er* dører — uten å gjette.

### Appen

Åpningsvegger tegnes **stiplet** med svakere flate, så Kenneth ser forskjell på «dette fant
jeg» og «dette gjettet jeg». Brikke «🚪 55 dører · 🪟 3 vinduer lukket» i verktøylinja; klikk
blinker dem i 1,5 s. Velger man en, sier linja «Lagt over en dør — slett hvis det er en ekte
åpning». Den slettes på nøyaktig samme vei som enhver annen vegg. `close_gaps_cm` er hevet fra
121 til 130, samme tall som motorens `DOOR_MAX_CM`.

### Målt på Kenneths tegning

| | før 057 | etter |
|---|---|---|
| lukkede rom | **4** | **13** |
| frie veggender | 199 | 129 |
| åpningsvegger | – | 55 dører + 3 vinduer |
| dekning | 48,3 % | 48,3 % (uendret, som den skal) |

Alle 13 fikk navn fra tegningen, 8 med arealsjekk ✓, og ett Ctrl+Z fjerner alle.

### Kenneth hevet taket samme dag: 130 → 500 cm

> «door max kan være mye mer, det kan plutselig komme garasjeporter på 500 cm også.»

Målt på tegningen — rom lukket / romlabels truffet av 34:

| 130 | 200 | 250 | 300 | 400 | **500** | 600 |
|---|---|---|---|---|---|---|
| 13 / 14 | 19 / 23 | 21 / 23 | 23 / 23 | 29 / 27 | **35 / 33** | 41 / 32 |

600 gir flere rom enn det finnes labels, og færre treff — da splittes rom som hører sammen.
**500 er toppen.** I appen: **36 rom** på lerretet, 26 med navn fra tegningen, ett angre-steg.

Prisen er at en ekte åpning mellom kjøkken og stue nå også lukkes. Det er et bevisst bytte: en
åpningsvegg er stiplet og slettes med ett klikk, mens et rom som ikke lukker krever at brukeren
tegner veggen selv. **Å lukke for mye er billig; å lukke for lite er dyrt.**

Og vindussymbolet avgjør nå navnet *først*, også under `DOOR_MAX` — ellers ble de 3 vinduene
til «dører» i brikka så snart terskelen gikk over 130. Nå: 91 dører og 12 vinduer.

### Hvor det stopper — ærlig

Med 130 var det 13 av 34. De 19 som ikke lukker er de **store** rommene:
Kjk./stue (22–29 m²), Fellesareal 31, Boder 48, Felles inngang 26/20, Korridor 19. De er ikke
blokkert av åpninger, men av **manglende vegger** — 177 vegg-kandidater ble aldri vegg, og
dekningen står på 48 %. Det er 047ds uferdige arbeid (dobbel-paringen), ikke 057s.

### En felle i min egen test

`_planList()` returnerer den **levende** lista. Testen holdt en referanse til den, spleiset ut
en vegg, og sammenlignet så mot `l[1].id` — som da pekte på en annen vegg. Id-en leses nå før
spleisingen.

**Regresjon:** lumelo 112 tester, `ruff` + `mypy` rene. arqely 17 batterier, **718 sjekker**
(fra 709), alle grønne.

---

## Plantegning: rommene speilvendes ikke lenger — 2026-10-10

Prompt 056. Kenneth: «De rommene som ble opprettet la seg helt feil sted, utenfor tegningen.»

### Rotårsaken: to omregninger som er uenige om hvilken vei y går

`_planRomRader` gir polygonet i verdens-cm delt på 100, med y **nedover** — samme retning som
veggene tegnes (`_planUVtoW`: `y = originY + v·heightCm`). `_drawCreateRoomsFromReview` ble
skrevet for den gamle `/import/pdf`-veien, der polygonene kommer i PDF-meter med y **oppover**,
og speiler derfor: `y: -p[1]*100`.

052 lot plantegning-veien gå gjennom den funksjonen. Resultatet var
`y = −(originY + v·heightCm)` — speilvendt om x-aksen.

**STEG 0.1, målt:** underlaget spenner y ∈ [−700, 0]. Forventet `points[0].y = −560`; faktisk
**`+560`**. Romsenteret på **`+420`**, altså utenfor tegningen. Veggene går ikke gjennom denne
funksjonen og lå derfor riktig hele tiden.

**STEG 0.2:** `fitAll()` i `_drawCreateRoomsFromReview` er grunnen til at både tegningen og de
feilplasserte rommene var synlige — den zoomet ut til 0,2 for å få med alt.

### Hvorfor 052 ikke så det

052s sjekker sammenlignet **arealer**, og arealet er identisk for et speilvendt polygon —
11,2 m² begge veier. Og den ekte PDF-en rendret ikke ferdig i testpanelet, så ingen så rommene
på lerretet. Den nye regresjonssjekken måler derfor **posisjon**: `points[0]` mot
`_planUVtoW(bg, polygon[0])` ± 1 cm, og at romsenteret ligger innenfor underlagets rektangel.

### Fiksen

`_drawCreateRoomsFromReview(rooms, opts)` fikk `{ yDown, fitAll }`. Plantegning-veien kaller
med `{ yDown: true, fitAll: false }`; den gamle veien er uendret (standard speiler, standard
kjører `fitAll`). Visningen fra vegg-sjekken beholdes — brukeren står alt og ser på tegningen.

**Målt etter:** `points[0]` treffer `_planUVtoW` med **0 cm avvik**, alle fire rom fra
Okkenhaugvegen ligger innenfor underlaget, zoom uendret. Gammel vei gir fortsatt `y: −200` for
et polygon på 2 m — uberørt.

### Kontrollen som gjør sjekken verdt noe

Den nye sjekken ble kjørt mot koden **før** endringen (ved å la `_drawCreateRoomsFromReview`
ignorere `opts`): fem av åtte feilet, med nøyaktig Kenneths symptom — `200/560` mot `200/-560`,
senter `400,420` utenfor `[-700..0]`, og zoom tilbake til 0,2.

Og testriggen gikk i **049s gamle felle**: `img: {}` er ikke et gyldig bilde, så `_planExit()`
→ `render()` → `drawBgImage` kastet, og hele J-blokken stoppet stille etter det punktet. De
rene datasjekkene i samme blokk kaller aldri `render()` og overlevde derfor. Riggen bruker nå
et ekte `<canvas>`.

En 052-sjekk måtte også løsnes: mønsteret `_drawCreateRoomsFromReview\(rader\)` var for
bokstavelig og feilet da kallet fikk et `opts` — selv om det den hevder (at den delte
opprettelsen gjenbrukes) fortsatt var sant.

**Regresjon:** 17 batterier, **709 sjekker** (fra 701), alle grønne.

---

## Kundedialog-logg: hele historikken per prosjekt — 2026-10-10

Prompt 055. Kenneth: «Jeg ønsker en knapp hvor jeg kan se logg av hele dialogen med meg og
kunden … går det flere runder, har vi full historikk.»

### STEG 0 — loggen trengte nesten ingen ny lagring

Målt: `kundelenker` har allerede `created_at`, `invite_sent_at`/`invite_sent_to`, `answered_at`,
`answered_by_name`, `answer`, `approve_all_at`, og fra 053 `applied_result[].at/by/resultat` og
`svar_sendt_at`. Loggen **avledes** derfor — den lagres ikke.

To hull: (1) hendelser uten egen kolonne — at lenka ble *kopiert* til e-post og at den ble
*trukket*; (2) **mål-veien satte `status:'applied'` uten `applied_at`**, så «Du innarbeidet
målene» ikke kunne dateres. Begge rettet.

### Datamodell

Én additiv kolonne `hendelser jsonb` og RPC-en `kundelenke_logg(p_id, p_hendelse)` som gjør
`hendelser || $1` **på serveren** — to vinduer som logger samtidig skal ikke overskrive
hverandre, slik en les-endre-skriv i klienten ville gjort. `security invoker`, bare gitt til
`authenticated`: RLS avgjør hvem som kan skrive, og anonyme veier rører den aldri.

«Kopiert» logges i den **delte** `_copyLinkRich`, ikke i hver av de tre knappene som kaller den.

### Tidslinjen

`_kundeLoggRunde(lenke, nr)` er en ren funksjon — ingen nettverk, så den kan testes. Én lenke
blir til én runde: lenke laget → kopiert → invitasjon sendt → kundens svar (med én klikkbar
linje per rom og kommentaren i kursiv) → godkjent hele prosjektet → dine beslutninger med hva
det **faktisk ble** → svar sendt → innarbeidet / trukket / utløpt.

Vinduet er av samme slag som 053s (flyttbart, ikke-modalt) og gjenbruker `_forslagVinduDrag`, så
det ikke finnes to drag-implementasjoner. Nyeste runde øverst, ikoner → ← ✓ ✕, klikk på et
romnavn velger og zoomer til rommet. «Kopier som tekst» gir **kronologisk** ren tekst (historikk
leses forfra, i motsetning til vinduet), og «Skriv ut» åpner en lesbar side.

Knappen står to steder: egen rad «🕘 Kundedialog · Logg» i prosjektinfo, og 🕘 i
forslagsvinduets tittellinje. 053s «✓ Forslag behandlet · Se forslaget» peker nå på **Se logg**.

### Én vakt måtte heves bevisst

041s regresjonssjekk teller RPC-kall for å hindre at den anonyme flaten vokser.
`kundelenke_logg` er et sjette kall — tallet er hevet **med begrunnelse i koden**: funksjonen er
innlogget-only, og at kundens veier ikke kaller den er låst i en egen sjekk.

Og en av mine egne forventninger var feil: jeg skrev 7 hendelser der riktig svar er 8
(created + kopiert + invitasjon + svar + godkjent-alt + godkjent + avslått + svar sendt).
Testen var feil, ikke koden.

**Regresjon:** 17 batterier, **701 sjekker** (fra 685), alle grønne.

---

## Kundesiden: stigen fortsetter med N × like kabler, og tomme rom kan få forslag — 2026-10-10

Prompt 054. Kenneth: «InFloor 10T, maks 2000 W: neste steg 2 stk 1100 W = 2200 W.»

### STEG 0 — målt i et 30 m² rom

Største gyldige enkeltkabel er **InFloor 10T 2000W/200m**: CC 15,0 cm, 67 W/m². To stk
1100W/110m gir **CC 13,6 cm** — innenfor [5, 50] — og **73 W/m²**. Bøyeradius 32 mm krever
1,6 cm; det er 6,8 cm. Stigen kan altså fortsette.

`autoFillMultiCable(roomId, pid, 2)` returnerer **2 kabler med felles `multiCableGroup`**, og
trenger **ikke** `S.ui.selectedRoomId` — i motsetning til `autoFillMatSerpentine`, som 044 målte
at gjør det.

`_upcScopeProducts` virker **anonymt**: samme 44 kabler og 57 matter innlogget og utlogget,
inaktive borte, `_productVisibleToOrg` med. ⚠ Men `_famKeyOf` må kalles med `hasFamily = true`
— uten andre argument splitter den navnet og gir «InFloor 10T 1100W» som «serie», altså én per
produkt i stedet for «InFloor 10T · InFloor 17T».

### Stigen

`_forslagFlerkabelRader` legger N × like (N ≤ 3) oppå `selectCableByPower`-radene. Formelen er
hentet, ikke ny: `roomAreas` for arealet, `_ccLimits` for grensene, samme bøyeradius-test.

**⚠ Terskelen måtte være mot N−1, ikke mot N=1.** Med terskel mot største enkeltkabel overlevde
«3 stk 700 W = 2100 W» og ble første steg over 2000 W — tre kurser for 100 W mer. Med riktig
terskel er sekvensen nøyaktig Kenneths: **2000 → 2 stk 1100 = 2200 → 2 stk 1200 = 2400 →
2 stk 1300 = 2600**.

En rad er nå identifisert av **(produkt, antall)** — pilene, «som nå», gyldighetsvakten og
`_forslagRadTall` måtte alle lære det; 1 stk og 2 stk 1100 W har helt ulik CC.
«Finn» (ønsket flateeffekt) henter fra stigen i stedet for `selectCableByPower.below/above`,
ellers ville den hatt et annet tak enn pilene. Målt: 130 W/m² gir «under: 2 stk 1800 W
(120 W/m²)» og «over: 2 stk 2000 W (133)».

Godkjenningen kaller `autoFillMultiCable` når `cableCount > 1`. Målt: 2 kabler med felles
gruppe, **ett** angre-steg, «Ble: 2 stk InFloor 10T 1200W … 79 W/m² · CC 12,5».

### Rom uten varme

`_forslagKanForeslaaVarme` — alle innendørs rom uten produkt, **unntatt snørom og fryserom**
(snø er en annen modul; et fryserom har kabel under isolasjonen med reservekabel, 025).
Kortet gir «✓ OK uten varme» eller «Foreslå varme» → tre trinn: **type** (Kabel/Matte, folie
holdt utenfor) → **serie** (fra samme katalog Kenneth ser) → **variant** (pilekort, startet på
raden nærmest rommets standard-flateeffekt). Bare serier med minst én gyldig rad i rommet vises.

Godkjenningen leser `rad.nyType` når rommet er tomt, og `_forslagMatteProdukt` returnerer
kundens produkt direkte i stedet for å lete i familien til en `naaProd` som ikke finnes.
Målt: tomt rom → kabel lagt; tomt bad → matte lagt.

049s regresjonssjekk E er **endret**: et tomt rom gir fortsatt ingen pileliste, men får nå
kortet «Foreslå varme».

**Regresjon:** 17 batterier, **685 sjekker** (fra 665), alle grønne.

---

## Kundeforslag: beslutningene lagres per rom, flyttbart vindu, kundeønske i romlista — 2026-10-10

Prompt 053. Kenneth: «Jeg trykker godkjenn og lukk — ikke «send svar til kunde». Det står
fortsatt en tekst oppe til venstre om at forslag fra kunde må gås gjennom.»

### STEG 0 — målt, og årsaken er én linje

044 lagret **aldri hva Kenneth bestemte**, bare hva kunden sendte. `_forslagRevState.behandlet`
er en Map i minnet; `_kundeReviewShownFor` likeså. Eneste vei til `status='applied'` gikk
gjennom «Send svar til kunden».

Målt i appen: Godkjenn → produktet byttet, `behandlet: 1`, ett angre-steg. «Last på nytt» →
`behandlet: 0`, panelet viser Godkjenn-knappen igjen, **men utlegget er fortsatt byttet**,
`status` fortsatt `answered`, `applied_result` fortsatt `null`.

**Parentesen i prompten besvart:** en ny Godkjenn gir **1 kabel, ikke 2** —
`_clearRoomProductCollections` rydder før motoren. Dobbelt utlegg var aldri risikoen.

Panelet var `position:fixed; inset:0` med `rgba(0,0,0,.6)` bakdropp — altså en modal som dekket
lerretet, og klikk utenfor lukket den. Avslå var `window.prompt`.

### Beslutningene lagres i databasen, med én gang

`applied_result` (jsonb, fra 044) brukes nå som løpende protokoll, ikke sluttoppgjør: hver
Godkjenn/Avslå merges inn per `roomId`, med `by`, `at` og — for godkjente — `resultat` **målt
av rommet etterpå** (`_computeRoomStats`), ikke gjentatt fra forslaget.

Når alle rader som ikke er `ok` har en beslutning, settes `status='applied'` **automatisk og
uten e-post**. Rader med `ok: true` og rom som ikke finnes lenger teller som behandlet.
«Send svar til kunden (valgfritt)» er en egen knapp som i tillegg setter ny kolonne
`svar_sendt_at` — skilt fra `applied_at` med vilje, fordi «ferdig» og «kunden er varslet» er
to ting.

`behandlet` seedes nå fra `applied_result`, og `_kundeMaybeOpenReview` ser på **ubehandlede
rader** i stedet for bare `status`. Merket i prosjektlista forsvinner av seg selv
(`_fetchKundeStatus` henter bare open/answered), og prosjektinfo viser i stedet
«✓ Forslag behandlet 10. okt · Se forslaget».

### Vinduet

Ikke lenger en modal: 440 px bredt, høyre side, dras i tittellinja (posisjonen huskes i
`sessionStorage`), minimeres til en brikke «💬 Kundeforslag · 3 igjen», og **klikk på lerretet
lukker det ikke**. Én rad per rom med «Nå:», «Kunden foreslår:», kommentaren i kursiv og — etter
godkjenning — «Ble: …». Klikk på en rad velger rommet og zoomer til det, så utlegget skifter
mens Kenneth ser på. ↑/↓ bytter rom, Enter godkjenner, Esc lukker. Avslå åpner et felt **i
raden** med tre hurtigvalg. Hvert rom har **Angre**, som legger rommet tilbake og tar `status`
tilbake til `answered`.

### Kundeønske i romlista

Rom med ubehandlet ønske får blå venstrekant og 💬 etter navnet; etasje-toppen viser
«💬 N kundeønsker». Er rommet valgt, står ruta «Kundeønske» rett under raden med Godkjenn ·
Avslå · Åpne alle — og den kaller **de samme funksjonene** som vinduet, ikke en kopi.

### Én ekte feil funnet ved å kjøre

Etter «Send svar» blir lenka `applied`, og `_kundeRefreshStatus` plukker bare open/answered →
`_forslagLinkCache` ble **null**, og vinduets re-render krasjet på `k.answered_by_name`.
`_forslagSisteCache` bærer lenka videre, så vinduet kan vise «Svar sendt 10. okt» i stedet for
å forsvinne.

**Regresjon:** 17 batterier, **665 sjekker** (fra 652), alle grønne. Ti nye kilde-påstander i
`_kundeforslagRegressionTest`, alle negativkontrollert ved å mutere kilden.

---

## Plantegning: målestokk fra motoren, rom på lerretet, lesbar vegg-sjekk — 2026-10-10

Prompt 052. Kenneth: «Så fort jeg setter målestokk, kommer det dårlige resultatet: bare rom i
farger, uten plantegningen og ikke standard canvas.»

### STEG 0 — alle fire punkter reprodusert

**0.1** På Okkenhaugvegen-tegningen svarte motoren `method:'title'`,
`meters_per_point:0.0352778`, **`confidence:0.9`** — *samtidig* som `bg._needsCalibration`
var `true` og «Sett målestokk»-overlayet lå oppå vegg-sjekken. Boksen var altså en sperre for
noe appen allerede visste. (047d løftet tilliten fra 0,5 til 0,9: innvendig areal gjorde at
arealkryss-sjekken endelig stemmer med tittelfeltet.)

**0.2** `confirmFixedScale` satte `drawMode = null` → `_planAktiv()` false → vegg-sjekken
borte. **Verre enn prompten antok:** `#_plan-bar` ble *stående igjen* i DOM-en, så brukeren så
verktøylinja til en modus han ikke lenger var i.

**0.3** «Lag rom» → `#import-review-screen` som `flex`, fullskjerm, 0 rom i `S.rooms`.

**0.4** Det er **ikke** `_dropTargetChoice`, men PDF-grenen av `_rasterMethodChoice`: samme
funksjon har to grener, og vektor-grenen hadde allerede riktig rekkefølge mens PDF-grenen
hadde «La appen finne rommene (Eldre vei)» øverst.

### Målestokken kommer fra motoren

`_planKalibrerUnderlag` setter `bg.widthCm/heightCm` fra `page_size_pt × meters_per_point`.
Målt: 0 → **5940 × 4200 cm** (A2 i 1:100). `originX/originY` røres ikke — veggene er i (u,v)
av underlaget (046), så tegningen og veggene flytter seg i flukt. Det er hele grunnen til at
046 valgte normaliserte koordinater.

- **Tillit ≥ 0,8:** overlayet vises ikke, og verktøylinja får brikka
  «Målestokk 1:100 · fra tittelfeltet · Endre».
- **Tillit < 0,8:** overlayet står, men «Fast målestokk» er forhåndsfylt med motorens gjetning
  og en gul linje sier «Motoren er usikker på målestokken (gjetter 1:100) — bekreft eller mål
  opp». Brikka sier «usikker · Bekreft».
- **Rekkefølge-fella** fra prompten er håndtert og verifisert: motoren svarer *etter* at
  underlaget er lagt inn, og overlayet lukkes i det svaret kommer.
- Brikka leste først bare motorens tall, så den sto på «1:100 fra tittelfeltet» også etter at
  brukeren hadde overstyrt til 1:50. Nå vinner brukerens eget valg: «satt av deg» / «målt opp».

### Kalibrering forlater ikke lenger vegg-sjekken

Felles `_planEtterKalibrering()` i alle tre veiene (fast målestokk, to-punkts, Avbryt), **før**
`drawMode = null`. Målt etter 1:50: `drawMode` fortsatt `plan-review`, verktøylinja står,
u,v uendret — veggene flytter seg ikke i forhold til underlaget.

### Rommene legges på lerretet

`_planRomTilLerret` erstatter `_planTilGjennomgang`, som er **fjernet**. Rom-opprettelsen
gjenbrukes helt — `_drawCreateRoomsFromReview` eier allerede ett-undo-steget, `_planNamed`,
`_planNumber` og `statedAreaM2`. Målt på Okkenhaugvegen gjennom den ekte inngangen:

| rom | romtype | areal | tegningen sier | |
|---|---|---|---|---|
| 115 Kontor/møterom | office | 7,36 m² | 6,9 | ⚠ |
| 117 WC gjest | bathroom | 2,55 m² | 2,5 | ✓ |
| 120 WC | bathroom | 1,47 m² | 1,4 | ✓ |
| 122 EL | other | 2,51 m² | 2,4 | ✓ |

**Ett** Ctrl+Z fjerner alle fire. ✓/⚠ vises både ved romnavnet på lerretet og i romlistas
eksisterende badge-rad. Rom-kort ved klikk (navn, romtype, «Ingen varme», areal mot tegningen,
Bekreft / Hopp over / Slett; Enter bekrefter, Tab går videre, Esc lukker). «Bekreft alle med
navn fra tegningen» i en egen linje over lerretet, som forsvinner når alt er bekreftet.

**049s «Ikke navngitt»-gruppe kunne gjenbrukes uendret** — den nøkler allerede på
`_planNamed === false`. Verifisert med et navnløst rom: gruppa «Ikke navngitt (1)» dukket opp,
det navngitte rommet ble i hovedlista.

### To feil funnet ved å kjøre, ikke ved å lese

**1. `calcType` finnes ikke på et ekte rom.** Feltet bor bare på review-raden
(`_reviewApplyType`). Uten et eget flagg ville «122 EL» sett nøyaktig ut som et rom ingen har
kommet i gang med. Nå `room._planNoHeat` + egen status «Ingen varme (fra tegningen)».

**2. `_reviewIsSuggested` betyr «foreslå utfylling», ikke «skal ikke varmes».** Første versjon
gjorde «115 Kontor/møterom» til et rom uten varme. Et kontor skal varmes — det er bare ikke
appen som foreslår produktet. «Uten varme» leses nå av NAVNET (`UTEN_VARME_RE`, delt med
`_pdfGuessRoomType` så mønsteret ikke finnes i to utgaver).

Og én i min egen kode: dimmingen hentet underlaget via `_planBg()`, som krever `widthCm > 0` —
og den er 0 helt til målestokken kommer, altså nettopp i vinduet vegg-sjekken åpner i.
Underlaget ble derfor ikke dimmet i det hele tatt.

### Lesbarhet og dialog

Underlaget dimmes til 45 % mens vegg-sjekken står på (originalen lagres på bakgrunnen selv, så
to påfølgende `_planEnter` ikke kan lagre 0,45 som «originalen»), og senterlinjene får en mørk
kant så de leses både mot hvitt papir og mot en svart vegg. Begge grener av valgdialogen har nå
samme rekkefølge: anbefalt øverst, eldre vei nederst og grå.

### Ikke verifisert

**Den ekte A2-PDF-en rendres ikke ferdig i testpanelet** — `page.render()` på 3367 × 2381 px
brukte over 80 s og fullførte ikke. Hele app-logikken er derfor målt med motorens *ekte* svar
og en PDF med samme sideforhold, og den ekte inngangen (`_rasterChoose('plan')` →
`_planStartFraFil`) er kjørt ende-til-ende på den. PDF.js' egen rendring av den store siden er
det eneste leddet jeg ikke har sett fullføre her.

**Regresjon:** 17 batterier, **652 sjekker** (fra 636), alle grønne. `_planRegressionTest`
utvidet med blokk J. 049s sjekk «ingen ny rom-kort-flate bygget» er **opphevet** og erstattet:
den ville bestått fordi jeg døpte funksjonen `_planAapneKort`, ikke `_planRomKort` — altså
bestått av feil grunn. Kortet ER bygget, og det er bestilt.

---

## Labels i PDF med fast papirstørrelse + «Prosjektert av» fra innlogget bruker — 2026-10-09

Prompt 051. Fredrik syns labelene på utskrift er små, og «Prosjektert av» blir ofte tomt.

### STEG 0.1 — målt, og det er verre enn meldingen tilsier

`LABEL_FONT_CM = 5.0` er en konstant **verdens**-størrelse: 5 cm på gulvet. Men hvert rom
skaleres for å fylle siden, så 5 cm blir ulikt mange millimeter på papiret:

| rom | mm per cm | teksthøyde |
|---|---|---|
| Lager 400 m² (25 × 16 m) | 0,0643 | **0,32 mm** (0,9 pt) |
| Stue 60 m² (7,75 × 7,75 m) | 0,1293 | **0,65 mm** (1,8 pt) |
| Lager 60 m² (10 × 6 m) | 0,1385 | **0,69 mm** (2,0 pt) |
| Bad 8 m² (3,2 × 2,5 m) | 0,2527 | 1,26 mm (3,6 pt) |
| WC 2 m² (1,4 × 1,4 m) | 0,3159 | 1,58 mm (4,5 pt) |

Et rom på 60 m² får altså 0,7 mm tekst. Selv badet, som er «best», får 1,3.

### STEG 0.2 — seks bruksteder, ikke elleve, og ingen egne konstanter

Prompten sa 11 steder. Målt er det **6** kodesteder (resten er kommentarer og selve
definisjonen), og kabel/matte har **ingen** egne konstanter — alle leser `LABEL_FONT_CM`:
`_drawMatPathObj` (frihånds-matte), `drawStrips` (folie), `_drawFoilFreeLabel` (fri folie),
`_drawCableLabelOnly`, `drawCables`, `drawMats`. Alle seks går nå via `_labelFontCm()`.

### STEG 0.3 — og her tok prompten feil om hvor skalaen bor

Prompten sa at rommets PDF-skala finnes der `S.ui._pdfMode` settes. **Det gjør den ikke.**
`_renderRoomToImage` får `targetWidthMm`, men PDF-ruta kan plassere bildet **smalere**
etterpå: når `imgW × aspect` overstiger høydebudsjettet, blir bredden `imgH / aspect`.
Målt på et kvadratisk rom: **139 mm, ikke 180**. Regnet labelene med 180 ville de blitt 23 %
for små på nettopp de rommene som er høyere enn brede.

Løsningen: aspektet er bare geometri, så det kan regnes **før** rendringen. Ny
`_pdfRoomAspect(room)` er den delte kilden til både padding (`PDF_ROOM_PAD_CM`) og aspekt, og
kalleren regner ut den plasserte bredden og sender *den* som `targetWidthMm`.

### Regelen er snudd: fast størrelse på PAPIRET

`_labelFontCm()` gir `LABEL_FONT_CM` på skjerm (uendret for alle), og i PDF
`2,2 mm × preferanse / mmPerCm`, klemt til 4–40 cm på gulvet. Målt resultat — samme
millimeter uansett romstørrelse:

| | Liten 0,8 | Normal 1,0 | Stor 1,25 | Ekstra stor 1,5 |
|---|---|---|---|---|
| alle rom | 1,76 mm | **2,20 mm** | 2,75 mm | 3,30 mm |

Gulvstørrelsen varierer i stedet: 7 cm i et WC på 2 m², 15,9 cm i et lager på 60 m², 34,2 cm
i et på 400 m².

**Klemmingen er en sikring, ikke normaltilfellet — også målt.** Med 150 cm luft rundt rommet
treffes 4 cm-gulvet **aldri** (det minste målte er 5,6 cm for et WC på 2 m² ved Liten; det
ville krevd et rom under 27 cm bredt). 40 cm-taket treffes først ved et rom over ~30 m langt:
en hall på 30 × 8 m får 2,18 mm i stedet for 2,20, og et lager på 400 m² får 2,57 i stedet for
2,75 ved Stor. Prompten ventet at et WC på 2 m² skulle klemmes til 4 cm — det skjer ikke.

### Preferansen

`profiles.prefs.pdfLabelScale` (023-mønsteret), chip-rad i profil-dialogens
«Prosjekteringsvalg». Fire valg, slik tittelen i prompten sa — brødteksten listet bare tre.
Eksportdialogen viser «Labelstørrelse: Normal» med lenke til profilen, **ikke** et valg per
utskrift. Lagres aldri i prosjektet, så to brukere kan skrive ut samme prosjekt med ulik
labelstørrelse.

### Test 2 — overlapp i tette rom, målt og rapportert

8 m² bad med 6 folier, labelboksene transformert til bildekoordinater:

| preferanse | fontstørrelse | overlappende par |
|---|---|---|
| Normal | 23 px | **0** |
| Stor | 29 px | 1 |
| Ekstra stor | 34 px | 6 (fem av dem bare 4 px dypt) |

Ved Normal er det rent. Velger Fredrik Stor eller Ekstra stor, begynner labelene å kollidere i
et så tett rom — det er avveiningen han selv tar, og Normal er allerede 3,2× dagens.

### «Prosjektert av»

- `_myDisplayName()` er én kilde (profilnavn → e-postens del før `@`), brukt av alle tre veiene.
- **Opprettelse:** feltet forhåndsfylles, og er det tømt ved lagring settes det likevel. Gjelder
  også hurtig prosjektering (`_quickStartModule`), som ikke satte det i det hele tatt.
- **Eksisterende prosjekter:** fylles **ikke** ved åpning — det kan være Fredriks prosjekt som
  Kenneth åpner. I stedet «Sett meg»-knapp i Kunde & prosjektinfo (vises bare når feltet er
  tomt) og en gul linje med «Bruk <navn>» i eksportdialogen.
- `responsible_user_id` lagres i prosjekt-JSON når navnet er brukerens eget, og nullstilles hvis
  navnet redigeres bort. Ingen migrasjon.
- Filnavn-initialene bruker nå **den som prosjekterte** via den eksisterende
  `_plResponsibleInitials` — samme oppløsning som prosjektlista. Målt: FH for eget navn, KN for
  «Kari Nordmann», FH når feltet er tomt (som før). **Spørsmål til Kenneth:** er det ønsket?

### Funnet underveis, ikke rettet

**Målkjede-tallene («40 cm», «49 cm») er en annen fontvei og er fortsatt små: målt 0,85 mm.**
De bruker `max(7, 9 × zoom)` px, ikke `LABEL_FONT_CM`, så 051 rører dem ikke. Fredrik vil
trolig se dem neste. Ikke endret, fordi målsettingsteksten må få plass mellom målestrekene og
det er en annen avveining.

Og en målefelle i min egen test: `_currentProfile` er modul-scope, så
`window._currentProfile = …` endret ingenting — første testkjøring viste 2,20 mm for alle fire
preferansene og så ut som en bug i koden. Den var i testen.

**Regresjon:** 17 batterier, **636 sjekker** (fra 618), alle grønne. `_prefsRegressionTest`
utvidet med F (labelstørrelse) og G («Prosjektert av»), og de sju kilde-påstandene er
negativkontrollert ved å mutere kilden og se at de da feiler.

---

## Veggforslaget: duplikater, fragmenter, arkflate og INNVENDIG areal — 2026-10-08

Prompt 047d. Forslaget kom fra meg selv i 047c, og **begge hypotesene i det var målt feil.**

### STEG 0 — mitt eget premiss falt

**«`PAIR_MIN_OVERLAP = 0.60` er for strengt når en vegg er delt av døråpninger.»** 3363 par
avvises *bare* av overlapp-testen på din tegning — men medianen er **0.000** og **maks 0.590**.
Terskel 0,5 gir 7 nye par, 0,1 gir 40. Terskelen er ikke flaskehalsen. Grunnen hypotesen var
feil: nevneren i `_overlap_fraction` er den **korteste** av de to, så en kort innervegg mot en
lang ytterlinje gir overlapp 1,0 — nettopp døråpningstilfellet jeg trodde feilet.

**«Den ytre rammen droppes ikke.»** Riktig, men ikke av den grunnen jeg oppgav.
`_drop_outer_frame` krever at flaten inneholder ALLE de andre, og ark-flaten inneholder **0 av
17** — `polygonize` lager en **plan oppdeling**, så naboflater ligger utenfor hverandre, ikke
inni.

**Seks tilnærminger ble målt før noe ble skrevet.** Ingen lukket rommene ved å skru på en
terskel: overlapp (+7 par), `MIN_STROKE_PT` ned til 0 (87 polygoner, men **2 av 34** med riktig
areal), kjeding alene, dedup alene, grovere `close_gaps` (5 m «dører»), og et raster-**flomfyll**
fra romlabelene (**8 av 34** — lekker gjennom døråpningene).

### Det målingene faktisk fant — fire defekter

**1. 114 av 368 vegger var duplikater.** Rundt ett enkelt rom lå tre nesten identiske
senterlinjer (t = 12,8 / 13,4 / 12,8 cm). `_merge_collinear` fanger dem ikke — den krever at
**endene** sammenfaller, mens duplikater overlapper i hele lengden. Ny `dedupe_overlapping`,
med median tykkelse (13,4 var avviket, ikke fasiten).

**2. Vegger sendt som fragmenter er usynlige for hele motoren.** 7851 av 11 174 segmenter er
kortere enn 25 cm, og `MIN_WALL_LEN_CM` kaster hver enkelt. Toppveggen over ett av rommene
finnes **ikke** som en lang strek — bare som biter. Etter kjeding er den 293 cm. Ny
`chain_collinear`, og den må kjøre **før** kandidatvalget; `_merge_collinear` kjører på vegger
og kommer for sent.

**3. Ark-flaten ble «rom 1» på 2149 m²** mot 442 m² for summen av alle oppgitte arealer. Ny
`_er_arkflate`: spenner over mer enn 85 % av både bredde og høyde. Målt: 96,6 % × 93,3 %, mot
det største virkelige rommet på 47,9 m² ≈ 195 pt.

**4. Rommene var SENTERLINJE-areal, ikke innvendig** — defekten med størst konsekvens i hele
serien. `polygonize` lukker senterlinjer, så polygonet går vegg-midt til vegg-midt, mens
grunnregelen i CLAUDE.md er at `room.points` er den **innvendige** grensen og `room.area` det
brukbare gulvarealet. **Hvert rom plantegning-flyten lagde var systematisk ~1,2× for stort — og
varmen dimensjoneres på arealet.** Ny `_til_innvendig`, som krymper inn halve tykkelsen av
veggene som danner *dette* rommets grense (median, ikke snitt — snittet trekkes opp av tykke
ytterveggbiter, og en global median under-krymper de tykke rommene). Brukt i **både**
`/import/plan` og `/plan/rooms` — sistnevnte er ruta appen faktisk lager rom med.

### Målt resultat på den ekte tegningen

| | 047c | 047d |
|---|---|---|
| vegger | 253 | **168** (97 var duplikater) |
| røde rester | 134 | 177 |
| **lukkede rom** | **0** | **4** — Kontor/møterom, WC gjest, EL, WC |
| arealsjekk OK | — | **3 av 4** |
| dekning | 53,4 % | 48,3 % |

Rester og dekning går «feil vei» med vilje: kjedingen finner flere **ekte** vegg-kandidater, og
de som ikke parer seg blir røde prikker i stedet for å være usynlige.

På fixturen treffer innkrympingen håndregnet fasit til centimeteren: ytre 500×400 cm med 20 cm
vegger gir 460×360 = **16,56 m²** (senterlinje: 18,24).

### To feller

**`segment_widths` er en TOM LISTE for DWG, ikke `None`** — altså «ingen informasjon», som
`centerlines` leser som «slipp gjennom». Første utgave av kjedingen bygget en ny liste med 0.0
per kjede, altså «informasjon om at streken er 0 tykk», og da forsvant alle 6 veggene på
DXF-fixturen. Fravær må forbli fravær.

**Fixturens oppgitte arealer var satt nær senterlinje-arealet**, så tre arealtester *bestod* ved
å låse en konvensjon som strider mot appens grunnregel. Fixturen oppgir nå innvendige arealer,
slik en arkitekt skriver dem.

### Ikke gjort, med vilje

20 navnløse flater (tittelfeltet) står igjen. En regel «en flate uten romlabel er ikke et rom»
ville fjernet dem alle — men også «Ikke navngitt», som Kenneth avklarte eksplisitt skal finnes.
Og 30 av 34 rom lukker seg fortsatt ikke; det finnes ingen terskel som fikser det.

**Regresjon:** lumelo 107 tester, `ruff` + `mypy` rene. arqely 17 batterier / 618 sjekker.

---

## Plantegning: DWG gjennom samme flyt, med $INSUNITS — 2026-10-08

Prompt 050. DWG/DXF får det samme tredje valget som PDF, og går gjennom hele vegg-sjekken.

### STEG 0 — prompten antok at DWG var som PDF

**`parse_dwg` gir INGEN fylte flater.** CAD-vegger er doble linjer, så hele `rect`-veien fra 047
er ubrukt for DWG og `double`-tersklene bærer alt. **Og `parse_dwg` manglet `page_size_pt` og
`origin_pt`** — kontrakten fra 046 er sidenormalisert, og en tegning har ingen «side».

### Tre feller, alle målt

**1. Utstrekningen må regnes av SAMME strek som bakgrunnen.** `dwg_background` beskjærer til
`MAX_BACKGROUND_SEGMENTS` og regnet utstrekningen av den **beskårne** mengden. Normaliseres
veggene mot hele tegningen, driver de bort fra underlaget på akkurat de tegningene som er store
nok til å bli beskåret. Nå delt kilde: `background_segments` + `background_extent`.

**2. Origo er ikke (0,0).** SVG-en bruker `svg_x = x − x0`, `svg_y = h − (y − y0)`. Fixturen
starter i (5000, 3000) med vilje — uten origo-subtraksjon havner u,v langt utenfor 0..1.
`origin_pt` bæres nå fra motoren via `S.planMeta` til `/plan/rooms`.

**3. Label-vinduet stod i PDF-PUNKTER og brakk på DWG.** En DXF i millimeter har 200 mm mellom
linjene, ikke 8,4 pt — så nummer og navn falt utenfor vinduet og rommene kom tilbake
**navnløse**, selv om grupperingen «fant» labels. Vinduet er nå i virkelige meter:
`0.8 m / meters_per_unit` gir 22,7 pt for PDF 1:100 og 800 mm for DXF i mm.

### $INSUNITS er en fordel DWG har over PDF

`method: 'insunits'`, `confidence: 1.0` — eksakt, og slår både tittelfelt og arealkryss. Derfor
står «Anbefalt» på plan-veien også for DWG.

### Målt på den syntetiske DXF-en

6 senterlinjer av 13 segmenter; **2 rom** (101 Stue 19,49 mot 18,5 ⚠, 102 Bad 18,86 mot 18,5 ✓);
dekning 96,8 % med 1 rest (møbelet); kalibrering `insunits` 0,001 m/enhet, tillit 1,0; alle u,v
innenfor 0..1.

020s feilskille består: **415** = ingen konverterer finnes, **400** = en fantes men klarte ikke
fila. `/import/pdf`, `/import/dwg` og `/import/dwg/background` er uendret og låst med tester.

---

## Rom fra planveggene: gjennomgang, romtype, «Ikke navngitt» — 2026-10-08

Prompt 049. Rommene fra vegg-sjekken inn i gjennomgangsskjermen, med navn og areal fra
tegningen.

### STEG 0 — to funn som halverte oppgaven, og ett som utvidet den

**0.1/0.2 Gjennomgangsskjermen og romtype-gjettingen finnes allerede.** `_reviewRenderList`
har redigerbart navn, redigerbart areal, advarsler med severity, slett, varmetype-velger,
bulk-rad og live-sum. Og `_pdfGuessRoomType` gjetter romtype fra navn. 049 er altså en ny
KILDE til skjermen, ikke en ny flate — målt mot de 16 romnavnene på Kenneths tegning traff
**11 av 16** allerede.

**0.4 `createRoom` kaller `pushUndo()` selv: 34 rom ga 34 angre-steg.** Målt. Kenneth måtte
trykket Ctrl+Z 34 ganger for å angre én import. Nå ett, med `_undoSuppress` (samme vern 030
brukte).

**Og hullet i min egen 046-prompt:** `/import/plan` tar en FIL og returnerer rom fra motorens
EGNE vegger. Etter at brukeren har rettet veggene er de rommene foreldet — og det er nettopp
det tilfellet som betyr noe, siden den ekte tegningen gir 0 rom før retting. Løst med et nytt
`POST /plan/rooms` i lumelo som lukker de redigerte veggene. Alternativet var en polygonizer i
JavaScript; den ville duplisert `detect_rooms` og brutt «rom-modellen er sømmen».

### Tre feil funnet ved å kjøre flyten, ikke ved å lese den

**1. `_reviewCommit` droppet rom uten varme helt.** Filteret var `r.heat`, så et «Lager», «BK»
eller «EL» ville aldri blitt et rom i prosjektet. Spec regel 4 sier det motsatte: de skal
navngis og merkes uten varme, så lista stemmer med tegningen. Fra planen tas nå alle rom med
geometri.

**2. «Legg til N rom»-knappen var grå.** `_reviewUpdateCount` teller `r.heat`, så en plantegning
der ingen rom hadde varme ga «Legg til 0 rom» og en deaktivert knapp — altså en lovlig
innlegging blokkert av telleren. Knappen viser nå «Legg til 3 rom i prosjektering (0 med
varme)».

**3. `_calcRoughFill(room, rr.calcType || 'foil')` ga folie til rom som uttrykkelig ikke skal
varmes.** `'none' || 'foil'` er `'foil'`.

### Romtypene — målt, ikke antatt

Av de 16 navnene falt fem til `other`: EL, Fellesareal, Lager, Garderobe, Boder beboere.
**⚠ Det finnes ingen «ingen varme»-romtype i `ROOM_TYPES`** — spec-en snakker om det som en
romtype, men appen modellerer det som `other` + `calcType:'none'`, og `other` er allerede uten
varme. Lager, bod og EL havnet derfor riktig ved å ikke matche noe; de står nå eksplisitt, så
en framtidig «Bodareal» ikke faller tilfeldig inn i en annen regel.

**Én ekte feilklassifisering ble funnet:** `BK` (bøttekott) ga `laundry`, som FÅR varme
foreslått. Rettet — `vaskesluse`/`vaskerom` beholder laundry.

### «Ikke navngitt»

Egen sammenleggbar gruppe nederst i romlista, i **begge** indoor-veiene
(`_renderIndoorPartContent` og `_renderFlatSidebar`; snø er utelatt med vilje). Standard lukket
når noe er navngitt, åpen når alt er unavngitt. Målt: å åpne eller lukke den flytter de
navngitte radene **0 px**. Etasje-badgen får «22 navngitt · 12 ikke navngitt» som tittel.

**«Anbefalt»-merket er flyttet** til «Finn vegger og rom automatisk» for PDF, nå som flyten
faktisk lager rom. Den gamle veien står igjen merket «Eldre vei».

### Målt ende til ende mot Kenneths ekte tegning

Via appens eget klientlag mot en lokal motor: 253 vegger, 34 labels, dekning 53,4 %,
kalibrering 1:100, på 198 ms. «Lag rom» gir 0 rom der — og da sier flyten ærlig fra
(«Veggene lukker ingen rom ennå — se de røde prikkene») i stedet for å åpne en tom
gjennomgangsskjerm.

Regresjon: `_planRegressionTest` 28 → 47 sjekker. **614 sjekker grønne i 17 batterier.**
046-sjekken «Lag rom krever minst én vegg» fanget selv at funksjonen ble `async`.

---

## Vegg-sjekk: motorens vegger oppå tegningen før de blir rom — 2026-10-08

Prompt 046, første i plantegning-serien. Kenneth: «La appen finne veggene, men la meg se og
rette dem før de blir rom.»

Bygget **før** motoren, med vilje: 020 bygde automatisk romgjenkjenning uten en sjekk-flate og
ga 590 «rom» som Kenneth kalte «rot». Vegg-sjekken er det som skiller denne serien fra 020, så
den må finnes før motoren kan vurderes. 046 kjører mot syntetisk utdata (`_planDevFixture`) og
definerer kontrakten 047/048 skal oppfylle.

### STEG 0 — fire målinger, to som endret prompten

**0.1 Hypotesen var historisk riktig, men utdatert.** 021b-funnet («bare én av tre innganger ble
rettet») holdt ikke lenger: alle fem rutene som skal gjennom valgdialogen gjorde det allerede
(lerret-slipp :27873, etasjerad :44130, `_importPlanToDraw` :53684, `_emptyDrop` :53756,
`_emptyPickImport` :53812). **Men jeg fant en sjette med samme navn som ikke gjorde det:**
høyreklikk-menyens «Importer plantegning» (:50369) gikk rett til `handleBgFile` — altså underlag
uten valgdialog, med nøyaktig samme ord som knappen som gir valget. Rutet om.
`_addBgToFloor`/`_replaceFloorBg`/`confirmAddFloorWithBg`/`openBgImportPanel` beholder sin egen
vei: de målretter en bestemt etasje-slot og skal med vilje bare legge et underlag.

**0.2 Prompten min sa verdens-cm. Det ville vært feil.** Målt: `bg.widthCm`, `heightCm`,
`originX` og `originY` endres ALLE etter at bakgrunnen er installert — av kalibreringen
(:42677), av «Flytt underlag» (:49090) og ved «Bytt plantegning» (:42374). Vegger i verdens-cm
ville drevet bort fra tegningen, stille, og først blitt synlig som rom i feil størrelse.
Planveggene lagres derfor **sidenormalisert** (u,v ∈ 0..1 av underlagsbildet, origo øverst til
venstre). Målt at det virker: samme vegg traff tegningen eksakt før kalibrering (121 cm bredt
underlag), etter kalibrering (2000 cm) og etter «Flytt underlag» (+500/+300) — og vegglengden
ble riktig 700 cm etter kalibrering.

**0.3** `S.bgs[floorId]`; `planWalls`/`planMeta` nøkles likt.

**0.4** `drawMode`-verdiene i bruk er `bg-calibrate`, `bg-straighten`, `mat-freehand`,
`skillevegg`, `dim`, `hindring`, `hindring-polygon`. `plan-review` er ledig, og `_editorIsEmpty()`
returnerer false når `drawMode` er satt, så tom-tilstanden slåss ikke med modusen.

### Funn under bygging: Ctrl+Z var en stille no-op

Live-testen viste at flytt, slett og tegn ikke kunne angres — og at mine tre påfølgende tester
derfor målte feil tilstand (snap-testen «bommet» fordi veggen allerede var flyttet). Rotårsak:
**`pushUndo` tok ikke snapshot av `S.planWalls`.** Det er nøyaktig samme hull `matPaths` og
`floatingDims` hadde, beskrevet i kommentarene rett over — tredje gang samme feilklasse. Lagt
inn i både `pushUndo` og `undo`, og låst med både en kildekode- og en atferdssjekk.

### Bygget

`S.planWalls` / `S.planMeta` per etasje, lagret i prosjektet. `drawPlanWalls()` kalles fra
`render()` — ikke som hale i `drawRooms()`, som 030 lærte at aldri kjører. Senterlinje i rav
(`#ffa726`, en farge som ikke finnes i arkitekttegninger) med halvtransparent bredde lik
veggtykkelsen, så treff/bom mot den svarte veggen under er synlig på en meters avstand. Røde
prikker på `leftovers`.

Verktøylinje: Flytt (dra, snap til motorens egne råsegmenter — ikke piksler) · Slett ·
Tegn (klikk–klikk, arver tykkelse) · Snap av/på · Dekning i % med gul advarsel under 90 ·
Avbryt · Lag rom. Esc avbryter påbegynt vegg, så modusen. Delete sletter valgt vegg.
Treff-toleransen er en parameter (10 px / 22 px på smal skjerm), samme mønster `nearMoveArrow`
og `hitVertexFreeDrag` bruker.

Dialogen fikk et tredje valg, «Finn vegger og rom automatisk», merket **Ny**. «Anbefalt» står
fortsatt på «La appen finne rommene» — det flyttes i 049, når flyten lager rom.

**046 lager ingen rom.** «Lag rom» validerer og logger kontrakten som går videre; 049 kobler den
til gjennomgangsskjermen.

Regresjon: ny `_planRegressionTest` med 28 sjekker. **595 sjekker grønne i 17 batterier**, tre
negative kontroller.

---

## Presentasjonslenken virket ikke: RPC-en returnerer en liste — 2026-10-08

Prompt 041. Kenneth: «Presentasjonsfunksjonen genererer en lenke, men den virker ikke. Jeg
kommer rett inn på dashbordet og ikke på prosjektet.»

### STEG 0

**0.2 — bevist uten å trenge et gyldig token.** Målt mot den deployede RPC-en:

```
get_present_project('finnes-ikke')  →  []      (en LISTE)
kundelenke_get('finnes-ikke')       →  null    (en skalar)
```

`supabase-migration-presentation.sql:27` definerer funksjonen som
`returns table (id uuid, name text, data jsonb)`, og en `returns table` kommer tilbake fra
supabase-js som `[{id, name, data}]`. `_presentLoadByToken` leste `data.data` rett på lista →
`undefined` → «fant ikke prosjekt» for et **helt gyldig token**. Innlogget: dashbordet. Kunde:
innloggingsskjermen. Hypotesen i prompten stemte.

**0.3 — fem rpc-kall.** `kundelenke_get` ×2 (`returns jsonb`) og `kundelenke_answer` ×2
(`returns boolean`) er skalarer og leses riktig. Bare `get_present_project` er en liste. 027 ble
skrevet riktig; det er samme felle som ble unngått der.

**Migrasjonen var kjørt** — RPC-en finnes og svarer, den returnerer bare feil form.

### Rettet

`const rad = Array.isArray(data) ? data[0] : data;` — tåler begge former, så
`supabase-migration-presentation-v2.sql` (`returns jsonb`, som `kundelenke_get`) kan kjøres når
som helst eller la være. Målt at begge former gir `true`, og at ukjent token og manglende RPC
fortsatt gir `false`.

**Dette rammet også 043s forslagslenke** — `?present=X&forslag=Y` går gjennom samme funksjon.
Målt at hele kjeden nå virker: presentasjon lastes, `kundeMode` blir `forslag`, bunnlinja kommer.

### Punkt 3 avdekket en andre stille feil

`_presentShareLink` la `update({present_token})` i en `try/catch` — men **supabase-js returnerer
`{error}` og kaster ikke**, så `catch` fanget aldri noe. En mislykket lagring ga ingen toast:
tokenet ble satt i `S.project`, dialogen åpnet seg, og lenken pekte på et token databasen aldri
fikk. Feilen leses nå av returverdien, tokenet ryddes bort, og toasten vises — verifisert med en
stubbet `{error}` (ingen dialog, toast «Kunne ikke lagre delelenke: column "present_token" does
not exist»). Lenken går til `varmeplan.no` som før (027 regel 8), bekreftet.

Regresjon: 12 nye sjekker i seksjon R, derav fire på atferd (begge RPC-former, ukjent token,
manglende RPC). **567 sjekker grønne i 16 batterier**, to negative kontroller. En av sjekkene
mine var først en tautologi med feil premiss — `_kundeLoadByToken` inneholder `Array.isArray`,
men for `asked_walls`, ikke for RPC-formen. Skrevet om til å telle rpc-kallene og hvor
array-vakten står.

---

## Kundesiden: fri hjørnedrag, én hengelås, ryddigere veggliste — 2026-10-08

Prompt 045.

### STEG 0 — tre målinger

**0.1 Fri drag var uoppnåelig i kundemodus.** `hitVertexFreeDrag` returnerte `true` i
gizmo-senteret, men grenen fantes bare i den innloggede mousedown-en — kundegrenen håndterte
`hitXArrow`/`hitYArrow` og falt ellers gjennom. Målt: klikk i senteret ga `_vdDragging: false`.
Markørkaskaden manglet den av samme grunn; 036 kunne ikke ta den med, for grenen fantes ikke.

**0.2 `_kundeHjorneSlipp` skrev allerede `{dx, dy}` på begge akser,** så fri drag kunne gjenbruke
den uendret. Ingen ny kode der.

**0.3 Panelet før:** 330 px bredt, **7 kolonner** (Vegg 70 · Før 40 · Nytt 60 · −/+ 44 · Δ 24 ·
Fast 40 · ↺ 22), radhøyde **34 px**, og «Fast» rommet **to** knapper på **17×17 px** — ↺ var
11×15. Tallfeltet var `type=number` med nettleserens stepper. Kommentar: `<input>`, 37 px.

### Etter

Tre kolonner (**Vegg · Mål (cm) · ±**), 44 px rader på både PC og telefon, alle fire knapper
28 px på PC og 44 px på telefon. «Før» og «Δ» er flyttet ned i «var 320 · +25»-linja under
navnet — det frigjorde 64 px bredde. Stepperen er skjult, scopet til `#_kunde-bar` så
hovedmodulen beholder sin. Kommentaren er en `textarea rows=3` som vokser til seks og så får
scroll.

Fri drag: senteret i hjørne-gizmoen starter `_vdConstraint:'free'`, markøren er `move`, og
X-/Y-pilene står. `hitVertexFreeDrag` fikk en valgfri toleranse (22 px på telefon, 14 som før
uten argument) — målt at en finger 20 px unna bommer med 14 og treffer med 22.

### Fire ting målingen endret underveis

**1. Hjørnet landet ikke på hele cm.** Prompten sa «snap som innlogget», men målt: `S.snap.grid`
er `false` på kundesiden, og `GRID` er **50 cm** — altså verken snap eller et brukbart snap for
en kunde som retter mål. Et fritt drag ga 536,5 cm. Nå rundes selve PUNKTET i slippet, ikke
deltaet, så `basis + delta` blir et helt tall uansett hvor basis ligger.

**2. Hjelpelinja ble kuttet.** 311 px tekst i et 300 px felt. «hjørne» og «veggen» er
underforstått; nå 300/300.

**3. Hjelperaden fikk radene til å hoppe 22 px** ved hvert veggvalg, fordi den bare fantes for
valgt vegg. 033-regelen er at alt ligger i DOM-en hele tiden; nå 0 px hopp i alle fire
overganger (ingen valg → vegg 1 → vegg 3 → avvalg).

**4. ⚠ Hjelpelinja løy — to ganger.**

*Først:* i et **perfekt rektangel** gir «fast start» og «fast slutt» **nøyaktig samme rom**.
`_applyWallLength` rapporterer ulik `movedEnd`, men 035 bevarer ankeret ved å translatere
polygonet tilbake, og for et rektangel er de to resultatene like opp til nettopp den
translasjonen. Målt identiske punkter på vegg 0, 1 og 2. I et L-rom og et skjevt rom er de
ULIKE på **hver eneste vegg** (L vegg 2: `579/450/200/50/300/408` mot `579/450/200/200/300/655`).
Panelet spør derfor først `_kundeLaasBetyrNoe()` og sier «Rettvinklet rom — begge ender gir
samme rom» når det er sant.

*Så:* beskrivelsen motsa seg selv i L-rommet — «Øvre høyre står fast — vokser **oppover**».
Årsaken var at punktet (579,200) ligger nøyaktig på midtlinja i L-ens omsluttende boks, så
`p.y > my` ble et terningkast. Enden beskrives nå relativt til **veggen**, ikke til rommet:
«Høyre ende står fast — vokser mot venstre».

### Hengelåsen

Én knapp per rad som veksler. `_kundeFastIdx` er den ene kilden — tegning, panel og veksling
leser den; før lå auto-oppløsningen inne i tegnefunksjonen, så en veksling fra 'auto' måtte
gjette hva tegningen viste. Fra 'auto' settes det motsatte av det auto viste, så det første
klikket alltid flytter låsen. Låsen på tegningen er 22 px med hvit ring og glir 150 ms når den
flytter seg. Offseten over hjørnet er én delt konstant (`_KUNDE_LAAS_DY`) — den gikk fra 16 til
20 px, og uten en delt konstant ville treffsonen blitt stående 4 px for lavt.

### Om tegneretningen

Kenneth spurte om det har noe å si at de alltid tegner fra nede til venstre og legger veggene
mot høyre. Svar: det er allerede tatt høyde for — `points[0]` er ankeret, og 035s `auto` holder
start-enden fast på en rettvinklet vegg. Verifisert i testen («auto på en rettvinklet vegg holder
STARTEN»). For et rektangel spiller det som nevnt ingen rolle; for L-rom gjør det det.

Regresjon: `_kundelenkeRegressionTest` + 23 sjekker i seksjon Q. **555 sjekker grønne i 16
batterier**, seks negative kontroller.

---

## Kundeforslag hos Cenika: Godkjenn/Avslå per rom → nytt utlegg — 2026-10-08

Prompt 044. Kenneth: «Vi får melding om at kunden ønsker endring, vi trykker godkjenn forslag,
og det endrer seg med layout og alt.»

### STEG 0

**0.1 Rydde-funksjonen er `_clearRoomProductCollections(roomId, keys)`.** Den tar en nøkkel-liste,
lar sonenes egne utlegg stå, rydder UI-valg og invaliderer cachene. Hindringer og soner ligger
ikke i `ROOM_PRODUCT_KEYS` og røres aldri. Gjenoppretting: `_restoreRoomProductSnapshot`, samme
som produktbytte-økta bruker.

**0.2 Retningen er ÉN delt global for alle tre typene:** `S.varmefolie.direction` + `dirExplicit`.
Kabel leser den (:12400), matte leser den (:13040), folie leser den (:5773). Ingen egne innganger.
`autoFillMatSerpentine` leser i tillegg `S.ui.selectedRoomId` — og `alert()`-er uten.

**0.3 `_fetchKundeStatus` hentet uten `mode`,** så et forslag-svar ville fått «✓ Mål mottatt».
**Og verre, funnet underveis:** `_kundeRefreshStatus` tok *første* levende lenke uansett modus.
Siden 043 lager en forslagslenke som lever i 90 dager, ville den ofte vært den nyeste — og
dermed skygget for et besvart mål-svar, som er det 028/037-panelet lever av. Modusene har nå
hver sin cache, og innen hver modus vinner et besvart svar over en åpen lenke.

### Bygget

Panelet «Kundeforslag» åpner seg selv via 037-mekanismen (mål først — de endrer geometrien et
forslag gjelder *i*). Per rom: Nå / Kunden foreslår / kommentar / [Godkjenn] [Avslå], pluss
«Godkjenn alle» og «Send svar til kunden». «Nå»-tallene regnes med samme `selectCableByPower`-
kandidat kunden så, ikke nye tall.

`_forslagGodkjennRom` **kaller** motorene, endrer dem ikke: setter retning via den delte globalen
(og tilbake etterpå), rydder scopet til produkttypen, kjører `autoFillCable` /
`autoFillMatSerpentine` / `autoAddStrips`. «Godkjenn alle» er ETT angre-steg. Feiler motoren
settes rommet tilbake og raden får ⚠.

Merker: forslag er **blått** «💬 Forslag fra kunde», godkjenning **grønn** «✓ Godkjent av kunde»,
mål uendret — og et prosjekt med begge viser begge, aldri blandet. Målt på fem tilfeller.

E-post: `forslag_answered` (anonymt, som `answered` — samme tre lag) og `forslag_svar` (utgående,
krever innlogging som `invite`, mottaker er alltid `invite_sent_to`, presentasjonstokenet hentes
server-side).

Migrasjon: mode-constraint + `approve_all_at`/`approve_all_name` (satt server-side av
`kundelenke_answer`, så kunden ikke kan datere sin egen godkjenning) + `applied_at`/
`applied_result` — 027/028 satte status til `applied` men lagret aldri HVA som ble gjort.

### To funn der min egen påstand var feil

**1. «Godkjenningen kan legge ut noe ulovlig» — delvis feil.** Jeg skrev vakten med 3400W/200m i
et 16 m² rom som bevis (CC 8 cm). Målt etterpå: InFloor 17T har `minSp` **5 cm**, så det er
lovlig etter produktreglene — 213 W/m² er urimelig, men ikke ulovlig. Vakten er fortsatt riktig
(den avviser alt pilene avviser, f.eks. 500W/29m med CC 55 cm > maxHard 50), men kommentaren som
påsto noe annet er rettet.

**2. En live-test besto av feil grunn.** `_forslagMatteProdukt` leste `mat_length_m`/`length_m` —
feltet heter **`mat_length_mm`**. Begge var `undefined` for alle matter, så
`undefined === undefined` ble sant og den plukket første produkt i katalogrekkefølgen. Live-testen
«bekreftet» EcoMat 60T 0.5×10m → 150T 0.5×10m fordi katalogen tilfeldigvis hadde den først.
Regresjonstesten avslørte at den egentlig ga 0.5×2m.

De fire 038-merkesjekkene feilet også — riktig av dem: 044 endret datakontrakten i
`_cachedKundeSvar` fra én rad per prosjekt til `{ maal, forslag }`. Oppdatert, og fire nye
sjekker lagt til for de nye merkene.

Regresjon: `_kundeforslagRegressionTest` 33 → 52 sjekker. **532 sjekker grønne i 16 batterier.**

---

## Kundeforslag: forslagskort i presentasjonen — 2026-10-08

Prompt 043. Kunden ser presentasjonen som før, trykker på et rom og kan si «OK som det er» eller
foreslå annet produkt / ønsket flateeffekt / retning. Ingenting tegnes om hos kunden, ingenting
skrives i prosjektet.

### STEG 0 — fire målinger, tre overraskelser

**0.1 Kortet var hover-drevet, ikke klikk.** `_presentHover` setter `presentRoomId` på hver
mousemove, så kortet forsvinner når musa forlater rommet. Et kort med piler, tallfelt og
kommentarboks kan ikke oppføre seg slik. I forslagsmodus velges rommet nå med **klikk**, hover
rører ikke valget, og kortet har fått et ✕.

**0.1b (funn, ikke bestilt):** kortet viste **`Artikkelnr` ubetinget** — altså til alle med en
presentasjons- eller kundelenke. Spec regel 2 forbyr artikkelnummer for kunden. Nå gatet på
`presentPublic`; den innloggede presentasjonen i appen beholder det.

**0.2 `selectCableByPower` gir alt som trengs** — `candidates[{productW, cc_cm, wm2, valid,
ccOverMax}]` + `below`/`above`. Ingen egen formel på kundesiden.

**0.3 Familiene oppfører seg ulikt — det styrer hele pilefunksjonen:**

| Familie | Antall | Varierer i | Piling |
|---|---|---|---|
| InFloor 17T (kabel) | 25 | lengde ved fast 17 W/m → effekt | over effekt |
| EcoMat (matte) | 57 | **60/100/150 W/m²** og lengde | over W/m² (3 valg) |
| FlexFoil (folie) | 8 | kun bredde, alle 60 W/m² | **ingen piler** |

**⚠ Og den som nesten gikk galt:** `getProductFamily('InFloor 17T 800W 47m')` returnerer **44**
produkter som **blander 17T og 10T** — kategori 2 inneholder begge, så den felles navneprefiksen
blir bare «InFloor». Pilene ville hoppet fra 17T til 10T, altså bytte av kabeltype, som spec-en
holder utenfor v1. Innsnevringen trenger ingen navneparsing: kabeltypen **er** `watt_per_m`
(målt: 17 W/m → 25 produkter, 10 W/m → 19). `getProductFamily` er urørt — Varmeplans eget
forslagspanel får fortsatt hele familien.

**0.4 `get_present_project` leverer hele `data`-jsonb-en**, ubeskåret. Designet beholder
prosjekthentingen på `?present=` og bruker `kundelenke_get` bare til lenkestatus, så
forslagslenka viser **ikke ett felt mer** enn en vanlig presentasjonslenke gjør i dag. At
presentasjonslenka i det hele tatt gir ut kundenavn m.m. i nyttelasten er notert i SPØRSMÅL.md
som egen sak.

### Bygget

Lenka er `?present=<present_token>&forslag=<token>`. Delingsdialogen fra 042 fikk avkryssingen
«Kunden kan foreslå endringer» (standard på); forslagslenka **gjenbrukes** per prosjekt, ellers
ville hver deling laget en ny rad og 044 ikke visst hvilken som gjelder.

Kortet: ▼/▲ mellom gyldige kandidater (ugyldige er med, men grå og hoppes over), ønsket
flateeffekt → nærmeste under/over med «Velg», retning (som nå / vannrett / loddrett), kommentar,
og «OK som det er» / «Foreslå endring». Grønn ✓ og gul ! tegnes på rommene fra `render()` —
ikke som hale i `drawRooms`, som 030 lærte at aldri kjører. Bunnlinje med «N rom OK · M forslag»
og Send, der navn er påkrevd.

**Målt og rettet underveis:** for kabel er «flateeffekt» og «W/m²» **samme tall** (W/m ÷ CC =
productW / nettoM², algebraisk identisk) — spec-en ber om begge fordi Kenneth sa det slik, men
50 og 50 ved siden av hverandre ser ut som en feil. Vises én gang. På telefon lå kortet oppå
«Send forslag» fordi jeg gjettet bunnlinja til 66 px; den er 74 — høyden leses nå av. ✕ var
30 px, nå 44 på telefon.

Migrasjon `supabase-migration-kundeforslag.sql`: **eneste** skjemaendring er CHECK-constrainten
på `mode`, som sto `in ('maal','tegn')` — et forsøk på 'forslag' ville feilet med 23514.

Regresjon: ny `_kundeforslagRegressionTest` med 33 sjekker. **509 sjekker grønne i 16 batterier.**
042s egen P-sjekk fanget at `_presentShareModal` fikk et nytt argument — den er strammet til å
handle om atferden, ikke argumentlista.

---

## Del presentasjon/kundelenke: ferdig hyperlenketekst med Kopier — 2026-10-08

Prompt 042 (serien Kundeforslag). Kenneth: «Jeg vil ha en fast tekst med lenken som jeg kan
kopiere — PRESENTASJON med kopierknapp bak — og lime inn i e-posten.»

**041 finnes ikke som egen prompt, men er oppfylt i substans.** Serien oppgir 041 som krav.
Verifisert: `supabase-migration-presentation.sql` har både `present_token` og
`get_present_project`, og hvert symbol 042/043 navngir ligger på *nøyaktig* det linjenummeret
promptene oppgir for `2147753` (9204, 9231, 6751, 6736, 22925, 26827, 22391, 5754). Promptene er
altså skrevet mot denne HEAD-en, og presentasjonslenka var der fra før. Ingenting mangler.

**Ny `_copyLinkRich(label, url)`** legger `text/html` (en `<a>` med teksten) og `text/plain`
(ren URL) på tavla samtidig, så Outlook/Gmail får en klikkbar lenke mens Notater får adressen.
`_copyLinkPlain` beholder ren-URL-kopieringen. Brukt begge steder: «Del presentasjon» og
kundelenke-modalen.

**«Del lenke» åpner nå en dialog** i stedet for å kopiere stille — Kenneth så aldri hva som havnet
på tavla, og kunne ikke endre teksten. Lenketeksten står i et felt som *er* forhåndsvisningen
(blå, understreket), så det du ser er det som kopieres. Kundelenke-modalen fikk samme rad over
adressen; URL-radens knapp heter «Kopier adresse», ikke «Kopier», så to knapper ved siden av
hverandre ikke har samme navn og ulik virkning.

### To feil funnet ved måling, ikke ved lesing

**1. Klikket gjorde ingenting, helt stille.** En JSON-serialisert URL limt rett inn i et
`onclick="…"` gir DOBLE anførselstegn, og HTML-parseren avslutter attributtet der. Ingen
feilmelding, ingen toast. Ny `_jsStr()` escaper dem til `&quot;`. Dette rammet fire knapper.

**2. Fallback-kjeden var brutt.** `clipboard-write` er `denied` i Claudes nettleserrute (målt), så
begge skrivemåtene feilet — og da falt koden ned på `window.prompt`, som **selv kaster** der
prompt ikke finnes. Brukeren fikk en uhåndtert promise og ingenting. Den gamle kundelenke-knappen
hadde ikke engang en `.catch`. Siste utvei er nå `_copyManuelt()`: merker adressen i feltet og
sier «trykk Ctrl/Cmd+C». Kaster aldri.

**Ikke testet her:** selve innlimingen i Gmail/Outlook. Nettleserruta nekter
`clipboard-write`, så nyttelasten er verifisert mot en stubbet utklippstavle (riktig `text/html`
og `text/plain`), men den ekte limingen må Kenneth gjøre.

**Fallgruve notert:** `node --check` fanger **ikke** `await` i en ikke-async funksjon — i sloppy
mode parses det som et kall til noe som heter `await`. `_kundelenkeRegressionTest` er nå `async`
og må kalles med `await`.

Regresjon: **476 sjekker grønne i 15 batterier** (14 nye i seksjon P), tre negative kontroller.

---

## Prosjektlista: hvit stripe langs høyre kant borte — 2026-10-08

Kenneth etter 038: «ta bort hvit bakgrunn og gjør det likt som resten.»

038 ga den sticky handlingskolonnen `background:var(--surface)`. Målt: **alle andre celler i
tabellen er gjennomsiktige** (`rgba(0,0,0,0)`) helt opp til `#project-list-screen`, som er
`var(--bg)` = `rgb(240,244,248)`. `--surface` er hvit i lys modus — derav stripa.

Cellen *må* være ugjennomsiktig, for den ligger sticky over innhold som scrolles under den. Den
maler nå `var(--bg)`, altså nøyaktig det som ligger bak tabellen. Målt likt i begge temaer
(lys `rgb(240,244,248)`, mørk `rgb(13,14,16)`), og den dekker fortsatt innholdet når tabellen
scrolles. Hover legges på som samme sjikt raden selv bruker
(`rgba(34,211,238,.04)` over `var(--bg)`), så det ikke oppstår en skjøt midt i raden.

To nye N-sjekker, begge negativt kontrollert. Regresjon: **462 sjekker grønne i 15 batterier**.

---

## Kundesiden: «Instruksjonsvideo»-knapp med kapitler — 2026-10-08

Prompt 039. Kenneth: «Jeg ønsker å ta opp skjermen min og vise hvordan kunden endrer målene …
en egen knapp oppe til høyre.»

**STEG 0.2 — CSP:** det finnes ingen. `vercel.json` har bare en redirect, og `index.html` har
ingen `Content-Security-Policy`-meta. Ingen `frame-src` å utvide; iframen slipper gjennom, og
konsollen er ren ved åpning.

**STEG 0.1 — knappen skulle «til venstre for PDF-knappen», men det er ingen PDF der.** Verre:
den var der, og skulle ikke vært det. 030 la inn `const _kunde = !!(S.ui && S.ui.kundeMode)` i
`_presentRenderBar()` for å skjule PDF og KPI-ene på en kundelenke — men `S.ui.kundeMode` ble
satt på linja **under** `_presentEnter(true)`, som allerede hadde tegnet baren. Målt i live
HTML: kundesiden viste «⬇ PDF» og «1 Rom · 0.0 m² · 0 W». Flagget settes nå først. Uten den
rettelsen ville videoknappens egen gate hatt nøyaktig samme feil.

**Knappen havnet i `.pb-kpis` i `#present-bar`** — eneste knapp der på en kundelenke, 16 px fra
høyre kant. «▶ Instruksjonsvideo» på PC, «▶ Video» på telefon.

**Videoen ligger ikke i repoet.** `KUNDE_VIDEO` tar enten `youtubeId` (bygges inn via
`youtube-nocookie.com`) eller `src` (Supabase Storage → `<video>`); begge veiene er kodet og
målt. Kenneth fyller inn id og kapitteltider når opptaket er klart — **tom konfigurasjon gir
ingen knapp, ingen boble.** Det er tilstanden i repoet nå.

**Ingen autoplay ved åpning.** Et kapittelklikk laster iframen på nytt med `start=t` **og**
`autoplay=1` — da er avspillingen kundens egen handling, ikke sidens. `playsinline` alltid med.

Boblen «Ny her? Se videoen (1 min)» vises én gang per nettleser (`localStorage`
`kunde_video_sett`), forsvinner ved klikk eller etter 8 s. Flagget brennes **ikke** når det ikke
finnes en video — ellers ville boblen vært oppbrukt den dagen id-en legges inn.

Esc fanges i capture-fasen så appens egen Esc ikke fyrer bak modalen, og lytteren ryddes ved
lukking. Lukking målt på alle fire veier: ✕, Esc, klikk utenfor, og at klikk **inne i** boksen
ikke lukker.

**E-postlinja ble tatt med** (7 linjer, budsjettet var 15): invitasjonen får «▶ Se
instruksjonsvideo (1 min)» når secreten `KUNDE_VIDEO_ID` er satt. Id-en leses ved hvert kall, så
videoen kan byttes uten ny deploy.

Regresjon: **460 sjekker grønne i 15 batterier** (17 nye i seksjon O). Negativ kontroll på alle
seks kildekode-påstandene — den første versjonen av «boblen sjekker video før localStorage»
besto av feil grunn (`indexOf(a) < indexOf(b)` er sann også når `a` mangler, −1 < n); strammet
til å kreve at begge finnes.

---

## Prosjektlista: «Venter på mål» (oransje) og «Mål mottatt» (grønn), bredere liste — 2026-10-08

Prompt 038. Kenneth ville se forskjell på en kundelenke som er **sendt** og en som er **besvart**,
og at søppelbøtta vises helt.

**⚠ STEG 0.1 — tallene.** Tabellen trengte **1146 px**, lista ga **1100 px**: **46 px manglet**, og
sletteknappen lå **38 px utenfor** kanten. Etter at merkene kom til vokste behovet til
**1222 px** (min-content), så bredden ble satt til **1280 px** (1280 − 48 px padding = 1232).
**1240 px holdt ikke** — det ga 1192 px innhold og 30 px overflow; målt, ikke gjettet.

**`--dash-max-w` ble brukt, ikke en egen variabel.** Første forsøk var en egen `--pl-max-w` på
tabell-wrapperen — den gjorde ingenting, fordi både `.dash` og `.dash-section` kapper på
`var(--dash-max-w)` lenger opp. Variabelen settes nå på `#project-list-screen`, så den gjelder
bare lista; resten av appen er urørt.

**Funn underveis: sticky-knappen virket ikke.** `.pl-td-actions{position:sticky;right:0}` hører
til `.pl-table-wrap`, men wrapperen ble aldri scrolleren: fanepanelene er flex-barn av `.dash` og
krympet ikke under tabellens min-content. Ved 1000 px scrollet **hele dashbordet** sidelengs, og
søppelbøtta havnet på x=1087 i et 1000 px vindu. `.dash > div[id^="dash-tab-content-"]
{width:100%;min-width:0}` flytter scrollingen inn i tabellen — da fungerer sticky, og dashbordet
står stille. Overskriftscella fikk samme sticky, ellers sklir «Oppdatert» inn under knappene.

**Luft målt, ikke anslått.** `padding-right:16px` ble ignorert: `.pl-td` er definert senere i
arket og vant med lik spesifisitet — faktisk luft ble 8 px. `.pl-table .pl-td-actions
{padding-right:24px}` gir de målte **24 px** ved både 1280 og 1000 px.

**Én spørring, to statuser.** `_fetchKundeAnswered` → `_fetchKundeStatus`: henter `open` og
`answered` i samme kall. En **utløpt `open` teller ikke som «venter»** — kunden kan ikke svare på
en død lenke. Har et prosjekt flere lenker vinner `answered`, ellers nyeste `created_at`.
Sidebaren bruker nå samme fargelogikk (`#22c55e` grønn / `#f0b232` oransje).

Merket overlever et langt prosjektnavn: `.pl-proj-line` gjør navnet krympbart (`flex:0 1 auto`)
og merket fast (`flex:0 0 auto`) — målt at navnet kuttes og merket står helt.

Regresjon: **443 sjekker grønne i 15 batterier**. De fire nye N-sjekkene ble negativt
kontrollert — hver blir rød når sin regel fjernes.

---

## Kundesvar: status hentes ved prosjektåpning, panelet åpner seg selv — 2026-10-08

Prompt 037. Kenneth: «Går jeg rett inn på prosjektet som har merknaden, får jeg ikke opp
handlingsboksen … Jeg må gå inn på lenken i e-posten — og den åpner seg i en ny fane. Tungvint.»

**Det var ikke panelet som manglet — statusen ble aldri hentet.** `_openCloudProject` kalte
`_loadFromSupabase` → `_restoreProject` og var ferdig. 029-kommentaren påsto at den «ender med
`_kundeRefreshStatus()` via renderSidebar-kjeden», men `_renderSbProjInfo` **leser** bare
`_kundeLinkCache` — den henter ingenting. Merket i prosjektlista kom fra en egen, lett spørring
og var riktig hele tiden; det var derfor merknaden syntes mens panelet uteble.

**⚠ STEG 0.1 — stale cache bekreftet, og den var verre enn «panelet mangler».** Målt: åpnet man
prosjekt A via e-postlenken og deretter prosjekt B fra lista, viste B fortsatt
«✉ Svar fra kunde (8. okt., Ola)» — **As lenke**. Hadde Kenneth trykket «Gå gjennom» der, ville
han fått As svar presentert mot Bs rom.

**STEG 0.2 — elleve steder setter `_supabaseProjectId`**, men alle ti innlastingsveiene (fil,
versjon, gjenoppretting, konvertering, sky, presentasjon) går gjennom **`_restoreProject`**.
Nullstillingen hører derfor hjemme der, i det ene punktet — ikke spredt på elleve.

**STEG 0.3 — e-postknappen har ingen `target`**, så den arver mottakerens standard. Ny fane er
e-postklientens valg, ikke vårt. Punkt 2 løser uansett det Kenneth ba om: han trenger ikke
lenger gå via e-posten.

**Dette er gjort:**
- `_restoreProject` nullstiller `_kundeLinkCache` og `_kundeReviewShownFor`.
- `_openCloudProject` henter statusen (`await`) og kaller `_kundeMaybeOpenReview()`.
- `_kundeMaybeOpenReview` åpner panelet kun ved `status === 'answered'`, og **én gang per
  åpning** — etter Lukk kommer det ikke tilbake, men raden «✉ Svar fra kunde — Gå gjennom» står
  igjen i sidebaren som veien tilbake. Åpnes prosjektet på nytt, vises det igjen.
- E-postveien bruker nå nøyaktig samme kode; dens eget `_kundeRefreshStatus`-kall og den
  feilaktige 029-kommentaren er fjernet.
- Merket i lista har ingen egen klikkvei — det bobler til radens `_openCloudProject`, så
  punkt 4 i prompten var allerede dekket.

**⚠ Fjerde gang på én dag gikk jeg i inverterings-fella** i regresjonstestene:
`check(navn, false, betingelse, …)` feiler nettopp når koden er riktig, fordi tredje argument
*er* påstanden. Løsningen er ikke «vær mer forsiktig», men et eget navn: ny `checkIkke(navn,
betingelse, fikk)` finnes nå i begge testbatteriene, så en negativ påstand kan skrives som det
den er.

**Regresjon:** 15 batterier grønt, **428 sjekker**.

---

## Kundesidens musemarkør identisk med hovedmodulen — 2026-10-08

Prompt 036. Kenneth: «Normalt en pil. Kryss når den føres over en vegg. Hånd over et hjørne.
Pil begge veier i retningen et objekt kan flyttes når den føres over gizmoene.»

**STEG 0.1 — hovedmodulens hale, ordrett:**

```js
if (_hovWallHit?.wallId) canvas.style.cursor=WALL_CURSOR;    // vegg
else if (_hovWallHit?.roomId) canvas.style.cursor='default'; // romflate
else canvas.style.cursor='default';
```

`WALL_CURSOR` er en SVG-data-URL med et hvitt kryss og svart kontur. `grabbing` settes av
mousedown når panoreringen starter, ikke i kaskaden.

**STEG 0.2 — kundesiden før endringen:** tomt lerret `grab`, over vegg `pointer`, romflate
`grab`. Tre avvik, nøyaktig som prompten beskrev.

**Endret:** hvilestillingen fra `'grab'` til `'default'`, og veggtreffet fra `'pointer'` til
`WALL_CURSOR` — samme konstant som hovedmodulen, ikke en kopi. `grabbing` måtte ikke flyttes;
den settes allerede riktig av present-grenens mousedown. Men pan-*slipp* satte `'grab'` for
begge moduser, så der skilles det nå: ren presentasjon er pan-bare og beholder hånd, mens
kundesiden er en editor og går tilbake til pil. Samme i `_kundeGizmoSlipp`/`_kundeHjorneSlipp`
og ved innlasting, så markøren er pil fra første frame og ikke først etter at musa er flyttet.

**Målt etter endringen, kundesiden mot innlogget på samme rom — identiske i alle fem
sammenlignbare tilfellene:**

| Over | Begge |
|---|---|
| Tomt lerret | pil |
| Vegg | kryss + glød |
| Romflate | pil |
| Hjørne | hånd |
| Mens man panorerer | knyttet hånd, pil etterpå |

Gizmoene (som ikke finnes i hovedmodulen på samme måte): vegg-pil `ns/ew-resize` etter veggens
retning, hjørne-X `ew-resize`, hjørne-Y `ns-resize`, hengelås hånd.

**⚠ To måleartefakter og én ekte feil underveis:**
- **Lerretet var 0×0** ved første måling (headless-fella), så «alt gir grab» var ugyldig.
  Skjermbilde først tvinger layout.
- **Panelet gikk fra bunnark til sidepanel** mellom oppsett og probe, så lerretet krympet fra
  1280 til 950 og alle `w2s`-koordinatene pekte feil. Målingen må skje etter at layouten har
  satt seg.
- **Ekte feil:** merkemodusens markør lå inne i kundemodus-vakten, men merkemodus kjører for
  *innlogget* bruker — så den kjørte aldri, og hovedmodulens kaskade ga kryss der det skulle
  være hånd. Flyttet øverst i mousemove.

**Regresjon:** `_kundelenkeRegressionTest` måtte fjerne SEG SELV fra høystakken — dens egne
regex-strenger inneholder mønstrene den leter etter (`_cur = 'grab'`, `const WALL_CURSOR = `),
så den talte 3 der svaret er 0. Samme felle som i `_edgeMailRegressionTest`. 15 batterier
grønt: **416 sjekker**.

---

## «Be kunde om mål»: knappen først, så alle mål eller utvalgte vegger — ingen balanse-advarsel for innlogget — «Tegn selv» parkert — 2026-10-07

Prompt 034. Kenneth: «Jeg trenger ikke advarsel om at rommet ikke går opp — det forstår jeg selv …
Jeg ønsker å kunne trykke på en knapp, da kan valgene komme opp … Å tegne rommet selv tenker jeg
er uaktuelt i denne settingen.»

**Rekkefølgen er snudd.** Før måtte man merke vegger via kontekstmenyen *først*, så trykke
knappen. Nå kommer knappen først, og modalen gir to valg:

| Valg | `asked_walls` | Kundesiden |
|---|---|---|
| **Sjekke alle mål** (standard) | `[]` | ingen røde vegger, vanlig rekkefølge, «Sjekk alle mål og rett det som er feil» |
| **Bare utvalgte vegger** | de merkede | røde «?» først, «De røde veggene er de vi er mest usikre på — men du kan rette alle» |

«Merk vegger på tegningen» lukker modalen og starter en **merkemodus**: banner øverst med teller,
klikk på vegg toggler, Esc = ferdig, Avbryt gir utgangspunktet tilbake uberørt. Den bruker
`toggleWallUncertain` — **samme setter som kontekstmenyens «⚠ Usikkert mål»** (STEG 0.2), ikke en
parallell vei inn i `room.uncertainWalls`. 0 merkede ved «Lag lenke» gir en toast i stedet for en
tom lenke.

**STEG 0.1 — hva som ble fjernet og hva som står:**

| Fjernet (innlogget) | Står |
|---|---|
| `#wbw-balance` i markupen og `_wbwUpdateBalanceLine` som fylte den | `_roomAxisBalance`, `_axisBalanceText`, `_axisBalanceSuspectWalls` som **funksjoner** |
| `_wbwBalanceToast` ved lukking av WBW | Kundesidens ene stille linje |
| `_markAxisAndToast` + `markAxisWallsUncertain` — de fantes bare for toastens «Merk veggene»-knapp | 028-panelets visning av **kundens** tall |
| En død ctxbar-gren der `_txt` var hardkodet `null` | Kontekstmenyens «⚠ Usikkert mål» |

Verifisert med Kenneths egen skisse fra 07.10 (lukkevegg 941 cm fra start, maksimalt ubalansert):
**ingen linje, ingen toast, ingenting som nevner balansen** — og rommet lukkes som før.

**«Tegn selv» (030) er parkert**, ikke slettet. `KUNDE_TEGN_ENABLED = false` skjuler valget når
en *ny* lenke lages; `_kundeLoadByToken` åpner fortsatt eksisterende tegn-lenker med alle fire
verktøyene, så ingen utsendt lenke brytes — verifisert. Grunnen er Kenneths: å be kunden tegne
rommet er uaktuelt i denne settingen. Erstattes senere av «elektriker legger inn mål i Varmeplan
og sender forespørsel» (egen sak i Notion).

**Regresjon:** testen som sjekket at WBW-toasten var gatet på kundemodus er snudd — den sjekker nå
at toasten og de to hjelpefunksjonene er **borte**, at `#wbw-balance` ikke finnes, og at
`_roomAxisBalance`/`_axisBalanceText` likevel er beholdt. 15 batterier grønt: **411 sjekker**.

---

## Sett vegglengde: riktig ende flytter seg — skjev nabo rettes opp — 2026-10-07

Prompt 035. Kenneth: «Jeg ønsker å endre lengden på en vegg slik at det blir vinkelrette hjørner.
Det som skjer feil nå, er at feil vegg følger etter … Det funker ok hvis jeg markerer hjørnet og
drar, men ikke hvis jeg taster riktig lengde eller bruker pilene.»

**STEG 0 — målt på Kenneths eget rom** (`P0(0,0) P1(579,0) P2(579,200) P3(379,200) P4(379,400)
P5(79,400)` — topp 579, bunn 300+200, venstrevegg 407,7 skjev):

| | Før | Etter |
|---|---|---|
| `_applyWallLength(room, 0, 500)` | V3 krympet **200 → 121**, V6 sto på **407,7** | V3 står på 200, V6 ble **400 og loddrett** |
| Hjørnevinkler | **helt uendret** (78,8° / 101,2°) — skjevheten ble flyttet, ikke rettet | alle seks **90°** |

Hjørnevinkelen måles mellom de to kantene som møtes der, altså 78,8° ved P0. Promptens «101°» er
supplementvinkelen til samme hjørne; avviket fra 90° er 11,2° uansett konvensjon.

**De to blindsonene i 028s vindu-regel.** Den flyttet (1) alltid slutt-enden, aldri start-enden,
fordi `points[0]` er ankerpunkt — og Kenneths vegg *er* vegg 0, så det var nettopp start-enden
som måtte flytte. Og den bevarte (2) alltid naboveggen, mens det er nettopp den skjeve naboen som
skal endre seg. Dra-hjørnet virket fordi det flytter **ett** punkt; det er den operasjonen tasting
og piltaster også trengte.

**Nå velges ende og metode av geometrien:**
- Hjørnet i enden som flyttes er **rett** (90° ± 1°) → **vindu** som før: to punkter, vegg i±2
  absorberer, rommet forblir rettvinklet.
- Hjørnet er **skjevt** → **ett punkt**: bare endepunktet flyttes langs veggens retning.
  Naboveggen endrer vinkel og lengde, ingenting annet rører seg. Samme operasjon som hjørne-draget.

`'auto'`: begge rette → slutt-enden med vindu (dagens oppførsel). Ett skjevt → flytt det, med
ett-punkt. Begge skjeve → regn begge kandidatene og velg minst samlet vinkelavvik; uavgjort gir
slutt-enden, så valget er bestemt. Verifisert på et asymmetrisk trapes: 33,3 mot 35,3, og `auto`
valgte det beste.

**Ankerpunktet via translasjon.** Flyttes start-enden av vegg 0, berøres `points[0]`. Løsningen
er å utføre flyttingen og translatere hele polygonet tilbake. Translasjon endrer verken lengder
eller vinkler, og rommets plassering mot nabo-rom og underlag står. 028s «for få vegger»-gren er
dermed fjernet.

**⚠ Men translasjonen alene ga en regresjon.** Med den blir forover- og bakover-vinduet
likeverdige *opp til posisjon* — og da ville jeg alltid valgt forover. Målt: L-form vegg 4 og 5
ble `450/200/200/120/250/320` mot 028s `400/200/150/120/250/320`. Det er to gyldige, men ULIKE
polygoner. Derfor følger `'auto'` nå 028s vindu-preferanse slavisk (forover med mindre det rører
`points[0]`, da bakover), mens et eksplisitt brukervalg bruker sitt vindu og lar translasjonen
ordne ankeret. **Alle 10 tilfellene fra 028 er bit-for-bit identiske.**

**Brukeren kan overstyre.** Ny «Fast»-kolonne i 033-tabellen med to låseknapper per rad
(`🔒⟶` fast start / `⟵🔒` fast slutt), og en hengelås på tegningen ved den enden som står fast —
også i `'auto'`, så kunden ser hva som *kommer* til å skje før han endrer noe. Klikk på den andre
enden flytter låsen. Valget lagres per vegg, følger med i svaret (`answer.walls[].fixedEnd`) og
brukes av 028s «Bruk» og «blir»-kolonne, så Kenneth får samme rom som kunden så.
Fire produksjons-kallsteder fikk `opts`.

**028s konfliktlogikk justert.** «Motstående vegger er bundet til hverandre» gjelder bare i et
*rettvinklet* firkantrom. I et skjevt rom er de ikke koblet, og et gjennomsnitt ville vært en
oppdiktet sammenheng. Nå gatet på `rectilinear`; verifisert at snittet fortsatt brukes i et
rektangel og aldri i et trapes.

**To feil funnet i skjermbildet:**
- **Balanselinja sa «Skrå vegger» om et rom som nettopp var blitt rettvinklet.** Den regnet på en
  kjede lagt ut langs *originalens* retninger (032-arven). Nå måles resultatet, som 033 §2 ba om:
  rettvinklet → «✓ Målene går opp», skjevt → ingen oppgjørssjekk (med vilje — et skjevt rom kan
  være helt riktig).
- **V6 ble vist som om kunden satte den selv** (grønt felt, aktiv ↺) enda den bare fulgte etter.
  Nå skilles kundens eget tall fra en følge-endring.

**Alle tre veiene gir samme resultat**, målt: tast 500, 79 × ArrowDown, og 79 klikk på «−».
033-regelen holder med den nye kolonnen: **0 px hopp** ved veggvalg, låseklikk og tastet tall.

**Regresjon:** `_kundelenkeRegressionTest` 166 → 185 sjekker. 15 batterier grønt: **409 sjekker**.

---

## Kundesiden: hjørner kan flyttes, markør som i Varmeplan, panelet som fast tabell — 2026-10-07

Prompt 033, etter 032. Kenneth: «Ønsker å kunne flytte hjørnene også … markør som endrer seg når
den føres over vegger … Venstre bar ser litt rotete ut.»

**STEG 0 — tre målinger:**
1. **Markør-kaskaden var gatet** i kundemodus. Den innloggede har 20+ grener (rom-gizmo, folie,
   kabel, matte, labels). Kunden har fått nøyaktig fem: hjørne-X-pil, hjørne-Y-pil, vegg-pil,
   hjørne, vegg — ellers `grab`/`grabbing`. Samme funksjoner, samme markører.
2. **Hjørne-drag i Varmeplan, målt i den innloggede editoren:** hjørne 0 flyttet 50 cm i X på et
   400×320-rom gir vegg 0 = **449,9** og vegg 3 = **323,9 cm skrå** (−98,9°), `rectilinear:false`.
   Det er oppførselen Kenneth ber om — rette vinkler tvinges *ikke*.
3. **Panelets «rot», kvantifisert:** å velge en vegg flyttet **hver rad 342 px nedover** (hintboksen
   dukket opp) og tallfeltet **59–79 px sideveis** (−/+ kom til). Å taste et tall flyttet feltet
   79 px igjen («var N ↺»). Etter 033: **0 px på alle tre målene.**

**To lag, og hvordan de ble forsonet.** `_kundeState` har nå både vegglengder og
`vertexDelta[roomId][vertexIdx] = {dx, dy}`. `_kundeRebuildRoom` regner alltid
**original → vegglengder → hjørne-deltaer**, i den rekkefølgen. Da er resultatet det samme
uansett hva kunden gjorde først — målt: tre operasjoner i to ulike rekkefølger gir identiske
punkter.

Men et tastet tall på en vegg som grenser til et flyttet hjørne ville da ikke stemt, siden
deltaet legges på etterpå. **Valget:** etter begge lag måles hver vegg kunden ga et tall. Er
nøyaktig **ett** av endepunktene flyttet, justeres det punktets posisjon langs veggens egen
retning så lengden blir det kunden tastet — *tallet gjelder*. Er **begge** flyttet, kan tallet
ikke oppfylles uten å overstyre kundens eget hjørnevalg; da står avviket igjen og **vises**:
«⚠ Du ba om 5,00 m, men hjørnene gir 5,04 m». Samme prinsipp som 028 — et avvik skjules aldri.

**Svaret sier nå hvem som er fasit.** `answer.geometryMode` er `'points'` når kunden har flyttet
et hjørne (rommet kan da ikke uttrykkes som vegglengder) og `'walls'` ellers. I punkt-modus får
028-panelet én knapp — «Bruk kundens rom» — som erstatter polygonet eksakt; avkryssingen og
bunnknappene for vegg-innarbeiding er borte, med forklaringen «Kunden flyttet hjørner — hele
rommet brukes». Verifisert: resultatet er punkt for punkt identisk med kundens, og ett Ctrl+Z
angrer alt.

**Panelet er nå en tabell** med faste kolonner — `Vegg | Før | Nytt | −/+ | Δ | ↺` — der −/+ og ↺
alltid står i DOM-en (grå når de ikke gjelder) og hintlinja alltid er én linje høy. Hjørne-rader
har fast plass («Ingen hjørner flyttet» når tom), og naboveggene til et valgt hjørne merkes ◆.

**Fem feil funnet ved måling:**
- **`drawVertexGizmo` lå inne i `drawTransformGizmo`** — som 032 stengte for kunden. Trukket ut
  som egen funksjon, kalt fra begge. Posisjonene (18/84 px) må følge `hitXArrow`/`hitYArrow`.
- **`punktModus` ble brukt før den var deklarert** — panelet kastet «Cannot access before
  initialization» for *ethvert* svar. Fanget live, ikke av en test.
- **Bunnknappene «Bruk valgte/alle mål» sto igjen i punkt-modus** selv om avkryssingen var
  deaktivert — de ville gitt et annet rom enn kunden så.
- **«Vegg 2 ?» ble kuttet til «Vegg …»** — først på PC, så på telefon der de to 44 px-knappene
  spiser 88 px alene. Tallkolonnene strammet inn begge ganger.
- **«Tilbakestill alt» var usynlig i lyst tema** — jeg brukte hvit-alfa som deaktivert farge.
  Nå `opacity` på `var(--muted)`.

**Innlogget bruk er uendret**, verifisert etter endringene: hjørne-drag gir fortsatt 449,9/323,9,
rom-gizmoen er der, undo-steg legges til, kundepanelet finnes ikke.

**Regresjon:** `_kundelenkeRegressionTest` 140 → 166 sjekker. 15 batterier grønt: **390 sjekker**.

---

## Kundesiden: sidepanel, veggvalg, piltaster og gizmo — tegningen følger målene — 2026-10-07

Prompt 032. Kenneth: «Siden kunden får opp ved å trykke på lenken er ikke så god … Fyll inn mål
kan komme som bar på venstre side slik vi har det i Varmeplan i dag — da blir canvas større …
Valgt vegg må tydelig markeres.» Erstatter 027s «geometrien tegnes ikke om på kundesiden»;
spec regel 2 står: alt skjer lokalt i kundens nettleser til «Send inn».

**STEG 0 — tre målinger:**
1. **Bunnarket tok 53 % av vindushøyden** (det startet på y=336 av 720). Klagen er målt, ikke
   antatt. Lerretet er nå fullhøyde og mister bare 330 px i bredden — **77 % mot 47 % før**.
2. **Fem gates på `S.ui.present`:** mousedown, mousemove, mouseup, keydown, pluss
   `_ctrlSCanSave` og `_editorIsEmpty`. De fire første er åpnet for `kundeMode === 'maal'`;
   lagringsgaten er bevisst urørt.
3. **`_applyWallLength` virker på et kunderom:** eksakt resultat, `points[0]` urørt, **null
   lagringskall og null undo-steg**. Den er en ren geometrifunksjon, så tegningen kan følge
   tallene uten at noe skrives.

**Gizmo → vegg-rad-mappingen, som prompten ba om:** `drawMoveArrows` tegner pilene *vinkelrett*
på den valgte veggen, og draget flytter veggen sidelengs. Den valgte veggens **egen** lengde
endres derfor ikke i det hele tatt — det er de to **naboveggene** (idx−1 og idx+1) som blir
lengre eller kortere. Målt: drag 50 cm utover på vegg 0 i et 400×320-rom ga vegg 1 og 3 fra
320 → 370, mens vegg 0 sto på 400. Panelet viser derfor to rader endre seg når man drar i én
pil, og det er riktig.

**Alt regnes FRA originalen.** `_kundeState.original` er en dyp kopi av tegningen Kenneth sendte;
`_kundeRebuildRoom` bygger rommet på nytt fra den pluss alle kundens tall, via 028s
`_kundeApplyPlan` + `_applyWallLength`. Da er rekkefølgen likegyldig, to endringer av samme vegg
kan ikke stable seg, og «Tilbakestill» er bare å fjerne tallet.

**⚠ Fire feil funnet ved måling, alle i mitt eget arbeid:**
- **Fem piltastetrykk ga +1 cm, ikke +5.** `compWalls()` deler ut **nye vegg-id-er** ved hver
  ombygging, så `S.ui.selectedWallId` pekte på en vegg som ikke fantes lenger og
  `_kundeValgtVegg()` ga null etter første trinn. Id-ene arves nå fra originalen per indeks.
- **Piltastene var ubrukelige i praksis.** Første utgave hoppet over alle inputfelt — men etter
  Enter flytter fokus seg til neste veggs tallfelt, så kunden står *alltid* i et felt.
  Veggens eget felt er nå med; vi tar over fra nettleserens number-stepper, som bare endret
  tallet uten å oppdatere tegningen (`change` fyrer først ved blur).
- **Tre verktøy fra den innloggede editoren lakk inn:** `#wip`-boksen («VEGG · ID · Lengde ·
  Vinkel» med en **«✕ Avslutt»**-knapp som ville tatt kunden ut av siden), rommets
  transform-gizmo (flytter/roterer hele rommet), og minikartet. `present-mode` skjuler ingen av
  dem — målt i nettleseren. Ny `body.kunde-maal`-klasse stenger dem.
- **Cyan var feil markeringsfarge.** Et valgt rom tegnes allerede med cyan kontur — 16 782
  cyan-piksler på lerretet — så den valgte veggen druknet. Den er nå **rav** (#ffa726), en farge
  som ikke finnes andre steder: rommet er cyan, usikre mål tynne røde, gizmo-pilene rød/grønn.

**To funn om berøring:** hovedlerretet har **ingen touch-håndterere** (de tre som finnes hører
til signatur-lerretet i dokumentasjonsmodulen), og `nearMoveArrow` har **5 px** treffradius langs
en 42 px pilstamme. Gizmo-drag med finger har altså aldri virket, heller ikke for innloggede.
Løst uten å røre innlogget bruk: `nearMoveArrow` tar nå en valgfri toleranse med **standard 5**,
kundesiden sender 22 på berøringsskjerm, og touch → mus videresendes kun når
`kundeMode === 'maal'`.

**Svaret bærer nå både lengder og punkter.** `answer.points[roomId]` er kundens resultat-geometri;
028-panelet viser den som gul stiplet skygge ved siden av Kenneths resultat, så han ser *hva
kunden så*. Målt ende til ende: kundens punkter og Kenneths «Bruk alle» er **punkt for punkt
identiske, 0 cm avvik**. `wasCm` hentes fra originalen, ikke fra rommets nåværende lengde — som
nå *er* kundens eget tall.

**Telefon:** bunnarket er sammenleggbart. Lukket er det én linje («Fyll inn mål · Send inn») og
tegningen får **92 %** av høyden; åpent 44 %. Tallfelt og −/+ er 44 px.

**Innlogget bruk og `?present=` er uendret**, verifisert: 5 px-treff beholdt, `_movingWall`
settes, gizmo-drag 400 → 450, undo-steg lagt til, `#wip` synlig.

**Regresjon:** `_kundelenkeRegressionTest` 114 → 140 sjekker. 15 batterier grønt: **364 sjekker**.

---

## E-postene skriver norsk med æ, ø og å — ASCII-regelen gjelder bare SQL — 2026-10-07

Meldt av Kenneth: «Teksten er uten æ ø å i e-posten som blir sendt.» Han har rett, og det er
min feil: ASCII-regelen i `000-KJØR-MEG.md` gjelder **SQL-kommentarer** (de limes inn i Supabase
SQL Editor), og jeg dro den feilaktig over på e-posttekst i 029. Kunden fikk «Åpne» skrevet som
«Apne» og «målene» som «maalene».

Det var aldri et tegnsett-problem: filene er UTF-8, og tankestreken «—» har hele tiden kommet
riktig fram. Bare feil ordvalg.

**Rettet i to funksjoner:**
- **`kundelenke-mail`** — ti steder: begge emnelinjene, «Åpne lenken under, så ser du tegningen
  og kan rette målene direkte», knappene «Fyll inn mål» og «Åpne i Varmeplan», «Tegningen er
  ikke endret — målene ligger som et forslag til du går gjennom dem», bunnteksten «Svar går til
  avsenderen av lenken», og feilmeldingen «for gammelt til å varsle om».
- **`send-invite-email`** — «Klikk på knappen under for å opprette kontoen din», «Lenken virker
  kun **én** gang», og to feilmeldinger («last siden på nytt», «ikke lenger åpen»).

`notify-admin-registration`, `send-feedback` og `send-warranty-email` hadde **ingen**
erstatninger i tekst — bare i kodekommentarer, som ingen mottaker leser.

**Tegnsett sikret i alle fem:** `<meta charset="utf-8">` først i hver e-post-HTML (de mangler
`<head>`, og da gjetter enkelte e-postklienter), og `Content-Type: application/json; charset=utf-8`
på kallet mot Resend.

**⚠ To ting målingen avslørte:**
1. **Min første skanning bommet.** Jeg brukte `\b` i awk — macOS' awk støtter det ikke, så
   `paa` og `aa` i `send-invite-email` gikk rett gjennom. Jeg fant dem ved å *lese* fila.
   Skanningen er nå `grep -E` med eksplisitte bokstavgrenser.
2. **ASCII-regelen følges ikke i repoet forøvrig.** 24 av 26 `supabase-migration-*.sql`
   inneholder allerede æøå og har kjørt fint i SQL Editor. Regelen er altså en konvensjon for
   kundelenke-serien, ikke repoets praksis — sjekken nedenfor er derfor avgrenset til
   `supabase-migration-kundelenke*.sql`, ellers ville den flagget 24 filer som virker.
   `supabase-migration-kundelenke.sql` hadde forresten tre tankestreker i en fil hvis egen
   topptekst sier «Ren ASCII»; de er byttet til bindestrek (kun kommentarer, trenger ikke kjøres
   på nytt).

**Punkt 4b (lagt til samme dag): avsenderen heter nå «Cenika Varmeplan», ikke «Cenika AS».**
Ny `_orgShort()` fjerner selskapsformen fra slutten av organisasjonsnavnet (`AS`, `ASA`, `ANS`,
`DA`, `ENK`, `SA`, `BA` — med eller uten punktum, uansett store/små bokstaver), og
`_avsenderNavn()` legger på « Varmeplan». Navnet kommer fra `organizations.name`; «Cenika» er
ikke hardkodet noe sted. Gjelder **begge** meldingene — svarvarselet hadde ingen avsendernavn i
det hele tatt før og brukte bare `FROM_EMAIL`.

Tre feller er dekket, og den tredje ble funnet av testen:
- **Ordgrense kreves**, så et navn som tilfeldigvis slutter på bokstavene ikke klippes:
  «Vikinganes» beholder «nes», «Mesta» beholder «ta».
- **Et navn som alt inneholder «Varmeplan»** ville gitt «Varmeplan Varmeplan».
- **Et navn som BARE er en selskapsform** («AS») slapp gjennom som «AS Varmeplan», fordi
  regexen krever noe foran formen. Egen `ORG_BARE_FORM`-sjekk fanger det. Den feilen fantes
  aldri i produksjon — testen tok den først.

**Ny sjekk i repoet:** `scripts/sjekk-norsk-i-epost.sh`. Den flagger ASCII-erstatninger utenfor
kommentarer, manglende `charset`, ikke-ASCII i kundelenke-seriens SQL, og kjører
`scripts/test-avsendernavn.mjs` (23 tilfeller). Det siste skriptet leser `_orgShort` /
`_avsenderNavn` **ut av** `.ts`-fila og kjører dem — altså testes den ekte koden, ikke en kopi,
siden en Deno-funksjon ikke kan nås fra regresjonsbatteriet i `index.html`.

Verifisert at sjekken **fanger**, ikke bare består — alle tre feilklasser gir exit 1: en
ASCII-erstatning i en streng, en ødelagt avsendernavn-logikk, og manglende `charset`.

**⚠ Sjekken ga først et falskt treff på seg selv.** Den hoppet bare over *hele* kommentarlinjer,
så en etterfølgende `// 031: samme avsendernavn paa begge meldingene` ble flagget. Etterfølgende
kommentarer klippes nå bort før søket — og kommentaren er skrevet med «på».

---

## Tre åpne e-postutløsere tettet — send-invite-email, notify-admin-registration, send-feedback — 2026-10-07

Oppfølging av funnet i 029. Jeg undersøkte `send-invite-email` og fant at problemet var større
enn antatt — og **verre i to andre funksjoner**.

**STEG 0 — målt mot de deployede funksjonene, ikke lest ut av koden:**

| Funksjon | Kall uten `Authorization` | Mottaker |
|---|---|---|
| `send-invite-email` | nådde vår kode (400 fra oss, ikke 401 fra plattformen) | **fritt valgt av kaller** |
| `notify-admin-registration` | **200 `{"success":true}` — sendte e-post på tomt body** | `ADMIN_EMAIL` |
| `send-feedback` | **200 `{"success":true}` — sendte e-post på tomt body** | `ADMIN_EMAIL` |
| `kundelenke-mail` | 400, autentiserer først | fra databasen |

Sondene utløste to ekte e-poster til `ADMIN_EMAIL` («Ny registrering: undefined» og «💬 Generelt
fra bruker»). Det var ikke meningen — jeg forventet 400 som fra `send-invite-email` — men det er
nettopp beviset: hvem som helst kunne fylt innboksen og tømt Resend-kvoten, slik at ekte
invitasjoner sluttet å gå ut.

`send-invite-email` var i tillegg en ferdig phishing-kanal: både mottaker **og** lenke-URL kom
fra klientens body, og `org_name`/`invited_by` ble interpolert **uescapet** inn i HTML-en. Alt
med Varmeplan som avsender på vårt eget verifiserte domene.

**Dette er rettet:**
- **`send-invite-email`** tar nå kun `token`. Mottaker, lenke, organisasjonsnavn og avsendernavn
  slås opp server-side med service role. Krever innlogget bruker (eksplisitt `auth.getUser` —
  `verify_jwt` holder ikke, anon-nøkkelen er en gyldig JWT) **med eier- eller admin-rolle i
  nettopp den organisasjonen**. Invitasjoner uten org krever superadmin. Alt escapes.
- **`notify-admin-registration`** kan ikke kreve innlogging — den kalles rett etter `signUp()`,
  og med e-postbekreftelse på finnes ingen sesjon ennå. I stedet beviser kalleren at
  registreringen *finnes*: klienten sender bruker-id-en fra `signUp`-svaret, funksjonen slår den
  opp med service role og krever at kontoen er under 15 minutter gammel. Kan ikke forfalskes uten
  faktisk å registrere seg. E-postadressen tas fra oppslaget, aldri fra body.
- **`send-feedback`** krever innlogging, og **identiteten slås opp fra JWT-en** — før kunne en
  melding tillegges hvilken som helst bruker. Bare type og melding kommer fra body, escapet.
  Klientkallet sendte forresten *ingen* `Authorization` i det hele tatt, bare `apikey`; uten den
  rettelsen ville tilbakemeldinger sluttet å virke.

**⚠ En test som hadde undersøkt tomme strenger.** `_kildeUtenKommentarer` (innført i 029) fjernet
`/* … */` med en global regex. Skriptet har **185 `/*` men bare 184 `*/`** — én åpner som ikke er
en kommentar, og da forskyves pareringen slik at hver «kommentar» etter den spiser ekte kode fram
til neste `*/`. Målt: **1,18 MB forsvant**, og `functions/v1/send-feedback` var borte *før* noen
test fikk se den. 029-sjekken på `location.origin` sveipet altså et lemlestet korpus. En regex
kan ikke parse JavaScript; funksjonen er skrevet om linjebasert og kan ikke fjerne en kodelinje.

**⚠ Og samme inverteringsfeil som i 029, igjen.** `check(navn, forventet, betingelse, fikk)` —
tredje argument er påstanden som må være **sann**; `forventet` er kun visning. Jeg skrev
`check('ingen X', false, /X/.test(kode), …)` fire ganger, som feiler nettopp når koden er riktig.
Advarsel lagt rett over `check`-definisjonen i den nye testen.

**Ny regresjonstest** `_edgeMailRegressionTest` (14 sjekker) låser klientsiden av kontrakten:
ingen mottaker, ingen lenke-URL, ingen avsenderidentitet sendes lenger, registreringsvarselet
krever bruker-id-en, og tilbakemeldingen sender brukerens sesjon.

**Krever deploy av tre funksjoner** (se under). Klient og funksjon må deployes sammen — den nye
kontrakten er ikke bakoverkompatibel, og en gammel klient får «token kreves (last siden på nytt)».

**Regresjon:** 15 batterier grønt, **338 sjekker**.

---

## Kundelenke satt i drift — deploy, migrasjon og live verifisering — 2026-10-07

Avslutningen på serien 027–030. Ikke ny funksjonalitet, men oppsettet som gjør den operativ,
pluss én sikkerhetsfiks funnet ved å måle den **deployede** funksjonen i stedet for å lese koden.

**Oppsettet, i rekkefølge:**
1. `varmeplan.no` verifisert i Resend, `FROM_EMAIL` og `RESEND_API_KEY` satt. Fallbacken i
   `kundelenke-mail` flyttet fra `noreply@arqely.no` til `noreply@varmeplan.no` så kode og
   secret peker samme vei.
2. `supabase-migration-kundelenke-mail.sql` kjørt — `kundelenker` har nå 18 kolonner.
3. `supabase functions deploy kundelenke-mail` (prosjekt `nhzhffertfqdeslhzyxx`).

**⚠ Sideeffekt verdt å kjenne til:** `FROM_EMAIL` er en **prosjekt**-secret, ikke en
funksjons-secret. Fem funksjoner leser den — `send-invite-email` og `notify-admin-registration`
sendte tidligere fra `arqely.no`, `send-feedback` fra `invite.arqely.com`. Alle sender nå fra
`noreply@varmeplan.no`. Antakelig ønsket (ett avsenderdomene for hele appen), men det er ikke
isolert til kundelenken.

**⚠ Sikkerhetsfiks funnet ved å teste den live funksjonen.** Et `invite`-kall uten innlogging
svarte **404 «ukjent lenke»** i stedet for 401 — altså ble lenken slått opp *før*
autentiseringen. Tokenet er en v4-UUID, så oppregning er praktisk umulig, men svaret røpet
likevel om et gitt token finnes, til en kaller uten ærend der. JWT-sjekken flyttet foran
oppslaget og redeployet.

**Vaktene, målt mot den live funksjonen etter fiksen:**

| Kall | Svar |
|---|---|
| `invite` med **anon-nøkkelen** | 401 «innlogging kreves» |
| `invite` uten `Authorization` | 401 |
| `answered` med ukjent token | 404 «ukjent lenke» |
| ugyldig `kind` | 400 |

Den første raden er beviset på at plattformens `verify_jwt` **ikke** hadde holdt: anon-nøkkelen
er en gyldig JWT og ligger åpent i klienten, så den slapp gjennom plattformsjekken og ble
stoppet først av den eksplisitte `auth.getUser`-sjekken. Det var hypotesen bak hele designet i
029 — nå er den målt, ikke bare resonnert om.

**En felle i verifiseringen, verdt å huske:** «Success. No rows returned» betyr to helt ulike
ting i Supabase SQL Editor. For en `select` betyr det at ingenting ble funnet; for en
`alter table` betyr det at alt gikk bra. Samme melding, motsatt konklusjon — sjekk alltid med en
etterfølgende `select` på `information_schema.columns`.

`AGENTS.md` lagt i `.gitignore`. Fila gjenskapes av Codex med stier til en `.Codex/`-mappe som
ikke finnes i dette repoet; den ble slettet en gang før og kom tilbake av seg selv.

**Status for hele serien:** [`docs/kundelenke/STATUS.md`](kundelenke/STATUS.md).
Commits: `ef636f9`, `bf3f814`, `a737003`, `93a0a18`, `6b99353`.

---

## Tegn selv via kundelenke — Mål/Polygon/L-form/WBW på PC, talltastatur på telefon — 2026-10-07

Serien «Kundelenke» (027–030), prompt 030 — siste i serien. Krever 027 og 028.
Elektrikeren på befaring tegner rommene selv og sender en lenke, i stedet for at Kenneth tegner
etter en skisse på papir.

**STEG 0 — fire målinger, ikke antakelser:**

1. **Hva knekker i kundemodus?** `startDrawMode('wbw')` kjører rent. Det som *ikke* er trygt er
   romopprettelsen: `createRoom` → `pushUndo` → `_markProjectDirty` + `_scheduleAutoSave` →
   `_performAutoSave` → `_saveToSupabase`, som **inserter en ny prosjektrad** når
   `_supabaseProjectId` er null. Kunden er anonym, så RLS (`auth.uid() = user_id`) ville avvist
   den — men «den feiler av riktig grunn ved et uhell» er ikke et vern. I tillegg skriver
   `_performAutoSave` til IndexedDB *ubetinget*. Presentasjonsmodus slipper unna uten gate fordi
   den er ren lesing; tegn-modus er den første som faktisk muterer. Gaten ligger derfor i
   `_scheduleAutoSave` — det ene punktet alle mutasjonsveier går gjennom.
2. **Legger `wbwDirPlace` en vegg uten mus?** Ja. Fire kall fra konsollen ga et ferdig rom på
   3,20 × 4,00. Og rommet **lukker seg selv** når en vegg lander under 10 cm fra startpunktet —
   «Lukk rom» var altså allerede løst; knappen trengte bare å kalle `finishWbwRoom()`.
3. **Telefonmålingen (375 px):** `#wbw-panel` passer i bredden (374 × 101), men **alle ti
   knappene er under 48 px** — pilene 30 × 28, handlingene 28 × 28. Og `#wbw-len` er
   `type="number"` uten `inputmode`, mens `addWbwWall` kaller `el.focus()` etter *hver* vegg:
   mobiltastaturet ville sprettet opp på nytt for hver eneste vegg man la.
4. **Hva trenger et komplett rom?** `createRoom` setter `roomType: null`, `targetWm2: null`.
   `ROOM_TYPES` eier `targetWm2` og `defaultModType` per type — så komfort Lav/Normal/Høy blir
   ±20 % av romtypens egen verdi, og kunden ser aldri et tall.

**⚠ To lekkasjer funnet live, begge eldre enn 030:**

- **`_presentEnter()` satte ubetinget `presentPublic = false`** — og begge offentlige inngangene
  (`?present=` og `?kunde=`) setter flagget *før* de kaller den. Det ble altså nullstilt
  umiddelbart, stikk i strid med kommentaren på selve linja. **«Del lenke» og «Avslutt» har vært
  synlige for alle med en presentasjonslenke.** Flagget tas nå som argument.
- **PDF-knappen var ikke gatet i det hele tatt.** På en kundelenke er det et direkte brudd på
  spec regel 1 — PDF-en viser produkter og priser. Nå skjult i kundemodus, sammen med
  «Installert effekt»-KPI-en, som er utlegget regnet om. Presentasjonslenken beholder PDF-en;
  den *er* ment som kundens prosjektoversikt (notert i SPØRSMÅL.md).

**⚠ Tre feil i mitt eget arbeid, funnet ved måling:**

- **Ctrl+Z angret ett rom om gangen.** `createRoom` kaller `pushUndo` selv, så «Legg inn alle
  rom» ga fire snapshots for tre rom. Ny `_undoSuppress`-teller: den som starter en batch tar
  ett snapshot og hever telleren, snapshots inni hoppes over. Målt: 1 steg, og ett Ctrl+Z
  fjerner alle rommene.
- **Tegningen var usynlig på telefon.** `startDrawMode('wbw')` regner startvisningen ut fra
  PC-bredde (zoom ble 0,15, minimum) og sentrerer i *hele* lerretet — men pad-en dekker de
  nederste ~390 px, så geometrien havnet bak tastaturet. Ny `_kpadFit()` zoomer til kjeden
  innenfor den synlige stripa over pad-en.
- **To knapper merket «Bruk alle» i samme dialog** gjorde ulike ting (rom vs. mål). Nå «Legg inn
  alle rom» og «Bruk alle mål», og mål-knappene vises bare når svaret faktisk har mål.

**Dette er bygget:**
- Tegn-modus aktivert i «Be kunde om mål». *027 hardkodet `mode: 'maal'` siden valget var
  deaktivert — modusen leses nå faktisk fra radioknappen.*
- Kundesiden i tegn-modus: verktøylinje med Mål · Polygon · L-form · Vegg for vegg, liste over
  tegnede rom med Endre/Slett. Prosjektets egne rom er låst.
- **Én krok**: alle fire tegnemetodene ender i `createRoom`, så romskjemaet og romlista trenger
  ingen fire parallelle kroker.
- Telefon-HUD: 375 × 366 px, **minste knapp 48 px** (var 28), talltastatur + piler, og
  `#wbw-len` satt `readonly` + `inputmode="none"` — et readonly-felt åpner ikke tastaturet, så
  `focus()`-kallet blir ufarlig uten at `addWbwWall` måtte endres for innloggede brukere.
  Balanselinja viser live hva som gjenstår: «For å lukke: ↕ 1,60 m opp igjen · ↔ 4,00 m venstre
  igjen».
- Romskjema per rom: navn, romtype, etasje, ønsket varmetype, ønsket komfort, kommentar. Ingen
  W/m²-tall, ingen produkter.
- 028-panelet: «Nye rom fra kunde (N)» med SVG-miniatyr av romformen, W/m² utledet av romtype +
  komfort, Bruk per rom / Legg inn alle rom. Ugyldige rom listes med begrunnelse i stedet for å
  forsvinne stille. Navnekollisjon gir «(kunde)»-suffiks. Rommene plasseres til høyre for de
  eksisterende med kundens innbyrdes avstander bevart.
- WBW-balansetoasten og minikartet undertrykt i kundemodus — begge er Kenneths verktøy, og på
  telefon la de seg oppå tegneflaten.

**Ingen migrasjon.** 030 er ren klientkode; `kundelenke_answer` tar imot `rooms[]` som den er.

**Regresjon:** `_kundelenkeRegressionTest` 79 → 114 sjekker. Hele batteriet grønt: **324 sjekker**.

---

## Kundelenke på e-post begge veier, alle utgående lenker på varmeplan.no — 2026-10-07

Serien «Kundelenke» (027–030), prompt 029. Krever 027 og 028.

**STEG 0 — tre funn, og det første endret hele sikkerhetsdesignet:**

1. **Ingen av de eksisterende e-postfunksjonene verifiserer kalleren.** `send-invite-email`
   leser ikke `Authorization` i det hele tatt — den tar både mottaker **og** selve lenke-URL-en
   rett fra klientens body. Den kan altså sende en vilkårlig lenke til en vilkårlig adresse med
   Varmeplan som avsender. Og: Supabase sin `verify_jwt` er ikke det samme som «innlogget
   bruker» — **anon-nøkkelen er en gyldig JWT**, og den ligger åpent i klienten. En funksjon som
   stoler på `verify_jwt` alene er i praksis åpen. Den nye funksjonen verifiserer derfor
   brukeren eksplisitt med `auth.getUser(jwt)` og sjekker medlemskap i lenkens organisasjon.
   `send-warranty-email` er mønsteret som ble kopiert: den slår opp alt selv med service role.
2. **`FROM_EMAIL` spriker mellom funksjonene** — `send-invite-email` har `noreply@arqely.no`
   som standard og sender faktisk e-post i dag; `send-warranty-email` har `noreply@varmeplan.no`,
   men er dokumentert som ikke aktiv, altså uprøvd. Den nye funksjonen bruker den *provde*
   standarden. Skal avsender bli `varmeplan.no`, må domenet verifiseres i Resend først — notert
   i SPØRSMÅL.md.
3. **Tre invitasjonslenker bygges med `location.origin`** i klienten — de ville sendt mottakeren
   til `arqely.com` eller `localhost` i en e-post. Alle tre over på `_PUBLIC_BASE_URL`.

**⚠ En test som besto av feil grunn, oppdaget her.** 027s sjekk «ikke `location.origin` i
delelenken» var skrevet som `check(navn, false, /location\.origin/.test(kilde), …)` — men tredje
argument *er* betingelsen som må være sann. Sjekken krevde altså at kilden **inneholdt**
«location.origin», og det gjorde den: i en kommentar om hvorfor den ikke skal brukes. Den ville
vært grønn selv om `location.origin` ble satt rett tilbake i koden. Rettet, og samtidig gjort
dekkende: i stedet for å liste opp funksjonsnavn (to av de tre invitasjonslenkene bygges i
anonyme handlere uten navn, og en navneliste fanger uansett ikke et kallsted som legges til i
morgen) sveipes nå **hele det innebygde skriptet**, med kommentarer og testen selv fjernet via
en ny `_kildeUtenKommentarer`.

**Dette er bygget:**
- Ny Edge Function `kundelenke-mail` — to meldinger, én funksjon. `invite` krever innlogget
  bruker som er medlem av lenkens org; `answered` er anonym, men krever `status='answered'`,
  svar under 10 minutter gammelt, og maks ett varsel per lenke per 10 minutter. Mottakeren for
  `answered` er alltid lenkens egen `notify_email`, aldri noe fra kallet.
- «Send på e-post» i «Be kunde om mål»-modalen er aktivert. Meldinga til kunden er den samme
  fritekstboksen som alt står der — ikke et nytt felt å fylle ut to ganger.
- Kundesiden varsler automatisk etter innsending. **Uten `await`**: e-post er et tillegg, og en
  kunde som nettopp målte opp stua kan ikke gjøre noe med at en SMTP-tjeneste er nede.
  Bekreftelsen vises uansett.
- E-postens «Åpne i Varmeplan» → `?project=<id>&kundesvar=<id>` åpner prosjektet og
  gjennomgangspanelet fra 028. Ligger etter innlogging, i motsetning til `?kunde=`/`?present=`
  som er anonyme grener før auth.
- Sidebaren viser hvem lenken ble sendt til og når — ellers er det umulig å vite om kunden
  faktisk har fått den, eller om lenken bare ble kopiert og aldri delt.

**Klienten sender aldri e-post selv** — ingen API-nøkkel i `index.html`.

**Migrasjon:** `supabase-migration-kundelenke-mail.sql` (tre additive kolonner:
`last_notified_at`, `invite_sent_to`, `invite_sent_at`).

**Deploy:** `supabase functions deploy kundelenke-mail`. Secrets er de samme som de øvrige
e-postfunksjonene bruker — se `supabase/functions/kundelenke-mail/README.md`.

**Regresjon:** `_kundelenkeRegressionTest` 65 → 79 sjekker. Hele batteriet grønt: **289 sjekker**.

---

## Kundesvar: gjennomgang vegg for vegg, Bruk / Bruk alle, avvik som vises — 2026-10-07

Serien «Kundelenke» (027–030), prompt 028. Krever 027.
Kunden har sendt inn tall. Nå skal de ses ved siden av Kenneths egne, velges, og arbeides inn —
uten at rommet blir skjevt i stillhet.

**STEG 0 — tre funn:**
1. **Det fantes ingen funksjon som setter en veggs lengde fra et tall.** Den eneste
   vegg-mutasjonen er dra-i-vegg (`_movingWall`), og den flytter veggen *på tvers* av seg selv —
   begge endepunktene like mye. Den endrer altså *naboveggenes* lengder, aldri sin egen. Ingen
   redigering av målelinjer, ingen reåpning av WBW. `_applyWallLength` måtte skrives.
2. **Dra-i-vegg gjør nøyaktig to ting etterpå:** `compWalls` + `compArea`. Hindringer, soner,
   folie, kabel, matte og manuelle målelinjer røres *ikke* — ingen re-klipping, ingen sletting,
   ingen cache-invalidering. Cachene er medlemskaps-cacher (`roomId → objekter`), ikke geometri,
   så de er korrekte uansett. Innarbeidingen speiler dette nøyaktig.
3. **Prosjektlista** henter via en fallback-stige av tolv kolonnesett (for eldre skjemaer). En
   join mot `kundelenker` måtte vært duplisert tolv ganger og kunne veltet hele lista. Derfor et
   eget, lite spørsmål i samme runde (`Promise.all`) — feiler det, forsvinner bare merket.

**⚠ Promptens egen §2-regel var geometrisk feil, og ble målt før noe ble skrevet.**
Den sa: «flytt `points[i+1 … n−1]` langs veggen — i et rektangel/L-form gir det et rom som
fortsatt er rettvinklet». Målingen på et rektangel 400×320, vegg 0 → 450:

| regel | lengder | vinkler |
|---|---|---|
| promptens | 450 / 320 / 400 / **323,9** | 0 / 90 / 180 / **−98,9°** — skjevt |
| vindu-regelen | 450 / 320 / 450 / 320 | 0 / 90 / 180 / −90° — rektangel |

Flyttes hele resten av kjeden, blir den lukkende kanten forskjøvet på tvers av sin egen akse, og
den kan ikke absorbere en forskyvning langs en akse den ikke ligger i.

**Regelen som virker — «vindu av to punkter»:** i et rettvinklet polygon veksler kantene mellom
x- og y-akse, så kant `i+2` er *parallell* med kant `i`. Flyttes nøyaktig `points[i+1]` og
`points[i+2]` langs veggens egen retning, endres kant `i` med delta, kant `i+1` ikke i det hele
tatt, og kant `i+2` absorberer — alle retninger bevart. `points[0]` er rommets ankerpunkt og
flyttes aldri; for de to siste veggene brukes bakover-vinduet `{i, i−1}` med motsatt fortegn.
Verifisert for **alle** vegger i både rektangel og L-form: eksakt mållengde, rettvinklet bevart,
`points[0]` urørt i alle ti tilfellene.

**To feil funnet live under testing, begge rettet og låst i testen:**
- **Panelet sa «✓ Målene går opp» midt i en åpenbar konflikt.** Balansen ble regnet på
  resultat-polygonet, som alltid er lukket og derfor alltid summerer til null — nøyaktig samme
  felle som 027s første `_roomAxisBalance` gikk i. Rettet, og samtidig delt i to spørsmål som
  ikke er det samme: *går kundens tall opp som en lukket romform?* (bare meningsfullt når han
  har oppgitt alle veggene) og *overlever hvert enkelt av kundens mål innarbeidingen?* (det som
  faktisk gjelder for et delvis sett). Kjedebyggeren er nå delt med kundesiden, så de to aldri
  kan svare ulikt.
- **Oppblussingen av rommene tegnet seg aldri.** Den lå som en hale inne i `drawRooms()` — men
  pass 2 der inne begynner med to tidlige `return` når ingen rom er valgt, så halen ble aldri
  nådd. Samme lærdom som klikk-kaskaden: «sist i funksjonen» er ikke «til slutt» når funksjonen
  har tidlige utganger. Nå et eget lag, `drawKundeHighlight()`, kalt fra `render()`.

**Dette er bygget:**
- Prosjektlista og sidebaren merker prosjekter med ubehandlet svar («✉ Svar fra kunde»).
  *027s `_kundeStatusHtml()` var død kode — definert, aldri kalt. Statuslinja finnes nå faktisk.*
- Gjennomgangspanel per rom: `Vegg | Estimert | Kunde | Avvik | Blir`, usikre vegger først og
  røde, følge-endringer på vegger kunden ikke målte vist som egne grå rader. «Blir»-kolonnen er
  ikke en prognoseformel — den **er** innarbeidingen, kjørt på en klone av punktene.
- Bruk / Bruk valgte / Bruk per rom / Avvis. Én `pushUndo` per klikk, uansett antall vegger.
- Motstående vegger som avviker ≤ 2 cm: snittet brukes (måletoleranse). Avviker de mer: begge
  står, det med størst endring anvendes, og resten rapporteres som avvik. Ingen stille fordeling.
- Kontrollrunde etter innarbeiding: «Vegg 1: kunde 3,45 m → ble 3,60 m». Rommet får gul ⚠ i
  sidebaren til Kenneth klikker den vekk.
- Vegger som fikk mål er ikke lenger usikre; alle behandlet → `status='applied'`.

**Migrasjon:** `supabase-migration-kundelenke-028.sql` — `kundelenke_get` avviser nå også
`applied`, så lenken blir ugyldig når målene er innarbeidet (027 avviste bare `revoked`/`expired`,
mens `kundelenke_answer` avviste `applied` allerede — nå er de to enige).

**Regresjon:** `_kundelenkeRegressionTest` utvidet fra 20 til 65 sjekker. Hele batteriet
(14 tester) grønt: **275 sjekker**.

---

## Kundelenke, grunnmur: kunden fyller inn mål uten innlogging — 2026-10-07

Serien «Kundelenke» (027–030), prompt 027. Spec: `docs/kundelenke/spec-kundelenke.md`.
Problemet: tegninger kommer uten mål, Kenneth estimerer, kunden måler på ark og sender bilde,
og det går frem og tilbake.

**STEG 0 — fire funn:**
1. `?present=` gir anon-tilgang via ÉN `security definer`-funksjon med `revoke all from public` +
   `grant execute to anon`; tabellens RLS åpnes aldri. Kundelenken kopierer mønsteret nøyaktig.
2. **`wallIdx` = punktindeks.** `compWalls(pts)` bygger `walls[i]` av `points[i] → points[(i+1)%n]`
   og kalles på nytt ved hver geometriendring (10 kallsteder) — indeksen er stabil og overlever
   lagring. `{roomId, wallIdx}` er nok; ingen egen vegg-id i svaret.
3. **PDF-romsiden trenger ingen egen kodevei:** `_renderRoomToImage` kaller `render()`, så
   markeringen av usikre vegger på lerretet arves rett inn i PDF-en.
4. `?present=`-grenen i `initSupabase` er urørt; `?kunde=` er en egen gren rett etter.

- **Migrasjon `supabase-migration-kundelenke.sql`** (Kenneth kjører manuelt): tabell `kundelenker`,
  RLS kun for org-medlemmer, og to `security definer`-funksjoner. `kundelenke_get` bygger svaret
  med **eksplisitt feltutvalg** fra prosjektets `data` — aldri `data` rått, så kunden ser kun
  geometri og navn (spec regel 1). `kundelenke_answer` avviser applied/expired/revoked og
  payload over 200 kB.
- **Usikre vegger:** `room.uncertainWalls: [wallIdx]`, toggle fra ny ctxbar-gren for valgt
  målelinje (det fantes ingen fra før — kun dra-håndtak). Tegnes rødt, stiplet, med «?».
- **`_roomAxisBalance(points, openChain)`** (spec regel 4b). **Rettet underveis:** første utgave
  summerte over alle kantene i polygonet. En lukket form summerer per definisjon til null — den sa
  derfor alltid «går opp», uansett hvor feil målene var. Balansen er bare meningsfull for en ÅPEN
  kjede: veggene brukeren faktisk har oppgitt, før den lukkende veggen tar opp differansen.
  Kenneths skisse 07.10 ender 30 cm og 815 cm fra startpunktet — nettopp det avviket.
- **WBW:** live balanselinje i panelet mens man tegner, og ved «Lukk rom» en varseltoast med
  knappen «Merk veggene som usikre» (merker hele den aksen som ikke går opp).
- **«Be kunde om mål»** i topbaren → modal (modus, melding, gyldighet, merkede vegger) → lenke på
  `https://varmeplan.no/?kunde=<token>`. Ny konstant `_PUBLIC_BASE_URL`; `_presentShareLink`
  bruker den nå også, i stedet for `location.origin` (som ga arqely.com/localhost).
- **Kundesiden:** `?kunde=<token>` → `kundelenke_get` → **minimalt `S` bygget fra svaret**.
  `_restoreProject` gjenbrukes bevisst IKKE — den ville dratt inn produkter, utlegg og
  kundeopplysninger. Usikre vegger først og rødt, men alle mål kan rettes. Endret verdi blir
  grønn med «var 320» ved siden av. Liste per rom (stor touch-flate) på smal skjerm. Live
  «går målene opp?» per rom, aldri som sperre. Geometrien tegnes ikke om — kunden retter tall.
- Sidebar-status «Kundelenke: åpen · utløper …» med Kopier og Trekk tilbake.

**Testet:** ny `_kundelenkeRegressionTest` (20 sjekker) — balansen på Kenneths skisse gir dx 30 /
dy −815 og peker på de loddrette veggene; lukket rektangel gir 0/0; skrått rom gir
`rectilinear:false`; usikre vegger toggler og slår på `dimSnap`; URL-bygging bruker
`_PUBLIC_BASE_URL` og `_presentShareLink` inneholder ikke lenger `location.origin`; svar-payloaden
avviser negative og NaN. Alle tretten øvrige grønne — **230 sjekker**.

**Kenneth må:** kjøre `supabase-migration-kundelenke.sql`. «Send på e-post» står deaktivert til
029. Tegn-modus er deaktivert til 030.

**Filer:** index.html, supabase-migration-kundelenke.sql (ny), docs/kundelenke/prompter/SPØRSMÅL.md.

---

## Romtype Fryserom/kjølerom + automatisk reservekabel — 2026-10-06

Kenneth: «Jeg ønsker en egen funksjon for fryserom, fryselager og kjølerom … 10 W/m med CC mellom
30–50 cm og ca. 15–20 W/m². Det legges alltid en ekstra kabel i reserve, siden varmekablene blir
forlagt under isolasjonen, under støpt dekke … Reservekabelen må telles med i alle lister, men
ikke beregnes i flateeffekt — den brukes kun dersom hovedkabelen ryker.»

**STEG 0 — ett funn forenklet hele saken.**

| | Målt |
|---|---|
| **0.1 Sperren** | 20 W/m² ble klemt til **50** med toast «Min 50 W/m² for innendørs» |
| **0.2 Forslag** | 20 W/m² → InFloor 10T 1000W/100m, **CC 48 cm, 20,8 W/m²** — gyldig og **uten ⚠**; 33 W/m² → CC 30 |
| **0.3 `ccMaxCm`** | Klemmer ingenting innendørs — alle tre bruksstedene er gatet på `_isSnowModule()` (farge/filter kun i snø) |
| **0.4 Etterpunktet** | `_invalidateCableCache()` — **alle 22 kallsteder er mutasjoner**, ingen render-/lesevei kaller den |

**InFloor 10T har allerede `max_spacing_mm = 500`**, så CC 30–50 ga ingen advarsel fra før.
Bestillingen antok 200 (som gjelder 17T). CC-maks-overstyringen var altså ikke det som blokkerte
— **det var kun 50 W/m²-gulvet.** `ccMinCm` (⚠ under 30 cm) er den som faktisk legger til noe nytt.

- **Romtype «Fryserom/kjølerom»** 🧊: 20 W/m², varmetype kabel, `reserveCable`, `wm2Min: 10`,
  CC 30–50. Migrasjon `supabase-migration-room-type-reserve.sql` (**Kenneth kjører manuelt**) —
  men funksjonen virker også UTEN den: de samme verdiene ligger hardkodet i `_ROOMTYPE_HARDCODED`
  som fallback, og lasteren faller tilbake dit når DB-kolonnene mangler.
- `_wm2MinFor(roomId)`: romtypen eier sitt minimum. 50 står for alle andre innendørs romtyper —
  verifisert at Bad fortsatt klemmer 20 → 50.
- `_ccLimits(prod, roomId)` tar nå rommet: romtypens CC-område overstyrer produktets anbefaling,
  og ny `minWarn` gir ⚠ under grensen. **Kenneth 06.10: «la min 200mm og max 500mm være grenser
  man kan bryte med advarsel»** — så området er 20–50 cm, og BEGGE er advarsler. Produktets
  `min_spacing_mm` er fortsatt den eneste harde grensen.
- **Reservekabelen er en KLON, ikke et nytt utlegg.** `_offsetCableClone` kopierer hovedkabelens
  løp og flytter dem **ca. 10 cm** vinkelrett (Kenneth 06.10: «den kan legges ca 10cm forskjøvet
  slik at det er litt bedre plass til hovedkabel»). Klemt til maks ½ CC: med en trang CC ville
  10 cm lagt reserven NÆRMERE neste hovedløp enn det den skal erstatte — begge geometriformene (`runs[].pos_cm` og `pathEls` med
  `a/b/pts/from/to`), og skew-kabler bruker sin egen vinkel via `_cableRunNormal`, ikke aksen.
  Siden velges mot der det er mest plass, og resultatet klippes mot rommet med `_offsetPolygon`
  + `_effectiveMarginCm` — samme innsett og margin motoren selv bruker (:17237).
- **`_syncReserveCables` henges på `_invalidateCableCache`** — ÉN plass. Reserven følger derfor
  hovedkabelen uansett hvilken av de elleve plasseringsveiene som ble brukt, og ved sletting,
  retningsbytte og undo. Re-entrans-vakt, og en rask vei som hopper ut når ingen rom har reserve
  OG ingen reserve finnes.
- **Usynlig for effekt, synlig i lister:** `_computeRoomStats` hopper over reserven FØR alt annet
  (egne `reserveCount`/`reserveLenM` i retur), `_roomRatedEffectW` hopper over den.
  `_roomProductBreakdown` gir den EGEN rad «Reservekabel» med 0 W rett under hovedkabelen;
  materiallista likedan. Visma teller den som +1 på samme artikkel.
- Tegning: stiplet (`[6,4]`), 70 % opasitet, ingen randsone.

**Feil funnet og rettet underveis:** hurtigveien i synkroniseringen hoppet ut når *ingen* rom
hadde flagget — så gamle reserver ble liggende igjen når avkrysningen ble slått av. Nå sjekkes
også om det FINNES reserver å rydde.

**Testet ende-til-ende med ekte katalog:** romtype → 20 W/m², reserve på, `wm2Min` 10. Forslag
InFloor 10T 1000W/100m, CC 48, uten ⚠. Utlegg → 2 kabler, CC 49,9, reserven forskjøvet **10 cm**
(klemmes til 7,5 cm ved CC 15). Stats: `cableCount` 1 / `reserveCount` 1, ratedW **1000** (ikke 2000),
flateeffekt 20. Breakdown: «Kabel» 1000 W + «Reservekabel» 0 W. Materialliste: 97,4 m à 974 W +
97,4 m à 0 W. Visma: antall **2**. «Flere kabler» → 3 hoved + 3 reserver, riktig parvis; slett
én hovedkabel → dens reserve forsvinner. Bad: 20 W/m² klemmes fortsatt til 50, og CC 25 gir ingen
under-advarsel. Ny `_reserveCableRegressionTest` (29 sjekker) + alle tolv øvrige grønne —
**210 sjekker**.

**Avklart av Kenneth 07.10.2026 — begge de åpne punktene:**
- **Hurtig prosjektering dobler nå antallet.** Et listerom med reserve viser «Bestilles: 2 stk
  (1 + 1 reserve)», og materialliste/Visma stemmer også fra listeveien. Første forsøk pushet
  reserven i `_listSetRoomProduct` og fikk den slettet igjen av synkroniseringen, som rydder alt
  den ikke selv kan gjenskape — den hører hjemme i `_syncReserveCables`, som nå lager en ren
  label-kopi når hovedkabelen er `labelOnly` (et listerom har ingen geometri å klone). Én kilde.
  Målt: 1 hoved → «2 stk (1 + 1 reserve)», ratedW 1000 (ikke 2000); 3 hoved → 6 stk, 3000 W.
- **Montørappen haster** — «en montør som ser to kabler uten å vite hvilken som er reserve, kan
  koble feil». Datakontrakten i `varmeplan-app` (`docs/datakontrakt-web-app.md`) er oppdatert med
  hva weben faktisk sender, og rettet: forrige versjon sa «forskjøvet en halv c/c», som ikke
  lenger stemmer. Selve app-endringen er en egen prompt.

**Filer:** index.html, supabase-migration-room-type-reserve.sql (ny).

---

## Snøsmelting viser flateeffekt, ikke W per romareal — 2026-10-06

Kenneth: «Utendørs snøsmelt i grunnen — da trenger vi ikke å forholde oss til watt pr brutto
kvadrat, siden det ikke er snakk om oppvarming av et rom. Her er det kun flateeffekt som gjelder
… si 300 W/m² når det brukes matter på 300 W/m². Dekning av brutto areal kan fortsatt være
interessant.»

**STEG 0 — målt på et 20 m² snø-rom med 12 m² matter à 300 W/m², og med snø-kabel 30 W/m / CC 8:**

| Sted | Matte (fasit 300) | Kabel (fasit 375) |
|---|---|---|
| Rom-detaljside «Flateeffekt» | **300** ✓ | **375** ✓ |
| PDF Romoversikt `W/m²` | 180 ✗ | 134 ✗ |
| PDF Prosjektoversikt «Flate W/m²» | 180 ✗ | 134 ✗ |
| Excel `W/m²` | 180 ✗ | — |
| Hurtig prosjektering-kort «W/m² flate» | 180 ✗ | — |

Alle fire feilstedene delte `ratedW` på rommets areal. Det er riktig innendørs («hvor mange watt
får rommet per m² gulv»), men utendørs er spørsmålet «hvor varm blir overflaten DER varmen
ligger» — og det svarer bare produktets egen tetthet på.
*(Bestillingen gjettet ~312 for kabelen; det ekte produktet er 30 W/m, altså 375.)*

- `_roomFlateeffektWm2(room, stats)` er nå ÉN kilde: kabel → `cableWm2` (W/m ÷ CC), ellers
  `wm2Heated` (totalW over dekket flate), tomt rom → ønsket flateeffekt. Rom-detaljsidens
  inline-formel kaller den nå også, så detaljside og tabeller kan ikke vise ulike tall.
- `_roomDekningBruttoPct` + `_isSnowRoom` (avgjøres PER ROM via `_roomModuleType`, ikke aktiv
  fane — et blandet prosjekt får riktig tall per rad).
- **PDF Romoversikt:** snø-rad viser flateeffekt; ny `Dekn.`-kolonne (kun når tabellen har
  snø-rom). Alle snø → overskrift «Flate W/m²»; blandet → `W/m²` beholdt + fotnote.
  **`rColX` måtte ikke justeres** — den nye kolonnen legges etter CC, ytterst, så ingen
  eksisterende kolonne flyttes.
- **PDF Prosjektoversikt:** per etasje. Alle rom snø → «Dekning %» / «Flate W/m²»; blandet →
  overskriftene beholdt + fotnote. Innendørs uendret.
- **Excel:** snø-rader viser flateeffekt i `W/m²`-kolonnen, ny siste kolonne «Dekning % brutto»,
  og en notatrad under tabellen som forklarer det (Excel har én header for hele arket).
- **Hurtig prosjektering-kortene:** `_listWm2FlateStr` — snø → flateeffekt, innendørs uendret.

**Tallet er produktets, ikke rommets — derfor på HVER variantrad.** I et snø-rom med flere
mattetyper hører 300 hjemme på 300-raden og 200 på 200-raden; den gamle regelen «kun på første
variantrad» gjaldt et rom-nivå-tall.

**Testet:** snø-only PDF → «Flate W/m²» + «Dekn.», 300 og 60 %; Prosjektoversikt «Dekning %» /
«Flate W/m²» med 60 %. Blandet → `W/m²` beholdt, `Dekn.` med, fotnote vist, snø-rad 300/60 %,
inne-rad 13 som før. Innendørs-only → `W/m²`, INGEN `Dekn.`-kolonne, INGEN fotnote,
«Brutto W/m²»/«Flate W/m²» uendret. Excel: header med «Dekning % brutto», rad `300 … 60`,
notatrad til slutt. Kort: snø 300 W/m², innendørs 13 W/m². Ny `_flateeffektRegressionTest`
(9 sjekker) + alle elleve øvrige grønne — **181 sjekker**.

**Spørsmål til Kenneth, ikke besvart her:** kolonnen «Flate W/m²» i Prosjektoversikt og
«W/m² flate» på kortene er `ratedW / netto` også INNENDØRS — det er ikke flateeffekt i fysisk
forstand. Skal de også bli ekte flateeffekt (W/m ÷ CC for kabel, `watt_per_m2` for folie/matte),
eller stå som i dag? Ingenting innendørs er endret i denne runden.

**Fil:** index.html.

---

## Egne standardverdier per bruker: folie-avstand og vegg-avstand — 2026-10-06

Kenneth: «Kan hver bruker sette sine egne preferanser på standard avstand mellom varmefolier? …
Standard avstand til vegger også … men aldri tillate mindre enn tillatt, verken for avstand til
vegg eller avstand mellom varmefolier.»

**STEG 0 — funnet som styrte hele designet: bare 1 av 51 kallsteder sendte `roomId` til
`_effectiveMarginCm`.** En rom-lagret margin ville altså ikke slått gjennom noe sted. 38 kallsteder
er nå trådd med `roomId` (de som faktisk har den i scope); 12 står igjen uten, og de faller på
produktminimum som før — `_hideCycleBadge`, `_loadProducts`, `marginWarnSnap`, `_hindringWallLabel`,
`_fillZoneAsRectChain`, `getStripViolations` og `_roomWord`.

- `profiles.prefs` (jsonb): `{foilGapCm, wallMarginCm}`. **Migrasjon:
  `supabase-migration-profiles-prefs.sql` — additiv og idempotent, Kenneth kjører den manuelt i
  Supabase SQL Editor.** Uten den virker alt likevel: `upsert` med en ukjent kolonne feiler stille i
  samme try/catch som `initials` alt bruker, og localStorage overtar.
- `_userPrefs()` = profil ⊕ localStorage ⊕ standard. Profilen vinner fra det øyeblikket brukeren er
  innlogget — ellers ville en kollega på samme maskin arvet forrige brukers verdier.
- **Standardverdien for gap er 2,0 cm** (Kenneth bekreftet: «2 cm standard»). Vegg-standard er
  `null` = ingen preferanse, altså nøyaktig dagens oppførsel.
- **To ulike tall, atskilt med vilje — ikke slå dem sammen senere.** `DEFAULT_FOIL_GAP_CM = 2.0`
  er standarden en bruker uten egen preferanse prosjekterer med i dag. `LEGACY_FOIL_GAP_CM = 1.0`
  er verdien gamle prosjekter FRYSES på ved åpning når prosjektfila ikke selv har lagret noen
  avstand — de ble lagt ut da standarden var 1,0. Heves den til 2,0, påstår man i ettertid at
  gammel folie lå på 2 cm, og folien ville flyttet seg i prosjekter som alt er levert.
  Verifisert: fersk bruker får 2,0; gammelt prosjekt uten lagret verdi fryses på 1,0.

**Prinsippet fra «folie-avstand lekker mellom rom» (22.09) er bærende:** en preferanse er et FRØ
for nye rom. `room.wallMarginCm` lagres på rommet, og `_effectiveMarginCm` leser rommets verdi —
ikke brukerens — for et rom som har en. Gamle prosjekter fryses ved åpning på `0` («ingenting
utover produktets minimum»), samme mønster som `foilGapCm`-migreringen, så en bruker med egen
preferanse som åpner et gammelt prosjekt ikke flytter folie som alt ligger der.

- `_effectiveMarginCm(productId, roomId)` = `max(produktets minimum, ønsket)`. Ønsket kan bare ØKE
  avstanden — «aldri mindre enn tillatt» er hele poenget, og produktminimum er et leverandørkrav.
- Sone-temp-rommet arver `foilGapCm`/`wallMarginCm` fra rommet. Uten det ville en sone falt
  tilbake på brukerens preferanse mens rommet rundt brukte sin egen — to marginer i samme rom.
- Ny ctxbar-chip «↔ Vegg N cm» → panel med presets 1/2/2,5/3/4/5 cm. Setter `room.wallMarginCm` og
  kjører den RELATIVE omfordelingen fra 022 (`_respaceStrips`, anker senter) — aldri «legg alt på
  nytt». Verdier under produktminimum klemmes med «⚠ Min N cm (produktets krav)».
- Gap-panelet (rom og utvalg) viser nå «Min N cm (produktets krav)». Før ble verdien klemt stille
  i `_effectiveGapCmPair` uten at brukeren så det.

**Testfelle rettet underveis:** `_foilRegressionTest` målte dekningsgrad mot faste terskler, men
leste samtidig brukerens lagrede avstand. En lagret verdi på 20 cm fikk «Trapp-rom: dekning over
85 %» til å feile uten at noe var galt med koden — det skjedde to ganger under dette arbeidet.
Testen fester nå preferansene og gjenoppretter dem etterpå. En regresjonstest skal ikke avhenge av
hva brukeren har stilt inn.

**Testet:** uten preferanse → 2,5 cm (produktminimum), uendret. Preferanse 4 → 4 cm. Rom frosset på
0 → 2,5, altså preferansen ignorert. Produkt med minimum 5 og preferanse 4 → 5. 20 (preferanse,
produkt)-par → aldri under produktminimum. Profil slår localStorage; utlogget vinner localStorage.
«↔ Vegg» 2,5 → 4 cm i et L-rom → alle striper innenfor polygonet; 1 cm klemmes til 2,5.
Ny `_prefsRegressionTest` (14 sjekker) + alle ti øvrige grønne — **172 sjekker**.

**Filer:** index.html, supabase-migration-profiles-prefs.sql (ny).

---

## Folie-avstand: gjelder valgte folier, og flytter aldri folie ut av rommet — 2026-10-06

Kenneth: «Når jeg markerer flere varmefoliebredder, ønsker jeg at «Avstand mellom varmefolier»
kun skal gjelde de som er markert … Jeg opplever også at dersom all varmefolie legger seg ut på
2 cm og jeg i ettertid endrer til 3 cm, så flytter all varmefolie på seg slik at noen havner ut
av rommet og andre krysser vegger.»

**STEG 0.1 — skaden målt.** `setRoomGap` la ALT på nytt, sentrert i rommets BOUNDING-BOKS. I et
skrått rom er boksen større enn gulvet, så «midten av boksen» ligger delvis utenfor polygonet:

| Rom | Striper som ble kortere | Striper som påsto lengde polygonet ikke tillot | Tapt folie |
|---|---|---|---|
| **Skrått rom** | **16 av 21** | **18 av 21** | **5,9 m** (76,8 → 70,9) |
| L-rom (akseparallelt) | 0 | 0 | 0 |
| T-rom (akseparallelt) | 0 | 0 | 0 |

Akseparallelle rom var uskadd fordi boksen der er lik rommets utstrekning langs stripeaksen —
det er derfor feilen virket tilfeldig. **Gyldighetskallet** som nå brukes er
`computeClippedSegments(roomId, direction, pos, productId)` — samme test auto-utlegget bruker.
**Manuelt-flagg finnes ikke:** en stripe har bare `roomId, productId, direction, pos_cm,
start_cm, length_cm`, så manuelt plasserte striper er ikke skillbare fra auto-plasserte i
datamodellen. Punktet om å holde dem utenfor er derfor ikke implementert — det krever et nytt felt.

- `_respaceStrips(roomId, strips, gapCm, anker, utenfor)` — én algoritme for begge veier. Prøver
  ønsket gap; går det ikke, binærsøker den på hele millimeter etter største verdi som faktisk går,
  og panelet sier «⚠ Maks N mm her». Aldri en stille ugyldig plassering.
- `setStripsGap(roomId, stripIds, gapMm)` + chip «⟷ Avstand (3 valgte)». Ankeret (laveste
  `pos_cm`) står stille; rommets `foilGapCm` røres ikke. Ulik retning → egen chip med toast.
- `setRoomGap` beholder gruppens senter i stedet for å sentrere i boksen, med fallback til
  første-stripe-anker og deretter klemming.

**Tre ting jeg tok feil om underveis, alle målt:**
1. Første gyldighetsregel var «hver stripe beholder minst 99 % av lengden». Det er umulig i et
   skrått rom, der hver posisjon har ulik plass — resultatet var at INGENTING flyttet seg.
   Riktig regel: stripa får bli kortere, men må **klippes på nytt** der den havner
   (`_stripBestSegment`). Det var jo nettopp «krysser vegger» Kenneth meldte.
2. «Har stripa noe plass» er ikke «ligger stripa i rommet». Et oppsett slapp gjennom der gruppa
   strakk seg fra −7,5 til 407,5 i et rom som er 0–400, fordi delen som lå inne ga et segment.
   La til en fotavtrykk-sjekk mot rommets akse-utstrekning med veggmargin.
3. Overlapp-kravet brukte `_effectiveGapCmPair` = max(brukerens preferanse, leverandørminimum).
   Med preferansen på 8 cm veto-et ANKERET — som ikke engang flytter seg — en helt lovlig 4 cm.
   Nå: produktets minimum, og striper som ikke flytter seg sjekkes ikke.

**Testet:** skrått rom og L-rom 2 → 3 cm → 0 striper utenfor, 0 som påstår for lang lengde, gapet
nøyaktig 3 cm. Rektangel med 19 striper → klemt ærlig til 1,8 cm (maks som får plass). Utvalg av
3 av 10 → bare de to bak ankeret flyttet, 8 urørt, 4 cm mellom dem, naboen utenfor urørt,
`room.foilGapCm` uendret, og Ctrl+Z ga alt tilbake i ett steg. Ulik retning → chip med toast.
Ny `_gapRegressionTest` (11 sjekker) + alle ni øvrige grønne — 158 sjekker totalt.

**Testfelle verdt å huske:** `setRoomGap` kaller `_savePrefs()`, så mine egne testkall skrev
`S.varmefolie.gapCm = 20` til localStorage. Det fikk `_foilRegressionTest` til å feile på
dekningsgrad ved neste last — en «regresjon» som utelukkende var min testforurensning.

**Fil:** index.html.

---

## DWG: toolbar-knappen gikk utenom valget, og modalen spurte om målestokk — 2026-09-30

Kenneth, etter at 021 var ute: «dwg feiler fortsatt.. jeg får mange valg på hva som skal
importeres. jeg får valg på størrelse, jeg trodde dwg slapp å få skalering?»
Motor-halvdelen: `lumelo-backend` `21f3ccc`.

**Jeg fikset bare ÉN av tre innganger i 021.** «Mange valg på hva som skal importeres» var
lag-velgeren — altså landet han fortsatt i vektorveien:
- `_emptyPickImport` (toolbar «Importer plantegning» OG tom-tilstandens slipp-sone) kalte
  `_autoReadStart(f)` direkte, som for DWG hoppet rett i `_pdfImportPickLayers` — utenom
  valgdialogen 021 la inn. Nå kaller den `_startImportFile(f)`, samme dispatcher som et filslipp,
  slik kommentaren over `_importPlanMenu` alltid har hevdet at den gjorde.
- Samme feilklasse som sone-gaten i 008-010: **én rute er ikke nok — finn ALLE inngangene.**

**«Valg på størrelse» var aktivt feil, ikke bare unødvendig.** Lag-modalen spurte om
papirmålestokk («1:100») og `_pdfImportRun` regnet `meters_per_point = ratio × 0.0254 / 72` —
PDF-formelen. For en mm-tegning ga det **0,0353 der riktig svar er 0,001: 35× feil.**
Motoren sender nå enhetene med lag-lista; `_engineFetchLayers` returnerer `{layers, units,
mmPerUnit}`, modalen skjuler målestokk-feltet og viser «Målestokk fra fila — tegningen er i mm»,
og `_pdfImportRun` bruker `mmPerUnit / 1000`. En PDF beholder målestokk-feltet uendret.

**Og så det ubehagelige funnet: romgjenkjenningen finner NULL rom i denne tegningen.** Med
riktig målestokk og et fornuftig minsteareal gir 0,5 / 1 / 2 m² alle **0 rom** — de «10 rommene»
var fragmenter under 0,3 m². CAD-vegger er doble streker med skravur og lukker seg ikke til
flater motoren kan polygonisere. Derfor er valgdialogen SNUDD for DWG/DXF: «Legg inn som
plantegning» er nå Anbefalt, og automatikken er ærlig merket «Virker sjelden på CAD-tegninger
der veggene er doble streker — da får du ingen eller rare rom.» PDF-er er uendret.

**Testet ende-til-ende med Kenneths fil:** toolbar-veien gir nå valgdialogen; rekkefølgen er
underlag først; «Legg inn som plantegning» ga 20,1 × 24,3 m, ingen kalibrering, 1982 × 2400 px.
Lag-modalen for DWG viser «Målestokk fra fila», PDF-modalen beholder feltet. Alle åtte
regresjonstester grønne (137 sjekker).

**Fil:** index.html.

---

## DWG blir en vanlig plantegning — samme valg og samme underlag som PDF — 2026-09-30

Kenneth, etter at 020 var i produksjon: «det ble ikke vellykket. jeg ønsker å importere dwg filen
som en vanlig plantegning, på lik linje som en pdf plantegning.» 020 løste feil problem — jeg
bygde vektorveien (DWG → ferdige rom), mens han vil ha tegningen som UNDERLAG å tegne oppå.
Motor-halvdelen: `lumelo-backend` `67200b5`.

**Hvorfor vektorveien ikke duger for denne tegningen — målt:** romgjenkjenningen ga **590 «rom»**
med alle lag og 10 merkelige med vegg-lagene. Kenneth: «lag-velgeren kom, resultatet ble rot.»

- **`_startImportFile` sa før «vektor → auto, ingen spørsmål» for DWG.** Nå faller DWG gjennom til
  NØYAKTIG samme flyt som en PDF: «har etasjen alt en plantegning?» → `_rasterMethodChoice` →
  «la appen finne rommene» eller «jeg tegner selv». Den felles delen er skilt ut som
  `_startImportFileRaster`, fordi DWG må innom den asynkrone capabilities-sjekken først.
- **`_loadFileAsBackground` er SNUDD.** Sto før: «DXF/DWG er vektor (ingen rasterbar bakgrunn) →
  rut til motorens vektor-import». Men en vektortegning kan tegnes til et bilde like godt som en
  PDF-side. Nå: `_loadBgDwg`.
- `_loadBgDwg` speiler `_loadBgPdf`: hent SVG fra motoren → `Image` → `_installBgImageForFloor`.
  Alt etterpå (Bytt plantegning, etasjevalg, Flytt underlag, opasitet, utskrift) virker uendret,
  fordi det er et helt vanlig `S.bgs`-objekt.
- **`img.decode()` framfor `onload`:** uten den er `naturalWidth` 0 i det øyeblikket
  `_installBgImageForFloor` leser den, og hele plasseringen blir feil.
- **Ferdig kalibrert når fila vet det selv.** `$INSUNITS` → cm direkte, `_needsCalibration = false`
  (samme grep kart-bakgrunnen bruker), og toasten sier «målestokk fra fila». Mangler enhetene,
  faller vi tilbake til nøyaktig samme kalibrering som en PDF.
- Vektorveien er BEHOLDT — den er nå et valg, ikke noe man tvinges gjennom.

**Testet med Kenneths egen fil, ende-til-ende i appen:** slipp → valgdialogen «Fant en
plantegning» kom (samme som PDF) → «Jeg tegner selv» → underlag på 20,1 × 24,3 m,
`_needsCalibration: false`, bilde 1982 × 2400 px (~1 cm i verden per piksel), BAKGRUNN-panelet og
tegneverktøyene framme. Alle åtte regresjonstester grønne (137 sjekker).

**Fil:** index.html.

---

## Native .dwg-import: motoren konverterer, klienten sier tydelig fra — 2026-09-30

Kenneth: «Første gang jeg prøver å dra en DWG-fil inn i Varmeplan — det lot seg ikke gjøre.»
Fila: 1,2 MB, AC1032 (AutoCAD 2018). Hoveddelen ligger i `lumelo-backend` (commit `2ed9c30`,
egen endringslogg der); dette er klient-halvdelen.

**STEG 0 — svaret på «var det 415 eller avvist før sending?»: 415.** Klienten avviste den aldri
— `.dwg` står i `_IMPORT_EXTS` og i alle `accept`-attributtene, så fila ble lastet opp og
motoren svarte 415. Det Kenneth så var toasten «Native .dwg støttes ikke ennå».

- `_engineDwgCapability()` spør `GET /import/dwg/capabilities` og cacher svaret per økt.
  **Fikk vi ikke kontakt, caches INGENTING** — et nett-blaff skal ikke låse oss til «ingen
  DWG-støtte» resten av økta, og selve importen gir uansett sin egen tilkoblings-dialog.
- `_dwgBlockedBeforeUpload(file)` kalles først i begge `.dwg`-inngangene (auto-lesing og
  lag-velgeren). `dwg: null` → beskjed **før** opplasting i stedet for etter.
- **To ulike svar fra motoren gir to ulike beskjeder.** 415 = «motoren kan ikke .dwg i det hele
  tatt» → lagre som DXF. 400 på en `.dwg` = «vi prøvde, denne fila gikk ikke» → egen tekst med
  DWG-versjonen plukket ut av `detail` («versjon AC1036»). Før 020 var begge samme toast.
- Alle fire meldingsstedene leser nå `_DWG_NO_SUPPORT_MSG` / `_dwgConvertFailMsg` — én kilde.

**Testet mot ekte motor lokalt** (to instanser, én med og én uten konverterer):
- Motor med LibreDWG → `capability: 'libredwg'`, `.dwg` slipper gjennom; en ødelagt AC1032-fil
  ga 400 → toast «Klarte ikke å konvertere denne .dwg-fila (versjon AC1032) …», og
  capability-cachen ble **ikke** forgiftet.
- Motor uten konverterer → `capability: null`, blokkert før opplasting med riktig toast; et
  direkte kall ga 415 med samme tekst. `.dxf` blokkeres aldri.
- Kenneths ekte fil gjennom motoren: **200, 10 rom, 0,58 s**.
- Alle åtte regresjonstester grønne (137 sjekker).

**Kenneth kan gjøre (valgfritt, gir best kvalitet):** last ned ODA File Converter for Linux
(.deb) fra oda.com, legg den i `lumelo-backend/oda/`, `fly deploy`. Da brukes ODA foran
LibreDWG automatisk. Ikke commit .deb-en — den ligger i `.gitignore`.

**Fil:** index.html.

---

## Ctrl/⌘+S lagrer faktisk — snarveien har aldri vært implementert — 2026-09-29

Kenneth: «fiks Ctrl+S». Oppfølging av funnet i 017: Lagre-knappens tooltip har sagt «(Ctrl+S)»
siden den ble laget, men det fantes **ingen tastehåndterer noe sted i fila** og ingen rad i
`_SHORTCUTS`. Målt: et `keydown` med `ctrlKey` + `s` kalte ikke `saveProject` — det gikk rett til
nettleserens egen «lagre side». Gjaldt alle moduler, ikke bare liste.

- Grenen ligger **først** i `keydown`, med vilje FØR `INPUT/TEXTAREA`-vakten: en lagre-snarvei
  skal virke midt i at man skriver et romnavn, slik den gjør i alle andre programmer.
- `preventDefault()` kjøres **uansett** om vi lagrer eller ei — halve jobben er å stoppe
  nettleserdialogen. `_ctrlSCanSave()` avgjør om selve lagringen skjer, med fire nei-er:
  ingen prosjekt lastet, prosjektlista/dashbordet framme, dokumentasjons-/reklamasjons-
  veiviseren framme (egne fullskjerm-overlegg), eller presentasjonsmodus (read-only for kunde).
- `Ctrl+Shift+S` fanges ikke — den er reservert.
- Ny rad i `_SHORTCUTS` («Alltid» → ⌘S/Ctrl+S → «Lagre prosjektet»), som CLAUDE.md krever ved
  hver ny hurtigtast. Verifisert at den faktisk tegnes i `?`-panelet.
- Ikke modul-gatet: `saveProject` leser `S.project`, ikke lerretet (verifisert for `list` i 017).

**Testet, ni punkter:** app + prosjekt → lagrer; midt i et tekstfelt → lagrer; ⌘S på Mac →
lagrer; Ctrl+Shift+S → ikke fanget; prosjektlista framme → lagrer ikke, men stopper
nettleserdialogen; presentasjonsmodus → samme; `#doc-screen` framme → samme; uten prosjekt →
samme; raden vises i `?`-panelet. `saveProject` selv er urørt. Alle åtte regresjonstester
grønne (137 sjekker).

**Fil:** index.html.

---

## Fil-knappene i topbaren også i Hurtig prosjektering — 2026-09-29

Kenneth: «Jeg ønsker å ha knappene for lagre, eksportere, PDF m.m. på liste-modulen også.»

Fil-gruppa lå i `<span class="tb-grp" data-modules="indoor stair snow">`, og
`updateTopbarForModule` skjuler alt som ikke nevner aktiv modul — listemodulen heter `list`.
MÅLT i listemodul før endringen: **hver eneste** topbar-gruppe skjult, bare logoen sto igjen.

- `list` lagt til på fire elementer: separatoren etter logoen, `?`-brikken, separatoren før
  fil-gruppa og fil-gruppa selv.
- **Avvik fra bestillingen, med grunn:** den SISTE separatoren (før zoom-gruppa) fikk IKKE `list`.
  Zoom er lerret-only og blir skjult, så et `list` der ville gitt en løs, hengende strek på
  slutten av topbaren. Verifisert: begge synlige separatorer har innhold på hver side.
- Funksjonene bak knappene virket hele tiden — de leser `S.rooms`/`S.project`, ikke lerretet.

**STEG 0.2 — ingen avvik.** Med et reelt listeprosjekt (2 rom, label-kabler, 99/100 W/m²):
- PDF kjørte feilfritt og inneholdt forside, **Romoversikt med begge listerommene** og
  **Materialliste med begge produktene**. Eksportdialogens rom-avkrysning viste «Alle rom (2)
  Bad Gang» — punkt 4 krevde derfor ingen endring.
- `_exportMaterialListXLSX()` ga en 23,8 kB `.xlsx`.
- `_showGbao10ExportDialog()` åpnet med filnavn og 2 artikkellinjer; Visma-paste-dialogen åpnet.
- `.btn-visma-paste`/`.btn-gbao10` har ingen `data-modules` og styres kun av
  `_updateVismaPasteButton` (org-ens `erp_format`) — uendret oppførsel i liste, verifisert synlig.

**Presentasjon er SKJULT i liste.** MÅLT at den ikke fungerer for et listeprosjekt: listerom har
`points: []`, så lerretet tegner ingenting (kun målestokkslinja), og present-baren viste
«0 Rom · 0.0 m² · 0 W» for et prosjekt med 2 rom, 10 m² og 995 W. `#chip-present` fikk derfor
sitt eget, smalere `data-modules="indoor stair snow"`. «Send til montør» hadde alt `indoor`.

**Funn som motsier bestillingen: Ctrl+S finnes ikke.** Knappen har tooltip «(Ctrl+S)», men det er
ingen tastehåndterer for den noe sted i fila, og ingen rad i `_SHORTCUTS` — verken i liste eller
innendørs. Målt: et `keydown` med `ctrlKey` + `s` kaller ikke `saveProject`. Ingen ny hurtigtast
ble lagt inn (bestillingen sa eksplisitt nei), så tooltipen er fortsatt misvisende — rapportert.

**Testet:** liste viser ? / Lagre / Versjoner / Åpne / PDF / Excel / Visma ×2 — Send til montør,
Presentasjon, tegneverktøy og zoom skjult. Innendørs uendret (alle 21 knapper). Alle åtte
regresjonstester grønne (137 sjekker).

**Fil:** index.html.

---

## Kabel: CC over anbefalt maks er advarsel, ikke sperre — 2026-09-29

Kenneth: «Innendørs – kabel – 17T – ønsket flateeffekt settes lavt, f.eks. 60 W/m². Appen vil
ikke foreslå mindre kabel enn InFloor 17T 900W 54 m, som gir 85 W/m². Jeg ønsker ikke å ha noen
regel på dette, men kan få en advarsel når man velger CC mer enn 20 cm.»

**STEG 0 — reprodusert med ekte katalog (165 kabelprodukter):** i et 10,6 m² rom ved 60 W/m² var
de fire nærmeste kandidatene alle forkastet på `ccValid`: 600 W/35 m (CC 30,3 / 56,1 W/m²),
700 W/41 m (25,9), 500 W/29 m (36,6), 800 W/47 m (22,6). Første kandidat med CC ≤ 20 var
900 W/54 m (19,6 cm, 85 W/m²) — nøyaktig det Kenneth så.
*(Promptens tall «600 W/36 m, CC ≈ 29» var nær, men katalogen har 600 W/**35** m → CC 30,3.)*

**Grensen må komme fra produktet:** InFloor 17T = 200, InSnow 20/30/40T = 200, **InFloor 10T =
500** (noen hadde alt utvidet den der), FLXHEAT 8W/m = null. Aldri hardkodet 20 cm.

- `_ccLimits(prod)` — én kilde til `minSp` (HARD, fysisk, urørt), `maxWarn` (produsentens
  anbefaling = `max_spacing_mm`) og `maxHard` (teknisk tak, nytt valgfritt `max_spacing_hard_mm`,
  tomt = 500 mm). `Math.max(…, maxWarn)` så et produkt over 500 aldri får tak under egen anbefaling.
- `_ccOverWarn` / `_ccWarnText` / `_roomCcOverWarn` / `_ccWarnToast` — ÉN sannhet som footer,
  toast, lerret-label, romkort, romlista og PDF alle leser, så de ikke kan si hver sin ting.
- **STEG 0.2, 27 steder fordelt på tre klasser:** 7 KANDIDATFILTRE (`selectCableByPower`,
  `selectMultiCables`, `_generateMixedCombos`, `_mixComposerStats`, `_cableLabelOnlyStats`,
  `_listSuggestCableFrom`, `_listProductOptionsHtml`) → gyldig opp til `maxHard`, merket med
  `ccOverMax` imellom. 16 MOTOR-/KLEMMESTEDER → `maxHard`. 2 trappesteder
  (`_stairSpacingDelta`, `getStairCableViolations`) RØRT IKKE — egen modul med egne låste regler.
  `getCableViolations` meldte allerede `maxSpacing`; den veien er gjenbrukt, ikke duplisert.
- `_cableSpacingDelta` (manuell CC-stepper) stopper ikke lenger på 20 cm.

**Funn underveis 1 — en blind heving av taket ødela skew-motoren.** Flere motorer GROVSVEIPER
`minSp..maxSp`, så et videre område gir andre kandidater og et annet vinnerutlegg; målt falt
`_cableSkewRegressionTest` E fra «skew» til «serpentine-fallback» i to av tre soner. Rettet med
`_ccSearchMaxCm(prod, room)`: behold anbefalingen som tak, løft KUN så høyt kabelens egen lengde
(eller en påtvunget CC fra soner/N-deling) krever. Er den lengdedrevne CC-en under anbefalingen,
er søkeområdet bit-for-bit som før.

**Funn underveis 2 — testen som var grønn låste et fysisk umulig utlegg.** `_buildNCableZones`
klemte felles CC til anbefalingen (20) i stedet for den lengdedrevne verdien (60 m² / 3 × 40 m =
50 cm). MÅLT på gammel kode: alle tre soner la **95,9 / 86,9 / 95,9 m av en 40 m kabel**, og
`getCableViolations` flagget `maxLength`-brudd på alle tre — mens testen sto grønn, fordi den
bare spurte hvilken MOTOR som vant. Sjekkene i E er byttet med invarianter som fanger dette:
ingen sone legger mer enn produktets lengde, felles CC = 50, alle soner deler CC.

**ÅPENT, rapportert til Kenneth:** ved den brede (riktige) CC-en faller 2 av 3 uregelmessige
delpolygoner fra skew til `serpentine-fallback` og legger ~24,5 av 40 m. Mindre galt enn før
(ingen overskrider lengden nå), men ikke bra. Dokumentert som en egen sjekk i E med terskel 55 %,
så det ikke blir borte.

**Testet:** 60 W/m² → beste forslag nå 600 W/35 m (56,2 W/m², CC 30,3, merket), lagt på 28,6 cm
→ 59 W/m² i rommet. 100 W/m² → 1100 W/65 m, CC 16,3, ingen advarsel, utlegg uendret. Kun label →
CC 30,3 (ikke klemt). Flere kabler 2× → 300 W/18 m, CC 29,4, merket. CC under `min_spacing_mm`
og over `maxHard` avvises fortsatt. Footer viser advarselen OG beholder GODKJENN. Lerret-labelen
målt fra canvas: «59 W/m² flate · 58 W/m² BTA · ⚠ CC 28.6 cm». Romkortet: «c/c-avstand 28.6 cm
⚠ over anbefalt maks 20 cm». Ny `_ccWarnRegressionTest` (20 sjekker) + alle sju øvrige grønne
— 150 sjekker totalt.

**Fil:** index.html.

---

## AGENTS.md slettet — CLAUDE.md er eneste instruksjonsfil — 2026-09-29

`AGENTS.md` lå usporet i repoet fra 18.09.2026. Den var en kopi av `CLAUDE.md` med «Claude»
byttet til «Codex», laget for at andre kodeverktøy skal lese samme prosjektinstruksjoner.

**Hvorfor den ble slettet — den hadde allerede driftet:**
- **14 diff-linjer bak `CLAUDE.md`.** Hele kart-avsnittet manglet, inkludert regelen «kalibrer,
  roter, speilvend eller skaler aldri en geo-bakgrunn». Den regelen er av den farlige sorten:
  brytes den, blir alle koordinater feil UTEN at noe ser galt ut.
- **Pekte på stier som ikke finnes:** `.Codex/launch.json` og `docs/Codex/`. De virkelige er
  `.claude/launch.json` og `docs/claude/`. Et verktøy som leste fila, lette forgjeves.
- Ingen merket noe av dette på ti dager — det kom fram først da filene ble diffet 29.09.2026.

Ingen commit: fila var aldri sporet i git, så det finnes ingenting å registrere. Vurdert og
forkastet: `.gitignore` (skjuler en fil som er feil i stedet for å rette den) og symlink til
`CLAUDE.md` (aktuelt kun om Codex faktisk tas i bruk på repoet).

**Regel videre:** dukker det opp en ny parallell instruksjonsfil (`AGENTS.md`, `.cursorrules`
e.l.), gjøres den til en symlink til `CLAUDE.md` eller slettes — to kopier vedlikeholdes ikke.

**Fil:** AGENTS.md (slettet).

---

## Filnavn for PDF og Visma-fil: samme mønster som Cenika Flow — 2026-09-28

Kenneth: «Utskrift PDF-filnavn må også være med firmanavn og merking. Det bør også gjelde for
Visma-fila. Slik døper vi Visma-fila fra Cenika Flow:
`{type}_{kundenavn}_{merking}_{ÅÅÅÅMMDD-TTMM}_{initialer}_{doc_no}.txt`.» Erstatter filnavn-delen
av 012 (`88aab18`).

Ny felles form — ÉN navnebygger `_docFileName(type, ext, extra, stamp)` for begge filene:
`tilbud_Elektro-24-AS_8575_20260928-1056_KS_P0264.txt` og
`varmeplan_Elektro-24-AS_8575_20260928-1056_KS_P0264_rev1.pdf`.
`doc_no` i Cenika Flow er dokumentnummeret; Varmeplans motstykke er prosjektnummeret.

**STEG 0 — tre av promptens antakelser måtte rettes:**
- `_projectCustomerName()` **fantes ikke**. Den ekte oppløsningen lå inline i `_gbao10Build`
  (:57784): `proj.customer_id` → `_cachedCustomers` → ellers `proj.customer`. Løftet ut som egen
  funksjon, så PDF-en (som ikke har noe `built`-objekt) kan bruke samme kilde.
- **`_userInitials()` leser IKKE profilens `initials`-felt.** Den utleder fra navn/e-post; det er
  `_plResponsibleInitials` (:59552) som bruker det lagrede feltet. `_profileInitialsForFile()`
  leser derfor `initials` først og faller til `_userInitials()`. `_userInitials()` er urørt.
- **Visma-dialogen hadde ikke noe tidsstempel i det hele tatt**, så spørsmålet var ikke om det
  fryses, men at det MÅ fryses: `_gbao10RenderDialog()` kjøres på nytt ved hvert type-bytte,
  merking-endring og EL-valg. `_gbao10Stamp` settes én gang når dialogen åpnes, og brukes av BÅDE
  forhåndsvisningen og `_gbao10Export` — så navnet verken tikker mens man ser på det eller
  avviker fra fila som faktisk skrives. PDF-en lager sitt i selve lagringen (ingen dialog å tikke i).

- `_safeName(v, fallback)` — én sanitering i stedet for tre nesten like. Understrek er FELTSKILLET,
  så `_` renses til `-` inne i hver del. `Folie/2026: del_1` → `Folie-2026-del-1`.
- `_projectMerking()` — Visma-dialogens lagrede merking, ellers prosjektnavnet. PDF-en arver den,
  så de to filene for samme jobb heter likt bortsett fra type og endelse.
- Maks 150 tegn: **merkingen** klippes, aldri kunde/tid/initialer/doknr — de identifiserer fila.
- Kallsteder: `_exportFileName` hadde **ett** (`doc.save`, :50565) og beholdes som tynn wrapper;
  `_gbao10FileName` hadde **to** (dialogens forhåndsvisning :57965 og `_gbao10Export` :58017),
  begge nå uten argumenter.
- **Én utilsiktet endring, bevisst:** den gamle PDF-formen utelot P-feltet helt uten et ekte
  prosjektnummer. Det faste sjuledds-mønsteret krever en plassholder, så det blir `P0`.
- `_gbao10SaveMerking` tegner nå dialogen på nytt, ellers viste forhåndsvisningen gammel merking.
- Kollisjonsvernet fra 012 (`_2`, `_3`) er urørt — med tidsstempel slår det bare inn ved to
  eksporter samme minutt, men det er nettopp da det trengs.
- Profilens Initialer-felt: «… og brukes i filnavn på PDF og Visma-fil». Uten navn, initialer og
  e-post → `XX` + toast «Legg inn initialer i profilen — de brukes i filnavn», én gang per økt.

**Testet** (klokka frosset til 2026-09-28 10:56): Kenneths eksempel eksakt for både Visma og PDF;
ordre → `ordre_…`; ukoblet kunde → fritekstfeltet; uten begge → `Ukjent-kunde`; egne initialer
«KSK» → `_KSK_`; merking med `/` og `:` renset; uten prosjektnr → `P0`; merking arvet fra
prosjektnavnet; 200-tegns merking klippet til nøyaktig 150 tegn med hale
`_20260928-1056_KS_P0264.txt` intakt; frosset stempel sto stille mens klokka tikket til 11:42
mens PDF-en fikk den nye tiden; toast kun første gang. Alle sju regresjonstester grønne.

**Fil:** index.html.

---

## Hindring oppå folie: eksklusivt valg, hindring vinner klikket, Bredde vannrett — 2026-09-28

Kenneth: «Når jeg setter inn en hindring etter at jeg har lagt ut varmefolien, får jeg markert
hindringen, men når jeg velger Roter, får jeg bare rotert en av foliebreddene, ikke selve
hindringen. Når jeg setter mål (lengde × bredde) på hindringen og setter inn, er lengde og bredde
motsatt — bredde bør være horisontalt.» Commit `bf54b28`.

**STEG 0 — promptens hypotese om «to overlappende ringer» ble AVKREFTET.** Jeg instrumenterte
gizmo-kallene: `{folie_tegnet: 1, hindring_tegnet: 0}`. Render-kjeden er en `else if`-kjede med
stripe FØRST, så hindringens ring **tegnes aldri**. Men den er samtidig TREFFBAR: i samme punkt
returnerte `hitHindringRotHandle` treff mens `hitFolieRotHandle` ikke gjorde det. Brukeren ser
folias ring, griper den, og folien roterer. Rotårsaken var at BEGGE objektene var valgt samtidig
— ikke at to ringer ble tegnet.

- `_clearProductSelection()` — ÉN ting valgt om gangen. Kalles fra alle fire veier som velger en
  hindring (kropp-klikk, `selHindringItem`, `selHindringWall`, `hindringCtxMenu`). Motsatt vei
  rydder hindringsvalget i `selStrip` og `selectCable`.
- **Klikket måtte også LANDE på hindringen, og det krevde to grep — målt hver for seg:**
  1. `_buildCycleCandidates`: hindringen (polygon-treff, ikke bbox) lagt inn FØR stripa, og det
     senere bbox-baserte innslaget av-duplisert. Målt: `["hindring:9001","strip:4","room:5001"]`.
  2. **Det var ikke nok.** Ved `idx 0` faller klikk-syklingen med vilje gjennom til den vanlige
     select+drag-flyten (for å bevare draget) — og der lå «Strip body click» først. Nedfallsveien
     fikk derfor sin egen hindring-vinner-gren. Målt før den: `branch_evaluert: 0`, stripa valgt.
     `ptInPoly`, ikke `hitHindring` sin bbox: en L-formet hindring ville ellers gjort folien
     uklikkbar i hjørnet som ikke er hindring. Gjentatte klikk sykler fortsatt videre til folien.
- Målfeltet: `hindring-w-inp`/«Lengde» + `hindring-h-inp`/«Bredde» byttet til
  `hindring-bredde-inp` (vannrett) + `hindring-lengde-inp` (loddrett), etikett
  «Mål — Bredde (↔) × Lengde (↕)». `confirmHindring` leser nå `hw` fra Bredde-feltet.
  Sidebar-raden og objektinfo viste allerede x-utstrekningen først — uendret.

**Målt etter:** klikk i hindringen → `{hindring: 9001, strip: null}`, ctxbar «Hindring …».
Rotasjonsmodus → `{folie_ring: 0, hindring_ring: 1}`. Dra ringen 90° → hindringen 120×100 →
100×120, alle 6 folie-striper uendret. Klikk folien utenfor hindringen → `{hindring: null,
strip: 2}`, ctxbar «Stripe …». Bredde 120 / Lengde 60 → 120 cm vannrett, 60 cm loddrett; sidebar
«120 × 60». Alle sju regresjonstester grønne.

**Testfelle verdt å huske:** første ende-til-ende-klikktest ga «ingenting skjedde» — canvas var
0×0 fordi ingen skjermbilde hadde tvunget layout ennå, så klikk-koordinatene bommet. Etter et
skjermbilde passerte samme test uendret.

**Fil:** index.html.

---

## Visma-eksport: filnavn `Varmeplan_P<nr>_<kunde>_<merking>` — 2026-09-26

Kenneth: filnavnet var `tilbud_P0260_P0260-Varmefolie-25-09-2026-REV-2_20260926-0752.txt` —
P-nummeret to ganger, REV og tidsstempel på. Ønsket:
`Varmeplan_P0260_Omland-Elektro-AS_Varmefolie-25-09-2026.txt`. Commit `88aab18`.

- `_gbao10FileName(projectNo, customerName, merking)` — `type` er ute av signaturen: Tilbud/Ordre
  styrer INNHOLDET, ikke navnet, så de gir nå samme filnavn. Begge kallstedene oppdatert.
- Kundenavnet: kunderaden når kunden er koblet (samme `_cachedCustomers`-oppslag `kundenr` bruker),
  ellers prosjektets fritekstfelt, ellers `Ukjent-kunde`. Tom merking → `eksport`.
- Sanitering som `_exportFileName`, men `_` → `-` (så `_` kun skiller de fire delene) og gjentatte
  bindestreker slås sammen — «Folie/2026: del» ga ellers `Folie-2026--del`. Maks 120 tegn:
  MERKINGEN klippes, aldri kunden eller prosjektnummeret (de identifiserer fila).
- `_gbao10DefaultFilenameMerking` **fjernet** — den ga «P0260 … REV 2» og var hele grunnen til
  dobbelt P-nummer. `filenameMerking` er ute av `_gbao10Build`, og den villedende DEL B-kommentaren
  er erstattet.
- **Kollisjonsvernet er flyttet, ikke fjernet.** Tidsstempelet vernet mot at to eksporter til samme
  delte tilbudsmappe overskriver hverandre. `_gbao10WriteToFolder` hadde allerede et vern, men som
  et «Overskrive?»-spørsmål — rimelig da kollisjon var sjeldent. Uten tidsstempel er kollisjon
  normalt, så spørsmålet er byttet med **auto-suffiks**: første ledige `…_2.txt`, `…_3.txt`, med
  toast om hva fila ble hetende. Ved nedlasting gjør nettleseren det samme selv.
- Testet: Kenneths eksempel eksakt; tom kunde/merking; uten prosjektnummer; `Å/B:C AS` +
  `Folie/2026: del_1` → `Å-B-C-AS` + `Folie-2026-del-1`; 200-tegns merking klippes til 120;
  koblet vs. ukoblet kunde; kollisjonsvernet hopper til `_3` når både originalen og `_2` finnes.

**Fil:** index.html.

---

## Soner tar hensyn til rommets hindringer — og «+ Hindring» i valgt sone — 2026-09-25

Kenneth: «Varmekabel tar ikke hensyn til hindringen jeg lagde i rommet før jeg opprettet sone. Jeg
får heller ikke mulighet til å lage hindring i en valgt sone i ettertid.» Commit `7e5e384`.

**STEG 0 — målt:** alle motorene finner hindringer via `h.roomId === room.id`, og sonens temp-rom
har en syntetisk id. Sonen var derfor bokstavelig talt TOM: 0 hindringer, `hindArea: 0`, og
kabelen la **352 av 1964 målte punkter (17,9 %) rett inne i trappa**. Samme rom UTEN soner ga
44 av 2955 (1,5 %) — motoren respekterer hindringen når den kjenner den.
*(Første måling viste 0 % og var FEIL: jeg samplet bare segment-endepunkter, så en bane tvers
gjennom hindringen ble ikke talt. Rettet til sampling hvert 5. cm langs banen.)*

**Klippes ikke — og det er målt trygt.** Ingen generell polygon-mot-polygon-klipper finnes i fila,
og soner fra «Del i soner» kan ha skrå delelinje. Motorene TÅLER en uklippet hindring: verken en
2 × 2 m hindring på et 1 × 1 m rom eller en halvveis utenfor kastet feil — de subtraherer/klipper
mot rommet selv. En hindring som dekker begge soner respekteres derfor i BEGGE, som er riktig:
den er fysisk der.

- `_soneShadowHindrings(zone, room, tid)` + push/cleanup i `_withSoneAsRoom`: rommets hindringer
  kopieres med temp-rommets id (`tmpsoneh_<id>`, `_soneShadow: true`) når bbox overlapper sonen.
  Samme grep `_buildNCableZones` allerede bruker for sine delrom — ingen motor endres, og ALLE
  veier arver det gratis. Opprydding i `finally`, også når `fn` kaster.
- `tmp.area` blir stående som BRUTTO med vilje: `roomAreas()` trekker fra hindringsarealet selv, så
  å skrive netto inn i `area` ville gitt DOBBEL subtraksjon ved neste kall.
- **Funn:** `showCablePlacePanel` hentet temp-rommet UT av scopet og kalte `roomAreas` etterpå — da
  er skyggene ryddet, så panelet viste sonens BRUTTO (14,7 m² der riktig svar er 11,6). Arealet
  regnes nå inne i scopet.
- «+ Hindring» i sone-ctxbaren. `startHindringMode` bruker `_placeTarget()`: hindringen eies av
  ROMMET (den er fysisk og skal telle der), men dimensjons-modus sentrerer i SONENS polygon. Har
  sonen alt utlegg → toast «legg ut produktet på nytt», ingen automatisk re-utlegging.
- Sidebar: hindringsraden får «· i «sonenavn»» når sentroiden ligger i en sone.

**Resultatet, målt:** kabelen går fra 352/1964 punkter (17,9 %) inne i trappa → **0/2385 (0 %)**,
og panelet viser 11,6 m² netto i stedet for 14,7.
`_soneRegressionTest` utvidet 31 → **40 sjekker** (gruppe I). Alle sju regresjonstester OK.

**Fil:** index.html.

---

## Én GODKJENN-knapp under produktvalget — og forhåndsvisning i sone finner det ekte rommet — 2026-09-25

Kenneth: «Jeg får ikke noe valg om GODKJENN, slik at jeg ikke får opp etasje/rom-listen. Jeg ønsker
som standard kun én GODKJENN-knapp rett under der jeg velger kabel for rommet.» Commit `d09088d`.

**STEG 0 — tre feil som forsterket hverandre til en blindvei, alle målt:**

| Målt | Resultat |
|---|---|
| Footer for det midlertidige sone-rommet | **0 tegn** (1185 for det ekte rommet) |
| FERDIG-knappen | `disabled: true` |
| `_computeRoomStats(temp)` | **0 W** (mot 878 W på rommet) |

Panelet tegnes inne i `_withSoneAsRoom`, så footeren slo opp temp-rommet og fant ingen
`_cablePreviewMeta` — den bor på det EKTE rommet. Samtidig låste `_syncRwpDoneEnabled` FERDIG
nettopp fordi det ekte rommet HADDE en ventende forhåndsvisning. Begge veier ut borte samtidig.
Stats ga 0 W fordi kablene etter adopsjonen i 009 har det ekte rommets `roomId`.

**Funn utenfor arbeidsordren:** `showCablePlacePanel` har sin EGEN inline-gate som fortsatt bare så
`fillTargetZoneId`. 009 rettet `_soneGateBlocks` til `_placeTarget()`, men ikke denne — så med
sonen VALGT i sidebar (uten ＋-knappen) viste panelet «velg en sone» i stedet for produktlista, og
da fantes aldri `#cable-selection-results` der footeren skal inn. Den bruker nå samme kilde.

- `_soneTempRoom` bærer `_parentRoomId` + `_zoneId`; ny `_realRoomFor(roomId)` brukes av kabel- og
  matte-footeren. Footeren slår opp TILSTANDEN på det ekte rommet, men regner TALLENE på rommet vi
  står i (sonen) — `statRoom` er bevisst noe annet enn `room`.
- `_computeRoomStats` er sone-bevisst for kabler, folie og matter: temp-rom med `_zoneId` teller
  bare den sonens objekter; ekte rom teller alt (summen).
- **Én knapp:** «✓ GODKJENN» i full bredde → `_confirmCablePreviewAndFinish` (bekreft, så
  `finishRoomWorkflow` — rekkefølgen står). Under: tekstlenka «Angre forhåndsvisning».
  «✓ Bruk» / «✓ Bruk og ferdig» / «✕ Avbryt» er borte. Tallraden beholdt, og footeren sier hvilken
  sone forhåndsvisningen gjelder. Samme i matte-footeren.
- **Sikkerhetsnett:** `_syncRwpDoneEnabled` skjuler FERDIG kun når `[data-godkjenn]` faktisk finnes
  i DOM — og deaktiverer den aldri. Finnes ingen GODKJENN, er FERDIG alltid tilgjengelig, så
  «ingen vei videre» kan ikke oppstå igjen uansett hvilken ny panelvei som legges til senere.
- `_previewZoneId` i meta: `_reapplyCableDirection` gjenoppretter sonen før den kjører
  forhåndsvisningen på nytt — ellers ville en retningsendring flyttet utlegget ut i hele rommet.

`_soneRegressionTest` utvidet 22 → **31 sjekker** (gruppe G og H). Testet live gjennom det EKTE
panelet: sonens tall (14,7 m², 61 W/m², CC 16,5 cm), GODKJENN + Angre, FERDIG skjult; GODKJENN
committer og kabelen består i sonen; Angre rydder og viser FERDIG; rom uten soner samme knapp.
Alle sju regresjonstester OK.

**Fil:** index.html.

---

## Sone som rom, del 3: plasseringen skjer nå faktisk I sonen — 2026-09-25

Kenneth etter 008: «funker ikke enda — jeg ønsker at en sone blir behandlet som et separat rom.»
Skjermbildet viste én kabel som startet i sone 2 og gikk ned gjennom hele sone 1. Commit `528fdc7`.

**STEG 0 — 008 bygde gjerdet, men flyttet aldri gjerningen inn i sonen.** Alt målt:
- Med sonen VALGT i sidebar slapp `_upcPlaceCable` gjennom gaten og la kabel over HELE rommet med
  `zoneId: undefined`.
- `_clearRoomProductCollections` slettet FØRST nabosonens kabel (id 2 forsvant, erstattet av id 3
  uten zoneId) — derfor bare én kabel igjen i skjermbildet.
- `_placeMultiCableProduct` med sone-mål: to kabler, begge uten `zoneId`, og flagget var nullet
  FØR plasseringen.
- 008 sin «sone valgt → lov»-snarvei i gaten **var hullet**: den slapp kallet gjennom uten at
  plasseringen faktisk skjedde i sonen.

**Én regel, ingen unntak: er en sone aktiv, ER sonen rommet.**
- `_placeTarget()` er ÉN kilde til målet — aktiv sone = `fillTargetZoneId ?? selectedZoneId`, rett
  type, og må tilhøre valgt rom. `_activeFillSone()` er nå bare `_placeTarget().zone`, så 008 sitt
  sone-scopede regnestykke dekker endelig også «sone valgt i sidebar».
- `_placeInTarget(productId, fn)` kjører `fn` mot sonens midlertidige rom (synkront, via
  `_withSoneAsRoom`), rydder KUN sonen (`_clearZoneProductCollections`) og adopterer resultatet
  tilbake med `_adoptSoneProducts` → `roomId` = rommet, `zoneId` = sonen. Generalisert fra halen i
  `_fillSoneCable`. `fillTargetZoneId` nulles ett sted: i `finally`.
- `_clearRoomProductCollections` rører ikke lenger sonenes utlegg når rommet har soner — kun
  `zoneId == null`. Det var feilen som spiste nabosonen.
- Gaten er nå enkel: blokker når `_placeTarget().zone == null` og rommet har soner.
- Fem veier gjennom `_placeInTarget`; `_placeCableLabelOnly` regner CC på sonens areal og stempler
  `zoneId`. `_placeCableProduct` sin gamle `fillTargetZoneId`-gren er fjernet — innpakningen gjør
  det samme for alle. Folie-«Automatisk» med aktiv sone rutes til `_fillSoneFoil`.
- Ny `_soneTempRoomId(zone)` — formelen var duplisert og kunne drifte.

**Flerstegs-veier gates ærlig, ikke halvveis.** Manuell utlegging, folie-breddevelger og manuell
plate lever over mange klikk og et panel; sonen måtte vært båret på selve modusen og hvert klikk
klippet mot `_zoneFillablePolygon`. Ny `_soneMultiStepBlocked` sier «… i sone kommer» i stedet for
å legge utlegget stille over hele rommet. Egen sak.

**Ny `_soneRegressionTest()` — 22 sjekker.** Måler det som FAKTISK BLE LAGT, ikke at en funksjon
ble kalt: eierskap (roomId = rommet, zoneId = sonen), at ALL geometri ligger innenfor sonens
polygon (`_cableWorldSegments` + `ptInPoly` per punkt), at nabosonen er urørt (id-er før/etter),
at ingen kabel står igjen uten `zoneId`, at gaten blokkerer uten aktiv sone, at rom uten soner er
uendret, at rom-rydding sparer sonene, og at ingen temp-rom lekker til `S.rooms`.

Kenneths flyt målt ende-til-ende: sone 1 → 1 kabel, sone 2 → «Flere kabler» 2× → 2 kabler, alle
med riktig `zoneId`/`roomId`, begge soner intakte. Alle sju regresjonstester OK.

**Fil:** index.html.

---

## Sone som rom: navn, egne innstillinger, sone-scopet produktpanel, gate på alle veier — 2026-09-25

Kenneth: «Jeg ønsker at et rom som deles i to soner skal behandles som to separate rom … med
undernavn Stue sone 1 og Stue sone 2 — eller at vi kan døpe om sone 1 til valgfritt romnavn.»
Skjermbildet viste kabel lagt over HELE rommet etter at det var delt i to soner.
To commits: `ca7a06f` (del 1) og `c672484` (del 2).

**STEG 0 — gaten lå i feil lag, og det var verre enn antatt.** `showCablePlacePanel` blokkerte bare
PANELET, ikke plasseringen — og unified-panelet, som er hovedveien nå, går helt utenom. Målt på et
rom delt i to soner la **alle** kabelveier ut over hele rommet med `zoneId: null`. Motsatt
rekkefølge (kabel først, så deling) lot kabelen bli liggende med `zoneId: undefined` **uten ett
eneste varsel** — stille dobbelttelling mot sone-utlegget.

- **Navn:** `_soneDefaultName(room, n)` → «Stue sone 1». `_soneHasDefaultName` godtar BÅDE nytt og
  gammelt («Sone 1») format, så soner laget før dette også følger med når rommet døpes om.
  `_renameSonesWithRoom` henger på `startRename`: soner med standardnavn følger rommet, soner
  brukeren selv har navngitt («Entré») røres ikke.
- **Omdøping som et rom:** `renameSone` bruker ikke lenger `prompt()`. `startRenameSone` er
  inline-felt i sidebar-raden, speilet fra `startRenameStair`. Tomt navn → standardnavnet tilbake.
- **Egne innstillinger:** `roomType`, `targetWm2`, `control` på sone-objektet, arvet fra rommet ved
  oppretting. `_soneTempRoom` leser sonens verdier med `??`-fallback, så eldre soner er uendret.
- **Gate på PLASSERINGS-laget:** ny `_soneGateBlocks` + `_soneGateToast`, kalt fra **ni** veier —
  `_cablePreviewPlace`, `_placeCableLabelOnly`, `_placeMultiCableProduct`, `_upcPlaceCable/Mat/
  Foil/Plate`, `startManualPlace`, `_placeCableProduct`. Den siste hadde allerede en gren for «sone
  VALGT», men ikke for det motsatte (rom med soner, ingen valgt) — og slapp derfor kabel gjennom.
- **Deling av rom som alt har utlegg** spør nå FØR delingen: fjern, eller behold og merk
  `_legacyWholeRoom` (⚠-rad i sidebar). Rom uten utlegg spør ikke.
- **Panelvalget (del 2) ble avgjort ved måling.** Prompten foreslo et midlertidig rom i `S.rooms`
  mens panelet er åpent; jeg målte at et slikt rom **havner i prosjektfila** ved lagring og gir en
  ekstra sidebar-rad. Løsningen ble samme idé, men **strengt synkront**: `_withSoneAsRoom` pusher,
  kjører, rydder i `finally`. Fordi alt panelet regner slår opp rommet via `roomId`, ble hele
  panelet sone-scopet uten å endre `roomAreas`/`selectCableByPower`/`selectMultiCables`.
  `_updateCableSelection` og `_upcRenderCableResults` er splittet i wrapper + `…Inner`, der
  kroppene er ord for ord uendret.
- **Sidebar:** `_soneRowsHtml` gir innrykkede sone-rader (navn · areal · meter · styring) med
  blyant og ＋.

**Beviset** — samme rom (40 m², delt 30/10), ønsket 100 W/m²: rommet foreslår 2000W/200m med
CC 20,0 cm; «Stue sone 1» (9,5 m²) foreslår 1000W/100m med CC 9,5 cm; «Stue sone 2» (29,1 m²)
foreslår 2000W/200m med CC 14,6 cm. Hver sone regnes på sitt eget areal.

**Ikke gjort (egen runde):** per-sone-rader i romkort/PDF/materialliste, redigerbart sone-panel for
romtype/W-m²/styring (feltene finnes og brukes, men settes programmatisk), og sone-valg ved klikk
på lerretet.

**Fil:** index.html.

---

## Tom-tilstand (snø): «Hent fra kart» som kort — 2026-09-25

Kenneth fant ikke kartfunksjonen: «finner ikke roof på varmeplan?» Med rette — 007 endret
tom-tilstandens UNDERTEKST til «Hent kart fra adressen, importer en tegning, …», men la aldri inn
en knapp. Eneste vei inn var et lite kartikon i etasjeraden i sidepanelet, praktisk talt
uoppdagelig. Nytt kort `ces-map` i `.ces-secondary`, vist kun i snø og ikke i import-modus.
Ny `_emptyMapImport()` finner aktiv etasje som `_startImportFile` gjør; hele flyten eies fortsatt
av `_roofOpenDialog`. Commit `5c487cf`.

**Fil:** index.html.

---

## Kart-lag: «Hent fra kart» — stedfestet tegneflate for snø — 2026-09-24

Serien «Stedfestet tegneflate» (prompt 001–007, `docs/tak-modul/prompter/`). Adresse → kartutsnitt
fra Kartverket → tegn området rett på kartet, med riktig målestokk **uten kalibrering**. Kart-laget
er bygget for å gjenbrukes av Tak-modulen senere. Full beskrivelse i `docs/kart-lag.md`.

Ny tjeneste `~/Code/varmeplan-roof` (FastAPI, egen repo) snakker med Kartverket; nettleseren gjør
aldri Kartverket-kall selv. Fire endepunkter: `/roof/locate`, `/roof/background`, `/roof/slope`,
`/roof/model?level=quick`.

**Kjerneideen:** et kartutsnitt med kjent utstrekning i meter *er* en kalibrert bakgrunn.
Kartbildet installeres som et helt vanlig `S.bgs`-objekt med `widthCm = width_m × 100`, origo i
sørvestre hjørne, låst, `_needsCalibration = false`. Ingen kartbibliotek i nettleseren.

- **Koordinatregel (låst, testet):** SV-hjørne = verdens (0,0), x mot øst, **nord = minkende y**
  (verdens-Y øker nedover), nordkant på `y = −heightCm`. `_geoToWorld`/`_worldToGeo` er eneste vei.
- **Bevis på at målestokken stemmer:** arealet regnet fra de lagrede verdens-cm gir **105,2 m²** —
  nøyaktig samme tall INSPIRE oppgir for bygget — og omrisset ligger 0,9 m fra kartsenteret.
- **Bygningsomriss som vektorlag** oppå bildet (ikke brent inn): valgt bygg mørkeblått, naboer
  grå, DOM1-avledet **stiplet** (utledet av 1 m-raster, ikke målt vektordata), ⚠ ved lav
  confidence. Rom-tegning **snapper** til hjørner og kanter (grid → angle → geo, ingen re-grid),
  radius 14 px — samme konstant frihånds-matta bruker. Shift eller «Bygg»-chipen slår av.
- **Helning og avstand** per område: `/roof/slope` (debounced 600 ms) gir `room.terrain`, og
  avstand til bygningen regnes geometrisk. Vises i rompanel, romkort og PDF, med kilde-badge.
  **Ingen automatisk endring av W/m²** — ≥ 6 % gir kun «bratt — vurder høyere W/m²».
- **Kreditering (CC BY 4.0-krav)** følger med fire steder: brent inn i PNG-en, i
  `bg.geo.attribution`, i ctxbar, og i PDF (rad på forsiden + linje med hentedato under hver
  romtegning). OpenStreetMap brukes **ikke** — ODbL passer ikke et kommersielt produkt.
- **Geo-bakgrunner låser geometrien:** roter/speilvend/rett-opp/skaler/kalibrer er skjult for dem.
  Alle ville brutt koblingen til EPSG:25833 og gjort koordinatene feil uten at noe ser galt ut.

**Tre reelle problemer funnet underveis:**
1. **Zoom-gulvet 0,2** er tunet for plantegninger; et 80 m-kart trenger ~0,076 og kunne verken
   tilpasses skjermen eller zoomes ut til. Nytt `_minZoom()` senker gulvet til 0,05 **kun** på
   kart-etasjer.
2. **Kaldstart-ventingen** ga 21,7 s spinner når den lokale tjenesten bare var stoppet. Ventes nå
   kun i produksjon: **21,7 s → 0,1 s**.
3. **Kandidatene manglet omriss** i `S.geo` (005 lagret bare punktet), så vektorlaget og
   «bytt bygg» hadde ingenting å jobbe med. Rettet.

**Ny `_geoRegressionTest()` — 24 sjekker:** koordinatkonvensjonen, rundtur < 0,01 cm, at installert
bakgrunn er ferdig kalibrert og låst, snapping (hjørne innenfor radius, ikke utenfor, kant gir
punkt på linja, Shift/bryter slår av, ingen snapping uten kart), avstand hus→område, og at
`bg.geo`, `S.geo` og `room.terrain` overlever lagring. Alle øvrige regresjonstester uendret.

**Ikke verifisert:** PDF-generering end-to-end — jsPDF lar seg ikke konstruere i det hodeløse
testmiljøet. Vilkårene og verdiene for begge PDF-radene er verifisert direkte i stedet.

**Filer:** index.html, docs/kart-lag.md (ny), CLAUDE.md, samt hele `~/Code/varmeplan-roof`.

---

## Frihånd matte: glidbart startpunkt langs veggen — og alltid en vei ut av frihånd — 2026-09-24

Kenneth: «Når jeg skal legge ut en til, starter den på samme sted som den første. Kan jeg få sette
inn startpunkt der jeg selv ønsker?» + «Den henger seg litt opp … jeg kommer ikke ut av menyen.»

**To av arbeidsordrens hypoteser holdt IKKE — begge etterprøvd i STEG 0:**

- **Labelen.** Hypotesen var at `_matFreeCatalog(mp).product` blir null for InSnow 300T, så hele
  labelblokka hoppes stille over. Målt: `product` er ALDRI null når produktraden finnes —
  `tooShort`-grenen faller allerede tilbake til `cands[0] || fam`. Bygget tre kataloger (EcoMat
  innendørs, InSnow med og uten rulldata) og committet ekte frihåndsmatter i hver: labelen tegnes
  i alle tre, materiallista får linje i alle tre. **Manglende label lot seg ikke reprodusere.**
  Det som DERIMOT degraderer er data — mangler `mat_area_m2`/`mat_total_length_mm`, blir linje 2
  bare «CC 8.0 cm», effekten 0 W, og materiallista teller tegnede meter i stedet for ruller. Er
  det dette Kenneth ser, ligger fiksen i Supabase, ikke i koden. Rapportert, ikke gjettet.
- **«Henger».** Målt: matte 2 fikk nøyaktig samme startpunkt (30, 595) som matte 1, overlappvakten
  avviste, `drawMode` ble stående i `'mat-freehand'` → **avvist commit**, ingen kastet feil.

Bygget:
- Ny **startfase** (`_matFree.phase='start'`): markøren glir innsettingspunktet langs den av
  hjørnets to vegger som er nærmest musa (`_matFreeStartSlide`), klemt til polygonets eget
  intervall med samme marginer `_matFreeStartFor` bruker (uendret — regresjonstesten kaller den
  fortsatt direkte). Veggen bestemmer første akse: bunn/topp → `'v'`, venstre/høyre → `'h'`. Snap
  til (a) eksisterende mattekant + gap, (b) 10 cm-raster, (c) hjørnet. Markøren tegnes i
  mesh-bredden i produktets farge med «fra hjørne: N cm».
- **Standardpunkt uten musebevegelse:** første ledige plass etter eksisterende matter — målt til
  x=90 for matte 2 (30 + NET 50 + gap 10), nøyaktig som STEG 0.3 forutsa. Ingen matter → hjørnet.
- Hjørne-forankringen ved `moves.length===0` hopper nå over i fase `'draw'` — ellers ville den
  overskrevet brukerens eget valg.
- `_matFreeExit` pakket i `try/catch`: en uventet feil nullstiller ALLTID modus/markør (+ toast
  «intern feil»). Avvist commit beholder fortsatt tegningen (DEL B FEIL 4, uendret).
- Nytt `_matFree.lastReject`: varig, synlig grunn i BÅDE ctxbar og hintlinje («⚠ Kan ikke lagres:
  overlapper en annen matte»), ikke bare en toast som forsvinner. Ny ctxbar-status under hele
  frihånd: «Frihånd · «produkt» · [✓ Ferdig] [↶ Angre siste] [✕ Avbryt]».
- **Klikk utenfor frihånds-rommet er nå en utvei:** ingen baner → avbryt; gyldig bane → commit;
  begge lar klikket gå videre til rommet man traff. Ugyldig bane → modus beholdes MED ⚠-grunn.
- Label og materialliste faller tilbake til familieraden når segmentets produktrad mangler — var
  reelt mulig å miste linja stille i materiallista (`if (!seg.product) continue`).
- Testet live: markøren glir og bytter akse; matte 2 starter på x=90 og committer uten
  overlappvarsel; snap treffer raster/mattekant/hjørne; Escape i startfasen; innendørs EcoMat
  uendret; avvist commit gir ⚠ med tre utveier; simulert kastet feil nullstiller modusen; klikk på
  et annet rom committer og velger det rommet; alle fire regresjonstester OK.

**Fil:** index.html.

---

## Plantegning: «Bytt», «legg i denne etasjen» eller «ny etasje» — ved import og dra-og-slipp — 2026-09-24

Kenneth: «Jeg har slettet plantegning for 1. etasje. Så velger jeg "legg til ny plantegning" —
tegningen legger seg ikke i den etasjen jeg har opprettet.» **Retter en regresjon fra `5e0d126`**
(PDF flerside-velgeren): nedtrekksmenyen med eksisterende etasjer ble fjernet der, og
`_findReusableEmptyFloor` dekket kun helt tomme prosjekter.

- STEG 0.1 målt med 12 rom i etasjen: enkeltside-PDF og JPG gikk allerede riktig (aktiv etasje).
  **Flerside-PDF** lagde «2. etasje» og lot etasjen med rommene stå uten tegning — regresjonen.
  Årsaken bekreftet: gjenbruket krever en etasje UTEN rom, så Kenneths tilfelle (etasje MED rom
  som nettopp mistet tegningen) traff det aldri.
- STEG 0.2: dra-og-slipp på en etasje som alt har plantegning mistet kalibreringen uten spørsmål,
  begge veier (målt før/etter: `widthCm`/`originX`/`_needsCalibration` nullstilt). **Verre enn
  antatt** — `_installBgImageForFloor` har ingen `sameFile`-sjekk i det hele tatt, den nullstiller
  ALLTID. `_bgReplaceKeepTransform`-grenen i `_installBgImage` var eneste bevarende sti.
- Ny DELT `_bgTransformCompatible` + `_carryBgTransform`, brukt av BEGGE install-funksjonene.
  PDF→PDF krever samme papirstørrelse innen 0,5 cm, raster→raster samme pikselmål; ellers
  ukalibrert + toast. **Strengere enn før:** «Bytt bilde» bevarte tidligere plasseringen uansett
  format, så en tegning i annet format arvet en målestokk som ikke gjaldt.
- Sidevelgeren: etasje-nedtrekksmeny per avkrysset rad («+ Ny etasje» + etasjer uten aktiv
  plantegning — vanntett-regelen står). Første rad forvelges til etasjen importen kom fra, merket
  «(denne)», via nytt `_bgImportTargetFloorId`. Samme etasje kan bare velges på én rad (gråes ut).
  Navnefeltet gjelder kun ny etasje. Egen BYTT-modus: radioknapper, én side, ingen navn/etasjevalg.
- Nytt `_replaceFloorBg(floorId)` + menyoppføringer i etasjens høyreklikkmeny, bakgrunnens
  ctx-meny og begge ctxbar-variantene. Menyen sier forskjellen rett ut: «Bytt plantegning
  (erstatter)» vs. «Legg til som ny versjon (gammel blir referanse)». «Bytt bilde» het misvisende
  det samme som et rent bildebytte — heter nå «Bytt plantegning» overalt.
- Dra-og-slipp på etasje MED plantegning: dialog med Bytt / Ny versjon / Ny etasje FØR noe skjer.
  Etasje uten plantegning: rett inn som før. Slipp-banneret sier «(erstatter)» på forhånd.
- `_srcW`/`_srcH` settes ved gjenoppretting fra det lastede bildet (ikke serialisert), så
  raster-bytte beholder kalibreringen også etter lagre→åpne — ingen migrasjon av gamle prosjekter.
- Rommene røres ikke noe sted (`S.rooms`/`floorId`/kalibreringspunkter urørt).
- Testet live: Kenneths flyt gir tegning i 1. etasje uten ny etasje og med 12 rom urørt; bytte med
  samme A1 bevarer plassering eksakt, A3 gir ⚠ + toast; flerside i bytt-modus erstatter side 2 med
  målestokk beholdt; blandet mål (side 1 → eksisterende, side 2 → ny) med riktig utgråing og
  nummerering; alle tre slipp-valg; gammelt prosjekt uten `needsCalibration` uendret; alle tre
  regresjonstester OK.

**Fil:** index.html.

---

## Manuelt antall kabler: aldri stille fallback til én — og «Kun label» teller antallet — 2026-09-23

Kenneth: «Jeg legger inn manuelt 2 stk kabler, virker som appen kun legger inn 1 stk kabel. Samme
skjer hvis jeg velger "Kun label", da beregner den kun 1 stk kabel.» To uavhengige feil.

- STEG 0: reprodusert at `_cablePreviewPlace` ba om 2, la 1, mens `_cablePreviewMeta.nCables` sto
  igjen som 2 — panelet sa «2×» med tall som gjaldt ÉN kabel over HELE rommet. **Den geometriske
  årsaken prompten beskrev var allerede borte** etter rektangel-kjeden (samme dag): fasit-rommet
  gir nå 2 soner, og sonemotoren ga ikke opp på noen av seks testformer. Men null er fortsatt
  nåbart — produkter uten fast kabellengde, og korridor-modusens fire egne `return null`-veier.
- `_computeRoomStats` trengte INGEN endring. Målt med 1/2/3 label-kabler: dekning = netto ÉN gang
  (62 m² i alle tre, ikke doblet), effekt/lengde/antall skalerer N×. Hurtigprosjekteringen
  (`_listSetRoomProduct`) var også allerede riktig — brukt som mønster i stedet for et nytt.
- **Feil 1:** `_cablePreviewPlace` krever nå NØYAKTIG `nCables` fra motoren; et delvis resultat
  (2 soner når det ble bedt om 3) ryddes bort. Klarer den ikke det, legges N `labelOnly`-kabler med
  riktig CC per element + `multiCableIndex`/`multiCableGroup` — antall, effekt, meter og CC blir
  riktige i panel/romkort/materialliste/PDF, bare tegningen mangler. Nytt
  `_cablePreviewMeta.labelFallback` driver en ⚠-melding. Meldingen navngir bevisst IKKE en
  spesifikk geometrisk årsak — STEG 0 viste at årsakene varierer, og å gjette feil årsak er samme
  klasse løgn som saken handler om.
- Forhåndsvisningsteksten leser «N×» fra `st.cableCount` (det som FAKTISK ligger i rommet), aldri
  fra `m.nCables`. Avvik vises som «⚠ Ba om N, fikk M».
- **Feil 2:** `_placeCableLabelOnly(..., count=1)` oppretter `count` objekter;
  `_cableLabelOnlyFromManual` leser `#cable-manual-count` (verifisert at kun ÉN slik input finnes
  i DOM-en av gangen — duplikat-id-fella slår ikke inn).
- Testet live med ekte panel-render og ekte DOM-felt: fallback gir 2600 W / 260 m / CC 23,8 /
  42 W/m² + synlig ⚠, «Kun label» med 3 → 3 kabler, rektangelrom med Manuelt 2 tegnes fortsatt som
  2 soner, 3 kabler som lykkes er uendret, Avbryt/Ctrl+Z rydder alt, materiallisten gir 1/2/3 stk,
  alle tre regresjonstester OK.

**Fil:** index.html.

---

## Flerkabel i rom med mange hjørner: kjedefylling av en sone i rektangler — 2026-09-23

Kenneth: «Fortsatt ikke bra når jeg velger 2 stk kabler i et stort rom med mange hjørner.» Fasit:
«101 + 108 Entré / Gang», 12 hjørner, trapp som hindring, 2 × InFloor 10T. Ett pent og ett rotete
utlegg i samme rom.

- **STEG 0 fant en annen rotårsak enn prompten antok** — like-areal-båndkuttet er ikke skurken:
  1. `generateCableBoustrophedon` avviser hele utlegget når en celle-overgang ikke lander på en
     delt båndkant (`openLen > 1.0`), avgjort av PARITETEN på antall baner per celle. Målt: 47 %
     av CC-området forkastet, null-hullene få cm brede (kutt x=720 og x=730 OK, x=724,2 forkastet).
     Enkeltkabel-veien overlever fordi den SKANNER CC-området; flerkabel-veien har tvungen felles
     CC (lik W/m², låst) og prøver nøyaktig ÉN verdi.
  2. En hindring i sonen gjør boustrophedon umulig uansett — K1 traff v6 ved ALLE kuttposisjoner
     640–820, så ingen kuttjustering kunne fikset den.
  Hjørne-snappingen («plasteret») ble dessuten avvist i begge retninger (12 % og 21,9 % avvik).
- Fasit-rommet lot seg ikke bygge fra veggtallene: oddetallsgruppen summerer til 1545, og en
  fortegnssum på null krever partall. Minste retting V9 139→140, da følger V4=884 entydig.
- Kenneths designidé validert ved måling: fylt PER REKTANGEL lyktes 61/61 CC-verdier mot ~53 % for
  hele sonen samlet. Hindringen må IKKE drive kuttene (5 rektangler/0 slivere uten, mot 8/3 med).
  Nabolista er en STI → kun 4 grupperinger, 0,1 ms (5000-taket unødvendig).
- Bygget (etter Kenneths valg: kun kjedefylling, båndkuttet beholdt): `_zoneRectCells` (minimalt
  rektangelsett, null for skrå kanter OG stablede biter — samme vakt boustrophedon har),
  `_fillZoneAsRectChain` (søm-bevisst banerutenett, `_generatePolygonClippedRuns` håndterer
  hindringen INNE i rektanglet, koblet med gjenbrukt `_v6ConnectCells`), og `_chainBreaks` (ren
  array — overlever JSON-rundturen) som hindrer at spøkelses-U-svinger tegnes og telles.
- Kjeden er REDNINGSVEI, ikke ny standard: prøves kun når kaskaden ikke ga et koblingsfritt utlegg,
  og vinner kun på måling. En sone som fikk ren boustrophedon røres aldri.
- Resultat: K1 7 → 1 kobling og 173,6 → 142 m (var 23,6 m OVER produktets 150 m), K2 6 → 3
  koblinger. Buene rundt trappa er borte. Ny `_cableZoneRegressionTest()` (12 sjekker) —
  sømavstand målt eksakt = CC, rektangelrom uendret som regresjonsvakt.
- IKKE gjort (avklart): rektangel-oppdeling av HELE rommet + gruppering + glidesnitt (båndkuttet
  var ikke rotårsaken), og «dra i sømmen» (egen sak).

**Fil:** index.html.

---

## Hindring: Ctrl+R = Roter-modus, Ctrl+F = Flytt-modus — samme gizmo som rom og folie — 2026-09-21

Kenneth: «Jeg kunne ikke bruke Ctrl+R for å rotere en hindring.» Hindringen var det siste objektet
med sin egen rotasjonsløsning — et lite fast håndtak som ikke brydde seg om `S.ui.transformMode`.

- STEG 0 fant TO feil i det gamle rotasjonsdraget: startvinkelen ble målt fra gizmoens hjørne-anker
  mens draget målte fra boksens senter (to nullpunkter), OG startvinkelen brukte canvas-koordinater
  mens draget brukte client-koordinater (to koordinatsystemer). Målt: **~36° rått vinkelhopp ved
  1 px museflytt**, som med 45°-snap ble et umiddelbart hopp til 45°. Etter fiksen <1°.
  `hitMatRotHandle` har samme koordinatsystem-mismatch (men felles nullpunkt) — rapportert, egen sak.
- Ny delt `_hindringCenterWorld()` brukt av hit-test, tegning og drag (var beregnet tre steder).
- `hitHindringGizmoX/Y/Free` fikk `transformMode==='move'`-gate; `hitHindringRotHandle` erstattet
  med ring-treffet fra folie (<13 px fra håndtaket ELLER 60±8 px fra senteret), kun i Roter-modus.
- `drawHindringMoveGizmo` fikk to grener; den gamle «rotasjonssirkel under aktiv rotasjon» er
  FJERNET (samme dashede ring som nå alltid vises — to overlappende ringer ellers).
- Ny `_hindRingHover` + gjenbrukt `FOLIE_ROT_CURSOR`. Høyreklikkmeny fikk de to modus-punktene,
  `_SHORTCUTS` fikk gruppa «Hindring markert».
- Bonusfunn: Escape avvalgte ALDRI en markert hindring fra før (falt gjennom til rom-fallbacken) —
  ny gren lagt til, ett-trinns avvalg som matcher folies FAKTISKE oppførsel (spec-en beskrev
  feilaktig et to-trinns mønster verken rom eller folie har).

**Fil:** index.html.

---

## Tall på canvas: bytt tallfont fra IBM Plex Mono til Space Grotesk (ren null) — 2026-09-18

Kenneth: «Jeg synes 0 og 8 er for like på målene i canvas. Kan du ta bort streken inne i 0 slik
at det ikke kan se ut som 8-tall?» IBM Plex Mono har en bevisst strek i nullen (vanlig i
programmeringsfonter) — på 9–11px, som mål/lengder/watt tegnes i, kollapser streken inn i ovalen
og 0 ser ut som 8. Canvas 2D kan ikke slå av OpenType-features, så løsningen er en annen font for
TALL på canvas.

- STEG 0: bygget en dedikert testside (Space Grotesk/Courier Prime/Azeret Mono mot IBM Plex Mono),
  lastet i en ekte nettleser, blåst opp 5x uten glatting — IBM Plex Mono sin null har et tydelig
  diagonalt strøk (nøyaktig symptomet), Space Grotesk sin null er ren/lukket. Valgte Space Grotesk
  siden den allerede lastes i appen (ingen nytt Google Fonts-kall). Bekreftet at ingen canvas-sted
  er avhengig av lik tegnbredde (alle bruker `ctx.textAlign` per streng, font-agnostisk).
- Ny konstant `CANVAS_NUM_FONT = "'Space Grotesk',sans-serif"` ved `LABEL_FONT_*`. Alle 42
  `ctx.font`-steder med `'IBM Plex Mono',monospace` byttet mekanisk — `grep -n "ctx.font.*Plex
  Mono"` gir 0 treff etterpå.
- CSS-bruken av Plex Mono (sidebar, badges, tabeller, `.floor-badge`, `.soi-v`, m.fl.) er UENDRET
  — dette er stylesheet/HTML-attributter, ikke `ctx.font`, og lå aldri i omfanget.
- **Merk, funn utenfor omfang (ikke fikset):** flere HTML number-input-felt (trappebyggerens
  neseavstand/kant-/repos-marg/CC/kabelantall, kalibreringsdialogens avstandsfelt, m.fl.) bruker
  også `'IBM Plex Mono'` via CSS og har trolig samme 0/8-forveksling — egen sak om ønskelig.
- Testet live: skjermbilde-sammenligning (selve beviset), ekte apprendering av veggmål/romareal/
  skalalinje/folie-labler med ulik sifferlengde — ingen kolonneforskyvning, `_foilRegressionTest()`
  OK.

**Fil:** index.html.

---

## PDF med flere sider: huk av sidene, gi hver sin etasje et navn — kalibrering overlever lagring — 2026-09-18

Kenneth: «Jeg ønsker helst å kunne bare huke av sidene jeg ønsker importert samtidig som jeg kan
sette navnet på hver side som blir hvert sitt plan... Alle sidene må vises som ikke valgt.» Fant
selv to konkrete feil ved å lese koden før bygging.

- STEG 0: reprodusert live at `_needsCalibration` falt bort ved lagring (aldri skrevet av
  `_serializeBgFields`) — en kalibrert/ukalibrert bakgrunn ble alltid `false` etter
  gjenoppretting, som låste bakgrunnen ved tilfeldig auto-tilpasset størrelse. Bekreftet at et
  nytt prosjekt alltid oppretter én tom «1. etasje» før import (STEG 2c-gjenbruk er reelt), talt
  ~14 lesesteder av feltet (ingen endret), og bekreftet at ingen kodesti trenger
  «Global»/eksisterende-etasje-valget i nedtrekksmenyen som fjernes.
- **Feil 1 fikset:** `_serializeBgFields` skriver nå `needsCalibration`; gjenoppretting (S.bgs OG
  S.bgRefs) setter feltet fra lagret verdi ETTER `_newBgObj()` — eldre prosjekter uten feltet
  faller tilbake til dagens `false` (ingen migrasjon).
- **Ny sidevelger:** avkrysningsboks (alltid av som standard) + navnefelt (deaktivert til raden
  hukes av) per side, i stedet for en nedtrekksmeny. Standardnavn vises som placeholder og telles
  i PDF-rekkefølge blant KUN de avkryssede. STEG 2c: den ene urørte auto-etasjen gjenbrukes for
  første avkryssede side i stedet for å opprette enda en tom etasje. «Importer 0 sider»
  (deaktivert) → «Importer N sider» live. Etter import: aktiv etasje = FØRSTE importerte. Ny
  «Neste ukalibrerte →»-knapp i ⚠️-varselet når flere etasjer venter.
- **Feil 2 fikset:** `delFloor` rydder nå `S.bgs`/`S.bgRefs` for den slettede etasjen — en
  200–500 KB base64-plantegning ble før liggende usynlig for alltid i lagringsdataene. Bevisst
  IKKE lagt i undo-snapshotet (samme presedens som `removeBgImage`, som heller aldri har kalt
  `pushUndo`).
- Testet live (ekte checkbox-dispatch): full 3-siders import med STEG 2c-gjenbruk, av/på-huking
  forskyver nummerering riktig, full lagre→gjenopprette-rundtur bekrefter Feil 1 tallfestet,
  `delFloor` rydder bakgrunnen, `_foilRegressionTest()` OK.

**Fil:** index.html.

---

## Rotasjonsgizmo: hele sirkelen er gripbar, og markøren viser det — 2026-09-18

Kenneth: «Det kommer opp en sirkel. Jeg tenker markør kan endre seg når den treffer sirkelen slik
at bruker forstår at han da kan trykke og holde inne for å rotere.» Sirkelen var før ren dekor —
bare det lille håndtaket var treffbart.

- STEG 0: bekreftet at ring-treff allerede sjekkes FØR endepil-treff (ringen vinner alltid), og
  at `drawFolieGizmo`/`_selectedFolieGeom` mangler `_pdfMode`-vakt for roterbar folie (
  `selectedFoilFreeId` nullstilles aldri under PDF-capture, i motsetning til `selectedStripId`) —
  et pre-eksisterende hull fra F4a/F4b, rapportert men ikke fikset (utenfor denne sakens omfang).
- `hitFolieRotHandle` utvidet: treff enten <13px fra håndtaket (som før) ELLER innenfor 60±8px
  fra senteret (selve ringen). Ingen endring i selve rotasjonsdraget.
- Ny `FOLIE_ROT_CURSOR`: egen ↻-SVG-markør (sort underlinje + oransje strøk, synlig i begge
  tema), brukt på hover og under drag. Ny `_folieRingHover` tegner ringen i full styrke ved
  hover/drag i stedet for dempet — nullstilt ved modusbytte/avvalg.
- Hurtigtast-panelet: raden for rotasjon sier nå «dra sirkelen» i stedet for «dra ↻-håndtak».
- Testet live (ekte hover/mousedown/mousemove-dispatch): hit-test-sonen verifisert punkt for
  punkt, hover 90° rundt ringen gir ↻-markør + lyser opp ringen uten render-storm, nøyaktig ett
  render-kall ved faktisk tilstandsendring, konvertering+rotasjon fungerer uansett gripepunkt på
  ringen, Flytt-modus uendret, skjermbilde i lys/mørk tema, `_foilRegressionTest()` OK.

**Fil:** index.html.

---

## Folie: Ctrl+R = rotere, Ctrl+F = flytte — fri folie forsvinner som begrep — 2026-09-18

Kenneth: «Da trenger vi egentlig ikke "fri modus"? Kun endre fra flytte til rotere. Ctrl+R =
rotere, Ctrl+F = flytte.» Brukeren skal aldri møte ordet «fri» — markerer en folie, trykker
Ctrl+R, drar rotasjonshåndtaket, trykker Ctrl+F. Konvertering `S.strips` → `S.foilFree` skjer
stille internt, første gang folien faktisk roteres.

- STEG 0 bekreftet: `S.ui.transformMode` (rommets flytt/roter-flagg) hadde null tilknytning til
  en markert stripe fra før — trygt å la folie DELE dette flagget med rommet i stedet for et
  eget per-objekt-flagg. `w2s()` har ingen akse-speiling, så en verdens-vinkel kan brukes direkte
  som skjerm-rotasjonsvinkel. Escape på et rom nullstiller ikke `transformMode` (kun UI-chipsene
  skjules) — folie følger nå samme ett-trinns mønster.
- Ny delt `_selectedFolieGeom()`: senter/endepunkter/akse-vinkel for BÅDE vanlig folie
  (`S.strips`) og roterbar folie (`S.foilFree`), null ved flervalg (gruppe-gizmoen uendret).
  `hitStripGizmo`/`hitStripEndArrow` generalisert til å bruke denne — ingen endring i faktisk
  drag-kode for vanlig folie.
- Ny `drawFolieGizmo` (erstatter `drawStripGizmo` + `drawFoilFreeGizmo` + `drawFoilFreeEndHandles`):
  Flytt-modus = eksakt gammelt utseende (skjermfast ⊕/rød/grønn pil), Roter-modus = rommets
  oransje pivot/håndtak/sirkel sentrert på folien i stedet for rommets hjørne. Lengdepilene i
  endene vises i BEGGE moduser og roterer med objektet.
- Rotasjonshåndtak-treff på en VANLIG folie: `_makeFoilFree()` (egen `pushUndo()` FØR
  `angle_deg` endres) + start rotasjon i samme mousedown — konvertering+rotasjon blir ETT
  undo-steg. Kun Ctrl+R/Ctrl+F uten å dra håndtaket konverterer ingenting.
- Ny senter-gizmo (⊕+X/Y) for roterbar folie i Flytt-modus — X/Y-pilene begrenser flyttingen til
  én skjermakse, som vanlig folies eget mønster.
- Dobbel-gizmo-vakt: rommets `drawTransformGizmo` hoppes nå også over når en folie er markert —
  samme unntak hindring alt hadde.
- Fjernet: `S.ui.foilFreeRotateActive`, `_toggleFoilFreeRotate`, `hitFoilFreeRotHandle`,
  `_rotateStripFreely`, «Fri (vinkel)»-bryteren i manuell-paletten (hele stien). Ordet «fri»
  fjernet fra kontekstmenyer, egenskapspanel (badge «rotert N°», knapp «Slett folie»),
  sidebar-fallback («Folie»), hurtigtast-panelet («Fri folie markert» slått sammen inn i «Folie
  markert»).
- Testet live (ekte museklikk/keydown/høyreklikk-dispatch): full flyt (marker → Ctrl+R → dra
  håndtak → konvertert+rotert+toast, ett undo-steg tilbake), Ctrl+R+Ctrl+F uten å dra konverterer
  ingenting, vanlig folies senter-/endehåndtak uendret (regresjon bekreftet), ny X/Y-begrensning,
  rotasjon av allerede-roterbar folie, flervalg viser fortsatt gruppe-gizmoen, dobbel-gizmo-vakt
  bekreftet, Escape ett-trinns, F4d-telling uendret, lagre→gjenopprette-rundtur +
  `_foilRegressionTest()` OK.

**Fil:** index.html.

---

## Roter fritt rett på vanlig folie — uten å velge «Gjør fri» først — 2026-09-18

Kenneth: «Jeg høyreklikker og forventer å få opp "Roter"... Hvorfor kan jeg ikke bare velge Roter
på en folie uten å først måtte gjøre den fri?» To objekttyper (`S.strips`/`S.foilFree`) var
appens problem, ikke brukerens — han tenkte «roter», ikke «konverter, så roter».

- STEG 0 bekreftet: `_makeFoilFree` gjorde allerede `pushUndo()` (udo ga stripa tilbake i ett
  steg); Ctrl+R på en markert vanlig folie gjorde `setTransformMode('rotate')`, men det flagget
  leses kun av rommets egen transform-gizmo — ingen synlig effekt på en markert stripe, trygt å
  avskjære. `_makeFoilFree` manglet en returverdi — lagt til `return ff.id`.
- Ny `_rotateStripFreely(id)`: kaller `_makeFoilFree` (uendret) + viser rotasjonsgizmoen med én
  gang + toast om at folien nå er fri (snapper/klipper ikke lenger). Koblet til `stripCtxMenu`
  («↻ Roter fritt» øverst, «↗ Gjør fri (vinkel)» beholdt under) og Ctrl+R ved nøyaktig én
  markert folie (flervalg faller gjennom til rom-modus som før).
- Rettet samtidig: `_makeFoilFree` sin egen toast sa fortsatt «kommer i neste runde» (feil siden
  F4b/F4c var levert), og F4b sin Ctrl+R-hurtigtast manglet en rad i hurtigtast-panelet.
- **Merk:** denne saken ble senere samme dag erstattet av «Ctrl+R = rotere, Ctrl+F = flytte —
  fri folie forsvinner som begrep» (over) — `_rotateStripFreely` og «Gjør fri (vinkel)»-menypunktet
  finnes ikke lenger.
- Testet live: Kenneths scenario, Ctrl+R samme resultat, Ctrl+Z uendret, flervalg uendret,
  eksisterende fri-folie-meny uendret, lagre→gjenopprette-rundtur + `_foilRegressionTest()` OK.

**Fil:** index.html.

---

## F4c: fri folie — flytt, endre lengde (endehåndtak), tast Lengde/Vinkel — 2026-09-18

Kenneth: «Legge ut en folie, rotere den og endre lengden samt flytte på den.» Siste bit av det
opprinnelige F4-ønsket — F4a (objektet), F4b (rotasjon) og F4d (telling) var allerede inne.

- STEG 0 avklarte at endehåndtakene IKKE trengte noen endring i `_buildCycleCandidates`/
  `CYCLE_INLINE_TYPES` — de er dedikerte hit-tester sjekket FØR kropp-klikket, uavhengig av
  cycle-kandidat-systemet (samme grunn som F4b sin rotasjonsknapp allerede fungerte). Bekreftet
  live med ekte museklikk direkte på håndtak-pikslene, ikke bare direkte funksjonskall.
- **Flytt:** klikk på kroppen velger OG starter flytting i samme gest (som vanlig stripe), ren
  verdensakse via `_evToCanvas`/`s2w` — ingen snap/klipp (4c-avklaringen: brukerens ansvar, rød
  kant varsler i stedet).
- **Lengde:** to nye endehåndtak (`_foilFreeEndWorldPos`/`hitFoilFreeEndHandle`), vist når folien
  er markert (ingen egen på/av-modus, ulikt rotasjonen). Den FASTE enden regnes ut én gang ved
  draget-start; hver mousemove projiserer musepunktet på folien sin egen akse derfra, klemt til
  `FOIL_FREE_MIN_LEN_CM` (5 cm). Verifisert ved 0° og 37° at motsatt ende står bokstavelig
  stille (målt avvik 2,8×10⁻¹⁴ cm — flyttallspresisjon).
- **Felt:** Lengde/Vinkel i egenskapspanelet er nå klikkbare (`editFoilFreeLen`/
  `editFoilFreeAngle`), samme mønster som `editStripLen`, med `pushUndo()` per bekreftet endring.
- **Piltaster:** markert fri folie + piltast flytter 10 cm, ren verdensakse.
- Ny gruppe «Fri folie markert» i hurtigtast-panelet — F4b sin egen Ctrl+R-rad manglet fra før
  (CLAUDE.md-regelen ikke fulgt den gangen), rettet samtidig som F4c sine nye rader ble lagt til.
- Ny headless-nettleser-eiendommelighet funnet under testing: `.blur()`-metoden fyrer ikke et
  ekte `'blur'`-event i test-miljøet — måtte dispatche `FocusEvent('blur')` direkte for å
  verifisere felt-redigeringen (ikke en produktbug).

**Fil:** index.html.

---

## F4d: fri folie teller på vanlig måte — areal, effekt, PDF, Excel, materialliste, varsler — 2026-09-18

Kenneth: «uten denne er fri folie kosmetikk» — F4a/F4b ga et objekt man kunne plassere og rotere,
men det talte ikke med noe sted. STEG 0 kartla 37 lesesteder (31 `_stripsForRoom`-kall + 6 direkte
`S.strips`-iterasjoner), klassifiserte hver som TELLING/GEOMETRI/TEGNING/ANNET og leverte tabellen
til Kenneth FØR bygging startet, per hans eksplisitte krav. Kun TELLING-stedene er endret —
GEOMETRI (klipping/kollisjon/snap/drag) og TEGNING (dimensjonskjeder) er urørt, siden fri folie
mangler `pos_cm`/`start_cm`.

- Ny delt helper `_foilCountItemsForRoom(roomId)` unifiserer `S.strips` + `S.foilFree` for TELLING
  (aldri geometri). Byttet inn i `_computeRoomStats`, `_roomRatedEffectW`, `_roomDominantProduct`,
  `_roomProductBreakdown` (Romoversikt), PDF sine `_roomStatus`/`_roomProductFamily`/
  `_specRowCount`/Spesifikasjon, `_collectMaterialItems` (Visma-lim + XLSX-bestilling), pluss en
  håndfull mindre presentasjons-/UI-steder.
- **PDF-tegningen av fri folie krevde ingen ny kode** — `_renderRoomToImage` bruker allerede samme
  delte `render()`-pipeline som skjermen (F4a koblet `drawFoilFree()` inn der), så PDF-en var
  allerede riktig.
- Ny `_drawFoilFreeLabel(ff)`: to-linjers label rotert MED folien (erstatter F4as enkle vannrette
  tekst), snus 180° i (90°,270°) så teksten aldri står opp-ned, samme font/skjerm-gulv som vanlig
  folie-label.
- Ny `_foilFreeWarnings(ff)`: «Utenfor rommet», «Over hindring» (respekterer clearance:'none'),
  «Overlapper folie» (SAT mot både vanlig stripe og annen fri folie). Varsler ALDRI plassering —
  kun rød stiplet kant på lerretet + ⚠ i sidepanel/egenskapspanel, matcher 4c-avklaringen fra
  planen. Begge `_roomStatus`-funksjonene (global + PDF-lokal) utvidet til å telle dette som
  rombrudd.
- Reelt funn underveis, fikset (ikke bare rapportert): `ROOM_PRODUCT_KEYS` og tre søster-registre
  manglet `foilFree` — «Dupliser rom» kopierte derfor ALDRI fri folie, og «Slett rom» ryddet den
  ALDRI, uten at appens eget selvsjekk-varsel (`_assertRoomFullyDeleted`) fanget lekkasjen. Lagt
  til i alle fire, verifisert live at begge nå fungerer riktig.
- Testet live (syntetisk produkt+rom, uten Supabase-innlogging): 2 vanlige striper (300 cm) + 1 fri
  folie (samme produkt+lengde) → `_computeRoomStats` går fra 480 W/3 m² til 720 W/4,5 m² (nøyaktig
  ett folie-bidrag, ingen dobbelttelling); `_roomProductBreakdown` slår alle tre sammen til ÉN rad
  (Ant 3); alle tre varseltyper verifisert + at clearance:'none' aldri varsler; lagre→gjenopprett-
  rundtur beholder `S.foilFree` uendret; `_foilRegressionTest()` OK både før og etter.
- Rapportert, ikke fikset (utenfor omfang): `commitSkillevegg` flytter ikke fri folie til riktig
  romhalvdel ved deling; rom-gizmo-drag/roter flytter ikke fri folie med rommet; minimap og
  bg-straighten-bekreftelsen mangler fri folie (kosmetisk); `varmeplan-app` sin `prefill.ts`
  (garantiflyten) leser fortsatt kun `data.strips[]`, ikke `data.foilFree[]` — egen sak, annet repo.

**Fil:** index.html.

---

## F4b: rotasjonsgizmo for fri folie (Ctrl+R / høyreklikk «Roter») — 2026-09-17

Kenneth: «jeg ønsker å kunne markere folien, trykke ctrl + r eller høyreklikk og roter, da skal
det komme opp rotasjon gizmo... rotere trinnløst, evt om den hoper 45 grader, men blir trinnløs
ved å holde shift inne.» Modellert på mattas eksisterende rotasjonsmønster (samme 45°-snap-med-
mindre-Shift-regel), men gizmoen er bevisst IKKE alltid synlig som mattas — den vises kun etter
Ctrl+R eller høyreklikk «Roter», og skjules igjen med samme snarvei eller en Escape.

- Nytt `S.ui.foilFreeRotateActive`-flagg. Håndtaket sitter i verdenskoordinater langs folien sin
  egen lengdeakse (roterer/skalerer med objektet), ikke på et fast skjerm-piksel-offset.
- To reelle funn under bygging, fanget FØR commit: (1) `_buildCycleCandidates` (systemet som
  avgjør hvilket objekt et klikk treffer) kjente ikke til `foilFree` i det hele tatt — et klikk
  på en fri folie ble luket bort av selve rom-kandidaten. F4a sin klikk-for-å-velge hadde derfor
  ALDRI fungert via et ekte museklikk (kun testet via direkte funksjonskall forrige gang).
  Rettet i tre steder (`_buildCycleCandidates`, `CYCLE_INLINE_TYPES`, `_applyCycleSelection`).
  (2) Mattas egen rotasjonskode blander skjerm-visningskoordinater med canvasets interne
  koordinater — riktig kun når canvas ligger i vinduets hjørne (målt: gjør det ikke, 277/56px
  forskjøvet i denne appens layout). Egen kode for fri folie unngår avviket i stedet for å arve
  det; mattas egen kode er urørt, rapportert som egen sak.

**Fil:** index.html.

---

## F4a: «fri folie» — objektet (S.foilFree) — 2026-09-17

Kenneth: «I noen tilfeller ønsker jeg å rotere noen enkle foliebredder. Legge ut en folie, rotere
den og endre lengden samt flytte på den.» Første av tre steg (planens egen inndeling) — flytt/
roter/endre lengde er en senere, egen prompt (F4b). F4a alene gir derfor begrenset nytteverdi:
opprette, se og slette, ikke justere ennå.

- Ny objekttype `S.foilFree` — egen liste ved siden av `S.strips` (samme mønster som `matPaths`
  ved siden av `mats`), IKKE et vinkelfelt lagt til på vanlige striper. Ingen av de 225 leserne av
  `room.points`/stripe-koordinater i den aksebaserte folie-motoren trenger dermed en vakt.
  `{ id, roomId, productId, cx_cm, cy_cm, angle_deg, length_cm }` — bredde fra produktet.
  angle_deg=0 ⇒ langs X (som en 'h'-stripe), 90 ⇒ langs Y (som 'v') — verifisert med regnestykke
  at en konvertert stripes hjørner blir eksakt identiske med originalens, ikke bare «samme areal».
- Full persistens (lagre/laste/undo/foreldreløs-opprydding/egen id-teller), tegning (rotert
  rektangel), klikk-treff (invers-rotert punkt-i-boks), slett (tast/kontekstmeny/knapp), egen rad
  i sidebar.
- «Gjør fri (vinkel)» i høyreklikkmenyen — én vei, kun enkeltvalg. Fjerner samtidig stripen fra
  enhver gruppe den var medlem av (eget funn under bygging — ellers en henvisning til intet).
- Ny «Fri (vinkel)»-bryter i den manuelle paletten, synlig kun for folie (ikke matte/snø, som
  deler samme boks). Slipp med bryteren på lager en `S.foilFree` uten klipping/kollisjon/magnet —
  brukerens ansvar, som planen ba om.

**Fil:** index.html.

---

## Hurtigtast-panel: én oversikt over alle taster og musegrep — 2026-09-17

Kenneth: «Kan man få en liten meny hvor man ser alle hurtigtaster og funksjoner?» Ingen slik
oversikt fantes. STEG 0 leste alle fire keydown-håndterere linje for linje (to var irrelevante —
wbw-piltaster egen sak, innlogging kun Enter). Utvikler-brytere (Ctrl+Shift+M/P/D) bevisst utelatt.

- To funn Kenneth ikke visste om: (1) planens eget eksempel om folie sin pilnavigasjon var feil —
  det er bakgrunnens pil-nudging (25cm, Shift=5cm); folie sin egen er 10cm fast, og Shift+Opp/Ned
  blar i romets folieliste i stedet for å flytte. (2) Shift betyr «ingen snap, fri vinkel» nesten
  overalt — UNNTATT ved rotering av bakgrunnen, der Shift gjør det motsatte (slår PÅ 15°-snap).
- Ny `_SHORTCUTS`-kildetabell (38 rader, 12 grupper, hver kommentert med linjenummer) og
  `_openShortcutsPanel()`/`_closeShortcutsPanel()` (overlegg i samme stil som «Velg kunde»). Tre
  innganger: `?`-tasten (bekreftet ledig), en «?»-brikke i verktøylinja, og en rad i
  Innstillinger. `_kbd()` (F0-oppfølging) brukt for Mac/Windows-riktige taster.
- Manuell liste, ikke lest fra håndtererne selv — samme regel lagt til i CLAUDE.md: «Ny
  hurtigtast → ny rad i `_SHORTCUTS`.»

**Fil:** index.html, CLAUDE.md.

---

## Dupliser folie mister opptil ett kuttintervall — 2,9 m ble 2,8 m — 2026-09-17

Kenneth: «Jeg dupliserte en folie som er 2,9 meter lang. De dupliserte ble 2,8 meter lange.»

- Rotårsak: `computeClippedSegments` rundet det ledige segmentet ned til produktets kuttintervall
  FØR `_duplicateStrips` skar det mot originalens eget område — avrundingen tok opptil ett helt
  intervall av halen, tilfeldig avhengig av hvor originalen lå i det ledige området. STEG 0
  bekreftet formelen med reelle tall (d=7.5, e=2, cut=10cm → tap 4.5cm, traff eksakt).
- Nytt `opts.noCutRounding`-flagg i `computeClippedSegments` (samme `opts`-objekt som allerede
  fantes for `marginCm`/`clipPoly`), ført gjennom en ny valgfri parameter på
  `_dropAlongExtentAt`, satt av `_duplicateStrips`. Drop/magnet/auto uendret (sender ikke flagget).

**Fil:** index.html.

---

## Vis hurtigtasten bak «Dupliser» i høyreklikkmenyen — 2026-09-17

Kenneth: «Er det noen hurtigtast for å duplisere en foliebredde? ønsker at det står i parentes
bak "Dupliser".» Ny plattformbevisst `_kbd(key)`-hjelper (⌘ på Mac, «Ctrl+» ellers) — første bruk
i appen, ment som mønster for senere menyvalg. Antallet ved flervalg skrives som ord («3
striper»), ikke nakent tall, for å unngå «Dupliser (3) (Ctrl+D)».

**Fil:** index.html.

---

## F0: dupliser folie — identisk kopi rett ved siden av — 2026-09-17

Kenneth: «Kan man velge folien (høyreklikk) og duplisere med mus eller hurtigtast slik at det vil
legge seg en ny 100 cm like lang rett ved siden av med innstilt verdi som avstand?» — muliggjør
arbeidsflyten dupliser→dupliser→dupliser→marker alle→grupper→rediger.

- Ny `_duplicateStrips()`: én markert → én kopi; flere markerte (samme rom+retning) → hele
  markeringen som blokk, forskjøvet med blokkens bredde+gap. Gap = `_effectiveGapCmPair` (samme
  regel som drag-and-drop og auto bruker — produktets minimum vinner over en lavere
  romsinnstilling). Rekkefølge på kandidatsider følger `S.varmefolie.startCorner`. Kopien(e) blir
  det nye valget (Ctrl+D ×N gir N på rad). Høyreklikk → «⧉ Dupliser (N)», eller Ctrl/Cmd+D.
- To funn underveis, fanget av testene før noe ble antatt riktig: (1) `_dropAlongExtentAt` gir
  den størst mulige ledige lengden ved en posisjon (designet for drop/magnet) — brukt rått ga et
  duplikat av en 400cm original 595cm langt i et tomt rom. Rettet ved å skjære det klipte
  segmentet mot originalens EGET lengdeområde — identisk når ingenting er i veien, kortere (med
  informasjonstoast) kun når en hindring faktisk tar en bit av akkurat det området. (2)
  `computeClippedSegments` validerer aldri at selve tverrposisjonen holder stripen innenfor
  romgrensene — et duplikat landet delvis utenfor rommet før en egen grense-sjekk ble lagt til
  (samme sjekk `_snapStripToNearest` allerede bruker).
- `zoneId` kopieres til duplikatet (samme sone); label-overstyringer (`labelPos`/
  `labelRotation`/`labelScale`/`labelColor`) kopieres bevisst ikke.

**Fil:** index.html.

---

## Sak 6b: prosjektlista — hele kundenavnet, typeikoner, initialer — 2026-09-17

Kenneth: «Prosjektlisten må bli mer oversiktlig, vi ser ikke hele kundenavnet.» 200px var
flaskehalsen, ikke mangel på plass totalt — Type brukte ~130px tekst og Prosjektert av 150px for
et fullt navn.

- Firma: `max-width` 200px → 380px (plassen Type+Prosjektert av frigjorde).
- Type: tekst fjernet, kun ikon (18px, full etikett i tooltip). To nye ikoner tegnet
  (`home-heat-in`/`home-heat-out`, varmebølger inne i vs. utenfor huset) i en EGEN tabell
  (`_PL_TYPE_ICON`) — ikke `_MOD_ICON`, som deles med sidebarens modul-nav (sak 6a) og ikke skal
  få husmotiv der. STEG 0 bekreftet at `S.project.type` kun kan være seks bestemte verdier
  (indoor/stair/snow/roof/frost/snowcalc) — `list` er en inndata-metode, aldri en egen
  prosjekttype.
- Prosjektert av: initialer («Kenneth Skretteberg» → «KS», maks 4 tegn) i stedet for fullt navn,
  med tooltip som viser hele navnet. Nytt «Initialer»-felt i Innstillinger lar brukeren sette
  egne initialer som vinner over de automatiske — men KUN når prosjektets «Prosjektert
  av»-fritekst er lik brukerens eget fulle navn (STEG 0 bekreftet: andre medlemmers profiler
  lastes ikke i vanlig bruk, kun i org-admin-panelet). Ny additiv migrasjon
  `supabase-migration-profile-initials.sql` (`profiles.initials`, kjørt).
- PDF-forsiden og sidebarens «Prosjektert av» er urørt — begge viser fortsatt fullt navn.

**Fil:** index.html, supabase-migration-profile-initials.sql (kjørt).

---

## «Rett opp etter vegg» — 2026-09-17

Kenneth, om et loft der alle vegger står ~15° skrått mot canvas (D1-300/301/302): å legge folie
parallelt med en skrå vegg fantes for kabel (`_skEngineCore` prøver hver vegg som kandidat-
vinkel) men ikke for folie — å bygge om folie-motoren for vilkårlig vinkel er en stor jobb
(`room.points` leses 225 steder i fila, alt antar akseparallelt). Billigere vei: rett opp
PLANTEGNINGEN i stedet, siden hele bygget er skrått som helhet — da virker hver eksisterende
motor uendret.

- Ny knapp i bakgrunnens «⋯»-meny: «Rett opp etter vegg». To klikk langs en vegg på tegningen →
  vinkelen måles råtte (bevisst ingen angle-snap på forhåndsvisningen — det ville jo nullstilt
  nettopp den skjeve vinkelen som skal måles) → nærmeste 90° (vannrett/loddrett) beregnes →
  differansen legges til `bg.rotation`.
- Finnes det rom på etasjen, roteres rom/hindringer/soner (inkl. vegger og mål-linjer) MED
  bildet, om bildets eget senter. Folie/kabel/matte/plater kan ikke roteres (aksebasert
  v/h-modell) og slettes derfor — etter en tydelig bekreftelse med faktiske antall, f.eks.
  «1 rom, 1 hindring, 1 sone roteres — 1 folie slettes (kan ikke roteres). Fortsette?» (Kenneths
  eget valg, fremfor å bare nekte når rom finnes). Tom etasje → roterer stille.
- Ikke håndtert i denne runden, rapportert eksplisitt: trapper (egen geometrimodell) og globale
  mål-linjer (`S.floatingDims`) roteres ikke — kan ende visuelt feilplassert på en rotert etasje.
- STEG 0-funn (pre-eksisterende, ikke introdusert her): `pushUndo()`/`undo()` snapshotter aldri
  bakgrunnstilstand — bekreftet at selv den eksisterende «Roter 90°»-knappen har akkurat samme
  hull. Rom-/hindring-/sone-rotasjonen og folie/kabel/matte-slettingen ER angrbare; selve
  `bg.rotation`-endringen er det ikke, uendret fra før.

**Fil:** index.html.

---

## Batch-lengde for markerte folier — 2026-09-17

Kenneth: gruppering og felles flytting av folier fantes allerede (Ctrl-klikk, gruppe-gizmo,
høyreklikk «Lag gruppe»), men å taste en ny lengde som gjelder ALLE markerte fantes ikke. STEG 0
avdekket at enkelt-strip-redigering (`editStripLen`) verken klipper mot vegg/hindring eller
pusher undo i dag — batch-varianten gjør derfor nøyaktig det samme (ingen ny klippe-regel
oppfunnet), pluss `pushUndo()` siden en handling som rammer flere striper samtidig bør være
angrbar.

- `updateObjInfo()`: ny redigerbar Lengde-rad i multi-select-panelet, men KUN når alle markerte
  allerede har lik lengde (0,01cm toleranse mot flyttallsavrunding) — ellers vises et låst
  «ulike lengder»-felt (Kenneths eget valg, trygt fremfor et fritt felt).
- Ny `editStripLenBatch()`: setter lengden på alle markerte striper i ett samlet
  `pushUndo()`-steg.

**Fil:** index.html.

---

## Modulknappene på én rad, sidebar-bredde huskes — 2026-09-17

Kenneth: «Ønsker bredere bar på venstre side slik at Inne, Liste, Ute og Trapp står ved siden av
hverandre... Bruker kan justere bredden som den vil, sett minne på dette samt
tilbakestillingsknapp.» STEG 0 målte 3 rader ved BÅDE 180px og 272px sidebar-bredde med det
gamle flex-wrap-oppsettet (de fire knappene trengte 274px, kun 252px tilgjengelig ved 272px
bredde).

- `.tb-module-nav`: Dashboard i full bredde over, de fire modulknappene i et nytt
  4-kolonners grid under — alltid én rad, uansett etikettlengde. `overflow:hidden` på knappene
  (IKKE fjerning av `flex-shrink:0` som først antatt — flex-shrink har ingen effekt på
  grid-items, verifisert direkte) hindrer at «Trapp» (bredeste etikett) sprenger kolonnen.
- Under 200px sidebar-bredde vises kun ikon (etikett skjult) — målt at tekstavkutting inntreffer
  ved akkurat 180px (sidebarens absolutte minimum), 200px valgt som sikkerhetsmargin mot
  fontmetrikk-variasjon mellom OS/nettlesere.
- Sidebar-bredde huskes: nytt `sidebarWidth`-felt i `_savePrefs()`/`_applyPrefs()` (samme
  `PREFS_KEY`, urørt — se advarsel i koden), lagres på mouseup (ikke mousemove).
  Tilbakestillingsknapp lagt til under Innstillinger («Visning»-seksjon).

**Fil:** index.html.

---

## «Bytt kunde» finner nå også kunder fra Visma-registeret — 2026-09-17

Kenneth: «her får jeg ikke byttet til kunde som ligger med Visma kundenummer, kun interne
kunder. Ønsker å kunne bytte til alle kunder.» STEG 0 bekreftet: `_quickSetCustomer()` kalte kun
`_loadCustomers()` (Varmeplans egne kunder, `customers`-tabellen) — ingen kode refererte
`erp_customers` i det hele tatt, selv om dashbordets kundesøk (`_searchCustomers`) allerede
hadde akkurat dette to-register-mønsteret.

- Samme to-seksjons-mønster som dashbordets kundesøk gjenbrukt: Varmeplan-kunder alltid først,
  Visma-registeret bygges KUN ved søk (aldri ved åpning — unngår å male 3130 rader inn i DOM-en
  for hvert kall), skjuler rader som allerede er hentet inn som Varmeplan-kunde, samme
  tokenbaserte søk («bravida ålesund» treffer «Bravida Norge avd Ålesund»).
- Gjenbruker `_insertCustomerFromErpRow()` uendret (setter Vismas skrivemåte, ikke det brukeren
  tastet) og fører videre gjennom den eksisterende `_applyQuickCustomer` — ingen ny
  databaseskriving.
- Rapportert, ikke fikset (egen sak): `esc()`/`_esc()` escaper HTML men ikke apostrof i
  `onclick`-attributter — bekreftet 5 kallsteder i kodebasen der en kunde/kontakt med apostrof i
  navnet (f.eks. «O'Brien AS») får en rad som ikke gjør noe ved klikk (attributten kompilerer
  ikke engang).

**Fil:** index.html.

---

## Romoversikt viser lengde per foliebredde, ikke bare antall — 2026-09-17

Kenneth: «Det kan være at f.eks. 100 cm-bredden er lagt som 7 stk, men de kan alle ha
forskjellig lengde, da må de settes opp på hver sin linje.» `_roomProductBreakdown()` grupperte
tidligere alle folie-varianter i et rom kun på `productId` — sju striper av samme bredde men
ulik lengde ble én rad med «Ant 7», lengden usynlig.

- Ny map-nøkkel for folie spesifikt: `productId + lengde`, rundet til én desimal i meter FØR
  gruppering (samme presisjon som vises, slik at 3,24m og 3,19m ikke ender som to rader som
  begge viser «3,2 m»). To striper med identisk bredde OG lengde slås fortsatt sammen til én rad
  med økt antall. Kabel/Matte/Plate/Aluboard er urørt (nøkkel fortsatt kun `productId`).
- Ny «Lengde»-kolonne i PDF Romoversikt-tabellen (begge kolonneoppsett, med/uten Bygg — verifisert
  å fortsatt summere til nøyaktig 180mm; Etasje-kolonnens 14mm urørt, jf. tidligere
  «Underetasj»-avkuttingen ved 12mm) og i Excel «Per rom»-arket, samme radrekkefølge.

**Fil:** index.html.

---

## Folie-labels for små i store rom — 2026-09-17

Kenneth, Storkmoen #0238 (Stue/kjøkken 63,9 m², 1:50-tegning): labelstørrelsen er en konstant
verdens-cm-størrelse (riktig for PDF-troskap — identisk label:rom-forhold på skjerm og i PDF),
men store rom trenger lavere zoom for å få plass på skjermen, og dermed ble etikettene uleselig
små der. Den eksisterende skjerm-only-gulvet (6px) var langt under en liten roms naturlige
størrelse.

- Ny konstant `LABEL_MIN_PX = 13` erstatter det gamle 6px-gulvet på tre steder: hoved-folie-
  labelen, frihånds-matte-labelen, og en tredje, ikke opprinnelig nevnt mat-rektangel-label-plass
  som deler samme begrunnelse («Størrelse lik folie-label»). To kabel-label-steder med samme
  mønster ble bevisst IKKE endret (utenfor scope). PDF-modus er helt urørt — gulvet evalueres
  aldri der.

**Fil:** index.html.

---

## Folie kan legges i samme bane over en hindring — 2026-09-17

Kenneth, Storkmoen #0238 (Stue/kjøkken med kjøkkenøy): etter å ha lagt folie under en
kjøkkenøy, nektet appen å legge ny folie i SAMME bane over øya — tvang posisjonen sidelengs i
stedet.

- Rotårsak: `_stripDropCandidate` målte kollisjon mot rommets FULLE akseparallelle utstrekning
  (`aLo`/`aHi`), ikke den faktiske utstrekningen en ny stripe ville fått ved akkurat den
  dropp-posisjonen — selve klippe-logikken (`computeClippedSegments`, `_segAtSweep`,
  `_stripOverlapsAny`) var allerede riktig, den fikk bare feil inndata fra pre-sjekken. Ny
  `_dropAlongExtentAt()` gir kollisjonssjekken riktig, posisjonsspesifikk utstrekning i stedet.

**Fil:** index.html.

---

## Hindring-avstand 0cm nullstilles ikke lenger til 25mm ved gjenåpning — 2026-09-17

Kenneth, Storkmoen #0238: satte en hindrings klaring til 0cm, men verdien hoppet tilbake til
25mm ved gjenåpning av prosjektet (en tilhørende folie-varsel som forsvant ved 0cm dukket
tilsvarende opp igjen).

- Rotårsak: en engangs-datavask fra 10.09.2026 (commit 795171c) som skulle rette opp gamle
  `'none'`-verdier fra en tidligere feil manglet en vakt og kjørte på ALLE prosjektåpninger —
  overskrev dermed også bevisste, nye 0cm-valg brukeren nettopp hadde gjort. Løkken er fjernet
  helt (ingen flagg, dato-sjekk eller per-prosjekt-markør innført i stedet, etter Kenneths
  eksplisitte ønske).

**Fil:** index.html.

---

## Prosjektoversikt (PDF): etasjerekkefølge, brutto/netto og ratet effekt — 2026-09-15 (DEL A-D)

Kenneth, om Prosjektoversikt-siden i Romoversikt-PDF-en: (1) «Plan 1 kommer øverst etterfulgt
av Plan 0. Riktig blir at laveste etasje kommer øverst.» (2) «Det vises kun netto areal uten å
fortelle om det er brutto eller netto.» (3) «…med hver sin flateeffekt. Brutto W/m² (effekt-
behovet) og flateeffekt W/m² (overflatetemperaturen).» (4) «På kolonne for W vises effekter
som ikke er effekten på kabelen. F.eks. er det valgt 450 W varmekabel, da bør det ikke stå
459 W.» Tre av de fire delte samme rotårsak: PDF-en regnet selv i stedet for å bruke tallene
appen allerede har.

- **DEL A** — Prosjektoversikten (KPI-kort, per-etasje-tabell, forhåndsvisningen FØR eksport)
  bruker nå `_roomRatedEffectW(room)` (produktets ratede effekt) i stedet for `stats.totalW`
  (geometri-utledet — en kabel tegnet litt lengre enn nominelt ga et høyere tall enn produktets
  spesifikasjon). Hurtig prosjektering sitt eget utkastkort brukte allerede denne funksjonen —
  PDF-en viste et ANNET tall for samme rom enn skjermen. `stats.totalW` er urørt der det faktisk
  betyr «hva som er lagt ut» (status-symbolet, rom-detaljsidenes egen dekningsberegning).
- **DEL D** — sortering er nå på etasjens NIVÅ (første tall i navnet, stigende), ikke
  opprettelsesrekkefølge (`floor.order`, som aldri kan endres av brukeren). STEG 0 kartla de
  faktiske etasjenavnene i kodebasen (Plan -2…8, «1. etasje», «Uteareal», «Plan 1», pluss fritt
  brukerskrevne navn) før regelen ble skrevet. Navn uten tall («Uteareal») legges sist. Kun ett
  sted i kodebasen sorterer etasjer for PDF-en — fikset der er nok til at Prosjektoversikt og
  Romoversikt viser identisk rekkefølge, siden begge leser samme `floorSummaries`.
- **DEL B+C** (slått sammen — samme kolonne-layout) — «m²» delt i Brutto/Netto m²; «W/m²» delt
  i Brutto (ratet÷brutto, effektbehov) og Flate (ratet÷netto, overflatetemperatur) — SAMME to
  formler utkastkortet bruker, verifisert tall-likt live for samme rom. STEG 0 avklarte at et
  TEGNET roms egen kabel-etikett bruker to ANDRE formler (geometri-utledet effekt ÷ dekket
  areal/brutto) og derfor uunngåelig vil vise andre tall — bevisst valgt likevel, for å matche
  Hurtig prosjektering sin skjerm. Sju kolonner på 175mm (ikke hele 180mm trykte bredden, siden
  bygg-gruppering fra forrige runde indenterer tabellen 5mm) — verifisert at ingenting
  overskrider papirkanten (maks x=195mm=W-M), selv med et langt romnavn.

**Testmetodikk:** en 450W-kabel tegnet 60m (nominelt 59m) viser 450 i KPI-kort, per-rom
W-kolonne og etasjesum — der det før viste 458. Plan 1 opprettet før Plan 0 → PDF-en viser
Plan 0 øverst i begge seksjoner. Et rom uten hindringer viser brutto=netto, begge synlige. De
to W/m²-kolonnene ga nøyaktig samme tall (38/41) som et Hurtig prosjektering-utkastkort for
samme rom. Fullt regresjonsbatteri grønt, `_matBench(42,64)` bit-for-bit uendret.

**Fil:** index.html.

---

## Hurtig prosjektering: valgfritt «Bygg»-nivå over etasje — 2026-09-15 (DEL A-D)

Kenneth: kunden definerer «Bolig A» og «Bolig B», begge med varmekabler i underetasje og
1. etasje. Ønsket et valg FØR etasje som heter Bygg, med fritekst, satt via en «+»-knapp —
«det er sjelden vi har behov for å sette Bygg, så jeg ønsker ikke at dette blir et valg jeg
må innom for hver linje».

Rotårsak: etasjer i Hurtig prosjektering opprettes på behov, nøkkelen var `(partId, name)`
alene — «Underetasje» i Bolig A og «Underetasje» i Bolig B ville blitt SAMME etasje-objekt
(og likeens «Plan 1»-kollisjonen mellom to bygg, det vanligste tilfellet).

- **DEL A** — nøkkelen er nå `(partId, building, name)`. Nytt felt `floor.building`
  (fritekst, `null`/`''` = ingen bygg — dagens tilstand, additiv, ingen migrering: gamle
  etasjer mangler feltet, leses som null). Ny delt `_listMoveRoomToFloor` brukt av BÅDE
  `_listEditFloor` (endrer navn, beholder bygg) og ny `_listEditBuilding` (endrer bygg,
  beholder navn). Opprydningen av tomme etasjer sjekker fortsatt kun rom-referanser, ikke
  building.
- **DEL B** — «+ Bygg»-knapp foran Etasje i utkastkortet, kun synlig som knapp når intet
  bygg er satt. Klikk avslører et vanlig fritekstfelt (samme `li-field`-mekanisme som
  resten av kortet — tastaturnavigasjonen fungerer uendret). Byggnavnet arves til NESTE
  rad via samme mekanisme `_listDraftRoom` allerede bruker for varmetype — Kenneth setter
  bygg én gang per bolig, ikke per rom. Tomt felt → tilbake til «+».
- **DEL C** — ny Bygg-kolonne foran Etasje i tabellen, vises KUN når minst én rad faktisk
  har et bygg satt — uten bygg er tabellen bit-for-bit lik i dag. Rader uten bygg i et
  prosjekt som ellers har bygg får en tom celle, ikke em dash.
- **DEL D** — Romoversikt (PDF) grupperer nå Bygg → Etasje → Rom i BÅDE
  Prosjektoversikt-siden og A-L-tabellen, men KUN når minst ett rom har et bygg — verifisert
  bit-for-bit uendret ellers (samme kolonneposisjoner, ingen «Bygg»-tekst). A-L-tabellen
  bruker hele den trykte bredden allerede, så Bygg-kolonnen tar plass fra Rom/Produkt/
  Gruppe/Type/W-m²/CC — IKKE fra Etasje, som først ble krympet for mye og avkuttet
  «Underetasje» til «Underetasj» i en tidlig forsøksversjon (fanget opp med en jsPDF-
  instans-proxy som logger hvert `doc.text()`-kall, siden `exportPDF()` ellers laster ned
  filen og ikke lar seg inspisere automatisk).

**Testmetodikk:** Kenneths tilfelle (Bolig A + Bolig B, hver med Underetasje + 1. etasje)
ga fire distinkte etasje-objekter, ikke to. Prosjekt uten bygg bit-for-bit uendret i alle
tre flatene (kort, tabell, PDF) — testet FØRST og eksplisitt. Gammelt lagret prosjekt
(`floor.building` helt fraværende, ikke bare tom) åpner uendret, ingen feil i konsollen.
Fullt regresjonsbatteri grønt, `_matBench(42,64)` bit-for-bit uendret.

**Fil:** index.html.

---

## Flerkabel-rom: hindringer og forbudte soner er nå synlige for kabelmotoren — 2026-09-14 (DEL A-C)

Kenneth, stue/kjøkken 67,4 m² med to InFloor 10T 2000W/200m (K1+K2): «Kabel legger seg helt
feil.. den legger seg over hindringer og gjennom vegger.. den går i store buer her og der.»

STEG 0 (målt, kildekommentar over `_buildNCableZones`): kabelmotorens ni hindring/sone-oppslag
(`S.hindrings.filter(h=>h.roomId===roomId)` osv.) var alle KORREKTE — de bruker konsekvent
id-en som ble sendt inn, som for et sub-rom ER `tempRoom.id`. Feilen var at `S.hindrings`/
`S.zones` ALDRI inneholdt noe tagget med `tempRoom.id`: `_buildNCableZones` klonte aldri det
virkelige rommets hindringer/soner inn i sub-rommet den selv lager. Målt på et fasit-rom (to
120×120cm hindringer): flerkabel-veien ga 420 krysninger PER kabel (9700 samplede punkt hver),
ett-kabel-veien (ekte rom-id) ga 0 (15615 punkt).

- **DEL A** — nye `_cloneObstaclesForSubRoom`/`_removeSubRoomObstacles`: kloner hindringer og
  forbudte+foretrukne soner KLIPPET til sonens egen stripe (`_clipPolygonToSlab`) — en hindring
  som krysser skjøten mellom to soner telles riktig i BEGGE. Opprydding i samme `finally` som
  allerede fjerner `tempRoom`; `_buildSaveData` filtrerer ikke bort foreldreløse rom-id-er
  (verifisert), så en glemt klone ville blitt lagret som en ekte hindring. **Denne commiten
  alene gjorde fasit-rommet VERRE** — `_autoFillNCables` returnerte null, fordi den gamle
  splitt-tellingen nå telte ekte hindring-runding som et hakk (`maxSplitFrac` 0,3235 ≥ 0,30) —
  forventet og fikset i DEL B (AVHENGIGHET 1, varslet i spec-en før noen kode ble skrevet).
- **DEL B** — splitt-deteksjonen («Sub-rooms carry no hindrings, so a split is always a real
  notch», sann kun pga. DEL A sin bug) avgjøres nå på geometri: hvert brudds MIDTPUNKT testes
  mot sub-rommets egne hindring/sone-polygoner (`ptInPoly`) — kun et brudd INGEN hindring
  forklarer telles som et ekte hakk. Naiv telling ga 0,3235 (ville kastet retningen); geometrisk
  telling gir 0 på fasit-rommet. Et ekte hakk (testet: U-formet rom, ingen hindring) gir fortsatt
  0,87 ≥ 0,30 → invalidert som før.
- **DEL C** — `subAreaM2` var brutto (`compArea(sub)`), uendret av hindring-klonene. Bruker nå
  `roomAreas(tempRoom).net` — samme begrep `roomAreas()` allerede bruker for et helt rom, ikke
  et nytt. Målt (AVHENGIGHET 2): brutto-skår ga v-retning vinner (0,9564 mot 0,9508); netto-skår
  gir h høyest (0,9626 mot 0,9620) — den RÅ skåren flipper som forventet. Selve UTFALLET endres
  ikke på fasit-rommet: differansen (0,0006) er under den eksisterende 0,02-hysteresen som
  favoriserer primærretningen (uendret, forhåndseksisterende regel).

**DoD punkt 5 (hvor mye av «store buer» forsvinner av seg selv):** krysninger falt fra 840 til
60 (-93 %) etter DEL A-C; én av to kabler ble 100 % ren. Restanten (60 av 9620 punkt, motor v6)
er BEVIST — samme posisjon sendt direkte til `_generatePolygonClippedRuns` uten V6 sin
celle-inndeling klipper hindringen korrekt — å skyldes `_v6DecomposeCells`/`_v6ConnectCells`,
uttrykkelig utenfor omfanget her og utsatt til en egen runde med fersk STEG 0 mot V6 sin
faktiske kode.

**Testmetodikk:** ett-kabel-veien bit-for-bit uendret; flerkabel-rom UTEN hindringer bit-for-bit
uendret (samme total-lengde); `S.hindrings`/`S.zones` talt likt før/etter kjøring (0 lekkasjer);
ingen `tmpcab_`-rester i `_buildSaveData()`; hindring som krysser sone-skjøten respekteres av
begge kabler; ekte hakk invalideres fortsatt. Fullt regresjonsbatteri grønt (`_cableSkewRegressionTest`
alle fem case A-E), `_matBench(42,64)` bit-for-bit uendret.

**Fil:** index.html.

---

## Topbar kun logo, arbeidsflyt-stripa fjernet, prosjektinfo i sidebar — 2026-09-14 (DEL A-F)

Kenneth: «Jeg ønsker en enklere måte å sette inn prosjekter av. Øverst til venstre der det står
varmeplan / prosjektnavn, i dette feltet ønsker jeg kun logo. Ta bort linjen under som viser
kunde - tegning - produkter — denne er i veien. I toppen av venstre bar ønsker jeg
prosjektinformasjon som vises: kundenavn, kontaktperson, prosjektnavn, prosjektert av, lagret
status med grønn eller rød indikator [...] ta bort «lagret», man kan heller føre musen over for
å få opp forklarende tekst.» Tillegg (14.09, etter avklaring): kunde kan ikke bare åpne
Kunde-dialogen, den må kunne bytte kunde på ordentlig — DEL F ble forutsetningen for at DEL C i
det hele tatt løste det Kenneth ba om.

- **`f4558d7` (DEL B)** — fjernet arbeidsflyt-stripa (`#workflow-stripe`, STEG 7) over canvas:
  HTML-diven, hele CSS-blokken, og de tre funksjonene kun stripa brukte
  (`_wfStripeSig`/`_wfStripeVisible`/`_renderWorkflowStripe`/`_wfGoStep`), pluss kallet i
  `render()`-halen. `_wfFirstRoom`/`_wfKundeModal`/`_wfSendToMonter` beholdt (nye inngangspunkter
  i senere commits), `_projectProgress`/`_openProjectData` beholdt (fortsatt i bruk fra
  `_buildSaveData`).
- **`47fa218` (DEL A+C, slått sammen — funksjonelt avhengige)** — topbaren er nå KUN logoen;
  `tb-sep`, `.tb-proj` (prosjektnavn+blyant) og `save-indicator` flyttet til en ny
  `#sb-proj-info`-blokk øverst i sidebaren (samme id-er, så eksisterende skrivere fungerer
  uendret). Blokka viser kundenavn, kontaktperson, prosjektnavn, prosjektert av og
  lagret-status — tomme felt gir ingen rad (unngår «Prosjektert av —»-mønsteret fra tidligere).
  Hele blokka åpner `_wfKundeModal()`; prosjektnavnet har egen klikk (`editProjName()`,
  `stopPropagation`). `_renderSbProjInfo()` bygger kun `#spi-rows`, aldri `#save-indicator` —
  den ligger som en stabil søsken-node slik at hyppige `renderSidebar()`-kall aldri visker ut
  `_updateSaveIndicator`s egen tilstand. Alle 7 skrivere til `proj-name-disp` bekreftet
  fungerende uendret; alle 4 skrivere til `sb-proj-lbl` fjernet — den er nå en statisk
  seksjonstittel («Etasjer») over etasje/rom-treet, ikke lenger et duplikat av prosjektnavnet.
  Presentasjonsmodus dekkes automatisk (`#sidebar` var allerede i `body.present-mode`-lista).
- **`495f18d` (DEL D)** — «Send til montør» flyttet til topbarens fil/eksport-knappegruppe, med
  `data-modules="indoor"` på selve knappen (gjenskaper stripas gamle regel om at den kun vises i
  hovedarbeidsflyten — ikke i trapp/snø-modul).
- **`6d41d61` (DEL E)** — lagre-status er nå en farget prikk + klokkeslett i stedet for hele
  setninger («Lagrer…» osv. flyttet til `title`, vises på hover). Gjenbruker de fire eksisterende
  `.tb-save`-fargeklassene (kun `.saving` byttet fra cyan til gult, for å matche Kenneths kart:
  grønn=lagret, gult=lagrer/frakoblet, rødt=feil).
- **`13623c4` (DEL F)** — kunde settes nå ETT sted. Før fantes to veier med ulikt resultat:
  fritekstfeltet «Kunde / firma» i `_wfKundeModal` skrev kun `S.project.customer` og koblet
  ALDRI prosjektet til kunderegisteret, mens `_gbao10Build()` henter Visma-kundenummeret fra
  `customer_id`-KOBLINGEN — et prosjekt kunne altså vise riktig kundenavn på skjermen og likevel
  eksportere med feil/tomt kundenummer. Fjernet fritekstfeltet; infoblokkens kunderad åpner nå
  `_spiPickCustomer()` → samme `_quickSetCustomer`-velger prosjektlista alltid har brukt.
  `_applyQuickCustomer` oppdaterer nå BÅDE databasen og `S.project` når prosjektet som endres er
  det ÅPNE (samme id som `_supabaseProjectId`) — via den vanlige lagreveien
  (`_markProjectDirty`/`_scheduleAutoSave`), ikke et direkte databaseskriv bak redigeringens
  rygg. Uendret sti når prosjektet IKKE er det åpne (kalt fra prosjektlista på et annet
  prosjekt). Eksisterende prosjekter med gammel fritekst-kunde røres ikke ved innlasting.

**Testmetodikk:** fullt regresjonsbatteri grønt (`_matRegressionTest`, `_matZoneRegressionTest`,
`_matFreeRegressionTest`, `_cableSkewRegressionTest`, `_foilRegressionTest`) — denne runden
rører ingen geometri. Live verifisert: topbar viser kun logo; infoblokk viser riktig felt og
skjuler tomme; klikk på navn/kunde stopper propagation korrekt; kunde satt fra infoblokka på et
åpent prosjekt ga riktig kundenummer i `_gbao10Build()` i samme økt uten reload; kunde satt fra
prosjektlista på et IKKE-åpent prosjekt lot `S.project` urørt; «— Ingen kunde —» nullstiller
`customer_id`; alle fire lagre-tilstander (lagrer/lagret/frakoblet/feil) viser riktig farge;
presentasjonsmodus og trapp/snø-modul skjuler riktig ting; `#workflow-stripe` bekreftet borte
fra DOM, canvas fyller ut det frigjorte rommet uten dødt mellomrom.

**Fil:** index.html.

---

## Topbar-oppfølging: to regresjoner + manglende lagre-tidspunkt — 2026-09-14/15

Oppdaget live i produksjon rett etter forrige topbar-push (Kenneth testet direkte på
varmeplan.no) — tre små, raskt pushede fiks, aldri tidligere loggført.

- **`7287790` — Dashboard-navet forsvant ved åpning av prosjekt.** Rotårsak: `_renderSbProjInfo()`
  (forrige commits DEL C) bygde `proj-name-disp` INNI en dynamisk `innerHTML`-ombygging — samme
  mønster `save-indicator` bevisst UNNGIKK, men ikke fulgt konsekvent for navnet. Flere eldre
  steder (bl.a. `_restoreProject()`) skriver `proj-name-disp`s `.textContent` FØR
  `renderSidebar()` i det hele tatt kjører — elementet fantes ikke der ennå, `.textContent=` på
  `null` kastet en exception som stanset hele åpne-prosjekt-kjøringen midt i, inkludert
  `updateTopbarForModule()` (Dashboard/Inne/Liste/Ute/Trapp forsvant). Fiks: `proj-name-disp` er
  nå et STATISK element fra første tegning, akkurat som `save-indicator`; `_renderSbProjInfo()`
  toggler kun tekst/display på eksisterende elementer, bygger aldri om via `innerHTML`.
- **`e74dc51` — lagre-indikatoren var tom (fargeløs) ved åpning.** DEL E ga statusen farge, men
  ingenting kalte `_updateSaveIndicator()` bare ved å ÅPNE et prosjekt — kun ekte
  lagre-hendelser gjorde det. `_restoreProject()` kaller nå `_updateSaveIndicator('saved', true)`
  rett etter `_projectDirty=false` (der prosjektet BLIR «lagret» per definisjon); `silent`-
  flagget unngår et falskt «lagret nå»-klokkeslett.
- **`b2d66a8` — Kenneth ønsket et klokkeslett, ikke bare en bar prikk.** `_updateSaveIndicator`
  tar nå `{silent}` ELLER `{at: Date}`. `_openCloudProject()` (den faktiske åpne-fra-lista-
  flyten) HAR databasens ekte `updated_at` (`_loadFromSupabase` bruker `select('*')`) og viser nå
  det ekte lagretidspunktet i stedet for en bar prikk. Ny `_saveTimeLabel()`: klokkeslett med
  sekunder hvis i dag, ellers dato+klokkeslett («11.09 13:03») — et bart «Lagret 14:23» ville
  vært tvetydig for et prosjekt sist lagret for tre dager siden.

**Fil:** index.html.

---

## Visma GBAO10: merking-feltet uten P-nr/REV, filnavnet uendret — 2026-09-14

Kenneth: «Ved eksport fil til visma, så ønsker jeg at feltet for merking kun skal være merkingen
jeg har satt inn. Ikke ta med p nr eller rev nr.»

- **`8a90f19`** — `_gbao10DefaultMerking()` bygde standarden som «P0219 Gardermoen elektro REV 2»
  (prosjektnummer + navn + neste revisjon), rett inn i felt 7 (`f[6]`) med mindre Kenneth skrev
  noe eget. Returnerer nå kun `proj.name` — feltet er aldri tomt for et navngitt prosjekt, og
  overstyringen (`proj.gbao10Merking`) er urørt, lagrede prosjekter berøres ikke.
  **Bivirkning håndtert (DEL B):** samme merking matet også filnavnet — kortere merking ville gitt
  et kortere filnavn, noe Kenneth ikke ba om. Ny `_gbao10DefaultFilenameMerking()` beholder den
  gamle, fyldige formelen KUN til filnavnet, via et nytt `built.filenameMerking`-felt. Verifisert:
  filnavnet for P0219 «Gardermoen elektro» rev. 2 er identisk før/etter (kun tidsstempelet
  varierer, som før).
  **DEL C:** `dokumenter/visma-global-tilbudsimport-format.md` beskriver IKKE GBAO10-formatet —
  den dokumenterer kun «Kopier til Visma»-utklippet (et annet, 2-kolonners format uten
  merking-begrep). Ingen GBAO10-dokumentasjon finnes i repoet; DEL C sitt betingede krav holder
  derfor ikke, ingenting å oppdatere. Paste-veien sjekket (utenfor omfang) — har intet
  merking-begrep, ingen tilsvarende feil der.

**Testmetodikk:** fullt regresjonsbatteri grønt. Live verifisert: felt 7 uten egen merking =
prosjektnavnet; med egen merking = den teksten uendret i BÅDE felt 7 og filnavnet; uten
prosjektnavn = tomt felt 7 men fortsatt gyldig 33-felts linje.

**Fil:** index.html.

---

## Kabel: full dekning vinner over stillhet i uregelmessige rom — 2026-09-14 (DEL D + nedskalert A)

Kenneth, L-formet bad (InFloor 17T 1000W/59m, CC 9,6): «appen klarte ikke å legge kabelen ut på
en god måte. Jeg trodde vi hadde en motor som forstod alle romgeometrier uavhengig?» Svaret er
nei — tre motorer (matte/folie/kabel), og all romform-jobben i høst er gjort på mattemotoren.

STEG 0 (kildekommentar over `_autoFillCableImpl`) fant at spec'ens egen modell av kabelmotoren var
utdatert: siden en juni-refaktorering er den en KASKADE av fire separate motorer (skew →
boustrophedon → V6 → serpentine-fallback), ikke én funksjon. Bygget en representativ kopi av
Kenneths bad og kjørte kaskaden direkte — V6 (den faktiske vinneren) traff nesten eksakt riktig
totallengde (5899,9 av 5900cm) men dekket kun 85,7 % av netto areal; 0,82 m² lå kaldt, usett i
noe tall appen viser. Rapportert til Kenneth, som valgte å bygge DEL D nå og utsette DEL B/C/E
(V6 sin egen cellelogikk, og fler-kabel-veien) til en egen, fersk STEG 0-runde.

- **`648c1d0` DEL D** — ny `_finishCableAutoFill(cable, room, prod, opts)` kjøres på RESULTATET
  etter at kaskaden har valgt en vinner, uansett motor. Måler to uavhengige gap et «vellykket»
  resultat kan skjule: AREAL (Σ banelengde×CC mot netto) og LENGDE (DEL A punkt 2, «undershoot
  rapporteres ikke» — et testrom brukte kun 44 av 100 meter, usett i materiallista). Moderat gap
  → varsel; alvorlig gap (>20 %/>0,3 m² eller >25 %/2 m) → AVVIST som standard, med et produkt i
  samme familie foreslått i riktig retning, og et eksplisitt `confirm()`-overstyr. En første
  versjon avviste FØR kaskaden fikk prøve seg (basert på den naive areal/lengde-formelen alene) —
  det brøt `_cableSkewRegressionTest` sine fasit-rom (bevisst urealistisk areal/lengde for å
  teste vinkel, ikke konsistens) og ble flyttet til ETTER kaskaden, på MÅLT resultat.
- **`5800dd3` nedskalert DEL A** — kun DoD-krav 3 (kommentarrettelsen), ikke selve kode-fjerningen.
  DEL A sin egen tekst sier «en vei som ikke går gjennom celler må beholde dagens oppførsel
  bit-for-bit» — `generateCableSerpentine` sveiper monolittisk, ikke per celle (DEL B, som ville
  gjort utjevningen overflødig, er utsatt), og CLAUDE.md sin LÅSTE «No Y-splits»-regel forbyr
  nettopp det manglende utjevning ville skapt der. Kommentaren korrigert til det riktige, BETINGEDE
  premisset; koden selv urørt til cellemotoren faktisk finnes.

**Testmetodikk:** fullt regresjonsbatteri grønt (inkl. `_cableSkewRegressionTest`, alle fem case
A-E). `_matBench(42,64)` bit-for-bit uendret. Live verifisert: Kenneths bad gir en 14,3 %-advarsel
(under avvisningsterskelen — V6 er god nok); en for lang kabel i et lite rom avvises med korrekt
KORTERE produkt foreslått; en for kort kabel i et hindringstungt rom avvises med korrekt LENGRE
produkt foreslått; override fungerer; rektangulære rom er bit-for-bit stille.

**Utsatt til egen runde:** DEL B/C (V6 sin egen celle-/tilkoblingslogikk — trenger en fersk STEG 0
mot V6 sin faktiske kode, ikke mot `_decomposeRoomToRects`, som er en HELT ANNEN, enklere motor
V6 verken bruker eller deler kode med) og DEL E (fler-kabel-veien, `_buildNCableZones` — Kenneths
«Rom nr. 2», en stue/kjøkken med to InFloor 10T 2000W/200m, samt de to sonebegrepene bånd/celler
som må komponeres bevisst).

**Fil:** index.html.

---

## «Endre status» på flere prosjekter: modal bak lista, stille feil, død advarsel-farge — 2026-09-14

Kenneth: «jeg ønsker å merke mange prosjekter og endre status... det får jeg ikke til nå.»
Oppfølging: «jeg ser knappen «endre status» men det skjer ingenting når jeg trykker på den.»
Funksjonen manglet ikke — hele kjeden (avkrysning, verktøylinje, modal, `SALES_STATUSES`,
`_applySalesTransition`) var riktig og uendret. Rotårsaken var to CSS-linjer.

- **`9d352d4` DEL A** — `#project-list-screen` (z-index 1001, ugjennomsiktig) lå ett lag over
  `#modal-ov` (1000). `showModal('modal-batch-status')` kjørte helt korrekt — modalen åpnet, den
  var bare skjult under prosjektlista. Ingen andre `showModal()`-kall traff dette (de ni andre
  åpnes over `#module-screen`, 999). Hevet `#modal-ov` til 1250 — over ALLE fullskjermlag i appen;
  kildekommentaren ved regelen begrunner hvert lag i huset (999-1200), inkludert hvorfor
  `.fb-overlay`/`.exp-overlay` (1200) aldri kan kollidere (åpne-knappene deres er allerede blokkert
  av et åpent modal-ov). Bifunn i `closeModal()` (fryktet at `showDrawToolbar()` kunne tegne
  ctxbar oppå prosjektlista) reprodusert direkte og MÅLT til IKKE å skje — `#ctxbar` er nøstet inni
  `#module-screen`, og en `display:none`-forelder skjuler alle etterkommere uansett egen
  z-index/display. Ikke rettet — ingenting å rette.
- **`ec4d966` DEL B** — Supabase-klienten kaster ikke, den returnerer `{data,error}` — `try/catch`
  i `_setProjectStatus` fanget derfor så godt som ingenting, og `error` ble aldri lest. En
  RLS-avvisning ga stille retur, og appen sa «Status endret» uansett. `_setProjectStatus` returnerer
  nå samme resultatform som `_deleteFromSupabase` (`{ok:true}`/`{ok:false,reason,message?}`), og
  skiller «cond traff ikke» (et gyldig, forventet utfall) fra en ekte RLS-avvisning.
  `_applyBatchStatus` teller nå opp «X av Y prosjekt(er)» med årsak ved feil (samme mønster
  `_batchAction` sin slette-gren allerede bruker); `_quickSetStatus` hadde samme hull og
  tilbakestiller nå raden til faktisk status ved feil.
- **`332e54f` DEL C** (funnet underveis, app-omfattende) — `_showToast` kjente kun igjen strengen
  `'warning'`, men samtlige ~44 kallesteder som mente advarsel skriver `'warn'` — advarsel-grenen
  (gul, 5000ms) har derfor ALDRI kjørt noe sted i appen, inkludert klemme-meldingen fra `7cc97ee`.
  `'warn'` godtas nå som alias. Én av de 44 (`_listDoSave` sin lagrings-feil) mente faktisk «feil»,
  ikke «advarsel» — rettet til `'error'`.

**Testmetodikk:** fullt regresjonsbatteri grønt etter hver commit, `_matBench(42,64)` bit-for-bit
uendret (ingen geometri rørt). Live verifisert: modal-batch-status ligger nå over prosjektlista;
alle åtte tegneverktøy-modalene upåvirket; en oppdatering mot en id som ikke finnes gir et ærlig
«0 av N feilet»; klemme-/feilmeldinger viser nå faktisk gult/rødt i stedet for grønt.

**Fil:** index.html.

---

## Utendørs flateeffekt-tak hevet til 450 W/m², ett felles tak per modul — 2026-09-14

Kenneth: «for utendørs, så får jeg ikke satt inn høyere ønsket flate effekt enn 300 W/m². Her kan
det være ubegrenset.» Avklart før bygging: ikke ubegrenset — 450 for utendørs, 300 uendret inne.

Rotårsak, MÅLT (STEG 0-kommentar over `_moduleContext`): fire steder skrev `targetWm2` med FIRE
ulike literale tak (500/500/300/300), og bare ÉN av de to skrivefunksjonene klemte i det hele
tatt — `setRoomTargetWm2` hardkodet 30–300 uansett modul, mens `_setRoomOrGlobalWm2` satte tallet
rått. Fellen: et utendørs område satt til 500 via kabelpanelet/produktpanelet ble stille klemt ned
til 300 den dagen brukeren rørte sidepanelets felt — ingen melding, og taket fulgte fanen, ikke
rommet.

- **`7cc97ee`** — `_moduleContext` har nå `wm2Max` (snø 450, inne 300) og `wm2Min` (50 for begge,
  begrunnet i kildekommentaren — valgt fordi det er verdien flest av de fire eksisterende feltene
  faktisk brukte, ikke bare «laveste»). Ny delt `_clampTargetWm2(roomId, val)` leser taket fra
  ROMMETS modul (`_roomModuleType`, samme mønster `_roomTargetWm2` allerede bruker) og brukes av
  BEGGE skriveveiene. Varsler («Maks/Min N W/m² for utendørs/innendørs — satt til X.») kun når
  klemmingen faktisk endrer tallet — kalt utelukkende fra skrivefunksjonene, aldri fra rendering,
  så en lagret verdi over taket står urørt til brukeren selv taster et nytt tall. Alle fire
  `<input>`-feltene leser nå min/max fra samme kilde. **DEL C** (funnet underveis): de to
  `cable-target-wm2`-feltene deler DOM-id, men målt til å ikke kunne kollidere — den ene grenen er
  død kode (`showCablePlacePanel` returnerer tidlig til `showUnifiedProductPanel` før den nås).
  Dokumentert i kildekommentar, ikke fjernet.

**Testmetodikk:** fullt regresjonsbatteri grønt. `_matBench(42,64)` bit-for-bit uendret (denne
runden rører ingen geometri). Live verifisert: 450/451→450 og 300/301→300 med riktig melding;
fellen (500 satt via kabelpanelet) klemmer nå umiddelbart; et snø-rom i et ellers innendørs
prosjekt får riktig utendørstak (taket følger rommet, ikke fanen); alle nåbare felt viser samme
min/max for samme rom; en lagret verdi på 500 rendres urørt ved åpning av produktpanelet.

**Fil:** index.html.

---

## Avstand-knappen og Sentrer på et auto-utlegg med flere matter — 2026-09-12

Kenneth, sak 2: «velger en matte etter auto-utlegg, sentrer og avstand-knapp dukker opp, men det
skjer ingenting når jeg endrer avstanden.» Og: «Sentrer knappen er kanskje litt mer tvilsom når det
er to matter i rommet.» STEG 0-rapport (fem punkter, alle MÅLT mot koden) skrevet inn som
kildekommentar over `_matCenterGroupInRoom` før noe ble bygget.

Rotårsak, ett flagg: `_manualPlace`, satt KUN ved klikk-plassering. Alle de trygge gruppe-
operasjonene (`_matManualGroupX`, `_matSetGroupGap`, `openMatGroupGapPanel`, den trygge Sentrer-
grenen) var gatet på nettopp det flagget — for et auto-utlegg var gruppa alltid tom, og både
avstand-chippen og Sentrer traff i stedet mekanismer som enten ikke flyttet noe (skrev kun den
globale `S.varmematte.gapCm`) eller var direkte destruktive (slettet den valgte matta og la den ut
på nytt alene, mens de andre auto-mattene ble stående urørt og kunne overlappe).

- **`bce18b6` DEL A** — de gatede gruppe-funksjonene virker nå for ALLE matter i et rom, uansett
  opprinnelse — ingen ny mekanisme, samme `_matSetGroupGap` som allerede var riktig for manuelt
  plasserte matter. Generalisert til begge akser (`rotation_deg` 0→X, 90→Y, default 0 — bit-for-bit
  uendret for det vanligste tilfellet). Ny `_matGroupMaxMarginCm` klemmer et for stort avstandsønske
  NED til det romboksen faktisk har plass til (Regel 9: gapet gir etter, ikke margen), aldri under
  Regel 18-gulvet; `_matRunsWithinRoom` som sikkerhetsnett etter flyttingen ruller tilbake og avviser
  stille om en uregelmessig vegg likevel ikke fanges av boks-estimatet. `pushUndo()` flyttet fra
  «per tastetrykk» til «én gang, ved panelåpning» (samme mønster som folie sitt gap-panel).
- **`c76dba4` DEL B** — `_matToggleFromWall` sin destruktive vei (slett valgt matte, legg den ut på
  nytt alene med ett-blokk-motoren) er fjernet helt. Gruppeforskyvning (`_matCenterGroupInRoom`, fra
  19.08.2026) gjelder nå ubetinget — Sentrer flytter, sletter aldri. Kommentaren over
  `_matFillRoomSmart` som advarte om nøyaktig denne bugen er merket RETTET.
- **`ff77d8f` DEL C** — `openMatGapPanel` sin tittel («Avstand mellom matter») viste alltid gapet
  MELLOM BANER inni ett matteobjekt — misvisende nå som DEL A ga «mellom matter» sin egen, ekte
  chip. Omdøpt til «Avstand mellom baner», samme tall, samme funksjon.

**Testmetodikk:** fullt regresjonsbatteri grønt etter hver commit. Live verifisert på en syntetisk
kopi av Kenneths L-rom (500×400, hakk 200×200) med et ekte to-matte sone-auto-utlegg: avstands-
endring flytter begge mattene og rapporterer riktig tall; en absurd stor endring klemmes til det som
får plass; en endring som ville presset en matte over romformens hakk avvises stille. Samme fire
prøvene gjentatt for `rotation_deg: 90` (liggende) med identisk resultat på Y-aksen. Rom med kun
klikk-plasserte matter bevist bit-for-bit uendret. `_matBench(42,64)` kjørt før/etter — denne runden
rører ikke selve utleggsmotoren, og alle fire veier ga identisk resultat (224 rom, 180 fromWall-
rader, samme tall for Kenneths L-rom på alle fire veier).

**Fil:** index.html.

---

## Auto-matte: startpunkt fra vegg, innsettingshjørne, vending av for lang matte, romform — 2026-09-12

Kenneth, med skjermbilde av et L-rom (500×400, hakk 200×200): fire symptomer — en 4m matte legger
seg for nærme veggen (nett gjennom veggen), en kortere matte følger ikke innsettingshjørne-
velgeren, en 6m matte (lengre enn rommet) burde vært kuttet og vendt, og to matter starter ulik
avstand fra vegg (19 vs. 11 cm) der 5 cm burde vært standard. STEG 0-rapport skrevet inn som
kildekommentar over `_matPlaceCandidate` — MÅLT, ikke antatt: en 6m matte er matematisk umulig å
plassere via noen av de «smarte» auto-/variant-motorene i dette rommet (alongSpan=395cm, alle
forkaster en for lang matte), og `_upcPlaceMat` sine auto/variant-moduser tømmer rommet før utlegg
(tre matter kan derfor aldri komme fra tre sekvensielle klikk der). Bildet kom i stedet fra MANUELL
KLIKK-PLASSERING (`_matPlaceCandidate`) — som verken sjekket lengde mot romform, leste
innsettingshjørnet, eller hadde noen kutt-og-vend-mekanisme. Kenneths egen omtale («jeg brukte
auto») stemte altså ikke med hva koden faktisk gjorde — rapportert ærlig, deretter bygget videre
med Kenneths eksplisitte «Enig, bygg det» på den nye fordelingen.

- **`3267ebc` DEL A+D** (kombinert — A avhenger av D sin korrekte spenn) — ny `_matPolyYInterval`
  (speilbilde av `_matPolyXInterval`) gir lengdeaksen samme polygon-bevisste behandling
  breddeaksen allerede hadde. Er produktet for langt for den (nå korrekte) tilgjengelige spennen,
  søkes et gyldig (N,L)-par via `_matEqualWidthNL` (samme Regel E-funksjon `autoFillMatSerpentine`
  bruker) — rullen kuttes og legges tilbake som N side-ved-side bredder. Finnes intet gyldig par,
  avvises plasseringen stille i stedet for å stikke gjennom veggen. Samme fiks i dra-slipp-veien.
  Sideleddet: `min_wall_margin_mm`-lesingen brukte `|| 0` (eneste stedet som ikke fulgte `?? 50`-
  mønsteret ellers i mattemotoren) — rettet for konsistens.
- **`2fe9b58` DEL C** — `autoFillMatSerpentine`/`_matPlaceMultiMats` leser nå
  `S.varmefolie.startCorner` (ny delt `_matCornerFlags`) — «fra vegg» ankrer fra riktig hjørne på
  tvers-aksen i stedet for alltid laveste kant.
- **`c912561` DEL B** — langaksen har fått sitt eget «fra vegg»-standardvalg
  (`_matAlongFromWallDefault`, default sann — Kenneths «5cm standard, trykk Sentrer etterpå»),
  uavhengig av tvers-aksens `fromWall` (default usann). `_matToggleFromWall` kobler nå begge
  sammen i ett trykk. Avgrenset til UTENFOR en sone — en målt ~1cm grense-uenighet mellom sonens
  egen rektangel-geometri og den ekte klippingen kunne ellers utløse Regel H sin nedgraderingsløkke
  og halvere reell dekning.

**Testmetodikk:** fullt regresjonsbatteri grønt etter hver commit. Kenneths eksakte L-rom lagt til
`_matBenchNamedRooms` som fasit; langaksen lagt til som egen 2×2-dimensjon i mattebenkens
Regel 9/20-rapport. `_matBench(42,64)` kjørt rent med begge nye varianter (224 rom, 180 fromWall-
rader). Live verifisert: en 6m matte i rommets smaleste hakk deles nå trygt i N bredder innenfor
romformen; alle fire innsettingshjørner gir fire distinkte, korrekte startpunkt; utendørs
(`min_wall_margin_mm=0`) flytter seg til flukt-mot-vegg under det nye standardvalget (rapportert til
Kenneth som en bevisst, ikke skjult, atferdsendring).

**Fil:** index.html.

---

## Frihånd matte: veggmargin, romform, hindringsavstand, forbudte soner, produktmargin, overlapp — 2026-09-12

Kenneth: «jeg føler at frihånd matter ikke er optimal enda.» Seks funn, samme form på alle: regelen
finnes allerede i appen (auto-matte/folie), og frihåndsmotoren var ikke koblet på den. STEG 0-rapport
(seks punkter, alle MÅLT mot koden/en kjørende økt — ikke antatt) skrevet inn som kildekommentar over
`_matFreeCableMarginCm` før noe ble bygget.

- **`8a97385` DEL D** — kabelmarginen (`_matFreeCableMarginCm`) leser nå `prod.min_wall_margin_mm`
  (`??`, ikke `||` — en eksplisitt 0 på et utendørsprodukt er gyldig) i stedet for et flatt 5cm/0cm
  utledet av inne/ute. Samme kilde auto allerede bruker. Kommentartabellen fra 19.08-STEG-0-en
  («Én mattemotor for alle») oppdatert der den nå var utdatert.
- **`63c275e` DEL A** — `_matFreeClampLen` bruker nå `clipStripToRoom` (samme delte primitiv auto-
  mattemotoren allerede bruker) i stedet for en bar `clipScanlineToPolygon` på senterlinja — trekker
  margin fra i samme kall OG sampler tett over HELE lane-bredden, ikke bare senterlinja. STEG 0 punkt
  2 (skrå/uregelmessig vegg) MÅLT med et trapesformet rom: en senterlinje godt innenfor komfortsonen
  lot likevel en lane-KANT stikke 5cm utenfor den lokale takhøyden, feilaktig godkjent av den gamle
  logikken. Samme bytte lukket et funn UTOVER spec-en: commit-vakten (`_matFreeRunsWithinRoom`)
  hadde INGEN tverr-sjekk i det hele tatt. `_matFreeStartFor` sin `shortM` er nå
  `Math.max(cc/2, marginCm)` — cc/2 er MÅLT (via `_drawMatPathCable`) til å være avstanden fra
  MESH-KANTEN til kabelens første streng, ikke et mål mot veggen selv. `_matFreeRegressionTest` sin
  «(30,296)»-fasit MÅLT til å bli «(30,295)» for 1108-produktet (marginCm=5 > cc/2=4 der) — oppdatert
  med forklaring.
- **`c938f23` DEL B** — samme feilklasse `_matFreeStartFor` hadde i rom 1108 før 19.08, gjort ett
  sted og ikke det andre: `_matFreeCandidate` sin perpendikulære «passer lanen»-sjekk brukte romMENS
  bbox, ikke romMENS FORM. Bytter til `clipStripToRoom` (samme primitiv DEL A innførte). Verifisert
  direkte: en L-formet 900×400+300×700-rom med en bane midt i det fjernede hjørnet — gammel bbox-
  logikk ville godkjent den, ny sjekk avviser den korrekt.
- **`fc96d4e` DEL C** — hindringsløkka stoppet på rå bbox-kant, avstand null, og leste aldri
  `h.clearance` (10.09.2026, 22fbe9e/d0c60fd — auto respekterer allerede 'wall'/'none'). Ruter nå
  gjennom `_splitHindringsByClearance` + `clipStripAroundHindrings`, samme kilde som auto.
- **`51aa721` DEL E** — funnet MENS spec-en ble skrevet, ikke i de fem punktene Kenneth fikk:
  forbudte soner (dusj/våtrom/sluk) ble aldri klippet mot i frihånd. Lagt til med samme mekanisme.
- **`f975ef3` DEL F** — `_matPathOverlapsOthers`/`_matPathMoveValid` fantes og virket, men kun
  drag-veien brukte den; en NY bane committet via `_matFreeRunsWithinRoom` alene (kun selv-overlapp).
  `_matFreeExit` bruker nå `_matPathMoveValid` — dro du en matte oppå en annen ble du stoppet, tegnet
  du en ny oppå en annen ble du ikke det, nå er begge veier dekket.

**Testmetodikk:** fullt regresjonsbatteri grønt etter hver commit. `_matBench(42,64)` kjørt før/etter
(ved midlertidig å bytte tilbake de tre berørte funksjonene i en levende økt, ikke via git) — vei 4
(Frihånd) sin AGGREGERTE dekning (ulovlig talt som 0%, ikke utelatt) falt fra 52,19 % til 36,58 %,
nøyaktig som ventet («marginen tar areal»); vei 1-3 (UPC auto/Fyll rom/InSnow) bit-for-bit uendret
(67,83/67,83/48,78 begge veier). Utendørs (`min_wall_margin_mm=0`) eksplisitt verifisert bit-for-bit
uendret (samme margin, samme shortM/longM, samme klipp, før og etter). Dusjsone-scenario, L-form-
scenario og to-matter-overlapp-scenario alle verifisert direkte (se commit-meldingene). 100 rom × 4
veier på ~200ms.

**Fil:** index.html.

---

## Mattebenk: N syntetiske rom, alle inngangspunkter, poeng og historikk — 2026-09-12

Kenneth (19.08.2026): «Er det mulig å lage x antall syntetiske rom og kjøre en fast test med
intervall? Kan man på den måten se hvilken motor/regel som vinner?» 4f8aa87 (03.09) beviste at dette
virker (864 rom/37 % avvik forkastet, 4400 rom/0 avvik committet) — men målingen ble aldri stående i
koden. Denne runden gjør fasiten til et tall.

- **`7724f5f`** — delt katalogbygger (`_matBenchCatalog`) trukket ut av `_matRegressionTest` og
  `_matZoneRegressionTest` sine nesten identiske arealsveip-kataloger (spennet, 1-30 m² mot maks
  15 m², er fortsatt bevisst ulikt — kun byggeren er delt). To engine-utvidelser med `opts.dryRun`,
  ingen endret virkemåte uten flagget: `_packSnowMats` (var den eneste av de fire mattevegene uten
  dryRun) og `_matFillRoomSmart` (sone-/flermatte-grenen endte FØR alltid i et interaktivt
  forslagspanel — umulig å måle uten DOM-klikk per rom; returnerer nå samme beregning panelet ville
  vist, med samme «like»-forvalg).
- Samme commit — seedet romgenerator (`_matBenchRooms`, mulberry32, aldri `Math.random()`) dekker
  rektangler/L/T/U/hindring/smale/store/grensetilfeller. De navngitte fasit-rommene
  (1110/1105/1102/1108 + nye 2102/2104/Obs Bygg) er alltid med, aldri generert. Fire vei-løpere
  kjører UPC-auto, «Fyll rom», InSnow og en syntetisk frihånds-bane i dryRun. To reelle bugs funnet
  og rettet UNDERVEIS i benkens egne antakelser (ikke i selve motoren): frihånds-banen gikk rett
  gjennom bunnveggen for loddrette rom (`_matFreeStartFor` forankrer alltid i nedre-venstre hjørne),
  og Regel 13 (overskuddsrull ≤ ett kuttintervall) ble feilaktig håndhevet også for rom hvor formen
  faktisk klipper en bredde kortere — en allerede akseptert oppførsel for uregelmessige rom.
- Samme commit — poengsummen (`_MAT_BENCH_WEIGHTS`, én navngitt konstant): cc-avvik (Regel 21) >
  dekningsgrad (f2dc648) > breddespredning (Regel 6) > margin-symmetri/antall/spill — aldri
  `_statsAtLeastAsGood` sitt prosentpoeng-bånd-mønster. Det uavklarte Regel 9/20-spørsmålet kjøres
  med begge (via `S.varmematte.fromWall`) og legges fram som egen rapport, ikke gjettet. Tre
  `console.table`-rapporter, JSONL-historikk i localStorage med diff mot forrige kjøring og en
  flipp-teller — verifisert direkte mot en syntetisk 5→4→5→4-pendling. Autokjøring ved lasting i
  utviklingsmodus (`_IS_DEV_HOST`), kun diff i konsollen.
- **Ærlig funn, ikke gjettet bort:** DoD ba om at «rom 2104 viser målbart at vei 2 slår vei 1».
  Kildelesing viser at UPC-auto siden `c4f4429` kaller PRESIS samme `_matFillRoomSmart`-funksjon
  som «Fyll rom» selv er — vei 1 og vei 2 er derfor i dag samme kall, og benken viser dem (riktig)
  som identiske for 2104. Beviser at ruting-fiksen fra `c4f4429` holder, ikke at benken bommer.
  zoneRect-avviket (kommentaren over `_matZoneRegressionTest`) reprodusert som egne rader for
  genererte L/T/U-rom — samme sone i sone-kontekst mot frittstående gir reelt forskjellig dekning,
  akkurat som dokumentert. Ikke fikset, kun vist.

**Testmetodikk:** alle fem eksisterende regresjonstester består uendret; 1110/1105 gir bit-for-bit
samme utlegg i benken som i sine egne fasit-tester; samme seed gir identisk resultat (eksklusiv
ms-kolonnen); `_matBench` endrer intet i S/HEATING_PRODUCTS/`_matFree` (full try/finally-
gjenoppretting); 100 rom × 4 veier kjører på ~150ms; andre kjøring med identisk seed rapporterer
«ingen endring»; autokjøring ved lasting bekreftet (historikk skrevet ~4s etter sideåpning uten
bypass).

**Fil:** index.html.

---

## Varmetype på tegnet rom, husket kabelklasse, FERDIG nær hånda — 2026-09-11

Kenneth: «jeg står i en innendørs tegning … her skal jeg bruke utendørs varmekabel … uten å måtte
opprette et nytt utendørs prosjekt eller nytt plan?» + «jeg får ikke opp valget dupliser i det hele
tatt.» + «velger 10W/m på kabeltype … så ønsker jeg at begge de valgene huskes … den står alltid på
17T.» + «man må innom først bekreft … så må man gå helt opp og trykke ferdig.»

- **`4fee68e`** — DEL A: ny `setRoomModuleType(roomId, v)` setter KUN `room.moduleType` — samme
  felt/verdier `_listOnEnv` allerede setter for listerader (forrige runde), ikke et nytt begrep.
  Har rommet produkter, spør først («Rommet har utlagte produkter som ikke finnes utendørs. Fjern
  dem og bytt varmetype?») og tømmer+bytter kun ved bekreft; er rommet tomt, byttes det uten
  dialog. `targetWm2` røres bevisst ikke — `_roomTargetWm2` leser allerede modulens `wm2Default`
  (300/130) automatisk når feltet er null; har rommet en egen verdi, beholdes den og nevnes i
  dialogen/en toast. Nytt delt fragment `_varmetypeCtxItems` (samme sel-mønster hindringsavstanden
  fikk i `22fbe9e`) satt inn i BEGGE `roomCtxMenu` (sidepanel) OG `canvasRoomCtxMenu` (lerret).
- Samme commit — fant roten til «jeg får ikke opp Dupliser»: `canvasRoomCtxMenu`, menyen som
  faktisk åpnes når man høyreklikker et rom PÅ LERRETET (der Kenneth jobber mens han tegner), er en
  helt annen funksjon enn `roomCtxMenu` (sidepanelets rad-meny, der Dupliser-valgene alltid har
  ligget) — og hadde ingen dupliser- eller varmetype-mulighet i det hele tatt. Varmetype-bryteren
  er derfor lagt til akkurat der, ikke bare der spec-en selv antok. Sidepanelets romikon viser nå ❄
  for et utendørs rom i stedet for en tom ⬡.
- Samme commit — DEL B: familien ble forvalgt fra PRODUKTREKKEFØLGEN hver gang et rom uten egne
  produkter fikk produktpanelet åpnet, aldri fra hva som faktisk ble brukt sist. Ny
  `_lastUsedKlasse(modType)` leser samme `_trackProductUsage`-signal som allerede fantes (kun brukt
  til «Mest brukt»-merket før), finner blant `_upcScopeProducts` sitt allerede miljø-filtrerte
  utvalg produktet med nyeste `lastUsed`, og gir det som forslag når produktpanelet åpnes for et
  rom uten egne produkter, og når Kabel/Matte byttes midt i panelet. SIST brukt, ikke MEST brukt —
  per (produkttype, innendørs/utendørs) helt gratis, siden `_upcScopeProducts` allerede skiller
  miljø. `arqely_usage`-nøkkelen urørt.
- Samme commit — DEL C: ny «✓ Bruk og ferdig»-knapp ved siden av «✓ Bruk» i både kabel- og
  matte-forhåndsvisningens footer. Kaller `_confirmCablePreview`/`_confirmMatPreview` FØRST,
  deretter `finishRoomWorkflow()` uendret — ingen ny avslutningsvei, riktig rekkefølge (bekreft før
  avslutt, ellers forsvinner utlegget).

**Testmetodikk:** tomt rom byttet til utendørs uten dialog, produktpanelet viser InSnow/300 W/m²
automatisk, rom med InFloor-kabel gir bekreft-dialog (avbryt bevarer, bekreft tømmer+bytter), egen
`targetWm2` beholdes og varsles, samme rom/etasje/del gjennom hele bytte-syklusen, ❄-ikon i
sidepanelet, lagre/åpne beholder `moduleType`, listerader upåvirket. InFloor 10T valgt i ett rom
foreslås i neste, uavhengig av matte-/utendørs-valg i andre rom; ingen lagret historikk faller
tilbake til dagens oppførsel. Ekte DOM-klikk på «✓ Bruk og ferdig» committer og lukker
arbeidsflyten i ett klikk; «✓ Bruk» alene uendret. Fullt regresjonsbatteri
(mat/matZone/matFree/cableSkew/foil) grønt.

**Fil:** index.html.

---

## Hurtigprosjektering: utendørs produkter (InSnow) + klasse huskes nå — 2026-09-11

Kenneth: «jeg ønsker å kunne velge InSnow 30T 230V-kablene i listefunksjonen … i dette tilfellet er
det mange like garasjeporter som skal ha samme varmekabel under portene.» Etter første test:
«klasse må huskes, den endrer seg alltid tilbake. la InSnow 30T 230V være standard. sett på 230V
bak»

- **`d17403f`** — DEL A: modulfilteret i lista var hardkodet til `'indoor'` (`_listIndoorCat`) —
  InSnow fantes derfor aldri der, ikke fordi noe manglet, men fordi modulen aldri var ment å
  variere. Omgjort til et `envType`-argument (`_listCatFor`), med `'indoor'` fortsatt standard slik
  at alle andre kallere er uendret. Ny «Varmetype»-velger (Innendørs/Utendørs) på raden, samme felt
  (`room.moduleType`) som tegnede rom allerede bruker — ikke et nytt begrep. Ny rad arver forrige
  rads varmetype (mange like porter etter hverandre skal ikke kreve tjue valg). Ønsket W/m² og
  klassene (InSnow 20T/30T/40T) kommer gratis av eksisterende `_roomTargetWm2`/`_listFamiliesFor`
  når de får riktig miljø å lese fra.
- Samme commit — DEL B: familier er nå nøkler «familie|spenning» (`_listFamKey`), samme mønster
  trappepanelet allerede bruker, slik at InSnow 30T 230V/400V ikke kollapser til én klasse med
  begge spenningene blandet i variantlista (en 400V-kabel kunne vært valgt ved et uhell).
- Samme commit — DEL C krevde ingen kodeendring: materialliste, Visma-kopiering, GBAO10-eksport og
  PDF-romoversikten leser allerede rom/kabler uavhengig av `moduleType`. Verifisert i nettleser: seks
  like InSnow-kabler aggregeres til én linje med antall 6, side om side med en innendørs InFloor-rad
  i samme liste.
- **`71d35e2`** — Kenneth testet live og fant at klassen «hoppet tilbake»: hvert areal-/hindring-/
  W-m²-felt regnet ut en helt ny «nærmest ønsket effekt»-familie fra bunnen hver gang, og overskrev
  et manuelt valg stille. Usynlig for InFloor 10T/17T (tette W/m²-verdier), åpenbart for InSnow
  20T/30T/40T (mye bredere spenn). `_listAutoSuggest` beholder nå en gyldig `room.listFamily` urørt
  og reberegner kun produkt+antall INNENFOR den — ny familie velges kun når ingen er satt ennå. Ny
  standard for utendørs kabel: InSnow 30T 230V (samme standard trappepanelet bruker via
  `preferredFamily`), ikke lenger «nærmest ønsket effekt» på tvers av 20T/30T/40T — innendørs
  beholder sitt smarte nærmest-søk uendret. Klasseteksten viser nå spenning i klartekst alltid
  («InSnow 30T 230V», «InFloor 10T 230V»), ikke bare når flere spenninger faktisk finnes i utvalget.

**Testmetodikk:** Kenneths eget eksempel (YD-01, 2 m², Utendørs) verifisert i nettleser — foreslår
300 W/m² og InSnow 30T 230V automatisk, 400V-varianten i egen klasse og kan ikke velges ved et
uhell, fem påfølgende rader arver Utendørs uten å velges på nytt, en rad satt til Innendørs i samme
liste gir InFloor/130 W/m² side om side, ekte DOM-select+change-event bekrefter koblingen, lagre/
åpne-rundtrip beholder `moduleType` per rad, manuelt valgt klasse overlever påfølgende areal-/
hindring-/W-m²-redigering i rekkefølge (var buggen, bekreftet både utendørs og innendørs), rent
innendørs-scenario uendret tekst/verdier. Full regresjonsbatteri (mat/matZone/matFree/cableSkew/
foil) grønt gjennom begge commits.

**Fil:** index.html.

---

## Dra og slipp plantegning på alle etasjer, ikke bare den første — 2026-09-11

Kenneth: «når jeg oppretter et prosjekt, kan jeg dra og slippe plantegning inn i prosjektet for
etasje 1. Når jeg skal opprette etasje 2 og velge importer plantegning, så åpner mappevelgeren seg.
Kan jeg få dra og slipp her også? Det er ofte jeg ønsker å dra fra epostprogrammet.»

- **`56619a6`** — DEL A: nye, separate `dragover`/`dragleave`/`drop`-lyttere på selve lerretet
  (aldri inni de finjusterte produkt-draging-lytterne — `S.ui.dragWidth` skiller dem allerede). En
  ramme «Slipp plantegning her — {etasjenavn}» vises mens en fil dras, med en window-nivå
  `dragleave` (`relatedTarget===null`) som rydder opp selv om musen forlater hele nettleservinduet
  midt i dragingen. DEL B: hver etasjerad i sidepanelet er nå også en slippsone, uthevet under
  dragingen; ny `_activateFloor()` skiller aktivering fra fold-ut/fold-inn (var sammenvevd i
  `toggleFloor`) slik at et slipp aktiverer riktig etasje FØR import uten å tilfeldig folde raden.
  DEL C: ny delt `_resolveDroppedImportFile()` sier alltid ifra i stedet for å være stille — «fant
  ingen fil» ved en lenke/webmail-drag, hvilke filtyper som støttes ved feil type, «bare den første
  importert» ved flere filer sluppet samtidig.
- Underveis droppet en tidligere plan om å gate på `dataTransfer.types` — en lenke-draging mangler
  `'Files'` i `.types`, så en slik gate ville gjort DEL C sin «aldri stillhet»-regel til nettopp
  stillhet for akkurat lenke-/webmail-tilfellet spec-en handler mest om (Kenneths hovedgrunn for å
  ønske funksjonen). Løsningen ble enklere: siden ingenting annet i appen bruker native HTML5-
  draging mot lerret eller etasjerad, holder det å sjekke at det ikke er en produkt-draging.

**Testmetodikk:** floor-2-aktiv PDF-drop lander på etasje 2, ramme vises med riktig etasjenavn og
forsvinner ved dragleave/vindu-forlating, produkt-draging fra katalogen uendret (ingen ramme,
`dragWidth`-gate uberørt), slipp på «Etasje 2»-raden mens etasje 1 er aktiv aktiverer og importerer
til etasje 2 uten å folde raden, tom-prosjekt-sonen fortsatt fungerer, lenke-/webmail-drag gir
feilmelding i stedet for stillhet, ugyldig filtype (.txt) lister støttede typer, tre filer sluppet
samtidig importerer bare den første. Full regresjonsbatteri grønt.

**Fil:** index.html.

---

## Snøsmelting: del sone så matta går opp, kile i trapp (DEL A-C) — 2026-09-11

Kenneth, med Fjeldseth-tegningen (håndtegnet fasit) som mål: «for utendørs ønsker man gjerne å
legge ut matter som starter og slutter naturlig... Her har jeg på en måte delt opp en sone hvor jeg
vet jeg får plass til en matte tur/retur.» + «egen sone, men med 50 cm brede matter... slik som
varmefolie gjør mot skråvegger.»

- **`41b3d3f`** — DEL A: ny «Del så matta går opp»-knapp på en sone/rom kjører Regel E
  (`_matEqualWidthNL`) BAKLENGS — ny `_matWholeBandPlan` finner hvor høyt ett bånd må være for at
  N mattebredder dekker det uten rest, og hvor mange slike bånd som får plass i sonens tverr-
  utstrekning. Panel med forslag, «Vis andre matter» og stiplet forhåndsvisning; godtas det,
  splittes sonen via `_performZoneSplit` (fikk `opts.skipPushUndo/skipSelect/silentFail`, ingen ny
  sonetype) og hvert bånd fylles med `autoFillMatSerpentine(...,{zoneRect,exact:true})` — samme vei
  sone-fyll allerede bruker. Underveis rettet et feil tie-break i N-valget (forsøkte først å
  gjenbruke Regel E sitt EGET forward-kriterium — riktig når tverr-høyden er fast, feil her siden N
  DEFINERER høyden) — riktig kriterium: mest dekket areal, ved likt MINST N (Kenneths «matte
  tur/retur»-prinsipp). Verifisert eksakt mot alle tre Fjeldseth-felt (638×459→2×200cm, 405×316→
  300cm, 156×400→150cm).
- Samme commit — to pre-eksisterende motorfeil funnet og rettet (blokkerte DEL A direkte): (1)
  `clipStripToRoom` ga tomt resultat ved skanning eksakt på en romveggs egen yttergrense (klassisk
  ray-casting-kvirk, rammet ethvert utendørs produkt med 0 margin flush mot kanten); (2)
  `min_wall_margin_mm || 50` fire steder behandlet en eksplisitt `0` (alle utendørs mattprodukter)
  som «ikke satt» — rettet til `?? 50`.
- DEL B: levende avlesning ved markøren mens «Del i soner» tegnes manuelt, viser hva de to
  resulterende delene gir for matta som allerede ligger der. Ren visning, ingen snapping.
- DEL C: ny «Fyll kilen (trapp)»-knapp (vises for en sone med skrå kant i stedet for DEL A sin
  knapp) bygger en trapp av smale (≤60cm) matter med avtagende lengde mot spissen — mønsteret og
  begrunnelsen fra folies `_slantStaircaseFill`, ikke koden (ulik datamodell). Frihånd urørt.

**Testmetodikk:** alle tre Fjeldseth-felt reprodusert til centimeteren; retningsvalg for udelt rom
testet og rettet (auto-retning valgte feil akse i én testcase); full del-og-fyll-syklus verifisert
(riktige zoneId, riktig antall matter); étt undo nullstiller hele operasjonen; feilmelding med
nærmeste alternativ verifisert; kile-trapp verifisert med heltalls-avrundede, avtagende lengder.
Full regresjonsbatteri (mat/matZone/matFree/cableSkew/foil) grønt gjennom hele runden.

**Fil:** index.html.

---

## Trapp: bredder+kabellengder vises uten valg, detaljutsnitt på utskrift — 2026-09-11

Kenneth: «utendørs trapp: jeg ønsker at bredden på trinn/repos vises på tegning. Jeg ønsker også at
lengden på kabelstrengene i trapp/repos vises. På utskrift ønsker jeg meg at det vises et utsnitt av
f.eks. ett trinn men detaljerte mål. Avstand fra kanter, fra opptrinn, sider, cc, lengde kabel. Og
hvis det er et eller flere repos, må de også ha sitt eget utsnitt.»

- **`6e607cd`** — DEL A: totalbredde (`surf.w_cm`) tegnes nå i egen målelinje over de to
  eksisterende marginmålene, på både skjerm og utskrift, slik at «5 · ... · 5» og «120» leses
  samtidig. Egen gruppering (uavhengig av den eksisterende `dimSurfaces`, som styrer dybde-mål og
  er bundet til kabel-ruting): trinn med lik bredde kollapses til ett mål + «(×N trinn)»-notat,
  repos får alltid sitt eget. Fant og rettet en kollisjon underveis der notatet lå rett oppå
  selve breddetallet. DEL B: `isSel`-kravet fjernet fra både kabellengde- og målsettingsblokken —
  begge vises nå uten at trappen må være valgt, zoom-grensene uendret. DEL C: nytt forstørret
  detaljutsnitt per GEOMETRISK DISTINKT flate på utskrift (én per trinn-type + én per repos). Ny
  `_stairDetailGroups()` grupperer trinn etter signatur (bredde/dybde/antall strenger/CC/offset
  topp/offset bunn) — bevisst ikke den eksisterende kabel-baserte `dimSurfaces`/`dimSurfacesImg`:
  to trinn matet av ulike kabler men med identisk geometri gir nå riktig ÉN utsnitt, ikke to. Repos
  slås aldri sammen med hverandre, selv ved identisk geometri. Ny `_renderStairDetailInsets()`
  gjenbruker `_stairDrawToCanvas` uendret (ingen ny tegnekode) med `surfaceRange` begrenset til
  gruppens representant-flate, plassert i `exportPDF` rett etter trappens egen tegning, før
  materiallista.

**Testmetodikk:** 17 identiske trinn ga nøyaktig ett breddemål og én inset merket «(typisk)»; én
avvikende dybde midt i 17 trinn ga to trinn-innsett med korrekt fragmentert rekke («Trinn 1–8,
10–17» og «Trinn 9»); to repos ga tre innsett totalt, aldri slått sammen; en trapp uten lagt kabel
ga null grupper/innsett og ingen feil; en lang 1468cm-trapp bekreftet at STEG-6 bånd-splitting (3
bånd) fortsatt virker uendret, med innsett lagt til i tillegg. Full `exportPDF` kjørt live (med
`jsPDF.save` stagget for å unngå faktisk nedlasting) bekreftet at innsettene genereres fra riktig
sted i den ekte PDF-loopen. Full regresjonsbatteri grønt.

**Fil:** index.html.

---

## Hindringsavstand: alltid 25mm-regel som standard, valget til høyreklikk — 2026-09-10

Kenneth, dagen etter forrige runde: «kan vi gå tilbake til at alle hindringer i utgangspunktet har
regel om 25mm avstand slik som mot vegger? Også ønsker jeg heller å kunne velge hindring etter den
er laget, høyreklikk og velge regel 'på/av'.» Klippemekanikken fra forrige runde (`clearance`:
'wall'/'none', `_splitHindringsByClearance`) er urørt — det som endres er hvem som bestemmer og når.

- **`22fbe9e`** — DEL A: typebaserte standardvalg (`defaultClearance`) fjernet fra
  `HINDRING_TYPES`. Avstandskravet er en fagvurdering per situasjon, ikke en egenskap ved
  møbeltypen. DEL B: avkryssingsboksen i tegnedialogen fjernet helt — alle fem
  opprettelsesstedene setter nå `clearance:'wall'` direkte. DEL C: to valg i høyreklikk-menyen
  (samme funksjon for tegning og sidebar-rad), aktivt valg merket. Ny delt `_hindringWallLabel()`
  leser den faktiske effektive marginen fra produktene i rommet — ett tall når det er
  entydig, «Avstand som vegg» uten tall når det ikke er det. DEL D: objektinfo-panelet bruker
  samme etikett-funksjon som menyen.
- **`d0c60fd`** — DEL E (kjørt etter eksplisitt bekreftelse): alle eksisterende `clearance:'none'`
  nullstilt til `'wall'` ved prosjekt-innlasting (`_restoreProject`) — ingen av dem var et bevisst
  valg, bare en konsekvens av at kjøkkenøy/skap tilfeldigvis fikk `'none'` som type-forslag i det
  ene døgnet forrige runde levde.

**Testmetodikk:** Kenneths 109cm-passasje re-kjørt gjennom den nye høyreklikk-flyten (samme
resultat som forrige runde). Etikett bekreftet med ekte 25mm/50mm-produkter og med to produkter
med ulik margin (ingen tall). En simulert «prosjekt fra i går» med en `'none'`-kjøkkenøy normalisert
korrekt ved innlasting. Full regresjonsbatteri grønt.

**Fil:** index.html.

---

## Spør om romnavn rett etter et rom er tegnet — 2026-09-10

Kenneth: «en annen ting jeg gjør mye, er å gi rommene navn. Kan man få opp en boks med en gang et
rom er opprettet hvor man bare kan begynne å skrive inn med en gang og trykke enter... Hvis man
ikke ønsker å skrive romnavn, så kan man trykke enter, så vil det lagre seg som rom 1 osv.»

- **`b31dc64`.** `createRoom` er allerede eneste vei inn for alle interaktive tegnemoduser, og
  standardnavnet («Rom N») fantes allerede der — ingen ny navnelogikk, bare en ny boks
  (`_showRoomNamePrompt`) som viser det rommet faktisk fikk, forhåndsutfylt og markert, fokusert
  med én gang. Enter lagrer (tomt felt beholder standardnavnet), Escape lukker uten å røre navnet
  eller rommet. Ny `promptName`-parameter på `createRoom`, satt av **elleve** interaktive
  kallesteder (flere enn spec sine «seks moduser» antok — hver modus har flere inngangsveier).
  Standard false — duplisering, PDF/DWG-import (som faktisk GÅR gjennom `createRoom`, motsatt av
  hva som var antatt), regresjonstester og enhver fremtidig kaller ser aldri boksen uoppfordret.
  Ny innstilling («Spør om romnavn når et rom opprettes», på som standard) i Snap-widgeten, lagret
  i `arqely_prefs`.

**Testmetodikk:** verifisert direkte at snømodulens `setTimeout(...,100)`-produktpanel (som ikke
kaller `focus()` noe sted) aldri stjeler fokus fra navnefeltet, med den ekte funksjonen, ikke en
mock. Alle fire hovedmodusene testet gjennom sine faktiske fullføringsfunksjoner. Full
regresjonsbatteri grønt, ingen hang.

**Fil:** index.html.

---

## Auto-folie-boksen kan nå flyttes, åpner i øvre høyre hjørne — 2026-09-10

Kenneth: «den boksen ønsker jeg å kunne flytte rundt på, slik det er nå, så skygger den over
tegningen slik at jeg ikke ser resultatet når jeg holder musen over de forskjellige valgene.»

- **`2f9af08`.** `#autofill-compare` byttet fra sentrert `position:absolute` til `position:fixed`
  uten transform. Gjenbruker `_initPaletteDrag` (samme mekanikk som den manuelle paletten) — ingen
  ny drag-implementasjon. Overskriften er nå håndtaket. Standardplassering: øvre høyre hjørne av
  `#canvas-wrap`, husket i nye `S.ui.afPosX/afPosY` og klemt innenfor vinduet på hver visning.

**Fil:** index.html.

---

## Escape i målemodus dreper ikke lenger artikkellista, ny hurtigtast D — 2026-09-10

Kenneth: «når jeg trykker ESC for å få bort målefunksjonen, så blir artikkellista borte... Hvis
jeg høyreklikker når jeg er i mål-modus, så går alt greit.»

- **`931c0cb`.** Målemodus fikk sin egen gren helt øverst i Escape-kjeden (før
  `_manualPlaceSession`), slik at Escape avslutter kun målingen, ikke hele den manuelle
  utleggingsøkta. Ny hurtigtast **D** («Dimensjon») for Mål-verktøyet, samme sted som V/H.

**Fil:** index.html.

---

## Avstandskrav per hindring, ikke per produkt — 2026-09-10

Kenneth: «jeg får ikke plassert 100cm varmefolie i en passasje med 109 ca avstand mellom to
hindringer. Det er en kjøkkenøy som står 109 cm fra kjøkkenbenk.» `computeClippedSegments` ga ALLE
hindringer produktets veggmargin uansett type — en pipe og en kjøkkenøy-sokkel ble utvidet likt. I
en 109cm passasje ga 5cm produktmargin en fri bredde på 99cm; 100cm folie bommet med én centimeter.
Kenneth: «I praksis så legges det nok litt varmefolie under en kjøkkenbenk-sokkel... men andre
hindringer må vi absolutt ikke gjøre det.»

- **`795171c`.** Nytt `clearance`-felt på hindringer (`'wall'`|`'none'`), foreslått av
  `HINDRING_TYPES` sin nye `defaultClearance` (kjøkkenøy/skap → none, pipe/vegg/annet → wall —
  samme mønster som `ZONE_TYPES.default`). Avkryssingsboks i tegnedialogen, oppdateres live når
  typen byttes, og redigerbar etterpå på en allerede tegnet hindring. Alle fem opprettelsesstedene
  (dimensjon/polygon/vegg-til-vegg/fri-tegning/DWG-import) setter feltet; duplisering arver det.
  Manglende felt (eldre prosjekter) leses som `'wall'` — ingen tegning endrer seg av seg selv.
  Ny delt `_splitHindringsByClearance()` brukt av BÅDE folie- og mattemotoren for selve klippingen
  — kabelmotoren går IKKE gjennom denne (bruker rom-splitting, en helt annen tilnærming) og er
  derfor rapportert som ikke dekket denne runden, ikke fikset. Det manuelle bruddvarselet
  (`getStripViolations`) leser nå samme per-hindring clearance som automatikken, og bygger
  meldingen dynamisk («Ligger 1,2 cm for nær Kjøkkenøy (krever 2,5 cm)») i stedet for en statisk
  «25mm fra vegg/hindring»-tekst som løy når produktets faktiske margin var noe annet.
  `min_obstacle_distance_mm` sin døde 50mm-standardsetting fjernet i stedet for koblet inn — feltet
  ble aldri lest noe sted, og 50mm er strengere enn dagens 25mm-standard; å bruke det ville gjort
  akkurat Kenneths passasje verre.

**Testmetodikk:** rekonstruerte spec sin egen 109cm-passasje-aritmetikk direkte —
fikk eksakt 104cm fri bredde ved 2,5cm margin og eksakt 99cm ved 5cm margin, samme tall som spec
selv oppgir. Bekreftet checkbox-forslag for alle fem hindringstyper, full opprettelse→redigering→
duplisering-runde, manuelt bruddvarsel med riktig navn og avstand for «wall» og null varsel for
«none» uansett overlapp, gammel hindring uten feltet leses som «wall», mattemotoren respekterer
samme klipping som folie. Full regresjonsbatteri grønt.

**Fil:** index.html.

---

## Appen skal ligge på /, ikke /romtegner.html — 2026-09-07

`varmeplan.no` var oppe med gyldig HTTPS, men rotadressen svarte 404 — appen lå kun på
`/romtegner.html`, et filnavn Kenneth eksplisitt ikke vil ha noe sted («jeg ønsker ikke at appen
skal hete noe med romtegner eller arqely i det hele tatt»). Filnavnet står i adressefeltet,
bokmerker og hver invitasjonslenke som er sendt ut. Bygger på `4282510` (`isTrustedOrigin` godtar
`varmeplan.no` i feilklassifiseringen — udokumentert til nå, egen liten fiks samme dag).

- **`bec7efd`.** `git mv romtegner.html index.html` (historikken følger med) og
  `serve-romtegner.js` → `serve-varmeplan.js` (FILE-sti og konsoll-linje oppdatert, PORT 4000
  uendret). Ny `vercel.json` viderekobler `/romtegner.html` → `/` (permanent), slik at allerede
  utsendte invitasjonslenker og bokmerker fortsetter å virke. Synlige tekster rettet: tre
  filvelger-dialogers «Romtegner-prosjekt» → «Varmeplan-prosjekt», invitasjonsmailens
  fallback-orgnavn, og `admin.html` sine 7 forekomster (tittel, to `<h1>`, logo, tilbake-lenke +
  href, og selve URL-en admin-panelet bygger for nye invitasjoner). Åtte `console.log('Romtegner:
  …')` → `'Varmeplan: …'`. `romtegner_projects` (Supabase-tabellen) og de fire `arqely_*`-nøklene
  i nettleserlagringen bevisst IKKE omdøpt — hver fikk en kommentar som forklarer hvorfor (ingen
  bruker ser dem, omdøping er en migrasjon med reell risiko for eksisterende data).

**Testmetodikk:** full regresjonsbatteri grønt lokalt, deretter LIVE på selve produksjonsdomenet
etter push — ikke bare antatt. Første forsøk på å verifisere at spørrestrengen (`?invite=token`)
overlevde viderekoblingen så ut til å feile (`window._inviteToken` var alltid `undefined`) — falsk
alarm, ikke en ekte bug: `_inviteToken` er en topp-nivå `let`, som (i motsetning til `var`) ALDRI
blir en `window`-egenskap i en klassisk (ikke-modul) `<script>`. Bekreftet ekte ved å lese den
bare identifikatoren `_inviteToken` direkte i samme kjøremiljø — tokenet var der hele tiden.
Bekreftet på selve domenet: `varmeplan.no/` laster appen (ikke 404), `varmeplan.no/romtegner.html
?invite=xxx` viderekobler til `/` med tokenet korrekt lest, `arqely.com/` og
`arqely.com/romtegner.html` virker begge fortsatt (`arqely.com/` fikk faktisk samme fiks på kjøpet
— den hadde heller ingen `index.html` fra før).

**Fil:** index.html (omdøpt fra romtegner.html), serve-varmeplan.js (omdøpt fra
serve-romtegner.js), ny vercel.json, admin.html, CLAUDE.md + backup.

---

## KRITISK: PostgREST sitt 1000-raders-tak gjorde 2130 av 3130 registerrader usynlige — 2026-09-05

Kenneth: «Det er mange kunder som ikke kommer opp fra Visma-uttrekket. Når jeg skriver krøderen, så
kommer det kun opp Krøderen Elektro AS, Ringerike.» Diagnosen målt mot Kenneths eget uttrekk, ikke
gjettet: PostgREST returnerer maks 1000 rader uten en `Range`-header, og `_erpCustomersForOrg`
hadde ingen paginering. Alle ni radene han savnet lå etter rad 1000 i fila (radnr.
858/2552/2648/2659-2662/2911/2962) — **2130 av 3130 rader var usynlige for hele appen** siden
04.09, uten feilmelding. Verre: spørringen manglet `.order()`, så det ikke engang var stabilt
hvilke 1000 som kom med — samme søk kunne gi treff i dag og null i morgen.

- **`4834f5f`.** Ny delt `_selectAll(build)` paginerer med `.range()` til dataene tar slutt, brukt
  på alle seks spørringer i kodebasen som kan vokse forbi tusen — ikke bare den ene som var
  ødelagt nå: `erp_customers` (kritisk), `customers`, `contacts` (helt ufiltrert), prosjektlista
  (`_fetchProjectList`, kandidat-fallbacken beholdt, men et vellykket forsøk henter nå alle
  sidene), prosjekttelling per kunde (Kunder-fanen) og prosjekttelling per org (adminpanelets
  support-fane). Hver paginerer på en stabil unik kolonne (`erp_no`/`id`, sekundærnøkkel der den
  forretningsmessige sorteringen ikke selv er unik).
- `_erpCustomersForOrg` kaster nå videre på feil i stedet for å gjøre en nettverksfeil om til
  «tomt register». Alle ni kallestedene gjennomgått og viser nå en tydelig feilmelding i stedet
  for en stille tom trefflise — kundekortets søkefelt, opprett-prosjekt-flyten,
  «Ny kunde»-dialogen, Kunder-fanen, synk-reviewen, B3-forslagene.
- Egen bug funnet i samme runde: «flere treff»-tekstene i to søkefelt telte det avkortede
  antallet (etter `.slice()`), ikke det faktiske. Rettet til å telle før avkorting.

**Testmetodikk:** live mot et syntetisk 3130-rads register bygget etter Kenneths egen
radnummer-tabell, med en `_db`-mock som faktisk implementerer `.range()`-paginering — verifiserte
4 kall (1000+1000+1000+130) for å hente alle 3130. Alle tre søkefeltene fant deretter alle sju
Krøderen-avdelingene, Arro og Ask. En synk av 3130 identiske rader mot det nå fullstendige
registeret ga **Nye 0 · Endret 0 · Uendret 3130 · Borte 0**. Nettverksfeil simulert og bekreftet
vist som feilmelding, ikke tom seksjon. Full regresjonsbatteri grønt.

**Fil:** romtegner.html.

---

## Visma-registeret: opprett kunde direkte fra søket, tre steder — 2026-09-05

Kenneth: «Bør jeg ikke kunne søke på en kunde i Varmeplan som blir hentet fra registeret og legge
kunden hurtig inn i Varmeplan?» Registeret (`erp_customers`, 3130 rader hos Cenika) hadde alt
navn/org.nr/postnr/poststed/kundenr, men ble kun brukt til å fylle ett felt på en kunde som
allerede fantes — den raskeste veien inn i appen (`_inlineCreateCustomer`, kun navn) produserte
dermed den kunden som var minst klar for GBAO10-eksport.

- **`fdd01b2` — opprett-prosjekt-flyten.** `_searchCustomers` fikk en andre seksjon «I
  Visma-registeret — opprettes ved klikk» under Varmeplan-seksjonen (som alltid vises først), kun
  for org-er med `gbao10`. Skjuler registerrader hvis nummeret allerede er i bruk. Ny
  `_createCustomerFromErp(erpNo)` oppretter kunden med Vismas egen skrivemåte, kundenr, org.nr,
  postnr, sted — velger den med en gang. Samme registersøk lagt i «Ny kunde»-dialogens navnefelt
  (`_ncpErpSearch`/`_ncpErpPick`), som i stedet FYLLER skjemaet uten å lagre, gjennom en ny delt
  `_fillNewCustomerForm(fields)` en kommende Brreg-autofyll-sak kan gjenbruke. Egen bug funnet:
  Varmeplan-seksjonens eget navnesøk brukte fortsatt ren `.includes()` — samme «bravida ålesund»
  mot «Bravida AS Ålesund»-bug som ble fikset i registersøket i `5574198`, bare aldri oppdaget der
  før en nyopprettet kundes navn ble søkt på rett etter opprettelse. `erp_customers` fikk
  `postal_code`+`city` (additiv migrasjon).
- **`0c5f439` — Kunder-fanen.** Kenneth, dagen etter: «Når jeg går inn på kunder og gjør et søk på
  fritekst, feks Krøderen Elektro AS, så kommer det ikke opp noen forslag. Jeg vet at denne kunden
  ligger i listen vi har importert.» `_renderCustomerTable`/`cust-search` filtrerte kun
  Varmeplans egne kunder — riktig kode, feil brukerforventning. Ny seksjon under tabellen
  (`_renderCustomerErpSection`), med én «+ Legg til»-knapp PER RAD (bevisst annerledes enn
  opprett-prosjekt-flyten, der ett klikk velger ett nummer) — en kjede som Krøderen Elektro (sju
  avdelinger) kan trenge flere opprettet samtidig, ikke ett valg av flere. Innsettingslogikken
  skilt ut i delt `_insertCustomerFromErpRow`, gjenbrukt av begge stedene.

**Testmetodikk:** live i nettleser mot mocket register/kundeliste/`_db` (Bravida Ålesund- og
Krøderen Elektro-radene fra spec, inkl. ekte org.nr), alle nummererte tester i begge spec fra
Kenneth kjørt og bekreftet, inkl. 8- og 12-takene med «flere treff», org uten `gbao10` → ingen
seksjon, tomt register → ingen seksjon/feil. Full regresjonsbatteri grønt.

**Fil:** romtegner.html, ny migrasjon `erp_customers.postal_code`/`city`.

---

## Visma kundeliste-synk mot Cenikas ekte 3130-rads uttrekk — 2026-09-05

DEL B1/B2/B3 (under) var bygget mot en beskrevet fil. Kenneth ga den ekte fila
(aldri lagt inn i git-repoet, brukt direkte fra sin Cowork-mappe).

- **`3010338` — Rettelsen, blokkerende bug.** Fila er tabulatorseparert, null semikolon i hele
  fila. Den gamle gjettingen («finnes et semikolon noen steder?») falt derfor alltid tilbake til
  komma — og et komma inni et kundenavn (236 forekomster) kunne i tillegg forskjøvet kolonnene.
  Import var reelt umulig. Ny `_custNoDetectDelimiter()` gjetter på hyppighet i overskriftslinja
  alene. Egen oppdagelse fikset samtidig: 3115 av 3130 navn bruker U+00A0 (hardt mellomrom), aldri
  vanlig mellomrom — `_custNoNormalize` overlevde dette før kun ved et lykketreff, gjort eksplisitt.
- **`57697fc` — org.nr-matching og utgått/sperret.** Ny `erp_customers.org_number` — B3 prøver det
  FØR navn: ett org.nr-treff er sikkert uansett navn, flere (alle avdelinger av samme firma deler
  ett org.nr — 126 Bravida-rader på ett nummer) havner riktig i Flere treff. `&Utgått/
  sperret`-kolonnen setter en rad inaktiv med en gang ved synk, adskilt fra «borte».

**Testmetodikk:** live mot den ekte fila (ikke syntetisk) — hele parse-pipelinen kjørt gjennom
`_custNoParseFile` med et ekte `File`-objekt, alle 3130 rader, spec sine egne søkeeksempler
bekreftet mot det ekte registeret.

**Fil:** romtegner.html, ny migrasjon `erp_customers.org_number`.

---

## Visma GBAO10 DEL B revidert: synkronisert kunderegister (B1–B3) — 2026-09-04

Den opprinnelige, enkle DEL B (`3462d0b`: `customers.erp_customer_no`-felt + direkte
navnematching-import) ble pushet, men Kenneth sendte samme dag en utvidet spec etter at det
virkelige tallet kom fram: Cenikas kundeliste i Visma er 3130 numre, og én kjede kan ha 5–40
kundenumre — ett per avdeling. Varmeplan skal aldri få 3130 kunderader; DEL B ble bygget om til en
synkronisert to-lags modell.

- **`5574198` — DEL B1.** Ny `erp_customers`-tabell (org-scopet oppslagsregister, RLS speilet fra
  `customers`). «Kundenr. i Visma» på kundekortet er nå et søkefelt mot registeret (nummer og
  navn, delstrenger i vilkårlig rekkefølge) i stedet for et blankt tekstfelt. Egen bug funnet: en
  ren `.includes()`-sammenligning bommet på spec sitt eget eksempel («bravida ålesund» er ikke en
  sammenhengende delstreng av «bravida norge avd ålesund») — rettet til tokenbasert matching.
- **`d9ca6eb` — DEL B2.** Ekte synk/diff, ikke en engangsimport. Fire kategorier vist FØR noe
  skrives (nye/endret navn/uendret/borte). «Borte» settes aldri slettet, kun `active=false`.
  Sikring mot et ufullstendig uttrekk: >20 % fall i radantall blokkerer til brukeren bekrefter.
- **`255efed` — DEL B3.** Forslag til Varmeplan-kunder uten nummer, automatisk etter synk. Fire
  bøtter — «flere treff» får aldri et forvalg. Egen bug funnet: et første forsøk skilte «eksakt
  treff» fra «delvis treff» i to steg, så en kjede uten noe eksakt normalisert treff landet i
  Usikkert i stedet for Flere treff — spec sitt faktiske skille er antall kandidater, ikke
  treffpresisjon.

**Testmetodikk:** alt testet med mocket `_db` (aldri skrevet til produksjonsdata). Committet i tre
deler via git-stash-og-reprise-teknikken (full løsning bygget og testet samlet, deretter delt opp
for ren historikk).

**Fil:** romtegner.html, ny tabell `erp_customers`.

---

## Visma GBAO10-eksport: DEL A–F, kundenummerfelt, mappe-skriving — 2026-09-04

Ny fileksport til Visma Global (33-felters GBAO10-format), adskilt fra «Kopier til Visma»-pasten
(uttrykkelig uendret — REGEL 1, verifisert byte-for-byte). DEL G (generator-kjerne, portvakt) var
allerede bygget og godkjent i en tidligere økt (`afc528e`).

- **`cf905fd` — DEL A.** `erp_format` var en likhetssjekk mot ÉN verdi to steder — kolonnen
  beholdt som `text`, verdien er nå en kommaseparert liste lest av ny `_orgHasErpFormat(name)`.
- **`3462d0b` — DEL B (opprinnelig).** `customers.erp_customer_no`-felt + direkte
  navnematching-import (revidert til et helt annet design samme dag, se over).
- **`a0efc90` — DEL C.** Ny eksportdialog, helt adskilt fra paste-dialogen. Kundenr/Kontaktperson
  er lesefelt med lenker til der de faktisk redigeres. Mangler kundenummer eller artikkelnummer →
  Eksporter deaktivert.
- **`3b8dee0` — DEL D.** Ny, ren `_gbao10BuildFileText()` uten referanse til `S` — skal kunne
  løftes rett ut i en fremtidig Tilbudsbygger-app uten omskriving.
- **`846cd3e` — DEL F.** Tilbehør via samme kontrakt som PDF/XLSX/paste. REGEL 2: EL-nummer i
  felt 17 kommer inn som Vismas plassholderartikkel `100099` (rød rad) — standard er å blokkere,
  men et produkt med et el-nummer får et eksplisitt per-linje-valg i dialogen, aldri automatisk.
- **`69cc3c4` — DEL E.** To lagrede mappehåndtak (Tilbud/Ordre), IndexedDB-persistert. Bare
  Chrome/Edge har `showDirectoryPicker` — Firefox/Safari faller tilbake til nedlasting. Ikke
  overskriv i stillhet — finnes filnavnet fra før, spør.
- **`ad44d30` — verktøylinje-rettelse.** DEL C la eksportknappen kun i dashboardets
  prosjektliste-rad — Kenneth brukte i praksis hovedverktøylinjen inne i prosjektet og fant den
  ikke der. Ny `.btn-gbao10`-knapp lagt til der «Kopier til Visma» faktisk står.

**Testmetodikk:** full regresjonsbatteri grønt etter hver commit. DEL E testet med et mocket
`FileSystemDirectoryHandle` (ekte `showDirectoryPicker` krever en brukerhandling, kan ikke
trigges headless) — Kenneth bør teste ekte mappevalg mot den faktiske R:-stasjonen selv.

**Fil:** romtegner.html, ny kolonne `customers.erp_customer_no`.

---

## Prosjektert av: redigerbar felt + egen kolonne i prosjektlista — 2026-09-04

Kenneth: «hvor endrer jeg prosjektert av? kan jeg få opp det i egen tabell i prosjektvisningen
også?» `S.project.responsible` ble skrevet ETT eneste sted i hele kodebasen —
`_createProjectInline` ved opprettelse. Etter det fantes ingen vei til feltet. Tre commits i
rekkefølgen Kenneth ba om (C → A → B).

- **`e857c6a` — DEL C.** Feltet het fortsatt «Ansvarlig» i «Nytt prosjekt»-skjemaet, mens
  PDF-forsiden har sagt «Prosjektert av» siden `64cffb0` — ren etikettendring, selve datafeltet
  urørt.
- **`f6652e8` — DEL A.** Fjerde felt i den eksisterende «Kunde & prosjektinfo»-modalen, etter
  Kunde/Kontaktperson/Adresse. Lagres med `responsible` sin egen konvensjon (tom streng, ikke
  `null`).
- **`fa214a6` — DEL B.** Egen kolonne mellom «Prosjekt» og «Type» i prosjektlista — reverserer
  Kenneths eget valg fra 28.08 om å fjerne den, bevisst og på ny forespørsel.

**Funn under bredde-kontroll (rapportert, ikke rettet):** `.pl-table-wrap` krymper ikke på smal
skjerm eller tablet og klippes av `overflow-x:hidden` — bekreftet EKSISTERENDE (samme klipping
uten den nye kolonnen), krever en egen CSS-arkitekturendring utenfor denne oppgavens omfang.

**Fil:** romtegner.html.

---

## «Bytt produkt» uten å tømme rommet først — 2026-09-03

Kenneth: «jeg ønsker … å endre produkt og komme tilbake til menyen … slik det er nå, må jeg velge
rom og tømme rommet for produkter for så å legge inn på nytt.» Funksjonen for «kom tilbake til
menyen» fantes allerede, men het `_showPostDeleteActions` og var derfor kun nåbar via en sletting —
navnet var selve grunnen til at ingen tenkte på å kalle den fra noe annet. Fem commits, rekkefølgen
Kenneth ba om (Rettelsen → B → A → C), pluss én oppfølging samme dag.

- **`0628740` — Rettelsen: snø-matte «✕ Avbryt» gjenoppretter nå rommet.** Eksisterende feil funnet
  FØR resten kunne bygges trygt: øktstart tømmer rommet før forhåndsvisningen legges ut, men Avbryt
  fjernet kun forhåndsvisningens EGNE matter — det som ble ryddet ved øktstart kom aldri tilbake,
  området sto tomt. Ny delt snapshot/gjenopprett-mekanisme, lagret PÅ ROMMET (ikke den globale
  angre-stakken) — verifisert live at en annen handling midt i økta overlever avbrytet uendret. Fant
  også en ikke-relatert kvirk (dobbel `pushUndo()` i `autoFillMatSerpentine`) — rapportert, ikke
  rettet.
- **`c18c9f3` — DEL B: nytt produkt ERSTATTER nå, legger ikke til.** Kabel ryddet FØR ingenting ved
  øktstart — velger man et nytt kabelprodukt i et rom som allerede har en kabel, fikk man to. Ny
  delt øktstart-mekanisme rydder nå kun PRODUKTET som byttes, ikke hele rommet (folie i samme rom
  blir stående) — en bevisst innsnevring også for snø-matte, som før tømte alt.
- **`6d24f66` — DEL A: tre nye inngangspunkter, ingen sletting nødvendig.** Omdøpt
  `_showPostDeleteActions` → `_openProductPanelForRoom` (samme kropp, samme fem kallere). Ny
  «⇄ Bytt produkt»-chip i ctxbaren og objekt-info-panelet for valgt stripe/kabel/matte/plate, samt i
  rommets kontekstmeny.
- **`5c98d23` — DEL C: fant og rettet — panelet viste «Ingen produkter funnet».** Under verifisering
  av at Kenneth faktisk fikk det han ba om, dukket en ekte, allerede eksisterende feil opp:
  familyName ble avledet fra KUN FØRSTE ORD i produktnavnet, mens produktfilteret matcher det
  faktiske `product_family`-feltet (nesten alltid flere ord). Panelet viste derfor «Ingen produkter»
  for praktisk talt hele katalogen — rammet også de fem ORIGINALE sletting→panel-veiene, ikke bare
  de nye knappene.
- **Oppfølging samme dag — kan nå bytte MODUL også.** Kenneth bekreftet eksplisitt spec-ens åpne
  punkt («kan bytte modul også»). Alle tre knappene åpner nå den samlede produktvelgeren i stedet
  for ett families eget panel — forhåndsvelger fortsatt riktig type, men har en «Produkttype»-chip
  for å bytte til en helt annen modul (f.eks. kabel→folie).

**Fil:** romtegner.html.

---

## Snøkabel: fasebalanserte forslag og ekte tall i forhåndsvisningen — 2026-09-03

Kenneth: «hvis man velger 2 store kabler … får L1 mye mer belastning enn L2 og L3» — ønsket forslag
på 3 eller 6 like kabler for snøanlegg, og at et 35 m² snøområde ikke lenger skulle gi kun ETT
kabelforslag. Tre commits, rekkefølgen A → C → B.

- **`4f8aa87` — DEL A: N-løkka i `selectMultiCables` kjører nå alltid.** Rotårsak til at et 35 m²
  snøområde ga kun ett forslag: et tidlig `return` hoppet over hele N=2..16-evalueringen når én
  kabel dekket ≥90 % av behovet. Et første forsøk lot N=1 konkurrere direkte i samme rangering som
  N=2..16 — en A/B-test mot 864 syntetiske innendørs-rom viste 37 % avviksrate, reversert til en
  konservativ variant som er bit-for-bit identisk med forrige versjon for innendørs (4400 rom, 0
  avvik), men gjør N-løkkas data alltid tilgjengelig.
- **`ff5ebc4` — DEL C: forhåndsvisning viser nå faktiske tall, snø forhåndsviser.** Snøens
  enkeltkabelforslag plasserte FØR direkte og lukket panelet — ingen «✓ Bruk»/«✕ Avbryt», ingen
  angring uten undo. Forhåndsvisnings-footeren viste kun «● Forhåndsvises», ingen tall — leser nå
  faktiske W/m²/CC/meter fra canvas (ikke forslagets prediksjon; verifisert reelt avvik 121 vs 154
  W/m² på samme forslag i test).
- **`537c4b3` — DEL B: nye «minimum antall»/«fasebalansert»-forslag i snømodulen.** 2 kabler kan
  ALDRI fordeles jevnt over 3 faser (L1-L2 + L3-L1 belaster L1 dobbelt), 3 og 6 kan. Fasebalansert
  (minste multiplum av 3 som når ønsket effekt) er ny ★ Anbefalt i snømodulen; gjelder IKKE
  innendørs (Kenneth bekreftet eksplisitt).

**Fil:** romtegner.html.

---

## Visma GBAO10-eksport: generator-kjerne og portvakt-test — 2026-09-03

Ny fileksport til Visma Global (33-felters GBAO10-format), adskilt fra den eksisterende «Kopier til
Visma»-pasten (UTTRYKKELIG uendret). Spec-en krever en portvakt-test FØR resten bygges: godtar
Vismas import CVA-serien (Cenika Varme-produkter), eller kun CV-serien (Cenika)?

- **`afc528e` — DEL G: generator-kjerne, IKKE koblet til UI.** `_gbaoClean`/`_gbao10Line`/
  `_gbao10FileText` bygget og verifisert (ingen BOM, CRLF på hver linje inkl. siste, 33 felter). To
  testfiler generert utenfor appen (kundenr 38693/Kenneth Skretteberg) og sendt til Kenneth for
  import i et ekte Visma-testtilbud — én med 4 CVA-artikler, én med 16 blandede artikler (CV/CVA/
  el-nummer, merket TEST2) etter ønske fra Cenikas admin. Kenneth bekreftet at testfilen fungerte i
  Visma. DEL A–F (org-bryter, kundenummer, dialog, gjenbruk av materiallista, mappe-skriving) er
  ikke påbegynt.

**Fil:** romtegner.html.

---

## Matte: kabelskjøt følger naboen, halv-CC-forbandt, jevne bredder — 2026-09-02

Kenneth: «kabel ligger feil der matten kappes og vendes. svingene må naturlig gå fra en bredde til
neste bredde.» Fire commits, siste bygget etter en oppfølgende bekreftelse samme dag.

- **`d6a4e86` — DEL A: auto-matte sin kabel følger nå naboen i skjøten.** Rotårsak: `drawMats`
  startet HVER bredde sin første streng på venstre kant uansett hvor forrige bredde sluttet —
  antall strenger per bredde varierer med klippingen mot rommet, så annenhver skjøt landet feil.
  Frihånd hadde allerede løst nøyaktig dette (`entryHi`/`exitHi`/`hi0`/`Nuse`) — løftet UENDRET til
  en delt `_matCableEntrySide()`, brukt av begge motorene nå. Beslutningen flyttet inn i
  `_matCablePlan` (samme kilde vakten `_matRunsWithinRoom` leser).
- **`142a40d` — DEL B: selve skjøten er nå en sving, ikke en strek eller et opphold.** Halvsirkel
  (`_matArcHalf`, samme delte hjelper U-svingene innad i en bredde bruker) mellom breddene, radius
  fra faktisk avstand (ikke `cc/2`, som er LÅST for U-svingene). Frihånd bevisst IKKE rørt — egen
  test krevde at den forblir uendret.
- **`c783da8` — DEL D: «Sentrer» jevner nå ut breddelengder, ikke bare posisjon.** Ny søster til
  LÅST Regel E (`_matNearEqualWidthNL`) som godtar en kort siste bredde, men minimerer
  differansen. Egen bug funnet og rettet underveis: første forsøk rundet lengden NED, som
  matematisk gjorde det umulig for siste bredde å noensinne bli kort — rettet til avrunding.
  `mp._lenBeforeCenter` lagrer original-lengdene så «Sentrer AV» kan gjenopprette dem.
- **`c8d416a` — DEL C: EcoMat legges nå i forbandt, Regel 19 revidert.** Forrige runde målte at
  verken U-sving- eller hjørne-tilkobling i frihånd produserer noen deterministisk halv-CC-
  forskyvning — rapportert, ikke bygget. Kenneth bekreftet deretter med ord («ja, jeg vil ha
  forbandt for ecomat også»). `mat_stagger_half_cc` satt til `true` på alle 57 EcoMat-produktrader
  i Supabase (samme felt `_matCablePlan` allerede leste for InSnow). Frihånd leste feltet ALDRI —
  utvidet til å gjøre det, med samme paritetsprinsipp (`laneIdx%2`) som auto sin `r%2`.
- Testmetodikk: full regresjonsbatteri (mat/matZone/matFree/cableSkew/foil) grønn etter hver
  commit. DEL A/B/C verifisert med ekte canvas-screenshot i tett zoom, ikke bare tallsjekk.

**Fil:** romtegner.html, `supabase-migration-ecomat-forbandt.sql`.

---

## PDF-eksport: nytt filnavn med prosjektnr — 2026-09-02

Kenneth: «endre filnavn på eksport pdf til følgende format:
Varmeplan_P:xxxxx_Prosjektnavn_01.01.2026_rev1».

- **`c0ecbb8` — `Varmeplan_P0142_Navn_dd.mm.åååå_revN.pdf`.** Kolon droppet (ulovlig i filnavn på
  Windows, tolkes som sti-skille i Finder på macOS) — `P0142` uten skilletegn. Fire siffer, delt
  med forsiden/prosjektlista via ny `_fmtProjectNo()`. Dato bygget som bestilt (dd.mm.åååå, ikke
  ISO) — trade-off nevnt: bryter kronologisk mappesortering. Ny delt `_exportFileName()` bytter
  ALLE understreker i prosjektnavnet til bindestrek (understrek er nå feltskillet i filnavnet).
  Uten prosjektnr utelates hele P-feltet — aldri en oppdiktet `P0000`. Excel-eksporten urørt.

**Fil:** romtegner.html.

---

## PDF-forside, prosjektnr og Romoversikt i riktig rekkefølge — 2026-09-02

Kenneth ba om fire ting på én gang: ny forside, et ekte prosjektnummer, Prosjektoversikt uhaket som
standard, og Romoversikten flyttet til riktig sted i utskriften. Bygget i rekkefølgen C → D → A → B,
committet hver for seg.

- **`f2d45ea` — DEL C: «Prosjektoversikt» uhaket som standard.** Én linje.
- **`e264250` — DEL D: Romoversikt/Trappeoversikt flyttet til rett før Materiallista.** Kenneth
  hadde rett i at rekkefølgen var feil — eksportdialogens eget grensesnitt viste allerede riktig
  gruppering, det var byggeren som var uenig med sitt eget grensesnitt.
- **`64cffb0` — DEL A: Adresse fjernet, Kontaktperson lagt til.** Adresse-raden skrev bokstavelig
  «[object Object]» (feltet var aldri en streng). Kontaktperson fantes allerede i state, bare
  aldri lest av forsiden. Ny delt `_pdfCoverMetaRows()` — forsiden og HTML-forhåndsvisningen
  bygger nå radene ett sted.
- **`f724886` — DEL B: ekte, unik prosjektnr-indeks PER FIRMA.** Kenneth valgte per-firma fremfor
  global sekvens etter et eksplisitt spørsmål. Database-trigger (atomisk `INSERT ... ON CONFLICT
  ... RETURNING`, kollisjonsfri også ved samtidige lagringer) + migrasjon kjørt: 271 eksisterende
  prosjekter backfylt, hvert firma sin egen 1..N-serie, eldste = nr. 1.

**Fil:** romtegner.html, `supabase-migration-prosjektnr.sql`.

---

## FERDIG-knapp etter utlegg, og en glemt forhåndsvisning — 2026-09-02

Kenneth: «jeg ønsker også en "FERDIG" knapp etter jeg har lagt ut varmekabler i rom og godkjent
forhåndsvisning. Nå må trykke ut i canvas, for å få opp romlisten.»

- **`b1f0290` — DEL A+C: én FERDIG i panelheaderen dekker alle produktveier.** Fantes fra før, men
  kun i den manuelle paletten. Ny knapp i `#room-workflow-panel` sin header dekker auto-forslag
  (kabel/matte/plate/snø) også, uten å limes inn i fem ulike visningsfunksjoner. Skjules når den
  manuelle paletten (egen FERDIG) er synlig.
- **`eba8711` — DEL B: FERDIG rydder nå opp i en ventende forhåndsvisning.** Ekte feil funnet
  underveis: ingen vei ut av panelet (tomt-canvas-klikk, Escape) tømte en ventende kabel-/matte-
  forhåndsvisning — den kunne bli stille slettet neste gang noe forhåndsvistes i samme rom. FERDIG
  deaktiveres nå mens noe venter (ikke auto-godkjenner), Escape avbryter en ventende
  forhåndsvisning. Åpent funn rapportert, ikke fikset: en forhåndsvisning kan i prinsippet
  overleve et lagre/last siden `_buildSaveData()` sprer hele romobjektet.

**Fil:** romtegner.html.

---

## Soner: kabel per sone og automatisk N-deling — 2026-09-02

Kenneth: «Det som er feil nå, er at jeg ikke får lagt en kabel innenfor hver sin sone, den legger
seg ut over sonene som at rommet fortsatt er en hel sone.»

- **`c2bf0cf` — DEL A: delelinjen låses til vannrett/loddrett.** `getWorldPos()` fikk en ny
  `zoneSplitMode`-gren som gjenbruker samme `angleSnap()` rom-polygontegning allerede bruker.
- **`dc99d4a` — DEL B: kabel legges nå per sone, ikke over hele rommet.** Rotårsak: `autoFillCable`
  tar en roomId og har aldri sett en sone — `showCablePlacePanel()` nullstilte til og med
  sone-flagget eksplisitt før kabelpanelet åpnet. Ny `_fillSoneCable()` (speiler `_fillSoneFoil`,
  delt `_soneTempRoom()`), delt CC på tvers av kabelsoner i samme rom, gate mot rom-nivå kabelvalg
  når rommet har soner.
- **`fc4da08` — DEL C: automatisk deling i N like store soner.** Ny knapp «Del i N soner» ved
  siden av «Del i soner» — bygger EKTE, navngitte `S.zones`-oppføringer (ikke kabelmotorens egen
  flyktige geometri), gjenbruker `_equalAreaBandBounds`.

**Fil:** romtegner.html.

---

## «Kopier til Visma»: tomme rader i stedet for fritekst, to kolonner — 2026-09-02

Kenneth testet fritekstlinjer («VARMEFOLIE» som en varelinje med tomt artikkelnummer) direkte mot
Visma Global: det virker ikke.

- **`676dcde` — utklippet er nå kun `2269`+`2281` (artikkelnr+antall).** Rabatt-avkryssingen
  fjernet helt fra dialogen. Tomme rader (bokstavelig `"\t"`, ikke en tom streng) erstatter
  fritekst-overskrifter — én mellom materialgrupper, to foran tilbehøret. Ny
  `dokumenter/visma-global-tilbudsimport-format.md` dokumenterer at fritekstlinjer er testet og
  IKKE virker, så neste person slipper å teste det på nytt.

**Fil:** romtegner.html, `dokumenter/visma-global-tilbudsimport-format.md`.

---

## «Kopier til Visma»: artikkellinjer, delt tilbehør og PDF-rekkefølge — 2026-09-01

Kenneth fant ut at man kan lime artikler rett inn i et ALLEREDE ÅPENT tilbud i Visma Global — mye
kortere vei enn den parkerte GBAO10-tilbudseksporten (ikke slettet), siden kundenummer/-kobling
(den vanskelige delen der) ikke trengs i det hele tatt. Fem commits samme dag: ny funksjon, ekte
bug funnet og fikset i produksjon samme dag, en migrasjon kjørt mot Supabase, og en oppfølgende
prompt som rettet rekkefølge og fjernet dobbeltarbeid med tilbehørsvalg.

- **`a405a75` — «Kopier til Visma»: tabulatorseparerte artikkellinjer på utklippstavla.**
  Cenikas eget paste-format (felt-ID 2269/2270/2281/2274). `_collectMaterialItems()`/
  `_aggregateMaterialItems(items)` løftet ut og delt med XLSX-eksporten (bekreftet Excel uendret).
  Rabatt gjenbruker `_resolveDiscountPct` (samme kilde som PDF-en), kolonne 2274 tas kun med når
  minst én linje faktisk har rabatt > 0. **Ekte bug funnet og fikset underveis:** Antall-feltet
  brukte en heuristikk laget for Bestilling-arkets tekststreng til mennesker (`!cable_length_m`),
  som feilklassifiserte MATTER som «solgt løpende» — ga antall=10 (meter) for én enkelt EcoMat-
  rull i stedet for 1 (stk), en stille tidoblet bestilling i Visma. Rettet med `kind==='Folie'`
  (satt autoritativt i `_collectMaterialItems`) som eneste «solgt løpende»-signal. Forhåndsvisning
  viser nøyaktig det som limes inn; manglende `article_no` navngir produktet og sperrer
  Kopier-knappen; `navigator.clipboard.writeText()` med ekte fallback (markert, fokusert
  `<textarea>`), verifisert begge veier.
- **`014ffe9` — ny `organizations.erp_format`-kolonne, kjørt mot Supabase.**
  [supabase-migration-erp-format.sql](../supabase-migration-erp-format.sql) — fri streng, ikke
  boolsk, slik at en annen grossist kan få sin egen verdi uten kodeendring. Kjørt via Supabase CLI
  (`supabase link` + `supabase db query --linked`, allerede autentisert). Cenika AS (eneste org i
  databasen på det tidspunktet) satt til `erp_format='visma_paste'`. `erp_format` lagt til
  `_loadUserOrg` sin select-liste (manglet — uten det ville feltet alltid vært `undefined`).
  Knappen er live for Cenikas brukere.
- **`84f86a5` — fiks: «Kopier til Visma» manglet manuelt tastet tilbehør.** Rotårsak: kommentaren
  over `_collectMaterialItems` (skrevet i SAMME commit som opprettet Visma-pasten) sa eksplisitt at
  tilbehør «hører til XLSX-eksportens EGEN flyt» — feil fra øyeblikket den ble skrevet, siden
  `showAccessoriesModal()` allerede var delt mellom PDF og XLSX. `_showVismaPasteDialog()` ble
  `async` og kaller `showAccessoriesModal()` FØR noe annet, samme kontrakt som PDF/XLSX (avbrutt
  modal avbryter hele kopieringen). Ny delt `_aggregateAccessoryItems(list)`, løftet ut av XLSX sin
  egen `_emit`-closure — samme duplikasjon (samme løkke to steder) var nøyaktig hvordan tilbehøret
  manglet fra starten. Produkter først, tilbehør etter — ingen gruppeoverskrifter (en fritekstrad
  limt inn i Visma ville blitt en varelinje uten artikkelnummer). Åpent spørsmål, ikke avgjort:
  skal tilbehør ha samme rabatt som resten av tilbudet (står som 0 i dag)?
- **`de5990b` — DEL A: én kanonisk materialgruppe-rekkefølge for PDF/XLSX/Visma.** Kenneth: «den
  legger seg ikke i samme rekkefølge som materiallisten i PDF-eksporten.» Ny delt
  `MATERIAL_GROUPS`-konstant + `_groupByMaterialGroups()`. PDF er fasiten (`_matGroups =
  MATERIAL_GROUPS`, null atferdsendring). **Ekte bug funnet og fikset i XLSX:** Materialliste-
  arkets flate `groupsOrder` manglet Aluboard-typene helt og hadde ingen fallback-gruppe —
  Aluboard-produkter forsvant stille fra arket, ikke bare feil rekkefølge. Visma-pasten fikk
  eksplisitt sortering (var ren Map-innsettingsrekkefølge før). Sortering internt i hver gruppe:
  stigende produkt-id, matcher hvordan `Object.entries()` på heltalls-nøklede objekter naturlig
  oppfører seg i PDF-en (Map gjør IKKE dette, derfor eksplisitt `.sort()`).
- **`4019649` — DEL C: gjenbruk tilbehør fra PDF/XLSX i stedet for ny modal i Visma-pasten.**
  Kenneth: «i praksis lager jeg først PDF for å sende underlag til kunde, og så må jeg kopiere til
  Visma — da blir valg av tilbehør en jobb som må gjøres dobbelt.» `showAccessoriesModal()` lagrer
  nå det bekreftede resultatet på `S.project.accessories` (samme spre-mønster som pricing/freeText
  via `_buildSaveData`) og forhåndsutfyller hver rad derfra — inkludert RKK-kabel og stålnett, som
  har egen UI utenfor den generiske `data-acc-id`-mekanismen. Visma-pasten bruker lagret valg
  direkte uten å spørre på nytt; ny «Endre tilbehør»-knapp åpner modalen forhåndsutfylt. PDF/XLSX
  lagrer «gratis» siden de allerede kaller samme modal uendret — rekkefølgen (PDF-først eller
  Visma-først) spiller ingen rolle. `_FOIL_ACC_LS_KEY`-preferansene (brukerdefault på tvers av
  prosjekter) er bevisst IKKE blandet med `S.project.accessories` (prosjektets eget valg). Lagrede
  antall leses rått, aldri regnet på nytt. **DEL B (seksjonsoverskrifter «VARMEFOLIE»/«TILBEHØR» +
  blank rad mellom seksjoner i Visma-pasten) er bevisst IKKE bygget** — uklart om Visma Global
  tolererer en pastet linje uten artikkelnummer (kan enten lage en fritekstlinje korrekt, eller
  avbryte/forkaste hele limingen midtveis). Kenneth tester selv med
  `dokumenter/visma-test-fritekstlinje.xlsx` før dette bygges.
- Testmetodikk gjennomgående: live i nettleser mot Kenneths egne Bok6.xlsx-eksempler og/eller ekte
  produktkatalog fra Supabase (ikke mock), full regresjonsbatteri
  (mat/matZone/matFree/cableSkew/foil) bestått uendret etter hver commit.

**Fil:** romtegner.html, `supabase-migration-erp-format.sql`, `docs/endringslogg.md`.

---

## Bakgrunn-gizmoen var usynlig når zoomet inn — oppfølging samme dag — 2026-08-26

Samme dag, ny prompt, etter forrige punkts «Flytt underlag»-fiks: Kenneth fikk fortsatt ikke opp
gizmoen for å flytte bakgrunnen. STEG 1 og DEL C fra forrige økt var fortsatt riktige (bekreftet,
ikke gjenbygget) — den forrige STEG 2-fiksen løste ikke hele problemet alene.

- **`92dca47` — STEG 2: målt, ikke antatt, hvorfor gizmoen er usynlig.** Engangs-diagnose alene.
  HYPOTESE 1 (gizmoen tegnes utenfor skjermen når man er zoomet inn på et rom, siden rammen
  omslutter HELE bakgrunnsbildet) BEKREFTET empirisk — alt annet var riktig satt opp, håndtakene
  var bare usynlige utenfor viewporten. HYPOTESE 2 (klikk-syklingen lar rommet stjele klikket)
  MOTBEVIST empirisk med et ekte dispatchet MouseEvent — bakgrunn-gizmo-sjekken kjører allerede FØR
  klikk-syklingen og vinner korrekt.
- **`4ce976d` — STEG 2b: alltid-synlig reserve-markering + Flytt-underlag zoomer + Shift gir finere
  piltast-steg.** Fast reserve-markering nederst midt på canvas, vises KUN når
  `_bgGizmoAnyCornerVisible()` er false (ikke et konstant ekstra element — rammen er fortsatt
  primær). `_bgStartMove()` («Flytt underlag») zoomer nå til hele tegningen via `_fitViewToBg`
  (gjenbrukt fra forrige punkts STEG 1). Pilene for å flytte en valgt bakgrunn fantes fra før — men
  Shift ga et STØRRE steg (25cm), motsatt av det Kenneth ba om («finere steg ved Shift»); byttet
  hvilken av de to eksisterende verdiene (5/25) hver tast-tilstand bruker.
- Testmetodikk-fallgruve verdt å merke seg: en headless browserfane uten innlogging får aldri et
  ekte layout — `canvas.width` blir stående på HTML5-default (300×150), som ga et falskt negativt
  resultat for «zoomer `_bgStartMove` til synlig?» først. Rettet ved å sette `canvas.width/height`
  direkte i testen (1400×800), ikke via `resizeCanvas()` (som selv avhenger av et fullt rendret
  `#app`-tre appen ikke bygger uten innlogging).
- Verifisert: samme funksjonsnivå-metodikk som forrige punkt. Full regresjonsbatteri bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Plantegninger legges nå alltid fra samme nullpunkt — 2026-08-26

Kenneth: byttet bakgrunnsbilde, kalibrerte på nytt, men «tegningen la seg ikke inn samme sted» som
forrige gang. Tre commits pluss en oppfølging (DEL C) som utvider til flere plantegninger per
etasje, godkjent eksplisitt av Kenneth via AskUserQuestion før bygging.

- **`5a6fc2e` — STEG 1: kartlagt alle `bg.originX/originY`-steder og bekreftet Y-fortegnet.**
  Rapport alene. Rotårsak funnet: `_installBgImage`/`_installBgImageForFloor` sentrerte en ny
  bakgrunn på `S.view.panX/panY` (der visningen tilfeldigvis stod panorert), ikke et fast punkt.
  Fasiten fantes allerede i `_autoReadRunEngine` (auto-rom-gjenkjenningsmotoren):
  `bg.originX=0, bg.originY=-heightCm`. Y-fortegnet BEKREFTET (ikke antatt) mot faktisk
  `w2s()`/`drawBgImage()`-kode: verden er Y-ned, ingen flip — nedre venstre hjørne havner korrekt
  i (0,0).
- **`0892585` — fiks: bakgrunnsbilder plasseres nå på et fast punkt, ikke der visningen stod
  panorert.** Begge installer-funksjonene bruker nå samme formel som `_autoReadRunEngine`.
  Kalibrering/fast målestokk/gizmo-draget bekreftet TRYGGE og urørt (proporsjonal omskalering rundt
  et brukervalgt referansepunkt). Ny `_fitViewToBg(bg)` (samme formel som `fitAll()`) flytter
  visningen til den nye bakgrunnen etter import — ellers tomt lerret siden bakgrunnen nå ligger
  fast, ikke der visningen stod. Verifisert med EKTE Image-objekter (ikke mock): to importer med
  vilt ulik panorering, samme zoom → identisk origin OG bredde/høyde; «Bytt bilde» bekreftet
  uendret (bevarer en manuelt flyttet posisjon).
- **`fdb04a7` — STEG 2: «Flytt underlag» gjør opplåsingen til én synlig handling, ikke en
  gjettelek.** Gizmoen for å flytte bakgrunnen fantes allerede, men hengelåsen (riktig standard:
  låst etter kalibrering) skjulte veien dit. Ny «Flytt underlag» i ⋯-menyen (`_bgStartMove()`:
  låser opp + velger + viser gizmo i én operasjon). Ctxbar viser nå eksplisitt «Ulåst — klikk
  treffer tegningen» når valgt+ulåst, lås-knappen sier «Lås igjen». Alle tre lås-tooltips (ctxbar
  persistent gruppe, ctxbar valgt-tilstand, sidepanel) skrevet om til å forklare hva OPPLÅSING er
  til for, ikke bare hva låsing gjør. Auto-relås ved annet utvalg: vurdert og rapportert (kommentar
  over `toggleBgLock`), IKKE bygget — en avveining, ikke et opplagt svar.
- **`ef6de00` — DEL C: flere plantegninger per etasje — aktiv (én) + referanser (null eller
  flere).** Eksplisitt godkjent av Kenneth via AskUserQuestion FØR bygging (reverserte i prinsippet
  19.08-regelen «én plantegning per etasje» — den regelen gjelder fortsatt for AKTIV). Ny
  `S.bgRefs[floorId]` (array, samme nøkkelkonvensjon som `S.bgs`) — referanser er strukturelt
  identiske aktiv-bakgrunn-objekter, bare aldri registrert der kalibrering/hit-testing/PDF ser
  etter dem (`_bgRefsOnActiveFloor` er en HELT EGEN funksjon fra `_bgsOnActiveFloor`, som
  `_hitBgLayer` leser fra). `_addBgToFloor` degraderer nå den gamle aktive til referanse i stedet
  for å tvinge frem en ny etasje — det ER Kenneths «gammel beholdes sammen med ny».
  `_promoteBgRef` («Gjør til aktiv») bytter ett-trykks, aldri to aktive. `removeBgImage` forfremmer
  automatisk nyeste referanse hvis den aktive slettes og en finnes (eksplisitt valg, dokumentert).
  `drawBgImage` tegner referanser UNDER aktiv, ALDRI i PDF (`S.ui._pdfMode`-gate). Sidepanelet
  viser referanser med samme avkrysning+opasitet-mønster som aktiv allerede hadde, pluss «Gjør til
  aktiv» og slette-knapp. Lagring: delt `_serializeBgFields` (faktorert ut av eksisterende
  bgs-serialisering, ikke duplisert). Filstørrelse: ~200–530 KB per referanse (JPEG 0.85 + base64),
  grovt 1–2,6 MB for 5 etasjer × én gammel versjon hver. Ingen automatisk opprydding —
  `_removeBgRef` for manuell sletting.
- Verifisert: syntetiske rom/etasjer + EKTE Image-objekter og EKTE data-URI-er. Full flyt
  verifisert for DEL C: import→legg-til-på-nytt→demotering→reimport→normal rendering (begge, ref
  under aktiv)→PDF-modus (kun aktiv)→hit-test (ekskluderer ref)→promote→slett-med-ref
  (forfremmer)→slett-uten-ref (uendret)→EKTE rundtripp gjennom
  `_buildSaveData`/`_restoreProject` (bevarer referanse med lastet bilde). Full regresjonsbatteri
  bestått etter hver av de fire commitene.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Tilleggsteksten i PDF-eksporten lagres nå på prosjektet — 2026-08-26

Kenneth: «Hvis jeg i ettertid må endre prosjekteringen og skrive ut på nytt, er teksten jeg skrev
inn borte.»

- **`01a7774` — tilleggsteksten (`#exp-freetext`) lagres nå, som rabattene allerede gjør.**
  Rotårsak bekreftet nøyaktig som antatt: `_runExportPDF()` leste `#exp-freetext` og kastet det;
  rabattene (nabofeltet, tre linjer under) ble lagret til `S.project.pricing` med akkurat den
  begrunnelsen Kenneth etterspurte — tilleggsteksten ble bare aldri tatt med i det. `_runExportPDF()`
  lagrer nå `S.project.freeText = opts.freeText` ved siden av `S.project.pricing`, samme
  autolagring. `_showExportDialog()` forhåndsutfyller `#exp-freetext` fra `S.project.freeText`
  (via `_esc`) — ikke låst, kan endres/tømmes fritt. Lagring/lasting krevde ingen egen kode:
  `S.project` spres allerede i sin helhet i `_buildSaveData`/`_restoreProject`, nøyaktig samme vei
  `S.project.pricing` selv går. Per PROSJEKT (spurt, ikke avgjort selv), ikke per revisjon — rapportert
  konsekvens: et prosjekt skrevet ut i rev. 1 og igjen i rev. 3 med endret innhold bruker SAMME
  tekst i begge.
- Verifisert: syntetisk prosjekt, `exportPDF` stubbet. Tomt før noen tekst; tekst overlever
  eksport+gjenåpning; endring overskriver; tømt felt lagres tomt og forblir tomt; EKTE rundtripp
  gjennom `_buildSaveData()`/`_restoreProject()`; gammelt prosjekt uten feltet åpnes uten feil.
  Full regresjonsbatteri bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Ctxbar fast toppsentrert + manuell utlegging er nå en økt — 2026-08-25

Kenneth (manuell varmefolie): «Det kommer opp en flytende menybar rett over varmefolien jeg legger
ut manuelt... veldig forstyrrende» + «Lista over produkter ved manuell blir borte når jeg gjør noe
annet... det hender jeg må måle litt i rommet.» Branch `ui-flyt-manuell`, merget til main
(`93cdd57`), Kenneth godkjente push+merge eksplisitt.

- **`ca25f0d` — STEG 0: kartlagt ctxbar-posisjonering og hva som skjuler den manuelle paletten.**
  Rapport alene, med én korreksjon til prompten selv: `#draw-toolbar` («BAKGRUNN…TEGN ROM…») er
  DØD MARKUP (display:none, ingen kodesti gjør den synlig, onclick refererer en ikke-eksisterende
  funksjon). Baren Kenneth faktisk ser ER `#ctxbar` selv i idle-tilstand — samme element som blir
  den forstyrrende linja når et objekt velges. Full gjennomgang av alle 15 steder
  `S.ui.selectedRoomId` nullstilles: måling og panorering rører den ALDRI; eneste reelle utløser er
  et mistreff-klikk som bommer på enhver romspolygon, uten sjekk for `S.ui.manualPlaceMode`.
  Matte/snø-paletten deler bokstavelig talt samme `#rwp-manual-palette` og samme
  show/hide-funksjoner som folie — like sårbar, ikke en lignende bug.
- **`c364cf4` — DEL A: ctxbar er nå fast toppsentrert — følger aldri lenger det valgte objektet.**
  `_positionCtxBar()` limte linja ~40px over valgt objekt (eller UNDER hvis trangt, verre).
  Fallback-grenen (toppsentrert) er nå eneste regel. Fjernet `_selectedObjectWorldBBox()` i sin
  helhet (~100 linjer, ingen andre kallere) og `_positionCtxBar()`-kallet fra `render()` (kjørt
  hver frame — unødvendig når posisjonen er fast). Ingen egen kollisjonsjustering nødvendig:
  default CSS (top:12px inni `#canvas-wrap`, under `#topbar` sin faste 56px) ga allerede et rent
  mellomrom.
- **`e8ccfdd` — DEL B: manuell utlegging er nå en økt — overlever måling, ikke bare
  selectedRoomId.** Ny delt øktvariabel `_manualPlaceSession = {roomId, familyName, categoryId}`,
  satt av BÅDE `startManualPlace` (folie) og `startMatManualPlace` (matte/snø).
  `_updateVfDirVisibility()`/`showRoomWorkflowPanel()` bruker nå øktas rom når en økt er aktiv, ikke
  `selectedRoomId`. Økta avsluttes KUN av FERDIG, Escape (ny gren) eller `cancelManualPlace()`
  selv. Følgefiks: `_matPlaceCandidate` og matte-drop-håndtereren brukte `selectedRoomId` direkte
  for validering/plassering — rettet til å bruke øktas rom.
- Forslag rapportert, IKKE bygget (venter på Kenneths ja): skille bakgrunnskontroller (alltid
  relevante) fra objektkontroller (kontekstuelle) i ctxbar.
- Verifisert: ctxbar forblir top:12px/left:50% uansett valgt objekt og drastisk panorering+zoom;
  manuell palett overlever `selectedRoomId=null`+`updateCtxBar()` med riktig romtittel bevart;
  `_matPlaceCandidate` validerer korrekt mot øktas rom selv med null selection; FERDIG og Escape
  avslutter økta korrekt begge veier, for BÅDE folie- og matte-paletten. Full regresjonsbatteri
  bestått etter hver commit og på den mergede koden.
- Ikke testet: ekte innlogget museklikk-flyt (drag-og-slipp fra paletten, faktisk måle-klikk i en
  ekte plantegning).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Krasj når selectedMatId/selectedPlateId pekte på et fjernet objekt — 2026-08-25

Funnet ved live-testing av modul-per-rom-branchen mot Kenneths ekte innloggede «Gullhaugveien 1 -
3»-prosjekt (ikke syntetisk): `S.ui.selectedMatId` pekte på en matte (id 1) som ikke lenger fantes
i `S.mats` (0 matter i prosjektet — det er InFloor+InSnow, ingen varmematte).

- **`8c9fd7e` — selvhelbredende vern + rotårsaksfiks i `_clearRoomProductCollections`.**
  `_ctxBarItems()` sin matte-gren antok objektet alltid finnes og krasjet ubetinget på
  `Math.round(mat.length_cm)`. Siden `renderSidebar()`/`updateCtxBar()` kalles fra mange steder
  (bl.a. `createRoom` internt), kunne HVILKEN SOM HELST handling som trigget en re-render krasje
  hele appen for Kenneth mens denne hengende referansen stod der. Rotårsak:
  `_clearRoomProductCollections(roomId)` (kalt fra «Tøm rom», «Fyll rom automatisk», enhver
  produktpanel-variant-endring) fjerner produkter fra strips/cables/mats/matPaths/plates/aluboard
  uten noensinne å rydde det tilhørende `S.ui.selectedXxxId`-feltet. Samme bug-form fantes også i
  `selectedPlateId`-grenen (samme mønster, ikke enda observert som krasj, men samme skjøre kode) —
  fikset samtidig. To lag: (1) `_ctxBarItems` sine mat-/plate-grener sjekker nå om objektet
  faktisk finnes; hvis ikke, ryddes UI-valget og grenen returnerer tomt i stedet for å krasje,
  samme mønster kabel/sone/trapp-grenene allerede bruker; (2) `_clearRoomProductCollections`
  rydder nå `S.ui.selectedXxxId` for ethvert produkt som fjernes OG faktisk var valgt (ny
  `ROOM_PRODUCT_SELECTED_UI_KEY`-mapping) — referansen blir aldri hengende i utgangspunktet.
- Verifisert direkte på Kenneths ekte side (bogus id → `updateCtxBar()` → ingen krasj, selvhelbredet
  til null) og isolert med syntetiske `S.mats` (fjerning av rommets matte rydder selektert-feltet
  KUN når det fjernede objektet faktisk var valgt, urelatert valg i annet rom urørt). Full
  regresjonsbatteri bestått på hans ekte innloggede side.
- Uhell underveis, rettet med eksplisitt godkjenning: en allerede planlagt autosave-timer lagret et
  midlertidig test-duplikat-rom («Hovedinngang (kopi)») til Kenneths ekte Supabase-prosjekt.
  Oppdaget ved en fullstendig sideoppfriskning, rettet (fjernet rommet igjen) og lagret korrekt
  tilbake — kun etter at Kenneth eksplisitt bekreftet via AskUserQuestion at skrivingen til
  Supabase skulle skje. Prosjektet endte med nøyaktig de samme fire rommene som før (Støp 3/Støp
  2/Fotskraperrist/Hovedinngang), bekreftet ved fullstendig sideoppfriskning fra Supabase.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Modulen (indoor/snø) er nå en rom-egenskap, ikke en fane-egenskap — 2026-08-25

Kenneth («Gullhaugveien 1 - 3»): måtte lage to «deler» (Del) og importere SAMME plantegning to
ganger fordi innendørs varmekabel ikke var valgbar mens han stod i Ute-fanen (innkjørsel utendørs +
hovedinngang innendørs, samme tegning). Eneste oppgaven denne økten som eksplisitt kjørte på egen
branch (`modul-per-rom`, ikke direkte på main) — Kenneth ba om dette selv siden endringen rører
regelsystemet («jeg må kunne git switch main og revertere mens serveren kjører»). Branchen ble
pushet separat; Kenneth testet selv, ga deretter eksplisitt «merge og push — jeg stoler på at
dette blir bra :)» — MERGET (`--no-ff`, `6cdc090`) og PUSHET til main. Ingen konflikter; full
regresjonsbatteri bestått på den mergede koden før push.

- **`7eb11fa` — STEG 0: kartlagt alle `_activeModuleType`/`_isSnowModule`-kall der rommet er
  kjent.** Kartla hvert kallsted av `_activeModuleType()`/`_isSnowModule()`/`_moduleEnv()`. 13
  bekreftede bugs (5 eksplisitt navngitt i prompten + 8 nye funn: showUnifiedProductPanel,
  _upcPlaceMat, showCablePlacePanel×2, _updateCableSelection×4, mattetegne-løkken,
  _renderDetailPanel, showHindringModal — disse 8 ikke fikset denne runden, kun rapportert).
  `_filteredProductCategories()` kjøres FØR de to STEG2-navngitte linjene i samme kjedede filter —
  en fiks av kun de navngitte linjene ville vært utilstrekkelig. `_effectiveMarginCm` har allerede
  fasit-mønsteret (roomId som valgfri parameter) men ingen av 40+ kallesteder sender den med —
  rapportert, ikke rørt (for stort omfang).
- **`869eef3` — STEG 1: frihånds-matte leser nå kun rommet, ikke fanen.**
  `_matFreeCableMarginCm`/`_matFreeStartFor`/`_matFreeStart` hadde
  `_roomModuleType(roomId)==='snow' || _isSnowModule()` (OR — fanen kunne overstyre). Rene
  rom-oppslag nå. Verifisert: indoor rom i en snow-del, aktiv fane=snow → margin=5 (ikke 0).
- **`3872124` — STEG 2: produktgaten spør nå rommet, ikke fanen — dette skjulte innendørs-kabel.**
  Ny delt helper `_uiModuleType()` (rett etter `_roomModuleType`, samme fasit-mønster som
  `_roomTargetWm2`): rommets modul når valgt, ellers fanen. Brukt i `_upcScopeProducts`,
  `_upcRenderTypeChips` OG `_filteredProductCategories` (sistnevnte var nødvendig). Gaten ikke
  svekket — verifisert med syntetisk to-kategori katalog: Ute-fane+indoor rom valgt → begge
  kategorier synlige; Inne-fane+snow rom valgt → kun utendørs; intet rom valgt → uendret i begge
  faner.
- **`60c70fa` — STEG 3: rommet kan nå bære sin egen modul, uavhengig av delen (GATED, STEG1+2
  grønne).** `_roomModuleType` sjekker nå `room.moduleType` FØR delens. LÅST (Kenneth):
  uforanderlig etter opprettelse, ingen «endre type»-funksjon, trapp IKKE per-rom.
  Lagring/lasting/angre trengte ingen egen kode — rommet spres allerede i sin helhet i
  `_buildSaveData`/`_restoreProject`/`pushUndo`. Verifisert: rom med `moduleType:'snow'` i en
  indoor del → `_moduleContext().ccMaxCm`=30 (snow) mot 12 (indoor); rundtrippet korrekt gjennom
  save OG pushUndo/undo.
- **`26e1677` — STEG 4: dupeRoom får to grener — dette ER hvordan man «endrer type» nå.**
  `dupeRoom(id, opts)` fikk to grener siden modulen nå er uforanderlig: A=med produkter (samme
  modul, ROOM_PRODUCT_KEYS + zones/hindringer), B=kun rom (brukeren velger modul eksplisitt). Ny
  meny `_showDupeRoomMenu` (gjenbruker `#produkt-menu`-dropdownen) på sidepanel-knappen;
  kontekstmenyen fikk de tre valgene inline. Verifisert: gren A kopierer riktig antall
  produkter/soner/hindringer med nye id-er og uavhengige objekter, én undo-ramme fjerner alt i ett
  steg; gren B med samme modul = regresjonsvakt bestått; gren B med motsatt modul gir faktisk den
  valgte typen.
- Bevisst IKKE gjort denne runden (rapportert i STEG 0): Inne/Ute som filter i stedet for modus
  (UI-endring, krever Kenneths beslutning); `S.project.type` fjernet fra Nytt prosjekt; én bakgrunn
  delt av flere etasjer (gjøres unødvendig av STEG 3).
- Testmetodikk: funksjonsnivå (innlogget canvas utilgjengelig), syntetiske to-delte prosjekter.
  Full regresjonsbatteri (mat/matZone/matFree/foil/cableSkew) bestått uendret etter hver av de fem
  commitene. node --check bestått etter hver.
- Ikke testet: ekte innlogget klikk-flyt (Kenneths eget scenario gjennom faktisk UI).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Utskrift setter nå hele filtertilstanden, ikke halve — utendørs kabel manglet — 2026-08-24

Kenneth («Gullhaugveien 1 - 3» rev. 1): «Varmekabelen på utendørs område vises ikke på utskrift.
Kabel på innendørs vises riktig.» Side 3 «Støp 3» (uteareal, InSnow 30T×3) viste
omriss+skravur+riktig spesifikasjon, men INGEN kabel. Side 6 «Hovedinngang» (innendørs) var
korrekt.

- **`ba33710` — STEG 0: målt Gullhaugveien — MEKANISME 1 bekreftet, MEKANISME 2 også ekte.**
  Rapport alene. Bygget et syntetisk to-delt prosjekt (indoor «Hovedinngang» + snow «Støp 3»,
  samme struktur som `_enterPart` sin egen 'snow'-gren). Instrumenterte `_renderRoomToImage` rett
  før `render()` kalles — fanget en ekte felle i selve målemetoden: funksjonen kaller `render()`
  TO ganger (midt i eksporten + for å gjenopprette skjermbildet); å lese SISTE kall i stedet for
  FØRSTE ga et falskt resultat først, rettet før tabellen ble skrevet. Rotårsak (etasjefilteret,
  «etasje vanntett»-regelen fra 19.08): `_rebuildActiveFloorRoomIds()` filtrerer på TO felt —
  `S.ui.activePartId` OG `S.ui.activeFloorId`. `_renderRoomToImage` (kalt fra `exportPDF` sin
  per-rom-løkke, og fra PDF-forhåndsvisningen) satte kun `activeFloorId` fra rommet som skulle
  tegnes — `activePartId` ble ALDRI rørt, stod igjen på forrige aktive del. Bekreftet: for Støp 3
  ble `activeFloorId` faktisk satt riktig, men `activePartId` stod igjen på indoor — MEKANISME 1
  bekreftet som den faktiske årsaken. MEKANISME 2 (rom uten `floorId`) testet separat, bekreftet
  EKTE og nåbar via «Fjern fra etasje»-menyvalget (`mvRoom(id,null)`) — ikke årsaken til Kenneths
  konkrete sak, men reell og måtte håndteres eksplisitt likevel.
- **`4fe75a5` — fiks + STEG 2-rapport: begge felt settes og gjenopprettes nå.**
  `_renderRoomToImage` setter og gjenoppretter nå BEGGE (`saved.activePartId` lagt til ved siden
  av det eksisterende `saved.activeFloorId`-mønsteret). Ny sentinel `'__none__'` på
  `_effectiveActiveFloorId()` (samme mønster som `'__global__'` allerede er for bakgrunn) — et
  etasjeløst rom uttrykker nå eksplisitt «ingen etasje, IKKE fall tilbake» i stedet for å
  tilfeldig arve forrige etasje eller `S.floors[0]`-fallbacken. Filteret selv er urørt og like
  strengt. STEG 2-rapport over 25 skrivesteder til disse to feltene: legitim innen-del-navigasjon
  (sidebar/kontekstmeny) etterlater bevisst `activePartId` urørt siden konteksten allerede er
  riktig; `undo()`/`_restoreProject`/`_resetProjectState` setter allerede begge korrekt.
  `_renderRoomToImageOffscreen` er død kode (ingen kallesteder) — urørt, ikke fjernet. Ny
  dev-mode-påstand (samme `_floorlessWarned`-mønster som `_onActiveFloor` allerede bruker): rett
  etter `render()` inne i `_renderRoomToImage`, varsler (aldri kaster) hvis rommet som nettopp ble
  tegnet ikke er i `_activeFloorRoomIds`.
- Verifisert: Kenneths eksakte scenario FØR/ETTER; etasjeløst rom verifisert inkludert via
  `'__none__'`; skew-kabel (39 pathEls, 0 runs) på rotert uteareal verifisert overlever eksport
  uendret; tre-roms scenario (2 innendørs-etasjer + 1 uteareal) verifisert at hver runde viser
  utelukkende sitt eget rom; påstanden bekreftet å faktisk fyre når kun etasje (ikke del) settes
  med vilje. Full regresjonsbatteri bestått på fersk sideinnlasting.
- Ikke testet: ekte innlogget PDF-eksport av et flerdels-prosjekt.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Kabel på roterte områder følger nå sidene, ikke skjermens akser — 2026-08-22

Kenneth (utendørs rampe, InSnow 30T 3700W 120,1m 400V × 3): kabelen la seg vannrett/loddrett i
forhold til SKJERMEN, ikke i forhold til den skrå rampen — trappetrinn og udekkede hjørner ved de
skrå endene.

- **`d44b968` — STEG 0-rapport: målt, ikke antatt.** Bygget en syntetisk rampe (likebeint trapes,
  20° rotert) + Kenneths eget produkt (CVA10710) og kjørte den ekte `_autoFillNCables(...,3,null)`.
  Bekreftet: `_buildNCableZones` setter `_noSkew=true` UBETINGET på hver sone-underrom (ingen
  if-vakt) — `needSkew` blir derfor ALLTID false for enhver flerkabel-sone, uansett rotasjon.
  Isolert bekreftet: SAMME rampe-polygon gjennom ETT enkelt-kabel-kall (ikke sonedelt) velger
  korrekt "skew" med angleDeg=20, dekning 97,8 % — motoren virker perfekt når den nås; `_noSkew` er
  den ENESTE årsaken. Én korreksjon til selve prompten: motoren som faktisk PRODUSERTE Kenneths
  utlegg var IKKE `generateCableSerpentine` (kun et siste fallback) — de faktiske vinnerne var
  **v6** og **boustrophedon**, som begge leser retning som skjerm-akse akkurat som serpentinen.
  Verifisert også: en ekte round-trip (skew-kabel, 39 pathEls) gjennom SAMME lagringsserialisering
  appen bruker + fullt JSON-round-trip — byte-for-byte identisk; PDF/materialliste gjenbruker
  allerede motor-uavhengig kode.
- **`b7d7505` — BLOKKERING 1+2 fikset + syntetisk testområde.** `_noSkew` settes nå kun når det
  HELE, udelte området er akseparallelt (uendret der). For et rotert område beregnes rectilinearity
  og en TVUNGET felles vinkel fra HELE polygonet (ikke hver enkelt avkuttede sone-delform) — samme
  vinkel presses inn i ALLE soner (`_forcedSkewAngleDeg`/`_forcedSkewDir`) så utlegget blir
  sammenhengende. Ny `_skPrincipalAngles`/`_skAngleForDir`: den lengste kanten definerer langsiden
  («Horisontal»), kortsiden er vinkelrett («Vertikal») — Kenneths regel, ikke skjermaksene.
  `generateCableSkew` fikk en `angleDeg`-parameter (var alltid hardkodet `null`). Sidefunn fra
  STEG 0 rettet i samme commit: info-panelets `dirLabel` falt til «Horisontal» for enhver
  skew-kabel siden `.direction` aldri ble satt — viser nå faktisk retning eller «Auto».
  Ny `_cableSkewRegressionTest()` (5 fasit-tilfeller A-E: rotert rektangel, eksplisitt kortside,
  rampe-trapes, akseparallelt som regresjonsvakt, tre kabler med identisk vinkel) — alle 13 sjekker
  bestått. Rotert innendørs InFloor-rom testet direkte (STEG 2): samme kodevei, samme fiks virker
  identisk — sagt eksplisitt, ikke oppdaget senere. Kjent, ikke rørt: rotert flerkabel-sone MED
  hindring ignorerer fortsatt hindringen (pre-eksisterende, dokumentert i egen kommentar —
  «Sub-rooms carry no hindrings»); enkelt-kabel hindring-unngåelse er upåvirket.
- Verifisert: Kenneths eksakte scenario — FØR v6/boustrophedon (skjerm-akse, trappetrinn), ETTER
  alle tre soner skew, identisk angleDeg=20°, dekning 86-89 %. Akseparallelt rom (600×300, single
  og multi): fortsatt boustrophedon, ikke skew. Full regresjonsbatteri (matte/sone/frihånd/folie +
  ny kabel-skew-test) bestått på fersk sideinnlasting.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## InSnow og EcoMat: reglene kommer nå fra databasen — 2026-08-22

Kenneth hadde allerede gjort databasesiden 22.08.2026: kategorien «Varmematte utendørs» + 33
InSnow 300T-artikler (CVA, EL, motstand, kaldkabel 15 m, CC 100, min_gap 50, veggmargin 0,
bøyeradius 42, inntrekk 0, forbandt), fem nye kolonner (`mat_edge_inset_mm`/
`mat_required_gap_mm`/`mat_equal_widths`/`mat_stagger_half_cc`/`mat_length_step_mm`), og EcoMat
60T/100T/150T (57 rader) fylt med de samme regelfeltene. Oppgaven var å fjerne kode-kopiene som
ikke lenger hadde en jobb.

- **`4406e26` — slett InSnow-injektoren og EcoMat-normaliseringen, rydd `el_number` ut.** Slettet
  `_ensureOutdoorMatProducts` (33 hardkodede CVA106xx-artikler + alle regelfeltene) og begge
  kallsteder, og `_normalizeEcoMat` (satte `mat_equal_widths`/`mat_required_gap_mm` på hver
  lasting). `el_number` fjernet overalt (9 forekomster) — riktig kolonnenavn er `el_no`. Ekte
  regresjonsrisiko fanget FØR den ble et problem: `_normalizeEcoMat` sin eneste andre bruker var
  `_ensureEcoMatProducts` sin OFFLINE fallback-gren, som satte `mat_equal_widths` direkte men IKKE
  `mat_required_gap_mm` — å slette funksjonen blindt ville brutt offline EcoMat-utlegg (5cm gap
  som spiser en hel bredde, samme feilklasse som FEIL 1 fra 19.08.2026). Rettet ved å sette feltet
  direkte i fallback-pushen, samt i `_matRegressionTest`/`_matZoneRegressionTest` sine egne
  synthetic-kataloger. STEG 4-rapport over de gjenværende injektorene (ingen fjernet denne
  runden): `_ensureOutdoorCableProducts` er i eksakt samme situasjon som den fjernede
  matte-injektoren (alle InSnow-kabelartikler finnes allerede live) — kandidat for samme
  behandling senere. `_ensureFrostProtectionProducts`/`_ensurePlateTestProducts` er derimot ikke
  fallbacker lenger — de ER produktkilden i dag (ingen av kategoriene finnes i databasen).
  `_ensureVarmecomfortProducts` (19 rader finnes live) — Kenneth har bekreftet ikke viktig, kun
  nevnt. STEG 5: uten Supabase finnes InSnow (Varmematte utendørs) ikke lenger i det hele tatt —
  verken kategori eller artikler opprettes offline; EcoMat er upåvirket (fallback selvstendig
  rettet). En bevisst, rapportert endring, ikke en oppdaget en.
- Verifisert LIVE mot Kenneths egen Supabase (samme anon-nøkkel klienten selv bruker, read-only
  REST): CVA10617 (0,5×22m, 3300W, el_no 1001872) og CVA10624 (0,5×24m, 3600W 400V, el_no
  1003535) finnes med eksakt de feltverdiene injektoren tidligere hardkodet — 33 InSnow-rader og
  57 EcoMat-rader bekreftet totalt. `_matRegressionTest()`/`_matZoneRegressionTest()` bestått, rom
  1110/1105/1102 bit-identiske, på fersk sideinnlasting.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Vunnet er nå sluttstasjonen — leveranse-sporing (akse B) fjernet — 2026-08-21

Kenneth: å trykke «Vunnet» skal bety ferdig — ikke starte enda et sporingsløp. Fjerner
leveranse-aksen (akse B) fra arbeidsflyten helt, ikke bare hopper den forbi et mellomsteg.

- **`b8434a9` — Vunnet = ferdig, ingen leveranse-sporing.** Før aktiverte «Vunnet» automatisk
  akse B (`klar_for_montering`/`klar_for_levering` etter rolle) med egen pille + «Start
  montering»/«Marker levert»-knapp — brukeren måtte klikke videre, en reell dobbel operasjon.
  `_applySalesTransition` setter nå `delivery_status=null` ubetinget i samme patch for enhver
  statusendring (én databaseskrivning, ikke to); `_initialDeliveryStatus` fjernet (ingen kallere
  igjen). `_deliveryCellHtml` returnerer alltid tomt — pillen/knappen vises aldri mer.
  `_deliveryNextAction`/`_advanceDelivery` slettet. `DELIVERY_STATUSES` og dashboardets todo-kort
  (leser `p._deliveryStatus` direkte) er urørt — de teller fortsatt riktig for eldre prosjekter
  med data fra før denne endringen.
- Verifisert: stubbet `_setProjectStatus`, kjørte overgangene vunnet/tapt/under_arbeid — ett
  patch-kall per overgang (var to for vunnet), `delivery_status` alltid null. Fullt
  regresjonsbatteri (matte/sone/frihånd/folie) upåvirket.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte-farger regresjon og splitt-diagnose — 2026-08-21

To oppfølgere til DEL B (per-matte label/flytting): en fargebug forrige commit innførte, og en
grundig — men resultatløs — diagnose av et splittavvik Kenneth rapporterte på rom 1108.

- **`a1560f0` — matte-farger: fikset regresjon fra Modell A.** Rotårsak: fargegrenen i
  `_drawMatPathObj` var betinget på `cat.segments.length > 1` («har DENNE BANEN flere ruller») —
  etter forrige commits splitt til uavhengige objekter har hvert committet matPath alltid
  nøyaktig ett segment, så betingelsen ble permanent usann og alt tegnet i standard blå. Riktig
  spørsmål er «har DETTE ROMMET flere fysiske matter» (`_matPathSegColor`/
  `_matRoomPhysicalPieces` svarte allerede på det) — betingelsen fjernet. Ny regresjonstest i
  `_matFreeRegressionTest()` låser begge former (splittede objekter og eldre fler-segment-
  objekter). Verifisert mot Kenneths egen live Supabase-katalog (EcoMat 150T, hentet via
  anon-API): tre distinkte farger på en 6400cm-bane.
- **`77ce87f` — DEL B STEG 0: kan ikke reprodusere 8+26+30.** Kenneth rapporterte splitt
  30+26+8 der 22+22+20 var ventet. Bygget en skrivebeskyttet diagnosekopi av splitt-
  algoritmen og testet mot Kenneths egen live katalog (19 EcoMat 150T-rader, 2–30m, hentet
  direkte fra Supabase): 20m og 22m finnes begge i katalogen (avkrefter hypotese 1), og et
  bredt sveip av totalCm (6380–8000cm) velger korrekt [20,22,22]-kombinasjonen i alle
  tilfeller — [8,26,30] ble aldri reprodusert. Ingen kodeendring gjort; venter på Kenneths
  faktiske lagrede rom 1108-tall.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matpath klikkvalg og per-matte flytting (DEL B) — 2026-08-21

Kenneth (rom 1108): frihånds-matte kunne ikke velges ved klikk, og en bane med flere fysiske
ruller hadde bare én felles label/posisjon. Tre commits løser begge, med en grundig
STEG 0-rapport imellom.

- **`a7043d1` — frihånds-matte og aluboard kan nå velges ved klikk.** Rotårsak: matpath og
  aluboard manglet begge en egen «body click»-gren i mousedown-nedfallet (bg/strip/cable/...
  har hver sin), så klikk falt gjennom til rommet under. Fiks uttrykt som én regel: ny
  `CYCLE_INLINE_TYPES`-liste (typer med egen gren) — alt annet, inkl. fremtidige typer, løses
  automatisk via `_applyCycleSelection`, i stedet for å legge til nok et hardkodet
  spesialtilfelle.
- **`f0832a0` — STEG 0: Modell A valgt for per-matte label/flytting.** Kartla at én matPath i
  dag betyr én label/posisjon/drag for HELE banen, selv når 7428c56 lot den deles i flere
  fysiske ruller. Valgte Modell A (splitt til uavhengige matPath-objekter ved commit) foran
  Modell B (per-segment-nøkling): `_drawMatPathObj` kaller allerede label-renderen én gang per
  objekt, så splitting gir egen label/posisjon gratis uten å røre rendering-maskineriet.
- **`e840b73` — hver fysisk matte får egen label og flyttepil.** Ny `_matFreeSliceMoves`
  skjærer move-sekvensen ved katalogens ruter-grenser til uavhengige matPath-objekter (én rull:
  bit-for-bit uendret ett objekt). `_matDragging` generalisert med `_matDragKind`
  ('mat'|'matpath') — matPath følger musa fritt under drag og validerer først ved slipp
  (`_matPathMoveValid` = romvakt + ny `_matPathOverlapsOthers` kryss-objekt-sjekk, som ikke
  fantes fra før). Fant og fikset en ekte pushUndo-bug underveis: `matPaths`-snapshotet klonet
  `moves` dypt, men spredte `start` med DELT objektreferanse — angre etter en flyttet matte var
  en stille no-op.
- Verifisert: 55,52m-bane splittet til to uavhengige objekter (26m+28m), egen label/flytting
  per objekt, ulovlig overlapp avvist ved slipp, angre gjenoppretter korrekt (etter
  pushUndo-fiksen). Fullt regresjonsbatteri bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte «Manuell» blir en ekte drag-inn-liste — 2026-08-21

Kenneth avviste forrige økts inline «+»-knapp-løsning direkte: ville ha «Manuell» som en ekte
draggbar liste, nøyaktig som varmefolie — ikke en bane-liste (hans ord: «forvirrende»).

- **`251842a` — startMatManualPlace/renderMatManualPalette, bane-lista fjernet.** Ny
  funksjonspar speiler varmefolies egen `startManualPlace`/`renderManualPalette`-mønster, egen
  versjon fordi matte-feltene (`mat_width_mm`) og drop-målet (`S.mats`) er andre. Gjenbruker
  den delte manuell-palett-widgeten og `S.ui.dragWidth` (nå `kind:'mat'`) i SAMME dragover/
  drop-lyttere som folie — folies egen gren urørt. Slippet gjenbruker `_matPlaceCandidate`
  (samme magnet mot vegg/nabomatte som forrige runde) med ny `drawDropPreviewMat`-ghost i
  folies grønn/gul/rød-fargekonvensjon. Den gamle bane-liste-motoren (`_matManual*`,
  `_matRasterCm`, `_matBaneCableM`, `_matStdSizes` m.fl.) fjernet helt — ingen gjenværende
  kallsteder.
- Verifisert: draggbar HTML for begge InSnow-breddene, full dragover→drop-flyt (tre matter,
  riktig magnet-snappet), ingen gjenværende referanse til «bane-liste»-tekst eller de fjernede
  funksjonene. Fullt regresjonsbatteri bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## UPC dra inn matter og ekte Sentrer — 2026-08-21

Kartla og løste tre blokkeringer i «Fyll rom automatisk»-panelet (UPC): artikkelrader tømte
hele rommet på hvert klikk (umulig å legge flere matter manuelt), en plasseringsmodus fantes
men var uknåelig derfra, og Sentrer slettet+kjørte auto på nytt i stedet for å flytte det som
lå der.

- **`63f4c1d` — STEG 0-rapport.** Kartla hvert inngangspunkt som legger en matte mot om det
  tømmer rommet og nås fra UPC i dag. Bekreftet begge blokkeringer, pluss et ekstra funn
  (utenfor scope): «Manuell (bane-liste)»-raden kalte alltid snø-varianten, aldri innendørs.
- **`e92b528` — «+»-knapp per artikkelrad + gruppe-flytting/avstand.** Hver artikkelrad fikk en
  egen «+»-knapp (samme to-knapps-mønster som plater) som kaller ny `_upcStartMatPlace` —
  rører aldri rommet. Ny delt `_matPlaceCandidate(wp, productId)` (magnet mot vegg/nabomatte,
  aldri under Regel 18) brukes av både ghost og commit. Fant og fikset i samme slag:
  `_startMatPlacement` leste lengde fra et felt som i praksis er tomt for utendørs produkter —
  byttet til samme kanoniske kilde `_matFreeCatalog` bruker. Sentrer/Fra vegg flytter nå
  GRUPPEN av manuelt plasserte matter (`_matCenterGroupInRoom`) i stedet for å slette og kjøre
  auto på nytt, gitt at minst én matte i rommet er manuelt plassert (`_manualPlace`-flagg,
  bevisst atskilt fra den gamle bane-listas `_manualGroup`). Ny `_matSetGroupGap` for felles
  avstand mellom manuelt plasserte matter.
- Verifisert: fire manuelt plasserte InSnow-matter, korrekt magnet-snap, Sentrer/Fra vegg
  flytter alle fire matematisk korrekt, gruppe-avstand klemt til Regel 18-minimum. Fullt
  regresjonsbatteri bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Frihånd matte farge, valg, verktøylinje — 2026-08-21

Tre svakheter rundt en allerede verifisert-riktig frihånds-motor: flere ruller per bane
manglet egen farge/valg, og hadde ingen flytende verktøylinje (ctx-bar).

- **`1120ebf` — delt fargeindeks, segIdx-bevisst valg, ny ctxbar-gren.** Ny
  `_matRoomPhysicalPieces(roomId)` — én ordnet liste over ALLE fysiske matter i rommet
  (S.mats + S.matPaths, én oppføring per segment) — brukt av både `_matColor` og ny
  `_matPathSegColor`, så fargeindeksen går på tvers av begge samlinger (samme felle som
  «rommets produkter» tidligere). Ny `S.ui.selectedMatPathSegIdx` ved siden av
  `selectedMatPathId` — klikk identifiserer nå riktig fysisk segment, ikke bare banen.
  `updateCtxBar` fikk en helt ny gren for valgt matPath (produktnavn/lengde/watt,
  avstand-chip, Sentrer, Slett) modellert på auto-mattas egen — fantes ikke fra før.
  «Målsett»-chip bevisst utelatt (rapportert, ikke bygget — dimensjonslinjene leser kun
  S.mats).
- Verifisert: 55,52m tegnet gir fortsatt nøyaktig 26m+28m (uendret); to segmenter får to
  distinkte farger, en tredje matte i rommet et tredje distinkt tall; klikk identifiserer
  riktig segment ved skjøten. Fullt regresjonsbatteri bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte sone flere matter + frihånd utenfor rom — 2026-08-20

To uavhengige feilklasser, samme mønster: to allerede-låste motorer (sone-deling og
fler-matte-søk; frihånds-klipping og polygon-vakt) hadde aldri møttes.

- **`e5187e8` — DEL A: sone tar nå flere matter; DEL B: frihånd starter ikke lenger utenfor
  rommet.** DEL A (rom 1102): `_matFillRoomSmart` kjørte fler-matte-vurdering kun for
  rektangulære rom — sonedelte rom (Regel 20) fikk maks én matte per sone selv når sonen var
  stor nok til flere. Ny `_matZonePlanFor` kjører samme `_matMultiSolve`-vurdering per sone.
  Fant og fikset underveis: `_matPlaceMultiMats` returnerte `true` i stedet for de committede
  objektene på en vellykket commit — ville trigget en falsk «ingen matter»-feil og en angre
  som kastet vekk et vellykket utlegg. DEL B (rom 1108): `_matFreeStartFor` brukte
  boundingboks-hjørnet som startpunkt, som for et uregelmessig rom kan ligge utenfor selve
  polygonet — søker nå innover til en gyldig skannelinje treffes. `_matFreeClampLen` returnerte
  urklippet lengde når startpunktet ikke fantes i noe polygon-intervall (nå: 0). En avvist
  commit nullstilte hele frihånds-tegningen før («trykker jeg stopp, skjer det ikke stort») —
  tegningen beholdes nå, og Backspace fjerner siste bane.
- Verifisert: to nye regresjonstester (`_matZoneRegressionTest`, `_matFreeRegressionTest`)
  låser rom 1102 (30,96 m² dekket, var ~15-20 m² før) og rom 1108 (alle fire feil). Fullt
  regresjonsbatteri bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Foliemotor score rangerer seg selv sist — 2026-08-20

Kenneths «Rom 4»: foliemotorens egen poengscore rangerte konsekvent bak et dårligere utlegg.
To commits — grundig reprodusert diagnose, deretter fiks.

- **`a3ffaa6` — STEG 0-rapport.** Reproduserte alle fire feil mot en «Rom 4»-analog +
  syntetisk katalog. Feil 1: et ukalibrert 3-poengsbånd i `_statsAtLeastAsGood` lot
  dekningsprosent overstyre scoren FØR den ble konsultert — sone vant med 6 poeng bedre
  dekning men 3× dårligere score. Feil 2: `_longStripsLayout` kunne uttrykke kun én uniform
  bredde i hele rommet. Feil 3: sonepakkeren lar aldri en bane krysse en sonegrense. Feil 4:
  `widthTypes` telt på produkt-id ett sted, nettobredde et annet — samme tallgrunnlag
  divergerte tre steder.
- **`8595889` — fjernet 3-poengsbåndet, ny adaptiv flerbredde-kandidat, watt-nyttegrense.**
  Feil 1 fikset ved å fjerne det ukalibrerte båndet. Feil 2 (Regel 21 folie): ny kandidat
  gjenbruker `_autoFillRoomOnce` sin allerede eksisterende adaptive flerbredde-modus, vurdert
  med samme score. Feil 4: `widthTypes` telles nå konsekvent på nettobredde. Ny
  `FOIL_MIN_USEFUL_WATT=15` fanger smale/korte sliver-striper. Ny `_foilRegressionTest()`
  låser Rom 4 som fasit.
- Verifisert: Rom 4 velger nå h-global (score 94290, høyest) i stedet for h-sone (score 40240,
  lavest av fire). Rektangulært rom uendret. `_foilRegressionTest()` og `_matRegressionTest()`
  begge bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte frihånd flere matter + romlista — 2026-08-19

Kenneth: en 52m tegnet frihånds-bane skulle bli to matter (26+26m), ikke én 1×30m — og en
frihånds-matte manglet helt i sidepanel/Excel.

- **`976215d` — STEG 0-rapport.** Svarte fire spørsmål før koding: EcoMat-fallback-katalogen
  har 19 lengder inkl. 26m; kaldkabel finnes ikke på matteprodukter (splitten regner uten
  fratrekk); U-svinger er allerede del av totalCm; delepunkt kan allerede falle midt i en bane
  (gjenbrukbart mønster).
- **`7428c56` — DEL A: én bane kan gi flere matter; DEL B: vises overalt.** Ny
  `_matFreeSplitPlan(totalCm, cands)` deler én tegnet lengde i færrest mulige katalogruller, så
  like som mulig ved uavgjort (26+26 foran 24+28 foran 22+30) — verifisert mot alle Kenneths
  egne tall. `_matFreeCatalog` returnerer nå `{segments[], coverCm, ...}` i stedet for ett
  flatt objekt; alle sju kallesteder oppdatert (materialliste, panel, toast, tegning). DEL B:
  sidepanelets «Varme»-seksjon manglet matPaths helt (rom med kun frihånds-matte fikk
  `totalElements=0`, seksjonen skjult); `_exportMaterialListXLSX` hoppet over matPaths helt.
  Ny `_assertProductSurfacesCoverAllCollections()` (kjørt automatisk i dev) fant i tillegg at
  HTML-materiallisten manglet Aluboard — fikset i samme slag.
- Verifisert: `_matFreeSplitPlan` gir 5200cm→[2600,2600], 3100cm→[3000+rest]. Ekte flyt: toast
  «2 × EcoMat 0,5x26m». Rom med kun frihånds-matte viser nå «Varme (2)». Assertion fant 0
  lekkasjer etter fiksen (7 før). `_matRegressionTest()` bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Fyll rom automatisk bruker nå hele motoren — 2026-08-19

Rom 2104 (26,3 m²) fikk kun 1×15m² med udekkede hjørner via «Fyll rom automatisk ★
Anbefalt» — appens faktiske hovedvei.

- **`c4f4429` — UPC-auto ruter nå gjennom sone-oppdeling og flermatte.** Rotårsak: UPC sin
  'auto'-gren kalte `autoFillMatSerpentine` direkte og hoppet over BÅDE `_matPlanZones`
  (Regel 20) og `_matMultiSolve` (Regel F/G) — begge fantes og var verifisert, men ble i
  praksis kun nådd via et sjelden brukt eldre panel. Ny `_matFillRoomSmart(productId, opts)`
  med `opts.skipPushUndo` — `_upcPlaceMat(...,'auto')` kaller nå denne i stedet: sone-sjekk
  først, så flermatte, så ett-blokk som fallback. Løst med ÉN angre-ramme: tømming +
  fyllforslag + utlegg deler ett undo-steg; «Avbryt» i forslagspanelene kaller `undo()` for å
  gi rommet tilbake.
- Verifisert: rom «2104»-analog (L-formet, 27,5 m²) viser nå sonepanel (2 soner, 27,5 m²
  dekket i stedet for 15 m² i ett blokk), ett angre-steg for hele operasjonen. Stort
  rektangulært rom viser flermatte-panel. Lite rom (plass til én matte) uendret direkte
  utlegg. `_matRegressionTest()` bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Rommets produkter, én kilde — 2026-08-19

Kenneth: «Tøm rom» så ikke frihånds-matter. Kartleggingen fant åtte flere steder med samme
hull.

- **`05390a0` — STEG 0-rapport.** Bekreftet at `_clearRoomProducts` og seks «erstatt rommets
  produkter»-kallsteder kun teller strips/cables/mats/plates — matPaths og aluboard mangler
  overalt, inkl. «Slett rom». Tre ekstra hull funnet: `_listDeleteRoom` («Hurtig
  prosjektering») kaller aldri `_cleanupRoomData` i det hele tatt; XLSX-materiallisten mangler
  matPaths helt; `pushUndo` tar ikke snapshot av `S.matPaths` (nylig tegnet frihånds-matte kan
  ikke angres).
- **`d480535` — ROOM_PRODUCT_KEYS, ni kallsteder samlet.** Ny
  `ROOM_PRODUCT_KEYS = ['strips','cables','mats','matPaths','plates','aluboard']` + to delte
  funksjoner brukt av alle ni kallsteder. `_listDeleteRoom` bruker nå samme `_cleanupRoomData`
  som hoved-«Slett rom» (var: egen, ufullstendig opprydding). Ved prosjektinnlasting fjernes
  nå foreldreløse matPaths/aluboard (roomId som ikke finnes) og logges. Ny
  `_assertRoomFullyDeleted(id)` i dev-modus fanger fremtidige lekkasjer. Bonus: `pushUndo`/
  undo fikk `S.matPaths` (kvalitetskrav for angre-testen). Ryddet en reell TDZ-krasj underveis:
  `ROOM_PRODUCT_KEYS` ble referert før sin egen const-linje hadde kjørt, knakk hele scriptet
  ved første «Slett rom».
- Verifisert: rom med kun frihånds-matte eller kun Aluboard — «Tøm rom» finner og fjerner
  begge nå. Angre etter Tøm rom gjenoppretter matPaths. `_assertRoomFullyDeleted` fant 0
  lekkasjer etter fiksen. `_matRegressionTest()` bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte utendørs tak + frihånd-avslutt — 2026-08-19

Et 4-matters-tak (satt for innendørs bruk) blokkerte store utendørs felt, og frihånds-tegning
kunne ikke avsluttes med Enter.

- **`58e6287` — MAX_MATS skalerer med arealet; Enter/Escape for frihånd.** «Obs Bygg» (195,3
  m², InSnow 300T, trenger 9-10 matter) falt tilbake til én matte fordi søket ikke fant en
  løsning innenfor det faste taket på 4. Taket er nå
  `min(40, max(2, ceil(kapasitetsareal/største matte)))`. Fant og fikset (bekreftet med
  Kenneth før koding — endret en tidligere låst regel): `_matMultiSolve` stoppet ved FØRSTE N
  med noen gyldig løsning, selv om den dekket en brøkdel av arealet — søket klatrer nå N
  oppover til target nås. Frihånd: Enter avslutter+committer, Escape avbryter uten å legge noe
  ut (samme mønster som polygon/wbw-tegning, manglet helt for matte). Stopp-punktets treffsone
  er nå delt kilde med ikonets tegnede radius og vokser ved utzooming.
- Verifisert: Obs Bygg gir nå N=9, 162 m² av 174,8 m² kapasitet (var 36 m² for N=2). Regresjon
  rom 1110/1102 uendret. Frihånd: Enter committer, Escape avbryter, begge nullstiller korrekt.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte dekning slår like bredder i variantvalget — 2026-08-19

Bekreftet med Kenneth via spørsmål før koding, siden endringen svekker en låst regel
(Regel 6).

- **`f2dc648` — Regel 6 (like bredder) rykker ned til tie-break.** Rom «2102 Dusj» (12,78 m²)
  valgte 0,5×20m (10 m², 118 W/m² BTA) fremfor 0,5×22m (11 m², ~129 W/m² BTA) selv om 22m fikk
  plass — fordi 22m ikke gikk opp i hele 16cm-kuttenheter mens 20m gjorde, og variantvelgeren
  prøvde nedover for å redde like bredder på bekostning av dekning. Ny prioritet: velg alltid
  størst variant ≤ kapasitet, punktum — like bredder brukes nå kun som tie-break mellom
  varianter med IDENTISK dekning. Går ikke valgt variant opp i like bredder, brukes
  eksisterende fallback (N−1 like + kortere siste, forankret i skjøtenden — hele rullen legges
  fortsatt ut eksakt).
- Verifisert: rom 2102 velger nå 0,5×22m (5 bredder, 4×448+1×408cm, 2200cm=hele rullen).
  Panelmelding forklarer avveiningen eksplisitt. Regresjon rom 1110/1105 (går allerede opp i
  like bredder) uendret.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte frihånd overlapp og areal — 2026-08-19

Rom «2102 Dusj» (12,70 m²) lot brukeren tegne en frihånds-matte som fysisk overstiger hele
gulvarealet — vakten sjekket kun hver banes lengde mot rommet, aldri baner mot hverandre.

- **`d1f7348` — ny areal- og overlapp-invariant, live-blokkert.** Ny delt
  `_matUsableAreaM2(room, marginCm)` (polygonareal minus omkrets×kantmargin) og
  `_matFreeLanesOverlap` (parvis rektangel-overlapp med 0,5cm toleranse for «inntil»-naboer).
  Blokkerer nå LIVE (ikke bare ved commit): `_matFreeCandidate` setter `overlaps=true`+`len=0`
  for en tentativ bane som ville overlappet, ghosten tegnes rød med forklarende etikett. Samme
  arealsjekk lagt til i auto-veiens `_matRunsWithinRoom` — fanget en direkte konstruert
  6-bredders matte der en tverr-posisjon havnet utenfor rommet (aldri validert av den
  eksisterende, kun langs-akse-baserte klippingen).
- Verifisert mot rom 2102: 5 gyldige baner ingen falsk alarm, 6. bane (side-flip på 3.)
  korrekt avvist. Flush-naboer (0cm gap) fortsatt lovlig. Panelet viser «Brukbart areal»/
  «Dekket areal». `_matRegressionTest()` bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte sonedeling — Regel 20, rom 1102 — 2026-08-19

Kenneths avklaring (spurt, ikke avgjort selv): et L/T-formet rom som 1102 skal deles i soner,
med udekket felt heller mot ytterveggene enn mellom sonene — samme prinsipp folie har hatt
siden juli, aldri løftet til matte.

- **`8684bf2` — sone-oppdeling portert fra folie (`_decomposeRoomToRects`).** Rotårsak: hele
  mattemotoren regnet på ÉN blokk med ETT ankerpunkt — i et L/T-rom bidro store deler av
  arealet med 0 til kapasitetsestimatet (rom 1102: 32,0 m² tegnet, appen fant plass til bare
  14 m², 66 W/m² av 150 W/m²-mål). Ny `_matPlanZones(room, prod)` gjenbruker folies
  `_decomposeRoomToRects`; rektangulære rom (≤1 sone) beholdes uendret (hovedregresjonstest).
  Sone-bevisst margin via `_rectEdgeIsSoneBoundary` — 0 margin på kanter mot en nabosone, full
  margin kun på ekte vegger. Ny `_matClipSegsToZone` hindrer en bredde i å «lekke» inn i en
  nabosone. Ny `_showMatZoneProposalPanel` viser hvilken matte i hvilken sone med ett felles
  undo-steg.
- Verifisert: L-formet 33,1 m²-analog gikk fra 16,16 m² dekket (73 W/m² BTA) til 21,84 m² (99
  W/m² BTA). Rektangulære rom (1110/1105) fortsatt bit-for-bit uendret, ingen sonepanel vises.
  `_matRegressionTest()` bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte min_gap_mm — dobbel betydning skilt i eget felt — 2026-08-19

Tredje gang samme feilklasse denne uken: ett databasefelt med to betydninger blandet sammen.
`min_gap_mm` betyr «kabel-til-kabel-avstand» for EcoMat, men ble lest som «påkrevd mellomrom
mellom bredder» — feilen fanget kapasitetsestimatet, ikke bare selve plasseringen.

- **`6d28f31` — nytt felt `mat_required_gap_mm`, entydig betydning.** EcoMats ekte
  Supabase-rader har `min_gap_mm=50`, men det oppfylles allerede av kant-inntrekket (2cm hver
  kant); Regel 18 leste feilaktig dette som påkrevd bredde-mellomrom, presset maxRuns fra
  riktig 5 til 4 på rom 1110 og gjorde gap=0 utilgjengelig for EcoMat. `_normalizeEcoMat`
  setter nå `mat_required_gap_mm=0` for EcoMat; `_matProductMinGapCm` leser det nye feltet,
  faller til 0 hvis usatt (aldri en gjetning fra `min_gap_mm` igjen).
- **`290015e` — gapet kappes nå mot det som faktisk får plass.** Regel 9 håndhevet kapping kun
  i selve plasseringssteget, ikke i kapasitetsestimatet — et ukappet gap (7cm på rom 1110) ga
  et kunstig lavt kapasitetsestimat (1024cm mot riktige 1280cm) og fikk motoren til å velge en
  for liten variant selv om antallet bredder var riktig. Fiks i den delte `_matAreaGeom`-
  kjernen (gjelder enkelt- og flermatte-veien samtidig): gapCm kappes til det som faktisk går
  opp ved maxRuns bredder FØR noe nedstrøms leser det. Ny panelvarsel «Mellomrom kappet:
  ønsket Xcm → Ycm».
- **`4ab4ff3` — rom 1110 og 1105 låst som regresjonstester.** Rom 1110 hadde pendlet 5→4→5→4
  bredder over fem commits — ny `_matRegressionTest()` (kjørbar fra konsollen) låser begge rom
  mot et syntetisk katalog bygget i samme mønster som ekte Supabase-rader.
- Verifisert: rom 1110 med gap=7cm gir nå 5 bredder à 240cm = hele rullen (var 4 bredder / feil
  variant). `_matRegressionTest()` bestått på begge rom.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte hindring-forhåndsbeskjæring fjernet — 2026-08-19

En levning fra før per-bredde-klipping fantes: en grådig forhåndsbeskjæring krympet hele det
brukbare rektangelet til den største hindringsfrie SIDEN — én hindring om gangen, i stedet for
at kun den ene bredden ble kortere.

- **`f28c9d9` — presis per-bredde-klipping erstatter grov forhåndsbeskjæring.** Reprodusert i
  rom 1110 + én hindring: `alongSpan` falt fra korrekt ~262cm til 142cm. Forhåndsbeskjæringen
  fjernet — det brukbare rektangelet er nå kun romboksen minus veggmargin; sikkerhetsnettet
  (`_matRunsWithinRoom` + per-bredde `_matClippedSegments`) står urørt. Fant og fikset et
  sekundært, tidligere usynlig problem i Regel H sin nedgraderingsløkke: en hindring midt i én
  bredde skapte et shortfall løkka aldri klarte å fjerne (samme lokale klipping uansett
  rullengde), så løkka krympet i verste fall ALLE fem breddene til 0. Løkka sporer nå det BESTE
  forsøket (minst bortkastet materiale) i stedet for blindt det siste.
- Verifisert: rom 1110 uten hindring uendret (Kenneths fasit). Med hindring midt i én bredde:
  fire bredder holder full lengde, kun den rammede bredden blir kortere (ikke null, ikke hele
  rommet). Snø-veien (samme delte kjerne) fikk samme forbedring gratis.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Én mattemotor for alle — 2026-08-19

Tre parallelle mattemotorer fantes (auto innendørs, snø-auto, frihånd) — kun én fulgte det
låste regelsettet (Regel A-J, 1, 8, 9, 13, D, E, F/G). Fjerde motor (Manuell bane-liste)
flagget, ikke rørt.

- **`9ffbdd0` — STEG 0-rapport.** Bekreftet tabellen: `_packSnowMats` (snø) og
  `S.matPaths`/frihånd er separate motorer uten det låste regelsettet. Snø sin N-formel er en
  LEVENDE REGRESJON — bruker nøyaktig det gap-i-formelen-mønsteret Regel 8 nettopp fjernet
  innendørs. Kenneths svar på tre åpne spørsmål: InSnow skal legges som EcoMat (bredde-modell
  erstatter kolonne-modell, ikke lappes), ny Regel 19 (InSnow i forbandt, EcoMat i flukt).
- **`49d469d` — STEG 1: én delt geometri-kjerne.** Ny `_matAreaGeom(room, ctx)` erstatter to
  nesten identiske kopier (enkelt-matte og fler-matte). Margin/gap er nå PARAMETERE, ikke lest
  fra produktet inni kjernen — det er det som lar snø (marginCm=0) bruke samme funksjon uten
  en if(snø)-gren.
- **`cc97abd` — STEG 2: snø delegerer til `autoFillMatSerpentine`.** InSnow legges nå som
  EcoMat — ett mat-objekt, klippet mot områdets ekte polygon (ikke en boundingboks) — og får
  Regel 1/A/D/E/13 og vakten `_matRunsWithinRoom` gratis. Ny Regel 8+18: produktets PÅKREVDE
  minsteavstand (InSnow min_gap_mm→5cm) kan aldri senkes av brukeren, ulikt Regel 9 sitt
  ønskede gap. Ny Regel 19 (forbandt): annenhver InSnow-bredde forskyves en halv CC.
- **`63c1e39` — STEG 3: frihåndsvakt mot regelbrudd ved commit.** Ny
  `_matFreeRunsWithinRoom(mp)` sammenligner faktisk tegnet lengde mot samme klippefunksjon
  tegningen selv brukte, avbryter commit ved avvik.
- Verifisert: InSnow-felt med hindring gir samme forbedring som EcoMat (full lengde på
  upåvirkede bredder). Rom 1110 (EcoMat) uendret. `_matRegressionTest()` bestått gjennom alle
  fire steg.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte gap-fordeling — Regel 8+9 — 2026-08-19

Kenneths rom «1110 Lærergarderobe HC» (279×272cm): ett cm mellomrom i innstillingene kostet
en hel bredde, og dermed en hel mattestørrelse.

- **`11c9a0e` — Regel 8: mellomrommet skal aldri koste en bredde.** Rotårsak: `maxRuns` ble
  regnet som `floor((acrossSpan+gapCm)/(matWidthCm+gapCm))` — brukerens mellomrom spiste plass
  FØR antall bredder ble bestemt. Fiks: antallet regnes nå kant-i-kant,
  `floor(acrossSpan/matWidthCm)` — ingen gap-ledd. Rettet i tre identiske forekomster
  (enkelt- og flermatte-veien regnet ellers ulikt antall).
- **`936452b` — Regel 9: mellomrommet er en fordeling av slakk, ikke en reservasjon.** Ny
  `S.varmematte.gapCm=null`-tilstand + `_matResolveGapCm`/`_matDefaultGapCm`: standardverdi =
  CC − 2×kant-inntrekk (fysisk begrunnet, verifisert mot TPL-ECOMT-CA-2183). Gapclamp utvidet
  0-5cm → 0-10cm (5cm rakk ikke for 60T/100T sitt 7cm-standardgap). Fant og rettet i samme
  slag: `S.varmematte` ble lagret men ALDRI lest tilbake ved prosjektåpning (rapportert i
  786d95a, fikset her) — gap-innstillingen nullstilte seg stille ved hver reåpning.
- Verifisert: rom 1110 med `gapCm=null` gir standardgap 4cm, 5 bredder à 240cm = hele rullen —
  eksakt Kenneths fasit. gap 0/2/5/null gir alltid 5 bredder. Lagre→gjenåpne overlever nå
  (feilet før). `_matRegressionTest()` bestått.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte-kabel i eget nett — Regel I+J — 2026-08-19

Kritisk regresjon Kenneth bekreftet på nytt etter tre tidligere fikser samme uke: den røde
kabelen tegnet fra blokkens nominelle posisjon, ikke fra samme kilde som det blå nettet.

- **`5bdc0c0` — `_matCablePlan`, delt kilde for nett og kabel.** På rom «1105 Dusj» stakk
  kabelen for én klippet bredde 35cm forbi nettets egen ende — alle 11 bredders kabel lå på en
  fast, blokk-relativ posisjon uavhengig av nettets faktiske plassering. Vakten validerte kun
  nettet, ikke kabelen, og besto derfor mens tegningen var feil. Låst Regel J (Kenneths egen
  forenkling): hver bredde er uavhengig — ingen bredde er bundet til naboens ende, den fysiske
  ~1m forbindelseskabelen som rives fri i praksis telles/tegnes ikke. Ny delt `_matCablePlan(mat,
  prod)` brukt av BÅDE `drawMats` og en utvidet `_matRunsWithinRoom`, med ett FAST
  verdensbasert rutenett i stedet for en «vandrende indeks» — to nabobredder flukter
  automatisk uten sentral tilstand.
- Verifisert: bredde 10 sin kabel nå [48,200], innenfor nettets [45,205] (var [88,240], 35cm
  utenfor). 0 kabelpunkt utenfor rommets polygon på full end-to-end via `autoFillMatSerpentine`.
  Regresjon (uklippet rektangel): k-sekvens bit-for-bit identisk med den gamle algoritmen.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Etasjen er vanntett — 2026-08-19

Bakgrunnstegninger og målelinjer kunne lekke mellom etasjer. Kartlagt full bredde (ikke bare
det Kenneth selv fant) før noe ble fikset.

- **`786d95a` — STEG 0-rapport.** Bekreftet: `S.floatingDims` har ingen `floorId` og filtreres
  ikke — to EKSTRA steder (klikk-hittest, `_hitDimLine`) har samme hull, ikke bare tegningen.
  To flere hull, ikke etasje-relatert: `S.groups` mangler i lagring/gjenoppretting;
  `S.varmematte` lagres men leses aldri tilbake.
- **`a2365c4` — STEG 1-4: én plantegning per etasje.** Ny delt `_onActiveFloor(obj)` —
  roomId-objekter delegerer til eksisterende logikk, floorId-objekter (floatingDims)
  sammenlignes mot `_effectiveActiveFloorId()`; mangler objektet begge, er svaret alltid
  «nei», aldri «vis for sikkerhets skyld» (samme antakelse som ga bb627f6 sin bug).
  `S.bgLayers` (flere lag på samme etasje) fjernet helt — `_addBgToFloor` oppretter nå en NY
  etasje når etasjen allerede har en bakgrunn. Flerside-PDF-import fikk «+ Ny etasje»-
  standardvalg (tre sider gir tre etasjer). Fant og rettet i samme slag: `_activeBgLayer()`
  (ctxbar) hadde samme «vis for sikkerhets skyld»-fallback-mønster som bb627f6, bare i en
  kontroll i stedet for tegningen; `_resetProjectState` nullstilte ikke floatingDims/groups
  (et nytt prosjekt kunne arve forrige prosjekts målelinjer).
- Verifisert: floatingDims synlig og klikkbar KUN på riktig etasje. Lagre/åpne: floatingDims
  og groups overlever nå (var 0/0 før). Flerside-import ga tre distinkte nye etasjer for tre
  sider.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Gulvføler per oppvarmet rom + MAT_ACCESSORIES — 2026-08-19

Matte fikk ingen tilbehørsliste i det hele tatt, og følerrør-tellingen for kabel dekket ikke
matte-rom.

- **`6087789` — delt `_heatedRoomIds()`, ny MAT_ACCESSORIES.** STEG 0-funn: varmefolie har
  heller ingen følerrør-oppføring — samme forhåndseksisterende hull som matte, delvis dekket
  (ikke løst helt) av denne fiksen. Følerrøret (CVA10526) er det eneste artikkelnummeret
  funnet — selve følingsutstyret følger med termostatvalget, et installasjonsvalg. Ny delt
  `_heatedRoomIds()` (union av kabel+matte+folie-rom, kun innendørs) løser dobbelttelling uten
  spesial-logikk i render/lese-koden: strømmer gjennom den eksisterende generiske
  qty-mekanismen. `kabel_folerror` byttet fra kun-kabel-rom til hele den delte totalen; ny
  `mat_folerror` fyller resten når kabel-seksjonen ikke allerede dekker den.
- Verifisert: rom med kabel+matte i samme rom telles kun én gang (sum=3 for tre distinkte
  oppvarmede rom, ikke 6). Begge følerrør-avkrysningsbokser huket manuelt av → likevel kun ett
  følerrør-element (matte bidrar 0). Rent matte-prosjekt: dialogen åpnes nå (var hoppet over).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## To visningsfeil: bakgrunn og matte-dimming — 2026-08-19

To uavhengige, men beslektede visningsfeil: alle etasjers bakgrunn tegnet oppå hverandre ved
åpning, og en matte i et ikke-valgt rom mistet både serpentin og label.

- **`bb627f6` — FEIL 1: aktiv etasje settes ved åpning.** `activeFloorId` ble aldri satt i
  `_restoreProject` — filteret i `drawBgImage` er kun sant når en etasje faktisk er valgt, så
  rett etter åpning tegnet ALT uansett etasje, helt til brukeren klikket et rom. Fiks:
  `_restoreProject` setter nå aktiv etasje til lagret verdi (ny `ui.activeFloorId` i lagringen)
  eller delens første etasje. Samlet den driftende doble betingelsen til én delt
  `_bgKeyOnActiveFloor` — null betyr nå «vis kun global», aldri «vis alle».
- **`f249db7` — FEIL 2: matte og label vises nå uansett valgt rom.** `dimOther` skjulte
  serpentin og label for enhver matte utenfor det valgte rommet og tvang fargen til default
  blå — matte var unntaket blant varmekildetypene (drawCables/drawStrips har aldri hatt dette).
  `isOtherRoom`/`dimOther` fjernet fullstendig fra `drawMats`; seleksjon er fortsatt synlig
  som sterkere strek, den fjerner bare ikke lenger innhold for naboene.
- Verifisert: to etasjer med bakgrunn — `activeFloorId` settes umiddelbart ved åpning, kun
  riktig etasjes bakgrunn vises. To rom med matte, rom 1 valgt: label tegnes for BEGGE roomId
  nå (var kun det valgte).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte Regel H — aldri overskudd — 2026-08-18

Rom «1105 Dusj»: en bredde forankret i sømenden kunne havne utenfor romformens faktiske frie
segment, selv når et stort fritt segment fantes et annet sted i samme rad — bredden ble da
ikke tegnet i det hele tatt.

- **`b85c30a` — fallback-forankring + nedgraderingsløkke.** STEG 1: når intet segment
  inneholder det opprinnelige ankeret, velges nå det LENGSTE segmentet som faktisk finnes på
  breddeposisjonen, forankret fra samme side. STEG 2: kapasitetsanslaget er et gjett mot
  boundingboksen, ikke den innhukk-klippede formen — ny løkke (maks 5 forsøk) i
  `autoFillMatSerpentine`: legg ut, MÅL faktisk klippet lengde, går ikke valgt rull opp (>1
  kuttintervall til overs) → gå ned til neste mindre katalogvariant og legg om helt fra
  begynnelsen. STEG 3: fjernet «⚠ Overskudd — kan legges løst»-toasten helt for automatisk
  utlegg (kun manuelt utlegg beholder den).
- Verifisert: rom 1105-analog — alle 11 bredder tegnes nå, laidCm=2400=totalLengthCm eksakt,
  ingen overskudd. Nedgraderingstest konvergerte 24m→20m→16m→12m eksakt. Rent rektangulært rom:
  bit-for-bit uendret.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Motor-tilkobling: robust adresseoppløsning og kaldstart-toleranse — 2026-08-18

Lumelo-motorens (auto-import) tilkobling var skjør — en død lagret adresse blokkerte hele
import-flyten, og kaldstart på Fly ga en generisk feilmelding.

- **`e4df303` — 4-stegs adresserekkefølge + automatisk omprøving.** `_resolveEngineUrl`:
  window-override → lagret adresse (kun hvis helsesjekket OK) → localhost:8000 (kun lokalt) →
  Fly-motoren som standard overalt. `/health` pinges så tidlig som mulig ved alle
  import-triggere, cachet 15s. Ny `_engineFetchWithRetry`: feiler import-fetchen, pinges
  `/health` til den svarer (tak 20s), så prøves samme forespørsel på nytt ÉN gang, med
  «Starter motoren …»-toast. Ny statuslinje + nullstillingslenke i begge import-modalene, og
  en samlet `_engineErrorDialog` (viser prøvd adresse, feiltype, Fly/Nullstill/egen-adresse-
  knapper) erstatter de gamle `prompt()`-dialogene.
- Verifisert LIVE mot ekte Fly-motoren: et ekte kaldstart-oppvåkningsforsøk tok 21,7s
  (bekrefter 20s-taket er realistisk). Fant (ikke rørt, egen repo) en feilklasse i
  lumelo-backend: en nesten-gyldig PDF gir «Failed to fetch» uten CORS-headere ved dypere
  parse-feil — omprøvingen håndterer den trygt, men rotårsaken ligger i backend.

**Fil:** romtegner.html.

---

## PDF-bakgrunn: sidevalg og fordeling på etasjer i én operasjon — 2026-08-18

Flerside-PDF-import manglet en sidevelger og kunne kun importere én side om gangen — Kenneths
eget scenario («Sten Tærud Skole», flere etasjer i én PDF) krevde re-import per side.

- **`9227e37` — sidevelger-modal + batch-import.** STEG 0 (fallgruve, rettet først): «samme
  fil» ble avgjort på filnavn alene — to sider av samme PDF kunne arve hverandres kalibrering.
  Identitet er nå fil + sidenummer. STEG 1: ny modal med én rad per side (miniatyrbilde,
  papirformat, bokmerke-tittel når den finnes). STEG 2: én «Importer»-knapp legger ut alt
  tildelt i ett steg, hver side kalibreres separat (ingen kjede av popup-er). STEG 3:
  papirstørrelse regnes nå PER SIDE, ikke én gang for hele dokumentet. STEG 5: `bg.pageNumber`
  og papirmål lagres nå i prosjekt-JSON-en (manglet helt før, også for enkeltside-import —
  «Fast målestokk» mistet presisjon etter hver lagre/åpne-runde).
- Verifisert (mock pdf.js-dokument): 3-siders scenario — side 2→1. etasje, side 3→2. etasje i
  én operasjon, begge riktig papirstørrelse. Fallgruve-testen bekreftet feilet før fiksen,
  passerer etter. Enkeltside-PDF uendret (ingen modal).

**Fil:** romtegner.html.

---

## Matte: flere matter i samme rom — Regel F+G — 2026-08-18

Store rom (som 1102, 32,0 m²) kunne kun få én matte, selv når flere ga bedre dekning.

- **`72f9267` — STEG 1-4: `_matMultiSolve`-søk + geometri + panel.** STEG 0 avklart med
  Kenneth: bruk det ekte 16cm-kuttintervallet strengt, aksepter at 15m²-matter sjelden går opp
  eksakt (avviker bevisst fra Kenneths egne illustrasjonstall). STEG 1: uttømmende søk over
  gyldige lengder × mattesammensetninger (like/ulike, N=2-4) — Regel F pkt. 1 («færrest mulig
  matter») er en STRENG prioritet, søket stopper ved første N med gyldig løsning uansett hvor
  mye bedre en høyere N ville dekket. STEG 2: `_matPlaceMultiMats` plasserer mattene i
  sammenhengende blokker, hver klippet og vaktsjekket uavhengig — INGENTING committes før ALLE
  validerer. Geometri-oppsettet bevisst DUPLISERT fra enkelt-matte-funksjonen (ikke delt) —
  kompleksiteten der er allerede høy nok. STEG 3: nytt forslagspanel med like/ulike-alternativ,
  huskes for økta. STEG 4: materialliste og labels verifisert allerede riktige for flere
  objekter (ingen kodeendring trengtes).
- Verifisert: rom «1102»-analog (640×500cm) — «2 like matter, 24,0 av 29,8 m²» plassert
  kontiguøst, begge validert. Lite rom under terskelen: uendret enkelt-matte-vei.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte jevne bredder — Regel E — 2026-08-18

Ved automatisk utlegg skal alle bredder på en EcoMat-type matte ha SAMME lengde, ingen kort
siste bredde — marginen mot langveggene er justeringsvariabelen (samme prinsipp som
trappekabelens Regel 12).

- **`dc203fd` — ny `_matEqualWidthNL`, bekreftet Regel A/B allerede fikset.** Verifiserte
  først at Regel A (posisjon fra samme klip-kilde som lengde) og Regel B (kapasitetstak)
  allerede virket riktig fra en tidligere commit (deae659) — ingen kodeendring nødvendig der.
  Ny `_matEqualWidthNL(totalLengthCm, cutCm, maxRuns, alongSpanCm, minLenCm)`: finner
  (N,L)-paret som forbruker hele rullen eksakt. Variantvelgeren prøver opp til 3 nabovarianter
  for en gyldig (N,L); går ingen opp, faller tilbake til den gamle «N-1 like + kortere siste»-
  modellen. Ny vakt `_matRunsMatchRule` (Regel D/E) kjøres rett før commit, hopper over sjekken
  når romformen faktisk har klippet en bredde (et innhukk kan legitimt gjøre at summen ikke
  matcher uniform lengde uten at noe ligger utenfor rommet).
- Verifisert: Kenneths eget regnestykke (24m/16cm=150 enheter, N=10→L=240cm) traff eksakt. 1cm
  knappere langspenn: riktig fallback til gammel modell, ikke et sprang til en mye mindre
  variant.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Trapp-utskrift per-sone og oppløsning — 2026-08-18

Seks steg som gjør trappe-PDF-en (Regel 16-18) ryddig og lesbar: fjerner støy, viser tall per
sone i stedet for én misvisende sammendragsrad, retter flateeffekt-formelen overalt, legger
målsetting på selve utskriften, gir valg for antall like kabler, og løser en alvorlig
oppløsningsbug på lange trapper.

- **`6fa167a` — STEG 1: fjern støy, fiks dobbel bunntekst.** Fjernet redundant måltekst-
  stempel og en sammendragslinje som kun talte FØRSTE trinn-serie (direkte feil for trapper med
  blandet trinn/repos). Fjernet «Oppvarmet areal» (uinteressant for en trapp som stråler ut i
  luft på tre kanter). Fikset dobbel bunntekst — bunnteksten ble stemplet to ganger per side,
  viskerektangelet dekket ikke toppen av teksten.
- **`0605f58` — STEG 2: per-sone-blokker.** Ny `_stairSoneGeometryBlocks` grupperer berørte
  trinn i sammenhengende «trinn-serier» (ny gruppe ved endring i bredde/N/CC, eller hull i
  rekkefølgen) — leser strengetall/CC direkte fra rutingen, regner aldri på nytt.
- **`a1774a6` — STEG 3: flateeffekt fra CC overalt.** Fem andre steder viste fortsatt et
  arealbasert tall (feil av samme grunn som PDF-en) — `_stairPerStepWm2` er nå eneste kilde,
  brukt av ctx-bar, innstillingspanel og forslagsmotoren. Fant og fikset en reell krasj
  underveis («areaM2 is not defined»).
- **`899206e` — STEG 4: målsetting fra appen på utskriften.** Samme flate-utvalg og linje-/
  pil-mønster som skjermens dimensjonering, med kollisjon-avverging på lange trapper (dropper
  CC-tallet, beholder tikk-streken, når avstanden er for smal).
- **`a87f2cf` — STEG 5: valg for antall like kabler (Regel 18).** Nytt felt «Antall kabler» +
  «Like lengder»-avhuking. Går det ikke opp: spesifikk feilmelding i stedet for den generiske
  «matcher ikke dimensjonene».
- **`f13a5a1` — STEG 6: oppløsning på lange trapper.** Rotårsak: et fast 800×500-lerret ga kun
  0,458 px/cm på en 150×1468cm-trapp — skalaen ble låst av lerretets korte side. Løsning: PNG
  i stedet for JPEG, lerret dimensjonert mot en ønsket trykt oppløsning (150 dpi), rotasjon til
  liggende, og deling i bånd for ekstreme forhold.
- Verifisert: Kenneths trappe-mål (150×1468cm) gikk fra 0,458 til 2,21-2,35 px/cm per bånd
  (~5×), tydelig lesbare trinnummer og kabel-serpentin. `node --check` bestått gjennom alle
  seks steg.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Trapp: kabelstart på nesen + valgfri snuing + mm-avrunding — 2026-08-18

Regel 14-15 i spec-trapp-kabelutlegg.md: kabelen la ut fra riser-siden av trinnet i stedet for
nesen (fremkanten), sidevisningen var speilvendt om høydeaksen, og rå flyttall lekket ut på
tegningen.

- **`e58f467` — Regel 14: kabelen starter på nesen + sidevisning speilt riktig vei.** Rotårsak
  (bekreftet empirisk med pikselsøk i ekte rendering, ikke bare geometri-utledning):
  `depthStart` brukte nese-margin der den skulle brukt riser-margin — run-indeksen for trinn
  telles nå NEDOVER fra nesen mot riser-siden. Samme relabeling i sidevisningens `cumulH`-akse
  (trinn 1 havnet øverst på skjermen i stedet for nederst — canvas har y voksende nedover).
- **`aa20a3c` — STEG 2-4: valgfri snuing, skjøt-fargebug, byggbare mm-mål.** Ny
  `stair.cableStartFromTop`-innstilling reverserer hele overflate-rekkefølgen. Fikset en
  fargebug i U-svingene: strokeStyle ble satt fra sist tegnede segment (høyest x) i stedet for
  utgangssegmentet ved høyre-til-venstre-reise. Regel 15: auto-justert sidemargin snappes nå
  til nærmeste mm FØR den brukes i geometrien (ikke bare i visningen) — restavviket vises
  ærlig i stedet for å late som det er borte.
- Verifisert: K1 sin faktiske posisjon (pikselmetode) traff forventet verdi eksakt. 10-trinns
  testtrapp (spec-ens eget eksempel) fortsatt eksakt 4553cm, 4 løp per trinn, CC 9cm — uendret
  av speilingen. `fillText`-interception viser maks én desimal på alle 17 draw-kall.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte: klippet bredde posisjoneres riktig, rullen overskrider aldri kapasiteten — 2026-08-18

Oppfølging av 1cb674e på rom «1105 Dusj»: en klippet breddes LENGDE var riktig, men den kunne
tegnes fra feil ende, og variantvelgeren kunne velge en rull lengre enn rommet faktisk hadde
plass til.

- **`deae659` — Regel A (samme anker for lengde og posisjon) + Regel B (kapasitetstak).**
  Regel A: hver bredde måltes fra blokkens uniforme startpunkt, mens tegningen forankret en
  kortere bredde i sømenden — når disse to ankrene var ulike, fikk bredden riktig lengde men
  feil posisjon. Ny `mat.runStarts[]` (parallell med `runLengths[]`) og `_matRunStartCm`, delt
  kilde for tegning OG vakt. Regel B: variantvelgeren sjekket kapasitet mot uniformt langspenn
  i stedet for den faktiske klippede kapasiteten (samme følgefeil 1cb674e allerede rettet i
  utlegget selv, glemt i variantvalget) — kapasitetstaket fjernet, begge grener velger nå
  STØRSTE variant ≤ sann kapasitet.
- Verifisert: bredde 10 tegnet med korrekt worldY [13,181] (var [61,229], stakk inn i
  innhukket). Kapasitet 23,3m (ukappet, klippet) → velger 24m i stedet for 26m, 0 kabelpiksler
  utenfor noen vegg. Vakten skiller nå korrekt «riktig lengde, feil posisjon».

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Trapp-kabelskjøt — kabler deles på meter, ikke flateantall — 2026-08-18

Låst Regel 11 (Kenneth 18.08.2026): en kabel har fast fabrikklengde og kan verken kortes eller
forlenges — et utlegg der én kabel har meter til overs mens en annen er for kort er ugyldig.
Kenneths eget symptom (K1 13,8m til overs, K2 18,1m for kort) kom av at kablene ble delt etter
ANTALL FLATER, ikke meter.

- **`f54dcdb` — STEG 1+2: meter-basert fordeling + skjøt midt i et trinn.** Ny
  `_stairAllocateCables` forbruker kabel 0 i full lengde før kabel 1 starter, osv. Fant og
  fikset en beslektet, verre bug i samme runde: «Maks CC trinn» ble skrevet over med OPPNÅDD
  CC hver gang et forslag ble valgt — feltet er samtidig brukerens tak for neste forslagsrunde,
  og ble dermed low-jacket etter én anvendelse. `cableIdx` flyttet fra run-nivå til
  segment-nivå, så et skjøt kan ligge midt i en streng/opptrinn, med tydelig sort/hvit markør.
- **`e367c3e` — STEG 3-6: kabelsett + sidemargin løses eksakt sammen.** Kenneth korrigerte: CC
  skal ALDRI tettes for å forbruke overskudd (strengantallet er et heltall låst av
  ceil-formelen); sidemarginen er den kontinuerlige, presise justeringsvariabelen. Siden
  strengantallet er uavhengig av sidemarginen, er totalbehovet en LINEÆR funksjon av den —
  treffe en gitt kabellengde er derfor ren algebra, ikke søk. Ny `_stairSolveExactCableSet`
  søker over multisett av 1-3 katalogkabler, velger settet med MINST mulig marginøkning.
- **`7ecb1a0` — STEG 7: brukerstyrte soner.** Gjenbruker den eksisterende segment-listen i
  trapp-byggeren (Kenneths eksplisitte instruks) — `stair.segments[i].zone`. Hver sone løses
  uavhengig med samme Regel 11-13-mekanikk. Ny `showStairEditModal` gjenåpner byggeren for en
  allerede plassert trapp (fantes ikke fra før).
- Verifisert: 31-trinns testtrapp løste automatisk 60m+80m med kun 0,6cm marginøkning, 0cm
  avvik mot rutingens lengde. 3-sone-testtrapp: alle tre soner løst eksakt, ingen streng
  splittet på tvers av en sonegrense.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte-auto: kabel skal ALDRI legges utenfor rommet — 2026-08-18

Låst regel (Kenneth 14.08.2026): `autoFillMatSerpentine` jobbet kun på rommets omsluttende
rektangel, så bredder som traff et innhukk stakk forbi ytterveggen.

- **`1cb674e` — STEG 0-4: per-bredde-klipping mot rommets polygon.** STEG 0 (avklart med
  Kenneth): valgte per-bredde-lengder i nytt `mat.runLengths[]` fremfor å dele opp i flere
  matte-objekter (materiallisten teller allerede per S.mats-objekt — flere objekter ville
  risikert overbestilling). STEG 1: ny `_matClippedSegments` gjenbruker de samme delte
  primitivene folie bruker (`clipStripToRoom` m.fl.) til å klippe hver bredde mot rommets EKTE
  polygon. STEG 4: ny vakt `_matRunsWithinRoom` verifiserer hver streng mot polygonet FØR
  utlegget committes. Fant og rettet en reell rendering-bug underveis: skjøten mellom to baner
  («flukt») antok en fast start-/sluttindeks — med romform-klipping kan enhver bredde nå være
  kortere, og skjøten hoppet til en fast ende og tegnet en lang, feilaktig strek forbi
  ytterveggen.
- Verifisert (pikselinspeksjon mot ekte w2s): repro-rommet (567×242, innhukk 60×46) — 0
  kabelpiksler i innhukket, riktig kuttraster-snappet lengde. L-form-stress-case: 0 piksler i
  det utsparte området. Rent rektangel: `runLengths` forblir null, bit-for-bit uendret.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Matte-label som kabel — 2026-08-18

Fire steg som gir matte samme label-kvalitet og interaksjon som folie/kabel allerede har:
verdensbasert rendering, kabel-lik linje 2, og full v2-gizmo (flytt/skaler/roter).

- **`978bc8a` — STEG 1: generaliser `_drawStripLabel`.** Rektangulær matte-label hadde
  hardkodet 13px skjermpiksel-font (skalerte ikke med zoom, feil i PDF) og skjultes helt under
  zoom>0,38. `_drawStripLabel` (folies renderer, den eneste med riktig klamping/callout-
  fallback) generalisert minimalt for trygt gjenbruk. Egne lagre (`_matRectLabelBounds`/
  `Geom`) løser id-kollisjonen mellom S.mats og S.matPaths sine separate id-tellere.
- **`1ebd6c2` — STEG 2: linje 2 = W/m² flate · BTA · CC.** Ny `matWm2` i `_computeRoomStats`.
  Migrerte OGSÅ frihånds-matte til `_drawStripLabel` (STEG 1 sa «begge matte-systemene») —
  dens gamle hånd-tegnede boks («Tegnet X m · rull Y m») manglet både rom-klamping og
  callout-fallback.
- **`2f94d53` — STEG 3: v2-håndtak for rektangulær matte.** Klikk låser labelen (ingen
  lag-sykling), rundpil roterer (snapper til 0/90/180/270), X-håndtak skalerer, høyreklikk gir
  «↩ Tilbakestill». Ny `S.ui.selectedLabelMatRectId` løser id-kollisjonen. Ny minimal
  høyreklikk-meny (matte hadde ingen fra før).
- **`9753e16` — STEG 4: delt linje-2-bygger.** Ny `_matLabelInfoLine(roomId, product)` —
  fjernet ~10 dupliserte linjer hvert sted.
- Verifisert med instrumentert canvas og ekte DOM-hendelser gjennom alle fire steg: rektangulær
  og frihånds matte i samme rom viser bokstavelig identisk linje 2; kroppsdrag/roter/skaler
  bekreftet med ekte mousedown/mousemove/mouseup.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Trapp-kabelutlegg determinisme — 2026-08-17

Fem steg som gjør trappekabel-beregningen deterministisk: riktig ceil-formel, geometri før
katalog, tegning som leser motoren i stedet for å gjette, behov/dekket som to eksplisitte
sannheter, og fjerning av et U-svingtillegg som viste seg å være dobbelttelling.

- **`7268e1e` — STEG 1: riktig ceil-formel.** `floor()` i «gjerdestolpe»-formelen for antall
  strenger kunne gi faktisk CC over maks uten varsel (Kenneths eksempel: 27cm brukbar dybde,
  maks CC 10cm — floor ga CC 13,5cm, bryter maks; ceil gir riktig CC 9cm). Ny delt
  `_stairRunCount(usableDepth, maxCC)` brukt av bygger, estimator og validator samtidig — kan
  ikke lenger sprike.
- **`8d69bb2` — STEG 2: geometri bestemmer, katalog følger etterpå.** Forslagsmotoren lot
  POENGSUMMEN (dominert av valgt katalogkabels effekt) avgjøre strengantallet — en kosmetisk
  sidemargin kunne dermed flytte en fysisk utleggsbeslutning. Regnes nå én geometrisk riktig
  `runsPerStep` FØR kabelvalg. Ny egen `stair.landingMargin_cm` for repos (var feilaktig delt
  med sidemarginen).
- **`1c9d42a` — STEG 3: tegning viser rutingen fra motoren.** Tre tegnere (sidevisning, plan,
  PDF) regnet posisjon og inn-/utgangsside PÅ NYTT i stedet for å lese det motoren allerede
  hadde beregnet — 2 og 4 strenger så identiske ut i sidevisningen.
- **`e04b324` — STEG 4: behov og dekket lengde som to sannheter.** Ny
  `stair.coveredCableLength_cm` skilt fra `totalCableLength_cm` — panelet kunne før vise to
  selvmotsigende tall når kabelen var for kort.
- **`7840bce` — STEG 5: fjern U-svingtillegget.** Regel 10 (avklart av Kenneth): kabel mellom
  strengene skal ikke telles i lengdebehovet — svingen spiser omtrent like mye av den rette
  lengden som den legger til. Fjernet π×CC/2-tillegget i alle sju lengdeberegninger. Kenneths
  eksempel ga nå eksakt spec-fasiten: 4553cm (var 4977,1cm med tillegget).
- Verifisert gjennom alle fem steg mot Kenneths eget eksempel (10 trinn 120×33cm) og en sweep
  av 231 dybde/CC-kombinasjoner — 0 brudd på maks CC.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Trappebygger: ingen tapte tastetrykk, standard 1 trinn, arv fra forrige segment — 2026-08-17

- **`3e6349d` — oninput i stedet for onchange, standard 1 trinn, arv til nytt segment.** Kunne
  ikke reprodusere den beskrevne onchange/blur-racen via automatiserte museklikk, men byttet
  likevel til `oninput` for alle 6 skjemafelt — fjerner hele klassen av «tastet verdi tapt
  fordi du klikket videre uten å forlate feltet», uansett eksakt utløsermekanisme. Standard
  antall trinn er nå 1 (ny konstant), for både første og nye segmenter. Et nytt trinn-segment
  arver bredde/antall/dybde/høyde fra siste TRINN-segment i lista (et repos innimellom hoppes
  korrekt over); nytt repos arver dybde fra forrige repos. Det nylig tilføyde segmentet får
  aksentkant + «· nytt»-merke, scrolles inn, og Antall-feltet får fokus (ett-gangs).
- Verifisert med direkte funksjonskall + ekte museklikk: `oninput` committer på hver
  tastetrykk uten blur; ny trapp viser Antall 1; nytt trinn-segment arver riktig fra forrige
  trinn-segment (ikke fra et mellomliggende repos); omvendt byggeretning viser korrekt
  reversert indeksrekkefølge.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Fiks manuell folieplassering: magnet-first snap — 2026-08-14

Manuell folie-drag kunne forsvinne stille ved overlapp med en eksisterende folie i samme
retning — ingen feilmelding, bare vekk.

- **`46ca060` — felles ghost/commit-kandidat, magnet FØR kollisjonssjekk.** Rotårsak:
  dragover/drop kalte kollisjonsunngåelsen med tom exclude-liste FØR magnet-snapping, så
  ethvert delvis overlapp barberte bort hele kolonnen. Ny delt `_stripDropCandidate()`
  beregner magnetposisjon FØRST (vegg-margin eller nabofolie), kjører kollisjonsunngåelse PÅ
  den snappede posisjonen, og returnerer én sannhet brukt av BÅDE ghost (dragover) og commit
  (drop) — kan ikke lenger sprike. Kollisjonsløsning er nå tobent: dødsenter-slipp på én nabo
  prøver begge sider (korn-hjørne-tiebreak); klemt mellom flere naboer prøves kun innoverside
  per nabo (varsler «for trangt» i stedet for å teleportere). Alt-tasten hopper over magneten.
  Toast ved reell plasshunger i stedet for stille forsvinning.
- Verifisert: dødsenter-slipp på eksisterende folie snapper til motsatt side med eksakt gap;
  eksakt-passende lomme mellom to naboer (1cm begge sider); for trang lomme gir invalid+toast,
  ikke teleport. Auto-utlegget urørt (verifisert via diff).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Veggmarkering og flyttepil — seks runder til den riktige rotårsaken — 2026-08-14

Vegger lot seg ofte ikke markere, og gizmoen for å flytte dem (som fantes fullt utbygd fra
før) var derfor uoppnåelig. Seks runder med presisjonsjakt — de fem første fjernet reelle, men
delvise bugs; den sjette fant den faktiske rotårsaken.

- **`af1366b` — klikk-terskel = faktisk veggtykkelse, ett klikk velger både rom og vegg.**
  `hitTest()` sin klikk-terskel var fast 2 skjerm-px mot veggens senterlinje, uansett hvor
  tykk veggen faktisk tegnes (opptil 50cm) — klikk hvor som helst i det synlige veggbåndet
  traff verken vegg eller rom. Ny `_wallHitThr(room, wl)` (terskel = faktisk veggtykkelse, 8px
  skjermgulv). Vegg-treff kastet tidligere bort hvis veggens rom ikke allerede var valgt
  (krevde to klikk) — velger nå begge i ett klikk.
- **`308a447` — nærmeste vegg, ikke første i array; bredere flyttepil-treff.** `hitTest()` sin
  vegg-løkke returnerte FØRSTE vegg innenfor terskel, ikke den geometrisk NÆRMESTE — i et rom
  med mange korte «jog»-vegger rammet dette systematisk. Ny `_closestWallHit`. Flyttepilens
  treffsone økt fra 3px til 12px (var strengere enn alt annet lignende i appen).
- **`bcbd329` — crosshair-cursor + strammere presisjon.** Reversert cursor til crosshair (fra
  pointer), tersklene strammet noe inn.
- **`d52b8ac` — egendefinert cursor med eksplisitt hotspot.** Kenneths foto viste cursoren
  tydelig forskjøvet fra veggens linje — OS/nettleserens innebygde crosshair-cursor har ingen
  hotspot nettsiden styrer. Ny `WALL_CURSOR` — egendefinert SVG-cursor med eksplisitt hotspot
  (10,10).
- **`fd6954d` — canvas-tegnet hover-highlight erstatter cursor som primært signal.** To runder
  med cursor-justeringer løste ikke Kenneths gjentatte, presise rapport («markering endrer seg
  litt under veggen»). Konklusjon: cursor-hotspot-rendering er strukturelt ikke verifiserbart
  fra JS. Ny `drawHoveredWallHighlight()` leser SAMME koordinater som selve veggstreken og
  hitTest — strukturelt umulig for dem å divergere.
- **`815c7ae` — den faktiske rotårsaken: canvas backing-størrelse ute av synk med CSS.**
  `resizeCanvas()` setter canvas' backing-størrelse fra `#canvas-wrap`, men kalles kun ved
  window.resize. `w2s`/`s2w` regner i backing-piksler, mens klikk-håndtererne matet inn
  CSS-piksler uskalert — enhver layout-endring (kontekst-verktøylinje, sidepanel) uten et
  resize-event ga en RETNINGSAVHENGIG skalafeil (null ved øvre/venstre kant, voksende mot
  nedre/høyre — nøyaktig Kenneths «perfekt vertikalt, glir horisontalt»). Ny delt
  `_evToCanvas(e)` brukt på alle ~26 steder som leste `e.clientX - rect.left` mot hovedlerretet.
  Ny `ResizeObserver` på `#canvas-wrap` fjerner selve rotårsaken til at backing/CSS går ute av
  synk.
- Verifisert (samme desync aktivt UNDER testen): alle 4 vegger i et rektangel treffer
  symmetrisk. 10-vegg sikksakk-testrom: 9/10 korrekt klikk-velgbare i alle seks runder (den ene
  «feilen» er korrekt hjørnepunkt-prioritet, ikke en regresjon).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Trappedel startvalg-overlay legger seg ikke lenger over ferdig trapp — 2026-08-14

Startvalget («Slipp tegning her»/«Tegn opp rom»/«Romliste») dukket opp over en ferdig
trappetegning hver gang prosjektet ble åpnet, og blokkerte klikk.

- **`bc29dbd` — svarteliste snudd til hviteliste.** Rotårsak: `_editorIsEmpty()` avgjorde
  synlighet med en SVARTELISTE — kun 'list'-modulen var unntatt. Trapper ligger i `S.stairs`
  (via `partId`, ikke `floorId`) og oppretter aldri en aktiv etasje, så en trappedel kunne
  aldri produsere en treffende «rom på aktiv etasje», uansett hvor mye som var tegnet. Snudd
  til HVITELISTE — overlayet vises kun når aktiv del er 'indoor' eller 'snow'. I samme slag:
  overlay-tekstene sa «rom» også i snø-modulen — brukte eksisterende `roomWord()`-hjelper til
  å vise «område»/«Områdeliste» der.
- Verifisert med direkte funksjonskall: trappedel med tegnet trapp → false (var true). Indoor
  med rom på aktiv etasje → false; ny tom etasje i samme del → true igjen (overlay kommer
  riktig tilbake).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Auto-folie hull-regresjon — REGEL A+B+C (T-rom sonegrense) — 2026-08-13

Kenneths bugrapport: auto-utlagt folie i et rom med hindring (320×198cm, 80×90
hjørnehindring) hadde et udekket hull midt i arealet, ikke mot vegg. Fire commits sporer
rotårsaken gjennom sonepakkingen og retter tre relaterte regler.

- **`6c584ae` — Funn 1: sone-utlegg overstyrte betingelsesløst.** `showAutoFillComparison`
  erstattet resultatet fra global (usonet) fylling med sone-resultatet UANSETT kvalitet så
  snart rommet dekomponerte til >1 sone — sonekanten (ikke en ekte vegg) ble behandlet som
  veggmargin, og en strimmel i én sone kunne ikke fortsette inn i naboens allerede reserverte
  areal. Fiks: erstatt kun når sone-resultatet faktisk er MINST like bra (delt
  `_statsAtLeastAsGood`, samme dekning-først + score-tiebreak som H-vs-V-valget allerede
  bruker).
- **`0add23d` — Funn 2: rom med hindring faller nå automatisk til coverage-strategi.**
  Default-strategien 'long' hoppet over hele hindringsapparatet — bekreftet med Kenneth: rom
  med hindring skal falle automatisk til 'coverage'. Eksplisitt brukervalg vinner fortsatt
  uansett romform.
- **`3ca64a0` — REGEL A: sonegrense-anker mot ekte vegg, ikke mellom soner.** Ny repro
  (T-/kryssformet rom uten hindring): `_packZoneFullLength` ankret alltid pakkingen ved lav
  koordinat uansett om kanten var en ekte vegg eller en sonegrense — når sonegrensen tilfeldig
  lå på høy koordinat, endte slakken midt i arealet. Ny `_rectEdgeIsSoneBoundary` klassifiserer
  hver sonekant, dropper veggmargin på sonegrense-kanter og pakker utover fra dem.
- **`295ce46` — REGEL B+C: maximin bredde-kombinasjon + smaleste bredde som nødløsning.** Regel
  B: ved lik dekning, foretrekk kombinasjonen der SMALESTE brukte bredde er BREDEST (120+60
  foran 140+40) — ny `_maximinWidthCombo` (DP over sonens budsjett). Regel C: familiens
  absolutt smaleste bredde er en nødløsning, ikke et førstevalg — ekskludert fra auto sitt
  full-lengde-søk, brukt kun når den gir vesentlig dekning.
- Verifisert mot repro-rommet og fire tilleggsromtyper (enkelt rektangel, hindring midt i rom,
  L-rom, U-rom, T-rom) gjennom alle fire commits — 0 regelbrudd i alle tester, ingen regresjon
  i romtyper uten hindring/sonedeling.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## InSnow frihånd: velg mattebredde 50 cm eller 100 cm — 2026-08-12

Frihånds-matteverktøyet var hardkodet til 50cm selv om katalogen alltid har hatt InSnow
300T-SKUer i begge bredder.

- **`caf5680` — breddevelger + snø-bevisst frihånd.** Ny breddevelger (chips) i UPC, kun
  synlig når familien har mer enn én bredde (EcoMat innendørs uendret). `_matFreeCatalog`
  skrevet om fra areal×200 (antok 0,5m bredde, tvetydig på tvers av bredder) til direkte snap
  på total lengde, filtrert på familie+bredde+spenning. Frihånd er nå snø-bevisst: `gapCm`
  initieres til 10cm (snø-standard) i stedet for alltid 0, langkant-margin 0 for snø (pakkes
  til kant). Tydelig toast når valgt bredde ikke får plass, i stedet for stille no-op.
- Verifisert i konsoll mot levende katalogdata: 10m tegnet + 1000mm/230V ⇒ riktig SKU (1×10m,
  10m², 3000W); EcoMat-regresjon (7 lengder) ga bit-identisk SKU+rollCm mot gammel formel.
  Ikke testet: faktisk museklikk-tegning i innlogget UI.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Fix: frihånds-matte nullstilt ved nytt/lastet prosjekt (mattelekkasje) — 2026-08-12

- **`1e6939d` — nullstill `_matFree` ved prosjektbytte.** Påbegynt frihånds-mattetegning ble
  ikke ryddet ved prosjektbytte, så en gammel matte kunne dukke opp igjen i et nytt
  prosjekt/rom — usynlig for klikk/sletting (kun `S.matPaths` hit-testes) og aldri lagret til
  Supabase.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Startskjerm: context-aware import-flyt + merget dropzone + auto/manuell-steg — 2026-07-16

UX-omlegging av tegneverktøyets startskjerm «Hvordan vil du begynne?». Fjerner dobbelt-spørring
av «hvordan», slår filtype-kortene sammen til én slipp-sone, og gjør auto-vs-manuelt utvetydig
etter raster-import. Kun flyt/UI — parser, auto-deteksjon og tegneverktøy er urørt.

- **`583c4ee` — Startskjerm-flyt.**
  - **Merget dropzone:** de fire ces-cards (Importer PDF, Importer DWG/DXF, Tegn opp rom, Hurtig
    prosjektering) → tre valg: én stiplet slipp-sone («Slipp tegning her, eller klikk — PDF, bilde
    eller DWG/DXF») + Tegn opp rom + Romliste. Klikk/slipp → felles dispatcher.
  - **Dispatcher `_startImportFile`:** DWG/DXF (vektor) → `_autoReadStart` (auto, ingen spørsmål);
    PDF/bilde (raster) → `_rasterMethodChoice` steg-2 «Fant en plantegning — hvordan lage rommene?»
    med a) «La appen finne rommene» (anbefalt) → auto-deteksjon; b) «Jeg tegner selv» →
    `_loadFileAsBackground` (uttrukket fra `handleBgFile`). Ordlyden gjør det utvetydig hvem som
    lager geometrien.
  - **Context-aware:** flagg `_startMethod`. «Fra tegning» på dashboardet → dropzone-fokusert modus
    (kun slipp-sonen + «Eller start på andre måter»-lenke), ingen native fil-dialog. Generisk
    inngang («Gulvvarme»/«+Opprett») → full startskjerm. Nullstilles i `_quickStartModule` +
    `_resetProjectState`.
  - **Toolbar-opprydding:** `_importPlanMenu` → `_emptyPickImport` (samme dispatcher); gammel
    pre-import auto/manuell-meny fjernet — ikke tilbudt på to måter.
  - Tastatur: `role=button` + tabindex + `_cesKey` (Enter/Space) + `:focus-visible`. Ingen
    drop-shadows. `_importPlanToDraw` beholdt (shape-card + fallback).
- Verifisert i preview (begge modi, steg-2, dispatch-matrise DWG→auto / raster→steg-2, dark/light)
  — ingen JS-feil. Innlogget ende-til-ende (ekte import) gjenstår hos Kenneth.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Dashboard visuell polish: kompakt full-bredde flis-rutenett — 2026-07-16

Ren visuell/layout-forbedring av to-kolonne-dashboardet (Kalkulasjon/Prosjektering). Ingen endring
i logikk, ruter eller inngangsfunksjoner. Prinsipp: se mest mulig uten å scrolle.

- **`559433c` — Kompakt flis-rutenett.**
  - **Full bredde:** boksene spenner samme bredde som stat-kort-raden (fikset at `#dash-modules`
    ikke strakk seg til full bredde → kompakt grid kollapset til innholdsbredde).
  - **Kompakte fliser:** `repeat(auto-fit, minmax(104px,1fr))` → 3 i bredden på desktop, 2 på smal
    skjerm. Kalkulasjon 1 rad, Prosjektering 2 rader (3+2). Flis = sentrert kolonnefarget ikon +
    kort etikett (~62px), undertitler droppet.
  - **Lett boks:** tynn 2px kolonnefarget toppkant + kompakt header (ikon-chip + tittel + kort
    undertekst); tunge ytre paneler fjernet. `align-items:start` → ingen tomrom i Kalkulasjon.
  - **Hover:** løft ~1,5px + kolonnefarget kant + svak tint (~100ms). `:focus-visible`. Ingen
    drop-shadows. Stat-kort strammet (padding/font) + mindre `.dash`-gap → alt høyt oppe.
  - Farge: teal #0F6E56 (kant #5DCAA5) / lilla #534AB7 (kant #AFA9EC). Fiks: «Fra tegning» brukte
    `ico:'image'` (mangler i ikon-settet, tom chip) → `map`.
- Verifisert desktop + mobil, lyst + mørkt tema. Ingen inngangsfunksjon endret (samme onclick).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Kalkyle-matrise med bulk-varmetype på import-gjennomgang (STEG 1–5) — 2026-07-16

Utvider import-gjennomgangsskjermen (`#import-review-screen`) til en **varmetype-matrise** for
kalkyle. Matrisen bor her fordi de auto-detekterte rommene har geometri (`poly`), så folie-pakking
fungerer og de committes som ekte tegnede rom. «Fra tegning»-kortet router hit (target=draw).
Selve tegne-/pakkemotorene er urørt — kun romliste-UI, bulk, preset-oppslag og grov auto-utfylling.

- **`9cf06ab` — STEG 1–5 + DB.**
  - **Steg 1 (matrise):** hver rad (`_reviewRenderList`) får 4-veis gjensidig utelukkende
    Folie/Kabel/Matte/Ingen (`r.calcType`, `heat = calcType≠none`); fargekodet `.rv-tseg`.
  - **Steg 2 (bulk):** «Alle rom · N»-rad + `_reviewBulkType`; 'preset' = sett hvert rom etter
    romtype-regel. Enkeltoverstyring bruker samme mekanisme.
  - **Steg 3 (romtype-preset):** ny kolonne `default_mod_type` på `room_type_defaults`
    (`supabase-migration-roomtype-modtype.sql`, kjørt manuelt). `ROOM_TYPES[].defaultModType`
    (bad/vaskerom=mat, ellers foil), `_roomTypeModType`, `_savePersonalModTypeOverride` +
    admin-popup «⚙ Standarder». Forhåndsfyller varmetype per rom (scope global > org > user).
  - **Steg 4 (grov autofyll ved commit):** `_calcRoughFill` i `_drawCreateRoomsFromReview` — folie
    via `_autoFillBothDirections` (beste retning), kabel/matte via `_listAutoSuggest` (kun-label-
    anslag). Alt flagget `_calcRough=true` for re-kjøring ved «gjør om til prosjektering».
  - **Steg 5 (live-sum):** footer `#rv-sum` (`_reviewUpdateSum`) — rom med varme · sum m² · grov
    effekt (W), avrundet, live. Responsiv (footer wrap + matrise stabler på smal skjerm).
  - **Viktig funn:** `_applySalesTransition` auto-setter `delivery_status` ved `vunnet`, så
    matrisen bygger på import-detekterte geometri-rom (ikke den manuelle list-modulen).
- Verifisert render/bulk/preset/live-sum i preview. Motorkjøring (folie-pakking + kabel/matte)
  krever login/produktkatalog — innlogget ende-til-ende gjenstår hos Kenneth.

**Fil:** romtegner.html + `supabase-migration-roomtype-modtype.sql` + `docs/endringslogg.md`.

---

## Dashboard delt på intensjon: Kalkulasjon vs Prosjektering (STEG 2–5) — 2026-07-16

Bygger om dashboard-toppen fra én blandet modul-«kortrad» (varmetype + hurtigprosjektering om
hverandre) til **to intensjons-kolonner**: brukerens første valg er nå dybde, ikke varmetype.
**Kalkulasjon** (rask pris) venstre, **Prosjektering** (detaljert leggetegning) høyre; stables
vertikalt på smal skjerm. Speiler statusflyten: kalkyle = salgsfase, prosjektering = leveransefase.
Gjenbruker EKSISTERENDE inngangsfunksjoner — ingen nye flyter, ingen endring i tegne-/kalkyle-motorene.

- **`902ae40` — STEG 2–5.**
  - **Steg 2 (to kolonner):** `_renderDashModules()` bygger nå to kolonner i stedet for den flate
    `MODULE_TYPES`-raden. **Kalkulasjon** (inndata-metode): Manuelt → `addPart('list')`, Fra tegning →
    `_quickStartFromDrawing()` (åpner indoor-editor + dagens plan-import/auto-romdeteksjon),
    Snøsmelting–effektbehov → `_openSnowCalc()`. **Prosjektering** (varmetype/tegneverktøy): Innendørs
    gulvvarme, Snøsmelting trapper/grunn, Frostsikring rør + Tak og takrenner disabled («Kommer»).
    Datadrevet via `_DASH_CALC_CARDS`/`_DASH_PROJ_CARDS`.
  - **Steg 3 (fargekoding):** nye CSS-vars `--calc` (#0F6E56 teal, salg/kalkyle) / `--proj` (#534AB7
    lilla, leveranse/prosjektering) + tint-varianter. Kolonnene og leveranse-pill'en (`_deliveryCellHtml`)
    bærer modus-fargen. Salgstraktens semantiske chip-farger (vunnet=grønn osv.) er BEVISST urørt.
  - **Steg 4 (broen):** `_prosjekteringBridgeHtml(p)` viser «Gjør om til prosjektering» kun når
    `sales_status='vunnet'` OG `_type='list'` (vunnet Manuelt-kalkyle) — i stedet for de vanlige
    leveranse-kontrollene. `_convertToProsjektering(id)` bytter `project.type` list→indoor, setter
    `delivery_status='klar_for_montering'` og åpner tegneverktøyet på den eksisterende romlista.
    Kun navigasjon — INGEN geometri-konvertering (spec §7). Broen forsvinner når type er byttet.
    Viktig funn: `_applySalesTransition` auto-setter `delivery_status` ved `vunnet`, så «tomt
    delivery_status» kan ikke flagge en kalkyle — `_type='list'` brukes i stedet.
  - **Steg 5 (responsivt):** `@media(max-width:720px)` stabler kolonnene (Kalkulasjon øverst); to
    kolonner side-ved-side på desktop.
- Verifisert for parse + render + logikk i preview (to-kolonne-render, teal/lilla i lyst+mørkt tema,
  responsiv stabling på 375px, bro-trigger-matrise) — ingen JS-feil. Innlogget ende-til-ende-test av
  selve bro-klikket (mot ekte vunnet list-prosjekt) gjenstår hos Kenneth.

**Fil:** romtegner.html + `docs/endringslogg.md`. Spec: `spec-dashboard-intensjon-kalkulasjon-prosjektering.md`.

---

## To-akse prosjektstatus (salg + leveranse) + P2/P3 — 2026-07-14

Innfører to uavhengige statusakser som erstatter den blandede statusaksen i UI: **`sales_status`**
(salgstrakt: under_arbeid → tilbud_sendt → vunnet/tapt) og **`delivery_status`** (leveranse, aktiv kun
ved `vunnet`). Løser feilrettet dok-varsel (leverandør ble maset på om dokumentasjon), rydder hovedliste
+ Dokumentasjon-fanen, og skiller «regnet på» fra «faktisk fått». Rolle leses fra
`organizations.org_type` (`installer`/`supplier`) — aldri antatt. Gammel `status`-kolonne røres ikke
(bakoverkompat). Ingen RLS-endring. Migrasjon + smart backfill kjørt manuelt i Supabase.

- **`1b81e2f` — Steg 1–6 + 5b.**
  - **Steg 1 (DB):** `supabase-migration-project-status.sql` — nye kolonner `sales_status`
    (NOT NULL default under_arbeid, CHECK), `delivery_status` (CHECK), `lost_reason`,
    `status_changed_at` + delvis indeks `(org_id, sales_status) WHERE sales_status <> 'tapt'` +
    backfill. `supabase-backfill-sales-status.sql` — smart mapping fra gammel status
    (ready_quote→tilbud_sendt, completed→vunnet, archived→tapt).
  - **Steg 2 (hovedliste):** nye `SALES_STATUSES`/`DELIVERY_STATUSES`/`LOST_REASONS`; 4-verdi salgs-chip;
    «Aktive»-default skjuler tapt + ferdige leveranser; «Alle statuser» henter alt; statistikk-kort,
    kundekort og batch-status mappet til akse A.
  - **Steg 3 (dashboard-kort):** rollegated «Å gjøre nå»-kort — installatør «X må dokumenteres»
    (`delivery_status='montert_venter_dok'`), leverandør «X klar for levering»
    (`klar_for_levering`). Fjernet gammel warranty-cert-heuristikk (`_fetchDashDocGaps`/`_dashDocGapIds`).
  - **Steg 4 (Dokumentasjon-fanen):** viser kun `sales_status='vunnet'`; fanen skjult for leverandør.
  - **Steg 5 (auto-overganger):** priset PDF-eksport → `tilbud_sendt` (betinget, kun fra under_arbeid);
    `vunnet` → aktiver akse B (klar_for_montering/klar_for_levering etter rolle); garanti signert →
    `delivery_status='ferdig'`. Sentral skriver `_setProjectStatus(id, patch, cond?)` +
    `_applySalesTransition`. Alt stempler `status_changed_at`.
  - **Steg 5b (manuell leveranse):** knapper på vunne prosjekter i lista — Start montering / Ferdig
    montert (installatør) og Marker levert / Marker ferdig (leverandør), så dok-varselet faktisk kan
    trigges. `_deliveryNextAction`/`_deliveryCellHtml`/`_advanceDelivery`.
  - **Steg 6 (tapt):** hurtigvalg-overlay for valgfri `lost_reason` (pris/tid/konkurrent/kunde_utsatt/
    annet) når et prosjekt tapes; ryddes automatisk hvis prosjektet flyttes ut av tapt.
- **`d4fe350` — P2 + P3.**
  - **P2 (salgs-nudge):** nytt «Å gjøre nå»-kort «X tilbud har ventet >14 dager — følg opp?» basert på
    `sales_status='tilbud_sendt'` + `status_changed_at` (ny `_statusChangedAt` i cachen); `_isStaleTilbud`
    (14-dagers terskel); `'tilbud'`-filternøkkel i lista.
  - **P3 (pipeline-statistikk):** «Vinnrate»-kort (`vunnet/(vunnet+tapt)`) + tapt-årsak-oppsummering som
    tooltip på Tapt-kortet (utnytter `lost_reason`).
- Verifisert for parse + logikk i preview (filter-matrise, rolle-gating, auto-overganger, stale-tilbud,
  vinnrate-matte, årsaksbryting) — ingen JS-feil. Full innlogget ende-til-ende-test gjenstår hos Kenneth.

**Fil:** romtegner.html + `supabase-migration-project-status.sql` + `supabase-backfill-sales-status.sql`
+ `docs/endringslogg.md`.

---

## Label v2 for kabel + matte (låst valg + flytt/skaler/roter) — 2026-07-13

Utvider label-v2-modellen (fra folie, `f508aae`) til kabel- og matte-labels. Delt gizmo trukket ut i
`_drawLabelGizmo` + `_hitLabelHandlePts` (orientert boks + rundpil-roter + X-skaler), brukt av alle tre.
Felles prinsipp: LÅST label-valg (kun labelen markeres, ingen lag-sykling), egne markører/cursors
(boks→move, X→crosshair, rundpil→grab), grabOffset (ingen hopp), verden-basert + PDF-arvet,
«tilbakestill til auto». De tre låsene (`selectedLabelStripId`/`CableId`/`MatId`) er gjensidig utelukkende.

- **`cb85211` — Kabel-label v2 (Del A).** Ny `S.ui.selectedLabelCableId`; ny `cable.labelRotation`/
  `labelScale`; `drawCables` + `_drawCableLabelOnly` roterer/skalerer boksen og lagrer `_cableLabelGeom`
  (orientert) + akse-justert AABB. Klikk låser (før syklingen → ingen lag-sykling); body-drag beholder
  grabOffset; `drawCableLabelHandles`/`hitCableLabelHandle`/`resetCableLabel`. Seeder `labelPos` fra
  FAKTISK tegnet senter → fjerner et ~70px hopp som fantes i den gamle kabel-drag-init-en.
- **`e8cdd45` — Matte-label v2 (Del B).** Matte-labelen (matPath) hadde INGEN interaksjon før (fast
  hjørne-tekst). Bygget hele v2 fra bunnen: `_drawMatPathObj`-labelen ble sentrert 2-linjers boks
  (produktnavn + «Tegnet X m · m² · rull Y m») ved `mp.labelPos`, verden-basert font, med rotasjon
  (`mp.labelRotation`) + skala (`mp.labelScale`); `_matLabelGeom`/`_matLabelBounds`, `hitMatLabel`/
  `hitMatLabelHandle`/`drawMatLabelHandles`/`resetMatLabel`, drag + handle-drag wiret i
  mousedown/mousemove/mouseup, `S.ui.selectedLabelMatId`. Bonus-fiks: `_resetProjectState` manglet
  `nextMatPathId` i `S.counters` → frihånds-matter i NYE (u-lastede) prosjekt fikk `id=NaN` (brøt
  seleksjon); lagt til.
- Verifisert live (ekte events, dummy `_supabaseProjectId` → ingen junk-prosjekter): begge låser uten
  hopp (0px), body-drag/roter/skaler drift 0 (89°, 2×); cursors move/crosshair/grab; reset + Escape;
  folie/kabel/matte-lås gjensidig utelukkende; lag-sykling for strip/kabel/rom intakt; ingen JS-feil.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Folie-label v2 — låst valg + egne markører (flytt/skaler/roter) — 2026-07-13

Erstatter den forrige gizmo-tilnærmingen med en klarere, label-sentrert modell. Kun varmefolie;
kabel-/matte-label med samme prinsipp holdes til en senere del.

- **`f508aae` — låst label-valg + egne markører.** Rotårsak (verifisert): labelen manglet et eget
  «valgt»-state — klikk startet bare et utsatt dra uten seleksjon/håndtak, og håndtakene lånte
  `selectedStripId`, som gjorde strip-body klikkbar/syklende → forvirrende «lag-bytting».
  - **Del 1 (lås):** ny UI-state `S.ui.selectedLabelStripId`. Klikk på label låser den (KUN labelen
    markeres, `selectedStripId` urørt); gjentatte klikk holder den låst og lag-syklingen kjøres aldri
    (returnerer i label-grenen). Klikk tydelig UTENFOR labelen, Escape, eller klikk på et annet objekt
    → forlater det låste valget og går videre til normal seleksjon/sykling.
    `drawStripLabelHandles`/håndtak-hit nøkler nå på `selectedLabelStripId`.
  - **Del 2 (markører + cursors):** boks-hover → `cursor:move`; SKALER = lite KRYSS (X) i hjørnet,
    hover → `crosshair` (var firkant/`nwse-resize`); ROTER = liten rundpil over boksen, hover →
    `grab`.
  - **Del 3 (lagring/tilbakestill):** `resetStripLabel` virker på den låste labelen; Escape/utenfor-
    klikk nullstiller låsen. `labelPos`/`rotation`/`scale` er alt verden-basert + lagret + PDF-arvet;
    grabOffset (ingen hopp) beholdt.
  - Verifisert live (ekte events): klikk låser (`selStrip=null`), gjentatt klikk holder, utenfor/
    Escape/strip-klikk forlater; cursors move/crosshair/grab; body-drag offset 0 (ingen hopp), roter
    senter-drift 0 (89°), skaler senter-drift 0 (2×); reset nullstiller. Lag-sykling for strip/rom
    intakt (label ikke i kandidatstacken); kabel-/matte-label uendret.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## «Å gjøre nå»-rydding + varmekabel-label (innhold + størrelse) — 2026-07-13

- **`e4a5e11` — fjern «romtype» og «effekt & gulv» som «venter»-kriterier.** De to stegene ble lest
  feilaktig som feilmeldinger i «Å gjøre nå». Fjernet helt fra fremdriftsberegningen (ikke bare kort-
  etikettene): `_projectProgress.steps` er nå kunde → tegning → produkter → dok, prosent regnes over de
  fire, og `nextStep` faller til `produkter` etter `tegning`. `_TODO_LABELS` + `_TODO_ORDER` renset for
  `rom`/`effekt`. Et prosjekt med tegning men uten varmeelement havner nå riktig under «mangler
  prosjektering» (forsvinner ikke). Arbeidsflyt-stripen (STEG 7) mister også Rom/Effekt-chips → Kunde ›
  Tegning › Produkter › Dokumentasjon › Send til montør (default per prompt). Gamle prosjekter med
  utdatert stemplet `_prog.next='rom'/'effekt'` vises ikke som kort (defensiv `_TODO_LABELS[next]`-guard)
  og re-bucketes ved neste lagring. Verifisert live: tegnet rom uten romtype/produkt → next='produkter';
  ingen JS-feil; dashboard uten «mangler romtype/effekt»-kort.
- **`7c17d9d` — varmekabel-label: linje 2 = flate/BTA/CC + størrelse lik folie.** Gjelder alle kabeltyper,
  begge label-veier (`drawCables` + `_drawCableLabelOnly`). (1) Linje 2 viser nå «W/m² flate · W/m² BTA ·
  CC … cm» i stedet for «lengde · total W · CC» — verdiene hentes fra allerede beregnede felt i
  `_computeRoomStats` (flate = `cableLenM>0 ? cableWm2 : wm2Heated`, BTA = `wm2Total`); lengde/total-W kun
  fjernet fra label, ikke fra materialliste/spesifikasjon. Linje 1 (produktnavn) beholdt. (2) Fast 13px-
  font byttet til folies verdensbaserte `LABEL_FONT_CM*(zoom*BASE_SCALE)` med 6px skjerm-gulv + proporsjonal
  boks-metrikk → kabel-label nå like diskré/stor som folie-label. Verifisert live (auto-lagring stubbet for
  å unngå junk-prosjekter): rendret label = «InFloor 17T 170W 10m» / «139 W/m² flate · 196 W/m² BTA · CC
  12.2 cm»; per-linje-høyde identisk med folie (18.2px @ zoom 1.4); ingen regresjon i folie-/matte-label.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Fire fikser — matte-stopp · folie-label-gizmo · Toppgulv-stepper · kabel-målsett — 2026-07-13

Kø av prompt-fil-oppgaver, hver med «finn rot-årsak først». Rotårsakene ble verifisert i innlogget
app med ekte events/målinger (der mulig), ikke bare kodelesing.

- **`7a7874e` — frihånds-matte avslutter pålitelig på klikk på stopp-tegnet.** Rotårsak (verifisert):
  IKKE hit-rekkefølge (stopp sjekkes alt før ghost-commit), men for trang treffsone — markør r=9px,
  treffradius bare 12px → avslutt-klikk noen px utenfor falt gjennom til «legg neste bane». Reprodusert:
  13/20px fra senter la bane; 0/8/11px avsluttet. Fiks: markør r 9→11, treffradius 12→20px; tilgivende
  avslutning (klikk ved fri ende uten reell bane avslutter); `resizeCanvas()` ved `_matFreeStart` så
  skjerm↔verden-treffet stemmer hele økta. Ingen regresjon i utlegging/EcoMat-auto.
- **`1e2d4ad` — folie-label roter/skaler hopper ikke lenger.** Rotårsak (verifisert, avvek fra prompt-
  hypotesen): body-draget hadde alt korrekt grep-offset; hoppet lå i roter/strekk-håndtakene som satte
  `labelRotation`/`labelScale` men aldri `labelPos` → manuell render-gren ankret på foliesenter og labelen
  hoppet −175px. Fiks: seed `labelPos` fra gjeldende `_stripLabelGeom`-senter ved håndtak-grep. Polering:
  distinkte gizmo-cursors (roter=grab, strekk=nwse-resize, body=move). Verifisert: drift 0px (var −175),
  body-drag/klikk ingen regresjon.
- **`84fc50d` — Hurtig prosjektering: «Toppgulv» får ▲▼-stepper + pil opp/ned.** Toppgulv-feltet var et
  rått `<select>` uten stepper (+ gjenbrukte `li-floor-${rid}` → kolliderte med Etasje). Nå via samme
  `sel()`/`_listStepSelect`/`_listKey`-mønster som naborutene: egen nøkkel `ftype` (id `li-ftype-${rid}`,
  rydder også duplikat-id-en), ▲▼-stepper, pil opp/ned (ned=neste, opp=forrige), Tab flytter uten å endre,
  ender klamper likt. Verifisert live; ingen regresjon i de andre stepperne.
- **`5207140` — kabel-rommets målsett like tett på rommet som folie-rommet.** Rotårsak (verifisert mot
  sammenligningsbilde): rom-mål-linjene (blå, `_drawDimAnnotationsForRoom`) skyves ut for å klarere
  produkt-kjeden, men bidraget var ulikt per modul — folie 52 cm, kabel/matte 32+65 = 97 cm (≈ dobbelt så
  langt). Fiks (folie = fasit, én felles konstant): `DIM_BASE_CM=32 + DIM_CHAIN_CLEARANCE_CM=20` pr. aktiv
  produkt-kjede → folie uendret (52), kabel/matte nå også 52. Gjelder alle sider; tallverdier urørt.
  Verifisert: to rom side-ved-side, begge 52 cm.

**1:1-verifisering i innlogget app (ekte events/toggles, fler-stegs — 2026-07-13):**
- **Folie-label-gizmo (`1e2d4ad`):** reelt rom + FlexFoil-strip, valgt så gizmoen vises; drev ekte
  `mousedown`→N×`mousemove`→`mouseup` på canvas. Body-drag: grep-punktet låst under cursoren i alle
  4 steg (grep-offset holdt 0,0 → ingen hopp). Roter: senter-drift 0 gjennom 4 vinkler (30/75/120/
  200°), `labelRotation` følger draget. Strekk: `labelScale` proporsjonal (1.5×→2.2×→3.0×), senter-
  drift 0 (skalerer fra senter). «Tilbakestill til auto» nullstiller pos/rotasjon/skala → auto −90°.
  Kjernefiksen bekreftet: roter/strekk startet fra AUTO-label (uten labelPos) og driftet 0 (var −175).
- **Kabel-målsett (`5207140`):** to identiske 300×200-rom med ekte toggle-funksjoner
  (`_toggleRoomDimSnap` + `_toggleStripDimSnap`/`_toggleCableDimSnap`); begge rom-mål på 52 cm, blå
  streker like langt fra begge rom i skjermbildet. Strip+kabel-rom stabler til 72 cm (egen 20 cm-
  klaring pr. kjede). Avgrensning: testet den flaggdrevne rom-mål-offsetten, ikke med ekte kabel-
  geometri (oransje produkt-kjeder er uendret 25 cm).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## UX-arbeidsflyt STEG 6-justering — «Tegn opp rom»-kort → alle fire tegnemetoder — 2026-07-13

Prompt-oppdatering til empty-state-kortet: den gamle teksten («Tegn rom» / «Klikk to hjørner på
lerretet») beskrev bare én av fire tegnemetoder, og klikk tvang rektangel-modus.

- **`65a85c9` — «Tegn opp rom»-kortet fører til lerret med alle fire metoder.** Tittel «Tegn rom»
  → «Tegn opp rom», undertittel «Klikk to hjørner på lerretet» → «Rektangel, polygon, L-form eller
  vegg-for-vegg». `_emptyDrawRoom()` tvinger ikke lenger rektangel (`abStartDraw('rect2')`), men
  skjuler startvalget til et tomt lerret der alle fire tegnemetodene (Rektangel/Polygon/L-form/WBW)
  ligger klare i verktøylinja — uten aktiv modus. Ny session-flagg `_emptyStateDismissed` skjuler
  startvalget uten `drawMode` og hindrer at en re-render viser det igjen; nullstilles i
  `_resetProjectState` så nytt/åpnet tomt prosjekt viser startvalget på nytt. Verifisert live: kort-
  tekst oppdatert; klikk → overlay skjult, `drawMode=null`, alle fire verktøy tilgjengelige;
  re-render viser ikke overlay igjen; gjenåpning av modul viser startvalget på nytt (ingen regresjon).

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## UX-arbeidsflyt STEG 4-fiks — token-basert søk på tvers av felt — 2026-07-13

Ende-til-ende-verifisering av hele STEG 1–7-serien i innlogget app (preview) avdekket én reell
defekt i STEG 4-søket; resten av serien fungerte som spesifisert.

- **`74243ee` — STEG 4-fiks: token-basert kryssfelt-søk.** `_filterProjectsList` gjorde
  `hay.includes(search)` — en sammenhengende delstreng-match — i stedet for det tokeniserte
  kryssfelt-søket spec-en krever. Følgen var at flerords-søk der ordene traff *ulike* felt ga
  0 treff (`leir askøy`, `park alt`). Fikset til å splitte søket på whitespace og kreve at HVERT
  token finnes et sted i den samlede feltstrengen (`tokens.every(t => hay.includes(t))`).
  Rekkefølge-uavhengig og på tvers av felt. Verifisert live mot ekte data: `leir askøy` /
  `askøy leir` → *Leirvikåsen 11*; `park alt` → *Parkveien 3*; enkelt-token + sammenhengende søk
  fortsatt OK.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## UX-arbeidsflyt — STEG 1–7 (fremdriftsmodell, dashbord + tegneskjerm) — 2026-07-10

Stegvis serie som gjør navigasjonen arbeidsflyt-orientert i stedet for funksjons-orientert. Alt
bakoverkompatibelt — dagens funksjons-nav (Inne/Ute/Trapp, Snap, Raster, Import) er urørt.
Verifisert i preview/headless med syntetiske prosjekter (innloggede flyter gjenstår for felttest).

- **`3fc6a80` — STEG 1: semantiske fargetokens.** Nye CSS-variabler i begge temaer: `--success`
  (grønn), `--danger` (rød), `--info` (blå); `--warn` (oransje) beholdt. Semantikk overalt framover:
  grønn=ferdig/ok, oransje=mangler/venter, rød=feil/avvik, blå=nøytral info. `_renderDashStats` +
  målings-/advarselvisning (`.doc-val.good/.bad`, portal-`cell()`) bruker tokens. «Pågår» gul→oransje.
- **`da7e0ca` — STEG 2: `_projectProgress` (ren funksjon, ryggraden).** 6-stegs sjekkliste (Kunde/
  Tegning/Rom/Effekt & gulv/Produkter/Dokumentasjon) med `done/todo/na` utledet fra prosjektdata +
  samlet prosent + neste steg. `_openProjectData()` gir lagret-JSON-view av åpent prosjekt. Endrer
  ikke `p._status`-enumen. Dok mates via `docStatus` (async/ekstern).
- **`9786d2b` — STEG 3: «Å gjøre nå» på dashbordet.** Handlingsliste øverst i prosjekt-fanen bygget
  på `_projectProgress`. Datastrategi «sammendrag ved lagring»: `_buildSaveData` stempler
  `project._prog`, `_fetchProjectList` plukker det ut → ingen ekstra geometri-fetch. Grupperte,
  klikkbare kort (mangler kunde/tegning/romtype/effekt/prosjektering + «må dokumenteres» via batch
  warranty-spørring); klikk filtrerer lista; tom → «Alt à jour».
- **`3217c2e` — STEG 4: ett samlet søk.** Slo sammen de to feltene (prosjekt + kunde) til ett;
  `_filterProjectsList` matcher fritt mot navn/adresse/ansvarlig/kunde/kontakt/ordrenr + lenket
  kunderad (navn/telefon/e-post). Status-/type-select beholdt.
- **`299e541` — STEG 5: adresse-autofyll + kunde-først.** `#dash-create-form` omordnet (Kunde →
  Kontakt → Navn → Adresse → Type → Ansvarlig; fokus på Kunde). Adresse-felt fikk Kartverkets
  gratis, nøkkelfrie API (`ws.geonorge.no/adresser/v1/sok`): `_addrSearch`→`_addrFetch`→dropdown,
  `_addrPick` fyller «adressetekst, postnr poststed». Feil/offline → ren fritekst (fallback).
- **`f51f213` — STEG 6: empty-state «Hvordan vil du begynne?» + PDF-drop + DWG.** `#canvas-empty-state`
  vises når aktiv etasje er tom (`_editorIsEmpty()`/`_updateEmptyState()` fra `render()`). 4 kort:
  Importer PDF + DWG/DXF (drop-soner → `_autoReadStart`; klikk → `_importPlanToDraw`), Tegn rom
  (`abStartDraw('rect2')`), Hurtig prosjektering (`addPart('list')`). Gjenbruker eksisterende
  import-/tegne-flyt. DWG-status (lumelo-backend): DXF nativt (ezdxf); native `.dwg` krever ODA
  File Converter (ikke installert) → feiler server-side, `.dxf` virker — kortet er ekte «DWG/DXF».
- **`0a182d8` + `10bc798` — STEG 7: arbeidsflyt-stripe i tegneskjermen.** Tynn `#workflow-stripe`
  (rad mellom `#topbar` og `#content`), `_renderWorkflowStripe()` fra `render()` med signatur-vakt,
  kun indoor-modul. Chips fra `_projectProgress` (STEG 1-farger) + accent «Send til montør». Klikk:
  Kunde → lettvekts info-modal; Tegning → `fitAll`/import; Rom → `selRoom`; Effekt/Produkter →
  `showUnifiedProductPanel`; Dok + Send → `showDocPanel`.

**Fil:** romtegner.html + `docs/endringslogg.md`.

---

## Folie-label — orientering + håndtak + folie-fyll + trofast PDF (Del A–E) — 2026-07-10

Oppfølger til folie-label-jobben. **Plan først** (geometri/orientering). Skjerm = PDF (samme canvas
via `_renderRoomToImage`). Verifisert headless/syntetisk; faktisk PDF-eksport gjenstår for felttest.

- **`8878657` — Del A: klikk flipper ikke lenger stående label flatt.** Rotårsak: et klikk satte
  `labelPos`, og den manuelle grenen tegnet alltid horisontal boks → stående folie flippet. Fiks:
  manuell gren respekterer lengderetning (`dir==='v'` → rotér −90°); `labelPos`+undo utsatt til reell
  drag (>4 px), så et klikk endrer ingenting.
- **`dca6551` — Del B: folie-fyll-farge + forplantning til like artikler.** Nytt `strip.fillColor`
  + prosjekt-standard `S.varmefolie.fillColor` (`drawStrips` netto-fyll via `_resolveFillColor`).
  Farge-panelet fikk «Folie-farge»-spor + omfangsvelger (`_colorScope`: Dette rommet / Denne etasjen
  / Hele prosjektet). Fargeendring forplanter til alle strips med samme `productId` innen omfang
  (`_applyColorToScope`/`_stripsInScope`); B=140 aldri berørt når B=100 endres. Undo pr batch.
- **`41f0908` + `62c0cc2` — Del C: manuelle håndtak (roter/strekk/flytt).** C1: `_drawStripLabel`
  støtter vilkårlig `strip.labelRotation` (deg) + `strip.labelScale`; lagrer orientert boks-geometri.
  C2: `drawStripLabelHandles()` tegner orientert boks + rotasjonssirkel + strekk-firkant for VALGT
  label; `hitStripLabelHandle` sjekkes før label/strip (kun valgt → ingen kollisjon). Roter =
  atan2+90° med snap 0/90/180/270 (Shift=fri); strekk = avstand-ratio → skala 0.5–4×.
  «Tilbakestill til auto» nullstiller pos+rotasjon+skala.
- **`67a2ec7` — Del D (punkt 5): trofast PDF — verdensbasert label-størrelse.** Fjernet den
  hardkodede PDF-fonten (clamp 30–40px). Ny KONSTANT verdens-fonthøyde `LABEL_FONT_CM=5.0`,
  `fontSize = LABEL_FONT_CM × (zoom×BASE_SCALE)` → uniform («like store») OG label:rom-forhold
  IDENTISK skjerm↔PDF. Boks-metrikk (lineH, padding, radius, mono-font) gjort proporsjonal med
  fonten. `labelScale` ganger fonten → strekk/rotasjon printer trofast. Verifisert: forhold identisk
  ved skjerm-skala vs PDF-lik skala (før: ~3× avvik).
- **`fa4c647` — Del E (punkt 6, valgfritt): auto-label overlapp-nudge.** Overlappende AUTO-bokser
  dyttes fra hverandre langs lengderetningen (re-klemt i rom) via `_nudgeAutoLabel`/
  `_placedAutoLabelBoxes`; manuelt plasserte labels røres aldri. «Hold roterte auto-bokser i rom»
  var alt dekket av `clampInside`.

**Fil:** romtegner.html.

---

## Folie-label — hold i rom + breddebevisst + drag + farge (Del 1–4) — 2026-07-10

Forbedret varmefolie-labelen (navn + lengde·W) på tegning + PDF. **Plan først** der geometri berøres.

- **`9089a49` — Del 1+2: hold hele labelen i rommet + breddebevisst layout.** Rotårsak: labelen ble
  tegnet INNE i `ctx.clip('evenodd')` (rom minus hindringer) → boksen ble kappet ved romkant
  («xFoil…»). Fiks: labels tegnes i eget pass ETTER strip-løkka, UTENFOR klippet; ny `_drawStripLabel`
  klemmer hele boksen innenfor rom-polygonet (`_pipScr`/`_boxFitsPoly`/`_centroidScr`). Breddebevisst:
  to-linjers → én-linjes → callout (leder-strek til folie) når folien er for smal.
- **`e21a629` — Del 3: flyttbar label (drag) med varig effekt.** `strip.labelPos` + `hitStripLabel`
  + drag-wiring (speiler kabel-labels). Manuell boks m/ leder-strek; «↩ Tilbakestill label til auto»
  i høyreklikk. Persistens gratis (strip-spread ved lagring, `S.strips = data.strips` ved last).
- **`9676fd5` — Del 4: farge pr label + prosjekt-standard.** `strip.labelColor` (bakgrunns-hex, tekst
  auto-kontrast) + prosjekt-default `S.varmefolie.labelColor`. Kuratert 8-fargers palett, «🎨 Farge»-
  chip → `#label-color-panel` (pr-label + prosjekt-standard, «A»=Auto).

**Fil:** romtegner.html.

---

## Tilbehør: manuelt tilbehør faller ikke ut av materiallisten — 2026-07-10

- **`ec8ea07` — FlexFoil tang (og andre manuelle) kom ikke med i PDF-en.** Bug: manuelt tilbehør
  (avhuket AV som standard) hadde antallsfelt = 0. Huket montøren PÅ tangen uten å skrive et tall,
  ga `readRow` qty=0 → droppet (krever qty>0) → «FlexFoil tang» kom ikke med under «Tilbehør
  varmefolie». Fiks: manuelt tilbehør starter antallsfeltet på **1** (ikke 0); `readRow` teller
  avhuket manuelt tilbehør med tomt/0 antall som minst 1 (avrundet til `roundTo`) → faller aldri ut.
  Auto-tilbehør uendret (0 = ikke med). Verifisert på ekte PDF.

**Fil:** romtegner.html.

---

## Frihånds-varmematte — felttest R2–R6 (flukt-invariant + robusthet) — 2026-07-09

Felttest-forbedringer på frihånds-matte-verktøyet (`S.matPaths`, `_matFree*`/`drawMatPaths`/
`_drawMatPathCable`). Låste kabelregler (buesving = halvsirkel cc/2, ingen Y-splitt) intakt.

- **`e4e976a` — R2 #1: kabel ≥5 cm fra vegg + hindring, ingen matte utenfor rommet.** `_matFreeCableMarginCm`
  (5 cm innendørs / 0 snø), draw-time klamp (`clipScanlineToPolygon` + hindring-bbox) i `_matFreeCandidate`,
  render-klamp av kabel-strenger.
- **`8220726` — R2 #2: sammenhengende kabel med flukt-skjøt.** Én ubrutt kabel over alle bredder:
  strengene på et GLOBALT rutenett (full lane-kant + cc/2, steg cc) → nabobredder linjerer; skann-retning
  veksler pr bredde → siste streng møter første i neste rett over (flukt-`lineTo`, ikke U-sving).
- **`9352b3d` — R2 #3: vis tegnet lengde ved siden av valgt matte** («Tegnet X m → EcoMat … (rull Y m)»).
- **`e0147a8` — R3 #1: hold hele matta i rommet.** Start flyttet til NET/2 fra vegg + perpendikulær klamp
  i `_matFreeCandidate` (move.len=0 hvis lanen ikke får plass i tverr-retning).
- **`b0df3e6` — R3 #2+#3: flukt-retning (rett side) + ortogonal skjøt.** Skann bredden fra enden nærmest
  forrige utgang (`prevExitW`); L-forbindelse følger kant (aldri diagonal luftlinje).
- **`c994aa6` — R3 #1-rettelse: retningsavhengig start.** ½ cc mot kortside (bane-enden), 5 cm mot langside
  (50 cm-kanten) via `_matFreeStartFor(room,prod,axis)`.
- **`e0bea3a` — R4: kaldskjøt ved reell start + serpentin flukter mot neste.** Første breddes serpentin ordnes
  fra bane.a (`entryRef`); strand-paritet orientert ut fra neste breddes tverr-posisjon (`rNext`).
- **`4ee0823` — R5: fjern forbindelseskabel + valgbart start-hjørne.** Skjøt-connector → `moveTo` (hver
  serpentin for seg); `S.varmefolie.startCorner` (bl/br/tl/tr) generalisert med velger i matte-panelet.
- **`c53d909` — R6: varig flukt-invariant.** Fast regel i kabel-genereringen: hver bredde STARTER mot forrige
  (`entryHi` fra `prevExitW`) og ENDER mot neste (`exitHi` fra `rNext`) → skjøtene møtes alltid flush på delt
  kant, uansett retning/start/hjørne. Paritet-fiks kutter ±1×CC (Nuse=N−1) hvis utgangssiden blir feil.
  Erstatter R4-logikken (som bare styrte exit → feil entry-side).

**Fil:** romtegner.html.

---

## EcoMat matte — Del 3: eksakt mattelengde (N−1 like + kortere siste) — 2026-07-08

Auto-utlegget legger nå ut HELE rullelengden: **N−1 like bredder** (`Lc = ceil((total/N)/raster)·raster`) +
**1 kortere siste** (`last = total − (N−1)·Lc`) → summen = nøyaktig mattelengden. Tidligere ble N like
bredder snappet NED → for lite (f.eks. 9,6 av 10 m).

- **Datamodell:** nytt nullbart felt **`last_run_length_cm`** på matte-objektet (minst-invasivt; beholder
  ubrutt kabel — ikke eget matte-objekt). `num_runs` = N.
- **drawMats:** siste bane tegnes kortere (rektangel + serpentin med færre strenger), forankret i skjøt-enden
  (up-bane → bunn, down-bane → topp) så første streng flukter; kort ende = kald sone.
- **Kalkyler:** ny `_matLaidLengthCm(mat)` = `(N−1)·length_cm + last` brukt i areal/kabel/effekt/materialliste
  (`_computeRoomStats`, `_matRatedW`, PDF- + Excel-matList, info-panel, ctxbar, overskudds-varsel).

Verifisert (300×220, EcoMat 60T 0.5×10m, raster 24): **3 × 2,64 m + 1 × 2,08 m = 10,00 m**; areal 5,0 m²;
ctxbar «10,0/10,0m»; ingen overskudds-varsel. Regresjon: matte uten `last_run_length_cm` (manuell/snø/normal)
uendret. Buesving/flukt-skjøt/ingen Y-splitt intakt.

**Fil:** romtegner.html (`autoFillMatSerpentine`, `drawMats`, `_matLaidLengthCm` + kalkyle-steder).

---

## EcoMat matte — Del 2: kaldskjøt- + ende-markør — 2026-07-08

I `drawMats` fanges kabelens **startpunkt** (første `moveTo`) + retning og **endepunkt** (`pen`). Etter
`ctx.stroke()` tegnes OVER kabelen: **kaldskjøt** = sort strek (`#111`, tykkere enn kabel, ~8 cm langs første
streng, rund cap) ved start, og **ende-markør** = liten fylt sort sirkel ved siste strengs slutt. Én av hver
per sammenhengende matte-kabel (auto/manuell/snø, delt `drawMats`).

Verifisert (instrumentert canvas): nøyaktig 1 kaldskjøt-strek + 1 ende-fyll per matte.

**Fil:** romtegner.html (`drawMats` — start/slutt-fangst + markør-tegning).

---

## EcoMat matte — Del 1: serpentin-retning (venstre→høyre) — 2026-07-08

Fikset at kabelen startet på høyre ytterste matte og at matte 2 snudde feil vei. I `drawMats()`-serpentinen:
`const r = numRuns-1-vi` → **`const r = vi`** (venstre→høyre, kabel starter nederst-venstre) og
`startHi = jj%2===0` → **`startHi = jj%2===1`** (første streng starter venstre → første sving på høyre).
Buesving (halvsirkel cc/2) og flukt-skjøt urørt — låste kabelregler intakt. Gjelder auto/manuell/snø
(delt `drawMats`); ingen duplikat i PDF (mat-serpentinen finnes kun ett sted).

Verifisert: 412×253 med EcoMat 150T (8 baner) → ren serpentin, halvsirkel-U-svinger, flukt-skjøter,
ingen Y-splitt.

**Fil:** romtegner.html (`drawMats` serpentin-blokk).

---

## Leverandør-branding — Del 5: superbruker «vis som» — 2026-07-07

Superbruker kan vise appen **som en valgt org** (elektrobedrift eller leverandør) — branding + produkt-
tilgang + meny — uten å endre innlogging. Siste del av branding-featuren; hele Del 1–5 er nå komplett.

- `_viewAsOrg` (full org-objekt) + `_effectiveOrg()` som allerede brukes av branding (header + PDF).
  **`_productVisibleToOrg` bruker nå `_effectiveOrg()`:** superadmin uten «vis som» ser alt; med «vis som»
  gjelder valgt org sine regler (leverandør → kun egne produkter; installatør → alle).
- Avatar-meny (kun superadmin): **«Vis som…»** → `_viewAsPicker` (modal med alle orgs + type-badge) →
  `_viewAsSet`; **«Avslutt vis som»** når aktiv. Oransje topp-banner «👁 Viser som: <org> — avslutt»
  (`_viewAsBanner`). `_viewAsRefresh` re-rendrer branding + produkt-chips + panel + sidebar + ctxbar.
- Vanlige brukere ser aldri «vis som». RLS uendret (superadmin ser bredt uansett; «vis som» filtrerer
  visning/branding klient-side).

Verifisert: superadmin ser alt → vis som Cenika skjuler Varmecomfort (branding+gating+banner) → vis som
installatør ser alt → avslutt gjenoppretter. Script parser OK (node-sjekk).

**Fil:** romtegner.html (`_viewAsOrg`/`_viewAsPicker`/`_viewAsSet`/`_viewAsEnd`/`_viewAsBanner`,
`_productVisibleToOrg`, avatar-meny).

---

## Leverandør-branding — Del 4: app-header (co-brand i verktøylinja) — 2026-07-07

`_applyAppBranding()` brander editor-verktøylinja (`.tb-logo`): **[org-logo] Varmeplan** når «I appen»-flagget
er på + logo finnes; ellers nøytral «Varmeplan». Bruker `_effectiveOrg()` så superbruker «vis som» (Del 5)
også brander headeren. Kalles etter `_loadOrgBranding` (login/org-bytte) og fra branding-panelets toggler.

Verifisert: nøytral → «Varmeplan»; logo + «I appen» på → `<img>` (branding-URL) + «Varmeplan»; «I appen» av
→ nøytral igjen. (Dashboardets store «Varmeplan»-tittel er ikke brandet — mulig senere utvidelse.)

**Fil:** romtegner.html (`_applyAppBranding`, `_loadOrgBranding`).

---

## Leverandør-branding — Del 3: logo i PDF (forside/alle sider) — 2026-07-07

Org-logo (co-brand) i **prosjekt-PDF** (`exportPDF`) og **garanti-PDF** (`_docBuildPDF`) iht. plasserings-
flaggene. Nøytral Varmeplan-fallback når ingen logo/flagg.

- `_pdfBranding()` (async) laster org-logoen til data-URL via `_loadLogoImage` (canvas-rasterisering, takler
  PNG/JPG/SVG), cacher `_pdfBrandCache`. `_pdfStampBranding(doc, M)` stempler etterpå: **forside** = logo
  øverst til høyre (forsiden har allerede «VARMEPLAN»-tekst → ingen dobbel), **øvrige sider** = logo + liten
  «Varmeplan» når «Alle sider» er på.
- `exportPDF`: `await _pdfBranding()` før bygging, `_pdfStampBranding` før `save`. Garanti: `await _pdfBranding()`
  før den sync `_docBuildPDF`, som stempler før `doc.output('blob')`.
- `_effectiveOrg()` innført (returnerer `_userOrg` nå; «vis som»-org i Del 5).

Verifisert: funksjoner definert; ingen logo → `_pdfBranding` = null (nøytral, ingen regresjon); stempling
kjører feilfritt på fler-siders doc med begge flagg. Ekte logo på PDF testes etter at Del 1-migrasjonen +
opplasting er gjort.

**Fil:** romtegner.html (`_pdfBranding`/`_pdfStampBranding`/`_loadLogoImage`/`_effectiveOrg`, `exportPDF`, `_docBuildPDF`).

---

## Leverandør-branding — Del 2: admin-panel (logo-opplasting + plassering) — 2026-07-07

Ny «Logo & branding»-fane i org-admin-panelet (for alle orgs — leverandør + installatør; gated owner/admin +
superadmin som før). Last opp / bytt / fjern logo (PNG/JPG/SVG, maks 2 MB) → `branding`-bucket
(`<org_id>/logo.<ext>`, upsert) + `logo_path`/`logo_updated_at` på organizations. Forhåndsvisning viser
**co-branding: org-logo ǀ «Varmeplan»** alltid sammen. Tre plasserings-toggler (Forside PDF / Alle sider PDF /
I appen) lagres direkte på org-en.

- `_orgAdmRenderBranding`, `_brandingUploadLogo`/`_brandingRemoveLogo`/`_brandingSetFlag`, `_orgLogoUrl`
  (public URL + cache-bust på `logo_updated_at`).
- `_loadOrgBranding(orgId)` henter logo-kolonnene **separat og tolerant** (try/catch) etter org-resolve, så
  org-lasting ikke brekker om branding-migrasjonen ikke er kjørt ennå.
- Kaller `_applyAppBranding()` (kommer Del 4) via `typeof`-guard.

Verifisert: panel rendrer logo-boks + «Varmeplan» + «Last opp», 3 toggler reflekterer lagret state;
alle handler-funksjoner definert. Nøytral fallback («Ingen logo ǀ Varmeplan»).

**Fil:** romtegner.html (`_orgAdmRenderBranding` + branding-helpers, nav-item, `_loadUserOrg`).

---

## Leverandør-branding — Del 1: DB + Storage (logo + plasserings-flagg) — 2026-07-07

Første del av leverandør-/org-logo-branding. Kun DB/Storage — ingen app-kode ennå (så trygt å kjøre migrasjonen
uavhengig).

- **`organizations`** (baade leverandør- OG installatør-org kan ha logo): `logo_path`, `logo_show_cover`,
  `logo_show_allpages`, `logo_show_inapp` (default true), `logo_updated_at`.
- **Storage-bucket `branding`** (public read — logoer er ikke hemmelige → direkte URL i app + PDF).
- **RLS** på `storage.objects` for branding: skriv = superadmin ELLER owner/admin i org-en som eier stien
  (`<org_id>/…`); les = public. Superadmin-sjekk via `app_metadata` (aldri `auth.users`).

Prinsipp: **«Varmeplan» vises alltid sammen med org-logoen** (co-branding); ingen logo → nøytral Varmeplan.
`_effectiveOrg()` (kommer i Del 5) skal styre branding + produkt-tilgang for superbruker «vis som».

**Fil:** supabase-migration-branding.sql

---

## Aluboard: fullført DB-migrasjon (B5+B6) — 2026-07-07

Fullført `supabase-migration-varmecomfort-aluboard.sql`: alle **17 FLXHEAT 3 mm 8 W/m-kabler** som ferdige
`insert`-rader (m/watt/EL/nominell Ω, watt_per_m 8, 230 V, aluboard_cc_mm 100, bøyeradius 36 mm, maks 90 °C),
i tillegg til de 2 platene. Lagt til `price_list`/`cost_price`-mal (B6) med `update`-eksempler — faktiske
Varmecomfort-priser fylles inn fra prislista. Idempotent (guard på `el_no`). Kun DB-fil; app-koden
(fallback-seed) hadde allerede kablene.

**Fil:** supabase-migration-varmecomfort-aluboard.sql

---

## Aluboard: prosjekt-brede integrasjoner (A1–A4) — 2026-07-07

Koblet `S.aluboard` inn i de prosjekt-brede aggregeringene (var «silo» etter Del 1–6). Sentral helper
`_aluboardComponents(ab)` / `_aluboardRoomItems(roomId)` ekspanderer en Aluboard til rette plate + vendeplate
+ valgt FLXHEAT-kabel (med antall/meter/effekt); alt gjenbruker den.

- **A1 Materialliste/Bestilling/Tilbudspris (PDF + Excel):** Aluboard-produktene (12 rette + 12 vende + kabel)
  telles nå i eksportens materialliste, ordreliste og tilbudspris-ark.
- **A2 Effekt/areal:** `_computeRoomStats` + `_roomRatedEffectW` teller Aluboard (kabelens ratede effekt +
  areal = kabel_m / 10 fra fast CC 10). Rom med Aluboard viser nå riktig W i Prosjekt-/Romoversikt (ikke 0).
- **A3 Rom-detalj i sidepanelet:** «Varme (N)» lister nå Aluboard (klikk → velg).
- **A4 Rabatt per gruppe:** `_projectUsedProductIds`/`_roomProductBreakdown`/`_roomDominantProduct` inkluderer
  Aluboard → familiene «Aluboard» + «FLXHEAT 8W/m» får rabatt-felt i tilbudspris, og vises i Romoversikten.

Verifisert (rom 360×300): ratedW 720, totalW 720, heatedM2 8,6; breakdown = kabel (720 W) + 12 rett + 12 vende;
tilbudspris-grupper «Aluboard»/«FLXHEAT 8W/m». Andre moduler uendret.

**Fil:** romtegner.html (`_aluboardComponents`/`_aluboardRoomItems`/`_aluboardRoomEffectW`, `_computeRoomStats`,
`_roomRatedEffectW`, `_roomProductBreakdown`, `_roomDominantProduct`, `_projectUsedProductIds`, PDF- + Excel-
materialliste, sidepanel-liste).

---

## Aluboard platesystem (Varmecomfort) — Del 6: interaksjon + dok-kobling — 2026-07-07

Siste del: velg/slett + kobling av Varmecomfort-målregler til dok-/garantimodulen. (Lagring + undo/redo var
allerede på plass fra Del 1.)

- **Interaksjon:** `hitAluboard` (treff = punkt i feltet — rom-fyllende, så ingen «flytt»), `selectAluboard`
  (rydder andre seleksjoner, `S.ui.selectedAluboardId`), `deleteAluboard`, wiret inn i hit-syklusen
  (`_buildCycleCandidates`/`_applyCycleSelection`). Ctxbar for valgt Aluboard: **retning Vertikal/Horisontal**
  (`_aluboardSetDirSel` re-legger + beholder valg), kabel-lengde, **Slett**. Valgt felt får accent-omriss.
- **Dok/garanti — asymmetrisk toleranse:** ny `_supResistanceBounds(sup, nominal)` støtter
  `resistance_tol_minus_pct`/`plus_pct` (Varmecomfort **−5 %/+10 %**), faller tilbake til symmetrisk
  `resistance_tolerance_pct`. `_docMeasOk` + kravtekst + lo–hi-visning bruker den nå.

Verifisert: hit→velg fester, ctxbar (Aluboard/Vertikal/Slett), retning-toggle beholder valg, slett + undo;
VC-grenser for 73 Ω = 69,35–80,3 Ω («−5 %/+10 %»), måling 80 Ω OK / 68 Ω ikke OK; Cenika = ±10 %. Andre
moduler uendret. **Aluboard-modulen (Del 1–6) er nå komplett.**

**Fil:** romtegner.html (`hitAluboard`/`selectAluboard`/`deleteAluboard`/`_aluboardSetDirSel`, ctxbar-gren,
`_supResistanceBounds`, `_docMeasOk`).

---

## Aluboard platesystem (Varmecomfort) — Del 4+5: panel + materialliste + varsler — 2026-07-07

Panel-inngang og materialliste for Aluboard, wiret inn i den delte produktvelgeren (`_upcRefreshResults`
→ ny `aluboard`-gren). Modulen nås via «Aluboard»-produkttype-chip (rolle-gated: elektrobedrift +
Varmecomfort ser den, Cenika ikke).

- `_aluboardRenderPanel(container, roomId)`: **retning Vertikal/Horisontal** (eneste montørvalg) + «Fyll
  rom automatisk». Resultater: fast CC 10, flateeffekt ≈80 W/m², kabelbehov, valgt kabel ≤ behov (m + EL),
  effekt/motstand fra katalog.
- **Del 4 (kabelvalg):** største katalog-lengde ≤ behov (aldri mer kabel enn nødvendig), siste streng
  kappes (`restM`), og **kanttilfelle < 10 m** gir overskudds-varsel (grønn OK-boks ellers).
- **Del 5 (materialliste):** rett plate (EL 5402067) + vendeplate (EL 5402066) med «del plate på to»-
  telling, FLXHEAT-kabel (valgt m + EL), aluminiumstape (≈ (rette+vende)×1,2 m), byggplast «ved behov».

Verifisert (360×300 vertikal): behov 87,9 m → 86,0 m EL 1006058 · 720 W · 73 Ω; 12 rette + 12 vende;
overskudds-varsel ved 70×70 (behov 1,15 m < 10 m); chip gated (installatør+VC ja, Cenika nei). Andre
moduler uendret.

**Fil:** romtegner.html (`_upcRefreshResults`-gren, `_aluboardRenderPanel`, `_aluboardSetDir/FillRoom`).

---

## Aluboard platesystem (Varmecomfort) — Del 3: plater fyller feltet — 2026-07-07

Plater fyller HELE feltet i begge retninger: **vendeplater** (28 cm) i de to v-endene der kabelen snur,
**rette plater** (120 cm) imellom — kuttes i lengde. Kappede plater markeres stiplet i tegningen; kabelen
tegnes oppå platene.

- `_aluboardPlates(L)` → felt-koordinat-rekter per kolonne (2 vende-bånd + rette plater vA→vB), med `cut`-flagg.
- `_aluboardPlateCount(L)` → antall til materiallista med **«del plate på to»**: kolonne-remse < ½ plate →
  `ceil(n/2)`, rad-remse < ½ plate → `ceil(n/2)`, + hjørnebit. (Materiallista vises i Del 5.)
- `drawAluboard` rendrer nå platene (vende #f4e6db, rette #e6eef1, kappet = stiplet) UNDER kabelen.

Verifisert (rom 360×300 vertikal): plate-telling **12 rette + 12 vende** (fasit); 24 fysiske plate-rekter
(6 kolonner × 2 vende + 2 rette), 9 kappede. Renderer som mockup. Andre moduler uendret.

**Fil:** romtegner.html (`_aluboardPlates`, `_aluboardPlateCount`, `drawAluboard`).

---

## Aluboard platesystem (Varmecomfort) — Del 2: auto-geometri (kabel-serpentin) — 2026-07-07

Auto-geometri for Aluboard: én sammenhengende varmekabel-serpentin i de faste sporene (CC 10), U-svinger
som halvsirkler (radius CC/2 = 5 cm) i vendeplate-sonene, retning H/V (eneste montørvalg). Alt derivert
fra state (`_aluboardCompute(room, dir)` — ingenting lagret som piksler).

- Konstanter `_ALU` (EDGE 4, PLATE_W 60, RETTE_L 120, VENDE_D 28, CC 10, RUN_EDGE 5) fra mockup-fasit.
- `_aluboardCableCatalog` (FLXHEAT sortert), `_aluboardCompute` (felt/strenger/kabelbehov/valgt kabel),
  `_aluboardCablePath` (sammenhengende polyline, siste streng kappet ved budsjett = valgt kabel).
- `_aluboardAutoFill(roomId, dir)` lager S.aluboard-oppføring (én per rom); `drawAluboard()` tegner felt-
  omriss + serpentin i «Heating elements»-laget (etter drawPlates). `_aluboardsForRoom`.
- Bugfiks: `nextAluboardId` manglet i nytt-prosjekt-counters-reset + migrasjonsguard for lastede prosjekt.

Verifisert mot fasit (rom 360×300 vertikal): 35 strenger × 236 cm → **kabelbehov 87,94 m** → valgt
**86,0 m (EL 1006058, 720 W, 73 Ω)**, siste streng **1,94 m kortere** (shortLast), path = 86,0 m.
Renderer som mockup (én ubrutt kabel, halvsirkel-U-svinger). Andre moduler uendret.

**Fil:** romtegner.html (`_ALU`, `_aluboardCompute/CablePath/AutoFill`, `drawAluboard`, render-hook).

---

## Aluboard platesystem (Varmecomfort) — Del 1: leverandør + katalog + gating — 2026-07-07

Første del av ny modul for **Aluboard platesystem** fra leverandøren **Varmecomfort** (eget datasett, IKKE
Cenika). Kun data + tilgang + state-slot — ingen geometri/UI ennå.

- **State:** `S.aluboard = []` + `nextAluboardId`-teller; med i pushUndo/undo-restore, `_buildSaveData` og
  `_restoreProject` (lagres i prosjekt-JSON, tåler gamle prosjekt uten feltet).
- **Leverandør-gating (ny dimensjon i tegneverktøyet):** `_productVisibleToOrg(prod)` — en LEVERANDØR-org
  ser kun egne produkter (`p.supplier === org.supplier_name`); elektrobedrift + superadmin ser ALLE.
  Anvendt i `_upcScopeProducts` + `_upcRenderTypeChips`. Skjuler Varmecomfort for Cenika-org.
- **Katalog (fallback-seed `_ensureVarmecomfortProducts`):** kategori «Aluboard platesystem»
  (`module_type:'aluboard'`, `available_contexts:['indoor']`), 2 plater (rett 60×120 EL 5402067,
  vende 28×60 EL 5402066) + 17 FLXHEAT 3 mm 8 W/m-kabler (meter·watt·EL·nominell Ω). Type-chip-label «Aluboard».
- **Migrasjon:** `supabase-migration-varmecomfort-aluboard.sql` — asymmetrisk resistanstoleranse på
  `suppliers` (−5 %/+10 %, lengde ±2 %), Varmecomfort-rad, Aluboard-kategori, produkt-inserts (tilpass
  kolonnenavn).

Verifisert: gating (installatør ser alle, Cenika-org ser 0 Varmecomfort, Varmecomfort-org ser kun sine,
superadmin alle); 19 produkter seedet; EL 1006058 = 86 m/720 W/73 Ω (fasit). Andre moduler uendret.

**Fil:** romtegner.html (state, `_productVisibleToOrg`, `_ensureVarmecomfortProducts`), migrasjon.

---

## Tilbudspris: rabatt per produktgruppe (+ hierarki) — 2026-07-07

Utvidet den enkle globale «Rabatt %» i PDF-eksport til et **rabatt-hierarki**: produkt > gruppe >
leverandør > global (mest spesifikk vinner). Kjøperens rabatt, så den lagres på **prosjektet**
(`S.project.pricing`), ikke som produktegenskap — forhåndsutfylt neste gang.

Eksport-dialogen lister nå **produktgruppene som er i prosjektet** (via `product_family`) med et rabatt-felt
hver (blank = standard). Skriver du f.eks. rabatt på «InFloor 17T», gjelder den ALLE InFloor 17T. `veil.pris`
(`price_list`) ligger allerede per produkt. PDF-prisarket regner nå nettopris per linje via
`_resolveDiscountPct(prod, opts)` og viser Veil.pris · Rabatt% · Pris · Sum; DG/DB/kostpris er bak «Vis
DG/DB (intern)» (skjult for kunde som før).

Nye: `_projectUsedProductIds`, `_projectProductGroups`, `_resolveDiscountPct`. Verifisert: hierarkiet
(global 10 → gruppe 30 → produkt 45; leverandør 22), dialog lister EcoMat 60T + InFloor 17T med felt, og
rabattene lagres på prosjektet.

**Fil:** romtegner.html (`_showExportDialog`, `_runExportPDF`, PDF Tilbud-seksjon).

---

## Produktkatalog (read-only, rolle-gatet) — 2026-07-07

Ny read-only produktkatalog i admin-panelene. **Rolle-gating:** superadmin ser ALLE produkter (scope
`all`, med leverandør-filter); en **leverandør-org** ser kun sine egne (scope = orgens `supplier_name`,
matchet mot `p.supplier`); **installatør-orgs har ingen inngang** (nav-item gated på `org_type='supplier'`
+ superadmin, pluss defense-in-depth i `_orgAdmRenderCatalog`).

Delt renderer `_renderProductCatalog(el, scope)`: gruppert per kategori (med kategoriens
`available_contexts`-badges), kolonner El-nr · Art.nr · Produkt · Familie · Effekt · CC · Veggmargin, med
søk + type-filter (+ leverandør-filter for superadmin). Wiret inn i superadmin-panelet (ny «Produktkatalog»-
fane ved siden av «Produktimport») og org-admin-panelet for leverandører (ny «Produktkatalog»-fane; den
gamle «Produkter»-fanen ble «Produktimport»).

Verifisert: 6 kategorier / 299 produkter i scope `all`; type-filter (mat → kun matte-kategorier);
leverandør-scope filtrerer på `p.supplier`; kontekst-badges vises (bekrefter at migrasjonen satte
Varmekabel/InFloor = {indoor,outdoor}, Varmefolie = {indoor}).

**Fil:** romtegner.html (`_renderProductCatalog`, `_admRenderCatalog`, `_orgAdmRenderCatalog`, nav + switch).

---

## Produkt-tilgjengelighet per modul-kontekst (indoor/outdoor) — 2026-07-07

Erstatter den gamle navne-hacken (`c.name.includes('utendørs')`) for hvilke produkter som vises i hvilke
moduler, med en eksplisitt, data-drevet parameter på produktkategorien (gruppen):
**`available_contexts text[]`** — delmengde av `{indoor, outdoor}`. En gruppe kan være i BEGGE (f.eks.
InFloor-kabel = `{indoor,outdoor}`), noe navne-hacken ikke kunne uttrykke.

Design-modulene mapper til kontekst i appen (`_moduleEnv`): **snø + trapp = outdoor**, resten (indoor,
list) = **indoor**. Nytt filter `_catAvailableInModule(cat, modul)` bruker `available_contexts` når satt,
ellers **back-compat** til dagens navne-logikk — så koden virker uendret FØR migrasjonen er kjørt. Byttet
i `_upcScopeProducts`, `_upcRenderTypeChips` og `_listIndoorCat`. Kategoriene lastes rått fra Supabase, så
den nye kolonnen følger automatisk med.

Migrasjon: `supabase-migration-product-contexts.sql` (idempotent) — legger til kolonnen, backfiller fra
navn (`utend…` → outdoor, ellers indoor), og setter InFloor-kabel til `{indoor,outdoor}` (juster
kategorinavn). Reglene (margin/CC) er fortsatt modul-styrt, ikke gruppe-styrt.

Verifisert: `_moduleEnv` (snow/stair→outdoor), tagget indoor-only/outdoor-only/both filtreres presist,
utaggede kategorier beholder gammel oppførsel; indoor-scope returnerer produkter som før.

**Fil:** romtegner.html (`_moduleEnv`, `_catAvailableInModule`, 3 filter-steder), supabase-migration-product-contexts.sql.

---

## Varmematte: unifisert kappbar-modell for snø-manuell (retting) — 2026-07-07

Domeneretting: **alle** varmekabelmatter (innendørs EcoMat OG snø InSnow 300T) har fast kabel + KAPPBART
nett — nettet kappes ved raster (2×cc) for å folde/vende matta. Den forrige snø-manuell-antakelsen («faste
pre-fabrikerte lengder, ingen nett-kapp») var feil.

Snø-manuell bruker nå **samme kappbar-modell som innendørs**: fritt lengde-felt per bane, snappet til
raster. `snow`-flagget styrer nå BARE installasjonsreglene — ingen veggmargin (pakkes til kanten) + gap
min 5 cm — mot 5 cm margin + 0–5 cm gap innendørs. Fjernet snø-særtilfellet for lengde i `_matManualApply`,
byttet variant-dropdownen med tall-felt, og slettet nå-overflødige `_matSnowVariants`/`_matManualSetBaneProduct`.

Verifisert: snø-bane 250/300 cm → snappet 240/288 (raster 16 cm), flush til kant (margin 0), kabel 15+18 m;
panelet bruker tall-felt (ingen dropdown). Innendørs manuell uendret (ingen regresjon).

**Fil:** romtegner.html (`_matManualApply`, `_matSnowManualStart`, `_matManualRenderPanel`, add/del-bane).

---

## Varmematte: manuell bane-liste også for snø-matter (Del 5b) — 2026-07-07

Utvidet den manuelle bane-lista til **snø-matter** (InSnow 300T). Samme motor (`_matManualApply`),
generalisert med en `snow`-modus: snø bruker **faste pre-fabrikerte lengder** (per-bane produktvalg,
ingen raster-kapp), **ingen veggmargin** (pakkes til kanten) og **gap min 5 cm** — mens innendørs beholder
kappbar rull (raster-snap), 5 cm margin, 0–5 cm gap. Hver bane er fortsatt en egen matte med egen serpentin.

UI: «Manuell (bane-liste)»-knapp i snø-panelet (`_upcRenderMatResults`) → `_matSnowManualStart`; bane-lista
rendres i `#upc-results` med **lengde-dropdown per bane** (InSnow-varianter) i stedet for fritt tall.
`_upcRefreshResults` gir bane-lista forrang så den ikke overskrives av produktlista når panelet re-rendres.

Verifisert: snø-rom med 2m stå + 6m liggende → 2 faste matter (1,0 + 3,0 m², kabel 12,5 + 37,5 = 50 m, 1200 W),
flush mot kant uten margin, riktig serpentin. Innendørs manuell uendret (ingen regresjon).

**Fil:** romtegner.html (`_matManualApply`, `_matSnowManualStart`, `_matSnowVariants`, `_matManualRenderPanel`,
`_upcRenderMatResults`, `_upcRefreshResults`).

**Merk (delt kode):** snø-matter fikk allerede Del 2 (serpentin-geometri, halvsirkel cc/2, én kabel per
matte) og Del 3a (resultat-labels) gratis, siden de deler `drawMats`/`updateObjInfo` med innendørs.

---

## Varmematte: manuell modus — bane-liste (Del 5) — 2026-07-07

La til manuell utlegg som mockupen: montøren bygger en **bane-liste** (legg bane for bane, bland Stå/Ligg
fritt, lengde snappes til raster 2×cc). **Hver bane = en egen matte** (`num_runs:1`) med egen serpentin/
kabel — gjenbruker `drawMats`/hit/select/lagring. Banene **hylle-pakkes** venstre→høyre fra rommets
margin-hjørne og brytes til ny hylle ved rombredden (fra mockupens `renderManual`).

Kjerne: `_matManualApply` (bygger mat-objektene tagget `_manualGroup`, regner om verdens-topp-venstre →
pre-rotasjons x/y for rot 0/90), `_matBaneCableM` (kabel = areal ÷ cc), `_matStdSizes` (standardstørrelser
fra katalogen). UI: «Manuell (bane-liste)»-knapp i mat-panelet → bane-liste med Stå/Ligg-toggle, lengde,
«≈ X m kabel», slett, «+ Legg til bane», og totaler (baner, dekket areal, kabellengde, effekt, foreslått
matte ≤ areal). Live re-pakking ved hver endring.

Verifisert mot mockup-matematikken: baner v192+h240 → 2 matter (0,96 m²/8 m + 1,20 m²/10 m, tot 2,16 m²/
18 m); 3-bane mikset utlegg (Stå+Ligg+Ligg) rendrer 3 separate matter med egen kabel, riktig hylle-pakking
og totaler (3,00 m² · 25 m · 180 W). Kjent begrensning: å gå inn i manuell modus på nytt starter en fersk
liste (eksisterende manuell-gruppe erstattes).

**Fil:** romtegner.html (`_matManualApply` m.fl., `showMatPlacePanel`).

---

## Varmematte: «Sentrer / Fra vegg»-toggle (Del 3b) — 2026-07-07

Auto-utlegget sentrerte alltid matten (kaldt felt likt på begge vegger). La til mockupens **«Fra vegg»**-
valg: blokka legges inntil margen på start-siden, alt kaldt felt havner på motsatt vegg. Ctxbar-chip
(Sentrer ↔ Fra vegg, kun innendørs matte — snø pakkes annerledes) via `_matToggleFromWall`, som legger
matten ut på nytt i samme rom og retning (`autoFillMatSerpentine` leser `S.varmematte.fromWall`;
`acrossCenter` = margin-flush vs sentrert). Gammel matte fjernes etter at ny er lagt (ett angre-steg
gjenoppretter originalen), og sidebaren re-rendres.

Kaldt felt rapporteres fortsatt symmetrisk (`coldS/2`) i info-panelet, som mockup-fasiten. Verifisert:
toggle-syklus Sentrer→Fra vegg→Sentrer beholder retning (rot 90) + antall baner (4), holder seg på ÉN
matte, og y-posisjon flytter (−10 → −15 → −10); matten ligger visuelt flush mot vegg i «Fra vegg».

**Fil:** romtegner.html (`autoFillMatSerpentine`, `_matToggleFromWall`, ctxbar-matteblokk).

---

## Varmematte: rom-nivå resultat-labels for valgt matte (Del 3a) — 2026-07-07

Info-panelet for en valgt matte viste villedende **én-bane**-tall (`Areal 1,20 m²`, `Effekt 72 W`) selv
når matten hadde flere baner. Endret til **rom-nivå**-resultater som mockup-fasiten: Retning
(Liggende/Stående), Antall baner (× lengde/bane), Dekket areal (total), **Kaldt felt/side**, CC,
**Kabellengde** (≈ areal ÷ cc), Klipp, og **Effekt (total)**.

Kaldt felt lagres på matten ved auto-utlegg (`_coldTotalCm = acrossSpan + 2·margin − block`, målt mot
FULL romvegg inkl. margin, deles likt ved sentrert) → 300×220 EcoMat 60T gir 10 cm/side (fasit).
Verifisert: panelet viser Dekket 4,80 m², Kaldt felt/side 10 cm, Kabellengde ≈ 40 m, Effekt 288 W.

Gjenstår (Del 3b): «Fra vegg»-toggle (veggflukt-plassering i stedet for sentrert).

**Fil:** romtegner.html (`autoFillMatSerpentine`, `updateObjInfo`).

---

## Varmematte: serpentin-geometri = LÅST mockup-fasit (Del 2) — 2026-07-07

`drawMats`-serpentinen avvek fra den låste geometrien: U-svingene var **ellipser** (`xR = min(cc/2, 2,5)`
× `cc/2`), hver bane hadde sin **egen** `beginPath` og banene ble koblet med **U-sving-arcer** i skjøten —
i strid med «halvsirkel radius cc/2», «én sammenhengende kabel» og «rett flukt-skjøt».

Skrevet om til **én sammenhengende kabel** som følger mockupen: baner tas høyre→venstre, strenger går på
tvers av 50 cm-bredden og avanserer cc langs lengden, **halvsirkel-U-svinger radius cc/2** med cc/2-inntrekk
(svingen lander på 2,5 cm-margen, aldri utenfor 50 cm), og **rett flukt-overgang** i skjøten mellom baner
(ingen sving, ingen Y-splitt).

Verifisert på 300×220 (4 baner) ved å instrumentere canvas-kallene: 1 `moveTo` (én kabel), 76 `arc` alle
med radius cc/2, 3 rette skjøt-linjer, **0 `ellipse`**. num_runs=1 (én bane) rendrer uten feil. Snø-matter
bruker samme `drawMats` — endringen er generell.

**Fil:** romtegner.html (`drawMats`).

---

## Varmematte auto: retning = best dekning (Del 1) — 2026-07-07

Del av verifisering-mot-mockup + gap-tetting for den eksisterende innendørs Varmematte-modulen
(EcoMat). **Del 1:** `autoFillMatSerpentine` valgte retning via `_suggestDirection` (PCA på romform),
ikke «prøv begge, best dekning» som mockup-fasiten. Bytta til en **mat-lokal** best-dekning-velger som
regner baner×lengde for både stående/liggende på den brukbare (margin- + hindring-innskrenkede) rekta og
velger størst dekket areal; uavgjort → stående (som mockup). Bruker-overstyrt retning vinner fortsatt.

`_suggestDirection` er **urørt** (folie/kabel bruker den) → ingen regresjon. Verifisert: 260×250 gikk fra
liggende 4 baner (4,80 m²) til stående 5 baner (6,00 m²); 300×220 forblir liggende 4; overstyring virker.

**Fil:** romtegner.html (`autoFillMatSerpentine`).

---

## Romoversikt: én rad per unik produkt-variant (fiks mikset multi-kabel) — 2026-07-07

**Bug:** Romoversikten (PDF-tabell + Excel «Per rom») antok ett dominant produkt per rom. Et rom med
FLERE ULIKE kabler (multiCableGroup, f.eks. 1× 1700W + 1× 1300W) kollapset til én rad der Antall =
antall elementer (2), W = romtotal (3000) sto ved siden av kun det dominante produktet (1700W), og den
andre kabelen forsvant. CC var også feil på avledede rader.

**Fiks:** ny `_roomProductBreakdown(room)` grupperer rommets elementer per produkt →
`[{product, kind, count, effectW}]` (effekt som i `_roomRatedEffectW`, dominant først). Begge tabellene
(`_runExportPDF` Romoversikt ~32874 + Excel «Per rom» ~38923) skriver nå **én rad per unik variant**:
Antall = antall identiske av varianten, W = variantens effekt (Σ = romtotal), CC = rommets FELLES CC på
hver rad. Etasje/Rom/Areal/W-m² kun på første variantrad (rom-nivå, unngår dobbelt-areal).

**Ingen regresjon:** enkeltkabel og N LIKE kabler → nøyaktig én rad som før (samme produkt ⇒ én gruppe).
Materiallista uendret. Verifisert (syntetiske rom): MIX 1700+1300 → to rader (1700 / 1300, Σ 3000);
SINGLE → én rad; TWOSAME (2× 1300) → én rad (Ant 2, W 2600).

**Test:** kjør Romoversikt-PDF (eller Materialliste-Excel, arket «Per rom») på et prosjekt med et rom som
har to ulike kabler → rommet får én rad per kabel-variant med riktig Antall/W og felles CC.

**Fil:** romtegner.html (`_roomProductBreakdown`, `_runExportPDF`, `_exportMaterialListXLSX`).

---

## PDF-eksport: forhåndsvisning for dokument-seksjonene — 2026-06-25

Utvider forrige (navn = preview, boks = hake) til de øvrige seksjonene: **Forside,
Prosjektoversikt, Romoversikt, Materialliste, Dokumentasjon, Signaturside**. Radene er nå `<div>`
med navn-`<span onclick=_expPreviewSection(kind)>` (klikk = forhåndsvisning) + avkrysningsboks som
kun toggler. Ny `_expPreviewSection(kind)` rendrer en HTML-representasjon fra ekte prosjektdata:
forside (navn/kunde/dato), prosjektoversikt (KPI: effekt/areal/rom/trapper), romoversikt (tabell),
materialliste (Produkt/Antall/El.nr/Art.nr), dokumentasjon (antall dok. rom), signaturside (mal).
Verifisert: alle 6 navn-klikk rendrer riktig preview uten å endre haken; boks-klikk toggler uten
preview.

**Fil:** romtegner.html (`_showExportDialog`, `_expPreviewSection`).

---

## PDF-eksport: respekter rom-utvalg + skill preview fra hake — 2026-06-25

1. **Bug:** deselekterte rom kom likevel med i PDF-en. `exportPDF` brukte
   `opts.rooms && opts.rooms.length > 0 ? … : S.rooms` → tomt utvalg falt tilbake til ALLE rom.
   Fikset til `Array.isArray(opts.rooms)` (og tilsvarende for `opts.stairs`) → et eksplisitt TOMT
   utvalg gir ingen romsider; kun `undefined` (ingen dialog) faller tilbake til alle.
2. **UX:** rom-/trapp-radene i eksport-dialogen er nå `<div>` (ikke `<label>`): **navnet** er en
   `<span onclick=_expPreviewRoom>` (klikk = kun forhåndsvisning), og **avkrysningsboksen** toggler
   kun ved klikk i boksen. Så man kan se hva hvert rom viser før man velger hva som skal med.
- Verifisert: navn-klikk rendrer preview uten å endre haken; boks-klikk toggler uten preview;
  hak av alle → 0 romsider; default-eksport uendret.

**Fil:** romtegner.html (`_showExportDialog`, `exportPDF` `_selectedRooms`/`_selectedStairs`).

---

## Innendørs multi-kabel: bevar ULIKE kabler ved re-layout — 2026-06-25

**Bug:** manuelt 1300 W + 1700 W (InFloor 10T) → den lengste kabelen la seg feil (ekstra bue),
soner ble LIK-store.

**Funn (bekreftet):** selve initial-plasseringen er allerede proporsjonal (forrige økt): 33,4 m²,
CC 11,1 cm, soner 56,7 %/43,3 %, ingen overflyt. Bug-en lå i **re-layout-stiene**:
`_cableFlipDirection`, `_reapplyCableDirection` og `_cableToggleMultiMode` re-utla gruppa via
`autoFillMultiCable(roomId, cable.productId, group.length)` = ett produkt × antall = N IDENTISKE
→ en mikset gruppe ble revertert til like soner (begge kabler = valgt produkt) → avvikende kabel
overflyter (buen i bildet).

**Fiks:** ny `_relayoutCableGroup(roomId, group, cable, dir)` som bevarer per-kabel-produktene for
MIKSEDE grupper (`_autoFillMixedCables` → proporsjonale soner, felles CC); like grupper beholder
N×like/korridor. Brukt i flip + reapply. Korridor-modus blokkeres for miksede grupper (krever like).

**Verifisert (canvas + tall):** flip [170,130]→[170,130] (56,7/43,3, retning snudd), reapply likeså,
N×like uendret (50/50), ren serpentin uten bue.

**Filer:** romtegner.html (`_relayoutCableGroup`/`_groupIsMixed`/`_groupProductIdsOrdered`,
`_cableFlipDirection`, `_reapplyCableDirection`, `_cableToggleMultiMode`).

---

## Innendørs: ULIKE kabler i samme rom (soner ∝ effekt) — 2026-06-25

Mål: tillate 2+ ulike kabler (samme familie) i ett rom, ikke bare N×like. F.eks. 3000 W med
InFloor 10T: anbefalt 2×1500, men ved lagermangel 1300+1700.

### Del A — Sone-motor for ulike kabler ✅
- `_buildNCableZones` generalisert fra ett produkt × N til en **produktliste** (ett per kabel).
  Ny `_weightedBandBounds` (generalisering av `_equalAreaBandBounds`) gir bånd med areal ∝ vekt
  (= kabellengde = effekt). Felles CC fra total lengde → samme W/m² i alle soner. Hjørne-snap
  brukes kun for LIKE soner. N×like er spesialtilfellet (like vekter) → ingen regresjon.
- Delt kjerne `_autoFillCableZonesCore` (retnings-heuristikk uendret); `_autoFillNCables` (N×like)
  + ny `_autoFillMixedCables(roomId, productIds, forcedDir)` (krever samme familie + W/m).
- Verifisert (30 m² rom, InFloor 10T): 130+170 → soner **43,3 %/56,7 %**, felles CC 10 cm, 3000 W;
  2×150 → like soner, CC 10 cm (ingen regresjon).

### Del B — Forslag: alternative ulike-kombinasjoner ✅
- Ny `_generateMixedCombos(familyProducts, desiredW, netM2, tol)`: alle gyldige 2-kabel-kombinasjoner
  fra familien som summerer til behovet (±tol), med gyldig felles CC (`netM2/Σlengde`). Rangert
  **nærmest behov først, så likest split** → eksakt-treff samles øverst med felles CC. Balansert
  eksakt-treff får `recommended:true` (★). Returneres som `mixedCombos` fra `selectMultiCables`.
- Verifisert (3000 W): 1500+1500 (★) · 1400+1600 · 1300+1700 · 1200+1800 · 1000+2000 — alle CC 10 cm,
  deretter nær-treff (2900/3100 …) under.

### Del C — UI: valgbare ulike-kabel-alternativer ✅ (manuell komponering gjenstår)
- Kabel-panelet viser nå en «Ulike kabler (samme dekning)»-seksjon med de eksakte ulike-
  kombinasjonene fra `mixedCombos` (jevnest først) som valgbare knapper. Klikk → `_placeMixedCables`
  → `_autoFillMixedCables` legger ut proporsjonale soner (K1/K2, felles CC).
- Verifisert visuelt: 130+170 i ett rom → to soner (oransje K1 1300 W / blå K2 1700 W), felles CC
  10 cm, riktige produkter/EL. N×like og enkeltkabel uendret.
### Del C.2 — Manuell komponering ✅
- «＋ Komponer ulike kabler selv…» i kabel-panelet åpner en modal (`_openMixComposer`/
  `_renderMixComposer`): kabelrader (K1/K2/…) med produkt/effekt-dropdown per rad fra familien,
  «＋ Legg til kabel», fjern per rad. Valgfritt «Årsak»-felt (f.eks. lagermangel), lagres på
  kablene (`mixReason`). «Plasser i rom» → `_placeMixedCables`.

### Del D — Validering ✅
- `_mixComposerStats`: løpende **Sum effekt** vs behov, **Felles C-C**, og **Gyldig/Ugyldig**-pill.
  Avvik flagges tydelig: sum >12 % fra behov, eller C-C utenfor produktets område. «Plasser»
  deaktiveres når ugyldig. (`_generateMixedCombos`/`_autoFillMixedCables` slipper uansett kun
  gyldige gjennom: samme familie/W/m, gyldig CC, ±tol.)
- Verifisert: 130+170 → Sum 3000 W, CC 10 cm, ✓ Gyldig; 200+200 → 4000 W, ⚠ Ugyldig (apply av);
  legg til/fjern rad; «lagermangel» lagret; apply plasserte K1 1300 W + K2 1700 W.

**Filer:** romtegner.html (`_buildNCableZones`/`_weightedBandBounds`, `_autoFillCableZonesCore`/
`_autoFillMixedCables`, `_generateMixedCombos`/`selectMultiCables`, `_placeMixedCables`,
`_openMixComposer`/`_renderMixComposer`/`_mixComposer*`, kabel-panel-render).

---

## PDF-materialliste: antall + fjern Lengde/Areal/Effekt — 2026-06-25

Materiallisten i PDF-eksporten (`exportPDF`) skal kun være en oversikt over hvilke produkter
som er medtatt. Kolonnene er endret fra Produkt·Lengde·Areal·Effekt·El.nr·Lev.art.nr til
**Produkt · Antall · El.nr · Lev.art.nr** (bruker `info.count` fra aggregeringen, som allerede
telte antall per produkt men ikke ble vist). «Total installert effekt»-linja i materialliste-
delen er fjernet (samme tall vises i sammendraget/INSTALLERT EFFEKT). Rom-/spesifikasjonsdelen
(lengde/areal/effekt per rom) er urørt. Verifisert: eksport fullfører uten feil på ekte prosjekt.

**Fil:** romtegner.html (`exportPDF` — materialliste-seksjonen).

---

## Trapp: tre fikser (fjern/legg til kabel, riktig antall strenger, side-visning) — 2026-06-25

1. **Fjern/legg til varmekabel** (`67e16b6`+`1057df0` er 2/3; denne er 1+2): ny «Fjern varmekabel»-
   knapp i trappens innstillings-panel (`_stairRemoveCable`) — tømmer kabelen (løp/produkt) men
   beholder geometrien (`stair.noCable`-flagg; `generateStairCable` returnerer tomme løp). «Legg til
   varmekabel» (`_stairAddCable`) regenererer og åpner forslag. Å velge kabel/forslag fjerner flagget.
2. **Valgt forslag → riktig antall strenger:** `_applyStairProposal` lagret bare avrundet `stepCC`;
   `generateStairCable` re-utledet `N=floor(usableDepth/cc)+1`, og opprundet CC kunne senke N med 1
   (forslag «4 strenger» ble bygd som 3). Lagrer nå `runsPerStep` og bruker den direkte for trinn
   (+ epsilon-guard). Verifisert: `runsPerStep=4` → 4 strenger (var 3).
3. **Side-visning opp-ned:** forrige buildDirection-fiks speilet side-profilen vertikalt (FY), som
   snudde trappa opp-ned. Reverterte FY i `_drawStairSide` → normal trinn-opp-profil. Byggeretning
   styrer fortsatt plan-visningen via `y_cm`. Verifisert på canvas.

**Filer:** romtegner.html (`_drawStairSide`, `generateStairCable`, `_applyStairProposal`,
`_stairRemoveCable`/`_stairAddCable`, `_renderStairSettingsPanel`, `_setStairCableProduct`).

---

## Ny modul: Snøsmelting – effektbehov — 2026-06-25

Leverandørnøytral effektbehov-kalkulator for snøsmelting; produktene kommer fra valgt leverandørs
katalog. Kilde: research-doc (ASHRAE/IEC 62395-2/HT2000) + verifisert mockup. Ingen merkenavn (DEVI/
Danfoss) i UI.

### Del A — Overflatelast (værstyrt, leverandørnøytral) ✅
- `SNOW_IEC` (værhardhet × kritikalitet → W/m²-intervall), `_snowMidLoad` (midt, rundet til 25),
  `_snowSurfaceLoad` (+100 W/m² per korreksjon: >1000 moh / vind >6 m/s / snø < −10 °C; gulv 250),
  `_snowMinAir` (α=23: «holder +Ts ned til X °C luft»).
- Verifisert: **streng/moderat → 350 W/m²**, **minAir(3, 350) → −12 °C**, floor 250, korreksjoner +100.

### Del B — Lagmodell (gulvoppbygging, R = tykkelse/λ) ✅
- `SNOW_MATERIALS` (11 materialer m/λ), `SNOW_DEFAULT_LAYERS`, `_snowLayerR`/`_snowRsum`,
  `_snowGroundModel` (kabeltemp = Ts + last×R_opp; bakketap = (T_kabel−bakke)/R_ned; installert =
  last + bakketap; responstid ∝ R_opp). Dekketykkelse/-materiale endrer kabeltemp/bakketap/respons —
  ikke overflatelasten.
- Verifisert: **R_opp = 0,050** (40 mm asfalt), **R_ned = 1,4921 ≈ 1,493** (standardlag), respons
  4cm→1×/8cm→2×. HT2000-case (q0=262): 269 (4cm)/278 (8cm) — eksakt som den verifiserte mockupen;
  ~2 % under HT2000s 273/285 (iboende i enkel R-modell vs full ASHRAE; eksakte ankre stemmer).

### Del C — UI + produkt fra leverandørens katalog ✅
- Hub-kort «Snøsmelting – effektbehov» (datadrevet i `MODULE_TYPES`, `_quickStartModule` ruter til
  `_openSnowCalc`). Modal i Varmeplan-stil (mockup-flyten): værforhold + lagbygger (over/under, R per
  lag) + produkt-chips + resultat (overflatelast, holder-ned-til-X°C, kabeltemp, bakketap, installert,
  C-C, total, responstid + advarsler).
- **`_snowCatalogProducts()`**: resolver snøkabel/matte-familier fra `HEATING_PRODUCTS` (leverandør-
  filtrert via `_filterProductsByOrg`; 230/400 V slått sammen). Ingen hardkoding/merkenavn — en annen
  leverandør viser sine egne snøprodukter automatisk. Kabel → C-C = W/m ÷ installert × 100; matte →
  sjekk W/m² ≥ installert (grønn/rød + advarsel). Ekte art./EL fra katalogen i produktkortet.
- «Lagre i prosjekt» lagrer snapshot (`S.project.snowcalc` + snowcalc-part) med valgt produkt
  (type/spenning/CVA/EL/C-C) for dokumentasjon.
- Verifisert: default InSnow 30T → 350 W/m², C-C 8,3 cm, CVA10300/EL 1005753; 400 V → CVA10700/EL
  1020483; matte 360>300 → rød + advarsel; lagring skaper prosjekt + part. Ingen DEVI/Danfoss.

### Del D — Værdata pr postnummer (auto-fyll) ✅
- **`supabase-migration-weather-postcode.sql`** (datakontrakt, kjøres manuelt): tabell
  `weather_by_postcode(postcode pk, place, municipality, design_temp_c, design_wind_ms,
  snowfall_cm_h, altitude_m, source, updated_at)`. RLS: les for innloggede, skriv kun superadmin.
  Inkluderer import-mal for 40-årsarket.
- `_snowLookupPostcode()` + `_snowDeriveFromWeather()`: postnr → auto-fyll værhardhet
  (temp ≥ −15 mild / −25…−15 streng / ≤ −25 svært) + korreksjoner (moh>1000, vind>6, temp<−10),
  overstyrbart. Tom tabell / før migrasjon → degraderer pent til «fyll inn manuelt».
- Verifisert: utledning (−28→svært+alle, −18→streng+snø, −8→mild); graceful fallback uten tabell.
- **Værdata importert:** `supabase-import-weather-postcode.sql` (generert fra Postnummerregister-
  Excel) — **5136 postnr** med dimensjonerende utetemp (Auslegungsaußentemperatur, −43,9…−7,0 °C),
  høyde over havet, poststed/kommune. Idempotent upsert, 11 batcher. Kjøres som superadmin etter
  migrasjonen. (Vind/snøfall finnes ikke i datasettet → null; korreksjon utledes fra temp/høyde.)

**Filer:** romtegner.html (`SNOW_*`/`_snow*`, `_openSnowCalc`/`_snowCalc`, `_snowCatalogProducts`,
`MODULE_TYPES`/`_MOD_ICON`), [supabase-migration-weather-postcode.sql](../supabase-migration-weather-postcode.sql).

Ny forsidekort-modul (datadrevet, samme mønster som de andre). Kilde: Cenika varmekatalog
(varmetap W/m) + verifisert mockup-flyt.

### Del A — Varmetap-tabell + beregningskjerne ✅
- `FROST_WM` (8 iso × 5 ΔT × 18 diametre), `FROST_DIAM`/`FROST_ISO`/`FROST_DT`, `_frostNearestDt`
  (runder ΔT til 20/30/40/60/80), `_frostLookupWpm(diamIdx, iso, dt)`, og `_frostSuggestCable`
  (≤10→MultiPipe 10; ≤20→IceFix 20W; >20→flagg; Ready-lengde nærmest ≥ rørlengde, ellers metervare).
- Verifisert: **fasit 2″/30mm/ΔT20 → 7 W/m**, flere oppslag, ΔT-runding (+5/−15→20), og alle
  kabelvalg-grenser (10/20). Alle rader = 18 verdier.
- ⚠️ **To celler kunne ikke verifiseres mot trykt katalog** (dimensjonerings-tabellen finnes IKKE i
  den offentlige 2024-katalog-PDF-en — bekreftet via full PDF-gjennomgang). Encodet EKSAKT som
  kildedataene, men begge bryter monotonitet (sannsynlige kopifeil) og er flagget i koden:
  ISO50/ΔT40/20″=66 og ISO100/ΔT60/1½″=8.0 — **bør bekreftes mot trykt katalog**.

### Del B — Modulkort i hub + beregnings-UI ✅
- `frost` lagt i `MODULE_TYPES` (+ `_MOD_ICON.frost='droplet'`, nytt droplet-ikon, `PROJECT_TYPE_MAP`).
  Kortet vises i hub-en; `_quickStartModule` ruter `frost` → `_openFrostModule()` (kalkulator, ikke canvas).
- `_openFrostModule()` + `_frostCalc()`: modal i Varmeplan-stil (mockup-flyten) — diameter/iso/temp/
  lengde → live ΔT + W/m + totaleffekt + fargekodet kabelforslag (MultiPipe 10 / IceFix 20W / >20-flagg).
- Verifisert live: kort i hub, default 2″/30/ΔT20/30m → 7 W/m · 210 W · MultiPipe 10 (Ready 30 m);
  1¼″/20/ΔT40 → 14,4 → IceFix. Skjermbilde matcher mockupen.

### Del C — Produktkatalog (CVA/EL fra cenika.no) ✅
- `_ensureFrostProtectionProducts()` (samme injeksjon-mønster som InSnow) legger 54 produkter i
  `HEATING_PRODUCTS` + kategori «Frostsikring rør»: MultiPipe 10 Ready (26, 2–60 m) + metervare
  CVA10220, IceFix 20W Ready (26, 2–52 m) + metervare CVA10210.
- CVA + EL **skrapet og kryssverifisert** mot cenika.no (4 subagenter + uavhengig sjekk via
  Cenikas søk-API: CVA10236→1021259, CVA10264→1010967, CVA10210→1003606 — alle matchet).
- ⚠️ **MultiPipe 10 metervare CVA10220 er utgått og har ingen publisert EL-nr** → `el_no=null`
  (flagget i koden). Alle andre 53 har EL.

### Del D — Ekte CVA/EL i forslaget + lagre på prosjekt ✅
- `_frostResolveProduct(family, lengthM)`: minste Ready-lengde ≥ rørlengde fra katalogen, ellers
  metervare. Forslaget viser nå **ekte CVA + EL** (f.eks. 2″/30/ΔT20/30m → MultiPipe 10 Ready 30 m
  → CVA10246 · EL 1021269; IceFix-tilfelle → CVA10274 · EL 1010977).
- «Lagre i prosjekt»-footer: `_frostSaveToProject()` oppretter et prosjekt (type `frost`) med en
  frost-part + `S.project.frost`-snapshot `{inputs, wpm, totalW, product:{type,CVA,EL,lengde,navn}}`
  — persistert i prosjekt-JSON, klart for dokumentasjon/garantibevis.
- Verifisert live: ekte CVA/EL i begge kabeltyper; lagring skaper prosjekt med produkt-snapshot
  (CVA10246/EL 1021269) + frost-part. Test-data ryddet.

**Filer:** romtegner.html (`FROST_WM`/`_frost*`, `_openFrostModule`/`_frostCalc`,
`_ensureFrostProtectionProducts`, `MODULE_TYPES`/`_MOD_ICON`/`PROJECT_TYPE_MAP`).

---

## Kontaktpersoner: tittel-felt, tabell på kundekort, søkbare i Kunder — 2026-06-25

Bygger på `contacts`-tabellen.

### Del A — Tittel-felt ✅
- **`supabase-migration-contact-title.sql`** (kjørt): `alter table contacts add column if not
  exists title text`. RLS uendret. Add/edit-skjemaene på kortet tar nå navn (påkrevd) + tittel,
  telefon, e-post (valgfrie); `title` skrives i `_cardCreateContact`/`_cardSaveContact`.

### Del B — Kontaktpersoner som tabell på kundekortet ✅
- `_renderCardContacts` rendrer nå en **tabell**: Navn · Tittel · Telefon · E-post · (handling).
  Inline «＋ Legg til kontaktperson» (ny rad i tabellen), rediger/fjern per rad. Telefon er
  `tel:`-lenke, e-post `mailto:`-lenke (teal). Tom tilstand: «Ingen kontaktpersoner ennå».
  Felles `_ccEditCells` for ny/rediger-rad.

### Del C — Søk i kontaktpersoner (Kunder-fanen) ✅
- `_loadAllContacts()` laster alle org-kontakter én gang (RLS-scopet) inn i `_contactsCache` —
  samme kilde som kortet; ingen rundtur per tastetrykk (mutasjoner holder cachen oppdatert).
- `_renderCustomerTable`-søket matcher nå OGSÅ kontaktenes navn/tittel/telefon/e-post (i tillegg
  til dagens kundefelt). Kunde-raden viser «Treff: <navn> – <tittel>» når treffet kom via en kontakt.
- Verifisert: kort med 3 kontakter (tittel/tlf/e-post) i tabell, rediger/fjern + tel/mailto;
  søk på kontaktnavn/tittel/telefon/e-post → riktig kunde + treff-markering; RLS kun egen org.

**Filer:** [supabase-migration-contact-title.sql](../supabase-migration-contact-title.sql),
romtegner.html (`_renderCardContacts`/`_cardContactRowHtml`/`_ccEditCells`/`_card*Contact`,
`_loadAllContacts`, `_renderCustomerTable`).

---

## Trapp: «Byggeretning» styrer nå faktisk geometri/kabel/preview — 2026-06-25

**Bug:** «Byggeretning» (Nedenfra og opp / Ovenfra og ned) ga feil resultat — `buildDirection`
ble kun brukt til å reversere segment-LISTA i modalen ([23532]), ikke i geometrien, kabelen
eller forhåndsvisningen. Reprodusert: `_generateStairSurfaces` ga identiske flater for begge
retninger; `w2s` plasserte `segs[0]` (nederste) øverst → «nedenfra og opp» bygde motsatt.

**Fiks (alt i sync med etiketten):**
- `_generateStairSurfaces`: `surfaces` beholder `segs[0]`-først rekkefølge (kabelstart = trinn 1
  = nederst), men **y_cm speiles** etter retning — «bottom» legger `segs[0]` nederst (størst
  y_cm), «top» øverst. Trinn nummereres fra `segs[0]`.
- `_drawStairSide`: vertikal speiling (`FY`) for «bottom» → profilen stiger oppover (var
  synkende); kabel + risers følger med.
- `_stairBuilderPreviewSVG`: tegner i retnings-bevisst rekkefølge så preview matcher canvas.
- Plan, side, kabel, preview og liste er nå konsistente. Kabel-/effektberegning per trinn
  uendret (sum er rekkefølge-uavhengig).

**Testet (canvas + data):** trapp 3 trinn + repos + 2 trinn. «Nedenfra og opp» → trinn 1 og
kabelstart nederst, side-profil stiger; «Ovenfra og ned» → speilvendt (trinn 1 + grønn
kabelstart øverst). Kabel-total 3951 cm i begge (ingen regresjon). Verifisert med skjermbilde.

**Merk:** eksisterende lagrede trapper oppdateres ved neste regenerering/redigering (lagret
`surfaces` brukes til da).

**Filer:** romtegner.html (`_generateStairSurfaces`, `_drawStairSide`, `_stairBuilderPreviewSVG`).

---

## Kundekort → fullt CRM-kort (kontakter + prosjekter) — 2026-06-25

Utvidet `_openCustomerCard` til et CRM-kort. Bygger på `contacts`-tabellen fra
opprett-firma/kontakt-arbeidet (allerede migrert — ingen ny migrasjon).

### Del A — Kontaktpersoner i listevisning ✅
- Erstattet det enkle `cc-contact`-feltet med en **Kontaktpersoner**-seksjon: liste over alle
  `contacts` for kunden (navn + telefon·e-post), hver rad med **rediger (✎)** og **fjern (✕)**.
  «＋ Legg til kontaktperson» → inline rad (navn påkrevd, telefon/e-post valgfritt).
- Funksjoner `_renderCardContacts`/`_cardContactRowHtml`/`_cardShowAddContact`/
  `_cardCreateContact`/`_cardStartEditContact`/`_cardSaveContact`/`_cardDeleteContact` — deler
  `contacts`-tabellen og `_contactsCache` med opprett-prosjekt-comboboxen (begge veier).
- Lazy-backfill: hvis kunden har gammel `contact_person` men ingen kontakter, migreres den inn
  som én kontakt ved åpning. `_saveCustomerCard` skriver ikke lenger `contact_person` (bevares).
- Verifisert live: la til 3 kontakter, rediger + fjern persisterer i DB; opprett-comboboxen
  (`_loadContacts`) ser samme kontakter. Test-data ryddet.

### Del B — Prosjekter i listevisning + søk/filter ✅
- Refaktor for ekte gjenbruk: heiset `_effDate` → modul-nivå `_projectEffDate`, og trakk ut
  `_filterProjectsList(projects, {search,customer,status,type})` med dashboardets eksakte
  filter-/sorteringslogikk. **Dashboardet (`_renderProjectList`) og kundekortet bruker samme
  funksjon** — ingen parallell.
- `_renderCustomerCardProjects(customerId)`: bruker dashboardets `_cachedProjects` scopet til
  `_customerId === c.id`, oppsummering («N prosjekter · M ferdige»), søk + status- + type-filter,
  og kompakt liste (navn, type-ikon, status-badge, dato) via `_cardProjectRowHtml`. Klikk åpner
  prosjektet og lukker kortet.
- Verifisert: dashboard uten regresjon (33 rader; status=ferdig → 32); kort viser «· 3 prosjekter
  · 3 ferdige», søk «Espe»→1, type indoor→3, klikk åpner.

### Del C — delt contacts-kilde ✅ (verifisert i Del A)

**Filer:** romtegner.html (`_openCustomerCard`, `_renderCardContacts` m.fl.,
`_renderCustomerCardProjects`/`_cardProjectRowHtml`, `_projectEffDate`/`_filterProjectsList`,
`_renderProjectList`).

Bygget om det inline opprett-skjemaet til et proft, luftig kort som matcher mockupen
`mockups/Varmeplan-opprett-prosjekt-redesign.html`. Kun markup + CSS; all opprett-logikk
(`_toggleCreateProject`, `_createProjectInline`, `_searchCustomers`/`_acNav`/`_searchContacts`)
og alle felt-ID-er uendret.

### Del A — Layout ✅
- Nytt `.npc-card` inni `#dash-create-form`: header (folder-plus i teal-chip + «Nytt prosjekt»
  + undertittel), `.npc-grid` 3 kolonner, etiketter over hvert felt, 46px-felt med teal
  fokus-ring (`color-mix` mot `--accent`), footer med delelinje + «✓ Opprett prosjekt» (primær)
  + «Avbryt» + tastatur-tips. Rad 1: Prosjektnavn\*·Kunde/firma·Kontaktperson; rad 2:
  Adresse·Type·Ansvarlig.
- **Fjernet den overlappende `＋`-knappen** ved Kunde (opprett-nytt-firma ligger nederst i lista).
- Kontaktfeltet ligger fast i rutenettet men er `disabled` til firma er valgt («Vises etter
  firma…») — `_onCustomerChosen` byt/disabler i stedet for å skjule (stabil 3+3).
- Toggle-knappen («＋ Opprett prosjekt») skjules mens kortet er åpent; Avbryt/Opprett viser den.
- Søk/filtre flyttet til egen linje under kortet med topp-delelinje. Dropdown (`.cust-search-results`)
  luftet opp (radius 12, skygge, avrundede rader). Bruker appens light-theme-tokens → matcher
  mockupens palett; degraderer pent i dark-theme.
- Verifisert live (light-theme, 1120px): 3×grid, 46px-felt, ＋-borte, kontakt disabled, toggle
  skjult ved åpning, combobokser virker. Skjermbilde matcher mockupen.

### Del B — Kunde-combobox ✅
Funksjonelt bygget forrige økt (`_searchCustomers` + `_inlineCreateCustomer`). Her: add-radens
ordlyd justert til mockupens «＋ Legg til «<navn>» som nytt firma». Verifisert i nytt oppsett.

### Del C — Kontaktperson ✅
`contacts`-tabell + `_searchContacts`/`_inlineCreateContact` bygget forrige økt (migrasjon
allerede kjørt). Her: feltet aktiveres etter firmavalg (Del A `_onCustomerChosen`). Aldri fast
kontakt; `contact_id` + navn-snapshot lagres på prosjektet.

**Verifisert (full tastatur-E2E i nytt oppsett):** prosjektnavn → nytt firma (Enter på add-rad)
→ kontakt aktivert → ny kontakt (Enter) → Opprett. Prosjekt lagret med riktig kontakt; toggle
gjenopprettet; RLS kun egen org. Test-data ryddet.

---

## Raskere «Opprett prosjekt» — firma + kontakt inline (2026-06-25)

Mål: velg/opprett firma og kontaktperson uten å forlate opprett-prosjekt-flyten.
Bygger på eksisterende `_searchCustomers`/`_selectCustomer`/`_acNav`/`_createProjectInline`.

### Del A — Firma: velg eller opprett inline ✅
- `_searchCustomers`: viser nå alltid en inline **«＋ Legg til «<det du skrev>»»**-rad i
  dropdownen (`data-ac` → pil/Enter via `_acNav` og museklikk funker likt). Skjules kun ved
  eksakt navnetreff.
- Ny **`_inlineCreateCustomer()`**: oppretter kunde (org-scopet, kun navn) der og da uten
  dialog/avbrudd, og velger den. Leser navnet fra søkefeltet (unngår escaping i onclick).
  `＋`-knappen → full `_showNewCustomerPopup` beholdt som «avansert».
- Verifisert live (ksk@cenika.no): tastatur Enter oppretter+velger; museklikk likeså;
  eksisterende kunde velges fortsatt; «+ Legg til» skjult ved eksakt treff. Test-rad ryddet.

### Del B — Kontaktperson: mange per firma ✅
- **Migrasjon `supabase-migration-contacts.sql`** (kjørt, verifisert 6/6/2/1): tabell
  `contacts(id, customer_id FK customers ON DELETE CASCADE, name not null, email, phone,
  created_at)`. RLS org-scopet *gjennom* customer via `user_org_ids()` + superadmin.
  `romtegner_projects.contact_id`-kolonne lagt til. Backfill: eksisterende
  `customers.contact_person` → én kontakt per kunde (idempotent). `contact_person` beholdt.
- **UI:** nytt `#dash-proj-contact`-combobox som vises **etter** valgt firma
  (`_onCustomerChosen` avslører + forhåndslaster). Ved fokus vises HELE firmaets kontaktliste
  umiddelbart (`_searchContacts(q, showAll)`); skriv for å filtrere; `_acNav` gjenbrukt
  (pil/Enter/klikk). `+ Legg til ny kontaktperson «<navn>»` → `_inlineCreateContact` (org-scopet
  via customer). Ingen fast standardkontakt — valget gjelder prosjektet.
- **Persistering:** `S.project.contact_id` + `contact_name` (snapshot) i prosjekt-JSON (lest av
  `_createProjectInline`, lagret via eksisterende save-sti — urørt). Kontaktnavn vises i
  prosjektlista (under Kunde, `_fetchProjectList._contact`) og i dokumentasjons-headeren
  (`_docFetchProjectData._contact` → `_docState.contactName`).
- Verifisert live (ksk@cenika.no): fokus viser hele lista; nytt firma + ny kontakt + prosjekt
  via **kun tastatur** på sekunder; prosjekt lagret med riktig kontakt; RLS: kun egen orgs
  kontakter synlige (6). Test-data ryddet.

**Filer:** [supabase-migration-contacts.sql](../supabase-migration-contacts.sql), romtegner.html
(`_searchContacts`/`_selectContact`/`_inlineCreateContact`/`_onCustomerChosen`/`_loadContacts`,
+ `_createProjectInline`/`_fetchProjectList`/prosjektrad/doc-prefill).

---

## EL-nummer for InSnow utendørs-kabler (20T/30T/40T) — 2026-06-24

**Mål:** Fylle inn EL-nummer (`el_no`) på alle InSnow-kabelprodukter. 85 av 104 manglet
(kun InSnow 30T 230V hadde fra før).

**Kilde + validering:** Bruker leverte Cenika-prisliste (`Bok1.xlsx`, 85 par CVA↔EL).
Kryssvalidert mot skraping av cenika.no (5 parallelle subagenter, ett produkt-oppslag per
artikkel): **100 % match, 0 avvik på 85**. Krysset mot DB: alle 85 `article_no` fantes,
ingen hadde `el_no` fra før.

**Gjort:**
- **`supabase-migration-insnow-elno.sql`** (kjørt i Supabase, verifisert 85/85/0): 85
  idempotente `update … where … and el_no is distinct from …`. DB bekreftet: 104/104
  InSnow-kabelrader har nå `el_no` (stikkprøver CVA10340=1004181, CVA10713=1020496,
  CVA10756=1042662).
- **`romtegner.html` `_ensureOutdoorCableProducts`:** rettet latent feil — `add()` tok imot
  `elNo` men lagret det aldri (`el_no: elNo` lagt til på produktobjektet), og fylte inn alle
  85 EL-numre i `add()`-kallene. Klient-fallbacken (kun aktiv hvis produktene mangler i DB)
  er nå komplett. App lastet uten feil (245 produkter).

| Serie | Artikler | EL-blokk |
|---|---|---|
| InSnow 20T 230V | CVA10340–10356 | 1004181–1004197 |
| InSnow 20T 400V | CVA10361–10377 | 1017939–1017955 |
| InSnow 30T 400V | CVA10700–10716 | 1020483–1020499 |
| InSnow 40T 230V | CVA10720–10736 | 1032638–1032654 |
| InSnow 40T 400V | CVA10740–10756 | 1042646–1042662 |

**Filer:** [supabase-migration-insnow-elno.sql](../supabase-migration-insnow-elno.sql), romtegner.html (`_ensureOutdoorCableProducts`).

---

## Medlemssynlighet: alle i egen org (RLS + embed-fiks) — 2026-06-24

**Problem:** En ikke-superadmin (ksk@cenika.no, admin i Cenika AS) så bare seg selv i
firma-panelets medlemsliste, ikke Fredrik.

**To rotårsaker (begge bekreftet):**
1. **RLS for snever.** `organization_members` SELECT = `using (user_id = auth.uid())` (kun
   egen rad) og `profiles` SELECT = kun egen profil. Superadmin så alt via `is_superadmin()`.
2. **Ødelagt PostgREST-embed.** `organization_members.user_id` har FK til `auth.users`
   (ikke `profiles`), så appens `select('... profiles(...)')` feilet med «Could not find a
   relationship … in the schema cache» → panelet viste «Ingen medlemmer» uansett RLS.

**Fiks:**
- **`supabase-migration-org-member-visibility.sql`** (kjørt i Supabase, verifisert 1/0/1/1):
  - `user_org_ids()` — SECURITY DEFINER, stable, `search_path=public` (bypasser RLS →
    ingen rekursjon/42P17 når brukt i policy PÅ `organization_members`).
  - `organization_members` SELECT → `using (org_id in (select user_org_ids()))`.
  - `profiles` SELECT → additiv policy: profiler til medlemmer i mine orgs. «Egen profil»
    + superadmin beholdt. Skrive-policyer urørt.
- **`romtegner.html` `_orgAdmRefresh`:** byttet ut den ødelagte embed-joinen med to separate
  spørringer (medlemmer + profiler) joinet i JS — samme mønster som superadmin-panelet i
  `admin.html`. Render-form `{user_id, role, profiles}` uendret.

**Verifisert live (innlogget ksk@cenika.no):** firma-panelet → **Medlemmer (2)**: Kenneth
(ksk@cenika.no, Administrator) + Fredrik (fki@cenika.no, Administrator), med navn/e-post/rolle.
RLS-spørringer isolert: `organization_members` gir begge rader, `profiles` gir begge med
e-post. Ingen tverr-org-lekkasje (policy begrenser til `user_org_ids()`). Superadmin uendret.

**Filer:** [supabase-migration-org-member-visibility.sql](../supabase-migration-org-member-visibility.sql), romtegner.html (`_orgAdmRefresh`).

---

## 🚧 PÅGÅR — 4A: Eier-styrt leverandørtilgang per bedrift (RLS) — `4f3c17a`

**Status (pause 2026-06-22):** Migrasjonen er skrevet, committet OG kjørt i Supabase av
bruker. Admin-UI (Del 3) gjenstår.

**Gjort:**
- `supabase-migration-org-supplier-access.sql` (committet `4f3c17a`) — **kjørt i Supabase**:
  tabell `organization_supplier_access` + RLS (superadmin skriver, medlemmer leser egne),
  seed av eksisterende installatør-orgs, og ny produkt-policy «Produkttilgang via
  leverandor-grant» som erstatter «installatør ser alt». Verifisert: ny policy aktiv (1),
  gammel borte (0), suppliers=1 (Cenika), **installer_orgs=0, grants_seeded=0**.
- Bruker satte **kenneth.skretteberg@gmail.com = superadmin** (app_metadata) og logget inn på nytt.

**Faktisk tilstand i DB nå (viktig kontekst):**
- `kenneth.skretteberg@gmail.com`: **superadmin, tilhører INGEN firma** (ser alt via god-mode).
- `ksk@cenika.no`: **admin i «Cenika AS»** (eneste org, type=supplier). Ser 213 Cenika-produkter.
- Ingen installatør-orgs finnes → enhver ikke-superadmin/ikke-Cenika-bruker ser **0 produkter**.
- «Delte prosjekter» mellom gmail og ksk skyldtes superadmin-innsyn, ikke samme firma.

**Gjenstår (neste økt):**
1. **Avklar med bruker:** A) gmail forblir ren superadmin uten firma, eller B) opprett
   «Varmeplan» (installatør-org), meld gmail inn, og test installatør-flyten. (B anbefalt.)
2. **Del 3 — Admin-UI (`admin.html`):** per installatør-bedrift en «Leverandør-tilgang»-liste
   (alle `suppliers`) med av/på = innvilg/trekk tilbake → `organization_supplier_access`.
   Speil mønsteret fra `toggleProductAccess` (~admin.html:700) / org-detalj-kortet (~588).
   Ny `toggleSupplierAccess(orgId, supplierId, checked)` + last-funksjon.
3. **Test med tre kontotyper:** installatør (kun innvilgede), leverandør (kun egne), superadmin (alt).

**Filer:** [supabase-migration-org-supplier-access.sql](supabase-migration-org-supplier-access.sql),
admin.html (Del 3 kommer).

---

## 📌 STATUS pr 2026-06-22 — Folie auto-utlegg (gjenoppta-notat)

**Hvor vi står:** Folie-auto-utlegget er omarbeidet til montør-stil og verifisert mot
brukers eksakte 53 m²-rom (geometri hentet via konsoll; reprodusert lokalt innlogget).

- **Automatisk-panelet:** to valg — **Horisontal / Vertikal**. Begge bruker sone-teknikken
  for ikke-rektangulære rom (rektangler beholder dagens H/V). Bruker velger retning selv.
- **Pr sone:** full-lengde, vegg-forankrede kolonner; smal strimmel (B=20) absorberer
  forskyvninger/notch (montørens triks) → resten fulle. Ingen smale folier midt i arealet.
- **Brukers rom:** Vertikal **91 %**, Horisontal **94 %**, **0 regelbrudd**. Aldri folie i
  hindring; gap-/vegg-/overlapp-brudd = 0. Regresjon: rektangel 94 %, L 91 %, U 83 %.
- **Sentrale funksjoner:** `_decomposeRoomToRects` (rutenett + maks-rektangel),
  `_packZoneFullLength` (full-lengde + absorber), `_zonedDefsForDirection` (pr retning),
  `showAutoFillComparison` (H/V bruker sone-teknikk), `_layoutRulePenalty` (scoring-straff),
  `getStripViolations` (along-akse-vakt → ingen falske ⚠).

**✅ GODKJENT av bruker (2026-06-22):** visuelt bekreftet i appen — fulle B=140-kolonner +
smale B=20-absorbere ved forskyvninger, matcher montørens manuelle utlegg (`folie_optimalt`).

Evt. senere finjustering (ikke påkrevd): absorber-logikken i `_packZoneFullLength`
(targetLen-toleranse / plassering) hvis enkelte soner i andre rom får en uønsket kort strimmel.

**Alt committet og pushet til `origin/main`** (siste: `1b696e7`).

---

## 2026-06-22 — Folie: montørens full-lengde + smal absorber-pakking — `1b696e7`

Brukers manuelle teknikk: smal strimmel der en forskyvning er, så fulle lengder etter.
Ny `_packZoneFullLength` pr sone: bredeste produkt som gir FULL lengde forankret til vegg;
der ingen bredde blir full (forskyvning), legg smaleste som absorberer, fortsett med fulle.
Verifisert på brukers rom: nedre-høyre = B=20 absorber + 2× B=140 full lengde (var 1 kort
B=100). V 91 % (var 84 %), H 94 %, 0 regelbrudd. Regresjon: rektangel 94 %, L 91 %, U 83 %.

---

## 2026-06-22 — Folie: montør-stil utlegg, bruker velger retning — `b1e9596`, `b36cbc6`

Etter brukers referanse (folie_optimalt) + ønske om å velge retning selv:
- **Én retning i hele rommet** + **uniform bredde forankret inntil vegg** pr sone (ingen
  smale folier midt i arealet; det udekkede mot vegg). `_packZoneUniform` + «lange strimler»-
  scoring (få, brede, lange kolonner).
- **Horisontal og Vertikal i Automatisk-panelet bruker nå sone-teknikken** (`_zonedDefsForDirection`)
  for ikke-rektangulære rom → bruker velger retning selv. Separat «Soner»-kort fjernet. Enkle
  rom (≤1 sone) beholder dagens H/V (ingen regresjon).
- Klamp sone-rektangler til rommets bbox (siste grid-celle stakk forbi vegg → 15 mm-brudd).
- Falske gap-⚠ fjernet tidligere (along-akse-vakt i `getStripViolations`).
- Verifisert på brukers rom: Vertikal 84 % / Horisontal 85 %, begge én retning, 0 regelbrudd,
  få brede strimler forankret til vegg.

---

## 2026-06-22 — Folie «Soner»: rutenett-dekomponering (fikser dårlig dekning) — `a2ee334`

Brukerrapport: «Soner» ga store udekkede arealer på et ekte 53 m²-rom (stua <50 %).
Reprodusert med brukers EKSAKTE romgeometri (hentet via konsoll): slabb-dekomponeringen
la soner oppå hindringer og trimmet stua til en tynn kolonne.

- Ny `_decomposeRoomToRects`: rasteriser rom-interiør MINUS hindringer/forbudte soner i
  et rutenett (~6–12 cm), og hent grådig ut største all-fyllbare rektangel (`_largestRectInGrid`,
  histogram-metode), gjenta. Hindringer = naturlige hull; 25 mm-margin håndteres ved pakking.
- Verifisert på brukers rom: stua fanges som ekte 324×333-sone; Soner-dekning 95 % (var 80 %;
  H/V 52/46 %), 0 folie i hindring, 0 overlapp. Regresjon: rektangel → fallback; L 91 %, U 90 %.

**Oppfølging — falske ⚠ + vegg-margin** (`d733cf1`, `b4ab12e`)
- `getStripViolations` sin gap-sjekk manglet along-akse-vakten → strimler ende-til-ende i ulike
  soner ble feilflagget. Lagt til vakt → ekte overlapp=0 gir 0 gap-⚠. Maks dekning: 91 % helt rent.
- `_computeRectFillDefs` klippet mot sone-rektangelet (kan stikke litt utenfor rommet i grid-
  oppløsning) → 3 vegg-brudd i stua. Nå klippes mot ROMMET (riktig 25 mm margin) + begrenses til
  sonens along-rekkevidde. Soner på brukers rom: **94 % med 0 regelbrudd** (vegg/hindring/gap/overlapp).

---

## 2026-06-22 — Folie: aldri folie i hindring + scoring-straff (Del A/B/C)

Tre gjenstående folie-punkter, reprodusert empirisk FØRST (innlogget, ekte produkter).
Commits (nyeste først): `e701dce`, `2da21be`.

**Del A — aldri folie i hindring** (`2da21be`)
- Rotårsak: `_centerStripDefs` forskyver alle strimler perp (sentrering/skyv-mot-vegg)
  men re-klipper ikke lengden → en strimmel som var hindring-fri i sin kolonne havner
  over en hindring og beholder full lengde → folie i hindring (H/V «lange strimler»).
- Fiks: `_reclipDefsAroundObstacles` re-klipper hver def mot hindringer/forbudte soner
  ved sin (forskjøvne) pos og deler/forkorter. Brukt etter sentrering i begge strategier.
  No-op uten hindringer → ingen regresjon. Verifisert: 2 hindringer → 0 folie i hindring.

**Del C — straff regelbrudd + oppstykking i scoringen** (`e701dce`)
- `_layoutRulePenalty` trekkes fra `_foilLayoutStats.score`: folie i hindring ~1× romareal
  (dominerer), <25 mm 0,15×, svært korte strimler oppstykkingsstraff. → «Soner» blir kun
  ★ når den faktisk er bedre enn H/V. Rene layouts: straff 0 (uendret rangering).

**Del B — stable folie i samme kolonne manuelt** — ingen endring (allerede løst)
- Reprodusert grundig ('v'+'h', under/over, ulik bredde, full kolonne, 2–3 stablet):
  alle plasseres korrekt. `_withFoilAvoid`+`computeClippedSegments` deler faktisk kolonnen
  rundt eksisterende folie; along-vakten i `_stripOverlapsAny` gjør stabling lovlig. Prompten
  sin antatte rotårsak stemmer ikke. (Hard-refresh hvis det fortsatt feiler — send ev. repro.)

---

## 2026-06-22 — Folie: sone-basert utlegg + hindring-varsel (verifiser-først)

Fire sammenhengende folie-problemer (sone-utlegg, hindring-eksklusjon, uavhengige
arealer). Diagnostisert empirisk i koden FØRST (innlogget, ekte produkter). Commits
(nyeste først): `bab96f6`, `07866c5`, `f80a5c8`, `a591539`, `49c5e41`.

**Verifisering (read-only) viste at 4/3/2 alt var helt/delvis løst siden prompten:**
- **Problem 4 (uavhengige arealer)** — allerede løst: `_stripOverlapsAny`/`_clampStripToRoom`
  er 2D-lokale (along-akse-vakt), og auto-folie-unngåelse trekker fra hver folie som
  rektangel. Bekreftet med repro. Ingen endring.
- **Problem 2 (auto rundt hindring)** — fungerer: `computeClippedSegments` klipper
  strimler m/ margin rundt hindringer. Bekreftet. Ingen endring.

**Problem 3 — varsle folie oppå/under hindring** (`49c5e41`)
- `getStripViolations` sjekket bare avstand-til-kant, så en strimmel som overlappet
  (delvis/helt inne i) en hindring ble aldri flagget. Ny `_rectIntersectsPoly` (rect ∩
  polygon) → overlapp ⇒ avstand 0 ⇒ brudd. Samme varselmekanisme (modal + sidepanel),
  ved drag og plassering. Ingen falsk positiv når strimmelen er klar av hindringen.

**Problem 1 — sone-basert auto-utlegg** (`a591539`)
- `_decomposeRoomToRects`: ortogonalt rom → akse-justerte rektangler. `_packRectBestDir`:
  pakk hver sone uavhengig (clipPoly), velg retning (v/h) etter best dekning.
  `autoAddStripsZoned` (auto-knappen peker hit) bruker `_withFoilAvoid` så soner aldri
  overlapper; hindringer rutes rundt. Fallback til `autoAddStrips` for enkle/ikke-ortogonale
  rom (ingen regresjon). Låste regler består.
- Verifisert: L-form → 2 soner, 0 overlapp, sone-isolert, 0 folie under hindring;
  rektangel → fallback.

**Problem 1 — koblet inn i faktisk flyt + bedre dekning + robusthet** (`f80a5c8`, `07866c5`, `bab96f6`)
- Sone-utlegget lå i en sekundær knapp som hovedflyten ikke bruker. Nå tilbyr
  `showAutoFillComparison` et tredje «★ Soner»-kort (ved siden av Horisontal/Vertikal),
  via `_zonedFoilDefs` (defs uten å plassere; sentinel-strips så soner aldri overlapper).
- Adaptiv bredde per sone (bredeste folie som får plass → smalere fyller resten) + retning
  per sone etter dekket areal → kraftig bedre dekning (U-rom: H/V 57 % → Soner 87 %).
- **Robust dekomponering:** klyng/snap koordinater + soner garantert inne i rommet (snitt
  av flere skann). Fjernet den harde ortogonalitets-bailen som gjorde at håndtegnede
  (litt skjeve) rom aldri delte seg → «Soner» dukket aldri opp. Nå trigger den på ekte
  L/T/U-rom; >12 soner → fallback. Verifisert: noisy U m/ hindring → Soner 78 %, 0 overlapp,
  0 folie under hindring, 0 strimler utenfor rommet.

---

## 2026-06-22 — WBW-flyt (vegg-for-vegg): taster + mus

Raskere og mer naturlig vegg-for-vegg-opprettelse, uten å bygge nytt. Commits
(nyeste først): `e5ea346`, `6e023fe`, `601eb29`.

**Taster** (`601eb29`)
- Piltast (↑↓←→) legger veggen direkte i den retningen (var allerede på plass);
  beholder fokus+merk på lengdefeltet etterpå → rask repetisjon for rektangler.
- Skjerm-pilene speiler nå piltastene (`wbwDirPlace` = `setDir` + `addWbwWall`).
- Enter lukker rommet; en vegg som lander på startpunktet auto-lukker.
- Status + Taster-tooltip oppdatert til ny flyt.
- Fiks (`e5ea346`): `addWbwWall`/`undoWbwWall` kalte aldri `render()`, så en vegg lagt
  med piltast dukket først opp ved musebevegelse → kaller nå `render()` umiddelbart.
  Svak stiplet forhåndsvisning av neste vegg vises så snart en lengde er skrevet
  (live mens lengden endres); blir grønn når veggen vil lukke rommet.

**Mus** (`6e023fe`)
- Enter lukker nå i BEGGE moduser. Klikk nær startpunktet (≤ 14 px) lukker rommet
  (≥3 vegger); pekeren blir «pointer» når et klikk lukker.
- Grønn stiplet lukkelinje + forstørret start-prikk vises når musa er nær start,
  så det er tydelig at neste klikk lukker.
- Behold fast-lengde-forhåndsvisning som følger musa, Shift = frihånd, og auto-lukk
  når en festet vegg lander på start. Mus-tooltip/hint oppdatert.

Verifisert (innlogget): firkant via piltaster og via pek+klikk gir begge eksakt
300×300-rom; klikk-på-start og Enter lukker i musemodus.

---

## 2026-06-22 — Kabel-tilbehør ved PDF-eksport (typeavhengig)

Utvidet den deklarative tilbehørs-funksjonen til varmekabel, og gjorde hele tilbehørs-
lista typeavhengig. Commits (nyeste først): `f4e108e`, `ff51e3b`, `c57c88c`, `3720ce4`, `f445aec`.

**Typegating + kabel-tilbehør i modal** (`f445aec`)
- `showAccessoriesModal()` viser Varmefolie-seksjon KUN ved folie og Varmekabel-seksjon
  KUN ved kabel (begge hvis begge; matte alene → ingen). Avledet fra `S.strips`/`S.cables`.
- Ny deklarativ `CABLE_ACCESSORIES` + `_computeCableContext()`:
  - Strips svart (CV087193): 4/m → rund opp til hele 100-pk, viser utregningsgrunnlag.
  - Stålnett (CVA10900): per-rom sjekkliste, `ceil(netto_m2 × 1,10 / 0,92)` pr rom + live total.
  - Følerrør: 1 per kabel-rom; art.nr/EL-nr slås opp i katalogen, flagges hvis det mangler.
- Items merkes `type:'foil'|'cable'`. Ingen regresjon i folie-tilbehør/RKK.

**PDF/Excel gruppert per type** (`3720ce4`)
- PDF «Tilbehør» får egne underseksjoner (Varmefolie / Varmekabel) med art.nr/EL/enhet/
  antall; stålnett viser valgte rom, manglende katalog-nr flagges «OBS:».
- Excel Bestilling + Materialliste skiller tilbehør per type; stålnett-rom i Rom-kolonnen.

**Modal: ingenting forhåndsavhuket + ryddet stålnett-tekst** (`f4e108e`)
- Alle avkrysninger (folie, kabel OG stålnett-rom) starter UAVHUKET. Antallet vises
  fortsatt ferdig utfylt (redigerbart); kun avhukede poster tas med i rapport/PDF.
  «Total stålnett» teller bare avhukede rom (0 når ingen er valgt).
- Fjernet hjelpelinja over stålnett-lista (spec/art.nr) + «velg rom med brennbart
  underlag» → kun «Stålnett» + romliste (navn, areal, antall nett). Beregninger uendret.

**Art.nr/EL-nr hardkodet + avhuket som standard** (`c57c88c`, `ff51e3b`)
- Tilbehør ligger ikke i `heating_products`, så katalog-oppslaget fant dem ikke.
  Hardkodet art.nr + EL-nr (hentet fra cenika.no produktsider):
  - Strips svart **CV087193** · EL **1322300**
  - Stålnett **CVA10900** · EL **1001896**
  - Følerrør **CVA10526** · EL **5400784**
- Alt kabel-tilbehør er `defaultEnabled:false` (ikke valgt som standard); antallet vises
  fortsatt i feltene, så man bare huker av det som skal tilbys. Folie-tilbehør uendret.

Verifisert mot ekte data (innlogget): auto-regler 75 m → 300 strips / 3×100pk · bad 5,8 m²
→ 7 nett · 1 føler/rom; defaults avhuket m/ synlig antall; EL-nr følger med på items;
exportPDF kjører ende-til-ende uten feil.

---

## 2026-06-22 — Gulvtype (toppgulv) + read-only prosjektpresentasjon

To sammenhengende ting: gulvtype per rom med effekt-kompatibilitet, og en read-only
«som prosjektert»-presentasjon. Commits (nyeste først): `87c0bc4`, `9487807`, `d8d89cb`,
`1cab5da`, `5e75838`.

**Del A — Gulvtype + kompatibilitet** (`5e75838`)
- Nytt valgfritt `floorType` per rom (lagres automatisk via `_buildSaveData`).
- `FLOOR_TYPES` som data: maks anbefalt flateeffekt per gulvtype (flis/mikrosement/betong
  150, vinyl/laminat/parkett 100, teppe 60, annet/ukjent = ingen sjekk) — lett redigerbar.
- Ren funksjon `floorTypeCompat(floorType, wm2)` → ok/advarsel/none + delt banner
  `_floorCompatBannerHtml`. Toppgulv-velger + live varsel i UPC-panelet og hurtig-
  prosjekteringskortet. Degraderer pent når gulvtype mangler.

**Del B steg 1 — Presentasjonsmodus** (`1cab5da`)
- «▶ Presentasjon»-knapp i topbar. Gjenbruker editor-canvas + `render()` via
  `S.ui.present` (ingen ny tegning); `body.present-mode` skjuler all redigerings-chrome.
- Topptekst (prosjektnavn, «Prosjektert av <leverandør> for <firma>», dato) + nøkkeltall
  (antall rom, oppvarmet areal, total installert effekt). Leverandøruavhengig, nøytral
  default «Varmeplan». Read-only input: kun panorering/zoom; Escape avslutter.

**Del B steg 2 — Detaljpanel** (`d8d89cb`)
- Hold over (desktop) / trykk (mobil) et rom → fremheving (cyan kontur/glød) + detaljpanel:
  produkt + artikkelnr, installert W, flateeffekt, c/c, kabellengde, spenning, nominell
  motstand (R = U²/P), og toppgulv + kompatibilitet. Treff-test via `ptInPoly`.

**Del B steg 3 — Gulvtekstur + delelenke + PDF** (`9487807`, `87c0bc4`)
- Subtil gulvtekstur per gulvtype UNDER leggemønsteret: rutenett (flis/mikrosement/betong),
  bordmønster (laminat/parkett/vinyl), prikker (teppe).
- «🔗 Del lenke» genererer/lagrer `present_token` og kopierer `?present=<token>`. Boot-sti
  åpner prosjektet read-only uten innlogging via sikker `get_present_project`-RPC (anon kan
  ikke liste andre delte prosjekter). «⬇ PDF» gjenbruker `exportPDF()`.
- Ny migrasjon `supabase-migration-presentation.sql` (kjøres manuelt): `present_token`-kolonne,
  RPC, anon-lesetilgang til katalogtabeller. Mockup i `docs/Varmeplan-prosjektpresentasjon.html`.
- **NB:** Supabase-rundturen for delelenken er implementert men ikke testet mot live DB —
  test «Del lenke» + åpne lenken i privat vindu etter at migrasjonen er kjørt.

---

## 2026-06-18 — Hurtig prosjektering: «Lagre prosjekt»-knapp (commit 2f080da)

Tydelig lagre-kontroll nederst i romlista, som komplement til autolagringen.
- Teal «Lagre prosjekt»-knapp rett under «Opprettede rom»; deaktivert når lista er tom.
  Autolagrings-indikatoren i headeren beholdt.
- `_listSaveProject` → idempotent flush (`_saveToSupabase`) + toast «Lagret – finnes i
  prosjektlista og i feltappen»; knappen viser «Lagret ✓», og «Gå til prosjektliste»
  dukker opp (uten å tvinge navigasjon).
- Navngiving for gjenfinning: ved autonavn («Prosjekt – <dato>») ber `_listSaveNameDialog`
  om prosjektnavn (+ valgfri adresse) før lagring; ellers lagres direkte. Navnet skrives
  til `romtegner_projects.name` → søkbart i feltappen.
- Datastruktur uendret — samme record (rom + produkter i `data`) som feltappen leser; kun verifisert.

---

## 2026-06-16 — Import plantegning: tegnede rom, samlet meny, kalibreringsvalg, lag-filter, folie-label

Bygde ut PDF-importen (mot den delte motoren) så den også gir **ekte tegnede rom**, og
ryddet i import-UX etter testtilbakemelding. Commits (nyeste først): `e963ae4`, `9c679de`,
`81a8fcf`, `caf0c6a`, `2218a1d`, `fdd2fcc`, `23eb071`.

**Importer plantegning → tegnede rom** (`23eb071`, `fdd2fcc`)
- Ny adapter `_drawCreateRoomsFromReview`: motor-polygon (meter, Y-opp) → cm med Y-flip →
  `createRoom(pts,'polygon',navn,floorId,keepPosition=true)` = ekte rom m/ vegger, bevart
  innbyrdes plassering. Mål (`target` 'draw'/'list') tres gjennom review-flyten.
- «Importer plantegning» i tegne-verktøylinja (ctxbar) peker nå på motor-importen.

**Samlet import-meny** (`2218a1d`)
- Én «Importer plantegning»-knapp → `_importPlanMenu`: «Les av rom automatisk» (motor) eller
  «Tegn selv over bakgrunn» (PDF/JPG som bakgrunn, også skannede).

**Auto-les med bakgrunn + kalibrering i flukt** (`caf0c6a`, `81a8fcf`)
- Auto-les laster PDF som **bakgrunn** (pdf.js), bruker kalibrerer, så plasseres rommene
  nøyaktig oppå (kanonisk frame: PDF-punkt (0,0) = verden (0,0), skala fra kalibrert bakgrunn).
  Bakgrunnen blir liggende så møblering vises mens man tegner folie.
- Kalibrerings-overlayet tilbyr nå **begge** metoder: «Klikk to punkter (kjent avstand)» og
  «Fast målestokk (1:50)» (gjaldt før kun to-punkts). Gjelder all bakgrunnsimport.
- **Lag-filter:** auto-les henter PDF-lagene og lar bruker huke av vegg-lag (default
  vegg/yttervegg/skille) → kun vegger blir rom; møbler/inventar/tekst vises kun i bakgrunnen.

**Folie-stripe-label mindre på skjerm** (`9c679de`)
- Folie-stripe-labelen skaleres ned på canvas (lettere å lese romoppsett), men beholder
  passende størrelse i PDF-utskrift.

**Liste-import (hurtig prosjektering) — to skaleringsvalg** (`e963ae4`)
- PDF-importen i hurtig prosjektering får i tillegg til «Målestokk 1:__» et valg
  «Klikk et kjent mål i tegningen» (to-punkts via bakgrunn). Etter målsetting fortsetter
  alt som før: vegg-lag → liste med romnavn + areal.

**Forbehold (uendret):** selve motoren testes mot ekte vektor-PDF fra brukerens maskin
(sandkassen min når den ikke). Bakgrunn↔rom-justering kan trenge én finjusterings-runde på
en virkelig tegning. Lag-filteret virker kun hvis PDF-en har lag som skiller vegger fra møbler.

---

## 2026-06-15 (kveld) — Infra: motor deployet til Fly, mappe-organisering, feltapp-oppsett

Ikke `romtegner.html`-endringer, men workspace/infra fra samme økt — loggført for sporbarhet.

**Lumelo-motoren live på Fly.io**
- Deployet `~/Code/lumelo-backend` (FastAPI) → `https://lumelo-backend.fly.dev` (region arn,
  scale-to-zero). La til `Dockerfile`/`fly.toml`/`.dockerignore` + CORS for arqely.com i
  `app/core/config.py` + deploy/status-notis i `lumelo-backend/CLAUDE.md`. Commit i
  lumelo-backend: `95b45a5` (repoet har ingen remote ennå — kun lokal commit).
- Verifisert `GET /health` → ok (fra mobil; mitt sandkasse-miljø når ikke eksternt nett).
  Sandkasse-merknad: Bash/preview/WebFetch er nett-begrenset her → ekstern verifisering må
  gjøres fra brukerens maskin.

**Prosjektmappe-organisering** (`~/Documents/Claude Code/`)
- Den ekte koden til Lumelo bor i `~/Code` (ikke iCloud). La inn **symlenker** under Claude
  Code-mappa: `lumelo` → `~/Code/lumelo`, `lumelo-backend` → `~/Code/lumelo-backend`
  (samlet tilgang, men deps synkes ikke til iCloud).
- `Lumelo_Spec` → omdøpt til **`Lumelo_Spec (arkiv)`** (kun gammel plan/spec; den ekte koden
  er symlenkene). `arqely-mvp` = fortsatt rotmappa til Varmeplan-web.

**Ny app: Varmeplan Feltapp (Prompt 0 + oppsett)**
- Eget prosjekt for mobil feltapp (Expo/React Native), delt Supabase. Opprettet
  `~/Code/varmeplan-app` (+ symlink i Claude Code-mappa) med `docs/` (UX-prototyper +
  `supabase-schema/` = migrasjonene) og en `CLAUDE.md` som fanger Prompt 0-planen:
  offline-først (expo-sqlite + outbox), backend-kontrakt (rom i prosjekt-JSON, integer
  product_id, klient-genererte UUID-er, RLS via org-medlemskap), måleregler fra `suppliers`,
  navigasjon + 6-stegs byggeplan. Bygges i egen Claude Code-økt (Prompt 1).

---

## 2026-06-15 — Import plantegning: gjennomgangssteg, motor live, og liste-UX

Koblet PDF-import (mot den delte Lumelo-motoren) til hurtig prosjektering via et
fokusert gjennomgangssteg, og fikk **motoren live i produksjon**. Commits (nyeste
først): `aebdd88`, `d635d91`, `c8e0802`, `51b334b`, `021f21d`.

**Gjennomgangssteg (steg 2)** — `#import-review-screen` (`021f21d` la import, `51b334b` la gjennomgang)
- `_pdfImportRun` → `_pdfOpenReview(ImportResult)` i stedet for rett i lista.
- To synkroniserte ruter mot én kilde (`_reviewState.rooms`): SVG-plan (polygoner,
  bbox→viewBox, flip Y; teal=valgt, grå=fravalgt, gul=warn; klikk=toggle) + redigerbar
  liste (navn/areal/slett/legg til). Toveis hover via rom-id.
- Areal = shoelace(polygon, m²). `review[]` plasseres i riktig rom via `where`-punkt;
  navnløse rom → «Sjekk navn». Bulk (alle/ingen/forslag) + smart standard fra
  `_pdfGuessRoomType`. Gulvoppbygging lagres (`_floorBuild`). Adapter
  `_pdfCreateListRoomsFromReview` → `_listCreateRoomObj`.

**Motor live på Fly.io** (`c8e0802`, `d635d91`)
- `_engineUrl()`: `window.LUMELO_ENGINE_URL` → `localStorage['lumelo_engine_url']` →
  vertsbasert (arqely.com → `https://lumelo-backend.fly.dev`, ellers localhost:8000).
  Feil-dialog lar deg lime inn/lagre motor-adresse.
- Motoren (`~/Code/lumelo-backend`, FastAPI) deployet til Fly (`lumelo-backend.fly.dev`,
  region arn) — bekreftet `/health` = ok. Se [[project_lumelo_engine]].

**Liste-/import-UX** (`aebdd88`)
- Fiks blank side: `_pdfOpenReview` skjulte `#app`; `_reviewReturnToApp()` viser den igjen
  ved commit/avbryt → man lander rett i hurtig prosjektering.
- Prosjektnavn ved import (felt i gjennomgang-toolbaren → `S.project.name`).
  **Bugfiks:** `_ensureDraftProject` auto-navnga ALLTID ved autolagring og overskrev
  brukerens navn — nå kun når navnet er tomt.
- Valgt rom forsvinner ikke lenger fra lista: redigert rom blir værende i tabellen,
  uthevet (teal + ● + venstrekant); kortet får «Rediger rom: \<navn\>».
- Piltaster på Type/Klasse/Produkt/Etasje-nedtrekkene stepper valget med live CC + W/m².

Alt verifisert i preview (mock-import, ingen DB-skriving). Motor-deploy-artefakter
(`Dockerfile`/`fly.toml`/`.dockerignore` + CORS for arqely.com) ligger i `lumelo-backend`.

---

## 2026-06-13 — Autonom polering av dok-/garanti-/reklamasjonsmodulen

Kjørt autonomt (uten brukervalg) mens bruker var borte. Alt verifisert i preview
(parse + render + PDF-bygging med mock-state, ingen skriving til produksjons-DB).
Commits (nyeste først): `bf64a2d` (kode), + CLAUDE.md / Edge Function / denne loggen.

**Selvgjennomgang + buggfiks** (underagent-review av all ny kode)
- `_docUpdProduct`: `nominal_ohm` settes til `null` (ikke `NaN`) når effekt tømmes.
- `_claimMutate`: kaster nå feil ved mislykket `claim_events`-innsetting (ingen stille feil).
- `_docMeasOk`: robust fallback til standard-leverandør hvis `_docState` mangler
  (hindrer krasj ved PDF-bygging uten aktiv state).

**Montørens sak-status (les-only)** — `_claimStatusView`
- Fullført rom i doc-velgeren viser «Sak: <status>» når en reklamasjon finnes, og åpner
  en les-only statusvisning med tidslinje + «neste steg» (venter på godkjenning /
  godkjent → kontakt feilsøkefirma / avvist / lukket). Henter kun egne saker.

**Rikere garantibevis-PDF** — `_docBuildPDF`
- Leverandørfarget topp (hex→rgb for robust jsPDF-rendering).
- Fotodokumentasjon bygget inn som miniatyr-rutenett (2 per rad, automatisk sideskift).

**Dokumentasjon / scaffold**
- `CLAUDE.md`: ny seksjon «Documentation, Warranty & Claims Module (implemented)» —
  tabeller, RLS-mønster (JWT-superadmin), kodekart, z-index- og e-post-konvensjoner.
  Flyttet ut av «Future».
- `supabase/functions/send-warranty-email/` (index.ts + README): Edge Function for
  kunde-/leverandørkopi (Resend). **Inaktiv** til den rulles ut + secrets settes —
  README har deploy-steg og hvordan den kobles på i `_docGenerate`/`_claimSubmit`.

**Gjenstår til bruker (krever valg/nøkler):** rull ut Edge Function (Resend-nøkkel +
verifisert domene) og koble den på; «del med huseier»-offentlig visning (krever ny
anon-RLS-policy via share_token — egen migrasjon).

---

## 2026-06-12 — NY MODUL: Dokumentasjon & garantiportal (Fase 1–3, hele Prompt 0→3)

Bygget en komplett dokumentasjons-, garanti- og reklamasjonsmodul oppå eksisterende
prosjekt/rom/produkt/innlogging. Alt verifisert i preview (UI + PDF) og ende-til-ende mot
Supabase (lagring + reklamasjonsflyt, med opprydding av testdata). Pushet til `main`.
Commits (nyeste først): `8bf26f9` (Fase 3), `1176ed0` (Fase 2), `e48b862` (Fase 1).

**Migrasjoner (kjørt i Supabase, ren ASCII, idempotente)**
- `supabase-migration-documentation.sql` — `suppliers` (leverandør som data, seed Cenika m/
  måleregler ±10 %, >10 MΩ @ 500 V), `supplier_id` FK på `heating_products` (integer, ikke uuid),
  `warranty_certificates`, `certificate_products`, `measurements`, `certificate_photos`, RLS + privat
  `documentation` storage-bucket.
- `supabase-migration-claims.sql` — `claims`, `claim_events` (tidslinje), `claim_photos`, RLS.
- **RLS-lærdom:** superadmin-policyer må lese `is_superadmin` fra `auth.jwt() -> 'app_metadata'`,
  IKKE `SELECT FROM auth.users` (authenticated mangler tilgang → 42501; separate policyer
  kortslutter ikke slik OR-uttrykk inni én policy gjør).

**Fase 1 — Dokumentasjon (`e48b862`)**
- Ny «Dokumentasjon»-fane (prosjekt-/rom-velger) + rollestyrt «Garantiportal»-fane (kun
  `org_type='supplier'`) + «Dokumentér»-snarvei i rom-høyreklikkmeny.
- Mobil `#doc-screen` 5-stegs veiviser: bekreft produkter (prefill fra tegning, nominell R=U²/P)
  → installasjon & styring → måleverdier m/ live validering (grønn/rød) → foto med faste slots
  → sjekkliste + signatur → genererer garanti-ID, lagrer bevis + PDF (jsPDF) til skyen.

**Fase 2 — Garantiportal (`1176ed0`)**
- KPI (totalt, denne måneden, med avvik, aktive firma), filtrert bevisliste (søk + status + firma +
  periode), detaljpanel med fargekodet måletabell (mot leverandørtoleranse), foto via signerte
  storage-URL-er, «Åpne PDF». RLS «Supplier orgs read their certificates» filtrerer automatisk.

**Fase 3 — Reklamasjon (`8bf26f9`)**
- Mobil `#claim-screen` «Meld feil» (kanal app + telefon → samme sak): feiltype, kundebeskrivelse,
  feilsøk (R/iso/foto), anbefalt tiltak, feilsøkefirma, kunde-e-post → sak m/ tidslinje.
- Portal under-nav Garantibevis|Reklamasjoner: statistikk (antall, samlet kostnad, vanligste årsak,
  andel dekket), saksliste, saksdetalj med tidslinje + **godkjenningssteg** (Godkjenn/Avvis —
  feilsøkefirma sendes ikke ut før godkjent) + kostnad + utfall (godkjent/delvis/avslått → lukk).
- Innganger: «⚠ Meld feil» på fullført rom i doc-velger + «Registrer telefonsak» i bevisdetalj.

**Bevisste valg / gjenstår**
- Leverandør som data (ØS Varme = «én ny rad»). Egne tabeller, ikke prosjekt-JSON (portal-søk på tvers).
- Skjermer `#doc-screen`/`#claim-screen` må ha z-index > 1001 (dashbordet `#project-list-screen` = 1001);
  portal-modal z-index 2000.
- E-post (kunde-rutinevarsel + leverandør/montør-kopi) utsatt til Supabase Edge Function — vises som
  info; alt lagres i skyen uavhengig. `share_token` finnes på beviset for senere «del med huseier»-lenke.

---

## 2026-06-10 — ØKT-OPPSUMMERING (stor økt: kabel-, folie-, matte-, soner- og plantegning-arbeid)

Detaljerte oppføringer pr. punkt under. Alt verifisert (mest numerisk in-memory pga. treg test-fane
mot slutten) og pushet til `main`. Commits (nyeste først): `83eeab3`, `438cc2d`, `3762ab9`,
`3a36364`, `e81773b`, `fd1a8eb`, `0bc8953`, `81626be`, `053b363`, `d18ce32`, `f810848`, `28422d8`,
`298d11e`, `193e8d6`, `720947a`, `fd78476` (+ tidlig: `616a110`, `6dee009`, `bc0d773`).

**Varmekabel**
- `fd78476` V6 honorerer valgt RETNING (`dirExplicit`) — slutt på «velger horisontalt, legger vertikalt».
- `720947a` L/T horisontalt → ren boustrophedon-serpentin; + 5 cm perp-margin fra indre parallelle vegger.
- `193e8d6` auto-retning foretrekker den rene (godt-fyllende) boustrophedon-retningen.
- `3a36364` «Del i N like soner» med eksplisitt horisontal/vertikal-toggle (hard honorering, felles CC).
- `83eeab3` rene multi-kabel-soner i komplekse rom (betinget vertex-snap + ingen skew i soner).
- (tidlig: retningsvelger-reapply, L-diagonal→ortogonal, rektangel-starthjørne.)

**Varmefolie**
- `f810848` «lange strimler vegg-til-vegg» som default (mot fragmentering) + bryter «Maks dekning».
- `e81773b` ALDRI folie over folie (hard invariant: footprint-subtraksjon ved fyll + retnings-uavhengig overlapp).

**SONER (utleggingssoner)**
- `28422d8` del et rom i navngitte soner via delelinjer; folie pr. sone, per-kant margin (yttervegg vs delt grense).

**Hindring**
- `298d11e` fri plassering + mykt vegg-snap (`clampHindringToRoom` omskrevet: containment + sann segment-avstand).

**Plantegning / bakgrunn**
- `d18ce32` «Fast målestokk» (1:50) alltid tilgjengelig + eksakt for PDF.
- `053b363` deselekter bakgrunn etter skalering (henger på skalerings-baren).
- `81626be` + `0bc8953` lås kalibrert underlag (klikk-felle), også eksisterende prosjekter.
- `fd1a8eb` bakgrunn lekket til andre prosjekter (async onload-race) — token-guard.

**Matte (EcoMat innendørs)**
- `3762ab9` EcoMat 60T/100T/150T-utlegg: bredder inntil hverandre + kald sone, hele matta delt i N like bredder.
- `438cc2d` innendørs: tydeligere produkt-label (unna romnavn), kabel-label alltid synlig, matter unngår hindringer (5 cm), matte-gap min 0 (folie-modell).

**Anbefalt neste steg (ikke gjort):** felles kabel/folie/matte-INVARIANT-spec + testliste alle motorer
må bestå (5 cm margin, lik CC, hjørne-start/stopp, eksplisitt retning hard, aldri overlapp, ingen
diagonal/rar form, fyll til vegg) — fanger samme rot-klasse systematisk. Venter på «si fra».

---

## 2026-06-10 — Varmekabel: rene multi-kabel-soner i komplekse rom (Gang) — betinget vertex-snap + ingen skew i soner

Symptom: Gang (~37 m²) delt i 2 like soner — sone 1 ren serpentin, sone 2 (irregulær equal-area-
halvdel) fikk «rare former» (skew-løp, skrå/ujevne U-svinger) og fylte ikke til veggene.

### Rotårsak
`_buildNCableZones` kuttet med `_equalAreaBandBounds` (lik areal → lik CC), men på et komplekst rom
ble sone 2 IRREGULÆR → `_autoFillCableImpl` sin `needSkew = !rectilinear || …` falt til
`generateCableSkew` → skrå løp / rare former.

### Fix (to prong)
1. **Betinget vertex-snap** (`_buildNCableZones`): re-innført `_snapBoundsToVertices` — snapper hvert
   indre kutt til nærmeste rom-hjørne/innhakk, MEN bruker det kun når sonene holder seg ~like store
   (areal-avvik ≤ 10 %); ellers beholdes equal-area-kuttet. Gir mest mulig REKTANGULÆRE soner uten å
   ødelegge lik CC.
2. **Ingen skew i soner** (`_noSkew`-flagg på sone-temp-rommet): `needSkew` respekterer nå
   `room._noSkew` → multi-kabel-soner bruker ren aksejustert serpentin (boustrophedon/V6, ortogonal
   kobling) i stedet for skew. «Heller jevnt udekket inntil vegg enn skrå/rotete løp» (Kenneths regel).

### Verifisert (numerisk; in-memory, ingen konsoll-feil)
- L-korridor (~35,8 m²) delt i 2, begge retninger: BEGGE soner = **boustrophedon**, `pathEls:0` (ingen
  skew), `nConn:0` (ingen diagonal kobling), lik CC 12,7 cm, ~140 m kabel hver (≈99 % dekning).
- Ingen regresjon: rektangel delt i 2 → begge boustrophedon (uendret); enkel kabel i SKRÅTT rom →
  bruker fortsatt skew (pathEls 51), siden `_noSkew` kun gjelder sone-temp-rom.

> Spec-en anbefaler sterkt en felles «kabel/folie/matte-invariant-spec» med testliste alle motorer
> må bestå (5 cm margin, lik CC, hjørne-start/stopp, eksplisitt retning hard, aldri overlapp, ingen
> diagonal/rar form, fyll til vegg). Ikke laget ennå — venter på «si fra».

---

## 2026-06-10 — Innendørs: tydeligere label + kabel alltid synlig + matte-hindring + matte-gap (4 punkter)

1. **Tydeligere produkt-label, unna romnavn:** font opp (strimmel 7–11 → 12–15 px; kabel 10 → 13;
   matte 12 → 13) og labelen FORSKYVES langs objektets lengde vekk fra rom-sentroiden (strimmel/
   kabel: ~28 % mot enden lengst fra sentroiden; matte: ~halvveis mot en ende), så den aldri ligger
   oppå romnavnet (som tegnes i sentroiden). Rammet 2-linjers-oppsett beholdt.
2. **Kabel + label ALLTID synlig:** kabel-labelen var gated på `S.ui.showStripLabels` (folie-toggel)
   → fjernet for kabel. Kabel-geometri OG label vises nå permanent uansett valgt rom/objekt (kun
   `cable.labelVisible===false` skjuler en enkelt). Valgt kabel uthives fortsatt.
3. **Matter unngår hindringer (5 cm):** `autoFillMatSerpentine` brukte før kun rom-bbox og rørte
   ALDRI `S.hindrings`. Nå inflateres hver hindring med veggmarginen (5 cm) og det brukbare
   rektangelet krympes grådig til største hindrings-frie side → ingen matte på/innen 5 cm av en
   hindring (verifisert: bunn-hindring y=300 → matte stopper y=282). Sentral hindring → matta havner
   på den største frie siden; per-løp-klipping rundt indre hindringer er en senere refinement.
4. **Matte-gap som varmefolie (min 0):** gap-panelet (`openMatGapPanel`/`setMatGap`/`stepMatGap`) er
   nå modul-bevisst — innendørs: min 0 / default 0 (matter inntil hverandre, sentrert) / max 5; snø
   (Ute/InSnow): beholder min 5 / standard 10 / max 20. Fikset `cm||10`-bug som gjorde 0→10. Motoren
   bruker bruker-gapen (default 0), sentrerer blokka → rest = kald sone likt på veggene. EcoMat-
   tvang-til-0 erstattet med denne (default 0 = samme edge-to-edge).

Verifisert: render m/strip+matte+ny label-kode 3 ms uten feil; hindring-unngåelse + gap 0/3/steg
numerisk. Items 1–2 (visuelt) bekreftet via kode + feilfri render — fin-justering av label-størrelse/
plassering kan vurderes visuelt (kunne ikke ta skjermbilde pga. treg test-fane).

---

## 2026-06-10 — EcoMat innendørs: matte-utlegg etter Kenneths modell (bredder inntil hverandre, hele matta delt i N)

Spec basert på 3 Cenika-produktblad (EcoMat 60T/100T/150T) + teknisk tegning TPL-ECOMT-CA-2183.

### Produktdata
- **Supabase hadde allerede ekte EcoMat-rader** (57 stk, laget 2026-03-11) med riktig
  cc/kutt/bredde/areal/W/art.nr/el.nr. Derfor: ikke dupliser — `_ensureEcoMatProducts()` injiserer
  hele katalogen (60T/100T/150T, 19 størrelser hver, 0,5×2m…0,5×30m, CVA10100–10158, el 1013743–
  1013799, fra produktbladene) KUN som fallback hvis ingen finnes.
- `_normalizeEcoMat()` markerer ALLE EcoMat-produkter (Supabase eller fallback) med
  `mat_equal_widths=true` (Supabase-radene mangler flagget). CC/kutt fra tegningen: 60T/100T = 120/
  240 mm, 150T = 80/160 mm; bredde 500 mm; W/m² 60/100/150.

### Matte-motor (`autoFillMatSerpentine`, gated på `mat_equal_widths`)
- **Bredder INNTIL hverandre:** `gapCm` tvinges til 0 for EcoMat → N = floor(brukbar bredde / 50 cm)
  eksakt; blokka sentreres → rest = kald sone likt på begge yttervegger (ikke jevn-fordelt gap som
  før). Seam-klaring kommer fra kant-inntrekket (2,5 cm hver side → ~5 cm kabel-til-kabel).
- **Størrelsesvalg snudd (Kenneths modell):** velg STØRSTE variant der (mat_total_length / N) ≤
  brukbar lengde; fordel HELE matta i N like bredder à (total/N), rundet NED til kutt-intervallet.
  Erstatter «minste matte ≥ behov + snap til rom». Bruker hele matta, minimer svinn, kald sone i
  lengde-enden.
- Retning respekterer delt retningsvelger; forhåndsvis-før-godta som ellers.

### Verifisert (numerisk; render 14 ms — ingen freeze)
- **Spec-eksempel 210×400, 100T:** N=4, velger 0,5×14m (700 W), 4 bredder à 336 cm (3,5m snappet
  til kutt 24cm), gap 0, **5 cm kald sone hver yttervegg**, brukt 13,4 av 14m. Matcher eksempelet.
- 260×600 100T → 0,5×28m, N=5. 210×400 150T → 0,5×14m (1050 W), N=4. 300×500 150T → 0,5×24m, N=5.
- Ikke-EcoMat-matter (InSnow utendørs) uendret (jevn-fordelt gap beholdt).
- Stats: produktets `total_effect_w` / `mat_area_m2` (ratet effekt), som InSnow.

---

## 2026-06-10 — Varmekabel: «Del i N like soner» med eksplisitt horisontal/vertikal-valg

Kenneth: del et stort rom (~37 m²) i 2–3 HELT LIKE soner → like kabler med jevn CC, og velg
eksplisitt om rommet deles horisontalt eller vertikalt. Motoren fantes (`_buildNCableZones`:
equal-area-soner + felles CC + like kabler); manglet UI + hard styring av retning.

- **UI:** delretning-toggle [Auto] [Horisontalt] [Vertikalt] i kabel-panelets manuell-/«Flere
  kabler»-seksjon (`_cableSplitToggleHtml`/`_setCableSplitDir`, modul-var `_cableSplitDir`).
  Antall = eksisterende count-input. «Forhåndsvis ›» bygger forslaget.
- **Hard honorering:** `_cableManualPreview` → `_cablePreviewPlace(...,splitDir)` →
  `autoFillMultiCable(roomId, productId, n, splitDir)` → `_autoFillNCables(forcedDir)`. forcedDir
  bygger KUN valgt retning (samme harde override som dirExplicit). Map: Horisontalt→'h'
  (horisontale delelinjer, soner stablet), Vertikalt→'v' (vertikale delelinjer, soner side om
  side). De power-drevne multi-kabel-knappene honorerer også toggelen (default `_cableSplitDir`).
  Auto (null) = motoren velger som før.
- **Beholdt:** equal-area-kutt (`_equalAreaBandBounds`), felles `sharedCC`, half-CC-sømmer → N
  identiske kabler med jevn CC også over sone-grensene.
- **Verifisert (37 m² rom, prod InFloor 10T 50m):** 3 vertikalt → 3 kabler alle 'v', soner
  [0–247][247–493][493–740], CC 24,7 cm identisk, 50 m hver; 3 horisontalt → alle 'h', samme CC;
  2 vertikalt → 2 like; Auto → motoren velger. Visuelt bekreftet (K1/K2/K3 side om side, identiske).
  Ingen regresjon på énkabel. Ingen konsoll-feil.

---

## 2026-06-10 — Varmefolie: ALDRI folie over folie (hard invariant)

Symptom: en folie (lang strimmel) la seg OVER andre folier. Krav: folie skal aldri overlappe
folie — stopp en klaring (≥ folie-gap) før eksisterende folie, uansett retning/sone/fyll-sti.

### Rotårsak
- Overlapp-vernet (`_stripOverlapsAny`) sjekket bare folier i SAMME retning (`_stripsForRoomDir`).
- `computeClippedSegments` klippet mot rom-polygon + hindringer + forbudt-soner, men ALDRI mot
  eksisterende folier → fyll/sone-fyll/lange-strimler kunne legge en folie rett oppå andre.

### Fiks
- **Footprint-subtraksjon i `computeClippedSegments`** (kjernen): ny modul-kontekst `_foilAvoidCtx`
  (`{roomId, excludeIds}`), satt via `_withFoilAvoid(roomId, exclude, fn)` rundt hver fyll-operasjon.
  Når satt, subtraheres footprinten til ALLE eksisterende folier i rommet (alle retninger/soner),
  inflatert med folie-gap, akkurat som en hindring — UNNTATT batchen som erstattes (unngår
  selv-blokkering). Opt-in → editorer/ikke-fyll-stier uendret.
- **Wiret i alle fyll-stier:** auto-fyll-sammenligning (ekskluder samme kategori), sone-fyll
  (ekskluder samme sone — peker på det EKTE rommet siden sone-fyll bruker temp-rom), manuell
  drop/preview (ekskluder ingen). «Lange strimler» går gjennom samme `computeClippedSegments`.
- **Retnings-uavhengig overlapp** i `_stripOverlapsAny`: i tillegg til samme-retning-logikken,
  ekte verdens-rektangel-nærhet (`_stripWorldRect`/`_rectsWithin`) mot folier av MOTSATT retning →
  manuell plassering/drag og sikkerhetsnett blokkerer kryssende folier.

### Verifisert (numerisk; ingen konsoll-feil)
- Eksisterende horisontal folie (y150–169); ny vertikal ved x180: uten vern ett løp y3–297 (overlapp);
  MED vern splittet y3–147 + y172–296 → stopper 3 cm (gap) før, ingen overlapp. Kryss-retning flagges.
- Sone-fyll: 0 overlapp mellom nabosoners folie (6 par sjekket).
- Ingen regresjon: rent rektangel auto-fyll uendret (2 striper/91 %); klaringen = folie-gap (holder
  SONER-skjøtens half-gap konsistent; «~5 cm ende-mot-side» er tilnærmet med gap — kan økes om ønsket).

---

## 2026-06-10 — Plantegning BUGFIX 4: bakgrunn «lekket» til andre prosjekter (async race)

Bruker: «bakgrunnstegningen jeg la inn på et prosjekt har lagt seg inn som bakgrunn på alle mine
lagrede prosjekter — ble ok igjen etter en refresh».

- **Rotårsak:** i `_restoreProject` lastes bakgrunns-bildet ASYNKRONT (`bImg.onload`). Åpner du
  prosjekt A (med bg) og så B, kan A-bildets `onload` fyre ETTER at B har nullstilt `S.bgs` →
  A-bakgrunnen skrives inn i B sitt `S.bgs`. Rent i minnet (derfor «ok etter refresh»); lekker bare
  til lagring hvis man lagrer mens den feil-bakgrunnen vises.
- **Fiks:** innlastings-generasjon `_bgRestoreGen` bumpes ved hver prosjekt-åpning; hver async
  bg-`onload` fanger generasjonen ved planlegging og skriver KUN hvis den fortsatt er gjeldende
  (`if (_myBgGen !== _bgRestoreGen) return`). Stale bilder fra et tidligere prosjekt ignoreres.
- **Verifisert:** to prosjekter åpnet etter hverandre gir konsistent `S.bgs` (ingen lekket bg),
  ingen feil.
- **Merk til bruker:** lekkasjen var i minnet → dine LAGREDE prosjekter er trygge (en refresh
  fjernet den). Hvis et prosjekt likevel viser feil bakgrunn ETTER refresh, si fra — da kan en
  feil-bakgrunn ha blitt lagret, og jeg rydder den.

---

## 2026-06-10 — Plantegning BUGFIX 3: auto-lås kalibrert underlag ved innlasting (eksisterende prosjekter)

Oppfølger: bruker fortsatt fast + «vis/skjul gjør ingenting». Reproduserte HELE den ekte flyten
interaktivt (importer → «Sett målestokk nå» → 2 klikk → 5 m → fullfør): etter kalibrering kommer
den kombinerte «BAKGRUNN Vis/opacity … | TEGN ROM Rektangel/Mål/…»-baren, klikk i tegningen holder
seg der (bg låst), og vis/skjul SKJULER tegningen korrekt. Altså: med gjeldende kode virker alt.

- **Sannsynlig årsak for «fortsatt fast»:** (a) deploy/cache-etterslep (eldre versjon i nettleseren),
  eller (b) eksisterende prosjekt med en ALLEREDE kalibrert, ULÅST bakgrunn — auto-låsen i bugfix 2
  gjelder bare NYE kalibreringer.
- **Fiks (b):** `_restoreProject` låser nå et kalibrert underlag ved innlasting
  (`if (bg.img && !bg._needsCalibration) bg.locked = true`) → eksisterende prosjekter blir også
  klikk-trygge (klikk går gjennom underlaget). Lås opp via lås-knappen for å flytte det.
- **Verifisert:** ulåst bg → klikk treffer; låst bg → klikk går gjennom (`_hitBgLayer` null).
  Full ekte kalibrerings-flyt gir «Tegn rom»-bar; vis/skjul fungerer.
- **Til bruker:** symptomene matcher å kjøre eldre kode — gjør en HARD refresh (Cmd/Ctrl+Shift+R)
  for å hente nyeste versjon.

---

## 2026-06-10 — Plantegning BUGFIX 2: lås underlaget etter kalibrering (klikk-felle)

Oppfølger: «jeg kan skalere og den går over til opprett-rom-baren, men hvis jeg klikker i tegningen
går den tilbake til plantegning-baren — kommer meg ikke ut.»

- **Rotårsak:** et kalibrert, ULÅST bakgrunns-lag er klikk-valgbart (`_hitBgLayer` treffer det).
  Etter skalering var baren riktig, men ETHVERT klikk i tegningen valgte bakgrunnen igjen →
  «Plantegning … Skaler på nytt»-baren kom tilbake, og man satt fast.
- **Fiks:** `confirmBgCalibrate` og `confirmFixedScale` setter nå `bg.locked = true` etter fullført
  kalibrering. `_hitBgLayer` hopper over låste lag → klikk går GJENNOM underlaget, så man tegner rom
  fritt. Lås opp igjen via lås-knappen (plantegning-ctxbar eller sidepanelets lag-liste) for å
  flytte/transformere underlaget. Standard CAD-oppførsel for et referanse-underlag.
- **Verifisert:** etter både fast målestokk og 2-punkts er `bg.locked=true`, `_hitBgLayer` ved et
  punkt inne i tegningen returnerer null, og klikk-kandidatlista er tom → ingen utilsiktet
  bg-seleksjon. `includeLocked`-stien finner det fortsatt for eksplisitte operasjoner.
- Merk: gjelder NYE kalibreringer. Eksisterende prosjekter med ulåst kalibrert underlag: lås det
  én gang via «Lås»-knappen i plantegning-baren, så går klikk gjennom.

---

## 2026-06-10 — Plantegning BUGFIX: «henger på skalerings-baren» etter kalibrering

Bruker: «det skjer ikke noe når jeg skalerer eller setter målestokk … nå vises kun topbar for
skaleringsvalg hele tiden» (tidligere kom rom-innsetting opp etter skalering).

- **Rotårsak:** når skalering trigges fra den VALGTE bakgrunnen (selectedBg satt — f.eks. via
  «Skaler på nytt»/«Målestokk 1:_» i plantegning-ctxbar-en), nullstilte hverken `confirmBgCalibrate`
  eller `confirmFixedScale` `S.ui.selectedBg`. Skaleringen BLE utført (widthCm endret), men
  bakgrunnen forble valgt → ctxbar-en hang igjen på «Plantegning … Skaler på nytt»-baren i stedet
  for å gå til «Tegn rom». Føltes som «det skjer ikke noe».
- **Fiks:** begge funksjonene nullstiller nå `S.ui.selectedBg = null` (i tillegg til
  selectedRoomId/selectedWallId) → ctxbar-en går korrekt til rom-innsetting etter skalering.
- **Verifisert:** både fast målestokk (1:50) og 2-punkts kalibrering trigget fra valgt bakgrunn gir
  nå `selectedBg=false` og ctxbar «Tegn rom … Rektangel/Mål/Polygon». Ingen konsoll-feil.

---

## 2026-06-10 — Plantegning: «Fast målestokk» (1:50) alltid tilgjengelig + eksakt for PDF

Bruker meldte «får ikke skalert tegning lenger» og ønsket målestokk-forhold (1:50) som tillegg.

### Funn (bug-undersøkelse)
- 2-punkts-kalibreringen (`startBgCalibrate` → klikk 2 punkter → `confirmBgCalibrate`) er IKKE brutt:
  verifisert ende-til-ende i appen (klikk 1 → punkt 1, klikk 2 → modal → skalerer; A4 100 px = 5 m
  ga riktig faktor). Logikken i både `confirmBgCalibrate` og `confirmFixedScale` er korrekt.
- Reell mangel: **«Fast målestokk» (forhold) var bare tilgjengelig på en NYIMPORTERT, ukalibrert
  tegning** (ctxbar-grenen `notCalibrated`). Når tegningen først var kalibrert og du valgte den for
  å re-skalere, fantes bare «Skaler på nytt» (2-punkts) — ikke forholds-skalering. Det forklarer at
  man «ikke får skalert» via forhold etterpå.

### Endringer
- **«Målestokk 1:_»-knapp lagt til i den valgte-plantegning-ctxbar-en** (ved siden av «Skaler på
  nytt») → forholds-skalering er nå tilgjengelig når som helst, ikke bare ved import.
- **Eksakt 1:50 for PDF:** ved PDF-import fanges den fysiske sidestørrelsen fra PDF-ens punkt-mål
  (`vp.width/RENDER_SCALE / 72 * 2.54`) og lagres som `bg.paperWidthCm/paperHeightCm`.
  `confirmFixedScale` bruker den når den finnes → 1:50 blir nøyaktig (A4-landskap 29,7×21 cm →
  1485×1050 cm). Raster-bilder (JPG/PNG) har ingen pålitelig fysisk størrelse → faller tilbake til
  150-DPI-antagelse som før.
- `_installBgImage(...,meta)` lagrer/nullstiller sidestørrelsen; rastersti uendret.

### Verifisert
- PDF (A4) 1:50 → 1485×1050 cm eksakt; raster 1:50 → 150-DPI-fallback; knappen vises i bg-ctxbar;
  2-punkts-kalibrering fungerer fortsatt. Ingen konsoll-feil.
- Merk: jeg klarte ikke å reprodusere en brutt 2-punkts-flyt — hvis «får ikke skalert» fortsatt
  skjer, trengs det konkret symptom (hvilken knapp, hva skjer).

---

## 2026-06-10 — Varmefolie: «lange strimler vegg-til-vegg» som default (mot fragmentering)

Snur folie-prioriteringen fra «maks dekning» til **få, lange, ensartede strimler vegg-til-vegg**,
med en bryter for de som vil ha maks dekning. Løser runde-2-folie-punktet (fragmentering i
uregelmessige/trappetrinn-rom) — og forbedrer samtidig folie-dekning i uregelmessige SONER.

### Rotårsak (fragmentering)
- `chooseBestProduct` byttet til SMALERE folie når en kolonne ble klippet <90 % (mot et
  trappetrinn) → patchwork av bredder.
- `_autoFillRoomOnce` lagde én strimmel pr. SEGMENT → en kolonne ble delt i hoved + kort topp-bit.
- `_scoreFoilLayout` maksimerte AREAL (straffet antall svakt) → «maks dekning» vant.

### Fiks
- **Strategi-flagg** `S.varmefolie.foilStrategy`: `'long'` (default) | `'coverage'`. Bryter i
  auto-plasserings-panelet («Lange strimler» / «Maks dekning»), `_setFoilStrategy` re-kjører.
- **`_autoFillRoomOnce(...,longMode)`**: ÉN ensartet bredde for hele rommet (ingen per-kolonne
  nedskalering), og ÉN strimmel pr. kolonne (lengste sammenhengende segment). Godtar litt udekket
  langs grunne/uregelmessige kanter.
- **`_longStripsLayout`**: prøver HVER ensartet bredde × begge sweep-ender, velger beste long-score
  → bredt for rektangel, smalere der bredt knapt får plass (L/arm-soner) → god dekning med få,
  lange strimler. Brukt av `_autoFillBothDirections` (default-stien) og `_fillSoneFoil`.
- **`_scoreFoilLayout` 'long'-profil**: maks dekket areal MINUS reell kostnad pr. strimmel (≈8 % av
  romarealet) og pr. ekstra breddetype (≈12 %) → en ekstra strimmel/kobling må «fortjene plassen»
  i dekning. Retning velges av denne scoren (lengste/færreste vinner).
- Når retning ikke er eksplisitt valgt: scoren foretrekker naturlig retningen med lengst strimler.

### Verifisert (numerisk; ingen konsoll-feil)
- Rektangel 400×300: long = 2 striper / 1 bredde / 91 % vs coverage = 3 / 2 bredder / 94 %.
- Trappetrinn-rom: long = 2 / 1 / 87 % vs coverage = 3 / 2 / 94 %.
- L-formet sone (Vindfang Sone 2): long = **57 %** (2 striper) — bedre enn coverage 43 %, og fikser
  en mellomliggende 27 %-regresjon (bredeste-uniform alene).
- «Maks dekning»-bryter gir dagens tettere/mer oppdelte layout (eksisterende motor uendret).
- Vanlig rom-folie i coverage-modus uberørt; `computeClippedSegments`/`_autoFillRoomOnce`-tillegg
  bakoverkompatible.

### Ikke gjort (informativt, ikke blokkerende)
- Eksplisitt markering «trenger tilførsel fra begge ender / skjøt» for svært lange strimler er
  ikke lagt til (antall striper i panelet = antall tilkoblinger; ingen hard produkt-maks kjent).

---

## 2026-06-10 — SONER: del et rom i navngitte utleggingssoner (Kjerne)

Ny feature: del ett rom i flere SONER med delelinjer, fyll folie pr. sone med individuell
retning og per-kant margin. Scope «Kjerne først» + rette delelinjer vegg-til-vegg (bekreftet
med bruker). Bygger på eksisterende sone-/folie-infra. Verifisert numerisk + visuelt på ekte
Bloksbergveien/Vindfang og syntetiske rom; ingen konsoll-feil; ingen regresjon på vanlig
rom-folie.

### Datamodell
- Ny `type:'sone'` i `S.zones`: `{id,roomId,type:'sone',name,points,direction,startCorner}`.
  Holdt UTENFOR alle `type==='forbidden'/'preferred'`-filtre (de matcher ikke 'sone') → kabel/
  folie-constraints uberørt (verifisert).
- Folie-strimler får `zoneId` (null for vanlig rom-folie).

### Opprettelse — «Del i soner» (rett delelinje)
- Ny modus (ctxbar-knapp på valgt rom): klikk to vegger → endepunkter snappes til rom-/
  sonegrensen → **robust polygon-split langs korde** (`_splitPolygonByChord`) deler rom-
  polygonet (eller sonen linja krysser) i to. Sonene PARTISJONERER rommet (verifisert: rektangel
  → 2× lik areal; gjentatt split → N soner uten hull/overlapp; sum sone-areal = romareal).
- Auto-navn «Sone N» (redigerbart via ctxbar). Render: indigo soner med navn + retningspil.

### Valg + ctxbar/info pr. sone
- `hitZone`/`selectZone` virker for 'sone' (hit-rekkefølge: strip→cable→zone, så strimler inni
  kan fortsatt velges). Ctxbar: navn-redigering, «+ Produkt», per-sone retning (↕/↔), slett,
  areal + effekt + dekning. Info-panel: «Utleggingssone», retning, areal, effekt, dekning.

### Folie pr. sone + PER-KANT margin (kjernen)
- «+ Produkt» på en sone ruter til `_fillSoneFoil`: fyller KUN sonen, i `zone.direction`,
  strimler tagges `zoneId`. Erstatter sonens eksisterende folie.
- **Per-kant margin** (`_zoneFillablePolygon` + `_offsetPolygonPerEdge`): hver sonekant
  klassifiseres — ligger på en romvegg (yttervegg) → veggmargin (`_effectiveMarginCm`); delt
  grense (delelinje) → halv folie-gap (`_effectiveGapCm/2`). Sone-polygonet insettes per kant,
  og fylles med margin 0 (ingen dobbel-inset). Verifisert eksakt: yttervegg inset 2,5 cm, delt
  grense 1,5 cm.
- Motor-utvidelse (bakoverkompatibelt): `computeClippedSegments(...,opts{marginCm,clipPoly})` og
  `_autoFillRoomOnce(...,marginCm)`. Vanlig rom-folie uendret (regresjonstestet: 94%/92%).

### Stats / sletting
- `_soneStats` (areal, effekt W, W/m², dekning %, strip-antall) vist i ctxbar + info-panel.
  Rom-total inkluderer sone-strimler (de har `roomId`) → sum pr. rom = sum soner.
- Slett sone fjerner også sonens folie.

### Resultat / begrensninger
- Rektangulære soner (hovedscenario): 600×400 → 4 soner à 6 m², vekslende retning, **91–92 %
  dekning**, perfekt partisjon.
- **Utsatt til runde 2:** (1) folie-dekning på UREGELMESSIGE soner (L/arm) er svak — den greedy
  `_autoFillRoomOnce` får ikke brede folier over arm-grenser (Vindfang Sone 2 ~43 %); (2) sone-
  navn kan få nummer-hull etter gjentatte splitter; (3) hindringer inne i en sone subtraheres
  ikke i sone-fyllet; (4) kabel/matte pr. sone; (5) PDF/materialliste pr. sone; (6) polyline-
  delelinjer; (7) sammenslåing/flytting av delelinjer.

---

## 2026-06-10 — Hindring: fri plassering + mykt vegg-snap (clampHindringToRoom omskrevet)

- **Symptom:** hindringer (f.eks. kjøkkenøy i Rom 6) kunne ikke plasseres fritt — de ble dratt mot
  en vegg «midt i rommet», som om det fantes forbudte soner. Reprodusert: en hindring midt i Rom 6
  (42-punkts, konkavt, langt fra alle vegger) ble flyttet **233 cm** for å snappe mot en vegg.
- **Rotårsak:** `clampHindringToRoom` (~19788) snappet flush ut fra signert avstand til veggens
  UENDELIGE LINJE og valgte veggen med STØRST avstand innenfor rekkevidde → falskt snap i
  komplekse/konkave rom. Containment og snap var sammenblandet i ett steg.
- **Fiks — to ATSKILTE steg:**
  1. **Containment (alltid):** ekte polygon-test — `ptInPoly` på hindringens hjørner + nærmeste
     punkt på rom-grensen; translerer hele hindringen minimalt inn kun når et hjørne faktisk er
     utenfor (itererer for flere brudd). Ikke per-vegg-linjeavstand.
  2. **Mykt vegg-snap (kun ≤5 cm fra segmentet):** krever tangentiell overlapp med vegg-SEGMENTET
     (hindringen ligger langs segmentet, ikke nær dens forlengede linje), velger FAKTISK NÆRMESTE
     vegg (minste avstand, ikke størst), og snapper flush kun når 0 < avstand < HINDRING_SNAP_CM
     (5 cm). Ellers fri plassering.
  - Ingen snap til andre hindringer/soner (kun `room.walls`). Grid-snap i `_dhDragging` og
    `_hwMoving`-kallerne uendret.
- **Verifisert (ekte Rom 6 + rektangel, numerisk + visuelt):** midt i rommet → 0 cm (var 233);
  3 cm fra vegg → snap flush; 8 cm fra vegg → fri; 200 cm utenfor → contained inn; rektangel
  3/8 cm → snap/fri. Skjermbilder: øy fritt mellom benkene + øy snappet flush mot vegg.

---

## 2026-06-10 — Varmekabel: auto-retning foretrekker den RENE retningen (boustrophedon-fyll)

Lett alternativ til en risikabel V6-vertikal-omskriving: i stedet for å pusse på den delte
V6-koblingsmotoren, lar vi auto-retning styre brukeren mot den rene retningen.

- **Bakgrunn:** på et utstikker-rom (L/T med horisontal arm, f.eks. Vindfang) finnes en ren
  enkelt-serpentin (boustrophedon, 0 koblinger) bare langs armen (horisontalt). Vertikalt finnes
  den ikke (stort `openLen`-hopp) → kun V6 med kobling. Eksplisitt vertikalt valg er brukerens
  rett, men AUTO bør lande på den rene retningen.
- **Fiks (cascade, boustrophedon-blokk i `_autoFillCableImpl`):** blant gyldige retninger spores nå
  `bFill` = beste som også FYLLER kabelen godt (≥90 %), og `bChosen = bFill || bBest` velges. Når
  en retning gir ren, godt-fyllende boustrophedon, vinner den framfor en underfyllende. Påvirker kun
  AUTO (uten eksplisitt valg) — `dirs` har da begge retninger; ved eksplisitt valg er `dirs` kun den
  ene, så brukerens valg overstyres aldri.
- **Verifisert (Vindfang):** AUTO → boustrophedon 'h', 0 koblinger, ren; eksplisitt 'h' → ren
  (uendret); eksplisitt 'v' → fortsatt v6 (valg respektert); rektangel AUTO → boustrophedon, ingen
  regresjon.

---

## 2026-06-10 — Varmekabel: L/T-rom horisontalt blir ren boustrophedon-serpentin + 5 cm perp-margin

Fortsettelse på Vindfang (Bloksbergveien/Hybel). To uavhengige fikser, begge verifisert på ekte
rom og målt numerisk + visuelt.

### Fiks 1 — boustrophedon `_solve`: robust CC-sveip i stedet for biseksjon
- **Symptom:** L/T-rom horisontalt ga en stygg V6-celle-layout: ett løp med tettere CC, kantete
  (ikke-buede) svinger, en Y-split der et koblings-bein lå 4,4 cm fra et løp (<5 cm), og en rar
  kantet strek før svingen. Rotårsak: V6 deler rommet i 3 bånd med polyline-**koblinger**.
- **Hvorfor V6 i det hele tatt ble valgt:** den rene motoren (boustrophedon) lager én
  sammenhengende serpentin med bue-svinger + jevn CC, men `_solve` brukte **biseksjon**, som antar
  at `_layout`-gyldighet er monoton i CC. På L/T er den **ikke-monoton** (gyldig ved 9 cm, null ved
  12 cm, gyldig ved 15 cm — celle-handoff `openLen`-sjekken). Biseksjonen spratt da til CC 39,9 cm
  → bare 15,6 m av 50 m → cascadens `fillOk`-terskel (≥90 %) falt til V6. (Dette var den samme
  «15,6 m»-underfyllingen fra tidligere økter — nå endelig forklart.)
- **Fiks:** erstattet biseksjonen med et grovt CC-sveip (0,25 cm steg) over hele området + lokal
  forfining rundt beste CC. Robust mot de ikke-monotone null-hullene; finner alltid den GYLDIGE
  layouten nærmest target-lengde.
- **Resultat (Vindfang H, InFloor 10T 500W 50 m):** boustrophedon vinner nå (var v6), CC jevn
  9,9 cm overalt, **0 koblinger** → alle U-svinger er halvsirkel-buer, ingen Y-split, ingen
  tett-løp, ingen kantet koblings-strek; 48,8 m, 87 %, min vegg-avstand 5,49 cm; start/slutt i
  hjørner. Bekreftet visuelt.
- **Begrensning:** vertikal retning på dette rommet finnes ikke som ren enkelt-serpentin (armen
  stikker ut horisontalt → stort `openLen`-hopp), så vertikal bruker fortsatt V6. Horisontal er
  den naturlige retningen for et slikt rom.

### Fiks 2 — `_generatePolygonClippedRuns`: perp-margin fra indre parallelle vegger
- **Symptom:** øverste streng i venstre arm lå 0,7 cm fra ytterveggen (brøt hard 5 cm).
- **Rotårsak:** funksjonen insettet kun løpenes ENDER (sweep-aksen). En INDRE step-vegg parallell
  med løpene (armens topp/bunn-kant, usynlig for det ytre posisjon-rutenettet) fikk ingen
  perp-margin. (Promptens `_fillCellSerpentine` var død V5-kode — ikke i live-stien.)
- **Fiks:** masker hvert løp med rom-klipp ved `pos ± margin` (rå klipp, ingen sweep-inset). Der
  rommet ikke strekker en full margin i perp på en side, ligger man <margin fra en parallell vegg
  → klipp bort. Tom-vakt for ytre ekstremer (allerede dekket av posisjon-rutenettet). Lik CC
  beholdt; litt mer udekket inntil veggen (OK).
- **Resultat:** global min vegg-avstand 0,7 → 5,03 cm (H) / 9,58 cm (V). Gjelder fortsatt V6-stier
  (vertikal/hindringer). Rektangler uendret (boustrophedon-stien urørt).

### Verifisering / ingen regresjon
- Rektangler (300×200/54 m, 250×200/29 m, 400×300/54 m): boustrophedon, jevn CC, lengde nær target.
- LOCKED-regler urørt (halvsirkel-U, lik-lengde innen serpentin, ingen Y-split, sweepMargin).

---

## 2026-06-10 — Varmekabel: V6 honorerer valgt RETNING (dirExplicit) — fikser «velger horisontalt, legger vertikalt»

Diagnostisert og fikset på ekte prosjekt **Bloksbergveien → etasje «Hybel» → rom «Vindfang»**
(T/L-rom: høy høyre-rektangel med horisontal arm til venstre, InFloor 10T 500W 50 m).

### Rotårsak
`generateCableV6` kjørte sitt interne auto-retningsvalg (`_quickTry('v')` vs `_quickTry('h')`,
~linje 9925) **ubetinget** og overstyrte den passerte retningen hver gang én retning dekket
>2 % mer. På Vindfang dekker vertikal litt mer, så et eksplisitt **horisontalt** valg ble
stille flippet tilbake til **vertikal** → «jeg velger horisontalt, men den legger vertikalt».
(Den gamle 15,6 m-underfyllingen var en annen sti — boustrophedon — som ikke lenger velges.)
`_autoFillNCables` respekterte allerede `dirExplicit`; V6 gjorde det ikke.

### Fiks
- I `generateCableV6`: ny `_dirLocked`-vakt rundt auto-retningsblokken. Retning låses (ingen
  auto-flip) når brukeren bevisst valgte den (`S.varmefolie.dirExplicit` + gyldig `h`/`v`)
  ELLER når en multi-kabel-sone tvinger orkestratorens retning (`room._forcedSpacingCm`).
  Ellers auto-velg ved best dekning som før.
- Bonus: `_forcedSpacingCm`-låsen gjør multi-kabel-soner retnings-konsistente (en sone kunne
  før stille rotere via V6s interne flip og bryte parallell-tiling).

### Verifisert (in-memory, autentisert fane, lagring nøytralisert)
- **Vindfang request 'h' → får 'h'** (v6, lik CC 8,8 cm, 50 m = produktlengde, **86 % dekning**
  vs vertikal 81 %, 2 ortogonale koblinger, start/slutt i ekte hjørner). Visuelt bekreftet:
  ren horisontal serpentin, ortogonal innhugging rundt innerhjørnet, ingen diagonal/Y-split.
- **Vindfang request 'v' → får 'v'** uendret (50 m, 81 %).
- **Multi-kabel** (rektangel, 2 soner): request 'h' → begge 'h'; request 'v' → begge 'v';
  lik CC + lik lengde i begge soner. Ingen regresjon.
- Auto-modus (dirExplicit=false): auto-flip beholdt uendret.
- LOCKED-regler urørt: halvsirkel-U, lik-lengde innen sone, ingen Y-split.

---

## 2026-06-09 — Varmekabel: retningsvelger reapply + L-diagonal + rektangel-hjørne

Tre sammenhengende kabel-forbedringer rundt retnings-/hjørnevalg. Commits: `bc0d773`,
`6dee009`, + denne (rektangel-hjørne). Verifisert in-memory i autentisert fane.

### Del A — retningsvelger re-kjører eksisterende/forhåndsvist kabel (`bc0d773`)
- Ny `_reapplyCableDirection` (nær `_cableFlipDirection`): når brukeren endrer retning/hjørne
  i pickeren, re-kjøres umiddelbart aktiv forhåndsvisning (`_cablePreviewPlace`), commitet
  enkelt-kabel (`autoFillCable`) eller multi-kabel-gruppe (`autoFillMultiCable`) i den nye
  retningen.
- Wiret inn i begge pickere (`_vfDirEvt`, `_vfPickEvt`) via en endrings-guard:
  re-kjør bare når `snap.dir`/`snap.corner` faktisk endret seg.
- `_cablePreviewMeta` utvidet med `familyName`, `categoryId`.

### Del B — fjernet vertikal L-diagonal (ortogonal kobling langs innerveggen) (`6dee009`)
- I `_v6ConnectCells` (live V6-cellekobling): når exit/entry ligger på forskjøvne sweep-nivåer
  rutes koblingen nå **ortogonalt** langs innerhjørnet i stedet for en diagonal snarvei.
  `_covers` finner cellen som spenner hele sweep-området; bias 0.7 mot dens grenseløp;
  `mk(bPerp, sweep)` bygger en 4-punkts ortogonal sti; obstacle-validert med fallback til
  rett `[exitPt, bestEntry]`. Bevart 50 m, ingen regresjon på horisontal (dx:0/dy:13),
  rektangel fortsatt boustrophedon (49,4 m).
- Samme fiks også speilet i den døde `_connectCellPathsV5` (uskadelig, ikke i live-cascade).

### Punkt (a) — rektangel-boustrophedon honorerer valgt starthjørne (denne commit)
- I `generateCableBoustrophedon` → `_layout()` (variant-utvelgelsen): når
  `S.varmefolie.dirExplicit && startCorner` er satt, **hard-filtreres** de fire traverserings-
  variantene (`perpAsc × startHigh`) til den som lander på valgt hjørne — i stedet for det
  gamle myke +0,5-tiebreaker-nudget. Tracker `bestForced` ved siden av `best`; bruker
  `bestForced` når det finnes, ellers trygg fallback til ufiltrerte beste.
- Auto-modus (ingen bevisst valg) helt uendret — motorens selvvalg beholdes.
- Bakgrunn: rektangler bruker boustrophedon, som internt selv-velger starthjørnet i
  `_layout`s 4-variant-søk. Tidligere talte picker-hjørnet bare som +0,5 og ble overdøvet av
  hjørne-landing-bonus (opptil 8/ende) → valgt hjørne ble ignorert på rektangel. Nå honoreres
  det. Samme `dirExplicit && userCorner`-mønster som V6-fiksen (`a2ee83e`).
- **Verifisert:** parser OK; alle 8 hjørne×retning-kombinasjoner gir nøyaktig valgt hjørne;
  overstyring bevist (motorens naturlige selvvalg `tl` → eksplisitt `tr` gir `tr`, `br` gir
  `br`); kabellengde stabil (~59,9 m), ingen LOCKED-regel berørt.

---

## 2026-06-08 — ØKT-OPPSUMMERING: snøsmelting fullført + matte-pakkemotor

Stor økt: fullførte utendørs snøsmelte-modulen (steg 1–8), konsoliderte produktvelgeren
(snø + innendørs deler nå én UI + én motor), og bygde en matte-pakkemotor for InSnow 300T.
Alt verifisert i preview-server `romtegner` (dev-login `?dev`) og **deployet via Vercel**.
Commits: `06b2acf`, `92d682c`, `57d74be`, `a80652b`, `81d79c4`, `48bdc93`, `6242729`,
`49f54aa`, `536947b`, `0c97e0b`, `7db1513`, `05d0efb`, `e36a335`.

### Snøsmelting-modul fullført (steg 1–8)
- **Ekte InSnow 300T-matter i DB** (`_ensureOutdoorMatProducts`): erstattet placeholder
  `CVA20001–20016` med 32 ekte faste-størrelse-matter (17× 230V `CVA106xx` + 15× 400V fra
  Cenika produktblad 05/2025), bredder 0,5/1,0 m, `mat_total_length_mm` → fast-lengde-modell.
- **`_moduleContext()`** — datadrevet modul-forskjell (wm2Default, ccMaxCm, roomWord,
  hindringTypes, hasScreed). `_roomWord`/`_roomTargetWm2`/maks-CC rutet gjennom det.
- **Effektbehov** (`SNOW_USAGE` 250/300/350 + `_snowUsageWm2` + bruksområde-velger).
- **Delt produktvelger (UPC):** snø ruter nå til `showUnifiedProductPanel` (samme som
  innendørs) via `openProduktMenu`/`showCablePlacePanel`/auto-åpning. UPC modul-bevisst
  (snø=kun utendørs InSnow, innendørs=ekskluder utendørs). Header «Bruksområde» (snø) vs
  «Romtype» (inne). Gammelt flytende snø-panel nøytralisert.
- **Multi-kabel via `_buildNCableZones`** (samme motor som innendørs; LOCKED-regler).
- **Spenningsfilter** rettet (6 steder buggy `name.startsWith` → trygt `product_family`-
  mønster); «InSnow 30T» drar ikke lenger inn 400V.
- **Bugfix:** `maxCCmm is not defined` krasjet info-panelet ved valg av snø-kabel; rettet +
  korrekt snø-maks-CC 300mm via modul-kontekst. Fjernet foreldet «Avretning»-input i snø.
- **Steg 8:** fjernet 465 linjer død gammel snø-sti (`_renderSnowSettingsPanel`,
  `showSnowProposals`, `_snow*`-forslag/preview). Beholdt `_updateSnowSettingsPanel` som shim.

### Produktvelger UX (begge moduler, delt)
- **Dokket panel** (`_dockRwp`): `#room-workflow-panel` ligger nå eksakt over venstre sidebar
  (position:fixed, følger sidebar-bredden) i stedet for oppå griddet → forhåndsvisning fri.
- **Chip/nedtrekk-hybrid:** Produkttype + Effekt-klasse + Spenning + Bruksområde som chips;
  Romtype beholdt som nedtrekk. Splittet familie-nedtrekket i klasse+spenning (`_familyKlasse`,
  `_upcState.klasse/voltage`, voltage-filter i resultatrenderne).
- **Matte-variant forhåndsviser areal:** klikk en variant → eksakt matte legges ut (byttbar),
  via `autoFillMatSerpentine(productId, {exact, keepPanel})`.

### Matte-pakkemotor (`_packSnowMats`) + 4 oppfølgingspunkter
- **Pakkemotor:** legger InSnow 300T-matter i LENGDERETNINGEN, kombinerer ende-til-ende
  per kolonne (k=floor(L/ℓ)), N kolonner på tvers med ~10cm gap + 15cm udekket kant, og
  fyller rest på tvers (rotert 90°). Hver fysiske matte = ett `S.mats`-objekt. Auto velger
  bredeste+lengste (færrest stk). Verifisert mot Cenika-fasit: Sone 1 (4,6×25, 1×20m) →
  5× 1×20m; Kenneths variant (kun 1×12m) → 8× 1×12m + 1× 0,5×8m.
- **Punkt 1 — watt-fix:** `_matRatedW` = produktets ratede effekt pr. fysisk matte (ikke
  laid geometri × num_runs). Brukt i `_computeRoomStats`, sidebar-tre, specRows, PDF-eksport,
  materialliste. Sone 1 = 30000W korrekt (var feilaktig per-løp).
- **Punkt 2 — Bruk/Avbryt:** snø-matter legges som preview (`room._matPreviewIds`); «Bruk»
  committer, «Avbryt» fjerner, bytte swapper. Speiler kabel-preview-flyten.
- **Punkt 3 — rekursiv rest:** rest fylles med flere tverr-bånd til leftover < 40cm. Sone 2
  (4,6×26,5) → 5× 1×20m + 1× 0,5×12m, full dekning.
- **Punkt 4 — fargekoding:** `MAT_COLORS` (8 farger) pr. fysisk matte i `drawMats`;
  materialliste med matchende fargeprikker. Enkeltmatte-rom uendret (`_matColor` → null).

Status: alt deployet. **Restpunkter/notater:** Sone 2-rest er forenklet (ett lengde-ish +
ett kryss-bånd, ~PDF men ikke byte-identisk Cenika-kombo); trapp-modulen + klimasone-tabell +
auto-spenning + styring/følere er utenfor scope (ikke startet).

---

## 2026-06-05 — ØKT-OPPSUMMERING: multi-kabel-motor (varmekabel)

Samlet arbeid på multi-kabel-utlegg denne økta (detaljer i oppføringene under). Commits:
`96dd460`, `825940d`, `0b06e87`, `6d006d9`, `e6906bd`, `4e51fa2`, `b08072d`, `f129876`.

- **Retning etter dekning** + picker-bias; **↻ Retning** snur hele gruppa.
- **Delt sone (hakk/døråpning) = ugyldig løsning** — auto velger den aldri, tvang nektes.
- **Full gavl-dekning** i vertikal modus (skew-kabler godtas, ikke lenger forkastet).
- **Lengde-klamp**: ingen kabel > produktlengde (trimmer sveip, aldri CC).
- **Tette half-CC-sømmer** mellom soner.
- **NØYAKTIG lik CC i alle soner** (felles CC → lik flateeffekt i hele rommet).
- **Manuelt valg «Like soner» / «Korridor»** for 2 kabler; samme motor/regler for alle 2+.

Status: alt deployet via Vercel. Restpunkt: ingen kjente. Merk testrom `__TESTGARD__` kan
ligge igjen i BIV6-prosjektet (slettes manuelt).

---

## 2026-06-05 — Multi-kabel: manuelt valg «Like soner» / «Korridor» (2+)

Brukerønske: ha BEGGE multi-kabel-layoutene med et manuelt valg. Tidligere brukte 2 kabler en
egen korridor-sti (felles startpunkt + lead-run) og 3+ en annen (like soner) — inkonsistent.

- **To moduser** via `autoFillMultiCable(roomId, productId, n, forcedDir, mode)`:
  - **`soner`** (standard) → den forente `_buildNCableZones`-motoren, håndterer nå **2+**
    (felles CC, like soner, split-ugyldig, retningskontroll, lengde-klamp, søm-pinning, skew).
  - **`korridor`** → lead-run-sti med felles startpunkt ved termostat. **Kun for 2 kabler**;
    3+ med korridor-forespørsel faller automatisk til soner.
- `S.varmekabel.multiCableMode = 'soner'` (standard, huskes pr. økt). Kablene tagges
  `multiCableMode`.
- **UI:** ny ctxbar-toggle «▦ Like soner» / «🚇 Korridor» ved siden av «↻ Retning», vises KUN
  for 2-kabel-grupper (skjult ved 3+). `_cableToggleMultiMode()` kjører gruppa på nytt i valgt
  modus. `_cableFlipDirection` bevarer nå modus.

Verifisert (Garderobe herrer): 2-soner → lik CC 19,81, ingen lead-run; 2-korridor → lik CC
19,81 + felles startpunkt + lead-run; 3-korridor → faller til soner (CC 13,21). Enkeltkabel
uendret. LOCKED kabelregler urørt.

---

## 2026-06-05 — Multi-kabel: NØYAKTIG lik CC i alle soner (lik flateeffekt)

Kenneths prioritering: lik CC i alle soner (lik W/m²) > eksakt veggmargin. CC spriket før
mellom sonene (14,2/11,7/13,2) fordi hver sone regnet sin EGEN CC, og vertex-snapping
ubalanserte arealene.

- **Én felles CC** regnes én gang i `_buildNCableZones`:
  `sharedCC = clamp(nettoTotal_m2 / (N·cable_length_m) · 100, minSp, maxSp)`, og settes som
  `tempRoom._forcedSpacingCm` på hver sone.
- **Motorene tvinges til felles CC:** `generateCableBoustrophedon._solve`, `generateCableSkew`
  og `generateCableV6` (inkl. V6 stage-7 lengde-opt hoppes over) bruker `_forcedSpacingCm` i
  stedet for å utlede CC fra delroms-arealet.
- **Like arealer:** droppet `_snapBoundsToVertices` for multi-kabel — like-areal-kuttet er nå
  styrende (lik areal → lik lengde → lik CC virker). Motorene takler uregelmessige delrom.
- **Resten absorberes i sveip-margin, aldri i CC:** `_trimCableToLength` trimmer sveip-
  utstrekningen (sving-til-vegg) ned til produktlengden; half-CC-pinning ved sømmene beholdes.

Verifisert (Garderobe herrer, vertikalt): alle tre kabler **CC 13,21 cm** (var
14,2/11,7/13,2), lengder 182,7/183/183 m (alle ≤ 183), ~128 W/m² ≈ måltall 129. Enkeltkabel
+ 2-kabel + rektangulære rom upåvirket. LOCKED kabelregler urørt.

---

## 2026-06-05 — Multi-kabel: godta skew-kabler (full gavl-dekning i vertikal modus)

Gavl-sona i vertikal modus ble underfylt (serpentin-fallback ~130 m av 183 m). Årsak:
`_buildNCableZones` sjekket kun `cable.runs.length`, men **skew-motoren lagrer banen i
`pathEls`, ikke `runs`** — så en gyldig skew-kabel ble forkastet og falt til serpentin.

- Ny `_cableHasGeom(cable)` = har `runs` ELLER `pathEls`. Brukt i alle tre stedene
  `_buildNCableZones` sjekket «har kabelen geometri» (fallback-trigger, sluttsjekk).
- Dekningsscoren bruker `cable.coverage` for skew-kabler (ingen runs å summere).
- Split-deteksjon/pin/trim hopper trygt over runs-løse skew-kabler.

Verifisert (Garderobe herrer, vertikalt): gavl-sona K1 = skew **181,6 m** (var serpentin
130 m), K2/K3 boustrophedon 182,3/183 m — alle ≤ 183 m, full gavl-dekning, fargekodet riktig.
LOCKED kabelregler urørt.

---

## 2026-06-05 — Multi-kabel: delt sone = ugyldig løsning (ikke bare straffet)

Etter brukerkrav: «hvis en sone blir delt i to, så må det bli et ugyldig løsning». Oppgraderte
split-håndteringen fra en myk score-straff til en HARD ugyldighet.

- `_buildNCableZones` måler nå split-andelen PER SONE (verste sone) og returnerer `invalid:true`
  når en sone har ≥30 % strenger brutt i ≥2 segmenter (en void/hakk deler sona fysisk).
- `_autoFillNCables` dropper alle ugyldige retninger. Finnes ingen gyldig retning → returnerer
  null (ingen fallback til en delt layout; auto-fyll kan da prøve færre/større kabler oppstrøms).
  Tvinger man en delt retning (↻ Retning), returneres null → knappen nekter med toast.

Verifisert (Garderobe herrer): auto → 'v', tvunget 'v' → 'v', tvunget 'h' → null (toppsona
deles av døråpningen). LOCKED kabelregler urørt.

---

## 2026-06-05 — Multi-kabel: retningskontroll + split-sone-straff

Bruker meldte at horisontale soner var uegnet der en døråpning/hakk fysisk DELER den øverste
sona i to (kabelen må bro over hakket), og at man ikke fikk valgt retning.

- **Split-sone-straff i `_buildNCableZones`-scoren.** Teller strenger som er brutt i ≥2
  segmenter (= en void/hakk deler sona). Auto-retningsvalget trekker fra `0.6 × split-andel`
  fra dekningsscoren → for et rom der et hakk deler det horisontale topp-båndet (mange
  splittede strenger) velger auto nå VERTIKALE soner i stedet. Verifisert på Garderobe herrer:
  'h' gir K1 med 20/31 splittede strenger (score 0,88→0,69), 'v' gir 0 splittede (0,86) → auto
  velger 'v'.
- **Tvunget retning:** `autoFillMultiCable(roomId, productId, n, forcedDir)` →
  `_autoFillNCables(..., forcedDir)` bygger kun den retningen (hopper over auto-valget).
- **`↻ Retning`-knappen** (`_cableFlipDirection`) håndterer nå multi-kabel-grupper: i stedet
  for å flippe én kabel kjøres HELE gruppa på nytt i motsatt retning (tvunget) og erstattes,
  så sonene re-orienteres samlet. Verifisert: v→h→v gir samme layout tilbake, ingen feil.

LOCKED kabelregler urørt; enkeltkabel + 2-kabel upåvirket.

---

## 2026-06-05 — Multi-kabel: lengde-klamp (≤ produktlengde) + V6-søm-pinning

Avdekket på det FAKTISKE rommet (Garderobe herrer, H7 gt5) at multi-kabel-utlegget hadde
to feil som det syntetiske testrommet ikke fanget: (1) K2/K3 krevde **186,6/186,5 m** av en
**183 m**-kabel — fysisk umulig; (2) gavl-sona (V6) sin søm-kant lå **22 cm** fra kuttet.

- **`_trimCableToLength(cable, targetCm)`** — ingen kabel kan kreve mer enn produktlengden.
  Ved overskudd (diskret strengantall bommer oppover) kortes strengene ved å trimme sweep-
  endene, fordelt PROPORSJONALT med hver strengs kapasitet (lange strenger gir mest, korte
  gavl/topp-strenger urørt → like-spenn-strenger trimmes likt, så celle-lik-lengde beholdes).
  Perp-posisjoner urørt → sømmene flytter seg ikke.
- **`_pinCableSeamToCut(...)`** — for motorer som ignorerer `_cableSeam` (V6/skew/serpentin på
  en uregelmessig yttersone): skyv ALLE strenger likt langs perp-aksen så søm-kanten havner
  halv-CC fra kuttet → én CC over sømmen. Kun yttersoner (én søm), klampet så veggsiden
  beholder ≥ margin.
- Begge kalles i `_buildNCableZones` etter at hver kabel er bygd (før push/dekningsmåling).

Verifisert: Garderobe herrer → K1 182,8 / K2 183 / K3 183 m (alle ≤ 183), sømmer 13/14 cm
(K1|K2 22→13), dekning 88 %. Rektangel → 179,4 m hver, sømmer 15/15, 96 %. Enkeltkabel +
2-kabel upåvirket (klamp/pin kjører kun i N≥3-stien). LOCKED kabelregler urørt.

---

## 2026-06-05 — Multi-kabel: tette sømmer (halv-CC delte vegger) + picker-retning

Etter Kenneths modell: 3 like soner, hver kabel legges normalt, men **veggen som deles
med nabosona er halv-CC** → full CC mellom siste streng i sone N og første streng i sone
N+1 (ingen kald stripe). Samme prinsipp som to-kabel-stien allerede bruker (`boundaryEdge`).

- **Seam-bevisst streng-plassering i `generateCableBoustrophedon`.** Nytt `room._cableSeam`
  `{min,max}` (settes kun på midlertidige delrom). En kant som deles med en nabokabel er
  IKKE vegg: ytterste streng pinnes eksakt halv-CC fra kuttet, og resten (slack) legges mot
  ekte vegg. **Kantsoner** (én søm) pinnes; **midtsona** (to sømmer) beholder liten
  veggmargin + sentrering — halv-CC-margin på begge sider der ville droppet en streng og
  blåst opp resten (løsere sømmer). Enkeltkabel uendret (`_cableSeam` udefinert → identisk
  sentrert layout).
- **`_buildNCableZones`** markerer hver delroms-kant som søm (`min: i>0`, `max: i<N-1`).
- **Retning følger picker:** `_autoFillNCables` biaser mot `S.varmefolie.direction`
  (retningsvelgeren) men prøver fortsatt begge og bytter kun ved klar deknings-gevinst
  (>2 %) — så et bevisst valg/uavgjort (rektangel) æres, mens default 'v' som ville latt en
  gavl stå udekket likevel flipper til 'h'.

Målt: GABLE-rommet K2|K3-søm **19 → 14 cm** (ideal 13), K1|K2 14 cm; RECT 15/15 (ideal
13,1) — ~1,5–2 cm over ideal (uunngåelig hårfin rest når sonebredde ≠ multiplum av CC ved
låst kabellengde). Dekning 93–96 %. LOCKED kabelregler urørt; enkeltkabel + 2-kabel uendret.

---

## 2026-06-05 — Multi-kabel: velg retning etter dekning (gavl/hakk-rom)

- **`_autoFillNCables` velger nå kjøreretning etter total dekning, ikke bare
  `_suggestDirection`.** Den gamle koden låste alltid dominansretningen. På et rom med
  skrå gavl (f.eks. Garderobe herrer, 72,5 m²) ga VERTIKALE kutt et helt udekket delrom
  (gavlen → motoren «skew» → 0 %, samlet 61 %), mens HORISONTALE topp/midt/bunn-bånd
  isolerer gavlen i ett bånd og tiler resten rent (80 % / 94 % / 97 % → samlet **93 %**).
  Refaktorert: ny `_buildNCableZones(room, productId, prod, n, dir)` bygger N like-areal
  delrom for ÉN retning og returnerer `{cables, score}` (areal-vektet dekningsgrad);
  `_autoFillNCables` kjører den for BEGGE retninger og beholder den beste (med liten
  hysterese mot dominansretningen så vi bare bytter ved klar gevinst). Beholder snapping
  til verteks, konsistent retning for alle delrom, serpentin-fallback og aldri-dropp.
  Verifisert på den eksakte Garderobe-geometrien: 61 % → 93 %, 3 kabler, alle 'h'.
  RESTPUNKT: tynne kalde sømmer mellom båndene (hvert bånd holder veggmargin mot kuttet);
  halv-CC-stramming ved sømmene gjenstår som egen oppgave. LOCKED kabelregler urørt;
  enkeltkabel + rektangulære rom uendret.

---

## 2026-06-05 — Multi-kabel: rene delrom uten udekket trekant

- **Rene delrom — snap kutt til verteks + konsistent retning + deknings-retry.**
  `_autoFillNCables` forbedret etter prompt-kabel-multi-rene-soner: (1) **Smartere
  kuttlinjer** — ny `_snapBoundsToVertices` snapper hvert like-areal-kutt til nærmeste
  rom-verteks-perp-koordinat innenfor toleranse, så hvert delrom blir mest mulig
  REKTANGULÆRT (isolerer hakk/skråvegg i ett delrom i stedet for å kutte tvers gjennom
  → fjerner den udekkede trekanten i midten). (2) **Konsistent retning** — kjøreretningen
  låses til rommets dominansretning for ALLE delrom via `S.varmefolie.direction` (forced
  dir), så `autoFillCable` ikke re-velger pr. delrom → alle strenger parallelle. (3)
  **Deknings-sjekk** — ny `_cableCoverageFrac`; hvis et delrom dekker <90 %, prøv alt-
  retning og behold den beste; serpentin-fallback hvis fortsatt tomt (aldri stille dropp).
  Verifisert: L-hakk/notch → 3 kabler, samme retning, ~96 % dekning, kutt snappet til
  notch-verteks; skråvegg-gavl → rene rektangler + isolert trapes-rest (uunngåelig pr.
  LOCKED lik-strenglengde). LOCKED kabelregler urørt; enkeltkabel + rektangulære rom
  uendret.

---

## 2026-06-04 — Varmekabel: manuelt valg i RIKTIG panel

- **`55d4a8c` — Manuell-seksjon + dekning% + preview lagt i det LIVE panelet.** Forrige
  runde la manuell-valget i `_updateCableSelection`, men panelet brukeren faktisk ser (RWP
  unified product picker) er `_upcRenderCableResults` (`#upc-results`) — derfor var det
  «borte». Nå i `_upcRenderCableResults`: «✋ Manuelt»-seksjon (type-dropdown + antall-
  stepper + Forhåndsvis) høyt (etter forslag, før «Flere kabler»), dekning% + effekt-merke
  på opsjonene, og preview-før-commit. Ny `_refreshCablePanel` oppdaterer riktig panel.

---

## 2026-06-04 — Varmekabel: synlig manuelt valg + fargekoding

- **`4f0e52f` — Manuell-seksjon flyttet opp + fargekod hver kabel.** (A) «✋ Manuelt — velg
  type + antall»-boksen flyttet OPP (rett etter «Nærmest», før den lange «Flere kabler»-
  lista) → synlig uten å scrolle. (B) Ny `INDOOR_CABLE_COLORS`-palett (6 distinkte) +
  `_cableStroke`/`_cableBaseColor`: hver kabel i en multi-gruppe får sin egen farge på
  serpentin/connections/lead-run/etikett, label K1/K2/K3… (ikke bare K1/K2). Fargelegende i
  romkortet (prikk + K# + produkt · lengde · effekt). Enkeltkabel uendret (oransje),
  LOCKED-regler urørt.

- **`85e9c8c` — Aldri dropp en kabel + fri manuell type/antall.** (1) `_autoFillNCables`
  droppet et delrom stille hvis den gode motoren ga ingen runs på en uregelmessig del
  (skrå gavl/hakk) → 3 valgt ble 2 tegnet, en del udekket. Nå: fallback til serpentin på
  sub-polygonet (`_engine='serpentine-fallback'`) → kabelen plasseres alltid; kun ekte
  slivere droppes (med `console.warn`). Verifisert: skrå-gavl → 3 kabler (2 boustrophedon +
  1 fallback), L/T → 3 boustrophedon. (2) Ny «Manuelt»-seksjon i kabel-velgeren: type-
  dropdown (alle familie-varianter) + antall-stepper (1–16) + «Forhåndsvis» → bygger
  N-delrom-layout + live preview (Bruk/Avbryt), valg huskes. Verifisert: antall=4 → 4 kabler.

- **`7f63800` — Multi-kabel deler rommet i N reelle DELROM og kjører én-kabel-motoren i
  hvert.** `_autoFillNCables` kjørte før den enkle serpentinen i et perp-BÅND av hele rom-
  polygonet → «rektangulært bånd»-problem på L/hakk (udekket). Nå klipper `_clipPolygonToSlab`
  rom-polygonet til hver like-areal slab → reelt sub-polygon, og `autoFillCable`
  (boustrophedon/V6, full dekning + hjørne-til-hjørne) kjøres på et midlertidig delrom og
  re-keyes til ekte rom. Hver kabel arver single-kabel-kvalitet; nabokabler møtes med ~én CC.
  Verifisert: L-form 74 m² → 3 delrom à likt areal, alle boustrophedon, 91% (= single-kvalitet,
  opp fra 88%). Manuell velger + forhåndsvisning (forrige økt) bruker nå denne motoren.

---

## 2026-06-04 — Varmekabel: færre/store, bedre layout, manuell velger

- **`6f8bf6f` — Punkt 3: manuelt valg + dekning% + live forhåndsvisning.** Kabel-velgeren
  (`_updateCableSelection`) lister nå forslag (1× stor + multi 3×/4×/…) med total W, W/m²,
  CC, dekning~% og effekt-merke (▼lav/●ok/▲høy). Klikk → live forhåndsvisning (ikke commit,
  som snø-modulen) + «✓ Bruk / ✕ Avbryt». Ingenting endelig før bekreftelse.
- **`10bd31c` — Punkt 2: deknings-drevet layout (like-AREAL bånd).** `_autoFillNCables`
  delte i like-BREDE bånd → dårlig tiling på uregelmessige rom. Ny `_equalAreaBandBounds`
  deler i N bånd med likt netto-areal → hver fast-lengde kabel fyller kant-til-kant.
  L-form 60 m²: 3 bånd à 20 m², 95% dekning (opp fra ~88%). Rektangel uendret.
- **`39adf4b` — Punkt 1: foretrekk færre/større kabler.** `selectMultiCables` rangerte på
  effekt-presisjon → en liten kabel slo færre store. Nå: færrest kabler innen ±12% effekt,
  største kabel. Katalogen har lange InFloor 17T (opp til 200m), så 72 m² @ 129 W/m² gir
  nå 3× 183m i stedet for 7× 79m. LOCKED kabelregler urørt.

---

## 2026-06-04 — Bakgrunn: alltid-synlig hurtigkontroll

- **`cb4a778` — Synlighets-/dimme-kontroll for bakgrunn tilbake på toppen.** Kontrollen
  lå kun i none-state-ctxbaren (kun når ingenting var valgt) → forsvant når et rom ble
  valgt. Ny `_bgCtxGroupHtml()` prepende i `updateCtxBar` for alle hvile-tilstander
  (skjult i transiente moduser + før kalibrering): Vis-toggle + dimme-slider + «…»-meny
  (målestokk/bytt/fjern), bundet til det aktive laget (synket med sidebar-lista). Fjernet
  none-state-duplikatet + død flytende `#bg-panel`-HTML. Rendering og prosjektdata urørt
  (trygg fiks — full S.bgs→bgLayers-migrering droppet pga. lav gevinst/høy risiko).

---

## 2026-06-04 — Varmekabel: ubegrenset antall kabler

- **`07032b0` — Store rom kan nå prosjekteres med så mange kabler som trengs.**
  `selectMultiCables` var hardkodet til maks 2× — nå effekt-drevet: N ≈ ønsket effekt /
  kabel-effekt, med gyldig CC. Ny `_autoFillNCables` splitter perp-aksen i N like bånd
  og legger én serpentin per bånd (indre bånd: ny `boundaryEdge='both'` → halv-CC mot
  begge nabokabler, uniform CC). Alle kabel-paneler viser «N×» og plasserer N.
  2-kabel-veien (delt start + lead-run) uendret; ny vei kun for N≥3. Tak 16 (praktisk
  ubegrenset). Verifisert ekte InSnow (64 m²): 200 W/m²→13 kabler, 300→16, 0 overlapp.

---

## 2026-06-04 — UX: seleksjons-drevet kontekst-handlingsmeny

- **`fe327c1` — Samme prinsipp overalt: klikk rad = velg/åpne, ✏️ = navn.** Utvidet
  rom-fiksen til etasje-headere (klikk → toggle, ✏️ omdøp), prosjektliste-rader på
  dashbordet (klikk → åpne prosjekt, ✏️ omdøp) og hindring-rader (fjernet villedende
  cursor:text, ✏️ lagt til). Alle eksisterende rename-handlere gjenbrukt; dobbeltklikk
  + høyreklikk «Gi nytt navn» beholdt.
- **`fefdabd` — Klikk hele rom-raden for å velge rommet.** Navne-spennet i sidebar
  hadde egen onclick som startet omdøping (med stopPropagation), så klikk på navnet
  valgte ikke rommet. Fjernet den → hele raden kaller `selRoom`. Omdøping flyttet til
  en tydelig ✏️-knapp (i tillegg til dobbeltklikk + høyreklikk «Gi nytt navn»).

- **`40f9e08` — Rydd opp i `#ctxbar` (rom-tilstand).** Rom-valgt viste ~12 knapper
  samtidig. Nå seleksjons-drevet: primær «+ Produkt» (fylt aksent) + 4 sekundære
  (+ Hindring, + Sone, Auto-soner, Mål); resten (Skillevegg, Fyll fra punkt, Sentrer,
  Folie-avstand, Tøm, Dokumentasjon, Rom-label, Målsett rom/folie/kabel, Slett rom)
  under én «⋯ Mer»-popover (`_showCtxMore`, gjenbruker `#produkt-menu` + `.ctx-item`).
  Ny `.snap-chip.primary`-stil, 44px-trykkflater beholdt, `#topbar` uendret. Alle
  onclick-handlere gjenbrukt — ingenting mistet, la til «Slett rom». None-state:
  «Rektangel» markert som primær.

---

## 2026-06-04 — Folie skråvegg-motor + onboarding/multi-org

Økt som ryddet folie-auto-fill-scoringen, bygde skråvegg-trapper, og forbedret
onboarding/brukeradministrasjon. Alle endringer verifisert på ekte FlexFoil-data i
preview-serveren (Chrome), og syntaks-sjekket før commit.

### Folie: skråvegg-dekning (ny `_slantStaircaseFill`-motor)

Bygd stegvis gjennom flere prompter. Sluttresultat: hver skråvegg får en ren
40/20cm-trapp som følger diagonalen, midtpartiet pakkes optimalt, ingen
overlapp/støv, og rette rom (rektangel/L/T) er garantert uendret.

- **`31fd9fc` — Pakk kjerne-båndet optimalt + jevne mellomrom.**
  Etter trapping dekomponeres det fullhøye kjerne-båndet (komplementet til
  slant-sonene) og pakkes med `_bestMixedWidthFit` (uttømmende søk → færrest
  strimler / beste breddekombinasjon) i stedet for grådig. Slakken fordeles jevnt
  mellom strimlene. Kun brede produkter (>40cm) i kjernen; båndet krympes forbi
  trappestrimler som strekker seg inn (ren overgang). Byttes kun når ikke verre
  (≤ antall strimler og ≥ dekning), validert mot trappene (ingen overlapp).

- **`045025a` — 40cm-trapp på BEGGE sider (slutt å beholde flatt kuttede brede strimler).**
  Ny `_stripCutRatio` (lengde / høyeste-kant-potensial). Brede strimler (>40cm)
  som diagonalen kutter < 85 % fjernes — også de som straddler sonegrensa — og
  sonen bygges om til ren trapp (regionen utvides til strimlenes fulle spenn).
  Brukervalg: ren trapp først, selv om en flat strimmel dekker marginalt mer m².

- **`0a4885d` — Fjern overlapp-advarsel, støv-strimler og glipper.**
  `_freeSweepRanges` erstatter `_subtractCoveredSweep` og håndhever leverandør
  perp-GAP (`_effectiveGapCmPair`) mot alle strimler → ingen ⚠. `_buildNarrowStaircase`
  dropper støv (< 30cm) og velger bredden som dekker mest (40cm i kroppen, fint
  20cm nær spissen, eksakt ett gap mellom trinn).

- **`6fda605` — 40/20cm-trapp på ALLE skråvegger (redesign).**
  Itererer per skråvegg-kant (slant-sone = kantens perp-span). Foretrekker ren
  full-høyde trapp der den dekker ≥ det den erstatter; ellers additiv så ingen
  sone står tom. Løste at bare én skråvegg fikk trapp.

- **`62e547f` — Skråvegg-dekning med trapp av smale FlexFoil-strimler (20/40cm).**
  Første versjon: additivt etter-pass `_slantStaircaseFill`, kun ved
  `_roomHasSlantedWall`. Hjelpere `_roomHasSlantedWall`, `_posNearSlant`,
  `_narrowEdgeFillProducts`.

### Folie: opprydding

- **`bcbb2ec` — Samle layout-scoring i én `_scoreFoilLayout` (P4).**
  Erstatter `_scoreLayout` + lokal score-closure i `_autoFillBothDirections` med
  én scorer med to dokumenterte vekt-profiler (select/zone). Aritmetikk bevist
  byte-identisk → ingen synlig endring.

### Onboarding & multi-org

- **`ff11db0` — Onboarding.** Samle pending-statuser til én komponent
  (`_AUTH_STATUS`), invitasjons-vei på login («📩 Har du en invitasjon?»),
  2-stegs registrering, org-admin rolle-endring + invitasjon på nytt.

- **`97e6d8b` — P7 multi-org.** Alle medlemskap i `_userMemberships`, aktiv-org i
  localStorage, org-bytter i avatar-meny (kun ved >1 org), plan-basert medlemstak
  (`_orgMemberLimit`).

### Kabel-motor (P1, tidligere i økten)

- **`4c86720` — Samle delt kabel-scoring i `_scoreCableCandidate`.**
- **`d1b0135` — Fjern død kabel-motor (V5/V4/length-driven).**

---

## Verifiseringsmetode

- **Syntaks:** ekstraher inline `<script>` → `node --check`.
- **Funksjonelt:** preview-server `romtegner` (port 4000) + Chrome MCP, testet på
  syntetiske rom (trapes, hus med 2 skråvegger, steep-trapes, kappet hjørne) og
  ekte FlexFoil 60W-produkter. Sjekket: dekning, overlapp (0), støv (ingen <30cm),
  no-op på rektangel/L/T.
- **LOCKED-regler** i CLAUDE.md (U-turns, sweep-margin, equal-length runs, ingen
  Y-splits) ikke berørt — dette gjelder kun folie, ikke varmekabel.
