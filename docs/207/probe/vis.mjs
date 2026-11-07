// 207: bilder + panel-tabellene. IceFix-bygget (25 × 10 m, gesims 10), nedløp på 2 / 12,5 / 23 m.
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const tab = `(() => [...document.querySelectorAll('.tak-cable-table tr')].map(tr => [...tr.children].map(td => td.textContent.trim()).join(' | ')))()`;
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '207 · IceFix-bygget'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[2500,0],[2500,1000],[0,1000]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10');
  const g = _takAddGutter(fid, 'k1');
  _takAddDownspout(fid, g.id, 2); _takAddDownspout(fid, g.id, 12.5); _takAddDownspout(fid, g.id, 23);
  _takFeatSel = null; fitAll(); S.view.zoom *= 0.85; renderSidebar(); render(); })()`);
const ut = {};
ut.metode2 = await p.eval(tab);
await p.eval(`['n1','n2','n3'].forEach(id => _takSetRuns(__fid, id, 1))`);
ut.metode1 = await p.eval(tab);
await p.eval(`_takSetGutterRuns(__fid, 'r1', 1)`);
ut.en_en = await p.eval(tab);
await p.eval(`_takSetGutterRuns(__fid, 'r1', 2); _takSetRuns(__fid, 'r1.2', 1); _takSetRuns(__fid, 'r1.3', 1); _takSetRuns(__fid, 'n2', 2); renderSidebar(); render();`);
ut.kenneth = await p.eval(tab);
await sov(300);
await p.shot('docs/207/kenneths-rute.png');
const box = async (sel, file) => { const b = await p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'start' }); const b = e.getBoundingClientRect(); return { x: Math.max(0, b.left - 12), y: Math.max(0, b.top - 4), width: b.width + 24, height: Math.min(900 - b.top, b.height + 8), scale: 2 }; })()`); await sov(200); await p.shot(file, b); };
await box('.tak-gutter[data-id="r1"]', 'docs/207/kenneths-rute-strekk.png');
await box('.tak-cable-sum', 'docs/207/kenneths-rute-kabelmeter.png');
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
