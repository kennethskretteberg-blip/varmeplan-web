# 233 – Fryserom: ingen leverandørreferanser i appen, montasjeblokken ut av PDF-en

11.11.2026 · `main` · commit `4c19d59` · ikke pushet

## Hva som er endret

- **PDF-en:** hele fryseromsblokken er fjernet fra romsiden (tittel, avvikslinjer og montasjelinjer). Ingenting erstatter den. Plassen blokken holdt av (34–42 mm) går til tegningen, så et fryserom har nå nøyaktig samme romside som andre rom. Forhåndsvisningen i eksportdialogen følger med, den bruker samme sidebudsjett.
- **Sidepanelet:** hjelpen til den som prosjekterer står, uten kilder (se tabellen).
- **Tall og regler er ikke rørt:** c/c 40, 25 W/m², reserve 5 cm forskjøvet, InFloor 10T. `_reserveCableRegressionTest` er 64/64 som før.
- Kodekommentarene og `docs/spec-fryserom.md` nevner fortsatt kildene. De er interne.

## Synlige tekster som er fjernet eller omformulert

| Sted | Før | Nå |
|---|---|---|
| PDF, romside | «Fryserom — godkjent løsning BL-001 (Thermopads 22.03.2026)» + avvik + seks montasjelinjer | fjernet |
| Sidepanel, overskrift | «Fryserom — BL-001» | «Fryserom» |
| Sidepanel, avvik | «Reservekabel er påkrevd for fryserom (BL-001 / DEVI).» | «Reservekabel er påkrevd for fryserom.» |
| Sidepanel, avvik | «Bare InFloor 10T er godkjent for fryserom (Thermopads BL-001). Rommet har …» | «Bare InFloor 10T anbefales for fryserom. Rommet har …» |
| Sidepanel, montasje | «Godkjent løsning: Thermopads BL-001 (22.03.2026).» | fjernet |
| Sidepanel, montasje | «Ansvar for design, effekt og montasje ligger hos prosjekterende.» | fjernet |
| Reservekabel-avkrysningen | «… ved siden av hovedkabelen (BL-001: 2,5–5 cm), telles i lister …» | «… ved siden av hovedkabelen, telles i lister …» |

Den siste sto ikke i bestillingen, men dukket opp i søket (punkt 3). De fire tekniske montasjelinjene står ordrett som før.

Søket etter `Thermopads`, `BL-001`, `DEVI`, `Nexans` og `VGLUB` ga 6 linjer med synlig tekst på HEAD og 0 nå. Det som står igjen av treff, er kommentarer og navn på deltester. Excel, presentasjonslenka og e-post hadde ingen treff, verken før eller nå.

## Kontroll

- **Ny test `_fryseromRegressionTest233`: 25/25.** Avvikstekstene ordrett og uten parentes; fire montasjelinjer, ingen «godkjent»/«ansvar»; sidepanelets overskrift og innhold; PDF for et fryserom har ingen blokk og ingen av ordene; sidebudsjettet har ikke lenger felt for blokken og gir samme plass som et vanlig rom; og en skanning av hele kildefila som feiler hvis et av de fem ordene står i kode utenfor kommentarer og regresjonstester. Skanningen er prøvd mot HEAD og finner de seks linjene der.
- **Bevisst endret test:** `_reserveCableRegressionTest`, deltesten «G: montasjeteksten nevner …». Den krevde før at teksten nevnte BL-001. Nå krever den at den ikke gjør det. Fortsatt 64/64.
- **Hele suiten** (`docs/233/probe/alle.mjs`, kopi av `docs/225/probe/alle.mjs` mot port 4000): 100 tester, 93 grønne. De 99 gamle gir samme resultat som HEAD. De samme sju er røde uten innlogging (`_prosjektlaas`, `_kundeforslag`, fem `_geo*`), ingen nye.
- **Skjermbilder** i `docs/233/`: `foer-sidepanel.png` / `etter-sidepanel.png` og `foer-pdf-romside.png` / `etter-pdf-romside.png`. Testrommet er et oppdiktet fryserom på 6 × 8 m med en InSnow-kabel og reserve av, slik at begge avvikene vises. Derfor står det også en flateeffekt-advarsel på romsiden – den hører ikke til 233.

## Ikke gjort

- Ikke prøvd på et ekte prosjekt (ingen innlogging i testnettleseren).
- Andre leverandør- og kildehenvisninger utenfor fryserom er listet i `SPØRSMÅL.md`, ikke endret. Den viktigste: PDF-siden «Motstandsmåling – varmefolie» har fortsatt linja «Kilde: Cenika FlexFoil installasjonsveiledning …».
- Avvikene (mangler reserve / annet produkt) står ikke lenger i PDF-en i det hele tatt – se spørsmål 11.
