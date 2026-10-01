const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
for (const mat of ['gon_fichte','moebel_weiss','regalbau','birke']) for (const back of ['hdf3','none']) {
  const {R,bx,c}=run({build:'free',mat,back});
  const Bk = BACKS[back];
  const seite = R.rows.filter(r=>r.name==='Seite'); const boden=R.rows.filter(r=>/Boden|Deckel/.test(r.name));
  // hinteres Modul: Seiten mit z1 = -300 (Front bei seg.depth)
  const backSide = bx.find(b=>b.name==='Seite' && Math.abs(b.z1-(-300))<0.5 && b.x0<-700);
  const sideFirst = bx.find(b=>b.name==='Seite' && b.z0>-305 && b.z0<-290 && b.x0<-700);
  const Bl = seite.map(r=>r.B); const listDep = Math.max(...R.rows.filter(r=>r.name==='Seite' && r.L>1000).map(r=>r.B));
  const bt = Bk? Bk.t : 0;
  const frontIfWall10 = 10 + listDep + bt, frontIfWall0 = listDep + bt;
  console.log(mat.padEnd(12), back, 'Seiten Liste B', [...new Set(Bl)].join('/'), 'gezeichnet', r1(backSide.z1-backSide.z0), '| Böden B', [...new Set(boden.map(r=>r.B))].join('/'),
   '| Front hinteres Modul bei 10 mm Wandabstand:', frontIfWall10, 'an Wand:', frontIfWall0, '| Seitenmodul ab', r1(sideFirst.z0 + c.rd/2), '→', frontIfWall10 - (sideFirst.z0 + c.rd/2), '/', frontIfWall0 - (sideFirst.z0 + c.rd/2));
}
// eingebaut Bretter
for (const sys of ['battens','cheeks','posts']) { const {R,bx}=run({sys,mat:'gon_fichte'}); const r=R.rows.filter(r=>r.name==='Tablar'); const b=bx.filter(b=>b.name==='Tablar' && b.z1<=-299)[0]; console.log('eingebaut',sys, r.map(x=>x.qty+'× '+x.L+'×'+x.B).join(', '), '| hinten gezeichnet Tiefe', r1(b.z1-b.z0)); }
// Rückwand-Überlappung (EG-15)
{ const {R,bx}=run({build:'free'}); const rw=bx.filter(b=>b.name==='Rückwand'), se=bx.filter(b=>b.name==='Seite'); let n=0,ex; for(const a of rw) for(const b of se) if(hit(a,b)){n++;ex=inter(a,b).map(r1);} console.log('Rückwand∩Seite', n, ex);
  console.log(R.rows.filter(r=>/Rückwand|Boden|Deckel|Seite/.test(r.name)).map(r=>[r.qty,r.name,r.L,r.B,r.t,r.note]));
  console.log(R.steps.filter(x=>/Module|Rückw/.test(x[0])).map(x=>x[0]+': '+x[1]));
}
