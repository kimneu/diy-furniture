const { run, bb, nameOf, overlaps } = require('./EP_lib.js');
for (const sys of ['battens','rails','brackets','cheeks','posts']) {
  const R = run({ sys });
  const ov = overlaps(R).filter(o => /Eck/.test(o.a+o.b));
  const agg = new Map();
  for (const o of ov) { const k = o.a.split('|')[0]+' <> '+o.b.split('|')[0]+' ['+o.a.split('|')[1]+' / '+o.b.split('|')[1]+']'; const e = agg.get(k)||{n:0, ov:o.ov, A:o.A, B:o.B}; e.n++; agg.set(k,e); }
  console.log('==', sys, 'Kollisionen mit Eckteilen:', ov.length);
  for (const [k,e] of agg) console.log('  ', e.n, 'x', k, 'Überlappung xyz', e.ov.join(' × '), 'A', JSON.stringify(e.A), 'B', JSON.stringify(e.B));
}
