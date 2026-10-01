const { K, BASE, run } = require('./RM_lib.js');
const R = run({ shape:'U', build:'free', nicheL:true, nicheLW:450, nicheLH:1300 });
console.log('warn', R.warn);
R.rows.forEach(r=>console.log(r.pos, r.qty, r.name, r.L, '×', r.B, '×', r.t, '|', r.note));
const R2 = run({ shape:'U', build:'free', back:'none' });
console.log('ohne Rückwand warn', R2.warn, R2.hw.filter(h=>/Winkel|Kipp/.test(h[1])));
// Module: Seiten frei stehend, feste Böden nur Boden+Deckel
const R3 = run({ shape:'I', build:'free' });
const fixed = R3.rows.filter(r=>/Boden|Deckel/.test(r.name) && r.note==='zwischen den Seiten');
console.log('I frei: feste Böden', fixed.map(r=>r.qty+'× '+r.name), 'Einlegeböden', R3.rows.filter(r=>r.name==='Einlegeboden').map(r=>r.qty), 'Seitenhöhe', R3.rows.find(r=>r.name==='Seite').L, 'freie Seitenlänge zwischen Boden (150) und Deckel (2100):', 2100-150-18);
