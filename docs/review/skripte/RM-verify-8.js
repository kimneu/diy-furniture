const { K, BASE, bb } = require(__dirname + '/RM-verify-lib.js');
for (const [dl, db] of [[300,400],[400,400],[200,300]]) {
  const R = computeReduit({ ...BASE, build:'free', dLeft:dl, dRight:dl, dBack:db });
  const S = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.name==='Seite';}).map(bb);
  const back = S.filter(s=>s.z1 <= -700+db+1).sort((a,b)=>a.x0-b.x0);
  const firstIn = back[0].x1, secondIn = back[1].x0; // lichte Breite erstes hinteres Modul
  const sideL = S.filter(s=>s.z0 > -700+db && s.x0 < -700).sort((a,b)=>a.z0-b.z0)[0];
  const cov = Math.min(sideL.x1, secondIn) - firstIn;
  console.log('Seite',dl,'hinten',db,'| hint. Eckmodul licht', firstIn+800,'..',secondIn+800,'=',secondIn-firstIn,'| Seitenmodul-Seite x',sideL.x0+800,'..',sideL.x1+800,'z',sideL.z0+700,'..',sideL.z1+700,'| verdeckt',cov, (100*cov/(secondIn-firstIn)).toFixed(0)+'%');
}
// Wangen
const R = computeReduit({ ...BASE, sys:'cheeks' });
const Wg = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.name==='Wange';}).map(bb);
console.log(Wg.map(w=>'x'+(w.x0+800)+'..'+(w.x1+800)+' z'+(w.z0+700)+'..'+(w.z1+700)).join(' ; '));
const T = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.name==='Tablar' && bb(b).y0<200;}).map(bb);
console.log(T.map(w=>'x'+(w.x0+800)+'..'+(w.x1+800)+' z'+(w.z0+700)+'..'+(w.z1+700)).join(' ; '));
console.log(R.rows.filter(r=>r.name==='Tablar').map(r=>r.qty+'x '+r.L+'x'+r.B).join(', '), R.hw.map(h=>h[0]+' '+h[1]).join('; '));
