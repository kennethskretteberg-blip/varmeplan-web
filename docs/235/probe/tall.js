(async () => { try { await _loadProducts(); } catch (e) {}
  const src = await (await fetch("/index.html")).text();
  const a = src.indexOf("function _cable235Fixture()"), b = src.indexOf("\n}\n", a);
  (0, eval)(src.slice(a, b + 2));
  return JSON.stringify(_cable235Fixture().sig, null, 1); })()
