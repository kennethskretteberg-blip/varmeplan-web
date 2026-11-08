// 219: lager fixturene med 2D-motorens egne funksjoner, så de har nøyaktig den strukturen S.tak får i appen.
// Kjøres med: node docs/3d/lag-fixtures.mjs   (skriver docs/3d/fixtures/*.json)
import fs from 'node:fs';
import path from 'node:path';
import { lastTodMotor, ROT } from './todmotor.mjs';

const M = lastTodMotor(), F = M.FID;
const rect = (w, h) => [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
const hoyder = (eave, ridge, gz) => {
  if (gz != null) M._takSetHeight(F, 'ground_z', String(gz));
  M._takSetHeight(F, 'eave_m', String(eave));
  if (ridge != null) M._takSetHeight(F, 'ridge_m', String(ridge));
};
const skriv = (navn, t) => {
  const dir = path.join(ROT, 'docs/3d/fixtures');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, navn + '.json'), JSON.stringify(M.ren(t), null, 1) + '\n');
};

// 1 · Filmens bygg: takfot 25 m, tre nedløp, 10 m, to løp i renna og i nedløpene. Mønehøyden 13 m er bare til visningen.
{
  const t = M.nyttTak(rect(2500, 1000));
  M._takSetRoofType(F, 'pitched'); hoyder(10, 13);
  const g = M._takAddGutter(F, 'k1');
  for (const at of [2, 12.5, 23]) M._takAddDownspout(F, g.id, at);
  skriv('1-filmens-bygg', t);
}
// 2 · Saltak, med terreng i moh., begge takfotene, snøfanger, takvindu og en hindring kabelen må forbi.
{
  const t = M.nyttTak(rect(1200, 800));
  M._takSetRoofType(F, 'pitched'); hoyder(5.2, 8.1, 86.4);
  const g1 = M._takAddGutter(F, 'k1'), g2 = M._takAddGutter(F, 'k3');
  M._takAddDownspout(F, g1.id, 1); M._takAddDownspout(F, g1.id, 11);
  M._takAddDownspout(F, g2.id, 6);
  M._takAddGuard(F, 'k1');
  M._takAddObject(F, 'SKYLIGHT', { x: 400, y: 200 });
  const h = M._takAddObject(F, 'OBSTACLE', { x: 700, y: 0 }, { gutter: g1.id, at_m: 7 });
  M._takSetObj(F, h.id, 'bypass', true); M._takSetObj(F, h.id, 'extra', '0,6');
  skriv('2-saltak', t);
}
// 3 · L-form med 8 kanter, merket for hånd, med to møner tegnet for hånd (220). De møtes midt i bygget.
{
  const t = M.nyttTak([{ x: 0, y: 0 }, { x: 1400, y: 0 }, { x: 1400, y: 700 }, { x: 900, y: 700 }, { x: 900, y: 1200 }, { x: 200, y: 1200 }, { x: 200, y: 900 }, { x: 0, y: 900 }]);
  M._takSetRoofType(F, 'pitched'); hoyder(5.4, 8.2, 142.3);
  const typer = { k1: 'eave', k2: 'rake', k3: 'eave', k4: 'eave', k5: 'rake', k6: 'eave', k7: 'eave', k8: 'eave' };
  for (const [id, type] of Object.entries(typer)) M._takSetEdgeType(F, id, type);
  M._takAddRidge(F, { x: 1400, y: 350 }, { x: 550, y: 350 });   // fra midten av gavlen k2, inn til møtepunktet
  M._takAddRidge(F, { x: 550, y: 1200 }, { x: 550, y: 350 });   // fra midten av gavlen k5, inn til samme punkt
  const a = M._takAddGutter(F, 'k1'), b = M._takAddGutter(F, 'k3'), c = M._takAddGutter(F, 'k6');
  M._takAddDownspout(F, a.id, 1); M._takAddDownspout(F, a.id, 13);
  M._takAddDownspout(F, b.id, 4.5);
  M._takAddDownspout(F, c.id, 3);
  M._takAddValley(F, { x: 650, y: 350 }, { x: 900, y: 700 });
  M._takAddGuard(F, 'k1');
  skriv('3-l-form-8-kanter', t);
}
// 4 · Flatt tak 40 × 20 m med ni sluk, parapet, en gradrenne og et varmefelt (212s tall).
{
  const t = M.nyttTak(rect(4000, 2000));
  M._takSetRoofType(F, 'flat'); hoyder(12);
  M._takFlatSetCable(F, 'InSnow 30T');
  for (const x of [666.7, 2000, 3333.3]) for (const y of [333.3, 1000, 1666.7]) M._takFlatAddDrain(F, { x, y });
  t.flat.features.filter(f => f.type === 'ROOF_DRAIN').forEach(d => M._takFlatSet(F, d.id, 'pipe_cable_m', '1,5'));
  const v = M._takFlatAddValley(F, { x: 666.7, y: 1000 }, { x: 1466.7, y: 1000 });
  M._takFlatSet(F, v.id, 'width_m', '0,6'); M._takFlatSet(F, v.id, 'wm2', '300');
  const f = M._takFlatAddField(F, [{ x: 2600, y: 200 }, { x: 3800, y: 200 }, { x: 3800, y: 900 }, { x: 2600, y: 900 }]);
  M._takFlatSet(F, f.id, 'wm2', '300');
  M._takFlatSetSetup(F, 'valleys');
  skriv('4-flatt-tak', t);
}
// 5 · Ett nedløp ført 1,0 m under bakken (standarddybden fra 206).
{
  const t = M.nyttTak(rect(800, 500));
  M._takSetRoofType(F, 'pitched'); hoyder(3, 5.2, 25);
  const g = M._takAddGutter(F, 'k1');
  const d = M._takAddDownspout(F, g.id, 4);
  M._takSetDownspout(F, d.id, 'under', true);
  skriv('5-nedlop-under-bakken', t);
}
console.log('fixturer skrevet');
