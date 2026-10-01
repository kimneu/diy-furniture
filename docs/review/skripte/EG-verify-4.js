const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
// EG-5: cheeks + free: Eckfach verdeckt
for (const over of [{sys:'cheeks'},{sys:'cheeks',mat:'gon_fichte'},{build:'free'},{build:'free',mat:'gon_fichte'},{sys:'cheeks',nShelves:6},{sys:'cheeks',nShelves:8}]) {
  const {R,bx,c}=run(over);
  const y=R.steps; 
  const lv = shelfLevels(c.nShelves,c.gapBottom,c.gapTop,c.rh);
  const t=c.t||R.t;
  // back shelves at lowest level with x0 near left wall
  const backSh = bx.filter(b=>['Tablar','Einlegeboden','Boden'].includes(b.name) && b.z1<=-299 && b.x0 < -700).sort((a,b)=>a.y0-b.y0);
  const sideFirst = bx.filter(b=>['Wange','Seite'].includes(b.name) && b.z0>=-305 && b.z0 < -270 && b.x0<-700);
  const sh=backSh[0], sc=sideFirst[0];
  console.log(JSON.stringify(over),'levels',lv.join(','), 'clear', r1(lv[1]-lv[0]-R.t));
  console.log('  back corner shelf', s(sh), 'len', r1(sh.x1-sh.x0), 'depth', r1(sh.z1-sh.z0));
  console.log('  side first cheek', s(sc), 'covers', r1(sc.x1 - sh.x0), 'open', r1(sh.x1 - sc.x1));
}
