const { K, BASE, run } = require('./RM_lib.js');
const R = run({ shape:'L', corner:'L', rw:1200, doorW:700, dLeft:250, sys:'battens' });
console.log('rw1200 Tür700 dLeft250:', R.warn.filter(w=>/Tür/.test(w)), 'wf', (1200-700)/2);
// Kipp-Überschlag Seitenmodul U Standard
const F = run({ shape:'U', build:'free' });
const rho = 680, rhoB = 800;
const side = F.rows.find(r=>r.name==='Seite' && r.B===290), bod = F.rows.filter(r=>/Boden|Deckel/.test(r.name) && r.B===287);
const vol = 2*side.L*side.B*side.t/1e9 + 5*457*287*18/1e9;
const m = vol*rho + 491*2116*3/1e9*rhoB;
const M = m*9.81*0.145;
console.log('Seitenmodul Masse ca.', m.toFixed(1), 'kg; Kippmoment', M.toFixed(1), 'Nm; Zug oben (2,1 m)', (M/2.1).toFixed(0), 'N; auf 1,1 m', (M/1.1).toFixed(0), 'N');
