const fs=require('fs');const f=process.argv[2];let s=fs.readFileSync(f,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error(n+' '+a.slice(0,60));s=s.replace(a,b);};
rep("cab(993306, 993105, K2, 7.5, 600, 0, 300, 250, { reserve: true }),",
    "cab(993306, 993105, K2, 7.5, 600, 0, 300, 250, { reserve: true, _manual: true, mainCableId: 993305 }),   // manuell, ellers rydder _syncReserveCables den");
rep("check('PDF: snø-rommet står ikke på kabelsiden', 0, på.pages.filter(p => p.page === ks && p.t === 'Uteplass').length,",
    "check('PDF: snø-rommet står ikke på kabelsiden', 0, på.pages.filter(p => p.page === ks && p.t === 'Uteplass').length === 0,");
rep("check('PDF: valget av → ingen kabelside', 0, antall(av, TITTEL),", "check('PDF: valget av → ingen kabelside', 0, antall(av, TITTEL) === 0,");
rep("check('PDF: gamle kallsteder uten valget → ingen kabelside', 0, antall(uten, TITTEL),", "check('PDF: gamle kallsteder uten valget → ingen kabelside', 0, antall(uten, TITTEL) === 0,");
rep("check('bare folie: ingen kabelside selv med valget på', 0, antall(folie, TITTEL),", "check('bare folie: ingen kabelside selv med valget på', 0, antall(folie, TITTEL) === 0,");
rep("check('bare folie: valget vises ikke i dialogen', null, document.getElementById('exp-cabletable'),", "check('bare folie: valget vises ikke i dialogen', 'ingen', !document.getElementById('exp-cabletable'),");
rep("    const radSider = [...new Set(mange.pages.filter(p => p.size === 8 && /^TestKabel/.test(p.t) && p.page >= side(mange, TITTEL)).map(p => p.page))];",
    "    const iTab = p => p.page >= side(mange, TITTEL) && p.page < side(mange, 'Materialliste');   // materiallista har også produktnavn\n    const radSider = [...new Set(mange.pages.filter(p => p.size === 8 && /^TestKabel/.test(p.t) && iTab(p)).map(p => p.page))];");
rep("const radN = mange.pages.filter(p => p.size === 8 && /^TestKabel/.test(p.t) && p.page >= side(mange, TITTEL)).length;",
    "const radN = mange.pages.filter(p => p.size === 8 && /^TestKabel/.test(p.t) && iTab(p)).length;");
fs.writeFileSync(f,s);
