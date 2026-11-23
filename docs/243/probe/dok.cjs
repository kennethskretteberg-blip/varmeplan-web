// 243: skriver endringslogg og STATUS, setter suite-tallene inn i rapporten og sletter HEAD-kopien.
//   node -e ' process.env.S243="35/35"; process.env.SUITE="…"; require("./docs/243/probe/dok.cjs") '
const fs = require("fs");
const s243 = process.env.S243, suite = process.env.SUITE;
if (!s243 || !suite) throw new Error("S243 og SUITE");
const kort = "243 Veggmålene («680 cm») legger seg heller ikke oppå hverandre (`main`, committet `@@HASH@@`, ikke pushet, ingen SQL): veggmålene (`_drawDimAnnotationsForRoom`, også `bareVegger`) følger 240-regelen – teksten står midt på målelinja bare når den får plass i linja (boks + 0,3 × skrifthøyde) og ikke treffer en tekst i `_dimPlaced`; ellers flyttes den ut på utsiden med leder. Flyttingen fra 240 er løftet ut til felles `_dimFlushMoved`, som kjedene og veggmålene begge kaller; flyttede veggmål plasseres sist (`_dimDefer`) og registreres, så kjedetekster og veggmål går utenom hverandre begge veier. Skjermen skjuler et veggmål som ikke får plass til man zoomer inn; PDF viser alle. Testrom med 13 korte vegger (8–30 cm): 9 overlappende par i Normal og 35 i Ekstra stor på HEAD, 0 og 0 nå (med folie 0/13 → 0/0), 20 og 35 mål før og etter, ingen utenfor bildet; skjerm 3 og 56 par → 0. L-rommet fra 240 er bit-likt med HEAD i Normal og Ekstra stor. Skrift, streker, farger, 300 DPI, målelinjenes plassering og kjedetekstene urørt. Ny `_wallDimNoOverlapRegressionTest243` " + s243 + " (49/49 med synlig lerret, 28/49 mot koden før); " + suite + " Funn, ikke rettet: veggmål bredere enn linja flyttes også uten overlapp; skrå vegger har ikke regelen; veggetikettene «V7 10 cm» overlapper fortsatt hverandre; én lang leder i trappet hjørne i Ekstra stor. Se `docs/243/RAPPORT.md`.";
let st = fs.readFileSync("STATUS.md", "utf8");
st = st.replace(/(\*\*Sist oppdatert:\*\* )[0-9.]+/, (m, a) => a + "23.11.2026");
st = st.replace("**Sist gjort:** ", () => "**Sist gjort:** " + kort + " Før det: ");
st = st.replace("**Neste steg:** ", () => "**Neste steg:** Kenneth lager PDF av et rom med nisjer/fremspring (korte vegger) i Normal og Ekstra stor, ser på veggmålene, og svarer på `docs/243/SPØRSMÅL.md` (flytte veggmål som bare er bredere enn linja; skjule veggmål på skjermen; skrå vegger; veggetikettene «V7 10 cm»; lang leder i trappet hjørne; vegger som vender inn mot rommet). Deretter: ");
st = st.replace("veggmål og skrå kabelkjeder inn under regelen; ", () => "skrå kabelkjeder inn under regelen (veggmålene er gjort i 243); ");
fs.writeFileSync("STATUS.md", st);
let el = fs.readFileSync("docs/endringslogg.md", "utf8");
const ny = "## 243 — Veggmålene («680 cm») legger seg heller ikke oppå hverandre (23.11.2026, `@@HASH@@`, `main`, ikke pushet)\n\n" + kort.replace(/^243 [^(]+\([^)]*\) [^(]+\([^)]*\): /, "") + "\n\n";
if (!el.includes("## 243 — ")) { if (!el.includes("## 242 — ")) throw new Error("fant ikke 242 i endringsloggen"); el = el.replace("## 242 — ", () => ny + "## 242 — "); }
fs.writeFileSync("docs/endringslogg.md", el);
let ra = fs.readFileSync("docs/243/RAPPORT.md", "utf8");
ra = ra.replace("@@SUITE243@@", () => s243).replace("@@SUITE@@", () => suite);
fs.writeFileSync("docs/243/RAPPORT.md", ra);
fs.rmSync("docs/243/probe/head", { recursive: true, force: true });
console.log("ok", st.includes("243 Veggmålene"), el.includes("## 243 — "), !ra.includes("@@SUITE"), fs.existsSync("docs/243/probe/head"), ny.slice(0, 160));
