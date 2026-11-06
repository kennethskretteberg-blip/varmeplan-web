// 196: setter innholdet av en fil inn FØR en ankertekst som må finnes nøyaktig én gang i målfila.
//   node -e ' require("./docs/196/probe/settinn.js") ' <innholdsfil> <målfil> "<anker>"
const fs = require('fs');
const [, innFil, maalFil, anker] = process.argv;
const inn = fs.readFileSync(innFil, 'utf8');
let src = fs.readFileSync(maalFil, 'utf8');
const n = src.split(anker).length - 1;
if (n !== 1) { console.error('ankeret finnes ' + n + ' ganger'); process.exit(1); }
if (src.includes(inn.slice(0, 200))) { console.error('innholdet ser ut til å være satt inn fra før'); process.exit(1); }
src = src.replace(anker, () => inn + anker);
fs.writeFileSync(maalFil, src);
console.log('satte inn', inn.length, 'tegn før', JSON.stringify(anker.slice(0, 60)));
