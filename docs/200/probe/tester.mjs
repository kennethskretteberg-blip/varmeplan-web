// 200 (kopi fra 196): kjører testene (hver i sin egen fane) og skriver resultatet til docs/200/probe/<tag>.json.
// Bruk: node -e ' process.env.TAG="etter"; process.env.TESTER="a,b"; import("./docs/200/probe/tester.mjs") '
import { openPage } from './cdp.mjs';
import fs from 'node:fs';
const tag = process.env.TAG || 'tester-etter';
const url = process.env.URL0 || 'http://localhost:4000/';
const navn = (process.env.TESTER || '_pdfNumberModeRegressionTest,_pdfExportSmokeTest,_pdfPreviewRegressionTest,_pdfSavePickerRegressionTest195,_prefsRegressionTest,_profileNameRegressionTest,_cableOverviewRegressionTest,_foilResistanceRegressionTest,_foilEffectRegressionTest,_accessoryFoilQtyRegressionTest').split(',');
const ut = {};
for (const t of navn) {
  const p = await openPage(url);
  try {
    const r = await p.eval(`(async () => {
      if (typeof ${t} !== 'function') return { mangler: true };
      const r = await ${t}();
      const res = (r && r.results) || [];
      return { ok: !!(r && r.ok), n: res.length, feil: res.filter(x => !x.ok).map(x => x.name + ' → forventet ' + JSON.stringify(x.expected) + ', fikk ' + String(JSON.stringify(x.got)).slice(0, 600)), navn: res.map(x => (x.ok ? '+ ' : '- ') + x.name) };
    })()`);
    ut[t] = r;
    console.log(t, r.mangler ? 'FINNES IKKE' : (r.ok ? 'BESTÅTT' : 'FEILET') + ' ' + (r.n - r.feil.length) + '/' + r.n);
    for (const f of (r.feil || [])) console.log('    ✗', f);
  } catch (e) { ut[t] = { unntak: String(e.message).slice(0, 500) }; console.log(t, 'UNNTAK', ut[t].unntak); }
  await p.close();
}
fs.writeFileSync(new URL(`./${tag}.json`, import.meta.url), JSON.stringify(ut, null, 1));
process.exit(0);
