// 233: fryserom-fixture (ett rom, kabel som IKKE er InFloor 10T, reserve av = begge avvik) -> skjermbilde av
// sidepanelet + PDF-romsiden (tekstdump + PNG via pdf.js). TAG=foer med URL0=HEAD-kopien, TAG=etter mot arbeidskopien.
//   node -e ' process.env.TAG="etter"; import("./docs/233/probe/frys233.mjs") '
import fs from "node:fs";
import { openPage, sov } from "./cdpklient.mjs";
const tag = process.env.TAG || "etter";
const p = await openPage(process.env.URL0 || "http://localhost:4000/", 9333, 2);
const FIX = fs.readFileSync("docs/233/probe/fix.js", "utf8");
const r = await p.eval(FIX);
await sov(500);
const b = r.panel;
await p.shot(`docs/233/${tag}-sidepanel.png`, { x: b.x, y: b.y, width: b.w, height: b.h });
const pdf = await p.eval(fs.readFileSync("docs/233/probe/pdf.js", "utf8"));
fs.writeFileSync(`docs/233/probe/${tag}.pdf`, Buffer.from(pdf.b64, "base64")); delete pdf.b64;
fs.writeFileSync(`docs/233/${tag}-pdf-romside.png`, Buffer.from(pdf.png, "base64")); delete pdf.png;
fs.writeFileSync(`docs/233/probe/${tag}.json`, JSON.stringify({ fix: r, pdf }, null, 1));
console.log(tag, JSON.stringify(r)); console.log(JSON.stringify(pdf.tekst));
await p.close(); process.exit(0);
