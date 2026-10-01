const { Model } = require('./EP_grid.js');
// Test Torsion: quadratische Platte 600, allseitig gelenkig, isotrop nu=0 → w = 0.00406 q a^4 / D
const E=9000, G=4500, t=18, a=600, q=0.001;
const m = new Model(); const P = m.plate('T', 0, a, 0, a, 24, 24, E, G, t, q);
for (let i=0;i<=24;i++){ m.fix.push(P.id[0][i], P.id[24][i], P.id[i][0], P.id[i][24]); }
m.solve(); const D=E*t**3/12;
console.log('Platte allseitig: FE', m.w(P.id[12][12]).toFixed(3), 'Theorie', (-0.00406*q*a**4/D).toFixed(3));
