const { K, sb, rd, hard } = require('./MX-verify-lib.js');
for (const mat of ['seekiefer','fichtesp','osb','birke']) for (const joint of ['pocket','dowels']) {
  const { R } = sb({ mat, t:'12', w:'2400', h:'1400', d:'650', sections:'4', shelves:'3', base:'plinth', baseH:'80', joint });
  console.log(`SB ${mat} 12 ${joint} 2400x1400x650: s=${R.s.toFixed(0)} warn=${JSON.stringify(R.warn)} hard=${hard(R).length}`);
}
for (const mat of ['seekiefer','fichtesp','osb']) {
  const { R } = sb({ mat, t:'12', w:'2400', h:'720', d:'450', sections:'3', shelves:'1' });
  console.log(`SB ${mat} 12 2400x720x450 n3: s=${R.s.toFixed(0)} warn=${JSON.stringify(R.warn)}`);
}
// Reduit free with seekiefer 15 (tDef) default U
for (const mat of ['seekiefer','osb']) for (const t of ['12','15']) {
  const { R } = rd({ mat, t, build:'free', joint:'pocket' });
  console.log(`RD free ${mat} ${t}: warn=${JSON.stringify(R.warn)} modules=${R.modules} Seite=${R.rows.filter(r=>r.name==='Seite').map(r=>r.qty+'x'+r.L+'x'+r.B+'x'+r.t)}`);
}
