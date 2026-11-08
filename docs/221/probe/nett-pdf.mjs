// 221: three.js blokkert, og PDF med 3D åpen mot lukket.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { aapne, sov, FILM } from './oppsett.mjs';
import { FIX, OPTS } from './fixture.mjs';
const R = [], sjekk = (navn, ok, fikk) => { R.push({ navn, ok: !!ok, fikk }); console.log((ok ? '  ok ' : '  ✗  ') + navn + (ok ? '' : '  → ' + JSON.stringify(fikk))); };
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const MELD = '3D-visningen kunne ikke lastes. Tegningen virker som før.';
const fast = `window.__fanget = null; { const E = window.jspdf.jsPDF; window.__Ekte = E;
  window.jspdf.jsPDF = function (...a) { const d = new E(...a); d.setCreationDate(new Date(Date.UTC(2026, 10, 8, 12))); d.setFileId('0123456789ABCDEF0123456789ABCDEF');
    d.save = (n) => { window.__fanget = d.output(); return d; }; return d; }; }`;
const lagre = p => p.eval(`(() => { try { const j = _buildSaveData(); return !!j && JSON.stringify(j).length; } catch (e) { return String(e); } })()`);

for (const [navn, blokk] of [['three.js blokkert', ['*cdn.jsdelivr.net/npm/three*']], ['varmeplan-3d.js blokkert', ['*varmeplan-3d.js*']]]) {
  console.log(navn);
  const p = await aapne({ blokker: blokk });
  const feil = []; 
  await p.clickSel('.tak3d-chip');
  for (let t = 0; t < 8000; t += 100) { await sov(100); if (await p.eval(`!!_tak3d && !!_tak3d.feilet`)) break; }
  const m = await p.eval(`document.getElementById('tak3d-msg').innerText`);
  sjekk('meldingen kommer', m.includes(MELD), m);
  sjekk('med «Prøv igjen»', m.includes('Prøv igjen'), m);
  await p.shot(`docs/221/${blokk[0].includes('three') || blokk[0].includes('three') ? 'three' : 'motor'}-blokkert.png`);
  sjekk('ingen kastede feil i siden', !p.events.some(e => e.method === 'Runtime.exceptionThrown'), p.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.text));
  // 2D virker: et ekte klikk på en kant åpner typemenyen, og tegningen rendres.
  const før = await p.eval(`S.tak[__fid].features.length`);
  await p.eval(`_takFeatStart(__fid, 'downspout')`); await sov(350);
  const pt = await p.eval(`(() => { const g = S.tak[__fid].features.find(f => f.type === 'GUTTER'), a = g.geometry.pts[0], b = g.geometry.pts[1], s = w2s(a.x + (b.x - a.x) * 0.3, a.y + (b.y - a.y) * 0.3), r = canvas.getBoundingClientRect(); return { x: r.left + s.x * r.width / canvas.width, y: r.top + s.y * r.height / canvas.height }; })()`);
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y }); await sov(350);
  await p.click(pt.x, pt.y); await sov(350); await p.eval(`_takFeatStop()`);
  sjekk('2D: nytt nedløp med ekte klikk', await p.eval(`S.tak[__fid].features.length`) === før + 1);
  sjekk('lagring bygges', (await lagre(p)) > 1000, await lagre(p));
  const pdf = await p.eval(`(async () => { window.showAccessoriesModal = () => Promise.resolve({ items: [] }); window._pdfBranding = () => Promise.resolve(null); ${fast}
    try { await exportPDF({ cover: true, summary: true, rooms: [], stairs: [] }); } catch (e) { return 'FEIL ' + e; } return window.__fanget ? window.__fanget.length : 'ingen'; })()`);
  sjekk('PDF lages', typeof pdf === 'number' && pdf > 1000, pdf);
  if (blokk[0].includes('three')) sjekk('lista og advarslene virker uten three.js', await p.eval(`document.querySelector('#tak3d-liste tr.sum') !== null`));
  // Nettet kommer tilbake.
  await p.send('Network.setBlockedURLs', { urls: [] });
  await p.clickSel('#tak3d-msg button');
  const ok = await p.klar(8000); await sov(200);
  sjekk('«Prøv igjen» virker når nettet er tilbake', ok && await p.eval(`document.getElementById('tak3d-msg').style.display === 'none' && !!_tak3d.view.querySelector('canvas')`), await p.eval(`document.getElementById('tak3d-msg').innerText`));
  await p.close();
}
console.log('PDF med 3D åpen mot lukket');
{
  const p = await aapne();
  // Et prosjekt med rom OG en tak-del, slik at 3D kan stå åpen mens rommene tegnes til PDF.
  const hash = await p.eval(`(async () => { ${FIX}
    const part = { id: 73, name: 'Tak', moduleType: 'roof' }; S.project.parts.push(part);
    const fl = { id: 9173, name: 'Tak', order: S.floors.length, collapsed: false, partId: 73 }; S.floors.push(fl);
    S.tak = { [fl.id]: ${fs.readFileSync('docs/3d/fixtures/' + FILM + '.json', 'utf8')} };
    window.__fid = fl.id; S.ui.activePartId = 73; S.ui.activeFloorId = fl.id; _takStepOpen = { [fl.id]: 3 }; setInitialView(); renderSidebar(); updateCtxBar(); render();
    ${fast} S.project.revision = 0; S.project.lastExportedAt = null; return S.rooms.length; })()`);
  sjekk('testprosjektet har rom', hash > 3, hash);
  const lag = async () => { await p.eval(`(async () => { window.__fanget = null; S.project.revision = 0; S.project.lastExportedAt = null; await exportPDF(${OPTS.includes('marking') ? OPTS : `Object.assign(${OPTS}, { marking: 'label' })`}); S.project.revision = 0; S.project.lastExportedAt = null; })()`); const s = await p.eval(`window.__fanget`); return s; };
  // Snitt-PDF-en fra 210 er den eneste PDF-en som lages fra selve tak-delen.
  const snitt = async () => p.eval(`(() => { const on = _takSectionTargets(S.tak[__fid])[0].on; const r = _takSectionPDF(__fid, on, { noSave: true }); return r.doc.output(); })()`);
  const SA = await snitt();
  const A = await lag();
  await p.clickSel('.tak3d-chip'); await p.klar(); await sov(500);
  sjekk('3D står åpen under PDF', await p.eval(`!!_tak3d.vis && canvas.width < 1000`), await p.eval(`canvas.width`));
  const B = await lag();
  const SB = await snitt();
  sjekk('3D står fortsatt åpen etter PDF', await p.eval(`!!_tak3d && !!_tak3d.vis`));
  sjekk('lerretet er tilbake i ruta-størrelse', await p.eval(`canvas.width === document.getElementById('canvas-wrap').clientWidth`));
  await p.clickSel('.tak3d-chip'); await sov(400);
  const C = await lag();
  const info = { lengde: [A.length, B.length, C.length], sha_lukket: sha(Buffer.from(A, 'latin1')), sha_aapen: sha(Buffer.from(B, 'latin1')), sha_lukket_igjen: sha(Buffer.from(C, 'latin1')), sider: (A.match(/\/Type \/Page\b/g) || []).length };
  console.log(info);
  sjekk('PDF: åpen 3D = lukket, byte for byte', A === B, info);
  sjekk('PDF: lukket igjen = første', A === C, info);
  sjekk('snitt-PDF: åpen 3D = lukket, byte for byte', SA === SB, [SA.length, SB.length, sha(Buffer.from(SA, 'latin1')), sha(Buffer.from(SB, 'latin1'))]);
  info.snitt = { lengde: [SA.length, SB.length], sha_lukket: sha(Buffer.from(SA, 'latin1')), sha_aapen: sha(Buffer.from(SB, 'latin1')) };
  fs.writeFileSync('docs/221/probe/pdf.json', JSON.stringify(info, null, 1));
  await p.close();
}
fs.writeFileSync('docs/221/probe/nett-pdf.json', JSON.stringify(R, null, 1));
const f = R.filter(r => !r.ok); console.log(`\nBESTÅTT ${R.length - f.length} av ${R.length}`); process.exit(f.length ? 1 : 0);
