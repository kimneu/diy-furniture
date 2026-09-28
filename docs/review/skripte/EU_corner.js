const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const base = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95 };
const run = o => computeReduit({ ...base, ...o });
const ov = (a, b) => [0,1,2].map(i => (a.size[i]+b.size[i])/2 - Math.abs(a.pos[i]-b.pos[i]));
const overlaps = (a,b) => ov(a,b).every(v => v > 0.001);
const name = b => b.key ? b.key.split('|')[0] + ' ' + b.key.split('|')[5] : b.type;
const rng = b => b.pos.map((c,i)=>[Math.round(c-b.size[i]/2), Math.round(c+b.size[i]/2)]);
for (const shape of ['L','U']) for (const [sys, build] of [['battens','built'],['rails','built'],['brackets','built'],['cheeks','built'],['posts','built'],[null,'free']]) {
  const cfg = { shape, corner:'L', build, ...(sys?{sys}:{}) };
  const R = run(cfg);
  const W=R.W, D=R.D, cx = -W/2 + 300, cz = -D/2 + 400; // inner corner left
  // boxes near inner corner, lowest level only (y around 150)
  const lvl = b => b.pos[1] - b.size[1]/2 <= 170 && b.pos[1] + b.size[1]/2 >= 100;
  const near = [...R.boxes, ...R.extras.filter(e=>e.type==='metal')].filter(b => { const r=rng(b); return r[0][0] <= cx+120 && r[0][1] >= -W/2 && r[2][0] <= cz+120 && r[2][1] >= -D/2 && lvl(b); });
  console.log(`\n== ${shape} ${build} ${sys||''}  corner x=${cx} z=${cz}`);
  for (const b of near) console.log('  ', name(b).padEnd(60), JSON.stringify(rng(b)));
  // wood overlaps anywhere
  const wood = R.boxes;
  const hits = new Map();
  for (let i=0;i<wood.length;i++) for (let j=i+1;j<wood.length;j++) if (overlaps(wood[i],wood[j])) {
    const k = [name(wood[i]).split(' ')[0], name(wood[j]).split(' ')[0]].sort().join(' x ');
    hits.set(k, (hits.get(k)||0)+1);
  }
  console.log('  overlaps:', JSON.stringify([...hits]));
  // metal vs wood overlaps
  const mh = new Map();
  for (const m of R.extras.filter(e=>e.type==='metal')) for (const w of wood) if (overlaps(m,w)) { const k=name(w).split(' ')[0]; mh.set(k,(mh.get(k)||0)+1); }
  console.log('  metal overlaps:', JSON.stringify([...mh]));
  console.log('  warn:', R.warn.length, R.warn.map(w=>w.slice(0,70)));
  console.log('  hw:', R.hw.map(h=>`${h[0]}× ${h[1]} (${h[2]})`).join(' | '));
}
