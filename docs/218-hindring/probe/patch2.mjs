// 218: testen klikker på hele piksler (clientX er heltall) — 2 px/cm og rom-origo på en hel piksel; hjørnetestene 20 cm fra hjørnet (3 cm ville snappet til naboveggen), pluss pipe i selve hjørnet via to vegger.
import fs from 'node:fs';
let s = fs.readFileSync('index.html', 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('fant ' + n + ' av: ' + a.slice(0, 80)); s = s.replace(a, () => b); };
rep(`    S.view.zoom = Math.min(canvas.width / 520, canvas.height / 420) / BASE_SCALE; S.view.panX = 200; S.view.panY = 150;
    const click = (x, y) => { const sp = w2s(x, y), r = canvas.getBoundingClientRect();`,
`    // Hele piksler: musehendelser har heltalls clientX/Y, så 1 cm = 2 px (1 px på små lerret) og rommets origo på en hel piksel
    const sc = (canvas.width >= 1100 && canvas.height >= 720) ? 2 : 1;
    S.view.zoom = sc / BASE_SCALE; S.view.panX = 200 + (canvas.width / 2 - Math.round(canvas.width / 2)) / sc; S.view.panY = 150 + (canvas.height / 2 - Math.round(canvas.height / 2)) / sc;
    const click = (x, y) => { const sp = w2s(x, y), r = canvas.getBoundingClientRect();`);
rep(`    // D: helt inntil hjørnet — klikk 1 nær (0,0), nærmest øvre vegg → lukkes langs øvre vegg, ikke rundt rommet
    const D = run([[3, -2], [3, 40], [60, 40], [60, -2]]);
    check('D: ved hjørnet lukkes langs øvre vegg (0..40 dypt), areal 57·40', 2280, D && Math.round(compArea(D.points)) === 2280 && D.points.length === 4, D && (compArea(D.points) + ' · ' + D.points.length + ' pkt'));
    // D2: klikk 1 nærmest venstre vegg → lukkes langs venstre vegg
    const D2 = run([[-2, 3], [40, 3], [40, 60], [-2, 60]]);
    check('D2: ved hjørnet, venstre vegg: areal 40·57', 2280, D2 && Math.round(compArea(D2.points)) === 2280 && D2.points.every(p => p.x >= 0 && p.x <= 40), D2 && compArea(D2.points));`,
`    // D: nær hjørnet — klikk 1 på øvre vegg 20 cm fra (0,0) → lukkes langs øvre vegg (20..80), ikke rundt rommet
    const D = run([[20, -2], [20, 40], [80, 40], [80, -2]]);
    check('D: nær hjørnet lukkes langs øvre vegg: 20..80 × 0..40', '20,0 20,40 80,0 80,40 · 2400', D && sig(D) === '20,0 20,40 80,0 80,40' && Math.round(compArea(D.points)) === 2400, D && (sig(D) + ' · ' + compArea(D.points)));
    // D2: klikk 1 på venstre vegg 20 cm fra hjørnet → lukkes langs venstre vegg
    const D2 = run([[-2, 20], [40, 20], [40, 80], [-2, 80]]);
    check('D2: nær hjørnet, venstre vegg: 0..40 × 20..80', '0,20 0,80 40,20 40,80 · 2400', D2 && sig(D2) === '0,20 0,80 40,20 40,80' && Math.round(compArea(D2.points)) === 2400, D2 && (sig(D2) + ' · ' + compArea(D2.points)));
    // D3: pipe i selve hjørnet — klikk 1 på øvre vegg, klikk 3 lander på venstre vegg → to vegger, lukkes via hjørnet (som før)
    start(); click(60, -2); click(60, 40); click(-2, 40);
    const hw3 = S.drawing.hindringW2W, small3 = hw3.pendingSplit ? [hw3.pendingSplit.polyA, hw3.pendingSplit.polyB].sort((a, b) => compArea(a) - compArea(b))[0] : null;
    check('D3: i hjørnet (to vegger) er den lille halvdelen 60 × 40 via hjørnet (0,0)', '0,0 0,40 60,0 60,40', small3 && sig({ points: small3 }) === '0,0 0,40 60,0 60,40', small3 && sig({ points: small3 }));
    click(30, 20); const D3 = S.hindrings[S.hindrings.length - 1];
    check('D3: klikk i den lille halvdelen gir hindringen, areal 2400', 2400, D3 && D3 !== D2 && Math.round(compArea(D3.points)) === 2400 && S.ui.drawMode === null, D3 && compArea(D3.points));`);
fs.writeFileSync('index.html', s); console.log('patch2 ok');
