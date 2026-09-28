// Auflagerkräfte je Linie, Standard-U Leisten (linke Hälfte: hinteres Tablar bis Raummitte + linkes Seitentablar), je Ebene
const { Model } = require('./EP_grid.js');
const g=9.81, E=8500, G=620, rho=680, t=18, h=37, W=1600, D=1400, dB=400, dS=300;
function run(post){
  const m = new Model(); m.fixd=[]; const self = rho*t/1000*g/1e6;
  const back = m.plate('hinten', 3, W/2, 3, dB, Math.round((W/2-3)/h), Math.round((dB-3)/h), E, G, t, 35*g/1000/(dB-3)+self);
  const side = m.plate('seitlich', 3, dS, dB, D-3, Math.round((dS-3)/h), Math.round((D-3-dB)/h), E, G, t, 35*g/1000/(dS-3)+self);
  const tag = new Map(); const fx = (n, k) => { m.fix.push(n); tag.set(n, k); };
  for (let i=0;i<=back.nx;i++) fx(back.id[0][i], 'Wandleiste hinten');
  for (let j=1;j<=back.ny;j++){ const n=back.id[j][0]; if (m.nodes[n].y<=dB-20) fx(n, 'Endleiste Seitenwand (hinteres Tablar)'); }
  for (let j=0;j<=back.ny;j++) m.fixd.push(3*back.id[j][back.nx]+1);
  for (let j=0;j<=side.ny;j++) fx(side.id[j][0], 'Wandleiste Seitenwand');
  for (let i=1;i<=side.nx;i++){ const n=side.id[side.ny][i]; if (m.nodes[n].x<=dS-20) fx(n, 'Endleiste Vorderwand'); }
  for (let i=0;i<=side.nx;i++){ const ns=side.id[0][i]; m.ties.push([m.nearest(back, m.nodes[ns].x, dB), ns]); }
  if (post) { fx(m.nearest(back, dS, dB), 'Eckpfosten'); }
  m.solve(); const R = m.reactions();
  const sums = {}; for (const [n,k] of tag) sums[k] = (sums[k]||0) + R.get(n)/g;
  const total = m.P.reduce((a,p)=>a+p.F,0)/g;
  return { total:+total.toFixed(1), ...Object.fromEntries(Object.entries(sums).map(([k,v])=>[k,+v.toFixed(1)])) };
}
console.log('heute (Eckleiste):', JSON.stringify(run(false)));
console.log('mit Eckpfosten   :', JSON.stringify(run(true)));
