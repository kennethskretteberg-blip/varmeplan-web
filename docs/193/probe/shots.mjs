import { openPage } from './cdp.mjs';
const [,, port, tag] = process.argv;
const OUT = process.env.HOME + '/Code/varmeplan-web/docs/193/';
const p = await openPage(`http://localhost:${port}/`);
await p.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 330, deviceScaleFactor: 1.5, mobile: false });
await p.eval(`(async () => { await _loadProducts(); document.getElementById('auth-screen').style.display='none'; document.getElementById('project-list-screen').style.display='none'; document.getElementById('app').style.display=''; return 1; })()`).catch(()=>{});
const T = (n, h) => ({ type: 'steps', width_cm: 100, stepDepth_cm: 30, stepHeight_cm: h || 17, stepCount: n });
const L = () => ({ type: 'landing', width_cm: 100, depth_cm: 90 });
const C = [['repos-6', [L(), T(6)]], ['4-repos-4', [T(4), L(), T(4)]], ['4-repos-4x18', [T(4), L(), T(4, 18)]], ['6-repos', [T(6), L()]]];
for (const dir of ['bottom', 'top']) for (const [k, segs] of C) {
  const r = await p.eval(`(() => {
    const segs = ${JSON.stringify(segs)};
    S.counters.nextStairId = 990901; const st = _createStairObj({ name: 'Trapp', segments: JSON.parse(JSON.stringify(segs)), buildDirection: '${dir}', riserOffset_cm: 2, noseOffset_cm: 2, edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, width_cm: 100, step_height_cm: segs.find(s => s.type === 'steps').stepHeight_cm });
    _regenerateStairCable(st);
    const url = _stairDrawSideToCanvas(st, {}).toDataURL('image/png');
    _stairBuilderSegs = segs; _stairBuilderDir = '${dir}';
    let d = document.getElementById('v193'); if (!d) { d = document.createElement('div'); d.id = 'v193'; document.body.appendChild(d); }
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;color:#111;font:14px sans-serif;padding:12px;display:grid;grid-template-columns:470px 1fr;gap:16px;align-content:start';
    d.innerHTML = '<div><b>Byggeren: ' + _stairBuilderStats().totalHeight + ' cm høyde</b> (${dir === 'top' ? 'Ovenfra og ned' : 'Nedenfra og opp'})<div style="margin-top:8px;border:1px solid #ccc">' + _stairBuilderPreviewSVG() + '</div></div>'
      + '<div><b>Tegningen: kjeden ' + _stairSideTotalHeightCm(st) + ' cm</b><div style="margin-top:8px"><img src="' + url + '" style="max-width:100%;max-height:260px"></div></div>';
    return _stairBuilderStats().totalHeight + ' / ' + _stairSideTotalHeightCm(st); })()`);
  console.log(dir, k, r);
  await new Promise(r => setTimeout(r, 150));
  await p.shot(OUT + `${k}-${dir === 'top' ? 'ovenfra' : 'nedenfra'}-${tag}.png`);
}
await p.close(); process.exit(0);
