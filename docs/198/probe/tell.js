// 198: teller treff for hver ankertekst i en fil (linjer i ankerfila, «\n» i en linje = linjeskift).
const fs = require('fs');
const [, ankerFil, maalFil] = process.argv;
const src = fs.readFileSync(maalFil, 'utf8');
for (const l of fs.readFileSync(ankerFil, 'utf8').split('\n').filter(Boolean)) {
  const a = l.split('\\n').join('\n');
  console.log(src.split(a).length - 1, JSON.stringify(a.slice(0, 70)));
}
