# 236 – Fryserom: samme oppførsel uansett hvor romtypen settes, og målsetting av kabel som virker

12.11.2026 · `main` · commit `HASH236` · ikke pushet

## Hva som faktisk var feil

Gjenskapt på koden før 236 (`docs/236/probe/foer.json`, bildene `foer-*`), rom 600 × 800 cm, InFloor 10T 1200 W 120 m.

**Punkt 1 – målsetting av kabel i fryserom.** To ulike feil, og den største gjaldt ikke bare fryserom:

- **Auto-lagt kabel fikk ingen målekjede i det hele tatt – i alle romtyper.** Auto-utlegget (geo-motoren, standard
  siden 070/083) lagrer kabelen som én sammenhengende punktkjede og har ingen «strenger» (`runs = []`).
  `_cableDimChainLayout` leste bare `runs`, så «Målsett kabel» tegnet ingenting. Målt likt i fryserom
  (høyreklikk og varmepanel) og i et bad. Cowork sin antakelse (reserven blandes inn) var altså ikke årsaken her.
- **Kabel med strenger (lagt for hånd / eldre utlegg) + reservekabel: kjeden blandet hoved og reserve.** Med CC 40
  og reserve viste kjeden «40 · 5 · 5 · 35 cm» i stedet for «40 · 40 · 40 · 40 cm» (bilde `foer-pdf-B.png`).
  Dette er det Cowork beskrev, og det samme som funnet i 235.
- **Brukerens egne mål (måleverktøyet)** oppførte seg likt i fryserom og andre rom: målet fulgte bare rasteret
  (50 cm) og kunne ikke festes til en kabelstreng noe sted. Pekeren 3 px fra strengen i x = 980 ga x = 1000.

**Punkt 2 – romtypen satt fra et annet sted.** Bekreftet. «Romtype» i varmepanelet (`_upcRoomTypeChanged`) satte
bare `roomType` og `targetWm2`: rommet ble fryserom med 25 W/m², men **uten reservekabel**, og kabelbufferen ble
ikke tømt. Sidepanelet viste da avviket «Reservekabel er påkrevd for fryserom.». Plankortet og de fire importene
hadde samme mangel. Kantavstanden (`_frysMarginCm`, 20 cm) var lik begge veier – den leser bare `roomType`.

## Hva som er endret

1. **Én vei for romtype:** ny `_applyRoomType(room, typeId)` (uten UI). Setter `roomType`, `targetWm2`, slår
   reservekabel PÅ for romtyper som krever det (aldri av), tømmer kabelbufferen, og svarer `false` når romtypen er
   låst for kundebedriften (170). Brukes av alle sju stedene: `setRoomType` (høyreklikk, sidepanel, kabelpanel),
   `_upcRoomTypeChanged`, `_planKortBekreft`, `_kundeBrukNyeRom`, `_drawCreateRoomsFromReview`,
   `_pdfCreateListRooms`, `_pdfCreateListRoomsFromReview`. Beholdt som før: «ingen romtype» fra varmepanelet gir
   130 W/m², kundeimporten lar komforten bestemme W/m².
2. **Målekjeden bygges av hovedkabelen** (`_cableDimChainSources`): reservekabelen er ute, også i skrå rom.
   Auto-lagt kabel er med via ny `_cableGeoStraights` (henter de rette strengene ut av punktkjeden). Kjeden viser
   vegg → første hovedstreng, CC, CC, siste streng → vegg, og langs: vegg → kabelens ytterkant → vegg. Samme kode
   på skjerm og i PDF.
3. **«5 cm» hoved ↔ reserve er ikke tegnet** – et eget ledd havner oppå første CC-ledd. Kan måles med måleverktøyet.
4. **Måleverktøyet fester seg til kabelstrenger** (`_cableDimSnap`): 8 px fang, hoved- og reservekabel, alle
   romtyper, Shift = fritt. Bare koordinaten på tvers av strengen flyttes, så et vannrett mål forblir vannrett.
5. **Eksisterende prosjekter:** ingenting endres ved åpning. Et fryserom uten reservekabel står som det er, med
   avviket i sidepanelet. Jeg har ikke sett slike rom i ekte data – ingen prosjekter kan åpnes herfra (ingen
   innlogging). I koden finnes de bare som bevisste testoppsett (`_fryseromRegressionTest233`).

Ikke rørt: leggeregler, effekt, CC, reservekabelens plassering og telling, `_frysMarginCm`.

## Kontroll

- **Etter** (`etter-*`): rom A (auto) «20.1 · 37.3 · 37.3 · 20.1 cm» og «33.8 · 732.4 · 33.8 cm»; rom B (for hånd)
  «40 · 40 · 40 · 40 cm» og «20 · 760 · 20 cm». Skjerm og PDF like.
- **Ny test** `_roomTypeRegressionTest236` 83/83: fryserom fra hvert sted gir samme rom og lagt reserve; bad,
  kjøkken, stue og «annet» som før fra alle steder; låsen stopper alle veiene (dialog i de tre med UI); eksisterende
  rom endres ikke; kjeden i fryserom (auto og for hånd) er lik med og uten reserve; måleverktøyet i fryserom og bad.
- **Suiten** (`docs/236/probe/alle.mjs`): 102 tester, 95 grønne. Alle 101 gamle gir samme resultat som etter 235;
  de samme sju er røde uten innlogging. Ingen eksisterende test er endret.

## Funn, ikke rettet

- Kjeden viser «20.1 cm» der kantavstanden er 20 cm: auto-utlegget legger strengen 20,05 cm fra veggen.
- Zoomet langt ut kolliderer tekstene i tverrkjeden («20.1» og «37.3 cm» oppå hverandre). Var slik før også.
- Måleverktøyet følger fortsatt rasteret (50 cm) langs strengen, og zoomet langt ut tar det reservestrengen når
  den er nærmest pekeren (målt: 985 i stedet for 980 ved 44 % zoom).
- Låsen gjelder nå også importene: en låst kundebedrift får rommet inn uten romtype, uten beskjed.
- Skrå fryserom (kabel med skrå strenger) er ikke prøvd; der er bare reserven tatt ut av kjeden.

Spørsmål: `docs/236/SPØRSMÅL.md`.
