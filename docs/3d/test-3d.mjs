// 219: node docs/3d/test-3d.mjs [--md]   Sammenligner 3D-motoren med den EKTE 2D-motoren (skåret ut av index.html).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
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
  const s = byggTak(FIX.find(f => f.navn === '3-l-form-8-kanter').tak);
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

// ── 6. index.html er uendret ──
console.log('6 · index.html');
{
  const fil = fs.readFileSync(path.join(ROT, 'index.html'));
  const head = execSync('git show HEAD:index.html', { cwd: ROT, maxBuffer: 64 * 1024 * 1024 });
  sjekk('index.html er byte-identisk med HEAD', fil.equals(head), `${fil.length} vs ${head.length}`);
}

if (process.argv.includes('--md')) console.log('\n| Fixture | Hva | 3D (m) | 2D (m) | Avvik (mm) |\n|---|---|---:|---:|---:|\n' + tabell.join('\n'));
console.log(`\n${feil ? 'FEILET' : 'BESTÅTT'}: ${ok} av ${ok + feil}`);
process.exit(feil ? 1 : 0);
