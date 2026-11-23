// 243: rom med korte vegger (pilaster 12 x 15, rorkasse 8 x 20, hjornekasse 30 x 20, trappet hjorne 3 x 10 cm).
// N = uten produkter, N2 = samme rom med folie og foliekjede. Rombildet i 300 DPI, Normal og Ekstra stor.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4000/docs/243/probe/head/index.html"; import("./docs/243/probe/nisje.mjs") '
import fs from "node:fs";
import { openPage } from "./cdpklient.mjs";
import { FIX } from "../../217-hindring/probe/fixture.mjs";
import { ROM, OVERLAPP } from "../../240/probe/felles.mjs";
export const NISJE = `
  const NP = [[0,0],[180,0],[180,15],[192,15],[192,0],[500,0],[500,370],[490,370],[490,380],[480,380],[480,390],[470,390],[470,400],[30,400],[30,380],[0,380],[0,220],[8,220],[8,200],[0,200]];
  const N = mk(61, "Nisjerom", NP.map(([x, y]) => ({ x: x + 9000, y }))); N.dimSnap = true; S.rooms.push(N);
  const N2 = mk(62, "Nisjerom folie", NP.map(([x, y]) => ({ x: x + 11000, y }))); N2.dimSnap = true; N2.stripDimSnap = true; S.rooms.push(N2);
  { let x = 11012, sid = 9700; for (const b of [80, 60, 100, 60, 80, 50]) { S.strips.push({ id: sid++, roomId: 62, productId: FB[b].id, direction: "v", pos_cm: x, start_cm: 20, length_cm: 340 }); x += b - 1 + 2; } }
  _invalidateStripCache();
`;
const tag = process.env.TAG || "etter";
if (!process.env.BARE_EKSPORT) {
const p = await openPage(process.env.URL0 || "http://localhost:4000/", 9333, 1);
const ut = await p.eval(`(async () => {
  try { await _loadProducts(); } catch (e) {}
  S.varmefolie.gapCm = 2; ${FIX} _currentProfile = null;
  ${ROM} ${OVERLAPP} ${NISJE}
  const kjor = (room, navn, skala) => {
    _currentProfile = skala ? { prefs: { pdfLabelScale: skala } } : null;
    const lay = _pdfRoomImgLayout(room), cv = document.createElement("canvas");
    const r = _renderRoomToImage(room, { focusRoom: true, targetWidthMm: lay.imgW2, toCanvas: cv, noUrl: true });
    const tx = (r.texts || []);
    return { rom: room.name, navn, W: cv.width, H: cv.height, dimFit: r.dimFit || null, antallMaal: tx.filter(t => t.dim).length,
      maal: tx.filter(t => t.dim).map(t => t.str).join(" | "), overlapp: overlapp(tx, cv.width, cv.height),
      stat: typeof _dimMovedStat !== "undefined" ? _dimMovedStat : null, hel: cv.toDataURL("image/png").split(",")[1] };
  };
  const ut = [];
  for (const [room, kort] of [[N, "nisje"], [N2, "nisjefolie"], [L, "lrom"]]) for (const [navn, sk] of [["normal", 0], ["xstor", 1.5]]) { const r = kjor(room, navn, sk); r.kort = kort; ut.push(r); }
  return ut;
})()`);
for (const r of ut) {
  fs.writeFileSync(`docs/243/${tag}-${r.kort}-${r.navn}.png`, Buffer.from(r.hel, "base64")); delete r.hel;
  console.log(r.kort, r.navn, "maal", r.antallMaal, "par", r.overlapp.par.length, "andre", r.overlapp.andre.length, "utenfor", r.overlapp.utenfor.length, JSON.stringify(r.stat), JSON.stringify(r.overlapp.par));
}
fs.writeFileSync(`docs/243/probe/nisje-${tag}.json`, JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
}
