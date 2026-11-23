// 243: er før- og etter-bildene bit-like?
const fs = require("fs");
for (const k of (process.env.K || "lrom-normal,lrom-xstor,nisje-normal,nisjefolie-normal").split(",")) console.log(k, fs.readFileSync("docs/243/foer-" + k + ".png").equals(fs.readFileSync("docs/243/etter-" + k + ".png")) ? "BIT-LIK" : "ulik");
