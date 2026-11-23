// 240: felles kildetekst som limes inn i sidens eval (etter FIX fra docs/217-hindring/probe/fixture.mjs).
// ROM: Kenneths eksempel. L-rom 700 × 680 (hakk oppe til høyre, høyre vegg 361 cm), vannrette
// foliebaner B=80/60/100/60/50 med mellomrom 2 / 3,6 / 2,4 / 2 / 4 / 2 cm; banene slutter 3,5 cm fra høyre vegg.
export const ROM = `
  const X0 = 5000;
  const foil = (id, b) => ({ id, category_id: 1, active: true, name: 'FlexFoil 60W B=' + b + 'cm', width_mm: b * 10 - 10, netto_width_mm: b * 10 - 10, watt_per_m2: 60, watt_per_lm: b * 0.6, voltage: 230, min_gap_mm: 10, min_wall_margin_mm: 25, el_no: '10010' + b, article_no: 'FF-' + b });
  const FB = {}; for (const b of [80, 60, 100, 50, 20]) { FB[b] = foil(997000 + b, b); HEATING_PRODUCTS.push(FB[b]); }
  const L = mk(51, 'L-rom', [[0, 0], [400, 0], [400, 319], [700, 319], [700, 680], [0, 680]].map(([x, y]) => ({ x: x + X0, y })));
  L.dimSnap = true; S.rooms.push(L);
  { let y = 321, sid = 9000;
    for (const [b, gap] of [[80, 3.6], [60, 2.4], [100, 2], [60, 4], [50, 0]]) { S.strips.push({ id: sid++, roomId: 51, productId: FB[b].id, direction: 'h', pos_cm: y, start_cm: X0 + 2.5, length_cm: 694 }); y += b - 1 + gap; } }
  _invalidateStripCache();
`;
// OVERLAPP: tekstboksene fra _renderRoomToImage (228-fangsten). Par der minst én er en måltekst
// (dim) og den andre er måltekst eller veggetikett («V5 680 cm») og boksene overlapper; måltekster
// utenfor bildet; og måltekster som overlapper andre tekster (produktetiketter o.l.).
export const OVERLAPP = `
  const overlapp = (tx, W, H) => {
    const hit = (a, b) => a.x0 < b.x1 - 0.5 && a.x1 > b.x0 + 0.5 && a.y0 < b.y1 - 0.5 && a.y1 > b.y0 + 0.5;
    const vegg = t => /^V\\d+ \\d+ cm$/.test(t.str);
    const par = [], andre = [];
    for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) {
      const a = tx[i], b = tx[j];
      if (!(a.dim || b.dim) || !hit(a, b)) continue;
      if ((a.dim || vegg(a)) && (b.dim || vegg(b))) par.push(a.str + ' × ' + b.str); else andre.push(a.str + ' × ' + b.str);
    }
    const utenfor = tx.filter(t => t.dim && (t.x0 < 0 || t.y0 < 0 || t.x1 > W || t.y1 > H)).map(t => t.str);
    return { par, andre, utenfor };
  };
`;
