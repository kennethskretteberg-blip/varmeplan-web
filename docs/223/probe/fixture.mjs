// 223: utvidet testprosjekt = 217-fixturet (fire rom: kabel + hindring, folie + hindring, kabel + søyle,
// folie + L-hindring/femkant, med alle måltyper) + et matterom (InSnow 0,5 m-matter) + en rett trapp
// med repos + et brukermål. Alt på én etasje (id 1, del 71), så ett bilde viser alt.
import { FIX as FIX217 } from '../../217-hindring/probe/fixture.mjs';
export const FIX = `${FIX217}
  const M05 = { id: 996316, category_id: 3, active: true, product_family: 'InSnow 300T', name: 'InSnow 300T 0,5x16m', voltage: 400, mat_area_m2: 8, mat_width_mm: 500, watt_per_m2: 300, total_effect_w: 2400, mat_cc_mm: 100, el_no: '1003516', article_no: 'IS300-0516' };
  HEATING_PRODUCTS.push(M05); PRODUCT_CATEGORIES.push({ id: 3, name: 'Varmematte utendørs', module_type: 'mat' });
  S.rooms.push(mk(35, 'Matte', rect(0, 500, 300, 400)));
  for (let k = 0; k < 4; k++) S.mats.push({ id: 350 + k, roomId: 35, productId: M05.id, x_cm: 20 + k * 65, y_cm: 520, width_cm: 50, length_cm: 360, num_runs: 1, last_run_length_cm: null, gap_cm: 5, rotation_deg: 0, matCoordV: 2, startCorner: 'bl' });
  for (const rm of S.rooms) { rm.dimSnap = true; rm.stripDimSnap = true; rm.cableDimSnap = true; rm.matDimSnap = true; }
  S.rooms[1].dims.push({ id: 8001, p1: { x: 650, y: 290 }, p2: { x: 950, y: 290 }, wnx: 0, wny: 1, offset: -60 });
  const Tst = (n, h) => ({ type: 'steps', stepCount: n, stepDepth_cm: 30, stepHeight_cm: h || 17, width_cm: 100 });
  const Lst = d => ({ type: 'landing', depth_cm: d || 120, width_cm: 100 });
  S.counters.nextStairId = 9301;
  const st = _createStairObj({ name: 'Trapp', width_cm: 100, step_depth_cm: 30, step_height_cm: 17, buildDirection: 'bottom', edgeMargin_cm: 5, stepCC_cm: 10, landingCC_cm: 10, riserOffset_cm: 2, noseOffset_cm: 2, x_cm: 500, y_cm: 500, segments: [Tst(4), Lst(120), Tst(6)] });
  st.floorId = 1; st.partId = 71; S.stairs.push(st);
  _invalidateStripCache(); _invalidateCableCache && _invalidateCableCache(); _invalidateMatCache && _invalidateMatCache();
  S.ui.selectedRoomId = null; S.ui.selectedDimId = null; S.ui.selectedStairId = null;
`;
// Visning: alle rom i bildet, lyst tema, rutenett på. zoom/pan settes av kalleren.
export const VIS = `S.ui.theme = 'light'; document.body.classList.add('light-theme'); S.ui.showGrid = true; renderSidebar(); updateCtxBar(); render();`;
