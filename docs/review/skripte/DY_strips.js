const { K, CFG } = require('./DY_cfg.js');
for (const k of ['RD5','RD7']) {
  const R = K.computeData(CFG[k]);
  const st = R.rows.filter(r => r.kind==='korpus' && r.B===40);
  const n = st.reduce((a,r)=>a+r.qty,0), m = st.reduce((a,r)=>a+r.qty*r.L,0)/1000, a = st.reduce((x,r)=>x+r.qty*r.L*r.B,0)/1e6;
  const parts = R.rows.filter(r=>r.kind!=='solid').reduce((a,r)=>a+r.qty,0);
  console.log(k, R.M.name, R.t, 'Streifen 40 mm:', n, 'von', parts, 'Plattenteilen,', m.toFixed(1), 'm,', a.toFixed(2), 'm² × CHF', R.groups[0].price, '= CHF', (a*R.groups[0].price).toFixed(0), '| als Dachlatte 24×48: CHF', (m*1.2).toFixed(0));
}
