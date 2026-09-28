const { K, FORM } = require('./DY_cfg.js');
for (const [m,t] of [['birke','18'],['osb','12']]) {
const R = K.computeData(K.withCatalog({ ...FORM, kind:'reduit', mat:m, t, sys:'brackets' }));
console.log(m, t, R.hw.map(h=>h[0]+'× '+h[1]+' | '+h[2]).join('\n  '));
const w = R.extras.filter(e=>e.type==='metal'); console.log('  metal boxes sample', w.slice(0,2).map(e=>e.size.map(Math.round)));
}
