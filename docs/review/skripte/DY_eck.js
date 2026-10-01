const { K, CFG } = require('./DY_cfg.js');
const R = K.computeData(CFG.RD5);
const bb = b => [0,1,2].map(i => [b.pos[i]-b.size[i]/2, b.pos[i]+b.size[i]/2]);
const ov = (a,b) => bb(a).map((r,i)=>Math.min(r[1],bb(b)[i][1]) - Math.max(r[0],bb(b)[i][0]));
const eck = R.boxes.filter(b=>b.key.startsWith('Eckleiste')), lei = R.boxes.filter(b=>b.key.startsWith('Leiste'));
let n=0, ex=null; for (const e of eck) for (const l of lei) { const o=ov(e,l); if (o.every(x=>x>0.5)) { n++; ex = ex || [o.map(Math.round), l.key.split('|')[5]]; } }
console.log('Eckleiste×Leiste Kollisionen', n, ex);
