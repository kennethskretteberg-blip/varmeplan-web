// 234: fixture -> skjermbilde av lerretet + PDF-romsidene (PNG). TAG=foer med URL0=HEAD-kopien, TAG=etter mot arbeidskopien.
//   node -e ' process.env.TAG="etter"; import("./docs/234/probe/kjor.mjs") '
import fs from "node:fs";
import { openPage, sov } from "./cdpklient.mjs";
const tag = process.env.TAG || "etter";
const p = await openPage(process.env.URL0 || "http://localhost:4000/", 9333, 2);
const r = await p.eval(fs.readFileSync("docs/234/probe/fix.js", "utf8"));
await sov(400);
console.log(tag, JSON.stringify(r, null, 1));
const cb = await p.eval("(() => { const b = document.getElementById(\"canvas\").getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; })()");
await p.shot("docs/234/" + tag + "-skjerm.png", cb);
await p.eval("(() => { S.view.zoom = 3.2; S.view.panX = 135; S.view.panY = 75; render(); return 1; })()");
await p.shot("docs/234/" + tag + "-skjerm-A.png", cb);
if (process.env.EKSTRA) console.log("ekstra", JSON.stringify(await p.eval(fs.readFileSync(process.env.EKSTRA, "utf8")), null, 1));
if (!process.env.NOPDF) {
  const pdf = await p.eval(fs.readFileSync("docs/234/probe/pdf.js", "utf8"));
  if (pdf.b64) { fs.writeFileSync("docs/234/probe/" + tag + ".pdf", Buffer.from(pdf.b64, "base64")); delete pdf.b64; }
  (pdf.png || []).forEach((d, i) => fs.writeFileSync("docs/234/" + tag + "-pdf-" + "ABC"[i] + ".png", Buffer.from(d, "base64"))); delete pdf.png;
  fs.writeFileSync("docs/234/probe/" + tag + "-pdf.json", JSON.stringify(pdf, null, 1));
  console.log("pdf sider", pdf.sider, pdf.feil || "");
}
fs.writeFileSync("docs/234/probe/" + tag + ".json", JSON.stringify(r, null, 1));
await p.close(); process.exit(0);
