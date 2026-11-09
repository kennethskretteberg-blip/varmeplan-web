import { bytt, skriv } from './patch.mjs';
bytt(`      { id: 9303, type: 'annet', label: 'Skap', roomId: 9217, floorId: room.floorId, points: [{ x: 300, y: 50 }, { x: 390, y: 50 }, { x: 390, y: 100 }, { x: 345, y: 100 }, { x: 345, y: 150 }, { x: 300, y: 150 }], clearance: 'wall' },
    ];`,
`      { id: 9303, type: 'annet', label: 'Skap', roomId: 9217, floorId: room.floorId, points: [{ x: 300, y: 50 }, { x: 390, y: 50 }, { x: 390, y: 100 }, { x: 345, y: 100 }, { x: 345, y: 150 }, { x: 300, y: 150 }], clearance: 'wall' },
      { id: 9304, type: 'annet', label: 'Øy', roomId: 9217, floorId: room.floorId, points: rect(250, 180, 60, 80), clearance: 'wall' },
    ];`);
bytt(`    check('A: 4 + 4 + 6 = 14 mål, alle med hid', 14, dims.length === 14 && dims.every(d => d.hid != null && d.auto === 'hindring'), dims.length);`,
     `    check('A: 4 + 4 + 6 + 4 = 18 mål, alle med hid', 18, dims.length === 18 && dims.every(d => d.hid != null && d.auto === 'hindring'), dims.length);`);
bytt(`    check('C: ...60-sidene fortsatt 11 px', 11, k60.every(x => x.L.inside && x.L.fontPx === 11), k60.map(x => x.L.fontPx).join(','));`,
`    // 60-sidene: streken 10 cm inn = 12 px, navnet «Pipe» står 20 cm inn = 24 px ± 7 → teksten ville
    // lagt seg over navnet → utenfor, én av paret. I 60 × 80 (navnet 40 cm inn) står de inne i 11 px.
    check('C: ...60-sidene i 60 × 40 går utenfor (navnet i veien), én av paret vises', 'ute, 1 vist', k60.every(x => !x.L.inside) && k60.filter(x => x.L.draw).length === 1, k60.map(x => x.L.inside + '/' + x.L.draw).join(' '));
    const T = lay(9304);
    check('C: 60 × 80 ved zoom 0,8 — alle fire inne i 11 px', 'inne × 4, 11', T.every(x => x.L.inside && x.L.fontPx === 11 && insideWorld(x.L)), T.map(x => x.L.inside + '/' + x.L.fontPx).join(' '));`);
skriv();
