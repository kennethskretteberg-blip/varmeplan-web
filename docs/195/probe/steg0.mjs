// 195 STEG 0.4: (a) hvor lang tid tar exportPDF på et stort prosjekt, (b) hvor lenge «gjelder»
// et klikk for showSaveFilePicker. Bruk: node -e ' import("./docs/195/probe/steg0.mjs") '
import { openPage, sov } from './cdp.mjs';
import { STORT } from './fixture.mjs';
const p = await openPage('http://localhost:4000/');
const ut = {};
ut.api = await p.eval(`({ picker: 'showSaveFilePicker' in window, secure: window.isSecureContext, ua: navigator.userAgent })`);

// (a) byggetid — tilbehørsvindu, logo og save stubbet, så bare selve byggingen måles.
ut.bygg = await p.eval(`(async () => {
  ${STORT}
  const Ekte = window.jspdf.jsPDF; let sider = 0, tSave = 0, bytes = 0;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a);
    d.save = function () { tSave = performance.now(); sider = d.internal.getNumberOfPages(); return d; }; return d; };
  const opts = { cover: true, summary: true, floorplan: true, rooms: S.rooms.map(r => r.id), stairs: [], roomTable: true, stairTable: false, materialList: true, resistance: true, cableTable: true, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: '' };
  const rader = [];
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    await exportPDF(opts);
    rader.push({ sider, ms: Math.round(tSave - t0) });
  }
  window.jspdf.jsPDF = Ekte;
  return { rom: S.rooms.length, kabler: S.cables.length, striper: S.strips.length, rader };
})()`);

// (b) klikkets levetid: en knapp som venter N ms (setTimeout) og så kaller showSaveFilePicker.
// Headless Chrome har ingen dialog — et kall MED gyldig klikk henger (vi venter 1,5 s og kaller
// det «åpnet»), et kall UTEN gyldig klikk avvises straks med SecurityError.
await p.eval(`(() => {
  const b = document.createElement('button'); b.id = 'p195'; b.textContent = 'P';
  b.style.cssText = 'position:fixed;left:10px;top:10px;z-index:99999;width:60px;height:30px';
  document.body.appendChild(b);
  window.__p195 = null;
  b.onclick = async () => {
    const vent = window.__vent, travelt = window.__travelt;
    if (travelt) { const t = performance.now(); while (performance.now() - t < vent) {} }
    else await new Promise(r => setTimeout(r, vent));
    const aktiv = navigator.userActivation ? navigator.userActivation.isActive : null;
    window.__p195 = { vent, travelt, aktiv, utfall: 'venter' };
    try { await window.showSaveFilePicker({ suggestedName: 'x.pdf' }); window.__p195.utfall = 'fikk håndtak'; }
    catch (e) { window.__p195.utfall = e.name + ': ' + e.message; }
  };
})()`);
ut.klikk = [];
for (const [vent, travelt] of [[0, false], [2000, false], [4000, false], [4800, false], [5500, false], [8000, false], [4000, true], [6000, true]]) {
  await p.eval(`window.__vent = ${vent}; window.__travelt = ${travelt}; window.__p195 = null`);
  await p.clickSel('#p195');
  await sov(vent + 1500);
  ut.klikk.push(await p.eval('window.__p195'));
}
// uten klikk i det hele tatt (Runtime.evaluate uten userGesture)
ut.utenKlikk = await p.eval(`(async () => { try { await Promise.race([window.showSaveFilePicker({}), new Promise((_, n) => setTimeout(() => n(new Error('henger (dialog åpnet?)')), 1500))]); return 'fikk håndtak'; } catch (e) { return e.name + ': ' + e.message; } })()`);
console.log(JSON.stringify(ut, null, 1));
await p.close(); process.exit(0);
