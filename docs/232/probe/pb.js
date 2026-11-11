// 230: patch rett fra stdin (skriv.js + bruk.js i ett). U+27E6/7 byttes til krøllparenteser.
//   node -e ' require("./docs/230/probe/pb.js") ' <målfil> <<'XEOF' … XEOF
const fs = require('fs');
const maal = process.argv[1];
const L = String.fromCharCode(0x27e6), R = String.fromCharCode(0x27e7);
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  d = d.split(L).join(String.fromCharCode(123)).split(R).join(String.fromCharCode(125));
  let src = fs.readFileSync(maal, 'utf8');
  const re = /^@@@ FINN\n([\s\S]*?)\n@@@ SETT\n([\s\S]*?)\n@@@ SLUTT$/gm;
  let m, n = 0;
  while ((m = re.exec(d))) {
    const gammel = m[1], ny = m[2];
    const antall = src.split(gammel).length - 1;
    if (antall !== 1) { console.error('BLOKK ' + (n + 1) + ': fant ' + antall + ' treff for:\n' + gammel.slice(0, 200)); process.exit(1); }
    src = src.split(gammel).join(ny);
    n++;
  }
  if (!n) { console.error('ingen blokker'); process.exit(1); }
  fs.writeFileSync(maal, src);
  console.log('brukte', n, 'blokker på', maal);
});
