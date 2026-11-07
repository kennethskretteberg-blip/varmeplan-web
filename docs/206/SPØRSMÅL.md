# 206 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Kabel i et nedløp som går under bakken: over + under, uten 5 cm. Er det riktig?**
   Du har sagt to ting (07.11):
   - «Avsluttes nedløpet over bakken: +5 cm.» Kabelen skal stikke litt ut av nedløpet, slik at
     smeltevannet ikke fryser i munningen.
   - «Fortsetter det under bakkenivå: +1 m.» Og: «… da må vi vite lengde under bakken også.»

   Min tolkning (Cowork sin, ikke noe du har sagt ordrett): de 5 cm er der fordi enden av kabelen
   skal være *ute av røret* i lufta. Et nedløp som er gravd ned, har ingen munning i lufta. Kabelen
   slutter nede i røret ved frostfritt nivå, og der er det ingen is å smelte forbi enden. Derfor:

   | Nedløpet | Kabel i nedløpet |
   |---|---|
   | slutter over bakken | `above_ground_m + 0,05` |
   | går under bakken | `above_ground_m + below_ground_m` (standard 1,0) |

   Dette forklarer også hvorfor DEVI oppgir 1 m og filmen 5 cm: de gjelder hvert sitt tilfelle. Hvis du
   mener at det skal være 5 cm *i tillegg* også når det går under bakken, er det én linje
   (`_takDownpipeCableM`).

2. **Rennestrekket kan ikke gå forbi takfoten.** Omrisset fra Kartverket er veggliva, ikke takutstikket.
   Renna henger ytterst på takutstikket og er derfor ofte 30–60 cm lengre enn kanten (utstikket på hver
   gavl). Nå kan et strekk bare ligge *på* kanten, og «hele kanten» gir kantens lengde, altså det testen
   din ber om (25,0 = 25,0). Det betyr at renna kan bli 0,5–1 m for kort på et hus med utstikk. Skal
   strekket kunne forlenges forbi hjørnet, med et felt «utstikk i hver ende» og standard 0? Det er en
   liten endring i 206b. Jeg har ikke gjettet på et utstikk.

3. **Standardhøyden på nedløpet er hele gesimsen.** `above_ground_m` er «fra renna ned til der nedløpet
   slutter», og standard er gesimsen fra 204. Et nedløp som slutter «litt over bakkenivå», er i
   virkeligheten 20–40 cm kortere. Gesimsen er dessuten én verdi for hele bygget (±0,5 m). Panelet sier
   det ved hvert nedløp som står på standardverdien: «= gesimsen, én verdi for hele bygget (±0,5 m). Rett
   per nedløp.» Jeg trekker ingenting fra. Vil du ha et fast fradrag, for eksempel 0,3 m?

4. **Overgangen fra renne til nedløp er ikke med.** Kabelen går fra renna, gjennom tuten og eventuelt en
   svanehals, og ned i nedløpet. `above_ground_m` regnes fra takfoten, så buen ut til veggen er ikke med.
   Jeg har ikke lagt til noe, fordi 206 bare skal gi lengder fra geometrien. Hører et tillegg for
   overgangen hjemme i 207, sammen med løpene?

5. **Gradrennas lengde regnes i 3D, med toppen på mønehøyde og bunnen på gesimsen.** En gradrenne går
   nedover takfallet, så lengden i plan er for kort. Uten takflater (`roof.planes` er tom) vet appen
   ikke hvor høyt toppen ligger. Jeg setter derfor toppen = mønet og bunnen = gesimsen, som anslag
   (eksempel: 4 m i plan og 3 m fall gir 5,0 m). Begge kan rettes i panelet, og da står de selv om mønet
   eller gesimsen endres senere. Mangler høydene, brukes lengden i plan med advarselen «Høyde mangler —
   lengden er målt i plan og blir for kort på et skrått tak». En gradrenne som slutter under mønet (vanlig
   på et ark), må altså få toppen rettet. Er det greit, eller skal toppen ha et eget standardvalg?

6. **En kant merket «gradrenne» i 205 blir ikke en gradrenne av seg selv.** Prompten sier at gradrenner
   tegnes helt for hånd, og slik er det bygget. Klikkene snappes til hjørnene i omrisset og til endene av
   mønet. 205-typen «gradrenne» på en kant er bare en farge. Skal en kant eller linje som er merket
   gradrenne, få et klikk i menyen «Legg gradrenne her», slik takfoten har «Rennestrekk langs hele
   kanten»?

7. **Klikk rundes til 10 cm.** På et helt hus på skjermen er én piksel 2–3 cm, så hele centimeter var
   falsk presisjon (testen fikk 1,98 m for et klikk på 2,0). Nedløpets posisjon kan skrives inn nøyaktig
   i panelet («Fra start»), og delstrekkene følger med. Endene på et rennestrekk kan ikke flyttes etter
   at det er lagt. Da må det slettes og tegnes på nytt. Er det nok i første omgang?

8. **Delstrekkene arver ved deling (forberedt for 207).** Hvert delstrekk har `id` (`r1.1`, `r1.2` …),
   `from_m`, `to_m` og `length_m`. Når 207 setter for eksempel `runs: 2` på et delstrekk og du så setter
   et nytt nedløp midt i det, får begge halvdelene `runs: 2`. Fjernes nedløpet, smelter de sammen igjen,
   og egenskapene til delstrekket der midtpunktet havner, beholdes. Er det riktig regel?

9. **Overlappende rennestrekk avvises.** Flere strekk på samme kant går fint (for eksempel 0–10 og
   12–25 m), men et strekk som overlapper et annet, får meldingen «Overlapper rennestrekk r1 på samme
   kant». Ellers ville samme renne blitt telt to ganger.

10. **Rennestrekket tegnes litt utenfor takfoten.** Den blå renna ligger 8 px utenfor den grønne
    kanten, der den henger i virkeligheten. Da kan både kanten (typemenyen fra 205) og renna (velg,
    slett) klikkes. Lengden regnes av kanten selv, ikke av den forskjøvne streken.

11. **Når gesimsen rettes, følger nedløpene som står på standardverdien.** Rettes gesimsen i kortet fra 10
    til 11 m, går alle nedløp som ikke er rettet til 11 m. Et nedløp du har rettet, står. Rennestrekkets
    høyde (z) følger alltid gesimsen, fordi den ikke kan rettes for seg.
