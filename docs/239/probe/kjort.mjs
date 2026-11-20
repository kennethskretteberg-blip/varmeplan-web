// 238: kjører testen fra fila docs/238/probe/t238.js (ikke fra index.html) i en ny fane. HEAD=1 → HEAD-kopien.
//   node -e ' process.env.HEAD="1"; import("./docs/238/probe/kjort.mjs") '
import fs from "node:fs";
import { openPage } from "./cdpklient.mjs";
const url = process.env.HEAD ? "http://localhost:4000/docs/238/probe/head/index.html" : "http://localhost:4000/";
const p = await openPage(url, 9333, 1);
const src = fs.readFileSync("docs/238/probe/t238.js", "utf8");
const inSide = process.env.INNE;   // INNE=1: bruk funksjonen som ligger i index.html
try {
  const r = await p.eval("(async () => { try { await _loadProducts(); } catch (e) {}\n" + (inSide ? "" : src) + "\nconst t = _stairLandingMarginRegressionTest238(); return t.results; })()");
  const feil = r.filter(x => !x.ok);
  console.log("deltester", r.length, "grønne", r.length - feil.length);
  feil.forEach(x => console.log("  RØD", x.name, "| ventet", JSON.stringify(x.expected), "| fikk", JSON.stringify(x.got)));
  if (process.env.FASIT) { const o = {}; r.filter(x => x.name.startsWith("A: a")).forEach(x => { o[x.name.slice(3).split(" ")[0]] = x.got; }); fs.writeFileSync("docs/238/probe/fasit-head.json", JSON.stringify(o, null, 1)); console.log(JSON.stringify(o)); }
} catch (e) { console.log("FEIL", e.message); }
await p.close(); process.exit(0);
