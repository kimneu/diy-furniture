const { K, E, CFG } = require('./DY_cfg.js');
for (const k of process.argv.slice(2)) {
  const R = K.computeData(CFG[k]);
  console.log('\n######', k);
  console.log(E.listeText(E.einkaufsliste(R), k));
  console.log('kosten', Math.round(K.kostenGesamt(R)), 'solidCost', R.solidCost && R.solidCost.toFixed(2), 'buyCost', R.buyCost && R.buyCost.toFixed(2));
  for (const g of R.groups) console.log(' group', g.label, 'sheets', g.sheets.length, 'unplaced', g.unplaced.map(u=>u.pos+' '+u.L+'x'+u.B).join(','));
}
