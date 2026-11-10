// 226: «Skjermen skal se ut akkurat som før» — lerretshash av skjermtegningen for 217-fixturet med
// alle måltyper på (veggmål, foliekjede, kabelkjede, hindringsmål, et brukermål), HEAD-kopi mot arbeidskopi.
//   node -e ' process.env.URL0="http://localhost:4013/docs/226/probe/head/index.html"; import("./docs/226/probe/skjerm.mjs") '
import { openPage } from './cdp.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const p = await openPage(url, 9333, 1);
const r = await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX}
  for (const rm of S.rooms) { rm.dimSnap = true; rm.stripDimSnap = true; rm.cableDimSnap = true; }
  S.rooms[1].dims.push({ id: 8001, p1: { x: 650, y: 290 }, p2: { x: 950, y: 290 }, wnx: 0, wny: 1, offset: -60 });
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  const out = {};
  for (const [rid, zoom] of [[31, 1.3], [32, 1.3], [33, 0.8], [34, 1.0]]) {
    const rm = S.rooms.find(x => x.id === rid); const xs = rm.points.map(q => q.x), ys = rm.points.map(q => q.y);
    S.ui.selectedRoomId = rid; S.ui.selectedDimId = null; S.view.zoom = zoom; S.view.panX = (Math.min(...xs) + Math.max(...xs)) / 2; S.view.panY = (Math.min(...ys) + Math.max(...ys)) / 2;
    render(); out[rid] = hash(canvas.toDataURL('image/png'));
  }
  // Og selve PDF-rommet uten PDF-modus-skala (kallvei uten _pdfScaleMmPerCm → som før)
  S.ui._pdfMode = true; S.ui._pdfScaleMmPerCm = undefined; S.ui.selectedRoomId = 32; render(); out.pdfUtenSkala = hash(canvas.toDataURL('image/png')); S.ui._pdfMode = false;
  return out; })()`);
console.log(JSON.stringify(r));
await p.close(); process.exit(0);
