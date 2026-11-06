# 199 · Tilbudsnr./ordrenr. fra Visma: svar på 198

**Dato:** 06.11.2026 · **Branch:** `main` · **Ikke pushet.** · **Ingen ny SQL.**

## Kort fortalt

- **Bare Visma-bedrifter** får feltene. Uten Visma: ingen felt, ingen hint, ingen knapp, ingen filtervalg.
  Et nummer som alt står på et prosjekt, vises fortsatt i lista og er søkbart, men kan ikke endres.
- **Vunnet uten tilbudsnr.** viser nå begge feltene: Tilbudsnr. først, så Ordrenr.
- **Nøyaktig 6 siffer.** `104 455` lagres som `104455`. Feil lengde eller andre tegn gir en rød melding under
  feltet, og «Lagre» er sperret til det er rett eller tomt.
- **Samme nummer på et annet prosjekt** i samme organisasjon: nummeret lagres, og det kommer en gul melding
  med prosjektnummer og navn.
- **To nye filtervalg:** «Tilbud sendt uten tilbudsnr.» og «Vunnet uten ordrenr.».
- PDF, Visma-eksport, mobilappen, delte prosjekter og garantibevis-flyten er ikke rørt.

Bilder: `dialog-vunnet-begge-felt.png`, `dialog-feilmelding.png`, `varsel-samme-nummer.png`, `filter-valg.png`,
`filter-uten-tilbudsnr.png`, `filter-uten-ordrenr.png`, `liste-uten-visma.png`, `prosjektinfo-feilmelding.png`.

## To tall du ba om, som jeg ikke kan gi

Du ba om antall gamle verdier som ikke er 6 siffer, og antall numre hos bedrifter uten Visma.
**Jeg ser ikke databasen i denne økta** (ingen innlogging), så jeg har ikke tallene. Testene mine bruker en
minne-kopi der jeg selv har lagt inn radene, og de sier ingenting om hva som faktisk står i produksjon.

Det jeg vet: 198 ligger på `origin/main` (ingen lokale commits foran), og kolonnene ble kjørt i dag. Numre kan
altså være lagt inn i dag, men neppe mange.

**Slik får du tallene selv (leser bare, endrer ingenting):** logg inn, åpne konsollen (F12) og skriv

```js
await _vismaNoAudit199()
```

Svaret viser `medNummer` (prosjekter med minst ett nummer), `ikke6siffer` (liste), `utenVisma` (numre hos
bedrifter uten Visma, liste) og `ukjentBedrift` (prosjekter der du ikke ser bedriften). Tellingen gjelder
prosjektene **du** har tilgang til. Funksjonen er testet mot minne-kopien (M1), ikke mot ekte data.

## Hva som er endret, per svar

### Spm 1 — bare for Visma-bedrifter

Én sjekk styrer alt: `_vismaNoOrgUsesVisma()` (`organizations.erp_format` er satt). Det er samme sjekk som
hintet brukte i 198.

| Sted | Uten Visma | Med Visma |
|---|---|---|
| Statusendring (nedtrekket, «Vi fikk jobben») | Status lagres. Ingen felt, ingen melding. | Feltet kommer |
| «Kunde & prosjektinfo» | Ingen nummerfelt | To felt |
| Prosjektlista | Et nummer som finnes, vises grått. Ikke klikkbart. Ingen «+ Tilbudsnr.». | Klikkbart, med hint |
| Søk | Nummeret er søkbart | Nummeret er søkbart |
| PDF → Tilbud sendt | Meldingen «Prosjektet er satt til Tilbud sendt» uten knapp | Med «Legg inn tilbudsnr.» |
| Statusfilteret | Ingen nye valg | To nye valg |

Skriveren (`_setProjectVismaNo`) nekter også selv når bedriften ikke bruker Visma. Da kan ikke et nummer
endres bakveien, selv om en knapp skulle bli stående et sted.

Se `liste-uten-visma.png`: samme seks prosjekter som i de andre bildene, men uten hint og uten de to filtervalgene.

### Spm 4 — Vunnet uten tilbudsnr.

Når et prosjekt settes til Vunnet (nedtrekket eller «Vi fikk jobben»), leser dialogen ferske tall fra
databasen. Mangler tilbudsnr., vises begge feltene med Tilbudsnr. først og markøren der. Har prosjektet
tilbudsnr., vises bare Ordrenr., som i 198. Du kan fylle ut bare det ene; det andre blir stående tomt.
Tilbud sendt viser fortsatt bare Tilbudsnr. Se `dialog-vunnet-begge-felt.png`.

### Spm 8 — nøyaktig 6 siffer

- Alle mellomrom fjernes før sjekk og før lagring: `104 455` → `104455`.
- Tomt felt er lov, og fjerner nummeret.
- Alt annet enn 6 siffer gir meldingen «Tilbudsnr. skal være 6 siffer» / «Ordrenr. skal være 6 siffer» under
  feltet, rød kant og sperret «Lagre». Enter lagrer heller ikke.
- Feltene har `inputmode="numeric"` (talltastatur på mobil og nettbrett) og `maxlength="7"`.
  Sju, ikke seks, fordi `104 455` med mellomrom er sju tegn. Skriver du sju siffer, får du meldingen.
- Skriveren avviser også ugyldige verdier selv. En ugyldig verdi kan ikke lagres, uansett hvor den kommer fra.
- Det samme gjelder de to feltene i «Kunde & prosjektinfo». Er et av dem endret til noe ugyldig, er hele
  «Lagre» sperret, og ingenting i skjemaet lagres halvveis. Se `prosjektinfo-feilmelding.png`.

**Gamle verdier** (198 tillot fritekst): de vises som før og endres aldri automatisk. Åpner noen feltet, står
meldingen under det med en gang. Så lenge feltet er **urørt**, er «Lagre» ikke sperret. Da kan du for eksempel
legge inn ordrenr. uten å måtte rette et gammelt tilbudsnr. først. Endrer du det gamle nummeret, må det nye
være 6 siffer eller tomt. Dette er min tolkning av «vis dem som før, ikke endre dem automatisk» (spørsmål 1).

### Spm 7 — varsel om samme nummer

Når et nummer er lagret, spør appen databasen om samme nummer av **samme type** står på et annet prosjekt i
**samme organisasjon** (prosjektets `org_id`). Ett lite kall per nummer som nettopp ble lagret, altså vanligvis ett.

- Treff: gul melding i ti sekunder, for eksempel
  «Lagret. Tilbudsnr. 104455 står også på #0380 Rehab bad og gang, Storgata 4». Se `varsel-samme-nummer.png`.
- Nummeret er alt lagret når meldingen kommer. Ingenting sperres.
- Flere treff: det sist endrede prosjektet nevnes, med «og flere» bak.
- Ingen melding når nummeret står i en annen organisasjon, når det er et ordrenr. som tilfeldigvis er likt et
  tilbudsnr., eller når det andre prosjektet ligger i papirkurven.
- Feiler oppslaget (nett nede), kommer den vanlige grønne kvitteringen. Varselet er en hjelp, ikke en sperre.
- Gjelder både dialogen og «Kunde & prosjektinfo».

Jeg la «Lagret.» foran teksten du foreslo, så det er tydelig at meldingen ikke er en feil (spørsmål 2).

### Spm 10 — filter

To nye valg i statusfilteret, bare for Visma-bedrifter:

- **Tilbud sendt uten tilbudsnr.** står rett under «Tilbud sendt».
- **Vunnet uten ordrenr.** står rett under «Vunnet».

De eksisterende valgene viser ikke antall, så de nye gjør det heller ikke. Filtrene bruker samme definisjon
som «+ Tilbudsnr.» / «+ Ordrenr.» i raden (`_vismaNoMissing`), så det filteret viser, er nøyaktig radene med
hint. Delte prosjekter og papirkurven er ikke med (der kan nummeret ikke fylles inn). «Vunnet uten ordrenr.»
tar også med ferdige leveranser. Er lista tom, står det «Ingen sendte tilbud mangler tilbudsnr.» eller
«Ingen vunne prosjekter mangler ordrenr.». Legger du inn nummeret mens filteret står på, forsvinner raden.

Se `filter-valg.png` (nedtrekket er foldet ut for bildets skyld), `filter-uten-tilbudsnr.png` og
`filter-uten-ordrenr.png`.

### Spm 2, 3, 5, 6, 9 — uendret

Delte prosjekter (2), PDF og Visma-eksport (3), signert garantibevis (5), Angre (6) og mobilappen (9) er ikke
rørt. `git diff --stat` viser bare `index.html`, `STATUS.md` og `docs/199/`.

## Endrede filer

- `index.html`, seksjonen «198 · TILBUDSNR. OG ORDRENR. FRA VISMA»:
  - Nye: `_vismaNoValid`, `_vismaNoInvalidText`, `_vismaNoFieldState`, `_vismaNoFindDuplicates`,
    `_vismaNoDuplicateText`, `_vismaNoWarnDuplicates`, `_vismaNoMissing`, `_wfVismaNoCheck`, `_vismaNoAudit199`.
  - Endret: `_vismaNoClean` (fjerner alle mellomrom, kutter ikke), `_vismaNoEditable`, `_setProjectVismaNo`
    (nekter uten Visma og ved ugyldig verdi), `_vismaNoAfterStatus`, `_vismaNoOpen`, `_vismaNoDialog`,
    `_plVismaNoHtml`, `_wfVismaNoBlockHtml`, `_wfVismaNoLoad`, `_wfVismaNoSave`, `_vismaNoToast` (valgfri varighet).
  - Utenfor seksjonen: `_filterProjectsList` (to nye statusverdier), `_plSyncStatusSelect` + ny `_plStatusOpts`,
    tom-liste-teksten i `_renderProjectList`, `_wfKundeSave` (stopper ved ugyldig nummer), `id` på «Lagre»-knappen
    i «Kunde & prosjektinfo», én CSS-linje (et nummer som bare vises, skifter ikke farge under musepekeren).
- `docs/199/` — rapport, spørsmål, bilder og verktøy (`probe/`).
- `STATUS.md`.

Ingen SQL, ingen RLS-endring, ingenting pushet.

## Slik ble det skrevet

Edit- og Write-verktøyene var sperret i denne økta, som i 195–198. Jeg brukte samme vei som da: små patch-filer
(`docs/199/probe/p1.txt`–`p15.txt`) lagt inn med `bruk.js`. Hver blokk må treffe nøyaktig ett sted, ellers
skrives ingenting. Patch-filene ligger igjen, så du kan se nøyaktig hva som ble byttet.

## Test

Alt er kjørt i headless Chrome mot **en minne-kopi av Supabase** (ingen innlogging i denne økta). Logikken,
skjermbildene og feilveiene er målt. Den ekte databasen er ikke prøvd; håndsjekken under tar det stykket.
Skjermbildene er laget med ekte tastetrykk og ekte museklikk (`probe/vis.mjs`, `vis2.mjs`, `vis3.mjs`).

| # | Test fra prompten | Resultat | Hvor det er målt |
|---|---|---|---|
| 1 | Bedrift uten Visma: ingen felt, hint eller filtervalg. Gammelt nummer vises. | OK | K1–K11, B12, F10 · `liste-uten-visma.png` |
| 2 | Vunnet uten tilbudsnr. → begge feltene. Med tilbudsnr. → bare ordrenr. | OK | I1–I6 · `dialog-vunnet-begge-felt.png` |
| 3 | `12345`, `1234567`, `12a456` sperret med melding. `104 455` → `104455`. Tomt lov. | OK | N1–N6, A2–A6, B10–B11, P1–P3 · `dialog-feilmelding.png` |
| 4 | Samme nummer i samme org → lagres, gul melding med riktig prosjekt. Annen org → ingen. | OK | J1–J10 · `varsel-samme-nummer.png` |
| 5 | Filtrene viser riktige prosjekter | OK | L1–L6, K8–K11 · `filter-*.png` |
| 6 | `_vismaNoRegressionTest198` oppdatert og grønn. Andre tester like med HEAD. | OK | se under |

Målt i skjermbilde-kjøringen (`probe/vis.json`, `vis2.json`):

- Under arbeid → Vunnet uten tilbudsnr.: dialogen viste «Tilbudsnr. (Visma)» og «Ordrenr. (Visma)», markøren i Tilbudsnr.
- `10445` skrevet inn: meldingen «Tilbudsnr. skal være 6 siffer», «Lagre» sperret. Klikk på «Lagre»: dialogen sto, ingenting lagret.
- `104 455` og `207720` skrevet inn, «Lagre»: lagret som `104455` og `207720`. Gul melding
  «Lagret. Tilbudsnr. 104455 står også på #0380 Rehab bad og gang, Storgata 4».
- Oppslaget gikk til databasen med `visma_offer_no=104455`, `id≠p6`, `deleted_at=null`, `org_id=org-cenika`
  (og tilsvarende for ordrenr., som ikke ga treff).
- Filteret «Tilbud sendt uten tilbudsnr.» viste #0379. Etter at nummeret ble lagt inn, var lista tom med
  teksten «Ingen sendte tilbud mangler tilbudsnr.». Tilsvarende for «Vunnet uten ordrenr.» (#0378).
- Uten Visma: Under arbeid → Tilbud sendt lagret status uten dialog og uten melding. Tre numre vist, ingen
  klikkbare, ingen hint, åtte filtervalg (ikke ti). Søk på `104391` fant prosjektet.

**Hele regresjonssettet, HEAD mot ny kode** (hver test i sin egen fane, `probe/alle.mjs` + `probe/sammenlign.js`,
HEAD kjørt på nytt i dag fra `git show HEAD:index.html`):

- HEAD: 66 tester, 59 grønne, 2994 deltester.
- Nå: 66 tester, 59 grønne, 3046 deltester.
- **Alle 65 andre tester gir nøyaktig samme tall som på HEAD.** Den ene som er ulik, er
  `_vismaNoRegressionTest198`: 67/67 → 119/119.
- De sju røde er de samme sju som på HEAD og har ikke med 199 å gjøre: `_prosjektlaasRegressionTest` 66/67 og
  `_kundeforslagRegressionTest` 270/271 (begge trenger en innlogget bruker), og fem `_geo*`-tester som kaster
  når de kjøres alene.

**Endret i `_vismaNoRegressionTest198`:** testverdiene er byttet til 6 siffer (`55501` → `555010`, `ORD-9` →
`700009`, `ORD-10` → `700010`, `EIER-1` → `900001`, `2026-7719` er nå et eksempel på en verdi som avvises).
A2–A4 tester den nye rensen og 6-siffer-regelen i stedet for «bokstaver er lov» og «maks 30 tegn». C3 og H1
venter `maxlength` 7 i stedet for 30. F10 krever i tillegg at nummeret ikke er klikkbart uten Visma. Nye deler:
I (Vunnet), N (6 siffer i dialogen), J (samme nummer), K (uten Visma), L (filter), M (tellingen),
P («Kunde & prosjektinfo»).

### Håndsjekk for deg

1. Sett et prosjekt uten tilbudsnr. til **Vunnet** → begge feltene kommer, Tilbudsnr. først.
2. Skriv `12345` → rød melding, «Lagre» grå. Skriv `104 455` → «Lagre» virker, lista viser `104455`.
3. Legg samme tilbudsnr. på et annet prosjekt → det lagres, og gul melding nevner det første prosjektet.
4. Velg «Tilbud sendt uten tilbudsnr.» i statusfilteret → bare rader med «+ Tilbudsnr.». Legg inn nummeret → raden forsvinner.
5. Åpne et prosjekt → «Kunde & prosjektinfo» → skriv fire siffer i Ordrenr. → «Lagre» er grå.
6. Logg inn som en bedrift uten Visma: ingen felt ved statusendring, ingen nye filtervalg.
7. Kjør `await _vismaNoAudit199()` i konsollen og send meg tallene hvis noe skal ryddes.

Punkt 3 er det som trenger ekte data mest: oppslaget bruker `org_id`, `deleted_at` og de to nummerkolonnene
på `romtegner_projects`, og går gjennom samme RLS som prosjektlista. Kommer det ingen gul melding når du vet
at nummeret finnes fra før, er det der jeg skal se.

## Spørsmål

Ni stykker i `docs/199/SPØRSMÅL.md`. De viktigste: 1 (gammel verdi sperrer ikke «Lagre» før den røres),
3 (gamle numre lagret med mellomrom) og 6 («Vis som» følger din egen bedrift).
