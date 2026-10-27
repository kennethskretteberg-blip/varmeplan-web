# 147 — spørsmål
1. **Flateeffekt 61 og Effekt pr brutto 56 endret seg ikke.** De leste allerede `totalW` fra `_foilPower` (W/lm). Det som
   endret seg er Spesifikasjon, «Total effekt», Romoversikt-tallene og etikettene. Er det riktig at 61 W/m² (ratet ÷
   *dekket* areal) fortsatt står, eller ventet du en endring et annet sted?
2. **Fallback uten `watt_per_lm`:** før brukte `_foilPower` 60 W/m² fast, `_roomProductRows` produktets `watt_per_m2`.
   Nå brukes produktets `watt_per_m2`, ellers 60, overalt. Likt i katalogen i dag (alle 60), men et folieprodukt uten
   W/lm og med annen W/m² vil få det tallet i motstandsmålingen også. Greit?
3. **Sidepanel/materialliste/garanti-prefill** viste før ingen watt for folie uten `watt_per_lm`; nå vises fallback-tallet.
   Mer riktig enn blankt, men en endring. Greit?
4. **Auto-utleggets scoring** (`_layoutRulePenalty`, `_foilLayoutStats`) bruker nå også `_foilItemW`, slik at
   «Totalt W» i utleggsalternativene stemmer med romsiden (B=80: 48 mot 47,4 W/m). `_foilRegressionTest` er grønn, men
   straffen for «for lite watt» (15 W) kan i teorien flytte et grensetilfelle. Ønsker du at planleggeren skal være urørt?
5. **Databladet runder opp per meter** (B=80: 48 W/m vs 47,4 fra 60 W/m² × netto). Det gir 1 % høyere W/m² enn nominelle 60.
   Bekreft at 60 W/m² i katalogen kun er «merkeverdi» og at W/lm er sannheten for alle beregninger.
