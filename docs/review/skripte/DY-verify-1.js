const { RD, bb, ov, dump } = require('./DY-verify-lib.js');
for (const [lbl, o] of [['OSB18 U posts', { mat:'osb', t:18, price:29.95, sheetL:2770, sheetB:2070, sys:'posts' }],
  ['Birke18 U posts', { sys:'posts' }],
  ['go/on 2400 battens', { mat:'gon_fichte', t:18, rw:2400, sys:'battens', shape:'I' }],
  ['birke battens doorIn', { sys:'battens', doorIn:true }],
  ['birke rails doorIn', { sys:'rails', doorIn:true }]]) {
  const R = RD(o);
  const posts = R.boxes.filter(b=>b.key.startsWith('Kantholz')), shelves = R.boxes.filter(b=>b.key.startsWith('Tablar'));
  let n=0, ex=null;
  for (const p of posts) for (const s of shelves) { const o2 = ov(p,s); if (o2.every(x=>x>0.5)) { n++; if(!ex) ex=[bb(p).map(r=>r.map(Math.round).join('..')), bb(s).map(r=>r.map(Math.round).join('..')), o2.map(Math.round)]; } }
  console.log(lbl, 'posts', posts.length, 'shelves', shelves.length, 'Durchdringungen', n, JSON.stringify(ex));
  console.log('  Tablar notes', [...new Set(R.rows.filter(r=>r.name==='Tablar').map(r=>r.note))].join(' / '));
  console.log('  Kantholz rows', R.rows.filter(r=>r.name.startsWith('Kantholz')).map(r=>`${r.qty}x ${r.L} ${r.note}`).join(' / '));
  console.log('  Stichsäge?', R.tools.some(t=>/Stichs/.test(t)), 'Steps:', R.steps.map(s=>s[0]).join(' / '));
}
