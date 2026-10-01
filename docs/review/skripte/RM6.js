const { K, BASE, run } = require('./RM_lib.js');
const rng = b => ({ x:[b.pos[0]-b.size[0]/2, b.pos[0]+b.size[0]/2], y:[b.pos[1]-b.size[1]/2, b.pos[1]+b.size[1]/2], z:[b.pos[2]-b.size[2]/2, b.pos[2]+b.size[2]/2] });
const ov = (a,b) => Math.min(a[1],b[1]) - Math.max(a[0],b[0]);
for (const sys of ['posts','battens','rails','brackets']) {
  const R = run({ shape:'U', sys });
  const named = R.boxes.map(b => ({ b, r: R.rows.find(r=>r.key===b.key) }));
  const all = [...named.map(n=>({ name:n.r.name+' ('+n.r.note.slice(0,28)+')', ...rng(n.b) })), ...R.extras.filter(e=>e.type==='metal').map(e=>({ name:'Metall', ...rng(e) }))];
  let hits = [];
  for (let i=0;i<all.length;i++) for (let j=i+1;j<all.length;j++) {
    const a = all[i], b = all[j];
    const o = [ov(a.x,b.x), ov(a.y,b.y), ov(a.z,b.z)];
    if (o.every(v => v > 1)) hits.push(`${a.name} × ${b.name}: ${o.map(Math.round).join(' × ')} mm`);
  }
  const uniq = [...new Set(hits)];
  console.log(sys, 'Überschneidungen:', uniq.length); uniq.slice(0,6).forEach(h=>console.log('  ', h));
  const posts = named.filter(n=>n.r.name.startsWith('Kantholz'));
  if (posts.length) console.log('  Pfosten x/z:', posts.map(n=>{const g=rng(n.b); return `[x ${g.x.map(Math.round)} z ${g.z.map(Math.round)}]`}).join(' '));
}
