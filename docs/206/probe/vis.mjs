// 206: bilder — IceFix-bygget (25 × 10 m, gesims 10 m), rennestrekk på k1 med nedløp på 2 / 12,5 / 23 m.
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '206 · IceFix-bygget'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid;
  S.tak = { [fid]: _takManual([[0,0],[2500,0],[2500,1000],[0,1000]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10');
  const g = _takAddGutter(fid, 'k1');
  _takAddDownspout(fid, g.id, 2); _takAddDownspout(fid, g.id, 12.5); _takAddDownspout(fid, g.id, 23);
  _takSetDownspout(fid, 'n3', 'under', true);
  _takFeatSel = { fid, id: 'n3' };
  fitAll(); S.view.zoom *= 0.85; renderSidebar(); render();
  const c = document.querySelector('.tak-feat-card'); c.scrollIntoView({ block: 'start' });
  const b = c.getBoundingClientRect();
  return { card: { x: Math.max(0, b.left - 12), y: Math.max(0, b.top - 4), width: b.width + 24, height: Math.min(900 - b.top, b.height + 8) },
           segs: g.segments.map(s => [s.id, s.from_m, s.to_m, s.length_m]), ds: _takFeats(S.tak[fid], 'DOWNSPOUT').map(d => [d.id, d.at_m, _takDownpipeLabel(d), d.cable_m]) };
})()`);
await sov(400);
await p.shot('docs/206/tre-nedlop.png');
await p.shot('docs/206/tre-nedlop-panel.png', r.card);
const n3 = await p.eval(`(() => { const e = document.querySelector(".tak-downspout[data-id=n3]"); e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); return { x: Math.max(0, b.left - 16), y: b.top - 6, width: b.width + 28, height: b.height + 12 }; })()`);
await sov(200); await p.shot("docs/206/nedlop-under-bakken-panel.png", n3);
console.log(JSON.stringify(r));
await p.close();
process.exit(0);
