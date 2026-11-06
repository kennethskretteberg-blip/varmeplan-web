// 195: patch-verktøy. Leser en patch-fil med blokker
//     @@@ FINN            (teksten må finnes NØYAKTIG én gang i målfila)
//     …gammel tekst…
//     @@@ SETT
//     …ny tekst…
//     @@@ SLUTT
// og skriver målfila. Alt-eller-ingenting: én blokk som ikke treffer → ingenting skrives.
//   node -e ' require("./docs/195/probe/bruk.js") ' <patchfil> <målfil>
const fs = require('fs');
const [, patchFil, maalFil] = process.argv;
const patch = fs.readFileSync(patchFil, 'utf8');
let src = fs.readFileSync(maalFil, 'utf8');
const re = /^@@@ FINN\n([\s\S]*?)\n@@@ SETT\n([\s\S]*?)\n@@@ SLUTT$/gm;
let m, n = 0;
while ((m = re.exec(patch))) {
  const [, gammel, ny] = m;
  const antall = src.split(gammel).length - 1;
  if (antall !== 1) { console.error('BLOKK ' + (n + 1) + ': fant ' + antall + ' treff for:\n' + gammel.slice(0, 200)); process.exit(1); }
  src = src.split(gammel).join(ny);
  n++;
}
if (!n) { console.error('ingen blokker i ' + patchFil); process.exit(1); }
fs.writeFileSync(maalFil, src);
console.log('brukte', n, 'blokker på', maalFil);
