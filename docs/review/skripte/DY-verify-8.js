const { RD, SB, dump, bb, E } = require('./DY-verify-lib.js');
console.log('=== DY-16/17/18');
const Sd = SB({ mat:'dekorspan', t:'19' });
console.log('SB dekorspan step2:', Sd.steps[1][1]);
console.log('SB dekorspan finish:', Sd.finish.map(f=>f.join(' | ')).join(' // '));
let all=0, back=0; for (const r of Sd.rows) { const p = r.qty*2*(r.L+r.B)/1000; all+=p; if (r.kind==='back') back+=p; }
const g = n => Sd.rows.find(r=>r.name===n);
const S=g('Seite'), De=g('Deckel'), B=g('Boden'), M=g('Mittelwand'), Eb=g('Einlegeboden'), T=g('Tür');
const vis = 2*S.L + (De.L + 2*De.B) + B.L + (M?M.qty*M.L:0) + Eb.qty*Eb.L + T.qty*2*(T.L+T.B);
console.log('Umfang total', all.toFixed(1), 'Rückwand', back.toFixed(1), 'sichtbar', (vis/1000).toFixed(1), 'rows', Sd.rows.map(r=>`${r.qty}x${r.name} ${r.L}x${r.B}`).join(', '));
const Rd = RD({ mat:'dekorspan', t:19, price:27.5, sheetL:2800, sheetB:2070, sys:'battens' });
console.log('RD dekorspan eingebaut finish:', Rd.finish.map(f=>f.join(' | ')).join(' // '));
console.log('RD dekorspan steps:', Rd.steps.map((s,i)=>`${i+1}. ${s[0]}`).join(' / '));
console.log('RD dekorspan step3:', Rd.steps[2][1]);
const R5 = RD({ sys:'battens' }); console.log('RD5 last step:', R5.steps.length, R5.steps[R5.steps.length-1].join(' | '));
const Smdf = SB({ mat:'mdf', t:'19', front:'sliding', handle:'shell', color:'weiss', joint:'dowels' });
console.log('SB MDF steps:', Smdf.steps.map((s,i)=>`${i+1}. ${s[0]}`).join(' / '));
console.log('=== DY-19');
const Sk = SB({ mat:'mdf', t:'19', joint:'screws', top:'between' });
console.log(Sk.steps.find(s=>/Schraub/.test(s[0]))[1], '|', Sk.hw[0].join(' | '), '|', Sk.tools.join(' / '));
console.log('=== DY-25');
console.log('free level', RD({ build:'free', mat:'dekorspan', t:19, price:27.5 }).level, 'cheeks', RD({ sys:'cheeks' }).level, 'battens', RD({}).level, 'SB std', SB({}).level, 'SB dowels sliding', Smdf.level);
console.log('=== DY-26');
for (const o of [{ rh:2400, gapTop:100, dBack:600 }, { rh:1800, gapTop:100, dBack:600 }, {}]) {
  const R = RD({ build:'free', ...o });
  const sides = R.rows.filter(r=>r.name==='Seite');
  const back = R.boxes.filter(b=>b.key.startsWith('Seite')).map(b=>b.size);
  const rh = o.rh||2400;
  console.log(JSON.stringify(o), sides.map(r=>`${r.qty}x ${r.L}×${r.B} diag ${Math.hypot(r.L, r.B).toFixed(0)} vs rh ${rh}`).join(' / '), 'mods', R.modules, 'Einlegeboden/Deckel widths', [...new Set(R.rows.filter(r=>r.name==='Deckel').map(r=>r.L))], 'warn', R.warn.filter(w=>/Decke|aufricht|Kipp/.test(w)));
}
