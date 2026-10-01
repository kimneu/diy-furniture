const path=require('path').join(__dirname, '../../..') + '/';
Object.assign(global, require(path+'shared.js'));
global.PREISE = require(path+'preise.js');
Object.assign(global, require(path+'reduit.js'));
const base = { mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95 };
for (const sys of ['battens','rails','brackets','cheeks','posts']) for (const build of ['built']) {
  const R = computeReduit({ ...REDUIT_DEFAULTS, ...base, sys, build, shape:'U' });
  console.log('==', sys, build, 'warn:', R.warn);
  console.log(R.rows.map(r => `${r.pos} ${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t} – ${r.note}`).join('\n'));
  console.log(R.hw.map(h=>h.slice(0,3).join(' | ')).join('\n'));
}
const R = computeReduit({ ...REDUIT_DEFAULTS, ...base, build:'free', shape:'U' });
console.log('== free', R.warn); console.log(R.rows.map(r => `${r.pos} ${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t} – ${r.note}`).join('\n'));
