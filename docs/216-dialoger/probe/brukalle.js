// 216: bruker flere patch-filer etter hverandre på samme målfil (sandkassa avviser sammensatte
// kommandoer). Stopper ved første blokk som ikke treffer; filer før den er da allerede skrevet.
//   node -e ' require("./docs/216-dialoger/probe/brukalle.js") ' <patch1> <patch2> … <målfil>
const fs = require('fs');
const args = process.argv.slice(1); const maalFil = args.pop();
for (const patchFil of args) {
  const patch = fs.readFileSync(patchFil, 'utf8');
  let src = fs.readFileSync(maalFil, 'utf8');
  const re = /^@@@ FINN\n([\s\S]*?)\n@@@ SETT\n([\s\S]*?)\n@@@ SLUTT$/gm;
  let m, n = 0, feil = false;
  while ((m = re.exec(patch))) {
    const [, gammel, ny] = m;
    const antall = src.split(gammel).length - 1;
    if (antall !== 1) { console.error(patchFil + ' BLOKK ' + (n + 1) + ': fant ' + antall + ' treff for:\n' + gammel.slice(0, 200)); feil = true; break; }
    src = src.split(gammel).join(ny); n++;
  }
  if (feil || !n) { console.error('STOPPET ved ' + patchFil); process.exit(1); }
  fs.writeFileSync(maalFil, src);
  console.log('brukte', n, 'blokker fra', patchFil);
}
