// 236: fixture -> skjermbilde av lerretet + PDF-romsidene (PNG). TAG=foer (HEAD-kopien) / etter (arbeidskopien).
//   node -e ' process.env.TAG="etter"; import("./docs/236/probe/kjor.mjs") '
import fs from "node:fs";
import { openPage, sov } from "./cdpklient.mjs";
const tag = process.env.TAG || "etter";
const url = tag === "foer" ? "http://localhost:4000/docs/236/probe/head/index.html" : "http://localhost:4000/";
const p = await openPage(url, 9333, 2);
const r = await p.eval(fs.readFileSync("docs/236/probe/fix.js", "utf8"));
await sov(400);
console.log(tag, JSON.stringify(r, null, 1));
const cb = await p.eval("(() => { const b = document.getElementById(\"canvas\").getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; })()");
await p.shot("docs/236/" + tag + "-skjerm.png", cb);
r.repro = await p.eval(fs.readFileSync("docs/236/probe/repro.js", "utf8"));
await p.eval(fs.readFileSync("docs/236/probe/fix.js", "utf8"));
const pdf = await p.eval(fs.readFileSync("docs/236/probe/pdf.js", "utf8"));
if (pdf.b64) { fs.writeFileSync("docs/236/probe/" + tag + ".pdf", Buffer.from(pdf.b64, "base64")); delete pdf.b64; }
(pdf.png || []).forEach((d, i) => fs.writeFileSync("docs/236/" + tag + "-pdf-" + "ABC"[i] + ".png", Buffer.from(d, "base64"))); delete pdf.png;
console.log("pdf sider", pdf.sider, pdf.feil || "");
fs.writeFileSync("docs/236/probe/" + tag + ".json", JSON.stringify(r, null, 1));
await p.close(); process.exit(0);
