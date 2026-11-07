const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('treff ' + n + ': ' + a.slice(0, 80)); s = s.replace(a, () => b); };
// hurtigvalg: små knapper på én linje
rep("Alle delstrekk: \${_takBtn(\`_takSetGutterRuns(\${fid},'\${g.id}',1)\`, '1 løp')}\${_takBtn(\`_takSetGutterRuns(\${fid},'\${g.id}',2)\`, '2 løp')}</div>\`",
    "Alle delstrekk: \${[1, 2].map(n => \`<button title=\"Alle delstrekk \${n} løp\" onclick=\"_takSetGutterRuns(\${fid},'\${g.id}',\${n})\" style=\"border:1px solid var(--border);background:transparent;color:var(--text);font-size:10px;line-height:13px;padding:0 4px;margin-left:3px;border-radius:3px;cursor:pointer\">\${n} løp</button>\`).join('')}</div>\`");
// delstrekk-tabellen: 10 px, uten «m» i radene
rep(`<table class="tak-seg" style="width:100%;font-size:11px;border-collapse:collapse;margin-top:1px">`, `<table class="tak-seg" style="width:100%;font-size:10px;border-collapse:collapse;margin-top:1px">`);
rep("<td style=\"text-align:right\">\${_takNum(sg.length_m)} m</td><td style=\"text-align:center\">\${runsSel(sg)}</td>", "<td style=\"text-align:right\">\${_takNum(sg.length_m)}</td><td style=\"text-align:center;padding:0 2px\">\${runsSel(sg)}</td>");
// nedløpet: kabel på to linjer
rep("<div style=\"white-space:nowrap\">\${dim('Kabel:')} <b class=\"tak-cable\">\${d.cable_m == null ? '—' : _takNum(d.cable_m, 2) + ' m'}</b> \${dim('× ' + d.runs + ' =')} <b class=\"tak-cable-total\">\${km(d.cable_total_m)} m</b></div><div style=\"font-size:10px;color:var(--dim)\">\${under ? 'over + under bakken' : 'høyde + 0,05'}, per løp</div></div>\`;",
    "<div style=\"white-space:nowrap\">\${dim('Kabel per løp:')} <b class=\"tak-cable\">\${d.cable_m == null ? '—' : _takNum(d.cable_m, 2) + ' m'}</b></div><div style=\"font-size:10px;color:var(--dim)\">\${under ? 'over + under bakken' : 'høyde + 0,05'}</div>\n        <div style=\"white-space:nowrap;text-align:right\">\${dim('× ' + d.runs + ' løp =')} <b class=\"tak-cable-total\">\${km(d.cable_total_m)} m</b></div></div>\`;");
// gradrenna: kabel på egen linje
rep("<div style=\"display:flex;align-items:center;justify-content:space-between;font-size:11px;white-space:nowrap\">\${dim('Løp')}\${runsSel(v)}<span>\${dim('kabel')} <b class=\"tak-cable-total\">\${km(v.cable_total_m)} m</b></span></div>",
    "<div style=\"display:flex;align-items:center;justify-content:space-between;font-size:11px;white-space:nowrap\">\${dim('Løp')}\${runsSel(v)}</div><div style=\"font-size:11px;white-space:nowrap;text-align:right\">\${dim('kabel')} <b class=\"tak-cable-total\">\${km(v.cable_total_m)} m</b></div>");
// kabelmeter-tabellen: korte navn, 10 px
rep("const name = r => r.kind === 'segment' ? 'Renne ' + r.id : r.kind === 'DOWNSPOUT' ? 'Nedløp ' + r.id : 'Gradrenne ' + r.id;",
    "const name = r => r.kind === 'segment' ? r.id : r.kind === 'DOWNSPOUT' ? '↓ ' + r.id : '◇ ' + r.id;   // smalt panel: r1.1 = delstrekk, ↓ = nedløp, ◇ = gradrenne");
rep(`<table class="tak-cable-table" style="width:100%;font-size:11px;border-collapse:collapse">`, `<table class="tak-cable-table" style="width:100%;font-size:10px;border-collapse:collapse">`);
rep("<tr class=\"tak-cable-row\" data-id=\"\${r.id}\"><td style=\"white-space:nowrap\">\${name(r)}</td>",
    "<tr class=\"tak-cable-row\" data-id=\"\${r.id}\"><td style=\"white-space:nowrap\" title=\"\${r.kind === 'segment' ? 'Delstrekk av renne ' + r.of : r.kind === 'DOWNSPOUT' ? 'Nedløp på ' + r.of + ' (lengde per løp)' : 'Gradrenne'}\">\${name(r)}</td>");
fs.writeFileSync('index.html', s); console.log('ok');
