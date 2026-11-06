// 195: som skriv.js, men LEGGER TIL på slutten av fila (lange filer skrives i flere biter —
// skallet avviser for lange kommandoer).
//   node -e ' require("./docs/195/probe/legg.js") ' <fil> <<'XEOF' … XEOF
const fs = require('fs'), pth = require('path');
const f = process.argv[1];
const L = String.fromCharCode(0x27e6), R = String.fromCharCode(0x27e7);
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  d = d.split(L).join(String.fromCharCode(123)).split(R).join(String.fromCharCode(125));
  fs.mkdirSync(pth.dirname(f), { recursive: true });
  fs.appendFileSync(f, d);
  console.log('la til', d.length, 'tegn i', f);
});
