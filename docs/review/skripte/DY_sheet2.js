const { K, CFG } = require('./DY_cfg.js');
for (const k of ['SB1','RD5']) {
  const R = K.computeData(CFG[k]);
  const g = R.groups[0];
  const items = []; for (const r of R.rows) if (r.group === g.label) for (let q=0;q<r.qty;q++) items.push(r);
  for (const [SL,SB,rot] of [[1500,2100,!CFG[k].grain],[1500,3000,false],[1500,3000,true]]) {
    const p = pack(items, SL, SB, 4, 10, rot);
    console.log(k, SL+'x'+SB, 'rotate', rot, 'sheets', p.sheets.length, 'unplaced', p.unplaced.map(u=>u.pos).join(','), 'whole m2', (p.sheets.length*SL*SB/1e6).toFixed(2), 'CHF', Math.round(p.sheets.length*SL*SB/1e6*88.95));
  }
}
