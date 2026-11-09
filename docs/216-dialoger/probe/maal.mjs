// 216-dialoger: måler om knappene i bunnen av hver dialog er helt innenfor vinduet, ved fire
// vindusstørrelser, og om innholdet kan rulles til bunns. Skjermbilder ved 1366×650.
//   node -e ' process.env.TAG="foer"; import("./docs/216-dialoger/probe/maal.mjs") '
//   URL0 = side (HEAD-kopi eller arbeidskopi), TAG = filprefiks, BARE = regex på dialognavn, SHOT=0 slår av bilder
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
import { FIX } from '../../221/probe/fixture.mjs';
import { DIALOGER } from './dialoger.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const TAG = process.env.TAG || 'maal';
const SIZES = [[1366, 650], [1280, 720], [1440, 900], [1024, 600]];
const bare = process.env.BARE ? new RegExp(process.env.BARE) : null;
const ut = {};
// 20 ekstra rom så romlista i Eksporter PDF blir lang (prompten: «kryss av mange rom»).
const MANGE_ROM = `for (let k = 0; k < 20; k++) { const pts = rect(9000 + k * 500, 0, 300, 300); S.rooms.push({ id: 900 + k, floorId: 1, partId: 71, name: "Testrom " + (k + 1), points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] }); }`;
for (const d of DIALOGER) {
  if (bare && !bare.test(d.navn)) continue;
  ut[d.navn] = {};
  for (const [w, h] of SIZES) {
    const p = await openPage(null);
    await p.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await p.goto(url);
    try {
      await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
        for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
        document.getElementById("app").style.display = "flex"; window.__accOrig = window.showAccessoriesModal;
        ${FIX} ${d.mangeRom ? MANGE_ROM : ""}
        resizeCanvas(); setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render(); })()`);
      if (d.forberede) await p.eval(d.forberede);
      // Pakkes inn så eval ikke venter på et løfte som først løses når brukeren klikker (showAccessoriesModal).
      await p.eval("(() => { " + d.aapne + "; })()"); await sov(d.vent || 400);
      const m = await p.eval(`(() => {
        const boks = document.querySelector(${JSON.stringify(d.boks)}); if (!boks) return { feil: "ingen boks" };
        const H = innerHeight; const bb = boks.getBoundingClientRect();
        const kn = [...document.querySelectorAll(${JSON.stringify(d.knapper)})].filter(b => b.getClientRects().length);
        const knapper = kn.map(b => { const r = b.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const topp = document.elementFromPoint(cx, cy);
          return { tekst: b.textContent.trim().slice(0, 28), topp: Math.round(r.top), bunn: Math.round(r.bottom), inne: r.bottom <= H && r.top >= 0, klikkbar: !!topp && (topp === b || b.contains(topp)) }; });
        let rull = null;
        if (${JSON.stringify(d.rull || null)}) { const el = document.querySelector(${JSON.stringify(d.rull)}) || boks; if (el) { el.scrollTop = 1e6;
          const sist = el.lastElementChild; const sr = sist ? sist.getBoundingClientRect() : null; const er = el.getBoundingClientRect();
          rull = { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, sistInne: !!sr && sr.bottom <= er.bottom + 1 && sr.bottom <= H }; el.scrollTop = 0; } }
        return { H, W: innerWidth, boksTopp: Math.round(bb.top), boksBunn: Math.round(bb.bottom), boksHoyde: Math.round(bb.height), hoyereEnnVindu: bb.height > H, antallKnapper: knapper.length,
          alleInne: knapper.length > 0 && knapper.every(k => k.inne), alleKlikkbare: knapper.length > 0 && knapper.every(k => k.klikkbar), knapper, rull }; })()`);
      ut[d.navn][w + "x" + h] = m;
      if (w === 1366 && process.env.SHOT !== "0") await p.shot(`docs/216-dialoger/${TAG}-${d.fil}.png`);
    } catch (e) { ut[d.navn][w + "x" + h] = { unntak: String(e.message).slice(0, 300) }; }
    await p.close();
  }
}
fs.writeFileSync(`docs/216-dialoger/probe/${TAG}.json`, JSON.stringify(ut, null, 1));
for (const [navn, s] of Object.entries(ut)) for (const [sz, m] of Object.entries(s))
  console.log(navn.padEnd(34), sz.padEnd(9), m.feil || m.unntak ? ("FEIL " + (m.feil || m.unntak)) : `knapper ${m.antallKnapper} inne=${m.alleInne} klikkbare=${m.alleKlikkbare} boks ${m.boksTopp}..${m.boksBunn}/${m.H}${m.hoyereEnnVindu ? " HØYERE ENN VINDU" : ""}${m.rull ? " rull sistInne=" + m.rull.sistInne : ""}`);
process.exit(0);
