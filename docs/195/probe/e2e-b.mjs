// 195 e2e B: EKTE museklikk, og lagre-dialogen byttet ut med et EKTE FileSystemFileHandle i
// nettleserens private filsystem (OPFS) — createWritable/write/close/remove er nettleserens egne.
// Fila leses tilbake og kontrolleres. I tillegg skjermbilder av PDF-dialogen.
import { openPage, sov } from './cdp.mjs';
import { LITE, STORT } from './fixture.mjs';
import { oppsett, FOR, TILSTAND, LES } from './oppsett.mjs';
import fs from 'node:fs';
const ut = {};
const GEN = 'button[onclick="_runExportPDF()"]';
const bilde = n => new URL('../' + n, import.meta.url).pathname;
const start = async (p, fix, modus) => {
  await p.eval(FOR);
  await p.eval(`(() => { ${fix} ${oppsett(modus)} _showExportDialog(); document.querySelector('${GEN}').scrollIntoView(); })()`);
};
const utsnitt = async (p, sel) => p.eval(`(() => { const b = document.querySelector('${sel}').closest('.exp-left').getBoundingClientRect(); return { x: b.left, y: Math.max(0, b.bottom - 330), width: b.width, height: 330 }; })()`);

// B1: lite prosjekt — klikk gjennom, fila skrives, leses tilbake.
{
  const p = await openPage('http://localhost:4000/'); await start(p, LITE, 'opfs');
  await p.shot(bilde('dialog-hel.png'));
  await p.shot(bilde('dialog-avkrysning.png'), await utsnitt(p, '#exp-savepicker'));
  await p.clickSel(GEN); await sov(400); await p.clickSel('#acc-confirm'); await sov(3000);
  ut.B1 = { ...(await p.eval(TILSTAND)), fil: await p.eval(LES) };
  // lagre en kopi av PDF-en ved siden av skriptet, så den kan åpnes og ses på
  const b64 = await p.eval(`(async () => { const f = await window.__t.handle.getFile(); const u = new Uint8Array(await f.arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); })()`);
  fs.writeFileSync(new URL('./b1.pdf', import.meta.url), Buffer.from(b64, 'base64'));
  await p.close();
}
// B2: stort prosjekt (40 rom) — samme vei, med tid fra klikket til «PDF lagret».
{
  const p = await openPage('http://localhost:4000/'); await start(p, STORT, 'opfs');
  await p.clickSel(GEN); await sov(400);
  await p.eval(`window.__ferdig = null; window._showToast = (m, ty) => { window.__t.toasts.push([String(m), ty || '']); if (/^PDF lagret/.test(m)) window.__ferdig = Math.round(performance.now() - window.__t.t0); }`);
  await p.clickSel('#acc-confirm'); await sov(6000);
  ut.B2 = { ...(await p.eval(TILSTAND)), msKlikkTilLagret: await p.eval('window.__ferdig'), fil: await p.eval(LES) };
  await p.close();
}
// B3: byggingen feiler etter at fila er valgt → fila fjernes fra disken (ekte handle.remove()).
{
  const p = await openPage('http://localhost:4000/'); await start(p, LITE, 'opfs');
  await p.eval(`window._pdfStampBranding = () => { throw new Error('VAKSINE 195'); }`);
  await p.clickSel(GEN); await sov(400); await p.clickSel('#acc-confirm'); await sov(3000);
  ut.B3 = { ...(await p.eval(TILSTAND)), fil: await p.eval(LES),
    filerIgjen: await p.eval(`(async () => { const d = await navigator.storage.getDirectory(); const n = []; for await (const k of d.keys()) n.push(k); return n; })()`) };
  await p.close();
}
// B4: nettleser uten API-et → forklaringen i dialogen, vanlig nedlasting.
{
  const p = await openPage('http://localhost:4000/'); await p.eval(FOR);
  await p.eval(`(() => { ${LITE} ${oppsett('ekte')} window.showSaveFilePicker = undefined; _showExportDialog(); document.querySelector('${GEN}').scrollIntoView(); })()`);
  await p.shot(bilde('dialog-uten-api.png'), await utsnitt(p, '#exp-savepicker-info'));
  const tekst = await p.eval(`document.getElementById('exp-savepicker-info').textContent`);
  await p.clickSel(GEN); await sov(400); await p.clickSel('#acc-confirm'); await sov(3000);
  ut.B4 = { tekst, avkrysning: await p.eval(`!!document.getElementById('exp-savepicker')`), ...(await p.eval(TILSTAND)) };
  await p.close();
}
// rydd OPFS (testfilene) og valget
{ const p = await openPage('http://localhost:4000/');
  ut.ryddet = await p.eval(`(async () => { const d = await navigator.storage.getDirectory(); const n = []; for await (const k of d.keys()) n.push(k); for (const k of n) await d.removeEntry(k); try { localStorage.removeItem(PDF_SAVE_PICKER_LS_KEY); } catch (e) {} return n; })()`);
  await p.close(); }
console.log(JSON.stringify(ut, null, 1));
process.exit(0);
