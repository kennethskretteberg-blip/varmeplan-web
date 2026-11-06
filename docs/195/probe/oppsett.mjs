// 195: felles oppsett for e2e-skriptene. Limes inn i sidens eval ETTER et fixture.
//  • tilbehørsvinduet er det EKTE (fixturet stubber det — her settes det tilbake)
//  • doc.save stubbes (ingen nedlasting), men navnet og sideantallet noteres
//  • showSaveFilePicker pakkes inn så vi ser hva den ble kalt med og hva nettleseren svarte
//  • MODUS 'ekte'  = nettleserens egen showSaveFilePicker (headless: svarer AbortError straks)
//    MODUS 'opfs'  = et EKTE FileSystemFileHandle i nettleserens private filsystem (OPFS), så
//                    createWritable/write/close/remove er nettleserens egne
export const oppsett = (modus) => `
  window.showAccessoriesModal = window.__ekteModal;
  try { localStorage.removeItem(PDF_SAVE_PICKER_LS_KEY); } catch (e) {}
  window.__t = { picker: [], pickerSvar: [], save: [], toasts: [], t0: 0 };
  window._showToast = (m, ty) => window.__t.toasts.push([String(m), ty || '']);
  const Ekte = window.__ekteJsPDF || (window.__ekteJsPDF = window.jspdf.jsPDF);
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); d.save = function (n) { window.__t.save.push([n, d.internal.getNumberOfPages()]); return d; }; return d; };
  const ektePicker = window.__ektePicker || (window.__ektePicker = window.showSaveFilePicker);
  window.showSaveFilePicker = function (o) {
    window.__t.picker.push({ ...JSON.parse(JSON.stringify(o)), msEtterKlikk: Math.round(performance.now() - window.__t.t0), aktiv: navigator.userActivation.isActive });
    const p = ${JSON.stringify(modus)} === 'opfs'
      ? navigator.storage.getDirectory().then(dir => dir.getFileHandle(o.suggestedName, { create: true })).then(h => (window.__t.handle = h))
      : ektePicker.call(window, o);
    return p.then(h => { window.__t.pickerSvar.push('håndtak: ' + h.name); return h; },
                  e => { window.__t.pickerSvar.push(e.name + ': ' + e.message); throw e; });
  };
  document.addEventListener('mousedown', () => { window.__t.t0 = performance.now(); }, true);
`;
// Kjøres FØR fixturet: tar vare på det ekte tilbehørsvinduet.
export const FOR = `window.__ekteModal = window.__ekteModal || window.showAccessoriesModal;`;
// Leser fila tilbake fra OPFS-håndtaket: størrelse, hode, hale, sideantall.
export const LES = `(async () => {
  const h = window.__t.handle; if (!h) return null;
  try {
    const f = await h.getFile(); const txt = await f.slice(0, 8).text(); const hale = (await f.slice(Math.max(0, f.size - 8)).text()).trim();
    const alt = await f.text();
    return { navn: h.name, bytes: f.size, hode: txt.trim(), hale, sider: (alt.match(/\\/Type \\/Page\\b/g) || []).length };
  } catch (e) { return { navn: h.name, feil: e.name + ': ' + e.message }; }
})()`;
export const TILSTAND = `({ ...window.__t, handle: undefined, rev: S.project.revision, eksportert: !!S.project.lastExportedAt, pref: _pdfSavePickerPref(), dialog: (document.getElementById('export-dialog') || {}).style ? document.getElementById('export-dialog').style.display : null, tilbehor: (document.getElementById('modal-accessories') || { style: {} }).style.display })`;
