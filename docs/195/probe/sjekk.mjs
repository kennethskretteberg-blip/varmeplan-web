// 195: er appen (4000) og Chrome med CDP (9333) oppe?
for (const u of ['http://localhost:4000/', 'http://127.0.0.1:9333/json/version']) {
  try { const r = await fetch(u); console.log(u, r.status, (await r.text()).slice(0, 300).replace(/\s+/g, ' ')); }
  catch (e) { console.log(u, 'NEDE', e.cause && e.cause.code); }
}
