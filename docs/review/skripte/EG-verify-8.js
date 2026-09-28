const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
for (const [mat,ts] of Object.entries(MATS).map(([k,M])=>[k,M.t])) for (const t of ts) {
  const {R,bx,c}=run({sys:'battens',mat,t});
  const row=R.rows.find(r=>r.name==='Eckleiste'); if(!row) continue;
  const box=bx.find(b=>b.name==='Eckleiste');
  const th=row.t; const rest = th + c.t - 35;
  console.log(mat.padEnd(12), 't',c.t,'Eckleiste Liste',row.L,'x',row.B,'x',row.t,'| Box', box.size.map(r1).join('x'), '| Rest über Spitze', rest);
}
// Kollisionen Eckleiste battens
{ const {bx}=run({sys:'battens'}); const e=bx.filter(b=>b.name==='Eckleiste'); const L=bx.filter(b=>b.name==='Leiste'); let n=0,ex; for(const a of e) for(const b of L) if(hit(a,b)){n++;ex=[s(a),s(b),inter(a,b).map(r1)];} console.log('battens Eckleiste∩Leiste',n,ex);
  const sh=bx.filter(b=>b.name==='Tablar'&&b.y0===150); sh.forEach(b=>console.log('  ',s(b)));
  bx.filter(b=>b.y1===150 && b.name!=='Tablar').forEach(b=>console.log('   ',s(b),b.note));
}
// posts Eckleiste
{ const {bx}=run({sys:'posts'}); const e=bx.filter(b=>b.name==='Eckleiste'); const L=bx.filter(b=>b.name.startsWith('Latte')); let n=0,ex=[]; for(const a of e.slice(0,1)) for(const b of L) if(hit(a,b)){n++;ex.push([b.note,inter(a,b).map(r1)]);} console.log('posts Eckleiste∩Latten (erste)',n,ex); }
