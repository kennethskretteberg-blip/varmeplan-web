(async () => { try { await _loadProducts(); } catch (e) {}
  const t = await _roomTypeRegressionTest236();
  return { ok: t.ok, n: t.results.length, feil: t.results.filter(r => !r.ok) }; })()
