const { K, BASE, bb } = require(__dirname + '/RM-verify-lib.js');
for (const k of ['fichtesp','dreischicht','birkesi','osb','schaltafel','dekorspan','seekiefer','birke','mdf']) if (MATS[k]) console.log(k, 'tDef', MATS[k].tDef, 't', MATS[k].t, MATS[k].boards?'boards':'');
for (const sys of ['battens','rails','brackets']) {
  for (const [mat,t] of [['birke',18],['birke',12],['seekiefer',15],['dekorspan',16]]) {
    const R = computeReduit({ ...BASE, sys, mat, t });
    const el = R.rows.find(r=>r.name==='Eckleiste');
    const s35 = R.hw.filter(h=>/4 × 35/.test(h[1])).map(h=>h[0]+' '+h[2]).join(', ');
    console.log(sys, mat, t, 'Eckleiste', el? el.B+'x'+el.t : '-', '| Spitze ueber Tablar bei Eckleiste', el? 35-el.t-t : '-', '| Blech 2mm:', 35-2-t, '|', s35);
  }
}
const R = computeReduit({ ...BASE, sys:'battens' });
const L = R.boxes.find(b=>{const r=R.rows.find(r=>r.key===b.key); return r.note.startsWith('Wandleiste');});
console.log('Wandleiste box', L.size, 'hoch', bb(L).y1-bb(L).y0);
console.log(R.steps.map((s,i)=>(i+1)+' '+s[0]+': '+s[1].slice(0,110)).join('\n'));
