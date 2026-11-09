// 216: prøver å åpne dialoger én etter én i samme fane og sier om boksen kom (med/uten fixture).
//   node -e ' process.env.FIX="0"; import("./docs/216-dialoger/probe/prov.mjs") '
import { openPage, sov } from './cdp.mjs';
import { FIX } from '../../221/probe/fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4000/';
const p = await openPage(null);
await p.send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 650, deviceScaleFactor: 1, mobile: false });
await p.goto(url);
await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = (m) => { window.__toast = m; };
  for (const id of ["auth-screen", "project-list-screen"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  document.getElementById("app").style.display = "flex"; ${process.env.FIX === "0" ? "" : FIX}
  resizeCanvas(); setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render(); })()`);
const K = [
  ["Tilbehør", "showAccessoriesModal()", "#modal-accessories > div"],
  ["Hent fra kart", "S.ui.activePartId = 72; S.ui.activeFloorId = 2; _roofOpenDialog(2)", "#_roof-ov > div"],
  ["Innstillinger", "_openProfile()", "#profile-overlay .profile-card"],
  ["Snø", "_openSnowCalc()", "#snow-modal-bg > div"],
  ["Frost", "_openFrostModule()", "#frost-modal-bg > div"],
  ["Del presentasjon", "_presentShareModal(\"https://example.test/?present=x\", \"tok\")", "#_del-ov > div"],
  ["Kunde & prosjektinfo", "_wfKundeModal()", "#wf-kunde-modal > div"],
  ["Hestesko", "_showHsBuilder()", "#stair-modal-bg > div"],
  ["Bygg trapp", "_showStraightStairBuilder()", "#stair-modal-bg > div"],
  ["Ny kunde", "_showNewCustomerPopup()", "#new-customer-popup-overlay > div"],
  ["Gi kunden tilgang", "_coOpen()", "#co-overlay .cust-card"],
  ["Excel", "openExcelModal()", "#excel-modal > div"],
];
for (const [navn, aapne, boks] of K) {
  const r = await p.eval(`(async () => { window.__toast = null; let feil = null; try { await Promise.race([ (async () => { ${aapne}; })(), new Promise(r => setTimeout(r, 1200)) ]); } catch (e) { feil = String(e && e.message || e); }
    const b = document.querySelector(${JSON.stringify(boks)}); const h = b ? b.getBoundingClientRect() : null;
    const ut = { boks: !!b, hoyde: h ? Math.round(h.height) : null, feil, toast: window.__toast };
    for (const sel of ["#modal-accessories", "#_roof-ov", "#profile-overlay", "#snow-modal-bg", "#frost-modal-bg", "#_del-ov", "#wf-kunde-modal", "#stair-modal-bg", "#new-customer-popup-overlay", "#co-overlay"]) { const e = document.querySelector(sel); if (e) { if (sel === "#profile-overlay" || sel === "#modal-accessories" || sel === "#new-customer-popup-overlay" || sel === "#co-overlay") e.style.display = "none"; else e.remove(); } }
    const ex = document.getElementById("excel-modal"); if (ex) ex.style.display = "none"; if (window._roofDlg) { try { _roofClose(); } catch (e) {} }
    return ut; })()`);
  console.log(navn.padEnd(22), JSON.stringify(r));
}
await p.close(); process.exit(0);
