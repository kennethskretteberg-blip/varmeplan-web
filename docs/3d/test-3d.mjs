// 219: node docs/3d/test-3d.mjs [--md]   Sammenligner 3D-motoren med den EKTE 2D-motoren (skåret ut av index.html).
import fs from 'node:fs';
import path from 'node:path';
import { lastTodMotor, ROT } from './todmotor.mjs';
import { byggTak, maal, PALETT, STILER } from '../../varmeplan-3d.js';

const MM = 0.001, CM = 0.01;
const M = lastTodMotor();
const dir = path.join(ROT, 'docs/3d/fixtures');
const FIX = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort().map(f => ({ navn: f.replace('.json', ''), tak: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
let ok = 0, feil = 0;
const sjekk = (navn, sant, info) => { if (sant) ok++; else { feil++; console.log('  ✗', navn, info === undefined ? '' : '→ ' + (typeof info === 'object' ? JSON.stringify(info) : info)); } };
const likt = (navn, a, b, tol = MM) => sjekk(navn + ` (3D ${a}, 2D ${b})`, a != null && b != null && Math.abs(a - b) <= tol, Math.abs(a - b));
const tabell = [];
const rad = (fix, hva, tre, to) => tabell.push(`| ${fix} | ${hva} | ${tre.toFixed(3)} | ${to.toFixed(3)} | ${Math.abs(tre - to) * 1000 < 0.0005 ? '0' : (Math.abs(tre - to) * 1000).toFixed(3)} |`);
const sammenlign = (fix, hva, tre, to, tol) => { likt(`${fix}: ${hva}`, tre, to, tol); if (tre != null && to != null) rad(fix, hva, tre, to); };
const hoyde = (t, k) => t.surfaces[0].heights[k].value;
const kutt = (fix, id, a, b) => ({ fix, id, a, b });

// ── 1. Målene i 3D = tallene i 2D ──
console.log('1 · målene i 3D er lik tallene i 2D');
for (const { navn, tak } of FIX) {
  const t2 = M.regnUt(tak);
  // Fixturen skal være det 2D-motoren selv gir: ellers tester vi mot gamle tall.
  sjekk(`${navn}: fixturen er lik 2D-motorens egen utregning`, JSON.stringify(M.ren(t2)) === JSON.stringify(tak));
  const m = maal(byggTak(tak)), sum = M._takCableSummary(t2);
  for (const r of sum.rows.filter(x => x.kind === 'segment')) {
    const g = m.renner.find(x => x.id === r.of), sg = g && g.delstrekk.find(x => x.id === r.id);
    sjekk(`${navn}: delstrekk ${r.id} finnes`, !!sg);
    if (!sg) continue;
    sammenlign(navn, `delstrekk ${r.id}`, sg.lengde_m, r.length_m);
    sammenlign(navn, `kabel ${r.id} (${r.runs} løp)`, sg.kabel_m, r.cable_m);
    sjekk(`${navn}: ${r.id} antall løp`, sg.lop === r.runs, sg.lop);
  }
  for (const g of t2.features.filter(f => f.type === 'GUTTER')) sammenlign(navn, `rennestrekk ${g.id}`, m.renner.find(x => x.id === g.id).lengde_m, g.length_m);
  for (const r of sum.rows.filter(x => x.kind === 'DOWNSPOUT')) {
    const d = m.nedlop.find(x => x.id === r.id), f = t2.features.find(x => x.id === r.id);
    sammenlign(navn, `nedløp ${r.id} over bakken`, d.over_m, f.above_ground_m.value);
    if (f.continues_below_ground.value) sammenlign(navn, `nedløp ${r.id} under bakken`, d.under_m, f.below_ground_m.value);
    else likt(`${navn}: nedløp ${r.id} har ingen del under bakken`, d.under_m, 0);
    sammenlign(navn, `kabel ${r.id} (${r.runs} løp)`, d.kabel_m, r.cable_m);
    sjekk(`${navn}: ${r.id} antall tråder`, d.lop === r.runs, d.lop);
  }
  for (const r of sum.rows.filter(x => x.kind === 'VALLEY_GUTTER')) {
    const v = m.gradrenner.find(x => x.id === r.id);
    sammenlign(navn, `gradrenne ${r.id}`, v.lengde_m, r.length_m);
    sammenlign(navn, `kabel ${r.id} (${r.runs} løp)`, v.kabel_m, r.cable_m);
  }
  for (const r of sum.rows.filter(x => x.kind === 'BYPASS')) sammenlign(navn, `forbi ${r.id} (${r.runs} løp)`, m.forbi.find(x => x.id === r.id).kabel_m, r.cable_m);
  for (const g of t2.features.filter(f => f.type === 'SNOW_GUARD')) {
    sammenlign(navn, `snøfanger ${g.id}`, m.snofangere.find(x => x.id === g.id).lengde_m, g.length_m);
    const del = byggTak(tak).deler.find(d => d.type === 'snofanger' && d.ref === g.id), L2 = M._takGuardLine(t2, g);
    del.bane.forEach((p, i) => likt(`${navn}: snøfanger ${g.id} punkt ${i} står der 2D tegner den`, Math.hypot(p[0] - L2[i].x / 100, p[2] - L2[i].y / 100), 0));
  }
  sammenlign(navn, 'kabel renne', m.kabel.renne_m, sum.gutter_m);
  sammenlign(navn, 'kabel nedløp', m.kabel.nedlop_m, sum.downspout_m);
  sammenlign(navn, 'kabel gradrenne', m.kabel.gradrenne_m, sum.valley_m);
  sammenlign(navn, 'kabel forbi', m.kabel.forbi_m, sum.bypass_m);
  sammenlign(navn, 'SUM kabelløp (_takCableSummary)', m.kabel.tak_m, sum.total_m);
  // Flatt tak
  if (t2.flat) {
    const fs_ = M._takFlatSummary(t2);
    for (const d of t2.flat.features.filter(f => f.type === 'ROOF_DRAIN')) {
      const s = m.sluk.find(x => x.id === d.id), c = M._takFlatDrainCable(d);
      sammenlign(navn, `sluk ${d.id} ringer`, s.ring_m, c.ring_m);
      sammenlign(navn, `sluk ${d.id} rør`, s.ror_m, c.pipe_m || 0);
    }
    for (const v of t2.flat.features.filter(f => f.type === 'VALLEY_GUTTER')) sammenlign(navn, `gradrenne ${v.id} (flatt)`, m.gradrenner.find(x => x.id === v.id).lengde_m, v.length_m);
    for (const f of t2.flat.features.filter(x => x.type === 'HEAT_FIELD')) sammenlign(navn, `varmefelt ${f.id} m²`, m.varmefelt.find(x => x.id === f.id).areal_m2, f.area_m2);
    sammenlign(navn, 'ringer sum', m.kabel.sluk_ring_m, fs_.per.ROOF_DRAIN.ring_m);
    sammenlign(navn, `SUM oppsett «${fs_.setup}» (_takFlatSummary)`, m.kabel.sum_m, fs_.total.total_m);
  }
  const gs = M._takGuardSummary(t2);
  if (gs.heated) sammenlign(navn, 'snøfanger-felt', m.kabel.ikke_tegnet.filter(x => x.rolle === 'snofanger-felt').reduce((a, x) => a + x.kabel_m, 0), gs.total_m);
}

// Kontrolltallene fra 213
{
  const tak = FIX.find(f => f.navn === '1-filmens-bygg').tak;
  likt('filmens bygg: to løp i nedløpene = 110,15 m', maal(byggTak(tak)).kabel.tak_m, 110.15);
  const t = M.regnUt(tak);
  ['n1', 'n2', 'n3'].forEach(id => M._takSetRuns(M.FID, id, 1));
  const m1 = maal(byggTak(M.ren(t)));
  likt('filmens bygg: ett løp i nedløpene = 80,15 m', m1.kabel.tak_m, 80.15);
  tabell.push('| 1-filmens-bygg | **kontroll, to løp i nedløpene** | 110.150 | 110.150 (213) | 0 |', `| 1-filmens-bygg | **kontroll, ett løp i nedløpene** | ${m1.kabel.tak_m.toFixed(3)} | 80.150 (213) | 0 |`);
  sjekk('ett løp: én tråd per nedløp', m1.nedlop.every(d => d.lop === 1), m1.nedlop.map(d => d.lop));
}
// maal() måler geometrien: flyttes et punkt, endres tallet.
{
  const s = byggTak(FIX[0].tak), før = maal(s).kabel.nedlop_m;
  s.deler.find(d => d.type === 'kabel' && d.rolle === 'nedlop').bane[1][1] -= 1;
  likt('maal() leser geometrien, ikke dataene (1 m lengre tråd)', maal(s).kabel.nedlop_m, før + 1);
}

// Motoren leser dataene og endrer dem aldri.
for (const { navn, tak } of FIX) { const før = JSON.stringify(tak); byggTak(tak); sjekk(`${navn}: byggTak endrer ikke S.tak`, JSON.stringify(tak) === før); }

// ── 2. Nedløpet når bakken ──
console.log('2 · nedløpet når bakken');
for (const { navn, tak } of FIX) {
  const gz = hoyde(tak, 'ground_z');
  for (const d of (tak.features || []).filter(f => f.type === 'DOWNSPOUT')) {
    const m = maal(byggTak(tak)).nedlop.find(x => x.id === d.id);
    const maalet = d.continues_below_ground.value ? gz - d.below_ground_m.value : gz;
    likt(`${navn}: ${d.id} laveste punkt`, m.laveste_y, maalet, MM);
  }
}
{ // Dette er selve kontrollen: nedløp som IKKE når bakken skal se feil ut, og scenen skal si det.
  const tak = FIX.find(f => f.navn === '1-filmens-bygg').tak;
  const t = M.regnUt(tak);
  M._takSetDownspout(M.FID, 'n2', 'above', '9,6');
  const s = byggTak(M.ren(t)), m = maal(s).nedlop.find(x => x.id === 'n2');
  likt('9,6 m på 10 m gesims: slutter 0,40 m over bakken', m.laveste_y, 0.4);
  likt('9,6 m: samme som snittet i 2D (_takSectionModel.outlet_m)', m.laveste_y, M._takSectionModel(t, { type: 'DOWNSPOUT', id: 'n2' }).outlet_m);
  sjekk('9,6 m: scenen advarer', s.advarsler.some(a => a.includes('n2') && a.includes('0.40')), s.advarsler);
  const t2 = M.regnUt(tak);
  M._takSetDownspout(M.FID, 'n1', 'above', '10,5');
  const s2 = byggTak(M.ren(t2)), n1 = maal(s2).nedlop.find(x => x.id === 'n1');
  likt('10,5 m på 10 m gesims: går 0,50 m under terrenget', n1.laveste_y, -0.5);
  sjekk('10,5 m: scenen advarer', s2.advarsler.some(a => a.includes('n1')), s2.advarsler);
  const t3 = M.regnUt(FIX.find(f => f.navn === '5-nedlop-under-bakken').tak);
  sjekk('under bakken: egen del', byggTak(M.ren(t3)).deler.some(d => d.type === 'nedlop' && d.del === 'under'));
  sjekk('slutter over bakken: below_ground_m (standard 1,0) gir ingen del under', !byggTak(FIX[0].tak).deler.some(d => d.type === 'nedlop' && d.del === 'under'));
}

// ── 3. Takfoten i riktig høyde ──
console.log('3 · takfoten');
for (const { navn, tak } of FIX) {
  const gz = hoyde(tak, 'ground_z'), ev = hoyde(tak, 'eave_m');
  for (const r of maal(byggTak(tak)).renner) likt(`${navn}: ${r.id} senter`, r.senter_y, gz + ev, CM);
  for (const v of byggTak(tak).deler.filter(d => d.type === 'vegg')) likt(`${navn}: vegg ${v.ref} topp`, Math.max(...v.punkter.map(p => p[1])), gz + ev, MM);
}

// ── 4. Mønet ligger der 2D sier ──
console.log('4 · mønet');
const nær = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < MM;
for (const { navn, tak } of FIX) {
  const s = byggTak(tak), gz = hoyde(tak, 'ground_z'), rv = hoyde(tak, 'ridge_m');
  const kanter = (tak.edges || []).filter(e => e.type === 'ridge');
  sjekk(`${navn}: like mange møner som kanter av type ridge`, s.deler.filter(d => d.type === 'mone').length === kanter.length);
  for (const e of kanter) {
    const d = s.deler.find(x => x.type === 'mone' && x.ref === e.id);
    const A = [e.a.x / 100, gz + rv, e.a.y / 100], B = [e.b.x / 100, gz + rv, e.b.y / 100];
    sjekk(`${navn}: ${e.id} ligger på den lagrede linja`, nær(d.bane[0], A) && nær(d.bane[1], B), d.bane);
    const topp = s.deler.filter(x => x.type === 'takflate').flatMap(f => f.punkter);
    sjekk(`${navn}: takflatene når mønet i begge ender`, topp.some(p => nær(p, A)) && topp.some(p => nær(p, B)));
  }
}
{ // En møne som ikke ligger midt på: 2D sier hvor. En ny beregning ville lagt den midt på.
  const tak = M.ren(FIX.find(f => f.navn === '2-saltak').tak), m = tak.edges.find(e => e.id === 'm1');
  m.a.y += 150; m.b.y += 150;
  const fasitZ = m.a.y / 100;   // leses FØR motoren kjører
  const d = byggTak(tak).deler.find(x => x.type === 'mone');
  likt('forskjøvet møne følges, ikke midten av bygget', d.bane[0][2], fasitZ);
  sjekk('forskjøvet møne: takflatene når den', byggTak(tak).deler.filter(x => x.type === 'takflate').flatMap(f => f.punkter).some(p => Math.abs(p[2] - fasitZ) < MM && p[1] > 90));
}
{ // Uten lagret mønelinje finner motoren ikke på en.
  const uten = M.ren(FIX.find(f => f.navn === '3-l-form-8-kanter').tak);
  uten.edges = uten.edges.filter(e => e.type !== 'ridge'); uten.edges.forEach(e => delete e.ridge_link);
  const s = byggTak(uten);
  sjekk('L-form uten mønelinje: ingen møne', !s.deler.some(d => d.type === 'mone'));
  sjekk('L-form uten mønelinje: taket er ikke reist, og scenen sier det', s.deler.some(d => d.type === 'takflate' && d.form === 'ikke-reist') && s.advarsler.some(a => a.includes('ingen lagret mønelinje')), s.advarsler);
}

// ── 5. Begge stiler ──
console.log('5 · stiler');
for (const { navn, tak } of FIX) {
  const [a, b] = STILER.map(stil => byggTak(tak, { stil }));
  sjekk(`${navn}: stilene er ${STILER}`, a.stil === 'strek' && b.stil === 'farge');
  sjekk(`${navn}: samme geometri i begge stiler`, JSON.stringify({ ...a, stil: 0 }) === JSON.stringify({ ...b, stil: 0 }));
  for (const stil of STILER) for (const d of a.deler) sjekk(`${navn}: ${stil} har farge for ${d.type}`, !!PALETT[stil][d.type === 'nedlop' && d.del === 'under' ? 'nedlop_u' : d.type], d.type);
}

// ── 6. Møner og koblinger (220) ──
console.log('6 · møner og koblinger');
{
  const akse = d => d.trekanter.reduce((A, [i, j, k]) => { const a = d.punkter[i], b = d.punkter[j], c = d.punkter[k]; return A + Math.abs((b[0] - a[0]) * (c[2] - a[2]) - (c[0] - a[0]) * (b[2] - a[2])) / 2; }, 0);
  const omrissAreal = t => { const P = t.surfaces[0].footprint.world; let A = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; A += p.x * q.y - q.x * p.y; } return Math.abs(A) / 2 / 1e4; };
  const flater = s => s.deler.filter(d => d.type === 'takflate');
  // Arealet alene avslører ikke en flate som krysser seg selv (en sløyfe har samme planareal): sidene må også la hverandre være.
  const kr = (a, b, c) => (b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0]);
  const enkel = d => d.punkter.every((a, i) => d.punkter.every((c, j) => {
    const n = d.punkter.length, b = d.punkter[(i + 1) % n], e = d.punkter[(j + 1) % n];
    return j <= i + 1 || (i === 0 && j === n - 1) || !(kr(a, b, c) * kr(a, b, e) < -1e-9 && kr(c, e, a) * kr(c, e, b) < -1e-9);
  }));
  const dekker = (navn, s, t) => {
    likt(`${navn}: takflatene dekker hele omrisset (m²)`, flater(s).reduce((a, d) => a + akse(d), 0), omrissAreal(t));
    sjekk(`${navn}: ingen flate krysser seg selv`, flater(s).every(enkel), flater(s).map(d => d.punkter.map(p => [p[0], p[2]])));
  };
  const tom = (w, h) => { const t = M.nyttTak([{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]); M._takSetRoofType(M.FID, 'pitched'); M._takSetHeight(M.FID, 'eave_m', '5'); M._takSetHeight(M.FID, 'ridge_m', '8'); M._takRemoveEdgeLine(M.FID, 'm1'); return t; };   // uten forslaget fra 205

  // L-formen: reist, ingen lokk-advarsel, hele taket dekket.
  const L = FIX.find(f => f.navn === '3-l-form-8-kanter').tak, sL = byggTak(L);
  sjekk('L-form: alle takflater er reist', flater(sL).length > 1 && flater(sL).every(d => d.form === 'reist'), flater(sL).map(d => d.form));
  sjekk('L-form: advarselen «vises som et lokk» er borte', !sL.advarsler.some(a => a.includes('lokk')), sL.advarsler);
  dekker('L-form', sL, L);
  sjekk('L-form: to møner', sL.deler.filter(d => d.type === 'mone').length === 2);
  const [m1, m2] = L.edges.filter(e => e.type === 'ridge');
  sjekk('L-form: to møner møtes i samme punkt', m1.b.x === m2.b.x && m1.b.y === m2.b.y, [m1.b, m2.b]);
  sjekk('L-form: forslaget kobler hver takfot til riktig møne', ['k1', 'k3'].every(k => L.edges.find(e => e.id === k).ridge_link.id === m1.id) && ['k4', 'k6', 'k7', 'k8'].every(k => L.edges.find(e => e.id === k).ridge_link.id === m2.id), L.edges.filter(e => e.ridge_link).map(e => e.id + '→' + e.ridge_link.id));
  sjekk('L-form: gavlene har ingen kobling', ['k2', 'k5'].every(k => !L.edges.find(e => e.id === k).ridge_link));
  sjekk('L-form: k6/k7/k8 kan ikke ligge i ett plan, og scenen sier det', sL.advarsler.some(a => a.includes('k6, k7, k8') && a.includes('ett plan')), sL.advarsler);
  // Flatene er plane der dataene tillater det: fire takfot mot sine møner.
  const hAv = d => d.punkter.map(p => p[1] - hoyde(L, 'ground_z'));
  sjekk('L-form: hver flate går fra gesims til møne', flater(sL).every(d => Math.abs(Math.min(...hAv(d)) - 5.4) < MM && Math.abs(Math.max(...hAv(d)) - 8.2) < MM), flater(sL).map(hAv));

  // Rektangel: med koblinger og uten skal gi samme tak.
  const sal = FIX.find(f => f.navn === '2-saltak').tak, med = M.ren(sal);
  M.regnUt(med); const t2 = M._takOf(M.FID); M._takRidgeFill(t2, t2.surfaces[0]);
  const sa = byggTak(sal), sb = byggTak(M.ren(t2));
  sjekk('saltak: koblingene finnes i varianten', t2.edges.filter(e => e.ridge_link).length === 2, t2.edges.filter(e => e.ridge_link).length);
  dekker('saltak med koblinger', sb, sal);
  likt('saltak: samme takareal med og uten koblinger', flater(sb).reduce((a, d) => a + akse(d), 0), flater(sa).reduce((a, d) => a + akse(d), 0));
  sjekk('saltak: like mange gavlflater', sa.deler.filter(d => d.type === 'gavl').length === sb.deler.filter(d => d.type === 'gavl').length);
  likt('saltak: målene er like med og uten koblinger', maal(sb).kabel.sum_m, maal(sa).kabel.sum_m);

  // Høyde per møne, og den følger takflaten til den er rettet.
  const t3 = tom(1200, 800);
  const r = M._takAddRidge(M.FID, { x: 0, y: 400 }, { x: 1200, y: 400 });
  sjekk('høyde: standard er takflatens', r.height_m.value === 8 && r.height_m.height_ref === t3.surfaces[0].heights.ridge_m.height_ref && r.height_m.prov.from === 'ridge_m', r.height_m);
  sjekk('tegnet møne: USER_DRAWN', r.prov.source === 'USER_DRAWN' && r.kind === 'line', r.prov);
  M._takSetHeight(M.FID, 'ridge_m', '9');
  sjekk('høyde: følger takflaten når den ikke er rettet', M._takOf(M.FID).edges.find(e => e.id === r.id).height_m.value === 9);
  M._takSetRidgeHeight(M.FID, r.id, '7,5');
  M._takSetHeight(M.FID, 'ridge_m', '10');
  const r2 = M._takOf(M.FID).edges.find(e => e.id === r.id);
  sjekk('høyde: rettet står, selv om takflaten endres', r2.height_m.value === 7.5 && !r2.height_m.prov.from, r2.height_m);
  const s3 = byggTak(M.ren(M._takOf(M.FID)));
  likt('høyde: 3D leser mønets egen høyde', s3.deler.find(d => d.type === 'mone').bane[0][1], 7.5);
  sjekk('høyde: takflaten når mønets egen høyde', flater(s3).every(d => Math.abs(Math.max(...d.punkter.map(p => p[1])) - 7.5) < MM));
  M._takSetRidgeHeight(M.FID, r.id, '');
  sjekk('høyde: tomt felt = tilbake til takflatens', M._takOf(M.FID).edges.find(e => e.id === r.id).height_m.value === 10);
  M._takSetRidgeHeight(M.FID, r.id, '4');
  const s4 = byggTak(M.ren(M._takOf(M.FID)));
  sjekk('høyde: møne under gesims gir lokk og melding', flater(s4)[0].form === 'ikke-reist' && s4.advarsler.some(a => a.includes('ikke er over gesimsen')), s4.advarsler);

  // Takfot uten møne gir melding, ikke stille feil.
  const hull = M.ren(L); delete hull.edges.find(e => e.id === 'k6').ridge_link;
  const sh = byggTak(hull);
  sjekk('uten møne: 3D sier hvilken takfot (renna på kanten)', sh.advarsler.some(a => a.includes('r3 har ingen møne')), sh.advarsler);
  M.regnUt(hull);
  const tH = M._takOf(M.FID), html = M._takRidgeCardHtml(M.FID, tH, tH.surfaces[0]);
  sjekk('uten møne: panelet sier «r3 har ingen møne — takflaten kan ikke reises.»', html.includes('r3 har ingen møne — takflaten kan ikke reises.'), html);
  sjekk('L-form: panelet viser ingen mangel når alle er koblet', (M.regnUt(L), !M._takRidgeCardHtml(M.FID, M._takOf(M.FID), M._takOf(M.FID).surfaces[0]).includes('har ingen møne')));

  // Rett kobling: USER_CONFIRMED, og forslag røres ikke av et nytt møne etterpå.
  M.regnUt(L); M._takLinkEave(M.FID, 'k7', 'm1');
  const k7 = M._takOf(M.FID).edges.find(e => e.id === 'k7');
  sjekk('rett kobling: bytter møne og blir USER_CONFIRMED', k7.ridge_link.id === 'm1' && k7.ridge_link.prov.source === 'USER_CONFIRMED' && k7.ridge_link.prov.note === 'rettet fra m2', k7.ridge_link);
  sjekk('rett kobling: kanttypens opphav er urørt', k7.prov.note === 'rettet fra ikke valgt', k7.prov);
  M._takAddRidge(M.FID, { x: 900, y: 100 }, { x: 1300, y: 100 });
  sjekk('rett kobling: brukerens valg står etter et nytt møne', M._takOf(M.FID).edges.find(e => e.id === 'k7').ridge_link.id === 'm1');
  sjekk('forslag: flyttes til et nytt, nærmere møne', M._takOf(M.FID).edges.find(e => e.id === 'k1').ridge_link.id === 'm3', M._takOf(M.FID).edges.find(e => e.id === 'k1').ridge_link);

  // Fjerne mønet: koblingene flyttes eller slippes.
  M.regnUt(L); M._takRemoveEdgeLine(M.FID, 'm2');
  const etter = M._takOf(M.FID);
  sjekk('fjernet møne: takfotene går til det som er igjen', etter.edges.filter(e => e.ridge_link).every(e => e.ridge_link.id === 'm1') && etter.edges.filter(e => e.ridge_link).length === 6);
  M._takRemoveEdgeLine(M.FID, 'm1');
  sjekk('fjernet siste møne: ingen koblinger igjen', !M._takOf(M.FID).edges.some(e => e.ridge_link));

  // Ugyldig tegning.
  M.regnUt(L);
  const n0 = M._takOf(M.FID).edges.length;
  sjekk('utenfor omrisset: nektes', M._takAddRidge(M.FID, { x: 1200, y: 900 }, { x: 1300, y: 1100 }) === null && M._takOf(M.FID).edges.length === n0);
  sjekk('over det innvendige hjørnet: nektes', M._takAddRidge(M.FID, { x: 1200, y: 600 }, { x: 600, y: 1100 }) === null && M._takOf(M.FID).edges.length === n0);
  const flatt = M.regnUt(FIX.find(f => f.navn === '4-flatt-tak').tak);
  sjekk('flatt tak: ingen møne', M._takAddRidge(M.FID, { x: 100, y: 100 }, { x: 900, y: 100 }) === null && !M._takOf(M.FID).edges.some(e => e.type === 'ridge'), flatt && 0);

  // Valmtak: alle fire kantene er takfot, og mønet slutter inne på taket.
  tom(1200, 800);
  for (const k of ['k1', 'k2', 'k3', 'k4']) M._takSetEdgeType(M.FID, k, 'eave');
  const v = M._takAddRidge(M.FID, { x: 400, y: 400 }, { x: 800, y: 400 });
  const tv = M.ren(M._takOf(M.FID)), sv = byggTak(tv);
  sjekk('valm: fire flater, alle reist', flater(sv).length === 4 && flater(sv).every(d => d.form === 'reist'), flater(sv).length);
  dekker('valm', sv, tv);
  sjekk('valm: ingen gavl', !sv.deler.some(d => d.type === 'gavl'));
  sjekk('valm: endeflatene er trekanter, langsidene firkanter', flater(sv).map(d => d.punkter.length).sort().join() === '3,3,4,4', flater(sv).map(d => d.punkter.length));
  sjekk('valm: alle fire er plane', !sv.advarsler.some(a => a.includes('ett plan')), sv.advarsler);
  sjekk('valm: «merk alle som takfot» beholder det tegnede mønet', v.prov.source === 'USER_DRAWN');

  // T-form: et møne ender midt på et annet. Flatene skal ikke overlappe.
  M.nyttTak([{ x: 0, y: 0 }, { x: 1200, y: 0 }, { x: 1200, y: 600 }, { x: 800, y: 600 }, { x: 800, y: 1200 }, { x: 400, y: 1200 }, { x: 400, y: 600 }, { x: 0, y: 600 }]);
  M._takSetRoofType(M.FID, 'pitched'); M._takSetHeight(M.FID, 'eave_m', '5'); M._takSetHeight(M.FID, 'ridge_m', '8');
  const ty = { k1: 'eave', k2: 'rake', k3: 'eave', k4: 'eave', k5: 'rake', k6: 'eave', k7: 'eave', k8: 'rake' };
  for (const [id, type] of Object.entries(ty)) M._takSetEdgeType(M.FID, id, type);
  M._takAddRidge(M.FID, { x: 0, y: 300 }, { x: 1200, y: 300 });
  M._takAddRidge(M.FID, { x: 600, y: 1200 }, { x: 600, y: 300 });
  const tt = M.ren(M._takOf(M.FID)), st = byggTak(tt);
  sjekk('T-form: reist', flater(st).length && flater(st).every(d => d.form === 'reist'), st.advarsler);
  dekker('T-form', st, tt);
  sjekk('T-form: alle flatene er plane', !st.advarsler.some(a => a.includes('ett plan')), st.advarsler);

  // Motoren regner ikke ut møner selv: et skjevt tegnet møne følges.
  const skj = M.ren(L); skj.edges.find(e => e.id === 'm2').a.x = 500;
  const fasit = skj.edges.find(e => e.id === 'm2').a.x / 100;   // leses FØR motoren kjører
  sjekk('motoren følger det lagrede mønet', Math.abs(byggTak(skj).deler.find(d => d.type === 'mone' && d.ref === 'm2').bane[0][0] - fasit) < MM);

  // Flere møner: takvinkelen følger det nærmeste, i 2D og 3D.
  M.regnUt(L);
  const tp = M._takOf(M.FID), pm = M._takPitch(tp, tp.surfaces[0], { x: 900, y: 950 });
  likt('takvinkel ved k4 regnes mot sitt eget møne (3,5 m, ikke 6 m)', pm.run_m, 3.5);
  M.regnUt(L);
  const gk4 = M._takAddGuard(M.FID, 'k4'), tg = M._takOf(M.FID), Lk4 = M._takGuardLine(tg, gk4);
  byggTak(M.ren(tg)).deler.find(d => d.type === 'snofanger' && d.ref === gk4.id).bane.forEach((p, i) => likt(`snøfanger på k4, punkt ${i}, står der 2D tegner den`, Math.hypot(p[0] - Lk4[i].x / 100, p[2] - Lk4[i].y / 100), 0));
}

if (process.argv.includes('--md')) console.log('\n| Fixture | Hva | 3D (m) | 2D (m) | Avvik (mm) |\n|---|---|---:|---:|---:|\n' + tabell.join('\n'));
console.log(`\n${feil ? 'FEILET' : 'BESTÅTT'}: ${ok} av ${ok + feil}`);
process.exit(feil ? 1 : 0);
