(async () => { try { await _loadProducts(); } catch (e) {}
  const N = d => { d = JSON.parse(JSON.stringify(d)); if (d.project) delete d.project.savedAt; return JSON.stringify(d); };
  _resetProjectState(); addPart('indoor'); addPart('snow');
  const j1 = N(_buildSaveData()); _restoreProject(JSON.parse(j1)); const j2 = N(_buildSaveData());
  let i = 0; while (i < j1.length && j1[i] === j2[i]) i++;
  return { len: [j1.length, j2.length], a: j1.slice(i - 100, i + 60), b: j2.slice(i - 100, i + 60), likt: j1 === j2 };
})()
