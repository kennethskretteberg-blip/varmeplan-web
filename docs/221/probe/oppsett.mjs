// 221: felles oppsett — et tak fra fixturene i ekte app, med logg over nettkall (CDP).
import fs from 'node:fs';
import { openPage, sov } from './cdp.mjs';
export { sov };
export const fixtur = n => fs.readFileSync(`docs/3d/fixtures/${n}.json`, 'utf8');
export const FILM = '1-filmens-bygg', LFORM = '3-l-form-8-kanter';
export async function aapne({ url = process.env.URL0 || 'http://localhost:4000/', fix = FILM, steg = 3, w = 1400, h = 900, blokker = [] } = {}) {
  const p = await openPage(null);
  await p.send('Network.enable');
  if (blokker.length) await p.send('Network.setBlockedURLs', { urls: blokker });
  await p.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await p.goto(url);
  await p.eval(`(async () => { window._scheduleAutoSave = () => {}; window._showToast = () => {};
    for (const id of ['auth-screen','project-list-screen']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    _resetProjectState(); S.project.name = '221'; addPart('roof');
    document.getElementById('app').style.display = 'flex'; resizeCanvas();
    const part = S.project.parts[0], fid = S.floors.find(f => f.partId === part.id).id;
    S.ui.activePartId = part.id; S.ui.activeFloorId = fid; window.__fid = fid;
    S.tak = { [fid]: ${fix ? fixtur(fix) : 'null'} }; if (!S.tak[fid]) delete S.tak[fid]; _takStepOpen[fid] = ${steg};
    setInitialView(); try { fitAll(); } catch (e) {} renderSidebar(); updateCtxBar(); render(); document.activeElement && document.activeElement.blur(); })()`);
  await sov(300);
  p.nett = () => p.events.filter(e => e.method === 'Network.requestWillBeSent').map(e => e.params.request.url).filter(u => !u.startsWith('data:') && !u.startsWith('blob:'));
  p.nettFra = i => p.nett().slice(i);
  p.klar = async (ms = 15000) => { for (let t = 0; t < ms; t += 100) { if (await p.eval(`!!(_tak3d && _tak3d.vis)`)) return true; await sov(100); } return false; };
  return p;
}
