// 243: skjermen — nisjerommet (uten og med folie) fyller lerretet og sterkt utzoomet. Teller overlappende tekstpar og tar bilde.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4000/docs/243/probe/head/index.html"; import("./docs/243/probe/skjerm.mjs") '
import { openPage } from "./cdpklient.mjs";
import { FIX } from "../../217-hindring/probe/fixture.mjs";
import { ROM } from "../../240/probe/felles.mjs";
process.env.BARE_EKSPORT = "1";
const { NISJE } = await import("./nisje.mjs");
const tag = process.env.TAG || "etter";
const p = await openPage(process.env.URL0 || "http://localhost:4000/", 9333, 2);
await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {} S.varmefolie.gapCm = 2; ${FIX} _currentProfile = null; ${ROM} ${NISJE} window.N243 = { nisje: N, nisjefolie: N2 }; return 1; })()`);
for (const rom of ["nisje", "nisjefolie"]) for (const [navn, f] of [["fyller", 1], ["utzoomet", 0.3]]) {
  const r = await p.eval(`(() => { const R = window.N243.${rom}; S.ui.selectedRoomId = null;
    const xs = R.points.map(q => q.x), ys = R.points.map(q => q.y);
    S.view.zoom = ${f} * Math.min(_cvW() / 820, _cvH() / 720) / BASE_SCALE; S.view.panX = (Math.min(...xs) + Math.max(...xs)) / 2; S.view.panY = 200;
    const cap = _pdfCapStart(R); let stat; try { render(); stat = typeof _dimMovedStat !== "undefined" ? { ..._dimMovedStat } : null; } finally { _pdfCapStop(); }
    const tx = cap.boxes.filter(t => /^(V\\d+ )?[\\d.]+ cm$/.test(t.str)), par = [];
    const hit = (a, b) => a.x0 < b.x1 - 0.5 && a.x1 > b.x0 + 0.5 && a.y0 < b.y1 - 0.5 && a.y1 > b.y0 + 0.5, maal = t => !/^V/.test(t.str);
    for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) if ((maal(tx[i]) || maal(tx[j])) && hit(tx[i], tx[j])) par.push(tx[i].str + " × " + tx[j].str);
    render();
    const b = canvas.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height, stat, maal: tx.filter(maal).length, par }; })()`);
  console.log(rom, navn, "maal", r.maal, "par", r.par.length, JSON.stringify(r.stat), JSON.stringify(r.par));
  await p.shot(`docs/243/${tag}-skjerm-${rom}-${navn}.png`, { x: r.x, y: r.y, width: r.width, height: r.height });
}
await p.close(); process.exit(0);
