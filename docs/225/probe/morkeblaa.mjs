// 225: beviser at oppskriften for mørkeblå toppstripe («225 · TOPPSTRIPE» i CSS-en) virker — de tre linjene
// legges inn som et <style> i den kjørende sida, og verktøylinja fotograferes. Ikke en del av leveransen.
//   node -e ' import("./docs/225/probe/morkeblaa.mjs") '
import { openPage, sov } from './cdpklient.mjs';
import { FIX, VIS_PROSJEKT } from '../../224/probe/fixture.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4013/', 9333, 2);
await p.eval(`(() => { S.varmefolie.gapCm = 2; ${FIX} return 1; })()`);
await p.eval(`document.fonts.ready.then(() => 1)`);
await p.eval(VIS_PROSJEKT);
const r = await p.eval(`(() => {
  const st = document.createElement('style'); st.id = 'variant-225';
  st.textContent = 'body.light-theme{--tb-bg:#0f365a;--tb-fg:#ffffff;--tb-line:#0f365a}\\n' +
    'body.light-theme #topbar{--surface2:rgba(255,255,255,.1);--border:rgba(255,255,255,.22);--border-strong:rgba(255,255,255,.3);--muted:rgba(255,255,255,.85);--text:#fff;--dim:rgba(255,255,255,.7)}\\n' +
    'body.light-theme #topbar .tb-logo{color:#fff}';
  document.head.appendChild(st);
  const tb = document.getElementById('topbar');
  return { bg: getComputedStyle(tb).backgroundColor, logo: getComputedStyle(tb.querySelector('.tb-logo')).color, knapp: getComputedStyle(tb.querySelector('.snap-chip:not(.on)')).color, valgt: getComputedStyle(tb.querySelector('.snap-chip.on')).backgroundColor };
})()`);
await sov(300);
await p.shot('docs/225/variant-morkeblaa-toppstripe.png');
await p.shot('docs/225/variant-morkeblaa-verktoylinje-2x.png', { x: 0, y: 0, width: 700, height: 60, scale: 2 });
console.log(JSON.stringify(r));
await p.close(); process.exit(0);
