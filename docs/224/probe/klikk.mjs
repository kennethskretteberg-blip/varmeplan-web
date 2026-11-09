// 224: «klikk på samme skjermpunkt gir samme verdenskoordinat før og etter at panelet skjules og vises».
// Fem klientpunkter + ett ekte klikk midt i rom 32, ved deviceScaleFactor 1 og 2, med standard (272 px) og
// eget (420 px) sidepanel. Skriver docs/224/probe/klikk.json.
//   node -e ' import("./docs/224/probe/klikk.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
import { FIX } from './fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const ut = {};
for (const dsf of [1, 2]) {
  const p = await openPage(url, 9333, dsf);
  ut['dsf' + dsf] = await p.eval(`(async () => {
    S.varmefolie.gapCm = 2; ${FIX}
    S.ui.showGrid = true; S.view.zoom = 1.1; S.view.panX = 700; S.view.panY = 150; render();
    const sov = ms => new Promise(r => setTimeout(r, ms));
    const r0 = canvas.getBoundingClientRect();
    // faste KLIENTpunkter (vinduet), ikke andeler av lerretet — lerretet flytter seg jo
    const pts = [[0.1, 0.1], [0.5, 0.5], [0.9, 0.9], [0.25, 0.75], [0.8, 0.2]].map(([fx, fy]) => ({ clientX: Math.round(r0.left + r0.width * fx), clientY: Math.round(r0.top + r0.height * fy) }));
    const maal = () => {
      const r = canvas.getBoundingClientRect();
      const o = { rect: { l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }, backing: [canvas.width, canvas.height], panX: Math.round(S.view.panX * 1000) / 1000, pts: [] };
      for (const q of pts) {
        const ev = new MouseEvent('mousemove', { clientX: q.clientX, clientY: q.clientY, bubbles: true });
        canvas.dispatchEvent(ev);
        const c = _evToCanvas(ev), w = s2w(c.x, c.y);
        o.pts.push([Math.round(w.x * 1000) / 1000, Math.round(w.y * 1000) / 1000]);
      }
      // ekte klikk på det KLIENTpunktet der rom 32 sitt midtpunkt sto FØR — skal fortsatt velge rom 32
      S.ui.selectedRoomId = null;
      const ev2 = { clientX: klikk.x, clientY: klikk.y, button: 0, bubbles: true };
      canvas.dispatchEvent(new MouseEvent('mousedown', ev2)); canvas.dispatchEvent(new MouseEvent('mouseup', ev2)); canvas.dispatchEvent(new MouseEvent('click', ev2));
      // klikk-syklusen (CYCLE_TOL_PX) går videre til folien under pekeren ved gjentatt klikk på samme sted —
      // derfor telles både rom og folie-bane som «traff rom 32»
      const strip = S.ui.selectedStripId != null ? S.strips.find(s => s.id === S.ui.selectedStripId) : null;
      o.valgtRom = S.ui.selectedRoomId != null ? S.ui.selectedRoomId : (strip ? 'folie i rom ' + strip.roomId : null);
      return o;
    };
    const m0 = w2s(800, 150); const klikk = { x: r0.left + m0.x, y: r0.top + m0.y };
    const avvik = (a, b) => Math.max(...a.pts.map((q, i) => Math.max(Math.abs(q[0] - b.pts[i][0]), Math.abs(q[1] - b.pts[i][1]))));
    const serie = async () => {
      const aapen = maal();
      _sbToggleCollapse(); await sov(350); render();
      const skjult = maal();
      _sbToggleCollapse(); await sov(350); render();
      const igjen = maal();
      return { aapen, skjult, igjen, avvikSkjult: avvik(aapen, skjult), avvikIgjen: avvik(aapen, igjen) };
    };
    const standard = await serie();
    document.getElementById('sidebar').style.width = '420px'; await sov(400); render();
    const bredt = await serie();
    document.getElementById('sidebar').style.width = ''; await sov(300);
    return { dpr: window.devicePixelRatio, standard, bredt };
  })()`);
  await p.close();
}
fs.writeFileSync('docs/224/probe/klikk.json', JSON.stringify(ut, null, 1));
for (const k of Object.keys(ut)) for (const s of ['standard', 'bredt']) {
  const v = ut[k][s];
  console.log(k, s, 'lerret', v.aapen.rect.w, '→', v.skjult.rect.w, '→', v.igjen.rect.w, '| avvik skjult', v.avvikSkjult, 'igjen', v.avvikIgjen, '| valgt rom', v.aapen.valgtRom, v.skjult.valgtRom, v.igjen.valgtRom, '| panX', v.aapen.panX, v.skjult.panX, v.igjen.panX);
}
process.exit(0);
