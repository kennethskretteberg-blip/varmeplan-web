// 243: patcher index.html — felles _dimFlushMoved (ut av _drawDimChainLayout) og veggmålene inn under 240-regelen.
const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
const en = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error("fant " + n + ": " + a.slice(0, 80)); s = s.split(a).join(b); };
const mellom = (A, B, ny) => { const i = s.indexOf(A), j = s.indexOf(B, i); if (i < 0 || j < 0 || s.indexOf(A, i + 1) >= 0) throw new Error("anker " + A.slice(0, 60)); s = s.slice(0, i) + ny + s.slice(j + B.length); };
// 1 · tellerne
en("let _dimMovedStat = { moved: 0, hidden: 0 };   // siste tegning: flyttede / skjulte kjedetekster (test og rapport)",
   "let _dimMovedStat = { moved: 0, hidden: 0, wallMoved: 0, wallHidden: 0 };   // siste tegning: flyttede / skjulte kjedetekster og (243) veggmål");
en("_dimMovedStat = { moved: 0, hidden: 0 }; }", "_dimMovedStat = { moved: 0, hidden: 0, wallMoved: 0, wallHidden: 0 }; }");
// 2 · felles flytting
en("// Tegner ett oppsett. st: { col, colRed, bg, fmt(cm) }.", fs.readFileSync("docs/243/probe/ny-flush.js", "utf8") + "// Tegner ett oppsett. st: { col, colRed, bg, fmt(cm) }.");
mellom("  // 240: de flyttede tekstene — per kjede, i leddenes rekkefølge, på utsiden med leder.\n  const _flush = () => {\n    if (!pend.length) return;",
       "  if (_dimDefer) _dimDefer.push(_flush); else _flush();",
       "  // 240: de flyttede tekstene — per kjede, i leddenes rekkefølge, på utsiden med leder (243: felles _dimFlushMoved).\n" +
       "  // Faste tekster står over/til venstre for linja (TXTOFF). Er DET utsiden (sign −1), begynner radene utenfor dem.\n" +
       "  const _flush = () => _dimFlushMoved(pend, { FONT, BOXH, LUFT, LWX, pdf: !!P,\n" +
       "    base: (sign, RG) => (sign < 0 ? -TXTOFF + BOXH / 2 : TICK / 2) + RG + BOXH / 2,\n" +
       "    label: (it, cx, cy, V) => _label(it.str, cx, cy, V, it.col, 0) });\n" +
       "  if (_dimDefer) _dimDefer.push(_flush); else _flush();");
// 3 · veggmålene
en("  const BG=P?P.bg:_lc('rgba(240,244,248,0.88)','rgba(13,14,16,0.7)');\n  ctx.save();\n  ctx.font=`${FONT}px ${CANVAS_NUM_FONT}`;\n  const cxW=room.points.reduce",
   "  const BG=P?P.bg:_lc('rgba(240,244,248,0.88)','rgba(13,14,16,0.7)');\n" + fs.readFileSync("docs/243/probe/ny-vegg-a.js", "utf8") + "  ctx.save();\n  ctx.font=`${FONT}px ${CANVAS_NUM_FONT}`;\n  const cxW=room.points.reduce");
mellom("    ctx.save();\n    ctx.translate((ox1+ox2)/2,(oy1+oy2)/2);ctx.rotate(drawAng);", "    _dimPlaced.boxes.push(_dimBoxRot((ox1+ox2)/2,(oy1+oy2)/2,drawAng,tw+2*PAD,BOXH));\n", fs.readFileSync("docs/243/probe/ny-vegg-b.js", "utf8"));
en("  // 116: presentasjonen viser bare veggmålene — hindringsmålene er interne hjelpelinjer.\n", fs.readFileSync("docs/243/probe/ny-vegg-c.js", "utf8") + "  // 116: presentasjonen viser bare veggmålene — hindringsmålene er interne hjelpelinjer.\n");
fs.writeFileSync("index.html", s);
console.log("ok", s.length);
