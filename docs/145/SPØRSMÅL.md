# 145 — spørsmål
1. **Foliens effekt har to tall på samme romside.** Hodet og motstandsblokken bruker `watt_per_lm` (B=60: 36 W/m), men «Spesifikasjon» og «Total effekt» (`_roomProductRows`) bruker `watt_per_m2 × nettobredde` (60 × 0,59 = 35,4 W/m). Eksempel Stue: hode 1067 W, Total effekt 1054 W, motstandsblokk 1066,8 W. Rørt ikke (utenfor oppdraget). Skal `_roomProductRows` også gå på `watt_per_lm` for folie?
2. **Ω i dokumentasjonsmodulens PDF** (`_docBuildPDF`: «nominell … Ω», «R=… Ω», «MΩ») tegnes som «©» med jsPDFs helvetica. Rørt ikke. Skal `_pdfTextOhm` brukes der også?
3. **Notater + folie = ekstra side.** Blokken (ca. 49 mm) er ikke med i tegningens høydebudsjett, slik du ba om. Rom med notater får derfor Notater på side 2. Alternativ: budsjetter blokken og la tegningen krympe litt. Hva foretrekker du?
4. **Én måling per rom?** Blokken og tabellen antar at all folie i rommet står på én krets/ett målepunkt. Et rom med flere termostater eller tilkoblinger måles per krets — skal tabellen ha én rad per krets (krever at kretser finnes som begrep i modellen)?
5. **Kabel og matte** er ikke med (egen sak). Katalogen har kolonnene `nominal_ohm`, `min_ohm`, `max_ohm`, `resistance_ohm` — tomme for folie. Skal de fylles for kabel/matte som fasit, eller regnes alt fra W og spenning?
6. **Plassering:** tabellsiden står rett før Materialliste (etter Romoversikt og Trappeoversikt), ikke rett etter romsidene. Greit, eller rett etter siste romside?
7. **Tabellen tar bare valgte rom** (samme utvalg som romsidene). Skal den alltid ha alle folierom, uavhengig av hakene?
