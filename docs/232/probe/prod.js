(async () => {
  try { await _loadProducts(); } catch (e) { return 'FEIL ' + e.message; }
  const cats = PRODUCT_CATEGORIES.map(c => c.id + ':' + c.name).join(' | ');
  const f = HEATING_PRODUCTS.filter(p => p.watt_per_lm || /foil|folie/i.test(p.name || ''));
  return cats + '\n' + f.map(p => [p.id, p.name, 'w=' + p.width_mm, 'netto=' + p.netto_width_mm, 'wlm=' + p.watt_per_lm, 'wm2=' + p.watt_per_m2, 'cat=' + p.category_id, p.active ? '' : 'INAKTIV'].join(' ; ')).join('\n') + '\nantall produkter: ' + HEATING_PRODUCTS.length;
})()
