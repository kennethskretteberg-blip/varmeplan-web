// 198: sammenligner alle-head.json og alle-etter.json (samme test → samme tall?).
const fs = require('fs');
const h = JSON.parse(fs.readFileSync('docs/235/probe/alle-head.json', 'utf8'));
const e = JSON.parse(fs.readFileSync('docs/235/probe/alle-etter.json', 'utf8'));
const kort = x => x.total != null ? x.pass + '/' + x.total + (x.fail && x.fail.length ? ' [' + x.fail.join(' | ') + ']' : '') : (x.unntak ? 'KASTER' : JSON.stringify(x).slice(0, 60));
let like = 0, sumH = 0, sumE = 0, gH = 0, gE = 0; const ulike = [], nye = [];
for (const n of Object.keys(e)) {
  if (e[n].total != null) { sumE += e[n].total; if (e[n].pass === e[n].total) gE++; }
  if (!(n in h)) { nye.push(n + ': ' + kort(e[n])); continue; }
  if (kort(h[n]) === kort(e[n])) like++; else ulike.push(n + ': HEAD ' + kort(h[n]) + ' → nå ' + kort(e[n]));
}
for (const n of Object.keys(h)) if (h[n].total != null) { sumH += h[n].total; if (h[n].pass === h[n].total) gH++; }
console.log('HEAD:', Object.keys(h).length, 'tester,', gH, 'grønne,', sumH, 'deltester');
console.log('NÅ:  ', Object.keys(e).length, 'tester,', gE, 'grønne,', sumE, 'deltester');
console.log('like med HEAD:', like, '· ulike:', ulike.length, '· nye:', nye.length);
ulike.forEach(x => console.log('  ULIK', x)); nye.forEach(x => console.log('  NY', x));
console.log('røde nå:'); Object.keys(e).filter(n => !(e[n].total != null && e[n].pass === e[n].total)).forEach(n => console.log('  ', n, kort(e[n])));
