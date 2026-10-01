const { run, bb, nameOf, overlaps } = require('./EP_lib.js');
// H2: Eckleiste bei ganzen Brettern: Liste vs. 3D
for (const mat of ['gon_fichte','regalbau','schaltafel']) {
  const R = run({ mat, t:MATS[mat].tDef, sys:'battens' });
  const row = R.rows.find(r => r.name==='Eckleiste'); const box = R.boxes.find(b => b.key===row.key+'' || b.key.startsWith('Eckleiste'));
  const q = bb(box, R);
  console.log(mat, 'Liste:', row.L,'×',row.B,'×',row.t, row.note, '| 3D:', (q.hi[0]-q.lo[0]).toFixed(0),'×',(q.hi[1]-q.lo[1]).toFixed(0),'×',(q.hi[2]-q.lo[2]).toFixed(0), '(x × y × z)');
}
// Stösse in der Eckzone des hinteren Tablars (x < dSide bzw. x > W - dSide) und kurze Stücke
const hits = [];
for (const mat of Object.keys(MATS).filter(k => MATS[k].boards)) for (const sys of ['battens','rails','brackets','posts']) for (const shape of ['L','U'])
 for (const rw of [1200,1600,2000,2400,2800,3200,3600,4000]) for (const rd of [1400, 2000, 2600, 3200]) for (const [dB, dS] of [[400,300],[300,400],[200,600],[600,200],[400,400]]) {
  const R = run({ mat, t:MATS[mat].tDef, sys, shape, rw, rd, dBack:dB, dLeft:dS, dRight:dS });
  const stoss = R.boxes.filter(b => b.key.startsWith('Stossleiste')).map(b => bb(b, R));
  const eck = R.boxes.filter(b => b.key.startsWith('Eckleiste')).map(b => bb(b, R));
  // hintere Stossleisten: z-Ausdehnung lang (entlang Tiefe), liegen im hinteren Bereich z < dBack
  for (const s of stoss) {
    if (s.lo[2] < R.D && s.hi[2] <= (R.boxes[0] ? 9999 : 0)) {}
    const alongZ = (s.hi[2]-s.lo[2]) > (s.hi[0]-s.lo[0]);
    if (!alongZ) continue;               // hintere Stossleisten laufen in z
    const x = (s.lo[0]+s.hi[0])/2;
    const dSide = R.rows.find(r=>r.name==='Eckleiste') ? dS : 0;
    if (dSide && (x < dSide + 50 || x > R.W - dSide - 50) && s.hi[2] < 700) hits.push(`${mat} ${sys} ${shape} ${rw}x${rd} d${dB}/${dS}: Stoss hinten bei x=${x.toFixed(0)} (Seitentiefe ${dS})`);
  }
}
console.log('Stösse hinten in der Eckzone:', hits.length); console.log(hits.slice(0,15).join('\n'));
