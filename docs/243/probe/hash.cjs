// 243: setter commit-hashen inn i rapport, endringslogg og status.  node -e ' process.env.HASH="abc1234"; require("./docs/243/probe/hash.cjs") '
const fs = require("fs");
const h = process.env.HASH; if (!/^[0-9a-f]{7}$/.test(h || "")) throw new Error("HASH");
for (const f of ["docs/243/RAPPORT.md", "docs/endringslogg.md", "STATUS.md"]) { const s = fs.readFileSync(f, "utf8"); const n = s.split("@@HASH@@").length - 1; fs.writeFileSync(f, s.split("@@HASH@@").join(h)); console.log(f, n); }
