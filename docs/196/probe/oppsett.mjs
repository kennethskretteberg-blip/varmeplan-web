// 196: romsidens oppsett i Label- og Nummer-modus for fixturet. Bruk: node -e ' import("./docs/196/probe/oppsett.mjs") '
import { openPage } from './cdp.mjs';
import { FIX } from './fixture.mjs';
const p = await openPage('http://localhost:4000/');
const r = await p.eval(`(() => { ${FIX}
  return S.rooms.map(r => { const a = _pdfRoomImgLayout(r), b = _pdfNumberLayout(r);
    const img = _renderRoomToImage(r, { focusRoom: true, targetWidthMm: b.imgW2, noUrl: true, numberMode: true });
    const ns = img.numbers || []; let min = Infinity;
    for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) min = Math.min(min, (Math.hypot(ns[i].x - ns[j].x, ns[i].y - ns[j].y) - ns[i].r - ns[j].r) / ns[i].pxPerMm);
    return { rom: r.name, rader: b.rows.length, plass: b.place, label: a.imgW2.toFixed(1) + ' x ' + a.imgH.toFixed(1), nummer: b.imgW2.toFixed(1) + ' x ' + b.imgH.toFixed(1),
      tabell: b.table ? 'x ' + b.table.x.toFixed(1) + ', b ' + b.table.w.toFixed(1) + ', h ' + b.table.m.h.toFixed(1) : '-',
      sirkler: ns.length, diaMm: ns.length ? +(2 * ns[0].r / ns[0].pxPerMm).toFixed(2) : null, tallPt: ns.length ? +(ns[0].fontPx / ns[0].pxPerMm / (25.4 / 72)).toFixed(1) : null,
      minsteLuftMm: ns.length > 1 ? +min.toFixed(2) : null, overlapp: ns.filter(n => n.overlap).length }; }); })()`);
for (const x of r) console.log(JSON.stringify(x));
await p.close(); process.exit(0);
