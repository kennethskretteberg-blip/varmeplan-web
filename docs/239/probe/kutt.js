// 239: bytt ut ALT fra og med en startmarkør til og med en sluttmarkør (begge må finnes nøyaktig én gang,
// slutt etter start). U+27E6/7 byttes til krøllparenteser.
//   node -e ' require("./docs/239/probe/kutt.js") ' <målfil> <<'XEOF'
//   @@@ FRA \n … \n@@@ TIL\n … \n@@@ SETT\n … \n@@@ SLUTT
const fs = require('fs');
const maal = process.argv[1];
const L = String.fromCharCode(0x27e6), R = String.fromCharCode(0x27e7);
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  d = d.split(L).join(String.fromCharCode(123)).split(R).join(String.fromCharCode(125));
  let src = fs.readFileSync(maal, 'utf8');
  const re = /^@@@ FRA\n([\s\S]*?)\n@@@ TIL\n([\s\S]*?)\n@@@ SETT\n([\s\S]*?)\n@@@ SLUTT$/gm;
  let m, n = 0;
  while ((m = re.exec(d))) {
    const fra = m[1], til = m[2], ny = m[3];
    if (src.split(fra).length !== 2) { console.error('BLOKK ' + (n + 1) + ': FRA har ' + (src.split(fra).length - 1) + ' treff'); process.exit(1); }
    const i0 = src.indexOf(fra), i1 = src.indexOf(til, i0 + fra.length);
    if (i1 < 0) { console.error('BLOKK ' + (n + 1) + ': TIL ikke funnet etter FRA'); process.exit(1); }
    console.log('blokk', n + 1, 'bytter', i1 + til.length - i0, 'tegn');
    src = src.slice(0, i0) + ny + src.slice(i1 + til.length);
    n++;
  }
  if (!n) { console.error('ingen blokker'); process.exit(1); }
  fs.writeFileSync(maal, src);
  console.log('brukte', n, 'blokker på', maal);
});
