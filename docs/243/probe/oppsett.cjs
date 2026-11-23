// 243: lager HEAD-kopien (docs/243/probe/head/index.html) og kopierer probeverktoyene fra 240.
//   node -e ' require("./docs/243/probe/oppsett.cjs") '
const fs = require("fs"), cp = require("child_process");
fs.mkdirSync("docs/243/probe/head", { recursive: true });
fs.writeFileSync("docs/243/probe/head/index.html", cp.execFileSync("git", ["show", "HEAD:index.html"], { maxBuffer: 1 << 28 }));
for (const f of ["cdpklient.mjs", "ev.mjs", "skriv.js", "legg.js", "pb.js"]) fs.copyFileSync("docs/240/probe/" + f, "docs/243/probe/" + f);
for (const f of ["alle.mjs", "sammenlign.js"]) fs.writeFileSync("docs/243/probe/" + f, fs.readFileSync("docs/240/probe/" + f, "utf8").split("docs/240/probe").join("docs/243/probe"));
console.log(fs.readdirSync("docs/243/probe"), fs.statSync("docs/243/probe/head/index.html").size);
console.log(fs.readFileSync("docs/217-hindring/probe/fixture.mjs", "utf8"));
