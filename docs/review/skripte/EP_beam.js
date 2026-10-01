// Durchlaufträger (Euler-Bernoulli), Knoten alle h mm. supports: [{x, k}] (k = Infinity: starr, sonst Feder N/mm).
// loads: q (N/mm, über [a,b]) und P (N bei x). Ergebnis: Auflagerkräfte, Durchbiegung an Punkten.
function solve(L0, L1, EI, supports, qs, Ps, h=2.5){
  const xs = new Set(); for (let x=L0; x<=L1+1e-9; x+=h) xs.add(+x.toFixed(3)); xs.add(L1);
  for (const s of supports) xs.add(s.x); for (const p of Ps) xs.add(p.x);
  const X = [...xs].sort((a,b)=>a-b), n = X.length, N = 2*n;
  const K = Array.from({length:N}, ()=>new Float64Array(N)), F = new Float64Array(N);
  for (let e=0;e<n-1;e++){
    const l = X[e+1]-X[e]; if (l<=0) continue;
    const k = EI/l**3, m = [[12,6*l,-12,6*l],[6*l,4*l*l,-6*l,2*l*l],[-12,-6*l,12,-6*l],[6*l,2*l*l,-6*l,4*l*l]];
    const d = [2*e,2*e+1,2*e+2,2*e+3];
    for (let i=0;i<4;i++) for (let j=0;j<4;j++) K[d[i]][d[j]] += k*m[i][j];
    const xm = (X[e]+X[e+1])/2; let q = 0; for (const Q of qs) if (xm>=Q.a && xm<=Q.b) q += Q.q;
    F[d[0]] -= q*l/2; F[d[1]] -= q*l*l/12; F[d[2]] -= q*l/2; F[d[3]] += q*l*l/12;
  }
  for (const p of Ps){ const i = X.indexOf(p.x); F[2*i] -= p.P; }
  const BIG = 1e14, sidx = [];
  for (const s of supports){ const i = X.indexOf(s.x); const k = s.k==null||!isFinite(s.k) ? BIG : s.k; K[2*i][2*i] += k; sidx.push({i,k}); }
  // Gauss
  const A = K.map(r=>Array.from(r)), b = Array.from(F);
  for (let c=0;c<N;c++){ let piv=c; for (let r=c+1;r<N;r++) if (Math.abs(A[r][c])>Math.abs(A[piv][c])) piv=r;
    [A[c],A[piv]]=[A[piv],A[c]]; [b[c],b[piv]]=[b[piv],b[c]];
    for (let r=c+1;r<N;r++){ const f=A[r][c]/A[c][c]; if (!f) continue; for (let k2=c;k2<N;k2++) A[r][k2]-=f*A[c][k2]; b[r]-=f*b[c]; } }
  const u = new Array(N).fill(0); for (let r=N-1;r>=0;r--){ let s=b[r]; for (let k2=r+1;k2<N;k2++) s-=A[r][k2]*u[k2]; u[r]=s/A[r][r]; }
  const R = supports.map((s,j)=>({ x:s.x, R: -sidx[j].k*u[2*sidx[j].i] }));
  const w = x => { let best=0; for (let i=0;i<n;i++) if (Math.abs(X[i]-x)<Math.abs(X[best]-x)) best=i; return u[2*best]; };
  const wmin = Math.min(...X.map((x,i)=>u[2*i]));
  return { R, w, wmin };
}
module.exports = { solve };
