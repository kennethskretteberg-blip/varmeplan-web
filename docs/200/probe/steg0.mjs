// 200 · STEG 0: Spesifikasjon (_roomProductRows, slik exportPDF formaterer) mot forklaringen (_pdfLegendRows)
import { openPage } from './cdp.mjs';
import { FIX } from './fixture.mjs';
import fs from 'node:fs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(() => { ${FIX}
  return ['Nedkjøring','Lager','Stue','Bad','Gang','Kontor','Sal'].map(navn => { const room = S.rooms.find(x => x.name === navn);
    const spec = _roomProductRows(room).map(r => ({ type: r.kind, navn: (r.product && r.product.name) || r.kind, antall: r.count + ' stk',
      lengde: r.lengthM != null ? r.lengthM.toFixed(1) + ' m' : '—', effekt: (r.kind === 'Reservekabel' && !r.effectW) ? '—' : r.effectW + ' W' }));
    const leg = _pdfLegendRows(room).map(r => ({ n: r.n, navn: r.name, maal: r.dim, effekt: r.effect }));
    const lay = _pdfNumberLayout(room), lL = _pdfRoomImgLayout(room);
    return { rom: navn, spec, leg, place: lay.place, imgL: [lL.imgW2, lL.imgH].map(v => +v.toFixed(1)), imgN: [lay.imgW2, lay.imgH].map(v => +v.toFixed(1)), availH: +lL.availH.toFixed(1), specRowCount: lL.budget.specRowCount, cc: lL.budget.roomCablesCC };
  }); })()`);
fs.writeFileSync(new URL('./steg0.json', import.meta.url), JSON.stringify(r, null, 1));
for (const x of r) { console.log('##', x.rom, x.place, 'L', x.imgL, 'N', x.imgN, 'availH', x.availH, 'specRowCount', x.specRowCount, 'cc', x.cc);
  for (const s of x.spec) console.log('  SPEC', s.type, '|', s.navn, '|', s.antall, '|', s.lengde, '|', s.effekt);
  for (const l of x.leg) console.log('  LEG ', l.n, '|', l.navn, '|', l.maal, '|', l.effekt); }
await p.close(); process.exit(0);
