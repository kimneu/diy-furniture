// Leisten-Ecke (U, linke Hälfte, Symmetrie in Raummitte). Welt: x ab linker Wand, z ab Rückwand. Platte y-Achse = z.
const { Model } = require('./EP_grid.js');
const g=9.81, E=8500, G=620, rho=680;
function corner(o){
  const { W=1600, dB=400, dS=300, D=1400, t=18, qkg=35, pointKg=0, variant='heute', runs='back', frontBeam=false } = o;
  const m = new Model(); m.fixd=[];
  const self = rho*t/1000*g/1e6; // N/mm²
  const h = 37;
  let back, side;
  if (runs==='back'){
    // hinteres Tablar x 3..W/2 (Symmetrie), z 3..dB; seitliches x 3..dS, z dB..D-3
    const bx = Math.round((W/2-3)/h), bz = Math.round((dB-3)/h);
    back = m.plate('hinten', 3, W/2, 3, dB, bx, bz, E, G, t, qkg*g/1000/(dB-3)+self);
    side = m.plate('seitlich', 3, dS, dB, D-3, Math.round((dS-3)/h), Math.round((D-3-dB)/h), E, G, t, qkg*g/1000/(dS-3)+self);
    for (let i=0;i<=back.nx;i++) m.fix.push(back.id[0][i]);                                   // Wandleiste hinten
    for (let j=0;j<=back.ny;j++) if (back.nodes===undefined) { const n=back.id[j][0]; if (m.nodes[n].y>=18 && m.nodes[n].y<=dB-20) m.fix.push(n); } // Endleiste Seitenwand
    for (let j=0;j<=back.ny;j++) m.fixd.push(3*back.id[j][back.nx]+1);                          // Symmetrie sx=0
    for (let j=0;j<=side.ny;j++) m.fix.push(side.id[j][0]);                                    // Wandleiste Seitenwand
    for (let i=0;i<=side.nx;i++){ const n=side.id[side.ny][i]; if (m.nodes[n].x>=18 && m.nodes[n].x<=dS-20) m.fix.push(n); } // Endleiste Vorderwand
    if (variant!=='ohne') for (let i=0;i<=side.nx;i++){ const ns=side.id[0][i]; const nb=m.nearest(back, m.nodes[ns].x, dB); m.ties.push([nb, ns]); } // Eckleiste
    if (variant==='pfosten'){ for (const n of [side.id[0][side.nx], side.id[1][side.nx], m.nearest(back, dS, dB)]) m.fix.push(n); }
    if (frontBeam){ for (let i=0;i<back.nx;i++) m.el.push({a:back.id[back.ny][i], b:back.id[back.ny][i+1], dir:'x', l:back.hx, EI:11000*24*48**3/12, GJ:0}); }
    if (pointKg) m.P.push({ n: side.id[0][side.nx], F: pointKg*g });
  } else {
    // Seiten laufen durch: seitlich x 3..dS, z 3..D-3; hinten x dS..W/2, z 3..dB
    side = m.plate('seitlich', 3, dS, 3, D-3, Math.round((dS-3)/h), Math.round((D-6)/h), E, G, t, qkg*g/1000/(dS-3)+self);
    back = m.plate('hinten', dS, W/2, 3, dB, Math.round((W/2-dS)/h), Math.round((dB-3)/h), E, G, t, qkg*g/1000/(dB-3)+self);
    for (let j=0;j<=side.ny;j++) m.fix.push(side.id[j][0]);
    for (let i=0;i<=side.nx;i++){ const n=side.id[0][i]; if (m.nodes[n].x>=18 && m.nodes[n].x<=dS-20) m.fix.push(n); } // Endleiste Rückwand
    for (let i=0;i<=side.nx;i++){ const n=side.id[side.ny][i]; if (m.nodes[n].x>=18 && m.nodes[n].x<=dS-20) m.fix.push(n); } // Endleiste Vorderwand
    for (let i=0;i<=back.nx;i++) m.fix.push(back.id[0][i]);
    for (let j=0;j<=back.ny;j++) m.fixd.push(3*back.id[j][back.nx]+1);
    for (let j=0;j<=back.ny;j++){ const nb=back.id[j][0]; const ns=m.nearest(side, dS, m.nodes[nb].y); m.ties.push([ns, nb]); } // Eckleiste
    if (pointKg) m.P.push({ n: back.id[back.ny][0], F: pointKg*g });
  }
  m.solve();
  const R = m.reactions();
  const sum = f => { let s=0; for (const [n,v] of R) if (f(m.nodes[n], n)) s+=v; return s; };
  const kg = N => +(N/g).toFixed(1);
  const fixedSet = new Set(m.fix);
  const loadSide = m.P.filter(p=>m.nodes[p.n].plate==='seitlich').reduce((a,p)=>a+p.F,0);
  const reactSide = sum((nd,n)=>nd.plate==='seitlich' && fixedSet.has(n));
  const wAt = (P, x, y) => +m.w(m.nearest(P, x, y)).toFixed(2);
  const out = {
    w_innenecke: runs==='back' ? wAt(side, dS, dB) : wAt(back, dS, dB),
    w_hinten_vorne_mitte: wAt(back, W/2, dB),
    w_seite_vorne_mitte: runs==='back' ? wAt(side, dS, (dB+D)/2) : wAt(side, dS, D/2),
    last_seite_kg: kg(loadSide), auflager_seite_kg: kg(reactSide), eckleiste_kg: kg(loadSide-reactSide),
  };
  return out;
}
const cases1 = [["300/400 back",{dB:300,dS:400}],["300/400 side",{dB:300,dS:400,runs:"side"}],["400/400 back",{dB:400,dS:400}],["400/400 side",{dB:400,dS:400,runs:"side"}],["400/500 back",{dB:400,dS:500}],["400/500 side",{dB:400,dS:500,runs:"side"}],["400/300 back pfosten",{variant:"pfosten"}],["L-Ersatz: W 1600 dB400 dS300 back",{}]];
const cases0 = [
  ['Standard U, Leisten, Eckleiste (heute)', {}],
  ['… ohne Eckleiste', { variant:'ohne' }],
  ['… mit Eckpfosten an der Innenecke', { variant:'pfosten' }],
  ['… Vorderkantenlatte 24×48 unter hinterem Tablar', { frontBeam:true }],
  ['… heute + 10 kg in der Innenecke', { pointKg:10 }],
  ['… Pfosten + 10 kg in der Innenecke', { variant:'pfosten', pointKg:10 }],
  ['dB 200 / Seiten 600, B 2000: hinten durch (heute)', { W:2000, dB:200, dS:600 }],
  ['dB 200 / Seiten 600, B 2000: Seiten durch', { W:2000, dB:200, dS:600, runs:'side' }],
  ['dB 600 / Seiten 200, B 1600: hinten durch (heute)', { W:1600, dB:600, dS:200 }],
  ['dB 600 / Seiten 200, B 1600: Seiten durch', { W:1600, dB:600, dS:200, runs:'side' }],
];
for (const [n, o] of cases1){ const t0=Date.now(); const r = corner(o); console.log(n.padEnd(52), JSON.stringify(r), ((Date.now()-t0)/1000).toFixed(1)+'s'); }
