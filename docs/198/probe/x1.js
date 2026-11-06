(() => {
  const list = [{ id: 'p1', name: 'Eget', _vismaOfferNo: '55501', _vismaOrderNo: 'ORD-9', _salesStatus: 'vunnet' }];
  const f = q => _filterProjectsList(list, { search: q, status: '' }).length;
  return { a: f('55501'), b: f('ord-9'), c: f('ORD-9'), d: f('ord'), e: f('eget'), src: String(_filterProjectsList).slice(0, 900) };
})()
