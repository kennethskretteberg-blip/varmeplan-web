// 238: skjermbilde av trappepanelet + PDF-siden(e) for trappa 4 + repos 120 + 6 (210 bred, 98 m manuelt).
// TAG=foer: valgene av (som før 238). TAG=etter: «Prioriter trinn» på. TAG=felt: repos-felt 15 (uten kabel-løsning: 106,9 m).
//   node -e ' process.env.TAG="etter"; import("./docs/238/probe/bilder.mjs") '
import fs from "node:fs";
import { openPage, sov } from "./cdpklient.mjs";
const tag = process.env.TAG || "etter";
const extra = tag === "etter" ? "prioritizeSteps: true" : tag === "felt" ? "landingEdgeMargin_cm: 15" : "_ingen: 0";
const kabel = tag === "felt" ? 106.9 : 98;
const p = await openPage(process.env.URL0 || "http://localhost:4000/", 9333, 2);
const r = await p.eval(`(async () => {
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
  const LENS = [5, 10, 15, 20, 25, 30, 35, 40.1, 45, 49.7, 55.3, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: "cable", name: "TESTKABEL" });
  HEATING_PRODUCTS.length = 0;
  LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: "InSnow 30T", name: "InSnow 30T " + Math.round(L * 30) + "W " + L + "m", cable_length_m: L, watt_per_m: 30, voltage: 230 }));
  S.rooms = []; S.strips = []; S.cables = []; S.mats = []; S.stairs = []; S.floors = [];
  S.counters.nextStairId = 923801;
  const st = _createStairObj({ name: "Trapp med repos (4 + R120 + 6)", width_cm: 210, step_depth_cm: 30, step_height_cm: 17, buildDirection: "bottom", edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, x_cm: 0, y_cm: 0, ${extra},
    segments: [{ type: "steps", stepCount: 4, stepDepth_cm: 30, stepHeight_cm: 17, width_cm: 210 }, { type: "landing", depth_cm: 120, width_cm: 210 }, { type: "steps", stepCount: 6, stepDepth_cm: 30, stepHeight_cm: 17, width_cm: 210 }] });
  const pid = HEATING_PRODUCTS.find(x => x.cable_length_m === ${kabel}).id;
  st.cables = [{ index: 0, productId: pid }]; st.cableProductId = pid; st.selectedProposal = null;
  S.stairs = [st]; S.ui.selectedStairId = st.id; _regenerateStairCable(st);
  for (const id of ["auth-screen", "project-list-screen"]) { const e = document.getElementById(id); if (e) e.style.display = "none"; }
  const app = document.getElementById("app"); if (app) app.style.display = "flex";
  _invalidateStairCache(); _updateStairSettingsPanel(); try { render(); } catch (e) {}
  const el = document.getElementById("stair-settings-panel"); el.style.display = "block"; el.style.left = "20px"; el.style.top = "10px"; el.style.maxHeight = "none";
  const b = el.getBoundingClientRect();
  S.project = { name: "Trapp 238", customer: "Test", projectNo: 238, revision: 0, lastExportedAt: null, createdAt: 0, parts: [] };
  const Ekte = window.jspdf.jsPDF; let res = null;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); d.save = function () { res = { sider: d.internal.getNumberOfPages(), b64: d.output("datauristring").split(",")[1] }; return d; }; return d; };
  const opts = { cover: false, summary: false, floorplan: false, rooms: [], stairs: [st.id], roomTable: false, stairTable: false, materialList: false, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: "" };
  let feil = null; try { await exportPDF(opts); } catch (e) { feil = String(e); } finally { window.jspdf.jsPDF = Ekte; }
  return { clip: { x: b.left, y: b.top, width: b.width, height: Math.min(b.height, 2400) }, pdf: res, feil, em: st.edgeMargin_cm, repos: _stairLandingMarginNowCm(st), tot: st.totalCableLength_cm, fit: _stairCableSetFit(st).label };
})()`);
console.log(tag, JSON.stringify({ ...r, pdf: r.pdf && r.pdf.sider }));
await p.send("Emulation.setDeviceMetricsOverride", { width: 1400, height: Math.ceil(r.clip.height + 40), deviceScaleFactor: 2, mobile: false });
await sov(300);
await p.shot("docs/238/" + tag + "-panel.png", r.clip);
if (r.pdf) fs.writeFileSync("docs/238/probe/" + tag + ".pdf", Buffer.from(r.pdf.b64, "base64"));
await p.close(); process.exit(0);
