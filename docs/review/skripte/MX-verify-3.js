const { K, sb, rd, hard } = require('./MX-verify-lib.js');
for (const [mat,t,sys] of [['birke','18','brackets'],['birke','18','battens'],['seekiefer','15','battens'],['osb','12','posts'],['fichtesp','12','brackets'],['birke','18','rails'],['gon_fichte','18','battens'],['eiche','27','brackets']]) {
  const { R } = rd({ mat, t, sys });
  const eck = R.rows.filter(r=>r.name==='Eckleiste').map(r=>`${r.qty}× ${r.L}×${r.B}×${r.t} (${r.group})`);
  const scr = R.hw.filter(h=>/4 × 35/.test(h[1])).map(h=>h[0]+'× '+h[2]);
  // Winkel/Leiste thickness from boxes
  const eckBox = R.boxes.filter(b=>b.key && b.key.startsWith('Eckleiste|')).slice(0,1).map(b=>b.size);
  const winkel = R.extras.filter(e=>e.type==='metal').slice(0,2).map(e=>e.size);
  console.log(`${mat} ${t} ${sys}: Eckleisten=${JSON.stringify(eck)} eckBox=${JSON.stringify(eckBox)} screw35=${JSON.stringify(scr)} metal=${JSON.stringify(winkel)}`);
  const legT = sys==='brackets'?4: sys==='rails'?0:null;
  const lT = R.rows.find(r=>r.name==='Eckleiste');
  if (lT) console.log(`   Eckleiste: 35 - ${lT.t} - ${t} = ${35 - lT.t - Number(t)} (neg = Rest bis Oberfläche)`);
  if (sys==='brackets') console.log(`   Winkel: 35 - 4 - ${t} = ${35-4-Number(t)} mm Überstand (Modell-Schenkel 4 mm)`);
  const st = R.steps.find(s=>s[0]==='Tablare auflegen'); console.log('   step:', st && st[1]);
}
