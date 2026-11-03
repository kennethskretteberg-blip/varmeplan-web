const fs=require('fs');for(const f of process.argv.slice(2)){let s=fs.readFileSync(f,'utf8');
const a="    for (const r of _cabRows) {\n      if (y + rowH > H - M) { _addPage(); _cabHead(); _prevFloor = Symbol('page'); _prevRoom = null; }";
const b="    _cabRows.forEach((r, ri) => {\n      // Siste rad tar sumraden med seg (10 mm), så summen aldri står alene øverst på en ny side.\n      if (y + rowH + (ri === _cabRows.length - 1 ? 10 : 0) > H - M) { _addPage(); _cabHead(); _prevFloor = Symbol('page'); _prevRoom = null; }";
const c="      y += rowH;\n    }\n    // Sumrad\n    if (y + 10 > H - M) { _addPage(); _cabHead(); }\n";
const d="      y += rowH;\n    });\n    // Sumrad (plassen er alt sikret av siste rad)\n";
for (const [x,yy] of [[a,b],[c,d]]) { const esc = f.endsWith('.js') ? x.replace(/\n/g,'\\n') : x; const n=s.split(x).length-1; if(n!==1) throw new Error(f+' '+n+' '+x.slice(0,40)); s=s.replace(x,yy);} fs.writeFileSync(f,s);}
