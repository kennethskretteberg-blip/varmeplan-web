// 226: syntakssjekk av alle inline <script>-blokker i index.html (vm.Script, ingen kjøring).
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let n = 0, feil = 0, m;
while ((m = re.exec(html))) {
  n++;
  const start = html.slice(0, m.index).split('\n').length;
  try { new vm.Script(m[1], { filename: `script${n}` }); }
  catch (e) { feil++; console.log(`✗ blokk ${n} (fra linje ${start}): ${e.message}`, e.stack.split('\n').slice(0, 3).join(' | ')); }
}
console.log(`${n} skriptblokker, ${feil} med syntaksfeil`);
process.exit(feil ? 1 : 0);
