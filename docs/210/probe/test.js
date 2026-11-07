// 210: snitt gjennom takfoten. Låser: over bakken slutter kabelen 5 cm under utløpet og målet står; ført 1,0 m
// under bakken er strekningen under bakken med, med sitt mål; ett løp i renna gir ETT kabelsnitt, to gir TO (bunn
// og mot hengkant); rennestrekk uten nedløp gir snitt på midten uten nedløpsdel; klikk på nedløpet + «Vis snitt»;
// PDF med snittet har et ekte JPEG-bilde med innhold; å se på et snitt endrer ikke prosjektet.
async function _takRegressionTest210() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name: '210: ' + name, expected, got, ok: !!cond });
  const lagret = _buildSaveData();
  const keep = { toast: window._showToast, save: window._scheduleAutoSave, confirm: window.confirm, ro: S.ui.readOnly,
                 part: S.ui.activePartId, floor: S.ui.activeFloorId, sb: _supabaseProjectId, cw: canvas.width, ch: canvas.height };
  const eq = (a, b, tol) => a != null && b != null && Math.abs(a - b) < (tol || 1e-6);
  try {
    window._showToast = () => {}; window._scheduleAutoSave = () => {}; window.confirm = () => true;
    const bygg = (R, ridge) => {
      _resetProjectState(); addPart('roof');
      const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
      S.ui.activePartId = part.id; S.ui.activeFloorId = fid; S.ui.drawMode = null;
      S.tak = { [fid]: _takManual(R) };
      _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10'); if (ridge) _takSetHeight(fid, 'ridge_m', ridge);
      fitAll(); render(); renderSidebar();
      return fid;
    };
    // IceFix-bygget: 25 × 10 m, 10 m til bakken, mønet midt på (5 m fra takfoten) 2,887 m over gesimsen = 30°.
    const RECT = [{ x: 0, y: 0 }, { x: 2500, y: 0 }, { x: 2500, y: 1000 }, { x: 0, y: 1000 }];
    let fid = bygg(RECT, '12,887');
    const T = () => _takOf(fid);
    _takAddGutter(fid, 'k1'); [2, 12.5, 23].forEach(a => _takAddDownspout(fid, 'r1', a));
    _takFeatSel = null; render(); renderSidebar();
    const off = document.createElement('canvas'); off.width = 820; off.height = 540;
    const oc = off.getContext('2d');
    const paint = M => { oc.fillStyle = '#fff'; oc.fillRect(0, 0, 820, 540); return _takSectionPaint(oc, M, { x: 0, y: 0, w: 820, h: 540 }, {}); };
    const on = id => ({ type: 'DOWNSPOUT', id });
    let M, L, D, I;
    const les = o => { M = _takSectionModel(T(), o); L = _takSectionLayout(M); D = _takSectionDims(M, L); };
    const dim = k => D.find(d => d.key === k) || null;

    check('Snittstedene: ett per nedløp, i rekkefølge langs strekket', 'n1,n2,n3', _takSectionTargets(T()).map(x => x.on.id).join() === 'n1,n2,n3', _takSectionTargets(T()).map(x => x.on.id).join());
    les(on('n1'));
    check('Takvinkelen er prosjektets: (møne − gesims) / avstand til mønet = 2,887 / 5,00 → 30,0°', '30,0° (derived)', M.pitch.src === 'derived' && eq(M.pitch.deg, 30, 0.05) && eq(M.pitch.run_m, 5, 1e-6), M.pitch.src + ' ' + M.pitch.deg);

    // ── A. Nedløp som slutter over bakken ──
    check('Over bakken: kabelen slutter 5 cm under utløpet', 'utløp 0 → slutt −5 cm', M.end.kind === 'tail' && eq(L.outY, 0) && eq(L.outY - L.cableEnd, 5), `${L.outY} → ${L.cableEnd}`);
    check('… og målet står («5 cm», fra utløpet til kabelens ende)', '5 cm', dim('tail') && dim('tail').label === '5 cm' && eq(dim('tail').a.y - dim('tail').b.y, 5), dim('tail') && JSON.stringify(dim('tail')));
    check('Nedløpets lengde over bakken, med referansepunktet', 'nedløp 10,00 m over bakken (fra takfot)', dim('over') && dim('over').label === 'nedløp 10,00 m over bakken (fra takfot)' && eq(dim('over').a.y, 1000) && eq(dim('over').b.y, 0), dim('over') && dim('over').label);
    check('Takfotens høyde fra terreng, med referansepunktet skrevet på', 'takfot 10,00 m over terreng', dim('takfot') && dim('takfot').label === 'takfot 10,00 m over terreng' && eq(dim('takfot').b.y - dim('takfot').a.y, 1000), dim('takfot') && dim('takfot').label);
    check('Avstand fra takkant til rennas senter', '0,16 m til rennesenter (16 cm)', dim('renne') && dim('renne').label === '0,16 m til rennesenter' && eq(dim('renne').b.x - dim('renne').a.x, 16), dim('renne') && dim('renne').label);
    check('Over bakken: ingen strekning under bakken', 'ingen «under»', !dim('under') && !M.downspout.below, D.map(d => d.key).join());
    I = paint(M);
    check('Tegnet: rør, kabelens ende under utløpet, avlaster-tekst og fire mål', 'rør + ende + 4 mål',
      I.pipe && I.cableEnd && I.dims.length === 4 && I.notes.some(n => /Avlaster ved innløpet: bøyd 90°, strips i hver ende/.test(n)) && I.notes.includes('Kabelen slutter 5 cm ut av nedløpet.'), `${I.pipe} ${JSON.stringify(I.cableEnd)} ${I.dims.length}`);

    // ── Ett løp / to løp i renna ──
    const gc = I.gutterCables, b = gc.find(c => c.at === 'bunn'), hk = gc.find(c => c.at === 'hengkant');
    check('To løp i renna → TO kabelsnitt i profilen: bunn (90°) og mot hengkant (40°)', '2: bunn 90 + hengkant 40',
      gc.length === 2 && b && b.deg === 90 && hk && hk.deg === 40 && I.detail.length === 2, JSON.stringify(gc.map(c => c.at + c.deg)));
    check('«Mot hengkant» ligger på veggsiden og høyere opp enn bunnen', 'hengkant: x < bunn, y < bunn', hk && b && hk.x < b.x && hk.y < b.y, hk && b && `${hk.x.toFixed(1)},${hk.y.toFixed(1)} / ${b.x.toFixed(1)},${b.y.toFixed(1)}`);
    check('To løp i nedløpet → sløyfe (to tråder) i røret', '2', I.pipeRuns === 2, I.pipeRuns);
    _takSetRuns(fid, 'r1.1', 1); les(on('n1')); I = paint(M);
    check('Ett løp i renna → ETT kabelsnitt, i bunnen (90°)', '1: bunn 90', I.gutterCables.length === 1 && I.gutterCables[0].at === 'bunn' && I.gutterCables[0].deg === 90 && I.detail.length === 1, JSON.stringify(I.gutterCables.map(c => c.at + c.deg)));
    check('Profilen er delstrekket som leder inn i nedløpet (r1.1); andre siden (r1.2, 2 løp) står i notatene', 'r1.1 + «(r1.2): 2 løp»',
      M.seg.id === 'r1.1' && M.otherSeg && M.otherSeg.id === 'r1.2' && I.notes.some(n => n.includes('(r1.2): 2 løp')), M.seg.id + ' / ' + JSON.stringify(M.otherSeg));
    _takSetRuns(fid, 'n1', 1); les(on('n1')); I = paint(M);
    check('Ett løp i nedløpet → én tråd i røret', '1', I.pipeRuns === 1, I.pipeRuns);
    const row = _takCableRows(T()).find(r => r.id === 'n1');
    check('Kabelmeter i snittet = tabellens rad (213-formelen, ingen ny utregning)', _takNum(row.cable_m, 2) + ' m',
      eq(M.downspout.cable.cable_m, row.cable_m) && I.notes.some(n => n.includes(`= ${_takNum(row.cable_m, 2)} m kabel`)), M.downspout.cable.cable_m);
    _takSetRuns(fid, 'r1.1', 2); _takSetRuns(fid, 'n1', 2);

    // ── B. Nedløp ført 1,0 m under bakken ──
    _takSetDownspout(fid, 'n2', 'under', true); les(on('n2'));
    check('Under bakken (standard 1,0 m): strekningen under bakken er med, med sitt mål', '1,00 m under bakken · 0 → −100 cm',
      dim('under') && dim('under').label === '1,00 m under bakken' && eq(dim('under').a.y, 0) && eq(dim('under').b.y, -100) && eq(L.pipeBot, -100), dim('under') && JSON.stringify(dim('under')));
    check('… kabelen slutter nede på frostfritt nivå — ingen 5 cm', 'frost, −100, ingen «5 cm»', M.end.kind === 'frost' && eq(L.cableEnd, -100) && !dim('tail'), M.end.kind + ' ' + L.cableEnd);
    check('… og målet over bakken går fra takfoten til terrenget', '1000 → 0', dim('over') && eq(dim('over').a.y, 1000) && eq(dim('over').b.y, 0), dim('over') && JSON.stringify([dim('over').a.y, dim('over').b.y]));
    I = paint(M);
    check('Tegnet: kabelens ende ligger under terrenglinja', 'ende under bakken', I.cableEnd && I.notes.includes('Kabelen slutter på frostfritt nivå, 1,00 m under bakken.'), I.notes.find(n => /frostfritt/.test(n)));
    _takSetDownspout(fid, 'n2', 'below', '1,6'); les(on('n2'));
    check('Rettet dybde 1,6 m følger med i snittet', '1,60 m under bakken · −160', dim('under').label === '1,60 m under bakken' && eq(L.cableEnd, -160), dim('under').label + ' ' + L.cableEnd);
    // Utløpet over terrenget: nedløpet kortere enn gesimsen.
    _takSetDownspout(fid, 'n3', 'above', '9,6'); les(on('n3'));
    check('Nedløp 9,6 m fra gesims 10 m: utløpet står 0,40 m over terreng, kabelen 5 cm under det', 'utløp 0,40 · slutt 35 cm',
      eq(M.outlet_m, 0.4, 1e-9) && dim('utlop') && dim('utlop').label === 'utløp 0,40 m over terreng' && eq(L.cableEnd, 35, 1e-6), dim('utlop') && dim('utlop').label + ' ' + L.cableEnd);

    // ── C. Klikk på nedløpet og «Vis snitt» ──
    _takFeatSel = null; fitAll(); render(); renderSidebar();
    const cr = canvas.getBoundingClientRect();
    const sx = q => cr.left + q.x * cr.width / canvas.width, sy = q => cr.top + q.y * cr.height / canvas.height;
    const mus = (type, q) => canvas.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: sx(q), clientY: sy(q) }));
    const klikkS = q => { mus('mousemove', q); mus('mousedown', q); mus('mouseup', q); mus('click', q); };
    klikkS(_takFeatScreenPt(T(), _takFeat_(T(), 'n3')));
    check('Klikk på nedløpet n3 velger det', 'n3', _takFeatSel && _takFeatSel.id === 'n3', JSON.stringify(_takFeatSel));
    renderSidebar();
    const vis = document.querySelector('.tak-downspout[data-id="n3"] .tak-section-btn button');
    vis && vis.click();
    check('«Vis snitt» på nedløpet åpner snittet ved n3', 'n3', _takSection && _takSection.on.type === 'DOWNSPOUT' && _takSection.on.id === 'n3' && _takSectionBox, JSON.stringify(_takSection));
    const B = _takSectionBox;
    const px = B ? ctx.getImageData(B.x, B.y, B.w, B.h).data : [];
    let mørk = 0; for (let i = 0; i < px.length; i += 4) if (px[i] + px[i + 1] + px[i + 2] < 450) mørk++;
    check('Innfeltet er tegnet på hovedlerretet (mørke piksler i boksen)', '> 2 000', mørk > 2000, mørk);
    check('Lista i panelet: tre steder, n3 markert', '3 · n3', document.querySelectorAll('.tak-section-pick').length === 3 && (document.querySelector('.tak-section-pick.on') || {}).dataset?.key === 'n3', document.querySelectorAll('.tak-section-pick').length);
    const selFør = JSON.stringify(_takFeatSel);
    klikkS({ x: B.x + B.w / 2, y: B.y + B.h / 2 });
    check('Klikk i innfeltet går ikke videre til tegningen under', 'uendret, snittet står', JSON.stringify(_takFeatSel) === selFør && _takSection && _takSection.on.id === 'n3', JSON.stringify(_takFeatSel));
    klikkS(_takFeatScreenPt(T(), _takFeat_(T(), 'n1')));
    check('Åpent snitt følger nedløpet du klikker (n1)', 'n1', _takSection && _takSection.on.id === 'n1', JSON.stringify(_takSection));
    document.querySelector('.tak-section-pick[data-key="n2"]').click();
    check('Velg fra lista i panelet (n2)', 'n2', _takSection && _takSection.on.id === 'n2', JSON.stringify(_takSection));
    render();
    const C = _takSectionBox.close; klikkS({ x: C.x + C.s / 2, y: C.y + C.s / 2 });
    check('× lukker snittet', 'null', _takSection === null && _takSectionBox === null, JSON.stringify(_takSection));
    _takSectionShow(fid, 'DOWNSPOUT', 'n2');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    check('Esc lukker snittet', 'null', _takSection === null, JSON.stringify(_takSection));

    // ── G. Å se på et snitt endrer ikke prosjektet ──
    const j0 = JSON.stringify(_buildSaveData().tak);
    _takSectionShow(fid, 'DOWNSPOUT', 'n2'); render(); _takSectionToImage(fid, on('n2'), { outW: 900 }); _takSectionClose();
    check('Snitt vist, lukket og tegnet til bilde: lagret tak er byte-likt', 'likt', JSON.stringify(_buildSaveData().tak) === j0, '');
    check('Hovedlerretet har fått tilbake sin størrelse etter bildet', `${keep.cw}×${keep.ch}`, canvas.width === keep.cw && canvas.height === keep.ch, `${canvas.width}×${canvas.height}`);

    // ── F. PDF med snittet ──
    const P = _takSectionPDF(fid, on('n2'), { noSave: true });
    const url = P && P.img && P.img.url;
    check('PDF-bildet er data:image/jpeg', 'data:image/jpeg', !!url && url.startsWith('data:image/jpeg;base64,'), url && url.slice(0, 30));
    check('… og stort nok til å være et ekte bilde (> 60 kB)', '> 60 000', !!url && url.length > 60000, url && url.length);
    const im = new Image(); im.src = url; await im.decode();
    const cv = document.createElement('canvas'); cv.width = 520; cv.height = Math.round(520 * im.height / im.width);
    const cx2 = cv.getContext('2d'); cx2.drawImage(im, 0, 0, cv.width, cv.height);
    const dd = cx2.getImageData(0, 0, cv.width, cv.height).data;
    let blekk = 0, kurs = 0, n = dd.length / 4;
    for (let i = 0; i < dd.length; i += 4) { const r = dd[i], g = dd[i + 1], b2 = dd[i + 2]; if (r + g + b2 < 600) blekk++; if (b2 > 120 && g > 100 && r < 90) kurs++; }
    check('Bildet har ekte innhold: 3–60 % tegnede piksler (ikke hvitt, ikke svart)', '3–60 %', blekk / n > 0.03 && blekk / n < 0.6, (100 * blekk / n).toFixed(1) + ' %');
    check('… og kabelen i kursens farge er med', '> 30 px', kurs > 30, kurs);
    const out = P.doc.output();
    check('PDF-en har én side med JPEG-bildet bakt inn', '1 side · /DCTDecode', P.doc.getNumberOfPages() === 1 && out.includes('/DCTDecode') && out.includes('/Subtype /Image') && out.length > 50000, `${P.doc.getNumberOfPages()} · ${out.length}`);
    check('Hovedlerretet er tilbake etter PDF-en', `${keep.cw}×${keep.ch}`, canvas.width === keep.cw && canvas.height === keep.ch, `${canvas.width}×${canvas.height}`);

    // ── D. Rennestrekk uten nedløp ──
    fid = bygg(RECT, '12,887'); _takAddGutter(fid, 'k1');
    const tg = _takSectionTargets(T());
    check('Uten nedløp: ett snittsted, midt på strekket', 'r1 (GUTTER)', tg.length === 1 && tg[0].on.type === 'GUTTER' && tg[0].on.id === 'r1', JSON.stringify(tg.map(x => x.on)));
    let feil = null;
    try { les({ type: 'GUTTER', id: 'r1' }); I = paint(M); _takSectionShow(fid, 'GUTTER', 'r1'); render(); } catch (e) { feil = String(e); }
    check('… snittet tas på 12,5 m, uten nedløpsdel, og ingen feil', '12,5 · ingen rør · ingen nedløpsmål',
      !feil && eq(M.at_m, 12.5) && M.downspout === null && !I.pipe && !I.cableEnd && !dim('over') && !dim('under') && !dim('tail') && _takSectionBox, feil || `${M.at_m} ${I.pipe} ${D.map(d => d.key)}`);
    check('… renneprofilen er der likevel (2 løp)', '2', I.gutterCables.length === 2, I.gutterCables.length);
    _takSectionClose();

    // ── E. Vinkelen: ukjent → brukerens tall → flatt ──
    T().surfaces[0].heights.ridge_m = { value: null, height_ref: 'terreng', prov: null };
    les({ type: 'GUTTER', id: 'r1' });
    check('Uten mønehøyde: vinkelen er ukjent, taket tegnes skjematisk og det står i notatene', 'unknown · skjematisk',
      M.pitch.src === 'unknown' && M.pitch.deg == null && L.schematic && _takSectionNotes(M, L).some(n => n.startsWith('Takvinkel ukjent')), M.pitch.src);
    _takSetPitch(fid, '35'); les({ type: 'GUTTER', id: 'r1' });
    check('Vinkel skrevet av brukeren (35°) brukes, med opphav USER_CONFIRMED', '35 · user', M.pitch.src === 'user' && M.pitch.deg === 35 && T().surfaces[0].pitch_deg.prov.source === 'USER_CONFIRMED', JSON.stringify(T().surfaces[0].pitch_deg));
    check('Ugyldig vinkel (90°) avvises', 'false · 35', _takSetPitch(fid, '90') === false && T().surfaces[0].pitch_deg.value === 35, T().surfaces[0].pitch_deg.value);
    undo();
    check('Angre fjerner vinkelen igjen', 'ingen pitch_deg', !T().surfaces[0].pitch_deg, JSON.stringify(T().surfaces[0].pitch_deg));
    S.ui.readOnly = true;
    check('readOnly: vinkelen kan ikke skrives, men snittet kan ses', 'false · vist', _takSetPitch(fid, '20') === false && !T().surfaces[0].pitch_deg && (_takSectionShow(fid, 'GUTTER', 'r1'), !!_takSection), '');
    S.ui.readOnly = false; _takSectionClose();
    _takSetRoofType(fid, 'flat'); les({ type: 'GUTTER', id: 'r1' });
    check('Flatt tak: vinkelen er 0', '0 · flat', M && M.pitch.src === 'flat' && M.pitch.deg === 0, M && M.pitch.src);

    // ── Gamle prosjekter ──
    _resetProjectState(); addPart('indoor');
    check('Et prosjekt uten tak lagres fortsatt uten `tak`-nøkkel', 'ingen tak', !('tak' in _buildSaveData()), Object.keys(_buildSaveData()).includes('tak'));
  } catch (e) {
    check('unntak', 'ingen', false, String(e && e.stack || e).slice(0, 300));
  } finally {
    window._showToast = keep.toast; window._scheduleAutoSave = keep.save; window.confirm = keep.confirm; S.ui.readOnly = keep.ro;
    _takSection = null; _takSectionBox = null; _takFeat = null; _takFeatSel = null; _takFeatHover = null;
    if (canvas.width !== keep.cw || canvas.height !== keep.ch) { canvas.width = keep.cw; canvas.height = keep.ch; }
    _restoreProject(lagret); S.ui.activePartId = keep.part; S.ui.activeFloorId = keep.floor; _supabaseProjectId = keep.sb;
    render();
  }
  const allOk = results.every(r => r.ok);
  console[allOk ? 'log' : 'error'](`_takRegressionTest210: ${allOk ? 'BESTÅTT' : 'FEILET'} (${results.filter(r => r.ok).length}/${results.length})`, results);
  return { ok: allOk, results };
}
