// 223: mørkt tema — skjermbilde ved dsf 2 (normal zoom) for å se at rutenettfargene er rolige.
//   node -e ' import("./docs/223/probe/moerk.mjs") '
import { openPage, sov } from './cdp.mjs';
import { FIX } from './fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const p = await openPage(url, 9333, 2);
const r = await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX}
  S.ui.theme = 'dark'; document.body.classList.remove('light-theme'); S.ui.showGrid = true;
  S.view.zoom = 0.6; S.view.panX = 650; S.view.panY = 450; S.ui.selectedRoomId = null; renderSidebar(); updateCtxBar(); render();
  const b = canvas.getBoundingClientRect(); const cs = getComputedStyle(document.body);
  return { x: b.left, y: b.top, width: b.width, height: b.height, farger: ['--canvas-bg', '--grid-fine', '--grid-major', '--grid-axis'].map(v => v + '=' + cs.getPropertyValue(v).trim()), wrapBg: getComputedStyle(document.getElementById('canvas-wrap')).backgroundColor }; })()`);
await sov(250);
await p.shot('docs/223/etter-moerkt-normal.png', { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 });
console.log(JSON.stringify(r));
await p.close(); process.exit(0);
