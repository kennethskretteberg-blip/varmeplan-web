const fs=require('fs');const f=process.argv[2];let s=fs.readFileSync(f,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error(n+' '+a.slice(0,60));s=s.replace(a,b);};
rep(`      for (let i = 1; i < cells.length; i++) {
        const t = _cFit(cells[i], i); if (!t) continue;`,
`      for (let i = 1; i < cells.length; i++) {
        // Produkt: et langt navn (målt: InSnow «… 117.4m 400V») krympes til 7 pt før det kuttes,
        // så spenningen sist i navnet ikke forsvinner. Alle InFloor-navn i katalogen får plass i 8 pt.
        if (i === 3 && doc.getTextWidth(String(cells[i])) > cw[i] - 2) doc.setFontSize(7);
        const t = _cFit(cells[i], i); doc.setFontSize(8); if (!t) continue;`);
fs.writeFileSync(f,s);
