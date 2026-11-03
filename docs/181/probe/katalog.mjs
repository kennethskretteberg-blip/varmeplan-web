// Leser katalogen anonymt og måler hvor mange kabelnavn som får plass i Produkt-kolonnen (42 mm, 8 pt).
import { openPage } from './cdp.mjs';
const p = await openPage(`http://localhost:${process.argv[2] || 4000}/`);
const r = await p.eval(`(async()=>{
  const { data: cats } = await _db.from('product_categories').select('id,name,module_type');
  const { data, error } = await _db.from('heating_products').select('id,name,category_id,el_no,active,cable_length_m');
  if (error) return { error: error.message };
  const cabCat = new Set((cats||[]).filter(c => c.module_type === 'cable').map(c => c.id));
  const kab = data.filter(x => cabCat.has(x.category_id) && x.active !== false);
  const d = new window.jspdf.jsPDF(); d.setFont('helvetica','normal'); d.setFontSize(8);
  const lang = kab.filter(x => !/InSnow/.test(x.name) && d.splitTextToSize(x.name, 40).length > 1).map(x => x.name); const fam = [...new Set(kab.map(x => x.name.split(' ').slice(0,2).join(' ')))];
  return { fam, n: kab.length, lang: lang.length, eks: lang.slice(0, 15), lengst: kab.map(x=>x.name).sort((a,b)=>b.length-a.length).slice(0,5) };
})()`);
console.log(JSON.stringify(r, null, 1)); await p.close(); process.exit(0);
