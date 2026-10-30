# Spørsmål til Kenneth — serie 163

## 163

1. **Påslaget på klemmene er 15 %** (du sa 10–20). 20 tegnede → 23 foreslått, 10 → 12 (11,5 rundet opp).
   Riktig tall? Det er ett felt (`overheadPct: 15` på `tilkoblingsklemmer`).
2. **Gamle prosjekter med Kapton lagret som f.eks. 20:** tallet står til dialogen bekreftes på nytt (da rundes
   det til 100 med melding). Visma-lim og GBAO10 som leser den lagrede lista *uten* at dialogen åpnes igjen, gir
   fortsatt 20. Greit, eller skal eksportene selv runde Kapton opp til hel rull?
3. **Plastfolien måles mot tegnet folieareal** («= 39,0 m² (folie 25,0 m²)») fordi forslaget regnes av
   folieareal / 39. Platene måles mot brutto romareal. Skal plasten heller sammenlignes med brutto (den legges
   vel over hele gulvet som platene)? Da bør også forslaget regnes av brutto — si fra, det er ett felt per rad.
4. **PDF og Excel for Kapton** viser bare «100 stk». Vil du ha «100 stk (1 rull à 100)» der også, som for
   platene?
5. **Plassering i PDF-en:** m² står bak enheten («60 | stk (43,2 m²)»), ikke bak antallet, fordi Antall-kolonnen
   er 20 mm bred. Greit, eller heller en egen liten linje under raden («Dekker 43,2 m²») som «Rom:»-linja?
6. **Når 50-rullene kommer:** skal appen kunne velge 50 eller 100 per prosjekt (begge i omløp en stund), eller
   bare byttes til 50 når lageret er tomt for 100?

## 164

1. **B=20 i P0378** hører etter prøvepunkt-regelen til den 13 cm brede kanten V13 (midt på bredden, x = 320,7,
   treffer y = 323) og får en egen liten kjede «1,2 | 19» som står klemt mellom romdimensjonene «13 cm» og
   «37 cm». Alternativer: ta den med i stammens bunnkjede (da «begynner» den 11,8 cm før stammens vegg x = 323)
   eller i venstre arms kjede. Hvilken?
2. **Stabling av langs-kjeder:** stammens kjede (2,5 | 1083 | 2,5) ligger ett trinn utenfor venstre arms (−45 mot
   −25), og høyre arms kjede havner på høyre side av rommet. Greit, eller vil du heller alltid ha alle på samme
   side (stablet utover)?
3. **U-rom:** midtfeltets langs-kjede går til høyre side (venstre og høyre kolliderer), og står langt fra sine
   bredder. Skal den heller tegnes inne i åpningen, under innerveggen?
4. **To produkttyper i samme rom** (folie + kabel, eller matte + kabel): kjedene ligger fortsatt oppå hverandre
   ved 25 cm, som før 164. Skal de stables (modellen kan det nå)?
5. **Romdimensjonene (blå) på innervegger** (V7 364, V11 310) tegnes innvendig i armen fordi retningen velges
   etter rommets tyngdepunkt — det sto fra før og er urørt (V1–V13 skulle ikke røres). Egen sak for å legge dem
   utenfor?
6. **Treffsonen for romdimensjoner** brukte 65 cm for kabel/matte der tegningen bruker 20 (altså 45 cm feil ved
   drag) — rettet til én kilde. Greit at det ble med i 164?
7. **Skjeve/roterte rom** har ingen akseparallelle kanter → kjedene måler mot ytterboksen som før. Greit?

## 165

1. **Tekststørrelsen på papiret er nå synlig i dialogen:** kjedetallene er 10 px i et 1559 px bredt bilde ≈ 1,2 mm
   høye på A4 for P0378 (produktetikettene skaleres til papir siden 051, kjedene ikke). Dialogen viser dem nå like
   små som PDF-en. Skal kjedetallene (og romdimensjonene) få en papirstørrelse som etikettene (endrer PDF-en — egen
   prompt), eller er de ment å leses med zoom i PDF-leseren? (Samme som serie-154 spm 11 / 157 «tekststørrelse».)
2. **Zoom i dialogen** forstørrer rommet, ikke teksten (som i PDF-en, der utsnittet bare endrer hva som er med).
   Greit, eller vil du ha en «lupe» i dialogen som ikke påvirker PDF-en?
3. **Notater i sidebudsjettet:** dialogen lager et midlertidig jsPDF-dokument for å bryte notatene med samme font
   som eksporten (bare når rommet har notater). Greit, eller heller en enkel tegnbredde-regning (kan avvike en linje
   → bildet 4 mm annerledes i dialogen enn i PDF-en)?
4. **Tidsbruk:** dialogen tegner nå i opptil 2126 × ~2600 px per hjul-/dra-bilde (målt 2–6 ms hodeløst; 155 målte
   17 ms for det største rommet). Merkbart tregt på din maskin?
