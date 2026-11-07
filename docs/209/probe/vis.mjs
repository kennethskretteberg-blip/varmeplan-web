// 209: bilder av takvindu, hindringer, «Finn like» og startpunkt. IceFix-bygget (25 × 10 m, gesims 10),
// renne på k1 med nedløp 2 / 12,5 / 23 m, og et andre strekk på k3 med ett nedløp (to kurser, to farger).
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const les = `(() => ({ rader: [...document.querySelectorAll('.tak-cable-row')].map(r => r.dataset.id + ' ' + r.children[3].textContent).join(' · '),
  sum: (document.querySelector('.tak-cable-sum-total') || {}).textContent, orden: (document.querySelector('.tak-cable-order') || {}).innerText,
  like: (document.querySelector('.tak-obj-mode') || document.querySelector('.tak-like-msg') || {}).innerText }))()`;
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '209 · IceFix-bygget'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[2500,0],[2500,1000],[0,1000]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10');
  const g = _takAddGutter(fid, 'k1'); [2, 12.5, 23].forEach(a => _takAddDownspout(fid, g.id, a));
  _takAddGutter(fid, 'k3'); _takAddDownspout(fid, 'r2', 6);
  _takAddObject(fid, 'SKYLIGHT', { x: 600, y: 300 });
  _takAddObject(fid, 'OBSTACLE', { x: 1800, y: 450 });
  const h = _takAddObject(fid, 'OBSTACLE', { x: 700, y: 0 }, { gutter: 'r1', at_m: 7 });
  _takSetObj(fid, h.id, 'bypass', true); _takSetObj(fid, h.id, 'extra', '0,6');
  _takFeatSel = null; fitAll(); S.view.zoom *= 0.85; renderSidebar(); render(); })()`);
const box = async (sel, file) => { const b = await p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'start' }); const b = e.getBoundingClientRect(); return { x: Math.max(0, b.left - 12), y: Math.max(0, b.top - 4), width: b.width + 24, height: Math.min(900 - b.top, b.height + 8), scale: 2 }; })()`); await sov(200); await p.shot(file, b); };
const ut = {};
ut.uten_start = await p.eval(les);
await p.eval(`_takSetStart(__fid, { type: 'DOWNSPOUT', id: 'n3' }); _takFeatSel = null; renderSidebar(); render();`); await sov(200);
ut.start_n3 = await p.eval(les);
await p.shot('docs/209/tegning-start-n3.png');
await box('.tak-obj-card', 'docs/209/panel-objekter.png');
await box('.tak-cable-sum', 'docs/209/kabelmeter-start-n3.png');
await p.eval(`_takSetStart(__fid, { type: 'GUTTER', id: 'r1', at_m: 5 }); renderSidebar(); render();`); await sov(200);
ut.start_r1_5 = await p.eval(les);
await p.eval(`_takFindLike(__fid, 'v1');`); await sov(200);
ut.finn_like = await p.eval(les);
await p.shot('docs/209/finn-like.png');
await p.eval(`_takFeatStop(); _takDeleteFeature(__fid, 'v1'); const o = _takAddObject(__fid, 'SKYLIGHT', { x: 1250, y: 500 }); _takFindLike(__fid, o.id);`); await sov(200);
ut.ingen_like = await p.eval(les);
await box('.tak-obj-card', 'docs/209/fant-ingen-like.png');
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
