const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const base = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95, build:'built' };
const run = o => computeReduit({ ...base, ...o });
const lo = (b,i) => b.pos[i]-b.size[i]/2, hi = (b,i) => b.pos[i]+b.size[i]/2;
const ov = (a,b) => [0,1,2].map(i => Math.min(hi(a,i),hi(b,i)) - Math.max(lo(a,i),lo(b,i)));
const hit = (a,b) => ov(a,b).every(v => v > 0.5);
const rng = b => [0,1,2].map(i => `${Math.round(lo(b,i))}..${Math.round(hi(b,i))}`).join(' | ');
const nm = b => (b.key||'METAL').split('|').slice(0,2).join('|') + (b.key? ' ['+b.key.split('|')[5]+']':'');
function overlaps(R, A, B){
  const all = [...R.boxes, ...R.extras.filter(e=>e.type==='metal').map(e=>({...e,key:'METAL|'}))];
  const as = all.filter(b => b.key.startsWith(A)), bs = all.filter(b => b.key.startsWith(B));
  const out=[]; for (const a of as) for (const b of bs) if (a!==b && hit(a,b)) out.push({a,b,o:ov(a,b).map(Math.round)});
  return out;
}
module.exports = { run, base, overlaps, rng, nm, ov, hit, lo, hi };
