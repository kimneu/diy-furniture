const { RD, SB, dump, bb } = require('./DY-verify-lib.js');
console.log('=== DY-5 free Lochreihen');
const R8 = RD({ mat:'dekorspan', t:19, price:27.5, sheetL:2800, sheetB:2070, build:'free', joint:'pocket' });
console.log(R8.steps.map((s,i)=>`${i+1}. ${s[0]}`).join(' / '));
console.log(R8.hw.map(h=>`${h[0]} × ${h[1]}`).join(' / '));
console.log('Seiten:', R8.rows.filter(r=>r.name==='Seite').map(r=>`${r.qty}x ${r.L}×${r.B} ${r.note}`).join(' / '), 'modules', R8.modules, 'level', R8.level);
const eb = R8.rows.filter(r=>/boden|Deckel/.test(r.name)).map(r=>`${r.qty}x ${r.name} ${r.L}×${r.B}`); console.log(eb.join(' / '));
console.log('Tools:', R8.tools.join(' / '));
console.log('Finish:', R8.finish.map(f=>f.join(' | ')).join(' // '));
// module widths
const sides = R8.boxes.filter(b=>b.key.startsWith('Seite')).map(b=>bb(b).map(r=>r.map(Math.round).join('..')).join(' / '));
console.log('Seiten-Boxen:'); sides.forEach(s=>console.log('  ', s));
console.log('=== DY-6 Sideboard Kippschutz');
const Rh = SB({ w:'1200', h:'1300', d:'400', base:'plinth', baseH:'80' });
console.log('warn', Rh.warn.filter(w=>/kipp/i.test(w)), 'hw', Rh.hw.filter(h=>/Kipp/.test(h[1])).map(h=>h.join(' | ')), 'steps', Rh.steps.map(s=>s[0]).join(' / '));
console.log('=== DY-7 Füsse/Sockel');
for (const [mat,t] of [['birke','12'],['seekiefer','15'],['birke','18']]) {
  const R = SB({ mat, t, base:'legs' }); const Rp = SB({ mat, t, base:'plinth', baseH:'80' });
  console.log(mat,t, R.hw.filter(h=>/4 × 16/.test(h[1])).map(h=>h.join(' | ')), '| Tipp:', R.steps.find(s=>/Füsse/.test(s[0]))[2], '| Sockel:', Rp.hw.filter(h=>/4 × 16/.test(h[1])).map(h=>h.join(' | ')));
}
