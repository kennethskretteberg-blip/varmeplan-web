// 240: ytterpunktet — 300 × 300 med 13 baner B=20 og 2 cm mellomrom (27 ledd, nesten alle for korte). Normal og Ekstra stor.
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
import { ROM, OVERLAPP } from './felles.mjs';
const tag = process.env.TAG || 'etter';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/', 9333, 1);
const ut = await p.eval(`(async () => {
  try { await _loadProducts(); } catch (e) {}
  S.varmefolie.gapCm = 2; ${FIX} _currentProfile = null;
  ${ROM} ${OVERLAPP}
  const F = mk(52, 'Smale baner', rect(7000, 0, 300, 300)); F.dimSnap = true; S.rooms.push(F);
  for (let i = 0; i < 13; i++) S.strips.push({ id: 9500 + i, roomId: 52, productId: FB[20].id, direction: 'v', pos_cm: 7003 + i * 21, start_cm: 2.5, length_cm: 294 });
  _invalidateStripCache();
  const kjor = (navn, skala) => {
    _currentProfile = skala ? { prefs: { pdfLabelScale: skala } } : null;
    const lay = _pdfRoomImgLayout(F), cv = document.createElement('canvas');
    const r = _renderRoomToImage(F, { focusRoom: true, targetWidthMm: lay.imgW2, toCanvas: cv, noUrl: true });
    const tx = r.texts || [];
    return { navn, W: cv.width, H: cv.height, dimFit: r.dimFit || null, antallMaal: tx.filter(t => t.dim).length, overlapp: overlapp(tx, cv.width, cv.height), hel: cv.toDataURL('image/png').split(',')[1] };
  };
  return [kjor('normal', 0), kjor('xstor', 1.5)];
})()`);
for (const r of ut) { fs.writeFileSync(`docs/240/${tag}-smale-${r.navn}.png`, Buffer.from(r.hel, 'base64')); delete r.hel; console.log(JSON.stringify(r)); }
await p.close(); process.exit(0);
