// varmeplan-3d.js — 3D-visning av taket (219, fase 0). Lastes med import() først når 3D åpnes.
//
// REGELEN: 2D ER FASITEN. byggTak() LESER S.tak[etasjeId] slik 204–218 har lagret det. Mønelinja, kanttypene,
// delstrekkene, antall løp og kabelmeterne hentes derfra og regnes aldri på nytt. Mangler et tall, tegnes delen
// ikke, og scenen sier det i `advarsler`. 3D er kontroll: det som står feil i dataene skal SE feil ut, ikke rettes.
//
// Koordinater i scenen: meter, three.js-akser. x = verden.x / 100 · y = OPP (ground_z + høyde) · z = verden.y / 100.
// Sett ovenfra ligger x mot høyre og z nedover, akkurat som 2D-tegningen. Ingenting er speilet.
//
// Tre deler:  byggTak(tak, valg) → scene   ren funksjon, kjører i Node (ingen three.js, ingen DOM)
//             maal(scene)                  lengdene scenen faktisk inneholder, målt på geometrien
//             tegnScene(scene, beholder)   three.js 0.160.0, lastes først her

export const THREE_VERSJON = '0.160.0';
const THREE_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSJON}/+esm`;
const ORBIT_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSJON}/examples/jsm/controls/OrbitControls.js/+esm`;

/** Profilene (mm), fra prompt 219 og `TAK_SECTION_MM` i index.html. */
export const PROFIL_MM = { renneD: 100, nedlopD: 80 };

/** REN VISNING. Tallene finnes ikke i S.tak og går aldri inn i maal(). Rapporten og SPØRSMÅL 219 lister dem. */
export const VISNING = {
  parapet_m: 0.30,        // parapetens høyde: feltet finnes ikke i datamodellen (anslag)
  sluk_d_m: 0.20,         // slukets diameter: feltet finnes ikke (anslag)
  sluk_h_m: 0.12,         // slukets høyde over taket (anslag)
  traad_avstand_m: 0.03,  // avstanden mellom to tråder i et nedløp og mellom to løp i en gradrenne
  over_flaten_m: 0.02,    // løftet som hindrer at flater på taket flimrer mot takflaten
  ring_avstand_m: 0.015,  // sprang i høyden mellom ringene rundt sluket, så de kan skilles
  bakke_ut_m: 3,          // hvor langt bakken går ut forbi bygget
};

export const STILER = ['strek', 'farge'];

/** Per deltype: fyll, kant, gjennomsiktighet. Testen krever at hver deltype finnes i begge stiler. */
export const PALETT = {
  strek: {
    bakke:     { fyll: '#f4f4f2', kant: '#9ca3af', opasitet: 0.35 },
    vegg:      { fyll: '#ffffff', kant: '#111111' },
    gavl:      { fyll: '#ffffff' },   // uten kant: møneenden deler gavlen i to, og takflaten tegner skråkanten
    takflate:  { fyll: '#ffffff', kant: '#111111' },
    parapet:   { fyll: '#ffffff', kant: '#111111' },
    mone:      { kant: '#111111' },
    renne:     { fyll: '#ffffff', kant: '#111111' },
    nedlop:    { fyll: '#ffffff', kant: '#111111', opasitet: 0.35 },
    nedlop_u:  { fyll: '#fed7aa', kant: '#c2410c', opasitet: 0.45 },
    kabel:     { kant: '#dc2626' },
    snofanger: { kant: '#111111' },
    takvindu:  { fyll: '#e5e7eb', kant: '#111111' },
    hindring:  { fyll: '#d1d5db', kant: '#111111' },
    sluk:      { fyll: '#e5e7eb', kant: '#111111' },
    gradrenne: { fyll: '#f3f4f6', kant: '#111111' },
    varmefelt: { fyll: '#fde68a', kant: '#111111', opasitet: 0.6 },
  },
  farge: {
    bakke:     { fyll: '#c9d6b8', kant: '#8a9a78', opasitet: 0.4 },
    vegg:      { fyll: '#e7dccb', kant: '#a39680' },
    gavl:      { fyll: '#e7dccb' },
    takflate:  { fyll: '#a4553f', kant: '#6d3324' },
    parapet:   { fyll: '#9ca3af', kant: '#4b5563' },
    mone:      { kant: '#111111' },
    renne:     { fyll: '#8a9099', kant: '#374151' },
    nedlop:    { fyll: '#6b7280', kant: '#1f2937', opasitet: 0.4 },
    nedlop_u:  { fyll: '#fb923c', kant: '#c2410c', opasitet: 0.5 },
    kabel:     { kant: '#dc2626' },
    snofanger: { kant: '#1d4ed8' },
    takvindu:  { fyll: '#7dd3fc', kant: '#0c4a6e' },
    hindring:  { fyll: '#475569', kant: '#1e293b' },
    sluk:      { fyll: '#374151', kant: '#111827' },
    gradrenne: { fyll: '#0f766e', kant: '#134e4a' },
    varmefelt: { fyll: '#f59e0b', kant: '#b45309', opasitet: 0.55 },
  },
};

// ── Små hjelpere ─────────────────────────────────────────────────────────────────────────────
const verdi = f => (f && f.value != null && isFinite(f.value) ? f.value : null);
const avstand = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
const baneLengde = b => { let L = 0; for (let i = 1; i < (b || []).length; i++) L += avstand(b[i - 1], b[i]); return L; };
const tilPunkt = (p, y) => [p.x / 100, y, p.y / 100];
const ring = pts => {
  const r = (pts || []).map(p => ({ x: p.x, y: p.y }));
  if (r.length > 1 && Math.abs(r[0].x - r[r.length - 1].x) < 1e-6 && Math.abs(r[0].y - r[r.length - 1].y) < 1e-6) r.pop();
  return r;
};
function iPolygon(P, p) {
  let inne = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i], b = P[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inne = !inne;
  }
  return inne;
}
/** Enhetsvektoren inn på taket (verdens-cm-akser). Samme prøve som `_takGuardInward` i 2D. */
function innover(P, a, b) {
  let nx = -(b.y - a.y), ny = b.x - a.x; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
  const p = { x: (a.x + b.x) / 2 + nx * 2, y: (a.y + b.y) / 2 + ny * 2 };
  return P.length < 3 || iPolygon(P, p) ? { x: nx, y: ny } : { x: -nx, y: -ny };
}
/** Avstanden fra et punkt til et linjestykke (cm). */
function tilLinje(p, m) {
  const dx = m.b.x - m.a.x, dy = m.b.y - m.a.y, L2 = dx * dx + dy * dy;
  const u = L2 ? Math.max(0, Math.min(1, ((p.x - m.a.x) * dx + (p.y - m.a.y) * dy) / L2)) : 0;
  return Math.hypot(p.x - m.a.x - u * dx, p.y - m.a.y - u * dy);
}
/** Takvinkelen i et punkt, samme regel som `_takPitch` i 2D: brukerens tall, ellers (møne − gesims) / avstand til det nærmeste mønet. */
function takvinkel(s, kanter, pt) {
  const pv = verdi(s.pitch_deg);
  if (pv != null) return pv;
  const R = kanter.filter(e => e.type === 'ridge');
  const m = R.length > 1 ? R.reduce((a, b) => (tilLinje(pt, b) < tilLinje(pt, a) ? b : a)) : R[0];
  const ev = verdi(s.heights && s.heights.eave_m), rv = (m && verdi(m.height_m)) ?? verdi(s.heights && s.heights.ridge_m);
  if (ev == null || rv == null || rv <= ev || !m) return null;
  const dx = m.b.x - m.a.x, dy = m.b.y - m.a.y, L = Math.hypot(dx, dy);
  const run = L ? Math.abs((pt.x - m.a.x) * dy - (pt.y - m.a.y) * dx) / L / 100 : 0;
  return run > 0.5 ? Math.atan((rv - ev) / run) * 180 / Math.PI : null;
}
/** Polylinja (punkter med z) mellom to posisjoner langs den, i meter. Lengden regnes som `_takSegLenM`. */
function skiv(pts, fra, til) {
  const seg = (p, q) => Math.sqrt(((q.x - p.x) / 100) ** 2 + ((q.y - p.y) / 100) ** 2 + (p.z != null && q.z != null ? (q.z - p.z) ** 2 : 0));
  const paa = (p, q, u) => ({ x: p.x + u * (q.x - p.x), y: p.y + u * (q.y - p.y), z: p.z != null && q.z != null ? p.z + u * (q.z - p.z) : (p.z ?? q.z ?? null) });
  const ut = []; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i], l = seg(p, q);
    if (acc + l >= fra - 1e-9 && acc <= til + 1e-9 && l > 0) {
      const u0 = Math.max(0, (fra - acc) / l), u1 = Math.min(1, (til - acc) / l);
      if (!ut.length) ut.push(paa(p, q, u0));
      ut.push(paa(p, q, u1));
    }
    acc += l;
  }
  return ut;
}
/** Øreklipping av en enkel polygon i plan: P = [[x, z], …] → trekanter [[i, j, k], …]. */
function trianguler(P) {
  let A = 0;
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; A += a[0] * b[1] - b[0] * a[1]; }
  const idx = P.map((_, i) => i); if (A < 0) idx.reverse();
  const kr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inni = (a, b, c, p) => kr(a, b, p) >= -1e-9 && kr(b, c, p) >= -1e-9 && kr(c, a, p) >= -1e-9;
  const ut = [];
  while (idx.length > 3) {
    let klippet = false;
    for (let k = 0; k < idx.length; k++) {
      const n = idx.length, i0 = idx[(k - 1 + n) % n], i1 = idx[k], i2 = idx[(k + 1) % n];
      const a = P[i0], b = P[i1], c = P[i2];
      if (kr(a, b, c) <= 1e-9) continue;
      if (idx.some(i => i !== i0 && i !== i1 && i !== i2 && inni(a, b, c, P[i]))) continue;
      ut.push([i0, i1, i2]); idx.splice(k, 1); klippet = true; break;
    }
    if (klippet) continue;
    // Ingen øre: en kolineær node står i veien. Den ligger på en kant av flaten, og kan tas ut uten å endre formen.
    const rett = idx.findIndex((_, k) => { const n = idx.length; return Math.abs(kr(P[idx[(k - 1 + n) % n]], P[idx[k]], P[idx[(k + 1) % n]])) <= 1e-9; });
    if (rett < 0) break;
    idx.splice(rett, 1);
  }
  if (idx.length === 3 && Math.abs(kr(P[idx[0]], P[idx[1]], P[idx[2]])) > 1e-9) ut.push(idx.slice());
  return ut;
}

// ── Takflatene ───────────────────────────────────────────────────────────────────────────────
/** Noder mellom ankrene (gavlkant med flere punkter): rett linje mellom ankrene, så gavlen ikke får knekk. */
function fyllMellom(noder, eave) {
  const n = noder.length;
  const lengdeTil = (fra, steg) => { let L = 0, i = fra; for (let k = 0; k < n; k++) { const j = (i + steg + n) % n; L += Math.hypot(noder[j].x - noder[i].x, noder[j].y - noder[i].y); i = j; if (noder[i].h != null) return { L, h: noder[i].h }; } return null; };
  const hoyder = noder.map((nd, i) => {
    if (nd.h != null) return nd.h;
    const f = lengdeTil(i, 1), b = lengdeTil(i, -1);
    return f && b ? b.h + (f.h - b.h) * (b.L / (f.L + b.L)) : eave;
  });
  noder.forEach((nd, i) => { nd.h = hoyder[i]; });
}
const krysser = (p, q, r, s) => {
  const kr = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return kr(p, q, r) * kr(p, q, s) < -1e-9 && kr(r, s, p) * kr(r, s, q) < -1e-9;
};
/** Ligger punktene i ett plan? Toleranse 2 cm. */
function erPlan(pts) {
  const a = pts[0];
  for (let i = 1; i < pts.length - 1; i++) for (let j = i + 1; j < pts.length; j++) {
    const u = [pts[i].x - a.x, pts[i].y - a.y, (pts[i].h - a.h) * 100], v = [pts[j].x - a.x, pts[j].y - a.y, (pts[j].h - a.h) * 100];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], L = Math.hypot(...n);
    if (L < 1) continue;
    return pts.every(p => Math.abs((p.x - a.x) * n[0] + (p.y - a.y) * n[1] + (p.h - a.h) * 100 * n[2]) / L < 2);
  }
  return true;
}
/** 220: Reiser taket fra de LAGREDE mønene og koblingene (`ridge_link` på hver takfot).
 *  Hver sammenhengende rekke takfot mot samme møne, på samme side, blir én flate: takfotene, eventuelle gavlkanter ut til
 *  møneenden, og mønet tilbake. Møner, høyder og koblinger leses. Her settes bare hjørner sammen til flater. */
function reisKoblet(kanter, P, gz, eave, ridge0, navn) {
  const moner = kanter.filter(e => e.type === 'ridge');
  const hoydeAv = m => verdi(m.height_m) ?? ridge0;
  for (const m of moner) {
    if (hoydeAv(m) == null) return { feil: `møne ${m.id} mangler høyde` };
    if (!(hoydeAv(m) > eave)) return { feil: `møne ${m.id} ikke er over gesimsen` };
  }
  const moneAv = e => (e.ridge_link ? moner.find(m => m.id === e.ridge_link.id) || null : null);
  const uten = kanter.filter(e => e.kind === 'outline' && e.type === 'eave' && !moneAv(e));
  if (uten.length) return { feil: `${uten.map(navn).join(', ')} har ingen møne` };

  const noder = P.map((p, i) => ({ x: p.x, y: p.y, h: null, kant: kanter.find(e => e.kind === 'outline' && e.i === i) || null }));
  const finn = q => {
    for (let k = 0; k < noder.length; k++) if (Math.hypot(noder[k].x - q.x, noder[k].y - q.y) < 1) return k;
    for (let k = 0; k < noder.length; k++) {
      const a = noder[k], b = noder[(k + 1) % noder.length], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
      const u = L2 ? ((q.x - a.x) * dx + (q.y - a.y) * dy) / L2 : -1;
      if (u <= 0 || u >= 1 || Math.hypot(a.x + u * dx - q.x, a.y + u * dy - q.y) >= 1) continue;
      noder.splice(k + 1, 0, { x: q.x, y: q.y, h: null, kant: a.kant }); return k + 1;
    }
    return -1;   // en ende inne på taket er helt i orden her
  };
  for (const m of moner) for (const q of [m.a, m.b]) { const k = finn(q); if (k >= 0) noder[k].h = hoydeAv(m); }
  const n = noder.length;
  noder.forEach((nd, i) => { if (nd.kant && nd.kant.type === 'eave') for (const q of [nd, noder[(i + 1) % n]]) if (q.h == null) q.h = eave; });
  fyllMellom(noder, eave);

  // Hvilken side av mønet et punkt ligger på. 0 = på forlengelsen av mønet (endekanten på et valmtak).
  const side = (m, p) => { const dx = m.b.x - m.a.x, dy = m.b.y - m.a.y, d = ((p.x - m.a.x) * dy - (p.y - m.a.y) * dx) / (Math.hypot(dx, dy) || 1); return Math.abs(d) < 1 ? 0 : Math.sign(d); };
  const midt = e => ({ x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2 });
  const nokkel = i => { const e = noder[i].kant; if (!e || e.type !== 'eave') return null; const m = moneAv(e), sd = side(m, midt(e)); return m.id + '|' + sd + (sd === 0 ? '|' + e.id : ''); };
  let s0 = noder.findIndex((_, i) => nokkel(i) !== nokkel((i - 1 + n) % n)); if (s0 < 0) s0 = 0;
  const kjeder = [];
  for (let k = 0; k < n; k++) {
    const i = (s0 + k) % n, key = nokkel(i), j = (i + 1) % n;
    if (key == null) continue;
    if (k > 0 && nokkel((i - 1 + n) % n) === key) kjeder[kjeder.length - 1].push(j); else kjeder.push([i, j]);
  }

  const lagFlate = kjede => {
    const e0 = noder[kjede[0]].kant, m = moneAv(e0), h = hoydeAv(m), sd = side(m, midt(e0)), lag = p => ({ x: p.x, y: p.y, h });
    const dx = m.b.x - m.a.x, dy = m.b.y - m.a.y, L2 = dx * dx + dy * dy, u = q => ((q.x - m.a.x) * dx + (q.y - m.a.y) * dy) / L2;
    const paa = v => (v <= 0 ? m.a : v >= 1 ? m.b : { x: m.a.x + v * dx, y: m.a.y + v * dy });
    const hjorner = kjede.map(i => noder[i]);
    // Endekanten på et valmtak trenger ingen egen regel: begge hjørnene projiseres forbi møneenden, A og B blir samme punkt, og flaten en trekant.
    // Et annet møne som ender PÅ dette (T-form) deler flatene på sin side: hver flate får bare sin del av mønelinja.
    const knekk = [0, 1];
    for (const o of moner) for (const [q, r] of [[o.a, o.b], [o.b, o.a]]) {
      if (o === m) continue;
      const v = u(q), f = paa(v);
      if (v > 1e-6 && v < 1 - 1e-6 && Math.hypot(f.x - q.x, f.y - q.y) < 1 && side(m, r) === sd) knekk.push(v);
    }
    knekk.sort((a, b) => a - b);
    const vs = hjorner.map(p => Math.max(0, Math.min(1, u(p)))), v0 = Math.min(...vs), v1 = Math.max(...vs);
    const lo = Math.max(...knekk.filter(v => v <= v0 + 1e-6)), hi = Math.min(...knekk.filter(v => v >= v1 - 1e-6));
    const A = paa(lo), B = paa(hi), naer = (nd, q) => Math.hypot(nd.x - q.x, nd.y - q.y) < 1;
    // Fra enden av takfot-rekka langs gavlkantene ut til møneenden, så gavlens knutepunkter kommer med.
    const gaa = (fra, steg) => {
      const ut = []; let j = fra;
      for (let k = 0; k < n; k++) {
        const ka = noder[steg > 0 ? j : (j - 1 + n) % n].kant;
        if (ka && ka.type === 'eave') return null;
        j = (j + steg + n) % n;
        if (naer(noder[j], A)) return { treff: A, ut };
        if (naer(noder[j], B)) return { treff: B, ut };
        ut.push(j);
      }
      return null;
    };
    const siste = noder[kjede[kjede.length - 1]], forste = noder[kjede[0]];
    let fram = gaa(kjede[kjede.length - 1], 1), bak = gaa(kjede[0], -1);
    if (fram && bak && fram.treff === bak.treff) bak = null;
    const annen = q => (q === A ? B : A);
    let X, Y;
    if (fram) { X = fram.treff; Y = bak ? bak.treff : annen(X); }
    else if (bak) { Y = bak.treff; X = annen(Y); }
    else {
      [X, Y] = krysser(siste, A, B, forste) ? [B, A] : [A, B];   // den rekkefølgen der flatens to sider ikke krysser hverandre
    }
    const hj = [...hjorner, ...(fram ? fram.ut.map(i => noder[i]) : []), lag(X), lag(Y), ...(bak ? bak.ut.slice().reverse().map(i => noder[i]) : [])];
    return { hj, kanter: [...new Set(kjede.slice(0, -1).map(i => noder[i].kant.id))], mone: m.id };
  };

  const ikkePlan = [], deler = [];
  for (const kjede of kjeder) {
    const f = lagFlate(kjede), hj = f.hj.filter((p, i, a) => { const q = a[(i + 1) % a.length]; return Math.hypot(p.x - q.x, p.y - q.y) >= 1; });
    if (hj.length < 3) continue;
    if (!erPlan(hj)) ikkePlan.push(f);
    deler.push({ punkter: hj.map(p => [p.x / 100, gz + p.h, p.y / 100]), trekanter: trianguler(hj.map(p => [p.x, p.y])) });
  }
  return { deler, noder, ikkePlan };
}

/** Reiser skråtaket fra de LAGREDE kantene. Ingen møneberegning: finnes ikke mønelinja, er svaret null. */
function reisTak(s, kanter, P, gz, eave, ridge) {
  const moner = kanter.filter(e => e.type === 'ridge');
  if (!moner.length || ridge == null || !(ridge > eave)) return null;
  const noder = P.map(p => ({ x: p.x, y: p.y, h: null }));
  const kantI = i => kanter.find(e => e.kind === 'outline' && e.i === i);
  for (let i = 0; i < P.length; i++) { const e = kantI(i); if (e && e.type === 'eave') { noder[i].h = eave; noder[(i + 1) % P.length].h = eave; } }
  for (let i = 0; i < P.length; i++) { const e = kantI(i); if (e && e.type === 'ridge') { noder[i].h = ridge; noder[(i + 1) % P.length].h = ridge; } }

  // Møneender på omrisset blir noder (midt på gavlen ligger de ikke i et hjørne). Ender inne på taket kan ikke lukkes.
  const linjer = moner.filter(e => e.kind === 'line');
  const finn = q => {
    for (let k = 0; k < noder.length; k++) if (Math.hypot(noder[k].x - q.x, noder[k].y - q.y) < 1) return k;
    for (let k = 0; k < noder.length; k++) {
      const a = noder[k], b = noder[(k + 1) % noder.length], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
      const u = L2 ? ((q.x - a.x) * dx + (q.y - a.y) * dy) / L2 : -1;
      if (u <= 0 || u >= 1) continue;
      if (Math.hypot(a.x + u * dx - q.x, a.y + u * dy - q.y) < 1) { noder.splice(k + 1, 0, { x: q.x, y: q.y, h: null }); return k + 1; }
    }
    return -1;
  };
  const par = [];
  for (const m of linjer) {
    const ia = finn(m.a); if (ia < 0) return null;
    const ib = finn(m.b); if (ib < 0) return null;
    par.push([{ x: m.a.x, y: m.a.y }, { x: m.b.x, y: m.b.y }]);
  }
  const nodeAv = q => noder.findIndex(n => Math.hypot(n.x - q.x, n.y - q.y) < 1);
  for (const [a, b] of par) { noder[nodeAv(a)].h = ridge; noder[nodeAv(b)].h = ridge; }

  fyllMellom(noder, eave);

  // Deler omrisset langs mønelinjene; hver del er én takflate.
  let flater = [noder.map((_, i) => i)];
  for (const [a, b] of par) {
    const ia = nodeAv(a), ib = nodeAv(b);
    const k = flater.findIndex(f => f.includes(ia) && f.includes(ib));
    if (k < 0) return null;
    const f = flater[k], pa = f.indexOf(ia), pb = f.indexOf(ib), lo = Math.min(pa, pb), hi = Math.max(pa, pb);
    if (hi - lo < 2 && lo + f.length - hi < 2) continue;
    flater.splice(k, 1, f.slice(lo, hi + 1), f.slice(hi).concat(f.slice(0, lo + 1)));
  }
  const deler = flater.map(f => {
    const tris = trianguler(f.map(i => [noder[i].x, noder[i].y]));
    return { punkter: f.map(i => [noder[i].x / 100, gz + noder[i].h, noder[i].y / 100]), trekanter: tris };
  });
  return { deler, noder };
}
function hoydeVed(flater, x, z) {
  for (const f of flater) for (const [i, j, k] of f.trekanter) {
    const a = f.punkter[i], b = f.punkter[j], c = f.punkter[k];
    const d = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
    if (Math.abs(d) < 1e-12) continue;
    const u = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / d;
    const v = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / d;
    if (u >= -1e-6 && v >= -1e-6 && u + v <= 1 + 1e-6) return u * a[1] + v * b[1] + (1 - u - v) * c[1];
  }
  return null;
}

// ── byggTak ──────────────────────────────────────────────────────────────────────────────────
/** S.tak[etasjeId] → scene: { stil, deler[], ikkeTegnet[], advarsler[], ground_y, boks }. valg: { stil }. */
export function byggTak(tak, valg = {}) {
  const stil = valg.stil === 'farge' ? 'farge' : 'strek';
  const deler = [], advarsler = [], ikkeTegnet = [];
  const scene = { stil, deler, ikkeTegnet, advarsler, ground_y: null, boks: null };
  const s0 = tak && tak.surfaces && tak.surfaces[0];
  if (!s0) { advarsler.push('Taket har ingen takflate.'); return scene; }
  const features = tak.features || [], alleKanter = tak.edges || [];
  const finnes = t => features.filter(f => f.type === t);
  const P0 = ring(s0.footprint && s0.footprint.world);

  let gz0 = verdi(s0.heights && s0.heights.ground_z);
  if (gz0 == null) { advarsler.push('Terrenghøyden (ground_z) mangler. Bakken er lagt på 0.'); gz0 = 0; }
  scene.ground_y = gz0;
  const taktak = [];   // flatene motoren har bygget, for å plassere ting oppå dem

  for (const s of tak.surfaces) {
    const P = ring(s.footprint && s.footprint.world);
    if (P.length < 3) { advarsler.push(`Takflate ${s.id}: omrisset mangler.`); continue; }
    const kanter = alleKanter.filter(e => e.surface === s.id);
    const gz = verdi(s.heights && s.heights.ground_z) ?? gz0;
    const eave = verdi(s.heights && s.heights.eave_m), ridge = verdi(s.heights && s.heights.ridge_m);
    if (eave == null) { advarsler.push(`Takflate ${s.id}: gesimshøyden mangler. Vegger og tak er ikke tegnet.`); continue; }

    P.forEach((a, i) => {
      const b = P[(i + 1) % P.length];
      deler.push({ type: 'vegg', ref: `${s.id}.${i + 1}`,
        punkter: [tilPunkt(a, gz), tilPunkt(b, gz), tilPunkt(b, gz + eave), tilPunkt(a, gz + eave)], trekanter: [[0, 1, 2], [0, 2, 3]] });
    });
    const form = s.roof_type && s.roof_type.value;
    const lokk = () => ({ punkter: P.map(p => tilPunkt(p, gz + eave)), trekanter: trianguler(P.map(p => [p.x, p.y])) });

    if (form === 'flat') {
      const f = lokk();
      deler.push({ type: 'takflate', form: 'flat', ref: s.id, ...f }); taktak.push(f);
      kanter.filter(e => e.type === 'parapet').forEach(e => {
        const top = gz + eave + VISNING.parapet_m;
        deler.push({ type: 'parapet', ref: e.id, visning: true,
          punkter: [tilPunkt(e.a, gz + eave), tilPunkt(e.b, gz + eave), tilPunkt(e.b, top), tilPunkt(e.a, top)], trekanter: [[0, 1, 2], [0, 2, 3]] });
      });
      continue;
    }
    // 220: et tak med koblinger reises fra dem. Et rent 205-forslag (ingen koblinger) går samme vei som før.
    const navn = e => (features.find(f => f.type === 'GUTTER' && f.on_edge === e.id) || e).id;
    const svar = form !== 'pitched' ? null
      : kanter.some(e => e.ridge_link) && kanter.some(e => e.type === 'ridge') ? reisKoblet(kanter, P, gz, eave, ridge, navn)
      : reisTak(s, kanter, P, gz, eave, ridge);
    const reist = svar && !svar.feil ? svar : null;
    if (reist) {
      reist.deler.forEach((f, i) => { deler.push({ type: 'takflate', form: 'reist', ref: `${s.id}.${i + 1}`, ...f }); taktak.push(f); });
      kanter.filter(e => e.type === 'ridge').forEach(e => { const h = gz + (verdi(e.height_m) ?? ridge); deler.push({ type: 'mone', ref: e.id, bane: [tilPunkt(e.a, h), tilPunkt(e.b, h)] }); });
      for (const f of reist.ikkePlan || []) advarsler.push(`Takflaten fra ${f.kanter.join(', ')} mot ${f.mone} ligger ikke i ett plan: takfotene står ulikt langt fra mønet. Den er tegnet med knekk.`);
      // Gavlene: fra gesimsen opp til takflaten, der omrisset ligger over gesims.
      reist.noder.forEach((a, i) => {
        const b = reist.noder[(i + 1) % reist.noder.length];
        if (a.h <= eave + 1e-6 && b.h <= eave + 1e-6) return;
        const pkt = [tilPunkt(a, gz + eave), tilPunkt(b, gz + eave)];
        if (b.h > eave + 1e-6) pkt.push(tilPunkt(b, gz + b.h));
        if (a.h > eave + 1e-6) pkt.push(tilPunkt(a, gz + a.h));
        deler.push({ type: 'gavl', ref: `${s.id}.g${i + 1}`, punkter: pkt, trekanter: pkt.length === 4 ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 2]] });
      });
    } else {
      const f = lokk();
      deler.push({ type: 'takflate', form: 'ikke-reist', ref: s.id, ...f }); taktak.push(f);
      const grunn = form !== 'pitched' ? 'taktypen er ikke valgt'
        : svar && svar.feil ? svar.feil
        : !kanter.some(e => e.type === 'ridge') ? 'det er ingen lagret mønelinje'
        : ridge == null ? 'mønehøyden mangler'
        : !(ridge > eave) ? 'mønehøyden er ikke over gesimsen' : 'mønelinja henger ikke sammen med omrisset';
      advarsler.push(`Takflate ${s.id}: taket er ikke reist, fordi ${grunn}. Det vises som et lokk ved gesimsen.`);
    }
  }

  // ── Renner, kabelløp, nedløp ──
  const eave0 = verdi(s0.heights && s0.heights.eave_m);
  for (const g of finnes('GUTTER')) {
    const pts = g.geometry && g.geometry.pts;
    if (!pts || pts.some(p => p.z == null)) { advarsler.push(`Rennestrekk ${g.id}: høyden mangler. Det er ikke tegnet.`); continue; }
    const kant = alleKanter.find(e => e.id === g.on_edge);
    if (kant && kant.type !== 'eave') advarsler.push(`Rennestrekk ${g.id} ligger på kant ${kant.id}, som nå er merket «${kant.type || 'ikke valgt'}».`);
    const a0 = pts[0], b0 = pts[pts.length - 1], inn = innover(P0, a0, b0);
    const r = PROFIL_MM.renneD / 2000, ut = [-inn.x, -inn.y];
    deler.push({ type: 'renne', ref: g.id, bane: pts.map(p => tilPunkt(p, gz0 + p.z)), diameter_m: PROFIL_MM.renneD / 1000, ut });
    for (const sg of g.segments || []) {
      if (!sg.run_pos) { advarsler.push(`Delstrekk ${sg.id}: kabelposisjonene (run_pos) mangler.`); continue; }
      sg.run_pos.forEach((rp, lop) => {
        const phi = rp.deg * Math.PI / 180, side = rp.at === 'hengkant' ? 1 : -1;   // hengkant = mot veggen (210)
        const dx = inn.x * side * Math.cos(phi) * r, dz = inn.y * side * Math.cos(phi) * r, dy = -Math.sin(phi) * r;
        const bane = skiv(pts, sg.from_m, sg.to_m).map(p => [p.x / 100 + dx, gz0 + p.z + dy, p.y / 100 + dz]);
        deler.push({ type: 'kabel', rolle: 'renne', ref: sg.id, eier: g.id, lop: lop + 1, posisjon: rp.at, bane });
      });
    }
    // «Kabel må forbi» (209): hvert løp går en sløyfe rett opp og ned ved hindringen. Lengden er tallet i dataene.
    for (const o of finnes('OBSTACLE')) {
      if (o.gutter !== g.id || !o.bypass || !o.bypass.value) continue;
      const ex = verdi(o.bypass.extra_m); if (ex == null) continue;
      const sist = sg => Math.abs(sg.to_m - g.length_m) < 1e-9;
      const sg = (g.segments || []).find(x => o.at_m >= x.from_m - 1e-9 && (o.at_m < x.to_m - 1e-9 || sist(x)));
      if (!sg) continue;
      const p = skiv(pts, o.at_m, o.at_m + 1e-6)[0];
      for (let lop = 1; lop <= sg.runs; lop++) {
        const q = [p.x / 100, gz0 + p.z, p.y / 100];
        deler.push({ type: 'kabel', rolle: 'forbi', ref: o.id, eier: sg.id, lop, bane: [q, [q[0], q[1] + ex / 2, q[2]], q] });
      }
    }
  }
  for (const d of finnes('DOWNSPOUT')) {
    const g = features.find(f => f.id === d.gutter), pt = d.geometry && d.geometry.pt;
    const over = verdi(d.above_ground_m);
    if (!pt || pt.z == null || over == null) { advarsler.push(`Nedløp ${d.id}: høyden mangler. Det er ikke tegnet.`); continue; }
    const forUnder = !!(d.continues_below_ground && d.continues_below_ground.value);   // below_ground_m har standardverdi også når røret slutter over bakken
    const under = forUnder ? verdi(d.below_ground_m) : null;
    if (forUnder && under == null) advarsler.push(`Nedløp ${d.id}: dybden under bakken mangler. Bare delen over bakken er tegnet.`);
    const topp = gz0 + pt.z, skjote = topp - over, bunn = skjote - (under || 0);
    const P_ = y => [pt.x / 100, y, pt.y / 100];
    const a0 = g && g.geometry.pts[0], b0 = g && g.geometry.pts[g.geometry.pts.length - 1];
    const inn = a0 ? innover(P0, a0, b0) : { x: 0, y: 0 }, ut = [-inn.x, -inn.y];
    deler.push({ type: 'nedlop', ref: d.id, del: 'over', bane: [P_(topp), P_(skjote)], diameter_m: PROFIL_MM.nedlopD / 1000, ut });
    if (under != null) deler.push({ type: 'nedlop', ref: d.id, del: 'under', bane: [P_(skjote), P_(bunn)], diameter_m: PROFIL_MM.nedlopD / 1000, ut });
    const gap = skjote - gz0;
    if (Math.abs(gap) > 0.005) advarsler.push(under != null
      ? `Nedløp ${d.id}: lengden over bakken (${over.toFixed(2)} m) stemmer ikke med takfoten: skjøten mot delen under bakken står ${gap.toFixed(2)} m fra terrenget.`
      : gap > 0
        ? `Nedløp ${d.id} slutter ${gap.toFixed(2)} m over bakken (lengden er ${over.toFixed(2)} m).`
        : `Nedløp ${d.id} går ${(-gap).toFixed(2)} m under terrenget, men er merket som over bakken (lengden er ${over.toFixed(2)} m).`);

    // Kabelen: én tråd, eller to tråder som er én sløyfe. Halen er det 2D har lagt på (cable_total_m − lengde × løp).
    if (d.cable_total_m == null) continue;
    const n = d.runs === 2 ? 2 : 1;
    const len = over + (under || 0), hale = d.cable_total_m - len * n;
    if (hale < -1e-6) advarsler.push(`Nedløp ${d.id}: lagret kabelmeter (${d.cable_total_m}) er lavere enn røret × løp.`);
    const bx = a0 ? (b0.x - a0.x) : 1, by = a0 ? (b0.y - a0.y) : 0, bL = Math.hypot(bx, by) || 1, tx = bx / bL, ty = by / bL;
    for (let lop = 0; lop < n; lop++) {
      const f = n === 2 ? (lop === 0 ? -0.5 : 0.5) * VISNING.traad_avstand_m : 0;
      deler.push({ type: 'kabel', rolle: 'nedlop', ref: d.id, lop: lop + 1, bane: [
        [pt.x / 100 + tx * f, topp, pt.y / 100 + ty * f], [pt.x / 100 + tx * f, bunn, pt.y / 100 + ty * f]] });
    }
    if (hale > 1e-6) deler.push({ type: 'kabel', rolle: 'nedlop', ref: d.id, hale: true, bane: [P_(bunn), P_(bunn - hale)] });
  }

  // ── Gradrenner på skråtak ──
  for (const v of finnes('VALLEY_GUTTER')) {
    const pts = v.geometry && v.geometry.pts;
    if (!pts || pts.some(p => p.z == null)) { advarsler.push(`Gradrenne ${v.id}: høyden mangler. Den er ikke tegnet.`); continue; }
    const bane = pts.map(p => tilPunkt(p, gz0 + p.z));
    deler.push({ type: 'gradrenne', ref: v.id, bane });
    const n = v.runs === 2 ? 2 : 1;
    const a = pts[0], b = pts[pts.length - 1], L = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / L, nz = (b.x - a.x) / L;
    for (let lop = 0; lop < n; lop++) {
      const f = n === 2 ? (lop === 0 ? -0.5 : 0.5) * VISNING.traad_avstand_m : 0;
      deler.push({ type: 'kabel', rolle: 'gradrenne', ref: v.id, lop: lop + 1, bane: bane.map(q => [q[0] + nx * f, q[1] + VISNING.over_flaten_m, q[2] + nz * f]) });
    }
  }

  // ── Snøfangere: linja ligger offset_m langs taket fra takfoten. Samme regel som `_takGuardLine`. ──
  for (const g of finnes('SNOW_GUARD')) {
    const pts = g.geometry && g.geometry.pts, off = verdi(g.offset_m);
    if (!pts || off == null || eave0 == null) { advarsler.push(`Snøfanger ${g.id}: avstand eller gesims mangler. Den er ikke tegnet.`); continue; }
    const a = pts[0], b = pts[pts.length - 1];
    const n = innover(P0, a, b), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const deg = takvinkel(s0, alleKanter.filter(e => e.surface === s0.id), mid);
    const reist = deler.some(d => d.type === 'takflate' && d.form === 'reist');
    const plan = off * 100 * (deg != null ? Math.cos(deg * Math.PI / 180) : 1);
    const rise = reist && deg != null ? off * Math.sin(deg * Math.PI / 180) : 0;
    const y = gz0 + eave0 + rise + VISNING.over_flaten_m;
    deler.push({ type: 'snofanger', ref: g.id, offset_m: off, bane: [a, b].map(p => [(p.x + n.x * plan) / 100, y, (p.y + n.y * plan) / 100]) });
    if (g.field && g.field.cable_total_m != null) ikkeTegnet.push({ id: g.id, rolle: 'snofanger-felt', kabel_m: g.field.cable_total_m, i_sum: true });
  }

  // ── Takvinduer og hindringer: flater på taket ──
  for (const o of features.filter(f => f.type === 'SKYLIGHT' || f.type === 'OBSTACLE')) {
    const c = o.geometry && o.geometry.pt, w = verdi(o.width_m), h = verdi(o.height_m);
    if (!c || w == null || h == null) { advarsler.push(`${o.id}: mål mangler. Objektet er ikke tegnet.`); continue; }
    const a = (o.angle_deg || 0) * Math.PI / 180, u = { x: Math.cos(a), y: Math.sin(a) }, v = { x: -u.y, y: u.x }, W = w * 50, H = h * 50;
    const hj = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => ({ x: c.x + u.x * W * i + v.x * H * j, y: c.y + u.y * W * i + v.y * H * j }));
    const punkter = hj.map(p => {
      const y = hoydeVed(taktak, p.x / 100, p.y / 100) ?? (eave0 == null ? gz0 : gz0 + eave0);
      return [p.x / 100, y + VISNING.over_flaten_m, p.y / 100];
    });
    deler.push({ type: o.type === 'SKYLIGHT' ? 'takvindu' : 'hindring', ref: o.id, punkter, trekanter: [[0, 1, 2], [0, 2, 3]] });
  }

  // ── Flatt tak (212) ──
  const flate = (tak.flat && tak.flat.features) || [];
  // Oppsettet brukeren har valgt (212) avgjør hva som regnes sammen. Alt tegnes likevel: 3D skal vise det som ligger i dataene.
  const oppsett = tak.flat && tak.flat.setup;
  const iOppsett = rolle => (rolle === 'gradrenne-felt' ? oppsett !== 'field' && oppsett !== 'drains' : rolle === 'varmefelt' ? oppsett !== 'valleys' && oppsett !== 'drains' : true);
  if (!oppsett && flate.some(f => f.type === 'VALLEY_GUTTER') && flate.some(f => f.type === 'HEAT_FIELD')) advarsler.push('Både gradrenner og varmefelt er tegnet, og oppsett er ikke valgt. Summen tar med begge. 2D gir ingen sum før du velger.');
  const flatY = eave0 == null ? null : gz0 + eave0;
  for (const f of flate) {
    if (flatY == null) { advarsler.push(`${f.id}: gesimshøyden mangler. Det er ikke tegnet.`); continue; }
    if (f.type === 'ROOF_DRAIN') {
      const c = f.geometry.pt, n = verdi(f.ring_runs) || 0, r = verdi(f.ring_r_m) || 0, ror = verdi(f.pipe_cable_m);
      deler.push({ type: 'sluk', ref: f.id, senter: tilPunkt(c, flatY), diameter_m: VISNING.sluk_d_m, hoyde_m: VISNING.sluk_h_m, visning: true });
      for (let i = 0; i < n; i++) deler.push({ type: 'kabel', rolle: 'sluk-ring', ref: f.id, lop: i + 1,
        sirkel: { senter: tilPunkt(c, flatY + VISNING.over_flaten_m + i * VISNING.ring_avstand_m), r } });
      if (ror == null) advarsler.push(`Sluk ${f.id}: lengden i røret mangler. Bare ringene er tegnet.`);
      else if (ror > 0) deler.push({ type: 'kabel', rolle: 'sluk-ror', ref: f.id, bane: [tilPunkt(c, flatY), tilPunkt(c, flatY - ror)] });
    } else if (f.type === 'VALLEY_GUTTER') {
      const [a, b] = f.geometry.pts, bredde = verdi(f.width_m), y = flatY + VISNING.over_flaten_m;
      const del_ = { type: 'gradrenne', ref: f.id, flat: true, bane: [tilPunkt(a, y), tilPunkt(b, y)] };
      if (bredde != null) {
        const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / L * bredde * 50, ny = (b.x - a.x) / L * bredde * 50;
        del_.punkter = [{ x: a.x + nx, y: a.y + ny }, { x: b.x + nx, y: b.y + ny }, { x: b.x - nx, y: b.y - ny }, { x: a.x - nx, y: a.y - ny }].map(p => tilPunkt(p, y));
        del_.trekanter = [[0, 1, 2], [0, 2, 3]];
      }
      deler.push(del_);
      if (f.cable_total_m != null) ikkeTegnet.push({ id: f.id, rolle: 'gradrenne-felt', kabel_m: f.cable_total_m, i_sum: iOppsett('gradrenne-felt') });
    } else if (f.type === 'HEAT_FIELD') {
      const Q = ring(f.geometry.pts), y = flatY + VISNING.over_flaten_m;
      deler.push({ type: 'varmefelt', ref: f.id, punkter: Q.map(p => tilPunkt(p, y)), trekanter: trianguler(Q.map(p => [p.x, p.y])) });
      if (f.cable_total_m != null) ikkeTegnet.push({ id: f.id, rolle: 'varmefelt', kabel_m: f.cable_total_m, i_sum: iOppsett('varmefelt') });
    }
  }

  // ── Bakken og boksen ──
  const allePkt = [];
  for (const d of deler) { for (const p of d.punkter || []) allePkt.push(p); for (const p of d.bane || []) allePkt.push(p); if (d.senter) allePkt.push(d.senter); if (d.sirkel) allePkt.push(d.sirkel.senter); }
  if (allePkt.length) {
    const min = [0, 1, 2].map(k => Math.min(...allePkt.map(p => p[k]))), max = [0, 1, 2].map(k => Math.max(...allePkt.map(p => p[k])));
    const m = VISNING.bakke_ut_m, y = gz0;
    deler.unshift({ type: 'bakke', ref: 'bakke', visning: true,
      punkter: [[min[0] - m, y, min[2] - m], [max[0] + m, y, min[2] - m], [max[0] + m, y, max[2] + m], [min[0] - m, y, max[2] + m]], trekanter: [[0, 1, 2], [0, 2, 3]] });
    scene.boks = { min, max };
  }
  return scene;
}

// ── maal ─────────────────────────────────────────────────────────────────────────────────────
const arealTrekanter = d => {
  let A = 0;
  for (const [i, j, k] of d.trekanter || []) { const a = d.punkter[i], b = d.punkter[j], c = d.punkter[k]; A += Math.abs((b[0] - a[0]) * (c[2] - a[2]) - (c[0] - a[0]) * (b[2] - a[2])) / 2; }
  return A;
};
const kabelLengde = d => (d.sirkel ? 2 * Math.PI * d.sirkel.r : baneLengde(d.bane));

/** Lengdene scenen faktisk inneholder, målt på geometrien i delene. Ingen av tallene leses fra `tak`. */
export function maal(scene) {
  const D = scene.deler, kab = r => D.filter(d => d.type === 'kabel' && d.rolle === r);
  const sum = L => L.reduce((a, d) => a + kabelLengde(d), 0);
  const bySeg = id => D.filter(d => d.type === 'kabel' && d.rolle === 'renne' && d.ref === id);

  const renner = D.filter(d => d.type === 'renne').map(r => {
    const ids = [...new Set(D.filter(d => d.type === 'kabel' && d.rolle === 'renne' && d.eier === r.ref).map(d => d.ref))];
    return { id: r.ref, lengde_m: baneLengde(r.bane), senter_y: r.bane[0][1],
      delstrekk: ids.map(id => { const L = bySeg(id); return { id, lengde_m: baneLengde(L[0].bane), lop: L.length, kabel_m: sum(L) }; }) };
  });
  const nedlop = [...new Set(D.filter(d => d.type === 'nedlop').map(d => d.ref))].map(id => {
    const over = D.find(d => d.type === 'nedlop' && d.ref === id && d.del === 'over');
    const under = D.find(d => d.type === 'nedlop' && d.ref === id && d.del === 'under');
    const T = D.filter(d => d.type === 'kabel' && d.rolle === 'nedlop' && d.ref === id);
    const pkt = [...over.bane, ...(under ? under.bane : [])];
    return { id, over_m: baneLengde(over.bane), under_m: under ? baneLengde(under.bane) : 0, topp_y: Math.max(...pkt.map(p => p[1])),
      laveste_y: Math.min(...pkt.map(p => p[1])), lop: T.filter(d => !d.hale).length, hale_m: sum(T.filter(d => d.hale)), kabel_m: sum(T) };
  });
  const gradrenner = D.filter(d => d.type === 'gradrenne').map(g => {
    const T = D.filter(d => d.type === 'kabel' && d.rolle === 'gradrenne' && d.ref === g.ref);
    return { id: g.ref, flat: !!g.flat, lengde_m: baneLengde(g.bane), lop: T.length, kabel_m: sum(T) };
  });
  const snofangere = D.filter(d => d.type === 'snofanger').map(g => ({ id: g.ref, lengde_m: baneLengde(g.bane) }));
  const moner = D.filter(d => d.type === 'mone').map(m => ({ id: m.ref, lengde_m: baneLengde(m.bane) }));
  const forbi = [...new Set(kab('forbi').map(d => d.ref))].map(id => { const L = kab('forbi').filter(d => d.ref === id); return { id, lop: L.length, kabel_m: sum(L) }; });
  const sluk = D.filter(d => d.type === 'sluk').map(s => {
    const R = kab('sluk-ring').filter(d => d.ref === s.ref), T = kab('sluk-ror').filter(d => d.ref === s.ref);
    return { id: s.ref, ringer: R.length, ring_m: sum(R), ror_m: sum(T) };
  });
  const varmefelt = D.filter(d => d.type === 'varmefelt').map(f => ({ id: f.ref, areal_m2: arealTrekanter(f) }));

  const renne_m = sum(kab('renne')), nedlop_m = sum(kab('nedlop')), gradrenne_m = sum(kab('gradrenne')), forbi_m = sum(kab('forbi'));
  const sluk_ring_m = sum(kab('sluk-ring')), sluk_ror_m = sum(kab('sluk-ror'));
  const ikke_tegnet_m = scene.ikkeTegnet.filter(x => x.i_sum).reduce((a, x) => a + x.kabel_m, 0);
  const tak_m = renne_m + nedlop_m + gradrenne_m + forbi_m;
  return { renner, nedlop, gradrenner, snofangere, moner, forbi, sluk, varmefelt,
    kabel: { renne_m, nedlop_m, gradrenne_m, forbi_m, sluk_ring_m, sluk_ror_m, tak_m, tegnet_m: tak_m + sluk_ring_m + sluk_ror_m,
             ikke_tegnet: scene.ikkeTegnet.slice(), ikke_tegnet_m, sum_m: tak_m + sluk_ring_m + sluk_ror_m + ikke_tegnet_m } };
}

// ── Tegneren (three.js lastes først her) ─────────────────────────────────────────────────────
const nokkel = d => (d.type === 'nedlop' && d.del === 'under' ? 'nedlop_u' : d.type);
const tall = v => v.toFixed(2).replace('.', ',');

/** Målene som etiketter: tekst og punkt i scenen. */
function etiketter(scene) {
  const M = maal(scene), D = scene.deler, ut = [];
  const midt = b => { const a = b[0], c = b[b.length - 1]; return [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2]; };
  for (const r of M.renner) ut.push({ tekst: `${r.id} · ${tall(r.lengde_m)} m`, p: midt(D.find(d => d.type === 'renne' && d.ref === r.id).bane) });
  for (const n of M.nedlop) {
    const o = D.find(d => d.type === 'nedlop' && d.ref === n.id && d.del === 'over');
    ut.push({ tekst: `${n.id} · ${tall(n.over_m)}${n.under_m ? ' + ' + tall(n.under_m) : ''} m`, p: midt(o.bane) });
  }
  for (const m of M.moner) ut.push({ tekst: `møne ${tall(m.lengde_m)} m`, p: midt(D.find(d => d.type === 'mone' && d.ref === m.id).bane) });
  for (const g of M.gradrenner) ut.push({ tekst: `${g.id} · ${tall(g.lengde_m)} m`, p: midt(D.find(d => d.type === 'gradrenne' && d.ref === g.id).bane) });
  for (const g of M.snofangere) ut.push({ tekst: `${g.id} · ${tall(g.lengde_m)} m`, p: midt(D.find(d => d.type === 'snofanger' && d.ref === g.id).bane) });
  return ut;
}

/** Tegner scenen i `beholder`. → { settStil, settVisMaal, tilbakestill, bilde, lukk }. Ortografisk kamera, OrbitControls. */
export async function tegnScene(scene, beholder, valg = {}) {
  const THREE = await import(/* webpackIgnore: true */ THREE_URL);
  const { OrbitControls } = await import(/* webpackIgnore: true */ ORBIT_URL);
  let stil = valg.stil || scene.stil;
  let visMaal = !!valg.visMaal;

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  beholder.style.position = beholder.style.position || 'relative';
  beholder.appendChild(renderer.domElement);
  const lag = document.createElement('div');
  lag.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;font:12px/1.2 system-ui,sans-serif';
  beholder.appendChild(lag);

  const treScene = new THREE.Scene();
  treScene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a80, 2.1));
  const sol = new THREE.DirectionalLight(0xffffff, 1.4); sol.position.set(0.4, 1, 0.7); treScene.add(sol);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -5000, 5000);
  const kontroll = new OrbitControls(camera, renderer.domElement);
  kontroll.enableDamping = false;

  let gruppe = null;
  const B = scene.boks || { min: [-5, 0, -5], max: [5, 5, 5] };
  const senter = [0, 1, 2].map(k => (B.min[k] + B.max[k]) / 2);
  // Standardvinkelen ser på siden med flest nedløp og renner: det er dem 3D er til for å kontrollere.
  const utSum = scene.deler.filter(d => d.ut).reduce((a, d) => [a[0] + d.ut[0] * (d.type === 'nedlop' ? 2 : 1), a[1] + d.ut[1] * (d.type === 'nedlop' ? 2 : 1)], [0, 0]);
  const side = utSum.map(v => (v < -1e-6 ? -1 : 1));
  const radius = Math.max(1, Math.hypot(B.max[0] - B.min[0], B.max[1] - B.min[1], B.max[2] - B.min[2]) / 2 * 1.1);

  function bygg() {
    if (gruppe) { treScene.remove(gruppe); gruppe.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
    gruppe = new THREE.Group();
    treScene.background = new THREE.Color(stil === 'strek' ? 0xffffff : 0xeef2f5);
    const P = PALETT[stil];
    const fyll = farge => {
      const o = farge.opasitet != null ? { transparent: true, opacity: farge.opasitet, depthWrite: false } : {};
      return stil === 'strek'
        ? new THREE.MeshBasicMaterial({ color: farge.fyll, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...o })
        : new THREE.MeshLambertMaterial({ color: farge.fyll, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...o });
    };
    const linje = (bane, farge, lukket) => {
      const g = new THREE.BufferGeometry().setFromPoints(bane.map(p => new THREE.Vector3(p[0], p[1], p[2])));
      const m = new THREE.LineBasicMaterial({ color: farge });
      return lukket ? new THREE.LineLoop(g, m) : new THREE.Line(g, m);
    };
    for (const d of scene.deler) {
      const f = P[nokkel(d)]; if (!f) continue;
      if (d.punkter && d.trekanter) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(d.punkter.flat(), 3));
        g.setIndex(d.trekanter.flat()); g.computeVertexNormals();
        gruppe.add(new THREE.Mesh(g, fyll(f)));
        if (f.kant) gruppe.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 1), new THREE.LineBasicMaterial({ color: f.kant })));
      } else if (d.sirkel) {
        const c = d.sirkel, N = 64, b = [];
        for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; b.push([c.senter[0] + Math.cos(a) * c.r, c.senter[1], c.senter[2] + Math.sin(a) * c.r]); }
        gruppe.add(linje(b, f.kant, true));
      } else if (d.senter) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(d.diameter_m / 2, d.diameter_m / 2, d.hoyde_m, 24), fyll(f));
        m.position.set(d.senter[0], d.senter[1] + d.hoyde_m / 2, d.senter[2]); gruppe.add(m);
      } else if (d.bane && d.diameter_m) {
        // Rør og renne i sann diameter, pluss en strek på yttersiden: Ø80 er under to piksler i oversikten.
        const r = d.diameter_m / 2, u = d.ut || [0, 0];
        for (let i = 1; i < d.bane.length; i++) {
          const a = new THREE.Vector3(...d.bane[i - 1]), b = new THREE.Vector3(...d.bane[i]), v = b.clone().sub(a), L = v.length();
          if (L < 1e-6) continue;
          let g;
          if (d.type === 'renne') {
            // Halvrund profil, åpen oppover: buen går under aksen, fra den ene siden til den andre.
            const N = 12, n = new THREE.Vector3(-v.z, 0, v.x).normalize(), pos = [], idx = [];
            for (let k = 0; k <= N; k++) {
              const t = k / N * Math.PI, q = n.clone().multiplyScalar(Math.cos(t) * r).add(new THREE.Vector3(0, -Math.sin(t) * r, 0));
              pos.push(a.x + q.x, a.y + q.y, a.z + q.z, b.x + q.x, b.y + q.y, b.z + q.z);
              if (k < N) { const i = k * 2; idx.push(i, i + 1, i + 3, i, i + 3, i + 2); }
            }
            g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
          } else g = new THREE.CylinderGeometry(r, r, L, 16, 1, true);
          const m = new THREE.Mesh(g, fyll(f));
          if (d.type !== 'renne') {
            m.position.copy(a.clone().addScaledVector(v, 0.5));
            m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
          }
          gruppe.add(m);
        }
        gruppe.add(linje(d.bane.map(p => [p[0] + u[0] * r, p[1], p[2] + u[1] * r]), f.kant));
      } else if (d.bane) {
        gruppe.add(linje(d.bane, f.kant));
      }
    }
    treScene.add(gruppe);
  }

  const etikettData = etiketter(scene);
  const etikettEl = etikettData.map(e => {
    const el = document.createElement('div');
    el.textContent = e.tekst;
    el.style.cssText = 'position:absolute;white-space:nowrap;background:rgba(255,255,255,.9);color:#111;border:1px solid #9ca3af;border-radius:3px;padding:1px 4px;transform:translate(-50%,-50%)';
    lag.appendChild(el); return el;
  });
  function plasserEtiketter() {
    lag.style.display = visMaal ? 'block' : 'none';
    if (!visMaal) return;
    const W = beholder.clientWidth, H = beholder.clientHeight, v = new THREE.Vector3();
    const pos = etikettData.map((e, i) => { v.set(e.p[0], e.p[1], e.p[2]).project(camera); return { i, x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, b: etikettEl[i].offsetWidth }; }).sort((a, b) => a.y - b.y);
    // Etiketter som ville dekket hverandre skyves nedover, så alle kan leses.
    pos.forEach((p, k) => { for (let j = 0; j < k; j++) { const q = pos[j]; if (Math.abs(p.x - q.x) < (p.b + q.b) / 2 + 4 && Math.abs(p.y - q.y) < 19) p.y = q.y + 19; } });
    for (const p of pos) { etikettEl[p.i].style.left = p.x + 'px'; etikettEl[p.i].style.top = p.y + 'px'; }
  }
  const tegn = () => { renderer.render(treScene, camera); plasserEtiketter(); };
  function meld() {
    const W = beholder.clientWidth || 800, H = beholder.clientHeight || 600, a = W / H;
    const h = a >= 1 ? radius : radius / a;
    camera.left = -h * a; camera.right = h * a; camera.top = h; camera.bottom = -h;
    camera.updateProjectionMatrix(); renderer.setSize(W, H); tegn();
  }
  function tilbakestill() {
    kontroll.target.set(senter[0], senter[1], senter[2]);
    camera.position.set(senter[0] + side[0] * radius, senter[1] + radius * 0.65, senter[2] + side[1] * radius);
    camera.zoom = 1; camera.lookAt(kontroll.target); camera.updateProjectionMatrix(); kontroll.update(); tegn();
  }
  bygg(); meld(); tilbakestill();
  kontroll.addEventListener('change', tegn);
  const ro = new ResizeObserver(meld); ro.observe(beholder);

  return {
    settStil(s) { stil = s === 'farge' ? 'farge' : 'strek'; bygg(); tegn(); },
    settVisMaal(v) { visMaal = !!v; tegn(); },
    tilbakestill,
    bilde() { tegn(); return renderer.domElement.toDataURL('image/png'); },
    lukk() { ro.disconnect(); kontroll.dispose(); renderer.dispose(); beholder.removeChild(renderer.domElement); beholder.removeChild(lag); },
  };
}
