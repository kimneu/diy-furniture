const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const base = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95 };
const run = o => computeReduit({ ...base, ...o });
module.exports = { run, base };
if (require.main === module) {
  const sys = process.argv[2] || 'posts', shape = process.argv[3] || 'U';
  const extra = process.argv[4] ? JSON.parse(process.argv[4]) : {};
  const R = run({ shape, sys, build:'built', ...extra });
  console.log('max', R.max);
  for (const r of R.rows) console.log(r.pos, r.qty, r.name, r.L, 'x', r.B, 'x', r.t, '|', r.note, '|', r.kind);
  console.log('--- hw');
  for (const h of R.hw) console.log(h);
  console.log('--- warn');
  for (const w of R.warn) console.log(' *', w);
  console.log('--- steps');
  for (const s of R.steps) console.log(' #', s[0], ':', s[1]);
}
