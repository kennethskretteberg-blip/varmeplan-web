const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('treff ' + n + ': ' + a.slice(0, 80)); s = s.replace(a, () => b); };

// 1) hjelpere for løp-knappene
rep(`  const pv = p => !p ? '' : p.source === 'USER_CONFIRMED' ? 'rettet' : p.source === 'ESTIMATE' ? 'standard' : p.source.toLowerCase();
  const G = _takFeats(t, 'GUTTER'), D = _takFeats(t, 'DOWNSPOUT'), V = _takFeats(t, 'VALLEY_GUTTER');`,
`  const pv = p => !p ? '' : p.source === 'USER_CONFIRMED' ? 'rettet' : p.source === 'ESTIMATE' ? 'standard' : p.source.toLowerCase();
  // 207: løp-velger «1 | 2». Valgt knapp er fylt; et objekt på standardverdien får tittelen «standard».
  const runsSel = (o) => \`<span class="tak-runs" data-id="\${o.id}" title="\${o.runs_src === 'user' ? 'valgt' : 'standard'}: \${o.runs} løp" style="display:inline-flex;white-space:nowrap">\` +
    [1, 2].map(n => \`<button class="tak-runs-\${n}" \${o.runs === n ? 'aria-pressed="true"' : ''} onclick="_takSetRuns(\${fid},'\${o.id}',\${n})" style="border:1px solid \${TAK_FEAT_COLOR.GUTTER};background:\${o.runs === n ? TAK_FEAT_COLOR.GUTTER : 'transparent'};color:\${o.runs === n ? '#fff' : 'var(--text)'};font-size:10px;line-height:13px;padding:0 4px;cursor:pointer;border-radius:\${n === 1 ? '3px 0 0 3px' : '0 3px 3px 0'}\${n === 2 ? ';margin-left:-1px' : ''}">\${n}</button>\`).join('') + '</span>';
  const km = v => v == null ? '—' : _takNum(v, 2);
  const G = _takFeats(t, 'GUTTER'), D = _takFeats(t, 'DOWNSPOUT'), V = _takFeats(t, 'VALLEY_GUTTER');`);

// 2) delstrekk-tabellen: alltid, med løp og kabel
rep(`    if (segs.length > 1) {
      h += \`<table class="tak-seg" style="width:100%;font-size:11px;border-collapse:collapse;margin-top:1px">\` +
        segs.map(sg => \`<tr><td>\${dim(sg.id)}</td><td style="text-align:right">\${dim(_takNum(sg.from_m) + '–' + _takNum(sg.to_m))}</td><td style="text-align:right">\${_takNum(sg.length_m)} m</td></tr>\`).join('') +
        \`<tr style="border-top:1px solid var(--border)"><td>\${dim('sum')}</td><td></td><td style="text-align:right">\${_takNum(segs.reduce((a, b) => a + b.length_m, 0))} m</td></tr></table>\`;
    }`,
`    if (segs.length) {
      // 207: løp per delstrekk. Fra–til står i tittelen (smalt panel).
      h += \`<div class="tak-gutter-runs" style="font-size:10px;color:var(--dim);white-space:nowrap;margin-top:1px">Alle delstrekk: \${_takBtn(\`_takSetGutterRuns(\${fid},'\${g.id}',1)\`, '1 løp')}\${_takBtn(\`_takSetGutterRuns(\${fid},'\${g.id}',2)\`, '2 løp')}</div>\` +
        \`<table class="tak-seg" style="width:100%;font-size:11px;border-collapse:collapse;margin-top:1px"><tr style="font-size:10px">\${['', 'lengde', 'løp', 'kabel'].map((c, i) => \`<td style="text-align:\${i ? (i === 2 ? 'center' : 'right') : 'left'}">\${dim(c)}</td>\`).join('')}</tr>\` +
        segs.map(sg => \`<tr class="tak-seg-row" data-id="\${sg.id}"><td title="\${_takNum(sg.from_m)}–\${_takNum(sg.to_m)} m fra start">\${dim(sg.id)}</td><td style="text-align:right">\${_takNum(sg.length_m)} m</td><td style="text-align:center">\${runsSel(sg)}</td><td style="text-align:right">\${km(sg.cable_total_m)}</td></tr>\`).join('') +
        (segs.length > 1 ? \`<tr style="border-top:1px solid var(--border)"><td>\${dim('sum')}</td><td style="text-align:right">\${_takNum(segs.reduce((a, b) => a + b.length_m, 0))} m</td><td></td><td style="text-align:right"><b>\${km(g.cable_total_m)}</b></td></tr>\` : '') + '</table>';
    }`);

// 3) nedløpet: løp + kabel × løp
rep(`        <div style="white-space:nowrap">\${dim('Kabel:')} <b class="tak-cable">\${d.cable_m == null ? '—' : _takNum(d.cable_m, 2) + ' m'}</b></div><div style="font-size:10px;color:var(--dim)">\${under ? 'over + under bakken' : 'høyde + 0,05'}</div></div>\`;`,
`        <div style="display:flex;align-items:center;justify-content:space-between;white-space:nowrap">\${dim('Løp')}\${runsSel(d)}</div>
        <div style="white-space:nowrap">\${dim('Kabel:')} <b class="tak-cable">\${d.cable_m == null ? '—' : _takNum(d.cable_m, 2) + ' m'}</b> \${dim('× ' + d.runs + ' =')} <b class="tak-cable-total">\${km(d.cable_total_m)} m</b></div><div style="font-size:10px;color:var(--dim)">\${under ? 'over + under bakken' : 'høyde + 0,05'}, per løp</div></div>\`;`);

// 4) gradrenna: løp
rep(`      \${noZ ? warn('Høyde mangler — lengden er målt i plan og blir for kort på et skrått tak.') : ''}</div>\`;
  }
  return h + '</div>';
}`,
`      <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;white-space:nowrap">\${dim('Løp')}\${runsSel(v)}<span>\${dim('kabel')} <b class="tak-cable-total">\${km(v.cable_total_m)} m</b></span></div>
      \${noZ ? warn('Høyde mangler — lengden er målt i plan og blir for kort på et skrått tak.') : ''}</div>\`;
  }
  h += _takCableSumHtml(t);
  return h + '</div>';
}
/** 207: tabellen «Kabelmeter» — objekt, lengde, løp, kabelmeter, sum nederst. Regnes ved hver tegning av panelet. */
function _takCableSumHtml(t) {
  const S7 = _takCableSummary(t);
  if (!S7.rows.length) return '';
  const dim = x => \`<span style="color:var(--dim)">\${x}</span>\`;
  const km = v => v == null ? '—' : _takNum(v, 2);
  const name = r => r.kind === 'segment' ? 'Renne ' + r.id : r.kind === 'DOWNSPOUT' ? 'Nedløp ' + r.id : 'Gradrenne ' + r.id;
  const c = S7.circuit;
  return \`<div class="tak-cable-sum" style="margin-top:6px;border-top:1px solid var(--border);padding-top:4px">
    <div style="font-weight:700">Kabelmeter</div>
    <table class="tak-cable-table" style="width:100%;font-size:11px;border-collapse:collapse">
      <tr style="font-size:10px"><td>\${dim('objekt')}</td><td style="text-align:right">\${dim('lengde')}</td><td style="text-align:center">\${dim('løp')}</td><td style="text-align:right">\${dim('kabel')}</td></tr>
      \${S7.rows.map(r => \`<tr class="tak-cable-row" data-id="\${r.id}"><td style="white-space:nowrap">\${name(r)}</td><td style="text-align:right">\${km(r.length_m)}</td><td style="text-align:center">\${r.runs}</td><td style="text-align:right">\${km(r.cable_m)}</td></tr>\`).join('')}
      <tr style="border-top:1px solid var(--border)"><td><b>Sum</b></td><td></td><td></td><td style="text-align:right;white-space:nowrap"><b class="tak-cable-sum-total">\${_takNum(S7.total_m, 2)} m</b></td></tr>
    </table>
    \${S7.missing.length ? \`<div style="color:var(--warn,#d97706);font-size:11px">⚠ Summen mangler \${S7.missing.join(', ')} (høyden er ikke kjent).</div>\` : ''}
    <div class="tak-cable-note" style="font-size:10px;color:var(--dim)">\${c.note || ''}</div>
    <div class="tak-circuit" style="font-size:10px;color:var(--dim)">Kurslengde: \${c.limit_m == null ? 'grense ikke satt' : _takNum(c.limit_m) + ' m'}</div>
  </div>\`;
}`);
fs.writeFileSync('index.html', s);
console.log('ok');
