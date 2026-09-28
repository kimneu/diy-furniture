const { K, CFG } = require('./DY_cfg.js');
const R = K.computeData(CFG.RD8);
const sides = R.boxes.filter(b => b.key.startsWith('Seite|'));
for (const b of sides) console.log(b.key.split('|').slice(0,3).join(' '), 'x', (b.pos[0]-b.size[0]/2).toFixed(0), '..', (b.pos[0]+b.size[0]/2).toFixed(0), 'z', (b.pos[2]-b.size[2]/2).toFixed(0), '..', (b.pos[2]+b.size[2]/2).toFixed(0), 'h', b.size[1]);
console.log('W', R.W, 'D', R.D, 'modules', R.modules);
// Kippmass: Diagonale Seite (Höhe x Tiefe) vs Raumhöhe, Randfälle
for (const [rh, gt, dB, rd] of [[2400,300,400,1400],[2400,100,600,1400],[1800,100,600,1400],[2000,100,500,1400]]) {
  const R2 = K.computeData(K.withCatalog({ ...CFG.RD8, rh:String(rh), gapTop:String(gt), dBack:String(dB), rd:String(rd) }));
  const s = R2.rows.filter(r=>r.name==='Seite').sort((a,b)=>b.B-a.B)[0];
  console.log(`rh ${rh} gapTop ${gt} dBack ${dB}: Seite ${s.L}×${s.B}, Diagonale ${Math.hypot(s.L, s.B).toFixed(0)} mm vs Raumhöhe ${rh}`);
}
