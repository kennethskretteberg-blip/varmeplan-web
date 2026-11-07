(() => {
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  // samme mål som testens Blandet: 600 × 500 med 6 rader (lånt fra fixturets Stue-rader for tabellhøyden)
  const out = [];
  for (const [w, h] of [[600, 500], [500, 500], [800, 600], [400, 300], [300, 250]]) {
    const pts = rect(90000, 0, w, h), room = { id: 999001, name: 'X', points: pts, walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] };
    const base = _pdfRoomImgLayout(room);
    const res = {};
    for (const n of [1, 2, 6, 10]) {
      const rows = Array.from({ length: n }, (_, i) => ({ n: i + 1, name: 'FlexFoil 60W B=60cm', dim: '0,59 × 4,6 m', effect: '166 W', color: '#8c5a00' }));
      const two = n >= 5, m = _pdfLegendMeasure(null, rows, two ? 180 : 110, two ? 2 : 1);
      // ledig høyde under tegningen hvis Spesifikasjon har 1 rad (verste fall: ingenting fjernet)
      const need = base.imgH + m.h + 5 - base.availH;
      res[n] = need <= 0 ? 'får plass' : 'mangler ' + need.toFixed(1) + ' mm (' + (100 * need / base.imgH).toFixed(1) + ' %)';
    }
    out.push({ rom: w + '×' + h, bilde: base.imgW2.toFixed(1) + '×' + base.imgH.toFixed(1), availH: base.availH.toFixed(1), ...res });
  }
  return out;
})()
