const { K, FORM } = require('./DY_cfg.js');
const R = K.computeData(K.withCatalog({ ...FORM, kind:'reduit', mat:'gon_fichte', sys:'battens', rw:'2400' }));
R.rows.forEach(r => console.log(` ${r.pos} ${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t} [${r.kind}] | ${r.note}`));
R.steps.forEach((s,i)=>console.log(i+1, s[0]+': '+s[1]));
console.log(R.warn);
