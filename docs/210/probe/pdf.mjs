// 210: lag snitt-PDF-en (n2 under bakken) og skriv den til fil. node docs/210/probe/pdf.mjs ut.pdf
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const b64 = await p.eval(`(async () => {
  window._showToast = () => {}; window._scheduleAutoSave = () => {};
  _resetProjectState(); addPart('roof');
  const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
  S.project.name = 'IceFix-bygget';
  S.ui.activePartId = part.id; S.ui.activeFloorId = fid; S.ui.drawMode = null;
  S.tak = { [fid]: _takManual([{ x: 0, y: 0 }, { x: 2500, y: 0 }, { x: 2500, y: 1000 }, { x: 0, y: 1000 }]) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10'); _takSetHeight(fid, 'ridge_m', '12,887');
  _takAddGutter(fid, 'k1'); [2, 12.5, 23].forEach(a => _takAddDownspout(fid, 'r1', a));
  _takSetDownspout(fid, 'n2', 'under', true); fitAll(); render();
  const r = _takSectionPDF(fid, { type: 'DOWNSPOUT', id: 'n2' }, { noSave: true });
  return r.doc.output('datauristring').split(',')[1];
})()`);
fs.writeFileSync(process.argv[2] || '/tmp/snitt.pdf', Buffer.from(b64, 'base64'));
await p.close(); process.exit(0);
