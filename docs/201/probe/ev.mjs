// 198: kjører et uttrykk (fil i argv) i en ny fane og skriver svaret. Bruk:
//   node -e ' process.env.F="docs/201/probe/x.js"; import("./docs/201/probe/ev.mjs") '
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
try {
  const r = await p.eval(fs.readFileSync(process.env.F, 'utf8'));
  console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 1));
  if (process.env.SHOT) await p.shot(process.env.SHOT);
} catch (e) { console.log('FEIL', e.message); }
await p.close(); process.exit(0);
