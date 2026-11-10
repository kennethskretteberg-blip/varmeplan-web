// 224: mekaniske skriftendringer i index.html (kjøres én gang; mønstrene finnes ikke etterpå).
//   1. ctx.font / c.font / font-variabler på lerretet: 'Space Grotesk' / sans-serif / system-ui / DM → CANVAS_UI_FONT
//      (DM Mono → CANVAS_NUM_FONT). Størrelsene røres ikke.
//   2. CSS-blokken: font-size < 12 px → 12 px (uppercase-overskrifter: minst 11 px); glyph-klasser unntatt.
//      IBM Plex Mono i visningsklasser → var(--font-ui) + tabular-nums (tallfelt .wbw-inp og kbd beholder mono).
//   3. HTML/JS-delen: inline font-size 9–11,5 px → 12 px (uppercase på samme linje: 11 px). Under 9 px urørt (listes).
//   4. Inline mono i <span>/<div> (visning, ikke inndata) → tabular-nums.
//   node docs/224/probe/skriftpatch.mjs [--dry]
import fs from 'node:fs';
const FIL = new URL('../../../index.html', import.meta.url).pathname;
const dry = process.argv.includes('--dry');
const src = fs.readFileSync(FIL, 'utf8').split('\n');
const styleEnd = src.findIndex(l => /<\/style>/.test(l));
const scriptStart = src.findIndex((l, i) => i > styleEnd && /^<script>\s*$/.test(l));
const log = { font: 0, cssSize: 0, cssMono: 0, inlineSize: 0, inlineMono: 0, small: [], fontRest: [] };

// ── 1. lerretsskrift ───────────────────────────────────────────────────────────────────────────────
const FAM_UI = /(?:'Space Grotesk',\s*sans-serif|system-ui,\s*-apple-system,\s*sans-serif|system-ui,\s*sans-serif|DM Sans,\s*sans-serif|sans-serif)/;
const FAM_NUM = /DM Mono,\s*monospace/;
const erFontLinje = l => /\b(?:ctx|c|c2)\.font\s*=/.test(l) || /\b(?:lblFont|nf|dimFont)\s*=\s*`/.test(l);
for (let i = scriptStart; i < src.length; i++) {
  let l = src[i];
  if (!erFontLinje(l) || /CANVAS_UI_FONT\s*=/.test(l)) continue;
  const før = l;
  // a) streng-literaler ('…' eller "…") som slutter på en skriftfamilie → template-literal med konstanten
  l = l.replace(/(['"])((?:(?!\1)[^\n])*?)(DM Mono,\s*monospace|'Space Grotesk',\s*sans-serif|system-ui,\s*-apple-system,\s*sans-serif|system-ui,\s*sans-serif|DM Sans,\s*sans-serif|sans-serif)\1/g,
    (m, q, pre, fam) => '`' + pre + '${' + (FAM_NUM.test(fam) ? 'CANVAS_NUM_FONT' : 'CANVAS_UI_FONT') + '}`');
  // b) det som står igjen ligger i template-literaler
  l = l.replace(/`([^`]*)`/g, (m, inner) => {
    let s = inner.replace(FAM_NUM, '${CANVAS_NUM_FONT}');
    s = s.replace(new RegExp(FAM_UI.source, 'g'), '${CANVAS_UI_FONT}');
    return '`' + s + '`';
  });
  if (l !== før) { log.font++; src[i] = l; }
  if (/sans-serif|Space Grotesk|monospace/.test(l) && !/CANVAS_(UI|NUM)_FONT\b.*(sans-serif|monospace)|typeof CANVAS_NUM_FONT/.test(l)) log.fontRest.push((i + 1) + ': ' + l.trim().slice(0, 140));
}

// ── 2. CSS-blokken ──────────────────────────────────────────────────────────────────────────────────
const GLYPH = /\.(sb-detail-section-toggle|floor-toggle|wall-ico|hindring-ico|hwall-ico|strip-ico|group-ico|room-status|sb-move-btn|rv-plabel)\b/;
const bumpSize = (chunk, upper) => chunk.replace(/font-size:\s*([0-9.]+)px/g, (m, v) => {
  const n = parseFloat(v);
  if (n >= 12 || n < 8) return m;
  const ny = upper ? Math.max(n, 11) : 12;
  if (ny !== n) log.cssSize++;
  return 'font-size:' + ny + 'px';
});
for (let i = 0; i < styleEnd; i++) {
  let l = src[i];
  if (!/font-size:\s*[0-9.]+px|IBM Plex Mono/.test(l)) continue;
  // regler på samme linje behandles hver for seg (uppercase gjelder bare sin egen {…})
  l = l.replace(/([^{}]*)\{([^{}]*)\}/g, (m, sel, body) => {
    if (GLYPH.test(sel)) return m;
    const upper = /text-transform:\s*uppercase/.test(body);
    let b = bumpSize(body, upper);
    if (/IBM Plex Mono/.test(b) && !/\.wbw-inp|kbd/.test(sel)) { b = b.replace(/font-family:'IBM Plex Mono',monospace/, 'font-family:var(--font-ui);font-variant-numeric:tabular-nums'); log.cssMono++; }
    return sel + '{' + b + '}';
  });
  if (!/\{/.test(l)) l = bumpSize(l, false);   // fortsettelseslinje i en flerlinjet regel (.spi-btn)
  src[i] = l;
}

// ── 3./4. HTML- og JS-delen ─────────────────────────────────────────────────────────────────────────
for (let i = styleEnd; i < src.length; i++) {
  let l = src[i];
  if (/font-size:\s*[0-9.]+px/.test(l)) {
    const upper = /text-transform:\s*uppercase/.test(l);
    l = l.replace(/font-size:\s*([0-9.]+)px/g, (m, v) => {
      const n = parseFloat(v);
      if (n >= 12) return m;
      if (n < 9) { log.small.push((i + 1) + ': ' + v + 'px'); return m; }
      const ny = upper ? Math.max(n, 11) : 12;
      if (ny !== n) log.inlineSize++;
      return 'font-size:' + ny + 'px';
    });
  }
  if (/<(span|div)\b/.test(l) && /font-family:(?:var\(--font-mono\)|'IBM Plex Mono',monospace)/.test(l) && !/<input|cssText|<table|<textarea/.test(l)) {
    const før = l;
    l = l.replace(/font-family:(?:var\(--font-mono\)|'IBM Plex Mono',monospace)/g, 'font-variant-numeric:tabular-nums');
    if (l !== før) log.inlineMono++;
  }
  src[i] = l;
}

console.log(JSON.stringify({ ...log, small: log.small.length, fontRest: log.fontRest.length }, null, 0));
console.log('under 9 px (urørt):', log.small.join('  '));
console.log('lerretslinjer med rest:', log.fontRest.join('\n  ') || '(ingen)');
if (!dry) fs.writeFileSync(FIL, src.join('\n'));
console.log(dry ? 'tørrkjøring' : 'skrevet');
