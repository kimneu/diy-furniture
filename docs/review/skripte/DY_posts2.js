const { K, FORM } = require('./DY_cfg.js');
const bb = b => [0,1,2].map(i => [b.pos[i]-b.size[i]/2, b.pos[i]+b.size[i]/2]);
const ov = (a,b) => bb(a).map((r,i)=>Math.min(r[1],bb(b)[i][1]) - Math.max(r[0],bb(b)[i][0]));
for (const [lbl, d] of [['battens gon 2400 Stosspfosten', { ...FORM, kind:'reduit', mat:'gon_fichte', sys:'battens', rw:'2400' }], ['battens birke Tür innen', { ...FORM, kind:'reduit', mat:'birke', sys:'battens', doorIn:true, hinge:'L', rd:'2000' }], ['rails birke Tür innen', { ...FORM, kind:'reduit', mat:'birke', sys:'rails', doorIn:true, hinge:'L', rd:'2000' }]]) {
  const R = K.computeData(K.withCatalog(d));
  const posts = R.boxes.filter(b=>b.key.startsWith('Kantholz')), shelves = R.boxes.filter(b=>b.key.startsWith('Tablar'));
  let n=0; for (const p of posts) for (const s of shelves) if (ov(p,s).every(x=>x>0.5)) n++;
  console.log(lbl, ': Stützen', posts.length, 'Durchdringungen', n, R.rows.filter(r=>/Kantholz/.test(r.name)).map(r=>r.qty+'× '+r.L+' '+r.note));
}
