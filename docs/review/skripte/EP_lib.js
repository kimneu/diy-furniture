const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const base = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95, shape:'U', build:'built' };
function run(o){ return computeReduit({ ...base, ...o }); }
// box -> world min/max; position relative to left/back wall (x from left wall, z from back wall)
function bb(b, R){ const lo=[], hi=[]; for (let i=0;i<3;i++){ lo[i]=b.pos[i]-b.size[i]/2; hi[i]=b.pos[i]+b.size[i]/2; }
  const off=[R.W/2,0,R.D/2]; return { lo: lo.map((v,i)=>+(v+off[i]).toFixed(1)), hi: hi.map((v,i)=>+(v+off[i]).toFixed(1)) }; }
function nameOf(R, b){ if (!b.key) return b.type||'?'; const k=b.key.split('|'); return k[0]+' '+k[1]+'|'+k[5]; }
function overlaps(R, eps=0.5){
  const all = [...R.boxes.map(b=>({b, n:nameOf(R,b)})), ...R.extras.filter(e=>e.type==='metal').map(b=>({b, n:'metal'}))];
  const out=[];
  for (let i=0;i<all.length;i++) for (let j=i+1;j<all.length;j++){
    const A=bb(all[i].b,R), B=bb(all[j].b,R); let ov=[];
    let ok=true; for (let k=0;k<3;k++){ const o=Math.min(A.hi[k],B.hi[k])-Math.max(A.lo[k],B.lo[k]); if (o<=eps){ok=false;break;} ov.push(+o.toFixed(1)); }
    if (ok) out.push({ a:all[i].n, b:all[j].n, ov, A, B });
  }
  return out;
}
module.exports = { run, bb, nameOf, overlaps, base };
