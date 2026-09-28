const { K, FORM, sb, rd, hard } = require('./MX-verify-lib.js');
for (const [mat,t] of [['birke','18'],['eiche','18'],['dreischicht','19'],['osb','18'],['seekiefer','12'],['gon_fichte','18']]) {
  const { R } = rd({ mat, t, sys:'battens' });
  const strips = R.rows.filter(r=>r.name==='Leiste'||r.name==='Eckleiste');
  const len = strips.reduce((a,r)=>a+r.qty*r.L,0)/1000;
  const pr = MATS[mat].boards ? null : matPrice(MATS[mat], Number(t));
  console.log(mat, t, 'Leisten+Eckleisten m=', len.toFixed(1), pr ? 'CHF Streifen 40mm=' + (len*0.04*pr).toFixed(2) : '', 'Dachlatte=', (len*1.2).toFixed(2), 'rows:', strips.map(r=>`${r.qty}×${r.name} ${r.L}×${r.B}×${r.t}`).join('; '));
  // bearing: Leiste box depth vs shelf v0
  const lb = R.boxes.filter(b=>b.key.startsWith('Leiste|'));
  console.log('   Leiste box sizes (erste 2):', JSON.stringify(lb.slice(0,2).map(b=>b.size)), ' Auflage hinten = t-3 =', Number(t)-3);
  console.log('   screws:', JSON.stringify(R.hw.filter(h=>/Schraube|Dübel/.test(h[1])).map(h=>h[0]+'× '+h[1]+' – '+h[2])));
}
{ const { R } = rd({ mat:'birke', t:'18', sys:'battens', shape:'I', rw:'800', rd:'1200', doorW:'600' }); console.log('I 800', JSON.stringify(R.hw.map(h=>h[0]+'× '+h[1]))); }
