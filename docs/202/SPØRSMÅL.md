# 202 · Spørsmål til Kenneth

1. **«Øverste først» stemmer med planen, men ikke med trappa slik den står.** Regelen fra 11.09 (kommentaren over
   `_generateStairSurfaces` og orienteringsteksten «trinn 1» i utskriften) sier at `segs[0]`, den første raden i
   lista, alltid er trappas **fysisk nederste** trinn, der kabelen starter. «Ovenfra og ned» bestemmer bare at det
   tegnes **øverst i planen**. Under «SEGMENTER (øverste først)» står derfor det nederste segmentet øverst i lista, og
   bildet rett under, som nå sier at det viser trappa slik den står, har det nederst
   (`docs/202/dialog-900-ovenfra-usym-a.png`: 2 trinn + repos + 6 trinn). Teksten er brukt ordrett slik du bestemte.
   Skal den stå, eller skal den si hva «øverst» viser til? Forslag: «SEGMENTER (øverst i planen først)» og
   «SEGMENTER (nederst i planen først)».

2. **Båndinndelingen: hva skal rettes?** Ingen av de 141 trappene i testene bytter båndantall med høydekjeden. Avviket
   går to veier:
   - **Trapper med repos** (20 i testene): dagens formel gir for lav høyde, og en rettelse gir **færre** bånd
     (2 → 1, 3 → 2).
   - **Hestesko med toppflaten i plan** (`topLevel: 'flush'`, 9 i testene): dagens formel gir for **høy** høyde, og en
     rettelse gir **flere** bånd.

   I de konstruerte eksemplene skjer et bytte først med få trinn og lange repos (1 + R150 + 1: 2 → 1). Skal formelen
   rett og slett bytte til `_stairSideTotalHeightCm` (begge retninger rettes), eller vil du bare rette repos-feilen?

3. **Kundenes trapper er ikke målt** (ingen databasetilgang). Vil du kjøre en lesesjekk i konsollen på et par ekte
   prosjekter med repos eller hestesko før du bestemmer deg? `docs/202/probe/baand.js` kan gjøres om til en løkke over
   `S.stairs` i et åpent prosjekt. Den skriver ingenting.

4. **Grensene 4 og 8** er ikke begrunnet i koden (STEG 6 fra september). Skal de vurderes samtidig, eller holdes de
   fast mens bare høyden rettes? Å endre begge på én gang gjør det vanskelig å se hva som flyttet sideinndelingen.
