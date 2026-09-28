const { K, FORM, run, hard } = require('./MX_lib.js');
const RF = { ...FORM, kind:'reduit', build:'free' };
for (const [mat,t,joint,back] of [['dreischicht',19,'pocket','none'],['osb',12,'cam','hdf3'],['seekiefer',12,'dowels','hdf3'],['dekorspan',19,'screws','hdf3'],['fichtesp',12,'screws','none']]) {
  const R = run({ ...RF, mat, t:String(t), joint, back, shape:'U' });
  const side = R.rows.filter(r => r.name === 'Seite').map(r => `${r.qty}× ${r.L}×${r.B}×${r.t}`).join(', ');
  console.log(`\n${mat} ${t} ${joint} ${back}: Module ${R.modules}, Seiten ${side}`);
  console.log('  alle Warnungen:', R.warn.map(w => w.slice(0,100)));
  console.log('  hart:', hard(R).length, '| hw:', R.hw.slice(0,2).map(h => `${h[0]}× ${h[1]} (${h[2]})`).join(' | '), '| Winkel:', (R.hw.find(h => /Winkelverbinder/.test(h[1]))||[])[0]);
  console.log('  Schritte:', R.steps.map(s => s[0]).join(' > '));
}
// Wangen 12 mm
for (const [mat,t] of [['seekiefer',12],['osb',12],['fichtesp',12],['seekiefer',15]]) {
  const R = run({ ...FORM, kind:'reduit', build:'built', sys:'cheeks', mat, t:String(t), shape:'U' });
  const w = R.rows.filter(r => r.name === 'Wange').map(r => `${r.qty}× ${r.L}×${r.B}×${r.t}`).join(', ');
  console.log(`\nWangen ${mat} ${t}: ${w} | hart ${hard(R).length} | Schritt:`, (R.steps.find(s => /Wangen/.test(s[0]))||[])[1]);
}
