// 225: hvorfor «220: Vises: m2 valgt → k4 og k8 lyser» avhenger av lerretsstørrelsen.
// Gjenskaper testens oppsett (L-tak, to møner, m2 valgt) og leser pikslene 0–12 px innenfor k4 og k8.
//   node -e ' import("./docs/225/probe/t220.mjs") '      (W/H/URL0 som i alle.mjs)
import fs from "node:fs";
import { openPage } from './cdpklient.mjs';
const url = process.env.URL0 || 'http://localhost:4013/';
const w = Number(process.env.W || 1400), h = Number(process.env.H || 900);
const p = await openPage(url, 9333, 1, w, h);
const r = await p.eval(`(async () => {
  try { await _loadProducts(); } catch (e) {}
  window._showToast = () => {}; window._scheduleAutoSave = () => {};
  const app = document.getElementById('app'); app.style.display = 'flex'; resizeCanvas();
  _resetProjectState(); addPart('roof');
  const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
  S.ui.activePartId = part.id; S.ui.activeFloorId = fid; S.ui.drawMode = null; S.ui.toolMode = 'arrow';
  const L = [[0,0],[1400,0],[1400,700],[900,700],[900,1200],[200,1200],[200,900],[0,900]].map(([x, y]) => ({ x, y }));
  const typer = { k1: 'eave', k2: 'rake', k3: 'eave', k4: 'eave', k5: 'rake', k6: 'eave', k7: 'eave', k8: 'eave' };
  _takRidgeSel = null; S.tak = { [fid]: _takManual(L) }; _takSetRoofType(fid, 'pitched'); _takStepOpen[fid] = 3; fitAll(); render();
  _takSetHeight(fid, 'eave_m', '5,4'); _takSetHeight(fid, 'ridge_m', '8,2'); for (const [id, ty] of Object.entries(typer)) _takSetEdgeType(fid, id, ty);
  const mus = (type, wp, px) => { const s = w2s(wp.x, wp.y), r = canvas.getBoundingClientRect(), k = r.width / _cvW();
    canvas.dispatchEvent(new MouseEvent(type, { clientX: r.left + (s.x + (px ? px[0] : 0)) * k, clientY: r.top + (s.y + (px ? px[1] : 0)) * k, bubbles: true, cancelable: true, button: 0, buttons: type === 'mousedown' ? 1 : 0 })); };
  const klikk = (wp, px) => { mus('mousedown', wp, px); mus('mouseup', wp, px); mus('click', wp, px); };
  _takFeatStart(fid, 'ridge');
  klikk({ x: 1400, y: 350 }, [-5, 3]); klikk({ x: 550, y: 350 });
  klikk({ x: 550, y: 1200 }, [4, -6]); klikk({ x: 550, y: 350 }, [6, 4]);
  _takFeatStop();
  _takRidgeSelect(fid, 'm2'); render();
  const halo = { k4: { x: 900, y: 950, n: [-1, 0] }, k8: { x: 0, y: 450, n: [1, 0] }, k1: { x: 700, y: 0, n: [0, 1] } };
  const ut = { cw: _cvW(), ch: _cvH(), dpr: _cvDpr, zoom: S.view.zoom, m2: (S.tak[fid].edges.find(e => e.id === 'm2') || {}).ridge_link, edges: S.tak[fid].edges.filter(e => e.kind === 'line').map(e => [e.id, e.a, e.b]) };
  for (const [id, hp] of Object.entries(halo)) {
    const s = w2s(hp.x, hp.y); const rad = [];
    for (let d = -4; d <= 14; d++) { const px = ctx.getImageData(Math.round((s.x + hp.n[0] * d) * _cvDpr), Math.round((s.y + hp.n[1] * d) * _cvDpr), 1, 1).data; rad.push(d + ':' + [px[0], px[1], px[2], px[3]].join(',')); }
    ut[id] = rad;
  }
  const k8e = S.tak[fid].edges.find(e => e.id === "k8"); ut.k8e = k8e && [k8e.a, k8e.b, k8e.type, k8e.ridge_link];
  const sy = w2s(0, 450), row = []; for (let x = 0; x < _cvW(); x++) { const px = ctx.getImageData(Math.round(x * _cvDpr), Math.round(sy.y * _cvDpr), 1, 1).data; if (px[1] > 150 && px[0] < 60) row.push(x); }
  ut.greenX = row; ut.sx0 = sy; ut.view = { ...S.view }; ut.poly = S.tak[fid].surfaces && S.tak[fid].surfaces[0].footprint.world.slice(0, 8);
  ut.png = canvas.toDataURL("image/png");
  return ut;
})()`);
console.log(JSON.stringify({cw:r.cw,greenX:r.greenX,k8e:r.k8e}));
fs.writeFileSync("docs/225/probe/t220-lerret.png", Buffer.from(r.png.split(",")[1], "base64"));
await p.close(); process.exit(0);
