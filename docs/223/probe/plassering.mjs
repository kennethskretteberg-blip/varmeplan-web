// 223: «rom, folie, kabel, matte, hindring, mål, trapp og tak-modulen havner på samme sted som før».
// Ved dpr 1 er tegningen uten rutenett ventet BIT-IDENTISK med HEAD (transformen er identiteten), så vi
// hasher hele lerretet (PNG) for fire utsnitt + tak-modulen, HEAD-kopi mot arbeidskopi. I tillegg
// skrives w2s for faste verdenspunkter ved dpr 2 (skal være like, og skal være i CSS-punkter).
//   node -e ' process.env.TAG="head"; process.env.URL0="http://localhost:4013/docs/223/probe/head/index.html"; import("./docs/223/probe/plassering.mjs") '
import fs from 'node:fs';
import { openPage } from './cdp.mjs';
import { FIX } from './fixture.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const tag = process.env.TAG || 'etter';
const ut = {};
for (const dsf of [1, 2]) {
  const p = await openPage(url, 9333, dsf);
  ut['dsf' + dsf] = await p.eval(`(async () => {
    S.varmefolie.gapCm = 2; ${FIX}
    S.ui.theme = 'light'; document.body.classList.add('light-theme'); S.ui.showGrid = false;
    const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
    const out = { dpr: window.devicePixelRatio, backing: [canvas.width, canvas.height], hash: {}, w2s: {} };
    const vis = (zoom, px, py, sel) => { S.view.zoom = zoom; S.view.panX = px; S.view.panY = py; S.ui.selectedRoomId = sel || null; S.ui.selectedStairId = null; renderSidebar(); updateCtxBar(); render(); };
    vis(0.45, 1050, 450, null);  out.hash.alt = hash(canvas.toDataURL('image/png'));
    vis(1.3, 200, 150, 31);      out.hash.kabelHindring = hash(canvas.toDataURL('image/png'));
    vis(1.3, 800, 150, 32);      out.hash.folieMaal = hash(canvas.toDataURL('image/png'));
    vis(1.0, 150, 700, 35);      out.hash.matte = hash(canvas.toDataURL('image/png'));
    vis(1.0, 560, 750, null); S.ui.selectedStairId = 9301; render(); out.hash.trapp = hash(canvas.toDataURL('image/png'));
    for (const [k, x, y] of [['origo', 0, 0], ['rom32', 800, 150], ['matte', 150, 700], ['trapp', 560, 750]]) { const s = w2s(x, y); out.w2s[k] = [Math.round(s.x * 1000) / 1000, Math.round(s.y * 1000) / 1000]; }
    // Tak-modulen: egen del, tak 25 × 10 m med renner (som _takRegressionTest206)
    try {
      window._showToast = () => {}; window._scheduleAutoSave = () => {}; window.confirm = () => true;
      addPart('roof');
      const part = S.project.parts[S.project.parts.length - 1], fid = S.floors.find(f => f.partId === part.id).id;
      S.ui.activePartId = part.id; S.ui.activeFloorId = fid; S.ui.drawMode = null;
      S.tak = { [fid]: _takManual([{ x: 0, y: 0 }, { x: 2500, y: 0 }, { x: 2500, y: 1000 }, { x: 0, y: 1000 }]) };
      _takSetRoofType(fid, 'pitched'); _takSetHeight(fid, 'eave_m', '10');
      S.view.zoom = 0.4; S.view.panX = 1250; S.view.panY = 500; renderSidebar(); updateCtxBar(); render();
      out.hash.tak = hash(canvas.toDataURL('image/png'));
      const s = w2s(2500, 1000); out.w2s.takHjorne = [Math.round(s.x * 1000) / 1000, Math.round(s.y * 1000) / 1000];
    } catch (e) { out.takFeil = String(e && e.message || e); }
    return out;
  })()`);
  await p.close();
}
fs.writeFileSync(`docs/223/probe/plassering-${tag}.json`, JSON.stringify(ut, null, 1));
console.log(tag, JSON.stringify(ut));
process.exit(0);
