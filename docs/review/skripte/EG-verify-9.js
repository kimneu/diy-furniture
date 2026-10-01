const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
for (const over of [{sys:'posts'},{sys:'posts',rd:1000},{sys:'posts',shape:'L',rw:1200,rd:1100},{sys:'posts',rd:1190},{sys:'posts',rd:1200}]) {
  const {R,bx,c}=run(over);
  const posts=bx.filter(b=>b.name.startsWith('Kantholz'));
  const ql=bx.filter(b=>b.note.startsWith('Querlatte') && b.y1===150);
  console.log(JSON.stringify(over),'Pfosten',posts.length, posts.map(p=>`x${r1(p.x0)}..${r1(p.x1)} z${r1(p.z0)}..${r1(p.z1)}`).join(' ; '));
  for (const q of ql) {
    const along = (q.x1-q.x0) > (q.z1-q.z0) ? 'x':'z';
    const on = posts.filter(p=> along==='x' ? (p.z1<=q.z0+0.1 && p.z1>=q.z0-0.1) : (Math.abs(p.x1-q.x0)<0.2||Math.abs(p.x0-q.x1)<0.2));
    const pos = on.map(p=> along==='x' ? [p.x0,p.x1] : [p.z0,p.z1]);
    const a0 = along==='x'?q.x0:q.z0, a1= along==='x'?q.x1:q.z1;
    const free0 = pos.length ? Math.min(...pos.map(p=>p[0]))-a0 : null, free1 = pos.length ? a1-Math.max(...pos.map(p=>p[1])) : null;
    console.log('   Querlatte', s(q).replace('Latte 24 × 48',''), 'L', r1(a1-a0), 'an Pfosten:', on.length, 'Kragarm', free0==null?'-':r1(free0), '/', free1==null?'-':r1(free1));
  }
  console.log('   screw70', R.hw.filter(h=>/5 × 70/.test(h[1])).map(h=>h[0]).join(), 'warn', R.warn);
}
// Biegung Kragarm Latte 24x48 hochkant
const E=11000, I=24*48**3/12, w=17.5*9.81/1000, L=500; console.log('Kragarm 500 Gleichlast 17.5 kg/m', r1(w*L**4/(8*E*I)*100)/100, 'mm; Einzellast 30 kg am Ende', r1(30*9.81*L**3/(3*E*I)*100)/100,'mm');
