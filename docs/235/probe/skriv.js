// 195: skriveverktøy. Denne økta får bare skrive via «node -e», og kommandoen kan ikke ha
// krøllparenteser med fnutter i. Derfor: innholdet kommer på stdin med U+27E6 / U+27E7 i stedet
// for krøllparenteser, og byttes tilbake her.
//   node -e ' require("./docs/195/probe/skriv.js") ' <fil> <<'XEOF' … XEOF
const fs = require('fs'), pth = require('path');
const f = process.argv[1];
const L = String.fromCharCode(0x27e6), R = String.fromCharCode(0x27e7);
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  d = d.split(L).join(String.fromCharCode(123)).split(R).join(String.fromCharCode(125));
  fs.mkdirSync(pth.dirname(f), { recursive: true });
  fs.writeFileSync(f, d);
  console.log('skrev', f, d.length, 'tegn');
});
