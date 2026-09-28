const { solve } = require('./EP_beam.js');
const g = 9.81/1000; // kg/m -> N/mm
const E = 11000, I = 24*48**3/12, EI = E*I;            // Latte 24 × 48 hochkant, Fichte C24
const qBack = (35 + 0.397*0.018*680)/2 + 0.5, qSide = (35 + 0.297*0.018*680)/2 + 0.5; // kg/m auf der Querlatte
console.log('Linienlast Querlatte hinten', qBack.toFixed(1), 'kg/m, seitlich', qSide.toFixed(1), 'kg/m');
const f = x => (x/g/1000*1000).toFixed(1); // N -> kg (x N / 9.81)
const kg = N => (N/9.81).toFixed(1);
// Seitliche Querlatte: u 400..1397, Pfosten Mitte 900.5, Wandende 1385 (Mitte 24-mm-Endlatte)
const side = (corner, P=[]) => solve(400, 1397, EI, [{x:900.5}, {x:1385}, ...corner], [{a:400,b:1397,q:qSide*g}], P);
let A = side([]);
console.log('A seitlich, Eckende frei: R', A.R.map(r=>`${r.x}:${kg(r.R)} kg`).join(', '), '| w(400)', A.w(400).toFixed(2), 'mm');
let A10 = side([], [{x:400, P:10*9.81}]);
console.log('A + 10 kg an der Innenecke: w(400)', A10.w(400).toFixed(2), 'mm, R', A10.R.map(r=>`${r.x}:${kg(r.R)}`).join(', '));
let B = side([{x:400}]);
console.log('B seitlich, Eckende starr gelagert: R', B.R.map(r=>`${r.x}:${kg(r.R)} kg`).join(', '));
// Hintere Querlatte: x 3..1597, Pfosten Mitte 533.5, 1067.5; Wandenden 15, 1585; Punktlast aus seitlicher Latte bei 288 und 1312
const Pc = B.R.find(r=>r.x===400).R;
const back = (P) => solve(3, 1597, EI, [{x:15},{x:533.5},{x:1067.5},{x:1585}], [{a:3,b:1597,q:qBack*g}], P);
let C = back([{x:288, P:Pc},{x:1312,P:Pc}]);
console.log('C hinten mit Eckpunktlast', kg(Pc), 'kg bei x=288: R', C.R.map(r=>`${r.x}:${kg(r.R)} kg`).join(', '), '| w(288)', C.w(288).toFixed(2), 'mm, wmin', C.wmin.toFixed(2));
// Elastische Kopplung: seitliche Latte an hintere Latte (Feder = Steifigkeit der hinteren Latte bei 288)
const C1 = back([{x:288, P:1000}]); const w1 = -C1.w(288); const kBack = 1000/w1;
console.log('Steifigkeit hintere Querlatte bei x=288:', kBack.toFixed(0), 'N/mm');
// Eckpfosten bei u 400..445 (Mitte 422.5)
const D = side([{x:422.5}]);
console.log('D seitlich mit Eckpfosten (Mitte 422.5): R', D.R.map(r=>`${r.x}:${kg(r.R)} kg`).join(', '));
const Dback = back([]);
console.log('D hinten ohne Punktlast: R', Dback.R.map(r=>`${r.x}:${kg(r.R)} kg`).join(', '));
// Summen über 5 Ebenen
console.log('Pfosten seitlich (heute, Fall A) je Ebene', kg(A.R[0].R), 'kg → 5 Ebenen', (A.R[0].R/9.81*5).toFixed(0), 'kg');
