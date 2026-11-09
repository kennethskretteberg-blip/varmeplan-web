// 218: angleSnap beholder lengden på det skjeve klikket (172,40 → 40,05 cm), så arealet er 2403, ikke 2400 — toleranse ±10 cm², og m² avrundet er 0,24.
import fs from 'node:fs';
let s = fs.readFileSync('index.html', 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('fant ' + n + ' av: ' + a.slice(0, 80)); s = s.replace(a, () => b); };
rep(`    check('A: areal 0,24 m²', 2400, A && Math.round(compArea(A.points)) === 2400, A && compArea(A.points));`,
    `    // angleSnap beholder lengden på det skjeve klikket ((172,40) fra (170,0) = 40,05 cm), så arealet er 2400 ± noen cm² — 0,24 m² i rommets måltabell
    check('A: areal 0,24 m²', 0.24, A && Math.round(compArea(A.points) / 100) / 100 === 0.24 && Math.abs(compArea(A.points) - 2400) < 10, A && Math.round(compArea(A.points) / 100) / 100);`);
rep(`    check('B: motsatt vei gir samme rektangel og areal', '170,0 170,40 230,0 230,40 · 2400', B && B !== A && sig(B) === sig(A) && Math.round(compArea(B.points)) === 2400, B && (sig(B) + ' · ' + compArea(B.points)));`,
    `    check('B: motsatt vei gir samme rektangel og areal', '170,0 170,40 230,0 230,40 · 0,24', B && B !== A && sig(B) === sig(A) && Math.round(compArea(B.points) / 100) / 100 === 0.24 && Math.abs(compArea(B.points) - 2400) < 10, B && (sig(B) + ' · ' + compArea(B.points)));`);
fs.writeFileSync('index.html', s); console.log('patch3 ok');
