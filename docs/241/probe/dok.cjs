// 241: legger 241 inn i docs/endringslogg.md og STATUS.md. HASH (argument) byttes inn når den er kjent.
const fs = require('fs');
const hash = process.argv[2] || null;
const kort = 'Vegg-for-vegg (WBW) alltid tilgjengelig, også over importert plantegning';
const tekst = 'L-form og WBW sto inne i `if (!hasBg)` i «TEGN ROM»-baren og forsvant når en plantegning var importert; nå vises begge alltid (Rektangel, Mål, Polygon, L-form, WBW, så Yttervegg og Mållinje; «Importer plantegning» fortsatt bare uten bakgrunn). Over en plantegning settes WBW-startpunktet med første klikk på tegningen (vanlig snapping) og utsnittet står i ro – før startet WBW til høyre for alle rom og flyttet utsnittet. Hurtigtasten W går samme vei som knappen, så kalibreringskravet gjelder også den; «Nytt rom»-dialogen får samme klikk-start. WBW-verktøyet ellers, de andre verktøyene, tak-delen og kundesiden er urørt; uten bakgrunn er alt som før. Ingen egne verktøyvalg i gjennomgangen etter tolkemotoren – samme bar per etasje. Ny `_wbwOverBgRegressionTest241` 33/33 (rom 400 × 300 over bakgrunn → 400/300/400/300 cm, 12 m²); suiten 106 tester, de 105 gamle like med HEAD (samme åtte røde uten innlogging). Funn, ikke rettet: WBW-statuslinja sier «Steg 1» også etter flere vegger; R/M/P starter fortsatt over ukalibrert tegning; L-form og «Mål» legger rommet ved siden av, ikke på tegningen. Se `docs/241/RAPPORT.md`.';
let e = fs.readFileSync('docs/endringslogg.md', 'utf8');
if (!e.includes('## 241 — ')) {
  const i = e.indexOf('## 240 — '); if (i < 0) throw new Error('anker endringslogg');
  e = e.slice(0, i) + '## 241 — ' + kort + ' (23.11.2026, HASH241, `main`, ikke pushet)\n\n' + tekst + '\n\n' + e.slice(i);
}
let s = fs.readFileSync('STATUS.md', 'utf8');
if (!s.includes('241 Vegg-for-vegg')) {
  const a = '- **Sist gjort:** '; const i = s.indexOf(a); if (i < 0) throw new Error('anker status');
  s = s.slice(0, i + a.length) + '241 ' + kort + ' (`main`, committet HASH241, ikke pushet, ingen SQL): ' + tekst + ' Før det: ' + s.slice(i + a.length);
  const b = '- **Neste steg:** '; const j = s.indexOf(b); if (j < 0) throw new Error('anker neste');
  s = s.slice(0, j + b.length) + 'Fredrik prøver WBW over en importert, kalibrert plantegning (knappen WBW → klikk startpunktet → lengder og piler), og Kenneth svarer på spørsmålene i `docs/241/RAPPORT.md` (kalibreringskrav for R/M/P; klikk-plassering for L-form og «Mål»; klikk-start også uten plantegning). Deretter: ' + s.slice(j + b.length);
}
let r = fs.readFileSync('docs/241/RAPPORT.md', 'utf8');
if (hash) { e = e.split('HASH241').join('`' + hash + '`'); s = s.split('HASH241').join('`' + hash + '`'); r = r.split('HASH241').join(hash); }
fs.writeFileSync('docs/endringslogg.md', e); fs.writeFileSync('STATUS.md', s); fs.writeFileSync('docs/241/RAPPORT.md', r);
console.log('ok', hash || '(uten hash)');
