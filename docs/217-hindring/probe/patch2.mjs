import { bytt, skriv } from './patch.mjs';
bytt(`const over = [P.sd1, P.sd2].map(p => ({ x: p.x + wnx * inw * OVERHANG * Math.sign(S.view.zoom), y: p.y + wny * inw * OVERHANG }));`,
     `const over = [P.sd1, P.sd2].map(p => ({ x: p.x + wnx * inw * OVERHANG, y: p.y + wny * inw * OVERHANG }));   // hjelpelinjas overheng, innover`);
bytt(`ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle2 = null;`, `ctx.textAlign = 'center'; ctx.textBaseline = 'middle';`);
skriv();
