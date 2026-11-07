// 200: logger alle doc.text / doc.addImage (med hash av bildedata) fra exportPDF på fixturet, for HEAD og etter.
// Bruk: MARK=label node docs/200/probe/sig.mjs → skriver sig-<mark>-head.json / sig-<mark>-etter.json og en diff.
import { openPage } from './cdp.mjs';
import { FIX, OPTS } from './fixture.mjs';
import fs from 'node:fs';
const mark = process.env.MARK || 'label';
const kjør = async url => {
  const p = await openPage(url);
  await p.eval(`(() => { ${FIX} return 1; })()`);
  const r = await p.eval(`(async () => {
    const Ekte = window.jspdf.jsPDF, logg = [];
    const h = s => { let x = 0; for (let i = 0; i < s.length; i += 7) x = (x * 31 + s.charCodeAt(i)) | 0; return s.length + ':' + x; };
    window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a), oT = d.text.bind(d), oI = d.addImage.bind(d);
      const side = () => d.internal.getCurrentPageInfo().pageNumber;
      d.text = function (t, x, y, o) { for (const s of [].concat(t)) logg.push(side() + ' T ' + x.toFixed(2) + ',' + y.toFixed(2) + ' ' + s); return oT(t, x, y, o); };
      d.addImage = function (u, f, x, y, w, hh, ...rr) { logg.push(side() + ' I ' + [x, y, w, hh].map(v => (+v).toFixed(2)).join(',') + ' ' + h(String(u))); return oI(u, f, x, y, w, hh, ...rr); };
      d.save = () => d; return d; };
    S.project.revision = 0; S.project.lastExportedAt = null;
    try { await exportPDF(Object.assign(${OPTS}, { marking: '${mark}' })); } finally { window.jspdf.jsPDF = Ekte; }
    return logg; })()`);
  await p.close(); return r;
};
const a = await kjør('http://localhost:4000/docs/200/probe/head/index.html'), b = await kjør('http://localhost:4000/');
fs.writeFileSync(new URL(`./sig-${mark}-head.json`, import.meta.url), JSON.stringify(a, null, 0));
fs.writeFileSync(new URL(`./sig-${mark}-etter.json`, import.meta.url), JSON.stringify(b, null, 0));
console.log('kall: HEAD', a.length, 'etter', b.length);
const n = Math.max(a.length, b.length); let ulike = 0;
for (let i = 0; i < n; i++) if (a[i] !== b[i]) { ulike++; if (ulike <= (+process.env.VIS || 40)) console.log('  -', a[i], '\n  +', b[i]); }
console.log('ulike linjer:', ulike);
process.exit(0);
