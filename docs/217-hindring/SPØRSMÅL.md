# 217 · Hindring — spørsmål til Kenneth

09.11.2026 · `main` · én commit, ikke pushet.

1. **Nummeret 217 er brukt fra før** («Rydding 217: S.geo», `docs/217/`). Rapporten ligger derfor i
   `docs/217-hindring/`, og commit-meldingen begynner med «217: Hindring — …» som bedt. Vil du ha et nytt nummer?

2. **Minstestørrelsen** ble 8 px på skjermen og 0,9 mm på papiret (rommets veggmål er 11 px / ≈ 0,93 mm i dag). Får
   teksten ikke plass selv da, går målet ut som før. Vil du ha en annen grense — eller en annen løsning for de små
   (f.eks. bare ett tall «15 × 15» i stedet for fire mål, eller målene i en liten tekstlinje under navnet)?

3. **Én av paret skjules i reserven.** Når et mål må ut (for liten hindring), vises for et rektangel bare den av de to
   like sidene som har minst kabel/folie under teksten — den andre tegnes ikke. Det halverer antall tall over utlegget
   (15 × 15: to mål i stedet for fire). Skal den andre vises likevel?

4. **Teksten viker for hindringens navn.** Navnet («Pipe», «Skap») står i tyngdepunktet. Ville målteksten lagt seg over
   det, regnes det som «ikke plass» → krymp, deretter ut. Det er grunnen til at 60-sidene i en 60 × 40 går ut ved
   zoom 0,8 mens 40-sidene står inne. Alternativet er å la målet vinne og flytte/skjule navnet. Hvilket vil du ha?

5. **Størrelsen i PDF** er 1,2 mm × labelstørrelse (som kjedetekstene i 165), mens rommets veggmål fortsatt er faste
   11 px ≈ 0,93 mm uansett profil. Skal veggmålene også følge labelstørrelsen? (Utenfor 217 — ikke rørt.)

6. **Målene følger ikke hindringen** når den flyttes eller endres (p1/p2 er faste verdenskoordinater, slik det alltid har
   vært for «Målsett hindring»). Med `hid` på plass er det nå enkelt å la dem følge med — vil du ha det?

7. **Gamle prosjekter migreres ved åpning:** mål fra før 217 flyttes inn automatisk (og lagres slik ved neste
   autolagring). Et mål brukeren selv hadde dratt til en egen avstand mister den. Greit, eller skal gamle mål stå?
