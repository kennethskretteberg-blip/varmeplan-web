# 223 · Skarp tegneflate og tydeligere rutenett — spørsmål til Kenneth

Valgene er tatt så løpet kunne gå videre. Svar når du har tid; ingenting av dette stopper 224–225.

1. **Strekbredde på rutenettet ved retina.** Prompten sa «1 fysisk linje tykke». Valgt: linjene legges på hele fysiske
   piksler med bredde = `round(dpr)` fysiske piksler — 1 piksel på vanlig skjerm, **2 fysiske piksler på Mac** (= 1 CSS-
   punkt, samme vekt som Flow Busbars SVG-strek med `stroke-width: 1`, som også blir 2 fysiske piksler på retina). Begge
   er knivskarpe (ingen utsmøring). *Alternativ:* alltid 1 fysisk piksel (`lineWidth = 1/dpr`) — tynnere og lysere på Mac
   enn Busbar; bytt `lwDev` i `drawGrid` til `1`.

2. **Mørkt tema — fargene** (`:root`): lerret `#0d0e10` (som før), fin `#141720`, hoved `#20242d`, akse `#323848`.
   Valgt så vekten ligner det gamle (hvitt med 1,3 / 6 / 10 % dekning). Bilde: `docs/223/etter-moerkt-normal.png`.
   Ikke finpusset (jf. Coworks spørsmål 2).

3. **Origo-krysset** har nå aksefargen (`#b9c3d1` lyst) i stedet for 22 % svart — litt lysere enn før. Formen og
   størrelsen (12 px) er uendret. Skal det tilbake til mørkere?

4. **Hovedlinjer hver 1 m, ikke 50 cm.** På normal zoom (1 m ≈ 120 px) er 10 cm-linjene på (6 px-regelen), så rutenettet
   er fortsatt ganske tett, men med rolige farger. Snapping er fortsatt 50 cm (`GRID`) — rutenettet viser altså ikke
   lenger snappetrinnet som egne linjer. Skal 50 cm-linjene få en egen (tredje) styrke mellom fin og hoved?

5. **Port 4010 er fortsatt den gamle Python-serveren** (404). Jeg brukte 4013 (startet av 226, står fortsatt). Alle
   skript i `docs/223/probe/` peker dit. Som 226 sa: drep pid 81926, så finner `kjor-lop.sh` ikke «noe som svarer» og
   starter sin egen på 4010.

6. **`isPointInPath`/`getImageData` leser fysiske piksler.** Ingen produksjonskode bruker dem på hovedlerretet (bare to
   tak-regresjonstester, som nå ganger med `_cvDpr`). Ny kode som vil lese piksler fra `ctx` må gjøre det samme — det er
   notert i kommentaren over `_cvDpr`.

7. **Nettleser-zoom.** `devicePixelRatio` begrenses til maks 2, men ikke nedad: ved 50 % nettleserzoom på en vanlig skjerm
   er dpr 0,5, og bufferen blir halv CSS-størrelse (som skjermen faktisk viser). Før 223 ble den tegnet i CSS-størrelse og
   krympet. Begge er riktig for skjermen; nevnt for ordens skyld.

8. **Hovedlerretets `toDataURL` gir nå 2× bilder på Mac.** Brukes bare av PDF-veiene (som tegner 1:1 med `_cvDpr = 1`) og
   av regresjonstestene. Skulle en framtidig «lagre skjermbilde»-knapp lese hovedlerretet, blir bildet dobbelt så stort
   — og skarpere.
