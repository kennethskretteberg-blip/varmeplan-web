// 195: kjører de eksisterende PDF-/profil-testene (hver i sin egen fane) og skriver resultatet til
// docs/195/probe/<tag>.json. Bruk: TAG=for node -e ' import("./docs/195/probe/tester.mjs") '
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const tag = process.env.TAG || 'etter';
const navn = (process.env.TESTER || '_prefsRegressionTest,_profileNameRegressionTest,_cableOverviewRegressionTest,_foilResistanceRegressionTest,_foilEffectRegressionTest,_pdfExportSmokeTest,_pdfPreviewRegressionTest,_accessoryFoilQtyRegressionTest,_pdfSavePickerRegressionTest195').split(',');
const ut = {};
for (const t of navn) {
  const p = await openPage('http://localhost:4000/');
  try {
    const r = await p.eval(`(async () => {
      if (typeof ${t} !== 'function') return { mangler: true };
      const r = await ${t}();
      const res = (r && r.results) || [];
      return { ok: !!(r && r.ok), n: res.length, feil: res.filter(x => !x.ok).map(x => x.name + ' → forventet ' + JSON.stringify(x.expected) + ', fikk ' + String(JSON.stringify(x.got)).slice(0, 300)), navn: res.map(x => (x.ok ? '+ ' : '- ') + x.name) };
    })()`);
    ut[t] = r;
    console.log(t, r.mangler ? 'FINNES IKKE' : (r.ok ? 'BESTÅTT' : 'FEILET') + ' ' + (r.n - r.feil.length) + '/' + r.n);
    for (const f of (r.feil || [])) console.log('    ✗', f);
  } catch (e) { ut[t] = { unntak: String(e.message).slice(0, 500) }; console.log(t, 'UNNTAK', ut[t].unntak); }
  await p.close();
}
fs.writeFileSync(new URL(`./${tag}.json`, import.meta.url), JSON.stringify(ut, null, 1));
process.exit(0);
