// 211: syntakssjekk av alle innebygde <script>-blokker i index.html
const fs = require('fs'), vm = require('vm');
const h = fs.readFileSync('index.html', 'utf8');
let i = 0, bad = 0;
for (const m of h.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
  i++; if (/type="(?!text\/javascript|module)/.test(m[1])) continue;
  try { new vm.Script(m[2]); } catch (e) { bad++; console.log('blokk', i, e.message); }
}
console.log(i, 'blokker,', bad, 'feil');
