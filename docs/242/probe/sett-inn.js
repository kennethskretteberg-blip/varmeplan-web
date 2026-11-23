// 242: setter docs/242/probe/t242.js inn i index.html foran 241-testen (bytter ut en tidligere innsatt utgave).
//   node -e ' require("./docs/242/probe/sett-inn.js") '
const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
const t = fs.readFileSync('docs/242/probe/t242.js', 'utf8');
const A = '// 242: regresjon — hurtigtastene R, M og P (og L, W) krever', B = '// 241: regresjon — vegg-for-vegg (WBW) og L-form er alltid i';
const ib = s.indexOf(B); if (ib < 0 || s.indexOf(B, ib + 1) >= 0) throw new Error('anker');
const ia = s.indexOf(A);
s = (ia >= 0 ? s.slice(0, ia) : s.slice(0, ib)) + t + s.slice(ib);
fs.writeFileSync('index.html', s);
console.log('satt inn', t.length, 'tegn', ia >= 0 ? '(byttet ut)' : '(ny)');
