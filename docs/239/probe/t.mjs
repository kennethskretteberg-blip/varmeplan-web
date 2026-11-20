// 239: kjør én eller flere regresjonsfunksjoner fra index.html i en ny fane og skriv røde deltester.
//   node -e ' process.env.FN="_stairHorseshoeRegressionTest,_stairLandingMarginRegressionTest238"; import("./docs/239/probe/t.mjs") '
import { openPage } from "./cdpklient.mjs";
const p = await openPage(process.env.URL0 || "http://localhost:4000/", 9333, 1);
for (const fn of (process.env.FN || "").split(",")) {
  try {
    const r = await p.eval("(async () => { try { await _loadProducts(); } catch (e) {} const t = await " + fn + "(); return (t.results || t).map(x => ({ name: x.name, ok: x.ok, expected: x.expected, got: x.got })); })()");
    const feil = r.filter(x => !x.ok);
    console.log(fn, "deltester", r.length, "grønne", r.length - feil.length);
    feil.forEach(x => console.log("  RØD", x.name, "| ventet", JSON.stringify(x.expected), "| fikk", JSON.stringify(x.got)));
  } catch (e) { console.log(fn, "FEIL", e.message); }
}
await p.close(); process.exit(0);
