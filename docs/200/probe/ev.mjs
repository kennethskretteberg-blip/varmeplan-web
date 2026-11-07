// 200 (kopi fra 196): kjør et uttrykk i en ny fane. Bruk: node -e ' process.env.X="..."; import("./docs/200/probe/ev.mjs") '
// eller X fra fil: process.env.XF="docs/200/probe/x.js"
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const x = process.env.XF ? fs.readFileSync(process.env.XF, 'utf8') : process.env.X;
const p = await openPage('http://localhost:4000/');
try { console.log(JSON.stringify(await p.eval(x), null, 1)); } catch (e) { console.log('FEIL', e.message); }
await p.close(); process.exit(0);
