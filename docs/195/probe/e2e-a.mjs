// 195 e2e A: EKTE museklikk, EKTE tilbehørsvindu, nettleserens EGEN showSaveFilePicker.
// Headless Chrome har ingen dialog å vise og svarer AbortError straks — akkurat det en bruker som
// trykker «Avbryt» gir. Et for gammelt klikk gir SecurityError, ugyldige valg gir TypeError; ser vi
// AbortError, har nettleseren altså godtatt både klikket og valgene vi sender.
import { openPage, sov } from './cdp.mjs';
import { LITE } from './fixture.mjs';
import { oppsett, FOR, TILSTAND } from './oppsett.mjs';
const ut = {};
const GEN = 'button[onclick="_runExportPDF()"]';
const start = async (p) => {
  await p.eval(FOR);
  await p.eval(`(() => { ${LITE} ${oppsett('ekte')} _showExportDialog(); document.querySelector('${GEN}').scrollIntoView(); })()`);
};

// A1: Generer PDF → tilbehørsvinduet står åpent i 6 s (lenger enn klikket gjelder) → «Generer
// rapport» → lagre-dialogen. Klikket i tilbehørsvinduet skal være det som teller.
{
  const p = await openPage('http://localhost:4000/'); await start(p);
  await p.clickSel(GEN); await sov(400);
  const mellom = await p.eval(TILSTAND);
  await sov(6000);
  await p.clickSel('#acc-confirm'); await sov(2500);
  ut.A1 = { tilbehorVist: mellom.tilbehor, pickerForTilbehor: mellom.picker.length, ...(await p.eval(TILSTAND)) };
  await p.close();
}
// A2: klikket er for gammelt når dialogen skal åpnes (tilbehørsvinduet byttet ut med en 6 s
// forsinkelse uten nytt klikk) → SecurityError → vanlig nedlasting, ingen død knapp.
{
  const p = await openPage('http://localhost:4000/'); await start(p);
  await p.eval(`window.showAccessoriesModal = () => new Promise(r => setTimeout(() => r({ items: [] }), 6000))`);
  await p.clickSel(GEN); await sov(9000);
  ut.A2 = await p.eval(TILSTAND);
  await p.close();
}
// A3: valget slått av med et ekte klikk på avkrysningen → dagens nedlasting, og valget huskes.
{
  const p = await openPage('http://localhost:4000/'); await start(p);
  await p.clickSel('#exp-savepicker'); await sov(150);
  const avkrysset = await p.eval(`document.getElementById('exp-savepicker').checked`);
  await p.clickSel(GEN); await sov(400); await p.clickSel('#acc-confirm'); await sov(2500);
  ut.A3 = { avkryssetEtterKlikk: avkrysset, ...(await p.eval(TILSTAND)) };
  ut.A3.nesteDialog = await p.eval(`(() => { _showExportDialog(); return document.getElementById('exp-savepicker').checked; })()`);
  await p.eval(`localStorage.removeItem(PDF_SAVE_PICKER_LS_KEY)`);
  await p.close();
}
console.log(JSON.stringify(ut, null, 1));
process.exit(0);
