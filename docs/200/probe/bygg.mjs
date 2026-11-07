// 200 (kopi fra 196): bygger PDF-en av fixturet og lagrer den. Bruk:
//   node -e ' process.env.TAG="for"; process.env.MARK="label"; import("./docs/200/probe/bygg.mjs") '
// TAG = filnavn-prefiks, MARK = label | number | (tom = feltet utelates, som før 196)
import { openPage } from './cdp.mjs';
import { FIX, OPTS, BYGG } from './fixture.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const tag = process.env.TAG || 'etter', mark = process.env.MARK || '';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
await p.eval(`(() => { ${FIX} return S.rooms.length; })()`);
const opts = mark ? `Object.assign(${OPTS}, { marking: '${mark}' })` : OPTS;
const steg0 = await p.eval(`S.rooms.map(r => { const l = _pdfRoomImgLayout(r); return { rom: r.name, cm: Math.round(Math.max(...r.points.map(q => q.x)) - Math.min(...r.points.map(q => q.x))) + ' x ' + Math.round(Math.max(...r.points.map(q => q.y)) - Math.min(...r.points.map(q => q.y))),
  aspekt: +l.aspect.toFixed(3), imgX: +l.imgX.toFixed(1), imgW: +l.imgW2.toFixed(1), imgH: +l.imgH.toFixed(1), ledigHoyre: +(210 - 15 - l.imgX - l.imgW2).toFixed(1), ledigHvisVenstrestilt: +(180 - l.imgW2).toFixed(1), px: _pdfRenderPx(l.imgW2), mmPerCm: +(l.imgW2 / ((Math.max(...r.points.map(q => q.x)) - Math.min(...r.points.map(q => q.x))) + 2 * _pdfRoomPadCm(r))).toFixed(4) }; })`);
const t0 = Date.now();
const ut = await p.eval(BYGG(opts));
const buf = Buffer.from(ut.b64, 'base64');
fs.writeFileSync(new URL(`./${tag}.pdf`, import.meta.url), buf);
const sha = crypto.createHash('sha256').update(buf).digest('hex');
const res = { tag, mark, sider: ut.sider, bytes: buf.length, sha, ms: Date.now() - t0, steg0 };
fs.writeFileSync(new URL(`./${tag}.json`, import.meta.url), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
await p.close(); process.exit(0);
