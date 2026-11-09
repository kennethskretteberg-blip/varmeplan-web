// 218: forhåndsvisning — ved startveggen peker den stiplede streken på sluttpunktet på veggen (40 cm, ikke 44 til pekeren), og lukkelengden står utenfor rommet, ikke oppå veggteksten.
import fs from 'node:fs';
let s = fs.readFileSync('index.html', 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('fant ' + n + ' av: ' + a.slice(0, 80)); s = s.replace(a, () => b); };
rep(`          const lastPt = pts[pts.length - 1];
          const snapped = _hindW2WAngleSnap(mp.x, mp.y, lastPt, hwRoom.walls[hw.startWallIdx]);   // 218
          const sLast = w2s(lastPt.x, lastPt.y), sCur = w2s(snapped.x, snapped.y);`,
`          const lastPt = pts[pts.length - 1];
          let snapped = _hindW2WAngleSnap(mp.x, mp.y, lastPt, hwRoom.walls[hw.startWallIdx]);   // 218
          // 218: ved startveggen peker den stiplede streken på selve sluttpunktet på veggen (40 cm, ikke 44 cm til pekeren)
          const endSnap0 = snapToRoomWall(snapped.x, snapped.y, hwRoom, threshold);
          const sameWallEnd = (endSnap0 && endSnap0.wallIdx === hw.startWallIdx && pts.length >= 2) ? _hindW2WSameWallEnd(hwRoom, hw.startWallIdx, lastPt, mp.x, mp.y) : null;
          if (sameWallEnd) snapped = sameWallEnd;
          const sLast = w2s(lastPt.x, lastPt.y), sCur = w2s(snapped.x, snapped.y);`);
rep(`          } else if (endSnap && pts.length >= 2) {
            // 218: tilbake på startveggen — vis hindringen slik den lukkes langs veggen
            const endPt = _hindW2WSameWallEnd(hwRoom, hw.startWallIdx, lastPt, mp.x, mp.y);
            const poly = _hindW2WSameWallPoly(pts, endPt);`,
`          } else if (sameWallEnd) {
            // 218: tilbake på startveggen — vis hindringen slik den lukkes langs veggen
            const endPt = sameWallEnd;
            const poly = _hindW2WSameWallPoly(pts, endPt);`);
rep(`              const closeLen = Math.round(Math.hypot(poly[0].x - endPt.x, poly[0].y - endPt.y));
              if (closeLen > 5) {
                ctx.font = \`11px \${CANVAS_NUM_FONT}\`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                ctx.fillText(closeLen + ' cm', (sE.x + sp[0].x) / 2, (sE.y + sp[0].y) / 2 + 6);
              }`,
`              const closeLen = Math.round(Math.hypot(poly[0].x - endPt.x, poly[0].y - endPt.y));
              if (closeLen > 5) {
                // Lengden står på utsiden av veggen (bort fra hindringen), så den ikke legger seg over veggteksten inne i rommet
                const cxp = sp.reduce((a, q) => a + q.x, 0) / sp.length, cyp = sp.reduce((a, q) => a + q.y, 0) / sp.length;
                const mx = (sE.x + sp[0].x) / 2, my = (sE.y + sp[0].y) / 2, dl = Math.hypot(mx - cxp, my - cyp) || 1;
                ctx.font = \`11px \${CANVAS_NUM_FONT}\`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(closeLen + ' cm', mx + (mx - cxp) / dl * 12, my + (my - cyp) / dl * 12);
              }`);
fs.writeFileSync('index.html', s); console.log('patch4 ok');
