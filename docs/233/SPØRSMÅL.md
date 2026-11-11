# 233 – spørsmål til Kenneth

Ingenting av dette er endret. Svar kort, så tar jeg det i neste runde.

## Andre leverandør- og kildehenvisninger jeg fant (ikke rørt)

1. **PDF, siden «Motstandsmåling – varmefolie»:** «Kilde: Cenika FlexFoil installasjonsveiledning, beregning av motstand.» (`index.html`, `doc.text('Kilde: Cenika …')`). Dette er den eneste kildehenvisningen som fortsatt havner i PDF-en. Skal den bort?
2. **Rørmodulen (frostsikring av rør), skjerm:** «Tabellverdier fra Cenika varmekatalog. Fasit: 30 mm iso · 2″ rør · ΔT 20 → 7 W/m.» Skal «fra Cenika varmekatalog» bort?
3. **Tak, flatt tak (kortet i sidepanelet), skjerm:** «standard 0,40 m — hentet fra Cenikas animasjon «Flatt tak» (0,33–0,42 m)» (to steder). Skal det stå bare «standard 0,40 m (0,33–0,42 m)»?
4. **Tak, renner/nedløp, skjerm:** «Regler fra IceFix-filmen — ikke bekreftet mot leverandørens datablad. Ingen artikkelnumre ennå.» og «… — ikke bekreftet mot datablad.» Dette er forbehold, ikke godkjenninger. Skal de stå?
5. **Snø og rør, skjerm:** «Produkter og art./EL-nr fra valgt leverandørs katalog. Kvalitetssikres mot referanseberegning før bruk.», «Produkt (fra leverandørens katalog)», «CVA/EL fra katalog». Ingen leverandør er navngitt – regner med at disse kan stå?
6. **Dokumentasjon/Garantiportal:** leverandørnavnet («Cenika») vises som merkelapp på garantibevis og reklamasjoner, og garantibeviset bærer leverandørens navn. Det er leverandør som data (jf. CLAUDE.md), og jeg har regnet det som utenfor beslutningen. Riktig?
7. **Produktnavn og artikkelnumre** (InFloor 10T, InSnow, FlexFoil, CVA-numre) står overalt i lister, PDF og Excel. Regner med at produktnavn ikke er «referanse til leverandør» – ellers kan ikke materiallista lages.
8. **Kart:** «© Kartverket (CC BY 4.0)» står på kartbakgrunner og i PDF-en. Det er et lisenskrav og bør stå.

## Om selve 233

9. **«anbefales» i stedet for «er godkjent»:** avviket lyder nå «Bare InFloor 10T anbefales for fryserom. Rommet har …» slik du skrev. I koden heter feltet fortsatt `FRYSEROM.godkjentFamilie` (internt, ikke synlig). Greit?
10. **Reservekabel-avkrysningen** sa «legges 5 cm ved siden av hovedkabelen (BL-001: 2,5–5 cm)». Jeg fjernet hele parentesen, så det står «legges 5 cm ved siden av hovedkabelen, telles i lister, men ikke i effekt». Vil du heller ha «(2,5–5 cm)» stående uten kilden? Intervallet står uansett i første montasjelinje.
11. **Avvikene vises ikke lenger i PDF-en** (mangler reserve / annet produkt enn InFloor 10T). De sto bare i fryseromsblokken. Den som prosjekterer ser dem i sidepanelet, kunden ser dem ikke. Er det meningen, eller skal «Reservekabel er påkrevd» fortsatt inn i PDF-en som en vanlig advarselslinje (slik flateeffekt-advarselen står under Spesifikasjon)?
12. **Tegningen blir litt større** på romsiden for fryserom, fordi plassen blokken holdt av (ca. 34–42 mm) nå går til tegningen – som for alle andre rom.
13. **`docs/spec-fryserom.md` og kodekommentarene** nevner fortsatt kildene (BL-001, DEVI, Nexans). De er interne og forklarer tallene. Står de?
