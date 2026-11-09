// 216: syntakssjekk av alle inline <script>-blokker i index.html (vm.Script kompilerer uten å kjøre).
import fs from "node:fs"; import vm from "node:vm";
const f = process.env.SRC || "index.html";
const html = fs.readFileSync(f, "utf8");
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let m, n = 0, feil = 0;
while ((m = re.exec(html))) {
  n++;
  const linjeStart = html.slice(0, m.index).split("\n").length;
  try { new vm.Script(m[1], { filename: f + "#script" + n }); }
  catch (e) { feil++; console.log("SYNTAKSFEIL i script", n, "(starter linje", linjeStart + "):", e.message, e.stack.split("\n").slice(0, 3).join(" | ")); }
}
console.log(n, "script-blokker,", feil, "feil");
process.exit(feil ? 1 : 0);
