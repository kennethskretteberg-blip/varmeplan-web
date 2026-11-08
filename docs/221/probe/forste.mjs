// 221: tid fra trykk på 3D til modellen står, første gang i en ny fane.
import { aapne, sov } from './oppsett.mjs';
const p = await aapne(); await p.send('Network.setCacheDisabled', { cacheDisabled: true });
const t = Date.now(); await p.clickSel('.tak3d-chip'); await p.klar(); console.log('uten nettleserbuffer:', Date.now() - t, 'ms');
await p.close(); process.exit(0);
