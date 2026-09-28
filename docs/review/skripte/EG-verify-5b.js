// Grundriss-Bewegungsplanung: Rechteck L x d (Grundriss) ins verdeckte Eckfach
// Hindernisse: Seitenwange x[-800,cheekX] z[-300,-282]; Rueckwand z<-700; Seitenwand x<-800; linke Fachwange x[-800,-779] z[-700,-300]; rechte Fachwange x[rx, rx+18] z[-700,-300]
function solve(L, d, cheekX, rx){
  const X0=-800, X1=400, Z0=-700, Z1=400, S=4, NA=360, DA=Math.PI/NA; // alpha 0..180 step 0.5
  const NX=Math.round((X1-X0)/S)+1, NZ=Math.round((Z1-Z0)/S)+1;
  const obs=[[-1e4,-800,-1e4,1e4],[-1e4,1e4,-1e4,-700],[-800,cheekX,-300,-282],[-800,-779,-700,-300],[rx,rx+18,-700,-300]];
  const cosA=new Float64Array(NA), sinA=new Float64Array(NA);
  for(let a=0;a<NA;a++){cosA[a]=Math.cos(a*DA);sinA[a]=Math.sin(a*DA);}
  function free(x,z,a){
    const c=cosA[a], s=sinA[a], hl=L/2, hd=d/2;
    // rect axes u=(c,s), w=(-s,c)
    const ex=Math.abs(c)*hl+Math.abs(s)*hd, ez=Math.abs(s)*hl+Math.abs(c)*hd;
    for(const [ox0,ox1,oz0,oz1] of obs){
      if (x+ex<=ox0||x-ex>=ox1||z+ez<=oz0||z-ez>=oz1) continue;
      // SAT on rect axes
      const cx=(ox0+ox1)/2, cz=(oz0+oz1)/2, hx=(ox1-ox0)/2, hz=(oz1-oz0)/2;
      const dx=cx-x, dz=cz-z;
      const pu=Math.abs(dx*c+dz*s), ru=hx*Math.abs(c)+hz*Math.abs(s);
      if (pu>=hl+ru) continue;
      const pw=Math.abs(-dx*s+dz*c), rw=hx*Math.abs(s)+hz*Math.abs(c);
      if (pw>=hd+rw) continue;
      return false;
    }
    return true;
  }
  const N=NX*NZ*NA, seen=new Uint8Array(N), q=new Int32Array(N);
  const id=(i,j,a)=>(i*NZ+j)*NA+a;
  let h=0,t=0;
  // Start: alle freien Lagen mit Mitte z >= 250 (im Gang)
  for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const z=Z0+j*S; if(z<250) continue; for(let a=0;a<NA;a++){const x=X0+i*S; if(free(x,z,a)){const k=id(i,j,a); seen[k]=1; q[t++]=k;}}}
  const tx=-779+1+L/2, tz=-700+d/2+1;
  const ti=Math.round((tx-X0)/S), tj=Math.round((tz-Z0)/S);
  while(h<t){
    const k=q[h++]; const a=k%NA, r=(k-a)/NA, j=r%NZ, i=(r-j)/NZ;
    {const x=X0+i*S, z=Z0+j*S; if ((a<=1||a>=NA-1) && z+d/2 < -300 && x-L/2 < -600) return true;}
    for (const [di,dj,da] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
      const ni=i+di,nj=j+dj; let na=a+da;
      if(ni<0||nj<0||ni>=NX||nj>=NZ) continue;
      if(na<0) na+=NA; if(na>=NA) na-=NA;
      const nk=id(ni,nj,na); if(seen[nk]) continue;
      if(!free(X0+ni*S,Z0+nj*S,na)) continue;
      seen[nk]=1; q[t++]=nk;
    }
  }
  return false;
}
const cases=[['birke cheeks',756,-500,-9],['gon cheeks',493,-400,-272]];
for (const [n,L,cx,rx] of cases) for (const d of [18,30,40,50,60,100,397]) {
  const t0=Date.now(); const ok=solve(L,d,cx,rx); console.log(n,'L',L,'d',d, ok?'erreichbar':'NICHT', (Date.now()-t0)+'ms');
}
