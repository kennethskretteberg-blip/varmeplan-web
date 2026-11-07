// 208: bilder av sammenligningen, tilbehøret og tegningen. IceFix-bygget (25 × 10 m, gesims 10), nedløp 2 / 12,5 / 23 m.
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const acc = `(() => ({ tilbehor: [...document.querySelectorAll('.tak-acc-row')].map(tr => [...tr.children].map(td => td.textContent.trim()).join(' | ')),
  hvor: (document.querySelector('.tak-acc-where') || {}).innerText, meldinger: [...document.querySelectorAll('.tak-acc-problem')].map(e => e.innerText),
  knapper: [...document.querySelectorAll('.tak-preset')].map(b => b.innerText.replace(/\\n/g, ': ')), sum: (document.querySelector('.tak-cable-sum-total') || {}).textContent }))()`;
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '208 · IceFix-bygget'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[2500,0],[2500,1000],[0,1000]].map(([x, y]) => ({ x, y }))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10');
  const g = _takAddGutter(fid, 'k1');
  _takAddDownspout(fid, g.id, 2); _takAddDownspout(fid, g.id, 12.5); _takAddDownspout(fid, g.id, 23);
  _takFeatSel = null; fitAll(); S.view.zoom *= 0.85; renderSidebar(); render(); })()`);
const box = async (sel, file) => { const b = await p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'start' }); const b = e.getBoundingClientRect(); return { x: Math.max(0, b.left - 12), y: Math.max(0, b.top - 4), width: b.width + 24, height: Math.min(900 - b.top, b.height + 8), scale: 2 }; })()`); await sov(200); await p.shot(file, b); };
const ut = {};
ut.start = await p.eval(acc);
await box('.tak-presets', 'docs/208/sammenligning.png');
await p.clickSel('.tak-preset-boks'); await sov(200);
ut.boks = await p.eval(acc);
await p.shot('docs/208/boks-ved-hvert-nedlop.png');
await box('.tak-acc', 'docs/208/tilbehor-boks.png');
await p.clickSel('.tak-preset-sammenhengende'); await sov(200);
ut.sammenhengende = await p.eval(acc);
await box('.tak-acc', 'docs/208/tilbehor-sammenhengende.png');
await p.eval(`_takSetRuns(__fid, 'n2', 1); _takSetRuns(__fid, 'n3', 1); renderSidebar(); render();`); await sov(200);
ut.uten_boks = await p.eval(acc);
await p.shot('docs/208/melding-uten-boks.png');
await p.eval(`_takApplyPreset(__fid, 'r1', 'sammenhengende'); ['r1.2','r1.3','n1','n3'].forEach(id => _takSetRuns(__fid, id, 1)); renderSidebar(); render();`); await sov(200);
ut.kenneth = await p.eval(acc);
await box('.tak-acc', 'docs/208/tilbehor-kenneths-rute.png');
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
