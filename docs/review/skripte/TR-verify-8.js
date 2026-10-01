const { run } = require('./TR-verify-lib.js');
const q = 40*9.81/1000;
// Rayleigh-Ritz, gelenkig oben/unten, Normalkraft N(x) aus Einzellasten auf den Tablarhöhen
function lambdaCr(EI, L, loads){ // loads: [[y, P]]
  const n = 12, K = [], G = [];
  const N = x => loads.filter(([y]) => y >= x).reduce((a,[,P]) => a+P, 0);
  const m = 4000, dx = L/m;
  for (let j=1;j<=n;j++){ K.push(EI*(j*Math.PI/L)**4*L/2); const row=[]; for (let k=1;k<=n;k++){ let s=0; for (let i=0;i<m;i++){ const x=(i+0.5)*dx; s+=N(x)*(j*Math.PI/L)*(k*Math.PI/L)*Math.cos(j*Math.PI*x/L)*Math.cos(k*Math.PI*x/L)*dx; } row.push(s);} G.push(row); }
  let v = Array(n).fill(1), mu = 0;
  for (let it=0; it<300; it++){ const w = G.map(r => r.reduce((a,g,k)=>a+g*v[k],0)).map((x,j)=>x/K[j]); mu = Math.max(...w.map(Math.abs)); v = w.map(x=>x/mu); }
  return 1/mu; // Lastfaktor
}
for (const [lab, o, E, kd] of [
  ['Tür innen, MDF 19', {shape:'U',sys:'cheeks',doorIn:true,hinge:'L',rd:2000,mat:'mdf',t:19,sheetL:2800,sheetB:2070}, 3000, 2.25],
  ['Tür innen, Birke 18', {shape:'U',sys:'cheeks',doorIn:true,hinge:'L',rd:2000}, 9000, 0.8],
  ['Tür innen, Birke 12', {shape:'U',sys:'cheeks',doorIn:true,hinge:'L',rd:2000,t:12}, 9000, 0.8],
  ['Tür innen, OSB 18', {shape:'U',sys:'cheeks',doorIn:true,hinge:'L',rd:2000,mat:'osb',t:18,sheetL:2500,sheetB:1250}, 4930, 1.5],
]) {
  const R = run(o);
  const W = R.rows.filter(r=>r.name==='Wange'); const lw = R.boxes.filter(b=>b.key.startsWith('Wange') && b.pos[0] < -400);
  const zs = lw.map(b=>Math.round(b.pos[2])).sort((a,b)=>a-b);
  // Feld neben der Endwange (linke Seite, letztes Feld)
  const T = R.boxes.filter(b=>b.key.startsWith('Tablar') && b.pos[0] < -400);
  const lastBayL = Math.max(...T.map(b=>b.pos[2]+b.size[2]/2)) - Math.min(...T.filter(b=>b.pos[2] > zs[zs.length-2]).map(b=>b.pos[2]-b.size[2]/2));
  const t = o.t || 18, b = W.find(w=>w.B<=300)?.B || W[0].B, h = W[0].L;
  const EIlong = E/(1+kd) * b * t**3/12;
  const levels = shelfLevels(5,150,300,2400);
  const Pl = q * lastBayL / 2; // halbe Feldbreite pro Tablar
  const loads = levels.map(y => [y, Pl]);
  const lam = lambdaCr(EIlong, h, loads);
  const eulerTop = Math.PI**2*EIlong/h**2;
  console.log(`${lab}: Wangen links z = ${zs.join(', ')} (Vorderwand z=${R.D/2}); Wange ${h}×${b}×${t}; Feld ${Math.round(lastBayL)}; Last Endwange ${(5*Pl/1000).toFixed(2)} kN; Euler Einzellast oben (Dauer) ${(eulerTop/1000).toFixed(2)} kN; Lastfaktor mit Lasten auf Tablarhöhen ${lam.toFixed(2)}`);
}
console.log('Kippmass in der Ebene', Math.hypot(2390,400).toFixed(0), '/ über die Fläche', Math.hypot(2390,18).toFixed(1), '/ Raumdiagonale Boden 1600x1400', Math.hypot(1600,1400).toFixed(0));
const R = run({shape:'U',sys:'cheeks'}); console.log('Schritt:', R.steps.find(s=>/Wangen/.test(s[0]))[1]); console.log('hw:', R.hw.map(h=>h[0]+'× '+h[1]+' | '+h[2]).join(' ; '));
for (const r of R.rows) console.log('  ', r.qty, r.name, r.L,'x',r.B,'x',r.t,'|',r.note);
