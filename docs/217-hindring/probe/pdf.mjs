// 217: ekte PDF-eksport av fixturet (rom 31 og 33), lagres som <TAG>.pdf
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
import { FIX } from './fixture.mjs';
import { BYGG } from '../../200/probe/fixture.mjs';
const tag = process.env.TAG || 'etter';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
await p.eval(`(() => { ${FIX} window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null); return 1; })()`);
const opts = `({ cover: false, summary: false, floorplan: false, rooms: [31, 32, 33, 34], stairs: [], roomTable: false, stairTable: false, materialList: false, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' })`;
const ut = await p.eval(BYGG(opts));
fs.writeFileSync(`docs/217-hindring/probe/${tag}.pdf`, Buffer.from(ut.b64, 'base64'));
console.log(tag, 'sider', ut.sider, 'bytes', ut.b64.length);
await p.close(); process.exit(0);
