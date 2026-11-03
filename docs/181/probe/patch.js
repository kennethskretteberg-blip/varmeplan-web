// 181: node docs/181/probe/patch.js index.html  (node-patch, ikke perl — se 180)
const fs = require('fs'); const f = process.argv[2]; let s = fs.readFileSync(f, 'utf8');
const rep = (a, b, n = 1) => { const c = s.split(a).length - 1; if (c !== n) throw new Error('fant ' + c + '× ' + a.slice(0, 120)); s = s.split(a).join(b); };

// 1) Kabelens ratede effekt som egen hjelper — SAMME uttrykk som _roomProductRows alltid har brukt.
rep(`  for (const c of _cablesForRoom(room.id).slice().sort((x, y) => (x.reserve ? 1 : 0) - (y.reserve ? 1 : 0))) {
    const p = HEATING_PRODUCTS.find(pr => pr.id === c.productId);
    const w = p ? (p.total_effect_w || ((p.cable_length_m || 0) * (p.watt_per_m || 0)) || ((c.totalLength_cm / 100) * (p.watt_per_m || 0))) : 0;`,
`  for (const c of _cablesForRoom(room.id).slice().sort((x, y) => (x.reserve ? 1 : 0) - (y.reserve ? 1 : 0))) {
    const p = HEATING_PRODUCTS.find(pr => pr.id === c.productId);
    const w = _cableRatedW(p, c);   // 181: flyttet ut uendret, så kabeloversikten bruker samme tall`);
rep(`function _roomProductRows(room) {
  if (!room) return [];`,
`// 181: ÉN kabels ratede effekt (W) — uttrykket som sto inne i _roomProductRows, uendret: produktets
// merkeeffekt, ellers produktlengde × W/m, ellers tegnet lengde × W/m. Reserven regnes IKKE her
// (kallstedet setter 0 W for den).
function _cableRatedW(p, c) {
  return p ? (p.total_effect_w || ((p.cable_length_m || 0) * (p.watt_per_m || 0)) || ((c.totalLength_cm / 100) * (p.watt_per_m || 0))) : 0;
}
function _roomProductRows(room) {
  if (!room) return [];`);

// 2) Radkilden for kabeloversikten.
rep(`// Norsk tallformat: komma som desimaltegn, hardt mellomrom som tusenskille fra fem sifre`,
`// ── 181 · VARMEKABLER – OVERSIKT (Fredrik 02.11.2026) ────────────────────────────────────────────
// Én rad per KABEL (Romoversikten slår sammen to like kabler til «Ant 2»), bare innendørs-rom —
// snø/frost/trapp har egne sider og er utenfor nå. Ingen nye utregninger:
//   Effekt  = _cableRatedW (samme som _roomProductRows → Romoversikt/romside); reserve = 0 W
//   Lengde  = produktets kabellengde (Romoversiktens «Lengde», det som bestilles); mangler den,
//             kabelens tegnede lengde
//   CC      = kabelens egen spacing_cm
//   W/m²    = rommets ratede effekt ÷ netto gulv, som Romoversikten (romnivå, står på rommets
//             første rad)
// Rekkefølge: etasjer som i PDF-en (_floorLevelCompare), rom i S.rooms-rekkefølge, i rommet
// kablene i K1, K2 … rekkefølge og reserven sist.
function _cableOverviewRows(rooms) {
  const set = new Set((rooms || S.rooms).map(r => r.id));
  const fl = (S.floors || []).slice().sort(_floorLevelCompare);
  const order = [];
  for (const f of fl) for (const r of S.rooms) if (r.floorId === f.id) order.push(r);
  for (const r of S.rooms) if (!fl.some(f => f.id === r.floorId)) order.push(r);
  const out = [];
  for (const room of order) {
    if (!set.has(room.id) || room.listDraft || _roomModuleType(room.id) !== 'indoor') continue;
    const cabs = _cablesForRoom(room.id).slice()
      .sort((a, b) => ((a.reserve ? 1 : 0) - (b.reserve ? 1 : 0)) || ((a.multiCableIndex || 0) - (b.multiCableIndex || 0)));
    if (!cabs.length) continue;
    const nettoM2 = _computeRoomStats(room).nettoM2 || 0;
    const roomWm2 = nettoM2 > 0 ? Math.round(_roomRatedEffectW(room) / nettoM2) : 0;
    const multi = cabs.filter(c => !c.reserve && c.multiCableGroup != null).length >= 2;
    const floor = (S.floors || []).find(f => f.id === room.floorId) || null;
    cabs.forEach((c, i) => {
      const p = HEATING_PRODUCTS.find(pr => pr.id === c.productId) || null;
      const wRaw = c.reserve ? 0 : _cableRatedW(p, c);
      const note = c.reserve ? 'Reserve' : (c.labelOnly ? 'Kalkyle'
        : (multi && c.multiCableGroup != null ? 'K' + ((c.multiCableIndex || 0) + 1) : ''));
      out.push({ room, floor, cable: c, product: p, firstInRoom: i === 0, nettoM2, roomWm2,
        lengthM: (p && p.cable_length_m != null) ? p.cable_length_m : (c.totalLength_cm || 0) / 100,
        effectW: Math.round(wRaw), effectWRaw: wRaw, ccCm: c.spacing_cm > 0 ? c.spacing_cm : null,
        reserve: !!c.reserve, note });
    });
  }
  return out;
}
// Summene under tabellen: antall kabler (inkl. reserve, som materiallista teller), sum lengde,
// sum effekt (urundet summert, rundet til slutt — som romtotalen).
function _cableOverviewTotals(rows) {
  let lengthM = 0, w = 0, reserve = 0;
  for (const r of rows) { lengthM += r.lengthM || 0; w += r.effectWRaw || 0; if (r.reserve) reserve++; }
  return { count: rows.length, reserve, lengthM: Math.round(lengthM * 10) / 10, effectW: Math.round(w) };
}
// Norsk tallformat: komma som desimaltegn, hardt mellomrom som tusenskille fra fem sifre`);

// 3) PDF-siden, rett etter Romoversikten.
rep(`    _pageStarted = true;
  } // end if (opts.roomTable)
`,
`    _pageStarted = true;
  } // end if (opts.roomTable)

  // ── 181 · Varmekabler – oversikt ── (only when selected AND an indoor room has cable)
  // Rett etter Romoversikten: den er «romlista hvor kablene også dukker opp», og denne siden er
  // samme kabler én rad per kabel. Stil som motstandsmålingssiden (145/180). Rader og summer fra
  // _cableOverviewRows / _cableOverviewTotals — samme kilder som Romoversikten og materiallista.
  const _cabRows = opts.cableTable ? _cableOverviewRows(S.rooms) : [];
  if (_cabRows.length) {
    if (_pageStarted) _addPage(); else _pageStarted = true;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20, 40, 80);
    doc.text('Varmekabler \\u2013 oversikt', M, y); y += 5.5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90, 100, 120);
    doc.text('Én rad per kabel', M, y); y += 6.5;
    doc.setFontSize(7); doc.setTextColor(120, 130, 150);
    const _cabHasRes = _cabRows.some(r => r.reserve);
    doc.text('Lengde = kabelens produktlengde. Effekt = kabelens merkeeffekt. W/m\\u00b2 = rommets effekt ÷ netto gulvareal (som i Romoversikten).'
      + (_cabHasRes ? ' Reservekabel er ikke tilkoblet (0 W).' : ''), M, y); y += 6;

    // Kolonner (sum 180 mm): Etasje · Rom · Netto · Produkt · El.nr · Lengde · Effekt · CC · W/m² · Merknad
    const cw = [18, 26, 13, 44, 15, 15, 15, 12, 10, 12];
    const cx = []; { let a = M; for (const w of cw) { cx.push(a); a += w; } }
    const heads = ['Etasje', 'Rom', 'Netto m\\u00b2', 'Produkt', 'El.nr', 'Lengde (m)', 'Effekt (W)', 'CC (cm)', 'W/m\\u00b2', 'Merknad'];
    const numCol = [false, false, true, false, false, true, true, true, true, false];
    const rowH = 6;
    const _cFit = (t, i) => { t = String(t == null ? '' : t); return t ? (doc.splitTextToSize(t, cw[i] - 2)[0] || '') : ''; };
    const _cabHead = () => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(20, 60, 130);
      heads.forEach((h, i) => doc.text(h, numCol[i] ? cx[i] + cw[i] - 1.5 : cx[i] + 1, y, numCol[i] ? { align: 'right' } : undefined));
      y += 2; doc.setDrawColor(150, 165, 190); doc.setLineWidth(0.3); doc.line(M, y, M + pw, y); y += 5;
    };
    _cabHead();
    let _prevFloor = Symbol('start'), _prevRoom = null;
    for (const r of _cabRows) {
      if (y + rowH > H - M) { _addPage(); _cabHead(); _prevFloor = Symbol('page'); _prevRoom = null; }
      const fName = r.floor ? (r.floor.name || 'Etasje') : '\\u2014';
      const newRoom = _prevRoom !== r.room.id;   // rommets felt også øverst på en ny side
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(30, 40, 60);
      if (fName !== _prevFloor) { doc.setFont('helvetica', 'bold'); doc.text(_cFit(fName, 0), cx[0] + 1, y); doc.setFont('helvetica', 'normal'); }
      _prevFloor = fName;
      const cells = [
        null,
        newRoom ? (r.room.name || 'Rom') : '',
        newRoom && r.nettoM2 ? _fmtNo(r.nettoM2, 1) : '',
        r.product ? (r.product.name || '\\u2014') : 'Ukjent produkt',
        (r.product && r.product.el_no) || '\\u2014',
        r.lengthM ? _fmtNo(r.lengthM, 1) : '\\u2014',
        r.reserve ? '\\u2014' : _fmtNo(r.effectW, 0),
        r.ccCm ? _fmtNo(r.ccCm, 1) : '\\u2014',
        newRoom && r.roomWm2 ? String(r.roomWm2) : '',
        r.note,
      ];
      for (let i = 1; i < cells.length; i++) {
        const t = _cFit(cells[i], i); if (!t) continue;
        if (numCol[i]) doc.text(t, cx[i] + cw[i] - 1.5, y, { align: 'right' }); else doc.text(t, cx[i] + 1, y);
      }
      _prevRoom = r.room.id;
      doc.setDrawColor(225, 232, 244); doc.setLineWidth(0.15); doc.line(M, y + 2, M + pw, y + 2);
      y += rowH;
    }
    // Sumrad
    if (y + 10 > H - M) { _addPage(); _cabHead(); }
    const tot = _cableOverviewTotals(_cabRows);
    y -= 1.5; doc.setDrawColor(150, 165, 190); doc.setLineWidth(0.3); doc.line(M, y, M + pw, y); y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20, 40, 80);
    doc.text('Sum', cx[0] + 1, y);
    doc.text(tot.count + (tot.count === 1 ? ' kabel' : ' kabler') + (tot.reserve ? ' (herav ' + tot.reserve + ' reserve)' : ''), cx[1] + 1, y);
    doc.text(_fmtNo(tot.lengthM, 1), cx[5] + cw[5] - 1.5, y, { align: 'right' });
    doc.text(_fmtNo(tot.effectW, 0), cx[6] + cw[6] - 1.5, y, { align: 'right' });
    y += 8;
    _pageStarted = true;
  } // end if (_cabRows.length)
`);

// 4) Dialogen: valget (bare når prosjektet har innendørs kabel), forhåndsvisning, opts.
rep(`  const hasFoilRes = _foilResistanceRooms(rooms).length > 0;   // 145: valget vises bare med folie
`, `  const hasFoilRes = _foilResistanceRooms(rooms).length > 0;   // 145: valget vises bare med folie
  const hasCableTable = _cableOverviewRows(rooms).length > 0;   // 181: valget vises bare med innendørs kabel
`);
rep(`style="flex:1;cursor:pointer" title="Klikk for forhåndsvisning">Romoversikt</span></div>\` : ''}
`, `style="flex:1;cursor:pointer" title="Klikk for forhåndsvisning">Romoversikt</span></div>\` : ''}
          \${hasCableTable ? \`<div class="exp-check"><input type="checkbox" id="exp-cabletable" checked title="Hak av for utskrift"><span onclick="_expPreviewSection('cabletable')" style="flex:1;cursor:pointer" title="Klikk for forhåndsvisning">Varmekabler – oversikt</span></div>\` : ''}
`);
rep(`    resistance: document.getElementById('exp-resistance')?.checked,   // 145
`, `    resistance: document.getElementById('exp-resistance')?.checked,   // 145
    cableTable: document.getElementById('exp-cabletable')?.checked,   // 181
`);
rep(`roomTable:true, stairTable:true, materialList:true, resistance:true, pricing:false,`,
    `roomTable:true, stairTable:true, materialList:true, resistance:true, cableTable:true, pricing:false,`);
rep(`  } else if (kind === 'resistance') {
`, `  } else if (kind === 'cabletable') {
    // 181: samme rader og summer som PDF-siden (_cableOverviewRows / _cableOverviewTotals).
    const cr = _cableOverviewRows(rooms.filter(r => !r.listDraft));
    const ct = _cableOverviewTotals(cr);
    const td = (t, st) => \`<td style="padding:5px 8px\${st || ''}">\${t}</td>\`;
    const rowsHtml = cr.map(r => \`<tr style="border-top:1px solid var(--border)">\${td(r.firstInRoom ? E(r.room.name || 'Rom') : '', ';padding-left:0')}\${td(E(r.product ? r.product.name : 'Ukjent produkt'))}\${td(r.lengthM ? _fmtNo(r.lengthM, 1) + ' m' : '—', ';text-align:right')}\${td(r.reserve ? '—' : _fmtNo(r.effectW, 0) + ' W', ';text-align:right')}\${td(r.ccCm ? _fmtNo(r.ccCm, 1) : '—', ';text-align:right;color:var(--muted)')}\${td(E(r.note), ';color:var(--muted)')}</tr>\`).join('');
    const sumHtml = \`<tr style="border-top:2px solid var(--border);font-weight:700">\${td('Sum', ';padding-left:0')}\${td(ct.count + (ct.count === 1 ? ' kabel' : ' kabler'))}\${td(_fmtNo(ct.lengthM, 1) + ' m', ';text-align:right')}\${td(_fmtNo(ct.effectW, 0) + ' W', ';text-align:right')}\${td('')}\${td('')}</tr>\`;
    html = box('Varmekabler – oversikt', \`<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--muted);font-size:11px;text-transform:uppercase"><th style="text-align:left;padding:0 8px 4px 0">Rom</th><th style="text-align:left;padding:0 8px 4px">Produkt</th><th style="text-align:right;padding:0 8px 4px">Lengde</th><th style="text-align:right;padding:0 8px 4px">Effekt</th><th style="text-align:right;padding:0 8px 4px">CC cm</th><th style="padding:0 8px 4px"></th></tr></thead><tbody>\${rowsHtml}\${sumHtml}</tbody></table><div style="margin-top:10px;font-size:11px;color:var(--dim)">Én rad per kabel, innendørs. PDF-siden har også etasje, netto m², El.nr og W/m².</div>\`);
  } else if (kind === 'resistance') {
`);
fs.writeFileSync(f, s);
console.log('ok');
