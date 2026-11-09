# 216 · Dialoger — spørsmål til Kenneth

09.11.2026 · `main` · én commit, ikke pushet.

1. **Nummeret 216 er brukt fra før** («Tak 216 adressefelt», b18956f, `docs/216/`). Rapporten og spørsmålene
   ligger derfor i `docs/216-dialoger/`, og commit-meldingen begynner med «216: Dialoger — …» som bedt.
   Vil du heller ha et nytt nummer (222)?

2. **Eksporter PDF — knappenes bredde.** Før lå Avbryt / Generer PDF nederst i venstre kolonne med `flex:1`
   (≈112 px hver). Nå ligger de i en bunnlinje over hele dialogens bredde, høyrejustert, med naturlig bredde
   (som i de fleste andre dialogene). Rekkefølgen er den samme. Vil du heller ha dem venstrestilt under
   romlista, eller strukket over hele bredden?

3. **Innstillinger (profil) har ingen felles bunnlinje.** Dialogen er tre seksjoner med hver sin knapp
   («Lagre endringer», «Oppdater passord», «Visning»-knappene). Jeg har gjort den «aldri høyere enn vinduet»
   med fast tittel og scrollende innhold, men ikke laget en felles bunnlinje — det ville flyttet knapper
   bort fra feltene de hører til. Riktig valg, eller vil du ha «Lagre endringer» + «Lukk» fast nederst?

4. **Hent fra kart:** «Kartgrunnlag © Kartverket (CC BY 4.0)» ligger nå i bunnlinja *under* stegets knapper
   (nederst, som før). Ok, eller skal den ligge over knappene?

5. **Matte-panelene** («Én matte gjennom N soner», «Del så matta går opp») har tittelen inne i innholdet
   som scroller (introen er én variabel i koden). Boksen er aldri høyere enn vinduet og knappene står fast.
   Godt nok, eller skal tittelen splittes ut?

6. **Ikke åpnet i nettleser** (krever innlogging, importmotor, kart eller spesifikk tilstand): PDF-sidevelger,
   Importer tegning, Hva er vegger?, Forslag til kundenumre, Kopier til Visma, matte-panelene. Excel-import
   er åpnet med en simulert forhåndsvisning (40 rader). De er rettet ut fra koden med samme mønster, se
   tabellen i rapporten. Kan du prøve dem når du er innlogget?

7. **Playwright** er ikke installert på maskinen (og repoet har «no npm»). Testen er kjørt med Chrome
   DevTools Protocol mot headless Chromium (samme motor som Playwright bruker), fire vindusstørrelser,
   `docs/216-dialoger/probe/maal.mjs`. Skal jeg legge til Playwright som dev-avhengighet likevel?

8. **Reserven i `.modal`:** `overflow-y:auto` står igjen på selve `.modal`, slik at en framtidig `.modal`
   uten `.modal-body` scroller som helhet — knappene nås da ved scrolling, men er aldri kuttet. Ok som
   sikkerhetsnett, eller skal regresjonstesten kreve `.modal-body`?

9. **Inline `max-height:88vh/90vh/94vh`** på boksene er fjernet — klassen gir `calc(100dvh − 32px)` (16 px marg
   over og under). På en stor skjerm kan en dialog med mye innhold dermed bli *litt* høyere enn før. Ok?

10. **Innebygde `confirm()`/`prompt()`** brukes ca. 137 steder (nettleserens egne — aldri kuttet, men utenfor
    denne regelen). Skal de over på en felles dialog i en senere prompt?
