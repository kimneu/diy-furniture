const { run, bb, nameOf, overlaps } = require('./EP_lib.js');
const R = run({ sys:'posts' });
const posts = R.boxes.filter(b => /Kantholz/.test(b.key));
console.log('Pfosten:', posts.length);
for (const b of posts) console.log('  ', JSON.stringify(bb(b,R)));
const ov = overlaps(R).filter(o => /Kantholz/.test(o.a+o.b));
const agg = new Map();
for (const o of ov) { const k = o.a.split('|')[0]+' <> '+o.b.split('|')[0]; const e = agg.get(k)||{n:0, ov:o.ov}; e.n++; agg.set(k,e); }
for (const [k,e] of agg) console.log('  ', e.n, 'x', k, 'Überlappung', e.ov.join(' × '));
// Querlatten/Latten im Eckbereich links
for (const b of R.boxes) { const q = bb(b,R); if (q.lo[1] > 100 && q.hi[1] <= 170 && q.lo[0] < 320 && q.lo[2] < 450) console.log('Ecke L1:', nameOf(R,b), JSON.stringify(q)); }
