const { K, BASE, bb, collisions } = require('./RM-verify-lib.js');
for (const sys of ['posts','battens','rails','brackets']) {
  const R = computeReduit({ ...BASE, sys });
  const c = collisions(R, (a,b)=> !(a.startsWith('Tablar')&&b.startsWith('Kantholz')) && !(b.startsWith('Tablar')&&a.startsWith('Kantholz')));
  const uniq = new Map(); for (const x of c) { const k=x[0].split('|')[0]+' × '+x[1].split('|')[0]+' '+x[2].join('×'); uniq.set(k,(uniq.get(k)||0)+1); }
  console.log(sys, [...uniq].map(([k,n])=>n+'× '+k).join(' ; '));
}
// posts U: Pfostenpositionen und Querlatten
const R = computeReduit({ ...BASE, sys:'posts' });
const W=1600,D=1400;
for (const b of R.boxes) { const r=R.rows.find(r=>r.key===b.key); if (r.name.startsWith('Kantholz')) { const B=bb(b); console.log('Pfosten x', B.x0+W/2, '..', B.x1+W/2, ' z', B.z0+D/2,'..',B.z1+D/2); } }
const ql = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.note.startsWith('Querlatte') && b.pos[1]<200;});
for (const b of ql){ const B=bb(b); console.log('Querlatte x', B.x0+W/2,'..',B.x1+W/2,' z',B.z0+D/2,'..',B.z1+D/2); }
const el = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.name==='Eckleiste' && b.pos[1]<200;});
for (const b of el){ const B=bb(b); console.log('Eckleiste x', B.x0+W/2,'..',B.x1+W/2,' z',B.z0+D/2,'..',B.z1+D/2, 'y', B.y0, B.y1); }
const en = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.note.startsWith('Endlatte') && b.pos[1]<200;});
for (const b of en){ const B=bb(b); console.log('Endlatte x', B.x0+W/2,'..',B.x1+W/2,' z',B.z0+D/2,'..',B.z1+D/2); }
console.log(R.warn);
console.log(R.hw.map(h=>h.slice(0,3).join(' | ')).join('\n'));
