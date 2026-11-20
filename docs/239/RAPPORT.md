# 239 – Hesteskotrapp med repos øverst, og fritt valg av hvem som tar justeringen av sideavstanden

20.11.2026 · `main` · commit `b50204e` · ikke pushet · ingen SQL

## Hva som er endret
- **Dialogen «Bygg hesteskotrapp»:** ny avkrysning «Repos over trappa» med «Repos bredde (cm)» (følger trappas ytre bredde til du skriver ditt eget tall, kan være bredere) og «Repos dybde (cm)» (120). Forhåndsvisningen tegner reposet sentrert, med totalmål og kabelbehov for trapp og repos hver for seg – og sier fra når egen kabel på reposet foreslås.
- **Geometri:** reposet er en `landing`-flate bak bakkanten, alltid sentrert om toppflaten. «Eget trinn» → ett opptrinn over toppflaten; «I plan» → samme nivå. Lagres som `stair.horseshoe.landing = { w_cm, d_cm, ownCable? }`; uten feltet er alt som før.
- **Kabel:** reposet bruker repos-innstillingene (maks CC repos, dybdemargin repos, avstand fra sidene – repos). Egen kabel = egen sone (den eksisterende sonemekanismen): trappa er sone 1, reposet sone 2.
- **Ett valg i trappepanelet: «Juster avstand fra sidene på»** – Hesteskotrinnene / Repos / Alle likt. Det erstatter knappene «Lik avstand / Fyll toppflaten» (184) og avkrysningen «Prioriter trinn» (238). Hver flatetype har sitt felt: «Avstand sider» (trinn/toppflate), «Avstand fra sidene – hesteskotrinn» (nytt) og «Avstand fra sidene – repos». Tomt = arver. CC endres aldri av justeringen.
- **Nytt valg «Kabel på repos»:** Auto / Egen kabel / Samme kabel som trappa.
- **Tegning, sidevisning, måltabell og PDF:** reposet tegnes sammen med trappa i samme målestokk, med bredde (over reposet), dybde (i dybdekjeden), avstand fra sidene («N (sider repos)») og egen rad «Repos» øverst i måltabellen. Sidevisningen viser reposet som øverste nivå. PDF-linja skriver «Avstand sider: toppflate 5 cm, hestesko 13.4 cm, repos 5 cm».
- **Redigering** beholder reposet og innstillingene; trappa står der den sto (toppflaten og bakkanten flytter seg ikke når reposet endres, legges til eller fjernes).

## Regelen for egen kabel på reposet (Auto)
Reposet får egen kabel når ett av disse slår til:
1. **Reposet dominerer:** reposet trenger minst like mye kabel som resten av trappa.
2. **Én kabel rekker ikke:** hele behovet er lengre enn den lengste kabelen i produktgruppa (+ 0,5 m).

Behovet måles av motoren på dine egne avstander. Ellers: én kabel for trapp og repos. Du overstyrer i panelet («Egen kabel» / «Samme kabel som trappa»), og valget står da fast.

Ditt eksempel (340 × 105 + repos 540 × 200): repos 106 m mot trappas 52,2 m → egen kabel. Trappa får 49,7 m (hesteskotrinnene 6,5 cm, toppflaten 5), reposet 106,9 m på 5 cm (0,9 m til overs). Med samme kabel ville behovet vært 158,2 m – lengre enn lengste kabel (139,9 m).

## Slik er de gamle valgene oversatt
Ingen migrering – valget leses av de gamle feltene, så gamle prosjekter åpnes uendret:

| Gammelt | Nytt valg |
|---|---|
| Hestesko «Fyll toppflaten» (`marginMode: 'fillTop'`) | Hesteskotrinnene |
| «Prioriter trinn» (`prioritizeSteps`) | Repos |
| Ingen av dem («Lik avstand») | Alle likt |

Står begge på en gammel hestesko, vinner «Hesteskotrinnene» (som før). Nye hestesko med repos starter på «Hesteskotrinnene».

Eksempel med felles kabel (repos 340 × 120, 89,1 m, behov 90,8 m) – samme strenger og CC i alle tre:

| Valg | Hesteskotrinn | Toppflate | Repos |
|---|---|---|---|
| Hesteskotrinnene | 13,4 | 5 | 5 |
| Repos | 5 | 5 | 11,7 |
| Alle likt | 8,1 | 8,1 | 8,1 |

## Test
- Ny `_stairHsLandingRegressionTest239`: **50/50**. Dekker: åtte gamle trapper hash-like med HEAD (hestesko lik/fyll toppflaten/i plan, rett trapp med «Prioriter trinn», soner, repos øverst), ditt eksempel i «Eget trinn» (høyde 68) og «I plan» (51), regelen for egen kabel og overstyringen, de tre valgene, feltene, byggeren (ny, rediger, fjern, legg til – trappa står i ro), måltabell, mål, PDF-blokk og panelet.
- Trappetestene: `_stairHorseshoeRegressionTest` 274/274, `_stairLandingMarginRegressionTest238` 57/57, `_stairRegressionTest` 45/45, `_stairZoneRegressionTest102` 106/106 – alle grønne.
- Hele suiten: 104 tester, 96 grønne, 4924 deltester. De 103 gamle er like med HEAD (0 ulike); de samme åtte er røde uten innlogging på HEAD og nå, ingen nye.
- Skjermbilder i `docs/239/`: `eget-dialog.png`, `eget-plan.png` (plan + sidevisning + panel), `eget-pdf-side1.png`/`-side2.png`, tilsvarende `iplan-…`, og `felles-…` (repos 340 × 120 på samme kabel).

## Funn, ikke rettet
- På skjermen ligger trappenavnet, «Plan»-etiketten og CC-kjeden over armen tett når reposet er bredt (PDF-en er ryddig).
- PDF/sidevisning skriver «Repos 1», måltabellen «Repos».
- Sonen for reposet viser «Trinn: 0 m» i PDF-blokka.
- Regel 2 (én kabel rekker ikke) er ikke dekket av testen – med testkatalogen slår regel 1 alltid til først.
- Feltet for hesteskotrinn virker bare i valget «Hesteskotrinnene» (se SPØRSMÅL 4).
- Suiten har åtte røde uten innlogging, på HEAD og nå (prosjektlås, kundeforslag, fem kart-tester, tak-216).

Spørsmål og valg: `docs/239/SPØRSMÅL.md`.
