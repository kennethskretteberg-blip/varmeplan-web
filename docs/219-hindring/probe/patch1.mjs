// 219: patch 1 — modal-HTML, CSS, _hindDisplayName, opprettelsessteder, visningssteder. Hver FINN må treffe nøyaktig én gang.
import fs from 'node:fs';
const F = 'index.html'; let s = fs.readFileSync(F, 'utf8');
const P = [];
const bytt = (finn, sett) => { const n = s.split(finn).length - 1; if (n !== 1) { console.error('FEIL: treff ' + n + ' for\n' + finn.slice(0, 120)); process.exit(1); } s = s.replace(finn, () => sett); P.push(finn.slice(0, 60).replace(/\n/g, ' ')); };

// 1) Modal-HTML
bytt(`  <!-- Hindring type picker -->
  <div class="modal" id="modal-hindring" style="display:none;width:480px" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" onkeydown="if(event.key==='Enter'){event.preventDefault();const fb=this.querySelector('.floor-choice-btn:focus');if(fb)fb.click();}">
    <div class="modal-title">Lag hindring — velg type</div>
    <div class="modal-body">
    <div class="shape-grid" id="hindring-grid" style="margin-bottom:10px"></div>
    <div class="modal-field">
      <label>Navn (valgfritt)</label>
      <input class="modal-inp" id="hindring-name-inp" type="text" placeholder="F.eks. Kjøkkenøy">
    </div>
    <div class="modal-field">
      <label>Mål — Bredde (↔) × Lengde (↕) &nbsp;(valgfritt, plasseres i romsentrum)</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="modal-inp" id="hindring-bredde-inp" type="number" min="1" step="1" placeholder="↔ Bredde cm" style="flex:1">
        <span style="color:var(--dim);font-size:14px;flex-shrink:0">×</span>
        <input class="modal-inp" id="hindring-lengde-inp" type="number" min="1" step="1" placeholder="↕ Lengde cm" style="flex:1">
      </div>
    </div>
    </div>
    <div class="modal-footer">
      <button class="floor-choice-btn" onclick="closeModal()">Avbryt</button>
      <button class="floor-choice-btn" onclick="confirmHindringPolygon()">⬡ Tegn polygon →</button>
      <button class="floor-choice-btn" onclick="confirmHindringW2W()">⤬ Vegg-til-vegg →</button>
      <button class="floor-choice-btn" onclick="confirmHindring()">Legg til →</button>
    </div>
  </div>`,
`  <!-- Sett inn hindring — 219 (Kenneth 09.11.2026): «Vi trenger ikke så mange valg her. Ta bort alle navnene.»
       De ferdige typekortene (HINDRING_TYPES: Kjøkkenøy, Innebygd skap, Pipe, Vegg / søyle, Annet) er borte fra
       menyen. Igjen står tre måter å tegne på: Vegg til vegg og Polygon som store knapper, Mål B×H med to felt
       og én knapp. Navnefeltet er valgfritt og gjelder alle tre; tomt felt gir en hindring uten navn. -->
  <div class="modal" id="modal-hindring" style="display:none;width:480px" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" onkeydown="if(event.key==='Enter'){event.preventDefault();const fb=this.querySelector('.floor-choice-btn:focus');if(fb)fb.click();}">
    <div class="modal-title">Sett inn hindring</div>
    <div class="modal-body">
    <div class="modal-field">
      <label>Navn (valgfritt)</label>
      <input class="modal-inp" id="hindring-name-inp" type="text" placeholder="F.eks. Pipe">
    </div>
    <button class="floor-choice-btn hind-way-btn" id="hindring-w2w-btn" onclick="confirmHindringW2W()">Vegg til vegg</button>
    <button class="floor-choice-btn hind-way-btn" id="hindring-polygon-btn" onclick="confirmHindringPolygon()">Polygon</button>
    <div class="modal-field" style="margin-top:14px">
      <label>Mål</label>
      <div class="hind-dims-row">
        <span class="hind-dims-k">B</span>
        <input class="modal-inp" id="hindring-bredde-inp" type="number" min="1" step="1" placeholder="Bredde" oninput="this.classList.remove('err')" onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();confirmHindring();}">
        <span class="hind-dims-u">cm</span>
        <span class="hind-dims-k">H</span>
        <input class="modal-inp" id="hindring-lengde-inp" type="number" min="1" step="1" placeholder="Høyde" oninput="this.classList.remove('err')" onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();confirmHindring();}">
        <span class="hind-dims-u">cm</span>
      </div>
      <button class="floor-choice-btn" id="hindring-dims-btn" onclick="confirmHindring()" style="margin-top:10px;padding:10px 24px;font-size:14px">Sett inn</button>
    </div>
    </div>
    <div class="modal-footer">
      <button class="floor-choice-btn" onclick="closeModal()">Avbryt</button>
    </div>
  </div>`);

// 2) CSS
bytt(`.floor-choice-btn:focus{background:var(--accent);color:#0d0e10;border-color:var(--accent)}`,
`.floor-choice-btn:focus{background:var(--accent);color:#0d0e10;border-color:var(--accent)}
/* 219 · Sett inn hindring: to store knapper i full bredde, mål-rad med B/H, rød markering av ugyldig felt */
.hind-way-btn{display:block;width:100%;padding:16px 20px;font-size:16px;margin-bottom:10px;color:var(--text)}
.hind-dims-row{display:flex;gap:8px;align-items:center}
.hind-dims-row .modal-inp{flex:1;min-width:0}
.hind-dims-k{font-weight:700;font-size:14px;color:var(--text);flex-shrink:0}
.hind-dims-u{font-size:13px;color:var(--dim);flex-shrink:0;margin-right:6px}
.modal-inp.err{border-color:#ff6b6b;box-shadow:0 0 0 2px rgba(255,107,107,.25)}`);

// 3) _hindDisplayName etter HINDRING_TYPES_SNOW
bytt(`const HINDRING_TYPES_SNOW = [
  {id:'annet', name:'Hindring', ico:'⬛'},
];
`,
`const HINDRING_TYPES_SNOW = [
  {id:'annet', name:'Hindring', ico:'⬛'},
];
// 219: typekortene er borte fra «Sett inn hindring» — HINDRING_TYPES står igjen for gamle prosjekter
// (type-feltet lagres fortsatt, alltid 'annet' for nye). Navnet er det brukeren skrev; tomt felt gir
// label '' og da vises INGEN tekst (ikke «annet», ikke «undefined»). Hindringer fra før 219 uten label
// viser typen som før (070-sidefunnet). Alle visningssteder går gjennom denne.
function _hindDisplayName(h) {
  if (!h) return '';
  if (typeof h.label === 'string') return h.label;
  return h.type || '';
}
`);

// 4) showHindringModal + selHindring
bytt(`function showHindringModal(roomId, zoneId) {
  S.ui.hindringRoomId=roomId; S.ui.hindringType='annet';
  S.ui.hindringZoneId = zoneId != null ? zoneId : null;
  const grid=document.getElementById('hindring-grid');
  const hTypes = _isSnowModule() ? HINDRING_TYPES_SNOW : HINDRING_TYPES;
  grid.innerHTML=hTypes.map(t=>
    \`<div class="shape-card\${t.id==='annet'?' sel':''}" data-htype="\${t.id}" onclick="selHindring('\${t.id}')">
       <span class="shape-ico">\${t.ico}</span>
       <div class="shape-nm">\${t.name}</div>
     </div>\`
  ).join('');
  document.getElementById('hindring-name-inp').value='';
  document.getElementById('hindring-bredde-inp').value='';
  document.getElementById('hindring-lengde-inp').value='';
  showModal('modal-hindring');
}
function selHindring(type) {
  S.ui.hindringType=type;
  document.querySelectorAll('#hindring-grid .shape-card').forEach(c=>{
    c.classList.toggle('sel',c.dataset.htype===type);
  });
}
function confirmHindring() {
  pushUndo();
  const customName=document.getElementById('hindring-name-inp').value.trim();
  // 013: Kenneth — «lengde og bredde er motsatt; bredde bør være horisontalt». \`hw\` er den
  // VANNRETTE utstrekningen (cx−hw/2 … cx+hw/2 under), så den skal komme fra BREDDE-feltet.
  // Feltene heter nå det de er, og står i samme rekkefølge som etiketten «Bredde × Lengde».
  const hw=parseFloat(document.getElementById('hindring-bredde-inp').value);
  const hh=parseFloat(document.getElementById('hindring-lengde-inp').value);
  S.ui.hindringCustomName=customName;
  closeModal();
  if (hw>0 && hh>0) {
    // Dimension mode: place centered in room — 011: eller i SONEN når modalen ble åpnet derfra`,
`function showHindringModal(roomId, zoneId) {
  // 219: ingen typekort lenger (Kenneth: «Ta bort alle navnene») — typen er alltid 'annet'; feltet
  // beholdes i datamodellen så gamle prosjekter med kjokkenoy/skap/pipe/vegg leses som før.
  S.ui.hindringRoomId=roomId; S.ui.hindringType='annet';
  S.ui.hindringZoneId = zoneId != null ? zoneId : null;
  for (const id of ['hindring-name-inp','hindring-bredde-inp','hindring-lengde-inp']) {
    const el=document.getElementById(id); el.value=''; el.classList.remove('err');
  }
  showModal('modal-hindring');
}
// 219: leser B og H. Tomt eller ugyldig (0, minus, bokstaver) → feltet markeres rødt, første får fokus,
// og ingenting settes inn. Markeringen forsvinner når brukeren skriver (oninput).
function _hindDimsRead() {
  let ok=true, first=null; const v=[];
  for (const id of ['hindring-bredde-inp','hindring-lengde-inp']) {
    const el=document.getElementById(id); const n=parseFloat(el.value); const god=Number.isFinite(n)&&n>0;
    el.classList.toggle('err',!god); if(!god){ ok=false; first=first||el; } v.push(n);
  }
  if (!ok) { first.focus(); return null; }
  return { hw:v[0], hh:v[1] };
}
// «Mål B×H» — knappen Sett inn, eller Enter i et av feltene. Før 219 åpnet tomme felt rektangel-
// tegneverktøyet (drawMode 'hindring'); nå er det bare tre veier inn, og tomme felt stopper her.
function confirmHindring() {
  const d=_hindDimsRead(); if(!d) return;
  pushUndo();
  const customName=document.getElementById('hindring-name-inp').value.trim();
  // 013: Kenneth — «lengde og bredde er motsatt; bredde bør være horisontalt». \`hw\` er den
  // VANNRETTE utstrekningen (cx−hw/2 … cx+hw/2 under), så den skal komme fra BREDDE-feltet (B).
  const hw=d.hw;
  const hh=d.hh;
  S.ui.hindringCustomName=customName;
  closeModal();
  {
    // Dimension mode: place centered in room — 011: eller i SONEN når modalen ble åpnet derfra`);

// 4b) resten av confirmHindring: label uten typenavn, og den gamle else-grenen (fritegnet rektangel) bort
bytt(`      const pts=[{x:cx-hw/2,y:cy-hh/2},{x:cx+hw/2,y:cy-hh/2},{x:cx+hw/2,y:cy+hh/2},{x:cx-hw/2,y:cy+hh/2}];
      const hType=HINDRING_TYPES.find(t=>t.id===S.ui.hindringType)||HINDRING_TYPES[4];
      // spec-hindring-avstand-hoyreklikk.md DEL B: avstandskravet er ikke lenger et valg ved
      // tegning — alle hindringer opprettes med 'wall', endres etterpå via høyreklikk.
      S.hindrings.push({id:S.counters.nextHindringId++,type:S.ui.hindringType,
        label:customName||hType.name,roomId:S.ui.hindringRoomId,floorId:_hindringFloorId(S.ui.hindringRoomId),points:pts,
        clearance:'wall', ...(_hz ? { _createdInZone: _hz.id } : {})});`,
`      const pts=[{x:cx-hw/2,y:cy-hh/2},{x:cx+hw/2,y:cy-hh/2},{x:cx+hw/2,y:cy+hh/2},{x:cx-hw/2,y:cy+hh/2}];
      // spec-hindring-avstand-hoyreklikk.md DEL B: avstandskravet er ikke lenger et valg ved
      // tegning — alle hindringer opprettes med 'wall', endres etterpå via høyreklikk.
      // 219: label er navnet brukeren skrev — tomt felt gir '' (ingen tekst), ikke typenavnet.
      S.hindrings.push({id:S.counters.nextHindringId++,type:S.ui.hindringType,
        label:customName,roomId:S.ui.hindringRoomId,floorId:_hindringFloorId(S.ui.hindringRoomId),points:pts,
        clearance:'wall', ...(_hz ? { _createdInZone: _hz.id } : {})});`);
bytt(`    S.ui.hindringZoneId = null;
  } else {
    // Free draw mode
    S.ui.drawMode='hindring';
    S.drawing.active=true; S.drawing.rectStart=null;
    canvas.style.cursor='crosshair'; updMode();
  }
}
`,
`    S.ui.hindringZoneId = null;
  }
}
`);

// 5) createHindringFromPolygon
bytt(`function createHindringFromPolygon(pts) {
  const hType=HINDRING_TYPES.find(t=>t.id===S.ui.hindringType)||HINDRING_TYPES[4];
  const customName=S.ui.hindringCustomName||'';
  S.hindrings.push({id:S.counters.nextHindringId++,type:S.ui.hindringType,
    label:customName||hType.name,roomId:S.ui.hindringRoomId,floorId:_hindringFloorId(S.ui.hindringRoomId),points:[...pts],
    clearance:'wall'});`,
`function createHindringFromPolygon(pts) {
  const customName=S.ui.hindringCustomName||'';   // 219: tomt navn → '' (ingen tekst), ikke typenavnet
  S.hindrings.push({id:S.counters.nextHindringId++,type:S.ui.hindringType,
    label:customName,roomId:S.ui.hindringRoomId,floorId:_hindringFloorId(S.ui.hindringRoomId),points:[...pts],
    clearance:'wall'});`);

// 6) W2W, to steder
bytt(`      pushUndo();
      const hType = HINDRING_TYPES.find(t => t.id === S.ui.hindringType) || HINDRING_TYPES[HINDRING_TYPES.length-1];
      const customName = S.ui.hindringCustomName || '';
      S.hindrings.push({
        id: S.counters.nextHindringId++,
        type: S.ui.hindringType,
        label: customName || hType.name,`,
`      pushUndo();
      const customName = S.ui.hindringCustomName || '';   // 219: tomt navn → '' (ingen tekst)
      S.hindrings.push({
        id: S.counters.nextHindringId++,
        type: S.ui.hindringType,
        label: customName,`);
bytt(`        pushUndo();
        const hType = HINDRING_TYPES.find(t => t.id === S.ui.hindringType) || HINDRING_TYPES[HINDRING_TYPES.length-1];
        const customName = S.ui.hindringCustomName || '';
        S.hindrings.push({
          id: S.counters.nextHindringId++,
          type: S.ui.hindringType,
          label: customName || hType.name,`,
`        pushUndo();
        const customName = S.ui.hindringCustomName || '';   // 219: tomt navn → '' (ingen tekst)
        S.hindrings.push({
          id: S.counters.nextHindringId++,
          type: S.ui.hindringType,
          label: customName,`);

// 7) rektangel-tegneverktøyet (drawMode 'hindring', ikke lenger nåbart fra menyen, men beholdt)
bytt(`        const hType=HINDRING_TYPES.find(t=>t.id===S.ui.hindringType)||HINDRING_TYPES[4];
        const customName=S.ui.hindringCustomName||'';
        S.hindrings.push({id:S.counters.nextHindringId++,type:S.ui.hindringType,
          label:customName||hType.name,roomId:S.ui.hindringRoomId,floorId:_hindringFloorId(S.ui.hindringRoomId),points:pts,`,
`        const customName=S.ui.hindringCustomName||'';   // 219: tomt navn → '' (ingen tekst)
        S.hindrings.push({id:S.counters.nextHindringId++,type:S.ui.hindringType,
          label:customName,roomId:S.ui.hindringRoomId,floorId:_hindringFloorId(S.ui.hindringRoomId),points:pts,`);

// 8) Visningssteder
bytt(`      ctx.fillText(h.label||h.type||'Hindring',cx,cy);   // 070 sidefunn: uten begge ble teksten «undefined» på tegningen OG i PDF`,
`      const _nm=_hindDisplayName(h);   // 070 sidefunn: uten label ble teksten «undefined» på tegningen OG i PDF; 219: tomt navn → ingen tekst
      if (_nm) ctx.fillText(_nm,cx,cy);`);
bytt(`    ctx.fillText(h.label||h.type,cx,cy);
    // Highlight selected hindring wall`,
`    { const _nm=_hindDisplayName(h); if (_nm) ctx.fillText(_nm,cx,cy); }   // 219: tomt navn → ingen tekst
    // Highlight selected hindring wall`);
bytt(`      const lw = ctx.measureText(h.label || h.type || 'Hindring').width / 2 + 2;
      const lab = { x1: cs.x - lw, x2: cs.x + lw, y1: cs.y - 7, y2: cs.y + 7 };`,
`      const _nm = _hindDisplayName(h);   // 219: uten navn er det ingen tekst å vike for
      const lw = _nm ? ctx.measureText(_nm).width / 2 + 2 : 0;
      const lab = _nm ? { x1: cs.x - lw, x2: cs.x + lw, y1: cs.y - 7, y2: cs.y + 7 } : null;`);
bytt(`        if (Math.min(...xs) < lab.x2 && Math.max(...xs) > lab.x1 && Math.min(...ys) < lab.y2 && Math.max(...ys) > lab.y1) continue;   // over navnet`,
`        if (lab && Math.min(...xs) < lab.x2 && Math.max(...xs) > lab.x1 && Math.min(...ys) < lab.y2 && Math.max(...ys) > lab.y1) continue;   // over navnet`);
bytt(`          doc.text(\`\\u2022 \${h.label || h.type || 'Hindring'}\`, colA, y);`,
`          doc.text(\`\\u2022 \${_hindDisplayName(h) || 'Hindring'}\`, colA, y);   // 219: uten navn står det bare «Hindring» i lista`);
bytt(`      panel.innerHTML=\`<div class="soi-title">\${esc(h.label)}</div>`,
`      panel.innerHTML=\`<div class="soi-title">\${esc(_hindDisplayName(h) || 'Hindring')}</div>`);
bytt(`hindringLabel: h.label || h.type || 'Hindring', required: hM };`,
`hindringLabel: _hindDisplayName(h) || 'Hindring', required: hM };`);

fs.writeFileSync(F, s);
console.log('OK', P.length, 'bytter');
