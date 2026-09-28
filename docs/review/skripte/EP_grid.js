// Trägerrost (Grillage) für Platten: Knoten-DOF w, sx=∂w/∂x, sy=∂w/∂y. Mehrere Platten, Kopplungen (gleiche w), starre Auflager.
function Model(){ this.nodes=[]; this.plates=[]; this.el=[]; this.fix=[]; this.ties=[]; this.P=[]; }
Model.prototype.plate = function(name, x0, x1, y0, y1, nx, ny, E, G, t, q){
  const P = { name, x0, x1, y0, y1, nx, ny, id:[] , q};
  const hx = (x1-x0)/nx, hy = (y1-y0)/ny;
  for (let j=0;j<=ny;j++){ P.id[j]=[]; for (let i=0;i<=nx;i++){ P.id[j][i]=this.nodes.length; this.nodes.push({x:x0+i*hx, y:y0+j*hy, plate:name}); } }
  const D = E*t**3/12, GJ = G*t**3/6;
  for (let j=0;j<=ny;j++) for (let i=0;i<nx;i++){ const b = (j===0||j===ny) ? hy/2 : hy; this.el.push({a:P.id[j][i], b:P.id[j][i+1], dir:'x', l:hx, EI:D*b, GJ:GJ*b}); }
  for (let i=0;i<=nx;i++) for (let j=0;j<ny;j++){ const b = (i===0||i===nx) ? hx/2 : hx; this.el.push({a:P.id[j][i], b:P.id[j+1][i], dir:'y', l:hy, EI:D*b, GJ:GJ*b}); }
  // Flächenlast q (N/mm²) auf Knoten
  for (let j=0;j<=ny;j++) for (let i=0;i<=nx;i++){ const ax = (i===0||i===nx)?hx/2:hx, ay=(j===0||j===ny)?hy/2:hy; this.P.push({n:P.id[j][i], F:q*ax*ay}); }
  P.hx=hx; P.hy=hy; this.plates.push(P); return P;
};
Model.prototype.nearest = function(P, x, y){ const i = Math.round((x-P.x0)/P.hx), j = Math.round((y-P.y0)/P.hy); return P.id[Math.max(0,Math.min(P.ny,j))][Math.max(0,Math.min(P.nx,i))]; };
Model.prototype.solve = function(){
  const n = this.nodes.length, N = 3*n;
  // Kopplungen: Knoten b wird für w auf Knoten a abgebildet (Master-Slave)
  const map = new Int32Array(N); for (let i=0;i<N;i++) map[i]=i;
  for (const [a,b] of this.ties) map[3*b] = map[3*a];
  const fixed = new Set([...this.fix.map(k=>map[3*k]), ...(this.fixd||[]).map(i=>map[i])]);
  // Freiheitsgrade durchnummerieren
  const idx = new Int32Array(N).fill(-1); let m=0;
  for (let i=0;i<N;i++){ const r = map[i]; if (r!==i) continue; if (fixed.has(r)) continue; idx[i]=m++; }
  const dof = i => idx[map[i]];
  const K = Array.from({length:m}, ()=>new Float64Array(m)), F = new Float64Array(m);
  const add = (i,j,v)=>{ const a=dof(i), b=dof(j); if (a<0||b<0) return; K[a][b]+=v; };
  for (const e of this.el){
    const l=e.l, k=e.EI/l**3, mb=[[12,6*l,-12,6*l],[6*l,4*l*l,-6*l,2*l*l],[-12,-6*l,12,-6*l],[6*l,2*l*l,-6*l,4*l*l]];
    const s = e.dir==='x'?1:2, tt = e.dir==='x'?2:1;
    const d=[3*e.a,3*e.a+s,3*e.b,3*e.b+s];
    for (let i=0;i<4;i++) for (let j=0;j<4;j++) add(d[i],d[j],k*mb[i][j]);
    const kt=e.GJ/l, dt=[3*e.a+tt,3*e.b+tt];
    add(dt[0],dt[0],kt); add(dt[1],dt[1],kt); add(dt[0],dt[1],-kt); add(dt[1],dt[0],-kt);
  }
  for (const p of this.P){ const a=dof(3*p.n); if (a>=0) F[a]-=p.F; }
  // Gauss (dicht)
  const A=K, b=F;
  for (let c=0;c<m;c++){ const piv=A[c][c]; const rc=A[c];
    for (let r=c+1;r<m;r++){ const f=A[r][c]/piv; if (!f) continue; const rr=A[r]; for (let k2=c;k2<m;k2++) rr[k2]-=f*rc[k2]; b[r]-=f*b[c]; } }
  const u=new Float64Array(m); for (let r=m-1;r>=0;r--){ let s=b[r]; const ar=A[r]; for (let k2=r+1;k2<m;k2++) s-=ar[k2]*u[k2]; u[r]=s/ar[r]; }
  this.u = i => { const a=dof(i); return a<0?0:u[a]; };
  this.w = nid => this.u(3*nid);
  // Auflagerkräfte = Summe der Elementkräfte + Last am festen Knoten (über Gleichgewicht: R = K_full u - F)
  return this;
};
// Reaktion an festen Knoten: aus Elementen berechnen
Model.prototype.reactions = function(){
  const R = new Map();
  const u = i => this.u(i);
  const addR = (node, v) => R.set(node, (R.get(node)||0)+v);
  for (const e of this.el){
    const l=e.l, k=e.EI/l**3, s=e.dir==='x'?1:2;
    const d=[u(3*e.a),u(3*e.a+s),u(3*e.b),u(3*e.b+s)];
    const Fa = k*(12*d[0]+6*l*d[1]-12*d[2]+6*l*d[3]), Fb = k*(-12*d[0]-6*l*d[1]+12*d[2]-6*l*d[3]);
    addR(e.a, Fa); addR(e.b, Fb);
  }
  for (const p of this.P) addR(p.n, p.F);
  return R; // an freien Knoten ~0, an festen = Auflagerkraft (N, nach oben positiv)
};
module.exports = { Model };
