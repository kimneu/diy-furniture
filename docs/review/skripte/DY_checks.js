const { K, E, CFG, FORM } = require('./DY_cfg.js');
const wc = d => K.withCatalog(d);
const show = (lbl, R, re) => { console.log('\n##', lbl); R.hw.filter(h => !re || re.test(h[1])).forEach(h => console.log('  hw', h[0], '×', h[1], '|', h[2])); };
// 1 Füsse / Sockel bei 12 mm
let R = K.computeData(wc({ ...FORM, mat:'birke', t:'12' }));
show('SB birke 12 legs', R, /Fuss|füsse|4 × 16/i); console.log('  tip', R.steps.find(s=>s[0]==='Füsse montieren')[2]);
R = K.computeData(wc({ ...FORM, mat:'birke', t:'12', base:'plinth', baseH:'80' }));
show('SB birke 12 plinth', R, /Sockel|Stahlwinkel|4 × 40/);
// 2 Exzenter 12 / 15
for (const [m,t] of [['birke','12'],['seekiefer','15'],['seekiefer','12']]) {
  R = K.computeData(wc({ ...FORM, mat:m, t, joint:'cam' }));
  show(`SB ${m} ${t} cam`, R, /Exzenter|Dübel/); console.log('  warn', R.warn); console.log('  step', R.steps.find(s=>/Exzenter/.test(s[0]))[1]);
}
// 3 Dübel 12
R = K.computeData(wc({ ...FORM, mat:'birke', t:'12', joint:'dowels' }));
show('SB birke 12 dowels', R, /Dübel/); console.log('  step', R.steps.find(s=>/Dübel/.test(s[0]))[1]);
// 4 Reduit frei cam 12
R = K.computeData(wc({ ...FORM, kind:'reduit', build:'free', mat:'birke', t:'12', joint:'cam' }));
show('RD free birke 12 cam', R, /Exzenter|Dübel/); console.log('  warn', R.warn); console.log('  steps', R.steps.map(s=>s[0]).join(' / '));
// 7 Kantenband Reduit dekorspan eingebaut + frei
for (const b of ['built','free']) { R = K.computeData(wc({ ...FORM, kind:'reduit', build:b, mat:'dekorspan', t:'19' })); console.log('\n## RD dekorspan', b, 'finish', JSON.stringify(R.finish)); }
R = K.computeData(wc({ ...FORM, mat:'dekorspan', t:'19' })); console.log('## SB dekorspan finish', JSON.stringify(R.finish)); console.log('  step2', R.steps[1][1]);
// 8 Eckleiste-Schrauben pro Stärke (Platten)
for (const [m,t] of [['birke','12'],['seekiefer','15'],['mdf','16'],['birke','18'],['mdf','19'],['birke','21']]) {
  R = K.computeData(wc({ ...FORM, kind:'reduit', mat:m, t, sys:'battens' }));
  const ek = R.rows.find(r=>r.name==='Eckleiste'); const sc = R.hw.find(h=>/4 × 35/.test(h[1]));
  console.log(`Eckleiste ${m} ${t}: Leiste ${ek.t} mm + Tablar ${t} mm, Schraube 35 → Eindringtiefe ins Tablar ${35-ek.t} mm, Rest ${t-(35-ek.t)} mm; hw ${sc && sc[0]} ${sc && sc[2]}`);
}
