// 228: forhåndsvisningen — varselet under verktøylinja for justert utsnitt og for detaljutsnitt, + hjul forbi justeringen.
import { openPage } from './cdpklient.mjs';
import { FIX } from '../../217-hindring/probe/fixture.mjs';
const p = await openPage(process.env.URL0 || 'http://localhost:4000/', 9333, 1);
const ut = await p.eval(`(async () => {
  try { await _loadProducts(); } catch (e) {}
  S.varmefolie.gapCm = 2; ${FIX} _currentProfile = null;
  const kj = mk(41, 'Kjøkken', rect(3000, 0, 300, 300)); S.rooms.push(kj); kj.dimSnap = true;
  hind(941, 41, rect(3100, 110, 100, 80), 'ØY');
  _invalidateStripCache(); autoAddStrips(41, F60.id); _invalidateStripCache();
  const les = () => ({ note: document.getElementById('exp-pv-note').textContent, vist: document.getElementById('exp-pv-note').style.display, zoom: document.getElementById('exp-pv-zoom').textContent, lagret: kj.pdfView ? kj.pdfView.scale : null });
  const res = {};
  _showExportDialog();
  _expPreviewRoom(41); res.auto = les();
  kj.pdfView = { cx: 3135.5, cy: 150, scale: 1.6 }; _pdfPrevDraw(); res.kutt = les();
  const cv = _pdfPrev.cv, r = cv.getBoundingClientRect();
  const hjul = () => { cv.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true, cancelable: true })); _pdfPrevDraw(); return les(); };
  res.hjul = []; for (let i = 0; i < 4; i++) res.hjul.push(hjul());
  return res;
})()`);
console.log(JSON.stringify(ut, null, 1));
await p.shot('docs/228/etter-forhaandsvisning-varsel.png');
await p.close(); process.exit(0);
