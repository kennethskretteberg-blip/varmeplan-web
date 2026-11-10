// 226: ekte PDF-eksport av 217-fixturet (folie, kabel, hindring; rom 31–34 + plantegning).
// Lagres som docs/226/probe/<TAG>.pdf. Miljø: TAG (foer|etter|…), URL0 (HEAD-kopi eller arbeidskopi),
// SKALA (pdfLabelScale, f.eks. 1.5), FORMAT (png|jpeg95 — bare arbeidskopien leser den).
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/226/probe/head/index.html"; import("./docs/226/probe/pdf.mjs") '
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
import { BYGG } from '../../200/probe/fixture.mjs';
const tag = process.env.TAG || 'etter';
const p = await openPage(process.env.URL0 || 'http://localhost:4013/', 9333, 1);
const skala = process.env.SKALA ? Number(process.env.SKALA) : null;
// Regresjonstestene i andre faner skriver prefs (folie-gap) til localStorage — lås gapet så før/etter får samme utlegg.
await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX} window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
  ${skala ? `_currentProfile = { prefs: { pdfLabelScale: ${skala} } };` : '_currentProfile = null;'}
  ${process.env.FORMAT === 'jpeg90' ? `window._pdfImgEncode = f => ({ url: f.toDataURL('image/jpeg', 0.9), fmt: 'JPEG' });` : ''}
  ${/^png-(none|fast|medium|slow)$/.test(process.env.FORMAT || '') ? `window._pdfImgEncode = f => ({ url: f.toDataURL('image/png'), fmt: 'PNG', comp: ${JSON.stringify(process.env.FORMAT.slice(4).toUpperCase())} });` : ''}
  ${process.env.FORMAT === 'jpeg95' ? `window._pdfImgEncode = f => ({ url: f.toDataURL('image/jpeg', 0.95), fmt: 'JPEG' });` : ''}
  ${process.env.FORMAT === 'jpeg95-400' ? `window._pdfImgEncode = f => ({ url: f.toDataURL('image/jpeg', 0.95), fmt: 'JPEG' });
    const oR = _renderRoomToImage, oF = _renderFloorToImage;
    window._renderRoomToImage = (r, o) => oR(r, { ...(o || {}), dpi: 400, maxWidth: 4000 });
    window._renderFloorToImage = (f, o) => oF(f, { ...(o || {}), dpi: 400, maxWidth: 4000 });` : ''}
  ${process.env.FORMAT === 'png-400' ? `const oR = _renderRoomToImage, oF = _renderFloorToImage;
    window._renderRoomToImage = (r, o) => oR(r, { ...(o || {}), dpi: 400, maxWidth: 4000 });
    window._renderFloorToImage = (f, o) => oF(f, { ...(o || {}), dpi: 400, maxWidth: 4000 });` : ''}
  return 1; })()`);
const opts = `({ cover: false, summary: false, floorplan: true, rooms: [31, 32, 33, 34], stairs: [], roomTable: false, stairTable: false, materialList: false, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' })`;
const t0 = Date.now();
const ut = await p.eval(BYGG(opts));
const ms = Date.now() - t0;
const buf = Buffer.from(ut.b64, 'base64');
fs.writeFileSync(`docs/226/probe/${tag}.pdf`, buf);
console.log(JSON.stringify({ tag, sider: ut.sider, bytes: buf.length, kB: Math.round(buf.length / 1024), ms }));
await p.close(); process.exit(0);
