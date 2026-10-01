const { K, BASE, run } = require('./RM_lib.js');
const show = (o) => { const R = run(o); const n = normReduit({ ...BASE, ...o }).cfg; const lv = shelfLevels(n.nShelves, n.gapBottom, n.gapTop, n.rh);
  const gaps = lv.slice(1).map((y,i)=>y - lv[i] - R.t);
  console.log(JSON.stringify(o), '→ levels', lv.join('/'), 'lichte Fachhöhe min', gaps.length? Math.min(...gaps):'-', 'oberstes Tablar OK', lv[lv.length-1]+R.t, 'Luft bis Decke', n.rh - lv[lv.length-1] - R.t, '| warn:', R.warn.filter(w=>!/liegen vorne frei|Spannweite|zwei Stücke/.test(w)));
};
show({ shape:'I', rh:1800, nShelves:8, gapBottom:600, gapTop:800 });
show({ shape:'I', rh:2400, nShelves:8, gapBottom:300, gapTop:700 });
show({ shape:'I', rh:3000, nShelves:5, gapBottom:150, gapTop:300 });
show({ shape:'I', rh:2400, nShelves:5, gapBottom:150, gapTop:100 });
show({ shape:'I', rd:1000, dBack:600 });
show({ shape:'I', rd:900, dBack:600 });
show({ shape:'U', rw:1600, dLeft:600, dRight:600 });
show({ shape:'U', rw:1000, dLeft:300, dRight:300 });
// Wangen: Höhe und Kippmass
for (const [rh, d] of [[2400,400],[2400,300],[2400,200],[2600,400]]) {
  const R = run({ shape:'I', sys:'cheeks', rh, dBack:d });
  const w = R.rows.find(r=>r.name==='Wange');
  console.log('Wange rh', rh, 'Tiefe', d, 'L', w.L, 'B', w.B, 'Kippmass in Wangenebene', Math.round(Math.hypot(w.L, w.B)), 'Luft Decke', rh - w.L, 'oberstes Tablar OK', Math.max(...shelfLevels(5,150,300,rh))+18);
}
