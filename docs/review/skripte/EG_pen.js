const { mk, inter, f } = require('./EG_lib.js');
const { configs } = require('./EG_configs.js');
const agg = new Map();
let n = 0;
for (const c of configs()) {
  n++;
  const { R, items } = mk(c);
  const W = R.W, D = R.D, H = R.H;
  const sys = c.build === 'free' ? 'free' : c.sys;
  const add = (k, dims, ex) => { const a = agg.get(k) || { n:0, cfgs:new Set(), max:[0,0,0], ex }; a.n++; a.cfgs.add(JSON.stringify(c)); for (let i=0;i<3;i++) a.max[i]=Math.max(a.max[i], dims[i]); agg.set(k, a); };
  for (let i = 0; i < items.length; i++) {
    const A = items[i];
    // room bounds
    const out = [ -W/2 - A.x0, A.x1 - W/2, -A.y0, A.y1 - H, -D/2 - A.z0, A.z1 - D/2 ];
    const lab = ['Wand links','Wand rechts','Boden','Decke','Rückwand','Vorderwand'];
    out.forEach((o, j) => { if (o > 0.5) add(`${sys} | ${A.name} ↔ ${lab[j]}`, [o,0,0], `${JSON.stringify(c)} ${A.name} x ${f(A.x0)}..${f(A.x1)} y ${f(A.y0)}..${f(A.y1)} z ${f(A.z0)}..${f(A.z1)}`); });
    for (let j = i + 1; j < items.length; j++) {
      const B = items[j];
      const d = inter(A, B);
      if (d.every(v => v > 0.5)) {
        const [a, b] = [A.name, B.name].sort();
        add(`${sys} | ${a} ↔ ${b}`, d, `${JSON.stringify(c)} ${A.name}[x ${f(A.x0)}..${f(A.x1)} y ${f(A.y0)}..${f(A.y1)} z ${f(A.z0)}..${f(A.z1)}] ${B.name}[x ${f(B.x0)}..${f(B.x1)} y ${f(B.y0)}..${f(B.y1)} z ${f(B.z0)}..${f(B.z1)}] ov ${d.map(f)}`);
      }
    }
  }
}
console.log('configs', n);
for (const [k, a] of [...agg].sort()) console.log(k.padEnd(60), 'hits', a.n, 'cfgs', a.cfgs.size, 'max ov', a.max.map(f).join('/'), '\n    e.g.', a.ex);
