const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const BASE = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95, shape:'U', sys:'posts', build:'built' };
function bb(b){ const [sx,sy,sz]=b.size,[x,y,z]=b.pos; return {x0:x-sx/2,x1:x+sx/2,y0:y-sy/2,y1:y+sy/2,z0:z-sz/2,z1:z+sz/2}; }
function ov(a,b){ const A=bb(a),B=bb(b); const dx=Math.min(A.x1,B.x1)-Math.max(A.x0,B.x0), dy=Math.min(A.y1,B.y1)-Math.max(A.y0,B.y0), dz=Math.min(A.z1,B.z1)-Math.max(A.z0,B.z0); return (dx>0.5&&dy>0.5&&dz>0.5)?[+dx.toFixed(1),+dy.toFixed(1),+dz.toFixed(1)]:null; }
function nameOf(R,b){ const r=R.rows.find(r=>r.key===b.key); return r? r.name+' | '+r.note : (b.type||'?'); }
function collisions(R, filt){ const all=[...R.boxes.map(b=>({b,n:nameOf(R,b)})), ...R.extras.filter(e=>e.type==='metal').map(b=>({b,n:'Metall'}))]; const out=[]; for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){ const o=ov(all[i].b,all[j].b); if(o && (!filt||filt(all[i].n,all[j].n))) out.push([all[i].n,all[j].n,o, bb(all[i].b), bb(all[j].b)]); } return out; }
module.exports = { K, BASE, bb, ov, nameOf, collisions };
