// 199: bytter testverdiene fra 198 (fritekst) til 6 siffer — BARE inne i _vismaNoRegressionTest198.
const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
const a = s.indexOf('async function _vismaNoRegressionTest198()');
const b = s.indexOf('// 171-regresjon.', a);
if (a < 0 || b < 0) throw new Error('fant ikke testen');
let mid = s.slice(a, b);
const par = [['ORD-10', '700010'], ['ORD-9', '700009'], ['ord-9', '700009'], ['55501', '555010'], ['EIER-1', '900001']];
for (const [fra, til] of par) {
  const n = mid.split(fra).length - 1;
  mid = mid.split(fra).join(til);
  console.log(fra, '→', til, n, 'steder');
}
fs.writeFileSync('index.html', s.slice(0, a) + mid + s.slice(b));
