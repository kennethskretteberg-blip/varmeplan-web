
// 244 — regresjonstest for manuelt lagt til foliebredder. Kjør: await _foilManualWidthRegressionTest244()
// Går gjennom den EKTE dialogen (knapp → nedtrekk → rad → bekreft) og alle fire eksportene.
async function _foilManualWidthRegressionTest244() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name, ok: !!cond, expected, got });
  const saved = {
    rooms: S.rooms, strips: S.strips, foilFree: S.foilFree, cables: S.cables, mats: S.mats,
    matPaths: S.matPaths, plates: S.plates, aluboard: S.aluboard, zones: S.zones, hindrings: S.hindrings,
    stairs: S.stairs, floors: S.floors, project: S.project, counters: { ...S.counters },
    activeFloorId: S.ui.activeFloorId, activePartId: S.ui.activePartId,
    prods: HEATING_PRODUCTS.slice(), cats: PRODUCT_CATEGORIES.slice(),
    autoSave: window._performAutoSave, toast: window._showToast, modal: window.showAccessoriesModal,
    branding: window._pdfBranding, jsPDF: window.jspdf && window.jspdf.jsPDF, XLSX: window.XLSX,
    prefs: window._saveAccessoryPrefs, agg: window._foilAggWithManual, sched: window._scheduleAutoSave,
    vismaAcc: _vismaPasteAccessoryItems, gbaoAcc: _gbao10AccessoryItems, elValg: _gbao10ElChoices,
    undoLen: (typeof _undoStack !== 'undefined' && _undoStack) ? _undoStack.length : null,
  };
  const gjenopprett = () => {
    Object.assign(S, { rooms: saved.rooms, strips: saved.strips, foilFree: saved.foilFree,
      cables: saved.cables, mats: saved.mats, matPaths: saved.matPaths, plates: saved.plates,
      aluboard: saved.aluboard, zones: saved.zones, hindrings: saved.hindrings, stairs: saved.stairs,
      floors: saved.floors, project: saved.project });
    Object.assign(S.counters, saved.counters);
    S.ui.activeFloorId = saved.activeFloorId; S.ui.activePartId = saved.activePartId;
    HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(...saved.prods);
    PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push(...saved.cats);
    window._performAutoSave = saved.autoSave; window._showToast = saved.toast;
    window.showAccessoriesModal = saved.modal; window._pdfBranding = saved.branding;
    window._saveAccessoryPrefs = saved.prefs; window._foilAggWithManual = saved.agg; window._scheduleAutoSave = saved.sched;
    if (window.jspdf) window.jspdf.jsPDF = saved.jsPDF;
    window.XLSX = saved.XLSX;
    _vismaPasteAccessoryItems = saved.vismaAcc; _gbao10AccessoryItems = saved.gbaoAcc; _gbao10ElChoices = saved.elValg;
    if (saved.undoLen != null) _undoStack.length = saved.undoLen;
    const ov = document.getElementById('modal-accessories'); if (ov) ov.style.display = 'none';
    _invalidateStripCache();
    if (typeof _rebuildActiveFloorRoomIds === 'function') _rebuildActiveFloorRoomIds();
    _invalidateCableCache && _invalidateCableCache();
    _invalidateMatCache && _invalidateMatCache();
    _invalidateStairCache && _invalidateStairCache();
    try { renderSidebar(); updateCtxBar(); render(); } catch (e) {}
  };
  try {
    window._performAutoSave = () => Promise.resolve();
    window._scheduleAutoSave = () => {};
    window._showToast = () => {};
    window._pdfBranding = () => Promise.resolve(null);
    window._saveAccessoryPrefs = () => {};   // brukerpreferansen i localStorage skal ikke røres av testen

    // ── Fikstur: fire foliebredder i katalogen (F50 tegnet), én kabel ──────────────────────
    const CAT_FOIL = { id: 9900, module_type: 'foil', name: 'TESTFOLIE' }, CAT_KAB = { id: 9901, module_type: 'cable', name: 'TESTKABEL' };
    const fol = (id, b, art, el) => ({ id, category_id: 9900, active: true, name: 'TESTFOLIE ' + b, width_mm: b * 10,
      netto_width_mm: b * 10, watt_per_m2: 60, article_no: art, el_no: el });
    const F50 = fol(997001, 50, 'TF50', '1000050'), F30 = fol(997002, 30, 'TF30', '1000030'),
      F20 = fol(997003, 20, 'TF20', '1000020'), F25 = fol(997005, 25, '', '1000025');   // F25: bare el-nummer
    const K1 = { id: 997004, category_id: 9901, active: true, name: 'TESTKABEL 10W', watt_per_m: 10,
      article_no: 'TK10', el_no: '1000010', cable_length_m: 50 };
    PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push(CAT_FOIL, CAT_KAB);
    HEATING_PRODUCTS.length = 0; HEATING_PRODUCTS.push(F50, F30, F20, F25, K1);
    const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
    const mkRoom = (id, navn, pts) => ({ id, floorId: null, partId: null, name: navn,
      points: pts.map(p => ({ ...p })), walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
    const A = 992301, B = 992302;
    S.rooms = [mkRoom(A, 'Stue', rect(0, 0, 500, 400)), mkRoom(B, 'Bad', rect(600, 0, 400, 300))];
    S.cables = []; S.mats = []; S.matPaths = []; S.plates = []; S.aluboard = []; S.foilFree = [];
    S.zones = []; S.hindrings = []; S.stairs = []; S.floors = [];
    S.ui.activeFloorId = null; S.ui.activePartId = null;
    S.project = { name: 'MANUELL-FOLIE-TEST', parts: [], revision: 0, createdAt: Date.now() };
    // F50: 12,34 m i Stue → forslag 13.
    S.strips = [{ id: 1, roomId: A, productId: F50.id, direction: 'v', pos_cm: 25, start_cm: 0, length_cm: 1234 }];
    _invalidateStripCache();
    if (typeof _rebuildActiveFloorRoomIds === 'function') _rebuildActiveFloorRoomIds();

    // ── Dialog- og eksporthjelpere ──────────────────────────────────────────────────────────
    const aapne = () => { const pr = showAccessoriesModal(); return { pr, ov: document.getElementById('modal-accessories') }; };
    const valg = (ov) => { ov.querySelector('#acc-foil-add').click(); return [...ov.querySelector('#acc-foil-add-sel').options].map(o => o.value).filter(Boolean).join(','); };
    const leggTil = (ov, pid) => { const v = valg(ov); const sel = ov.querySelector('#acc-foil-add-sel'); sel.value = String(pid); sel.dispatchEvent(new Event('change')); return v; };
    const rad = (ov, pid) => ov.querySelector(`[data-foil-row="${pid}"]`);
    const felt = (ov, pid) => ov.querySelector(`input[data-foil-pid="${pid}"][data-role="foil-qty"]`);
    const bekreft = async (o) => { document.getElementById('acc-confirm').click(); return (await o.pr).items; };
    const avbryt = async (o) => { document.getElementById('acc-cancel').click(); await o.pr; };
    // Tilbehørstallene slik dialogen viser dem (alle antallsfelt + avhuking + RKK).
    const tilbehorBilde = (ov) => [...ov.querySelectorAll('input[data-acc-id]')].map(i => i.getAttribute('data-acc-id') + ':' + i.getAttribute('data-role') + '=' + (i.type === 'checkbox' ? i.checked : i.value)).join('|');
    const visma = (items) => { _vismaPasteAccessoryItems = items; const b = _vismaPasteBuild(); _vismaPasteAccessoryItems = []; return b; };
    const vismaLinje = (items, art) => { const l = visma(items).lines.find(l => l.artikkelnr === art); return l ? l.antall : null; };
    const gbao = (items) => { _gbao10AccessoryItems = items; const b = _gbao10Build(); _gbao10AccessoryItems = []; return b; };
    const gbaoLinje = (items, art) => { const l = gbao(items).lines.find(l => l.artikkelnr === art); return l ? l.antall : null; };
    const xlsxBestilling = async (items) => {
      let fanget = null;
      window.showAccessoriesModal = () => Promise.resolve({ items });
      window.XLSX = { utils: { aoa_to_sheet: rows => ({ rows }), book_new: () => ({ sheets: [] }),
        book_append_sheet: (wb, ws, name) => wb.sheets.push({ name, ws }) }, writeFile: (wb) => { fanget = wb; } };
      try { await _exportMaterialListXLSX(); } finally { window.showAccessoriesModal = saved.modal; window.XLSX = saved.XLSX; }
      const ark = fanget && fanget.sheets.find(s => s.name === 'Bestilling');
      return ark ? ark.ws.rows : null;
    };
    const harPdf = !!(window.jspdf && saved.jsPDF);
    const pdfTekster = async (items) => {
      const tekster = [];
      window.showAccessoriesModal = () => Promise.resolve({ items });
      const Ekte = saved.jsPDF;
      window.jspdf.jsPDF = function (...a) {
        const d = new Ekte(...a); const ekte = d.text.bind(d);
        d.text = function (t, ...rest) { if (typeof t === 'string') tekster.push(t); return ekte(t, ...rest); };
        d.save = function () { return d; };
        return d;
      };
      try {
        await exportPDF({ cover: false, summary: false, rooms: [], stairs: [], roomTable: false,
          stairTable: false, materialList: true, pricing: false, discount: 0, showDGDB: false,
          docs: false, signature: false, freeText: '' });
      } finally { window.showAccessoriesModal = saved.modal; window.jspdf.jsPDF = saved.jsPDF; }
      return tekster;
    };
    // PDF-raden: Lev.art.nr | El.nr | Produkt | Antall | Enhet → «TF20 | 20 m».
    const pdfRad = (t, navn) => { const i = t.indexOf(navn); return i < 0 ? null : (t[i - 2] + ' | ' + String(t[i - 1]).replace(/\s/g, '') + ' | ' + t.slice(i + 1, i + 3).join(' ')); };
    // Alle fire eksportene for én artikkel: «visma/gbao/xlsx/pdf».
    const fire = async (items, art, navn) => {
      const x = await xlsxBestilling(items); const xr = x && x.find(r => r[0] === art);
      const p = harPdf ? await pdfTekster(items) : null;
      return [vismaLinje(items, art), gbaoLinje(items, art), xr ? xr[1] : null, p ? pdfRad(p, navn) : 'ingen jsPDF'].join(' / ');
    };
    const fasit = (m, art, el) => [m, m, m + ' m', harPdf ? (art + ' | ' + el + ' | ' + m + ' m') : 'ingen jsPDF'].join(' / ');
    const ingen = [null, null, null, harPdf ? null : 'ingen jsPDF'].join(' / ');

    // ── 0. Grunnlinje: bekreft uten manuell folie (tilbehøret som sammenligningsgrunnlag) ───
    let o = aapne();
    const bildeFoer = tilbehorBilde(o.ov);
    check('seksjonen har knappen «+ Legg til bredde»', true, !!o.ov.querySelector('#acc-foil-add') && /\+ Legg til bredde/.test(o.ov.querySelector('#acc-foil-add').textContent), null);
    check('hjelpeteksten står under knappen', true, o.ov.textContent.includes('Manuelt lagt til folie påvirker ikke beregnet tilbehør.'), null);
    check('tegnet rad F50 uendret: «tegnet 12,3 m i 1 rom», forslag 13, ingen ×', '13', felt(o.ov, F50.id).value === '13' && /tegnet 12,3 m i 1 rom/.test(rad(o.ov, F50.id).textContent) && /forslag: 13 m/.test(rad(o.ov, F50.id).textContent) && !rad(o.ov, F50.id).querySelector('[data-foil-remove]'), felt(o.ov, F50.id).value + ' ' + rad(o.ov, F50.id).textContent.replace(/\s+/g, ' '));
    const grunn = JSON.stringify(_accessoryOnly(await bekreft(o)));
    check('grunnlinje: ingen manuell rad lagret', 0, S.project.accessories.items.filter(i => i.manual).length === 0, S.project.accessories.items.filter(i => i.manual).length);
    S.project.accessories = undefined;

    // ── 1. Legg til en bredde som ikke er tegnet ────────────────────────────────────────────
    o = aapne();
    const v1 = leggTil(o.ov, F20.id);
    check('nedtrekket: katalogens bredder uten den tegnede (F50)', [F20.id, F25.id, F30.id].join(','), v1 === [F20.id, F25.id, F30.id].join(','), v1);
    const r20 = rad(o.ov, F20.id), t20 = r20 ? r20.textContent.replace(/\s+/g, ' ') : '';
    check('raden vises: «TESTFOLIE 20 … lagt til manuelt», uten forslag og «tegnet»', true, !!r20 && r20.hasAttribute('data-foil-manual') && /TESTFOLIE 20/.test(t20) && /lagt til manuelt/.test(t20) && !/forslag|tegnet/.test(t20), t20);
    check('raden har tallfelt (tomt), «+1 m», «+5 m», «m» og «×»', true, !!r20 && felt(o.ov, F20.id).value === '' && !!r20.querySelector('[data-foil-plus="1"]') && !!r20.querySelector('[data-foil-plus="5"]') && / m\s*$/.test(t20) && !!r20.querySelector('[data-foil-remove]'), t20 + ' | verdi «' + (r20 && felt(o.ov, F20.id).value) + '»');
    check('samme bredde kan ikke legges til to ganger', [F25.id, F30.id].join(','), valg(o.ov) === [F25.id, F30.id].join(','), valg(o.ov));
    rad(o.ov, F20.id).querySelector('[data-foil-plus="5"]').click(); rad(o.ov, F20.id).querySelector('[data-foil-plus="1"]').click();
    check('«+5 m» og «+1 m» virker på den manuelle raden (tomt → 6)', '6', felt(o.ov, F20.id).value === '6', felt(o.ov, F20.id).value);
    felt(o.ov, F20.id).value = '20';
    check('tilbehørstallene i dialogen er uendret av den manuelle raden', bildeFoer, tilbehorBilde(o.ov) === bildeFoer, tilbehorBilde(o.ov));
    let items = await bekreft(o);
    let m20 = items.find(i => i.id === _foilAccId(F20.id));
    check('lagret som foilProduct med manual: true, autoQty 0, qty 20, art.nr og el-nr', 'TF20/1000020/20/0/true', m20 && m20.type === 'foilProduct' && m20.manual === true && m20.autoQty === 0 && m20.qty === 20 && m20.art_no === 'TF20' && m20.el_no === '1000020' && m20.unit === 'm', JSON.stringify(m20));
    check('tegnet rad lagres som før (ikke manuell, autoQty 13)', '13/13', (() => { const d = items.find(i => i.id === _foilAccId(F50.id)); return d && !d.manual && d.qty === 13 && d.autoQty === 13; })(), JSON.stringify(items.find(i => i.id === _foilAccId(F50.id))));
    check('bekreftet tilbehør er likt med og uten manuell folie', grunn, JSON.stringify(_accessoryOnly(items)) === grunn, JSON.stringify(_accessoryOnly(items)));
    check('raden ligger på prosjektet (S.project.accessories.items)', true, S.project.accessories.items.some(i => i.id === _foilAccId(F20.id) && i.manual === true && i.qty === 20), null);
    const lagret = JSON.parse(JSON.stringify(_buildSaveData()));
    const lagretRad = ((lagret.project && lagret.project.accessories && lagret.project.accessories.items) || []).find(i => i.id === _foilAccId(F20.id));
    check('raden følger lagringsdataene (_buildSaveData → JSON)', '20/true', lagretRad && lagretRad.qty === 20 && lagretRad.manual === true, JSON.stringify(lagretRad));

    // ── 2. Åpne igjen: raden er tilbake ─────────────────────────────────────────────────────
    S.project.accessories = lagret.project.accessories;   // som etter lagring og åpning
    o = aapne();
    check('åpnet på nytt: manuell rad tilbake med 20 m', '20', !!rad(o.ov, F20.id) && rad(o.ov, F20.id).hasAttribute('data-foil-manual') && felt(o.ov, F20.id).value === '20', rad(o.ov, F20.id) && felt(o.ov, F20.id).value);
    check('åpnet på nytt: tegnet rad F50 er ikke manuell, 13 m', '13', !rad(o.ov, F50.id).hasAttribute('data-foil-manual') && felt(o.ov, F50.id).value === '13', felt(o.ov, F50.id).value);
    check('åpnet på nytt: tilbehørstallene uendret', bildeFoer, tilbehorBilde(o.ov) === bildeFoer, tilbehorBilde(o.ov));
    await avbryt(o);

    // ── 3. Alle fire eksportene ─────────────────────────────────────────────────────────────
    items = S.project.accessories.items;
    let f = await fire(items, 'TF20', 'TESTFOLIE 20');
    check('Visma / GBAO10 / XLSX / PDF: manuell TF20 = 20 m med art.nr og el-nr', fasit(20, 'TF20', '1000020'), f === fasit(20, 'TF20', '1000020'), f);
    f = await fire(items, 'TF50', 'TESTFOLIE 50');
    check('Visma / GBAO10 / XLSX / PDF: tegnet TF50 = 13 m (uendret)', fasit(13, 'TF50', '1000050'), f === fasit(13, 'TF50', '1000050'), f);
    check('Visma: manuell folie i folieseksjonen, ikke som tilbehør', 'TF50,TF20', visma(items).sections[0].lines.map(l => l.artikkelnr).join(',') === 'TF50,TF20' && !visma(items).accLines.some(l => l.artikkelnr === 'TF20'), visma(items).sections.map(s => s.label + ':' + s.lines.map(l => l.artikkelnr)).join(' '));
    const xr = (await xlsxBestilling(items)).map(r => r[0]);
    check('XLSX Bestilling: manuell folie rett etter tegnet folie', 'TF50,TF20', xr.slice(1, 3).join(',') === 'TF50,TF20', xr.join(','));
    // El-nummer: bredde uten artikkelnummer → GBAO10 melder den manglende med el-nr, og tar den med når den hukes av.
    const m25 = [{ id: _foilAccId(F25.id), type: 'foilProduct', productId: F25.id, qty: 4, autoQty: 0, manual: true, unit: 'm' }];
    const mangler = gbao(m25).missing.find(x => x.key === 'prod:' + F25.id);
    _gbao10ElChoices = new Set(['prod:' + F25.id]);
    const medEl = gbaoLinje(m25, '1000025');
    _gbao10ElChoices = new Set();
    check('GBAO10: manuell bredde uten art.nr meldes med el-nr, og går med når el-nr velges', '1000025/4', mangler && mangler.el_no === '1000025' && medEl === 4, JSON.stringify(mangler) + '/' + medEl);
    check('Visma: manuell bredde uten art.nr står i mangellista (som tegnet)', 'TESTFOLIE 25', visma(m25).missing.join(',') === 'TESTFOLIE 25', visma(m25).missing.join(','));

    // ── 4. 0 m gir ingen linje (raden står igjen i dialogen) ────────────────────────────────
    o = aapne(); felt(o.ov, F20.id).value = '0'; items = await bekreft(o);
    m20 = items.find(i => i.id === _foilAccId(F20.id));
    check('0 m: raden lagres med qty 0', 0, m20 && m20.manual === true && m20.qty === 0, JSON.stringify(m20));
    f = await fire(items, 'TF20', 'TESTFOLIE 20');
    check('0 m: ingen linje i Visma / GBAO10 / XLSX / PDF', ingen, f === ingen, f);
    o = aapne();
    check('0 m: raden kommer likevel tilbake i dialogen', '0', !!rad(o.ov, F20.id) && felt(o.ov, F20.id).value === '0', rad(o.ov, F20.id) && felt(o.ov, F20.id).value);
    // tomt felt = 0
    felt(o.ov, F20.id).value = ''; items = await bekreft(o);
    check('tomt felt lagres som 0', 0, items.find(i => i.id === _foilAccId(F20.id)).qty === 0, items.find(i => i.id === _foilAccId(F20.id)).qty);

    // ── 5. «×» fjerner raden fra alle fire ──────────────────────────────────────────────────
    o = aapne(); felt(o.ov, F20.id).value = '9'; items = await bekreft(o);
    f = await fire(items, 'TF20', 'TESTFOLIE 20');
    check('før «×»: 9 m i alle fire', fasit(9, 'TF20', '1000020'), f === fasit(9, 'TF20', '1000020'), f);
    o = aapne(); rad(o.ov, F20.id).querySelector('[data-foil-remove]').click();
    check('«×»: raden er borte fra dialogen, og bredden kan velges igjen', [F20.id, F25.id, F30.id].join(','), !rad(o.ov, F20.id) && valg(o.ov) === [F20.id, F25.id, F30.id].join(','), !!rad(o.ov, F20.id) + ' ' + valg(o.ov));
    items = await bekreft(o);
    check('«×»: ingen lagret rad for bredden', false, !items.some(i => i.productId === F20.id) && !S.project.accessories.items.some(i => i.productId === F20.id), items.filter(i => i.productId === F20.id));
    f = await fire(items, 'TF20', 'TESTFOLIE 20');
    check('«×»: borte fra Visma / GBAO10 / XLSX / PDF', ingen, f === ingen, f);
    check('«×»: tilbehøret fortsatt likt grunnlinja', grunn, JSON.stringify(_accessoryOnly(items)) === grunn, JSON.stringify(_accessoryOnly(items)));

    // ── 6. En tegnet bredde kan ikke legges til manuelt ─────────────────────────────────────
    o = aapne();
    const v6 = leggTil(o.ov, F50.id);
    check('tegnet F50 står ikke i nedtrekket, og gir ingen manuell rad', 'ingen', !v6.split(',').includes(String(F50.id)) && o.ov.querySelectorAll(`[data-foil-row="${F50.id}"]`).length === 1 && !o.ov.querySelector('[data-foil-manual]'), v6 + ' / rader ' + o.ov.querySelectorAll(`[data-foil-row="${F50.id}"]`).length);
    await avbryt(o);
    // Lagret manuell rad for en bredde som SIDEN er tegnet: den tegnede raden tar over, én linje.
    const man50 = [{ id: _foilAccId(F50.id), type: 'foilProduct', productId: F50.id, qty: 5, autoQty: 0, manual: true, unit: 'm' }];
    S.project.accessories = { items: man50, savedAt: 1 };
    o = aapne();
    check('manuell rad for en bredde som siden er tegnet: bare den tegnede raden, forslaget 13', '13', o.ov.querySelectorAll(`[data-foil-row="${F50.id}"]`).length === 1 && !o.ov.querySelector('[data-foil-manual]') && felt(o.ov, F50.id).value === '13', felt(o.ov, F50.id).value);
    await avbryt(o);
    check('… og én linje med 13 m i Visma/GBAO10 (ikke 5, ikke to linjer)', '13/1', vismaLinje(man50, 'TF50') === 13 && visma(man50).lines.filter(l => l.artikkelnr === 'TF50').length === 1 && gbaoLinje(man50, 'TF50') === 13, vismaLinje(man50, 'TF50') + '/' + visma(man50).lines.filter(l => l.artikkelnr === 'TF50').length);
    // Tegnet rad uten manual-flagg der folien er slettet: skal IKKE bli en linje (som før 244).
    const spok = [{ id: _foilAccId(F30.id), type: 'foilProduct', productId: F30.id, qty: 30, autoQty: 30, unit: 'm' }];
    f = await fire(spok, 'TF30', 'TESTFOLIE 30');
    check('lagret tegnet rad uten tegning (ikke manuell) gir ingen linje — som før', ingen, f === ingen, f);
    S.project.accessories = undefined;

    // ── 7. Prosjekt uten tegnet folie (bare kabel) kan få manuell folie ─────────────────────
    S.strips = []; S.cables = [{ id: 1, roomId: B, productId: K1.id, totalLength_cm: 5000 }];
    _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache();
    check('fikstur: bare kabel (ingen tegnet folie)', '0/1', _foilDrawnByProduct().size === 0 && _computeCableContext().cableCount === 1, _foilDrawnByProduct().size + '/' + _computeCableContext().cableCount);
    o = aapne();
    check('bare kabel: seksjonen «Varmefolie (meter)» vises med knappen', true, /Varmefolie \(meter\)/.test(o.ov.textContent) && /Ingen folie er tegnet/.test(o.ov.textContent) && !!o.ov.querySelector('#acc-foil-add'), null);
    check('bare kabel: folietilbehøret (tape, RKK …) vises ikke', true, !o.ov.querySelector('#rkk-bla') && !o.ov.querySelector('input[data-acc-id="lerretstape"]'), null);
    const kabelBilde = tilbehorBilde(o.ov);
    const v7 = leggTil(o.ov, F20.id);
    check('bare kabel: alle fire breddene kan velges', [F20.id, F25.id, F30.id, F50.id].join(','), v7 === [F20.id, F25.id, F30.id, F50.id].join(','), v7);
    felt(o.ov, F20.id).value = '7';
    check('bare kabel: kabeltilbehøret i dialogen uendret', kabelBilde, tilbehorBilde(o.ov) === kabelBilde, tilbehorBilde(o.ov));
    items = await bekreft(o);
    check('bare kabel: manuell rad lagret, ingen folietilbehør regnet', '7/0', items.some(i => i.id === _foilAccId(F20.id) && i.manual && i.qty === 7) && !items.some(i => i.type === 'foil'), JSON.stringify(items.filter(i => i.type === 'foil' || i.type === 'foilProduct')));
    f = await fire(items, 'TF20', 'TESTFOLIE 20');
    check('bare kabel: 7 m i Visma / GBAO10 / XLSX / PDF', fasit(7, 'TF20', '1000020'), f === fasit(7, 'TF20', '1000020'), f);
    const rekk = visma(items).lines.map(l => l.artikkelnr);
    check('bare kabel: folien står foran kabelen (179: kabel sist)', true, rekk.indexOf('TF20') >= 0 && rekk.indexOf('TF20') < rekk.indexOf('TK10'), rekk.join(','));
    const xr7 = (await xlsxBestilling(items)).map(r => r[0]);
    check('bare kabel: XLSX har folien først, så kabelen', true, xr7.indexOf('TF20') === 1 && xr7.indexOf('TK10') > 1, xr7.join(','));

    // ── VAKSINE: uten den felles kilden MÅ linja forsvinne ──────────────────────────────────
    let syk;
    try { window._foilAggWithManual = (a) => a; syk = vismaLinje(items, 'TF20') + '/' + gbaoLinje(items, 'TF20'); }
    finally { window._foilAggWithManual = saved.agg; }
    check('VAKSINE: uten _foilAggWithManual mangler linja i Visma og GBAO10 (slik det var før 244)', 'null/null', syk === 'null/null', syk);
  } catch (e) {
    results.push({ name: 'UNNTAK', ok: false, expected: '-', got: String(e && e.stack || e) });
  } finally {
    try { const c = document.getElementById('acc-cancel'); const ov = document.getElementById('modal-accessories'); if (c && ov && ov.style.display !== 'none') c.click(); } catch (e) {}
    gjenopprett();
  }
  const allOk = results.every(r => r.ok);
  console[allOk ? 'log' : 'error'](`_foilManualWidthRegressionTest244: ${allOk ? 'BESTÅTT' : 'FEILET'}`, results);
  return { ok: allOk, results };
}
