// 216: kjører uttrykket i fila F i en ny fane (med fixture om FIX != "0") og skriver resultatet.
//   node -e ' process.env.F="docs/216-dialoger/probe/uttrykk1.js"; import("./docs/216-dialoger/probe/ev.mjs") '
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
import { FIX } from '../../221/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const p = await openPage(null);
await p.send("Emulation.setDeviceMetricsOverride", { width: +(process.env.W || 1366), height: +(process.env.H || 650), deviceScaleFactor: 1, mobile: false });
await p.goto(url);
await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = (m) => { window.__toast = m; };
  for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  document.getElementById("app").style.display = "flex"; ${process.env.FIX === "0" ? "" : FIX}
  resizeCanvas(); setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render(); })()`);
try { const r = await p.eval(fs.readFileSync(process.env.F, 'utf8')); console.log(JSON.stringify(r, null, 1)); }
catch (e) { console.log('FEIL', e.message.slice(0, 600)); }
if (process.env.SHOT) await p.shot(process.env.SHOT);
await p.close(); process.exit(0);
