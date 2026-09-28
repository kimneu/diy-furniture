const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const BASE = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95, shape:'U', sys:'posts', build:'built' };
function R(o){ return computeReduit({ ...BASE, ...o }); }
function bb(b){ return b.size.map((s,i)=>[b.pos[i]-s/2, b.pos[i]+s/2]); }
function name(b){ return b.key ? b.key.split('|')[0] + ' ' + b.key.split('|')[1] + ' (' + b.key.split('|')[5] + ')' : b.type; }
function ov(a,b){ const A=bb(a),B=bb(b); const d=A.map((r,i)=>Math.min(r[1],B[i][1])-Math.max(r[0],B[i][0])); return d.every(x=>x>0.01)?d:null; }
function overlaps(boxes){ const out=[]; for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++){ const d=ov(boxes[i],boxes[j]); if(d) out.push({a:name(boxes[i]),b:name(boxes[j]),d:d.map(x=>+x.toFixed(1)), A:bb(boxes[i]).map(r=>r.map(x=>+x.toFixed(1))), B:bb(boxes[j]).map(r=>r.map(x=>+x.toFixed(1)))}); } return out; }
function fmt(b){ return name(b)+' x '+bb(b).map(r=>r.map(x=>Math.round(x)).join('..')).join(' | '); }
module.exports = { R, BASE, bb, name, ov, overlaps, fmt };
