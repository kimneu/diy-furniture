const { Model } = require('./EP_grid.js');
// Test: Plattenstreifen 1594 × 397 nur an den Stirnseiten gelagert → Balken 5qL^4/384EI
const E=9000, G=600, t=18;
const m = new Model(); const q = 0.001; const P = m.plate('T', 0, 1594, 0, 397, 40, 10, E, G, t, q);
for (let j=0;j<=P.ny;j++){ m.fix.push(P.id[j][0], P.id[j][P.nx]); }
m.solve();
const wmid = m.w(P.id[5][20]); const EI = E*397*t**3/12; const L=1594;
console.log('Test Balken: FE', wmid.toFixed(2), 'mm, Formel', (-5*q*397*L**4/(384*EI)).toFixed(2), 'mm');
// Kragplatte 397 an der Wand eingespannt? (nicht relevant) – Test Durchlauf ok.
