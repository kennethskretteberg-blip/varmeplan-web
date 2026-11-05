# 192 · Trapp: «Maks CC repos» virker ikke

Kenneth (05.11.2026): «Det er også en innstilling som heter ‹maks CC repos›. Den virker ikke. Det skjer ingenting når man justerer her.»

## Kort fortalt

- **Trappa i skjermbildet ditt har ikke noe repos.** Da finnes det ingen flate feltet kan styre, så ingenting skjer. Det
  samme gjelder hesteskotrapper: toppflaten er et trinn, ikke et repos. **Nå vises «Maks CC repos» bare når trappa har
  minst ett repos**, som i sonepanelet.
- **På en trapp med repos ble taket ditt overskrevet av «Velg».** Forslaget la reposet med trinnets CC (f.eks. 8,7) og
  skrev det tallet inn i feltet. Det du hadde satt, forsvant, og nye forslag brydde seg ikke om repos-taket i det hele
  tatt. **Nå regner forslaget reposet med ditt tak, og «Velg» lar taket stå.**
- **Med et valgt forslag** beholdes kabelsettet når du endrer «Maks CC trinn» eller «Maks CC repos», og marginen løses
  på nytt. Går det ikke opp, står forslaget, og panelet viser «for kort» eller «til overs» som vanlig.

## STEG 0 — målt, ikke gjettet

Trapp 4 trinn + repos 120 cm (brukbar dybde 110 cm) + 4 trinn, bredde 100. «Maks CC repos» satt til 10, så 6, så 15.
Riktig svar etter Regel 3/7: N = ceil(110 / tak) + 1 → **12 / 20 / 9 strenger**.

| Tilstand | Før 192 | Etter 192 |
|---|---|---|
| (a) uten forslag | 12 / 20 / 9 ✔ | 12 / 20 / 9 ✔ |
| (b) valgt forslag | 12 / 20 / 9 ✔, men **taket var alt overskrevet til 8,7 av «Velg»** (14 strenger før du rørte feltet) | taket står på det du satte; 12 / 20 / 9 ✔ |
| (c) manuelt kabelsett | 12 / 20 / 9 ✔ | 12 / 20 / 9 ✔ |
| (d) låst avstand | 12 / 20 / 9 ✔ | 12 / 20 / 9 ✔ |
| (e) soner (sonefeltet) | 12 / 20 / 9 ✔ | 12 / 20 / 9 ✔ |
| Trapp **uten** repos | feltet vises, endrer **ingenting** | feltet vises ikke |
| Hesteskotrapp | feltet vises, endrer **ingenting** | feltet vises ikke |
| Nye forslag etter tak 15 | CC repos 8,7 (trinnets) | CC repos 13,8 (110 / 8) |

**Hvor verdien forsvant:**
1. Mistanke 4 stemte: uten repos har feltet ingenting å virke på. Det er det mest sannsynlige i skjermbildet ditt.
2. Mistanke 1 stemte delvis: ikke i omregningen, men i `_applyStairProposal`, som skrev `landingCC_cm = proposal.landingCC`.
   Og `_generateStairProposals` regnet reposet med trinnets oppnådde CC (`landingCC = actualCC`), ikke med ditt tak.
3. Mistanke 2 og 3 stemte ikke: motoren leser taket riktig per flate (`_stairSurfSettings`), og sonens verdi vises i sonefeltet.

**Bonusfunn:** prompten sier at «Maks CC trinn» med valgt forslag løser marginen på nytt i dag. Det gjorde den ikke: marginen
sto (8,3), og panelet viste «13,3 m for kort». Nå går begge feltene samme vei som åpning av prosjekt (188):
`_stairResolveMarginForSet(…, { keepOnFail: true })`. Samme eksempel gir nå margin 18 og «Passer».

## Hva er endret (alt i `index.html`)

- Panelet: «Maks CC repos» bare når trappa har en repos-flate.
- Ny hjelper `_stairLandingActualCC(stair)`: faktisk CC på første repos med brukerens tak.
- `_generateStairProposals`: reposet regnes med trappas eget `landingCC_cm` (ingen midlertidig overstyring lenger);
  kortets «CC repos» er den faktiske CC-en det gir, og linja skjules når trappa ikke har repos.
- `_applyStairProposal`: skriver ikke lenger `landingCC_cm`. Ingen egen cache for repos-strenger trengs: repos-N regnes
  rent geometrisk av taket, både i forslaget og etter «Velg», så de er like.
- `_setStairStepCC` og `_setStairLandingCC`: med valgt forslag (uten soner) løses marginen på nytt for samme kabelsett.

## Test

- Ny `_stairLandingCCRegressionTest192()` — 40/40: (a)–(e) med 10 → 6 → 15 (N og feltverdi), «Velg» skriver ikke over
  taket, kabelsettet beholdes, forslag etter endring bruker taket (13,8) og «Velg» gir samme behov som kortet, angre gir
  12 tilbake, feltet skjult uten repos.
- Gamle trapptester grønne: hestesko 274/274, regresjon 45/45, manuelt sett 42/42, sone 106/106, bygger 59/59, side 25/25, 191 15/15.
- **Én forventning endret, forklart:** `_stairManualSetRegressionTest` A3 (4 trinn + repos, 180 cm, testtrappas tak
  10): `49,7 m @ 5,7` → `45 m @ 11,1`. Før la forslaget reposet med trinnets 8,7; nå med taket 10, altså færre strenger
  på reposet og en kortere kabel.
- Bilder: `uten-repos.png`, `med-repos-tak10.png`, `med-repos-tak6.png` (20 strenger, CC 5,8 i tegningen).

## Verdt å vite

- **Gamle prosjekter** der et forslag alt har skrevet over taket (f.eks. 8,7), har det tallet i feltet. Det kan ikke skilles
  fra et tall du har satt selv, så det står. Skriv inn ønsket tak på nytt.
- Med flere repos av ulik dybde viser forslagskortet CC-en på **første** repos. Hvert repos legges med sin egen CC under taket.
- Trappebyggeren (dialogen for ny trapp) viser fortsatt «Maks CC repos» alltid. Det er ikke endret.
