const { K, BASE, run } = require('./RM_lib.js');
// Tür nach innen: Schwenkbereich gegen hinteres Regal
for (const o of [ {shape:'I', rd:1000, dBack:400}, {shape:'I', rd:1100, dBack:400}, {shape:'U', rd:1000, dBack:400}, {shape:'L', corner:'R', rd:900, dBack:500, hinge:'L'}, {shape:'I', rd:900, dBack:600} ]) {
  const R = run({ ...o, doorIn:true, doorW:800, sys:'battens' });
  const frei = R.D - Math.max(...R.boxes.filter(b=>b.pos[2]-b.size[2]/2 < -R.D/2+5).map(b=>b.pos[2]+b.size[2]/2)) ;
  const vorn = R.D/2; const backFront = -R.D/2 + (o.dBack);
  const clear = vorn - backFront;
  const ang = clear >= 800 ? 90 : Math.asin(clear/800)*180/Math.PI;
  console.log(JSON.stringify(o), 'frei vor hinterem Regal', clear, 'mm, Tür 800 geht auf bis ca.', ang.toFixed(0)+'°', 'Warnungen:', R.warn.filter(w=>/Tür/.test(w)));
}
// H5: Bandseite, Tiefe vs wf
for (const o of [ {rw:1600, dLeft:300}, {rw:1600, dLeft:250}, {rw:1800, dLeft:250}, {rw:2000, dLeft:300} ]) {
  const n = normReduit({ ...BASE, shape:'U', doorIn:true, hinge:'L', doorW:800, ...o });
  const l = layoutReduit(n.cfg);
  const L = l.segs.find(s=>s.id==='left');
  console.log(JSON.stringify(o), 'wf', l.wf, 'Seitenregal links u', L && [L.u0, L.u1], 'ends', L && L.ends, 'verlorene Länge', L ? 1400 - L.u1 : 'ganz', 'Platz Wand–offenes Türblatt (wf) minus Drücker ~65/Luft ~15 =', l.wf - 80);
}
