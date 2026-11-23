// 242: legger 242 inn i docs/endringslogg.md og STATUS.md. HASH (argument) byttes inn når den er kjent.
const fs = require('fs');
const hash = process.argv[2] || null;
const kort = 'R/M/P krever kalibrert plantegning, og WBW-statuslinja teller veggene';
const tekst = 'Hurtigtastene R, M og P går nå via `abStartDraw` som L, W og knappene: over en ukalibrert plantegning kommer «Ikke kalibrert / Sett målestokk» i baren og ingen tegning starter; med kalibrert plantegning og uten plantegning starter de som før, med samme romnavn (navnefeltet, ellers «Rom N») og aktiv etasje. WBW-statuslinja sto på «Steg 1» fordi den telte `S.drawing.points` (alltid tom i WBW) og bare ble satt ved start; den teller nå `wbw.walls` og oppdateres av `updWbw()` etter hver vegg, angre og bytte Taster/Mus: «Steg 1: … første vegg», så «Vegg 2:», «Vegg 3:» …, likt med og uten plantegning. L-form og «Mål» legges fortsatt ved siden av eksisterende rom (beslutning 23.11.2026). Ny `_drawHotkeyCalibRegressionTest242` 77/77 (47/77 mot koden før); suiten 107 tester, de 106 gamle like med HEAD (samme åtte røde uten innlogging). Funn, ikke rettet: D (mål) starter over ukalibrert tegning; «Ignorer» i varselet lukker bare varselet. Se `docs/242/RAPPORT.md`.';
let e = fs.readFileSync('docs/endringslogg.md', 'utf8');
if (!e.includes('## 242 — ')) {
  const i = e.indexOf('## 241 — '); if (i < 0) throw new Error('anker endringslogg');
  e = e.slice(0, i) + '## 242 — ' + kort + ' (23.11.2026, HASH242, `main`, ikke pushet)\n\n' + tekst + '\n\n' + e.slice(i);
}
let s = fs.readFileSync('STATUS.md', 'utf8');
if (!s.includes('242 R/M/P krever')) {
  const a = '- **Sist gjort:** '; const i = s.indexOf(a); if (i < 0) throw new Error('anker status');
  s = s.slice(0, i + a.length) + '242 ' + kort + ' (`main`, committet HASH242, ikke pushet, ingen SQL): ' + tekst + ' Før det: ' + s.slice(i + a.length);
  const gml = 'Fredrik prøver WBW over en importert, kalibrert plantegning (knappen WBW → klikk startpunktet → lengder og piler), og Kenneth svarer på spørsmålene i `docs/241/RAPPORT.md` (kalibreringskrav for R/M/P; klikk-plassering for L-form og «Mål»; klikk-start også uten plantegning).';
  if (!s.includes(gml)) throw new Error('anker neste');
  s = s.replace(gml, () => 'Fredrik prøver WBW over en importert, kalibrert plantegning (knappen WBW → klikk startpunktet → lengder og piler; statuslinja nederst skal telle «Vegg 2», «Vegg 3» …) og R/M/P over en ukalibrert tegning, og Kenneth svarer på `docs/242/SPØRSMÅL.md` («Steg 1» eller «Vegg 1» for første vegg; «Ignorer»-knappen; kalibreringskrav for D; varsel uten toast) og 241-spørsmål 3 (klikk-start for WBW også uten plantegning).');
}
let r = fs.readFileSync('docs/242/RAPPORT.md', 'utf8');
if (hash) { e = e.split('HASH242').join('`' + hash + '`'); s = s.split('HASH242').join('`' + hash + '`'); r = r.split('HASH242').join('`' + hash + '`'); }
fs.writeFileSync('docs/endringslogg.md', e); fs.writeFileSync('STATUS.md', s); fs.writeFileSync('docs/242/RAPPORT.md', r);
console.log('ok', hash || '(uten hash)');
