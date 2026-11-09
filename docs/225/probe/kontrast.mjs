// 225: kontrast (WCAG 2.x) for tokens i lyst og mørkt tema, lest fra den kjørende sida (getComputedStyle),
// før (HEAD-kopi) og etter. Dempet tekst på hvitt (--surface) og på grått (--bg) skal være minst 4,5:1.
//   node -e ' process.env.TAG="etter"; import("./docs/225/probe/kontrast.mjs") '
import fs from 'node:fs';
import { openPage } from './cdpklient.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const p = await openPage(url, 9333, 1);
const ut = await p.eval(`(() => {
  const lum = c => { const m = c.match(/\\d+(\\.\\d+)?/g).map(Number); const [r, g, b] = m.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const kontrast = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return Math.round((h + 0.05) / (l + 0.05) * 100) / 100; };
  const les = navn => { const e = document.createElement('div'); e.style.color = 'var(' + navn + ')'; e.style.backgroundColor = 'var(' + navn + ')'; document.body.appendChild(e); const v = getComputedStyle(e).backgroundColor; e.remove(); return v; };
  const ut = {};
  for (const tema of ['light', 'dark']) {
    document.body.classList.toggle('light-theme', tema === 'light');
    const t = {}; for (const n of ['--bg', '--surface', '--surface2', '--border', '--border-strong', '--text', '--muted', '--dim', '--accent', '--on-accent', '--accent-soft', '--warn', '--success', '--danger', '--info', '--canvas-bg']) t[n] = les(n);
    const par = [['--text', '--surface'], ['--text', '--bg'], ['--muted', '--surface'], ['--muted', '--bg'], ['--muted', '--surface2'], ['--dim', '--surface'], ['--dim', '--bg'], ['--dim', '--surface2'], ['--on-accent', '--accent'], ['--accent', '--surface'], ['--warn', '--surface'], ['--success', '--surface'], ['--danger', '--surface'], ['--info', '--surface'], ['--text', '--canvas-bg'], ['--dim', '--canvas-bg']];
    ut[tema] = { tokens: t, kontrast: Object.fromEntries(par.map(([a, b]) => [a + ' på ' + b, kontrast(t[a], t[b])])) };
  }
  document.body.classList.add('light-theme');
  return ut;
})()`);
fs.writeFileSync(`docs/225/probe/kontrast-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
