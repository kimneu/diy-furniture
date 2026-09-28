const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const base = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95, shape:'U', sys:'posts', build:'built' };
function mk(over){
  const c = { ...base, ...over };
  if (MATS[c.mat] && MATS[c.mat].boards) c.t = MATS[c.mat].tDef;
  const R = computeReduit(c);
  const rowByKey = new Map(R.rows.map(r => [r.key, r]));
  const items = R.boxes.map((b, i) => {
    const r = rowByKey.get(b.key);
    return { i, kind:'wood', name: r ? r.name : '?', note: r ? r.note : '', pos: r ? r.pos : '', size:b.size, c:b.pos, ...bb(b) };
  });
  R.extras.filter(e => e.type === 'metal').forEach((e, j) => items.push({ i:'m'+j, kind:'metal', name: e.size[1] > 100 ? 'Schiene/Winkel senkrecht' : 'Konsole/Winkel', size:e.size, c:e.pos, ...bb(e) }));
  return { R, items, c };
}
function bb(b){ return { x0:b.pos[0]-b.size[0]/2, x1:b.pos[0]+b.size[0]/2, y0:b.pos[1]-b.size[1]/2, y1:b.pos[1]+b.size[1]/2, z0:b.pos[2]-b.size[2]/2, z1:b.pos[2]+b.size[2]/2 }; }
const ov = (a0,a1,b0,b1) => Math.min(a1,b1) - Math.max(a0,b0);
function inter(a, b){ return [ov(a.x0,a.x1,b.x0,b.x1), ov(a.y0,a.y1,b.y0,b.y1), ov(a.z0,a.z1,b.z0,b.z1)]; }
const f = v => Math.round(v*10)/10;
module.exports = { mk, inter, ov, f, base, K };
