const { RD, SB, dump } = require('./DY-verify-lib.js');
console.log('=== DY-2 Exzenter/Dübel');
for (const [mat,t] of [['birke',12],['seekiefer',15],['seekiefer',12],['birke',18]]) {
  const R = SB({ mat, t:String(t), joint:'cam' });
  console.log(mat,t,'cam hw:', R.hw.filter(h=>/Exzenter/.test(h[1])).map(h=>h.join(' | ')), 'warn t?', R.warn.filter(w=>/Exzenter|Stärke/.test(w)));
  console.log('  step:', R.steps.find(s=>/Exzenter/.test(s[0]))[1].slice(0,200));
}
const Rd = SB({ mat:'birke', t:'12', joint:'dowels' });
console.log('dowels 12:', Rd.hw.filter(h=>/Dübel/.test(h[1])).map(h=>h.join(' | ')), Rd.steps.find(s=>/Dübel/.test(s[0]))[1]);
const Rr = RD({ mat:'birke', t:12, price:63.95, build:'free', joint:'cam' });
console.log('Reduit free birke 12 cam:', Rr.hw.filter(h=>/Exzenter/.test(h[1])).map(h=>h.join(' | ')), 'warn:', Rr.warn.filter(w=>/Exzenter/.test(w)));
console.log('=== DY-3 Winkel');
for (const o of [{ sys:'brackets' }, { sys:'brackets', mat:'osb', t:12, price:19.95, sheetL:2770, sheetB:2070 }, { sys:'rails' }]) {
  const R = RD(o);
  console.log(o.sys, o.mat||'birke', o.t||18, R.hw.filter(h=>/4 × 35/.test(h[1])).map(h=>h.join(' | ')), 'Eckleisten rows:', R.rows.filter(r=>r.name==='Eckleiste').reduce((a,r)=>a+r.qty,0));
  const m = R.extras.filter(e=>e.type==='metal'); console.log('  metal sizes sample', JSON.stringify(m.slice(0,2).map(e=>e.size)));
}
console.log('=== DY-4 Eckleiste');
const { bb, ov } = require('./DY-verify-lib.js');
for (const o of [{ sys:'battens' }, { sys:'battens', mat:'birke', t:12, price:63.95 }, { sys:'posts' }]) {
  const R = RD(o);
  const eck = R.boxes.filter(b=>b.key.startsWith('Eckleiste')), others = R.boxes.filter(b=>/^(Leiste|Latte)/.test(b.key));
  let n=0, ex=null; for (const e of eck) for (const l of others) { const o2=ov(e,l); if (o2.every(x=>x>0.5)) { n++; ex = ex || [l.key.split('|').slice(0,2).join(' '), o2.map(Math.round)]; } }
  const er = R.rows.find(r=>r.name==='Eckleiste');
  console.log(o.sys, o.t||18, 'Eckleiste', er.L, 'x', er.B, 'x', er.t, er.note, '| collisions', n, JSON.stringify(ex), '| Eindringung 4x35 ins Tablar', 35 - er.t, 'Rest', (o.t||18) - (35-er.t));
}
