// 221: ruta med ekte mus og tastatur (CDP). Skriver docs/221/probe/ekte.json og skjermbilder.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { aapne, sov, FILM, LFORM } from './oppsett.mjs';
const R = [], sjekk = (navn, ok, fikk) => { R.push({ navn, ok: !!ok, fikk }); console.log((ok ? '  ok ' : '  ✗  ') + navn + (ok ? '' : '  → ' + JSON.stringify(fikk))); };
const h = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const museDra = async (p, x0, y0, x1, y1, knapp = 'left') => {
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0, y: y0 });
  await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: knapp, buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 8; i++) { await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + (x1 - x0) * i / 8, y: y0 + (y1 - y0) * i / 8, button: knapp, buttons: 1 }); await sov(25); }
  await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x1, y: y1, button: knapp, buttons: 0, clickCount: 1 });
};
const esc = p => p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
const boks = (p, sel) => p.eval(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; })()`);
const lagring = p => p.eval(`(() => { const j = _buildSaveData(); delete j.savedAt; delete j._savedAt; return JSON.stringify(j).replace(/"(updatedAt|savedAt|createdAt|created_at|stampedAt)":("[^"]*"|\\d+),?/g, ''); })()`);
const takTekst = p => p.eval(`JSON.stringify(S.tak)`);
const sumTekst = p => p.eval(`(() => { const r = [...document.querySelectorAll('#tak3d-liste tr.sum td')]; return r.length ? r[1].textContent : null; })()`);

console.log('A · delt skjerm');
{
  const p = await aapne();
  await p.eval(`try { localStorage.removeItem('varmeplan_tak3d_andel'); } catch (e) {}`);
  sjekk('steg 3: knappen står i verktøylinja, ruta er av', await p.eval(`!!document.querySelector('#ctxbar .tak3d-chip') && !document.getElementById('tak3d-pane')`));
  const v0 = await boks(p, '#canvas-wrap');
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(400);
  const a = await boks(p, '#canvas-wrap'), b = await boks(p, '#tak3d-pane');
  sjekk('2D til venstre, 3D til høyre', a.r <= b.l && b.r === v0.r, { a, b });
  sjekk('standard 50/50', Math.abs(a.w - b.w) <= 8, [a.w, b.w]);
  sjekk('lerretet følger ruta (backing = CSS)', await p.eval(`canvas.width === document.getElementById('canvas-wrap').clientWidth`), await p.eval(`canvas.width`));
  sjekk('three-lerretet fyller visningen', await p.eval(`(() => { const v = document.getElementById('tak3d-view'), c = v.querySelector('canvas'); return c.clientWidth === v.clientWidth && c.clientHeight === v.clientHeight; })()`));
  await p.shot('docs/221/delt-filmens-bygg-strek.png');
  const s = await boks(p, '#tak3d-split');
  await museDra(p, s.l + 3, 500, s.l - 150, 500); await sov(300);
  const a2 = await boks(p, '#canvas-wrap'), b2 = await boks(p, '#tak3d-pane');
  sjekk('skillelinja kan dras (ruta blir bredere)', b2.w > b.w + 120 && a2.w < a.w - 120, [a2.w, b2.w]);
  sjekk('lerretet har fulgt draget', await p.eval(`canvas.width === document.getElementById('canvas-wrap').clientWidth`));
  const andel = await p.eval(`localStorage.getItem('varmeplan_tak3d_andel')`);
  sjekk('forholdet er lagret', Math.abs(+andel - b2.w / (a2.w + b2.w + 6)) < 0.02, andel);
  await p.clickSel('.tak3d-chip'); await sov(200);
  sjekk('nytt trykk på 3D lukker', await p.eval(`!document.getElementById('tak3d-pane') && !document.getElementById('tak3d-split') && _tak3d === null`));
  await sov(150);
  sjekk('lerretet har fått hele bredden tilbake', (await boks(p, '#canvas-wrap')).w === v0.w);
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(250);
  sjekk('forholdet huskes ved ny åpning', Math.abs((await boks(p, '#tak3d-pane')).w - b2.w) <= 2, (await boks(p, '#tak3d-pane')).w);
  await p.close();
  const p2 = await aapne();
  sjekk('forholdet ligger utenfor prosjektet (ny fane, nytt prosjekt)', await p2.eval(`localStorage.getItem('varmeplan_tak3d_andel')`) === andel);
  await p2.eval(`localStorage.removeItem('varmeplan_tak3d_andel')`);
  await p2.close();
}
console.log('B · Esc og hvor knappen finnes');
{
  const p = await aapne();
  await p.clickSel('.tak3d-chip'); await p.klar();
  await p.eval(`_takFeatStart(window.__fid, 'downspout')`); await sov(80);
  await esc(p); await sov(120);
  sjekk('Esc med verktøy på: verktøyet slås av, ruta står', await p.eval(`!_takFeat && !!_tak3d`));
  await esc(p); await sov(120);
  sjekk('Esc uten verktøy: ruta lukkes', await p.eval(`_tak3d === null && !document.getElementById('tak3d-pane')`));
  for (const n of [2, 3, 4]) { await p.eval(`_takStepGo(window.__fid, ${n})`); await sov(60); sjekk(`steg ${n}: knappen finnes (DOM)`, await p.eval(`!!document.querySelector('#ctxbar .tak3d-chip')`)); }
  await p.eval(`_takStepGo(window.__fid, 1)`); await sov(60);
  sjekk('steg 1: ingen knapp (DOM)', await p.eval(`!document.querySelector('#ctxbar .tak3d-chip')`));
  await p.eval(`_takStepGo(window.__fid, 3)`); await sov(60);
  await p.clickSel('.tak3d-chip'); await p.klar();
  await p.eval(`_takStepGo(window.__fid, 1)`); await sov(400);
  sjekk('går du til steg 1, lukkes ruta (ingen knapp å lukke den med)', await p.eval(`_tak3d === null && !document.getElementById('tak3d-pane')`));
  await p.close();
}
console.log('C · smal skjerm');
{
  const p = await aapne({ w: 820, h: 900 });
  const v0 = await boks(p, '#canvas-wrap');
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(400);
  const b = await boks(p, '#tak3d-pane'), a = await boks(p, '#canvas-wrap');
  sjekk('ikke delt: ruta dekker lerretet, ingen skillelinje', b.w === a.w && a.w === v0.w && await p.eval(`getComputedStyle(document.getElementById('tak3d-split')).display === 'none'`), { a, b });
  sjekk('knappen sier 2D, og er fortsatt synlig over ruta', await p.eval(`(() => { const c = document.querySelector('.tak3d-chip'), r = c.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return c.textContent === '2D' && (t === c || c.contains(t)); })()`));
  await p.shot('docs/221/smal-3d.png');
  await p.clickSel('.tak3d-chip'); await sov(250);
  sjekk('trykk på 2D: tilbake til tegningen', await p.eval(`!document.getElementById('tak3d-pane') && document.querySelector('.tak3d-chip').textContent === '3D'`));
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false }); await sov(200);
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(200);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 820, height: 900, deviceScaleFactor: 1, mobile: false }); await sov(400);
  sjekk('vindu smalnes med åpen rute: går over til enkeltvisning og beholder modellen', await p.eval(`_tak3d.smal && !!_tak3d.view.querySelector('canvas') && document.querySelector('.tak3d-chip').textContent === '2D'`));
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false }); await sov(400);
  sjekk('og tilbake til delt', await p.eval(`!_tak3d.smal && document.getElementById('canvas-wrap').nextElementSibling.id === 'tak3d-split'`));
  await p.close();
}
console.log('D · 3D følger 2D');
{
  const p = await aapne();
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(300);
  const før = await sumTekst(p), nFør = await p.eval(`S.tak[__fid].features.filter(f => f.type === 'DOWNSPOUT').length`);
  sjekk('sum før = 110,15 m', før === '110,15 m', før);
  const pt = await p.eval(`(() => { const g = S.tak[__fid].features.find(f => f.type === 'GUTTER'), a = g.geometry.pts[0], b = g.geometry.pts[g.geometry.pts.length - 1], k = 0.3, s = w2s(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k), r = canvas.getBoundingClientRect(); return { x: r.left + s.x * r.width / canvas.width, y: r.top + s.y * r.height / canvas.height }; })()`);
  await p.eval(`_takFeatStart(window.__fid, 'downspout')`); await sov(400);
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y }); await sov(400);
  await p.eval(`window.__t0 = 0; window.__obs = new MutationObserver(() => { if (window.__t0 && !window.__t1) window.__t1 = performance.now(); }); window.__obs.observe(document.getElementById('tak3d-liste'), { childList: true, subtree: true, characterData: true }); window.__nett = S.tak[__fid].features.length;
    window.__vakt = setInterval(() => { if (!window.__t0 && S.tak[__fid].features.length !== window.__nett) window.__t0 = performance.now(); }, 5);`);
  await p.click(pt.x, pt.y);
  for (let t = 0; t < 3000; t += 50) { await sov(50); if (await p.eval(`!!window.__t1`)) break; }
  const ms = await p.eval(`window.__t1 && window.__t0 ? Math.round(window.__t1 - window.__t0) : null`);
  const nEtter = await p.eval(`S.tak[__fid].features.filter(f => f.type === 'DOWNSPOUT').length`);
  sjekk('nedløpet er tegnet med ekte klikk i 2D', nEtter === nFør + 1, [nFør, nEtter]);
  sjekk('3D viser det innen ett sekund', ms != null && ms < 1000, ms); R.push({ navn: 'målt tid klikk → liste (ms)', ok: true, fikk: ms });
  sjekk('ikke før et halvt sekund etter endringen', ms != null && ms >= 480, ms);
  const etter = await sumTekst(p);
  sjekk('Sum har endret seg', etter !== før, [før, etter]);
  const panel = await p.eval(`_takNum(_takCableSummary(S.tak[__fid]).total_m, 2) + ' m'`);
  sjekk('Sum er lik panelet i 2D etter endringen', etter === panel, [etter, panel]);
  sjekk('nytt nedløp står i lista', await p.eval(`document.getElementById('tak3d-liste').textContent.includes(S.tak[__fid].features.filter(f => f.type === 'DOWNSPOUT').pop().id + ' · ')`));
  await p.eval(`_takFeatStop()`);
  // Mange endringer på rad: én nybygging, etter den siste.
  await p.eval(`window.__n = 0; const o = _tak3d.vis.settScene; _tak3d.vis.settScene = function (s) { window.__n++; return o.call(this, s); };`);
  for (let i = 0; i < 6; i++) { await p.eval(`S.tak[__fid].features.find(f => f.type === 'DOWNSPOUT').__x = ${i}`); await sov(160); }
  await sov(900);
  sjekk('seks endringer med 160 ms mellomrom gir én nybygging', await p.eval(`window.__n`) === 1, await p.eval(`window.__n`));
  await p.eval(`delete S.tak[__fid].features.find(f => f.type === 'DOWNSPOUT').__x`); await sov(800);
  await p.close();
}
console.log('E · klikk og dra i 3D endrer ingen data');
{
  const p = await aapne();
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(300);
  const før = await takTekst(p), lagFør = await lagring(p), bildeFør = await p.eval(`_tak3d.vis.bilde()`), v = await boks(p, '#tak3d-view');
  const cx = v.l + v.w / 2, cy = v.t + v.h / 2;
  await museDra(p, cx, cy, cx + 140, cy + 60);
  await p.click(cx - 40, cy + 20); await sov(60);
  await p.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: cx, y: cy, deltaX: 0, deltaY: -240 }); await sov(100);
  await museDra(p, cx, cy, cx + 50, cy + 50, 'right'); await sov(800);
  const bildeEtter = await p.eval(`_tak3d.vis.bilde()`);
  sjekk('modellen har faktisk dreid (bildet er endret)', bildeFør !== bildeEtter);
  sjekk('S.tak er byte-lik', await takTekst(p) === før, h(før));
  sjekk('hele lagringen er byte-lik', await lagring(p) === lagFør, h(lagFør));
  // Vinkelen står når scenen bygges på nytt.
  await p.eval(`S.tak[__fid].features.find(f => f.type === 'DOWNSPOUT').above_ground_m.value += 0`);
  const b1 = await p.eval(`_tak3d.vis.bilde()`);
  await p.eval(`(() => { const d = S.tak[__fid].features.find(f => f.type === 'GUTTER'); d.__y = 1; })()`); await sov(900);
  sjekk('nybygging beholder vinkelen brukeren har dreid til', await p.eval(`_tak3d.vis.bilde()`) === b1);
  await p.clickSel('#tak3d-side button:nth-of-type(2)'); await sov(150);
  sjekk('Nullstill vinkel gir standardbildet', await p.eval(`_tak3d.vis.bilde()`) === bildeFør);
  await p.clickSel('#tak3d-farge'); await sov(200);
  const f = await p.eval(`_tak3d.vis.bilde()`);
  sjekk('Farge bytter stil', f !== bildeFør && await p.eval(`document.getElementById('tak3d-farge').getAttribute('aria-pressed') === 'true'`));
  await p.eval(`S.tak[__fid].features.find(f => f.type === 'GUTTER'); delete S.tak[__fid].features.find(f => f.type === 'GUTTER').__y`); await sov(800);
  await p.shot('docs/221/delt-filmens-bygg-farge.png');
  await p.close();
}
console.log('F · målene mot panelet, uenighet, advarsler');
for (const [fix, tall] of [[FILM, '110,15 m'], [LFORM, '97,66 m']]) {
  const p = await aapne({ fix, steg: 4 });
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(300);
  const sum = await sumTekst(p);
  const bar = await p.eval(`document.querySelector('.tak-bar-sum').textContent`);
  const rader = await p.eval(`(() => { const t = S.tak[__fid], m = {}; for (const r of _takCableSummary(t).rows) m[r.id] = _takNum(r.cable_m, 2); return m; })()`);
  const liste = await p.eval(`document.getElementById('tak3d-liste').innerText`);
  sjekk(`${fix}: Sum i 3D = ${tall}`, sum === tall, sum);
  sjekk(`${fix}: panelet i 2D viser samme tall`, bar === 'Kabel ' + tall, bar);
  sjekk(`${fix}: hver kabelrad i 2D-panelet finnes i 3D-lista`, Object.values(rader).every(v => liste.includes(v)), rader);
  sjekk(`${fix}: ingen uenighetslinje`, await p.eval(`document.querySelectorAll('.tak3d-uenig').length`) === 0, await p.eval(`document.getElementById('tak3d-uenig').innerText`));
  await p.shot(`docs/221/delt-${fix === FILM ? 'filmens-bygg' : 'l-form'}-steg4.png`);
  await p.close();
}
{
  const p = await aapne();
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(300);
  const før = await p.eval(`_takNum(S.tak[__fid].features.find(f => f.type === 'GUTTER').length_m, 2)`), sum = await sumTekst(p);
  await p.eval(`(() => { const g = S.tak[__fid].features.find(f => f.type === 'GUTTER'); window.__gid = g.id; g.length_m = 24.8; })()`); await sov(900);
  const linje = await p.eval(`document.getElementById('tak3d-uenig').innerText`), gid = await p.eval(`__gid`);
  sjekk('påtvunget avvik gir linja', linje.includes(`3D og 2D er uenige om ${gid} (${før} mot 24,80 m).`), linje);
  sjekk('appen velger ikke side: det lagrede tallet er urørt', await p.eval(`S.tak[__fid].features.find(f => f.type === 'GUTTER').length_m`) === 24.8);
  sjekk('appen velger ikke side: 3D viser fortsatt geometrien', await p.eval(`document.getElementById('tak3d-liste').innerText.includes(${JSON.stringify(før + ' m')})`) && await sumTekst(p) === sum);
  await p.shot('docs/221/uenig.png');
  await p.close();
}
{
  const q = await aapne({ fix: LFORM });
  await q.eval(`(() => { const t = S.tak[__fid]; t.edges = t.edges.filter(e => e.type !== 'ridge'); for (const e of t.edges) delete e.ridge_link; })()`); await sov(200);
  await q.clickSel('.tak3d-chip'); await q.klar(); await sov(300);
  const adv = await q.eval(`[...document.querySelectorAll('#tak3d-adv .tak3d-adv')].map(e => ({ t: e.textContent, c: getComputedStyle(e).color, f: getComputedStyle(e).fontSize }))`);
  sjekk('L-form uten møne: advarselen står i ruta', adv.some(a => a.t.includes('ingen lagret mønelinje')), adv);
  const ref = await q.eval(`(() => { const d = document.createElement('div'); d.style.cssText = 'color:var(--warn,#d97706);font-size:11px'; document.body.appendChild(d); const s = getComputedStyle(d), r = { c: s.color, f: s.fontSize }; d.remove(); return r; })()`);
  sjekk('samme gule stil som i 2D-panelet', adv[0] && adv[0].c === ref.c && adv[0].f === ref.f, [adv[0], ref]);
  await q.shot('docs/221/l-form-uten-mone.png');
  await q.close();
}
fs.writeFileSync('docs/221/probe/ekte.json', JSON.stringify(R, null, 1));
const f = R.filter(r => !r.ok); console.log(`\nBESTÅTT ${R.length - f.length} av ${R.length}`); process.exit(f.length ? 1 : 0);
