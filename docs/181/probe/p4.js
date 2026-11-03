const fs=require('fs');const f=process.argv[2];let s=fs.readFileSync(f,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error(n+' '+a.slice(0,60));s=s.replace(a,b);};
rep("const cw = [18, 26, 13, 44, 15, 15, 15, 12, 10, 12];", "const cw = [18, 26, 13, 42, 15, 15, 15, 12, 10, 14];");
rep(`    doc.text('Lengde = kabelens produktlengde. Effekt = kabelens merkeeffekt. W/m\\u00b2 = rommets effekt ÷ netto gulvareal (som i Romoversikten).'
      + (_cabHasRes ? ' Reservekabel er ikke tilkoblet (0 W).' : ''), M, y); y += 6;`,
`    doc.text('Lengde = kabelens produktlengde. Effekt = kabelens merkeeffekt. W/m\\u00b2 = rommets effekt ÷ netto gulvareal (som i Romoversikten).', M, y);
    if (_cabHasRes) { y += 3.5; doc.text('Reservekabel er ikke tilkoblet (0 W), men telles med i antall og lengde.', M, y); }
    y += 6;`);
fs.writeFileSync(f,s);
