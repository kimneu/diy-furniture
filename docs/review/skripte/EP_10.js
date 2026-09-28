const { run, bb } = require('./EP_lib.js');
const agg = new Map();
for (const mat of Object.keys(MATS).filter(k => MATS[k].boards)) for (const sys of ['battens','rails','brackets','posts']) for (const shape of ['L','U'])
 for (const rw of [1200,1600,2000,2400,2800,3200,3600,4000]) for (const rd of [1400, 2000, 2600, 3200]) for (const [dB, dS] of [[400,300],[300,400],[200,600],[600,200],[400,400]]) {
  const R = run({ mat, t:MATS[mat].tDef, sys, shape, rw, rd, dBack:dB, dLeft:dS, dRight:dS });
  if (!R.rows.some(r=>r.name==='Eckleiste')) continue;
  const eck = R.boxes.filter(b => b.key.startsWith('Eckleiste')).map(b => bb(b, R));
  const dSide = eck.length ? Math.max(...eck.map(e => Math.min(e.hi[0], R.W - e.lo[0]))) : 0; // tatsächliche Seitentiefe
  const dBack = eck.length ? (eck[0].lo[2]+eck[0].hi[2])/2 : 0;
  for (const b of R.boxes.filter(b => b.key.startsWith('Stossleiste'))) {
    const s = bb(b, R); if ((s.hi[2]-s.lo[2]) < (s.hi[0]-s.lo[0])) continue; if (s.lo[2] > dBack) continue;
    const x = (s.lo[0]+s.hi[0])/2, dist = Math.min(Math.abs(x - dSide), Math.abs(R.W - dSide - x));
    const inZone = x < dSide || x > R.W - dSide;
    if (dist <= 100 || inZone) { const k = `${mat} ${sys}`; const e = agg.get(k) || { n:0, ex:[] }; e.n++; if (e.ex.length<2) e.ex.push(`${shape} ${rw}x${rd} d${dB}/${dS}→${dSide}: Stoss x=${x.toFixed(0)}${inZone?' (in Eckzone)':''}`); agg.set(k,e); }
  }
}
for (const [k,e] of agg) console.log(k.padEnd(24), e.n, e.ex.join(' | '));
