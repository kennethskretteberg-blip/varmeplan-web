const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('treff ' + n + ': ' + a.slice(0, 80)); s = s.replace(a, () => b); };
// Delstrekk-etikett med løp
rep(`    if (segs.length > 1) segs.forEach(sg => { if (Math.abs(w2s(0, 0).x - w2s(sg.length_m * 100, 0).x) > 34) lab((sg.from_m + sg.to_m) / 2, _takNum(sg.length_m), false); });
    else lab(g.length_m / 2, _takNum(g.length_m) + ' m', true);`,
`    // 207: «×2» = to løp i renna på det delstrekket.
    if (segs.length > 1) segs.forEach(sg => { if (Math.abs(w2s(0, 0).x - w2s(sg.length_m * 100, 0).x) > 46) lab((sg.from_m + sg.to_m) / 2, _takNum(sg.length_m) + (sg.runs ? ' ×' + sg.runs : ''), false); });
    else lab(g.length_m / 2, _takNum(g.length_m) + ' m' + (segs[0] && segs[0].runs ? ' ×' + segs[0].runs : ''), true);`);
rep(`    _takLabel(_takDownpipeLabel(d), o.x + o.n.x * 30, o.y + o.n.y * 30, under ? '#7c2d12' : c, true);`,
    `    _takLabel(_takDownpipeLabel(d) + (d.runs ? ' ×' + d.runs : ''), o.x + o.n.x * 30, o.y + o.n.y * 30, under ? '#7c2d12' : c, true);`);
rep(`    _takLabel(_takNum(v.length_m) + ' m', m.x + 14, m.y - 10, c, true);`,
    `    _takLabel(_takNum(v.length_m) + ' m' + (v.runs ? ' ×' + v.runs : ''), m.x + 14, m.y - 10, c, true);`);
// Forhåndsvisning: kabelmeter mens du tegner (standard løp, før klikket)
rep(`        if (Math.abs(s1 - s0) > 0.001) _takLabel(_takNum(Math.abs(s1 - s0)) + ' m', q.x + 16, q.y - 14, col, true);`,
    `        if (Math.abs(s1 - s0) > 0.001) {
          _takLabel(_takNum(Math.abs(s1 - s0)) + ' m', q.x + 16, q.y - 14, col, true);
          // 207: hva strekket gir i kabel med standard løp, og hva totalen blir.
          if (h.ok) { const add = Math.abs(s1 - s0) * TAK_RUNS_DEFAULT.segment; _takLabel(\`+\${_takNum(add)} m kabel (×\${TAK_RUNS_DEFAULT.segment}) → \${_takNum(_takCableSummary(t).total_m + add)} m\`, q.x + 16, q.y + 2, col, false); }
        }`);
rep(`        _takLabel(_takNum(F.hover.s) + ' m fra start', q.x + n.x * 30, q.y + n.y * 30, TAK_FEAT_COLOR.DOWNSPOUT, false); }`,
    `        _takLabel(_takNum(F.hover.s) + ' m fra start', q.x + n.x * 30, q.y + n.y * 30, TAK_FEAT_COLOR.DOWNSPOUT, false);
        // 207: nedløpet med standard høyde og løp — hva det legger til.
        const sf = _takSurface(fid), ev = sf && sf.heights && sf.heights.eave_m;
        if (ev && ev.value != null) { const add = (ev.value + TAK_DOWNPIPE_TAIL_M) * TAK_RUNS_DEFAULT.DOWNSPOUT; _takLabel(\`+\${_takNum(add)} m kabel (×\${TAK_RUNS_DEFAULT.DOWNSPOUT}) → \${_takNum(_takCableSummary(t).total_m + add)} m\`, q.x + n.x * 30, q.y + n.y * 30 + 15, TAK_FEAT_COLOR.DOWNSPOUT, false); } }`);
// Gradrenne-forhåndsvisning
rep(`      if (F.pts.length) { const a = w2s(F.pts[0].x, F.pts[0].y); ctx.setLineDash([6, 4]); line([a, q], TAK_FEAT_COLOR.VALLEY_GUTTER, 4); ctx.setLineDash([]); }`,
    `      if (F.pts.length) { const a = w2s(F.pts[0].x, F.pts[0].y); ctx.setLineDash([6, 4]); line([a, q], TAK_FEAT_COLOR.VALLEY_GUTTER, 4); ctx.setLineDash([]);
        const pl = Math.hypot(F.hover.pt.x - F.pts[0].x, F.hover.pt.y - F.pts[0].y) / 100;   // i plan — 3D-lengden kommer når den er lagt
        if (pl > 0.05) _takLabel(\`\${_takNum(pl)} m i plan · ×\${TAK_RUNS_DEFAULT.VALLEY_GUTTER}\`, q.x + 16, q.y - 14, TAK_FEAT_COLOR.VALLEY_GUTTER, false); }`);
// Lasting: avledede felt (løp, kabelmeter) for tak lagret før 207
rep(`  for (const k in S.tak) _takNormalize(S.tak[k]);   // 205: 204-tak hadde edges per flate → ett nivå opp`,
    `  for (const k in S.tak) { _takNormalize(S.tak[k]); _takRecalc(S.tak[k]); }   // 205: edges ett nivå opp · 207: løp/kabelmeter for tak lagret før 207`);
fs.writeFileSync('index.html', s);
console.log('ok');
