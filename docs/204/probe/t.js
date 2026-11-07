(async () => { try { await _loadProducts(); } catch (e) {} const t = await _takRegressionTest204(); return { n: t.results.length, fail: t.results.filter(r => !r.ok) }; })()
