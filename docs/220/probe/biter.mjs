// 220: biter testene? Setter inn én feil om gangen i en fil, kjører test-3d, og legger fila tilbake.
//   node docs/220/probe/biter.mjs 3d   (varmeplan-3d.js)   ·   node docs/220/probe/biter.mjs 2d   (index.html, ikke mens andre tester kjører)
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const FEIL = {
  '3d': ['varmeplan-3d.js', [
    ['høyden per møne ignoreres', 'const hoydeAv = m => verdi(m.height_m) ?? ridge0;\n  for (const m of moner) {\n    if (hoydeAv', 'const hoydeAv = m => ridge0;\n  for (const m of moner) {\n    if (hoydeAv'],
    ['koblingen ignoreres, alle til første møne', 'const moneAv = e => (e.ridge_link ? moner.find(m => m.id === e.ridge_link.id) || null : null);', 'const moneAv = e => (e.ridge_link ? moner[0] : null);'],
    ['ingen deling ved T-kryss', 'side(m, r) === sd) knekk.push(v);', 'side(m, r) === sd) void v;'],
    ['feil rekkefølge på møneendene', 'krysser(siste, A, B, forste) ? [B, A] : [A, B];', 'krysser(siste, A, B, forste) ? [A, B] : [B, A];'],
    ['møneendene byttes etter gavlvandringen', 'if (fram) { X = fram.treff; Y = bak ? bak.treff : annen(X); }', 'if (fram) { Y = fram.treff; X = bak ? bak.treff : annen(Y); }'],
    ['takfot uten møne slipper gjennom', 'if (uten.length) return', 'if (false) return'],
    ['ikke-plan flate sies ikke fra om', 'if (!erPlan(hj)) ikkePlan.push(f);', ''],
    ['takvinkel mot første møne, ikke nærmeste', 'const m = R.length > 1 ? R.reduce((a, b) => (tilLinje(pt, b) < tilLinje(pt, a) ? b : a)) : R[0];', 'const m = R[0];'],
    ['3D tegner mønet i flatens høyde', 'const h = gz + (verdi(e.height_m) ?? ridge);', 'const h = gz + ridge;'],
    ['koblede tak går den gamle veien', ': kanter.some(e => e.ridge_link) && kanter.some(e => e.type === \'ridge\') ? reisKoblet', ': false ? reisKoblet'],
  ]],
  '2d': ['index.html', [
    ['brukerens kobling overskrives av forslaget', "if (cur && e.ridge_link.prov && e.ridge_link.prov.source === 'USER_CONFIRMED') continue;", ''],
    ['forslag måler til uendelig linje', 'const u = L2 ? Math.max(0, Math.min(1, ((mx - r.a.x) * dx + (my - r.a.y) * dy) / L2)) : 0;', 'const u = L2 ? ((mx - r.a.x) * dx + (my - r.a.y) * dy) / L2 : 0;'],
    ['høyden følger ikke takflaten', 'if (e.surface === s.id && e.height_m && (!e.height_m.prov || e.height_m.prov.from)) e.height_m = _takRidgeStdHeight(s);', 'void 0;'],
    ['rettet høyde følger takflaten likevel', "if (e.surface === s.id && e.height_m && (!e.height_m.prov || e.height_m.prov.from))", 'if (e.surface === s.id && e.height_m)'],
    ['møne utenfor omrisset godtas', "if (!_takRidgeInside(_takRing(s.footprint && s.footprint.world), a, b)) {", 'if (false) {'],
    ['koblingen skriver over kanttypens opphav', "e.ridge_link = { id: ridgeId, prov: { source: 'USER_CONFIRMED'", "e.prov = { source: 'USER_CONFIRMED', note: 'x' }; e.ridge_link = { id: ridgeId, prov: { source: 'USER_CONFIRMED'"],
    ['takvinkel i 2D mot første møne', 'ridge = pt && R220.length > 1 ? _takRidgeNearest(R220, { a: pt, b: pt }) : R220[0];', 'ridge = R220[0];'],
  ]],
};
const [fil, liste] = FEIL[process.argv[2]];
const orig = fs.readFileSync(fil, 'utf8');
let slapp = 0;
try {
  for (const [navn, fra, til] of liste) {
    if (orig.split(fra).length !== 2) { console.log('  ? treffer ikke:', navn); slapp++; continue; }
    fs.writeFileSync(fil, orig.replace(fra, () => til));
    const r = spawnSync('node', ['docs/3d/test-3d.mjs'], { encoding: 'utf8', timeout: 90000 });
    const fanget = r.status !== 0;
    if (!fanget) slapp++;
    console.log(fanget ? '  ✓ fanget' : '  ✗ SLAPP', navn, '·', (r.stdout.trim().split('\n').pop() || '').trim() || (r.stderr || '').split('\n')[0]);
  }
} finally { fs.writeFileSync(fil, orig); }
console.log(slapp ? `${slapp} slapp gjennom` : `alle ${liste.length} fanget`);
