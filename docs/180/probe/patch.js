const fs = require('fs'); const f = process.argv[2]; let s = fs.readFileSync(f, 'utf8');
const rep = (a, b, n = 1) => { const c = s.split(a).length - 1; if (c !== n) throw new Error('fant ' + c + '× ' + a); s = s.split(a).join(b); };
rep("doc.text('Motstandsmåling \\u2014 varmefolie', M, y); y += 5;", "doc.text('Motstandsmåling \\u2013 varmefolie', M, y); y += 5;   // 180: samme navn og strek (–) som tabellsiden");
rep("    doc.text('Motstandsmåling — oversikt for elektriker', M, y); y += 7;\n",
    "    // 180 (Fredrik): siden skal tydelig hete «Motstandsmåling – varmefolie»; «oversikt for elektriker» er undertittel.\n" +
    "    doc.text('Motstandsmåling \\u2013 varmefolie', M, y); y += 5.5;\n" +
    "    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90, 100, 120);\n" +
    "    doc.text('Oversikt for elektriker', M, y); y += 6.5;\n");
rep(">Motstandsmåling (varmefolie)</span>", ">Motstandsmåling – varmefolie</span>");
rep("box('Motstandsmåling — varmefolie'", "box('Motstandsmåling – varmefolie'");
rep("// ── 145 · Motstandsmåling — oversikt for elektriker ──", "// ── 145 · Motstandsmåling – varmefolie (oversikt for elektriker; navnet fra 180) ──");
// tester
rep("antall(på, 'Motstandsmåling — varmefolie') === 3, antall(på, 'Motstandsmåling — varmefolie')", "antall(på, 'Motstandsmåling \\u2013 varmefolie') === 3, antall(på, 'Motstandsmåling \\u2013 varmefolie')");
rep("check('PDF: blokk «Motstandsmåling — varmefolie» på hvert", "check('PDF: blokk «Motstandsmåling – varmefolie» på hvert");
rep("    check('PDF: tabelltittel finnes én gang', 1, antall(på, 'Motstandsmåling — oversikt for elektriker') === 1, antall(på, 'Motstandsmåling — oversikt for elektriker'));\n",
    "    // 180: tabellsiden heter «Motstandsmåling – varmefolie» (som blokken) med undertittelen «Oversikt for elektriker».\n" +
    "    check('PDF: undertittel «Oversikt for elektriker» finnes én gang', 1, antall(på, 'Oversikt for elektriker') === 1, antall(på, 'Oversikt for elektriker'));\n" +
    "    check('180: tabellsiden heter «Motstandsmåling – varmefolie» (tittel rett over undertittelen)', 'ja', (() => { const i = på.pages.findIndex(x => x.t === 'Oversikt for elektriker'); return i > 0 && på.pages[i - 1].t === 'Motstandsmåling \\u2013 varmefolie' && på.pages[i - 1].page === på.pages[i].page; })(), 'mangler');\n" +
    "    check('180: ingen tittel med lang strek (—) eller «oversikt for elektriker» i tittelen', 0, på.alle.filter(t => t.indexOf('Motstandsmåling \\u2014') === 0).length, på.alle.filter(t => t.indexOf('Motstandsmåling \\u2014') === 0).length);\n" +
    "    check('180: tabellside + tre romblokker = fire «Motstandsmåling – varmefolie»', 4, antall(på, 'Motstandsmåling \\u2013 varmefolie') === 4, antall(på, 'Motstandsmåling \\u2013 varmefolie'));\n");
rep("const tabellSide = på.pages.find(x => x.t === 'Motstandsmåling — oversikt for elektriker').page;", "const tabellSide = på.pages.find(x => x.t === 'Oversikt for elektriker').page;");
rep("har('Motstandsmåling \\u2014 varmefolie') && har('Installert effekt')", "har('Motstandsmåling \\u2013 varmefolie') && har('Installert effekt')");
rep("har('Motstandsmåling \\u2014 oversikt for elektriker') && har('Målt av:')", "har('Motstandsmåling \\u2013 varmefolie') && har('Oversikt for elektriker') && har('Målt av:')");
fs.writeFileSync(f, s);
