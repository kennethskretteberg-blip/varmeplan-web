import { openPage } from './cdp.mjs';
const p = await openPage('http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  window._showToast = (m) => (window.__t = (window.__t || []).concat(m)); window._scheduleAutoSave = () => {}; window.confirm = () => true;
  _resetProjectState(); addPart('roof'); const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
  S.ui.activePartId = part.id; S.ui.activeFloorId = fid;
  S.tak = { [fid]: _takManual([{x:0,y:0},{x:4000,y:0},{x:4000,y:2000},{x:0,y:2000}], { method: 'free' }) };
  _takSetRoofType(fid, 'flat');
  const ch = _takFlatCableChoices().map(c => c.family + ' ' + c.watt_per_m);
  _takFlatSetCable(fid, 'InSnow 30T');
  for (const x of [666.7, 2000, 3333.3]) for (const y of [333.3, 1000, 1666.7]) _takFlatAddDrain(fid, {x, y});
  const v = _takFlatAddValley(fid, {x:666.7,y:1000}, {x:1466.7,y:1000});
  _takFlatSet(fid, v.id, 'width_m', '0,6'); _takFlatSet(fid, v.id, 'wm2', '300');
  const f = _takFlatAddField(fid, null); _takFlatSet(fid, f.id, 'wm2', '300');
  const t = _takOf(fid); const Sm = _takFlatSummary(t);
  return { ch, drains: Sm.per.ROOF_DRAIN, v: [v.length_m, v.cable_total_m], f: [f.area_m2, f.cable_total_m], setup: Sm.setup, setups: Sm.setups, toasts: window.__t,
    card: _takCardHtml(fid).length, calc: _takFlatCalc(_takFlatCable(t), 300, 4.8, 0.6) };
})()`);
console.log(JSON.stringify(r, null, 1));
await p.close(); process.exit(0);
