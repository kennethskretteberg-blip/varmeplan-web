// 179: mål rekkefølgen i Visma-lim, GBAO10 og Excel «Bestilling» for fire scenarier.
import { openPage } from './cdp.mjs';
const [,, port] = process.argv;
const p = await openPage(`http://localhost:${port}/`);
const expr = `(async () => {
  try { await Promise.race([_loadProducts(), new Promise(r => setTimeout(r, 5000))]); } catch (e) {}
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  const P = (id, name, art) => ({ id, name, article_no: art, el_no: 'E' + art });
  const F50 = P(1001, 'Folie 50', 'TF50'), F30 = P(1002, 'Folie 30', 'TF30');
  const K1 = P(2001, 'Kabel 10W 50m', 'K50'), K2 = P(2002, 'Kabel 10W 30m', 'K30');
  const M1 = P(3001, 'Matte 2m²', 'M2'), T1 = P(4001, 'Trappekabel 20m', 'TK20');
  // Rom-rekkefølge (insertion) legger kabel i rom 1 — da ser vi også Excels innsettingsrekkefølge.
  const it = (product, kind, count, lenM) => ({ product, kind, count, lenM, roomName: 'R', qtyStr: '', areaM2: 0, watt: 0 });
  const ITEMS = {
    alle:      [it(K1, 'Kabel', 1, 50), it(F50, 'Folie', 3, 12), it(M1, 'Matte', 2, 0), it(F30, 'Folie', 2, 6), it(K2, 'Kabel', 1, 30), it(T1, 'Kabel (trapp)', 1, 20)],
    folie:     [it(F50, 'Folie', 3, 12), it(F30, 'Folie', 2, 6)],
    kabel:     [it(K1, 'Kabel', 1, 50), it(K2, 'Kabel', 1, 30)],
    folieKabelUtenKabelTilb: [it(K1, 'Kabel', 1, 50), it(F50, 'Folie', 3, 12)],
  };
  const acc = (id, name, art, type, qty) => ({ id, name, art_no: art, el_no: '1', unit: 'stk', qty, source: 'auto', type });
  const FA = [acc('lerretstape', 'Lerretstape', 'LT', 'foil', 2), acc('underlagsplater', 'Underlagsplater', 'UP', 'foil', 40), acc('tilkoblingsklemmer', 'Klemmer', 'KL', 'foil', 10)];
  const CA = [acc('kabel_strips', 'Strips', 'CV087193', 'cable', 300), acc('kabel_folerror', 'Følerrør', 'CVA10526', 'cable', 2)];
  const MA = [acc('mat_folerror', 'Følerrør matte', 'CVA10526', 'mat', 1)];
  const ACC = { alle: [...FA, ...CA, ...MA], folie: FA, kabel: CA, folieKabelUtenKabelTilb: FA };
  const out = {};
  for (const key of Object.keys(ITEMS)) {
    window._collectMaterialItems = () => ITEMS[key];
    const drawn = new Map(ITEMS[key].filter(i => i.kind === 'Folie').map(i => [i.product.id, { lenM: i.lenM }]));
    window._foilDrawnByProduct = () => drawn;
    _vismaPasteAccessoryItems = ACC[key];
    const v = _vismaPasteBuild();
    _gbao10AccessoryItems = ACC[key];
    const g = _gbao10Build();
    let fanget = null;
    window.showAccessoriesModal = () => Promise.resolve({ items: ACC[key] });
    window.XLSX = { utils: { aoa_to_sheet: rows => ({ rows }), book_new: () => ({ sheets: [] }), book_append_sheet: (wb, ws, name) => wb.sheets.push({ name, ws }) }, writeFile: wb => { fanget = wb; } };
    await _exportMaterialListXLSX();
    const best = fanget.sheets.find(s => s.name === 'Bestilling').ws.rows;
    out[key] = {
      visma: _vismaPasteText(v).split('\\n').map(r => r.replace('\\t', ' ').trim() || '·'),
      gbao: g.lines.map(l => l.artikkelnr + ' ' + l.antall),
      excel: best.map(r => (r[0] || r[2]) + ' ' + r[1]),
      sum: { vismaLinjer: v.lines.length, vismaAntall: v.totalAntall, gbaoLinjer: g.lines.length, gbaoAntall: g.totalAntall, excelRader: best.length },
    };
  }
  return out;
})()`;
const r = await p.eval(expr).catch(e => ({ FEIL: e.message }));
console.log(JSON.stringify(r, null, 1));
await p.close(); process.exit(0);
