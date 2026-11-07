// 202: PDF med to (tre) trapper, bygd med låst dato/ID — sammenlignes byte for byte mot HEAD.
//   URL0=… TAG=head|etter node /tmp/cdp202/pdf.mjs
import { openPage } from './cdp196.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const tag = process.env.TAG || 'etter';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const ut = await p.eval(`(async () => {
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {};
  window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
  try { await _loadProducts(); } catch (e) {}
  S.project = { name: 'Trapp 202', customer: 'Test', projectNo: 202, revision: 0, lastExportedAt: null, createdAt: 0 };
  S.rooms = []; S.strips = []; S.cables = []; S.mats = []; S.stairs = [];
  const T = (n, h) => ({ type: 'steps', stepCount: n, stepDepth_cm: 30, stepHeight_cm: h || 17, width_cm: 100 });
  const L = d => ({ type: 'landing', depth_cm: d || 120, width_cm: 100 });
  const mk = (id, navn, segs, x) => { S.counters.nextStairId = id; const st = _createStairObj({ name: navn, width_cm: 100, step_depth_cm: 30, step_height_cm: 17,
    buildDirection: 'bottom', edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, x_cm: x, y_cm: 0, segments: segs }); S.stairs.push(st); return st; };
  mk(9201, 'Med repos 4 + R120 + 6', [T(4), L(120), T(6)], 0);
  mk(9202, 'Uten repos 8 trinn', [T(8)], 400);
  mk(9203, 'Repos 1 + R150 + 1 (2 bånd i dag)', [T(1), L(150), T(1)], 800);
  const sideAntall = S.stairs.map(s => s.name + ': ' + _renderStairSidePrintImages(s).length + ' bånd');
  const Ekte = window.__ekteJsPDF || (window.__ekteJsPDF = window.jspdf.jsPDF); let ut = null;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); d.setCreationDate(new Date(2026, 10, 7, 12, 0, 0)); d.setFileId('0123456789ABCDEF0123456789ABCDEF');
    d.save = function (n) { ut = { navn: n, sider: d.internal.getNumberOfPages(), b64: d.output('datauristring').split(',')[1] }; return d; }; return d; };
  const opts = { cover: false, summary: false, floorplan: false, rooms: [], stairs: S.stairs.map(s => s.id), roomTable: false, stairTable: false, materialList: false,
    resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' };
  try { await exportPDF(opts); } finally { window.jspdf.jsPDF = Ekte; }
  return ut && Object.assign(ut, { sideAntall });
})()`);
if (!ut) { console.log('ingen PDF'); process.exit(1); }
const buf = Buffer.from(ut.b64, 'base64');
fs.writeFileSync(`/tmp/cdp202/${tag}.pdf`, buf);
console.log(JSON.stringify({ tag, sider: ut.sider, bytes: buf.length, sha: crypto.createHash('sha256').update(buf).digest('hex'), sideAntall: ut.sideAntall }, null, 1));
await p.close(); process.exit(0);
