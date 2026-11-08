// 214: rom, snø og trapp uendret. Ekte tastetrykk og museklikk (CDP) mot HEAD-kopi og arbeidskopi, samme skript.
//   URL0=http://localhost:4000/docs/221/probe/head/index.html node docs/221/probe/uendret.mjs head
//   node docs/221/probe/uendret.mjs etter
import fs from 'node:fs';
import crypto from 'node:crypto';
import { openPage, sov } from './cdp.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const ut = {};
const tastCodes = { Escape: 27 };
for (const mod of ['indoor', 'snow', 'stair']) {
  const p = await openPage(url);
  const rad = ut[mod] = {};
  await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); S.project.name = '220'; addPart(${JSON.stringify(mod)});
    document.getElementById('app').style.display = 'flex'; resizeCanvas();
    S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = (S.floors.find(f => f.partId === S.ui.activePartId) || {}).id ?? null;
    setInitialView(); renderSidebar(); updateCtxBar(); render(); document.activeElement && document.activeElement.blur(); })()`);
  await sov(250);
  const les = () => p.eval(`({ mode: S.ui.drawMode, hint: document.getElementById('sb-hint').textContent, bar: document.getElementById('ctxbar').innerText.replace(/\\s+/g,' ') })`);
  rad.start = await les();
  for (const k of ['r', 'm', 'p', 'l', 'w', 'd']) {
    await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, text: k, code: 'Key' + k.toUpperCase() }); await sov(160);
    rad['tast-' + k] = await les();
    await p.eval(`(() => { try { hideModal && hideModal(); } catch (e) {} try { closeModal(); } catch (e) {} if (S.ui.drawMode) cancelDrawing(); document.activeElement && document.activeElement.blur(); })()`);
    await sov(60);
  }
  // Rom/snø: tegn et rektangel med ekte klikk, og mål det med D.
  const r0 = await p.eval(`(() => { const r = canvas.getBoundingClientRect(); return { l: r.left + 300, t: r.top + 250 }; })()`);
  if (mod !== 'stair') {
    await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'r', text: 'r', code: 'KeyR' }); await sov(120);
    await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r0.l, y: r0.t }); await p.click(r0.l, r0.t); await sov(100);
    await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r0.l + 300, y: r0.t + 200 }); await p.click(r0.l + 300, r0.t + 200); await sov(200);
    await p.eval(`(() => { try { closeModal(); } catch (e) {} })()`);
    rad.etterRektangel = await les();
    rad.rom = await p.eval(`S.rooms.map(r => ({ n: r.points.length, area: Math.round(r.area || 0) }))`);
  }
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'd', text: 'd', code: 'KeyD' }); await sov(120);
  for (const [dx, dy] of [[60, 400], [260, 400], [160, 440]]) { await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r0.l + dx, y: r0.t + dy }); await sov(50); await p.click(r0.l + dx, r0.t + dy); await sov(100); }
  rad.etterMaal = await les();
  rad.flytende = await p.eval(`(S.floatingDims || []).map(d => Math.round(Math.hypot(d.p2.x - d.p1.x, d.p2.y - d.p1.y)))`);
  rad.romMaal = await p.eval(`S.rooms.map(r => (r.dims || []).length)`);
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await sov(120);
  rad.etterEsc = await les();
  const j = await p.eval(`(() => { const j = _buildSaveData(); delete j.savedAt; delete j._savedAt; return JSON.stringify(j).replace(/"(updatedAt|savedAt|createdAt|created_at|stampedAt)":("[^"]*"|\\d+),?/g, ''); })()`);
  fs.writeFileSync('/private/tmp/claude-501/-Users-kennethskretteberg-Code-varmeplan-web/d682bf80-5929-48b2-b7e6-40ba0988e34f/scratchpad/p221/j-' + process.argv[2] + '-' + mod + '.json', j); rad.lagringLengde = j.length; rad.lagringHash = crypto.createHash('sha1').update(j).digest('hex');
  await p.close();
}
fs.writeFileSync(`docs/221/probe/uendret-${process.argv[2]}.json`, JSON.stringify(ut, null, 1));
console.log('skrevet', process.argv[2]);
process.exit(0);
