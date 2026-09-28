// EP-2 / EP-12 / EP-13: Ecke beim Pfostenrahmen und bei Leisten
const L = require('./EP-verify-lib.js');
const loc = (r, b) => { const [X, Y, Z] = L.bb(b); return `x(ab li. Wand) ${Math.round(X[0]+r.W/2)}..${Math.round(X[1]+r.W/2)} | y ${Math.round(Y[0])}..${Math.round(Y[1])} | z(ab Rückwand) ${Math.round(Z[0]+r.D/2)}..${Math.round(Z[1]+r.D/2)}`; };
const r = L.R({ sys:'posts' });
const inCorner = b => { const [X,,Z] = L.bb(b); return X[0]+r.W/2 < 350 && Z[0]+r.D/2 < 450 && L.bb(b)[1][0] < 200; };
for (const b of r.boxes.filter(inCorner)) console.log(L.name(b).padEnd(70), loc(r, b));
console.log('Posts:'); for (const b of r.boxes.filter(b => b.key.startsWith('Kantholz'))) console.log(loc(r, b));
const ov = L.overlaps(r.boxes).filter(o => /Eckleiste/.test(o.a + o.b));
const g = {}; for (const o of ov) { const k = (/Eckleiste/.test(o.a) ? o.b : o.a).split(' (')[1] + ' ' + o.d.join('x'); g[k] = (g[k]||0)+1; }
console.log(g);
console.log('screw70', r.hw.filter(h => /5 × 70|4 × 35/.test(h[1])));
console.log('steps', r.steps.filter(s => /Latten|Eck/.test(s[0])).map(s => s[0] + ': ' + s[1]));
// worst case EP_13
const w = L.R({ sys:'posts', mat:'fichte', t:27, rd:1999, dBack:200 });
console.log('worst posts', w.boxes.filter(b => b.key.startsWith('Kantholz')).map(b => loc(w, b)), 'max', w.max);
// Balken: Querlatte 24x48 hochkant, Überhang a, Feld L
function overhang(a, Lf, wkgm, Pkg, E=11000){ const I = 24*48**3/12, EI = E*I, w = wkgm*9.81/1000, P = Pkg*9.81;
  const dq = w*a*(4*a*a*Lf - Lf**3 + 3*a**3)/(24*EI), dP = P*a*a*(Lf+a)/(3*EI);
  const Rwall = (w*Lf*Lf/2 - w*a*a/2 - P*a)/Lf/9.81; return { dq:+dq.toFixed(2), dP:+dP.toFixed(2), sum:+(dq+dP).toFixed(2), RwallKg:+Rwall.toFixed(1) }; }
console.log('Standard a=500 L=497', overhang(500, 497, 19.8, 10));
console.log('Standard a=500 L=497 P=0', overhang(500, 497, 19.8, 0));
// EP-12 Leisten
const b = L.R({ sys:'battens' });
for (const x of b.boxes.filter(bx => { const [X,,Z] = L.bb(bx); return X[0]+b.W/2 < 350 && Z[0]+b.D/2 < 450 && Z[1]+b.D/2 > 300 && L.bb(bx)[1][0] < 200; })) console.log('BAT', L.name(x).padEnd(60), loc(b, x));
const ob = L.overlaps(b.boxes); const gb = {}; for (const o of ob) { const k = o.a.split(' (')[0] + ' <> ' + o.b.split(' (')[0] + ' ' + o.d.join('x'); gb[k] = (gb[k]||0)+1; } console.log(gb);
// EP-13 Bretter
for (const m of ['gon_fichte', 'regalbau', 'schaltafel']) { const rr = L.R({ sys:'battens', mat:m, t: MATS[m].tDef }); const e = rr.boxes.find(x => x.key.startsWith('Eckleiste')); const row = rr.rows.find(x => x.name === 'Eckleiste'); console.log(m, 'row', row && [row.L, row.B, row.t], 'box', e && e.size.map(Math.round)); }
