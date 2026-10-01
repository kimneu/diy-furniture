const {run,s}=require('./EG-verify-lib.js');
for (const sys of ['rails','brackets','battens','posts']) {
  const {R}=run({sys});
  console.log(sys, R.hw.filter(h=>/4 × 35|5 × 70|Winkelverb/.test(h[1])).map(h=>h.slice(0,3).join(' | ')));
  console.log('  step', R.steps.filter(x=>/Tablare auflegen|Eckst|Latten und/.test(x[0])).map(x=>x[1]));
}
// Blechdicke gezeichnet
const {mt}=run({sys:'rails'}); console.log('rails metal sizes', [...new Set(mt.map(m=>m.size.map(Math.round).join('x')))]);
const {mt:mb}=run({sys:'brackets'}); console.log('brackets metal sizes', [...new Set(mb.map(m=>m.size.map(Math.round).join('x')))]);
