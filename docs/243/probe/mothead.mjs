// 243: kjører den nye testen mot koden FØR endringen (HEAD-kopien) — testen limes inn i sida.
import fs from "node:fs";
import { openPage } from "./cdpklient.mjs";
const p = await openPage("http://localhost:4000/docs/243/probe/head/index.html");
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  for (const id of ["auth-screen","project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  document.getElementById("app").style.display = "flex"; resizeCanvas();
  ${fs.readFileSync("docs/243/probe/t243.js", "utf8")}
  const t = _wallDimNoOverlapRegressionTest243();
  return { n: t.results.length, ok: t.results.filter(r => r.ok).length, feil: t.results.filter(r => !r.ok).map(r => r.name) }; })()`);
console.log(JSON.stringify(r, null, 1));
fs.writeFileSync("docs/243/probe/t243-head.json", JSON.stringify(r, null, 1));
await p.close(); process.exit(0);
