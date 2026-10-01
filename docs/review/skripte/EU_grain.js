const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const M = MATS.birke; console.log('Birke', JSON.stringify({ tDef:M.tDef, sheet:M.sheet, fmt:M.formats || M.format, price:M.price }).slice(0,300));
for (const sys of ['battens','posts','cheeks']) {
  const R = computeReduit({ ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:M.sheet?M.sheet[0]:2500, sheetB:M.sheet?M.sheet[1]:1250, kerf:4, grain:true, price:M.price, sys });
  console.log(sys, R.warn.filter(w=>/passt nicht/.test(w)).map(w=>w.slice(0,110)));
}
