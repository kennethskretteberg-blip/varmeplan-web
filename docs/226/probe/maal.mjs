// 226: måler skrifthøyden på papiret i PDF-rombildet for ett veggmål, én kjedetekst (folie/kabel) og
// ett hindringsmål. Rendrer rommet som exportPDF gjør (_renderRoomToImage med sidens plasserte bredde),
// fanger fillText med «hvilken tegnefunksjon tegner nå», og teller mørke pikselrader rundt teksten.
//   node -e ' process.env.SKALA="1.5"; import("./docs/226/probe/maal.mjs") '
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const skala = process.env.SKALA ? Number(process.env.SKALA) : null;
const p = await openPage(url, 9333, 1);
await p.eval(`(() => { ${FIX} ${skala ? `_currentProfile = { prefs: { pdfLabelScale: ${skala} } };` : '_currentProfile = null;'} return 1; })()`);
const ut = await p.eval(`(() => {
  const out = { skala: ${skala || 1}, rom: {} };
  // Merk hvilken tegnefunksjon som tegner (for å skille vegg / kjede / hindring / bruker)
  let tag = null;
  const wrap = (navn, t) => { const o = window[navn]; if (typeof o !== 'function') return; window[navn] = function (...a) { const prev = tag; tag = t; try { return o.apply(this, a); } finally { tag = prev; } }; };
  wrap('_drawDimAnnotationsForRoom', 'vegg'); wrap('_drawDimChainLayout', 'kjede'); wrap('_drawHindDim', 'hind'); wrap('drawUserDimLines', 'bruker'); wrap('_drawCableSkewDimChain', 'kjede');
  const texts = []; const oT = ctx.fillText;
  ctx.fillText = function (s, x, y, ...r) {
    if (S.ui._pdfMode && !tag && /^V\\d+ \\d+ cm$/.test(String(s))) { const m = ctx.getTransform(); const fpx = parseFloat(ctx.font) || 0;   // veggetikett (drawRooms)
      texts.push({ tag: 'vegg', s, x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, fpx, rot: Math.abs(m.b) > 0.5, col: ctx.fillStyle }); }
    if (S.ui._pdfMode && tag) { const m = ctx.getTransform(); const fpx = parseFloat(ctx.font) || 0;
      texts.push({ tag, s, x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, fpx, rot: Math.abs(m.b) > 0.5, col: ctx.fillStyle }); }
    return oT.call(this, s, x, y, ...r);
  };
  try {
    for (const rid of [31, 32, 33, 34]) {
      const room = S.rooms.find(r => r.id === rid);
      const lay = _pdfRoomImgLayout(room);
      texts.length = 0;
      const cv = document.createElement('canvas');
      const res = _renderRoomToImage(room, { focusRoom: true, targetWidthMm: lay.imgW2, noUrl: true, toCanvas: cv });
      const mmPerPx = lay.imgW2 / res.w;
      const g = cv.getContext('2d');
      // Høyden på glyfene: rader med målfargen (mørk grå #374151 — ikke oransje kabel/folie) i et vindu
      // rundt tekstsenteret (± 0,6 × skriften, så kjedelinja 0,9 × skriften unna ikke telles)
      const maal = (t) => {
        const w = Math.max(6, Math.round(t.fpx * 1.2)), h = Math.round(t.fpx * 1.2);
        const x0 = Math.round(t.x - (t.rot ? h / 2 : w / 2)), y0 = Math.round(t.y - (t.rot ? w / 2 : h / 2));
        const W = t.rot ? h : w, H = t.rot ? w : h;
        const d = g.getImageData(x0, y0, W, H).data;
        let lo = Infinity, hi = -Infinity;
        for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { const i = (yy * W + xx) * 4; if (d[i] < 130 && d[i + 1] < 140 && d[i + 2] < 160 && Math.abs(d[i] - d[i + 1]) < 40) { const v = t.rot ? xx : yy; if (v < lo) lo = v; if (v > hi) hi = v; } }
        const px = hi >= lo ? hi - lo + 1 : 0;
        return { s: t.s, fontPx: +t.fpx.toFixed(2), fontMm: +(t.fpx * mmPerPx).toFixed(2), glyphPx: px, glyphMm: +(px * mmPerPx).toFixed(2), col: t.col };
      };
      // Bare tekster som faktisk står i bildet (andre roms mål tegnes utenfor lerretet — der er pikslene tomme)
      const inne = t => t.x > t.fpx * 2 && t.x < res.w - t.fpx * 2 && t.y > t.fpx * 2 && t.y < res.h - t.fpx * 2;
      const first = (tg, filt) => { const t = texts.find(x => x.tag === tg && inne(x) && (!filt || filt(x))); return t ? maal(t) : null; };
      out.rom[rid] = { navn: room.name, outW: res.w, imgW2: lay.imgW2, mmPerCm: +(lay.imgW2 / res.view.worldW).toFixed(4),
        antall: texts.reduce((a, t) => (a[t.tag] = (a[t.tag] || 0) + 1, a), {}),
        vegg: first('vegg', t => !t.rot), kjede: first('kjede', t => !t.rot && /^\\d{2,} cm$/.test(t.s)), hind: first('hind', t => !t.rot), bruker: first('bruker'),
        pxPerMm: +(1 / mmPerPx).toFixed(2) };
    }
  } finally { ctx.fillText = oT; }
  return out;
})()`);
console.log(JSON.stringify(ut, null, 1));
fs.writeFileSync(`docs/226/probe/maal${skala ? '-' + skala : ''}.json`, JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
