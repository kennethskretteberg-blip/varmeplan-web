// 218: patch av index.html — eksakte strenger, hver må finnes nøyaktig én gang.
import fs from 'node:fs';
let s = fs.readFileSync('index.html', 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('fant ' + n + ' av: ' + a.slice(0, 80)); s = s.replace(a, () => b); };

// 1) Hjelpere etter splitRoomWithPolyline
rep(`    if (i === endWallIdx) break;
    i = (i + 1) % n;
  }
  return [polyA, polyB];
}
`, `    if (i === endWallIdx) break;
    i = (i + 1) % n;
  }
  return [polyA, polyB];
}

// ─── 218 · HINDRING FRA SAMME VEGG ──────────────────────────────
// Kenneth 09.11.2026: «en pipe midt på en vegg — klikk på veggen, to klikk for hjørnene og siste
// klikk tilbake til veggen». Før ble klikk 4 på startveggen avvist («må gå mellom to forskjellige
// vegger»). Nå lukkes hindringen rett langs veggen mellom siste og første klikk — den korte veien,
// aldri rundt rommet: siste → første er polygonens egen lukkekant, og begge punktene ligger på
// veggen, så kanten ER veggen. Ulike vegger går som før gjennom splitRoomWithPolyline + valg av halvdel.

// Vinkelsnapp for strekene i vegg-til-vegg-hindringen. I tillegg til de vanlige 90°/45°-retningene
// (angleSnap) snapper streken vinkelrett på og parallelt med startveggen, så klikk 2 går rett ut fra
// veggen og klikk 3 langs den — også når veggen står skrått. På en vannrett/loddrett vegg er de to
// settene like, og den vanlige snappen vinner alltid når den er like nær. Shift og snapp-brikkene
// (S.snap.a90/a45) virker som i angleSnap.
function _hindW2WAngleSnap(wx, wy, from, wall) {
  const base = angleSnap(wx, wy, from);
  if (!wall || S.shiftHeld || (!S.snap.a90 && !S.snap.a45)) return base;
  const dx = wx - from.x, dy = wy - from.y, len = Math.hypot(dx, dy);
  if (len < 1) return base;
  const wa = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180 / Math.PI;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;
  const step = S.snap.a45 ? 45 : 90;
  const diff = (a, b) => Math.abs(((a - b) + 540) % 360 - 180);
  let best = null, bestD = 11;
  for (let c = wa; c < wa + 360; c += step) { const d = diff(ang, c); if (d < bestD) { bestD = d; best = c; } }
  if (best === null) return base;
  const baseD = (base.x === wx && base.y === wy) ? 99 : diff(ang, Math.atan2(base.y - from.y, base.x - from.x) * 180 / Math.PI);
  if (baseD <= bestD) return base;
  const r = best * Math.PI / 180;
  return { x: from.x + Math.cos(r) * len, y: from.y + Math.sin(r) * len };
}

// Sluttpunktet på startveggen: klikket vinkelsnappes fra siste hjørne (vinkelrett inn mot veggen
// når det er nær nok) og projiseres så på veggen. Dermed blir en pipe tegnet med fire klikk et
// rektangel, ikke 60,3 × 40 fordi hånden lå litt skjevt på siste klikk.
function _hindW2WSameWallEnd(room, wallIdx, last, wx, wy) {
  const wall = room.walls[wallIdx];
  const sn = _hindW2WAngleSnap(wx, wy, last, wall);
  const dx = wall.x2 - wall.x1, dy = wall.y2 - wall.y1, l2 = dx * dx + dy * dy;
  if (!l2) return { x: wx, y: wy };
  const t = Math.max(0, Math.min(1, ((sn.x - wall.x1) * dx + (sn.y - wall.y1) * dy) / l2));
  return { x: wall.x1 + t * dx, y: wall.y1 + t * dy };
}

// Hindringen når start og stopp er på samme vegg: klikkpunktene + sluttpunktet, lukket langs veggen.
// null = ugyldig (ingen hjørner ute i rommet, eller arealet er ubetydelig — samme grense som for
// to vegger, 100 cm²).
function _hindW2WSameWallPoly(pts, endPt) {
  const poly = [...pts.map(p => ({ x: p.x, y: p.y })), { x: endPt.x, y: endPt.y }];
  if (poly.length < 3 || compArea(poly) < 100) return null;
  return poly;
}

// Regresjon 218: ekte klikk på lerretet gjennom mousedown-håndtereren.
function _hindW2WRegressionTest218() {
  const results = [];
  const check = (name, expected, cond, got) => results.push({ name, ok: !!cond, expected, got });
  const saved = { rooms: S.rooms, hindrings: S.hindrings, cables: S.cables, strips: S.strips, mats: S.mats, foilFree: S.foilFree,
    view: { ...S.view }, drawMode: S.ui.drawMode, drawing: S.drawing, snap: { ...S.snap }, shift: S.shiftHeld,
    ui: { hindringRoomId: S.ui.hindringRoomId, hindringType: S.ui.hindringType, hindringCustomName: S.ui.hindringCustomName, selectedRoomId: S.ui.selectedRoomId, selectedHindringId: S.ui.selectedHindringId },
    nextHindringId: S.counters.nextHindringId, alert: window.alert, autoSave: window._performAutoSave, toast: window._showToast,
    appDisplay: document.getElementById('app')?.style.display, cw: canvas.width, ch: canvas.height };
  let alerts = [];
  window.alert = m => alerts.push(String(m)); window._performAutoSave = () => Promise.resolve(); window._showToast = () => {};
  const app = document.getElementById('app');
  const shownApp = app && !canvas.getBoundingClientRect().width;
  if (shownApp) { app.style.display = 'flex'; resizeCanvas(); }
  try {
    const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
    const pts = rect(0, 0, 400, 300);
    const room = { id: 9218, floorId: S.ui.activeFloorId, partId: S.ui.activePartId, name: '218', points: pts, walls: compWalls(pts), area: 120000, dims: [], annotOffsets: {} };
    S.rooms = [room]; S.hindrings = []; S.cables = []; S.strips = []; S.mats = []; S.foilFree = [];
    S.snap.a90 = true; S.snap.a45 = false; S.snap.grid = false; S.shiftHeld = false;
    S.view.zoom = Math.min(canvas.width / 520, canvas.height / 420) / BASE_SCALE; S.view.panX = 200; S.view.panY = 150;
    const click = (x, y) => { const sp = w2s(x, y), r = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: r.left + sp.x * (r.width / canvas.width), clientY: r.top + sp.y * (r.height / canvas.height), button: 0, bubbles: true })); };
    const start = () => { S.ui.hindringRoomId = 9218; S.ui.hindringType = 'annet'; S.ui.hindringCustomName = 'Pipe'; S.ui.drawMode = 'hindring-w2w'; S.drawing.active = true; S.drawing.points = []; S.drawing.rectStart = null;
      S.drawing.hindringW2W = { startWallIdx: null, startPt: null, endWallIdx: null, endPt: null, phase: 0, pendingSplit: null, hoverSide: null }; alerts = []; };
    const sig = h => h.points.map(p => Math.round(p.x) + ',' + Math.round(p.y)).sort().join(' ');
    const run = (clicks) => { start(); for (const [x, y] of clicks) click(x, y); return S.hindrings[S.hindrings.length - 1]; };
    const n0 = S.hindrings.length;
    // A: pipe 60 × 40 midt på øvre vegg (4 m): klikk 1 og 4 på veggen (litt utenfor, snappes), 2 og 3 ute i rommet
    const A = run([[170, -3], [172, 40], [230, 41], [231, -3]]);
    check('A: fire klikk med start og stopp på samme vegg gir én hindring', 1, S.hindrings.length === n0 + 1 && S.ui.drawMode === null, S.hindrings.length - n0 + ' · modus ' + S.ui.drawMode);
    check('A: rektangel 170..230 × 0..40 lukket langs veggen', '170,0 170,40 230,0 230,40', A && sig(A) === '170,0 170,40 230,0 230,40', A && sig(A));
    check('A: areal 0,24 m²', 2400, A && Math.round(compArea(A.points)) === 2400, A && compArea(A.points));
    check('A: rom, etasje og navn som andre hindringer', '9218 · Pipe · wall', A && A.roomId === 9218 && A.label === 'Pipe' && A.clearance === 'wall' && A.floorId === room.floorId, A && (A.roomId + ' · ' + A.label + ' · ' + A.clearance));
    check('A: ingen alert', 0, alerts.length === 0, alerts.join(' | '));
    // B: samme pipe tegnet motsatt vei (klikk 1 til høyre, klikk 4 til venstre)
    const B = run([[230, -3], [229, 40], [170, 39], [169, -3]]);
    check('B: motsatt vei gir samme rektangel og areal', '170,0 170,40 230,0 230,40 · 2400', B && B !== A && sig(B) === sig(A) && Math.round(compArea(B.points)) === 2400, B && (sig(B) + ' · ' + compArea(B.points)));
    // C: knekk — fire hjørner ute i rommet, seks klikk
    const C = run([[100, -3], [100, 50], [130, 50], [130, 30], [160, 30], [160, -3]]);
    check('C: hindring med knekk fra samme vegg (6 klikk)', 6, C && C.points.length === 6 && S.ui.drawMode === null, C && C.points.length);
    check('C: areal 30·50 + 30·30 = 2400', 2400, C && Math.round(compArea(C.points)) === 2400, C && compArea(C.points));
    // D: helt inntil hjørnet — klikk 1 nær (0,0), nærmest øvre vegg → lukkes langs øvre vegg, ikke rundt rommet
    const D = run([[3, -2], [3, 40], [60, 40], [60, -2]]);
    check('D: ved hjørnet lukkes langs øvre vegg (0..40 dypt), areal 57·40', 2280, D && Math.round(compArea(D.points)) === 2280 && D.points.length === 4, D && (compArea(D.points) + ' · ' + D.points.length + ' pkt'));
    // D2: klikk 1 nærmest venstre vegg → lukkes langs venstre vegg
    const D2 = run([[-2, 3], [40, 3], [40, 60], [-2, 60]]);
    check('D2: ved hjørnet, venstre vegg: areal 40·57', 2280, D2 && Math.round(compArea(D2.points)) === 2280 && D2.points.every(p => p.x >= 0 && p.x <= 40), D2 && compArea(D2.points));
    // E: regresjon — start og stopp på ulike vegger: deling + valg av halvdel som før
    start(); click(-2, 100); click(100, 100); click(100, -2);
    const hw = S.drawing.hindringW2W;
    check('E: ulike vegger → fase 2 med to halvdeler', 'fase 2', hw.phase === 2 && hw.pendingSplit && hw.pendingSplit.polyA.length >= 3 && hw.pendingSplit.polyB.length >= 3, 'fase ' + hw.phase);
    const halves = hw.pendingSplit ? [compArea(hw.pendingSplit.polyA), compArea(hw.pendingSplit.polyB)].map(Math.round).sort((a, b) => a - b) : [];
    check('E: halvdelene er 10 000 og 110 000 cm²', '10000,110000', halves.join(',') === '10000,110000', halves.join(','));
    click(50, 50);
    const E = S.hindrings[S.hindrings.length - 1];
    check('E: klikk i den lille halvdelen gir hindring 100 × 100', 10000, E && E !== D2 && Math.round(compArea(E.points)) === 10000 && S.ui.drawMode === null, E && compArea(E.points));
    // F: to klikk på samme vegg uten hjørne ute i rommet → avvises, modus står
    const before = S.hindrings.length;
    start(); click(170, -3); click(230, -3);
    check('F: uten hjørner avvises lukkingen og tegningen fortsetter', 'ingen ny · fase 1 · 1 alert', S.hindrings.length === before && S.drawing.hindringW2W.phase === 1 && S.drawing.points.length === 1 && alerts.length === 1, S.hindrings.length - before + ' nye · fase ' + S.drawing.hindringW2W.phase + ' · ' + alerts.length + ' alert');
    exitDrawing();
    // G: vinkelsnapp — på vannrett vegg lik angleSnap; på skrå vegg vinkelrett/parallelt; Shift = rått
    const wallH = room.walls[0], fromH = { x: 170, y: 0 };
    let same = true;
    for (const [x, y] of [[172, 40], [210, 3], [140, -30], [200, 25], [230, 60]]) { const a = angleSnap(x, y, fromH), b = _hindW2WAngleSnap(x, y, fromH, wallH); if (Math.abs(a.x - b.x) > 1e-9 || Math.abs(a.y - b.y) > 1e-9) same = false; }
    check('G: vannrett vegg — snappen er identisk med angleSnap', true, same, same);
    const wallS = { x1: 0, y1: 0, x2: 100, y2: 100 * Math.tan(Math.PI / 6) };   // 30°
    const fromS = { x: 50, y: 50 * Math.tan(Math.PI / 6) };
    const a125 = 125 * Math.PI / 180, cur = { x: fromS.x + 40 * Math.cos(a125), y: fromS.y + 40 * Math.sin(a125) };
    const sn = _hindW2WAngleSnap(cur.x, cur.y, fromS, wallS);
    const dot = (sn.x - fromS.x) * (wallS.x2 - wallS.x1) + (sn.y - fromS.y) * (wallS.y2 - wallS.y1);
    check('G: skrå vegg (30°) — 125° snapper vinkelrett (120°), lengden beholdes', '⊥ · 40', Math.abs(dot) < 1e-6 && Math.abs(Math.hypot(sn.x - fromS.x, sn.y - fromS.y) - 40) < 1e-6, 'dot ' + dot.toFixed(4) + ' · ' + Math.hypot(sn.x - fromS.x, sn.y - fromS.y).toFixed(2));
    const a35 = 35 * Math.PI / 180, cur2 = { x: fromS.x + 30 * Math.cos(a35), y: fromS.y + 30 * Math.sin(a35) };
    const sn2 = _hindW2WAngleSnap(cur2.x, cur2.y, fromS, wallS);
    const cross = (sn2.x - fromS.x) * (wallS.y2 - wallS.y1) - (sn2.y - fromS.y) * (wallS.x2 - wallS.x1);
    check('G: skrå vegg — 35° snapper parallelt med veggen (30°)', '∥', Math.abs(cross) < 1e-6, 'kryss ' + cross.toFixed(4));
    S.shiftHeld = true; const raw = _hindW2WAngleSnap(cur.x, cur.y, fromS, wallS); S.shiftHeld = false;
    check('G: Shift gir rått punkt', true, raw.x === cur.x && raw.y === cur.y, raw.x === cur.x && raw.y === cur.y);
    // H: sluttpunktet projiseres vinkelrett fra siste hjørne når klikket er nær nok
    const end = _hindW2WSameWallEnd(room, 0, { x: 230, y: 40 }, 233, -4);
    check('H: siste klikk (233, −4) fra hjørnet (230, 40) lander på (230, 0)', '230,0', Math.abs(end.x - 230) < 1e-9 && Math.abs(end.y) < 1e-9, end.x.toFixed(2) + ',' + end.y.toFixed(2));
    check('H: uten hjørner er polygonen ugyldig', null, _hindW2WSameWallPoly([{ x: 170, y: 0 }], { x: 230, y: 0 }) === null, _hindW2WSameWallPoly([{ x: 170, y: 0 }], { x: 230, y: 0 }));
  } finally {
    S.rooms = saved.rooms; S.hindrings = saved.hindrings; S.cables = saved.cables; S.strips = saved.strips; S.mats = saved.mats; S.foilFree = saved.foilFree;
    Object.assign(S.view, saved.view); S.ui.drawMode = saved.drawMode; S.drawing = saved.drawing; Object.assign(S.snap, saved.snap); S.shiftHeld = saved.shift;
    Object.assign(S.ui, saved.ui); S.counters.nextHindringId = saved.nextHindringId;
    window.alert = saved.alert; window._performAutoSave = saved.autoSave; window._showToast = saved.toast;
    if (shownApp) { app.style.display = saved.appDisplay || ''; canvas.width = saved.cw; canvas.height = saved.ch; }
    canvas.style.cursor = 'default';
    _invalidateStripCache && _invalidateStripCache(); markDirty(); try { render(); } catch (e) {}
  }
  const fails = results.filter(r => !r.ok);
  console.log('218 hindring fra samme vegg: ' + (results.length - fails.length) + '/' + results.length + ' OK');
  fails.forEach(f => console.log('  FEIL ' + f.name + ' — forventet ' + JSON.stringify(f.expected) + ', fikk ' + JSON.stringify(f.got)));
  return results;
}
`);

// 2) Klikk-håndtereren: samme vegg lukkes langs veggen; hjørner snapper også relativt til veggen
rep(`      if (snap && snap.wallIdx === hw.startWallIdx) {
        alert('Hindringen må gå mellom to forskjellige vegger.');
        return;
      }
      // Intermediate waypoint — angle-snap from last
      const last = S.drawing.points[S.drawing.points.length - 1];
      const snapped = angleSnap(wp.x, wp.y, last);
      S.drawing.points.push({ x: snapped.x, y: snapped.y });
      updHint(); render();
      return;
    }
  } else if (mode==='bg-calibrate') {`, `      if (snap && snap.wallIdx === hw.startWallIdx) {
        // 218: tilbake på startveggen → lukk rett langs veggen (den korte veien), ingen halvdel å velge
        const lastPt = S.drawing.points[S.drawing.points.length - 1];
        const endPt = _hindW2WSameWallEnd(room, hw.startWallIdx, lastPt, wp.x, wp.y);
        const poly = _hindW2WSameWallPoly(S.drawing.points, endPt);
        if (!poly) { alert('Klikk minst ett hjørne ute i rommet før du går tilbake til veggen.'); return; }
        pushUndo();
        const hType = HINDRING_TYPES.find(t => t.id === S.ui.hindringType) || HINDRING_TYPES[HINDRING_TYPES.length-1];
        const customName = S.ui.hindringCustomName || '';
        S.hindrings.push({
          id: S.counters.nextHindringId++,
          type: S.ui.hindringType,
          label: customName || hType.name,
          roomId: room.id,
          floorId: _hindringFloorId(room.id),
          points: poly,
          clearance: 'wall',
        });
        exitDrawing(); renderSidebar(); render();
        return;
      }
      // Intermediate waypoint — angle-snap from last (218: også vinkelrett/parallelt med startveggen)
      const last = S.drawing.points[S.drawing.points.length - 1];
      const snapped = _hindW2WAngleSnap(wp.x, wp.y, last, room.walls[hw.startWallIdx]);
      S.drawing.points.push({ x: snapped.x, y: snapped.y });
      updHint(); render();
      return;
    }
  } else if (mode==='bg-calibrate') {`);

// 3) Forhåndsvisning: samme snapp, og lukkingen langs veggen vises når pekeren er ved startveggen
rep(`          const lastPt = pts[pts.length - 1];
          const snapped = angleSnap(mp.x, mp.y, lastPt);
          const sLast = w2s(lastPt.x, lastPt.y), sCur = w2s(snapped.x, snapped.y);`, `          const lastPt = pts[pts.length - 1];
          const snapped = _hindW2WAngleSnap(mp.x, mp.y, lastPt, hwRoom.walls[hw.startWallIdx]);   // 218
          const sLast = w2s(lastPt.x, lastPt.y), sCur = w2s(snapped.x, snapped.y);`);
rep(`            const eSp = w2s(endSnap.pt.x, endSnap.pt.y);
            ctx.fillStyle = '#22c55e';
            ctx.beginPath(); ctx.arc(eSp.x, eSp.y, 5, 0, Math.PI*2); ctx.fill();
          }
        }`, `            const eSp = w2s(endSnap.pt.x, endSnap.pt.y);
            ctx.fillStyle = '#22c55e';
            ctx.beginPath(); ctx.arc(eSp.x, eSp.y, 5, 0, Math.PI*2); ctx.fill();
          } else if (endSnap && pts.length >= 2) {
            // 218: tilbake på startveggen — vis hindringen slik den lukkes langs veggen
            const endPt = _hindW2WSameWallEnd(hwRoom, hw.startWallIdx, lastPt, mp.x, mp.y);
            const poly = _hindW2WSameWallPoly(pts, endPt);
            if (poly) {
              const sp = poly.map(p => w2s(p.x, p.y));
              ctx.beginPath(); ctx.moveTo(sp[0].x, sp[0].y);
              for (let i = 1; i < sp.length; i++) ctx.lineTo(sp[i].x, sp[i].y);
              ctx.closePath();
              ctx.fillStyle = 'rgba(34,197,94,0.18)'; ctx.fill();
              const sE = sp[sp.length - 1];
              ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]);
              ctx.beginPath(); ctx.moveTo(sE.x, sE.y); ctx.lineTo(sp[0].x, sp[0].y); ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = '#22c55e';
              ctx.beginPath(); ctx.arc(sE.x, sE.y, 5, 0, Math.PI*2); ctx.fill();
              const closeLen = Math.round(Math.hypot(poly[0].x - endPt.x, poly[0].y - endPt.y));
              if (closeLen > 5) {
                ctx.font = \`11px \${CANVAS_NUM_FONT}\`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                ctx.fillText(closeLen + ' cm', (sE.x + sp[0].x) / 2, (sE.y + sp[0].y) / 2 + 6);
              }
            }
          }
        }`);

// 4) Hint i fase 1
rep(`    else if(_hwPhase===1) h='Steg 2/3: Klikk p\\u00e5 motst\\u00e5ende vegg for \\u00e5 avslutte, eller klikk for \\u00e5 legge til mellompunkt \\u00b7 ESC avbryt';`,
    `    else if(_hwPhase===1) h='Steg 2/3: Klikk for \\u00e5 legge til hj\\u00f8rne \\u00b7 Klikk p\\u00e5 en vegg for \\u00e5 avslutte (samme vegg lukkes langs veggen) \\u00b7 ESC avbryt';`);

fs.writeFileSync('index.html', s);
console.log('patch1 ok');
