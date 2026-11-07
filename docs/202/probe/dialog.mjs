// 202: før/etter-bilder av byggerdialogen i begge retninger + breddemåling av statistikklinja.
//   TAG=for|etter W=900|360 node /tmp/cdp202/dialog.mjs
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
const OUT = process.env.HOME + '/Code/varmeplan-web/docs/202/';
const TAG = process.env.TAG || 'for', W = +(process.env.W || 900);
const p = await openPage(`http://localhost:4000/`);
await p.send('Emulation.setDeviceMetricsOverride', { width: W, height: W < 500 ? 780 : 1100, deviceScaleFactor: W < 500 ? 2 : 1, mobile: W < 500 });
await p.eval(`(async () => { await _loadProducts(); document.getElementById('auth-screen').style.display='none'; document.getElementById('project-list-screen').style.display='none'; document.getElementById('app').style.display='flex'; return 1; })()`);
const maal = () => p.eval(`(() => {
  const st = document.getElementById('stair-builder-stats'); const b = st.getBoundingClientRect();
  const modal = document.querySelector('#stair-modal-bg > div');
  const spans = [...st.children].map(s => { const r = s.getBoundingClientRect(); return { tekst: s.innerText.trim(), x0: Math.round(r.left), x1: Math.round(r.right), y: Math.round(r.top), synlig: r.left >= b.left - 0.5 && r.right <= b.right + 0.5 }; });
  const prev = document.getElementById('stair-builder-preview');
  return { vindu: innerWidth, linjeBredde: Math.round(b.width), innholdBredde: st.scrollWidth, rader: new Set(spans.map(s => s.y)).size,
    modalScrollW: modal.scrollWidth, modalClientW: modal.clientWidth, spans,
    etikett: document.getElementById('stair-builder-seg-label').innerText,
    forklaring: prev ? prev.innerText.replace(/\\s+/g, ' ').trim() : null };
})()`);
const res = {};
const SEGS = process.env.SEGS || `[ { type:'steps', stepCount:4, width_cm:90, stepDepth_cm:25, stepHeight_cm:17 }, { type:'landing', width_cm:90, depth_cm:90 }, { type:'steps', stepCount:4, width_cm:90, stepDepth_cm:25, stepHeight_cm:17 } ]`;
for (const dir of ['bottom', 'top']) {
  await p.eval(`(() => { _showStraightStairBuilder(); _stairBuilderSegs = ${SEGS};
    _stairBuilderDir = ${JSON.stringify(dir)}; _renderStairBuilderModal(); return 1; })()`);
  await new Promise(r => setTimeout(r, 300));
  res[dir] = await maal();
  const navn = `${OUT}dialog-${W}-${dir === 'top' ? 'ovenfra' : 'nedenfra'}-${TAG}`;
  await p.eval(`(() => { const m = document.querySelector('#stair-modal-bg > div'); m.scrollTop = document.getElementById('stair-builder-seg-label').offsetTop - 10; return 1; })()`);
  await p.shot(navn + '-a.png');
  await p.eval(`(() => { const m = document.querySelector('#stair-modal-bg > div'); m.scrollTop = document.getElementById('stair-builder-preview').offsetTop - 60; return 1; })()`);
  await p.shot(navn + '-b.png');
}
fs.writeFileSync(`/tmp/cdp202/dialog-${W}-${TAG}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
await p.close(); process.exit(0);
