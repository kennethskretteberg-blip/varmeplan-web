// 217: skjermbilder + PDF-rombilder for fixturet. Bruk:
//   node -e ' process.env.TAG="etter"; import("./docs/217-hindring/probe/kjor.mjs") '
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4000/docs/217-hindring/probe/head-index.html"; import("./docs/217-hindring/probe/kjor.mjs") '
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
import { FIX, VIS } from './fixture.mjs';
const tag = process.env.TAG || 'etter', url = process.env.URL0 || 'http://localhost:4000/';
const dir = 'docs/217-hindring';
const p = await openPage(url);
const oppsett = await p.eval(`(() => { ${FIX} return { rom: S.rooms.length, kabler: S.cables.map(c => ({ rom: c.roomId, cc: c.spacing_cm, runs: (c.runs || []).length, els: (c.pathEls || []).length })), striper: S.strips.length, dims: S.rooms.map(r => r.id + ':' + r.dims.length) }; })()`);
console.log(JSON.stringify(oppsett));
const navn = { 31: 'kabel-60x40', 32: 'folie-60x40', 33: 'liten-15x15', 34: 'polygon' };
const ut = { tag, oppsett, rom: {} };
for (const rid of [31, 32, 33, 34]) {
  const b = await p.eval(VIS(rid)); await sov(150);
  await p.shot(`${dir}/${tag}-${navn[rid]}.png`, { x: b.x, y: b.y, width: b.width, height: b.height });
  // Målene slik de er plassert (bare arbeidskopien har _hindDimLayout)
  ut.rom[rid] = await p.eval(`(() => { const r = S.rooms.find(x => x.id === ${rid}); if (typeof _hindDimLayout !== 'function') return { head: true, dims: r.dims.map(d => ({ id: d.id, offset: d.offset })) };
    return { zoom: +S.view.zoom.toFixed(3), dims: r.dims.map(d => { const L = _hindDimLayout(d); if (!L) return { id: d.id, L: null };
      // Uavhengig sjekk: tekstboks + T-ender + overheng innenfor hindringen?
      const h = L.h, sc = S.view.zoom * BASE_SCALE; const ux = Math.cos(L.ang), uy = Math.sin(L.ang), vx = -uy, vy = ux;
      const hw = L.tw / 2 + 3, hh = L.fontPx * 0.62 + 1.5; const cx = (L.sd1.x + L.sd2.x) / 2, cy = (L.sd1.y + L.sd2.y) / 2;
      const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([a, b]) => ({ x: cx + ux * a + vx * b, y: cy + uy * a + vy * b }));
      for (const e of [L.sd1, L.sd2]) { pts.push({ x: e.x + vx * 7, y: e.y + vy * 7 }, { x: e.x - vx * 7, y: e.y - vy * 7 }); }
      const inne = pts.every(s => { const w = s2w(s.x, s.y); return ptInPoly(w.x, w.y, h.points) || _hindDimOnEdge(w.x, w.y, h.points, 0.05); });
      return { id: d.id, hid: d.hid, offset: +d.offset.toFixed(2), len: Math.round(L.wLen), inside: L.inside, draw: L.draw, fontPx: +L.fontPx.toFixed(2), altInne: inne, partner: L.partnerId || null }; }) }; })()`);
  // PDF-rombildet (det som går inn i PDF-en), lagret som jpeg
  const img = await p.eval(`(() => { const r = S.rooms.find(x => x.id === ${rid}); const im = _renderRoomToImage(r, { focusRoom: true, targetWidthMm: 180 });
    const u = im && (im.dataURL || im.dataUrl || im.url); return { keys: Object.keys(im || {}), b64: u ? u.split(',')[1] : null, outW: im && im.view && im.view.outW, mmPerCm: S.ui._pdfScaleMmPerCm }; })()`);
  if (img.b64) fs.writeFileSync(`${dir}/${tag}-pdf-${navn[rid]}.jpg`, Buffer.from(img.b64, 'base64'));
  ut.rom[rid].pdf = { outW: img.outW, keys: img.keys };
  // Hindringsmålene i PDF-skala: plasseringen regnes inne i _renderRoomToImage; les den ut separat
  if (!ut.rom[rid].head) ut.rom[rid].pdfDims = await p.eval(`(() => { const r = S.rooms.find(x => x.id === ${rid}); const out = []; const saved = { z: S.view.zoom, px: S.view.panX, py: S.view.panY, cw: canvas.width, ch: canvas.height, pdf: S.ui._pdfMode, sc: S.ui._pdfScaleMmPerCm };
    _renderRoomToImage(r, { focusRoom: true, targetWidthMm: 180, noUrl: true, toCanvas: document.createElement('canvas') });
    // gjenta oppsettet som i _renderRoomToImage for å lese plasseringen ved PDF-skala
    const xs = r.points.map(p => p.x), ys = r.points.map(p => p.y); const rW = Math.max(...xs) - Math.min(...xs), rH = Math.max(...ys) - Math.min(...ys); const pad = _pdfRoomPadCm(r);
    const worldW = rW + 2 * pad, outW = Math.round(180 / 25.4 * 300); canvas.width = outW; canvas.height = Math.round(outW * (rH + 2 * pad) / worldW);
    S.view.zoom = (outW / worldW) / BASE_SCALE; S.view.panX = (Math.max(...xs) + Math.min(...xs)) / 2; S.view.panY = (Math.max(...ys) + Math.min(...ys)) / 2; S.ui._pdfMode = true; S.ui._pdfScaleMmPerCm = 180 / worldW;
    const pxPerMm = S.view.zoom * BASE_SCALE / S.ui._pdfScaleMmPerCm;
    for (const d of r.dims) { const L = _hindDimLayout(d); out.push(L ? { id: d.id, inside: L.inside, draw: L.draw, mm: +(L.fontPx / pxPerMm).toFixed(2) } : { id: d.id, L: null }); }
    S.view.zoom = saved.z; S.view.panX = saved.px; S.view.panY = saved.py; canvas.width = saved.cw; canvas.height = saved.ch; S.ui._pdfMode = saved.pdf; S.ui._pdfScaleMmPerCm = saved.sc; render(); return out; })()`);
}
fs.writeFileSync(`${dir}/probe/${tag}.json`, JSON.stringify(ut, null, 1));
console.log(JSON.stringify(ut.rom, null, 0).slice(0, 3000));
await p.close(); process.exit(0);
