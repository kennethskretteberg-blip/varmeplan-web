// 219: åpner «Sett inn hindring»-menyen ved 1366×650 og tar skjermbilde + måler knappene.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4000/docs/219-hindring/probe/head-index.html"; import("./docs/219-hindring/probe/meny.mjs") '
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const TAG = process.env.TAG || 'etter';
const p = await openPage(null);
await p.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 650, deviceScaleFactor: 1, mobile: false });
await p.goto(url);
const m = await p.eval(`(() => {
  window._scheduleAutoSave = () => {}; window._showToast = () => {}; window._performAutoSave = () => Promise.resolve();
  for (const id of ['auth-screen', 'project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  document.getElementById('app').style.display = 'flex';
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const pts = rect(0, 0, 400, 300);
  S.project = { name: 'Hindring 219', parts: [{ id: 71, name: 'Innendørs', moduleType: 'indoor' }] };
  S.floors = [{ id: 1, name: '1. etasje', order: 1, partId: 71 }]; S.ui.activePartId = 71; S.ui.activeFloorId = 1;
  S.rooms = [{ id: 31, floorId: 1, partId: 71, name: 'Stue', points: pts, walls: compWalls(pts), area: 120000, dims: [], annotOffsets: {} }];
  S.hindrings = []; S.ui.selectedRoomId = 31;
  resizeCanvas(); setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render();
  showHindringModal(31, null);
  const boks = document.getElementById('modal-hindring'); const bb = boks.getBoundingClientRect();
  const alle = [...boks.querySelectorAll('button, input, .shape-card')].filter(b => b.getClientRects().length).map(b => {
    const r = b.getBoundingClientRect(); const topp = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { hva: b.tagName.toLowerCase() + (b.id ? '#' + b.id : '') + (b.className ? '.' + String(b.className).split(' ')[0] : ''), tekst: (b.textContent || b.placeholder || '').trim().slice(0, 30), topp: Math.round(r.top), bunn: Math.round(r.bottom), bredde: Math.round(r.width), inne: r.bottom <= innerHeight && r.top >= 0, klikkbar: !!topp && (topp === b || b.contains(topp)) }; });
  return { W: innerWidth, H: innerHeight, boks: { topp: Math.round(bb.top), bunn: Math.round(bb.bottom), hoyde: Math.round(bb.height), bredde: Math.round(bb.width) }, tittel: boks.querySelector('.modal-title')?.textContent, kort: [...boks.querySelectorAll('.shape-card')].map(c => c.textContent.trim()), elementer: alle }; })()`);
await sov(300);
await p.shot(`docs/219-hindring/${TAG}-meny-1366x650.png`);
fs.writeFileSync(`docs/219-hindring/probe/${TAG}-meny.json`, JSON.stringify(m, null, 1));
console.log(JSON.stringify(m, null, 1));
await p.close(); process.exit(0);
