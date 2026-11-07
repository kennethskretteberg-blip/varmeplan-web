(async () => { try { await _loadProducts(); } catch (e) {}
  window._scheduleAutoSave = () => {};
  _resetProjectState(); S.project.name = 'Fixtur 204';
  addPart('indoor'); const f1 = S.floors[0].id;
  createRoom([{x:0,y:0},{x:400,y:0},{x:400,y:300},{x:0,y:300}], 'rect', 'Bad', f1, true);
  createRoom([{x:500,y:0},{x:900,y:0},{x:900,y:500},{x:700,y:500},{x:700,y:300},{x:500,y:300}], 'lshape', 'Stue', f1, true);
  addPart('snow'); const f2 = S.floors.find(f => f.partId === S.ui.activePartId).id;
  const bg = _installTileBackground(f2, { east: 574200, north: 6670300 }, 'Testveien 4');
  S.geo = { [f2]: { address: 'Testveien 4', center: { east: 574200, north: 6670300 }, chosen: null, candidates: [] } };
  createRoom([{x:9000,y:-9000},{x:9800,y:-9000},{x:9800,y:-8400},{x:9000,y:-8400}], 'rect', 'Innkjørsel', f2, true);
  const d = _buildSaveData(); delete d.project.savedAt; return JSON.stringify(d);
})()
