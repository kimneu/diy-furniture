const {run,r1}=require('./EG-verify-lib.js');
const {R,c}=run({sys:'cheeks'});
const w=R.rows.filter(r=>r.name==='Wange'); console.log(w.map(r=>[r.qty,r.L,r.B,r.t]));
const top=Math.max(...shelfLevels(c.nShelves,c.gapBottom,c.gapTop,c.rh))+18; console.log('oberstes Tablar OK', top, 'über OK', 2390-top);
const width=w.reduce((a,r)=>a+r.qty*r.B,0); console.log('Fläche über 2170', r1((2390-2170)*width/1e6*100)/100, 'm²', 'CHF', r1((2390-2170)*width/1e6*88.95));
for (const B of [400,300]) console.log('Diagonale', B, r1(Math.hypot(2390,B)*10)/10, 'Dicke', r1(Math.hypot(2390,18)*10)/10);
console.log('Fuss bei Türhöhe 2000 (ohne Dicke):', r1(Math.sqrt(2390**2-2000**2)), '| Wange 2168:', r1(Math.sqrt(2168**2-2000**2)));
console.log('Raumdiagonale 1000x1200 ab Türmitte', r1(Math.hypot(500,1200)), '1600x1400', r1(Math.hypot(800,1400)));
