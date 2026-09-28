const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
function pen(over, A, B){
  const {R,bx,mt}=run(over);
  const all=[...bx,...mt];
  const res=[];
  for (const a of all) if (A(a)) for (const b of all) if (b!==a && B(b) && hit(a,b)) res.push([s(a), s(b), inter(a,b).map(r1)]);
  return res;
}
const isPost=b=>b.name.startsWith('Kantholz'), isShelf=b=>b.name==='Tablar';
for (const over of [{sys:'posts'},{sys:'posts',shape:'I'},{sys:'posts',shape:'L'},{sys:'battens',doorIn:true},{sys:'rails',doorIn:true},{sys:'brackets',nicheL:true},{sys:'posts',mat:'regalbau'}]) {
  const r=pen(over,isPost,isShelf);
  console.log(JSON.stringify(over),'Pfosten∩Tablar:',r.length, r[0]);
}
// Anleitung posts
const {R}=run({sys:'posts'});
R.steps.forEach((x,i)=>console.log(i,x[0],'::',x[1]));
console.log(R.tools);
console.log(R.rows.filter(r=>r.name==='Tablar').map(r=>[r.qty,r.L,r.B,r.note]));
