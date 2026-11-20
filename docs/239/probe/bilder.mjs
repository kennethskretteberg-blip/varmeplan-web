// 239: skjermbilder for Kenneths eksempel — hestesko 340 × 105 (topp 200 × 35, 2 trinn à 35, opptrinn 17) + repos 540 × 200.
// TAG=eget («Eget trinn») | iplan («I plan»). Lager: <tag>-dialog.png, <tag>-plan.png (plan + side + panel), probe/<tag>.pdf
//   node -e ' process.env.TAG="eget"; import("./docs/239/probe/bilder.mjs") '
import fs from "node:fs";
import { openPage, sov } from "./cdpklient.mjs";
const tag = process.env.TAG || "eget";
const HSX = process.env.HSX || "";   // ekstra felt i horseshoe, f.eks. landing-ownCable
const p = await openPage(process.env.URL0 || "http://localhost:4000/", 9333, 2, 1500, 1000);
const r = await p.eval(`(async () => {
  window._performAutoSave = () => Promise.resolve(); window._scheduleAutoSave = () => {}; window._showToast = () => {};
  window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null);
  const LENS = [5, 10, 15, 20, 25, 30, 35, 40.1, 45, 49.7, 55.3, 60, 70, 78.7, 89.1, 98, 106.9, 128.2, 139.9];
  PRODUCT_CATEGORIES.length = 0; PRODUCT_CATEGORIES.push({ id: 9800, module_type: "cable", name: "TESTKABEL" });
  HEATING_PRODUCTS.length = 0;
  LENS.forEach((L, i) => HEATING_PRODUCTS.push({ id: 98000 + i, category_id: 9800, active: true, product_family: "InSnow 30T", name: "InSnow 30T " + Math.round(L * 30) + "W " + L + "m", cable_length_m: L, watt_per_m: 30, voltage: 230 }));
  S.rooms = []; S.strips = []; S.cables = []; S.mats = []; S.stairs = []; S.floors = [];
  S.counters.nextStairId = 923901;
  const HS = { topW_cm: 200, topD_cm: 35, count: 2, front_cm: 35, stepHeight_cm: 17, topLevel: "${tag === "iplan" ? "flush" : "below"}", landing: { w_cm: 540, d_cm: 200 }, marginMode: "fillTop" ${HSX} };
  const st = _createStairObj({ name: "Hestesko med repos", design: "horseshoe", horseshoe: HS, segments: _stairHsSegments(_stairHsParams({ horseshoe: HS })),
    riserOffset_cm: 2, noseOffset_cm: 2, edgeMargin_cm: 5, edgeMarginMin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, x_cm: 0, y_cm: 0, viewMode: "both" });
  S.stairs = [st]; S.ui.selectedStairId = st.id; _regenerateStairCable(st);
  for (const id of ["auth-screen", "project-list-screen"]) { const e = document.getElementById(id); if (e) e.style.display = "none"; }
  const app = document.getElementById("app"); if (app) app.style.display = "flex";
  try { resizeCanvas(); } catch (e) {}
  S.view.zoom = 0.55; S.view.panX = 748; S.view.panY = 394; document.head.insertAdjacentHTML("beforeend", "<style>#canvas-empty-state" + String.fromCharCode(123) + "display:none!important" + String.fromCharCode(125) + "</style>");
  _invalidateStairCache(); _updateStairSettingsPanel(); try { render(); } catch (e) {}
  const el = document.getElementById("stair-settings-panel"); el.style.display = "block"; el.style.left = "1180px"; el.style.top = "70px"; el.style.maxHeight = "none";
  S.project = { name: "Trapp 239", customer: "Test", projectNo: 239, revision: 0, lastExportedAt: null, createdAt: 0, parts: [] };
  const Ekte = window.jspdf.jsPDF; let res = null;
  window.jspdf.jsPDF = function (...a) { const d = new Ekte(...a); d.save = function () { res = { sider: d.internal.getNumberOfPages(), b64: d.output("datauristring").split(",")[1] }; return d; }; return d; };
  const opts = { cover: false, summary: false, floorplan: false, rooms: [], stairs: [st.id], roomTable: false, stairTable: false, materialList: false, resistance: false, cableTable: false, pricing: false, discount: 0, showDGDB: false, docs: false, signature: false, freeText: "" };
  let feil = null; try { await exportPDF(opts); } catch (e) { feil = String(e && e.stack || e); } finally { window.jspdf.jsPDF = Ekte; }
  render();
  return { id: st.id, pdf: res, feil, zoom: S.view.zoom, cables: st.cables.map(c => [c.zone, c.productId, c.edgeMargin_cm, c.error || ""].join("|")), tot: st.totalCableLength_cm };
})()`);
console.log(tag, JSON.stringify({ ...r, pdf: r.pdf && r.pdf.sider }));
await sov(400);
await p.shot("docs/239/" + tag + "-plan.png");
if (r.pdf) fs.writeFileSync("docs/239/probe/" + tag + ".pdf", Buffer.from(r.pdf.b64, "base64"));
await p.eval(`(() => { _showHsBuilder(${r.id}); return 1; })()`);
await sov(400);
await p.shot("docs/239/" + tag + "-dialog.png");
await p.close(); process.exit(0);
