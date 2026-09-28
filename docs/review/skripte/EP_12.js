// Wandschienen/Tablarwinkel-Ecke im Trägerrost: Tablare liegen nur auf Konsolen (Linienauflager senkrecht zur Wand).
const { Model } = require('./EP_grid.js');
const g=9.81, E=8500, G=620, rho=680, t=18, h=37, W=1600, D=1400, dB=400, dS=300;
function build(backU, backL, sideU, sideL, eck=true, pointKg=0){
  const m = new Model(); m.fixd=[]; const self = rho*t/1000*g/1e6;
  const back = m.plate('hinten', 3, W/2, 3, dB, Math.round((W/2-3)/h), Math.round((dB-3)/h), E, G, t, 35*g/1000/(dB-3)+self);
  const side = m.plate('seitlich', 3, dS, dB, D-3, Math.round((dS-3)/h), Math.round((D-3-dB)/h), E, G, t, 35*g/1000/(dS-3)+self);
  for (const u of backU) for (let j=0;j<=back.ny;j++){ const n = m.nearest(back, u, back.y0 + j*back.hy); if (m.nodes[n].y <= 12+backL) m.fix.push(n); }
  for (let j=0;j<=back.ny;j++) m.fixd.push(3*back.id[j][back.nx]+1);
  for (const u of sideU) for (let i=0;i<=side.nx;i++){ const n = m.nearest(side, side.x0 + i*side.hx, u); if (m.nodes[n].x <= 12+sideL) m.fix.push(n); }
  if (eck) for (let i=0;i<=side.nx;i++){ const ns=side.id[0][i]; m.ties.push([m.nearest(back, m.nodes[ns].x, dB), ns]); }
  if (pointKg) m.P.push({ n: side.id[0][side.nx], F: pointKg*g });
  m.solve();
  return { ecke: +m.w(side.id[0][side.nx]).toFixed(2), hintenMitteVorne: +m.w(back.id[back.ny][back.nx]).toFixed(2) };
}
console.log('Schienen (Konsolen hinten x=50/800 à 350, seitlich z=450/900/1350 à 250):', JSON.stringify(build([50, 800], 350, [450, 900, 1350], 250)), '+10 kg:', JSON.stringify(build([50, 800], 350, [450, 900, 1350], 250, true, 10)));
console.log('Winkel (hinten x=63/800 à 250, seitlich z=460/…):', JSON.stringify(build([63, 800], 250, [460, 928, 1337], 200)), '+10 kg:', JSON.stringify(build([63, 800], 250, [460, 928, 1337], 200, true, 10)));
