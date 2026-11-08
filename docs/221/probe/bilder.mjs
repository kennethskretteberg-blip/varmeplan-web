// 221: bilder på vanlig skjerm (1920 × 1080), og en sjekk av forhåndsvisningen etter at lista ble delt.
import { aapne, sov, FILM, LFORM } from './oppsett.mjs';
import { openPage } from './cdp.mjs';
for (const [fix, navn] of [[FILM, 'filmens-bygg'], [LFORM, 'l-form']]) {
  const p = await aapne({ fix, w: 1920, h: 1080, steg: 4 });
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(500);
  await p.shot(`docs/221/1920-${navn}.png`);
  console.log(navn, await p.eval(`({ zoom: S.view.zoom, cw: canvas.width, synlig: _tak3dOmrissSynlig(__fid) })`));
  await p.close();
}
const v = await openPage('http://localhost:4000/docs/3d/forhandsvisning.html'); await sov(2500);
console.log('forhåndsvisning', await v.eval(`({ ferdig: !!(window.__vis && window.__vis.ferdig), sum: document.querySelector('#liste tr.sum td:last-child').textContent, feil: document.getElementById('feil').textContent })`));
await v.close(); process.exit(0);
