// 215: bilder av snøfanger med og uten varmet felt. Ekte klikk på knappene og i lerretet.
import { openPage, sov } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  _resetProjectState(); S.project.name = '215 · Snøfanger'; addPart('roof');
  document.getElementById('app').style.display = 'flex'; resizeCanvas();
  const fid = S.floors[0].id; S.ui.activePartId = S.project.parts[0].id; S.ui.activeFloorId = fid; window.__fid = fid;
  S.tak = { [fid]: _takManual([[0,0],[1200,0],[1200,800],[0,800]].map(([x,y]) => ({x,y}))) };
  _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '4,5');
  fitAll(); _takStepGo(fid, 3); renderSidebar(); updateCtxBar(); render(); document.activeElement && document.activeElement.blur(); })()`);
await sov(500);
const lerret = `(() => { const t = S.tak[__fid], e = t.edges.find(x => x.type === 'eave'), r = canvas.getBoundingClientRect(), k = r.width / canvas.width, f = (x, y) => { const s = w2s(x, y); return { x: r.left + s.x * k, y: r.top + s.y * k }; }; return { mid: f((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2), id: e.id }; })()`;
const bar = () => p.eval(`({ h: Math.round(document.getElementById('ctxbar').getBoundingClientRect().height), tekst: document.getElementById('ctxbar').innerText.replace(/\\s+/g, ' '), bilder: _listCableProducts('snow').length })`);
const klikkKant = async () => { const q = await p.eval(lerret); await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: q.mid.x, y: q.mid.y }); await sov(120); await p.click(q.mid.x, q.mid.y); await sov(450); };
const ut = {};
ut.steg3 = await bar();
await p.clickSel('button.snap-chip[onclick*="\'guard\'"]'); await sov(300);
const q = await p.eval(lerret); await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: q.mid.x, y: q.mid.y }); await sov(250);
await p.shot('docs/215/verktoy-forhandsvisning.png');
await p.click(q.mid.x, q.mid.y); await sov(450);
await p.eval(`_takFeatStop(); _takFeatSel = null; render();`); await sov(200);
await p.shot('docs/215/uten-varmet-felt.png');
ut.uten = await p.eval(`({ f: _takFeats(S.tak[__fid], 'SNOW_GUARD').map(g => [g.id, g.length_m, g.offset_m.value, !!g.field]) })`);
await p.clickSel('.tak-guard button.snap-chip.on'); await sov(300);
await p.eval(`_takStepGo(__fid, 4); renderSidebar(); updateCtxBar(); render();`); await sov(300);
await p.shot('docs/215/felt-uten-flateeffekt.png');
ut.tomt = await p.eval(`document.querySelector('.tak-guard .tak-flat-calc').textContent`);
ut.kabler = await p.eval(`_takFlatCableChoices().map(c => c.family + ' ' + c.watt_per_m)`);
await p.eval(`(() => { const ch = _takFlatCableChoices(), v = ch.find(c => c.watt_per_m === 30) || ch[0]; if (v) _takGuardSetCable(__fid, v.family); else S.tak[__fid].guard_cable = { product_id: -1, family: 'InSnow 30T', name: 'InSnow 30T', watt_per_m: 30, min_spacing_mm: 60, max_spacing_mm: 300 }; _takRecalc(S.tak[__fid]); renderSidebar(); })()`); await sov(200);
await p.eval(`(() => { const e = document.querySelector('.tak-guard-wm2'); e.value = '300'; e.dispatchEvent(new Event('change', { bubbles: true })); _takFeatSel = null; render(); })()`); await sov(300);
await p.shot('docs/215/med-varmet-felt.png');
ut.felt = await p.eval(`({ calc: document.querySelector('.tak-guard .tak-flat-calc').textContent, sum: document.querySelector('.tak-guard-sum-total').textContent })`);
ut.steg4 = await bar();
// Renne og snøfanger på samme kant.
await p.eval(`(() => { const f = __fid, t = S.tak[f], e = t.edges.find(x => x.type === 'eave'); const g = _takAddGutter(f, e.id); _takAddDownspout(f, g.id, 3); _takAddDownspout(f, g.id, 6); _takSetBox(f, 'n2', true); _takFeatSel = null; renderSidebar(); updateCtxBar(); render(); })()`); await sov(300);
await p.shot('docs/215/med-renne-samme-kant.png');
await p.eval(`(() => { const f = __fid, t = S.tak[f], e = t.edges.find(x => x.type === 'eave'); S.view.zoom *= 2.2; S.view.panX = (e.a.x + e.b.x) / 2; S.view.panY = e.a.y + 60; render(); })()`); await sov(300);
await p.shot('docs/215/naerbilde-etiketter.png', { x: 200, y: 200, width: 1200, height: 520 });
await p.eval(`S.view.zoom /= 2.2; fitAll(); render(); _takStepGo(__fid, 3); renderSidebar(); updateCtxBar(); render();`); await sov(300);
ut.steg3Etter = await bar();
await p.shot('docs/215/hel-skjerm-steg3.png');
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
