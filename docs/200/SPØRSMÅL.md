# 200 · Spørsmål til Kenneth

Svar gjerne rett under hvert spørsmål. «Valgt nå» er slik koden er i dag.

## 1. Små tabeller i nesten kvadratiske rom havner nå på egen side

**Valgt nå:** svaret ditt fulgt bokstavelig: tegningen krymper **aldri**. Får ikke hele tabellen plass under
(eller ved siden av) tegningen, går den til egen side, uansett hvor få rader den har.

Ulempen: i rom der tegningen allerede fyller høyden på siden (nesten kvadratiske rom), mangler det ofte noen
få millimeter. Målt med én rad i Spesifikasjon (tegningens bredde 180 mm):

| Rom (cm) | Tegning (mm) | 1 rad | 2 rader | 6 rader | 10 rader |
|---|---|---|---|---|---|
| 800 × 600 | 180 × 147 | får plass | får plass | får plass | får plass |
| 400 × 300 | 180 × 154 | får plass | får plass | får plass | mangler 4 mm (2,8 %) |
| 600 × 500 | 180 × 160 | får plass | får plass | **mangler 1,6 mm (1,0 %)** | mangler 10 mm (6,2 %) |
| 300 × 250 | 180 × 165 | får plass | mangler 2,4 mm (1,5 %) | mangler 6,6 mm (4,0 %) | mangler 15 mm (9,1 %) |
| 500 × 500 | 180 × 180 | **mangler 13 mm (7,3 %)** | mangler 17 mm | mangler 22 mm | mangler 30 mm |

Testrommet «Blandet» (600 × 500, 6 rader) får derfor en egen forklaringsside for 6 rader, fordi det mangler
1,6 mm. I 196 krympet tegningen 1 % i stedet.

Alternativ: la tegningen krympe **litt** (f.eks. inntil 3 %, som ikke synes) før tabellen sendes til egen
side. Da ville Blandet, 300 × 250 med 2 rader og 400 × 300 med 10 rader holdt seg på én side. Vil du ha en
slik grense, og hvor stor?

## 2. Hva regnes som «står allerede i forklaringen»?

**Valgt nå:** en Spesifikasjon-rad tas bort bare når den sier **nøyaktig** det samme som én rad i
forklaringen, altså «1 stk», samme produkt, samme lengde og samme effekt. Rader med flere stk blir stående,
fordi de er **summer** (antall + samlet effekt per produkt og lengde) som ikke står noe annet sted.

Følgene i testprosjektet:

- **Stue** (6 baner med ulik lengde): alle 6 radene tas bort → Spesifikasjon forsvinner helt.
- **Bad og Gang** (én kabel hver): kabelraden tas bort; «Senteravstand (CC)» blir stående under overskriften.
- **Lager** (22 baner, 3 lengder): de 3 sumradene «8 stk · 4,6 m · 1325 W» osv. står. Hver bane står også
  i forklaringen, men antallet og summen gjør ikke det.
- **Nedkjøring** (7 matter): «4 stk … 9600 W» og «3 stk … 14400 W» står.

Er det riktig, eller vil du ha Spesifikasjon helt bort i Nummer-modus også når den har summer (antallet kan
telles i forklaringen, og totaleffekten står under «Areal, effekt og dekning»)?

## 3. Punktum i «Areal, effekt og dekning» og i undertittelen

Kommaet gjelder nå hele Spesifikasjon-blokken, også CC-linja («Senteravstand (CC): 7,5 cm»). Flere CC-verdier
skilles med « / » («7,5 / 10,0 cm»), fordi «7,5, 10,0 cm» blir uleselig.

Resten av romsiden har fortsatt punktum: «70.00 m²», «57.23 m²» i nøkkeltallene og «70.0 m²» i undertittelen
(se `lager-etter.png`). Det var ikke en del av oppgaven, så det er ikke rørt. Skal de få komma også?

## 4. Spesifikasjonens radtall i sidebudsjettet (lite funn, ikke endret)

Sidebudsjettet (`_pdfRoomPageBudget`) regner én rad per **produkt**, men Spesifikasjon skriver én rad per
produkt **og lengde**. Lager har 1 produkt i budsjettet, men 3 rader på papiret. I Label-modus er dette som
før (ikke rørt). I Nummer-modus regner jeg med de radene som faktisk skrives, så tabellen ikke kan presse
Spesifikasjon ut over sidekanten. Skal Label-budsjettet rettes på samme måte? Det kan gjøre tegningen litt
mindre i rom med mange ulike folielengder, så jeg har latt være.
