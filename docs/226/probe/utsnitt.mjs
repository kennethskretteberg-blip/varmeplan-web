// 226: beskjærer et utsnitt av en PNG (fra pdftoppm) via headless Chrome, valgfritt forstørret.
//   node docs/226/probe/utsnitt.mjs <inn.png> <x> <y> <w> <h> <ut.png> [forstørrelse]
// Inn-fila leses via serveren på 4013 (docs/… er statisk), så stien må ligge under worktreet.
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
const [inn, x, y, w, h, ut, zoom] = process.argv.slice(2);
const Z = Number(zoom || 1);
// Siden må ha samme opprinnelse som bildet (about:blank er «opaque» → getImageData/toDataURL sperres).
const p = await openPage('http://localhost:4013/__build.json', 9333, 1);
const url = 'http://localhost:4013/' + inn.replace(/^\.?\//, '');
const b64 = await p.eval(`new Promise((res, rej) => { const im = new Image();
  im.onload = () => { const c = document.createElement('canvas'); c.width = Math.round(${w} * ${Z}); c.height = Math.round(${h} * ${Z});
    const g = c.getContext('2d'); g.imageSmoothingEnabled = ${Z} < 1; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(im, ${x}, ${y}, ${w}, ${h}, 0, 0, c.width, c.height); res(c.toDataURL('image/png').split(',')[1]); };
  im.onerror = e => rej(new Error('kunne ikke laste ' + ${JSON.stringify(url)})); im.src = ${JSON.stringify(url)}; })`);
fs.writeFileSync(ut, Buffer.from(b64, 'base64'));
console.log(ut, fs.statSync(ut).size, 'bytes');
await p.close(); process.exit(0);
