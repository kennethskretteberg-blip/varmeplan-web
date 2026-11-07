import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const [,, port, ...files] = process.argv;
const p = await openPage(`http://localhost:${port}/`);
await p.eval(`(async () => { await _loadProducts(); document.getElementById('auth-screen').style.display='none'; document.getElementById('project-list-screen').style.display='none'; document.getElementById('app').style.display='flex'; window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; return 1; })()`);
let r;
for (const f of files) { try { r = await p.eval(fs.readFileSync(f, 'utf8')); } catch (e) { r = { FEIL: e.message }; } }
const s = JSON.stringify(r, null, 1); if (process.env.OUT) fs.writeFileSync(process.env.OUT, s); console.log(s.slice(0, 20000));
await p.close(); process.exit(0);
