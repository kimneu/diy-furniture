const { K, FORM, run, hard } = require('./MX_lib.js');
for (const [mat,t,sys] of [['birke',18,'rails'],['seekiefer',15,'rails'],['osb',12,'posts'],['fichtesp',12,'brackets'],['gon_fichte',18,'rails']]) {
  const R = run({ ...FORM, kind:'reduit', mat, t:String(t), shape:'U', build:'built', sys });
  const eck = R.rows.find(r => r.name === 'Eckleiste');
  const box = R.boxes.find(b => b.key === eck.key);
  const tab = R.rows.find(r => r.name === 'Tablar');
  const scr = R.hw.find(h => /4 × 35/.test(h[1]));
  const lh = box.size[1];  // Höhe der Eckleiste (y)
  console.log(`${mat} ${t} ${sys}: Eckleiste ${eck.qty}× ${eck.L}×${eck.B}×${eck.t} (${eck.kind}), Box-Höhe ${lh} mm | Tablar ${tab.t} mm | Schraube 35 mm → im Tablar ${35 - lh} mm, Rest bis Oberseite ${tab.t - (35 - lh)} mm | hw: ${scr ? scr[0] + '× ' + scr[1] + ' (' + scr[2] + ')' : '-'} | hart ${hard(R).length}`);
}
const R = run({ ...FORM, kind:'reduit', mat:'osb', t:'12', shape:'U', build:'built', sys:'posts' });
console.log(R.steps.find(s => /Eckst/.test(s[0])));
