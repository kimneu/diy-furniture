const { RD, SB, dump, bb, E } = require('./DY-verify-lib.js');
console.log('=== DY-9');
for (const o of [{ sys:'battens' }, { sys:'posts', mat:'osb', t:18, price:29.95, sheetL:2770, sheetB:2070 }]) {
  const R = RD(o);
  console.log(o.sys, 'HW:', R.hw.map(h=>`${h[0]} × ${h[1]} | ${h[2]}`).join(' / '));
  console.log('  step Tablare:', R.steps.find(s=>s[0]==='Tablare auflegen')[1]);
  const L = R.rows.filter(r=>/Leiste|Latte/.test(r.name)).map(r=>`${r.qty}x ${r.name} ${r.L}×${r.B}×${r.t} ${r.note}`); console.log('  ', L.join(' / '));
}
console.log('=== DY-10');
const R7 = RD({ sys:'posts', mat:'osb', t:18, price:29.95, sheetL:2770, sheetB:2070 });
console.log(R7.hw.filter(h=>/Spreiz/.test(h[1])).map(h=>h.join(' | ')));
console.log('=== DY-11 drywall');
for (const sys of ['battens','rails','posts']) { const R = RD({ sys, wall:'drywall' }); console.log(sys, R.hw.filter(h=>/Hohlraum|Holzschraube|Blech/.test(h[1])).map(h=>`${h[0]} × ${h[1]} | ${h[2]}`).join(' / '), '| warn:', R.warn.filter(w=>/Gipskarton/.test(w)).join('')); }
console.log(RD({ sys:'battens', wall:'drywall' }).steps.filter(s=>/ausmessen|Leisten/.test(s[0])).map(s=>s[1]).join('\n'));
