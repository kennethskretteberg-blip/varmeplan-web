// 198: måler Status-kolonnen og radhøyden i liste-fixturen (vis1.js) på flere skjermbredder.
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const fix = fs.readFileSync('docs/198/probe/' + (process.env.FIX || 'vis1.js'), 'utf8');
for (const w of [1400, 1100, 900]) {
  const p = await openPage('http://localhost:4000/');
  await p.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
  const r = await p.eval(fix);
  const kol = await p.eval(`[...document.querySelectorAll('#pl-tbody tr:nth-child(3) td')].map(e => Math.round(e.getBoundingClientRect().width)).join(' ')`);
  console.log(w + ' px: statusKol ' + r.statusKol + ', radH ' + r.radH.join('/') + ', kolonner ' + kol + ', linjer ' + JSON.stringify(r.visma));
  if (process.env.SHOT && w === Number(process.env.SHOTW || 1400)) await p.shot(process.env.SHOT);
  await p.close();
}
process.exit(0);
