// 225: verktøylinja — knapphøyder, tekststørrelser, valgt tilstand og bredden der sidelengs rulling starter
// (scrollWidth med indoor-modulen, alle grupper synlige), før (HEAD-kopi) og etter, målt ved 1280 og 1400 px.
//   node -e ' process.env.TAG="foer"; process.env.URL0="http://localhost:4013/docs/225/probe/head/index.html"; import("./docs/225/probe/topbar.mjs") '
//   node -e ' process.env.TAG="etter"; import("./docs/225/probe/topbar.mjs") '
import fs from 'node:fs';
import { openPage, sov } from './cdpklient.mjs';
import { FIX, VIS_PROSJEKT } from '../../224/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const ut = {};
for (const w of [1280, 1400]) {
  const p = await openPage(url, 9333, 1, w, 800);
  await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX} return 1; })()`);
  await p.eval(`document.fonts.ready.then(() => 1)`);
  await p.eval(VIS_PROSJEKT);
  await sov(300);
  ut[w] = await p.eval(`(() => {
    const tb = document.getElementById('topbar');
    const knapper = [...tb.querySelectorAll('button')].filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
    const r = b => b.getBoundingClientRect();
    const siste = knapper[knapper.length - 1];
    return { clientWidth: tb.clientWidth, scrollWidth: tb.scrollWidth, ruller: tb.scrollWidth > tb.clientWidth,
      innhold: Math.round(r(siste).right - r(tb).left) + parseFloat(getComputedStyle(tb).paddingRight),
      hoyder: [...new Set(knapper.map(b => Math.round(r(b).height)))], tekst: [...new Set(knapper.map(b => getComputedStyle(b).fontSize))],
      ikonKvadrat: [...tb.querySelectorAll('.file-btn,.zoom-btn')].filter(b => b.offsetParent !== null).every(b => Math.abs(r(b).width - r(b).height) < 0.5),
      valgt: [...tb.querySelectorAll('.snap-chip.on')].map(b => ({ t: b.textContent.trim(), bg: getComputedStyle(b).backgroundColor, fg: getComputedStyle(b).color })),
      antall: knapper.length, tekster: knapper.map(b => b.textContent.trim() || b.title).join(' | ') };
  })()`);
  if (w === 1280) await p.shot(`docs/225/${tag}-verktoylinje-1280.png`, { x: 0, y: 0, width: 1280, height: 58, scale: 2 });
  await p.close();
}
fs.writeFileSync(`docs/225/probe/topbar-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, JSON.stringify(ut, null, 1));
process.exit(0);
