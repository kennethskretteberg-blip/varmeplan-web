// 216: kjører _dialogRegressionTest216 i en ny fane (med fixture-rom) ved valgt vindusstørrelse.
//   node -e ' process.env.W=1366; process.env.H=650; import("./docs/216-dialoger/probe/kjor216.mjs") '
import { openPage, sov } from './cdp.mjs';
import { FIX } from '../../221/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const w = +(process.env.W || 1400), h = +(process.env.H || 900);
const p = await openPage(null);
await p.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
await p.goto(url);
const r = await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
  for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  document.getElementById("app").style.display = "flex"; ${process.env.FIX === "0" ? "" : FIX}
  resizeCanvas(); setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render();
  const t = await _dialogRegressionTest216();
  return { ok: t.ok, n: t.results.length, feil: t.results.filter(x => !x.ok) }; })()`);
console.log(`${w}x${h} fixture=${process.env.FIX !== "0"}:`, r.ok ? "BESTÅTT" : "FEILET", r.n, "sjekker");
for (const f of r.feil) console.log("  RØD:", f.name, f.info == null ? "" : JSON.stringify(f.info));
await p.close(); process.exit(0);
