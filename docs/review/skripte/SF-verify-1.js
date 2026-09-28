const { K, FORM, seeded, sb } = require('./SF-verify-lib.js');
console.log('MATS t:', Object.fromEntries(Object.entries(MATS).map(([k,M])=>[k,M.t])));
for (const [mat,t] of [['birke',12],['birke',18],['birke',21],['mdf',19],['mdf',22],['fichtesp',24],['dreischicht',27],['eiche',27],['fichte',27]]) {
  const { d, R } = sb({ mat, t:String(t), w:'1600', sections:'2' });
  const doors = R.doors.map(x => [r0(x.cx - x.dw/2 *1), x.dw]);
  const d0 = R.doors[0], dl = R.doors[R.doors.length-1];
  const outerOv = (d0.cx - d0.dw/2) - (-R.W/2); // gap from outer edge
  const sideInner = -R.W/2 + R.t;
  const ovOuter = sideInner - (d0.cx - d0.dw/2);
  // middle wall: find door right edge nearest to 0
  let ovMid = null;
  const divs = R.boxes.filter(b => /Mittelwand/.test(b.key));
  for (const dv of divs) { const face = dv.pos[0] - R.t/2; for (const dr of R.doors) { const re = dr.cx + dr.dw/2; if (Math.abs(re - face) < R.t) ovMid = re - face; } }
  console.log(mat, t, 'tf', R.tf, 'doors', R.doors.length, 'dw', R.doors.map(x=>x.dw).join('/'), 'Aufschlag aussen', ovOuter.toFixed(1), 'Mittelwand', ovMid && ovMid.toFixed(1), 'warn', R.warn.filter(w=>/Scharn|Aufschlag|Tür/.test(w)));
  console.log('  hw', R.hw.filter(h=>/Topf/.test(h[1])).map(h=>h.join(' | ')));
}
// Zufall: Drehtür + t
const rnd = seeded(42); const cnt = {};
let hingedN = 0;
for (let i = 0; i < 1000; i++) { const d = K.zufall({ ...FORM }, rnd); if (d.front !== 'hinged') continue; hingedN++; const k = d.mat+' '+d.t; cnt[k] = (cnt[k]||0)+1; }
console.log('hinged', hingedN, cnt);
