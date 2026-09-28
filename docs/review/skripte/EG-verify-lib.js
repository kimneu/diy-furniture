const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const base = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95, shape:'U', sys:'posts', build:'built' };
function run(over){
  const c = { ...base, ...over };
  if (MATS[c.mat] && MATS[c.mat].boards) c.t = MATS[c.mat].tDef;
  const R = computeReduit(c);
  const rk = new Map(R.rows.map(r => [r.key, r]));
  const bx = R.boxes.map(b => { const r = rk.get(b.key); return { name:r.name, note:r.note, ...bb(b), size:b.size }; });
  const mt = R.extras.filter(e => e.type==='metal').map(e => ({ name:'metal', ...bb(e), size:e.size }));
  return { R, c, bx, mt };
}
function bb(b){ return { x0:b.pos[0]-b.size[0]/2, x1:b.pos[0]+b.size[0]/2, y0:b.pos[1]-b.size[1]/2, y1:b.pos[1]+b.size[1]/2, z0:b.pos[2]-b.size[2]/2, z1:b.pos[2]+b.size[2]/2 }; }
const ov=(a0,a1,b0,b1)=>Math.min(a1,b1)-Math.max(a0,b0);
const inter=(a,b)=>[ov(a.x0,a.x1,b.x0,b.x1),ov(a.y0,a.y1,b.y0,b.y1),ov(a.z0,a.z1,b.z0,b.z1)];
const hit=(a,b)=>inter(a,b).every(v=>v>0.01);
const r1=v=>Math.round(v*10)/10;
const s=b=>`${b.name} x${r1(b.x0)}..${r1(b.x1)} y${r1(b.y0)}..${r1(b.y1)} z${r1(b.z0)}..${r1(b.z1)}`;
module.exports={run,bb,ov,inter,hit,r1,s,base,K};
