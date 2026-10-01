const { run, bb } = require('./EP_lib.js');
const { solve } = require('./EP_beam.js');
let worst = { c:0 };
for (const [mat,t] of [['birke',18],['mdf',19],['fichte',27],['osb',18]]) for (const rd of [1000,1200,1400,1600,1800,1999,2200,2600,3000,3400,4000]) for (const dBack of [200,300,400,600]) {
  const R = run({ sys:'posts', mat, t, rd, dBack, shape:'L' });
  const posts = R.boxes.filter(b => b.key.startsWith('Kantholz')).map(b => bb(b, R)).filter(q => q.lo[2] >= dBack); // Seitenpfosten
  if (!posts.length) continue;
  const first = Math.min(...posts.map(q => (q.lo[2]+q.hi[2])/2));
  const c = first - dBack;
  if (c > worst.c) worst = { c, mat, t, rd, dBack, max:R.max };
}
console.log('Grösste Auskragung der seitlichen Querlatte an der Ecke (Pfostenmitte − Ecke):', JSON.stringify(worst));
// Durchbiegung für diese Auskragung: Latte 24×48, q seitlich 19.8 kg/m, + 10 kg an der Spitze
const EI = 11000*24*48**3/12, g=9.81/1000, L = worst.c;
const r = solve(0, L + 800, EI, [{x:L},{x:L+800}], [{a:0,b:L+800,q:19.8*g}], [{x:0,P:10*9.81}]);
const r0 = solve(0, L + 800, EI, [{x:L},{x:L+800}], [{a:0,b:L+800,q:19.8*g}], []);
console.log(`Auskragung ${L.toFixed(0)} mm: Spitze ${r0.w(0).toFixed(1)} mm (35 kg/m), mit 10 kg ${r.w(0).toFixed(1)} mm; Abheben am nächsten Auflager ${(r.R[1].R/9.81).toFixed(1)} kg`);
