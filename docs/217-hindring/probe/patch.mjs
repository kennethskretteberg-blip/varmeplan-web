// 217: patch-verktøy — eksakt strengbytte, kaster om ankeret ikke finnes nøyaktig én gang.
import fs from 'node:fs';
const f = 'index.html'; let s = fs.readFileSync(f, 'utf8');
export function bytt(fra, til, n = 1) {
  const c = s.split(fra).length - 1;
  if (c !== n) throw new Error(`anker funnet ${c} ganger (ventet ${n}): ${fra.slice(0, 80)}`);
  s = s.split(fra).join(til);
}
export function skriv() { fs.writeFileSync(f, s); console.log('skrevet', s.length); }
