// 232: bytter ut HELE linja som inneholder markøren (argv[2]) med stdin. Nøyaktig ett treff kreves.
//   node -e ' require("./docs/232/probe/linje.js") ' <fil> "<markør>" <<'XEOF' … XEOF
const fs = require('fs');
const maal = process.argv[1], mark = process.argv[2];
const L = String.fromCharCode(0x27e6), R = String.fromCharCode(0x27e7);
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  d = d.split(L).join(String.fromCharCode(123)).split(R).join(String.fromCharCode(125)).replace(/\n$/, '');
  const lines = fs.readFileSync(maal, 'utf8').split('\n');
  const idx = lines.map((l, i) => l.includes(mark) ? i : -1).filter(i => i >= 0);
  if (idx.length !== 1) { console.error('fant ' + idx.length + ' linjer med: ' + mark); process.exit(1); }
  lines[idx[0]] = d;
  fs.writeFileSync(maal, lines.join('\n'));
  console.log('byttet linje', idx[0] + 1);
});
