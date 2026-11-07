// 203: kryssjekk — bNy (ny kode) mot «Kjede»-kolonnen i 202-målingen (docs/202/probe/baand.json), rad for rad.
const fs = require('fs');
const g = JSON.parse(fs.readFileSync('docs/202/probe/baand.json', 'utf8')), n = JSON.parse(fs.readFileSync('docs/203/probe/baand.json', 'utf8'));
console.log('kjøring 202:', JSON.stringify(g.kjoring)); console.log('kjøring 203:', JSON.stringify(n.kjoring));
console.log('rader 202/203:', g.rader.length, n.rader.length);
let sammeRad = 0, avvik = []; const tell = k => { const t = {}; for (const r of n.rader) t[r[k]] = (t[r[k]] || 0) + 1; return t; };
n.rader.forEach((r, i) => { const o = g.rader[i]; const id = o && o.test === r.test && o.segs === r.segs && o.dybde === r.dybde && o.hKjede === r.hKjede;
  if (id) sammeRad++; if (!id || r.bNy !== o.bKjede) avvik.push({ i, r, o }); });
console.log('samme trapp på samme rad:', sammeRad, '· avvik bNy ≠ bKjede(202):', avvik.length);
console.log('bånd ny kode:', JSON.stringify(tell('bNy')), '· 202 kjede:', JSON.stringify(tell('bKjede')), '· 202 dagens:', JSON.stringify(tell('bDagens')));
console.log('bytter (gammel formel → ny kode):', n.rader.filter(r => r.bNy !== r.bDagens).length);
avvik.slice(0, 5).forEach(a => console.log(JSON.stringify(a)));
