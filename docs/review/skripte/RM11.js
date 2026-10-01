const { K, BASE, run } = require('./RM_lib.js');
const rng = b => ({ x:[b.pos[0]-b.size[0]/2, b.pos[0]+b.size[0]/2], y:[b.pos[1]-b.size[1]/2, b.pos[1]+b.size[1]/2], z:[b.pos[2]-b.size[2]/2, b.pos[2]+b.size[2]/2] });
const ov = (a,b) => Math.min(a[1],b[1]) - Math.max(a[0],b[0]);
for (const sys of ['battens','rails','brackets']) for (const o of [{doorIn:true, hinge:'L'}, {nicheL:true}]) {
  const R = run({ shape:'U', sys, ...o });
  const named = R.boxes.map(b => ({ b, r: R.rows.find(r=>r.key===b.key) }));
  const shelves = named.filter(n=>n.r.name==='Tablar'), posts = named.filter(n=>n.r.name.startsWith('Kantholz'));
  let n = 0, dims = new Set(); for (const s of shelves) for (const p of posts) { const a=rng(s.b), b=rng(p.b); const d=[ov(a.x,b.x),ov(a.y,b.y),ov(a.z,b.z)]; if (d.every(v=>v>1)) { n++; dims.add(d.map(Math.round).join('×')); } }
  console.log(sys, JSON.stringify(o), 'Stützen', posts.length, 'Durchdringungen Tablar/Stütze', n, [...dims].join(' '), '| Angle40:', R.hw.filter(h=>/Winkelverb/.test(h[1])).map(h=>h[0]).join());
}
// Schrauben 4x35 durch Eckleiste (Stärke = Tablarstärke) bzw. Metall 2 mm
for (const [mat,t] of [['birke',12],['seekiefer',15],['mdf',16],['dekorspan',16],['birke',18],['mdf',19],['birke',21]]) {
  const R = run({ shape:'U', sys:'battens', mat, t });
  const e = R.rows.find(r=>r.name==='Eckleiste');
  console.log(mat, t, 'Eckleiste', e && `${e.B}×${e.t}`, '→ Schraube 35 ragt', 35 - e.t - t, 'mm über Tablaroberseite; auf Konsole/Winkel (2 mm):', 35 - 2 - t, 'mm');
}
