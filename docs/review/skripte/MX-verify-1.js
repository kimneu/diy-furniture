const { K, sb, rd, hard } = require('./MX-verify-lib.js');
console.log('Stärken:', Object.fromEntries(Object.entries(MATS).map(([k,M])=>[k,M.t])));
for (const [mat,t,joint] of [['seekiefer',12,'cam'],['osb',12,'dowels'],['fichtesp',24,'cam'],['birke',12,'dowels'],['birke',12,'cam'],['seekiefer',15,'cam'],['seekiefer',12,'screws'],['seekiefer',12,'pocket']]) {
  const { R } = sb({ mat, t:String(t), joint, shelves:'1' });
  console.log(`\nSB ${mat} ${t} ${joint}: hard=${JSON.stringify(hard(R))}`);
  console.log('  hw:', R.hw.slice(0,2).map(h=>h.slice(0,3).join(' | ')));
  for (const s of R.steps) if (/tief|Exzenter|Bohr/.test(s[1])) console.log('  step:', s[0], '::', s[1].slice(0,260));
}
// Reduit free
for (const [mat,t,joint] of [['osb',12,'cam'],['seekiefer',12,'dowels']]) {
  const { R } = rd({ mat, t:String(t), joint, build:'free' });
  console.log(`\nRD free ${mat} ${t} ${joint}: warn=${JSON.stringify(R.warn)}`);
  console.log('  rows:', R.rows.filter(r=>r.name==='Seite').map(r=>`${r.qty}× ${r.L}×${r.B}×${r.t}`));
  console.log('  hw:', R.hw.slice(0,2).map(h=>h.slice(0,3).join(' | ')));
  console.log('  steps:', R.steps.map(s=>s[0]).join(' > '));
}
for (const mat of ['seekiefer','osb','fichtesp']) {
  const { R } = rd({ mat, t:'12', sys:'cheeks' });
  console.log(`\nRD cheeks ${mat} 12: warn=${JSON.stringify(R.warn)}`);
  console.log('  rows:', R.rows.filter(r=>r.name==='Wange').map(r=>`${r.qty}× ${r.L}×${r.B}×${r.t}`));
  const s = R.steps.find(s=>/Lochreihen/.test(s[0])); console.log('  step:', s && s[1]);
}
