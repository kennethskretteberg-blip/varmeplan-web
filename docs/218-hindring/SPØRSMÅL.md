# 218 · Spørsmål til Kenneth

1. **Nummeret 218 er brukt fra før** («Tak 218 pensel», `docs/218/`). Rapporten ligger derfor i `docs/218-hindring/`,
   som 217 lå i `docs/217-hindring/`. Greit, eller skal hindring-løpet få egne nummer?

2. **Ingen «velg halvdel» for samme vegg.** Klikk 4 på startveggen oppretter hindringen med én gang (den korte veien
   langs veggen). Den andre halvdelen — hele rommet minus pipa — finnes ikke som valg. Riktig tolkning av «lukkes
   automatisk»?

3. **Enter som avslutning** finnes ikke i vegg-til-vegg-modusen (bare i polygon-modus), og jeg la det ikke til.
   Skal Enter lukke tilbake til startveggen (vinkelrett ned fra siste hjørne)?

4. **Vinkelsnapp mot skrå vegger.** Hjørnene snapper nå også vinkelrett/parallelt med startveggen, i tillegg til de
   vanlige 90°/45°-retningene. På vannrette og loddrette vegger er det identisk med før. På en skrå vegg gjelder det
   også når man avslutter på en *annen* vegg — det er samme strek. Skal det heller bare gjelde når man ender på samme vegg
   (da vet vi det først ved siste klikk, så det måtte vært en etter-justering)?

5. **Hjørne nærmere enn 30 px fra en annen vegg** regnes som klikk på den veggen (som før). En pipe helt inne i hjørnet
   tegnes derfor med tre klikk (vegg – hjørne – nabovegg) og går via «velg halvdel». Greit, eller skal nærheten til
   en annen vegg ignoreres så lenge man ikke har «løftet» streken ut fra startveggen?

6. **Toleransen 100 cm²** for en gyldig form er den samme som for to vegger. En «hindring» på 5 × 5 cm avvises altså.
   OK?
