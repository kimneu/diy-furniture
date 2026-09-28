const { run } = require('./TR_base.js');
const ov = (a, b) => [0,1,2].map(i => (a.size[i] + b.size[i]) / 2 - Math.abs(a.pos[i] - b.pos[i]));
const hit = (a, b) => ov(a, b).every(v => v > 0.5);
function check(o, A, B, label) {
  const R = run(o);
  const as = R.boxes.filter(b => b.key.startsWith(A)), bs = [...R.boxes, ...R.extras.filter(e=>e.type==='metal').map(e=>({...e,key:'METAL'}))].filter(b => b.key.startsWith(B));
  let n = 0, ex = null;
  for (const a of as) for (const b of bs) if (a !== b && hit(a, b)) { n++; if (!ex) ex = { a:a.key.split('|').slice(0,2).join('|'), apos:a.pos, asz:a.size, b:b.key.split('|').slice(0,2).join('|'), bpos:b.pos, bsz:b.size, ov:ov(a,b).map(Math.round) }; }
  console.log(label, '|', A, 'x', B, '→', n, 'Überschneidungen', ex ? JSON.stringify(ex) : '');
}
const U = { shape:'U', build:'built' };
check({ ...U, sys:'posts' }, 'Tablar', 'Kantholz', 'posts U');
check({ ...U, sys:'posts' }, 'Eckleiste', 'Latte', 'posts U');
check({ ...U, sys:'battens' }, 'Eckleiste', 'Leiste', 'battens U');
check({ ...U, sys:'rails' }, 'Tablar', 'METAL', 'rails U');
check({ ...U, sys:'brackets' }, 'Tablar', 'METAL', 'brackets U');
check({ ...U, sys:'rails', doorIn:true, hinge:'L' }, 'Tablar', 'Kantholz', 'rails U Tür innen');
check({ ...U, sys:'battens', mat:'gon_fichte', t:18, rw:2400 }, 'Tablar', 'Kantholz', 'battens gon 2400');
check({ ...U, sys:'posts', nicheL:true }, 'Tablar', 'Kantholz', 'posts U Nische');
// Positionen Pfosten, Querlatten an der Ecke
const R = run({ ...U, sys:'posts' });
for (const b of R.boxes.filter(b => b.key.startsWith('Kantholz'))) console.log('Pfosten pos', b.pos.map(Math.round), 'size', b.size);
const lvl = R.boxes.filter(b => b.key.includes('Querlatte') && Math.abs(b.pos[1] - (150-24)) < 1);
for (const b of lvl) console.log('Querlatte y150: x', Math.round(b.pos[0]-b.size[0]/2), '..', Math.round(b.pos[0]+b.size[0]/2), ' z', Math.round(b.pos[2]-b.size[2]/2), '..', Math.round(b.pos[2]+b.size[2]/2));
const el = R.boxes.filter(b => b.key.includes('Endlatte') && Math.abs(b.pos[1] - (150-24)) < 1);
for (const b of el) console.log('Endlatte y150: x', Math.round(b.pos[0]-b.size[0]/2), '..', Math.round(b.pos[0]+b.size[0]/2), ' z', Math.round(b.pos[2]-b.size[2]/2), '..', Math.round(b.pos[2]+b.size[2]/2));
