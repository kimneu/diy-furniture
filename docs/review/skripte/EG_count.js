const { mk, inter, f } = require('./EG_lib.js');
function hits(over, a, b){ const { items } = mk(over); let n = 0; for (const A of items) if (A.name === a) for (const B of items) if (B.name === b && inter(A, B).every(v => v > 0.5)) n++; return n; }
console.log('posts U: Pfosten×Tablar', hits({ sys:'posts', shape:'U' }, 'Kantholz 45 × 45', 'Tablar'));
console.log('posts U regalbau: Pfosten×Tablar', hits({ sys:'posts', shape:'U', mat:'regalbau' }, 'Kantholz 45 × 45', 'Tablar'));
console.log('battens U doorIn L: Stütze×Tablar', hits({ sys:'battens', shape:'U', doorIn:true, hinge:'L' }, 'Kantholz 45 × 45', 'Tablar'));
console.log('rails U: Schiene×Tablar', hits({ sys:'rails', shape:'U' }, 'Schiene/Winkel senkrecht', 'Tablar'));
for (const [d, sys] of [[200,'brackets'],[225,'brackets'],[226,'brackets'],[300,'brackets'],[400,'brackets']]) {
  const { items, R } = mk({ sys, shape:'I', dBack:d });
  const low = Math.min(...items.filter(i => i.kind === 'metal').map(i => i.y0));
  console.log('Winkel Tiefe', d, '→', R.hw.find(h => /Blechkonsole/.test(h[1]))[1], 'tiefster Punkt', f(low), 'mm');
}
const { R } = mk({ sys:'cheeks', shape:'U' });
const w = R.rows.filter(r => r.name === 'Wange'); console.log('Wangen', w.map(r => `${r.qty}× ${r.L}×${r.B}`).join(', '), 'Fläche über 2170:', (w.reduce((a, r) => a + r.qty * r.B * (r.L - 2170), 0)/1e6).toFixed(2), 'm²');
console.log('Diagonalen', Math.hypot(2390, 400).toFixed(0), Math.hypot(2390, 300).toFixed(0), Math.hypot(2390, 18).toFixed(1), Math.hypot(2170, 400).toFixed(0));
// Einfahrwinkel Tür 2000
const b = (L) => { let lo = 0, hi = Math.PI/2; for (let i=0;i<60;i++){ const m=(lo+hi)/2; if (L*Math.sin(m)+18*Math.cos(m) > 2000) hi = m; else lo = m; } return [lo*180/Math.PI, L*Math.cos(lo)]; };
for (const L of [2390, 2170]) { const [deg, proj] = b(L); console.log('Wange', L, 'max. Neigung unter Sturz', deg.toFixed(1), '° → Fuss', proj.toFixed(0), 'mm im Raum; nötige Raumtiefe bei B 1600:', Math.sqrt(Math.max(0, proj*proj - 800*800)).toFixed(0), ', bei B 1000:', Math.sqrt(Math.max(0, proj*proj - 500*500)).toFixed(0)); }
// Querlatten-Kragarm
const q = 0.35*9.81/2 * 0 + 17.5*9.81/1000, L = 500.5, E = 11000, I = 24*48**3/12;
console.log('Kragarm Querlatte q', q.toFixed(3), 'N/mm, L', L, '→ δ', (q*L**4/(8*E*I)).toFixed(1), 'mm');
