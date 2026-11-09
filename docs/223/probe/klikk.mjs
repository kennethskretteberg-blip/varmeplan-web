// 223: «et klikk på et kjent skjermpunkt gir samme verdenskoordinat før og etter», dpr 1 og 2, også
// etter at sidepanelet er dratt bredere. Kjøres mot HEAD-kopien og arbeidskopien; skriver JSON per kjøring.
//   node -e ' process.env.TAG="head"; process.env.URL0="http://localhost:4013/docs/223/probe/head/index.html"; import("./docs/223/probe/klikk.mjs") '
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const ut = {};
for (const dsf of [1, 2]) {
  const p = await openPage(url, 9333, dsf);
  ut['dsf' + dsf] = await p.eval(`(async () => {
    S.varmefolie.gapCm = 2; ${FIX}
    S.ui.showGrid = true; S.view.zoom = 1.1; S.view.panX = 700; S.view.panY = 150; render();
    const sov = ms => new Promise(r => setTimeout(r, ms));
    // Ekte musehendelser: mousedown/mouseup på kjente klientpunkter, og hva s2w(_evToCanvas) gir.
    const maal = () => {
      const r = canvas.getBoundingClientRect();
      const pts = [[0.1, 0.1], [0.5, 0.5], [0.9, 0.9], [0.25, 0.75], [0.8, 0.2]].map(([fx, fy]) => ({ clientX: Math.round(r.left + r.width * fx), clientY: Math.round(r.top + r.height * fy) }));
      const ut = { dpr: window.devicePixelRatio, rect: { w: Math.round(r.width), h: Math.round(r.height) }, backing: { w: canvas.width, h: canvas.height }, pts: [] };
      for (const q of pts) {
        const ev = new MouseEvent('mousemove', { clientX: q.clientX, clientY: q.clientY, bubbles: true });
        canvas.dispatchEvent(ev);
        const c = _evToCanvas(ev), w = s2w(c.x, c.y);
        ut.pts.push({ klient: [q.clientX, q.clientY], lerret: [Math.round(c.x * 1000) / 1000, Math.round(c.y * 1000) / 1000], verden: [Math.round(w.x * 1000) / 1000, Math.round(w.y * 1000) / 1000],
          mus: S.drawing && S.drawing.mousePos ? [Math.round(S.drawing.mousePos.x * 1000) / 1000, Math.round(S.drawing.mousePos.y * 1000) / 1000] : null });
      }
      // Treffer: klikk midt i rom 32 (Stue folie) skal velge det
      const m = w2s(800, 150); const ev2 = { clientX: r.left + m.x, clientY: r.top + m.y, button: 0, bubbles: true };
      S.ui.selectedRoomId = null; canvas.dispatchEvent(new MouseEvent('mousedown', ev2)); canvas.dispatchEvent(new MouseEvent('mouseup', ev2)); canvas.dispatchEvent(new MouseEvent('click', ev2));
      ut.valgtRom = S.ui.selectedRoomId;
      return ut;
    };
    const smal = maal();
    // Sidepanelet dras bredere (272 → 480 px): canvas-wrap krymper, ResizeObserver → resizeCanvas
    document.getElementById('sidebar').style.width = '480px'; await sov(400); render();
    const bred = maal();
    document.getElementById('sidebar').style.width = ''; await sov(400); render();
    return { smal, bred };
  })()`);
  await p.close();
}
fs.writeFileSync(`docs/223/probe/klikk-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, JSON.stringify(ut).slice(0, 600));
process.exit(0);
