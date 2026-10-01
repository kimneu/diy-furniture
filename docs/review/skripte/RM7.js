const { K, BASE, run } = require('./RM_lib.js');
const rng = b => ({ x:[b.pos[0]-b.size[0]/2, b.pos[0]+b.size[0]/2], y:[b.pos[1]-b.size[1]/2, b.pos[1]+b.size[1]/2], z:[b.pos[2]-b.size[2]/2, b.pos[2]+b.size[2]/2] });
const ov = (a,b) => Math.min(a[1],b[1]) - Math.max(a[0],b[0]);
for (const o of [{shape:'U'}, {shape:'I', rw:1600}, {shape:'U', doorIn:true, hinge:'L'}, {shape:'U', nicheL:true}]) {
  const R = run({ sys:'posts', ...o });
  const named = R.boxes.map(b => ({ b, r: R.rows.find(r=>r.key===b.key) }));
  const shelves = named.filter(n=>n.r.name==='Tablar'), posts = named.filter(n=>n.r.name.startsWith('Kantholz'));
  let n = 0; for (const s of shelves) for (const p of posts) { const a=rng(s.b), b=rng(p.b); if ([ov(a.x,b.x),ov(a.y,b.y),ov(a.z,b.z)].every(v=>v>1)) n++; }
  console.log(JSON.stringify(o), 'Tablare', shelves.length, 'Pfosten', posts.length, 'Tablar-Pfosten-Durchdringungen', n, 'Notizen:', [...new Set(named.filter(x=>x.r.name==='Tablar').map(x=>x.r.note))], '| Pfostennotiz', [...new Set(posts.map(p=>p.r.note))]);
}
const R = run({ sys:'posts', shape:'U' });
console.log(R.steps.find(s=>/Pfosten/.test(s[0])));
console.log(R.steps.find(s=>/auflegen/.test(s[0])));
