(async () => {
  const r = await _projectStatusRegressionTest();
  await new Promise(res => setTimeout(res, 300));
  return { n: r.length, ok: r.filter(x => x.ok).length, feil: r.filter(x => !x.ok).map(x => x.name + ' ' + (x.info || '')),
    lekkDialog: !!document.getElementById('visma-no-overlay'), lekkToast: !!document.getElementById('visma-no-toast'),
    vdis: _vismaNoDisabled, nag: _vismaNoNagged };
})()
