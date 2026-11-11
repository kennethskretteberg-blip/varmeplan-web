(async () => {
  await _loadProducts();
  const P = b => HEATING_PRODUCTS.find(p => p.name === 'FlexFoil B=' + b + 'cm');
  const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  const mkRoom = (id, navn, pts) => ({ id, floorId: 998001, partId: null, name: navn, points: pts.map(q => ({ ...q })), walls: compWalls(pts), area: Math.abs(compArea(pts)), dims: [] });
  let sid = 998300;
  const strip = (roomId, b, pos, start, len) => ({ id: ++sid, roomId, productId: P(b).id, direction: 'v', pos_cm: pos, start_cm: start, length_cm: len });
  S.floors = [{ id: 998001, name: '1. etasje', order: 1 }];
  S.rooms = [mkRoom(1, 'Stue', rect(0, 0, 600, 500)), mkRoom(2, 'Kjøkken', rect(700, 0, 500, 400)), mkRoom(3, 'Bod uten folie', rect(1300, 0, 300, 300)),
    mkRoom(4, 'Kontor', rect(0, 600, 500, 400)), mkRoom(5, 'Gang', rect(700, 600, 500, 300))];
  S.strips = [strip(1, 100, 50, 20, 450), strip(1, 100, 160, 20, 450), strip(2, 60, 750, 20, 360), strip(2, 100, 830, 20, 300),
    strip(4, 20, 50, 620, 300), strip(4, 40, 80, 620, 300), strip(4, 100, 130, 620, 300),
    strip(5, 20, 750, 620, 200), strip(5, 40, 780, 620, 200), strip(5, 60, 830, 620, 200)];
  _invalidateStripCache();
  for (const id of ['auth-screen', 'project-list-screen']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  _showExportDialog(); _expPreviewSection('resistance');
  const cb = document.getElementById('exp-resistance');
  return 'avkrysset: ' + (cb && cb.checked) + ' · ' + document.getElementById('exp-preview-area').textContent.replace(/\s+/g, ' ').slice(0, 700);
})()
