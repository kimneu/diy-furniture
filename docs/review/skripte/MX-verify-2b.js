const { K, sb, rd, hard } = require('./MX-verify-lib.js');
for (const mat of ['seekiefer','fichtesp','osb']) {
  const { R } = sb({ mat, t:'12', w:'2400', h:'1400', d:'650', sections:'4', shelves:'3', base:'plinth', baseH:'80', front:'open' });
  console.log(`SB open ${mat} 12 2400x1400x650: warn=${JSON.stringify(R.warn)} hard=${hard(R).length}`);
  const r2 = sb({ mat, t:'12', w:'2400', h:'720', d:'450', sections:'3', shelves:'0' }).R;
  console.log(`SB ${mat} 12 2400x720x450 n3 shelves0: s=${r2.s.toFixed(0)} warn=${JSON.stringify(r2.warn)} rows=${r2.rows.map(r=>r.qty+'x'+r.name+' '+r.L+'x'+r.B).join('; ')}`);
}
