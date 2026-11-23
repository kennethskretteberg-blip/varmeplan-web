// 240: skjermen — Kenneths L-rom med «Målsett folie» på, rommet fyller lerretet og sterkt utzoomet.
import { openPage } from './cdpklient.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
import { ROM } from './felles.mjs';
const tag = process.env.TAG || 'etter';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/', 9333, 2);
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} S.varmefolie.gapCm = 2; ${FIX} _currentProfile = null; ${ROM} L.stripDimSnap = true; window.L240 = L; return 1; })()`);
for (const [navn, f] of [['fyller', 1], ['utzoomet', 0.3]]) {
  const r = await p.eval(`(() => { const L = window.L240; S.ui.selectedRoomId = null;
    S.view.zoom = ${f} * Math.min(_cvW() / 1000, _cvH() / 980) / BASE_SCALE; S.view.panX = 5350; S.view.panY = 340; render();
    const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height, stat: typeof _dimMovedStat !== 'undefined' ? _dimMovedStat : null }; })()`);
  console.log(navn, JSON.stringify(r.stat));
  await p.shot(`docs/240/${tag}-skjerm-${navn}.png`, { x: r.x, y: r.y, width: r.width, height: r.height });
}
await p.close(); process.exit(0);
